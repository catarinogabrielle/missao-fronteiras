import { AvatarId, BiomeId } from "@/types/game";

export const HERO_PORTRAITS: Record<AvatarId, string> = {
  lucas: "/assets/heroes/lucas.png",
  sofia: "/assets/heroes/sofia.png",
  davi: "/assets/heroes/davi.png",
  ester: "/assets/heroes/ester.png",
};

export const NPC_PORTRAITS: Record<
  | "caua"
  | "tariq"
  | "hina"
  | "samora"
  | "mateus"
  | "yara"
  | "tenzin"
  | "amira"
  | "custom",
  string
> = {
  caua: "/assets/npcs/caua.jpg",
  tariq: "/assets/npcs/tariq.jpg",
  hina: "/assets/npcs/hina.jpg",
  samora: "/assets/npcs/samora.jpg",
  mateus: "/assets/npcs/caua.jpg",
  yara: "/assets/npcs/hina.jpg",
  tenzin: "/assets/npcs/tariq.jpg",
  amira: "/assets/npcs/samora.jpg",
  custom: "/assets/heroes/lucas.jpg",
};

export const MAP_SPLASHES: Record<string, string> = {
  amazonia: "/assets/maps/amazonia.jpg",
  janela1040: "/assets/maps/janela1040.jpg",
  toquio: "/assets/maps/toquio.jpg",
  mocambique: "/assets/maps/mocambique.jpg",
  sertao: "/assets/maps/amazonia.jpg",
  andes: "/assets/maps/janela1040.jpg",
  himalaia: "/assets/maps/toquio.jpg",
  europa: "/assets/maps/toquio.jpg",
};

export function resolveMissionBiome(
  missionId: string,
  biomeId?: BiomeId
): BiomeId {
  if (biomeId && MAP_SPLASHES[biomeId]) {
    return biomeId;
  }
  if (
    missionId === "amazonia" ||
    missionId === "janela1040" ||
    missionId === "toquio" ||
    missionId === "mocambique" ||
    missionId === "sertao" ||
    missionId === "andes" ||
    missionId === "himalaia" ||
    missionId === "europa"
  ) {
    return missionId as BiomeId;
  }
  return "amazonia";
}

export function getMissionSplash(
  missionId: string,
  biomeId?: BiomeId
): string {
  const resolved = resolveMissionBiome(missionId, biomeId);
  return MAP_SPLASHES[resolved] || MAP_SPLASHES.amazonia;
}
