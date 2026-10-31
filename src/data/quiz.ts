export interface TribeQuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  verseRef: string;
}

export const TRIBES_QUIZ_QUESTIONS: TribeQuizQuestion[] = [
  {
    id: "q1",
    category: "Grande Comissão",
    question:
      "Qual foi a ordem final de Jesus aos discípulos conhecida como a 'Grande Comissão'?",
    options: [
      "Ficar apenas em Jerusalém construindo um grande templo",
      "Ir por todo o mundo, pregar o Evangelho e fazer discípulos de todas as nações",
      "Guardar o Evangelho em segredo e não compartilhar com ninguém",
      "Viajar apenas para cidades onde falassem hebraico",
    ],
    correctIndex: 1,
    explanation:
      "Jesus ordenou que Seus seguidores fossem e fizessem discípulos de todas as nações, batizando-os e ensinando-os!",
    verseRef: "Mateus 28:19-20 / Marcos 16:15",
  },
  {
    id: "q2",
    category: "Atos dos Apóstolos",
    question:
      "Em Atos 1:8, qual foi o 'mapa missionário' que Jesus desenhou para a Igreja após receber o poder do Espírito Santo?",
    options: [
      "Roma, Grécia, Egito e Índia",
      "Jerusalém, toda a Judeia e Samaria, e até aos confins da terra",
      "Apenas na Galileia e ao redor do Rio Jordão",
      "Somente nas capitais do Império Romano",
    ],
    correctIndex: 1,
    explanation:
      "Nossa missão começa perto de casa (Jerusalém/nossa escola), passa pelos vizinhos diferentes (Samaria) e vai até os confins da terra!",
    verseRef: "Atos 1:8",
  },
  {
    id: "q3",
    category: "Antigo Testamento",
    question:
      "Qual profeta tentou fugir de barco para Társis porque não queria que Deus perdoasse os moradores da cidade inimiga de Nínive?",
    options: ["Elias", "Daniel", "Jonas", "Amós"],
    correctIndex: 2,
    explanation:
      "O livro de Jonas mostra que o coração missionário de Deus ama até os povos que nós achamos difíceis de amar!",
    verseRef: "Jonas 1:1-3; 4:11",
  },
  {
    id: "q4",
    category: "Igreja Enviadora",
    question:
      "Qual igreja do Novo Testamento orou, jejuou e enviou Paulo e Barnabé na primeira grande viagem missionária?",
    options: [
      "Igreja de Antioquia",
      "Igreja de Laodiceia",
      "Igreja de Corinto",
      "Igreja de Atenas",
    ],
    correctIndex: 0,
    explanation:
      "Em Antioquia os discípulos foram chamados cristãos pela primeira vez e dali o Espírito Santo enviou Barnabé e Saulo (Paulo)!",
    verseRef: "Atos 13:1-3",
  },
  {
    id: "q5",
    category: "Companheirismo",
    question:
      "Qual era o significado do apelido de Barnabé, o grande parceiro que acolheu Paulo e encorajou jovens missionários?",
    options: [
      "Filho do Trovão",
      "Filho da Consolação / Encorajamento",
      "Guerreiro do Deserto",
      "Guardião das Cartas",
    ],
    correctIndex: 1,
    explanation:
      "Barnabé significa 'Filho da Consolação' (Encorajamento). Todo missionário precisa de encorajadores na igreja!",
    verseRef: "Atos 4:36",
  },
  {
    id: "q6",
    category: "Quebrando Barreiras",
    question:
      "Quem Deus enviou à casa do centurião romano Cornélio para mostrar que o Evangelho também era para os não-judeus (gentios)?",
    options: ["Tomé", "Pedro", "Judas Tadeu", "Mateus"],
    correctIndex: 1,
    explanation:
      "Pedro entendeu na casa de Cornélio que 'Deus não faz acepção de pessoas' — a salvação em Jesus é para todos os povos!",
    verseRef: "Atos 10:34-35",
  },
  {
    id: "q7",
    category: "África na Bíblia",
    question:
      "Qual evangelista correu ao lado de uma carruagem no deserto para explicar Isaías 53 e batizar um oficial africano da Etiópia?",
    options: ["Filipe", "Estêvão", "Silas", "Apolo"],
    correctIndex: 0,
    explanation:
      "Filipe obedeceu prontamente ao Espírito Santo e o oficial etíope levou as boas novas de Jesus com alegria para a África!",
    verseRef: "Atos 8:26-39",
  },
  {
    id: "q8",
    category: "Jovens na Missão",
    question:
      "Quem era o jovem discípulo que acompanhou Paulo nas viagens e recebeu o conselho: 'Ninguém despreze a tua mocidade'?",
    options: ["Tito", "Timóteo", "Lucas", "Filemom"],
    correctIndex: 1,
    explanation:
      "Timóteo começou muito jovem na obra missionária e foi exemplo dos fiéis na palavra, no trato, no amor e na fé!",
    verseRef: "1 Timóteo 4:12",
  },
  {
    id: "q9",
    category: "Evangelismo Criativo",
    question:
      "Em Atenas, o que Paulo usou como 'ponte cultural' para anunciar o Deus Criador e a ressurreição de Jesus aos filósofos?",
    options: [
      "Um campeonato de corrida de bigas",
      "Um altar com a inscrição 'AO DEUS DESCONHECIDO'",
      "Uma carta do imperador romano",
      "Uma música tocada com harpa na praça",
    ],
    correctIndex: 1,
    explanation:
      "Paulo observou a cultura da cidade com atenção e usou o altar 'Ao Deus Desconhecido' para anunciar o verdadeiro Deus!",
    verseRef: "Atos 17:22-24",
  },
  {
    id: "q10",
    category: "Línguas & Povos",
    question:
      "No dia de Pentecostes (Atos 2), qual milagre aconteceu quando os discípulos falaram cheios do Espírito Santo?",
    options: [
      "As pedras do templo começaram a brilhar no escuro",
      "Visitantes de várias nações ouviram as grandezas de Deus cada um em sua própria língua materna",
      "Todos passaram a falar apenas latim",
      "Um barco atravessou o deserto sem água",
    ],
    correctIndex: 1,
    explanation:
      "Desde Pentecostes, Deus mostrou que o Evangelho deve ser ouvido e compreendido no idioma do coração de cada povo!",
    verseRef: "Atos 2:6-11",
  },
  {
    id: "q11",
    category: "Missões Mundiais Hoje",
    question:
      "O que significa o termo missionário 'Janela 10/40'?",
    options: [
      "Um horário de oração entre 10h e 10h40 da manhã",
      "A região entre 10° e 40° norte (Norte da África, Oriente Médio e Ásia) com maior concentração de povos não alcançados",
      "Os 40 capítulos mais curtos da Bíblia",
      "Uma conferência de 10 dias para 40 igrejas",
    ],
    correctIndex: 1,
    explanation:
      "A Janela 10/40 abriga bilhões de pessoas que têm pouquíssimo acesso a uma igreja ou a cristãos vizinhos.",
    verseRef: "Romanos 15:20-21",
  },
  {
    id: "q12",
    category: "Louvor na Prisão",
    question:
      "O que Paulo e Silas estavam fazendo à meia-noite na prisão de Filipos antes do terremoto que levou à conversão do carcereiro e sua família?",
    options: [
      "Reclamando dos soldados romanos",
      "Tentando cavar um túnel na parede",
      "Orando e cantando hinos a Deus enquanto os outros presos escutavam",
      "Dormindo profundamente sem esperança",
    ],
    correctIndex: 2,
    explanation:
      "Mesmo em meio à dor injusta, a adoração e o amor de Paulo e Silas abriram o coração do carcereiro para perguntar: 'Que é necessário para me salvar?'",
    verseRef: "Atos 16:25-31",
  },
  {
    id: "q13",
    category: "Casal Missionário",
    question:
      "Qual casal fazedor de tendas trabalhou com Paulo e abriu sua casa para hospedar igrejas em várias cidades?",
    options: [
      "Ananias e Safira",
      "Priscila e Áquila",
      "Zacarias e Isabel",
      " Isaque e Rebeca",
    ],
    correctIndex: 1,
    explanation:
      "Priscila e Áquila usavam sua profissão e sua casa como base missionária para discipular pessoas como Apolo!",
    verseRef: "Atos 18:2-3, 26",
  },
  {
    id: "q14",
    category: "História das Missões",
    question:
      "Quem foi o sapateiro inglês considerado 'pai das missões modernas', que traduziu a Bíblia para idiomas da Índia e disse: 'Espere grandes coisas de Deus, tente grandes coisas para Deus'?",
    options: [
      "William Carey",
      "Cristóvão Colombo",
      "Isaac Newton",
      "Leonardo da Vinci",
    ],
    correctIndex: 0,
    explanation:
      "William Carey colocava um mapa-múndi na oficina de sapatos para orar pelas nações antes de partir para a Índia e traduzir a Bíblia!",
    verseRef: "Isaías 54:2-3",
  },
  {
    id: "q15",
    category: "Respeito Cultural",
    question:
      "Qual missionário do século XIX adotou roupas e costumes locais na China para remover barreiras culturais e mostrar que Jesus não era 'apenas para europeus'?",
    options: [
      "Hudson Taylor",
      "Marco Polo",
      "Napoleão Bonaparte",
      "Galileu Galilei",
    ],
    correctIndex: 0,
    explanation:
      "Hudson Taylor seguiu o princípio bíblico de Paulo em 1 Coríntios 9:22 ('fiz-me tudo para todos, para por todos os meios chegar a salvar alguns').",
    verseRef: "1 Coríntios 9:19-22",
  },
  {
    id: "q16",
    category: "Visão Final da Bíblia",
    question:
      "Segundo Apocalipse 7:9, quem estará diante do trono de Deus e do Cordeiro (Jesus) na eternidade?",
    options: [
      "Apenas pessoas de um único país e idioma",
      "Somente pastores e profetas famosos",
      "Uma grande multidão de todas as nações, tribos, povos e línguas",
      "Apenas quem nunca cometeu nenhum erro na vida",
    ],
    correctIndex: 2,
    explanation:
      "A história termina com sucesso total da missão de Deus: pessoas redimidas pelo sangue de Jesus de toda tribo, língua, povo e nação!",
    verseRef: "Apocalipse 7:9-10",
  },
];
