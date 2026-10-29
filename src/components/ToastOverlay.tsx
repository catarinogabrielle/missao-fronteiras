"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useGame } from "@/context/GameContext";

export function ToastOverlay() {
  const { toasts, dismissToast } = useGame();

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[90] flex max-w-sm flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border-2 border-emerald-400/50 bg-slate-900/95 p-3.5 shadow-[0_0_30px_rgba(16,185,129,0.28)] backdrop-blur"
          >
            <span className="text-2xl">{t.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-white sm:text-sm">
                {t.title}
              </div>
              <div className="mt-0.5 text-xs text-slate-300">{t.subtitle}</div>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
