"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Gem,
  Lock,
  Sparkles,
  UserCheck,
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
    isSkinUnlocked,
    unlockAndEquipSkin,
    updateAgentAppearance,
    playSfx,
  } = useGame();
  const { isMobileLandscape } = useMobileViewport();

  const currentAvatar = state.agent?.avatarId ?? "lucas";
  const currentSkin = state.agent?.skinId ?? "padrao";
  const currentGift = state.agent?.giftId ?? "acolhedor";

  const [previewSkin, setPreviewSkin] = useState<SkinId>(currentSkin);
  const [nameDraft, setNameDraft] = useState<string>(
    state.agent?.name ?? "Agente Ide"
  );

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

  return (
    <AnimatePresence>
      {open && state.agent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md sm:p-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className={`flex max-h-[95dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border-2 border-amber-400/55 bg-gradient-to-br from-slate-950 via-[#071225] to-slate-950 shadow-[0_0_80px_rgba(245,158,11,0.24)] ${
              isMobileLandscape ? "h-[95dvh]" : ""
            }`}
          >
            {/* AAA Top Armory Header */}
            <div
              className={`flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 bg-slate-950/90 ${
                isMobileLandscape ? "px-3 py-1.5" : "px-5 py-3.5 sm:px-7"
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className={`flex items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-500/15 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] ${
                    isMobileLandscape ? "h-7 w-7" : "h-10 w-10"
                  }`}
                >
                  <Sparkles className={isMobileLandscape ? "h-3.5 w-3.5" : "h-5 w-5"} />
                </div>
                <div>
                  {!isMobileLandscape && (
                    <div className="text-[10px] font-black tracking-[0.25em] text-amber-300 uppercase">
                      ARSENAL 3D CLASSE AAA • PERSONALIZAÇÃO EM TEMPO REAL
                    </div>
                  )}
                  <h2
                    className={`font-black tracking-wide text-white uppercase ${
                      isMobileLandscape ? "text-sm" : "text-lg sm:text-xl"
                    }`}
                  >
                    Vestiário de Campeões & Skins 3D
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/45 bg-cyan-950/50 font-black text-cyan-200 ${
                    isMobileLandscape ? "px-2 py-0.5 text-[10px]" : "px-3.5 py-1.5 text-xs"
                  }`}
                >
                  <Gem className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{state.wisdom} Cristais</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    onClose();
                  }}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 font-black text-slate-300 transition hover:border-rose-400 hover:text-white ${
                    isMobileLandscape ? "px-2 py-0.5 text-[10px]" : "px-3 py-2 text-xs"
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Fechar</span>
                </button>
              </div>
            </div>

            {/* Body: Left 3D Live Turntable + Right Customization & Skin Grid */}
            {isMobileLandscape ? (
              /* MOBILE LANDSCAPE COMPACT WIDESCREEN (100% NO SCROLL) */
              <div className="grid grid-cols-12 gap-2 p-2 flex-1 min-h-0 overflow-hidden">
                {/* LEFT (5 cols): 3D Turntable + Selected Skin Lore & Action */}
                <div className="col-span-5 flex flex-col justify-between h-full min-h-0">
                  <HeroPreview3D
                    avatarId={currentAvatar}
                    skinId={activePreviewSkin}
                    agentName={state.agent.name}
                    heightClass="h-40 flex-1 min-h-0"
                    showEmoteBar
                    compact
                    borderless
                  />

                  {/* Selected Skin Card */}
                  <div className="rounded-xl border border-amber-400/35 bg-slate-900/90 p-2 shrink-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`rounded-full border px-2 py-0.2 text-[8px] font-black tracking-widest uppercase ${
                          RARITY_BADGE_STYLE[selectedSkinMeta.rarity]
                        }`}
                      >
                        {selectedSkinMeta.badgeEmoji} {selectedSkinMeta.rarity}
                      </span>
                      {isEquipped ? (
                        <span className="text-[9px] font-black text-emerald-400">
                          EQUIPADA
                        </span>
                      ) : selectedUnlocked ? (
                        <span className="text-[9px] font-bold text-cyan-300">
                          DESBLOQUEADA
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] font-black text-amber-300">
                          {selectedSkinMeta.costWisdom}💎
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="min-w-0 flex-1 truncate">
                        <div className="text-xs font-black text-white uppercase truncate">
                          {selectedSkinMeta.name}
                        </div>
                        <div className="text-[8px] text-slate-300 truncate">
                          {selectedSkinMeta.tagline}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isEquipped ? (
                          <MobaButton
                            variant="emerald"
                            size="sm"
                            shape="hex"
                            onClick={onClose}
                            className="!py-1 !px-2.5 !text-[9px]"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>PRONTO</span>
                          </MobaButton>
                        ) : selectedUnlocked ? (
                          <MobaButton
                            variant="gold"
                            size="sm"
                            shape="hex"
                            onClick={() =>
                              unlockAndEquipSkin(selectedSkinMeta.id, true)
                            }
                            className="!py-1 !px-2.5 !text-[9px]"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>EQUIPAR</span>
                          </MobaButton>
                        ) : (
                          <MobaButton
                            variant="cyan"
                            size="sm"
                            shape="hex"
                            onClick={() =>
                              unlockAndEquipSkin(selectedSkinMeta.id)
                            }
                            className="!py-1 !px-2.5 !text-[9px]"
                          >
                            <Gem className="h-3 w-3" />
                            <span>DESBLOQUEAR ({selectedSkinMeta.costWisdom}💎)</span>
                          </MobaButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT (7 cols): Champion Row + 8 Skins 2x4 Grid + Gifts */}
                <div className="col-span-7 flex flex-col justify-between h-full min-h-0 space-y-1.5">
                  {/* 1. Champion Switcher */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 shrink-0 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {AVATAR_OPTIONS.map((av) => {
                        const active = av.id === currentAvatar;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => updateAgentAppearance({ avatarId: av.id })}
                            className={`flex items-center gap-1 rounded-lg border px-1.5 py-0.5 cursor-pointer transition ${
                              active
                                ? "border-amber-400 bg-amber-500/20 text-amber-200 ring-1 ring-amber-300"
                                : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-600"
                            }`}
                          >
                            <HeroPortrait avatarId={av.id} size={22} shape="hex" active={active} />
                            <span className="text-[9px] font-black uppercase">{av.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateAgentAppearance({ name: nameDraft });
                      }}
                      className="flex items-center gap-1 shrink-0"
                    >
                      <input
                        type="text"
                        maxLength={24}
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        placeholder="Nick..."
                        className="w-24 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[9px] font-black text-white focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded border border-cyan-500/40 bg-cyan-500/15 px-1.5 py-0.5 text-[8.5px] font-black text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
                      >
                        Salvar
                      </button>
                    </form>
                  </div>

                  {/* 2. All 8 Skins Collection (2 rows x 4 cols = exactly 8!) */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 flex-1 min-h-0 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[8px] font-black tracking-widest text-amber-300 uppercase mb-1">
                      <span>Coleção de Skins 3D ({SKIN_OPTIONS.filter((s) => isSkinUnlocked(s.id)).length}/8 Liberadas)</span>
                      <span className="text-slate-400 font-normal">Toque para ver em 3D</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 flex-1 min-h-0 auto-rows-fr">
                      {SKIN_OPTIONS.map((sk) => {
                        const unlocked = isSkinUnlocked(sk.id);
                        const equipped = currentSkin === sk.id;
                        const previewing = activePreviewSkin === sk.id;

                        return (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() => {
                              playSfx("click");
                              setPreviewSkin(sk.id);
                              if (unlocked && currentSkin !== sk.id) {
                                unlockAndEquipSkin(sk.id, true);
                              }
                            }}
                            className={`relative flex flex-col justify-between rounded-lg border p-1 text-left transition cursor-pointer ${
                              sk.gradientClass
                            } ${
                              previewing
                                ? "border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.45)] ring-1 ring-amber-300"
                                : equipped
                                  ? "border-emerald-400/80 ring-1 ring-emerald-400/40"
                                  : unlocked
                                    ? "border-slate-700 hover:border-cyan-400"
                                    : "border-slate-800 opacity-70"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{sk.badgeEmoji}</span>
                              {equipped ? (
                                <span className="rounded bg-emerald-500/25 px-1 py-0.2 text-[7px] font-black text-emerald-300">
                                  EQUIPADA
                                </span>
                              ) : unlocked ? (
                                <CheckCircle2 className="h-3 w-3 text-cyan-300" />
                              ) : (
                                <span className="font-mono text-[7.5px] font-black text-amber-300">
                                  {sk.costWisdom}💎
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 min-w-0">
                              <div className="text-[6.5px] font-black uppercase truncate" style={{ color: sk.accentHex }}>
                                {sk.rarity}
                              </div>
                              <div className="text-[8px] font-black text-white truncate leading-tight">
                                {sk.name}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Quick Runes / Gifts Selector */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-1 shrink-0">
                    <div className="grid grid-cols-4 gap-1">
                      {GIFT_OPTIONS.map((g) => {
                        const active = g.id === currentGift;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => updateAgentAppearance({ giftId: g.id })}
                            className={`rounded border px-1.5 py-0.5 text-center cursor-pointer transition truncate ${
                              active
                                ? "border-amber-400 bg-amber-500/20 text-amber-200"
                                : "border-slate-800 bg-slate-950/75 text-slate-400 hover:border-slate-600"
                            }`}
                          >
                            <div className="text-[8px] font-black truncate">{g.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ORIGINAL DESKTOP BODY RESTORED */
              <div className="grid flex-1 overflow-y-auto gap-5 p-4 sm:p-6 lg:grid-cols-12">
              {/* LEFT (5 cols): Interactive 3D Character & Emote Showcase */}
              <div
                className={`flex flex-col justify-between gap-2.5 ${
                  isMobileLandscape ? "col-span-5" : "lg:col-span-5"
                }`}
              >
                <HeroPreview3D
                  avatarId={currentAvatar}
                  skinId={activePreviewSkin}
                  agentName={state.agent.name}
                  heightClass={
                    isMobileLandscape ? "h-36 sm:h-44" : "h-[340px] sm:h-[410px]"
                  }
                  showEmoteBar
                  compact={isMobileLandscape}
                />

                {/* Selected Skin Lore & Equip / Unlock CTA */}
                <div
                  className={`rounded-2xl border border-amber-400/35 bg-slate-900/90 ${
                    isMobileLandscape ? "p-2.5" : "p-4"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase ${
                        RARITY_BADGE_STYLE[selectedSkinMeta.rarity]
                      }`}
                    >
                      {selectedSkinMeta.badgeEmoji} SKIN{" "}
                      {selectedSkinMeta.rarity}
                    </span>

                    {isEquipped ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        EQUIPADA NO JOGO
                      </span>
                    ) : selectedUnlocked ? (
                      <span className="text-xs font-bold text-cyan-300">
                        DESBLOQUEADA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-amber-300">
                        <Gem className="h-3.5 w-3.5 text-cyan-300" />
                        {selectedSkinMeta.costWisdom} Cristais
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1.5 text-xl font-black text-white uppercase">
                    {selectedSkinMeta.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {selectedSkinMeta.tagline}
                  </p>

                  <div className="mt-3.5">
                    {isEquipped ? (
                      <MobaButton
                        variant="emerald"
                        size="md"
                        shape="hex"
                        onClick={onClose}
                        className="w-full"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        PRONTO • VOLTAR AO JOGO
                      </MobaButton>
                    ) : selectedUnlocked ? (
                      <MobaButton
                        variant="gold"
                        size="md"
                        shape="hex"
                        onClick={() =>
                          unlockAndEquipSkin(selectedSkinMeta.id, true)
                        }
                        className="w-full"
                      >
                        <Sparkles className="h-4 w-4" />
                        EQUIPAR SKIN 3D AGORA
                      </MobaButton>
                    ) : (
                      <MobaButton
                        variant="cyan"
                        size="md"
                        shape="hex"
                        onClick={() => unlockAndEquipSkin(selectedSkinMeta.id)}
                        className="w-full"
                      >
                        <Gem className="h-4 w-4" />
                        DESBLOQUEAR & EQUIPAR ({selectedSkinMeta.costWisdom} 💎)
                      </MobaButton>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT (7 cols): Champion Switcher, Nickname, Gift & 8 AAA Skins Grid */}
              <div
                className={`space-y-3 ${
                  isMobileLandscape ? "col-span-7" : "lg:col-span-7 space-y-5"
                }`}
              >
                {/* 1. Champion + Nickname Quick Switcher */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black tracking-widest text-cyan-300 uppercase">
                        1. Trocar Campeão Base & Codinome
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Você pode alternar entre os 4 campeões mantendo todas as
                        suas skins e XP!
                      </p>
                    </div>

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
                        className="w-36 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-black text-white focus:border-cyan-400 focus:outline-none sm:w-44"
                      />
                      <button
                        type="submit"
                        className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1.5 text-[11px] font-black text-cyan-200 hover:bg-cyan-500/25"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Salvar
                      </button>
                    </form>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2.5">
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
                          <HeroPortrait
                            avatarId={av.id}
                            size={52}
                            shape="hex"
                            active={active}
                          />
                          <span
                            className={`mt-1 text-xs font-black uppercase ${
                              active ? "text-amber-300" : "text-slate-300"
                            }`}
                          >
                            {av.name}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {av.styleTag}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. 8 AAA 3D Skins Collection Grid */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
                      2. Coleção de Skins 3D ({SKIN_OPTIONS.filter((s) => isSkinUnlocked(s.id)).length}/{SKIN_OPTIONS.length} Liberadas)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Clique para visualizar em 3D e equipar
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {SKIN_OPTIONS.map((sk) => {
                      const unlocked = isSkinUnlocked(sk.id);
                      const equipped = currentSkin === sk.id;
                      const previewing = activePreviewSkin === sk.id;

                      return (
                        <motion.button
                          key={sk.id}
                          type="button"
                          whileHover={{ scale: 1.04, y: -3 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            playSfx("click");
                            setPreviewSkin(sk.id);
                            if (unlocked && currentSkin !== sk.id) {
                              unlockAndEquipSkin(sk.id, true);
                            }
                          }}
                          className={`relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-3 text-left transition ${
                            sk.gradientClass
                          } ${
                            previewing
                              ? "border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.45)]"
                              : equipped
                                ? "border-emerald-400/80"
                                : unlocked
                                  ? "border-slate-700/90 hover:border-cyan-400/70"
                                  : "border-slate-800/90 opacity-85 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xl">{sk.badgeEmoji}</span>
                            {equipped ? (
                              <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[9px] font-black text-emerald-300">
                                EQUIPADA
                              </span>
                            ) : unlocked ? (
                              <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                            ) : (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-950/85 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300">
                                <Lock className="h-2.5 w-2.5" />
                                {sk.costWisdom}💎
                              </span>
                            )}
                          </div>

                          <div className="mt-3">
                            <div
                              className="text-[9px] font-black tracking-widest uppercase"
                              style={{ color: sk.accentHex }}
                            >
                              {sk.rarity}
                            </div>
                            <div className="mt-0.5 text-xs leading-snug font-black text-white">
                              {sk.name}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Passive Rune Quick Switcher */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3.5">
                  <div className="mb-2 text-[11px] font-black tracking-widest text-cyan-300 uppercase">
                    3. Runa Passiva Ativa (Dom Missionário)
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {GIFT_OPTIONS.map((g) => {
                      const active = g.id === currentGift;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            updateAgentAppearance({ giftId: g.id })
                          }
                          className={`cursor-pointer rounded-xl border px-2.5 py-2 text-left transition ${
                            active
                              ? "border-amber-400 bg-amber-500/20 text-amber-200"
                              : "border-slate-800 bg-slate-950/75 text-slate-400 hover:border-slate-600 hover:text-white"
                          }`}
                        >
                          <div className="text-[11px] font-black">{g.name}</div>
                          <div className="mt-0.5 text-[9px] opacity-80">
                            {g.verseRef}
                          </div>
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
