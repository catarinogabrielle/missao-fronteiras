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
  SkinId,
} from "@/types/game";
import { CORE_MISSIONS } from "@/data/missions";
import {
  ACHIEVEMENTS,
  DEFAULT_FREE_SKINS,
  SKIN_OPTIONS,
} from "@/data/avatarsAndGifts";
import { soundEngine, SoundEffect } from "@/lib/sound";

const STORAGE_KEY = "missao_fronteiras_chamado_v1";

export const DEFAULT_CHAMPION_PROFILES: AgentProfile[] = [
  {
    name: "Kaleb_BR",
    avatarId: "lucas",
    giftId: "acolhedor",
    skinId: "padrao",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    name: "Sofia_Ide",
    avatarId: "sofia",
    giftId: "comunicador",
    skinId: "padrao",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    name: "Tribo Atos",
    avatarId: "davi",
    giftId: "tradutor",
    skinId: "padrao",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    name: "Rede Teens",
    avatarId: "ester",
    giftId: "intercessor",
    skinId: "padrao",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const INITIAL_STATE: GameState = {
  agent: null,
  lastActiveAgent: DEFAULT_CHAMPION_PROFILES[0],
  savedProfiles: [...DEFAULT_CHAMPION_PROFILES],
  xp: 0,
  wisdom: 25,
  streak: 1,
  lastActiveDate: "",
  missionProgress: {},
  prayedMissionIds: [],
  studiedGospelSteps: [],
  unlockedAchievements: [],
  unlockedSkins: [...DEFAULT_FREE_SKINS],
  customMissions: [],
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
  createAgent: (
    name: string,
    avatarId: AvatarId,
    giftId: GiftId,
    skinId?: SkinId
  ) => void;
  updateAgentAppearance: (updates: {
    name?: string;
    avatarId?: AvatarId;
    giftId?: GiftId;
    skinId?: SkinId;
  }) => void;
  isSkinUnlocked: (skinId: SkinId) => boolean;
  unlockAndEquipSkin: (skinId: SkinId, forceFree?: boolean) => boolean;
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
  updateCustomMission: (mission: Mission) => void;
  deleteCustomMission: (missionId: string) => void;
  resetStudentProgress: () => void;
  switchUser: () => void;
  selectProfile: (profile: AgentProfile) => void;
  deleteProfile: (profileName: string) => void;
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
  "Embaixador Global Ide",
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

      const mergedSkins = Array.from(
        new Set([
          ...DEFAULT_FREE_SKINS,
          ...(Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : []),
        ])
      );

      const migratedAgent = parsed.agent
        ? {
            ...parsed.agent,
            skinId: parsed.agent.skinId || ("padrao" as SkinId),
          }
        : null;

      let mergedSavedProfiles: AgentProfile[] = [];

      if (Array.isArray(parsed.savedProfiles)) {
        // User already has their saved profile collection stored.
        // NEVER re-inject deleted default profiles!
        const profileMap = new Map<string, AgentProfile>();
        parsed.savedProfiles.forEach((prof) => {
          if (!prof || !prof.name) return;
          const lower = prof.name.toLowerCase().trim();
          let sanitizedAvatar = prof.avatarId;
          if (lower === "sofia_ide" && sanitizedAvatar !== "sofia") {
            sanitizedAvatar = "sofia";
          } else if (lower === "kaleb_br" && sanitizedAvatar !== "lucas") {
            sanitizedAvatar = "lucas";
          } else if (lower === "tribo atos" && sanitizedAvatar !== "davi") {
            sanitizedAvatar = "davi";
          } else if (lower === "rede teens" && sanitizedAvatar !== "ester") {
            sanitizedAvatar = "ester";
          }
          profileMap.set(lower, {
            ...prof,
            avatarId: sanitizedAvatar,
            skinId: prof.skinId || "padrao",
          });
        });
        mergedSavedProfiles = Array.from(profileMap.values());
      } else {
        // First run ever on a fresh device without any saved profile state:
        mergedSavedProfiles = [...DEFAULT_CHAMPION_PROFILES];
      }

      // Ensure active agent is only kept if it actually exists in saved profiles (unless list is empty)
      const isAgentInSaved = migratedAgent
        ? mergedSavedProfiles.some(
            (p) => p.name.toLowerCase().trim() === migratedAgent.name.toLowerCase().trim()
          )
        : false;
      const resolvedAgent = isAgentInSaved
        ? migratedAgent
        : (mergedSavedProfiles[0] || null);

      const resolvedLastActive =
        resolvedAgent ||
        (parsed.lastActiveAgent &&
        mergedSavedProfiles.some(
          (p) =>
            p.name.toLowerCase().trim() ===
            parsed.lastActiveAgent!.name.toLowerCase().trim()
        )
          ? parsed.lastActiveAgent
          : mergedSavedProfiles[0] || null);

      const merged: GameState = {
        ...INITIAL_STATE,
        ...parsed,
        agent: resolvedAgent,
        lastActiveAgent: resolvedLastActive,
        savedProfiles: mergedSavedProfiles,
        unlockedSkins: mergedSkins,
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
      if (mission.isCustom || mission.order === 1) {
        return true;
      }
      const prevMission = CORE_MISSIONS.find(
        (m) => m.order === mission.order - 1
      );
      if (!prevMission) return true;
      return Boolean(state.missionProgress[prevMission.id]?.completed);
    },
    [state.missionProgress]
  );

  const isSkinUnlocked = useCallback(
    (skinId: SkinId) => {
      const meta = SKIN_OPTIONS.find((s) => s.id === skinId);
      if (meta && meta.costWisdom === 0) return true;
      return state.unlockedSkins.includes(skinId);
    },
    [state.unlockedSkins]
  );

  const createAgent = useCallback(
    (
      name: string,
      avatarId: AvatarId,
      giftId: GiftId,
      skinId: SkinId = "padrao"
    ) => {
      soundEngine.play("levelUp");
      const bonusWisdom = giftId === "intercessor" ? 55 : 30;
      const profile: AgentProfile = {
        name: name.trim() || `Agente ${avatarId.toUpperCase()}`,
        avatarId,
        giftId,
        skinId,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => {
        const nextSaved = Array.from(
          new Map(
            [...(prev.savedProfiles || []), profile].map((p) => [
              p.name.toLowerCase(),
              p,
            ])
          ).values()
        );
        return {
          ...prev,
          agent: profile,
          lastActiveAgent: profile,
          savedProfiles: nextSaved,
          wisdom: Math.max(prev.wisdom, bonusWisdom),
          unlockedSkins: Array.from(new Set([...prev.unlockedSkins, skinId])),
          streak: Math.max(1, prev.streak),
          lastActiveDate: getTodayIso(),
        };
      });
      pushToast(
        `Bem-vindo à Base Ide, ${profile.name}!`,
        "Seu Campeão 3D e Passaporte Missionário foram ativados.",
        "🛂"
      );
    },
    [pushToast]
  );

  const switchUser = useCallback(() => {
    soundEngine.play("click");
    setState((prev) => {
      const current = prev.agent;
      const nextSaved = current
        ? Array.from(
            new Map(
              [...(prev.savedProfiles || []), current].map((p) => [
                p.name.toLowerCase(),
                p,
              ])
            ).values()
          )
        : prev.savedProfiles;

      return {
        ...prev,
        agent: null,
        lastActiveAgent: current || prev.lastActiveAgent,
        savedProfiles: nextSaved,
      };
    });
    pushToast(
      "Trocar Usuário / Agente",
      "Selecione um campeão existente ou crie uma nova identidade!",
      "👥"
    );
  }, [pushToast]);

  const selectProfile = useCallback(
    (profile: AgentProfile) => {
      soundEngine.play("levelUp");
      setState((prev) => {
        const nextSaved = Array.from(
          new Map(
            [...(prev.savedProfiles || []), profile].map((p) => [
              p.name.toLowerCase(),
              p,
            ])
          ).values()
        );
        return {
          ...prev,
          agent: profile,
          lastActiveAgent: profile,
          savedProfiles: nextSaved,
          unlockedSkins: Array.from(
            new Set([...prev.unlockedSkins, profile.skinId || "padrao"])
          ),
          lastActiveDate: getTodayIso(),
        };
      });
      pushToast(
        `Agente Conectado: ${profile.name}`,
        `Campeão ${profile.avatarId.toUpperCase()} ativado com sucesso!`,
        "🚀"
      );
    },
    [pushToast]
  );

  const deleteProfile = useCallback(
    (profileName: string) => {
      soundEngine.play("click");
      const target = profileName.toLowerCase().trim();
      setState((prev) => {
        const nextSaved = (prev.savedProfiles || []).filter(
          (p) => p.name.toLowerCase().trim() !== target
        );
        const isActiveDeleted =
          prev.agent?.name.toLowerCase().trim() === target;
        const isLastActiveDeleted =
          prev.lastActiveAgent?.name.toLowerCase().trim() === target;
        const fallback = nextSaved[0] || null;

        const nextState: GameState = {
          ...prev,
          savedProfiles: nextSaved,
          agent: isActiveDeleted ? fallback : prev.agent,
          lastActiveAgent: isLastActiveDeleted ? fallback : prev.lastActiveAgent,
        };

        // Guarantee immediate synchronous persistence to localStorage
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
          }
        } catch {}

        return nextState;
      });
      pushToast(
        "Conta Excluída",
        `O perfil "${profileName}" foi removido com sucesso.`,
        "🗑️"
      );
    },
    [pushToast]
  );

  const updateAgentAppearance = useCallback(
    (updates: {
      name?: string;
      avatarId?: AvatarId;
      giftId?: GiftId;
      skinId?: SkinId;
    }) => {
      soundEngine.play("success");
      setState((prev) => {
        const current: AgentProfile = prev.agent || {
          name: "Equipe Ide",
          avatarId: "lucas",
          giftId: "acolhedor",
          skinId: "padrao",
          createdAt: new Date().toISOString(),
        };
        const nextName =
          updates.name !== undefined
            ? updates.name.trim() || current.name
            : current.name;
        const nextAvatar = updates.avatarId ?? current.avatarId;
        const nextGift = updates.giftId ?? current.giftId;
        const nextSkin = updates.skinId ?? current.skinId ?? "padrao";
        const updatedAgent: AgentProfile = {
          ...current,
          name: nextName,
          avatarId: nextAvatar,
          giftId: nextGift,
          skinId: nextSkin,
        };

        const nextSaved = Array.from(
          new Map(
            [...(prev.savedProfiles || []), updatedAgent].map((p) => [
              p.name.toLowerCase(),
              p,
            ])
          ).values()
        );

        return {
          ...prev,
          agent: updatedAgent,
          lastActiveAgent: updatedAgent,
          savedProfiles: nextSaved,
          unlockedSkins: Array.from(
            new Set([...prev.unlockedSkins, nextSkin])
          ),
        };
      });
    },
    []
  );

  const unlockAndEquipSkin = useCallback(
    (skinId: SkinId, forceFree = false) => {
      const meta = SKIN_OPTIONS.find((s) => s.id === skinId);
      if (!meta) return false;

      const alreadyUnlocked =
        forceFree ||
        meta.costWisdom === 0 ||
        state.unlockedSkins.includes(skinId);

      if (alreadyUnlocked) {
        soundEngine.play("success");
        setState((prev) => {
          if (!prev.agent) return prev;
          const updatedAgent = { ...prev.agent, skinId };
          const nextSaved = Array.from(
            new Map(
              [...(prev.savedProfiles || []), updatedAgent].map((p) => [
                p.name.toLowerCase(),
                p,
              ])
            ).values()
          );
          return {
            ...prev,
            agent: updatedAgent,
            lastActiveAgent: updatedAgent,
            savedProfiles: nextSaved,
            unlockedSkins: Array.from(new Set([...prev.unlockedSkins, skinId])),
          };
        });
        pushToast(
          `Skin Equipada: ${meta.name}`,
          meta.tagline,
          meta.badgeEmoji
        );
        return true;
      }

      if (state.wisdom < meta.costWisdom) {
        soundEngine.play("error");
        pushToast(
          "Cristais de Sabedoria Insuficientes",
          `Você precisa de ${meta.costWisdom} 💎 para desbloquear ${meta.name}.`,
          "💎"
        );
        return false;
      }

      soundEngine.play("levelUp");
      setState((prev) => {
        const updatedAgent = prev.agent ? { ...prev.agent, skinId } : prev.agent;
        const nextSaved = updatedAgent
          ? Array.from(
              new Map(
                [...(prev.savedProfiles || []), updatedAgent].map((p) => [
                  p.name.toLowerCase(),
                  p,
                ])
              ).values()
            )
          : prev.savedProfiles;

        return {
          ...prev,
          wisdom: Math.max(0, prev.wisdom - meta.costWisdom),
          unlockedSkins: Array.from(new Set([...prev.unlockedSkins, skinId])),
          agent: updatedAgent,
          lastActiveAgent: updatedAgent || prev.lastActiveAgent,
          savedProfiles: nextSaved,
        };
      });
      pushToast(
        `Skin ${meta.rarity} Desbloqueada!`,
        `${meta.name} agora faz parte do seu Arsenal 3D!`,
        meta.badgeEmoji
      );
      return true;
    },
    [
      pushToast,
      state.unlockedSkins,
      state.wisdom,
    ]
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
          pushToast(
            `Medalha Desbloqueada: ${meta.title}`,
            meta.description,
            meta.emoji
          );
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
      setState((prev) => ({
        ...prev,
        wisdom: Math.max(0, prev.wisdom - amount),
      }));
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
        `Nova Missão 3D Criada: ${mission.title}`,
        "Já disponível no Globo 3D e pronta para jogar!",
        "🗺️"
      );
    },
    [pushToast]
  );

  const updateCustomMission = useCallback(
    (mission: Mission) => {
      soundEngine.play("success");
      setState((prev) => ({
        ...prev,
        customMissions: prev.customMissions.map((m) =>
          m.id === mission.id ? mission : m
        ),
      }));
      pushToast(
        `Missão Atualizada: ${mission.title}`,
        "Alterações salvas com sucesso no Mapa Global!",
        "✨"
      );
    },
    [pushToast]
  );

  const deleteCustomMission = useCallback(
    (missionId: string) => {
      soundEngine.play("click");
      setState((prev) => ({
        ...prev,
        customMissions: prev.customMissions.filter((m) => m.id !== missionId),
      }));
      pushToast(
        "Missão Personalizada Removida",
        "O Mapa Global foi atualizado.",
        "🗑️"
      );
    },
    [pushToast]
  );

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
      "Progresso da Turma Reiniciado",
      "Pronto para cadastrar uma nova equipe ou novo campeão!",
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
    updateAgentAppearance,
    isSkinUnlocked,
    unlockAndEquipSkin,
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
    updateCustomMission,
    deleteCustomMission,
    resetStudentProgress,
    switchUser,
    selectProfile,
    deleteProfile,
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
