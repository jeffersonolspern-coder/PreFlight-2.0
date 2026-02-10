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
  getUserCredits
} from "./modules/users.js";
import { startSigwxSimulado } from "./simulados/sigwx/simulado.js";
import { sigwxQuestions } from "./simulados/sigwx/data.js";

import "./simulados/sigwx/painel.js";

const app = document.getElementById("app");

const FUNCTIONS_BASE_URL =
  window.PREFLIGHT_FUNCTIONS_URL ||
  "https://us-central1-preflightsimulados.cloudfunctions.net/api";

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
let currentCredits = null;

function isAdminUser() {
  return !!currentUser && currentUser.email === ADMIN_EMAIL;
}

function getUserLabel() {
  if (currentProfile?.role) return currentProfile.role;
  if (currentProfile?.name) return currentProfile.name;
  if (currentUser?.displayName) return currentUser.displayName;
  if (currentUser?.email) return currentUser.email.split("@")[0];
  return "Conta";
}

function getCreditsLabel() {
  if (!currentUser) return null;
  if (currentCredits && Number.isFinite(currentCredits.balance)) {
    return currentCredits.balance;
  }
  return 0;
}

// ===============================
// RENDERIZAÇÕES
// ===============================
function renderHomePublic() {
  app.innerHTML = homePublicView({ logged: !!currentUser, isAdmin: isAdminUser(), userLabel: getUserLabel() });
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
  app.innerHTML = dashboardView(currentUser, { isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });
  setupLogout();
  setupDashboardActions();
  setupGlobalMenu();
  setupContact();
  setupFooterLinks();
}

function renderSigwx() {
  setSimuladoMode("training");
  app.innerHTML = sigwxView({ isAdmin: isAdminUser(), userLabel: getUserLabel(), credits: getCreditsLabel() });

  requestAnimationFrame(() => {
    startSigwxSimulado();
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
    renderSigwx();
    requestAnimationFrame(() => {
      document.dispatchEvent(new CustomEvent("sigwx:reset"));
    });
  });

  retryBtn?.addEventListener("click", () => {
    renderSigwxEvaluation();
    requestAnimationFrame(() => {
      document.dispatchEvent(new CustomEvent("sigwx:reset"));
    });
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
  const finishBtn = document.getElementById("sigwxFinish");

  if (!timerEl || !modalEl || !okBtn || !finishBtn) return;

  evaluationTotalSeconds = 15 * 60;
  let remainingSeconds = evaluationTotalSeconds;
  evaluationRemainingSeconds = remainingSeconds;
  let intervalId = null;

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
        alert("Tempo encerrado. Avaliação finalizada.");
      }
    }, 1000);
  };

  renderTimer();

  okBtn.addEventListener("click", () => {
    modalEl.classList.add("hidden");
    evaluationStartAtMs = Date.now();
    startTimer();
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
    adminUsersCache = await getAllUsers();
    app.innerHTML = adminView({ users: adminUsersCache, loading: false, isAdmin: true, userLabel: getUserLabel(), credits: getCreditsLabel() });
    setupGlobalMenu();
    setupLogout();
    setupContact();
    setupFooterLinks();
    setupAdminActions();
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  }
}

function renderCredits() {
  if (!currentUser) {
    renderLogin();
    return;
  }
  app.innerHTML = creditsView({ user: currentUser, credits: getCreditsLabel() });
  setupGlobalMenu();
  setupLogout();
  setupContact();
  setupFooterLinks();
  setupCreditsActions();
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

  const applyFilters = () => {
    const term = (searchInput?.value || "").toLowerCase().trim();
    const role = roleSelect?.value || "";
    const cards = document.querySelectorAll(".admin-card");

    cards.forEach((card) => {
      const name = card.getAttribute("data-name") || "";
      const email = card.getAttribute("data-email") || "";
      const cardRole = card.getAttribute("data-role") || "";

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
      createdAt: u.createdAt && u.createdAt.toDate
        ? u.createdAt.toDate().toISOString()
        : u.createdAt || ""
    }));

    const header = ["name", "email", "role", "whatsapp", "createdAt"];
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
}

function setupCreditsActions() {
  const btn = document.getElementById("buyCreditsBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    startCreditsCheckout();
  });
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
  renderHomePublic();
  if (currentUser) {
    getUserProfile(currentUser.uid)
      .then((profile) => {
        currentProfile = profile;
      })
      .catch(() => {
        currentProfile = null;
      });

    getUserCredits(currentUser.uid)
      .then((credits) => {
        currentCredits = credits || { balance: 0 };
      })
      .catch(() => {
        currentCredits = { balance: 0 };
      });
  }
});

document.addEventListener("sigwx:go-eval", () => {
  renderSigwxEvaluation();
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

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("hidden")) {
      menu.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.classList.contains("hidden")) {
      menu.classList.add("hidden");
      btn.focus();
    }
  });

  logoutBtn?.addEventListener("click", async (e) => {
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

  if (!loginBtn) return;

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Preencha email e senha.");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Entrando...";

    try {
      await login(email, password);
    } catch (error) {
      alert("Erro ao fazer login.");
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerText = "Entrar";
    }
  });
}

// ===============================
// DASHBOARD
// ===============================
function setupDashboardActions() {
  const sigwxTargets = document.querySelectorAll('[data-action="sigwx"]');
  sigwxTargets.forEach((el) => {
    el.addEventListener("click", () => {
      renderSigwx();
    });
  });

  const sigwxEvalTargets = document.querySelectorAll('[data-action="sigwx-eval"]');
  sigwxEvalTargets.forEach((el) => {
    el.addEventListener("click", () => {
      renderSigwxEvaluation();
    });
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

  if (!registerBtn) return;

  registerBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const role = roleInput?.value.trim() ?? "";
    const whatsapp = whatsappInput?.value.trim() ?? "";
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !role || !email || !password) {
      alert("Preencha nome, perfil, email e senha.");
      return;
    }

    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    registerBtn.disabled = true;
    registerBtn.innerText = "Criando...";

    try {
      const cred = await register(name, email, password);
      const profileData = {
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
      alert("Erro ao cadastrar. Verifique seus dados.");
    } finally {
      registerBtn.disabled = false;
      registerBtn.innerText = "Cadastrar";
    }
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
  };

  const closeModal = () => {
    modal.classList.add("hidden");
  };

  fab.addEventListener("click", openModal);

  if (fabClose) {
    fabClose.addEventListener("click", () => {
      fab.classList.add("hidden");
      fabClose.classList.add("hidden");
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
        alert("Preencha nome, email, assunto e mensagem.");
        return;
      }

      if (!window.emailjs) {
        alert("EmailJS não carregou. Verifique sua conexão.");
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
        alert("Mensagem enviada com sucesso.");
        if (nameInput) nameInput.value = "";
        if (emailInput) emailInput.value = "";
        if (subjectInput) subjectInput.value = "";
        if (messageInput) messageInput.value = "";
        closeModal();
      } catch (error) {
        alert("Erro ao enviar mensagem. Tente novamente.");
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
    const res = await fetch(`${FUNCTIONS_BASE_URL}/createPreference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser.uid,
        email: currentUser.email || ""
      })
    });
    const data = await res.json();
    const url = data.sandbox_init_point || data.init_point;
    if (!url) {
      alert("Não foi possível iniciar o pagamento.");
      return;
    }
    window.open(url, "_blank");
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Erro ao iniciar pagamento.");
  }
}






