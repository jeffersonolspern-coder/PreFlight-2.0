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
          <a href="#" id="goCreditsTop" class="header-credits-pill">Créditos${logged ? `: ${credits ?? 0}` : ""}</a>
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
                <a href="#" id="goCredits">Créditos${credits !== null ? `: ${credits}` : ""}</a>
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
function homePublicView({ logged = false, isAdmin = false, userLabel = "Conta", credits = null } = {}) {
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
            <div class="card" data-action="sigwx">
              <span class="status-chip status-chip--live">Disponível agora</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-plus-icon lucide-map-plus"><path d="m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12"/><path d="M15 5.764V12"/><path d="M18 15v6"/><path d="M21 18h-6"/><path d="M9 3.236v15"/></svg></span>
              <h3>SIGWX</h3>
              <p>Simbologia e Nomenclaturas</p>
            </div>
            <div class="card" data-action="metar-taf">
              <span class="status-chip status-chip--live">Disponível agora</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-rain-icon lucide-cloud-sun-rain"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg></span>
              <h3>METAR / TAF</h3>
              <p>Leitura e interpretação operacional</p>
            </div>
            <div class="card card-disabled" aria-disabled="true">
              <span class="status-chip status-chip--soon">Em breve</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>
              <h3>NOTAM</h3>
              <p>Em desenvolvimento</p>
            </div>
            <div class="card card-disabled" aria-disabled="true">
              <span class="status-chip status-chip--soon">Em breve</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tower-control-icon lucide-tower-control"><path d="M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z"/><path d="M8 13v9"/><path d="M16 22v-9"/><path d="m9 6 1 7"/><path d="m15 6-1 7"/><path d="M12 6V2"/><path d="M13 2h-2"/></svg></span>
              <h3>ROTAER</h3>
              <p>Em desenvolvimento</p>
            </div>
            <div class="card card-disabled" aria-disabled="true">
              <span class="status-chip status-chip--soon">Em breve</span>
              <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloudy-icon lucide-cloudy"><path d="M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z"/><path d="M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61"/></svg></span>
              <h3>Nuvens</h3>
              <p>Em desenvolvimento</p>
            </div>
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
function dashboardView(user, { isAdmin = false, userLabel = "Conta", credits = null, canStartSessions = true } = {}) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="simulados-page">
      <div class="simulados-header">
      <h1>Simulados disponíveis</h1>
      <p>Ferramentas desenvolvidas para treinamento e avaliação na formação aeronáutica.</p>
      </div>

      <div class="simulados-grid">
        <div class="simulado-card simulado-active">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-plus-icon lucide-map-plus"><path d="m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12"/><path d="M15 5.764V12"/><path d="M18 15v6"/><path d="M21 18h-6"/><path d="M9 3.236v15"/></svg></div>
          <h3>SIGWX</h3>
          <p>Cartas de tempo significativo e interpretação operacional.</p>
          <div class="simulado-actions">
            <button id="dashboardSigwxTraining" class="simulado-btn primary" data-action="sigwx"${canStartSessions ? "" : " disabled aria-disabled=\"true\""}>Treinamento</button>
            <button id="dashboardSigwxEval" class="simulado-btn ghost" data-action="sigwx-eval"${canStartSessions ? "" : " disabled aria-disabled=\"true\""}>Avaliação</button>
          </div>
        </div>

        <div class="simulado-card simulado-active">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-rain-icon lucide-cloud-sun-rain"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg></div>
          <h3>METAR / TAF</h3>
          <p>Leitura e interpretação operacional.</p>
          <div class="simulado-actions">
            <button id="dashboardMetarTraining" class="simulado-btn primary" data-action="metar-taf"${canStartSessions ? "" : " disabled aria-disabled=\"true\""}>Treinamento</button>
            <button id="dashboardMetarEval" class="simulado-btn ghost" data-action="metar-taf-eval"${canStartSessions ? "" : " disabled aria-disabled=\"true\""}>Avaliação</button>
          </div>
        </div>

        <div class="simulado-card">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></div>
          <h3>NOTAM</h3>
          <p>Em desenvolvimento.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" disabled>Treinamento</button>
            <button class="simulado-btn ghost" disabled>Avaliação</button>
          </div>
        </div>

        <div class="simulado-card">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tower-control-icon lucide-tower-control"><path d="M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z"/><path d="M8 13v9"/><path d="M16 22v-9"/><path d="m9 6 1 7"/><path d="m15 6-1 7"/><path d="M12 6V2"/><path d="M13 2h-2"/></svg></div>
          <h3>ROTAER</h3>
          <p>Em desenvolvimento.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" disabled>Treinamento</button>
            <button class="simulado-btn ghost" disabled>Avaliação</button>
          </div>
        </div>

        <div class="simulado-card">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloudy-icon lucide-cloudy"><path d="M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z"/><path d="M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61"/></svg></div>
          <h3>Nuvens</h3>
          <p>Em desenvolvimento.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" disabled>Treinamento</button>
            <button class="simulado-btn ghost" disabled>Avaliação</button>
          </div>
        </div>
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
        <div class="simulado-status" id="sigwxProgress"></div>
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
        <div class="simulado-status" id="sigwxProgress"></div>
      </div>
      <div class="simulado-timer" id="sigwxTimer" aria-live="polite">15:00</div>
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

function sigwxEvaluationResultView({ summary, items, isAdmin = false, userLabel = "Conta", credits = null, simuladoLabel = "SIGWX" }) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="eval-result">
      <div class="eval-header">
        <div>
          <h1>Resultado &middot; Avaliação ${escapeHtml(simuladoLabel)}</h1>
          <p>Confira seu desempenho e o gabarito completo abaixo.</p>
        </div>
        <div class="eval-score-group">
          <span class="eval-status-outside ${summary.status === "Aprovado" ? "approved" : "reproved"}">${summary.status}</span>
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

      <div class="eval-list">
        ${items.map((item) => `
          <article class="eval-item ${item.isWrong ? "is-wrong" : "is-correct"}">
            <div class="eval-item-media">
              <img src="${item.image}" alt="Questão ${item.index}" />
            </div>
            <div class="eval-item-content">
              <h3>Questão ${item.index}</h3>
              <p class="eval-question">${item.question}</p>
              <div class="eval-answers">
                <div>
                  <span>Sua resposta</span>
                  <strong class="eval-answer-selected ${item.isWrong ? "is-wrong" : ""}">${item.selectedText}</strong>
                </div>
                <div>
                  <span>Resposta correta</span>
                  <strong>${item.correctText}</strong>
                </div>
              </div>
              <p class="eval-explanation">${item.explanation}</p>
              <a href="#" class="eval-report" data-report-index="${item.index}">Reportar erro</a>
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
  globalNotice = ""
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

  const approvedCount = evaluations.filter((e) => e.status === "Aprovado").length;
  const evaluationsTotal = evaluations.length;
  const averagePercent = evaluationsTotal
    ? Math.round(
      evaluations.reduce((acc, e) => acc + (Number(e.percentage) || 0), 0) / evaluationsTotal
    )
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
            <div class="profile-summary-inline">
              <div><span>Avaliações</span><strong>${evaluationsTotal}</strong></div>
              <div><span>Aprovadas</span><strong>${approvedCount}</strong></div>
              <div class="is-percent"><span>Média</span><strong>${averagePercent}%</strong></div>
            </div>
            <div class="profile-filters">
              <button type="button" class="active" data-profile-filter="all">Todas</button>
              <button type="button" data-profile-filter="Aprovado">Aprovadas</button>
              <button type="button" data-profile-filter="Reprovado">Reprovadas</button>
            </div>
            ${loading ? `<div class="profile-loading">Carregando...</div>` : list}
          </div>
        </div>
      </div>

    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function profileEvaluationView({ summary, items, isAdmin = false, userLabel = "Conta", credits = null, simuladoLabel = "SIGWX" }) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="eval-result">
      <div class="eval-header">
        <div>
          <h1>Gabarito &middot; Avaliação ${escapeHtml(simuladoLabel)}</h1>
          <p>Resultado e gabarito da avaliação selecionada.</p>
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
      <div class="eval-list">
        ${items.map((item) => `
          <article class="eval-item ${item.isWrong ? "is-wrong" : "is-correct"}">
            <div class="eval-item-media">
              <img src="${item.image}" alt="Questão ${item.index}" />
            </div>
            <div class="eval-item-content">
              <h3>Questão ${item.index}</h3>
              <p class="eval-question">${item.question}</p>
              <div class="eval-answers">
                <div>
                  <span>Sua resposta</span>
                  <strong class="eval-answer-selected ${item.isWrong ? "is-wrong" : ""}">${item.selectedText}</strong>
                </div>
                <div>
                  <span>Resposta correta</span>
                  <strong>${item.correctText}</strong>
                </div>
              </div>
              <p class="eval-explanation">${item.explanation}</p>
              <a href="#" class="eval-report" data-report-index="${item.index}">Reportar erro</a>
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
  questionBanks = [],
  selectedQuestionBank = "",
  questionItems = [],
  questionEditor = null,
  markedQuestionIds = [],
  reviewedQuestionIds = [],
  showOnlyMarked = false
} = {}) {
  const list = users.length
    ? `<div class="admin-grid">` +
        users.map((u) => {
          const createdAt = u.createdAt && u.createdAt.toDate
            ? u.createdAt.toDate()
            : u.createdAt
              ? new Date(u.createdAt)
              : null;
          const createdText = createdAt ? createdAt.toLocaleString("pt-BR") : "&mdash;";
          const trainingCount = Number.isFinite(Number(u.trainingCount)) ? Number(u.trainingCount) : null;
          const evaluationCount = Number.isFinite(Number(u.evaluationCount)) ? Number(u.evaluationCount) : null;
          const sessionText = trainingCount === null || evaluationCount === null
            ? "Treinos: -- • Avaliações: --"
            : `Treinos: ${trainingCount} • Avaliações: ${evaluationCount}`;
          return `
            <div class="admin-card" data-name="${(u.name || "").toLowerCase()}" data-email="${(u.email || "").toLowerCase()}" data-role="${(u.role || "").toLowerCase().trim()}" data-user-id="${u.id || ""}">
              <strong>${u.name || "Sem nome"}</strong>
              <span>${u.email || "&mdash;"}</span>
              <span>${u.role || "&mdash;"}</span>
              <span>${u.whatsapp || "&mdash;"}</span>
              <span>${createdText}</span>
              <span>${sessionText}</span>
              <div class="admin-credits">
                <span class="admin-credits-label">Créditos</span>
                <div class="admin-credits-row">
                  <span class="admin-credits-value">Saldo: ${Number.isFinite(u.creditsBalance) ? u.creditsBalance : 0}</span>
                  <input type="number" min="0" step="1" class="admin-credits-input" data-user-id="${u.id || ""}" value="${Number.isFinite(u.creditsBalance) ? u.creditsBalance : 0}" />
                  <button type="button" class="admin-credits-save" data-user-id="${u.id || ""}">Salvar</button>
                </div>
                <small class="admin-credits-hint">Ajuste o saldo e salve.</small>
              </div>
              <div class="admin-user-actions">
                <button type="button" class="admin-user-delete" data-user-id="${u.id || ""}">Remover do site</button>
              </div>
            </div>
          `;
        }).join("") +
      `</div>`
    : `<div class="profile-empty">Nenhum usuário encontrado.</div>`;

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="admin-page">
      <div class="admin-header">
        <h1>Administração</h1>
        <p>Relatório de cadastros e perfis.</p>
        ${notice ? `<div class="admin-notice">${notice}</div>` : ""}
      </div>
      <div class="admin-section">
        <div class="admin-metrics">
          <div class="admin-metrics-head">
            <h2>Métricas</h2>
            <div class="admin-metrics-controls">
              <button type="button" class="admin-light-mode-btn ${lightMode ? "active" : ""}" id="adminLightModeToggle">
                Modo leve: ${lightMode ? "ON" : "OFF"}
              </button>
              <div class="admin-metrics-range" role="group" aria-label="Período das métricas">
                <button type="button" class="${metricsRange === "today" ? "active" : ""}" data-metrics-range="today">Hoje</button>
                <button type="button" class="${metricsRange === "7d" ? "active" : ""}" data-metrics-range="7d">7 dias</button>
                <button type="button" class="${metricsRange === "30d" ? "active" : ""}" data-metrics-range="30d">30 dias</button>
              </div>
            </div>
          </div>
          <div class="admin-metrics-grid">
            <article class="admin-metric-card">
              <span>Usuários cadastrados</span>
              <strong>${Number.isFinite(Number(metrics?.totalUsersCurrent)) ? Number(metrics.totalUsersCurrent) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Usuários no histórico</span>
              <strong>${Number.isFinite(Number(metrics?.totalUsersHistorical)) ? Number(metrics.totalUsersHistorical) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Usuários com atividade</span>
              <strong>${Number.isFinite(Number(metrics?.activeUsers)) ? Number(metrics.activeUsers) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Online agora</span>
              <strong>${Number.isFinite(Number(metrics?.onlineNow)) ? Number(metrics.onlineNow) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Treinos iniciados</span>
              <strong>${Number.isFinite(Number(metrics?.trainingStarted)) ? Number(metrics.trainingStarted) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Avaliações concluídas</span>
              <strong>${Number.isFinite(Number(metrics?.evaluationsCompleted)) ? Number(metrics.evaluationsCompleted) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Taxa de aprovação</span>
              <strong>${Number.isFinite(Number(metrics?.approvalRate)) ? Number(metrics.approvalRate) : 0}%</strong>
            </article>
            <article class="admin-metric-card">
              <span>Créditos (gasto/comprado)</span>
              <strong>${Number.isFinite(Number(metrics?.creditsConsumed)) ? Number(metrics.creditsConsumed) : 0} / ${Number.isFinite(Number(metrics?.creditsPurchased)) ? Number(metrics.creditsPurchased) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Questões de treino</span>
              <strong>${Number.isFinite(Number(metrics?.trainingQuestions)) ? Number(metrics.trainingQuestions) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Questões de avaliação</span>
              <strong>${Number.isFinite(Number(metrics?.evaluationQuestions)) ? Number(metrics.evaluationQuestions) : 0}</strong>
            </article>
            <article class="admin-metric-card">
              <span>Total de questões</span>
              <strong>${Number.isFinite(Number(metrics?.totalQuestions)) ? Number(metrics.totalQuestions) : 0}</strong>
            </article>
          </div>
          <p class="admin-metrics-footnote">
            "Usuários no histórico" inclui contas removidas com atividade registrada. Top erros: ${Array.isArray(metrics?.topErrors) && metrics.topErrors.length ? metrics.topErrors.join(" • ") : "Sem dados no período."}
          </p>
        </div>

        <div class="admin-global-notice">
          <label for="adminGlobalNotice">Mural de avisos (aparece para todos os usuários no perfil)</label>
          <textarea id="adminGlobalNotice" rows="3" placeholder="Escreva um aviso global...">${escapeHtml(globalNotice || "")}</textarea>
          <button type="button" id="adminGlobalNoticeSave">Salvar aviso</button>
        </div>
        <div class="admin-questions-entry">
          <h2>Painel de questões</h2>
          <p>Acesse a área dedicada para cadastrar e revisar questões por simulador e modo.</p>
          <button type="button" id="goAdminQuestionsPage">Abrir área de questões</button>
        </div>
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
        ${loading ? `<div class="profile-loading">Carregando...</div>` : list}
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
        <div class="admin-question-item-head">
          <div class="admin-question-item-id">
            <strong>#${Number(item?.id) || 0}</strong>
            ${reviewedIdSet.has(Number(item?.id))
              ? `<span class="admin-question-reviewed-badge" aria-label="Revisado">&#10003;</span>`
              : ""}
          </div>
          ${item?.image
            ? `<img src="${escapeHtml(String(item.image))}" alt="Questão ${Number(item?.id) || 0}" loading="lazy" />`
            : `<span class="admin-question-thumb-empty">Sem imagem</span>`}
        </div>
        <span>${escapeHtml(String(item?.question || "Sem enunciado"))}</span>
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
    <section class="admin-page">
      <div class="admin-header">
        <h1>Editor de questões</h1>
        <p>Gerencie o banco de perguntas por simulador e modo.</p>
      </div>
      <div class="admin-questions">
        <div class="admin-questions-head">
          <h2>Banco de questões</h2>
          <div class="admin-question-mode-chip">${escapeHtml(String(selectedBankLabel))}</div>
          <div class="admin-questions-controls">
            <button type="button" id="adminQuestionOnlyMarked" class="${showOnlyMarked ? "active" : ""}">
              ${showOnlyMarked ? "Mostrar todas" : "Só marcadas"}
            </button>
            <button type="button" id="adminQuestionPdf">Gerar PDF</button>
            <button type="button" id="adminQuestionReload">Recarregar</button>
            <button type="button" id="adminQuestionNew">Nova questão</button>
            <button type="button" id="adminQuestionEditorBack">Simuladores</button>
          </div>
        </div>
        <div class="admin-questions-grid">
          <div class="admin-question-left">
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
          </div>
          <div class="admin-question-editor">
            <div class="admin-question-row">
              <label for="adminQuestionId">ID</label>
              <input type="number" id="adminQuestionId" min="1" step="1" value="${editorId}" />
            </div>
            <div class="admin-question-row">
              <label for="adminQuestionImage">Imagem (caminho)</label>
              <input type="text" id="adminQuestionImage" value="${editorImage}" placeholder="assets/questions/sigwx/1.webp" />
              <div class="admin-question-preview ${editorImage ? "" : "is-empty"}">
                ${editorImage
                  ? `<img src="${editorImage}" alt="Prévia da questão" />`
                  : `<span>Sem imagem definida para esta questão.</span>`}
              </div>
            </div>
            <div class="admin-question-row">
              <label for="adminQuestionText">Enunciado</label>
              <textarea id="adminQuestionText" rows="3" placeholder="Digite o enunciado">${editorQuestion}</textarea>
            </div>
            <div class="admin-question-row">
              <label for="adminQuestionOption0">Opção A</label>
              <input type="text" id="adminQuestionOption0" value="${escapeHtml(String(editorOptions[0] || ""))}" />
            </div>
            <div class="admin-question-row">
              <label for="adminQuestionOption1">Opção B</label>
              <input type="text" id="adminQuestionOption1" value="${escapeHtml(String(editorOptions[1] || ""))}" />
            </div>
            <div class="admin-question-row">
              <label for="adminQuestionOption2">Opção C</label>
              <input type="text" id="adminQuestionOption2" value="${escapeHtml(String(editorOptions[2] || ""))}" />
            </div>
            <div class="admin-question-row">
              <label for="adminQuestionOption3">Opção D</label>
              <input type="text" id="adminQuestionOption3" value="${escapeHtml(String(editorOptions[3] || ""))}" />
            </div>
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
            <label class="admin-question-switch">
              <input type="checkbox" id="adminQuestionAutoNextOnSave" ${autoNextOnSave ? "checked" : ""} />
              <span>Após salvar, ir para próxima</span>
            </label>
            <div class="admin-question-actions">
              <button type="button" id="adminQuestionSave">Salvar questão</button>
              <button type="button" id="adminQuestionDelete" class="danger">Excluir questão</button>
              <button type="button" id="adminQuestionMarkToggle" class="${isCurrentMarked ? "is-marked" : ""}">
                ${isCurrentMarked ? "Desmarcar revisão" : "Marcar revisão"}
              </button>
              <button type="button" id="adminQuestionReviewedToggle" class="${isCurrentReviewed ? "is-reviewed" : ""}">
                ${isCurrentReviewed ? "Desmarcar revisado" : "Revisado"}
              </button>
              <button type="button" id="adminQuestionPrev" ${hasPrev ? "" : "disabled"}>Anterior</button>
              <button type="button" id="adminQuestionNext" ${hasNext ? "" : "disabled"}>Próxima</button>
            </div>
          </div>
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
  sigwxView,
  sigwxEvaluationView,
  sigwxEvaluationResultView,
  contactView,
  profileView,
  profileEvaluationView,
  adminView,
  adminQuestionHubView,
  adminQuestionEditorView,
  creditsView,
  packagesView,
  privacyView,
  cookiesView
};
