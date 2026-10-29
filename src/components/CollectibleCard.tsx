"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Mission } from "@/types/game";
import { getMissionSplash } from "@/lib/assets";
import { NpcPortrait } from "./GamePortrait";
import { PassportStampSvg } from "./StampSvg";

interface CollectibleCardProps {
  mission: Mission;
  agentName?: string;
}

export function CollectibleCard({ mission, agentName }: CollectibleCardProps) {
  const splash = getMissionSplash(mission.id);

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0, rotateY: -22 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      whileHover={{ scale: 1.035, rotateZ: 0.8 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="holo-card-border mx-auto w-full max-w-sm rounded-3xl p-[3.5px] shadow-[0_0_45px_rgba(245,158,11,0.38)]"
    >
      <div className="relative overflow-hidden rounded-[21px] bg-slate-950">
        {/* 3D Arena Splash Header Banner */}
        <div className="relative h-36 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={splash}
            alt={mission.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
          <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-slate-950/85 px-2.5 py-1 text-[10px] font-black tracking-wider text-amber-300 backdrop-blur">
              <Sparkles className="h-3 w-3" />
              {mission.collectibleCard.rarity}
            </span>
            <span className="rounded-lg bg-slate-950/80 px-2 py-0.5 font-mono text-xs font-black text-amber-200">
              #{String(mission.order).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="relative -mt-8 px-5 pb-5">
          {/* 3D Character Portrait & Stamp */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <NpcPortrait
                avatarKey={mission.npc.avatarKey}
                size={74}
                shape="hex"
              />
              <div className="pb-1">
                <div className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                  {mission.collectibleCard.regionBadge}
                </div>
                <h4 className="text-base leading-tight font-black text-white">
                  {mission.collectibleCard.title}
                </h4>
                <p className="text-xs text-slate-300">
                  Aliado: {mission.npc.name} ({mission.npc.age}a)
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <PassportStampSvg
                missionId={mission.id}
                stampCode={mission.stampCode}
                title={mission.country}
                accentColor={mission.accentColor}
                size={58}
              />
            </div>
          </div>

          {/* Quote */}
          <blockquote className="my-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100 italic">
            &ldquo;{mission.collectibleCard.powerQuote}&rdquo;
          </blockquote>

          {/* Footer metadata */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              {mission.decoder.verseReference}
            </span>
            {agentName && (
              <span className="font-mono text-slate-400">
                Campeão: <strong className="text-amber-200">{agentName}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
