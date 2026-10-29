"use client";

import React, { useState } from "react";
import { AvatarId } from "@/types/game";
import { HERO_PORTRAITS, NPC_PORTRAITS } from "@/lib/assets";
import { AgentAvatarSvg, NpcAvatarSvg } from "./AvatarSvg";

interface HeroPortraitProps {
  avatarId: AvatarId;
  size?: number;
  shape?: "circle" | "hex" | "card";
  active?: boolean;
  className?: string;
}

export function HeroPortrait({
  avatarId,
  size = 64,
  shape = "circle",
  active = false,
  className = "",
}: HeroPortraitProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = HERO_PORTRAITS[avatarId];

  const shapeClass =
    shape === "hex"
      ? "moba-clip-hex"
      : shape === "circle"
        ? "rounded-full"
        : "rounded-2xl";

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 p-[2.5px] ${shapeClass} ${
        active
          ? "bg-gradient-to-b from-amber-200 via-amber-400 to-cyan-400 shadow-[0_0_24px_rgba(245,158,11,0.65)]"
          : "bg-gradient-to-b from-amber-400/80 via-amber-600/70 to-slate-800"
      } ${className}`}
    >
      <div
        className={`relative h-full w-full overflow-hidden bg-slate-950 ${shapeClass}`}
      >
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={avatarId}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <AgentAvatarSvg avatarId={avatarId} size={size} />
        )}
      </div>
    </div>
  );
}

interface NpcPortraitProps {
  avatarKey: "caua" | "tariq" | "hina" | "samora" | "custom";
  size?: number;
  shape?: "circle" | "hex" | "card";
  className?: string;
}

export function NpcPortrait({
  avatarKey,
  size = 76,
  shape = "circle",
  className = "",
}: NpcPortraitProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = NPC_PORTRAITS[avatarKey];

  const shapeClass =
    shape === "hex"
      ? "moba-clip-hex"
      : shape === "circle"
        ? "rounded-full"
        : "rounded-2xl";

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 bg-gradient-to-b from-cyan-300 via-teal-500 to-amber-600 p-[2.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)] ${shapeClass} ${className}`}
    >
      <div
        className={`relative h-full w-full overflow-hidden bg-slate-950 ${shapeClass}`}
      >
        {avatarKey !== "custom" && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={avatarKey}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <NpcAvatarSvg avatarKey={avatarKey} size={size} />
        )}
      </div>
    </div>
  );
}
