"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Compass,
  School,
  X,
} from "lucide-react";
import {
  ClickableVerse,
  CULTURAL_GLOSSARY,
  GOSPEL_FOUR_STEPS,
} from "@/data/gospel";
import { useGame } from "@/context/GameContext";

interface PocketBibleModalProps {
  open: boolean;
  initialTab?: "gospel" | "dictionary" | "school";
  onClose: () => void;
}

export function PocketBibleModal({
  open,
  initialTab = "gospel",
  onClose,
}: PocketBibleModalProps) {
  const {
    state,
    allMissions,
    markGospelStepStudied,
    acceptSchoolChallenge,
    playSfx,
  } = useGame();
  const [tab, setTab] = useState<"gospel" | "dictionary" | "school">(
    initialTab
  );
  const [selectedVerse, setSelectedVerse] = useState<ClickableVerse | null>(
    GOSPEL_FOUR_STEPS[0].verses[0]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">
                EQUIPAMENTO DA MOCHILA • MANUAL DE CAMPO
              </div>
              <h2 className="text-lg font-black text-white sm:text-xl">
                Bíblia de Bolso & Guia Transcultural
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

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 pt-2 sm:px-6">
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setTab("gospel");
            }}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-black sm:text-sm ${
              tab === "gospel"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />O Evangelho em 4 Passos
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setTab("dictionary");
            }}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-black sm:text-sm ${
              tab === "dictionary"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="h-4 w-4" />
            Dicionário Cultural
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setTab("school");
            }}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-black sm:text-sm ${
              tab === "school"
                ? "border-violet-400 text-violet-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <School className="h-4 w-4" />
            Missão na Escola
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === "gospel" && (
            <div className="space-y-4">
              {/* Highlighted Clickable Verse Viewer (scrolls naturally with content, no sticky overlap) */}
              {selectedVerse && (
                <div className="rounded-2xl border-2 border-emerald-400/50 bg-slate-950 p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-emerald-400 uppercase">
                      📖 Versículo Selecionado • {selectedVerse.ref}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Toque em qualquer referência abaixo para ler
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed font-semibold text-white italic sm:text-base">
                    &ldquo;{selectedVerse.text}&rdquo;
                  </p>
                </div>
              )}

              {/* 4 Steps */}
              <div className="space-y-4">
                {GOSPEL_FOUR_STEPS.map((item) => {
                  const studied = state.studiedGospelSteps.includes(item.step);
                  return (
                    <div
                      key={item.step}
                      className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-extrabold ${item.accentClass}`}
                          >
                            {item.emoji} {item.subtitle}
                          </span>
                          <h3 className="mt-1.5 text-lg font-black text-white">
                            {item.title}
                          </h3>
                        </div>

                        {studied ? (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/20 px-2.5 py-1 text-xs font-black text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Passo Estudado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markGospelStepStudied(item.step)}
                            className="rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-300 transition hover:bg-amber-500/25"
                          >
                            ✓ Marcar como Aprendido (+10 Sabedoria)
                          </button>
                        )}
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {item.summary}
                      </p>

                      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-cyan-200">
                        💬 {item.recessTip}
                      </div>

                      {/* Clickable Verse Chips */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">
                          Versículos-chave:
                        </span>
                        {item.verses.map((v) => {
                          const active = selectedVerse?.ref === v.ref;
                          return (
                            <button
                              key={v.ref}
                              type="button"
                              onClick={() => {
                                playSfx("click");
                                setSelectedVerse(v);
                              }}
                              className={`cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-xs font-bold transition ${
                                active
                                  ? "border-emerald-400 bg-emerald-500/25 text-emerald-200"
                                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-400/60"
                              }`}
                            >
                              📖 {v.ref}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Verse Inline for this Step */}
                      {selectedVerse &&
                        item.verses.some((v) => v.ref === selectedVerse.ref) && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 rounded-xl border border-emerald-400/40 bg-slate-900/90 p-3 shadow-inner"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-black text-emerald-300 uppercase">
                                📖 {selectedVerse.ref}
                              </span>
                              <span className="text-[10px] text-slate-400 italic">
                                Leitura Bíblica
                              </span>
                            </div>
                            <p className="mt-1 text-xs sm:text-sm font-semibold text-white italic leading-relaxed">
                              &ldquo;{selectedVerse.text}&rdquo;
                            </p>
                          </motion.div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "dictionary" && (
            <div className="grid gap-3.5 sm:grid-cols-2">
              {CULTURAL_GLOSSARY.map((entry) => (
                <div
                  key={entry.term}
                  className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4"
                >
                  <span className="text-[10px] font-extrabold tracking-wider text-cyan-400 uppercase">
                    {entry.category}
                  </span>
                  <h4 className="mt-0.5 text-base font-black text-white">
                    {entry.term}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {entry.meaning}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "school" && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-300 sm:text-sm">
                Sua escola é o seu primeiro campo missionário (&ldquo;Jerusalém&rdquo;
                em Atos 1:8)! Veja os desafios práticos de cada missão concluída:
              </p>

              {allMissions.map((m) => {
                const rec = state.missionProgress[m.id];
                return (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-black text-white">
                        {m.emoji} {m.schoolChallenge.title}
                      </span>
                      {rec?.schoolChallengeAccepted ? (
                        <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-black text-emerald-300">
                          ✓ Em Prática nesta Semana
                        </span>
                      ) : rec?.completed ? (
                        <button
                          type="button"
                          onClick={() => acceptSchoolChallenge(m.id)}
                          className="rounded-lg bg-violet-500 px-3 py-1 text-xs font-black text-white hover:bg-violet-400"
                        >
                          Aceitar Desafio (+25 XP)
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Conclua {m.title} para liberar
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                      {m.schoolChallenge.action}
                    </p>
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
