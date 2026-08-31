/**
 * Survivor Note & Research Log Modal
 * Sleek Interface theme with glassmorphic document card, subtle glowing borders,
 * and high-contrast typography.
 */

import React from 'react';
import { SurvivorNote } from '../types';
import { FileText, X } from 'lucide-react';

interface NoteModalProps {
  note: SurvivorNote | null;
  onClose: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({ note, onClose }) => {
  if (!note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0c0c0c]/95 text-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 font-mono">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-white/10 bg-black/40 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-yellow-500 font-bold uppercase tracking-widest font-mono">
              <FileText className="w-3.5 h-3.5" /> RECOVERED ARTIFACT LOG
            </div>
            <h2 className="text-xl font-light italic tracking-tight text-white/95 mt-1">
              {note.title}
            </h2>
            <div className="text-xs text-white/40 mt-1 font-mono">
              <span>Date: {note.date}</span> &bull; <span>Author: {note.author}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Note Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto leading-relaxed text-xs text-slate-300 whitespace-pre-wrap selection:bg-yellow-400/30">
          {note.content}

          {/* Key Hint Box matching Active Objective sleek card */}
          <div className="bg-black/60 backdrop-blur-xl border-l-2 border-yellow-500/50 border-y border-r border-white/10 p-4 rounded-r-xl shadow-lg mt-4">
            <span className="font-bold text-yellow-500 uppercase tracking-widest block mb-1 text-[10px] font-mono">
              SURVIVAL KEY TAKEAWAY:
            </span>
            <p className="text-xs text-white/85 leading-relaxed">{note.hint}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            STOW INVENTORY [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
