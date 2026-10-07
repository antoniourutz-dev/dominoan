import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { DominoTile } from '../data/dominoSets';
import { DominoPiece } from './DominoPiece';
import { TXT } from '../utils/texts';
import { GameMode } from '../domain/gameMode';

interface GameBoardProps {
  activeTile: DominoTile | null;
  targetWord: string;
  completedCount: number;
  totalCycleLength: number;
  isVanishing: boolean;
  lastMatchedPair: { target: string; matched: string } | null;
  gameMode: GameMode;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  activeTile,
  completedCount,
  totalCycleLength,
  isVanishing,
  lastMatchedPair,
  gameMode,
}) => {
  if (!activeTile) return null;

  const currentPlacedNumber = Math.min(totalCycleLength, completedCount + 1);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-1 min-h-0">
      {/* Central Board Mat (clean, prominent, focused on the hero tile) */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center justify-between bg-linear-to-b from-slate-900 via-slate-850 to-slate-900 border-2 border-slate-700/80 rounded-3xl p-3 sm:p-4 shadow-2xl relative overflow-hidden flex-1 max-h-[290px] sm:max-h-[330px]">
        {/* Ambient atmospheric golden backlight glow */}
        <div className="absolute w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Top Header of the Board Mat - Clean Minimal Progress */}
        <div className="w-full flex items-center justify-between gap-2 z-10 shrink-0 pb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-3 h-3 animate-pulse" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
              {gameMode === 'daily' ? TXT.dailyChallenge : 'Praktika librea'}
            </span>
          </div>

          {/* Progress pill */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-xl border border-slate-800 shrink-0 shadow-inner">
            <span className="text-amber-400 font-mono font-black">{currentPlacedNumber}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 font-mono">{totalCycleLength}</span>
          </div>
        </div>

        {/* Temporary floating match banner when words connect & vanish */}
        {lastMatchedPair && isVanishing && (
          <div
            role="status"
            aria-live="polite"
            className="absolute top-2.5 inset-x-3 z-30 flex justify-center animate-fadeIn"
          >
            <div className="bg-emerald-950/95 border-2 border-emerald-400 px-4 py-1 rounded-2xl shadow-2xl flex items-center gap-2 text-emerald-300 text-xs sm:text-sm font-black">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                {lastMatchedPair.target} = {lastMatchedPair.matched} ✓
              </span>
            </div>
          </div>
        )}

        {/* THE HERO VERTICAL DOMINO TILE (Large, centered, beautiful tactile shine) */}
        <div className="flex-1 flex items-center justify-center w-full py-1 z-10">
          <div
            className={`transition-all ${
              isVanishing
                ? 'animate-vanish-up pointer-events-none'
                : 'animate-slide-down-in'
            }`}
          >
            <DominoPiece
              tile={activeTile}
              orientation="vertical"
              size="hero" // Generous central hero tile
              highlightRight={true} // Glowing gold lower half waiting for match
              badge={completedCount === 0 ? TXT.startTag : `#${currentPlacedNumber}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
