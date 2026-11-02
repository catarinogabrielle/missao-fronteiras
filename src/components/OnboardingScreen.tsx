"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Download,
  Gamepad2,
  Image as ImageIcon,
  Monitor,
  Sparkles,
  Swords,
  Trash2,
  User,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from "lucide-react";
import { AvatarId, GiftId } from "@/types/game";
import { HERO_PORTRAITS, MAP_SPLASHES } from "@/lib/assets";
import { useGame } from "@/context/GameContext";
import { usePwa } from "@/context/PwaContext";
import { useMobileViewport } from "@/lib/useMobileViewport";
import { HeroPortrait } from "./GamePortrait";
import { HeroPreview3D } from "./HeroPreview3D";

interface OnboardingScreenProps {
  onStartPlay?: (name: string, avatarId: AvatarId) => void;
}

interface ChampionData {
  id: AvatarId;
  name: string;
  title: string;
  tagline: string;
  category: string;
  accentColor: string;
  glowColor: string;
  gradientText: string;
  borderActive: string;
  badgeBg: string;
  badgeText: string;
  specialty: string;
  verse: string;
  verseRef: string;
  arenaBg: string;
  defaultNick: string;
  canonicalGift: GiftId;
}

const CHAMPIONS: Record<AvatarId, ChampionData> = {
  lucas: {
    id: "lucas",
    name: "Lucas",
    title: "O Explorador de Fronteiras",
    tagline: "Aventura, Resgate & Agilidade no Campo",
    category: "EXPLORADOR • CAMPO",
    accentColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.45)",
    gradientText: "from-emerald-300 via-teal-200 to-cyan-300",
    borderActive:
      "border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_0_22px_rgba(16,185,129,0.55)]",
    badgeBg: "bg-emerald-500/20 border-emerald-400/40",
    badgeText: "text-emerald-300",
    specialty:
      "Veloz em trilhas fluviais e selvas, especialista em exploração prática e socorro ribeirinho.",
    verse:
      "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
    verseRef: "Isaías 41:10",
    arenaBg: MAP_SPLASHES.amazonia,
    defaultNick: "Kaleb_BR",
    canonicalGift: "acolhedor",
  },
  sofia: {
    id: "sofia",
    name: "Sofia",
    title: "A Artista da Comunicação",
    tagline: "Criatividade, Arte Visual & Empatia",
    category: "COMUNICAÇÃO • ARTE",
    accentColor: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.45)",
    gradientText: "from-cyan-300 via-sky-200 to-indigo-300",
    borderActive:
      "border-cyan-400 ring-2 ring-cyan-400/60 shadow-[0_0_22px_rgba(6,182,212,0.55)]",
    badgeBg: "bg-cyan-500/20 border-cyan-400/40",
    badgeText: "text-cyan-300",
    specialty:
      "Conecta corações e culturas isoladas através de murais expressivos, música e acolhimento.",
    verse: "Alegrem-se com os que se alegram; chorem com os que choram.",
    verseRef: "Romanos 12:15",
    arenaBg: MAP_SPLASHES.toquio,
    defaultNick: "Sofia_Ide",
    canonicalGift: "comunicador",
  },
  davi: {
    id: "davi",
    name: "Davi",
    title: "O Estrategista Tecnológico",
    tagline: "Tech, Sistemas Digitais & Tradução",
    category: "TECNOLOGIA • TRADUÇÃO",
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.45)",
    gradientText: "from-amber-300 via-yellow-200 to-orange-300",
    borderActive:
      "border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_22px_rgba(245,158,11,0.55)]",
    badgeBg: "bg-amber-500/20 border-amber-400/40",
    badgeText: "text-amber-300",
    specialty:
      "Decifra dialetos complexos e conecta comunidades isoladas via satélite e rádio digital.",
    verse:
      "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.",
    verseRef: "Salmos 119:105",
    arenaBg: MAP_SPLASHES.mocambique,
    defaultNick: "Tribo Atos",
    canonicalGift: "tradutor",
  },
  ester: {
    id: "ester",
    name: "Ester",
    title: "A Diplomata da Fé",
    tagline: "Diplomacia, Sabedoria & Intercessão",
    category: "DIPLOMACIA • ORAÇÃO",
    accentColor: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.45)",
    gradientText: "from-purple-300 via-fuchsia-200 to-pink-300",
    borderActive:
      "border-purple-400 ring-2 ring-purple-400/60 shadow-[0_0_22px_rgba(192,132,252,0.55)]",
    badgeBg: "bg-purple-500/20 border-purple-400/40",
    badgeText: "text-purple-300",
    specialty:
      "Diplomacia destemida e oração perseverante em governos, capitais e regiões de desafio.",
    verse: "Quem sabe se não foi para um momento como este que você chegou?",
    verseRef: "Ester 4:14",
    arenaBg: MAP_SPLASHES.janela1040,
    defaultNick: "Rede Teens",
    canonicalGift: "intercessor",
  },
};

const CHAMPION_LIST: AvatarId[] = ["lucas", "sofia", "davi", "ester"];

export function OnboardingScreen({ onStartPlay }: OnboardingScreenProps) {
  const {
    createAgent,
    deleteProfile,
    playSfx,
    state,
    toggleMute,
    toggleProjectorMode,
  } = useGame();
  const { isOnline, offlineReady, triggerInstall } = usePwa();
  const { isMobileLandscape, isMobilePortrait } = useMobileViewport();

  // Smart initial state: load previously active profile or default to Lucas
  const initialProfile =
    state.agent || state.lastActiveAgent || state.savedProfiles?.[0];
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(
    initialProfile?.avatarId || "lucas"
  );
  const [name, setName] = useState<string>(
    initialProfile?.name || CHAMPIONS.lucas.defaultNick
  );
  const [viewMode, setViewMode] = useState<"3d" | "art">("3d");
  const [hasManuallyEditedName, setHasManuallyEditedName] = useState(false);

  const activeChamp = CHAMPIONS[selectedAvatar];

  const handleSelectAvatar = (avatarId: AvatarId) => {
    playSfx("click");
    setSelectedAvatar(avatarId);

    // If user hasn't typed a custom nickname, auto-suggest for this champion
    if (!hasManuallyEditedName) {
      const savedForChamp = state.savedProfiles?.find(
        (p) => p.avatarId === avatarId
      );
      if (savedForChamp) {
        setName(savedForChamp.name);
      } else {
        setName(CHAMPIONS[avatarId].defaultNick);
      }
    }
  };

  const handleSelectProfileChip = (
    prof: { name: string; avatarId: AvatarId }
  ) => {
    playSfx("click");
    setSelectedAvatar(prof.avatarId);
    setName(prof.name);
    setHasManuallyEditedName(true);
  };

  const handleConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim() || activeChamp.defaultNick;
    playSfx("levelUp");

    if (onStartPlay) {
      onStartPlay(finalName, selectedAvatar);
    } else {
      createAgent(
        finalName,
        selectedAvatar,
        activeChamp.canonicalGift,
        "padrao"
      );
    }
  };

  /* =========================================================================
     1. MOBILE PORTRAIT: VERTICAL SMARTPHONE EXPERIENCE (ULTRA INTUITIVE & CLEAN)
     ========================================================================= */
  if (isMobilePortrait) {
    return (
      <div className="fixed inset-0 flex h-full h-dvh w-full flex-col justify-between overflow-y-auto no-scrollbar bg-slate-950 p-3 select-none touch-manipulation">
        {/* Dynamic Background with Subtle Vignette */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeChamp.arenaBg}
            src={activeChamp.arenaBg}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none fixed inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-950/70 to-slate-950" />

        {/* TOP COMPACT BAR */}
        <header className="relative z-20 flex shrink-0 items-center justify-between rounded-2xl border border-amber-500/25 bg-slate-950/85 px-3 py-2 backdrop-blur-xl shadow-md">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt="Logo"
              className="h-7 w-7 rounded-lg border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                Base Missionária Ide
              </div>
              <h1 className="bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-xs font-black tracking-wider text-transparent uppercase">
                Missão Fronteiras
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={triggerInstall}
              title="Instalar Jogo"
              className="flex items-center gap-1 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-2 py-1 text-[10px] font-black text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer uppercase"
            >
              <Download className="h-3 w-3" />
              <span>Instalar</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              title={state.muted ? "Ativar Som" : "Silenciar"}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition"
            >
              {state.muted ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </button>
          </div>
        </header>

        {/* HERO SHOWCASE CARD */}
        <section className="relative z-10 my-2 flex flex-1 flex-col items-center justify-between rounded-2xl border border-cyan-500/30 bg-slate-950/50 p-3 backdrop-blur-md shadow-xl min-h-0 overflow-hidden">
          {/* Arena Scenic Wallpaper Backdrop Behind 3D Hero */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeChamp.arenaBg}
                src={activeChamp.arenaBg}
                alt="Cenário"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 0.5, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/70" />
          </div>
          {/* Hero Header */}
          <div className="w-full flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white uppercase tracking-wider">
                  {activeChamp.name}
                </span>
                <span
                  style={{
                    borderColor: activeChamp.accentColor,
                    color: activeChamp.accentColor,
                  }}
                  className="rounded-full border bg-slate-950/80 px-2 py-0.2 text-[8px] font-black uppercase tracking-wider"
                >
                  {activeChamp.category.split("•")[0].trim()}
                </span>
              </div>
              <p className="text-[10px] text-amber-300 font-bold tracking-tight">
                {activeChamp.title}
              </p>
            </div>

            {/* 3D / Arte Mode Switcher */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setViewMode(viewMode === "3d" ? "art" : "3d");
              }}
              className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-[9px] font-black text-slate-300 hover:text-white hover:border-cyan-400 transition cursor-pointer shadow"
            >
              {viewMode === "3d" ? (
                <>
                  <ImageIcon className="h-3 w-3 text-cyan-300" />
                  <span>Arte</span>
                </>
              ) : (
                <>
                  <Box className="h-3 w-3 text-amber-300" />
                  <span>3D</span>
                </>
              )}
            </button>
          </div>

          {/* Center Stage: 3D or Art */}
          <div className="relative flex-1 w-full min-h-[160px] max-h-[220px] flex items-center justify-center my-1 overflow-hidden">
            {viewMode === "3d" ? (
              <div className="relative h-full w-full max-w-xs overflow-hidden">
                <HeroPreview3D
                  avatarId={selectedAvatar}
                  skinId="padrao"
                  agentName={name || activeChamp.name}
                  heightClass="h-full w-full"
                  showEmoteBar={false}
                  borderless
                />
              </div>
            ) : (
              <div className="relative h-full max-h-[180px] aspect-square rounded-2xl border-2 border-amber-400/60 overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                <HeroPortrait
                  avatarId={selectedAvatar}
                  size={180}
                  shape="card"
                  active
                />
              </div>
            )}
          </div>

          {/* 4 Champion Selection Dock (1-tap selection) */}
          <div className="w-full pt-1.5 border-t border-cyan-500/20">
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5 text-center">
              1. Escolha seu Personagem:
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {CHAMPION_LIST.map((id) => {
                const champ = CHAMPIONS[id];
                const isSelected = id === selectedAvatar;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectAvatar(id)}
                    className={`relative flex flex-col items-center justify-center rounded-xl border p-1 text-center transition cursor-pointer min-h-[58px] ${
                      isSelected
                        ? champ.borderActive + " bg-slate-900/95 scale-102"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <HeroPortrait
                      avatarId={id}
                      size={28}
                      shape="hex"
                      active={isSelected}
                    />
                    <span className="mt-1 text-[10px] font-black text-white uppercase tracking-tight truncate max-w-full">
                      {champ.name}
                    </span>
                    <span
                      style={{ color: champ.accentColor }}
                      className="text-[7.5px] font-extrabold uppercase tracking-tight truncate max-w-full"
                    >
                      {champ.category.split("•")[0].trim()}
                    </span>
                    {isSelected && (
                      <span
                        style={{ backgroundColor: champ.accentColor }}
                        className="absolute top-1 right-1 h-2 w-2 rounded-full shadow-[0_0_6px_currentColor]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* NICKNAME FORM & CTA BUTTON */}
        <section className="relative z-10 shrink-0 rounded-2xl border border-amber-500/35 bg-slate-950/95 p-3 backdrop-blur-xl shadow-xl space-y-2">
          <form onSubmit={handleConfirm} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
                <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>2. Seu Apelido no Jogo</span>
              </span>
              <span className="font-mono text-[9px] font-bold text-slate-400">
                {name.length}/20
              </span>
            </div>

            {/* Input Field */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
              <input
                type="text"
                maxLength={20}
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasManuallyEditedName(true);
                }}
                placeholder="Digite seu apelido..."
                className="block h-10 w-full rounded-xl border border-amber-400/40 bg-slate-900/95 pl-9 pr-3 text-xs font-black text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Quick Profile Chips (if any exist) */}
            {state.savedProfiles && state.savedProfiles.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                <span className="text-[8px] font-black uppercase text-slate-400 shrink-0">
                  Salvos:
                </span>
                {state.savedProfiles.map((prof) => {
                  const isActive =
                    prof.avatarId === selectedAvatar && prof.name === name;
                  return (
                    <div
                      key={prof.name}
                      className={`shrink-0 flex items-center rounded-lg border transition text-[8.5px] ${
                        isActive
                          ? "border-amber-300 bg-amber-500/25 text-amber-200 ring-1 ring-amber-300"
                          : "border-slate-800 bg-slate-900/90 text-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectProfileChip(prof)}
                        className="px-2 py-0.5 font-bold cursor-pointer truncate max-w-[80px]"
                      >
                        {prof.name}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProfile(prof.name);
                        }}
                        title="Remover"
                        className="p-0.5 pr-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* GIANT JOGAR AGORA CTA */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group relative w-full cursor-pointer overflow-hidden rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 py-3 px-4 text-slate-950 font-black shadow-[0_0_24px_rgba(245,158,11,0.6)] hover:shadow-[0_0_32px_rgba(245,158,11,0.8)] hover:brightness-105 transition-all"
            >
              {/* Dynamic Sheen Light */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-2">
                <Swords className="h-4 w-4 text-slate-950 animate-pulse" />
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black tracking-wider uppercase">
                    ⚔️ JOGAR AGORA
                  </span>
                  <span className="text-[8.5px] font-extrabold text-amber-950 uppercase tracking-widest">
                    Tutorial & Entrar no Lobby
                  </span>
                </div>
              </div>
            </motion.button>
          </form>
        </section>

        {/* COMPACT FOOTER */}
        <footer className="relative z-20 pt-1 text-center font-mono text-[9px] text-slate-500">
          MISSÃO FRONTEIRAS • MARCOS 16:15
        </footer>
      </div>
    );
  }

  /* =========================================================================
     2. MOBILE LANDSCAPE: 100% WIDESCREEN CONSOLE (ULTRA MODERN, NO SCROLL)
     ========================================================================= */
  if (isMobileLandscape) {
    return (
      <div className="fixed inset-0 flex h-full h-dvh w-full flex-col justify-between overflow-hidden bg-slate-950 p-2 sm:p-2.5 md:p-3 select-none touch-manipulation">
        {/* Dynamic Background with Cinematic Vignette */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeChamp.arenaBg}
            src={activeChamp.arenaBg}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none fixed inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="pointer-events-none fixed inset-0 bg-radial from-transparent via-slate-950/50 to-slate-950/90" />

        {/* 1. TOP COMPACT NAVBAR */}
        <header className="relative z-20 flex h-10 sm:h-11 shrink-0 items-center justify-between rounded-xl border border-amber-500/25 bg-slate-950/85 px-3 py-1 backdrop-blur-xl shadow-md">
          {/* Logo & Game Title */}
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt="Logo"
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
            <div className="flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-xs sm:text-sm font-black tracking-wider text-transparent uppercase">
                Missão Fronteiras
              </span>
              <span className="hidden sm:inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.2 text-[8.5px] font-black uppercase tracking-wider text-amber-300">
                Base Ide
              </span>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={triggerInstall}
              title="Instalar Jogo"
              className="flex items-center gap-1 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-2 py-1 text-[10px] font-black text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer uppercase"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Instalar</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              title={state.muted ? "Ativar Som" : "Silenciar"}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition"
            >
              {state.muted ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </button>
          </div>
        </header>

        {/* 2. MAIN 2-COLUMN ARENA (NO OVERFLOW, PERFECT FIT) */}
        <div className="relative z-10 flex flex-1 min-h-0 gap-2.5 sm:gap-3 overflow-hidden my-1">
          {/* LEFT COLUMN: HERO SHOWCASE + 4 CHAMPION SELECTION DOCK (~62% width) */}
          <section className="relative flex flex-1 flex-col justify-between min-h-0 rounded-2xl border border-cyan-500/30 bg-slate-950/50 p-2.5 sm:p-3 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Arena Scenic Wallpaper Backdrop Behind 3D Hero */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeChamp.arenaBg}
                  src={activeChamp.arenaBg}
                  alt="Cenário"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 0.55, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/70" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50" />
            </div>
            {/* Top Identity & 3D/Art Mode Switch */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase drop-shadow">
                    {activeChamp.name}
                  </h1>
                  <span
                    style={{
                      borderColor: activeChamp.accentColor,
                      color: activeChamp.accentColor,
                    }}
                    className="rounded-full border bg-slate-950/80 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider"
                  >
                    {activeChamp.category}
                  </span>
                </div>
                <p className="mt-0.5 text-[10.5px] text-amber-300 font-bold tracking-wide">
                  {activeChamp.title}
                </p>
                <p className="mt-0.5 text-[9.5px] text-slate-300 max-w-sm line-clamp-1">
                  {activeChamp.specialty}
                </p>
              </div>

              {/* 3D vs Art Switcher */}
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  setViewMode(viewMode === "3d" ? "art" : "3d");
                }}
                className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-[9px] font-black text-slate-300 hover:text-white hover:border-cyan-400 transition cursor-pointer shadow"
              >
                {viewMode === "3d" ? (
                  <>
                    <ImageIcon className="h-3 w-3 text-cyan-300" />
                    <span>Arte</span>
                  </>
                ) : (
                  <>
                    <Box className="h-3 w-3 text-amber-300" />
                    <span>3D</span>
                  </>
                )}
              </button>
            </div>

            {/* Center: Live 3D Model Stage or 2D Art */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center my-0.5 overflow-hidden">
              {viewMode === "3d" ? (
                <div className="relative h-full w-full max-w-md overflow-hidden">
                  <HeroPreview3D
                    avatarId={selectedAvatar}
                    skinId="padrao"
                    agentName={name || activeChamp.name}
                    heightClass="h-full w-full"
                    showEmoteBar={false}
                    borderless
                  />
                </div>
              ) : (
                <div className="relative h-full max-h-[170px] aspect-square rounded-2xl border-2 border-amber-400/60 overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                  <HeroPortrait
                    avatarId={selectedAvatar}
                    size={170}
                    shape="card"
                    active
                  />
                </div>
              )}
            </div>

            {/* Bottom: 4 Horizontal Champion Selection Cards */}
            <div className="relative z-10 shrink-0 pt-1.5 border-t border-cyan-500/20">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {CHAMPION_LIST.map((id) => {
                  const champ = CHAMPIONS[id];
                  const isSelected = id === selectedAvatar;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectAvatar(id)}
                      className={`relative flex items-center gap-1.5 rounded-xl border p-1 sm:p-1.5 text-left transition cursor-pointer min-h-[46px] ${
                        isSelected
                          ? champ.borderActive + " bg-slate-900/95"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-600 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <HeroPortrait
                        avatarId={id}
                        size={28}
                        shape="hex"
                        active={isSelected}
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="text-[11px] font-black text-white uppercase tracking-tight truncate">
                          {champ.name}
                        </div>
                        <div
                          style={{ color: champ.accentColor }}
                          className="text-[8px] font-black uppercase tracking-wider truncate"
                        >
                          {champ.category.split("•")[0].trim()}
                        </div>
                      </div>
                      {isSelected && (
                        <span
                          style={{ backgroundColor: champ.accentColor }}
                          className="absolute top-1 right-1 h-2 w-2 rounded-full shadow-[0_0_6px_currentColor]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: NICKNAME & JOGAR AGORA TERMINAL (~38% width) */}
          <section className="relative flex w-72 sm:w-80 md:w-88 shrink-0 flex-col justify-between min-h-0 rounded-2xl border border-amber-500/35 bg-slate-950/95 p-3 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header & Nickname Form */}
            <form onSubmit={handleConfirm} className="flex flex-col gap-2 min-h-0">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
                  <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Seu Apelido no Jogo</span>
                </span>
                <span
                  style={{ color: activeChamp.accentColor }}
                  className="font-mono text-[9px] font-black uppercase"
                >
                  {activeChamp.name}
                </span>
              </div>

              {/* Big Styled Nickname Input */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={20}
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasManuallyEditedName(true);
                  }}
                  placeholder="Digite seu apelido..."
                  className="block h-10 w-full rounded-xl border border-amber-400/40 bg-slate-900/95 pl-9 pr-3 text-xs sm:text-sm font-black text-white placeholder-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/50 focus:outline-none transition shadow-inner"
                />
              </div>

              {/* Saved Profiles Quick Chips (if available) */}
              {state.savedProfiles && state.savedProfiles.length > 0 && (
                <div className="flex flex-col gap-1 mt-0.5">
                  <div className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">
                    Contas Recentes:
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {state.savedProfiles.map((prof) => {
                      const isActive =
                        prof.avatarId === selectedAvatar && prof.name === name;
                      return (
                        <div
                          key={prof.name}
                          className={`shrink-0 flex items-center rounded-lg border transition text-[9px] ${
                            isActive
                              ? "border-amber-300 bg-amber-500/25 text-amber-200 ring-1 ring-amber-300"
                              : "border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-600"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectProfileChip(prof)}
                            className="px-2 py-1 font-bold cursor-pointer truncate max-w-[85px]"
                          >
                            {prof.name}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProfile(prof.name);
                            }}
                            title="Remover"
                            className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Champion Summary Badge */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2 text-[9.5px] text-slate-300 leading-snug">
                <div className="flex items-center justify-between font-black text-white">
                  <span>Campeão: {activeChamp.name}</span>
                  <span style={{ color: activeChamp.accentColor }}>
                    {activeChamp.category}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5 italic">
                  &ldquo;{activeChamp.verse}&rdquo;
                </p>
              </div>
            </form>

            {/* GIANT JOGAR AGORA BUTTON */}
            <div className="pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleConfirm()}
                className="group relative w-full cursor-pointer overflow-hidden rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 py-2.5 px-3 text-slate-950 font-black shadow-[0_0_24px_rgba(245,158,11,0.6)] hover:shadow-[0_0_32px_rgba(245,158,11,0.8)] hover:brightness-105 transition-all"
              >
                {/* Dynamic Sheen Light */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2">
                  <Swords className="h-4 w-4 text-slate-950 animate-pulse" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
                      ⚔️ JOGAR AGORA
                    </span>
                    <span className="text-[8.5px] font-extrabold text-amber-950 uppercase tracking-widest truncate max-w-[200px]">
                      Entrar no Tutorial & Lobby
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* =========================================================================
     3. DESKTOP WEB VERSION: MODERN AAA CONSOLE EXPERIENCE (INTUITIVE & CLEAN)
     ========================================================================= */
  return (
    <div className="relative flex min-h-screen h-full flex-col justify-between overflow-y-auto bg-slate-950 select-none">
      {/* Dynamic Arena Splash Wallpaper */}
      <AnimatePresence mode="wait">
        <motion.img
          key={activeChamp.arenaBg}
          src={activeChamp.arenaBg}
          alt="Arena"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.28, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Cinematic Vignette Gradients */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-slate-950" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />

      {/* TOP AAA CLIENT NAVBAR */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 pt-4 sm:px-8">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt="Missão Fronteiras"
            className="h-11 w-11 rounded-2xl border border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
          />
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-amber-300 uppercase">
              <span>BASE MISSIONÁRIA IDE</span>
              {offlineReady && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[9px] tracking-wider text-emerald-300">
                  {isOnline ? (
                    <Wifi className="h-2.5 w-2.5" />
                  ) : (
                    <WifiOff className="h-2.5 w-2.5 text-amber-300" />
                  )}
                  {isOnline ? "ONLINE" : "OFFLINE"}
                </span>
              )}
            </div>
            <h1 className="bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-xl sm:text-2xl font-black tracking-wide text-transparent uppercase">
              Missão Fronteiras: O Chamado
            </h1>
          </div>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerInstall}
            title="Instalar Jogo (PWA)"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-400/50 bg-emerald-500/20 px-3 py-1.5 text-xs font-black text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer uppercase shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Instalar App</span>
          </button>

          <button
            type="button"
            onClick={toggleProjectorMode}
            title="Alternar Modo Telão"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition cursor-pointer uppercase shadow-sm ${
              state.projectorMode
                ? "border-amber-400 bg-amber-500/20 text-amber-300"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Telão</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            title={state.muted ? "Ativar Som" : "Silenciar"}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition shadow-sm"
          >
            {state.muted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* MAIN STAGE (HERO SHOWCASE + DIRECT ACTION FORM) */}
      <main className="relative z-20 mx-auto my-auto grid w-full max-w-7xl items-center gap-6 px-4 py-6 sm:px-8 lg:grid-cols-12">
        {/* LEFT / CENTER COLUMN: HERO SPOTLIGHT (7 Cols) */}
        <div className="flex flex-col items-center lg:col-span-7">
          {/* Header of Selected Hero */}
          <div className="w-full text-center lg:text-left mb-3">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <span
                style={{
                  borderColor: activeChamp.accentColor,
                  color: activeChamp.accentColor,
                }}
                className="rounded-full border bg-slate-950/80 px-3 py-0.5 text-xs font-black uppercase tracking-wider"
              >
                {activeChamp.category}
              </span>
              <span className="text-xs font-bold text-amber-300 tracking-wide">
                {activeChamp.title}
              </span>
            </div>
            <h2 className="mt-1 text-3xl sm:text-4xl font-black tracking-wide text-white uppercase drop-shadow">
              {activeChamp.name}
            </h2>
            <p className="mt-1 max-w-lg text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeChamp.specialty}
            </p>
          </div>

          {/* 3D vs Art Switcher */}
          <div className="mb-3 inline-flex rounded-full border border-slate-700/80 bg-slate-950/85 p-1 backdrop-blur shadow">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setViewMode("3d");
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black tracking-wider uppercase transition ${
                viewMode === "3d"
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              Boneco 3D
            </button>
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setViewMode("art");
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black tracking-wider uppercase transition ${
                viewMode === "art"
                  ? "bg-cyan-400 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Arte Oficial
            </button>
          </div>

          {/* Hero Display Canvas */}
          <div className="relative flex items-center justify-center w-full max-w-md h-72 sm:h-80 my-1">
            {viewMode === "3d" ? (
              <div className="h-full w-full">
                <HeroPreview3D
                  avatarId={selectedAvatar}
                  skinId="padrao"
                  agentName={name || activeChamp.name}
                  heightClass="h-full w-full"
                  showEmoteBar
                  borderless
                />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedAvatar}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-72 w-72 sm:h-80 sm:w-80 rounded-3xl border-2 border-amber-400/80 overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.3)] bg-slate-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HERO_PORTRAITS[selectedAvatar]}
                    alt={activeChamp.name}
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-3 text-center">
                    <span className="rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-0.5 text-xs font-black tracking-widest text-amber-200 uppercase">
                      ARTE OFICIAL • {activeChamp.name}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* 4 Champion Selection Dock */}
          <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-lg">
            {CHAMPION_LIST.map((id) => {
              const champ = CHAMPIONS[id];
              const isSelected = id === selectedAvatar;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectAvatar(id)}
                  className={`group relative flex flex-col items-center rounded-2xl border p-2 text-center transition cursor-pointer ${
                    isSelected
                      ? champ.borderActive + " bg-slate-900/95 scale-105"
                      : "border-slate-800 bg-slate-900/70 hover:border-slate-600 opacity-80 hover:opacity-100"
                  }`}
                >
                  <HeroPortrait
                    avatarId={id}
                    size={46}
                    shape="hex"
                    active={isSelected}
                  />
                  <span className="mt-1.5 text-xs font-black text-white uppercase tracking-tight">
                    {champ.name}
                  </span>
                  <span
                    style={{ color: champ.accentColor }}
                    className="text-[9px] font-black uppercase tracking-wider mt-0.5"
                  >
                    {champ.category.split("•")[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Biblical Motto Box */}
          <div className="mt-4 w-full max-w-lg rounded-2xl border border-cyan-500/25 bg-slate-950/80 p-3 text-center backdrop-blur">
            <p className="text-xs text-slate-300 italic">
              &ldquo;{activeChamp.verse}&rdquo;
            </p>
            <span className="mt-1 inline-block font-mono text-[10px] font-bold text-amber-300 uppercase tracking-widest">
              — {activeChamp.verseRef}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: AGENT NICKNAME & GIANT JOGAR AGORA (5 Cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleConfirm}
            className="flex flex-col gap-5 rounded-3xl border-2 border-amber-400/40 bg-slate-950/90 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)]"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-black tracking-widest text-amber-300 uppercase">
                <Gamepad2 className="h-4 w-4 text-cyan-400" />
                <span>Identidade do Jogador</span>
              </div>
              <h3 className="mt-1 text-2xl font-black text-white uppercase tracking-wide">
                Escolha seu Apelido
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Você só precisa escolher seu personagem e seu apelido para jogar!
              </p>
            </div>

            {/* Nickname Input Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Apelido no Jogo:
                </label>
                <span className="font-mono text-xs text-slate-400">
                  {name.length}/20
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                <input
                  type="text"
                  maxLength={20}
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasManuallyEditedName(true);
                  }}
                  placeholder="Ex: Kaleb_BR, Sofia_Ide..."
                  className="w-full rounded-2xl border-2 border-amber-500/40 bg-slate-900/90 pl-11 pr-4 py-3 text-base font-black text-white placeholder-slate-500 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Quick Saved Profiles Tags (if existing) */}
            {state.savedProfiles && state.savedProfiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Perfis Rápidos Salvos:
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.savedProfiles.map((prof) => {
                    const isCurrent =
                      prof.avatarId === selectedAvatar && prof.name === name;
                    return (
                      <div
                        key={prof.name}
                        className={`flex items-center rounded-xl border transition shadow-sm ${
                          isCurrent
                            ? "border-amber-300 bg-amber-500/25 text-amber-200 ring-2 ring-amber-300"
                            : "border-slate-700 bg-slate-900/90 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectProfileChip(prof)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer"
                        >
                          <HeroPortrait
                            avatarId={prof.avatarId}
                            size={18}
                            shape="hex"
                            active={isCurrent}
                          />
                          <span>{prof.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProfile(prof.name);
                          }}
                          title={`Excluir ${prof.name}`}
                          className="p-1.5 mr-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selection Card Recap */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-white">Campeão Selecionado:</span>
                <span style={{ color: activeChamp.accentColor }}>
                  {activeChamp.name}
                </span>
              </div>
              <div className="text-xs text-amber-300 font-bold">
                {activeChamp.category}
              </div>
              <p className="text-[11px] text-slate-400">
                Toda vez que você clicar em Jogar Agora, você passará pelo tutorial e entrará direto no Lobby da Missão.
              </p>
            </div>

            {/* GIANT JOGAR AGORA CTA */}
            <div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 py-4 px-6 text-slate-950 font-black shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:shadow-[0_0_45px_rgba(245,158,11,0.9)] hover:brightness-105 transition-all"
              >
                {/* Dynamic Sheen */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  <Swords className="h-6 w-6 text-slate-950 animate-pulse" />
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black tracking-wider uppercase">
                      ⚔️ JOGAR AGORA
                    </span>
                    <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest">
                      Ir para o Tutorial & Entrar no Lobby
                    </span>
                  </div>
                  <Sparkles className="h-5 w-5 text-slate-950 animate-spin" />
                </div>
              </motion.button>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 pb-4 text-center font-mono text-[11px] text-slate-500">
        MISSÃO FRONTEIRAS • BASE MISSIONÁRIA IDE • MARCOS 16:15
      </footer>
    </div>
  );
}
