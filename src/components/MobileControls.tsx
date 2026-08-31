/**
 * Virtual Touch Controls for Mobile / Touchscreen Devices
 * Sleek Interface theme with translucent glass buttons, glowing active states,
 * and high responsiveness.
 */

import React, { useRef } from 'react';
import { Zap, Footprints, BatteryCharging, Hand } from 'lucide-react';

interface MobileControlsProps {
  onMove: (moveX: number, moveY: number) => void;
  onRotate: (deltaAngle: number) => void;
  onInteract: () => void;
  onToggleFlashlight: () => void;
  onToggleSprint: () => void;
  onToggleCrouch: () => void;
  onReloadBattery: () => void;
  isSprinting: boolean;
  isCrouching: boolean;
  canInteract?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onRotate,
  onInteract,
  onToggleFlashlight,
  onToggleSprint,
  onToggleCrouch,
  onReloadBattery,
  isSprinting,
  isCrouching,
  canInteract = false,
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Touch look handler on the right 2/3rds of the screen
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartRef.current.x;
    touchStartRef.current = { x: currentX, y: e.touches[0].clientY };

    // Smooth camera rotation
    onRotate(diffX * 0.006);
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none md:hidden font-mono">
      {/* Full right/upper screen touch look swipe surface */}
      <div
        className="absolute top-16 right-0 bottom-24 left-1/3 pointer-events-auto opacity-0 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Left side: Movement Directional Pad + Turn Left / Turn Right buttons */}
      <div className="absolute bottom-24 left-5 pointer-events-auto flex flex-col gap-2">
        {/* Turn buttons for quick looking while standing */}
        <div className="flex gap-2 justify-center w-36">
          <button
            onTouchStart={() => onRotate(-0.25)}
            className="flex-1 py-1 bg-black/50 active:bg-yellow-400/20 border border-white/10 active:border-yellow-400/50 rounded-lg text-white/70 active:text-yellow-300 text-xs font-mono font-bold flex items-center justify-center gap-1 backdrop-blur-md"
          >
            <span>↶</span> LOOK L
          </button>
          <button
            onTouchStart={() => onRotate(0.25)}
            className="flex-1 py-1 bg-black/50 active:bg-yellow-400/20 border border-white/10 active:border-yellow-400/50 rounded-lg text-white/70 active:text-yellow-300 text-xs font-mono font-bold flex items-center justify-center gap-1 backdrop-blur-md"
          >
            LOOK R <span>↷</span>
          </button>
        </div>

        {/* 3x3 Movement D-pad */}
        <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
          <div />
          <button
            onTouchStart={() => onMove(0, 1)}
            onTouchEnd={() => onMove(0, 0)}
            className="bg-black/50 active:bg-white/20 border border-white/10 active:border-white/30 rounded-xl flex items-center justify-center text-white/80 font-bold text-base backdrop-blur-md transition-colors"
          >
            ▲
          </button>
          <div />

          <button
            onTouchStart={() => onMove(-1, 0)}
            onTouchEnd={() => onMove(0, 0)}
            className="bg-black/50 active:bg-white/20 border border-white/10 active:border-white/30 rounded-xl flex items-center justify-center text-white/80 font-bold text-base backdrop-blur-md transition-colors"
          >
            ◀
          </button>
          <div className="bg-white/5 rounded-xl flex items-center justify-center text-[9px] text-white/30 font-mono text-center">
            MOVE
          </div>
          <button
            onTouchStart={() => onMove(1, 0)}
            onTouchEnd={() => onMove(0, 0)}
            className="bg-black/50 active:bg-white/20 border border-white/10 active:border-white/30 rounded-xl flex items-center justify-center text-white/80 font-bold text-base backdrop-blur-md transition-colors"
          >
            ▶
          </button>

          <div />
          <button
            onTouchStart={() => onMove(0, -1)}
            onTouchEnd={() => onMove(0, 0)}
            className="bg-black/50 active:bg-white/20 border border-white/10 active:border-white/30 rounded-xl flex items-center justify-center text-white/80 font-bold text-base backdrop-blur-md transition-colors"
          >
            ▼
          </button>
          <div />
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="absolute bottom-24 right-5 pointer-events-auto flex flex-col items-end gap-2.5">
        {/* Interact Button - ONLY displayed when an interactive item/terminal is in range */}
        {canInteract && (
          <button
            onClick={onInteract}
            className="w-14 h-14 rounded-2xl bg-yellow-400/25 active:bg-yellow-400/40 text-yellow-100 border border-yellow-400/70 shadow-[0_0_20px_rgba(250,204,21,0.35)] backdrop-blur-xl flex flex-col items-center justify-center font-bold transition-all active:scale-95 cursor-pointer animate-in fade-in zoom-in-90 duration-150"
          >
            <Hand className="w-5 h-5 text-yellow-300" />
            <span className="text-[9px] uppercase font-mono tracking-wider text-yellow-200">
              USE [E]
            </span>
          </button>
        )}

        <div className="flex gap-2">
          {/* Flashlight */}
          <button
            onClick={onToggleFlashlight}
            className="w-11 h-11 rounded-xl bg-black/50 active:bg-white/20 text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <Zap className="w-5 h-5 text-yellow-400" />
          </button>

          {/* Sprint */}
          <button
            onClick={onToggleSprint}
            className={`w-11 h-11 rounded-xl border backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
              isSprinting
                ? 'bg-blue-600/30 border-blue-400 text-blue-200 shadow-[0_0_12px_rgba(96,165,250,0.4)]'
                : 'bg-black/50 border-white/10 text-white/50'
            }`}
          >
            <Footprints className="w-5 h-5" />
          </button>

          {/* Crouch */}
          <button
            onClick={onToggleCrouch}
            className={`w-11 h-11 rounded-xl border backdrop-blur-md flex items-center justify-center text-[10px] font-mono font-bold transition-all cursor-pointer ${
              isCrouching
                ? 'bg-rose-500/30 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-black/50 border-white/10 text-white/50'
            }`}
          >
            STLTH
          </button>
        </div>
      </div>
    </div>
  );
};
