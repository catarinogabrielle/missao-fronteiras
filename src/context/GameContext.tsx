"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AgentProfile,
  AvatarId,
  GameState,
  GiftId,
  Mission,
} from "@/types/game";
import { CORE_MISSIONS } from "@/data/missions";
import { ACHIEVEMENTS } from "@/data/avatarsAndGifts";
import { soundEngine, SoundEffect } from "@/lib/sound";

const STORAGE_KEY = "missao_fronteiras_chamado_v1";

const INITIAL_STATE: GameState = {
  agent: null,
  xp: 0,
  wisdom: 20,
  streak: 1,
  lastActiveDate: "",
  missionProgress: {},
  prayedMissionIds: [],
  studiedGospelSteps: [],
  unlockedAchievements: [],
  customMissions: [],
  allUnlockedByLeader: false,
  muted: false,
  projectorMode: false,
};

export interface ToastNotification {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
}

interface GameContextValue {
  state: GameState;
  hydrated: boolean;
  allMissions: Mission[];
  level: number;
  levelTitle: string;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  playSfx: (effect: SoundEffect) => void;
  createAgent: (name: string, avatarId: AvatarId, giftId: GiftId) => void;
  completeMission: (
    mission: Mission,
    finalTrust: number,
    dialogueXp: number
  ) => { totalXpEarned: number; wisdomEarned: number; leveledUp: boolean };
  acceptSchoolChallenge: (missionId: string) => void;
  prayForRegion: (missionId: string, wisdomReward: number) => void;
  markGospelStepStudied: (stepNumber: number) => void;
  spendWisdom: (amount: number) => boolean;
  addBonusXp: (amount: number, reason?: string) => void;
  grantFieldLoot: (xp: number, wisdom: number) => void;
  toggleMute: () => void;
  toggleProjectorMode: () => void;
  addCustomMission: (mission: Mission) => void;
  deleteCustomMission: (missionId: string) => void;
  toggleAllUnlockedByLeader: () => void;
  resetStudentProgress: () => void;
  isMissionUnlocked: (mission: Mission) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

const LEVEL_TITLES = [
  "Recruta da Base Ide",
  "Explorador Cultural",
  "Construtor de Pontes",
  "Tradutor da Graça",
  "Embaixador Transcultural",
  "Pioneiro das Nações",
  "Líder Global Ide",
];

function getTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const emptySubscribe = () => () => {};

function loadInitialGameState(): GameState {
  if (typeof window === "undefined") {
    return INITIAL_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const today = getTodayIso();
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      let updatedStreak = parsed.streak ?? 1;

      if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
        const prevDate = new Date(parsed.lastActiveDate);
        const currDate = new Date(today);
        const diffDays = Math.round(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          updatedStreak += 1;
        } else if (diffDays > 1) {
          updatedStreak = 1;
        }
      }

      const merged: GameState = {
        ...INITIAL_STATE,
        ...parsed,
        streak: updatedStreak,
        lastActiveDate: today,
      };
      soundEngine.setMuted(Boolean(merged.muted));
      return merged;
    }
    return { ...INITIAL_STATE, lastActiveDate: today };
  } catch {
    return INITIAL_STATE;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(loadInitialGameState);
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const pushToast = useCallback(
    (title: string, subtitle: string, emoji = "🏆") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, subtitle, emoji }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4800);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Persist to localStorage & sync Projector Mode class
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
    soundEngine.setMuted(state.muted);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle(
        "projector-mode",
        state.projectorMode
      );
    }
  }, [state, hydrated]);

  const playSfx = useCallback((effect: SoundEffect) => {
    soundEngine.play(effect);
  }, []);

  const xpPerLevel = 220;
  const level = Math.floor(state.xp / xpPerLevel) + 1;
  const xpInCurrentLevel = state.xp % xpPerLevel;
  const xpForNextLevel = xpPerLevel;
  const levelTitle =
    LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  const allMissions = useMemo(
    () => [...CORE_MISSIONS, ...state.customMissions],
    [state.customMissions]
  );

  const isMissionUnlocked = useCallback(
    (mission: Mission) => {
      if (state.allUnlockedByLeader || mission.isCustom || mission.order === 1) {
        return true;
      }
      const prevMission = CORE_MISSIONS.find(
        (m) => m.order === mission.order - 1
      );
      if (!prevMission) return true;
      return Boolean(state.missionProgress[prevMission.id]?.completed);
    },
    [state.allUnlockedByLeader, state.missionProgress]
  );

  const createAgent = useCallback(
    (name: string, avatarId: AvatarId, giftId: GiftId) => {
      soundEngine.play("levelUp");
      const bonusWisdom = giftId === "intercessor" ? 50 : 25;
      const profile: AgentProfile = {
        name: name.trim() || "Agente Ide",
        avatarId,
        giftId,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        agent: profile,
        wisdom: bonusWisdom,
        streak: Math.max(1, prev.streak),
        lastActiveDate: getTodayIso(),
      }));
      pushToast(
        `Bem-vindo à Base Ide, ${profile.name}!`,
        "Seu Passaporte Missionário foi emitido.",
        "🛂"
      );
    },
    [pushToast]
  );

  const completeMission = useCallback(
    (mission: Mission, finalTrust: number, dialogueXp: number) => {
      const clampedTrust = Math.max(0, Math.min(100, finalTrust));
      const isCommunicator = state.agent?.giftId === "comunicador";
      const adjustedDialogueXp = isCommunicator
        ? Math.round(dialogueXp * 1.2)
        : dialogueXp;
      const perfectBonusXp = clampedTrust >= 100 ? 40 : 0;
      const totalXpEarned =
        mission.rewardXp + adjustedDialogueXp + perfectBonusXp;
      const wisdomEarned =
        mission.rewardWisdom + (clampedTrust >= 100 ? 15 : 0);

      const oldLevel = Math.floor(state.xp / xpPerLevel) + 1;
      const newLevel = Math.floor((state.xp + totalXpEarned) / xpPerLevel) + 1;
      const leveledUp = newLevel > oldLevel;

      const newlyUnlocked: string[] = [];

      setState((prev) => {
        const existingRecord = prev.missionProgress[mission.id];
        const nextProgress = {
          ...prev.missionProgress,
          [mission.id]: {
            completed: true,
            bestTrust: Math.max(existingRecord?.bestTrust ?? 0, clampedTrust),
            completedAt: new Date().toISOString(),
            perfectCardUnlocked:
              Boolean(existingRecord?.perfectCardUnlocked) ||
              clampedTrust >= 100,
            schoolChallengeAccepted: existingRecord?.schoolChallengeAccepted,
          },
        };

        const achSet = new Set(prev.unlockedAchievements);

        if (mission.medalId && !achSet.has(mission.medalId)) {
          const existsInCatalog = ACHIEVEMENTS.some(
            (a) => a.id === mission.medalId
          );
          if (existsInCatalog) {
            achSet.add(mission.medalId);
            newlyUnlocked.push(mission.medalId);
          }
        }

        if (clampedTrust >= 100 && !achSet.has("embaixador_paz")) {
          achSet.add("embaixador_paz");
          newlyUnlocked.push("embaixador_paz");
        }

        const allFourCompleted = CORE_MISSIONS.every(
          (cm) => nextProgress[cm.id]?.completed
        );
        if (allFourCompleted && !achSet.has("agente_global")) {
          achSet.add("agente_global");
          newlyUnlocked.push("agente_global");
        }

        return {
          ...prev,
          xp: prev.xp + totalXpEarned,
          wisdom: prev.wisdom + wisdomEarned,
          missionProgress: nextProgress,
          unlockedAchievements: Array.from(achSet),
        };
      });

      soundEngine.play(leveledUp ? "levelUp" : "stamp");

      newlyUnlocked.forEach((achId) => {
        const meta = ACHIEVEMENTS.find((a) => a.id === achId);
        if (meta) {
          pushToast(`Medalha Desbloqueada: ${meta.title}`, meta.description, meta.emoji);
        }
      });

      if (leveledUp) {
        pushToast(
          `Subiu para o Nível ${newLevel}!`,
          "Sua influência missionária está crescendo!",
          "⚡"
        );
      }

      return { totalXpEarned, wisdomEarned, leveledUp };
    },
    [pushToast, state.agent?.giftId, state.xp]
  );

  const acceptSchoolChallenge = useCallback(
    (missionId: string) => {
      soundEngine.play("success");
      setState((prev) => {
        const rec = prev.missionProgress[missionId];
        if (!rec || rec.schoolChallengeAccepted) return prev;
        return {
          ...prev,
          xp: prev.xp + 25,
          missionProgress: {
            ...prev.missionProgress,
            [missionId]: {
              ...rec,
              schoolChallengeAccepted: true,
            },
          },
        };
      });
      pushToast(
        "Missão na Escola Aceita! (+25 XP)",
        "Viva o Evangelho na prática com seus colegas nesta semana!",
        "🎒"
      );
    },
    [pushToast]
  );

  const prayForRegion = useCallback(
    (missionId: string, wisdomReward: number) => {
      soundEngine.play("prayer");
      let unlockedGlobalIntercessor = false;

      setState((prev) => {
        if (prev.prayedMissionIds.includes(missionId)) return prev;
        const nextPrayed = [...prev.prayedMissionIds, missionId];
        const achSet = new Set(prev.unlockedAchievements);

        const allCorePrayed = CORE_MISSIONS.every((m) =>
          nextPrayed.includes(m.id)
        );
        if (allCorePrayed && !achSet.has("intercessor_global")) {
          achSet.add("intercessor_global");
          unlockedGlobalIntercessor = true;
        }

        return {
          ...prev,
          wisdom: prev.wisdom + wisdomReward,
          xp: prev.xp + 15,
          prayedMissionIds: nextPrayed,
          unlockedAchievements: Array.from(achSet),
        };
      });

      pushToast(
        `Cobertura Ativada (+${wisdomReward} Sabedoria)`,
        "Você intercedeu pela igreja local e destravou +1 carga espiritual na missão!",
        "🙏"
      );

      if (unlockedGlobalIntercessor) {
        pushToast(
          "Medalha: Sentinela de Oração!",
          "Você intercedeu por todas as 4 regiões missionárias!",
          "📡"
        );
      }
    },
    [pushToast]
  );

  const markGospelStepStudied = useCallback(
    (stepNumber: number) => {
      soundEngine.play("success");
      let unlockedBibleMaster = false;

      setState((prev) => {
        if (prev.studiedGospelSteps.includes(stepNumber)) return prev;
        const nextSteps = [...prev.studiedGospelSteps, stepNumber];
        const achSet = new Set(prev.unlockedAchievements);

        if (nextSteps.length >= 4 && !achSet.has("mestre_evangelho")) {
          achSet.add("mestre_evangelho");
          unlockedBibleMaster = true;
        }

        return {
          ...prev,
          wisdom: prev.wisdom + 10,
          xp: prev.xp + 15,
          studiedGospelSteps: nextSteps,
          unlockedAchievements: Array.from(achSet),
        };
      });

      if (unlockedBibleMaster) {
        pushToast(
          "Medalha: Bíblia Viva no Recreio!",
          "Você dominou os 4 Passos do Evangelho para compartilhar com amigos!",
          "📖"
        );
      }
    },
    [pushToast]
  );

  const spendWisdom = useCallback(
    (amount: number) => {
      if (state.wisdom < amount) return false;
      setState((prev) => ({ ...prev, wisdom: Math.max(0, prev.wisdom - amount) }));
      return true;
    },
    [state.wisdom]
  );

  const addBonusXp = useCallback(
    (amount: number, reason?: string) => {
      soundEngine.play("levelUp");
      setState((prev) => ({ ...prev, xp: prev.xp + amount }));
      if (reason) {
        pushToast(`+${amount} XP Conquistado!`, reason, "🔥");
      }
    },
    [pushToast]
  );

  const grantFieldLoot = useCallback(
    (xpAmount: number, wisdomAmount: number) => {
      let crossedNewLevel: number | null = null;
      setState((prev) => {
        const oldLvl = Math.floor(prev.xp / xpPerLevel) + 1;
        const nextXp = prev.xp + xpAmount;
        const newLvl = Math.floor(nextXp / xpPerLevel) + 1;
        if (newLvl > oldLvl) {
          crossedNewLevel = newLvl;
        }
        return {
          ...prev,
          xp: nextXp,
          wisdom: prev.wisdom + wisdomAmount,
        };
      });
      if (crossedNewLevel !== null) {
        soundEngine.play("levelUp");
        pushToast(
          `Subiu para o Nível ${crossedNewLevel}!`,
          "Suas missões e batalhas em campo elevaram seu nível!",
          "⚡"
        );
      }
    },
    [pushToast]
  );

  const toggleMute = useCallback(() => {
    setState((prev) => {
      const nextMuted = !prev.muted;
      soundEngine.setMuted(nextMuted);
      if (!nextMuted) soundEngine.play("click");
      return { ...prev, muted: nextMuted };
    });
  }, []);

  const toggleProjectorMode = useCallback(() => {
    soundEngine.play("click");
    setState((prev) => ({ ...prev, projectorMode: !prev.projectorMode }));
  }, []);

  const addCustomMission = useCallback(
    (mission: Mission) => {
      soundEngine.play("stamp");
      setState((prev) => ({
        ...prev,
        customMissions: [...prev.customMissions, mission],
      }));
      pushToast(
        `Nova Missão Criada: ${mission.title}`,
        "Já disponível no Mapa Global da Base Ide!",
        "🗺️"
      );
    },
    [pushToast]
  );

  const deleteCustomMission = useCallback((missionId: string) => {
    soundEngine.play("click");
    setState((prev) => ({
      ...prev,
      customMissions: prev.customMissions.filter((m) => m.id !== missionId),
    }));
  }, []);

  const toggleAllUnlockedByLeader = useCallback(() => {
    soundEngine.play("click");
    setState((prev) => ({
      ...prev,
      allUnlockedByLeader: !prev.allUnlockedByLeader,
    }));
  }, []);

  const resetStudentProgress = useCallback(() => {
    soundEngine.play("click");
    setState((prev) => ({
      ...INITIAL_STATE,
      customMissions: prev.customMissions,
      projectorMode: prev.projectorMode,
      muted: prev.muted,
      lastActiveDate: getTodayIso(),
    }));
    pushToast(
      "Progresso Reiniciado",
      "Pronto para uma nova turma ou novo agente!",
      "🔄"
    );
  }, [pushToast]);

  const value: GameContextValue = {
    state,
    hydrated,
    allMissions,
    level,
    levelTitle,
    xpInCurrentLevel,
    xpForNextLevel,
    toasts,
    dismissToast,
    playSfx,
    createAgent,
    completeMission,
    acceptSchoolChallenge,
    prayForRegion,
    markGospelStepStudied,
    spendWisdom,
    addBonusXp,
    grantFieldLoot,
    toggleMute,
    toggleProjectorMode,
    addCustomMission,
    deleteCustomMission,
    toggleAllUnlockedByLeader,
    resetStudentProgress,
    isMissionUnlocked,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used inside GameProvider");
  }
  return ctx;
}
