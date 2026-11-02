"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Gem,
  Lock,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { SkinId, SkinRarity } from "@/types/game";
import {
  AVATAR_OPTIONS,
  GIFT_OPTIONS,
  SKIN_OPTIONS,
} from "@/data/avatarsAndGifts";
import { useGame } from "@/context/GameContext";
import { useMobileViewport } from "@/lib/useMobileViewport";
import { HeroPreview3D } from "./HeroPreview3D";
import { HeroPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";

interface SkinWardrobeModalProps {
  open: boolean;
  onClose: () => void;
}

const RARITY_BADGE_STYLE: Record<SkinRarity, string> = {
  CLÁSSICA: "border-emerald-400/50 bg-emerald-500/15 text-emerald-300",
  ÉPICA: "border-cyan-400/60 bg-cyan-500/15 text-cyan-200",
  LENDÁRIA: "border-amber-300/75 bg-amber-500/20 text-amber-200",
  MÍTICA: "border-fuchsia-400/80 bg-fuchsia-500/25 text-fuchsia-200",
};

export function SkinWardrobeModal({ open, onClose }: SkinWardrobeModalProps) {
  const {
    state,
    level,
    isSkinUnlocked,
    unlockAndEquipSkin,
    buyAndEquipSkin,
    updateAgentAppearance,
    playSfx,
  } = useGame();
  const { isMobileLandscape, isMobilePortrait, isCompactMobile } =
    useMobileViewport();

  const isMobile = isMobilePortrait || isCompactMobile;

  const currentAvatar = state.agent?.avatarId ?? "lucas";
  const currentSkin = state.agent?.skinId ?? "padrao";
  const currentGift = state.agent?.giftId ?? "acolhedor";

  const [previewSkin, setPreviewSkin] = useState<SkinId>(currentSkin);
  const [nameDraft, setNameDraft] = useState<string>(
    state.agent?.name ?? "Agente Ide"
  );
  const [mobileTab, setMobileTab] = useState<"skins" | "herois" | "dons">(
    "skins"
  );

  // Synchronize preview skin and nick whenever modal opens or equipped appearance changes
  useEffect(() => {
    if (open && state.agent) {
      setPreviewSkin(state.agent.skinId ?? "padrao");
      setNameDraft(state.agent.name);
    }
  }, [open, state.agent?.skinId, state.agent?.name]);

  // Close with Esc key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const activePreviewSkin: SkinId = open ? previewSkin : currentSkin;
  const selectedSkinMeta =
    SKIN_OPTIONS.find((s) => s.id === activePreviewSkin) || SKIN_OPTIONS[0];
  const selectedUnlocked = isSkinUnlocked(activePreviewSkin);
  const isEquipped = currentSkin === activePreviewSkin;
  const levelMet = level >= selectedSkinMeta.unlockLevel;
  const canAfford = state.wisdom >= selectedSkinMeta.priceDiamonds;
  const unlockedCount = SKIN_OPTIONS.filter((s) => isSkinUnlocked(s.id)).length;

  /** Dynamic Action CTA Button (Equip / Buy / Level Locked) */
  const renderActionButton = (compact = false) => {
    if (isEquipped) {
      return (
        <div
          className={`flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/60 bg-emerald-500/20 text-emerald-300 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)] ${
            compact ? "py-1.5 px-3 text-xs" : "py-2.5 px-4 text-sm"
          }`}
        >
          <CheckCircle2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span>EQUIPADA</span>
        </div>
      );
    }

    if (selectedUnlocked) {
      return (
        <MobaButton
          variant="gold"
          size={compact ? "sm" : "md"}
          shape="hex"
          onClick={() => {
            playSfx("click");
            unlockAndEquipSkin(selectedSkinMeta.id);
          }}
          className={`w-full ${
            compact ? "!py-1.5 !text-xs" : "!py-2.5 !text-sm"
          } font-black shadow-[0_0_15px_rgba(245,158,11,0.35)]`}
        >
          <Sparkles className="h-4 w-4" />
          <span>EQUIPAR SKIN</span>
        </MobaButton>
      );
    }

    // Locked: Level check
    if (!levelMet) {
      return (
        <button
          type="button"
          disabled
          className={`w-full rounded-xl border border-slate-700 bg-slate-900/90 text-slate-400 font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-85 ${
            compact ? "py-1.5 px-2.5 text-[11px]" : "py-2.5 px-3 text-xs"
          }`}
        >
          <Lock className="h-3.5 w-3.5 text-amber-400" />
          <span>
            REQUER NÍVEL {selectedSkinMeta.unlockLevel} • {selectedSkinMeta.priceDiamonds} 💎
          </span>
        </button>
      );
    }

    // Locked: Has level, check diamonds
    if (canAfford) {
      return (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playSfx("click");
            buyAndEquipSkin(selectedSkinMeta.id);
          }}
          className={`w-full flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400 bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-400 text-slate-950 font-black cursor-pointer shadow-[0_0_18px_rgba(6,182,212,0.45)] hover:shadow-[0_0_24px_rgba(6,182,212,0.6)] transition-all ${
            compact ? "py-1.5 px-3 text-xs" : "py-2.5 px-4 text-sm"
          }`}
        >
          <Gem className="h-4 w-4 fill-slate-950 text-slate-950" />
          <span>COMPRAR POR {selectedSkinMeta.priceDiamonds} 💎</span>
        </motion.button>
      );
    }

    return (
      <button
        type="button"
        disabled
        className={`w-full rounded-xl border border-slate-800 bg-slate-950/90 text-slate-400 font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80 ${
          compact ? "py-1.5 px-2.5 text-[11px]" : "py-2.5 px-3 text-xs"
        }`}
      >
        <Gem className="h-3.5 w-3.5 text-cyan-400" />
        <span>
          {selectedSkinMeta.priceDiamonds} 💎 (FALTAM {selectedSkinMeta.priceDiamonds - state.wisdom} 💎)
        </span>
      </button>
    );
  };

  return (
    <AnimatePresence>
      {open && state.agent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 backdrop-blur-md sm:p-5 select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className={`flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border-2 border-amber-400/55 bg-gradient-to-br from-slate-950 via-[#071225] to-slate-950 shadow-[0_0_80px_rgba(245,158,11,0.24)] ${
              isMobileLandscape ? "h-[96dvh]" : ""
            }`}
          >
            {/* Top Armory Header (Clean & Compact) */}
            <div className="flex items-center justify-between gap-2 border-b border-amber-500/25 bg-slate-950/90 px-3 py-2 sm:px-5 sm:py-3 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-amber-400/60 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black tracking-wide text-white uppercase">
                    Vestiário & Skins 3D
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Wisdom Diamonds Balance */}
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/50 bg-cyan-950/60 px-2.5 py-1 text-xs font-black text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Gem className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{state.wisdom} 💎</span>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    onClose();
                  }}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-1.5 text-slate-300 hover:border-rose-400 hover:text-white transition"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* BODY ROUTING: MOBILE LANDSCAPE vs MOBILE PORTRAIT vs DESKTOP */}
            {isMobileLandscape ? (
              /* =============================================================
                 1. MOBILE LANDSCAPE CONSOLE WIDESCREEN
                 ============================================================= */
              <div className="grid grid-cols-12 gap-3 p-2.5 flex-1 min-h-0 overflow-hidden">
                {/* LEFT (5 cols): 3D Turntable + Selected Skin Card */}
                <div className="col-span-5 flex flex-col justify-between h-full min-h-0">
                  <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                    <HeroPreview3D
                      avatarId={currentAvatar}
                      skinId={activePreviewSkin}
                      agentName={state.agent.name}
                      heightClass="h-full min-h-[160px] w-full"
                      showEmoteBar
                      compact
                      borderless
                    />
                  </div>

                  <div className="rounded-2xl border border-amber-400/40 bg-slate-900/95 p-2 shrink-0 shadow-lg space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[8.5px] font-black tracking-wider uppercase ${
                          RARITY_BADGE_STYLE[selectedSkinMeta.rarity]
                        }`}
                      >
                        {selectedSkinMeta.badgeEmoji} {selectedSkinMeta.rarity}
                      </span>
                      {selectedSkinMeta.priceDiamonds > 0 && !selectedUnlocked && (
                        <span className="text-[10px] font-mono font-black text-cyan-300">
                          {selectedSkinMeta.priceDiamonds} 💎
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-black text-white uppercase truncate">
                      {selectedSkinMeta.name}
                    </div>

                    <div>{renderActionButton(true)}</div>
                  </div>
                </div>

                {/* RIGHT (7 cols): Tabs + Content */}
                <div className="col-span-7 flex flex-col justify-between h-full min-h-0 gap-2">
                  <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setMobileTab("skins");
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 text-xs font-black uppercase transition cursor-pointer ${
                        mobileTab === "skins"
                          ? "bg-amber-400/25 text-amber-300 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Skins ({unlockedCount}/8)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setMobileTab("herois");
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 text-xs font-black uppercase transition cursor-pointer ${
                        mobileTab === "herois"
                          ? "bg-cyan-400/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Users className="h-3 w-3" />
                      <span>Herói (4)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setMobileTab("dons");
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 text-xs font-black uppercase transition cursor-pointer ${
                        mobileTab === "dons"
                          ? "bg-emerald-400/25 text-emerald-300 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      <span>Dons (4)</span>
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {mobileTab === "skins" && (
                      <div className="grid grid-cols-4 gap-1.5 auto-rows-fr">
                        {SKIN_OPTIONS.map((sk) => {
                          const unlocked = isSkinUnlocked(sk.id);
                          const equipped = currentSkin === sk.id;
                          const previewing = activePreviewSkin === sk.id;

                          return (
                            <motion.button
                              key={sk.id}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => {
                                playSfx("click");
                                setPreviewSkin(sk.id);
                              }}
                              className={`relative flex flex-col justify-between rounded-xl border p-1.5 text-left transition cursor-pointer ${
                                sk.gradientClass
                              } ${
                                previewing
                                  ? "border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] ring-2 ring-amber-300"
                                  : equipped
                                    ? "border-emerald-400 ring-1 ring-emerald-400/50"
                                    : unlocked
                                      ? "border-slate-700/80 hover:border-cyan-400"
                                      : "border-slate-800/80 opacity-75 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-base">{sk.badgeEmoji}</span>
                                {equipped ? (
                                  <span className="rounded bg-emerald-500/25 px-1 py-0.2 text-[7px] font-black text-emerald-300">
                                    EQUIPADA
                                  </span>
                                ) : unlocked ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
                                ) : sk.priceDiamonds > 0 ? (
                                  <span className="rounded bg-cyan-950/80 border border-cyan-400/40 px-1 py-0.2 text-[7.5px] font-mono font-black text-cyan-300">
                                    {sk.priceDiamonds} 💎
                                  </span>
                                ) : (
                                  <span className="font-mono text-[7px] font-bold text-amber-300 bg-slate-950/80 px-1 py-0.2 rounded border border-amber-400/30">
                                    Nív.{sk.unlockLevel}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1">
                                <div
                                  className="text-[7px] font-black uppercase tracking-wider truncate"
                                  style={{ color: sk.accentHex }}
                                >
                                  {sk.rarity}
                                </div>
                                <div className="text-[9px] font-black text-white truncate leading-tight">
                                  {sk.name}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {mobileTab === "herois" && (
                      <div className="flex flex-col gap-2">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateAgentAppearance({ name: nameDraft });
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1.5"
                        >
                          <span className="text-[10px] font-black text-amber-300 uppercase shrink-0">
                            Nick:
                          </span>
                          <input
                            type="text"
                            maxLength={24}
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            className="flex-1 min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-black text-white focus:border-cyan-400 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-2.5 py-1 text-xs font-black text-cyan-200"
                          >
                            Salvar
                          </button>
                        </form>

                        <div className="grid grid-cols-2 gap-1.5">
                          {AVATAR_OPTIONS.map((av) => {
                            const active = av.id === currentAvatar;
                            return (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => updateAgentAppearance({ avatarId: av.id })}
                                className={`flex items-center gap-2 rounded-xl border p-2 text-left cursor-pointer transition ${
                                  active
                                    ? "border-amber-400 bg-amber-500/20 ring-1 ring-amber-300"
                                    : "border-slate-800 bg-slate-900/80"
                                }`}
                              >
                                <HeroPortrait avatarId={av.id} size={34} shape="hex" active={active} />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-black text-white uppercase truncate">{av.name}</div>
                                  <div className="text-[9px] font-bold text-amber-300 truncate">{av.codename}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {mobileTab === "dons" && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {GIFT_OPTIONS.map((g) => {
                          const active = g.id === currentGift;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => updateAgentAppearance({ giftId: g.id })}
                              className={`flex flex-col justify-between rounded-xl border p-2 text-left cursor-pointer transition ${
                                active
                                  ? "border-amber-400 bg-amber-500/20 ring-1 ring-amber-300"
                                  : "border-slate-800 bg-slate-900/80"
                              }`}
                            >
                              <div>
                                <div className="text-xs font-black text-white uppercase">{g.name}</div>
                                <div className="text-[9px] font-bold text-cyan-300">{g.verseRef}</div>
                              </div>
                              <div className="text-[8px] text-slate-300 mt-0.5 line-clamp-2">{g.bonusDescription}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : isMobile ? (
              /* =============================================================
                 2. MOBILE PORTRAIT: ULTRA-CLEAN, ZERO CLUTTER, DIAMOND STORE
                 ============================================================= */
              <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3 gap-2">
                {/* Segmented Control Tabs */}
                <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 shrink-0 gap-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setMobileTab("skins");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-black uppercase transition cursor-pointer ${
                      mobileTab === "skins"
                        ? "bg-amber-400/25 text-amber-300 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Skins ({unlockedCount}/8)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setMobileTab("herois");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-black uppercase transition cursor-pointer ${
                      mobileTab === "herois"
                        ? "bg-cyan-400/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Herói</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setMobileTab("dons");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-black uppercase transition cursor-pointer ${
                      mobileTab === "dons"
                        ? "bg-emerald-400/25 text-emerald-300 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Dom</span>
                  </button>
                </div>

                {/* TAB 1: SKINS (Compact 3D Preview + 8-Grid) */}
                {mobileTab === "skins" && (
                  <div className="flex flex-col gap-2">
                    {/* Compact 3D Model Showcase */}
                    <div className="relative rounded-2xl border border-amber-500/30 bg-slate-950/80 p-2 overflow-hidden shadow-md">
                      <div className="h-40 sm:h-48 w-full flex items-center justify-center overflow-hidden">
                        <HeroPreview3D
                          avatarId={currentAvatar}
                          skinId={activePreviewSkin}
                          agentName={state.agent.name}
                          heightClass="h-full w-full"
                          showEmoteBar
                          compact
                          borderless
                        />
                      </div>

                      {/* Selected Skin Bar directly underneath */}
                      <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{selectedSkinMeta.badgeEmoji}</span>
                            <span className="text-xs font-black text-white uppercase truncate">
                              {selectedSkinMeta.name}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[8px] font-black uppercase border shrink-0 ${
                                RARITY_BADGE_STYLE[selectedSkinMeta.rarity]
                              }`}
                            >
                              {selectedSkinMeta.rarity}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">{renderActionButton(true)}</div>
                      </div>
                    </div>

                    {/* Grid of 8 Skins (Compact, Visual, No text clutter) */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {SKIN_OPTIONS.map((sk) => {
                        const unlocked = isSkinUnlocked(sk.id);
                        const equipped = currentSkin === sk.id;
                        const previewing = activePreviewSkin === sk.id;

                        return (
                          <motion.button
                            key={sk.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              playSfx("click");
                              setPreviewSkin(sk.id);
                            }}
                            className={`relative flex flex-col justify-between rounded-xl border p-1.5 text-left transition cursor-pointer overflow-hidden ${
                              sk.gradientClass
                            } ${
                              previewing
                                ? "border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] ring-2 ring-amber-300"
                                : equipped
                                  ? "border-emerald-400 ring-1 ring-emerald-400/50"
                                  : unlocked
                                    ? "border-slate-700/80 hover:border-cyan-400"
                                    : "border-slate-800/80 opacity-75 hover:opacity-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base">{sk.badgeEmoji}</span>
                              {equipped ? (
                                <span className="rounded bg-emerald-500/25 px-1 py-0.2 text-[7px] font-black text-emerald-300">
                                  EQUIPADA
                                </span>
                              ) : unlocked ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
                              ) : sk.priceDiamonds > 0 ? (
                                <span className="rounded bg-cyan-950/80 border border-cyan-400/40 px-1 py-0.2 text-[7.5px] font-mono font-black text-cyan-300">
                                  {sk.priceDiamonds} 💎
                                </span>
                              ) : (
                                <span className="font-mono text-[7px] font-bold text-amber-300 bg-slate-950/80 px-1 py-0.2 rounded border border-amber-400/30">
                                  Nív.{sk.unlockLevel}
                                </span>
                              )}
                            </div>

                            <div className="mt-1">
                              <div
                                className="text-[7px] font-black uppercase tracking-wider truncate"
                                style={{ color: sk.accentHex }}
                              >
                                {sk.rarity}
                              </div>
                              <div className="text-[9px] font-black text-white truncate leading-tight">
                                {sk.name}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: HEROES */}
                {mobileTab === "herois" && (
                  <div className="flex flex-col gap-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateAgentAppearance({ name: nameDraft });
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2 shrink-0"
                    >
                      <span className="text-xs font-black text-amber-300 uppercase shrink-0">
                        Nick:
                      </span>
                      <input
                        type="text"
                        maxLength={24}
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        placeholder="Seu Apelido..."
                        className="flex-1 min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-black text-white focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-1 text-xs font-black text-cyan-200 hover:bg-cyan-500/30 cursor-pointer"
                      >
                        Salvar
                      </button>
                    </form>

                    <div className="grid grid-cols-2 gap-2">
                      {AVATAR_OPTIONS.map((av) => {
                        const active = av.id === currentAvatar;
                        return (
                          <motion.button
                            key={av.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => updateAgentAppearance({ avatarId: av.id })}
                            className={`flex items-center gap-2.5 rounded-xl border-2 p-2 text-left cursor-pointer transition ${
                              active
                                ? "border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-300"
                                : "border-slate-800 bg-slate-900/80 hover:border-slate-600"
                            }`}
                          >
                            <HeroPortrait avatarId={av.id} size={36} shape="hex" active={active} />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-white uppercase truncate">
                                {av.name}
                              </div>
                              <div className="text-[9.5px] font-bold text-amber-300 truncate">
                                {av.codename}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: DONS */}
                {mobileTab === "dons" && (
                  <div className="grid grid-cols-2 gap-2">
                    {GIFT_OPTIONS.map((g) => {
                      const active = g.id === currentGift;
                      return (
                        <motion.button
                          key={g.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => updateAgentAppearance({ giftId: g.id })}
                          className={`flex flex-col justify-between rounded-xl border-2 p-2.5 text-left cursor-pointer transition ${
                            active
                              ? "border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-300"
                              : "border-slate-800 bg-slate-900/80 hover:border-slate-600"
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black text-white uppercase">{g.name}</div>
                            <div className="text-[9.5px] font-bold text-cyan-300 mt-0.5">{g.verseRef}</div>
                          </div>
                          <div className="text-[8.5px] text-slate-300 mt-1 line-clamp-2">{g.bonusDescription}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* =============================================================
                 3. DESKTOP FULL CONSOLE VIEW
                 ============================================================= */
              <div className="grid flex-1 overflow-y-auto gap-5 p-4 sm:p-6 lg:grid-cols-12 min-h-0">
                {/* LEFT (5 cols): Interactive 3D Character & Emote Showcase */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-2 overflow-hidden shadow-lg flex-1 min-h-[280px]">
                    <HeroPreview3D
                      avatarId={currentAvatar}
                      skinId={activePreviewSkin}
                      agentName={state.agent.name}
                      heightClass="h-full min-h-[260px] w-full"
                      showEmoteBar
                      compact={false}
                    />
                  </div>

                  {/* Selected Skin Card */}
                  <div className="rounded-2xl border border-amber-400/35 bg-slate-900/90 p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[9.5px] font-black tracking-widest uppercase ${
                          RARITY_BADGE_STYLE[selectedSkinMeta.rarity]
                        }`}
                      >
                        {selectedSkinMeta.badgeEmoji} SKIN {selectedSkinMeta.rarity}
                      </span>

                      {selectedSkinMeta.priceDiamonds > 0 && !selectedUnlocked && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-cyan-300 bg-cyan-950/80 border border-cyan-400/40 px-2 py-0.5 rounded-lg">
                          <Gem className="h-3 w-3" />
                          {selectedSkinMeta.priceDiamonds} Diamantes
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-white uppercase">
                      {selectedSkinMeta.name}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      {selectedSkinMeta.tagline}
                    </p>

                    <div className="pt-1">{renderActionButton(false)}</div>
                  </div>
                </div>

                {/* RIGHT (7 cols): Champion Switcher, Nickname & 8 Skins */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-4 overflow-y-auto pr-1">
                  {/* 1. Trocar Campeão Base & Nickname */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-black tracking-widest text-cyan-300 uppercase">
                        1. Campeão Base & Apelido
                      </span>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateAgentAppearance({ name: nameDraft });
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          maxLength={24}
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          placeholder="Seu Nick..."
                          className="w-36 rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-black text-white focus:border-cyan-400 focus:outline-none sm:w-44"
                        />
                        <button
                          type="submit"
                          className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-black text-cyan-200 hover:bg-cyan-500/25"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Salvar
                        </button>
                      </form>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_OPTIONS.map((av) => {
                        const active = av.id === currentAvatar;
                        return (
                          <motion.button
                            key={av.id}
                            type="button"
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              updateAgentAppearance({ avatarId: av.id });
                            }}
                            className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 p-2 transition ${
                              active
                                ? "border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                : "border-slate-800 bg-slate-950/70 hover:border-slate-600"
                            }`}
                          >
                            <HeroPortrait avatarId={av.id} size={48} shape="hex" active={active} />
                            <span
                              className={`mt-1 text-xs font-black uppercase ${
                                active ? "text-amber-300" : "text-slate-300"
                              }`}
                            >
                              {av.name}
                            </span>
                            <span className="text-[9px] text-slate-400">{av.codename}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Coleção de Skins 3D */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3.5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-black tracking-widest text-amber-300 uppercase">
                        2. Coleção de Skins 3D ({unlockedCount}/{SKIN_OPTIONS.length} Liberadas)
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {SKIN_OPTIONS.map((sk) => {
                        const unlocked = isSkinUnlocked(sk.id);
                        const equipped = currentSkin === sk.id;
                        const previewing = activePreviewSkin === sk.id;

                        return (
                          <motion.button
                            key={sk.id}
                            type="button"
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              playSfx("click");
                              setPreviewSkin(sk.id);
                            }}
                            className={`relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border-2 p-2.5 text-left transition ${
                              sk.gradientClass
                            } ${
                              previewing
                                ? "border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.45)] ring-2 ring-amber-300"
                                : equipped
                                  ? "border-emerald-400/80"
                                  : unlocked
                                    ? "border-slate-700/90 hover:border-cyan-400/70"
                                    : "border-slate-800/90 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xl">{sk.badgeEmoji}</span>
                              {equipped ? (
                                <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[8.5px] font-black text-emerald-300">
                                  EQUIPADA
                                </span>
                              ) : unlocked ? (
                                <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                              ) : sk.priceDiamonds > 0 ? (
                                <span className="rounded-full bg-cyan-950/80 border border-cyan-400/40 px-1.5 py-0.5 font-mono text-[8.5px] font-black text-cyan-300">
                                  {sk.priceDiamonds} 💎
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-950/85 px-1.5 py-0.5 font-mono text-[9px] font-black text-amber-300 border border-amber-400/30">
                                  <Lock className="h-2.5 w-2.5" /> Nív.{sk.unlockLevel}
                                </span>
                              )}
                            </div>

                            <div className="mt-2">
                              <div
                                className="text-[8px] font-black tracking-widest uppercase"
                                style={{ color: sk.accentHex }}
                              >
                                {sk.rarity}
                              </div>
                              <div className="text-[11px] font-black text-white leading-tight truncate">
                                {sk.name}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Dom Espiritual */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3">
                    <div className="mb-1.5 text-[11px] font-black tracking-widest text-cyan-300 uppercase">
                      3. Dom Missionário (Runa Ativa)
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {GIFT_OPTIONS.map((g) => {
                        const active = g.id === currentGift;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => updateAgentAppearance({ giftId: g.id })}
                            className={`cursor-pointer rounded-xl border px-2 py-1.5 text-left transition ${
                              active
                                ? "border-amber-400 bg-amber-500/20 text-amber-200"
                                : "border-slate-800 bg-slate-950/75 text-slate-400 hover:border-slate-600 hover:text-white"
                            }`}
                          >
                            <div className="text-[10px] font-black">{g.name}</div>
                            <div className="text-[8px] opacity-80">{g.verseRef}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
