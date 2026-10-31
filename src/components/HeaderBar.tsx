"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  Download,
  Film,
  Flame,
  Gem,
  Maximize2,
  Monitor,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  WifiOff,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { usePwa } from "@/context/PwaContext";
import { useMobileViewport } from "@/lib/useMobileViewport";
import { GIFT_OPTIONS, SKIN_OPTIONS } from "@/data/avatarsAndGifts";
import { HeroPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";

interface HeaderBarProps {
  onOpenPassport: () => void;
  onOpenWardrobe: () => void;
  onOpenBible?: () => void;
  onOpenStory?: () => void;
  onSwitchUser?: () => void;
  onGoHome?: () => void;
}

export function HeaderBar({
  onOpenPassport,
  onOpenWardrobe,
  onOpenBible,
  onOpenStory,
  onSwitchUser,
  onGoHome,
}: HeaderBarProps) {
  const {
    state,
    level,
    levelTitle,
    xpInCurrentLevel,
    xpForNextLevel,
    toggleMute,
    toggleProjectorMode,
    playSfx,
  } = useGame();
  const { isOnline, offlineReady, isStandalone, triggerInstall } = usePwa();
  const { isMobileDevice, isMobileLandscape, toggleLandscapeFullscreen } =
    useMobileViewport();

  if (!state.agent) return null;

  const stampCount = Object.values(state.missionProgress).filter(
    (m) => m.completed
  ).length;

  const xpPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpForNextLevel) * 100)
  );

  const giftMeta = GIFT_OPTIONS.find((g) => g.id === state.agent?.giftId);
  const skinMeta =
    SKIN_OPTIONS.find((s) => s.id === (state.agent?.skinId ?? "padrao")) ||
    SKIN_OPTIONS[0];

  /* -----------------------------------------------------------
     A. SLEEK AAA MOBILE LANDSCAPE HUD BAR (ECHOES OF ARENA STYLE)
     ----------------------------------------------------------- */
  if (isMobileLandscape) {
    return (
      <header className="sticky top-0 z-40 h-10 sm:h-11 w-full max-w-full shrink-0 border-b border-amber-500/30 bg-gradient-to-r from-slate-950/95 via-[#071326]/95 to-slate-950/95 shadow-[0_4px_20px_rgba(0,0,0,0.7)] backdrop-blur-md px-2 sm:px-3 overflow-hidden">
        <div className="flex h-full w-full items-center justify-between gap-1.5 sm:gap-2">
          {/* Top-Left: Game Emblem & Title */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt="Logo"
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.45)]"
            />
            <span className="font-black text-[11px] sm:text-xs tracking-wider uppercase bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-transparent truncate max-w-[130px] sm:max-w-none">
              Missão Fronteiras
            </span>
          </div>

          {/* Center: MOBA Navigation Tabs (Echoes of Arena: JOGAR | HERÓIS | APRENDER) */}
          <nav className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                if (onGoHome) onGoHome();
              }}
              className="relative px-2 py-0.5 text-xs font-black uppercase text-amber-300 tracking-wider transition cursor-pointer"
            >
              <span>Jogar</span>
              <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 shadow-[0_0_8px_#fbbf24]" />
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenWardrobe();
              }}
              className="px-2 py-0.5 text-xs font-black uppercase text-slate-300 hover:text-white tracking-wider transition cursor-pointer"
            >
              <span>Heróis</span>
            </button>

            {onOpenStory && (
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenStory();
                }}
                className="px-2 py-0.5 text-xs font-black uppercase text-amber-300 hover:text-amber-200 tracking-wider transition cursor-pointer"
              >
                <span>História</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                if (onOpenBible) onOpenBible();
                else onOpenPassport();
              }}
              className="px-2 py-0.5 text-xs font-black uppercase text-slate-300 hover:text-white tracking-wider transition cursor-pointer"
            >
              <span>Aprender</span>
            </button>
          </nav>

          {/* Top-Right: Currencies & Console Control Hub (Ultra-Compact, No Overflow) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Currencies Capsule (Streak + Wisdom) */}
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-[11px] font-black shadow-sm">
              <div
                title="Chamas de Fervor Diário"
                className="flex items-center gap-1.5 text-orange-400"
              >
                <Flame className="h-3.5 w-3.5 fill-orange-400" />
                <span>{state.streak}</span>
              </div>
              <span className="text-slate-600 font-normal">|</span>
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenWardrobe();
                }}
                title="Cristais de Sabedoria • Clique para abrir Vestiário"
                className="flex items-center gap-1.5 text-cyan-300 hover:text-white transition cursor-pointer"
              >
                <Gem className="h-3.5 w-3.5" />
                <span>{state.wisdom}</span>
              </button>
            </div>

            {/* Install PWA Button (Always Available on Mobile, Emerald Green Background) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playSfx("click");
                triggerInstall();
              }}
              title="Instalar Aplicativo (PWA) para jogar Offline"
              className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 px-2 sm:px-2.5 py-1 text-xs font-black text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:brightness-110 cursor-pointer transition uppercase"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Instalar</span>
            </motion.button>

            {/* Utility Cluster: Trocar Jogador, Som, Tela Cheia */}
            <div className="flex items-center gap-1">
              {onSwitchUser && (
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    onSwitchUser();
                  }}
                  title="Trocar de Jogador / Agente"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-amber-300 hover:border-amber-400 hover:text-white transition"
                >
                  <Users className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={toggleMute}
                title={state.muted ? "Ativar Som" : "Silenciar"}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white transition"
              >
                {state.muted ? (
                  <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleLandscapeFullscreen}
                title="Tela Cheia"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-400 hover:text-white transition"
              >
                <Maximize2 className="h-3.5 w-3.5 text-cyan-300" />
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  /* -----------------------------------------------------------
     B. FULL RICH AAA DESKTOP HEADER BAR (RESTORED 100%)
     ----------------------------------------------------------- */
  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/35 bg-gradient-to-r from-slate-950/95 via-[#071326]/95 to-slate-950/95 shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 px-3 py-2 sm:px-6">
        {/* TOP-LEFT: AAA Summoner Crest (Hexagonal Portrait + Skin Badge + Rank + XP) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (onGoHome) {
              playSfx("click");
              onGoHome();
            }
          }}
          className="flex cursor-pointer items-center gap-3 text-left"
        >
          <div className="relative flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/favicon-32.png"
              alt="Logo"
              className="hidden h-8 w-8 rounded-lg border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)] sm:block"
            />
            <div className="relative">
              <HeroPortrait
                avatarId={state.agent.avatarId}
                size={50}
                shape="hex"
                active
              />
              <span className="absolute -right-1.5 -bottom-1 flex h-5 min-w-5 items-center justify-center rounded-md border border-amber-200 bg-gradient-to-b from-amber-300 to-amber-600 px-1 text-[10px] font-black text-slate-950 shadow">
                {level}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-wide text-white uppercase sm:text-base">
                {state.agent.name}
              </span>
              <span
                className="hidden rounded border border-white/15 bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase md:inline-block"
                style={{ color: skinMeta.accentHex }}
              >
                {skinMeta.badgeEmoji} {skinMeta.name}
              </span>
            </div>

            <div className="text-[11px] font-bold text-cyan-300">
              {levelTitle} •{" "}
              <span className="font-mono text-amber-300">{state.xp} XP</span>
              {giftMeta && (
                <span className="hidden lg:inline text-slate-400">
                  {" "}
                  • Dom: {giftMeta.name}
                </span>
              )}
            </div>

            {/* In-Game AAA XP Progress Bar */}
            <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full border border-slate-700 bg-slate-900 sm:w-48">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300"
              />
            </div>
          </div>
        </motion.button>

        {/* TOP-RIGHT: Currencies, Wardrobe, Modes & Master Panel */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {offlineReady && (
            <div
              title={
                isOnline
                  ? "Jogo pronto para funcionar 100% offline!"
                  : "Jogando sem internet (Modo Offline)"
              }
              className={`hidden items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-black tracking-wider uppercase xl:inline-flex ${
                isOnline
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-400/60 bg-amber-500/20 text-amber-300"
              }`}
            >
              {!isOnline && <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? "Offline OK" : "Offline"}</span>
            </div>
          )}

          <MobaButton
            variant="emerald"
            size="sm"
            shape="rounded"
            onClick={triggerInstall}
            title="Instalar Aplicativo (PWA) para jogar Offline"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Instalar App</span>
          </MobaButton>

          {/* Streak Flames */}
          <div
            title="Chamas de Fervor"
            className="inline-flex items-center gap-2 rounded-xl border border-orange-500/60 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 px-4 py-1.5 text-xs font-black text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
          >
            <Flame className="h-4 w-4 fill-orange-400 text-orange-400" />
            <span>{state.streak}</span>
          </div>

          {/* Wisdom Gems */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onOpenWardrobe();
            }}
            title="Cristais de Sabedoria • Clique para abrir Skins 3D"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-400/60 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 px-4 py-1.5 text-xs font-black text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition hover:border-cyan-300 hover:text-white hover:scale-105"
          >
            <Gem className="h-4 w-4 text-cyan-300" />
            <span>{state.wisdom}</span>
          </button>

          {/* 3D Skins Wardrobe Button */}
          <MobaButton
            variant="violet"
            size="sm"
            shape="slant"
            onClick={onOpenWardrobe}
            title="Escolher Skin 3D, Campeão & Animações"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Skins</span>
          </MobaButton>

          {/* História e Tutorial Button */}
          {onOpenStory && (
            <MobaButton
              variant="gold"
              size="sm"
              shape="slant"
              onClick={onOpenStory}
              title="Ver História & Tutorial da Base Ide"
            >
              <Film className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">História</span>
            </MobaButton>
          )}

          {/* Passaporte / Coleção Button */}
          <MobaButton
            variant="cyan"
            size="sm"
            shape="slant"
            onClick={onOpenPassport}
          >
            <BookMarked className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Coleção</span>
            <span className="rounded bg-slate-950/80 px-1.5 text-[10px] text-amber-300">
              {stampCount}
            </span>
          </MobaButton>

          {/* Modo Telão */}
          <MobaButton
            variant={state.projectorMode ? "gold" : "obsidian"}
            size="sm"
            shape="rounded"
            sheen={false}
            onClick={toggleProjectorMode}
            title="Modo Telão (Projetor / TV)"
          >
            <Monitor className="h-4 w-4" />
          </MobaButton>

          {/* Trocar Usuário / Voltar à Home */}
          {onSwitchUser && (
            <MobaButton
              variant="gold"
              size="sm"
              shape="slant"
              onClick={onSwitchUser}
              title="Trocar de Usuário / Selecionar outro Campeão"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Trocar Usuário</span>
            </MobaButton>
          )}

          {/* Fullscreen / Modo Deitado (se celular) */}
          {isMobileDevice && (
            <MobaButton
              variant="cyan"
              size="sm"
              shape="rounded"
              sheen={false}
              onClick={() => toggleLandscapeFullscreen()}
              title="Tela Cheia / Modo Deitado"
            >
              <Maximize2 className="h-4 w-4" />
            </MobaButton>
          )}

          {/* Mute */}
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
      </div>
    </header>
  );
}
