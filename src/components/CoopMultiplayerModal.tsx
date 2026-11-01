"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  Car,
  Wifi,
  WifiOff,
  Copy,
  Check,
  X,
  Play,
  Award,
  Sparkles,
  RefreshCw,
  Flame,
  Radio,
  Globe2,
  AlertTriangle,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import {
  getGlobalCoopNetwork,
  CoopRole,
  CoopPlayerInfo,
  CoopNetworkMessage,
} from "@/lib/coopNetwork";

export type { CoopRole };

export interface CoopSessionState {
  roomCode: string;
  isHost: boolean;
  myRole: CoopRole;
  connected: boolean;
  partnerName: string | null;
  partnerRole: CoopRole | null;
  partnerAvatarId: string | null;
  cargoHealth: number;
  suppliesDelivered: number;
}

interface CoopMultiplayerModalProps {
  onClose: () => void;
  onStartCoop: (session: CoopSessionState) => void;
}

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRoomCode(): string {
  let res = "";
  for (let i = 0; i < 4; i++) {
    res += ROOM_CODE_CHARS.charAt(
      Math.floor(Math.random() * ROOM_CODE_CHARS.length)
    );
  }
  return `IDE-${res}`;
}

export function CoopMultiplayerModal({
  onClose,
  onStartCoop,
}: CoopMultiplayerModalProps) {
  const { state, playSfx } = useGame();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [roomCode, setRoomCode] = useState(() => generateRoomCode());
  const [inputCode, setInputCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<CoopRole>("driver");
  const [copiedCode, setCopiedCode] = useState(false);

  // Network State
  const [networkStatus, setNetworkStatus] = useState<
    "idle" | "connecting" | "waiting" | "connected" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [partner, setPartner] = useState<CoopPlayerInfo | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);

  const coopNetwork = getGlobalCoopNetwork();

  // Setup callbacks
  useEffect(() => {
    coopNetwork.setCallbacks({
      onStatusChange: (status, message) => {
        setNetworkStatus(status);
        if (message) setStatusMessage(message);
        if (status === "connected") {
          playSfx("success");
        }
      },
      onPartnerJoined: (partnerInfo) => {
        setPartner(partnerInfo);
        playSfx("levelUp");
      },
      onPartnerLeft: () => {
        setPartner(null);
        setPingMs(null);
        playSfx("neutral");
      },
      onPingUpdate: (ping) => {
        setPingMs(ping);
      },
      onMessage: (msg: CoopNetworkMessage) => {
        if (msg.type === "START_MISSION") {
          playSfx("levelUp");
          handleLaunchGame(msg.missionId);
        }
      },
    });

    return () => {
      // Do not destroy if transitioning into game!
    };
  }, [playSfx]);

  const handleCopyCode = () => {
    playSfx("click");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCreateRoom = async () => {
    playSfx("click");
    try {
      await coopNetwork.createRoom(roomCode, {
        name: state.agent?.name || "Líder da Missão",
        role: selectedRole,
        avatarId: state.agent?.avatarId || "lucas",
      });
    } catch {
      // handled by callbacks
    }
  };

  const handleJoinRoom = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    playSfx("click");
    try {
      await coopNetwork.joinRoom(code, {
        name: state.agent?.name || "Agente Parceiro",
        role: selectedRole,
        avatarId: state.agent?.avatarId || "sofia",
      });
    } catch {
      // handled by callbacks
    }
  };

  const handleSimulateSoloPartner = () => {
    playSfx("levelUp");
    const simulatedPartner: CoopPlayerInfo = {
      name: selectedRole === "driver" ? "Sofia (Guardiã)" : "Lucas (Piloto)",
      role: selectedRole === "driver" ? "guardian" : "driver",
      avatarId: selectedRole === "driver" ? "sofia" : "lucas",
    };
    setPartner(simulatedPartner);
    setNetworkStatus("connected");
    setPingMs(18);
    setStatusMessage("Parceiro virtual conectado para teste!");
  };

  const handleLaunchGame = (missionId: string = "amazonia") => {
    playSfx("levelUp");
    const activeCode = tab === "create" ? roomCode : inputCode.toUpperCase();

    // If host, announce to guest
    if (tab === "create") {
      coopNetwork.sendMessage({
        type: "START_MISSION",
        missionId,
      });
    }

    onStartCoop({
      roomCode: activeCode,
      isHost: tab === "create",
      myRole: selectedRole,
      connected: true,
      partnerName: partner?.name || "Parceiro",
      partnerRole:
        partner?.role || (selectedRole === "driver" ? "guardian" : "driver"),
      partnerAvatarId: partner?.avatarId || "sofia",
      cargoHealth: 100,
      suppliesDelivered: 0,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-2xl flex-col rounded-3xl border border-cyan-400/50 bg-gradient-to-b from-slate-950 via-[#071328] to-slate-950 p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/25 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/60 bg-cyan-500/20 text-cyan-300 shadow-md">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-black tracking-widest text-cyan-300 uppercase">
                  MODO COOPERATIVO WEB (2 JOGADORES)
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.2 text-[8px] font-black text-emerald-300 uppercase">
                  WEBRTC P2P ONLINE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                Expedição Missionária em Dupla
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-rose-400 hover:bg-rose-500/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Toggle: Criar Sala vs Entrar em Sala */}
        <div className="mt-4 flex rounded-2xl border border-cyan-500/25 bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setTab("create");
              setNetworkStatus("idle");
              setPartner(null);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-black uppercase transition cursor-pointer ${
              tab === "create"
                ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🛡️ Criar Nova Sala (Host)
          </button>
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setTab("join");
              setNetworkStatus("idle");
              setPartner(null);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-black uppercase transition cursor-pointer ${
              tab === "join"
                ? "bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔑 Entrar com Código
          </button>
        </div>

        {/* Role Selection: Piloto vs Guardião */}
        <div className="mt-4">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
            Escolha sua Função na Dupla:
          </label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Piloto */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setSelectedRole("driver");
              }}
              className={`flex flex-col rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                selectedRole === "driver"
                  ? "border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/25 text-amber-300">
                    <Car className="h-4 w-4" />
                  </div>
                  <span className="font-black text-sm text-white uppercase">
                    Piloto da Esperança
                  </span>
                </div>
                {selectedRole === "driver" && (
                  <span className="rounded-full bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5">
                    ESCOLHIDO
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-300 leading-snug">
                Conduz o veículo de suprimentos, manobra pelas avenidas, atropela
                sombras e recolhe caixas de mantimentos pelo trajeto do GPS.
              </p>
            </button>

            {/* Guardião */}
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setSelectedRole("guardian");
              }}
              className={`flex flex-col rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                selectedRole === "guardian"
                  ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/25 text-cyan-300">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="font-black text-sm text-white uppercase">
                    Guardião da Luz
                  </span>
                </div>
                {selectedRole === "guardian" && (
                  <span className="rounded-full bg-cyan-400 text-slate-950 font-black text-[9px] px-2 py-0.5">
                    ESCOLHIDO
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-300 leading-snug">
                Posiciona-se na caçamba ou ao redor do transporte, projeta ondas de
                fé, repele sombras que atacam a carga e repara a integridade da van.
              </p>
            </button>
          </div>
        </div>

        {/* Room Code Area */}
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          {tab === "create" ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-cyan-300">
                  Código da Sua Sala (Envie para seu amigo):
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-2xl font-black text-amber-300 tracking-wider">
                    {roomCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Copiar código"
                  >
                    {copiedCode ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {networkStatus === "idle" ? (
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400 bg-cyan-500/25 px-4 py-2.5 text-xs font-black text-cyan-200 uppercase hover:bg-cyan-500/35 transition cursor-pointer shadow-lg active:scale-95"
                >
                  <Radio className="h-4 w-4" />
                  <span>Abrir Sala para Conexão</span>
                </button>
              ) : networkStatus === "connecting" ? (
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                  <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>Conectando à rede WebRTC...</span>
                </div>
              ) : networkStatus === "waiting" ? (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                  <span>Aguardando segundo jogador...</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-mono font-black uppercase text-cyan-300">
                Digite o Código da Sala do Host (ex: IDE-UYJY):
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="IDE-XXXX"
                  maxLength={10}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-base font-black text-white uppercase placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!inputCode.trim() || networkStatus === "connecting"}
                  onClick={handleJoinRoom}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-500/25 px-4 py-2 text-xs font-black text-amber-200 uppercase hover:bg-amber-500/35 disabled:opacity-40 transition cursor-pointer"
                >
                  {networkStatus === "connecting" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wifi className="h-4 w-4" />
                  )}
                  <span>Conectar</span>
                </button>
              </div>
            </div>
          )}

          {/* Real-time Status Message */}
          {statusMessage && (
            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-950/60 px-2.5 py-1.5 text-[11px] font-mono text-slate-300">
              <Globe2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Partner Connection Status Bar */}
        {partner && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center justify-between rounded-2xl border border-emerald-400/50 bg-emerald-500/15 p-3.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/25 text-emerald-300 font-black">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-300">
                    🟢 WebRTC Online P2P
                  </span>
                  {pingMs !== null && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[8px] font-mono font-black text-emerald-300">
                      {pingMs}ms
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {partner.name} •{" "}
                  {partner.role === "driver"
                    ? "🚗 Piloto da Esperança"
                    : "🛡️ Guardião da Luz"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchGame("amazonia")}
              className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 px-4 py-2.5 text-xs font-black text-slate-950 uppercase shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:brightness-110 transition cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Iniciar Missão Co-op</span>
            </button>
          </motion.div>
        )}

        {/* Solo Partner Simulation for Testing */}
        {!partner && networkStatus === "waiting" && (
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-xl border border-slate-800">
            <span>Quer testar a mecânica em dupla sozinho agora?</span>
            <button
              type="button"
              onClick={handleSimulateSoloPartner}
              className="text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
            >
              Simular Parceiro IA
            </button>
          </div>
        )}

        {/* Co-op Rules Briefing */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            💡 <strong>Dica de Cooperação:</strong> O Piloto foca na rota do GPS
            enquanto o Guardião destrói as sombras para manter a carga em 100%.
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
