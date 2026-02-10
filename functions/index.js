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
          title: "Pacote 30 créditos (PreFlight)",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 19.9
        }
      ],
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
      public_key: MP_PUBLIC_KEY || ""
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
    if (type !== "payment" || !data?.id) {
      return res.status(200).send("ignored");
    }

    if (!MP_ACCESS_TOKEN) {
      return res.status(500).send("no_token");
    }

    const payment = await mercadopago.payment.findById(data.id);
    const p = payment.body;
    if (!p || p.status !== "approved") {
      return res.status(200).send("not_approved");
    }

    const userId = p.metadata?.userId;
    if (!userId) {
      return res.status(200).send("no_user");
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
      const nextBalance = (current.balance || 0) + 30;

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
        amount: 30,
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

exports.api = functions.https.onRequest(app);

if (process.env.RENDER || process.env.RUN_LOCAL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
}
