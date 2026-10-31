"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Car,
  CheckCircle2,
  ClipboardList,
  Compass,
  Crown,
  Flag,
  Flame,
  Gauge,
  Heart,
  HeartHandshake,
  Languages,
  Lightbulb,
  MapPin,
  Package,
  Radio,
  RotateCcw,
  School,
  Shield,
  ShieldAlert,
  Sparkles,
  Swords,
  ThumbsDown,
  ThumbsUp,
  RotateCw,
  Users,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
} from "lucide-react";
import { DialogueOption, Mission } from "@/types/game";
import { SKIN_OPTIONS } from "@/data/avatarsAndGifts";
import { useGame } from "@/context/GameContext";
import { useMobileViewport } from "@/lib/useMobileViewport";
import {
  getMissionSplash,
  NPC_PORTRAITS,
  resolveMissionBiome,
} from "@/lib/assets";
import {
  getOpenWorldConfig,
  RadioTowerMission,
  StreetPersonQuest,
} from "@/lib/worldData";
import {
  CombatActionType,
  CombatTrigger,
  MobaGtaWorld3D,
  NearbyInteractionInfo,
  WORLD_LANDMARKS,
  WorldFloatingPopup,
  WorldHudSnapshot,
} from "./MobaGtaWorld3D";
import { HeroPortrait, NpcPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";
import { WordDecoderGame } from "./WordDecoderGame";
import { PassportStampSvg } from "./StampSvg";
import { CollectibleCard } from "./CollectibleCard";
import { ConfettiCanvas } from "./ConfettiCanvas";

interface MissionEngineProps {
  mission: Mission;
  onExitToHub: () => void;
  externalPaused?: boolean;
  onOpenWardrobe?: () => void;
  onSwitchUser?: () => void;
}

type OverlayMode = "none" | "briefing" | "dialogue" | "decoder" | "victory";

interface ActivePersonEncounter {
  person: StreetPersonQuest;
  status:
    | "completed_now"
    | "already_done"
    | "needs_supplies"
    | "needs_rescue";
  message: string;
  missingCount?: number;
}

function deterministicShuffle(
  options: DialogueOption[],
  seedStr: string
): DialogueOption[] {
  const copy = [...options];
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const j = hash % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Map 220x220 3D Open-World coordinates (-98..98) to Radar Minimap percentages (4%..96%)
function toWorldRadarPct(x: number, z: number) {
  const px = ((x + 98) / 196) * 100;
  const py = ((z + 98) / 196) * 100;
  return {
    left: `${Math.max(4, Math.min(96, px))}%`,
    top: `${Math.max(4, Math.min(96, py))}%`,
  };
}

const INITIAL_HUD_SNAPSHOT: WorldHudSnapshot = {
  heroX: WORLD_LANDMARKS.spawn.x,
  heroZ: WORLD_LANDMARKS.spawn.z,
  heroAngle: Math.PI,
  hp: 120,
  maxHp: 120,
  inVehicle: false,
  activeVehicleName: "SUV Tático 4x4",
  cameraMode: "gta",
  nitroCooldown: 0,
  score: 0,
  combo: 0,
  suppliesHeld: 0,
  scrollsCollected: 0,
  totalScrolls: 6,
  enemiesDefeated: 0,
  totalEnemies: 15,
  bossDefeated: false,
  bossHpPct: 100,
  helpedPersonIds: [],
  activatedTowerIds: [],
  totalTowers: 3,
  raceActive: false,
  raceCompleted: false,
  raceTimeLeft: 0,
  raceCheckpointIdx: 0,
  raceTotalCheckpoints: 5,
  cooldowns: { q: 0, w: 0, e: 0, r: 0 },
  nearby: null,
  dots: [],
};

export function MissionEngine({
  mission,
  onExitToHub,
  externalPaused,
  onOpenWardrobe,
  onSwitchUser,
}: MissionEngineProps) {
  const {
    state,
    level,
    playSfx,
    addBonusXp,
    grantFieldLoot,
    completeMission,
    acceptSchoolChallenge,
    toggleMute,
  } = useGame();

  const {
    isMobileDevice,
    isMobileLandscape,
    isCompactMobile,
    toggleLandscapeFullscreen,
  } = useMobileViewport();

  const [scorePanelOpen, setScorePanelOpen] = useState(false);

  const resolvedBiome = useMemo(
    () => resolveMissionBiome(mission.id, mission.biomeId),
    [mission.biomeId, mission.id]
  );

  const worldCfg = useMemo(
    () => getOpenWorldConfig(mission.id, mission.biomeId),
    [mission.biomeId, mission.id]
  );

  const isWelcomingHeart = state.agent?.giftId === "acolhedor";
  const isFaithfulIntercessor = state.agent?.giftId === "intercessor";
  const hasRegionalPrayer = state.prayedMissionIds.includes(mission.id);

  const initialTrust = isWelcomingHeart ? 10 : 0;
  const basePrayerUses =
    1 + (isFaithfulIntercessor ? 1 : 0) + (hasRegionalPrayer ? 1 : 0);

  const [worldResetSeed, setWorldResetSeed] = useState(0);
  const [overlay, setOverlay] = useState<OverlayMode>("none");
  const [missionPhoneOpen, setMissionPhoneOpen] = useState(false);
  const [emotesDrawerOpen, setEmotesDrawerOpen] = useState(false);
  const [hudSnap, setHudSnap] = useState<WorldHudSnapshot>(INITIAL_HUD_SNAPSHOT);
  const [popups, setPopups] = useState<WorldFloatingPopup[]>([]);
  const [combatTrigger, setCombatTrigger] = useState<CombatTrigger | null>(null);
  const [customWaypoint, setCustomWaypoint] = useState<{
    x: number;
    z: number;
    label: string;
  } | null>(null);

  // Virtual Analog Thumbstick State & Multi-Touch Isolation
  const [joystickVec, setJoystickVec] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const joystickPadRef = useRef<HTMLDivElement | null>(null);
  const joystickDraggingRef = useRef(false);
  const joystickPointerIdRef = useRef<number | null>(null);
  const attackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Open-World GTA Side-Missions Progression
  const [totemScanned, setTotemScanned] = useState(false);
  const [helpedPersonIds, setHelpedPersonIds] = useState<string[]>([]);
  const [activatedTowerIds, setActivatedTowerIds] = useState<string[]>([]);
  const [raceCompleted, setRaceCompleted] = useState(false);
  const [activeEncounter, setActiveEncounter] =
    useState<ActivePersonEncounter | null>(null);
  const [dialogueCompleted, setDialogueCompleted] = useState(false);

  // Main NPC Dialogue Clash State
  const [turnIndex, setTurnIndex] = useState(0);
  const [trust, setTrust] = useState(initialTrust);
  const [dialogueXp, setDialogueXp] = useState(0);
  const [prayerUsesLeft, setPrayerUsesLeft] = useState(basePrayerUses);
  const [prayerActiveThisTurn, setPrayerActiveThisTurn] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DialogueOption | null>(
    null
  );

  // Victory State
  const [victoryStats, setVictoryStats] = useState<{
    totalXpEarned: number;
    wisdomEarned: number;
    leveledUp: boolean;
    openWorldBonusXp: number;
  } | null>(null);

  const currentTurn = mission.turns[turnIndex];
  const splash = getMissionSplash(mission.id, mission.biomeId);

  const shuffledOptions = useMemo(() => {
    if (!currentTurn) return [];
    return deterministicShuffle(
      currentTurn.options,
      `${mission.id}-${currentTurn.id}`
    );
  }, [currentTurn, mission.id]);

  const pushWorldPopup = useCallback((popup: WorldFloatingPopup) => {
    setPopups((prev) => [...prev.slice(-4), popup]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== popup.id));
    }, 1850);
  }, []);

  const fireAction = useCallback((action: CombatActionType) => {
    setCombatTrigger({
      id: Date.now() + Math.random(),
      action,
    });
  }, []);

  // Dynamic GPS Target Calculation
  const activeGpsTarget = useMemo(() => {
    if (customWaypoint) {
      const distToCustom = Math.hypot(
        hudSnap.heroX - customWaypoint.x,
        hudSnap.heroZ - customWaypoint.z
      );
      if (distToCustom > 5.0) {
        return customWaypoint;
      }
    }
    if (!dialogueCompleted) {
      return {
        x: WORLD_LANDMARKS.mainNpc.x,
        z: WORLD_LANDMARKS.mainNpc.z,
        label: `Praça da Fonte: ${mission.npc.name}`,
      };
    }
    if (!hudSnap.bossDefeated) {
      return {
        x: WORLD_LANDMARKS.boss.x,
        z: WORLD_LANDMARKS.boss.z,
        label: `Chefe Norte: ${worldCfg.bossName} (ou Nexus)`,
      };
    }
    return {
      x: WORLD_LANDMARKS.nexus.x,
      z: WORLD_LANDMARKS.nexus.z,
      label: "⚡ Nexus da Palavra (Norte)",
    };
  }, [
    customWaypoint,
    dialogueCompleted,
    hudSnap.bossDefeated,
    hudSnap.heroX,
    hudSnap.heroZ,
    mission.npc.name,
    worldCfg.bossName,
  ]);

  // Close any open Conversation / Modal / GTA Mission Phone with Escape, or Exit to Hub
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT")
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        playSfx("click");
        if (activeEncounter) {
          setActiveEncounter(null);
        } else if (missionPhoneOpen) {
          setMissionPhoneOpen(false);
        } else if (
          overlay === "dialogue" ||
          overlay === "briefing" ||
          overlay === "decoder"
        ) {
          setOverlay("none");
        } else {
          onExitToHub();
        }
      } else if (activeEncounter && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        playSfx("click");
        setActiveEncounter(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeEncounter, missionPhoneOpen, onExitToHub, overlay, playSfx]);

  // Radio Tower Activated Callback
  const handleTowerActivated = useCallback(
    (tower: RadioTowerMission) => {
      setActivatedTowerIds((prev) => {
        if (prev.includes(tower.id)) return prev;
        const next = [...prev, tower.id];
        if (next.length === worldCfg.radioTowers.length) {
          setPrayerUsesLeft((p) => p + 1);
        }
        return next;
      });
      setTrust((prev) => Math.min(100, prev + 5));
      addBonusXp(tower.xpReward, `📡 ${tower.broadcastMessage}`);
    },
    [addBonusXp, worldCfg.radioTowers.length]
  );

  // GTA Checkpoint Express Race Completed Callback
  const handleRaceCompleted = useCallback(() => {
    if (!raceCompleted) {
      setRaceCompleted(true);
      setTrust((prev) => Math.min(100, prev + 15));
      addBonusXp(
        worldCfg.race.xpReward,
        `🏁 ${worldCfg.race.title} vencida! (+15% Ponte de Confiança)`
      );
    } else {
      grantFieldLoot(30, 10);
    }
  }, [addBonusXp, grantFieldLoot, raceCompleted, worldCfg.race]);

  // Handle 3D Proximity Interactions (Totem, Main NPC, Nexus, and 6 Street People)
  const handleInteractTrigger = useCallback(
    (info: NearbyInteractionInfo, suppliesHeld: number): boolean => {
      if (info.kind === "totem") {
        if (!totemScanned) {
          setTotemScanned(true);
          addBonusXp(25, "Totem Cultural Escaneado na Cidade 3D!");
        } else {
          playSfx("click");
        }
        setOverlay("briefing");
        return false;
      }

      if (info.kind === "mainNpc") {
        playSfx("success");
        setCustomWaypoint(null);
        setOverlay("dialogue");
        return false;
      }

      if (info.kind === "nexus") {
        if (dialogueCompleted) {
          playSfx("levelUp");
          setOverlay("decoder");
        } else {
          playSfx("error");
          pushWorldPopup({
            id: Date.now() + Math.random(),
            text: `🔒 Fale com ${mission.npc.name} na Praça da Fonte (★) primeiro!`,
            color: "#fbbf24",
          });
        }
        return false;
      }

      if (info.kind === "person" && info.person) {
        const person = info.person;

        if (helpedPersonIds.includes(person.id)) {
          playSfx("click");
          setActiveEncounter({
            person,
            status: "already_done",
            message: person.speechAfter,
          });
          return false;
        }

        if (person.questType === "encourage") {
          playSfx("success");
          setHelpedPersonIds((prev) => [...prev, person.id]);
          setTrust((prev) => Math.min(100, prev + 8));
          setPrayerUsesLeft((prev) => prev + 1);
          addBonusXp(
            person.xpReward,
            `${person.name} encorajado(a)! (+8% Ponte & +1 Escudo)`
          );
          setActiveEncounter({
            person,
            status: "completed_now",
            message: person.speechAfter,
          });
          return true;
        }

        if (person.questType === "supply") {
          const needed = person.neededSupplies || 2;
          if (suppliesHeld >= needed) {
            playSfx("success");
            setHelpedPersonIds((prev) => [...prev, person.id]);
            setTrust((prev) => Math.min(100, prev + 10));
            addBonusXp(
              person.xpReward,
              `${needed}x ${worldCfg.supplyLabel} entregues para ${person.name}! (+10% Ponte)`
            );
            setActiveEncounter({
              person,
              status: "completed_now",
              message: person.speechAfter,
            });
            return true;
          } else {
            playSfx("neutral");
            setActiveEncounter({
              person,
              status: "needs_supplies",
              message: person.speechBefore,
              missingCount: needed - suppliesHeld,
            });
            return false;
          }
        }

        if (person.questType === "rescue") {
          const nearbyThreat = hudSnap.dots.some(
            (d) =>
              (d.kind === "enemy" || d.kind === "boss") &&
              Math.hypot(d.x - person.x, d.z - person.z) < 18.5
          );
          if (!nearbyThreat) {
            playSfx("success");
            setHelpedPersonIds((prev) => [...prev, person.id]);
            setTrust((prev) => Math.min(100, prev + 10));
            addBonusXp(
              person.xpReward,
              `${person.name} resgatado(a) das Sombras! (+10% Ponte)`
            );
            setActiveEncounter({
              person,
              status: "completed_now",
              message: person.speechAfter,
            });
            return true;
          } else {
            playSfx("error");
            setActiveEncounter({
              person,
              status: "needs_rescue",
              message: person.speechBefore,
            });
            return false;
          }
        }
      }

      return false;
    },
    [
      addBonusXp,
      dialogueCompleted,
      helpedPersonIds,
      hudSnap.dots,
      mission.npc.name,
      playSfx,
      pushWorldPopup,
      totemScanned,
      worldCfg.supplyLabel,
    ]
  );

  // Hold-to-repeat attack for smooth mobile combat
  const startContinuousAttack = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fireAction("attack");
    if (attackIntervalRef.current) clearInterval(attackIntervalRef.current);
    attackIntervalRef.current = setInterval(() => {
      fireAction("attack");
    }, 260);
  };

  const stopContinuousAttack = (e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (attackIntervalRef.current) {
      clearInterval(attackIntervalRef.current);
      attackIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (attackIntervalRef.current) {
        clearInterval(attackIntervalRef.current);
      }
    };
  }, []);

  // Virtual Analog Thumbstick Pointer Handlers (Enhanced for wider/larger fingers)
  const updateJoystickFromPointer = (clientX: number, clientY: number) => {
    const pad = joystickPadRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.44;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) {
      setJoystickVec({ x: 0, y: 0 });
      return;
    }
    const clamped = Math.min(dist, maxR);
    setJoystickVec({
      x: (dx / dist) * (clamped / maxR),
      y: (dy / dist) * (clamped / maxR),
    });
  };

  const handleRadarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pctX = (e.clientX - rect.left) / rect.width;
    const pctZ = (e.clientY - rect.top) / rect.height;
    const wx = Math.round(Math.max(-92, Math.min(92, pctX * 196 - 98)));
    const wz = Math.round(Math.max(-92, Math.min(92, pctZ * 196 - 98)));
    playSfx("click");
    setCustomWaypoint({ x: wx, z: wz, label: "Marcador GPS no Radar" });
    pushWorldPopup({
      id: Date.now() + Math.random(),
      text: "📍 Rota GPS Marcada na Cidade!",
      color: "#38bdf8",
    });
  };

  const selectGpsMission = (x: number, z: number, label: string) => {
    playSfx("click");
    setCustomWaypoint({ x, z, label });
    setMissionPhoneOpen(false);
    pushWorldPopup({
      id: Date.now() + Math.random(),
      text: `📍 GPS -> ${label}`,
      color: "#38bdf8",
    });
  };

  // Main NPC Dialogue Handlers
  const handleActivatePrayerInDialogue = () => {
    if (prayerUsesLeft <= 0 || prayerActiveThisTurn || selectedOption) return;
    playSfx("prayer");
    setPrayerUsesLeft((prev) => prev - 1);
    setPrayerActiveThisTurn(true);
  };

  const handleChooseOption = (opt: DialogueOption) => {
    if (selectedOption) return;

    if (opt.tone === "empathetic") playSfx("success");
    else if (opt.tone === "timid") playSfx("neutral");
    else playSfx("error");

    let delta = opt.trustDelta;
    if (delta < 0 && isWelcomingHeart) {
      delta = Math.min(-5, delta + 5);
    }

    setTrust((prev) => Math.max(0, Math.min(100, prev + delta)));
    setDialogueXp((prev) => prev + opt.xpReward);
    setSelectedOption(opt);
  };

  const handleNextTurn = () => {
    playSfx("click");
    if (turnIndex + 1 < mission.turns.length) {
      setTurnIndex((prev) => prev + 1);
      setSelectedOption(null);
      setPrayerActiveThisTurn(false);
    } else {
      setDialogueCompleted(true);
      setCustomWaypoint({
        x: WORLD_LANDMARKS.nexus.x,
        z: WORLD_LANDMARKS.nexus.z,
        label: "⚡ Nexus da Palavra (Norte)",
      });
      setOverlay("none");
      playSfx("levelUp");
      pushWorldPopup({
        id: Date.now() + Math.random(),
        text: "⚡ NEXUS DA PALAVRA DESBLOQUEADO AO NORTE!",
        color: "#fbbf24",
      });
    }
  };

  const handleDecoderComplete = (remainingSeconds: number) => {
    const speedBonusXp = Math.max(15, Math.round(remainingSeconds * 0.7));
    const openWorldBonusXp = Math.round(hudSnap.score / 25);
    const result = completeMission(
      mission,
      trust,
      dialogueXp + speedBonusXp + openWorldBonusXp
    );
    setVictoryStats({
      ...result,
      openWorldBonusXp,
    });
    setOverlay("victory");
  };

  const handleReplayMission = () => {
    playSfx("click");
    setOverlay("none");
    setMissionPhoneOpen(false);
    setActiveEncounter(null);
    setTotemScanned(false);
    setHelpedPersonIds([]);
    setActivatedTowerIds([]);
    setRaceCompleted(false);
    setDialogueCompleted(false);
    setTurnIndex(0);
    setTrust(initialTrust);
    setDialogueXp(0);
    setPrayerUsesLeft(basePrayerUses);
    setPrayerActiveThisTurn(false);
    setSelectedOption(null);
    setVictoryStats(null);
    setCustomWaypoint(null);
    setHudSnap(INITIAL_HUD_SNAPSHOT);
    setWorldResetSeed((s) => s + 1);
  };

  if (!state.agent) return null;

  const schoolAccepted = Boolean(
    state.missionProgress[mission.id]?.schoolChallengeAccepted
  );

  const hpPct = Math.max(
    0,
    Math.min(100, Math.round((hudSnap.hp / hudSnap.maxHp) * 100))
  );

  const activeSkinId = state.agent.skinId ?? "padrao";
  const activeSkin =
    SKIN_OPTIONS.find((s) => s.id === activeSkinId) ?? SKIN_OPTIONS[0];

  const nearBossArena =
    !hudSnap.bossDefeated &&
    (Boolean(hudSnap.bossNear) ||
      Math.hypot(
        hudSnap.heroX - WORLD_LANDMARKS.boss.x,
        hudSnap.heroZ - WORLD_LANDMARKS.boss.z
      ) < 36);

  // Count completed in-map missions out of 12!
  const totalMapMissions =
    1 + // Main NPC
    1 + // GTA Express Race
    worldCfg.radioTowers.length + // 3 Towers
    worldCfg.people.length + // 6 People
    1; // District Boss
  const completedMapMissions =
    (dialogueCompleted ? 1 : 0) +
    (raceCompleted ? 1 : 0) +
    activatedTowerIds.length +
    helpedPersonIds.length +
    (hudSnap.bossDefeated ? 1 : 0);

  const isWorldPaused =
    Boolean(externalPaused) ||
    overlay !== "none" ||
    Boolean(activeEncounter) ||
    missionPhoneOpen;

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 select-none touch-none">
      <ConfettiCanvas active={overlay === "victory"} durationMs={5500} />

      {/* =========================================================
          FULL-SCREEN 220x220 REALISTIC GTA + MOBA 3D ENGINE
         ========================================================= */}
      <div className="absolute inset-0 z-0">
        <MobaGtaWorld3D
          key={`${mission.id}-${worldResetSeed}`}
          mission={mission}
          avatarId={state.agent.avatarId}
          skinId={activeSkinId}
          agentName={state.agent.name}
          dialogueCompleted={dialogueCompleted}
          helpedPersonIds={helpedPersonIds}
          activatedTowerIds={activatedTowerIds}
          raceCompleted={raceCompleted}
          paused={isWorldPaused}
          joystickVec={joystickVec}
          combatTrigger={combatTrigger}
          gpsTarget={activeGpsTarget}
          onHudUpdate={setHudSnap}
          onPopup={pushWorldPopup}
          onInteractTrigger={handleInteractTrigger}
          onTowerActivated={handleTowerActivated}
          onRaceCompleted={handleRaceCompleted}
          onEarnRewards={grantFieldLoot}
        />
      </div>

      {/* =========================================================
          FLOATING COMBAT / SCORE / LOOT POPUPS
         ========================================================= */}
      <div className="pointer-events-none absolute top-34 right-0 left-0 z-30 mx-auto flex max-w-md flex-col items-center gap-1.5 px-4">
        <AnimatePresence>
          {popups.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14, scale: 0.82 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.9 }}
              style={{ color: p.color }}
              className="rounded-full border border-white/15 bg-slate-950/90 px-3.5 py-1 font-mono text-xs font-black tracking-wide shadow-[0_6px_20px_rgba(0,0,0,0.65)] sm:text-sm"
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* =========================================================
          TOP-LEFT: GTA URBAN RADAR MINIMAP + MISSIONS PHONE BUTTON
         ========================================================= */}
      <div className="pointer-events-auto absolute top-2 left-2 z-20 flex flex-col gap-1.5 sm:top-3 sm:left-3">
        <div
          className="moba-panel-gold relative overflow-hidden p-1.5 shadow-2xl h-22 w-22 sm:h-26 sm:w-26 rounded-xl"
        >
          <div
            onClick={handleRadarClick}
            title="Clique em qualquer rua do Radar para marcar GPS!"
            className="relative h-full w-full cursor-crosshair overflow-hidden rounded-xl border border-amber-500/40 bg-[#081724]"
          >
            {/* 3x4 GTA Avenue Grid Lines on Radar */}
            {[26.5, 50, 73.5].map((leftPct) => (
              <div
                key={`v-${leftPct}`}
                style={{ left: `${leftPct}%` }}
                className="pointer-events-none absolute top-0 bottom-0 w-1.5 -translate-x-1/2 bg-slate-600/50"
              />
            ))}
            {[22.5, 40.8, 59.2, 77.5].map((topPct) => (
              <div
                key={`h-${topPct}`}
                style={{ top: `${topPct}%` }}
                className="pointer-events-none absolute right-0 left-0 h-1.5 -translate-y-1/2 bg-slate-600/50"
              />
            ))}
            {resolvedBiome === "amazonia" && (
              <div className="pointer-events-none absolute right-0 left-0 top-[63.5%] h-2 bg-cyan-500/45" />
            )}

            {/* Custom GPS Ping */}
            {customWaypoint && (
              <div
                style={toWorldRadarPct(customWaypoint.x, customWaypoint.z)}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span className="block h-3.5 w-3.5 animate-ping rounded-full bg-amber-300/80" />
              </div>
            )}

            {/* Dynamic World Entities on Radar */}
            {hudSnap.dots.map((dot, idx) => {
              const pos = toWorldRadarPct(dot.x, dot.z);
              if (dot.kind === "enemy") {
                return (
                  <span
                    key={`e-${idx}`}
                    style={pos}
                    className="pointer-events-none absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500"
                  />
                );
              }
              if (dot.kind === "boss") {
                return (
                  <span
                    key={`b-${idx}`}
                    style={pos}
                    className="pointer-events-none absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300 bg-fuchsia-600 text-[8px] shadow-[0_0_8px_#d946ef]"
                  >
                    👑
                  </span>
                );
              }
              if (dot.kind === "vehicle") {
                return (
                  <span
                    key={`v-${idx}`}
                    style={pos}
                    className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-xs border border-slate-950 bg-sky-300"
                  />
                );
              }
              if (dot.kind === "scroll") {
                return (
                  <span
                    key={`s-${idx}`}
                    style={pos}
                    className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-amber-300"
                  />
                );
              }
              if (dot.kind === "tower") {
                return (
                  <span
                    key={`tw-${idx}`}
                    style={pos}
                    className={`pointer-events-none absolute flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[7px] ${
                      dot.done
                        ? "border-emerald-200 bg-emerald-500 text-slate-950"
                        : "border-rose-200 bg-rose-500 text-white"
                    }`}
                  >
                    📡
                  </span>
                );
              }
              if (dot.kind === "race") {
                return (
                  <span
                    key={`rc-${idx}`}
                    style={pos}
                    className={`pointer-events-none absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[8px] ${
                      hudSnap.raceActive
                        ? "animate-ping border-amber-200 bg-amber-400 text-slate-950"
                        : dot.done
                          ? "border-emerald-300 bg-emerald-600 text-white"
                          : "border-amber-200 bg-emerald-400 text-slate-950"
                    }`}
                  >
                    🏁
                  </span>
                );
              }
              if (dot.kind === "person") {
                return (
                  <span
                    key={`p-${idx}`}
                    style={pos}
                    className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-950 ${
                      dot.done
                        ? "bg-emerald-400"
                        : "animate-pulse bg-cyan-300 shadow-[0_0_7px_#22d3ee]"
                    }`}
                  />
                );
              }
              if (dot.kind === "totem") {
                return (
                  <span
                    key={`t-${idx}`}
                    style={pos}
                    className="pointer-events-none absolute flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-500 text-[8px] text-slate-950"
                  >
                    🧭
                  </span>
                );
              }
              if (dot.kind === "mainNpc") {
                return (
                  <span
                    key={`m-${idx}`}
                    style={pos}
                    className="pointer-events-none absolute flex h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-emerald-500 text-[9px] font-black text-slate-950 shadow-[0_0_10px_#10b981]"
                  >
                    ★
                  </span>
                );
              }
              if (dot.kind === "nexus") {
                return (
                  <span
                    key={`n-${idx}`}
                    style={pos}
                    className={`pointer-events-none absolute flex h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[9px] ${
                      !dot.done
                        ? "animate-pulse border-amber-200 bg-amber-400 text-slate-950 shadow-[0_0_10px_#fbbf24]"
                        : "border-slate-600 bg-slate-800 text-slate-400"
                    }`}
                  >
                    ⚡
                  </span>
                );
              }
              return null;
            })}

            {/* Live Player Radar Arrow */}
            <div
              style={toWorldRadarPct(hudSnap.heroX, hudSnap.heroZ)}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            >
              <div
                style={{
                  transform: `rotate(${(-hudSnap.heroAngle * 180) / Math.PI + 180}deg)`,
                }}
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${
                  hudSnap.inVehicle
                    ? "bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                    : "bg-amber-400 shadow-[0_0_10px_#fbbf24]"
                }`}
              >
                <span className="block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-slate-950" />
              </div>
            </div>
          </div>
        </div>

        {/* QUEST & HUB NAVIGATION CONTROLS (AAA ORGANIZED, ZERO CLUTTER) */}
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1">
            {/* Professional Beveled Back to Lobby Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                playSfx("click");
                onExitToHub();
              }}
              title="Sair da Missão e Voltar ao Lobby [ESC]"
              className={`flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-amber-400/70 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 font-black uppercase text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.25)] transition hover:border-amber-300 hover:text-white ${
                isMobileLandscape ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-xs"
              }`}
            >
              <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
              <span>LOBBY [ESC]</span>
            </motion.button>

            {/* Cultural Intelligence & Lore (Moved here with quest activities!) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                playSfx("click");
                if (totemScanned) {
                  setOverlay("briefing");
                } else {
                  setCustomWaypoint({
                    x: WORLD_LANDMARKS.totem.x,
                    z: WORLD_LANDMARKS.totem.z,
                    label: "Totem de Inteligência Cultural",
                  });
                  pushWorldPopup({
                    id: Date.now() + Math.random(),
                    text: "🧭 GPS -> Totem Cultural!",
                    color: "#22d3ee",
                  });
                }
              }}
              title="Inteligência Cultural & Tradições"
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 to-slate-950 font-black uppercase text-cyan-300 shadow-md transition hover:border-cyan-300 hover:text-white ${
                isMobileLandscape ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-xs"
              }`}
            >
              <Compass className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-400" />
              <span>CULTURA [F]</span>
            </motion.button>

            {isMobileDevice && !isMobileLandscape && (
              <button
                type="button"
                onClick={toggleLandscapeFullscreen}
                title="Girar Celular / Modo Tela Cheia"
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-cyan-400/60 bg-slate-950/90 px-2 py-0.5 text-[9px] font-black text-cyan-300 shadow-md hover:bg-cyan-500/20"
              >
                <RotateCw className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* GTA Mission Phone Button (12-Mission Selector) */}
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setMissionPhoneOpen(true);
            }}
            title="Ver Todas as 12 Missões"
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-cyan-400/70 bg-gradient-to-r from-cyan-950 to-slate-950 font-black text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.3)] transition hover:border-cyan-300 hover:text-white ${
              isMobileLandscape ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1.5 text-[11px]"
            }`}
          >
            <ClipboardList className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-300" />
            <span>MISSÕES ({completedMapMissions}/{totalMapMissions})</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TOP-CENTER: HP, PONTE, LIVE RACE TIMER & BOSS BAR
         ========================================================= */}
      <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="moba-panel-gold moba-clip-panel pointer-events-auto px-2.5 py-1.5 sm:px-4 sm:py-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs sm:text-base">{mission.emoji}</span>
              <span className="truncate text-[9px] font-black tracking-wider text-amber-300 uppercase sm:text-xs">
                {mission.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[9px] font-black sm:text-xs">
              <span className="flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-rose-300">
                <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
                {hudSnap.hp}/{hudSnap.maxHp}
              </span>
              <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">
                🤝 {trust}%
              </span>
            </div>
          </div>

          {/* Dual Progress Bars */}
          <div className="mt-1 grid grid-cols-2 gap-1.5 sm:mt-1.5 sm:gap-2">
            <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full border border-rose-400/40 bg-slate-950">
              <div
                style={{ width: `${hpPct}%` }}
                className="h-full bg-gradient-to-r from-rose-600 via-rose-400 to-emerald-400 transition-all duration-150"
              />
            </div>
            <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full border border-amber-400/45 bg-slate-950">
              <motion.div
                animate={{ width: `${trust}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300"
              />
            </div>
          </div>

          {/* Active GTA Checkpoint Express Race Countdown Banner! */}
          {hudSnap.raceActive && (
            <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-400/70 bg-emerald-950/80 px-2.5 py-0.5 font-mono text-[9px] font-black text-emerald-200 sm:text-xs">
              <span className="flex items-center gap-1">
                <Flag className="h-3 w-3 text-amber-300" />
                CHECKPOINT {hudSnap.raceCheckpointIdx + 1}/
                {hudSnap.raceTotalCheckpoints}
              </span>
              <span
                className={
                  hudSnap.raceTimeLeft < 12
                    ? "animate-pulse text-rose-300"
                    : "text-amber-300"
                }
              >
                ⏱️ {hudSnap.raceTimeLeft.toFixed(1)}s
              </span>
            </div>
          )}

          {/* AAA Live District Shadow Boss HP Bar */}
          {nearBossArena && !hudSnap.raceActive && (
            <div className="mt-1 rounded-xl border-2 border-fuchsia-400/70 bg-gradient-to-r from-fuchsia-950/90 via-slate-950/95 to-rose-950/85 px-2.5 py-1 shadow-[0_0_22px_rgba(217,70,239,0.45)]">
              <div className="flex items-center justify-between text-[9px] font-black tracking-wide text-fuchsia-100 uppercase sm:text-[10px]">
                <span className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-amber-300" />
                  BOSS: {worldCfg.bossName}
                </span>
                <span className="font-mono text-amber-300">
                  {hudSnap.bossHpPct}% HP
                </span>
              </div>
              <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full border border-fuchsia-400/40 bg-slate-950">
                <div
                  style={{ width: `${hudSnap.bossHpPct}%` }}
                  className="h-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400 transition-all duration-150"
                />
              </div>
            </div>
          )}

          <div className="mt-0.5 truncate text-[9px] font-bold text-cyan-200 sm:text-[10px]">
            🎯 GPS:{" "}
            {hudSnap.raceActive
              ? `Atravesse o Anel Dourado ${hudSnap.raceCheckpointIdx + 1}/${hudSnap.raceTotalCheckpoints}!`
              : activeGpsTarget.label}
          </div>
        </div>
      </div>

      {/* =========================================================
          TOP-RIGHT: CAMERA MODE & SCOREBOARD (AAA ERGONOMIC POSITIONING)
         ========================================================= */}
      <div className="pointer-events-auto absolute top-2 right-2 z-20 flex items-start gap-1.5 sm:top-3 sm:right-3">
        {/* Quick Camera Mode Switcher [C] (Moved here from combat area - zero misclicks!) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fireAction("camera");
          }}
          title="Alternar Câmera: Tática MOBA / GTA 3ª Pessoa [C]"
          className="flex h-7 sm:h-8 cursor-pointer items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-950/90 px-2 sm:px-2.5 text-[9px] sm:text-[10px] font-black text-slate-200 shadow-lg transition hover:border-amber-400 hover:text-white"
        >
          <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-300" />
          <span>{hudSnap.cameraMode === "gta" ? "CAM GTA [C]" : "CAM MOBA [C]"}</span>
        </motion.button>

        {/* Quick Audio Mute / Unmute Toggle */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            toggleMute();
          }}
          title={state.muted ? "Ativar Áudio e SFX" : "Mutar Áudio"}
          className="flex h-7 sm:h-8 w-7 sm:w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/90 text-slate-200 shadow-lg transition hover:border-amber-400 hover:text-white"
        >
          {state.muted ? (
            <VolumeX className="h-3.5 w-3.5 text-rose-400" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
          )}
        </motion.button>

        {/* Quick Fullscreen Toggle (Web / Desktop) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            playSfx("click");
            toggleLandscapeFullscreen();
          }}
          title="Alternar Tela Cheia / Fullscreen"
          className="hidden sm:flex h-7 sm:h-8 w-7 sm:w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/90 text-slate-200 shadow-lg transition hover:border-cyan-300 hover:text-white"
        >
          <Maximize2 className="h-3.5 w-3.5 text-cyan-300" />
        </motion.button>

        {isCompactMobile ? (
          <div className="moba-panel-cyan flex flex-col items-end rounded-xl px-2.5 py-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => setScorePanelOpen((prev) => !prev)}
              className="flex cursor-pointer items-center gap-1.5 font-mono text-xs font-black text-amber-300"
            >
              <span>{hudSnap.score.toLocaleString("pt-BR")} PTS</span>
              {hudSnap.combo > 1 && (
                <span className="flex items-center gap-0.5 rounded-full bg-amber-500/30 px-1 text-[9px] text-amber-300">
                  <Flame className="h-2.5 w-2.5" />
                  {hudSnap.combo}x
                </span>
              )}
              {scorePanelOpen ? (
                <ChevronUp className="h-3 w-3 text-cyan-300" />
              ) : (
                <ChevronDown className="h-3 w-3 text-cyan-300" />
              )}
            </button>
            {scorePanelOpen && (
              <div className="mt-1.5 w-44 space-y-1 border-t border-cyan-500/25 pt-1 text-left font-mono text-[9px]">
                <div className="flex items-center justify-between text-sky-200">
                  <span className="flex items-center gap-1">
                    <Package className="h-2.5 w-2.5 text-sky-400" />
                    Suprimentos
                  </span>
                  <span className="rounded bg-sky-500/20 px-1 text-sky-300">{hudSnap.suppliesHeld}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-200">
                  <span>👥 Pessoas</span>
                  <span className="text-emerald-300">
                    {helpedPersonIds.length}/{worldCfg.people.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-cyan-200">
                  <span>📡 Torres</span>
                  <span className="text-cyan-300">
                    {activatedTowerIds.length}/{worldCfg.radioTowers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-rose-200">
                  <span>⚔️ Sombras</span>
                  <span className="text-rose-300">
                    {hudSnap.enemiesDefeated}/{hudSnap.totalEnemies}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="moba-panel-cyan rounded-2xl px-3 py-2 text-right shadow-2xl sm:px-3.5 sm:py-2.5">
            <div className="text-[9px] font-black tracking-widest text-cyan-300 uppercase">
              PONTUAÇÃO GTA 3D
            </div>
            <div className="font-mono text-lg font-black text-amber-300 sm:text-2xl">
              {hudSnap.score.toLocaleString("pt-BR")}
              <span className="ml-1 text-[10px] text-amber-200/80">PTS</span>
            </div>

            {hudSnap.combo > 1 && (
              <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-500/25 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300">
                <Flame className="h-3 w-3 text-amber-400" />
                {hudSnap.combo}x COMBO!
              </div>
            )}

            <div className="mt-2 space-y-1 border-t border-cyan-500/25 pt-1.5 text-left font-mono text-[10px] font-bold">
              <div className="flex items-center justify-between gap-2 text-sky-200">
                <span className="flex items-center gap-1 truncate">
                  <Package className="h-3 w-3 shrink-0 text-sky-400" />
                  <span className="hidden sm:inline">{worldCfg.supplyLabel}</span>
                  <span className="sm:hidden">Itens</span>
                </span>
                <span className="rounded bg-sky-500/20 px-1.5 text-sky-300">
                  {hudSnap.suppliesHeld}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-emerald-200">
                <span>👥 Pessoas</span>
                <span className="text-emerald-300">
                  {helpedPersonIds.length}/{worldCfg.people.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-cyan-200">
                <span>📡 Torres Rádio</span>
                <span className="text-cyan-300">
                  {activatedTowerIds.length}/{worldCfg.radioTowers.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-amber-200">
                <span>🏁 Corrida GTA</span>
                <span className="text-amber-300">
                  {raceCompleted ? "OK ✓" : "Largada"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-rose-200">
                <span>⚔️ Sombras</span>
                <span className="text-rose-300">
                  {hudSnap.enemiesDefeated}/{hudSnap.totalEnemies}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          BOTTOM-CENTER: PROXIMITY ACTION PROMPT [F]
         ========================================================= */}
      <AnimatePresence>
        {hudSnap.nearby && !isWorldPaused && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            className="pointer-events-auto absolute right-0 bottom-28 left-0 z-30 mx-auto flex justify-center px-4 sm:bottom-6"
          >
            <MobaButton
              variant="gold"
              size="lg"
              shape="hex"
              onClick={() => fireAction("interact")}
              className="shadow-[0_0_30px_rgba(251,191,36,0.55)]"
            >
              <span className="rounded bg-slate-950/90 px-2 py-0.5 font-mono text-xs text-amber-300">
                F
              </span>
              {hudSnap.nearby.label}
            </MobaButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          BOTTOM-LEFT: VIRTUAL ANALOG JOYSTICK + CHAMPION CREST
         ========================================================= */}
      <div className="pointer-events-auto absolute bottom-2.5 left-2.5 z-20 flex items-end gap-2.5 sm:bottom-4 sm:left-4">
        <div
          ref={joystickPadRef}
          onPointerDown={(e) => {
            if (joystickPointerIdRef.current !== null) return;
            e.preventDefault();
            e.stopPropagation();
            joystickPointerIdRef.current = e.pointerId;
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {}
            joystickDraggingRef.current = true;
            updateJoystickFromPointer(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!joystickDraggingRef.current || e.pointerId !== joystickPointerIdRef.current) return;
            e.preventDefault();
            e.stopPropagation();
            updateJoystickFromPointer(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            if (e.pointerId !== joystickPointerIdRef.current) return;
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch {}
            joystickPointerIdRef.current = null;
            joystickDraggingRef.current = false;
            setJoystickVec({ x: 0, y: 0 });
          }}
          onPointerCancel={(e) => {
            if (e.pointerId !== joystickPointerIdRef.current) return;
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch {}
            joystickPointerIdRef.current = null;
            joystickDraggingRef.current = false;
            setJoystickVec({ x: 0, y: 0 });
          }}
          className="relative flex touch-none items-center justify-center rounded-full border-3 border-amber-400/60 bg-slate-950/85 shadow-[0_0_35px_rgba(245,158,11,0.45)] backdrop-blur-md h-36 w-36 sm:h-40 sm:w-40"
        >
          {/* Inner aesthetic guide ring & cardinal notches with WASD keys */}
          <div className="pointer-events-none absolute inset-3 rounded-full border border-cyan-400/35 bg-radial from-slate-900/50 to-transparent" />
          
          {/* CIMA [W] */}
          <span className="pointer-events-none absolute top-1 flex flex-col items-center font-mono text-[9px] font-black text-amber-300">
            <span className="rounded border border-amber-400/70 bg-slate-950/95 px-1 py-0.2 text-[8px] text-amber-200 shadow-sm">W</span>
            <span className="leading-none text-[8px] text-amber-300">▲</span>
          </span>

          {/* BAIXO [S] */}
          <span className="pointer-events-none absolute bottom-1 flex flex-col items-center font-mono text-[9px] font-black text-amber-300">
            <span className="leading-none text-[8px] text-amber-300">▼</span>
            <span className="rounded border border-amber-400/70 bg-slate-950/95 px-1 py-0.2 text-[8px] text-amber-200 shadow-sm">S</span>
          </span>

          {/* ESQUERDA [A] */}
          <span className="pointer-events-none absolute left-1 flex items-center gap-0.5 font-mono text-[9px] font-black text-amber-300">
            <span className="rounded border border-amber-400/70 bg-slate-950/95 px-1 py-0.2 text-[8px] text-amber-200 shadow-sm">A</span>
            <span className="leading-none text-[8px] text-amber-300">◄</span>
          </span>

          {/* DIREITA [D] */}
          <span className="pointer-events-none absolute right-1 flex items-center gap-0.5 font-mono text-[9px] font-black text-amber-300">
            <span className="leading-none text-[8px] text-amber-300">►</span>
            <span className="rounded border border-amber-400/70 bg-slate-950/95 px-1 py-0.2 text-[8px] text-amber-200 shadow-sm">D</span>
          </span>

          {/* Large Ergonomic Thumb Knob */}
          <div
            style={{
              transform: `translate(${joystickVec.x * 44}px, ${joystickVec.y * 44}px)`,
            }}
            className="pointer-events-none flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full border-2 border-amber-200 bg-gradient-to-b from-amber-300 via-amber-500 to-orange-600 text-[10px] sm:text-[11px] font-black text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.85)] active:scale-95"
          >
            <div className="flex flex-col items-center justify-center rounded-full border border-amber-950/40 bg-amber-400/30 h-11 w-11 sm:h-12 sm:w-12">
              <span className="leading-none text-[9px] sm:text-[10px] font-black">MOVER</span>
              <span className="text-[7.5px] font-extrabold text-amber-950 tracking-tighter mt-0.5">WASD</span>
            </div>
          </div>

          {/* Desktop Hotkey helper pill */}
          <div className="hidden sm:flex pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 items-center gap-1 rounded border border-cyan-400/40 bg-slate-950/90 px-1.5 py-0.5 font-mono text-[8px] font-black text-cyan-300 whitespace-nowrap shadow-md">
            <span>WASD / SETAS</span>
          </div>
        </div>

        <div className="moba-panel-gold hidden items-center gap-2.5 rounded-2xl p-2 pr-3.5 lg:flex">
          <div className="relative">
            <HeroPortrait
              avatarId={state.agent.avatarId}
              size={54}
              shape="circle"
              active
            />
            <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-amber-500 text-[10px] font-black text-slate-950">
              {level}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase">
              {state.agent.name}
              <span className="rounded border border-fuchsia-400/45 bg-fuchsia-500/20 px-1.5 py-0.5 text-[9px] text-fuchsia-200">
                {activeSkin.badgeEmoji} {activeSkin.name}
              </span>
              {hudSnap.inVehicle && (
                <span className="rounded bg-cyan-500/25 px-1.5 py-0.5 text-[9px] text-cyan-300">
                  🚙 {hudSnap.activeVehicleName}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 font-mono text-[10px] font-bold">
              <span className="flex items-center gap-0.5 text-cyan-300">
                💎 {state.wisdom}
              </span>
              <span className="flex items-center gap-0.5 text-amber-300">
                🔥 {state.streak}
              </span>
              <span className="rounded bg-slate-900/90 px-1.5 py-0.5 text-[8.5px] text-slate-400 font-sans">
                {hudSnap.cameraMode === "gta" ? "CAM GTA" : "CAM MOBA"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM-RIGHT: MOBA COMBAT ARC, VEHICLE & CONTEXTUAL ACTIONS
         ========================================================= */}
      <div className="pointer-events-auto absolute right-2 bottom-2 z-20 flex flex-col items-end gap-2 sm:right-4 sm:bottom-4">
        {/* Upper Action Bar: Emotes 3D Drawer + Vehicle Control (Comfortably spaced above skills!) */}
        <div className="flex items-center justify-end gap-1.5 mr-1 mb-1">
          {/* Collapsible Emotes 3D Drawer (Zero accidental clicks mid-fight!) */}
          <div className="relative flex items-center gap-1">
            <AnimatePresence>
              {emotesDrawerOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 12, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.92 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1 rounded-full border border-fuchsia-400/50 bg-slate-950/95 px-2 py-0.5 shadow-2xl backdrop-blur-md"
                >
                  {(
                    [
                      { act: "emoteSlash", icon: "⚔️", key: "5", title: "Giro Heroico [5]" },
                      { act: "emoteVictory", icon: "🙌", key: "6", title: "Vitória & Louvor [6]" },
                      { act: "emoteDance", icon: "🕺", key: "7", title: "Passinho Street [7]" },
                      { act: "emotePray", icon: "🛡️", key: "8", title: "Postura de Fé [8]" },
                    ] as const
                  ).map((em) => (
                    <motion.button
                      key={em.act}
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.88 }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fireAction(em.act);
                        setEmotesDrawerOpen(false);
                      }}
                      title={em.title}
                      className="flex h-7 cursor-pointer items-center gap-0.5 rounded-full border border-white/20 bg-slate-900/90 px-2 text-xs font-black text-white hover:border-amber-300 hover:bg-amber-500/20"
                    >
                      <span>{em.icon}</span>
                      <span className="hidden sm:inline font-mono text-[9px] text-amber-300">
                        {em.key}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setEmotesDrawerOpen((prev) => !prev)}
              title="Abrir Emotes 3D [5, 6, 7, 8]"
              className={`flex h-7 sm:h-7.5 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-[9px] font-black uppercase shadow-lg transition ${
                emotesDrawerOpen
                  ? "border-fuchsia-400 bg-fuchsia-500/30 text-white shadow-[0_0_12px_rgba(217,70,239,0.5)]"
                  : "border-fuchsia-400/40 bg-slate-950/85 text-fuchsia-300 hover:border-fuchsia-300 hover:text-white"
              }`}
            >
              <span>🎭</span>
              <span>EMOTES [5-8]</span>
            </motion.button>
          </div>

          {/* Vehicle Controls */}
          {hudSnap.inVehicle ? (
            <>
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fireAction("nitro");
                }}
                className={`flex h-7 sm:h-7.5 cursor-pointer items-center gap-1 rounded-full border-2 px-2.5 text-[9px] sm:text-[10px] font-black shadow-lg ${
                  hudSnap.nitroCooldown > 0
                    ? "border-slate-700 bg-slate-900 text-slate-400"
                    : "border-sky-200 bg-gradient-to-r from-sky-400 to-blue-600 text-slate-950 shadow-[0_0_18px_#38bdf8]"
                }`}
              >
                <Gauge className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {hudSnap.nitroCooldown > 0
                  ? `${hudSnap.nitroCooldown.toFixed(1)}s`
                  : "TURBO [SHIFT]"}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fireAction("vehicle");
                }}
                className="flex h-7 sm:h-7.5 cursor-pointer items-center gap-1 rounded-full border-2 border-rose-400 bg-rose-950/90 px-2.5 text-[9px] sm:text-[10px] font-black text-rose-200 shadow-lg hover:bg-rose-900/80"
              >
                <Car className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>SAIR [V]</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fireAction("vehicle");
              }}
              title="Entrar ou Chamar Veículo [V]"
              className="flex h-7 sm:h-7.5 cursor-pointer items-center gap-1 rounded-full border border-amber-400/50 bg-slate-950/85 px-2.5 text-[9px] sm:text-[10px] font-black text-amber-300 shadow-lg hover:border-amber-300 hover:bg-amber-500/20"
            >
              <Car className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>CARRO/MOTO [V]</span>
            </motion.button>
          )}

          {dialogueCompleted && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                playSfx("levelUp");
                setOverlay("decoder");
              }}
              className="moba-ult-ready flex h-7 sm:h-7.5 cursor-pointer items-center gap-1 rounded-full border-2 border-amber-200 bg-gradient-to-r from-amber-300 to-amber-500 px-2.5 text-[9px] sm:text-[10px] font-black text-slate-950"
            >
              <Languages className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              TRADUZIR
            </motion.button>
          )}
        </div>

        {/* MOBA Combat Arc + Giant Primary Attack Button */}
        <div className="flex items-end gap-1.5 sm:gap-2.5">
          {/* Skill Q [1]: Pulso de Luz */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fireAction("skillQ");
            }}
            className="relative flex flex-col items-center"
          >
            <div
              className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 sm:h-13 sm:w-13 ${
                hudSnap.cooldowns.q > 0
                  ? "border-slate-700 bg-slate-900/90 text-slate-500"
                  : "border-cyan-300 bg-gradient-to-b from-cyan-500/45 to-slate-950 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.45)]"
              }`}
            >
              <Zap className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              {hudSnap.cooldowns.q > 0 && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/75 font-mono text-[10px] sm:text-xs font-black text-white">
                  {hudSnap.cooldowns.q.toFixed(1)}
                </span>
              )}
              <span className="absolute -right-1 -bottom-1 rounded-full border border-cyan-200 bg-slate-950 px-1 font-mono text-[8px] sm:text-[9px] font-black text-cyan-300">
                Q
              </span>
            </div>
          </motion.button>

          {/* Skill W [2]: Dash Tático */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fireAction("skillW");
            }}
            className="-translate-y-2 relative flex flex-col items-center"
          >
            <div
              className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 sm:h-13 sm:w-13 ${
                hudSnap.cooldowns.w > 0
                  ? "border-slate-700 bg-slate-900/90 text-slate-500"
                  : "border-emerald-300 bg-gradient-to-b from-emerald-500/45 to-slate-950 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.45)]"
              }`}
            >
              <ArrowRight className="h-4.5 w-4.5 -rotate-45 sm:h-5 sm:w-5" />
              {hudSnap.cooldowns.w > 0 && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/75 font-mono text-[10px] sm:text-xs font-black text-white">
                  {hudSnap.cooldowns.w.toFixed(1)}
                </span>
              )}
              <span className="absolute -right-1 -bottom-1 rounded-full border border-emerald-200 bg-slate-950 px-1 font-mono text-[7.5px] sm:text-[8.5px] font-black text-emerald-300">
                W / 2
              </span>
            </div>
          </motion.button>

          {/* Skill E [3]: Escudo de Oração & Cura */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fireAction("skillE");
            }}
            className="-translate-y-4 relative flex flex-col items-center"
          >
            <div
              className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 sm:h-13 sm:w-13 ${
                hudSnap.cooldowns.e > 0
                  ? "border-slate-700 bg-slate-900/90 text-slate-500"
                  : "border-amber-300 bg-gradient-to-b from-amber-400/45 to-slate-950 text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.5)]"
              }`}
            >
              <Shield className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              {hudSnap.cooldowns.e > 0 && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/75 font-mono text-[10px] sm:text-xs font-black text-white">
                  {hudSnap.cooldowns.e.toFixed(1)}
                </span>
              )}
              <span className="absolute -right-1 -bottom-1 rounded-full border border-amber-200 bg-slate-950 px-1 font-mono text-[8px] sm:text-[9px] font-black text-amber-300">
                E
              </span>
            </div>
          </motion.button>

          {/* Skill R [4]: Ultimate Luz das Nações */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fireAction("skillR");
            }}
            className="-translate-y-1.5 relative flex flex-col items-center"
          >
            <div
              className={`relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 sm:h-14 sm:w-14 ${
                hudSnap.cooldowns.r > 0
                  ? "border-slate-700 bg-slate-900/90 text-slate-500"
                  : "border-amber-200 bg-gradient-to-b from-amber-300 via-amber-500 to-orange-700 text-slate-950 shadow-[0_0_22px_rgba(251,191,36,0.75)]"
              }`}
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              {hudSnap.cooldowns.r > 0 && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/80 font-mono text-[10px] sm:text-xs font-black text-amber-200">
                  {Math.ceil(hudSnap.cooldowns.r)}s
                </span>
              )}
              <span className="absolute -right-1 -bottom-1 rounded-full border border-amber-200 bg-slate-950 px-1 font-mono text-[8px] sm:text-[9px] font-black text-amber-300">
                R
              </span>
            </div>
          </motion.button>

          {/* GIANT PRIMARY MELEE COMBO ATTACK BUTTON (AUTO-REPEAT ON HOLD!) */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.88 }}
            onPointerDown={startContinuousAttack}
            onPointerUp={stopContinuousAttack}
            onPointerLeave={stopContinuousAttack}
            onPointerCancel={stopContinuousAttack}
            className="relative flex h-16 w-16 sm:h-20 sm:w-20 cursor-pointer flex-col items-center justify-center rounded-full border-3 border-amber-200 bg-gradient-to-b from-rose-500 via-red-600 to-rose-900 text-white shadow-[0_0_28px_rgba(244,63,94,0.65)]"
          >
            {/* Keyboard Hotkey Badge */}
            <span className="absolute -top-1 -right-1 rounded-full border-2 border-amber-300 bg-slate-950 px-1.5 py-0.5 font-mono text-[7.5px] sm:text-[8.5px] font-black text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]">
              ESPAÇO
            </span>
            <Swords className="h-7 w-7 sm:h-8 sm:w-8 drop-shadow" />
            <span className="mt-0.5 font-mono text-[8px] sm:text-[9px] font-black tracking-wider text-amber-200 uppercase">
              ATACAR [ESPAÇO]
            </span>
          </motion.button>
        </div>
      </div>

      {/* PC KEYBOARD SHORTCUTS HUD BAR (GTA / LOL / CS:GO STYLE) */}
      <div className="hidden lg:flex pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 items-center gap-2 rounded-full border border-amber-400/40 bg-slate-950/90 px-4 py-1 backdrop-blur-md text-[10px] font-mono font-bold text-slate-200 shadow-xl">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-amber-400/70 bg-amber-500/20 px-1 text-amber-300 font-black">W A S D</kbd> Mover
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-rose-400/70 bg-rose-500/20 px-1.5 text-rose-300 font-black">ESPAÇO</kbd> Atacar
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-cyan-400/70 bg-cyan-500/20 px-1 text-cyan-300 font-black">Q</kbd>
          <kbd className="rounded border border-emerald-400/70 bg-emerald-500/20 px-1 text-emerald-300 font-black">W</kbd>
          <kbd className="rounded border border-amber-400/70 bg-amber-500/20 px-1 text-amber-300 font-black">E</kbd>
          <kbd className="rounded border border-orange-400/70 bg-orange-500/20 px-1 text-orange-300 font-black">R</kbd>
          Skills
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-emerald-400/70 bg-emerald-500/20 px-1 text-emerald-300 font-black">SHIFT</kbd> Dash/Nitro
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-amber-400/70 bg-amber-500/20 px-1 text-amber-300 font-black">V</kbd> Veículo
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-sky-400/70 bg-sky-500/20 px-1 text-sky-300 font-black">C</kbd> Câmera
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-purple-400/70 bg-purple-500/20 px-1 text-purple-300 font-black">F</kbd> Interagir
        </span>
      </div>

      {/* =========================================================
          MODALS & CONVERSATION OVERLAYS (ALL CLOSEABLE ANYTIME!)
         ========================================================= */}
      <AnimatePresence>
        {/* A. GTA MISSION PHONE / CENTRAL DE MISSÕES DO MAPA (12 MISSIONS!) */}
        {missionPhoneOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playSfx("click");
              setMissionPhoneOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.92, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="moba-panel-cyan moba-clip-panel max-h-[88vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 border-b border-cyan-500/30 pb-3">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-cyan-300 uppercase">
                    📱 GPS TÁTICO • SELECIONE QUALQUER MISSÃO PARA GUIAR NA CIDADE
                  </span>
                  <h3 className="text-xl font-black text-white uppercase">
                    Missões em {mission.title} ({completedMapMissions}/
                    {totalMapMissions})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setMissionPhoneOpen(false);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-200 hover:border-rose-400 hover:bg-rose-500/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Fechar
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {/* 1. Main Story Contact */}
                <button
                  type="button"
                  onClick={() =>
                    selectGpsMission(
                      WORLD_LANDMARKS.mainNpc.x,
                      WORLD_LANDMARKS.mainNpc.z,
                      `★ ${mission.npc.name} (Praça da Fonte)`
                    )
                  }
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 text-left transition hover:bg-emerald-500/20"
                >
                  <div>
                    <div className="text-xs font-black text-emerald-300 uppercase">
                      ★ MISSÃO PRINCIPAL • PRAÇA DA FONTE
                    </div>
                    <div className="text-sm font-bold text-white">
                      Conversar com {mission.npc.name} ({mission.npc.age} anos)
                    </div>
                  </div>
                  <span className="rounded-lg bg-slate-950/80 px-2.5 py-1 font-mono text-xs font-black text-emerald-300">
                    {dialogueCompleted ? "CONCLUÍDA ✓" : "IR c/ GPS →"}
                  </span>
                </button>

                {/* 2. GTA Timed Checkpoint Express Race */}
                <button
                  type="button"
                  onClick={() =>
                    selectGpsMission(
                      worldCfg.race.startX,
                      worldCfg.race.startZ,
                      `🏁 Largada: ${worldCfg.race.title}`
                    )
                  }
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 text-left transition hover:bg-amber-500/20"
                >
                  <div>
                    <div className="flex items-center gap-1 text-xs font-black text-amber-300 uppercase">
                      <Flag className="h-3.5 w-3.5" />
                      CORRIDA GTA CONTRA O RELÓGIO (+{worldCfg.race.pointsReward}{" "}
                      PTS • +15% PONTE)
                    </div>
                    <div className="text-sm font-bold text-white">
                      {worldCfg.race.title} (5 Checkpoints Dourados)
                    </div>
                  </div>
                  <span className="rounded-lg bg-slate-950/80 px-2.5 py-1 font-mono text-xs font-black text-amber-300">
                    {raceCompleted ? "VENCIDA ✓" : "MARCAR GPS →"}
                  </span>
                </button>

                {/* 3. Radio Broadcast Towers (3x) */}
                <div className="pt-1 text-[11px] font-black tracking-wider text-cyan-300 uppercase">
                  📡 TORRES DE RÁDIO & TRANSMISSÃO ({activatedTowerIds.length}/3)
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {worldCfg.radioTowers.map((tw) => {
                    const done = activatedTowerIds.includes(tw.id);
                    return (
                      <button
                        key={tw.id}
                        type="button"
                        onClick={() =>
                          selectGpsMission(tw.x, tw.z, `📡 ${tw.name}`)
                        }
                        className={`flex cursor-pointer flex-col justify-between rounded-xl border p-2.5 text-left transition ${
                          done
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-cyan-500/35 bg-slate-900/90 hover:border-cyan-300"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-black text-cyan-300 uppercase">
                          <Radio className="h-3 w-3" />
                          {tw.district}
                        </div>
                        <div className="mt-1 text-xs font-bold text-white">
                          {tw.name}
                        </div>
                        <div className="mt-1.5 font-mono text-[10px] font-black text-amber-300">
                          {done ? "TRANSMITINDO ✓" : `+${tw.pointsReward} PTS →`}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 4. 6 Street People Quests */}
                <div className="pt-1 text-[11px] font-black tracking-wider text-cyan-300 uppercase">
                  👥 PESSOAS & MISSÕES DE RUA ({helpedPersonIds.length}/
                  {worldCfg.people.length})
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {worldCfg.people.map((p) => {
                    const done = helpedPersonIds.includes(p.id);
                    const badge =
                      p.questType === "rescue"
                        ? "⚔️ RESGATE"
                        : p.questType === "supply"
                          ? "🧰 ENTREGA"
                          : "💬 APOIO";
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          selectGpsMission(
                            p.x,
                            p.z,
                            `${p.name} (${p.role})`
                          )
                        }
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-2.5 text-left transition ${
                          done
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-slate-700 bg-slate-900/90 hover:border-cyan-300"
                        }`}
                      >
                        <div>
                          <div className="text-[10px] font-black text-amber-300">
                            {badge} • {p.role}
                          </div>
                          <div className="text-xs font-bold text-white">
                            {p.name}
                          </div>
                        </div>
                        <span className="shrink-0 rounded bg-slate-950 px-2 py-1 font-mono text-[10px] font-black text-cyan-300">
                          {done ? "OK ✓" : "GPS →"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 5. District Boss + Northern Nexus */}
                <div className="grid gap-2 pt-1 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      selectGpsMission(
                        WORLD_LANDMARKS.boss.x,
                        WORLD_LANDMARKS.boss.z,
                        `👑 Boss: ${worldCfg.bossName}`
                      )
                    }
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-fuchsia-500/45 bg-fuchsia-950/35 p-3 text-left hover:border-fuchsia-300"
                  >
                    <div>
                      <div className="text-[10px] font-black text-fuchsia-300 uppercase">
                        👑 CHEFE DO DISTRITO NORTE
                      </div>
                      <div className="text-xs font-bold text-white">
                        {worldCfg.bossName}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-black text-amber-300">
                      {hudSnap.bossDefeated ? "VENCIDO ✓" : "GPS →"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      selectGpsMission(
                        WORLD_LANDMARKS.nexus.x,
                        WORLD_LANDMARKS.nexus.z,
                        "⚡ Nexus da Palavra (Final)"
                      )
                    }
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-amber-400/50 bg-amber-500/15 p-3 text-left hover:border-amber-200"
                  >
                    <div>
                      <div className="text-[10px] font-black text-amber-300 uppercase">
                        ⚡ SANTUÁRIO FINAL AO NORTE
                      </div>
                      <div className="text-xs font-bold text-white">
                        Nexus Decodificador da Palavra
                      </div>
                    </div>
                    <span className="flex items-center gap-1 font-mono text-[10px] font-black text-amber-200">
                      <MapPin className="h-3 w-3" />
                      GPS
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 0. GTA / RPG STREET CITIZEN QUEST ENCOUNTER MODAL */}
        {activeEncounter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playSfx("click");
              setActiveEncounter(null);
            }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-4 pb-8 backdrop-blur-xs sm:items-center"
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="moba-panel-cyan moba-clip-panel w-full max-w-xl p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 border-b border-cyan-500/30 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-black tracking-widest text-cyan-300 uppercase">
                    <HeartHandshake className="h-3.5 w-3.5" />
                    MISSÃO NA CIDADE •{" "}
                    {activeEncounter.person.questType === "rescue"
                      ? "MISSÃO DE RESGATE"
                      : activeEncounter.person.questType === "supply"
                        ? "ENTREGA DE SUPRIMENTOS"
                        : "APOIO & ENCORAJAMENTO"}
                  </span>
                  <h3 className="mt-1 text-lg font-black text-white uppercase sm:text-xl">
                    {activeEncounter.person.name}{" "}
                    <span className="text-xs font-bold text-slate-400">
                      ({activeEncounter.person.role})
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setActiveEncounter(null);
                  }}
                  title="Fechar conversa [Esc]"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-200 transition hover:border-rose-400 hover:bg-rose-500/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Fechar
                </button>
              </div>

              <p className="my-4 rounded-xl border border-slate-700/80 bg-slate-950/85 p-4 text-sm leading-relaxed font-semibold text-white sm:text-base">
                &ldquo;{activeEncounter.message}&rdquo;
              </p>

              {activeEncounter.status === "completed_now" && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-3.5 py-2.5 text-xs font-black text-emerald-300">
                  <span>✅ MISSÃO CONCLUÍDA!</span>
                  <span className="font-mono">
                    +{activeEncounter.person.pointsReward} PTS • +
                    {activeEncounter.person.xpReward} XP • +PONTE
                  </span>
                </div>
              )}

              {activeEncounter.status === "needs_supplies" && (
                <div className="mb-4 rounded-xl border border-amber-400/50 bg-amber-500/15 px-3.5 py-2.5 text-xs font-bold text-amber-200">
                  🧰 Recolha mais{" "}
                  <strong>
                    {activeEncounter.missingCount}x {worldCfg.supplyLabel}
                  </strong>{" "}
                  brilhando pelas avenidas (caixas azuis) e volte aqui!
                </div>
              )}

              {activeEncounter.status === "needs_rescue" && (
                <div className="mb-4 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3.5 py-2.5 text-xs font-bold text-rose-200">
                  ⚔️ Derrote as Sombras próximas usando{" "}
                  <strong>Ataque [Espaço]</strong>,{" "}
                  <strong>Skills [Q/E/R]</strong> ou atropelando com o{" "}
                  <strong>Carro/Moto [V]</strong> e fale novamente com{" "}
                  {activeEncounter.person.name}!
                </div>
              )}

              <MobaButton
                variant={
                  activeEncounter.status === "completed_now" ? "emerald" : "gold"
                }
                size="md"
                shape="hex"
                onClick={() => {
                  playSfx("click");
                  setActiveEncounter(null);
                }}
                className="w-full"
              >
                CONTINUAR NA CIDADE 3D
                <ArrowRight className="h-4 w-4" />
              </MobaButton>
            </motion.div>
          </motion.div>
        )}

        {/* 1. HOLOGRAPHIC CULTURAL BRIEFING OVERLAY */}
        {overlay === "briefing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playSfx("click");
              setOverlay("none");
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="moba-panel-cyan moba-clip-panel max-h-[88vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7"
            >
              <div className="flex items-start justify-between gap-3 border-b border-cyan-500/30 pb-3">
                <div>
                  <span className="text-[10px] font-black tracking-[0.22em] text-cyan-300 uppercase">
                    🧭 TOTEM DE INTELIGÊNCIA CULTURAL • {mission.country}
                  </span>
                  <h2 className="text-xl font-black text-white uppercase sm:text-2xl">
                    Dossiê de Campo: {mission.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setOverlay("none");
                  }}
                  title="Fechar [Esc]"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-200 transition hover:border-rose-400 hover:bg-rose-500/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Fechar
                </button>
              </div>

              <div className="my-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase">
                  <Lightbulb className="h-4 w-4" />
                  Sabedoria Transcultural
                </div>
                <p className="mt-1 text-xs leading-relaxed text-amber-100 sm:text-sm">
                  {mission.briefing.culturalTip}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-emerald-300 uppercase">
                    <ThumbsUp className="h-3.5 w-3.5" />O que Fazer
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {mission.briefing.dos.map((d, i) => (
                      <li key={i}>✓ {d}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-rose-300 uppercase">
                    <ThumbsDown className="h-3.5 w-3.5" />O que Evitar
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {mission.briefing.donts.map((d, i) => (
                      <li key={i}>✕ {d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <MobaButton
                  variant="obsidian"
                  size="md"
                  shape="slant"
                  onClick={() => {
                    playSfx("click");
                    setOverlay("none");
                  }}
                >
                  Voltar à Cidade 3D
                </MobaButton>
                <MobaButton
                  variant="emerald"
                  size="md"
                  shape="hex"
                  onClick={() => {
                    playSfx("click");
                    setCustomWaypoint({
                      x: WORLD_LANDMARKS.mainNpc.x,
                      z: WORLD_LANDMARKS.mainNpc.z,
                      label: `Praça da Fonte: ${mission.npc.name}`,
                    });
                    setOverlay("none");
                  }}
                >
                  Marcar GPS em {mission.npc.name}
                  <ArrowRight className="h-4 w-4" />
                </MobaButton>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 2. CINEMATIC MOBA 3D SPLIT-PORTRAIT DIALOGUE CLASH (CLOSEABLE ANYTIME!) */}
        {overlay === "dialogue" && currentTurn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playSfx("click");
              setOverlay("none");
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/88 p-3 backdrop-blur-md sm:p-5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={splash}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/90" />

            <motion.div
              initial={{ scale: 0.94, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="moba-panel-gold moba-clip-panel relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto p-4 sm:p-7"
            >
              {/* Top VS / Bridge Header + Prominent Close Button */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
                <div className="flex items-center gap-3">
                  <HeroPortrait
                    avatarId={state.agent.avatarId}
                    size={54}
                    shape="hex"
                    active
                  />
                  <div>
                    <div className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
                      SEU CAMPEÃO
                    </div>
                    <div className="text-sm font-black text-white uppercase">
                      {state.agent.name}
                    </div>
                  </div>
                </div>

                <div className="min-w-[190px] flex-1 px-2 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-widest text-emerald-300 uppercase">
                    <Swords className="h-3.5 w-3.5 text-amber-300" />
                    PONTE DE CONFIANÇA: {trust}%
                  </div>
                  <div className="mt-1 h-3 w-full overflow-hidden rounded-full border border-amber-400/50 bg-slate-950">
                    <motion.div
                      animate={{ width: `${trust}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-amber-300"
                    />
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-slate-400">
                    {currentTurn.sceneTitle} ({turnIndex + 1}/
                    {mission.turns.length})
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="hidden text-right sm:block">
                    <div className="text-[10px] font-black tracking-widest text-cyan-300 uppercase">
                      CONTATO LOCAL
                    </div>
                    <div className="text-sm font-black text-white uppercase">
                      {mission.npc.name} ({mission.npc.age}a)
                    </div>
                  </div>
                  <NpcPortrait
                    avatarKey={mission.npc.avatarKey}
                    size={54}
                    shape="hex"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setOverlay("none");
                    }}
                    title="Fechar conversa e voltar ao Mapa 3D [Esc]"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-rose-400/60 bg-slate-950/90 px-3 py-2 text-xs font-black text-rose-200 shadow-lg transition hover:border-rose-300 hover:bg-rose-500/25 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                    Fechar
                  </button>
                </div>
              </div>

              {/* 3D NPC Big Portrait + Speech Box */}
              <div className="mb-4 grid items-center gap-4 rounded-2xl border border-cyan-500/35 bg-slate-950/90 p-4 sm:grid-cols-12">
                <div className="flex justify-center sm:col-span-3">
                  <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.35)] sm:h-36 sm:w-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={NPC_PORTRAITS[mission.npc.avatarKey]}
                      alt={mission.npc.name}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>

                <div className="sm:col-span-9">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-cyan-300 uppercase">
                      {mission.npc.name} •{" "}
                      <span className="font-normal text-slate-400 italic">
                        {currentTurn.npcMood}
                      </span>
                    </span>

                    <MobaButton
                      variant="gold"
                      size="sm"
                      shape="slant"
                      disabled={
                        prayerUsesLeft <= 0 ||
                        prayerActiveThisTurn ||
                        Boolean(selectedOption)
                      }
                      onClick={handleActivatePrayerInDialogue}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Escudo de Oração ({prayerUsesLeft}x)
                    </MobaButton>
                  </div>

                  <p className="text-base leading-relaxed font-bold text-white sm:text-lg">
                    &ldquo;{currentTurn.npcSpeech}&rdquo;
                  </p>
                </div>
              </div>

              {prayerActiveThisTurn && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl border border-amber-400/60 bg-amber-500/15 p-3.5"
                >
                  <div className="text-xs font-black text-amber-300 uppercase">
                    🙏 Cobertura Espiritual Ativada (1 resposta precipitada foi
                    bloqueada!)
                  </div>
                  <p className="mt-1 text-xs text-amber-100">
                    {currentTurn.prayerHint}
                  </p>
                  <div className="mt-1 font-mono text-xs font-bold text-amber-300">
                    📖 {currentTurn.prayerVerse}
                  </div>
                </motion.div>
              )}

              {/* 3 Dialogue Choices */}
              <div className="space-y-2.5">
                {shuffledOptions.map((opt, idx) => {
                  const letter = ["A", "B", "C"][idx] || "•";
                  const eliminated =
                    prayerActiveThisTurn && opt.tone === "hasty";
                  const isChosen = selectedOption?.id === opt.id;
                  const revealed = Boolean(selectedOption);

                  let style =
                    "border-amber-500/35 bg-slate-900/90 hover:border-cyan-300 hover:bg-slate-800/90 text-white";
                  if (eliminated && !revealed) {
                    style =
                      "border-slate-800 bg-slate-950/30 opacity-35 line-through pointer-events-none";
                  } else if (revealed) {
                    if (opt.tone === "empathetic") {
                      style =
                        "border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]";
                    } else if (isChosen && opt.tone === "timid") {
                      style = "border-amber-400 bg-amber-500/20 text-white";
                    } else if (isChosen && opt.tone === "hasty") {
                      style = "border-rose-500 bg-rose-500/20 text-white";
                    } else {
                      style =
                        "border-slate-800 bg-slate-950/40 opacity-50 text-slate-400";
                    }
                  }

                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileHover={
                        !eliminated && !revealed
                          ? { scale: 1.015, x: 4 }
                          : undefined
                      }
                      whileTap={
                        !eliminated && !revealed ? { scale: 0.985 } : undefined
                      }
                      disabled={eliminated || revealed}
                      onClick={() => handleChooseOption(opt)}
                      className={`moba-clip-slant flex w-full cursor-pointer items-start gap-3.5 border-2 p-3.5 text-left transition ${style}`}
                    >
                      <span className="moba-clip-hex flex h-8 w-8 shrink-0 items-center justify-center bg-gradient-to-b from-amber-300 to-amber-600 font-mono text-xs font-black text-slate-950">
                        {letter}
                      </span>
                      <span className="flex-1 text-sm leading-relaxed font-semibold sm:text-base">
                        {opt.text}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {selectedOption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 rounded-2xl border-2 p-4 ${
                    selectedOption.tone === "empathetic"
                      ? "border-emerald-400 bg-emerald-500/15"
                      : selectedOption.tone === "timid"
                        ? "border-amber-400 bg-amber-500/15"
                        : "border-rose-500 bg-rose-500/15"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-black text-white uppercase">
                      {selectedOption.tone === "empathetic" &&
                        "✅ GOLPE DE GRAÇA & EMPATIA!"}
                      {selectedOption.tone === "timid" &&
                        "⚠️ ABORDAGEM TÍMIDA"}
                      {selectedOption.tone === "hasty" &&
                        "❌ ABORDAGEM PRECIPITADA"}
                    </span>
                    <div className="flex gap-2 font-mono text-xs font-black">
                      <span className="rounded bg-slate-950/70 px-2 py-0.5 text-emerald-300">
                        {selectedOption.trustDelta >= 0
                          ? `+${selectedOption.trustDelta}%`
                          : `${selectedOption.trustDelta}%`}{" "}
                        Ponte
                      </span>
                      <span className="rounded bg-slate-950/70 px-2 py-0.5 text-amber-300">
                        +{selectedOption.xpReward} XP
                      </span>
                    </div>
                  </div>

                  <p className="mt-1.5 text-xs leading-relaxed text-slate-100 sm:text-sm">
                    {selectedOption.feedback}
                  </p>

                  {selectedOption.bibleRef && (
                    <div className="mt-2 inline-block rounded bg-slate-950/80 px-2.5 py-1 font-mono text-xs font-bold text-cyan-300">
                      📖 {selectedOption.bibleRef}
                    </div>
                  )}

                  <div className="mt-4">
                    <MobaButton
                      variant="gold"
                      size="lg"
                      shape="hex"
                      onClick={handleNextTurn}
                      className="w-full"
                    >
                      {turnIndex + 1 < mission.turns.length
                        ? "PRÓXIMO TURNO DO DIÁLOGO"
                        : "⚡ DESBLOQUEAR NEXUS DA PALAVRA AO NORTE!"}
                      <ArrowRight className="h-4 w-4" />
                    </MobaButton>
                  </div>
                </motion.div>
              )}

              {/* Footer Escape / Return to 3D Map Action */}
              <div className="mt-4 flex items-center justify-between border-t border-amber-500/20 pt-3">
                <span className="text-[11px] font-semibold text-slate-400">
                  Seu progresso na conversa fica salvo enquanto você explora a
                  cidade.
                </span>
                <MobaButton
                  variant="obsidian"
                  size="sm"
                  shape="slant"
                  onClick={() => {
                    playSfx("click");
                    setOverlay("none");
                  }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar ao Mapa 3D
                </MobaButton>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. ULTIMATE SPELL: WORD DECODER MINI-GAME OVERLAY */}
        {overlay === "decoder" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playSfx("click");
              setOverlay("none");
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[92vh] w-full max-w-3xl overflow-y-auto"
            >
              <WordDecoderGame
                challenge={mission.decoder}
                onComplete={handleDecoderComplete}
                onClose={() => setOverlay("none")}
              />
            </motion.div>
          </motion.div>
        )}

        {/* 4. MOBA + GTA "VITÓRIA!" POST-MATCH SCREEN */}
        {overlay === "victory" && victoryStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 p-4 backdrop-blur-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={splash}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
            />

            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="moba-panel-gold moba-clip-panel relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto p-5 sm:p-8"
            >
              <div className="text-center">
                <div className="mx-auto mb-3 flex items-center justify-center gap-4">
                  <HeroPortrait
                    avatarId={state.agent.avatarId}
                    size={72}
                    shape="hex"
                    active
                  />
                  <PassportStampSvg
                    missionId={mission.id}
                    stampCode={mission.stampCode}
                    title={mission.country}
                    accentColor={mission.accentColor}
                    size={104}
                  />
                  <NpcPortrait
                    avatarKey={mission.npc.avatarKey}
                    size={72}
                    shape="hex"
                  />
                </div>

                <h2 className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-4xl font-black tracking-[0.18em] text-transparent uppercase drop-shadow-[0_4px_20px_rgba(245,158,11,0.5)] sm:text-5xl">
                  VITÓRIA!
                </h2>
                <p className="mt-1 text-sm font-bold text-cyan-200">
                  Região {mission.title} Concluída • Semente Plantada com{" "}
                  {mission.npc.name}!
                </p>
              </div>

              <div className="my-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                <div className="rounded-xl border border-amber-500/35 bg-slate-950/85 p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase">
                    PONTE CONFIANÇA
                  </div>
                  <div className="mt-0.5 font-mono text-2xl font-black text-emerald-400">
                    {trust}%
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/35 bg-slate-950/85 p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase">
                    PONTOS MUNDO 3D
                  </div>
                  <div className="mt-0.5 font-mono text-2xl font-black text-amber-300">
                    {hudSnap.score.toLocaleString("pt-BR")}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/35 bg-slate-950/85 p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase">
                    XP TOTAL GANHO
                  </div>
                  <div className="mt-0.5 font-mono text-2xl font-black text-cyan-300">
                    +{victoryStats.totalXpEarned}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/35 bg-slate-950/85 p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase">
                    SABEDORIA
                  </div>
                  <div className="mt-0.5 font-mono text-2xl font-black text-amber-300">
                    +{victoryStats.wisdomEarned} 💎
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 font-mono text-xs font-bold text-cyan-200">
                <span>
                  📱 Missões do Mapa: {completedMapMissions}/{totalMapMissions}
                </span>
                <span>•</span>
                <span>
                  📡 Torres: {activatedTowerIds.length}/
                  {worldCfg.radioTowers.length}
                </span>
                <span>•</span>
                <span>
                  ⚔️ Sombras: {hudSnap.enemiesDefeated}/{hudSnap.totalEnemies}
                </span>
              </div>

              {trust >= 100 ? (
                <div className="my-5">
                  <div className="mb-2 text-center text-xs font-black tracking-widest text-amber-300 uppercase">
                    ✨ SKIN / CARD LENDÁRIO 100% DESBLOQUEADO! ✨
                  </div>
                  <CollectibleCard
                    mission={mission}
                    agentName={state.agent.name}
                  />
                </div>
              ) : (
                <div className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-amber-300" />
                    <p className="text-xs text-amber-100">
                      Dica: Completar as <strong>Missões do Mapa</strong> (Corrida
                      GTA, Torres e Pessoas) soma bônus para alcançar{" "}
                      <strong>100% na Ponte</strong> e ganhar o Card Lendário 3D!
                    </p>
                  </div>
                  <MobaButton
                    variant="obsidian"
                    size="sm"
                    shape="slant"
                    onClick={handleReplayMission}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Buscar 100%
                  </MobaButton>
                </div>
              )}

              <div className="my-4 rounded-2xl border border-violet-500/40 bg-violet-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-black text-violet-300 uppercase">
                  <School className="h-4 w-4" />
                  {mission.schoolChallenge.title}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed font-semibold text-white sm:text-sm">
                  {mission.schoolChallenge.action}
                </p>

                <div className="mt-3">
                  {schoolAccepted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Missão na Escola Aceita! (+25 XP)
                    </span>
                  ) : (
                    <MobaButton
                      variant="violet"
                      size="sm"
                      shape="slant"
                      onClick={() => acceptSchoolChallenge(mission.id)}
                    >
                      ✋ Aceitar Missão na Escola (+25 XP)
                    </MobaButton>
                  )}
                </div>
              </div>

              <MobaButton
                variant="gold"
                size="xl"
                shape="hex"
                onClick={onExitToHub}
                className="mt-3 w-full"
              >
                CONTINUAR • VOLTAR AO LOBBY 3D
                <ArrowRight className="h-5 w-5" />
              </MobaButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
