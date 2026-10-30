"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Download,
  Gem,
  HeartHandshake,
  Image as ImageIcon,
  Languages,
  Lock,
  MessageSquareHeart,
  Monitor,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  AVATAR_OPTIONS,
  GIFT_OPTIONS,
  SKIN_OPTIONS,
} from "@/data/avatarsAndGifts";
import { AvatarId, GiftId, SkinId } from "@/types/game";
import { HERO_PORTRAITS, MAP_SPLASHES } from "@/lib/assets";
import { useGame } from "@/context/GameContext";
import { usePwa } from "@/context/PwaContext";
import { useMobileViewport } from "@/lib/useMobileViewport";
import { MobaButton } from "./MobaButton";
import { HeroPortrait } from "./GamePortrait";
import { HeroPreview3D } from "./HeroPreview3D";

interface OnboardingScreenProps {
  onOpenLeaderPanel: () => void;
}

const CHAMPION_STATS: Record<
  AvatarId,
  {
    arenaBg: string;
    roleTitle: string;
    category: "CAMPO" | "ARTE" | "TECH" | "FÉ";
    empatia: number;
    sabedoria: number;
    traducao: number;
    intercessao: number;
    skills: {
      q: { name: string; desc: string };
      w: { name: string; desc: string };
      e: { name: string; desc: string };
    };
  }
> = {
  lucas: {
    arenaBg: MAP_SPLASHES.amazonia,
    roleTitle: "VANGUARDA • SERVIÇO PRÁTICO",
    category: "CAMPO",
    empatia: 90,
    sabedoria: 80,
    traducao: 75,
    intercessao: 85,
    skills: {
      q: { name: "Pulso de Luz", desc: "Dissipa trevas e cura aliados" },
      w: { name: "Dash Tático", desc: "Avanço rápido de barco/terreno" },
      e: { name: "Escudo da Fé", desc: "Bloqueia tempestades e desânimo" },
    },
  },
  sofia: {
    arenaBg: MAP_SPLASHES.toquio,
    roleTitle: "SUPORTE • CONEXÃO CRIATIVA",
    category: "ARTE",
    empatia: 96,
    sabedoria: 84,
    traducao: 80,
    intercessao: 78,
    skills: {
      q: { name: "Música de Paz", desc: "Acalma corações e abre mentes" },
      w: { name: "Ponte Visual", desc: "Pintura mural que conecta culturas" },
      e: { name: "Acolhimento", desc: "Cura amigos e restaura a esperança" },
    },
  },
  davi: {
    arenaBg: MAP_SPLASHES.mocambique,
    roleTitle: "ESPECIALISTA • DECODIFICADOR",
    category: "TECH",
    empatia: 78,
    sabedoria: 92,
    traducao: 98,
    intercessao: 80,
    skills: {
      q: { name: "Decodificador", desc: "Decifra dialetos instantaneamente" },
      w: { name: "Link Satélite", desc: "Transmite as Escrituras via rádio" },
      e: { name: "Firewall da Verdade", desc: "Protege contra fake news" },
    },
  },
  ester: {
    arenaBg: MAP_SPLASHES.janela1040,
    roleTitle: "EMBAIXADORA • CORAGEM & FÉ",
    category: "FÉ",
    empatia: 88,
    sabedoria: 90,
    traducao: 82,
    intercessao: 96,
    skills: {
      q: { name: "Oração Fervente", desc: "Move montes e dissipa perigos" },
      w: { name: "Voz de Justiça", desc: "Testemunho firme perante reis" },
      e: { name: "Capa Protetora", desc: "Proteção divina para o grupo" },
    },
  },
};

const CHAMPION_TACTICAL_INTEL: Record<
  AvatarId,
  {
    bio: string;
    verse: string;
    verseRef: string;
    squadSynergy: string[];
    tips: [string, string, string];
  }
> = {
  lucas: {
    bio: "Explorador intrépido dos rios e matas. Com mochila sempre pronta, lidera expedições ribeirinhas levando socorro prático e esperança.",
    verse: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
    verseRef: "Isaías 41:10",
    squadSynergy: ["VANGUARDA", "RESGATE", "SERVIÇO", "EXPLORAÇÃO"],
    tips: [
      "Use Pulso de Luz (Q) para limpar rotas escuras e curar aliados feridos.",
      "O Dash Tático (W) permite cruzar pontes e terrenos difíceis com velocidade.",
      "Ative o Escudo da Fé (E) para blindar seu esquadrão contra tempestades e desânimo.",
    ],
  },
  sofia: {
    bio: "Artista sensível e comunicadora acolhedora. Conecta corações de diferentes culturas através da música, murais expressivos e empatia viva.",
    verse: "Alegrem-se com os que se alegram; chorem com os que choram.",
    verseRef: "Romanos 12:15",
    squadSynergy: ["SUPORTE", "ARTE", "EMPATIA", "COMUNHÃO"],
    tips: [
      "Música de Paz (Q) quebra resistências culturais e acalma corações nas cidades.",
      "Ponte Visual (W) ilustra histórias bíblicas em murais para quem não sabe ler.",
      "Acolhimento (E) restaura a esperança e regenera a confiança de povos isolados.",
    ],
  },
  davi: {
    bio: "Especialista em tecnologia, dialetos e rádio digital. Decifra línguas raras e conecta comunidades isoladas via satélite com sabedoria.",
    verse: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.",
    verseRef: "Salmos 119:105",
    squadSynergy: ["TECNOLOGIA", "TRADUÇÃO", "SINAL", "ESTRATÉGIA"],
    tips: [
      "O Decodificador (Q) traduz dialetos complexos ao dialogar com anciãos.",
      "Link Satélite (W) sincroniza dados e transmite a Bíblia em áudio via rádio.",
      "O Firewall da Verdade (E) bloqueia desinformação e protege jovens contra mentiras.",
    ],
  },
  ester: {
    bio: "Diplomata destemida e guardiã da Janela 10/40. Intercede com fé inabalável em governos, capitais e regiões de alta perseguição religiosa.",
    verse: "Quem sabe se não foi para um momento como este que você chegou à realeza?",
    verseRef: "Ester 4:14",
    squadSynergy: ["DIPLOMACIA", "INTERCESSÃO", "LIDERANÇA", "PROTEÇÃO"],
    tips: [
      "Oração Fervente (Q) move montanhas espirituais e dissipa perigos invisíveis.",
      "Voz de Justiça (W) estabelece pontes com autoridades para obter autorizações.",
      "A Capa Protetora (E) estende um manto de refúgio celestial sobre a base.",
    ],
  },
};

export function OnboardingScreen({ onOpenLeaderPanel }: OnboardingScreenProps) {
  const {
    createAgent,
    selectProfile,
    isSkinUnlocked,
    playSfx,
    state,
    toggleMute,
    toggleProjectorMode,
  } = useGame();
  const { isOnline, offlineReady, isStandalone, triggerInstall } = usePwa();
  const { isMobileLandscape } = useMobileViewport();

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>("lucas");
  const [selectedSkin, setSelectedSkin] = useState<SkinId>("cyber_neon");
  const [previewSkin, setPreviewSkin] = useState<SkinId>("cyber_neon");
  const [selectedGift, setSelectedGift] = useState<GiftId>("acolhedor");
  const [viewMode, setViewMode] = useState<"3d" | "art">("3d");

  // Mobile dedicated tab & filter state (Echoes of Arena Image 3 layout)
  const [mobileRoleFilter, setMobileRoleFilter] = useState<
    "TODOS" | "CAMPO" | "ARTE" | "TECH" | "FÉ"
  >("TODOS");
  const [mobileRightTab, setMobileRightTab] = useState<
    "historia" | "skins" | "dons"
  >("historia");

  const activeChampion =
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];
  const activeStats = CHAMPION_STATS[selectedAvatar];
  const activeGift =
    GIFT_OPTIONS.find((g) => g.id === selectedGift) || GIFT_OPTIONS[0];
  const activeSkinMeta =
    SKIN_OPTIONS.find((s) => s.id === previewSkin) || SKIN_OPTIONS[0];
  const previewUnlocked = isSkinUnlocked(previewSkin);

  const renderGiftIcon = (
    iconName: (typeof GIFT_OPTIONS)[number]["iconName"]
  ) => {
    switch (iconName) {
      case "MessageSquareHeart":
        return <MessageSquareHeart className="h-5 w-5" />;
      case "HeartHandshake":
        return <HeartHandshake className="h-5 w-5" />;
      case "Languages":
        return <Languages className="h-5 w-5" />;
      case "Sparkles":
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const handleConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalSkin = isSkinUnlocked(previewSkin) ? previewSkin : selectedSkin;
    createAgent(
      name || `Agente ${activeChampion.name}`,
      selectedAvatar,
      selectedGift,
      finalSkin
    );
  };

  /* =========================================================================
     MOBILE LANDSCAPE: 100% WIDESCREEN CONSOLE (ECHOES OF ARENA IMAGE 3 STYLE)
     - Fits 100% in viewport (h-dvh) without scrolling.
     - Left: Role filter & 4 hero cards grid.
     - Center: Hero title, 4 power bars, 3D turntable dais, 3 skill circles.
     - Right: Tabs (História, Skins, Dons), Nickname, and Giant Confirm Button.
     ========================================================================= */
  if (isMobileLandscape) {
    const filteredAvatars = AVATAR_OPTIONS.filter((av) => {
      if (mobileRoleFilter === "TODOS") return true;
      return CHAMPION_STATS[av.id].category === mobileRoleFilter;
    });

    const tacticalIntel = CHAMPION_TACTICAL_INTEL[selectedAvatar];

    return (
      <div className="fixed inset-0 flex h-full h-dvh w-full flex-col justify-between overflow-hidden bg-slate-950 p-1.5 sm:p-2 select-none touch-manipulation">
        {/* Subtle Background Splash of Highlighted Champion Arena with Vignette */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeStats.arenaBg}
            src={activeStats.arenaBg}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none fixed inset-0 h-full w-full object-cover blur-xs"
          />
        </AnimatePresence>
        <div className="pointer-events-none fixed inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950/90" />

        {/* 1. TOP ECHOES OF ARENA NAVBAR (32px fixed) */}
        <header className="relative z-20 flex h-8 shrink-0 items-center justify-between border-b border-amber-500/25 px-2 bg-slate-950/85 backdrop-blur-md rounded-lg">
          {/* Logo & Game Title */}
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt="Logo"
              className="h-6 w-6 rounded-lg border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            />
            <span className="font-black text-xs tracking-wider text-white uppercase bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-transparent">
              Missão Fronteiras
            </span>
          </div>

          {/* Center Tabs (Echoes of Arena: Jogar | Heróis | Painel) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleConfirm()}
              className="px-2.5 py-0.5 text-xs font-black text-slate-400 transition hover:text-white uppercase cursor-pointer"
            >
              Jogar
            </button>
            <div className="relative px-2.5 py-0.5 text-xs font-black text-amber-300 uppercase">
              <span>Heróis</span>
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-400 to-cyan-400 shadow-[0_0_8px_#fbbf24]" />
            </div>
            <button
              type="button"
              onClick={onOpenLeaderPanel}
              className="px-2.5 py-0.5 text-xs font-black text-slate-400 transition hover:text-white uppercase cursor-pointer"
            >
              Painel
            </button>
          </div>

          {/* Right Resources & Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="inline-flex items-center gap-1 rounded-md border border-cyan-400/40 bg-slate-900/90 px-2 py-0.5 text-[10px] font-black text-cyan-200">
              <Gem className="h-3 w-3 text-cyan-300" />
              <span>{state.wisdom} 💎</span>
            </div>

            <MobaButton
              variant="gold"
              size="sm"
              shape="slant"
              onClick={onOpenLeaderPanel}
              className="!py-0.5 !px-2 !text-[9px]"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>Líder</span>
            </MobaButton>

            <button
              type="button"
              onClick={toggleMute}
              title={state.muted ? "Ativar Som" : "Silenciar"}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
            >
              {state.muted ? (
                <VolumeX className="h-3 w-3 text-rose-400" />
              ) : (
                <Volume2 className="h-3 w-3 text-emerald-400" />
              )}
            </button>
          </div>
        </header>

        {/* 2. MAIN 3-COLUMN HEROES WORKBENCH (100% NO SCROLL) */}
        <div className="relative z-10 grid flex-1 min-h-0 grid-cols-12 gap-2 mt-1.5 overflow-hidden">
          {/* LEFT COLUMN (3 cols): Role Filters + Non-stretching Hero Cards */}
          <section className="col-span-3 rounded-2xl border border-cyan-500/25 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between h-full min-h-0 p-2 overflow-hidden shadow-xl">
            {/* Top: Role Filter Pills */}
            <div className="shrink-0">
              <div className="text-[9px] font-black tracking-widest text-cyan-400 uppercase mb-1">
                Função do Agente
              </div>
              <div className="grid grid-cols-5 gap-0.5">
                {(["TODOS", "CAMPO", "ARTE", "TECH", "FÉ"] as const).map(
                  (role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setMobileRoleFilter(role)}
                      className={`cursor-pointer rounded py-0.5 text-[8px] font-black uppercase transition ${
                        mobileRoleFilter === role
                          ? "bg-cyan-500 text-slate-950 shadow-[0_0_8px_#22d3ee]"
                          : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      {role}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Hero Cards List: Fixed Height Cards (Never Stretch!) */}
            <div className="my-1 flex-1 min-h-0 flex flex-col gap-1.5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-1.5 auto-rows-max">
                {filteredAvatars.map((av) => {
                  const isSelected = av.id === selectedAvatar;
                  const stats = CHAMPION_STATS[av.id];
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setSelectedAvatar(av.id);
                      }}
                      className={`relative flex items-center gap-1.5 rounded-xl border p-1 text-left transition cursor-pointer h-13 ${
                        isSelected
                          ? "border-amber-300 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-300"
                          : "border-slate-800 bg-slate-900/80 hover:border-slate-600"
                      }`}
                    >
                      <HeroPortrait
                        avatarId={av.id}
                        size={32}
                        shape="hex"
                        active={isSelected}
                      />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="truncate text-[10px] font-black text-white uppercase">
                          {av.name}
                        </div>
                        <div className="text-[7px] font-bold text-amber-300 truncate">
                          {stats.category}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tactical Speciality Insight when filtered to 1 hero (Prevents empty look) */}
              {filteredAvatars.length === 1 && (
                <div className="mt-auto rounded-xl border border-cyan-500/20 bg-slate-900/70 p-1.5 text-[8px] text-slate-300">
                  <div className="font-bold text-cyan-300 uppercase mb-0.5 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                    <span>Especialidade de {activeChampion.name}</span>
                  </div>
                  <p className="leading-tight text-slate-300">{activeStats.roleTitle}</p>
                </div>
              )}
            </div>

            {/* Bottom: Quick View Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setViewMode(viewMode === "3d" ? "art" : "3d");
              }}
              className="shrink-0 flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 py-1 text-[9px] font-black text-slate-300 hover:border-cyan-400 hover:text-white cursor-pointer"
            >
              <Box className="h-3 w-3 text-cyan-300" />
              <span>{viewMode === "3d" ? "Ver Arte Oficial" : "Ver Boneco 3D"}</span>
            </button>
          </section>

          {/* CENTER STAGE (5 cols): Hero Title, 4 Stat Bars, 3D Character on Dais, 3 Runic Skills */}
          <section className="col-span-5 rounded-2xl border border-amber-500/35 bg-gradient-to-b from-slate-950/80 via-[#071328]/75 to-slate-950/80 backdrop-blur-md flex flex-col justify-between h-full min-h-0 p-2 overflow-hidden shadow-2xl">
            {/* Header: Title + Role + 4 Glowing Power Meters */}
            <div className="shrink-0 text-center border-b border-amber-500/20 pb-1">
              <h2 className="text-sm font-black tracking-wide text-white uppercase">
                {activeChampion.name} •{" "}
                <span className="text-amber-300">
                  {activeChampion.codename}
                </span>
              </h2>
              <div className="text-[8px] font-bold text-cyan-300 uppercase tracking-wider">
                {activeStats.roleTitle}
              </div>

              {/* 4 Stat Bars (Echoes of Arena Image 3 Style) */}
              <div className="mt-1 grid grid-cols-4 gap-1.5 text-[8px] font-bold">
                <div>
                  <div className="flex justify-between text-slate-300">
                    <span>EMPATIA</span>
                    <span className="text-emerald-400">
                      {activeStats.empatia}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-slate-900">
                    <div
                      style={{ width: `${activeStats.empatia}%` }}
                      className="h-full bg-emerald-400 shadow-[0_0_6px_#34d399]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300">
                    <span>SABEDORIA</span>
                    <span className="text-amber-300">
                      {activeStats.sabedoria}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-slate-900">
                    <div
                      style={{ width: `${activeStats.sabedoria}%` }}
                      className="h-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300">
                    <span>TRADUÇÃO</span>
                    <span className="text-cyan-300">
                      {activeStats.traducao}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-slate-900">
                    <div
                      style={{ width: `${activeStats.traducao}%` }}
                      className="h-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300">
                    <span>ORAÇÃO</span>
                    <span className="text-violet-300">
                      {activeStats.intercessao}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-slate-900">
                    <div
                      style={{ width: `${activeStats.intercessao}%` }}
                      className="h-full bg-violet-400 shadow-[0_0_6px_#a855f7]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Live 3D Turntable / Character on Dais (Borderless, Seamless) */}
            <div className="my-0.5 flex flex-1 min-h-0 items-center justify-center overflow-hidden">
              {viewMode === "3d" ? (
                <HeroPreview3D
                  avatarId={selectedAvatar}
                  skinId={previewSkin}
                  agentName={name || activeChampion.name}
                  heightClass="h-full max-h-[175px]"
                  showEmoteBar
                  compact
                  borderless
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={HERO_PORTRAITS[selectedAvatar]}
                  alt={activeChampion.name}
                  className="h-full max-h-[175px] w-auto rounded-xl object-contain shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                />
              )}
            </div>

            {/* Bottom: 3 Runic Ability Circles (Q, W, E) */}
            <div className="shrink-0 flex items-center justify-around border-t border-amber-500/20 pt-1">
              <div
                title={activeStats.skills.q.desc}
                className="flex items-center gap-1 text-[9px] font-bold text-cyan-200"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300 bg-cyan-500/20 text-[9px] font-mono font-black text-cyan-300 shadow-[0_0_8px_#22d3ee]">
                  Q
                </div>
                <span className="truncate max-w-[85px]">
                  {activeStats.skills.q.name}
                </span>
              </div>
              <div
                title={activeStats.skills.w.desc}
                className="flex items-center gap-1 text-[9px] font-bold text-amber-200"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-amber-500/20 text-[9px] font-mono font-black text-amber-300 shadow-[0_0_8px_#fbbf24]">
                  W
                </div>
                <span className="truncate max-w-[85px]">
                  {activeStats.skills.w.name}
                </span>
              </div>
              <div
                title={activeStats.skills.e.desc}
                className="flex items-center gap-1 text-[9px] font-bold text-emerald-200"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300 bg-emerald-500/20 text-[9px] font-mono font-black text-emerald-300 shadow-[0_0_8px_#34d399]">
                  E
                </div>
                <span className="truncate max-w-[85px]">
                  {activeStats.skills.e.name}
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN (4 cols): Rich Intel Tabs + Nickname + Confirm CTA */}
          <section className="col-span-4 rounded-2xl border border-cyan-500/25 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between h-full min-h-0 p-2 overflow-hidden shadow-xl">
            {/* Top Tabs (História, Skins 3D, Runas/Dons) */}
            <div className="shrink-0 flex items-center justify-around border-b border-cyan-500/30 pb-1">
              <button
                type="button"
                onClick={() => setMobileRightTab("historia")}
                className={`text-[9px] font-black uppercase pb-0.5 cursor-pointer transition ${
                  mobileRightTab === "historia"
                    ? "text-amber-300 border-b-2 border-amber-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                História
              </button>
              <button
                type="button"
                onClick={() => setMobileRightTab("skins")}
                className={`text-[9px] font-black uppercase pb-0.5 cursor-pointer transition ${
                  mobileRightTab === "skins"
                    ? "text-amber-300 border-b-2 border-amber-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Skins 3D
              </button>
              <button
                type="button"
                onClick={() => setMobileRightTab("dons")}
                className={`text-[9px] font-black uppercase pb-0.5 cursor-pointer transition ${
                  mobileRightTab === "dons"
                    ? "text-amber-300 border-b-2 border-amber-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Runas/Dons
              </button>
            </div>

            {/* Tab Body: Rich AAA Content (NO EMPTY VOIDS!) */}
            <div className="my-1 flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
              {mobileRightTab === "historia" && (
                <div className="space-y-1.5 text-[8.5px] leading-tight">
                  {/* Hero Lore */}
                  <p className="text-slate-200 line-clamp-2">
                    {tacticalIntel.bio}
                  </p>

                  {/* Sinergia & Composição */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-1.5">
                    <div className="text-[7.5px] font-bold text-amber-300 uppercase mb-1">
                      Composição Sugerida & Sinergia
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tacticalIntel.squadSynergy.map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-cyan-400/30 bg-cyan-950/60 px-1 py-0.2 text-[7.5px] font-black text-cyan-200"
                        >
                          ⚡ {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dicas Táticas */}
                  <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/80 p-1.5">
                    <div className="text-[7.5px] font-bold text-cyan-300 uppercase">
                      Dicas Táticas de Combate
                    </div>
                    {tacticalIntel.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1 text-slate-300 text-[8px] leading-tight"
                      >
                        <span className="text-amber-400 font-bold shrink-0">
                          {idx + 1}.
                        </span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>

                  {/* Scripture Verse */}
                  <div className="rounded border border-amber-400/30 bg-amber-500/10 p-1 text-[8px] text-amber-200 italic leading-tight">
                    &ldquo;{tacticalIntel.verse}&rdquo;{" "}
                    <span className="not-italic font-bold text-amber-300">
                      ({tacticalIntel.verseRef})
                    </span>
                  </div>
                </div>
              )}

              {mobileRightTab === "skins" && (
                <div>
                  <div className="mb-1 flex items-center justify-between text-[8px] font-black uppercase text-amber-300">
                    <span>{activeSkinMeta.name}</span>
                    {!previewUnlocked && (
                      <span className="text-cyan-300">
                        {activeSkinMeta.costWisdom}💎
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {SKIN_OPTIONS.map((sk) => {
                      const unlocked = isSkinUnlocked(sk.id);
                      const active = previewSkin === sk.id;
                      return (
                        <button
                          key={sk.id}
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setPreviewSkin(sk.id);
                            setViewMode("3d");
                            if (unlocked) {
                              setSelectedSkin(sk.id);
                            }
                          }}
                          title={`${sk.name} (${sk.rarity})`}
                          className={`relative flex h-8 cursor-pointer items-center justify-center rounded-lg border text-xs transition ${
                            sk.gradientClass
                          } ${
                            active
                              ? "border-amber-300 shadow-[0_0_10px_#fbbf24] ring-1 ring-amber-300"
                              : unlocked
                                ? "border-slate-700 hover:border-cyan-400"
                                : "border-slate-800 opacity-60"
                          }`}
                        >
                          <span>{sk.badgeEmoji}</span>
                          {!unlocked && (
                            <Lock className="absolute right-0.5 bottom-0.5 h-2 w-2 text-amber-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {mobileRightTab === "dons" && (
                <div className="grid grid-cols-2 gap-1">
                  {GIFT_OPTIONS.map((g) => {
                    const active = g.id === selectedGift;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          playSfx("click");
                          setSelectedGift(g.id);
                        }}
                        className={`flex flex-col items-center justify-center rounded-lg border p-1 text-center cursor-pointer transition ${
                          active
                            ? "border-amber-300 bg-amber-500/20 text-amber-200 ring-1 ring-amber-300"
                            : "border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        <span className="text-[8.5px] font-black truncate w-full">
                          {g.name}
                        </span>
                        <span className="text-[7px] text-cyan-300 truncate w-full">
                          {g.verseRef}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom: Summoner Nickname Input + Presets + Confirm CTA */}
            <div className="shrink-0 border-t border-cyan-500/25 pt-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-black uppercase text-amber-300">
                  Nome do Agente
                </span>
                <div className="flex gap-1">
                  {["Kaleb_BR", "Sofia_Ide", "Tribo Atos", "Rede Teens"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setName(preset)}
                      className="cursor-pointer rounded border border-slate-700 bg-slate-900/90 px-1 py-0.2 text-[7.5px] font-bold text-slate-300 hover:border-amber-400"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                maxLength={24}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu Nick de Invocador..."
                className="w-full rounded border border-amber-500/40 bg-slate-950 px-2 py-0.5 text-xs font-black text-white focus:border-cyan-400 focus:outline-none"
              />

              {/* Giant Glowing Confirm Button (Echoes of Arena Style) */}
              <MobaButton
                variant="gold"
                size="md"
                shape="hex"
                onClick={() => handleConfirm()}
                className="w-full !py-1.5 !text-xs font-black shadow-[0_0_24px_rgba(245,158,11,0.65)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                CONFIRMAR • ESCOLHER ESTE HERÓI
              </MobaButton>
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* =========================================================================
     DESKTOP WEB VERSION: 100% RICH AAA CLIENT RESTORED (ORIGINAL DESKTOP)
     ========================================================================= */
  return (
    <div className="relative flex h-full min-h-screen flex-col justify-between overflow-y-auto bg-slate-950">
      {/* Dynamic 3D Arena Splash Wallpaper */}
      <AnimatePresence mode="wait">
        <motion.img
          key={activeStats.arenaBg}
          src={activeStats.arenaBg}
          alt="Arena"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.32, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* AAA Cinematic Vignette Gradients */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-slate-950" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/85" />

      {/* TOP AAA CLIENT BAR */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-8">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt="Missão Fronteiras"
            className="h-12 w-12 rounded-2xl border border-amber-400/70 shadow-[0_0_24px_rgba(245,158,11,0.5)]"
          />
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-amber-300 uppercase">
              <span>BASE MISSIONÁRIA IDE • SELEÇÃO DE CAMPEÃO & SKIN 3D</span>
              {offlineReady && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[9px] tracking-wider text-emerald-300">
                  {isOnline ? (
                    <Wifi className="h-2.5 w-2.5" />
                  ) : (
                    <WifiOff className="h-2.5 w-2.5 text-amber-300" />
                  )}
                  {isOnline ? "OFFLINE PRONTO" : "MODO OFFLINE"}
                </span>
              )}
            </div>
            <h1 className="bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-xl font-black tracking-wide text-transparent uppercase sm:text-2xl">
              Missão Fronteiras: O Chamado
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isStandalone && (
            <MobaButton
              variant="emerald"
              size="sm"
              shape="slant"
              onClick={triggerInstall}
              title="Instalar Jogo (PWA Offline)"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Instalar App</span>
            </MobaButton>
          )}
          <MobaButton
            variant={state.projectorMode ? "gold" : "obsidian"}
            size="sm"
            shape="slant"
            sheen={false}
            onClick={toggleProjectorMode}
            title="Alternar Modo Telão (TV / Projetor)"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Telão</span>
          </MobaButton>

          <MobaButton
            variant="gold"
            size="sm"
            shape="slant"
            onClick={onOpenLeaderPanel}
            title="Central do Líder / Professor (PIN 1234)"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Painel do Líder</span>
          </MobaButton>

          <MobaButton
            variant="obsidian"
            size="sm"
            shape="rounded"
            sheen={false}
            onClick={toggleMute}
            title={state.muted ? "Ativar Som" : "Silenciar"}
          >
            {state.muted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </MobaButton>
        </div>
      </header>

      {/* QUICK AGENT SWITCHER FOR SAVED PROFILES */}
      {state.savedProfiles && state.savedProfiles.length > 0 && (
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-3 sm:px-8">
          <div className="moba-panel-cyan moba-clip-panel flex flex-wrap items-center justify-between gap-2.5 p-3">
            <div className="flex items-center gap-2 text-xs font-black text-cyan-300 uppercase">
              <Users className="h-4 w-4 text-amber-300" />
              <span>Conectar com Agente Salvo:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {state.savedProfiles.map((prof) => (
                <button
                  key={prof.name}
                  type="button"
                  onClick={() => {
                    playSfx("levelUp");
                    selectProfile(prof);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/50 bg-slate-900/95 px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:border-amber-300 hover:bg-amber-500/25"
                >
                  <span className="text-amber-300">{prof.name}</span>
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-200 uppercase">
                    {prof.avatarId}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    Entrar →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN 3-COLUMN AAA CHAMPION & 3D SKIN SELECT STAGE */}
      <form
        onSubmit={handleConfirm}
        className="relative z-20 mx-auto my-auto grid w-full max-w-7xl items-center gap-5 px-4 py-4 sm:px-8 lg:grid-cols-12"
      >
        {/* LEFT COLUMN: Champion Lore, Stats & Motto Verses */}
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-4">
          <div className="moba-panel-gold moba-clip-panel p-5">
            <div className="text-[11px] font-black tracking-[0.2em] text-cyan-400 uppercase">
              {activeStats.roleTitle}
            </div>
            <h2 className="mt-1 text-3xl font-black tracking-wide text-white uppercase sm:text-4xl">
              {activeChampion.name}{" "}
              <span className="text-2xl">{activeChampion.emoji}</span>
            </h2>
            <div className="text-xs font-extrabold text-amber-300">
              {activeChampion.codename} • {activeChampion.styleTag}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              {activeChampion.description}
            </p>

            {/* AAA Power Bars */}
            <div className="mt-4 space-y-2.5 border-t border-amber-500/20 pt-3.5">
              {[
                {
                  label: "Empatia Cultural",
                  val: activeStats.empatia,
                  bar: "from-emerald-400 to-teal-300",
                },
                {
                  label: "Sabedoria Bíblica",
                  val: activeStats.sabedoria,
                  bar: "from-amber-400 to-yellow-300",
                },
                {
                  label: "Tradução Ágil",
                  val: activeStats.traducao,
                  bar: "from-cyan-400 to-sky-300",
                },
                {
                  label: "Poder de Oração",
                  val: activeStats.intercessao,
                  bar: "from-violet-400 to-fuchsia-300",
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="mb-0.5 flex justify-between text-[11px] font-bold text-slate-300">
                    <span>{stat.label}</span>
                    <span className="font-mono text-amber-300">{stat.val}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                    <motion.div
                      key={`${selectedAvatar}-${stat.label}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.val}%` }}
                      transition={{ duration: 0.45 }}
                      className={`h-full bg-gradient-to-r ${stat.bar}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biblical Motto Plate */}
          <div className="moba-panel-cyan moba-clip-panel p-4">
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-cyan-300 uppercase">
              <span>CÓDIGO DA MISSÃO</span>
              <span>MARCOS 16:15 • ATOS 1:8</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-200 italic">
              &ldquo;Ide por todo o mundo, pregai o Evangelho e sede minhas
              testemunhas até aos confins da terra!&rdquo;
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: Live 3D Turntable Showcase + Champion & Skin Selectors */}
        <div className="order-1 flex flex-col items-center lg:order-2 lg:col-span-4">
          {/* 3D Model vs Official Portrait Mode Switcher */}
          <div className="mb-2.5 inline-flex rounded-full border border-slate-700/80 bg-slate-950/85 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setViewMode("3d");
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase transition ${
                viewMode === "3d"
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Box className="h-3 w-3" />
              Boneco 3D & Emotes
            </button>
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setViewMode("art");
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase transition ${
                viewMode === "art"
                  ? "bg-cyan-400 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon className="h-3 w-3" />
              Arte 3D
            </button>
          </div>

          {viewMode === "3d" ? (
            <div className="w-full max-w-sm">
              <HeroPreview3D
                avatarId={selectedAvatar}
                skinId={previewSkin}
                agentName={name || activeChampion.name}
                heightClass="h-72 sm:h-80"
                showEmoteBar
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAvatar}
                initial={{ opacity: 0, scale: 0.9, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="relative h-72 w-72 overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-slate-900 shadow-[0_0_55px_rgba(245,158,11,0.32)] sm:h-80 sm:w-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_PORTRAITS[selectedAvatar]}
                  alt={activeChampion.name}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-3.5 text-center">
                  <span className="rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-0.5 text-[11px] font-black tracking-widest text-amber-200 uppercase">
                    ARTE OFICIAL • {activeChampion.name}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* 4 Hexagonal Champion Roster Portraits */}
          <div className="mt-3.5 flex items-center justify-center gap-3">
            {AVATAR_OPTIONS.map((av) => {
              const isSelected = av.id === selectedAvatar;
              return (
                <motion.button
                  key={av.id}
                  type="button"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    playSfx("click");
                    setSelectedAvatar(av.id);
                  }}
                  className="group flex cursor-pointer flex-col items-center focus:outline-none"
                >
                  <HeroPortrait
                    avatarId={av.id}
                    size={isSelected ? 64 : 54}
                    shape="hex"
                    active={isSelected}
                  />
                  <span
                    className={`mt-1 text-[10px] font-black uppercase ${
                      isSelected
                        ? "text-amber-300"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {av.name}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* AAA 3D Skin Picker Strip right on Onboarding! */}
          <div className="mt-3 w-full max-w-sm rounded-2xl border border-amber-400/30 bg-slate-950/85 p-2.5 backdrop-blur">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-[10px] font-black tracking-wider text-amber-300 uppercase">
                👕 Skin 3D: {activeSkinMeta.name}
              </span>
              {!previewUnlocked && (
                <span className="text-[9px] font-bold text-cyan-300">
                  Desbloqueie no jogo ({activeSkinMeta.costWisdom}💎)
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
              {SKIN_OPTIONS.map((sk) => {
                const unlocked = isSkinUnlocked(sk.id);
                const active = previewSkin === sk.id;
                return (
                  <motion.button
                    key={sk.id}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      playSfx("click");
                      setPreviewSkin(sk.id);
                      setViewMode("3d");
                      if (unlocked) {
                        setSelectedSkin(sk.id);
                      }
                    }}
                    title={`${sk.name} (${sk.rarity})`}
                    className={`relative flex h-9 cursor-pointer items-center justify-center rounded-xl border bg-gradient-to-br text-base transition ${
                      sk.gradientClass
                    } ${
                      active
                        ? "border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.55)]"
                        : unlocked
                          ? "border-slate-700 hover:border-cyan-400"
                          : "border-slate-800 opacity-65"
                    }`}
                  >
                    <span>{sk.badgeEmoji}</span>
                    {!unlocked && (
                      <Lock className="absolute right-0.5 bottom-0.5 h-2.5 w-2.5 text-amber-300" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summoner Name + Passive Ability Runes + LOCK IN Button */}
        <div className="order-3 space-y-4 lg:col-span-4">
          <div className="moba-panel-gold moba-clip-panel p-5">
            <div>
              <label className="mb-1.5 block text-xs font-black tracking-widest text-amber-300 uppercase">
                1. Nome de Invocador / Equipe
              </label>
              <input
                type="text"
                maxLength={24}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu Nick ou Nome da Equipe..."
                className="w-full rounded-xl border-2 border-amber-500/40 bg-slate-950/90 px-3.5 py-2.5 text-sm font-black text-white placeholder-slate-500 transition focus:border-cyan-400 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Kaleb_BR", "Sofia_Ide", "Tribo Atos", "Rede Teens"].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setName(preset);
                      }}
                      className="cursor-pointer rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-slate-300 transition hover:border-amber-400 hover:text-amber-200"
                    >
                      {preset}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Passive Skill Runes */}
            <div className="mt-5">
              <label className="mb-2.5 block text-xs font-black tracking-widest text-cyan-300 uppercase">
                2. Runa Passiva de Batalha (Dom Inicial)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {GIFT_OPTIONS.map((gift) => {
                  const active = gift.id === selectedGift;
                  return (
                    <motion.button
                      key={gift.id}
                      type="button"
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => {
                        playSfx("click");
                        setSelectedGift(gift.id);
                      }}
                      className={`flex cursor-pointer flex-col items-center rounded-xl border-2 p-2.5 text-center transition ${
                        active
                          ? "border-amber-300 bg-amber-500/20 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                          : "border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-current bg-slate-900">
                        {renderGiftIcon(gift.iconName)}
                      </div>
                      <span className="mt-1.5 line-clamp-2 text-[10px] leading-tight font-black">
                        {gift.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl border border-cyan-500/35 bg-slate-950/90 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase">
                    ⚡ Passiva: {activeGift.name}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-cyan-300">
                    {activeGift.verseRef}
                  </span>
                </div>
                <p className="mt-1 text-xs text-emerald-300">
                  {activeGift.bonusDescription}
                </p>
              </div>
            </div>

            {/* Giant AAA LOCK IN Button */}
            <div className="mt-5">
              <MobaButton
                type="submit"
                variant="gold"
                size="xl"
                shape="hex"
                className="w-full"
              >
                ⚔️ CONFIRMAR CAMPEÃO & SKIN
              </MobaButton>
            </div>
          </div>
        </div>
      </form>

      {/* BOTTOM TICKER */}
      <footer className="relative z-20 pb-3 text-center font-mono text-[11px] text-slate-400">
        MUNDO ABERTO 3D • SKINS & ANIMAÇÕES EM TEMPO REAL • JUNIORES &
        ADOLESCENTES
      </footer>
    </div>
  );
}
