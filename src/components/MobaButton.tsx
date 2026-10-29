"use client";

import React from "react";
import { motion } from "framer-motion";
import { soundEngine } from "@/lib/sound";

interface MobaButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "gold" | "cyan" | "emerald" | "violet" | "obsidian";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "hex" | "slant" | "rounded";
  sheen?: boolean;
  className?: string;
  title?: string;
}

const VARIANT_STYLES: Record<NonNullable<MobaButtonProps["variant"]>, string> = {
  gold: "bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 text-slate-950 border-2 border-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.5),inset_0_1px_1px_rgba(255,255,255,0.65)] hover:brightness-110",
  cyan: "bg-gradient-to-b from-cyan-300 via-cyan-500 to-teal-700 text-slate-950 border-2 border-cyan-100 shadow-[0_0_24px_rgba(6,182,212,0.5),inset_0_1px_1px_rgba(255,255,255,0.65)] hover:brightness-110",
  emerald:
    "bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-700 text-slate-950 border-2 border-emerald-100 shadow-[0_0_26px_rgba(16,185,129,0.55),inset_0_1px_1px_rgba(255,255,255,0.65)] hover:brightness-110",
  violet:
    "bg-gradient-to-b from-fuchsia-400 via-violet-600 to-purple-900 text-white border-2 border-fuchsia-200/80 shadow-[0_0_26px_rgba(168,85,247,0.55),inset_0_1px_1px_rgba(255,255,255,0.45)] hover:brightness-110",
  obsidian:
    "bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-amber-100 border border-amber-500/50 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_0_12px_rgba(200,155,60,0.12)] hover:border-amber-300 hover:text-white",
};

const SIZE_STYLES: Record<NonNullable<MobaButtonProps["size"]>, string> = {
  sm: "px-3.5 py-1.5 text-xs font-black tracking-wider uppercase",
  md: "px-5 py-2.5 text-xs sm:text-sm font-black tracking-wider uppercase",
  lg: "px-7 py-3.5 text-sm sm:text-base font-black tracking-widest uppercase",
  xl: "px-9 py-4 text-base sm:text-lg font-black tracking-widest uppercase",
};

const SHAPE_STYLES: Record<NonNullable<MobaButtonProps["shape"]>, string> = {
  hex: "moba-clip-btn",
  slant: "moba-clip-slant",
  rounded: "rounded-xl",
};

export function MobaButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "gold",
  size = "md",
  shape = "hex",
  sheen = true,
  className = "",
  title,
}: MobaButtonProps) {
  return (
    <motion.button
      type={type}
      title={title}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.045, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.94, y: 2 }}
      transition={{ type: "spring", stiffness: 420, damping: 20 }}
      onClick={() => {
        if (disabled) return;
        soundEngine.play("click");
        onClick?.();
      }}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 select-none transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
        VARIANT_STYLES[variant]
      } ${SIZE_STYLES[size]} ${SHAPE_STYLES[shape]} ${
        sheen && !disabled ? "moba-btn-sheen" : ""
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
