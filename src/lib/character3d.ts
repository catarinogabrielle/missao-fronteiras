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
  gender?: "male" | "female";
  avatarId?: AvatarId;
  heldItemType?: "sword" | "tablet" | "lantern" | "cyber_blade" | "none";
  hatType?:
    | "cap"
    | "straw"
    | "headphones"
    | "glasses"
    | "curls"
    | "hood"
    | "visor"
    | "crown"
    | "none";
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

  const isFemale = cfg.gender === "female";
  const shoulderOffset = isFemale ? 0.285 : 0.33;
  const hipOffset = isFemale ? 0.135 : 0.145;
  const torsoWidth = isFemale ? 1.0 : 1.12;
  const torsoDepth = isFemale ? 0.68 : 0.74;

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
    roughness: isFemale ? 0.42 : 0.5,
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

  // --- MULTI-JOINTED LEGS (HIP -> THIGH -> KNEE -> CALF -> SNEAKER) ---
  const buildLeg = (offsetX: number) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(offsetX, 1.02, 0);

    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(isFemale ? 0.088 : 0.096, 0.3, 8, 14),
      pantsMat
    );
    thigh.position.y = -0.22;
    thigh.castShadow = true;
    hipPivot.add(thigh);

    const kneePivot = new THREE.Group();
    kneePivot.position.set(0, -0.46, 0);
    hipPivot.add(kneePivot);

    const kneeCap = new THREE.Mesh(
      new THREE.SphereGeometry(isFemale ? 0.08 : 0.088, 12, 10),
      pantsMat
    );
    kneePivot.add(kneeCap);

    const calf = new THREE.Mesh(
      new THREE.CylinderGeometry(isFemale ? 0.076 : 0.084, isFemale ? 0.06 : 0.066, 0.38, 14),
      pantsMat
    );
    calf.position.y = -0.21;
    calf.castShadow = true;
    kneePivot.add(calf);

    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.46, 0.04);

    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(isFemale ? 0.16 : 0.18, 0.055, 0.34),
      soleMat
    );
    sole.position.y = -0.05;
    shoeGroup.add(sole);

    const shoeBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(isFemale ? 0.072 : 0.078, 0.14, 8, 12),
      shoeUpperMat
    );
    shoeBody.rotation.x = Math.PI / 2;
    shoeBody.position.set(0, 0.01, 0.01);
    shoeBody.castShadow = true;
    shoeGroup.add(shoeBody);

    const shoeStripe = new THREE.Mesh(
      new THREE.BoxGeometry(isFemale ? 0.155 : 0.175, 0.042, 0.125),
      accentMat
    );
    shoeStripe.position.set(0, 0.01, 0.02);
    shoeGroup.add(shoeStripe);

    kneePivot.add(shoeGroup);
    bodyGroup.add(hipPivot);
    return { hipPivot, kneePivot };
  };

  const leftLeg = buildLeg(-hipOffset);
  const rightLeg = buildLeg(hipOffset);

  // --- PELVIS, BELT & TORSO ---
  const pelvis = new THREE.Mesh(
    new THREE.CylinderGeometry(isFemale ? 0.2 : 0.22, 0.185, 0.2, 18),
    pantsMat
  );
  pelvis.scale.set(isFemale ? 1.05 : 1.1, 1, isFemale ? 0.74 : 0.76);
  pelvis.position.y = 1.05;
  pelvis.castShadow = true;
  bodyGroup.add(pelvis);

  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(isFemale ? 0.21 : 0.228, isFemale ? 0.205 : 0.225, 0.06, 18),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  belt.scale.set(isFemale ? 1.06 : 1.11, 1, 0.78);
  belt.position.y = 1.14;
  bodyGroup.add(belt);

  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.065, 0.045),
    accentMat
  );
  buckle.position.set(0, 1.14, 0.175);
  bodyGroup.add(buckle);

  const innerTorso = new THREE.Mesh(
    new THREE.CylinderGeometry(isFemale ? 0.215 : 0.235, isFemale ? 0.185 : 0.205, 0.56, 18),
    innerShirtMat
  );
  innerTorso.scale.set(torsoWidth, 1, torsoDepth);
  innerTorso.position.y = 1.42;
  innerTorso.castShadow = true;
  bodyGroup.add(innerTorso);

  // Glowing Chest Emblem / Crystal
  const chestCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.05, 0),
    accentMat
  );
  chestCore.position.set(0, 1.48, 0.175);
  chestCore.scale.set(1, 1.25, 0.55);
  bodyGroup.add(chestCore);

  const jacketShell = new THREE.Mesh(
    new THREE.CylinderGeometry(
      isFemale ? 0.235 : 0.255,
      isFemale ? 0.205 : 0.225,
      0.55,
      18,
      1,
      false,
      Math.PI * 0.22,
      Math.PI * 1.56
    ),
    jacketMat
  );
  jacketShell.scale.set(isFemale ? 1.05 : 1.15, 1, isFemale ? 0.75 : 0.8);
  jacketShell.position.y = 1.43;
  jacketShell.castShadow = true;
  bodyGroup.add(jacketShell);

  [-0.09, 0.09].forEach((lx) => {
    const lapel = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.52, 0.04),
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

  // --- PAULDRONS (OPTIONAL) ---
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

  // --- CAPE (OPTIONAL) ---
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

  // --- WINGS (OPTIONAL) ---
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

  // --- BACKPACK ---
  if (cfg.hasBackpack && !cfg.hasCape && !cfg.hasWings) {
    const packGroup = new THREE.Group();
    const packMain = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.15, 0.23, 8, 14),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    packMain.scale.set(1.15, 1, 0.68);
    packMain.castShadow = true;
    packGroup.add(packMain);

    const packPocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.08),
      accentMat
    );
    packPocket.position.set(0, -0.06, -0.1);
    packGroup.add(packPocket);

    packGroup.position.set(0, 1.44, -0.21);
    bodyGroup.add(packGroup);
  }

  // --- NECK & HEAD ---
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(isFemale ? 0.068 : 0.075, isFemale ? 0.082 : 0.09, 0.16, 14),
    skinMat
  );
  neck.position.y = 1.75;
  bodyGroup.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.97, 0);

  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(isFemale ? 0.202 : 0.21, 24, 20),
    skinMat
  );
  cranium.scale.set(0.92, 1.08, 0.96);
  cranium.castShadow = true;
  headGroup.add(cranium);

  [-0.19, 0.19].forEach((ex) => {
    const ear = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 10, 10),
      skinMat
    );
    ear.scale.set(0.45, 1.05, 0.68);
    ear.position.set(ex, -0.01, -0.01);
    headGroup.add(ear);
  });

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(isFemale ? 0.022 : 0.026, isFemale ? 0.068 : 0.075, 10),
    skinMat
  );
  nose.rotation.x = Math.PI * 0.42;
  nose.position.set(0, -0.015, 0.205);
  headGroup.add(nose);

  const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshBasicMaterial({ color: cfg.eye });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });

  [-0.072, 0.072].forEach((ex) => {
    const eyeSocket = new THREE.Group();
    eyeSocket.position.set(ex, 0.028, 0.184);
    eyeSocket.rotation.y = ex < 0 ? -0.16 : 0.16;

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 12, 10),
      scleraMat
    );
    sclera.scale.set(1.18, 0.84, 0.35);
    eyeSocket.add(sclera);

    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.02, 14), irisMat);
    iris.position.z = 0.013;
    eyeSocket.add(iris);

    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.01, 12), pupilMat);
    pupil.position.z = 0.015;
    eyeSocket.add(pupil);

    const glint = new THREE.Mesh(
      new THREE.CircleGeometry(0.005, 8),
      scleraMat
    );
    glint.position.set(-0.005, 0.006, 0.017);
    eyeSocket.add(glint);

    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, isFemale ? 0.013 : 0.016, 0.02),
      hairMat
    );
    brow.position.set(0, 0.042, 0.008);
    brow.rotation.z = ex < 0 ? 0.08 : -0.08;
    eyeSocket.add(brow);

    headGroup.add(eyeSocket);
  });

  // Cheerful smile
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.034, 0.0065, 8, 14, Math.PI * 0.72),
    new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.5 })
  );
  smile.rotation.z = Math.PI * 1.14;
  smile.position.set(0, -0.07, 0.184);
  headGroup.add(smile);

  // Soft Rosy Cheeks for Girls (Sofia & Ester)
  if (isFemale) {
    [-0.105, 0.105].forEach((bx) => {
      const blush = new THREE.Mesh(
        new THREE.CircleGeometry(0.035, 14),
        new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          transparent: true,
          opacity: 0.36,
        })
      );
      blush.position.set(bx, -0.02, 0.198);
      headGroup.add(blush);
    });
  }

  // =========================================================================
  // SCULPTED AUTHENTIC HERO HEADGEAR, HAIR & PROPS MATCHING OFFICIAL PHOTOS
  // =========================================================================

  // 1. SOFIA: Long flowing wavy shoulder-length brunette hair + Neck DJ Headphones!
  if (cfg.avatarId === "sofia" && cfg.hatType !== "visor") {
    const crownHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.224, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.68),
      hairMat
    );
    crownHair.scale.set(0.96, 1.06, 1.02);
    crownHair.position.set(0, 0.02, -0.01);
    headGroup.add(crownHair);

    // Front parted soft wavy bangs
    [-0.07, 0.07].forEach((fx) => {
      const sweep = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.038, 0.15, 6, 12),
        hairMat
      );
      sweep.position.set(fx, 0.08, 0.17);
      sweep.rotation.z = fx < 0 ? 0.42 : -0.42;
      headGroup.add(sweep);
    });

    // Cascading shoulder-length wavy locks (left and right)
    [-0.16, 0.16].forEach((lx) => {
      const lockUpper = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.05, 0.22, 8, 12),
        hairMat
      );
      lockUpper.position.set(lx, -0.09, 0.07);
      lockUpper.rotation.z = lx < 0 ? -0.14 : 0.14;
      headGroup.add(lockUpper);

      const lockLower = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.044, 0.2, 8, 12),
        hairMat
      );
      lockLower.position.set(lx * 0.94, -0.25, 0.11);
      lockLower.rotation.x = -0.2;
      headGroup.add(lockLower);
    });

    // Back hair flowing down to shoulder blades
    const backMane = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.14, 0.32, 10, 14),
      hairMat
    );
    backMane.position.set(0, -0.17, -0.15);
    backMane.rotation.x = 0.18;
    headGroup.add(backMane);

    // DJ Studio Headphones resting around neck!
    const phoneMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.35,
      metalness: 0.6,
    });
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.2,
    });

    const neckBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.02, 10, 24, Math.PI * 1.4),
      bandMat
    );
    neckBand.rotation.x = Math.PI / 2 + 0.2;
    neckBand.rotation.z = Math.PI * 0.8;
    neckBand.position.set(0, 1.76, 0.02);
    bodyGroup.add(neckBand);

    [-0.14, 0.14].forEach((cx) => {
      const earCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.062, 0.062, 0.046, 16),
        phoneMat
      );
      earCup.rotation.z = cx < 0 ? 0.3 : -0.3;
      earCup.rotation.y = cx < 0 ? -0.4 : 0.4;
      earCup.position.set(cx, 1.74, 0.07);
      bodyGroup.add(earCup);
    });
  }

  // 2. DAVI: Modern High-Top Textured Fade + Glowing Holographic Cyber Visor Glasses!
  else if (cfg.avatarId === "davi" && cfg.hatType !== "visor") {
    // High-top box fade
    const highTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.205, 0.17, 16),
      hairMat
    );
    highTop.scale.set(0.94, 1, 0.92);
    highTop.position.set(0, 0.16, -0.01);
    headGroup.add(highTop);

    // Textured sponge curl bumps
    for (let i = 0; i < 7; i++) {
      const ang = (i / 7) * Math.PI * 2;
      const curlNub = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 8, 8),
        hairMat
      );
      curlNub.position.set(Math.sin(ang) * 0.09, 0.24, Math.cos(ang) * 0.08);
      headGroup.add(curlNub);
    }

    // Glowing LED Cyber Glasses / Visor
    const glassFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.2,
    });
    const glassLensMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.88,
      roughness: 0.1,
    });

    const cyberVisorGroup = new THREE.Group();
    cyberVisorGroup.position.set(0, 0.028, 0.186);

    const visorLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.05, 20, 1, true, -Math.PI * 0.36, Math.PI * 0.72),
      glassLensMat
    );
    cyberVisorGroup.add(visorLens);

    const visorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.31, 0.014, 0.038),
      glassFrameMat
    );
    visorFrame.position.set(0, 0.025, 0.03);
    cyberVisorGroup.add(visorFrame);

    headGroup.add(cyberVisorGroup);
  }

  // 3. ESTER: Voluminous Curly Afro Crown + Golden Headband + Golden Silk Scarf!
  else if (cfg.avatarId === "ester" && cfg.hatType !== "visor") {
    // Afro Base
    const afroBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.228, 20, 16),
      hairMat
    );
    afroBase.position.set(0, 0.05, -0.04);
    headGroup.add(afroBase);

    // Bouncy ringlet curl clusters
    const curlCoords = [
      [-0.17, 0.12, -0.06],
      [0.17, 0.12, -0.06],
      [0, 0.22, -0.06],
      [-0.13, 0.2, 0.04],
      [0.13, 0.2, 0.04],
      [-0.18, 0.01, 0.02],
      [0.18, 0.01, 0.02],
      [0, 0.15, -0.15],
      [-0.14, 0.08, -0.13],
      [0.14, 0.08, -0.13],
    ];
    curlCoords.forEach(([cx, cy, cz]) => {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.082, 10, 10),
        hairMat
      );
      puff.position.set(cx, cy, cz);
      headGroup.add(puff);
    });

    // Golden Headband / Diadem
    const headbandMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
      metalness: 0.9,
      roughness: 0.2,
    });
    const headband = new THREE.Mesh(
      new THREE.TorusGeometry(0.206, 0.016, 10, 32, Math.PI * 1.2),
      headbandMat
    );
    headband.rotation.x = Math.PI / 2 - 0.28;
    headband.rotation.z = Math.PI * 0.9;
    headband.position.set(0, 0.06, 0.02);
    headGroup.add(headband);

    const starGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.024, 0),
      headbandMat
    );
    starGem.position.set(0, 0.098, 0.196);
    headGroup.add(starGem);

    // Draped Silk Scarf around neck
    const scarfMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.35,
      roughness: 0.6,
    });
    const scarfRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.125, 0.036, 10, 24),
      scarfMat
    );
    scarfRing.rotation.x = Math.PI / 2;
    scarfRing.position.set(0, 1.76, 0.02);
    bodyGroup.add(scarfRing);

    [-0.04, 0.04].forEach((sx) => {
      const tail = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.028, 0.18, 6, 10),
        scarfMat
      );
      tail.position.set(sx, 1.62, 0.18);
      bodyGroup.add(tail);
    });
  }

  // 4. LUCAS: Tousled Brown Boy Hair + Green Scout Cap with Golden Mission Pin!
  else if (cfg.avatarId === "lucas" || cfg.hatType === "cap") {
    // Messy tufts under cap
    [-0.15, 0.15].forEach((tx) => {
      const sideTuft = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.038, 0.12, 6, 10),
        hairMat
      );
      sideTuft.position.set(tx, -0.04, 0.08);
      sideTuft.rotation.z = tx < 0 ? -0.3 : 0.3;
      headGroup.add(sideTuft);
    });

    const bangs = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.036, 0.14, 6, 10),
      hairMat
    );
    bangs.rotation.z = Math.PI / 2 - 0.2;
    bangs.position.set(0.02, 0.06, 0.185);
    headGroup.add(bangs);

    const capMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6,
    });
    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.228, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
      capMat
    );
    capDome.position.y = 0.03;
    headGroup.add(capDome);

    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.025, 16, 1, false, -Math.PI * 0.35, Math.PI * 0.7),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 })
    );
    visor.position.set(0, 0.09, 0.12);
    visor.rotation.x = 0.16;
    headGroup.add(visor);

    // Golden Mission Compass Pin on front of cap!
    const pin = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.03, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        metalness: 0.85,
      })
    );
    pin.position.set(0, 0.12, 0.195);
    pin.scale.set(1, 1, 0.4);
    headGroup.add(pin);
  }

  // Fallback headgear styles (for skins like Straw hat, Crown, Cowl Hood, Visor)
  if (cfg.hatType === "straw") {
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
  } else if (cfg.hatType === "visor") {
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
  }

  // --- FLOATING HALO ---
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

  // --- ARMS ---
  const buildArm = (offsetX: number) => {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(offsetX, 1.64, 0);

    const deltoid = new THREE.Mesh(
      new THREE.SphereGeometry(isFemale ? 0.086 : 0.095, 12, 10),
      jacketMat
    );
    shoulderPivot.add(deltoid);

    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(isFemale ? 0.068 : 0.076, 0.22, 8, 12),
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
      new THREE.CylinderGeometry(isFemale ? 0.06 : 0.068, isFemale ? 0.05 : 0.055, 0.25, 12),
      skinMat
    );
    forearm.position.y = -0.13;
    forearm.castShadow = true;
    elbowPivot.add(forearm);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(isFemale ? 0.054 : 0.062, 12, 10),
      skinMat
    );
    hand.scale.set(0.85, 1.15, 1.05);
    hand.position.y = -0.28;
    elbowPivot.add(hand);

    bodyGroup.add(shoulderPivot);
    return { shoulderPivot, elbowPivot };
  };

  const leftArm = buildArm(-shoulderOffset);
  const rightArm = buildArm(shoulderOffset);

  let weaponMesh: THREE.Group | undefined;
  let slashArc: THREE.Mesh | undefined;
  let shieldDome: THREE.Mesh | undefined;

  if (cfg.hasWeapon) {
    // 1. SOFIA'S HOLOGRAPHIC ART TABLET
    if (cfg.heldItemType === "tablet") {
      const tabletHolder = new THREE.Group();
      tabletHolder.position.set(0, -0.24, 0.12);
      tabletHolder.rotation.x = Math.PI * 0.32;
      tabletHolder.rotation.y = -0.15;

      const tabletGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.24, 0.018),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.95,
          transparent: true,
          opacity: 0.85,
          roughness: 0.1,
          metalness: 0.6,
        })
      );
      tabletHolder.add(tabletGlass);

      const tabletFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.26, 0.012),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
      );
      tabletHolder.add(tabletFrame);

      // Colorful art wave glowing on screen
      const artWave = new THREE.Mesh(
        new THREE.PlaneGeometry(0.24, 0.14),
        new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        })
      );
      artWave.position.z = 0.012;
      tabletHolder.add(artWave);

      // Stylus pen in hand
      const pen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.16, 8),
        new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.8 })
      );
      pen.rotation.x = Math.PI * 0.45;
      pen.position.set(0.12, 0.02, 0.04);
      tabletHolder.add(pen);

      weaponMesh = tabletHolder;
      rightArm.elbowPivot.add(weaponMesh);
    }

    // 2. ESTER'S GOLDEN CELESTIAL LANTERN OF FAITH
    else if (cfg.heldItemType === "lantern") {
      const lanternHolder = new THREE.Group();
      lanternHolder.position.set(0, -0.32, 0.08);

      const handleRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.045, 0.009, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 })
      );
      handleRing.position.y = 0.17;
      lanternHolder.add(handleRing);

      const lanternCap = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.065, 6),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 })
      );
      lanternCap.position.y = 0.11;
      lanternHolder.add(lanternCap);

      const lanternBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.085, 0.035, 6),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 })
      );
      lanternBase.position.y = -0.11;
      lanternHolder.add(lanternBase);

      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const strut = new THREE.Mesh(
          new THREE.CylinderGeometry(0.006, 0.006, 0.19, 6),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 })
        );
        strut.position.set(Math.sin(a) * 0.065, 0, Math.cos(a) * 0.065);
        lanternHolder.add(strut);
      }

      // Inner divine flame
      const divineFlame = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.042, 0),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xfde047,
          emissiveIntensity: 2.8,
          roughness: 0.1,
        })
      );
      divineFlame.scale.set(0.85, 1.4, 0.85);
      lanternHolder.add(divineFlame);

      weaponMesh = lanternHolder;
      rightArm.elbowPivot.add(weaponMesh);
    }

    // 3. DAVI'S CYBER TECH BLADE
    else if (cfg.heldItemType === "cyber_blade") {
      const cyberHolder = new THREE.Group();
      cyberHolder.position.set(0, -0.28, 0.08);
      cyberHolder.rotation.x = Math.PI * 0.42;

      const hilt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.032, 0.28, 10),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
      );
      cyberHolder.add(hilt);

      const guard = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.05, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5, metalness: 0.9 })
      );
      guard.position.y = 0.14;
      cyberHolder.add(guard);

      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.05, 0.03),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xfbbf24,
          emissiveIntensity: 1.8,
        })
      );
      blade.position.y = 0.68;
      cyberHolder.add(blade);

      weaponMesh = cyberHolder;
      rightArm.elbowPivot.add(weaponMesh);
    }

    // 4. LUCAS / DEFAULT: SCOUT EXPEDITION BLADE
    else {
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

      const wCol = cfg.weaponColor || 0x34d399;
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
    }

    // Attack slash arc
    const wCol = cfg.weaponColor || 0x34d399;
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
      skin: "#d89260",
      eye: "#3d2314",
      shirt: 0x15803d,
      innerShirt: 0x1f2937,
      secondary: 0x22c55e,
      pants: 0x1e293b,
      shoeColor: 0x451a03,
      hair: 0x2e1a0f,
      gender: "male",
      avatarId: "lucas",
      hatType: "cap",
      heldItemType: "sword",
      hasBackpack: true,
      hasWeapon: true,
      weaponColor: 0x34d399,
      labelColor: "#34d399",
    },
    sofia: {
      skin: "#fad0b1",
      eye: "#0284c7",
      shirt: 0x0284c7,
      innerShirt: 0xf8fafc,
      secondary: 0x38bdf8,
      pants: 0x1e1b4b,
      shoeColor: 0xf8fafc,
      hair: 0x422014,
      gender: "female",
      avatarId: "sofia",
      hatType: "headphones",
      heldItemType: "tablet",
      hasBackpack: true,
      hasWeapon: true,
      weaponColor: 0x22d3ee,
      labelColor: "#22d3ee",
    },
    davi: {
      skin: "#784421",
      eye: "#f59e0b",
      shirt: 0xf59e0b,
      innerShirt: 0x0f172a,
      secondary: 0xfbbf24,
      pants: 0x0f172a,
      shoeColor: 0x1e293b,
      hair: 0x111827,
      gender: "male",
      avatarId: "davi",
      hatType: "glasses",
      heldItemType: "cyber_blade",
      hasBackpack: true,
      hasWeapon: true,
      weaponColor: 0xfbbf24,
      labelColor: "#fbbf24",
    },
    ester: {
      skin: "#965b32",
      eye: "#a855f7",
      shirt: 0x6b21a8,
      innerShirt: 0xfde047,
      secondary: 0xfbbf24,
      pants: 0x2e1065,
      shoeColor: 0xfbbf24,
      hair: 0x1a1008,
      gender: "female",
      avatarId: "ester",
      hatType: "curls",
      heldItemType: "lantern",
      hasBackpack: false,
      hasWeapon: true,
      weaponColor: 0xfbbf24,
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
    metalness: 0.5,
  });
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.65,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.1,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x082f49,
    roughness: 0.08,
    metalness: 0.88,
    transparent: true,
    opacity: 0.82,
  });
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.05,
  });
  const alloyMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.88,
    roughness: 0.22,
  });
  const brakeDiscMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.92,
    roughness: 0.2,
  });
  const caliperMat = new THREE.MeshStandardMaterial({
    color: kind === "sports" ? 0xef4444 : 0xf59e0b,
    metalness: 0.6,
    roughness: 0.3,
  });
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
  const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const lightBeamMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Realistic Sculpted Wheel: Rubber Tire + 5-Spoke Alloy Rim + Brake Disc + Caliper
  const addRealisticWheel = (
    wx: number,
    wy: number,
    wz: number,
    r = 0.44,
    w = 0.32,
    isLeft = wx < 0
  ) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);

    // Rubber Tire with rounded shoulder
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, w, 22),
      tireMat
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wGroup.add(tire);

    // Tread rings for realistic grip
    const treadRib = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 1.01, r * 1.01, w * 0.45, 18),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 })
    );
    treadRib.rotation.z = Math.PI / 2;
    wGroup.add(treadRib);

    // Alloy Rim Outer Ring
    const rimOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.66, r * 0.66, w + 0.02, 16),
      alloyMat
    );
    rimOuter.rotation.z = Math.PI / 2;
    wGroup.add(rimOuter);

    // 5 Sculpted Geometric Alloy Spokes
    const rimGroup = new THREE.Group();
    rimGroup.position.x = isLeft ? -w * 0.45 : w * 0.45;
    for (let s = 0; s < 5; s++) {
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, r * 0.58, 0.06),
        alloyMat
      );
      spoke.rotation.x = (s * Math.PI * 2) / 5;
      rimGroup.add(spoke);
    }
    // Center Hubcap with Chrome Nut
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12),
      chromeMat
    );
    hub.rotation.z = Math.PI / 2;
    rimGroup.add(hub);
    wGroup.add(rimGroup);

    // Ventilated Brake Disc Rotor
    const brakeDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.52, r * 0.52, 0.03, 16),
      brakeDiscMat
    );
    brakeDisc.rotation.z = Math.PI / 2;
    brakeDisc.position.x = isLeft ? -0.04 : 0.04;
    wGroup.add(brakeDisc);

    // High Performance Caliper
    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.16, 0.12),
      caliperMat
    );
    caliper.position.set(isLeft ? -0.06 : 0.06, r * 0.32, 0);
    wGroup.add(caliper);

    vehicle.add(wGroup);
  };

  if (kind === "sports") {
    // --- SLEEK GT SPORTS COUPE ---
    // Aerodynamic Lower Chassis
    const lowerChassis = new THREE.Mesh(
      new THREE.BoxGeometry(2.18, 0.52, 4.6),
      paintMat
    );
    lowerChassis.position.y = 0.54;
    lowerChassis.castShadow = true;
    vehicle.add(lowerChassis);

    // Front Carbon Splitter
    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(2.24, 0.08, 0.72),
      carbonMat
    );
    splitter.position.set(0, 0.28, 2.24);
    vehicle.add(splitter);

    // Aerodynamic Sloped Hood
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.34, 1.55),
      paintMat
    );
    hood.position.set(0, 0.65, 1.48);
    hood.rotation.x = 0.14;
    vehicle.add(hood);

    // Hood Vent Scoop
    const hoodVent = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.06, 0.45),
      carbonMat
    );
    hoodVent.position.set(0, 0.79, 1.35);
    vehicle.add(hoodVent);

    // Radiator Honeycomb Grille
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.28, 0.12),
      trimMat
    );
    grille.position.set(0, 0.48, 2.34);
    vehicle.add(grille);

    // Cockpit Glass Canopy
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.78, 0.62, 2.15),
      glassMat
    );
    cabin.position.set(0, 1.1, -0.15);
    vehicle.add(cabin);

    // Roof Panel with A/B/C painted pillars
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.68, 0.08, 1.42),
      paintMat
    );
    roof.position.set(0, 1.42, -0.22);
    vehicle.add(roof);

    // Rear Windshield Sloped Glass
    const rearGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.64, 0.48, 0.85),
      glassMat
    );
    rearGlass.position.set(0, 1.05, -1.35);
    rearGlass.rotation.x = -0.42;
    vehicle.add(rearGlass);

    // Aerodynamic Side Skirts
    [-1.09, 1.09].forEach((sx) => {
      const skirt = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.12, 3.2),
        carbonMat
      );
      skirt.position.set(sx, 0.32, 0);
      vehicle.add(skirt);

      // Wing Mirrors
      const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.12, 0.14),
        paintMat
      );
      mirror.position.set(sx * 1.02, 1.05, 0.65);
      vehicle.add(mirror);
    });

    // Elevated GT Racing Wing Spoiler
    [-0.72, 0.72].forEach((sx) => {
      const strut = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.42, 0.14),
        carbonMat
      );
      strut.position.set(sx, 1.02, -2.12);
      strut.rotation.x = -0.2;
      vehicle.add(strut);
    });
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(2.18, 0.08, 0.42),
      carbonMat
    );
    wing.position.set(0, 1.25, -2.16);
    wing.rotation.x = 0.08;
    vehicle.add(wing);

    // Quad Chrome Exhaust Pipes & Rear Diffuser
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(1.88, 0.24, 0.3),
      carbonMat
    );
    diffuser.position.set(0, 0.38, -2.32);
    vehicle.add(diffuser);

    [-0.55, -0.4, 0.4, 0.55].forEach((ex) => {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.065, 0.22, 12),
        chromeMat
      );
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(ex, 0.38, -2.38);
      vehicle.add(pipe);
    });

    // Projector Headlights & Volumetric Light Cones
    [-0.76, 0.76].forEach((hx) => {
      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.14, 0.12),
        headlightMat
      );
      hl.position.set(hx, 0.64, 2.33);
      vehicle.add(hl);

      // Light Beam Cone projecting forward
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(0.85, 4.8, 16, 1, true),
        lightBeamMat
      );
      beam.rotation.x = -Math.PI / 2;
      beam.position.set(hx, 0.6, 4.7);
      vehicle.add(beam);
    });

    // Full-Width LED Rear Lightbar
    const tailStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.04, 0.12, 0.08),
      taillightMat
    );
    tailStrip.position.set(0, 0.74, -2.32);
    vehicle.add(tailStrip);

    addRealisticWheel(-1.12, 0.44, 1.42, 0.44, 0.32, true);
    addRealisticWheel(1.12, 0.44, 1.42, 0.44, 0.32, false);
    addRealisticWheel(-1.12, 0.46, -1.42, 0.46, 0.35, true);
    addRealisticWheel(1.12, 0.46, -1.42, 0.46, 0.35, false);
  } else if (kind === "moto") {
    // --- REALISTIC STREET & TRAIL MOTORCYCLE ---
    // Exposed Metallic Trellis Frame
    const trellis = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.52, 2.1),
      trimMat
    );
    trellis.position.y = 0.72;
    trellis.castShadow = true;
    vehicle.add(trellis);

    // Sculpted Teardrop Fuel Tank
    const tank = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 16, 12),
      paintMat
    );
    tank.scale.set(0.82, 0.74, 1.35);
    tank.position.set(0, 1.05, 0.38);
    vehicle.add(tank);

    // Fuel Cap Chrome
    const fuelCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
      chromeMat
    );
    fuelCap.position.set(0, 1.28, 0.32);
    vehicle.add(fuelCap);

    // Two-Tier Stitched Leather Saddle
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.12, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 })
    );
    seat.position.set(0, 0.96, -0.38);
    seat.rotation.x = -0.1;
    vehicle.add(seat);

    // Passenger Pillion Seat
    const pillion = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.1, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.85 })
    );
    pillion.position.set(0, 1.06, -0.85);
    vehicle.add(pillion);

    // V-Twin Engine Block with Ribbed Cooling Fins
    const engineBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.42, 0.62),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })
    );
    engineBlock.position.set(0, 0.54, 0.15);
    vehicle.add(engineBlock);

    // Curved Chrome Header Pipe & Upswept Sports Exhaust
    const headerPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.95, 10),
      chromeMat
    );
    headerPipe.position.set(0.24, 0.48, -0.2);
    headerPipe.rotation.x = 0.45;
    vehicle.add(headerPipe);

    const muffler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 0.82, 12),
      chromeMat
    );
    muffler.position.set(0.27, 0.68, -0.85);
    muffler.rotation.x = -0.38;
    vehicle.add(muffler);

    // Front Inverted Telescopic Suspension Forks with Chrome Stanchions
    [-0.14, 0.14].forEach((fx) => {
      const forkOuter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.65, 10),
        paintMat
      );
      forkOuter.position.set(fx, 0.98, 0.95);
      forkOuter.rotation.x = -0.36;
      vehicle.add(forkOuter);

      const forkChrome = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 0.62, 10),
        chromeMat
      );
      forkChrome.position.set(fx, 0.62, 1.12);
      forkChrome.rotation.x = -0.36;
      vehicle.add(forkChrome);
    });

    // Front Wheel Fender / Mudguard
    const fender = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.22, 16, 1, false, -Math.PI * 0.4, Math.PI * 0.8),
      paintMat
    );
    fender.rotation.z = Math.PI / 2;
    fender.position.set(0, 0.48, 1.18);
    vehicle.add(fender);

    // Handlebars with Grips and Mirrors
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.92, 10),
      chromeMat
    );
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.28, 0.68);
    vehicle.add(bar);

    [-0.42, 0.42].forEach((gx) => {
      // Rubber Grips
      const grip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.16, 10),
        tireMat
      );
      grip.rotation.z = Math.PI / 2;
      grip.position.set(gx, 1.28, 0.68);
      vehicle.add(grip);

      // Rearview Mirrors
      const mirrorStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6),
        chromeMat
      );
      mirrorStem.position.set(gx * 0.88, 1.38, 0.68);
      mirrorStem.rotation.z = gx < 0 ? 0.35 : -0.35;
      vehicle.add(mirrorStem);

      const mirrorHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.07, 0.02),
        trimMat
      );
      mirrorHead.position.set(gx * 0.98, 1.45, 0.68);
      vehicle.add(mirrorHead);
    });

    // Illuminated Digital Gauge Cluster
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.08, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    dash.position.set(0, 1.26, 0.8);
    dash.rotation.x = -0.55;
    vehicle.add(dash);

    // Circular Halo LED Headlight
    const headlightBezel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16),
      chromeMat
    );
    headlightBezel.rotation.x = Math.PI / 2;
    headlightBezel.position.set(0, 1.1, 1.24);
    vehicle.add(headlightBezel);

    const haloLight = new THREE.Mesh(
      new THREE.CircleGeometry(0.13, 16),
      headlightMat
    );
    haloLight.position.set(0, 1.1, 1.29);
    vehicle.add(haloLight);

    // Forward Projecting Light Cone
    const motoBeam = new THREE.Mesh(
      new THREE.ConeGeometry(0.75, 4.5, 14, 1, true),
      lightBeamMat
    );
    motoBeam.rotation.x = -Math.PI / 2;
    motoBeam.position.set(0, 1.05, 3.6);
    vehicle.add(motoBeam);

    // Rear Tail Light & License Plate
    const motoTail = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.08, 0.06),
      taillightMat
    );
    motoTail.position.set(0, 0.98, -1.22);
    vehicle.add(motoTail);

    addRealisticWheel(0, 0.44, 1.18, 0.44, 0.24, false);
    addRealisticWheel(0, 0.44, -1.02, 0.46, 0.28, false);
  } else {
    // --- HEAVY-DUTY EXPEDITION 4X4 SUV ---
    // Lifted Off-road Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.32, 0.88, 4.45),
      paintMat
    );
    body.position.y = 0.95;
    body.castShadow = true;
    vehicle.add(body);

    // Wide Mudguard Arch Flares
    [
      [-1.18, 0.78, 1.42],
      [1.18, 0.78, 1.42],
      [-1.18, 0.78, -1.42],
      [1.18, 0.78, -1.42],
    ].forEach(([ax, ay, az]) => {
      const flare = new THREE.Mesh(
        new THREE.CylinderGeometry(0.56, 0.56, 0.2, 16, 1, false, 0, Math.PI),
        trimMat
      );
      flare.rotation.z = Math.PI / 2;
      flare.position.set(ax, ay, az);
      vehicle.add(flare);
    });

    // Tinted Cabin Windows
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.08, 0.78, 2.5),
      glassMat
    );
    cabin.position.set(0, 1.68, -0.32);
    vehicle.add(cabin);

    // Roof Top Panel
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(2.12, 0.12, 2.55),
      paintMat
    );
    roof.position.set(0, 2.08, -0.32);
    vehicle.add(roof);

    // Expedition Roof Rack Basket Frame
    const rackFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.92, 0.18, 2.3),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 })
    );
    rackFrame.position.set(0, 2.22, -0.32);
    vehicle.add(rackFrame);

    // Roof Gear 1: Offroad Spare Tire
    const roofSpare = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44, 0.44, 0.26, 18),
      tireMat
    );
    roofSpare.rotation.x = Math.PI / 2;
    roofSpare.position.set(-0.35, 2.42, -0.2);
    vehicle.add(roofSpare);

    // Roof Gear 2: Yellow Expedition Jerrycans
    [-0.55, -0.3].forEach((jz) => {
      const jerrycan = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.35, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 })
      );
      jerrycan.position.set(0.52, 2.44, jz);
      vehicle.add(jerrycan);
    });

    // Roof Gear 3: Tactical Pelican Equipment Trunk
    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.28, 0.72),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
    );
    trunk.position.set(0.42, 2.42, 0.42);
    vehicle.add(trunk);

    // Roof 4-Pod High-Intensity LED Light Bar
    const lightBarMount = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.12, 0.15),
      trimMat
    );
    lightBarMount.position.set(0, 2.18, 0.86);
    vehicle.add(lightBarMount);

    [-0.6, -0.2, 0.2, 0.6].forEach((lx) => {
      const pod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12),
        chromeMat
      );
      pod.rotation.x = Math.PI / 2;
      pod.position.set(lx, 2.22, 0.92);
      vehicle.add(pod);

      const podLens = new THREE.Mesh(
        new THREE.CircleGeometry(0.075, 12),
        headlightMat
      );
      podLens.position.set(lx, 2.22, 0.965);
      vehicle.add(podLens);
    });

    // Heavy-Duty Front Bullbar & Winch Hook
    const bullBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.18, 0.48, 0.26),
      trimMat
    );
    bullBar.position.set(0, 0.8, 2.32);
    vehicle.add(bullBar);

    const winch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.44, 12),
      chromeMat
    );
    winch.rotation.z = Math.PI / 2;
    winch.position.set(0, 0.75, 2.45);
    vehicle.add(winch);

    // Side Rock Sliders / Step Rails
    [-1.22, 1.22].forEach((sx) => {
      const step = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 3.1, 8),
        chromeMat
      );
      step.rotation.x = Math.PI / 2;
      step.position.set(sx, 0.45, 0);
      vehicle.add(step);
    });

    // Dual Main Headlights & Light Cones
    [-0.82, 0.82].forEach((hx) => {
      const hl = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 14, 12),
        headlightMat
      );
      hl.position.set(hx, 1.02, 2.26);
      vehicle.add(hl);

      const suvBeam = new THREE.Mesh(
        new THREE.ConeGeometry(0.95, 5.2, 16, 1, true),
        lightBeamMat
      );
      suvBeam.rotation.x = -Math.PI / 2;
      suvBeam.position.set(hx, 0.98, 4.9);
      vehicle.add(suvBeam);
    });

    // Rear Taillights
    [-0.88, 0.88].forEach((tx) => {
      const tl = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.42, 0.08),
        taillightMat
      );
      tl.position.set(tx, 1.22, -2.26);
      vehicle.add(tl);
    });

    // Rear Mounted Spare Wheel
    const rearSpare = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.3, 18),
      tireMat
    );
    rearSpare.rotation.x = Math.PI / 2;
    rearSpare.position.set(0, 1.2, -2.35);
    vehicle.add(rearSpare);

    addRealisticWheel(-1.18, 0.54, 1.42, 0.52, 0.38, true);
    addRealisticWheel(1.18, 0.54, 1.42, 0.52, 0.38, false);
    addRealisticWheel(-1.18, 0.54, -1.42, 0.52, 0.38, true);
    addRealisticWheel(1.18, 0.54, -1.42, 0.52, 0.38, false);
  }

  const nitroFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 1.6, 14),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
    })
  );
  nitroFlame.rotation.x = -Math.PI / 2;
  nitroFlame.position.set(0, 0.55, kind === "moto" ? -1.65 : -2.8);
  nitroFlame.visible = false;
  nitroFlame.name = "nitroFlame";
  vehicle.add(nitroFlame);

  const tag = createNameplateSprite(`🚙 ${label} [V]`, "#38bdf8");
  tag.position.y = kind === "suv" ? 2.95 : 2.65;
  tag.name = "vehicleTag";
  vehicle.add(tag);

  return vehicle;
}

export function createTacticalVehicle3D(missionId: string): THREE.Group {
  if (missionId === "toquio") {
    return createGtaVehicle3D("sports", 0x06b6d4, "CYBER GT SHIBUYA");
  }
  if (missionId === "europa") {
    return createGtaVehicle3D("sports", 0x8b5cf6, "E-RUNNER GRAN TURISMO");
  }
  if (missionId === "sertao") {
    return createGtaVehicle3D("suv", 0xd97706, "PICAPE SERTANEJA 4X4");
  }
  if (missionId === "andes") {
    return createGtaVehicle3D("suv", 0x0284c7, "VAN EXPEDICIONÁRIA 4X4");
  }
  if (missionId === "himalaia") {
    return createGtaVehicle3D("suv", 0x38bdf8, "SNOW CRUISER 4X4");
  }
  if (missionId === "mocambique") {
    return createGtaVehicle3D("suv", 0x8b5cf6, "SUV SAFARI 4X4");
  }
  if (missionId === "janela1040") {
    return createGtaVehicle3D("suv", 0xf59e0b, "SUV DESERTO 4X4");
  }
  return createGtaVehicle3D("suv", 0x10b981, "SUV ANFÍBIO 4X4");
}
