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

function normalizeRuntimeImagePath(rawPath = "") {
  const safePath = String(rawPath || "").trim().replace(/\\/g, "/");
  if (!safePath) return "";
  if (/^(https?:|data:|blob:|\/\/)/i.test(safePath)) return safePath;
  if (safePath.startsWith("/")) return safePath;
  const withoutRelativePrefix = safePath.replace(/^(\.\.\/|\.\/)+/, "");
  return `/${withoutRelativePrefix}`;
}

function sanitizeQuestionHtml(html = "") {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  const allowedTags = new Set(["B", "STRONG", "I", "EM", "U", "BR", "SPAN", "DIV", "P"]);
  const allowedTextAlign = new Set(["left", "center", "right", "justify"]);
  const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const rgbColorRegex = /^rgba?\(\s*\d{1,3}\s*(,\s*\d{1,3}\s*){2}(,\s*(0|1|0?\.\d+)\s*)?\)$/i;

  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
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
          // tamanho da fonte é controlado por questionFontSize
        });
        if (nextStyles.length) {
          el.setAttribute("style", nextStyles.join(";"));
        } else {
          el.removeAttribute("style");
        }
      }

      walk(el);
    });
  };

  walk(template.content);
  return template.innerHTML.trim();
}

function getCurrentSimuladoLabel() {
  const rawKey = String(document.body?.dataset?.simuladoKey || "").toLowerCase();
  if (rawKey === "metar_taf") return "METAR/TAF";
  if (rawKey === "sinais_luminosos") return "Sinais luminosos";
  return "SIGWX";
}

function getCurrentModeLabel() {
  return document.body?.dataset?.simuladoMode === "evaluation" ? "Avaliação" : "Treinamento";
}

function isSinaisLuminososEvaluationMode() {
  const mode = String(document.body?.dataset?.simuladoMode || "").toLowerCase();
  const key = String(document.body?.dataset?.simuladoKey || "").toLowerCase();
  return mode === "evaluation" && key === "sinais_luminosos";
}

function buildRuntimeQuestionControlCode(questionId = 0) {
  const simuladoKey = String(document.body?.dataset?.simuladoKey || "sigwx")
    .replace(/[^a-z0-9]+/gi, "_")
    .toUpperCase();
  const safeId = Number.isFinite(Number(questionId)) ? Math.max(1, Math.floor(Number(questionId))) : 1;
  return `${simuladoKey}-Q${String(safeId).padStart(4, "0")}`;
}

function openQuestionReportModal({ questionIndex, questionId, controlCode = "", questionText, selectedText = "" }) {
  const modal = document.getElementById("contactModal");
  const subjectInput = document.getElementById("contactSubject");
  const messageInput = document.getElementById("contactMessage");
  const simuladoLabel = getCurrentSimuladoLabel();
  const modeLabel = getCurrentModeLabel();

  if (subjectInput) {
    const safeControlCode = String(controlCode || "").trim() || buildRuntimeQuestionControlCode(questionId);
    subjectInput.value = `Erro na questão ${questionIndex} (${safeControlCode}) (${simuladoLabel} - ${modeLabel})`;
  }
  if (messageInput) {
    const selectedLine = selectedText
      ? `Minha resposta: ${selectedText}\n`
      : "Minha resposta: (ainda não respondida)\n";
    messageInput.value =
      `Questão ${questionIndex} (ID ${questionId}) [${String(controlCode || "").trim() || buildRuntimeQuestionControlCode(questionId)}]:\n${questionText}\n\n` +
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
  activeQuestions = shuffleArray(sourceQuestions)
    .slice(0, sessionSize)
    .map((question) => ({
      ...question,
      image: normalizeRuntimeImagePath(question?.image || "")
    }));
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
  const headerCodeEl = document.getElementById("sigwxQuestionCode");
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

  if (!questionEl || !optionsEl || !navEl) {
    console.error("SIGWX: elementos não encontrados");
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
    renderQuestionCode();
    renderImage();
    renderOptions();
    renderNav();
    renderControls();
  }

  function renderQuestionCode() {
    if (!headerCodeEl) return;
    const q = activeQuestions[currentQuestionIndex];
    if (!q) {
      headerCodeEl.textContent = "";
      return;
    }
    const questionControlCode = String(q?.controlCode || "").trim() || buildRuntimeQuestionControlCode(q?.id);
    headerCodeEl.textContent = `Código: ${questionControlCode}`;
  }

  function renderProgress() {
    const total = activeQuestions.length;
    if (!total) {
      if (progress) progress.innerText = "";
      if (progressBar) progressBar.style.width = "0%";
      if (progressText) progressText.innerText = "0 de 0 respondidas (0%)";
      return;
    }
    const answered = state.filter((q) => q.selected !== null).length;
    const percent = Math.round((answered / total) * 100);

    if (progress) progress.innerText = "";

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

    const isQuestionTextOnImageCard = q?.textOnImageCard === true;
    if (isSinaisLuminososEvaluationMode() || isQuestionTextOnImageCard) {
      const textBlock = document.createElement("div");
      textBlock.className = "simulado-image-text-only";
      textBlock.innerHTML = sanitizeQuestionHtml(q.question || "");
      const questionFontSize = Number(q?.questionFontSize);
      if (Number.isFinite(questionFontSize)) {
        textBlock.style.fontSize = `${Math.max(10, Math.min(36, Math.floor(questionFontSize)))}px`;
      }
      questionEl.appendChild(textBlock);
      return;
    }

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
      optionsEl.innerHTML = `<h2>Nenhuma questão disponível para este modo.</h2>`;
      return;
    }

    if (!qState.shuffledOptions) {
      qState.shuffledOptions = shuffleOptions(q);
    }

    const isEvaluation = document.body.dataset.simuladoMode === "evaluation";
    const showQuestionHeading = !(isEvaluation && (isSinaisLuminososEvaluationMode() || q?.textOnImageCard === true));
    if (showQuestionHeading) {
      const questionFontSize = Number(q?.questionFontSize);
      const safeQuestionFontSize = Number.isFinite(questionFontSize)
        ? Math.max(10, Math.min(36, Math.floor(questionFontSize)))
        : null;
      optionsEl.innerHTML = `
        <h2${safeQuestionFontSize ? ` style="font-size:${safeQuestionFontSize}px;"` : ""}>${sanitizeQuestionHtml(q.question || "")}</h2>
      `;
    } else {
      optionsEl.innerHTML = "";
    }

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
      reportBtn.innerText = "Reportar erro nesta questão";
      reportBtn.addEventListener("click", () => {
        const selectedText = qState.selected !== null
          ? String(qState.shuffledOptions[qState.selected]?.text || "").trim()
          : "";
        openQuestionReportModal({
          questionIndex: currentQuestionIndex + 1,
          questionId: q.id,
          controlCode: q?.controlCode,
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
      const confirmed = confirm("Finalizar avaliação? Você não poderá voltar para responder.");
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



