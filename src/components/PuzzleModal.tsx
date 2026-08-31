/**
 * Interactive Puzzle Terminal Modal
 * Sleek Interface theme with glassmorphic cards, luminous indicators,
 * precision borders, and high-contrast typography.
 */

import React, { useState } from 'react';
import {
  ActivePuzzle,
  BreakerPuzzleState,
  HydroPuzzleState,
  HotelKeypadPuzzleState,
  WireConduitPuzzleState,
  ResonanceMatrixPuzzleState,
  PlayerState,
} from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Zap, Activity, PhoneCall, Radio, CheckCircle2, X, AlertTriangle, Wrench } from 'lucide-react';

interface PuzzleModalProps {
  puzzle: ActivePuzzle;
  player: PlayerState;
  onSolve: () => void;
  onClose: () => void;
  onUpdateInventory: (inv: PlayerState['inventory']) => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  player,
  onSolve,
  onClose,
  onUpdateInventory,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c0c0c]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden text-slate-200 font-mono">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-white/10">
          <div className="flex items-center gap-2.5 text-yellow-400 font-bold tracking-wider text-xs uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] animate-pulse" />
            INTERFACE TERMINAL // OVERRIDE LOGIC
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Puzzle Body */}
        <div className="p-6">
          {puzzle.type === 'breaker_box' && (
            <BreakerBoxView
              state={puzzle}
              player={player}
              onSolve={onSolve}
              onUpdateInventory={onUpdateInventory}
            />
          )}

          {puzzle.type === 'hydro_valves' && (
            <HydroValvesView
              state={puzzle}
              player={player}
              onSolve={onSolve}
              onUpdateInventory={onUpdateInventory}
            />
          )}

          {puzzle.type === 'hotel_keypad' && (
            <HotelKeypadView state={puzzle} onSolve={onSolve} />
          )}

          {puzzle.type === 'wire_conduits' && (
            <WireConduitsView state={puzzle} onSolve={onSolve} />
          )}

          {puzzle.type === 'resonance_matrix' && (
            <ResonanceMatrixView state={puzzle} onSolve={onSolve} />
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1. BREAKER BOX (STAGE 0)
// ==========================================
const BreakerBoxView: React.FC<{
  state: BreakerPuzzleState;
  player: PlayerState;
  onSolve: () => void;
  onUpdateInventory: (inv: PlayerState['inventory']) => void;
}> = ({ state, player, onSolve, onUpdateInventory }) => {
  const [switches, setSwitches] = useState<boolean[]>([...state.switches]);
  const [fusesInstalled, setFusesInstalled] = useState<boolean[]>([...state.fusesInstalled]);
  const [message, setMessage] = useState<string>('Mount ceramic fuse cartridge & set circuit toggles.');

  const toggleSwitch = (idx: number) => {
    soundEngine.playPuzzleClick();
    const next = [...switches];
    next[idx] = !next[idx];
    setSwitches(next);
    checkSolution(next, fusesInstalled);
  };

  const installFuse = () => {
    if (player.inventory.fuses <= 0) {
      soundEngine.playPuzzleClick();
      setMessage('NO SPARE FUSE IN INVENTORY. Search corridor annexes.');
      return;
    }
    soundEngine.playDoorUnlocked();
    const nextFuses = [true];
    setFusesInstalled(nextFuses);
    onUpdateInventory({
      ...player.inventory,
      fuses: player.inventory.fuses - 1,
    });
    setMessage('20A Ceramic Fuse mounted into Slot 1.');
    checkSolution(switches, nextFuses);
  };

  const checkSolution = (curSwitches: boolean[], curFuses: boolean[]) => {
    const fuseReady = curFuses.every((f) => f);
    const switchesMatch = curSwitches.every((s, i) => s === state.targetSwitches[i]);

    if (fuseReady && switchesMatch) {
      soundEngine.playDoorUnlocked();
      setMessage('CIRCUIT ENERGIZED. MAGNETIC EXIT SEAL DISENGAGED.');
      setTimeout(() => {
        onSolve();
      }, 1000);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-black/60 backdrop-blur-xl border-l-2 border-yellow-500/50 border-y border-r border-white/10 p-4 rounded-r-xl text-xs space-y-1 text-white/80">
        <div className="flex items-center gap-2 font-bold text-yellow-400 font-mono">
          <Zap className="w-4 h-4" /> MAIN DISTRIBUTION BREAKER - #104
        </div>
        <div>Required Hardware: 1x 20A Ceramic Fuse Cartridge</div>
        <div className="text-white/50 text-[11px]">Schematic Clue: SW1 [ON], SW2 [ON], SW3 [OFF], SW4 [ON]</div>
      </div>

      {/* Fuse Sockets */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
        <div className="text-[11px] text-white/50 mb-2 uppercase tracking-wider font-mono">
          Primary Bus Socket:
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-mono transition-all ${
                fusesInstalled[0]
                  ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.3)]'
                  : 'bg-white/5 border-dashed border-white/20 text-white/40'
              }`}
            >
              {fusesInstalled[0] ? '20A OK' : 'EMPTY'}
            </div>
            <span className="text-xs text-white/70">
              {fusesInstalled[0]
                ? 'Ceramic fuse cartridge mounted'
                : `Carrying: ${player.inventory.fuses} fuse(s)`}
            </span>
          </div>

          {!fusesInstalled[0] && (
            <button
              onClick={installFuse}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 text-xs font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(250,204,21,0.2)] cursor-pointer"
            >
              MOUNT FUSE
            </button>
          )}
        </div>
      </div>

      {/* 4 Heavy Toggle Switches */}
      <div className="grid grid-cols-4 gap-3">
        {switches.map((isOn, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-2.5"
          >
            <span className="text-[11px] text-white/50 font-semibold font-mono">SW {idx + 1}</span>
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                isOn
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-rose-500/50'
              }`}
            />
            <button
              onClick={() => toggleSwitch(idx)}
              className={`w-full py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                isOn
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              {isOn ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>

      {/* Status Output */}
      <div className="text-center text-xs text-yellow-300 font-mono py-2.5 bg-black/50 rounded-xl border border-white/10">
        {message}
      </div>
    </div>
  );
};

// ==========================================
// 2. HYDRO VALVES (STAGE 1 - POOLROOMS)
// ==========================================
const HydroValvesView: React.FC<{
  state: HydroPuzzleState;
  player: PlayerState;
  onSolve: () => void;
  onUpdateInventory: (inv: PlayerState['inventory']) => void;
}> = ({ state, player, onSolve, onUpdateInventory }) => {
  const [valves, setValves] = useState<number[]>([...state.valves]);
  const hasBothValves = player.inventory.valveWheels >= 2;
  const [message, setMessage] = useState<string>(
    hasBothValves
      ? 'All valve wheels mounted. Balance line pressure to target tolerances to drain the submerged sluice.'
      : `VALVE STEMS MISSING (${player.inventory.valveWheels}/2 Wheels Collected). Retrieve both cast iron valve wheels to rotate manifold stems.`
  );

  const adjustValve = (idx: number, delta: number) => {
    if (!hasBothValves) {
      setMessage('MISSING VALVE WHEELS! You cannot rotate the stems without mounting the wheels.');
      return;
    }
    soundEngine.playValveTurn();
    const next = [...valves];
    next[idx] = Math.max(0, Math.min(100, next[idx] + delta));
    setValves(next);

    const matches = next.every(
      (val, i) => Math.abs(val - state.targetValves[i]) <= state.tolerance
    );

    if (matches) {
      soundEngine.playDoorUnlocked();
      setMessage('PRESSURE EQUALIZED! HYDRO SLUICE DISENGAGING.');
      setTimeout(() => {
        onSolve();
      }, 1000);
    }
  };

  const labels = ['Inlet Line', 'Purge Tank', 'Siphon Return'];

  return (
    <div className="space-y-5">
      <div className="bg-black/60 backdrop-blur-xl border-l-2 border-blue-500/50 border-y border-r border-white/10 p-4 rounded-r-xl text-xs space-y-1 text-white/80">
        <div className="flex items-center gap-2 font-bold text-blue-400 font-mono">
          <Activity className="w-4 h-4" /> HYDRO-PUMPING PRESSURE MANIFOLD
        </div>
        <div className="text-[11px] text-white/50 font-mono">
          Calibration Memo: Line 1 = 45 PSI &bull; Line 2 = 80 PSI &bull; Line 3 = 25 PSI
        </div>
      </div>

      {/* Valve Wheels Status & Location Directive */}
      {!hasBothValves ? (
        <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Valve Wheels Required: {player.inventory.valveWheels} / 2 Collected
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              STEMS LOCKED
            </span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            The mechanical valve stems are uncoupled. Locate the two detached brass valve wheels across the flooded facility:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-black/50 rounded-lg border border-white/10 text-amber-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
              <span><strong>Valve Wheel A:</strong> Northeast Alcove [Top-Right]</span>
            </div>
            <div className="p-2.5 bg-black/50 rounded-lg border border-white/10 text-amber-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
              <span><strong>Valve Wheel B:</strong> Southwest Sluice [Bottom-Left]</span>
            </div>
          </div>
          <p className="text-[10px] text-white/40 italic">
            Tip: Follow the tactical compass ribbon at the top of your HUD or check the golden [V] markers on your radar.
          </p>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Both Valve Wheels Mounted. Adjust valves below to achieve target pressures.</span>
        </div>
      )}

      {/* 3 Analog Valve Channels */}
      <div className="grid grid-cols-3 gap-3">
        {valves.map((val, idx) => {
          const target = state.targetValves[idx];
          const isInRange = Math.abs(val - target) <= state.tolerance;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center border p-3.5 rounded-xl space-y-2.5 transition-all ${
                hasBothValves ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-60'
              }`}
            >
              <span className="text-xs text-blue-300 font-bold font-mono">{labels[idx]}</span>
              <div className="relative w-20 h-20 rounded-full border border-white/15 bg-white/5 flex items-center justify-center backdrop-blur-md shadow-inner">
                <span
                  className={`text-sm font-bold font-mono ${
                    isInRange ? 'text-emerald-400 animate-pulse' : 'text-white/80'
                  }`}
                >
                  {val} PSI
                </span>
                <div
                  className={`absolute -top-1 w-2.5 h-2.5 rounded-full ${
                    isInRange ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/20'
                  }`}
                />
              </div>
              <span className="text-[10px] text-white/40 font-mono">Goal: ~{target} PSI</span>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => adjustValve(idx, -5)}
                  disabled={!hasBothValves}
                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold rounded-xl border border-white/10 text-white/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  -5
                </button>
                <button
                  onClick={() => adjustValve(idx, 5)}
                  disabled={!hasBothValves}
                  className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-mono font-bold rounded-xl border border-blue-400/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  +5
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-blue-300 font-mono py-2.5 bg-black/50 rounded-xl border border-white/10">
        {message}
      </div>
    </div>
  );
};

// ==========================================
// 3. HOTEL KEYPAD (STAGE 2)
// ==========================================
const HotelKeypadView: React.FC<{
  state: HotelKeypadPuzzleState;
  onSolve: () => void;
}> = ({ state, onSolve }) => {
  const [code, setCode] = useState<string>('');
  const [message, setMessage] = useState<string>('Enter 4-digit security passkey from front desk memo.');

  const pressDigit = (digit: string) => {
    if (code.length >= 4) return;
    soundEngine.playPuzzleClick();
    const next = code + digit;
    setCode(next);

    if (next.length === 4) {
      if (next === state.correctCode) {
        soundEngine.playDoorUnlocked();
        setMessage('AUTHENTICATED: SERVICE ELEVATOR OPENED.');
        setTimeout(() => {
          onSolve();
        }, 1000);
      } else {
        soundEngine.playEntityAlert(10);
        setMessage('ACCESS DENIED. INCORRECT PIN.');
        setTimeout(() => {
          setCode('');
        }, 800);
      }
    }
  };

  const clearCode = () => {
    soundEngine.playPuzzleClick();
    setCode('');
  };

  const playPhoneClue = () => {
    soundEngine.playTelephoneRing();
    setMessage('Telephone recording: "...dead bells: 7... floor offset: 2... room: 4... departure: 9..."');
  };

  return (
    <div className="space-y-5">
      <div className="bg-black/60 backdrop-blur-xl border-l-2 border-rose-500/50 border-y border-r border-white/10 p-4 rounded-r-xl text-xs flex items-center justify-between text-white/80">
        <div>
          <div className="font-bold text-rose-400 font-mono">CORRIDOR 404 ELEVATOR KEYPAD</div>
          <div className="text-[11px] text-white/50">Clue: Front Desk memo references recorded voicemail numbers.</div>
        </div>
        <button
          onClick={playPhoneClue}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-rose-300 border border-rose-500/40 text-xs font-mono rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.15)]"
        >
          <PhoneCall className="w-3.5 h-3.5" /> LISTEN LOG
        </button>
      </div>

      {/* Phosphor Sleek Display */}
      <div className="bg-black/60 border border-white/10 p-4 rounded-xl text-center">
        <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">
          SECURITY CODE INPUT
        </div>
        <div className="text-3xl tracking-[0.5em] font-bold text-emerald-400 font-mono h-9 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
          {code.padEnd(4, '_')}
        </div>
      </div>

      {/* 3x4 Keypad */}
      <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'].map((k) => (
          <button
            key={k}
            onClick={() => {
              if (k === 'CLR') clearCode();
              else if (k === 'DEL') setCode((c) => c.slice(0, -1));
              else pressDigit(k);
            }}
            className="py-3 bg-white/5 hover:bg-white/15 text-white font-bold text-base font-mono rounded-xl border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,255,255,0.03)]"
          >
            {k}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-rose-300 font-mono py-2.5 bg-black/50 rounded-xl border border-white/10">
        {message}
      </div>
    </div>
  );
};

// ==========================================
// 4. WIRE CONDUIT SEQUENCER (STAGE 3)
// ==========================================
const WireConduitsView: React.FC<{
  state: WireConduitPuzzleState;
  onSolve: () => void;
}> = ({ state, onSolve }) => {
  const [grid, setGrid] = useState<number[]>([...state.grid]);
  const [message, setMessage] = useState<string>(
    'Rotate conduit couplers until power flows from input (top-left) to output (bottom-right).'
  );

  const rotateTile = (idx: number) => {
    soundEngine.playPuzzleClick();
    const next = [...grid];
    next[idx] = (next[idx] + 1) % 4;
    setGrid(next);

    const isAligned =
      (next[0] % 2 === 0 || next[0] === 1) &&
      (next[1] % 2 === 1) &&
      (next[2] === 2 || next[2] === 3) &&
      (next[5] % 2 === 0) &&
      (next[8] === 0 || next[8] === 3);

    if (isAligned) {
      soundEngine.playDoorUnlocked();
      setMessage('CONTINUOUS CURRENT ESTABLISHED! BLAST VAULT RELEASED.');
      setTimeout(() => {
        onSolve();
      }, 1000);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-black/60 backdrop-blur-xl border-l-2 border-yellow-500/50 border-y border-r border-white/10 p-4 rounded-r-xl text-xs text-white/80 space-y-1">
        <div className="font-bold text-yellow-400 font-mono">HIGH-VOLTAGE ROTARY CONDUIT COUPLERS</div>
        <div className="text-[11px] text-white/50">Rotate conduit modules 90° clockwise to complete circuit from IN to OUT.</div>
      </div>

      <div className="flex items-center justify-between text-xs text-yellow-400 font-bold font-mono px-2">
        <span>⚡ POWER INPUT</span>
        <span>VAULT OUTPUT ⚡</span>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto p-4 bg-black/60 rounded-2xl border border-white/10">
        {grid.map((rot, idx) => (
          <button
            key={idx}
            onClick={() => rotateTile(idx)}
            className="aspect-square bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer"
          >
            <div
              className="transition-transform duration-200"
              style={{ transform: `rotate(${rot * 90}deg)` }}
            >
              {state.types[idx] === 'straight' && (
                <div className="w-2 h-10 bg-yellow-400 rounded shadow-[0_0_8px_#facc15]" />
              )}
              {state.types[idx] === 'corner' && (
                <div className="relative w-8 h-8">
                  <div className="absolute top-0 left-3 w-2 h-5 bg-yellow-400 rounded shadow-[0_0_8px_#facc15]" />
                  <div className="absolute top-3 left-3 w-5 h-2 bg-yellow-400 rounded shadow-[0_0_8px_#facc15]" />
                </div>
              )}
              {state.types[idx] === 'cross' && (
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute w-2 h-8 bg-yellow-400 rounded shadow-[0_0_8px_#facc15]" />
                  <div className="absolute w-8 h-2 bg-yellow-400 rounded shadow-[0_0_8px_#facc15]" />
                </div>
              )}
            </div>
            <span className="absolute bottom-1 right-1 text-[9px] text-white/30 font-mono">
              {rot * 90}°
            </span>
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-yellow-300 font-mono py-2.5 bg-black/50 rounded-xl border border-white/10">
        {message}
      </div>
    </div>
  );
};

// ==========================================
// 5. RESONANCE MATRIX (STAGE 4 - FINAL THRESHOLD)
// ==========================================
const ResonanceMatrixView: React.FC<{
  state: ResonanceMatrixPuzzleState;
  onSolve: () => void;
}> = ({ state, onSolve }) => {
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(
    'Press "TRANSMIT SEQUENCE" to listen to the 4 harmonic frequencies, then repeat them.'
  );

  const names = ['Alpha (Low)', 'Beta (Mid)', 'Gamma (High)', 'Delta (Apex)'];

  const playTone = (idx: number) => {
    soundEngine.playItemPickup();
  };

  const playSequence = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setMessage('Receiving dimensional acoustic resonance...');
    setPlayerSeq([]);

    state.sequence.forEach((toneIdx, step) => {
      setTimeout(() => {
        playTone(toneIdx);
        if (step === state.sequence.length - 1) {
          setIsPlaying(false);
          setMessage('Replicate the harmonic sequence now.');
        }
      }, (step + 1) * 700);
    });
  };

  const pressPlate = (idx: number) => {
    if (isPlaying) return;
    playTone(idx);
    const next = [...playerSeq, idx];
    setPlayerSeq(next);

    const stepIdx = next.length - 1;
    if (next[stepIdx] !== state.sequence[stepIdx]) {
      soundEngine.playEntityAlert(10);
      setMessage('FREQUENCY DISCORD! Harmonic alignment broken. Transmit again.');
      setPlayerSeq([]);
      return;
    }

    if (next.length === state.sequence.length) {
      soundEngine.playVictoryChime();
      setMessage('HARMONIC EQUILIBRIUM ACHIEVED. THRESHOLD PORTAL UNSEALED.');
      setTimeout(() => {
        onSolve();
      }, 1200);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-black/60 backdrop-blur-xl border-l-2 border-emerald-500/50 border-y border-r border-white/10 p-4 rounded-r-xl text-xs flex items-center justify-between text-white/80">
        <div>
          <div className="font-bold text-emerald-400 font-mono">THRESHOLD ACOUSTIC RESONATOR</div>
          <div className="text-[11px] text-white/50">Replicate harmonic sound pattern to collapse the liminal loop.</div>
        </div>
        <button
          onClick={playSequence}
          disabled={isPlaying}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)]"
        >
          <Radio className="w-3.5 h-3.5" /> TRANSMIT
        </button>
      </div>

      {/* 4 Resonance Plates */}
      <div className="grid grid-cols-2 gap-3.5 max-w-sm mx-auto">
        {names.map((name, idx) => (
          <button
            key={idx}
            onClick={() => pressPlate(idx)}
            disabled={isPlaying}
            className="p-5 bg-white/5 hover:bg-white/10 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all group disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] transition-transform group-hover:scale-125" />
            <span className="text-xs font-bold text-emerald-300 font-mono">{name}</span>
          </button>
        ))}
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {state.sequence.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full border transition-all ${
              playerSeq.length > i
                ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#34d399]'
                : 'bg-white/10 border-white/20'
            }`}
          />
        ))}
      </div>

      <div className="text-center text-xs text-emerald-300 font-mono py-2.5 bg-black/50 rounded-xl border border-white/10">
        {message}
      </div>
    </div>
  );
};
