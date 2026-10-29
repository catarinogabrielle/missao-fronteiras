"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Lock,
  MapPin,
  Radio,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import { Mission } from "@/types/game";
import { useGame } from "@/context/GameContext";
import { getMissionSplash, HERO_PORTRAITS } from "@/lib/assets";
import { AVATAR_OPTIONS, GIFT_OPTIONS } from "@/data/avatarsAndGifts";
import { WorldGlobe3D } from "./WorldGlobe3D";
import { NpcPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";

interface MissionHubProps {
  onSelectMission: (mission: Mission) => void;
  onOpenPocketBible: (initialTab?: "gospel" | "dictionary" | "school") => void;
  onOpenPrayerRadar: () => void;
  onOpenTribesQuiz: () => void;
  onOpenPassport: () => void;
}

export function MissionHub({
  onSelectMission,
  onOpenPocketBible,
  onOpenPrayerRadar,
  onOpenTribesQuiz,
  onOpenPassport,
}: MissionHubProps) {
  const { state, allMissions, isMissionUnlocked, level, levelTitle, playSfx } =
    useGame();

  // Default selected mission: first unlocked incomplete mission, or first mission
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
  const giftMeta = GIFT_OPTIONS.find((g) => g.id === state.agent?.giftId);
  const selectedUnlocked = unlockedIds.includes(selectedMission.id);
  const selectedRecord = state.missionProgress[selectedMission.id];
  const selectedPrayed = state.prayedMissionIds.includes(selectedMission.id);
  const selectedSplash = getMissionSplash(selectedMission.id);

  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Subtle Background Ambient Splash of Currently Highlighted Arena */}
      <AnimatePresence mode="wait">
        <motion.img
          key={selectedSplash}
          src={selectedSplash}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.16 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 h-full w-full object-cover blur-sm"
        />
      </AnimatePresence>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-6 lg:grid-cols-12 lg:py-6">
        {/* LEFT WING (3 cols): 3D Champion Stand + MOBA Loadout & Modes */}
        <section className="flex flex-col justify-between gap-4 lg:col-span-3">
          {/* 3D Champion Showcase Card */}
          <div className="moba-panel-gold moba-clip-panel overflow-hidden">
            <div className="relative h-44 w-full overflow-hidden sm:h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_PORTRAITS[state.agent.avatarId]}
                alt={state.agent.name}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute right-3 bottom-2.5 left-3">
                <div className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
                  NÍVEL {level} • {levelTitle}
                </div>
                <div className="text-lg font-black text-white uppercase">
                  {state.agent.name}{" "}
                  <span className="text-sm text-cyan-300">
                    ({heroMeta?.name})
                  </span>
                </div>
              </div>
            </div>

            {giftMeta && (
              <div className="border-t border-amber-500/25 px-3.5 py-2.5 text-xs">
                <span className="font-black text-amber-300 uppercase">
                  ⚡ Passiva: {giftMeta.name}
                </span>
                <p className="mt-0.5 text-[11px] text-slate-300">
                  {giftMeta.bonusDescription}
                </p>
              </div>
            )}
          </div>

          {/* MOBA Loadout / Equipment Buttons */}
          <div className="moba-panel-cyan moba-clip-panel space-y-2.5 p-4">
            <div className="text-[11px] font-black tracking-[0.2em] text-cyan-300 uppercase">
              🎒 Arsenal & Grimório
            </div>

            <div className="grid grid-cols-1 gap-2">
              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={() => onOpenPocketBible("gospel")}
                className="w-full !justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  Grimório Bíblico
                </span>
                <span className="font-mono text-[10px] text-emerald-300">
                  {state.studiedGospelSteps.length}/4
                </span>
              </MobaButton>

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={onOpenPrayerRadar}
                className="w-full !justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <Radio className="h-4 w-4 text-amber-400" />
                  Radar de Oração
                </span>
                <span className="font-mono text-[10px] text-amber-300">
                  {state.prayedMissionIds.length}/4
                </span>
              </MobaButton>

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={() => onOpenPocketBible("dictionary")}
                className="w-full !justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <Compass className="h-4 w-4 text-cyan-400" />
                  Cultura & Escola
                </span>
                <span className="font-mono text-[10px] text-cyan-300">INFO</span>
              </MobaButton>

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={onOpenPassport}
                className="w-full !justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-300" />
                  Cards & Medalhas
                </span>
                <span className="font-mono text-[10px] text-amber-300">
                  {completedIds.length}/{allMissions.length}
                </span>
              </MobaButton>
            </div>
          </div>

          {/* MODO ARENA MULTIPLAYER (DESAFIO DE TRIBOS) */}
          <MobaButton
            variant="violet"
            size="lg"
            shape="hex"
            onClick={onOpenTribesQuiz}
            className="w-full py-4"
          >
            <Swords className="h-5 w-5 text-amber-300" />
            <div className="text-left leading-tight">
              <div className="text-xs font-black">ARENA DE TRIBOS 4V4</div>
              <div className="text-[10px] font-semibold text-fuchsia-200 normal-case">
                Modo Multiplayer para Igreja!
              </div>
            </div>
          </MobaButton>
        </section>

        {/* CENTER STAGE (5 cols): 3D Interactive World Globe + Arena Thumbnail Strip */}
        <section className="flex flex-col justify-between gap-3 lg:col-span-5">
          <div className="moba-panel-cyan moba-clip-panel relative flex flex-1 flex-col overflow-hidden p-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <div>
                <div className="text-[10px] font-black tracking-[0.22em] text-cyan-300 uppercase">
                  SELETOR PLANETÁRIO 3D • BASE IDE
                </div>
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  Escolha a Arena de Missão
                </h2>
              </div>
              <span className="rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-black text-emerald-300">
                {completedIds.length}/{allMissions.length} VITÓRIAS
              </span>
            </div>

            {/* Real WebGL 3D Interactive Planet */}
            <div className="my-1 h-[310px] w-full sm:h-[350px]">
              <WorldGlobe3D
                missions={allMissions}
                selectedMissionId={selectedMission.id}
                completedIds={completedIds}
                unlockedIds={unlockedIds}
                onSelectMission={(m) => {
                  playSfx("click");
                  setSelectedId(m.id);
                }}
              />
            </div>

            {/* Bottom Arena Map Selector Cards with 3D Thumbnails */}
            <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
              {allMissions.map((m) => {
                const isSelected = m.id === selectedMission.id;
                const unlocked = unlockedIds.includes(m.id);
                const done = completedIds.includes(m.id);
                const thumb = getMissionSplash(m.id);

                return (
                  <motion.button
                    key={m.id}
                    type="button"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playSfx("click");
                      setSelectedId(m.id);
                    }}
                    className={`relative overflow-hidden rounded-xl border-2 text-left transition ${
                      isSelected
                        ? "border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                        : unlocked
                          ? "border-slate-700 hover:border-cyan-400"
                          : "border-slate-800 opacity-60 grayscale"
                    }`}
                  >
                    <div className="relative h-16 w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt={m.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />

                      <span className="absolute top-1 right-1">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 fill-emerald-950 text-emerald-400" />
                        ) : !unlocked ? (
                          <Lock className="h-3.5 w-3.5 text-slate-300" />
                        ) : null}
                      </span>

                      <div className="absolute right-1.5 bottom-1 left-1.5">
                        <div className="truncate text-[10px] font-black text-white uppercase">
                          {m.order}. {m.title}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT WING (4 cols): Selected 3D Arena Match Dossier & Giant MOBA Play Button */}
        <section className="flex flex-col justify-between lg:col-span-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMission.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="moba-panel-gold moba-clip-panel flex h-full flex-col justify-between overflow-hidden"
            >
              <div>
                {/* 3D Arena Splash Hero Image */}
                <div className="relative h-48 w-full overflow-hidden sm:h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedSplash}
                    alt={selectedMission.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                    <span className="moba-clip-slant bg-slate-950/85 px-3 py-1 text-[10px] font-black tracking-wider text-amber-300 uppercase backdrop-blur">
                      FASE {selectedMission.order} •{" "}
                      {selectedMission.difficulty}
                    </span>

                    {selectedPrayed && (
                      <span className="rounded-full border border-amber-300/50 bg-amber-500/25 px-2.5 py-0.5 text-[10px] font-black text-amber-200 backdrop-blur">
                        🙏 BUFF ORAÇÃO ATIVO
                      </span>
                    )}
                  </div>

                  <div className="absolute right-4 bottom-2 left-4">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedMission.regionName}
                    </div>
                    <h3 className="text-2xl font-black tracking-wide text-white uppercase">
                      {selectedMission.emoji} {selectedMission.title}
                    </h3>
                  </div>
                </div>

                {/* NPC Ally Card & Mission Objective */}
                <div className="space-y-3.5 p-5">
                  <div className="flex items-center gap-3.5 rounded-2xl border border-cyan-500/30 bg-slate-950/85 p-3">
                    <NpcPortrait
                      avatarKey={selectedMission.npc.avatarKey}
                      size={66}
                      shape="hex"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                        PERSONAGEM NO MAPA 3D
                      </div>
                      <div className="text-base font-black text-white">
                        {selectedMission.npc.name} ({selectedMission.npc.age}{" "}
                        anos)
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-300">
                        {selectedMission.npc.bio}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {selectedMission.shortDescription}
                  </p>

                  {/* Objectives & Loot Pills */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        RECOMPENSA DE VITÓRIA
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-black text-emerald-400">
                        +{selectedMission.rewardXp} XP • +
                        {selectedMission.rewardWisdom} 💎
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        RECORDE DE CONFIANÇA
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-black text-amber-300">
                        {selectedRecord?.completed
                          ? `${selectedRecord.bestTrust}% ${
                              selectedRecord.bestTrust >= 100 ? "✨" : ""
                            }`
                          : "NÃO JOGADA"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Giant Animated MOBA PLAY Button */}
              <div className="border-t border-amber-500/25 bg-slate-950/70 p-4">
                {selectedUnlocked ? (
                  <MobaButton
                    variant="gold"
                    size="xl"
                    shape="hex"
                    onClick={() => onSelectMission(selectedMission)}
                    className="w-full"
                  >
                    <Sparkles className="h-5 w-5" />
                    {selectedRecord?.completed
                      ? "REENTRAR NA ARENA 3D"
                      : "ENTRAR NO MAPA 3D"}
                  </MobaButton>
                ) : (
                  <MobaButton
                    variant="obsidian"
                    size="lg"
                    shape="hex"
                    disabled
                    className="w-full"
                  >
                    <Lock className="h-4 w-4" />
                    VENÇA A FASE {selectedMission.order - 1} PRIMEIRO
                  </MobaButton>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
