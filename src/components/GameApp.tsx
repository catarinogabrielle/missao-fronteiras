"use client";

import React, { useState } from "react";
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
  const { isCompactMobile } = useMobileViewport();

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
    </div>
  );
}
