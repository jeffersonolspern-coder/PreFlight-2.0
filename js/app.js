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
  adminQuestionHubView,
  adminQuestionEditorView,
  creditsView,
  packagesView,
  contactView,
  privacyView,
  cookiesView
} from "./views/views.js";

import {
  login,
  loginWithGoogle,
  register,
  logout,
  observeAuthState
} from "./modules/auth.js";

import {
  saveEvaluation,
  getEvaluationsByUser,
  getEvaluationById,
  getAllEvaluations
} from "./modules/evaluations.js";

import {
  saveUserProfile,
  getUserProfile,
  getAllUsers,
  getAllCredits,
  getUserCredits,
  setUserCredits,
  deleteUserProfile,
  deleteUserCredits,
  recordConsumeCreditTransaction,
  consumeUserCredit,
  getUserCreditTransactionsPage,
  getUserSessionCounts,
  getGlobalNotice,
  setGlobalNotice,
  getAllCreditTransactions
} from "./modules/users.js";
import {
  getQuestionsByBank,
  saveQuestion as saveQuestionDefinition,
  deleteQuestion as deleteQuestionDefinition
} from "./modules/questions.js";
import { startSigwxSimulado } from "./simulados/sigwx/simulado.js";
import { sigwxQuestions } from "./simulados/sigwx/data.js";
import { sigwxEvaluationQuestions } from "./simulados/sigwx/data-evaluation.js";
import { metarTafQuestions } from "./simulados/metar-taf/data.js";
import { metarTafEvaluationQuestions } from "./simulados/metar-taf/data-evaluation.js";

import "./simulados/sigwx/painel.js";

const app = document.getElementById("app");

const FUNCTIONS_BASE_URL =
  window.PREFLIGHT_FUNCTIONS_URL ||
  "https://us-central1-preflightsimulados.cloudfunctions.net/api";
const USE_MP_SANDBOX = window.PREFLIGHT_MP_SANDBOX === true;
const USE_BACKEND_CREDITS_API = window.PREFLIGHT_USE_BACKEND_CREDITS_API !== false;
const IS_LOCAL_DEV_HOST =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost";
const LOCAL_CREDITS_KEY_PREFIX = "preflight_local_credits_";
const CREDITS_HISTORY_PAGE_SIZE = 30;
const WELCOME_BONUS_CREDITS = 5;
const CREDIT_API_TIMEOUT_MS = 12000;
const PRESENCE_HEARTBEAT_MS = 45 * 1000;
const ADMIN_LIGHT_MODE_KEY = "preflight_admin_light_mode";
const ADMIN_MARKED_QUESTIONS_KEY = "preflight_admin_marked_questions_v1";
const ADMIN_REVIEWED_QUESTIONS_KEY = "preflight_admin_reviewed_questions_v1";
const ADMIN_AUTO_NEXT_ON_SAVE_KEY = "preflight_admin_auto_next_on_save";
const QUESTION_BANKS = [
  { id: "sigwx_training", label: "SIGWX • Treinamento", imageBasePath: "assets/questions/sigwx" },
  { id: "sigwx_evaluation", label: "SIGWX • Avaliação", imageBasePath: "assets/questions/sigwx-evaluation" },
  {
    id: "metar_taf_training",
    label: "METAR/TAF • Treinamento",
    imageBasePath: "assets/questions/metar-taf/training"
  },
  {
    id: "metar_taf_evaluation",
    label: "METAR/TAF • Avaliação",
    imageBasePath: "assets/questions/metar-taf/evaluation"
  }
];
const QUESTION_BANK_BY_ID = new Map(QUESTION_BANKS.map((bank) => [bank.id, bank]));
const SIMULADO_BANKS = {
  sigwx: { training: "sigwx_training", evaluation: "sigwx_evaluation", label: "SIGWX" },
  metar_taf: { training: "metar_taf_training", evaluation: "metar_taf_evaluation", label: "METAR/TAF" }
};
const DEFAULT_QUESTION_BANKS = {
  sigwx_training: Array.isArray(sigwxQuestions) ? sigwxQuestions.map((q) => ({ ...q })) : [],
  sigwx_evaluation: Array.isArray(sigwxEvaluationQuestions) ? sigwxEvaluationQuestions.map((q) => ({ ...q })) : [],
  metar_taf_training: Array.isArray(metarTafQuestions) ? metarTafQuestions.map((q) => ({ ...q })) : [],
  metar_taf_evaluation: Array.isArray(metarTafEvaluationQuestions) ? metarTafEvaluationQuestions.map((q) => ({ ...q })) : []
};
const CREDIT_PACKS = {
  bronze: { id: "bronze", name: "Bronze", credits: 10, price: 9.9 },
  silver: { id: "silver", name: "Silver", credits: 30, price: 19.9 },
  gold: { id: "gold", name: "Gold", credits: 50, price: 29.9 }
};

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
let adminMetricsRange = "30d";
let adminMetricsData = { evaluations: [], transactions: [] };
let adminMetricsSummary = null;
let adminPanelScreen = "dashboard";
let adminLightMode = localStorage.getItem(ADMIN_LIGHT_MODE_KEY) !== "0";
let activeSimuladoKey = "sigwx";
let profileEvaluationsCache = [];
let profileShowAllEvaluations = false;
let profileVisibleSpentCredits = 7;
let globalNoticeMessage = "";
let pendingWelcomeAnnouncement = "";
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
let presenceHeartbeat = null;
let presenceVisibilityHandler = null;
let presencePageHideHandler = null;
let evaluationFinishHandler = null;
let stopEvaluationTimerFn = null;
let mobileHeaderResizeHandler = null;
let homeSimuladosResizeHandler = null;
let simuladoNavResizeHandler = null;
let homeModeCarouselCleanupFns = [];
const INSUFFICIENT_CREDITS_MESSAGE = "Você não possui créditos suficientes.";
let userMenuDocumentClickHandler = null;
let userMenuDocumentKeydownHandler = null;
let apiWarmupDone = false;
let questionBanksCache = {
  sigwx_training: DEFAULT_QUESTION_BANKS.sigwx_training.map((q) => ({ ...q })),
  sigwx_evaluation: DEFAULT_QUESTION_BANKS.sigwx_evaluation.map((q) => ({ ...q })),
  metar_taf_training: DEFAULT_QUESTION_BANKS.metar_taf_training.map((q) => ({ ...q })),
  metar_taf_evaluation: DEFAULT_QUESTION_BANKS.metar_taf_evaluation.map((q) => ({ ...q }))
};
let questionBankLoadedFlags = {
  sigwx_training: false,
  sigwx_evaluation: false,
  metar_taf_training: false,
  metar_taf_evaluation: false
};
let adminQuestionBank = "sigwx_training";
let adminQuestionEditor = null;
let adminQuestionEditorDraftMode = false;
let adminMarkedQuestionsByBank = readAdminMarkedQuestionsState();
let adminReviewedQuestionsByBank = readAdminReviewedQuestionsState();
let adminShowOnlyMarkedByBank = {};
let adminAutoNextOnSave = localStorage.getItem(ADMIN_AUTO_NEXT_ON_SAVE_KEY) === "1";

function readAdminMarkedQuestionsState() {
  try {
    const raw = localStorage.getItem(ADMIN_MARKED_QUESTIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    const normalized = {};
    Object.entries(parsed).forEach(([bankId, ids]) => {
      if (!Array.isArray(ids)) return;
      const safeIds = Array.from(
        new Set(
          ids
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0)
            .map((id) => Math.floor(id))
        )
      ).sort((a, b) => a - b);
      if (safeIds.length) {
        normalized[String(bankId)] = safeIds;
      }
    });
    return normalized;
  } catch (error) {
    return {};
  }
}

function persistAdminMarkedQuestionsState() {
  try {
    localStorage.setItem(ADMIN_MARKED_QUESTIONS_KEY, JSON.stringify(adminMarkedQuestionsByBank || {}));
  } catch (error) {
    // no-op
  }
}

function getMarkedQuestionIds(bankId) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const raw = adminMarkedQuestionsByBank?.[safeBankId];
  return Array.isArray(raw) ? raw : [];
}

function setMarkedQuestionIds(bankId, ids = []) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const safeIds = Array.from(
    new Set(
      (Array.isArray(ids) ? ids : [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
        .map((id) => Math.floor(id))
    )
  ).sort((a, b) => a - b);

  if (!safeIds.length) {
    delete adminMarkedQuestionsByBank[safeBankId];
  } else {
    adminMarkedQuestionsByBank[safeBankId] = safeIds;
  }
  persistAdminMarkedQuestionsState();
}

function toggleMarkedQuestion(bankId, questionId) {
  const safeId = normalizeQuestionId(questionId, 0);
  if (!safeId) return false;

  const current = getMarkedQuestionIds(bankId);
  const exists = current.includes(safeId);
  const next = exists
    ? current.filter((id) => id !== safeId)
    : [...current, safeId];
  setMarkedQuestionIds(bankId, next);
  return !exists;
}

function readAdminReviewedQuestionsState() {
  try {
    const raw = localStorage.getItem(ADMIN_REVIEWED_QUESTIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    const normalized = {};
    Object.entries(parsed).forEach(([bankId, ids]) => {
      if (!Array.isArray(ids)) return;
      const safeIds = Array.from(
        new Set(
          ids
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0)
            .map((id) => Math.floor(id))
        )
      ).sort((a, b) => a - b);
      if (safeIds.length) {
        normalized[String(bankId)] = safeIds;
      }
    });
    return normalized;
  } catch (error) {
    return {};
  }
}

function persistAdminReviewedQuestionsState() {
  try {
    localStorage.setItem(ADMIN_REVIEWED_QUESTIONS_KEY, JSON.stringify(adminReviewedQuestionsByBank || {}));
  } catch (error) {
    // no-op
  }
}

function getReviewedQuestionIds(bankId) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const raw = adminReviewedQuestionsByBank?.[safeBankId];
  return Array.isArray(raw) ? raw : [];
}

function setReviewedQuestionIds(bankId, ids = []) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const safeIds = Array.from(
    new Set(
      (Array.isArray(ids) ? ids : [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
        .map((id) => Math.floor(id))
    )
  ).sort((a, b) => a - b);

  if (!safeIds.length) {
    delete adminReviewedQuestionsByBank[safeBankId];
  } else {
    adminReviewedQuestionsByBank[safeBankId] = safeIds;
  }
  persistAdminReviewedQuestionsState();
}

function toggleReviewedQuestion(bankId, questionId) {
  const safeId = normalizeQuestionId(questionId, 0);
  if (!safeId) return false;

  const current = getReviewedQuestionIds(bankId);
  const exists = current.includes(safeId);
  const next = exists
    ? current.filter((id) => id !== safeId)
    : [...current, safeId];
  setReviewedQuestionIds(bankId, next);
  return !exists;
}

function isShowOnlyMarkedEnabled(bankId) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  return adminShowOnlyMarkedByBank[safeBankId] === true;
}

function cleanupEvaluationFlow() {
  if (typeof stopEvaluationTimerFn === "function") {
    stopEvaluationTimerFn();
    stopEvaluationTimerFn = null;
  }

  if (typeof evaluationFinishHandler === "function") {
    document.removeEventListener("sigwx:finish", evaluationFinishHandler);
    evaluationFinishHandler = null;
  }

  evaluationStartAtMs = null;
  evaluationRemainingSeconds = evaluationTotalSeconds;
  cleanupResizeHandlers();
  cleanupHomeModeCarousels();
}

function cleanupResizeHandlers() {
  if (mobileHeaderResizeHandler) {
    window.removeEventListener("resize", mobileHeaderResizeHandler);
    mobileHeaderResizeHandler = null;
  }

  if (homeSimuladosResizeHandler) {
    window.removeEventListener("resize", homeSimuladosResizeHandler);
    homeSimuladosResizeHandler = null;
  }

  if (simuladoNavResizeHandler) {
    window.removeEventListener("resize", simuladoNavResizeHandler);
    simuladoNavResizeHandler = null;
  }
}

function cleanupHomeModeCarousels() {
  homeModeCarouselCleanupFns.forEach((dispose) => {
    try {
      dispose();
    } catch (_) {
      // no-op
    }
  });
  homeModeCarouselCleanupFns = [];
}

function getQuestionBankConfig(bankId = "sigwx_training") {
  return QUESTION_BANK_BY_ID.get(bankId) || QUESTION_BANKS[0];
}

function normalizeQuestionId(rawId, fallback = 1) {
  const parsed = Number(rawId);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function normalizeQuestionForBank(bankId, rawQuestion = {}, index = 0) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const id = normalizeQuestionId(rawQuestion?.id, index + 1);
  const bankConfig = getQuestionBankConfig(safeBankId);
  const fallbackImage = String(bankConfig?.defaultImagePath || `${bankConfig.imageBasePath}/${id}.webp`);
  const sourceOptions = Array.isArray(rawQuestion?.options) ? rawQuestion.options : [];
  const options = [0, 1, 2, 3].map((pos) => String(sourceOptions[pos] ?? "").trim());
  const parsedCorrect = Number(rawQuestion?.correctIndex);

  return {
    id,
    image: String(rawQuestion?.image || fallbackImage).trim() || fallbackImage,
    question: String(rawQuestion?.question || "").trim(),
    options,
    correctIndex: Number.isFinite(parsedCorrect) ? Math.min(3, Math.max(0, Math.floor(parsedCorrect))) : 0,
    explanation: String(rawQuestion?.explanation || "").trim()
  };
}

function normalizeQuestionList(bankId, list = []) {
  const normalized = (Array.isArray(list) ? list : []).map((item, index) =>
    normalizeQuestionForBank(bankId, item, index)
  );
  normalized.sort((a, b) => a.id - b.id);
  return normalized;
}

function mergeQuestionLists(baseList = [], overrideList = []) {
  const mergedById = new Map();
  (Array.isArray(baseList) ? baseList : []).forEach((item) => {
    const id = normalizeQuestionId(item?.id, 0);
    if (!id) return;
    mergedById.set(id, item);
  });
  (Array.isArray(overrideList) ? overrideList : []).forEach((item) => {
    const id = normalizeQuestionId(item?.id, 0);
    if (!id) return;
    mergedById.set(id, item);
  });
  return Array.from(mergedById.values()).sort((a, b) => a.id - b.id);
}

function getQuestionBankCache(bankId) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  return Array.isArray(questionBanksCache[safeBankId]) ? questionBanksCache[safeBankId] : [];
}

function getNextQuestionIdForBank(bankId) {
  const list = getQuestionBankCache(bankId);
  if (!list.length) return 1;
  return list.reduce((maxId, item) => Math.max(maxId, normalizeQuestionId(item?.id, 1)), 0) + 1;
}

function createAdminQuestionDraft(bankId, base = {}) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const normalized = normalizeQuestionForBank(safeBankId, base, 0);
  return {
    ...normalized,
    bankId: safeBankId
  };
}

function createNewAdminQuestionDraft(bankId) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const nextId = getNextQuestionIdForBank(safeBankId);
  return createAdminQuestionDraft(safeBankId, {
    id: nextId,
    image: `${getQuestionBankConfig(safeBankId).imageBasePath}/${nextId}.webp`,
    options: ["", "", "", ""],
    correctIndex: 0
  });
}

function syncAdminQuestionEditor(bankId) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  if (adminQuestionEditorDraftMode && adminQuestionEditor) {
    return;
  }
  const bankList = getQuestionBankCache(safeBankId);
  const currentId = normalizeQuestionId(adminQuestionEditor?.id, 0);
  const selected = bankList.find((item) => item.id === currentId);

  if (selected) {
    adminQuestionEditor = createAdminQuestionDraft(safeBankId, selected);
    return;
  }

  if (bankList.length) {
    adminQuestionEditor = createAdminQuestionDraft(safeBankId, bankList[0]);
    return;
  }

  adminQuestionEditor = createNewAdminQuestionDraft(safeBankId);
}

async function ensureQuestionBankLoaded(bankId, { force = false, silent = false } = {}) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  if (!force && questionBankLoadedFlags[safeBankId]) {
    return getQuestionBankCache(safeBankId);
  }

  try {
    const remoteItems = await getQuestionsByBank(safeBankId);
    const normalizedRemote = normalizeQuestionList(safeBankId, remoteItems);
    const normalizedDefault = normalizeQuestionList(
      safeBankId,
      DEFAULT_QUESTION_BANKS[safeBankId] || []
    );
    if (normalizedRemote.length) {
      questionBanksCache[safeBankId] = mergeQuestionLists(normalizedDefault, normalizedRemote);
    } else {
      questionBanksCache[safeBankId] = normalizedDefault;
      if (!silent) {
        showToast("Banco vazio no Firestore. Exibindo questões locais atuais.", "info");
      }
    }
    questionBankLoadedFlags[safeBankId] = true;
  } catch (error) {
    console.warn(`Erro ao carregar banco ${safeBankId}:`, error);
    questionBanksCache[safeBankId] = normalizeQuestionList(
      safeBankId,
      DEFAULT_QUESTION_BANKS[safeBankId] || []
    );
    questionBankLoadedFlags[safeBankId] = false;
    if (!silent) {
      showToast("Não foi possível carregar questões atualizadas. Usando base local.", "info");
    }
  }

  return getQuestionBankCache(safeBankId);
}

async function preloadQuestionBanks() {
  for (const bank of QUESTION_BANKS) {
    try {
      await ensureQuestionBankLoaded(bank.id, { force: false, silent: true });
    } catch (_) {
      // segue para o próximo banco sem bloquear o fluxo
    }
  }
}

function getQuestionsForBankId(bankId = "sigwx_training") {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const cached = getQuestionBankCache(safeBankId);
  if (cached.length) return cached;
  return normalizeQuestionList(safeBankId, DEFAULT_QUESTION_BANKS[safeBankId] || []);
}

function getQuestionsForSimuladoMode(simuladoKey = "sigwx", mode = "training") {
  const safeSimuladoKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  const bankId = SIMULADO_BANKS[safeSimuladoKey][mode === "evaluation" ? "evaluation" : "training"];
  return getQuestionsForBankId(bankId);
}

function getSimuladoLabel(simuladoKey = "sigwx") {
  const safeSimuladoKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  return SIMULADO_BANKS[safeSimuladoKey].label || "Simulado";
}

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

async function fetchCreditHistoryPageFromApi({ pageSize = 8, cursor = null } = {}) {
  if (!currentUser) {
    throw new Error("auth_required");
  }

  const safePageSize = Number.isFinite(Number(pageSize))
    ? Math.max(1, Math.min(20, Math.floor(Number(pageSize))))
    : 8;
  const safeOffset = Number.isFinite(Number(cursor))
    ? Math.max(0, Math.floor(Number(cursor)))
    : 0;

  const token = await currentUser.getIdToken();
  const response = await fetchApiWithPathFallback(
    `/credits/history?pageSize=${safePageSize}&offset=${safeOffset}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const error = new Error(`credits_history_http_${response.status}`);
    error.code = `credits_history_http_${response.status}`;
    error.details = text;
    throw error;
  }

  const data = await response.json();
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    nextCursor: data?.nextCursor ?? null,
    hasMore: !!data?.hasMore
  };
}

async function fetchAdminMetricsFromApi({ range = "30d" } = {}) {
  if (!currentUser) {
    throw new Error("auth_required");
  }
  const safeRange = ["today", "7d", "30d"].includes(String(range || "").trim().toLowerCase())
    ? String(range).trim().toLowerCase()
    : "30d";
  const token = await currentUser.getIdToken();
  const response = await fetchApiWithPathFallback(
    `/admin/metrics?range=${encodeURIComponent(safeRange)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const error = new Error(`admin_metrics_http_${response.status}`);
    error.code = `admin_metrics_http_${response.status}`;
    error.details = text;
    throw error;
  }

  const data = await response.json();
  return data?.metrics || null;
}

function warmupApi() {
  if (!USE_BACKEND_CREDITS_API) return;
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

function escapeHtmlPrint(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAnswerLetter(index) {
  if (!Number.isFinite(Number(index))) return "-";
  return ["A", "B", "C", "D"][Number(index)] || "-";
}

function buildQuestionsPdfHtml({ bankLabel = "Banco", questions = [] } = {}) {
  const generatedAt = new Date().toLocaleString("pt-BR");
  const sections = (Array.isArray(questions) ? questions : [])
    .map((q, idx) => {
      const options = Array.isArray(q?.options) ? q.options : [];
      const optionsHtml = [0, 1, 2, 3]
        .map((pos) => `
          <li><strong>${formatAnswerLetter(pos)}.</strong> ${escapeHtmlPrint(options[pos] || "")}</li>
        `)
        .join("");

      const imageHtml = q?.image
        ? `<div class="q-image-wrap"><img src="${escapeHtmlPrint(String(q.image))}" alt="Questão ${idx + 1}" /></div>`
        : "";

      return `
        <article class="q-card">
          <header class="q-head">
            <h2>Questão #${Number(q?.id) || idx + 1}</h2>
          </header>
          ${imageHtml}
          <p class="q-title">${escapeHtmlPrint(q?.question || "")}</p>
          <ol class="q-options">
            ${optionsHtml}
          </ol>
          <p class="q-answer"><strong>Resposta correta:</strong> ${formatAnswerLetter(q?.correctIndex)}</p>
          <p class="q-explanation"><strong>Explicação:</strong> ${escapeHtmlPrint(q?.explanation || "")}</p>
        </article>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>PDF - ${escapeHtmlPrint(bankLabel)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      color: #111827;
      margin: 0;
      padding: 22px;
      background: #ffffff;
    }
    .doc-head {
      margin-bottom: 18px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .doc-head h1 {
      margin: 0;
      color: #0f2f5a;
      font-size: 22px;
    }
    .doc-head p {
      margin: 6px 0 0;
      color: #475569;
      font-size: 12px;
    }
    .q-card {
      border: 1px solid #dbe3ee;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .q-head h2 {
      margin: 0 0 8px;
      color: #1f4f8f;
      font-size: 16px;
    }
    .q-image-wrap {
      margin-bottom: 8px;
    }
    .q-image-wrap img {
      max-width: 320px;
      max-height: 220px;
      width: auto;
      height: auto;
      border: 1px solid #dbe3ee;
      border-radius: 6px;
      display: block;
    }
    .q-title {
      margin: 0 0 8px;
      font-size: 14px;
      line-height: 1.5;
    }
    .q-options {
      margin: 0 0 8px 20px;
      padding: 0;
      list-style: none;
    }
    .q-options li {
      margin: 4px 0;
      font-size: 13px;
      line-height: 1.45;
    }
    .q-answer, .q-explanation {
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 1.45;
    }
  </style>
</head>
<body>
  <header class="doc-head">
    <h1>${escapeHtmlPrint(bankLabel)} • Questões</h1>
    <p>Gerado em: ${escapeHtmlPrint(generatedAt)}</p>
  </header>
  ${sections}
</body>
</html>`;
}

function openQuestionsPdfWindow(bankId, questions = []) {
  const bank = getQuestionBankConfig(bankId);
  const bankLabel = bank?.label || "Banco de questões";
  const safeQuestions = Array.isArray(questions) ? questions : [];
  if (!safeQuestions.length) {
    showToast("Não há questões para gerar o PDF.", "error");
    return;
  }

  const win = window.open("", "_blank");
  if (!win) {
    showToast("Pop-up bloqueado. Permita pop-ups para gerar o PDF.", "error");
    return;
  }

  const html = buildQuestionsPdfHtml({ bankLabel, questions: safeQuestions });
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 350);
}

function startPresenceTracking() {
  if (!currentUser?.uid) return;
  stopPresenceTracking();

  const ping = async (online) => {
    if (!currentUser?.uid) return;
    try {
      await saveUserProfile(currentUser.uid, {
        isOnline: !!online,
        lastSeenAt: new Date().toISOString()
      });
    } catch (error) {
      // no-op: presença é best-effort
    }
  };

  ping(true);
  presenceHeartbeat = setInterval(() => {
    const isVisible = typeof document.hidden === "boolean" ? !document.hidden : true;
    ping(isVisible);
  }, PRESENCE_HEARTBEAT_MS);

  presenceVisibilityHandler = () => {
    const isVisible = !document.hidden;
    ping(isVisible);
  };
  document.addEventListener("visibilitychange", presenceVisibilityHandler);

  presencePageHideHandler = () => {
    ping(false);
  };
  window.addEventListener("pagehide", presencePageHideHandler);
}

function stopPresenceTracking({ setOffline = false, userId = "" } = {}) {
  if (presenceHeartbeat) {
    clearInterval(presenceHeartbeat);
    presenceHeartbeat = null;
  }
  if (presenceVisibilityHandler) {
    document.removeEventListener("visibilitychange", presenceVisibilityHandler);
    presenceVisibilityHandler = null;
  }
  if (presencePageHideHandler) {
    window.removeEventListener("pagehide", presencePageHideHandler);
    presencePageHideHandler = null;
  }

  const targetId = String(userId || currentUser?.uid || "").trim();
  if (!setOffline || !targetId) return;

  saveUserProfile(targetId, {
    isOnline: false,
    lastSeenAt: new Date().toISOString()
  }).catch(() => {
    // no-op: presença é best-effort
  });
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
  const navCreditsLink = document.getElementById("goCredits");
  const topCreditsLink = document.getElementById("goCreditsTop");
  const balance = getCreditsLabel();

  if (navCreditsLink) {
    navCreditsLink.textContent = currentUser ? `Créditos: ${balance ?? 0}` : "Créditos";
  }

  if (topCreditsLink) {
    topCreditsLink.textContent = currentUser ? `Créditos: ${balance ?? 0}` : "Créditos";
  }
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
  const packageId = String(item?.packageId || "").trim().toLowerCase();
  const packageLabel = packageId
    ? `${packageId.charAt(0).toUpperCase()}${packageId.slice(1)}`
    : "";

  let description = "Movimentação de créditos";
  let statusLabel = "Concluído";
  if (type === "purchase") {
    description = packageLabel ? `Entrada: pacote ${packageLabel}` : "Entrada: compra de pacote";
    statusLabel = "Aprovado";
  } else if (type === "reprocess") {
    description = packageLabel ? `Entrada: pacote ${packageLabel} (reprocessado)` : "Entrada: compra reprocessada";
    statusLabel = "Aprovado";
  } else if (type === "consume") {
    description = mode === "evaluation" ? "Saída: uso em avaliação" : "Saída: uso em treinamento";
    statusLabel = "Consumido";
  }

  let amountClass = "is-neutral";
  if (safeAmount > 0) amountClass = "is-positive";
  if (safeAmount < 0) amountClass = "is-negative";

  return {
    id: item?.id || "",
    rawType: type,
    dateLabel: date ? date.toLocaleString("pt-BR") : "&mdash;",
    description,
    amountLabel: safeAmount > 0 ? `+${safeAmount}` : `${safeAmount}`,
    amountClass,
    statusLabel
  };
}

async function grantWelcomeBonusIfNeeded(userId, profile = null) {
  if (!userId) return false;
  if (profile?.welcomeBonusGranted) return false;

  const credits = await getUserCredits(userId).catch(() => null);
  const currentBalance = parseCreditsBalance(credits?.balance) ?? 0;

  // If a credits doc already exists, only mark the flag to avoid duplicate bonus attempts.
  if (credits) {
    await saveUserProfile(userId, {
      welcomeBonusGranted: true,
      welcomeBonusGrantedAt: new Date().toISOString()
    });
    currentProfile = {
      ...(currentProfile || {}),
      ...(profile || {}),
      welcomeBonusGranted: true,
      welcomeBonusGrantedAt: new Date().toISOString()
    };
    currentCredits = applyLocalCreditsBalance(credits, true);
    return false;
  }

  const nextBalance = currentBalance + WELCOME_BONUS_CREDITS;

  try {
    await setUserCredits(userId, nextBalance);
    await saveUserProfile(userId, {
      welcomeBonusGranted: true,
      welcomeBonusGrantedAt: new Date().toISOString()
    });

    currentProfile = {
      ...(currentProfile || {}),
      ...(profile || {}),
      welcomeBonusGranted: true,
      welcomeBonusGrantedAt: new Date().toISOString()
    };
    currentCredits = applyLocalCreditsBalance({ ...(credits || {}), balance: nextBalance }, true);
    updateVisibleCreditsLabel();
    pendingWelcomeAnnouncement = [
      "Bem-vindo(a) ao PreFlight!",
      "",
      `Você ganhou ${WELCOME_BONUS_CREDITS} créditos para explorar e testar o site.`,
      "Use em treinos e avaliações para conhecer a plataforma.",
      "",
      "Se tiver qualquer dúvida, fale com a gente na página de contato.",
      "Quando quiser, você pode comprar mais créditos a qualquer momento."
    ].join("\n");
    showToast(`Você ganhou ${WELCOME_BONUS_CREDITS} créditos de boas-vindas.`, "success");
    return true;
  } catch (error) {
    console.warn("Welcome bonus grant failed:", error);
    return false;
  }
}

function showWelcomeAnnouncementIfPending() {
  if (!pendingWelcomeAnnouncement) return;
  const message = pendingWelcomeAnnouncement;
  pendingWelcomeAnnouncement = "";

  const existing = document.getElementById("welcomeBonusModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "welcomeBonusModal";
  modal.className = "evaluation-modal";
  modal.innerHTML = `
    <div class="evaluation-box">
      <h3>Mensagem de boas-vindas</h3>
      <div class="welcome-bonus-highlight">🎉 Você ganhou ${WELCOME_BONUS_CREDITS} créditos!</div>
      <p>${message.replace(/\n/g, "<br />")}</p>
      <div class="evaluation-actions">
        <button type="button" id="welcomeBonusOk">Entendi</button>
      </div>
    </div>
  `;

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.body.appendChild(modal);

  const okBtn = document.getElementById("welcomeBonusOk");
  okBtn?.addEventListener("click", close);
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
    const credits = await Promise.race([
      getUserCredits(currentUser.uid),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("credits_fetch_timeout")), CREDIT_API_TIMEOUT_MS)
      )
    ]);
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

function createTimeoutController(timeoutMs = CREDIT_API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch (_) {
      // no-op
    }
  }, Math.max(1000, Number(timeoutMs) || CREDIT_API_TIMEOUT_MS));
  return { controller, timeoutId };
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

  if (!USE_BACKEND_CREDITS_API) {
    const result = await consumeUserCredit(currentUser.uid, mode, requestId);
    const parsedBalance = Number(result?.balance);
    const safeBalance = Number.isFinite(parsedBalance) ? Math.max(0, Math.floor(parsedBalance)) : 0;
    currentCredits = {
      ...(currentCredits || {}),
      balance: safeBalance
    };
    writeLocalCreditsBalance(currentUser.uid, safeBalance, true);
    updateVisibleCreditsLabel();
    return safeBalance;
  }

  try {
    const token = await currentUser.getIdToken();
    const { controller, timeoutId } = createTimeoutController();
    let response;
    try {
      response = await fetchApiWithPathFallback("/consumeCredit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mode,
          requestId
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

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
    const balanceBefore = Math.max(safeBalance + 1, latestBalance ?? safeBalance + 1);
    currentCredits = {
      ...(currentCredits || {}),
      balance: safeBalance
    };
    try {
      await recordConsumeCreditTransaction(currentUser.uid, {
        mode,
        requestId,
        balanceBefore,
        balanceAfter: safeBalance
      });
    } catch (error) {
      // no-op: history write is best-effort and consume was already confirmed
    }
    writeLocalCreditsBalance(currentUser.uid, safeBalance, true);
    updateVisibleCreditsLabel();

    return safeBalance;
  } catch (error) {
    if (error?.code === "insufficient_credits" || error?.message === "insufficient_credits") {
      throw error;
    }

    const fallback = await Promise.race([
      consumeUserCredit(currentUser.uid, mode, requestId),
      new Promise((_, reject) =>
        setTimeout(() => {
          const timeoutError = new Error("consume_credit_timeout");
          timeoutError.code = "consume_credit_timeout";
          reject(timeoutError);
        }, CREDIT_API_TIMEOUT_MS)
      )
    ]);
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
  return startSimuladoWithCredit("sigwx", mode);
}

async function startMetarTafWithCredit(mode) {
  return startSimuladoWithCredit("metar_taf", mode);
}

async function startSimuladoWithCredit(simuladoKey = "sigwx", mode = "training") {
  if (!currentUser) {
    renderLogin();
    return;
  }
  const safeKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  if (safeKey === "sigwx") {
    if (mode === "evaluation") {
      renderSigwxEvaluation();
      return;
    }
    renderSigwx();
    return;
  }
  if (mode === "evaluation") {
    renderMetarTafEvaluation();
    return;
  }
  renderMetarTaf();
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

      const isTransientCreditsError =
        code.includes("timeout") ||
        code.includes("abort") ||
        code.includes("network") ||
        code.includes("failed to fetch");
      if (isTransientCreditsError) {
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
          showToast("Iniciado em modo contingência. Sincronize os créditos depois.", "info");
          return;
        }
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
  cleanupEvaluationFlow();
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
  setupHomePackagesButton();
  setupHomeModeCarousels();
  setupHomeSimuladosCards();
  setupHomeSimuladosCarousel();
  setupContact();
  setupFooterLinks();
}

function renderLogin() {
  cleanupEvaluationFlow();
  app.innerHTML = loginView({ isAdmin: isAdminUser(), userLabel: getUserLabel() });
  setupGlobalMenu();
  setupHeaderLogin();
  setupLoginForm();
  setupRegisterLink();
  setupContact();
  setupFooterLinks();
}

function renderRegister() {
  cleanupEvaluationFlow();
  app.innerHTML = registerView({ isAdmin: isAdminUser(), userLabel: getUserLabel() });
  setupGlobalMenu();
  setupHeaderLogin();
  setupRegisterForm();
  setupLoginLinkAlt();
  setupContact();
  setupFooterLinks();
}

function renderDashboard() {
  cleanupEvaluationFlow();
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
  cleanupEvaluationFlow();
  activeSimuladoKey = "sigwx";
  setSimuladoMode("training");
  app.innerHTML = sigwxView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel: getSimuladoLabel("sigwx")
  });

  requestAnimationFrame(async () => {
    // inicia de imediato com cache/local; se vazio, força carga antes de iniciar
    let questions = getQuestionsForSimuladoMode("sigwx", "training");
    if (!Array.isArray(questions) || !questions.length) {
      await ensureQuestionBankLoaded("sigwx_training", { force: false, silent: true });
      questions = getQuestionsForSimuladoMode("sigwx", "training");
    } else {
      ensureQuestionBankLoaded("sigwx_training", { force: false, silent: true }).catch(() => {});
    }
    startSigwxSimulado({ questions, questionBank: "training" });
    setupTrainingStartModal();
  });

  setupLogout();
  setupGlobalMenu();
  setupSimuladoNavToggle();
  setupContact();
  setupFooterLinks();
}

function renderSigwxEvaluation() {
  cleanupEvaluationFlow();
  activeSimuladoKey = "sigwx";
  setSimuladoMode("evaluation");
  app.innerHTML = sigwxEvaluationView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel: getSimuladoLabel("sigwx")
  });

  requestAnimationFrame(async () => {
    let questions = getQuestionsForSimuladoMode("sigwx", "evaluation");
    if (!Array.isArray(questions) || !questions.length) {
      await ensureQuestionBankLoaded("sigwx_evaluation", { force: false, silent: true });
      questions = getQuestionsForSimuladoMode("sigwx", "evaluation");
    } else {
      ensureQuestionBankLoaded("sigwx_evaluation", { force: false, silent: true }).catch(() => {});
    }
    startSigwxSimulado({ questions, questionBank: "evaluation" });
  });

  evaluationFinishHandler = (e) => {
    const isEvaluationMode = document.body.dataset.simuladoMode === "evaluation";
    const isEvaluationFinish = e?.detail?.questionBank === "evaluation";
    if (!isEvaluationMode || !isEvaluationFinish) return;

    if (typeof evaluationFinishHandler === "function") {
      document.removeEventListener("sigwx:finish", evaluationFinishHandler);
      evaluationFinishHandler = null;
    }
    renderSimuladoEvaluationResults(e.detail, { simuladoKey: "sigwx" });
  };
  document.addEventListener("sigwx:finish", evaluationFinishHandler);

  setupEvaluationAutoNext();
  setupEvaluationTimer();
  setupLogout();
  setupGlobalMenu();
  setupSimuladoNavToggle();
  setupContact();
  setupFooterLinks();
}

function renderMetarTaf() {
  cleanupEvaluationFlow();
  activeSimuladoKey = "metar_taf";
  setSimuladoMode("training");
  app.innerHTML = sigwxView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel: getSimuladoLabel("metar_taf")
  });

  requestAnimationFrame(async () => {
    let questions = getQuestionsForSimuladoMode("metar_taf", "training");
    if (!Array.isArray(questions) || !questions.length) {
      await ensureQuestionBankLoaded("metar_taf_training", { force: false, silent: true });
      questions = getQuestionsForSimuladoMode("metar_taf", "training");
    } else {
      ensureQuestionBankLoaded("metar_taf_training", { force: false, silent: true }).catch(() => {});
    }
    startSigwxSimulado({ questions, questionBank: "training" });
    setupTrainingStartModal();
  });

  setupLogout();
  setupGlobalMenu();
  setupSimuladoNavToggle();
  setupContact();
  setupFooterLinks();
}

function renderMetarTafEvaluation() {
  cleanupEvaluationFlow();
  activeSimuladoKey = "metar_taf";
  setSimuladoMode("evaluation");
  app.innerHTML = sigwxEvaluationView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel: getSimuladoLabel("metar_taf")
  });

  requestAnimationFrame(async () => {
    let questions = getQuestionsForSimuladoMode("metar_taf", "evaluation");
    if (!Array.isArray(questions) || !questions.length) {
      await ensureQuestionBankLoaded("metar_taf_evaluation", { force: false, silent: true });
      questions = getQuestionsForSimuladoMode("metar_taf", "evaluation");
    } else {
      ensureQuestionBankLoaded("metar_taf_evaluation", { force: false, silent: true }).catch(() => {});
    }
    startSigwxSimulado({ questions, questionBank: "evaluation" });
  });

  evaluationFinishHandler = (e) => {
    const isEvaluationMode = document.body.dataset.simuladoMode === "evaluation";
    const isEvaluationFinish = e?.detail?.questionBank === "evaluation";
    if (!isEvaluationMode || !isEvaluationFinish) return;

    if (typeof evaluationFinishHandler === "function") {
      document.removeEventListener("sigwx:finish", evaluationFinishHandler);
      evaluationFinishHandler = null;
    }
    renderSimuladoEvaluationResults(e.detail, { simuladoKey: "metar_taf" });
  };
  document.addEventListener("sigwx:finish", evaluationFinishHandler);

  setupEvaluationAutoNext();
  setupEvaluationTimer();
  setupLogout();
  setupGlobalMenu();
  setupSimuladoNavToggle();
  setupContact();
  setupFooterLinks();
}

function renderSimuladoEvaluationResults(detail, { simuladoKey = "sigwx" } = {}) {
  setSimuladoMode("evaluation-results");
  activeSimuladoKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  const simuladoLabel = getSimuladoLabel(activeSimuladoKey);

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

  const sessionQuestions =
    Array.isArray(detail?.questions) && detail.questions.length
      ? detail.questions
      : (detail?.questionBank === "evaluation"
        ? getQuestionsForSimuladoMode(activeSimuladoKey, "evaluation")
        : getQuestionsForSimuladoMode(activeSimuladoKey, "training")).slice(0, detail?.state?.length || 0);

  const answers = sessionQuestions.map((q, index) => {
    const st = detail.state[index];
    return {
      questionId: q.id,
      selectedIndex: st?.selected ?? null,
      options: st?.shuffledOptions
        ? st.shuffledOptions.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
        : []
    };
  });

  const items = sessionQuestions.map((q, index) => {
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
      explanation: q.explanation || "",
      isWrong: !st?.isCorrect
    };
  });

  app.innerHTML = sigwxEvaluationResultView({
    summary: { total, correct, wrong, answered, percentage, status, durationSeconds },
    items,
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel
  });

  saveEvaluationResult({
    simulado: simuladoLabel,
    percentage,
    correct,
    total,
    status,
    answers,
    durationSeconds,
    questionBank: detail?.questionBank === "evaluation" ? "evaluation" : "training"
  });

  setupEvaluationResultsActions(items, { simuladoKey: activeSimuladoKey });
  setupLogout();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

async function saveEvaluationResult({ simulado, percentage, correct, total, status, answers, durationSeconds, questionBank = "evaluation" }) {
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
      durationSeconds: safeDuration,
      questionBank
    });
  } catch (error) {
    console.error("Falha ao salvar avaliação:", error);
    alert("Falha ao salvar a avaliação. Verifique as regras do Firestore.");
  }
}

function setupEvaluationResultsActions(items, { simuladoKey = "sigwx" } = {}) {
  const safeKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  const toTrainingBtn = document.getElementById("evalToTraining");
  const retryBtn = document.getElementById("evalRetry");

  toTrainingBtn?.addEventListener("click", () => {
    startSimuladoWithCredit(safeKey, "training");
  });

  retryBtn?.addEventListener("click", () => {
    startSimuladoWithCredit(safeKey, "evaluation");
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
        subjectInput.value = `Erro na questão ${index} (${getSimuladoLabel(safeKey)} - Avaliação)`;
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
  document.body.dataset.simuladoKey = activeSimuladoKey;
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
        document.dispatchEvent(
          new CustomEvent("sigwx:force-finish", {
            detail: { reason: "timer_expired" }
          })
        );
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

      const isTransientCreditsError =
        code.includes("timeout") ||
        code.includes("abort") ||
        code.includes("network") ||
        code.includes("failed to fetch");
      if (isTransientCreditsError) {
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
          showToast("Iniciado em modo contingência. Sincronize os créditos depois.", "info");
          return;
        }
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

  const handleEvaluationFinish = (e) => {
    if (e?.detail?.questionBank !== "evaluation") return;
    stopTimer();
    document.removeEventListener("sigwx:finish", handleEvaluationFinish);
    if (stopEvaluationTimerFn === cleanupTimer) {
      stopEvaluationTimerFn = null;
    }
  };

  const cleanupTimer = () => {
    stopTimer();
    document.removeEventListener("sigwx:finish", handleEvaluationFinish);
    if (stopEvaluationTimerFn === cleanupTimer) {
      stopEvaluationTimerFn = null;
    }
  };

  stopEvaluationTimerFn = cleanupTimer;
  document.addEventListener("sigwx:finish", handleEvaluationFinish);
}

function renderPrivacy() {
  cleanupEvaluationFlow();
  app.innerHTML = privacyView({ logged: !!currentUser, isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

function renderCookies() {
  cleanupEvaluationFlow();
  app.innerHTML = cookiesView({ logged: !!currentUser, isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

function renderContact() {
  cleanupEvaluationFlow();
  app.innerHTML = contactView({ logged: !!currentUser, isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

function renderProfileScreen({ profile = null, evaluations = [], loading = false } = {}) {
  cleanupEvaluationFlow();
  app.innerHTML = profileView({
    user: currentUser,
    profile,
    evaluations,
    loading,
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    creditHistoryItems: creditHistoryItems.map(formatCreditHistoryItem),
    creditHistoryLoading: creditHistoryLoading,
    creditHistoryLoadingMore: creditHistoryLoadingMore,
    creditHistoryHasMore: creditHistoryHasMore,
    creditHistoryError: creditHistoryError,
    showAllEvaluations: profileShowAllEvaluations,
    visibleSpentCredits: profileVisibleSpentCredits,
    globalNotice: globalNoticeMessage
  });
}

function bindProfileScreenActions(profile, evaluations) {
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupProfileActions(evaluations);
  setupProfileForm(profile);
  setupProfileFilters();
  setupCreditsActions();
  setupCreditsHistoryActions();
  restoreCreditsStatus();
}

function rerenderProfileFromCache() {
  renderProfileScreen({
    profile: currentProfile,
    evaluations: profileEvaluationsCache,
    loading: false
  });
  bindProfileScreenActions(currentProfile, profileEvaluationsCache);
}

function getLoadedSpentCreditsCount() {
  return creditHistoryItems.length;
}

async function renderProfile() {
  creditHistoryLoading = true;
  creditHistoryLoadingMore = false;
  creditHistoryHasMore = false;
  creditHistoryItems = [];
  creditHistoryCursor = null;
  creditHistoryError = "";
  profileShowAllEvaluations = false;
  profileVisibleSpentCredits = 7;

  renderProfileScreen({ profile: currentProfile, evaluations: [], loading: true });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();

  if (!currentUser) return;

  const [evaluationsResult, profileResult, creditsResult, historyResult, globalNoticeResult] = await Promise.allSettled([
    getEvaluationsByUser(currentUser.uid),
    getUserProfile(currentUser.uid),
    getUserCredits(currentUser.uid),
    loadCreditHistoryPage({ append: false }),
    getGlobalNotice()
  ]);

  if (evaluationsResult.status === "fulfilled") {
    profileEvaluationsCache = evaluationsResult.value || [];
  } else {
    profileEvaluationsCache = [];
    console.error("Erro ao carregar avaliações:", evaluationsResult.reason);
  }

  if (profileResult.status === "fulfilled") {
    currentProfile = profileResult.value || null;
  } else {
    currentProfile = null;
    console.error("Erro ao carregar perfil:", profileResult.reason);
  }

  if (creditsResult.status === "fulfilled") {
    currentCredits = applyLocalCreditsBalance(creditsResult.value || { balance: 0 }, true);
  } else {
    currentCredits = applyLocalCreditsBalance(currentCredits || { balance: 0 }, false);
    console.warn("PreFlight credits fetch failed for uid:", currentUser.uid);
  }

  if (historyResult.status === "rejected") {
    console.warn("PreFlight credits history fetch failed:", historyResult.reason);
    if (!creditHistoryItems.length) {
      creditHistoryError = "Não foi possível carregar o histórico agora.";
    } else {
      creditHistoryError = "";
      showToast("Histórico atualizado parcialmente. Tentaremos novamente.", "info");
    }
  }

  if (globalNoticeResult.status === "fulfilled") {
    globalNoticeMessage = String(globalNoticeResult.value?.message || "").trim();
  } else {
    globalNoticeMessage = "";
    console.warn("PreFlight global notice fetch failed:", globalNoticeResult.reason);
  }

  creditHistoryLoading = false;
  renderProfileScreen({ profile: currentProfile, evaluations: profileEvaluationsCache, loading: false });
  bindProfileScreenActions(currentProfile, profileEvaluationsCache);
  showWelcomeAnnouncementIfPending();
}

async function renderAdmin() {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }
  adminPanelScreen = "dashboard";

  app.innerHTML = adminView({
    users: [],
    loading: true,
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    metrics: enrichAdminMetrics(
      computeAdminMetrics({ users: [], evaluations: [], transactions: [], range: adminMetricsRange })
    ),
    metricsRange: adminMetricsRange,
    lightMode: adminLightMode
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();

  try {
    const [users, globalNotice, allCredits] = await Promise.all([
      getAllUsers(),
      getGlobalNotice().catch(() => null),
      getAllCredits().catch(() => [])
    ]);
    globalNoticeMessage = String(globalNotice?.message || "").trim();
    let metricsFromApi = null;
    try {
      metricsFromApi = await fetchAdminMetricsFromApi({ range: adminMetricsRange });
    } catch (metricsError) {
      console.warn("Admin metrics API failed, falling back to client compute:", metricsError);
      const [allEvaluations, allTransactions] = await Promise.all([
        getAllEvaluations().catch(() => []),
        getAllCreditTransactions().catch(() => [])
      ]);
      adminMetricsData = {
        evaluations: Array.isArray(allEvaluations) ? allEvaluations : [],
        transactions: Array.isArray(allTransactions) ? allTransactions : []
      };
    }
    const creditsMap = new Map(
      (Array.isArray(allCredits) ? allCredits : []).map((item) => {
        const id = String(item?.id || "").trim();
        return [id, item];
      })
    );
    const userDetails = await Promise.all(
      users.map(async (u) => {
        const targetId = u.uid || u.id;
        const credit = creditsMap.get(targetId) || null;
        const sessions = adminLightMode
          ? { trainingCount: null, evaluationCount: null }
          : await getUserSessionCounts(targetId).catch(() => ({ trainingCount: 0, evaluationCount: 0 }));
        return { targetId, credit, sessions };
      })
    );
    const creditsList = userDetails.map((item) => item.credit || creditsMap.get(item.targetId) || null);

    if (!adminNormalizedOnce) {
      const normalized = await normalizeDuplicateUsers(users, creditsList);
      adminNormalizedOnce = true;
      if (normalized) {
        await renderAdmin();
        return;
      }
    }

    adminUsersCache = users.map((u, index) => {
      const item = userDetails[index] || {};
      const credit = item.credit;
      const sessions = item.sessions || { trainingCount: 0, evaluationCount: 0 };
      const rawBalance = credit?.balance ?? credit?.credits ?? credit?.saldo ?? 0;
      const targetId = item.targetId || u.uid || u.id;
      const balance = getEffectiveBalanceForUser(targetId, rawBalance);
      return {
        ...u,
        creditsBalance: Number.isFinite(balance) ? balance : 0,
        trainingCount: Number.isFinite(Number(sessions.trainingCount)) ? Number(sessions.trainingCount) : 0,
        evaluationCount: Number.isFinite(Number(sessions.evaluationCount)) ? Number(sessions.evaluationCount) : 0
      };
    });
    const notice =
      adminUsersCache.length === 0
        ? "Nenhum usuário retornado. Verifique se há usuários cadastrados."
        : "";
    const metrics = enrichAdminMetrics(metricsFromApi || computeAdminMetrics({
      users: adminUsersCache,
      evaluations: adminMetricsData.evaluations,
      transactions: adminMetricsData.transactions,
      range: adminMetricsRange
    }));
    adminMetricsSummary = metrics;
    app.innerHTML = adminView({
      users: adminUsersCache,
      loading: false,
      isAdmin: true,
      userLabel: getUserLabel(),
      credits: getCreditsLabel(),
      notice,
      globalNotice: globalNoticeMessage,
      metrics,
      metricsRange: adminMetricsRange,
      lightMode: adminLightMode
    });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
    setupAdminActions();
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    adminMetricsSummary = null;
    app.innerHTML = adminView({
      users: [],
      loading: false,
      isAdmin: true,
      userLabel: getUserLabel(),
      credits: getCreditsLabel(),
      notice: "Erro ao carregar usuários. Verifique as regras do Firestore.",
      globalNotice: globalNoticeMessage,
      metrics: enrichAdminMetrics(computeAdminMetrics({
        users: [],
        evaluations: adminMetricsData.evaluations,
        transactions: adminMetricsData.transactions,
        range: adminMetricsRange
      })),
      metricsRange: adminMetricsRange,
      lightMode: adminLightMode
    });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
  }
}

async function renderAdminQuestionHub() {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }
  adminPanelScreen = "question_hub";
  app.innerHTML = adminQuestionHubView({
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel()
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupAdminQuestionHubActions();
}

async function renderAdminQuestionEditor(bankId = null) {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }
  adminPanelScreen = "question_editor";
  if (bankId) {
    adminQuestionBank = getQuestionBankConfig(bankId).id;
  }
  await ensureQuestionBankLoaded(adminQuestionBank, { force: false, silent: true });
  syncAdminQuestionEditor(adminQuestionBank);
  rerenderAdminWithCache();
}

function rerenderAdminWithCache(notice = "") {
  if (!isAdminUser()) return;

  if (adminPanelScreen === "question_hub") {
    app.innerHTML = adminQuestionHubView({
      isAdmin: true,
      userLabel: getUserLabel(),
      credits: getCreditsLabel()
    });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
    setupAdminQuestionHubActions();
    return;
  }

  if (adminPanelScreen === "question_editor") {
    syncAdminQuestionEditor(adminQuestionBank);
    app.innerHTML = adminQuestionEditorView({
      isAdmin: true,
      userLabel: getUserLabel(),
      credits: getCreditsLabel(),
      questionBanks: QUESTION_BANKS,
      selectedQuestionBank: adminQuestionBank,
      questionItems: getQuestionBankCache(adminQuestionBank),
      questionEditor: adminQuestionEditor,
      markedQuestionIds: getMarkedQuestionIds(adminQuestionBank),
      reviewedQuestionIds: getReviewedQuestionIds(adminQuestionBank),
      showOnlyMarked: isShowOnlyMarkedEnabled(adminQuestionBank),
      autoNextOnSave: adminAutoNextOnSave
    });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
    setupAdminActions();
    return;
  }

  syncAdminQuestionEditor(adminQuestionBank);
  const metrics = enrichAdminMetrics(adminMetricsSummary || computeAdminMetrics({
    users: adminUsersCache,
    evaluations: adminMetricsData.evaluations,
    transactions: adminMetricsData.transactions,
    range: adminMetricsRange
  }));
  app.innerHTML = adminView({
    users: adminUsersCache,
    loading: false,
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    notice,
    globalNotice: globalNoticeMessage,
    metrics,
    metricsRange: adminMetricsRange,
    lightMode: adminLightMode
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupAdminActions();
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
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (value._seconds) return new Date(value._seconds * 1000);
  return null;
}

function getMetricsRangeStart(range = "30d") {
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

function normalizeQuestionLabel(questionId = "") {
  const text = String(questionId || "").trim();
  if (!text) return "Questão";
  const compact = text.replace(/[_\s]+/g, "-");
  return compact.length > 24 ? `${compact.slice(0, 24)}...` : compact;
}

function computeQuestionCatalogMetrics() {
  let trainingQuestions = 0;
  let evaluationQuestions = 0;

  QUESTION_BANKS.forEach((bank) => {
    const id = String(bank?.id || "");
    const count = getQuestionsForBankId(id).length;
    if (id.endsWith("_training")) trainingQuestions += count;
    if (id.endsWith("_evaluation")) evaluationQuestions += count;
  });

  return {
    trainingQuestions,
    evaluationQuestions,
    totalQuestions: trainingQuestions + evaluationQuestions
  };
}

function enrichAdminMetrics(metrics = {}) {
  return {
    ...(metrics || {}),
    ...computeQuestionCatalogMetrics()
  };
}

function computeAdminMetrics({
  users = [],
  evaluations = [],
  transactions = [],
  range = "30d"
} = {}) {
  const startAt = getMetricsRangeStart(range);
  const startMs = startAt.getTime();
  const safeEvaluations = Array.isArray(evaluations) ? evaluations : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const activeUserIds = new Set();
  const currentUserIds = new Set(
    (Array.isArray(users) ? users : [])
      .map((u) => String(u?.uid || u?.id || "").trim())
      .filter(Boolean)
  );
  const historicalUserIds = new Set(currentUserIds);

  safeEvaluations.forEach((ev) => {
    const uid = String(ev?.userId || "").trim();
    if (uid) historicalUserIds.add(uid);
  });
  safeTransactions.forEach((tx) => {
    const uid = String(tx?.userId || "").trim();
    if (uid) historicalUserIds.add(uid);
  });

  const periodEvaluations = safeEvaluations.filter((ev) => {
    const createdAt = parseDateValue(ev?.createdAt);
    const inRange = createdAt && createdAt.getTime() >= startMs;
    if (inRange && ev?.userId) {
      activeUserIds.add(String(ev.userId));
    }
    return inRange;
  });

  const periodTransactions = safeTransactions.filter((tx) => {
    const createdAt = parseDateValue(tx?.createdAt);
    const inRange = createdAt && createdAt.getTime() >= startMs;
    if (inRange && tx?.userId) {
      activeUserIds.add(String(tx.userId));
    }
    return inRange;
  });

  let trainingStarted = 0;
  let creditsConsumed = 0;
  let creditsPurchased = 0;

  periodTransactions.forEach((tx) => {
    const type = String(tx?.type || "").toLowerCase();
    const mode = String(tx?.mode || "").toLowerCase();
    const amount = Number(tx?.amount);
    const safeAmount = Number.isFinite(amount) ? Math.trunc(amount) : 0;

    if (type === "consume" || safeAmount < 0) {
      creditsConsumed += Math.abs(safeAmount || 1);
      if (mode === "training") trainingStarted += 1;
    }
    if (type === "purchase" || type === "reprocess" || safeAmount > 0) {
      creditsPurchased += Math.max(0, safeAmount);
    }
  });

  const evaluationsCompleted = periodEvaluations.length;
  const approved = periodEvaluations.filter((ev) => String(ev?.status || "").toLowerCase() === "aprovado").length;
  const approvalRate = evaluationsCompleted ? Math.round((approved / evaluationsCompleted) * 100) : 0;

  const questionErrors = new Map();
  periodEvaluations.forEach((ev) => {
    const answers = Array.isArray(ev?.answers) ? ev.answers : [];
    answers.forEach((answer) => {
      const selectedIndex = Number(answer?.selectedIndex);
      const options = Array.isArray(answer?.options) ? answer.options : [];
      if (!Number.isFinite(selectedIndex) || selectedIndex < 0) return;
      const selected = options[selectedIndex];
      if (!selected || selected.isCorrect) return;
      const qid = normalizeQuestionLabel(answer?.questionId || "questao");
      questionErrors.set(qid, (questionErrors.get(qid) || 0) + 1);
    });
  });

  const topErrors = Array.from(questionErrors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([qid, count]) => `${qid} (${count})`);

  let activeCurrentUsers = 0;
  activeUserIds.forEach((uid) => {
    if (currentUserIds.has(uid)) activeCurrentUsers += 1;
  });
  const onlineWindowMs = 2 * 60 * 1000;
  const nowMs = Date.now();
  const onlineNow = (Array.isArray(users) ? users : []).reduce((acc, u) => {
    if (!u?.isOnline) return acc;
    const seen = parseDateValue(u?.lastSeenAt);
    if (!seen) return acc;
    return nowMs - seen.getTime() <= onlineWindowMs ? acc + 1 : acc;
  }, 0);

  return {
    totalUsersCurrent: currentUserIds.size,
    totalUsersHistorical: historicalUserIds.size,
    activeUsers: activeCurrentUsers,
    onlineNow,
    trainingStarted,
    evaluationsCompleted,
    approvalRate,
    creditsConsumed,
    creditsPurchased,
    topErrors
  };
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
  cleanupEvaluationFlow();
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

  let page;
  if (USE_BACKEND_CREDITS_API) {
    try {
      page = await fetchCreditHistoryPageFromApi({
        pageSize: CREDITS_HISTORY_PAGE_SIZE,
        cursor: append ? creditHistoryCursor : null
      });
    } catch (apiError) {
      page = await getUserCreditTransactionsPage(currentUser.uid, {
        pageSize: CREDITS_HISTORY_PAGE_SIZE,
        cursor: append ? creditHistoryCursor : null
      });
    }
  } else {
    page = await getUserCreditTransactionsPage(currentUser.uid, {
      pageSize: CREDITS_HISTORY_PAGE_SIZE,
      cursor: append ? creditHistoryCursor : null
    });
  }

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
  renderProfile().then(() => {
    const section = document.getElementById("profileCreditsSection");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function renderPackages() {
  cleanupEvaluationFlow();
  if (!currentUser) {
    renderLogin();
    return;
  }

  app.innerHTML = packagesView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel()
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupPackagesActions();
}

function setupPackagesActions() {
  const modal = document.getElementById("packagesCheckoutModal");
  const cancelBtn = document.getElementById("packagesCheckoutCancel");
  const confirmBtn = document.getElementById("packagesCheckoutConfirm");
  const textEl = document.getElementById("packagesCheckoutText");
  let selectedPackage = null;

  const openModal = () => {
    if (!modal) return;
    modal.classList.remove("hidden");
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add("hidden");
  };

  const prepareCheckout = (sourceEl) => {
    const packageId = String(sourceEl?.getAttribute("data-package-id") || "").trim().toLowerCase();
    const packageName = String(sourceEl?.getAttribute("data-package-name") || "").trim() || "pacote";
    if (!CREDIT_PACKS[packageId]) {
      showToast("Pacote inválido.", "error");
      return false;
    }

    selectedPackage = { id: packageId, name: packageName };
    if (textEl) {
      textEl.textContent = `Você está escolhendo o pacote ${packageName}. O pagamento será aberto em nova aba no Mercado Pago.`;
    }
    openModal();
    return true;
  };

  const startPackageCheckout = async () => {
    if (!selectedPackage) return;
    const sourceButton = document.querySelector(`.package-buy-btn[data-package-id="${selectedPackage.id}"]`);
    const defaultText = sourceButton?.innerText || "";
    if (sourceButton) {
      sourceButton.disabled = true;
      sourceButton.innerText = "Abrindo pagamento...";
    }
    if (confirmBtn) confirmBtn.disabled = true;
    if (cancelBtn) cancelBtn.disabled = true;
    try {
      const opened = await startCreditsCheckout(selectedPackage.id);
      if (opened) {
        showToast(`Pacote ${selectedPackage.name}: pagamento aberto em nova aba no Mercado Pago. Depois volte ao perfil e atualize os créditos.`, "info");
        closeModal();
      }
    } finally {
      if (sourceButton) {
        sourceButton.disabled = false;
        sourceButton.innerText = defaultText;
      }
      if (confirmBtn) confirmBtn.disabled = false;
      if (cancelBtn) cancelBtn.disabled = false;
    }
  };

  document.querySelectorAll(".package-card[data-package-id]").forEach((card) => {
    card.addEventListener("click", () => {
      prepareCheckout(card);
    });
  });

  document.querySelectorAll(".package-buy-btn[data-package-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      prepareCheckout(btn);
    });
  });

  cancelBtn?.addEventListener("click", () => {
    closeModal();
  });

  confirmBtn?.addEventListener("click", async () => {
    await startPackageCheckout();
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
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

  const showAllBtn = document.getElementById("profileShowAllEvals");
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      profileShowAllEvaluations = true;
      rerenderProfileFromCache();
    });
  }
}

function setupProfileFilters() {
  const buttons = document.querySelectorAll("[data-profile-filter]");
  const cards = document.querySelectorAll("[data-profile-status]");
  if (!buttons.length || !cards.length) return;

  const applyFilter = (filter) => {
    cards.forEach((card) => {
      const status = card.getAttribute("data-profile-status");
      const isExtra = card.getAttribute("data-profile-extra") === "true";
      const matchesFilter = filter === "all" || status === filter;
      const show = matchesFilter && (profileShowAllEvaluations || !isExtra);
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
    deleteBtn.addEventListener("click", () => {
      if (!currentUser) return;
      const name = currentProfile?.name || currentUser.displayName || "";
      const email = currentUser.email || "";
      renderContact();

      const nameInput = document.getElementById("contactName");
      const emailInput = document.getElementById("contactEmail");
      const subjectInput = document.getElementById("contactSubject");
      const messageInput = document.getElementById("contactMessage");

      if (nameInput && !nameInput.value) nameInput.value = name;
      if (emailInput && !emailInput.value) emailInput.value = email;
      if (subjectInput) subjectInput.value = "Solicitação de exclusão de conta";
      if (messageInput) {
        messageInput.value = [
          "Olá, gostaria de solicitar a exclusão da minha conta.",
          "",
          `Nome: ${name || "-"}`,
          `Email: ${email || "-"}`
        ].join("\n");
      }
      showToast("Envie a solicitação de exclusão pelo formulário de contato.", "info");
    });
  }
}

function setupAdminActions() {
  const goAdminQuestionsPageBtn = document.getElementById("goAdminQuestionsPage");
  const adminQuestionEditorBackBtn = document.getElementById("adminQuestionEditorBack");
  const searchInput = document.getElementById("adminSearch");
  const roleSelect = document.getElementById("adminRole");
  const exportBtn = document.getElementById("adminExport");
  const refreshBtn = document.getElementById("adminRefresh");
  const noticeInput = document.getElementById("adminGlobalNotice");
  const noticeSaveBtn = document.getElementById("adminGlobalNoticeSave");
  const rangeButtons = document.querySelectorAll("[data-metrics-range]");
  const lightModeBtn = document.getElementById("adminLightModeToggle");

  goAdminQuestionsPageBtn?.addEventListener("click", () => {
    renderAdminQuestionHub();
  });

  adminQuestionEditorBackBtn?.addEventListener("click", () => {
    renderAdminQuestionHub();
  });

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

  rangeButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const nextRange = String(btn.getAttribute("data-metrics-range") || "").trim();
      if (!nextRange || nextRange === adminMetricsRange) return;
      rangeButtons.forEach((b) => (b.disabled = true));
      adminMetricsRange = nextRange;
      try {
        const metrics = await fetchAdminMetricsFromApi({ range: adminMetricsRange });
        if (metrics) {
          adminMetricsSummary = enrichAdminMetrics(metrics);
          rerenderAdminWithCache();
          return;
        }
      } catch (error) {
        console.warn("Admin metrics refresh failed:", error);
      } finally {
        rangeButtons.forEach((b) => (b.disabled = false));
      }

      adminMetricsSummary = enrichAdminMetrics(computeAdminMetrics({
        users: adminUsersCache,
        evaluations: adminMetricsData.evaluations,
        transactions: adminMetricsData.transactions,
        range: adminMetricsRange
      }));
      rerenderAdminWithCache();
    });
  });

  lightModeBtn?.addEventListener("click", () => {
    adminLightMode = !adminLightMode;
    localStorage.setItem(ADMIN_LIGHT_MODE_KEY, adminLightMode ? "1" : "0");
    adminMetricsSummary = null;
    renderAdmin();
  });

  exportBtn?.addEventListener("click", () => {
    const rows = adminUsersCache.map((u) => ({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "",
      whatsapp: u.whatsapp || "",
      creditsBalance: Number.isFinite(u.creditsBalance) ? u.creditsBalance : 0,
      trainingCount: Number.isFinite(Number(u.trainingCount)) ? Number(u.trainingCount) : 0,
      evaluationCount: Number.isFinite(Number(u.evaluationCount)) ? Number(u.evaluationCount) : 0,
      createdAt: u.createdAt && u.createdAt.toDate
        ? u.createdAt.toDate().toISOString()
        : u.createdAt || ""
    }));

    const header = ["name", "email", "role", "whatsapp", "creditsBalance", "trainingCount", "evaluationCount", "createdAt"];
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

  noticeSaveBtn?.addEventListener("click", async () => {
    const message = String(noticeInput?.value || "").trim();
    noticeSaveBtn.disabled = true;
    const prev = noticeSaveBtn.innerText;
    noticeSaveBtn.innerText = "Salvando...";
    try {
      await setGlobalNotice(message, currentUser?.email || "");
      globalNoticeMessage = message;
      showToast("Mural de avisos atualizado.", "success");
    } catch (error) {
      console.error("Erro ao salvar aviso global:", error);
      showToast("Não foi possível salvar o aviso.", "error");
    } finally {
      noticeSaveBtn.disabled = false;
      noticeSaveBtn.innerText = prev;
    }
  });

  const questionPdfBtn = document.getElementById("adminQuestionPdf");
  const questionReloadBtn = document.getElementById("adminQuestionReload");
  const questionNewBtn = document.getElementById("adminQuestionNew");
  const questionOnlyMarkedBtn = document.getElementById("adminQuestionOnlyMarked");
  const questionSaveBtn = document.getElementById("adminQuestionSave");
  const questionDeleteBtn = document.getElementById("adminQuestionDelete");
  const questionMarkToggleBtn = document.getElementById("adminQuestionMarkToggle");
  const questionReviewedToggleBtn = document.getElementById("adminQuestionReviewedToggle");
  const questionAutoNextOnSaveInput = document.getElementById("adminQuestionAutoNextOnSave");
  const questionMarkedClearBtn = document.getElementById("adminQuestionMarkedClear");
  const questionPrevBtn = document.getElementById("adminQuestionPrev");
  const questionNextBtn = document.getElementById("adminQuestionNext");
  const questionIdInput = document.getElementById("adminQuestionId");
  const questionImageInput = document.getElementById("adminQuestionImage");
  const questionTextInput = document.getElementById("adminQuestionText");
  const questionCorrectSelect = document.getElementById("adminQuestionCorrect");
  const questionExplanationInput = document.getElementById("adminQuestionExplanation");
  const questionOptionInputs = [0, 1, 2, 3].map((idx) =>
    document.getElementById(`adminQuestionOption${idx}`)
  );
  const questionListEl = document.querySelector(".admin-question-list");
  const activeQuestionEl = questionListEl?.querySelector(".admin-question-item.active");

  if (questionListEl && activeQuestionEl) {
    requestAnimationFrame(() => {
      activeQuestionEl.scrollIntoView({
        block: "nearest",
        inline: "nearest"
      });
    });
  }

  const readQuestionForm = () => {
    const parsedId = Number(questionIdInput?.value);
    const hasValidId = Number.isFinite(parsedId) && parsedId > 0;
    const safeId = hasValidId ? Math.floor(parsedId) : 0;
    const parsedCorrect = Number(questionCorrectSelect?.value);
    const draft = createAdminQuestionDraft(adminQuestionBank, {
      id: hasValidId ? safeId : getNextQuestionIdForBank(adminQuestionBank),
      image: String(questionImageInput?.value || "").trim(),
      question: String(questionTextInput?.value || "").trim(),
      options: questionOptionInputs.map((input) => String(input?.value || "").trim()),
      correctIndex: Number.isFinite(parsedCorrect) ? Math.max(0, Math.min(3, Math.floor(parsedCorrect))) : 0,
      explanation: String(questionExplanationInput?.value || "").trim()
    });
    draft.id = safeId;
    return draft;
  };

  const getVisibleQuestionList = () => {
    const allItems = getQuestionBankCache(adminQuestionBank);
    if (!isShowOnlyMarkedEnabled(adminQuestionBank)) return allItems;
    const markedSet = new Set(getMarkedQuestionIds(adminQuestionBank));
    return allItems.filter((item) => markedSet.has(Number(item?.id)));
  };

  const selectQuestionInEditor = (questionId) => {
    const safeId = normalizeQuestionId(questionId, 0);
    const bankList = getQuestionBankCache(adminQuestionBank);
    const target = bankList.find((item) => item.id === safeId);
    if (!target) {
      showToast("Questão não encontrada neste banco.", "error");
      return;
    }
    adminQuestionEditorDraftMode = false;
    adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, target);
    rerenderAdminWithCache();
  };

  const goToRelativeQuestion = (direction = 1) => {
    const bankList = getVisibleQuestionList();
    if (!bankList.length) return;
    const currentId = normalizeQuestionId(adminQuestionEditor?.id, 0);
    const currentIndex = bankList.findIndex((item) => item.id === currentId);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= bankList.length) return;
    adminQuestionEditorDraftMode = false;
    adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, bankList[nextIndex]);
    rerenderAdminWithCache();
  };

  questionAutoNextOnSaveInput?.addEventListener("change", () => {
    adminAutoNextOnSave = !!questionAutoNextOnSaveInput.checked;
    localStorage.setItem(ADMIN_AUTO_NEXT_ON_SAVE_KEY, adminAutoNextOnSave ? "1" : "0");
  });

  questionOnlyMarkedBtn?.addEventListener("click", () => {
    const safeBankId = getQuestionBankConfig(adminQuestionBank).id;
    adminShowOnlyMarkedByBank[safeBankId] = !isShowOnlyMarkedEnabled(safeBankId);

    const visible = getVisibleQuestionList();
    if (!visible.length && isShowOnlyMarkedEnabled(safeBankId)) {
      showToast("Nenhuma questão marcada neste banco.", "info");
    }
    if (visible.length) {
      const currentId = normalizeQuestionId(adminQuestionEditor?.id, 0);
      const exists = visible.some((item) => item.id === currentId);
      if (!exists) {
        adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, visible[0]);
      }
    }
    rerenderAdminWithCache();
  });

  questionPdfBtn?.addEventListener("click", () => {
    openQuestionsPdfWindow(adminQuestionBank, getQuestionBankCache(adminQuestionBank));
  });

  questionReloadBtn?.addEventListener("click", async () => {
    questionReloadBtn.disabled = true;
    const prev = questionReloadBtn.innerText;
    questionReloadBtn.innerText = "Recarregando...";
    try {
      await ensureQuestionBankLoaded(adminQuestionBank, { force: true, silent: false });
      syncAdminQuestionEditor(adminQuestionBank);
      rerenderAdminWithCache();
      showToast("Banco de questões atualizado.", "success");
    } finally {
      questionReloadBtn.disabled = false;
      questionReloadBtn.innerText = prev;
    }
  });

  questionNewBtn?.addEventListener("click", () => {
    adminQuestionEditorDraftMode = true;
    adminQuestionEditor = createNewAdminQuestionDraft(adminQuestionBank);
    rerenderAdminWithCache();
  });

  questionMarkToggleBtn?.addEventListener("click", () => {
    const draft = readQuestionForm();
    const safeId = normalizeQuestionId(draft?.id, 0);
    if (!safeId) {
      showToast("Defina um ID válido para marcar a questão.", "error");
      return;
    }

    adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, draft);
    const markedNow = toggleMarkedQuestion(adminQuestionBank, safeId);
    rerenderAdminWithCache();
    showToast(
      markedNow ? `Questão #${safeId} marcada para revisão.` : `Questão #${safeId} desmarcada.`,
      "info"
    );
  });

  questionReviewedToggleBtn?.addEventListener("click", () => {
    const draft = readQuestionForm();
    const safeId = normalizeQuestionId(draft?.id, 0);
    if (!safeId) {
      showToast("Defina um ID válido para marcar como revisado.", "error");
      return;
    }

    adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, draft);
    const reviewedNow = toggleReviewedQuestion(adminQuestionBank, safeId);
    rerenderAdminWithCache();
    showToast(
      reviewedNow ? `Questão #${safeId} marcada como revisada.` : `Questão #${safeId} desmarcada como revisada.`,
      "info"
    );
  });

  questionMarkedClearBtn?.addEventListener("click", () => {
    const ids = getMarkedQuestionIds(adminQuestionBank);
    if (!ids.length) return;
    const confirmed = confirm("Limpar todas as questões marcadas deste banco?");
    if (!confirmed) return;
    setMarkedQuestionIds(adminQuestionBank, []);
    if (isShowOnlyMarkedEnabled(adminQuestionBank)) {
      adminShowOnlyMarkedByBank[getQuestionBankConfig(adminQuestionBank).id] = false;
    }
    rerenderAdminWithCache();
    showToast("Marcadores de revisão limpos.", "success");
  });

  questionPrevBtn?.addEventListener("click", () => {
    goToRelativeQuestion(-1);
  });

  questionNextBtn?.addEventListener("click", () => {
    goToRelativeQuestion(1);
  });

  document.querySelectorAll("[data-question-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const questionId = btn.getAttribute("data-question-edit") || "";
      selectQuestionInEditor(questionId);
    });
  });

  document.querySelectorAll("[data-question-marked-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const questionId = btn.getAttribute("data-question-marked-edit") || "";
      selectQuestionInEditor(questionId);
    });
  });

  questionSaveBtn?.addEventListener("click", async () => {
    const draft = readQuestionForm();
    if (!draft.id) {
      showToast("Informe um ID válido para a questão.", "error");
      return;
    }
    if (!draft.question) {
      showToast("Informe o enunciado da questão.", "error");
      return;
    }
    if (draft.options.some((opt) => !opt)) {
      showToast("Preencha as 4 opções de resposta.", "error");
      return;
    }

    questionSaveBtn.disabled = true;
    const prev = questionSaveBtn.innerText;
    questionSaveBtn.innerText = "Salvando...";
    try {
      await saveQuestionDefinition(
        adminQuestionBank,
        String(draft.id),
        {
          id: draft.id,
          image: draft.image,
          question: draft.question,
          options: draft.options,
          correctIndex: draft.correctIndex,
          explanation: draft.explanation
        },
        currentUser?.email || ""
      );
      await ensureQuestionBankLoaded(adminQuestionBank, { force: true, silent: true });
      adminQuestionEditorDraftMode = false;
      const refreshedList = getVisibleQuestionList();
      const currentIndex = refreshedList.findIndex((item) => item.id === draft.id);
      const hasNext = currentIndex !== -1 && currentIndex < refreshedList.length - 1;
      if (adminAutoNextOnSave && hasNext) {
        adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, refreshedList[currentIndex + 1]);
      } else {
        adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, draft);
      }
      rerenderAdminWithCache();
      showToast("Questão salva com sucesso.", "success");
    } catch (error) {
      console.error("Erro ao salvar questão:", error);
      showToast("Não foi possível salvar a questão.", "error");
    } finally {
      questionSaveBtn.disabled = false;
      questionSaveBtn.innerText = prev;
    }
  });

  questionDeleteBtn?.addEventListener("click", async () => {
    const draft = readQuestionForm();
    if (!draft.id) {
      showToast("Informe um ID válido para excluir.", "error");
      return;
    }

    const confirmed = confirm(`Excluir a questão #${draft.id} deste banco?`);
    if (!confirmed) return;

    questionDeleteBtn.disabled = true;
    const prev = questionDeleteBtn.innerText;
    questionDeleteBtn.innerText = "Excluindo...";
    try {
      await deleteQuestionDefinition(adminQuestionBank, String(draft.id));
      setMarkedQuestionIds(
        adminQuestionBank,
        getMarkedQuestionIds(adminQuestionBank).filter((id) => id !== draft.id)
      );
      setReviewedQuestionIds(
        adminQuestionBank,
        getReviewedQuestionIds(adminQuestionBank).filter((id) => id !== draft.id)
      );
      await ensureQuestionBankLoaded(adminQuestionBank, { force: true, silent: true });
      adminQuestionEditorDraftMode = false;
      syncAdminQuestionEditor(adminQuestionBank);
      rerenderAdminWithCache();
      showToast("Questão excluída.", "success");
    } catch (error) {
      console.error("Erro ao excluir questão:", error);
      showToast("Não foi possível excluir a questão.", "error");
    } finally {
      questionDeleteBtn.disabled = false;
      questionDeleteBtn.innerText = prev;
    }
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

  const deleteUserFromSite = async (userId) => {
    if (!userId) return;
    const confirmed = confirm("Remover este usuário do site? Isso apaga perfil e créditos no Firestore.");
    if (!confirmed) return;

    const btn = document.querySelector(`.admin-user-delete[data-user-id="${userId}"]`);
    const card = document.querySelector(`.admin-card[data-user-id="${userId}"]`);
    if (btn) {
      btn.disabled = true;
      btn.innerText = "Removendo...";
    }

    try {
      await Promise.all([
        deleteUserProfile(userId).catch(() => null),
        deleteUserCredits(userId).catch(() => null)
      ]);

      adminUsersCache = adminUsersCache.filter((u) => (u.id || u.uid) !== userId);
      card?.remove();
      adminMetricsSummary = null;
      rerenderAdminWithCache();
      showToast("Usuário removido do site.", "success");
    } catch (error) {
      console.error("Erro ao remover usuário do site:", error);
      showToast("Não foi possível remover o usuário.", "error");
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Remover do site";
      }
    }
  };

  document.querySelectorAll(".admin-user-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.getAttribute("data-user-id") || "";
      deleteUserFromSite(userId);
    });
  });
}

function setupAdminQuestionHubActions() {
  const backBtn = document.getElementById("adminQuestionHubBack");
  backBtn?.addEventListener("click", () => {
    renderAdmin();
  });

  document.querySelectorAll("[data-open-question-bank]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bankId = String(btn.getAttribute("data-open-question-bank") || "").trim();
      renderAdminQuestionEditor(bankId);
    });
  });
}

function setupCreditsActions() {
  const btn = document.getElementById("buyCreditsBtn");
  const modal = document.getElementById("creditsCheckoutModal");
  const confirmBtn = document.getElementById("creditsCheckoutConfirm");
  const cancelBtn = document.getElementById("creditsCheckoutCancel");
  const checkBtn = document.getElementById("creditsCheckBtn");

  if (btn) {
    btn.addEventListener("click", () => {
      renderPackages();
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  }

  if (confirmBtn) {
    const defaultText = confirmBtn.innerText;
    confirmBtn.addEventListener("click", async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerText = "Abrindo pagamento...";
      if (cancelBtn) cancelBtn.disabled = true;

      try {
        const opened = await startCreditsCheckout("silver");
        if (opened && modal) {
          modal.classList.add("hidden");
          showToast("Pagamento aberto. Após pagar, volte aqui e confirme os créditos.", "info");
        }
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerText = defaultText;
        if (cancelBtn) cancelBtn.disabled = false;
      }
    });
  }

  if (checkBtn) {
    const defaultText = checkBtn.innerText;
    checkBtn.addEventListener("click", async () => {
      checkBtn.disabled = true;
      checkBtn.innerText = "Verificando...";
      try {
        await checkCreditsPaymentStatus({ showNoChangeToast: true });
      } finally {
        checkBtn.disabled = false;
        checkBtn.innerText = defaultText;
      }
    });
  }
}

function setupCreditsHistoryActions() {
  const moreBtn = document.getElementById("creditsHistoryMoreBtn");
  if (!moreBtn) return;

  moreBtn.addEventListener("click", async () => {
    if (!currentUser || creditHistoryLoadingMore) return;

    const loadedSpent = getLoadedSpentCreditsCount();
    if (loadedSpent > profileVisibleSpentCredits) {
      profileVisibleSpentCredits += 7;
      rerenderProfileFromCache();
      return;
    }
    if (!creditHistoryHasMore) return;

    creditHistoryLoadingMore = true;
    rerenderProfileFromCache();

    try {
      await loadCreditHistoryPage({ append: true });
      profileVisibleSpentCredits += 7;
    } catch (error) {
      console.warn("PreFlight credits history pagination failed:", error);
      showToast("Não foi possível carregar mais itens do histórico.", "error");
    } finally {
      creditHistoryLoadingMore = false;
      rerenderProfileFromCache();
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

async function checkCreditsPaymentStatus({ showNoChangeToast = false } = {}) {
  if (!currentUser) return false;

  const before = getCreditsBalanceValue(currentCredits) ?? 0;

  try {
    const credits = await getUserCredits(currentUser.uid);
    currentCredits = applyLocalCreditsBalance(credits || { balance: before }, true);
    const after = getCreditsBalanceValue(currentCredits) ?? 0;

    if (after > before) {
      stopCreditsPolling();
      showToast("Créditos atualizados com sucesso.", "success");
      renderProfile();
      return true;
    }

    if (showNoChangeToast) {
      showToast("Pagamento ainda em processamento. Tente novamente em instantes.", "info");
    }
    return false;
  } catch (error) {
    console.warn("Credits status check failed:", error);
    if (showNoChangeToast) {
      showToast("Não foi possível verificar agora. Tente novamente.", "error");
    }
    return false;
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
        stopCreditsPolling();
        showToast("Pagamento confirmado. Créditos liberados.", "success");
        renderProfile();
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

  const evaluationSimulado = String(evaluation?.simulado || "").toLowerCase().includes("metar")
    ? "metar_taf"
    : "sigwx";
  const questionSource = evaluation?.questionBank === "evaluation"
    ? getQuestionsForSimuladoMode(evaluationSimulado, "evaluation")
    : getQuestionsForSimuladoMode(evaluationSimulado, "training");
  const questionById = new Map(questionSource.map((q) => [q.id, q]));
  const items = (evaluation.answers || []).map((ans, index) => {
    const q = questionById.get(ans?.questionId) || {};
    const selectedIndex = ans?.selectedIndex;
    const selectedText =
      selectedIndex === null || selectedIndex === undefined || !ans?.options
        ? "Não respondida"
        : ans.options[selectedIndex]?.text || "Não respondida";

    const correctOption = ans?.options ? ans.options.find(o => o.isCorrect) : null;
    const correctText = correctOption ? correctOption.text : "";
    const selectedOption =
      selectedIndex === null || selectedIndex === undefined || !ans?.options
        ? null
        : ans.options[selectedIndex];
    const isWrong = !selectedOption?.isCorrect;

    return {
      index: index + 1,
      image: q.image,
      question: q.question,
      selectedText,
      correctText,
      explanation: q.explanation || "",
      isWrong
    };
  });

  app.innerHTML = profileEvaluationView({
    summary: { total, correct, wrong, answered, percentage, status, durationSeconds: evaluation.durationSeconds },
    items,
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    simuladoLabel: getSimuladoLabel(evaluationSimulado)
  });

  const backBtn = document.getElementById("profileBack");
  backBtn?.addEventListener("click", () => {
    renderProfile();
  });

  setupEvaluationResultsActions(items, { simuladoKey: evaluationSimulado });
  setupLogout();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

// ===============================
// CONTROLE DE SESSÃO
// ===============================
observeAuthState((user) => {
  const previousUser = currentUser;
  if (previousUser?.uid && (!user || previousUser.uid !== user.uid)) {
    stopPresenceTracking({ setOffline: true, userId: previousUser.uid });
  }

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
  if (!currentUser) {
    questionBanksCache = {
      sigwx_training: DEFAULT_QUESTION_BANKS.sigwx_training.map((q) => ({ ...q })),
      sigwx_evaluation: DEFAULT_QUESTION_BANKS.sigwx_evaluation.map((q) => ({ ...q })),
      metar_taf_training: DEFAULT_QUESTION_BANKS.metar_taf_training.map((q) => ({ ...q })),
      metar_taf_evaluation: DEFAULT_QUESTION_BANKS.metar_taf_evaluation.map((q) => ({ ...q }))
    };
    questionBankLoadedFlags = {
      sigwx_training: false,
      sigwx_evaluation: false,
      metar_taf_training: false,
      metar_taf_evaluation: false
    };
    adminQuestionEditor = null;
    adminQuestionEditorDraftMode = false;
    renderHomePublic();
    return;
  }

  startPresenceTracking();
  setTimeout(() => {
    preloadQuestionBanks().catch((error) => {
      console.warn("Falha no preload dos bancos de questões:", error);
    });
  }, 1200);

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
        await grantWelcomeBonusIfNeeded(currentUser.uid, currentProfile);
        return;
      }
      currentProfile = profile;
      if (!profile.uid) {
        await saveUserProfile(currentUser.uid, {
          uid: currentUser.uid,
          email: currentUser.email || profile.email || ""
        });
      }
      await grantWelcomeBonusIfNeeded(currentUser.uid, currentProfile);
    })
    .catch(() => {
      currentProfile = null;
    })
    .finally(() => {
      const mode = String(document.body.dataset.simuladoMode || "");
      const inSessionFlow =
        mode === "training" ||
        mode === "evaluation" ||
        mode === "evaluation-results" ||
        mode === "evaluation-history";
      const hasActiveScreen = !!document.querySelector(
        ".simulados-page, .simulado-container, .simulado-header, .eval-result, .admin-page, .credits-page, .packages-page, .contact-page, .profile-page"
      );

      if (inSessionFlow || hasActiveScreen) return;

      if (isAdminUser()) {
        renderAdmin();
      } else {
        renderProfile();
      }
    });
});

document.addEventListener("sigwx:go-eval", () => {
  if (activeSimuladoKey === "metar_taf") {
    startMetarTafWithCredit("evaluation");
    return;
  }
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
  const goCreditsTop = document.getElementById("goCreditsTop");

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
      if (!currentUser) {
        renderLogin();
        return;
      }
      renderCredits();
    });
  }

  if (goCreditsTop) {
    goCreditsTop.addEventListener("click", (e) => {
      e.preventDefault();
      if (!currentUser) {
        renderLogin();
        return;
      }
      renderCredits();
    });
  }

  setupMobileHeaderMenu();
  setupUserMenu();
}

function setupMobileHeaderMenu() {
  if (mobileHeaderResizeHandler) {
    window.removeEventListener("resize", mobileHeaderResizeHandler);
    mobileHeaderResizeHandler = null;
  }

  const toggleBtn = document.getElementById("mobileMenuToggle");
  const menu = document.getElementById("primaryMenu");
  if (!toggleBtn || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggleBtn.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  toggleBtn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggleBtn.classList.toggle("is-open", isOpen);
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  menu.querySelectorAll("a").forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 900) closeMenu();
    });
  });

  mobileHeaderResizeHandler = () => {
    if (window.innerWidth > 900) closeMenu();
  };
  window.addEventListener("resize", mobileHeaderResizeHandler);
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
  const googleBtn = document.getElementById("loginGoogleBtn");
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

  googleBtn?.addEventListener("click", async () => {
    googleBtn.disabled = true;
    const prevText = googleBtn.innerText;
    googleBtn.innerText = "Abrindo Google...";

    try {
      await loginWithGoogle();
    } catch (error) {
      const code = String(error?.code || "").toLowerCase();
      if (code.includes("popup-closed-by-user")) {
        showToast("Login com Google cancelado.", "info");
      } else if (code.includes("popup-blocked")) {
        showToast("Popup bloqueado. Libere popups e tente novamente.", "error");
      } else if (code.includes("unauthorized-domain")) {
        showToast(`Domínio não autorizado no Firebase Auth: ${window.location.hostname}`, "error");
      } else {
        showToast(`Não foi possível entrar com Google (${error?.code || "erro_desconhecido"}).`, "error");
      }
    } finally {
      googleBtn.disabled = false;
      googleBtn.innerText = prevText;
    }
  });
}

function setupHomePackagesButton() {
  const packageButtons = document.querySelectorAll("[data-open-packages]");
  if (!packageButtons.length) return;

  packageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      renderPackages();
    });
  });
}

function setupHomeModeCarousels() {
  cleanupHomeModeCarousels();

  const carousels = document.querySelectorAll(".mode-carousel");
  if (!carousels.length) return;

  carousels.forEach((root) => {
    const AUTO_ADVANCE_MS = 4000;
    const images = String(root.dataset.images || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const slides = String(root.dataset.slides || "")
      .split("||")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!images.length) return;

    const altBase = String(root.dataset.alt || "Imagem do simulador");
    root.innerHTML = `
      <button type="button" class="mode-carousel-btn prev" aria-label="Imagem anterior">&#8249;</button>
      <div class="mode-carousel-viewport">
        <div class="mode-carousel-track"></div>
      </div>
      <button type="button" class="mode-carousel-btn next" aria-label="Próxima imagem">&#8250;</button>
      <div class="mode-carousel-dots"></div>
    `;

    const track = root.querySelector(".mode-carousel-track");
    const dots = root.querySelector(".mode-carousel-dots");
    const prevBtn = root.querySelector(".mode-carousel-btn.prev");
    const nextBtn = root.querySelector(".mode-carousel-btn.next");
    if (!track || !dots || !prevBtn || !nextBtn) return;

    const card = root.closest(".mode-card");
    const copyTitle = card?.querySelector(".mode-card-copy h3");
    const copyParagraph = card?.querySelector(".mode-card-copy p");
    const defaultTitle = copyTitle?.textContent || "";
    const defaultCaption = copyParagraph?.textContent || "";

    images.forEach((src, index) => {
      const slide = document.createElement("div");
      slide.className = "mode-carousel-slide";
      const img = document.createElement("img");
      img.src = src;
      img.alt = images.length > 1 ? `${altBase} (${index + 1})` : altBase;
      img.loading = "lazy";
      img.addEventListener("error", () => {
        const fallback = images[0];
        if (img.src !== fallback) {
          img.src = fallback;
        }
      });
      slide.appendChild(img);
      track.appendChild(slide);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "mode-carousel-dot";
      dot.setAttribute("aria-label", `Ir para imagem ${index + 1}`);
      dot.addEventListener("click", () => {
        setIndex(index);
        restartAutoplay();
      });
      dots.appendChild(dot);
    });

    let currentIndex = 0;
    let autoplayId = null;
    const dotButtons = Array.from(dots.querySelectorAll(".mode-carousel-dot"));

    const sync = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dotButtons.forEach((dot, idx) => {
        dot.classList.toggle("is-active", idx === currentIndex);
      });
      const slideText = slides[currentIndex] || slides[0] || "";
      const [slideTitle, slideCaption] = slideText.includes("::")
        ? slideText.split("::")
        : [defaultTitle, slideText];
      if (copyTitle) {
        copyTitle.textContent = slideTitle || defaultTitle;
      }
      if (copyParagraph) {
        copyParagraph.textContent = slideCaption || defaultCaption;
      }
      prevBtn.disabled = images.length <= 1;
      nextBtn.disabled = images.length <= 1;
      dots.classList.toggle("is-hidden", images.length <= 1);
    };

    const stopAutoplay = () => {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    const startAutoplay = () => {
      if (images.length <= 1) return;
      stopAutoplay();
      autoplayId = setInterval(() => {
        setIndex(currentIndex + 1);
      }, AUTO_ADVANCE_MS);
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    function setIndex(nextIndex) {
      const total = images.length;
      currentIndex = ((nextIndex % total) + total) % total;
      sync();
    }

    prevBtn.addEventListener("click", () => {
      setIndex(currentIndex - 1);
      restartAutoplay();
    });
    nextBtn.addEventListener("click", () => {
      setIndex(currentIndex + 1);
      restartAutoplay();
    });

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", startAutoplay);
    root.addEventListener("touchstart", stopAutoplay, { passive: true });
    root.addEventListener("touchend", startAutoplay, { passive: true });

    sync();
    startAutoplay();

    homeModeCarouselCleanupFns.push(() => {
      stopAutoplay();
    });
  });
}

// ===============================
// DASHBOARD
// ===============================
function setupDashboardActions() {
  const trainingBtn = document.getElementById("dashboardSigwxTraining");
  const evalBtn = document.getElementById("dashboardSigwxEval");
  const metarTrainingBtn = document.getElementById("dashboardMetarTraining");
  const metarEvalBtn = document.getElementById("dashboardMetarEval");
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

  if (metarTrainingBtn) {
    metarTrainingBtn.onclick = (e) => {
      e.stopPropagation();
      if (metarTrainingBtn.disabled) return;
      startMetarTafWithCredit("training");
    };
  }

  if (metarEvalBtn) {
    metarEvalBtn.onclick = (e) => {
      e.stopPropagation();
      if (metarEvalBtn.disabled) return;
      startMetarTafWithCredit("evaluation");
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
      } else if (action === "metar-taf") {
        startMetarTafWithCredit("training");
      } else if (action === "metar-taf-eval") {
        startMetarTafWithCredit("evaluation");
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
      await grantWelcomeBonusIfNeeded(cred.user.uid, profileData);
      renderProfile();
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

function setupHomeSimuladosCarousel() {
  if (homeSimuladosResizeHandler) {
    window.removeEventListener("resize", homeSimuladosResizeHandler);
    homeSimuladosResizeHandler = null;
  }

  const viewport = document.querySelector(".simulados-viewport");
  const track = document.querySelector(".simulados-cards-track");
  const prevBtn = document.querySelector(".simulados-carousel-btn.prev");
  const nextBtn = document.querySelector(".simulados-carousel-btn.next");
  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.querySelectorAll(".card"));
  const availableCards = cards.filter((card) =>
    card.hasAttribute("data-action") &&
    !card.classList.contains("card-disabled") &&
    card.getAttribute("aria-disabled") !== "true"
  );
  if (availableCards.length && availableCards.length !== cards.length) {
    const unavailableCards = cards.filter((card) => !availableCards.includes(card));
    const beforeCount = Math.floor(unavailableCards.length / 2);
    const centeredOrder = [
      ...unavailableCards.slice(0, beforeCount),
      ...availableCards,
      ...unavailableCards.slice(beforeCount)
    ];
    track.replaceChildren(...centeredOrder);
  }

  const firstCard = track.querySelector(".card");
  const gap = 24;
  const step = () => (firstCard ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth * 0.8);

  const centerAvailableCards = () => {
    const currentAvailableCards = Array.from(
      track.querySelectorAll('.card[data-action]:not(.card-disabled):not([aria-disabled="true"])')
    );
    if (!currentAvailableCards.length) return;
    const firstAvailable = currentAvailableCards[0];
    const lastAvailable = currentAvailableCards[currentAvailableCards.length - 1];
    const blockStart = firstAvailable.offsetLeft;
    const blockEnd = lastAvailable.offsetLeft + lastAvailable.offsetWidth;
    const blockCenter = (blockStart + blockEnd) / 2;
    const targetScroll = Math.max(0, blockCenter - viewport.clientWidth / 2);
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const cardStep = Math.max(1, Math.round(step()));
    const snappedScroll = Math.round(targetScroll / cardStep) * cardStep;
    viewport.scrollLeft = Math.min(Math.max(0, snappedScroll), maxScroll);
  };

  const updateButtons = () => {
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    prevBtn.disabled = viewport.scrollLeft <= 4;
    nextBtn.disabled = viewport.scrollLeft >= maxScroll - 4;
  };

  prevBtn.addEventListener("click", () => {
    viewport.scrollBy({ left: -step(), behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    viewport.scrollBy({ left: step(), behavior: "smooth" });
  });

  viewport.addEventListener("scroll", updateButtons, { passive: true });
  homeSimuladosResizeHandler = () => {
    centerAvailableCards();
    updateButtons();
  };
  window.addEventListener("resize", homeSimuladosResizeHandler);
  centerAvailableCards();
  updateButtons();
}

function setupSimuladoNavToggle() {
  if (simuladoNavResizeHandler) {
    window.removeEventListener("resize", simuladoNavResizeHandler);
    simuladoNavResizeHandler = null;
  }

  const toggleBtn = document.querySelector("[data-sim-nav-toggle]");
  const panel = document.querySelector("[data-sim-nav-panel]");
  if (!toggleBtn || !panel) return;

  const labelSpan = toggleBtn.querySelector("span");

  const closePanel = () => {
    panel.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    if (labelSpan) labelSpan.textContent = "▾";
  };

  const openPanel = () => {
    panel.classList.add("is-open");
    toggleBtn.setAttribute("aria-expanded", "true");
    if (labelSpan) labelSpan.textContent = "▴";
  };

  if (window.innerWidth <= 900) {
    closePanel();
  } else {
    openPanel();
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.contains("is-open");
    if (isOpen) closePanel();
    else openPanel();
  });

  simuladoNavResizeHandler = () => {
    if (window.innerWidth > 900) {
      panel.classList.add("is-open");
      toggleBtn.setAttribute("aria-expanded", "true");
      if (labelSpan) labelSpan.textContent = "▴";
      return;
    }
    panel.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    if (labelSpan) labelSpan.textContent = "▾";
  };
  window.addEventListener("resize", simuladoNavResizeHandler);
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
  const closeBtn = document.getElementById("contactClose");
  const sendBtn = document.getElementById("contactSend");
  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const subjectInput = document.getElementById("contactSubject");
  const messageInput = document.getElementById("contactMessage");
  const hasModalWidget = !!fab && !!modal;

  const openModal = () => {
    if (!modal) return;
    modal.classList.remove("hidden");
    if (fabClose) fabClose.classList.remove("hidden");
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add("hidden");
  };

  if (hasModalWidget) {
    fab.addEventListener("click", openModal);
  }

  if (hasModalWidget && fabClose && fab) {
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
    closeBtn.addEventListener("click", () => {
      if (hasModalWidget) {
        closeModal();
        return;
      }
      if (nameInput) nameInput.value = "";
      if (emailInput) emailInput.value = "";
      if (subjectInput) subjectInput.value = "";
      if (messageInput) messageInput.value = "";
    });
  }

  if (hasModalWidget && modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

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
        if (hasModalWidget) closeModal();
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

async function startCreditsCheckout(packageId = "silver") {
  if (!currentUser) {
    renderLogin();
    return false;
  }

  const normalizedPackageId = String(packageId || "").trim().toLowerCase();
  const selectedPack = CREDIT_PACKS[normalizedPackageId];
  if (!selectedPack) {
    showToast("Pacote inválido.", "error");
    return false;
  }

  try {
    const baseBalance = currentCredits?.balance ?? 0;
    const res = await fetchApiWithPathFallback("/createPreference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser.uid,
        email: currentUser.email || "",
        packageId: normalizedPackageId
      })
    });
    if (!res.ok) {
      showToast("Não foi possível iniciar o pagamento.", "error");
      return false;
    }
    const data = await res.json();
    const url = USE_MP_SANDBOX
      ? (data.sandbox_init_point || data.init_point)
      : (data.init_point || data.sandbox_init_point);
    if (!url) {
      showToast("Não foi possível iniciar o pagamento.", "error");
      return false;
    }
    const openedWindow = window.open(url, "_blank");
    if (!openedWindow) {
      showToast("Pop-up bloqueado. Permita pop-ups e tente novamente.", "error");
      return false;
    }
    startCreditsPolling(baseBalance);
    return true;
  } catch (error) {
    console.error("Checkout error:", error);
    showToast("Erro ao iniciar pagamento.", "error");
    return false;
  }
}






