"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Globe2,
  BookOpen,
  Check,
  Copy,
} from "lucide-react";
import {
  MISSION_LANGUAGES,
  getMissionLanguage,
  LocalPhrase,
} from "@/data/missionLanguages";
import { useGame } from "@/context/GameContext";

interface LocalLanguageModalProps {
  initialMissionId?: string;
  onClose: () => void;
}

export function LocalLanguageModal({
  initialMissionId = "amazonia",
  onClose,
}: LocalLanguageModalProps) {
  const { playSfx, grantFieldLoot } = useGame();
  const [selectedMissionId, setSelectedMissionId] = useState(initialMissionId);
  const [activeTab, setActiveTab] = useState<"phrases" | "quiz">("phrases");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [speakingPhraseId, setSpeakingPhraseId] = useState<string | null>(null);
  const [copiedPhraseId, setCopiedPhraseId] = useState<string | null>(null);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const langData = getMissionLanguage(selectedMissionId);

  // All 8 available mission keys for quick switching
  const missionKeys = [
    { id: "amazonia", label: "Amazônia", flag: "🛶" },
    { id: "janela1040", label: "Janela 10/40", flag: "🕌" },
    { id: "toquio", label: "Tóquio", flag: "⛩️" },
    { id: "savana", label: "Savana", flag: "🌾" },
    { id: "sertao", label: "Sertão", flag: "🌵" },
    { id: "andes", label: "Andes", flag: "🏔️" },
    { id: "himalaia", label: "Himalaia", flag: "❄️" },
    { id: "refugio", label: "Refúgio", flag: "🕊️" },
  ];

  const handleSpeak = (phrase: LocalPhrase) => {
    if (typeof window === "undefined") return;

    playSfx("click");

    if (!("speechSynthesis" in window)) {
      playSfx("success");
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = phrase.script || phrase.original;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langData.speechLocale;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingPhraseId(phrase.id);
    };
    utterance.onend = () => {
      setSpeakingPhraseId(null);
    };
    utterance.onerror = () => {
      setSpeakingPhraseId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (phrase: LocalPhrase) => {
    playSfx("click");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${phrase.original} (${phrase.phonetic}) - "${phrase.meaning}"`
      );
      setCopiedPhraseId(phrase.id);
      setTimeout(() => setCopiedPhraseId(null), 2000);
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (userAnswers[qIndex] !== undefined) return; // Locked once answered
    playSfx("click");
    setUserAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));

    const isCorrect = langData.quiz[qIndex]?.correctIndex === optionIndex;
    if (isCorrect) {
      playSfx("success");
    } else {
      playSfx("neutral");
    }
  };

  const handleNextQuizQuestion = () => {
    playSfx("click");
    if (currentQuizIndex < langData.quiz.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      const totalCorrect = langData.quiz.reduce((acc, q, idx) => {
        return acc + (userAnswers[idx] === q.correctIndex ? 1 : 0);
      }, 0);

      if (totalCorrect === langData.quiz.length && !rewardClaimed) {
        playSfx("levelUp");
        grantFieldLoot(100, 15);
        setRewardClaimed(true);
      }
    }
  };

  const handleResetQuiz = () => {
    playSfx("click");
    setCurrentQuizIndex(0);
    setUserAnswers({});
    setQuizFinished(false);
  };

  const filteredPhrases =
    categoryFilter === "all"
      ? langData.phrases
      : langData.phrases.filter((p) => p.category === categoryFilter);

  const totalCorrect = langData.quiz.reduce((acc, q, idx) => {
    return acc + (userAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[92vh] max-h-[720px] w-full max-w-4xl flex-col rounded-3xl border border-amber-400/40 bg-gradient-to-b from-slate-950/95 via-[#071324]/95 to-slate-950/98 p-3 sm:p-5 shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-xl overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-cyan-500/25 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-500/20 text-2xl sm:text-3xl shadow-md">
              {langData.flagEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] sm:text-[10px] font-black tracking-widest text-amber-300 uppercase">
                  MODO TRADUÇÃO & IDIOMAS LOCAIS
                </span>
                <span className="rounded-full bg-cyan-500/20 border border-cyan-400/30 px-2 py-0.2 text-[8.5px] font-black text-cyan-300">
                  {langData.speakerCount.split(" ")[0]} FALANTES
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wide">
                {langData.languageName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            title="Fechar Modal"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-slate-300 transition hover:border-rose-400 hover:bg-rose-500/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 8-Mission Selector Horizontal Pill Strip */}
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
          {missionKeys.map((m) => {
            const isSelected =
              selectedMissionId === m.id ||
              (m.id === "savana" && selectedMissionId === "mocambique") ||
              (m.id === "refugio" && selectedMissionId === "europa");
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  playSfx("click");
                  setSelectedMissionId(m.id);
                  handleResetQuiz();
                  setRewardClaimed(false);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-black transition cursor-pointer ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                <span>{m.flag}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Toggle: Dicionário vs Quiz Cultural */}
        <div className="flex shrink-0 items-center justify-between gap-2 rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setActiveTab("phrases");
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                activeTab === "phrases"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Frases & Termos de Fé ({langData.phrases.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setActiveTab("quiz");
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>Desafio Quiz (+15 💎)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono pr-2">
            <span>{langData.nativeName}</span>
          </div>
        </div>

        {/* Region Lore Summary Banner */}
        <div className="my-2 shrink-0 rounded-2xl border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-[11px] text-slate-300">
          <span className="font-bold text-amber-300">Contexto Cultural: </span>
          {langData.regionSummary}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {activeTab === "phrases" && (
            <div className="space-y-2.5">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
                {[
                  { id: "all", label: "Todas as Frases" },
                  { id: "greeting", label: "👋 Saudações" },
                  { id: "faith", label: "✝️ Fé & Verdade" },
                  { id: "hope", label: "🕊️ Esperança & Paz" },
                  { id: "gratitude", label: "🙏 Gratidão" },
                  { id: "scripture", label: "📖 Escrituras" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setCategoryFilter(cat.id);
                    }}
                    className={`rounded-lg px-2.5 py-1 transition cursor-pointer shrink-0 ${
                      categoryFilter === cat.id
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                        : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Phrase Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredPhrases.map((phrase) => {
                  const isSpeaking = speakingPhraseId === phrase.id;
                  const isCopied = copiedPhraseId === phrase.id;

                  return (
                    <div
                      key={phrase.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-cyan-500/25 bg-slate-900/70 p-3.5 shadow transition hover:border-cyan-400/60 hover:bg-slate-900/90"
                    >
                      <div>
                        {/* Native Script / Original */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {phrase.script && (
                              <div className="font-serif text-lg text-cyan-200 leading-tight">
                                {phrase.script}
                              </div>
                            )}
                            <div className="text-base font-black text-amber-200 tracking-wide">
                              {phrase.original}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Pronunciation Audio Button */}
                            <button
                              type="button"
                              onClick={() => handleSpeak(phrase)}
                              title="Ouvir pronúncia na língua nativa"
                              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition cursor-pointer ${
                                isSpeaking
                                  ? "border-emerald-400 bg-emerald-500/30 text-emerald-200 animate-pulse"
                                  : "border-slate-700 bg-slate-800 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/20"
                              }`}
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>

                            {/* Copy Button */}
                            <button
                              type="button"
                              onClick={() => handleCopy(phrase)}
                              title="Copiar texto e pronúncia"
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:text-white transition cursor-pointer"
                            >
                              {isCopied ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Phonetics Guide */}
                        <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-950/70 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                          <span>🗣️ Pronúncia:</span>
                          <span className="font-bold">{phrase.phonetic}</span>
                        </div>

                        {/* Meaning / Translation */}
                        <div className="mt-2 text-xs font-bold text-white">
                          "{phrase.meaning}"
                        </div>

                        {/* Faith Context */}
                        <div className="mt-1 text-[11px] text-slate-300/90 leading-relaxed border-t border-slate-800 pt-1.5">
                          <span className="text-amber-400 font-bold">
                            💡 Conexão Missionária:{" "}
                          </span>
                          {phrase.faithContext}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="flex h-full flex-col justify-between p-1 sm:p-2">
              {!quizFinished ? (
                <div>
                  {/* Quiz Step Header */}
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Pergunta {currentQuizIndex + 1} de {langData.quiz.length}
                    </span>
                    <span className="font-mono text-xs text-cyan-300">
                      Recompensa: 15 💎 + 100 XP
                    </span>
                  </div>

                  {/* Current Question */}
                  <div className="my-4">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {langData.quiz[currentQuizIndex]?.question}
                    </h3>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {langData.quiz[currentQuizIndex]?.options.map((opt, oIdx) => {
                      const selected = userAnswers[currentQuizIndex] === oIdx;
                      const answered = userAnswers[currentQuizIndex] !== undefined;
                      const isCorrect =
                        langData.quiz[currentQuizIndex]?.correctIndex === oIdx;

                      let btnStyle =
                        "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-400";
                      if (answered) {
                        if (isCorrect) {
                          btnStyle =
                            "border-emerald-400 bg-emerald-500/25 text-emerald-200 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]";
                        } else if (selected && !isCorrect) {
                          btnStyle =
                            "border-rose-400 bg-rose-500/25 text-rose-200";
                        } else {
                          btnStyle = "border-slate-800 bg-slate-950/50 text-slate-500";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={answered}
                          onClick={() =>
                            handleSelectAnswer(currentQuizIndex, oIdx)
                          }
                          className={`w-full flex items-center justify-between rounded-xl border p-3 text-left text-xs sm:text-sm transition cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {answered && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          )}
                          {answered && selected && !isCorrect && (
                            <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {userAnswers[currentQuizIndex] !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2.5 text-xs text-cyan-200"
                    >
                      <span className="font-black text-cyan-300">
                        📖 Explicação Cultural:{" "}
                      </span>
                      {langData.quiz[currentQuizIndex]?.explanation}
                    </motion.div>
                  )}

                  {/* Next Question / Finish Button */}
                  {userAnswers[currentQuizIndex] !== undefined && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextQuizQuestion}
                        className="flex items-center gap-2 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-black text-slate-950 uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 cursor-pointer transition"
                      >
                        <span>
                          {currentQuizIndex < langData.quiz.length - 1
                            ? "Próxima Pergunta"
                            : "Ver Resultado Final"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Quiz Finished Summary */
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-amber-400 bg-amber-500/20 text-4xl shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                    {totalCorrect === langData.quiz.length ? "🏆" : "📜"}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white uppercase">
                      {totalCorrect === langData.quiz.length
                        ? "Parabéns, Embaixador Cultural!"
                        : "Bom esforço no aprendizado!"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300">
                      Você acertou {totalCorrect} de {langData.quiz.length} perguntas
                      sobre o idioma {langData.languageName}.
                    </p>
                  </div>

                  {totalCorrect === langData.quiz.length ? (
                    <div className="rounded-2xl border border-emerald-400/50 bg-emerald-500/15 p-3 text-xs text-emerald-200">
                      ✨ Você recebeu <strong>+15 Gemas da Sabedoria 💎</strong> e{" "}
                      <strong>+100 XP</strong> por honrar a língua dos povos!
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-400/40 bg-amber-500/15 p-3 text-xs text-amber-200">
                      💡 Revise as frases na aba de Dicionário e tente novamente
                      para gabaritar e faturar o bônus!
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResetQuiz}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-black text-slate-200 hover:border-cyan-400 cursor-pointer transition uppercase"
                    >
                      Tentar Novamente
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("phrases")}
                      className="rounded-xl border border-amber-400 bg-amber-500/25 px-4 py-2 text-xs font-black text-amber-300 hover:bg-amber-500/35 cursor-pointer transition uppercase"
                    >
                      Ver Frases do Dicionário
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
