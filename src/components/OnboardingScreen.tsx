"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Download,
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
    empatia: number;
    sabedoria: number;
    traducao: number;
    intercessao: number;
  }
> = {
  lucas: {
    arenaBg: MAP_SPLASHES.amazonia,
    roleTitle: "VANGUARDA • SERVIÇO PRÁTICO",
    empatia: 90,
    sabedoria: 80,
    traducao: 75,
    intercessao: 85,
  },
  sofia: {
    arenaBg: MAP_SPLASHES.toquio,
    roleTitle: "SUPORTE • CONEXÃO CRIATIVA",
    empatia: 96,
    sabedoria: 84,
    traducao: 80,
    intercessao: 78,
  },
  davi: {
    arenaBg: MAP_SPLASHES.mocambique,
    roleTitle: "ESPECIALISTA • DECODIFICADOR",
    empatia: 78,
    sabedoria: 92,
    traducao: 98,
    intercessao: 80,
  },
  ester: {
    arenaBg: MAP_SPLASHES.janela1040,
    roleTitle: "EMBAIXADORA • CORAGEM & FÉ",
    empatia: 88,
    sabedoria: 90,
    traducao: 82,
    intercessao: 96,
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

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSkin = isSkinUnlocked(previewSkin) ? previewSkin : selectedSkin;
    createAgent(
      name || `Agente ${activeChampion.name}`,
      selectedAvatar,
      selectedGift,
      finalSkin
    );
  };

  return (
    <div className="relative flex h-full h-dvh flex-col justify-between overflow-y-auto bg-slate-950">
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
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* AAA Cinematic Vignette Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/85" />

      {/* TOP AAA CLIENT BAR */}
      <header
        className={`relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-8 ${
          isMobileLandscape ? "pt-2 pb-0" : "flex-wrap pt-4"
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt="Missão Fronteiras"
            className={`rounded-2xl border border-amber-400/70 shadow-[0_0_24px_rgba(245,158,11,0.5)] ${
              isMobileLandscape ? "h-8 w-8" : "h-12 w-12"
            }`}
          />
          <div>
            {!isMobileLandscape && (
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
            )}
            <h1
              className={`bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text font-black tracking-wide text-transparent uppercase ${
                isMobileLandscape ? "text-base" : "text-xl sm:text-2xl"
              }`}
            >
              Missão Fronteiras: O Chamado
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isStandalone && !isMobileLandscape && (
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
          {!isMobileLandscape && (
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
          )}

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
        className={`relative z-20 mx-auto my-auto w-full max-w-7xl items-center gap-3 px-3 sm:px-8 ${
          isMobileLandscape
            ? "grid grid-cols-12 h-[calc(100dvh-54px)] overflow-hidden py-1"
            : "grid lg:grid-cols-12 py-4 gap-5"
        }`}
      >
        {/* LEFT COLUMN: Champion Lore, Stats & Motto Verses (Hidden in mobile landscape for zero-scroll widescreen layout) */}
        {!isMobileLandscape && (
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
        )}

        {/* CENTER / LEFT COLUMN: Live 3D Turntable Showcase + Champion & Skin Selectors */}
        <div
          className={`flex flex-col items-center justify-between ${
            isMobileLandscape
              ? "col-span-5 h-full overflow-hidden py-0.5"
              : "order-1 lg:order-2 lg:col-span-4"
          }`}
        >
          {/* 3D Model vs Official Portrait Mode Switcher */}
          <div
            className={`inline-flex rounded-full border border-slate-700/80 bg-slate-950/85 p-1 backdrop-blur ${
              isMobileLandscape ? "mb-1 scale-90" : "mb-2.5"
            }`}
          >
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
            <div
              className={`w-full ${
                isMobileLandscape ? "max-h-[140px] flex-1" : "max-w-sm"
              }`}
            >
              <HeroPreview3D
                avatarId={selectedAvatar}
                skinId={previewSkin}
                agentName={name || activeChampion.name}
                heightClass={isMobileLandscape ? "h-32" : "h-72 sm:h-80"}
                showEmoteBar
                compact={isMobileLandscape}
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
                className={`relative overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-slate-900 shadow-[0_0_55px_rgba(245,158,11,0.32)] ${
                  isMobileLandscape
                    ? "h-32 w-32"
                    : "h-72 w-72 sm:h-80 sm:w-80"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_PORTRAITS[selectedAvatar]}
                  alt={activeChampion.name}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-2 text-center">
                  <span className="rounded-full border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-amber-200 uppercase">
                    ARTE • {activeChampion.name}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* 4 Hexagonal Champion Roster Portraits */}
          <div
            className={`flex items-center justify-center ${
              isMobileLandscape ? "mt-1 gap-1.5" : "mt-3.5 gap-3"
            }`}
          >
            {AVATAR_OPTIONS.map((av) => {
              const isSelected = av.id === selectedAvatar;
              return (
                <motion.button
                  key={av.id}
                  type="button"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    playSfx("click");
                    setSelectedAvatar(av.id);
                  }}
                  className="group flex cursor-pointer flex-col items-center focus:outline-none"
                >
                  <HeroPortrait
                    avatarId={av.id}
                    size={
                      isMobileLandscape
                        ? isSelected
                          ? 42
                          : 34
                        : isSelected
                          ? 64
                          : 54
                    }
                    shape="hex"
                    active={isSelected}
                  />
                  <span
                    className={`mt-0.5 text-[9px] font-black uppercase ${
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
          <div
            className={`w-full max-w-sm rounded-xl border border-amber-400/30 bg-slate-950/85 backdrop-blur ${
              isMobileLandscape ? "mt-1 p-1.5" : "mt-3 p-2.5 rounded-2xl"
            }`}
          >
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[9px] font-black tracking-wider text-amber-300 uppercase">
                👕 Skin: {activeSkinMeta.name}
              </span>
              {!previewUnlocked && (
                <span className="text-[8px] font-bold text-cyan-300">
                  {activeSkinMeta.costWisdom}💎
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
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
                    className={`relative flex cursor-pointer items-center justify-center rounded-lg border bg-gradient-to-br text-sm transition ${
                      isMobileLandscape ? "h-7" : "h-9 rounded-xl text-base"
                    } ${sk.gradientClass} ${
                      active
                        ? "border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.55)]"
                        : unlocked
                          ? "border-slate-700 hover:border-cyan-400"
                          : "border-slate-800 opacity-65"
                    }`}
                  >
                    <span>{sk.badgeEmoji}</span>
                    {!unlocked && (
                      <Lock className="absolute right-0.5 bottom-0.5 h-2 w-2 text-amber-300" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summoner Name + Passive Ability Runes + LOCK IN Button */}
        <div
          className={`${
            isMobileLandscape
              ? "col-span-7 h-full flex flex-col justify-between overflow-hidden py-0.5"
              : "order-3 space-y-4 lg:col-span-4"
          }`}
        >
          <div
            className={`moba-panel-gold moba-clip-panel flex flex-col justify-between h-full ${
              isMobileLandscape ? "p-3" : "p-5"
            }`}
          >
            <div>
              <label className="mb-1 block text-xs font-black tracking-widest text-amber-300 uppercase">
                1. Nome de Invocador / Equipe
              </label>
              <input
                type="text"
                maxLength={24}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu Nick..."
                className={`w-full rounded-xl border-2 border-amber-500/40 bg-slate-950/90 text-white placeholder-slate-500 transition focus:border-cyan-400 focus:outline-none ${
                  isMobileLandscape
                    ? "px-3 py-1.5 text-xs font-bold"
                    : "px-3.5 py-2.5 text-sm font-black"
                }`}
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {["Kaleb_BR", "Sofia_Ide", "Tribo Atos", "Rede Teens"].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setName(preset);
                      }}
                      className="cursor-pointer rounded-md border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-slate-300 transition hover:border-amber-400 hover:text-amber-200"
                    >
                      {preset}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Passive Skill Runes */}
            <div className={isMobileLandscape ? "mt-1.5" : "mt-5"}>
              <label className="mb-1 block text-xs font-black tracking-widest text-cyan-300 uppercase">
                2. Runa Passiva de Batalha (Dom Inicial)
              </label>

              <div className="grid grid-cols-4 gap-1.5">
                {GIFT_OPTIONS.map((gift) => {
                  const active = gift.id === selectedGift;
                  return (
                    <motion.button
                      key={gift.id}
                      type="button"
                      whileHover={{ scale: 1.06, y: -1 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => {
                        playSfx("click");
                        setSelectedGift(gift.id);
                      }}
                      className={`flex cursor-pointer flex-col items-center rounded-xl border-2 transition ${
                        isMobileLandscape ? "p-1.5" : "p-2.5"
                      } ${
                        active
                          ? "border-amber-300 bg-amber-500/20 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                          : "border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center rounded-full border border-current bg-slate-900 ${
                          isMobileLandscape ? "h-7 w-7" : "h-10 w-10"
                        }`}
                      >
                        {renderGiftIcon(gift.iconName)}
                      </div>
                      <span
                        className={`mt-1 line-clamp-1 font-black ${
                          isMobileLandscape ? "text-[8px]" : "text-[10px]"
                        }`}
                      >
                        {gift.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-1.5 rounded-xl border border-cyan-500/35 bg-slate-950/90 px-3 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-300 uppercase">
                    ⚡ Passiva: {activeGift.name}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-cyan-300">
                    {activeGift.verseRef}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-emerald-300 truncate">
                  {activeGift.bonusDescription}
                </p>
              </div>
            </div>

            {/* Giant AAA LOCK IN Button */}
            <div className={isMobileLandscape ? "mt-2" : "mt-5"}>
              <MobaButton
                type="submit"
                variant="gold"
                size={isMobileLandscape ? "lg" : "xl"}
                shape="hex"
                className="w-full"
              >
                ⚔️ CONFIRMAR CAMPEÃO & SKIN
              </MobaButton>
            </div>
          </div>
        </div>
      </form>

      {/* BOTTOM TICKER (Hidden in mobile landscape for zero-scroll) */}
      {!isMobileLandscape && (
        <footer className="relative z-20 pb-3 text-center font-mono text-[11px] text-slate-400">
          MUNDO ABERTO 3D • SKINS & ANIMAÇÕES EM TEMPO REAL • JUNIORES &
          ADOLESCENTES
        </footer>
      )}
    </div>
  );
}
