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
                <div className="text-yellow-400 font-mono font-bold text-xs uppercase tracking-wider">
                  1. The Lurker (Mono-Yellow Backrooms)
                </div>
                <p className="text-white/70 leading-relaxed">
                  Appears in dark intersections with a gaping luminescent grin. Freezes and retreats
                  when spotlighted by the flashlight. Do NOT turn your back and sprint; back away slowly.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-blue-400 font-mono font-bold text-xs uppercase tracking-wider">
                  2. The Murmur Hound (The Submerged Baths)
                </div>
                <p className="text-white/70 leading-relaxed">
                  Quadrupedal aquatic crawler. Nearly blind, but possesses acute acoustic echolocation.
                  Loud water splashes from sprinting will draw it from across the poolrooms. Crouch
                  to move silently.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-rose-400 font-mono font-bold text-xs uppercase tracking-wider">
                  3. The Bellhop Shade (Corridor 404 Hotel)
                </div>
                <p className="text-white/70 leading-relaxed">
                  Tall uniformed entity carrying a swinging amber lantern. Breaks off pursuit if you
                  duck into room alcoves and extinguish your light before it sweeps the corridor.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                <div className="text-red-400 font-mono font-bold text-xs uppercase tracking-wider">
                  4. The Stalker - Entity 27 (Concrete Tunnels)
                </div>
                <p className="text-white/70 leading-relaxed">
                  Fast, relentless mechanical predator. Turns corners aggressively. Break line of
                  sight around 90-degree pipe junctions immediately upon hearing its metallic scrape.
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
