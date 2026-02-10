// ===============================
// AUTH - CONTROLE DE AUTENTICAÇÃO
// ===============================

import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===============================
// ESTADO GLOBAL DO USUÁRIO
// ===============================
let currentUser = null;

// ===============================
// LOGIN
// ===============================
function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ===============================
// CADASTRO
// ===============================
async function register(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  return cred;
}

// ===============================
// LOGOUT
// ===============================
function logout() {
  return signOut(auth);
}

// ===============================
// EXCLUIR CONTA
// ===============================
function deleteAccount() {
  if (!auth.currentUser) return Promise.reject(new Error("No user"));
  return deleteUser(auth.currentUser);
}

// ===============================
// LISTENER DE SESSÃO
// ===============================
function observeAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user ? user : null;
    callback(currentUser);
  });
}

// ===============================
// EXPORTAÇÕES
// ===============================
export {
  login,
  register,
  logout,
  deleteAccount,
  observeAuthState,
  currentUser
};
