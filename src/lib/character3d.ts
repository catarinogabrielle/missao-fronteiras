import * as THREE from "three";
import { AvatarId } from "@/types/game";
import { createStylizedFaceTexture } from "./textures3d";

export interface ArticulatedRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  weaponMesh?: THREE.Group;
  slashArc?: THREE.Mesh;
  shieldDome?: THREE.Mesh;
  hpBarFill?: THREE.Mesh;
}

export function createNameplateSprite(
  label: string,
  borderColor = "#fbbf24",
  bgColor = "rgba(3, 7, 18, 0.85)"
): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 88;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 5;

  const r = 24;
  ctx.beginPath();
  ctx.roundRect(14, 14, 356, 60, r);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label.slice(0, 22), 192, 45);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.5, 0.58, 1);
  sprite.renderOrder = 10;
  return sprite;
}

export interface CharacterVisualConfig {
  skin: string;
  eye: string;
  shirt: number;
  secondary: number;
  pants: number;
  hair: number;
  hatType?: "cap" | "straw" | "headphones" | "glasses" | "curls" | "hood";
  hasBackpack?: boolean;
  hasWeapon?: boolean;
  weaponColor?: number;
  label?: string;
  labelColor?: string;
}

export function buildStylizedHumanRig(
  cfg: CharacterVisualConfig
): ArticulatedRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Subtle Ground Aura Ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.65, 0.82, 28),
    new THREE.MeshBasicMaterial({
      color: cfg.secondary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  root.add(ring);

  const pantsMat = new THREE.MeshStandardMaterial({
    color: cfg.pants,
    roughness: 0.6,
  });
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: cfg.shirt,
    roughness: 0.45,
    metalness: 0.15,
  });
  const secMat = new THREE.MeshStandardMaterial({
    color: cfg.secondary,
    roughness: 0.35,
    metalness: 0.35,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: cfg.skin,
    roughness: 0.55,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: cfg.hair,
    roughness: 0.65,
  });

  // --- LEGS ---
  const buildLeg = (offsetX: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(offsetX, 0.72, 0);
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.13, 0.36, 6, 10),
      pantsMat
    );
    leg.position.y = -0.24;
    leg.castShadow = true;
    pivot.add(leg);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.2, 0.38),
      bootMat
    );
    boot.position.set(0, -0.56, 0.05);
    boot.castShadow = true;
    pivot.add(boot);
    bodyGroup.add(pivot);
    return pivot;
  };

  const leftLegPivot = buildLeg(-0.2);
  const rightLegPivot = buildLeg(0.2);

  // --- TORSO & JACKET ---
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.78, 0.44),
    shirtMat
  );
  torso.position.y = 1.12;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Chest Stripe / Collar Accent
  const vestTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.24, 0.47),
    secMat
  );
  vestTrim.position.y = 1.34;
  bodyGroup.add(vestTrim);

  // Gold Belt Buckle
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(0.76, 0.1, 0.46),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  belt.position.y = 0.77;
  bodyGroup.add(belt);

  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.12, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 })
  );
  buckle.position.y = 0.77;
  bodyGroup.add(buckle);

  if (cfg.hasBackpack) {
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.62, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    pack.position.set(0, 1.14, -0.32);
    bodyGroup.add(pack);
  }

  // --- HEAD WITH PAINTED STYLIZED FACE ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.88, 0);

  const faceTex = createStylizedFaceTexture(cfg.skin, cfg.eye, false);
  // Box head with smoothed look: front face (+Z) gets expressive eyes & smile!
  const headMaterials = [
    skinMat, // +X right
    skinMat, // -X left
    skinMat, // +Y top
    skinMat, // -Y bottom
    new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 }), // +Z front!
    skinMat, // -Z back
  ];
  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.66, 0.64),
    headMaterials
  );
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Sculpted Hair Back & Sides
  const hairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.7, 0.42),
    hairMat
  );
  hairBack.position.set(0, 0.04, -0.16);
  headGroup.add(hairBack);

  const hairTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.22, 0.72),
    hairMat
  );
  hairTop.position.set(0, 0.34, 0);
  headGroup.add(hairTop);

  // Unique Accessories!
  if (cfg.hatType === "cap") {
    const capCrown = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.26, 0.74),
      shirtMat
    );
    capCrown.position.set(0, 0.36, 0);
    headGroup.add(capCrown);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.08, 0.36),
      secMat
    );
    visor.position.set(0, 0.25, 0.46);
    headGroup.add(visor);

    const badge = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xfde047 })
    );
    badge.position.set(0, 0.38, 0.38);
    headGroup.add(badge);
  } else if (cfg.hatType === "straw") {
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.76, 0.07, 18),
      strawMat
    );
    brim.position.y = 0.32;
    headGroup.add(brim);
    const dome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.44, 0.26, 16),
      strawMat
    );
    dome.position.y = 0.46;
    headGroup.add(dome);
  } else if (cfg.hatType === "headphones") {
    const earMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.4,
    });
    [-0.4, 0.4].forEach((ex) => {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.12, 14),
        earMat
      );
      cup.rotation.z = Math.PI / 2;
      cup.position.set(ex, 0.02, 0.04);
      headGroup.add(cup);
    });
    // Long side hair locks
    [-0.36, 0.36].forEach((hx) => {
      const lock = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.62, 0.24),
        hairMat
      );
      lock.position.set(hx, -0.16, 0.1);
      headGroup.add(lock);
    });
  } else if (cfg.hatType === "glasses") {
    const visorAr = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.18, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.85,
        transparent: true,
        opacity: 0.85,
      })
    );
    visorAr.position.set(0, 0.04, 0.34);
    headGroup.add(visorAr);
  } else if (cfg.hatType === "curls") {
    [-0.4, 0.4].forEach((cx) => {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 12),
        hairMat
      );
      puff.position.set(cx, 0.12, -0.05);
      headGroup.add(puff);
    });
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.1, 0.72),
      new THREE.MeshStandardMaterial({ color: 0xf472b6 })
    );
    band.position.set(0, 0.32, 0.02);
    headGroup.add(band);
  }

  bodyGroup.add(headGroup);

  // --- ARMS & WEAPON OF LIGHT ---
  const buildArm = (offsetX: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(offsetX, 1.42, 0);
    const sleeve = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.34, 6, 10),
      shirtMat
    );
    sleeve.position.y = -0.22;
    sleeve.castShadow = true;
    pivot.add(sleeve);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      skinMat
    );
    hand.position.y = -0.46;
    pivot.add(hand);

    bodyGroup.add(pivot);
    return pivot;
  };

  const leftArmPivot = buildArm(-0.5);
  const rightArmPivot = buildArm(0.5);

  let weaponMesh: THREE.Group | undefined;
  let slashArc: THREE.Mesh | undefined;
  let shieldDome: THREE.Mesh | undefined;

  if (cfg.hasWeapon) {
    // Glowing Sword / Staff of Light (Espada do Espírito - Efésios 6:17)
    weaponMesh = new THREE.Group();
    weaponMesh.position.set(0, -0.46, 0.18);
    weaponMesh.rotation.x = Math.PI * 0.38;

    const hilt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.05, 0.36, 8),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 })
    );
    weaponMesh.add(hilt);

    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
    );
    guard.position.y = 0.18;
    weaponMesh.add(guard);

    const wCol = cfg.weaponColor || 0x38bdf8;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 1.15, 0.05),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: wCol,
        emissiveIntensity: 1.4,
      })
    );
    blade.position.y = 0.78;
    weaponMesh.add(blade);

    rightArmPivot.add(weaponMesh);

    // 3D Sword Slash Wave Effect around Hero
    slashArc = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 2.35, 24, 1, -Math.PI * 0.4, Math.PI * 0.85),
      new THREE.MeshBasicMaterial({
        color: wCol,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      })
    );
    slashArc.rotation.x = -Math.PI / 2;
    slashArc.position.y = 1.05;
    root.add(slashArc);

    // E-Skill Prayer Shield Golden Dome
    shieldDome = new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 20, 16),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        wireframe: true,
        transparent: true,
        opacity: 0,
      })
    );
    shieldDome.position.y = 1.1;
    root.add(shieldDome);
  }

  if (cfg.label) {
    const plate = createNameplateSprite(
      cfg.label,
      cfg.labelColor || "#fbbf24"
    );
    plate.position.y = 2.75;
    root.add(plate);
  }

  return {
    root,
    bodyGroup,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    weaponMesh,
    slashArc,
    shieldDome,
  };
}

export function createPlayableChampion3D(
  avatarId: AvatarId,
  agentName: string
): ArticulatedRig {
  const configs: Record<AvatarId, CharacterVisualConfig> = {
    lucas: {
      skin: "#e5a975",
      eye: "#10b981",
      shirt: 0x059669,
      secondary: 0x34d399,
      pants: 0x1e293b,
      hair: 0x3b2314,
      hatType: "cap",
      hasBackpack: true,
      hasWeapon: true,
      weaponColor: 0x34d399,
      label: `⚔️ ${agentName}`,
      labelColor: "#34d399",
    },
    sofia: {
      skin: "#fad0b1",
      eye: "#06b6d4",
      shirt: 0x0891b2,
      secondary: 0x22d3ee,
      pants: 0x1e1b4b,
      hair: 0x3b1d14,
      hatType: "headphones",
      hasWeapon: true,
      weaponColor: 0x22d3ee,
      label: `⚔️ ${agentName}`,
      labelColor: "#22d3ee",
    },
    davi: {
      skin: "#9c6234",
      eye: "#f59e0b",
      shirt: 0xd97706,
      secondary: 0xfbbf24,
      pants: 0x0f172a,
      hair: 0x111827,
      hatType: "glasses",
      hasWeapon: true,
      weaponColor: 0xfbbf24,
      label: `⚔️ ${agentName}`,
      labelColor: "#fbbf24",
    },
    ester: {
      skin: "#c68652",
      eye: "#a855f7",
      shirt: 0x7c3aed,
      secondary: 0xfbbf24,
      pants: 0x1e1b4b,
      hair: 0x17153b,
      hatType: "curls",
      hasWeapon: true,
      weaponColor: 0xe879f9,
      label: `⚔️ ${agentName}`,
      labelColor: "#c084fc",
    },
  };

  return buildStylizedHumanRig(configs[avatarId] || configs.lucas);
}

// Create menacing 3D Shadow Enemy ("Sombra da Dúvida" / Boss "Fortaleza do Medo")
export function createShadowEnemyRig(
  name: string,
  isBoss = false
): ArticulatedRig {
  const scale = isBoss ? 1.85 : 1.05;
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  bodyGroup.scale.setScalar(scale);
  root.add(bodyGroup);

  const aura = new THREE.Mesh(
    new THREE.RingGeometry(0.75 * scale, 0.98 * scale, 24),
    new THREE.MeshBasicMaterial({
      color: isBoss ? 0xf43f5e : 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    })
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.05;
  root.add(aura);

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e1035,
    emissive: isBoss ? 0x881337 : 0x3b0764,
    emissiveIntensity: 0.65,
    roughness: 0.3,
  });

  const crystalMat = new THREE.MeshStandardMaterial({
    color: isBoss ? 0xf43f5e : 0xc084fc,
    emissive: isBoss ? 0xe11d48 : 0x9333ea,
    emissiveIntensity: 1.1,
  });

  // Floating Jagged Armored Core
  const torso = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.58, 0),
    darkMat
  );
  torso.position.y = 1.1;
  torso.scale.set(1, 1.35, 0.8);
  bodyGroup.add(torso);

  // Shoulder Spikes
  [-0.62, 0.62].forEach((sx) => {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.58, 6), crystalMat);
    spike.position.set(sx, 1.48, 0);
    spike.rotation.z = sx < 0 ? 0.5 : -0.5;
    bodyGroup.add(spike);
  });

  // Fierce Glowing Eyes Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.88, 0);
  const faceTex = createStylizedFaceTexture("#170d2b", "#f43f5e", true);
  const headMats = [
    darkMat,
    darkMat,
    darkMat,
    darkMat,
    new THREE.MeshStandardMaterial({
      map: faceTex,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.45,
    }),
    darkMat,
  ];
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.54, 0.54), headMats);
  headGroup.add(head);

  // Horns
  [-0.24, 0.24].forEach((hx) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 6), crystalMat);
    horn.position.set(hx, 0.42, 0);
    horn.rotation.z = hx < 0 ? 0.3 : -0.3;
    headGroup.add(horn);
  });
  bodyGroup.add(headGroup);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.68, 1.25, 0);
  const clawL = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), crystalMat);
  clawL.position.y = -0.32;
  leftArmPivot.add(clawL);
  bodyGroup.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.68, 1.25, 0);
  const clawR = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), crystalMat);
  clawR.position.y = -0.32;
  rightArmPivot.add(clawR);
  bodyGroup.add(rightArmPivot);

  const leftLegPivot = new THREE.Group();
  const rightLegPivot = new THREE.Group();

  // 3D Overhead Health Bar
  const hpBg = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5 * scale, 0.18 * scale),
    new THREE.MeshBasicMaterial({ color: 0x090d16, side: THREE.DoubleSide })
  );
  hpBg.position.y = 2.55 * scale;
  root.add(hpBg);

  const hpBarFill = new THREE.Mesh(
    new THREE.PlaneGeometry(1.42 * scale, 0.13 * scale),
    new THREE.MeshBasicMaterial({
      color: isBoss ? 0xf43f5e : 0xc084fc,
      side: THREE.DoubleSide,
    })
  );
  hpBarFill.position.set(0, 2.55 * scale, 0.02);
  root.add(hpBarFill);

  if (isBoss) {
    const bossTag = createNameplateSprite(`👑 ${name}`, "#f43f5e");
    bossTag.position.y = 3.05 * scale;
    root.add(bossTag);
  }

  return {
    root,
    bodyGroup,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    hpBarFill,
  };
}

// Create Rideable 3D GTA-style Tactical Mission Vehicle!
export function createTacticalVehicle3D(missionId: string): THREE.Group {
  const vehicle = new THREE.Group();

  const isCyberMoto = missionId === "toquio";
  const bodyColor =
    missionId === "amazonia"
      ? 0x10b981
      : missionId === "toquio"
        ? 0x06b6d4
        : missionId === "janela1040"
          ? 0xf59e0b
          : 0x8b5cf6;

  const paintMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.25,
    metalness: 0.65,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
  });
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
  });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  if (isCyberMoto) {
    // Futuristic Tokyo Cyber-Bike
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.75, 2.8),
      paintMat
    );
    chassis.position.y = 0.72;
    chassis.castShadow = true;
    vehicle.add(chassis);

    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.45, 0.7),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.6,
      })
    );
    windshield.position.set(0, 1.18, 0.75);
    windshield.rotation.x = -0.45;
    vehicle.add(windshield);

    [-1.05, 1.05].forEach((wz) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.36, 18),
        wheelMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.48, wz);
      vehicle.add(wheel);

      const neonRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.36, 0.05, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee })
      );
      neonRim.rotation.y = Math.PI / 2;
      neonRim.position.set(0.19, 0.48, wz);
      vehicle.add(neonRim);
    });
  } else {
    // Rugged 4x4 GTA Tactical Mission Jeep / Amphibious Explorer!
    const lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.78, 3.8),
      paintMat
    );
    lowerBody.position.y = 0.78;
    lowerBody.castShadow = true;
    vehicle.add(lowerBody);

    const hoodAccent = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.14, 1.25),
      darkMat
    );
    hoodAccent.position.set(0, 1.2, 1.1);
    vehicle.add(hoodAccent);

    // Roll-cage & Windshield Frame
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.72, 0.14),
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.65,
      })
    );
    windshield.position.set(0, 1.52, 0.42);
    windshield.rotation.x = -0.22;
    vehicle.add(windshield);

    const rollBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.82, 0.16),
      darkMat
    );
    rollBar.position.set(0, 1.56, -0.95);
    vehicle.add(rollBar);

    // 4 Chunky Offroad Tires
    [
      [-1.12, 1.2],
      [1.12, 1.2],
      [-1.12, -1.2],
      [1.12, -1.2],
    ].forEach(([wx, wz]) => {
      const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.38, 16),
        wheelMat
      );
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, 0.48, wz);
      tire.castShadow = true;
      vehicle.add(tire);

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.41, 12),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 })
      );
      hub.rotation.z = Math.PI / 2;
      hub.position.set(wx, 0.48, wz);
      vehicle.add(hub);
    });

    // Headlights
    [-0.72, 0.72].forEach((hx) => {
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 10),
        glowMat
      );
      lamp.position.set(hx, 0.86, 1.92);
      vehicle.add(lamp);
    });
  }

  const tag = createNameplateSprite("🚙 VEÍCULO IDE [V]", "#38bdf8");
  tag.position.y = 2.65;
  tag.name = "vehicleTag";
  vehicle.add(tag);

  return vehicle;
}
