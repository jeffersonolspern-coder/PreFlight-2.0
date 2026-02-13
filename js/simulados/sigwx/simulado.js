import { sigwxQuestions } from "./data.js";

let currentQuestionIndex = 0;
let isFinished = false;
let sigwxResetHandler = null;
let sigwxAutoNextHandler = null;
let sigwxForceFinishHandler = null;
const QUESTIONS_PER_SESSION = 20;

let currentQuestionBank = sigwxQuestions;
let activeQuestions = [];
let state = [];
const DESKTOP_HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function getCurrentSimuladoLabel() {
  const rawKey = String(document.body?.dataset?.simuladoKey || "").toLowerCase();
  if (rawKey === "metar_taf") return "METAR/TAF";
  return "SIGWX";
}

function getCurrentModeLabel() {
  return document.body?.dataset?.simuladoMode === "evaluation" ? "AvaliaÃ§Ã£o" : "Treinamento";
}

function openQuestionReportModal({ questionIndex, questionId, questionText, selectedText = "" }) {
  const modal = document.getElementById("contactModal");
  const subjectInput = document.getElementById("contactSubject");
  const messageInput = document.getElementById("contactMessage");
  const simuladoLabel = getCurrentSimuladoLabel();
  const modeLabel = getCurrentModeLabel();

  if (subjectInput) {
    subjectInput.value = `Erro na questÃ£o ${questionIndex} (ID ${questionId}) (${simuladoLabel} - ${modeLabel})`;
  }
  if (messageInput) {
    const selectedLine = selectedText
      ? `Minha resposta: ${selectedText}\n`
      : "Minha resposta: (ainda nÃ£o respondida)\n";
    messageInput.value =
      `QuestÃ£o ${questionIndex} (ID ${questionId}):\n${questionText}\n\n` +
      `${selectedLine}\n` +
      "Descreva o erro abaixo:";
  }

  if (modal) {
    modal.classList.remove("hidden");
    messageInput?.focus();
  }
}

function shuffleArray(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function resetSessionState() {
  const sourceQuestions = Array.isArray(currentQuestionBank) && currentQuestionBank.length
    ? currentQuestionBank
    : sigwxQuestions;
  const sessionSize = Math.min(QUESTIONS_PER_SESSION, sourceQuestions.length);
  activeQuestions = shuffleArray(sourceQuestions).slice(0, sessionSize);
  state = activeQuestions.map(() => ({
    selected: null,
    isCorrect: null,
    shuffledOptions: null
  }));
}

resetSessionState();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function shouldEnableImageMagnifier() {
  if (document.body?.dataset?.simuladoMode !== "evaluation") return false;
  return window.matchMedia(DESKTOP_HOVER_QUERY).matches;
}

function createMagnifiedImageNode({ imageUrl, alt }) {
  const wrapper = document.createElement("div");
  wrapper.className = "simulado-image-magnifier";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = alt;

  const lens = document.createElement("span");
  lens.className = "simulado-magnifier-lens";

  const zoom = document.createElement("span");
  zoom.className = "simulado-magnifier-zoom";
  zoom.style.backgroundImage = `url("${imageUrl}")`;

  wrapper.appendChild(img);
  wrapper.appendChild(lens);
  wrapper.appendChild(zoom);

  const zoomScale = 2.2;
  let rafId = null;

  const updateZoom = (event) => {
    rafId = null;
    const imgRect = img.getBoundingClientRect();
    if (!imgRect.width || !imgRect.height) return;

    const xRatio = clamp((event.clientX - imgRect.left) / imgRect.width, 0, 1);
    const yRatio = clamp((event.clientY - imgRect.top) / imgRect.height, 0, 1);

    const wrapperRect = wrapper.getBoundingClientRect();
    const lensWidth = lens.offsetWidth || 120;
    const lensHeight = lens.offsetHeight || 120;
    const imgLeft = imgRect.left - wrapperRect.left;
    const imgTop = imgRect.top - wrapperRect.top;
    const cursorXInImage = clamp(event.clientX - imgRect.left, 0, imgRect.width);
    const cursorYInImage = clamp(event.clientY - imgRect.top, 0, imgRect.height);
    const lensLeft = imgLeft + cursorXInImage - lensWidth / 2;
    const lensTop = imgTop + cursorYInImage - lensHeight / 2;

    lens.style.left = `${lensLeft}px`;
    lens.style.top = `${lensTop}px`;
    zoom.style.backgroundSize = `${imgRect.width * zoomScale}px ${imgRect.height * zoomScale}px`;
    zoom.style.backgroundPosition = `${xRatio * 100}% ${yRatio * 100}%`;
  };

  const queueUpdate = (event) => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(() => updateZoom(event));
  };

  img.addEventListener("mouseenter", () => {
    wrapper.classList.add("is-active");
  });

  img.addEventListener("mouseleave", () => {
    wrapper.classList.remove("is-active");
  });

  img.addEventListener("mousemove", queueUpdate);
  img.addEventListener("load", () => {
    zoom.style.backgroundImage = `url("${img.currentSrc || imageUrl}")`;
  });

  return wrapper;
}

export function startSigwxSimulado({ questions = sigwxQuestions, questionBank = "training" } = {}) {
  currentQuestionBank = Array.isArray(questions) && questions.length ? questions : sigwxQuestions;
  const progress = document.getElementById("sigwxProgress");
  const questionEl = document.getElementById("sigwxQuestion");
  const optionsEl = document.getElementById("sigwxOptions");
  const navEl = document.getElementById("sigwxNav");

  const btnPrev = document.getElementById("sigwxPrev");
  const btnNext = document.getElementById("sigwxNext");
  const btnFinalizar = document.getElementById("sigwxFinish");

  const progressBar = document.getElementById("sigwxProgressBar");
  const progressText = document.getElementById("sigwxProgressText");

  currentQuestionIndex = 0;
  isFinished = false;
  resetSessionState();
  if (btnFinalizar) btnFinalizar.disabled = false;

  btnFinalizar?.addEventListener("click", () => finalizarSimulado());

  if (!progress || !questionEl || !optionsEl || !navEl) {
    console.error("SIGWX: elementos nÃ£o encontrados");
    return;
  }

  render();

  btnPrev?.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      render();
    }
  });

  btnNext?.addEventListener("click", () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      currentQuestionIndex++;
      render();
    }
  });

  if (sigwxResetHandler) {
    document.removeEventListener("sigwx:reset", sigwxResetHandler);
  }
  sigwxResetHandler = () => {
    currentQuestionIndex = 0;
    isFinished = false;
    resetSessionState();

    btnFinalizar && (btnFinalizar.disabled = false);
    render();
  };
  document.addEventListener("sigwx:reset", sigwxResetHandler);

  if (sigwxAutoNextHandler) {
    document.removeEventListener("sigwx:auto-next-change", sigwxAutoNextHandler);
  }
  sigwxAutoNextHandler = (e) => {
    if (!e?.detail?.enabled) return;
    if (isFinished) return;

    if (state[currentQuestionIndex]?.selected !== null) {
      const nextIndex = state.findIndex(
        (q, idx) => idx > currentQuestionIndex && q.selected === null
      );
      if (nextIndex !== -1) {
        currentQuestionIndex = nextIndex;
        render();
      }
    }
  };
  document.addEventListener("sigwx:auto-next-change", sigwxAutoNextHandler);

  if (sigwxForceFinishHandler) {
    document.removeEventListener("sigwx:force-finish", sigwxForceFinishHandler);
  }
  sigwxForceFinishHandler = () => {
    finalizarSimulado({ force: true });
  };
  document.addEventListener("sigwx:force-finish", sigwxForceFinishHandler);

  function render() {
    renderProgress();
    renderImage();
    renderOptions();
    renderNav();
    renderControls();
  }

  function renderProgress() {
    const total = activeQuestions.length;
    if (!total) {
      progress.innerText = "Nenhuma questÃ£o disponÃ­vel neste banco.";
      if (progressBar) progressBar.style.width = "0%";
      if (progressText) progressText.innerText = "0 de 0 respondidas (0%)";
      return;
    }
    const answered = state.filter((q) => q.selected !== null).length;
    const percent = Math.round((answered / total) * 100);

    progress.innerText = `QuestÃ£o ${currentQuestionIndex + 1} de ${total} . Respondidas ${answered}/${total}`;

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
      progressText.innerText = `${answered} de ${total} respondidas (${percent}%)`;
    }
  }

  function renderImage() {
    const q = activeQuestions[currentQuestionIndex];
    if (!q) {
      questionEl.innerHTML = `<div class="simulado-empty">Sem imagem disponível.</div>`;
      return;
    }
    questionEl.innerHTML = "";

    if (shouldEnableImageMagnifier()) {
      questionEl.appendChild(
        createMagnifiedImageNode({
          imageUrl: q.image,
          alt: getCurrentSimuladoLabel()
        })
      );
      return;
    }

    const image = document.createElement("img");
    image.src = q.image;
    image.alt = getCurrentSimuladoLabel();
    questionEl.appendChild(image);
  }

  function renderOptions() {
    const q = activeQuestions[currentQuestionIndex];
    const qState = state[currentQuestionIndex];
    if (!q || !qState) {
      optionsEl.innerHTML = `<h2>Nenhuma questÃ£o disponÃ­vel para este modo.</h2>`;
      return;
    }

    if (!qState.shuffledOptions) {
      qState.shuffledOptions = shuffleOptions(q);
    }

    const isEvaluation = document.body.dataset.simuladoMode === "evaluation";
    optionsEl.innerHTML = `<h2>${q.question}</h2>`;

    qState.shuffledOptions.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.innerText = opt.text;

      if (isFinished) {
        btn.disabled = true;
      }

      if (qState.selected !== null) {
        if (!isEvaluation) {
          if (opt.isCorrect) btn.classList.add("correct");
          if (qState.selected === index && !opt.isCorrect) {
            btn.classList.add("wrong");
          }
        } else if (qState.selected === index) {
          btn.classList.add("selected");
        }
      }

      btn.addEventListener("click", () => handleAnswer(index));
      optionsEl.appendChild(btn);
    });

    if (qState.selected !== null && document.body.dataset.simuladoMode !== "evaluation") {
      const exp = document.createElement("div");
      exp.className = "explanation";
      exp.innerText = q.explanation;
      optionsEl.appendChild(exp);
    }

    if (qState.selected !== null && document.body.dataset.simuladoMode === "evaluation") {
      const feedback = document.createElement("div");
      feedback.className = "simulado-feedback";
      feedback.innerText = "Resposta registrada";
      optionsEl.appendChild(feedback);
    }

    if (!isEvaluation) {
      const reportBtn = document.createElement("button");
      reportBtn.type = "button";
      reportBtn.className = "simulado-report-link";
      reportBtn.innerText = "Reportar erro nesta questÃ£o";
      reportBtn.addEventListener("click", () => {
        const selectedText = qState.selected !== null
          ? String(qState.shuffledOptions[qState.selected]?.text || "").trim()
          : "";
        openQuestionReportModal({
          questionIndex: currentQuestionIndex + 1,
          questionId: q.id,
          questionText: q.question,
          selectedText
        });
      });
      optionsEl.appendChild(reportBtn);
    }
  }

  function handleAnswer(selectedIndex) {
    if (isFinished) return;
    const qState = state[currentQuestionIndex];

    qState.selected = selectedIndex;
    qState.isCorrect = qState.shuffledOptions[selectedIndex].isCorrect;

    const autoNextEl = document.getElementById("sigwxAutoNext");
    const isAutoNext =
      document.body.dataset.simuladoMode === "evaluation" &&
      (autoNextEl ? autoNextEl.checked : document.body.dataset.sigwxAutoNext === "1");

    if (isAutoNext && currentQuestionIndex < activeQuestions.length - 1) {
      currentQuestionIndex++;
    }

    render();
  }

  function renderNav() {
    navEl.innerHTML = "";
    if (!activeQuestions.length) return;

    activeQuestions.forEach((_, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nav-btn";
      btn.innerText = index + 1;

      if (index === currentQuestionIndex) {
        btn.classList.add("current");
      } else if (state[index].selected !== null) {
        if (document.body.dataset.simuladoMode === "evaluation") {
          btn.classList.add("answered");
        } else {
          btn.classList.add(state[index].isCorrect ? "correct" : "wrong");
        }
      }

      btn.addEventListener("click", () => {
        currentQuestionIndex = index;
        render();
      });

      navEl.appendChild(btn);
    });
  }

  function finalizarSimulado({ force = false } = {}) {
    if (isFinished) return;
    if (!force && document.body.dataset.simuladoMode === "evaluation") {
      const confirmed = confirm("Finalizar avaliaÃ§Ã£o? VocÃª nÃ£o poderÃ¡ voltar para responder.");
      if (!confirmed) return;
    }
    isFinished = true;
    btnFinalizar && (btnFinalizar.disabled = true);

    const total = state.length;
    const correct = state.filter((q) => q.isCorrect).length;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);

    document.dispatchEvent(
      new CustomEvent("sigwx:finish", {
        detail: {
          total,
          correct,
          wrong,
          percentage,
          state,
          questions: activeQuestions.map((question) => ({
            id: question.id,
            image: question.image,
            question: question.question,
            explanation: question.explanation || ""
          })),
          questionBank: questionBank === "evaluation" ? "evaluation" : "training"
        }
      })
    );

    render();
  }

  function renderControls() {
    if (!activeQuestions.length) {
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      if (btnFinalizar) btnFinalizar.disabled = true;
      return;
    }
    if (btnPrev) {
      const isFirst = currentQuestionIndex === 0;
      btnPrev.disabled = isFirst;
      btnPrev.classList.toggle("is-edge", isFirst);
    }

    if (btnNext) {
      const isLast = currentQuestionIndex === activeQuestions.length - 1;
      btnNext.disabled = isLast;
      btnNext.classList.toggle("is-edge", isLast);
    }
  }

  function shuffleOptions(question) {
    const options = question.options.map((text, index) => ({
      text,
      isCorrect: index === question.correctIndex
    }));

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }
}



