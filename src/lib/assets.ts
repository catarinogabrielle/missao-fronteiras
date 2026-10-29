import { AvatarId } from "@/types/game";

export const HERO_PORTRAITS: Record<AvatarId, string> = {
  lucas: "/assets/heroes/lucas.jpg",
  sofia: "/assets/heroes/sofia.jpg",
  davi: "/assets/heroes/davi.jpg",
  ester: "/assets/heroes/ester.jpg",
};

export const NPC_PORTRAITS: Record<
  "caua" | "tariq" | "hina" | "samora" | "custom",
  string
> = {
  caua: "/assets/npcs/caua.jpg",
  tariq: "/assets/npcs/tariq.jpg",
  hina: "/assets/npcs/hina.jpg",
  samora: "/assets/npcs/samora.jpg",
  custom: "/assets/heroes/lucas.jpg",
};

export const MAP_SPLASHES: Record<string, string> = {
  amazonia: "/assets/maps/amazonia.jpg",
  janela1040: "/assets/maps/janela1040.jpg",
  toquio: "/assets/maps/toquio.jpg",
  mocambique: "/assets/maps/mocambique.jpg",
};

export function getMissionSplash(missionId: string): string {
  return MAP_SPLASHES[missionId] || MAP_SPLASHES.amazonia;
}
