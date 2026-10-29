"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, BookMarked, Lock, Sparkles, X } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { ACHIEVEMENTS, GIFT_OPTIONS } from "@/data/avatarsAndGifts";
import { HeroPortrait } from "./GamePortrait";
import { PassportStampSvg } from "./StampSvg";
import { CollectibleCard } from "./CollectibleCard";

interface PassportModalProps {
  open: boolean;
  onClose: () => void;
}

export function PassportModal({ open, onClose }: PassportModalProps) {
  const { state, allMissions, level, levelTitle, playSfx } = useGame();
  const [tab, setTab] = useState<"stamps" | "cards" | "medals">("stamps");

  if (!open || !state.agent) return null;

  const gift = GIFT_OPTIONS.find((g) => g.id === state.agent?.giftId);
  const unlockedCards = allMissions.filter(
    (m) => state.missionProgress[m.id]?.perfectCardUnlocked
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-slate-900 shadow-[0_0_60px_rgba(6,182,212,0.2)]"
      >
        {/* Top Diplomatic Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <BookMarked className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="font-mono text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                DOCUMENTO OFICIAL • BASE MISSIONÁRIA IDE
              </div>
              <h2 className="text-lg font-black text-white sm:text-xl">
                Passaporte Missionário Internacional
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Agent ID Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/60 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3.5">
            <HeroPortrait
              avatarId={state.agent.avatarId}
              size={64}
              shape="hex"
              active
            />
            <div>
              <div className="text-base font-black text-white sm:text-lg">
                {state.agent.name}
              </div>
              <div className="text-xs font-bold text-cyan-300">
                Nível {level} • {levelTitle}
              </div>
              {gift && (
                <div className="mt-0.5 text-[11px] text-slate-400">
                  Dom Ativo: <strong className="text-amber-300">{gift.name}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 text-center">
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5">
              <div className="text-[10px] font-bold text-slate-400">XP TOTAL</div>
              <div className="font-mono text-sm font-black text-emerald-400">
                {state.xp}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5">
              <div className="text-[10px] font-bold text-slate-400">MEDALHAS</div>
              <div className="font-mono text-sm font-black text-amber-300">
                {state.unlockedAchievements.length}/{ACHIEVEMENTS.length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5">
              <div className="text-[10px] font-bold text-slate-400">CARDS 100%</div>
              <div className="font-mono text-sm font-black text-cyan-300">
                {unlockedCards.length}/{allMissions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 pt-2.5 sm:px-6">
          {[
            { id: "stamps", label: "🛂 Carimbos de Países" },
            {
              id: "cards",
              label: `✨ Cards 100% (${unlockedCards.length})`,
            },
            {
              id: "medals",
              label: `🏅 Medalhas (${state.unlockedAchievements.length})`,
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playSfx("click");
                setTab(item.id as typeof tab);
              }}
              className={`border-b-2 px-4 py-2.5 text-xs font-black transition sm:text-sm ${
                tab === item.id
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === "stamps" && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {allMissions.map((m) => {
                const rec = state.missionProgress[m.id];
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col items-center justify-between rounded-2xl border p-4 text-center ${
                      rec?.completed
                        ? "border-emerald-500/35 bg-slate-950/80"
                        : "border-dashed border-slate-800 bg-slate-950/30 opacity-60"
                    }`}
                  >
                    {rec?.completed ? (
                      <>
                        <PassportStampSvg
                          missionId={m.id}
                          stampCode={m.stampCode}
                          title={m.country}
                          accentColor={m.accentColor}
                          size={104}
                        />
                        <div className="mt-2 text-xs font-black text-white">
                          {m.title}
                        </div>
                        <div className="mt-0.5 text-[11px] font-bold text-emerald-400">
                          Confiança Máx: {rec.bestTrust}%
                        </div>
                      </>
                    ) : (
                      <div className="flex h-36 flex-col items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-slate-700 text-slate-600">
                          <Lock className="h-6 w-6" />
                        </div>
                        <div className="mt-2 text-xs font-bold text-slate-500">
                          {m.title}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          Aguardando Missão
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "cards" && (
            <div>
              {unlockedCards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-amber-400" />
                  <h3 className="mt-3 text-base font-black text-white">
                    Nenhum Card Lendário Desbloqueado Ainda
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-xs text-slate-400 sm:text-sm">
                    Conclua qualquer missão atingindo{" "}
                    <strong className="text-emerald-400">
                      100% na Ponte de Confiança
                    </strong>{" "}
                    para ganhar o Card Colecionável Holográfico daquele país!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {unlockedCards.map((m) => (
                    <CollectibleCard
                      key={m.id}
                      mission={m}
                      agentName={state.agent?.name}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "medals" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = state.unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`flex items-start gap-3.5 rounded-2xl border p-4 ${
                      unlocked
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-slate-800 bg-slate-950/40 opacity-50"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-2xl">
                      {unlocked ? ach.emoji : "🔒"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white">
                          {ach.title}
                        </span>
                        {unlocked && (
                          <Award className="h-4 w-4 text-amber-400" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
