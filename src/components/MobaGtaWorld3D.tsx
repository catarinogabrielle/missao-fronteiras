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
}

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
}

export function MobaGtaWorld3D({
  mission,
  avatarId,
  skinId,
  agentName,
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
}: MobaGtaWorld3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroHolderRef = useRef<THREE.Group | null>(null);
  const heroRigRef = useRef<ArticulatedRig | null>(null);
  const avatarIdRef = useRef(avatarId);
  const skinIdRef = useRef(skinId);
  const agentNameRef = useRef(agentName);

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
    camera.position.set(0, 9, 82);

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
    const pedestrians: AmbientPedestrian[] = [
      { baseX: -23, z: 26, range: 11, speed: 2.3, col: 0x3b82f6, skin: "#e5a975" },
      { baseX: 23, z: 26, range: 11, speed: 2.5, col: 0xec4899, skin: "#fad0b1" },
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

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({ color: palette.treeColor, roughness: 0.65 });

    treePositions.forEach(([tx, tz]) => {
      if (mission.id === "amazonia" && Math.abs(tz - 27) < 6) return;
      const tGrp = new THREE.Group();
      tGrp.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.38, 3.0, 10),
        trunkMat
      );
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tGrp.add(trunk);

      // Multi-sphere lush organic tree canopy
      [
        [0, 3.6, 0, 1.55],
        [-0.75, 3.2, 0.4, 1.15],
        [0.75, 3.25, -0.35, 1.15],
        [0, 4.35, 0.1, 1.2],
      ].forEach(([cx, cy, cz, cr]) => {
        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(cr, 12, 10),
          leafMat
        );
        crown.position.set(cx, cy, cz);
        crown.castShadow = true;
        tGrp.add(crown);
      });
      scene.add(tGrp);
    });

    // Streetlamps along Grand Boulevard
    [-64, -32, 32, 64].forEach((lz) => {
      [-6.5, 6.5].forEach((lx) => {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.13, 5.0, 8),
          trafficPoleMat
        );
        pole.position.set(lx, 2.5, lz);
        scene.add(pole);

        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.26, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        lamp.position.set(lx, 5.1, lz);
        scene.add(lamp);
      });
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
            ? 0x38bdf8
            : c.kind === "heart"
              ? 0xf43f5e
              : 0x34d399;

      if (c.kind === "scroll") {
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, 0.95, 12),
          new THREE.MeshStandardMaterial({
            color: 0xfef3c7,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.9,
          })
        );
        cyl.rotation.z = Math.PI / 4;
        grp.add(cyl);
      } else if (c.kind === "supply") {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.78, 0.68, 0.78),
          new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.7,
          })
        );
        grp.add(box);
      } else {
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.46, 0),
          new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 1.05,
          })
        );
        grp.add(gem);
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
    }

    const enemies: LiveEnemy[] = worldCfg.enemies.map((e) => {
      const rig = createShadowEnemyRig(e.name, Boolean(e.isBoss));
      rig.root.position.set(e.x, 0, e.z);
      scene.add(rig.root);
      return {
        id: e.id,
        name: e.name,
        homeX: e.x,
        homeZ: e.z,
        x: e.x,
        z: e.z,
        hp: e.hp,
        maxHp: e.hp,
        isBoss: Boolean(e.isBoss),
        points: e.points,
        dead: false,
        attackCd: 0,
        hitFlash: 0,
        rig,
      };
    });

    // --- 3 PARKED DRIVABLE REALISTIC GTA VEHICLES ---
    interface LiveVehicle {
      cfg: VehicleSpawnConfig;
      mesh: THREE.Group;
      x: number;
      z: number;
      rotY: number;
    }

    const vehicles: LiveVehicle[] = worldCfg.vehicles.map((vCfg) => {
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

    // --- PROJECTILES & VFX ---
    interface LightProjectile {
      mesh: THREE.Mesh;
      vx: number;
      vz: number;
      life: number;
      hitIds: Set<string>;
    }
    const projectiles: LightProjectile[] = [];

    interface ExpandingEffect {
      mesh: THREE.Mesh;
      age: number;
      duration: number;
      maxScale: number;
    }
    const vfxList: ExpandingEffect[] = [];

    // --- GAMEPLAY & CAMERA STATE ---
    let hp = 120;
    const maxHp = 120;
    let activeVehicle: LiveVehicle | null = null;
    let cameraMode: "gta" | "moba" = "moba";
    let camYaw = 0; // 0 = Camera South looking North (-Z)
    let nitroTimer = 0;
    let nitroCooldown = 0;

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
    let shieldTimer = 0;
    let dashTimer = 0;
    let dashDirX = 0;
    let dashDirZ = 0;
    let activeEmote: HeroEmoteType = "idle";
    let emoteTimer = 0;
    let emoteElapsed = 0;
    const cooldowns = { q: 0, w: 0, e: 0, r: 0 };
    let currentNearby: NearbyInteractionInfo | null = null;

    const emitPopup = (text: string, color: string) => {
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

      const dx = enemy.x - heroPos.x;
      const dz = enemy.z - heroPos.z;
      const dist = Math.max(0.1, Math.hypot(dx, dz));
      enemy.x += (dx / dist) * knockback;
      enemy.z += (dz / dist) * knockback;

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
          emitPopup("🎥 CÂMERA TÁTICA MOBA", "#fbbf24");
        } else {
          emitPopup("🎥 CÂMERA GTA 3ª PESSOA (Arraste p/ Girar)", "#38bdf8");
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

      if (action === "vehicle") {
        soundEngine.play("vehicle");
        if (activeVehicle) {
          dismountVehicle();
          emitPopup("🏃 MODO A PÉ", "#e2e8f0");
        } else {
          // Board nearest parked GTA vehicle (or summon closest one if far away!)
          let bestV = vehicles[0];
          let bestD = Infinity;
          for (const v of vehicles) {
            const d = Math.hypot(v.x - heroPos.x, v.z - heroPos.z);
            if (d < bestD) {
              bestD = d;
              bestV = v;
            }
          }
          if (bestD < 12) {
            heroPos.set(bestV.x, 0, bestV.z);
            heroAngle = bestV.rotY;
          } else {
            bestV.x = heroPos.x;
            bestV.z = heroPos.z;
            bestV.mesh.position.copy(heroPos);
          }
          activeVehicle = bestV;
          const tag = bestV.mesh.getObjectByName("vehicleTag");
          if (tag) tag.visible = false;
          emitPopup(`🚙 ${bestV.cfg.name.toUpperCase()}! [Shift = Turbo]`, "#38bdf8");
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
        soundEngine.play("slash");
        attackAnimTimer = 0.28;

        let closest: LiveEnemy | null = null;
        let bestD = 5.4;
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

        const isCrit = combo > 0 && combo % 3 === 2;
        const dmg = isCrit ? 72 : 45;
        enemies.forEach((e) => {
          if (e.dead) return;
          if (Math.hypot(e.x - heroPos.x, e.z - heroPos.z) <= 4.9) {
            damageEnemy(e, dmg, 1.6);
          }
        });
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
      } else if (k === "shift") {
        performAction("nitro");
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

    dom.addEventListener("pointerdown", onPointerDown);
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
        const vehSpeed = activeVehicle ? activeVehicle.cfg.topSpeed : 10.2;
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

        // Sync Hero & Active Vehicle Transforms + Realistic Knee-Bending & Emote Animations!
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

          // Sword Slash Arc & Shield Dome
          if (currentRig.slashArc) {
            if (attackAnimTimer > 0) {
              currentRig.rightArmPivot.rotation.x = -1.4 + attackAnimTimer * 4;
              currentRig.slashArc.rotation.z += dt * 18;
              (currentRig.slashArc.material as THREE.MeshBasicMaterial).opacity =
                Math.min(0.9, attackAnimTimer * 4);
            } else {
              (currentRig.slashArc.material as THREE.MeshBasicMaterial).opacity = 0;
            }
          }

          if (currentRig.shieldDome) {
            currentRig.shieldDome.rotation.y += dt * 2.5;
            (currentRig.shieldDome.material as THREE.MeshBasicMaterial).opacity =
              shieldTimer > 0 ? 0.42 : 0;
          }
        }

        // GPS Arrow & Destination Sky Beam (locks onto Race Checkpoint during active race!)
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

        // Collectibles Magnet & Pickup
        collectibles.forEach((c) => {
          if (c.collected) return;
          c.mesh.rotation.y += 2.2 * dt;
          c.mesh.position.y = 0.85 + Math.sin(now * 0.004 + c.x) * 0.16;

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
              emitPopup(`🧰 +1 ${c.label.toUpperCase()}!`, "#38bdf8");
            } else if (c.kind === "heart") {
              hp = Math.min(maxHp, hp + 35);
              emitPopup("❤️ +35 VIDA!", "#fb7185");
            } else {
              onEarnRef.current(10, 6);
              emitPopup(`💎 +${c.points} PTS`, "#34d399");
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

        // Humanoid Shadow Enemy AI & Articulated Stride
        enemies.forEach((en, eIdx) => {
          if (en.dead) return;
          if (en.attackCd > 0) en.attackCd -= dt;

          const dx = heroPos.x - en.x;
          const dz = heroPos.z - en.z;
          const distHero = Math.hypot(dx, dz);
          const distHome = Math.hypot(en.x - en.homeX, en.z - en.homeZ);

          let enemyMoving = false;
          const aggroRadius = en.isBoss ? 17 : 12.5;
          if (distHero < aggroRadius && distHome < 26) {
            en.rig.root.rotation.y = Math.atan2(dx, dz);
            if (distHero > (en.isBoss ? 2.8 : 1.95)) {
              const spd = en.isBoss ? 4.5 : 5.1;
              en.x += (dx / distHero) * spd * dt;
              en.z += (dz / distHero) * spd * dt;
              enemyMoving = true;
            } else if (en.attackCd <= 0) {
              en.attackCd = 1.45;
              en.rig.rightArmPivot.rotation.x = -1.3;
              if (shieldTimer <= 0) {
                const dmgTaken = en.isBoss ? 18 : 10;
                hp = Math.max(0, hp - dmgTaken);
                soundEngine.play("error");
                emitPopup(`-${dmgTaken} HP`, "#f43f5e");
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
                emitPopup("🛡️ BLOQUEADO!", "#fde047");
              }
            }
          } else if (distHome > 1.0) {
            const hx = en.homeX - en.x;
            const hz = en.homeZ - en.z;
            en.x += (hx / distHome) * 3.8 * dt;
            en.z += (hz / distHome) * 3.8 * dt;
            en.rig.root.rotation.y = Math.atan2(hx, hz);
            enemyMoving = true;
          }

          if (enemyMoving) {
            const ph = now * 0.009 + eIdx;
            en.rig.leftLegPivot.rotation.x = Math.sin(ph) * 0.55;
            en.rig.rightLegPivot.rotation.x = -Math.sin(ph) * 0.55;
            en.rig.leftArmPivot.rotation.x = -Math.sin(ph) * 0.45;
          }
          en.rig.rightArmPivot.rotation.x *= 0.9;
          en.rig.root.position.set(en.x, 0, en.z);
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
        const camDist = activeVehicle
          ? nitroTimer > 0
            ? 16.5
            : 14.5
          : 11.2;
        const camHeight = activeVehicle ? 7.0 : 5.6;
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
        const camHeight = activeVehicle ? 23.5 : 20.5;
        const camBack = activeVehicle ? 20.0 : 17.0;
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

      // Keep Sky Dome centered around hero
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

        onHudUpdateRef.current({
          heroX: heroPos.x,
          heroZ: heroPos.z,
          heroAngle,
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
