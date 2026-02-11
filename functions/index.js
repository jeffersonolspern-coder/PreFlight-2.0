const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  admin.initializeApp();
}

const db = admin.firestore();

const CREDIT_PACK_SIZE = 10;
const CREDIT_PACK_PRICE = 5;
const CREDIT_PACK_TITLE = "Pacote 10 créditos (PreFlight)";
const BUILD_ID = process.env.RENDER_GIT_COMMIT || process.env.SOURCE_VERSION || "local";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || (functions.config()?.admin?.emails ?? "") || "jeffersonolspern@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

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

// ===============================
// CREATE CHECKOUT PREFERENCE
// ===============================
app.post("/createPreference", async (req, res) => {
  try {
    const { userId, email } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const preference = {
      items: [
        {
          title: CREDIT_PACK_TITLE,
          quantity: 1,
          currency_id: "BRL",
          unit_price: CREDIT_PACK_PRICE
        }
      ],
      external_reference: userId,
      metadata: {
        userId,
        email: email || ""
      },
      notification_url: `${process.env.MP_WEBHOOK_URL || ""}`.trim() || undefined
    };

    const response = await mercadopago.preferences.create(preference);
    return res.json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point,
      public_key: MP_PUBLIC_KEY || "",
      pack: {
        size: CREDIT_PACK_SIZE,
        price: CREDIT_PACK_PRICE,
        title: CREDIT_PACK_TITLE,
        build: BUILD_ID
      }
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
      const snap = await tx.get(creditsRef);
      const current = snap.exists ? snap.data() : { balance: 0 };
      const nextBalance = (current.balance || 0) + CREDIT_PACK_SIZE;

      tx.set(
        creditsRef,
        {
          balance: nextBalance,
          updatedAt: now,
          expiresAt
        },
        { merge: true }
      );

      tx.set(txRef, {
        userId,
        amount: CREDIT_PACK_SIZE,
        type: "purchase",
        paymentId: p.id,
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
      const snap = await tx.get(creditsRef);
      const current = snap.exists ? snap.data() : { balance: 0 };
      const nextBalance = (current.balance || 0) + CREDIT_PACK_SIZE;

      tx.set(
        creditsRef,
        {
          balance: nextBalance,
          updatedAt: now,
          expiresAt
        },
        { merge: true }
      );

      tx.set(txRef, {
        userId: resolvedUserId,
        amount: CREDIT_PACK_SIZE,
        type: "reprocess",
        paymentId: p.id,
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

      tx.set(
        creditsRef,
        {
          balance: balanceAfter,
          updatedAt: now
        },
        { merge: true }
      );

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
    const rawOffset = Number(req.query?.offset ?? 0);
    const pageSize = Number.isFinite(rawPageSize)
      ? Math.max(1, Math.min(20, Math.floor(rawPageSize)))
      : 8;
    const offset = Number.isFinite(rawOffset)
      ? Math.max(0, Math.floor(rawOffset))
      : 0;

    const snap = await db
      .collection("credit_transactions")
      .where("userId", "==", authUser.uid)
      .get();

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

    const allItems = snap.docs
      .map((doc) => {
        const data = doc.data() || {};
        return {
          id: doc.id,
          userId: data.userId || "",
          type: data.type || "",
          mode: data.mode || "",
          amount: Number.isFinite(Number(data.amount)) ? Number(data.amount) : 0,
          paymentId: data.paymentId || "",
          requestId: data.requestId || "",
          balanceBefore: Number.isFinite(Number(data.balanceBefore)) ? Number(data.balanceBefore) : null,
          balanceAfter: Number.isFinite(Number(data.balanceAfter)) ? Number(data.balanceAfter) : null,
          createdAt: toIso(data.createdAt),
          expiresAt: toIso(data.expiresAt)
        };
      })
      .sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));

    const items = allItems.slice(offset, offset + pageSize);
    const nextOffset = offset + items.length;
    const hasMore = nextOffset < allItems.length;

    return res.json({
      items,
      nextCursor: hasMore ? nextOffset : null,
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
    pack: {
      size: CREDIT_PACK_SIZE,
      price: CREDIT_PACK_PRICE,
      title: CREDIT_PACK_TITLE
    },
    build: BUILD_ID
  });
});

if (process.env.RENDER || process.env.RUN_LOCAL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
}







