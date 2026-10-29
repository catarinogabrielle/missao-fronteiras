export interface ClickableVerse {
  ref: string;
  text: string;
}

export interface GospelStep {
  step: number;
  title: string;
  subtitle: string;
  emoji: string;
  accentClass: string;
  summary: string;
  recessTip: string;
  verses: ClickableVerse[];
}

export const GOSPEL_FOUR_STEPS: GospelStep[] = [
  {
    step: 1,
    title: "1. O Amor de Deus",
    subtitle: "Criação • Você não é um acidente!",
    emoji: "💛",
    accentClass: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    summary:
      "Deus criou o universo e fez você à imagem Dele com propósito, valor infinito e amor. Ele não é um chefe distante: Ele criou você para viver em amizade eterna com Ele.",
    recessTip:
      "Como dizer para um amigo: 'Cara, Deus não te criou por acaso. Seu valor não vem de curtidas ou notas, vem de Quem te desenhou para ser amado por Ele!'",
    verses: [
      {
        ref: "João 3:16",
        text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
      },
      {
        ref: "Salmos 139:14",
        text: "Eu te louvo porque me fizeste de modo especial e admirável. Tuas obras são maravilhosas!",
      },
      {
        ref: "Gênesis 1:27",
        text: "Criou Deus o ser humano à sua imagem; à imagem de Deus o criou.",
      },
    ],
  },
  {
    step: 2,
    title: "2. O Problema do Pecado",
    subtitle: "Queda • Por que o mundo está quebrado?",
    emoji: "💔",
    accentClass: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    summary:
      "Todos nós escolhemos seguir nosso próprio caminho em vez de confiar em Deus. A Bíblia chama essa rebeldia e egoísmo de pecado — um abismo que nos separa de um Deus santo e que nenhuma 'boa ação' nossa consegue apagar sozinha.",
    recessTip:
      "Como dizer para um amigo: 'Nenhum de nós é perfeito. Todo mundo já errou e tentou viver do próprio jeito, e esse abismo nos afastou da fonte da vida que é Deus.'",
    verses: [
      {
        ref: "Romanos 3:23",
        text: "Porque todos pecaram e destituídos estão da glória de Deus.",
      },
      {
        ref: "Isaías 59:2",
        text: "Mas as vossas iniquidades fazem separação entre vós e o vosso Deus.",
      },
      {
        ref: "Romanos 6:23",
        text: "Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna, por Cristo Jesus nosso Senhor.",
      },
    ],
  },
  {
    step: 3,
    title: "3. O Resgate em Jesus",
    subtitle: "Redenção • Deus construiu a Ponte!",
    emoji: "✝️",
    accentClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    summary:
      "Como não podíamos subir até Deus, Deus veio até nós! Jesus viveu sem nenhum pecado, morreu na cruz no nosso lugar pagando toda a nossa dívida e ressuscitou ao terceiro dia vencendo a morte!",
    recessTip:
      "Como dizer para um amigo: 'Religião é tentar subir até Deus fazendo força. O Evangelho é que Jesus desceu, morreu no nosso lugar na cruz e ressuscitou para ser a nossa Ponte!'",
    verses: [
      {
        ref: "Romanos 5:8",
        text: "Mas Deus prova o seu amor para conosco, em que Cristo morreu por nós, sendo nós ainda pecadores.",
      },
      {
        ref: "João 14:6",
        text: "Disse-lhe Jesus: Eu sou o caminho, e a verdade e a vida; ninguém vem ao Pai, senão por mim.",
      },
      {
        ref: "1 Pedro 3:18",
        text: "Porque também Cristo padeceu uma vez pelos pecados, o justo pelos injustos, para levar-nos a Deus.",
      },
    ],
  },
  {
    step: 4,
    title: "4. A Resposta da Fé",
    subtitle: "Nova Vida • Receba o presente e siga a Jesus!",
    emoji: "🌱",
    accentClass: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    summary:
      "Um presente precisa ser recebido! Quando nos arrependemos do pecado e confiamos em Jesus como nosso Salvador e Senhor, recebemos perdão completo, o Espírito Santo e nos tornamos filhos de Deus e embaixadores Dele!",
    recessTip:
      "Como dizer para um amigo: 'A salvação é um presente gratuito de Jesus! Você quer conversar com Ele agora em oração e entregar sua vida nas mãos Dele?'",
    verses: [
      {
        ref: "Efésios 2:8-9",
        text: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus. Não vem das obras, para que ninguém se glorie.",
      },
      {
        ref: "João 1:12",
        text: "Mas, a todos quantos o receberam, deu-lhes o poder de serem feitos filhos de Deus, aos que creem no seu nome.",
      },
      {
        ref: "Romanos 10:9",
        text: "Se com a tua boca confessares ao Senhor Jesus, e em teu coração creres que Deus o ressuscitou dentre os mortos, serás salvo.",
      },
    ],
  },
];

export const CULTURAL_GLOSSARY = [
  {
    term: "Missão Transcultural",
    category: "Conceito Missionário",
    meaning:
      "Atravessar fronteiras de idioma, costumes ou geografia para compartilhar o amor de Jesus de forma que o outro povo compreenda de verdade.",
  },
  {
    term: "Janela 10/40",
    category: "Geografia Espiritual",
    meaning:
      "Faixa entre os paralelos 10° e 40° ao norte do Equador (Norte da África, Oriente Médio e Ásia) onde vivem bilhões de pessoas que nunca ouviram o Evangelho claramente.",
  },
  {
    term: "Povos Não Alcançados",
    category: "Missiologia",
    meaning:
      "Grupos étnicos ou linguísticos onde ainda não há uma igreja local forte o bastante para evangelizar seu próprio povo sem apoio externo.",
  },
  {
    term: "Língua do Coração",
    category: "Tradução Bíblica",
    meaning:
      "O idioma materno em que uma pessoa pensa, chora, sonha e conversa com a família. Ouvir as Escrituras nessa língua transforma comunidades inteiras!",
  },
  {
    term: "Ubuntu",
    category: "Cultura Africana",
    meaning:
      "Princípio comunitário ('Eu sou porque nós somos') que valoriza a solidariedade, a partilha e o aprendizado coletivo na vila.",
  },
  {
    term: "Evangelho Integral",
    category: "Prática Bíblica",
    meaning:
      "Unir a proclamação fiel da salvação em Cristo com o cuidado prático pelas dores físicas, emocionais e sociais das pessoas (1 João 3:18).",
  },
];
