/**
 * Game Over Screen - Static Distortion & Entity Intercept
 * Sleek Interface theme with refined red warning luminescence, glassmorphism,
 * and high-contrast typography.
 */

import React from 'react';
import { Entity, StageConfig } from '../types';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  stage: StageConfig;
  entity: Entity | null;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stage,
  entity,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300 font-mono text-slate-200">
      {/* Glitch Subtle Scanlines */}
      <div className="absolute inset-0 bg-repeat-y opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,0,0,0)_50%,_rgba(255,0,0,0.2)_50%)] bg-[length:100%_4px]" />

      <div className="relative w-full max-w-lg bg-[#0c0c0c]/95 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.25)] text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-red-500 tracking-[0.3em] uppercase font-bold font-mono">
            SIGNAL INTERRUPTED // ANOMALY BREACH
          </div>
          <h1 className="text-2xl sm:text-3xl font-light italic tracking-tight text-white/95">
            CAPTURED IN THE CORRIDOR
          </h1>
          <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
            Intercepted by{' '}
            <span className="text-red-400 font-bold">
              {entity ? entity.name : 'an unknown anomaly'}
            </span>{' '}
            in {stage.name}. Physical presence has dissolved into the liminal space.
          </p>
        </div>

        {/* Survival Tip Card matching Sleek Objective style */}
        {entity && (
          <div className="bg-black/60 backdrop-blur-xl border-l-2 border-red-500/50 border-y border-r border-white/10 p-4 rounded-r-xl text-left text-xs text-white/80 space-y-1">
            <span className="font-bold text-red-400 uppercase tracking-wider block text-[10px] font-mono">
              TACTICAL SURVIVAL RECALL:
            </span>
            <p className="leading-relaxed">{entity.mechanicHint}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-red-600/25 hover:bg-red-600/40 text-red-100 font-bold text-xs tracking-widest uppercase rounded-xl border border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            <RotateCcw className="w-4 h-4" /> RETRY THIS SECTOR
          </button>
        </div>
      </div>
    </div>
  );
};
