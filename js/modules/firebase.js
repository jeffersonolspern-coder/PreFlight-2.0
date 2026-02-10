// ===============================
// FIREBASE - CONFIGURAÇÃO
// ===============================

// Importações do Firebase (SDK modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDSuPgqaCWyis8koGRns7QBTlCSssko6BM",
  authDomain: "preflightsimulados.firebaseapp.com",
  projectId: "preflightsimulados",
  storageBucket: "preflightsimulados.firebasestorage.app",
  messagingSenderId: "808505460951",
  appId: "1:808505460951:web:ceb2d5d34f3f97aa4d4892"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Authentication
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta para uso no app
export { auth, db };
