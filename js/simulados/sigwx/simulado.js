import { sigwxQuestions } from "./data.js";

let currentQuestionIndex = 0;
let isFinished = false;

// ===============================
// ESTADO DO SIMULADOR
// ===============================
const state = sigwxQuestions.map(() => ({
  selected: null,
  isCorrect: null,
  shuffledOptions: null
}));

// ===============================
// INICIALIZA SIMULADO
// ===============================
export function startSigwxSimulado() {
  const progress = document.getElementById("sigwxProgress");
  const questionEl = document.getElementById("sigwxQuestion");
  const optionsEl = document.getElementById("sigwxOptions");
  const navEl = document.getElementById("sigwxNav");

  const btnPrev = document.getElementById("sigwxPrev");
  const btnNext = document.getElementById("sigwxNext");
  const btnFinalizar = document.getElementById("sigwxFinish");

  // ?? BARRA DE PROGRESSO
  const progressBar = document.getElementById("sigwxProgressBar");
  const progressText = document.getElementById("sigwxProgressText");

  // Reinicia estado ao entrar no simulado
  currentQuestionIndex = 0;
  isFinished = false;
  state.forEach(q => {
    q.selected = null;
    q.isCorrect = null;
    q.shuffledOptions = null;
  });
  if (btnFinalizar) btnFinalizar.disabled = false;

  btnFinalizar?.addEventListener("click", finalizarSimulado);

  if (!progress || !questionEl || !optionsEl || !navEl) {
    console.error("SIGWX: elementos não encontrados");
    return;
  }

  render();

  // ===============================
  // NAVEGAÇÃO
  // ===============================
  btnPrev?.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      render();
    }
  });

  btnNext?.addEventListener("click", () => {
    if (currentQuestionIndex < sigwxQuestions.length - 1) {
      currentQuestionIndex++;
      render();
    }
  });

  // ===============================
  // RESET EXTERNO (EVENTO)
  // ===============================
  document.addEventListener("sigwx:reset", () => {
    currentQuestionIndex = 0;
    isFinished = false;

    state.forEach(q => {
      q.selected = null;
      q.isCorrect = null;
      q.shuffledOptions = null;
    });

    btnFinalizar && (btnFinalizar.disabled = false);

    render();
  });

  // ===============================
  // AUTO-NEXT (ATIVAÇÃO DINÂMICA)
  // ===============================
  document.addEventListener("sigwx:auto-next-change", (e) => {
    if (!e?.detail?.enabled) return;
    if (isFinished) return;

    // Se a questão atual já foi respondida, pula para a próxima não respondida
    if (state[currentQuestionIndex]?.selected !== null) {
      const nextIndex = state.findIndex(
        (q, idx) => idx > currentQuestionIndex && q.selected === null
      );
      if (nextIndex !== -1) {
        currentQuestionIndex = nextIndex;
        render();
      }
    }
  });

  // ===============================
  // RENDER
  // ===============================
  function render() {
    renderProgress();
    renderImage();
    renderOptions();
    renderNav();
    renderControls();
  }

  function renderProgress() {
    const total = sigwxQuestions.length;
    const answered = state.filter(q => q.selected !== null).length;
    const percent = Math.round((answered / total) * 100);

    // Texto original
    progress.innerText = `Questão ${currentQuestionIndex + 1} de ${total} . Respondidas ${answered}/${total}`;

    // Barra visual
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }

    // Texto da barra
    if (progressText) {
      progressText.innerText = `${answered} de ${total} respondidas (${percent}%)`;
    }
  }

  function renderImage() {
    const q = sigwxQuestions[currentQuestionIndex];
    questionEl.innerHTML = `<img src="${q.image}" alt="SIGWX" />`;
  }

  function renderOptions() {
    const q = sigwxQuestions[currentQuestionIndex];
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

      const isEvaluation = document.body.dataset.simuladoMode === "evaluation";
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

    if (isAutoNext && currentQuestionIndex < sigwxQuestions.length - 1) {
      currentQuestionIndex++;
    }

    render();
  }

  function renderNav() {
    navEl.innerHTML = "";

    sigwxQuestions.forEach((_, index) => {
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

  // ===============================
  // FINALIZA SIMULADO
  // ===============================
  function finalizarSimulado() {
    if (isFinished) return;
    if (document.body.dataset.simuladoMode === "evaluation") {
      const confirmed = confirm("Finalizar avaliação? Você não poderá voltar para responder.");
      if (!confirmed) return;
    }
    isFinished = true;
    btnFinalizar && (btnFinalizar.disabled = true);

    const total = state.length;
    const correct = state.filter(q => q.isCorrect).length;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);

    document.dispatchEvent(
      new CustomEvent("sigwx:finish", {
        detail: {
          total,
          correct,
          wrong,
          percentage,
          state
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
      const isLast = currentQuestionIndex === sigwxQuestions.length - 1;
      btnNext.disabled = isLast;
      btnNext.classList.toggle("is-edge", isLast);
    }
  }

  // ===============================
  // SHUFFLE OPÇÕES
  // ===============================
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




