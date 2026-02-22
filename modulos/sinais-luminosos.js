const sinaisLuminososModule = {
  key: "sinais_luminosos",
  slug: "sinais-luminosos",
  title: "Sinais Luminosos",
  description:
    "Aprenda a interpretar sinais luminosos aplicados ao patio e pista para tomada de decisao segura em operacao visual.",
  learningTopics: [
    "Reconhecer sinais luminosos em solo e em voo",
    "Relacionar cor do sinal com instrucao operacional",
    "Aplicar resposta correta em contexto de pista e taxi",
    "Diferenciar sinais continuos e intermitentes",
    "Reforcar conduta segura em cenario sem radio"
  ],
  supportItems: [
    {
      type: "PDF",
      label: "Tabela de sinais luminosos",
      description: "Espaco preparado para PDF com sinais e significados.",
      href: "#"
    },
    {
      type: "Documento externo",
      label: "Referencia regulatoria",
      description: "Area para incluir links externos oficiais.",
      href: "#"
    },
    {
      type: "Checklist",
      label: "Resposta imediata por cenario",
      description: "Estrutura para checklist de acao conforme o sinal.",
      href: "#"
    },
    {
      type: "Resumo",
      label: "Fluxo de decisao em operacao visual",
      description: "Mini explicacao textual para revisao rapida."
    }
  ],
  estimatedTime: "10-14 minutos",
  recommendedLevel: "Basico a Intermediario",
  recommendedAudience: "PP / PC / PLA",
  trainingDecisionText:
    "Receba feedback imediato a cada questao e ajuste sua interpretacao.",
  evaluationDecisionText:
    "Simule uma prova real com tempo e resultado final.",
  positioningLine:
    "Modulo essencial para leitura de sinais visuais em prova e operacao.",
  trainingFlowText:
    "Feedback imediato apos cada questao.",
  evaluationFlowText:
    "Simulacao real com tempo e resultado final.",
  demoQuestion: {
    prompt: "Qual resposta esta correta para luz verde fixa da torre direcionada a aeronave em solo?",
    options: ["Pousar autorizado", "Livre para taxiar", "Pare imediatamente", "Retorne ao ponto de espera"],
    correctIndex: 1,
    explanation: "Em solo, luz verde fixa normalmente significa livre para taxiar."
  },
  supportText:
    "Concentre aqui os materiais de apoio para revisao rapida dos sinais e da conduta esperada em cada situacao.",
  videoPlaceholderTitle: "Aula em video (em breve)",
  videoPlaceholderText:
    "Layout reservado para futura aula com exemplos praticos de sinais luminosos.",
  trainingSummary:
    "No modo Treinamento, o feedback imediato ajuda a fixar significado e resposta de cada sinal.",
  evaluationSummary:
    "No modo Avaliacao, voce simula uma prova para validar leitura e decisao sob pressao."
};

export { sinaisLuminososModule };
