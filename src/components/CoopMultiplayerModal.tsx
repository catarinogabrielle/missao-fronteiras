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
} from "lucide-react";
import { useGame } from "@/context/GameContext";

export type CoopRole = "driver" | "guardian";

export interface CoopSessionState {
  roomCode: string;
  isHost: boolean;
  myRole: CoopRole;
  connected: boolean;
  partnerName: string | null;
  partnerRole: CoopRole | null;
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

  // Connection Simulation & Local BroadcastChannel for 2 tabs
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [partnerFound, setPartnerFound] = useState<{
    name: string;
    role: CoopRole;
  } | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel("missao_fronteiras_coop_room");
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      // When another player joins with this room code
      if (data.type === "JOIN_ROOM" && data.roomCode === roomCode) {
        playSfx("success");
        setPartnerFound({
          name: data.playerName,
          role: data.role === "driver" ? "guardian" : "driver",
        });
        // Respond back to partner
        channel.postMessage({
          type: "ROOM_ACCEPTED",
          roomCode,
          hostName: state.agent?.name || "Líder da Missão",
          hostRole: selectedRole,
        });
      }

      if (data.type === "ROOM_ACCEPTED" && data.roomCode === inputCode.trim().toUpperCase()) {
        playSfx("success");
        setPartnerFound({
          name: data.hostName,
          role: data.hostRole,
        });
      }
    };

    return () => {
      channel.close();
    };
  }, [roomCode, inputCode, selectedRole, state.agent?.name, playSfx]);

  const handleCopyCode = () => {
    playSfx("click");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCreateRoom = () => {
    playSfx("click");
    setWaitingForPartner(true);
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    playSfx("click");
    setWaitingForPartner(true);

    // Broadcast join request to any local host
    channelRef.current?.postMessage({
      type: "JOIN_ROOM",
      roomCode: inputCode.trim().toUpperCase(),
      playerName: state.agent?.name || "Agente Parceiro",
      role: selectedRole,
    });

    // Simulated network match if testing solo
    setTimeout(() => {
      if (!partnerFound) {
        setPartnerFound({
          name: selectedRole === "driver" ? "Sofia (Guardiã)" : "Lucas (Piloto)",
          role: selectedRole === "driver" ? "guardian" : "driver",
        });
        playSfx("levelUp");
      }
    }, 1800);
  };

  const handleLaunchCoopGame = () => {
    playSfx("levelUp");
    const activeCode = tab === "create" ? roomCode : inputCode.toUpperCase();
    onStartCoop({
      roomCode: activeCode,
      isHost: tab === "create",
      myRole: selectedRole,
      connected: true,
      partnerName: partnerFound?.name || "Parceiro",
      partnerRole: partnerFound?.role || (selectedRole === "driver" ? "guardian" : "driver"),
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
                  FASE 5 • CONECTIVIDADE
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
              setWaitingForPartner(false);
              setPartnerFound(null);
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
              setWaitingForPartner(false);
              setPartnerFound(null);
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
                  Código da Sua Sala:
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

              {!waitingForPartner ? (
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400 bg-cyan-500/25 px-4 py-2 text-xs font-black text-cyan-200 uppercase hover:bg-cyan-500/35 transition cursor-pointer"
                >
                  <Radio className="h-4 w-4" />
                  <span>Abrir Sala para Conexão</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                  <span>Aguardando segundo jogador...</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-mono font-black uppercase text-cyan-300">
                Digite o Código da Sala (ex: IDE-A1B2):
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="IDE-XXXX"
                  maxLength={8}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-base font-black text-white uppercase placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!inputCode.trim() || waitingForPartner}
                  onClick={handleJoinRoom}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-500/25 px-4 py-2 text-xs font-black text-amber-200 uppercase hover:bg-amber-500/35 disabled:opacity-40 transition cursor-pointer"
                >
                  <Wifi className="h-4 w-4" />
                  <span>Conectar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Partner Connection Status Bar */}
        {partnerFound && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center justify-between rounded-2xl border border-emerald-400/50 bg-emerald-500/15 p-3.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/25 text-emerald-300">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-emerald-300">
                  Jogador 2 Conectado!
                </span>
                <div className="text-xs font-black text-white">
                  {partnerFound.name} •{" "}
                  {partnerFound.role === "driver"
                    ? "🚗 Piloto da Esperança"
                    : "🛡️ Guardião da Luz"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchCoopGame}
              className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 px-4 py-2 text-xs font-black text-slate-950 uppercase shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:brightness-110 transition cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Iniciar Missão Co-op</span>
            </button>
          </motion.div>
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
