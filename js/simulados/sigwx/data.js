// ===============================
// BANCO DE QUESTOES - SIGWX
// ===============================

const rawSigwxQuestions = [
 {
  id: 1,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/1.png",
  opcoes: [
    "Nevoeiro raso localizado",
    "Névoa úmida em área extensa",
    "Camada extensa de nuvens baixas",
    "Precipitação contínua moderada"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo representa névoa úmida distribuída de forma extensa."
},
{
  id: 2,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/2.png",
  opcoes: [
    "Precipitação contínua moderada",
    "Granizo",
    "Precipitação congelante",
    "Neve fraca em área isolada"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica precipitação congelante, que congela ao tocar superfícies com temperatura abaixo de zero."
},
{
  id: 3,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/3.png",
  opcoes: [
    "Tempestade de areia ou poeira",
    "Gelo severo",
    "Erupção vulcânica",
    "Pancada"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "O símbolo indica presença de cinzas vulcânicas na atmosfera, representando risco significativo à aviação."
},
{
  id: 4,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/4.png",
  opcoes: [
    "Frente oclusa",
    "Frente fria",
    "Linha de instabilidade",
    "Frente quente"
  ],
  correta: 0,
  assunto: "SIGWX",
  explicacao: "Representa uma frente oclusa, formada quando uma frente fria alcança uma frente quente."
},
{
  id: 5,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/5.png",
  opcoes: [
    "Turbulência moderada a severa",
    "Granizo",
    "Precipitação congelante",
    "Atividade convectiva isolada"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo indica ocorrência de granizo, geralmente associado a nuvens convectivas intensas."
},
{
  id: 6,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/6.png",
  opcoes: [
    "Linha de instabilidade",
    "Zona de convergência intertropical (ITCZ)",
    "Frente quase-estacionária",
    "Corrente de jato em baixos níveis"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "Representa a Zona de Convergência Intertropical (ITCZ), área onde os ventos convergem, favorecendo intensa atividade convectiva."
},
{
  id: 7,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/7.png",
  opcoes: [
    "Área de turbulência severa",
    "Linha de instabilidade ativa",
    "Demarcação de área de tempo significativo (Linha de Vieira)",
    "Zona de convergência em superfície"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica a Linha de Vieira, utilizada para delimitar áreas de tempo significativo em atividade."
},
{
  id: 8,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/8.png",
  opcoes: [
    "Pancadas de precipitação",
    "Granizo",
    "Chuva contínua",
    "Precipitação congelante"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "O símbolo representa chuva contínua, associada a precipitação persistente e geralmente estratiforme."
},
{
  id: 9,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/9.png",
  opcoes: [
    "Área de tempo significativo",
    "Delimitação de área de turbulência",
    "Zona de convergência em superfície",
    "Linha de instabilidade"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "Indica uma área onde há previsão de turbulência significativa, relevante para o planejamento do voo."
},
{
  id: 10,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/10.png",
  opcoes: [
    "Frente fria",
    "Frente oclusa",
    "Frente semi-estacionária",
    "Frente quente"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Representa uma frente semi-estacionária, caracterizada por baixo deslocamento do sistema frontal."
},
{
  id: 11,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/11.png",
  opcoes: [
    "Cinzas vulcânicas",
    "Tempestade de areia ou poeira",
    "Névoa seca em área extensa",
    "Chuva fraca contínua"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo indica tempestade de areia ou poeira, fenômeno que reduz severamente a visibilidade."
},
{
  id: 12,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/12.png",
  opcoes: [
    "Chuva contínua",
    "Granizo",
    "Pancada",
    "Precipitação congelante"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Representa pancada de precipitação, caracterizada por início e término súbitos."
},
{
  id: 13,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/13.png",
  opcoes: [
    "Centro de alta pressão",
    "Ciclone tropical",
    "Zona de convergência intertropical",
    "Área de baixa pressão alongada"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo indica um ciclone tropical, sistema de baixa pressão com forte circulação e potencial severo."
},
{
  id: 14,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/14.png",
  opcoes: [
    "Altura significativa das ondas",
    "Corrente oceânica superficial",
    "Estado do mar",
    "Zona de ressaca"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Representa o estado do mar, utilizado em cartas indicando a altura em metros de ondas."
},
{
  id: 15,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/15.png",
  opcoes: [
    "Turbulência leve",
    "Cisalhamento do vento",
    "Turbulência moderada",
    "Turbulência severa"
  ],
  correta: 3,
  assunto: "SIGWX",
  explicacao: "Indica turbulência severa, oferecendo risco significativo à segurança do voo."
},
{
  id: 16,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/16.png",
  opcoes: [
    "Centro de baixa pressão",
    "Centro de alta pressão",
    "Ciclone tropical",
    "Cavado em superfície"
  ],
  correta: 0,
  assunto: "SIGWX",
  explicacao: "O símbolo representa um centro de baixa pressão, associado à convergência do ar e maior instabilidade atmosférica."
},
{
  id: 17,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/17.png",
  opcoes: [
    "Montanhas obscurecidas",
    "Área de turbulência orográfica",
    "Ondas orográficas",
    "Nevoeiro em área extensa"
  ],
  correta: 0,
  assunto: "SIGWX",
  explicacao: "Indica montanhas obscurecidas por nuvens, névoa ou precipitação, afetando a navegação visual."
},
{
  id: 18,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/18.png",
  opcoes: [
    "Névoa úmida em área extensa",
    "Nevoeiro em área extensa",
    "Tempestade de areia ou poeira",
    "Neve levantada pelo vento"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo representa nevoeiro em área extensa, caracterizado por visibilidade muito reduzida."
},
{
  id: 19,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/19.png",
  opcoes: [
    "Tempestade de areia ou poeira",
    "Cinzas vulcânicas",
    "Névoa forte de areia ou poeira",
    "Nevoeiro em área extensa"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica névoa forte de areia ou poeira, comum em regiões áridas e com impacto severo na visibilidade."
},
{
  id: 20,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/20.png",
  opcoes: [
    "Altura mínima da tropopausa",
    "Nível de congelamento",
    "Isoterma de 0°C em superfície",
    "Camada de icing severo"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "Representa o nível de congelamento, altitude onde a temperatura do ar atinge 0°C."
},
{
  id: 21,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/21.png",
  opcoes: [
    "Zona de convergência intertropical",
    "Linha de instabilidade",
    "Demarcação de área de tempo significativo",
    "Frente fria"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo representa uma linha de instabilidade, associada a intensa atividade convectiva e condições adversas."
},
{
  id: 22,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/22.png",
  opcoes: [
    "Frontogênese de frente quente",
    "Frontólise de frente fria",
    "Frontólise de frente quente",
    "Frente quase estacionária"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica frontólise de frente quente, caracterizando o enfraquecimento ou dissipação do sistema frontal."
},
{
  id: 23,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/23.png",
  opcoes: [
    "Turbulência severa em altitude",
    "Ondas orográficas",
    "Área de cisalhamento do vento",
    "Montanhas obscurecidas"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "Representa ondas orográficas, formadas quando o fluxo de ar interage com cadeias montanhosas."
},
{
  id: 24,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/24.png",
  opcoes: [
    "Frontólise de frente quente",
    "Frente quente estacionária",
    "Frontogênese de frente quente",
    "Frente oclusa em formação"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica frontogênese de frente quente, processo de intensificação de uma frente quente."
},
{
  id: 25,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/25.png",
  opcoes: [
    "Altura máxima da tropopausa",
    "Nível de congelamento",
    "Altura mínima da tropopausa",
    "Corrente de jato"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "O símbolo representa a altura mínima da tropopausa, informação relevante para planejamento de voo em altitude."
},
{
  id: 26,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/26.png",
  opcoes: [
    "Neve fraca contínua",
    "Nevoeiro congelante",
    "Neve levantada pelo vento em área extensa",
    "Granizo associado a CB"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica neve levantada pelo vento, reduzindo significativamente a visibilidade horizontal."
},
{
  id: 27,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/Frotogenese-de-frente-Fria.png",
  opcoes: [
    "Frontogênese de frente fria",
    "Frontólise de frente fria",
    "Frente fria em superfície",
    "Linha de instabilidade"
  ],
  correta: 0,
  assunto: "SIGWX",
  explicacao: "Representa frontogênese de frente fria, processo de formação ou intensificação de uma frente fria."
},
{
  id: 28,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/28.png",
  opcoes: [
    "Gelo severo",
    "Gelo moderado em aeronaves",
    "Granizo",
    "Neve levantada pelo vento"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo indica ocorrência de gelo moderado em aeronaves, exigindo atenção operacional."
},
{
  id: 29,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/29.png",
  opcoes: [
    "Nevoeiro",
    "Fumaça",
    "Névoa seca",
    "Tempestade de areia"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "Representa fumaça na atmosfera, podendo reduzir a visibilidade e afetar operações VFR."
},
{
  id: 30,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/30.png",
  opcoes: [
    "Cinzas vulcânicas",
    "Contaminação química",
    "Materiais radioativos na atmosfera",
    "Nuvem tóxica industrial"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica presença de materiais radioativos na atmosfera, situação de alto risco para a aviação."
},
{
  id: 31,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/31.png",
  opcoes: [
    "Frente fria em dissipação",
    "Frontólise de frente fria",
    "Frente semi-estacionária",
    "Frente oclusa"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "Indica frontólise de frente fria, processo de enfraquecimento e dissipação do sistema frontal."
},
{
  id: 32,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/32.png",
  opcoes: [
    "Centro de baixa pressão",
    "Centro de alta pressão",
    "Posição dos centros de pressão",
    "Isóbaras"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Representa a posição dos centros de pressão, normalmente indicada em hPa nas cartas meteorológicas."
},
{
  id: 33,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/33.png",
  opcoes: [
    "Chuva contínua",
    "Pancada de chuva",
    "Chuvisco",
    "Precipitação congelante"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "O símbolo indica chuvisco, precipitação fraca composta por gotículas muito pequenas."
},
{
  id: 34,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/34.png",
  opcoes: [
    "Fumaça",
    "Névoa úmida",
    "Nevoeiro",
    "Névoa seca em área extensa"
  ],
  correta: 3,
  assunto: "SIGWX",
  explicacao: "Representa névoa seca em área extensa, geralmente associada a poeira, fumaça ou partículas em suspensão."
},
{
  id: 35,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/35.png",
  opcoes: [
    "Frente semi-estacionária",
    "Frontólise de frente semi-estacionária",
    "Frontogênese de frente semi-estacionária",
    "Frente quente"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica frontogênese de frente semi-estacionária, processo de intensificação desse tipo de frente."
},
{
  id: 36,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/36.png",
  opcoes: [
    "Turbulência leve",
    "Turbulência moderada",
    "Turbulência severa",
    "Ondas orográficas"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo representa turbulência moderada, podendo causar desconforto e variações na atitude da aeronave."
},
{
  id: 37,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/37.png",
  opcoes: [
    "Vento forte à superfície em área extensa",
    "Turbulência moderada",
    "Corrente de jato",
    "Rajadas associadas a CB"
  ],
  correta: 0,
  assunto: "SIGWX",
  explicacao: "Indica vento forte à superfície em área extensa, relevante para operações de pouso e decolagem."
},
{
  id: 38,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/38.png",
  opcoes: [
    "Altura mínima da tropopausa",
    "Nível da tropopausa",
    "Isoterma de congelamento",
    "Topo de CB"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "Representa o nível da tropopausa, limite entre a troposfera e a estratosfera."
},
{
  id: 39,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/39.png",
  opcoes: [
    "Temperatura da superfície do mar",
    "Estado do mar",
    "Ondulação significativa",
    "Zona de convergência"
  ],
  correta: 0,
  assunto: "SIGWX",
  explicacao: "O símbolo indica a temperatura da superfície do mar, dado importante para previsões meteorológicas."
},
{
  id: 40,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/40.png",
  opcoes: [
    "Centro de baixa pressão",
    "Centro de alta pressão",
    "Ciclone tropical",
    "Vórtice em altos níveis"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "Representa um centro de alta pressão, geralmente associado a tempo mais estável."
},
{
  id: 41,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/41.png",
  opcoes: [
    "Linha de instabilidade",
    "Frente fria",
    "Linha de convergência",
    "Zona de turbulência"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "O símbolo representa uma linha de convergência, onde há encontro de massas de ar favorecendo instabilidade."
},
{
  id: 42,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/42.png",
  opcoes: [
    "Gelo leve",
    "Gelo moderado",
    "Gelo severo",
    "Neve levantada pelo vento"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Indica ocorrência de gelo severo, condição extremamente perigosa para a aeronave."
},
{
  id: 43,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/43.png",
  opcoes: [
    "Frente fria",
    "Frente quente",
    "Frente oclusa",
    "Frontólise de frente semi-estacionária"
  ],
  correta: 3,
  assunto: "SIGWX",
  explicacao: "Representa a frontólise de uma frente semi-estacionária, indicando o enfraquecimento do sistema."
},
{
  id: 44,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/44.png",
  opcoes: [
    "Granizo",
    "Neve",
    "Neve levantada pelo vento",
    "Precipitação congelante"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo indica ocorrência de neve, reduzindo visibilidade e afetando a performance da aeronave."
},
{
    id: 45,
    pergunta: "Qual símbolo SIGWX está representado na imagem?",
    imagem: "../imagens/sigwx/45.png",
    opcoes: [
      "Linha de convergência",
      "Frente quente",
      "Frente fria",
      "Corrente de jato"
    ],
    correta: 2,
    assunto: "SIGWX",
    explicacao: "O símbolo representa uma frente fria, caracterizada pela passagem de uma massa de ar frio deslocando o ar quente."
  },
  {
    id: 46,
    pergunta: "Qual símbolo SIGWX está representado na imagem?",
    imagem: "../imagens/sigwx/46.png",
    opcoes: [
      "Previsão de longo prazo",
      "Altura máxima da tropopausa",
      "Carta de vento",
      "Imagem de satélite"
    ],
    correta: 1,
    assunto: "SIGWX",
    explicacao: "Indica a altura máxima da tropopausa, importante para planejamento de voo em altos níveis."
  },
  {
    id: 47,
    pergunta: "Qual símbolo SIGWX está representado na imagem?",
    imagem: "../imagens/sigwx/47.png",
    opcoes: [
      "Frente fria",
      "Linha de instabilidade",
      "Frente Oclusão",
      "Frente quente"
    ],
    correta: 3,
    assunto: "SIGWX",
    explicacao: "O símbolo indica uma frente quente, onde o ar quente avança sobre o ar frio."
  },
  {
    id: 48,
    pergunta: "Qual símbolo SIGWX está representado na imagem?",
    imagem: "../imagens/sigwx/48.png",
    opcoes: [
      "Corrente de Jato",
      "Direção do vento",
      "Corrente de Jato com 65 Kt",
      "Corrente de jato com 155 Kt"
    ],
    correta: 2,
    assunto: "SIGWX",
    explicacao: "O símbolo indica uma Corrente de Jato de 65Kt, a bandeira representa 50 Kt, o traço longo representa 10 Kt e o traço curto representa 5 Kt."
  },
  {
  id: 49,
  pergunta: "Qual símbolo SIGWX está representado na imagem?",
  imagem: "../imagens/sigwx/49.png",
  opcoes: [
    "Corrente de Jato com 50 Kt",
    "Corrente de Jato com 65 Kt",
    "Corrente de Jato com 100 Kt",
    "Direção do vento em altitude"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "O símbolo indica uma Corrente de Jato de 100Kt. Cada bandeira representa 50 Kt, o traço longo 10 Kt e o traço curto 5 Kt."
},
{
  id: 50,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/50.png",
  opcoes: [
    "Altostratus",
    "Altocumulus",
    "Cirrocumulus",
    "Stratocumulus"
  ],
  correta: 1,
  assunto: "Nuvens",
  explicacao: "Altocumulus são nuvens médias, geralmente em forma de blocos ou ondulações, associadas a instabilidade em níveis médios."
},
{
  id: 51,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/51.png",
  opcoes: [
    "Altostratus",
    "Cirrostratus",
    "Stratus",
    "Nimbostratus"
  ],
  correta: 0,
  assunto: "Nuvens",
  explicacao: "Altostratus são nuvens médias, extensas e em forma de véu, frequentemente associadas à aproximação de sistemas frontais."
},
{
  id: 52,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/52.png",
  opcoes: [
    "Altocumulus",
    "Cirrostratus",
    "Cirrocumulus",
    "Cumulus"
  ],
  correta: 2,
  assunto: "Nuvens",
  explicacao: "Cirrocumulus são nuvens altas, formadas por pequenos grânulos, indicando instabilidade em grandes altitudes."
},
{
  id: 53,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/53.png",
  opcoes: [
    "Cirrus",
    "Altostratus",
    "Cirrostratus",
    "Stratus"
  ],
  correta: 2,
  assunto: "Nuvens",
  explicacao: "Cirrostratus são nuvens altas em forma de véu, frequentemente associadas a halos solares ou lunares."
},
{
  id: 54,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/54.png",
  opcoes: [
    "Cirrus",
    "Cirrostratus",
    "Altocumulus",
    "Stratus"
  ],
  correta: 0,
  assunto: "Nuvens",
  explicacao: "Cirrus são nuvens altas, finas e fibrosas, normalmente indicando bom tempo ou mudança futura no tempo."
},
{
  id: 55,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/55.png",
  opcoes: [
    "Cumulus",
    "Nimbostratus",
    "Cumulonimbus",
    "Altocumulus"
  ],
  correta: 2,
  assunto: "Nuvens",
  explicacao: "Cumulonimbus são nuvens de grande desenvolvimento vertical, associadas a tempestades, turbulência severa e gelo."
},
{
  id: 56,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/56.png",
  opcoes: [
    "Stratocumulus",
    "Cumulonimbus",
    "Cumulus",
    "Altocumulus"
  ],
  correta: 2,
  assunto: "Nuvens",
  explicacao: "Cumulus são nuvens de desenvolvimento vertical limitado, geralmente associadas a bom tempo."
},
{
  id: 57,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/57.png",
  opcoes: [
    "Cumulus humilis",
    "Cumulus congestus",
    "Cumulonimbus",
    "Altocumulus"
  ],
  correta: 1,
  assunto: "Nuvens",
  explicacao: "Cumulus congestus apresentam forte desenvolvimento vertical e podem evoluir para cumulonimbus."
},
{
  id: 58,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/58.png",
  opcoes: [
    "Cumulonimbus embutido",
    "Nimbostratus",
    "Altostratus",
    "Stratocumulus"
  ],
  correta: 0,
  assunto: "Nuvens",
  explicacao: "Cumulonimbus embutido ocorre quando a nuvem está envolta por outras camadas, dificultando sua identificação visual e aumentando o risco operacional."
},
{
  id: 59,
  pergunta: "O que significa a sigla OVC apresentada na imagem?",
  imagem: "../imagens/sigwx/59.png",
  opcoes: [
    "Nuvens isoladas",
    "Céu encoberto",
    "Nuvens dispersas",
    "Cobertura ocasional"
  ],
  correta: 1,
  assunto: "Nuvens",
  explicacao: "OVC (Overcast) indica céu totalmente encoberto, com cobertura de nuvens de 8 oitavos."
},
{
  id: 60,
  pergunta: "O que significa a sigla SCT apresentada na imagem?",
  imagem: "../imagens/sigwx/60.png",
  opcoes: [
    "Céu encoberto",
    "Nuvens frequentes",
    "Nuvens esparsas",
    "Nuvens isoladas"
  ],
  correta: 2,
  assunto: "Nuvens",
  explicacao: "SCT (Scattered) indica nuvens esparsas, com cobertura entre 3 e 4 oitavos."
},
{
  id: 61,
  pergunta: "O que a simbologia apresentada indica?",
  imagem: "../imagens/sigwx/61.png",
  opcoes: [
    "Corrente de jato a FL310",
    "Vento forte em superfície",
    "Turbulência severa em FL310",
    "Nível máximo de nuvens"
  ],
  correta: 0,
  assunto: "SIGWX",
  explicacao: "O símbolo indica uma Corrente de Jato localizada ao redor do FL310."
},
{
  id: 62,
  pergunta: "O que significa a indicação FREQUENTE apresentada na imagem?",
  imagem: "../imagens/sigwx/62.png",
  opcoes: [
    "Fenômeno isolado",
    "Fenômeno contínuo",
    "Fenômeno frequente na área",
    "Fenômeno ocasional"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Frequente indica que o fenômeno ocorre repetidamente em grande parte da área analisada."
},
{
  id: 63,
  pergunta: "O que significa a indicação ISOLADO apresentada na imagem?",
  imagem: "../imagens/sigwx/63.png",
  opcoes: [
    "Fenômeno contínuo",
    "Fenômeno esparso",
    "Fenômeno isolado em pontos específicos",
    "Fenômeno frequente"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Isolado indica que o fenômeno ocorre de forma pontual e localizada."
},
{
  id: 64,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/64.png",
  opcoes: [
    "Stratus",
    "Altostratus",
    "Nimbostratus",
    "Stratocumulus"
  ],
  correta: 2,
  assunto: "Nuvens",
  explicacao: "Nimbostratus são nuvens extensas associadas a precipitação contínua e baixa visibilidade."
},
{
  id: 65,
  pergunta: "O que a simbologia apresentada indica?",
  imagem: "../imagens/sigwx/65.png",
  opcoes: [
    "Altura máxima de nuvens",
    "Nível e velocidade da Corrente de Jato",
    "Direção do vento em superfície",
    "Zona de turbulência"
  ],
  correta: 1,
  assunto: "SIGWX",
  explicacao: "O símbolo indica o nível de voo e a velocidade associada à Corrente de Jato."
},
{
  id: 66,
  pergunta: "O que significa a sigla BKN apresentada na imagem?",
  imagem: "../imagens/sigwx/66.png",
  opcoes: [
    "Céu encoberto",
    "Nuvens isoladas",
    "Céu nublado",
    "Nuvens esparsas"
  ],
  correta: 2,
  assunto: "Nuvens",
  explicacao: "BKN (Broken) indica céu nublado, com cobertura entre 5 e 7 oitavos."
},
{
  id: 67,
  pergunta: "O que significa a indicação OCASIONAL apresentada na imagem?",
  imagem: "../imagens/sigwx/67.png",
  opcoes: [
    "Fenômeno frequente",
    "Fenômeno contínuo",
    "Fenômeno isolado",
    "Fenômeno que ocorre de forma intermitente"
  ],
  correta: 3,
  assunto: "SIGWX",
  explicacao: "Ocasional indica que o fenômeno ocorre de forma intermitente, não contínua."
},
{
  id: 68,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/68.png",
  opcoes: [
    "Cumulus",
    "Stratus",
    "Stratocumulus",
    "Altocumulus"
  ],
  correta: 2,
  assunto: "Nuvens",
  explicacao: "Stratocumulus são nuvens baixas, em camadas com elementos arredondados, geralmente associadas a tempo estável."
},
{
  id: 69,
  pergunta: "O que significa a sigla FEW apresentada na imagem?",
  imagem: "../imagens/sigwx/69.png",
  opcoes: [
    "Céu encoberto",
    "Poucas nuvens",
    "Nuvens esparsas",
    "Céu nublado"
  ],
  correta: 1,
  assunto: "Nuvens",
  explicacao: "FEW indica poucas nuvens, com cobertura de 1 a 2 oitavos do céu."
},
{
  id: 70,
  pergunta: "O que a simbologia apresentada indica na carta SIGWX?",
  imagem: "../imagens/sigwx/70.png",
  opcoes: [
    "Direção da Corrente de Jato",
    "Intensificação da Corrente de Jato",
    "Variação na intensidade da Corrente de Jato",
    "Turbulência associada à Corrente de Jato"
  ],
  correta: 2,
  assunto: "SIGWX",
  explicacao: "Os traços indicam variação na intensidade da Corrente de Jato ao longo do seu eixo."
},
{
  id: 71,
  pergunta: "O que a simbologia apresentada indica?",
  imagem: "../imagens/sigwx/71.png",
  opcoes: [
    "Direção do vento em superfície",
    "Direção e velocidade do vento",
    "Corrente de jato",
    "Zona de cisalhamento"
  ],
  correta: 1,
  assunto: "Meteorologia",
  explicacao: "O símbolo indica direção e velocidade do vento, sendo o valor numérico expresso em nós."
},
{
  id: 72,
  pergunta: "Qual tipo de nuvem está representado na imagem?",
  imagem: "../imagens/sigwx/72.png",
  opcoes: [
    "Stratocumulus",
    "Stratus",
    "Altostratus",
    "Nimbostratus"
  ],
  correta: 1,
  assunto: "Nuvens",
  explicacao: "Stratus são nuvens baixas, extensas e uniformes, geralmente associadas a tempo fechado."
}
];

function normalizeSigwxQuestion(item, index) {
  const fallbackId = index + 1;
  const parsedId = Number(item?.id);
  const id = Number.isFinite(parsedId) && parsedId > 0 ? Math.floor(parsedId) : fallbackId;

  const question = String(item?.question || item?.pergunta || "").trim();
  const options = Array.isArray(item?.options)
    ? item.options
    : Array.isArray(item?.opcoes)
      ? item.opcoes
      : [];
  const correctRaw = item?.correctIndex ?? item?.correta;
  const parsedCorrect = Number(correctRaw);
  const correctIndex = Number.isFinite(parsedCorrect) ? Math.floor(parsedCorrect) : 0;
  const explanation = String(item?.explanation || item?.explicacao || "").trim();

  return {
    id,
    image: `assets/questions/sigwx/${id}.webp`,
    question,
    options,
    correctIndex,
    explanation
  };
}

export const sigwxQuestions = rawSigwxQuestions.map(normalizeSigwxQuestion);
