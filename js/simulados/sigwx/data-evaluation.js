// ===============================
// BANCO DE QUESTOES - SIGWX (AVALIACAO)
// ===============================

const rawSigwxEvaluationQuestions = [
  {
    id: 1,
    question: "Com base na SIGWX apresentada, que tipo de frente está representada?",
    options: [
      "Frente oclusa semi-estacionária à superfície",
      "Frente semi-estacionária à superfície",
      "Frente quente à superfície",
      "Frontogênese de frente semi-estacionária à superfície"
    ],
    correctIndex: 1,
    explanation: "Frente semi-estacionária à superfície, com pouco deslocamento."
  },
  {
    id: 2,
    question: "As nuvens destacadas na imagem representam qual condição meteorológica?",
    options: [
      "Cumulonimbus isolados, com base no FL020 e topo no FL210",
      "Poucos cúmulos em forma de torre, com base no FL020 e topo no FL210",
      "Poucos cúmulos em forma de torre, com base no FL210 e topo no FL020",
      "Área extensa de cúmulos em forma de torre, com topo no FL210"
    ],
    correctIndex: 1,
    explanation: "Indica poucos cúmulos com desenvolvimento vertical, base FL020 e topo FL210."
  },
  {
    id: 3,
    question: "A nuvem destacada na imagem representa qual condição meteorológica?",
    options: [
      "Cumulonimbus com base no FL035 e topo no limite da carta",
      "Cumulonimbus com base no FL035 e topo acima do limite da carta",
      "Cumulonimbus embutidos, com base no FL035 e topo acima do limite da carta",
      "Nuvens cumulus com base no FL035"
    ],
    correctIndex: 1,
    explanation: "Cumulonimbus com base no FL035 e topo acima do limite da carta."
  },
  {
    id: 4,
    question: "O símbolo destacado na carta SIGWX indica qual fenômeno meteorológico?",
    options: [
      "Nublado com cumulus e stratocumulus com base no FL020 e topo no FL070",
      "Nublado com cumulus e stratocumulus com base no FL070 e topo no FL020",
      "Encoberto com cumulus e stratocumulus com base no FL020 e topo no FL070",
      "Nublado com cumulonimbus com base FL020 e topo no FL070"
    ],
    correctIndex: 0,
    explanation: "Área nublada com cumulus e stratocumulus, base FL020 e topo FL070."
  },
  {
    id: 5,
    question: "Os símbolos destacados na carta SIGWX indicam qual fenômeno meteorológico?",
    options: [
      "Precipitação em forma de chuva e granizo",
      "Precipitação em forma de pancadas de chuva",
      "Precipitação com granizo e névoa úmida",
      "Precipitação estratiforme persistente"
    ],
    correctIndex: 0,
    explanation: "Combinação de símbolos de precipitação em forma de chuva e granizo."
  },
  {
    id: 6,
    question: "O símbolo destacado na carta SIGWX indica qual fenômeno meteorológico?",
    options: [
      "Área de precipitação na forma de chuva",
      "Área de granizo severo associada a cumulonimbus",
      "Área de chuva moderada associada a cumulonimbus",
      "Área de granizo fraco sem atividade convectiva"
    ],
    correctIndex: 0,
    explanation: "O conjunto de traços indica precipitação na forma de chuva."
  },
  {
    id: 7,
    question: "As nuvens destacadas na imagem representam qual condição meteorológica?",
    options: [
      "Cumulus congestus esparsos com base no FL015 e topo no FL060",
      "Cumulus e stratocumulus esparsas com base no FL015 e topo no FL060",
      "Cumulus e stratocumulus nublados, base FL015 e topo FL060",
      "Cumulonimbus esparsos, base FL015 e topo FL060"
    ],
    correctIndex: 1,
    explanation: "Cumulus e stratocumulus esparsas, com base FL015 e topo FL060."
  },
  {
    id: 8,
    question: "O conjunto de símbolos destacados indica qual fenômeno meteorológico?",
    options: [
      "Centro de alta pressão, 1004 hPa, deslocando-se a 15 kt e névoa úmida",
      "Centro de baixa pressão, 1004 hPa, sem deslocamento e chuva",
      "Centro de baixa pressão, 1004 hPa, deslocando-se a 15 kt, sem precipitação",
      "Centro de baixa pressão, 1004 hPa, deslocando-se a 15 kt, com chuva"
    ],
    correctIndex: 3,
    explanation: "Baixa pressão 1004 hPa com deslocamento de 15 kt e chuva."
  },
  {
    id: 9,
    question: "As nuvens destacadas na imagem representam qual condição meteorológica?",
    options: [
      "Cumulonimbus isoladas e embutidas com base no FL020 e topo indeterminado",
      "Cumulonimbus isolados com base no FL020 e topo no limite desta carta",
      "Cumulonimbus frequentes e embutidos com base no FL020 e topo indeterminado",
      "Cumulonimbus isolados e não embutidos com base no FL020 e topo indeterminado"
    ],
    correctIndex: 0,
    explanation: "Cumulonimbus isolados e embutidos, base FL020 e topo indeterminado."
  },
  {
    id: 10,
    question: "As nuvens destacadas na imagem representam qual condição meteorológica?",
    options: [
      "Nublado com stratus e stratocumulus com base no FL008 e topo no FL030",
      "Nublado com stratus e stratocumulus com base FL030 e topo no FL008",
      "Encoberto com stratus e stratocumulus com base FL008 e topo no FL030",
      "Nublado com cumulus e stratocumulus com base FL008 e topo no FL030"
    ],
    correctIndex: 0,
    explanation: "Céu nublado com Stratus e Stratocumulus, base FL008 e topo FL030."
  },
  {
    id: 11,
    question: "O símbolo destacado indica qual fenômeno meteorológico?",
    options: [
      "Turbulência leve em ar claro",
      "Turbulência associada a cumulonimbus",
      "Zona de precipitação contínua à superfície",
      "Névoa úmida com redução de visibilidade"
    ],
    correctIndex: 3,
    explanation: "Névoa úmida associada à redução da visibilidade horizontal."
  },
  {
    id: 12,
    question: "Com base na simbologia, qual a intensidade da atividade convectiva na ITCZ?",
    options: [
      "Atividade convectiva fraca na ITCZ",
      "ITCZ com atividade convectiva fraca",
      "ITCZ com atividade convectiva moderada",
      "ITCZ com atividade convectiva severa"
    ],
    correctIndex: 2,
    explanation: "Dois traços na ITCZ indicam intensidade moderada."
  },
  {
    id: 13,
    question: "Qual condição é indicada pelo conjunto de símbolos destacados?",
    options: [
      "Névoa úmida com chuva e vento forte",
      "Névoa úmida com chuva e vento fraco",
      "Névoa úmida sem precipitação e vento",
      "Névoa úmida com chuva e vento moderado"
    ],
    correctIndex: 1,
    explanation: "Névoa úmida com chuva e vento fraco à superfície."
  },
  {
    id: 14,
    question: "O símbolo destacado representa qual fenômeno?",
    options: [
      "Área de cúmulos isolados",
      "Área de tempo significativo",
      "Precipitação convectiva associada a CB",
      "Precipitação estratiforme fraca"
    ],
    correctIndex: 1,
    explanation: "Representa área de tempo significativo (Linha de Vieira)."
  },
  {
    id: 15,
    question: "O símbolo destacado representa qual fenômeno?",
    options: [
      "Convecção isolada",
      "Turbulência convectiva moderada",
      "Ondas orográficas",
      "Linha de instabilidade"
    ],
    correctIndex: 2,
    explanation: "Indica ondas orográficas associadas ao relevo."
  },
  {
    id: 16,
    question: "Qual fenômeno é indicado pelo símbolo destacado?",
    options: [
      "Montanhas parcialmente visíveis",
      "Montanhas obscurecidas",
      "Ondas orográficas em áreas montanhosas",
      "Relevo elevado com nuvens acima dos cumes"
    ],
    correctIndex: 1,
    explanation: "O símbolo indica montanhas obscurecidas."
  },
  {
    id: 17,
    question: "Qual fenômeno meteorológico está representado?",
    options: [
      "Pancada de precipitação",
      "Chuvisco contínuo",
      "Chuva estratiforme",
      "Granizo isolado"
    ],
    correctIndex: 0,
    explanation: "Pancadas de precipitação de curta duração e localizadas."
  },
  {
    id: 18,
    question: "Qual sistema está indicado na carta?",
    options: [
      "Centro de alta pressão",
      "Cavado em superfície",
      "Centro de baixa pressão com 1004 hPa",
      "Linha de convergência"
    ],
    correctIndex: 2,
    explanation: "Centro de baixa pressão com valor de 1004 hPa."
  },
  {
    id: 19,
    question: "Qual condição está representada pela simbologia?",
    options: [
      "Gelo moderado entre FL140 e FL200",
      "Turbulência severa",
      "Gelo severo entre FL140 e FL200",
      "Nível de congelamento em FL200"
    ],
    correctIndex: 2,
    explanation: "Indica gelo severo na camada FL140-FL200."
  },
  {
    id: 20,
    question: "Qual condição de cumulonimbus está indicada?",
    options: [
      "Cumulonimbus ocasional com topo em FL350",
      "Cumulonimbus frequente com topo em FL350",
      "Cumulonimbus ocasional com topo acima do limite da carta",
      "Nuvens cumuliformes extensas"
    ],
    correctIndex: 2,
    explanation: "Topo ultrapassa o limite superior da carta SIGWX."
  },
  {
    id: 21,
    question: "Qual condição de nuvens médias está representada?",
    options: [
      "Altocumulus isolados entre FL070 e FL150",
      "Altostratus quebrados com topo em FL150",
      "Altocumulus e Altostratus em céu nublado entre FL070 e FL150",
      "Nuvens médias com desenvolvimento convectivo"
    ],
    correctIndex: 2,
    explanation: "Altocumulus e Altostratus em condição de céu nublado."
  },
  {
    id: 22,
    question: "O símbolo destacado representa qual precipitação?",
    options: [
      "Chuva contínua em área extensa",
      "Pancada de precipitação",
      "Chuvisco",
      "Precipitação congelante"
    ],
    correctIndex: 2,
    explanation: "Indica chuvisco, precipitação fraca de gotículas pequenas."
  },
  {
    id: 23,
    question: "Qual condição de cumulonimbus é indicada?",
    options: [
      "Cumulonimbus frequentes com topo em FL350",
      "Cumulonimbus ocasionais com base no FL035 e topo acima do limite da carta",
      "Cumulonimbus embutidos com topo no limite da carta",
      "Cumulonimbus embutidos com topo indeterminado"
    ],
    correctIndex: 1,
    explanation: "Cumulonimbus ocasionais, base FL035 e topo acima do limite da carta."
  },
  {
    id: 24,
    question: "Qual condição de cumulonimbus está representada?",
    options: [
      "Cumulonimbus frequentes com topo em FL350",
      "Cumulonimbus ocasionais com base no FL035",
      "Cumulonimbus ocasionais com topo acima do limite da carta",
      "Cumulonimbus embutidos com topo conhecido"
    ],
    correctIndex: 2,
    explanation: "O topo ultrapassa o limite superior da carta."
  },
  {
    id: 25,
    question: "Qual descrição corresponde à simbologia apresentada?",
    options: [
      "Cumulonimbus isolados com topo no FL230",
      "Cumulus congestus em céu nublado",
      "Poucos cúmulos em forma de torre, base FL020 e topo FL230",
      "Altocumulus com desenvolvimento vertical limitado"
    ],
    correctIndex: 2,
    explanation: "Poucos cúmulos em forma de torre, base FL020 e topo FL230."
  },
  {
    id: 26,
    question: "Qual informação o símbolo transmite?",
    options: [
      "Vento forte à superfície",
      "Rajadas superiores a 08 kt",
      "Centro de pressão deslocando-se a 08 kt",
      "Cisalhamento do vento em superfície"
    ],
    correctIndex: 2,
    explanation: "Indica velocidade de deslocamento do centro de pressão."
  },
  {
    id: 27,
    question: "Qual fenômeno está indicado?",
    options: [
      "Turbulência severa em baixos níveis",
      "Turbulência moderada com topo acima do limite da carta",
      "Área de gelo moderado acima do limite da carta",
      "Zona de cisalhamento do vento"
    ],
    correctIndex: 1,
    explanation: "Turbulência moderada com topo acima do limite da carta."
  },
  {
    id: 28,
    question: "O símbolo destacado representa qual fenômeno?",
    options: [
      "Área de cúmulos isolados",
      "Área de tempo significativo",
      "Precipitação convectiva associada a CB",
      "Precipitação estratiforme fraca"
    ],
    correctIndex: 1,
    explanation: "Área de tempo significativo (Linha de Vieira)."
  },
  {
    id: 29,
    question: "Qual informação é transmitida pelo símbolo?",
    options: [
      "Gelo moderado entre FL150 e FL190",
      "Turbulência severa",
      "Gelo severo entre FL140 e FL190",
      "Nível de congelamento em FL150"
    ],
    correctIndex: 2,
    explanation: "Indica gelo severo entre FL140 e FL190."
  },
  {
    id: 30,
    question: "O símbolo apresentado indica:",
    options: [
      "Gelo moderado entre FL150 e FL190",
      "Turbulência severa",
      "Gelo severo entre FL150 e FL190",
      "Nível de congelamento em FL150"
    ],
    correctIndex: 2,
    explanation: "Indica gelo severo entre FL150 e FL190."
  },
  {
    id: 31,
    question: "Qual condição meteorológica está representada?",
    options: [
      "Área extensa de gelo significativo",
      "Zona de precipitação contínua",
      "Área de turbulência moderada",
      "Área de turbulência leve"
    ],
    correctIndex: 2,
    explanation: "Área pontilhada indica turbulência moderada."
  },
  {
    id: 32,
    question: "Na SIGWX ao lado, que tipo de frente encontramos?",
    options: [
      "Frente oclusa semi-estacionária",
      "Frente semi-estacionária",
      "Frente quente",
      "Frontogênese de frente semi-estacionária"
    ],
    correctIndex: 1,
    explanation: "Frente com pouco ou nenhum deslocamento."
  },
  {
    id: 33,
    question: "Com base na SIGWX, qual a intensidade da ITCZ?",
    options: [
      "Atividade convectiva severa",
      "ITCZ fraca",
      "Atividade convectiva moderada",
      "Atividade convectiva fraca"
    ],
    correctIndex: 0,
    explanation: "A intensidade é indicada pelo número de traços na simbologia."
  },
  {
    id: 34,
    question: "Qual fenômeno meteorológico é representado?",
    options: [
      "Gelo moderado entre FL160 e FL190",
      "Turbulência moderada entre FL150 e FL190",
      "Cisalhamento do vento",
      "Corrente de jato com núcleo em FL190"
    ],
    correctIndex: 1,
    explanation: "Zona pontilhada indica turbulência moderada."
  },
  {
    id: 35,
    question: "Qual fenômeno meteorológico é representado pelo símbolo?",
    options: [
      "Nuvem cúmulus isolada",
      "Área de tempo significativo",
      "Precipitação convectiva associada a CB",
      "Garoa"
    ],
    correctIndex: 1,
    explanation: "Área de tempo significativo associada à convecção."
  },
  {
    id: 36,
    question: "Qual sistema meteorológico está indicado?",
    options: [
      "Poucos cúmulos em forma de torre, base FL018 e topo FL180",
      "Poucos cumulonimbus com topo no FL180",
      "Torres cumuliformes frequentes",
      "Nublado com cúmulos em forma de torre"
    ],
    correctIndex: 0,
    explanation: "Poucos cúmulos em forma de torre, base FL018 e topo FL180."
  },
  {
    id: 37,
    question: "O que indica o símbolo de seta associado à nuvem?",
    options: [
      "Emissão de fumaça extensa",
      "Erupção vulcânica",
      "Montanhas obscurecidas",
      "Atividade sísmica"
    ],
    correctIndex: 1,
    explanation: "Indica erupção vulcânica e risco por cinzas na atmosfera."
  },
  {
    id: 38,
    question: "O que significa a anotação “FEW TCU 230 025”?",
    options: [
      "Poucos cúmulos em forma de torre, base FL025 e topo FL230",
      "Gelo severo entre FL025 e FL230",
      "Turbulência severa associada a TCU",
      "Nível de congelamento em FL230"
    ],
    correctIndex: 0,
    explanation: "Poucos TCU, com base FL025 e topo FL230."
  },
  {
    id: 39,
    question: "Qual fenômeno é indicado pelo símbolo em forma de vírgula?",
    options: [
      "Frontogênese",
      "Frente semi-estacionária ativa",
      "Frontólise de frente semi-estacionária",
      "Dissipação de frente fria"
    ],
    correctIndex: 2,
    explanation: "Indica enfraquecimento e dissipação do sistema frontal."
  },
  {
    id: 40,
    question: "O que representa o símbolo com valor “XXX 160”?",
    options: [
      "Turbulência severa",
      "Turbulência moderada acima do limite da carta",
      "Gelo moderado acima do limite da carta",
      "Cisalhamento do vento"
    ],
    correctIndex: 1,
    explanation: "Turbulência moderada com topo acima do limite da carta."
  },
  {
    id: 41,
    question: "O que a indicação destacada representa na carta SIGWX?",
    options: [
      "Turbulência severa",
      "Turbulência moderada acima do limite da carta",
      "Área de gelo moderado acima do limite da carta",
      "Zona de cisalhamento do vento"
    ],
    correctIndex: 1,
    explanation: "Área de turbulência moderada com topo acima do limite da carta."
  }
];

export const sigwxEvaluationQuestions = rawSigwxEvaluationQuestions.map((item, index) => {
  const id = Number(item?.id) || index + 1;
  return {
    id,
    image: `assets/questions/sigwx-evaluation/${id}.webp`,
    question: String(item?.question || "Com base na imagem, escolha a alternativa correta."),
    options: Array.isArray(item?.options) ? item.options.map((o) => String(o || "")) : [],
    correctIndex: Number.isInteger(item?.correctIndex) ? item.correctIndex : 0,
    explanation: String(item?.explanation || "")
  };
});

