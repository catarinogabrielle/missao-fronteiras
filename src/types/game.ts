export type GiftId =
  | "comunicador"
  | "acolhedor"
  | "tradutor"
  | "intercessor";

export type AvatarId = "lucas" | "sofia" | "davi" | "ester";

export type SkinId =
  | "padrao"
  | "cyber_neon"
  | "explorador_selva"
  | "street_gta"
  | "deserto_1040"
  | "embaixador_ouro"
  | "sentinela_fogo"
  | "celestial_mitico";

export type SkinRarity = "CLÁSSICA" | "ÉPICA" | "LENDÁRIA" | "MÍTICA";

export type HeroEmoteType =
  | "idle"
  | "slash_spin"
  | "victory"
  | "dance"
  | "kneel_pray";

export type BiomeId = "amazonia" | "janela1040" | "toquio" | "mocambique";

export interface SkinOption {
  id: SkinId;
  name: string;
  rarity: SkinRarity;
  costWisdom: number;
  tagline: string;
  accentHex: string;
  badgeEmoji: string;
  gradientClass: string;
}

export interface AvatarOption {
  id: AvatarId;
  name: string;
  codename: string;
  styleTag: string;
  description: string;
  accentColor: string;
  emoji: string;
}

export interface GiftOption {
  id: GiftId;
  name: string;
  tagline: string;
  bonusDescription: string;
  verseRef: string;
  iconName: "MessageSquareHeart" | "HeartHandshake" | "Languages" | "Sparkles";
  colorClass: string;
}

export type OptionTone = "hasty" | "timid" | "empathetic";

export interface DialogueOption {
  id: string;
  tone: OptionTone;
  text: string;
  trustDelta: number;
  xpReward: number;
  feedback: string;
  bibleRef?: string;
}

export interface DialogueTurn {
  id: string;
  sceneTitle: string;
  npcMood: string;
  npcSpeech: string;
  prayerHint: string;
  prayerVerse: string;
  options: DialogueOption[];
}

export interface WordDecoderChallenge {
  gospelPillar: string;
  gospelExplanation: string;
  localLanguageName: string;
  localWordsGlossary: { term: string; meaning: string }[];
  verseReference: string;
  verseChunks: string[];
  timeLimitSeconds: number;
}

export interface CollectibleCardInfo {
  title: string;
  rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA";
  regionBadge: string;
  powerQuote: string;
  accentFrom: string;
  accentTo: string;
}

export interface Mission {
  id: string;
  order: number;
  isCustom?: boolean;
  biomeId?: BiomeId;
  title: string;
  regionName: string;
  country: string;
  coordinatesLabel: string;
  mapPosition: { x: number; y: number };
  emoji: string;
  stampCode: string;
  difficulty: "Iniciante" | "Intermediário" | "Avançado" | "Especial";
  accentColor: "emerald" | "amber" | "cyan" | "violet";
  spiritualChallenge: string;
  shortDescription: string;
  npc: {
    id: string;
    name: string;
    age: number;
    role: string;
    bio: string;
    avatarKey: "caua" | "tariq" | "hina" | "samora" | "custom";
  };
  briefing: {
    context: string;
    culturalTip: string;
    dos: string[];
    donts: string[];
  };
  turns: DialogueTurn[];
  decoder: WordDecoderChallenge;
  schoolChallenge: {
    title: string;
    action: string;
    reflectionQuestion: string;
  };
  collectibleCard: CollectibleCardInfo;
  rewardXp: number;
  rewardWisdom: number;
  medalId: string;
  medalName: string;
}

export interface PrayerCard {
  id: string;
  missionId: string;
  region: string;
  title: string;
  churchReport: string;
  prayerPoints: string[];
  wisdomReward: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: "missao" | "excelencia" | "espiritual";
}

export interface MissionProgressRecord {
  completed: boolean;
  bestTrust: number;
  completedAt: string;
  perfectCardUnlocked: boolean;
  schoolChallengeAccepted?: boolean;
}

export interface AgentProfile {
  name: string;
  avatarId: AvatarId;
  giftId: GiftId;
  skinId?: SkinId;
  createdAt: string;
}

export interface GameState {
  agent: AgentProfile | null;
  savedProfiles?: AgentProfile[];
  xp: number;
  wisdom: number;
  streak: number;
  lastActiveDate: string;
  missionProgress: Record<string, MissionProgressRecord>;
  prayedMissionIds: string[];
  studiedGospelSteps: number[];
  unlockedAchievements: string[];
  unlockedSkins: SkinId[];
  allSkinsUnlockedByLeader: boolean;
  leaderPin: string;
  customMissions: Mission[];
  allUnlockedByLeader: boolean;
  muted: boolean;
  projectorMode: boolean;
}
