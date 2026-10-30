"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Languages,
  Lock,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AvatarId, GiftId, SkinId } from "@/types/game";
import {
  AVATAR_OPTIONS,
  GIFT_OPTIONS,
  SKIN_OPTIONS,
} from "@/data/avatarsAndGifts";
import { useGame } from "@/context/GameContext";
import { HeroPortrait } from "./GamePortrait";
import { HeroPreview3D } from "./HeroPreview3D";
import { MobaButton } from "./MobaButton";

interface OnboardingScreenProps {
  onOpenLeaderPanel: () => void;
}

export function OnboardingScreen({ onOpenLeaderPanel }: OnboardingScreenProps) {
  const {
    createAgent,
    selectProfile,
    isSkinUnlocked,
    playSfx,
    state,
    toggleMute,
  } = useGame();

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>("lucas");
  const [selectedSkin, setSelectedSkin] = useState<SkinId>("cyber_neon");
  const [previewSkin, setPreviewSkin] = useState<SkinId>("cyber_neon");
  const [selectedGift, setSelectedGift] = useState<GiftId>("acolhedor");

  const activeChampion =
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];
  const activeGift =
    GIFT_OPTIONS.find((g) => g.id === selectedGift) || GIFT_OPTIONS[0];
  const activeSkinMeta =
    SKIN_OPTIONS.find((s) => s.id === previewSkin) || SKIN_OPTIONS[0];
  const previewUnlocked = isSkinUnlocked(previewSkin);

  const renderGiftIcon = (
    iconName: (typeof GIFT_OPTIONS)[number]["iconName"]
  ) => {
    switch (iconName) {
      case "MessageSquareHeart":
        return <MessageSquareHeart className="h-4 w-4" />;
      case "HeartHandshake":
        return <HeartHandshake className="h-4 w-4" />;
      case "Languages":
        return <Languages className="h-4 w-4" />;
      case "Sparkles":
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSkin = isSkinUnlocked(previewSkin) ? previewSkin : selectedSkin;
    createAgent(
      name || `Agente ${activeChampion.name}`,
      selectedAvatar,
      selectedGift,
      finalSkin
    );
  };

  return (
    <div className="fixed inset-0 flex h-full h-dvh w-full flex-col justify-between overflow-hidden bg-slate-950 p-2 select-none touch-manipulation">
      {/* 1. TOP BAR (30px fixed) */}
      <header className="flex h-7 shrink-0 items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt="Logo"
            className="h-6 w-6 rounded-lg border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
          />
          <h1 className="bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-xs sm:text-sm font-black tracking-wide text-transparent uppercase">
            Missão Fronteiras: O Chamado
          </h1>
          <span className="hidden sm:inline-block text-[9px] font-bold text-amber-300/80 uppercase">
            • Seleção de Campeão 3D
          </span>
        </div>

        {/* Saved Profiles quick switcher */}
        {state.savedProfiles && state.savedProfiles.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-400">Salvos:</span>
            {state.savedProfiles.slice(0, 3).map((prof) => (
              <button
                key={prof.name}
                type="button"
                onClick={() => {
                  playSfx("levelUp");
                  selectProfile(prof);
                }}
                className="cursor-pointer rounded-lg border border-amber-400/50 bg-slate-900/90 px-2 py-0.5 text-[9px] font-black text-amber-300 hover:bg-amber-500/20"
              >
                {prof.name} ({prof.avatarId}) →
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <MobaButton
            variant="gold"
            size="sm"
            shape="slant"
            onClick={onOpenLeaderPanel}
            className="!py-0.5 !px-2 !text-[9px]"
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Líder</span>
          </MobaButton>

          <button
            type="button"
            onClick={toggleMute}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
          >
            {state.muted ? (
              <VolumeX className="h-3 w-3 text-rose-400" />
            ) : (
              <Volume2 className="h-3 w-3 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN WIDESCREEN CONSOLE STAGE (FITS 100% IN VIEWPORT) */}
      <form
        onSubmit={handleConfirm}
        className="grid flex-1 min-h-0 grid-cols-12 gap-2 mt-1 overflow-hidden"
      >
        {/* LEFT COLUMN (5 cols): Champion Selector + 3D Model + 8 Skins Strip */}
        <div className="col-span-5 moba-panel-gold moba-clip-panel flex flex-col justify-between h-full min-h-0 p-2 overflow-hidden">
          {/* Top: 4 Champion Hexagonal Avatars */}
          <div className="flex shrink-0 items-center justify-around border-b border-amber-500/20 pb-1">
            {AVATAR_OPTIONS.map((av) => {
              const isSelected = av.id === selectedAvatar;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setSelectedAvatar(av.id);
                  }}
                  className="group flex cursor-pointer flex-col items-center transition active:scale-90"
                >
                  <HeroPortrait
                    avatarId={av.id}
                    size={isSelected ? 34 : 28}
                    shape="hex"
                    active={isSelected}
                  />
                  <span
                    className={`mt-0.5 text-[8px] font-black uppercase ${
                      isSelected
                        ? "text-amber-300"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {av.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center: Live Interactive 3D Model Preview */}
          <div className="flex-1 min-h-0 my-0.5 flex items-center justify-center overflow-hidden">
            <HeroPreview3D
              avatarId={selectedAvatar}
              skinId={previewSkin}
              agentName={name || activeChampion.name}
              heightClass="h-full max-h-[160px]"
              showEmoteBar
              compact
            />
          </div>

          {/* Bottom: 8 Skins Selector Strip */}
          <div className="shrink-0 border-t border-amber-500/20 pt-1">
            <div className="mb-0.5 flex items-center justify-between px-0.5 text-[8px] font-black uppercase text-amber-300">
              <span>👕 Skin: {activeSkinMeta.name}</span>
              {!previewUnlocked && (
                <span className="text-cyan-300">
                  {activeSkinMeta.costWisdom}💎
                </span>
              )}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {SKIN_OPTIONS.map((sk) => {
                const unlocked = isSkinUnlocked(sk.id);
                const active = previewSkin === sk.id;
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setPreviewSkin(sk.id);
                      if (unlocked) {
                        setSelectedSkin(sk.id);
                      }
                    }}
                    title={`${sk.name} (${sk.rarity})`}
                    className={`relative flex h-6 cursor-pointer items-center justify-center rounded-md border text-[10px] transition ${
                      sk.gradientClass
                    } ${
                      active
                        ? "border-amber-300 shadow-[0_0_10px_#fbbf24]"
                        : unlocked
                          ? "border-slate-700 hover:border-cyan-400"
                          : "border-slate-800 opacity-60"
                    }`}
                  >
                    <span>{sk.badgeEmoji}</span>
                    {!unlocked && (
                      <Lock className="absolute right-0.5 bottom-0.5 h-1.5 w-1.5 text-amber-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Nickname + 4 Gift Runes + Confirm Play Button */}
        <div className="col-span-7 moba-panel-cyan moba-clip-panel flex flex-col justify-between h-full min-h-0 p-2.5 overflow-hidden">
          {/* Top: Summoner Nickname Input + Presets */}
          <div className="shrink-0">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
                1. Nome de Invocador / Equipe
              </label>
              <div className="flex items-center gap-1">
                {["Kaleb_BR", "Sofia_Ide", "Tribo Atos"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setName(preset)}
                    className="cursor-pointer rounded border border-slate-700 bg-slate-900/90 px-1.5 py-0.2 text-[8px] font-bold text-slate-300 hover:border-amber-400 hover:text-amber-300"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              maxLength={24}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu Nick ou Nome da Equipe..."
              className="w-full rounded-lg border-2 border-amber-500/40 bg-slate-950/90 px-3 py-1 text-xs font-black text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Center: 4 Runa/Gift Passives */}
          <div className="my-1 flex flex-1 min-h-0 flex-col justify-center">
            <label className="mb-1 text-[10px] font-black tracking-widest text-cyan-300 uppercase">
              2. Runa Passiva de Batalha (Dom Inicial)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {GIFT_OPTIONS.map((g) => {
                const active = g.id === selectedGift;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setSelectedGift(g.id);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-1 text-center transition ${
                      active
                        ? "border-amber-300 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.45)]"
                        : "border-slate-800 bg-slate-950/70 hover:border-slate-600"
                    }`}
                  >
                    <div className="mb-0.5">{renderGiftIcon(g.iconName)}</div>
                    <span
                      className={`text-[9px] font-black uppercase leading-tight ${
                        active ? "text-amber-300" : "text-slate-300"
                      }`}
                    >
                      {g.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Gift Description */}
            <div className="mt-1 rounded-lg border border-amber-500/20 bg-slate-950/80 px-2 py-0.5 text-[9px] text-slate-300">
              ⚡ <strong className="text-amber-300">{activeGift.name}:</strong>{" "}
              {activeGift.bonusDescription}
            </div>
          </div>

          {/* Bottom: The Giant Glowing Lock-In Button */}
          <div className="shrink-0">
            <MobaButton
              variant="gold"
              size="lg"
              shape="hex"
              type="submit"
              className="w-full !py-2.5 text-xs sm:text-sm font-black shadow-[0_0_24px_rgba(245,158,11,0.6)]"
            >
              <Sparkles className="h-4 w-4" />
              CONFIRMAR CAMPEÃO & ENTRAR NA BASE
            </MobaButton>
          </div>
        </div>
      </form>
    </div>
  );
}
