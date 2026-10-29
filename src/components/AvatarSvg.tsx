"use client";

import React from "react";
import { AvatarId } from "@/types/game";

interface AgentAvatarProps {
  avatarId: AvatarId;
  size?: number;
  className?: string;
}

export function AgentAvatarSvg({
  avatarId,
  size = 64,
  className = "",
}: AgentAvatarProps) {
  switch (avatarId) {
    case "lucas":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="20" fill="#064E3B" />
          <circle cx="40" cy="40" r="34" fill="#10B981" fillOpacity="0.18" />
          {/* Shoulders / Field Vest */}
          <path
            d="M16 76C16 61 26 54 40 54C54 54 64 61 64 76"
            fill="#059669"
          />
          <path d="M29 55L40 69L51 55" fill="#FDE68A" />
          {/* Neck & Head */}
          <rect x="35" y="46" width="10" height="11" rx="4" fill="#D99B66" />
          <circle cx="40" cy="36" r="15" fill="#E5A975" />
          {/* Hair & Explorer Cap */}
          <path
            d="M24 31C24 21 31 16 40 16C49 16 56 21 56 31H24Z"
            fill="#10B981"
          />
          <rect x="22" y="29" width="38" height="4" rx="2" fill="#047857" />
          <circle cx="40" cy="23" r="3" fill="#FBBF24" />
          {/* Eyes & Smile */}
          <circle cx="34.5" cy="36" r="2.1" fill="#0F172A" />
          <circle cx="45.5" cy="36" r="2.1" fill="#0F172A" />
          <path
            d="M35 42.5C36.8 45 43.2 45 45 42.5"
            stroke="#0F172A"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        </svg>
      );

    case "sofia":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="20" fill="#083344" />
          <circle cx="40" cy="40" r="34" fill="#06B6D4" fillOpacity="0.2" />
          {/* Hair back */}
          <path
            d="M21 34C21 21 29 15 40 15C51 15 59 21 59 34V54H21V34Z"
            fill="#3B1D14"
          />
          {/* Urban Jacket */}
          <path
            d="M16 76C16 61 26 54 40 54C54 54 64 61 64 76"
            fill="#0891B2"
          />
          {/* Headphones on neck */}
          <rect x="28" y="51" width="7" height="7" rx="3.5" fill="#F43F5E" />
          <rect x="45" y="51" width="7" height="7" rx="3.5" fill="#F43F5E" />
          {/* Face */}
          <rect x="35" y="46" width="10" height="10" rx="4" fill="#F3C19D" />
          <circle cx="40" cy="36" r="14.5" fill="#FAD0B1" />
          {/* Bangs */}
          <path
            d="M25 32C27 23 35 19 44 21C50 22 54 27 55 32C50 28 43 27 36 29C31 30 28 32 25 32Z"
            fill="#3B1D14"
          />
          {/* Eyes & Smile */}
          <circle cx="34.5" cy="36.5" r="2.1" fill="#0F172A" />
          <circle cx="45.5" cy="36.5" r="2.1" fill="#0F172A" />
          <circle cx="31" cy="40.5" r="2.2" fill="#FB7185" fillOpacity="0.45" />
          <circle cx="49" cy="40.5" r="2.2" fill="#FB7185" fillOpacity="0.45" />
          <path
            d="M35.5 42.5C37.5 44.8 42.5 44.8 44.5 42.5"
            stroke="#0F172A"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "davi":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="20" fill="#451A03" />
          <circle cx="40" cy="40" r="34" fill="#F59E0B" fillOpacity="0.18" />
          {/* Tech Hoodie */}
          <path
            d="M16 76C16 61 26 54 40 54C54 54 64 61 64 76"
            fill="#D97706"
          />
          <path d="M34 55V72M46 55V72" stroke="#FEF3C7" strokeWidth="2" />
          {/* Neck & Head */}
          <rect x="35" y="46" width="10" height="10" rx="4" fill="#8D5524" />
          <circle cx="40" cy="36" r="15" fill="#A16632" />
          {/* Curly Fade Hair */}
          <path
            d="M25 31C24 22 31 15 40 15C49 15 56 22 55 31C51 26 46 25 40 25C34 25 29 26 25 31Z"
            fill="#1E293B"
          />
          {/* Tech Glasses */}
          <rect
            x="28"
            y="32"
            width="10.5"
            height="7.5"
            rx="2.5"
            stroke="#38BDF8"
            strokeWidth="2.2"
            fill="#0F172A"
            fillOpacity="0.3"
          />
          <rect
            x="41.5"
            y="32"
            width="10.5"
            height="7.5"
            rx="2.5"
            stroke="#38BDF8"
            strokeWidth="2.2"
            fill="#0F172A"
            fillOpacity="0.3"
          />
          <line
            x1="38.5"
            y1="35.5"
            x2="41.5"
            y2="35.5"
            stroke="#38BDF8"
            strokeWidth="2.2"
          />
          <circle cx="33.2" cy="35.8" r="1.6" fill="#F8FAFC" />
          <circle cx="46.8" cy="35.8" r="1.6" fill="#F8FAFC" />
          {/* Smile */}
          <path
            d="M35.5 43.5C37.5 45.8 42.5 45.8 44.5 43.5"
            stroke="#FFFBEB"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "ester":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="20" fill="#2E1065" />
          <circle cx="40" cy="40" r="34" fill="#A855F7" fillOpacity="0.2" />
          {/* Curly Voluminous Hair */}
          <circle cx="25" cy="35" r="9" fill="#1E1B4B" />
          <circle cx="55" cy="35" r="9" fill="#1E1B4B" />
          <circle cx="40" cy="22" r="12" fill="#1E1B4B" />
          {/* Jacket & Travel Scarf */}
          <path
            d="M16 76C16 61 26 54 40 54C54 54 64 61 64 76"
            fill="#7C3AED"
          />
          <path
            d="M28 53C32 58 48 58 52 53L50 61C44 64 36 64 30 61L28 53Z"
            fill="#FBBF24"
          />
          {/* Face */}
          <rect x="35" y="46" width="10" height="9" rx="4" fill="#B87A4B" />
          <circle cx="40" cy="36" r="14.5" fill="#C98A5B" />
          {/* Headband */}
          <path
            d="M26 29C31 23 49 23 54 29"
            stroke="#F472B6"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Eyes & Smile */}
          <circle cx="34.5" cy="36.5" r="2.1" fill="#0F172A" />
          <circle cx="45.5" cy="36.5" r="2.1" fill="#0F172A" />
          <path
            d="M35 42.5C37 45 43 45 45 42.5"
            stroke="#0F172A"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

interface NpcAvatarProps {
  avatarKey: "caua" | "tariq" | "hina" | "samora" | "custom";
  size?: number;
  className?: string;
}

export function NpcAvatarSvg({
  avatarKey,
  size = 76,
  className = "",
}: NpcAvatarProps) {
  switch (avatarKey) {
    case "caua":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="22" fill="#022C22" />
          <circle cx="40" cy="40" r="33" fill="#34D399" fillOpacity="0.16" />
          <path
            d="M17 76C17 61 27 54 40 54C53 54 63 61 63 76"
            fill="#0D9488"
          />
          {/* Straw/River Hat brim */}
          <ellipse cx="40" cy="24" rx="23" ry="6" fill="#F59E0B" />
          <path d="M26 24C26 16 32 13 40 13C48 13 54 16 54 24H26Z" fill="#D97706" />
          <circle cx="40" cy="37" r="14.5" fill="#C68652" />
          <path d="M26 32C30 27 50 27 54 32" stroke="#1E293B" strokeWidth="4" />
          <circle cx="34.5" cy="37" r="2.1" fill="#0F172A" />
          <circle cx="45.5" cy="37" r="2.1" fill="#0F172A" />
          <path
            d="M35.5 43.5C38 45.8 42 45.8 44.5 43.5"
            stroke="#0F172A"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "tariq":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="22" fill="#3B1704" />
          <circle cx="40" cy="40" r="33" fill="#FBBF24" fillOpacity="0.16" />
          {/* Jersey */}
          <path
            d="M17 76C17 61 27 54 40 54C53 54 63 61 63 76"
            fill="#E11D48"
          />
          <path d="M33 54L40 63L47 54" stroke="#10B981" strokeWidth="3" />
          <circle cx="40" cy="36" r="14.5" fill="#D49A6A" />
          {/* Styled dark hair */}
          <path
            d="M25 33C25 21 31 16 41 16C50 16 55 22 55 33C51 27 45 26 39 26C33 26 28 28 25 33Z"
            fill="#0F172A"
          />
          <circle cx="34.5" cy="36.5" r="2.1" fill="#0F172A" />
          <circle cx="45.5" cy="36.5" r="2.1" fill="#0F172A" />
          <path
            d="M35.5 43C38 44.8 42.5 44.8 45 43"
            stroke="#0F172A"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "hina":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="22" fill="#0C2438" />
          <circle cx="40" cy="40" r="33" fill="#38BDF8" fillOpacity="0.18" />
          {/* Long dark blue-black hair */}
          <rect x="22" y="20" width="36" height="38" rx="14" fill="#1E1B4B" />
          {/* School uniform collar */}
          <path
            d="M17 76C17 61 27 54 40 54C53 54 63 61 63 76"
            fill="#1E3A8A"
          />
          <path d="M31 55L40 65L49 55" stroke="#F8FAFC" strokeWidth="2.5" />
          <circle cx="40" cy="65" r="3" fill="#F43F5E" />
          {/* Face */}
          <circle cx="40" cy="36.5" r="14" fill="#FDE2CE" />
          {/* Straight bangs */}
          <path
            d="M25 32C26 21 33 18 40 18C47 18 54 21 55 32H25Z"
            fill="#1E1B4B"
          />
          <circle cx="34.5" cy="37.5" r="2.2" fill="#0F172A" />
          <circle cx="45.5" cy="37.5" r="2.2" fill="#0F172A" />
          <circle cx="30.5" cy="41" r="2.2" fill="#FDA4AF" fillOpacity="0.6" />
          <circle cx="49.5" cy="41" r="2.2" fill="#FDA4AF" fillOpacity="0.6" />
          <path
            d="M36.5 43.5C38.5 45.2 41.5 45.2 43.5 43.5"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "samora":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="22" fill="#2E1065" />
          <circle cx="40" cy="40" r="33" fill="#C084FC" fillOpacity="0.18" />
          {/* Vibrant Capulana-inspired shirt */}
          <path
            d="M17 76C17 61 27 54 40 54C53 54 63 61 63 76"
            fill="#F59E0B"
          />
          <path d="M27 62L33 56L40 63L47 56L53 62" stroke="#7C3AED" strokeWidth="3" />
          <circle cx="40" cy="36.5" r="14.5" fill="#7C4722" />
          <path
            d="M26 30C26 20 32 16 40 16C48 16 54 20 54 30C49 26 31 26 26 30Z"
            fill="#0F172A"
          />
          <circle cx="34.5" cy="36.5" r="2.2" fill="#0F172A" />
          <circle cx="45.5" cy="36.5" r="2.2" fill="#0F172A" />
          {/* Bright joyful smile */}
          <path
            d="M34 42.5C36.5 46.5 43.5 46.5 46 42.5Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          className={className}
        >
          <rect width="80" height="80" rx="22" fill="#0F172A" />
          <circle cx="40" cy="40" r="33" fill="#38BDF8" fillOpacity="0.18" />
          <path
            d="M17 76C17 61 27 54 40 54C53 54 63 61 63 76"
            fill="#2563EB"
          />
          <circle cx="40" cy="36" r="14.5" fill="#E2A77F" />
          <path
            d="M26 31C27 21 33 17 40 17C47 17 53 21 54 31H26Z"
            fill="#1E293B"
          />
          <circle cx="34.5" cy="36.5" r="2.1" fill="#0F172A" />
          <circle cx="45.5" cy="36.5" r="2.1" fill="#0F172A" />
          <path
            d="M35.5 43C38 45.2 42 45.2 44.5 43"
            stroke="#0F172A"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
