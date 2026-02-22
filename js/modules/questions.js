import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

const QUESTION_BANKS_COLLECTION = "question_banks";
const QUESTIONS_SUBCOLLECTION = "questions";

function toSafeKey(value) {
  return String(value || "").trim();
}

function getQuestionsCollection(bankId) {
  const safeBankId = toSafeKey(bankId);
  return collection(db, QUESTION_BANKS_COLLECTION, safeBankId, QUESTIONS_SUBCOLLECTION);
}

function getQuestionDoc(bankId, questionId) {
  const safeBankId = toSafeKey(bankId);
  const safeQuestionId = toSafeKey(questionId);
  return doc(db, QUESTION_BANKS_COLLECTION, safeBankId, QUESTIONS_SUBCOLLECTION, safeQuestionId);
}

async function getQuestionsByBank(bankId) {
  const ref = getQuestionsCollection(bankId);
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function saveQuestion(bankId, questionId, payload = {}, updatedBy = "") {
  const ref = getQuestionDoc(bankId, questionId);
  await setDoc(
    ref,
    {
      ...payload,
      deleted: false,
      deletedAt: null,
      updatedBy: toSafeKey(updatedBy),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

async function deleteQuestion(bankId, questionId, deletedBy = "") {
  const ref = getQuestionDoc(bankId, questionId);
  await setDoc(
    ref,
    {
      deleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: toSafeKey(deletedBy),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export {
  getQuestionsByBank,
  saveQuestion,
  deleteQuestion
};
