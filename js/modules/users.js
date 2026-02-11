// ===============================
// PERFIL DE USUÁRIO - FIRESTORE
// ===============================

import {
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  getDocsFromServer,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

async function saveUserProfile(userId, data) {
  const ref = doc(db, "users", userId);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

async function getUserProfile(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dbt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dbt - da;
  });
  return items;
}

async function getAllCredits() {
  const snap = await getDocs(collection(db, "credits"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function deleteUserProfile(userId) {
  const ref = doc(db, "users", userId);
  await deleteDoc(ref);
}

async function getUserCredits(userId) {
  const ref = doc(db, "credits", userId);
  let snap;
  try {
    snap = await getDocFromServer(ref);
  } catch (error) {
    snap = await getDoc(ref);
  }
  return snap.exists() ? snap.data() : null;
}

async function setUserCredits(userId, balance) {
  const ref = doc(db, "credits", userId);
  await setDoc(
    ref,
    {
      balance,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

function buildUserConsumeTransactionRef(userId, requestId) {
  return doc(db, "users", userId, "credit_transactions", `consume_${userId}_${requestId}`);
}

async function recordConsumeCreditTransaction(
  userId,
  {
    mode = "training",
    requestId = "",
    balanceBefore = null,
    balanceAfter = 0
  } = {}
) {
  const normalizedMode = String(mode || "").trim().toLowerCase();
  const normalizedRequestId = String(requestId || `fallback_${Date.now()}`).trim();
  const parsedAfter = Number(balanceAfter);
  const safeAfter = Number.isFinite(parsedAfter) ? Math.max(0, Math.floor(parsedAfter)) : 0;
  const parsedBefore = Number(balanceBefore);
  const safeBefore = Number.isFinite(parsedBefore) ? Math.max(0, Math.floor(parsedBefore)) : safeAfter + 1;
  const txRef = buildUserConsumeTransactionRef(userId, normalizedRequestId);

  await setDoc(
    txRef,
    {
      userId,
      type: "consume",
      mode: normalizedMode,
      amount: -1,
      requestId: normalizedRequestId,
      balanceBefore: safeBefore,
      balanceAfter: safeAfter,
      createdAt: serverTimestamp()
    },
    { merge: false }
  );
}

async function consumeUserCredit(userId, mode = "training", requestId = "") {
  const normalizedMode = String(mode || "").trim().toLowerCase();
  const normalizedRequestId = String(requestId || `fallback_${Date.now()}`).trim();
  const creditsRef = doc(db, "credits", userId);
  const txRef = buildUserConsumeTransactionRef(userId, normalizedRequestId);

  let result = { balance: 0, alreadyProcessed: false };

  try {
    await runTransaction(db, async (tx) => {
      const existingTx = await tx.get(txRef);
      if (existingTx.exists()) {
        const existingData = existingTx.data() || {};
        const parsedBalance = Number(existingData.balanceAfter);
        result = {
          balance: Number.isFinite(parsedBalance) ? Math.max(0, Math.floor(parsedBalance)) : 0,
          alreadyProcessed: true
        };
        return;
      }

      const creditsSnap = await tx.get(creditsRef);
      const creditsData = creditsSnap.exists() ? creditsSnap.data() : {};
      const parsedBalance = Number(creditsData.balance ?? 0);
      const currentBalance = Number.isFinite(parsedBalance) ? Math.max(0, Math.floor(parsedBalance)) : 0;

      if (currentBalance <= 0) {
        const error = new Error("insufficient_credits");
        error.code = "insufficient_credits";
        throw error;
      }

      const balanceAfter = currentBalance - 1;

      tx.set(
        creditsRef,
        {
          balance: balanceAfter,
          updatedAt: serverTimestamp()
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
        createdAt: serverTimestamp()
      });

      result = {
        balance: balanceAfter,
        alreadyProcessed: false
      };
    });
  } catch (error) {
    if (error?.code === "insufficient_credits" || error?.message === "insufficient_credits") {
      throw error;
    }
    if (error?.code !== "permission-denied") {
      throw error;
    }

    await runTransaction(db, async (tx) => {
      const existingTx = await tx.get(txRef);
      if (existingTx.exists()) {
        const existingData = existingTx.data() || {};
        const parsedBalance = Number(existingData.balanceAfter);
        result = {
          balance: Number.isFinite(parsedBalance) ? Math.max(0, Math.floor(parsedBalance)) : 0,
          alreadyProcessed: true
        };
        return;
      }

      const creditsSnap = await tx.get(creditsRef);
      const creditsData = creditsSnap.exists() ? creditsSnap.data() : {};
      const parsedBalance = Number(creditsData.balance ?? 0);
      const currentBalance = Number.isFinite(parsedBalance) ? Math.max(0, Math.floor(parsedBalance)) : 0;

      if (currentBalance <= 0) {
        const err = new Error("insufficient_credits");
        err.code = "insufficient_credits";
        throw err;
      }

      const balanceAfter = currentBalance - 1;
      tx.set(
        creditsRef,
        {
          balance: balanceAfter,
          updatedAt: serverTimestamp()
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
        createdAt: serverTimestamp()
      });

      result = {
        balance: balanceAfter,
        alreadyProcessed: false
      };
    });
  }

  return result;
}

async function getUserCreditTransactionsPage(userId, { pageSize = 8, cursor = null } = {}) {
  const safePageSize = Number.isFinite(Number(pageSize))
    ? Math.max(1, Math.min(20, Math.floor(Number(pageSize))))
    : 8;
  const safeOffset = Number.isFinite(Number(cursor))
    ? Math.max(0, Math.floor(Number(cursor)))
    : 0;

  let snap;
  try {
    snap = await getDocsFromServer(collection(db, "users", userId, "credit_transactions"));
  } catch (error) {
    snap = await getDocs(collection(db, "users", userId, "credit_transactions"));
  }

  const getTimestampMs = (value) => {
    if (!value) return 0;
    if (typeof value?.toDate === "function") {
      const dt = value.toDate();
      return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
    }
    if (typeof value?.seconds === "number") {
      return value.seconds * 1000;
    }
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
  };

  const allItems = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));

  const items = allItems.slice(safeOffset, safeOffset + safePageSize);
  const nextCursor = safeOffset + items.length;
  const hasMore = nextCursor < allItems.length;

  return {
    items,
    nextCursor: hasMore ? nextCursor : null,
    hasMore
  };
}

async function getUserSessionCounts(userId) {
  let snap;
  try {
    snap = await getDocsFromServer(collection(db, "users", userId, "credit_transactions"));
  } catch (error) {
    snap = await getDocs(collection(db, "users", userId, "credit_transactions"));
  }

  let trainingCount = 0;
  let evaluationCount = 0;

  snap.docs.forEach((d) => {
    const data = d.data() || {};
    if (String(data.type || "").toLowerCase() !== "consume") return;

    const mode = String(data.mode || "").toLowerCase();
    if (mode === "training") trainingCount += 1;
    if (mode === "evaluation") evaluationCount += 1;
  });

  return { trainingCount, evaluationCount };
}

export {
  saveUserProfile,
  getUserProfile,
  getAllUsers,
  getAllCredits,
  deleteUserProfile,
  getUserCredits,
  setUserCredits,
  recordConsumeCreditTransaction,
  consumeUserCredit,
  getUserCreditTransactionsPage,
  getUserSessionCounts
};
