const sigwxModule = {
  key: "sigwx",
  slug: "sigwx",
  title: "SIGWX",
  description:
    "Interprete cartas SIGWX com foco operacional, identificando simbologia, areas de risco e impactos no planejamento do voo.",
  learningTopics: [
    "Identificar simbolos meteorologicos mais cobrados",
    "Interpretar areas de turbulencia, gelo e CB",
    "Ler niveis de voo e faixas de fenomenos",
    "Relacionar cartas SIGWX com tomada de decisao em rota",
    "Evitar erros comuns de interpretacao em prova"
  ],
  supportItems: [
    {
      type: "PDF",
      label: "Resumo visual de simbologia SIGWX",
      description: "Espaco pronto para anexar um PDF de revisao rapida.",
      href: "#"
    },
    {
      type: "Documento externo",
      label: "Referencia meteorologica oficial",
      description: "Area para inserir links externos de consulta complementar.",
      href: "#"
    },
    {
      type: "Checklist",
      label: "Checklist de leitura antes de responder",
      description: "Modelo para validar interpretacao da carta em sequencia.",
      href: "#"
    },
    {
      type: "Guia rapido",
      label: "Fluxo sugerido de interpretacao",
      description: "Texto curto para reforcar o passo a passo do modulo."
    }
  ],
  estimatedTime: "12-18 minutos",
  recommendedLevel: "Intermediario",
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
    prompt: "Em uma carta SIGWX, o simbolo CB indica qual fenomeno principal?",
    options: ["Cumulus fractus", "Cumulonimbus", "Cirrus uncinus", "Nimbostratus"],
    correctIndex: 1,
    explanation: "CB e a abreviacao de Cumulonimbus, associado a tempo significativo convectivo."
  },
  supportText:
    "Use este espaco para centralizar os materiais de referencia do modulo e manter um roteiro unico de estudo.",
  videoPlaceholderTitle: "Aula em video (em breve)",
  videoPlaceholderText:
    "Layout pronto para futura publicacao de aula explicativa deste modulo.",
  trainingSummary:
    "No modo Treinamento, voce recebe correcao imediata e consegue aprender com cada questao em tempo real.",
  evaluationSummary:
    "No modo Avaliacao, voce simula uma prova completa para medir desempenho com mais realismo."
};

export { sigwxModule };
