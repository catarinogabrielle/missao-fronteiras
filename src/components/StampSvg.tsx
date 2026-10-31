"use client";

import React from "react";

export interface PassportStampProps {
  missionId: string;
  stampCode: string;
  title: string;
  accentColor:
    | "emerald"
    | "amber"
    | "cyan"
    | "violet"
    | "rose"
    | "sky"
    | "orange";
  size?: number;
}

const COLOR_MAP: Record<
  "emerald" | "amber" | "cyan" | "violet" | "rose" | "sky" | "orange",
  { stroke: string; fill: string; text: string }
> = {
  emerald: { stroke: "#10B981", fill: "rgba(16, 185, 129, 0.12)", text: "#6EE7B7" },
  amber: { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.12)", text: "#FCD34D" },
  cyan: { stroke: "#06B6D4", fill: "rgba(6, 182, 212, 0.12)", text: "#67E8F9" },
  violet: { stroke: "#A855F7", fill: "rgba(168, 85, 247, 0.12)", text: "#D8B4FE" },
  rose: { stroke: "#F43F5E", fill: "rgba(244, 63, 94, 0.12)", text: "#FDA4AF" },
  sky: { stroke: "#0EA5E9", fill: "rgba(14, 165, 233, 0.12)", text: "#7DD3FC" },
  orange: { stroke: "#F97316", fill: "rgba(249, 115, 22, 0.12)", text: "#FDBA74" },
};

export function PassportStampSvg({
  missionId,
  stampCode,
  title,
  accentColor,
  size = 112,
}: PassportStampProps) {
  const c = COLOR_MAP[accentColor] || COLOR_MAP.cyan;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className="select-none drop-shadow-[0_0_12px_rgba(16,185,129,0.2)]"
    >
      {/* Outer Retro Stamp Perforated Ring */}
      <circle
        cx="60"
        cy="60"
        r="54"
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth="3"
        strokeDasharray="6 4"
      />
      <circle
        cx="60"
        cy="60"
        r="45"
        stroke={c.stroke}
        strokeWidth="1.8"
        strokeOpacity="0.8"
      />

      {/* Pixel-Retro Icon Centerpiece */}
      {missionId === "amazonia" && (
        <g transform="translate(36, 30)">
          {/* Pixel Boat & River */}
          <rect x="12" y="18" width="24" height="6" fill={c.stroke} />
          <rect x="6" y="14" width="36" height="4" fill={c.text} />
          <rect x="20" y="4" width="4" height="10" fill={c.stroke} />
          <rect x="24" y="6" width="10" height="6" fill="#FBBF24" />
          <rect x="4" y="27" width="16" height="3" fill="#38BDF8" />
          <rect x="26" y="27" width="18" height="3" fill="#38BDF8" />
        </g>
      )}
      {missionId === "janela1040" && (
        <g transform="translate(36, 28)">
          {/* Pixel Arch & Star of Hope */}
          <rect x="8" y="20" width="32" height="10" fill={c.stroke} />
          <rect x="14" y="12" width="20" height="8" fill={c.text} />
          <rect x="21" y="4" width="6" height="8" fill="#FDE68A" />
          <rect x="20" y="22" width="8" height="8" fill="#020617" />
        </g>
      )}
      {missionId === "toquio" && (
        <g transform="translate(36, 28)">
          {/* Pixel Tower & Cherry Blossom */}
          <rect x="21" y="4" width="6" height="26" fill={c.stroke} />
          <rect x="15" y="16" width="18" height="5" fill={c.text} />
          <rect x="10" y="25" width="28" height="5" fill={c.stroke} />
          <rect x="8" y="8" width="6" height="6" fill="#F472B6" />
          <rect x="34" y="10" width="6" height="6" fill="#F472B6" />
        </g>
      )}
      {missionId === "mocambique" && (
        <g transform="translate(36, 28)">
          {/* Pixel Baobab/Acacia Tree & Open Bible */}
          <rect x="8" y="6" width="32" height="8" fill="#10B981" />
          <rect x="14" y="2" width="20" height="5" fill="#34D399" />
          <rect x="21" y="14" width="6" height="12" fill={c.stroke} />
          <rect x="12" y="24" width="11" height="7" fill="#F8FAFC" />
          <rect x="25" y="24" width="11" height="7" fill="#E2E8F0" />
        </g>
      )}
      {missionId !== "amazonia" &&
        missionId !== "janela1040" &&
        missionId !== "toquio" &&
        missionId !== "mocambique" && (
          <g transform="translate(38, 28)">
            {/* Pixel Cross & Globe */}
            <rect x="19" y="4" width="6" height="24" fill={c.text} />
            <rect x="12" y="11" width="20" height="6" fill={c.text} />
          </g>
        )}

      {/* Stamp Banner */}
      <rect
        x="14"
        y="66"
        width="92"
        height="18"
        rx="4"
        fill="#020617"
        stroke={c.stroke}
        strokeWidth="1.8"
      />
      <text
        x="60"
        y="78.5"
        textAnchor="middle"
        fill={c.text}
        fontSize="9.5"
        fontWeight="800"
        fontFamily="monospace"
        letterSpacing="1"
      >
        {stampCode}
      </text>
      <text
        x="60"
        y="96"
        textAnchor="middle"
        fill="#E2E8F0"
        fontSize="7.5"
        fontWeight="700"
        letterSpacing="0.6"
      >
        {title.slice(0, 16).toUpperCase()}
      </text>
    </svg>
  );
}
