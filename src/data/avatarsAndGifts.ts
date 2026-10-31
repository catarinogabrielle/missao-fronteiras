import {
  Achievement,
  AvatarOption,
  GiftOption,
  SkinId,
  SkinOption,
} from "@/types/game";

export const DEFAULT_FREE_SKINS: SkinId[] = ["padrao"];

/** Skins that were free before the level-gating system (cannot be told apart from purchases). */
export const LEGACY_FREE_SKINS: SkinId[] = [
  "padrao",
  "cyber_neon",
  "explorador_selva",
  "street_gta",
];

export const SKIN_OPTIONS: SkinOption[] = [
  {
    id: "padrao",
    name: "Agente Tático Ide",
    rarity: "CLÁSSICA",
    unlockLevel: 1,
    tagline: "Traje oficial de campo da Base Ide com mochila e lâmina de luz.",
    accentHex: "#34d399",
    badgeEmoji: "🛡️",
    gradientClass: "from-slate-700 via-emerald-900/60 to-slate-900",
  },
  {
    id: "cyber_neon",
    name: "Cyber Neon Tóquio",
    rarity: "ÉPICA",
    unlockLevel: 4,
    tagline: "Jaqueta obsidiana futurista, viseira LED holográfica e plasma ciano.",
    accentHex: "#22d3ee",
    badgeEmoji: "⚡",
    gradientClass: "from-cyan-500/35 via-sky-900/60 to-slate-950",
  },
  {
    id: "explorador_selva",
    name: "Guardião da Floresta",
    rarity: "ÉPICA",
    unlockLevel: 2,
    tagline: "Visual expedicionário amazônico com chapéu tático e aura esmeralda.",
    accentHex: "#10b981",
    badgeEmoji: "🌿",
    gradientClass: "from-emerald-500/35 via-teal-900/60 to-slate-950",
  },
  {
    id: "street_gta",
    name: "Lenda Streetwear",
    rarity: "ÉPICA",
    unlockLevel: 3,
    tagline: "Jaqueta bomber urbana roxa & ouro, headphones neon e tênis especiais.",
    accentHex: "#c084fc",
    badgeEmoji: "🎧",
    gradientClass: "from-violet-500/35 via-fuchsia-900/50 to-slate-950",
  },
  {
    id: "deserto_1040",
    name: "Nômade da Janela 10/40",
    rarity: "ÉPICA",
    unlockLevel: 5,
    tagline: "Manto areia dourada & turquesa real com capuz e capa de viagem.",
    accentHex: "#f59e0b",
    badgeEmoji: "🏜️",
    gradientClass: "from-amber-500/35 via-orange-950/60 to-slate-950",
  },
  {
    id: "embaixador_ouro",
    name: "Embaixador Real Dourado",
    rarity: "LENDÁRIA",
    unlockLevel: 6,
    tagline: "Armadura branca imperial & ouro 24k, coroa real, capa e Espada Solar!",
    accentHex: "#fbbf24",
    badgeEmoji: "👑",
    gradientClass: "from-amber-300/40 via-yellow-800/55 to-slate-950",
  },
  {
    id: "sentinela_fogo",
    name: "Chama do Avivamento",
    rarity: "LENDÁRIA",
    unlockLevel: 8,
    tagline: "Armadura carmesim vulcânica, ombreiras de fogo, capa rubi e Lâmina Ígnea!",
    accentHex: "#fb7185",
    badgeEmoji: "🔥",
    gradientClass: "from-rose-500/45 via-orange-900/60 to-slate-950",
  },
  {
    id: "celestial_mitico",
    name: "Arcanjo Cyber Celestial",
    rarity: "MÍTICA",
    unlockLevel: 10,
    tagline: "Armadura platina estelar, asas holográficas de luz, halo giratório e Lâmina Astral!",
    accentHex: "#38bdf8",
    badgeEmoji: "🪽",
    gradientClass: "from-cyan-300/45 via-indigo-800/65 to-fuchsia-950",
  },
];

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "lucas",
    name: "Lucas",
    codename: "Explorador Prático",
    styleTag: "Aventura & Campo",
    description:
      "Sempre com mochila pronta e sorriso aberto para ajudar em barcos, vilas e acampamentos.",
    accentColor: "emerald",
    emoji: "🧭",
  },
  {
    id: "sofia",
    name: "Sofia",
    codename: "Conectora Urbana",
    styleTag: "Arte & Empatia",
    description:
      "Observadora e criativa, usa arte, música e boas conversas para criar pontes com qualquer jovem.",
    accentColor: "cyan",
    emoji: "🎨",
  },
  {
    id: "davi",
    name: "Davi",
    codename: "Decodificador Tech",
    styleTag: "Tech & Tradução",
    description:
      "Apaixonado por idiomas, códigos e tecnologia a serviço da tradução bíblica global.",
    accentColor: "amber",
    emoji: "💻",
  },
  {
    id: "ester",
    name: "Ester",
    codename: "Embaixadora Corajosa",
    styleTag: "Diplomacia & Fé",
    description:
      "Corajosa e sábia, caminha com respeito e paz mesmo nos lugares mais desafiadores do mundo.",
    accentColor: "violet",
    emoji: "🕊️",
  },
];

export const GIFT_OPTIONS: GiftOption[] = [
  {
    id: "comunicador",
    name: "Comunicador Criativo",
    tagline: "Transforma histórias em pontes para o coração",
    bonusDescription: "+20% de XP extra em todas as respostas empáticas.",
    verseRef: "Colossenses 4:6",
    iconName: "MessageSquareHeart",
    colorClass: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  },
  {
    id: "acolhedor",
    name: "Coração Acolhedor",
    tagline: "Ouve sem julgar e transmite segurança imediata",
    bonusDescription:
      "Inicia toda missão com +10% na Ponte de Confiança e reduz perdas.",
    verseRef: "Romanos 12:15",
    iconName: "HeartHandshake",
    colorClass: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  },
  {
    id: "tradutor",
    name: "Tradutor Ágil",
    tagline: "Dom para decifrar línguas e explicar a Palavra",
    bonusDescription:
      "+20 segundos extras no Decodificador da Palavra + 1 dica grátis.",
    verseRef: "Atos 2:8",
    iconName: "Languages",
    colorClass: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  },
  {
    id: "intercessor",
    name: "Intercessor Fiel",
    tagline: "Move montanhas espirituais através da oração",
    bonusDescription:
      "Usa 'Cobertura de Oração' 2x por missão e começa com +30 Sabedoria.",
    verseRef: "Tiago 5:16",
    iconName: "Sparkles",
    colorClass: "text-violet-400 border-violet-500/40 bg-violet-500/10",
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "medal_amazonia",
    title: "Embaixador das Águas",
    description:
      "Concluiu a Missão Amazônia Ribeirinha servindo com amor prático e verdade.",
    emoji: "🛶",
    category: "missao",
  },
  {
    id: "medal_janela1040",
    title: "Pioneiro da Janela 10/40",
    description:
      "Testemunhou a graça de Jesus com mansidão e coragem no Norte da África.",
    emoji: "🕌",
    category: "missao",
  },
  {
    id: "medal_toquio",
    title: "Farol em Tóquio",
    description:
      "Levou o descanso e o amor incondicional de Cristo em meio à pressão urbana.",
    emoji: "🌸",
    category: "missao",
  },
  {
    id: "medal_mocambique",
    title: "Tradutor Fiel",
    description:
      "Ajudou a levar as Escrituras para a língua do coração em Nampula, Moçambique.",
    emoji: "🌍",
    category: "missao",
  },
  {
    id: "embaixador_paz",
    title: "Embaixador da Paz",
    description:
      "Alcançou 100% na Ponte de Confiança em uma missão transcultural.",
    emoji: "🤝",
    category: "excelencia",
  },
  {
    id: "intercessor_global",
    title: "Sentinela de Oração",
    description:
      "Ativou todas as 4 Cartas de Oração da igreja perseguidora e missionária no Radar.",
    emoji: "📡",
    category: "espiritual",
  },
  {
    id: "mestre_evangelho",
    title: "Bíblia Viva no Recreio",
    description:
      "Estudou todos os 4 Passos do Evangelho no Guia da Bíblia de Bolso.",
    emoji: "📖",
    category: "espiritual",
  },
  {
    id: "agente_global",
    title: "Comissão Cumprida",
    description:
      "Carimbou todas as 4 regiões oficiais do mundo no Passaporte Missionário!",
    emoji: "🏆",
    category: "excelencia",
  },
];
