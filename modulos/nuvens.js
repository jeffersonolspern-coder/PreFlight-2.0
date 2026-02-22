const nuvensModule = {
  key: "nuvens",
  slug: "nuvens",
  title: "Nuvens",
  description:
    "Desenvolva reconhecimento visual e classificacao de nuvens com foco pratico para questoes de meteorologia aeronautica.",
  learningTopics: [
    "Classificar nuvens por genero e desenvolvimento vertical",
    "Reconhecer forma, altura e caracteristicas visuais",
    "Relacionar tipos de nuvem com condicoes de voo",
    "Identificar nuvens associadas a instabilidade",
    "Evitar confusoes entre formacoes semelhantes"
  ],
  supportItems: [
    {
      type: "PDF",
      label: "Atlas resumido de nuvens",
      description: "Area pronta para PDF com exemplos visuais e classificacao.",
      href: "#"
    },
    {
      type: "Documento externo",
      label: "Referencia visual complementar",
      description: "Campo para links externos com bibliografia recomendada.",
      href: "#"
    },
    {
      type: "Checklist",
      label: "Checklist de identificacao visual",
      description: "Sequencia rapida para validar resposta por caracteristicas.",
      href: "#"
    },
    {
      type: "Observacoes",
      label: "Comparativos entre tipos parecidos",
      description: "Espaco para registrar diferencas criticas entre nuvens."
    }
  ],
  estimatedTime: "10-15 minutos",
  recommendedLevel: "Basico",
  recommendedAudience: "PP / PC / PLA",
  trainingDecisionText:
    "Receba feedback imediato a cada questao e ajuste sua interpretacao.",
  evaluationDecisionText:
    "Simule uma prova real com tempo e resultado final.",
  positioningLine:
    "Modulo essencial para classificacao visual em provas e operacao real.",
  trainingFlowText:
    "Feedback imediato apos cada questao.",
  evaluationFlowText:
    "Simulacao real com tempo e resultado final.",
  demoQuestion: {
    prompt: "Qual tipo de nuvem e mais associado a grande desenvolvimento vertical e tempestade?",
    options: ["Stratus", "Cirrus", "Cumulonimbus", "Altocumulus"],
    correctIndex: 2,
    explanation: "O Cumulonimbus apresenta forte desenvolvimento vertical e esta ligado a conveccao intensa."
  },
  supportText:
    "Centralize materiais visuais e checklists para reforcar memorizacao e reduzir erro por confusao de padroes.",
  videoPlaceholderTitle: "Aula em video (em breve)",
  videoPlaceholderText:
    "Estrutura pronta para incluir uma aula demonstrativa de identificacao de nuvens.",
  trainingSummary:
    "No modo Treinamento, voce aprende com correcao imediata para fixar identificacao e classificacao.",
  evaluationSummary:
    "No modo Avaliacao, a experiencia replica um cenario de prova para medir consistencia."
};

export { nuvensModule };
