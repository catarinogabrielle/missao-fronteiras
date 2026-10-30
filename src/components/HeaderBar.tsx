"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Gem,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { SKIN_OPTIONS } from "@/data/avatarsAndGifts";
import { HeroPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";

interface HeaderBarProps {
  onOpenPassport?: () => void;
  onOpenLeaderPanel: () => void;
  onOpenWardrobe: () => void;
  onSwitchUser?: () => void;
  onGoHome?: () => void;
}

export function HeaderBar({
  onOpenLeaderPanel,
  onOpenWardrobe,
  onSwitchUser,
  onGoHome,
}: HeaderBarProps) {
  const { state, level, playSfx, toggleMute } = useGame();

  if (!state.agent) return null;

  const skinMeta =
    SKIN_OPTIONS.find((s) => s.id === (state.agent?.skinId ?? "padrao")) ||
    SKIN_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 h-10 w-full shrink-0 border-b border-amber-500/35 bg-gradient-to-r from-slate-950/95 via-[#071326]/95 to-slate-950/95 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-2.5">
        {/* TOP-LEFT: Summoner Profile (Hexagonal Portrait + Skin Badge + Rank) */}
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
          className="flex cursor-pointer items-center gap-2 text-left"
        >
          <div className="relative">
            <HeroPortrait
              avatarId={state.agent.avatarId}
              size={28}
              shape="hex"
              active
            />
            <span className="absolute -right-1 -bottom-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded border border-amber-200 bg-gradient-to-b from-amber-300 to-amber-600 px-0.5 text-[8px] font-black text-slate-950 shadow">
              {level}
            </span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate text-xs font-black tracking-wide text-white uppercase">
              {state.agent.name}
            </span>
            <span
              className="hidden rounded border border-white/15 bg-slate-900/90 px-1 py-0.2 text-[8px] font-black uppercase sm:inline-block"
              style={{ color: skinMeta.accentHex }}
            >
              {skinMeta.badgeEmoji} {skinMeta.name}
            </span>
          </div>
        </motion.button>

        {/* TOP-RIGHT: Currency + Skins + Leader + User Switch + Audio */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Streak Flames */}
          <div
            title="Chamas de Fervor"
            className="moba-clip-slant inline-flex items-center gap-1 border border-orange-500/45 bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-black text-orange-300"
          >
            <Flame className="h-3 w-3 fill-orange-400 text-orange-400" />
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
            className="moba-clip-slant inline-flex cursor-pointer items-center gap-1 border border-cyan-400/45 bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-black text-cyan-200 hover:border-amber-300"
          >
            <Gem className="h-3 w-3 text-cyan-300" />
            <span>{state.wisdom}</span>
          </button>

          {/* 3D Skins Wardrobe Button */}
          <MobaButton
            variant="violet"
            size="sm"
            shape="slant"
            onClick={onOpenWardrobe}
            title="Escolher Skin 3D, Campeão & Animações"
            className="!py-0.5 !px-2 !text-[9px]"
          >
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>Skins</span>
          </MobaButton>

          {/* Central do Líder */}
          <MobaButton
            variant="gold"
            size="sm"
            shape="slant"
            onClick={onOpenLeaderPanel}
            title="Central do Líder / Professor (PIN 1234)"
            className="!py-0.5 !px-2 !text-[9px]"
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Líder</span>
          </MobaButton>

          {/* Trocar Usuário */}
          {onSwitchUser && (
            <MobaButton
              variant="obsidian"
              size="sm"
              shape="slant"
              sheen={false}
              onClick={onSwitchUser}
              title="Trocar de Usuário / Selecionar outro Campeão"
              className="!py-0.5 !px-2 !text-[9px]"
            >
              <Users className="h-3 w-3 text-amber-300" />
              <span>Trocar</span>
            </MobaButton>
          )}

          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            title={state.muted ? "Ativar Som" : "Silenciar"}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
          >
            {state.muted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
