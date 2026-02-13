const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");
const path = require("path");

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  admin.initializeApp();
}

const db = admin.firestore();

const CREDIT_PACKS = {
  bronze: { id: "bronze", credits: 10, price: 9.9, title: "Pacote Bronze - 10 créditos (PreFlight)" },
  silver: { id: "silver", credits: 30, price: 19.9, title: "Pacote Silver - 30 créditos (PreFlight)" },
  gold: { id: "gold", credits: 50, price: 29.9, title: "Pacote Gold - 50 créditos (PreFlight)" }
};
const DEFAULT_CREDIT_PACK_ID = "bronze";
const BUILD_ID = process.env.RENDER_GIT_COMMIT || process.env.SOURCE_VERSION || "local";
const ADMIN_METRICS_CACHE_TTL_MS = Number(process.env.ADMIN_METRICS_CACHE_TTL_MS || 10 * 60_000);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || (functions.config()?.admin?.emails ?? "") || "jeffersonolspern@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const adminMetricsCache = new Map();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const MP_PUBLIC_KEY = process.env.MP_PUBLIC_KEY;

if (!MP_ACCESS_TOKEN) {
  console.warn("MP_ACCESS_TOKEN not set");
} else {
  mercadopago.configure({ access_token: MP_ACCESS_TOKEN });
}

// ===============================
// ADMIN HELPERS
// ===============================
async function requireAdmin(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "missing_token" });
    return null;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const email = String(decoded.email || "").toLowerCase();
    if (!email || !ADMIN_EMAILS.includes(email)) {
      res.status(403).json({ error: "forbidden" });
      return null;
    }
    return decoded;
  } catch (error) {
    console.error("admin auth error:", error);
    res.status(401).json({ error: "invalid_token" });
    return null;
  }
}

async function requireAuth(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "missing_token" });
    return null;
  }

  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.error("auth error:", error);
    res.status(401).json({ error: "invalid_token" });
    return null;
  }
}

function toIso(value) {
  if (!value) return "";
  if (value.toDate) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  if (value._seconds) return new Date(value._seconds * 1000).toISOString();
  return "";
}

function resolvePackById(rawId) {
  const id = String(rawId || "").trim().toLowerCase();
  return CREDIT_PACKS[id] || CREDIT_PACKS[DEFAULT_CREDIT_PACK_ID];
}

function resolvePackFromPayment(paymentData = {}) {
  const metadata = paymentData?.metadata || {};
  if (metadata.packageId) {
    return resolvePackById(metadata.packageId);
  }

  const itemTitle = String(paymentData?.additional_info?.items?.[0]?.title || paymentData?.description || "");
  const matched = Object.values(CREDIT_PACKS).find((pack) => itemTitle.includes(pack.title));
  if (matched) return matched;

  return CREDIT_PACKS[DEFAULT_CREDIT_PACK_ID];
}

function getRangeStartMs(range = "30d") {
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  if (range === "7d") {
    return now.getTime() - 7 * 24 * 60 * 60 * 1000;
  }
  return now.getTime() - 30 * 24 * 60 * 60 * 1000;
}

// ===============================
// CREATE CHECKOUT PREFERENCE
// ===============================
app.post("/createPreference", async (req, res) => {
  try {
    const { userId, email, packageId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    const selectedPack = resolvePackById(packageId);

    const preference = {
      items: [
        {
          title: selectedPack.title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: selectedPack.price
        }
      ],
      external_reference: userId,
      metadata: {
        userId,
        email: email || "",
        packageId: selectedPack.id,
        packageCredits: selectedPack.credits,
        packagePrice: selectedPack.price,
        packageTitle: selectedPack.title
      },
      notification_url: `${process.env.MP_WEBHOOK_URL || ""}`.trim() || undefined
    };

    const response = await mercadopago.preferences.create(preference);
    return res.json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point,
      public_key: MP_PUBLIC_KEY || "",
      pack: { ...selectedPack, build: BUILD_ID }
    });
  } catch (error) {
    console.error("createPreference error:", error);
    return res.status(500).json({ error: "failed_to_create_preference" });
  }
});

// ===============================
// WEBHOOK
// ===============================
app.post("/mpWebhook", async (req, res) => {
  try {
    const { type, data } = req.body || {};
    console.log("mpWebhook received:", { type, data });
    if (type !== "payment" || !data?.id) {
      return res.status(200).send("ignored");
    }

    if (!MP_ACCESS_TOKEN) {
      return res.status(500).send("no_token");
    }

    const payment = await mercadopago.payment.findById(data.id);
    const p = payment.body;
    if (!p || p.status !== "approved") {
      console.log("mpWebhook not approved:", p?.status, p?.id);
      return res.status(200).send("not_approved");
    }

    const userId = p.metadata?.userId || p.external_reference;
    const selectedPack = resolvePackFromPayment(p);
    if (!userId) {
      console.log("mpWebhook no_user for payment:", p?.id);
      return res.status(200).send("no_user");
    }

    const existing = await db
      .collection("credit_transactions")
      .where("paymentId", "==", p.id)
      .limit(1)
      .get();
    if (!existing.empty) {
      console.log("mpWebhook already processed:", p.id);
      return res.status(200).send("already_processed");
    }

    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    const creditsRef = db.collection("credits").doc(userId);
    const txRef = db.collection("credit_transactions").doc();

    await db.runTransaction(async (tx) => {
      tx.set(
        creditsRef,
        {
          balance: admin.firestore.FieldValue.increment(selectedPack.credits),
          updatedAt: now,
          expiresAt
        },
        { merge: true }
      );

      tx.set(txRef, {
        userId,
        amount: selectedPack.credits,
        type: "purchase",
        paymentId: p.id,
        packageId: selectedPack.id,
        packageTitle: selectedPack.title,
        packagePrice: selectedPack.price,
        createdAt: now,
        expiresAt
      });
    });

    return res.status(200).send("ok");
  } catch (error) {
    console.error("webhook error:", error);
    return res.status(500).send("error");
  }
});

// ===============================
// MANUAL REPROCESS (ADMIN)
// ===============================
app.post("/reprocessPayment", async (req, res) => {
  try {
    const token = process.env.REPROCESS_TOKEN || "";
    const auth = req.headers.authorization || "";
    if (!token || auth !== `Bearer ${token}`) {
      return res.status(403).json({ error: "forbidden" });
    }

    const { paymentId, userId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId required" });
    }
    if (!MP_ACCESS_TOKEN) {
      return res.status(500).json({ error: "no_token" });
    }

    const payment = await mercadopago.payment.findById(paymentId);
    const p = payment.body;
    if (!p || p.status !== "approved") {
      return res.status(400).json({ error: "not_approved" });
    }

    const resolvedUserId = userId || p.metadata?.userId || p.external_reference;
    const selectedPack = resolvePackFromPayment(p);
    if (!resolvedUserId) {
      return res.status(400).json({ error: "no_user" });
    }

    const existing = await db
      .collection("credit_transactions")
      .where("paymentId", "==", p.id)
      .limit(1)
      .get();
    if (!existing.empty) {
      return res.json({ ok: true, alreadyProcessed: true });
    }

    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    const creditsRef = db.collection("credits").doc(resolvedUserId);
    const txRef = db.collection("credit_transactions").doc();

    await db.runTransaction(async (tx) => {
      tx.set(
        creditsRef,
        {
          balance: admin.firestore.FieldValue.increment(selectedPack.credits),
          updatedAt: now,
          expiresAt
        },
        { merge: true }
      );

      tx.set(txRef, {
        userId: resolvedUserId,
        amount: selectedPack.credits,
        type: "reprocess",
        paymentId: p.id,
        packageId: selectedPack.id,
        packageTitle: selectedPack.title,
        packagePrice: selectedPack.price,
        createdAt: now,
        expiresAt
      });
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("reprocess error:", error);
    return res.status(500).json({ error: "error" });
  }
});

// ===============================
// ADMIN - LIST USERS
// ===============================
app.get("/admin/users", async (req, res) => {
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const usersSnap = await db.collection("users").get();
    const creditsSnap = await db.collection("credits").get();
    const creditsMap = new Map(creditsSnap.docs.map((d) => [d.id, d.data()]));

    const users = usersSnap.docs.map((doc) => {
      const data = doc.data() || {};
      const credits = creditsMap.get(doc.id) || {};
      return {
        id: doc.id,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "",
        whatsapp: data.whatsapp || "",
        createdAt: toIso(data.createdAt),
        creditsBalance: Number.isFinite(credits.balance) ? credits.balance : 0
      };
    });

    users.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dbt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dbt - da;
    });

    return res.json({ users });
  } catch (error) {
    console.error("admin users error:", error);
    return res.status(500).json({ error: "admin_users_error" });
  }
});

// ===============================
// ADMIN - SET CREDITS
// ===============================
app.post("/admin/credits", async (req, res) => {
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const { userId, balance } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: "userId_required" });
    }
    const parsed = Number(balance);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return res.status(400).json({ error: "invalid_balance" });
    }

    const safeBalance = Math.floor(parsed);
    const now = admin.firestore.Timestamp.now();
    await db.collection("credits").doc(userId).set(
      {
        balance: safeBalance,
        updatedAt: now
      },
      { merge: true }
    );

    return res.json({ ok: true, balance: safeBalance });
  } catch (error) {
    console.error("admin credits error:", error);
    return res.status(500).json({ error: "admin_credits_error" });
  }
});

// ===============================
// ADMIN - METRICS
// ===============================
app.get("/admin/metrics", async (req, res) => {
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const rawRange = String(req.query?.range || "30d").trim().toLowerCase();
    const range = ["today", "7d", "30d"].includes(rawRange) ? rawRange : "30d";
    const cacheKey = range;
    const nowMs = Date.now();
    const cached = adminMetricsCache.get(cacheKey);
    if (cached && cached.expiresAt > nowMs) {
      return res.json({ metrics: cached.data, cached: true, range, readEstimate: 0 });
    }

    const startMs = getRangeStartMs(range);
    const startTs = admin.firestore.Timestamp.fromDate(new Date(startMs));

    const [usersSnap, evalPeriodSnap, txPeriodSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("evaluations").where("createdAt", ">=", startTs).get(),
      db.collection("credit_transactions").where("createdAt", ">=", startTs).get()
    ]);

    const currentUserIds = new Set(usersSnap.docs.map((d) => d.id));
    let creditsConsumed = 0;
    let creditsPurchased = 0;

    txPeriodSnap.docs.forEach((doc) => {
      const data = doc.data() || {};
      const type = String(data.type || "").toLowerCase();
      const amount = Number.isFinite(Number(data.amount)) ? Math.trunc(Number(data.amount)) : 0;

      if (type === "consume" || amount < 0) {
        creditsConsumed += Math.abs(amount || 1);
      }
      if (type === "purchase" || type === "reprocess" || amount > 0) {
        creditsPurchased += Math.max(0, amount);
      }
    });

    const evalDocs = evalPeriodSnap.docs.map((d) => d.data() || {});

    const evaluationsCompleted = evalDocs.length;

    const metrics = {
      totalUsersCurrent: currentUserIds.size,
      totalUsersHistorical: currentUserIds.size,
      evaluationsCompleted,
      creditsConsumed,
      creditsPurchased
    };
    const readEstimate = Number(usersSnap.size || 0) + Number(evalPeriodSnap.size || 0) + Number(txPeriodSnap.size || 0);

    adminMetricsCache.set(cacheKey, {
      data: metrics,
      expiresAt: nowMs + ADMIN_METRICS_CACHE_TTL_MS
    });

    return res.json({ metrics, cached: false, range, readEstimate });
  } catch (error) {
    console.error("admin metrics error:", error);
    return res.status(500).json({ error: "admin_metrics_error" });
  }
});

// ===============================
// CONSUME CREDITS (USER)
// ===============================
app.post("/consumeCredit", async (req, res) => {
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  try {
    const { mode, requestId } = req.body || {};
    const normalizedMode = String(mode || "").trim().toLowerCase();
    if (!["training", "evaluation"].includes(normalizedMode)) {
      return res.status(400).json({ error: "invalid_mode" });
    }

    const normalizedRequestId = String(requestId || "").trim();
    if (!/^[a-zA-Z0-9_-]{8,120}$/.test(normalizedRequestId)) {
      return res.status(400).json({ error: "invalid_request_id" });
    }

    const userId = authUser.uid;
    const now = admin.firestore.Timestamp.now();
    const creditsRef = db.collection("credits").doc(userId);
    const txRef = db
      .collection("credit_transactions")
      .doc(`consume_${userId}_${normalizedRequestId}`);

    let balanceAfter = 0;
    let alreadyProcessed = false;

    await db.runTransaction(async (tx) => {
      const existingTx = await tx.get(txRef);
      if (existingTx.exists) {
        const existingData = existingTx.data() || {};
        const parsedBalance = Number(existingData.balanceAfter);
        balanceAfter = Number.isFinite(parsedBalance) ? parsedBalance : 0;
        alreadyProcessed = true;
        return;
      }

      const creditsSnap = await tx.get(creditsRef);
      const creditsData = creditsSnap.exists ? creditsSnap.data() : {};
      const parsedBalance = Number(creditsData.balance ?? 0);
      const currentBalance = Number.isFinite(parsedBalance) ? Math.floor(parsedBalance) : 0;

      if (currentBalance <= 0) {
        const err = new Error("insufficient_credits");
        err.code = "insufficient_credits";
        throw err;
      }

      balanceAfter = currentBalance - 1;

      tx.update(creditsRef, {
        balance: admin.firestore.FieldValue.increment(-1),
        updatedAt: now
      });

      tx.set(txRef, {
        userId,
        type: "consume",
        mode: normalizedMode,
        amount: -1,
        requestId: normalizedRequestId,
        balanceBefore: currentBalance,
        balanceAfter,
        createdAt: now
      });
    });

    return res.json({
      ok: true,
      balance: balanceAfter,
      alreadyProcessed
    });
  } catch (error) {
    if (error?.code === "insufficient_credits" || error?.message === "insufficient_credits") {
      return res.status(409).json({
        error: "insufficient_credits",
        message: "Você não possui créditos suficientes."
      });
    }
    console.error("consume credit error:", error);
    return res.status(500).json({ error: "consume_credit_error" });
  }
});

// ===============================
// CREDIT HISTORY (USER)
// ===============================
app.get("/credits/history", async (req, res) => {
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  try {
    const rawPageSize = Number(req.query?.pageSize ?? 8);
    const pageSize = Number.isFinite(rawPageSize)
      ? Math.max(1, Math.min(20, Math.floor(rawPageSize)))
      : 8;
    const rawCursor = String(req.query?.cursor || "").trim();
    const rawOffset = Number(req.query?.offset ?? 0);
    const legacyOffset = Number.isFinite(rawOffset)
      ? Math.max(0, Math.floor(rawOffset))
      : 0;

    const getTimestampMs = (value) => {
      if (!value) return 0;
      if (typeof value.toDate === "function") {
        const dt = value.toDate();
        return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
      }
      if (typeof value === "string" || typeof value === "number") {
        const dt = new Date(value);
        return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
      }
      if (value._seconds) return value._seconds * 1000;
      return 0;
    };

    let queryRef = db
      .collection("credit_transactions")
      .where("userId", "==", authUser.uid)
      .orderBy("createdAt", "desc")
      .limit(pageSize);

    const cursorMs = Number(rawCursor);
    if (rawCursor && Number.isFinite(cursorMs) && cursorMs > 0) {
      queryRef = queryRef.startAfter(admin.firestore.Timestamp.fromMillis(cursorMs));
    } else if (!rawCursor && legacyOffset > 0) {
      // Compatibilidade antiga; manter apenas como fallback.
      queryRef = queryRef.offset(legacyOffset);
    }

    const snap = await queryRef.get();
    const items = snap.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        userId: data.userId || "",
        type: data.type || "",
        mode: data.mode || "",
        amount: Number.isFinite(Number(data.amount)) ? Number(data.amount) : 0,
        paymentId: data.paymentId || "",
        packageId: data.packageId || "",
        packageTitle: data.packageTitle || "",
        packagePrice: Number.isFinite(Number(data.packagePrice)) ? Number(data.packagePrice) : null,
        requestId: data.requestId || "",
        balanceBefore: Number.isFinite(Number(data.balanceBefore)) ? Number(data.balanceBefore) : null,
        balanceAfter: Number.isFinite(Number(data.balanceAfter)) ? Number(data.balanceAfter) : null,
        createdAt: toIso(data.createdAt),
        expiresAt: toIso(data.expiresAt)
      };
    });

    const hasMore = snap.size === pageSize;
    const lastItem = items.length ? items[items.length - 1] : null;
    const nextCursor = hasMore && lastItem?.createdAt
      ? getTimestampMs(lastItem.createdAt)
      : null;

    return res.json({
      items,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error("credit history error:", error);
    return res.status(500).json({ error: "credit_history_error" });
  }
});
exports.api = functions.https.onRequest(app);

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    packs: Object.values(CREDIT_PACKS),
    build: BUILD_ID
  });
});

if (process.env.RENDER || process.env.RUN_LOCAL) {
  const staticRoot = path.resolve(__dirname, "..");
  app.use(express.static(staticRoot));

  app.get("*", (req, res, next) => {
    if (
      req.method !== "GET" ||
      req.path.startsWith("/api") ||
      req.path === "/health"
    ) {
      return next();
    }
    return res.sendFile(path.join(staticRoot, "index.html"));
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
}







