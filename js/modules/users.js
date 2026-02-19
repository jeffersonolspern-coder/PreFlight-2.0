// ===============================
// PERFIL DE USUÁRIO - FIRESTORE
// ===============================

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  documentId,
  increment,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

const GLOBAL_NOTICE_REF = doc(db, "settings", "global_notice");
const SESSION_AVAILABILITY_REF = doc(db, "settings", "session_availability");
const userProfileCache = new Map();
const userCreditsCache = new Map();
let allUsersCache = null;
let allCreditsCache = null;
let globalNoticeCacheLoaded = false;
let globalNoticeCacheValue = null;
let sessionAvailabilityCacheLoaded = false;
let sessionAvailabilityCacheValue = null;
let allCreditTransactionsCache = null;

function clearUserFirestoreCaches(userId = "") {
  const safeUserId = String(userId || "").trim();
  if (safeUserId) {
    userProfileCache.delete(safeUserId);
    userCreditsCache.delete(safeUserId);
    return;
  }

  userProfileCache.clear();
  userCreditsCache.clear();
  allUsersCache = null;
  allCreditsCache = null;
  globalNoticeCacheLoaded = false;
  globalNoticeCacheValue = null;
  sessionAvailabilityCacheLoaded = false;
  sessionAvailabilityCacheValue = null;
  allCreditTransactionsCache = null;
}

function setCachedUserCredits(userId, payload = {}) {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return;

  if (payload && typeof payload === "object" && payload.balance !== undefined) {
    userCreditsCache.set(safeUserId, { ...payload });
    return;
  }

  const parsed = Number(payload);
  const safeBalance = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
  userCreditsCache.set(safeUserId, { balance: safeBalance });
}

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
  userProfileCache.set(String(userId || "").trim(), { ...(userProfileCache.get(String(userId || "").trim()) || {}), ...data });
  allUsersCache = null;
}

async function getUserProfile(userId, { forceRefresh = false } = {}) {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return null;
  if (!forceRefresh && userProfileCache.has(safeUserId)) {
    return userProfileCache.get(safeUserId);
  }

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : null;
  userProfileCache.set(safeUserId, data);
  return data;
}

async function getAllUsers({ forceRefresh = false } = {}) {
  if (!forceRefresh && Array.isArray(allUsersCache)) {
    return allUsersCache;
  }

  const snap = await getDocs(collection(db, "users"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dbt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dbt - da;
  });
  allUsersCache = items;
  return items;
}

async function getUsersPage({ pageSize = 20, cursor = null } = {}) {
  const safePageSize = Number.isFinite(Number(pageSize))
    ? Math.max(5, Math.min(100, Math.floor(Number(pageSize))))
    : 20;

  const constraints = [orderBy(documentId()), limit(safePageSize)];
  if (cursor && typeof cursor === "object" && cursor.lastDoc) {
    constraints.push(startAfter(cursor.lastDoc));
  }

  const q = query(collection(db, "users"), ...constraints);
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
  const hasMore = snap.docs.length === safePageSize;

  return {
    items,
    nextCursor: hasMore && lastDoc ? { lastDoc } : null,
    hasMore
  };
}

async function getAllCredits({ forceRefresh = false } = {}) {
  if (!forceRefresh && Array.isArray(allCreditsCache)) {
    return allCreditsCache;
  }

  const snap = await getDocs(collection(db, "credits"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  allCreditsCache = items;
  return items;
}

async function deleteUserProfile(userId) {
  const ref = doc(db, "users", userId);
  await deleteDoc(ref);
  userProfileCache.delete(String(userId || "").trim());
  allUsersCache = null;
}

async function deleteUserCredits(userId) {
  const ref = doc(db, "credits", userId);
  await deleteDoc(ref);
  userCreditsCache.delete(String(userId || "").trim());
  allCreditsCache = null;
}

async function getUserCredits(userId, { forceRefresh = false } = {}) {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return null;
  if (!forceRefresh && userCreditsCache.has(safeUserId)) {
    return userCreditsCache.get(safeUserId);
  }

  const ref = doc(db, "credits", userId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : null;
  userCreditsCache.set(safeUserId, data);
  return data;
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
  setCachedUserCredits(userId, balance);
  allCreditsCache = null;
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

      tx.update(creditsRef, {
        balance: increment(-1),
        updatedAt: serverTimestamp()
      });

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
      tx.update(creditsRef, {
        balance: increment(-1),
        updatedAt: serverTimestamp()
      });

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

  setCachedUserCredits(userId, result.balance);
  return result;
}

async function getUserCreditTransactionsPage(userId, { pageSize = 8, cursor = null } = {}) {
  const safePageSize = Number.isFinite(Number(pageSize))
    ? Math.max(1, Math.min(20, Math.floor(Number(pageSize))))
    : 8;
  const txCollection = collection(db, "users", userId, "credit_transactions");

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

  try {
    const constraints = [orderBy("createdAt", "desc"), limit(safePageSize)];
    if (cursor && typeof cursor === "object" && cursor.lastDoc) {
      constraints.push(startAfter(cursor.lastDoc));
    }

    const pagedQuery = query(txCollection, ...constraints);
    const snap = await getDocs(pagedQuery);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
    const hasMore = snap.docs.length === safePageSize;

    return {
      items,
      nextCursor: hasMore && lastDoc ? { lastDoc } : null,
      hasMore
    };
  } catch (error) {
    const snap = await getDocs(txCollection);
    const allItems = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));

    const safeOffset = Number.isFinite(Number(cursor))
      ? Math.max(0, Math.floor(Number(cursor)))
      : 0;
    const items = allItems.slice(safeOffset, safeOffset + safePageSize);
    const nextCursor = safeOffset + items.length;
    const hasMore = nextCursor < allItems.length;

    return {
      items,
      nextCursor: hasMore ? nextCursor : null,
      hasMore
    };
  }
}

async function getUserSessionCounts(userId) {
  const snap = await getDocs(collection(db, "users", userId, "credit_transactions"));

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

async function getGlobalNotice({ forceRefresh = false } = {}) {
  if (!forceRefresh && globalNoticeCacheLoaded) {
    return globalNoticeCacheValue;
  }

  const snap = await getDoc(GLOBAL_NOTICE_REF);
  globalNoticeCacheLoaded = true;
  globalNoticeCacheValue = snap.exists() ? snap.data() : null;
  return globalNoticeCacheValue;
}

async function getAllCreditTransactions({ forceRefresh = false } = {}) {
  if (!forceRefresh && Array.isArray(allCreditTransactionsCache)) {
    return allCreditTransactionsCache;
  }

  const snap = await getDocs(collection(db, "credit_transactions"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  allCreditTransactionsCache = items;
  return items;
}

function normalizeSessionAvailabilityConfig(raw = null) {
  const readFlag = (simulado, mode) => {
    const value = raw?.[simulado]?.[mode];
    return typeof value === "boolean" ? value : true;
  };

  const simulados = [
    "sigwx",
    "metar_taf",
    "notam",
    "rotaer",
    "nuvens",
    "sinais_luminosos",
    "espacos_aereos"
  ];

  return simulados.reduce((acc, simulado) => {
    acc[simulado] = {
      enabled: readFlag(simulado, "enabled"),
      training: readFlag(simulado, "training"),
      evaluation: readFlag(simulado, "evaluation")
    };
    return acc;
  }, {});
}

async function getSessionAvailability({ forceRefresh = false } = {}) {
  if (!forceRefresh && sessionAvailabilityCacheLoaded) {
    return sessionAvailabilityCacheValue;
  }

  const snap = await getDoc(SESSION_AVAILABILITY_REF);
  const raw = snap.exists() ? snap.data() : null;
  sessionAvailabilityCacheLoaded = true;
  sessionAvailabilityCacheValue = normalizeSessionAvailabilityConfig(raw);
  return sessionAvailabilityCacheValue;
}

async function setSessionAvailability(config = {}, updatedBy = "") {
  const normalized = normalizeSessionAvailabilityConfig(config);
  await setDoc(
    SESSION_AVAILABILITY_REF,
    {
      ...normalized,
      updatedBy: String(updatedBy || "").trim(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
  sessionAvailabilityCacheLoaded = true;
  sessionAvailabilityCacheValue = normalized;
}

async function setGlobalNotice(message, updatedBy = "") {
  const text = String(message || "").trim();
  await setDoc(
    GLOBAL_NOTICE_REF,
    {
      message: text,
      updatedBy: String(updatedBy || "").trim(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
  globalNoticeCacheLoaded = true;
  globalNoticeCacheValue = { message: text, updatedBy: String(updatedBy || "").trim() };
}

export {
  saveUserProfile,
  getUserProfile,
  getAllUsers,
  getUsersPage,
  getAllCredits,
  deleteUserProfile,
  deleteUserCredits,
  getUserCredits,
  setUserCredits,
  recordConsumeCreditTransaction,
  consumeUserCredit,
  getUserCreditTransactionsPage,
  getUserSessionCounts,
  getGlobalNotice,
  getSessionAvailability,
  setGlobalNotice,
  setSessionAvailability,
  getAllCreditTransactions,
  setCachedUserCredits,
  clearUserFirestoreCaches
};
