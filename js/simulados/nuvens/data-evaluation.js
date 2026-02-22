// ===============================
// BANCO DE QUESTOES - NUVENS (AVALIACAO)
// ===============================

const rawNuvensEvaluationQuestions = [
  {
    id: 1,
    image: "assets/questions/nuvens/evaluation/1.webp",
    question: "Qual tipo de nuvem é mais associado a tempestade severa?",
    options: [
      "Cumulonimbus (CB)",
      "Cirrostratus (CS)",
      "Stratus (ST)",
      "Altostratus (AS)"
    ],
    correctIndex: 0,
    explanation: "CB está ligado a convecção intensa, gelo, granizo e trovoadas."
  },
  {
    id: 2,
    image: "assets/questions/nuvens/evaluation/2.webp",
    question: "Nuvens altas em véu, que podem produzir halo, são:",
    options: [
      "Cirrostratus (CS)",
      "Stratocumulus (SC)",
      "Nimbostratus (NS)",
      "Cumulus congestus"
    ],
    correctIndex: 0,
    explanation: "Cirrostratus é fino e extenso, frequentemente associado a halo."
  },
  {
    id: 3,
    image: "assets/questions/nuvens/evaluation/3.webp",
    question: "Nuvens baixas em blocos, com aspecto ondulado, correspondem a:",
    options: [
      "Stratocumulus (SC)",
      "Cirrus (CI)",
      "Altocumulus (AC)",
      "Cumulonimbus (CB)"
    ],
    correctIndex: 0,
    explanation: "SC é nuvem baixa com elementos arredondados em camada."
  },
  {
    id: 4,
    image: "assets/questions/nuvens/evaluation/4.webp",
    question: "Qual nuvem tende a indicar boa condição de voo VFR quando isolada e pouco desenvolvida?",
    options: [
      "Cumulus humilis",
      "Nimbostratus",
      "Cumulonimbus",
      "Stratus fractus em grande área"
    ],
    correctIndex: 0,
    explanation: "Cumulus humilis costuma indicar convecção fraca e bom tempo."
  },
  {
    id: 5,
    image: "assets/questions/nuvens/evaluation/5.webp",
    question: "Nuvem média em camada uniforme, sem grande estrutura convectiva:",
    options: [
      "Altostratus (AS)",
      "Cumulonimbus (CB)",
      "Cirrocumulus (CC)",
      "Stratus (ST)"
    ],
    correctIndex: 0,
    explanation: "Altostratus aparece em níveis médios, com aspecto de manto."
  }
];

function normalizeNuvensEvaluationQuestion(item, index) {
  const source = item || {};
  const parsedId = Number(source.id);
  const id = Number.isFinite(parsedId) && parsedId > 0 ? Math.floor(parsedId) : index + 1;
  const options = Array.isArray(source.options) ? source.options : [];
  const parsedCorrect = Number(source.correctIndex);

  return {
    id,
    image: String(source.image || `assets/questions/nuvens/evaluation/${id}.webp`),
    question: String(source.question || "").trim(),
    options: [0, 1, 2, 3].map((pos) => String(options[pos] || "").trim()),
    correctIndex: Number.isFinite(parsedCorrect) ? Math.max(0, Math.min(3, Math.floor(parsedCorrect))) : 0,
    explanation: String(source.explanation || "").trim()
  };
}

const nuvensEvaluationQuestions = rawNuvensEvaluationQuestions.map((item, index) =>
  normalizeNuvensEvaluationQuestion(item, index)
);

export { nuvensEvaluationQuestions };
