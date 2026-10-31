"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Mission } from "@/types/game";

interface WorldGlobe3DProps {
  missions: Mission[];
  selectedMissionId: string;
  completedIds: string[];
  unlockedIds: string[];
  onSelectMission: (mission: Mission) => void;
}

// Convert mission id / order into realistic spherical coordinates (lat, lon in degrees)
function getMissionLatLon(mission: Mission): { lat: number; lon: number } {
  switch (mission.id) {
    case "amazonia":
      return { lat: -5, lon: -60 };
    case "janela1040":
      return { lat: 31, lon: -6 };
    case "toquio":
      return { lat: 36, lon: 139 };
    case "mocambique":
      return { lat: -15, lon: 39 };
    default:
      return {
        lat: 15 - ((mission.order * 23) % 50),
        lon: -90 + ((mission.order * 67) % 260),
      };
  }
}

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

const ACCENT_HEX: Record<Mission["accentColor"], number> = {
  emerald: 0x10b981,
  amber: 0xf59e0b,
  cyan: 0x06b6d4,
  violet: 0xa855f7,
  rose: 0xf43f5e,
  sky: 0x0ea5e9,
  orange: 0xf97316,
};

export function WorldGlobe3D({
  missions,
  selectedMissionId,
  completedIds,
  unlockedIds,
  onSelectMission,
}: WorldGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetRotYRef = useRef<number>(0.6);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const autoRotateHoldRef = useRef(0);

  // Rotate globe smoothly toward the selected mission whenever selection changes
  useEffect(() => {
    const active = missions.find((m) => m.id === selectedMissionId);
    if (!active) return;
    const { lon } = getMissionLatLon(active);
    // Align marker longitude toward camera (+Z)
    const theta = (lon + 180) * (Math.PI / 180);
    targetRotYRef.current = theta - Math.PI / 2;
    autoRotateHoldRef.current = performance.now() + 4000;
  }, [missions, selectedMissionId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.55, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0x88c9ff, 1.15);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff3d1, 2.2);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x0ac8b9, 2.8, 18);
    rimLight.position.set(-5, -2, 3);
    scene.add(rimLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2.2, 16);
    goldLight.position.set(4, -4, 3);
    scene.add(goldLight);

    // Root Globe Pivot
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const RADIUS = 1.92;

    // Ocean Core Sphere
    const oceanGeo = new THREE.SphereGeometry(RADIUS, 48, 48);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x061b33,
      roughness: 0.42,
      metalness: 0.35,
      emissive: 0x041226,
      emissiveIntensity: 0.7,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    globeGroup.add(oceanMesh);

    // Tactical Holographic Wireframe Grid Overlay
    const wireGeo = new THREE.SphereGeometry(RADIUS + 0.012, 24, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0ac8b9,
      wireframe: true,
      transparent: true,
      opacity: 0.13,
    });
    globeGroup.add(new THREE.Mesh(wireGeo, wireMat));

    // Stylized Low-Poly 3D Continents Patches
    const continents: { lat: number; lon: number; sx: number; sy: number; color: number }[] = [
      // South America (Brazil / Amazonia)
      { lat: -12, lon: -58, sx: 0.55, sy: 0.85, color: 0x0d6e52 },
      { lat: -26, lon: -62, sx: 0.32, sy: 0.52, color: 0x0f766e },
      // North America
      { lat: 40, lon: -100, sx: 0.82, sy: 0.65, color: 0x115e59 },
      { lat: 20, lon: -98, sx: 0.36, sy: 0.35, color: 0x0d9488 },
      // Africa (North Africa + Mozambique)
      { lat: 22, lon: 14, sx: 0.78, sy: 0.56, color: 0x92601a },
      { lat: -8, lon: 28, sx: 0.52, sy: 0.72, color: 0x15803d },
      // Europe
      { lat: 50, lon: 15, sx: 0.52, sy: 0.38, color: 0x0e7490 },
      // Middle East & Asia
      { lat: 28, lon: 48, sx: 0.48, sy: 0.4, color: 0xb45309 },
      { lat: 42, lon: 92, sx: 1.05, sy: 0.68, color: 0x1e40af },
      { lat: 22, lon: 105, sx: 0.55, sy: 0.45, color: 0x0f766e },
      // Japan Archipelago
      { lat: 36, lon: 139, sx: 0.2, sy: 0.34, color: 0x06b6d4 },
      // Australia
      { lat: -25, lon: 134, sx: 0.48, sy: 0.36, color: 0x7c2d12 },
    ];

    const landGeo = new THREE.CylinderGeometry(0.45, 0.52, 0.08, 7);
    continents.forEach((c) => {
      const landMat = new THREE.MeshStandardMaterial({
        color: c.color,
        roughness: 0.55,
        metalness: 0.15,
      });
      const patch = new THREE.Mesh(landGeo, landMat);
      const pos = latLonToVec3(c.lat, c.lon, RADIUS + 0.01);
      patch.position.copy(pos);
      patch.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        pos.clone().normalize()
      );
      patch.scale.set(c.sx, 1, c.sy);
      globeGroup.add(patch);
    });

    // 10/40 Window Glowing Equator/Tropic Hologram Band
    const bandGeo = new THREE.CylinderGeometry(
      RADIUS * 0.96,
      RADIUS * 1.01,
      0.55,
      48,
      1,
      true
    );
    const bandMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.11,
      side: THREE.DoubleSide,
    });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.position.y = 0.72;
    globeGroup.add(bandMesh);

    // Hextech Orbital Gyroscope Rings
    const outerRingGeo = new THREE.TorusGeometry(RADIUS + 0.48, 0.018, 12, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xc89b3c,
      transparent: true,
      opacity: 0.65,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI * 0.38;
    outerRing.rotation.y = Math.PI * 0.12;
    scene.add(outerRing);

    const innerRingGeo = new THREE.TorusGeometry(RADIUS + 0.3, 0.014, 12, 96);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x0ac8b9,
      transparent: true,
      opacity: 0.55,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI * 0.32;
    scene.add(innerRing);

    // Starfield Particles
    const starCount = 240;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 20;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      starPositions[i * 3 + 2] = -2 - Math.random() * 10;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );
    const starMat = new THREE.PointsMaterial({
      color: 0xa5f3fc,
      size: 0.055,
      transparent: true,
      opacity: 0.7,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Mission 3D Crystal Obelisk Beacons
    const clickableMeshes: { mesh: THREE.Object3D; mission: Mission }[] = [];
    const pulseRings: THREE.Mesh[] = [];

    missions.forEach((m) => {
      const { lat, lon } = getMissionLatLon(m);
      const unlocked = unlockedIds.includes(m.id);
      const completed = completedIds.includes(m.id);
      const isSelected = m.id === selectedMissionId;

      const colorHex = unlocked
        ? completed
          ? 0x34d399
          : ACCENT_HEX[m.accentColor] || 0x06b6d4
        : 0x475569;

      const anchor = new THREE.Group();
      const surfacePos = latLonToVec3(lat, lon, RADIUS + 0.04);
      anchor.position.copy(surfacePos);
      anchor.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        surfacePos.clone().normalize()
      );

      // Base rune ring
      const baseRingGeo = new THREE.RingGeometry(0.08, 0.16, 24);
      const baseRingMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xfbbf24 : colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
      baseRing.rotation.x = -Math.PI / 2;
      anchor.add(baseRing);
      if (unlocked) pulseRings.push(baseRing);

      // Floating 3D Crystal Diamond Obelisk
      const crystalGeo = new THREE.OctahedronGeometry(
        isSelected ? 0.16 : 0.12,
        0
      );
      const crystalMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xfde047 : colorHex,
        emissive: isSelected ? 0xf59e0b : colorHex,
        emissiveIntensity: isSelected ? 1.2 : 0.7,
        roughness: 0.15,
        metalness: 0.6,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 0.24;
      crystal.scale.set(0.85, 1.55, 0.85);
      anchor.add(crystal);

      // Invisible bigger hit sphere for easy clicking/tapping
      const hitGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({
        visible: false,
      });
      const hitSphere = new THREE.Mesh(hitGeo, hitMat);
      hitSphere.position.y = 0.2;
      anchor.add(hitSphere);

      globeGroup.add(anchor);
      clickableMeshes.push({ mesh: hitSphere, mission: m });
    });

    // Set initial rotation immediately near target
    globeGroup.rotation.y = targetRotYRef.current;

    // Pointer Interaction (Drag to spin + Click beacon to select mission)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = e.clientX;
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current) {
        const dx = e.clientX - prevMouseXRef.current;
        prevMouseXRef.current = e.clientX;
        targetRotYRef.current += dx * 0.008;
        globeGroup.rotation.y += dx * 0.008;
        autoRotateHoldRef.current = performance.now() + 3500;
      } else {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(
          clickableMeshes.map((c) => c.mesh)
        );
        renderer.domElement.style.cursor =
          hits.length > 0 ? "pointer" : "grab";
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < 7) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(
          clickableMeshes.map((c) => c.mesh)
        );
        if (hits.length > 0) {
          const found = clickableMeshes.find((c) => c.mesh === hits[0].object);
          if (found) {
            onSelectMission(found.mission);
          }
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    resizeObserver.observe(container);

    let animId = 0;
    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);

      if (!isDraggingRef.current) {
        if (now > autoRotateHoldRef.current) {
          targetRotYRef.current += 0.0022;
        }
        // Smooth shortest-angle lerp
        const diff = targetRotYRef.current - globeGroup.rotation.y;
        globeGroup.rotation.y += diff * 0.07;
      }

      outerRing.rotation.z += 0.0025;
      innerRing.rotation.z -= 0.0035;

      const pulse = 1 + Math.sin(now * 0.005) * 0.22;
      pulseRings.forEach((r) => {
        r.scale.set(pulse, pulse, 1);
      });

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [missions, selectedMissionId, completedIds, unlockedIds, onSelectMission]);

  return (
    <div className="relative h-full min-h-[300px] w-full select-none">
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-cyan-500/30 bg-slate-950/80 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-cyan-300 uppercase backdrop-blur">
        🌐 Arraste o Globo 3D • Clique nos Cristais de Missão
      </div>
    </div>
  );
}
