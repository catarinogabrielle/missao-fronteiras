"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  RotateCcw,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { TribeQuizQuestion, TRIBES_QUIZ_QUESTIONS } from "@/data/quiz";
import { useGame } from "@/context/GameContext";
import { ConfettiCanvas } from "./ConfettiCanvas";

interface TribesQuizModalProps {
  open: boolean;
  onClose: () => void;
}

interface TribeTeam {
  id: number;
  name: string;
  emoji: string;
  colorClass: string;
  score: number;
  correctCount: number;
}

const DEFAULT_TRIBES: Omit<TribeTeam, "score" | "correctCount">[] = [
  {
    id: 0,
    name: "Tribo Antioquia",
    emoji: "🔥",
    colorClass: "border-emerald-400 bg-emerald-500/15 text-emerald-300",
  },
  {
    id: 1,
    name: "Tribo Bereia",
    emoji: "⚡",
    colorClass: "border-cyan-400 bg-cyan-500/15 text-cyan-300",
  },
  {
    id: 2,
    name: "Tribo Galileia",
    emoji: "🌊",
    colorClass: "border-amber-400 bg-amber-500/15 text-amber-300",
  },
  {
    id: 3,
    name: "Tribo Éfeso",
    emoji: "🛡️",
    colorClass: "border-violet-400 bg-violet-500/15 text-violet-300",
  },
];

function pickShuffledQuestions(count: number): TribeQuizQuestion[] {
  const arr = [...TRIBES_QUIZ_QUESTIONS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export function TribesQuizModal({ open, onClose }: TribesQuizModalProps) {
  const { playSfx, addBonusXp } = useGame();

  const [phase, setPhase] = useState<"setup" | "playing" | "podium">("setup");
  const [teamCount, setTeamCount] = useState<2 | 3 | 4>(2);
  const [teamNames, setTeamNames] = useState<string[]>(
    DEFAULT_TRIBES.map((t) => t.name)
  );
  const [totalQuestions, setTotalQuestions] = useState<number>(8);

  const [teams, setTeams] = useState<TribeTeam[]>([]);
  const [questions, setQuestions] = useState<TribeQuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const currentQuestion = questions[qIndex];
  const activeTeamIndex = teams.length > 0 ? qIndex % teams.length : 0;
  const activeTeam = teams[activeTeamIndex];

  useEffect(() => {
    if (!open || phase !== "playing" || selectedAnswer !== null || timedOut) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimedOut(true);
          playSfx("error");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open, phase, selectedAnswer, timedOut, playSfx]);

  if (!open) return null;

  const handleStartQuiz = () => {
    playSfx("levelUp");
    const activeTeams: TribeTeam[] = DEFAULT_TRIBES.slice(0, teamCount).map(
      (base, idx) => ({
        ...base,
        name: teamNames[idx]?.trim() || base.name,
        score: 0,
        correctCount: 0,
      })
    );
    setTeams(activeTeams);
    setQuestions(pickShuffledQuestions(totalQuestions));
    setQIndex(0);
    setSecondsLeft(20);
    setSelectedAnswer(null);
    setTimedOut(false);
    setPhase("playing");
  };

  const handleAnswer = (optIdx: number) => {
    if (selectedAnswer !== null || timedOut || !currentQuestion) return;
    setSelectedAnswer(optIdx);

    const isCorrect = optIdx === currentQuestion.correctIndex;
    if (isCorrect) {
      playSfx("success");
      const pts = 100 + secondsLeft * 5;
      setTeams((prev) =>
        prev.map((t, idx) =>
          idx === activeTeamIndex
            ? {
                ...t,
                score: t.score + pts,
                correctCount: t.correctCount + 1,
              }
            : t
        )
      );
    } else {
      playSfx("error");
    }
  };

  const handleNextQuestion = () => {
    playSfx("click");
    if (qIndex + 1 < questions.length) {
      setQIndex((prev) => prev + 1);
      setSecondsLeft(20);
      setSelectedAnswer(null);
      setTimedOut(false);
    } else {
      addBonusXp(80, "Desafio de Tribos concluído com a turma!");
      setPhase("podium");
    }
  };

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
      <ConfettiCanvas active={phase === "podium"} durationMs={5000} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-2 border-violet-500/50 bg-slate-900 shadow-[0_0_60px_rgba(168,85,247,0.25)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Swords className="h-5 w-5 text-amber-400" />
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-violet-300 uppercase">
                MODO IGREJA & PEQUENOS GRUPOS
              </div>
              <h2 className="text-lg font-black text-white sm:text-xl">
                Desafio de Tribos • Quiz Relâmpago de Missões
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

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* SETUP PHASE */}
          {phase === "setup" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 text-xs text-violet-100 sm:text-sm">
                🎉 Divida a sala de juniores ou adolescentes em até{" "}
                <strong>4 Tribos</strong>! Cada rodada uma equipe responde
                contra o relógio sobre Paulo, Barnabé, Jonas, Pedro, Grande
                Comissão e história das missões!
              </div>

              {/* Number of Tribes */}
              <div>
                <label className="mb-2 block text-sm font-black text-white">
                  1. Quantas Equipes / Tribos vão jogar?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([2, 3, 4] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setTeamCount(num);
                        setTotalQuestions(num === 3 ? 12 : num * 4);
                      }}
                      className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-black transition ${
                        teamCount === num
                          ? "border-amber-400 bg-amber-500/20 text-amber-200"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      {num} Tribos
                    </button>
                  ))}
                </div>
              </div>

              {/* Tribe Names */}
              <div>
                <label className="mb-2 block text-sm font-black text-white">
                  2. Nomes das Tribos
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DEFAULT_TRIBES.slice(0, teamCount).map((t, idx) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2.5"
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <input
                        type="text"
                        maxLength={22}
                        value={teamNames[idx]}
                        onChange={(e) => {
                          const next = [...teamNames];
                          next[idx] = e.target.value;
                          setTeamNames(next);
                        }}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="mb-2 block text-sm font-black text-white">
                  3. Quantidade de Perguntas na Partida
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[8, 12, 16].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setTotalQuestions(cnt);
                      }}
                      className={`rounded-2xl border-2 py-2.5 text-sm font-black transition ${
                        totalQuestions === cnt
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {cnt} Perguntas
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartQuiz}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-4 text-base font-black text-slate-950 transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-0 sm:text-lg"
              >
                COMEÇAR DESAFIO DE TRIBOS!
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* PLAYING PHASE */}
          {phase === "playing" && currentQuestion && activeTeam && (
            <div>
              {/* Live Scoreboard */}
              <div
                className={`mb-5 grid gap-2 ${
                  teams.length === 2
                    ? "grid-cols-2"
                    : teams.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-4"
                }`}
              >
                {teams.map((t, idx) => {
                  const isTurn = idx === activeTeamIndex;
                  return (
                    <div
                      key={t.id}
                      className={`rounded-2xl border-2 p-2.5 text-center transition ${
                        isTurn
                          ? `${t.colorClass} scale-[1.02] shadow-lg`
                          : "border-slate-800 bg-slate-950/60 text-slate-400"
                      }`}
                    >
                      <div className="truncate text-xs font-black">
                        {t.emoji} {t.name}
                      </div>
                      <div className="mt-0.5 font-mono text-lg font-black text-white">
                        {t.score} pts
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Turn Banner + Timer */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-xl border px-3 py-1 text-xs font-black uppercase ${activeTeam.colorClass}`}
                >
                  {activeTeam.emoji} Vez de: {activeTeam.name} • Pergunta{" "}
                  {qIndex + 1}/{questions.length}
                </span>

                <div
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-mono text-sm font-black ${
                    secondsLeft <= 5
                      ? "animate-pulse border-rose-500 bg-rose-500/20 text-rose-300"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  {secondsLeft}s
                </div>
              </div>

              {/* Question Card */}
              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="text-[11px] font-extrabold tracking-wider text-cyan-400 uppercase">
                  {currentQuestion.category}
                </div>
                <h3 className="mt-1 text-base leading-relaxed font-black text-white sm:text-xl">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* 4 Options */}
              <div className="grid gap-2.5">
                {currentQuestion.options.map((optText, idx) => {
                  const revealed = selectedAnswer !== null || timedOut;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const isSelected = idx === selectedAnswer;

                  let style =
                    "border-slate-700 bg-slate-950/80 hover:border-cyan-400 text-slate-100";
                  if (revealed) {
                    if (isCorrect) {
                      style =
                        "border-emerald-400 bg-emerald-500/20 text-emerald-100";
                    } else if (isSelected) {
                      style = "border-rose-500 bg-rose-500/20 text-rose-100";
                    } else {
                      style =
                        "border-slate-800 bg-slate-950/40 opacity-50 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={revealed}
                      onClick={() => handleAnswer(idx)}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left text-sm font-bold transition sm:text-base ${style}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs font-black text-cyan-300">
                        {["A", "B", "C", "D"][idx]}
                      </span>
                      <span>{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {(selectedAnswer !== null || timedOut) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-4"
                >
                  <div className="text-xs font-black text-white sm:text-sm">
                    {timedOut
                      ? "⏰ Tempo Esgotado!"
                      : selectedAnswer === currentQuestion.correctIndex
                        ? `✅ Resposta Certa para ${activeTeam.name}!`
                        : "❌ Não foi dessa vez!"}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                    {currentQuestion.explanation}
                  </p>
                  <div className="mt-1 font-mono text-xs font-bold text-emerald-300">
                    📖 {currentQuestion.verseRef}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-2.5 text-sm font-black text-slate-950 hover:bg-emerald-400"
                  >
                    {qIndex + 1 < questions.length
                      ? "PRÓXIMA RODADA"
                      : "VER PÓDIO FINAL DAS TRIBOS"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* PODIUM PHASE */}
          {phase === "podium" && (
            <div className="text-center">
              <Trophy className="mx-auto h-14 w-14 text-amber-400" />
              <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Placar Final das Tribos!
              </h3>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                Todas as equipes somaram <strong>+80 XP</strong> para a Base
                Missionária Ide da igreja!
              </p>

              <div className="my-6 space-y-3 text-left">
                {sortedTeams.map((t, rank) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between rounded-2xl border-2 p-4 ${
                      rank === 0
                        ? "border-amber-400 bg-amber-500/15"
                        : "border-slate-800 bg-slate-950/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {rank === 0
                          ? "🥇"
                          : rank === 1
                            ? "🥈"
                            : rank === 2
                              ? "🥉"
                              : "🏅"}
                      </span>
                      <div>
                        <div className="text-base font-black text-white">
                          {t.emoji} {t.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {t.correctCount} acertos
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-xl font-black text-emerald-400">
                      {t.score} pts
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setPhase("setup");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 py-3.5 text-sm font-black text-white hover:bg-slate-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Nova Partida
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    onClose();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 text-sm font-black text-slate-950 hover:bg-emerald-400"
                >
                  Voltar à Base Ide
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
