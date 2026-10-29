import { GameProvider } from "@/context/GameContext";
import { PwaProvider } from "@/context/PwaContext";
import { GameApp } from "@/components/GameApp";

export default function HomePage() {
  return (
    <PwaProvider>
      <GameProvider>
        <GameApp />
      </GameProvider>
    </PwaProvider>
  );
}
