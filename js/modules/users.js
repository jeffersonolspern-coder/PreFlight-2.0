// ===============================
// PERFIL DE USUÁRIO - FIRESTORE
// ===============================

import {
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp
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

export {
  saveUserProfile,
  getUserProfile,
  getAllUsers,
  getAllCredits,
  deleteUserProfile,
  getUserCredits,
  setUserCredits
};
