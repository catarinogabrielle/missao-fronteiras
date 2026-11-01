"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Film,
  Flame,
  Gem,
  Lock,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
  X,
  Globe2,
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
import { LocalLanguageModal } from "./LocalLanguageModal";
import { CoopMultiplayerModal } from "./CoopMultiplayerModal";

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
    role: "GUIA DA CARAVANA & DIPLOMATA",
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
  sertao: {
    role: "GUARDIÃO DO POÇO & AGENTE DO SEMIÁRIDO",
    quote: "A água do poço jorrou na terra seca! Vamos plantar sementes e esperança viva!",
    tasks: [
      "Perfure e ative a bomba d'água solar no terreiro da comunidade.",
      "Distribua kits de sementes e hortas familiares aos sertanejos.",
      "Organize uma roda de cordel e fé com Mateus e as crianças.",
    ],
  },
  andes: {
    role: "TECELÃ & PASTORA DAS ALTURAS",
    quote: "Nos picos mais altos das cordilheiras, o amor de Cristo aquece cada lar!",
    tasks: [
      "Leve agasalhos térmicos e botas aos vilarejos de alta altitude.",
      "Apoie a alfabetização bíblica das famílias na língua Quechua.",
      "Estabeleça um refúgio de oração e acolhimento nas montanhas.",
    ],
  },
  himalaia: {
    role: "GUIA DAS GARGANTAS & MENSAGEIRO SOLAR",
    quote: "Cada abismo cruzado é uma ponte para a Palavra de Deus entrar nos vales!",
    tasks: [
      "Cruze as pontes pênseis levando tocadores solares de áudio-Bíblia.",
      "Ative as 3 torres de retransmissão nos picos nevados.",
      "Ore com os anciãos das cabanas de pedra celebrando a paz de Cristo.",
    ],
  },
  europa: {
    role: "VOLUNTÁRIA & EMBAIXADORA DO ACOLHIMENTO",
    quote: "Na mesa de Cristo, cada forasteiro encontra uma família que o ama sem limites!",
    tasks: [
      "Sirva refeições quentes e organize oficinas de música para as crianças.",
      "Distribua materiais de acolhimento e Bíblias digitais nos centros de refúgio.",
      "Faça uma oração de cura de traumas e fraternidade internacional.",
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
  onOpenStory?: () => void;
  onSwitchUser?: () => void;
}

export function MissionHub({
  onSelectMission,
  onOpenPocketBible,
  onOpenPrayerRadar,
  onOpenTribesQuiz,
  onOpenPassport,
  onOpenWardrobe,
  onOpenStory,
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
    updateAgentAppearance,
    playSfx,
  } = useGame();
  const { isMobileLandscape, isMobilePortrait, isCompactMobile, isLandscape } = useMobileViewport();
  const isLandscapeMode = isMobileLandscape || (isCompactMobile && isLandscape);
  const isPortraitMode = isMobilePortrait || (isCompactMobile && !isLandscape);

  const defaultMissionId = useMemo(() => {
    const nextIncomplete = allMissions.find(
      (m) => isMissionUnlocked(m) && !state.missionProgress[m.id]?.completed
    );
    return (nextIncomplete || allMissions[0])?.id ?? "amazonia";
  }, [allMissions, isMissionUnlocked, state.missionProgress]);

  const [selectedId, setSelectedId] = useState<string>(defaultMissionId);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [coopModalOpen, setCoopModalOpen] = useState(false);

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
     MOBILE PORTRAIT: 100% NO-SCROLL MODERN GAMER LOBBY (BRAWL STARS / WILD RIFT STYLE)
     - Strictly fits 100% in viewport (h-dvh) without scrolling.
     - Top bar: Profile Avatar + Nick, Level Badge, Crystals & Streak, Tutorial/History button.
     - Center: 3D Champion on glowing pedestal with Level/Skin badge & Emote chips.
     - Bottom: Active Mission Card (Tap to pick from 8 cities) + Giant glowing JOGAR button + Navigation dock.
     ========================================================================= */
  if (isPortraitMode) {
    return (
      <div className="relative flex-1 min-h-0 w-full flex flex-col justify-between overflow-hidden bg-slate-950 p-2 sm:p-2.5 select-none touch-manipulation">
        {/* Fullscreen Atmospheric Arena Splash with Vignette */}
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedSplash}
            src={selectedSplash}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed inset-0 h-full w-full object-cover blur-xs"
          />
        </AnimatePresence>
        <div className="pointer-events-none fixed inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950/95" />

        {/* 1. TOP MOBILE GAMER HUD */}
        <header className="relative z-20 flex items-center justify-between gap-1.5 shrink-0 px-2 py-1.5 rounded-2xl border border-cyan-500/30 bg-slate-950/85 backdrop-blur-xl shadow-lg">
          {/* Left: Player Profile Pill */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              if (onSwitchUser) onSwitchUser();
              else onOpenWardrobe();
            }}
            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
          >
            <div className="relative shrink-0">
              <HeroPortrait
                avatarId={state.agent.avatarId}
                size={34}
                shape="hex"
                active
              />
              <span className="absolute -right-1 -bottom-0.5 flex h-4 min-w-4 items-center justify-center rounded border border-amber-300 bg-gradient-to-b from-amber-400 to-amber-600 px-0.5 text-[8.5px] font-black text-slate-950 shadow">
                {level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-white uppercase leading-tight">
                {state.agent.name}
              </div>
              <div className="text-[9px] font-bold text-amber-300 truncate leading-none mt-0.5">
                {levelTitle}
              </div>
            </div>
          </button>

          {/* Right: Currencies & Quick Story/Tutorial Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Story / Tutorial Button */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                if (onOpenStory) onOpenStory();
              }}
              title="Ver História & Tutorial"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-amber-400/60 bg-amber-500/20 text-[9.5px] font-black text-amber-300 hover:bg-amber-500/30 transition cursor-pointer shadow-sm active:scale-95"
            >
              <Film className="h-3.5 w-3.5 text-amber-400" />
              <span>História</span>
            </button>

            {/* Quick Language Button */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setLanguageModalOpen(true);
              }}
              title="Modo Tradução & Idiomas Locais"
              className="flex items-center gap-1 px-2 py-1 rounded-xl border border-amber-400/60 bg-amber-500/20 text-[9.5px] font-black text-amber-300 hover:bg-amber-500/30 transition cursor-pointer shadow-sm active:scale-95"
            >
              <Globe2 className="h-3.5 w-3.5 text-amber-400" />
            </button>

            {/* Quick Co-op Button */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setCoopModalOpen(true);
              }}
              title="Multiplayer Cooperativo (2P)"
              className="flex items-center gap-1 px-2 py-1 rounded-xl border border-emerald-400/60 bg-emerald-500/20 text-[9.5px] font-black text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer shadow-sm active:scale-95"
            >
              <Users className="h-3.5 w-3.5 text-emerald-400" />
            </button>

            {/* Streak */}
            <div className="flex items-center gap-1 rounded-xl border border-orange-500/40 bg-slate-900/90 px-2 py-1 font-mono text-[10px] font-black text-orange-400">
              <Flame className="h-3 w-3 text-orange-400 fill-orange-400" />
              <span>{state.streak}</span>
            </div>

            {/* Diamonds */}
            <div className="flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-slate-900/90 px-2 py-1 font-mono text-[10px] font-black text-cyan-300">
              <Gem className="h-3 w-3 text-cyan-400" />
              <span>{state.wisdom}</span>
            </div>
          </div>
        </header>

        {/* 2. CENTER STAGE: 3D CHAMPION TURNTABLE (Fits tightly in viewport) */}
        <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden my-1">
          {/* Champion & Skin Pill */}
          <div className="rounded-full border border-amber-400/50 bg-slate-950/90 px-3 py-1 backdrop-blur-md shadow-md flex items-center gap-2 mb-1 shrink-0">
            <span className="text-xs font-black text-amber-300 uppercase">
              {heroMeta?.name || "CAMPEÃO"}
            </span>
            <span className="text-[9.5px] font-bold text-slate-300 uppercase">
              • {heroMeta?.codename || "EXPLORADOR"}
            </span>
            <span
              className="rounded-full bg-slate-900 border border-slate-700 px-2 py-0.5 text-[8.5px] font-black uppercase"
              style={{ color: skinMeta.accentHex }}
            >
              {skinMeta.name} (Nív. {skinMeta.unlockLevel})
            </span>
          </div>

          {/* 3D Model Display */}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden">
            <HeroPreview3D
              avatarId={state.agent.avatarId}
              skinId={state.agent.skinId ?? "padrao"}
              agentName={state.agent.name}
              heightClass="h-full w-full"
              showEmoteBar
              compact
              borderless
            />
          </div>
        </main>

        {/* 3. BOTTOM GAMER DOCK: Mission Selector Card + Giant JOGAR Button + Actions */}
        <footer className="relative z-20 shrink-0 space-y-1.5">
          {/* Selected City Card (Tappable to pick from 8 cities) */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setCitySelectorOpen(true);
            }}
            className="w-full flex items-center justify-between rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 p-2 shadow-lg hover:border-amber-300 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-2xl shrink-0">{selectedMission.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-black text-white uppercase">
                    {selectedMission.title}
                  </span>
                  <span className="rounded bg-amber-500/25 px-1.5 py-0.2 font-mono text-[8.5px] font-black text-amber-300 uppercase shrink-0">
                    Fase {selectedMission.order}
                  </span>
                </div>
                <div className="text-[9px] font-bold text-amber-300 truncate">
                  {selectedMission.difficulty} • {selectedMission.regionName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-800">
              <div className="text-right">
                <div className="text-[8px] font-bold text-slate-400 uppercase">Recompensa</div>
                <div className="font-mono text-[9px] font-black text-emerald-400">
                  +{selectedMission.rewardXp} XP • +{selectedMission.rewardWisdom} 💎
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-cyan-400" />
            </div>
          </button>

          {/* Giant JOGAR Button */}
          {selectedUnlocked ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playSfx("ult");
                onSelectMission(selectedMission);
              }}
              className="w-full py-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_24px_rgba(245,158,11,0.65)] hover:shadow-[0_0_36px_rgba(245,158,11,0.85)] cursor-pointer transition active:scale-95"
            >
              <Swords className="h-5 w-5 fill-slate-950 text-slate-950 shrink-0" />
              <div className="text-center">
                <div className="text-base font-black tracking-widest uppercase leading-tight">
                  JOGAR AGORA
                </div>
                <div className="text-[9px] font-extrabold uppercase text-amber-950/90 leading-none">
                  ENTRAR NA CIDADE • FASE {selectedMission.order}
                </div>
              </div>
            </motion.button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-500 text-xs font-black uppercase cursor-not-allowed"
            >
              <Lock className="h-4 w-4" />
              <span>Bloqueado • Conclua a Fase {selectedMission.order - 1}</span>
            </button>
          )}

          {/* Bottom Quick Actions Row (4 Essential Navigation Icons) */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setCitySelectorOpen(true);
              }}
              className="flex flex-col items-center justify-center py-1.5 rounded-xl border border-amber-500/40 bg-slate-900/90 text-amber-300 hover:border-amber-400 transition cursor-pointer text-[8px] font-black uppercase shadow-sm"
            >
              <Compass className="h-3.5 w-3.5 mb-0.5 text-amber-400" />
              <span>8 Cidades</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenWardrobe();
              }}
              className="flex flex-col items-center justify-center py-1.5 rounded-xl border border-cyan-500/40 bg-slate-900/90 text-cyan-300 hover:border-cyan-400 transition cursor-pointer text-[8px] font-black uppercase shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 mb-0.5 text-cyan-400" />
              <span>Skins 3D</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                if (onOpenStory) onOpenStory();
              }}
              className="flex flex-col items-center justify-center py-1.5 rounded-xl border border-emerald-500/40 bg-slate-900/90 text-emerald-300 hover:border-emerald-400 transition cursor-pointer text-[8px] font-black uppercase shadow-sm"
            >
              <Film className="h-3.5 w-3.5 mb-0.5 text-emerald-400" />
              <span>Tutorial</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenPassport();
              }}
              className="flex flex-col items-center justify-center py-1.5 rounded-xl border border-fuchsia-500/40 bg-slate-900/90 text-fuchsia-300 hover:border-fuchsia-400 transition cursor-pointer text-[8px] font-black uppercase shadow-sm"
            >
              <Trophy className="h-3.5 w-3.5 mb-0.5 text-fuchsia-400" />
              <span>Coleção</span>
            </button>
          </div>
        </footer>

        {/* 8 Dynamic City Selector Modal Sheet */}
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
                className="flex h-full max-h-[92dvh] w-full max-w-lg flex-col justify-between rounded-3xl border-2 border-amber-400/50 bg-slate-950 p-4 shadow-[0_0_60px_rgba(245,158,11,0.3)]"
              >
                <div className="flex items-center justify-between border-b border-amber-500/25 pb-2">
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-amber-300" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Selecione a Cidade Missionária
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCitySelectorOpen(false)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 flex-1 min-h-0 overflow-y-auto pr-1">
                  {allMissions.map((m) => {
                    const isSelected = m.id === selectedMission.id;
                    const unlocked = unlockedIds.includes(m.id);
                    const done = completedIds.includes(m.id);
                    const splash = getMissionSplash(m.id, m.biomeId);

                    return (
                      <motion.button
                        key={m.id}
                        type="button"
                        whileHover={unlocked ? { scale: 1.02 } : {}}
                        whileTap={unlocked ? { scale: 0.98 } : {}}
                        onClick={() => {
                          if (unlocked) {
                            playSfx("click");
                            setSelectedId(m.id);
                            setCitySelectorOpen(false);
                          }
                        }}
                        className={`group relative flex flex-col justify-between rounded-2xl border-2 p-2.5 text-left transition overflow-hidden min-h-[120px] ${
                          isSelected
                            ? "border-amber-300 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-amber-300"
                            : unlocked
                              ? "border-slate-700 bg-slate-900/90 hover:border-cyan-400 cursor-pointer"
                              : "border-slate-800 bg-slate-950/70 opacity-50 grayscale cursor-not-allowed"
                        }`}
                      >
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <img
                            src={splash}
                            alt=""
                            className="h-full w-full object-cover opacity-25"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/50" />
                        </div>

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-xl">{m.emoji}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[8px] font-mono font-black ${
                              done
                                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/40"
                                : unlocked
                                  ? "bg-amber-500/30 text-amber-300 border border-amber-400/40"
                                  : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {done ? "✓" : unlocked ? `F.${m.order}` : "🔒"}
                          </span>
                        </div>

                        <div className="relative z-10 my-0.5">
                          <div className="text-xs font-black text-white uppercase truncate">
                            {m.title}
                          </div>
                          <div className="text-[8.5px] font-bold text-amber-300 truncate">
                            {m.regionName}
                          </div>
                        </div>

                        <div className="relative z-10 border-t border-slate-800/80 pt-1 text-[8.5px] font-mono font-black text-emerald-400">
                          +{m.rewardXp} XP • +{m.rewardWisdom} 💎
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="text-center text-[10px] font-bold text-slate-400 border-t border-slate-800/80 pt-1.5">
                  Toque para escolher sua próxima fronteira 3D!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Local Language Modal */}
        <AnimatePresence>
          {languageModalOpen && (
            <LocalLanguageModal
              initialMissionId={selectedMission.id}
              onClose={() => setLanguageModalOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Co-op Multiplayer Modal */}
        <AnimatePresence>
          {coopModalOpen && (
            <CoopMultiplayerModal
              onClose={() => setCoopModalOpen(false)}
              onStartCoop={() => {
                onSelectMission(selectedMission);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* =========================================================================
     MOBILE LANDSCAPE: 100% WIDESCREEN CONSOLE (ECHOES OF ARENA IMAGE 1 & 2 STYLE)
     - Fits 100% in viewport (h-dvh) without scrolling.
     - Top bar: Echoes of Arena tabs (Jogar, Heróis, Aprender) & resource pills.
     - Left (3 cols): Active game mode card, secondary mode list & summoner profile.
     - Center (5 cols): Atmospheric arena with 3D Champion/Globe & 4 city buttons.
     - Right (4 cols): NPC contact card, mission rewards, and giant JOGAR button.
     ========================================================================= */
  if (isLandscapeMode) {
    const tacticalIntel =
      MISSION_TACTICAL_OBJECTIVES[selectedMission.id] ||
      MISSION_TACTICAL_OBJECTIVES.amazonia;

    return (
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-between overflow-hidden bg-slate-950 p-2.5 sm:p-3.5 md:p-4 gap-2.5 sm:gap-3.5 select-none touch-manipulation">
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

        {/* 1. LEFT HUD DOCK (Modes & Summoner Profile - Spacious Floating Glass Card) */}
        <aside className="relative z-20 flex w-48 sm:w-52 md:w-56 shrink-0 flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl p-2.5 sm:p-3 shadow-2xl overflow-hidden">
          {/* Quick Access Modes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-1 text-[9.5px] font-black tracking-widest text-cyan-400 uppercase">
              <Compass className="h-3 w-3 text-cyan-400" />
              <span>Modos de Jogo</span>
            </div>

            {/* Active Mode (Glowing, 2-line title to never truncate) */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setCitySelectorOpen(true);
              }}
              title="Clique para alternar entre as 8 cidades e missões"
              className="w-full flex h-11 items-center gap-2 rounded-xl border-2 border-amber-400/70 bg-gradient-to-r from-amber-500/25 via-slate-900/95 to-slate-900/95 px-2.5 text-left shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:border-amber-300 cursor-pointer transition"
            >
              <Swords className="h-4 w-4 text-amber-300 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase text-white truncate leading-tight">
                  {selectedMission.title}
                </div>
                <div className="text-[8.5px] font-bold text-amber-300 uppercase truncate flex items-center justify-between">
                  <span>Fase {selectedMission.order}</span>
                  <span className="text-cyan-400 font-mono">VER MAPA ▾</span>
                </div>
              </div>
            </button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenTribesQuiz}
              className="w-full flex h-8 sm:h-8.5 items-center justify-between rounded-xl border border-fuchsia-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-fuchsia-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-1.5 text-xs font-black uppercase">
                <Swords className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" />
                <span>Arena Tribos</span>
              </span>
              <span className="rounded bg-fuchsia-500/20 px-1.5 py-0.2 text-[8.5px] font-mono font-black text-fuchsia-300">
                4v4
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenPrayerRadar}
              className="w-full flex h-8 sm:h-8.5 items-center justify-between rounded-xl border border-amber-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-amber-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-1.5 text-xs font-black uppercase">
                <Radio className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Radar Oração</span>
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[8.5px] font-mono font-black text-amber-300">
                {state.prayedMissionIds.length}/4
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenPocketBible("gospel")}
              className="w-full flex h-8 sm:h-8.5 items-center justify-between rounded-xl border border-emerald-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-emerald-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-1.5 text-xs font-black uppercase">
                <BookOpen className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Grimório</span>
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[8.5px] font-mono font-black text-emerald-300">
                {state.studiedGospelSteps.length}/4
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenPassport}
              className="w-full flex h-8 sm:h-8.5 items-center justify-between rounded-xl border border-cyan-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-cyan-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-1.5 text-xs font-black uppercase">
                <Trophy className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Passaporte</span>
              </span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[8.5px] font-mono font-black text-cyan-300">
                {completedIds.length}/{allMissions.length}
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playSfx("click");
                setLanguageModalOpen(true);
              }}
              className="w-full flex h-8 sm:h-8.5 items-center justify-between rounded-xl border border-amber-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-amber-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-1.5 text-xs font-black uppercase">
                <Globe2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Idiomas</span>
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[8.5px] font-mono font-black text-amber-300">
                8 Povos
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playSfx("click");
                setCoopModalOpen(true);
              }}
              className="w-full flex h-8 sm:h-8.5 items-center justify-between rounded-xl border border-emerald-500/35 bg-slate-900/85 px-2.5 text-left text-slate-200 hover:border-emerald-400 shadow-md cursor-pointer transition"
            >
              <span className="flex items-center gap-1.5 text-xs font-black uppercase">
                <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Co-op (2P)</span>
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[8.5px] font-mono font-black text-emerald-300">
                Dupla
              </span>
            </motion.button>
          </div>

          {/* Bottom-Left: Summoner Profile Card (Spacious, Never Cuts Off XP) */}
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
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-amber-500/40 bg-slate-900/95 p-2 text-left shadow-lg hover:border-amber-300 transition shrink-0"
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
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-black uppercase text-white">
                  {state.agent.name}
                </span>
                <span className="text-[8.5px] text-amber-300 font-bold">▾</span>
              </div>
              <div className="text-[8.5px] font-bold text-cyan-300 truncate leading-none mt-0.5">
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

        {/* 2. CENTER STAGE (3D Champion Showcase + 8 Cities Visual Map Horizontal Strip) */}
        <main className="relative z-10 flex flex-1 min-w-0 h-full flex-col justify-between items-center px-1.5 sm:px-3 overflow-hidden">
          {/* Top Champion & Skin Showcase Banner (Eliminates Duplicate Nickname!) */}
          <div className="rounded-full border border-amber-400/50 bg-slate-950/90 px-3.5 py-1 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-2 shrink-0">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              {heroMeta?.name || "CAMPEÃO"}
            </span>
            <span className="text-[9.5px] font-bold text-slate-300 uppercase">
              • {heroMeta?.codename || "EXPLORADOR"}
            </span>
            <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 text-[8px] font-black text-cyan-300 uppercase">
              {skinMeta?.name || "CLÁSSICA"} (NÍV. {skinMeta?.unlockLevel ?? 1})
            </span>
          </div>

          {/* 3D Turntable Centerpiece */}
          <div className="relative my-0.5 flex-1 min-h-0 w-full overflow-hidden">
            <HeroPreview3D
              avatarId={state.agent.avatarId}
              skinId={state.agent.skinId ?? "padrao"}
              agentName={state.agent.name}
              heightClass="h-full w-full"
              showEmoteBar
              compact
              borderless
            />
          </div>

          {/* 8 Cities Visual Map Horizontal Strip with real photos */}
          <div className="flex items-center gap-2 w-full shrink-0 pt-0.5 overflow-x-auto pb-0.5 snap-x no-scrollbar">
            {allMissions.map((m) => {
              const isSelected = m.id === selectedMission.id;
              const unlocked = unlockedIds.includes(m.id);
              const done = completedIds.includes(m.id);
              const splash = getMissionSplash(m.id, m.biomeId);

              return (
                <motion.button
                  key={m.id}
                  type="button"
                  whileHover={unlocked ? { scale: 1.04 } : {}}
                  whileTap={unlocked ? { scale: 0.96 } : {}}
                  onClick={() => {
                    if (unlocked) {
                      playSfx("click");
                      setSelectedId(m.id);
                    }
                  }}
                  className={`group relative h-13 sm:h-14 w-28 sm:w-32 shrink-0 snap-start overflow-hidden rounded-xl sm:rounded-2xl border-2 text-left transition cursor-pointer select-none ${
                    isSelected
                      ? "border-amber-300 ring-2 ring-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.55)]"
                      : unlocked
                        ? "border-slate-700/80 hover:border-cyan-400/80 opacity-90 hover:opacity-100"
                        : "border-slate-800/80 opacity-45 grayscale cursor-not-allowed"
                  }`}
                >
                  {/* City Map Background Image */}
                  <img
                    src={splash}
                    alt={m.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

                  {/* Top Status Badge */}
                  <div className="absolute top-1 right-1 left-1 flex items-center justify-between pointer-events-none">
                    <span className="text-xs">{m.emoji}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[7.5px] font-black uppercase ${
                        done
                          ? "bg-emerald-500/90 text-white"
                          : unlocked
                            ? "bg-amber-500/90 text-slate-950"
                            : "bg-slate-900/90 text-slate-400"
                      }`}
                    >
                      {done ? "✓" : unlocked ? `F.${m.order}` : "🔒"}
                    </span>
                  </div>

                  {/* Bottom City Name */}
                  <div className="absolute right-1 bottom-1 left-1 pointer-events-none">
                    <div className="truncate text-[9px] font-black uppercase text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-tight">
                      {m.title
                        .replace("Amazônia Ribeirinha", "Amazônia")
                        .replace("Metrópole Digital", "Tóquio")
                        .replace("Savana & Vilas", "Savana")
                        .replace("Sertão & Caatinga", "Sertão")
                        .replace("Cordilheira dos Andes", "Andes")
                        .replace("Vales do Himalaia", "Himalaia")
                        .replace("Metrópole de Acolhimento", "Europa")}
                    </div>
                    <div className="text-[7.5px] font-bold text-amber-300 truncate">
                      {m.regionName}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </main>

        {/* 3. RIGHT HUD DOCK (Tactical Intel, 1-Tap Champion Switcher & AAA JOGAR Button) */}
        <aside className="relative z-20 flex w-56 sm:w-60 md:w-64 shrink-0 flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-amber-500/25 bg-slate-950/80 backdrop-blur-xl p-2.5 sm:p-3 shadow-2xl gap-2 overflow-hidden">
          {/* Top: Active City Tactical Intel Card */}
          <div className="flex-1 min-h-0 flex flex-col justify-between rounded-xl sm:rounded-2xl border border-amber-400/40 bg-slate-900/90 p-2 sm:p-2.5 shadow-lg">
            {/* City Title & Phase */}
            <div className="flex items-center justify-between border-b border-amber-500/25 pb-1">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-white uppercase flex items-center gap-1">
                  <span className="text-sm shrink-0">{selectedMission.emoji}</span>
                  <span className="truncate">{selectedMission.title}</span>
                </div>
                <div className="text-[9px] font-bold text-amber-300 uppercase truncate">
                  Fase {selectedMission.order} • {selectedMission.difficulty}
                </div>
              </div>
              <span
                className={`rounded-full px-1.5 py-0.5 font-mono text-[8.5px] font-black shrink-0 ${
                  selectedRecord?.completed
                    ? "bg-emerald-500/25 text-emerald-300"
                    : "bg-amber-500/25 text-amber-300"
                }`}
              >
                {selectedRecord?.completed ? "✓ CONCLUÍDA" : "ATIVA"}
              </span>
            </div>

            {/* Visual NPC Contact Bubble */}
            <div className="my-1 flex items-center gap-2 rounded-xl bg-slate-950/80 p-1.5 border border-slate-800">
              <NpcPortrait
                avatarKey={selectedMission.npc.avatarKey}
                size={36}
                shape="hex"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[9.5px] font-black text-cyan-300 truncate">
                  {selectedMission.npc.name} ({selectedMission.npc.age} anos)
                </div>
                <p className="line-clamp-2 text-[8px] text-slate-300 leading-snug italic mt-0.5">
                  &ldquo;{tacticalIntel.quote}&rdquo;
                </p>
              </div>
            </div>

            {/* Rewards Pill */}
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-lg">
              <span>Recompensa:</span>
              <span className="text-amber-300 font-mono font-black">
                +{selectedMission.rewardXp} XP • +{selectedMission.rewardWisdom} 💎
              </span>
            </div>
          </div>

          {/* Middle: 1-Tap Instant Champion Switcher */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 shrink-0">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[8.5px] font-black tracking-widest text-cyan-400 uppercase">
                HERÓIS DA BASE IDE
              </span>
              <span className="text-[8px] font-bold text-amber-300 uppercase">
                {heroMeta?.name}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {AVATAR_OPTIONS.map((av) => {
                const isCurrent = av.id === state.agent?.avatarId;
                return (
                  <motion.button
                    key={av.id}
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      playSfx("click");
                      updateAgentAppearance({ avatarId: av.id });
                    }}
                    title={`Equipar ${av.name}`}
                    className={`flex flex-col items-center justify-center rounded-lg p-1 transition cursor-pointer ${
                      isCurrent
                        ? "bg-amber-500/25 border-2 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                        : "bg-slate-950/80 border border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <HeroPortrait
                      avatarId={av.id}
                      size={28}
                      shape="hex"
                      active={isCurrent}
                    />
                    <span
                      className={`mt-0.5 text-[8px] font-black uppercase truncate max-w-full ${
                        isCurrent ? "text-amber-300" : "text-slate-400"
                      }`}
                    >
                      {av.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Bottom: AAA MOBA JOGAR Button & Wardrobe Shortcut */}
          <div className="shrink-0 space-y-1.5">
            {selectedUnlocked ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  playSfx("ult");
                  onSelectMission(selectedMission);
                }}
                className="w-full py-3 sm:py-3.5 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_24px_rgba(245,158,11,0.65)] hover:shadow-[0_0_36px_rgba(245,158,11,0.85)] hover:brightness-105 cursor-pointer transition"
              >
                <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-black tracking-widest uppercase">
                  <Swords className="h-5 w-5 fill-slate-950 text-slate-950 shrink-0" />
                  <span>JOGAR</span>
                </div>
                <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-amber-950/90 truncate max-w-[95%]">
                  ENTRAR NA CIDADE • FASE {selectedMission.order}
                </div>
              </motion.button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3 flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-500 text-[10px] font-black uppercase cursor-not-allowed"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Bloqueado • Fase {selectedMission.order - 1}</span>
              </button>
            )}

            {/* Quick Actions: Lore/História & Skins 3D (Clean, High-Value, Zero Redundancy) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  if (onOpenStory) onOpenStory();
                }}
                title="Assistir Prólogo Animado & Tutorial da Base Ide"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl border border-amber-500/40 bg-slate-900/90 text-[8.5px] font-black text-amber-300 hover:border-amber-400 hover:text-white transition cursor-pointer uppercase shadow-sm"
              >
                <Film className="h-3 w-3 text-amber-400 shrink-0" />
                <span>História</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onOpenWardrobe();
                }}
                title="Vestiário e Personalização de Skins 3D"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl border border-cyan-500/40 bg-slate-900/90 text-[8.5px] font-black text-cyan-300 hover:border-cyan-400 hover:text-white transition cursor-pointer uppercase shadow-sm"
              >
                <Sparkles className="h-3 w-3 text-cyan-300 shrink-0" />
                <span>Skins 3D</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 4. ANIMATED CITY SELECTOR MODAL SHEET (8 GLOBAL FRONTIERS) */}
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
                      Selecione a Cidade Missionária (8 Fronteiras Mundiais)
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

                {/* 8 Dynamic City Cards in 2x4 Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2 flex-1 min-h-0 overflow-y-auto pr-1">
                  {allMissions.map((m) => {
                    const isSelected = m.id === selectedMission.id;
                    const unlocked = unlockedIds.includes(m.id);
                    const done = completedIds.includes(m.id);
                    const splash = getMissionSplash(m.id, m.biomeId);
                    const intel =
                      MISSION_TACTICAL_OBJECTIVES[m.id] ||
                      MISSION_TACTICAL_OBJECTIVES.amazonia;

                    return (
                      <motion.button
                        key={m.id}
                        type="button"
                        whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
                        whileTap={unlocked ? { scale: 0.98 } : {}}
                        onClick={() => {
                          if (unlocked) {
                            playSfx("click");
                            setSelectedId(m.id);
                            setCitySelectorOpen(false);
                          }
                        }}
                        className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition overflow-hidden min-h-[145px] ${
                          isSelected
                            ? "border-amber-300 bg-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.5)] ring-2 ring-amber-300"
                            : unlocked
                              ? "border-slate-700 bg-slate-900/90 hover:border-cyan-400 cursor-pointer"
                              : "border-slate-800 bg-slate-950/70 opacity-50 grayscale cursor-not-allowed"
                        }`}
                      >
                        {/* Background City Splash Photo */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <img
                            src={splash}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-25"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/50" />
                        </div>

                        {/* Top: Icon & Status */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-xl sm:text-2xl">{m.emoji}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[8.5px] font-mono font-black ${
                              done
                                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/40"
                                : unlocked
                                  ? "bg-amber-500/30 text-amber-300 border border-amber-400/40"
                                  : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {done ? "✓ CONCLUÍDA" : unlocked ? `FASE ${m.order}` : "BLOQUEADA"}
                          </span>
                        </div>

                        {/* Title & Region */}
                        <div className="relative z-10 my-1">
                          <div className="text-xs sm:text-sm font-black text-white uppercase leading-snug truncate">
                            {m.title}
                          </div>
                          <div className="text-[9.5px] font-bold text-amber-300 truncate">
                            {m.difficulty} • {m.regionName}
                          </div>
                          <p className="line-clamp-2 text-[8.5px] text-slate-300 mt-1 italic">
                            &ldquo;{intel.quote}&rdquo;
                          </p>
                        </div>

                        {/* Rewards */}
                        <div className="relative z-10 border-t border-slate-800/80 pt-1 flex items-center justify-between text-[9.5px]">
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
                <div className="text-center text-xs font-bold text-slate-400 border-t border-slate-800/80 pt-2">
                  Escolha qualquer uma das 8 fronteiras mundiais para entrar na cidade 3D!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Local Language Modal */}
        <AnimatePresence>
          {languageModalOpen && (
            <LocalLanguageModal
              initialMissionId={selectedMission.id}
              onClose={() => setLanguageModalOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Co-op Multiplayer Modal */}
        <AnimatePresence>
          {coopModalOpen && (
            <CoopMultiplayerModal
              onClose={() => setCoopModalOpen(false)}
              onStartCoop={() => {
                onSelectMission(selectedMission);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* =========================================================================
     DESKTOP WEB VERSION: 100% RICH AAA CONSOLE FIT (STRICTLY NO SCROLLBAR)
     ========================================================================= */
  return (
    <main className="relative flex-1 min-h-0 h-full w-full overflow-hidden select-none p-2 sm:p-2.5 flex flex-col justify-between">
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

      <div className="relative z-10 mx-auto grid h-full w-full max-w-[1560px] flex-1 min-h-0 grid-cols-12 gap-2.5 lg:gap-3 overflow-hidden">
        {/* LEFT WING (3 cols): Live 3D Animated Champion Stand + Wardrobe & Modes */}
        <section className="flex h-full flex-col justify-between min-h-0 gap-2 lg:col-span-3 overflow-hidden">
          {/* Live 3D Champion & Skin Showcase Card */}
          <div className="moba-panel-gold moba-clip-panel overflow-hidden p-2 shrink-0">
            <HeroPreview3D
              avatarId={state.agent.avatarId}
              skinId={state.agent.skinId ?? "padrao"}
              agentName={state.agent.name}
              heightClass="h-40 xl:h-44"
              showEmoteBar
              compact
            />

            <div className="mt-1.5 px-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] font-black tracking-widest text-amber-300 uppercase truncate">
                  NÍV. {level} • {levelTitle}
                </span>
                <span
                  className="text-[9px] font-black shrink-0"
                  style={{ color: skinMeta.accentHex }}
                >
                  {skinMeta.badgeEmoji} {skinMeta.name}
                </span>
              </div>
              <div className="truncate text-xs font-black text-white uppercase leading-tight mt-0.5">
                {state.agent.name}{" "}
                <span className="text-[10px] text-cyan-300">
                  ({heroMeta?.name})
                </span>
              </div>

              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <MobaButton
                  variant="gold"
                  size="sm"
                  shape="hex"
                  onClick={onOpenWardrobe}
                  className="w-full !py-1 text-[10px]"
                >
                  <Sparkles className="h-3 w-3" />
                  SKINS 3D
                </MobaButton>

                {onSwitchUser && (
                  <MobaButton
                    variant="obsidian"
                    size="sm"
                    shape="slant"
                    sheen={false}
                    onClick={onSwitchUser}
                    className="w-full !py-1 text-[10px]"
                  >
                    <Users className="h-3 w-3 text-amber-300" />
                    USUÁRIO
                  </MobaButton>
                )}
              </div>
            </div>
          </div>

          {/* AAA Arsenal & Grimório (2-Column Grid to fit comfortably without scrolling) */}
          <div className="moba-panel-cyan moba-clip-panel flex flex-1 flex-col justify-between p-2 min-h-0 overflow-hidden">
            <div className="text-[10px] font-black tracking-[0.2em] text-cyan-300 uppercase px-0.5">
              🎒 Arsenal & Comando
            </div>

            <div className="grid grid-cols-2 gap-1.5 my-1 flex-1 content-center">
              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={() => onOpenPocketBible("gospel")}
                className="w-full !justify-between !px-2 !py-1.5"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] truncate">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  Grimório
                </span>
                <span className="font-mono text-[9px] text-emerald-300">
                  {state.studiedGospelSteps.length}/4
                </span>
              </MobaButton>

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={onOpenPrayerRadar}
                className="w-full !justify-between !px-2 !py-1.5"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] truncate">
                  <Radio className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  Radar
                </span>
                <span className="font-mono text-[9px] text-amber-300">
                  {state.prayedMissionIds.length}/4
                </span>
              </MobaButton>

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={() => onOpenPocketBible("dictionary")}
                className="w-full !justify-between !px-2 !py-1.5"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] truncate">
                  <Compass className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  Cultura
                </span>
                <span className="font-mono text-[9px] text-cyan-300">INFO</span>
              </MobaButton>

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={onOpenPassport}
                className="w-full !justify-between !px-2 !py-1.5"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] truncate">
                  <Trophy className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                  Cards
                </span>
                <span className="font-mono text-[9px] text-amber-300">
                  {completedIds.length}/{allMissions.length}
                </span>
              </MobaButton>

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={() => setLanguageModalOpen(true)}
                className="w-full !justify-between !px-2 !py-1.5 !border-amber-500/40"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] truncate">
                  <Globe2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  Idiomas
                </span>
                <span className="font-mono text-[9px] text-amber-300">8 Povos</span>
              </MobaButton>

              <MobaButton
                variant="obsidian"
                size="sm"
                shape="slant"
                sheen={false}
                onClick={() => setCoopModalOpen(true)}
                className="w-full !justify-between !px-2 !py-1.5 !border-emerald-500/40"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] truncate">
                  <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  Co-op
                </span>
                <span className="font-mono text-[9px] text-emerald-300">2P</span>
              </MobaButton>
            </div>
          </div>

          {/* MODO ARENA MULTIPLAYER (DESAFIO DE TRIBOS) */}
          <MobaButton
            variant="violet"
            size="md"
            shape="hex"
            onClick={onOpenTribesQuiz}
            className="w-full !py-2 shrink-0"
          >
            <Swords className="h-4 w-4 text-amber-300" />
            <div className="text-left leading-tight">
              <div className="text-xs font-black">ARENA DE TRIBOS 4V4</div>
              <div className="text-[9px] font-semibold text-fuchsia-200 normal-case">
                Multiplayer para Igreja!
              </div>
            </div>
          </MobaButton>
        </section>

        {/* CENTER STAGE (5 cols): 3D Interactive World Globe + Arena Thumbnail Strip */}
        <section className="flex h-full flex-col justify-between min-h-0 gap-2 lg:col-span-5 overflow-hidden">
          <div className="moba-panel-cyan moba-clip-panel relative flex flex-1 flex-col justify-between overflow-hidden p-2.5 min-h-0">
            <div className="flex items-center justify-between px-2 pt-0.5 shrink-0">
              <div>
                <div className="text-[9.5px] font-black tracking-[0.22em] text-cyan-300 uppercase">
                  SELETOR PLANETÁRIO 3D • BASE IDE
                </div>
                <h2 className="text-base font-black tracking-wide text-white uppercase">
                  Escolha a Cidade de Missão
                </h2>
              </div>
              <span className="rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-black text-emerald-300">
                {completedIds.length}/{allMissions.length} VITÓRIAS
              </span>
            </div>

            {/* Real WebGL 3D Interactive Planet */}
            <div className="my-1 flex-1 min-h-0 w-full overflow-hidden">
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

            {/* Bottom Arena Map Selector Cards with 3D Thumbnails (All 8 Cities) */}
            <div className="grid grid-cols-4 gap-1.5 pt-1 shrink-0">
              {allMissions.map((m) => {
                const isSelected = m.id === selectedMission.id;
                const unlocked = unlockedIds.includes(m.id);
                const done = completedIds.includes(m.id);
                const thumb = getMissionSplash(m.id, m.biomeId);

                return (
                  <motion.button
                    key={m.id}
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      playSfx("click");
                      setSelectedId(m.id);
                    }}
                    className={`relative cursor-pointer overflow-hidden rounded-xl border-2 text-left transition ${
                      isSelected
                        ? "border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                        : unlocked
                          ? "border-slate-700 hover:border-cyan-400"
                          : "border-slate-800 opacity-60 grayscale"
                    }`}
                  >
                    <div className="relative h-12 w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt={m.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />

                      <span className="absolute top-0.5 right-0.5">
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-950 text-emerald-400" />
                        ) : !unlocked ? (
                          <Lock className="h-3 w-3 text-slate-300" />
                        ) : null}
                      </span>

                      <div className="absolute right-1 bottom-0.5 left-1">
                        <div className="truncate text-[8.5px] font-black text-white uppercase">
                          {m.order}. {m.title.split(" ")[0]}
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
        <section className="flex h-full flex-col justify-between min-h-0 lg:col-span-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMission.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="moba-panel-gold moba-clip-panel flex h-full flex-col justify-between overflow-hidden"
            >
              {/* City Photo Banner */}
              <div className="relative h-28 xl:h-32 w-full overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedSplash}
                  alt={selectedMission.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <div className="absolute top-2 right-2.5 left-2.5 flex items-center justify-between gap-2">
                  <span className="moba-clip-slant bg-slate-950/85 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-amber-300 uppercase backdrop-blur">
                    FASE {selectedMission.order} • {selectedMission.difficulty}
                  </span>

                  {selectedPrayed && (
                    <span className="rounded-full border border-amber-300/50 bg-amber-500/25 px-2 py-0.5 text-[9px] font-black text-amber-200 backdrop-blur">
                      🙏 BUFF ATIVO
                    </span>
                  )}
                </div>

                <div className="absolute right-3 bottom-1.5 left-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-300">
                    <MapPin className="h-3 w-3" />
                    {selectedMission.regionName}
                  </div>
                  <h3 className="text-lg xl:text-xl font-black tracking-wide text-white uppercase leading-tight truncate">
                    {selectedMission.emoji} {selectedMission.title}
                  </h3>
                </div>
              </div>

              {/* NPC Ally Card & Mission Objective */}
              <div className="flex flex-1 flex-col justify-between p-2.5 min-h-0 overflow-hidden gap-1.5">
                <div className="flex items-center gap-2.5 rounded-xl border border-cyan-500/30 bg-slate-950/85 p-2 shrink-0">
                  <NpcPortrait
                    avatarKey={selectedMission.npc.avatarKey}
                    size={46}
                    shape="hex"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">
                      CONTATO PRINCIPAL NO MAPA 3D
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {selectedMission.npc.name} ({selectedMission.npc.age} anos)
                    </div>
                    <p className="line-clamp-2 text-[10px] text-slate-300 leading-snug">
                      &ldquo;{selectedMission.npc.bio}&rdquo;
                    </p>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-300 line-clamp-2">
                  {selectedMission.shortDescription}
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-center shrink-0">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-1.5">
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      RECOMPENSA
                    </div>
                    <div className="mt-0.5 font-mono text-xs font-black text-emerald-400 truncate">
                      +{selectedMission.rewardXp} XP • +{selectedMission.rewardWisdom} 💎
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-1.5">
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      DESAFIOS
                    </div>
                    <div className="mt-0.5 font-mono text-xs font-black text-amber-300 truncate">
                      {selectedRecord?.completed
                        ? `${selectedRecord.bestTrust}% CONFIANÇA`
                        : "CORRIDA + TORRES"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Giant Play Button - ALWAYS VISIBLE AT BOTTOM WITHOUT SCROLL */}
              <div className="border-t border-amber-500/25 bg-slate-950/85 p-2.5 shrink-0">
                {selectedUnlocked ? (
                  <MobaButton
                    variant="gold"
                    size="lg"
                    shape="hex"
                    onClick={() => onSelectMission(selectedMission)}
                    className="w-full !py-2.5 sm:!py-3 text-sm font-black"
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
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      {/* Local Language Modal */}
      <AnimatePresence>
        {languageModalOpen && (
          <LocalLanguageModal
            initialMissionId={selectedMission.id}
            onClose={() => setLanguageModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Co-op Multiplayer Modal */}
      <AnimatePresence>
        {coopModalOpen && (
          <CoopMultiplayerModal
            onClose={() => setCoopModalOpen(false)}
            onStartCoop={() => {
              onSelectMission(selectedMission);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
