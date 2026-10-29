"use client";

import React, { useEffect, useRef } from "react";

interface ConfettiCanvasProps {
  active: boolean;
  durationMs?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
}

const COLORS = [
  "#10B981",
  "#34D399",
  "#06B6D4",
  "#38BDF8",
  "#F59E0B",
  "#FBBF24",
  "#A855F7",
  "#F43F5E",
];

export function ConfettiCanvas({
  active,
  durationMs = 4200,
}: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: 110 }, () => ({
      x: canvas.width * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.28,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 13 - 4,
      size: 6 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.25,
    }));

    let animId = 0;
    const start = performance.now();

    const loop = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed < durationMs) {
        const fade =
          elapsed > durationMs - 900 ? (durationMs - elapsed) / 900 : 1;
        ctx.globalAlpha = Math.max(0, fade);

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.28; // gravity
          p.vx *= 0.99;
          p.rotation += p.vRot;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        });

        animId = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [active, durationMs]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
    />
  );
}
