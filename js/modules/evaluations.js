// ===============================
// AVALIAÇÕES - FIRESTORE
// ===============================

import {
  collection,
  addDoc,
  doc,
  query,
  where,
  getDoc,
  getDocs,
  getDocsFromServer,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

const COLLECTION = "evaluations";

async function saveEvaluation({
  userId,
  simulado,
  percentage,
  correct,
  total,
  status,
  answers,
  hasAnswers,
  answersCount
}) {
  return addDoc(collection(db, COLLECTION), {
    userId,
    simulado,
    percentage,
    correct,
    total,
    status,
    answers: answers || [],
    hasAnswers: !!hasAnswers,
    answersCount: answersCount || 0,
    createdAt: serverTimestamp()
  });
}

async function getEvaluationsByUser(userId) {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId)
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

async function deleteEvaluationsByUser(userId) {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  const snap = await getDocs(q);
  const deletions = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletions);
}

async function getAllEvaluations() {
  let snap;
  try {
    snap = await getDocsFromServer(collection(db, COLLECTION));
  } catch (error) {
    snap = await getDocs(collection(db, COLLECTION));
  }

  const items = snap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
  items.sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dbt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dbt - da;
  });
  return items;
}

export {
  saveEvaluation,
  getEvaluationsByUser,
  getEvaluationById,
  deleteEvaluationsByUser,
  getAllEvaluations
};
