"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { AvatarId, Mission } from "@/types/game";
import { soundEngine } from "@/lib/sound";
import {
  createBuildingFacadeTexture,
  createRoadTexture,
  createTerrainTexture,
} from "@/lib/textures3d";
import {
  ArticulatedRig,
  buildStylizedHumanRig,
  createNameplateSprite,
  createPlayableChampion3D,
  createShadowEnemyRig,
  createTacticalVehicle3D,
} from "@/lib/character3d";
import {
  getOpenWorldConfig,
  StreetPersonQuest,
} from "@/lib/worldData";

export type CombatActionType =
  | "attack"
  | "skillQ"
  | "skillW"
  | "skillE"
  | "skillR"
  | "vehicle"
  | "interact";

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
  kind: "enemy" | "boss" | "person" | "mainNpc" | "scroll" | "nexus" | "totem";
  done?: boolean;
}

export interface NearbyInteractionInfo {
  kind: "mainNpc" | "person" | "totem" | "nexus";
  id: string;
  label: string;
  person?: StreetPersonQuest;
}

export interface WorldHudSnapshot {
  heroX: number;
  heroZ: number;
  heroAngle: number;
  hp: number;
  maxHp: number;
  inVehicle: boolean;
  score: number;
  combo: number;
  suppliesHeld: number;
  scrollsCollected: number;
  totalScrolls: number;
  enemiesDefeated: number;
  totalEnemies: number;
  bossDefeated: boolean;
  bossHpPct: number;
  helpedPersonIds: string[];
  cooldowns: { q: number; w: number; e: number; r: number };
  nearby: NearbyInteractionInfo | null;
  dots: RadarEntityDot[];
}

export const WORLD_LANDMARKS = {
  spawn: { x: 0, z: 52 },
  totem: { x: -11, z: 38 },
  mainNpc: { x: 0, z: 0 },
  boss: { x: 0, z: -36 },
  nexus: { x: 0, z: -56 },
};

interface MobaGtaWorld3DProps {
  mission: Mission;
  avatarId: AvatarId;
  agentName: string;
  dialogueCompleted: boolean;
  helpedPersonIds: string[];
  paused: boolean;
  joystickVec: { x: number; y: number };
  combatTrigger: CombatTrigger | null;
  gpsTarget: { x: number; z: number };
  onHudUpdate: (snap: WorldHudSnapshot) => void;
  onPopup: (popup: WorldFloatingPopup) => void;
  onInteractTrigger: (info: NearbyInteractionInfo, suppliesHeld: number) => boolean;
  onEarnRewards: (xp: number, wisdom: number) => void;
}

export function MobaGtaWorld3D({
  mission,
  avatarId,
  agentName,
  dialogueCompleted,
  helpedPersonIds,
  paused,
  joystickVec,
  combatTrigger,
  gpsTarget,
  onHudUpdate,
  onPopup,
  onInteractTrigger,
  onEarnRewards,
}: MobaGtaWorld3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Live synced refs for 60fps WebGL loop
  const pausedRef = useRef(paused);
  const dialogueDoneRef = useRef(dialogueCompleted);
  const helpedIdsRef = useRef<string[]>(helpedPersonIds);
  const joystickRef = useRef(joystickVec);
  const gpsTargetRef = useRef(gpsTarget);
  const onHudUpdateRef = useRef(onHudUpdate);
  const onPopupRef = useRef(onPopup);
  const onInteractRef = useRef(onInteractTrigger);
  const onEarnRef = useRef(onEarnRewards);

  // Action handler ref wired inside WebGL effect
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
    onEarnRef.current = onEarnRewards;
  }, [onEarnRewards]);

  useEffect(() => {
    if (!combatTrigger) return;
    triggerActionFnRef.current?.(combatTrigger.action);
  }, [combatTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const worldCfg = getOpenWorldConfig(mission.id);
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();

    const palette = (() => {
      switch (mission.id) {
        case "amazonia":
          return {
            sky: 0x07222b,
            fog: 0x07222b,
            sun: 0xffe8b3,
            accent: 0x10b981,
            bldgBase: "#5c3a21",
            bldgWin: "#fde047",
            modern: false,
            treeColor: 0x15803d,
          };
        case "janela1040":
          return {
            sky: 0x241409,
            fog: 0x241409,
            sun: 0xffd28a,
            accent: 0xf59e0b,
            bldgBase: "#c28e5c",
            bldgWin: "#fef08a",
            modern: false,
            treeColor: 0x166534,
          };
        case "toquio":
          return {
            sky: 0x060b1e,
            fog: 0x060b1e,
            sun: 0xc4e0ff,
            accent: 0x06b6d4,
            bldgBase: "#1e293b",
            bldgWin: "#38bdf8",
            modern: true,
            treeColor: 0xf472b6,
          };
        default:
          return {
            sky: 0x211230,
            fog: 0x211230,
            sun: 0xffd89b,
            accent: 0xa855f7,
            bldgBase: "#9a5b32",
            bldgWin: "#fde68a",
            modern: false,
            treeColor: 0x65a30d,
          };
      }
    })();

    scene.background = new THREE.Color(palette.sky);
    scene.fog = new THREE.FogExp2(palette.fog, 0.0085);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 220);
    camera.position.set(0, 18, 68);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Rich Hemisphere + Directional Sun Lighting
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x334155, 1.05);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(palette.sun, 1.9);
    sun.position.set(35, 55, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 160;
    const d = 55;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    scene.add(sun);

    // --- MASSIVE 150 x 150 OPEN-WORLD TERRAIN ---
    const terrainTex = createTerrainTexture(mission.id);
    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshStandardMaterial({ map: terrainTex, roughness: 0.85 })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // --- GTA CITY ROAD NETWORK & PLAZAS ---
    const roadTex = createRoadTexture(mission.id);
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.65,
    });

    // Main North-South Boulevard
    const nsRoad = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 142), roadMat);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.position.y = 0.03;
    scene.add(nsRoad);

    // South & North East-West Cross Avenues
    [24, -24].forEach((rz) => {
      const ewRoadTex = roadTex.clone();
      ewRoadTex.needsUpdate = true;
      const ewRoad = new THREE.Mesh(
        new THREE.PlaneGeometry(132, 9.5),
        new THREE.MeshStandardMaterial({ map: ewRoadTex, roughness: 0.65 })
      );
      ewRoad.rotation.x = -Math.PI / 2;
      ewRoad.rotation.z = Math.PI / 2;
      ewRoad.position.set(0, 0.035, rz);
      scene.add(ewRoad);
    });

    // Central Grand Plaza Circle (where Main NPC stands)
    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 11.4, 0.14, 36),
      new THREE.MeshStandardMaterial({
        color: mission.id === "toquio" ? 0x1e293b : 0x64748b,
        roughness: 0.5,
      })
    );
    plaza.position.set(0, 0.05, 0);
    plaza.receiveShadow = true;
    scene.add(plaza);

    const plazaRing = new THREE.Mesh(
      new THREE.RingGeometry(9.6, 10.2, 40),
      new THREE.MeshBasicMaterial({
        color: palette.accent,
        side: THREE.DoubleSide,
      })
    );
    plazaRing.rotation.x = -Math.PI / 2;
    plazaRing.position.y = 0.14;
    scene.add(plazaRing);

    // --- BIOME MEGA-FEATURES (RIVER & BRIDGES / SKYSCRAPERS / BAOBAB / ARCHES) ---
    const buildingColliders: { x: number; z: number; rx: number; rz: number }[] =
      [];

    const facadeTex1 = createBuildingFacadeTexture(
      palette.bldgBase,
      palette.bldgWin,
      palette.modern
    );
    const facadeTex2 = createBuildingFacadeTexture(
      mission.id === "toquio" ? "#0f172a" : palette.bldgBase,
      mission.id === "toquio" ? "#f472b6" : "#38bdf8",
      palette.modern
    );

    // 20 City Block Buildings / Village Houses across the 4 Quadrants!
    const buildingSpots: [number, number, number, number, number][] = [
      // [x, z, width, depth, height]
      [-18, 40, 8, 8, palette.modern ? 17 : 6],
      [18, 40, 8, 8, palette.modern ? 15 : 6],
      [-44, 40, 9, 8, palette.modern ? 20 : 6.5],
      [44, 40, 9, 8, palette.modern ? 18 : 6.5],
      [-20, 12, 8, 7, palette.modern ? 16 : 5.5],
      [20, 12, 8, 7, palette.modern ? 19 : 5.5],
      [-48, 12, 10, 8, palette.modern ? 22 : 6.5],
      [48, 12, 10, 8, palette.modern ? 21 : 6.5],
      [-22, -10, 8, 8, palette.modern ? 15 : 6],
      [22, -10, 8, 8, palette.modern ? 18 : 6],
      [-50, -10, 9, 9, palette.modern ? 24 : 7],
      [50, -10, 9, 9, palette.modern ? 20 : 7],
      [-22, -40, 8, 8, palette.modern ? 17 : 6],
      [22, -40, 8, 8, palette.modern ? 17 : 6],
      [-48, -42, 10, 9, palette.modern ? 21 : 6.5],
      [48, -42, 10, 9, palette.modern ? 19 : 6.5],
    ];

    buildingSpots.forEach(([bx, bz, bw, bd, bh], idx) => {
      // Skip river strip in Amazonia
      if (mission.id === "amazonia" && Math.abs(bz - 12) < 6) return;

      const bGroup = new THREE.Group();
      bGroup.position.set(bx, 0, bz);

      const bMat = new THREE.MeshStandardMaterial({
        map: idx % 2 === 0 ? facadeTex1 : facadeTex2,
        roughness: palette.modern ? 0.25 : 0.7,
        metalness: palette.modern ? 0.45 : 0.1,
      });

      if (mission.id === "mocambique" && idx % 2 === 0) {
        // Traditional Round Village House with Conical Thatched Roof
        const wall = new THREE.Mesh(
          new THREE.CylinderGeometry(bw * 0.45, bw * 0.48, 4.2, 16),
          bMat
        );
        wall.position.y = 2.1;
        wall.castShadow = true;
        bGroup.add(wall);

        const coneRoof = new THREE.Mesh(
          new THREE.ConeGeometry(bw * 0.58, 2.8, 16),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 })
        );
        coneRoof.position.y = 5.4;
        bGroup.add(coneRoof);
      } else {
        const box = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bMat);
        box.position.y = bh / 2;
        box.castShadow = true;
        box.receiveShadow = true;
        bGroup.add(box);

        if (palette.modern) {
          // Glowing Neon Rooftop Trim for Tokyo!
          const neon = new THREE.Mesh(
            new THREE.BoxGeometry(bw + 0.3, 0.35, bd + 0.3),
            new THREE.MeshBasicMaterial({
              color: idx % 2 === 0 ? 0x06b6d4 : 0xf43f5e,
            })
          );
          neon.position.y = bh + 0.15;
          bGroup.add(neon);
        } else if (mission.id === "janela1040") {
          // Golden Sandstone Dome on rooftops
          const dome = new THREE.Mesh(
            new THREE.SphereGeometry(bw * 0.32, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
          );
          dome.position.y = bh;
          bGroup.add(dome);
        } else {
          // Pitched Wooden Roof for Amazonia
          const roof = new THREE.Mesh(
            new THREE.ConeGeometry(bw * 0.72, 2.4, 4),
            new THREE.MeshStandardMaterial({ color: 0x92400e })
          );
          roof.rotation.y = Math.PI / 4;
          roof.position.y = bh + 1.2;
          bGroup.add(roof);
        }
      }

      scene.add(bGroup);
      buildingColliders.push({
        x: bx,
        z: bz,
        rx: bw / 2 + 0.9,
        rz: bd / 2 + 0.9,
      });
    });

    // Special Biome Landmarks & Moving Ambient Traffic/Boats!
    const ambientMovers: {
      mesh: THREE.Group;
      axis: "x" | "z";
      speed: number;
      limit: number;
    }[] = [];

    if (mission.id === "amazonia") {
      // Wide Turquoise River cutting East-West at z = 12 + 3 Bridges!
      const river = new THREE.Mesh(
        new THREE.PlaneGeometry(160, 8.5),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0e7490,
          emissiveIntensity: 0.35,
          roughness: 0.15,
          metalness: 0.65,
        })
      );
      river.rotation.x = -Math.PI / 2;
      river.position.set(0, 0.06, 12);
      scene.add(river);

      // 3 Wooden Bridges across the river
      [-34, 0, 34].forEach((brX) => {
        const bridge = new THREE.Mesh(
          new THREE.BoxGeometry(brX === 0 ? 11 : 6.5, 0.45, 10.5),
          new THREE.MeshStandardMaterial({ color: 0x78350f })
        );
        bridge.position.set(brX, 0.25, 12);
        scene.add(bridge);
      });

      // Detailed Barco-Hospital Esperança docked on river!
      const ship = new THREE.Group();
      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(9.5, 1.8, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x0284c7 })
      );
      hull.position.y = 0.9;
      ship.add(hull);
      const deck1 = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 1.8, 3.6),
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          emissive: 0xfef08a,
          emissiveIntensity: 0.2,
        })
      );
      deck1.position.y = 2.6;
      ship.add(deck1);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(7.8, 0.35, 3.9),
        new THREE.MeshStandardMaterial({ color: 0x10b981 })
      );
      roof.position.y = 3.65;
      ship.add(roof);
      const shipTag = createNameplateSprite("🚢 BARCO-HOSPITAL IDE", "#34d399");
      shipTag.position.y = 5.1;
      ship.add(shipTag);
      ship.position.set(-17, 0.05, 12);
      scene.add(ship);
    } else {
      // Moving GTA Ambient City Cars cruising along East-West Avenues!
      const carColors = [0xef4444, 0x3b82f6, 0xeab308, 0x10b981];
      [
        { z: 22.2, spd: 9.5, startX: -45 },
        { z: 25.8, spd: -10.5, startX: 40 },
        { z: -22.2, spd: 11.0, startX: -20 },
        { z: -25.8, spd: -9.0, startX: 35 },
      ].forEach((cInfo, idx) => {
        const car = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 1.05, 1.8),
          new THREE.MeshStandardMaterial({
            color: carColors[idx % carColors.length],
            metalness: 0.5,
            roughness: 0.3,
          })
        );
        body.position.y = 0.7;
        car.add(body);
        const cabin = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, 0.75, 1.6),
          new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        cabin.position.y = 1.45;
        car.add(cabin);
        car.position.set(cInfo.startX, 0, cInfo.z);
        scene.add(car);
        ambientMovers.push({
          mesh: car,
          axis: "x",
          speed: cInfo.spd,
          limit: 66,
        });
      });
    }

    if (mission.id === "mocambique") {
      // Giant Central Ubuntu Baobab Tree beside Plaza
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 3.0, 7.5, 14),
        new THREE.MeshStandardMaterial({ color: 0x6b4423 })
      );
      trunk.position.set(-9.5, 3.75, -4);
      scene.add(trunk);
      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(5.8, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x65a30d })
      );
      canopy.scale.set(1.3, 0.55, 1.3);
      canopy.position.set(-9.5, 8.2, -4);
      scene.add(canopy);
    }

    // Lush Trees & Streetlamps across the Open World
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const rad = 60 + (i % 3) * 4;
      const tx = Math.cos(angle) * rad;
      const tz = Math.sin(angle) * rad;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.42, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c3a21 })
      );
      trunk.position.set(tx, 1.2, tz);
      scene.add(trunk);

      const foliage = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.9),
        new THREE.MeshStandardMaterial({ color: palette.treeColor })
      );
      foliage.position.set(tx, 3.4, tz);
      scene.add(foliage);
    }

    // Glowing Streetlights along Main Boulevard
    [-42, -16, 16, 42].forEach((lz) => {
      [-6.2, 6.2].forEach((lx) => {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.14, 4.4, 8),
          new THREE.MeshStandardMaterial({ color: 0x334155 })
        );
        pole.position.set(lx, 2.2, lz);
        scene.add(pole);

        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        bulb.position.set(lx, 4.5, lz);
        scene.add(bulb);
      });
    });

    // --- LANDMARKS: CULTURAL TOTEM & NEXUS DA PALAVRA ---
    const totemGroup = new THREE.Group();
    totemGroup.position.set(WORLD_LANDMARKS.totem.x, 0, WORLD_LANDMARKS.totem.z);
    const totemCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.95, 0),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.1,
      })
    );
    totemCrystal.position.y = 2.1;
    totemGroup.add(totemCrystal);
    const totemTag = createNameplateSprite("🧭 TOTEM CULTURAL", "#22d3ee");
    totemTag.position.y = 3.6;
    totemGroup.add(totemTag);
    scene.add(totemGroup);

    const nexusGroup = new THREE.Group();
    nexusGroup.position.set(WORLD_LANDMARKS.nexus.x, 0, WORLD_LANDMARKS.nexus.z);
    const nexusBase = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.4, 0.55, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    nexusBase.position.y = 0.28;
    nexusGroup.add(nexusBase);
    const nexusRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.24, 14, 48),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.1,
      })
    );
    nexusRing.position.y = 3.2;
    nexusGroup.add(nexusRing);
    const nexusCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 0),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.2,
      })
    );
    nexusCore.position.y = 3.2;
    nexusGroup.add(nexusCore);
    const nexusTag = createNameplateSprite("⚡ NEXUS DA PALAVRA", "#fbbf24");
    nexusTag.position.y = 6.5;
    nexusGroup.add(nexusTag);
    scene.add(nexusGroup);

    // --- MAIN STORY NPC AT CENTRAL PLAZA (0, 0) ---
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
      0,
      WORLD_LANDMARKS.mainNpc.z
    );
    scene.add(mainNpcRig.root);

    // --- 4 OPEN-WORLD STREET PEOPLE (SIDE-QUESTS!) ---
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

      // Quest Ring under their feet
      const qRing = new THREE.Mesh(
        new THREE.RingGeometry(1.4, 1.75, 28),
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

    // --- COLLECTIBLE ITEMS ACROSS THE WORLD ---
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
            emissiveIntensity: 0.85,
          })
        );
        cyl.rotation.z = Math.PI / 4;
        grp.add(cyl);
      } else if (c.kind === "supply") {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.75, 0.65, 0.75),
          new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.65,
          })
        );
        grp.add(box);
      } else {
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.45, 0),
          new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 1.0,
          })
        );
        grp.add(gem);
      }

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.75, 20),
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

    // --- SHADOW ENEMIES & DISTRICT BOSS ---
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

    // --- PLAYABLE HERO + GTA TACTICAL VEHICLE + GPS ARROW ---
    const heroRig = createPlayableChampion3D(avatarId, agentName);
    const heroPos = new THREE.Vector3(
      WORLD_LANDMARKS.spawn.x,
      0,
      WORLD_LANDMARKS.spawn.z
    );
    let heroAngle = Math.PI; // Facing North (-Z)
    heroRig.root.position.copy(heroPos);
    heroRig.root.rotation.y = heroAngle;
    scene.add(heroRig.root);

    // 3D Rideable Vehicle parked near Spawn
    const vehicleMesh = createTacticalVehicle3D(mission.id);
    const vehiclePos = new THREE.Vector3(5.5, 0, 48);
    vehicleMesh.position.copy(vehiclePos);
    vehicleMesh.rotation.y = Math.PI;
    scene.add(vehicleMesh);

    // 3D GTA GPS Directional Arrow Ring around Hero!
    const gpsPivot = new THREE.Group();
    const gpsCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.36, 0.95, 6),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    gpsCone.rotation.x = Math.PI / 2;
    gpsCone.position.set(0, 0.35, 2.25);
    gpsPivot.add(gpsCone);
    scene.add(gpsPivot);

    // --- ACTIVE PROJECTILES & VFX ---
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

    // --- GAMEPLAY STATE ---
    let hp = 120;
    const maxHp = 120;
    let inVehicle = false;
    let score = 0;
    let combo = 0;
    let comboTimer = 0;
    let suppliesHeld = 0;
    let scrollsCollected = 0;
    const totalScrolls = collectibles.filter((c) => c.kind === "scroll").length;
    let enemiesDefeated = 0;

    let attackAnimTimer = 0;
    let shieldTimer = 0;
    let dashTimer = 0;
    let dashDirX = 0;
    let dashDirZ = 0;
    const cooldowns = { q: 0, w: 0, e: 0, r: 0 };
    let currentNearby: NearbyInteractionInfo | null = null;

    const emitPopup = (text: string, color: string) => {
      onPopupRef.current({
        id: Date.now() + Math.random(),
        text,
        color,
      });
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

      // Update 3D HP bar
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

        // Burst VFX
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.4, 1.2, 24),
          new THREE.MeshBasicMaterial({
            color: enemy.isBoss ? 0xfbbf24 : 0x34d399,
            side: THREE.DoubleSide,
            transparent: true,
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(enemy.x, 0.25, enemy.z);
        scene.add(ring);
        vfxList.push({ mesh: ring, age: 0, duration: 0.55, maxScale: 3.5 });

        if (enemy.isBoss) {
          soundEngine.play("levelUp");
          onEarnRef.current(80, 25);
          emitPopup(`👑 BOSS VENCIDO! +${pts} PTS!`, "#fbbf24");
        } else {
          onEarnRef.current(15, 3);
          emitPopup(`⚔️ +${pts} PTS (${combo}x COMBO!)`, "#34d399");
        }
      } else {
        emitPopup(`-${amount}`, amount >= 80 ? "#fbbf24" : "#38bdf8");
      }
    };

    // --- ACTION DISPATCHER (COMBAT, SKILLS, VEHICLE, INTERACT) ---
    const performAction = (action: CombatActionType) => {
      if (pausedRef.current) return;

      if (action === "vehicle") {
        soundEngine.play("vehicle");
        inVehicle = !inVehicle;
        const tag = vehicleMesh.getObjectByName("vehicleTag");
        if (inVehicle) {
          if (tag) tag.visible = false;
          emitPopup(`🚙 ${worldCfg.vehicleName} ATIVADO!`, "#38bdf8");
        } else {
          if (tag) tag.visible = true;
          vehiclePos.set(heroPos.x + 2.4, 0, heroPos.z);
          vehicleMesh.position.copy(vehiclePos);
          emitPopup("🏃 MODO A PÉ", "#e2e8f0");
        }
        return;
      }

      if (action === "interact") {
        if (currentNearby) {
          const consumedSupplies = onInteractRef.current(
            currentNearby,
            suppliesHeld
          );
          if (
            consumedSupplies &&
            currentNearby.person?.questType === "supply"
          ) {
            const need = currentNearby.person.neededSupplies || 2;
            suppliesHeld = Math.max(0, suppliesHeld - need);
            score += currentNearby.person.pointsReward;
          } else if (consumedSupplies && currentNearby.person) {
            score += currentNearby.person.pointsReward;
          }
        }
        return;
      }

      // Dismount automatically if casting sword/magic skills
      if (inVehicle && action !== "skillW") {
        inVehicle = false;
        vehiclePos.set(heroPos.x + 2.5, 0, heroPos.z);
        vehicleMesh.position.copy(vehiclePos);
      }

      const fwdX = Math.sin(heroAngle);
      const fwdZ = Math.cos(heroAngle);

      if (action === "attack") {
        soundEngine.play("slash");
        attackAnimTimer = 0.26;

        // Auto-face nearest close enemy for crisp MOBA game feel!
        let closest: LiveEnemy | null = null;
        let bestD = 5.2;
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
        const dmg = isCrit ? 68 : 42;
        enemies.forEach((e) => {
          if (e.dead) return;
          const dist = Math.hypot(e.x - heroPos.x, e.z - heroPos.z);
          if (dist <= 4.7) {
            damageEnemy(e, dmg, 1.5);
          }
        });
      } else if (action === "skillQ") {
        if (cooldowns.q > 0) return;
        cooldowns.q = 3.5;
        soundEngine.play("slash");
        attackAnimTimer = 0.25;

        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.65, 14, 14),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee })
        );
        orb.position.set(heroPos.x + fwdX, 1.1, heroPos.z + fwdZ);
        scene.add(orb);
        projectiles.push({
          mesh: orb,
          vx: fwdX * 28,
          vz: fwdZ * 28,
          life: 0.9,
          hitIds: new Set(),
        });
      } else if (action === "skillW") {
        if (cooldowns.w > 0) return;
        cooldowns.w = 4.2;
        soundEngine.play("dash");
        dashTimer = 0.22;
        dashDirX = fwdX;
        dashDirZ = fwdZ;
      } else if (action === "skillE") {
        if (cooldowns.e > 0) return;
        cooldowns.e = 7.5;
        soundEngine.play("prayer");
        shieldTimer = 4.0;
        hp = Math.min(maxHp, hp + 40);
        emitPopup("🙏 ESCUDO DE FÉ +40 VIDA!", "#fde047");

        enemies.forEach((e) => {
          if (e.dead) return;
          if (Math.hypot(e.x - heroPos.x, e.z - heroPos.z) < 5.5) {
            damageEnemy(e, 55, 2.8);
          }
        });
      } else if (action === "skillR") {
        if (cooldowns.r > 0) return;
        cooldowns.r = 12.0;
        soundEngine.play("ult");

        // Massive Heavenly Pillar of Light!
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 5.5, 26, 24, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0xfde047,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
          })
        );
        pillar.position.set(heroPos.x, 13, heroPos.z);
        scene.add(pillar);
        vfxList.push({ mesh: pillar, age: 0, duration: 0.85, maxScale: 1.9 });

        emitPopup("⚡ ULTIMATE: LUZ DAS NAÇÕES!", "#fbbf24");
        enemies.forEach((e) => {
          if (e.dead) return;
          if (Math.hypot(e.x - heroPos.x, e.z - heroPos.z) < 10.5) {
            damageEnemy(e, 195, 3.6);
          }
        });
      }
    };

    triggerActionFnRef.current = performAction;

    // --- KEYBOARD & CLICK-TO-MOVE / ATTACK INPUTS ---
    const keys: Record<string, boolean> = {};
    let clickMoveTarget: THREE.Vector3 | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
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
      } else if (k === "v") {
        performAction("vehicle");
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

    const onPointerDown = (e: PointerEvent) => {
      if (pausedRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObject(groundMesh);
      if (hits.length > 0) {
        const pt = hits[0].point;
        const cx = Math.max(-70, Math.min(70, pt.x));
        const cz = Math.max(-70, Math.min(70, pt.z));

        // If user clicked directly on/near an enemy within range, swing attack!
        const clickedEnemy = enemies.find(
          (en) => !en.dead && Math.hypot(en.x - cx, en.z - cz) < 2.6
        );
        if (
          clickedEnemy &&
          Math.hypot(clickedEnemy.x - heroPos.x, clickedEnemy.z - heroPos.z) <
            5.0
        ) {
          performAction("attack");
        } else {
          clickMoveTarget = new THREE.Vector3(cx, 0, cz);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // --- MAIN 60FPS OPEN-WORLD GAME LOOP ---
    let animId = 0;
    let lastTime = performance.now();
    let lastHudSync = 0;
    let walkCycle = 0;

    const resolveBuildingCollision = (nx: number, nz: number) => {
      let rx = nx;
      let rz = nz;
      for (const b of buildingColliders) {
        const dx = rx - b.x;
        const dz = rz - b.z;
        if (Math.abs(dx) < b.rx && Math.abs(dz) < b.rz) {
          const overlapX = b.rx - Math.abs(dx);
          const overlapZ = b.rz - Math.abs(dz);
          if (overlapX < overlapZ) {
            rx += dx >= 0 ? overlapX : -overlapX;
          } else {
            rz += dz >= 0 ? overlapZ : -overlapZ;
          }
        }
      }
      // Amazonia river bank restriction (except on the 3 bridges or in Amphibious vehicle!)
      if (mission.id === "amazonia" && !inVehicle) {
        if (Math.abs(rz - 12) < 3.6) {
          const onBridge =
            Math.abs(rx) < 5.5 ||
            Math.abs(rx + 34) < 3.3 ||
            Math.abs(rx - 34) < 3.3;
          if (!onBridge) {
            rz = heroPos.z > 12 ? 15.65 : 8.35;
          }
        }
      }
      return {
        x: Math.max(-71, Math.min(71, rx)),
        z: Math.max(-71, Math.min(71, rz)),
      };
    };

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Ambient city traffic movers
      ambientMovers.forEach((m) => {
        m.mesh.position[m.axis] += m.speed * dt;
        if (m.mesh.position[m.axis] > m.limit) m.mesh.position[m.axis] = -m.limit;
        if (m.mesh.position[m.axis] < -m.limit) m.mesh.position[m.axis] = m.limit;
      });

      totemCrystal.rotation.y += 1.5 * dt;
      nexusRing.rotation.z += (dialogueDoneRef.current ? 2.5 : 0.6) * dt;
      nexusCore.rotation.y += 2.0 * dt;

      if (!pausedRef.current) {
        // Cooldowns & timers
        cooldowns.q = Math.max(0, cooldowns.q - dt);
        cooldowns.w = Math.max(0, cooldowns.w - dt);
        cooldowns.e = Math.max(0, cooldowns.e - dt);
        cooldowns.r = Math.max(0, cooldowns.r - dt);
        if (comboTimer > 0) {
          comboTimer -= dt;
          if (comboTimer <= 0) combo = 0;
        }
        if (attackAnimTimer > 0) attackAnimTimer -= dt;
        if (shieldTimer > 0) shieldTimer -= dt;

        // Movement Input (WASD / Arrows / Touch Joystick / ClickTarget)
        let mx = joystickRef.current.x;
        let mz = joystickRef.current.y;
        if (keys["w"] || keys["arrowup"]) mz -= 1;
        if (keys["s"] || keys["arrowdown"]) mz += 1;
        if (keys["a"] || keys["arrowleft"]) mx -= 1;
        if (keys["d"] || keys["arrowright"]) mx += 1;

        let isMoving = false;
        const baseSpeed = inVehicle ? 19.5 : 9.6;

        if (dashTimer > 0) {
          dashTimer -= dt;
          const next = resolveBuildingCollision(
            heroPos.x + dashDirX * 32 * dt,
            heroPos.z + dashDirZ * 32 * dt
          );
          heroPos.set(next.x, 0, next.z);
          isMoving = true;
          enemies.forEach((en) => {
            if (
              !en.dead &&
              Math.hypot(en.x - heroPos.x, en.z - heroPos.z) < 2.6
            ) {
              damageEnemy(en, 35, 2.0);
            }
          });
        } else if (Math.hypot(mx, mz) > 0.08) {
          clickMoveTarget = null;
          const len = Math.hypot(mx, mz);
          const nx = (mx / len) * baseSpeed * dt;
          const nz = (mz / len) * baseSpeed * dt;
          const resolved = resolveBuildingCollision(
            heroPos.x + nx,
            heroPos.z + nz
          );
          heroPos.set(resolved.x, 0, resolved.z);
          heroAngle = Math.atan2(mx, mz);
          isMoving = true;
        } else if (clickMoveTarget) {
          const dx = clickMoveTarget.x - heroPos.x;
          const dz = clickMoveTarget.z - heroPos.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.45) {
            const step = Math.min(dist, baseSpeed * dt);
            const resolved = resolveBuildingCollision(
              heroPos.x + (dx / dist) * step,
              heroPos.z + (dz / dist) * step
            );
            heroPos.set(resolved.x, 0, resolved.z);
            heroAngle = Math.atan2(dx, dz);
            isMoving = true;
          } else {
            clickMoveTarget = null;
          }
        }

        // Vehicle Ramming Impact against Shadows!
        if (inVehicle && isMoving) {
          enemies.forEach((en) => {
            if (
              !en.dead &&
              Math.hypot(en.x - heroPos.x, en.z - heroPos.z) < 2.9
            ) {
              damageEnemy(en, 60, 3.5);
            }
          });
        }

        // Sync Hero & Vehicle Transforms + Articulated Animations
        heroRig.root.position.copy(heroPos);
        heroRig.root.rotation.y = heroAngle;

        if (inVehicle) {
          vehicleMesh.position.copy(heroPos);
          vehicleMesh.rotation.y = heroAngle;
          heroRig.bodyGroup.position.y = 0.45;
          heroRig.leftLegPivot.rotation.x = -0.7;
          heroRig.rightLegPivot.rotation.x = -0.7;
        } else {
          heroRig.bodyGroup.position.y = isMoving
            ? Math.abs(Math.sin(walkCycle)) * 0.14
            : 0;
          if (isMoving) {
            walkCycle += dt * 15;
            heroRig.leftLegPivot.rotation.x = Math.sin(walkCycle) * 0.75;
            heroRig.rightLegPivot.rotation.x = -Math.sin(walkCycle) * 0.75;
            heroRig.leftArmPivot.rotation.x = -Math.sin(walkCycle) * 0.65;
            if (attackAnimTimer <= 0) {
              heroRig.rightArmPivot.rotation.x = Math.sin(walkCycle) * 0.65;
            }
          } else {
            heroRig.leftLegPivot.rotation.x *= 0.85;
            heroRig.rightLegPivot.rotation.x *= 0.85;
            heroRig.leftArmPivot.rotation.x *= 0.85;
            if (attackAnimTimer <= 0) {
              heroRig.rightArmPivot.rotation.x *= 0.85;
            }
          }
        }

        // Sword Slash Arc & Shield Dome visuals
        if (heroRig.slashArc) {
          if (attackAnimTimer > 0) {
            heroRig.rightArmPivot.rotation.x = -1.35 + attackAnimTimer * 4;
            heroRig.slashArc.rotation.z += dt * 18;
            (heroRig.slashArc.material as THREE.MeshBasicMaterial).opacity =
              Math.min(0.9, attackAnimTimer * 4);
          } else {
            (heroRig.slashArc.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        }

        if (heroRig.shieldDome) {
          heroRig.shieldDome.rotation.y += dt * 2.5;
          (heroRig.shieldDome.material as THREE.MeshBasicMaterial).opacity =
            shieldTimer > 0 ? 0.42 : 0;
        }

        // GPS Waypoint Arrow rotation
        gpsPivot.position.set(heroPos.x, 0.05, heroPos.z);
        const gx = gpsTargetRef.current.x - heroPos.x;
        const gz = gpsTargetRef.current.z - heroPos.z;
        gpsPivot.rotation.y = Math.atan2(gx, gz);
        gpsPivot.visible = Math.hypot(gx, gz) > 4.2;

        // Collectibles Magnet & Pickup!
        collectibles.forEach((c) => {
          if (c.collected) return;
          c.mesh.rotation.y += 2.2 * dt;
          c.mesh.position.y = 0.85 + Math.sin(now * 0.004 + c.x) * 0.16;

          const dist = Math.hypot(c.x - heroPos.x, c.z - heroPos.z);
          if (dist < 4.2) {
            // Smooth magnet pull toward Hero!
            c.x += ((heroPos.x - c.x) / Math.max(0.2, dist)) * 15 * dt;
            c.z += ((heroPos.z - c.z) / Math.max(0.2, dist)) * 15 * dt;
            c.mesh.position.x = c.x;
            c.mesh.position.z = c.z;
          }
          if (dist < 1.8) {
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

        // Update Projectiles (Skill Q)
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
              ) < 2.2
            ) {
              p.hitIds.add(en.id);
              damageEnemy(en, 85, 2.2);
            }
          });

          if (p.life <= 0) {
            scene.remove(p.mesh);
            projectiles.splice(i, 1);
          }
        }

        // Update VFX
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

        // Enemy AI (Patrol, Aggro Chase & Melee Strike)
        enemies.forEach((en) => {
          if (en.dead) return;
          if (en.attackCd > 0) en.attackCd -= dt;
          if (en.hitFlash > 0) {
            en.hitFlash -= dt;
            en.rig.bodyGroup.position.y = 0.25;
          } else {
            en.rig.bodyGroup.position.y =
              Math.sin(now * 0.005 + en.homeX) * 0.15;
          }

          const dx = heroPos.x - en.x;
          const dz = heroPos.z - en.z;
          const distHero = Math.hypot(dx, dz);
          const distHome = Math.hypot(en.x - en.homeX, en.z - en.homeZ);

          const aggroRadius = en.isBoss ? 15 : 11.5;
          if (distHero < aggroRadius && distHome < 22) {
            en.rig.root.rotation.y = Math.atan2(dx, dz);
            if (distHero > (en.isBoss ? 2.6 : 1.85)) {
              const spd = en.isBoss ? 4.2 : 4.8;
              en.x += (dx / distHero) * spd * dt;
              en.z += (dz / distHero) * spd * dt;
            } else if (en.attackCd <= 0) {
              en.attackCd = 1.45;
              if (shieldTimer <= 0) {
                const dmgTaken = en.isBoss ? 18 : 10;
                hp = Math.max(0, hp - dmgTaken);
                soundEngine.play("error");
                emitPopup(`-${dmgTaken} HP`, "#f43f5e");
                if (hp <= 0) {
                  // Respawn at Base Fountain with full HP!
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
            en.x += (hx / distHome) * 3.5 * dt;
            en.z += (hz / distHome) * 3.5 * dt;
          }

          en.rig.root.position.set(en.x, 0, en.z);
        });

        // Detect Nearby Contextual Interaction (Main NPC, Street People, Totem, Nexus)
        let foundNearby: NearbyInteractionInfo | null = null;
        if (
          Math.hypot(
            heroPos.x - WORLD_LANDMARKS.mainNpc.x,
            heroPos.z - WORLD_LANDMARKS.mainNpc.z
          ) < 4.5
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
          ) < 5.0
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
          ) < 4.0
        ) {
          foundNearby = {
            kind: "totem",
            id: "totem",
            label: "Ler Totem de Inteligência Cultural",
          };
        } else {
          for (const sp of streetPeopleObjs) {
            const alreadyHelped = helpedIdsRef.current.includes(sp.data.id);
            (sp.qRing.material as THREE.MeshBasicMaterial).color.setHex(
              alreadyHelped ? 0x10b981 : 0x38bdf8
            );
            if (
              Math.hypot(heroPos.x - sp.data.x, heroPos.z - sp.data.z) < 4.2
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
        currentNearby = foundNearby;
      }

      // Dynamic GTA / MOBA Chase-Isometric Camera (zooms slightly back when driving vehicle!)
      const camHeight = inVehicle ? 20.5 : 16.5;
      const camBack = inVehicle ? 21.0 : 17.5;
      camera.position.x += (heroPos.x - camera.position.x) * 0.1;
      camera.position.z += (heroPos.z + camBack - camera.position.z) * 0.1;
      camera.position.y += (camHeight - camera.position.y) * 0.08;
      camera.lookAt(heroPos.x, 1.1, heroPos.z - 2.2);

      // Emit HUD Snapshot (~14fps)
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
          ...streetPeopleObjs.map((sp) => ({
            x: sp.data.x,
            z: sp.data.z,
            kind: "person" as const,
            done: helpedIdsRef.current.includes(sp.data.id),
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
          inVehicle,
          score,
          combo,
          suppliesHeld,
          scrollsCollected,
          totalScrolls,
          enemiesDefeated,
          totalEnemies: enemies.length,
          bossDefeated: Boolean(boss?.dead),
          bossHpPct: boss ? Math.round((boss.hp / boss.maxHp) * 100) : 0,
          helpedPersonIds: helpedIdsRef.current,
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
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [mission.id, mission.npc.avatarKey, mission.npc.id, mission.npc.name, avatarId, agentName]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full cursor-crosshair touch-none select-none"
    />
  );
}
