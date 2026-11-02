"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  Download,
  Film,
  Flame,
  Gem,
  Maximize2,
  Monitor,
  Sparkles,
  Swords,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { usePwa } from "@/context/PwaContext";
import { useMobileViewport } from "@/lib/useMobileViewport";
import { GIFT_OPTIONS, SKIN_OPTIONS, AVATAR_OPTIONS } from "@/data/avatarsAndGifts";
import { HeroPortrait } from "./GamePortrait";

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
  const { isOnline, offlineReady, triggerInstall } = usePwa();
  const {
    isMobileLandscape,
    isMobilePortrait,
    isCompactMobile,
    isLandscape,
    toggleLandscapeFullscreen,
  } = useMobileViewport();

  if (!state.agent) return null;

  const isPortraitMode = isMobilePortrait || (isCompactMobile && !isLandscape);
  const isLandscapeMode = isMobileLandscape || (isCompactMobile && isLandscape);

  const stampCount = Object.values(state.missionProgress).filter(
    (m) => m.completed
  ).length;

  const xpPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpForNextLevel) * 100)
  );

  const heroMeta = AVATAR_OPTIONS.find((a) => a.id === state.agent?.avatarId);
  const giftMeta = GIFT_OPTIONS.find((g) => g.id === state.agent?.giftId);
  const skinMeta =
    SKIN_OPTIONS.find((s) => s.id === (state.agent?.skinId ?? "padrao")) ||
    SKIN_OPTIONS[0];

  /* =========================================================================
     1. MOBILE PORTRAIT: ULTRA-SLEEK COMPACT HUD (ONE-ROW, ZERO CLUTTER)
     ========================================================================= */
  if (isPortraitMode) {
    return (
      <header className="sticky top-0 z-40 h-13 w-full shrink-0 border-b border-amber-500/25 bg-slate-950/90 px-3 py-1.5 backdrop-blur-xl shadow-lg select-none">
        <div className="flex h-full w-full items-center justify-between gap-2">
          {/* Left: Player Crest & Identity */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onOpenWardrobe();
            }}
            title="Ver Perfil & Skins"
            className="flex items-center gap-2 min-w-0 text-left cursor-pointer"
          >
            <div className="relative shrink-0">
              <HeroPortrait
                avatarId={state.agent.avatarId}
                size={36}
                shape="hex"
                active
              />
              <span className="absolute -right-1 -bottom-0.5 flex h-4 min-w-4 items-center justify-center rounded-md border border-amber-300 bg-gradient-to-b from-amber-400 to-amber-600 px-0.5 text-[8.5px] font-black text-slate-950 shadow">
                {level}
              </span>
            </div>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-white uppercase truncate max-w-[110px]">
                  {state.agent.name}
                </span>
                <span
                  style={{ color: skinMeta.accentHex }}
                  className="text-[9px] font-bold"
                >
                  {skinMeta.badgeEmoji}
                </span>
              </div>
              <div className="text-[9px] font-bold text-amber-300 truncate">
                {levelTitle}
              </div>
            </div>
          </button>

          {/* Right: Currencies & Quick Utility Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Currencies Capsule */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[10px] font-black shadow-inner">
              <div title="Fervor Diário" className="flex items-center gap-1 text-orange-400">
                <Flame className="h-3 w-3 fill-orange-400" />
                <span>{state.streak}</span>
              </div>
              <span className="text-slate-700">|</span>
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenWardrobe();
                }}
                title="Cristais de Sabedoria"
                className="flex items-center gap-1 text-cyan-300 hover:text-white transition cursor-pointer"
              >
                <Gem className="h-3 w-3" />
                <span>{state.wisdom}</span>
              </button>
            </div>

            {/* Story / Tutorial */}
            {onOpenStory && (
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenStory();
                }}
                title="História & Tutorial"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
              >
                <Film className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              title={state.muted ? "Ativar Som" : "Silenciar"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {state.muted ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </button>

            {/* Switch User */}
            {onSwitchUser && (
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onSwitchUser();
                }}
                title="Trocar de Personagem / Sair"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-amber-300 hover:border-amber-400 hover:text-white transition cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  /* =========================================================================
     2. MOBILE LANDSCAPE: WIDESCREEN CONSOLE CLIENT (WILD RIFT STYLE)
     ========================================================================= */
  if (isLandscapeMode) {
    return (
      <header className="sticky top-0 z-40 h-11 w-full max-w-full shrink-0 border-b border-amber-500/25 bg-slate-950/95 px-3 sm:px-4 backdrop-blur-xl shadow-lg select-none">
        <div className="flex h-full w-full items-center justify-between gap-3">
          {/* Brand & Summoner Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                if (onGoHome) onGoHome();
              }}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/icon-192.png"
                alt="Logo"
                className="h-7 w-7 rounded-lg border border-amber-400/70 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              />
              <span className="hidden sm:inline bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-xs font-black tracking-wider text-transparent uppercase">
                Missão Fronteiras
              </span>
            </button>

            <div className="h-4 w-px bg-slate-800" />

            {/* Player Crest */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenWardrobe();
              }}
              className="flex items-center gap-1.5 cursor-pointer text-left"
            >
              <HeroPortrait
                avatarId={state.agent.avatarId}
                size={26}
                shape="hex"
                active
              />
              <span className="text-xs font-black text-white uppercase truncate max-w-[100px]">
                {state.agent.name}
              </span>
              <span className="rounded bg-amber-500/20 px-1 py-0.2 font-mono text-[8px] font-black text-amber-300">
                Nv.{level}
              </span>
            </button>
          </div>

          {/* Center Navigation Dock */}
          <nav className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                if (onGoHome) onGoHome();
              }}
              className="px-2.5 py-1 rounded-lg border border-amber-400/50 bg-amber-500/15 text-[10px] font-black text-amber-300 uppercase transition cursor-pointer"
            >
              Lobby
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenWardrobe();
              }}
              className="px-2.5 py-1 rounded-lg border border-transparent text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-900 transition cursor-pointer uppercase"
            >
              Skins
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenPassport();
              }}
              className="px-2.5 py-1 rounded-lg border border-transparent text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-900 transition cursor-pointer uppercase"
            >
              Coleção ({stampCount})
            </button>

            {onOpenStory && (
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenStory();
                }}
                className="px-2.5 py-1 rounded-lg border border-transparent text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-900 transition cursor-pointer uppercase"
              >
                História
              </button>
            )}

            {onOpenBible && (
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenBible();
                }}
                className="px-2.5 py-1 rounded-lg border border-transparent text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-900 transition cursor-pointer uppercase"
              >
                Palavra
              </button>
            )}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Currencies */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-2 py-0.5 text-[10px] font-black">
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="h-3 w-3 fill-orange-400" />
                <span>{state.streak}</span>
              </div>
              <span className="text-slate-700">|</span>
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenWardrobe();
                }}
                className="flex items-center gap-1 text-cyan-300 hover:text-white transition cursor-pointer"
              >
                <Gem className="h-3 w-3" />
                <span>{state.wisdom}</span>
              </button>
            </div>

            {/* Mute */}
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {state.muted ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleLandscapeFullscreen}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-400 hover:text-white transition cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5 text-cyan-300" />
            </button>

            {/* Switch User */}
            {onSwitchUser && (
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onSwitchUser();
                }}
                title="Trocar de Personagem"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-amber-300 hover:border-amber-400 hover:text-white transition cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  /* =========================================================================
     3. DESKTOP WEB: MODERN AAA GAME CLIENT HEADER (PERFECTLY FIT, NEVER OVERFLOWS)
     ========================================================================= */
  return (
    <header className="sticky top-0 z-40 h-13 sm:h-14 w-full border-b border-amber-500/20 bg-slate-950/90 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.6)] select-none">
      <div className="mx-auto flex h-full w-full max-w-[1580px] items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
        {/* =====================================================================
            ZONE 1: BRAND LOGO & COMPACT SUMMONER IDENTITY (LEFT)
           ===================================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Logo with Title */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              if (onGoHome) onGoHome();
            }}
            title="Base Missionária Ide • Voltar ao Início"
            className="flex items-center gap-2 group cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt="Logo"
              className="h-8 w-8 rounded-xl border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform"
            />
            <div className="hidden xl:flex flex-col text-left leading-tight">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-300">
                BASE IDE
              </span>
              <span className="bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-xs font-black tracking-wide text-transparent uppercase">
                Missão Fronteiras
              </span>
            </div>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Summoner Crest (Compact & Clean) */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onOpenWardrobe();
            }}
            title="Clique para abrir Skins 3D e Personalização"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-amber-400/50 p-1 pr-2.5 transition cursor-pointer shadow-sm text-left group"
          >
            <div className="relative shrink-0">
              <HeroPortrait
                avatarId={state.agent.avatarId}
                size={34}
                shape="hex"
                active
              />
              <span className="absolute -right-1 -bottom-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded border border-amber-200 bg-gradient-to-b from-amber-300 to-amber-600 px-0.5 text-[8px] font-black text-slate-950 shadow">
                {level}
              </span>
            </div>

            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black uppercase text-white tracking-wide truncate max-w-[110px] group-hover:text-amber-300 transition-colors">
                  {state.agent.name}
                </span>
                <span
                  style={{ color: skinMeta.accentHex }}
                  className="rounded bg-slate-950 border border-slate-800 px-1 py-0.2 text-[7.5px] font-black uppercase"
                >
                  {heroMeta?.name}
                </span>
              </div>

              <div className="text-[9px] font-semibold text-cyan-300 flex items-center gap-1 mt-0.5">
                <span className="truncate max-w-[90px]">{levelTitle}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-300 font-mono font-bold">
                  {state.xp} XP
                </span>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-1 h-1 w-20 sm:w-24 overflow-hidden rounded-full border border-slate-800 bg-slate-950">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300"
                />
              </div>
            </div>
          </button>
        </div>

        {/* =====================================================================
            ZONE 2: COMPACT NAVIGATION TABS (CENTER DOCK)
           ===================================================================== */}
        <nav className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 backdrop-blur shadow-inner">
          {/* Lobby (Active View) */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              if (onGoHome) onGoHome();
            }}
            className="flex items-center gap-1 rounded-lg border border-amber-400/60 bg-gradient-to-r from-amber-500/20 to-amber-600/30 px-2.5 py-1 text-xs font-black uppercase text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)] transition cursor-pointer"
          >
            <Swords className="h-3 w-3 text-amber-400" />
            <span>Lobby</span>
          </button>

          {/* Skins 3D */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onOpenWardrobe();
            }}
            className="flex items-center gap-1 rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-800/60 px-2.5 py-1 text-xs font-bold uppercase text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Skins</span>
          </button>

          {/* Passaporte / Coleção */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onOpenPassport();
            }}
            className="flex items-center gap-1 rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-800/60 px-2.5 py-1 text-xs font-bold uppercase text-slate-300 hover:text-white transition cursor-pointer"
          >
            <BookMarked className="h-3 w-3 text-emerald-400" />
            <span>Coleção</span>
            <span className="rounded bg-slate-950 px-1 py-0.2 font-mono text-[8.5px] font-black text-amber-300 border border-slate-800">
              {stampCount}
            </span>
          </button>

          {/* Bíblia de Bolso / Palavra */}
          {onOpenBible && (
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenBible();
              }}
              className="flex items-center gap-1 rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-800/60 px-2.5 py-1 text-xs font-bold uppercase text-slate-300 hover:text-white transition cursor-pointer"
            >
              <BookOpen className="h-3 w-3 text-amber-400" />
              <span>Palavra</span>
            </button>
          )}

          {/* História & Tutorial */}
          {onOpenStory && (
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenStory();
              }}
              className="flex items-center gap-1 rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-800/60 px-2.5 py-1 text-xs font-bold uppercase text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Film className="h-3 w-3 text-rose-400" />
              <span>Tutorial</span>
            </button>
          )}
        </nav>

        {/* =====================================================================
            ZONE 3: ECONOMY CAPSULE & COMPACT UTILITY ACTIONS (RIGHT)
           ===================================================================== */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Currencies Capsule: Streak Flame + Wisdom Gems */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs font-black shadow-inner">
            {/* Daily Streak */}
            <div
              title="Fervor Diário • Dias Consecutivos"
              className="flex items-center gap-1 text-orange-400"
            >
              <Flame className="h-3.5 w-3.5 fill-orange-400" />
              <span>{state.streak}</span>
            </div>

            <span className="text-slate-700">|</span>

            {/* Wisdom Gems */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenWardrobe();
              }}
              title="Cristais de Sabedoria • Clique para abrir Vestiário"
              className="flex items-center gap-1 text-cyan-300 hover:text-white transition cursor-pointer"
            >
              <Gem className="h-3.5 w-3.5" />
              <span>{state.wisdom}</span>
            </button>
          </div>

          {/* PWA Install Button */}
          <button
            type="button"
            onClick={triggerInstall}
            title="Instalar Jogo como Aplicativo"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Projector / TV Mode */}
          <button
            type="button"
            onClick={toggleProjectorMode}
            title={
              state.projectorMode
                ? "Desativar Modo Telão"
                : "Ativar Modo Telão (TV / Projetor)"
            }
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition cursor-pointer shadow-sm ${
              state.projectorMode
                ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            title={state.muted ? "Ativar Som" : "Silenciar Áudio"}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer shadow-sm"
          >
            {state.muted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </button>

          {/* Switch User / Return to Home */}
          {onSwitchUser && (
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onSwitchUser();
              }}
              title="Trocar de Personagem / Sair"
              className="flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-xs font-black uppercase text-amber-300 transition cursor-pointer shadow-sm hover:border-amber-300"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Trocar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
