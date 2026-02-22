// ===============================
// AVALIAÇÕES - FIRESTORE
// ===============================

import {
  collection,
  doc,
  writeBatch,
  increment,
  query,
  where,
  limit,
  getDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

const COLLECTION = "evaluations";
const PROFILE_EVALUATIONS_MAX_ITEMS = 30;

async function saveEvaluation({
  userId,
  simulado,
  percentage,
  correct,
  total,
  status,
  answers,
  hasAnswers,
  answersCount,
  durationSeconds = 0,
  questionBank = "evaluation"
}) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  const safePercentage = Number.isFinite(Number(percentage)) ? Math.max(0, Math.floor(Number(percentage))) : 0;
  const isApproved = normalizedStatus === "aprovado" ? 1 : 0;

  const batch = writeBatch(db);
  const evaluationRef = doc(collection(db, COLLECTION));
  const userRef = doc(db, "users", userId);

  batch.set(evaluationRef, {
    userId,
    simulado,
    percentage,
    correct,
    total,
    status,
    answers: answers || [],
    hasAnswers: !!hasAnswers,
    answersCount: answersCount || 0,
    durationSeconds: Number.isFinite(Number(durationSeconds)) ? Math.max(0, Math.floor(Number(durationSeconds))) : 0,
    questionBank: String(questionBank || "evaluation"),
    createdAt: serverTimestamp()
  });

  // Agregados para evitar leitura de todas as avaliações no perfil.
  batch.set(
    userRef,
    {
      evaluationStatsTotal: increment(1),
      evaluationStatsApproved: increment(isApproved),
      evaluationStatsPercentageSum: increment(safePercentage),
      evaluationStatsUpdatedAt: serverTimestamp()
    },
    { merge: true }
  );

  await batch.commit();
  return evaluationRef;
}

async function getEvaluationsByUser(userId, { maxItems = PROFILE_EVALUATIONS_MAX_ITEMS } = {}) {
  const safeMaxItems = Number.isFinite(Number(maxItems))
    ? Math.max(5, Math.min(100, Math.floor(Number(maxItems))))
    : PROFILE_EVALUATIONS_MAX_ITEMS;
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    limit(safeMaxItems)
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  items.sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dbt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dbt - da;
  });
  return items;
}

async function getEvaluationById(id) {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export {
  saveEvaluation,
  getEvaluationsByUser,
  getEvaluationById
};
