import * as THREE from "three";

/**
 * Generates a 360-degree equirectangular panoramic Sky Dome texture
 * with realistic atmospheric gradient, sun/moon glow, soft clouds,
 * and distant mountain or city skyline silhouettes on the horizon.
 */
export function createSkyDomeTexture(missionId: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, 340);
  if (missionId === "amazonia") {
    grad.addColorStop(0, "#0b3b59");
    grad.addColorStop(0.45, "#19747e");
    grad.addColorStop(0.78, "#eab308");
    grad.addColorStop(1, "#fde68a");
  } else if (missionId === "janela1040") {
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.45, "#7c2d12");
    grad.addColorStop(0.78, "#ea580c");
    grad.addColorStop(1, "#fed7aa");
  } else if (missionId === "toquio") {
    grad.addColorStop(0, "#030712");
    grad.addColorStop(0.45, "#0f172a");
    grad.addColorStop(0.78, "#311042");
    grad.addColorStop(1, "#0891b2");
  } else if (missionId === "sertao") {
    // Sertão: Fiery sunset over semi-arid sertão
    grad.addColorStop(0, "#431407");
    grad.addColorStop(0.4, "#9a3412");
    grad.addColorStop(0.75, "#ea580c");
    grad.addColorStop(1, "#fef08a");
  } else if (missionId === "andes") {
    // Andes: Crisp highland azure twilight over cordillera peaks
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.45, "#1e3a8a");
    grad.addColorStop(0.78, "#38bdf8");
    grad.addColorStop(1, "#e0f2fe");
  } else if (missionId === "himalaia") {
    // Himalayas: Alpine crystalline sky with glacial radiance
    grad.addColorStop(0, "#082f49");
    grad.addColorStop(0.42, "#0369a1");
    grad.addColorStop(0.8, "#bae6fd");
    grad.addColorStop(1, "#f8fafc");
  } else if (missionId === "europa") {
    // Europa: Atmospheric European golden hour over urban spires
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.45, "#3b0764");
    grad.addColorStop(0.75, "#d97706");
    grad.addColorStop(1, "#fed7aa");
  } else {
    // Moçambique warm golden savanna sunset
    grad.addColorStop(0, "#1e1638");
    grad.addColorStop(0.42, "#7c2d12");
    grad.addColorStop(0.75, "#d97706");
    grad.addColorStop(1, "#fef08a");
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Stars for Tokyo / twilight upper sky
  if (missionId === "toquio" || missionId === "janela1040") {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 0; i < 140; i++) {
      const sx = (i * 173) % 1024;
      const sy = (i * 97) % 175;
      const sr = (i % 3) * 0.6 + 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Glowing Sun / Moon Disc near horizon
  const sunX = 512;
  const sunY = 235;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 110);
  if (missionId === "toquio") {
    sunGlow.addColorStop(0, "rgba(165, 243, 252, 0.95)");
    sunGlow.addColorStop(0.3, "rgba(34, 211, 238, 0.35)");
    sunGlow.addColorStop(1, "rgba(6, 182, 212, 0)");
  } else {
    sunGlow.addColorStop(0, "rgba(255, 251, 235, 1)");
    sunGlow.addColorStop(0.3, "rgba(251, 191, 36, 0.5)");
    sunGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
  }
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 110, 0, Math.PI * 2);
  ctx.fill();

  // Soft Volumetric-Style Clouds
  for (let i = 0; i < 26; i++) {
    const cx = ((i * 139) % 980) + 20;
    const cy = 115 + ((i * 53) % 115);
    const cw = 55 + (i % 4) * 26;
    const ch = 14 + (i % 3) * 7;
    ctx.fillStyle =
      missionId === "toquio"
        ? "rgba(56, 189, 248, 0.12)"
        : "rgba(255, 247, 237, 0.24)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant Horizon Silhouette (Skyscrapers for Tokyo, Rainforest Mountains / Dunes / Hills for others)
  const horizonY = 290;
  ctx.fillStyle =
    missionId === "toquio"
      ? "#070d1f"
      : missionId === "amazonia"
        ? "#063729"
        : missionId === "janela1040"
          ? "#451a03"
          : "#3b1d0a";

  if (missionId === "toquio") {
    ctx.fillRect(0, horizonY, 1024, 222);
    for (let x = 0; x < 1024; x += 22) {
      const h = 24 + ((x * 37) % 68);
      ctx.fillStyle = "#080f24";
      ctx.fillRect(x, horizonY - h, 19, h + 10);
      // Tiny distant lit windows
      ctx.fillStyle = x % 44 === 0 ? "#22d3ee" : "#f472b6";
      for (let wy = horizonY - h + 6; wy < horizonY - 4; wy += 10) {
        ctx.fillRect(x + 4, wy, 3, 4);
        ctx.fillRect(x + 11, wy, 3, 4);
      }
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.lineTo(0, horizonY);
    for (let x = 0; x <= 1024; x += 32) {
      const hill =
        Math.sin(x * 0.014) * 22 + Math.cos(x * 0.031) * 12;
      ctx.lineTo(x, horizonY - 16 - hill);
    }
    ctx.lineTo(1024, 512);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createTerrainTexture(
  missionId: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  if (missionId === "amazonia") {
    ctx.fillStyle = "#1c5e35";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle =
        i % 3 === 0 ? "#22703f" : i % 3 === 1 ? "#166534" : "#14532d";
      ctx.fillRect(
        (i * 73) % 512,
        (i * 137) % 512,
        3 + (i % 9),
        3 + (i % 7)
      );
    }
  } else if (missionId === "janela1040") {
    ctx.fillStyle = "#c4935a";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#d2a46c" : "#ad7c45";
      ctx.fillRect(
        (i * 89) % 512,
        (i * 131) % 512,
        10 + (i % 14),
        4 + (i % 8)
      );
    }
  } else if (missionId === "toquio") {
    // Realistic urban park / dark slate grass courtyard
    ctx.fillStyle = "#16302b";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#1b3d36" : "#112622";
      ctx.fillRect((i * 83) % 512, (i * 149) % 512, 6, 6);
    }
  } else if (missionId === "sertao") {
    // Sertão & Caatinga: Red clay earth, cracked terracotta soil & dry scrub
    ctx.fillStyle = "#9a3412";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1100; i++) {
      ctx.fillStyle =
        i % 4 === 0 ? "#b45309" : i % 4 === 1 ? "#7c2d12" : i % 4 === 2 ? "#c2410c" : "#854d0e";
      ctx.fillRect((i * 71) % 512, (i * 139) % 512, 4 + (i % 8), 3 + (i % 6));
    }
  } else if (missionId === "andes") {
    // Andes Mountains: High altitude weathered slate, stony crags & tussock grass
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle =
        i % 3 === 0 ? "#475569" : i % 3 === 1 ? "#1e293b" : "#3f6212";
      ctx.fillRect((i * 89) % 512, (i * 127) % 512, 6 + (i % 7), 5 + (i % 5));
    }
  } else if (missionId === "himalaia") {
    // Himalayas: Snow-covered crags, crystalline ice & alpine gravel
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle =
        i % 3 === 0 ? "#f8fafc" : i % 3 === 1 ? "#94a3b8" : "#e2e8f0";
      ctx.fillRect((i * 73) % 512, (i * 109) % 512, 5 + (i % 9), 4 + (i % 7));
    }
  } else if (missionId === "europa") {
    // European Urban Plaza: Elegant cobblestone paving & dark slate
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle =
        i % 3 === 0 ? "#334155" : i % 3 === 1 ? "#0f172a" : "#475569";
      ctx.fillRect((i * 67) % 512, (i * 131) % 512, 7 + (i % 5), 4 + (i % 4));
    }
  } else {
    // Mozambique savanna grass + warm red earth
    ctx.fillStyle = "#9c6d30";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle =
        i % 3 === 0 ? "#ad7d3b" : i % 3 === 1 ? "#5c8d24" : "#855923";
      ctx.fillRect(
        (i * 79) % 512,
        (i * 113) % 512,
        5 + (i % 10),
        5 + (i % 8)
      );
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(28, 28);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Realistic GTA Asphalt Street / Paved Road Texture with lane markings,
 * asphalt grain, shoulder gutters, and curb borders.
 */
export function createRoadTexture(missionId: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  if (missionId === "amazonia") {
    // Realistic compacted laterite road + timber boardwalk shoulders
    ctx.fillStyle = "#5c3b20";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#7a5130";
    ctx.fillRect(22, 0, 212, 256);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#6b4426" : "#875b37";
      ctx.fillRect(24 + ((i * 53) % 204), (i * 97) % 256, 5, 5);
    }
    // Wooden curb logs
    ctx.fillStyle = "#452711";
    ctx.fillRect(0, 0, 20, 256);
    ctx.fillRect(236, 0, 20, 256);
    // Center track guide
    ctx.fillStyle = "rgba(253, 224, 71, 0.45)";
    for (let y = 14; y < 256; y += 64) {
      ctx.fillRect(125, y, 6, 30);
    }
  } else {
    // Realistic GTA Dark Asphalt with granular noise, white shoulder lines & double/dashed yellow center!
    ctx.fillStyle = "#1f242d";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#262c36" : "#181c24";
      ctx.fillRect((i * 67) % 256, (i * 109) % 256, 3, 3);
    }

    // Concrete curb gutters
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, 0, 16, 256);
    ctx.fillRect(240, 0, 16, 256);

    // Crisp outer lane lines
    ctx.fillStyle = missionId === "toquio" ? "#38bdf8" : "#e2e8f0";
    ctx.fillRect(22, 0, 4, 256);
    ctx.fillRect(230, 0, 4, 256);

    // Center GTA yellow dashed divider
    ctx.fillStyle = "#facc15";
    for (let y = 10; y < 256; y += 64) {
      ctx.fillRect(122, y, 4, 38);
      ctx.fillRect(130, y, 4, 38);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 22);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Raised Concrete / Cobblestone Sidewalk Tile Texture for GTA City Blocks
 */
export function createSidewalkTexture(missionId: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const base =
    missionId === "toquio"
      ? "#334155"
      : missionId === "janela1040"
        ? "#d6b486"
        : missionId === "amazonia"
          ? "#7c5333"
          : "#b88b58";
  const grout =
    missionId === "toquio"
      ? "#1e293b"
      : missionId === "janela1040"
        ? "#b48d5c"
        : "#5c3b20";

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = grout;
  ctx.lineWidth = 3;
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Zebra Crosswalk Intersection Texture
 */
export function createCrosswalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1f242d";
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = "#e2e8f0";
  for (let i = 36; i < 220; i += 28) {
    // North & South zebra bars
    ctx.fillRect(i, 8, 16, 36);
    ctx.fillRect(i, 212, 16, 36);
    // West & East zebra bars
    ctx.fillRect(8, i, 36, 16);
    ctx.fillRect(212, i, 36, 16);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Realistic Architectural Building Facade Texture with Ground Storefront,
 * Window Frames, Glass Reflections, Cornices, and Masonry/Concrete Panels.
 */
export function createBuildingFacadeTexture(
  baseColor: string,
  windowLitColor: string,
  modernGlass = false
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 512);

  // Horizontal architectural floor ledges / cornices
  const cols = modernGlass ? 4 : 3;
  const rows = modernGlass ? 7 : 4;
  const padX = 18;
  const padY = 24;
  const upperH = 380;
  const cellW = (256 - padX * 2) / cols;
  const cellH = (upperH - padY) / rows;

  for (let r = 0; r < rows; r++) {
    const fy = padY + r * cellH;
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, fy - 3, 256, 4);

    for (let c = 0; c < cols; c++) {
      const wx = padX + c * cellW + 5;
      const wy = fy + 6;
      const ww = cellW - 10;
      const wh = cellH - 14;

      // Window recessed frame
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);

      const lit = (r * 5 + c * 3) % 3 !== 0;
      if (lit) {
        const wGrad = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
        wGrad.addColorStop(0, windowLitColor);
        wGrad.addColorStop(1, modernGlass ? "#1e3a8a" : "#78350f");
        ctx.fillStyle = wGrad;
      } else {
        ctx.fillStyle = "#172033";
      }
      ctx.fillRect(wx, wy, ww, wh);

      // Mullion crossbar
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(wx + ww / 2 - 1, wy, 2, wh);
    }
  }

  // Ground-Floor Commercial Storefront Plinth
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.fillRect(0, 396, 256, 116);

  // Storefront Display Windows + Double Glass Entrance Door
  ctx.fillStyle = windowLitColor;
  ctx.globalAlpha = 0.75;
  ctx.fillRect(18, 422, 62, 66);
  ctx.fillRect(176, 422, 62, 66);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#090d16";
  ctx.fillRect(96, 420, 64, 92);
  ctx.strokeStyle = windowLitColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(96, 420, 64, 92);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Storefront / Billboard Sign Texture ("CAFÉ", "CLÍNICA", "MERCADO", etc.)
 */
export function createStoreSignTexture(
  title: string,
  bgColor: string,
  accentColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 64);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 248, 56);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, 128, 33);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
