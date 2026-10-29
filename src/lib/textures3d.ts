import * as THREE from "three";

export function createStylizedFaceTexture(
  skinColor: string,
  eyeColor = "#0ea5e9",
  isEnemy = false
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = skinColor;
  ctx.fillRect(0, 0, 256, 256);

  if (isEnemy) {
    // Glowing fierce shadow eyes
    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.moveTo(68, 108);
    ctx.lineTo(112, 122);
    ctx.lineTo(74, 132);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(188, 108);
    ctx.lineTo(144, 122);
    ctx.lineTo(182, 132);
    ctx.closePath();
    ctx.fill();
  } else {
    // Expressive Brawl-Stars / Genshin Chibi Eyes!
    const drawEye = (cx: number, cy: number) => {
      // White sclera
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 18, 21, 0, 0, Math.PI * 2);
      ctx.fill();

      // Colored iris
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, 13, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark pupil
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, 7.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright anime catchlights
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 5, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, cy + 6, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Upper eyelash / brow line
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 18, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();

      // Eyebrow
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 26);
      ctx.quadraticCurveTo(cx, cy - 32, cx + 15, cy - 25);
      ctx.stroke();
    };

    drawEye(88, 118);
    drawEye(168, 118);

    // Warm cheek blush
    ctx.fillStyle = "rgba(251, 113, 133, 0.28)";
    ctx.beginPath();
    ctx.ellipse(62, 146, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(194, 146, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Confident heroic smile
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(128, 146, 20, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
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
    ctx.fillStyle = "#14532d";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle =
        i % 3 === 0 ? "#166534" : i % 3 === 1 ? "#15803d" : "#064e3b";
      ctx.fillRect(
        Math.random() * 512,
        Math.random() * 512,
        4 + Math.random() * 10,
        4 + Math.random() * 10
      );
    }
  } else if (missionId === "janela1040") {
    ctx.fillStyle = "#b4824c";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#c4945e" : "#9a6b38";
      ctx.fillRect(
        Math.random() * 512,
        Math.random() * 512,
        12 + Math.random() * 18,
        6 + Math.random() * 10
      );
    }
  } else if (missionId === "toquio") {
    // Sleek cyber urban plaza tiles
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, x);
      ctx.lineTo(512, x);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(6, 182, 212, 0.12)";
    ctx.fillRect(128, 128, 64, 64);
    ctx.fillRect(320, 320, 64, 64);
  } else {
    // Mozambique golden savanna grass + warm earth
    ctx.fillStyle = "#92662a";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 850; i++) {
      ctx.fillStyle =
        i % 3 === 0 ? "#a17432" : i % 3 === 1 ? "#65a30d" : "#785220";
      ctx.fillRect(
        Math.random() * 512,
        Math.random() * 512,
        6 + Math.random() * 12,
        6 + Math.random() * 12
      );
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 22);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createRoadTexture(missionId: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  if (missionId === "amazonia") {
    // Wooden boardwalk / packed earth road
    ctx.fillStyle = "#5c3a21";
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      ctx.fillStyle = y % 64 === 0 ? "#6e472b" : "#52331c";
      ctx.fillRect(8, y + 2, 240, 26);
    }
  } else if (missionId === "toquio" || missionId === "janela1040") {
    // GTA City Asphalt Street with sidewalks & center dashed road stripes!
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 256, 256);
    // Sidewalks
    ctx.fillStyle = "#475569";
    ctx.fillRect(0, 0, 26, 256);
    ctx.fillRect(230, 0, 26, 256);
    // Neon or Gold edge line
    ctx.fillStyle = missionId === "toquio" ? "#06b6d4" : "#f59e0b";
    ctx.fillRect(26, 0, 4, 256);
    ctx.fillRect(226, 0, 4, 256);
    // Center dashed lane line
    ctx.fillStyle = "#facc15";
    for (let y = 12; y < 256; y += 64) {
      ctx.fillRect(124, y, 8, 36);
    }
  } else {
    // Savanna red-ochre road with stone borders
    ctx.fillStyle = "#7c4722";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#a16236";
    ctx.fillRect(20, 0, 216, 256);
    ctx.fillStyle = "#fde68a";
    for (let y = 16; y < 256; y += 64) {
      ctx.fillRect(125, y, 6, 28);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 18);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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

  const cols = modernGlass ? 4 : 3;
  const rows = modernGlass ? 8 : 4;
  const padX = 22;
  const padY = 26;
  const cellW = (256 - padX * 2) / cols;
  const cellH = (440 - padY) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = (r * 7 + c * 3) % 3 !== 0;
      ctx.fillStyle = lit ? windowLitColor : "#0f172a";
      ctx.fillRect(
        padX + c * cellW + 6,
        padY + r * cellH + 6,
        cellW - 12,
        cellH - 14
      );
    }
  }

  // Ground entrance door
  ctx.fillStyle = "#090d16";
  ctx.fillRect(96, 448, 64, 64);
  ctx.strokeStyle = windowLitColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(96, 448, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
