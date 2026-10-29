import * as THREE from "three";
import { AvatarId, HeroEmoteType, SkinId } from "@/types/game";

export interface ArticulatedRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftElbowPivot?: THREE.Group;
  rightElbowPivot?: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftKneePivot?: THREE.Group;
  rightKneePivot?: THREE.Group;
  weaponMesh?: THREE.Group;
  slashArc?: THREE.Mesh;
  shieldDome?: THREE.Mesh;
  hpBarFill?: THREE.Mesh;
  capePivot?: THREE.Group;
  wingsGroup?: THREE.Group;
  haloMesh?: THREE.Mesh;
  groundAura?: THREE.Mesh;
}

export function createNameplateSprite(
  label: string,
  borderColor = "#fbbf24",
  bgColor = "rgba(3, 7, 18, 0.88)"
): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 440;
  canvas.height = 92;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.roundRect(12, 14, 416, 64, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label.slice(0, 28), 220, 47);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.6, 0.55, 1);
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
  innerShirt?: number;
  shoeColor?: number;
  jacketMetalness?: number;
  jacketEmissive?: number;
  jacketEmissiveIntensity?: number;
  hatType?:
    | "cap"
    | "straw"
    | "headphones"
    | "glasses"
    | "curls"
    | "hood"
    | "visor"
    | "crown";
  hasBackpack?: boolean;
  hasPauldrons?: boolean;
  pauldronColor?: number;
  hasCape?: boolean;
  capeColor?: number;
  hasWings?: boolean;
  wingColor?: number;
  hasHalo?: boolean;
  haloColor?: number;
  hasWeapon?: boolean;
  weaponColor?: number;
  label?: string;
  labelColor?: string;
  showGroundRing?: boolean;
}

/**
 * Builds an AAA GTA-proportioned (~2.22u tall, 7-head human anatomy)
 * articulated 3D character with sculpted oval head, 3D facial anatomy,
 * neck, jacket/armor, optional cape/wings/halo/crown/visor,
 * multi-jointed arms (elbows) and legs (bending knees + sculpted sneakers).
 */
export function buildStylizedHumanRig(
  cfg: CharacterVisualConfig
): ArticulatedRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  let groundAura: THREE.Mesh | undefined;
  if (cfg.showGroundRing !== false) {
    groundAura = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.78, 36),
      new THREE.MeshBasicMaterial({
        color: cfg.secondary,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
    );
    groundAura.rotation.x = -Math.PI / 2;
    groundAura.position.y = 0.03;
    root.add(groundAura);
  }

  const skinMat = new THREE.MeshStandardMaterial({
    color: cfg.skin,
    roughness: 0.5,
    metalness: 0.04,
  });
  const jacketMat = new THREE.MeshStandardMaterial({
    color: cfg.shirt,
    roughness: cfg.jacketMetalness && cfg.jacketMetalness > 0.5 ? 0.22 : 0.4,
    metalness: cfg.jacketMetalness ?? 0.18,
    emissive: cfg.jacketEmissive ?? 0x000000,
    emissiveIntensity: cfg.jacketEmissiveIntensity ?? 0.2,
  });
  const innerShirtMat = new THREE.MeshStandardMaterial({
    color: cfg.innerShirt ?? 0xf8fafc,
    roughness: 0.55,
    metalness: 0.12,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: cfg.secondary,
    emissive: cfg.secondary,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.55,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: cfg.pants,
    roughness: 0.6,
    metalness: 0.12,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: cfg.hair,
    roughness: 0.56,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.45,
  });
  const shoeUpperMat = new THREE.MeshStandardMaterial({
    color: cfg.shoeColor ?? 0x0f172a,
    roughness: 0.35,
    metalness: 0.25,
  });

  // --- MULTI-JOINTED LEGS (HIP -> THIGH -> KNEE -> CALF -> GTA SNEAKER) ---
  const buildLeg = (offsetX: number) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(offsetX, 1.02, 0);

    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.096, 0.3, 8, 14),
      pantsMat
    );
    thigh.position.y = -0.22;
    thigh.castShadow = true;
    hipPivot.add(thigh);

    const kneePivot = new THREE.Group();
    kneePivot.position.set(0, -0.46, 0);
    hipPivot.add(kneePivot);

    const kneeCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.088, 12, 10),
      pantsMat
    );
    kneePivot.add(kneeCap);

    const calf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.084, 0.066, 0.38, 14),
      pantsMat
    );
    calf.position.y = -0.21;
    calf.castShadow = true;
    kneePivot.add(calf);

    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.46, 0.04);

    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.055, 0.34),
      soleMat
    );
    sole.position.y = -0.05;
    shoeGroup.add(sole);

    const shoeBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.078, 0.14, 8, 12),
      shoeUpperMat
    );
    shoeBody.rotation.x = Math.PI / 2;
    shoeBody.position.set(0, 0.01, 0.01);
    shoeBody.castShadow = true;
    shoeGroup.add(shoeBody);

    const shoeStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.175, 0.042, 0.125),
      accentMat
    );
    shoeStripe.position.set(0, 0.01, 0.02);
    shoeGroup.add(shoeStripe);

    kneePivot.add(shoeGroup);
    bodyGroup.add(hipPivot);
    return { hipPivot, kneePivot };
  };

  const leftLeg = buildLeg(-0.145);
  const rightLeg = buildLeg(0.145);

  // --- PELVIS, BELT & ATHLETIC TORSO WITH JACKET / ARMOR ---
  const pelvis = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.2, 0.2, 18),
    pantsMat
  );
  pelvis.scale.set(1.1, 1, 0.76);
  pelvis.position.y = 1.05;
  pelvis.castShadow = true;
  bodyGroup.add(pelvis);

  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.228, 0.225, 0.06, 18),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  belt.scale.set(1.11, 1, 0.78);
  belt.position.y = 1.14;
  bodyGroup.add(belt);

  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.068, 0.045),
    accentMat
  );
  buckle.position.set(0, 1.14, 0.175);
  bodyGroup.add(buckle);

  const innerTorso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.235, 0.205, 0.56, 18),
    innerShirtMat
  );
  innerTorso.scale.set(1.12, 1, 0.74);
  innerTorso.position.y = 1.42;
  innerTorso.castShadow = true;
  bodyGroup.add(innerTorso);

  // Glowing AAA Chest Emblem Crystal
  const chestCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.055, 0),
    accentMat
  );
  chestCore.position.set(0, 1.48, 0.175);
  chestCore.scale.set(1, 1.25, 0.55);
  bodyGroup.add(chestCore);

  const jacketShell = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.255,
      0.225,
      0.55,
      18,
      1,
      false,
      Math.PI * 0.22,
      Math.PI * 1.56
    ),
    jacketMat
  );
  jacketShell.scale.set(1.15, 1, 0.8);
  jacketShell.position.y = 1.43;
  jacketShell.castShadow = true;
  bodyGroup.add(jacketShell);

  [-0.095, 0.095].forEach((lx) => {
    const lapel = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.52, 0.04),
      accentMat
    );
    lapel.position.set(lx, 1.43, 0.18);
    bodyGroup.add(lapel);
  });

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.16,
      0.18,
      0.11,
      16,
      1,
      true,
      Math.PI * 0.25,
      Math.PI * 1.5
    ),
    jacketMat
  );
  collar.position.y = 1.72;
  bodyGroup.add(collar);

  // --- OPTIONAL AAA SHOULDER ARMOR PAULDRONS ---
  if (cfg.hasPauldrons) {
    const pMat = new THREE.MeshStandardMaterial({
      color: cfg.pauldronColor ?? cfg.secondary,
      emissive: cfg.pauldronColor ?? cfg.secondary,
      emissiveIntensity: 0.45,
      metalness: 0.78,
      roughness: 0.2,
    });
    [-0.35, 0.35].forEach((sx) => {
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.145,
          14,
          12,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.55
        ),
        pMat
      );
      pauldron.position.set(sx, 1.67, 0);
      pauldron.rotation.z = sx < 0 ? 0.35 : -0.35;
      pauldron.scale.set(1.18, 0.9, 1.12);
      bodyGroup.add(pauldron);
    });
  }

  // --- OPTIONAL HEROIC FLOWING CAPE ---
  let capePivot: THREE.Group | undefined;
  if (cfg.hasCape) {
    capePivot = new THREE.Group();
    capePivot.position.set(0, 1.68, -0.18);

    const capeMat = new THREE.MeshStandardMaterial({
      color: cfg.capeColor ?? cfg.secondary,
      emissive: cfg.capeColor ?? cfg.secondary,
      emissiveIntensity: 0.18,
      roughness: 0.45,
      metalness: 0.25,
      side: THREE.DoubleSide,
    });
    const capeCloth = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.24,
        0.46,
        1.18,
        16,
        1,
        true,
        Math.PI * 0.72,
        Math.PI * 0.56
      ),
      capeMat
    );
    capeCloth.position.set(0, -0.58, -0.04);
    capeCloth.rotation.x = 0.14;
    capePivot.add(capeCloth);
    bodyGroup.add(capePivot);
  }

  // --- OPTIONAL MYTHIC HOLOGRAPHIC CYBER-CELESTIAL WINGS ---
  let wingsGroup: THREE.Group | undefined;
  if (cfg.hasWings) {
    wingsGroup = new THREE.Group();
    wingsGroup.position.set(0, 1.56, -0.2);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: cfg.wingColor ?? 0x38bdf8,
      emissiveIntensity: 1.45,
      transparent: true,
      opacity: 0.88,
      roughness: 0.1,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });

    [-1, 1].forEach((side) => {
      const wingSide = new THREE.Group();
      wingSide.name = side < 0 ? "leftWing" : "rightWing";
      [0, 1, 2].forEach((featherIdx) => {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.75 - featherIdx * 0.14, 0.11, 0.03),
          wingMat
        );
        blade.position.set(
          side * (0.42 - featherIdx * 0.05),
          0.18 - featherIdx * 0.18,
          -0.04
        );
        blade.rotation.z = side * (0.36 - featherIdx * 0.22);
        wingSide.add(blade);
      });
      wingsGroup!.add(wingSide);
    });
    bodyGroup.add(wingsGroup);
  }

  if (cfg.hasBackpack && !cfg.hasCape && !cfg.hasWings) {
    const packGroup = new THREE.Group();
    const packMain = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.24, 8, 14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55 })
    );
    packMain.scale.set(1.15, 1, 0.68);
    packMain.castShadow = true;
    packGroup.add(packMain);

    const packPocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.18, 0.08),
      accentMat
    );
    packPocket.position.set(0, -0.06, -0.11);
    packGroup.add(packPocket);

    packGroup.position.set(0, 1.44, -0.22);
    bodyGroup.add(packGroup);
  }

  // --- NECK & REALISTIC SCULPTED 3D HUMAN HEAD ---
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.09, 0.16, 14),
    skinMat
  );
  neck.position.y = 1.75;
  bodyGroup.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.97, 0);

  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 24, 20),
    skinMat
  );
  cranium.scale.set(0.92, 1.08, 0.96);
  cranium.castShadow = true;
  headGroup.add(cranium);

  [-0.195, 0.195].forEach((ex) => {
    const ear = new THREE.Mesh(
      new THREE.SphereGeometry(0.044, 10, 10),
      skinMat
    );
    ear.scale.set(0.45, 1.05, 0.68);
    ear.position.set(ex, -0.01, -0.01);
    headGroup.add(ear);
  });

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.026, 0.075, 10),
    skinMat
  );
  nose.rotation.x = Math.PI * 0.42;
  nose.position.set(0, -0.015, 0.205);
  headGroup.add(nose);

  const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshBasicMaterial({ color: cfg.eye });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });

  [-0.074, 0.074].forEach((ex) => {
    const eyeSocket = new THREE.Group();
    eyeSocket.position.set(ex, 0.028, 0.184);
    eyeSocket.rotation.y = ex < 0 ? -0.16 : 0.16;

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.033, 12, 10),
      scleraMat
    );
    sclera.scale.set(1.18, 0.84, 0.35);
    eyeSocket.add(sclera);

    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.021, 14), irisMat);
    iris.position.z = 0.013;
    eyeSocket.add(iris);

    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.011, 12), pupilMat);
    pupil.position.z = 0.015;
    eyeSocket.add(pupil);

    const glint = new THREE.Mesh(
      new THREE.CircleGeometry(0.005, 8),
      scleraMat
    );
    glint.position.set(-0.006, 0.006, 0.017);
    eyeSocket.add(glint);

    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.068, 0.016, 0.02),
      hairMat
    );
    brow.position.set(0, 0.044, 0.008);
    brow.rotation.z = ex < 0 ? 0.08 : -0.08;
    eyeSocket.add(brow);

    headGroup.add(eyeSocket);
  });

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.036, 0.007, 8, 14, Math.PI * 0.72),
    new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.5 })
  );
  smile.rotation.z = Math.PI * 1.14;
  smile.position.set(0, -0.072, 0.184);
  headGroup.add(smile);

  // --- SCULPTED 3D VOLUMETRIC HAIR & SKIN HEADGEAR ---
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.222,
      22,
      18,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.62
    ),
    hairMat
  );
  hairCap.scale.set(0.95, 1.06, 1.02);
  hairCap.rotation.x = -0.22;
  hairCap.position.set(0, 0.02, -0.015);
  headGroup.add(hairCap);

  const fringe = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.055, 0.18, 6, 12),
    hairMat
  );
  fringe.rotation.z = Math.PI / 2 - 0.14;
  fringe.position.set(0.01, 0.135, 0.145);
  headGroup.add(fringe);

  if (cfg.hatType === "cap") {
    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.228,
        20,
        14,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.52
      ),
      jacketMat
    );
    capDome.position.y = 0.03;
    headGroup.add(capDome);

    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.22,
        0.22,
        0.025,
        16,
        1,
        false,
        -Math.PI * 0.35,
        Math.PI * 0.7
      ),
      accentMat
    );
    visor.position.set(0, 0.09, 0.12);
    visor.rotation.x = 0.14;
    headGroup.add(visor);
  } else if (cfg.hatType === "straw") {
    const strawMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.7,
    });
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.45, 0.025, 24),
      strawMat
    );
    brim.position.y = 0.14;
    headGroup.add(brim);

    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.23, 0.16, 20),
      strawMat
    );
    crown.position.y = 0.22;
    headGroup.add(crown);
  } else if (cfg.hatType === "headphones") {
    const phoneMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.45,
      metalness: 0.55,
    });
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.225, 0.02, 10, 24, Math.PI),
      phoneMat
    );
    band.position.y = 0.02;
    headGroup.add(band);

    [-0.215, 0.215].forEach((cx) => {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.055, 16),
        phoneMat
      );
      cup.rotation.z = Math.PI / 2;
      cup.position.set(cx, 0, 0.01);
      headGroup.add(cup);
    });
  } else if (cfg.hatType === "glasses") {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.55,
      metalness: 0.85,
      roughness: 0.15,
    });
    const shades = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.075, 0.05),
      glassMat
    );
    shades.position.set(0, 0.032, 0.195);
    headGroup.add(shades);
  } else if (cfg.hatType === "visor") {
    // Futuristic Cyber Neon Wrap-Around Holographic Visor
    const visorMat = new THREE.MeshStandardMaterial({
      color: cfg.secondary,
      emissive: cfg.secondary,
      emissiveIntensity: 1.25,
      transparent: true,
      opacity: 0.88,
      metalness: 0.9,
      roughness: 0.1,
    });
    const cyberVisor = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.222,
        0.222,
        0.082,
        24,
        1,
        true,
        -Math.PI * 0.42,
        Math.PI * 0.84
      ),
      visorMat
    );
    cyberVisor.position.set(0, 0.032, 0.01);
    headGroup.add(cyberVisor);
  } else if (cfg.hatType === "crown") {
    // Royal Golden Crown with Gem Spires
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      metalness: 0.92,
      roughness: 0.14,
    });
    const circlet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.195, 0.09, 20, 1, true),
      crownMat
    );
    circlet.position.y = 0.18;
    headGroup.add(circlet);

    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.038, 0.11, 6),
        crownMat
      );
      spike.position.set(Math.sin(ang) * 0.2, 0.26, Math.cos(ang) * 0.2);
      headGroup.add(spike);
    }
  } else if (cfg.hatType === "hood") {
    // Desert Nomad Tactical Cowl Hood
    const hoodDome = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.242,
        20,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.72
      ),
      jacketMat
    );
    hoodDome.rotation.x = -0.35;
    hoodDome.position.set(0, 0.01, -0.02);
    headGroup.add(hoodDome);
  } else if (cfg.hatType === "curls") {
    [
      [-0.18, 0.08, -0.04],
      [0.18, 0.08, -0.04],
      [0, 0.16, -0.12],
    ].forEach(([cx, cy, cz]) => {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.145, 14, 14),
        hairMat
      );
      puff.position.set(cx, cy, cz);
      headGroup.add(puff);
    });
  }

  // --- OPTIONAL FLOATING CELESTIAL / GOLDEN HALO ---
  let haloMesh: THREE.Mesh | undefined;
  if (cfg.hasHalo) {
    haloMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.018, 12, 32),
      new THREE.MeshBasicMaterial({
        color: cfg.haloColor ?? 0xfde047,
      })
    );
    haloMesh.rotation.x = Math.PI / 2 - 0.15;
    haloMesh.position.set(0, 0.36, -0.02);
    headGroup.add(haloMesh);
  }

  bodyGroup.add(headGroup);

  // --- MULTI-JOINTED ARMS ---
  const buildArm = (offsetX: number) => {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(offsetX, 1.64, 0);

    const deltoid = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 12, 10),
      jacketMat
    );
    shoulderPivot.add(deltoid);

    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.076, 0.22, 8, 12),
      jacketMat
    );
    upperArm.position.y = -0.16;
    upperArm.castShadow = true;
    shoulderPivot.add(upperArm);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, -0.31, 0);
    elbowPivot.rotation.x = -0.22;
    shoulderPivot.add(elbowPivot);

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.055, 0.25, 12),
      skinMat
    );
    forearm.position.y = -0.13;
    forearm.castShadow = true;
    elbowPivot.add(forearm);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 12, 10),
      skinMat
    );
    hand.scale.set(0.85, 1.15, 1.05);
    hand.position.y = -0.28;
    elbowPivot.add(hand);

    bodyGroup.add(shoulderPivot);
    return { shoulderPivot, elbowPivot };
  };

  const leftArm = buildArm(-0.33);
  const rightArm = buildArm(0.33);

  let weaponMesh: THREE.Group | undefined;
  let slashArc: THREE.Mesh | undefined;
  let shieldDome: THREE.Mesh | undefined;

  if (cfg.hasWeapon) {
    weaponMesh = new THREE.Group();
    weaponMesh.position.set(0, -0.28, 0.08);
    weaponMesh.rotation.x = Math.PI * 0.42;

    const hilt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.036, 0.3, 10),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.88,
        roughness: 0.18,
      })
    );
    weaponMesh.add(hilt);

    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.065, 0.095),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88 })
    );
    guard.position.y = 0.15;
    weaponMesh.add(guard);

    const wCol = cfg.weaponColor || 0x38bdf8;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 1.15, 0.036),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: wCol,
        emissiveIntensity: 1.65,
      })
    );
    blade.position.y = 0.74;
    weaponMesh.add(blade);

    rightArm.elbowPivot.add(weaponMesh);

    slashArc = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 2.4, 28, 1, -Math.PI * 0.45, Math.PI * 0.9),
      new THREE.MeshBasicMaterial({
        color: wCol,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      })
    );
    slashArc.rotation.x = -Math.PI / 2;
    slashArc.position.y = 1.15;
    root.add(slashArc);

    shieldDome = new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 22, 16),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        wireframe: true,
        transparent: true,
        opacity: 0,
      })
    );
    shieldDome.position.y = 1.15;
    root.add(shieldDome);
  }

  if (cfg.label) {
    const plate = createNameplateSprite(
      cfg.label,
      cfg.labelColor || "#fbbf24"
    );
    plate.position.y = cfg.hasHalo ? 2.68 : 2.55;
    root.add(plate);
  }

  return {
    root,
    bodyGroup,
    headGroup,
    leftArmPivot: leftArm.shoulderPivot,
    rightArmPivot: rightArm.shoulderPivot,
    leftElbowPivot: leftArm.elbowPivot,
    rightElbowPivot: rightArm.elbowPivot,
    leftLegPivot: leftLeg.hipPivot,
    rightLegPivot: rightLeg.hipPivot,
    leftKneePivot: leftLeg.kneePivot,
    rightKneePivot: rightLeg.kneePivot,
    weaponMesh,
    slashArc,
    shieldDome,
    capePivot,
    wingsGroup,
    haloMesh,
    groundAura,
  };
}

/**
 * Animates a human rig with AAA idle breathing, flowing cape/wings/halo,
 * knee-bending GTA stride, vehicle driving pose, or 4 expressive 3D Emotes!
 */
export function animateHumanRig(
  rig: ArticulatedRig,
  walkCycle: number,
  isMoving: boolean,
  inVehicle: boolean,
  attackAnimTimer = 0,
  idleTime = 0,
  emoteType: HeroEmoteType = "idle",
  emoteTime = 0
) {
  // Always animate accessories (Halo, Wings, Cape, Ground Aura)
  if (rig.haloMesh) {
    rig.haloMesh.rotation.z = idleTime * 1.8;
    rig.haloMesh.position.y = 0.36 + Math.sin(idleTime * 3.0) * 0.02;
  }
  if (rig.wingsGroup) {
    const flap = Math.sin(idleTime * (isMoving ? 8.5 : 3.4)) * 0.24;
    const lw = rig.wingsGroup.getObjectByName("leftWing");
    const rw = rig.wingsGroup.getObjectByName("rightWing");
    if (lw) lw.rotation.y = 0.25 + flap;
    if (rw) rw.rotation.y = -0.25 - flap;
  }
  if (rig.capePivot) {
    const billow = isMoving
      ? 0.48 + Math.sin(walkCycle * 1.5) * 0.12
      : 0.08 + Math.sin(idleTime * 2.2) * 0.06;
    rig.capePivot.rotation.x = billow;
  }
  if (rig.groundAura) {
    rig.groundAura.rotation.z = idleTime * 0.9;
  }

  // Reset rotations that emotes might modify
  rig.bodyGroup.rotation.x = 0;
  rig.bodyGroup.rotation.z = 0;
  rig.leftArmPivot.rotation.z = 0;
  rig.rightArmPivot.rotation.z = 0;
  rig.headGroup.rotation.x = 0;
  rig.headGroup.rotation.y = 0;

  if (inVehicle) {
    rig.bodyGroup.position.y = 0.12;
    rig.bodyGroup.rotation.y = 0;
    rig.leftLegPivot.rotation.x = -1.05;
    rig.rightLegPivot.rotation.x = -1.05;
    if (rig.leftKneePivot) rig.leftKneePivot.rotation.x = 1.1;
    if (rig.rightKneePivot) rig.rightKneePivot.rotation.x = 1.1;
    rig.leftArmPivot.rotation.x = -0.75;
    rig.rightArmPivot.rotation.x = -0.75;
    return;
  }

  // --- AAA EXPRESSIVE 3D EMOTE ANIMATIONS ---
  if (!isMoving && emoteType !== "idle") {
    if (emoteType === "slash_spin") {
      // Heroic 360° Spinning Jump Slash!
      const t = emoteTime * 6.5;
      rig.bodyGroup.position.y = Math.abs(Math.sin(emoteTime * 4.5)) * 0.42;
      rig.bodyGroup.rotation.y = t;
      rig.rightArmPivot.rotation.x = -1.75;
      rig.rightArmPivot.rotation.z = -0.45;
      rig.leftArmPivot.rotation.x = 0.4;
      rig.leftArmPivot.rotation.z = 0.45;
      rig.leftLegPivot.rotation.x = -0.35;
      rig.rightLegPivot.rotation.x = 0.35;
      if (rig.leftKneePivot) rig.leftKneePivot.rotation.x = 0.55;
      if (rig.rightKneePivot) rig.rightKneePivot.rotation.x = 0.35;
      if (rig.slashArc) {
        rig.slashArc.rotation.z = -t * 1.6;
        (rig.slashArc.material as THREE.MeshBasicMaterial).opacity = 0.85;
      }
      return;
    }

    if (emoteType === "victory") {
      // Joyful Praise & Victory Jump!
      const bounce = Math.abs(Math.sin(emoteTime * 6.2));
      rig.bodyGroup.position.y = bounce * 0.28;
      rig.bodyGroup.rotation.y = Math.sin(emoteTime * 3.1) * 0.22;
      rig.headGroup.rotation.x = -0.22;
      rig.leftArmPivot.rotation.x = -2.75 + Math.sin(emoteTime * 9) * 0.18;
      rig.rightArmPivot.rotation.x = -2.75 - Math.sin(emoteTime * 9) * 0.18;
      rig.leftArmPivot.rotation.z = 0.25;
      rig.rightArmPivot.rotation.z = -0.25;
      rig.leftLegPivot.rotation.x = -bounce * 0.32;
      rig.rightLegPivot.rotation.x = bounce * 0.22;
      if (rig.leftKneePivot) rig.leftKneePivot.rotation.x = bounce * 0.55;
      if (rig.rightKneePivot) rig.rightKneePivot.rotation.x = bounce * 0.35;
      return;
    }

    if (emoteType === "dance") {
      // GTA Street Groove / Hip-Hop Passinho!
      const beat = emoteTime * 8.0;
      const s = Math.sin(beat);
      const c = Math.cos(beat);
      rig.bodyGroup.position.y = Math.abs(c) * 0.14;
      rig.bodyGroup.rotation.y = s * 0.38;
      rig.bodyGroup.rotation.z = s * 0.08;
      rig.headGroup.rotation.y = -s * 0.25;
      rig.leftArmPivot.rotation.x = -1.1 + s * 0.65;
      rig.rightArmPivot.rotation.x = -1.1 - s * 0.65;
      rig.leftArmPivot.rotation.z = 0.35 + c * 0.2;
      rig.rightArmPivot.rotation.z = -0.35 + c * 0.2;
      if (rig.leftElbowPivot) rig.leftElbowPivot.rotation.x = -0.85;
      if (rig.rightElbowPivot) rig.rightElbowPivot.rotation.x = -0.85;
      rig.leftLegPivot.rotation.x = s * 0.45;
      rig.rightLegPivot.rotation.x = -s * 0.45;
      if (rig.leftKneePivot)
        rig.leftKneePivot.rotation.x = Math.max(0.1, -s * 0.65);
      if (rig.rightKneePivot)
        rig.rightKneePivot.rotation.x = Math.max(0.1, s * 0.65);
      return;
    }

    if (emoteType === "kneel_pray") {
      // Heroic Power Stance of Faith + Glowing Golden Shield Dome!
      rig.bodyGroup.position.y = -0.28;
      rig.headGroup.rotation.x = 0.26;
      rig.leftLegPivot.rotation.x = -1.05;
      if (rig.leftKneePivot) rig.leftKneePivot.rotation.x = 1.25;
      rig.rightLegPivot.rotation.x = 0.35;
      if (rig.rightKneePivot) rig.rightKneePivot.rotation.x = 1.15;
      rig.leftArmPivot.rotation.x = -0.95;
      rig.rightArmPivot.rotation.x = -0.95;
      if (rig.shieldDome) {
        rig.shieldDome.rotation.y = emoteTime * 2.2;
        (rig.shieldDome.material as THREE.MeshBasicMaterial).opacity =
          0.38 + Math.sin(emoteTime * 5) * 0.14;
      }
      return;
    }
  }

  if (isMoving) {
    const s = Math.sin(walkCycle);
    const c = Math.cos(walkCycle);

    rig.bodyGroup.position.y = Math.abs(c) * 0.085;
    rig.bodyGroup.rotation.y = s * 0.08;
    rig.bodyGroup.rotation.x = 0.06; // Dynamic athletic sprint lean!

    rig.leftLegPivot.rotation.x = s * 0.7;
    rig.rightLegPivot.rotation.x = -s * 0.7;
    if (rig.leftKneePivot) {
      rig.leftKneePivot.rotation.x = Math.max(0.05, -c * 0.8);
    }
    if (rig.rightKneePivot) {
      rig.rightKneePivot.rotation.x = Math.max(0.05, c * 0.8);
    }

    rig.leftArmPivot.rotation.x = -s * 0.6;
    if (rig.leftElbowPivot) {
      rig.leftElbowPivot.rotation.x = -0.32 - Math.max(0, s) * 0.45;
    }

    if (attackAnimTimer <= 0) {
      rig.rightArmPivot.rotation.x = s * 0.6;
      if (rig.rightElbowPivot) {
        rig.rightElbowPivot.rotation.x = -0.32 - Math.max(0, -s) * 0.45;
      }
    }
  } else {
    // AAA Natural Idle Breathing & Subtle Head Look-Around!
    const breath = Math.sin(idleTime * 2.5);
    rig.bodyGroup.position.y = breath * 0.022;
    rig.bodyGroup.rotation.y = Math.sin(idleTime * 0.9) * 0.04;
    rig.headGroup.rotation.y = Math.sin(idleTime * 1.15) * 0.11;
    rig.headGroup.rotation.x = Math.cos(idleTime * 1.4) * 0.03;

    rig.leftLegPivot.rotation.x *= 0.84;
    rig.rightLegPivot.rotation.x *= 0.84;
    if (rig.leftKneePivot) rig.leftKneePivot.rotation.x *= 0.84;
    if (rig.rightKneePivot) rig.rightKneePivot.rotation.x *= 0.84;

    rig.leftArmPivot.rotation.x = Math.sin(idleTime * 1.8) * 0.05;
    rig.leftArmPivot.rotation.z = 0.05 + breath * 0.02;
    if (rig.leftElbowPivot) {
      rig.leftElbowPivot.rotation.x +=
        (-0.24 - rig.leftElbowPivot.rotation.x) * 0.16;
    }
    if (attackAnimTimer <= 0) {
      rig.rightArmPivot.rotation.x = -Math.sin(idleTime * 1.8) * 0.05;
      rig.rightArmPivot.rotation.z = -0.05 - breath * 0.02;
      if (rig.rightElbowPivot) {
        rig.rightElbowPivot.rotation.x +=
          (-0.24 - rig.rightElbowPivot.rotation.x) * 0.16;
      }
    }
  }
}

export function createPlayableChampion3D(
  avatarId: AvatarId,
  agentName: string,
  skinId: SkinId = "padrao",
  showNameplate = true
): ArticulatedRig {
  const baseByAvatar: Record<AvatarId, CharacterVisualConfig> = {
    lucas: {
      skin: "#e5a975",
      eye: "#10b981",
      shirt: 0x059669,
      secondary: 0x34d399,
      pants: 0x1e293b,
      hair: 0x2e1a0f,
      hatType: "cap",
      hasBackpack: true,
      hasWeapon: true,
      weaponColor: 0x34d399,
      labelColor: "#34d399",
    },
    sofia: {
      skin: "#fad0b1",
      eye: "#06b6d4",
      shirt: 0x0284c7,
      secondary: 0x22d3ee,
      pants: 0x1e1b4b,
      hair: 0x3b1d14,
      hatType: "headphones",
      hasBackpack: true,
      hasWeapon: true,
      weaponColor: 0x22d3ee,
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
      hasBackpack: true,
      hasWeapon: true,
      weaponColor: 0xfbbf24,
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
      hasBackpack: true,
      hasWeapon: true,
      weaponColor: 0xe879f9,
      labelColor: "#c084fc",
    },
  };

  const base = { ...(baseByAvatar[avatarId] || baseByAvatar.lucas) };

  // Apply AAA 3D Skin Overrides!
  const skinOverrides: Record<SkinId, Partial<CharacterVisualConfig>> = {
    padrao: {},
    cyber_neon: {
      shirt: 0x090d16,
      innerShirt: 0x083344,
      secondary: 0x22d3ee,
      pants: 0x0f172a,
      shoeColor: 0x06b6d4,
      jacketMetalness: 0.65,
      jacketEmissive: 0x083344,
      jacketEmissiveIntensity: 0.45,
      hatType: "visor",
      hasPauldrons: true,
      pauldronColor: 0x22d3ee,
      weaponColor: 0x22d3ee,
      labelColor: "#22d3ee",
    },
    explorador_selva: {
      shirt: 0x065f46,
      innerShirt: 0xfef3c7,
      secondary: 0xfbbf24,
      pants: 0x292524,
      shoeColor: 0x78350f,
      hatType: "straw",
      hasBackpack: true,
      weaponColor: 0x34d399,
      labelColor: "#34d399",
    },
    street_gta: {
      shirt: 0x6d28d9,
      innerShirt: 0x111827,
      secondary: 0xfbbf24,
      pants: 0x090d16,
      shoeColor: 0xf43f5e,
      jacketMetalness: 0.35,
      hatType: "headphones",
      weaponColor: 0xc084fc,
      labelColor: "#c084fc",
    },
    deserto_1040: {
      shirt: 0xd97706,
      innerShirt: 0xfef3c7,
      secondary: 0x2dd4bf,
      pants: 0x451a03,
      shoeColor: 0x92400e,
      hatType: "hood",
      hasCape: true,
      capeColor: 0xb45309,
      weaponColor: 0xf59e0b,
      labelColor: "#fbbf24",
    },
    embaixador_ouro: {
      shirt: 0xf8fafc,
      innerShirt: 0xfef08a,
      secondary: 0xfbbf24,
      pants: 0x1e293b,
      shoeColor: 0xd97706,
      jacketMetalness: 0.85,
      jacketEmissive: 0x78350f,
      jacketEmissiveIntensity: 0.3,
      hatType: "crown",
      hasPauldrons: true,
      pauldronColor: 0xfbbf24,
      hasCape: true,
      capeColor: 0xd97706,
      weaponColor: 0xfde047,
      labelColor: "#fde047",
    },
    sentinela_fogo: {
      shirt: 0x881337,
      innerShirt: 0x450a0a,
      secondary: 0xf97316,
      pants: 0x18181b,
      shoeColor: 0xe11d48,
      jacketMetalness: 0.72,
      jacketEmissive: 0x9f1239,
      jacketEmissiveIntensity: 0.5,
      hatType: "visor",
      hasPauldrons: true,
      pauldronColor: 0xf97316,
      hasCape: true,
      capeColor: 0xe11d48,
      weaponColor: 0xfb7185,
      labelColor: "#fb7185",
    },
    celestial_mitico: {
      shirt: 0xe0f2fe,
      innerShirt: 0x1e1b4b,
      secondary: 0x38bdf8,
      pants: 0x0f172a,
      shoeColor: 0x38bdf8,
      jacketMetalness: 0.9,
      jacketEmissive: 0x0284c7,
      jacketEmissiveIntensity: 0.45,
      hatType: "crown",
      hasPauldrons: true,
      pauldronColor: 0x38bdf8,
      hasWings: true,
      wingColor: 0x38bdf8,
      hasHalo: true,
      haloColor: 0xfde047,
      weaponColor: 0x7dd3fc,
      labelColor: "#38bdf8",
    },
  };

  const merged: CharacterVisualConfig = {
    ...base,
    ...(skinOverrides[skinId] || {}),
    label: showNameplate ? `⚔️ ${agentName}` : undefined,
  };

  return buildStylizedHumanRig(merged);
}

/**
 * Humanoid Armored Shadow Warrior & Towering AAA District Shadow Boss Leader
 */
export function createShadowEnemyRig(
  name: string,
  isBoss = false
): ArticulatedRig {
  const scale = isBoss ? 2.05 : 1.08;
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  bodyGroup.scale.setScalar(scale);
  root.add(bodyGroup);

  const aura = new THREE.Mesh(
    new THREE.RingGeometry(0.7 * scale, 0.98 * scale, 32),
    new THREE.MeshBasicMaterial({
      color: isBoss ? 0xf43f5e : 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.04;
  root.add(aura);

  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x120a24,
    emissive: isBoss ? 0x4c0519 : 0x2e1065,
    emissiveIntensity: 0.58,
    roughness: 0.22,
    metalness: 0.75,
  });

  const energyMat = new THREE.MeshStandardMaterial({
    color: isBoss ? 0xf43f5e : 0xc084fc,
    emissive: isBoss ? 0xe11d48 : 0x9333ea,
    emissiveIntensity: 1.45,
  });

  const buildShadowLeg = (ox: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(ox, 0.95, 0);
    const greave = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.55, 8, 12),
      armorMat
    );
    greave.position.y = -0.38;
    greave.castShadow = true;
    legPivot.add(greave);
    bodyGroup.add(legPivot);
    return legPivot;
  };
  const leftLegPivot = buildShadowLeg(-0.18);
  const rightLegPivot = buildShadowLeg(0.18);

  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.22, 0.72, 12),
    armorMat
  );
  chest.scale.set(1.18, 1, 0.78);
  chest.position.y = 1.35;
  chest.castShadow = true;
  bodyGroup.add(chest);

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), energyMat);
  core.position.set(0, 1.4, 0.24);
  bodyGroup.add(core);

  if (isBoss) {
    // Boss Dark Flowing Mantle Cape
    const bossCape = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.28,
        0.58,
        1.28,
        14,
        1,
        true,
        Math.PI * 0.7,
        Math.PI * 0.6
      ),
      new THREE.MeshStandardMaterial({
        color: 0x4c0519,
        emissive: 0x881337,
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide,
      })
    );
    bossCape.position.set(0, 1.05, -0.24);
    bossCape.rotation.x = 0.16;
    bodyGroup.add(bossCape);
  }

  [-0.44, 0.44].forEach((sx) => {
    const pauldron = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.48, 8),
      energyMat
    );
    pauldron.position.set(sx, 1.66, 0);
    pauldron.rotation.z = sx < 0 ? 0.55 : -0.55;
    bodyGroup.add(pauldron);
  });

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.95, 0);

  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 14),
    armorMat
  );
  helm.scale.set(0.95, 1.12, 1.02);
  headGroup.add(helm);

  [-0.08, 0.08].forEach((ex) => {
    const eye = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.028, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xfda4af })
    );
    eye.position.set(ex, 0.02, 0.22);
    eye.rotation.z = ex < 0 ? -0.22 : 0.22;
    headGroup.add(eye);
  });

  [-0.19, 0.19].forEach((hx) => {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.065, 0.38, 8),
      energyMat
    );
    horn.position.set(hx, 0.28, -0.02);
    horn.rotation.z = hx < 0 ? 0.35 : -0.35;
    headGroup.add(horn);
  });
  bodyGroup.add(headGroup);

  const buildShadowArm = (ox: number, withSword: boolean) => {
    const pivot = new THREE.Group();
    pivot.position.set(ox, 1.58, 0);
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.085, 0.42, 6, 10),
      armorMat
    );
    arm.position.y = -0.26;
    pivot.add(arm);

    if (withSword) {
      const darkBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.095, 1.02, 0.045),
        energyMat
      );
      darkBlade.position.set(0, -0.58, 0.35);
      darkBlade.rotation.x = Math.PI * 0.4;
      pivot.add(darkBlade);
    }
    bodyGroup.add(pivot);
    return pivot;
  };
  const leftArmPivot = buildShadowArm(-0.44, false);
  const rightArmPivot = buildShadowArm(0.44, true);

  const hpBg = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5 * scale, 0.17 * scale),
    new THREE.MeshBasicMaterial({ color: 0x090d16, side: THREE.DoubleSide })
  );
  hpBg.position.y = 2.52 * scale;
  root.add(hpBg);

  const hpBarFill = new THREE.Mesh(
    new THREE.PlaneGeometry(1.42 * scale, 0.12 * scale),
    new THREE.MeshBasicMaterial({
      color: isBoss ? 0xf43f5e : 0xc084fc,
      side: THREE.DoubleSide,
    })
  );
  hpBarFill.position.set(0, 2.52 * scale, 0.02);
  root.add(hpBarFill);

  if (isBoss) {
    const bossTag = createNameplateSprite(`👑 ${name}`, "#f43f5e");
    bossTag.position.y = 2.98 * scale;
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
    groundAura: aura,
  };
}

export type GtaVehicleKind = "sports" | "suv" | "moto";

/**
 * Builds realistic sculpted 3D GTA vehicles (Sports Coupe GT, 4x4 Tactical SUV,
 * or Street Turbo Motorcycle) with sloped hoods, tinted cabin glass, spoilers,
 * alloy wheels, headlights, brake light strips, and Nitro Boost flame cones!
 */
export function createGtaVehicle3D(
  kind: GtaVehicleKind,
  colorHex: number,
  label: string
): THREE.Group {
  const vehicle = new THREE.Group();

  const paintMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.18,
    metalness: 0.72,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.45,
    metalness: 0.4,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x082f49,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.82,
  });
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.75,
  });
  const alloyMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.2,
  });
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  const addWheel = (wx: number, wy: number, wz: number, r = 0.42, w = 0.32) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, w, 20),
      tireMat
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wGroup.add(tire);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.62, r * 0.62, w + 0.02, 14),
      alloyMat
    );
    rim.rotation.z = Math.PI / 2;
    wGroup.add(rim);
    vehicle.add(wGroup);
  };

  if (kind === "sports") {
    const lowerChassis = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.56, 4.55),
      paintMat
    );
    lowerChassis.position.y = 0.58;
    lowerChassis.castShadow = true;
    vehicle.add(lowerChassis);

    const frontNose = new THREE.Mesh(
      new THREE.BoxGeometry(2.08, 0.36, 1.35),
      paintMat
    );
    frontNose.position.set(0, 0.62, 1.72);
    frontNose.rotation.x = 0.18;
    vehicle.add(frontNose);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.78, 0.58, 2.05),
      glassMat
    );
    cabin.position.set(0, 1.08, -0.15);
    vehicle.add(cabin);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.72, 0.09, 1.45),
      paintMat
    );
    roof.position.set(0, 1.38, -0.2);
    vehicle.add(roof);

    [-0.72, 0.72].forEach((sx) => {
      const strut = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.32, 0.18),
        trimMat
      );
      strut.position.set(sx, 0.98, -2.02);
      vehicle.add(strut);
    });
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(2.12, 0.08, 0.36),
      trimMat
    );
    wing.position.set(0, 1.15, -2.06);
    vehicle.add(wing);

    [-0.72, 0.72].forEach((hx) => {
      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.14, 0.1),
        headlightMat
      );
      hl.position.set(hx, 0.64, 2.31);
      vehicle.add(hl);
    });
    const tailStrip = new THREE.Mesh(
      new THREE.BoxGeometry(1.96, 0.14, 0.08),
      taillightMat
    );
    tailStrip.position.set(0, 0.72, -2.28);
    vehicle.add(tailStrip);

    addWheel(-1.08, 0.42, 1.38, 0.42, 0.32);
    addWheel(1.08, 0.42, 1.38, 0.42, 0.32);
    addWheel(-1.08, 0.42, -1.38, 0.44, 0.34);
    addWheel(1.08, 0.42, -1.38, 0.44, 0.34);
  } else if (kind === "moto") {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.56, 2.35),
      paintMat
    );
    frame.position.y = 0.72;
    frame.castShadow = true;
    vehicle.add(frame);

    const fairing = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 0.95, 12),
      paintMat
    );
    fairing.rotation.x = Math.PI / 2;
    fairing.position.set(0, 0.88, 0.95);
    vehicle.add(fairing);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.34, 0.45),
      glassMat
    );
    visor.rotation.x = -0.5;
    visor.position.set(0, 1.18, 0.72);
    vehicle.add(visor);

    const handlebars = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.95, 10),
      trimMat
    );
    handlebars.rotation.z = Math.PI / 2;
    handlebars.position.set(0, 1.15, 0.48);
    vehicle.add(handlebars);

    const hl = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 10),
      headlightMat
    );
    hl.position.set(0, 0.88, 1.38);
    vehicle.add(hl);

    addWheel(0, 0.44, 0.98, 0.44, 0.24);
    addWheel(0, 0.44, -0.98, 0.45, 0.28);
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.26, 0.82, 4.35),
      paintMat
    );
    body.position.y = 0.88;
    body.castShadow = true;
    vehicle.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.04, 0.74, 2.45),
      glassMat
    );
    cabin.position.set(0, 1.56, -0.35);
    vehicle.add(cabin);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(2.08, 0.12, 2.5),
      paintMat
    );
    roof.position.set(0, 1.95, -0.35);
    vehicle.add(roof);

    const lightBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.12, 0.14),
      headlightMat
    );
    lightBar.position.set(0, 2.05, 0.82);
    vehicle.add(lightBar);

    const bullBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.45, 0.22),
      trimMat
    );
    bullBar.position.set(0, 0.72, 2.24);
    vehicle.add(bullBar);

    const spare = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.28, 18),
      tireMat
    );
    spare.rotation.x = Math.PI / 2;
    spare.position.set(0, 1.15, -2.28);
    vehicle.add(spare);

    [-0.78, 0.78].forEach((hx) => {
      const hl = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 12, 10),
        headlightMat
      );
      hl.position.set(hx, 0.94, 2.2);
      vehicle.add(hl);
    });

    addWheel(-1.14, 0.5, 1.38, 0.5, 0.38);
    addWheel(1.14, 0.5, 1.38, 0.5, 0.38);
    addWheel(-1.14, 0.5, -1.38, 0.5, 0.38);
    addWheel(1.14, 0.5, -1.38, 0.5, 0.38);
  }

  const nitroFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 1.4, 12),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
    })
  );
  nitroFlame.rotation.x = -Math.PI / 2;
  nitroFlame.position.set(0, 0.55, kind === "moto" ? -1.65 : -2.8);
  nitroFlame.visible = false;
  nitroFlame.name = "nitroFlame";
  vehicle.add(nitroFlame);

  const tag = createNameplateSprite(`🚙 ${label} [V]`, "#38bdf8");
  tag.position.y = 2.65;
  tag.name = "vehicleTag";
  vehicle.add(tag);

  return vehicle;
}

export function createTacticalVehicle3D(missionId: string): THREE.Group {
  if (missionId === "toquio") {
    return createGtaVehicle3D("sports", 0x06b6d4, "CYBER GT TURBO");
  }
  return createGtaVehicle3D("suv", 0x10b981, "SUV TÁTICO 4X4");
}
