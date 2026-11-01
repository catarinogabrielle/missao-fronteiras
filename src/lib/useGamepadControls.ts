"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface GamepadControlsOptions {
  enabled?: boolean;
  onAttack?: () => void;
  onDash?: () => void;
  onToggleVehicle?: () => void;
  onInteract?: () => void;
  onSkillQ?: () => void;
  onSkillE?: () => void;
  onSkillR?: () => void;
  onToggleCamera?: () => void;
  onOpenLanguage?: () => void;
  onMove?: (x: number, y: number) => void;
  onCameraRotate?: (deltaX: number) => void;
}

export interface GamepadState {
  connected: boolean;
  id: string;
  stickVector: { x: number; y: number };
  isMoving: boolean;
}

export function useGamepadControls(options: GamepadControlsOptions = {}) {
  const {
    enabled = true,
    onAttack,
    onDash,
    onToggleVehicle,
    onInteract,
    onSkillQ,
    onSkillE,
    onSkillR,
    onToggleCamera,
    onOpenLanguage,
    onMove,
    onCameraRotate,
  } = options;

  const [connectedGamepad, setConnectedGamepad] = useState<string | null>(null);
  const [stickState, setStickState] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const prevButtonsRef = useRef<boolean[]>([]);
  const lastAttackTimeRef = useRef<number>(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Listen to physical connection and disconnection events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleConnected = (e: GamepadEvent) => {
      const gp = e.gamepad;
      if (gp) {
        setConnectedGamepad(gp.id);
      }
    };

    const handleDisconnected = () => {
      setConnectedGamepad(null);
    };

    window.addEventListener("gamepadconnected", handleConnected);
    window.addEventListener("gamepaddisconnected", handleDisconnected);

    // Initial check in case gamepad is already plugged in
    const existing = navigator.getGamepads?.();
    if (existing) {
      for (let i = 0; i < existing.length; i++) {
        if (existing[i]) {
          setConnectedGamepad(existing[i]!.id);
          break;
        }
      }
    }

    return () => {
      window.removeEventListener("gamepadconnected", handleConnected);
      window.removeEventListener("gamepaddisconnected", handleDisconnected);
    };
  }, []);

  // Continuous Gamepad Polling Loop
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let animId: number;
    const DEADZONE = 0.16;

    const poll = (time: number) => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let activeGamepad: Gamepad | null = null;

      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          activeGamepad = gamepads[i];
          break;
        }
      }

      if (activeGamepad) {
        if (!connectedGamepad) {
          setConnectedGamepad(activeGamepad.id);
        }

        const axes = activeGamepad.axes || [];
        const buttons = activeGamepad.buttons || [];

        // 1. LEFT ANALOG STICK (Movement: X=axes[0], Y=axes[1])
        let rawX = axes[0] ?? 0;
        let rawY = axes[1] ?? 0;

        // D-Pad Fallback for Movement
        if (buttons[12]?.pressed) rawY = -1; // Up
        if (buttons[13]?.pressed) rawY = 1; // Down
        if (buttons[14]?.pressed) rawX = -1; // Left
        if (buttons[15]?.pressed) rawX = 1; // Right

        const magnitude = Math.sqrt(rawX * rawX + rawY * rawY);
        let moveX = 0;
        let moveY = 0;

        if (magnitude > DEADZONE) {
          moveX = rawX;
          moveY = rawY;
          optionsRef.current.onMove?.(moveX, moveY);
        } else {
          optionsRef.current.onMove?.(0, 0);
        }

        // 2. RIGHT ANALOG STICK (Camera Orbit Rotation: X=axes[2])
        const camX = axes[2] ?? 0;
        if (Math.abs(camX) > DEADZONE) {
          optionsRef.current.onCameraRotate?.(camX * 0.05);
        }

        // 3. ACTION BUTTONS WITH EDGE DETECTION
        const isPressed = (index: number) => Boolean(buttons[index]?.pressed);
        const wasPressed = (index: number) =>
          Boolean(prevButtonsRef.current[index]);
        const justPressed = (index: number) =>
          isPressed(index) && !wasPressed(index);

        // Button 0 (A / Cross): Attack / Combo
        if (isPressed(0)) {
          // Allow holding for continuous combo attacks with 240ms interval
          if (time - lastAttackTimeRef.current > 240) {
            lastAttackTimeRef.current = time;
            optionsRef.current.onAttack?.();
          }
        }

        // Button 1 (B / Circle): Dash / Dodge
        if (justPressed(1)) {
          optionsRef.current.onDash?.();
        }

        // Button 2 (X / Square): Enter / Exit Vehicle
        if (justPressed(2)) {
          optionsRef.current.onToggleVehicle?.();
        }

        // Button 3 (Y / Triangle): Interact / Talk / Tower
        if (justPressed(3)) {
          optionsRef.current.onInteract?.();
        }

        // Button 4 (LB / L1): Toggle Camera
        if (justPressed(4)) {
          optionsRef.current.onToggleCamera?.();
        }

        // Button 6 (LT / L2 Trigger): Special Skill Q
        if (justPressed(6) || (buttons[6]?.value ?? 0) > 0.6) {
          if (!wasPressed(6)) {
            optionsRef.current.onSkillQ?.();
          }
        }

        // Button 7 (RT / R2 Trigger): Special Skill E
        if (justPressed(7) || (buttons[7]?.value ?? 0) > 0.6) {
          if (!wasPressed(7)) {
            optionsRef.current.onSkillE?.();
          }
        }

        // Button 5 (RB / R1): Ultimate Skill R
        if (justPressed(5)) {
          optionsRef.current.onSkillR?.();
        }

        // Button 8 (Select / Share / Back): Open Language Modal
        if (justPressed(8)) {
          optionsRef.current.onOpenLanguage?.();
        }

        // Store button states for edge detection next frame
        prevButtonsRef.current = buttons.map((b) => b.pressed);
        setStickState({ x: moveX, y: moveY });
      }

      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [enabled, connectedGamepad]);

  return {
    connectedGamepad,
    isGamepadConnected: Boolean(connectedGamepad),
    stickState,
  };
}
