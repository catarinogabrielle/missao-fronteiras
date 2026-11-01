export interface LocalPhrase {
  id: string;
  original: string;
  script?: string;
  phonetic: string;
  meaning: string;
  faithContext: string;
  category: "greeting" | "faith" | "hope" | "gratitude" | "scripture";
}

export interface LanguageQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MissionLanguageData {
  missionId: string;
  languageName: string;
  nativeName: string;
  speechLocale: string;
  flagEmoji: string;
  speakerCount: string;
  regionSummary: string;
  phrases: LocalPhrase[];
  quiz: LanguageQuizQuestion[];
}

export const MISSION_LANGUAGES: Record<string, MissionLanguageData> = {
  amazonia: {
    missionId: "amazonia",
    languageName: "Nheengatu & Tupi Ribeirinho",
    nativeName: "Nhe'ẽgatú (Língua Boa)",
    speechLocale: "pt-BR",
    flagEmoji: "🛶",
    speakerCount: "Mais de 30.000 falantes no Alto Rio Negro e bacia amazônica",
    regionSummary:
      "O Nheengatu é a língua geral amazônica derivada do Tupi antigo, usada historicamente por comunidades ribeirinhas e indígenas para o comércio e a comunicação intercultural ao longo dos grandes rios.",
    phrases: [
      {
        id: "am-1",
        original: "Puranga pesika!",
        phonetic: "pu-RAN-ga pe-SI-ka",
        meaning: "Sejam bem-vindos!",
        faithContext:
          "Expressão tradicional de hospitalidade ribeirinha para abrir a casa e o coração ao missionário.",
        category: "greeting",
      },
      {
        id: "am-2",
        original: "Tupana nemba'esuísu!",
        phonetic: "tu-PA-na nem-ba-e-su-Í-su",
        meaning: "Deus ama você!",
        faithContext:
          "Mensagem central do Evangelho compartilhada nas aldeias e comunidades à beira do rio.",
        category: "faith",
      },
      {
        id: "am-3",
        original: "Katú tekó",
        phonetic: "ka-TÚ te-KÓ",
        meaning: "Paz e vida boa (Shalom)",
        faithContext:
          "O conceito bíblico de plenitude e harmonia com Deus, com o próximo e com a criação.",
        category: "hope",
      },
      {
        id: "am-4",
        original: "Tupana omu'e yandeve",
        phonetic: "tu-PA-na o-mu-É yan-de-VE",
        meaning: "Deus nos ensina e guia",
        faithContext:
          "Usado para orar antes de abrir as Sagradas Escrituras em uma leitura comunitária.",
        category: "scripture",
      },
    ],
    quiz: [
      {
        question: "Como os povos ribeirinhos dizem 'Deus ama você' em Nheengatu?",
        options: ["Puranga pesika!", "Tupana nemba'esuísu!", "Katú tekó", "Obrigado"],
        correctIndex: 1,
        explanation: "Tupana nemba'esuísu expressa o profundo amor do Criador pelo ser humano.",
      },
      {
        question: "Qual o significado de 'Katú tekó' na visão missionária?",
        options: ["Dia de chuva", "Barco a motor", "Paz e vida plena (Shalom)", "Peixe assado"],
        correctIndex: 2,
        explanation: "Katú tekó significa viver em harmonia e paz sob a graça de Deus.",
      },
      {
        question: "O Nheengatu é falado predominantemente em qual região?",
        options: ["Pampas Gaúchos", "Bacia do Rio Negro e Amazônia", "Sertão da Paraíba", "Pantanal"],
        correctIndex: 1,
        explanation: "É uma das línguas indígenas mais vivas do Alto Rio Negro e da Amazônia.",
      },
    ],
  },

  janela1040: {
    missionId: "janela1040",
    languageName: "Árabe Clássico & Dialetos",
    nativeName: "العَرَبِيَّة (Al-ʻArabiyyah)",
    speechLocale: "ar-SA",
    flagEmoji: "🌍",
    speakerCount: "Mais de 400 milhões no Norte da África e Oriente Médio",
    regionSummary:
      "A Janela 10/40 abriga os povos menos alcançados do planeta. O árabe é uma língua poética e reverente, onde quase toda saudação faz referência direta a Deus e à paz.",
    phrases: [
      {
        id: "j-1",
        original: "Salam Alaykum",
        script: "السَّلَامُ عَلَيْكُمْ",
        phonetic: "sa-LÁM a-LEI-kum",
        meaning: "A paz esteja com você",
        faithContext:
          "Saudação fundamental de respeito que estabelece imediatamente uma ponte de confiança e amizade.",
        category: "greeting",
      },
      {
        id: "j-2",
        original: "Mahabbat Allah",
        script: "مَحَبَّةُ الله",
        phonetic: "ma-HAB-bat al-LAH",
        meaning: "O Amor Incondicional de Deus",
        faithContext:
          "A mensagem revolucionária de que Deus não é distante, mas um Pai amoroso que nos ama de perto.",
        category: "faith",
      },
      {
        id: "j-3",
        original: "Raja' fi al-Masiha",
        script: "رَجَاء فِي المَسِيح",
        phonetic: "ra-JÁ fi al-ma-SÍ-ha",
        meaning: "Esperança no Messias",
        faithContext:
          "Palavra de consolo transmitida aos perseguidos e aos que buscam sentido e perdão.",
        category: "hope",
      },
      {
        id: "j-4",
        original: "Shukran jazilan",
        script: "شُكْرًا جَزِيلًا",
        phonetic: "shúk-ran ja-ZÍ-lan",
        meaning: "Muito obrigado",
        faithContext:
          "Expressão de gratidão ao receber água fresca, hospitalidade ou oração.",
        category: "gratitude",
      },
    ],
    quiz: [
      {
        question: "Qual é a saudação mais universal de paz no mundo árabe?",
        options: ["Shukran", "Salam Alaykum", "Marhaba", "Ahlan"],
        correctIndex: 1,
        explanation: "Salam Alaykum significa literalmente 'A paz esteja sobre você'.",
      },
      {
        question: "O que significa 'Mahabbat Allah'?",
        options: ["Casa de pedra", "O amor de Deus", "Viagem longa", "Água do deserto"],
        correctIndex: 1,
        explanation: "Mahabba é a palavra árabe para o amor puro e sacrificial de Deus.",
      },
      {
        question: "O que representa a 'Janela 10/40' na missiologia?",
        options: [
          "Uma janela de vidro antigo",
          "Faixa geográfica com maior concentração de povos não alcançados",
          "Um clube de jovens na Europa",
          "Um código secreto de rádio",
        ],
        correctIndex: 1,
        explanation: "Fica entre os graus 10 e 40 de latitude norte, onde vivem bilhões sem acesso ao Evangelho.",
      },
    ],
  },

  toquio: {
    missionId: "toquio",
    languageName: "Japonês",
    nativeName: "日本語 (Nihongo)",
    speechLocale: "ja-JP",
    flagEmoji: "🗼",
    speakerCount: "Mais de 125 milhões de pessoas no Japão e diáspora",
    regionSummary:
      "Em metrópoles densas e hiperconectadas como Tóquio, o maior desafio dos jovens é a solidão urbana e a pressão acadêmica. O idioma japonês valoriza a harmonia, o respeito e a gratidão profunda.",
    phrases: [
      {
        id: "t-1",
        original: "Konnichiwa",
        script: "こんにちは",
        phonetic: "kon-ni-tchi-UÁ",
        meaning: "Olá / Tenha um dia iluminado",
        faithContext:
          "A saudação cotidiana que quebra o isolamento das pessoas nos trens e calçadas.",
        category: "greeting",
      },
      {
        id: "t-2",
        original: "Heiwa to Kibou",
        script: "平和と希望",
        phonetic: "hei-UA to ki-BOU",
        meaning: "Paz e Esperança",
        faithContext:
          "As duas maiores buscas dos jovens japoneses que enfrentam o estresse do dia a dia.",
        category: "hope",
      },
      {
        id: "t-3",
        original: "Kami no Megumi",
        script: "神の恵み",
        phonetic: "ka-MI no me-GU-mi",
        meaning: "A Graça e Favor de Deus",
        faithContext:
          "O conceito libertador de que o amor de Deus não é conquistado por perfeccionismo, mas é um presente gratuito.",
        category: "faith",
      },
      {
        id: "t-4",
        original: "Arigatou gozaimasu",
        script: "ありがとうございます",
        phonetic: "a-ri-ga-TOU go-zai-MAS",
        meaning: "Muito obrigado (respeitoso)",
        faithContext:
          "Expressar gratidão sincera é o coração da amizade e da honra na cultura japonesa.",
        category: "gratitude",
      },
    ],
    quiz: [
      {
        question: "Como se diz 'Paz e Esperança' em japonês?",
        options: ["Sayonara", "Heiwa to Kibou", "Arigatou", "Sensei"],
        correctIndex: 1,
        explanation: "Heiwa (paz) e Kibou (esperança) são palavras poderosas de encorajamento.",
      },
      {
        question: "O que significa 'Kami no Megumi'?",
        options: ["Comida gostosa", "A graça de Deus", "Templo dourado", "Trem bala"],
        correctIndex: 1,
        explanation: "Megumi significa graça imerecida, bênção e favor divino.",
      },
      {
        question: "Qual o maior desafio missionário entre a juventude urbana de Tóquio?",
        options: ["Falta de internet", "Solidão e pressão por perfeição", "Falta de trens", "Frio extremo"],
        correctIndex: 1,
        explanation: "A solidão urbana é uma das maiores dores que o amor de Cristo cura nas metrópoles.",
      },
    ],
  },

  savana: {
    missionId: "savana",
    languageName: "Emakhuwa & Suaíli",
    nativeName: "Emakhuwa (Língua Macua)",
    speechLocale: "pt-BR",
    flagEmoji: "🌾",
    speakerCount: "Mais de 6 milhões de falantes no norte de Moçambique e leste africano",
    regionSummary:
      "Em Nampula e nas vilas da savana, a língua materna Macua toca o coração das pessoas mais profundamente do que qualquer idioma estrangeiro. A tradução da Bíblia para este idioma é um marco histórico de missões.",
    phrases: [
      {
        id: "s-1",
        original: "Salama vanyani!",
        phonetic: "sa-LA-ma va-NYA-ni",
        meaning: "Paz a todos vocês!",
        faithContext:
          "Saudação calorosa em comunidade onde o cumprimento nunca é individual, mas coletivo.",
        category: "greeting",
      },
      {
        id: "s-2",
        original: "Muluku ti ophenta",
        phonetic: "mu-LU-ku ti o-PHEN-ta",
        meaning: "Deus é Amor (1 João 4:8)",
        faithContext:
          "A verdade que transforma o medo dos espíritos na confiança do cuidado do Pai Celestial.",
        category: "faith",
      },
      {
        id: "s-3",
        original: "Niroromele Muluku",
        phonetic: "ni-ro-ro-ME-le mu-LU-ku",
        meaning: "Vamos confiar em Deus juntos",
        faithContext:
          "Expressão de união e fé cantada em coral pelas igrejas nas vilas.",
        category: "hope",
      },
      {
        id: "s-4",
        original: "Koxukhuru vanceene",
        phonetic: "ko-shu-KHU-ru van-CEE-ne",
        meaning: "Agradeço de todo coração",
        faithContext:
          "Dito após uma oração de cura ou ao receber auxílio médico na tenda missionária.",
        category: "gratitude",
      },
    ],
    quiz: [
      {
        question: "Como se diz 'Deus é Amor' na língua Macua de Moçambique?",
        options: ["Salama", "Muluku ti ophenta", "Koxukhuru", "Vanyani"],
        correctIndex: 1,
        explanation: "Muluku é a palavra para Deus e Ophenta para amor verdadeiro.",
      },
      {
        question: "Por que traduzir a Bíblia para a 'língua do coração' é tão importante?",
        options: [
          "Para vender livros caros",
          "Porque as pessoas compreendem e sentem o amor de Deus na sua língua materna",
          "Apenas para estudo histórico",
          "Para substituir os dialetos",
        ],
        correctIndex: 1,
        explanation: "A língua materna comunica diretamente com as emoções e a identidade do povo.",
      },
      {
        question: "O que significa 'Salama vanyani'?",
        options: ["Boa viagem", "Paz a todos vocês", "Chuva no campo", "Hora do almoço"],
        correctIndex: 1,
        explanation: "É uma saudação de paz e bênção comunitária para todos os presentes.",
      },
    ],
  },

  sertao: {
    missionId: "sertao",
    languageName: "Expressões Sertanejas da Fé",
    nativeName: "Fala Cabocla & Sertaneja",
    speechLocale: "pt-BR",
    flagEmoji: "🌵",
    speakerCount: "Mais de 28 milhões de pessoas no semiárido e interior nordestino",
    regionSummary:
      "O povo sertanejo tem uma fé resiliente e poética. Em meio à seca e à lida árdua da caatinga, a linguagem é repleta de bênçãos, provérbios de esperança e honra pela Palavra de Deus.",
    phrases: [
      {
        id: "st-1",
        original: "Louvado seja nosso Senhor Jesus Cristo!",
        phonetic: "lou-VA-do SE-ja NOS-so se-NHOR je-SUS CRIS-to",
        meaning: "Saudação tradicional de bênção e fé",
        faithContext:
          "Entrada respeitosa em qualquer casa sertaneja, respondida com 'Para sempre seja louvado'.",
        category: "greeting",
      },
      {
        id: "st-2",
        original: "Água da Vida no Coração da Caatinga",
        phonetic: "Á-gua da VI-da no co-ra-ÇÃO da caa-TIN-ga",
        meaning: "Jesus é a fonte que nunca seca",
        faithContext:
          "Metáfora poderosa usada para explicar o Evangelho aos trabalhadores da terra seca.",
        category: "faith",
      },
      {
        id: "st-3",
        original: "Deus lhe pague com a graça do Céu!",
        phonetic: "DEUS lhe PA-gue com a GRA-ça do CÉU",
        meaning: "Agradecimento que invoca a bênção de Deus",
        faithContext:
          "A mais nobre forma de agradecer por um copo de água, um prato de comida ou uma oração.",
        category: "gratitude",
      },
      {
        id: "st-4",
        original: "Viver de Esperança e Firmeza",
        phonetic: "vi-VER de es-pe-RAN-ça e fir-ME-za",
        meaning: "Fé perseverante mesmo na escassez",
        faithContext:
          "Testemunho dos crentes sertanejos que cantam louvores mesmo aguardando a chuva.",
        category: "hope",
      },
    ],
    quiz: [
      {
        question: "Qual é a resposta tradicional sertaneja para 'Louvado seja nosso Senhor'?",
        options: ["Bom dia", "Para sempre seja louvado!", "Até logo", "Tanto faz"],
        correctIndex: 1,
        explanation: "Essa resposta fecha um pacto mútuo de fé e respeito cristão.",
      },
      {
        question: "No Sertão, qual imagem bíblica melhor representa a salvação de Jesus?",
        options: ["Montanhas de neve", "A Água Viva que nunca seca", "Luz de neon", "Navio no mar"],
        correctIndex: 1,
        explanation: "Numa terra de seca, a Água Viva de Cristo (João 4) é a mais bela promessa.",
      },
      {
        question: "Como o sertanejo expressa gratidão profunda?",
        options: ["Valeu", "Deus lhe pague com a graça do Céu!", "Tchau", "Beleza"],
        correctIndex: 1,
        explanation: "'Deus lhe pague' coloca a recompensa nas mãos generosas do próprio Deus.",
      },
    ],
  },

  andes: {
    missionId: "andes",
    languageName: "Quechua Sul-Andino",
    nativeName: "Runa Simi (Língua do Povo)",
    speechLocale: "es-PE",
    flagEmoji: "🏔️",
    speakerCount: "Mais de 8 milhões de falantes ao longo da Cordilheira dos Andes",
    regionSummary:
      "Herança viva do império inca, o Quechua é falado nos altos platôs andinos. É uma língua aglutinante cheia de carinho e respeito pela família e pela terra sob a soberania do Criador.",
    phrases: [
      {
        id: "an-1",
        original: "Allillanchu kashanki?",
        phonetic: "a-lhi-lhan-CHU ka-SHAN-ki",
        meaning: "Você está bem e em paz?",
        faithContext:
          "A resposta tradicional é 'Allillanmi' (Estou em perfeita paz pela bondade de Deus).",
        category: "greeting",
      },
      {
        id: "an-2",
        original: "Tukuy sonqoywan Diosta munakuni",
        phonetic: "tu-KUY son-QOY-wan DIOS-ta mu-na-KU-ni",
        meaning: "Amo a Deus com todo meu coração (Deuteronômio 6:5)",
        faithContext:
          "Versículo decorado pelas crianças pastoras nas montanhas andinas.",
        category: "faith",
      },
      {
        id: "an-3",
        original: "Diospa Sumaq Munaynin",
        phonetic: "DIOS-pa su-MAQ mu-NAY-nin",
        meaning: "A Doce Vontade e Graça de Deus",
        faithContext:
          "Usado para confortar famílias após geadas ou perdas nos terraços agrícolas.",
        category: "hope",
      },
      {
        id: "an-4",
        original: "Sulpayki taytay / mamay",
        phonetic: "sul-PAY-ki tay-TAY",
        meaning: "Muito obrigado, meu irmão / irmã",
        faithContext:
          "Gratidão respeitosa que reconhece o próximo como família em Deus.",
        category: "gratitude",
      },
    ],
    quiz: [
      {
        question: "Como se pergunta 'Você está em paz/bem?' em Quechua?",
        options: ["Allillanchu kashanki?", "Sulpayki", "Runa Simi", "Inka"],
        correctIndex: 0,
        explanation: "Allillanchu busca saber como está a alma e a paz da outra pessoa.",
      },
      {
        question: "O que significa 'Tukuy sonqoywan'?",
        options: ["Com muita pressa", "De todo o meu coração", "No alto do morro", "Com pouca força"],
        correctIndex: 1,
        explanation: "Sonqo é o coração em Quechua, sede do amor e da devoção a Deus.",
      },
      {
        question: "Qual o nome nativo do idioma Quechua?",
        options: ["Runa Simi", "Nheengatu", "Guarani", "Aymara"],
        correctIndex: 0,
        explanation: "Runa Simi significa literalmente 'A língua dos seres humanos'.",
      },
    ],
  },

  himalaia: {
    missionId: "himalaia",
    languageName: "Tibetano & Nepali",
    nativeName: "བོད་སྐད་ (Bod Skad) / नेपाली (Nepali)",
    speechLocale: "ne-NP",
    flagEmoji: "❄️",
    speakerCount: "Mais de 35 milhões de falantes nos vales e montanhas do Himalaia",
    regionSummary:
      "Nos picos mais altos da Terra, comunidades budistas e hindus isoladas aprendem sobre o amor de Cristo através do serviço médico, ajuda aos alpinistas e respeito às suas tradições de montanha.",
    phrases: [
      {
        id: "h-1",
        original: "Tashi Delek!",
        script: "བཀྲ་ཤིས་བདེ་ལེགས",
        phonetic: "ta-SHI de-LEK",
        meaning: "Bênçãos e paz abundante sobre você!",
        faithContext:
          "A saudação sagrada do Himalaia que deseja vida próspera, paz espiritual e saúde.",
        category: "greeting",
      },
      {
        id: "h-2",
        original: "Ishwarle tapaailai prem garnuhunchha",
        script: "ईश्वरले तपाईंलाई प्रेम गर्नुहुन्छ",
        phonetic: "ish-WAR-le ta-PAI-lai prem gar-nu-HUN-chha",
        meaning: "Deus ama você profundamente (em Nepali)",
        faithContext:
          "Palavra que traz alívio aos povos dos vilarejos isolados do Nepal.",
        category: "faith",
      },
      {
        id: "h-3",
        original: "Shanti ra Mukti",
        script: "शान्ति र मुक्ति",
        phonetic: "SHAN-ti ra MUK-ti",
        meaning: "Paz interior e Libertação em Cristo",
        faithContext:
          "A mensagem bíblica de que a verdadeira paz não é apenas silêncio na montanha, mas o perdão dos pecados.",
        category: "hope",
      },
      {
        id: "h-4",
        original: "Dhanyabad",
        script: "धन्यवाद",
        phonetic: "dha-NYA-bad",
        meaning: "Gratidão / Muito obrigado com as mãos unidas",
        faithContext:
          "Gesto de humildade e apreço sincero por um copo de chá quente na nevasca.",
        category: "gratitude",
      },
    ],
    quiz: [
      {
        question: "Qual é a célebre saudação de bênção do Himalaia?",
        options: ["Namaste", "Tashi Delek!", "Dhanyabad", "Shanti"],
        correctIndex: 1,
        explanation: "Tashi Delek deseja bênçãos abundantes e paz espiritual para a pessoa.",
      },
      {
        question: "O que significa 'Shanti' nas línguas do Himalaia?",
        options: ["Neve", "Paz profunda", "Vento frio", "Trilha íngreme"],
        correctIndex: 1,
        explanation: "Shanti é o estado de paz, calma e tranquilidade na presença de Deus.",
      },
      {
        question: "Como se agradece em Nepali com reverência?",
        options: ["Dhanyabad", "Alaykum", "Arigatou", "Katú"],
        correctIndex: 0,
        explanation: "Dhanyabad é a palavra solene de gratidão em todo o Nepal.",
      },
    ],
  },

  refugio: {
    missionId: "refugio",
    languageName: "Línguas de Acolhimento (Ucraniano & Suaíli)",
    nativeName: "Мови гостинності (Laskavo Prosymo)",
    speechLocale: "uk-UA",
    flagEmoji: "🕊️",
    speakerCount: "Falado por refugiados e missionários em centros internacionais de acolhida",
    regionSummary:
      "Em metrópoles que recebem refugiados de guerras e crises humanitárias, o amor se expressa em múltiplos idiomas. Aprender a dar as boas-vindas na língua do recém-chegado devolve sua dignidade.",
    phrases: [
      {
        id: "r-1",
        original: "Laskavo prosymo!",
        script: "Ласкаво просимо!",
        phonetic: "las-KA-vo pro-SY-mo",
        meaning: "Sejam muito bem-vindos à nossa casa e mesa!",
        faithContext:
          "A primeira frase que uma família acolhida precisa ouvir para saber que está em segurança.",
        category: "greeting",
      },
      {
        id: "r-2",
        original: "Boh tebe liubyt'",
        script: "Бог тебе любить",
        phonetic: "BOG te-BE lyu-BYT",
        meaning: "Deus ama você e não se esqueceu de ti",
        faithContext:
          "O bálsamo espiritual para crianças que perderam suas casas na guerra.",
        category: "faith",
      },
      {
        id: "r-3",
        original: "Myr i Nadiya",
        script: "Мир і надія",
        phonetic: "MYR i na-DÍ-ya",
        meaning: "Paz e Esperança no futuro",
        faithContext:
          "Promessa bíblica de Jeremias 29:11 entregue aos migrantes e exilados.",
        category: "hope",
      },
      {
        id: "r-4",
        original: "Dyakuyu vid shchyroho sertsya",
        script: "Дякую від щирого серця",
        phonetic: "DYA-ku-yu vid SHCHY-ro-ho ser-TSYA",
        meaning: "Obrigado do fundo do meu coração",
        faithContext:
          "A lágrima de alívio e gratidão de uma mãe acolhida pela igreja de Cristo.",
        category: "gratitude",
      },
    ],
    quiz: [
      {
        question: "Como se diz 'Sejam bem-vindos' em ucraniano para acolher refugiados?",
        options: ["Paz", "Laskavo prosymo!", "Dyakuyu", "Salam"],
        correctIndex: 1,
        explanation: "Laskavo prosymo é a calorosa recepção de braços abertos.",
      },
      {
        question: "O que significa 'Myr i Nadiya'?",
        options: ["Comida e água", "Paz e Esperança", "Frio e chuva", "Cidade grande"],
        correctIndex: 1,
        explanation: "Myr é paz e Nadiya é a esperança viva que vence qualquer conflito.",
      },
      {
        question: "Qual o papel das igrejas no acolhimento de refugiados internacionais?",
        options: [
          "Apenas observar as notícias",
          "Abrir as portas, prover abrigo, alimento e o amor acolhedor de Jesus",
          "Fechar as fronteiras",
          "Cobrar pelos serviços",
        ],
        correctIndex: 1,
        explanation: "Como ensinou Jesus em Mateus 25: 'Fui estrangeiro e me acolhestes'.",
      },
    ],
  },
};

// Aliases for unified ID access
MISSION_LANGUAGES["mocambique"] = MISSION_LANGUAGES["savana"];
MISSION_LANGUAGES["europa"] = MISSION_LANGUAGES["refugio"];

export function getMissionLanguage(missionId: string): MissionLanguageData {
  if (MISSION_LANGUAGES[missionId]) {
    return MISSION_LANGUAGES[missionId];
  }
  const clean = missionId.replace(/^pray-/, "");
  if (MISSION_LANGUAGES[clean]) {
    return MISSION_LANGUAGES[clean];
  }
  if (clean === "mocambique") return MISSION_LANGUAGES["savana"];
  if (clean === "europa") return MISSION_LANGUAGES["refugio"];
  return MISSION_LANGUAGES["amazonia"];
}

