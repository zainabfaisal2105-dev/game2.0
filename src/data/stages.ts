/**
 * Liminal Space Stages - Progression & Level Designs
 * Maps:
 * 0: Empty Floor
 * 1: Solid Wall
 * 2: Exit Door
 * 3: Interactive Puzzle Terminal
 * 4: Locked Barrier Gate
 * 5: Water Zone (Poolrooms)
 */

import { StageConfig } from '../types';

export const STAGES: StageConfig[] = [
  // ==========================================
  // STAGE 0: The Yellow Archives (Level 0)
  // ==========================================
  {
    id: 0,
    levelNumber: 0,
    name: 'Level 0: Mono-Yellow Archives',
    subtitle: 'The Infinite Lobby',
    theme: 'backrooms',
    difficultyLabel: 'Low Anomaly',
    ambientDreadRate: 0.05,
    twistTitle: 'LUMINESCENT REPEL',
    twistRule: 'Direct flashlight beam stuns and repels the Lurker. Back away slowly.',
    description: 'You awaken on damp yellow carpet. The air smells like wet wool, and the 60Hz fluorescent hum fills your ears with persistent dread.',
    objective: 'Locate the spare electrical fuse in the corner office, then access the Breaker Box to power the Exit Door.',
    mapWidth: 14,
    mapHeight: 14,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Open direct North corridor to fuse office at [12, 1]
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Open east-west bypass corridor
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1], // Open corridor at col 10
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1], // Open corridor at col 10
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 3, 0, 1, 0, 1, 0, 0, 0, 1], // Breaker Terminal at [5, 11]
      [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 2, 0, 1], // Exit Door at [11, 12]
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 11, y: 12 },
    terminalPosition: { x: 5, y: 11 },
    entities: [
      {
        id: 'smiler_0',
        type: 'smiler',
        name: 'The Lurker',
        x: 5.5,
        y: 5.5,
        angle: 0,
        speed: 0.024,
        chaseSpeed: 0.046,
        patrolPoints: [
          { x: 5.5, y: 5.5 },
          { x: 10.5, y: 5.5 },
          { x: 10.5, y: 9.5 },
          { x: 5.5, y: 9.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 5.2,
        hearingDistance: 4.2,
        attackDistance: 0.85,
        description: 'A shadowy silhouette lurking in hallway intersections with luminescent white eyes and a toothy grin.',
        mechanicHint: 'Direct eye contact with the flashlight beam stuns it briefly. Never sprint when it is nearby.',
      },
    ],
    items: [
      {
        id: 'fuse_0',
        type: 'fuse',
        name: 'Industrial Fuse (20A)',
        x: 12.5,
        y: 1.5,
        color: '#f59e0b',
        metadata: { fuseCode: '20A' },
      },
      {
        id: 'battery_0_1',
        type: 'battery',
        name: 'Spare D-Cell Battery',
        x: 1.5,
        y: 7.5,
        color: '#10b981',
      },
      {
        id: 'note_0_1',
        type: 'note',
        name: 'Scattered Office Memo',
        x: 3.5,
        y: 3.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage0_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage0_1',
        title: 'Memo to Facility Custodian - Oct 12, 1997',
        date: 'Oct 12, 1997',
        author: 'Chief Engineer Davis',
        content: `If the magnetic fire doors trip again, do NOT force them. You must install the replacement 20A ceramic fuse in Slot 1 of the Breaker Box in Corridor B.
Flip Switches 1, 2, and 4 to [UP/ON], but leave Switch 3 [DOWN/OFF] to bypass the surge protector.

Also, someone reported seeing a grinning face in the unlit annex. Turn your flashlight toward it and back away slowly. It retreats from direct illumination.`,
        hint: 'Breaker Code: Switches 1, 2, 4 = ON, Switch 3 = OFF. Requires 1 Fuse.',
      },
    ],
    puzzleConfig: {
      type: 'breaker_box',
      initialState: {
        type: 'breaker_box',
        switches: [false, false, false, false],
        targetSwitches: [true, true, false, true], // 1, 2, 4 ON, 3 OFF
        fusesInstalled: [false],
        requiredFuses: 1,
        fusesInInventory: 0,
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#caa54d',
      ambientIntensity: 0.5,
      lightFlickerRate: 0.08,
      flashlightRange: 7.5,
      fogDistance: 8.5,
    },
  },

  // ==========================================
  // STAGE 1: The Submerged Baths (Level 1 - Poolrooms)
  // ==========================================
  {
    id: 1,
    levelNumber: 1,
    name: 'Level 1: The Submerged Baths',
    subtitle: 'The White-Tiled Poolrooms',
    theme: 'poolrooms',
    difficultyLabel: 'Moderate Dread',
    ambientDreadRate: 0.07,
    twistTitle: 'BLIND ECHOLOCATION & SONAR DECOY',
    twistRule: 'The Murmur Hound has no eyes—it is 100% blind! Sprinting water splashes alert it from afar. Crouch to wade in total silence, or click/toggle [F] while crouching to trigger a sonar splash decoy.',
    description: 'Pristine white ceramic tiles submerge under lukewarm, crystal-clear water. Echoes travel deceptively far along the vaulted arches.',
    objective: 'Recover the 2 brass valve wheels (Northeast Alcove [Top Right] and Southwest Sluice [Bottom Left]), then balance hydro-pressures at the Pump Terminal to drain the exit shaft.',
    mapWidth: 16,
    mapHeight: 16,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Open direct northern colonnade to Valve A (Northeast Alcove [14, 1])
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1], // Open west corridor at col 1
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1], // Open west corridor at col 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 1, 1, 3, 0, 1, 1, 1, 0, 0, 0, 1], // Direct access to Valve B at [1, 13] and clear Pump Terminal at [7, 13]
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 13, y: 14 },
    terminalPosition: { x: 7, y: 13 },
    entities: [
      {
        id: 'hound_1',
        type: 'hound',
        name: 'The Murmur Hound',
        x: 10.5,
        y: 5.5,
        angle: 0,
        speed: 0.028,
        chaseSpeed: 0.054,
        patrolPoints: [
          { x: 10.5, y: 5.5 },
          { x: 10.5, y: 10.5 },
          { x: 5.5, y: 10.5 },
          { x: 5.5, y: 5.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.0,
        hearingDistance: 7.5, // High hearing sensitivity in echoing water!
        attackDistance: 0.85,
        description: 'A pale, hunched quadruped that creeps through submerged corridors. It has no eyes and hunts purely by hydro-acoustic resonance.',
        mechanicHint: 'Totally blind: flashlight has NO effect. Running splashes alert it across halls. Crouch to wade in silence, or click [F] while crouching to throw a sonar distraction.',
      },
    ],
    items: [
      {
        id: 'valve_1_1',
        type: 'valve_wheel',
        name: 'Brass Hydro-Valve Wheel A (Northeast Alcove)',
        x: 14.5,
        y: 1.5,
        color: '#ef4444',
      },
      {
        id: 'valve_1_2',
        type: 'valve_wheel',
        name: 'Brass Hydro-Valve Wheel B (Southwest Sluice)',
        x: 1.5,
        y: 13.5,
        color: '#ef4444',
      },
      {
        id: 'battery_1_1',
        type: 'battery',
        name: 'Industrial Alkaline Battery',
        x: 10.5,
        y: 3.5,
        color: '#10b981',
      },
      {
        id: 'note_1_1',
        type: 'note',
        name: 'Waterproof Clipboard Log',
        x: 5.5,
        y: 5.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage1_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage1_1',
        title: 'Hydraulic Pumping Station Calibration Memo',
        date: 'Log #419',
        author: 'Surveyor Lin',
        content: `I managed to detach both valve wheels. Valve Wheel A is secured in the Northeast Colonnade alcove [top-right sector at Row 1, Col 14]. Valve Wheel B is resting by the Southwest drainage sluice [bottom-left sector at Row 13, Col 1].

Bring both wheels to the Main Pump Terminal in the South Hallway and balance the three line pressures:
- Valve 1 (Inlet): Set to 45 PSI
- Valve 2 (Purge): Set to 80 PSI
- Valve 3 (Return): Set to 25 PSI

Crucial: The beast in the water hunts by sound. Any running or splashing triggers immediate predatory pursuit. Move silently in crouch stance.`,
        hint: 'Valve A: Northeast Alcove (Top Right). Valve B: Southwest Sluice (Bottom Left). Target PSI: 45, 80, 25.',
      },
    ],
    puzzleConfig: {
      type: 'hydro_valves',
      initialState: {
        type: 'hydro_valves',
        valves: [0, 0, 0],
        targetValves: [45, 80, 25],
        tolerance: 6,
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#1c6f8a',
      ambientIntensity: 0.45,
      lightFlickerRate: 0.04,
      flashlightRange: 8.0,
      fogDistance: 9.0,
    },
  },

  // ==========================================
  // STAGE 2: Sunset Galleria Atrium (Level 2 - The Mall)
  // ==========================================
  {
    id: 2,
    levelNumber: 2,
    name: 'Level 2: Sunset Galleria Atrium',
    subtitle: 'The Abandoned 1990s Mall',
    theme: 'mall',
    difficultyLabel: 'Eerie Nostalgia',
    ambientDreadRate: 0.07,
    twistTitle: 'QUANTUM MANNEQUIN & POWER BROWNOUTS',
    twistRule: 'Freezes solid under observation. Moves with terrifying speed when unobserved. Beware 1990s generator brownouts where lights flicker out and it can move freely!',
    description: 'Polished terrazzo checkerboard floor, dark neon storefronts, and silent escalators leading into dark corridors. Distant muffled elevator muzak floats through the empty concourses.',
    objective: 'Search the food court and concourse for the Security Passcode Memo, then enter the keycode into the Central Security Terminal to raise the metal roller shutters blocking the Service Exit.',
    mapWidth: 16,
    mapHeight: 16,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Open North Concourse (access to Note at [14, 1])
      [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1], // Keycard at [13, 7]
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 1, 1, 3, 0, 1, 1, 1, 0, 0, 0, 1], // Terminal at [7, 13], Battery at [1, 13]
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1], // Exit door at [14, 14]
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 14, y: 14 },
    terminalPosition: { x: 7, y: 13 },
    entities: [
      {
        id: 'mannequin_2_1',
        type: 'mannequin',
        name: 'The Storefront Mannequin',
        x: 5.5,
        y: 5.5,
        angle: 0,
        speed: 0.026,
        chaseSpeed: 0.052,
        patrolPoints: [
          { x: 5.5, y: 5.5 },
          { x: 10.5, y: 5.5 },
          { x: 10.5, y: 10.5 },
          { x: 5.5, y: 10.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.5,
        hearingDistance: 5.0,
        attackDistance: 0.85,
        description: 'A sculpted retail mannequin dressed in dark 90s attire with an unnervingly smooth, featureless face.',
        mechanicHint: 'It freezes in place under direct flashlight illumination. Never turn your back when running.',
      },
    ],
    items: [
      {
        id: 'note_2_1',
        type: 'note',
        name: 'Liquidation Notice Memo',
        x: 14.5,
        y: 1.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage2_1' },
      },
      {
        id: 'battery_2_1',
        type: 'battery',
        name: 'Retail Security Battery',
        x: 1.5,
        y: 13.5,
        color: '#10b981',
      },
      {
        id: 'keycard_2_1',
        type: 'keycard',
        name: 'Store Staff Keycard',
        x: 13.5,
        y: 7.5,
        color: '#38bdf8',
      },
    ],
    notes: [
      {
        id: 'note_stage2_1',
        title: 'Notice of Mall Closure - Dec 31, 1994',
        date: 'Dec 31, 1994',
        author: 'Mall Operations Management',
        content: `Sunset Galleria is permanently closed.
All security roller shutters have engaged. To raise the Service Gate at the south concourse, enter the override code 1-9-9-4 into the central security console.

Warning to custodial night staff: Do not turn your back to the store display mannequins. If you hear footsteps on the terrazzo behind you, face them immediately and illuminate them.`,
        hint: 'Security Gate Code: 1994. Beware: Mannequins move when not looked at.',
      },
    ],
    puzzleConfig: {
      type: 'hotel_keypad',
      initialState: {
        type: 'hotel_keypad',
        enteredCode: '',
        correctCode: '1994',
        clueHint: 'Mall Security Memo: Override PIN is 1994 (Year of closure).',
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#2a1b3d',
      ambientIntensity: 0.42,
      lightFlickerRate: 0.05,
      flashlightRange: 8.5,
      fogDistance: 11.0,
    },
  },

  // ==========================================
  // STAGE 3: Ward 4 Sanatorium (Level 3 - The Hospital)
  // ==========================================
  {
    id: 3,
    levelNumber: 3,
    name: 'Level 3: Ward 4 Sanatorium',
    subtitle: 'The Abandoned Hospital',
    theme: 'hospital',
    difficultyLabel: 'Clinical Dread',
    ambientDreadRate: 0.08,
    twistTitle: 'PHOTOPHOBIC RAGE (REVERSE-SMILER)',
    twistRule: 'The Orderly HATES light. Shining your flashlight ENRAGES him into a lethal charge! Extinguish your flashlight beam [F] and navigate by cardiac telemetry beeps.',
    description: 'Pale mint clinical corridors, emergency triage lines on waxed linoleum, and flickering surgical troffers. In the distance, an abandoned heart monitor beeps with lonely persistence.',
    objective: 'Find the 2 Emergency Backup Fuses in Patient Ward A and the ICU, then align the Substation Conduits to restore power to the Triage Exit Gate.',
    mapWidth: 16,
    mapHeight: 16,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], // ICU Room at [14, 1] with Fuse 1
      [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1], // Shift note at [7, 7]
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 1, 0, 1], // Terminal at [11, 13], Fuse 2 at [1, 13]
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 2, 1], // Exit door at [14, 14]
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 14, y: 14 },
    terminalPosition: { x: 11, y: 13 },
    entities: [
      {
        id: 'orderly_3_1',
        type: 'orderly',
        name: 'The Night Orderly',
        x: 3.5,
        y: 5.5,
        angle: 0,
        speed: 0.03,
        chaseSpeed: 0.056,
        patrolPoints: [
          { x: 3.5, y: 5.5 },
          { x: 7.5, y: 5.5 },
          { x: 7.5, y: 9.5 },
          { x: 3.5, y: 9.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.8,
        hearingDistance: 6.0,
        attackDistance: 0.85,
        description: 'A pale, slouched silhouette in faded clinical teal scrubs wearing a stained surgical mask. Violent photophobia causes extreme aggression toward light.',
        mechanicHint: 'DO NOT SHINE FLASHLIGHT! Light triggers immediate enraged charge. Turn flashlight OFF, crouch, and track distance via ECG beeps.',
      },
    ],
    items: [
      {
        id: 'fuse_3_1',
        type: 'fuse',
        name: 'ICU High-Voltage Fuse',
        x: 14.5,
        y: 1.5,
        color: '#f59e0b',
        metadata: { fuseCode: 'ICU-30A' },
      },
      {
        id: 'battery_3_1',
        type: 'battery',
        name: 'Defibrillator Battery',
        x: 1.5,
        y: 13.5,
        color: '#10b981',
      },
      {
        id: 'note_3_1',
        type: 'note',
        name: 'Dr. Alvarez Shift Log',
        x: 7.5,
        y: 7.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage3_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage3_1',
        title: 'Ward 4 Quarantine Incident Log',
        date: 'Oct 04, 1988',
        author: 'Dr. Alvarez - Head of Psychiatry',
        content: `Quarantine protocols have permanently locked down Ward 4.
The triage blast doors will not open until the electrical conduits in the power substation are rotated to restore circuit continuity from the power feed to the isolation gates.

The night orderly is still pacing the wards in the dark. He is sensitive to bright light and tracks squeaking shoes on the waxed linoleum. Crouch to avoid detection.`,
        hint: 'Rotate the 3x3 conduit couplers at the Substation Terminal to route power to the triage door.',
      },
    ],
    puzzleConfig: {
      type: 'wire_conduits',
      initialState: {
        type: 'wire_conduits',
        grid: [1, 0, 3, 2, 1, 0, 3, 2, 1], // 3x3 rotatable conduit couplers
        types: [
          'straight', 'straight', 'corner',
          'straight', 'corner',   'straight',
          'corner',   'straight', 'corner',
        ],
        sourceIndex: 0,
        targetIndex: 8,
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#102a24',
      ambientIntensity: 0.38,
      lightFlickerRate: 0.08,
      flashlightRange: 8.0,
      fogDistance: 10.0,
    },
  },

  // ==========================================
  // STAGE 4: Meadowbrook High East Wing (Level 4 - The School)
  // ==========================================
  {
    id: 4,
    levelNumber: 4,
    name: 'Level 4: Meadowbrook High East Wing',
    subtitle: 'The Infinite School Hallway',
    theme: 'school',
    difficultyLabel: 'Hollow Echoes',
    ambientDreadRate: 0.08,
    twistTitle: 'PA BELL SWEEP & LOCKER ALCOVES',
    twistRule: 'Every 28s the vintage PA chime rings, triggering a high-speed hallway sweep. Duck into classroom alcoves immediately until the bell finishes!',
    description: 'Endless rows of olive-green metal lockers, polished hardwood floors, and empty classrooms. A distant PA bell chimes with hollow resonance.',
    objective: 'Collect the Master Keycard from Room 108, find the Principal\'s code memo in the trophy display, and enter the code at the Gymnasium Fire Door Padlock.',
    mapWidth: 16,
    mapHeight: 16,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Room 108 Keycard at [14, 1]
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1], // Trophy display memo at [3, 7]
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 3, 0, 1, 0, 0, 0, 0, 0, 1], // Gym fire door terminal at [7, 13]
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 2, 1], // Exit door at [14, 14]
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 14, y: 14 },
    terminalPosition: { x: 7, y: 13 },
    entities: [
      {
        id: 'smiler_4_1',
        type: 'smiler',
        name: 'The Hall Monitor',
        x: 5.5,
        y: 5.5,
        angle: 0,
        speed: 0.032,
        chaseSpeed: 0.058,
        patrolPoints: [
          { x: 5.5, y: 5.5 },
          { x: 9.5, y: 5.5 },
          { x: 9.5, y: 9.5 },
          { x: 5.5, y: 9.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.8,
        hearingDistance: 6.5,
        attackDistance: 0.88,
        description: 'A shadowy silhouette lurking between locker alcoves with a broad luminescent smile.',
        mechanicHint: 'Running steps alert it across hallways. Flashlight beam temporarily disorients it.',
      },
    ],
    items: [
      {
        id: 'keycard_4_1',
        type: 'keycard',
        name: 'Room 108 Master Keycard',
        x: 14.5,
        y: 1.5,
        color: '#eab308',
      },
      {
        id: 'battery_4_1',
        type: 'battery',
        name: 'Alkaline Battery Cell',
        x: 1.5,
        y: 13.5,
        color: '#10b981',
      },
      {
        id: 'note_4_1',
        type: 'note',
        name: 'Trophy Display Case Notice',
        x: 3.5,
        y: 7.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage4_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage4_1',
        title: 'Meadowbrook High Custodial Directive',
        date: 'Nov 14, 1991',
        author: 'Vice Principal Vance',
        content: `Due to recent vandalism, the East Wing gymnasium fire exit has been secured with a heavy digital combo padlock.
The code for all faculty and custodial staff is 3-8-5-2.

Strict reminder: No running in the hallways. Heavy footsteps echo violently down the locker corridors and draw whatever stalks the empty classrooms after the bell rings.`,
        hint: 'Gymnasium Fire Padlock Code: 3852. Do not sprint near locker corridors.',
      },
    ],
    puzzleConfig: {
      type: 'hotel_keypad',
      initialState: {
        type: 'hotel_keypad',
        enteredCode: '',
        correctCode: '3852',
        clueHint: 'Principal Memo: Fire Exit Padlock code is 3-8-5-2.',
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#3d3424',
      ambientIntensity: 0.40,
      lightFlickerRate: 0.06,
      flashlightRange: 8.0,
      fogDistance: 10.0,
    },
  },

  // ==========================================
  // STAGE 5: Luminal Corporate Suites (Level 5 - The Office)
  // ==========================================
  {
    id: 5,
    levelNumber: 5,
    name: 'Level 5: Luminal Corporate Suites',
    subtitle: 'The Dilapidated Office Maze',
    theme: 'office',
    difficultyLabel: 'Eerie Isolation',
    ambientDreadRate: 0.08,
    twistTitle: 'DESK TELEPHONE DECOYS & PERIMETER MANAGER',
    twistRule: 'Unplugged rotary phones ring in cubicles. Click or press [E] on ringing phones to lure the Dilapidated Manager away from Server Room access corridors!',
    description: 'Monotonous gray cubicle partitions, water-stained ceiling tiles, flickering fluorescent troffers, and dead CRT monitors. An unplugged office telephone rings in an empty cubicle.',
    objective: 'Locate the Executive Memo in the Corner Office [North-East], acquire the Server Room access code, and enter the password at the Server Room Terminal [South].',
    mapWidth: 16,
    mapHeight: 16,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 3, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 14, y: 14 },
    terminalPosition: { x: 7, y: 13 },
    entities: [
      {
        id: 'shade_office_1',
        type: 'shade',
        name: 'The Overtime Worker',
        x: 5.5,
        y: 5.5,
        angle: 0,
        speed: 0.03,
        chaseSpeed: 0.054,
        patrolPoints: [
          { x: 5.5, y: 5.5 },
          { x: 10.5, y: 5.5 },
          { x: 10.5, y: 9.5 },
          { x: 5.5, y: 9.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.2,
        hearingDistance: 5.8,
        attackDistance: 0.85,
        description: 'A shadowy silhouette in a rumpled corporate suit and tie, perpetually wandering between cubicle partitions.',
        mechanicHint: 'It listens for the click of flashlight switches and heavy running. Crouch low behind cubicle walls to slip past.',
      },
      {
        id: 'stalker_office_2',
        type: 'stalker',
        name: 'The Dilapidated Manager',
        x: 12.5,
        y: 7.5,
        angle: Math.PI,
        speed: 0.033,
        chaseSpeed: 0.056,
        patrolPoints: [
          { x: 12.5, y: 7.5 },
          { x: 14.5, y: 7.5 },
          { x: 14.5, y: 11.5 },
          { x: 12.5, y: 11.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.5,
        hearingDistance: 5.2,
        attackDistance: 0.85,
        description: 'A swift, tall apparition stalking the perimeter filing cabinet corridors.',
        mechanicHint: 'Avoid long straight line of sight corridors. Break eye contact around cubicle corners.',
      },
    ],
    items: [
      {
        id: 'battery_office_1',
        type: 'battery',
        name: 'Industrial D-Cell Battery',
        x: 1.5,
        y: 11.5,
        color: '#10b981',
      },
      {
        id: 'battery_office_2',
        type: 'battery',
        name: 'Emergency 9V Cell',
        x: 14.5,
        y: 11.5,
        color: '#10b981',
      },
      {
        id: 'note_office_1',
        type: 'note',
        name: 'Executive Corner Desk Memo',
        x: 14.5,
        y: 1.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage_office_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage_office_1',
        title: 'Luminal Corp - Shift Override Protocol',
        date: 'October 12, 1993',
        author: 'Operations Director Hastings',
        content: `To all personnel remaining after 6:00 PM:
The automated electronic fire doors have locked down the floor. The server room bypass terminal code is set to 6 - 1 - 9 - 4.

Please disregard any colleague standing motionless at the photocopy machine in the dark. Do not attempt to speak to them, and do not let your heels click against the carpet tiles.`,
        hint: 'Server Room Override Code: 6194. Do not sprint near cubicle aisles.',
      },
    ],
    puzzleConfig: {
      type: 'hotel_keypad',
      initialState: {
        type: 'hotel_keypad',
        enteredCode: '',
        correctCode: '6194',
        clueHint: 'Hastings Memo: Server Room Override Code is 6-1-9-4.',
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#2b271f',
      ambientIntensity: 0.38,
      lightFlickerRate: 0.08,
      flashlightRange: 8.0,
      fogDistance: 9.5,
    },
  },

  // ==========================================
  // STAGE 6: Corridor 404 (Level 6 - The Hotel)
  // ==========================================
  {
    id: 6,
    levelNumber: 6,
    name: 'Level 6: Corridor 404',
    subtitle: 'The Infinite Grand Hotel',
    theme: 'hotel',
    difficultyLabel: 'High Paranoia',
    ambientDreadRate: 0.09,
    twistTitle: 'DOOR TRANSLOCATION & LANTERN GAZE',
    twistRule: 'The Concierge steps between numbered room doors. Direct eye contact with his swinging amber lantern drains your sanity rapidly. Avert your gaze to the carpet!',
    description: 'Crimson damask wallpaper and endless rows of brass-numbered doors. A rotary telephone rings in an empty alcove.',
    objective: 'Answer the ringing telephone, decode the bellhop desk cipher, and enter the code into the Service Elevator Padlock.',
    mapWidth: 16,
    mapHeight: 16,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 3, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 14, y: 14 },
    terminalPosition: { x: 7, y: 13 },
    entities: [
      {
        id: 'shade_5_1',
        type: 'shade',
        name: 'The Night Concierge',
        x: 5.5,
        y: 5.5,
        angle: 0,
        speed: 0.03,
        chaseSpeed: 0.052,
        patrolPoints: [
          { x: 5.5, y: 5.5 },
          { x: 9.5, y: 5.5 },
          { x: 9.5, y: 9.5 },
          { x: 5.5, y: 9.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.5,
        hearingDistance: 5.5,
        attackDistance: 0.85,
        description: 'A towering silhouette wearing a crimson pillbox hat, holding a swinging amber lantern.',
        mechanicHint: 'Its lantern sweeps corridors. Duck into door alcoves or break line of sight when you hear the chime.',
      },
      {
        id: 'shade_5_2',
        type: 'shade',
        name: 'The Wandering Bellhop',
        x: 12.5,
        y: 3.5,
        angle: Math.PI,
        speed: 0.032,
        chaseSpeed: 0.055,
        patrolPoints: [
          { x: 12.5, y: 3.5 },
          { x: 14.5, y: 3.5 },
          { x: 14.5, y: 7.5 },
          { x: 12.5, y: 7.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.0,
        hearingDistance: 5.0,
        attackDistance: 0.85,
        description: 'Second entity patrolling the south guest wing.',
        mechanicHint: 'Listen for footsteps on carpet. Keep flashlight turned off around corners.',
      },
    ],
    items: [
      {
        id: 'battery_5_1',
        type: 'battery',
        name: 'Heavy Duty 9V Battery',
        x: 14.5,
        y: 1.5,
        color: '#10b981',
      },
      {
        id: 'battery_5_2',
        type: 'battery',
        name: 'Spare Alkaline Cell',
        x: 1.5,
        y: 13.5,
        color: '#10b981',
      },
      {
        id: 'note_5_1',
        type: 'note',
        name: 'Front Desk Dispatch Tape',
        x: 5.5,
        y: 7.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage5_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage5_1',
        title: 'Front Desk Night Audit Note - Room 404',
        date: 'Sept 4, 1989',
        author: 'Night Clerk',
        content: `Guest in 404 left in a hurry. The service elevator keycode is linked to the ringing telephone recording.
The four digits correspond to:
[1st: Number of dead bells (7)]
[2nd: Floor level minus 2 (2)]
[3rd: Non-existent room last digit (4)]
[4th: Final departure hour (9)]

Code to elevator gate: 7 - 2 - 4 - 9.
Beware the concierges on rounds; extinguish your beam if you spot amber lantern light reflecting off the wallpaper.`,
        hint: 'Elevator Padlock Keycode: 7249',
      },
    ],
    puzzleConfig: {
      type: 'hotel_keypad',
      initialState: {
        type: 'hotel_keypad',
        enteredCode: '',
        correctCode: '7249',
        clueHint: '7249 (From Front Desk Memo)',
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#5c171e',
      ambientIntensity: 0.4,
      lightFlickerRate: 0.12,
      flashlightRange: 7.5,
      fogDistance: 8.0,
    },
  },

  // ==========================================
  // STAGE 7: Sub-Basement Pipe Dreams (Level 7 - Tunnels)
  // ==========================================
  {
    id: 7,
    levelNumber: 7,
    name: 'Level 7: Sub-Basement Pipe Dreams',
    subtitle: 'The Steam Conduit Tunnels',
    theme: 'tunnels',
    difficultyLabel: 'Severe Hazard',
    ambientDreadRate: 0.12,
    twistTitle: 'STEAM PURGE CYCLES & SEISMIC SENSORS',
    twistRule: 'Entity 27 tracks seismic footstep vibrations—sprinting reveals your location. High-pressure steam purges blind its optical sensors every 24s. Use steam clouds to cross open corridors!',
    description: 'Damp industrial concrete tunnels crisscrossed with boiling steam pipes. Red emergency strobe lights cast rhythmic crimson pulses against hazard stripes.',
    objective: 'Scavenge the 2 industrial high-voltage fuses from the dark dead-ends, then rotate the power conduits at the Substation to open the Blast Vault.',
    mapWidth: 16,
    mapHeight: 16,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 14, y: 14 },
    terminalPosition: { x: 11, y: 13 },
    entities: [
      {
        id: 'stalker_6',
        type: 'stalker',
        name: 'The Stalker (Entity 27)',
        x: 3.5,
        y: 5.5,
        angle: 0,
        speed: 0.038,
        chaseSpeed: 0.062,
        patrolPoints: [
          { x: 3.5, y: 5.5 },
          { x: 7.5, y: 5.5 },
          { x: 7.5, y: 9.5 },
          { x: 3.5, y: 9.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 7.0,
        hearingDistance: 6.5,
        attackDistance: 0.9,
        description: 'A terrifyingly agile biomechanical horror with an incandescent crimson sensor eye.',
        mechanicHint: 'Extremely fast. If spotted, turn corners quickly to break line of sight and preserve stamina for short bursts.',
      },
    ],
    items: [
      {
        id: 'fuse_6_1',
        type: 'fuse',
        name: 'High-Voltage Ceramic Fuse 1',
        x: 14.5,
        y: 1.5,
        color: '#f59e0b',
      },
      {
        id: 'fuse_6_2',
        type: 'fuse',
        name: 'High-Voltage Ceramic Fuse 2',
        x: 1.5,
        y: 13.5,
        color: '#f59e0b',
      },
      {
        id: 'battery_6_1',
        type: 'battery',
        name: 'Heavy Duty Cell',
        x: 9.5,
        y: 3.5,
        color: '#10b981',
      },
      {
        id: 'note_6_1',
        type: 'note',
        name: 'Maintenance Technician Tape',
        x: 3.5,
        y: 7.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage6_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage6_1',
        title: 'Emergency Substation Override Procedure',
        date: 'Log #1084',
        author: 'Mechanic Kowalski',
        content: `Entity 27 is loose in Section C. It is attracted to direct flashlight glare and heavy footsteps.
To unlock the hydraulic blast door, collect the 2 backup fuses and re-route the 3x3 conduit power grid at Station 4.
Align each rotary conduit until continuous green energy flows from the top input terminal to the bottom output breaker.`,
        hint: 'Collect 2 Fuses and rotate the 3x3 conduits to form a continuous connection.',
      },
    ],
    puzzleConfig: {
      type: 'wire_conduits',
      initialState: {
        type: 'wire_conduits',
        // 3x3 grid rotation states (0, 1, 2, 3 = 0, 90, 180, 270 deg)
        grid: [1, 2, 0, 3, 1, 2, 0, 1, 3],
        types: [
          'corner', 'straight', 'corner',
          'straight', 'cross', 'straight',
          'corner', 'straight', 'corner',
        ],
        sourceIndex: 0,
        targetIndex: 8,
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#3a3d40',
      ambientIntensity: 0.35,
      lightFlickerRate: 0.18,
      flashlightRange: 7.0,
      fogDistance: 7.5,
    },
  },

  // ==========================================
  // STAGE 8: The Final Threshold (Level 8 - The Void Loop)
  // ==========================================
  {
    id: 8,
    levelNumber: 8,
    name: 'Level 8: The Final Threshold',
    subtitle: 'The Non-Euclidean Loop',
    theme: 'void',
    difficultyLabel: 'Maximum Anomaly',
    ambientDreadRate: 0.16,
    twistTitle: 'DIMENSIONAL GLITCH TEARS & REALITY PHASE',
    twistRule: 'Space-time fractures every 18s. The Resonance Static phases out of reality and shifts locations during glitch surges. Synchronize the Altar to breach the loop!',
    description: 'The architecture begins to collapse into non-Euclidean angles and chromatic static. Beyond the final threshold lies the warmth of real daylight.',
    objective: 'Evade the twin entities stalking the perimeter, align the 4 Resonance Frequencies at the Threshold Altar, and break out into reality!',
    mapWidth: 16,
    mapHeight: 16,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1], // Open archway at cols 7 & 8 to altar
      [1, 0, 0, 0, 0, 0, 1, 3, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1], // Open archway at cols 7 & 8 to altar
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 14, y: 14 },
    terminalPosition: { x: 7, y: 7 },
    entities: [
      {
        id: 'glitch_7_1',
        type: 'glitch',
        name: 'The Resonance Static',
        x: 5.5,
        y: 5.5,
        angle: Math.PI,
        speed: 0.038,
        chaseSpeed: 0.065,
        patrolPoints: [
          { x: 5.5, y: 5.5 },
          { x: 10.5, y: 5.5 },
          { x: 10.5, y: 10.5 },
          { x: 5.5, y: 10.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 7.5,
        hearingDistance: 6.5,
        attackDistance: 0.95,
        description: 'An erratic shimmering distortion causing heavy audio-visual static interference.',
        mechanicHint: 'Its static intensifies when looking at it. Keep moving and do not linger in intersections.',
      },
      {
        id: 'smiler_7_2',
        type: 'smiler',
        name: 'The Void Stalker',
        x: 3.5,
        y: 3.5,
        angle: 0,
        speed: 0.034,
        chaseSpeed: 0.058,
        patrolPoints: [
          { x: 3.5, y: 3.5 },
          { x: 12.5, y: 3.5 },
          { x: 12.5, y: 12.5 },
          { x: 3.5, y: 12.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.8,
        hearingDistance: 5.8,
        attackDistance: 0.9,
        description: 'A swift, aggressive variant of the Level 0 lurker.',
        mechanicHint: 'Flashlight stun duration is cut in half. Use safe zones near columns to regain stamina.',
      },
    ],
    items: [
      {
        id: 'battery_7_1',
        type: 'battery',
        name: 'High Capacity Cell',
        x: 14.5,
        y: 1.5,
        color: '#10b981',
      },
      {
        id: 'battery_7_2',
        type: 'battery',
        name: 'Emergency Cell',
        x: 1.5,
        y: 13.5,
        color: '#10b981',
      },
      {
        id: 'note_7_1',
        type: 'note',
        name: 'Last Transmission Log',
        x: 7.5,
        y: 5.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage7_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage7_1',
        title: 'Final Transmission from The Boundary',
        date: 'TRANSMISSION RECEIVED',
        author: 'Unknown Traveler',
        content: `I can see it. Real sunlight pouring through the rift at the end of the void corridor.
The altar in the center requires matching the 4 dimensional harmonic pulses in exact sequence.
Once you replicate the acoustic sequence, the threshold collapse reverses and the heavy iron blast door unlocks to reality.
Do not stop running once the door opens.`,
        hint: 'Memorize and replicate the 4 frequency tones on the Threshold Altar.',
      },
    ],
    puzzleConfig: {
      type: 'resonance_matrix',
      initialState: {
        type: 'resonance_matrix',
        sequence: [0, 2, 1, 3], // 4 frequency pulses
        playerSequence: [],
        currentIndex: 0,
        showingSequence: false,
        solved: false,
      },
    },
    lighting: {
      ambientColor: '#101014',
      ambientIntensity: 0.28,
      lightFlickerRate: 0.22,
      flashlightRange: 8.0,
      fogDistance: 8.0,
    },
  },
];
