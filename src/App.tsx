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

  // Stage-specific twist event states
  const twistEventRef = useRef<{
    stageId: number;
    timer: number;
    eventActive: boolean;
    eventDuration: number;
    warningGiven: boolean;
    type: 'none' | 'brownout' | 'bell_sweep' | 'phone_ring' | 'steam_purge' | 'reality_glitch';
    phonePos: { x: number; y: number; cubicleName: string } | null;
    decoyPos: { x: number; y: number; timer: number } | null;
    ecgTimer: number;
    mannequinStepTimer: number;
    hotelTranslocationTimer: number;
  }>({
    stageId: -1,
    timer: 0,
    eventActive: false,
    eventDuration: 0,
    warningGiven: false,
    type: 'none',
    phonePos: null,
    decoyPos: null,
    ecgTimer: 0,
    mannequinStepTimer: 0,
    hotelTranslocationTimer: 0,
  });

  const [twistBanner, setTwistBanner] = useState<{
    active: boolean;
    type: string;
    title: string;
    message: string;
  }>({ active: false, type: 'none', title: '', message: '' });

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

    twistEventRef.current = {
      stageId: targetStage.id,
      timer: 0,
      eventActive: false,
      eventDuration: 0,
      warningGiven: false,
      type: 'none',
      phonePos: null,
      decoyPos: null,
      ecgTimer: 0,
      mannequinStepTimer: 0,
      hotelTranslocationTimer: 0,
    };
    setTwistBanner({ active: false, type: 'none', title: '', message: '' });

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

    // Stage 5 Twist: Answering ringing office phone lures the Dilapidated Manager
    if (it.id === 'desk_phone') {
      soundEngine.playPhonePickup();
      soundEngine.playEntityAlert(5);
      const phonePos = twistEventRef.current.phonePos;
      if (phonePos) {
        const ents = entitiesRef.current;
        for (const e of ents) {
          if (e.type === 'stalker' || e.name.toLowerCase().includes('manager')) {
            e.lastSeenX = phonePos.x;
            e.lastSeenY = phonePos.y;
            e.state = 'chase';
            e.searchTimer = 12.0; // 12 seconds investigating the cubicle
          }
        }
      }
      twistEventRef.current.phonePos = null;
      twistEventRef.current.eventActive = false;
      setTwistBanner({
        active: true,
        type: 'phone_lured',
        title: 'MANAGER LURED TO DESK PHONE',
        message: 'The Manager is investigating the ringing phone! Server Room corridor is clear for 12 seconds!',
      });
      setTimeout(() => {
        setTwistBanner((b) => (b.type === 'phone_lured' ? { ...b, active: false } : b));
      }, 4500);
      interactionTargetRef.current = { type: 'none' };
      setInteractionTarget({ type: 'none' });
      return;
    }

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

    // Stage 1 Twist: Crouched sonar splash ripple decoy
    if (stageRef.current.theme === 'poolrooms' && p.isCrouching) {
      soundEngine.playSonarDistraction();
      twistEventRef.current.decoyPos = { x: p.x, y: p.y, timer: 7.0 };
      setTwistBanner({
        active: true,
        type: 'decoy',
        title: 'ACOUSTIC SPLASH RIPPLE CREATED',
        message: 'The Murmur Hound is tracking your water ripple! Crouch and wade away silently.',
      });
      setTimeout(() => {
        setTwistBanner((b) => (b.type === 'decoy' ? { ...b, active: false } : b));
      }, 4500);
      return;
    }

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

        // --- 1B. STAGE TWIST PERIODIC EVENT SYSTEM ---
        const twist = twistEventRef.current;
        if (twist.stageId !== curStage.id) {
          twist.stageId = curStage.id;
          twist.timer = 0;
          twist.eventActive = false;
          twist.eventDuration = 0;
          twist.warningGiven = false;
          twist.type = 'none';
          twist.phonePos = null;
          twist.decoyPos = null;
          twist.ecgTimer = 0;
          twist.mannequinStepTimer = 0;
          twist.hotelTranslocationTimer = 0;
        }

        // Handle active decoy timer (Stage 1 Poolrooms)
        if (twist.decoyPos) {
          twist.decoyPos.timer -= dt;
          if (twist.decoyPos.timer <= 0) {
            twist.decoyPos = null;
          }
        }

        // Stage 2: Galleria Mall (Generator Brownouts)
        if (curStage.theme === 'mall') {
          twist.timer += dt;
          if (twist.timer >= 19.5 && !twist.warningGiven) {
            twist.warningGiven = true;
            soundEngine.playTransformerBuzz();
            setTwistBanner({
              active: true,
              type: 'brownout_warn',
              title: 'GENERATOR TRANSFORMER SURGE',
              message: 'Power grid fluctuating! Brownout imminent—maintain visual line on Mannequin!',
            });
          }
          if (twist.timer >= 22.0) {
            twist.timer = 0;
            twist.warningGiven = false;
            twist.eventActive = true;
            twist.eventDuration = 2.6; // 2.6s blackout
            twist.type = 'brownout';
            soundEngine.playTransformerBuzz();
            setTwistBanner({
              active: true,
              type: 'brownout',
              title: '!! POWER BROWNOUT ACTIVE !!',
              message: 'LIGHTS OUT! The Mannequin moves freely in the dark!',
            });
          }
          if (twist.eventActive && twist.type === 'brownout') {
            twist.eventDuration -= dt;
            if (twist.eventDuration <= 0) {
              twist.eventActive = false;
              setTwistBanner((b) => (b.type === 'brownout' ? { ...b, active: false } : b));
            }
          }
        }

        // Stage 4: Vintage School (PA Bell Sweep)
        if (curStage.theme === 'school') {
          twist.timer += dt;
          if (twist.timer >= 25.5 && !twist.warningGiven) {
            twist.warningGiven = true;
            soundEngine.playBellRinging();
            setTwistBanner({
              active: true,
              type: 'bell_warn',
              title: 'PA CHIME RINGING',
              message: 'School bell tolling! Seek shelter in a classroom alcove immediately!',
            });
          }
          if (twist.timer >= 28.0) {
            twist.timer = 0;
            twist.warningGiven = false;
            twist.eventActive = true;
            twist.eventDuration = 6.0; // 6-second sweep
            twist.type = 'bell_sweep';
            setTwistBanner({
              active: true,
              type: 'bell_sweep',
              title: '!! HALLWAY SWEEP IN PROGRESS !!',
              message: 'The Hall Monitor is sweeping the central corridors! Stay inside classroom alcoves!',
            });
          }
          if (twist.eventActive && twist.type === 'bell_sweep') {
            twist.eventDuration -= dt;
            if (twist.eventDuration <= 0) {
              twist.eventActive = false;
              setTwistBanner((b) => (b.type === 'bell_sweep' ? { ...b, active: false } : b));
            }
          }
        }

        // Stage 5: Corporate Office (Ringing Desk Telephones)
        if (curStage.theme === 'office') {
          twist.timer += dt;
          if (twist.timer >= 22.0 && !twist.phonePos) {
            twist.timer = 0;
            const cubicles = [
              { x: 1.5, y: 11.5, cubicleName: 'Cubicle Bay C' },
              { x: 14.5, y: 1.5, cubicleName: 'Cubicle Bay A' },
              { x: 5.5, y: 5.5, cubicleName: 'Accounting Desk 4' },
            ];
            const chosen = cubicles[Math.floor(Math.random() * cubicles.length)];
            twist.phonePos = chosen;
            twist.eventActive = true;
            twist.type = 'phone_ring';
            soundEngine.playTelephoneRing();
            setTwistBanner({
              active: true,
              type: 'phone',
              title: 'DESK PHONE RINGING',
              message: `Rotary phone ringing at ${chosen.cubicleName}! Approach and press [E] to lure the Manager away!`,
            });
          }
        }

        // Stage 6: Hotel (Door Translocation)
        if (curStage.theme === 'hotel') {
          twist.hotelTranslocationTimer += dt;
          if (twist.hotelTranslocationTimer >= 22.0) {
            twist.hotelTranslocationTimer = 0;
            soundEngine.playElevatorDing();
            const ents = entitiesRef.current;
            for (const e of ents) {
              if (e.type === 'shade' || e.name.toLowerCase().includes('concierge')) {
                if (e.x < 8) {
                  e.x = 12.5;
                  e.y = 3.5;
                } else {
                  e.x = 3.5;
                  e.y = 12.5;
                }
              }
            }
            setTwistBanner({
              active: true,
              type: 'translocation',
              title: 'BRASS ELEVATOR CHIME // TRANSLOCATION',
              message: 'The Concierge stepped through Room 404 and materialized in another wing!',
            });
            setTimeout(() => {
              setTwistBanner((b) => (b.type === 'translocation' ? { ...b, active: false } : b));
            }, 4500);
          }
        }

        // Stage 7: Steam Conduit Tunnels (Steam Purge Cycles)
        if (curStage.theme === 'tunnels') {
          twist.timer += dt;
          if (twist.timer >= 24.0) {
            twist.timer = 0;
            twist.eventActive = true;
            twist.eventDuration = 5.5; // 5.5s steam cloud
            twist.type = 'steam_purge';
            soundEngine.playSteamHiss();
            setTwistBanner({
              active: true,
              type: 'steam',
              title: '!! BOILER STEAM PURGE ACTIVE !!',
              message: 'High-pressure steam filling conduits! Entity optical sensors blinded—sprint across intersections!',
            });
          }
          if (twist.eventActive && twist.type === 'steam_purge') {
            twist.eventDuration -= dt;
            if (twist.eventDuration <= 0) {
              twist.eventActive = false;
              setTwistBanner((b) => (b.type === 'steam' ? { ...b, active: false } : b));
            }
          }
        }

        // Stage 8: Non-Euclidean Void (Dimensional Glitch Tears)
        if (curStage.theme === 'void') {
          twist.timer += dt;
          if (twist.timer >= 18.0) {
            twist.timer = 0;
            twist.eventActive = true;
            twist.eventDuration = 3.6; // 3.6s glitch tear
            twist.type = 'reality_glitch';
            soundEngine.playGlitchTear();
            const ents = entitiesRef.current;
            for (const e of ents) {
              if (e.type === 'glitch' || e.name.toLowerCase().includes('resonance')) {
                e.invisPhased = true;
                e.x = 2.5 + Math.random() * 11;
                e.y = 2.5 + Math.random() * 11;
              }
            }
            setTwistBanner({
              active: true,
              type: 'glitch',
              title: '!! DIMENSIONAL GLITCH SURGE !!',
              message: 'Space-time collapsing! Entities phasing through reality—synchronize the Altar to break free!',
            });
          }
          if (twist.eventActive && twist.type === 'reality_glitch') {
            twist.eventDuration -= dt;
            if (twist.eventDuration <= 0) {
              twist.eventActive = false;
              const ents = entitiesRef.current;
              for (const e of ents) {
                e.invisPhased = false;
              }
              setTwistBanner((b) => (b.type === 'glitch' ? { ...b, active: false } : b));
            }
          }
        }

        // --- 2. ENTITY AI TICK ---
        const entitiesList = entitiesRef.current;
        for (let i = 0; i < entitiesList.length; i++) {
          const ent = entitiesList[i];
          let nextState = ent.state;
          let nextX = ent.x;
          let nextY = ent.y;
          let nextIdx = ent.currentPatrolIdx;
          let nextStun = Math.max(0, ent.stunTimer - dt);
          let stunCooldown = Math.max(0, (ent.stunCooldown ?? 0) - dt);
          let searchTime = ent.searchTimer ?? 0;
          let patrolTimer = (ent.patrolTimer ?? 0) + dt;
          let lastX = ent.lastSeenX;
          let lastY = ent.lastSeenY;
          let enraged = ent.enraged ?? false;

          const edx = p.x - ent.x;
          const edy = p.y - ent.y;
          const distToPlayer = Math.sqrt(edx * edx + edy * edy);

          // Check if player is shining flashlight directly at entity
          const angleToEnt = Math.atan2(-edy, -edx);
          let angleDiff = Math.abs(p.angle - angleToEnt);
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          const isPlayerLooking = Math.abs(angleDiff) < 0.55;

          const hasLineOfSight = checkLineOfSight(ent.x, ent.y, p.x, p.y, curStage);

          // Flashlight interaction mechanics:
          const isIlluminated =
            isPlayerLooking &&
            hasLineOfSight &&
            p.isFlashlightOn &&
            p.flashlightBattery > 0 &&
            distToPlayer < (curStage.lighting.flashlightRange ?? 7.5);

          // === STAGE-SPECIFIC TWIST AI MECHANICS ===

          // 1. Stage 0 (Smiler): Flashlight stuns and forces retreat into open corridors
          if (ent.type === 'smiler' && isIlluminated && stunCooldown <= 0) {
            nextStun = 1.4;
            stunCooldown = 2.4;
            nextState = 'stunned';
            soundEngine.playEntityAlert(distToPlayer);
          }

          // 2. Stage 1 (Poolrooms Murmur Hound): COMPLETELY BLIND!
          let isBlind = false;
          let effectiveHearing = ent.hearingDistance;

          if (curStage.theme === 'poolrooms' || ent.type === 'hound') {
            isBlind = true; // Hound has no eyes
            effectiveHearing = p.isSprinting ? 13.0 : p.isCrouching ? 1.0 : 4.8;
          } else if (curStage.theme === 'tunnels' || ent.type === 'stalker') {
            effectiveHearing = p.isSprinting ? 13.0 : 3.0;
          } else {
            effectiveHearing = p.isSprinting
              ? ent.hearingDistance * 1.5
              : p.isCrouching
              ? ent.hearingDistance * 0.35
              : ent.hearingDistance * 0.85;
          }

          // 3. Stage 2 (Mannequin): Quantum observation
          const isBrownoutActive = twist.eventActive && twist.type === 'brownout';
          if (ent.type === 'mannequin') {
            if (isPlayerLooking && hasLineOfSight && !isBrownoutActive) {
              nextStun = 0.5;
              nextState = 'stunned';
            }
          }

          // 4. Stage 3 (Orderly): Photophobic Rage (Reverse-Smiler)
          if (ent.type === 'orderly') {
            if (isIlluminated) {
              if (!enraged) {
                enraged = true;
                soundEngine.playOrderlyShriek();
                setTwistBanner({
                  active: true,
                  type: 'rage',
                  title: '!! FLASHLIGHT DETECTED - ORDERLY ENRAGED !!',
                  message: 'Extinguish flashlight [F] immediately and break line of sight!',
                });
              }
            } else if (!p.isFlashlightOn) {
              if (enraged && distToPlayer > 3.5) {
                enraged = false;
              }
            }

            twist.ecgTimer -= dt;
            if (distToPlayer < 9.0 && twist.ecgTimer <= 0) {
              soundEngine.playHospitalHeartMonitorBeep(distToPlayer);
              twist.ecgTimer = Math.max(0.22, (distToPlayer / 9.0) * 0.95);
            }
          }

          // 5. Stage 6 (Concierge): Amber Lantern Gaze Sanity Drain
          if (curStage.theme === 'hotel' && (ent.type === 'shade' || ent.name.toLowerCase().includes('concierge'))) {
            if (isPlayerLooking && hasLineOfSight && distToPlayer < 7.5) {
              p.dread = Math.min(100, p.dread + 24 * dt);
              soundEngine.playWhispers();
              setTwistBanner({
                active: true,
                type: 'gaze',
                title: '!! AVERT YOUR GAZE !!',
                message: 'Amber lantern light is collapsing your sanity! Look away at the floor!',
              });
            }
          }

          // 6. Stage 7 (Steam Purge Blinds Optical Sensors)
          const isSteamPurgeActive = twist.eventActive && twist.type === 'steam_purge';

          // Sight & Hearing detection resolution
          const canHear = p.isMoving && distToPlayer < effectiveHearing;
          const detectionRange = (ent.type === 'orderly' && !p.isFlashlightOn) ? 2.8 : ent.detectionDistance;
          const canSee = !isBlind && !isSteamPurgeActive && distToPlayer < detectionRange && hasLineOfSight;

          let targetX = ent.x;
          let targetY = ent.y;
          let moveSpeed = ent.speed;

          if (nextStun > 0 && !isBrownoutActive) {
            if (ent.type === 'smiler') {
              const awayX = ent.x - p.x;
              const awayY = ent.y - p.y;
              const awayLen = Math.hypot(awayX, awayY) || 1;
              targetX = ent.x + (awayX / awayLen) * 3;
              targetY = ent.y + (awayY / awayLen) * 3;
              moveSpeed = ent.speed * 1.4;
            } else {
              moveSpeed = 0;
            }
          } else {
            // Check Stage 1 decoy lure
            if (twist.decoyPos && twist.decoyPos.timer > 0 && (curStage.theme === 'poolrooms' || ent.type === 'hound')) {
              targetX = twist.decoyPos.x;
              targetY = twist.decoyPos.y;
              nextState = 'searching';
              moveSpeed = ent.speed * 1.1;
            } else if (canHear || canSee || (ent.type === 'orderly' && enraged)) {
              if (nextState !== 'chase') {
                soundEngine.playEntityAlert(distToPlayer);
              }
              nextState = 'chase';
              lastX = p.x;
              lastY = p.y;
              searchTime = 3.5;
            } else if (nextState === 'chase') {
              nextState = 'searching';
            }

            if (nextState === 'chase') {
              targetX = p.x;
              targetY = p.y;
              moveSpeed = (ent.type === 'orderly' && enraged)
                ? 0.080
                : (ent.type === 'mannequin')
                ? 0.082
                : (twist.eventActive && twist.type === 'bell_sweep')
                ? 0.084
                : ent.chaseSpeed;

              if (ent.type === 'mannequin') {
                twist.mannequinStepTimer += dt;
                if (twist.mannequinStepTimer > 0.35) {
                  soundEngine.playMannequinStep();
                  twist.mannequinStepTimer = 0;
                }
              }
            } else if (nextState === 'searching') {
              searchTime -= dt;
              if (lastX !== undefined && lastY !== undefined) {
                targetX = lastX;
                targetY = lastY;
                moveSpeed = ent.speed * 1.15;
                const distToLastSeen = Math.hypot(lastX - ent.x, lastY - ent.y);
                if (distToLastSeen < 0.6 || searchTime <= 0) {
                  nextState = 'patrol';
                  patrolTimer = 0;
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
                patrolTimer = 0;
              }
            } else if (nextState === 'patrol' && ent.patrolPoints.length > 0) {
              const targetNode = ent.patrolPoints[nextIdx];
              targetX = targetNode.x;
              targetY = targetNode.y;

              const nodeDist = Math.hypot(targetNode.x - ent.x, targetNode.y - ent.y);
              if (nodeDist < 0.65 || patrolTimer > 4.5) {
                nextIdx = (nextIdx + 1) % ent.patrolPoints.length;
                patrolTimer = 0;
              }
            }
          }

          if (moveSpeed > 0) {
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
          }

          // Check capture! If entity is phased (Stage 8), it cannot capture player.
          if (distToPlayer <= ent.attackDistance && nextStun <= 0 && !ent.invisPhased) {
            soundEngine.playJumpscare();
            setCaughtByEntity({ ...ent });
            setIsGameOver(true);
          }

          ent.x = nextX;
          ent.y = nextY;
          ent.state = nextState;
          ent.stunTimer = nextStun;
          ent.stunCooldown = stunCooldown;
          ent.currentPatrolIdx = nextIdx;
          ent.patrolTimer = patrolTimer;
          ent.lastSeenX = lastX;
          ent.lastSeenY = lastY;
          ent.searchTimer = searchTime;
          ent.enraged = enraged;
          ent.animationTick += 1;
        }

        // --- 3. CHECK INTERACTION RETICLE ---
        let target = raycasterEngine.checkInteractionTarget(
          p,
          curStage,
          worldItemsRef.current,
          doorUnlockedRef.current
        );

        // Stage 5 Twist: check ringing desk phone proximity
        if (twist.phonePos && curStage.theme === 'office') {
          const ph = twist.phonePos;
          const pDist = Math.hypot(p.x - ph.x, p.y - ph.y);
          if (pDist <= 2.2) {
            target = {
              type: 'item',
              distance: pDist,
              item: {
                id: 'desk_phone',
                type: 'note',
                name: `Ringing Desk Phone (${ph.cubicleName})`,
                x: ph.x,
                y: ph.y,
                collected: false,
                color: '#f59e0b',
              },
            };
          }
        }

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
          const isBrownout = twistEventRef.current.eventActive && twistEventRef.current.type === 'brownout';
          const flickerFactor = isBrownout
            ? 0.03
            : flickerChance < curStage.lighting.lightFlickerRate
            ? 0.35 + Math.random() * 0.3
            : 1.0;

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

          // Post-processing overlays for stage twists
          if (isBrownout) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (twistEventRef.current.eventActive && twistEventRef.current.type === 'steam_purge') {
            // Drifting steam haze overlay
            ctx.fillStyle = 'rgba(215, 225, 235, 0.35)';
            ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);
          } else if (twistEventRef.current.eventActive && twistEventRef.current.type === 'reality_glitch') {
            // Reality glitch tear chromatic scanlines
            ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
            for (let gl = 0; gl < canvas.height; gl += 6) {
              ctx.fillRect(0, gl, canvas.width, 2);
            }
          }
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
        twistBanner={twistBanner}
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
