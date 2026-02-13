// ===============================
// BANCO DE QUESTOES - METAR/TAF (TREINO)
// ===============================

const rawMetarTafQuestions = [
  {
    id: 1,
    question: "No METAR, o código FEW020 indica qual condição de nuvens?",
    options: [
      "Poucas nuvens com base em 2.000 pés",
      "Céu encoberto em 2.000 pés",
      "Nuvens fragmentadas em 200 pés",
      "Ausência de nuvens abaixo de 2.000 pés"
    ],
    correctIndex: 0,
    explanation: "FEW indica 1 a 2 oitavos de cobertura, e 020 representa 2.000 pés AGL."
  },
  {
    id: 2,
    question: "Em um METAR, o grupo 9999 significa:",
    options: [
      "Visibilidade igual ou superior a 10 km",
      "Visibilidade exatamente 9.999 metros",
      "Visibilidade variável entre 9 e 10 km",
      "Visibilidade reduzida por nevoeiro"
    ],
    correctIndex: 0,
    explanation: "9999 é usado para visibilidade horizontal de 10 km ou mais."
  },
  {
    id: 3,
    question: "No TAF, a sigla TEMPO indica:",
    options: [
      "Condição temporária esperada por períodos curtos",
      "Mudança permanente para o restante do período",
      "Condição provável, porém sem horário definido",
      "Início imediato de condição severa"
    ],
    correctIndex: 0,
    explanation: "TEMPO representa flutuações temporárias, não contínuas."
  },
  {
    id: 4,
    question: "O grupo BECMG em um TAF representa:",
    options: [
      "Mudança gradual para novas condições",
      "Condição temporária com retorno rápido",
      "Probabilidade de 30% de ocorrência",
      "Correção do boletim em vigor"
    ],
    correctIndex: 0,
    explanation: "BECMG indica transição gradual dentro de um intervalo de tempo."
  },
  {
    id: 5,
    question: "No METAR, o código RA significa:",
    options: [
      "Chuva",
      "Chuvisco",
      "Granizo",
      "Neve"
    ],
    correctIndex: 0,
    explanation: "RA é o descritor de chuva (Rain)."
  },
  {
    id: 6,
    question: "No grupo de vento 24012KT, o que representa o número 12?",
    options: [
      "Velocidade do vento em nós",
      "Rajada máxima em nós",
      "Direção verdadeira em dezenas",
      "Visibilidade mínima em km"
    ],
    correctIndex: 0,
    explanation: "No formato dddffKT, ff é a velocidade média em nós."
  },
  {
    id: 7,
    question: "Em TAF/METAR, o código BR indica:",
    options: [
      "Névoa úmida (mist)",
      "Névoa seca",
      "Fumaça",
      "Chuva fraca"
    ],
    correctIndex: 0,
    explanation: "BR corresponde a mist, reduzindo visibilidade de forma moderada."
  },
  {
    id: 8,
    question: "No METAR, CAVOK significa:",
    options: [
      "Visibilidade >= 10 km, sem fenômeno significativo e sem nuvens abaixo de 5.000 pés ou MSA",
      "Condição de teto e visibilidade mínimos para IFR",
      "Condição com vento calmo e sem nuvens",
      "Condição temporária de boa visibilidade"
    ],
    correctIndex: 0,
    explanation: "CAVOK reúne critérios de visibilidade, nuvens e ausência de tempo significativo."
  }
];

function normalizeMetarTafQuestion(item, index) {
  const fallbackId = index + 1;
  const parsedId = Number(item?.id);
  const id = Number.isFinite(parsedId) && parsedId > 0 ? Math.floor(parsedId) : fallbackId;
  const options = Array.isArray(item?.options) ? item.options.map((opt) => String(opt || "")) : [];
  const parsedCorrect = Number(item?.correctIndex);

  return {
    id,
    image: String(item?.image || ("assets/questions/metar-taf/training/" + id + ".webp")).trim() || ("assets/questions/metar-taf/training/" + id + ".webp"),
    question: String(item?.question || "").trim(),
    options,
    correctIndex: Number.isFinite(parsedCorrect) ? Math.max(0, Math.min(3, Math.floor(parsedCorrect))) : 0,
    explanation: String(item?.explanation || "").trim()
  };
}

export const metarTafQuestions = rawMetarTafQuestions.map(normalizeMetarTafQuestion);


