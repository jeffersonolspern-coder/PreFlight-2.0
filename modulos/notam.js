const notamModule = {
  key: "notam",
  slug: "notam",
  title: "NOTAM",
  description:
    "Prepare sua leitura de NOTAM com foco em interpretacao operacional e tomada de decisao no contexto de prova.",
  learningTopics: [
    "Entender estrutura padrao de um NOTAM",
    "Identificar informacoes criticas para operacao",
    "Diferenciar restricoes temporarias e permanentes",
    "Priorizar leitura por impacto operacional",
    "Evitar erros comuns de interpretacao"
  ],
  supportItems: [
    {
      type: "PDF",
      label: "Guia rapido de leitura de NOTAM",
      description: "Material de revisao com estrutura e sequencia de leitura.",
      href: "#"
    },
    {
      type: "Documento externo",
      label: "Referencia oficial",
      description: "Espaco para adicionar documento externo de apoio.",
      href: "#"
    },
    {
      type: "Checklist",
      label: "Checklist de interpretacao",
      description: "Passo a passo para validar leitura antes da resposta.",
      href: "#"
    },
    {
      type: "Aula futura",
      label: "Aula em video (em breve)",
      description: "Espaco reservado para futura aula de interpretacao de NOTAM."
    }
  ],
  trainingDecisionText:
    "Treino em preparacao para feedback imediato por questao.",
  evaluationDecisionText:
    "Avaliacao em preparacao para simulacao completa de prova.",
  supportText:
    "Organize aqui os materiais de apoio para padronizar leitura e acelerar revisao.",
  videoPlaceholderTitle: "Aula em video (em breve)",
  videoPlaceholderText: "Area reservada para aula futura deste modulo."
};

export { notamModule };
