"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { AvatarId, HeroEmoteType, SkinId } from "@/types/game";
import { SKIN_OPTIONS } from "@/data/avatarsAndGifts";
import {
  animateHumanRig,
  ArticulatedRig,
  createPlayableChampion3D,
} from "@/lib/character3d";
import { useGame } from "@/context/GameContext";

interface HeroPreview3DProps {
  avatarId: AvatarId;
  skinId: SkinId;
  agentName?: string;
  heightClass?: string;
  showEmoteBar?: boolean;
  compact?: boolean;
  borderless?: boolean;
}

const EMOTE_BUTTONS: {
  id: HeroEmoteType;
  label: string;
  emoji: string;
}[] = [
  { id: "slash_spin", label: "Giro", emoji: "⚔️" },
  { id: "victory", label: "Vitória", emoji: "🙌" },
  { id: "dance", label: "Passinho", emoji: "🕺" },
  { id: "kneel_pray", label: "Fé", emoji: "🛡️" },
];

export function HeroPreview3D({
  avatarId,
  skinId,
  agentName = "Agente Ide",
  heightClass = "h-80 sm:h-96",
  showEmoteBar = true,
  compact = false,
  borderless = false,
}: HeroPreview3DProps) {
  const { playSfx } = useGame();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeEmote, setActiveEmote] = useState<HeroEmoteType>("idle");

  const emoteRef = useRef<HeroEmoteType>("idle");
  const emoteTimerRef = useRef<number>(0);
  const emoteElapsedRef = useRef<number>(0);

  const heroHolderRef = useRef<THREE.Group | null>(null);
  const rigRef = useRef<ArticulatedRig | null>(null);
  const burstRingRef = useRef<THREE.Mesh | null>(null);
  const burstAgeRef = useRef<number>(99);
  const accentRingMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const triggerSpin360Ref = useRef<() => void>(() => {});

  const skinMeta =
    SKIN_OPTIONS.find((s) => s.id === skinId) || SKIN_OPTIONS[0];

  const triggerEmote = (emote: HeroEmoteType) => {
    playSfx(emote === "slash_spin" ? "slash" : emote === "kneel_pray" ? "prayer" : "success");
    if (emoteRef.current === emote) {
      emoteRef.current = "idle";
      setActiveEmote("idle");
      return;
    }
    emoteRef.current = emote;
    emoteTimerRef.current = 3.6;
    emoteElapsedRef.current = 0;
    setActiveEmote(emote);
  };

  // Mount WebGL Stage Once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      compact ? 43 : 41,
      width / height,
      0.1,
      50
    );
    camera.position.set(0, compact ? 1.18 : 1.20, compact ? 5.25 : 5.05);
    camera.lookAt(0, 1.02, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = true;
    const canvasDom = renderer.domElement;
    canvasDom.style.position = "absolute";
    canvasDom.style.inset = "0";
    canvasDom.style.width = "100%";
    canvasDom.style.height = "100%";
    canvasDom.style.display = "block";
    canvasDom.style.touchAction = "none";
    container.innerHTML = "";
    container.appendChild(canvasDom);

    // AAA 3-Point Studio Lighting
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 1.35);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.5);
    keyLight.position.set(3.5, 6, 4.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const cyanRim = new THREE.PointLight(0x22d3ee, 3.2, 12);
    cyanRim.position.set(-3.2, 2.6, -2.5);
    scene.add(cyanRim);

    const goldRim = new THREE.PointLight(0xfbbf24, 2.8, 12);
    goldRim.position.set(3.2, 1.4, -2.2);
    scene.add(goldRim);

    // Front-Fill Face Light (Ensures expressive eyes and warm face without dark cap shadows)
    const faceLight = new THREE.DirectionalLight(0xfff8ee, 1.9);
    faceLight.position.set(0, 1.9, 3.8);
    scene.add(faceLight);

    // AAA Holographic Pedestal Base
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const podiumBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.34, 0.16, 40),
      new THREE.MeshStandardMaterial({
        color: 0x0b1325,
        metalness: 0.78,
        roughness: 0.24,
      })
    );
    podiumBase.position.y = -0.08;
    podiumBase.receiveShadow = true;
    stageGroup.add(podiumBase);

    const accentRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    accentRingMatRef.current = accentRingMat;

    const outerRuneRing = new THREE.Mesh(
      new THREE.RingGeometry(1.06, 1.16, 48),
      accentRingMat
    );
    outerRuneRing.rotation.x = -Math.PI / 2;
    outerRuneRing.position.y = 0.01;
    stageGroup.add(outerRuneRing);

    const holoGyro = new THREE.Mesh(
      new THREE.TorusGeometry(1.26, 0.014, 10, 64),
      new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.55,
      })
    );
    holoGyro.rotation.x = Math.PI / 2;
    holoGyro.position.y = 0.04;
    stageGroup.add(holoGyro);

    // Skin Swap Shockwave Burst Ring
    const burstRing = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.58, 36),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      })
    );
    burstRing.rotation.x = -Math.PI / 2;
    burstRing.position.y = 0.06;
    stageGroup.add(burstRing);
    burstRingRef.current = burstRing;

    // Floating Rising Particle Embers (deterministic golden-ratio spiral)
    const particleCount = 42;
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds: number[] = [];
    const frac = (v: number) => v - Math.floor(v);
    for (let i = 0; i < particleCount; i++) {
      const ang = frac(i * 0.61803398875) * Math.PI * 2;
      const rad = 0.45 + frac(i * 0.381966 + 0.17) * 1.15;
      pPositions[i * 3] = Math.cos(ang) * rad;
      pPositions[i * 3 + 1] = frac(i * 0.754877 + 0.31) * 2.8;
      pPositions[i * 3 + 2] = Math.sin(ang) * rad;
      pSpeeds.push(0.35 + frac(i * 0.56984 + 0.11) * 0.55);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Hero Turntable Holder
    const heroHolder = new THREE.Group();
    stageGroup.add(heroHolder);
    heroHolderRef.current = heroHolder;

    // Immediately instantiate and add the initial champion rig!
    const initialRig = createPlayableChampion3D(
      avatarId,
      agentName,
      skinId,
      false
    );
    heroHolder.add(initialRig.root);
    rigRef.current = initialRig;

    // Drag to Rotate 360° Interaction & Showcase Spin
    let isDragging = false;
    let prevX = 0;
    let rotVelocity = 0;
    let manualHoldUntil = 0;
    let spinRemaining = 0;

    triggerSpin360Ref.current = () => {
      spinRemaining += Math.PI * 2;
      manualHoldUntil = performance.now() + 3200;
    };

    const dom = renderer.domElement;
    dom.style.cursor = "grab";

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      dom.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      rotVelocity = dx * 0.014;
      heroHolder.rotation.y += rotVelocity;
      manualHoldUntil = performance.now() + 2600;
    };
    const onPointerUp = () => {
      isDragging = false;
      dom.style.cursor = "grab";
    };

    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Dynamic & Responsive 3D Stage Sizing & Framing
    const syncSize = () => {
      if (!container || !renderer || !camera) return;
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width || container.clientWidth || 0);
      const h = Math.round(rect.height || container.clientHeight || 0);

      // Avoid sizing if container is hidden or layout hasn't resolved
      if (w < 20 || h < 20) return;

      const aspect = w / h;
      camera.aspect = aspect;

      // Perfectly balanced framing:
      // Ensure the entire character (from pedestal -0.1 to hat/head ~2.35)
      // has generous headroom so the face, eyes, hair, and expressions are 100% visible!
      if (compact) {
        camera.fov = 43;
        camera.position.set(0, 1.18, 5.25);
        camera.lookAt(0, 1.02, 0);
      } else {
        camera.fov = 41;
        camera.position.set(0, 1.20, 5.05);
        camera.lookAt(0, 1.02, 0);
      }

      camera.updateProjectionMatrix();

      const pr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pr);
      // updateStyle: false prevents inline width/height from locking the DOM element
      renderer.setSize(w, h, false);
      canvasDom.style.width = "100%";
      canvasDom.style.height = "100%";
    };

    // 1. Initial sync
    syncSize();

    // 2. Next animation frame (after CSS layout recalculates)
    const rafId = requestAnimationFrame(syncSize);

    // 3. Multi-stage timeout (to catch mobile browser orientation animations)
    const t1 = setTimeout(syncSize, 60);
    const t2 = setTimeout(syncSize, 180);
    const t3 = setTimeout(syncSize, 360);
    const t4 = setTimeout(syncSize, 700);

    // 4. ResizeObserver on the container itself
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        syncSize();
      });
      ro.observe(container);
    }

    // 5. Window & Viewport Listeners
    window.addEventListener("resize", syncSize);
    window.addEventListener("orientationchange", syncSize);
    window.visualViewport?.addEventListener("resize", syncSize);

    let lastTime = 0;
    let idleClock = 0;
    let animId = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      if (lastTime === 0) lastTime = now;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      idleClock += dt;

      if (!isDragging) {
        if (spinRemaining > 0) {
          const step = Math.min(spinRemaining, dt * 3.8);
          heroHolder.rotation.y += step;
          spinRemaining -= step;
        } else if (Math.abs(rotVelocity) > 0.0005) {
          heroHolder.rotation.y += rotVelocity;
          rotVelocity *= 0.92;
        } else if (now > manualHoldUntil && emoteRef.current === "idle") {
          // Front-facing idle with subtle organic breathing sway (keeps character face visible!)
          const breathingSway = Math.sin(idleClock * 1.5) * 0.08;
          let cur = heroHolder.rotation.y % (Math.PI * 2);
          if (cur > Math.PI) cur -= Math.PI * 2;
          if (cur < -Math.PI) cur += Math.PI * 2;
          heroHolder.rotation.y = cur + (breathingSway - cur) * Math.min(1, dt * 2.8);
        }
      }

      holoGyro.rotation.z += dt * 0.7;
      holoGyro.position.y = 0.06 + Math.sin(idleClock * 2.4) * 0.03;

      // Update Rising Embers
      const posAttr = pGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let py = posAttr.getY(i) + pSpeeds[i] * dt;
        if (py > 2.9) py = 0.05;
        posAttr.setY(i, py);
      }
      posAttr.needsUpdate = true;

      // Update Burst Shockwave
      if (burstAgeRef.current < 0.65 && burstRingRef.current) {
        burstAgeRef.current += dt;
        const p = burstAgeRef.current / 0.65;
        burstRingRef.current.scale.setScalar(1 + p * 2.6);
        (
          burstRingRef.current.material as THREE.MeshBasicMaterial
        ).opacity = Math.max(0, (1 - p) * 0.9);
      }

      // Emote Countdown
      if (emoteRef.current !== "idle") {
        emoteElapsedRef.current += dt;
        emoteTimerRef.current -= dt;
        if (emoteTimerRef.current <= 0) {
          emoteRef.current = "idle";
          setActiveEmote("idle");
        }
      }

      // Animate Articulated 3D Hero
      if (rigRef.current) {
        if (rigRef.current.slashArc && emoteRef.current !== "slash_spin") {
          (
            rigRef.current.slashArc.material as THREE.MeshBasicMaterial
          ).opacity = 0;
        }
        if (rigRef.current.shieldDome && emoteRef.current !== "kneel_pray") {
          (
            rigRef.current.shieldDome.material as THREE.MeshBasicMaterial
          ).opacity = 0;
        }
        animateHumanRig(
          rigRef.current,
          0,
          false,
          false,
          0,
          idleClock,
          emoteRef.current,
          emoteElapsedRef.current
        );
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      ro?.disconnect();
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("orientationchange", syncSize);
      window.visualViewport?.removeEventListener("resize", syncSize);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      heroHolderRef.current = null;
      rigRef.current = null;
      renderer.dispose();
    };
  }, [compact]);

  // Swap 3D Hero Rig Reactively When Champion or Skin Changes!
  useEffect(() => {
    const holder = heroHolderRef.current;
    if (!holder) return;

    holder.clear();
    const newRig = createPlayableChampion3D(
      avatarId,
      agentName,
      skinId,
      false
    );
    holder.add(newRig.root);
    rigRef.current = newRig;

    // Trigger Golden/Neon Equip Burst VFX
    burstAgeRef.current = 0;
    const hexColor = new THREE.Color(skinMeta.accentHex);
    if (accentRingMatRef.current) {
      accentRingMatRef.current.color.copy(hexColor);
    }
    if (burstRingRef.current) {
      (
        burstRingRef.current.material as THREE.MeshBasicMaterial
      ).color.copy(hexColor);
    }
  }, [avatarId, skinId, agentName, skinMeta.accentHex]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${
        borderless
          ? "rounded-2xl border-0 bg-transparent"
          : "rounded-3xl border border-amber-400/45 bg-gradient-to-b from-slate-900/90 via-[#071124] to-slate-950 shadow-[0_0_45px_rgba(6,182,212,0.18)]"
      } ${heightClass}`}
    >
      {/* Top Rarity & Drag Hint Pill */}
      <div className="absolute top-1.5 right-2 left-2 z-10 flex items-center justify-between gap-2 pointer-events-none">
        {!borderless && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-slate-950/80 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase backdrop-blur pointer-events-auto"
            style={{ color: skinMeta.accentHex }}
          >
            {skinMeta.badgeEmoji} {skinMeta.rarity}
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            playSfx("click");
            triggerSpin360Ref.current?.();
          }}
          className={`pointer-events-auto cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-cyan-500/50 bg-slate-950/90 hover:bg-cyan-950/60 active:scale-95 px-2.5 py-1 font-mono text-[8.5px] font-black text-cyan-200 shadow-md transition ${borderless ? "ml-auto" : ""}`}
          title="Girar modelo 360°"
        >
          <RotateCw className="h-2.5 w-2.5 text-cyan-400 animate-spin-slow" />
          <span>GIRE 360°</span>
        </button>
      </div>

      {/* Live WebGL 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden" />

      {/* Bottom Interactive AAA Emote Animation Bar */}
      {showEmoteBar && (
        <div className="absolute right-1 bottom-1.5 left-1 z-10 flex items-center justify-center gap-1">
          {EMOTE_BUTTONS.map((em) => {
            const isPlaying = activeEmote === em.id;
            return (
              <motion.button
                key={em.id}
                type="button"
                whileHover={{ scale: 1.07, y: -2 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => triggerEmote(em.id)}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-black tracking-wide uppercase backdrop-blur-md transition ${
                  isPlaying
                    ? "border-amber-300 bg-amber-400/25 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.45)]"
                    : "border-slate-700/85 bg-slate-950/85 text-slate-200 hover:border-cyan-400/70 hover:text-white"
                }`}
              >
                <span>{em.emoji}</span>
                <span>{em.label}</span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
