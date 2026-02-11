// ===============================
// APP PRINCIPAL (SPA)
// ===============================

import {
  homePublicView,
  loginView,
  registerView,
  dashboardView,
  sigwxView,
  sigwxEvaluationView,
  sigwxEvaluationResultView,
  profileView,
  profileEvaluationView,
  adminView,
  creditsView,
  contactView,
  privacyView,
  cookiesView
} from "./views/views.js";

import {
  login,
  register,
  logout,
  deleteAccount,
  observeAuthState
} from "./modules/auth.js";

import {
  saveEvaluation,
  getEvaluationsByUser,
  getEvaluationById,
  deleteEvaluationsByUser
} from "./modules/evaluations.js";

import {
  saveUserProfile,
  getUserProfile,
  getAllUsers,
  deleteUserProfile,
  getUserCredits,
  setUserCredits,
  consumeUserCredit,
  getUserCreditTransactionsPage
} from "./modules/users.js";
import { startSigwxSimulado } from "./simulados/sigwx/simulado.js";
import { sigwxQuestions } from "./simulados/sigwx/data.js";

import "./simulados/sigwx/painel.js";

const app = document.getElementById("app");

const FUNCTIONS_BASE_URL =
  window.PREFLIGHT_FUNCTIONS_URL ||
  "https://us-central1-preflightsimulados.cloudfunctions.net/api";
const USE_MP_SANDBOX = window.PREFLIGHT_MP_SANDBOX === true;
const IS_LOCAL_DEV_HOST =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost";
const LOCAL_CREDITS_KEY_PREFIX = "preflight_local_credits_";
const CREDITS_HISTORY_PAGE_SIZE = 8;

// ===============================
// EMAILJS (CONFIG)
// ===============================
const EMAILJS_SERVICE_ID = "service_lc22ui4";
const EMAILJS_TEMPLATE_ID = "template_42ki2sw";
const ADMIN_EMAIL = "jeffersonolspern@gmail.com";

// ===============================
// ESTADO GLOBAL
// ===============================
let currentUser = null;
let currentProfile = null;
let evaluationStartAtMs = null;
let evaluationTotalSeconds = 15 * 60;
let evaluationRemainingSeconds = 15 * 60;
let adminUsersCache = [];
let adminNormalizedOnce = false;
let currentCredits = null;
let creditHistoryItems = [];
let creditHistoryCursor = null;
let creditHistoryHasMore = false;
let creditHistoryLoading = false;
let creditHistoryLoadingMore = false;
let creditHistoryError = "";
let creditsPolling = null;
let creditsPollingStart = null;
let startingSessionLock = false;
const INSUFFICIENT_CREDITS_MESSAGE = "Você não possui créditos suficientes.";
let userMenuDocumentClickHandler = null;
let userMenuDocumentKeydownHandler = null;
let apiWarmupDone = false;

function normalizeApiBase(baseUrl) {
  return String(baseUrl || "").replace(/\/+$/, "");
}

function buildApiUrl(path, useAlternate = false) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const base = normalizeApiBase(FUNCTIONS_BASE_URL);

  if (!useAlternate) {
    return `${base}${safePath}`;
  }

  if (base.endsWith("/api")) {
    return `${base.slice(0, -4)}${safePath}`;
  }
  return `${base}/api${safePath}`;
}

async function fetchApiWithPathFallback(path, options = {}) {
  let response = await fetch(buildApiUrl(path, false), options);
  if (response.status !== 404) return response;
  response = await fetch(buildApiUrl(path, true), options);
  return response;
}

function warmupApi() {
  if (apiWarmupDone) return;
  apiWarmupDone = true;
  fetchApiWithPathFallback("/health", { method: "GET", cache: "no-store" }).catch(() => {
    // no-op: warmup is best-effort
  });
}

function showToast(message, type = "info") {
  if (!message) return;
  const existing = document.getElementById("appToast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "appToast";
  toast.className = `app-toast app-toast--${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerText = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("is-visible"));

  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function getFirebaseAuthMessage(error, fallback = "Não foi possível concluir a ação.") {
  const code = String(error?.code || "").toLowerCase();
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "Email ou senha inválidos.";
  }
  if (code.includes("invalid-email")) {
    return "Email inválido.";
  }
  if (code.includes("too-many-requests")) {
    return "Muitas tentativas. Tente novamente em alguns minutos.";
  }
  if (code.includes("user-disabled")) {
    return "Esta conta foi desativada.";
  }
  if (code.includes("email-already-in-use")) {
    return "Este email já está em uso.";
  }
  if (code.includes("weak-password")) {
    return "A senha é fraca. Use pelo menos 6 caracteres.";
  }
  return fallback;
}

function isAdminUser() {
  return !!currentUser && currentUser.email === ADMIN_EMAIL;
}

function getUserLabel() {
  if (currentProfile?.name) return currentProfile.name;
  if (currentUser?.displayName) return currentUser.displayName;
  if (currentProfile?.role) return currentProfile.role;
  if (currentUser?.email) return currentUser.email.split("@")[0];
  return "Conta";
}

function getCreditsLabel() {
  if (!currentUser) return null;
  const balance = getCreditsBalanceValue();
  return balance === null ? 0 : balance;
}

function updateVisibleCreditsLabel() {
  const creditsLink = document.getElementById("goCredits");
  if (!creditsLink || !currentUser) return;
  const balance = getCreditsLabel();
  creditsLink.textContent = `Créditos: ${balance ?? 0}`;
}

function parseCreditsBalance(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.floor(parsed));
}

function parseCreditHistoryDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") {
    const dt = value.toDate();
    return Number.isNaN(dt?.getTime?.()) ? null : dt;
  }
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatCreditHistoryItem(item) {
  const amount = Number(item?.amount);
  const safeAmount = Number.isFinite(amount) ? Math.trunc(amount) : 0;
  const type = String(item?.type || "").toLowerCase();
  const mode = String(item?.mode || "").toLowerCase();
  const date = parseCreditHistoryDate(item?.createdAt);

  let description = "Movimentação de créditos";
  let statusLabel = "Concluído";
  if (type === "purchase") {
    description = "Compra de pacote";
    statusLabel = "Aprovado";
  } else if (type === "reprocess") {
    description = "Compra reprocessada";
    statusLabel = "Aprovado";
  } else if (type === "consume") {
    description = mode === "evaluation" ? "Uso em avaliação" : "Uso em treinamento";
    statusLabel = "Consumido";
  }

  let amountClass = "is-neutral";
  if (safeAmount > 0) amountClass = "is-positive";
  if (safeAmount < 0) amountClass = "is-negative";

  return {
    id: item?.id || "",
    dateLabel: date ? date.toLocaleString("pt-BR") : "&mdash;",
    description,
    amountLabel: safeAmount > 0 ? `+${safeAmount}` : `${safeAmount}`,
    amountClass,
    statusLabel
  };
}

function getLocalCreditsKey(userId) {
  return `${LOCAL_CREDITS_KEY_PREFIX}${userId}`;
}

function readLocalCreditsState(userId) {
  if (!IS_LOCAL_DEV_HOST || !userId) return null;
  try {
    const raw = localStorage.getItem(getLocalCreditsKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const balance = parseCreditsBalance(parsed?.balance);
    const serverBaseline = parseCreditsBalance(parsed?.serverBaseline);
    if (balance === null && serverBaseline === null) return null;
    return {
      balance: balance ?? 0,
      serverBaseline: serverBaseline ?? (balance ?? 0)
    };
  } catch (error) {
    return null;
  }
}

function writeLocalCreditsState(userId, state) {
  if (!IS_LOCAL_DEV_HOST || !userId) return;
  const balance = parseCreditsBalance(state?.balance);
  const baseline = parseCreditsBalance(state?.serverBaseline);
  if (balance === null || baseline === null) return;
  try {
    localStorage.setItem(
      getLocalCreditsKey(userId),
      JSON.stringify({ balance, serverBaseline: baseline })
    );
  } catch (error) {
    // no-op
  }
}

function readLocalCreditsBalance(userId) {
  const state = readLocalCreditsState(userId);
  return state ? state.balance : null;
}

function writeLocalCreditsBalance(userId, balance, syncServer = false) {
  if (!IS_LOCAL_DEV_HOST || !userId) return;
  const parsed = parseCreditsBalance(balance);
  if (parsed === null) return;
  const prev = readLocalCreditsState(userId);
  const next = {
    balance: parsed,
    serverBaseline: syncServer
      ? parsed
      : parseCreditsBalance(prev?.serverBaseline) ?? parsed
  };
  writeLocalCreditsState(userId, next);
}

function applyLocalCreditsBalance(credits, preferServer = true) {
  const serverBalance = parseCreditsBalance(credits?.balance);
  if (!currentUser) {
    return { ...(credits || {}), balance: serverBalance ?? 0 };
  }

  if (!IS_LOCAL_DEV_HOST) {
    return { ...(credits || {}), balance: serverBalance ?? 0 };
  }

  const localState = readLocalCreditsState(currentUser.uid);
  if (preferServer && serverBalance !== null) {
    if (!localState) {
      writeLocalCreditsState(currentUser.uid, {
        balance: serverBalance,
        serverBaseline: serverBalance
      });
      return { ...(credits || {}), balance: serverBalance };
    }

    const prevBalance = parseCreditsBalance(localState.balance) ?? 0;
    const prevBaseline = parseCreditsBalance(localState.serverBaseline) ?? serverBalance;
    const delta = serverBalance - prevBaseline;
    const mergedBalance = Math.max(0, prevBalance + delta);

    writeLocalCreditsState(currentUser.uid, {
      balance: mergedBalance,
      serverBaseline: serverBalance
    });
    return { ...(credits || {}), balance: mergedBalance };
  }

  if (localState) {
    return { ...(credits || {}), balance: localState.balance };
  }

  const fallback = serverBalance ?? 0;
  writeLocalCreditsState(currentUser.uid, {
    balance: fallback,
    serverBaseline: serverBalance ?? fallback
  });
  return { ...(credits || {}), balance: fallback };
}

function getEffectiveBalanceForUser(userId, rawServerBalance) {
  const serverBalance = parseCreditsBalance(rawServerBalance) ?? 0;
  if (!IS_LOCAL_DEV_HOST || !userId) return serverBalance;

  const localState = readLocalCreditsState(userId);
  if (!localState) return serverBalance;

  const prevBalance = parseCreditsBalance(localState.balance) ?? 0;
  const prevBaseline = parseCreditsBalance(localState.serverBaseline) ?? serverBalance;
  const delta = serverBalance - prevBaseline;
  const mergedBalance = Math.max(0, prevBalance + delta);

  writeLocalCreditsState(userId, {
    balance: mergedBalance,
    serverBaseline: serverBalance
  });

  return mergedBalance;
}

function getCreditsBalanceValue(source = currentCredits) {
  if (!source || source.balance === undefined || source.balance === null) {
    return null;
  }
  return parseCreditsBalance(source.balance);
}

function canStartSessionByLocalCredits() {
  const balance = getCreditsBalanceValue();
  if (balance === null) return true;
  return balance > 0;
}

function setDashboardStartButtonsDisabled(disabled) {
  document
    .querySelectorAll('[data-action="sigwx"], [data-action="sigwx-eval"]')
    .forEach((button) => {
      button.disabled = !!disabled;
      button.setAttribute("aria-disabled", disabled ? "true" : "false");
    });
}

async function refreshCurrentUserCredits() {
  if (!currentUser) return null;
  try {
    const credits = await getUserCredits(currentUser.uid);
    currentCredits = applyLocalCreditsBalance(credits || { balance: 0 }, true);
    return getCreditsBalanceValue(currentCredits);
  } catch (error) {
    currentCredits = applyLocalCreditsBalance(currentCredits || { balance: 0 }, false);
    return getCreditsBalanceValue(currentCredits);
  }
}

function createCreditRequestId(mode) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${mode}_${Date.now()}_${randomPart}`;
}

async function consumeStartCredit(mode) {
  if (!currentUser) {
    throw new Error("auth_required");
  }

  const latestBalance = await refreshCurrentUserCredits();
  if (latestBalance !== null && latestBalance <= 0) {
    const error = new Error("insufficient_credits");
    error.code = "insufficient_credits";
    throw error;
  }

  const requestId = createCreditRequestId(mode);

  try {
    const token = await currentUser.getIdToken();
    const response = await fetchApiWithPathFallback("/consumeCredit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        mode,
        requestId
      })
    });

    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      const code = data?.error || "consume_credit_error";
      if (response.status === 409 || code === "insufficient_credits") {
        const error = new Error("insufficient_credits");
        error.code = "insufficient_credits";
        throw error;
      }
      const error = new Error(code);
      error.code = code;
      throw error;
    }

    const parsedBalance = Number(data?.balance);
    const safeBalance = Number.isFinite(parsedBalance) ? Math.max(0, Math.floor(parsedBalance)) : 0;
    currentCredits = {
      ...(currentCredits || {}),
      balance: safeBalance
    };
    writeLocalCreditsBalance(currentUser.uid, safeBalance, true);
    updateVisibleCreditsLabel();

    return safeBalance;
  } catch (error) {
    if (error?.code === "insufficient_credits" || error?.message === "insufficient_credits") {
      throw error;
    }

    const fallback = await consumeUserCredit(currentUser.uid, mode, requestId);
    const fallbackBalance = Number(fallback?.balance);
    const safeBalance = Number.isFinite(fallbackBalance) ? Math.max(0, Math.floor(fallbackBalance)) : 0;
    currentCredits = {
      ...(currentCredits || {}),
      balance: safeBalance
    };
    writeLocalCreditsBalance(currentUser.uid, safeBalance, true);
    updateVisibleCreditsLabel();
    return safeBalance;
  }
}

async function startSigwxWithCredit(mode) {
  if (!currentUser) {
    renderLogin();
    return;
  }
  if (mode === "evaluation") {
    renderSigwxEvaluation();
    return;
  }
  renderSigwx();
}

function setupTrainingStartModal({ onStart } = {}) {
  const modalEl = document.getElementById("trainingModal");
  const startBtn = document.getElementById("trainingOk");
  const cancelBtn = document.getElementById("trainingCancel");
  if (!modalEl || !startBtn) return;
  const defaultStartText = startBtn.innerText;

  modalEl.classList.remove("hidden");

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (currentUser) {
        renderDashboard();
      } else {
        renderHomePublic();
      }
    };
  }

  startBtn.onclick = async () => {
    if (!currentUser) {
      renderLogin();
      return;
    }
    if (startingSessionLock) return;

    startingSessionLock = true;
    startBtn.disabled = true;
    startBtn.innerText = "Iniciando...";
    if (cancelBtn) cancelBtn.disabled = true;

    try {
      await consumeStartCredit("training");
      modalEl.classList.add("hidden");
      if (typeof onStart === "function") onStart();
    } catch (error) {
      if (error?.code === "insufficient_credits" || error?.message === "insufficient_credits") {
        currentCredits = {
          ...(currentCredits || {}),
          balance: 0
        };
        writeLocalCreditsBalance(currentUser.uid, 0);
        updateVisibleCreditsLabel();
        showToast(INSUFFICIENT_CREDITS_MESSAGE, "error");
        return;
      }

      const code = String(error?.code || error?.message || "").toLowerCase();
      if (IS_LOCAL_DEV_HOST && code.includes("permission-denied")) {
        const localBalance = getCreditsBalanceValue();
        if (localBalance !== null && localBalance > 0) {
          currentCredits = {
            ...(currentCredits || {}),
            balance: Math.max(0, localBalance - 1)
          };
          writeLocalCreditsBalance(currentUser.uid, currentCredits.balance);
          updateVisibleCreditsLabel();
          modalEl.classList.add("hidden");
          if (typeof onStart === "function") onStart();
          return;
        }
        currentCredits = {
          ...(currentCredits || {}),
          balance: 0
        };
        writeLocalCreditsBalance(currentUser.uid, 0);
        updateVisibleCreditsLabel();
        showToast(INSUFFICIENT_CREDITS_MESSAGE, "error");
        return;
      }

      console.error("Falha ao iniciar treinamento:", error);
      showToast("Não foi possível iniciar agora. Tente novamente.", "error");
    } finally {
      startingSessionLock = false;
      startBtn.disabled = false;
      startBtn.innerText = defaultStartText;
      if (cancelBtn) cancelBtn.disabled = false;
    }
  };
}


// ===============================
// RENDERIZAÇÕES
// ===============================
function renderHomePublic() {
  app.innerHTML = homePublicView({
    logged: !!currentUser,
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel()
  });
  setupGlobalMenu();
  setupLogout();
  setupHeaderLogin();
  setupAccessButton();
  setupHomeSimuladosCards();
  setupContact();
  setupFooterLinks();
}

function renderLogin() {
  app.innerHTML = loginView({ isAdmin: isAdminUser(), userLabel: getUserLabel() });
  setupLoginForm();
  setupRegisterLink();
  setupContact();
  setupFooterLinks();
}

function renderRegister() {
  app.innerHTML = registerView({ isAdmin: isAdminUser(), userLabel: getUserLabel() });
  setupRegisterForm();
  setupLoginLinkAlt();
  setupContact();
  setupFooterLinks();
}

function renderDashboard() {
  app.innerHTML = dashboardView(currentUser, {
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    canStartSessions: true
  });
  setupLogout();
  setupDashboardActions();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
  warmupApi();
}

function renderSigwx() {
  setSimuladoMode("training");
  app.innerHTML = sigwxView({ isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });

  requestAnimationFrame(() => {
    startSigwxSimulado();
    setupTrainingStartModal();
  });

  setupLogout();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

function renderSigwxEvaluation() {
  setSimuladoMode("evaluation");
  app.innerHTML = sigwxEvaluationView({ isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });

  requestAnimationFrame(() => {
    startSigwxSimulado();
  });

  document.addEventListener("sigwx:finish", (e) => {
    renderSigwxEvaluationResults(e.detail);
  }, { once: true });

  setupEvaluationAutoNext();
  setupEvaluationTimer();
  setupLogout();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

function renderSigwxEvaluationResults(detail) {
  setSimuladoMode("evaluation-results");

  const total = detail.total;
  const correct = detail.correct;
  const wrong = detail.wrong;
  const answered = detail.state.filter(q => q.selected !== null).length;
  const percentage = detail.percentage;
  const status = percentage >= 75 ? "Aprovado" : "Reprovado";
  let durationSeconds = evaluationStartAtMs
    ? Math.max(0, Math.round((Date.now() - evaluationStartAtMs) / 1000))
    : null;
  if (durationSeconds === null && evaluationRemainingSeconds !== null) {
    durationSeconds = Math.max(0, evaluationTotalSeconds - evaluationRemainingSeconds);
  }
  if (!Number.isFinite(durationSeconds)) {
    durationSeconds = 0;
  }
  evaluationStartAtMs = null;

  const answers = sigwxQuestions.map((q, index) => {
    const st = detail.state[index];
    return {
      questionId: q.id,
      selectedIndex: st?.selected ?? null,
      options: st?.shuffledOptions
        ? st.shuffledOptions.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
        : []
    };
  });

  const items = sigwxQuestions.map((q, index) => {
    const st = detail.state[index];
    const selectedIndex = st?.selected;
    const selectedText =
      selectedIndex === null || selectedIndex === undefined
        ? "Não respondida"
        : st?.shuffledOptions?.[selectedIndex]?.text || "Não respondida";

    const correctOption = st?.shuffledOptions?.find(o => o.isCorrect);
    const correctText = correctOption ? correctOption.text : "";

    return {
      index: index + 1,
      image: q.image,
      question: q.question,
      selectedText,
      correctText,
      explanation: q.explanation || ""
    };
  });

  app.innerHTML = sigwxEvaluationResultView({
    summary: { total, correct, wrong, answered, percentage, status, durationSeconds },
    items,
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel()
  });

  saveEvaluationResult({
    simulado: "SIGWX",
    percentage,
    correct,
    total,
    status,
    answers,
    durationSeconds
  });

  setupEvaluationResultsActions(items);
  setupLogout();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

async function saveEvaluationResult({ simulado, percentage, correct, total, status, answers, durationSeconds }) {
  if (!currentUser) return;
  try {
    const safeDuration = Number.isFinite(durationSeconds) ? durationSeconds : 0;
    await saveEvaluation({
      userId: currentUser.uid,
      simulado,
      percentage,
      correct,
      total,
      status,
      answers,
      hasAnswers: true,
      answersCount: answers.length,
      durationSeconds: safeDuration
    });
  } catch (error) {
    console.error("Falha ao salvar avaliação:", error);
    alert("Falha ao salvar a avaliação. Verifique as regras do Firestore.");
  }
}

function setupEvaluationResultsActions(items) {
  const toTrainingBtn = document.getElementById("evalToTraining");
  const retryBtn = document.getElementById("evalRetry");
  const homeBtn = document.getElementById("evalHome");

  toTrainingBtn?.addEventListener("click", () => {
    startSigwxWithCredit("training");
  });

  retryBtn?.addEventListener("click", () => {
    startSigwxWithCredit("evaluation");
  });

  homeBtn?.addEventListener("click", () => {
    renderHomePublic();
  });

  document.querySelectorAll(".eval-report").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const index = Number(link.getAttribute("data-report-index"));
      const item = items[index - 1];
      const modal = document.getElementById("contactModal");
      const subjectInput = document.getElementById("contactSubject");
      const messageInput = document.getElementById("contactMessage");

      if (subjectInput) {
        subjectInput.value = `Erro na questão ${index} (SIGWX - Avaliação)`;
      }
      if (messageInput && item) {
        messageInput.value =
          `Questão ${index}:\n${item.question}\n\n` +
          `Minha resposta: ${item.selectedText}\n` +
          `Resposta correta: ${item.correctText}\n\n` +
          `Descreva o erro abaixo:`;
      }

      if (modal) {
        modal.classList.remove("hidden");
        if (messageInput) {
          messageInput.focus();
        }
      }
    });
  });
}

function setSimuladoMode(mode) {
  document.body.dataset.simuladoMode = mode;
}

function setupEvaluationAutoNext() {
  const checkbox = document.getElementById("sigwxAutoNext");
  if (!checkbox) return;

  document.body.dataset.sigwxAutoNext = checkbox.checked ? "1" : "0";

  checkbox.addEventListener("change", () => {
    document.body.dataset.sigwxAutoNext = checkbox.checked ? "1" : "0";
    document.dispatchEvent(
      new CustomEvent("sigwx:auto-next-change", {
        detail: { enabled: checkbox.checked }
      })
    );
  });
}

// ===============================
// SIGWX - MODO AVALIAÇÃO (TIMER)
// ===============================
function setupEvaluationTimer() {
  const timerEl = document.getElementById("sigwxTimer");
  const modalEl = document.getElementById("evaluationModal");
  const okBtn = document.getElementById("evaluationOk");
  const cancelBtn = document.getElementById("evaluationCancel");
  const finishBtn = document.getElementById("sigwxFinish");

  if (!timerEl || !modalEl || !okBtn || !finishBtn) return;

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (currentUser) {
        renderDashboard();
      } else {
        renderHomePublic();
      }
    };
  }

  evaluationTotalSeconds = 15 * 60;
  let remainingSeconds = evaluationTotalSeconds;
  evaluationRemainingSeconds = remainingSeconds;
  let intervalId = null;
  let startingEvaluation = false;
  const defaultOkText = okBtn.innerText;

  const renderTimer = () => {
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
    const seconds = String(remainingSeconds % 60).padStart(2, "0");
    timerEl.innerText = `${minutes}:${seconds}`;
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const startTimer = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      remainingSeconds -= 1;
      evaluationRemainingSeconds = remainingSeconds;
      renderTimer();

      if (remainingSeconds <= 0) {
        stopTimer();
        remainingSeconds = 0;
        renderTimer();
        finishBtn.click();
        showToast("Tempo encerrado. Avaliação finalizada.", "info");
      }
    }, 1000);
  };

  renderTimer();

  okBtn.addEventListener("click", async () => {
    if (!currentUser) {
      renderLogin();
      return;
    }
    if (startingEvaluation || startingSessionLock) return;

    startingEvaluation = true;
    startingSessionLock = true;
    okBtn.disabled = true;
    okBtn.innerText = "Iniciando...";
    if (cancelBtn) cancelBtn.disabled = true;

    try {
      await consumeStartCredit("evaluation");
      modalEl.classList.add("hidden");
      evaluationStartAtMs = Date.now();
      startTimer();
    } catch (error) {
      if (error?.code === "insufficient_credits" || error?.message === "insufficient_credits") {
        currentCredits = {
          ...(currentCredits || {}),
          balance: 0
        };
        writeLocalCreditsBalance(currentUser.uid, 0);
        updateVisibleCreditsLabel();
        showToast(INSUFFICIENT_CREDITS_MESSAGE, "error");
        return;
      }

      const code = String(error?.code || error?.message || "").toLowerCase();
      if (IS_LOCAL_DEV_HOST && code.includes("permission-denied")) {
        const localBalance = getCreditsBalanceValue();
        if (localBalance !== null && localBalance > 0) {
          currentCredits = {
            ...(currentCredits || {}),
            balance: Math.max(0, localBalance - 1)
          };
          writeLocalCreditsBalance(currentUser.uid, currentCredits.balance);
          updateVisibleCreditsLabel();
          modalEl.classList.add("hidden");
          evaluationStartAtMs = Date.now();
          startTimer();
          return;
        }
        currentCredits = {
          ...(currentCredits || {}),
          balance: 0
        };
        writeLocalCreditsBalance(currentUser.uid, 0);
        updateVisibleCreditsLabel();
        showToast(INSUFFICIENT_CREDITS_MESSAGE, "error");
        return;
      }

      console.error("Falha ao iniciar avaliação:", error);
      showToast("Não foi possível iniciar agora. Tente novamente.", "error");
    } finally {
      startingEvaluation = false;
      startingSessionLock = false;
      okBtn.disabled = false;
      okBtn.innerText = defaultOkText;
      if (cancelBtn) cancelBtn.disabled = false;
    }
  });

  document.addEventListener("sigwx:finish", () => {
    stopTimer();
  }, { once: true });
}

function renderPrivacy() {
  app.innerHTML = privacyView({ logged: !!currentUser, isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

function renderCookies() {
  app.innerHTML = cookiesView({ logged: !!currentUser, isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

function renderContact() {
  app.innerHTML = contactView({ logged: !!currentUser, isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

async function renderProfile() {
  app.innerHTML = profileView({ user: currentUser, profile: null, evaluations: [], loading: true, isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();

  if (!currentUser) return;

  try {
    const [evaluations, profile] = await Promise.all([
      getEvaluationsByUser(currentUser.uid),
      getUserProfile(currentUser.uid)
    ]);
    app.innerHTML = profileView({ user: currentUser, profile, evaluations, loading: false, isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
    setupProfileActions(evaluations);
    setupProfileForm(profile);
    setupProfileFilters();
  } catch (error) {
    console.error("Erro ao carregar avaliações:", error);
    app.innerHTML = profileView({
      user: currentUser,
      profile: null,
      evaluations: [],
      loading: false,
      isAdmin: isAdminUser(),
      userLabel: getUserLabel(),
      credits: getCreditsLabel()
    });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
  }
}

async function renderAdmin() {
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }

  app.innerHTML = adminView({ users: [], loading: true, isAdmin: true, userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();

  try {
    const users = await getAllUsers();
    const creditsList = await Promise.all(
      users.map(async (u) => {
        const targetId = u.uid || u.id;
        try {
          return await getUserCredits(targetId);
        } catch (error) {
          return null;
        }
      })
    );

    if (!adminNormalizedOnce) {
      const normalized = await normalizeDuplicateUsers(users, creditsList);
      adminNormalizedOnce = true;
      if (normalized) {
        await renderAdmin();
        return;
      }
    }

    adminUsersCache = users.map((u, index) => {
      const credit = creditsList[index];
      const rawBalance = credit?.balance ?? credit?.credits ?? credit?.saldo ?? 0;
      const targetId = u.uid || u.id;
      const balance = getEffectiveBalanceForUser(targetId, rawBalance);
      return {
        ...u,
        creditsBalance: Number.isFinite(balance) ? balance : 0
      };
    });
    const notice =
      adminUsersCache.length === 0
        ? "Nenhum usuário retornado. Verifique se há usuários cadastrados."
        : "";
    app.innerHTML = adminView({ users: adminUsersCache, loading: false, isAdmin: true, userLabel: getUserLabel(), credits: getCreditsLabel(), notice });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
    setupAdminActions();
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    app.innerHTML = adminView({
      users: [],
      loading: false,
      isAdmin: true,
      userLabel: getUserLabel(),
      credits: getCreditsLabel(),
      notice: "Erro ao carregar usuários. Verifique as regras do Firestore."
    });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
  }
}

function pickFirstNonEmpty(values) {
  return values.find((v) => String(v || "").trim() !== "") || "";
}

function parseDateValue(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (value._seconds) return new Date(value._seconds * 1000);
  return null;
}

async function normalizeDuplicateUsers(users, creditsList) {
  const byEmail = new Map();
  users.forEach((u, index) => {
    const email = String(u.email || "").toLowerCase().trim();
    if (!email) return;
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email).push({ u, index });
  });

  const actions = [];
  for (const [email, entries] of byEmail.entries()) {
    if (entries.length <= 1) continue;

    const enriched = entries.map(({ u, index }) => {
      const credit = creditsList[index];
      const rawBalance = credit?.balance ?? credit?.credits ?? credit?.saldo ?? 0;
      const balance = Number(rawBalance);
      const creditId = u.uid || u.id;
      return { u, credit, balance, creditId };
    });

    const primary =
      enriched.find((e) => Number.isFinite(e.balance) && e.balance > 0) ||
      enriched.find((e) => e.u.uid && e.u.uid === e.u.id) ||
      enriched.find((e) => e.u.uid) ||
      enriched[0];

    const primaryId = primary.creditId || primary.u.id;
    const mergedName = pickFirstNonEmpty(enriched.map((e) => e.u.name));
    const mergedRole = pickFirstNonEmpty(enriched.map((e) => e.u.role));
    const mergedWhatsapp = pickFirstNonEmpty(enriched.map((e) => e.u.whatsapp));
    const createdDates = enriched.map((e) => parseDateValue(e.u.createdAt)).filter(Boolean);
    const earliest = createdDates.length ? new Date(Math.min(...createdDates.map((d) => d.getTime()))) : null;

    actions.push(
      saveUserProfile(primaryId, {
        uid: primaryId,
        email,
        name: mergedName,
        role: mergedRole,
        whatsapp: mergedWhatsapp,
        createdAt: earliest ? earliest.toISOString() : undefined
      })
    );

    enriched.forEach((e) => {
      if (e.u.id !== primaryId) {
        actions.push(deleteUserProfile(e.u.id));
      }
    });
  }

  if (!actions.length) return false;
  try {
    await Promise.all(actions);
    return true;
  } catch (error) {
    console.error("Falha ao normalizar duplicados:", error);
    return false;
  }
}

function renderCreditsScreen() {
  app.innerHTML = creditsView({
    user: currentUser,
    credits: getCreditsLabel(),
    userLabel: getUserLabel(),
    isAdmin: isAdminUser(),
    historyItems: creditHistoryItems.map(formatCreditHistoryItem),
    historyLoading: creditHistoryLoading,
    historyLoadingMore: creditHistoryLoadingMore,
    historyHasMore: creditHistoryHasMore,
    historyError: creditHistoryError
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupCreditsActions();
  setupCreditsHistoryActions();
  restoreCreditsStatus();
}

function appendCreditHistoryItems(newItems = []) {
  const mergedById = new Map();
  [...creditHistoryItems, ...newItems].forEach((item) => {
    if (!item?.id) return;
    mergedById.set(item.id, item);
  });
  creditHistoryItems = Array.from(mergedById.values());
}

async function loadCreditHistoryPage({ append = false } = {}) {
  if (!currentUser) return;

  const page = await getUserCreditTransactionsPage(currentUser.uid, {
    pageSize: CREDITS_HISTORY_PAGE_SIZE,
    cursor: append ? creditHistoryCursor : null
  });

  if (append) {
    appendCreditHistoryItems(page.items);
  } else {
    creditHistoryItems = page.items;
  }
  creditHistoryCursor = page.nextCursor;
  creditHistoryHasMore = !!page.hasMore;
  creditHistoryError = "";
}

function renderCredits() {
  if (!currentUser) {
    renderLogin();
    return;
  }

  creditHistoryLoading = true;
  creditHistoryLoadingMore = false;
  creditHistoryHasMore = false;
  creditHistoryItems = [];
  creditHistoryCursor = null;
  creditHistoryError = "";
  renderCreditsScreen();

  Promise.allSettled([
    getUserCredits(currentUser.uid),
    loadCreditHistoryPage({ append: false })
  ])
    .then(([creditsResult, historyResult]) => {
      if (creditsResult.status === "fulfilled") {
        currentCredits = applyLocalCreditsBalance(creditsResult.value || { balance: 0 }, true);
        console.log("PreFlight credits fetched:", {
          uid: currentUser.uid,
          credits: currentCredits
        });
        window.__preflight = {
          uid: currentUser.uid,
          credits: currentCredits
        };
      } else {
        currentCredits = applyLocalCreditsBalance(currentCredits || { balance: 0 }, false);
        console.warn("PreFlight credits fetch failed for uid:", currentUser.uid);
      }

      if (historyResult.status === "rejected") {
        console.warn("PreFlight credits history fetch failed:", historyResult.reason);
        creditHistoryError = "Não foi possível carregar o histórico agora.";
      }
    })
    .finally(() => {
      creditHistoryLoading = false;
      renderCreditsScreen();
    });
}
function setupProfileActions(evaluations) {
  const links = document.querySelectorAll(".profile-link[data-eval-id]");
  links.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-eval-id");
      if (!id) return;
      const localEval = evaluations?.find((e) => e.id === id);
      if (localEval?.hasAnswers || (localEval?.answers && localEval.answers.length > 0)) {
        renderEvaluationHistory(localEval);
        return;
      }

      const evaluation = await getEvaluationById(id);
      if (evaluation?.hasAnswers || (evaluation?.answers && evaluation.answers.length > 0)) {
        renderEvaluationHistory(evaluation);
        return;
      }

      alert("Este gabarito não está disponível porque essa avaliação foi feita antes desta atualização.");
    });
  });
}

function setupProfileFilters() {
  const buttons = document.querySelectorAll("[data-profile-filter]");
  const cards = document.querySelectorAll("[data-profile-status]");
  if (!buttons.length || !cards.length) return;

  const applyFilter = (filter) => {
    cards.forEach((card) => {
      const status = card.getAttribute("data-profile-status");
      const show = filter === "all" || status === filter;
      card.style.display = show ? "" : "none";
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.getAttribute("data-profile-filter"));
    });
  });
}

function setupProfileForm(profile) {
  const nameInput = document.getElementById("profileName");
  const roleInput = document.getElementById("profileRole");
  const whatsappInput = document.getElementById("profileWhatsapp");
  const saveBtn = document.getElementById("profileSave");
  const deleteBtn = document.getElementById("profileDelete");

  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    const name = nameInput?.value.trim() ?? "";
    const role = roleInput?.value.trim() ?? "";
    const whatsapp = whatsappInput?.value.trim() ?? "";

    if (!name || !role) {
      alert("Preencha nome e perfil.");
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerText = "Salvando...";

    try {
      await saveUserProfile(currentUser.uid, {
        uid: currentUser.uid,
        name,
        role,
        whatsapp,
        email: currentUser.email || profile?.email || ""
      });
      currentProfile = {
        name,
        role,
        whatsapp,
        email: currentUser.email || profile?.email || ""
      };
      alert("Perfil atualizado.");
    } catch (error) {
      alert("Erro ao salvar perfil.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = "Salvar";
    }
  });

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!currentUser) return;
      const confirmText = prompt("Digite EXCLUIR para confirmar:");
      if (confirmText !== "EXCLUIR") return;

      deleteBtn.disabled = true;
      deleteBtn.innerText = "Excluindo...";

      try {
        await deleteEvaluationsByUser(currentUser.uid);
        await deleteUserProfile(currentUser.uid);
        await deleteAccount();
        alert("Conta excluída.");
        renderHomePublic();
      } catch (error) {
        alert("Não foi possível excluir a conta. Faça login novamente e tente.");
      } finally {
        deleteBtn.disabled = false;
        deleteBtn.innerText = "Excluir minha conta";
      }
    });
  }
}

function setupAdminActions() {
  const searchInput = document.getElementById("adminSearch");
  const roleSelect = document.getElementById("adminRole");
  const exportBtn = document.getElementById("adminExport");
  const refreshBtn = document.getElementById("adminRefresh");

  const applyFilters = () => {
    const term = (searchInput?.value || "").toLowerCase().trim();
    const role = (roleSelect?.value || "").toLowerCase().trim();
    const cards = document.querySelectorAll(".admin-card");

    cards.forEach((card) => {
      const name = card.getAttribute("data-name") || "";
      const email = card.getAttribute("data-email") || "";
      const cardRole = (card.getAttribute("data-role") || "").toLowerCase().trim();

      const matchesTerm =
        !term || name.includes(term) || email.includes(term);
      const matchesRole = !role || cardRole === role;

      card.style.display = matchesTerm && matchesRole ? "" : "none";
    });
  };

  searchInput?.addEventListener("input", applyFilters);
  roleSelect?.addEventListener("change", applyFilters);

  exportBtn?.addEventListener("click", () => {
    const rows = adminUsersCache.map((u) => ({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "",
      whatsapp: u.whatsapp || "",
      creditsBalance: Number.isFinite(u.creditsBalance) ? u.creditsBalance : 0,
      createdAt: u.createdAt && u.createdAt.toDate
        ? u.createdAt.toDate().toISOString()
        : u.createdAt || ""
    }));

    const header = ["name", "email", "role", "whatsapp", "creditsBalance", "createdAt"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        header.map((h) => `"${String(r[h] || "").replace(/\"/g, '""')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "usuarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  refreshBtn?.addEventListener("click", () => {
    renderAdmin();
  });

  const saveCredits = async (userId) => {
    if (!userId) return;
    const input = document.querySelector(`.admin-credits-input[data-user-id="${userId}"]`);
    const btn = document.querySelector(`.admin-credits-save[data-user-id="${userId}"]`);
    const card = document.querySelector(`.admin-card[data-user-id="${userId}"]`);
    const valueEl = card?.querySelector(".admin-credits-value");
    if (!input || !btn) return;

    const rawValue = String(input.value || "").trim();
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < 0) {
      alert("Informe um saldo válido (0 ou maior).");
      return;
    }

    const balance = Math.floor(parsed);
    btn.disabled = true;
    const prevText = btn.innerText;
    btn.innerText = "Salvando...";

    try {
      await setUserCredits(userId, balance);
      writeLocalCreditsState(userId, {
        balance,
        serverBaseline: balance
      });
      const user = adminUsersCache.find((u) => u.id === userId);
      if (user) {
        user.creditsBalance = balance;
      }
      if (valueEl) {
        valueEl.textContent = `Saldo: ${balance}`;
      }
      input.value = String(balance);
      alert("Créditos atualizados.");
    } catch (error) {
      console.error("Erro ao salvar crÃ©ditos:", error);
      alert("Não foi possível atualizar os créditos.");
    } finally {
      btn.disabled = false;
      btn.innerText = prevText;
    }
  };

  document.querySelectorAll(".admin-credits-save").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.getAttribute("data-user-id") || "";
      saveCredits(userId);
    });
  });

  document.querySelectorAll(".admin-credits-input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const userId = input.getAttribute("data-user-id") || "";
      saveCredits(userId);
    });
  });
}

function setupCreditsActions() {
  const btn = document.getElementById("buyCreditsBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    startCreditsCheckout();
  });
}

function setupCreditsHistoryActions() {
  const moreBtn = document.getElementById("creditsHistoryMoreBtn");
  if (!moreBtn) return;

  moreBtn.addEventListener("click", async () => {
    if (!currentUser || creditHistoryLoadingMore || !creditHistoryHasMore) return;

    creditHistoryLoadingMore = true;
    renderCreditsScreen();

    try {
      await loadCreditHistoryPage({ append: true });
    } catch (error) {
      console.warn("PreFlight credits history pagination failed:", error);
      showToast("Não foi possível carregar mais itens do histórico.", "error");
    } finally {
      creditHistoryLoadingMore = false;
      renderCreditsScreen();
    }
  });
}

function showCreditsStatus() {
  const status = document.getElementById("creditsStatus");
  if (status) status.hidden = false;
}

function hideCreditsStatus() {
  const status = document.getElementById("creditsStatus");
  if (status) status.hidden = true;
}

function restoreCreditsStatus() {
  if (creditsPolling) {
    showCreditsStatus();
  }
}

function startCreditsPolling(initialBalance) {
  if (!currentUser) return;
  if (creditsPolling) return;

  showCreditsStatus();
  creditsPollingStart = Date.now();

  creditsPolling = setInterval(async () => {
    try {
      const credits = await getUserCredits(currentUser.uid);
      const balance = credits?.balance ?? 0;
      if (balance > initialBalance) {
        currentCredits = applyLocalCreditsBalance(credits || { balance: balance }, true);
        renderCredits();
        stopCreditsPolling();
        return;
      }
    } catch (error) {
      console.warn("Credits polling failed:", error);
    }

    if (Date.now() - creditsPollingStart > 5 * 60 * 1000) {
      stopCreditsPolling();
    }
  }, 5000);
}

function stopCreditsPolling() {
  if (creditsPolling) {
    clearInterval(creditsPolling);
    creditsPolling = null;
    creditsPollingStart = null;
  }
  hideCreditsStatus();
}

function renderEvaluationHistory(evaluation) {
  setSimuladoMode("evaluation-history");

  const total = evaluation.total;
  const correct = evaluation.correct;
  const wrong = total - correct;
  const answered = evaluation.answers.filter(a => a.selectedIndex !== null).length;
  const percentage = evaluation.percentage;
  const status = percentage >= 75 ? "Aprovado" : "Reprovado";

  const items = sigwxQuestions.map((q) => {
    const ans = evaluation.answers.find(a => a.questionId === q.id);
    const selectedIndex = ans?.selectedIndex;
    const selectedText =
      selectedIndex === null || selectedIndex === undefined || !ans?.options
        ? "Não respondida"
        : ans.options[selectedIndex]?.text || "Não respondida";

    const correctOption = ans?.options ? ans.options.find(o => o.isCorrect) : null;
    const correctText = correctOption ? correctOption.text : "";

    return {
      index: q.id,
      image: q.image,
      question: q.question,
      selectedText,
      correctText,
      explanation: q.explanation || ""
    };
  });

  app.innerHTML = profileEvaluationView({
    summary: { total, correct, wrong, answered, percentage, status, durationSeconds: evaluation.durationSeconds },
    items,
    isAdmin: isAdminUser(),
    userLabel: getUserLabel()
  });

  const backBtn = document.getElementById("profileBack");
  backBtn?.addEventListener("click", () => {
    renderProfile();
  });

  setupEvaluationResultsActions(items);
  setupLogout();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

// ===============================
// CONTROLE DE SESSÃO
// ===============================
observeAuthState((user) => {
  currentUser = user;
  currentProfile = null;
  currentCredits = null;
  creditHistoryItems = [];
  creditHistoryCursor = null;
  creditHistoryHasMore = false;
  creditHistoryLoading = false;
  creditHistoryLoadingMore = false;
  creditHistoryError = "";
  startingSessionLock = false;
  renderHomePublic();
  if (currentUser) {
    getUserProfile(currentUser.uid)
      .then(async (profile) => {
        if (!profile) {
          await saveUserProfile(currentUser.uid, {
            uid: currentUser.uid,
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            role: "",
            whatsapp: ""
          });
          currentProfile = await getUserProfile(currentUser.uid);
          return;
        }
        currentProfile = profile;
        if (!profile.uid) {
          await saveUserProfile(currentUser.uid, {
            uid: currentUser.uid,
            email: currentUser.email || profile.email || ""
          });
        }
      })
      .catch(() => {
        currentProfile = null;
      });

    getUserCredits(currentUser.uid)
      .then((credits) => {
        currentCredits = applyLocalCreditsBalance(credits || { balance: 0 }, true);
        if (document.body.dataset.simuladoMode !== "training" && document.body.dataset.simuladoMode !== "evaluation") {
          renderHomePublic();
        }
      })
      .catch(() => {
        currentCredits = applyLocalCreditsBalance(currentCredits || { balance: 0 }, false);
        if (document.body.dataset.simuladoMode !== "training" && document.body.dataset.simuladoMode !== "evaluation") {
          renderHomePublic();
        }
      });
  }
});

document.addEventListener("sigwx:go-eval", () => {
  startSigwxWithCredit("evaluation");
});

document.addEventListener("sigwx:restart-training-request", async () => {
  if (document.body.dataset.simuladoMode !== "training") return;
  if (!currentUser) {
    renderLogin();
    return;
  }
  setupTrainingStartModal({
    onStart: () => {
      document.dispatchEvent(new CustomEvent("sigwx:reset"));
    }
  });
});

// ===============================
// MENU GLOBAL (HEADER)
// ===============================
function setupGlobalMenu() {
  const goHome = document.getElementById("goHome");
  const goDashboard = document.getElementById("goDashboard");
  const goContact = document.getElementById("goContact");
  const goProfile = document.getElementById("goProfile");
  const goAdmin = document.getElementById("goAdmin");
  const goCredits = document.getElementById("goCredits");

  if (goHome) {
    goHome.addEventListener("click", (e) => {
      e.preventDefault();
      renderHomePublic();
    });
  }

  if (goDashboard) {
    goDashboard.addEventListener("click", (e) => {
      e.preventDefault();
      if (!currentUser) {
        renderLogin();
        return;
      }
      renderDashboard();
    });
  }

  if (goContact) {
    goContact.addEventListener("click", (e) => {
      e.preventDefault();
      renderContact();
    });
  }

  if (goProfile) {
    goProfile.addEventListener("click", (e) => {
      e.preventDefault();
      renderProfile();
    });
  }

  if (goAdmin) {
    goAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      renderAdmin();
    });
  }

  if (goCredits) {
    goCredits.addEventListener("click", (e) => {
      e.preventDefault();
      renderCredits();
    });
  }

  setupUserMenu();
}

function setupUserMenu() {
  const btn = document.getElementById("userMenuBtn");
  const menu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("userLogout");

  if (!btn || !menu) return;

  const toggle = () => {
    menu.classList.toggle("hidden");
  };

  btn.onclick = (e) => {
    e.stopPropagation();
    toggle();
  };

  if (userMenuDocumentClickHandler) {
    document.removeEventListener("click", userMenuDocumentClickHandler);
  }
  userMenuDocumentClickHandler = () => {
    if (!menu.classList.contains("hidden")) {
      menu.classList.add("hidden");
    }
  };
  document.addEventListener("click", userMenuDocumentClickHandler);

  if (userMenuDocumentKeydownHandler) {
    document.removeEventListener("keydown", userMenuDocumentKeydownHandler);
  }
  userMenuDocumentKeydownHandler = (e) => {
    if (e.key === "Escape" && !menu.classList.contains("hidden")) {
      menu.classList.add("hidden");
      btn.focus();
    }
  };
  document.addEventListener("keydown", userMenuDocumentKeydownHandler);

  logoutBtn && (logoutBtn.onclick = async (e) => {
    e.preventDefault();
    await logout();
  });
}

// ===============================
// RODAPÉ (POLÍTICAS)
// ===============================
function setupFooterLinks() {
  const privacyLink = document.getElementById("privacyLink");
  const cookiesLink = document.getElementById("cookiesLink");

  if (privacyLink) {
    privacyLink.addEventListener("click", (e) => {
      e.preventDefault();
      renderPrivacy();
    });
  }

  if (cookiesLink) {
    cookiesLink.addEventListener("click", (e) => {
      e.preventDefault();
      renderCookies();
    });
  }
}

// ===============================
// HEADER - LOGIN
// ===============================
function setupHeaderLogin() {
  const loginLink = document.getElementById("loginLink");
  if (!loginLink) return;

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    renderLogin();
  });
}

function setupRegisterLink() {
  const registerLink = document.getElementById("registerLink");
  if (!registerLink) return;

  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    renderRegister();
  });
}

function setupLoginLinkAlt() {
  const loginLinkAlt = document.getElementById("loginLinkAlt");
  if (!loginLinkAlt) return;

  loginLinkAlt.addEventListener("click", (e) => {
    e.preventDefault();
    renderLogin();
  });
}

// ===============================
// BOTÃO "ACESSAR SIMULADOS"
// ===============================
function setupAccessButton() {
  const btn = document.getElementById("accessBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!currentUser) {
      renderLogin();
    } else {
      renderDashboard();
    }
  });
}

// ===============================
// LOGIN FORM
// ===============================
function setupLoginForm() {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!loginBtn || !emailInput || !passwordInput) return;

  const submitLogin = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showToast("Preencha email e senha.", "error");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Entrando...";

    try {
      await login(email, password);
    } catch (error) {
      showToast(getFirebaseAuthMessage(error, "Erro ao fazer login."), "error");
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerText = "Entrar";
    }
  };

  loginBtn.addEventListener("click", submitLogin);
  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      submitLogin();
    });
  });
}

// ===============================
// DASHBOARD
// ===============================
function setupDashboardActions() {
  const trainingBtn = document.getElementById("dashboardSigwxTraining");
  const evalBtn = document.getElementById("dashboardSigwxEval");
  const page = document.querySelector(".simulados-page");

  if (trainingBtn) {
    trainingBtn.onclick = (e) => {
      e.stopPropagation();
      if (trainingBtn.disabled) return;
      startSigwxWithCredit("training");
    };
  }

  if (evalBtn) {
    evalBtn.onclick = (e) => {
      e.stopPropagation();
      if (evalBtn.disabled) return;
      startSigwxWithCredit("evaluation");
    };
  }

  if (page) {
    page.onclick = (e) => {
      const target = e.target instanceof Element ? e.target.closest("[data-action]") : null;
      if (!target || target.hasAttribute("disabled")) return;

      const action = target.getAttribute("data-action");
      if (action === "sigwx") {
        startSigwxWithCredit("training");
      } else if (action === "sigwx-eval") {
        startSigwxWithCredit("evaluation");
      }
    };
  }
}

// ===============================
// CADASTRO FORM
// ===============================
function setupRegisterForm() {
  const registerBtn = document.getElementById("registerBtn");
  const nameInput = document.getElementById("name");
  const roleInput = document.getElementById("role");
  const whatsappInput = document.getElementById("whatsapp");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!registerBtn || !nameInput || !roleInput || !whatsappInput || !emailInput || !passwordInput) return;

  const submitRegister = async () => {
    const name = nameInput.value.trim();
    const role = roleInput?.value.trim() ?? "";
    const whatsapp = whatsappInput?.value.trim() ?? "";
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !role || !email || !password) {
      showToast("Preencha nome, perfil, email e senha.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("A senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }

    registerBtn.disabled = true;
    registerBtn.innerText = "Criando...";

    try {
      const cred = await register(name, email, password);
      const profileData = {
        uid: cred.user.uid,
        name,
        email,
        role,
        whatsapp,
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(cred.user.uid, profileData);
      currentProfile = profileData;
      renderDashboard();
    } catch (error) {
      showToast(getFirebaseAuthMessage(error, "Erro ao cadastrar. Verifique seus dados."), "error");
    } finally {
      registerBtn.disabled = false;
      registerBtn.innerText = "Cadastrar";
    }
  };

  registerBtn.addEventListener("click", submitRegister);
  [nameInput, roleInput, whatsappInput, emailInput, passwordInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      submitRegister();
    });
  });
}

// ===============================
// HOME - CARDS DE SIMULADOS
// ===============================
function setupHomeSimuladosCards() {
  const cards = document.querySelectorAll(".simulados .card[data-action]");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!currentUser) {
        renderLogin();
      } else {
        renderDashboard();
      }
    });
  });
}

// ===============================
// LOGOUT
// ===============================
function setupLogout() {
  const logoutBtn = document.getElementById("logoutLink");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
    });
  }

  const userLogout = document.getElementById("userLogout");
  if (userLogout) {
    userLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
    });
  }
}

// ===============================
// CONTATO (BALÃO)
// ===============================
function setupContact() {
  const fab = document.getElementById("contactFab");
  const fabClose = document.getElementById("contactFabClose");
  const modal = document.getElementById("contactModal");

  if (!fab || !modal) return;

  const closeBtn = document.getElementById("contactClose");
  const sendBtn = document.getElementById("contactSend");
  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const subjectInput = document.getElementById("contactSubject");
  const messageInput = document.getElementById("contactMessage");

  const openModal = () => {
    modal.classList.remove("hidden");
    if (fabClose) fabClose.classList.remove("hidden");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
  };

  fab.addEventListener("click", openModal);

  if (fabClose) {
    fabClose.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
      fab.classList.add("hidden");
      fabClose.classList.add("hidden");
      fab.style.display = "none";
      fabClose.style.display = "none";
      fabClose.setAttribute("aria-label", "Mostrar contato");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  if (sendBtn) {
    sendBtn.addEventListener("click", async () => {
      const name = nameInput?.value.trim() ?? "";
      const email = emailInput?.value.trim() ?? "";
      const subject = subjectInput?.value.trim() ?? "";
      const message = messageInput?.value.trim() ?? "";

      if (!name || !email || !subject || !message) {
        showToast("Preencha nome, email, assunto e mensagem.", "error");
        return;
      }

      if (!window.emailjs) {
        showToast("EmailJS não carregou. Verifique sua conexão.", "error");
        return;
      }

      sendBtn.disabled = true;
      sendBtn.innerText = "Enviando...";

      try {
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          name,
          email,
          subject,
          message,
          reply_to: email
        });
        if (nameInput) nameInput.value = "";
        if (emailInput) emailInput.value = "";
        if (subjectInput) subjectInput.value = "";
        if (messageInput) messageInput.value = "";
        closeModal();
        showToast("Mensagem enviada com sucesso.", "success");
      } catch (error) {
        showToast("Erro ao enviar mensagem. Tente novamente.", "error");
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = "Enviar";
      }
    });
  }
}

async function startCreditsCheckout() {
  if (!currentUser) {
    renderLogin();
    return;
  }
  try {
    const baseBalance = currentCredits?.balance ?? 0;
    const res = await fetchApiWithPathFallback("/createPreference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser.uid,
        email: currentUser.email || ""
      })
    });
    const data = await res.json();
    const url = USE_MP_SANDBOX
      ? (data.sandbox_init_point || data.init_point)
      : (data.init_point || data.sandbox_init_point);
    if (!url) {
      showToast("Não foi possível iniciar o pagamento.", "error");
      return;
    }
    window.open(url, "_blank");
    startCreditsPolling(baseBalance);
  } catch (error) {
    console.error("Checkout error:", error);
    showToast("Erro ao iniciar pagamento.", "error");
  }
}






