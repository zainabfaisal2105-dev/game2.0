/**
 * Pause Menu & Liminal Entities Dossier
 * Sleek Interface theme with refined glassmorphism, glowing accent borders,
 * and high-contrast typography.
 */

import React, { useState } from 'react';
import { GameSettings, StageConfig } from '../types';
import { STAGES } from '../data/stages';
import {
  Volume2,
  VolumeX,
  Compass,
  ShieldAlert,
  Play,
  RotateCcw,
  Sliders,
  HelpCircle,
  X,
  FastForward,
} from 'lucide-react';

interface PauseMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: StageConfig;
  settings: GameSettings;
  onUpdateSettings: (s: GameSettings) => void;
  onRestartLevel: () => void;
  onSelectStage: (stageId: number) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onClose,
  currentStage,
  settings,
  onUpdateSettings,
  onRestartLevel,
  onSelectStage,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'entities' | 'settings' | 'stages'>('guide');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 text-slate-200">
      <div className="relative w-full max-w-2xl bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-black/50 border-b border-white/10">
          <div>
            <div className="text-[10px] text-yellow-500 font-mono font-bold tracking-widest uppercase">
              SURVIVAL PROTOCOL // SYSTEM PAUSED
            </div>
            <h1 className="text-xl font-light italic tracking-tight text-white/90">
              {currentStage.name} &bull; {currentStage.subtitle}
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/30 px-6 py-2.5 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white/15 border-white/30 text-white font-medium shadow-[0_0_12px_rgba(255,255,255,0.06)]'
                : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> CONTROLS & MANUAL
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider cursor-pointer ${
              activeTab === 'entities'
                ? 'bg-white/15 border-white/30 text-white font-medium shadow-[0_0_12px_rgba(255,255,255,0.06)]'
                : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> ENTITY DOSSIER
          </button>
          <button
            onClick={() => setActiveTab('stages')}
            className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider cursor-pointer ${
              activeTab === 'stages'
                ? 'bg-white/15 border-white/30 text-white font-medium shadow-[0_0_12px_rgba(255,255,255,0.06)]'
                : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" /> STAGES ({STAGES.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white/15 border-white/30 text-white font-medium shadow-[0_0_12px_rgba(255,255,255,0.06)]'
                : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> SETTINGS
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                <h3 className="font-bold text-yellow-400 uppercase tracking-widest font-mono text-xs">
                  OPERATIONAL KEYBINDINGS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 text-slate-300">
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      ↑ / ↓
                    </span>
                    Move Forward / Move Backward
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      ← / →
                    </span>
                    Turn Camera Left / Turn Right (Smooth Look)
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      W / A / S / D
                    </span>
                    Walk / Strafe Left / Back / Strafe Right
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      MOUSE
                    </span>
                    Drag to Look Around (or toggle Lock Mouse)
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      SHIFT
                    </span>
                    Sprint / Strafe with Arrow Keys
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      C
                    </span>
                    Crouch / Stealth (Silent in water)
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      F
                    </span>
                    Toggle Flashlight Beam
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      E / SPACE
                    </span>
                    Interact (Terminals, Notes, Items)
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      R
                    </span>
                    Reload Flashlight with Spare Battery
                  </div>
                  <div>
                    <span className="text-white font-bold font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded mr-2">
                      ESC
                    </span>
                    Unlock Mouse Cursor / Pause Menu
                  </div>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-xl border-l-2 border-yellow-500/50 border-y border-r border-white/10 p-4 rounded-r-xl space-y-2 text-white/80">
                <h4 className="font-bold text-yellow-400 font-mono text-xs uppercase tracking-wider">
                  SURVIVAL DIRECTIVES
                </h4>
                <p>
                  1. <strong>Corridor Entities:</strong> Each sector hosts distinctive anomalies with
                  unique behavioral instincts (light sensitivity, echolocation, patrolling paths).
                </p>
                <p>
                  2. <strong>Stage Puzzles:</strong> Heavy magnetic doors and blast locks are sealed.
                  Explore the corridors, recover required components (fuses, valve wheels), inspect
                  terminals, and solve the riddle.
                </p>
                <p>
                  3. <strong>Psychological Dread:</strong> Lingering in darkness or being stalked
                  amplifies dread, degrading visibility and elevating heartbeat frequency.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-yellow-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>1. The Lurker (Mono-Yellow Backrooms)</span>
                  <span className="text-[10px] text-yellow-300 font-bold px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/30">TWIST: BLINDING SPOTLIGHT</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Appears in dark intersections with a gaping luminescent grin. Freezes and retreats
                  when spotlighted by the flashlight beam. Do NOT turn your back and sprint; back away slowly into open corridors.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>2. The Murmur Hound (The Submerged Baths)</span>
                  <span className="text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/30">TWIST: ACOUSTIC WATER DECOY</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  100% blind aquatic crawler! Has no eyes and relies purely on acoustic ripples. Sprinting creates loud water splashes that lure it from across the baths. Crouch to wade silently. While crouched, press [F] to drop an acoustic water ripple decoy to lure it away!
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-fuchsia-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>3. The Display Mannequin (Sunset Galleria Mall)</span>
                  <span className="text-[10px] text-fuchsia-300 font-bold px-2 py-0.5 rounded bg-fuchsia-400/10 border border-fuchsia-400/30">TWIST: GENERATOR BROWNOUT</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Quantum weeping angel! Freezes solid when directly observed in your field of view. However, every ~22 seconds the mall generator suffers a brownout surge, causing a 2.6-second blackout where it can move freely even if you look at it!
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>4. The Orderly (Ward 4 Hospital)</span>
                  <span className="text-[10px] text-emerald-300 font-bold px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/30">TWIST: PHOTOPHOBIC RAGE</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Reverse-Smiler! Flashlight light enrages the Orderly into a shrieking charge. Keep your flashlight extinguished [F] and navigate by green emergency signage to slip past undetected. Listen to the cardiac ECG monitor beeps to judge his proximity!
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-amber-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>5. The Hall Monitor (Meadowbrook School)</span>
                  <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">TWIST: PA BELL SWEEP</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Every 28 seconds the PA school bell rings, triggering a high-speed hallway sweep. Standing in corridors will get you caught immediately. Duck into classroom alcoves or crouch beneath desks until the bell chime fades.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-slate-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>6. The Overtime Worker (Corporate Office)</span>
                  <span className="text-[10px] text-slate-300 font-bold px-2 py-0.5 rounded bg-white/10 border border-white/30">TWIST: RINGING DESK PHONES</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  The Manager guards the Server Room junction. When a rotary desk telephone rings in the cubicle bays, approach and press [E] to answer it, luring the Manager to the phone for 12 seconds to clear your path!
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-rose-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>7. The Bellhop Shade (Corridor 404 Hotel)</span>
                  <span className="text-[10px] text-rose-300 font-bold px-2 py-0.5 rounded bg-rose-400/10 border border-rose-400/30">TWIST: ELEVATOR TRANSLOCATION</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  A brass elevator chime signals the Concierge stepping through Room 404 doors to translocate across wings. Warning: staring directly into the swinging amber lantern light rapidly drains your psychological sanity—look down at the carpet to avert your gaze!
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-red-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>8. The Stalker - Entity 27 (Concrete Tunnels)</span>
                  <span className="text-[10px] text-red-300 font-bold px-2 py-0.5 rounded bg-red-400/10 border border-red-400/30">TWIST: BOILER STEAM PURGES</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Tracks seismic vibrations; sprinting alerts it immediately. However, high-pressure boiler valves cycle every 24 seconds, releasing blinding steam clouds that scramble optical sensors. Use the steam purge window to sprint across central pipe junctions!
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-violet-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>9. The Resonance Static (The Final Threshold)</span>
                  <span className="text-[10px] text-violet-300 font-bold px-2 py-0.5 rounded bg-violet-400/10 border border-violet-400/30">TWIST: DIMENSIONAL GLITCH TEARS</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Space-time tears open every 18 seconds, phasing entities between dimensions and scrambling reality. Coordinate harmonic resonance frequencies at the central Altar while entities are phased out to escape the liminal backrooms once and for all!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="space-y-2.5">
              <div className="text-white/50 text-xs mb-1 font-mono">
                Select any sector to jump directly into that liminal environment:
              </div>
              {STAGES.map((st) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    st.id === currentStage.id
                      ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-200'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-light italic text-white text-sm">{st.name}</div>
                    <div className="text-[11px] text-white/50 font-mono mt-0.5">
                      {st.subtitle} &bull; Difficulty:{' '}
                      <span className="text-yellow-400 font-bold">{st.difficultyLabel}</span>
                    </div>
                    {st.twistTitle && (
                      <div className="text-[10px] text-amber-400/90 font-mono mt-1 flex items-center gap-1.5">
                        <span className="bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30 uppercase">
                          TWIST
                        </span>
                        <span>{st.twistTitle}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onSelectStage(st.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-mono font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                  >
                    {st.id === currentStage.id ? 'RESTART' : 'JUMP TO SECTOR'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Sound Volume Slider */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="flex items-center gap-2 text-white/90">
                    <Volume2 className="w-4 h-4 text-yellow-400" /> MASTER AUDIO VOLUME
                  </span>
                  <span className="text-yellow-400 font-bold">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, masterVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* Mouse Sensitivity */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white/90">MOUSE LOOK SENSITIVITY</span>
                  <span className="text-yellow-400 font-bold">
                    {settings.mouseSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      mouseSensitivity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* VHS Overlay Toggle */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-white/90">
                    ANAMORPHIC CAMCORDER FILTER
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    Scanlines, recording telemetry, and grain distortion
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({ ...settings, vhsOverlay: !settings.vhsOverlay })
                  }
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                    settings.vhsOverlay
                      ? 'bg-blue-600/30 border-blue-400/50 text-blue-200 shadow-[0_0_10px_rgba(96,165,250,0.3)]'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {settings.vhsOverlay ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-black/50 border-t border-white/10 flex justify-between items-center">
          <button
            onClick={() => {
              onRestartLevel();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RESTART SECTOR
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-mono font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> RESUME GAME
          </button>
        </div>
      </div>
    </div>
  );
};
