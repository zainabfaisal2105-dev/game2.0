/**
 * Liminal Space Escape - Main Application
 * First-person 3D psychological survival game across 5 progressive stages.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PlayerState,
  StageConfig,
  Entity,
  WorldItem,
  SurvivorNote,
  GameSettings,
  ActivePuzzle,
} from './types';
import { STAGES } from './data/stages';
import { textureLibrary } from './engine/textureGenerator';
import { raycasterEngine } from './engine/raycaster';
import { soundEngine } from './audio/soundEngine';
import {
  getNextNavWaypoint,
  moveEntityWithSliding,
  checkLineOfSight,
} from './engine/pathfinding';
import { HUD } from './components/HUD';
import { PuzzleModal } from './components/PuzzleModal';
import { NoteModal } from './components/NoteModal';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { MobileControls } from './components/MobileControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- GAME STATE ---
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const stage = STAGES[currentStageIdx];

  const [player, setPlayer] = useState<PlayerState>(() => ({
    x: STAGES[0].playerSpawn.x,
    y: STAGES[0].playerSpawn.y,
    angle: STAGES[0].playerSpawn.angle,
    pitch: 0,
    health: 100,
    stamina: 100,
    dread: 0,
    flashlightBattery: 100,
    isFlashlightOn: true,
    isSprinting: false,
    isCrouching: false,
    isMoving: false,
    inventory: {
      batteries: 0,
      fuses: 0,
      keycards: 0,
      valveWheels: 0,
      notesRead: [],
    },
  }));

  // Entities & Items in active level
  const [entities, setEntities] = useState<Entity[]>([]);
  const [worldItems, setWorldItems] = useState<WorldItem[]>([]);
  const [activePuzzle, setActivePuzzle] = useState<ActivePuzzle>(stage.puzzleConfig.initialState);
  const [doorUnlocked, setDoorUnlocked] = useState<boolean>(false);

  // Active Modals
  const [isPuzzleOpen, setIsPuzzleOpen] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<SurvivorNote | null>(null);
  const [isPauseOpen, setIsPauseOpen] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [caughtByEntity, setCaughtByEntity] = useState<Entity | null>(null);
  const [isStageWon, setIsStageWon] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    vhsOverlay: true,
    soundEnabled: true,
    masterVolume: 0.7,
    mouseSensitivity: 1.0,
    renderResolution: 0.75,
    showMinimap: true,
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [interactionTarget, setInteractionTarget] = useState<{
    type: 'door' | 'terminal' | 'item' | 'none';
    doorUnlocked?: boolean;
    item?: WorldItem;
  }>({ type: 'none' });

  // Input keys map & mouse look states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mouseDeltaX = useRef<number>(0);
  const isPointerLocked = useRef<boolean>(false);
  const [isMouseLocked, setIsMouseLocked] = useState<boolean>(false);
  const isMouseDownRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);
  const mobileMove = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Live simulation refs for continuous 60fps physics & interaction
  const playerRef = useRef<PlayerState>(player);
  playerRef.current = player;
  const entitiesRef = useRef<Entity[]>(entities);
  const worldItemsRef = useRef<WorldItem[]>(worldItems);
  const stageRef = useRef<StageConfig>(stage);
  stageRef.current = stage;
  const doorUnlockedRef = useRef<boolean>(doorUnlocked);
  doorUnlockedRef.current = doorUnlocked;
  const interactionTargetRef = useRef<{
    type: 'door' | 'terminal' | 'item' | 'none';
    doorUnlocked?: boolean;
    item?: WorldItem;
  }>({ type: 'none' });
  const triggerInteractionRef = useRef<() => void>(() => {});
  const lastTimeRef = useRef<number>(performance.now());
  const lastHudSyncRef = useRef<number>(0);

  const modalsOpenRef = useRef<boolean>(false);
  modalsOpenRef.current = isPuzzleOpen || !!activeNote || isPauseOpen || isGameOver || isStageWon;

  // Release pointer lock automatically if any modal opens
  useEffect(() => {
    if (isPuzzleOpen || activeNote || isPauseOpen || isGameOver || isStageWon) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    }
  }, [isPuzzleOpen, activeNote, isPauseOpen, isGameOver, isStageWon]);

  // Init texture library
  useEffect(() => {
    textureLibrary.init();
  }, []);

  // Level Setup Helper
  const loadStage = useCallback((stageIndex: number) => {
    const targetStage = STAGES[stageIndex];
    setCurrentStageIdx(stageIndex);

    const initialPlayer: PlayerState = {
      x: targetStage.playerSpawn.x,
      y: targetStage.playerSpawn.y,
      angle: targetStage.playerSpawn.angle,
      pitch: 0,
      health: 100,
      stamina: 100,
      dread: 0,
      flashlightBattery: 100,
      isFlashlightOn: true,
      isSprinting: false,
      isCrouching: false,
      isMoving: false,
      inventory: {
        batteries: 0,
        fuses: 0,
        keycards: 0,
        valveWheels: 0,
        notesRead: [],
      },
    };
    playerRef.current = initialPlayer;
    setPlayer(initialPlayer);

    const initEntities: Entity[] = targetStage.entities.map((e) => ({
      ...e,
      state: 'patrol',
      alertness: 0,
      stunTimer: 0,
      animationTick: 0,
      searchTimer: 0,
      lastSeenX: undefined,
      lastSeenY: undefined,
    }));
    entitiesRef.current = initEntities;
    setEntities(initEntities);

    const initItems: WorldItem[] = targetStage.items.map((it) => ({
      ...it,
      collected: false,
    }));
    worldItemsRef.current = initItems;
    setWorldItems(initItems);

    stageRef.current = targetStage;
    doorUnlockedRef.current = false;
    interactionTargetRef.current = { type: 'none' };
    setInteractionTarget({ type: 'none' });

    setActivePuzzle(JSON.parse(JSON.stringify(targetStage.puzzleConfig.initialState)));
    setDoorUnlocked(false);
    setIsGameOver(false);
    setCaughtByEntity(null);
    setIsStageWon(false);
    setIsPuzzleOpen(false);
    setActiveNote(null);
    setElapsedTime(0);

    soundEngine.setAmbientHumIntensity(targetStage.lighting.ambientIntensity);
  }, []);

  // Load initial stage on mount
  useEffect(() => {
    loadStage(0);
  }, [loadStage]);

  // Stage timer
  useEffect(() => {
    if (isGameOver || isStageWon || isPauseOpen || isPuzzleOpen || activeNote) return;
    const timer = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, isStageWon, isPauseOpen, isPuzzleOpen, activeNote]);

  // Sound Engine Mute & Volume bindings
  useEffect(() => {
    soundEngine.setMuted(soundMuted);
  }, [soundMuted]);

  useEffect(() => {
    soundEngine.setVolume(settings.masterVolume);
  }, [settings.masterVolume]);

  // Collect item helper
  const collectItem = useCallback((it: WorldItem) => {
    soundEngine.playItemPickup();
    it.collected = true;
    worldItemsRef.current = worldItemsRef.current.map((item) =>
      item.id === it.id ? { ...item, collected: true } : item
    );
    setWorldItems([...worldItemsRef.current]);

    const p = playerRef.current;
    if (it.type === 'battery') {
      p.inventory.batteries += 1;
    } else if (it.type === 'fuse') {
      p.inventory.fuses += 1;
    } else if (it.type === 'valve_wheel') {
      p.inventory.valveWheels += 1;
    } else if (it.type === 'note' && it.metadata?.noteId) {
      const foundNote = stageRef.current.notes.find((n) => n.id === it.metadata?.noteId);
      if (foundNote) {
        setActiveNote(foundNote);
        p.inventory.notesRead.push(foundNote.id);
      }
    }

    setPlayer({ ...p });
    interactionTargetRef.current = { type: 'none' };
    setInteractionTarget({ type: 'none' });
  }, []);

  // Proximity & raycast interaction trigger
  const triggerInteraction = useCallback(() => {
    // 1. Check raycast target first
    const target = interactionTargetRef.current;
    if (target && target.type !== 'none') {
      if (target.type === 'item' && target.item) {
        collectItem(target.item);
        return;
      }
      if (target.type === 'terminal') {
        soundEngine.playPuzzleClick();
        setIsPuzzleOpen(true);
        return;
      }
      if (target.type === 'door') {
        if (doorUnlockedRef.current) {
          soundEngine.playVictoryChime();
          setIsStageWon(true);
        } else {
          soundEngine.playEntityAlert(10);
        }
        return;
      }
    }
  }, [collectItem]);

  triggerInteractionRef.current = triggerInteraction;

  // Reload Battery helper
  const reloadBattery = useCallback(() => {
    const p = playerRef.current;
    if (p.inventory.batteries > 0 && p.flashlightBattery < 95) {
      soundEngine.playFlashlightClick(true);
      p.flashlightBattery = 100;
      p.inventory.batteries -= 1;
      setPlayer({ ...p });
    }
  }, []);

  // Flashlight toggle helper
  const toggleFlashlight = useCallback(() => {
    const p = playerRef.current;
    p.isFlashlightOn = !p.isFlashlightOn;
    soundEngine.playFlashlightClick(p.isFlashlightOn);
    setPlayer({ ...p });
  }, []);

  // Keyboard Event Listeners with Arrow Keys & Escape handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Audio unlock on first key
      soundEngine.init();

      const key = e.key.toLowerCase();
      const code = e.code ? e.code.toLowerCase() : '';

      // Prevent arrow keys and space from scrolling the container/iframe
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space'].includes(key) ||
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space'].includes(code)
      ) {
        e.preventDefault();
      }

      if (key === 'escape') {
        // Priority 1: If mouse cursor was locked, unlock it and DO NOT open pause menu!
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
          return;
        }

        // Priority 2: Close active modals
        if (isPuzzleOpen) {
          setIsPuzzleOpen(false);
          return;
        }
        if (activeNote) {
          setActiveNote(null);
          return;
        }

        // Priority 3: Toggle pause menu
        setIsPauseOpen((prev) => !prev);
        return;
      }

      // If in modal, disable game movement
      if (modalsOpenRef.current) return;

      keysPressed.current[key] = true;
      if (code) keysPressed.current[code] = true;

      // Flashlight toggle
      if (key === 'f' || code === 'keyf') {
        toggleFlashlight();
      }

      // Reload battery
      if (key === 'r' || code === 'keyr') {
        reloadBattery();
      }

      // Interact action with button E, Space, or Enter
      if (
        key === 'e' ||
        code === 'keye' ||
        key === ' ' ||
        code === 'space' ||
        key === 'enter' ||
        code === 'enter'
      ) {
        triggerInteractionRef.current();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code ? e.code.toLowerCase() : '';
      keysPressed.current[key] = false;
      if (code) keysPressed.current[code] = false;
    };

    const handleBlur = () => {
      keysPressed.current = {};
      isMouseDownRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isPuzzleOpen, activeNote, toggleFlashlight, reloadBattery]);

  // Pointer Lock & Free Drag Mouse Look Listeners
  useEffect(() => {
    const canvas = canvasRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        mouseDeltaX.current += e.movementX;
      } else if (isMouseDownRef.current) {
        // Drag to look around when free mouse is active
        const movement =
          e.movementX !== undefined && e.movementX !== 0
            ? e.movementX
            : e.clientX - lastMouseXRef.current;
        lastMouseXRef.current = e.clientX;
        mouseDeltaX.current += movement;
      }
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      isPointerLocked.current = locked;
      setIsMouseLocked(locked);
    };

    const handleGlobalMouseUp = () => {
      isMouseDownRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const requestCanvasPointerLock = () => {
    soundEngine.init();
    if (canvasRef.current && document.pointerLockElement !== canvasRef.current) {
      canvasRef.current.requestPointerLock?.();
    }
  };

  const releaseCanvasPointerLock = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  };

  const toggleMouseLock = () => {
    soundEngine.init();
    if (document.pointerLockElement) {
      releaseCanvasPointerLock();
    } else {
      requestCanvasPointerLock();
    }
  };

  // Robust Circle-to-AABB collision check with wall sliding
  const checkCollision = (newX: number, newY: number, curX: number, curY: number) => {
    const radius = 0.22;
    const curStage = stageRef.current;
    const isUnlocked = doorUnlockedRef.current;

    const collidesAt = (px: number, py: number) => {
      const minX = Math.floor(px - radius);
      const maxX = Math.floor(px + radius);
      const minY = Math.floor(py - radius);
      const maxY = Math.floor(py + radius);

      for (let my = minY; my <= maxY; my++) {
        for (let mx = minX; mx <= maxX; mx++) {
          if (mx < 0 || mx >= curStage.mapWidth || my < 0 || my >= curStage.mapHeight) return true;
          const cell = curStage.map[my][mx];
          const isWall = cell === 1 || (cell === 2 && !isUnlocked);
          if (isWall) {
            // Closest point on tile to sphere
            const closestX = Math.max(mx, Math.min(mx + 1, px));
            const closestY = Math.max(my, Math.min(my + 1, py));
            const distX = px - closestX;
            const distY = py - closestY;
            if (distX * distX + distY * distY < radius * radius) {
              return true;
            }
          }
        }
      }
      return false;
    };

    let resolvedX = curX;
    let resolvedY = curY;

    // Slide along X
    if (!collidesAt(newX, curY)) {
      resolvedX = newX;
    }
    // Slide along Y
    if (!collidesAt(resolvedX, newY)) {
      resolvedY = newY;
    }

    return { x: resolvedX, y: resolvedY };
  };

  // ----------------------------------------------------
  // MAIN GAME LOOP (Continuous 60fps requestAnimationFrame)
  // ----------------------------------------------------
  useEffect(() => {
    let animId: number;
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      let deltaMs = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Guard against background tab time jumps or NaN
      if (deltaMs > 100 || deltaMs <= 0 || isNaN(deltaMs)) {
        deltaMs = 16.6;
      }
      const dt = deltaMs / 1000;

      const curStage = stageRef.current;
      const p = playerRef.current;

      // Only tick game logic if unpaused and alive
      if (!isGameOver && !isStageWon && !isPauseOpen && !isPuzzleOpen && !activeNote) {
        // --- 1. PLAYER INPUT & MOVEMENT ---
        let nextAngle = p.angle;

        // Mouse rotation
        if (mouseDeltaX.current !== 0) {
          nextAngle += mouseDeltaX.current * 0.0025 * settings.mouseSensitivity;
          mouseDeltaX.current = 0;
        }

        // Key checks
        const isUp =
          keysPressed.current['arrowup'] ||
          keysPressed.current['up'] ||
          keysPressed.current['w'] ||
          keysPressed.current['keyw'] ||
          keysPressed.current['z'] ||
          keysPressed.current['keyz'] ||
          keysPressed.current['numpad8'];
        const isDown =
          keysPressed.current['arrowdown'] ||
          keysPressed.current['down'] ||
          keysPressed.current['s'] ||
          keysPressed.current['keys'] ||
          keysPressed.current['numpad2'];
        const isTurnLeft =
          keysPressed.current['arrowleft'] ||
          keysPressed.current['left'] ||
          keysPressed.current['numpad4'];
        const isTurnRight =
          keysPressed.current['arrowright'] ||
          keysPressed.current['right'] ||
          keysPressed.current['numpad6'];
        const isStrafeLeft =
          keysPressed.current['a'] ||
          keysPressed.current['keya'] ||
          keysPressed.current['q'] ||
          keysPressed.current['keyq'];
        const isStrafeRight =
          keysPressed.current['d'] ||
          keysPressed.current['keyd'];

        const isShift =
          keysPressed.current['shift'] ||
          keysPressed.current['shiftleft'] ||
          keysPressed.current['shiftright'];

        const isSprinting = isShift && p.stamina > 10;
        const isCrouching =
          keysPressed.current['c'] ||
          keysPressed.current['keyc'] ||
          keysPressed.current['control'] ||
          keysPressed.current['controlleft'];

        let moveForward = 0;
        let moveStrafe = 0;

        // Keyboard arrow camera turning & Q key
        if (isTurnLeft || keysPressed.current['q'] || keysPressed.current['keyq']) {
          if (isShift && !isTurnLeft) {
            moveStrafe -= 1;
          } else {
            nextAngle -= 3.4 * dt;
          }
        }
        if (isTurnRight) {
          if (isShift) {
            moveStrafe += 1;
          } else {
            nextAngle += 3.4 * dt;
          }
        }

        if (isUp) moveForward += 1;
        if (isDown) moveForward -= 1;

        // When moving forward/backward or holding Shift: A and D strafe sideways
        // When STANDING STILL (moveForward === 0) and not holding Shift:
        // A and D TURN THE CAMERA so you can look around freely while standing using WASD!
        if (moveForward !== 0 || isShift) {
          if (isStrafeLeft) moveStrafe -= 1;
          if (isStrafeRight) moveStrafe += 1;
        } else {
          // Standing still: A turns left, D turns right
          if (isStrafeLeft) nextAngle -= 3.4 * dt;
          if (isStrafeRight) nextAngle += 3.4 * dt;
        }

        // Mobile movement overrides
        if (mobileMove.current.x !== 0 || mobileMove.current.y !== 0) {
          moveStrafe = mobileMove.current.x;
          moveForward = mobileMove.current.y;
        }

        const isMoving = moveForward !== 0 || moveStrafe !== 0;

        let speed = 2.8; // Base units per second
        if (isSprinting) speed = 4.8;
        if (isCrouching) speed = 1.4;

        let dx = 0;
        let dy = 0;

        if (isMoving) {
          // Normalize diagonal input
          const mag = Math.hypot(moveForward, moveStrafe);
          const normForward = moveForward / mag;
          const normStrafe = moveStrafe / mag;

          const dirX = Math.cos(nextAngle);
          const dirY = Math.sin(nextAngle);
          const strafeX = -dirY;
          const strafeY = dirX;

          dx = (dirX * normForward + strafeX * normStrafe) * speed * dt;
          dy = (dirY * normForward + strafeY * normStrafe) * speed * dt;

          soundEngine.playFootstep(curStage.theme, isSprinting, isCrouching);
        }

        const resolved = checkCollision(p.x + dx, p.y + dy, p.x, p.y);

        // Check if stepped into exit door tile
        if (
          doorUnlockedRef.current &&
          Math.floor(resolved.x) === curStage.exitPosition.x &&
          Math.floor(resolved.y) === curStage.exitPosition.y
        ) {
          soundEngine.playVictoryChime();
          setIsStageWon(true);
        }

        // Stamina management
        let nextStamina = p.stamina;
        if (isSprinting && isMoving) {
          nextStamina = Math.max(0, nextStamina - 22 * dt);
        } else {
          nextStamina = Math.min(100, nextStamina + 16 * dt);
        }

        // Flashlight battery drain
        let nextBattery = p.flashlightBattery;
        if (p.isFlashlightOn) {
          nextBattery = Math.max(0, nextBattery - 1.2 * dt);
        }

        // Dread calculation
        let nextDread = p.dread;
        if (!p.isFlashlightOn || nextBattery <= 0) {
          nextDread = Math.min(100, nextDread + 4.5 * dt);
        } else {
          nextDread = Math.max(0, nextDread - 2.5 * dt);
        }

        // Apply updated values to player ref
        p.x = resolved.x;
        p.y = resolved.y;
        p.angle = nextAngle;
        p.stamina = nextStamina;
        p.flashlightBattery = nextBattery;
        p.dread = nextDread;
        p.isSprinting = isSprinting;
        p.isCrouching = isCrouching;
        p.isMoving = isMoving;

        // --- 2. ENTITY AI TICK ---
        const entitiesList = entitiesRef.current;
        for (let i = 0; i < entitiesList.length; i++) {
          const ent = entitiesList[i];
          let nextState = ent.state;
          let nextX = ent.x;
          let nextY = ent.y;
          let nextIdx = ent.currentPatrolIdx;
          let nextStun = Math.max(0, ent.stunTimer - dt);
          let searchTime = ent.searchTimer ?? 0;
          let lastX = ent.lastSeenX;
          let lastY = ent.lastSeenY;

          const edx = p.x - ent.x;
          const edy = p.y - ent.y;
          const distToPlayer = Math.sqrt(edx * edx + edy * edy);

          // Check if player is shining flashlight directly at entity
          const angleToEnt = Math.atan2(-edy, -edx);
          let angleDiff = Math.abs(p.angle - angleToEnt);
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          const isPlayerLooking = Math.abs(angleDiff) < 0.45;

          const hasLineOfSight = checkLineOfSight(ent.x, ent.y, p.x, p.y, curStage);

          if (
            isPlayerLooking &&
            hasLineOfSight &&
            p.isFlashlightOn &&
            p.flashlightBattery > 0 &&
            distToPlayer < 6.5
          ) {
            if (ent.type === 'smiler') {
              nextStun = Math.max(nextStun, 1.8);
              nextState = 'stunned';
              // Note mechanic: "Turn flashlight toward it and back away slowly. It retreats from direct illumination."
              const awayX = ent.x - p.x;
              const awayY = ent.y - p.y;
              const awayLen = Math.hypot(awayX, awayY) || 1;
              const pushed = moveEntityWithSliding(
                ent.x,
                ent.y,
                ent.x + (awayX / awayLen) * 2,
                ent.y + (awayY / awayLen) * 2,
                0.022,
                dt,
                curStage
              );
              nextX = pushed.x;
              nextY = pushed.y;
            }
          }

          const effectiveHearing =
            p.isSprinting
              ? ent.hearingDistance * 1.5
              : p.isCrouching
              ? ent.hearingDistance * 0.35
              : ent.hearingDistance * 0.85;

          const canHear = p.isMoving && distToPlayer < effectiveHearing;
          const canSee = distToPlayer < ent.detectionDistance && hasLineOfSight;

          if (nextStun <= 0) {
            if (canHear || canSee) {
              if (nextState !== 'chase') {
                soundEngine.playEntityAlert(distToPlayer);
              }
              nextState = 'chase';
              lastX = p.x;
              lastY = p.y;
              searchTime = 3.5;
            } else if (nextState === 'chase') {
              // Lost line of sight and cannot hear -> search last known location
              nextState = 'searching';
            }

            let targetX = ent.x;
            let targetY = ent.y;
            let moveSpeed = ent.speed;

            if (nextState === 'chase') {
              targetX = p.x;
              targetY = p.y;
              moveSpeed = ent.chaseSpeed;
            } else if (nextState === 'searching') {
              searchTime -= dt;
              if (lastX !== undefined && lastY !== undefined) {
                targetX = lastX;
                targetY = lastY;
                moveSpeed = ent.speed * 1.15;
                const distToLastSeen = Math.hypot(lastX - ent.x, lastY - ent.y);
                if (distToLastSeen < 0.6 || searchTime <= 0) {
                  // Lost target -> resume patrol smoothly at closest waypoint
                  nextState = 'patrol';
                  if (ent.patrolPoints.length > 0) {
                    let bestIdx = 0;
                    let bestD = Infinity;
                    for (let k = 0; k < ent.patrolPoints.length; k++) {
                      const d = Math.hypot(ent.patrolPoints[k].x - ent.x, ent.patrolPoints[k].y - ent.y);
                      if (d < bestD) {
                        bestD = d;
                        bestIdx = k;
                      }
                    }
                    nextIdx = bestIdx;
                  }
                }
              } else {
                nextState = 'patrol';
              }
            } else if (nextState === 'patrol' && ent.patrolPoints.length > 0) {
              const targetNode = ent.patrolPoints[nextIdx];
              targetX = targetNode.x;
              targetY = targetNode.y;

              const nodeDist = Math.hypot(targetNode.x - ent.x, targetNode.y - ent.y);
              if (nodeDist < 0.45) {
                nextIdx = (nextIdx + 1) % ent.patrolPoints.length;
              }
            }

            // Pathfinding: Navigate through corridors avoiding walls and turning corners smoothly
            const wp = getNextNavWaypoint(ent.x, ent.y, targetX, targetY, curStage);
            const moved = moveEntityWithSliding(
              ent.x,
              ent.y,
              wp.x,
              wp.y,
              moveSpeed,
              dt,
              curStage
            );
            nextX = moved.x;
            nextY = moved.y;

            // Check if captured player!
            if (distToPlayer <= ent.attackDistance) {
              soundEngine.playJumpscare();
              setCaughtByEntity({ ...ent });
              setIsGameOver(true);
            }
          }

          ent.x = nextX;
          ent.y = nextY;
          ent.state = nextState;
          ent.stunTimer = nextStun;
          ent.currentPatrolIdx = nextIdx;
          ent.lastSeenX = lastX;
          ent.lastSeenY = lastY;
          ent.searchTimer = searchTime;
          ent.animationTick += 1;
        }

        // --- 3. CHECK INTERACTION RETICLE ---
        const target = raycasterEngine.checkInteractionTarget(
          p,
          curStage,
          worldItemsRef.current,
          doorUnlockedRef.current
        );

        const lastTarget = interactionTargetRef.current;
        interactionTargetRef.current = target;

        // Immediate UI update if interaction target changes
        if (
          target.type !== lastTarget.type ||
          target.item?.id !== lastTarget.item?.id ||
          target.doorUnlocked !== lastTarget.doorUnlocked
        ) {
          setInteractionTarget(target);
        }

        // Periodic HUD sync (every ~50ms) to keep React UI smooth and minimap radar blips fully in sync
        if (time - lastHudSyncRef.current > 50) {
          lastHudSyncRef.current = time;
          setPlayer({ ...p });
          setEntities(entitiesList.map((e) => ({ ...e })));

          // Update spatial heartbeat audio
          let nearestDist = 999;
          for (const e of entitiesList) {
            const d = Math.hypot(e.x - p.x, e.y - p.y);
            if (d < nearestDist) nearestDist = d;
          }
          soundEngine.updateHeartbeat(p.dread, nearestDist);
        }
      }

      // --- 4. RENDER FRAME VIA RAYCASTER DIRECT TO CANVAS ---
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          const flickerChance = Math.random();
          const flickerFactor =
            flickerChance < curStage.lighting.lightFlickerRate ? 0.35 + Math.random() * 0.3 : 1.0;

          raycasterEngine.render(
            ctx,
            canvas.width,
            canvas.height,
            p,
            curStage,
            entitiesRef.current,
            worldItemsRef.current,
            doorUnlockedRef.current,
            flickerFactor
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    currentStageIdx,
    isGameOver,
    isStageWon,
    isPauseOpen,
    isPuzzleOpen,
    activeNote,
    settings.mouseSensitivity,
  ]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = settings.renderResolution; // e.g. 0.75 for fast rendering
      canvasRef.current.width = Math.floor(w * scale);
      canvasRef.current.height = Math.floor(h * scale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [settings.renderResolution]);

  // Puzzle Solved Handler
  const handlePuzzleSolved = () => {
    setIsPuzzleOpen(false);
    setDoorUnlocked(true);
    soundEngine.playDoorUnlocked();
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0c0c0c] select-none"
      onClick={() => {
        soundEngine.init();
        canvasRef.current?.focus();
      }}
    >
      {/* 3D Raycasting Canvas */}
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onClick={() => {
          soundEngine.init();
          requestCanvasPointerLock();
        }}
        onMouseDown={(e) => {
          soundEngine.init();
          isMouseDownRef.current = true;
          lastMouseXRef.current = e.clientX;
          canvasRef.current?.focus();
        }}
        onMouseUp={() => {
          isMouseDownRef.current = false;
        }}
        className={`w-full h-full block object-cover outline-none select-none transition-all ${
          isMouseLocked
            ? 'cursor-none'
            : isMouseDownRef.current
            ? 'cursor-grabbing'
            : 'cursor-grab'
        }`}
        style={{ imageRendering: 'pixelated' }}
      />

      {/* VHS Camcorder Liminal HUD */}
      <HUD
        player={player}
        stage={stage}
        entities={entities}
        items={worldItems}
        interactionTarget={interactionTarget}
        doorUnlocked={doorUnlocked}
        onUseBattery={reloadBattery}
        onToggleFlashlight={toggleFlashlight}
        soundMuted={soundMuted}
        onToggleMute={() => setSoundMuted((m) => !m)}
        onOpenSettings={() => setIsPauseOpen(true)}
        onOpenLatestNote={() => {
          if (player.inventory.notesRead.length > 0) {
            const lastNoteId = player.inventory.notesRead[player.inventory.notesRead.length - 1];
            const found = stage.notes.find((n) => n.id === lastNoteId);
            if (found) setActiveNote(found);
          }
        }}
        isMouseLocked={isMouseLocked}
        onToggleMouseLock={toggleMouseLock}
        onInteract={triggerInteraction}
      />

      {/* Mobile Touch Controls */}
      <MobileControls
        onMove={(x, y) => {
          mobileMove.current = { x, y };
        }}
        onRotate={(deltaAngle) => {
          playerRef.current.angle += deltaAngle;
          setPlayer((p) => ({ ...p, angle: p.angle + deltaAngle }));
        }}
        onInteract={triggerInteraction}
        onToggleFlashlight={() => {
          soundEngine.playFlashlightClick(!player.isFlashlightOn);
          setPlayer((p) => ({ ...p, isFlashlightOn: !p.isFlashlightOn }));
        }}
        onToggleSprint={() => {
          setPlayer((p) => ({ ...p, isSprinting: !p.isSprinting }));
        }}
        onToggleCrouch={() => {
          setPlayer((p) => ({ ...p, isCrouching: !p.isCrouching }));
        }}
        onReloadBattery={reloadBattery}
        isSprinting={player.isSprinting}
        isCrouching={player.isCrouching}
        canInteract={
          interactionTarget.type !== 'none' &&
          (interactionTarget.type === 'item' ||
            interactionTarget.type === 'terminal' ||
            (interactionTarget.type === 'door' && doorUnlocked))
        }
      />

      {/* Interactive Terminal Puzzle Modal */}
      {isPuzzleOpen && (
        <PuzzleModal
          puzzle={activePuzzle}
          player={player}
          onSolve={handlePuzzleSolved}
          onClose={() => setIsPuzzleOpen(false)}
          onUpdateInventory={(inv) => setPlayer((p) => ({ ...p, inventory: inv }))}
        />
      )}

      {/* Survivor Log Note Modal */}
      {activeNote && (
        <NoteModal note={activeNote} onClose={() => setActiveNote(null)} />
      )}

      {/* Pause Menu & Lore Field Guide */}
      <PauseMenu
        isOpen={isPauseOpen}
        onClose={() => setIsPauseOpen(false)}
        currentStage={stage}
        settings={settings}
        onUpdateSettings={setSettings}
        onRestartLevel={() => loadStage(currentStageIdx)}
        onSelectStage={(id) => loadStage(id)}
      />

      {/* Game Over Screen */}
      {isGameOver && (
        <GameOverModal
          stage={stage}
          entity={caughtByEntity}
          onRestart={() => loadStage(currentStageIdx)}
        />
      )}

      {/* Victory / Stage Complete Screen */}
      {isStageWon && (
        <VictoryModal
          stage={stage}
          isGameComplete={currentStageIdx >= STAGES.length - 1}
          timeSpentSeconds={elapsedTime}
          onNextStage={() => loadStage(currentStageIdx + 1)}
          onRestartGame={() => loadStage(0)}
        />
      )}
    </div>
  );
}
