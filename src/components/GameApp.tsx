"use client";

import React, { useState } from "react";
import { Mission } from "@/types/game";
import { useGame } from "@/context/GameContext";
import { OnboardingScreen } from "./OnboardingScreen";
import { HeaderBar } from "./HeaderBar";
import { MissionHub } from "./MissionHub";
import { MissionEngine } from "./MissionEngine";
import { PassportModal } from "./PassportModal";
import { PocketBibleModal } from "./PocketBibleModal";
import { PrayerRadarModal } from "./PrayerRadarModal";
import { TribesQuizModal } from "./TribesQuizModal";
import { LeaderPanelModal } from "./LeaderPanelModal";
import { ToastOverlay } from "./ToastOverlay";

export function GameApp() {
  const { state, hydrated } = useGame();

  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [passportOpen, setPassportOpen] = useState(false);
  const [bibleOpen, setBibleOpen] = useState(false);
  const [bibleTab, setBibleTab] = useState<"gospel" | "dictionary" | "school">(
    "gospel"
  );
  const [prayerRadarOpen, setPrayerRadarOpen] = useState(false);
  const [tribesQuizOpen, setTribesQuizOpen] = useState(false);
  const [leaderOpen, setLeaderOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="bg-cyber-grid flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="mt-3 font-mono text-xs font-bold tracking-widest text-cyan-300 uppercase">
            Conectando à Base Missionária Ide...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cyber-grid flex min-h-screen flex-col text-slate-100">
      {!state.agent ? (
        <OnboardingScreen onOpenLeaderPanel={() => setLeaderOpen(true)} />
      ) : (
        <>
          <HeaderBar
            onOpenPassport={() => setPassportOpen(true)}
            onOpenLeaderPanel={() => setLeaderOpen(true)}
            onGoHome={() => setActiveMission(null)}
          />

          {activeMission ? (
            <MissionEngine
              key={activeMission.id}
              mission={activeMission}
              onExitToHub={() => setActiveMission(null)}
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
            />
          )}
        </>
      )}

      {/* Modals */}
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

      <LeaderPanelModal
        open={leaderOpen}
        onClose={() => setLeaderOpen(false)}
      />

      <ToastOverlay />
    </div>
  );
}
