import { Mission, DialogueTurn, WordDecoderChallenge } from "@/types/game";

export interface MissionScenarioVariant {
  titleSuffix: string;
  spiritualChallenge: string;
  npcMoodInitial: string;
  turns: DialogueTurn[];
  decoder?: WordDecoderChallenge;
}

const MISSION_SCENARIOS: Record<string, MissionScenarioVariant[]> = {
  amazonia: [
    {
      titleSuffix: "• As Redes da Esperança",
      spiritualChallenge: "Cuidado prático, empatia na dor e histórias de Jesus pescador",
      npcMoodInitial: "Desconfiado, segurando uma rede de pesca rasgada no píer",
      turns: [
        {
          id: "amz-var1-t1",
          sceneTitle: "Turno 1 • A Chegada no Barco-Hospital",
          npcMood: "Desconfiado, segurando uma rede de pesca rasgada no píer",
          npcSpeech:
            "Vocês são como o pessoal que vem aqui só tirar foto, promete cestas e depois nunca mais volta?",
          prayerHint:
            "Peça sabedoria para demonstrar o amor de Cristo com humildade prática. Quando alguém já foi ferido por promessas vazias, o serviço abre portas.",
          prayerVerse: "1 João 3:18 — 'Não amemos de palavra, nem de língua, mas por obra e em verdade.'",
          options: [
            {
              id: "amz-v1-t1-hasty",
              tone: "hasty",
              text: "Não fale assim! Viemos de longe trazer a mensagem e você precisa escutar agora!",
              trustDelta: -20,
              xpReward: 5,
              feedback: "Cauã se fechou. Antes de pedir ouvidos, precisamos demonstrar compaixão sincera.",
            },
            {
              id: "amz-v1-t1-timid",
              tone: "timid",
              text: "Não somos ruins não... só trouxemos umas caixas de suprimentos rápidos.",
              trustDelta: 10,
              xpReward: 15,
              feedback: "Educado, porém distante. Perdeu a oportunidade de criar um laço genuíno de confiança.",
            },
            {
              id: "amz-v1-t1-emp",
              tone: "empathetic",
              text: "Oi Cauã! Eu entendo você ter essa desconfiança. Antes de qualquer coisa, posso sentar com você, te ajudar a remendar essa rede e ouvir como vocês estão passando?",
              trustDelta: 35,
              xpReward: 45,
              feedback: "Excelente! Como ensina 1 João 3:18, amor de Deus se mostra primeiro com atitude e verdade!",
              bibleRef: "1 João 3:18",
            },
          ],
        },
        {
          id: "amz-var1-t2",
          sceneTitle: "Turno 2 • A Dúvida no Meio da Floresta",
          npcMood: "Mais calmo, trançando os nós da rede ao seu lado",
          npcSpeech:
            "Se Deus é tão poderoso como falam, por que Ele deixaria nosso povo tão esquecido no meio desse rio gigante? Ninguém liga pra gente...",
          prayerHint:
            "Lembre-se dos primeiros discípulos na Galileia! Mostre como Jesus navegava e valorizava pescadores simples.",
          prayerVerse: "Marcos 1:16-17 — Jesus caminhava à beira do mar e chamou homens simples das redes.",
          options: [
            {
              id: "amz-v1-t2-hasty",
              tone: "hasty",
              text: "Isso é falta de fé sua! Quem reclama da vida não recebe bênção nenhuma.",
              trustDelta: -18,
              xpReward: 5,
              feedback: "Julgamento duro que aumentou a dor dele em vez de revelar o carinho do Pai.",
            },
            {
              id: "amz-v1-t2-timid",
              tone: "timid",
              text: "É triste mesmo morar tão isolado, a vida aqui é muito difícil.",
              trustDelta: 15,
              xpReward: 15,
              feedback: "Validou a tristeza, mas não apontou para a esperança viva de que Deus nunca esquece nenhum ribeirinho.",
            },
            {
              id: "amz-v1-t2-emp",
              tone: "empathetic",
              text: "Sabia que quando Jesus começou o ministério Dele na Terra, os primeiros amigos que Ele escolheu foram pescadores de barco como você e seu pai? Jesus cruzava rios sob tempestades só para encontrar uma única pessoa que precisava Dele!",
              trustDelta: 40,
              xpReward: 50,
              feedback: "Maravilhoso! Você conectou a realidade dele à história de Jesus em Marcos 1:16-17.",
              bibleRef: "Marcos 1:16-17",
            },
          ],
        },
        {
          id: "amz-var1-t3",
          sceneTitle: "Turno 3 • A Luz na Comunidade",
          npcMood: "Olhos brilhando de esperança e entusiasmo",
          npcSpeech:
            "Caramba... os amigos de Jesus eram pescadores de verdade?! Meu pai e a turma da vila precisam ouvir isso hoje à noite na fogueira do cais!",
          prayerHint:
            "Acolha com entusiasmo! Convide para estarem juntos e celebre como a Palavra toca o coração dos que vivem nas águas.",
          prayerVerse: "Salmos 107:29-30 — 'Fez cessar a tormenta e as ondas se acalmaram... e os levou ao porto desejado.'",
          options: [
            {
              id: "amz-v1-t3-hasty",
              tone: "hasty",
              text: "Só podem ir se todo mundo prometer ficar em silêncio ouvindo nosso sermão por horas.",
              trustDelta: -15,
              xpReward: 5,
              feedback: "Colocou exigências religiosas pesadas no momento em que a comunidade estava sedenta por amor.",
            },
            {
              id: "amz-v1-t3-timid",
              tone: "timid",
              text: "Se der tempo a gente passa lá, temos muito trabalho no barco.",
              trustDelta: 15,
              xpReward: 15,
              feedback: "Perdeu a celebração comunitária que selaria a missão com chave de ouro.",
            },
            {
              id: "amz-v1-t3-emp",
              tone: "empathetic",
              text: "Vamos adorar estar lá, Cauã! Vamos levar o violão, cantar com vocês na fogueira e agradecer a Deus por essa amizade linda que começou hoje na beira do rio!",
              trustDelta: 45,
              xpReward: 60,
              feedback: "Perfeito! Comunhão verdadeira e celebração da fé viva em Cristo!",
              bibleRef: "Salmos 107:29-30",
            },
          ],
        },
      ],
    },
    {
      titleSuffix: "• As Águas da Compaixão",
      spiritualChallenge: "Atendimento emergencial de saúde, socorro aos aflitos e fé na tempestade",
      npcMoodInitial: "Preocupado, segurando um remo molhado e olhando em direção às palafitas",
      turns: [
        {
          id: "amz-var2-t1",
          sceneTitle: "Turno 1 • A Emergência das Palafitas",
          npcMood: "Aflito com a subida repentina das águas",
          npcSpeech:
            "A cheia veio mais rápida hoje cedo e a água suja entrou no posto da vila! As crianças estão com sede e os filtros estragaram. Vocês trouxeram água limpa no barco?",
          prayerHint:
            "Quando a necessidade física é urgente, o primeiro testemunho do Evangelho é o alívio do sofrimento corporal.",
          prayerVerse: "Mateus 25:40 — 'Tive sede e me destes de beber; o que fizestes a um destes pequeninos, a Mim o fizestes.'",
          options: [
            {
              id: "amz-v2-t1-hasty",
              tone: "hasty",
              text: "Água é importante, mas o alimento espiritual é muito mais prioritário, sentem e ouçam!",
              trustDelta: -22,
              xpReward: 5,
              feedback: "Falta de discernimento. Quem está com sede precisa de água limpa antes de qualquer discurso.",
            },
            {
              id: "amz-v2-t1-timid",
              tone: "timid",
              text: "Trouxemos alguns galões, vou deixar lá no canto do píer e vocês pegam.",
              trustDelta: 12,
              xpReward: 15,
              feedback: "Útil, mas faltou envolvimento e calor humano ao ajudar.",
            },
            {
              id: "amz-v2-t1-emp",
              tone: "empathetic",
              text: "Trouxemos sim, Cauã! Nossos médicos e equipe já estão descarregando 50 filtros de cerâmica e galões potáveis. Me mostre onde estão as famílias mais necessitadas que vamos carregar juntos agora mesmo!",
              trustDelta: 38,
              xpReward: 50,
              feedback: "Glória a Deus! Mateus 25:40 em ação viva: servindo a Cristo nos pequeninos com prontidão.",
              bibleRef: "Mateus 25:40",
            },
          ],
        },
        {
          id: "amz-var2-t2",
          sceneTitle: "Turno 2 • O Medo do Trovão",
          npcMood: "Trêmulo olhando para o céu escuro que se aproxima",
          npcSpeech:
            "O céu tá ficando roxo de temporal... Quando chove torrencial assim de noite, o rio bate forte nas toras da casa e dá um pavor de tudo desabar!",
          prayerHint:
            "O medo do temporal é real e aterrorizante para uma criança ribeirinha. Conecte com o Senhor que é nosso refúgio e fortaleza.",
          prayerVerse: "Salmos 46:1-2 — 'Deus é o nosso refúgio e fortaleza, socorro bem presente nas tribulações.'",
          options: [
            {
              id: "amz-v2-t2-hasty",
              tone: "hasty",
              text: "Se você tivesse orado mais, não estaria sentindo esse medo bobo de chuva.",
              trustDelta: -20,
              xpReward: 5,
              feedback: "Invalidação emocional que gera culpa em vez de segurança.",
            },
            {
              id: "amz-v2-t2-timid",
              tone: "timid",
              text: "Tomara que não chova muito então, porque palafita molhada é perigoso.",
              trustDelta: 10,
              xpReward: 15,
              feedback: "Apenas reforçou o pânico do garoto sem trazer consolo bíblico.",
            },
            {
              id: "amz-v2-t2-emp",
              tone: "empathetic",
              text: "Eu sei como o estrondo do rio assusta, amigo. Mas o mesmo Jesus que acalmou o Mar da Galileia com uma única palavra está segurando as vigas da sua casa e a sua vida! Vamos fazer uma oração de proteção agora mesmo?",
              trustDelta: 42,
              xpReward: 55,
              feedback: "Sensacional! Trouxe a paz de Salmos 46:1 direto para o coração aflito dele.",
              bibleRef: "Salmos 46:1-2",
            },
          ],
        },
        {
          id: "amz-var2-t3",
          sceneTitle: "Turno 3 • A Paz que Permanece",
          npcMood: "Com sorriso de paz genuína e ombros relaxados",
          npcSpeech:
            "Pela primeira vez em semanas, meu coração ficou calmo de verdade. Quando você orou, senti um calor bom no peito... Vocês ensinam a orar assim?",
          prayerHint:
            "Ensine que a oração é uma conversa sincera de filho com o Pai amoroso.",
          prayerVerse: "Filipenses 4:6-7 — 'A paz de Deus, que excede todo o entendimento, guardará os vossos corações.'",
          options: [
            {
              id: "amz-v2-t3-hasty",
              tone: "hasty",
              text: "Você tem que decorar uma lista de rezas formais em ordem certa para funcionar.",
              trustDelta: -12,
              xpReward: 5,
              feedback: "Transformou a oração em rito frio quando ela é um diálogo amoroso.",
            },
            {
              id: "amz-v2-t3-timid",
              tone: "timid",
              text: "Depois o pastor do barco te explica direitinho quando tiver tempo.",
              trustDelta: 15,
              xpReward: 15,
              feedback: "Repassou a responsabilidade em um momento oportuno de discipulado.",
            },
            {
              id: "amz-v2-t3-emp",
              tone: "empathetic",
              text: "Ensino com muita alegria! Falar com Deus é tão simples quanto você conversar comigo aqui no cais. Ele ouve cada sussurro do seu coração ribeirinho dia e noite!",
              trustDelta: 44,
              xpReward: 60,
              feedback: "Brilhante! Conexão de fé viva e discipulado autêntico sob Filipenses 4:6-7!",
              bibleRef: "Filipenses 4:6-7",
            },
          ],
        },
      ],
    },
  ],

  toquio: [
    {
      titleSuffix: "• Conexões Verdadeiras",
      spiritualChallenge: "Acolhimento em meio ao isolamento moderno e pressão por sucesso",
      npcMoodInitial: "Sentado em frente aos múltiplos monitores no cyber café, cabisbaixo",
      turns: [
        {
          id: "tok-var1-t1",
          sceneTitle: "Turno 1 • O Silêncio do Bairro Neon",
          npcMood: "Exausto, ajustando fones de ouvido para não interagir",
          npcSpeech:
            "Aqui em Shibuya todo mundo anda com pressa e ninguém olha nos olhos. Se você veio tentar me vender um curso ou me dizer para 'me esforçar mais', por favor, me deixe em paz...",
          prayerHint:
            "Na cultura urbana japonesa de alta cobrança, a graça de Deus é o alívio que nenhuma empresa ou escola consegue dar.",
          prayerVerse: "Mateus 11:28 — 'Vinde a Mim, todos os que estais cansados e oprimidos, e Eu vos aliviarei.'",
          options: [
            {
              id: "tok-v1-t1-hasty",
              tone: "hasty",
              text: "Você está muito isolado! Tem que sair dessa cadeira e encarar a vida de frente agora!",
              trustDelta: -22,
              xpReward: 5,
              feedback: "Kenji colocou os fones e se isolou. Pressão adicional afasta quem já está sobrecarregado.",
            },
            {
              id: "tok-v1-t1-timid",
              tone: "timid",
              text: "Tóquio é muito agitada mesmo... vou ficar ali no meu canto então.",
              trustDelta: 8,
              xpReward: 10,
              feedback: "Recuou e deixou um jovem ferido na solidão dos monitores.",
            },
            {
              id: "tok-v1-t1-emp",
              tone: "empathetic",
              text: "Olá Kenji! Não vim te cobrar nada, nem dizer que você 'tem que fazer mais'. Vi o design incrível do jogo que você estava criando na tela. Você aceita um chá verde gelado e uns minutinhos só para descansar sem pressão?",
              trustDelta: 36,
              xpReward: 45,
              feedback: "Excelente! Demonstrou a graça acolhedora de Mateus 11:28 que descansa a alma aflita.",
              bibleRef: "Mateus 11:28",
            },
          ],
        },
        {
          id: "tok-var1-t2",
          sceneTitle: "Turno 2 • O Vazio por Trás do Sucesso",
          npcMood: "Aceitando o chá com respeito, tirando um dos lados do fone",
          npcSpeech:
            "Meus pais esperam que eu tire nota máxima para entrar na melhor corporação. Mas quando eu fecho os olhos de noite, sinto que se eu sumisse amanhã, ninguém notaria além de um número de funcionário a menos...",
          prayerHint:
            "Revele que para Deus nós não somos números nem currículos, mas filhos amados individualmente.",
          prayerVerse: "Salmos 139:14 — 'Eu Te louvo porque de um modo tão admirável e maravilhoso fui formado.'",
          options: [
            {
              id: "tok-v1-t2-hasty",
              tone: "hasty",
              text: "Pelo menos você tem uma família que cobra o seu futuro, outros nem têm isso!",
              trustDelta: -16,
              xpReward: 5,
              feedback: "Comparar dores desvaloriza o sentimento do outro e quebra a ponte de comunicação.",
            },
            {
              id: "tok-v1-t2-timid",
              tone: "timid",
              text: "A sociedade asiática é assim mesmo, muito competitiva.",
              trustDelta: 12,
              xpReward: 15,
              feedback: "Frio e conformista. Faltou a beleza transformadora do Evangelho.",
            },
            {
              id: "tok-v1-t2-emp",
              tone: "empathetic",
              text: "Kenji, para a sociedade você pode parecer apenas mais um crachá, mas para o Deus que desenhou o universo, você é único e insubstituível. Antes de você nascer, Ele já conhecia seu coração, suas ideias e seus sonhos!",
              trustDelta: 42,
              xpReward: 55,
              feedback: "Profundo! Salmos 139:14 tocou o ponto mais sensível da identidade dele.",
              bibleRef: "Salmos 139:14",
            },
          ],
        },
        {
          id: "tok-var1-t3",
          sceneTitle: "Turno 3 • A Luz que Renova",
          npcMood: "Comovido, olhando nos olhos pela primeira vez",
          npcSpeech:
            "Eu nunca ouvi alguém me dizer que tenho valor sem estar atrelado ao meu boletim escolar... Existe mesmo um Deus que me ama pelo que eu sou, e não pelo que eu produzo?",
          prayerHint:
            "Apresente o amor incondicional da Cruz de Cristo, onde fomos amados antes mesmo de fazer qualquer coisa.",
          prayerVerse: "Romanos 5:8 — 'Mas Deus prova o seu próprio amor para conosco pelo fato de ter Cristo morrido por nós, sendo nós ainda pecadores.'",
          options: [
            {
              id: "tok-v1-t3-hasty",
              tone: "hasty",
              text: "Sim, mas agora você precisa largar todos esses videogames e vir para os cultos diários.",
              trustDelta: -18,
              xpReward: 5,
              feedback: "Estragou um momento sagrado de revelação de amor com regras imediatistas.",
            },
            {
              id: "tok-v1-t3-timid",
              tone: "timid",
              text: "Existe sim, você pode pesquisar mais sobre isso no Google depois.",
              trustDelta: 15,
              xpReward: 15,
              feedback: "Faltou conduzir o jovem com calor humano no momento em que seu coração se abriu.",
            },
            {
              id: "tok-v1-t3-emp",
              tone: "empathetic",
              text: "Sim, Kenji! O amor Dele não é uma transação comercial: é um abraço gratuito e eterno. Em Jesus, você é livre do peso da perfeição, porque Ele já te amou por inteiro!",
              trustDelta: 45,
              xpReward: 65,
              feedback: "Incrível! A graça salvadora de Romanos 5:8 quebrou os grilhões do medo em Tóquio!",
              bibleRef: "Romanos 5:8",
            },
          ],
        },
      ],
    },
  ],

  janela1040: [
    {
      titleSuffix: "• O Chá da Sabedoria",
      spiritualChallenge: "Hospitalidade oriental, diálogo de honra e testemunho de mansidão",
      npcMoodInitial: "Acomodado sobre tapetes no bazar de especiarias com expressão vigilante",
      turns: [
        {
          id: "j10-var1-t1",
          sceneTitle: "Turno 1 • As Regras da Rota da Seda",
          npcMood: "Observando com calma o jovem estrangeiro que se aproxima",
          npcSpeech:
            "A paz esteja sobre você. No nosso bazar, um homem apressado tropeça no próprio manto. Por qual motivo um jovem ocidental caminha por estas vielas antigas?",
          prayerHint:
            "Nas culturas da Janela 10/40, a honra, os cumprimentos e a etiqueta do diálogo são o solo onde a semente do Evangelho brota.",
          prayerVerse: "Colossenses 4:6 — 'A vossa palavra seja sempre agradável, temperada com sal, para saberdes como deveis responder.'",
          options: [
            {
              id: "j10-v1-t1-hasty",
              tone: "hasty",
              text: "Vim aqui dizer que suas crenças estão erradas e vocês precisam se converter hoje!",
              trustDelta: -30,
              xpReward: 5,
              feedback: "Tariq se ofendeu profundamente. Desrespeitar a cultura bloqueia o testemunho de Cristo.",
            },
            {
              id: "j10-v1-t1-timid",
              tone: "timid",
              text: "Só estou turistando pelas barracas, vendo as roupas bonitas.",
              trustDelta: 10,
              xpReward: 15,
              feedback: "Superficial demais. Não gerou conversa significativa sobre a verdade.",
            },
            {
              id: "j10-v1-t1-emp",
              tone: "empathetic",
              text: "E sobre você a paz, respeitado Tariq! Vim aprender com a rica história do seu povo e compartilhar a paz que recebemos do Messias, que ensina a amar o próximo como a nós mesmos.",
              trustDelta: 36,
              xpReward: 45,
              feedback: "Excelente! Respondeu com sabedoria, cortesia e respeito como ensina Colossenses 4:6.",
              bibleRef: "Colossenses 4:6",
            },
          ],
        },
        {
          id: "j10-var1-t2",
          sceneTitle: "Turno 2 • O Chá da Fraternidade",
          npcMood: "Servindo o chá de menta fumegante em copos de vidro decorados",
          npcSpeech:
            "Você fala com gentileza rara para a sua idade. Mas muitos no mundo dizem que fé gera guerras e divisões. Como você vê o perdão entre os povos?",
          prayerHint:
            "Mostre o coração pacificador do Reino de Deus e como Jesus ensinou a abençoar até mesmo os inimigos.",
          prayerVerse: "Mateus 5:9 — 'Bem-aventurados os pacificadores, porque serão chamados filhos de Deus.'",
          options: [
            {
              id: "j10-v1-t2-hasty",
              tone: "hasty",
              text: "Quem não pensa igual a mim está condenado e não há perdão para injustos.",
              trustDelta: -25,
              xpReward: 5,
              feedback: "Intolerância que reforça estereótipos negativos contra o Evangelho.",
            },
            {
              id: "j10-v1-t2-timid",
              tone: "timid",
              text: "Pois é, o mundo é complicado, melhor cada um ficar na sua sem se meter.",
              trustDelta: 12,
              xpReward: 15,
              feedback: "Isolacionismo passivo que não proclama o poder redentor da Cruz.",
            },
            {
              id: "j10-v1-t2-emp",
              tone: "empathetic",
              text: "Jesus nos ensinou que os maiores homens não são os que erguem espadas, mas os pacificadores que têm a coragem de perdoar e curar feridas antigas. O perdão Dele é a ponte que nenhum ódio consegue derrubar!",
              trustDelta: 42,
              xpReward: 55,
              feedback: "Magnífico! Mateus 5:9 brilhou como testemunho incontestável no coração de Tariq.",
              bibleRef: "Mateus 5:9",
            },
          ],
        },
        {
          id: "j10-var1-t3",
          sceneTitle: "Turno 3 • A Aliança de Respeito",
          npcMood: "Colocando a mão direita sobre o peito em sinal de profunda estima",
          npcSpeech:
            "Suas palavras trouxeram um orvalho fresco ao meu coração neste dia quente. Se todos os enviados fossem amigos da paz como você, o mundo seria curado. Deixe-me abençoar sua jornada!",
          prayerHint:
            "Agradeça a hospitalidade e ore para que a luz do Evangelho continue brilhando nas famílias daquela cidade.",
          prayerVerse: "1 Pedro 3:15 — 'Estai sempre preparados para responder com mansidão e temor a qualquer que vos pedir a razão da esperança.'",
          options: [
            {
              id: "j10-v1-t3-hasty",
              tone: "hasty",
              text: "Não quero sua bênção se você não assinar uma confissão de fé agora!",
              trustDelta: -20,
              xpReward: 5,
              feedback: "Rejeição grosseira à hospitalidade oriental sagrada.",
            },
            {
              id: "j10-v1-t3-timid",
              tone: "timid",
              text: "Obrigado pelo chá, preciso correr para não perder meu voo.",
              trustDelta: 15,
              xpReward: 15,
              feedback: "Saída apressada que deixou de orar pela casa hospitaleira.",
            },
            {
              id: "j10-v1-t3-emp",
              tone: "empathetic",
              text: "Agradeço com toda a minha alma, honrado Tariq! Que o Deus de Abraão encha sua família e seu comércio de saúde, paz e que a luz de Jesus guarde seus passos em cada aurora!",
              trustDelta: 46,
              xpReward: 65,
              feedback: "Perfeito! Mansidão e testemunho de fé inesquecível segundo 1 Pedro 3:15!",
              bibleRef: "1 Pedro 3:15",
            },
          ],
        },
      ],
    },
  ],

  savana: [
    {
      titleSuffix: "• As Águas da Fraternidade",
      spiritualChallenge: "Solidariedade comunitária, valorização da vida e cânticos de esperança",
      npcMoodInitial: "Perto do poço com as crianças da aldeia, sorrindo calorosamente",
      turns: [
        {
          id: "sav-var1-t1",
          sceneTitle: "Turno 1 • A Dança de Boas-Vindas",
          npcMood: "Batendo palmas no ritmo dos tambores da aldeia",
          npcSpeech:
            "Monike! Bem-vindos à nossa terra! Aqui ensinamos: 'Eu sou porque nós somos' (Ubuntu). Vocês vieram para caminhar conosco ou para mandar na nossa gente?",
          prayerHint:
            "No coração da África, a comunidade caminha junta. Humildade para aprender e celebrar a cultura local é fundamental.",
          prayerVerse: "Gálatas 6:2 — 'Levai as cargas uns dos outros e assim cumprireis a lei de Cristo.'",
          options: [
            {
              id: "sav-v1-t1-hasty",
              tone: "hasty",
              text: "Viemos consertar o que vocês fazem errado e trazer progresso.",
              trustDelta: -26,
              xpReward: 5,
              feedback: "Arrogância paternalista que quebra o espírito de comunhão cristã.",
            },
            {
              id: "sav-v1-t1-timid",
              tone: "timid",
              text: "Nós só viemos distribuir esses pacotes de livros e comida.",
              trustDelta: 12,
              xpReward: 15,
              feedback: "Focou apenas no material sem valorizar a riqueza humana da comunidade.",
            },
            {
              id: "sav-v1-t1-emp",
              tone: "empathetic",
              text: "Viemos para caminhar lado a lado, Amina! Queremos aprender seus cantos, carregar água do poço com vocês e compartilhar o grande amor de Jesus que une todas as famílias da Terra numa só!",
              trustDelta: 38,
              xpReward: 50,
              feedback: "Maravilhoso! Gálatas 6:2 vivido na prática com respeito e coração aberto!",
              bibleRef: "Gálatas 6:2",
            },
          ],
        },
        {
          id: "sav-var1-t2",
          sceneTitle: "Turno 2 • A Fonte no Deserto",
          npcMood: "Puxando o balde d'água com força e suor no rosto",
          npcSpeech:
            "A seca deste ano secou as plantações e muitas mães estão cansadas. Às vezes o coração fica com sede de alegria e de futuro para essas crianças...",
          prayerHint:
            "Conecte o poço material com a promessa de Jesus à mulher samaritana: a Água Viva que jorra para a vida eterna.",
          prayerVerse: "João 4:14 — 'Aquele que beber da água que Eu lhe der nunca terá sede; antes, será nele uma fonte a jorrar para a vida eterna.'",
          options: [
            {
              id: "sav-v1-t2-hasty",
              tone: "hasty",
              text: "A seca é castigo do céu, vocês têm que jejuar mais!",
              trustDelta: -20,
              xpReward: 5,
              feedback: "Palavra pesada e insensível diante do sofrimento inocente.",
            },
            {
              id: "sav-v1-t2-timid",
              tone: "timid",
              text: "O clima do mundo está ficando difícil mesmo em todo canto.",
              trustDelta: 12,
              xpReward: 15,
              feedback: "Comentário genérico que não aponta para o consolo vivo do Senhor.",
            },
            {
              id: "sav-v1-t2-emp",
              tone: "empathetic",
              text: "Amina, enquanto nossos técnicos ajudam a perfurar o poço mais fundo para ter água abundante, Jesus quer matar a sede do coração da sua aldeia! Ele é a Fonte Inesgotável que faz brotar alegria até no solo mais seco!",
              trustDelta: 42,
              xpReward: 55,
              feedback: "Incrível! João 4:14 unindo ação humanitária e a Palavra da Vida!",
              bibleRef: "João 4:14",
            },
          ],
        },
        {
          id: "sav-var1-t3",
          sceneTitle: "Turno 3 • O Canto da Esperança",
          npcMood: "Crianças correndo ao redor rindo e cantando em coro",
          npcSpeech:
            "A água começou a jorrar do poço novo e a música voltou à aldeia! Hoje à noite, vamos nos sentar sob a Grande Baobá para celebrar. Você vai cantar com a gente?",
          prayerHint:
            "Celebre com júbilo! O Evangelho é festa e gratidão pelos milagres diários da provisão divina.",
          prayerVerse: "Isaías 12:3 — 'Com alegria tirareis águas das fontes da salvação.'",
          options: [
            {
              id: "sav-v1-t3-hasty",
              tone: "hasty",
              text: "Cantar não é meu trabalho, só vim supervisionar a obra.",
              trustDelta: -16,
              xpReward: 5,
              feedback: "Postura fria e burocrática que rejeita o abraço comunitário.",
            },
            {
              id: "sav-v1-t3-timid",
              tone: "timid",
              text: "Eu tenho um pouco de vergonha de dançar na frente de todo mundo.",
              trustDelta: 15,
              xpReward: 15,
              feedback: "Compreensível, mas aceitar o convite enche a comunidade de alegria.",
            },
            {
              id: "sav-v1-t3-emp",
              tone: "empathetic",
              text: "Com certeza, Amina! Vamos cantar a plenos pulmões sob as estrelas, agradecendo a Deus por cada gota de água limpa e por cada sorriso dessas crianças queridas!",
              trustDelta: 45,
              xpReward: 65,
              feedback: "Espetacular! Isaías 12:3 com alegria radiante e união inabalável!",
              bibleRef: "Isaías 12:3",
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Returns a cloned mission with procedurally selected turns, verses,
 * and cultural scenarios so that every single playthrough is fresh, realistic,
 * and educational!
 */
export function getDynamicMissionInstance(baseMission: Mission, seed?: number): Mission {
  const biomeKey = baseMission.id.toLowerCase();
  const variants = MISSION_SCENARIOS[biomeKey];

  if (!variants || variants.length === 0) {
    return { ...baseMission };
  }

  // Choose variant based on seed or random index
  const chosenIdx =
    typeof seed === "number"
      ? Math.abs(seed) % variants.length
      : Math.floor(Math.random() * variants.length);

  const selected = variants[chosenIdx];

  return {
    ...baseMission,
    title: `${baseMission.title} ${selected.titleSuffix}`,
    spiritualChallenge: selected.spiritualChallenge,
    turns: selected.turns.map((t) => ({
      ...t,
      options: [...t.options].sort(() => Math.random() - 0.5), // randomize option order so answers don't always appear in same order!
    })),
    decoder: selected.decoder || baseMission.decoder,
  };
}
