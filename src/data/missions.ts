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
  {
    id: "sertao",
    order: 5,
    title: "Sertão & Caatinga",
    regionName: "Vale do São Francisco • Comunidade do Poço Novo",
    country: "Brasil",
    coordinatesLabel: "09°23'S 40°30'W",
    mapPosition: { x: 38, y: 60 },
    emoji: "🌵",
    stampCode: "BR-SER-05",
    difficulty: "Intermediário",
    accentColor: "amber",
    spiritualChallenge: "Água Viva, combate à seca com poços artesianos e fé inabalável",
    shortDescription:
      "Viaje pelo sertão nordestino perfurando poços artesianos, distribuindo mudas resistentes e revelando que Jesus é a fonte de Água Viva que nunca seca.",
    npc: {
      id: "mateus",
      name: "Mateus",
      age: 13,
      role: "Jovem Sertanejo & Guardião da Cisterna",
      bio: "Menino trabalhador de olhar esperançoso, que ajuda a puxar água da cisterna comunitária e sonha em ver o sertão florescer com o amor de Deus.",
      avatarKey: "mateus",
    },
    briefing: {
      context:
        "Sua equipe missionária chegou com uma perfuratriz de poço artesiano, placas solares e sementes de palma forrageira após meses de seca severa.",
      culturalTip:
        "O povo sertanejo tem uma dignidade profunda e uma rica tradição de versos de cordel, hospitalidade e fé. Nunca trate a comunidade com coitadismo; admire a fibra e a sabedoria da terra.",
      dos: [
        "Elogiar o esforço e a força das famílias que constroem a vida no semiárido.",
        "Ajudar a carregar canos, baldes e cavar valas antes de pregar.",
        "Usar a Bíblia para mostrar que Deus faz brotar rios no deserto (Isaías 43:19).",
      ],
      donts: [
        "Desperdiçar uma única gota de água na presença dos moradores.",
        "Subestimar o conhecimento das famílias sobre o clima e a terra.",
        "Prometer obras governamentais fora do alcance da missão.",
      ],
    },
    turns: [
      {
        id: "ser-t1",
        sceneTitle: "Turno 1 • A Chegada no Terreiro da Cisterna",
        npcMood: "Observando a caminhonete com baldes de água nos braços",
        npcSpeech:
          "Vocês vieram de tão longe debaixo desse sol quente só pra cavar buraco de poço na nossa comunidade?",
        prayerHint:
          "Peça graça para demonstrar que o amor de Jesus nos move aos lugares mais difíceis e esquecidos.",
        prayerVerse: "Isaías 41:17-18 — Os aflitos buscam água; Eu, o Senhor, não os desampararei.",
        options: [
          {
            id: "ser-t1-hasty",
            tone: "hasty",
            text: "Viemos porque temos um projeto social obrigatório para cumprir.",
            trustDelta: -15,
            xpReward: 5,
            feedback: "Mateus sentiu frieza institucional. Jesus nos envia por amor compassivo, não por obrigação.",
          },
          {
            id: "ser-t1-timid",
            tone: "timid",
            text: "Viemos tentar achar água, mas pode ser que dê seca de novo...",
            trustDelta: 10,
            xpReward: 15,
            feedback: "Faltou fé e encorajamento no poder de Deus para abençoar a comunidade.",
          },
          {
            id: "ser-t1-emp",
            tone: "empathetic",
            text: "Oi Mateus! Viemos porque Deus ama demais você e cada família daqui. Vamos juntos cavar esse poço e buscar a água limpa que vocês tanto merecem!",
            trustDelta: 35,
            xpReward: 45,
            feedback: "Excelente! Amor prático e esperança viva como ensina Isaías 41:17!",
            bibleRef: "Isaías 41:17",
          },
        ],
      },
      {
        id: "ser-t2",
        sceneTitle: "Turno 2 • A Água Viva que Brota da Rocha",
        npcMood: "Com o rosto brilhando ao ver os canos jorrarem água cristalina",
        npcSpeech:
          "A água jorrou! Parece milagre! Mas por que às vezes parece que a vida aqui é só poeira e sofrimento?",
        prayerHint:
          "Conecte o milagre da água com a conversa de Jesus e a mulher samaritana junto ao poço.",
        prayerVerse: "João 4:14 — Aquele que beber da água que Eu lhe der nunca mais terá sede.",
        options: [
          {
            id: "ser-t2-hasty",
            tone: "hasty",
            text: "Isso é castigo do sertão, vocês deviam mudar de cidade logo.",
            trustDelta: -20,
            xpReward: 5,
            feedback: "Desrespeitou as raízes do sertanejo. Deus planta famílias com propósito onde elas estão.",
          },
          {
            id: "ser-t2-timid",
            tone: "timid",
            text: "A vida é dura mesmo, fazer o que né...",
            trustDelta: 10,
            xpReward: 15,
            feedback: "Perdeu a chance de proclamar a fonte eterna de renovo em Cristo.",
          },
          {
            id: "ser-t2-emp",
            tone: "empathetic",
            text: "Mateus, Jesus uma vez sentou num poço quente e disse que Ele mesmo é a Água Viva. Quando temos Ele dentro de nós, mesmo no meio da seca mais braba a nossa alma floresce!",
            trustDelta: 40,
            xpReward: 50,
            feedback: "Perfeito! Apresentou a mensagem de João 4:14 de forma contextualizada e transformadora!",
            bibleRef: "João 4:14",
          },
        ],
      },
      {
        id: "ser-t3",
        sceneTitle: "Turno 3 • A Capela da Esperança no Sertão",
        npcMood: "Reunindo as crianças do povoado com um sorriso de orelha a orelha",
        npcSpeech:
          "Eu quero aprender mais dessa Palavra de Deus pra ensinar meu avô e meus primos aqui na vila!",
        prayerHint:
          "Encoraje Mateus a ser o primeiro jovem líder e discipulador da comunidade dele.",
        prayerVerse: "2 Timóteo 2:2 — Transmita a pessoas fiéis que sejam capazes de ensinar outros.",
        options: [
          {
            id: "ser-t3-hasty",
            tone: "hasty",
            text: "Você ainda é muito novinho, deixa isso pros adultos.",
            trustDelta: -10,
            xpReward: 5,
            feedback: "Nunca descarte uma criança ou adolescente chamado por Deus como Timóteo ou Davi!",
          },
          {
            id: "ser-t3-timid",
            tone: "timid",
            text: "Vou deixar uma revistinha com você, quem sabe você lê depois.",
            trustDelta: 15,
            xpReward: 20,
            feedback: "Foi morno. Discipulado exige mentoria próxima e investimento pessoal.",
          },
          {
            id: "ser-t3-emp",
            tone: "empathetic",
            text: "Mateus, você é o enviado de Deus para essa terra! Vamos começar hoje: vou te dar este Novo Testamento ilustrado e vamos orar juntos pela sua família agora!",
            trustDelta: 45,
            xpReward: 60,
            feedback: "Extraordinário! Levantou um discípulo sertanejo para a glória do Reino de Deus!",
            bibleRef: "2 Timóteo 2:2",
          },
        ],
      },
    ],
    decoder: {
      gospelPillar: "Água Viva & Transformação no Deserto",
      gospelExplanation:
        "Assim como a água sacia a terra ressequida, a graça de Jesus regenera e faz florescer a vida humana.",
      localLanguageName: "Dialeto Sertanejo / Cordel Bíblico",
      localWordsGlossary: [
        { term: "Açude", meaning: "Represa que guarda a esperança da comunidade" },
        { term: "Cisterna", meaning: "Reservatório de água limpa da chuva" },
        { term: "Água Viva", meaning: "A presença purificadora e eterna do Espírito Santo" },
      ],
      verseReference: "Isaías 44:3",
      verseChunks: [
        "Porque derramarei água",
        "sobre o sedento",
        "e rios sobre a terra seca;",
        "derramarei o meu Espírito",
        "sobre a tua posteridade",
      ],
      timeLimitSeconds: 60,
    },
    schoolChallenge: {
      title: "Missão na Escola • Fonte no Deserto",
      action:
        "Compartilhe uma garrafa de água ou lanche com alguém que esqueceu na escola e seja um agente de paz onde houver brigas e fofocas.",
      reflectionQuestion:
        "Como a sua presença no colégio pode refrescar e acalmar o ambiente ao seu redor como água fresca?",
    },
    collectibleCard: {
      title: "Guardião da Água Viva • Sertão da Fé",
      rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
      regionBadge: "SERTÃO • VALE DO SÃO FRANCISCO",
      powerQuote:
        "Onde abundava a aridez da seca, agora transborda a torrente inesgotável da graça de Cristo.",
      accentFrom: "from-amber-400",
      accentTo: "to-orange-600",
    },
    rewardXp: 240,
    rewardWisdom: 70,
    medalId: "medal_sertao",
    medalName: "Pioneiro da Caatinga",
  },
  {
    id: "andes",
    order: 6,
    title: "Cordilheira dos Andes",
    regionName: "Vales de Cusco & Pisac • Altiplano Quechua",
    country: "Peru / Bolívia",
    coordinatesLabel: "13°31'S 71°58'W",
    mapPosition: { x: 28, y: 66 },
    emoji: "🏔️",
    stampCode: "PE-AND-06",
    difficulty: "Avançado",
    accentColor: "sky",
    spiritualChallenge: "Superação de barreiras de altitude, hospitalidade andina e Bíblia em Quechua",
    shortDescription:
      "Escale vales andinos de alta altitude levando agasalhos térmicos, atendimento médico e o Evangelho na língua nativa dos povos Quechua.",
    npc: {
      id: "yara",
      name: "Yara",
      age: 14,
      role: "Jovem Pastora & Tecelã Andina",
      bio: "Menina meiga e corajosa que cuida de rebanhos de lhamas nos altos terraços e sonha em aprender a ler as Escrituras no seu próprio idioma nativo.",
      avatarKey: "yara",
    },
    briefing: {
      context:
        "Sua equipe subiu a 3.800 metros de altitude com agasalhos de lã, botas infantis e cópias impressas do Evangelho traduzidas em Quechua Cusco.",
      culturalTip:
        "Os povos andinos têm grande reverência pela família, pelas montanhas (Apus) e pela tecelagem tradicional. Demonstre respeito profundo pelas vestimentas tradicionais (polleras e chullos) e compartilhe Jesus como o verdadeiro Criador dos montes.",
      dos: [
        "Aprender saudações básicas em Quechua ('Allillanchu?').",
        "Valorizar a arte têxtil e a história das famílias com admiração sincera.",
        "Cuidar do cansaço e apoiar os idosos nos caminhos íngremes de pedra.",
      ],
      donts: [
        "Menosprezar crenças ancestrais com grosseria em vez de diálogo gracioso.",
        "Correr na altitude arriscando passar mal com o mal da montanha (soroche).",
        "Negar uma xícara de chá de ervas oferecida pelos anciãos.",
      ],
    },
    turns: [
      {
        id: "and-t1",
        sceneTitle: "Turno 1 • No Terraço de Pastoreio",
        npcMood: "Tecendo fios coloridos de lã enquanto vigia o rebanho",
        npcSpeech:
          "O vento aqui no alto é cortante e pouca gente sobe até nossa aldeia. O que trouxe vocês aqui em cima?",
        prayerHint:
          "Lembre-se do Salmo 121: os olhos que olham para os montes sabem que o socorro vem do Senhor Criador dos céus e da terra.",
        prayerVerse: "Salmo 121:1-2 — Elevo os meus olhos para os montes; de onde virá o meu socorro? O meu socorro vem do Senhor.",
        options: [
          {
            id: "and-t1-hasty",
            tone: "hasty",
            text: "Subimos rápido pra entregar essas roupas e descer logo pro hotel na cidade.",
            trustDelta: -20,
            xpReward: 5,
            feedback: "Yara sentiu frieza. Missões nas montanhas exige presença, paciência e calor humano.",
          },
          {
            id: "and-t1-timid",
            tone: "timid",
            text: "O ar é tão ralo aqui... quase desisti na metade da subida.",
            trustDelta: 5,
            xpReward: 10,
            feedback: "Reclamar da altitude desanima o anfitrião que mora ali todos os dias.",
          },
          {
            id: "and-t1-emp",
            tone: "empathetic",
            text: "Allillanchu, Yara! Subimos porque o Deus que criou esses montes majestosos conhece você pelo nome e enviou agasalhos e o amor d'Ele até esta colina!",
            trustDelta: 40,
            xpReward: 50,
            feedback: "Excelente! Respeito cultural com o 'Allillanchu' e o coração do Salmo 121:1-2!",
            bibleRef: "Salmo 121:1-2",
          },
        ],
      },
      {
        id: "and-t2",
        sceneTitle: "Turno 2 • As Cores da Promessa",
        npcMood: "Segurando uma manta tecida com fios vermelhos, azuis e dourados",
        npcSpeech:
          "Minha avó dizia que cada cor na nossa tecelagem conta uma história. A fé de vocês também tem história?",
        prayerHint:
          "Use a tecelagem como metáfora para explicar como Deus tece o plano da redenção na história humana.",
        prayerVerse: "Salmo 139:13 — Tu me teceste no ventre da minha mãe.",
        options: [
          {
            id: "and-t2-hasty",
            tone: "hasty",
            text: "Tecelagem não importa, o que importa é a doutrina bíblica que você tem que decorar.",
            trustDelta: -15,
            xpReward: 5,
            feedback: "Desvalorizou o dom cultural dela. Deus ama usar as artes locais para revelar Seu coração.",
          },
          {
            id: "and-t2-timid",
            tone: "timid",
            text: "Tem sim, é uma história antiga lá de Israel.",
            trustDelta: 15,
            xpReward: 20,
            feedback: "Faltou trazer a história para a vida presente de Yara.",
          },
          {
            id: "and-t2-emp",
            tone: "empathetic",
            text: "Yara, a Bíblia diz que Deus teceu você com amor desde o ventre materno! E na cruz, Jesus teceu um manto de perdão e vida eterna que veste toda pessoa que n'Ele crê!",
            trustDelta: 45,
            xpReward: 55,
            feedback: "Extraordinário! Conectou a arte da tecelagem ao Salmo 139:13 e ao sacrifício de Cristo!",
            bibleRef: "Salmo 139:13",
          },
        ],
      },
      {
        id: "and-t3",
        sceneTitle: "Turno 3 • O Livro na Língua do Coração",
        npcMood: "Folheando com emoção o Evangelho em Quechua",
        npcSpeech:
          "Eu consigo entender as palavras escritas aqui na língua da minha mãe! Isso é o que Deus fala pra nós?",
        prayerHint:
          "Celebre o poder da Bíblia na língua materna e comissione Yara a ler para sua aldeia.",
        prayerVerse: "Apocalipse 7:9 — De todas as nações, tribos, povos e línguas diante do Cordeiro.",
        options: [
          {
            id: "and-t3-hasty",
            tone: "hasty",
            text: "É sim, mas você tem que aprender espanhol ou inglês se quiser ser líder.",
            trustDelta: -10,
            xpReward: 5,
            feedback: "Deus fala perfeitamente em Quechua! Nunca menospreze a língua materna de nenhum povo.",
          },
          {
            id: "and-t3-timid",
            tone: "timid",
            text: "É isso aí, pode guardar pra você ler de noite.",
            trustDelta: 15,
            xpReward: 20,
            feedback: "Poderia ter encorajado Yara a compartilhar com toda a família dela.",
          },
          {
            id: "and-t3-emp",
            tone: "empathetic",
            text: "Sim, Yara! Deus ama o povo Quechua e fala direto ao seu coração na sua própria língua! Que você seja a voz que lê essas promessas para os anciãos da sua aldeia!",
            trustDelta: 50,
            xpReward: 65,
            feedback: "Perfeito! Apocalipse 7:9 em ação: cada língua louvando ao Rei Jesus!",
            bibleRef: "Apocalipse 7:9",
          },
        ],
      },
    ],
    decoder: {
      gospelPillar: "O Criador Supremo dos Montes & das Nações",
      gospelExplanation:
        "O Deus Altíssimo que fundou as montanhas é o mesmo que desceu em graça para nos acolher.",
      localLanguageName: "Quechua Cusco (Língua dos Andes)",
      localWordsGlossary: [
        { term: "Allillanchu", meaning: "Você está em paz? (Saudação de bênção)" },
        { term: "Yaku", meaning: "Água pura das montanhas" },
        { term: "Munakuy", meaning: "Amor profundo e compassivo de coração" },
      ],
      verseReference: "Salmo 95:4-5",
      verseChunks: [
        "Nas suas mãos estão",
        "as profundezas da terra,",
        "e as alturas dos montes",
        "são dele.",
        "Dele é o mar,",
        "pois ele o fez.",
      ],
      timeLimitSeconds: 65,
    },
    schoolChallenge: {
      title: "Missão na Escola • Respeito às Raízes",
      action:
        "Converse com um colega de outra região ou etnia sobre as histórias e costumes da família dele e mostre admiração sincera pela diversidade que Deus criou.",
      reflectionQuestion:
        "Como a beleza de povos e sotaques diferentes revela a grandiosidade e a criatividade de Deus?",
    },
    collectibleCard: {
      title: "Luz dos Picos Andinos • Pastora Quechua",
      rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
      regionBadge: "ANDES • CUSCO & PISAC",
      powerQuote:
        "Nos cumes mais altos onde o ar é rarefeito, a presença do Espírito Santo enche os pulmões de vigor eterno.",
      accentFrom: "from-sky-400",
      accentTo: "to-indigo-600",
    },
    rewardXp: 260,
    rewardWisdom: 75,
    medalId: "medal_andes",
    medalName: "Sentinela dos Andes",
  },
  {
    id: "himalaia",
    order: 7,
    title: "Vales do Himalaia",
    regionName: "Vales do Khumbu & Pokhara • Vilarejos de Pedra",
    country: "Nepal / Ásia Central",
    coordinatesLabel: "27°59'N 86°55'E",
    mapPosition: { x: 73, y: 38 },
    emoji: "❄️",
    stampCode: "NP-HIM-07",
    difficulty: "Avançado",
    accentColor: "cyan",
    spiritualChallenge: "Trilhas isoladas, pontes pênseis e aparelhos de áudio-Bíblia solar",
    shortDescription:
      "Cruze gargantas e pontes pênseis nos vales do Himalaia entregando aparelhos solares de Bíblia falada a vilarejos sem estradas de rodagem.",
    npc: {
      id: "tenzin",
      name: "Tenzin",
      age: 13,
      role: "Guia Mirim das Trilhas da Montanha",
      bio: "Garoto ágil nas trilhas de pedra que conduz expedições nos vales e quer entender por que Deus ama a todos os povos igualmente.",
      avatarKey: "tenzin",
    },
    briefing: {
      context:
        "Sua equipe cruzou desfiladeiros com mochilas de carga transportando MegaVoices (tocadores solares de áudio com as Escrituras em línguas tibeto-birmanesas).",
      culturalTip:
        "Nos vilarejos do Himalaia, o ritmo da vida é comunitário e a hospitalidade aos viajantes é uma questão de sobrevivência. Aceite o chá de manteiga com respeito e fale de Jesus com mansidão de espírito.",
      dos: [
        "Agradecer pelas refeições e caminhar no ritmo seguro das trilhas de montanha.",
        "Demonstrar os aparelhos solares de áudio ensinando as famílias a recarregá-los ao sol.",
        "Compartilhar que Jesus acalma tempestades e dissipa todo medo dos espíritos.",
      ],
      donts: [
        "Desrespeitar costumes dos anfitriões nas casas de pedra.",
        "Apressar decisões espirituais sem construir amizade e confiança.",
        "Esquecer de verificar as baterias e painéis solares dos equipamentos.",
      ],
    },
    turns: [
      {
        id: "him-t1",
        sceneTitle: "Turno 1 • Na Ponte Pênsil de Cabos de Aço",
        npcMood: "Ajustando as cordas da mochila na beira do desfiladeiro",
        npcSpeech:
          "Vocês cruzaram essa ponte balançando sobre o abismo só para trazer esses aparelhos pretos que tocam voz?",
        prayerHint:
          "Explique que o valor de uma única alma para Deus vale cruzar qualquer abismo ou montanha.",
        prayerVerse: "Isaías 52:7 — Quão formosos sobre os montes são os pés do que anuncia as boas-novas.",
        options: [
          {
            id: "him-t1-hasty",
            tone: "hasty",
            text: "Cruzamos porque somos corajosos e não temos medo de nada.",
            trustDelta: -15,
            xpReward: 5,
            feedback: "Orgulho pessoal não edifica. O que nos move é o amor sacrificial de Jesus.",
          },
          {
            id: "him-t1-timid",
            tone: "timid",
            text: "Eu quase morri de medo nessa ponte, mas mandaram a gente vir...",
            trustDelta: 10,
            xpReward: 15,
            feedback: "Faltou confiança no propósito missionário de Deus.",
          },
          {
            id: "him-t1-emp",
            tone: "empathetic",
            text: "Oi Tenzin! Cruzamos porque nos olhos de Deus você e as famílias dessa vila têm um valor infinito. Isaías diz que são formosos os pés dos que trazem boas notícias pelos montes!",
            trustDelta: 40,
            xpReward: 50,
            feedback: "Excelente! Respondeu com humildade e o verso precioso de Isaías 52:7!",
            bibleRef: "Isaías 52:7",
          },
        ],
      },
      {
        id: "him-t2",
        sceneTitle: "Turno 2 • A Voz que Fala no Silêncio dos Vales",
        npcMood: "Com o aparelho encostado no ouvido, surpreso com o áudio claro",
        npcSpeech:
          "Essa caixinha tá falando a língua do nosso vale! Quem é esse Jesus que fala palavras tão doces de perdão?",
        prayerHint:
          "Apresente Jesus como o Bom Pastor que dá a vida pelas ovelhas em qualquer pasto do mundo.",
        prayerVerse: "João 10:14 — Eu sou o bom pastor; conheço as minhas ovelhas, e elas me conhecem.",
        options: [
          {
            id: "him-t2-hasty",
            tone: "hasty",
            text: "É o fundador da nossa religião, depois você lê o catecismo.",
            trustDelta: -15,
            xpReward: 5,
            feedback: "Jesus não é mera religião, Ele é o Salvador vivo e pessoal!",
          },
          {
            id: "him-t2-timid",
            tone: "timid",
            text: "É alguém muito bom que viveu há muito tempo.",
            trustDelta: 15,
            xpReward: 20,
            feedback: "Muito superficial. Jesus ressuscitou e reina hoje!",
          },
          {
            id: "him-t2-emp",
            tone: "empathetic",
            text: "Tenzin, Jesus é o Bom Pastor que conhece a sua voz e deu a própria vida para perdoar nossos pecados e nos dar paz. Ele está ouvindo você agora mesmo aqui na montanha!",
            trustDelta: 45,
            xpReward: 60,
            feedback: "Perfeito! Apresentou o Evangelho vivo de João 10:14 com unção e clareza!",
            bibleRef: "João 10:14",
          },
        ],
      },
      {
        id: "him-t3",
        sceneTitle: "Turno 3 • Luz sobre as Cordilheiras",
        npcMood: "Reunindo os anciãos em volta do aparelho solar de áudio",
        npcSpeech:
          "Os mais velhos da aldeia estão chorando de alegria ouvindo a bênção de Deus no nosso dialeto!",
        prayerHint:
          "Agradeça a Deus pelo fruto missionário e ore com toda a família reunida na cabana.",
        prayerVerse: "Salmo 97:1 — O Senhor reina; regozije-se a terra; alegrem-se as muitas ilhas e montanhas.",
        options: [
          {
            id: "him-t3-hasty",
            tone: "hasty",
            text: "Agora que entregamos, temos que bater a meta e ir para a próxima vila correndo.",
            trustDelta: -10,
            xpReward: 5,
            feedback: "Nunca interrompa um momento sagrado do mover do Espírito com pressa!",
          },
          {
            id: "him-t3-timid",
            tone: "timid",
            text: "Legal, que bom que funcionou a bateria solar.",
            trustDelta: 15,
            xpReward: 20,
            feedback: "Foco puramente técnico. A glória é de Deus pela salvação!",
          },
          {
            id: "him-t3-emp",
            tone: "empathetic",
            text: "Glória a Deus, Tenzin! Vamos nos ajoelhar juntos agora e orar agradecendo a Jesus por trazer a luz da salvação a este vale para nunca mais se apagar!",
            trustDelta: 50,
            xpReward: 70,
            feedback: "Extraordinário! Concluiu com oração e adoração genuína ao Senhor!",
            bibleRef: "Salmo 97:1",
          },
        ],
      },
    ],
    decoder: {
      gospelPillar: "A Luz que Dissipa as Trevas das Montanhas",
      gospelExplanation:
        "O Evangelho quebra o medo espiritual e traz a paz soberana de Cristo a todos os lares.",
      localLanguageName: "Dialeto Sherpa / Nepalês do Himalaia",
      localWordsGlossary: [
        { term: "Namaste", meaning: "Saudação de paz e respeito mútuo" },
        { term: "Shanti", meaning: "A paz perfeita que só Deus concede" },
        { term: "Mukti", meaning: "Libertação e salvação em Cristo" },
      ],
      verseReference: "Isaías 9:2",
      verseChunks: [
        "O povo que andava em trevas",
        "viu uma grande luz;",
        "e sobre os que habitavam",
        "na terra da sombra da morte",
        "resplandeceu a luz.",
      ],
      timeLimitSeconds: 65,
    },
    schoolChallenge: {
      title: "Missão na Escola • Portador de Boas Notícias",
      action:
        "Descubra um colega que esteja triste, com medo ou passando por problemas em casa e reserve 5 minutos para ouvir, apoiar e dizer que ele não está sozinho.",
      reflectionQuestion:
        "Como a sua compaixão pode ser a 'ponte' que leva esperança a alguém isolado?",
    },
    collectibleCard: {
      title: "Voz do Himalaia • Guia das Alturas",
      rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
      regionBadge: "HIMALAIA • NEPAL & KHUMBU",
      powerQuote:
        "Nenhum vilarejo é remoto demais e nenhum abismo é fundo demais para impedir a chegada da Palavra de Deus.",
      accentFrom: "from-cyan-400",
      accentTo: "to-blue-600",
    },
    rewardXp: 280,
    rewardWisdom: 80,
    medalId: "medal_himalaia",
    medalName: "Desbravador do Himalaia",
  },
  {
    id: "europa",
    order: 8,
    title: "Metrópole de Acolhimento",
    regionName: "Praças & Centros de Refúgio • Atenas & Berlim",
    country: "Grécia / Alemanha",
    coordinatesLabel: "37°58'N 23°43'E",
    mapPosition: { x: 53, y: 35 },
    emoji: "🏛️",
    stampCode: "EU-REF-08",
    difficulty: "Especial",
    accentColor: "rose",
    spiritualChallenge: "Acolhimento a refugiados, superação de traumas e fraternidade global",
    shortDescription:
      "Sirva em centros de acolhimento internacionais servindo refeições quentes, oficinas de idiomas e mostrando que a família de Cristo não tem fronteiras.",
    npc: {
      id: "amira",
      name: "Amira",
      age: 14,
      role: "Jovem Voluntária & Tradutora de Refúgio",
      bio: "Garota resiliente e carinhosa que aprendeu novos idiomas após ser acolhida e agora dedica seu tempo a acolher crianças que chegam de zonas de conflito.",
      avatarKey: "amira",
    },
    briefing: {
      context:
        "Sua equipe voluntária atua em um centro de hospitalidade cristão que serve sopa quente, aulas de música, apoio escolar e Bíblias digitais para famílias recém-chegadas.",
      culturalTip:
        "Em centros de refúgio convivem pessoas de dezenas de etnias e traumas severos. Crie um ambiente onde o olhar acolhedor, a escuta atenta e o respeito humano façam cada pessoa se sentir segura e valorizada.",
      dos: [
        "Servir a comida com sorriso afetuoso e tratar cada pessoa como convidado de honra.",
        "Respeitar o silêncio de quem ainda está superando traumas de guerra ou perseguição.",
        "Ensinar palavras de encorajamento e orar abençoando as famílias com carinho.",
      ],
      donts: [
        "Fazer perguntas invasivas sobre perdas ou sofrimentos traumáticos passados.",
        "Expressar preconceitos nacionais ou barreiras culturais de qualquer tipo.",
        "Prometer vistos ou papéis jurídicos que dependem exclusivamente das autoridades.",
      ],
    },
    turns: [
      {
        id: "eur-t1",
        sceneTitle: "Turno 1 • No Refeitório Solidário",
        npcMood: "Organizando pratos de sopa com olhar vigilante e gentil",
        npcSpeech:
          "Muitas crianças que chegam aqui têm medo de falar porque perderam suas casas e amigos. Como vocês conseguem manter esse sorriso e amor no serviço?",
        prayerHint:
          "Compartilhe que o amor de Cristo nos acolheu primeiro quando éramos estrangeiros e nos fez filhos da mesma família.",
        prayerVerse: "Efésios 2:19 — Já não sois estrangeiros, mas concidadãos dos santos e membros da família de Deus.",
        options: [
          {
            id: "eur-t1-hasty",
            tone: "hasty",
            text: "A gente sorri porque o nosso país é mais rico e viemos aqui ajudar vocês.",
            trustDelta: -25,
            xpReward: 5,
            feedback: "Arrogância terrível. Toda ajuda cristã nasce da graça imerecida de Deus que nos iguala a todos.",
          },
          {
            id: "eur-t1-timid",
            tone: "timid",
            text: "É nosso dever de voluntário fazer cara boa durante o turno.",
            trustDelta: 10,
            xpReward: 15,
            feedback: "Faltou demonstrar a alegria verdadeira que brota do Espírito Santo.",
          },
          {
            id: "eur-t1-emp",
            tone: "empathetic",
            text: "Amira, sorrimos porque Jesus nos acolheu com tanto amor quando estávamos perdidos que queremos que cada criança aqui sinta que encontrou uma família que a ama de verdade!",
            trustDelta: 40,
            xpReward: 50,
            feedback: "Perfeito! Efésios 2:19 na prática: acolhimento que faz do forasteiro um irmão amado!",
            bibleRef: "Efésios 2:19",
          },
        ],
      },
      {
        id: "eur-t2",
        sceneTitle: "Turno 2 • A Aula de Música e Idiomas",
        npcMood: "Tocando acordes no violão com um grupo de crianças cantando",
        npcSpeech:
          "Quando nós cantamos juntos, parece que a dor da viagem e a saudade do nosso país diminuem um pouco...",
        prayerHint:
          "Mostre que o louvor a Deus cura a alma ferida e constrói um lar espiritual em qualquer lugar do mundo.",
        prayerVerse: "Salmo 147:3 — Ele sara os quebrantados de coração e cura-lhes as feridas.",
        options: [
          {
            id: "eur-t2-hasty",
            tone: "hasty",
            text: "Música é só distração, o que vocês precisam mesmo é de emprego.",
            trustDelta: -15,
            xpReward: 5,
            feedback: "Falta de sensibilidade emocional. A alma precisa de cura e consolo tanto quanto o corpo.",
          },
          {
            id: "eur-t2-timid",
            tone: "timid",
            text: "É bonito ver vocês cantando mesmo, parabéns.",
            trustDelta: 15,
            xpReward: 20,
            feedback: "Educado, mas perdeu a oportunidade de falar sobre o Médico dos corações.",
          },
          {
            id: "eur-t2-emp",
            tone: "empathetic",
            text: "A música do Reino traz o céu para perto da terra! Como diz o Salmo 147:3, Jesus cura os corações feridos e ampara cada lágrima. Você é um instrumento de cura de Deus aqui dentro!",
            trustDelta: 45,
            xpReward: 60,
            feedback: "Extraordinário! Encorajou Amira e proclamou a cura do Salmo 147:3!",
            bibleRef: "Salmo 147:3",
          },
        ],
      },
      {
        id: "eur-t3",
        sceneTitle: "Turno 3 • Uma Família sem Fronteiras",
        npcMood: "Com os olhos brilhando, segurando um livro de histórias bíblicas em árabe e grego",
        npcSpeech:
          "Eu quero dedicar a minha vida a abrir centros de acolhimento assim pelo mundo inteiro!",
        prayerHint:
          "Comissione Amira como uma embaixadora global do amor acolhedor de Cristo.",
        prayerVerse: "Mateus 25:35 — Pois tive fome, e me destes de comer; era estrangeiro, e me acolhestes.",
        options: [
          {
            id: "eur-t3-hasty",
            tone: "hasty",
            text: "É muito difícil, melhor você focar numa carreira que dê dinheiro rápido.",
            trustDelta: -15,
            xpReward: 5,
            feedback: "Não abafe a vocação ministerial e solidária que o Espírito Santo plantou nela!",
          },
          {
            id: "eur-t3-timid",
            tone: "timid",
            text: "Quem sabe um dia você consegue, se tiver apoio...",
            trustDelta: 15,
            xpReward: 20,
            feedback: "Muito tímido. O Senhor dos exércitos apoia aqueles que cuidam dos vulneráveis!",
          },
          {
            id: "eur-t3-emp",
            tone: "empathetic",
            text: "Amira, Jesus disse em Mateus 25 que toda vez que você acolhe o estrangeiro, acolhe a Ele próprio! Deus vai te usar de forma poderosa para levantar esperança em nações inteiras!",
            trustDelta: 50,
            xpReward: 70,
            feedback: "Triunfante! Mateus 25:35 em toda a sua força e beleza redentora!",
            bibleRef: "Mateus 25:35",
          },
        ],
      },
    ],
    decoder: {
      gospelPillar: "Acolhimento Fraternal & Concidadãos dos Santos",
      gospelExplanation:
        "Em Cristo Jesus, todas as barreiras de nacionalidade caem e somos todos irmãos na mesa do Pai.",
      localLanguageName: "Grego & Árabe de Acolhimento",
      localWordsGlossary: [
        { term: "Philoxenia", meaning: "Amor caloroso ao estrangeiro (hospitalidade cristã)" },
        { term: "Salam", meaning: "Paz completa e segurança de Deus" },
        { term: "Agape", meaning: "O amor incondicional e sacrificial de Deus" },
      ],
      verseReference: "Hebreus 13:1-2",
      verseChunks: [
        "Permaneça o amor fraternal.",
        "Não vos esqueçais",
        "da hospitalidade,",
        "porque por ela",
        "alguns, não o sabendo,",
        "hospedaram anjos.",
      ],
      timeLimitSeconds: 65,
    },
    schoolChallenge: {
      title: "Missão na Escola • Mesa Aberta",
      action:
        "Convide o aluno novo da sala ou alguém que não tem grupo de amigos para se sentar na sua mesa no intervalo e apresente-o à sua turma com alegria.",
      reflectionQuestion:
        "Como a hospitalidade simples no ambiente escolar reflete o banquete do Reino de Deus?",
    },
    collectibleCard: {
      title: "Coração sem Fronteiras • Embaixadora do Acolhimento",
      rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
      regionBadge: "EUROPA • ATENAS & BERLIM",
      powerQuote:
        "Onde os muros do mundo dividem as pessoas, a mesa de Cristo as une como irmãos para a eternidade.",
      accentFrom: "from-rose-400",
      accentTo: "to-pink-600",
    },
    rewardXp: 300,
    rewardWisdom: 85,
    medalId: "medal_europa",
    medalName: "Embaixador do Acolhimento",
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
  {
    id: "pray-sertao",
    missionId: "sertao",
    region: "Sertão & Caatinga (Brasil)",
    title: "Carta dos Povoados do Sertão Nordestino",
    churchReport:
      "Centenas de comunidades rurais e quilombolas no semiárido brasileiro sofrem com secas prolongadas. Equipes de perfuração de poços artesianos e discipulado estão plantando capelas vivas no sertão!",
    prayerPoints: [
      "Ore para que a água física e a Água Viva de Cristo alcancem cada povoado isolado.",
      "Ore pelas crianças e jovens como Mateus, para serem colunas de fé e serviço na comunidade.",
    ],
    wisdomReward: 25,
  },
  {
    id: "pray-andes",
    missionId: "andes",
    region: "Cordilheira dos Andes (Peru / Bolívia)",
    title: "Carta dos Povos Quechua nas Alturas",
    churchReport:
      "Nos altos cumes dos Andes, vilarejos preservam suas línguas originárias e costumes milenares. A distribuição da Bíblia na língua do coração está transformando famílias inteiras!",
    prayerPoints: [
      "Ore pelos pastores e obreiros nativos que caminham horas nas trilhas de altitude.",
      "Ore para que as novas gerações tenham acesso à alfabetização bíblica em Quechua.",
    ],
    wisdomReward: 25,
  },
  {
    id: "pray-himalaia",
    missionId: "himalaia",
    region: "Vales do Himalaia (Nepal / Ásia Central)",
    title: "Carta das Expedições nos Montes do Nepal",
    churchReport:
      "Em vales cercados por abismos, milhares de vilarejos de pedra ouvem pela primeira vez as Escrituras através de tocadores solares de áudio-Bíblia (MegaVoice) entregues a pé!",
    prayerPoints: [
      "Ore pela proteção física dos mensageiros cruzando pontes pênseis e trilhas íngremes.",
      "Ore para que a paz soberana de Cristo tome o lugar de todo medo ancestral.",
    ],
    wisdomReward: 25,
  },
  {
    id: "pray-europa",
    missionId: "europa",
    region: "Metrópoles de Refúgio (Grécia / Alemanha)",
    title: "Carta dos Centros de Acolhimento a Refugiados",
    churchReport:
      "Milhares de crianças e famílias de zonas de conflito encontram nos centros cristãos de acolhimento alimento, aulas de música, carinho humano e esperança viva em Cristo!",
    prayerPoints: [
      "Ore pela cura de traumas emocionais de crianças e adolescentes recém-chegados.",
      "Ore pelos voluntários e obreiros que dedicam suas vidas ao acolhimento fraternal diário.",
    ],
    wisdomReward: 30,
  },
];
