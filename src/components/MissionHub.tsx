"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Lock,
  Radio,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { Mission } from "@/types/game";
import { useGame } from "@/context/GameContext";
import { getMissionSplash } from "@/lib/assets";
import {
  AVATAR_OPTIONS,
  SKIN_OPTIONS,
} from "@/data/avatarsAndGifts";
import { HeroPreview3D } from "./HeroPreview3D";
import { NpcPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";

interface MissionHubProps {
  onSelectMission: (mission: Mission) => void;
  onOpenPocketBible: (initialTab?: "gospel" | "dictionary" | "school") => void;
  onOpenPrayerRadar: () => void;
  onOpenTribesQuiz: () => void;
  onOpenPassport: () => void;
  onOpenWardrobe: () => void;
  onOpenLeaderPanel: () => void;
  onSwitchUser?: () => void;
}

export function MissionHub({
  onSelectMission,
  onOpenPocketBible,
  onOpenPrayerRadar,
  onOpenTribesQuiz,
  onOpenPassport,
  onOpenWardrobe,
  onSwitchUser,
}: MissionHubProps) {
  const { state, allMissions, isMissionUnlocked, level, levelTitle, playSfx } =
    useGame();

  const defaultMissionId = useMemo(() => {
    const nextIncomplete = allMissions.find(
      (m) => isMissionUnlocked(m) && !state.missionProgress[m.id]?.completed
    );
    return (nextIncomplete || allMissions[0])?.id ?? "amazonia";
  }, [allMissions, isMissionUnlocked, state.missionProgress]);

  const [selectedId, setSelectedId] = useState<string>(defaultMissionId);

  const selectedMission =
    allMissions.find((m) => m.id === selectedId) || allMissions[0];

  const completedIds = useMemo(
    () =>
      allMissions
        .filter((m) => state.missionProgress[m.id]?.completed)
        .map((m) => m.id),
    [allMissions, state.missionProgress]
  );

  const unlockedIds = useMemo(
    () => allMissions.filter((m) => isMissionUnlocked(m)).map((m) => m.id),
    [allMissions, isMissionUnlocked]
  );

  if (!state.agent || !selectedMission) return null;

  const heroMeta = AVATAR_OPTIONS.find((a) => a.id === state.agent?.avatarId);
  const skinMeta =
    SKIN_OPTIONS.find((s) => s.id === (state.agent?.skinId ?? "padrao")) ||
    SKIN_OPTIONS[0];
  const selectedUnlocked = unlockedIds.includes(selectedMission.id);
  const selectedRecord = state.missionProgress[selectedMission.id];
  const selectedPrayed = state.prayedMissionIds.includes(selectedMission.id);
  const selectedSplash = getMissionSplash(
    selectedMission.id,
    selectedMission.biomeId
  );

  return (
    <main className="relative flex-1 h-[calc(100dvh-40px)] w-full overflow-hidden p-2 select-none touch-manipulation">
      {/* Subtle Background Ambient Splash of Highlighted Arena */}
      <AnimatePresence mode="wait">
        <motion.img
          key={selectedSplash}
          src={selectedSplash}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none fixed inset-0 h-full w-full object-cover blur-xs"
        />
      </AnimatePresence>

      <div className="relative z-10 grid h-full w-full max-w-7xl mx-auto grid-cols-12 gap-2 overflow-hidden">
        {/* LEFT WING (5 cols): Live 3D Champion Preview & Quick Console Buttons */}
        <section className="col-span-5 flex flex-col justify-between h-full min-h-0 moba-panel-gold moba-clip-panel p-2 overflow-hidden">
          {/* Top: Identity Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-amber-500/25 pb-1">
            <div className="min-w-0 pr-1 truncate">
              <div className="text-[9px] font-black tracking-widest text-amber-300 uppercase">
                NV.{level} • {levelTitle}
              </div>
              <div className="truncate text-xs font-black text-white uppercase">
                {state.agent.name}{" "}
                <span className="text-[10px] text-cyan-300">
                  ({heroMeta?.name})
                </span>
              </div>
            </div>
            <div
              className="shrink-0 rounded-full border border-amber-400/40 bg-slate-950/80 px-2 py-0.5 text-[9px] font-black"
              style={{ color: skinMeta.accentHex }}
            >
              {skinMeta.badgeEmoji} {skinMeta.name}
            </div>
          </div>

          {/* Center: Live 3D Preview (Fills Available Height smoothly) */}
          <div className="my-0.5 flex flex-1 min-h-0 items-center justify-center overflow-hidden">
            <HeroPreview3D
              avatarId={state.agent.avatarId}
              skinId={state.agent.skinId ?? "padrao"}
              agentName={state.agent.name}
              heightClass="h-full max-h-[160px]"
              showEmoteBar
              compact
            />
          </div>

          {/* Bottom Actions: Wardrobe, User Switch & Utility Tabs */}
          <div className="shrink-0 space-y-1 border-t border-amber-500/25 pt-1">
            <div className="grid grid-cols-2 gap-1.5">
              <MobaButton
                variant="gold"
                size="sm"
                shape="hex"
                onClick={onOpenWardrobe}
                className="w-full !py-1 !text-[10px]"
              >
                <Sparkles className="h-3 w-3" />
                SKINS 3D
              </MobaButton>

              {onSwitchUser ? (
                <MobaButton
                  variant="obsidian"
                  size="sm"
                  shape="slant"
                  sheen={false}
                  onClick={onSwitchUser}
                  className="w-full !py-1 !text-[10px]"
                >
                  <Users className="h-3 w-3 text-amber-300" />
                  TROCAR USUÁRIO
                </MobaButton>
              ) : (
                <MobaButton
                  variant="cyan"
                  size="sm"
                  shape="slant"
                  sheen={false}
                  onClick={() => onOpenPocketBible("gospel")}
                  className="w-full !py-1 !text-[10px]"
                >
                  <BookOpen className="h-3 w-3 text-cyan-300" />
                  GRIMÓRIO
                </MobaButton>
              )}
            </div>

            {/* Utility micro-tabs */}
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => onOpenPocketBible("gospel")}
                title="Grimório Bíblico"
                className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 py-0.5 text-[9px] font-black text-emerald-300 hover:border-emerald-400"
              >
                <BookOpen className="h-2.5 w-2.5 text-emerald-400" />
                <span>Bíblia</span>
              </button>
              <button
                type="button"
                onClick={onOpenPrayerRadar}
                title="Radar de Oração"
                className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 py-0.5 text-[9px] font-black text-amber-300 hover:border-amber-400"
              >
                <Radio className="h-2.5 w-2.5 text-amber-400" />
                <span>Oração</span>
              </button>
              <button
                type="button"
                onClick={onOpenPassport}
                title="Cards & Conquistas"
                className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 py-0.5 text-[9px] font-black text-cyan-300 hover:border-cyan-400"
              >
                <Trophy className="h-2.5 w-2.5 text-cyan-400" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={onOpenTribesQuiz}
                title="Arena de Tribos Multiplayer"
                className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-fuchsia-500/50 bg-fuchsia-950/60 py-0.5 text-[9px] font-black text-fuchsia-200 hover:border-fuchsia-300"
              >
                <Swords className="h-2.5 w-2.5 text-amber-300" />
                <span>Tribos</span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT WING (7 cols): Biome City Selector, NPC Briefing Dossier & Giant Play Button */}
        <section className="col-span-7 flex flex-col justify-between h-full min-h-0 moba-panel-cyan moba-clip-panel p-2.5 overflow-hidden">
          {/* Top: 4 Arena Tabs Strip */}
          <div className="shrink-0">
            <div className="mb-1 flex items-center justify-between px-0.5">
              <span className="text-[9px] font-black tracking-widest text-cyan-300 uppercase">
                SELECIONE A CIDADE NO MAPA
              </span>
              <span className="rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-[9px] font-black text-emerald-300">
                {completedIds.length}/{allMissions.length} CONCLUÍDAS
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {allMissions.map((m) => {
                const isSelected = m.id === selectedMission.id;
                const unlocked = unlockedIds.includes(m.id);
                const done = completedIds.includes(m.id);

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setSelectedId(m.id);
                    }}
                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border p-1 text-center transition ${
                      isSelected
                        ? "border-amber-300 bg-amber-500/20 shadow-[0_0_14px_rgba(245,158,11,0.45)]"
                        : unlocked
                          ? "border-slate-700 bg-slate-900/80 hover:border-cyan-400"
                          : "border-slate-800 bg-slate-950/60 opacity-60 grayscale"
                    }`}
                  >
                    <span className="text-sm">{m.emoji}</span>
                    <span className="w-full truncate text-[10px] font-black text-white uppercase">
                      {m.title}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300">
                      {done ? "✓ Feito" : !unlocked ? "🔒 Bloq" : `Fase ${m.order}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Selected Mission Dossier */}
          <div className="my-1 flex flex-1 min-h-0 flex-col justify-center rounded-xl border border-cyan-500/30 bg-slate-950/85 p-2">
            <div className="flex items-center gap-2">
              <NpcPortrait
                avatarKey={selectedMission.npc.avatarKey}
                size={48}
                shape="hex"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">
                    CONTATO: {selectedMission.npc.name} ({selectedMission.npc.age} anos)
                  </span>
                  {selectedPrayed && (
                    <span className="rounded-full border border-amber-300/50 bg-amber-500/25 px-1.5 py-0.2 text-[8px] font-black text-amber-200">
                      🙏 ORAÇÃO ATIVA
                    </span>
                  )}
                </div>
                <div className="truncate text-xs font-black text-white">
                  {selectedMission.emoji} {selectedMission.title} • {selectedMission.regionName}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-slate-300">
                  {selectedMission.shortDescription}
                </p>
              </div>
            </div>

            {/* Reward and missions summary bar */}
            <div className="mt-1 flex items-center justify-between gap-2 border-t border-slate-800 pt-1 text-[9px]">
              <span className="font-mono font-bold text-emerald-400">
                +{selectedMission.rewardXp} XP • +{selectedMission.rewardWisdom} 💎
              </span>
              <span className="font-mono font-black text-amber-300">
                {selectedRecord?.completed
                  ? `RECORDE: ${selectedRecord.bestTrust}%`
                  : "12 MISSÕES: CORRIDA + TORRES + CHEFE"}
              </span>
            </div>
          </div>

          {/* Bottom: Giant CTA Play Button */}
          <div className="shrink-0">
            {selectedUnlocked ? (
              <MobaButton
                variant="gold"
                size="lg"
                shape="hex"
                onClick={() => onSelectMission(selectedMission)}
                className="w-full !py-2.5 !text-sm font-black shadow-[0_0_24px_rgba(245,158,11,0.5)]"
              >
                <Sparkles className="h-4 w-4" />
                {selectedRecord?.completed
                  ? "REENTRAR NA CIDADE 3D"
                  : "ENTRAR NA CIDADE 3D"}
              </MobaButton>
            ) : (
              <MobaButton
                variant="obsidian"
                size="md"
                shape="hex"
                disabled
                className="w-full !py-2 text-xs"
              >
                <Lock className="h-3.5 w-3.5" />
                VENÇA A FASE {selectedMission.order - 1} PRIMEIRO
              </MobaButton>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
