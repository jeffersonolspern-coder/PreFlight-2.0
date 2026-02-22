// ===============================
// HEADER PADRONIZADO (GLOBAL)
// ===============================
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function headerView({ logged = false, isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    <header class="site-header">
      <div class="header-content">
        <div class="logo">PreFlight Simulados</div>
        <div class="header-top-actions">
          <a href="#" id="goCreditsTop" class="header-credits-pill">Créditos</a>
          <button type="button" id="mobileMenuToggle" class="mobile-menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="primaryMenu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <nav class="menu" id="primaryMenu">
          ${
            logged
              ? `
                <a href="#" id="goHome">Início</a>
                <a href="#" id="goDashboard">Simulados</a>
                ${isAdmin ? `<a href="#" id="goAdmin">Admin</a>` : ""}
                <a href="#" id="goContact">Contato</a>
                <a href="#" id="goCredits">Créditos</a>
                <div class="user-menu">
                  <button type="button" id="userMenuBtn" class="user-menu-btn">
                    ${userLabel}
                    <span class="user-menu-caret">&#9662;</span>
                  </button>
                  <div id="userMenu" class="user-menu-dropdown hidden">
                    <button type="button" id="goProfile" class="user-menu-item">Perfil</button>
                    <button type="button" id="userLogout" class="user-menu-item">Sair</button>
                  </div>
                </div>
              `
              : `
                <a href="#" id="goHome">Início</a>
                <a href="#" id="goDashboard">Simulados</a>
                ${isAdmin ? `<a href="#" id="goAdmin">Admin</a>` : ""}
                <a href="#" id="goContact">Contato</a>
                <a href="#" id="loginLink" class="header-login">Entrar</a>
              `
          }
        </nav>
      </div>
    </header>
  `;
}

// ===============================
// WIDGET DE CONTATO (GLOBAL)
// ===============================
function contactBoxView() {
  return `
    <div class="contact-box">
      <h3 id="contactTitle">Fale com a equipe</h3>
      <input type="text" id="contactName" placeholder="Seu nome" />
      <input type="email" id="contactEmail" placeholder="Seu email" />
      <input type="text" id="contactSubject" placeholder="Assunto" />
      <textarea id="contactMessage" placeholder="Escreva sua mensagem"></textarea>
      <div class="contact-actions">
        <button type="button" class="secondary" id="contactClose">Cancelar</button>
        <button type="button" id="contactSend">Enviar</button>
      </div>
    </div>
  `;
}

function contactWidgetView() {
  return `
    <button class="contact-fab" id="contactFab" aria-label="Contato">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="contact-icon">
        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/>
        <rect x="2" y="4" width="20" height="16" rx="2"/>
      </svg>
    </button>
    <button class="contact-fab-close" id="contactFabClose" aria-label="Fechar contato">&times;</button>

    <div class="contact-modal hidden" id="contactModal" role="dialog" aria-modal="true" aria-labelledby="contactTitle">
      ${contactBoxView()}
    </div>
  `;
}

// ===============================
// FOOTER PADRONIZADO
// ===============================
function footerView() {
  return `
    <footer class="site-footer">
      <div class="footer-divider"></div>

      <div class="footer-content">
        <div>&copy; 2026 &middot; PreFlight Simulados</div>

        <div class="footer-right">
          <a href="/css/legal/politica-privacidade.html" id="privacyLink">Política de Privacidade</a>
          <a href="/css/legal/politica-cookies.html" id="cookiesLink">Política de Cookies</a>
        </div>
      </div>

      <div class="footer-note">
        Aviso: o PreFlight é uma ferramenta de treinamento didático.
        Não substitui plataformas oficiais.
      </div>
    </footer>
  `;
}

// ===============================
// HOME PÃšBLICA
// ===============================
function homePublicView({
  logged = false,
  isAdmin = false,
  userLabel = "Conta",
  credits = null,
  sessionAvailability = null
} = {}) {
  const isSimuladoEnabled = (simuladoKey) => {
    const value = sessionAvailability?.[simuladoKey]?.enabled;
    return typeof value === "boolean" ? value : true;
  };
  return `
    ${headerView({ logged, isAdmin, userLabel, credits: logged ? credits : null })}

    <section class="hero">
      <h1>Treine para provas da aviação com simulados práticos</h1>
      <p>Estude com foco, acompanhe evolução e use créditos conforme sua rotina.</p>

      <div class="hero-actions">
        <button id="accessBtn" class="cta-button">Começar agora</button>
        <button type="button" class="hero-secondary-btn" data-open-packages>Ver pacotes</button>
      </div>
      <small>Cadastro rápido &bull; Sem assinatura &bull; Acesso imediato após login</small>
    </section>

    <section class="about">
      <p>
        O PreFlight foi desenvolvido para estudantes de aviação e pilotos que
        buscam compreender assuntos específicos de forma prática, objetiva e
        alinhada à realidade operacional.
      </p>
    </section>

    <div class="section-divider"></div>

    <section class="simulados">
      <h2>Simulados disponíveis</h2>
      <p class="simulados-subtitle">SIGWX e METAR/TAF disponíveis. Os próximos módulos serão liberados em etapas.</p>
      <div class="simulados-carousel">
        <button type="button" class="simulados-carousel-btn prev" aria-label="Simulado anterior">&#8249;</button>
        <div class="simulados-viewport">
          <div class="cards simulados-cards-track">
            ${isSimuladoEnabled("sigwx") ? `
            <div class="card" data-action="sigwx">
              <span class="status-chip status-chip--live">Disponível agora</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-plus-icon lucide-map-plus"><path d="m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12"/><path d="M15 5.764V12"/><path d="M18 15v6"/><path d="M21 18h-6"/><path d="M9 3.236v15"/></svg></span>
              <h3>SIGWX</h3>
              <p>Simbologia e Nomenclaturas</p>
            </div>
            ` : ""}
            ${isSimuladoEnabled("metar_taf") ? `
            <div class="card" data-action="metar-taf">
              <span class="status-chip status-chip--live">Disponível agora</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-rain-icon lucide-cloud-sun-rain"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg></span>
              <h3>METAR / TAF</h3>
              <p>Leitura e interpretação operacional</p>
            </div>
            ` : ""}
            ${isSimuladoEnabled("notam") ? `
            <div class="card" data-action="open-module-notam">
              <span class="status-chip status-chip--soon">Em breve</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>
              <h3>NOTAM</h3>
              <p>Em desenvolvimento</p>
            </div>
            ` : ""}
            ${isSimuladoEnabled("rotaer") ? `
            <div class="card" data-action="open-module-rotaer">
              <span class="status-chip status-chip--soon">Em breve</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tower-control-icon lucide-tower-control"><path d="M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z"/><path d="M8 13v9"/><path d="M16 22v-9"/><path d="m9 6 1 7"/><path d="m15 6-1 7"/><path d="M12 6V2"/><path d="M13 2h-2"/></svg></span>
              <h3>ROTAER</h3>
              <p>Em desenvolvimento</p>
            </div>
            ` : ""}
            ${isSimuladoEnabled("nuvens") ? `
            <div class="card" data-action="nuvens-training">
              <span class="status-chip status-chip--live">Disponível agora</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloudy-icon lucide-cloudy"><path d="M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z"/><path d="M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61"/></svg></span>
              <h3>Nuvens</h3>
              <p>Classificação e identificação visual</p>
            </div>
            ` : ""}
            ${isSimuladoEnabled("sinais_luminosos") ? `
            <div class="card" data-action="sinais-luminosos">
              <span class="status-chip status-chip--live">Disponível agora</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-spotlight"><path d="M4 10h7l4-3v10l-4-3H4z"/><path d="M15 9l5-2v10l-5-2"/><path d="M6 14v4"/><path d="M9 14v4"/><path d="M5 18h5"/></svg></span>
              <h3>Sinais luminosos</h3>
              <p>Sinais de pátio e pista</p>
            </div>
            ` : ""}
            ${isSimuladoEnabled("espacos_aereos") ? `
            <div class="card" data-action="open-module-espacos-aereos">
              <span class="status-chip status-chip--soon">Em breve</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radar-icon lucide-radar"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4.93 4.93A10 10 0 0 0 3.34 17.01"/><path d="M4.93 19.07A10 10 0 0 0 17.01 20.66"/><path d="M19.07 19.07A10 10 0 0 0 20.66 6.99"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/></svg></span>
              <h3>Espaços Aéreos</h3>
              <p>Em desenvolvimento</p>
            </div>
            ` : ""}
          </div>
        </div>
        <button type="button" class="simulados-carousel-btn next" aria-label="Próximo simulado">&#8250;</button>
      </div>
      <small class="simulados-scroll-hint">Deslize para ver mais simulados</small>
    </section>

    <section class="modes">
      <div class="mode-card mode-card-compact">
        <div class="mode-card-copy">
          <h3>Treinamento</h3>
          <p>Prática livre com correção imediata para ganhar ritmo.</p>
        </div>
        <div
          class="mode-carousel"
          data-images="assets/img/mode-treinamento.png, assets/img/mode-treinamento-1.png, assets/img/mode-treinamento-2.png, assets/img/mode-treinamento-3.png, assets/img/mode-treinamento-4.png"
          data-slides="Treino completo em uma tela::Visual limpo e objetivo para você focar no que importa: interpretar o símbolo e responder com confiança.||Leitura prática de símbolos::Cada questão destaca a área certa da SIGWX e apresenta alternativas claras para acelerar seu raciocínio.||Correção imediata com clareza::Receba feedback visual na hora, veja o que acertou, onde errou e aprenda com a explicação de cada questão.||Estatísticas que mostram evolução::Ao finalizar, acompanhe desempenho, taxa de acerto e progresso de forma rápida e fácil de entender.||Navegação inteligente por questões::Revise com agilidade usando a grade colorida, com acertos em verde e erros em vermelho."
          data-alt="Tela do simulador em modo treinamento"
        ></div>
      </div>
      <div class="mode-card mode-card-compact">
        <div class="mode-card-copy">
          <h3>Avaliação</h3>
          <p>Simulação de prova com resultado final para medir evolução.</p>
        </div>
        <div
          class="mode-carousel"
          data-images="assets/img/mode-avaliacao.png, assets/img/mode-avaliacao-1.png, assets/img/mode-avaliacao-2.png, assets/img/mode-avaliacao-3.png, assets/img/mode-avaliacao-4.png"
          data-slides="Experiência real de avaliação::Visual completo da prova para você treinar foco, ritmo e tomada de decisão em ambiente de exame.||Controle de navegação inteligente::Use os botões de avançar e o modo automático para manter fluidez e ganhar tempo em cada questão.||Treino com gestão de tempo::Simule a pressão do relógio e desenvolva consistência para performar bem dentro do tempo limite.||Cartas reais do dia a dia::Questões baseadas em situações meteorológicas reais para aproximar o estudo da rotina operacional.||Gabarito claro e objetivo::No final, revise acertos e erros com clareza para corrigir pontos fracos e evoluir com direção."
          data-alt="Tela do simulador em modo avaliação"
        ></div>
      </div>
    </section>

    <section class="home-packages">
      <div class="home-packages-panel">
        <div class="home-packages-head">
          <h2>Pacotes de créditos</h2>
          <p>Escolha o pacote ideal para sua rotina de estudo.</p>
        </div>

        <div class="home-packages-inline">
          <button type="button" class="home-package-pill" data-open-packages>
            <h3>Bronze</h3>
            <p>10 créditos</p>
            <strong>R$ 9,90</strong>
          </button>

          <button type="button" class="home-package-pill home-package-pill--popular" data-open-packages>
            <small>Mais popular</small>
            <h3>Silver</h3>
            <p>30 créditos</p>
            <strong>R$ 19,90</strong>
          </button>

          <button type="button" class="home-package-pill" data-open-packages>
            <h3>Gold</h3>
            <p>50 créditos</p>
            <strong>R$ 29,90</strong>
          </button>
        </div>
        <p class="home-packages-note">1 crédito = 1 treino ou 1 avaliação &bull; Compra única, sem assinatura.</p>
      </div>
    </section>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function metarTafHubView(
  {
    isAdmin = false,
    userLabel = "Conta",
    credits = null,
    canStartSessions = true,
    sessionAvailability = null
  } = {}
) {
  const isModeEnabled = (mode) => {
    if (!canStartSessions) return false;
    const value = sessionAvailability?.metar_taf?.[mode];
    return typeof value === "boolean" ? value : true;
  };
  const trainingEnabled = isModeEnabled("training");
  const evaluationEnabled = isModeEnabled("evaluation");
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="simulados-page metar-taf-page">
      <div class="simulados-header">
        <h1>Simulados METAR e TAF</h1>
        <p>Nesta página você organiza o estudo de METAR/TAF e acessa os dois tipos de simulado.</p>
      </div>

      <div class="metar-taf-support-grid">
        <article class="metar-taf-support-card">
          <h3>METAR</h3>
          <p>Área para resumir padrões, grupos e interpretação operacional que você quiser manter de apoio.</p>
        </article>
        <article class="metar-taf-support-card">
          <h3>TAF</h3>
          <p>Espaço para observações de validade, mudanças previstas e pontos de revisão para prova.</p>
        </article>
        <article class="metar-taf-support-card">
          <h3>Material de Estudo</h3>
          <p>Bloco pronto para adicionar docs, links e referências que você usa no treinamento.</p>
        </article>
      </div>

      <div class="simulados-grid">
        <div class="simulado-card simulado-active" data-action="open-module-sigwx">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-rain-icon lucide-cloud-sun-rain"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg></div>
          <h3>Simulado METAR</h3>
          <p>Treino e avaliação focados na leitura e interpretação de METAR.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" data-action="metar-training"${trainingEnabled ? "" : " disabled aria-disabled=\"true\""}>Treinamento</button>
            <button class="simulado-btn ghost" data-action="metar-eval"${evaluationEnabled ? "" : " disabled aria-disabled=\"true\""}>Avaliação</button>
          </div>
        </div>

        <div class="simulado-card simulado-active" data-action="open-module-metar-taf">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg></div>
          <h3>Simulado TAF</h3>
          <p>Treino e avaliação focados na interpretação de TAF e tendência operacional.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" data-action="taf-training"${trainingEnabled ? "" : " disabled aria-disabled=\"true\""}>Treinamento</button>
            <button class="simulado-btn ghost" data-action="taf-eval"${evaluationEnabled ? "" : " disabled aria-disabled=\"true\""}>Avaliação</button>
          </div>
        </div>
      </div>

      <div class="metar-taf-page-actions">
        <button type="button" class="simulado-btn primary" id="metarTafBackDashboard">Voltar para Simulados</button>
      </div>
    </section>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function sinaisLuminososHubView(
  {
    isAdmin = false,
    userLabel = "Conta",
    credits = null,
    canStartSessions = true,
    sessionAvailability = null
  } = {}
) {
  const isModeEnabled = (mode) => {
    if (!canStartSessions) return false;
    const value = sessionAvailability?.sinais_luminosos?.[mode];
    return typeof value === "boolean" ? value : true;
  };
  const trainingEnabled = isModeEnabled("training");
  const evaluationEnabled = isModeEnabled("evaluation");

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="simulados-page sinais-luminosos-page">
      <div class="simulados-header">
        <h1>Simulados Sinais Luminosos</h1>
        <p>Treine reconhecimento de sinais visuais usados em operacao de aerodromo.</p>
      </div>

      <div class="metar-taf-support-grid">
        <article class="metar-taf-support-card">
          <h3>Pista e patio</h3>
          <p>Pratique os sinais usados em solo para taxi, parada e orientacao de aeronave.</p>
        </article>
        <article class="metar-taf-support-card">
          <h3>Torre e marshaller</h3>
          <p>Reforce comando luminoso e sinais manuais para comunicacao sem radio.</p>
        </article>
        <article class="metar-taf-support-card">
          <h3>Revisao rapida</h3>
          <p>Use treino para fixar e avaliacao para medir consistencia.</p>
        </article>
      </div>

      <div class="simulados-grid">
        <div class="simulado-card simulado-active">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-spotlight"><path d="M4 10h7l4-3v10l-4-3H4z"/><path d="M15 9l5-2v10l-5-2"/><path d="M6 14v4"/><path d="M9 14v4"/><path d="M5 18h5"/></svg></div>
          <h3>Sinais luminosos</h3>
          <p>Treinamento progressivo e avaliacao com tempo para praticar tomada de decisao.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" data-action="sinais-luminosos-training"${trainingEnabled ? "" : " disabled aria-disabled=\"true\""}>Treinamento</button>
            <button class="simulado-btn ghost" data-action="sinais-luminosos-eval"${evaluationEnabled ? "" : " disabled aria-disabled=\"true\""}>Avaliação</button>
          </div>
        </div>
      </div>

      <div class="metar-taf-page-actions">
        <button type="button" class="simulado-btn primary" id="sinaisLuminososBackDashboard">Voltar para Simulados</button>
      </div>
    </section>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

// ===============================
// LOGIN / CADASTRO
// ===============================
function loginView({ isAdmin = false, userLabel = "Conta" } = {}) {
  return `
    ${headerView({ logged: false, isAdmin, userLabel, credits: null })}

    <div class="box">
      <h1>Login</h1>
      <button id="loginGoogleBtn" class="google-login-btn" type="button">
        <span class="google-login-content">
          <img
            class="google-login-icon"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            aria-hidden="true"
          />
          <span>Entrar com Google</span>
        </span>
      </button>
      <div class="auth-divider"><span>ou</span></div>
      <label class="sr-only" for="email">Email</label>
      <input type="email" id="email" placeholder="Email" autocomplete="email" />
      <label class="sr-only" for="password">Senha</label>
      <input type="password" id="password" placeholder="Senha" autocomplete="current-password" />
      <button id="loginBtn">Entrar</button>
      <p class="auth-alt">
        Não tem conta? <a href="#" id="registerLink">Criar conta</a>
      </p>
    </div>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function registerView({ isAdmin = false, userLabel = "Conta" } = {}) {
  return `
    ${headerView({ logged: false, isAdmin, userLabel, credits: null })}

    <div class="box">
      <h1>Criar conta</h1>
      <label class="sr-only" for="name">Nome completo</label>
      <input type="text" id="name" placeholder="Nome completo" autocomplete="name" />
      <label class="sr-only" for="role">Perfil</label>
      <select id="role">
        <option value="">Selecione o perfil</option>
        <option value="Aluno Piloto">Aluno Piloto</option>
        <option value="Piloto">Piloto</option>
        <option value="Outro">Outro</option>
      </select>
      <label class="sr-only" for="whatsapp">WhatsApp</label>
      <input type="text" id="whatsapp" placeholder="WhatsApp (opcional)" autocomplete="tel" />
      <label class="sr-only" for="email">Email</label>
      <input type="email" id="email" placeholder="Email" autocomplete="email" />
      <label class="sr-only" for="password">Senha</label>
      <input type="password" id="password" placeholder="Senha (mín. 6 caracteres)" autocomplete="new-password" />
      <button id="registerBtn">Cadastrar</button>
      <p class="auth-alt">
        Já tem conta? <a href="#" id="loginLinkAlt">Entrar</a>
      </p>
    </div>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

// ===============================
// DASHBOARD
// ===============================
function dashboardView(
  user,
  {
    isAdmin = false,
    userLabel = "Conta",
    credits = null,
    canStartSessions = true,
    sessionAvailability = null
  } = {}
) {
  const isModeEnabled = (simuladoKey, mode) => {
    if (!canStartSessions) return false;
    const value = sessionAvailability?.[simuladoKey]?.[mode];
    return typeof value === "boolean" ? value : true;
  };
  const isSimuladoEnabled = (simuladoKey) => {
    const value = sessionAvailability?.[simuladoKey]?.enabled;
    return typeof value === "boolean" ? value : true;
  };
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="simulados-page">
      <div class="simulados-header">
      <h1>Simulados disponíveis</h1>
      <p>Ferramentas desenvolvidas para treinamento e avaliação na formação aeronáutica.</p>
      </div>

      <div class="simulados-grid">
        ${isSimuladoEnabled("sigwx") ? `
        <div class="simulado-card simulado-active">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-plus-icon lucide-map-plus"><path d="m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12"/><path d="M15 5.764V12"/><path d="M18 15v6"/><path d="M21 18h-6"/><path d="M9 3.236v15"/></svg></div>
          <h3>SIGWX</h3>
          <p>Cartas de tempo significativo e interpretação operacional.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" data-action="open-module-sigwx"${isModeEnabled("sigwx", "training") || isModeEnabled("sigwx", "evaluation") ? "" : " disabled aria-disabled=\"true\""}>Entrar no módulo</button>
          </div>
        </div>
        ` : ""}

        ${isSimuladoEnabled("metar_taf") ? `
        <div class="simulado-card simulado-active">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-rain-icon lucide-cloud-sun-rain"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg></div>
          <h3>METAR / TAF</h3>
          <p>Leitura e interpretação operacional.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" data-action="open-module-metar-taf"${isModeEnabled("metar_taf", "training") || isModeEnabled("metar_taf", "evaluation") ? "" : " disabled aria-disabled=\"true\""}>Entrar no módulo</button>
          </div>
        </div>
        ` : ""}

        ${isSimuladoEnabled("notam") ? `
        <div class="simulado-card ${isModeEnabled("notam", "training") || isModeEnabled("notam", "evaluation") ? "simulado-active" : ""}" data-action="open-module-notam">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></div>
          <h3>NOTAM</h3>
          <p>Em desenvolvimento.</p>
          <div class="simulado-actions simulado-actions--single">
            <button class="simulado-btn primary" data-action="open-module-notam"${isModeEnabled("notam", "training") || isModeEnabled("notam", "evaluation") ? "" : " disabled aria-disabled=\"true\""}>Entrar no módulo</button>
          </div>
        </div>
        ` : ""}

        ${isSimuladoEnabled("rotaer") ? `
        <div class="simulado-card ${isModeEnabled("rotaer", "training") || isModeEnabled("rotaer", "evaluation") ? "simulado-active" : ""}" data-action="open-module-rotaer">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tower-control-icon lucide-tower-control"><path d="M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z"/><path d="M8 13v9"/><path d="M16 22v-9"/><path d="m9 6 1 7"/><path d="m15 6-1 7"/><path d="M12 6V2"/><path d="M13 2h-2"/></svg></div>
          <h3>ROTAER</h3>
          <p>Em desenvolvimento.</p>
          <div class="simulado-actions simulado-actions--single">
            <button class="simulado-btn primary" data-action="open-module-rotaer"${isModeEnabled("rotaer", "training") || isModeEnabled("rotaer", "evaluation") ? "" : " disabled aria-disabled=\"true\""}>Entrar no módulo</button>
          </div>
        </div>
        ` : ""}

        ${isSimuladoEnabled("nuvens") ? `
        <div class="simulado-card ${isModeEnabled("nuvens", "training") || isModeEnabled("nuvens", "evaluation") ? "simulado-active" : ""}" data-action="open-module-nuvens">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloudy-icon lucide-cloudy"><path d="M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z"/><path d="M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61"/></svg></div>
          <h3>Nuvens</h3>
          <p>Classificação e identificação visual de nuvens.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" data-action="open-module-nuvens"${isModeEnabled("nuvens", "training") || isModeEnabled("nuvens", "evaluation") ? "" : " disabled aria-disabled=\"true\""}>Entrar no módulo</button>
          </div>
        </div>
        ` : ""}

        ${isSimuladoEnabled("sinais_luminosos") ? `
        <div class="simulado-card ${isModeEnabled("sinais_luminosos", "training") || isModeEnabled("sinais_luminosos", "evaluation") ? "simulado-active" : ""}" data-action="open-module-sinais-luminosos">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-spotlight"><path d="M4 10h7l4-3v10l-4-3H4z"/><path d="M15 9l5-2v10l-5-2"/><path d="M6 14v4"/><path d="M9 14v4"/><path d="M5 18h5"/></svg></div>
          <h3>Sinais luminosos</h3>
          <p>Sinais de patio e pista para operacao visual segura.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" data-action="open-module-sinais-luminosos"${isModeEnabled("sinais_luminosos", "training") || isModeEnabled("sinais_luminosos", "evaluation") ? "" : " disabled aria-disabled=\"true\""}>Entrar no módulo</button>
          </div>
        </div>
        ` : ""}

        ${isSimuladoEnabled("espacos_aereos") ? `
        <div class="simulado-card ${isModeEnabled("espacos_aereos", "training") || isModeEnabled("espacos_aereos", "evaluation") ? "simulado-active" : ""}" data-action="open-module-espacos-aereos">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radar-icon lucide-radar"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4.93 4.93A10 10 0 0 0 3.34 17.01"/><path d="M4.93 19.07A10 10 0 0 0 17.01 20.66"/><path d="M19.07 19.07A10 10 0 0 0 20.66 6.99"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/></svg></div>
          <h3>Espaços Aéreos</h3>
          <p>Em desenvolvimento.</p>
          <div class="simulado-actions simulado-actions--single">
            <button class="simulado-btn primary" data-action="open-module-espacos-aereos"${isModeEnabled("espacos_aereos", "training") || isModeEnabled("espacos_aereos", "evaluation") ? "" : " disabled aria-disabled=\"true\""}>Entrar no módulo</button>
          </div>
        </div>
        ` : ""}
      </div>
    </section>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function simuladoModuleView(
  moduleConfig,
  {
    isAdmin = false,
    userLabel = "Conta",
    credits = null,
    trainingEnabled = true,
    evaluationEnabled = true
  } = {}
) {
  const safeModule = moduleConfig || {};
  const safeTopics = Array.isArray(safeModule.learningTopics) ? safeModule.learningTopics : [];
  const safeSupportItems = Array.isArray(safeModule.supportItems) ? safeModule.supportItems : [];
  const moduleKey = escapeHtml(String(safeModule.key || ""));
  const title = escapeHtml(String(safeModule.title || "Módulo"));
  const description = escapeHtml(String(safeModule.description || ""));
  const supportText = escapeHtml(String(safeModule.supportText || ""));
  const videoPlaceholderTitle = escapeHtml(String(safeModule.videoPlaceholderTitle || "Aula em vídeo (em breve)"));
  const videoPlaceholderText = escapeHtml(String(safeModule.videoPlaceholderText || ""));
  const trainingDecisionText = escapeHtml(
    String(safeModule.trainingDecisionText || "Receba feedback imediato a cada questão e ajuste sua interpretação.")
  );
  const evaluationDecisionText = escapeHtml(
    String(safeModule.evaluationDecisionText || "Simule uma prova real com tempo e resultado final.")
  );
  const decisionCarouselConfig = safeModule.decisionCarousel && typeof safeModule.decisionCarousel === "object"
    ? safeModule.decisionCarousel
    : {};
  const defaultDecisionCarouselImages = [
    "/assets/img/mode-treinamento.png",
    "/assets/img/mode-treinamento-1.png",
    "/assets/img/mode-avaliacao.png",
    "/assets/img/mode-avaliacao-2.png"
  ];
  const defaultDecisionCarouselSlides = [
    "Treinamento guiado::Receba feedback imediato em cada questão e ajuste sua interpretação com clareza.",
    "Correção orientada::Visualize rapidamente acertos e pontos de melhoria para evoluir de forma consistente.",
    "Avaliação realista::Simule o ambiente de prova com foco em ritmo e tomada de decisão.",
    "Pronto para prova::Treine leitura operacional e aumente sua confiança para o exame."
  ];
  const decisionCarouselImages = Array.isArray(decisionCarouselConfig.images) && decisionCarouselConfig.images.length
    ? decisionCarouselConfig.images.map((item) => String(item || "").trim()).filter(Boolean)
    : defaultDecisionCarouselImages;
  const decisionCarouselSlides = Array.isArray(decisionCarouselConfig.slides) && decisionCarouselConfig.slides.length
    ? decisionCarouselConfig.slides.map((item) => String(item || "").trim()).filter(Boolean)
    : defaultDecisionCarouselSlides;
  const firstCarouselSlide = String(decisionCarouselSlides[0] || "").trim();
  const [firstCarouselTitleRaw, firstCarouselCaptionRaw] = firstCarouselSlide.includes("::")
    ? firstCarouselSlide.split("::")
    : ["Estude com direção", firstCarouselSlide];
  const firstCarouselTitle = escapeHtml(String(firstCarouselTitleRaw || "Estude com direção"));
  const firstCarouselCaption = escapeHtml(
    String(firstCarouselCaptionRaw || "Escolha o modo ideal e siga com foco no seu objetivo.")
  );
  const decisionCarouselImagesAttr = escapeHtml(decisionCarouselImages.join(", "));
  const decisionCarouselSlidesAttr = escapeHtml(decisionCarouselSlides.join("||"));
  const trainingFlowText = escapeHtml(
    String(safeModule.trainingFlowText || "Feedback imediato apos cada questao.")
  );
  const evaluationFlowText = escapeHtml(
    String(safeModule.evaluationFlowText || "Simulacao real com tempo e resultado final.")
  );

  const normalizeSupportType = (value = "") =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const primarySupportTypes = new Set(["pdf", "documento externo", "manual externo", "checklist"]);
  const primarySupportItems = safeSupportItems.filter((item) =>
    primarySupportTypes.has(normalizeSupportType(item?.type))
  );
  const videoSupportItem = safeSupportItems.find((item) => normalizeSupportType(item?.type) === "aula futura");
  const videoSupportType = escapeHtml(String(videoSupportItem?.type || "Aula futura"));
  const videoSupportLabel = escapeHtml(String(videoSupportItem?.label || videoPlaceholderTitle));
  const videoSupportDescription = escapeHtml(String(videoSupportItem?.description || videoPlaceholderText));

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="module-page" data-module-key="${moduleKey}">
      <nav class="module-breadcrumb" aria-label="Navegação do módulo">
        <button type="button" class="module-breadcrumb-link" data-action="module-go-home">Inicio</button>
        <span class="module-breadcrumb-sep">&gt;</span>
        <button type="button" class="module-breadcrumb-link" data-action="module-go-dashboard">Simulados</button>
        <span class="module-breadcrumb-sep">&gt;</span>
        <span class="module-breadcrumb-current">${title}</span>
      </nav>

      <div class="module-hero">
        <div class="module-hero-head">
          <span class="module-chip">Módulo PreFlight</span>
          <h1>${title}</h1>
          <p class="module-hero-description">${description}</p>
        </div>

        <div class="module-decision">
          <div class="module-decision-layout">
            <div class="module-decision-main">
              <h2>Como você quer estudar agora?</h2>
              <div class="module-decision-grid">
                <article class="module-decision-card module-decision-card--training">
                  <h3>Treinamento</h3>
                  <p>${trainingDecisionText}</p>
                  <button type="button" class="simulado-btn primary" data-action="module-start-training"${trainingEnabled ? "" : " disabled aria-disabled=\"true\""}>Iniciar Treinamento</button>
                </article>
                <article class="module-decision-card module-decision-card--evaluation">
                  <h3>Avaliação</h3>
                  <p>${evaluationDecisionText}</p>
                  <button type="button" class="simulado-btn warning" data-action="module-start-evaluation"${evaluationEnabled ? "" : " disabled aria-disabled=\"true\""}>Iniciar Avaliação</button>
                </article>
              </div>
            </div>

            <aside class="module-decision-media">
              <div class="module-decision-carousel">
                <div
                  class="mode-carousel mode-carousel--module"
                  data-images="${decisionCarouselImagesAttr}"
                  data-slides="${decisionCarouselSlidesAttr}"
                  data-alt="Prévia do módulo ${title}"
                ></div>
                <div class="module-decision-carousel-copy">
                  <h3 data-carousel-title>${firstCarouselTitle}</h3>
                  <p data-carousel-caption>${firstCarouselCaption}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div class="module-grid">
        <article class="module-card module-card--support">
          <h2>Revisão rápida antes de começar (opcional)</h2>
          <p class="module-support-text">${supportText}</p>
          <div class="module-support-layout">
            <div class="module-support-main">
              <div class="module-support-list module-support-list--primary">
                ${primarySupportItems
                  .map((item) => {
                    const type = escapeHtml(String(item?.type || "Material"));
                    const label = escapeHtml(String(item?.label || "Conteúdo"));
                    const itemDescription = escapeHtml(String(item?.description || ""));
                    const href = String(item?.href || "").trim();
                    const linkHtml = href
                      ? `<a href="${escapeHtml(href)}" class="module-support-link" target="_blank" rel="noopener noreferrer">Abrir</a>`
                      : `<span class="module-support-link is-placeholder">Em breve</span>`;
                    return `
                      <div class="module-support-item">
                        <span class="module-support-type">${type}</span>
                        <h3>${label}</h3>
                        <p>${itemDescription}</p>
                        ${linkHtml}
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </div>

            <div class="module-support-video">
              <span class="module-support-type module-support-video-type">${videoSupportType}</span>
              <h3>${videoSupportLabel}</h3>
              <p>${videoSupportDescription}</p>
              <div class="module-support-video-placeholder" aria-hidden="true">
                <span>Espaço reservado para vídeo</span>
              </div>
              <span class="module-support-link is-placeholder">Em breve</span>
            </div>
          </div>
        </article>

        <article class="module-card module-card--topics">
          <h2>O que você vai dominar neste módulo</h2>
          <ul class="module-topic-list">
            ${safeTopics
              .map((topic) => `<li><span class="module-topic-check" aria-hidden="true">✓</span><span>${escapeHtml(String(topic || ""))}</span></li>`)
              .join("")}
          </ul>
        </article>

      </div>
    </section>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

// ===============================
// SIGWX (TREINO / AVALIAÃ‡ÃƒO / RESULTADO)
// ===============================
function sigwxView({ isAdmin = false, userLabel = "Conta", credits = null, simuladoLabel = "SIGWX" } = {}) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <div class="simulado-header">
      <div>
        <h2 class="simulado-mode-title">Modo Treinamento &middot; ${escapeHtml(simuladoLabel)}</h2>
      </div>
      <div class="simulado-header-right">
        <small class="simulado-header-code" id="sigwxQuestionCode"></small>
      </div>
    </div>

    <section class="simulado-container">
      <button type="button" class="simulado-nav-toggle" data-sim-nav-toggle aria-expanded="false" aria-controls="sigwxNavPanel">
        Questões <span aria-hidden="true">▾</span>
      </button>

      <aside class="simulado-nav" id="sigwxNavPanel" data-sim-nav-panel>
        <div class="nav-grid" id="sigwxNav"></div>
      </aside>

      <div class="simulado-main">
        <div class="simulado-image"><div id="sigwxQuestion"></div></div>
      </div>

      <div class="simulado-question-box">
        <div class="simulado-options" id="sigwxOptions"></div>
      </div>
    </section>

    <div class="simulado-bottom">
      <div class="sigwx-progress-wrapper">
        <div class="sigwx-progress-bar"><div class="sigwx-progress-fill" id="sigwxProgressBar"></div></div>
        <span class="sigwx-progress-text" id="sigwxProgressText"></span>
      </div>

      <div class="simulado-global-footer">
        <button type="button" id="sigwxPrev">Anterior</button>
        <button type="button" id="sigwxNext">Próxima</button>
        <button type="button" id="sigwxFinish">Finalizar</button>
      </div>
    </div>

    <div class="evaluation-modal" id="trainingModal" role="dialog" aria-modal="true" aria-labelledby="trainingTitle">
      <div class="evaluation-box">
        <h3 id="trainingTitle">Modo Treinamento</h3>
        <p>Ao iniciar, o simulado será aberto normalmente.</p>
        <p>Nesse momento, <strong>1 crédito</strong> será descontado do seu saldo.</p>
        <div class="evaluation-actions">
          <button type="button" id="trainingCancel" style="background:#6b7280;color:#ffffff;">Cancelar</button>
          <button type="button" id="trainingOk">Iniciar</button>
        </div>
      </div>
    </div>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function sigwxEvaluationView({ isAdmin = false, userLabel = "Conta", credits = null, simuladoLabel = "SIGWX" } = {}) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <div class="simulado-header">
      <div>
        <h2 class="simulado-mode-title">Modo Avaliação &middot; ${escapeHtml(simuladoLabel)}</h2>
      </div>
      <div class="simulado-header-right">
        <small class="simulado-header-code" id="sigwxQuestionCode"></small>
        <div class="simulado-timer" id="sigwxTimer" aria-live="polite">15:00</div>
      </div>
    </div>

    <section class="simulado-container">
      <button type="button" class="simulado-nav-toggle" data-sim-nav-toggle aria-expanded="false" aria-controls="sigwxNavPanel">
        Questões <span aria-hidden="true">▾</span>
      </button>

      <aside class="simulado-nav" id="sigwxNavPanel" data-sim-nav-panel>
        <div class="nav-grid" id="sigwxNav"></div>
      </aside>

      <div class="simulado-main">
        <div class="simulado-image"><div id="sigwxQuestion"></div></div>
      </div>

      <div class="simulado-question-box">
        <div class="simulado-options" id="sigwxOptions"></div>
      </div>
    </section>

    <div class="simulado-bottom">
      <div class="sigwx-progress-wrapper">
        <div class="sigwx-progress-bar"><div class="sigwx-progress-fill" id="sigwxProgressBar"></div></div>
        <span class="sigwx-progress-text" id="sigwxProgressText"></span>
      </div>

      <label class="simulado-auto-next simulado-auto-next--footer">
        <input type="checkbox" id="sigwxAutoNext" />
        Avançar automaticamente
      </label>

      <div class="simulado-global-footer">
        <button type="button" id="sigwxPrev">Anterior</button>
        <button type="button" id="sigwxNext">Próxima</button>
        <button type="button" id="sigwxFinish">Finalizar</button>
      </div>
    </div>

    <div class="evaluation-modal" id="evaluationModal" role="dialog" aria-modal="true" aria-labelledby="evaluationTitle">
      <div class="evaluation-box">
        <h3 id="evaluationTitle">Modo Avaliação</h3>
        <p>Você terá <strong>15 minutos</strong> para concluir o simulado.</p>
        <p>O tempo começará a contar após clicar em iniciar. Nesse momento, <strong>1 crédito</strong> será descontado do seu saldo.</p>
        <div class="evaluation-actions">
          <button type="button" id="evaluationCancel" style="background:#6b7280;color:#ffffff;">Cancelar</button>
          <button type="button" id="evaluationOk">Iniciar</button>
        </div>
      </div>
    </div>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function sigwxEvaluationResultView({
  summary,
  items,
  isAdmin = false,
  userLabel = "Conta",
  credits = null,
  simuladoLabel = "SIGWX",
  simuladoKey = "sigwx"
}) {
  const safeSimuladoKey = String(simuladoKey || "").toLowerCase();
  const statusLabel = summary.status === "Aprovado" ? "✅ Aprovado" : "⚠️ Reprovado";
  const resultClassName = "eval-result eval-result--premium";
  const shouldShowMedia = safeSimuladoKey !== "metar_taf";
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="${resultClassName}">
      <div class="eval-header">
        <div>
          <h1>Resultado &middot; Avaliação ${escapeHtml(simuladoLabel)}</h1>
          <p>Confira seu desempenho e o gabarito completo abaixo.</p>
        </div>
        <div class="eval-score-group">
          <span class="eval-status-outside ${summary.status === "Aprovado" ? "approved" : "reproved"}">${statusLabel}</span>
        </div>
      </div>

      <div class="eval-stats">
        <div><span>Total</span><strong>${summary.total}</strong></div>
        <div><span>Respondidas</span><strong>${summary.answered}</strong></div>
        <div><span>Acertos</span><strong>${summary.correct}</strong></div>
        <div><span>Erros</span><strong>${summary.wrong}</strong></div>
        <div class="is-percent"><span>Porcentagem</span><strong>${summary.percentage}%</strong></div>
        ${summary.durationSeconds !== null && summary.durationSeconds !== undefined
          ? `<div><span>Tempo</span><strong>${String(Math.floor(summary.durationSeconds / 60)).padStart(2, "0")}:${String(summary.durationSeconds % 60).padStart(2, "0")}</strong></div>`
          : ""}
      </div>

      <div class="eval-top-actions">
        <button type="button" id="evalRetryWrong" class="eval-top-btn eval-top-btn--ghost">Refazer apenas erradas</button>
        <button type="button" id="evalBackToSimulado" class="eval-top-btn">Voltar ao simulado</button>
      </div>

      <div class="eval-list">
        ${items.map((item) => `
          <article class="eval-item ${item.isWrong ? "is-wrong" : "is-correct"} ${item.image && shouldShowMedia ? "has-media" : "no-media"}">
            ${item.image && shouldShowMedia ? `
            <div class="eval-item-media">
              <img src="${item.image}" alt="Questão ${item.index}" />
            </div>
            ` : ""}
            <div class="eval-item-content">
              <h3>Questão ${item.index}</h3>
              <p class="eval-question">${item.question}</p>
              <div class="answer-card">
                <div class="answer-status ${item.isWrong ? "answer-status--wrong" : "answer-status--correct"}">
                  <span class="answer-status-icon">${item.isWrong ? "❌" : "✅"}</span>
                  <div class="answer-status-copy">
                    <strong>${item.isWrong ? "Resposta errada" : "Resposta correta"}</strong>
                    <p>Sua resposta: ${item.selectedText}</p>
                  </div>
                </div>

                <div class="answer-correct-box">
                  <span class="answer-box-label">Resposta correta</span>
                  <p>${item.correctText}</p>
                </div>

                <div class="answer-explanation-box eval-explanation" tabindex="-1">
                  <p class="answer-explanation-title eval-explanation-title">ℹ️ Explicação</p>
                  <p>${item.explanation}</p>
                </div>

                <div class="answer-actions">
                  ${item.isWrong ? `<button type="button" class="eval-review answer-action-btn" data-review-index="${item.index}">Revisar conteúdo</button>` : ""}
                  <a href="#" class="eval-report answer-action-link" data-report-index="${item.index}">Reportar erro</a>
                </div>
              </div>
            </div>
          </article>
        `).join("")}
      </div>

      <div class="eval-actions">
        <button type="button" id="evalToTraining">Ir para Treinamento</button>
        <button type="button" id="evalRetry">Refazer Avaliação</button>
      </div>
    </section>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

// ===============================
// PRIVACIDADE / COOKIES / CONTATO
// ===============================
function privacyView({ logged = false, isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    ${headerView({ logged, isAdmin, userLabel, credits })}
    <section class="legal-page">
      <h1>Política de Privacidade</h1>
      <p>
        A PreFlight Simulados valoriza a sua privacidade e atua com transparência sobre como os dados são coletados e utilizados durante o acesso à plataforma. Esta Política explica quais informações coletamos, por quê, como protegemos e quais são seus direitos.
      </p>

      <h2>Quais dados coletamos</h2>
      <p>
        Coletamos apenas os dados necessários para criar e manter sua conta, permitir o acesso aos simulados e oferecer suporte:
      </p>
      <ul>
        <li>Dados cadastrais: nome, e-mail, perfil e, se informado, WhatsApp.</li>
        <li>Dados de acesso: credenciais de login e identificadores de conta.</li>
        <li>Dados de uso: resultados de simulados, tempo de avaliação e histórico.</li>
        <li>Comunicação: mensagens enviadas pelo formulário de contato.</li>
      </ul>

      <h2>Como usamos as informações</h2>
      <p>
        Utilizamos os dados para autenticação, personalização da experiência, acompanhamento do desempenho, suporte ao usuário e melhorias na plataforma. Não vendemos dados pessoais e não compartilhamos informações com terceiros para fins comerciais.
      </p>

      <h2>Base legal e retenção</h2>
      <p>
        Tratamos os dados com base no interesse legítimo de oferecer o serviço e cumprir obrigações legais. Mantemos as informações somente pelo tempo necessário para as finalidades descritas ou para atender exigências legais.
      </p>

      <h2>Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para reduzir riscos de acesso não autorizado, perda, alteração ou uso indevido das informações. Ainda assim, nenhum sistema é totalmente imune, por isso recomendamos manter sua senha segura e não compartilhá-la.
      </p>

      <h2>Direitos do usuário</h2>
      <p>
        Você pode solicitar acesso, correção, atualização ou exclusão de seus dados, além de esclarecer dúvidas sobre o tratamento das informações. Para isso, utilize os canais oficiais de contato disponíveis na plataforma.
      </p>

      <h2>Cookies e tecnologias similares</h2>
      <p>
        Utilizamos cookies essenciais para manter sua sessão e garantir o funcionamento do sistema. Para mais detalhes, consulte a Política de Cookies.
      </p>

      <h2>Alterações nesta política</h2>
      <p>
        Esta política pode ser atualizada periodicamente. Quando houver mudanças relevantes, comunicaremos na própria plataforma.
      </p>

      <p class="legal-note">Última atualização: Janeiro de 2026</p>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function cookiesView({ logged = false, isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    ${headerView({ logged, isAdmin, userLabel, credits })}
    <section class="legal-page">
      <h1>Política de Cookies</h1>
      <p>
        A PreFlight Simulados utiliza cookies e tecnologias similares para garantir o funcionamento da plataforma, manter sua sessão ativa e melhorar a experiência de uso. Esta Política explica o que são cookies, quais utilizamos e como você pode gerenciá-los.
      </p>

      <h2>O que são cookies</h2>
      <p>
        Cookies são pequenos arquivos armazenados no navegador que ajudam a manter sessões ativas, lembrar preferências e tornar a navegação mais eficiente.
      </p>

      <h2>Tipos de cookies utilizados</h2>
      <p>
        Utilizamos principalmente cookies essenciais, necessários para login, segurança e funcionamento básico do sistema.
      </p>
      <ul>
        <li>Essenciais: autenticação e manutenção da sessão.</li>
        <li>Funcionais: preferências e melhorias de usabilidade (quando aplicável).</li>
      </ul>

      <h2>O que não fazemos</h2>
      <p>
        Não utilizamos cookies para venda de dados pessoais e não compartilhamos informações para publicidade de terceiros.
      </p>

      <h2>Cookies de terceiros</h2>
      <p>
        Alguns serviços integrados à plataforma, como autenticação ou envio de mensagens, podem utilizar cookies próprios, seguindo as políticas de privacidade de seus respectivos fornecedores.
      </p>

      <h2>Gerenciamento de cookies</h2>
      <p>
        Você pode desativar os cookies nas configurações do seu navegador. Isso pode impactar algumas funcionalidades do sistema.
      </p>

      <h2>Alterações nesta política</h2>
      <p>
        Esta política pode ser atualizada para refletir mudanças técnicas ou legais. Sempre que houver alterações relevantes, avisaremos na plataforma.
      </p>

      <p class="legal-note">Última atualização: Janeiro de 2026</p>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function contactView({ logged = false, isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    ${headerView({ logged, isAdmin, userLabel, credits })}
    <section class="contact-page">
      <div class="contact-page-header">
        <h1>Contato</h1>
        <p>Envie sua mensagem para a equipe PreFlight.</p>
      </div>
      <div class="contact-page-grid">
        ${contactBoxView()}
        <aside class="contact-side">
          <div class="contact-side-card">
            <h3>Atendimento</h3>
            <p>Respondemos em até 24h úteis.</p>
            <div class="contact-side-item">
              <span>Canal</span>
              <strong>Email</strong>
            </div>
            <div class="contact-side-item">
              <span>Horário</span>
              <strong>09:00 &ndash; 18:00</strong>
            </div>
          </div>

          <div class="contact-side-card muted">
            <h3>Dica rápida</h3>
            <p>Inclua o nome do simulado e o número da questão para agilizar o suporte.</p>
          </div>
        </aside>
      </div>
    </section>
    ${footerView()}
  `;
}

// ===============================
// PERFIL / ADMIN (SIMPLIFICADOS)
// ===============================
function profileView({
  user,
  profile,
  evaluations = [],
  evaluationStats = null,
  loading = false,
  isAdmin = false,
  userLabel = "Conta",
  credits = null,
  creditHistoryItems = [],
  creditHistoryLoading = false,
  creditHistoryLoadingMore = false,
  creditHistoryHasMore = false,
  creditHistoryError = "",
  showAllEvaluations = false,
  visibleSpentCredits = 7,
  globalNotice = "",
  showEvaluationHistory = false,
  showCreditHistory = false
}) {
  const formatDuration = (secs) => {
    if (secs === null || secs === undefined) return "";
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const roleOptions = ["Aluno Piloto", "Piloto", "Outro"];
  const roleSelect = roleOptions
    .map((opt) => {
      const selected = profile?.role === opt ? "selected" : "";
      return `<option value="${opt}" ${selected}>${opt}</option>`;
    })
    .join("");

  const list = evaluations.length
    ? `<div class="profile-grid">` +
        evaluations.map((e, index) => {
          const date =
            e.createdAt && e.createdAt.toDate
              ? e.createdAt.toDate()
              : e.createdAt
                ? new Date(e.createdAt)
                : null;
          const dateText = date ? date.toLocaleString("pt-BR") : "&mdash;";
          const statusClass = e.status === "Aprovado" ? "approved" : "reproved";
          const isExtra = index >= 5;
          const hiddenStyle = isExtra && !showAllEvaluations ? ` style="display:none;"` : "";

          const timeText = formatDuration(
            e.durationSeconds ?? e.duration_seconds ?? e.durationseconds ?? e.duration
          );

          return `
            <div class="profile-card" data-profile-status="${e.status}" data-profile-extra="${isExtra ? "true" : "false"}"${hiddenStyle}>
              <div>
                <strong>${e.simulado}</strong>
                <span>${dateText}</span>
                ${timeText ? `<span class="profile-time">Tempo: ${timeText}</span>` : ""}
              </div>
              <div>
                <span class="profile-score-line">
                  ${e.correct}/${e.total} (${e.percentage}%)
                  &bull; ${timeText || "--:--"}
                </span>
                <span class="profile-status ${statusClass}">${e.status}</span>
                <button class="profile-link" data-eval-id="${e.id}">Ver gabarito</button>
              </div>
            </div>
          `;
        }).join("") +
      `</div>` +
      (
        evaluations.length > 5 && !showAllEvaluations
          ? `<div class="profile-evals-more"><button type="button" id="profileShowAllEvals">Ver todas</button></div>`
          : ""
      )
    : `<div class="profile-empty">Nenhuma avaliação registrada ainda.</div>`;

  const statsTotalRaw = Number(evaluationStats?.total);
  const statsApprovedRaw = Number(evaluationStats?.approved);
  const statsPercentageSumRaw = Number(evaluationStats?.percentageSum);
  const hasServerStats =
    Number.isFinite(statsTotalRaw) &&
    statsTotalRaw >= 0 &&
    Number.isFinite(statsApprovedRaw) &&
    statsApprovedRaw >= 0 &&
    Number.isFinite(statsPercentageSumRaw) &&
    statsPercentageSumRaw >= 0;

  const approvedCount = hasServerStats
    ? Math.max(0, Math.floor(statsApprovedRaw))
    : evaluations.filter((e) => e.status === "Aprovado").length;
  const evaluationsTotal = hasServerStats
    ? Math.max(0, Math.floor(statsTotalRaw))
    : evaluations.length;
  const averagePercent = evaluationsTotal
    ? (hasServerStats
      ? Math.round(statsPercentageSumRaw / evaluationsTotal)
      : Math.round(
        evaluations.reduce((acc, e) => acc + (Number(e.percentage) || 0), 0) / evaluationsTotal
      ))
    : 0;

  const safeHistoryItems = Array.isArray(creditHistoryItems) ? creditHistoryItems : [];
  const allHistoryItems = safeHistoryItems;
  const visibleHistoryItems = allHistoryItems.slice(0, visibleSpentCredits);
  const hasMoreSpentToShow = allHistoryItems.length > visibleSpentCredits || creditHistoryHasMore;
  const historyRows = visibleHistoryItems
    .map((item) => `
      <tr>
        <td>${item.dateLabel || "&mdash;"}</td>
        <td>${item.description || "&mdash;"}</td>
        <td><strong class="credits-amount ${item.amountClass || ""}">${item.amountLabel || "&mdash;"}</strong></td>
        <td>${item.statusLabel || "&mdash;"}</td>
      </tr>
    `)
    .join("");

  const historyContent = creditHistoryLoading && !visibleHistoryItems.length
    ? `<div class="profile-loading">Carregando histórico...</div>`
    : visibleHistoryItems.length
      ? `
          <div class="credits-history-table-wrap">
            <table class="credits-history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Movimentação</th>
                  <th>Créditos</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows}
              </tbody>
            </table>
          </div>
        `
      : creditHistoryError
        ? `<div class="credits-history-error">${creditHistoryError}</div>`
        : `<div class="profile-empty">Nenhuma movimentação de crédito encontrada ainda.</div>`;

  const creditsHistorySection = showCreditHistory
    ? `
            <section class="credits-history">
              <div class="credits-history-header">
                <h2>Histórico de créditos</h2>
                <p>Últimas 7 movimentações de créditos da sua conta.</p>
              </div>
              ${historyContent}
              ${hasMoreSpentToShow && !creditHistoryLoading
                ? `<button type="button" class="credits-history-more" id="creditsHistoryMoreBtn"${creditHistoryLoadingMore ? " disabled" : ""}>${creditHistoryLoadingMore ? "Carregando..." : "Visualizar mais"}</button>`
                : ""}
            </section>
      `
    : `
            <section class="credits-history">
              <div class="credits-history-header">
                <h2>Histórico de créditos</h2>
                <p>Carregado sob demanda para reduzir leituras.</p>
              </div>
              <div class="profile-empty">Abra a tela de créditos para ver o histórico completo.</div>
              <button type="button" class="credits-history-more" id="profileOpenCreditsHistory">Abrir histórico de créditos</button>
            </section>
      `;

  const evaluationsHistoryContent = showEvaluationHistory
    ? `${loading ? `<div class="profile-loading">Carregando...</div>` : list}`
    : `
            <div class="profile-empty">Carregado sob demanda para reduzir leituras.</div>
            <button type="button" class="credits-history-more" id="profileOpenEvaluationsHistory">Abrir histórico de avaliações</button>
      `;

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="profile-page">
      <div class="profile-header">
        <h1>Seu perfil</h1>
        <p>${user?.displayName ? user.displayName + " &middot; " : ""}${user?.email || ""}</p>
      </div>
      ${globalNotice
        ? `
          <div class="profile-notice-board">
            <strong>Mural de avisos</strong>
            <p>${escapeHtml(globalNotice).replace(/\n/g, "<br />")}</p>
          </div>
        `
        : ""}

      <div class="profile-section">
        <h2>Dados do usuário</h2>
        <div class="profile-form">
          <div class="profile-field">
            <label>Nome completo</label>
            <input type="text" id="profileName" value="${profile?.name || ""}" />
          </div>
          <div class="profile-field">
            <label>Perfil</label>
            <select id="profileRole">
              <option value="">Selecione</option>
              ${roleSelect}
            </select>
          </div>
          <div class="profile-field">
            <label>WhatsApp (opcional)</label>
            <input type="text" id="profileWhatsapp" value="${profile?.whatsapp || ""}" />
          </div>
          <div class="profile-field profile-field--button">
            <label>&nbsp;</label>
            <button type="button" id="profileSave">Salvar</button>
          </div>
        </div>
        <div class="profile-danger">
          <small>Exclusão de conta via solicitação pelo contato.</small>
          <button type="button" id="profileDelete">Solicitar exclusão</button>
        </div>
      </div>

      <div class="profile-columns">
        <div class="profile-column profile-column--left">
          <div class="profile-section" id="profileCreditsSection">
            <h2>Créditos</h2>
            <div class="credits-card">
              <div>
                <span>Saldo atual</span>
                <strong class="credits-balance">${credits ?? 0} créditos</strong>
              </div>
              <div class="credits-meta">
                <span>Validade: 30 dias</span>
                <span>Pacotes ativos: Bronze, Silver e Gold</span>
              </div>
              <div class="credits-card-actions credits-card-actions--profile">
                <button type="button" id="buyCreditsBtn" class="credits-action-primary">Comprar créditos</button>
                <button type="button" id="creditsCheckBtn" class="credits-check-btn credits-check-btn--inline credits-action-secondary">Atualizar créditos</button>
              </div>
            </div>
            <div class="credits-note">
              Treino e avaliação consomem 1 crédito cada.
            </div>

            ${creditsHistorySection}

            <div class="evaluation-modal hidden" id="creditsCheckoutModal" role="dialog" aria-modal="true" aria-labelledby="creditsCheckoutTitle">
              <div class="evaluation-box credits-checkout-box">
                <h3 id="creditsCheckoutTitle">Comprar créditos</h3>
                <p>Você será redirecionado para uma plataforma de pagamento segura (Mercado Pago).</p>
                <p>Após concluir o pagamento, retorne para esta página e confirme a atualização dos créditos.</p>
                <div class="evaluation-actions">
                  <button type="button" id="creditsCheckoutCancel" style="background:#6b7280;color:#ffffff;">Cancelar</button>
                  <button type="button" id="creditsCheckoutConfirm">Confirmar pagamento</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-column profile-column--right">
          <div class="profile-section">
            <h2>Histórico de avaliações</h2>
            ${showEvaluationHistory
              ? `<button type="button" class="credits-history-more" id="profileBackToSummary">Voltar ao resumo</button>`
              : ""}
            ${showEvaluationHistory
              ? `
                <div class="profile-summary-inline">
                  <div><span>Avaliações</span><strong>${evaluationsTotal}</strong></div>
                  <div><span>Aprovadas</span><strong>${approvedCount}</strong></div>
                  <div class="is-percent"><span>Média</span><strong>${averagePercent}%</strong></div>
                </div>
              `
              : ""}
            ${showEvaluationHistory
              ? `
                <div class="profile-filters">
                  <button type="button" class="active" data-profile-filter="all">Todas</button>
                  <button type="button" data-profile-filter="Aprovado">Aprovadas</button>
                  <button type="button" data-profile-filter="Reprovado">Reprovadas</button>
                </div>
              `
              : ""}
            ${evaluationsHistoryContent}
          </div>
        </div>
      </div>

    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function profileEvaluationView({
  summary,
  items,
  isAdmin = false,
  userLabel = "Conta",
  credits = null,
  simuladoLabel = "SIGWX",
  simuladoKey = "sigwx"
}) {
  const statusLabel = summary.status === "Aprovado" ? "✅ Aprovado" : "⚠️ Reprovado";
  const safeSimuladoKey = String(simuladoKey || "").toLowerCase();
  const shouldShowMedia = safeSimuladoKey !== "metar_taf";
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="eval-result eval-result--premium">
      <div class="eval-header">
        <div>
          <h1>Gabarito &middot; Avaliação ${escapeHtml(simuladoLabel)}</h1>
          <p>Resultado e gabarito da avaliação selecionada.</p>
        </div>
        <div class="eval-score-group">
          <span class="eval-status-outside ${summary.status === "Aprovado" ? "approved" : "reproved"}">${statusLabel}</span>
        </div>
      </div>
      <div class="eval-stats">
        <div><span>Total</span><strong>${summary.total}</strong></div>
        <div><span>Respondidas</span><strong>${summary.answered}</strong></div>
        <div><span>Acertos</span><strong>${summary.correct}</strong></div>
        <div><span>Erros</span><strong>${summary.wrong}</strong></div>
        <div class="is-percent"><span>Porcentagem</span><strong>${summary.percentage}%</strong></div>
        ${summary.durationSeconds !== null && summary.durationSeconds !== undefined
          ? `<div><span>Tempo</span><strong>${String(Math.floor(summary.durationSeconds / 60)).padStart(2, "0")}:${String(summary.durationSeconds % 60).padStart(2, "0")}</strong></div>`
          : ""}
      </div>
      <div class="eval-top-actions">
        <button type="button" id="evalRetryWrong" class="eval-top-btn eval-top-btn--ghost">Refazer apenas erradas</button>
        <button type="button" id="evalBackToSimulado" class="eval-top-btn">Voltar ao simulado</button>
      </div>
      <div class="eval-list">
        ${items.map((item) => `
          <article class="eval-item ${item.isWrong ? "is-wrong" : "is-correct"} ${item.image && shouldShowMedia ? "has-media" : "no-media"}">
            ${item.image && shouldShowMedia ? `
            <div class="eval-item-media">
              <img src="${item.image}" alt="Questão ${item.index}" />
            </div>
            ` : ""}
            <div class="eval-item-content">
              <h3>Questão ${item.index}</h3>
              <p class="eval-question">${item.question}</p>
              <div class="answer-card">
                <div class="answer-status ${item.isWrong ? "answer-status--wrong" : "answer-status--correct"}">
                  <span class="answer-status-icon">${item.isWrong ? "❌" : "✅"}</span>
                  <div class="answer-status-copy">
                    <strong>${item.isWrong ? "Resposta errada" : "Resposta correta"}</strong>
                    <p>Sua resposta: ${item.selectedText}</p>
                  </div>
                </div>

                <div class="answer-correct-box">
                  <span class="answer-box-label">Resposta correta</span>
                  <p>${item.correctText}</p>
                </div>

                <div class="answer-explanation-box eval-explanation" tabindex="-1">
                  <p class="answer-explanation-title eval-explanation-title">ℹ️ Explicação</p>
                  <p>${item.explanation}</p>
                </div>

                <div class="answer-actions">
                  ${item.isWrong ? `<button type="button" class="eval-review answer-action-btn" data-review-index="${item.index}">Revisar conteúdo</button>` : ""}
                  <a href="#" class="eval-report answer-action-link" data-report-index="${item.index}">Reportar erro</a>
                </div>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="eval-actions">
        <button type="button" id="profileBack">Voltar ao Perfil</button>
      </div>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function adminView({
  users = [],
  loading = false,
  isAdmin = false,
  userLabel = "Conta",
  credits = null,
  notice = "",
  globalNotice = "",
  metrics = null,
  metricsRange = "30d",
  lightMode = false,
  usersHasMore = false,
  usersLoadingMore = false,
  mode = "summary",
  sessionAvailability = null,
  simuladoQuestionCounts = {},
  questionBanks = [],
  selectedQuestionBank = "",
  questionItems = [],
  questionEditor = null,
  markedQuestionIds = [],
  reviewedQuestionIds = [],
  showOnlyMarked = false
} = {}) {
  const activeTab = ["dashboard", "users", "simulados", "financeiro"].includes(mode)
    ? mode
    : mode === "users"
      ? "users"
      : mode === "metrics" || mode === "summary"
        ? "dashboard"
        : "dashboard";
  const isDashboardTab = activeTab === "dashboard";
  const isUsersTab = activeTab === "users";
  const isSimuladosTab = activeTab === "simulados";
  const isFinanceiroTab = activeTab === "financeiro";

  const rangeLabel = metricsRange === "today" ? "Hoje" : metricsRange === "7d" ? "7 dias" : "30 dias";
  const periodSuffix = metrics?.rangeSupported === false ? " (total)" : ` (${rangeLabel})`;

  const sessionConfig = sessionAvailability || {
    sigwx: { enabled: true, training: true, evaluation: true },
    metar_taf: { enabled: true, training: true, evaluation: true },
    notam: { enabled: true, training: true, evaluation: true },
    rotaer: { enabled: true, training: true, evaluation: true },
    nuvens: { enabled: true, training: true, evaluation: true },
    sinais_luminosos: { enabled: true, training: true, evaluation: true },
    espacos_aereos: { enabled: true, training: true, evaluation: true }
  };
  const adminSessionSimulados = [
    { key: "sigwx", label: "SIGWX" },
    { key: "metar_taf", label: "METAR/TAF" },
    { key: "notam", label: "NOTAM" },
    { key: "rotaer", label: "ROTAER" },
    { key: "nuvens", label: "Nuvens" },
    { key: "sinais_luminosos", label: "Sinais luminosos" },
    { key: "espacos_aereos", label: "Espaços Aéreos" }
  ];

  const getSimuladoCount = (simuladoKey) => {
    const value = simuladoQuestionCounts?.[simuladoKey];
    if (value === null || value === undefined) {
      return { training: null, evaluation: null, total: null };
    }
    if (value && typeof value === "object") {
      const training = Number(value.training);
      const evaluation = Number(value.evaluation);
      const total = Number(value.total);
      return {
        training: Number.isFinite(training) ? training : null,
        evaluation: Number.isFinite(evaluation) ? evaluation : null,
        total: Number.isFinite(total) ? total : null
      };
    }
    const legacyTotal = Number(value);
    if (Number.isFinite(legacyTotal)) {
      return { training: null, evaluation: null, total: legacyTotal };
    }
    return { training: null, evaluation: null, total: null };
  };

  const formatDateCell = (value) => {
    const source = value && value.toDate ? value.toDate() : value;
    const date = source ? new Date(source) : null;
    return date && Number.isFinite(date.getTime()) ? date.toLocaleString("pt-BR") : "&mdash;";
  };

  const getSimuladoExecucoes = (simuladoKey) => {
    const value = metrics?.evaluationsBySimulado?.[simuladoKey];
    return Number.isFinite(Number(value)) ? Number(value) : null;
  };
  const getSimuladoAvgAccuracy = (simuladoKey) => {
    const value =
      metrics?.accuracyBySimulado?.[simuladoKey] ??
      metrics?.averageAccuracyBySimulado?.[simuladoKey] ??
      metrics?.avgAccuracyBySimulado?.[simuladoKey];
    return Number.isFinite(Number(value)) ? Number(value) : null;
  };
  const getSimuladoCredits = (simuladoKey) => {
    const value = metrics?.creditsConsumedBySimulado?.[simuladoKey];
    return Number.isFinite(Number(value)) ? Number(value) : null;
  };

  const toggleState = (key, mode) => (sessionConfig?.[key]?.[mode] ? "1" : "0");
  const toggleClass = (key, mode) => (sessionConfig?.[key]?.[mode] ? "is-enabled" : "is-disabled");
  const togglePressed = (key, mode) => (sessionConfig?.[key]?.[mode] ? "true" : "false");
  const toggleText = (key, mode, label) => `${label}: ${sessionConfig?.[key]?.[mode] ? "Ativado" : "Desativado"}`;
  const usersTableRows = users.length
    ? users.map((u) => {
      const userId = u.id || "";
      const creditsValue = Number.isFinite(Number(u.creditsBalance)) ? Number(u.creditsBalance) : 0;
      const trainingCount = Number.isFinite(Number(u.trainingCount)) ? Number(u.trainingCount) : null;
      const evaluationCount = Number.isFinite(Number(u.evaluationCount)) ? Number(u.evaluationCount) : null;
      const lastAccess =
        formatDateCell(
          u.lastAccessAt ??
          u.lastSeenAt ??
          u.lastLoginAt ??
          u.lastActiveAt ??
          u.updatedAt
        );
      return `
        <tr class="admin-user-row" data-name="${(u.name || "").toLowerCase()}" data-email="${(u.email || "").toLowerCase()}" data-role="${(u.role || "").toLowerCase().trim()}" data-user-id="${userId}">
          <td>${u.name || "Sem nome"}</td>
          <td>${u.email || "&mdash;"}</td>
          <td>${u.role || "&mdash;"}</td>
          <td>${creditsValue}</td>
          <td>${trainingCount === null ? "&mdash;" : trainingCount}</td>
          <td>${evaluationCount === null ? "&mdash;" : evaluationCount}</td>
          <td>${lastAccess}</td>
          <td>
            <div class="admin-user-actions-inline">
              <input type="number" min="0" step="1" class="admin-credits-input" data-user-id="${userId}" value="${creditsValue}" />
              <button type="button" class="admin-credits-save" data-user-id="${userId}">Salvar crédito</button>
              <button type="button" class="admin-user-delete" data-user-id="${userId}">Remover</button>
            </div>
          </td>
        </tr>
      `;
    }).join("")
    : "";

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="admin-page admin-v2">
      <div class="admin-header">
        <h1>Administração</h1>
        <p>Painel de gestão da plataforma.</p>
        ${notice ? `<div class="admin-notice">${notice}</div>` : ""}
      </div>
      <nav class="admin-v2-tabs" aria-label="Abas administrativas">
        <button type="button" class="admin-v2-tab${isDashboardTab ? " is-active" : ""}" data-admin-tab="dashboard">Dashboard</button>
        <button type="button" class="admin-v2-tab${isUsersTab ? " is-active" : ""}" data-admin-tab="users">Usuários</button>
        <button type="button" class="admin-v2-tab${isSimuladosTab ? " is-active" : ""}" data-admin-tab="simulados">Simulados</button>
        <button type="button" class="admin-v2-tab${isFinanceiroTab ? " is-active" : ""}" data-admin-tab="financeiro">Financeiro</button>
      </nav>

      <div class="admin-section admin-v2-panel">
        ${(isDashboardTab || isFinanceiroTab) ? `
          <div class="admin-metrics-range admin-v2-range" role="group" aria-label="Período das métricas">
            <button type="button" class="${metricsRange === "today" ? "active" : ""}" data-metrics-range="today">Hoje</button>
            <button type="button" class="${metricsRange === "7d" ? "active" : ""}" data-metrics-range="7d">7 dias</button>
            <button type="button" class="${metricsRange === "30d" ? "active" : ""}" data-metrics-range="30d">30 dias</button>
          </div>
        ` : ""}

        ${isDashboardTab ? `
          <div class="admin-metrics-controls">
            <button type="button" class="admin-light-mode-btn ${lightMode ? "active" : ""}" id="adminLightModeToggle">
              Modo leve: ${lightMode ? "ON" : "OFF"}
            </button>
            <button type="button" class="admin-light-mode-btn" id="adminGenerateReport">
              Gerar relatório geral
            </button>
          </div>
          <div class="admin-v2-kpis">
            <article class="admin-v2-kpi">
              <span>Usuários cadastrados</span>
              <strong>${Number.isFinite(Number(metrics?.totalUsersCurrent)) ? Number(metrics.totalUsersCurrent) : "&mdash;"}</strong>
            </article>
            <article class="admin-v2-kpi">
              <span>Usuários ativos${periodSuffix}</span>
              <strong>${Number.isFinite(Number(metrics?.activeUsers30d)) ? Number(metrics.activeUsers30d) : "&mdash;"}</strong>
            </article>
            <article class="admin-v2-kpi">
              <span>Simulados realizados${periodSuffix}</span>
              <strong>${Number.isFinite(Number(metrics?.sessionsTotal)) ? Number(metrics.sessionsTotal) : "&mdash;"}</strong>
            </article>
            <article class="admin-v2-kpi">
              <span>Créditos consumidos${periodSuffix}</span>
              <strong>${Number.isFinite(Number(metrics?.creditsConsumed)) ? Number(metrics.creditsConsumed) : "&mdash;"}</strong>
            </article>
          </div>

          <div class="admin-v2-table-card">
            <h2>Ranking de simulados</h2>
            <div class="admin-v2-table-wrap">
              <table class="admin-v2-table">
                <thead>
                  <tr>
                    <th>Simulado</th>
                    <th>Execuções${periodSuffix}</th>
                    <th>% acerto médio${periodSuffix}</th>
                    <th>Créditos consumidos${periodSuffix}</th>
                  </tr>
                </thead>
                <tbody>
                  ${adminSessionSimulados.map((simulado) => {
                    const runs = getSimuladoExecucoes(simulado.key);
                    const avg = getSimuladoAvgAccuracy(simulado.key);
                    const spent = getSimuladoCredits(simulado.key);
                    return `
                      <tr>
                        <td>${simulado.label}</td>
                        <td>${runs === null ? "&mdash;" : runs}</td>
                        <td>${avg === null ? "&mdash;" : `${avg.toFixed(1)}%`}</td>
                        <td>${spent === null ? "&mdash;" : spent}</td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <div class="admin-global-notice">
            <label for="adminGlobalNotice">Mural de avisos (aparece para todos os usuários no perfil)</label>
            <textarea id="adminGlobalNotice" rows="3" placeholder="Escreva um aviso global...">${escapeHtml(globalNotice || "")}</textarea>
            <button type="button" id="adminGlobalNoticeSave">Salvar aviso</button>
          </div>
        ` : ""}

        ${isUsersTab ? `
          <div class="admin-filters">
            <input type="text" id="adminSearch" placeholder="Buscar por nome ou email" />
            <select id="adminRole">
              <option value="">Todos os perfis</option>
              <option value="Aluno Piloto">Aluno Piloto</option>
              <option value="Piloto">Piloto</option>
              <option value="Outro">Outro</option>
            </select>
            <button type="button" id="adminRefresh">Atualizar</button>
            <button type="button" id="adminExport">Exportar CSV</button>
          </div>
          ${loading ? `<div class="profile-loading">Carregando...</div>` : users.length ? `
            <div class="admin-v2-table-wrap">
              <table class="admin-v2-table admin-v2-users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Perfil</th>
                    <th>Créditos</th>
                    <th>Treinos</th>
                    <th>Avaliações</th>
                    <th>Último acesso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${usersTableRows}
                </tbody>
              </table>
            </div>
          ` : `<div class="profile-empty">Nenhum usuário encontrado.</div>`}
          ${!loading && usersHasMore
            ? `<div class="admin-load-more-wrap"><button type="button" id="adminLoadMoreUsers"${usersLoadingMore ? " disabled" : ""}>${usersLoadingMore ? "Carregando..." : "Carregar mais usuários"}</button></div>`
            : ""}
        ` : ""}

        ${isSimuladosTab ? `
          <div class="admin-v2-table-wrap">
            <table class="admin-v2-table">
              <thead>
                <tr>
                  <th>Simulado</th>
                  <th>Simulado</th>
                  <th>Treino</th>
                  <th>Avaliação</th>
                  <th class="admin-v2-count-col">Questões Treino</th>
                  <th class="admin-v2-count-col">Questões Avaliação</th>
                  <th class="admin-v2-count-col">Nº Questões</th>
                  <th class="admin-v2-editor-col">Editar</th>
                </tr>
              </thead>
              <tbody>
                ${adminSessionSimulados.map((simulado) => {
                  const questionCount = getSimuladoCount(simulado.key);
                  return `
                    <tr>
                      <td>${simulado.label}</td>
                      <td>
                        <button
                          type="button"
                          class="admin-session-toggle ${toggleClass(simulado.key, "enabled")}"
                          data-session-toggle="${simulado.key}:enabled"
                          data-enabled="${toggleState(simulado.key, "enabled")}"
                          aria-pressed="${togglePressed(simulado.key, "enabled")}"
                        >
                          ${toggleText(simulado.key, "enabled", "Simulado")}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          class="admin-session-toggle ${toggleClass(simulado.key, "training")}"
                          data-session-toggle="${simulado.key}:training"
                          data-enabled="${toggleState(simulado.key, "training")}"
                          aria-pressed="${togglePressed(simulado.key, "training")}"
                        >
                          ${toggleText(simulado.key, "training", "Treino")}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          class="admin-session-toggle ${toggleClass(simulado.key, "evaluation")}"
                          data-session-toggle="${simulado.key}:evaluation"
                          data-enabled="${toggleState(simulado.key, "evaluation")}"
                          aria-pressed="${togglePressed(simulado.key, "evaluation")}"
                        >
                          ${toggleText(simulado.key, "evaluation", "Avaliação")}
                        </button>
                      </td>
                      <td class="admin-v2-count-cell">${questionCount.training === null ? "&mdash;" : questionCount.training}</td>
                      <td class="admin-v2-count-cell">${questionCount.evaluation === null ? "&mdash;" : questionCount.evaluation}</td>
                      <td class="admin-v2-count-cell">${questionCount.total === null ? "&mdash;" : questionCount.total}</td>
                      <td class="admin-v2-editor-cell">
                        <div class="admin-v2-inline-actions">
                          <button type="button" class="admin-light-mode-btn" data-open-simulado-editor="${simulado.key}" data-editor-mode="training">Treino</button>
                          <button type="button" class="admin-light-mode-btn" data-open-simulado-editor="${simulado.key}" data-editor-mode="evaluation">Avaliação</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
          <div class="admin-v2-save-row">
            <small>Após ajustar os toggles, salve para aplicar no dashboard dos alunos.</small>
            <button type="button" id="adminSessionAvailabilitySave" class="admin-v2-primary-btn">Salvar disponibilidade</button>
          </div>
        ` : ""}

        ${isFinanceiroTab ? `
          <div class="admin-v2-kpis">
            <article class="admin-v2-kpi">
              <span>Créditos vendidos${periodSuffix}</span>
              <strong>${Number.isFinite(Number(metrics?.creditsPurchased)) ? Number(metrics.creditsPurchased) : "&mdash;"}</strong>
            </article>
            <article class="admin-v2-kpi">
              <span>Créditos consumidos${periodSuffix}</span>
              <strong>${Number.isFinite(Number(metrics?.creditsConsumed)) ? Number(metrics.creditsConsumed) : "&mdash;"}</strong>
            </article>
            <article class="admin-v2-kpi">
              <span>Saldo geral${periodSuffix}</span>
              <strong>${Number.isFinite(Number(metrics?.creditsPurchased)) && Number.isFinite(Number(metrics?.creditsConsumed))
                ? Number(metrics.creditsPurchased) - Number(metrics.creditsConsumed)
                : "&mdash;"}</strong>
            </article>
            <article class="admin-v2-kpi">
              <span>Receita estimada</span>
              <strong>${Number.isFinite(Number(metrics?.estimatedRevenue)) ? Number(metrics.estimatedRevenue).toFixed(2) : "&mdash;"}</strong>
            </article>
          </div>
          <p class="admin-metrics-footnote">Se não houver valor monetário disponível, a receita estimada permanece como “—”.</p>
        ` : ""}
      </div>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function adminQuestionHubView({ isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="admin-page">
      <div class="admin-header admin-question-hub-head">
        <div>
          <h1>Painel de questões</h1>
          <p>Escolha o simulador e o modo para editar o banco.</p>
        </div>
        <button type="button" id="adminQuestionHubBack">Voltar ao Admin</button>
      </div>
      <div class="admin-question-hub">
        <article class="admin-question-hub-card">
          <h2>SIGWX</h2>
          <p>Simbologia e nomenclaturas.</p>
          <div class="admin-question-hub-actions">
            <button type="button" data-open-question-bank="sigwx_training">Modo Treino</button>
            <button type="button" data-open-question-bank="sigwx_evaluation">Modo Avaliação</button>
          </div>
        </article>
        <article class="admin-question-hub-card">
          <h2>METAR / TAF</h2>
          <p>Leitura e interpretação operacional.</p>
          <div class="admin-question-hub-actions">
            <button type="button" data-open-question-bank="metar_taf_training">Modo Treino</button>
            <button type="button" data-open-question-bank="metar_taf_evaluation">Modo Avaliação</button>
          </div>
        </article>
      </div>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function adminReportView({
  reportData = null,
  isAdmin = false,
  userLabel = "Conta",
  credits = null
} = {}) {
  const meta = reportData?.meta || {};
  const resumo = reportData?.resumo || {};
  const tabelas = reportData?.tabelas || {};
  const simulados = Array.isArray(tabelas.simulados) ? tabelas.simulados : [];
  const usuarios = Array.isArray(tabelas.usuarios) ? tabelas.usuarios : [];
  const questoes = Array.isArray(tabelas.questoesMaisErradas) ? tabelas.questoesMaisErradas : [];
  const textOrDash = (value) => (value === null || value === undefined || value === "" ? "&mdash;" : String(value));
  const percentOrDash = (value) => (Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : "&mdash;");
  const numberOrNull = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);
  const periodSuffix = meta?.periodMode === "total" ? " (total)" : "";
  const periodTitle = `${textOrDash(meta?.periodLabel)}${periodSuffix}`;
  const started = numberOrNull(resumo.simuladosIniciados);
  const completed = numberOrNull(resumo.simuladosConcluidos);
  const completionRate = started && started > 0 && completed !== null ? (completed / started) * 100 : null;

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="admin-page admin-report">
      <div class="report-page">
        <header class="report-header">
          <div class="report-title-block">
            <h1>Relatório Geral &middot; PreFlight Simulados</h1>
            <div class="report-meta">
              <p><strong>Período:</strong> ${textOrDash(meta?.periodLabel)}</p>
              <p><strong>Gerado em:</strong> ${textOrDash(meta?.generatedAtText)}</p>
              <p class="report-note">Campos podem aparecer como “&mdash;” quando não houver dado disponível.</p>
            </div>
          </div>
          <div class="report-actions admin-report-actions">
            <button type="button" id="adminReportPrint">Imprimir / Salvar PDF</button>
            <button type="button" id="adminReportDownloadCsv">Baixar CSV</button>
            <button type="button" id="adminReportBack">Voltar ao Admin</button>
          </div>
        </header>

        <section class="admin-report-section report-section-box">
          <h2>Resumo executivo</h2>
          <div class="report-kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Usuários cadastrados</div>
              <div class="kpi-value">${textOrDash(resumo.usersTotal)}</div>
              <div class="kpi-footnote">(total)</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Novos cadastros</div>
              <div class="kpi-value">${textOrDash(resumo.novosCadastros)}</div>
              <div class="kpi-footnote">${periodSuffix ? "(total)" : ""}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Usuários ativos</div>
              <div class="kpi-value">${textOrDash(resumo.usuariosAtivos)}</div>
              <div class="kpi-footnote">${periodSuffix ? "(total)" : ""}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Simulados iniciados</div>
              <div class="kpi-value">${textOrDash(resumo.simuladosIniciados)}</div>
              <div class="kpi-footnote">${periodSuffix ? "(total)" : ""}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Simulados concluídos</div>
              <div class="kpi-value">${textOrDash(resumo.simuladosConcluidos)}</div>
              <div class="kpi-footnote">${periodSuffix ? "(total)" : ""}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Créditos comprados</div>
              <div class="kpi-value">${textOrDash(resumo.creditosComprados)}</div>
              <div class="kpi-footnote">${periodSuffix ? "(total)" : ""}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Créditos consumidos</div>
              <div class="kpi-value">${textOrDash(resumo.creditosConsumidos)}</div>
              <div class="kpi-footnote">${periodSuffix ? "(total)" : ""}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Saldo no período</div>
              <div class="kpi-value">${textOrDash(resumo.saldoPeriodo)}</div>
              <div class="kpi-footnote">${periodSuffix ? "(total)" : ""}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Taxa de conclusão</div>
              <div class="kpi-value">${completionRate === null ? "&mdash;" : `${completionRate.toFixed(1)}%`}</div>
              <div class="kpi-footnote">${completionRate === null ? "" : `${textOrDash(resumo.simuladosConcluidos)} / ${textOrDash(resumo.simuladosIniciados)}`}</div>
            </div>
          </div>
        </section>

        <section class="admin-report-section report-section-box">
          <h2>Uso por simulado &middot; ${periodTitle}</h2>
          <div class="admin-v2-table-wrap report-table-wrap">
            <table class="admin-v2-table report-table">
              <thead>
                <tr>
                  <th>Simulado</th>
                  <th class="num">Execuções</th>
                  <th class="num">Conclusões</th>
                  <th class="num">% médio</th>
                  <th class="num">Créditos</th>
                </tr>
              </thead>
              <tbody>
                ${simulados.map((item) => `
                  <tr>
                    <td>${textOrDash(item?.simulado)}</td>
                    <td class="num">${textOrDash(item?.execucoes)}</td>
                    <td class="num">${textOrDash(item?.conclusoes)}</td>
                    <td class="num">${percentOrDash(item?.acertoMedio)}</td>
                    <td class="num">${textOrDash(item?.creditosConsumidos)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-report-section report-section-box">
          <h2>Usuários</h2>
          <div class="admin-v2-table-wrap report-table-wrap">
            <table class="admin-v2-table report-table report-users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th class="num">Créditos</th>
                  <th class="num">Treinos</th>
                  <th class="num">Avaliações</th>
                  <th>Último acesso</th>
                </tr>
              </thead>
              <tbody>
                ${usuarios.length
                  ? usuarios.map((item) => `
                      <tr>
                        <td>${textOrDash(item?.nome)}</td>
                        <td class="email">${textOrDash(item?.email)}</td>
                        <td>${textOrDash(item?.perfil)}</td>
                        <td class="num">${textOrDash(item?.creditos)}</td>
                        <td class="num">${textOrDash(item?.treinos)}</td>
                        <td class="num">${textOrDash(item?.avaliacoes)}</td>
                        <td>${textOrDash(item?.ultimoAcesso)}</td>
                      </tr>
                    `).join("")
                  : `<tr><td colspan="7">&mdash;</td></tr>`}
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-report-section report-section-box">
          <h2>Qualidade &middot; Top questões mais erradas</h2>
          ${questoes.length
            ? `
              <div class="admin-v2-table-wrap report-table-wrap">
                <table class="admin-v2-table report-table">
                  <thead>
                    <tr>
                      <th>Questão</th>
                      <th>Simulado</th>
                      <th class="num">Erros</th>
                      <th class="num">% acerto</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${questoes.map((item) => `
                      <tr>
                        <td>${textOrDash(item?.questao)}</td>
                        <td>${textOrDash(item?.simulado)}</td>
                        <td class="num">${textOrDash(item?.erros)}</td>
                        <td class="num">${percentOrDash(item?.acerto)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            `
            : `<div class="report-empty-box">Dados não disponíveis</div>`}
        </section>
      </div>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function adminQuestionEditorView({
  isAdmin = false,
  userLabel = "Conta",
  credits = null,
  questionBanks = [],
  selectedQuestionBank = "",
  questionItems = [],
  questionEditor = null,
  markedQuestionIds = [],
  reviewedQuestionIds = [],
  showOnlyMarked = false,
  autoNextOnSave = false
} = {}) {
  const markedIdSet = new Set(
    (Array.isArray(markedQuestionIds) ? markedQuestionIds : [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0)
  );
  const reviewedIdSet = new Set(
    (Array.isArray(reviewedQuestionIds) ? reviewedQuestionIds : [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0)
  );
  const selectedBankLabel =
    (Array.isArray(questionBanks) ? questionBanks : []).find((bank) => String(bank?.id || "").trim() === selectedQuestionBank)?.label ||
    selectedQuestionBank ||
    "Banco";

  const visibleQuestionItems = (Array.isArray(questionItems) ? questionItems : [])
    .filter((item) => !showOnlyMarked || markedIdSet.has(Number(item?.id)));

  const questionList = visibleQuestionItems
    .map((item) => `
      <button type="button" class="admin-question-item ${Number(item?.id) === Number(questionEditor?.id) ? "active" : ""}" data-question-edit="${Number(item?.id) || 0}">
        <div class="qeditor-item-media">
          ${item?.image && item?.textOnImageCard !== true
            ? `<img src="${escapeHtml(String(item.image))}" alt="Questão ${Number(item?.id) || 0}" loading="lazy" />`
            : `<span class="admin-question-thumb-empty">${item?.textOnImageCard === true ? "Enunciado no card" : "Sem imagem"}</span>`}
        </div>
        <div class="qeditor-item-body">
          <div class="qeditor-item-top">
            <strong class="qeditor-item-id">#${Number(item?.id) || 0}</strong>
            <div class="qeditor-item-badges">
              <span class="qeditor-chip qeditor-chip--code">${escapeHtml(String(item?.controlCode || ""))}</span>
              ${markedIdSet.has(Number(item?.id))
                ? `<span class="qeditor-chip qeditor-chip--marked">Marcada</span>`
                : ""}
              ${reviewedIdSet.has(Number(item?.id))
                ? `<span class="qeditor-chip qeditor-chip--reviewed">Revisada</span>`
                : ""}
            </div>
          </div>
          <span class="qeditor-item-question">${escapeHtml(String(item?.question || "Sem enunciado"))}</span>
        </div>
      </button>
    `)
    .join("");

  const editorId = Number(questionEditor?.id) || "";
  const editorQuestion = escapeHtml(String(questionEditor?.question || ""));
  const editorImage = escapeHtml(String(questionEditor?.image || ""));
  const editorOptions = Array.isArray(questionEditor?.options) ? questionEditor.options : [];
  const editorCorrect = Number.isFinite(Number(questionEditor?.correctIndex))
    ? Number(questionEditor.correctIndex)
    : 0;
  const editorExplanation = escapeHtml(String(questionEditor?.explanation || ""));
  const editorTextOnImageCard = questionEditor?.textOnImageCard === true;
  const editorFontSize = Number.isFinite(Number(questionEditor?.questionFontSize))
    ? Math.max(10, Math.min(36, Math.floor(Number(questionEditor.questionFontSize))))
    : 18;
  const editorControlCode = escapeHtml(String(questionEditor?.controlCode || ""));
  const currentIndex = visibleQuestionItems.findIndex(
    (item) => Number(item?.id) === Number(questionEditor?.id)
  );
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < visibleQuestionItems.length - 1;
  const markedItems = (Array.isArray(questionItems) ? questionItems : [])
    .filter((item) => markedIdSet.has(Number(item?.id)))
    .sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0));
  const isCurrentMarked = markedIdSet.has(Number(editorId));
  const isCurrentReviewed = reviewedIdSet.has(Number(editorId));

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="admin-page qeditor-v2">
      <div class="qeditor-shell">
        <div class="qeditor-topbar">
          <div class="qeditor-context">
            <h1>Editor de questões</h1>
            <div class="qeditor-context-line">
              <span class="qeditor-badge">${escapeHtml(String(selectedBankLabel).replace("•", "·"))}</span>
              <span class="qeditor-badge qeditor-badge--soft">${editorId ? `Editando questão #${editorId}` : "Nova questão"}</span>
            </div>
          </div>
          <div class="qeditor-top-actions">
            <div class="qeditor-action-group qeditor-action-group--primary">
              <button type="button" data-qeditor-proxy="#adminQuestionSave">Salvar</button>
            </div>
            <div class="qeditor-action-group">
              <button type="button" data-qeditor-proxy="#adminQuestionSaveAndNew">Salvar e novo</button>
              <button type="button" id="adminQuestionReload">Recarregar</button>
              <button type="button" id="adminQuestionNew">Nova questão</button>
              <button type="button" data-qeditor-proxy="#adminQuestionDuplicate">Duplicar</button>
            </div>
            <div class="qeditor-action-group">
              <button type="button" id="adminQuestionOnlyMarked" class="${showOnlyMarked ? "active" : ""}">
                ${showOnlyMarked ? "Mostrar todas" : "Só marcadas"}
              </button>
              <button type="button" id="adminQuestionPdf">Gerar PDF</button>
              <button type="button" id="adminQuestionEditorBack">Simuladores</button>
            </div>
            <div class="qeditor-action-group qeditor-action-group--danger">
              <button type="button" data-qeditor-proxy="#adminQuestionDelete">Excluir</button>
            </div>
          </div>
        </div>

        <div class="qeditor-layout">
          <aside class="qeditor-sidebar">
            <div class="admin-question-search-code">
              <input type="text" id="adminQuestionSearchCode" placeholder="Buscar código (ex: METAR_TAF_EVALUATION-Q0042)" />
              <button type="button" id="adminQuestionFindByCode">Ir</button>
            </div>
            <div class="admin-question-list">
              ${questionList || `<div class="profile-empty">${showOnlyMarked ? "Nenhuma questão marcada neste banco." : "Nenhuma questão cadastrada neste banco."}</div>`}
            </div>
            <div class="admin-question-marked-panel">
              <div class="admin-question-marked-head">
                <strong>Marcadas para revisão</strong>
                <span>${markedItems.length}</span>
              </div>
              <div class="admin-question-marked-list">
                ${markedItems.length
                  ? markedItems.map((item) => `
                      <button type="button" class="admin-question-marked-item" data-question-marked-edit="${Number(item?.id) || 0}">
                        #${Number(item?.id) || 0}
                      </button>
                    `).join("")
                  : `<small>Nenhuma questão marcada ainda.</small>`}
              </div>
              <button type="button" id="adminQuestionMarkedClear" class="admin-question-marked-clear"${markedItems.length ? "" : " disabled"}>
                Limpar marcadas
              </button>
            </div>
          </aside>

          <main class="qeditor-main">
            <div class="admin-question-editor">
              <div class="qeditor-card qeditor-card--fields">
                <h3>Dados</h3>
                <div class="qeditor-fields-2col">
                  <div class="admin-question-row">
                    <label for="adminQuestionId">ID</label>
                    <input type="number" id="adminQuestionId" min="1" step="1" value="${editorId}" />
                  </div>
                  <div class="admin-question-row" id="adminQuestionImageRow"${editorTextOnImageCard ? " style=\"display:none;\"" : ""}>
                    <label for="adminQuestionImage">Imagem (caminho)</label>
                    <input type="text" id="adminQuestionImage" value="${editorImage}" placeholder="assets/questions/sigwx/1.webp" />
                  </div>
                </div>
                <div class="admin-question-row">
                  <label for="adminQuestionControlCode">Código de controle</label>
                  <input type="text" id="adminQuestionControlCode" value="${editorControlCode}" readonly />
                </div>
                <div class="admin-question-row">
                  <label class="admin-question-switch">
                    <input type="checkbox" id="adminQuestionTextOnImageCard" ${editorTextOnImageCard ? "checked" : ""} />
                    <span>Enunciado no card da imagem (sem imagem)</span>
                  </label>
                </div>
              </div>

              <div class="qeditor-card">
                <h3 id="adminQuestionPreviewTitle">${editorTextOnImageCard ? "Preview do enunciado" : "Preview da imagem"}</h3>
                <div class="admin-question-preview ${(editorTextOnImageCard ? editorQuestion : editorImage) ? "" : "is-empty"}">
                  <img id="adminQuestionImagePreview" src="${editorImage}" alt="Prévia da questão"${editorTextOnImageCard ? " style=\"display:none;\"" : ""} />
                  <span id="adminQuestionImagePlaceholder"${editorTextOnImageCard || editorImage ? " style=\"display:none;\"" : ""}>Sem imagem definida para esta questão.</span>
                  <span id="adminQuestionTextPreview"${editorTextOnImageCard ? "" : " style=\"display:none;\""}>${editorQuestion || "Digite o enunciado para visualizar aqui."}</span>
                </div>
              </div>

              <div class="qeditor-card">
                <h3>Enunciado</h3>
                <div class="qeditor-rich-toolbar" role="toolbar" aria-label="Formatação do enunciado">
                  <button type="button" class="qeditor-rich-btn" data-rich-cmd="bold" title="Negrito"><strong>B</strong></button>
                  <button type="button" class="qeditor-rich-btn" data-rich-cmd="italic" title="Itálico"><em>I</em></button>
                  <button type="button" class="qeditor-rich-btn" data-rich-cmd="underline" title="Sublinhado"><u>U</u></button>
                  <button type="button" class="qeditor-rich-btn" data-rich-cmd="justifyLeft" title="Alinhar à esquerda">Esq</button>
                  <button type="button" class="qeditor-rich-btn" data-rich-cmd="justifyCenter" title="Centralizar">Centro</button>
                  <button type="button" class="qeditor-rich-btn" data-rich-cmd="justifyRight" title="Alinhar à direita">Dir</button>
                  <label class="qeditor-rich-color" for="adminQuestionFontSize">Tamanho base</label>
                  <select id="adminQuestionFontSize" title="Tamanho base do enunciado">
                    <option value="10px" ${editorFontSize === 10 ? "selected" : ""}>10</option>
                    <option value="12px" ${editorFontSize === 12 ? "selected" : ""}>12</option>
                    <option value="14px" ${editorFontSize === 14 ? "selected" : ""}>14</option>
                    <option value="16px" ${editorFontSize === 16 ? "selected" : ""}>16</option>
                    <option value="18px" ${editorFontSize === 18 ? "selected" : ""}>18</option>
                    <option value="20px" ${editorFontSize === 20 ? "selected" : ""}>20</option>
                    <option value="24px" ${editorFontSize === 24 ? "selected" : ""}>24</option>
                    <option value="28px" ${editorFontSize === 28 ? "selected" : ""}>28</option>
                  </select>
                  <label class="qeditor-rich-color" for="adminQuestionTextColor">Cor</label>
                  <input type="color" id="adminQuestionTextColor" value="#0f2f5a" title="Cor do texto" />
                </div>
                <div class="admin-question-row">
                  <div
                    id="adminQuestionTextRich"
                    class="qeditor-rich-input"
                    contenteditable="true"
                    role="textbox"
                    aria-label="Enunciado com formatação"
                    aria-multiline="true"
                  ></div>
                  <textarea id="adminQuestionText" rows="3" placeholder="Digite o enunciado" style="display:none;">${editorQuestion}</textarea>
                </div>
              </div>

              <div class="qeditor-card">
                <h3>Alternativas</h3>
                <div class="qeditor-options-grid">
                  <div class="admin-question-row">
                    <label for="adminQuestionOption0">A</label>
                    <input type="text" id="adminQuestionOption0" value="${escapeHtml(String(editorOptions[0] || ""))}" />
                  </div>
                  <div class="admin-question-row">
                    <label for="adminQuestionOption1">B</label>
                    <input type="text" id="adminQuestionOption1" value="${escapeHtml(String(editorOptions[1] || ""))}" />
                  </div>
                  <div class="admin-question-row">
                    <label for="adminQuestionOption2">C</label>
                    <input type="text" id="adminQuestionOption2" value="${escapeHtml(String(editorOptions[2] || ""))}" />
                  </div>
                  <div class="admin-question-row">
                    <label for="adminQuestionOption3">D</label>
                    <input type="text" id="adminQuestionOption3" value="${escapeHtml(String(editorOptions[3] || ""))}" />
                  </div>
                </div>
              </div>

              <div class="qeditor-card">
                <div class="qeditor-answer-grid">
                  <div class="admin-question-row">
                    <label for="adminQuestionCorrect">Resposta correta</label>
                    <select id="adminQuestionCorrect">
                      <option value="0" ${editorCorrect === 0 ? "selected" : ""}>A</option>
                      <option value="1" ${editorCorrect === 1 ? "selected" : ""}>B</option>
                      <option value="2" ${editorCorrect === 2 ? "selected" : ""}>C</option>
                      <option value="3" ${editorCorrect === 3 ? "selected" : ""}>D</option>
                    </select>
                  </div>
                  <div class="admin-question-row">
                    <label for="adminQuestionExplanation">Explicação</label>
                    <textarea id="adminQuestionExplanation" rows="3" placeholder="Explique por que a alternativa correta está certa">${editorExplanation}</textarea>
                  </div>
                </div>
              </div>

              <div class="qeditor-footer">
                <div class="qeditor-footer-left">
                  <button type="button" id="adminQuestionPrev" ${hasPrev ? "" : "disabled"}>Anterior</button>
                  <button type="button" id="adminQuestionNext" ${hasNext ? "" : "disabled"}>Próxima</button>
                  <label class="admin-question-switch">
                    <input type="checkbox" id="adminQuestionAutoNextOnSave" ${autoNextOnSave ? "checked" : ""} />
                    <span>Após salvar, ir para próxima</span>
                  </label>
                </div>
                <div class="qeditor-footer-right">
                  <button type="button" id="adminQuestionSave">Salvar</button>
                  <button type="button" id="adminQuestionSaveAndNew">Salvar e novo</button>
                  <button type="button" id="adminQuestionDuplicate">Duplicar</button>
                  <button type="button" id="adminQuestionMarkToggle" class="${isCurrentMarked ? "is-marked" : ""}">
                    ${isCurrentMarked ? "Desmarcar revisão" : "Marcar revisão"}
                  </button>
                  <button type="button" id="adminQuestionReviewedToggle" class="${isCurrentReviewed ? "is-reviewed" : ""}">
                    ${isCurrentReviewed ? "Desmarcar revisado" : "Revisado"}
                  </button>
                  <button type="button" id="adminQuestionDelete" class="danger">Excluir</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

// ===============================
// CRÃ‰DITOS
// ===============================
function creditsView({
  user,
  credits = null,
  userLabel = "Conta",
  isAdmin = false,
  historyItems = [],
  historyLoading = false,
  historyLoadingMore = false,
  historyHasMore = false,
  historyError = ""
}) {
  const safeItems = Array.isArray(historyItems) ? historyItems : [];
  const historyRows = safeItems
    .map((item) => `
      <tr>
        <td>${item.dateLabel || "&mdash;"}</td>
        <td>${item.description || "&mdash;"}</td>
        <td><strong class="credits-amount ${item.amountClass || ""}">${item.amountLabel || "&mdash;"}</strong></td>
        <td>${item.statusLabel || "&mdash;"}</td>
      </tr>
    `)
    .join("");

  const historyContent = historyLoading && !safeItems.length
    ? `<div class="profile-loading">Carregando histórico...</div>`
    : safeItems.length
      ? `
          <div class="credits-history-table-wrap">
            <table class="credits-history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Movimentação</th>
                  <th>Créditos</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows}
              </tbody>
            </table>
          </div>
        `
      : historyError
        ? `<div class="credits-history-error">${historyError}</div>`
        : `<div class="profile-empty">Nenhuma movimentação encontrada ainda.</div>`;

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="credits-page">
      <div class="credits-header">
        <h1>Créditos</h1>
        <p>Use créditos para iniciar treinos e avaliações.</p>
      </div>

      <div class="credits-status" id="creditsStatus" hidden>
        <strong>Pagamento recente?</strong>
        <span>Após pagar, volte para esta página e clique em confirmar para atualizar seus créditos.</span>
        <button type="button" id="creditsCheckBtn" class="credits-check-btn">Já paguei, atualizar créditos</button>
      </div>

      <div class="credits-card">
        <div>
          <span>Saldo atual</span>
          <strong class="credits-balance">${credits ?? 0} créditos</strong>
        </div>
        <div class="credits-meta">
          <span>Validade: 30 dias</span>
          <span>Pacotes ativos: Bronze, Silver e Gold</span>
        </div>
        <button type="button" id="buyCreditsBtn">Escolher pacote</button>
      </div>

      <div class="credits-note">
        Treino e avaliação consomem 1 crédito cada.
      </div>

      <section class="credits-history">
        <div class="credits-history-header">
          <h2>Histórico de créditos</h2>
          <p>Compras e consumos mais recentes da sua conta.</p>
        </div>
        ${historyContent}
        ${historyHasMore && !historyLoading
          ? `<button type="button" class="credits-history-more" id="creditsHistoryMoreBtn"${historyLoadingMore ? " disabled" : ""}>${historyLoadingMore ? "Carregando..." : "Carregar mais"}</button>`
          : ""}
      </section>

      <div class="evaluation-modal hidden" id="creditsCheckoutModal" role="dialog" aria-modal="true" aria-labelledby="creditsCheckoutTitle">
        <div class="evaluation-box credits-checkout-box">
          <h3 id="creditsCheckoutTitle">Comprar créditos</h3>
          <p>Você será redirecionado para uma plataforma de pagamento segura (Mercado Pago).</p>
          <p>Após concluir o pagamento, retorne para esta página e confirme a atualização dos créditos.</p>
          <div class="evaluation-actions">
            <button type="button" id="creditsCheckoutCancel" style="background:#6b7280;color:#ffffff;">Cancelar</button>
            <button type="button" id="creditsCheckoutConfirm">Confirmar pagamento</button>
          </div>
        </div>
      </div>
    </section>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function packagesView({ isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="packages-page">
      <div class="packages-header">
        <h1>Pacotes de créditos</h1>
        <p>Escolha o plano ideal para treinar e evoluir no PreFlight.</p>
        <div class="packages-trust-line">
          <span>Pagamento seguro via Mercado Pago</span>
          <img
            class="packages-mp-logo"
            src="https://cdn.simpleicons.org/mercadopago/009ee3"
            alt="Logo Mercado Pago"
            loading="lazy"
          />
          <span>&bull; Liberação rápida dos créditos &bull; Suporte no contato</span>
        </div>
      </div>

      <div class="packages-grid">
        <article class="package-card" data-package-id="bronze" data-package-name="Bronze">
          <div class="package-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 3h6l-1 5h-4L9 3Z"/>
              <path d="M10 8 7 12"/>
              <path d="M14 8 17 12"/>
              <circle cx="12" cy="16" r="5"/>
              <path d="m12 13 1.2 2.2 2.5.4-1.8 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.8-1.8 2.5-.4L12 13Z"/>
            </svg>
          </div>
          <h3>Bronze - 10 Créditos</h3>
          <p class="package-old-price">De R$ 12 por:</p>
          <div class="package-price">R$ 9,90</div>
          <ul class="package-list">
            <li>10 créditos para treino/avaliação</li>
            <li>Validade de 30 dias</li>
            <li>Ideal para começar</li>
            <li>Menor investimento inicial</li>
          </ul>
          <button type="button" class="package-buy-btn" data-package-id="bronze" data-package-name="Bronze">Escolher Bronze</button>
        </article>

        <article class="package-card package-card--popular" data-package-id="silver" data-package-name="Silver">
          <span class="package-badge">Mais popular</span>
          <div class="package-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/>
              <path d="M7 6H4a2 2 0 0 0 2 2h1"/>
              <path d="M17 6h3a2 2 0 0 1-2 2h-1"/>
              <path d="M12 13v3"/>
              <path d="M9 20h6"/>
              <path d="M8 17h8"/>
            </svg>
          </div>
          <h3>Silver - 30 Créditos</h3>
          <p class="package-old-price">De R$ 30 por:</p>
          <div class="package-price">R$ 19,90</div>
          <ul class="package-list">
            <li>Economia de 33%</li>
            <li>30 créditos para usar como quiser</li>
            <li>Validade de 30 dias</li>
            <li>Melhor equilíbrio entre preço e volume</li>
          </ul>
          <button type="button" class="package-buy-btn" data-package-id="silver" data-package-name="Silver">Escolher Silver</button>
        </article>

        <article class="package-card" data-package-id="gold" data-package-name="Gold">
          <div class="package-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3c3.2 1.6 5.5 4.9 5.5 8.8L21 14l-3.5 2.2L16 20l-4-2-4 2-1.5-3.8L3 14l3.5-2.2C6.5 7.9 8.8 4.6 12 3Z"/>
              <circle cx="12" cy="10" r="2"/>
              <path d="M10 14h4"/>
              <path d="M9 20h6"/>
            </svg>
          </div>
          <h3>Gold - 50 Créditos</h3>
          <p class="package-old-price">De R$ 50 por:</p>
          <div class="package-price">R$ 29,90</div>
          <ul class="package-list">
            <li>Melhor custo por crédito</li>
            <li>50 créditos para alto volume</li>
            <li>Validade de 30 dias</li>
            <li>Ideal para rotina intensa</li>
          </ul>
          <button type="button" class="package-buy-btn" data-package-id="gold" data-package-name="Gold">Escolher Gold</button>
        </article>
      </div>

      <div class="packages-summary">
        <h2>Comparativo rápido</h2>
        <div class="packages-summary-table-wrap">
          <table class="packages-summary-table">
            <thead>
              <tr>
                <th>Pacote</th>
                <th>Créditos</th>
                <th>Valor por crédito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bronze</td>
                <td>10</td>
                <td>R$ 0,99</td>
              </tr>
              <tr>
                <td>Silver</td>
                <td>30</td>
                <td>R$ 0,66</td>
              </tr>
              <tr>
                <td>Gold</td>
                <td>50</td>
                <td>R$ 0,59</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="packages-shared-benefits">Todos os pacotes incluem: histórico completo no perfil e acesso às próximas atualizações.</p>

      <div class="packages-note">
        1 crédito = 1 treino ou 1 avaliação. Todos os pacotes possuem validade de 30 dias.
      </div>

      <div class="evaluation-modal hidden" id="packagesCheckoutModal" role="dialog" aria-modal="true" aria-labelledby="packagesCheckoutTitle">
        <div class="evaluation-box credits-checkout-box">
          <h3 id="packagesCheckoutTitle">Confirmar compra</h3>
          <p id="packagesCheckoutText">Você será redirecionado para o Mercado Pago em uma nova aba.</p>
          <p>Após concluir o pagamento, volte ao PreFlight e clique em <strong>“Já paguei, atualizar créditos”</strong> no perfil.</p>
          <div class="evaluation-actions">
            <button type="button" id="packagesCheckoutCancel" style="background:#6b7280;color:#ffffff;">Cancelar</button>
            <button type="button" id="packagesCheckoutConfirm">OK, abrir pagamento</button>
          </div>
        </div>
      </div>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

// ===============================
// EXPORTS
// ===============================
export {
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
  contactView,
  profileView,
  profileEvaluationView,
  adminView,
  adminReportView,
  adminQuestionHubView,
  adminQuestionEditorView,
  creditsView,
  packagesView,
  privacyView,
  cookiesView
};
