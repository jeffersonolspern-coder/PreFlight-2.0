// ===============================
// BANCO DE QUESTOES - METAR/TAF (AVALIACAO)
// ===============================

const rawMetarTafEvaluationQuestions = [
  {
    id: 1,
    question: "No METAR, o grupo SCT030 BKN080 indica:",
    options: [
      "Nuvens esparsas a 3.000 pés e nublado a 8.000 pés",
      "Poucas nuvens a 3.000 pés e encoberto a 8.000 pés",
      "Nuvens fragmentadas a 300 pés e nublado a 800 pés",
      "Céu claro com nuvens altas isoladas"
    ],
    correctIndex: 0,
    explanation: "SCT é 3-4 oitavos e BKN é 5-7 oitavos de cobertura."
  },
  {
    id: 2,
    question: "Em TAF, PROB30 significa:",
    options: [
      "Probabilidade de 30% para o fenômeno indicado",
      "Fenômeno certo pelos próximos 30 minutos",
      "Mudança gradual durante 30 horas",
      "Rajada com 30 nós"
    ],
    correctIndex: 0,
    explanation: "PROB30 é usado para indicar 30% de probabilidade de ocorrência."
  },
  {
    id: 3,
    question: "No grupo de temperatura/metpoint 18/16, o valor 16 representa:",
    options: [
      "Temperatura do ponto de orvalho",
      "Temperatura máxima prevista",
      "Altitude da base de nuvens",
      "Velocidade do vento"
    ],
    correctIndex: 0,
    explanation: "A notação T/Td traz temperatura do ar e ponto de orvalho."
  },
  {
    id: 4,
    question: "No METAR, o código TSRA indica:",
    options: [
      "Trovoada com chuva",
      "Chuva com neve",
      "Pancadas isoladas sem trovoada",
      "Apenas trovoada distante"
    ],
    correctIndex: 0,
    explanation: "TS é trovoada e RA é chuva."
  },
  {
    id: 5,
    question: "No TAF, FM120600 significa:",
    options: [
      "Mudança a partir de 06:00 UTC do dia 12",
      "Mudança temporária entre 12:00 e 06:00",
      "Previsão válida por 12 horas",
      "Mudança gradual em 6 horas"
    ],
    correctIndex: 0,
    explanation: "FM indica mudança brusca a partir do horário especificado."
  },
  {
    id: 6,
    question: "Em METAR, Q1013 representa:",
    options: [
      "Ajuste altimétrico QNH de 1013 hPa",
      "Visibilidade horizontal de 1013 m",
      "Pressão ao nível de voo FL101",
      "Temperatura de 10,13 °C"
    ],
    correctIndex: 0,
    explanation: "Q seguido de 4 dígitos indica QNH em hPa."
  }
];

function normalizeMetarTafEvaluationQuestion(item, index) {
  const fallbackId = index + 1;
  const parsedId = Number(item?.id);
  const id = Number.isFinite(parsedId) && parsedId > 0 ? Math.floor(parsedId) : fallbackId;
  const options = Array.isArray(item?.options) ? item.options.map((opt) => String(opt || "")) : [];
  const parsedCorrect = Number(item?.correctIndex);

  return {
    id,
    image: String(item?.image || ("assets/questions/metar-taf/evaluation/" + id + ".webp")).trim() || ("assets/questions/metar-taf/evaluation/" + id + ".webp"),
    question: String(item?.question || "").trim(),
    options,
    correctIndex: Number.isFinite(parsedCorrect) ? Math.max(0, Math.min(3, Math.floor(parsedCorrect))) : 0,
    explanation: String(item?.explanation || "").trim()
  };
}

export const metarTafEvaluationQuestions = rawMetarTafEvaluationQuestions.map(normalizeMetarTafEvaluationQuestion);


