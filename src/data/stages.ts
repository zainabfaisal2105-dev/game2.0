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
    description: 'You awaken on damp yellow carpet. The air smells like wet wool, and the 60Hz fluorescent hum fills your ears with persistent dread.',
    objective: 'Locate the spare electrical fuse in the corner office, then access the Breaker Box to power the Exit Door.',
    mapWidth: 14,
    mapHeight: 14,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Open doorway at col 10 connecting north corridor to fuse office
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1], // Open doorway at cols 5 & 6 to access Breaker Terminal
      [1, 0, 0, 0, 1, 3, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 0, 1],
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
        x: 8.5,
        y: 7.5,
        angle: Math.PI,
        speed: 0.025,
        chaseSpeed: 0.048,
        patrolPoints: [
          { x: 8.5, y: 7.5 },
          { x: 8.5, y: 9.5 },
          { x: 5.5, y: 9.5 },
          { x: 3.5, y: 9.5 },
          { x: 3.5, y: 7.5 },
          { x: 3.5, y: 5.5 },
          { x: 8.5, y: 5.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 5.5,
        hearingDistance: 4.5,
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
        description: 'A pale, hunched quadruped that creeps through submerged corridors. It has poor vision but razor-sharp acoustic tracking.',
        mechanicHint: 'Sprinting creates loud water splashes that alert it from across corridors. Crouch or walk slowly when nearby.',
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
  // STAGE 2: Corridor 404 (Level 2 - The Hotel)
  // ==========================================
  {
    id: 2,
    levelNumber: 2,
    name: 'Level 2: Corridor 404',
    subtitle: 'The Infinite Grand Hotel',
    theme: 'hotel',
    difficultyLabel: 'High Paranoia',
    ambientDreadRate: 0.09,
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
      [1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1], // Open doorway at cols 7 & 8 to elevator terminal
      [1, 0, 0, 0, 0, 0, 1, 3, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerSpawn: { x: 1.5, y: 1.5, angle: 0 },
    exitPosition: { x: 14, y: 14 },
    terminalPosition: { x: 7, y: 13 },
    entities: [
      {
        id: 'shade_2_1',
        type: 'shade',
        name: 'The Night Concierge',
        x: 7.5,
        y: 3.5,
        angle: 0,
        speed: 0.03,
        chaseSpeed: 0.052,
        patrolPoints: [
          { x: 7.5, y: 3.5 },
          { x: 1.5, y: 3.5 },
          { x: 1.5, y: 9.5 },
          { x: 7.5, y: 9.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 6.5,
        hearingDistance: 5.5,
        attackDistance: 0.85,
        description: 'A towering silhouette wearing a crimson pillbox hat, holding a swinging amber lantern.',
        mechanicHint: 'Its lantern sweeps corridors. Duck into door alcoves or break line of sight when you hear the chime.',
      },
      {
        id: 'shade_2_2',
        type: 'shade',
        name: 'The Wandering Bellhop',
        x: 13.5,
        y: 7.5,
        angle: Math.PI,
        speed: 0.032,
        chaseSpeed: 0.055,
        patrolPoints: [
          { x: 13.5, y: 7.5 },
          { x: 9.5, y: 7.5 },
          { x: 9.5, y: 13.5 },
          { x: 13.5, y: 13.5 },
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
        id: 'battery_2_1',
        type: 'battery',
        name: 'Heavy Duty 9V Battery',
        x: 14.5,
        y: 1.5,
        color: '#10b981',
      },
      {
        id: 'battery_2_2',
        type: 'battery',
        name: 'Spare Alkaline Cell',
        x: 1.5,
        y: 13.5,
        color: '#10b981',
      },
      {
        id: 'note_2_1',
        type: 'note',
        name: 'Front Desk Dispatch Tape',
        x: 5.5,
        y: 7.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage2_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage2_1',
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
  // STAGE 3: Sub-Basement Pipe Dreams (Level 3 - Tunnels)
  // ==========================================
  {
    id: 3,
    levelNumber: 3,
    name: 'Level 3: Sub-Basement Pipe Dreams',
    subtitle: 'The Steam Conduit Tunnels',
    theme: 'tunnels',
    difficultyLabel: 'Severe Hazard',
    ambientDreadRate: 0.12,
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
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
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
        id: 'stalker_3',
        type: 'stalker',
        name: 'The Stalker (Entity 27)',
        x: 10.5,
        y: 7.5,
        angle: 0,
        speed: 0.038,
        chaseSpeed: 0.062,
        patrolPoints: [
          { x: 10.5, y: 7.5 },
          { x: 12.5, y: 7.5 },
          { x: 12.5, y: 9.5 },
          { x: 7.5, y: 11.5 },
          { x: 4.5, y: 11.5 },
          { x: 4.5, y: 9.5 },
          { x: 7.5, y: 5.5 },
          { x: 10.5, y: 5.5 },
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
        id: 'fuse_3_1',
        type: 'fuse',
        name: 'High-Voltage Ceramic Fuse 1',
        x: 14.5,
        y: 1.5,
        color: '#f59e0b',
      },
      {
        id: 'fuse_3_2',
        type: 'fuse',
        name: 'High-Voltage Ceramic Fuse 2',
        x: 1.5,
        y: 13.5,
        color: '#f59e0b',
      },
      {
        id: 'battery_3_1',
        type: 'battery',
        name: 'Heavy Duty Cell',
        x: 9.5,
        y: 3.5,
        color: '#10b981',
      },
      {
        id: 'note_3_1',
        type: 'note',
        name: 'Maintenance Technician Tape',
        x: 3.5,
        y: 7.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage3_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage3_1',
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
  // STAGE 4: The Final Threshold (Level 4 - The Void Loop)
  // ==========================================
  {
    id: 4,
    levelNumber: 4,
    name: 'Level 4: The Final Threshold',
    subtitle: 'The Non-Euclidean Loop',
    theme: 'void',
    difficultyLabel: 'Maximum Anomaly',
    ambientDreadRate: 0.16,
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
      [1, 0, 0, 1, 0, 0, 1, 3, 0, 1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
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
        id: 'glitch_4_1',
        type: 'glitch',
        name: 'The Resonance Static',
        x: 13.5,
        y: 3.5,
        angle: Math.PI,
        speed: 0.038,
        chaseSpeed: 0.065,
        patrolPoints: [
          { x: 13.5, y: 3.5 },
          { x: 13.5, y: 13.5 },
          { x: 8.5, y: 13.5 },
          { x: 8.5, y: 3.5 },
        ],
        currentPatrolIdx: 0,
        detectionDistance: 7.5,
        hearingDistance: 6.5,
        attackDistance: 0.95,
        description: 'An erratic shimmering distortion causing heavy audio-visual static interference.',
        mechanicHint: 'Its static intensifies when looking at it. Keep moving and do not linger in intersections.',
      },
      {
        id: 'smiler_4_2',
        type: 'smiler',
        name: 'The Void Stalker',
        x: 3.5,
        y: 13.5,
        angle: 0,
        speed: 0.034,
        chaseSpeed: 0.058,
        patrolPoints: [
          { x: 3.5, y: 13.5 },
          { x: 3.5, y: 3.5 },
          { x: 7.5, y: 3.5 },
          { x: 7.5, y: 13.5 },
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
        id: 'battery_4_1',
        type: 'battery',
        name: 'High Capacity Cell',
        x: 14.5,
        y: 1.5,
        color: '#10b981',
      },
      {
        id: 'battery_4_2',
        type: 'battery',
        name: 'Emergency Cell',
        x: 1.5,
        y: 13.5,
        color: '#10b981',
      },
      {
        id: 'note_4_1',
        type: 'note',
        name: 'Last Transmission Log',
        x: 7.5,
        y: 5.5,
        color: '#fef3c7',
        metadata: { noteId: 'note_stage4_1' },
      },
    ],
    notes: [
      {
        id: 'note_stage4_1',
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
