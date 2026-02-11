// ===============================
// PAINEL DE ESTATÍSTICAS - SIGWX
// ===============================

(function () {
  let panelEl = null;
  let showOnlyWrong = false;
  let lastState = [];

  // ===============================
  // CRIA O PAINEL (1 VEZ)
  // ===============================
  function createPanel() {
    if (panelEl && panelEl.isConnected) {
      panelEl.remove();
    }
    panelEl = null;

    panelEl = document.createElement("section");
    panelEl.id = "sigwxStats";
    panelEl.className = "sigwx-stats hidden";

    panelEl.innerHTML = `
      <div class="stats-header">
        <h3>Resultado do Simulado</h3>
        <span class="stats-score" id="stPercent"></span>
      </div>

      <div class="stats-grid">
        <div>
          <span>Total</span>
          <strong id="stTotal"></strong>
        </div>
        <div>
          <span>Respondidas</span>
          <strong id="stAnswered"></strong>
        </div>
        <div>
          <span>Acertos</span>
          <strong id="stCorrect"></strong>
        </div>
        <div>
          <span>Erros</span>
          <strong id="stWrong"></strong>
        </div>
      </div>

      <div class="stats-actions">
        <button type="button" class="btn-secondary" id="btnToggleWrong">
          Mostrar só erradas
        </button>

        <div class="stats-actions-right">
          <button type="button" class="btn-secondary" id="btnRestart">
            Refazer simulado
          </button>
          <button type="button" class="btn-primary" id="btnEval">
            Modo avaliação
          </button>
          <button type="button" class="btn-danger" id="btnHome">
            Home
          </button>
        </div>
      </div>
    `;

    // Insere o painel logo após o simulador
    const bottom = document.querySelector(".simulado-bottom");
    if (bottom) {
      bottom.insertAdjacentElement("afterend", panelEl);
    } else {
      document.body.appendChild(panelEl);
    }

    bindPanelActions();
  }

  // ===============================
  // AÇÕES DOS BOTÕES
  // ===============================
  function bindPanelActions() {
    document.getElementById("btnToggleWrong").onclick = toggleWrong;

    // 🔁 Reset LIMPO do simulado (sem sair da página)
    document.getElementById("btnRestart").onclick = () => {
      panelEl.classList.add("hidden");

      document.dispatchEvent(new CustomEvent("sigwx:restart-training-request"));
    };

    document.getElementById("btnEval").onclick = () => {
      document.dispatchEvent(new CustomEvent("sigwx:go-eval"));
    };

    document.getElementById("btnHome").onclick = () => {
      location.href = "/";
    };
  }

  // ===============================
  // MOSTRAR / ESCONDER ERRADAS
  // ===============================
  function toggleWrong() {
    showOnlyWrong = !showOnlyWrong;

    document.querySelectorAll(".nav-btn").forEach((btn, index) => {
      const q = lastState[index];

      const shouldShow =
        q && (q.isCorrect === false || q.selected === null);

      btn.style.display =
        showOnlyWrong && !shouldShow ? "none" : "";
    });

    document.getElementById("btnToggleWrong").innerText =
      showOnlyWrong ? "Mostrar todas" : "Mostrar só erradas";
  }

  // ===============================
  // ESCUTA FINAL DO SIMULADO
  // ===============================
  document.addEventListener("sigwx:finish", (e) => {
    if (document.body.dataset.simuladoMode === "evaluation") {
      return;
    }

    createPanel();

    const { total, correct, wrong, percentage, state } = e.detail;

    lastState = state;
    showOnlyWrong = false;

    document.getElementById("stTotal").innerText = total;
    document.getElementById("stAnswered").innerText =
      state.filter(q => q.selected !== null).length;
    document.getElementById("stCorrect").innerText = correct;
    document.getElementById("stWrong").innerText = wrong;
    document.getElementById("stPercent").innerText = `${percentage}%`;

    panelEl.classList.remove("hidden");
  });
})();

