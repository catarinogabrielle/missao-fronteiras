"use client";

import React, { useState } from "react";
import { RotateCw, Smartphone } from "lucide-react";
import { Mission } from "@/types/game";
import { useGame } from "@/context/GameContext";
import { useMobileViewport } from "@/lib/useMobileViewport";
import { OnboardingScreen } from "./OnboardingScreen";
import { HeaderBar } from "./HeaderBar";
import { MissionHub } from "./MissionHub";
import { MissionEngine } from "./MissionEngine";
import { PassportModal } from "./PassportModal";
import { PocketBibleModal } from "./PocketBibleModal";
import { PrayerRadarModal } from "./PrayerRadarModal";
import { TribesQuizModal } from "./TribesQuizModal";
import { LeaderPanelModal } from "./LeaderPanelModal";
import { SkinWardrobeModal } from "./SkinWardrobeModal";
import { ToastOverlay } from "./ToastOverlay";

export function GameApp() {
  const { state, hydrated, switchUser } = useGame();
  const {
    isCompactMobile,
    isPortrait,
    toggleLandscapeFullscreen,
  } = useMobileViewport();

  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [passportOpen, setPassportOpen] = useState(false);
  const [bibleOpen, setBibleOpen] = useState(false);
  const [bibleTab, setBibleTab] = useState<"gospel" | "dictionary" | "school">(
    "gospel"
  );
  const [prayerRadarOpen, setPrayerRadarOpen] = useState(false);
  const [tribesQuizOpen, setTribesQuizOpen] = useState(false);
  const [leaderOpen, setLeaderOpen] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);

  const anyTopModalOpen =
    passportOpen ||
    bibleOpen ||
    prayerRadarOpen ||
    tribesQuizOpen ||
    leaderOpen ||
    wardrobeOpen;

  if (!hydrated) {
    return (
      <div className="bg-cyber-grid fixed inset-0 flex h-full h-dvh w-full items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_24px_rgba(34,211,238,0.45)]" />
          <p className="mt-3 font-mono text-xs font-black tracking-[0.25em] text-cyan-300 uppercase">
            Inicializando Engine 3D • Base Missionária Ide...
          </p>
        </div>
      </div>
    );
  }

  const hideHeaderOnMobilePlay = isCompactMobile && Boolean(activeMission);

  return (
    <div className="bg-cyber-grid fixed inset-0 flex h-full h-dvh w-full flex-col overflow-hidden text-slate-100 select-none">
      {!state.agent ? (
        <OnboardingScreen onOpenLeaderPanel={() => setLeaderOpen(true)} />
      ) : (
        <>
          {!hideHeaderOnMobilePlay && (
            <HeaderBar
              onOpenPassport={() => setPassportOpen(true)}
              onOpenLeaderPanel={() => setLeaderOpen(true)}
              onOpenWardrobe={() => setWardrobeOpen(true)}
              onSwitchUser={() => {
                setActiveMission(null);
                switchUser();
              }}
              onGoHome={() => setActiveMission(null)}
            />
          )}

          {activeMission ? (
            <MissionEngine
              key={activeMission.id}
              mission={activeMission}
              externalPaused={anyTopModalOpen}
              onOpenWardrobe={() => setWardrobeOpen(true)}
              onExitToHub={() => setActiveMission(null)}
              onSwitchUser={() => {
                setActiveMission(null);
                switchUser();
              }}
            />
          ) : (
            <MissionHub
              onSelectMission={(m) => setActiveMission(m)}
              onOpenPocketBible={(tab = "gospel") => {
                setBibleTab(tab);
                setBibleOpen(true);
              }}
              onOpenPrayerRadar={() => setPrayerRadarOpen(true)}
              onOpenTribesQuiz={() => setTribesQuizOpen(true)}
              onOpenPassport={() => setPassportOpen(true)}
              onOpenWardrobe={() => setWardrobeOpen(true)}
              onOpenLeaderPanel={() => setLeaderOpen(true)}
              onSwitchUser={() => {
                setActiveMission(null);
                switchUser();
              }}
            />
          )}
        </>
      )}

      {/* AAA Modals */}
      <PassportModal
        open={passportOpen}
        onClose={() => setPassportOpen(false)}
      />

      {bibleOpen && (
        <PocketBibleModal
          key={bibleTab}
          open={bibleOpen}
          initialTab={bibleTab}
          onClose={() => setBibleOpen(false)}
        />
      )}

      <PrayerRadarModal
        open={prayerRadarOpen}
        onClose={() => setPrayerRadarOpen(false)}
      />

      <TribesQuizModal
        open={tribesQuizOpen}
        onClose={() => setTribesQuizOpen(false)}
      />

      <SkinWardrobeModal
        open={wardrobeOpen}
        onClose={() => setWardrobeOpen(false)}
      />

      <LeaderPanelModal
        open={leaderOpen}
        onClose={() => setLeaderOpen(false)}
        onLaunchMission={(m) => setActiveMission(m)}
        onOpenTribesQuiz={() => setTribesQuizOpen(true)}
        onOpenWardrobe={() => setWardrobeOpen(true)}
        onAfterResetClass={() => setActiveMission(null)}
      />

      <ToastOverlay />

      {/* MANDATORY LANDSCAPE LOCK: GAME ONLY RUNS IN HORIZONTAL / LANDSCAPE WIDESCREEN! */}
      {isPortrait && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center backdrop-blur-lg">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-3xl bg-amber-500/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-400 bg-slate-900 shadow-[0_0_35px_rgba(251,191,36,0.45)]">
              <Smartphone className="h-10 w-10 text-amber-300 transition-transform duration-700 -rotate-90 animate-pulse" />
            </div>
          </div>

          <div className="rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 font-mono text-[10px] font-black tracking-widest text-amber-300 uppercase">
            MODO HORIZONTAL OBRIGATÓRIO
          </div>

          <h2 className="mt-3 text-xl font-black tracking-wide text-white uppercase sm:text-2xl">
            Gire o Celular na Horizontal
          </h2>
          <p className="mt-2 max-w-xs text-xs font-medium text-slate-300 leading-relaxed">
            Missão Fronteiras foi projetado para rodar exclusivamente deitado (widescreen), sem barra de rolagem e com visual amplo de console estilo League of Legends: Wild Rift!
          </p>

          <button
            type="button"
            onClick={toggleLandscapeFullscreen}
            className="mt-6 flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-6 py-3 font-mono text-xs font-black text-slate-950 shadow-[0_0_28px_rgba(251,191,36,0.65)] transition hover:scale-105 active:scale-95 uppercase tracking-wider"
          >
            <RotateCw className="h-4 w-4" />
            Girar Tela & Jogar
          </button>
        </div>
      )}
    </div>
  );
}
