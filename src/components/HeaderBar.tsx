"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  Download,
  Flame,
  Gem,
  Monitor,
  Shield,
  Volume2,
  VolumeX,
  WifiOff,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { usePwa } from "@/context/PwaContext";
import { GIFT_OPTIONS } from "@/data/avatarsAndGifts";
import { HeroPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";

interface HeaderBarProps {
  onOpenPassport: () => void;
  onOpenLeaderPanel: () => void;
  onGoHome?: () => void;
}

export function HeaderBar({
  onOpenPassport,
  onOpenLeaderPanel,
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

  if (!state.agent) return null;

  const stampCount = Object.values(state.missionProgress).filter(
    (m) => m.completed
  ).length;

  const xpPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpForNextLevel) * 100)
  );

  const giftMeta = GIFT_OPTIONS.find((g) => g.id === state.agent?.giftId);

  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/35 bg-gradient-to-r from-slate-950 via-[#071326] to-slate-950 shadow-[0_6px_25px_rgba(0,0,0,0.65)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
        {/* TOP-LEFT: MOBA Summoner Crest (Hexagonal 3D Portrait + Rank + XP) */}
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
              className="hidden h-8 w-8 rounded-lg border border-amber-400/60 sm:block"
            />
            <div className="relative">
              <HeroPortrait
                avatarId={state.agent.avatarId}
                size={52}
                shape="hex"
                active
              />
              <span className="absolute -right-1.5 -bottom-1 flex h-5 min-w-5 items-center justify-center rounded-md border border-amber-200 bg-gradient-to-b from-amber-300 to-amber-600 px-1 text-[10px] font-black text-slate-950 shadow">
                {level}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wide text-white uppercase sm:text-base">
                {state.agent.name}
              </span>
              {giftMeta && (
                <span className="hidden rounded border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-amber-300 uppercase md:inline-block">
                  {giftMeta.name}
                </span>
              )}
            </div>
            <div className="text-[11px] font-bold text-cyan-300">
              {levelTitle} •{" "}
              <span className="font-mono text-amber-300">{state.xp} XP</span>
            </div>

            {/* Segmented MOBA XP Bar */}
            <div className="mt-1 h-2 w-36 overflow-hidden rounded-full border border-slate-700 bg-slate-900 sm:w-48">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300"
              />
            </div>
          </div>
        </motion.button>

        {/* TOP-RIGHT: MOBA Currency Gems & Quick Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Offline Ready / Offline Status Indicator */}
          {offlineReady && (
            <div
              title={
                isOnline
                  ? "Jogo pronto para funcionar 100% offline!"
                  : "Jogando sem internet (Modo Offline)"
              }
              className={`hidden items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-black tracking-wider uppercase lg:inline-flex ${
                isOnline
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-400/60 bg-amber-500/20 text-amber-300"
              }`}
            >
              {!isOnline && <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? "Offline OK" : "Offline"}</span>
            </div>
          )}

          {/* Install PWA App Button */}
          {!isStandalone && (
            <MobaButton
              variant="emerald"
              size="sm"
              shape="slant"
              onClick={triggerInstall}
              title="Instalar Aplicativo (PWA) para jogar Offline"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Instalar</span>
            </MobaButton>
          )}
          {/* Streak Flames */}
          <div
            title="Chamas de Fervor"
            className="moba-clip-slant inline-flex items-center gap-1.5 border border-orange-500/45 bg-slate-900/90 px-3 py-1.5 text-xs font-black text-orange-300"
          >
            <Flame className="h-4 w-4 fill-orange-400 text-orange-400" />
            <span>{state.streak}</span>
          </div>

          {/* Wisdom Gems */}
          <div
            title="Cristais de Sabedoria"
            className="moba-clip-slant inline-flex items-center gap-1.5 border border-cyan-400/45 bg-slate-900/90 px-3 py-1.5 text-xs font-black text-cyan-200"
          >
            <Gem className="h-4 w-4 text-cyan-300" />
            <span>{state.wisdom}</span>
          </div>

          {/* Passaporte / Coleção Button */}
          <MobaButton
            variant="cyan"
            size="sm"
            shape="slant"
            onClick={onOpenPassport}
          >
            <BookMarked className="h-3.5 w-3.5" />
            <span>Coleção</span>
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

          {/* Líder */}
          <MobaButton
            variant="obsidian"
            size="sm"
            shape="rounded"
            sheen={false}
            onClick={onOpenLeaderPanel}
            title="Painel do Professor / Líder (PIN 1234)"
          >
            <Shield className="h-4 w-4 text-amber-300" />
          </MobaButton>

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
