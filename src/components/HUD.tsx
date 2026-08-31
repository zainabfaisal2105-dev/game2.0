/**
 * Sleek Interface - HUD & Atmospheric Overlay
 * Refined glassmorphic HUD with glowing stat bars, minimal typography,
 * camera telemetry, objective dossier, inventory slots, and radar sensor.
 */

import React, { useEffect, useState } from 'react';
import { PlayerState, StageConfig, Entity, WorldItem } from '../types';
import {
  Battery,
  BatteryCharging,
  Zap,
  Eye,
  Footprints,
  Compass,
  FileText,
  Volume2,
  VolumeX,
  MapPin,
  ShieldAlert,
  MousePointer,
  Lock,
  Unlock,
  Move,
  Maximize2,
  Minimize2,
  Navigation,
  Target,
  AlertTriangle,
} from 'lucide-react';

interface HUDProps {
  player: PlayerState;
  stage: StageConfig;
  entities: Entity[];
  items: WorldItem[];
  interactionTarget: {
    type: 'door' | 'terminal' | 'item' | 'none';
    doorUnlocked?: boolean;
    item?: WorldItem;
  };
  doorUnlocked: boolean;
  onUseBattery: () => void;
  onToggleFlashlight: () => void;
  soundMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenLatestNote?: () => void;
  isMouseLocked: boolean;
  onToggleMouseLock: () => void;
  onInteract?: () => void;
  twistBanner?: {
    active: boolean;
    type: string;
    title: string;
    message: string;
  };
  isSonarActive?: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  stage,
  entities,
  items,
  interactionTarget,
  doorUnlocked,
  onUseBattery,
  onToggleFlashlight,
  soundMuted,
  onToggleMute,
  onOpenSettings,
  onOpenLatestNote,
  isMouseLocked,
  onToggleMouseLock,
  onInteract,
  twistBanner,
  isSonarActive,
}) => {
  const [timeString, setTimeString] = useState<string>('03:42:15 AM');
  const [recBlink, setRecBlink] = useState<boolean>(true);

  // VHS telemetry clock & blink indicator
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTimeString(d.toLocaleTimeString());
      setRecBlink((b) => !b);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate nearest entity distance for warning sensor
  let nearestEntityDist = 999;
  let nearestEntity: Entity | null = null;
  for (const ent of entities) {
    const dx = ent.x - player.x;
    const dy = ent.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < nearestEntityDist) {
      nearestEntityDist = dist;
      nearestEntity = ent;
    }
  }

  const isEntityNear = nearestEntityDist < 6.5;
  const isChasing = nearestEntity?.state === 'chase';

  // Sanity is inversely proportional to dread (0 dread = 100 sanity)
  const sanityPercent = Math.max(0, Math.min(100, Math.round(100 - player.dread)));

  const [isRadarExpanded, setIsRadarExpanded] = useState<boolean>(false);

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden text-slate-200">
      {/* 1. Sleek Interface Vignette & Subtle Scanline Textures */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.7) 120%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 2px)',
        }}
      />

      {/* 2. Dread / Stress Red Vignette when paranoia rises */}
      {player.dread > 25 && (
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, transparent 35%, rgba(140, 10, 20, 0.4) 80%, rgba(10, 0, 0, 0.92) 100%)',
            opacity: Math.min(1.0, (player.dread - 25) / 50),
          }}
        />
      )}

      {/* 3. Entity Proximity Glitch Static Edge Line */}
      {isEntityNear && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-red-500/80 shadow-[0_0_12px_#ef4444] animate-pulse pointer-events-none"
          style={{ opacity: Math.max(0.25, (7 - nearestEntityDist) / 7) }}
        />
      )}

      {/* 4. Sleek Top Header Bar */}
      <header className="relative z-10 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
        {/* Left: Telemetry REC, Stage Name, Coordinates */}
        <div className="space-y-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div
              className={`w-2 h-2 rounded-full bg-red-600 ${
                recBlink ? 'opacity-100 shadow-[0_0_8px_#ef4444]' : 'opacity-30'
              }`}
            />
            <span className="text-xs font-mono tracking-widest uppercase text-red-500">
              REC [STAGE 0{stage.id + 1}] &bull; {timeString}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight italic text-white/95">
            {stage.name}
          </h1>

          <p className="text-[11px] font-mono text-white/40 tracking-tight uppercase">
            Coordinates: {(41.8781 + player.x * 0.001).toFixed(4)}° N,{' '}
            {(87.6298 + player.y * 0.001).toFixed(4)}° W // Layer: {stage.subtitle}
          </p>

          {stage.twistTitle && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-mono tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>TWIST: {stage.twistTitle}</span>
            </div>
          )}
        </div>

        {/* Center: Tactical Compass Ribbon with Real-Time Waypoint Tracking */}
        <div className="pointer-events-auto">
          <TacticalCompassRibbon
            player={player}
            stage={stage}
            items={items}
            doorUnlocked={doorUnlocked}
          />
        </div>

        {/* Right: Glassmorphic Capsule with Sleek Stat Bars & Quick Actions */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-lg border border-white/10 p-3 sm:p-4 rounded-xl flex items-center space-x-5 sm:space-x-7 shadow-2xl">
            {/* Sanity Meter */}
            <div className="text-center">
              <div className="flex items-center justify-between gap-3 text-[10px] text-white/50 uppercase tracking-widest mb-1 font-mono">
                <span>Sanity</span>
                <span className="text-white/80 font-mono">{sanityPercent}%</span>
              </div>
              <div className="w-24 sm:w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 transition-all duration-300 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                  style={{ width: `${sanityPercent}%` }}
                />
              </div>
            </div>

            {/* Battery Meter */}
            <div className="text-center">
              <div className="flex items-center justify-between gap-3 text-[10px] text-white/50 uppercase tracking-widest mb-1 font-mono">
                <span>Battery</span>
                <span className="text-white/80 font-mono">
                  {Math.round(player.flashlightBattery)}%
                </span>
              </div>
              <div className="w-24 sm:w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    player.flashlightBattery > 25
                      ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                      : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)] animate-pulse'
                  }`}
                  style={{ width: `${player.flashlightBattery}%` }}
                />
              </div>
            </div>

            {/* Stamina Meter */}
            <div className="text-center hidden sm:block">
              <div className="flex items-center justify-between gap-3 text-[10px] text-white/50 uppercase tracking-widest mb-1 font-mono">
                <span>Stamina</span>
                <span className="text-white/80 font-mono">{Math.round(player.stamina)}%</span>
              </div>
              <div className="w-24 sm:w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-100 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  style={{ width: `${player.stamina}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Controls Bar */}
          <div className="flex items-center gap-2">
            {/* Flashlight Toggle */}
            <button
              onClick={onToggleFlashlight}
              className={`px-3 py-1.5 border rounded-lg text-[10px] uppercase tracking-widest font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                player.isFlashlightOn
                  ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.2)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60'
              }`}
              title="Toggle Flashlight [F]"
            >
              <Zap className="w-3 h-3" />
              <span>LIGHT: {player.isFlashlightOn ? 'ON' : 'OFF'} [F]</span>
            </button>

            {/* Mouse Look Mode Toggle */}
            <button
              onClick={onToggleMouseLock}
              className={`px-3 py-1.5 border rounded-lg text-[10px] uppercase tracking-widest font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                isMouseLocked
                  ? 'bg-yellow-400/25 border-yellow-400/60 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.25)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-white/70 hover:text-white'
              }`}
              title={
                isMouseLocked
                  ? 'Click or press [ESC] to unlock cursor'
                  : 'Lock mouse for 360° FPS look, or drag canvas'
              }
            >
              {isMouseLocked ? (
                <Lock className="w-3 h-3 text-yellow-400" />
              ) : (
                <MousePointer className="w-3 h-3 text-white/70" />
              )}
              <span>{isMouseLocked ? 'MOUSE: LOCKED' : 'LOCK MOUSE'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Toggle Audio"
            >
              {soundMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white/80" />
              )}
            </button>

            {/* Pause / Guide Button */}
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer"
            >
              MENU [ESC]
            </button>
          </div>
        </div>
      </header>

      {/* Active Mouse Lock Top Banner */}
      {isMouseLocked && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2.5 px-4 py-1.5 bg-black/85 backdrop-blur-xl border border-yellow-400/50 rounded-full shadow-[0_0_25px_rgba(250,204,21,0.3)] animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] animate-ping" />
          <span className="text-[11px] font-mono text-yellow-300">
            FPS MOUSE ACTIVE &bull; Press{' '}
            <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded font-bold text-white">
              ESC
            </kbd>{' '}
            to show cursor
          </span>
          <button
            onClick={onToggleMouseLock}
            className="ml-2 px-3 py-0.5 bg-yellow-400/20 hover:bg-yellow-400/35 border border-yellow-400/60 rounded-full text-[10px] text-yellow-200 font-bold font-mono transition-colors cursor-pointer"
          >
            UNLOCK MOUSE
          </button>
        </div>
      )}

      {/* 5. Center Sleek Reticle & Interaction Display */}
      <main className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* Sleek Vertical Accent Lines */}
        <div className="w-[1px] h-16 sm:h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        {/* Center Targeting Reticle Ring */}
        <div
          className={`relative w-14 h-14 rounded-full border flex flex-col items-center justify-center transition-all ${
            interactionTarget.type !== 'none'
              ? 'border-white/80 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-110'
              : 'border-white/20'
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              interactionTarget.type !== 'none'
                ? 'bg-yellow-300 shadow-[0_0_8px_#fde047]'
                : 'bg-white/80 shadow-[0_0_6px_white]'
            }`}
          />
        </div>

        {/* Interaction Prompt Tag - ONLY visible when facing a valid interactable */}
        {interactionTarget.type !== 'none' && (
          (interactionTarget.type === 'item' && interactionTarget.item) ||
          interactionTarget.type === 'terminal' ||
          (interactionTarget.type === 'door' && doorUnlocked)
        ) ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInteract?.();
            }}
            className="mt-3 pointer-events-auto px-4 py-2 bg-black/85 hover:bg-black active:scale-95 border border-yellow-400/60 hover:border-yellow-400 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 cursor-pointer transition-all"
          >
            <span className="px-1.5 py-0.5 bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-mono font-bold rounded text-[10px]">
              [E] / CLICK
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-100">
              {interactionTarget.type === 'item' && interactionTarget.item && (
                <>COLLECT {interactionTarget.item.name}</>
              )}
              {interactionTarget.type === 'terminal' && <>ACCESS TERMINAL PUZZLE</>}
              {interactionTarget.type === 'door' && doorUnlocked && (
                <span className="text-emerald-400 font-bold">
                  CROSS THRESHOLD TO ESCAPE
                </span>
              )}
            </span>
          </button>
        ) : null}

        <div className="w-[1px] h-16 sm:h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        {/* Pursuit Alert Banner */}
        {isChasing && (
          <div className="mt-4 bg-black/80 px-4 py-2 rounded-xl border border-red-900/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
            <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest font-bold">
              !! ANOMALOUS ENTITY PURSUIT DETECTED // BREAK LINE OF SIGHT !!
            </p>
          </div>
        )}

        {/* Dynamic Stage Twist Alert Banner */}
        {twistBanner?.active && (
          <div className="mt-3 max-w-lg bg-black/90 px-4 py-2.5 rounded-xl border border-rose-500/70 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse text-center">
            <p className="text-rose-400 font-mono text-[11px] uppercase tracking-widest font-bold">
              {twistBanner.title}
            </p>
            <p className="text-white/85 font-sans text-xs mt-0.5">
              {twistBanner.message}
            </p>
          </div>
        )}
      </main>

      {/* 6. Bottom Row: Active Objective, Inventory Slots, Anomaly Alert & Radar */}
      <footer className="relative z-10 p-4 sm:p-7 flex flex-col md:flex-row justify-between items-end gap-4">
        {/* Left: Active Objective Card & Inventory Grid */}
        <div className="w-72 sm:w-88 space-y-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {/* Active Objective Box */}
          <div className="bg-black/65 backdrop-blur-xl border-l-2 border-yellow-500/60 border-y border-r border-white/10 p-4 rounded-r-xl shadow-2xl space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Target className="w-3 h-3 text-yellow-400" />
                Active Mission Directive
              </p>
              {stage.id === 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Valves: {player.inventory.valveWheels}/2
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-white/85">
              {doorUnlocked ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Threshold Breached! Head through the illuminated sluice gate.
                </span>
              ) : stage.id === 1 ? (
                player.inventory.valveWheels >= 2 ? (
                  <span className="text-amber-300">
                    Both Valve Wheels Secured! Head to the Main Pump Terminal in the South Hallway to equalize pressure and drain the gate.
                  </span>
                ) : player.inventory.valveWheels === 1 ? (
                  <span className="text-white/85">
                    1/2 Valves secured! Locate the remaining Valve Wheel marked on your radar.
                  </span>
                ) : (
                  <span className="text-white/85">
                    Locate the 2 Valve Wheels: <strong className="text-amber-300">Valve A</strong> in Northeast Alcove and <strong className="text-amber-300">Valve B</strong> in Southwest Sluice.
                  </span>
                )
              ) : (
                stage.objective
              )}
            </p>

            {/* Stage Twist Protocol Box */}
            {stage.twistTitle && (
              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>{stage.twistTitle}</span>
                </div>
                <p className="text-[11px] font-sans text-white/70 leading-snug">
                  {stage.twistRule}
                </p>
              </div>
            )}

            {/* Stage 1 Checklist Tracker */}
            {stage.id === 1 && !doorUnlocked && (
              <div className="pt-1.5 space-y-1 border-t border-white/10 text-[10px] font-mono">
                <div className={`flex items-center justify-between ${player.inventory.valveWheels >= 1 ? 'text-emerald-400' : 'text-amber-300/90'}`}>
                  <span>&bull; Valve Wheel A (Northeast Alcove [Top-Right])</span>
                  <span>{items.find(i => i.id === 'valve_1_1')?.collected ? '✓ RETRIEVED' : 'RADAR: [V]'}</span>
                </div>
                <div className={`flex items-center justify-between ${player.inventory.valveWheels >= 2 ? 'text-emerald-400' : 'text-amber-300/90'}`}>
                  <span>&bull; Valve Wheel B (Southwest Sluice [Bottom-Left])</span>
                  <span>{items.find(i => i.id === 'valve_1_2')?.collected ? '✓ RETRIEVED' : 'RADAR: [V]'}</span>
                </div>
                <div className={`flex items-center justify-between ${player.inventory.valveWheels >= 2 ? 'text-cyan-300' : 'text-white/40'}`}>
                  <span>&bull; Pump Terminal (South Hallway)</span>
                  <span>{player.inventory.valveWheels >= 2 ? 'RADAR: [T] READY' : 'REQUIRES WHEELS'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sleek Inventory Slots Grid */}
          <div className="grid grid-cols-4 gap-2 opacity-90 pointer-events-auto">
            {/* Battery Slot */}
            <button
              onClick={onUseBattery}
              disabled={player.inventory.batteries <= 0 || player.flashlightBattery >= 95}
              className={`aspect-square bg-white/5 border rounded-xl flex flex-col items-center justify-center p-1 text-[10px] backdrop-blur-md transition-all ${
                player.inventory.batteries > 0
                  ? 'border-yellow-400/40 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer'
                  : 'border-white/10 text-white/40'
              }`}
              title="Click or press [R] to reload battery"
            >
              <BatteryCharging className="w-4 h-4 mb-0.5" />
              <span className="font-mono text-[9px]">BATT</span>
              <span className="font-mono font-bold text-[10px]">
                x{player.inventory.batteries}
              </span>
            </button>

            {/* Fuse Slot */}
            <div
              className={`aspect-square bg-white/5 border rounded-xl flex flex-col items-center justify-center p-1 text-[10px] backdrop-blur-md transition-all ${
                player.inventory.fuses > 0
                  ? 'border-blue-400/40 text-blue-300'
                  : 'border-white/10 text-white/40'
              }`}
            >
              <Zap className="w-4 h-4 mb-0.5" />
              <span className="font-mono text-[9px]">FUSE</span>
              <span className="font-mono font-bold text-[10px]">x{player.inventory.fuses}</span>
            </div>

            {/* Valve Slot */}
            <div
              className={`aspect-square bg-white/5 border rounded-xl flex flex-col items-center justify-center p-1 text-[10px] backdrop-blur-md transition-all ${
                player.inventory.valveWheels > 0
                  ? 'border-amber-400/50 text-amber-300 bg-amber-500/10'
                  : 'border-white/10 text-white/40'
              }`}
            >
              <Compass className="w-4 h-4 mb-0.5 text-amber-400" />
              <span className="font-mono text-[9px]">VALVE</span>
              <span className="font-mono font-bold text-[10px]">
                x{player.inventory.valveWheels}
              </span>
            </div>

            {/* Survivor Note Logs Slot */}
            <button
              onClick={onOpenLatestNote}
              disabled={player.inventory.notesRead.length === 0}
              className={`aspect-square bg-white/5 border rounded-xl flex flex-col items-center justify-center p-1 text-[10px] backdrop-blur-md transition-all ${
                player.inventory.notesRead.length > 0
                  ? 'border-amber-400/40 text-amber-300 hover:border-amber-400 hover:bg-amber-400/10 cursor-pointer'
                  : 'border-white/10 text-white/40'
              }`}
              title="Click to view recovered survivor logs"
            >
              <FileText className="w-4 h-4 mb-0.5" />
              <span className="font-mono text-[9px]">LOGS</span>
              <span className="font-mono font-bold text-[10px]">
                x{player.inventory.notesRead.length}
              </span>
            </button>
          </div>
        </div>

        {/* Center: Sleek Navigational Guide Pill */}
        <div className="hidden md:flex flex-col items-center gap-1.5 pb-2 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-black/65 backdrop-blur-xl border border-white/15 rounded-xl text-[11px] font-mono text-white/70 shadow-2xl">
            <span className="text-white/40 uppercase tracking-wider text-[9px] font-bold">Move:</span>
            <span className="text-yellow-400 font-bold font-mono">W S</span>
            <span className="text-white/30">/</span>
            <span className="text-yellow-400 font-bold font-mono">↑ ↓</span>
            <span className="text-white/20 px-0.5">&bull;</span>
            <span className="text-white/40 uppercase tracking-wider text-[9px] font-bold">Look:</span>
            <span className="text-cyan-300 font-medium font-mono">Mouse</span>
            <span className="text-white/30">/</span>
            <span className="text-cyan-300 font-medium font-mono">A & D or ← →</span>
          </div>
          <p className="text-[10px] text-white/40 font-mono tracking-tight">
            {interactionTarget.type !== 'none' && (
              <span className="text-yellow-400 font-bold mr-1.5 animate-pulse">[E] Interact &bull;</span>
            )}
            [F] Flashlight &bull; [R] Battery &bull; [Shift] Sprint
          </p>
        </div>

        {/* Right: Radar Frequency Card & System Metadata */}
        <div className="flex flex-col items-end gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {/* Anomaly Detection Banner */}
          {isEntityNear && (
            <div className="bg-black/80 px-4 py-2 rounded-xl border border-red-900/60 shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                {isChasing ? '!! ANOMALY PURSUIT IN PROGRESS !!' : 'ANOMALY DETECTED IN PROXIMITY'}
              </p>
            </div>
          )}

          {/* Radar Scanner Container with Expand / Minimize toggle */}
          <div
            className={`bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl pointer-events-auto transition-all duration-200 ${
              isRadarExpanded ? 'w-64 sm:w-72' : 'w-56'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-white/50 uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-cyan-400" />
                Radar: Frequency Lock
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={
                    doorUnlocked
                      ? 'text-emerald-400 font-bold'
                      : isEntityNear
                      ? 'text-rose-400 font-bold animate-pulse'
                      : 'text-white/40'
                  }
                >
                  {doorUnlocked ? 'EXIT OPEN' : isEntityNear ? 'ALERT' : 'ACTIVE'}
                </span>
                <button
                  onClick={() => setIsRadarExpanded((v) => !v)}
                  className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors cursor-pointer"
                  title={isRadarExpanded ? 'Minimize Radar' : 'Expand Radar'}
                >
                  {isRadarExpanded ? (
                    <Minimize2 className="w-3 h-3 text-cyan-300" />
                  ) : (
                    <Maximize2 className="w-3 h-3 text-white/60" />
                  )}
                </button>
              </div>
            </div>

            {/* Radar Canvas Surface */}
            <MinimapView
              player={player}
              stage={stage}
              entities={entities}
              items={items}
              doorUnlocked={doorUnlocked}
              isExpanded={isRadarExpanded}
            />

            {/* Radar Legend */}
            <div className="flex items-center justify-between text-[8px] font-mono text-white/40 mt-2 px-1 pt-1.5 border-t border-white/5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#f59e0b]" />
                [V] Valve
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]" />
                [T] Terminal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_#ef4444]" />
                Hostile
              </span>
            </div>
          </div>

          {/* System Version Metadata */}
          <div className="text-right">
            <p className="text-[10px] text-white/20 font-mono">SYSTEM VERSION 1.3-TACTICAL</p>
            <p className="text-[10px] text-white/20 font-mono">
              PROCEED WITH CAUTION. DO NOT LOOK BACK.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/**
 * Tactical Top-Center Compass Ribbon
 * Features real-time player heading degrees, cardinal ticks, and dynamic objective azimuth markers
 */
const TacticalCompassRibbon: React.FC<{
  player: PlayerState;
  stage: StageConfig;
  items: WorldItem[];
  doorUnlocked: boolean;
}> = ({ player, stage, items, doorUnlocked }) => {
  // Normalize player angle to [0, 360)
  const deg = (((player.angle * 180) / Math.PI) % 360 + 360) % 360;
  const roundedDeg = Math.round(deg);

  let cardinal = 'N';
  if (roundedDeg >= 23 && roundedDeg < 68) cardinal = 'NE';
  else if (roundedDeg >= 68 && roundedDeg < 113) cardinal = 'E';
  else if (roundedDeg >= 113 && roundedDeg < 158) cardinal = 'SE';
  else if (roundedDeg >= 158 && roundedDeg < 203) cardinal = 'S';
  else if (roundedDeg >= 203 && roundedDeg < 248) cardinal = 'SW';
  else if (roundedDeg >= 248 && roundedDeg < 293) cardinal = 'W';
  else if (roundedDeg >= 293 && roundedDeg < 338) cardinal = 'NW';

  // Gather mission waypoints
  interface Waypoint {
    id: string;
    label: string;
    dist: number;
    relAngle: number;
    type: 'valve' | 'fuse' | 'keycard' | 'terminal' | 'exit';
  }

  const waypoints: Waypoint[] = [];

  // Items
  for (const it of items) {
    if (it.collected) continue;
    const dx = it.x - player.x;
    const dy = it.y - player.y;
    const dist = Math.hypot(dx, dy);
    const targetAngle = Math.atan2(dy, dx);
    let rel = targetAngle - player.angle;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;

    let label = it.name;
    let type: 'valve' | 'fuse' | 'keycard' = 'valve';
    if (it.type === 'valve_wheel') {
      label = it.id === 'valve_1_1' ? 'VALVE A' : 'VALVE B';
      type = 'valve';
    } else if (it.type === 'fuse') {
      label = 'FUSE';
      type = 'fuse';
    } else if (it.type === 'keycard') {
      label = 'KEYCARD';
      type = 'keycard';
    }

    waypoints.push({
      id: it.id,
      label,
      dist,
      relAngle: rel,
      type,
    });
  }

  // Terminal
  if (stage.terminalPosition && !doorUnlocked) {
    const dx = stage.terminalPosition.x + 0.5 - player.x;
    const dy = stage.terminalPosition.y + 0.5 - player.y;
    const dist = Math.hypot(dx, dy);
    const targetAngle = Math.atan2(dy, dx);
    let rel = targetAngle - player.angle;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;

    waypoints.push({
      id: 'term',
      label: stage.id === 1 ? 'PUMP TERMINAL' : 'TERMINAL',
      dist,
      relAngle: rel,
      type: 'terminal',
    });
  }

  // Exit
  if (stage.exitPosition) {
    const dx = stage.exitPosition.x + 0.5 - player.x;
    const dy = stage.exitPosition.y + 0.5 - player.y;
    const dist = Math.hypot(dx, dy);
    const targetAngle = Math.atan2(dy, dx);
    let rel = targetAngle - player.angle;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;

    waypoints.push({
      id: 'exit',
      label: doorUnlocked ? 'SLUICE GATE (OPEN)' : 'EXIT GATE',
      dist,
      relAngle: rel,
      type: 'exit',
    });
  }

  return (
    <div className="flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
      {/* Compass Ribbon Tube */}
      <div className="relative w-64 sm:w-88 h-9 bg-black/65 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center">
        {/* Center reticle hairline */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-yellow-400 shadow-[0_0_8px_#facc15] z-30 pointer-events-none" />
        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[5px] border-b-yellow-400 z-30" />

        {/* Dynamic Waypoint Badges */}
        {waypoints.map((wp) => {
          // Angle range visible on ribbon: -1.3 rad to +1.3 rad (~75 deg FOV)
          const fov = 1.35;
          const isVisible = Math.abs(wp.relAngle) <= fov;
          const clamped = Math.max(-fov, Math.min(fov, wp.relAngle));
          const leftPercent = 50 + (clamped / fov) * 44;
          const isCentered = Math.abs(wp.relAngle) < 0.15;

          return (
            <div
              key={wp.id}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-all duration-75 ${
                isCentered ? 'scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'scale-95'
              } ${
                !isVisible ? 'opacity-40' : 'opacity-100'
              } ${
                wp.type === 'valve'
                  ? 'bg-amber-950/80 border border-amber-400 text-amber-300'
                  : wp.type === 'terminal'
                  ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300'
                  : wp.type === 'exit'
                  ? doorUnlocked
                    ? 'bg-emerald-950/80 border border-emerald-400 text-emerald-300 animate-pulse'
                    : 'bg-rose-950/70 border border-rose-500 text-rose-300'
                  : 'bg-blue-950/80 border border-blue-400 text-blue-300'
              }`}
              style={{ left: `${leftPercent}%` }}
            >
              <span className="font-bold">{wp.label}</span>
              <span className="text-[8px] opacity-80">[{wp.dist.toFixed(0)}m]</span>
            </div>
          );
        })}
      </div>

      {/* Heading label */}
      <div className="text-[10px] font-mono text-white/50 tracking-widest mt-1">
        AZIMUTH: <span className="text-yellow-400 font-bold">{roundedDeg}°</span> &bull;{' '}
        <span className="text-white/80 font-bold">{cardinal}</span>
      </div>
    </div>
  );
};

/**
 * Clean Minimap Radar View with smooth real-time tracking
 */
const MinimapView: React.FC<{
  player: PlayerState;
  stage: StageConfig;
  entities: Entity[];
  items: WorldItem[];
  doorUnlocked: boolean;
  isExpanded?: boolean;
}> = ({ player, stage, entities, items, doorUnlocked, isExpanded = false }) => {
  const map = stage.map;
  const w = stage.mapWidth;
  const h = stage.mapHeight;
  const cellSize = isExpanded ? 11 : 7.5; // pixels per cell

  return (
    <div
      className="relative bg-black/70 border border-white/10 overflow-hidden rounded-xl mx-auto shadow-inner transition-all duration-200"
      style={{ width: w * cellSize, height: h * cellSize }}
    >
      {/* Map grid tiles */}
      {map.map((row, y) =>
        row.map((cell, x) => {
          let bg = 'bg-white/[0.02]';
          if (cell === 1) bg = 'bg-white/15';
          else if (cell === 2)
            bg = doorUnlocked
              ? 'bg-emerald-400/80 shadow-[0_0_8px_#34d399] animate-pulse'
              : 'bg-rose-700/60';
          else if (cell === 3) bg = 'bg-cyan-500/70';

          return (
            <div
              key={`${x}-${y}`}
              className={`absolute ${bg}`}
              style={{
                left: x * cellSize,
                top: y * cellSize,
                width: cellSize,
                height: cellSize,
              }}
            />
          );
        })
      )}

      {/* Objective / Item Blips with Rich Visibility */}
      {items.map((it) => {
        if (it.collected) return null;
        const isValve = it.type === 'valve_wheel';
        const isFuse = it.type === 'fuse';
        const isBattery = it.type === 'battery';

        return (
          <div
            key={it.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group/item cursor-pointer"
            style={{
              left: it.x * cellSize,
              top: it.y * cellSize,
            }}
          >
            {isValve ? (
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping" />
                <div className="w-3 h-3 rounded-full bg-amber-400 border border-red-600 shadow-[0_0_8px_#f59e0b] flex items-center justify-center">
                  <span className="text-[7px] font-black text-red-950 leading-none">V</span>
                </div>
              </div>
            ) : isFuse ? (
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 border border-white/80 shadow-[0_0_6px_#60a5fa] flex items-center justify-center">
                <span className="text-[6px] font-black text-black leading-none">F</span>
              </div>
            ) : isBattery ? (
              <div className="w-2 h-2 rounded-full bg-emerald-400 border border-emerald-200 shadow-[0_0_6px_#34d399]" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-amber-200 border border-amber-400 shadow-[0_0_5px_#fef3c7]" />
            )}

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-5 opacity-0 group-hover/item:opacity-100 transition-opacity bg-black/95 px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap text-amber-300 font-mono pointer-events-none z-30 border border-amber-500/40 shadow-xl">
              {it.name}
            </div>
          </div>
        );
      })}

      {/* Terminal Marker */}
      {stage.terminalPosition && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group/term"
          style={{
            left: (stage.terminalPosition.x + 0.5) * cellSize,
            top: (stage.terminalPosition.y + 0.5) * cellSize,
          }}
        >
          <div className="w-3 h-3 rounded bg-blue-600 border border-cyan-400 text-cyan-100 flex items-center justify-center text-[7px] font-black shadow-[0_0_6px_#06b6d4]">
            T
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 opacity-0 group-hover/term:opacity-100 transition-opacity bg-black/95 px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap text-cyan-300 font-mono pointer-events-none z-30 border border-cyan-500/40 shadow-xl">
            {stage.id === 1 ? 'Hydro Pump Terminal' : 'Terminal Interface'}
          </div>
        </div>
      )}

      {/* Real-time Entity Blips (Always accurately positioned without distance filtering) */}
      {entities.map((ent) => {
        const isChasing = ent.state === 'chase';
        const isStunned = ent.state === 'stunned';

        return (
          <div
            key={ent.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/ent"
            style={{
              left: ent.x * cellSize,
              top: ent.y * cellSize,
            }}
          >
            {/* Pulsing hazard halo */}
            <div
              className={`absolute -inset-1 rounded-full ${
                isChasing ? 'bg-rose-500/60 animate-ping' : 'bg-amber-500/30 animate-pulse'
              }`}
            />
            {/* Core beacon dot */}
            <div
              className={`relative w-2.5 h-2.5 rounded-full border border-white/90 shadow-md ${
                isChasing
                  ? 'bg-rose-600 shadow-[0_0_8px_#f43f5e]'
                  : isStunned
                  ? 'bg-yellow-400 shadow-[0_0_6px_#facc15]'
                  : 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
              }`}
            />
            {/* Entity Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-5 opacity-0 group-hover/ent:opacity-100 transition-opacity bg-black/95 px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap text-rose-300 font-mono pointer-events-none z-30 border border-rose-500/40 shadow-xl">
              {ent.name} [{ent.state.toUpperCase()}]
            </div>
          </div>
        );
      })}

      {/* Player Arrow Indicator */}
      <div
        className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 z-30"
        style={{
          left: player.x * cellSize,
          top: player.y * cellSize,
        }}
      >
        <div
          className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[7px] border-b-yellow-400 shadow-[0_0_8px_#facc15]"
          style={{ transform: `rotate(${player.angle + Math.PI / 2}rad)` }}
        />
      </div>
    </div>
  );
};
