const metarTafModule = {
  key: "metar_taf",
  slug: "metar-taf",
  title: "METAR / TAF",
  description:
    "Treine leitura e interpretacao de METAR e TAF para responder questoes com precisao e rapidez no contexto operacional.",
  learningTopics: [
    "Decodificar grupos principais do METAR",
    "Interpretar tendencias e periodos no TAF",
    "Identificar teto, visibilidade e fenomenos significativos",
    "Distinguir indicadores de mudanca temporal",
    "Relacionar condicoes meteorologicas com risco operacional"
  ],
  supportItems: [
    {
      type: "PDF",
      label: "Tabela de abreviacoes METAR/TAF",
      description: "Estrutura preparada para PDF de consulta rapida.",
      href: "#"
    },
    {
      type: "Documento externo",
      label: "Manual de codificacao meteorologica",
      description: "Espaco para link externo com material oficial.",
      href: "#"
    },
    {
      type: "Checklist",
      label: "Sequencia de leitura do boletim",
      description: "Bloco para checklist de interpretacao antes da resposta.",
      href: "#"
    },
    {
      type: "Notas",
      label: "Erros recorrentes e pegadinhas",
      description: "Area textual para registrar pontos de atencao."
    }
  ],
  estimatedTime: "14-20 minutos",
  recommendedLevel: "Basico a Intermediario",
  recommendedAudience: "PP / PC / PLA",
  trainingDecisionText:
    "Receba feedback imediato a cada questao e ajuste sua interpretacao.",
  evaluationDecisionText:
    "Simule uma prova real com tempo e resultado final.",
  positioningLine:
    "Modulo essencial para interpretacao meteorologica em provas e operacao real.",
  trainingFlowText:
    "Feedback imediato apos cada questao.",
  evaluationFlowText:
    "Simulacao real com tempo e resultado final.",
  demoQuestion: {
    prompt: "No METAR, qual grupo indica a visibilidade predominante reportada no aerodromo?",
    options: ["QNH (Q1013)", "Visibilidade horizontal em metros", "Temperatura e ponto de orvalho", "Tendencia NOSIG"],
    correctIndex: 1,
    explanation: "A visibilidade predominante aparece no grupo de visibilidade em metros no METAR."
  },
  supportText:
    "Organize aqui seus materiais de apoio para manter consistencia na leitura dos boletins e acelerar revisao.",
  videoPlaceholderTitle: "Aula em video (em breve)",
  videoPlaceholderText:
    "Espaco reservado para futura aula explicando a interpretacao de METAR/TAF.",
  trainingSummary:
    "No modo Treinamento, voce recebe feedback imediato para ajustar interpretacao e consolidar leitura.",
  evaluationSummary:
    "No modo Avaliacao, o fluxo simula a prova para validar desempenho e gestao de tempo."
};

export { metarTafModule };
