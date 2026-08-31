/**
 * Liminal Space Escape - Core Game Types
 */

export type StageTheme =
  | 'backrooms'
  | 'poolrooms'
  | 'mall'
  | 'hospital'
  | 'school'
  | 'office'
  | 'hotel'
  | 'tunnels'
  | 'void';

export type EntityType = 'smiler' | 'hound' | 'shade' | 'stalker' | 'glitch' | 'mannequin' | 'orderly';

export type EntityState = 'patrol' | 'idle' | 'chase' | 'searching' | 'stunned';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  x: number;
  y: number;
  angle: number;
  state: EntityState;
  speed: number;
  chaseSpeed: number;
  patrolPoints: { x: number; y: number }[];
  currentPatrolIdx: number;
  alertness: number; // 0 to 1
  detectionDistance: number;
  hearingDistance: number;
  attackDistance: number;
  stunTimer: number;
  animationTick: number;
  description: string;
  mechanicHint: string;
  lastSeenX?: number;
  lastSeenY?: number;
  searchTimer?: number;
  patrolTimer?: number;
  stunCooldown?: number;
  enraged?: boolean;
  invisPhased?: boolean;
  teleportTimer?: number;
}

export type ItemType = 'battery' | 'keycard' | 'fuse' | 'valve_wheel' | 'room_key' | 'note';

export interface WorldItem {
  id: string;
  type: ItemType;
  name: string;
  x: number;
  y: number;
  collected: boolean;
  color: string;
  metadata?: {
    noteId?: string;
    fuseCode?: string;
    keycardLevel?: number;
    roomNumber?: string;
  };
}

export interface SurvivorNote {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  hint: string;
}

export type PuzzleType = 'breaker_box' | 'hydro_valves' | 'hotel_keypad' | 'wire_conduits' | 'resonance_matrix';

export interface BreakerPuzzleState {
  type: 'breaker_box';
  switches: boolean[]; // 4 switches (e.g. [true, false, true, true])
  targetSwitches: boolean[];
  fusesInstalled: boolean[]; // 3 fuse slots
  requiredFuses: number;
  fusesInInventory: number;
  solved: boolean;
}

export interface HydroPuzzleState {
  type: 'hydro_valves';
  valves: number[]; // 3 valves with values 0-100
  targetValves: number[]; // target ranges, e.g. [40, 75, 20]
  tolerance: number;
  solved: boolean;
}

export interface HotelKeypadPuzzleState {
  type: 'hotel_keypad';
  enteredCode: string;
  correctCode: string;
  clueHint: string;
  solved: boolean;
}

export interface WireConduitPuzzleState {
  type: 'wire_conduits';
  grid: number[]; // 3x3 grid, rotation 0, 90, 180, 270 (0, 1, 2, 3)
  types: ('straight' | 'corner' | 'cross')[];
  sourceIndex: number;
  targetIndex: number;
  solved: boolean;
}

export interface ResonanceMatrixPuzzleState {
  type: 'resonance_matrix';
  sequence: number[]; // Sequence of 4 or 5 frequencies (0-3)
  playerSequence: number[];
  currentIndex: number;
  showingSequence: boolean;
  solved: boolean;
}

export type ActivePuzzle = 
  | BreakerPuzzleState 
  | HydroPuzzleState 
  | HotelKeypadPuzzleState 
  | WireConduitPuzzleState 
  | ResonanceMatrixPuzzleState;

export interface StageConfig {
  id: number;
  levelNumber: number;
  name: string;
  subtitle: string;
  theme: StageTheme;
  difficultyLabel: string;
  ambientDreadRate: number;
  twistTitle?: string;
  twistRule?: string;
  description: string;
  objective: string;
  mapWidth: number;
  mapHeight: number;
  map: number[][]; // 0: empty, 1: wall, 2: exit door, 3: puzzle terminal, 4: locked gate, 5: water
  playerSpawn: { x: number; y: number; angle: number };
  exitPosition: { x: number; y: number };
  terminalPosition: { x: number; y: number };
  entities: Omit<Entity, 'state' | 'alertness' | 'stunTimer' | 'animationTick'>[];
  items: Omit<WorldItem, 'collected'>[];
  notes: SurvivorNote[];
  puzzleConfig: {
    type: PuzzleType;
    initialState: ActivePuzzle;
  };
  lighting: {
    ambientColor: string;
    ambientIntensity: number;
    lightFlickerRate: number;
    flashlightRange: number;
    fogDistance: number;
  };
}

export interface PlayerState {
  x: number;
  y: number;
  angle: number; // In radians
  pitch: number; // Vertical tilt
  health: number; // 0 to 100
  stamina: number; // 0 to 100
  dread: number; // 0 to 100 (sanity)
  flashlightBattery: number; // 0 to 100
  isFlashlightOn: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  isMoving: boolean;
  inventory: {
    batteries: number;
    fuses: number;
    keycards: number;
    valveWheels: number;
    notesRead: string[];
  };
}

export interface GameSettings {
  vhsOverlay: boolean;
  soundEnabled: boolean;
  masterVolume: number;
  mouseSensitivity: number;
  renderResolution: number; // 1 = full, 0.75 = balanced, 0.5 = retro 90s
  showMinimap: boolean;
}
