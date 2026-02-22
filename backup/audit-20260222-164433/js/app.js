// ===============================
// APP PRINCIPAL (SPA)
// ===============================

import {
  homePublicView,
  loginView,
  registerView,
  dashboardView,
  simuladoModuleView,
  metarTafHubView,
  sinaisLuminososHubView,
  sigwxView,
  sigwxEvaluationView,
  sigwxEvaluationResultView,
  profileView,
  profileEvaluationView,
  adminView,
  adminReportView,
  adminQuestionHubView,
  adminQuestionEditorView,
  creditsView,
  packagesView,
  contactView,
  privacyView,
  cookiesView
} from "./views/views.js";
import { buildReportData, downloadReportCsvFiles } from "./modules/report.js";

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
  getEvaluationById
} from "./modules/evaluations.js";

import {
  saveUserProfile,
  getUserProfile,
  getUsersPage,
  getUserCredits,
  setUserCredits,
  deleteUserProfile,
  deleteUserCredits,
  consumeUserCredit,
  getUserCreditTransactionsPage,
  getUserSessionCounts,
  getGlobalNotice,
  getSessionAvailability,
  setGlobalNotice,
  setSessionAvailability,
  setCachedUserCredits,
  clearUserFirestoreCaches
} from "./modules/users.js";
import {
  getQuestionsByBank,
  saveQuestion as saveQuestionDefinition,
  deleteQuestion as deleteQuestionDefinition
} from "./modules/questions.js";
import { getModuleByKey, getModuleBySlug } from "../modulos/index.js";
import { startSigwxSimulado } from "./simulados/sigwx/simulado.js";
import { sigwxQuestions } from "./simulados/sigwx/data.js";
import { sigwxEvaluationQuestions } from "./simulados/sigwx/data-evaluation.js";
import { metarTafQuestions } from "./simulados/metar-taf/data.js";
import { metarTafEvaluationQuestions } from "./simulados/metar-taf/data-evaluation.js";
import { nuvensQuestions } from "./simulados/nuvens/data.js";
import { nuvensEvaluationQuestions } from "./simulados/nuvens/data-evaluation.js";
import { sinaisLuminososQuestions } from "./simulados/sinais-luminosos/data.js";
import { sinaisLuminososEvaluationQuestions } from "./simulados/sinais-luminosos/data-evaluation.js";

import "./simulados/sigwx/painel.js";

const app = document.getElementById("app");

const FUNCTIONS_BASE_URL =
  window.PREFLIGHT_FUNCTIONS_URL ||
  "https://us-central1-preflightsimulados.cloudfunctions.net/api";
const USE_MP_SANDBOX = window.PREFLIGHT_MP_SANDBOX === true;
const USE_BACKEND_CREDITS_API = window.PREFLIGHT_USE_BACKEND_CREDITS_API !== false;
const LOW_COST_MODE = window.PREFLIGHT_LOW_COST_MODE !== false;
const IS_LOCAL_DEV_HOST =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost";
const LOCAL_CREDITS_KEY_PREFIX = "preflight_local_credits_";
const CREDITS_HISTORY_PAGE_SIZE = 30;
const ADMIN_USERS_PAGE_SIZE = 20;
const TELEMETRY_KEY = "preflight_telemetry_v1";
const TELEMETRY_RETENTION_DAYS = 7;
const WELCOME_BONUS_CREDITS = 5;
const CREDIT_API_TIMEOUT_MS = 12000;
const CREDITS_REMOTE_REFRESH_MIN_INTERVAL_MS = 2 * 60 * 1000;
const CREDITS_POLLING_INTERVAL_MS = 30000;
const CREDITS_POLLING_MAX_MS = 2 * 60 * 1000;
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
  },
  {
    id: "nuvens_training",
    label: "Nuvens • Treinamento",
    imageBasePath: "assets/questions/nuvens/training"
  },
  {
    id: "nuvens_evaluation",
    label: "Nuvens • Avaliação",
    imageBasePath: "assets/questions/nuvens/evaluation"
  },
  {
    id: "sinais_luminosos_training",
    label: "Sinais luminosos • Treinamento",
    imageBasePath: "assets/questions/sinais-luminosos/training"
  },
  {
    id: "sinais_luminosos_evaluation",
    label: "Sinais luminosos • Avaliação",
    imageBasePath: "assets/questions/sinais-luminosos/evaluation"
  }
];
const QUESTION_BANK_BY_ID = new Map(QUESTION_BANKS.map((bank) => [bank.id, bank]));
const SIMULADO_BANKS = {
  sigwx: { training: "sigwx_training", evaluation: "sigwx_evaluation", label: "SIGWX" },
  metar_taf: { training: "metar_taf_training", evaluation: "metar_taf_evaluation", label: "METAR/TAF" },
  nuvens: { training: "nuvens_training", evaluation: "nuvens_evaluation", label: "Nuvens" },
  sinais_luminosos: {
    training: "sinais_luminosos_training",
    evaluation: "sinais_luminosos_evaluation",
    label: "Sinais luminosos"
  },
  notam: { training: "notam_training", evaluation: "notam_evaluation", label: "NOTAM" },
  rotaer: { training: "rotaer_training", evaluation: "rotaer_evaluation", label: "ROTAER" },
  espacos_aereos: {
    training: "espacos_aereos_training",
    evaluation: "espacos_aereos_evaluation",
    label: "Espaços Aéreos"
  }
};
const APP_ROUTES = {
  home: "/",
  dashboard: "/simulados"
};
const MODULE_ROUTE_BY_KEY = {
  sigwx: "/modulos/sigwx",
  metar_taf: "/modulos/metar-taf",
  nuvens: "/modulos/nuvens",
  sinais_luminosos: "/modulos/sinais-luminosos",
  notam: "/modulos/notam",
  rotaer: "/modulos/rotaer",
  espacos_aereos: "/modulos/espacos-aereos"
};
const SESSION_SIMULADO_KEYS = [
  "sigwx",
  "metar_taf",
  "notam",
  "rotaer",
  "nuvens",
  "sinais_luminosos",
  "espacos_aereos"
];
const ADMIN_SIMULADO_CATALOG = [
  { key: "sigwx", label: "SIGWX" },
  { key: "metar_taf", label: "METAR/TAF" },
  { key: "notam", label: "NOTAM" },
  { key: "rotaer", label: "ROTAER" },
  { key: "nuvens", label: "Nuvens" },
  { key: "sinais_luminosos", label: "Sinais luminosos" },
  { key: "espacos_aereos", label: "Espaços Aéreos" }
];
const DEFAULT_QUESTION_BANKS = {
  sigwx_training: Array.isArray(sigwxQuestions) ? sigwxQuestions.map((q) => ({ ...q })) : [],
  sigwx_evaluation: Array.isArray(sigwxEvaluationQuestions) ? sigwxEvaluationQuestions.map((q) => ({ ...q })) : [],
  metar_taf_training: Array.isArray(metarTafQuestions) ? metarTafQuestions.map((q) => ({ ...q })) : [],
  metar_taf_evaluation: Array.isArray(metarTafEvaluationQuestions) ? metarTafEvaluationQuestions.map((q) => ({ ...q })) : [],
  nuvens_training: Array.isArray(nuvensQuestions) ? nuvensQuestions.map((q) => ({ ...q })) : [],
  nuvens_evaluation: Array.isArray(nuvensEvaluationQuestions) ? nuvensEvaluationQuestions.map((q) => ({ ...q })) : [],
  sinais_luminosos_training: Array.isArray(sinaisLuminososQuestions) ? sinaisLuminososQuestions.map((q) => ({ ...q })) : [],
  sinais_luminosos_evaluation: Array.isArray(sinaisLuminososEvaluationQuestions)
    ? sinaisLuminososEvaluationQuestions.map((q) => ({ ...q }))
    : []
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
let adminUsersCursor = null;
let adminUsersHasMore = false;
let adminUsersLoadingMore = false;
let adminMetricsRange = "30d";
let adminMetricsData = { evaluations: [], transactions: [] };
let adminMetricsSummary = null;
let adminMetricsFromApi = false;
let adminPanelScreen = "dashboard";
let adminReportData = null;
let adminLightMode = localStorage.getItem(ADMIN_LIGHT_MODE_KEY) !== "0";
let activeSimuladoKey = "sigwx";
let profileEvaluationsCache = [];
let profileShowAllEvaluations = false;
let profileVisibleSpentCredits = 7;
let globalNoticeMessage = "";
let sessionAvailability = SESSION_SIMULADO_KEYS.reduce((acc, key) => {
  acc[key] = { enabled: true, training: true, evaluation: true };
  return acc;
}, {});
let pendingWelcomeAnnouncement = "";
let currentCredits = null;
let creditHistoryItems = [];
let creditHistoryCursor = null;
let creditHistoryHasMore = false;
let creditHistoryLoading = false;
let creditHistoryLoadingMore = false;
let creditHistoryError = "";
let creditsPolling = null;
let creditsPollingStart = null;
let lastCreditsRemoteRefreshAt = 0;
let profileDataLoadPromise = null;
let hasLoadedProfileData = false;
let hasLoadedCreditsData = false;
let hasLoadedEvaluationsData = false;
let hasLoadedCreditHistoryData = false;
let hasLoadedGlobalNoticeData = false;
let startingSessionLock = false;
let authInitialRouteDone = false;
let presenceHeartbeat = null;
let presenceVisibilityHandler = null;
let presencePageHideHandler = null;
let evaluationFinishHandler = null;
let stopEvaluationTimerFn = null;
let mobileHeaderResizeHandler = null;
let homeSimuladosResizeHandler = null;
let simuladoNavResizeHandler = null;
let homeModeCarouselCleanupFns = [];
let pendingEvaluationRetryFilter = null;
const INSUFFICIENT_CREDITS_MESSAGE = "Você não possui créditos suficientes.";
const SESSION_BLOCKED_MESSAGE = "Este modo está temporariamente desabilitado no momento.";
let userMenuDocumentClickHandler = null;
let userMenuDocumentKeydownHandler = null;
let adminQuestionEditorKeydownHandler = null;
let apiWarmupDone = false;
let questionBanksCache = {
  sigwx_training: DEFAULT_QUESTION_BANKS.sigwx_training.map((q) => ({ ...q })),
  sigwx_evaluation: DEFAULT_QUESTION_BANKS.sigwx_evaluation.map((q) => ({ ...q })),
  metar_taf_training: DEFAULT_QUESTION_BANKS.metar_taf_training.map((q) => ({ ...q })),
  metar_taf_evaluation: DEFAULT_QUESTION_BANKS.metar_taf_evaluation.map((q) => ({ ...q })),
  nuvens_training: DEFAULT_QUESTION_BANKS.nuvens_training.map((q) => ({ ...q })),
  nuvens_evaluation: DEFAULT_QUESTION_BANKS.nuvens_evaluation.map((q) => ({ ...q })),
  sinais_luminosos_training: DEFAULT_QUESTION_BANKS.sinais_luminosos_training.map((q) => ({ ...q })),
  sinais_luminosos_evaluation: DEFAULT_QUESTION_BANKS.sinais_luminosos_evaluation.map((q) => ({ ...q }))
};
let questionBankLoadedFlags = {
  sigwx_training: false,
  sigwx_evaluation: false,
  metar_taf_training: false,
  metar_taf_evaluation: false,
  nuvens_training: false,
  nuvens_evaluation: false,
  sinais_luminosos_training: false,
  sinais_luminosos_evaluation: false
};
let adminQuestionBank = "sigwx_training";
let adminQuestionEditor = null;
let adminQuestionEditorDraftMode = false;
let adminMarkedQuestionsByBank = readAdminMarkedQuestionsState();
let adminReviewedQuestionsByBank = readAdminReviewedQuestionsState();
let adminShowOnlyMarkedByBank = {};
let adminAutoNextOnSave = localStorage.getItem(ADMIN_AUTO_NEXT_ON_SAVE_KEY) === "1";

function getTelemetryDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readTelemetryState() {
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    if (!raw) return { days: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || typeof parsed.days !== "object") {
      return { days: {} };
    }
    return parsed;
  } catch (_) {
    return { days: {} };
  }
}

function writeTelemetryState(state) {
  try {
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(state));
  } catch (_) {
    // no-op
  }
}

function pruneTelemetryDays(state, keepDays = TELEMETRY_RETENTION_DAYS) {
  const safeKeepDays = Math.max(1, Math.floor(Number(keepDays) || TELEMETRY_RETENTION_DAYS));
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (safeKeepDays - 1));
  const cutoffKey = getTelemetryDayKey(cutoff);

  const nextDays = {};
  Object.keys(state.days || {}).forEach((dayKey) => {
    if (dayKey >= cutoffKey) {
      nextDays[dayKey] = state.days[dayKey];
    }
  });
  state.days = nextDays;
  return state;
}

function trackTelemetry(flow, { reads = 0, writes = 0, count = 1 } = {}) {
  const safeFlow = String(flow || "").trim();
  if (!safeFlow) return;

  const safeReads = Number.isFinite(Number(reads)) ? Math.max(0, Math.floor(Number(reads))) : 0;
  const safeWrites = Number.isFinite(Number(writes)) ? Math.max(0, Math.floor(Number(writes))) : 0;
  const safeCount = Number.isFinite(Number(count)) ? Math.max(1, Math.floor(Number(count))) : 1;

  const state = pruneTelemetryDays(readTelemetryState(), TELEMETRY_RETENTION_DAYS);
  const dayKey = getTelemetryDayKey();
  if (!state.days[dayKey]) {
    state.days[dayKey] = { flows: {}, totals: { reads: 0, writes: 0, events: 0 } };
  }
  if (!state.days[dayKey].flows[safeFlow]) {
    state.days[dayKey].flows[safeFlow] = { count: 0, reads: 0, writes: 0 };
  }

  const flowStats = state.days[dayKey].flows[safeFlow];
  flowStats.count += safeCount;
  flowStats.reads += safeReads;
  flowStats.writes += safeWrites;

  state.days[dayKey].totals.events += safeCount;
  state.days[dayKey].totals.reads += safeReads;
  state.days[dayKey].totals.writes += safeWrites;

  writeTelemetryState(state);
}

function normalizeSessionAvailability(raw = null) {
  const readFlag = (simulado, mode) => {
    const value = raw?.[simulado]?.[mode];
    return typeof value === "boolean" ? value : true;
  };

  return SESSION_SIMULADO_KEYS.reduce((acc, simulado) => {
    acc[simulado] = {
      enabled: readFlag(simulado, "enabled"),
      training: readFlag(simulado, "training"),
      evaluation: readFlag(simulado, "evaluation")
    };
    return acc;
  }, {});
}

function isSessionModeAvailable(simuladoKey = "sigwx", mode = "training") {
  const safeKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  const safeMode = mode === "evaluation" ? "evaluation" : "training";
  const value = sessionAvailability?.[safeKey]?.[safeMode];
  return typeof value === "boolean" ? value : true;
}

function normalizePathname(pathname = window.location.pathname) {
  const path = String(pathname || "").trim();
  if (!path || path === "/") return "/";
  const withoutTrailing = path.endsWith("/") ? path.slice(0, -1) : path;
  return withoutTrailing || "/";
}

function updateBrowserPath(pathname, { replace = false } = {}) {
  const safePath = normalizePathname(pathname);
  if (normalizePathname(window.location.pathname) === safePath) return;
  if (replace) {
    window.history.replaceState({}, "", safePath);
    return;
  }
  window.history.pushState({}, "", safePath);
}

function getModulePathByKey(simuladoKey = "sigwx") {
  return MODULE_ROUTE_BY_KEY[simuladoKey] || MODULE_ROUTE_BY_KEY.sigwx;
}

function getModuleSlugFromPath(pathname = window.location.pathname) {
  const safePath = normalizePathname(pathname);
  if (!safePath.startsWith("/modulos/")) return "";
  const slug = safePath.slice("/modulos/".length);
  return slug || "";
}

function getTelemetryReport(days = TELEMETRY_RETENTION_DAYS) {
  const safeDays = Math.max(1, Math.floor(Number(days) || TELEMETRY_RETENTION_DAYS));
  const state = pruneTelemetryDays(readTelemetryState(), safeDays);
  writeTelemetryState(state);

  const orderedDays = Object.keys(state.days || {}).sort();
  const summary = {
    days: [],
    totals: { reads: 0, writes: 0, events: 0 }
  };

  orderedDays.forEach((dayKey) => {
    const day = state.days[dayKey] || {};
    const totals = day.totals || {};
    summary.days.push({
      day: dayKey,
      totals: {
        reads: Number(totals.reads || 0),
        writes: Number(totals.writes || 0),
        events: Number(totals.events || 0)
      },
      flows: day.flows || {}
    });
    summary.totals.reads += Number(totals.reads || 0);
    summary.totals.writes += Number(totals.writes || 0);
    summary.totals.events += Number(totals.events || 0);
  });

  return summary;
}

function resetTelemetry() {
  writeTelemetryState({ days: {} });
}

window.PreFlightTelemetry = {
  report: (days = TELEMETRY_RETENTION_DAYS) => getTelemetryReport(days),
  reset: () => resetTelemetry(),
  track: (flow, payload = {}) => trackTelemetry(flow, payload)
};

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

function buildQuestionControlCode(bankId = "", questionId = 0) {
  const safeBankId = String(getQuestionBankConfig(bankId).id || "sigwx_training")
    .replace(/[^a-z0-9]+/gi, "_")
    .toUpperCase();
  const safeId = normalizeQuestionId(questionId, 1);
  return `${safeBankId}-Q${String(safeId).padStart(4, "0")}`;
}

function normalizeQuestionForBank(bankId, rawQuestion = {}, index = 0) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  const id = normalizeQuestionId(rawQuestion?.id, index + 1);
  const bankConfig = getQuestionBankConfig(safeBankId);
  const isTextOnlyEvaluationBank = safeBankId === "sinais_luminosos_evaluation";
  const fallbackImage = isTextOnlyEvaluationBank
    ? ""
    : String(bankConfig?.defaultImagePath || `${bankConfig.imageBasePath}/${id}.webp`);
  const sourceOptions = Array.isArray(rawQuestion?.options) ? rawQuestion.options : [];
  const options = [0, 1, 2, 3].map((pos) => String(sourceOptions[pos] ?? "").trim());
  const parsedCorrect = Number(rawQuestion?.correctIndex);
  const parsedFontSize = Number(rawQuestion?.questionFontSize);
  const rawControlCode = String(rawQuestion?.controlCode || "").trim();
  const sourceImage = String(rawQuestion?.image || "").trim();
  const textOnImageCard = rawQuestion?.textOnImageCard === true || isTextOnlyEvaluationBank;
  const normalizedImage = isTextOnlyEvaluationBank
    ? sourceImage
    : (sourceImage || fallbackImage);

  return {
    id,
    image: normalizedImage,
    question: String(rawQuestion?.question || "").trim(),
    options,
    correctIndex: Number.isFinite(parsedCorrect) ? Math.min(3, Math.max(0, Math.floor(parsedCorrect))) : 0,
    explanation: String(rawQuestion?.explanation || "").trim(),
    textOnImageCard,
    questionFontSize: Number.isFinite(parsedFontSize) ? Math.max(10, Math.min(36, Math.floor(parsedFontSize))) : 18,
    controlCode: rawControlCode || buildQuestionControlCode(safeBankId, id),
    deleted: rawQuestion?.deleted === true
  };
}

function normalizeQuestionList(bankId, list = []) {
  const normalized = (Array.isArray(list) ? list : []).map((item, index) =>
    normalizeQuestionForBank(bankId, item, index)
  );
  normalized.sort((a, b) => a.id - b.id);
  return normalized;
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renumberQuestionImagePath(imagePath = "", bankId = "", oldId = 0, newId = 0) {
  const safePath = String(imagePath || "").trim();
  if (!safePath) return safePath;
  const bank = getQuestionBankConfig(bankId);
  const basePath = String(bank?.imageBasePath || "").trim();
  if (!basePath) return safePath;
  const pattern = new RegExp(`^${escapeRegExp(basePath)}/(\\d+)(\\.[a-zA-Z0-9]+)$`);
  const match = safePath.match(pattern);
  if (!match) return safePath;

  const currentIdFromPath = Number(match[1]);
  if (Number.isFinite(currentIdFromPath) && Number(currentIdFromPath) !== Number(oldId)) {
    return safePath;
  }
  return `${basePath}/${newId}${match[2]}`;
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
    if (item?.deleted === true) {
      mergedById.delete(id);
      return;
    }
    mergedById.set(id, item);
  });
  return Array.from(mergedById.values()).sort((a, b) => a.id - b.id);
}

async function reindexQuestionBankSequentialIds(bankId) {
  const safeBankId = getQuestionBankConfig(bankId).id;
  await ensureQuestionBankLoaded(safeBankId, { force: true, silent: true });
  const currentItems = getQuestionBankCache(safeBankId)
    .slice()
    .sort((a, b) => normalizeQuestionId(a?.id, 0) - normalizeQuestionId(b?.id, 0));

  if (!currentItems.length) return;

  const oldIds = currentItems.map((item) => normalizeQuestionId(item?.id, 0)).filter(Boolean);
  const newIds = currentItems.map((_, index) => index + 1);
  const needsReindex = oldIds.some((oldId, index) => oldId !== newIds[index]);
  if (!needsReindex) return;

  const updatedBy = currentUser?.email || "";
  for (let index = 0; index < currentItems.length; index += 1) {
    const item = currentItems[index];
    const oldId = normalizeQuestionId(item?.id, index + 1);
    const newId = index + 1;
    await saveQuestionDefinition(
      safeBankId,
      String(newId),
      {
        id: newId,
        image: renumberQuestionImagePath(item?.image, safeBankId, oldId, newId),
        question: String(item?.question || "").trim(),
        options: Array.isArray(item?.options) ? item.options.slice(0, 4) : ["", "", "", ""],
        correctIndex: Number.isFinite(Number(item?.correctIndex)) ? Number(item.correctIndex) : 0,
        explanation: String(item?.explanation || "").trim(),
        textOnImageCard: item?.textOnImageCard === true,
        questionFontSize: Number.isFinite(Number(item?.questionFontSize))
          ? Math.max(10, Math.min(36, Math.floor(Number(item.questionFontSize))))
          : 18,
        controlCode: String(item?.controlCode || "").trim() || buildQuestionControlCode(safeBankId, newId)
      },
      updatedBy
    );
  }

  const nextIdSet = new Set(newIds);
  const obsoleteOldIds = oldIds.filter((id) => !nextIdSet.has(id));
  for (const oldId of obsoleteOldIds) {
    await deleteQuestionDefinition(safeBankId, String(oldId), updatedBy);
  }

  await ensureQuestionBankLoaded(safeBankId, { force: true, silent: true });
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
  const isTextOnlyEvaluationBank = safeBankId === "sinais_luminosos_evaluation";
  return createAdminQuestionDraft(safeBankId, {
    id: nextId,
    image: isTextOnlyEvaluationBank ? "" : `${getQuestionBankConfig(safeBankId).imageBasePath}/${nextId}.webp`,
    options: ["", "", "", ""],
    correctIndex: 0,
    textOnImageCard: isTextOnlyEvaluationBank,
    questionFontSize: 18,
    controlCode: buildQuestionControlCode(safeBankId, nextId)
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

function consumePendingEvaluationQuestions(simuladoKey = "sigwx", questions = []) {
  if (!Array.isArray(questions) || !questions.length) return [];
  const safeSimuladoKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  const pending = pendingEvaluationRetryFilter;
  if (!pending || pending.simuladoKey !== safeSimuladoKey) {
    return questions;
  }

  pendingEvaluationRetryFilter = null;
  const ids = Array.isArray(pending.questionIds) ? pending.questionIds : [];
  const idSet = new Set(ids.map((id) => String(id)));
  const filtered = questions.filter((question) => idSet.has(String(question?.id)));
  return filtered.length ? filtered : questions;
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
  const safeCursor = cursor === null || cursor === undefined
    ? ""
    : String(cursor).trim();

  const token = await currentUser.getIdToken();
  const query = new URLSearchParams({ pageSize: String(safePageSize) });
  if (safeCursor) {
    query.set("cursor", safeCursor);
  }
  const response = await fetchApiWithPathFallback(
    `/credits/history?${query.toString()}`,
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
  const readEstimate = Number.isFinite(Number(data?.readEstimate)) ? Number(data.readEstimate) : 0;
  trackTelemetry("admin_metrics_fetch", { reads: readEstimate });
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
  if (code.includes("user-not-found")) {
    return "Conta não encontrada para este email.";
  }
  if (code.includes("invalid-email")) {
    return "Email inválido.";
  }
  if (code.includes("operation-not-allowed")) {
    return "Login por email/senha não está habilitado no Firebase Auth.";
  }
  if (code.includes("network-request-failed")) {
    return "Falha de conexão. Verifique a internet e tente novamente.";
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

  const credits = await getUserCredits(userId, { forceRefresh: true }).catch(() => null);
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
    hasLoadedCreditsData = true;
    setCachedUserCredits(userId, currentCredits || { balance: currentBalance });
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
    hasLoadedCreditsData = true;
    setCachedUserCredits(userId, currentCredits || { balance: nextBalance });
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

function consumeOneLocalCreditIfPossible() {
  if (!currentUser) return false;
  const directBalance = getCreditsBalanceValue();
  const storedBalance = parseCreditsBalance(readLocalCreditsState(currentUser.uid)?.balance);
  const baseBalance = directBalance !== null ? directBalance : storedBalance;
  if (baseBalance === null || baseBalance <= 0) return false;

  const nextBalance = Math.max(0, baseBalance - 1);
  currentCredits = {
    ...(currentCredits || {}),
    balance: nextBalance
  };
  hasLoadedCreditsData = true;
  setCachedUserCredits(currentUser.uid, currentCredits || { balance: nextBalance });
  writeLocalCreditsBalance(currentUser.uid, nextBalance);
  updateVisibleCreditsLabel();
  return true;
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
  const now = Date.now();
  const localBalance = getCreditsBalanceValue(currentCredits);
  if (
    LOW_COST_MODE &&
    localBalance !== null &&
    now - lastCreditsRemoteRefreshAt < CREDITS_REMOTE_REFRESH_MIN_INTERVAL_MS
  ) {
    return localBalance;
  }

  try {
    const credits = await Promise.race([
      getUserCredits(currentUser.uid),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("credits_fetch_timeout")), CREDIT_API_TIMEOUT_MS)
      )
    ]);
    currentCredits = applyLocalCreditsBalance(credits || { balance: 0 }, true);
    hasLoadedCreditsData = true;
    setCachedUserCredits(currentUser.uid, currentCredits || { balance: 0 });
    lastCreditsRemoteRefreshAt = now;
    trackTelemetry("credits_remote_refresh", { reads: 1 });
    return getCreditsBalanceValue(currentCredits);
  } catch (error) {
    currentCredits = applyLocalCreditsBalance(currentCredits || { balance: 0 }, false);
    hasLoadedCreditsData = true;
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
    const result = await Promise.race([
      consumeUserCredit(currentUser.uid, mode, requestId),
      new Promise((_, reject) =>
        setTimeout(() => {
          const timeoutError = new Error("consume_credit_timeout");
          timeoutError.code = "consume_credit_timeout";
          reject(timeoutError);
        }, CREDIT_API_TIMEOUT_MS)
      )
    ]);
    const parsedBalance = Number(result?.balance);
    const safeBalance = Number.isFinite(parsedBalance) ? Math.max(0, Math.floor(parsedBalance)) : 0;
    currentCredits = {
      ...(currentCredits || {}),
      balance: safeBalance
    };
    hasLoadedCreditsData = true;
    setCachedUserCredits(currentUser.uid, currentCredits || { balance: safeBalance });
    writeLocalCreditsBalance(currentUser.uid, safeBalance, true);
    updateVisibleCreditsLabel();
    trackTelemetry("simulado_start_consume", { reads: 2, writes: 2 });
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
    currentCredits = {
      ...(currentCredits || {}),
      balance: safeBalance
    };
    hasLoadedCreditsData = true;
    setCachedUserCredits(currentUser.uid, currentCredits || { balance: safeBalance });
    writeLocalCreditsBalance(currentUser.uid, safeBalance, true);
    updateVisibleCreditsLabel();
    trackTelemetry("simulado_start_consume", { reads: 2, writes: 2 });

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
    hasLoadedCreditsData = true;
    setCachedUserCredits(currentUser.uid, currentCredits || { balance: safeBalance });
    writeLocalCreditsBalance(currentUser.uid, safeBalance, true);
    updateVisibleCreditsLabel();
    trackTelemetry("simulado_start_consume", { reads: 2, writes: 2 });
    return safeBalance;
  }
}

async function startSigwxWithCredit(mode) {
  return startSimuladoWithCredit("sigwx", mode);
}

async function startMetarTafWithCredit(mode) {
  return startSimuladoWithCredit("metar_taf", mode);
}

async function startNuvensWithCredit(mode) {
  return startSimuladoWithCredit("nuvens", mode);
}

async function startSinaisLuminososWithCredit(mode) {
  return startSimuladoWithCredit("sinais_luminosos", mode);
}

async function startSimuladoWithCredit(simuladoKey = "sigwx", mode = "training") {
  if (!currentUser) {
    renderLogin();
    return;
  }
  const safeKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  const safeMode = mode === "evaluation" ? "evaluation" : "training";
  const runnableKeys = new Set(["sigwx", "metar_taf", "nuvens", "sinais_luminosos"]);
  if (!runnableKeys.has(safeKey)) {
    showToast("Este simulado ainda está em desenvolvimento.", "info");
    return;
  }
  if (!isSessionModeAvailable(safeKey, safeMode)) {
    showToast(SESSION_BLOCKED_MESSAGE, "info");
    return;
  }
  if (safeKey === "sigwx") {
    if (safeMode === "evaluation") {
      renderSigwxEvaluation();
      return;
    }
    renderSigwx();
    return;
  }
  if (safeKey === "sinais_luminosos") {
    if (safeMode === "evaluation") {
      renderSinaisLuminososEvaluation();
      return;
    }
    renderSinaisLuminosos();
    return;
  }
  if (safeKey === "nuvens") {
    if (safeMode === "evaluation") {
      renderNuvensEvaluation();
      return;
    }
    renderNuvens();
    return;
  }
  if (safeMode === "evaluation") {
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
        if (getModuleByKey(activeSimuladoKey)) {
          renderModuleHub(activeSimuladoKey);
          return;
        }
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
        hasLoadedCreditsData = true;
        setCachedUserCredits(currentUser.uid, currentCredits || { balance: 0 });
        writeLocalCreditsBalance(currentUser.uid, 0);
        updateVisibleCreditsLabel();
        showToast(INSUFFICIENT_CREDITS_MESSAGE, "error");
        return;
      }

      const code = String(error?.code || error?.message || "").toLowerCase();
      if (IS_LOCAL_DEV_HOST && code.includes("permission-denied")) {
        if (consumeOneLocalCreditIfPossible()) {
          modalEl.classList.add("hidden");
          if (typeof onStart === "function") onStart();
          return;
        }
        currentCredits = {
          ...(currentCredits || {}),
          balance: 0
        };
        hasLoadedCreditsData = true;
        setCachedUserCredits(currentUser.uid, currentCredits || { balance: 0 });
        writeLocalCreditsBalance(currentUser.uid, 0);
        updateVisibleCreditsLabel();
        showToast(INSUFFICIENT_CREDITS_MESSAGE, "error");
        return;
      }

      const isTransientCreditsError =
        code.includes("timeout") ||
        code.includes("abort") ||
        code.includes("network") ||
        code.includes("failed to fetch") ||
        code.includes("resource-exhausted") ||
        code.includes("quota") ||
        code.includes("429");
      if (isTransientCreditsError) {
        if (consumeOneLocalCreditIfPossible()) {
          modalEl.classList.add("hidden");
          if (typeof onStart === "function") onStart();
          showToast("Crédito descontado localmente. Iniciado em modo contingência.", "info");
          return;
        }
      }

      // Contingência final: se o crédito remoto falhar por qualquer motivo (exceto sem créditos),
      // não bloqueia o treino para evitar travamento operacional.
      if (consumeOneLocalCreditIfPossible()) {
        modalEl.classList.add("hidden");
        if (typeof onStart === "function") onStart();
        showToast("Treino iniciado. Crédito descontado localmente (contingência).", "info");
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
async function renderHomePublic({ replacePath = false } = {}) {
  cleanupEvaluationFlow();
  updateBrowserPath(APP_ROUTES.home, { replace: replacePath });
  try {
    const availability = await getSessionAvailability().catch(() => null);
    trackTelemetry("session_availability_fetch", { reads: 1 });
    sessionAvailability = normalizeSessionAvailability(availability);
  } catch (_) {
    sessionAvailability = normalizeSessionAvailability(sessionAvailability);
  }

  app.innerHTML = homePublicView({
    logged: !!currentUser,
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    sessionAvailability
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

function renderLogin({ replacePath = false } = {}) {
  cleanupEvaluationFlow();
  updateBrowserPath(APP_ROUTES.home, { replace: replacePath });
  app.innerHTML = loginView({ isAdmin: isAdminUser(), userLabel: getUserLabel() });
  setupGlobalMenu();
  setupHeaderLogin();
  setupLoginForm();
  setupRegisterLink();
  setupContact();
  setupFooterLinks();
}

function renderRegister({ replacePath = false } = {}) {
  cleanupEvaluationFlow();
  updateBrowserPath(APP_ROUTES.home, { replace: replacePath });
  app.innerHTML = registerView({ isAdmin: isAdminUser(), userLabel: getUserLabel() });
  setupGlobalMenu();
  setupHeaderLogin();
  setupRegisterForm();
  setupLoginLinkAlt();
  setupContact();
  setupFooterLinks();
}

async function renderDashboard({ replacePath = false } = {}) {
  cleanupEvaluationFlow();
  updateBrowserPath(APP_ROUTES.dashboard, { replace: replacePath });
  try {
    const availability = await getSessionAvailability().catch(() => null);
    trackTelemetry("session_availability_fetch", { reads: 1 });
    sessionAvailability = normalizeSessionAvailability(availability);
  } catch (_) {
    sessionAvailability = normalizeSessionAvailability(sessionAvailability);
  }

  app.innerHTML = dashboardView(currentUser, {
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    canStartSessions: true,
    sessionAvailability
  });
  setupLogout();
  setupDashboardActions();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
  warmupApi();
}

async function renderModuleHub(simuladoKey = "sigwx", { replacePath = false } = {}) {
  cleanupEvaluationFlow();
  const safeKey = getModuleByKey(simuladoKey) ? simuladoKey : (SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx");
  const moduleConfig = getModuleByKey(safeKey);
  if (!moduleConfig) {
    await renderDashboard({ replacePath });
    return;
  }
  const runnableKeys = new Set(["sigwx", "metar_taf", "nuvens", "sinais_luminosos"]);
  const canStartRealSession = runnableKeys.has(safeKey);

  updateBrowserPath(getModulePathByKey(safeKey), { replace: replacePath });

  try {
    const availability = await getSessionAvailability().catch(() => null);
    trackTelemetry("session_availability_fetch", { reads: 1 });
    sessionAvailability = normalizeSessionAvailability(availability);
  } catch (_) {
    sessionAvailability = normalizeSessionAvailability(sessionAvailability);
  }

  app.innerHTML = simuladoModuleView(moduleConfig, {
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    trainingEnabled: canStartRealSession && isSessionModeAvailable(safeKey, "training"),
    evaluationEnabled: canStartRealSession && isSessionModeAvailable(safeKey, "evaluation")
  });

  setupLogout();
  setupModuleHubActions(safeKey);
  setupHomeModeCarousels();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

async function renderMetarTafHub() {
  cleanupEvaluationFlow();
  try {
    const availability = await getSessionAvailability().catch(() => null);
    trackTelemetry("session_availability_fetch", { reads: 1 });
    sessionAvailability = normalizeSessionAvailability(availability);
  } catch (_) {
    sessionAvailability = normalizeSessionAvailability(sessionAvailability);
  }

  app.innerHTML = metarTafHubView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    canStartSessions: true,
    sessionAvailability
  });
  setupLogout();
  setupMetarTafHubActions();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

async function renderSinaisLuminososHub() {
  cleanupEvaluationFlow();
  try {
    const availability = await getSessionAvailability().catch(() => null);
    trackTelemetry("session_availability_fetch", { reads: 1 });
    sessionAvailability = normalizeSessionAvailability(availability);
  } catch (_) {
    sessionAvailability = normalizeSessionAvailability(sessionAvailability);
  }

  app.innerHTML = sinaisLuminososHubView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    canStartSessions: true,
    sessionAvailability
  });
  setupLogout();
  setupSinaisLuminososHubActions();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
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
    } else if (!LOW_COST_MODE) {
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
    } else if (!LOW_COST_MODE) {
      ensureQuestionBankLoaded("sigwx_evaluation", { force: false, silent: true }).catch(() => {});
    }
    questions = consumePendingEvaluationQuestions("sigwx", questions);
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
    await ensureQuestionBankLoaded("metar_taf_training", { force: false, silent: true });
    const questions = getQuestionsForSimuladoMode("metar_taf", "training");
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
    await ensureQuestionBankLoaded("metar_taf_evaluation", { force: false, silent: true });
    const allQuestions = getQuestionsForSimuladoMode("metar_taf", "evaluation");
    const questions = consumePendingEvaluationQuestions("metar_taf", allQuestions);
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

function renderNuvens() {
  cleanupEvaluationFlow();
  activeSimuladoKey = "nuvens";
  setSimuladoMode("training");
  app.innerHTML = sigwxView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel: getSimuladoLabel("nuvens")
  });

  requestAnimationFrame(async () => {
    await ensureQuestionBankLoaded("nuvens_training", { force: false, silent: true });
    const questions = getQuestionsForSimuladoMode("nuvens", "training");
    startSigwxSimulado({ questions, questionBank: "training" });
    setupTrainingStartModal();
  });

  setupLogout();
  setupGlobalMenu();
  setupSimuladoNavToggle();
  setupContact();
  setupFooterLinks();
}

function renderNuvensEvaluation() {
  cleanupEvaluationFlow();
  activeSimuladoKey = "nuvens";
  setSimuladoMode("evaluation");
  app.innerHTML = sigwxEvaluationView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel: getSimuladoLabel("nuvens")
  });

  requestAnimationFrame(async () => {
    await ensureQuestionBankLoaded("nuvens_evaluation", { force: false, silent: true });
    const allQuestions = getQuestionsForSimuladoMode("nuvens", "evaluation");
    const questions = consumePendingEvaluationQuestions("nuvens", allQuestions);
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
    renderSimuladoEvaluationResults(e.detail, { simuladoKey: "nuvens" });
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

function renderSinaisLuminosos() {
  cleanupEvaluationFlow();
  activeSimuladoKey = "sinais_luminosos";
  setSimuladoMode("training");
  app.innerHTML = sigwxView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel: getSimuladoLabel("sinais_luminosos")
  });

  requestAnimationFrame(async () => {
    await ensureQuestionBankLoaded("sinais_luminosos_training", { force: false, silent: true });
    const questions = getQuestionsForSimuladoMode("sinais_luminosos", "training");
    startSigwxSimulado({ questions, questionBank: "training" });
    setupTrainingStartModal();
  });

  setupLogout();
  setupGlobalMenu();
  setupSimuladoNavToggle();
  setupContact();
  setupFooterLinks();
}

function renderSinaisLuminososEvaluation() {
  cleanupEvaluationFlow();
  activeSimuladoKey = "sinais_luminosos";
  setSimuladoMode("evaluation");
  app.innerHTML = sigwxEvaluationView({
    isAdmin: isAdminUser(),
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    simuladoLabel: getSimuladoLabel("sinais_luminosos")
  });

  requestAnimationFrame(async () => {
    await ensureQuestionBankLoaded("sinais_luminosos_evaluation", { force: false, silent: true });
    const allQuestions = getQuestionsForSimuladoMode("sinais_luminosos", "evaluation");
    const questions = consumePendingEvaluationQuestions("sinais_luminosos", allQuestions);
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
    renderSimuladoEvaluationResults(e.detail, { simuladoKey: "sinais_luminosos" });
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
      questionId: q.id,
      controlCode: String(q?.controlCode || "").trim() || buildQuestionControlCode(activeSimuladoKey, q?.id),
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
    simuladoLabel,
    simuladoKey: activeSimuladoKey
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
    trackTelemetry("simulado_finish_save", { writes: 1 });
  } catch (error) {
    console.error("Falha ao salvar avaliação:", error);
    alert("Falha ao salvar a avaliação. Verifique as regras do Firestore.");
  }
}

function setupEvaluationResultsActions(items, { simuladoKey = "sigwx" } = {}) {
  const safeKey = SIMULADO_BANKS[simuladoKey] ? simuladoKey : "sigwx";
  const toTrainingBtn = document.getElementById("evalToTraining");
  const retryBtn = document.getElementById("evalRetry");
  const retryWrongBtn = document.getElementById("evalRetryWrong");
  const backToSimuladoBtn = document.getElementById("evalBackToSimulado");

  const applyNoMediaState = (imgEl) => {
    const mediaEl = imgEl?.closest(".eval-item-media");
    const itemEl = imgEl?.closest(".eval-item");
    if (mediaEl) {
      mediaEl.style.display = "none";
    }
    if (itemEl) {
      itemEl.classList.remove("has-media");
      itemEl.classList.add("no-media");
    }
  };

  document.querySelectorAll(".eval-item-media img").forEach((img) => {
    img.addEventListener("error", () => applyNoMediaState(img));
    if (img.complete && (!Number.isFinite(img.naturalWidth) || img.naturalWidth <= 0)) {
      applyNoMediaState(img);
    }
  });

  toTrainingBtn?.addEventListener("click", () => {
    startSimuladoWithCredit(safeKey, "training");
  });

  retryBtn?.addEventListener("click", () => {
    pendingEvaluationRetryFilter = null;
    startSimuladoWithCredit(safeKey, "evaluation");
  });

  retryWrongBtn?.addEventListener("click", () => {
    const wrongQuestionIds = (Array.isArray(items) ? items : [])
      .filter((item) => item?.isWrong)
      .map((item) => item?.questionId)
      .filter((id) => id !== null && id !== undefined);

    if (!wrongQuestionIds.length) {
      showToast("Nenhuma questão errada para refazer.", "info");
      return;
    }

    pendingEvaluationRetryFilter = {
      simuladoKey: safeKey,
      questionIds: wrongQuestionIds
    };
    startSimuladoWithCredit(safeKey, "evaluation");
  });

  backToSimuladoBtn?.addEventListener("click", () => {
    if (getModuleByKey(safeKey)) {
      renderModuleHub(safeKey);
      return;
    }
    renderDashboard();
  });

  document.querySelectorAll(".eval-review").forEach((button) => {
    button.addEventListener("click", () => {
      const itemEl = button.closest(".eval-item");
      const explanationEl = itemEl?.querySelector(".eval-explanation");
      if (!explanationEl) return;
      explanationEl.classList.add("is-focus");
      explanationEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      try {
        explanationEl.focus({ preventScroll: true });
      } catch (_) {
        // fallback silencioso quando o navegador não suporta focus options
      }
      window.setTimeout(() => {
        explanationEl.classList.remove("is-focus");
      }, 2000);
    });
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
        const codeSuffix = item?.controlCode ? ` [${item.controlCode}]` : "";
        subjectInput.value = `Erro na questão ${index}${codeSuffix} (${getSimuladoLabel(safeKey)} - Avaliação)`;
      }
      if (messageInput && item) {
        messageInput.value =
          `Questão ${index}${item.controlCode ? ` (${item.controlCode})` : ""}:\n${item.question}\n\n` +
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
        if (getModuleByKey(activeSimuladoKey)) {
          renderModuleHub(activeSimuladoKey);
          return;
        }
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
        hasLoadedCreditsData = true;
        setCachedUserCredits(currentUser.uid, currentCredits || { balance: 0 });
        writeLocalCreditsBalance(currentUser.uid, 0);
        updateVisibleCreditsLabel();
        showToast(INSUFFICIENT_CREDITS_MESSAGE, "error");
        return;
      }

      const code = String(error?.code || error?.message || "").toLowerCase();
      if (IS_LOCAL_DEV_HOST && code.includes("permission-denied")) {
        if (consumeOneLocalCreditIfPossible()) {
          modalEl.classList.add("hidden");
          evaluationStartAtMs = Date.now();
          startTimer();
          return;
        }
        currentCredits = {
          ...(currentCredits || {}),
          balance: 0
        };
        hasLoadedCreditsData = true;
        setCachedUserCredits(currentUser.uid, currentCredits || { balance: 0 });
        writeLocalCreditsBalance(currentUser.uid, 0);
        updateVisibleCreditsLabel();
        showToast(INSUFFICIENT_CREDITS_MESSAGE, "error");
        return;
      }

      const isTransientCreditsError =
        code.includes("timeout") ||
        code.includes("abort") ||
        code.includes("network") ||
        code.includes("failed to fetch") ||
        code.includes("resource-exhausted") ||
        code.includes("quota") ||
        code.includes("429");
      if (isTransientCreditsError) {
        if (consumeOneLocalCreditIfPossible()) {
          modalEl.classList.add("hidden");
          evaluationStartAtMs = Date.now();
          startTimer();
          showToast("Crédito descontado localmente. Iniciado em modo contingência.", "info");
          return;
        }
      }

      // Contingência final: se o crédito remoto falhar por qualquer motivo (exceto sem créditos),
      // não bloqueia a avaliação para evitar travamento operacional.
      if (consumeOneLocalCreditIfPossible()) {
        modalEl.classList.add("hidden");
        evaluationStartAtMs = Date.now();
        startTimer();
        showToast("Avaliação iniciada. Crédito descontado localmente (contingência).", "info");
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

function renderProfileScreen({ profile = null, evaluations = [], loading = false, mode = "summary" } = {}) {
  cleanupEvaluationFlow();
  const showEvaluationHistory = mode === "evaluations";
  const showCreditHistory = mode === "credits";
  const evaluationStats = {
    total: Number(profile?.evaluationStatsTotal),
    approved: Number(profile?.evaluationStatsApproved),
    percentageSum: Number(profile?.evaluationStatsPercentageSum)
  };
  app.innerHTML = profileView({
    user: currentUser,
    profile,
    evaluations,
    evaluationStats,
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
    globalNotice: globalNoticeMessage,
    showEvaluationHistory,
    showCreditHistory
  });
}

function bindProfileScreenActions(profile, evaluations, mode = "summary") {
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupProfileModeActions();
  setupProfileActions(evaluations);
  setupProfileForm(profile);
  if (mode === "evaluations") {
    setupProfileFilters();
  }
  setupCreditsActions();
  if (mode === "credits") {
    setupCreditsHistoryActions();
  }
  restoreCreditsStatus();
}

function rerenderProfileFromCache(mode = "summary") {
  renderProfileScreen({
    profile: currentProfile,
    evaluations: profileEvaluationsCache,
    loading: false,
    mode
  });
  bindProfileScreenActions(currentProfile, profileEvaluationsCache, mode);
}

async function renderProfile() {
  const shouldHydrate =
    !hasLoadedProfileData ||
    !hasLoadedCreditsData ||
    !hasLoadedGlobalNoticeData;

  if (shouldHydrate) {
    creditHistoryLoading = false;
    creditHistoryLoadingMore = false;
    profileShowAllEvaluations = false;
    profileVisibleSpentCredits = 7;
    renderProfileScreen({ profile: currentProfile, evaluations: [], loading: true, mode: "summary" });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
  } else {
    renderProfileScreen({ profile: currentProfile, evaluations: [], loading: false, mode: "summary" });
    bindProfileScreenActions(currentProfile, [], "summary");
    showWelcomeAnnouncementIfPending();
    return;
  }

  if (!currentUser) return;

  if (!profileDataLoadPromise) {
    profileDataLoadPromise = (async () => {
      const pendingTasks = [];

      if (!hasLoadedProfileData) {
        pendingTasks.push(
          getUserProfile(currentUser.uid)
            .then((profile) => {
              currentProfile = profile || null;
              hasLoadedProfileData = true;
              trackTelemetry("profile_load_profile", { reads: 1 });
            })
            .catch((error) => {
              currentProfile = null;
              hasLoadedProfileData = true;
              console.error("Erro ao carregar perfil:", error);
            })
        );
      }

      if (!hasLoadedCreditsData) {
        pendingTasks.push(
          getUserCredits(currentUser.uid)
            .then((credits) => {
              currentCredits = applyLocalCreditsBalance(credits || { balance: 0 }, true);
              hasLoadedCreditsData = true;
              setCachedUserCredits(currentUser.uid, currentCredits || { balance: 0 });
              trackTelemetry("profile_load_credits", { reads: 1 });
            })
            .catch(() => {
              currentCredits = applyLocalCreditsBalance(currentCredits || { balance: 0 }, false);
              hasLoadedCreditsData = true;
              console.warn("PreFlight credits fetch failed for uid:", currentUser.uid);
            })
        );
      }

      if (!hasLoadedGlobalNoticeData) {
        pendingTasks.push(
          getGlobalNotice()
            .then((notice) => {
              globalNoticeMessage = String(notice?.message || "").trim();
              hasLoadedGlobalNoticeData = true;
              trackTelemetry("profile_load_notice", { reads: 1 });
            })
            .catch((error) => {
              globalNoticeMessage = "";
              hasLoadedGlobalNoticeData = true;
              console.warn("PreFlight global notice fetch failed:", error);
            })
        );
      }

      await Promise.all(pendingTasks);
    })().finally(() => {
      profileDataLoadPromise = null;
    });
  }

  await profileDataLoadPromise;
  renderProfileScreen({ profile: currentProfile, evaluations: [], loading: false, mode: "summary" });
  bindProfileScreenActions(currentProfile, [], "summary");
  showWelcomeAnnouncementIfPending();
}

async function renderProfileEvaluations() {
  if (!currentUser) {
    renderLogin();
    return;
  }

  const shouldHydrate =
    !hasLoadedEvaluationsData ||
    !hasLoadedProfileData ||
    !hasLoadedCreditsData ||
    !hasLoadedGlobalNoticeData;

  if (shouldHydrate) {
    profileShowAllEvaluations = false;
    renderProfileScreen({
      profile: currentProfile,
      evaluations: profileEvaluationsCache,
      loading: true,
      mode: "evaluations"
    });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
  } else {
    renderProfileScreen({
      profile: currentProfile,
      evaluations: profileEvaluationsCache,
      loading: false,
      mode: "evaluations"
    });
    bindProfileScreenActions(currentProfile, profileEvaluationsCache, "evaluations");
    return;
  }

  const pendingTasks = [];

  if (!hasLoadedEvaluationsData) {
    pendingTasks.push(
      getEvaluationsByUser(currentUser.uid)
        .then((items) => {
          profileEvaluationsCache = Array.isArray(items) ? items : [];
          hasLoadedEvaluationsData = true;
          trackTelemetry("profile_load_evaluations", {
            reads: Array.isArray(items) ? items.length : 0
          });
        })
        .catch((error) => {
          profileEvaluationsCache = [];
          hasLoadedEvaluationsData = true;
          console.error("Erro ao carregar avaliações:", error);
        })
    );
  }

  if (!hasLoadedProfileData) {
    pendingTasks.push(
      getUserProfile(currentUser.uid)
        .then((profile) => {
          currentProfile = profile || null;
          hasLoadedProfileData = true;
          trackTelemetry("profile_load_profile", { reads: 1 });
        })
        .catch((error) => {
          currentProfile = null;
          hasLoadedProfileData = true;
          console.error("Erro ao carregar perfil:", error);
        })
    );
  }

  if (!hasLoadedCreditsData) {
    pendingTasks.push(
      getUserCredits(currentUser.uid)
        .then((credits) => {
          currentCredits = applyLocalCreditsBalance(credits || { balance: 0 }, true);
          hasLoadedCreditsData = true;
          setCachedUserCredits(currentUser.uid, currentCredits || { balance: 0 });
          trackTelemetry("profile_load_credits", { reads: 1 });
        })
        .catch(() => {
          currentCredits = applyLocalCreditsBalance(currentCredits || { balance: 0 }, false);
          hasLoadedCreditsData = true;
          console.warn("PreFlight credits fetch failed for uid:", currentUser.uid);
        })
    );
  }

  if (!hasLoadedGlobalNoticeData) {
    pendingTasks.push(
      getGlobalNotice()
        .then((notice) => {
          globalNoticeMessage = String(notice?.message || "").trim();
          hasLoadedGlobalNoticeData = true;
          trackTelemetry("profile_load_notice", { reads: 1 });
        })
        .catch((error) => {
          globalNoticeMessage = "";
          hasLoadedGlobalNoticeData = true;
          console.warn("PreFlight global notice fetch failed:", error);
        })
    );
  }

  await Promise.all(pendingTasks);
  renderProfileScreen({
    profile: currentProfile,
    evaluations: profileEvaluationsCache,
    loading: false,
    mode: "evaluations"
  });
  bindProfileScreenActions(currentProfile, profileEvaluationsCache, "evaluations");
}

async function renderAdmin() {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }
  adminPanelScreen = "dashboard";
  adminUsersCursor = null;
  adminUsersHasMore = false;
  adminUsersLoadingMore = false;
  adminMetricsFromApi = false;
  adminReportData = null;

  app.innerHTML = adminView({
    users: [],
    loading: false,
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    metrics: enrichAdminMetrics(
      computeAdminMetrics({ users: [], evaluations: [], transactions: [], range: adminMetricsRange })
    ),
    metricsRange: adminMetricsRange,
    lightMode: adminLightMode,
    usersHasMore: false,
    usersLoadingMore: false,
    mode: "dashboard",
    sessionAvailability,
    simuladoQuestionCounts: getAdminSimuladoQuestionCounts()
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupAdminActions();

  try {
    const globalNotice = await getGlobalNotice().catch(() => null);
    trackTelemetry("admin_notice_fetch", { reads: 1 });
    globalNoticeMessage = String(globalNotice?.message || "").trim();
    const availability = await getSessionAvailability().catch(() => null);
    trackTelemetry("session_availability_fetch", { reads: 1 });
    sessionAvailability = normalizeSessionAvailability(availability);
    if (!adminMetricsSummary || !adminMetricsFromApi) {
      const metrics = await fetchAdminMetricsFromApi({ range: adminMetricsRange }).catch(() => null);
      if (metrics) {
        adminMetricsSummary = enrichAdminMetrics(metrics);
        adminMetricsFromApi = true;
      }
    }
    rerenderAdminWithCache();
  } catch (error) {
    console.error("Erro ao carregar aviso global:", error);
    sessionAvailability = normalizeSessionAvailability(sessionAvailability);
    rerenderAdminWithCache("Não foi possível carregar o aviso global agora.");
  }
}

function getAdminSimuladoQuestionCounts() {
  return SESSION_SIMULADO_KEYS.reduce((acc, simuladoKey) => {
    if (!SIMULADO_BANKS[simuladoKey]) {
      acc[simuladoKey] = {
        training: 0,
        evaluation: 0,
        total: 0
      };
      return acc;
    }
    const trainingCount = getQuestionsForSimuladoMode(simuladoKey, "training").length;
    const evaluationCount = getQuestionsForSimuladoMode(simuladoKey, "evaluation").length;
    acc[simuladoKey] = {
      training: Number(trainingCount),
      evaluation: Number(evaluationCount),
      total: Number(trainingCount) + Number(evaluationCount)
    };
    return acc;
  }, {});
}

function buildCurrentAdminReportData() {
  const metrics = enrichAdminMetrics(adminMetricsSummary || computeAdminMetrics({
    users: adminUsersCache,
    evaluations: adminMetricsData.evaluations,
    transactions: adminMetricsData.transactions,
    range: adminMetricsRange
  }));
  return buildReportData({
    period: adminMetricsRange,
    metrics,
    users: adminUsersCache,
    generatedAt: new Date(),
    simuladoLabels: ADMIN_SIMULADO_CATALOG
  });
}

async function mapAdminUsersWithCredits(items = []) {
  return Promise.all(
    (Array.isArray(items) ? items : []).map(async (u) => {
      const targetId = u.uid || u.id;
      const credit = await getUserCredits(targetId).catch(() => null);
      trackTelemetry("admin_user_credit_fetch", { reads: 1 });
      const sessions = adminLightMode
        ? { trainingCount: null, evaluationCount: null }
        : await getUserSessionCounts(targetId).catch(() => ({ trainingCount: 0, evaluationCount: 0 }));
      const rawBalance = credit?.balance ?? credit?.credits ?? credit?.saldo ?? 0;
      const balance = getEffectiveBalanceForUser(targetId, rawBalance);
      return {
        ...u,
        creditsBalance: Number.isFinite(balance) ? balance : 0,
        trainingCount: Number.isFinite(Number(sessions.trainingCount)) ? Number(sessions.trainingCount) : 0,
        evaluationCount: Number.isFinite(Number(sessions.evaluationCount)) ? Number(sessions.evaluationCount) : 0
      };
    })
  );
}

async function renderAdminUsers({ forceRefresh = false } = {}) {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }

  adminPanelScreen = "users";
  if (forceRefresh) {
    adminUsersCache = [];
    adminUsersCursor = null;
    adminUsersHasMore = false;
    adminUsersLoadingMore = false;
  }

  app.innerHTML = adminView({
    users: adminUsersCache,
    loading: !adminUsersCache.length,
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    notice: "",
    globalNotice: globalNoticeMessage,
    metrics: enrichAdminMetrics(adminMetricsSummary || {}),
    metricsRange: adminMetricsRange,
    lightMode: adminLightMode,
    usersHasMore: adminUsersHasMore,
    usersLoadingMore: adminUsersLoadingMore,
    mode: "users",
    sessionAvailability,
    simuladoQuestionCounts: getAdminSimuladoQuestionCounts()
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupAdminActions();

  if (adminUsersCache.length && !forceRefresh) return;

  try {
    const firstPage = await getUsersPage({ pageSize: ADMIN_USERS_PAGE_SIZE, cursor: null });
    trackTelemetry("admin_users_page_fetch", {
      reads: Array.isArray(firstPage?.items) ? firstPage.items.length : 0
    });

    adminUsersCache = await mapAdminUsersWithCredits(firstPage.items);
    adminUsersCursor = firstPage.nextCursor;
    adminUsersHasMore = !!firstPage.hasMore;
    adminUsersLoadingMore = false;
    rerenderAdminWithCache(
      adminUsersCache.length === 0 ? "Nenhum usuário retornado. Verifique se há usuários cadastrados." : ""
    );
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    rerenderAdminWithCache("Erro ao carregar usuários. Verifique as regras do Firestore.");
  }
}

async function renderAdminMetrics({ forceRefresh = false } = {}) {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }

  adminPanelScreen = "dashboard";
  app.innerHTML = adminView({
    users: [],
    loading: false,
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    notice: "",
    globalNotice: globalNoticeMessage,
    metrics: enrichAdminMetrics(adminMetricsSummary || {}),
    metricsRange: adminMetricsRange,
    lightMode: adminLightMode,
    usersHasMore: false,
    usersLoadingMore: false,
    mode: "dashboard",
    sessionAvailability,
    simuladoQuestionCounts: getAdminSimuladoQuestionCounts()
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupAdminActions();

  if (adminMetricsSummary && adminMetricsFromApi && !forceRefresh) return;

  try {
    const metrics = await fetchAdminMetricsFromApi({ range: adminMetricsRange });
    if (metrics) {
      adminMetricsSummary = enrichAdminMetrics(metrics);
      adminMetricsFromApi = true;
    } else {
      adminMetricsSummary = enrichAdminMetrics(computeAdminMetrics({
        users: adminUsersCache,
        evaluations: adminMetricsData.evaluations,
        transactions: adminMetricsData.transactions,
        range: adminMetricsRange
      }));
      adminMetricsFromApi = false;
    }
  } catch (error) {
    console.warn("Admin metrics API failed; usando cache local leve:", error);
    adminMetricsSummary = enrichAdminMetrics(computeAdminMetrics({
      users: adminUsersCache,
      evaluations: adminMetricsData.evaluations,
      transactions: adminMetricsData.transactions,
      range: adminMetricsRange
    }));
    adminMetricsFromApi = false;
  }

  rerenderAdminWithCache();
}

async function renderAdminSimulados() {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }
  adminPanelScreen = "simulados";
  app.innerHTML = adminView({
    users: [],
    loading: false,
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    notice: "",
    globalNotice: globalNoticeMessage,
    metrics: enrichAdminMetrics(adminMetricsSummary || {}),
    metricsRange: adminMetricsRange,
    lightMode: adminLightMode,
    usersHasMore: false,
    usersLoadingMore: false,
    mode: "simulados",
    sessionAvailability,
    simuladoQuestionCounts: getAdminSimuladoQuestionCounts()
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupAdminActions();

  try {
    await preloadQuestionBanks();
    rerenderAdminWithCache();
  } catch (error) {
    console.warn("Falha ao carregar bancos de questões para contagem no admin:", error);
  }
}

async function renderAdminFinanceiro({ forceRefresh = false } = {}) {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }

  adminPanelScreen = "financeiro";
  app.innerHTML = adminView({
    users: [],
    loading: false,
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    notice: "",
    globalNotice: globalNoticeMessage,
    metrics: enrichAdminMetrics(adminMetricsSummary || {}),
    metricsRange: adminMetricsRange,
    lightMode: adminLightMode,
    usersHasMore: false,
    usersLoadingMore: false,
    mode: "financeiro",
    sessionAvailability,
    simuladoQuestionCounts: getAdminSimuladoQuestionCounts()
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupAdminActions();

  if (adminMetricsSummary && adminMetricsFromApi && !forceRefresh) return;

  try {
    const metrics = await fetchAdminMetricsFromApi({ range: adminMetricsRange });
    if (metrics) {
      adminMetricsSummary = enrichAdminMetrics(metrics);
      adminMetricsFromApi = true;
    } else {
      adminMetricsSummary = enrichAdminMetrics(computeAdminMetrics({
        users: adminUsersCache,
        evaluations: adminMetricsData.evaluations,
        transactions: adminMetricsData.transactions,
        range: adminMetricsRange
      }));
      adminMetricsFromApi = false;
    }
  } catch (error) {
    console.warn("Admin financeiro API failed; usando cache local leve:", error);
    adminMetricsSummary = enrichAdminMetrics(computeAdminMetrics({
      users: adminUsersCache,
      evaluations: adminMetricsData.evaluations,
      transactions: adminMetricsData.transactions,
      range: adminMetricsRange
    }));
    adminMetricsFromApi = false;
  }

  rerenderAdminWithCache();
}

async function renderAdminReport({ forceRefresh = false } = {}) {
  cleanupEvaluationFlow();
  if (!isAdminUser()) {
    renderHomePublic();
    return;
  }

  adminPanelScreen = "report";
  adminReportData = null;
  app.innerHTML = adminReportView({
    reportData: {
      meta: {
        periodLabel: adminMetricsRange === "today" ? "Hoje" : adminMetricsRange === "7d" ? "7 dias" : "30 dias",
        generatedAtText: "Gerando relatório...",
        periodMode: "period"
      },
      resumo: {},
      tabelas: { simulados: [], usuarios: [], questoesMaisErradas: [] }
    },
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel()
  });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupAdminActions();

  if (!adminMetricsSummary || forceRefresh) {
    try {
      const metrics = await fetchAdminMetricsFromApi({ range: adminMetricsRange });
      if (metrics) {
        adminMetricsSummary = enrichAdminMetrics(metrics);
        adminMetricsFromApi = true;
      }
    } catch (error) {
      console.warn("Relatório: falha ao atualizar métricas por período; usando fallback local.", error);
      adminMetricsSummary = enrichAdminMetrics(computeAdminMetrics({
        users: adminUsersCache,
        evaluations: adminMetricsData.evaluations,
        transactions: adminMetricsData.transactions,
        range: adminMetricsRange
      }));
      adminMetricsFromApi = false;
    }
  }

  adminReportData = buildCurrentAdminReportData();
  rerenderAdminWithCache();
}

async function loadMoreAdminUsers() {
  if (!isAdminUser()) return;
  if (adminPanelScreen !== "users") return;
  if (adminUsersLoadingMore || !adminUsersHasMore || !adminUsersCursor) return;

  adminUsersLoadingMore = true;
  rerenderAdminWithCache();

  try {
    const page = await getUsersPage({
      pageSize: ADMIN_USERS_PAGE_SIZE,
      cursor: adminUsersCursor
    });
    trackTelemetry("admin_users_page_fetch", {
      reads: Array.isArray(page?.items) ? page.items.length : 0
    });

    const mappedUsers = await mapAdminUsersWithCredits(page.items);

    const byId = new Map(adminUsersCache.map((u) => [String(u.id || u.uid || ""), u]));
    mappedUsers.forEach((u) => {
      byId.set(String(u.id || u.uid || ""), u);
    });
    adminUsersCache = Array.from(byId.values());
    adminUsersCursor = page.nextCursor;
    adminUsersHasMore = !!page.hasMore;
  } catch (error) {
    console.error("Erro ao carregar mais usuários:", error);
    showToast("Não foi possível carregar mais usuários.", "error");
  } finally {
    adminUsersLoadingMore = false;
    rerenderAdminWithCache();
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

  if (adminPanelScreen === "report") {
    if (!adminReportData) {
      adminReportData = buildCurrentAdminReportData();
    }
    app.innerHTML = adminReportView({
      reportData: adminReportData,
      isAdmin: true,
      userLabel: getUserLabel(),
      credits: getCreditsLabel()
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
  const mode = ["dashboard", "users", "simulados", "financeiro"].includes(adminPanelScreen)
    ? adminPanelScreen
    : "dashboard";
  app.innerHTML = adminView({
    users: mode === "users" ? adminUsersCache : [],
    loading: mode === "users" ? adminUsersLoadingMore && !adminUsersCache.length : false,
    isAdmin: true,
    userLabel: getUserLabel(),
    credits: getCreditsLabel(),
    notice,
    globalNotice: globalNoticeMessage,
    metrics,
    metricsRange: adminMetricsRange,
    lightMode: adminLightMode,
    usersHasMore: mode === "users" ? adminUsersHasMore : false,
    usersLoadingMore: mode === "users" ? adminUsersLoadingMore : false,
    mode,
    sessionAvailability,
    simuladoQuestionCounts: getAdminSimuladoQuestionCounts()
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

function normalizeSimuladoMetricKey(value = "") {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "unknown";
  if (text.includes("metar")) return "metar_taf";
  if (text.includes("sigwx")) return "sigwx";
  return "unknown";
}

function getMetricsRangeLabel(range = "30d") {
  if (range === "today") return "Hoje";
  if (range === "7d") return "Últimos 7 dias";
  return "Últimos 30 dias";
}

function getSimuladoLabelFromMetricKey(key = "unknown") {
  if (key === "sigwx") return "SIGWX";
  if (key === "metar_taf") return "METAR/TAF";
  return "Outros";
}

function buildAdminGeneralReportText(metrics = {}, range = "30d") {
  const generatedAt = new Date().toLocaleString("pt-BR");
  const hasSessionBreakdown =
    Number.isFinite(Number(metrics?.sessionsTotal)) ||
    Number.isFinite(Number(metrics?.sessionsTraining)) ||
    Number.isFinite(Number(metrics?.sessionsEvaluation));
  const hasSimuladoBreakdown = metrics?.evaluationsBySimulado && typeof metrics.evaluationsBySimulado === "object";
  const bySimulado = hasSimuladoBreakdown ? metrics.evaluationsBySimulado : {};
  const topSimulado = metrics?.topSimulado || { key: "unknown", count: 0 };
  const sessionsTotalText = hasSessionBreakdown ? String(Number(metrics?.sessionsTotal || 0)) : "N/D";
  const sessionsTrainingText = hasSessionBreakdown ? String(Number(metrics?.sessionsTraining || 0)) : "N/D";
  const sessionsEvaluationText = hasSessionBreakdown ? String(Number(metrics?.sessionsEvaluation || 0)) : "N/D";
  const sigwxEvalText = hasSimuladoBreakdown ? String(Number(bySimulado?.sigwx || 0)) : "N/D";
  const metarEvalText = hasSimuladoBreakdown ? String(Number(bySimulado?.metar_taf || 0)) : "N/D";
  const otherEvalText = hasSimuladoBreakdown ? String(Number(bySimulado?.unknown || 0)) : "N/D";
  const topSimuladoText = hasSimuladoBreakdown
    ? `${getSimuladoLabelFromMetricKey(topSimulado?.key)} (${Number(topSimulado?.count || 0)})`
    : "N/D";
  const lines = [
    "PreFlight - Relatório Geral",
    `Gerado em: ${generatedAt}`,
    `Período: ${getMetricsRangeLabel(range)}`,
    "",
    "Resumo:",
    `- Usuários cadastrados: ${Number(metrics?.totalUsersCurrent || 0)}`,
    `- Avaliações concluídas: ${Number(metrics?.evaluationsCompleted || 0)}`,
    `- Sessões totais (treino + avaliação): ${sessionsTotalText}`,
    `- Sessões de treino: ${sessionsTrainingText}`,
    `- Sessões de avaliação: ${sessionsEvaluationText}`,
    `- Créditos consumidos: ${Number(metrics?.creditsConsumed || 0)}`,
    `- Créditos comprados: ${Number(metrics?.creditsPurchased || 0)}`,
    "",
    "Avaliações por simulado:",
    `- SIGWX: ${sigwxEvalText}`,
    `- METAR/TAF: ${metarEvalText}`,
    `- Outros: ${otherEvalText}`,
    `- Simulado mais feito: ${topSimuladoText}`,
    "",
    "Catálogo de questões:",
    `- Questões de treino: ${Number(metrics?.trainingQuestions || 0)}`,
    `- Questões de avaliação: ${Number(metrics?.evaluationQuestions || 0)}`,
    `- Total de questões: ${Number(metrics?.totalQuestions || 0)}`
  ];
  return lines.join("\n");
}

function downloadAdminGeneralReport(metrics = {}, range = "30d") {
  const content = buildAdminGeneralReportText(metrics, range);
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0")
  ].join("");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio-geral-${stamp}.txt`;
  a.click();
  URL.revokeObjectURL(url);
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
    return createdAt && createdAt.getTime() >= startMs;
  });

  const periodTransactions = safeTransactions.filter((tx) => {
    const createdAt = parseDateValue(tx?.createdAt);
    return createdAt && createdAt.getTime() >= startMs;
  });

  let creditsConsumed = 0;
  let creditsPurchased = 0;
  let sessionsTraining = 0;
  let sessionsEvaluation = 0;
  const evaluationsBySimulado = {
    sigwx: 0,
    metar_taf: 0,
    unknown: 0
  };

  periodTransactions.forEach((tx) => {
    const type = String(tx?.type || "").toLowerCase();
    const mode = String(tx?.mode || "").toLowerCase();
    const amount = Number(tx?.amount);
    const safeAmount = Number.isFinite(amount) ? Math.trunc(amount) : 0;

    if (type === "consume" || safeAmount < 0) {
      creditsConsumed += Math.abs(safeAmount || 1);
    }
    if (type === "purchase" || type === "reprocess" || safeAmount > 0) {
      creditsPurchased += Math.max(0, safeAmount);
    }
    if (type === "consume") {
      if (mode === "training") sessionsTraining += 1;
      if (mode === "evaluation") sessionsEvaluation += 1;
    }
  });

  periodEvaluations.forEach((ev) => {
    const simuladoKey = normalizeSimuladoMetricKey(ev?.simulado || "");
    evaluationsBySimulado[simuladoKey] = Number(evaluationsBySimulado[simuladoKey] || 0) + 1;
  });

  const evaluationsCompleted = periodEvaluations.length;
  const topSimuladoEntry = Object.entries(evaluationsBySimulado)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0] || ["unknown", 0];
  return {
    totalUsersCurrent: currentUserIds.size,
    totalUsersHistorical: historicalUserIds.size,
    evaluationsCompleted,
    creditsConsumed,
    creditsPurchased,
    sessionsTraining,
    sessionsEvaluation,
    sessionsTotal: sessionsTraining + sessionsEvaluation,
    evaluationsBySimulado,
    topSimulado: {
      key: topSimuladoEntry[0],
      count: Number(topSimuladoEntry[1] || 0)
    }
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

function rerenderCreditsFromCache() {
  renderCreditsScreen();
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
  trackTelemetry("credits_history_page", {
    reads: Array.isArray(page?.items) ? page.items.length : 0
  });
  creditHistoryCursor = page.nextCursor;
  creditHistoryHasMore = !!page.hasMore;
  creditHistoryError = "";
}

function renderCredits() {
  if (!currentUser) {
    renderLogin();
    return;
  }
  const shouldHydrate = !hasLoadedCreditsData || !hasLoadedCreditHistoryData;

  if (shouldHydrate) {
    creditHistoryLoading = true;
    creditHistoryLoadingMore = false;
    renderCreditsScreen();
  } else {
    renderCreditsScreen();
    return;
  }

  const pendingTasks = [];

  if (!hasLoadedCreditsData) {
    pendingTasks.push(
      getUserCredits(currentUser.uid)
        .then((credits) => {
          currentCredits = applyLocalCreditsBalance(credits || { balance: 0 }, true);
          hasLoadedCreditsData = true;
          setCachedUserCredits(currentUser.uid, currentCredits || { balance: 0 });
          trackTelemetry("profile_load_credits", { reads: 1 });
        })
        .catch(() => {
          currentCredits = applyLocalCreditsBalance(currentCredits || { balance: 0 }, false);
          hasLoadedCreditsData = true;
          console.warn("PreFlight credits fetch failed for uid:", currentUser.uid);
        })
    );
  }

  if (!hasLoadedCreditHistoryData) {
    pendingTasks.push(
      loadCreditHistoryPage({ append: false })
        .then(() => {
          hasLoadedCreditHistoryData = true;
        })
        .catch((error) => {
          console.warn("PreFlight credits history fetch failed:", error);
          hasLoadedCreditHistoryData = true;
          if (!creditHistoryItems.length) {
            creditHistoryError = "Não foi possível carregar o histórico agora.";
          } else {
            creditHistoryError = "";
          }
        })
    );
  }

  Promise.all(pendingTasks)
    .finally(() => {
      creditHistoryLoading = false;
      rerenderCreditsFromCache();
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
      rerenderProfileFromCache("evaluations");
    });
  }
}

function setupProfileModeActions() {
  const openCreditsBtn = document.getElementById("profileOpenCreditsHistory");
  openCreditsBtn?.addEventListener("click", () => {
    renderCredits();
  });

  const openEvaluationsBtn = document.getElementById("profileOpenEvaluationsHistory");
  openEvaluationsBtn?.addEventListener("click", () => {
    renderProfileEvaluations();
  });

  const backToSummaryBtn = document.getElementById("profileBackToSummary");
  backToSummaryBtn?.addEventListener("click", () => {
    renderProfile();
  });
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
  const openUsersPageBtn = document.getElementById("adminOpenUsersPage");
  const openMetricsPageBtn = document.getElementById("adminOpenMetricsPage");
  const backSummaryBtn = document.getElementById("adminBackSummaryPage");
  const tabButtons = document.querySelectorAll("[data-admin-tab]");
  const goAdminQuestionsPageBtn = document.getElementById("goAdminQuestionsPage");
  const simuladoEditorButtons = document.querySelectorAll("[data-open-simulado-editor]");
  const adminQuestionEditorBackBtn = document.getElementById("adminQuestionEditorBack");
  const searchInput = document.getElementById("adminSearch");
  const roleSelect = document.getElementById("adminRole");
  const exportBtn = document.getElementById("adminExport");
  const refreshBtn = document.getElementById("adminRefresh");
  const loadMoreBtn = document.getElementById("adminLoadMoreUsers");
  const noticeInput = document.getElementById("adminGlobalNotice");
  const noticeSaveBtn = document.getElementById("adminGlobalNoticeSave");
  const sessionSaveBtn = document.getElementById("adminSessionAvailabilitySave");
  const adminGenerateReportBtn = document.getElementById("adminGenerateReport");
  const reportPrintBtn = document.getElementById("adminReportPrint");
  const reportDownloadCsvBtn = document.getElementById("adminReportDownloadCsv");
  const reportBackBtn = document.getElementById("adminReportBack");
  const sessionToggleButtons = document.querySelectorAll("[data-session-toggle]");
  const rangeButtons = document.querySelectorAll("[data-metrics-range]");
  const lightModeBtn = document.getElementById("adminLightModeToggle");

  openUsersPageBtn?.addEventListener("click", () => {
    renderAdminUsers({ forceRefresh: false });
  });

  openMetricsPageBtn?.addEventListener("click", () => {
    renderAdminMetrics({ forceRefresh: false });
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = String(btn.getAttribute("data-admin-tab") || "").trim();
      if (!targetTab) return;
      if (targetTab === "users") {
        renderAdminUsers({ forceRefresh: false });
        return;
      }
      if (targetTab === "simulados") {
        renderAdminSimulados();
        return;
      }
      if (targetTab === "financeiro") {
        renderAdminFinanceiro({ forceRefresh: false });
        return;
      }
      renderAdminMetrics({ forceRefresh: false });
    });
  });

  backSummaryBtn?.addEventListener("click", () => {
    renderAdmin();
  });

  goAdminQuestionsPageBtn?.addEventListener("click", () => {
    renderAdminQuestionHub();
  });

  simuladoEditorButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const simuladoKey = String(btn.getAttribute("data-open-simulado-editor") || "").trim();
      const mode = String(btn.getAttribute("data-editor-mode") || "training").trim().toLowerCase();
      const config = SIMULADO_BANKS[simuladoKey];
      const bankId = mode === "evaluation" ? config?.evaluation : config?.training;
      if (bankId) {
        renderAdminQuestionEditor(bankId);
        return;
      }
      renderAdminQuestionHub();
    });
  });

  adminQuestionEditorBackBtn?.addEventListener("click", () => {
    renderAdminQuestionHub();
  });

  const applyFilters = () => {
    const term = (searchInput?.value || "").toLowerCase().trim();
    const role = (roleSelect?.value || "").toLowerCase().trim();
    const cards = document.querySelectorAll(".admin-user-row");

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
          adminMetricsFromApi = true;
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
      adminMetricsFromApi = false;
      rerenderAdminWithCache();
    });
  });

  lightModeBtn?.addEventListener("click", () => {
    adminLightMode = !adminLightMode;
    localStorage.setItem(ADMIN_LIGHT_MODE_KEY, adminLightMode ? "1" : "0");
    if (adminPanelScreen === "users") {
      renderAdminUsers({ forceRefresh: true });
      return;
    }
    if (adminPanelScreen === "financeiro") {
      renderAdminFinanceiro({ forceRefresh: true });
      return;
    }
    if (adminPanelScreen === "simulados") {
      renderAdminSimulados();
      return;
    }
    renderAdminMetrics({ forceRefresh: true });
  });

  adminGenerateReportBtn?.addEventListener("click", async () => {
    adminGenerateReportBtn.disabled = true;
    const prevText = adminGenerateReportBtn.innerText;
    adminGenerateReportBtn.innerText = "Gerando relatório...";
    try {
      await renderAdminReport({ forceRefresh: false });
    } finally {
      adminGenerateReportBtn.disabled = false;
      adminGenerateReportBtn.innerText = prevText;
    }
  });

  reportPrintBtn?.addEventListener("click", () => {
    window.print();
  });

  reportDownloadCsvBtn?.addEventListener("click", () => {
    if (!adminReportData) {
      adminReportData = buildCurrentAdminReportData();
    }
    downloadReportCsvFiles(adminReportData);
    showToast("CSV(s) do relatório gerados.", "success");
  });

  reportBackBtn?.addEventListener("click", () => {
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
    if (adminPanelScreen === "users") {
      renderAdminUsers({ forceRefresh: true });
      return;
    }
    if (adminPanelScreen === "financeiro") {
      renderAdminFinanceiro({ forceRefresh: true });
      return;
    }
    if (adminPanelScreen === "simulados") {
      renderAdminSimulados();
      return;
    }
    renderAdminMetrics({ forceRefresh: true });
  });

  loadMoreBtn?.addEventListener("click", async () => {
    await loadMoreAdminUsers();
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

  const updateSessionToggleButton = (btn, enabled) => {
    if (!btn) return;
    const raw = String(btn.getAttribute("data-session-toggle") || "");
    const [, mode] = raw.split(":");
    const modeLabel = mode === "evaluation" ? "Avaliação" : mode === "enabled" ? "Simulado" : "Treino";
    const isEnabled = !!enabled;
    btn.setAttribute("data-enabled", isEnabled ? "1" : "0");
    btn.setAttribute("aria-pressed", isEnabled ? "true" : "false");
    btn.classList.toggle("is-enabled", isEnabled);
    btn.classList.toggle("is-disabled", !isEnabled);
    btn.innerText = `${modeLabel}: ${isEnabled ? "Ativado" : "Desativado"}`;
  };

  sessionToggleButtons.forEach((btn) => {
    const isEnabled = String(btn.getAttribute("data-enabled") || "1") === "1";
    updateSessionToggleButton(btn, isEnabled);
    btn.addEventListener("click", () => {
      const current = String(btn.getAttribute("data-enabled") || "1") === "1";
      updateSessionToggleButton(btn, !current);
    });
  });

  const readSessionToggle = (simulado, mode) => {
    const btn = document.querySelector(`[data-session-toggle="${simulado}:${mode}"]`);
    if (!btn) return true;
    return String(btn.getAttribute("data-enabled") || "1") === "1";
  };

  sessionSaveBtn?.addEventListener("click", async () => {
    const nextAvailability = normalizeSessionAvailability(
      SESSION_SIMULADO_KEYS.reduce((acc, simulado) => {
        acc[simulado] = {
          enabled: readSessionToggle(simulado, "enabled"),
          training: readSessionToggle(simulado, "training"),
          evaluation: readSessionToggle(simulado, "evaluation")
        };
        return acc;
      }, {})
    );

    sessionSaveBtn.disabled = true;
    const prev = sessionSaveBtn.innerText;
    sessionSaveBtn.innerText = "Salvando...";
    try {
      await setSessionAvailability(nextAvailability, currentUser?.email || "");
      sessionAvailability = nextAvailability;
      showToast("Disponibilidade atualizada.", "success");
    } catch (error) {
      console.error("Erro ao salvar disponibilidade de simulados:", error);
      showToast("Não foi possível salvar a disponibilidade.", "error");
    } finally {
      sessionSaveBtn.disabled = false;
      sessionSaveBtn.innerText = prev;
    }
  });

  const questionPdfBtn = document.getElementById("adminQuestionPdf");
  const questionReloadBtn = document.getElementById("adminQuestionReload");
  const questionNewBtn = document.getElementById("adminQuestionNew");
  const questionDuplicateBtn = document.getElementById("adminQuestionDuplicate");
  const questionOnlyMarkedBtn = document.getElementById("adminQuestionOnlyMarked");
  const questionSaveBtn = document.getElementById("adminQuestionSave");
  const questionSaveAndNewBtn = document.getElementById("adminQuestionSaveAndNew");
  const questionDeleteBtn = document.getElementById("adminQuestionDelete");
  const questionMarkToggleBtn = document.getElementById("adminQuestionMarkToggle");
  const questionReviewedToggleBtn = document.getElementById("adminQuestionReviewedToggle");
  const questionAutoNextOnSaveInput = document.getElementById("adminQuestionAutoNextOnSave");
  const questionMarkedClearBtn = document.getElementById("adminQuestionMarkedClear");
  const questionPrevBtn = document.getElementById("adminQuestionPrev");
  const questionNextBtn = document.getElementById("adminQuestionNext");
  const questionIdInput = document.getElementById("adminQuestionId");
  const questionImageInput = document.getElementById("adminQuestionImage");
  const questionImageRow = document.getElementById("adminQuestionImageRow");
  const questionTextInput = document.getElementById("adminQuestionText");
  const questionTextRichInput = document.getElementById("adminQuestionTextRich");
  const questionTextColorInput = document.getElementById("adminQuestionTextColor");
  const questionFontSizeSelect = document.getElementById("adminQuestionFontSize");
  const questionRichCmdButtons = document.querySelectorAll("[data-rich-cmd]");
  const questionTextOnImageCardInput = document.getElementById("adminQuestionTextOnImageCard");
  const questionPreviewTitle = document.getElementById("adminQuestionPreviewTitle");
  const questionImagePreview = document.getElementById("adminQuestionImagePreview");
  const questionImagePlaceholder = document.getElementById("adminQuestionImagePlaceholder");
  const questionTextPreview = document.getElementById("adminQuestionTextPreview");
  const questionCorrectSelect = document.getElementById("adminQuestionCorrect");
  const questionExplanationInput = document.getElementById("adminQuestionExplanation");
  const questionControlCodeInput = document.getElementById("adminQuestionControlCode");
  const questionOptionInputs = [0, 1, 2, 3].map((idx) =>
    document.getElementById(`adminQuestionOption${idx}`)
  );
  const questionListEl = document.querySelector(".admin-question-list");
  const questionSearchCodeInput = document.getElementById("adminQuestionSearchCode");
  const questionFindByCodeBtn = document.getElementById("adminQuestionFindByCode");
  const activeQuestionEl = questionListEl?.querySelector(".admin-question-item.active");
  const questionProxyButtons = document.querySelectorAll("[data-qeditor-proxy]");

  questionProxyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSelector = String(btn.getAttribute("data-qeditor-proxy") || "").trim();
      if (!targetSelector) return;
      const target = document.querySelector(targetSelector);
      if (!target || target === btn || target.disabled) return;
      target.click();
    });
  });

  if (adminQuestionEditorKeydownHandler) {
    document.removeEventListener("keydown", adminQuestionEditorKeydownHandler);
    adminQuestionEditorKeydownHandler = null;
  }
  if (document.querySelector(".qeditor-v2") && questionSaveBtn) {
    adminQuestionEditorKeydownHandler = (event) => {
      const activeEditor = document.querySelector(".qeditor-v2");
      const saveBtn = document.getElementById("adminQuestionSave");
      if (!activeEditor || !saveBtn) return;
      const isSaveShortcut =
        (event.ctrlKey || event.metaKey) &&
        String(event.key || "").toLowerCase() === "s";
      if (!isSaveShortcut) return;
      if (saveBtn.disabled) return;
      event.preventDefault();
      saveBtn.click();
    };
    document.addEventListener("keydown", adminQuestionEditorKeydownHandler);
  }

  if (questionListEl && activeQuestionEl) {
    requestAnimationFrame(() => {
      activeQuestionEl.scrollIntoView({
        block: "nearest",
        inline: "nearest"
      });
    });
  }

  const sanitizeQuestionRichHtml = (html = "") => {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");

    const allowedTags = new Set(["B", "STRONG", "I", "EM", "U", "BR", "SPAN", "DIV", "P"]);
    const allowedTextAlign = new Set(["left", "center", "right", "justify"]);
    const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    const rgbColorRegex = /^rgba?\(\s*\d{1,3}\s*(,\s*\d{1,3}\s*){2}(,\s*(0|1|0?\.\d+)\s*)?\)$/i;

    const walk = (node) => {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) return;
        if (child.nodeType !== Node.ELEMENT_NODE) {
          child.remove();
          return;
        }

        const el = child;
        if (!allowedTags.has(el.tagName)) {
          const fragment = document.createDocumentFragment();
          while (el.firstChild) {
            fragment.appendChild(el.firstChild);
          }
          el.replaceWith(fragment);
          return;
        }

        Array.from(el.attributes).forEach((attr) => {
          if (attr.name !== "style") {
            el.removeAttribute(attr.name);
          }
        });

        const style = String(el.getAttribute("style") || "");
        if (style) {
          const nextStyles = [];
          style.split(";").forEach((rule) => {
            const [rawProp, rawValue] = String(rule).split(":");
            const prop = String(rawProp || "").trim().toLowerCase();
            const value = String(rawValue || "").trim().toLowerCase();
            if (!prop || !value) return;
            if (prop === "text-align" && allowedTextAlign.has(value)) {
              nextStyles.push(`text-align:${value}`);
              return;
            }
            if (prop === "color" && colorRegex.test(value)) {
              nextStyles.push(`color:${value}`);
              return;
            }
            if (prop === "color" && rgbColorRegex.test(value)) {
              nextStyles.push(`color:${value}`);
              return;
            }
            // tamanho da fonte é controlado pelo campo "Tamanho base"
          });
          if (nextStyles.length) {
            el.setAttribute("style", nextStyles.join(";"));
          } else {
            el.removeAttribute("style");
          }
        }

        walk(el);
      });
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
        while (node.lastChild && node.lastChild.nodeType === Node.TEXT_NODE && !node.lastChild.textContent.trim()) {
          node.removeChild(node.lastChild);
        }
      }
    };

    walk(template.content);
    return template.innerHTML.trim();
  };

  const normalizeQuestionRichHtml = (html = "") => {
    const safeHtml = sanitizeQuestionRichHtml(html);
    if (!safeHtml) return "";
    return safeHtml
      .replace(/<div><br><\/div>/gi, "<br>")
      .replace(/<div>/gi, "<br>")
      .replace(/<\/div>/gi, "")
      .replace(/<p><br><\/p>/gi, "<br>")
      .replace(/<p>/gi, "<br>")
      .replace(/<\/p>/gi, "")
      .replace(/^(<br>)+/i, "")
      .replace(/(<br>)+$/i, "");
  };

  const syncQuestionTextInputFromRich = () => {
    if (!questionTextInput || !questionTextRichInput) return;
    questionTextInput.value = normalizeQuestionRichHtml(questionTextRichInput.innerHTML || "");
  };

  let richSelectionRange = null;
  const saveRichSelection = () => {
    if (!questionTextRichInput) return;
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!questionTextRichInput.contains(range.commonAncestorContainer)) return;
    richSelectionRange = range.cloneRange();
  };

  const restoreRichSelection = () => {
    if (!questionTextRichInput || !richSelectionRange) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    try {
      selection.removeAllRanges();
      selection.addRange(richSelectionRange);
      return true;
    } catch (_) {
      return false;
    }
  };

  const applyInlineStyle = (styleProp = "", styleValue = "") => {
    if (!questionTextRichInput || !styleProp || !styleValue) return;
    questionTextRichInput.focus();
    if (!restoreRichSelection()) {
      const selection = window.getSelection();
      if (!selection) return;
      const fullRange = document.createRange();
      fullRange.selectNodeContents(questionTextRichInput);
      selection.removeAllRanges();
      selection.addRange(fullRange);
      richSelectionRange = fullRange.cloneRange();
    }
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    let range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style[styleProp] = styleValue;

    if (range.collapsed) {
      // Sem seleção: aplica ao enunciado inteiro para evitar inserir caractere invisível.
      const fullRange = document.createRange();
      fullRange.selectNodeContents(questionTextRichInput);
      selection.removeAllRanges();
      selection.addRange(fullRange);
      range = selection.getRangeAt(0);
    }

    const content = range.extractContents();
    span.appendChild(content);
    range.insertNode(span);
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    richSelectionRange = nextRange.cloneRange();
    syncQuestionTextInputFromRich();
  };

  const applyRichCommand = (command, value = null) => {
    if (!questionTextRichInput) return;
    questionTextRichInput.focus();
    restoreRichSelection();
    try {
      document.execCommand(command, false, value);
    } catch (_) {
      // fallback silencioso
    }
    saveRichSelection();
    syncQuestionTextInputFromRich();
  };

  const readQuestionForm = () => {
    const parsedId = Number(questionIdInput?.value);
    const hasValidId = Number.isFinite(parsedId) && parsedId > 0;
    const safeId = hasValidId ? Math.floor(parsedId) : 0;
    const parsedCorrect = Number(questionCorrectSelect?.value);
    const parsedFontSize = Number(String(questionFontSizeSelect?.value || "18").replace("px", ""));
    const textOnImageCard = !!questionTextOnImageCardInput?.checked;
    const fallbackControlCode = buildQuestionControlCode(adminQuestionBank, hasValidId ? safeId : getNextQuestionIdForBank(adminQuestionBank));
    const controlCode = String(questionControlCodeInput?.value || "").trim() || fallbackControlCode;
    const draft = createAdminQuestionDraft(adminQuestionBank, {
      id: hasValidId ? safeId : getNextQuestionIdForBank(adminQuestionBank),
      image: String(questionImageInput?.value || "").trim(),
      question: String(questionTextInput?.value || "").trim(),
      options: questionOptionInputs.map((input) => String(input?.value || "").trim()),
      correctIndex: Number.isFinite(parsedCorrect) ? Math.max(0, Math.min(3, Math.floor(parsedCorrect))) : 0,
      explanation: String(questionExplanationInput?.value || "").trim(),
      textOnImageCard,
      questionFontSize: Number.isFinite(parsedFontSize) ? Math.max(10, Math.min(36, Math.floor(parsedFontSize))) : 18,
      controlCode
    });
    draft.id = safeId;
    return draft;
  };

  if (questionTextInput || questionImageInput || questionTextOnImageCardInput || questionTextRichInput) {
    const syncPreviewLayout = () => {
      const textOnImageCard = !!questionTextOnImageCardInput?.checked;
      const text = String(questionTextInput?.value || "").trim();
      const image = String(questionImageInput?.value || "").trim();
      const parsedFontSize = Number(String(questionFontSizeSelect?.value || "18").replace("px", ""));
      const safeFontSize = Number.isFinite(parsedFontSize) ? Math.max(10, Math.min(36, Math.floor(parsedFontSize))) : 18;
      const previewBox = document.querySelector(".admin-question-preview");

      if (questionPreviewTitle) {
        questionPreviewTitle.textContent = textOnImageCard ? "Preview do enunciado" : "Preview da imagem";
      }
      if (questionImageRow) {
        questionImageRow.style.display = textOnImageCard ? "none" : "";
      }
      if (questionControlCodeInput) {
        const parsedId = Number(questionIdInput?.value);
        const safeId = Number.isFinite(parsedId) && parsedId > 0
          ? Math.floor(parsedId)
          : getNextQuestionIdForBank(adminQuestionBank);
        questionControlCodeInput.value = String(questionControlCodeInput.value || "").trim() || buildQuestionControlCode(adminQuestionBank, safeId);
      }
      if (questionTextPreview) {
        questionTextPreview.innerHTML = text ? sanitizeQuestionRichHtml(text) : "Digite o enunciado para visualizar aqui.";
        questionTextPreview.style.setProperty("font-size", `${safeFontSize}px`, "important");
        questionTextPreview.style.display = textOnImageCard ? "" : "none";
      }
      if (questionTextRichInput) {
        questionTextRichInput.style.setProperty("font-size", `${safeFontSize}px`, "important");
      }
      if (questionImagePreview) {
        questionImagePreview.src = image;
        questionImagePreview.style.display = textOnImageCard ? "none" : (image ? "" : "none");
      }
      if (questionImagePlaceholder) {
        questionImagePlaceholder.style.display = textOnImageCard || image ? "none" : "";
      }
      if (previewBox) {
        previewBox.classList.toggle("is-empty", textOnImageCard ? !text : !image);
      }
    };

    if (questionTextInput && questionTextRichInput) {
      questionTextRichInput.innerHTML = sanitizeQuestionRichHtml(questionTextInput.value || "");
      syncQuestionTextInputFromRich();
      const trackSelection = () => saveRichSelection();
      questionTextRichInput.addEventListener("keyup", trackSelection);
      questionTextRichInput.addEventListener("mouseup", trackSelection);
      questionTextRichInput.addEventListener("focus", trackSelection);
      questionTextRichInput.addEventListener("input", () => {
        syncQuestionTextInputFromRich();
        syncPreviewLayout();
        saveRichSelection();
      });
      questionTextRichInput.addEventListener("blur", () => {
        syncQuestionTextInputFromRich();
        syncPreviewLayout();
      });
      questionRichCmdButtons.forEach((button) => {
        button.addEventListener("mousedown", (event) => {
          saveRichSelection();
          event.preventDefault();
        });
        button.addEventListener("click", () => {
          const cmd = String(button.getAttribute("data-rich-cmd") || "").trim();
          if (!cmd) return;
          applyRichCommand(cmd);
          questionTextRichInput.innerHTML = sanitizeQuestionRichHtml(questionTextRichInput.innerHTML || "");
          syncQuestionTextInputFromRich();
          syncPreviewLayout();
        });
      });
      questionFontSizeSelect?.addEventListener("change", () => {
        syncPreviewLayout();
      });
      questionTextColorInput?.addEventListener("mousedown", () => {
        saveRichSelection();
      });
      questionTextColorInput?.addEventListener("input", () => {
        const color = String(questionTextColorInput.value || "").trim();
        if (!color) return;
        applyInlineStyle("color", color);
        syncPreviewLayout();
      });
    }

    questionTextInput?.addEventListener("input", syncPreviewLayout);
    questionImageInput?.addEventListener("input", syncPreviewLayout);
    questionTextOnImageCardInput?.addEventListener("change", syncPreviewLayout);
    syncPreviewLayout();
  }

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

  const normalizeControlCodeSearch = (value = "") =>
    String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  const findQuestionByControlCode = () => {
    const raw = String(questionSearchCodeInput?.value || "").trim();
    if (!raw) {
      showToast("Informe um código para buscar.", "info");
      return;
    }

    const targetKey = normalizeControlCodeSearch(raw);
    const bankList = getQuestionBankCache(adminQuestionBank);
    const target = bankList.find((item) => {
      const code = String(item?.controlCode || buildQuestionControlCode(adminQuestionBank, item?.id)).trim();
      return normalizeControlCodeSearch(code) === targetKey;
    });

    if (!target) {
      showToast("Código não encontrado neste banco.", "error");
      return;
    }

    const safeBankId = getQuestionBankConfig(adminQuestionBank).id;
    if (isShowOnlyMarkedEnabled(safeBankId)) {
      adminShowOnlyMarkedByBank[safeBankId] = false;
    }
    adminQuestionEditorDraftMode = false;
    adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, target);
    rerenderAdminWithCache();
    showToast(`Questão ${target.controlCode || buildQuestionControlCode(adminQuestionBank, target.id)} aberta.`, "success");
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

  questionDuplicateBtn?.addEventListener("click", () => {
    const source = readQuestionForm();
    const sourceId = normalizeQuestionId(source?.id, 0);
    if (!sourceId) {
      showToast("Não foi possível duplicar: questão sem ID válido.", "error");
      return;
    }

    const nextId = getNextQuestionIdForBank(adminQuestionBank);
    const bankConfig = getQuestionBankConfig(adminQuestionBank);
    const nextImage = source?.textOnImageCard === true
      ? ""
      : (() => {
          const renumbered = renumberQuestionImagePath(String(source?.image || ""), adminQuestionBank, sourceId, nextId);
          if (renumbered) return renumbered;
          return `${bankConfig.imageBasePath}/${nextId}.webp`;
        })();

    adminQuestionEditorDraftMode = true;
    adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, {
      ...source,
      id: nextId,
      image: nextImage,
      controlCode: buildQuestionControlCode(adminQuestionBank, nextId)
    });
    rerenderAdminWithCache();
    showToast(`Questão duplicada como #${nextId}. Salve para confirmar.`, "success");
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

  questionFindByCodeBtn?.addEventListener("click", () => {
    findQuestionByControlCode();
  });

  questionSearchCodeInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    findQuestionByControlCode();
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

  const saveQuestionFromForm = async ({ openNewAfterSave = false } = {}) => {
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

    const buttonsToLock = [questionSaveBtn, questionSaveAndNewBtn].filter(Boolean);
    const previousLabels = buttonsToLock.map((btn) => btn.innerText);
    buttonsToLock.forEach((btn) => {
      btn.disabled = true;
    });
    if (questionSaveBtn) questionSaveBtn.innerText = "Salvando...";
    if (questionSaveAndNewBtn) questionSaveAndNewBtn.innerText = "Salvando...";
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
          explanation: draft.explanation,
          textOnImageCard: draft.textOnImageCard === true,
          questionFontSize: Number.isFinite(Number(draft.questionFontSize))
            ? Math.max(10, Math.min(36, Math.floor(Number(draft.questionFontSize))))
            : 18,
          controlCode: String(draft.controlCode || "").trim() || buildQuestionControlCode(adminQuestionBank, draft.id)
        },
        currentUser?.email || ""
      );
      await ensureQuestionBankLoaded(adminQuestionBank, { force: true, silent: true });
      adminQuestionEditorDraftMode = false;
      if (openNewAfterSave) {
        adminQuestionEditorDraftMode = true;
        adminQuestionEditor = createNewAdminQuestionDraft(adminQuestionBank);
      } else {
        const refreshedList = getVisibleQuestionList();
        const currentIndex = refreshedList.findIndex((item) => item.id === draft.id);
        const hasNext = currentIndex !== -1 && currentIndex < refreshedList.length - 1;
        if (adminAutoNextOnSave && hasNext) {
          adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, refreshedList[currentIndex + 1]);
        } else {
          adminQuestionEditor = createAdminQuestionDraft(adminQuestionBank, draft);
        }
      }
      rerenderAdminWithCache();
      showToast("Questão salva com sucesso.", "success");
    } catch (error) {
      console.error("Erro ao salvar questão:", error);
      showToast("Não foi possível salvar a questão.", "error");
    } finally {
      buttonsToLock.forEach((btn, index) => {
        btn.disabled = false;
        btn.innerText = previousLabels[index];
      });
    }
  };

  questionSaveBtn?.addEventListener("click", async () => {
    await saveQuestionFromForm();
  });

  questionSaveAndNewBtn?.addEventListener("click", async () => {
    await saveQuestionFromForm({ openNewAfterSave: true });
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
      await deleteQuestionDefinition(adminQuestionBank, String(draft.id), currentUser?.email || "");
      await reindexQuestionBankSequentialIds(adminQuestionBank);
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
    const card = document.querySelector(`.admin-user-row[data-user-id="${userId}"]`);
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
      trackTelemetry("admin_set_user_credits", { writes: 1 });
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
      console.error("Erro ao salvar créditos:", error);
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
    const card = document.querySelector(`.admin-user-row[data-user-id="${userId}"]`);
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
      if (!adminUsersCache.length) {
        adminUsersHasMore = false;
        adminUsersCursor = null;
      }
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

    if (!creditHistoryHasMore) return;

    creditHistoryLoadingMore = true;
    rerenderCreditsFromCache();

    try {
      await loadCreditHistoryPage({ append: true });
    } catch (error) {
      console.warn("PreFlight credits history pagination failed:", error);
      showToast("Não foi possível carregar mais itens do histórico.", "error");
    } finally {
      creditHistoryLoadingMore = false;
      rerenderCreditsFromCache();
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
    const credits = await getUserCredits(currentUser.uid, { forceRefresh: true });
    trackTelemetry("credits_manual_check", { reads: 1 });
    currentCredits = applyLocalCreditsBalance(credits || { balance: before }, true);
    hasLoadedCreditsData = true;
    setCachedUserCredits(currentUser.uid, currentCredits || { balance: before });
    lastCreditsRemoteRefreshAt = Date.now();
    const after = getCreditsBalanceValue(currentCredits) ?? 0;

    if (after > before) {
      stopCreditsPolling();
      showToast("Créditos atualizados com sucesso.", "success");
      if (document.querySelector(".profile-page")) {
        rerenderProfileFromCache();
      } else if (document.querySelector(".credits-page")) {
        rerenderCreditsFromCache();
      } else {
        updateVisibleCreditsLabel();
      }
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
  if (LOW_COST_MODE) return;
  if (!currentUser) return;
  if (creditsPolling) return;

  showCreditsStatus();
  creditsPollingStart = Date.now();

  creditsPolling = setTimeout(async () => {
    try {
      const credits = await getUserCredits(currentUser.uid, { forceRefresh: true });
      const balance = credits?.balance ?? 0;
      if (balance > initialBalance) {
        currentCredits = applyLocalCreditsBalance(credits || { balance: balance }, true);
        hasLoadedCreditsData = true;
        setCachedUserCredits(currentUser.uid, currentCredits || { balance });
        stopCreditsPolling();
        showToast("Pagamento confirmado. Créditos liberados.", "success");
        if (document.querySelector(".profile-page")) {
          rerenderProfileFromCache();
        } else if (document.querySelector(".credits-page")) {
          rerenderCreditsFromCache();
        } else {
          updateVisibleCreditsLabel();
        }
        return;
      }
    } catch (error) {
      console.warn("Credits polling failed:", error);
    }

    if (Date.now() - creditsPollingStart > CREDITS_POLLING_MAX_MS) {
      stopCreditsPolling();
    }
  }, CREDITS_POLLING_INTERVAL_MS);
}

function stopCreditsPolling() {
  if (creditsPolling) {
    clearTimeout(creditsPolling);
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

  const simuladoText = String(evaluation?.simulado || "").toLowerCase();
  const evaluationSimulado = simuladoText.includes("metar")
    ? "metar_taf"
    : simuladoText.includes("nuvens")
      ? "nuvens"
    : simuladoText.includes("sinais")
      ? "sinais_luminosos"
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
      controlCode: String(q?.controlCode || "").trim() || buildQuestionControlCode(evaluationSimulado, q?.id),
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
    simuladoLabel: getSimuladoLabel(evaluationSimulado),
    simuladoKey: evaluationSimulado
  });

  const backBtn = document.getElementById("profileBack");
  backBtn?.addEventListener("click", () => {
    renderProfileEvaluations();
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
function resolveCurrentRoute({ replacePath = false } = {}) {
  const currentPath = normalizePathname(window.location.pathname);
  const moduleSlug = getModuleSlugFromPath(currentPath);
  const moduleConfig = moduleSlug ? getModuleBySlug(moduleSlug) : null;

  if (currentUser && moduleConfig) {
    renderModuleHub(moduleConfig.key, { replacePath });
    return true;
  }

  if (currentPath === APP_ROUTES.dashboard && currentUser) {
    renderDashboard({ replacePath });
    return true;
  }

  if (currentPath === APP_ROUTES.home) {
    if (currentUser) {
      renderHomePublic({ replacePath });
      return true;
    }
    renderHomePublic({ replacePath });
    return true;
  }

  return false;
}

window.addEventListener("popstate", () => {
  if (!resolveCurrentRoute({ replacePath: true })) {
    if (currentUser) {
      renderHomePublic({ replacePath: true });
      return;
    }
    renderHomePublic({ replacePath: true });
  }
});

observeAuthState((user) => {
  const previousUser = currentUser;
  if (previousUser?.uid && (!user || previousUser.uid !== user.uid)) {
    stopPresenceTracking({ setOffline: true, userId: previousUser.uid });
  }
  stopCreditsPolling();
  profileDataLoadPromise = null;

  currentUser = user;
  if (currentUser && (!previousUser || previousUser.uid !== currentUser.uid)) {
    trackTelemetry("login_success", { count: 1 });
  }
  currentProfile = null;
  currentCredits = null;
  hasLoadedProfileData = false;
  hasLoadedCreditsData = false;
  hasLoadedEvaluationsData = false;
  hasLoadedCreditHistoryData = false;
  hasLoadedGlobalNoticeData = false;
  clearUserFirestoreCaches();
  creditHistoryItems = [];
  creditHistoryCursor = null;
  creditHistoryHasMore = false;
  creditHistoryLoading = false;
  creditHistoryLoadingMore = false;
  creditHistoryError = "";
  startingSessionLock = false;
  adminMetricsFromApi = false;
  adminReportData = null;
  if (!currentUser) {
    authInitialRouteDone = false;
    questionBanksCache = {
      sigwx_training: DEFAULT_QUESTION_BANKS.sigwx_training.map((q) => ({ ...q })),
      sigwx_evaluation: DEFAULT_QUESTION_BANKS.sigwx_evaluation.map((q) => ({ ...q })),
      metar_taf_training: DEFAULT_QUESTION_BANKS.metar_taf_training.map((q) => ({ ...q })),
      metar_taf_evaluation: DEFAULT_QUESTION_BANKS.metar_taf_evaluation.map((q) => ({ ...q })),
      nuvens_training: DEFAULT_QUESTION_BANKS.nuvens_training.map((q) => ({ ...q })),
      nuvens_evaluation: DEFAULT_QUESTION_BANKS.nuvens_evaluation.map((q) => ({ ...q })),
      sinais_luminosos_training: DEFAULT_QUESTION_BANKS.sinais_luminosos_training.map((q) => ({ ...q })),
      sinais_luminosos_evaluation: DEFAULT_QUESTION_BANKS.sinais_luminosos_evaluation.map((q) => ({ ...q }))
    };
    questionBankLoadedFlags = {
      sigwx_training: false,
      sigwx_evaluation: false,
      metar_taf_training: false,
      metar_taf_evaluation: false,
      nuvens_training: false,
      nuvens_evaluation: false,
      sinais_luminosos_training: false,
      sinais_luminosos_evaluation: false
    };
    adminQuestionEditor = null;
    adminQuestionEditorDraftMode = false;
      if (!resolveCurrentRoute({ replacePath: true })) {
        renderHomePublic({ replacePath: true });
      }
      return;
  }

  startPresenceTracking();
  if (!LOW_COST_MODE) {
    setTimeout(() => {
      preloadQuestionBanks().catch((error) => {
        console.warn("Falha no preload dos bancos de questões:", error);
      });
    }, 1200);
  }

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
      if (authInitialRouteDone) return;

      const mode = String(document.body.dataset.simuladoMode || "");
      const inSessionFlow =
        mode === "training" ||
        mode === "evaluation" ||
        mode === "evaluation-results" ||
        mode === "evaluation-history";
      const hasActiveScreen = !!document.querySelector(
        ".simulados-page, .simulado-container, .simulado-header, .eval-result, .admin-page, .credits-page, .packages-page, .contact-page, .profile-page"
      );

      if (inSessionFlow || hasActiveScreen) {
        authInitialRouteDone = true;
        return;
      }

      authInitialRouteDone = true;
      if (!resolveCurrentRoute({ replacePath: true })) {
        renderHomePublic({ replacePath: true });
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
  let isSubmittingLogin = false;

  const submitLogin = async () => {
    if (isSubmittingLogin) return;
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showToast("Preencha email e senha.", "error");
      return;
    }

    isSubmittingLogin = true;
    loginBtn.disabled = true;
    loginBtn.innerText = "Entrando...";
    if (googleBtn) googleBtn.disabled = true;

    try {
      await Promise.race([
        login(email, password),
        new Promise((_, reject) =>
          setTimeout(() => {
            const timeoutError = new Error("login_timeout");
            timeoutError.code = "auth/login_timeout";
            reject(timeoutError);
          }, 15000)
        )
      ]);
    } catch (error) {
      console.error("Erro no login por email/senha:", error);
      showToast(getFirebaseAuthMessage(error, "Erro ao fazer login."), "error");
    } finally {
      isSubmittingLogin = false;
      loginBtn.disabled = false;
      loginBtn.innerText = "Entrar";
      if (googleBtn) googleBtn.disabled = false;
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

    const moduleCarousel = root.closest(".module-decision-carousel");
    const card = root.closest(".mode-card");
    const copyTitle = moduleCarousel?.querySelector("[data-carousel-title]") || card?.querySelector(".mode-card-copy h3");
    const copyParagraph = moduleCarousel?.querySelector("[data-carousel-caption]") || card?.querySelector(".mode-card-copy p");
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
  const page = document.querySelector(".simulados-page");

  if (page) {
    page.onclick = (e) => {
      const target = e.target instanceof Element ? e.target.closest("[data-action]") : null;
      if (!target || target.hasAttribute("disabled")) return;

      const action = target.getAttribute("data-action");
      if (action === "open-module-sigwx" || action === "sigwx" || action === "sigwx-eval") {
        renderModuleHub("sigwx");
      } else if (action === "open-module-metar-taf" || action === "metar-taf" || action === "metar-taf-eval") {
        renderModuleHub("metar_taf");
      } else if (action === "open-module-nuvens" || action === "nuvens-training" || action === "nuvens-eval") {
        renderModuleHub("nuvens");
      } else if (action === "open-module-notam" || action === "notam-training" || action === "notam-eval") {
        renderModuleHub("notam");
      } else if (action === "open-module-rotaer" || action === "rotaer-training" || action === "rotaer-eval") {
        renderModuleHub("rotaer");
      } else if (
        action === "open-module-espacos-aereos" ||
        action === "espacos-aereos-training" ||
        action === "espacos-aereos-eval"
      ) {
        renderModuleHub("espacos_aereos");
      } else if (
        action === "open-module-sinais-luminosos" ||
        action === "sinais-luminosos" ||
        action === "sinais-luminosos-training" ||
        action === "sinais-luminosos-eval"
      ) {
        renderModuleHub("sinais_luminosos");
      }
    };
  }
}

function setupModuleHubActions(simuladoKey = "sigwx") {
  const page = document.querySelector(".module-page");
  if (!page) return;
  const pageKey = page.getAttribute("data-module-key") || simuladoKey;
  const safeKey = SIMULADO_BANKS[pageKey] ? pageKey : "sigwx";

  page.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!target || target.hasAttribute("disabled")) return;
    const action = target.getAttribute("data-action");

    if (action === "module-start-training") {
      startSimuladoWithCredit(safeKey, "training");
      return;
    }
    if (action === "module-start-evaluation") {
      startSimuladoWithCredit(safeKey, "evaluation");
      return;
    }
    if (action === "module-go-home") {
      renderHomePublic();
      return;
    }
    if (action === "module-go-dashboard") {
      renderDashboard();
      return;
    }
    if (action === "module-back-dashboard") {
      renderDashboard();
    }
  });
}

function setupMetarTafHubActions() {
  const page = document.querySelector(".metar-taf-page");
  const backBtn = document.getElementById("metarTafBackDashboard");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      renderDashboard();
    });
  }

  if (!page) return;
  page.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!target || target.hasAttribute("disabled")) return;

    const action = target.getAttribute("data-action");
    if (action === "metar-training" || action === "taf-training") {
      startMetarTafWithCredit("training");
      return;
    }
    if (action === "metar-eval" || action === "taf-eval") {
      startMetarTafWithCredit("evaluation");
    }
  });
}

function setupSinaisLuminososHubActions() {
  const page = document.querySelector(".sinais-luminosos-page");
  const backBtn = document.getElementById("sinaisLuminososBackDashboard");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      renderDashboard();
    });
  }

  if (!page) return;
  page.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!target || target.hasAttribute("disabled")) return;

    const action = target.getAttribute("data-action");
    if (action === "sinais-luminosos-training") {
      startSinaisLuminososWithCredit("training");
      return;
    }
    if (action === "sinais-luminosos-eval") {
      startSinaisLuminososWithCredit("evaluation");
    }
  });
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

  const actionToModuleKey = {
    sigwx: "sigwx",
    "open-module-sigwx": "sigwx",
    "metar-taf": "metar_taf",
    "open-module-metar-taf": "metar_taf",
    "nuvens-training": "nuvens",
    "open-module-nuvens": "nuvens",
    "sinais-luminosos": "sinais_luminosos",
    "open-module-sinais-luminosos": "sinais_luminosos",
    "open-module-notam": "notam",
    "open-module-rotaer": "rotaer",
    "open-module-espacos-aereos": "espacos_aereos"
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const action = String(card.getAttribute("data-action") || "").trim();
      const moduleKey = actionToModuleKey[action];
      if (!currentUser) {
        renderLogin();
        return;
      }
      if (moduleKey) {
        renderModuleHub(moduleKey);
        return;
      }
      renderDashboard();
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
    return true;
  } catch (error) {
    console.error("Checkout error:", error);
    showToast("Erro ao iniciar pagamento.", "error");
    return false;
  }
}






