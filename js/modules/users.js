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
  query,
  where,
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

async function consumeUserCredit(userId, mode = "training", requestId = "") {
  const normalizedMode = String(mode || "").trim().toLowerCase();
  const normalizedRequestId = String(requestId || `fallback_${Date.now()}`).trim();
  const creditsRef = doc(db, "credits", userId);
  const txRef = doc(db, "credit_transactions", `consume_${userId}_${normalizedRequestId}`);

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

  const txQuery = query(
    collection(db, "credit_transactions"),
    where("userId", "==", userId)
  );

  let snap;
  try {
    snap = await getDocsFromServer(txQuery);
  } catch (error) {
    snap = await getDocs(txQuery);
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

export {
  saveUserProfile,
  getUserProfile,
  getAllUsers,
  getAllCredits,
  deleteUserProfile,
  getUserCredits,
  setUserCredits,
  consumeUserCredit,
  getUserCreditTransactionsPage
};
