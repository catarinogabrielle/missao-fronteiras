import { Mission, PrayerCard } from "@/types/game";

export const CORE_MISSIONS: Mission[] = [
  {
    id: "amazonia",
    order: 1,
    title: "Amazônia Ribeirinha",
    regionName: "Comunidade Acajatuba • Rio Negro",
    country: "Brasil",
    coordinatesLabel: "03°05'S 60°36'W",
    mapPosition: { x: 31, y: 63 },
    emoji: "🛶",
    stampCode: "BR-AMZ-01",
    difficulty: "Iniciante",
    accentColor: "emerald",
    spiritualChallenge: "Cuidado prático, empatia na dor e histórias de Jesus",
    shortDescription:
      "Navegue no Barco-Hospital até uma comunidade atingida pela cheia do rio e mostre que Deus nunca esquece nenhum de seus filhos.",
    npc: {
      id: "caua",
      name: "Cauã",
      age: 12,
      role: "Jovem Pescador Ribeirinho",
      bio: "Um garoto esperto que ajuda o pai na pesca, mas está assustado porque a cheia do rio destruiu a horta da escola e muitos dizem que 'Deus esqueceu a comunidade deles'.",
      avatarKey: "caua",
    },
    briefing: {
      context:
        "Sua equipe chegou de barco trazendo atendimento de saúde, filtros de água e apoio à escola local após uma grande cheia no Rio Negro.",
      culturalTip:
        "Nas comunidades ribeirinhas, a hospitalidade é sagrada. Sempre aceite um copo de água ou suco com gratidão, sente-se para ouvir as histórias sem olhar no relógio e ajude no trabalho prático antes de fazer discursos longos.",
      dos: [
        "Aceitar água, café ou suco de frutas locais com alegria e gratidão.",
        "Ouvir as histórias dos moradores com calma, sem pressa de cidade grande.",
        "Colocar a mão na massa ajudando nas redes, caixas e limpeza.",
      ],
      donts: [
        "Tirar fotos das famílias como se fossem 'atração turística'.",
        "Fazer promessas que sua equipe não poderá cumprir.",
        "Pregar de forma fria sem antes acolher a dor da comunidade.",
      ],
    },
    turns: [
      {
        id: "amz-t1",
        sceneTitle: "Turno 1 • A Chegada no Barco-Hospital",
        npcMood: "Desconfiado, segurando uma rede de pesca rasgada no píer",
        npcSpeech:
          "Vocês são como o pessoal que vem aqui tirar foto, promete ajudar e depois nunca mais volta?",
        prayerHint:
          "Peça sabedoria para demonstrar o amor de Cristo com humildade prática. Quando alguém já foi ferido por promessas vazias, o serviço abre a porta que o discurso não abre.",
        prayerVerse: "1 João 3:18 — 'Não amemos de palavra, mas por obra e em verdade.'",
        options: [
          {
            id: "amz-t1-hasty",
            tone: "hasty",
            text: "Não fale assim! Nós viemos trazer a Palavra de Deus e você precisa ouvir agora!",
            trustDelta: -20,
            xpReward: 5,
            feedback:
              "Cauã se fechou. Quando alguém já foi decepcionado, precisamos demonstrar amor prático antes de exigir atenção.",
          },
          {
            id: "amz-t1-timid",
            tone: "timid",
            text: "Não somos assim não, viemos só entregar umas cestas rápidas.",
            trustDelta: 10,
            xpReward: 15,
            feedback:
              "Educado, mas perdeu a chance de criar conexão real e mostrar interesse verdadeiro pela vida dele.",
          },
          {
            id: "amz-t1-emp",
            tone: "empathetic",
            text: "Oi Cauã! Eu entendo você ficar desconfiado. Antes de qualquer coisa, posso te ajudar a consertar essa rede de pesca e ouvir como têm sido os dias aqui?",
            trustDelta: 35,
            xpReward: 45,
            feedback:
              "Excelente! Como diz 1 João 3:18, não amamos apenas de palavras, mas em ação e em verdade!",
            bibleRef: "1 João 3:18",
          },
        ],
      },
      {
        id: "amz-t2",
        sceneTitle: "Turno 2 • A Dúvida no Coração",
        npcMood: "Mais aberto, trançando os fios da rede ao seu lado",
        npcSpeech:
          "Se Deus é tão bom como vocês dizem, por que Ele deixaria alguém morando tão longe de tudo? Será que alguém como eu importa para Ele?",
        prayerHint:
          "Lembre-se de quem Jesus chamou primeiro na Galileia! Conecte a vida ribeirinha de Cauã com os pescadores e barcos dos Evangelhos.",
        prayerVerse: "Marcos 1:16-17 — Jesus caminhava junto ao mar e chamou pescadores.",
        options: [
          {
            id: "amz-t2-hasty",
            tone: "hasty",
            text: "É porque o mundo está cheio de pecado e você precisa decorar mais versículos.",
            trustDelta: -15,
            xpReward: 5,
            feedback:
              "Resposta fria que não acolheu a dor dele nem mostrou o coração amoroso de Jesus.",
          },
          {
            id: "amz-t2-timid",
            tone: "timid",
            text: "Deus gosta de todo mundo igual, não fica triste não.",
            trustDelta: 15,
            xpReward: 15,
            feedback:
              "Verdadeiro, mas genérico. Faltou mostrar nas Escrituras como Jesus se aproxima de pessoas exatamente como ele.",
          },
          {
            id: "amz-t2-emp",
            tone: "empathetic",
            text: "Sabia que quando Jesus morou na Terra, os primeiros amigos que Ele chamou eram pescadores simples como você e seu pai? Ele atravessava rios e tempestades de barco só para encontrar uma única pessoa!",
            trustDelta: 40,
            xpReward: 50,
            feedback:
              "Perfeito! Você conectou a realidade dele com a história de Jesus em Marcos 1:16-17!",
            bibleRef: "Marcos 1:16-17",
          },
        ],
      },
      {
        id: "amz-t3",
        sceneTitle: "Turno 3 • O Convite na Fogueira",
        npcMood: "Sorrindo com os olhos brilhando de curiosidade",
        npcSpeech:
          "Sério que os melhores amigos de Jesus eram pescadores?! Os meninos da vila vão pirar nisso! Eles também podem ouvir essas histórias hoje à noite na fogueira?",
        prayerHint:
          "A porta do coração se abriu! Use a narrativa bíblica para apresentar Jesus como o Salvador que acalma tempestades e caminha conosco.",
        prayerVerse: "Marcos 4:39 — 'Acalma-te, emudece! E o vento se aquietou.'",
        options: [
          {
            id: "amz-t3-hasty",
            tone: "hasty",
            text: "Só podem ir se ficarem em silêncio absoluto ouvindo um sermão difícil de duas horas.",
            trustDelta: -15,
            xpReward: 5,
            feedback:
              "Cuidado! Jesus ensinava com parábolas vivas e acolhedoras ao redor das pessoas, não criando barreiras pesadas.",
          },
          {
            id: "amz-t3-timid",
            tone: "timid",
            text: "Acho que sim, se der tempo depois que a gente arrumar o barco.",
            trustDelta: 10,
            xpReward: 15,
            feedback:
              "Quase lá! Quando um coração está sedento para ouvir de Jesus, essa é a maior prioridade da missão.",
          },
          {
            id: "amz-t3-emp",
            tone: "empathetic",
            text: "Claro! Vamos contar a história de quando Jesus acalmou a tempestade no barco e mostrar como Ele quer ser o melhor amigo e Salvador de cada um de vocês!",
            trustDelta: 25,
            xpReward: 55,
            feedback:
              "Ponte construída com sucesso! Naquela noite, Cauã e toda a turma da vila ouviram sobre a salvação em Jesus ao redor da fogueira!",
            bibleRef: "Marcos 4:39-41",
          },
        ],
      },
    ],
    decoder: {
      gospelPillar: "Pilar 1 • O Amor de Deus em Ação",
      gospelExplanation:
        "O Evangelho não é apenas um discurso bonito: o próprio Deus veio ao nosso encontro em Jesus para nos resgatar com amor real.",
      localLanguageName: "Português Ribeirinho & Nheengatu (Língua Geral Amazônica)",
      localWordsGlossary: [
        { term: "Puranga", meaning: "Bonito / Bom" },
        { term: "Saisú", meaning: "Amar de verdade" },
        { term: "Igarapé", meaning: "Caminho de canoa entre as águas" },
      ],
      verseReference: "1 João 3:18",
      verseChunks: [
        "Filhinhos,",
        "não amemos",
        "de palavra,",
        "nem de língua,",
        "mas por obra",
        "e em verdade.",
      ],
      timeLimitSeconds: 60,
    },
    schoolChallenge: {
      title: "Missão na Escola • Amor na Prática",
      action:
        "Nesta semana, ajude um colega em uma atividade difícil ou ofereça apoio prático a alguém da sua sala antes mesmo de falar sobre igreja.",
      reflectionQuestion:
        "Quem na sua escola está passando por uma 'cheia difícil' e precisa ver o amor de Jesus através das suas atitudes?",
    },
    collectibleCard: {
      title: "Guardião das Águas da Amazônia",
      rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
      regionBadge: "RIO NEGRO • ACAJATUBA",
      powerQuote:
        "Onde o barco do serviço aporta, o Evangelho da graça floresce.",
      accentFrom: "from-emerald-400",
      accentTo: "to-teal-600",
    },
    rewardXp: 150,
    rewardWisdom: 40,
    medalId: "medal_amazonia",
    medalName: "Embaixador das Águas",
  },
  {
    id: "janela1040",
    order: 2,
    title: "Janela 10/40",
    regionName: "Cidade Histórica • Norte da África",
    country: "Norte da África / Oriente Médio",
    coordinatesLabel: "31°37'N 07°59'W",
    mapPosition: { x: 49, y: 38 },
    emoji: "🕌",
    stampCode: "NA-1040-02",
    difficulty: "Intermediário",
    accentColor: "amber",
    spiritualChallenge: "Testemunho silencioso, perdão, honra cultural e Graça",
    shortDescription:
      "Em uma região com restrições à pregação pública, construa amizade sincera através do esporte e revele a diferença entre religião pesada e a Graça de Jesus.",
    npc: {
      id: "tariq",
      name: "Tariq",
      age: 15,
      role: "Craque de Futebol & Programador",
      bio: "Um adolescente brilhante, apaixonado por futebol e programação, mas que vive sob forte pressão familiar e acha que o Cristianismo é uma 'religião estrangeira que destrói tradições'.",
      avatarKey: "tariq",
    },
    briefing: {
      context:
        "Você participa de um projeto esportivo e de aulas de tecnologia para jovens locais. Aqui não é permitido fazer cultos na praça, mas sua vida é uma carta aberta todos os dias.",
      culturalTip:
        "Em países com restrição na Janela 10/40, o respeito à família e à honra é fundamental. Nunca zombe da cultura local; construa amizades sinceras através do esporte, estudos e testemunho de paz.",
      dos: [
        "Honrar a hospitalidade local e demonstrar profundo respeito pelos mais velhos.",
        "Deixar suas atitudes de paz e integridade despertarem perguntas sinceras.",
        "Explicar que Jesus nasceu no Oriente Médio e oferece Graça, não cultura ocidental.",
      ],
      donts: [
        "Entrar em debates agressivos atacando a cultura ou a família do amigo.",
        "Confundir o Evangelho de Jesus com costumes políticos do Ocidente.",
        "Expor imprudentemente amigos locais que estão buscando a Cristo em segredo.",
      ],
    },
    turns: [
      {
        id: "j10-t1",
        sceneTitle: "Turno 1 • Depois da Partida de Futebol",
        npcMood: "Intrigado, entregando uma garrafa d'água na beira da quadra",
        npcSpeech:
          "Por que você não brigou com aquele cara depois daquela falta dura no jogo? Na minha rua, quem não revida é fraco.",
        prayerHint:
          "Em 1 Pedro 3:15 aprendemos a responder com mansidão e temor a quem pergunta a razão da nossa esperança. Mostre a força do perdão de Jesus!",
        prayerVerse: "1 Pedro 3:15 — 'Preparados para responder com mansidão e respeito.'",
        options: [
          {
            id: "j10-t1-hasty",
            tone: "hasty",
            text: "Porque a minha religião é melhor que a sua!",
            trustDelta: -25,
            xpReward: 5,
            feedback:
              "Gerou discussão e orgulho, afastando o coração de Tariq. O Evangelho não é competição de orgulho religioso!",
          },
          {
            id: "j10-t1-timid",
            tone: "timid",
            text: "Ah, eu só não gosto de confusão mesmo, deixa pra lá.",
            trustDelta: 15,
            xpReward: 20,
            feedback:
              "Manteve a paz, mas perdeu uma oportunidade de ouro que o próprio Tariq abriu para ouvir sobre Jesus!",
          },
          {
            id: "j10-t1-emp",
            tone: "empathetic",
            text: "Para mim, perdoar exige muito mais força do que revidar. Eu aprendi isso com Jesus: Ele tinha todo o poder do universo, mas escolheu amar e perdoar na cruz.",
            trustDelta: 40,
            xpReward: 60,
            feedback:
              "Impactante! Você despertou a curiosidade dele através do exemplo, como em 1 Pedro 3:15!",
            bibleRef: "1 Pedro 3:15",
          },
        ],
      },
      {
        id: "j10-t2",
        sceneTitle: "Turno 2 • O Medo da Rejeição",
        npcMood: "Olhando ao redor e falando baixinho com sinceridade",
        npcSpeech:
          "Eu já li partes do Evangelho escondido no celular e achei as palavras de Jesus incríveis... mas tenho medo de que Deus só aceite pessoas se elas forem perfeitas.",
        prayerHint:
          "Muitos jovens acham que precisam 'subir uma escada de obras' para Deus aceitá-los. Anuncie a boa notícia da Graça gratuita em Efésios 2:8-9!",
        prayerVerse: "Efésios 2:8-9 — 'Pela graça sois salvos, não vem de obras.'",
        options: [
          {
            id: "j10-t2-hasty",
            tone: "hasty",
            text: "É difícil mesmo! Você precisa cumprir uma lista enorme de regras primeiro para ver se Deus te aprova.",
            trustDelta: -20,
            xpReward: 5,
            feedback:
              "Cuidado! Isso é legalismo, o oposto do Evangelho. Nenhum ser humano se salva por mérito próprio.",
          },
          {
            id: "j10-t2-timid",
            tone: "timid",
            text: "Se você tentar ser um cara legal todo dia, acho que dá tudo certo no final.",
            trustDelta: 15,
            xpReward: 20,
            feedback:
              "Ser legal é bom, mas não tira a culpa nem traz certeza de salvação. Faltou apontar para a obra perfeita de Jesus na cruz!",
          },
          {
            id: "j10-t2-emp",
            tone: "empathetic",
            text: "Tariq, essa é a melhor notícia do Evangelho! Nenhum de nós consegue subir até Deus pelas próprias forças. Foi por isso que Deus desceu até nós em Jesus: a salvação é um presente de graça para quem confia Nele!",
            trustDelta: 60,
            xpReward: 75,
            feedback:
              "Você explicou a Graça com clareza e amor! Efésios 2:8-9 brilhou no coração de Tariq!",
            bibleRef: "Efésios 2:8-9",
          },
        ],
      },
    ],
    decoder: {
      gospelPillar: "Pilar 2 • Salvação pela Graça, não por Mérito",
      gospelExplanation:
        "Religião humana diz: 'Faça tudo perfeito para Deus te aceitar'. O Evangelho diz: 'Jesus já pagou o preço na cruz; receba pela fé!'",
      localLanguageName: "Árabe / Tamazight (Norte da África)",
      localWordsGlossary: [
        { term: "Salam", meaning: "Paz profunda" },
        { term: "Ni'mah", meaning: "Graça / Presente imerecido" },
        { term: "Injil", meaning: "O Evangelho (Boas Novas)" },
      ],
      verseReference: "Efésios 2:8",
      verseChunks: [
        "Porque pela graça",
        "sois salvos,",
        "por meio da fé;",
        "e isto não vem de vós,",
        "é dom de Deus.",
      ],
      timeLimitSeconds: 60,
    },
    schoolChallenge: {
      title: "Missão na Escola • Testemunho sob Pressão",
      action:
        "Quando alguém provocar, trapacear no jogo ou falar mal de outro na escola, escolha responder com equilíbrio e paz, sendo diferente sem ser arrogante.",
      reflectionQuestion:
        "As pessoas da sua turma conseguem notar Jesus na maneira como você reage quando é contrariado?",
    },
    collectibleCard: {
      title: "Sentinela da Janela 10/40",
      rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
      regionBadge: "JANELA 10/40 • NORTE DA ÁFRICA",
      powerQuote:
        "Onde as portas parecem fechadas, o perdão e a graça abrem caminhos invisíveis.",
      accentFrom: "from-amber-400",
      accentTo: "to-orange-600",
    },
    rewardXp: 180,
    rewardWisdom: 50,
    medalId: "medal_janela1040",
    medalName: "Pioneiro da Janela 10/40",
  },
  {
    id: "toquio",
    order: 3,
    title: "Metrópole Digital",
    regionName: "Shibuya & Akihabara • Tóquio",
    country: "Japão",
    coordinatesLabel: "35°40'N 139°45'E",
    mapPosition: { x: 83, y: 36 },
    emoji: "🌸",
    stampCode: "JP-TYO-03",
    difficulty: "Intermediário",
    accentColor: "cyan",
    spiritualChallenge: "Vencer a solidão, o perfeccionismo e achar valor em Cristo",
    shortDescription:
      "Em uma das cidades mais tecnológicas do planeta, menos de 1% conhece Jesus e milhares de jovens lutam contra a solidão e o medo de falhar.",
    npc: {
      id: "hina",
      name: "Hina",
      age: 14,
      role: "Estudante & Desenhista de Mangá",
      bio: "Estudante dedicada e desenhista de mangá que passa horas trancada no quarto sentindo que só tem valor se tirar notas máximas nas provas.",
      avatarKey: "hina",
    },
    briefing: {
      context:
        "Sua base em Tóquio promove um Clube Criativo de Arte, Música e Intercâmbio Cultural onde adolescentes japoneses encontram amizade segura após horas de cursinho.",
      culturalTip:
        "No Japão, as pessoas valorizam muito a harmonia e a educação, mas muitos jovens sofrem em silêncio com a pressão escolar e a solidão.",
      dos: [
        "Ser gentil, pontual e respeitar o espaço pessoal até a confiança crescer.",
        "Valorizar os talentos criativos e ouvir sem interromper.",
        "Apresentar Deus como Pai amoroso que nos ama antes de qualquer nota ou desempenho.",
      ],
      donts: [
        "Ser barulhento ou invasivo logo no primeiro contato.",
        "Minimizar o cansaço emocional dizendo 'isso é frescura'.",
        "Apresentar a fé cristã como mais uma cobrança pesada de performance.",
      ],
    },
    turns: [
      {
        id: "tyo-t1",
        sceneTitle: "Turno 1 • No Clube de Arte e Inglês da Missão",
        npcMood: "Envergonhada, recolhendo rapidamente as folhas de desenho do chão",
        npcSpeech:
          "Desculpe! Meus desenhos nunca são bons o suficiente... às vezes sinto que se eu tirasse nota baixa, ninguém mais se importaria comigo.",
        prayerHint:
          "Hina mede seu próprio valor por notas e aprovação externa. Mostre que o Criador a fez única e a ama incondicionalmente (Salmos 139:14 / Romanos 5:8)!",
        prayerVerse: "Salmos 139:14 — 'Eu te louvo porque me fizeste de modo especial e admirável.'",
        options: [
          {
            id: "tyo-t1-hasty",
            tone: "hasty",
            text: "Para de pensar em mangá e notas! Você só precisa ir à igreja domingo que passa.",
            trustDelta: -20,
            xpReward: 5,
            feedback:
              "Hina se sentiu incompreendida e guardou o caderno. Desprezar a arte e a dor dela fecha a porta da amizade.",
          },
          {
            id: "tyo-t1-timid",
            tone: "timid",
            text: "Seus desenhos são legais sim, não precisa cobrar tanto de você mesma.",
            trustDelta: 15,
            xpReward: 20,
            feedback:
              "Gentil, mas superficial. Você elogiou o desenho, porém ainda não mostrou onde está o verdadeiro valor eterno dela.",
          },
          {
            id: "tyo-t1-emp",
            tone: "empathetic",
            text: "Seus traços são lindos, Hina! E sabe de uma coisa? O Criador que desenhou as estrelas e as flores de cerejeira criou você como uma obra-prima única. O amor Dele por você não depende de um boletim escolar!",
            trustDelta: 50,
            xpReward: 65,
            feedback:
              "Você trouxe esperança ao coração dela usando Salmos 139:14 e Romanos 5:8!",
            bibleRef: "Salmos 139:14 • Romanos 5:8",
          },
        ],
      },
      {
        id: "tyo-t2",
        sceneTitle: "Turno 2 • Encontrando Descanso",
        npcMood: "Com os olhos marejados, segurando seu caderno com alívio",
        npcSpeech:
          "Uma obra-prima amada sem depender de notas... Existe mesmo um lugar onde eu possa descansar sem ter medo de falhar?",
        prayerHint:
          "Convide Hina a conhecer as próprias palavras de Jesus para todos os que vivem exaustos tentando provar seu valor (Mateus 11:28).",
        prayerVerse: "Mateus 11:28 — 'Vinde a mim, todos os que estais cansados, e eu vos aliviarei.'",
        options: [
          {
            id: "tyo-t2-hasty",
            tone: "hasty",
            text: "Só se você decorar todos os livros da Bíblia sem errar nenhum nome primeiro!",
            trustDelta: -20,
            xpReward: 5,
            feedback:
              "Ops! Você transformou o Evangelho em mais uma prova escolar estressante! Jesus oferece descanso, não cobrança.",
          },
          {
            id: "tyo-t2-timid",
            tone: "timid",
            text: "Aqui no nosso clube a gente sempre tenta relaxar e tomar chá juntos.",
            trustDelta: 15,
            xpReward: 20,
            feedback:
              "A comunhão da igreja é maravilhosa, mas o verdadeiro descanso da alma está na Pessoa de Jesus!",
          },
          {
            id: "tyo-t2-emp",
            tone: "empathetic",
            text: "Esse lugar é uma Pessoa: Jesus. Ele mesmo disse: 'Venham a mim todos os que estão cansados e sobrecarregados, e eu lhes darei descanso'.",
            trustDelta: 50,
            xpReward: 75,
            feedback:
              "Ponte 100% construída! Hina descobriu que em Jesus ela é completamente amada, perdoada e acolhida!",
            bibleRef: "Mateus 11:28",
          },
        ],
      },
    ],
    decoder: {
      gospelPillar: "Pilar 3 • Redenção e Descanso em Jesus",
      gospelExplanation:
        "Na cruz, Jesus levou nossas falhas, culpas e fardos pesados para nos dar paz verdadeira com Deus.",
      localLanguageName: "Japonês (Nihongo)",
      localWordsGlossary: [
        { term: "Ai (愛)", meaning: "Amor profundo" },
        { term: "Kibō (希望)", meaning: "Esperança viva" },
        { term: "Heiwa (平和)", meaning: "Paz e descanso" },
      ],
      verseReference: "Mateus 11:28",
      verseChunks: [
        "Vinde a mim,",
        "todos os que estais",
        "cansados e oprimidos,",
        "e eu",
        "vos aliviarei.",
      ],
      timeLimitSeconds: 55,
    },
    schoolChallenge: {
      title: "Missão na Escola • Antídoto contra a Solidão",
      action:
        "Sente-se perto de alguém que costuma ficar sozinho no recreio ou envie uma mensagem sincera encorajando um colega que está ansioso com provas.",
      reflectionQuestion:
        "Quem perto de você parece estar 'tudo bem por fora', mas precisa saber que é valioso para Deus?",
    },
    collectibleCard: {
      title: "Luz Neon de Esperança • Tóquio",
      rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
      regionBadge: "TÓQUIO • JAPÃO",
      powerQuote:
        "No meio de milhões de luzes artificiais, só a Luz de Cristo aquece um coração solitário.",
      accentFrom: "from-cyan-400",
      accentTo: "to-blue-600",
    },
    rewardXp: 200,
    rewardWisdom: 55,
    medalId: "medal_toquio",
    medalName: "Farol em Tóquio",
  },
  {
    id: "mocambique",
    order: 4,
    title: "Savana & Vilas",
    regionName: "Nampula • Território Macua",
    country: "Moçambique",
    coordinatesLabel: "15°07'S 39°16'E",
    mapPosition: { x: 57, y: 67 },
    emoji: "🌍",
    stampCode: "MZ-NMP-04",
    difficulty: "Avançado",
    accentColor: "violet",
    spiritualChallenge: "Tradução Bíblica para a língua materna e discipulado jovem",
    shortDescription:
      "Junte-se aos tradutores locais para colocar as Escrituras no idioma do coração do povo Macua e levantar uma nova geração de jovens discípulos!",
    npc: {
      id: "samora",
      name: "Samora",
      age: 11,
      role: "Pequeno Líder Comunitário da Vila",
      bio: "Um menino cheio de alegria e líder entre os amigos da vila, que sonha em ler histórias na língua materna do seu povo (Macua).",
      avatarKey: "samora",
    },
    briefing: {
      context:
        "Mais de mil povos no mundo ainda não têm a Bíblia completa na língua em que sonham e conversam em casa. Sua missão apoia uma oficina local de alfabetização e tradução bíblica!",
      culturalTip:
        "Na cultura local, a comunidade aprende cantando, trabalhando em equipe e ouvindo histórias ao redor da árvore central (Ubuntu). Quando uma pessoa ouve a Bíblia na língua do seu próprio coração, tudo muda!",
      dos: [
        "Celebrar a beleza do idioma local (Macua) e aprender saudações com humildade.",
        "Envolver a comunidade, os líderes da vila e as crianças através de música e oralidade.",
        "Encorajar os próprios moradores locais a serem multiplicadores do Evangelho.",
      ],
      donts: [
        "Tratar o idioma materno da vila como 'inferior' às línguas europeias.",
        "Fazer tudo sozinho sem capacitar os jovens locais para continuar a obra.",
        "Esquecer que Deus deseja adoradores de toda tribo, língua, povo e nação.",
      ],
    },
    turns: [
      {
        id: "moz-t1",
        sceneTitle: "Turno 1 • A Oficina de Tradução Bíblica",
        npcMood: "Curioso, tocando com cuidado as páginas dos cadernos de tradução",
        npcSpeech:
          "Deus fala a língua da minha avó também, ou Ele só entende a língua das cidades grandes?",
        prayerHint:
          "Mostre a visão gloriosa de Apocalipse 7:9! Deus criou a diversidade de povos e quer que toda língua ouça Suas maravilhas (Atos 2).",
        prayerVerse: "Apocalipse 7:9 — 'Uma grande multidão de todas as nações, tribos, povos e línguas!'",
        options: [
          {
            id: "moz-t1-hasty",
            tone: "hasty",
            text: "A língua da sua vila é muito difícil, é melhor todo mundo esquecer ela e só falar a nossa.",
            trustDelta: -20,
            xpReward: 5,
            feedback:
              "Que tristeza! Isso faz parecer que Deus é estrangeiro. A tradução bíblica honra a língua que Deus deu a cada povo!",
          },
          {
            id: "moz-t1-timid",
            tone: "timid",
            text: "Acho que Deus entende qualquer idioma sim, Ele é muito inteligente.",
            trustDelta: 15,
            xpReward: 20,
            feedback:
              "Verdade, mas você pode ir muito além mostrando como a própria Bíblia celebra todas as tribos e línguas diante do trono de Jesus!",
          },
          {
            id: "moz-t1-emp",
            tone: "empathetic",
            text: "Deus criou todas as línguas e ama a língua da sua família, Samora! Tanto que a visão do Céu em Apocalipse mostra pessoas de todas as tribos, povos e línguas louvando a Jesus juntas!",
            trustDelta: 50,
            xpReward: 70,
            feedback:
              "Maravilhoso! Os olhos de Samora brilharam ao saber que a língua Macua estará presente no louvor eterno do Céu (Apocalipse 7:9)!",
            bibleRef: "Apocalipse 7:9",
          },
        ],
      },
      {
        id: "moz-t2",
        sceneTitle: "Turno 2 • Multiplicando Discípulos",
        npcMood: "Radiante, lendo em voz alta o primeiro versículo em Macua!",
        npcSpeech:
          "Uau, quando eu leio em Macua parece que Jesus está sentado aqui debaixo da nossa árvore! Eu quero ensinar isso para todos os meus amigos da vila hoje mesmo!",
        prayerHint:
          "Missão verdadeira não cria dependência — ela levanta discípulos locais! Encoraje o chamado missionário de Samora mesmo aos 11 anos (1 Timóteo 4:12).",
        prayerVerse: "1 Timóteo 4:12 — 'Ninguém despreze a tua mocidade.'",
        options: [
          {
            id: "moz-t2-hasty",
            tone: "hasty",
            text: "Calma aí, você é só uma criança! Só adultos formados podem falar de Jesus.",
            trustDelta: -15,
            xpReward: 5,
            feedback:
              "Nunca apague a chama de um jovem! Deus usou Samuel, Davi, a menina serva de Naamã e Timóteo ainda muito jovens!",
          },
          {
            id: "moz-t2-timid",
            tone: "timid",
            text: "Espera mais uns anos para crescer um pouco e depois você conta para eles.",
            trustDelta: 15,
            xpReward: 20,
            feedback:
              "Não precisamos esperar para compartilhar uma boa notícia! Juniores e adolescentes já são parte viva da missão hoje.",
          },
          {
            id: "moz-t2-emp",
            tone: "empathetic",
            text: "Vamos juntos! Você mesmo pode ser um missionário aqui na sua vila, contando como Jesus venceu a morte e nos deu nova vida!",
            trustDelta: 50,
            xpReward: 80,
            feedback:
              "Incrível! Uma comunidade jovem de leitura bíblica e louvor nasceu debaixo da grande árvore de Nampula!",
            bibleRef: "Romanos 10:14-15 • Mateus 28:19-20",
          },
        ],
      },
    ],
    decoder: {
      gospelPillar: "Pilar 4 • Nova Vida e o Chamado para Enviar e Ir",
      gospelExplanation:
        "Quem encontra nova vida em Jesus passa a chama adiante para que todos os povos ouçam, creiam e invoquem o nome do Senhor!",
      localLanguageName: "Emakhuwa / Macua (Moçambique)",
      localWordsGlossary: [
        { term: "Muluku", meaning: "Deus Criador" },
        { term: "Ophenta", meaning: "Amor" },
        { term: "Murettele", meaning: "Paz e alegria comunitária" },
      ],
      verseReference: "Romanos 10:14",
      verseChunks: [
        "Como, pois, invocarão",
        "aquele em quem",
        "não creram?",
        "E como crerão",
        "naquele de quem",
        "não ouviram?",
      ],
      timeLimitSeconds: 65,
    },
    schoolChallenge: {
      title: "Missão na Escola • Voz da Esperança",
      action:
        "Ore por um amigo específico durante toda a semana, conte com suas próprias palavras algo que Jesus fez na sua vida e convide-o para o grupo de juniores ou adolescentes!",
      reflectionQuestion:
        "Se você não contar, quem na sua escola vai explicar o amor de Jesus na linguagem que seus amigos entendem?",
    },
    collectibleCard: {
      title: "Voz das Nações • Tradutor de Nampula",
      rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
      regionBadge: "NAMPULA • MOÇAMBIQUE",
      powerQuote:
        "Quando a Bíblia fala a língua da avó e da criança, uma geração inteira desperta para Cristo.",
      accentFrom: "from-violet-400",
      accentTo: "to-fuchsia-600",
    },
    rewardXp: 230,
    rewardWisdom: 65,
    medalId: "medal_mocambique",
    medalName: "Tradutor Fiel",
  },
];

export const PRAYER_CARDS: PrayerCard[] = [
  {
    id: "pray-amazonia",
    missionId: "amazonia",
    region: "Amazônia Ribeirinha (Brasil)",
    title: "Carta dos Barcos-Hospitais no Rio Negro",
    churchReport:
      "Existem milhares de comunidades ribeirinhas na Amazônia acessíveis apenas por horas ou dias de barco. Equipes missionárias levam médicos, dentistas, água limpa e discipulado bíblico!",
    prayerPoints: [
      "Ore pela segurança das equipes navegando pelos rios na época de cheias e secas.",
      "Ore pelas crianças e adolescentes ribeirinhos como Cauã, para crescerem firmes na Palavra.",
    ],
    wisdomReward: 20,
  },
  {
    id: "pray-janela1040",
    missionId: "janela1040",
    region: "Janela 10/40 (Norte da África & Oriente Médio)",
    title: "Carta da Igreja Secreta na Janela 10/40",
    churchReport:
      "A 'Janela 10/40' concentra a maioria dos povos menos alcançados do mundo. Muitos adolescentes estão conhecendo Jesus através de amizades genuínas e Bíblias digitais no celular!",
    prayerPoints: [
      "Ore por coragem, proteção e comunhão para jovens que seguem a Jesus em locais com restrição.",
      "Ore para que obreiros cristãos reflitam o perdão e a mansidão de Cristo no trabalho e no esporte.",
    ],
    wisdomReward: 20,
  },
  {
    id: "pray-toquio",
    missionId: "toquio",
    region: "Tóquio Secular (Japão)",
    title: "Carta dos Clubes Jovens no Japão",
    churchReport:
      "O Japão é próspero e seguro, mas menos de 1% da população segue a Jesus. Muitos estudantes enfrentam ansiedade extrema e solidão sem saber que são amados por Deus.",
    prayerPoints: [
      "Ore para que os estudantes japoneses encontrem descanso e identidade verdadeira em Jesus.",
      "Ore pelas igrejas locais e clubes de arte, música e esportes que acolhem adolescentes em Tóquio.",
    ],
    wisdomReward: 20,
  },
  {
    id: "pray-mocambique",
    missionId: "mocambique",
    region: "Nampula (Moçambique, África)",
    title: "Carta das Equipes de Tradução Bíblica",
    churchReport:
      "Em Moçambique e em toda a África, tradutores nacionais e missionários trabalham juntos para traduzir o Novo Testamento e a Bíblia em áudio para centenas de línguas maternas!",
    prayerPoints: [
      "Ore pelos tradutores bíblicos locais que dedicam anos para escolher cada palavra com fidelidade.",
      "Ore pelas crianças e líderes jovens das vilas para multiplicarem o Evangelho com alegria.",
    ],
    wisdomReward: 20,
  },
];
