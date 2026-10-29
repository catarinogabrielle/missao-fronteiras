"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Languages,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { WordDecoderChallenge } from "@/types/game";
import { useGame } from "@/context/GameContext";

interface WordDecoderGameProps {
  challenge: WordDecoderChallenge;
  onComplete: (remainingSeconds: number) => void;
  onClose?: () => void;
}

interface WordToken {
  uid: string;
  text: string;
}

function shuffleTokens(chunks: string[]): WordToken[] {
  const base = chunks.map((text, index) => ({
    uid: `tok-${index}-${text}`,
    text,
  }));
  const arr = [...base];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure it's not accidentally in exact original order
  if (
    arr.length > 1 &&
    arr.every((item, idx) => item.text === chunks[idx])
  ) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export function WordDecoderGame({
  challenge,
  onComplete,
  onClose,
}: WordDecoderGameProps) {
  const { state, playSfx, spendWisdom } = useGame();
  const isAgileTranslator = state.agent?.giftId === "tradutor";

  const totalTime = challenge.timeLimitSeconds + (isAgileTranslator ? 20 : 0);

  const [pool, setPool] = useState<WordToken[]>(() =>
    shuffleTokens(challenge.verseChunks)
  );
  const [placed, setPlaced] = useState<WordToken[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(totalTime);
  const [freeHintUsed, setFreeHintUsed] = useState(false);
  const [wrongAttemptMsg, setWrongAttemptMsg] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const targetSentence = useMemo(
    () => challenge.verseChunks.join(" "),
    [challenge.verseChunks]
  );

  // Countdown Timer
  useEffect(() => {
    if (solved || timedOut) return;
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
  }, [solved, timedOut, playSfx]);

  const checkSolution = useCallback(
    (nextPlaced: WordToken[]) => {
      if (nextPlaced.length !== challenge.verseChunks.length) {
        setWrongAttemptMsg(null);
        return;
      }
      const attempt = nextPlaced.map((t) => t.text).join(" ");
      if (attempt === targetSentence) {
        setSolved(true);
        setWrongAttemptMsg(null);
        playSfx("success");
        setTimeout(() => {
          onComplete(secondsLeft);
        }, 1100);
      } else {
        playSfx("error");
        setWrongAttemptMsg(
          "Quase lá! A ordem de alguns blocos ainda não forma o versículo exato. Toque em um bloco para reposicionar!"
        );
      }
    },
    [challenge.verseChunks.length, onComplete, playSfx, secondsLeft, targetSentence]
  );

  const handleSelectFromPool = (token: WordToken) => {
    if (solved || timedOut) return;
    playSfx("word");
    const nextPool = pool.filter((t) => t.uid !== token.uid);
    const nextPlaced = [...placed, token];
    setPool(nextPool);
    setPlaced(nextPlaced);
    checkSolution(nextPlaced);
  };

  const handleRemovePlaced = (token: WordToken) => {
    if (solved || timedOut) return;
    playSfx("click");
    setWrongAttemptMsg(null);
    setPlaced((prev) => prev.filter((t) => t.uid !== token.uid));
    setPool((prev) => [...prev, token]);
  };

  const handleClearOrRetry = () => {
    playSfx("click");
    setPlaced([]);
    setPool(shuffleTokens(challenge.verseChunks));
    setWrongAttemptMsg(null);
    if (timedOut) {
      setTimedOut(false);
      setSecondsLeft(totalTime);
    }
  };

  const handleHint = () => {
    if (solved || timedOut) return;

    // Find first index where placed doesn't match target
    let firstMismatchIdx = 0;
    while (
      firstMismatchIdx < placed.length &&
      placed[firstMismatchIdx].text === challenge.verseChunks[firstMismatchIdx]
    ) {
      firstMismatchIdx++;
    }

    if (firstMismatchIdx >= challenge.verseChunks.length) return;

    // Check cost
    if (isAgileTranslator && !freeHintUsed) {
      setFreeHintUsed(true);
    } else {
      const ok = spendWisdom(10);
      if (!ok) {
        playSfx("error");
        setWrongAttemptMsg("Você precisa de 10 Pontos de Sabedoria para pedir uma dica extra.");
        return;
      }
    }

    playSfx("prayer");
    setWrongAttemptMsg(null);

    // Keep matched prefix, return mismatched suffix to pool, and grab the right next token
    const correctPrefix = placed.slice(0, firstMismatchIdx);
    const returnedSuffix = placed.slice(firstMismatchIdx);
    const combinedPool = [...pool, ...returnedSuffix];

    const neededText = challenge.verseChunks[firstMismatchIdx];
    const matchIdx = combinedPool.findIndex((t) => t.text === neededText);
    if (matchIdx === -1) return;

    const chosenToken = combinedPool[matchIdx];
    const remainingPool = combinedPool.filter((_, idx) => idx !== matchIdx);
    const nextPlaced = [...correctPrefix, chosenToken];

    setPlaced(nextPlaced);
    setPool(remainingPool);
    checkSolution(nextPlaced);
  };

  const timePercent = Math.round((secondsLeft / totalTime) * 100);

  return (
    <div className="rounded-3xl border border-cyan-500/35 bg-slate-900/90 p-5 shadow-2xl backdrop-blur sm:p-7">
      {/* Header & Gospel Pillar */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-xs font-extrabold text-cyan-300">
            <Languages className="h-3.5 w-3.5" />
            Mini-Game • Decodificador da Palavra
          </span>
          <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
            {challenge.gospelPillar}
          </h3>
          <p className="mt-1 text-xs text-slate-300 sm:text-sm">
            {challenge.gospelExplanation}
          </p>
        </div>

        {/* Countdown Clock + Close Button */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2 font-mono text-base font-black ${
              secondsLeft <= 12
                ? "animate-pulse border-rose-500 bg-rose-500/20 text-rose-300"
                : "border-amber-500/40 bg-amber-500/10 text-amber-300"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{secondsLeft}s</span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onClose();
              }}
              title="Fechar [Esc]"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs font-black text-slate-200 transition hover:border-rose-400 hover:bg-rose-500/20 hover:text-white"
            >
              <X className="h-4 w-4" />
              Fechar
            </button>
          )}
        </div>
      </div>

      {/* Time Progress Bar */}
      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          style={{ width: `${timePercent}%` }}
          className={`h-full transition-all duration-500 ${
            secondsLeft <= 12
              ? "bg-rose-500"
              : "bg-gradient-to-r from-cyan-400 to-emerald-400"
          }`}
        />
      </div>

      {/* Local Language Glossary Chips */}
      {challenge.localWordsGlossary.length > 0 && (
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
          <div className="mb-2 text-[11px] font-extrabold tracking-wider text-amber-300 uppercase">
            🌍 Notas do Idioma Local: {challenge.localLanguageName}
          </div>
          <div className="flex flex-wrap gap-2">
            {challenge.localWordsGlossary.map((item) => (
              <span
                key={item.term}
                className="rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300"
              >
                <strong className="text-cyan-300">{item.term}</strong> ={" "}
                {item.meaning}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instruction */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-300 sm:text-sm">
          Ordene os blocos para traduzir{" "}
          <strong className="text-emerald-400">
            {challenge.verseReference}
          </strong>
          :
        </span>
        <span className="text-xs text-slate-400">
          {placed.length}/{challenge.verseChunks.length} blocos
        </span>
      </div>

      {/* Active Translation Zone */}
      <div
        className={`min-h-28 rounded-2xl border-2 border-dashed p-4 transition ${
          solved
            ? "border-emerald-400 bg-emerald-500/15"
            : wrongAttemptMsg
              ? "border-rose-400/70 bg-rose-500/10"
              : "border-slate-700 bg-slate-950/90"
        }`}
      >
        {placed.length === 0 ? (
          <div className="flex h-16 items-center justify-center text-center text-xs font-semibold text-slate-500 sm:text-sm">
            Toque nos blocos abaixo na ordem correta para montar a Palavra...
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {placed.map((tok, index) => (
              <motion.button
                layout
                key={tok.uid}
                type="button"
                onClick={() => handleRemovePlaced(tok)}
                className={`rounded-xl border-b-4 px-3.5 py-2 text-sm font-extrabold transition sm:text-base ${
                  solved
                    ? "border-emerald-700 bg-emerald-400 text-slate-950"
                    : "border-cyan-700 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                }`}
              >
                <span className="mr-1.5 font-mono text-[11px] opacity-60">
                  {index + 1}.
                </span>
                {tok.text}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {wrongAttemptMsg && (
        <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3.5 py-2.5 text-xs font-bold text-rose-200">
          ⚠️ {wrongAttemptMsg}
        </div>
      )}

      {solved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400 bg-emerald-500/20 p-4 text-sm font-black text-emerald-200"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          Tradução Concluída com Fidelidade! A Palavra ganhou vida na comunidade!
        </motion.div>
      )}

      {timedOut && !solved && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/50 bg-amber-500/15 p-4">
          <div className="text-xs font-bold text-amber-200 sm:text-sm">
            ⏰ O relógio zerou, mas um tradutor missionário nunca desiste! Tente
            novamente!
          </div>
          <button
            type="button"
            onClick={handleClearOrRetry}
            className="rounded-xl border-b-4 border-amber-700 bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Scrambled Word Bank */}
      <div className="mt-5">
        <div className="mb-2 text-xs font-bold text-slate-400">
          Blocos Disponíveis:
        </div>
        <div className="flex min-h-14 flex-wrap gap-2.5">
          {pool.map((tok) => (
            <motion.button
              layout
              key={tok.uid}
              type="button"
              disabled={solved || timedOut}
              onClick={() => handleSelectFromPool(tok)}
              className="rounded-xl border-2 border-b-4 border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-bold text-white transition hover:border-cyan-400 hover:bg-slate-700 active:translate-y-0.5 disabled:opacity-50 sm:text-base"
            >
              {tok.text}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Controls Footer */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={handleClearOrRetry}
          disabled={solved || placed.length === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reiniciar Blocos
        </button>

        <button
          type="button"
          onClick={handleHint}
          disabled={solved || timedOut}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-extrabold text-amber-300 transition hover:bg-amber-500/25 disabled:opacity-40"
        >
          {isAgileTranslator && !freeHintUsed ? (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Encaixar Próximo Bloco (Bônus Tradutor Grátis!)
            </>
          ) : (
            <>
              <HelpCircle className="h-3.5 w-3.5" />
              Dica de Sintaxe (-10 Sabedoria)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
