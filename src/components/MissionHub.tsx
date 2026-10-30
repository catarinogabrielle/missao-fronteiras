"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Lock,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Mission } from "@/types/game";
import { useGame } from "@/context/GameContext";
import { getMissionSplash } from "@/lib/assets";
import {
  AVATAR_OPTIONS,
  GIFT_OPTIONS,
  SKIN_OPTIONS,
} from "@/data/avatarsAndGifts";
import { useMobileViewport } from "@/lib/useMobileViewport";
import { WorldGlobe3D } from "./WorldGlobe3D";
import { HeroPreview3D } from "./HeroPreview3D";
import { HeroPortrait, NpcPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";

const MISSION_TACTICAL_OBJECTIVES: Record<
  string,
  {
    role: string;
    quote: string;
    tasks: [string, string, string];
  }
> = {
  amazonia: {
    role: "GUIA LOCAL & PESCADOR",
    quote: "A maré está subindo e precisamos levar os suprimentos médicos aos ribeirinhos!",
    tasks: [
      "Navegue pelo Rio Negro recolhendo caixas de remédios.",
      "Ative as 3 torres de rádio missionárias na orla.",
      "Conecte-se com Cauã e compartilhe a mensagem de fé.",
    ],
  },
  janela1040: {
    role: "LÍDER DA CARAVANA & DIPLOMATA",
    quote: "As caravanas no deserto necessitam de água viva e mensagens de esperança.",
    tasks: [
      "Guie a caravana através das dunas evitando tempestades.",
      "Restabeleça os poços de água e sinais de comunicação.",
      "Dialogue com os anciãos locais com respeito e sabedoria.",
    ],
  },
  toquio: {
    role: "ESTUDANTE & CRIADORA DE CONTEÚDO",
    quote: "No brilho do neon, milhares buscam um propósito verdadeiro de vida!",
    tasks: [
      "Ative murais digitais e conecte jovens isolados em Shibuya.",
      "Distribua mensagens de acolhimento e escuta atenta.",
      "Una a equipe em oração para transformar corações na metrópole.",
    ],
  },
  mocambique: {
    role: "PROFESSOR & TRADUTOR MACUA",
    quote: "Ouvir as Escrituras na nossa língua mãe alegra toda a comunidade!",
    tasks: [
      "Distribua as áudio-bíblias na savana para vilarejos remotos.",
      "Monte a tenda comunitária sob a grande árvore da vila.",
      "Celebre com a comunidade Macua com cantos e ações de graças.",
    ],
  },
};

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
  onOpenLeaderPanel,
  onSwitchUser,
}: MissionHubProps) {
  const {
    state,
    allMissions,
    isMissionUnlocked,
    level,
    levelTitle,
    xpInCurrentLevel,
    xpForNextLevel,
    playSfx,
  } = useGame();
  const { isMobileLandscape } = useMobileViewport();

  const defaultMissionId = useMemo(() => {
    const nextIncomplete = allMissions.find(
      (m) => isMissionUnlocked(m) && !state.missionProgress[m.id]?.completed
    );
    return (nextIncomplete || allMissions[0])?.id ?? "amazonia";
  }, [allMissions, isMissionUnlocked, state.missionProgress]);

  const [selectedId, setSelectedId] = useState<string>(defaultMissionId);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);

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

  const xpPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpForNextLevel) * 100)
  );

  /* =========================================================================
     MOBILE LANDSCAPE: 100% WIDESCREEN CONSOLE (ECHOES OF ARENA IMAGE 1 & 2 STYLE)
     - Fits 100% in viewport (h-dvh) without scrolling.
     - Top bar: Echoes of Arena tabs (Jogar, Heróis, Aprender) & resource pills.
     - Left (3 cols): Active game mode card, secondary mode list & summoner profile.
     - Center (5 cols): Atmospheric arena with 3D Champion/Globe & 4 city buttons.
     - Right (4 cols): NPC contact card, mission rewards, and giant JOGAR button.
     ========================================================================= */
  if (isMobileLandscape) {
    const tacticalIntel =
      MISSION_TACTICAL_OBJECTIVES[selectedMission.id] ||
      MISSION_TACTICAL_OBJECTIVES.amazonia;

    return (
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-between overflow-hidden bg-slate-950 p-2 select-none touch-manipulation">
        {/* Fullscreen Atmospheric Arena Splash with Vignette */}
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedSplash}
            src={selectedSplash}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed inset-0 h-full w-full object-cover blur-xs"
          />
        </AnimatePresence>
        <div className="pointer-events-none fixed inset-0 bg-radial from-transparent via-slate-950/50 to-slate-950/90" />

        {/* 1. LEFT HUD DOCK (Modes & Summoner Profile - Echoes of Arena Style) */}
        <aside className="relative z-20 flex w-48 sm:w-56 shrink-0 flex-col justify-between h-full py-0.5">
          {/* Quick Access Modes */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-black tracking-widest text-cyan-400 uppercase px-1">
              Modos de Jogo
            </div>

            {/* Active Mode (Glowing) */}
            <div className="w-full flex h-10 items-center justify-between rounded-xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-slate-900/90 to-slate-900/90 px-2.5 text-left text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <span className="flex items-center gap-2 text-xs font-black uppercase truncate">
                <Swords className="h-4 w-4 text-amber-300 shrink-0" />
                <span className="truncate">{selectedMission.title}</span>
              </span>
              <span className="rounded bg-amber-500/25 px-1.5 py-0.5 text-[9px] font-mono font-black text-amber-300 shrink-0">
                Fase {selectedMission.order}
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenTribesQuiz}
              className="w-full flex h-9 sm:h-10 items-center justify-between rounded-xl border border-fuchsia-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-fuchsia-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase">
                <Swords className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" />
                <span>Arena Tribos</span>
              </span>
              <span className="rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-[9px] font-mono font-black text-fuchsia-300">
                4v4
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenPrayerRadar}
              className="w-full flex h-9 sm:h-10 items-center justify-between rounded-xl border border-amber-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-amber-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase">
                <Radio className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Radar Oração</span>
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-mono font-black text-amber-300">
                {state.prayedMissionIds.length}/4
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenPocketBible("gospel")}
              className="w-full flex h-9 sm:h-10 items-center justify-between rounded-xl border border-emerald-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-emerald-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase">
                <BookOpen className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Grimório</span>
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-black text-emerald-300">
                {state.studiedGospelSteps.length}/4
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenPassport}
              className="w-full flex h-9 sm:h-10 items-center justify-between rounded-xl border border-cyan-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-cyan-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase">
                <Trophy className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Passaporte</span>
              </span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-mono font-black text-cyan-300">
                {completedIds.length}/{allMissions.length}
              </span>
            </motion.button>
          </div>

          {/* Bottom-Left: Summoner Profile Card (Echoes of Arena Style) */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playSfx("click");
              if (onSwitchUser) onSwitchUser();
              else onOpenWardrobe();
            }}
            title="Perfil de Invocador • Clique para alternar agente"
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border border-amber-500/40 bg-slate-900/90 p-2 text-left shadow-lg hover:border-amber-300 transition"
          >
            <div className="relative shrink-0">
              <HeroPortrait
                avatarId={state.agent.avatarId}
                size={38}
                shape="hex"
                active
              />
              <span className="absolute -right-1 -bottom-0.5 flex h-4 min-w-4 items-center justify-center rounded border border-amber-200 bg-gradient-to-b from-amber-300 to-amber-600 px-0.5 text-[8.5px] font-black text-slate-950 shadow">
                {level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-black uppercase text-white">
                  {state.agent.name}
                </span>
                <span className="text-[9px] text-amber-300 font-bold">▾</span>
              </div>
              <div className="text-[9px] font-bold text-cyan-300 truncate">
                {levelTitle}
              </div>
              {/* XP Progress Bar */}
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-950">
                <div
                  style={{ width: `${xpPercent}%` }}
                  className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300"
                />
              </div>
            </div>
          </motion.button>
        </aside>

        {/* 2. CENTER STAGE (3D Champion Showcase) */}
        <main className="relative z-10 flex flex-1 min-h-0 flex-col justify-between items-center h-full px-2 py-0.5">
          {/* Top Champion Codename Banner */}
          <div className="rounded-full border border-amber-400/40 bg-slate-950/80 px-4 py-1 backdrop-blur-md shadow-lg flex items-center gap-2 shrink-0">
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              {state.agent.name}
            </span>
            <span className="text-[10px] font-bold text-amber-300 uppercase">
              • {heroMeta?.codename || "EXPLORADOR"}
            </span>
            <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[8px] font-black text-cyan-300 uppercase">
              {heroMeta?.styleTag || "VANGUARDA"}
            </span>
          </div>

          {/* 3D Turntable Centerpiece (Tall & Majestic) */}
          <div className="my-0.5 flex flex-1 min-h-0 w-full items-center justify-center overflow-hidden">
            <HeroPreview3D
              avatarId={state.agent.avatarId}
              skinId={state.agent.skinId ?? "padrao"}
              agentName={state.agent.name}
              heightClass="h-full min-h-[190px] w-full"
              showEmoteBar
              compact
              borderless
            />
          </div>

          {/* Bottom City Status Indicator */}
          <div className="shrink-0 flex items-center gap-2 text-[10px] font-black text-slate-300 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800">
            <span className="text-amber-300 font-mono">
              {completedIds.length}/{allMissions.length}
            </span>
            <span>CIDADES CONCLUÍDAS</span>
          </div>
        </main>

        {/* 3. RIGHT HUD DOCK (The Battle & Mission Pod - Echoes of Arena Style) */}
        <aside className="relative z-20 flex w-60 sm:w-68 shrink-0 flex-col justify-between h-full py-0.5 gap-1.5">
          {/* Active Mission Card (Tap to Change City) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSfx("click");
              setCitySelectorOpen(true);
            }}
            className="flex-1 min-h-0 flex flex-col justify-between rounded-2xl border-2 border-amber-400/50 bg-slate-900/90 p-2.5 shadow-2xl cursor-pointer hover:border-amber-300 transition"
          >
            {/* City Title & Phase */}
            <div className="flex items-center justify-between border-b border-amber-500/25 pb-1">
              <div>
                <div className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-1.5">
                  <span className="text-base">{selectedMission.emoji}</span>
                  <span className="truncate">{selectedMission.title}</span>
                </div>
                <div className="text-[9.5px] font-bold text-amber-300 uppercase">
                  Fase {selectedMission.order} • {selectedMission.difficulty}
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-black text-emerald-300">
                {selectedRecord?.completed ? "✓ FEITA" : "ATIVA"}
              </span>
            </div>

            {/* NPC Ally Dialogue Bubble */}
            <div className="my-1 flex items-center gap-2 rounded-xl bg-slate-950/70 p-1.5 border border-slate-800">
              <NpcPortrait
                avatarKey={selectedMission.npc.avatarKey}
                size={34}
                shape="hex"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black text-cyan-300 truncate">
                  {selectedMission.npc.name} ({selectedMission.npc.age} anos)
                </div>
                <p className="line-clamp-2 text-[8.5px] text-slate-300 leading-snug italic mt-0.5">
                  &ldquo;{tacticalIntel.quote}&rdquo;
                </p>
              </div>
            </div>

            {/* Tap to Change City Pill */}
            <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-cyan-300 text-[9.5px] font-black uppercase">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-cyan-400" />
                <span>Trocar Cidade</span>
              </span>
              <span className="text-amber-300 font-bold">4 Cidades ▾</span>
            </div>
          </motion.div>

          {/* Featured Heroes / Skins Quick Preview (Echoes of Arena Style) */}
          <div className="rounded-xl border border-cyan-500/25 bg-slate-900/80 p-1.5 shadow-md shrink-0">
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[9px] font-black uppercase text-cyan-300 tracking-wider">
                Heróis em Destaque
              </span>
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenWardrobe();
                }}
                className="text-[8.5px] font-bold text-amber-300 hover:text-white uppercase cursor-pointer"
              >
                Vestiário ▾
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {AVATAR_OPTIONS.filter((a) => a.id !== state.agent?.avatarId).slice(0, 3).map((hero) => (
                <button
                  key={hero.id}
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    onOpenWardrobe();
                  }}
                  className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/70 p-1 hover:border-amber-400 transition cursor-pointer"
                >
                  <HeroPortrait avatarId={hero.id} size={26} shape="hex" />
                  <span className="text-[8.5px] font-black uppercase text-white truncate max-w-full mt-0.5">
                    {hero.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Giant Battle Play Button (Echoes of Arena Hexagonal Gem Button) */}
          <div className="shrink-0 space-y-1">
            {selectedUnlocked ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSfx("ult");
                  onSelectMission(selectedMission);
                }}
                className="w-full h-12 sm:h-13 flex flex-col items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer transition"
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm tracking-widest uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {selectedRecord?.completed
                      ? "REENTRAR NA CIDADE"
                      : "JOGAR • ENTRAR NA CIDADE"}
                  </span>
                </div>
                <div className="text-[9px] font-bold text-amber-950 tracking-wider">
                  +{selectedMission.rewardXp} XP • +{selectedMission.rewardWisdom} 💎 Cristais
                </div>
              </motion.button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-500 text-xs font-black uppercase cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                <span>Bloqueado • Conclua Fase {selectedMission.order - 1}</span>
              </button>
            )}

            {/* Region Selector Pill */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setCitySelectorOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1 py-0.5 text-[9px] font-bold text-slate-400 hover:text-amber-300 transition cursor-pointer uppercase"
            >
              <MapPin className="h-2.5 w-2.5 text-cyan-400" />
              <span>Região: <strong className="text-white">{selectedMission.title}</strong> ▾</span>
            </button>
          </div>
        </aside>

        {/* 4. ANIMATED CITY SELECTOR MODAL SHEET */}
        <AnimatePresence>
          {citySelectorOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 select-none"
            >
              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="flex h-full max-h-[92dvh] w-full max-w-5xl flex-col justify-between rounded-3xl border-2 border-amber-400/50 bg-slate-950 p-4 shadow-[0_0_60px_rgba(245,158,11,0.3)]"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-500/25 pb-2">
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-amber-300" />
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Selecione a Cidade Missionária
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCitySelectorOpen(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* 4 Large City Cards */}
                <div className="grid grid-cols-4 gap-3 my-2 flex-1 min-h-0">
                  {allMissions.map((m) => {
                    const isSelected = m.id === selectedMission.id;
                    const unlocked = unlockedIds.includes(m.id);
                    const done = completedIds.includes(m.id);
                    const intel =
                      MISSION_TACTICAL_OBJECTIVES[m.id] ||
                      MISSION_TACTICAL_OBJECTIVES.amazonia;

                    return (
                      <motion.button
                        key={m.id}
                        type="button"
                        whileHover={unlocked ? { scale: 1.03, y: -4 } : {}}
                        whileTap={unlocked ? { scale: 0.97 } : {}}
                        onClick={() => {
                          if (unlocked) {
                            playSfx("click");
                            setSelectedId(m.id);
                            setCitySelectorOpen(false);
                          }
                        }}
                        className={`relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition ${
                          isSelected
                            ? "border-amber-300 bg-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.5)] ring-2 ring-amber-300"
                            : unlocked
                              ? "border-slate-700 bg-slate-900/80 hover:border-cyan-400 cursor-pointer"
                              : "border-slate-800 bg-slate-950/60 opacity-50 grayscale cursor-not-allowed"
                        }`}
                      >
                        {/* Top: Icon & Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{m.emoji}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-black ${
                              done
                                ? "bg-emerald-500/25 text-emerald-300"
                                : unlocked
                                  ? "bg-amber-500/25 text-amber-300"
                                  : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {done ? "✓ CONCLUÍDA" : unlocked ? `FASE ${m.order}` : "BLOQUEADA"}
                          </span>
                        </div>

                        {/* Title & Region */}
                        <div className="my-1">
                          <div className="text-sm font-black text-white uppercase leading-snug">
                            {m.title}
                          </div>
                          <div className="text-[10px] font-bold text-amber-300">
                            {m.difficulty} • {m.regionName}
                          </div>
                          <p className="line-clamp-2 text-[9px] text-slate-300 mt-1 italic">
                            &ldquo;{intel.quote}&rdquo;
                          </p>
                        </div>

                        {/* Rewards */}
                        <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Recompensa:</span>
                          <span className="font-mono font-black text-emerald-400">
                            +{m.rewardXp} XP • +{m.rewardWisdom} 💎
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer Tip */}
                <div className="text-center text-xs font-bold text-slate-400">
                  Toque na cidade desejada para carregar a missão no Hub!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* =========================================================================
     DESKTOP WEB VERSION: 100% RICH AAA CLIENT RESTORED (ORIGINAL DESKTOP)
     ========================================================================= */
  return (
    <main className="relative flex-1 overflow-y-auto max-h-full">
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

      <div className="relative z-10 mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-6 lg:grid-cols-12 lg:py-5">
        {/* LEFT WING (3 cols): Live 3D Animated Champion Stand + Wardrobe & Modes */}
        <section className="flex flex-col justify-between gap-3.5 lg:col-span-3">
          {/* Live 3D Champion & Skin Showcase Card */}
          <div className="moba-panel-gold moba-clip-panel overflow-hidden p-2.5">
            <HeroPreview3D
              avatarId={state.agent.avatarId}
              skinId={state.agent.skinId ?? "padrao"}
              agentName={state.agent.name}
              heightClass="h-56"
              showEmoteBar
              compact
            />

            <div className="mt-2.5 px-1.5">
              <div className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
                NÍVEL {level} • {levelTitle}
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="truncate text-base font-black text-white uppercase">
                  {state.agent.name}{" "}
                  <span className="text-xs text-cyan-300">
                    ({heroMeta?.name})
                  </span>
                </div>
              </div>
              <div
                className="text-[11px] font-black"
                style={{ color: skinMeta.accentHex }}
              >
                {skinMeta.badgeEmoji} {skinMeta.name}
              </div>

              {giftMeta && (
                <p className="mt-1 text-[10px] text-slate-300">
                  ⚡ <strong className="text-amber-300">{giftMeta.name}</strong>
                </p>
              )}

              <div className="mt-2.5 flex flex-col gap-1.5">
                <MobaButton
                  variant="gold"
                  size="sm"
                  shape="hex"
                  onClick={onOpenWardrobe}
                  className="w-full"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  TROCAR SKIN & CAMPEÃO 3D
                </MobaButton>

                {onSwitchUser && (
                  <MobaButton
                    variant="obsidian"
                    size="sm"
                    shape="slant"
                    sheen={false}
                    onClick={onSwitchUser}
                    className="w-full"
                  >
                    <Users className="h-3.5 w-3.5 text-amber-300" />
                    TROCAR USUÁRIO / AGENTE
                  </MobaButton>
                )}
              </div>
            </div>
          </div>

          {/* AAA Arsenal, Grimório & Central do Líder */}
          <div className="moba-panel-cyan moba-clip-panel space-y-2 p-3.5">
            <div className="text-[11px] font-black tracking-[0.2em] text-cyan-300 uppercase">
              🎒 Arsenal & Comando
            </div>

            <div className="grid grid-cols-1 gap-1.5">
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

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={onOpenLeaderPanel}
                className="w-full !justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  Central do Líder
                </span>
                <span className="font-mono text-[10px] text-amber-300">
                  MESTRE
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
            className="w-full py-3.5"
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
                  Escolha a Cidade de Missão
                </h2>
              </div>
              <span className="rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-black text-emerald-300">
                {completedIds.length}/{allMissions.length} VITÓRIAS
              </span>
            </div>

            {/* Real WebGL 3D Interactive Planet */}
            <div className="my-1 h-[310px] w-full sm:h-[360px]">
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
            <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto pt-1 sm:grid-cols-4">
              {allMissions.map((m) => {
                const isSelected = m.id === selectedMission.id;
                const unlocked = unlockedIds.includes(m.id);
                const done = completedIds.includes(m.id);
                const thumb = getMissionSplash(m.id, m.biomeId);

                return (
                  <motion.button
                    key={m.id}
                    type="button"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      playSfx("click");
                      setSelectedId(m.id);
                    }}
                    className={`relative cursor-pointer overflow-hidden rounded-xl border-2 text-left transition ${
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

        {/* RIGHT WING (4 cols): Selected 3D Arena Match Dossier & Giant AAA Play Button */}
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
                        CONTATO PRINCIPAL NO MAPA 3D
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
                        12 MISSÕES NO MAPA
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-black text-amber-300">
                        {selectedRecord?.completed
                          ? `${selectedRecord.bestTrust}% ${
                              selectedRecord.bestTrust >= 100 ? "✨" : ""
                            }`
                          : "CORRIDA + TORRES + CHEFE"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                      ? "REENTRAR NA CIDADE 3D"
                      : "ENTRAR NA CIDADE 3D"}
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
