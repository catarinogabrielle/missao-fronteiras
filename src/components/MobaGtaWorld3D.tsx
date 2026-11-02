"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { AvatarId, HeroEmoteType, Mission, SkinId } from "@/types/game";
import { resolveMissionBiome } from "@/lib/assets";
import { soundEngine } from "@/lib/sound";
import {
  createBuildingFacadeTexture,
  createCrosswalkTexture,
  createRoadTexture,
  createSidewalkTexture,
  createSkyDomeTexture,
  createStoreSignTexture,
  createTerrainTexture,
} from "@/lib/textures3d";
import {
  animateHumanRig,
  ArticulatedRig,
  buildStylizedHumanRig,
  createGtaVehicle3D,
  createNameplateSprite,
  createPlayableChampion3D,
  createShadowEnemyRig,
} from "@/lib/character3d";
import {
  getOpenWorldConfig,
  RadioTowerMission,
  StreetPersonQuest,
  VehicleSpawnConfig,
} from "@/lib/worldData";

export type CombatActionType =
  | "attack"
  | "skillQ"
  | "skillW"
  | "skillE"
  | "skillR"
  | "vehicle"
  | "vehicleSwap"
  | "vehicleCar"
  | "vehicleMoto"
  | "nitro"
  | "camera"
  | "interact"
  | "emoteSlash"
  | "emoteVictory"
  | "emoteDance"
  | "emotePray";

export interface CombatTrigger {
  id: number;
  action: CombatActionType;
}

export interface WorldFloatingPopup {
  id: number;
  text: string;
  color: string;
}

export interface RadarEntityDot {
  x: number;
  z: number;
  kind:
    | "enemy"
    | "boss"
    | "person"
    | "tower"
    | "race"
    | "vehicle"
    | "mainNpc"
    | "scroll"
    | "nexus"
    | "partner"
    | "totem";
  done?: boolean;
}

export interface NearbyInteractionInfo {
  kind: "mainNpc" | "person" | "totem" | "nexus" | "tower" | "race";
  id: string;
  label: string;
  person?: StreetPersonQuest;
  tower?: RadioTowerMission;
}

export interface WorldHudSnapshot {
  heroX: number;
  heroZ: number;
  heroAngle: number;
  isMoving?: boolean;
  hp: number;
  maxHp: number;
  inVehicle: boolean;
  activeVehicleName: string;
  cameraMode: "gta" | "moba";
  nitroCooldown: number;
  score: number;
  combo: number;
  suppliesHeld: number;
  scrollsCollected: number;
  totalScrolls: number;
  enemiesDefeated: number;
  totalEnemies: number;
  bossDefeated: boolean;
  bossHpPct: number;
  bossNear?: boolean;
  helpedPersonIds: string[];
  activatedTowerIds: string[];
  totalTowers: number;
  raceActive: boolean;
  raceCompleted: boolean;
  raceTimeLeft: number;
  raceCheckpointIdx: number;
  raceTotalCheckpoints: number;
  cooldowns: { q: number; w: number; e: number; r: number };
  nearby: NearbyInteractionInfo | null;
  dots: RadarEntityDot[];
  /** Garage system: which vehicle class is being driven right now */
  vehicleKind: VehicleClass | null;
  /** Next vehicle class that will be summoned with the Vehicle button */
  preferredVehicle: VehicleClass;
  /** Remaining vehicle units (tanks) per class, including the one in use */
  garage: { car: number; moto: number };
  /** Seconds remaining in the current tank of each class */
  fuel: { car: number; moto: number };
  /** Basic attack energy charges (recharge over time) */
  attackCharges: number;
  attackMaxCharges: number;
  /** 0..1 progress until the next attack charge returns */
  attackRechargePct: number;
  /** >0 while the hero is flashing from taking damage */
  hurtFlash: number;
}

export type VehicleClass = "car" | "moto";

/** Garage rules: how many vehicles of each class and how long each one lasts */
export const VEHICLE_RULES: Record<
  VehicleClass,
  { units: number; seconds: number; label: string; emoji: string }
> = {
  car: { units: 2, seconds: 45, label: "Carro", emoji: "🚙" },
  moto: { units: 3, seconds: 30, label: "Moto", emoji: "🏍️" },
};

/** Basic attack energy rules */
export const ATTACK_MAX_CHARGES = 6;
export const ATTACK_RECHARGE_SECONDS = 1.2;

export const WORLD_LANDMARKS = {
  spawn: { x: 0, z: 68 },
  totem: { x: -12, z: 54 },
  raceStart: { x: 18, z: 54 },
  mainNpc: { x: 0, z: 0 },
  boss: { x: 0, z: -42 },
  nexus: { x: 0, z: -74 },
};

interface MobaGtaWorld3DProps {
  mission: Mission;
  avatarId: AvatarId;
  skinId: SkinId;
  agentName: string;
  playerLevel?: number;
  dialogueCompleted: boolean;
  helpedPersonIds: string[];
  activatedTowerIds: string[];
  raceCompleted: boolean;
  paused: boolean;
  joystickVec: { x: number; y: number };
  combatTrigger: CombatTrigger | null;
  gpsTarget: { x: number; z: number };
  onHudUpdate: (snap: WorldHudSnapshot) => void;
  onPopup: (popup: WorldFloatingPopup) => void;
  onInteractTrigger: (info: NearbyInteractionInfo, suppliesHeld: number) => boolean;
  onTowerActivated: (tower: RadioTowerMission) => void;
  onRaceCompleted: () => void;
  onEarnRewards: (xp: number, wisdom: number) => void;
  coopPartner?: {
    name: string;
    role: "driver" | "guardian";
    avatarId: AvatarId;
    skinId?: SkinId;
  } | null;
  coopPartnerPosition?: {
    x: number;
    z: number;
    angle: number;
    inVehicle: boolean;
    speed: number;
  } | null;
  onCoopCargoDamage?: (damage: number) => void;
}

export function MobaGtaWorld3D({
  mission,
  avatarId,
  skinId,
  agentName,
  playerLevel = 1,
  dialogueCompleted,
  helpedPersonIds,
  activatedTowerIds,
  raceCompleted,
  paused,
  joystickVec,
  combatTrigger,
  gpsTarget,
  onHudUpdate,
  onPopup,
  onInteractTrigger,
  onTowerActivated,
  onRaceCompleted,
  onEarnRewards,
  coopPartner,
  coopPartnerPosition,
  onCoopCargoDamage,
}: MobaGtaWorld3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroHolderRef = useRef<THREE.Group | null>(null);
  const heroRigRef = useRef<ArticulatedRig | null>(null);
  const avatarIdRef = useRef(avatarId);
  const skinIdRef = useRef(skinId);
  const agentNameRef = useRef(agentName);

  const coopPartnerRef = useRef(coopPartner);
  const coopPartnerPosRef = useRef(coopPartnerPosition);
  const onCoopCargoDamageRef = useRef(onCoopCargoDamage);

  useEffect(() => {
    coopPartnerRef.current = coopPartner;
  }, [coopPartner]);
  useEffect(() => {
    coopPartnerPosRef.current = coopPartnerPosition;
  }, [coopPartnerPosition]);
  useEffect(() => {
    onCoopCargoDamageRef.current = onCoopCargoDamage;
  }, [onCoopCargoDamage]);

  const pausedRef = useRef(paused);
  const dialogueDoneRef = useRef(dialogueCompleted);
  const helpedIdsRef = useRef<string[]>(helpedPersonIds);
  const towerIdsRef = useRef<string[]>(activatedTowerIds);
  const raceDoneRef = useRef(raceCompleted);
  const joystickRef = useRef(joystickVec);
  const gpsTargetRef = useRef(gpsTarget);
  const onHudUpdateRef = useRef(onHudUpdate);
  const onPopupRef = useRef(onPopup);
  const onInteractRef = useRef(onInteractTrigger);
  const onTowerRef = useRef(onTowerActivated);
  const onRaceRef = useRef(onRaceCompleted);
  const onEarnRef = useRef(onEarnRewards);

  const triggerActionFnRef = useRef<((act: CombatActionType) => void) | null>(
    null
  );

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    dialogueDoneRef.current = dialogueCompleted;
  }, [dialogueCompleted]);
  useEffect(() => {
    helpedIdsRef.current = helpedPersonIds;
  }, [helpedPersonIds]);
  useEffect(() => {
    towerIdsRef.current = activatedTowerIds;
  }, [activatedTowerIds]);
  useEffect(() => {
    raceDoneRef.current = raceCompleted;
  }, [raceCompleted]);
  useEffect(() => {
    joystickRef.current = joystickVec;
  }, [joystickVec]);
  useEffect(() => {
    gpsTargetRef.current = gpsTarget;
  }, [gpsTarget]);
  useEffect(() => {
    onHudUpdateRef.current = onHudUpdate;
  }, [onHudUpdate]);
  useEffect(() => {
    onPopupRef.current = onPopup;
  }, [onPopup]);
  useEffect(() => {
    onInteractRef.current = onInteractTrigger;
  }, [onInteractTrigger]);
  useEffect(() => {
    onTowerRef.current = onTowerActivated;
  }, [onTowerActivated]);
  useEffect(() => {
    onRaceRef.current = onRaceCompleted;
  }, [onRaceCompleted]);
  useEffect(() => {
    onEarnRef.current = onEarnRewards;
  }, [onEarnRewards]);

  useEffect(() => {
    if (!combatTrigger) return;
    triggerActionFnRef.current?.(combatTrigger.action);
  }, [combatTrigger]);

  // Live reactive 3D Champion & Skin Swapper (zero mission reset!)
  useEffect(() => {
    avatarIdRef.current = avatarId;
    skinIdRef.current = skinId;
    agentNameRef.current = agentName;

    const holder = heroHolderRef.current;
    if (!holder) return;
    holder.clear();
    const updatedRig = createPlayableChampion3D(
      avatarId,
      agentName,
      skinId,
      true
    );
    holder.add(updatedRig.root);
    heroRigRef.current = updatedRig;
  }, [avatarId, skinId, agentName]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resolvedBiome = resolveMissionBiome(mission.id, mission.biomeId);
    const worldCfg = getOpenWorldConfig(mission.id, mission.biomeId);
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();

    const palette = (() => {
      switch (resolvedBiome) {
        case "amazonia":
          return {
            fog: 0x164e63,
            sun: 0xffe4a0,
            accent: 0x10b981,
            bldgBase1: "#7c4a27",
            bldgBase2: "#5c3419",
            bldgWin: "#fef08a",
            modern: false,
            treeColor: 0x15803d,
            awningColors: [0x10b981, 0x0284c7, 0xd97706],
          };
        case "janela1040":
          return {
            fog: 0x451a03,
            sun: 0xffcfa0,
            accent: 0xf59e0b,
            bldgBase1: "#d4a373",
            bldgBase2: "#b88454",
            bldgWin: "#fef08a",
            modern: false,
            treeColor: 0x166534,
            awningColors: [0xe11d48, 0xd97706, 0x0284c7],
          };
        case "toquio":
          return {
            fog: 0x0b132b,
            sun: 0xdbeafe,
            accent: 0x06b6d4,
            bldgBase1: "#1e293b",
            bldgBase2: "#0f172a",
            bldgWin: "#38bdf8",
            modern: true,
            treeColor: 0xf472b6,
            awningColors: [0x06b6d4, 0xf43f5e, 0x8b5cf6],
          };
        case "sertao":
          return {
            fog: 0x431407,
            sun: 0xfef08a,
            accent: 0xd97706,
            bldgBase1: "#9a3412",
            bldgBase2: "#78350f",
            bldgWin: "#fde047",
            modern: false,
            treeColor: 0x15803d,
            awningColors: [0xd97706, 0x16a34a, 0xe11d48],
          };
        case "andes":
          return {
            fog: 0x0f172a,
            sun: 0xe0f2fe,
            accent: 0x0284c7,
            bldgBase1: "#475569",
            bldgBase2: "#334155",
            bldgWin: "#fed7aa",
            modern: false,
            treeColor: 0x166534,
            awningColors: [0xef4444, 0xf59e0b, 0x0284c7],
          };
        case "himalaia":
          return {
            fog: 0x082f49,
            sun: 0xf8fafc,
            accent: 0x38bdf8,
            bldgBase1: "#64748b",
            bldgBase2: "#475569",
            bldgWin: "#fef08a",
            modern: false,
            treeColor: 0x0f766e,
            awningColors: [0xef4444, 0x38bdf8, 0xfacc15],
          };
        case "europa":
          return {
            fog: 0x1e1b4b,
            sun: 0xfef3c7,
            accent: 0x8b5cf6,
            bldgBase1: "#334155",
            bldgBase2: "#1e293b",
            bldgWin: "#fef08a",
            modern: false,
            treeColor: 0x047857,
            awningColors: [0x3b82f6, 0x10b981, 0xf59e0b],
          };
        default:
          return {
            fog: 0x3b1d2a,
            sun: 0xffd89b,
            accent: 0xa855f7,
            bldgBase1: "#b46939",
            bldgBase2: "#925229",
            bldgWin: "#fde68a",
            modern: false,
            treeColor: 0x65a30d,
            awningColors: [0xf59e0b, 0x10b981, 0x8b5cf6],
          };
      }
    })();

    scene.fog = new THREE.FogExp2(palette.fog, 0.0044);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 360);
    // Start game immediately in AAA 3D 3rd-person street camera (Câmera 3D GTA)
    camera.position.set(WORLD_LANDMARKS.spawn.x, 5.8, WORLD_LANDMARKS.spawn.z + 11.2);
    camera.lookAt(WORLD_LANDMARKS.spawn.x, 2.1, WORLD_LANDMARKS.spawn.z - 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // --- 360° PROCEDURAL REALISTIC SKY DOME ---
    const skyTex = createSkyDomeTexture(resolvedBiome);
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(210, 32, 20),
      new THREE.MeshBasicMaterial({
        map: skyTex,
        side: THREE.BackSide,
        fog: false,
      })
    );
    scene.add(skyDome);

    // Rich GTA Atmospheric Lighting
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 1.12);
    scene.add(hemi);

    const ambientFill = new THREE.AmbientLight(0xfff7ed, 0.45);
    scene.add(ambientFill);

    const sun = new THREE.DirectionalLight(palette.sun, 2.05);
    sun.position.set(45, 70, 42);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 210;
    const sd = 78;
    sun.shadow.camera.left = -sd;
    sun.shadow.camera.right = sd;
    sun.shadow.camera.top = sd;
    sun.shadow.camera.bottom = -sd;
    scene.add(sun);

    // --- MASSIVE 220 x 220 OPEN-WORLD TERRAIN ---
    const terrainTex = createTerrainTexture(resolvedBiome);
    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(230, 230),
      new THREE.MeshStandardMaterial({ map: terrainTex, roughness: 0.88 })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // --- FULL GTA URBAN GRID: 3 N-S AVENUES x 4 E-W AVENUES + ZEBRA CROSSWALKS ---
    const roadTexNS = createRoadTexture(resolvedBiome);
    const roadMatNS = new THREE.MeshStandardMaterial({
      map: roadTexNS,
      roughness: 0.65,
    });

    const nsAvenues = [-46, 0, 46];
    const ewAvenues = [54, 18, -18, -54];

    nsAvenues.forEach((rx) => {
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(11.4, 204),
        roadMatNS
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(rx, 0.03, 0);
      road.receiveShadow = true;
      scene.add(road);
    });

    ewAvenues.forEach((rz) => {
      const ewTex = roadTexNS.clone();
      ewTex.needsUpdate = true;
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(11.0, 204),
        new THREE.MeshStandardMaterial({ map: ewTex, roughness: 0.65 })
      );
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = Math.PI / 2;
      road.position.set(0, 0.035, rz);
      road.receiveShadow = true;
      scene.add(road);
    });

    // 12 Zebra Crosswalk Intersections + Traffic Lights!
    const crossTex = createCrosswalkTexture();
    const crossMat = new THREE.MeshStandardMaterial({
      map: crossTex,
      roughness: 0.6,
    });

    const trafficPoleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
    });

    nsAvenues.forEach((ix) => {
      ewAvenues.forEach((iz, zIdx) => {
        const cw = new THREE.Mesh(
          new THREE.PlaneGeometry(11.6, 11.4),
          crossMat
        );
        cw.rotation.x = -Math.PI / 2;
        cw.position.set(ix, 0.045, iz);
        scene.add(cw);

        // GTA Traffic Light at intersection corners
        if (resolvedBiome !== "amazonia" && (ix === 0 || zIdx % 2 === 0)) {
          const tlGroup = new THREE.Group();
          tlGroup.position.set(ix + 6.4, 0, iz - 6.4);

          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.14, 5.2, 10),
            trafficPoleMat
          );
          pole.position.y = 2.6;
          tlGroup.add(pole);

          const arm = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 0.12, 0.12),
            trafficPoleMat
          );
          arm.position.set(-1.2, 5.05, 0);
          tlGroup.add(arm);

          const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 1.05, 0.32),
            trafficPoleMat
          );
          box.position.set(-2.2, 4.85, 0);
          tlGroup.add(box);

          [
            { y: 5.15, col: 0xef4444 },
            { y: 4.85, col: 0xfacc15 },
            { y: 4.55, col: 0x22c55e },
          ].forEach((lamp) => {
            const lMesh = new THREE.Mesh(
              new THREE.SphereGeometry(0.11, 8, 8),
              new THREE.MeshBasicMaterial({ color: lamp.col })
            );
            lMesh.position.set(-2.2, lamp.y, 0.16);
            tlGroup.add(lMesh);
          });

          scene.add(tlGroup);
        }
      });
    });

    // --- RAISED CONCRETE / TILED SIDEWALK CITY BLOCKS ---
    const sidewalkTex = createSidewalkTexture(resolvedBiome);
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: sidewalkTex,
      roughness: 0.72,
    });

    const blockColumns = [-72, -23, 23, 72];
    const blockRows = [36, 0, -36, -72];

    blockColumns.forEach((bx) => {
      blockRows.forEach((bz) => {
        // Leave river corridor open in Amazonia around z = 27..36? River is at z=27, so shrink z=36 sidewalk slightly
        if (resolvedBiome === "amazonia" && bz === 36) return;
        const swW = Math.abs(bx) > 50 ? 28 : 31;
        const swD = 22;
        const sw = new THREE.Mesh(
          new THREE.BoxGeometry(swW, 0.22, swD),
          sidewalkMat
        );
        sw.position.set(bx, 0.11, bz);
        sw.receiveShadow = true;
        scene.add(sw);
      });
    });

    // --- CENTRAL FOUNTAIN PARK PLAZA AT (0, 0) ---
    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(13.5, 14, 0.2, 44),
      sidewalkMat
    );
    plaza.position.set(0, 0.1, 0);
    plaza.receiveShadow = true;
    scene.add(plaza);

    const plazaRing = new THREE.Mesh(
      new THREE.RingGeometry(12.2, 12.9, 44),
      new THREE.MeshBasicMaterial({
        color: palette.accent,
        side: THREE.DoubleSide,
      })
    );
    plazaRing.rotation.x = -Math.PI / 2;
    plazaRing.position.y = 0.22;
    scene.add(plazaRing);

    // 3D Sculpted Multi-Tier Water Fountain right behind Main NPC at (0, -5.2)
    const fountain = new THREE.Group();
    fountain.position.set(0, 0.2, -5.2);
    const basinWall = new THREE.Mesh(
      new THREE.CylinderGeometry(2.7, 2.9, 0.55, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.45 })
    );
    basinWall.position.y = 0.27;
    fountain.add(basinWall);
    const basinWater = new THREE.Mesh(
      new THREE.CylinderGeometry(2.45, 2.45, 0.48, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        roughness: 0.12,
      })
    );
    basinWater.position.y = 0.34;
    fountain.add(basinWater);
    const fountainPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.52, 2.1, 16),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1 })
    );
    fountainPillar.position.y = 1.1;
    fountain.add(fountainPillar);
    const fountainSpout = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
    );
    fountainSpout.position.y = 2.25;
    fountain.add(fountainSpout);
    scene.add(fountain);

    // --- 22 MULTI-PART REALISTIC GTA BUILDINGS WITH STOREFRONTS, AWNINGS & SIGNS ---
    const buildingColliders: { x: number; z: number; rx: number; rz: number }[] =
      [];

    // Add fountain collider
    buildingColliders.push({ x: 0, z: -5.2, rx: 3.1, rz: 3.1 });

    const facade1 = createBuildingFacadeTexture(
      palette.bldgBase1,
      palette.bldgWin,
      palette.modern
    );
    const facade2 = createBuildingFacadeTexture(
      palette.bldgBase2,
      resolvedBiome === "toquio" ? "#f472b6" : "#38bdf8",
      palette.modern
    );

    const signTextures = worldCfg.storeSigns.map((sText, idx) =>
      createStoreSignTexture(
        sText,
        idx % 2 === 0 ? "#0f172a" : "#1e1b4b",
        idx % 2 === 0 ? "#38bdf8" : "#fbbf24"
      )
    );

    const buildingDefinitions: [number, number, number, number, number][] = [
      // South-Mid Blocks (z = 38)
      [-23, 39, 10, 9, palette.modern ? 19 : 7.5],
      [23, 39, 10, 9, palette.modern ? 17 : 7.5],
      [-72, 36, 11, 10, palette.modern ? 23 : 8],
      [72, 36, 11, 10, palette.modern ? 21 : 8],
      // Midtown Central Blocks (z = 0, outer of fountain plaza)
      [-25, 0, 10.5, 9.5, palette.modern ? 20 : 8],
      [25, 0, 10.5, 9.5, palette.modern ? 22 : 8],
      [-72, 0, 12, 10, palette.modern ? 26 : 8.5],
      [72, 0, 12, 10, palette.modern ? 24 : 8.5],
      // Midtown North Blocks (z = -36)
      [-23, -36, 10.5, 9.5, palette.modern ? 21 : 7.5],
      [23, -36, 10.5, 9.5, palette.modern ? 19 : 7.5],
      [-72, -36, 11, 10, palette.modern ? 25 : 8.5],
      [72, -36, 11, 10, palette.modern ? 23 : 8.5],
      // Far North Nexus Skyline Blocks (z = -72)
      [-24, -72, 11, 9, palette.modern ? 22 : 8],
      [24, -72, 11, 9, palette.modern ? 22 : 8],
      [-72, -72, 12, 11, palette.modern ? 28 : 9],
      [72, -72, 12, 11, palette.modern ? 27 : 9],
      // Far South Skyline Blocks (z = 74)
      [-28, 74, 11, 9, palette.modern ? 18 : 7],
      [28, 74, 11, 9, palette.modern ? 18 : 7],
    ];

    buildingDefinitions.forEach(([bx, bz, bw, bd, bh], idx) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(bx, 0.2, bz);

      const bMat = new THREE.MeshStandardMaterial({
        map: idx % 2 === 0 ? facade1 : facade2,
        roughness: palette.modern ? 0.22 : 0.68,
        metalness: palette.modern ? 0.5 : 0.08,
      });

      if (mission.id === "mocambique" && idx % 3 === 1) {
        // Large Sculpted Round Cultural Building with Veranda & Conical Thatched Roof
        const wall = new THREE.Mesh(
          new THREE.CylinderGeometry(bw * 0.46, bw * 0.48, 4.8, 22),
          bMat
        );
        wall.position.y = 2.4;
        wall.castShadow = true;
        bGroup.add(wall);

        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(bw * 0.6, 3.2, 22),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 })
        );
        roof.position.y = 6.2;
        bGroup.add(roof);
      } else {
        // Main Architectural Mass
        const mainTower = new THREE.Mesh(
          new THREE.BoxGeometry(bw, bh, bd),
          bMat
        );
        mainTower.position.y = bh / 2;
        mainTower.castShadow = true;
        mainTower.receiveShadow = true;
        bGroup.add(mainTower);

        // Rooftop Parapet Ledge
        const parapet = new THREE.Mesh(
          new THREE.BoxGeometry(bw + 0.45, 0.45, bd + 0.45),
          new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
        );
        parapet.position.y = bh + 0.2;
        bGroup.add(parapet);

        // Ground-Floor Storefront 3D Awning (Toldo) + Store Signboard!
        const awningCol =
          palette.awningColors[idx % palette.awningColors.length];
        const awning = new THREE.Mesh(
          new THREE.BoxGeometry(bw * 0.78, 0.28, 1.45),
          new THREE.MeshStandardMaterial({ color: awningCol, roughness: 0.5 })
        );
        const faceDir = bz >= 0 ? -1 : 1;
        awning.position.set(0, 2.35, faceDir * (bd / 2 + 0.6));
        awning.rotation.x = faceDir * 0.18;
        bGroup.add(awning);

        const signMat = new THREE.MeshBasicMaterial({
          map: signTextures[idx % signTextures.length],
        });
        const signBoard = new THREE.Mesh(
          new THREE.BoxGeometry(bw * 0.68, 1.15, 0.16),
          signMat
        );
        signBoard.position.set(0, 3.45, faceDir * (bd / 2 + 0.1));
        bGroup.add(signBoard);

        if (palette.modern) {
          // Tokyo Rooftop Helipad / AC Units / Vertical Neon Billboard + Antenna Spire
          const neonFrame = new THREE.Mesh(
            new THREE.BoxGeometry(bw + 0.52, 0.35, bd + 0.52),
            new THREE.MeshBasicMaterial({
              color: idx % 2 === 0 ? 0x22d3ee : 0xf43f5e,
            })
          );
          neonFrame.position.y = bh + 0.52;
          bGroup.add(neonFrame);

          const spire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.18, 4.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
          );
          spire.position.set(bw * 0.25, bh + 2.5, 0);
          bGroup.add(spire);
        } else if (resolvedBiome === "janela1040") {
          // Sandstone Rooftop Dome & Ornate Arch Trim
          const dome = new THREE.Mesh(
            new THREE.SphereGeometry(
              bw * 0.3,
              18,
              12,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2
            ),
            new THREE.MeshStandardMaterial({
              color: 0xf59e0b,
              roughness: 0.35,
              metalness: 0.25,
            })
          );
          dome.position.y = bh + 0.4;
          bGroup.add(dome);
        } else if (resolvedBiome === "amazonia") {
          // Timber Pitched Roof + Wooden Stilt Pillars
          const roof = new THREE.Mesh(
            new THREE.ConeGeometry(bw * 0.72, 2.8, 4),
            new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })
          );
          roof.rotation.y = Math.PI / 4;
          roof.position.y = bh + 1.6;
          bGroup.add(roof);
        } else {
          // Rooftop Water Tank / Solar Panel
          const acBox = new THREE.Mesh(
            new THREE.BoxGeometry(2.1, 1.3, 1.8),
            new THREE.MeshStandardMaterial({ color: 0x64748b })
          );
          acBox.position.set(-bw * 0.2, bh + 1.0, 0);
          bGroup.add(acBox);
        }
      }

      scene.add(bGroup);
      buildingColliders.push({
        x: bx,
        z: bz,
        rx: bw / 2 + 1.05,
        rz: bd / 2 + 1.05,
      });
    });

    // --- AMAZÔNIA RIVER + 3 BRIDGES + HOSPITAL SHIP / CITY MOVING TRAFFIC & PEDESTRIANS ---
    const ambientCars: {
      mesh: THREE.Group;
      axis: "x" | "z";
      speed: number;
      limit: number;
    }[] = [];

    if (resolvedBiome === "amazonia") {
      const river = new THREE.Mesh(
        new THREE.PlaneGeometry(230, 9.2),
        new THREE.MeshStandardMaterial({
          color: 0x0891b2,
          emissive: 0x0e7490,
          emissiveIntensity: 0.35,
          roughness: 0.12,
          metalness: 0.75,
        })
      );
      river.rotation.x = -Math.PI / 2;
      river.position.set(0, 0.06, 27);
      scene.add(river);

      // 3 Realistic Wooden/Steel Bridges at x = -46, 0, 46
      nsAvenues.forEach((brX) => {
        const bridgeGrp = new THREE.Group();
        const deck = new THREE.Mesh(
          new THREE.BoxGeometry(11.8, 0.45, 11.5),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
        );
        deck.position.set(brX, 0.28, 27);
        bridgeGrp.add(deck);

        [-5.6, 5.6].forEach((railX) => {
          const rail = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 1.1, 11.5),
            new THREE.MeshStandardMaterial({ color: 0xb45309 })
          );
          rail.position.set(brX + railX, 0.95, 27);
          bridgeGrp.add(rail);
        });
        scene.add(bridgeGrp);
      });

      // Docked Barco-Hospital Esperança
      const ship = new THREE.Group();
      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(11.5, 2.0, 4.6),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
      );
      hull.position.y = 1.0;
      ship.add(hull);
      const cabin1 = new THREE.Mesh(
        new THREE.BoxGeometry(8.5, 2.0, 3.9),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc })
      );
      cabin1.position.y = 2.9;
      ship.add(cabin1);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(9.0, 0.35, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x10b981 })
      );
      roof.position.y = 4.05;
      ship.add(roof);
      const shipTag = createNameplateSprite("🚢 BARCO-HOSPITAL IDE", "#34d399");
      shipTag.position.y = 5.4;
      ship.add(shipTag);
      ship.position.set(-22, 0.05, 27);
      scene.add(ship);
    } else {
      // 8 Realistic Cruising GTA Traffic Vehicles along E-W and N-S Avenues!
      const trafficSpecs: {
        kind: "sports" | "suv";
        col: number;
        axis: "x" | "z";
        lanePos: number;
        start: number;
        spd: number;
      }[] = [
        { kind: "sports", col: 0xef4444, axis: "x", lanePos: 15.6, start: -60, spd: 12.5 },
        { kind: "suv", col: 0x3b82f6, axis: "x", lanePos: 20.4, start: 55, spd: -11.0 },
        { kind: "sports", col: 0xeab308, axis: "x", lanePos: -15.6, start: -25, spd: 13.5 },
        { kind: "suv", col: 0x10b981, axis: "x", lanePos: -20.4, start: 40, spd: -10.5 },
        { kind: "sports", col: 0xa855f7, axis: "z", lanePos: -43.5, start: -50, spd: 12.0 },
        { kind: "suv", col: 0xf97316, axis: "z", lanePos: 48.5, start: 45, spd: -11.5 },
      ];

      trafficSpecs.forEach((ts) => {
        const car = createGtaVehicle3D(ts.kind, ts.col, "");
        const tag = car.getObjectByName("vehicleTag");
        if (tag) tag.visible = false;

        if (ts.axis === "x") {
          car.position.set(ts.start, 0, ts.lanePos);
          car.rotation.y = ts.spd > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
          car.position.set(ts.lanePos, 0, ts.start);
          car.rotation.y = ts.spd > 0 ? 0 : Math.PI;
        }
        scene.add(car);
        ambientCars.push({
          mesh: car,
          axis: ts.axis,
          speed: ts.spd,
          limit: 94,
        });
      });
    }

    // --- 8 AMBIENT WALKING SIDEWALK PEDESTRIANS (LIVING GTA CITY!) ---
    interface AmbientPedestrian {
      rig: ArticulatedRig;
      baseX: number;
      z: number;
      range: number;
      speed: number;
      dir: number;
      phase: number;
    }
    const isAmazoniaBiome = resolvedBiome === "amazonia";
    const pedestrians: AmbientPedestrian[] = [
      { baseX: -23, z: isAmazoniaBiome ? 44 : 26, range: 11, speed: 2.3, col: 0x3b82f6, skin: "#e5a975" },
      { baseX: 23, z: isAmazoniaBiome ? 12 : 26, range: 11, speed: 2.5, col: 0xec4899, skin: "#fad0b1" },
      { baseX: -24, z: -11, range: 10, speed: 2.2, col: 0x10b981, skin: "#c68652" },
      { baseX: 24, z: -11, range: 10, speed: 2.4, col: 0xf59e0b, skin: "#9c6234" },
      { baseX: -23, z: -26, range: 11, speed: 2.6, col: 0x8b5cf6, skin: "#fde2ce" },
      { baseX: 23, z: -26, range: 11, speed: 2.1, col: 0x06b6d4, skin: "#d49a6a" },
    ].map((p, idx) => {
      const rig = buildStylizedHumanRig({
        skin: p.skin,
        eye: "#0ea5e9",
        shirt: p.col,
        secondary: 0xe2e8f0,
        pants: 0x1e293b,
        hair: idx % 2 === 0 ? 0x1e293b : 0x451a03,
        showGroundRing: false,
      });
      rig.root.position.set(p.baseX, 0.22, p.z);
      scene.add(rig.root);
      return {
        rig,
        baseX: p.baseX,
        z: p.z,
        range: p.range,
        speed: p.speed,
        dir: idx % 2 === 0 ? 1 : -1,
        phase: idx * 1.4,
      };
    });

    // --- REALISTIC LAYERED TREES & STREETLAMPS ---
    const treePositions: [number, number][] = [
      [-11, 11],
      [11, 11],
      [-11, -11],
      [11, -11],
      [-36, 36],
      [36, 36],
      [-36, -36],
      [36, -36],
      [-58, 36],
      [58, 36],
      [-58, -36],
      [58, -36],
    ];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      treePositions.push([Math.cos(a) * 90, Math.sin(a) * 90]);
    }

    // =========================================================================
    // BIOME-SPECIFIC REALISTIC 3D TREES, VEGETATION & PROPS
    // =========================================================================
    const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
    const woodPalmMat = new THREE.MeshStandardMaterial({ color: 0x785338, roughness: 0.85 });
    const sakuraTrunkMat = new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.88 });
    const cactusMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.55 });
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });

    const leafAmazon1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
    const leafAmazon2 = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.65 });
    const leafPalm = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
    const leafSakura1 = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.7 });
    const leafSakura2 = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.75 });
    const leafAcacia = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.7 });
    const leafPine = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.65 });
    const leafEuro = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.65 });

    treePositions.forEach(([tx, tz], tIdx) => {
      if (mission.id === "amazonia" && Math.abs(tz - 27) < 6) return;
      const tGrp = new THREE.Group();
      tGrp.position.set(tx, 0, tz);

      if (resolvedBiome === "amazonia") {
        if (tIdx % 3 === 0) {
          // Amazonian Açaí/Pupunha Palm: Slender curved trunk with arching fronds
          const palmTrunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.26, 5.5, 8),
            woodPalmMat
          );
          palmTrunk.position.set(0, 2.75, 0);
          palmTrunk.rotation.z = (tIdx % 2 === 0 ? 0.08 : -0.08);
          palmTrunk.castShadow = true;
          tGrp.add(palmTrunk);

          // 8 Drooping Palm Fronds
          for (let f = 0; f < 8; f++) {
            const fAngle = (f / 8) * Math.PI * 2;
            const frond = new THREE.Mesh(
              new THREE.BoxGeometry(0.24, 0.04, 2.4),
              leafPalm
            );
            frond.position.set(Math.sin(fAngle) * 0.9, 5.2, Math.cos(fAngle) * 0.9);
            frond.rotation.y = fAngle;
            frond.rotation.x = 0.42;
            frond.castShadow = true;
            tGrp.add(frond);
          }
        } else {
          // Rainforest Giant with Buttress Roots (Sapopemba)
          const mainTrunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.62, 4.2, 10),
            woodDarkMat
          );
          mainTrunk.position.y = 2.1;
          mainTrunk.castShadow = true;
          tGrp.add(mainTrunk);

          // 3 Triangular Buttress Flairs (Sapopemba)
          for (let b = 0; b < 3; b++) {
            const bAngle = (b / 3) * Math.PI * 2;
            const buttress = new THREE.Mesh(
              new THREE.ConeGeometry(0.42, 1.8, 4),
              woodDarkMat
            );
            buttress.position.set(Math.sin(bAngle) * 0.55, 0.9, Math.cos(bAngle) * 0.55);
            buttress.rotation.y = bAngle;
            buttress.scale.set(0.35, 1, 1.4);
            tGrp.add(buttress);
          }

          // Layered Organic Jungle Canopy (5 volume clumps)
          [
            [0, 4.4, 0, 1.8, leafAmazon1],
            [-0.85, 3.8, 0.5, 1.35, leafAmazon2],
            [0.85, 3.9, -0.4, 1.4, leafAmazon1],
            [0, 5.2, 0.2, 1.4, leafAmazon2],
            [0.4, 3.5, 0.8, 1.1, leafAmazon1],
          ].forEach(([cx, cy, cz, cr, mat]) => {
            const crown = new THREE.Mesh(
              new THREE.SphereGeometry(cr as number, 12, 10),
              mat as THREE.Material
            );
            crown.position.set(cx as number, cy as number, cz as number);
            crown.castShadow = true;
            tGrp.add(crown);
          });
        }
      } else if (resolvedBiome === "toquio") {
        // Japanese Cherry Blossom Tree (Sakura)
        const sakuraTrunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.42, 3.2, 8),
          sakuraTrunkMat
        );
        sakuraTrunk.position.y = 1.6;
        sakuraTrunk.rotation.z = (tIdx % 2 === 0 ? 0.12 : -0.1);
        sakuraTrunk.castShadow = true;
        tGrp.add(sakuraTrunk);

        // Twisted Outstretched Boughs
        [-0.7, 0.7].forEach((bx) => {
          const branch = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.18, 1.8, 6),
            sakuraTrunkMat
          );
          branch.position.set(bx * 0.7, 2.7, 0);
          branch.rotation.z = bx < 0 ? 0.55 : -0.55;
          tGrp.add(branch);
        });

        // Pillowy Pink & White Blossom Clouds
        [
          [0, 3.8, 0, 1.65, leafSakura1],
          [-1.1, 3.4, 0.3, 1.25, leafSakura2],
          [1.1, 3.5, -0.3, 1.3, leafSakura1],
          [0, 4.6, 0.1, 1.3, leafSakura2],
          [-0.4, 3.2, 0.9, 1.05, leafSakura1],
          [0.4, 3.3, -0.8, 1.05, leafSakura2],
        ].forEach(([cx, cy, cz, cr, mat]) => {
          const cloud = new THREE.Mesh(
            new THREE.SphereGeometry(cr as number, 12, 10),
            mat as THREE.Material
          );
          cloud.position.set(cx as number, cy as number, cz as number);
          cloud.castShadow = true;
          tGrp.add(cloud);
        });
      } else if (resolvedBiome === "janela1040") {
        // Imperial Date Palm with Hanging Dates
        const palmTrunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.34, 4.8, 10),
          woodPalmMat
        );
        palmTrunk.position.y = 2.4;
        palmTrunk.castShadow = true;
        tGrp.add(palmTrunk);

        // Arching Palm Fronds
        for (let f = 0; f < 9; f++) {
          const fAngle = (f / 9) * Math.PI * 2;
          const frond = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.05, 2.6),
            leafPalm
          );
          frond.position.set(Math.sin(fAngle) * 0.95, 4.7, Math.cos(fAngle) * 0.95);
          frond.rotation.y = fAngle;
          frond.rotation.x = 0.44;
          frond.castShadow = true;
          tGrp.add(frond);
        }

        // Hanging Date Fruit Clusters
        [-0.3, 0.3].forEach((dx) => {
          const dates = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 })
          );
          dates.position.set(dx, 4.3, 0);
          tGrp.add(dates);
        });

        // Desert Boulders at base
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.55, 0),
          new THREE.MeshStandardMaterial({ color: 0xc4935a, roughness: 0.9 })
        );
        rock.position.set(0.65, 0.35, 0.45);
        tGrp.add(rock);
      } else if (resolvedBiome === "sertao") {
        if (tIdx % 2 === 0) {
          // Iconic Tall Ribbed Mandacaru Cactus
          const cactusTrunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.32, 4.2, 10),
            cactusMat
          );
          cactusTrunk.position.y = 2.1;
          cactusTrunk.castShadow = true;
          tGrp.add(cactusTrunk);

          // Left Arm branching up
          const armLeftH = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.85, 8), cactusMat);
          armLeftH.position.set(-0.55, 2.3, 0);
          armLeftH.rotation.z = Math.PI / 2;
          tGrp.add(armLeftH);
          const armLeftV = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 8), cactusMat);
          armLeftV.position.set(-0.95, 3.0, 0);
          tGrp.add(armLeftV);

          // Right Arm branching up
          const armRightH = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.75, 8), cactusMat);
          armRightH.position.set(0.5, 2.7, 0);
          armRightH.rotation.z = Math.PI / 2;
          tGrp.add(armRightH);
          const armRightV = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.4, 8), cactusMat);
          armRightV.position.set(0.85, 3.3, 0);
          tGrp.add(armRightV);

          // White Cactus Flower on top
          const flower = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.18, 0),
            new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xfef08a, emissiveIntensity: 0.4 })
          );
          flower.position.set(0, 4.3, 0);
          tGrp.add(flower);
        } else {
          // Juazeiro Shade Tree
          const juaTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 2.6, 8), woodDarkMat);
          juaTrunk.position.y = 1.3;
          tGrp.add(juaTrunk);
          const juaCrown = new THREE.Mesh(new THREE.SphereGeometry(1.65, 12, 10), leafAmazon1);
          juaCrown.position.set(0, 2.9, 0);
          juaCrown.scale.set(1.2, 0.85, 1.2);
          juaCrown.castShadow = true;
          tGrp.add(juaCrown);
        }
      } else if (resolvedBiome === "andes" || resolvedBiome === "himalaia") {
        // Alpine Tiered Pine Conifer with Snow Dusting
        const pineTrunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.36, 5.2, 8),
          woodDarkMat
        );
        pineTrunk.position.y = 2.6;
        pineTrunk.castShadow = true;
        tGrp.add(pineTrunk);

        // 4 Stacked Conifer Needle Tiers
        [
          [0, 2.2, 1.85, 1.6],
          [0, 3.4, 1.5, 1.5],
          [0, 4.5, 1.15, 1.4],
          [0, 5.5, 0.75, 1.2],
        ].forEach(([cx, cy, cr, ch]) => {
          const tier = new THREE.Mesh(
            new THREE.ConeGeometry(cr, ch, 10),
            leafPine
          );
          tier.position.set(cx, cy, 0);
          tier.castShadow = true;
          tGrp.add(tier);

          // Snow cap on top edge
          const snowCap = new THREE.Mesh(
            new THREE.ConeGeometry(cr * 0.72, ch * 0.38, 8),
            snowMat
          );
          snowCap.position.set(cx, cy + ch * 0.35, 0);
          tGrp.add(snowCap);
        });
      } else {
        // African Umbrella Acacia (Moçambique) or European Boulevard Tree
        if (resolvedBiome === "europa") {
          // European Boulevard Tree with Iron Tree Grate
          const grate = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.05, 1.8),
            ironMat
          );
          grate.position.y = 0.02;
          tGrp.add(grate);

          const euroTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 3.6, 10), woodDarkMat);
          euroTrunk.position.y = 1.8;
          euroTrunk.castShadow = true;
          tGrp.add(euroTrunk);

          const euroCrown = new THREE.Mesh(new THREE.SphereGeometry(1.75, 14, 12), leafEuro);
          euroCrown.position.set(0, 4.1, 0);
          euroCrown.scale.set(1.1, 1.2, 1.1);
          euroCrown.castShadow = true;
          tGrp.add(euroCrown);
        } else {
          // African Umbrella Acacia: Sweeping horizontal flat-topped crown
          const acaciaTrunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.42, 3.8, 8),
            woodDarkMat
          );
          acaciaTrunk.position.y = 1.9;
          acaciaTrunk.rotation.z = (tIdx % 2 === 0 ? 0.08 : -0.08);
          acaciaTrunk.castShadow = true;
          tGrp.add(acaciaTrunk);

          // Wide horizontal flat foliage disk
          const umbrellaDisc = new THREE.Mesh(
            new THREE.CylinderGeometry(2.4, 2.1, 0.55, 14),
            leafAcacia
          );
          umbrellaDisc.position.set(0, 4.0, 0);
          umbrellaDisc.castShadow = true;
          tGrp.add(umbrellaDisc);

          const topTuft = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.8, 0.45, 12),
            leafAcacia
          );
          topTuft.position.set(0, 4.4, 0);
          tGrp.add(topTuft);
        }
      }

      scene.add(tGrp);
    });

    // =========================================================================
    // REALISTIC STREET FURNITURE: CURBS, STREETLAMPS, BENCHES & FIRE HYDRANTS
    // =========================================================================
    // 1. Sidewalk Concrete Curbs along Boulevard (ONLY along blocks, NEVER cutting across Avenues!)
    const curbSegments = [
      { zCenter: 36.25, len: 23.5 }, // North Block (between Ave 18 & Ave 54)
      { zCenter: 74.0, len: 28.0 },  // Far North Block (North of Ave 54)
      { zCenter: -36.25, len: 23.5 }, // South Block (between Ave -18 & Ave -54)
      { zCenter: -74.0, len: 28.0 }, // Far South Block (South of Ave -54)
    ];
    curbSegments.forEach(({ zCenter, len }) => {
      [-5.9, 5.9].forEach((cx) => {
        const curb = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.16, len),
          curbMat
        );
        curb.position.set(cx, 0.08, zCenter);
        scene.add(curb);
      });
    });

    // 2. Realistic Arched Swan-Neck Streetlamps with Warm Light Pools (Safely on Sidewalks)
    const lampLightPoolTex = (() => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext("2d")!;
      const rad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
      rad.addColorStop(0, "rgba(254, 240, 138, 0.45)");
      rad.addColorStop(0.5, "rgba(251, 191, 36, 0.18)");
      rad.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c);
      return t;
    })();

    // Lamp positions positioned in the middle of sidewalk blocks, far from intersections
    const lampCoords: [number, number][] = [
      [-6.6, -70], [6.6, -70],
      [-6.6, -36], [6.6, -36],
      [-6.6, 36], [6.6, 36],
      [-6.6, 70], [6.6, 70],
      // Plaza perimeter lamps
      [-10.5, 0], [10.5, 0],
    ];

    lampCoords.forEach(([lx, lz]) => {
      const lampPost = new THREE.Group();
      lampPost.position.set(lx, 0, lz);

      // Vertical Post
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 5.2, 8),
        trafficPoleMat
      );
      pole.position.y = 2.6;
      lampPost.add(pole);

      // Curved Overhang Arm reaching toward sidewalk/street
      const armDir = lx < 0 ? 1 : -1;
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6),
        trafficPoleMat
      );
      arm.position.set(armDir * 0.45, 5.1, 0);
      arm.rotation.z = armDir * 0.55;
      lampPost.add(arm);

      // Bell Lamp Fixture
      const fixture = new THREE.Mesh(
        new THREE.ConeGeometry(0.26, 0.35, 10),
        trafficPoleMat
      );
      fixture.position.set(armDir * 0.85, 5.15, 0);
      fixture.rotation.x = Math.PI;
      lampPost.add(fixture);

      // Warm Glowing LED Bulb
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
      );
      bulb.position.set(armDir * 0.85, 4.95, 0);
      lampPost.add(bulb);

      scene.add(lampPost);

      // Ground Light Pool
      const lightPool = new THREE.Mesh(
        new THREE.PlaneGeometry(9.5, 9.5),
        new THREE.MeshBasicMaterial({
          map: lampLightPoolTex,
          transparent: true,
          opacity: 0.75,
          depthWrite: false,
        })
      );
      lightPool.rotation.x = -Math.PI / 2;
      lightPool.position.set(lx + armDir * 1.5, 0.04, lz);
      scene.add(lightPool);
    });

    // 3. Authentic 3D Fire Hydrants (Hidrantes) - Safely on Outer Sidewalk, NEVER in the Street or Riverside!
    // In Amazônia (river/forest setting), municipal fire hydrants do not spawn.
    if (resolvedBiome !== "amazonia") {
      const hydrantCoords: [number, number][] = [
        [-14.5, 36],   // North sidewalk against building wall
        [14.5, 46],    // North sidewalk against building wall
        [-14.5, -36],  // South sidewalk against building wall
        [14.5, -46],   // South sidewalk against building wall
        [14.5, 68],    // Spawn area sidewalk border
      ];

      hydrantCoords.forEach(([hx, hz]) => {
        const hydrant = new THREE.Group();
        hydrant.position.set(hx, 0.22, hz);

        // Heavy Flanged Cast-Iron Base Ring
        const hBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.28, 0.12, 12),
          new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 })
        );
        hBase.position.y = 0.06;
        hydrant.add(hBase);

        // Main Fire Hydrant Barrel
        const hydrantBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.17, 0.56, 12),
          new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.15 })
        );
        hydrantBody.position.y = 0.38;
        hydrant.add(hydrantBody);

        // Top Dome Bonnet
        const hydrantCap = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
          new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.35 })
        );
        hydrantCap.position.y = 0.65;
        hydrant.add(hydrantCap);

        // Pentagon Operating Nut on Top
        const topNut = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.045, 0.08, 5),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 })
        );
        topNut.position.y = 0.74;
        hydrant.add(topNut);

        // Dual Side Pumper Nozzles with Brass Caps
        [-0.17, 0.17].forEach((nx) => {
          const nozzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8),
            new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 })
          );
          nozzle.position.set(nx, 0.45, 0);
          nozzle.rotation.z = Math.PI / 2;
          hydrant.add(nozzle);

          const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 })
          );
          cap.position.set(nx > 0 ? nx + 0.06 : nx - 0.06, 0.45, 0);
          cap.rotation.z = Math.PI / 2;
          hydrant.add(cap);
        });

        scene.add(hydrant);
      });
    }

    // 4. Wooden Park Benches (Bancos de Parque) - In Central Plaza & Sidewalk Borders, NEVER in the Street!
    const benchConfigs: { x: number; z: number; rotY: number }[] = [
      // Central Plaza Fountain Park (surrounding the central fountain, facing inward)
      { x: -6.8, z: -2.2, rotY: Math.PI * 0.62 },
      { x: 6.8, z: -2.2, rotY: -Math.PI * 0.62 },
      { x: -6.5, z: -8.2, rotY: Math.PI * 0.32 },
      { x: 6.5, z: -8.2, rotY: -Math.PI * 0.32 },
      // Sidewalk Resting Benches (Safely tucked against building storefronts at |x| = 14.5, far from roadway)
      { x: -14.5, z: 44, rotY: Math.PI / 2 },
      { x: 14.5, z: 44, rotY: -Math.PI / 2 },
      { x: -14.5, z: -42, rotY: Math.PI / 2 },
      { x: 14.5, z: -42, rotY: -Math.PI / 2 },
      // Spawn Park Area
      { x: -12.5, z: 66, rotY: Math.PI / 2 },
      { x: 12.5, z: 66, rotY: -Math.PI / 2 },
    ];

    benchConfigs.forEach(({ x: bx, z: bz, rotY }) => {
      const bench = new THREE.Group();
      bench.position.set(bx, 0, bz);
      bench.rotation.y = rotY;

      // Realistic Cast-Iron Side Legs & Armrests
      [-0.72, 0.72].forEach((legX) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.46, 0.48), ironMat);
        leg.position.set(legX, 0.23, 0);
        bench.add(leg);

        const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.38), ironMat);
        armrest.position.set(legX, 0.54, 0.04);
        bench.add(armrest);
      });

      // 3 Slatted Varnished Hardwood Seat Planks
      [-0.14, 0, 0.14].forEach((sz) => {
        const plank = new THREE.Mesh(
          new THREE.BoxGeometry(1.65, 0.035, 0.11),
          new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 })
        );
        plank.position.set(0, 0.46, sz);
        bench.add(plank);
      });

      // 2 Slatted Wooden Backrest Planks
      [0.66, 0.78].forEach((by, idx) => {
        const bPlank = new THREE.Mesh(
          new THREE.BoxGeometry(1.65, 0.10, 0.035),
          new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 })
        );
        bPlank.position.set(0, by, -0.22 - idx * 0.02);
        bPlank.rotation.x = -0.12;
        bench.add(bPlank);
      });

      scene.add(bench);
    });

    // --- 3 RADIO BROADCAST TOWERS (NEW IN-MAP GTA SIDE MISSIONS!) ---
    interface LiveRadioTower {
      data: RadioTowerMission;
      beacon: THREE.Mesh;
      ring: THREE.Mesh;
      dish: THREE.Mesh;
    }

    const radioTowerObjs: LiveRadioTower[] = worldCfg.radioTowers.map((tw) => {
      const grp = new THREE.Group();
      grp.position.set(tw.x, 0, tw.z);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.8, 0.6, 12),
        trafficPoleMat
      );
      base.position.y = 0.3;
      grp.add(base);

      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.85, 10.5, 8, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          wireframe: true,
          metalness: 0.7,
        })
      );
      mast.position.y = 5.5;
      grp.add(mast);

      const dish = new THREE.Mesh(
        new THREE.ConeGeometry(0.95, 0.6, 16, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          side: THREE.DoubleSide,
          metalness: 0.6,
        })
      );
      dish.rotation.x = Math.PI / 2;
      dish.position.set(0, 7.8, 0.45);
      grp.add(dish);

      const isDone = towerIdsRef.current.includes(tw.id);
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 14, 14),
        new THREE.MeshBasicMaterial({
          color: isDone ? 0x10b981 : 0xf43f5e,
        })
      );
      beacon.position.y = 11.1;
      grp.add(beacon);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.0, 2.45, 32),
        new THREE.MeshBasicMaterial({
          color: isDone ? 0x10b981 : 0x38bdf8,
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.07;
      grp.add(ring);

      const tag = createNameplateSprite(`📡 ${tw.name}`, "#38bdf8");
      tag.position.y = 12.4;
      grp.add(tag);

      scene.add(grp);
      return { data: tw, beacon, ring, dish };
    });

    // --- GTA TIMED CHECKPOINT EXPRESS RACE START ARCH & 5 GOLDEN RINGS! ---
    const raceCfg = worldCfg.race;
    const raceStartGroup = new THREE.Group();
    raceStartGroup.position.set(raceCfg.startX, 0, raceCfg.startZ);

    [-3.2, 3.2].forEach((px) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 5.2, 12),
        new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          emissive: 0xd97706,
          emissiveIntensity: 0.5,
        })
      );
      pillar.position.set(px, 2.6, 0);
      raceStartGroup.add(pillar);
    });
    const archBanner = new THREE.Mesh(
      new THREE.BoxGeometry(7.0, 0.9, 0.45),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.7,
      })
    );
    archBanner.position.y = 5.2;
    raceStartGroup.add(archBanner);

    const startRing = new THREE.Mesh(
      new THREE.RingGeometry(2.6, 3.2, 32),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide })
    );
    startRing.rotation.x = -Math.PI / 2;
    startRing.position.y = 0.07;
    raceStartGroup.add(startRing);

    const raceTag = createNameplateSprite("🏁 CORRIDA EXPRESSA [F]", "#34d399");
    raceTag.position.y = 6.6;
    raceStartGroup.add(raceTag);
    scene.add(raceStartGroup);

    // Active Checkpoint 3D Golden Ring + Skyscraper Light Beacon (GTA Waypoint Pillar!)
    const activeCheckpointGroup = new THREE.Group();
    const cpTorus = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.28, 14, 36),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    cpTorus.position.y = 3.2;
    activeCheckpointGroup.add(cpTorus);

    const cpLightPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.6, 36, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      })
    );
    cpLightPillar.position.y = 18;
    activeCheckpointGroup.add(cpLightPillar);
    activeCheckpointGroup.visible = false;
    scene.add(activeCheckpointGroup);

    // League of Legends-Style Animated Runic Movement Beacon (Ground Reticle)
    const mobaBeaconGroup = new THREE.Group();
    const mobaOuterRing = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.05, 32),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      })
    );
    mobaOuterRing.rotation.x = -Math.PI / 2;
    mobaOuterRing.position.y = 0.08;
    mobaBeaconGroup.add(mobaOuterRing);

    const mobaInnerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.3, 0.48, 24),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      })
    );
    mobaInnerRing.rotation.x = -Math.PI / 2;
    mobaInnerRing.position.y = 0.09;
    mobaBeaconGroup.add(mobaInnerRing);

    const mobaSpikeGeometry = new THREE.ConeGeometry(0.24, 0.65, 4);
    const mobaSpike = new THREE.Mesh(
      mobaSpikeGeometry,
      new THREE.MeshBasicMaterial({
        color: 0x6ee7b7,
        transparent: true,
        opacity: 0,
      })
    );
    mobaSpike.rotation.x = Math.PI; // Point downwards into ground
    mobaSpike.position.y = 0.85;
    mobaBeaconGroup.add(mobaSpike);

    mobaBeaconGroup.visible = false;
    scene.add(mobaBeaconGroup);

    let mobaBeaconTimer = 0;
    const triggerMoveBeacon = (x: number, z: number) => {
      mobaBeaconGroup.position.set(x, 0, z);
      mobaBeaconGroup.visible = true;
      mobaBeaconTimer = 1.0;
      (mobaOuterRing.material as THREE.MeshBasicMaterial).opacity = 0.85;
      (mobaInnerRing.material as THREE.MeshBasicMaterial).opacity = 0.95;
      (mobaSpike.material as THREE.MeshBasicMaterial).opacity = 0.8;
      mobaOuterRing.scale.set(1.4, 1.4, 1.4);
      mobaInnerRing.scale.set(0.6, 0.6, 0.6);
      mobaSpike.position.y = 1.1;
    };

    // --- CULTURAL TOTEM & NEXUS DA PALAVRA ---
    const totemGroup = new THREE.Group();
    totemGroup.position.set(WORLD_LANDMARKS.totem.x, 0, WORLD_LANDMARKS.totem.z);
    const totemCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.95, 0),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.2,
      })
    );
    totemCrystal.position.y = 2.2;
    totemGroup.add(totemCrystal);
    const totemTag = createNameplateSprite("🧭 TOTEM CULTURAL", "#22d3ee");
    totemTag.position.y = 3.7;
    totemGroup.add(totemTag);
    scene.add(totemGroup);

    const nexusGroup = new THREE.Group();
    nexusGroup.position.set(WORLD_LANDMARKS.nexus.x, 0, WORLD_LANDMARKS.nexus.z);
    const nexusBase = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.8, 0.55, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    nexusBase.position.y = 0.28;
    nexusGroup.add(nexusBase);
    const nexusRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.26, 16, 48),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.2,
      })
    );
    nexusRing.position.y = 3.4;
    nexusGroup.add(nexusRing);
    const nexusCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 0),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.3,
      })
    );
    nexusCore.position.y = 3.4;
    nexusGroup.add(nexusCore);
    const nexusTag = createNameplateSprite("⚡ NEXUS DA PALAVRA", "#fbbf24");
    nexusTag.position.y = 6.8;
    nexusGroup.add(nexusTag);
    scene.add(nexusGroup);

    // --- MAIN STORY NPC AT CENTRAL FOUNTAIN PLAZA (0, 0) ---
    const mainNpcVisuals = {
      caua: {
        skin: "#c68652",
        eye: "#10b981",
        shirt: 0x0d9488,
        secondary: 0x34d399,
        pants: 0x1e293b,
        hair: 0x1e293b,
        hatType: "straw" as const,
      },
      tariq: {
        skin: "#d49a6a",
        eye: "#f59e0b",
        shirt: 0xe11d48,
        secondary: 0x10b981,
        pants: 0x0f172a,
        hair: 0x0f172a,
      },
      hina: {
        skin: "#fde2ce",
        eye: "#38bdf8",
        shirt: 0x1e3a8a,
        secondary: 0xf43f5e,
        pants: 0x1e293b,
        hair: 0x17153b,
      },
      samora: {
        skin: "#7c4722",
        eye: "#a855f7",
        shirt: 0xf59e0b,
        secondary: 0x7c3aed,
        pants: 0x1e293b,
        hair: 0x0f172a,
      },
      mateus: {
        skin: "#c68652",
        eye: "#d97706",
        shirt: 0x16a34a,
        secondary: 0xf59e0b,
        pants: 0x1e293b,
        hair: 0x1e293b,
        hatType: "straw" as const,
      },
      yara: {
        skin: "#c2410c",
        eye: "#0284c7",
        shirt: 0xef4444,
        secondary: 0x38bdf8,
        pants: 0x1e1b4b,
        hair: 0x17153b,
        gender: "female" as const,
      },
      tenzin: {
        skin: "#b45309",
        eye: "#10b981",
        shirt: 0x0284c7,
        secondary: 0xf59e0b,
        pants: 0x1e293b,
        hair: 0x0f172a,
      },
      amira: {
        skin: "#d49a6a",
        eye: "#8b5cf6",
        shirt: 0x8b5cf6,
        secondary: 0x06b6d4,
        pants: 0x1e293b,
        hair: 0x17153b,
        gender: "female" as const,
      },
      custom: {
        skin: "#e5a975",
        eye: "#06b6d4",
        shirt: 0x2563eb,
        secondary: 0x38bdf8,
        pants: 0x1e293b,
        hair: 0x1e293b,
      },
    };
    const mainNpcRig = buildStylizedHumanRig({
      ...mainNpcVisuals[mission.npc.avatarKey],
      label: `★ ${mission.npc.name} (Missão Principal)`,
      labelColor: "#34d399",
    });
    mainNpcRig.root.position.set(
      WORLD_LANDMARKS.mainNpc.x,
      0.2,
      WORLD_LANDMARKS.mainNpc.z
    );
    scene.add(mainNpcRig.root);

    // --- 6 STREET PEOPLE QUESTS ---
    const streetPeopleObjs = worldCfg.people.map((p) => {
      const rig = buildStylizedHumanRig({
        skin: p.skin,
        eye: "#0ea5e9",
        shirt: p.shirt,
        secondary: 0xfbbf24,
        pants: 0x1e293b,
        hair: 0x1e293b,
        hatType: p.hatType,
        label: `💬 ${p.name}`,
        labelColor: "#38bdf8",
      });
      rig.root.position.set(p.x, 0, p.z);

      const qRing = new THREE.Mesh(
        new THREE.RingGeometry(1.45, 1.85, 32),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
        })
      );
      qRing.rotation.x = -Math.PI / 2;
      qRing.position.y = 0.06;
      rig.root.add(qRing);

      scene.add(rig.root);
      return { data: p, rig, qRing };
    });

    // --- 32 COLLECTIBLES ACROSS THE CITY ---
    interface LiveCollectible {
      id: string;
      kind: "scroll" | "supply" | "gem" | "heart";
      label: string;
      points: number;
      x: number;
      z: number;
      collected: boolean;
      mesh: THREE.Group;
    }

    const collectibles: LiveCollectible[] = worldCfg.collectibles.map((c) => {
      const grp = new THREE.Group();
      grp.position.set(c.x, 0.9, c.z);

      const col =
        c.kind === "scroll"
          ? 0xfbbf24
          : c.kind === "supply"
            ? 0x0284c7
            : c.kind === "heart"
              ? 0xff0044
              : 0x06b6d4;

      if (c.kind === "heart") {
        // --- 1. CORAÇÃO 3D DE VIDA (HEALTH PICKUP - 100% VISÍVEL E ÓBVIO) ---
        const heartGrp = new THREE.Group();
        const heartMat = new THREE.MeshStandardMaterial({
          color: 0xff0044,
          emissive: 0xff1744,
          emissiveIntensity: 1.15,
          roughness: 0.15,
          metalness: 0.2,
        });

        // Lóbulo esquerdo
        const leftLobe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), heartMat);
        leftLobe.position.set(-0.15, 0.14, 0);
        heartGrp.add(leftLobe);

        // Lóbulo direito
        const rightLobe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), heartMat);
        rightLobe.position.set(0.15, 0.14, 0);
        heartGrp.add(rightLobe);

        // Ponta inferior cônica invertida
        const coneTip = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.58, 18), heartMat);
        coneTip.rotation.z = Math.PI;
        coneTip.position.set(0, -0.14, 0);
        heartGrp.add(coneTip);

        // Cruz de saúde branca em relevo
        const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.06), crossMat);
        crossH.position.set(0, 0.04, 0.22);
        heartGrp.add(crossH);

        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), crossMat);
        crossV.position.set(0, 0.04, 0.22);
        heartGrp.add(crossV);

        grp.add(heartGrp);
      } else if (c.kind === "gem") {
        // --- 2. DIAMANTE 3D DE SABEDORIA (BRILLIANT CUT DIAMOND) ---
        const gemGrp = new THREE.Group();
        const diamondMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x22d3ee,
          emissiveIntensity: 1.35,
          roughness: 0.08,
          metalness: 0.85,
        });

        // Coroa superior facetada (octógono)
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.22, 8), diamondMat);
        crown.position.y = 0.11;
        gemGrp.add(crown);

        // Mesa plana superior
        const table = new THREE.Mesh(
          new THREE.CircleGeometry(0.42, 8),
          new THREE.MeshBasicMaterial({ color: 0xa5f3fc, side: THREE.DoubleSide })
        );
        table.rotation.x = -Math.PI / 2;
        table.position.y = 0.221;
        gemGrp.add(table);

        // Pavilhão cônico pontudo inferior
        const pavilion = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.56, 8), diamondMat);
        pavilion.rotation.x = Math.PI;
        pavilion.position.y = -0.28;
        gemGrp.add(pavilion);

        // Núcleo cristalino interno
        const core = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.24, 0),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        gemGrp.add(core);

        grp.add(gemGrp);
      } else if (c.kind === "supply") {
        // --- 3. CAIXA 3D DE SUPRIMENTOS (SUPPLY CRATE COM CRUZ HUMANITÁRIA) ---
        const crateGrp = new THREE.Group();

        // Corpo de madeira maciça
        const crateBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 0.68, 0.82),
          new THREE.MeshStandardMaterial({
            color: 0x92400e,
            roughness: 0.45,
            metalness: 0.1,
          })
        );
        crateGrp.add(crateBody);

        // Cintas e ferragens de reforço de aço
        const strapMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.25,
          metalness: 0.8,
        });
        const strapX = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.16), strapMat);
        crateGrp.add(strapX);
        const strapZ = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.85), strapMat);
        crateGrp.add(strapZ);

        // Borda superior da tampa
        const topRim = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.86), strapMat);
        topRim.position.y = 0.35;
        crateGrp.add(topRim);

        // Cruz de socorro humanitário branca
        const badgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.85), badgeMat);
        crateGrp.add(crossH);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, 0.85), badgeMat);
        crateGrp.add(crossV);

        // Fecho metálico frontal dourado
        const latch = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.14, 0.08),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.15 })
        );
        latch.position.set(0, 0.12, 0.43);
        crateGrp.add(latch);

        grp.add(crateGrp);
      } else {
        // --- 4. PERGAMINHO SAGRADO 3D (SACRED SCROLL) ---
        const scrollGrp = new THREE.Group();

        // Rolo de pergaminho
        const parchment = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.95, 16),
          new THREE.MeshStandardMaterial({
            color: 0xfef3c7,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.8,
            roughness: 0.3,
          })
        );
        parchment.rotation.z = Math.PI / 4;
        scrollGrp.add(parchment);

        // Hastes de madeira nobre nas pontas
        const handleMat = new THREE.MeshStandardMaterial({
          color: 0x78350f,
          roughness: 0.4,
          metalness: 0.2,
        });
        const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16), handleMat);
        handleL.position.set(-0.35, -0.35, 0);
        handleL.rotation.z = Math.PI / 4;
        scrollGrp.add(handleL);

        const handleR = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16), handleMat);
        handleR.position.set(0.35, 0.35, 0);
        handleR.rotation.z = Math.PI / 4;
        scrollGrp.add(handleR);

        // Selo dourado da aliança
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.2, 0.04, 8, 20),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.8 })
        );
        ring.rotation.x = Math.PI / 2;
        scrollGrp.add(ring);

        grp.add(scrollGrp);
      }

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.76, 22),
        new THREE.MeshBasicMaterial({
          color: col,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = -0.82;
      grp.add(halo);

      scene.add(grp);
      return {
        id: c.id,
        kind: c.kind,
        label: c.label,
        points: c.points,
        x: c.x,
        z: c.z,
        collected: false,
        mesh: grp,
      };
    });

    // --- 15 HUMANOID ARMORED SHADOW ENEMIES + DISTRICT BOSS ---
    interface LiveEnemy {
      id: string;
      name: string;
      tier: "minor" | "elite" | "boss";
      level: number;
      homeX: number;
      homeZ: number;
      x: number;
      z: number;
      hp: number;
      maxHp: number;
      isBoss: boolean;
      points: number;
      dead: boolean;
      attackCd: number;
      hitFlash: number;
      rig: ArticulatedRig;
      // Dynamic Pursuit & Boss Attack AI
      aggroTimer: number;
      flankOffset: number;
      chargeCd: number;
      dashTimer: number;
      dashDirX: number;
      dashDirZ: number;
      patrolTimer: number;
      patrolDirX: number;
      patrolDirZ: number;
      patrolState: "idle" | "walking";
      patrolTargetX: number;
      patrolTargetZ: number;
      fleeTimer: number;
      fleeCooldown: number;
      enraged: boolean;
      // Telegraphed melee strike + ranged shadow bolts
      windup: number;
      windupTotal: number;
      boltCd: number;
      isCaster: boolean;
      telegraph: THREE.Mesh;
    }

    const enemies: LiveEnemy[] = worldCfg.enemies.map((e, idx) => {
      const tier: "minor" | "elite" | "boss" = e.tier || (e.isBoss ? "boss" : "minor");
      const isBossEnemy = tier === "boss";
      const isEliteEnemy = tier === "elite";

      // AI DDA: Dynamic enemy level scaling based on playerLevel
      const enemyLevel = isBossEnemy
        ? Math.max(5, playerLevel + 4)
        : isEliteEnemy
          ? Math.max(3, playerLevel + 2)
          : Math.max(1, playerLevel);

      // Dynamic HP scaling based on difficulty tier and player level
      const scaledHp = isBossEnemy
        ? Math.round((460 + playerLevel * 60) * (playerLevel >= 3 ? 1.15 : 1.0))
        : isEliteEnemy
          ? Math.round(140 + playerLevel * 22)
          : Math.round(65 + playerLevel * 10);

      const rig = createShadowEnemyRig(e.name, tier, enemyLevel);
      rig.root.position.set(e.x, 0, e.z);
      scene.add(rig.root);

      const angleSeed = (idx * 1.37) % (Math.PI * 2);
      // Red/Purple ground telegraph: "get out of the circle!" before every strike
      const telegraph = new THREE.Mesh(
        new THREE.CircleGeometry(isBossEnemy ? 4.8 : isEliteEnemy ? 3.4 : 2.5, 28),
        new THREE.MeshBasicMaterial({
          color: isBossEnemy ? 0xf43f5e : isEliteEnemy ? 0xe11d48 : 0xa855f7,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        })
      );
      telegraph.rotation.x = -Math.PI / 2;
      telegraph.position.set(e.x, 0.09, e.z);
      telegraph.visible = false;
      scene.add(telegraph);

      return {
        id: e.id,
        name: e.name,
        tier,
        level: enemyLevel,
        homeX: e.x,
        homeZ: e.z,
        x: e.x,
        z: e.z,
        hp: scaledHp,
        maxHp: scaledHp,
        isBoss: isBossEnemy,
        points: Math.round(e.points * (1 + (enemyLevel - 1) * 0.15)),
        dead: false,
        attackCd: 0,
        hitFlash: 0,
        rig,
        aggroTimer: 0,
        flankOffset: ((idx % 3) - 1) * 0.38,
        chargeCd: isEliteEnemy ? 2.5 : 4.0,
        dashTimer: 0,
        dashDirX: 0,
        dashDirZ: 0,
        patrolTimer: 1.5 + (idx % 4) * 0.8,
        patrolDirX: Math.cos(angleSeed),
        patrolDirZ: Math.sin(angleSeed),
        patrolState: "idle",
        patrolTargetX: e.x,
        patrolTargetZ: e.z,
        fleeTimer: 0,
        fleeCooldown: 0,
        enraged: false,
        windup: 0,
        windupTotal: isBossEnemy ? 1.4 : isEliteEnemy ? 0.85 : 1.5,
        boltCd: isEliteEnemy ? 2.0 : 3.5 + (idx % 5) * 0.7,
        isCaster: isEliteEnemy || isBossEnemy,
        telegraph,
      };
    });

    // --- PARKED DRIVABLE REALISTIC GTA VEHICLES (CAR & MOTO GARAGE) ---
    interface LiveVehicle {
      cfg: VehicleSpawnConfig;
      mesh: THREE.Group;
      x: number;
      z: number;
      rotY: number;
    }

    const vehicleConfigs: VehicleSpawnConfig[] = [...worldCfg.vehicles];
    // Guarantee at least one car and one moto exist so the player can always swap
    if (!vehicleConfigs.some((v) => v.kind === "moto")) {
      vehicleConfigs.push({
        id: "garage-moto",
        kind: "moto",
        name: "Moto Turbo",
        color: 0xf97316,
        x: WORLD_LANDMARKS.spawn.x - 6,
        z: WORLD_LANDMARKS.spawn.z - 4,
        rotY: Math.PI,
        topSpeed: 21,
      });
    }
    if (!vehicleConfigs.some((v) => v.kind !== "moto")) {
      vehicleConfigs.push({
        id: "garage-car",
        kind: "suv",
        name: "SUV Tático 4x4",
        color: 0x0ea5e9,
        x: WORLD_LANDMARKS.spawn.x + 6,
        z: WORLD_LANDMARKS.spawn.z - 4,
        rotY: Math.PI,
        topSpeed: 18,
      });
    }

    const vehicles: LiveVehicle[] = vehicleConfigs.map((vCfg) => {
      const mesh = createGtaVehicle3D(vCfg.kind, vCfg.color, vCfg.name);
      mesh.position.set(vCfg.x, 0, vCfg.z);
      mesh.rotation.y = vCfg.rotY;
      scene.add(mesh);
      return {
        cfg: vCfg,
        mesh,
        x: vCfg.x,
        z: vCfg.z,
        rotY: vCfg.rotY,
      };
    });

    // --- PLAYABLE HERO + LIVE SKIN HOLDER + GPS ARROW + WAYPOINT SKY BEAM ---
    const heroHolder = new THREE.Group();
    const initialRig = createPlayableChampion3D(
      avatarIdRef.current,
      agentNameRef.current,
      skinIdRef.current,
      true
    );
    heroHolder.add(initialRig.root);
    heroHolderRef.current = heroHolder;
    heroRigRef.current = initialRig;

    const heroPos = new THREE.Vector3(
      WORLD_LANDMARKS.spawn.x,
      0,
      WORLD_LANDMARKS.spawn.z
    );
    let heroAngle = Math.PI;
    heroHolder.position.copy(heroPos);
    heroHolder.rotation.y = heroAngle;
    scene.add(heroHolder);

    // --- 3D MULTIPLAYER CO-OP PARTNER CHAMPION RIG & DOCK ---
    const partnerHolder = new THREE.Group();
    let partnerRig: ArticulatedRig | null = null;
    let partnerRigAvatarId: string | null = null;
    let partnerRigSkinId: string | null = null;
    let partnerRigName: string | null = null;
    const partnerPos = new THREE.Vector3(
      WORLD_LANDMARKS.spawn.x + 3.2,
      0,
      WORLD_LANDMARKS.spawn.z
    );
    let partnerAngle = Math.PI;
    const partnerTargetPos = new THREE.Vector3(partnerPos.x, 0, partnerPos.z);
    let partnerTargetAngle = Math.PI;
    let partnerIsMoving = false;
    let partnerSpeed = 0;
    let partnerInVehicle = false;
    let partnerWalkCycle = 0;

    if (coopPartnerRef.current) {
      const cp = coopPartnerRef.current;
      partnerRigAvatarId = (cp.avatarId || "sofia") as AvatarId;
      partnerRigSkinId = (cp.skinId || "padrao") as SkinId;
      const roleStr = cp.role === "driver" ? "PILOTO" : "GUARDIÃO";
      partnerRigName = `${cp.name} [${roleStr}]`;
      partnerRig = createPlayableChampion3D(
        partnerRigAvatarId as AvatarId,
        partnerRigName,
        partnerRigSkinId as SkinId,
        true // showNameplate is TRUE!
      );
      partnerHolder.add(partnerRig.root);
      partnerHolder.position.copy(partnerPos);
      partnerHolder.rotation.y = partnerAngle;
      scene.add(partnerHolder);
    }

    // AAA Boss Telegraphed Ground AoE Shockwave Ring
    const bossAoeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 6.2, 36),
      new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      })
    );
    bossAoeRing.rotation.x = -Math.PI / 2;
    bossAoeRing.position.set(WORLD_LANDMARKS.boss.x, 0.14, WORLD_LANDMARKS.boss.z);
    scene.add(bossAoeRing);
    let bossAoeCharge = 0;

    // 3D GTA GPS Arrow at feet
    const gpsPivot = new THREE.Group();
    const gpsCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 1.05, 8),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    gpsCone.rotation.x = Math.PI / 2;
    gpsCone.position.set(0, 0.35, 2.3);
    gpsPivot.add(gpsCone);
    scene.add(gpsPivot);

    // Vertical GTA Waypoint Light Beam at active GPS target!
    const gpsDestinationBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 28, 18, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      })
    );
    scene.add(gpsDestinationBeam);

    // Soft & Subtle Holographic Road Trail (Discreet, gentle guide dots)
    const gpsTrailGroup = new THREE.Group();
    const trailChevronCount = 8;
    const trailChevrons: THREE.Mesh[] = [];
    const chevronGeo = new THREE.PlaneGeometry(0.48, 0.48);
    for (let i = 0; i < trailChevronCount; i++) {
      const ch = new THREE.Mesh(
        chevronGeo,
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
        })
      );
      ch.rotation.x = -Math.PI / 2;
      ch.rotation.z = Math.PI / 4; // Diamond shape on road
      gpsTrailGroup.add(ch);
      trailChevrons.push(ch);
    }
    scene.add(gpsTrailGroup);

    // --- PROJECTILES & VFX ---
    interface LightProjectile {
      mesh: THREE.Mesh;
      vx: number;
      vz: number;
      life: number;
      hitIds: Set<string>;
    }
    const projectiles: LightProjectile[] = [];

    interface ShadowProjectile {
      mesh: THREE.Mesh;
      vx: number;
      vz: number;
      life: number;
      damage: number;
      label: string;
    }
    const shadowProjectiles: ShadowProjectile[] = [];

    interface ExpandingEffect {
      mesh: THREE.Mesh;
      age: number;
      duration: number;
      maxScale: number;
    }
    const vfxList: ExpandingEffect[] = [];

    // --- GAMEPLAY & CAMERA STATE (STARTS IN 3D GTA CAMERA AS REQUESTED) ---
    let hp = 120;
    const maxHp = 120;
    let activeVehicle: LiveVehicle | null = null;
    let cameraMode: "gta" | "moba" = "gta";
    let camYaw = 0; // 0 = Camera South looking North (-Z)
    let nitroTimer = 0;
    let nitroCooldown = 0;

    // --- GARAGE & FUEL STATE ---
    let preferredVehicle: VehicleClass = "car";
    const garageUnits = { car: VEHICLE_RULES.car.units, moto: VEHICLE_RULES.moto.units };
    const fuelRemaining = { car: VEHICLE_RULES.car.seconds, moto: VEHICLE_RULES.moto.seconds };

    // --- BASIC ATTACK STATE (UNLIMITED AT WILL) ---
    let lastBasicAttackTime = 0;
    let hurtFlash = 0;

    let score = 0;
    let combo = 0;
    let comboTimer = 0;
    let suppliesHeld = 0;
    let scrollsCollected = 0;
    const totalScrolls = collectibles.filter((c) => c.kind === "scroll").length;
    let enemiesDefeated = 0;

    // Timed GTA Checkpoint Express Race State
    let raceActive = false;
    let raceTimeLeft = 0;
    let raceCheckpointIdx = 0;

    let attackAnimTimer = 0;
    let attackComboStep = 0; // 0 = Corte Lateral, 1 = Estocada Rápida, 2 = Giro Sagrado Finalizador
    let lastAttackTime = 0;
    let shieldTimer = 0;
    let dashTimer = 0;
    let dashDirX = 0;
    let dashDirZ = 0;
    let activeEmote: HeroEmoteType = "idle";
    let emoteTimer = 0;
    let emoteElapsed = 0;
    const cooldowns = { q: 0, w: 0, e: 0, r: 0 };
    let currentNearby: NearbyInteractionInfo | null = null;

    let lastCombatPopupTime = 0;
    const emitPopup = (text: string, color: string) => {
      // Throttle repetitive combat hit/damage popups so they don't cover the screen during battles
      const isCombatHit =
        text.includes("HP") ||
        text.includes("GOLPE") ||
        text.includes("ORBE") ||
        text.includes("ONDA");
      const now = performance.now();
      if (isCombatHit) {
        if (now - lastCombatPopupTime < 1400) return;
        lastCombatPopupTime = now;
      }
      onPopupRef.current({
        id: Date.now() + Math.random(),
        text,
        color,
      });
    };

    const startCheckpointRace = () => {
      if (raceActive) return;
      raceActive = true;
      raceCheckpointIdx = 0;
      raceTimeLeft = raceCfg.timeLimitSeconds;
      soundEngine.play("vehicle");
      emitPopup(
        `🏁 ${raceCfg.title.toUpperCase()} INICIADA! (${raceCfg.timeLimitSeconds}s)`,
        "#34d399"
      );
    };

    const damageEnemy = (enemy: LiveEnemy, amount: number, knockback = 1.6) => {
      if (enemy.dead) return;
      enemy.hp = Math.max(0, enemy.hp - amount);
      enemy.hitFlash = 0.18;
      // Controlled tactical aggro (no global map pull)
      enemy.aggroTimer = enemy.isBoss ? 12.0 : enemy.tier === "elite" ? 8.0 : 6.0;

      // Pack Mentality: Alert at most ONE nearby ally within 9m (prevents swarm)
      let closestAlly: LiveEnemy | null = null;
      let closestDist = 9.0;
      enemies.forEach((other) => {
        if (!other.dead && other.id !== enemy.id && !other.isBoss) {
          const dOther = Math.hypot(other.x - enemy.x, other.z - enemy.z);
          if (dOther < closestDist) {
            closestDist = dOther;
            closestAlly = other;
          }
        }
      });
      if (closestAlly) {
        (closestAlly as LiveEnemy).aggroTimer = Math.max((closestAlly as LiveEnemy).aggroTimer, 5.0);
      }

      // Cowardice / Fleeing Trigger when shadows take heavy damage!
      if (enemy.tier === "minor" && enemy.hp > 0 && enemy.hp <= enemy.maxHp * 0.35 && enemy.fleeCooldown <= 0) {
        enemy.fleeTimer = 4.0;
        enemy.fleeCooldown = 15.0;
        enemy.aggroTimer = 0;
        soundEngine.play("dash");
        emitPopup("💨 SOMBRA EM PÂNICO: FUGINDO DA LUZ!", "#c084fc");
      } else if (enemy.tier === "elite" && enemy.hp > 0 && enemy.hp <= enemy.maxHp * 0.25 && enemy.fleeCooldown <= 0) {
        enemy.fleeTimer = 2.5;
        enemy.fleeCooldown = 16.0;
        soundEngine.play("dash");
        emitPopup("💨 RECUO TÁTICO DA SOMBRA DE ELITE!", "#f43f5e");
      }

      // Boss Enrage at 50% HP!
      if (enemy.isBoss && !enemy.enraged && enemy.hp <= enemy.maxHp * 0.5) {
        enemy.enraged = true;
        soundEngine.play("levelUp");
        emitPopup("🔥 FÚRIA DO TITÃ: O CHEFÃO ENTROU EM FRENESI!", "#f43f5e");
      }

      const dx = enemy.x - heroPos.x;
      const dz = enemy.z - heroPos.z;
      const dist = Math.max(0.1, Math.hypot(dx, dz));
      const safeKnockback = Math.min(2.2, knockback);
      enemy.x += (dx / dist) * safeKnockback;
      enemy.z += (dz / dist) * safeKnockback;
      enemy.x = Math.max(-95, Math.min(95, enemy.x));
      enemy.z = Math.max(-95, Math.min(95, enemy.z));
      enemy.rig.root.position.set(enemy.x, 0, enemy.z);
      if (enemy.telegraph) {
        enemy.telegraph.position.set(enemy.x, 0.08, enemy.z);
      }

      if (enemy.rig.hpBarFill) {
        const pct = Math.max(0.01, enemy.hp / enemy.maxHp);
        enemy.rig.hpBarFill.scale.x = pct;
      }

      combo += 1;
      comboTimer = 4.5;
      soundEngine.play("hit");

      if (enemy.hp <= 0) {
        enemy.dead = true;
        enemy.rig.root.visible = false;
        enemy.telegraph.visible = false;
        enemiesDefeated += 1;
        const mult = Math.min(3, 1 + combo * 0.1);
        const pts = Math.round(enemy.points * mult);
        score += pts;

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.4, 1.3, 24),
          new THREE.MeshBasicMaterial({
            color: enemy.isBoss ? 0xfbbf24 : 0x34d399,
            side: THREE.DoubleSide,
            transparent: true,
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(enemy.x, 0.25, enemy.z);
        scene.add(ring);
        vfxList.push({ mesh: ring, age: 0, duration: 0.55, maxScale: 3.6 });

        // Civil NPC Rescue Praise Reaction!
        streetPeopleObjs.forEach((sp) => {
          if (Math.hypot(sp.data.x - enemy.x, sp.data.z - enemy.z) < 14) {
            emitPopup(`🙌 ${sp.data.name}: "Glória a Deus! Fomos libertos!"`, "#34d399");
            soundEngine.play("success");
            onEarnRef.current(20, 5);
          }
        });

        if (enemy.isBoss) {
          soundEngine.play("levelUp");
          onEarnRef.current(90, 30);
          emitPopup(`👑 BOSS VENCIDO! +${pts} PTS!`, "#fbbf24");
        } else {
          onEarnRef.current(15, 4);
          emitPopup(`⚔️ +${pts} PTS (${combo}x COMBO!)`, "#34d399");
        }
      } else {
        emitPopup(`-${amount}`, amount >= 80 ? "#fbbf24" : "#38bdf8");
      }
    };

    const dismountVehicle = () => {
      if (!activeVehicle) return;
      const tag = activeVehicle.mesh.getObjectByName("vehicleTag");
      if (tag) tag.visible = true;
      const flame = activeVehicle.mesh.getObjectByName("nitroFlame");
      if (flame) flame.visible = false;

      activeVehicle.x = heroPos.x + 2.6;
      activeVehicle.z = heroPos.z;
      activeVehicle.rotY = heroAngle;
      activeVehicle.mesh.position.set(activeVehicle.x, 0, activeVehicle.z);
      activeVehicle = null;
      nitroTimer = 0;
    };

    // --- ACTION DISPATCHER ---
    const performAction = (action: CombatActionType) => {
      if (pausedRef.current) return;

      if (
        action === "emoteSlash" ||
        action === "emoteVictory" ||
        action === "emoteDance" ||
        action === "emotePray"
      ) {
        if (activeVehicle) dismountVehicle();
        const mapEmote: Record<string, { type: HeroEmoteType; msg: string; col: string }> = {
          emoteSlash: { type: "slash_spin", msg: "⚔️ GIRO HEROICO!", col: "#38bdf8" },
          emoteVictory: { type: "victory", msg: "🙌 VITÓRIA & LOUVOR!", col: "#fbbf24" },
          emoteDance: { type: "dance", msg: "🕺 PASSINHO STREET!", col: "#c084fc" },
          emotePray: { type: "kneel_pray", msg: "🛡️ POSTURA DE FÉ!", col: "#34d399" },
        };
        const chosen = mapEmote[action];
        soundEngine.play(action === "emoteSlash" ? "slash" : action === "emotePray" ? "prayer" : "success");
        activeEmote = chosen.type;
        emoteTimer = 3.4;
        emoteElapsed = 0;
        emitPopup(chosen.msg, chosen.col);

        const emoteWave = new THREE.Mesh(
          new THREE.RingGeometry(0.45, 1.1, 28),
          new THREE.MeshBasicMaterial({
            color: chosen.col,
            side: THREE.DoubleSide,
            transparent: true,
          })
        );
        emoteWave.rotation.x = -Math.PI / 2;
        emoteWave.position.set(heroPos.x, 0.16, heroPos.z);
        scene.add(emoteWave);
        vfxList.push({ mesh: emoteWave, age: 0, duration: 0.7, maxScale: 3.4 });
        return;
      }

      if (action === "camera") {
        soundEngine.play("click");
        cameraMode = cameraMode === "gta" ? "moba" : "gta";
        if (cameraMode === "moba") {
          camYaw = 0;
          emitPopup("🎥 VISÃO ALTA (Panorâmica)", "#fbbf24");
        } else {
          emitPopup("🎥 3ª PESSOA (Visão de Rua)", "#38bdf8");
        }
        return;
      }

      if (action === "nitro") {
        if (!activeVehicle) {
          emitPopup("🚙 Entre em um Veículo [V] para usar o Turbo!", "#fbbf24");
          return;
        }
        if (nitroCooldown > 0) return;
        nitroTimer = 2.2;
        nitroCooldown = 4.5;
        soundEngine.play("dash");
        emitPopup("🚀 NITRO TURBO ATIVADO!", "#38bdf8");
        return;
      }

      if (action === "vehicleSwap") {
        preferredVehicle = preferredVehicle === "car" ? "moto" : "car";
        soundEngine.play("click");
        const meta = VEHICLE_RULES[preferredVehicle];
        emitPopup(
          `🔄 Selecionado: ${meta.emoji} ${meta.label.toUpperCase()} (${garageUnits[preferredVehicle]} disp. • ${fuelRemaining[preferredVehicle].toFixed(0)}s)`,
          "#38bdf8"
        );
        return;
      }

      if (action === "vehicleCar") {
        preferredVehicle = "car";
        if (!activeVehicle) {
          performAction("vehicle");
        } else if (activeVehicle.cfg.kind === "moto") {
          dismountVehicle();
          performAction("vehicle");
        }
        return;
      }

      if (action === "vehicleMoto") {
        preferredVehicle = "moto";
        if (!activeVehicle) {
          performAction("vehicle");
        } else if (activeVehicle.cfg.kind !== "moto") {
          dismountVehicle();
          performAction("vehicle");
        }
        return;
      }

      if (action === "vehicle") {
        soundEngine.play("vehicle");
        if (activeVehicle) {
          dismountVehicle();
          emitPopup("🏃 MODO A PÉ", "#e2e8f0");
        } else {
          const kind = preferredVehicle;
          if (garageUnits[kind] <= 0) {
            soundEngine.play("error");
            emitPopup(`❌ Sem ${VEHICLE_RULES[kind].label}s disponíveis na base!`, "#f43f5e");
            return;
          }
          let bestV =
            vehicles.find((v) =>
              kind === "moto" ? v.cfg.kind === "moto" : v.cfg.kind !== "moto"
            ) || vehicles[0];
          heroPos.set(heroPos.x, 0, heroPos.z);
          bestV.x = heroPos.x;
          bestV.z = heroPos.z;
          bestV.rotY = heroAngle;
          bestV.mesh.position.copy(heroPos);
          bestV.mesh.rotation.y = heroAngle;
          activeVehicle = bestV;
          const tag = bestV.mesh.getObjectByName("vehicleTag");
          if (tag) tag.visible = false;
          const meta = VEHICLE_RULES[kind];
          emitPopup(
            `${meta.emoji} ${bestV.cfg.name.toUpperCase()}! [${fuelRemaining[kind].toFixed(0)}s • Shift = Turbo]`,
            "#38bdf8"
          );
        }
        return;
      }

      if (action === "interact") {
        if (!currentNearby) return;

        if (currentNearby.kind === "race") {
          startCheckpointRace();
          return;
        }

        if (currentNearby.kind === "tower" && currentNearby.tower) {
          const tw = currentNearby.tower;
          if (!towerIdsRef.current.includes(tw.id)) {
            soundEngine.play("levelUp");
            score += tw.pointsReward;
            onTowerRef.current(tw);

            // Expanding Sonic Broadcast Wave VFX!
            const wave = new THREE.Mesh(
              new THREE.RingGeometry(1.0, 2.2, 32),
              new THREE.MeshBasicMaterial({
                color: 0x22d3ee,
                side: THREE.DoubleSide,
                transparent: true,
              })
            );
            wave.rotation.x = -Math.PI / 2;
            wave.position.set(tw.x, 0.4, tw.z);
            scene.add(wave);
            vfxList.push({ mesh: wave, age: 0, duration: 1.1, maxScale: 8.5 });

            emitPopup(`📡 ${tw.name.toUpperCase()} ATIVADA! +${tw.pointsReward} PTS`, "#22d3ee");
          } else {
            emitPopup("📡 Esta Torre já está transmitindo!", "#34d399");
          }
          return;
        }

        const consumed = onInteractRef.current(currentNearby, suppliesHeld);
        if (consumed && currentNearby.person?.questType === "supply") {
          const need = currentNearby.person.neededSupplies || 2;
          suppliesHeld = Math.max(0, suppliesHeld - need);
          score += currentNearby.person.pointsReward;
        } else if (consumed && currentNearby.person) {
          score += currentNearby.person.pointsReward;
        }
        return;
      }

      // Dismount if casting sword/magic skills
      if (activeVehicle && action !== "skillW") {
        dismountVehicle();
      }

      const fwdX = Math.sin(heroAngle);
      const fwdZ = Math.cos(heroAngle);

      if (action === "attack") {
        const now = performance.now();
        if (now - lastBasicAttackTime < 130) {
          return;
        }
        lastBasicAttackTime = now;

        // Combo chain window: within 850ms, advance to next strike; otherwise reset to 0
        if (now - lastAttackTime < 850) {
          attackComboStep = (attackComboStep + 1) % 3;
        } else {
          attackComboStep = 0;
        }
        lastAttackTime = now;

        let closest: LiveEnemy | null = null;
        let bestD = 5.8;
        for (const e of enemies) {
          if (e.dead) continue;
          const d = Math.hypot(e.x - heroPos.x, e.z - heroPos.z);
          if (d < bestD) {
            bestD = d;
            closest = e;
          }
        }
        if (closest) {
          heroAngle = Math.atan2(
            closest.x - heroPos.x,
            closest.z - heroPos.z
          );
        }

        if (attackComboStep === 0) {
          // Golpe 1: Corte Lateral Rápido
          soundEngine.play("slash");
          attackAnimTimer = 0.22;
          const dmg = 38;
          enemies.forEach((e) => {
            if (e.dead) return;
            if (Math.hypot(e.x - heroPos.x, e.z - heroPos.z) <= 5.0) {
              damageEnemy(e, dmg, 1.2);
            }
          });
        } else if (attackComboStep === 1) {
          // Golpe 2: Estocada Frontal Perfurante
          soundEngine.play("dash");
          attackAnimTimer = 0.22;
          const dmg = 50;
          enemies.forEach((e) => {
            if (e.dead) return;
            if (Math.hypot(e.x - heroPos.x, e.z - heroPos.z) <= 5.2) {
              damageEnemy(e, dmg, 1.8);
            }
          });
        } else {
          // Golpe 3: Giro Sagrado 360° com Knockback Massivo!
          soundEngine.play("levelUp");
          attackAnimTimer = 0.38;
          const dmg = 82;

          // Expanding Golden Shockwave VFX!
          const wave = new THREE.Mesh(
            new THREE.RingGeometry(0.8, 2.2, 32),
            new THREE.MeshBasicMaterial({
              color: 0xfbbf24,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.85,
            })
          );
          wave.rotation.x = -Math.PI / 2;
          wave.position.set(heroPos.x, 0.25, heroPos.z);
          scene.add(wave);
          vfxList.push({ mesh: wave, age: 0, duration: 0.65, maxScale: 4.5 });

          // Knockback across all nearby enemies!
          enemies.forEach((e) => {
            if (e.dead) return;
            if (Math.hypot(e.x - heroPos.x, e.z - heroPos.z) <= 5.8) {
              damageEnemy(e, dmg, e.isBoss ? 1.0 : e.tier === "elite" ? 1.6 : 2.2);
            }
          });

          emitPopup("⚡ COMBO 3-HIT! FINALIZADOR SAGRADO! -82 HP", "#fbbf24");
        }
      } else if (action === "skillQ") {
        if (cooldowns.q > 0) return;
        cooldowns.q = 3.5;
        soundEngine.play("slash");
        attackAnimTimer = 0.26;

        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.65, 14, 14),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee })
        );
        orb.position.set(heroPos.x + fwdX, 1.2, heroPos.z + fwdZ);
        scene.add(orb);
        projectiles.push({
          mesh: orb,
          vx: fwdX * 30,
          vz: fwdZ * 30,
          life: 0.95,
          hitIds: new Set(),
        });
      } else if (action === "skillW") {
        if (cooldowns.w > 0) return;
        cooldowns.w = 4.2;
        soundEngine.play("dash");
        dashTimer = 0.24;
        dashDirX = fwdX;
        dashDirZ = fwdZ;
      } else if (action === "skillE") {
        if (cooldowns.e > 0) return;
        cooldowns.e = 7.5;
        soundEngine.play("prayer");
        shieldTimer = 4.0;
        hp = Math.min(maxHp, hp + 42);
        emitPopup("🙏 ESCUDO DE FÉ +42 VIDA!", "#fde047");

        enemies.forEach((e) => {
          if (e.dead) return;
          if (Math.hypot(e.x - heroPos.x, e.z - heroPos.z) < 5.8) {
            damageEnemy(e, 60, 2.9);
          }
        });
      } else if (action === "skillR") {
        if (cooldowns.r > 0) return;
        cooldowns.r = 12.0;
        soundEngine.play("ult");

        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(1.6, 5.8, 28, 24, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0xfde047,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
          })
        );
        pillar.position.set(heroPos.x, 14, heroPos.z);
        scene.add(pillar);
        vfxList.push({ mesh: pillar, age: 0, duration: 0.85, maxScale: 2.0 });

        emitPopup("⚡ ULTIMATE: LUZ DAS NAÇÕES!", "#fbbf24");
        enemies.forEach((e) => {
          if (e.dead) return;
          if (Math.hypot(e.x - heroPos.x, e.z - heroPos.z) < 11.0) {
            damageEnemy(e, 210, 3.8);
          }
        });
      }
    };

    triggerActionFnRef.current = performAction;

    // --- KEYBOARD + MOUSE ORBIT / CLICK-TO-MOVE INPUTS ---
    const keys: Record<string, boolean> = {};
    let clickMoveTarget: THREE.Vector3 | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const k = e.key.toLowerCase();
      keys[k] = true;

      if (k === " ") {
        e.preventDefault();
        performAction("attack");
      } else if (k === "1" || k === "q") {
        performAction("skillQ");
      } else if (k === "2") {
        performAction("skillW");
      } else if (k === "3" || k === "e") {
        performAction("skillE");
      } else if (k === "4" || k === "r") {
        performAction("skillR");
      } else if (k === "5") {
        performAction("emoteSlash");
      } else if (k === "6") {
        performAction("emoteVictory");
      } else if (k === "7") {
        performAction("emoteDance");
      } else if (k === "8") {
        performAction("emotePray");
      } else if (k === "v") {
        performAction("vehicle");
      } else if (k === "t" || k === "x") {
        performAction("vehicleSwap");
      } else if (k === "shift") {
        if (activeVehicle) {
          performAction("nitro");
        } else {
          performAction("skillW");
        }
      } else if (k === "c") {
        performAction("camera");
      } else if (k === "f" || k === "enter") {
        performAction("interact");
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let isOrbitDragging = false;
    let isMouseDownMove = false;
    let orbitPointerId: number | null = null;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastOrbitX = 0;
    let movedDuringDrag = false;

    const dom = renderer.domElement;
    dom.style.touchAction = "none";

    const updateRaycastPoint = (clientX: number, clientY: number) => {
      const rect = dom.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(groundMesh);
      if (hits.length > 0) {
        const pt = hits[0].point;
        return {
          x: Math.max(-96, Math.min(96, pt.x)),
          z: Math.max(-96, Math.min(96, pt.z)),
        };
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (pausedRef.current || orbitPointerId !== null) return;
      orbitPointerId = e.pointerId;
      isOrbitDragging = true;
      movedDuringDrag = false;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      lastOrbitX = e.clientX;

      // In MOBA mode: mouse primary click triggers instant move or target attack (League of Legends style)
      if (cameraMode === "moba") {
        const groundPt = updateRaycastPoint(e.clientX, e.clientY);
        if (groundPt) {
          const clickedEnemy = enemies.find(
            (en) => !en.dead && Math.hypot(en.x - groundPt.x, en.z - groundPt.z) < 2.8
          );
          if (
            clickedEnemy &&
            Math.hypot(clickedEnemy.x - heroPos.x, clickedEnemy.z - heroPos.z) < 5.4
          ) {
            performAction("attack");
          } else {
            clickMoveTarget = new THREE.Vector3(groundPt.x, 0, groundPt.z);
            triggerMoveBeacon(groundPt.x, groundPt.z);
            isMouseDownMove = true;
            soundEngine.play("click");
          }
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (
        !isOrbitDragging ||
        orbitPointerId === null ||
        e.pointerId !== orbitPointerId ||
        pausedRef.current
      ) {
        return;
      }
      const dxTotal = e.clientX - pointerDownX;
      const dyTotal = e.clientY - pointerDownY;
      if (Math.hypot(dxTotal, dyTotal) > 7) {
        movedDuringDrag = true;
      }

      if (cameraMode === "gta") {
        if (movedDuringDrag) {
          const deltaX = e.clientX - lastOrbitX;
          camYaw -= deltaX * 0.0065;
          lastOrbitX = e.clientX;
        }
      } else if (isMouseDownMove) {
        // Continuous smooth mouse pathing while dragging (League of Legends fluidity!)
        const groundPt = updateRaycastPoint(e.clientX, e.clientY);
        if (groundPt) {
          clickMoveTarget = new THREE.Vector3(groundPt.x, 0, groundPt.z);
        }
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (orbitPointerId === null || e.pointerId !== orbitPointerId) return;
      orbitPointerId = null;
      isOrbitDragging = false;
      isMouseDownMove = false;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (
        !isOrbitDragging ||
        orbitPointerId === null ||
        e.pointerId !== orbitPointerId
      ) {
        return;
      }
      orbitPointerId = null;
      isOrbitDragging = false;
      isMouseDownMove = false;
      if (pausedRef.current) return;

      // In GTA mode: tap to click-move if user didn't drag the camera
      if (cameraMode === "gta" && !movedDuringDrag) {
        const groundPt = updateRaycastPoint(e.clientX, e.clientY);
        if (groundPt) {
          const clickedEnemy = enemies.find(
            (en) => !en.dead && Math.hypot(en.x - groundPt.x, en.z - groundPt.z) < 2.8
          );
          if (
            clickedEnemy &&
            Math.hypot(clickedEnemy.x - heroPos.x, clickedEnemy.z - heroPos.z) < 5.4
          ) {
            performAction("attack");
          } else {
            clickMoveTarget = new THREE.Vector3(groundPt.x, 0, groundPt.z);
            triggerMoveBeacon(groundPt.x, groundPt.z);
          }
        }
      }
    };

    let zoomMultiplier = 1.0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.08 : -0.08;
      zoomMultiplier = Math.max(0.62, Math.min(1.42, zoomMultiplier + delta));
    };

    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    const resizeObs =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => onResize())
        : null;
    resizeObs?.observe(container);

    // --- COLLISION RESOLVER ---
    const resolveWorldCollision = (nx: number, nz: number) => {
      let rx = nx;
      let rz = nz;
      for (const b of buildingColliders) {
        const dx = rx - b.x;
        const dz = rz - b.z;
        if (Math.abs(dx) < b.rx && Math.abs(dz) < b.rz) {
          const ox = b.rx - Math.abs(dx);
          const oz = b.rz - Math.abs(dz);
          if (ox < oz) {
            rx += dx >= 0 ? ox : -ox;
          } else {
            rz += dz >= 0 ? oz : -oz;
          }
        }
      }
      if (resolvedBiome === "amazonia" && !activeVehicle) {
        if (Math.abs(rz - 27) < 4.2) {
          const onBridge =
            Math.abs(rx) < 6.0 ||
            Math.abs(rx + 46) < 6.0 ||
            Math.abs(rx - 46) < 6.0;
          if (!onBridge) {
            rz = heroPos.z > 27 ? 31.25 : 22.75;
          }
        }
      }
      return {
        x: Math.max(-96, Math.min(96, rx)),
        z: Math.max(-96, Math.min(96, rz)),
      };
    };

    // Elevation helper: smoothly raises hero and partner on top of bridges (eliminates legs sinking)
    const getGroundElevation = (x: number, z: number): number => {
      if (resolvedBiome === "amazonia") {
        const onBridgeX =
          Math.abs(x) < 6.0 ||
          Math.abs(x + 46) < 6.0 ||
          Math.abs(x - 46) < 6.0;
        const distZ = Math.abs(z - 27);
        if (onBridgeX && distZ < 6.2) {
          const ramp = Math.min(1, (6.2 - distZ) / 1.2);
          return 0.52 * ramp;
        }
      }
      return 0;
    };

    // --- MAIN 60FPS GTA + MOBA OPEN-WORLD GAME LOOP ---
    let animId = 0;
    let lastTime = performance.now();
    let lastHudSync = 0;
    let walkCycle = 0;
    let idleClock = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      let isMoving = false;

      // Ambient Cruising GTA Traffic
      ambientCars.forEach((c) => {
        c.mesh.position[c.axis] += c.speed * dt;
        if (c.mesh.position[c.axis] > c.limit) c.mesh.position[c.axis] = -c.limit;
        if (c.mesh.position[c.axis] < -c.limit) c.mesh.position[c.axis] = c.limit;
      });

      // Ambient Walking Sidewalk Pedestrians
      pedestrians.forEach((ped) => {
        ped.phase += dt * 7.5;
        ped.rig.root.position.x += ped.speed * ped.dir * dt;
        if (ped.rig.root.position.x > ped.baseX + ped.range) ped.dir = -1;
        if (ped.rig.root.position.x < ped.baseX - ped.range) ped.dir = 1;
        ped.rig.root.rotation.y = ped.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        animateHumanRig(ped.rig, ped.phase, true, false, 0);
      });

      totemCrystal.rotation.y += 1.5 * dt;
      nexusRing.rotation.z += (dialogueDoneRef.current ? 2.5 : 0.6) * dt;
      nexusCore.rotation.y += 2.0 * dt;

      // Sync Radio Tower Visuals
      radioTowerObjs.forEach((twObj) => {
        const done = towerIdsRef.current.includes(twObj.data.id);
        (twObj.beacon.material as THREE.MeshBasicMaterial).color.setHex(
          done ? 0x10b981 : Math.sin(now * 0.008) > 0 ? 0xf43f5e : 0x881337
        );
        (twObj.ring.material as THREE.MeshBasicMaterial).color.setHex(
          done ? 0x10b981 : 0x38bdf8
        );
        if (done) {
          twObj.dish.rotation.z += dt * 1.4;
        }
      });

      if (!pausedRef.current) {
        idleClock += dt;
        cooldowns.q = Math.max(0, cooldowns.q - dt);
        cooldowns.w = Math.max(0, cooldowns.w - dt);
        cooldowns.e = Math.max(0, cooldowns.e - dt);
        cooldowns.r = Math.max(0, cooldowns.r - dt);
        nitroCooldown = Math.max(0, nitroCooldown - dt);
        if (nitroTimer > 0) nitroTimer = Math.max(0, nitroTimer - dt);

        if (comboTimer > 0) {
          comboTimer -= dt;
          if (comboTimer <= 0) combo = 0;
        }
        if (attackAnimTimer > 0) attackAnimTimer -= dt;
        if (shieldTimer > 0) shieldTimer -= dt;
        if (hurtFlash > 0) hurtFlash = Math.max(0, hurtFlash - dt);

        // Vehicle Fuel countdown & Recall
        if (activeVehicle) {
          const vKind: VehicleClass =
            activeVehicle.cfg.kind === "moto" ? "moto" : "car";
          fuelRemaining[vKind] -= dt;
          if (fuelRemaining[vKind] <= 0) {
            fuelRemaining[vKind] = 0;
            garageUnits[vKind] = Math.max(0, garageUnits[vKind] - 1);
            dismountVehicle();
            soundEngine.play("error");
            if (garageUnits[vKind] > 0) {
              fuelRemaining[vKind] = VEHICLE_RULES[vKind].seconds;
              emitPopup(
                `⚠️ Combustível da ${VEHICLE_RULES[vKind].label} esgotou! (${garageUnits[vKind]} restantes)`,
                "#f59e0b"
              );
            } else {
              emitPopup(
                `❌ Todas as ${VEHICLE_RULES[vKind].label}s foram utilizadas!`,
                "#f43f5e"
              );
            }
          }
        }

        if (emoteTimer > 0) {
          emoteTimer = Math.max(0, emoteTimer - dt);
          emoteElapsed += dt;
          if (emoteTimer <= 0) {
            activeEmote = "idle";
          }
        }

        // Timed GTA Checkpoint Express Race Logic!
        if (raceActive) {
          raceTimeLeft -= dt;
          const cp = raceCfg.checkpoints[raceCheckpointIdx];
          if (cp) {
            activeCheckpointGroup.visible = true;
            activeCheckpointGroup.position.set(cp.x, 0, cp.z);
            cpTorus.rotation.y += dt * 3.0;

            if (Math.hypot(heroPos.x - cp.x, heroPos.z - cp.z) < 5.6) {
              soundEngine.play("pickup");
              raceCheckpointIdx += 1;
              score += 120;
              if (raceCheckpointIdx >= raceCfg.checkpoints.length) {
                // RACE WON!
                raceActive = false;
                activeCheckpointGroup.visible = false;
                score += raceCfg.pointsReward;
                soundEngine.play("levelUp");
                onRaceRef.current();
                emitPopup(
                  `🏆 CORRIDA CONCLUÍDA! +${raceCfg.pointsReward} PTS!`,
                  "#fbbf24"
                );
              } else {
                emitPopup(
                  `🏁 CHECKPOINT ${raceCheckpointIdx}/${raceCfg.checkpoints.length}!`,
                  "#34d399"
                );
              }
            }
          }
          if (raceTimeLeft <= 0 && raceActive) {
            raceActive = false;
            activeCheckpointGroup.visible = false;
            soundEngine.play("error");
            emitPopup("⏰ Tempo Esgotado! Volte à Largada 🏁 para tentar de novo!", "#f43f5e");
          }
        } else {
          activeCheckpointGroup.visible = false;
          // Auto-trigger race if driving a vehicle right through the Start Arch!
          if (
            activeVehicle &&
            !raceDoneRef.current &&
            Math.hypot(heroPos.x - raceCfg.startX, heroPos.z - raceCfg.startZ) <
              3.4
          ) {
            startCheckpointRace();
          }
        }

        // Camera-Relative Movement Input (WASD / Arrows / Touch Thumbstick / Click)
        let rawX = joystickRef.current.x;
        let rawY = joystickRef.current.y; // negative = up/forward
        if (keys["w"] || keys["arrowup"]) rawY -= 1;
        if (keys["s"] || keys["arrowdown"]) rawY += 1;
        if (keys["a"] || keys["arrowleft"]) rawX -= 1;
        if (keys["d"] || keys["arrowright"]) rawX += 1;

        isMoving = false;
        const inputLen = Math.hypot(rawX, rawY);
        // Fast, agile runner speed on mobile: 15.6 units/s base on foot, 18.2 with sprint deflection!
        const footSpeed = 15.6 * (inputLen > 0.88 ? 1.18 : 1.0);
        const vehSpeed = activeVehicle ? activeVehicle.cfg.topSpeed : footSpeed;
        const baseSpeed =
          activeVehicle && nitroTimer > 0 ? vehSpeed * 1.55 : vehSpeed;

        if (dashTimer > 0) {
          dashTimer -= dt;
          const next = resolveWorldCollision(
            heroPos.x + dashDirX * 34 * dt,
            heroPos.z + dashDirZ * 34 * dt
          );
          heroPos.set(next.x, 0, next.z);
          isMoving = true;
          enemies.forEach((en) => {
            if (
              !en.dead &&
              Math.hypot(en.x - heroPos.x, en.z - heroPos.z) < 2.8
            ) {
              damageEnemy(en, 38, 2.2);
            }
          });
        } else if (Math.hypot(rawX, rawY) > 0.08) {
          clickMoveTarget = null;
          const len = Math.hypot(rawX, rawY);
          const normRight = rawX / len;
          const normFwd = -rawY / len; // +1 when pressing W / Joystick Up

          // Transform relative to current Camera Yaw!
          const camFwdX = -Math.sin(camYaw);
          const camFwdZ = -Math.cos(camYaw);
          const camRightX = Math.cos(camYaw);
          const camRightZ = -Math.sin(camYaw);

          const worldDirX = camFwdX * normFwd + camRightX * normRight;
          const worldDirZ = camFwdZ * normFwd + camRightZ * normRight;

          const resolved = resolveWorldCollision(
            heroPos.x + worldDirX * baseSpeed * dt,
            heroPos.z + worldDirZ * baseSpeed * dt
          );
          heroPos.set(resolved.x, 0, resolved.z);
          heroAngle = Math.atan2(worldDirX, worldDirZ);
          isMoving = true;

          // Gently swing GTA chase camera behind vehicle when accelerating straight forward
          if (
            cameraMode === "gta" &&
            activeVehicle &&
            !isOrbitDragging &&
            normFwd > 0.55 &&
            Math.abs(normRight) < 0.38
          ) {
            const targetYaw = heroAngle + Math.PI;
            const diff = Math.atan2(
              Math.sin(targetYaw - camYaw),
              Math.cos(targetYaw - camYaw)
            );
            camYaw += diff * 1.9 * dt;
          }
        } else if (clickMoveTarget) {
          const dx = clickMoveTarget.x - heroPos.x;
          const dz = clickMoveTarget.z - heroPos.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.45) {
            const step = Math.min(dist, baseSpeed * dt);
            const resolved = resolveWorldCollision(
              heroPos.x + (dx / dist) * step,
              heroPos.z + (dz / dist) * step
            );
            heroPos.set(resolved.x, 0, resolved.z);
            const targetAngle = Math.atan2(dx, dz);
            const angleDiff = Math.atan2(
              Math.sin(targetAngle - heroAngle),
              Math.cos(targetAngle - heroAngle)
            );
            heroAngle += angleDiff * Math.min(1, 16 * dt);
            isMoving = true;
          } else {
            clickMoveTarget = null;
          }
        }

        // Vehicle Ramming Damage
        if (activeVehicle && isMoving) {
          const ramDmg = nitroTimer > 0 ? 110 : 65;
          enemies.forEach((en) => {
            if (
              !en.dead &&
              Math.hypot(en.x - heroPos.x, en.z - heroPos.z) < 3.1
            ) {
              damageEnemy(en, ramDmg, nitroTimer > 0 ? 5.2 : 3.5);
            }
          });
        }

        // Sync Hero & Active Vehicle Transforms + Realistic Elevation & Animations!
        const heroElev = getGroundElevation(heroPos.x, heroPos.z);
        heroPos.y += (heroElev - heroPos.y) * Math.min(1, 16 * dt);
        heroHolder.position.copy(heroPos);
        heroHolder.rotation.y = heroAngle;

        if (activeVehicle) {
          activeVehicle.x = heroPos.x;
          activeVehicle.z = heroPos.z;
          activeVehicle.rotY = heroAngle;
          activeVehicle.mesh.position.copy(heroPos);
          activeVehicle.mesh.rotation.y = heroAngle;
          const flame = activeVehicle.mesh.getObjectByName("nitroFlame");
          if (flame) {
            flame.visible = nitroTimer > 0;
            flame.scale.setScalar(0.85 + Math.random() * 0.45);
          }
        }

        if (isMoving) {
          if (activeEmote !== "idle") {
            activeEmote = "idle";
            emoteTimer = 0;
          }
          if (!activeVehicle) {
            walkCycle += dt * 13.5;
          }
        }

        const currentRig = heroRigRef.current;
        if (currentRig) {
          animateHumanRig(
            currentRig,
            walkCycle,
            isMoving,
            Boolean(activeVehicle),
            attackAnimTimer,
            idleClock,
            activeEmote,
            emoteElapsed
          );

          // Sword Slash Arc, 3-Hit Combo Motion & Shield Dome
          if (attackAnimTimer > 0) {
            if (attackComboStep === 0) {
              // Golpe 1: Corte horizontal da direita para a esquerda
              currentRig.rightArmPivot.rotation.x = -1.3 + attackAnimTimer * 3.5;
              currentRig.rightArmPivot.rotation.z = -0.5 + attackAnimTimer * 2.0;
            } else if (attackComboStep === 1) {
              // Golpe 2: Estocada frontal com estiramento do braço
              currentRig.rightArmPivot.rotation.x = -1.9 + attackAnimTimer * 1.5;
              currentRig.rightArmPivot.rotation.y = 0.35 - attackAnimTimer * 1.5;
            } else {
              // Golpe 3: Golpe Sagrado Descendente de Luz
              currentRig.rightArmPivot.rotation.x = -2.1 + (0.38 - attackAnimTimer) * 4.8;
              currentRig.leftArmPivot.rotation.x = -2.1 + (0.38 - attackAnimTimer) * 4.8;
              currentRig.rightArmPivot.rotation.z = -0.25;
              currentRig.leftArmPivot.rotation.z = 0.25;
            }

            if (currentRig.slashArc) {
              currentRig.slashArc.rotation.z += dt * 20;
              (currentRig.slashArc.material as THREE.MeshBasicMaterial).opacity =
                Math.min(0.95, attackAnimTimer * 4.2);
            }
          } else {
            currentRig.bodyGroup.position.y = 0;
            currentRig.bodyGroup.rotation.y = 0;
            if (currentRig.slashArc) {
              (currentRig.slashArc.material as THREE.MeshBasicMaterial).opacity = 0;
            }
          }

          if (currentRig.shieldDome) {
            currentRig.shieldDome.rotation.y += dt * 2.5;
            (currentRig.shieldDome.material as THREE.MeshBasicMaterial).opacity =
              shieldTimer > 0 ? 0.42 : 0;
          }
        }

        // --- ANIMATE 3D CO-OP DUO PARTNER RIG & SYNCHRONIZED POSITION ---
        if (coopPartnerRef.current) {
          const cp = coopPartnerRef.current;
          const cpAvatar = (cp.avatarId || "sofia") as AvatarId;
          const cpSkin = (cp.skinId || "padrao") as SkinId;
          const cpRoleLabel = cp.role === "driver" ? "PILOTO" : "GUARDIÃO";
          const cpName = `${cp.name} [${cpRoleLabel}]`;

          if (
            !partnerRig ||
            partnerRigAvatarId !== cpAvatar ||
            partnerRigSkinId !== cpSkin ||
            partnerRigName !== cpName
          ) {
            if (partnerRig) {
              partnerHolder.remove(partnerRig.root);
            }
            partnerRig = createPlayableChampion3D(
              cpAvatar,
              cpName,
              cpSkin,
              true // showNameplate is TRUE!
            );
            partnerRigAvatarId = cpAvatar;
            partnerRigSkinId = cpSkin;
            partnerRigName = cpName;
            partnerHolder.add(partnerRig.root);
            if (!scene.children.includes(partnerHolder)) {
              scene.add(partnerHolder);
            }
          }

          if (coopPartnerPosRef.current) {
            partnerTargetPos.x = coopPartnerPosRef.current.x;
            partnerTargetPos.z = coopPartnerPosRef.current.z;
            partnerTargetAngle = coopPartnerPosRef.current.angle;
            partnerInVehicle = coopPartnerPosRef.current.inVehicle;
            partnerSpeed = coopPartnerPosRef.current.speed || 0;
            partnerIsMoving = partnerSpeed > 0.5;
          } else {
            // Solo AI Partner companion mode (follows the player smoothly)
            const distToHero = partnerPos.distanceTo(heroPos);
            if (distToHero > 4.2) {
              const dirX = heroPos.x - partnerPos.x;
              const dirZ = heroPos.z - partnerPos.z;
              partnerTargetAngle = Math.atan2(dirX, dirZ);
              partnerTargetPos.x += Math.sin(partnerTargetAngle) * 8.5 * dt;
              partnerTargetPos.z += Math.cos(partnerTargetAngle) * 8.5 * dt;
              partnerIsMoving = true;
              partnerSpeed = 8.5;
            } else {
              partnerIsMoving = false;
              partnerSpeed = 0;
            }
          }

          partnerPos.x += (partnerTargetPos.x - partnerPos.x) * Math.min(1, 14 * dt);
          partnerPos.z += (partnerTargetPos.z - partnerPos.z) * Math.min(1, 14 * dt);
          partnerAngle += (partnerTargetAngle - partnerAngle) * Math.min(1, 12 * dt);

          if (resolvedBiome === "amazonia" && !partnerInVehicle) {
            const onBridge =
              Math.abs(partnerPos.x) < 5.8 ||
              Math.abs(partnerPos.x + 46) < 5.8 ||
              Math.abs(partnerPos.x - 46) < 5.8;
            if (!onBridge && Math.abs(partnerPos.z - 27) < 4.8) {
              partnerPos.z = partnerPos.z > 27 ? 31.9 : 22.1;
            }
          }

          const pElevation = getGroundElevation(partnerPos.x, partnerPos.z);
          partnerPos.y += (pElevation - partnerPos.y) * Math.min(1, 16 * dt);

          partnerHolder.position.copy(partnerPos);
          partnerHolder.rotation.y = partnerAngle;

          if (partnerIsMoving) {
            partnerWalkCycle += dt * 12.0;
          }

          animateHumanRig(
            partnerRig,
            partnerWalkCycle,
            partnerIsMoving,
            partnerInVehicle,
            0,
            idleClock,
            "idle",
            0
          );

          // Co-op Cargo Threat: Shadows attack cargo if near active vehicle
          const veh = activeVehicle;
          if (veh) {
            const shadowNearCargo = enemies.some(
              (en) =>
                !en.dead &&
                Math.hypot(en.x - veh.x, en.z - veh.z) < 4.8
            );
            if (shadowNearCargo && Math.random() < dt * 0.7) {
              onCoopCargoDamageRef.current?.(4);
              emitPopup("⚠️ Carga atacada por sombras! (-4%)", "#f43f5e");
            }
          }
        }

        // GPS Arrow, Holographic Waypoint Trail & Destination Sky Beam
        const activeTarget =
          raceActive && raceCfg.checkpoints[raceCheckpointIdx]
            ? raceCfg.checkpoints[raceCheckpointIdx]
            : gpsTargetRef.current;

        gpsPivot.position.set(heroPos.x, 0.06, heroPos.z);
        const gx = activeTarget.x - heroPos.x;
        const gz = activeTarget.z - heroPos.z;
        gpsPivot.rotation.y = Math.atan2(gx, gz);
        gpsPivot.visible = Math.hypot(gx, gz) > 4.5;

        gpsDestinationBeam.position.set(activeTarget.x, 14, activeTarget.z);
        gpsDestinationBeam.visible = !raceActive && Math.hypot(gx, gz) > 6.0;

        // Animate Holographic Road Waypoint Trail (Soft, gentle guide dots)
        const totalDist = Math.hypot(gx, gz);
        if (totalDist > 8.0 && totalDist < 90.0) {
          gpsTrailGroup.visible = true;
          const trailLength = Math.min(totalDist - 3.0, 24);
          const progressOffset = (idleClock * 0.9) % 1.0;
          for (let i = 0; i < trailChevronCount; i++) {
            const t = (i + progressOffset) / trailChevronCount;
            const distOnLine = 3.5 + t * trailLength;
            const px = heroPos.x + (gx / totalDist) * distOnLine;
            const pz = heroPos.z + (gz / totalDist) * distOnLine;
            trailChevrons[i].position.set(px, 0.04, pz);
            const alpha = Math.sin(t * Math.PI) * 0.22;
            (trailChevrons[i].material as THREE.MeshBasicMaterial).opacity =
              Math.max(0.04, alpha);
            (trailChevrons[i].material as THREE.MeshBasicMaterial).color.setHex(
              raceActive ? 0xfbbf24 : 0x38bdf8
            );
          }
        } else {
          gpsTrailGroup.visible = false;
        }

        // Collectibles Magnet & Pickup
        collectibles.forEach((c) => {
          if (c.collected) return;
          c.mesh.rotation.y += 2.2 * dt;
          c.mesh.position.y = 0.85 + Math.sin(now * 0.004 + c.x) * 0.16;

          // Animação de pulsação de batimento cardíaco para o Coração 3D
          if (c.kind === "heart") {
            const pulse = 1 + Math.sin(now * 0.007) * 0.14;
            c.mesh.scale.set(pulse, pulse, pulse);
          } else if (c.kind === "gem") {
            // Leve oscilação de brilho angular para o Diamante
            c.mesh.rotation.z = Math.sin(now * 0.003) * 0.1;
          }

          const dist = Math.hypot(c.x - heroPos.x, c.z - heroPos.z);
          if (dist < 4.8) {
            c.x += ((heroPos.x - c.x) / Math.max(0.2, dist)) * 17 * dt;
            c.z += ((heroPos.z - c.z) / Math.max(0.2, dist)) * 17 * dt;
            c.mesh.position.x = c.x;
            c.mesh.position.z = c.z;
          }
          if (dist < 2.0) {
            c.collected = true;
            c.mesh.visible = false;
            soundEngine.play("pickup");
            score += c.points;

            if (c.kind === "scroll") {
              scrollsCollected += 1;
              onEarnRef.current(25, 10);
              emitPopup(
                `📜 PERGAMINHO (${scrollsCollected}/${totalScrolls}) +${c.points} PTS!`,
                "#fbbf24"
              );
            } else if (c.kind === "supply") {
              suppliesHeld += 1;
              onEarnRef.current(15, 5);
              emitPopup(`📦 +1 CAIXA: ${c.label.toUpperCase()}!`, "#38bdf8");
            } else if (c.kind === "heart") {
              hp = Math.min(maxHp, hp + 35);
              emitPopup("❤️ VIDA RECUPERADA: +35 HP!", "#f43f5e");
            } else {
              onEarnRef.current(10, 6);
              emitPopup(`💎 DIAMANTE DE SABEDORIA: +${c.points} PTS!`, "#06b6d4");
            }
          }
        });

        // Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i];
          p.life -= dt;
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.z += p.vz * dt;

          enemies.forEach((en) => {
            if (en.dead || p.hitIds.has(en.id)) return;
            if (
              Math.hypot(
                en.x - p.mesh.position.x,
                en.z - p.mesh.position.z
              ) < 2.3
            ) {
              p.hitIds.add(en.id);
              damageEnemy(en, 88, 2.2);
            }
          });

          if (p.life <= 0) {
            scene.remove(p.mesh);
            projectiles.splice(i, 1);
          }
        }

        // Shadow Projectiles (Hostile caster spells)
        for (let i = shadowProjectiles.length - 1; i >= 0; i--) {
          const sp = shadowProjectiles[i];
          sp.life -= dt;
          sp.mesh.position.x += sp.vx * dt;
          sp.mesh.position.z += sp.vz * dt;
          if (
            Math.hypot(
              sp.mesh.position.x - heroPos.x,
              sp.mesh.position.z - heroPos.z
            ) < 1.9
          ) {
            if (shieldTimer <= 0) {
              const dmg = sp.damage || 14;
              hp = Math.max(0, hp - dmg);
              hurtFlash = 0.35;
              soundEngine.play("error");
              emitPopup(`💥 ${sp.label || "ORBE SOMBRIO"}! -${dmg} HP`, "#f43f5e");
              if (hp <= 0) {
                hp = maxHp;
                heroPos.set(
                  WORLD_LANDMARKS.spawn.x,
                  0,
                  WORLD_LANDMARKS.spawn.z
                );
                emitPopup("✨ RESTAURADO NA BASE IDE!", "#38bdf8");
              }
            } else {
              emitPopup("🛡️ FEITIÇO SOMBRIO ABSORVIDO!", "#fde047");
            }
            scene.remove(sp.mesh);
            shadowProjectiles.splice(i, 1);
            continue;
          }
          if (sp.life <= 0) {
            scene.remove(sp.mesh);
            shadowProjectiles.splice(i, 1);
          }
        }

        // Expanding VFX
        for (let i = vfxList.length - 1; i >= 0; i--) {
          const fx = vfxList[i];
          fx.age += dt;
          const t = fx.age / fx.duration;
          const s = 1 + t * (fx.maxScale - 1);
          fx.mesh.scale.set(s, 1, s);
          (fx.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
            0,
            0.85 * (1 - t)
          );
          if (fx.age >= fx.duration) {
            scene.remove(fx.mesh);
            vfxList.splice(i, 1);
          }
        }

        // --- ENHANCED SHADOWS & DISTRICT BOSS PURSUIT, FLEE & PATROL AI ---
        enemies.forEach((en, eIdx) => {
          if (en.dead) return;
          if (en.attackCd > 0) en.attackCd -= dt;
          if (en.chargeCd > 0) en.chargeCd -= dt;
          if (en.aggroTimer > 0) en.aggroTimer -= dt;
          if (en.fleeTimer > 0) en.fleeTimer -= dt;
          if (en.fleeCooldown > 0) en.fleeCooldown -= dt;

          const dx = heroPos.x - en.x;
          const dz = heroPos.z - en.z;
          const distHero = Math.hypot(dx, dz);
          const distHome = Math.hypot(en.x - en.homeX, en.z - en.homeZ);

          let enemyMoving = false;

          // Leash distance: prevents enemies from chasing the player indefinitely across the map
          const maxLeash = en.isBoss ? 28 : en.tier === "elite" ? 22 : 16;
          if (distHome > maxLeash || distHero > (maxLeash + 8)) {
            if (en.aggroTimer > 0) {
              en.aggroTimer = 0;
              en.telegraph.visible = false;
              en.windup = 0;
            }
          }

          // Tactical vision aggro radius: Boss 22m, Elite 15m, Minor 10m
          const aggroRadius = en.isBoss ? 22 : en.tier === "elite" ? 15 : 10;
          if (distHero < aggroRadius && distHome <= maxLeash && en.fleeTimer <= 0) {
            const wasPassive = en.aggroTimer <= 0;
            en.aggroTimer = Math.max(en.aggroTimer, en.isBoss ? 12.0 : en.tier === "elite" ? 8.0 : 5.0);
            if (wasPassive && en.isBoss) {
              emitPopup(`👑 ${en.name}: 'A LUZ NÃO PASSARÁ POR ESTA FRONTEIRA!'`, "#f43f5e");
              soundEngine.play("error");
            } else if (wasPassive && en.tier === "elite") {
              emitPopup(`⚠️ ${en.name} EM COMBATE!`, "#f43f5e");
            }
          }

          // Branch 1: Cowardice / Tactical Fleeing (running away from light/hero)
          if (en.fleeTimer > 0) {
            const fleeSpd = en.tier === "minor" ? 6.2 : 5.4;
            const awayDirX = distHero > 0.01 ? -dx / distHero : 1;
            const awayDirZ = distHero > 0.01 ? -dz / distHero : 0;
            en.x += awayDirX * fleeSpd * dt;
            en.z += awayDirZ * fleeSpd * dt;
            en.rig.root.rotation.y = Math.atan2(awayDirX, awayDirZ);
            enemyMoving = true;
          } else if (en.aggroTimer > 0) {
            // Branch 2: Active Combat Pursuit & Attacks
            // Boss Dash / Rush Attack when player is at medium distance
            if (
              en.isBoss &&
              en.chargeCd <= 0 &&
              distHero >= 6.5 &&
              distHero <= 19.0 &&
              en.dashTimer <= 0
            ) {
              en.dashTimer = 0.58;
              en.chargeCd = en.enraged ? 4.5 : 6.8;
              en.dashDirX = dx / distHero;
              en.dashDirZ = dz / distHero;
              soundEngine.play("dash");
              emitPopup("⚠️ INVESTIDA DO TITÃ DAS SOMBRAS!", "#f43f5e");
            } else if (
              en.tier === "elite" &&
              en.chargeCd <= 0 &&
              distHero >= 5.5 &&
              distHero <= 15.0 &&
              en.dashTimer <= 0
            ) {
              // Elite Shadow Rapid Ambush Dash!
              en.dashTimer = 0.35;
              en.chargeCd = Math.max(3.2, 4.8 - playerLevel * 0.15);
              en.dashDirX = dx / distHero;
              en.dashDirZ = dz / distHero;
              soundEngine.play("dash");
              emitPopup("⚡ SOMBRA DE ELITE AVANÇOU EM DASH!", "#f43f5e");
            }

            if (en.dashTimer > 0) {
              en.dashTimer -= dt;
              const dashSpd = en.isBoss ? 17.5 : 15.0;
              en.x += en.dashDirX * dashSpd * dt;
              en.z += en.dashDirZ * dashSpd * dt;
              en.rig.root.rotation.y = Math.atan2(en.dashDirX, en.dashDirZ);
              enemyMoving = true;

              if (distHero < (en.isBoss ? 3.2 : 2.4)) {
                if (shieldTimer <= 0) {
                  const chargeDmg = en.isBoss
                    ? en.enraged ? 35 + playerLevel * 3.5 : 24 + playerLevel * 2.5
                    : 16 + playerLevel * 2.0;
                  const finalChargeDmg = Math.round(chargeDmg * (playerLevel === 1 ? 0.8 : 1.0));
                  hp = Math.max(0, hp - finalChargeDmg);
                  hurtFlash = 0.35;
                  soundEngine.play("error");
                  const chargeLabel = en.isBoss ? "IMPACTO DO TITÃ!" : "IMPACTO DA SOMBRA DE ELITE!";
                  emitPopup(`💥 ${chargeLabel} -${finalChargeDmg} HP`, "#f43f5e");
                  if (hp <= 0) {
                    hp = maxHp;
                    heroPos.set(WORLD_LANDMARKS.spawn.x, 0, WORLD_LANDMARKS.spawn.z);
                    emitPopup("✨ RESTAURADO NA BASE IDE!", "#38bdf8");
                  }
                } else {
                  emitPopup("🛡️ INVESTIDA REPELIDA PELO ESCUDO!", "#fde047");
                }
              }
            } else {
              // Active Pursuit & Tactical Flanking AI
              const baseAngle = Math.atan2(dx, dz);
              const chaseAngle = en.isBoss ? baseAngle : baseAngle + en.flankOffset;
              const chaseDirX = Math.sin(chaseAngle);
              const chaseDirZ = Math.cos(chaseAngle);
              en.rig.root.rotation.y = baseAngle;

              const stopDist = en.isBoss ? 3.6 : en.tier === "elite" ? 2.5 : 2.2;
              if (distHero > stopDist && en.windup <= 0) {
                const spd = en.isBoss
                  ? (en.enraged ? 7.2 : 5.8)
                  : en.tier === "elite"
                    ? 5.4 + playerLevel * 0.12
                    : 3.5 + playerLevel * 0.08;
                en.x += chaseDirX * spd * dt;
                en.z += chaseDirZ * spd * dt;
                enemyMoving = true;
              } else {
                // In melee range: start or progress windup with telegraphed danger ring!
                if (en.attackCd <= 0 && en.windup <= 0) {
                  en.windup = en.windupTotal;
                  en.telegraph.visible = true;
                  en.telegraph.position.set(en.x, 0.08, en.z);
                  en.telegraph.scale.set(0.15, 0.15, 0.15);
                  (en.telegraph.material as THREE.MeshBasicMaterial).opacity = 0.65;
                  en.rig.rightArmPivot.rotation.x = -1.9;
                  if (en.tier === "elite") {
                    en.rig.leftArmPivot.rotation.x = -1.9; // Dual-wielding elite raises both blades!
                  }
                } else if (en.windup > 0) {
                  en.windup -= dt;
                  const progress = 1 - Math.max(0, en.windup / en.windupTotal);
                  const tgScale = 0.2 + progress * 0.8;
                  en.telegraph.position.set(en.x, 0.08, en.z);
                  en.telegraph.scale.set(tgScale, tgScale, tgScale);
                  en.rig.rightArmPivot.rotation.x = -1.9 + progress * 0.4;
                  if (en.tier === "elite") {
                    en.rig.leftArmPivot.rotation.x = -1.9 + progress * 0.4;
                  }

                  if (en.windup <= 0) {
                    en.telegraph.visible = false;
                    en.attackCd = en.isBoss
                      ? (en.enraged ? 1.2 : 1.7)
                      : en.tier === "elite"
                        ? Math.max(1.3, 1.8 - playerLevel * 0.08)
                        : Math.max(2.4, 3.4 - playerLevel * 0.15);
                    en.rig.rightArmPivot.rotation.x = 0.9;
                    if (en.tier === "elite") en.rig.leftArmPivot.rotation.x = 0.9;

                    if (distHero <= (en.isBoss ? 4.8 : en.tier === "elite" ? 3.4 : 2.8)) {
                      if (shieldTimer <= 0) {
                        const rawDmg = en.isBoss
                          ? en.enraged ? 32 + playerLevel * 3 : 22 + playerLevel * 2.2
                          : en.tier === "elite"
                            ? 18 + playerLevel * 2.2
                            : 8 + playerLevel * 1.2;
                        const dmgTaken = Math.round(rawDmg * (playerLevel === 1 ? 0.8 : 1.0));
                        hp = Math.max(0, hp - dmgTaken);
                        hurtFlash = 0.35;
                        soundEngine.play("error");
                        const attackLabel = en.isBoss
                          ? "GOLPE ESMAGADOR DO TITÃ!"
                          : en.tier === "elite"
                            ? "GOLPE DA SOMBRA DE ELITE!"
                            : "GOLPE DA SOMBRA MENOR!";
                        emitPopup(`💥 ${attackLabel} -${dmgTaken} HP`, en.tier === "minor" ? "#a855f7" : "#f43f5e");
                        if (hp <= 0) {
                          hp = maxHp;
                          heroPos.set(
                            WORLD_LANDMARKS.spawn.x,
                            0,
                            WORLD_LANDMARKS.spawn.z
                          );
                          emitPopup("✨ RESTAURADO NA BASE IDE!", "#38bdf8");
                        }
                      } else {
                        emitPopup("🛡️ GOLPE REPELIDO PELO ESCUDO!", "#fde047");
                      }
                    }
                  }
                }
              }

              // Ranged Attacks: Boss fires triple spread barrage, Elite fires fast homing void bolts!
              if (en.isBoss && distHero >= 7.0 && distHero <= 26.0) {
                if (en.boltCd > 0) en.boltCd -= dt;
                if (en.boltCd <= 0) {
                  en.boltCd = en.enraged ? 3.0 : 4.4;
                  soundEngine.play("dash");
                  emitPopup("🔥 TITÃ DISPAROU BARRAGEM SOMBRIA!", "#f43f5e");
                  const baseAng = Math.atan2(dx, dz);
                  [-0.26, 0, 0.26].forEach((angOffset) => {
                    const boltMesh = new THREE.Mesh(
                      new THREE.SphereGeometry(0.55, 12, 12),
                      new THREE.MeshBasicMaterial({ color: 0xf43f5e })
                    );
                    boltMesh.position.set(en.x, 2.2, en.z);
                    scene.add(boltMesh);
                    const bAngle = baseAng + angOffset;
                    shadowProjectiles.push({
                      mesh: boltMesh,
                      vx: Math.sin(bAngle) * 20,
                      vz: Math.cos(bAngle) * 20,
                      life: 1.4,
                      damage: Math.round((20 + playerLevel * 2.2) * (playerLevel === 1 ? 0.8 : 1.0)),
                      label: "BARRAGEM DO TITÃ",
                    });
                  });
                }
              } else if (en.tier === "elite" && distHero >= 5.0 && distHero <= 22.0) {
                if (en.boltCd > 0) en.boltCd -= dt;
                if (en.boltCd <= 0) {
                  en.boltCd = Math.max(1.8, 2.8 - playerLevel * 0.12);
                  soundEngine.play("dash");
                  const boltMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.42, 10, 10),
                    new THREE.MeshBasicMaterial({ color: 0xd946ef })
                  );
                  boltMesh.position.set(en.x, 1.5, en.z);
                  scene.add(boltMesh);
                  const bAngle = Math.atan2(dx, dz);
                  shadowProjectiles.push({
                    mesh: boltMesh,
                    vx: Math.sin(bAngle) * 20,
                    vz: Math.cos(bAngle) * 20,
                    life: 1.3,
                    damage: Math.round((16 + playerLevel * 2.0) * (playerLevel === 1 ? 0.8 : 1.0)),
                    label: "ORBE SOMBRIO DA ELITE",
                  });
                }
              }
            }
          } else {
            // Branch 3: Autonomous Patrol & Wandering across the map streets (Never frozen)
            en.patrolTimer -= dt;
            if (en.patrolTimer <= 0) {
              if (en.patrolState === "idle") {
                en.patrolState = "walking";
                en.patrolTimer = 3.5 + Math.random() * 4.0;
                const pAngle = Math.random() * Math.PI * 2;
                const pDist = 3.0 + Math.random() * 8.0;
                en.patrolTargetX = en.homeX + Math.cos(pAngle) * pDist;
                en.patrolTargetZ = en.homeZ + Math.sin(pAngle) * pDist;
              } else {
                en.patrolState = "idle";
                en.patrolTimer = 2.0 + Math.random() * 3.0;
              }
            }

            if (en.patrolState === "walking") {
              const toPdx = en.patrolTargetX - en.x;
              const toPdz = en.patrolTargetZ - en.z;
              const dPatrol = Math.hypot(toPdx, toPdz);
              if (dPatrol > 0.8) {
                const walkSpd = en.isBoss ? 2.4 : 1.9;
                en.x += (toPdx / dPatrol) * walkSpd * dt;
                en.z += (toPdz / dPatrol) * walkSpd * dt;
                en.rig.root.rotation.y = Math.atan2(toPdx, toPdz);
                enemyMoving = true;
              } else {
                en.patrolState = "idle";
                en.patrolTimer = 2.0;
              }
            } else if (distHome > 1.8 && distHome > maxLeash * 0.7) {
              // Calm return to spawn post if drifted too far
              const hx = en.homeX - en.x;
              const hz = en.homeZ - en.z;
              en.x += (hx / distHome) * 2.8 * dt;
              en.z += (hz / distHome) * 2.8 * dt;
              en.rig.root.rotation.y = Math.atan2(hx, hz);
              enemyMoving = true;
            }
          }

          if (enemyMoving) {
            const strideSpeed = en.fleeTimer > 0 ? 0.018 : 0.009;
            const ph = now * strideSpeed + eIdx;
            const strideAmp = en.fleeTimer > 0 ? 0.85 : 0.55;
            en.rig.leftLegPivot.rotation.x = Math.sin(ph) * strideAmp;
            en.rig.rightLegPivot.rotation.x = -Math.sin(ph) * strideAmp;
            en.rig.leftArmPivot.rotation.x = -Math.sin(ph) * (strideAmp * 0.8);
          }
          en.rig.rightArmPivot.rotation.x *= 0.9;

          if (resolvedBiome === "amazonia") {
            const onBridge =
              Math.abs(en.x) < 5.8 ||
              Math.abs(en.x + 46) < 5.8 ||
              Math.abs(en.x - 46) < 5.8;
            if (!onBridge && Math.abs(en.z - 27) < 5.2) {
              en.z = en.homeZ > 27 ? 32.4 : 21.6;
            }
          }
          const enElev = getGroundElevation(en.x, en.z);
          en.rig.root.position.set(en.x, enElev, en.z);
        });

        // --- INTELLIGENT CIVILIAN BOT AI (Panic when near shadows, relieved when safe) ---
        streetPeopleObjs.forEach((sp) => {
          let nearestThreat = 999;
          for (const en of enemies) {
            if (!en.dead) {
              const d = Math.hypot(sp.data.x - en.x, sp.data.z - en.z);
              if (d < nearestThreat) nearestThreat = d;
            }
          }

          if (nearestThreat < 13.0) {
            // Civilian Panics! Rings turn red, arms raise in distress
            (sp.qRing.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
            sp.rig.leftArmPivot.rotation.x = -2.1 + Math.sin(now * 0.012) * 0.3;
            sp.rig.rightArmPivot.rotation.x = -2.1 - Math.sin(now * 0.012) * 0.3;
            if (sp.rig.headGroup) {
              sp.rig.headGroup.rotation.y = Math.sin(now * 0.01) * 0.45;
            }
          } else {
            // Civilian is safe
            const helped = helpedIdsRef.current.includes(sp.data.id);
            (sp.qRing.material as THREE.MeshBasicMaterial).color.setHex(helped ? 0x10b981 : 0x38bdf8);
            sp.rig.leftArmPivot.rotation.x = Math.sin(now * 0.003 + sp.data.x) * 0.08;
            sp.rig.rightArmPivot.rotation.x = -Math.sin(now * 0.003 + sp.data.x) * 0.08;
            if (sp.rig.headGroup) {
              sp.rig.headGroup.rotation.y = 0;
            }
          }
        });

        // AAA District Shadow Boss Telegraphed Ground AoE Shockwave!
        const liveBoss = enemies.find((e) => e.isBoss && !e.dead);
        if (
          liveBoss &&
          Math.hypot(heroPos.x - liveBoss.x, heroPos.z - liveBoss.z) < 16
        ) {
          bossAoeRing.position.set(liveBoss.x, 0.14, liveBoss.z);
          bossAoeCharge += dt * 0.42;
          bossAoeRing.scale.setScalar(0.35 + bossAoeCharge * 0.72);
          (bossAoeRing.material as THREE.MeshBasicMaterial).opacity = Math.min(
            0.65,
            bossAoeCharge * 0.68
          );
          if (bossAoeCharge >= 1.0) {
            bossAoeCharge = 0;
            const slamRing = new THREE.Mesh(
              new THREE.RingGeometry(0.8, 2.2, 32),
              new THREE.MeshBasicMaterial({
                color: 0xe879f9,
                side: THREE.DoubleSide,
                transparent: true,
              })
            );
            slamRing.rotation.x = -Math.PI / 2;
            slamRing.position.set(liveBoss.x, 0.25, liveBoss.z);
            scene.add(slamRing);
            vfxList.push({
              mesh: slamRing,
              age: 0,
              duration: 0.65,
              maxScale: 3.4,
            });
            if (
              Math.hypot(heroPos.x - liveBoss.x, heroPos.z - liveBoss.z) < 6.4
            ) {
              if (shieldTimer <= 0) {
                hp = Math.max(0, hp - 20);
                soundEngine.play("error");
                emitPopup("💥 ONDA SOMBRIA -20 HP!", "#f43f5e");
                if (hp <= 0) {
                  hp = maxHp;
                  heroPos.set(
                    WORLD_LANDMARKS.spawn.x,
                    0,
                    WORLD_LANDMARKS.spawn.z
                  );
                  emitPopup("✨ RESTAURADO NA BASE IDE!", "#38bdf8");
                }
              } else {
                emitPopup("🛡️ ONDA DO CHEFE BLOQUEADA!", "#fde047");
              }
            }
          }
        } else {
          bossAoeCharge = 0;
          (bossAoeRing.material as THREE.MeshBasicMaterial).opacity = 0;
        }

        // Detect Contextual Nearby Interaction
        let foundNearby: NearbyInteractionInfo | null = null;
        if (
          Math.hypot(
            heroPos.x - WORLD_LANDMARKS.mainNpc.x,
            heroPos.z - WORLD_LANDMARKS.mainNpc.z
          ) < 4.8
        ) {
          foundNearby = {
            kind: "mainNpc",
            id: mission.npc.id,
            label: `Conversar com ${mission.npc.name}`,
          };
        } else if (
          Math.hypot(
            heroPos.x - WORLD_LANDMARKS.nexus.x,
            heroPos.z - WORLD_LANDMARKS.nexus.z
          ) < 5.5
        ) {
          foundNearby = {
            kind: "nexus",
            id: "nexus",
            label: dialogueDoneRef.current
              ? "⚡ Ativar Nexus da Palavra!"
              : `Converse com ${mission.npc.name} primeiro`,
          };
        } else if (
          Math.hypot(
            heroPos.x - WORLD_LANDMARKS.totem.x,
            heroPos.z - WORLD_LANDMARKS.totem.z
          ) < 4.4
        ) {
          foundNearby = {
            kind: "totem",
            id: "totem",
            label: "Ler Totem de Inteligência Cultural",
          };
        } else if (
          !raceActive &&
          Math.hypot(heroPos.x - raceCfg.startX, heroPos.z - raceCfg.startZ) <
            5.2
        ) {
          foundNearby = {
            kind: "race",
            id: raceCfg.id,
            label: raceDoneRef.current
              ? `🏁 Correr Novamente: ${raceCfg.title}`
              : `🏁 Iniciar ${raceCfg.title}!`,
          };
        } else {
          for (const twObj of radioTowerObjs) {
            if (
              Math.hypot(heroPos.x - twObj.data.x, heroPos.z - twObj.data.z) <
              4.8
            ) {
              const done = towerIdsRef.current.includes(twObj.data.id);
              foundNearby = {
                kind: "tower",
                id: twObj.data.id,
                label: done
                  ? `📡 ${twObj.data.name} (Transmitindo ✓)`
                  : `📡 Sintonizar ${twObj.data.name}`,
                tower: twObj.data,
              };
              break;
            }
          }

          if (!foundNearby) {
            for (const sp of streetPeopleObjs) {
              const alreadyHelped = helpedIdsRef.current.includes(sp.data.id);
              (sp.qRing.material as THREE.MeshBasicMaterial).color.setHex(
                alreadyHelped ? 0x10b981 : 0x38bdf8
              );
              if (
                Math.hypot(heroPos.x - sp.data.x, heroPos.z - sp.data.z) < 4.5
              ) {
                foundNearby = {
                  kind: "person",
                  id: sp.data.id,
                  label: alreadyHelped
                    ? `Falar com ${sp.data.name} (Ajudado ✓)`
                    : `Ajudar ${sp.data.name}`,
                  person: sp.data,
                };
                break;
              }
            }
          }
        }
        currentNearby = foundNearby;
      }

      // Animate LoL Movement Beacon (Smooth ground pulse & ring rotation)
      if (mobaBeaconTimer > 0) {
        mobaBeaconTimer = Math.max(0, mobaBeaconTimer - dt * 2.2);
        const alpha = mobaBeaconTimer;
        (mobaOuterRing.material as THREE.MeshBasicMaterial).opacity = alpha * 0.85;
        (mobaInnerRing.material as THREE.MeshBasicMaterial).opacity = alpha * 0.95;
        (mobaSpike.material as THREE.MeshBasicMaterial).opacity = alpha * 0.8;
        mobaOuterRing.rotation.z += dt * 3.6;
        mobaInnerRing.rotation.z -= dt * 4.2;
        mobaOuterRing.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, 14 * dt));
        mobaInnerRing.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, 14 * dt));
        mobaSpike.position.y = 0.65 + alpha * 0.45;
        if (mobaBeaconTimer <= 0) {
          mobaBeaconGroup.visible = false;
        }
      }

      // --- GTA 3RD-PERSON STREET CAMERA vs TACTICAL MOBA CAMERA (LEAGUE OF LEGENDS FLUIDITY) ---
      if (cameraMode === "gta") {
        const camDist = (activeVehicle
          ? nitroTimer > 0
            ? 16.5
            : 14.5
          : 11.2) * zoomMultiplier;
        const camHeight = (activeVehicle ? 7.0 : 5.6) * zoomMultiplier;
        const targetCamX = heroPos.x + Math.sin(camYaw) * camDist;
        const targetCamZ = heroPos.z + Math.cos(camYaw) * camDist;

        camera.position.x += (targetCamX - camera.position.x) * 0.14;
        camera.position.z += (targetCamZ - camera.position.z) * 0.14;
        camera.position.y += (camHeight - camera.position.y) * 0.12;

        // Look slightly ahead & above character so street horizon, buildings & sky dome fill the view!
        const lookAheadX = heroPos.x - Math.sin(camYaw) * 4.5;
        const lookAheadZ = heroPos.z - Math.cos(camYaw) * 4.5;
        camera.lookAt(lookAheadX, 2.1, lookAheadZ);
      } else {
        // High-angle tactical isometric MOBA camera with exponential glide
        const camHeight = (activeVehicle ? 23.5 : 20.5) * zoomMultiplier;
        const camBack = (activeVehicle ? 20.0 : 17.0) * zoomMultiplier;
        const targetCamX = heroPos.x;
        const targetCamZ = heroPos.z + camBack;
        const camLerp = 1 - Math.exp(-9.5 * dt);

        camera.position.x += (targetCamX - camera.position.x) * camLerp;
        camera.position.z += (targetCamZ - camera.position.z) * camLerp;
        camera.position.y += (camHeight - camera.position.y) * camLerp;

        const leadDist = isMoving ? 1.6 : 0.8;
        const lookTargetX = heroPos.x + Math.sin(heroAngle) * leadDist;
        const lookTargetZ = heroPos.z + Math.cos(heroAngle) * leadDist - 1.2;
        camera.lookAt(lookTargetX, 1.0, lookTargetZ);
      }

      // Keep Sky Dome centered around hero with constant crystal-clear daytime lighting
      skyDome.position.set(heroPos.x, 0, heroPos.z);

      // --- SYNC HUD SNAPSHOT (~14fps) ---
      if (now - lastHudSync > 70) {
        lastHudSync = now;
        const boss = enemies.find((e) => e.isBoss);
        const dots: RadarEntityDot[] = [
          {
            x: WORLD_LANDMARKS.mainNpc.x,
            z: WORLD_LANDMARKS.mainNpc.z,
            kind: "mainNpc",
            done: dialogueDoneRef.current,
          },
          {
            x: WORLD_LANDMARKS.nexus.x,
            z: WORLD_LANDMARKS.nexus.z,
            kind: "nexus",
            done: !dialogueDoneRef.current,
          },
          {
            x: WORLD_LANDMARKS.totem.x,
            z: WORLD_LANDMARKS.totem.z,
            kind: "totem",
          },
          {
            x: raceActive && raceCfg.checkpoints[raceCheckpointIdx]
              ? raceCfg.checkpoints[raceCheckpointIdx].x
              : raceCfg.startX,
            z: raceActive && raceCfg.checkpoints[raceCheckpointIdx]
              ? raceCfg.checkpoints[raceCheckpointIdx].z
              : raceCfg.startZ,
            kind: "race",
            done: raceDoneRef.current,
          },
          ...radioTowerObjs.map((tw) => ({
            x: tw.data.x,
            z: tw.data.z,
            kind: "tower" as const,
            done: towerIdsRef.current.includes(tw.data.id),
          })),
          ...streetPeopleObjs.map((sp) => ({
            x: sp.data.x,
            z: sp.data.z,
            kind: "person" as const,
            done: helpedIdsRef.current.includes(sp.data.id),
          })),
          ...vehicles
            .filter((v) => v !== activeVehicle)
            .map((v) => ({
              x: v.x,
              z: v.z,
              kind: "vehicle" as const,
            })),
          ...collectibles
            .filter((c) => !c.collected && c.kind === "scroll")
            .map((c) => ({
              x: c.x,
              z: c.z,
              kind: "scroll" as const,
            })),
          ...enemies
            .filter((e) => !e.dead)
            .map((e) => ({
              x: e.x,
              z: e.z,
              kind: e.isBoss ? ("boss" as const) : ("enemy" as const),
            })),
        ];

        if (coopPartnerRef.current) {
          dots.push({
            x: partnerPos.x,
            z: partnerPos.z,
            kind: "partner" as const,
          });
        }

        onHudUpdateRef.current({
          heroX: heroPos.x,
          heroZ: heroPos.z,
          heroAngle,
          isMoving,
          hp,
          maxHp,
          inVehicle: Boolean(activeVehicle),
          activeVehicleName: activeVehicle
            ? activeVehicle.cfg.name
            : worldCfg.vehicleName,
          cameraMode,
          nitroCooldown,
          score,
          combo,
          suppliesHeld,
          scrollsCollected,
          totalScrolls,
          enemiesDefeated,
          totalEnemies: enemies.length,
          bossDefeated: Boolean(boss?.dead),
          bossHpPct: boss ? Math.round((boss.hp / boss.maxHp) * 100) : 0,
          bossNear: Boolean(
            boss &&
              !boss.dead &&
              Math.hypot(heroPos.x - boss.x, heroPos.z - boss.z) < 34
          ),
          helpedPersonIds: helpedIdsRef.current,
          activatedTowerIds: towerIdsRef.current,
          totalTowers: radioTowerObjs.length,
          raceActive,
          raceCompleted: raceDoneRef.current,
          raceTimeLeft: Math.max(0, raceTimeLeft),
          raceCheckpointIdx,
          raceTotalCheckpoints: raceCfg.checkpoints.length,
          cooldowns: { ...cooldowns },
          nearby: currentNearby,
          dots,
          vehicleKind: activeVehicle
            ? activeVehicle.cfg.kind === "moto"
              ? "moto"
              : "car"
            : null,
          preferredVehicle,
          garage: { ...garageUnits },
          fuel: { ...fuelRemaining },
          attackCharges: 999,
          attackMaxCharges: 999,
          attackRechargePct: 1,
          hurtFlash,
        });
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      heroHolderRef.current = null;
      heroRigRef.current = null;
      resizeObs?.disconnect();
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      renderer.dispose();
    };
  }, [
    mission.id,
    mission.biomeId,
    mission.npc.avatarKey,
    mission.npc.id,
    mission.npc.name,
  ]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full touch-none cursor-grab overflow-hidden active:cursor-grabbing"
    />
  );
}
