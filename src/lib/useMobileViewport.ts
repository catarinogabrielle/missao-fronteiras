"use client";

import { useCallback, useEffect, useState } from "react";

export interface MobileViewportInfo {
  isMobileDevice: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isMobileLandscape: boolean;
  isMobilePortrait: boolean;
  isCompactMobile: boolean;
  isFullscreen: boolean;
  width: number;
  height: number;
  toggleLandscapeFullscreen: () => Promise<"locked" | "rotate_manually" | "exited">;
}

function readViewportSnapshot() {
  if (typeof window === "undefined") {
    return {
      isMobileDevice: false,
      isLandscape: true,
      isPortrait: false,
      isMobileLandscape: false,
      isMobilePortrait: false,
      isCompactMobile: false,
      isFullscreen: false,
      width: 1280,
      height: 720,
    };
  }

  const vv = window.visualViewport;
  const w = Math.round(vv?.width ?? window.innerWidth);
  const h = Math.round(vv?.height ?? window.innerHeight);

  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const uaMobile =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      navigator.userAgent
    );
  const touchPoints =
    typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;

  const smallestSide = Math.min(w, h);
  const isMobileDevice =
    Boolean(uaMobile) ||
    (Boolean(coarsePointer || touchPoints) && smallestSide <= 920) ||
    smallestSide <= 540;

  const isLandscape = w > h;
  const isPortrait = !isLandscape;

  // Smartphone laid horizontally ("celular deitado"): typically 640-960px wide x 320-540px tall
  const isMobileLandscape =
    (isMobileDevice && isLandscape && h <= 600) || (isLandscape && h <= 520);
  const isMobilePortrait =
    (isMobileDevice && isPortrait && w <= 768) || (isPortrait && w < 640);
  const isCompactMobile = isMobileLandscape || isMobilePortrait;

  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  const isFullscreen = Boolean(
    doc.fullscreenElement || doc.webkitFullscreenElement
  );

  return {
    isMobileDevice,
    isLandscape,
    isPortrait,
    isMobileLandscape,
    isMobilePortrait,
    isCompactMobile,
    isFullscreen,
    width: w,
    height: h,
  };
}

export function useMobileViewport(): MobileViewportInfo {
  const [snap, setSnap] = useState(readViewportSnapshot);

  useEffect(() => {
    const sync = () => {
      setSnap(readViewportSnapshot());
    };

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    window.visualViewport?.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);

  const toggleLandscapeFullscreen = useCallback(async (): Promise<
    "locked" | "rotate_manually" | "exited"
  > => {
    if (typeof document === "undefined") return "rotate_manually";

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const root = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };

    const currentlyFs = Boolean(
      doc.fullscreenElement || doc.webkitFullscreenElement
    );

    if (currentlyFs) {
      try {
        const scrOrientation = screen.orientation as ScreenOrientation & {
          unlock?: () => void;
        };
        scrOrientation?.unlock?.();
      } catch {
        // ignore unlock errors
      }
      try {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      } catch {
        // ignore exit fullscreen errors
      }
      setSnap(readViewportSnapshot());
      return "exited";
    }

    // Request Fullscreen + Landscape Lock (supported on Android Chrome/Edge/PWA)
    try {
      if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else if (root.webkitRequestFullscreen) {
        await root.webkitRequestFullscreen();
      }
    } catch {
      // iOS Safari iPhone doesn't allow documentElement.requestFullscreen
    }

    let locked = false;
    try {
      const scrOrientation = screen.orientation as ScreenOrientation & {
        lock?: (mode: string) => Promise<void>;
      };
      if (scrOrientation?.lock) {
        await scrOrientation.lock("landscape");
        locked = true;
      }
    } catch {
      locked = false;
    }

    setSnap(readViewportSnapshot());
    if (locked || window.innerWidth > window.innerHeight) {
      return "locked";
    }
    return "rotate_manually";
  }, []);

  return {
    ...snap,
    toggleLandscapeFullscreen,
  };
}
