import { sigwxQuestions } from "./data.js";

let currentQuestionIndex = 0;
let isFinished = false;
let sigwxResetHandler = null;
let sigwxAutoNextHandler = null;
const QUESTIONS_PER_SESSION = 20;

let currentQuestionBank = sigwxQuestions;
let activeQuestions = [];
let state = [];

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

  btnFinalizar?.addEventListener("click", finalizarSimulado);

  if (!progress || !questionEl || !optionsEl || !navEl) {
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

  function render() {
    renderProgress();
    renderImage();
    renderOptions();
    renderNav();
    renderControls();
  }

  function renderProgress() {
    const total = activeQuestions.length;
    const answered = state.filter((q) => q.selected !== null).length;
    const percent = Math.round((answered / total) * 100);

    progress.innerText = `Questão ${currentQuestionIndex + 1} de ${total} . Respondidas ${answered}/${total}`;

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
      progressText.innerText = `${answered} de ${total} respondidas (${percent}%)`;
    }
  }

  function renderImage() {
    const q = activeQuestions[currentQuestionIndex];
    questionEl.innerHTML = `<img src="${q.image}" alt="SIGWX" />`;
  }

  function renderOptions() {
    const q = activeQuestions[currentQuestionIndex];
    const qState = state[currentQuestionIndex];

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

  function finalizarSimulado() {
    if (isFinished) return;
    if (document.body.dataset.simuladoMode === "evaluation") {
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

