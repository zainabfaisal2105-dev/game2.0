/**
 * Victory / Stage Complete Modal
 * Sleek Interface theme with luminous accents, glassmorphic stats cards,
 * and high-contrast typography.
 */

import React from 'react';
import { StageConfig } from '../types';
import { Sun, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  stage: StageConfig;
  isGameComplete: boolean;
  timeSpentSeconds: number;
  onNextStage: () => void;
  onRestartGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stage,
  isGameComplete,
  timeSpentSeconds,
  onNextStage,
  onRestartGame,
}) => {
  const mins = Math.floor(timeSpentSeconds / 60);
  const secs = timeSpentSeconds % 60;
  const formattedTime = `${mins}m ${secs.toString().padStart(2, '0')}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300 font-mono text-slate-200">
      <div
        className={`relative w-full max-w-lg rounded-2xl p-8 text-center space-y-6 bg-[#0c0c0c]/95 backdrop-blur-2xl border ${
          isGameComplete
            ? 'border-yellow-400/40 shadow-[0_0_50px_rgba(250,204,21,0.25)]'
            : 'border-emerald-400/40 shadow-[0_0_40px_rgba(52,211,153,0.2)]'
        }`}
      >
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto ${
            isGameComplete
              ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
              : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
          }`}
        >
          {isGameComplete ? (
            <Sun className="w-8 h-8 animate-spin" />
          ) : (
            <CheckCircle2 className="w-8 h-8" />
          )}
        </div>

        <div className="space-y-2">
          <div
            className={`text-[10px] tracking-[0.3em] uppercase font-bold font-mono ${
              isGameComplete ? 'text-yellow-400' : 'text-emerald-400'
            }`}
          >
            {isGameComplete ? 'THRESHOLD COLLAPSED // REALITY RESTORED' : 'SECTOR EXFILTRATED'}
          </div>

          <h1 className="text-2xl sm:text-3xl font-light italic tracking-tight text-white/95">
            {isGameComplete ? 'YOU BROKE THE LIMINAL LOOP' : `COMPLETED: ${stage.name}`}
          </h1>

          <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
            {isGameComplete
              ? 'Warm natural sunlight strikes your face. The endless flickering fluorescents, humming yellow walls, and echoing footsteps dissolve into the ether.'
              : `Navigated corridor anomalies, resolved sector terminal logic, and bypassed security seals to the next layer.`}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-black/60 border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-white/40 block text-[10px] uppercase tracking-wider mb-0.5">
              TIME ELAPSED
            </span>
            <span className="text-white font-bold">{formattedTime}</span>
          </div>
          <div>
            <span className="text-white/40 block text-[10px] uppercase tracking-wider mb-0.5">
              ENTITIES EVADED
            </span>
            <span className="text-emerald-400 font-bold">{stage.entities.length} Detected</span>
          </div>
        </div>

        <div className="pt-2">
          {isGameComplete ? (
            <button
              onClick={onRestartGame}
              className="w-full py-3.5 bg-yellow-400/25 hover:bg-yellow-400/35 text-yellow-100 font-bold text-xs tracking-widest uppercase rounded-xl border border-yellow-400/50 shadow-[0_0_25px_rgba(250,204,21,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN FROM LEVEL 0
            </button>
          ) : (
            <button
              onClick={onNextStage}
              className="w-full py-3.5 bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-100 font-bold text-xs tracking-widest uppercase rounded-xl border border-emerald-400/50 shadow-[0_0_25px_rgba(52,211,153,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              DESCEND TO NEXT SECTOR <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
