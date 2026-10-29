"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  HeartHandshake,
  Languages,
  MessageSquareHeart,
  Monitor,
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from "lucide-react";
import { AVATAR_OPTIONS, GIFT_OPTIONS } from "@/data/avatarsAndGifts";
import { AvatarId, GiftId } from "@/types/game";
import { HERO_PORTRAITS, MAP_SPLASHES } from "@/lib/assets";
import { useGame } from "@/context/GameContext";
import { usePwa } from "@/context/PwaContext";
import { MobaButton } from "./MobaButton";
import { HeroPortrait } from "./GamePortrait";

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
  const { createAgent, playSfx, state, toggleMute, toggleProjectorMode } =
    useGame();
  const { isOnline, offlineReady, isStandalone, triggerInstall } = usePwa();

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>("lucas");
  const [selectedGift, setSelectedGift] = useState<GiftId>("acolhedor");

  const activeChampion =
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];
  const activeStats = CHAMPION_STATS[selectedAvatar];
  const activeGift =
    GIFT_OPTIONS.find((g) => g.id === selectedGift) || GIFT_OPTIONS[0];

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
    createAgent(name || `Agente ${activeChampion.name}`, selectedAvatar, selectedGift);
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-950">
      {/* Dynamic 3D Arena Splash Wallpaper */}
      <AnimatePresence mode="wait">
        <motion.img
          key={activeStats.arenaBg}
          src={activeStats.arenaBg}
          alt="Arena"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.34, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* MOBA Cinematic Vignette Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/85" />

      {/* TOP MOBA CLIENT BAR */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-8">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt="Missão Fronteiras"
            className="h-12 w-12 rounded-2xl border border-amber-400/70 shadow-[0_0_22px_rgba(245,158,11,0.5)]"
          />
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-amber-300 uppercase">
              <span>BASE MISSIONÁRIA IDE • SELEÇÃO DE CAMPEÃO</span>
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
              <span>Instalar App</span>
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
            variant="obsidian"
            size="sm"
            shape="slant"
            sheen={false}
            onClick={onOpenLeaderPanel}
            title="Painel do Professor / Líder (PIN 1234)"
          >
            <Shield className="h-3.5 w-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Líder</span>
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

      {/* MAIN 3-COLUMN MOBA CHAMPION SELECT STAGE */}
      <form
        onSubmit={handleConfirm}
        className="relative z-20 mx-auto my-auto grid w-full max-w-7xl items-center gap-6 px-4 py-5 sm:px-8 lg:grid-cols-12"
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
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
              {activeChampion.description}
            </p>

            {/* MOBA Power Bars */}
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

        {/* CENTER COLUMN: Giant 3D Champion Splash Showcase + Roster Dock */}
        <div className="order-1 flex flex-col items-center lg:order-2 lg:col-span-4">
          <div className="relative">
            {/* Rotating Arcane Halo behind Champion */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute -inset-4 rounded-full border border-dashed border-amber-400/35"
            />

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
                    CAMPEÃO 3D SELECIONADO
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4 Hexagonal Champion Roster Portraits */}
          <div className="mt-5 flex items-center justify-center gap-3">
            {AVATAR_OPTIONS.map((av) => {
              const isSelected = av.id === selectedAvatar;
              return (
                <motion.button
                  key={av.id}
                  type="button"
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    playSfx("click");
                    setSelectedAvatar(av.id);
                  }}
                  className="group flex flex-col items-center focus:outline-none"
                >
                  <HeroPortrait
                    avatarId={av.id}
                    size={isSelected ? 70 : 60}
                    shape="hex"
                    active={isSelected}
                  />
                  <span
                    className={`mt-1 text-[11px] font-black uppercase ${
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
        </div>

        {/* RIGHT COLUMN: Summoner Name + Passive Ability Runes + LOCK IN Button */}
        <div className="order-3 space-y-4 lg:col-span-4">
          <div className="moba-panel-gold moba-clip-panel p-5">
            {/* Summoner / Agent Name */}
            <div>
              <label className="mb-1.5 block text-xs font-black tracking-widest text-amber-300 uppercase">
                1. Nome de Invocador / Agente
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
                      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-slate-300 transition hover:border-amber-400 hover:text-amber-200"
                    >
                      {preset}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* MOBA Passive Skill Runes (Dons) */}
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
                      className={`flex flex-col items-center rounded-xl border-2 p-2.5 text-center transition ${
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

              {/* Active Passive Skill Tooltip Box */}
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

            {/* Giant MOBA LOCK IN Button */}
            <div className="mt-6">
              <MobaButton
                type="submit"
                variant="gold"
                size="xl"
                shape="hex"
                className="w-full"
              >
                ⚔️ CONFIRMAR CAMPEÃO
              </MobaButton>
            </div>
          </div>
        </div>
      </form>

      {/* BOTTOM TICKER */}
      <footer className="relative z-20 pb-3 text-center font-mono text-[11px] text-slate-400">
        ARENA 3D INTERATIVA • JUNIORES (9–12) & ADOLESCENTES (13–17) • CLIQUE E
        JOGUE
      </footer>
    </div>
  );
}
