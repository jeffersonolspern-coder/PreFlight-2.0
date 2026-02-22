// ===============================
// BANCO DE QUESTOES - NUVENS (TREINAMENTO)
// ===============================

const rawNuvensQuestions = [
  {
    id: 1,
    image: "assets/questions/nuvens/training/1.webp",
    question: "A nuvem apresentada é um exemplo de:",
    options: [
      "Cumulonimbus (CB)",
      "Cirrus (CI)",
      "Stratus (ST)",
      "Nimbostratus (NS)"
    ],
    correctIndex: 0,
    explanation: "Cumulonimbus apresenta forte desenvolvimento vertical e pode gerar trovoadas."
  },
  {
    id: 2,
    image: "assets/questions/nuvens/training/2.webp",
    question: "Nuvens filamentosas, altas e brancas são geralmente classificadas como:",
    options: [
      "Cirrus (CI)",
      "Stratocumulus (SC)",
      "Altostratus (AS)",
      "Cumulus (CU)"
    ],
    correctIndex: 0,
    explanation: "Cirrus são nuvens altas, finas e fibrosas."
  },
  {
    id: 3,
    image: "assets/questions/nuvens/training/3.webp",
    question: "Uma camada baixa, uniforme e contínua de nuvens é típica de:",
    options: [
      "Stratus (ST)",
      "Cumulus (CU)",
      "Cirrocumulus (CC)",
      "Altocumulus (AC)"
    ],
    correctIndex: 0,
    explanation: "Stratus tende a formar uma cobertura uniforme em baixos níveis."
  },
  {
    id: 4,
    image: "assets/questions/nuvens/training/4.webp",
    question: "Nuvem média em blocos arredondados, frequentemente em camadas:",
    options: [
      "Altocumulus (AC)",
      "Nimbostratus (NS)",
      "Cirrostratus (CS)",
      "Cumulonimbus (CB)"
    ],
    correctIndex: 0,
    explanation: "Altocumulus aparece em níveis médios com aspecto de bancos/ondas."
  },
  {
    id: 5,
    image: "assets/questions/nuvens/training/5.webp",
    question: "Nuvem associada a precipitação contínua e extensa:",
    options: [
      "Nimbostratus (NS)",
      "Cumulus humilis",
      "Cirrus uncinus",
      "Stratocumulus lenticular"
    ],
    correctIndex: 0,
    explanation: "Nimbostratus é típico de chuva contínua e ampla cobertura."
  }
];

function normalizeNuvensQuestion(item, index) {
  const source = item || {};
  const parsedId = Number(source.id);
  const id = Number.isFinite(parsedId) && parsedId > 0 ? Math.floor(parsedId) : index + 1;
  const options = Array.isArray(source.options) ? source.options : [];
  const parsedCorrect = Number(source.correctIndex);

  return {
    id,
    image: String(source.image || `assets/questions/nuvens/training/${id}.webp`),
    question: String(source.question || "").trim(),
    options: [0, 1, 2, 3].map((pos) => String(options[pos] || "").trim()),
    correctIndex: Number.isFinite(parsedCorrect) ? Math.max(0, Math.min(3, Math.floor(parsedCorrect))) : 0,
    explanation: String(source.explanation || "").trim()
  };
}

const nuvensQuestions = rawNuvensQuestions.map((item, index) =>
  normalizeNuvensQuestion(item, index)
);

export { nuvensQuestions };
