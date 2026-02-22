// ===============================
// BANCO DE QUESTOES - SINAIS LUMINOSOS (AVALIACAO)
// ===============================

const rawSinaisLuminososEvaluationQuestions = [
  {
    id: 1,
    image: "assets/questions/sinais-luminosos/evaluation/1.webp",
    question: "Aeronave em voo recebe luz verde fixa da torre. Qual a acao correta?",
    options: ["Arremeter imediatamente", "Prosseguir para pouso autorizado", "Manter circuito sem pousar", "Pousar apenas com luz branca"],
    correctIndex: 1,
    explanation: "Luz verde fixa para aeronave em voo equivale a pouso autorizado."
  },
  {
    id: 2,
    image: "assets/questions/sinais-luminosos/evaluation/2.webp",
    question: "Aeronave no solo recebe luz vermelha fixa. Isso significa:",
    options: ["Taxi liberado", "Pare", "Cruze a pista", "Decole sem demora"],
    correctIndex: 1,
    explanation: "No solo, vermelha fixa determina parada."
  },
  {
    id: 3,
    image: "assets/questions/sinais-luminosos/evaluation/3.webp",
    question: "Aeronave no solo recebe luz branca intermitente. Conduta correta:",
    options: ["Retornar ao ponto de partida no aerodromo", "Aguardar decolagem", "Entrar na pista ativa", "Prosseguir ate cabeceira"],
    correctIndex: 0,
    explanation: "Branca intermitente em solo indica retorno ao ponto de partida."
  },
  {
    id: 4,
    image: "assets/questions/sinais-luminosos/evaluation/4.webp",
    question: "Aeronave em voo recebe luz vermelha intermitente. Significa:",
    options: ["Pouso autorizado", "Retorne para pouso", "Nao pouse, aerodromo inseguro", "Taxi liberado apos pouso"],
    correctIndex: 2,
    explanation: "Vermelha intermitente em voo indica que nao deve pousar."
  },
  {
    id: 5,
    image: "assets/questions/sinais-luminosos/evaluation/5.webp",
    question: "Aeronave no solo recebe luz verde intermitente. Qual o comando?",
    options: ["Pare e aguarde", "Autorizado a taxiar", "Autorizado a decolar", "Liberado para pouso"],
    correctIndex: 1,
    explanation: "Verde intermitente em solo libera taxi."
  },
  {
    id: 6,
    image: "assets/questions/sinais-luminosos/evaluation/6.webp",
    question: "Sinal pirotecnico vermelho observado em voo indica:",
    options: ["Continuar aproximacao normal", "Nao prosseguir", "Iniciar taxi", "Pouso imediato autorizado"],
    correctIndex: 1,
    explanation: "Sinal vermelho indica perigo e instrucao para nao prosseguir."
  },
  {
    id: 7,
    image: "assets/questions/sinais-luminosos/evaluation/7.webp",
    question: "Luz verde intermitente para aeronave em voo indica:",
    options: ["Retorne para pousar", "Pouso proibido", "Apenas manter altitude", "Taxi autorizado"],
    correctIndex: 0,
    explanation: "Para aeronave em voo, verde intermitente significa retorno para pouso."
  },
  {
    id: 8,
    image: "assets/questions/sinais-luminosos/evaluation/8.webp",
    question: "No solo, luz vermelha intermitente da torre significa:",
    options: ["Pare definitivamente", "Saia da pista em uso", "Liberado para decolagem", "Retorne para pouso"],
    correctIndex: 1,
    explanation: "Vermelha intermitente em solo orienta abandonar a pista em uso."
  }
];

function normalizeSinaisLuminososEvaluationQuestion(item, index) {
  const fallbackId = index + 1;
  const parsedId = Number(item?.id);
  const id = Number.isFinite(parsedId) && parsedId > 0 ? Math.floor(parsedId) : fallbackId;
  const options = Array.isArray(item?.options) ? item.options.map((opt) => String(opt || "")) : [];
  const parsedCorrect = Number(item?.correctIndex);

  return {
    id,
    image:
      String(item?.image || `assets/questions/sinais-luminosos/evaluation/${id}.webp`).trim() ||
      `assets/questions/sinais-luminosos/evaluation/${id}.webp`,
    question: String(item?.question || "").trim(),
    options,
    correctIndex: Number.isFinite(parsedCorrect) ? Math.max(0, Math.min(3, Math.floor(parsedCorrect))) : 0,
    explanation: String(item?.explanation || "").trim()
  };
}

export const sinaisLuminososEvaluationQuestions = rawSinaisLuminososEvaluationQuestions.map(
  normalizeSinaisLuminososEvaluationQuestion
);
