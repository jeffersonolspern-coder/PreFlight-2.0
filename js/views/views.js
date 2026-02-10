// ===============================
// HEADER PADRONIZADO (GLOBAL)
// ===============================
function headerView({ logged = false, isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    <header class="site-header">
      <div class="header-content">
        <div class="logo">PreFlight Simulados</div>

        <nav class="menu">
          ${
            logged
              ? `
                <a href="#" id="goHome">Início</a>
                <a href="#" id="goDashboard">Simulados</a>
                <a href="#" id="goCredits">Créditos${credits !== null ? `: ${credits}` : ""}</a>
                ${isAdmin ? `<a href="#" id="goAdmin">Admin</a>` : ""}
                <a href="#" id="goContact">Contato</a>
                <div class="user-menu">
                  <button type="button" id="userMenuBtn" class="user-menu-btn">
                    ${userLabel}
                    <span class="user-menu-caret">▾</span>
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
    <button class="contact-fab" id="contactFab" aria-label="Contato"></button>
    <button class="contact-fab-close" id="contactFabClose" aria-label="Fechar contato">×</button>

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
        <div>© 2026 · PreFlight Simulados</div>

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
// HOME PÚBLICA
// ===============================
function homePublicView({ logged = false, isAdmin = false, userLabel = "Conta" } = {}) {
  return `
    ${headerView({ logged, isAdmin, userLabel, credits: null })}

    <section class="hero">
      <h1>Simulados para Formação Aeronáutica</h1>
      <p>Ambiente de treinamento e avaliação para estudo técnico na aviação.</p>

      <button id="accessBtn" class="cta-button">Acessar simulados</button>
      <small>Cadastro rápido • Sem pagamento • Acesso imediato após login</small>
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
      <div class="cards">
        <div class="card" data-action="sigwx">
          <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-plus-icon lucide-map-plus"><path d="m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12"/><path d="M15 5.764V12"/><path d="M18 15v6"/><path d="M21 18h-6"/><path d="M9 3.236v15"/></svg></span>
          <h3>SIGWX</h3>
          <p>Simbologia e Nomenclaturas</p>
        </div>
        <div class="card card-disabled" aria-disabled="true">
          <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-rain-icon lucide-cloud-sun-rain"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg></span>
          <h3>METAR / TAF</h3>
          <p>Em desenvolvimento</p>
        </div>
        <div class="card card-disabled" aria-disabled="true">
          <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>
          <h3>NOTAM</h3>
          <p>Em desenvolvimento</p>
        </div>
        <div class="card card-disabled" aria-disabled="true">
          <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tower-control-icon lucide-tower-control"><path d="M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z"/><path d="M8 13v9"/><path d="M16 22v-9"/><path d="m9 6 1 7"/><path d="m15 6-1 7"/><path d="M12 6V2"/><path d="M13 2h-2"/></svg></span>
          <h3>ROTAER</h3>
          <p>Em desenvolvimento</p>
        </div>
        <div class="card card-disabled" aria-disabled="true">
          <span class="card-emoji" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloudy-icon lucide-cloudy"><path d="M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z"/><path d="M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61"/></svg></span>
          <h3>Nuvens</h3>
          <p>Em desenvolvimento</p>
        </div>
      </div>
    </section>

    <section class="modes">
      <div class="mode-card">
        <h3>Modo Treinamento</h3>
        <p>Pratique leitura e interpretação de informações aeronáuticas.</p>
      </div>
      <div class="mode-card">
        <h3>Modo Avaliação</h3>
        <p>Teste seu conhecimento em ambiente controlado.</p>
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
      <input type="email" id="email" placeholder="Email" />
      <input type="password" id="password" placeholder="Senha" />
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
      <input type="text" id="name" placeholder="Nome completo" />
      <select id="role">
        <option value="">Selecione o perfil</option>
        <option value="Aluno Piloto">Aluno Piloto</option>
        <option value="Piloto">Piloto</option>
        <option value="Outro">Outro</option>
      </select>
      <input type="text" id="whatsapp" placeholder="WhatsApp (opcional)" />
      <input type="email" id="email" placeholder="Email" />
      <input type="password" id="password" placeholder="Senha (mín. 6 caracteres)" />
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
function dashboardView(user, { isAdmin = false, userLabel = "Conta", credits = null } = {}) {
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
            <button class="simulado-btn primary" data-action="sigwx">Treinamento</button>
            <button class="simulado-btn ghost" data-action="sigwx-eval">Avaliação</button>
          </div>
        </div>

        <div class="simulado-card">
          <div class="simulado-icon" aria-hidden="true"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-rain-icon lucide-cloud-sun-rain"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg></div>
          <h3>METAR / TAF</h3>
          <p>Em desenvolvimento.</p>
          <div class="simulado-actions">
            <button class="simulado-btn primary" disabled>Treinamento</button>
            <button class="simulado-btn ghost" disabled>Avaliação</button>
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
// SIGWX (TREINO / AVALIAÇÃO / RESULTADO)
// ===============================
function sigwxView({ isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <div class="simulado-header">
      <div>
        <h2 class="simulado-mode-title">Modo Treinamento · SIGWX</h2>
        <div class="simulado-status" id="sigwxProgress"></div>
      </div>
    </div>

    <section class="simulado-container">
      <aside class="simulado-nav">
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

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function sigwxEvaluationView({ isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <div class="simulado-header">
      <div>
        <h2 class="simulado-mode-title">Modo Avaliação · SIGWX</h2>
        <div class="simulado-status" id="sigwxProgress"></div>
      </div>
      <div class="simulado-timer" id="sigwxTimer" aria-live="polite">15:00</div>
    </div>

    <section class="simulado-container">
      <aside class="simulado-nav">
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
        <p>O tempo começará a contar após clicar em iniciar.</p>
        <button type="button" id="evaluationOk">Iniciar avaliação</button>
      </div>
    </div>

    ${footerView()}
    ${contactWidgetView()}
  `;
}

function sigwxEvaluationResultView({ summary, items, isAdmin = false, userLabel = "Conta", credits = null }) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}

    <section class="eval-result">
      <div class="eval-header">
        <div>
          <h1>Resultado · Avaliação SIGWX</h1>
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
          <article class="eval-item">
            <div class="eval-item-media">
              <img src="${item.image}" alt="Questão ${item.index}" />
            </div>
            <div class="eval-item-content">
              <h3>Questão ${item.index}</h3>
              <p class="eval-question">${item.question}</p>
              <div class="eval-answers">
                <div>
                  <span>Sua resposta</span>
                  <strong>${item.selectedText}</strong>
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
        <button type="button" id="evalHome">Ir para Início</button>
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
              <strong>09:00 – 18:00</strong>
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
    ${contactWidgetView()}
  `;
}

// ===============================
// PERFIL / ADMIN (SIMPLIFICADOS)
// ===============================
function profileView({ user, profile, evaluations = [], loading = false, isAdmin = false, userLabel = "Conta", credits = null }) {
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
        evaluations.map((e) => {
          const date =
            e.createdAt && e.createdAt.toDate
              ? e.createdAt.toDate()
              : e.createdAt
                ? new Date(e.createdAt)
                : null;
          const dateText = date ? date.toLocaleString("pt-BR") : "—";
          const statusClass = e.status === "Aprovado" ? "approved" : "reproved";

          const timeText = formatDuration(
            e.durationSeconds ?? e.duration_seconds ?? e.durationseconds ?? e.duration
          );

          return `
            <div class="profile-card" data-profile-status="${e.status}">
              <div>
                <strong>${e.simulado}</strong>
                <span>${dateText}</span>
                ${timeText ? `<span class="profile-time">Tempo: ${timeText}</span>` : ""}
              </div>
              <div>
                <span class="profile-score-line">
                  ${e.correct}/${e.total} (${e.percentage}%)
                  • ${timeText || "--:--"}
                </span>
                <span class="profile-status ${statusClass}">${e.status}</span>
                <button class="profile-link" data-eval-id="${e.id}">Ver gabarito</button>
              </div>
            </div>
          `;
        }).join("") +
      `</div>`
    : `<div class="profile-empty">Nenhuma avaliação registrada ainda.</div>`;

  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="profile-page">
      <div class="profile-header">
        <h1>Seu perfil</h1>
        <p>${user?.displayName ? user.displayName + " · " : ""}${user?.email || ""}</p>
      </div>

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
          <small>Essa ação é permanente.</small>
          <button type="button" id="profileDelete">Excluir minha conta</button>
        </div>
      </div>

      <div class="profile-section">
        <h2>Histórico de avaliações</h2>
        <div class="profile-filters">
          <button type="button" class="active" data-profile-filter="all">Todas</button>
          <button type="button" data-profile-filter="Aprovado">Aprovadas</button>
          <button type="button" data-profile-filter="Reprovado">Reprovadas</button>
        </div>
        ${loading ? `<div class="profile-loading">Carregando...</div>` : list}
      </div>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

function profileEvaluationView({ summary, items, isAdmin = false, userLabel = "Conta", credits = null }) {
  return `
    ${headerView({ logged: true, isAdmin, userLabel, credits })}
    <section class="eval-result">
      <div class="eval-header">
        <div>
          <h1>Gabarito · Avaliação SIGWX</h1>
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
          <article class="eval-item">
            <div class="eval-item-media">
              <img src="${item.image}" alt="Questão ${item.index}" />
            </div>
            <div class="eval-item-content">
              <h3>Questão ${item.index}</h3>
              <p class="eval-question">${item.question}</p>
              <div class="eval-answers">
                <div>
                  <span>Sua resposta</span>
                  <strong>${item.selectedText}</strong>
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

function adminView({ users = [], loading = false, isAdmin = false, userLabel = "Conta", credits = null } = {}) {
  const list = users.length
    ? `<div class="admin-grid">` +
        users.map((u) => {
          const createdAt = u.createdAt && u.createdAt.toDate
            ? u.createdAt.toDate()
            : u.createdAt
              ? new Date(u.createdAt)
              : null;
          const createdText = createdAt ? createdAt.toLocaleString("pt-BR") : "—";
          return `
            <div class="admin-card" data-name="${(u.name || "").toLowerCase()}" data-email="${(u.email || "").toLowerCase()}" data-role="${u.role || ""}">
              <strong>${u.name || "Sem nome"}</strong>
              <span>${u.email || "—"}</span>
              <span>${u.role || "—"}</span>
              <span>${u.whatsapp || "—"}</span>
              <span>${createdText}</span>
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
      </div>
      <div class="admin-section">
        <div class="admin-filters">
          <input type="text" id="adminSearch" placeholder="Buscar por nome ou email" />
          <select id="adminRole">
            <option value="">Todos os perfis</option>
            <option value="Aluno Piloto">Aluno Piloto</option>
            <option value="Piloto">Piloto</option>
            <option value="Outro">Outro</option>
          </select>
          <button type="button" id="adminExport">Exportar CSV</button>
        </div>
        ${loading ? `<div class="profile-loading">Carregando...</div>` : list}
      </div>
    </section>
    ${footerView()}
    ${contactWidgetView()}
  `;
}

// ===============================
// CRÉDITOS
// ===============================
function creditsView({ user, credits = null }) {
  return `
    ${headerView({ logged: true, isAdmin: false, userLabel: user?.email || "Conta", credits })}

    <section class="credits-page">
      <div class="credits-header">
        <h1>Créditos</h1>
        <p>Use créditos para iniciar treinos e avaliações.</p>
      </div>

      <div class="credits-card">
        <div>
          <span>Saldo atual</span>
          <strong class="credits-balance">${credits ?? 0} créditos</strong>
        </div>
        <div class="credits-meta">
          <span>Validade: 30 dias</span>
          <span>Pacote: 10 créditos por R$ 5,00</span>
        </div>
        <button type="button" id="buyCreditsBtn">Comprar créditos</button>
      </div>

      <div class="credits-note">
        Treino e avaliação consomem 1 crédito cada.
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
  creditsView,
  privacyView,
  cookiesView
};
