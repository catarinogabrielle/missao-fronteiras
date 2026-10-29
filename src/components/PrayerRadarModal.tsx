"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Radio, Sparkles, X } from "lucide-react";
import { PRAYER_CARDS } from "@/data/missions";
import { useGame } from "@/context/GameContext";

interface PrayerRadarModalProps {
  open: boolean;
  onClose: () => void;
}

export function PrayerRadarModal({ open, onClose }: PrayerRadarModalProps) {
  const { state, prayForRegion, playSfx } = useGame();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-slate-900 shadow-[0_0_60px_rgba(245,158,11,0.18)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Radio className="h-5 w-5 animate-pulse text-amber-400" />
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase">
                FREQUÊNCIA GLOBAL • INTERCESSÃO MISSIONÁRIA
              </div>
              <h2 className="text-lg font-black text-white sm:text-xl">
                Radar de Intercessão & Cartas de Oração
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Intro Strip */}
        <div className="border-b border-slate-800 bg-amber-500/10 px-5 py-3 text-xs text-amber-100 sm:px-6 sm:text-sm">
          🙏 <strong>A oração vai onde nossos pés ainda não chegaram!</strong>{" "}
          Leia os pedidos reais de cada campo, faça uma oração rápida(sozinho ou
          com sua turma) e ative a carta para ganhar{" "}
          <strong className="text-amber-300">+20 Sabedoria</strong> e{" "}
          <strong className="text-emerald-300">
            +1 Cobertura de Oração extra
          </strong>{" "}
          nos diálogos daquela missão!
        </div>

        {/* Cards List */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {PRAYER_CARDS.map((card) => {
            const activated = state.prayedMissionIds.includes(card.missionId);
            return (
              <div
                key={card.id}
                className={`rounded-2xl border p-4 sm:p-5 ${
                  activated
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-950/80"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold tracking-wider text-amber-400 uppercase">
                      📡 {card.region}
                    </span>
                    <h3 className="mt-0.5 text-base font-black text-white sm:text-lg">
                      {card.title}
                    </h3>
                  </div>

                  {activated ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-black text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Cobertura Ativa na Missão
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        prayForRegion(card.missionId, card.wisdomReward)
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border-b-2 border-amber-700 bg-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-300"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Já Orei • Ativar (+{card.wisdomReward} Sabedoria)
                    </button>
                  )}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {card.churchReport}
                </p>

                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                  <div className="mb-1 text-[11px] font-extrabold text-cyan-300 uppercase">
                    Motivos de Intercessão:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {card.prayerPoints.map((pt, idx) => (
                      <li key={idx}>• {pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
