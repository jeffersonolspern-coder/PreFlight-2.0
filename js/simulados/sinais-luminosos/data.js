// ===============================
// BANCO DE QUESTOES - SINAIS LUMINOSOS (TREINO)
// ===============================

const rawSinaisLuminososQuestions = [
  {
    id: 1,
    image: "assets/questions/sinais-luminosos/training/1.webp",
    question: "No solo, uma luz verde fixa da torre para aeronave em taxi significa:",
    options: ["Autorizado a decolar", "Autorizado a prosseguir", "Pare imediatamente", "Retorne ao patio"],
    correctIndex: 1,
    explanation: "Luz verde fixa em solo indica autorizado a prosseguir."
  },
  {
    id: 2,
    image: "assets/questions/sinais-luminosos/training/2.webp",
    question: "Uma luz vermelha fixa da torre para aeronave no solo indica:",
    options: ["Liberado para cruzar pista", "Autorizado a taxiar", "Pare", "Decolagem imediata"],
    correctIndex: 2,
    explanation: "Vermelha fixa em solo indica parada."
  },
  {
    id: 3,
    image: "assets/questions/sinais-luminosos/training/3.webp",
    question: "Luz verde intermitente para aeronave no solo significa:",
    options: ["Taxi autorizado", "Retorne para pouso", "Liberado para decolar", "Ceda passagem"],
    correctIndex: 0,
    explanation: "Verde intermitente em solo indica autorizado a taxiar."
  },
  {
    id: 4,
    image: "assets/questions/sinais-luminosos/training/4.webp",
    question: "Luz vermelha intermitente para aeronave no solo significa:",
    options: ["Taxi para estacionamento", "Saia da pista em uso", "Mantenha posicao", "Prossiga para espera"],
    correctIndex: 1,
    explanation: "Vermelha intermitente em solo orienta sair da pista em uso."
  },
  {
    id: 5,
    image: "assets/questions/sinais-luminosos/training/5.webp",
    question: "Luz branca intermitente para aeronave no solo significa:",
    options: ["Regresse ao ponto de partida no aerodromo", "Liberado para decolar", "Mantenha circuito", "Continue taxiando"],
    correctIndex: 0,
    explanation: "Branca intermitente em solo orienta retorno ao ponto de partida."
  },
  {
    id: 6,
    image: "assets/questions/sinais-luminosos/training/6.webp",
    question: "No ar, luz verde fixa da torre indica:",
    options: ["Autorizado para pouso", "Arremeta", "Aguarde instrucoes", "Nao pouse"],
    correctIndex: 0,
    explanation: "Verde fixa para aeronave em voo indica autorizado para pouso."
  },
  {
    id: 7,
    image: "assets/questions/sinais-luminosos/training/7.webp",
    question: "No ar, luz vermelha fixa da torre indica:",
    options: ["Autorizado para pouso", "Ceda passagem e continue circuito", "Aterrissagem proibida", "Taxi para estacionamento"],
    correctIndex: 2,
    explanation: "Vermelha fixa em voo significa nao pouse, aerodromo inseguro."
  },
  {
    id: 8,
    image: "assets/questions/sinais-luminosos/training/8.webp",
    question: "No ar, luz verde intermitente indica:",
    options: ["Retorne para pousar", "Autorizado para decolagem", "Pouse e libere pista", "Mantenha espera no solo"],
    correctIndex: 0,
    explanation: "Verde intermitente em voo significa retorne para pousar."
  },
  {
    id: 9,
    image: "assets/questions/sinais-luminosos/training/9.webp",
    question: "No ar, luz vermelha intermitente da torre significa:",
    options: ["Nao pouse, aerodromo inseguro", "Retorne para pousar", "Autorizado para pouso", "Prossiga para cruzar pista"],
    correctIndex: 0,
    explanation: "Vermelha intermitente em voo indica nao pousar."
  },
  {
    id: 10,
    image: "assets/questions/sinais-luminosos/training/10.webp",
    question: "Sinal pirotecnico vermelho lançado pela torre em voo significa:",
    options: ["Pouse imediatamente", "Nao prossiga, mantenha-se afastado", "Autorizado para aproximacao final", "Apenas atencao sem restricao"],
    correctIndex: 1,
    explanation: "Foguete/sinal vermelho indica perigo e instrui nao prosseguir."
  }
];

function normalizeSinaisLuminososQuestion(item, index) {
  const fallbackId = index + 1;
  const parsedId = Number(item?.id);
  const id = Number.isFinite(parsedId) && parsedId > 0 ? Math.floor(parsedId) : fallbackId;
  const options = Array.isArray(item?.options) ? item.options.map((opt) => String(opt || "")) : [];
  const parsedCorrect = Number(item?.correctIndex);

  return {
    id,
    image:
      String(item?.image || `assets/questions/sinais-luminosos/training/${id}.webp`).trim() ||
      `assets/questions/sinais-luminosos/training/${id}.webp`,
    question: String(item?.question || "").trim(),
    options,
    correctIndex: Number.isFinite(parsedCorrect) ? Math.max(0, Math.min(3, Math.floor(parsedCorrect))) : 0,
    explanation: String(item?.explanation || "").trim()
  };
}

export const sinaisLuminososQuestions = rawSinaisLuminososQuestions.map(normalizeSinaisLuminososQuestion);
