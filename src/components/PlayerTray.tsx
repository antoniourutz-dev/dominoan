import React from 'react';
import { Layers, Shuffle, Lightbulb, HelpCircle } from 'lucide-react';
import { DominoTile } from '../data/dominoSets';
import { DominoPiece } from './DominoPiece';
import { TXT } from '../utils/texts';

interface PlayerTrayProps {
  hand: DominoTile[];
  shakingTileId: string | null;
  correctTileId: string | null;
  hintTileId: string | null;
  onTileSelect: (tile: DominoTile) => void;
  onUseHint: () => void;
  onShuffleHand: () => void;
  targetWord: string;
  isGameActive: boolean;
}

export const PlayerTray: React.FC<PlayerTrayProps> = ({
  hand,
  shakingTileId,
  correctTileId,
  hintTileId,
  onTileSelect,
  onUseHint,
  onShuffleHand,
  targetWord,
  isGameActive,
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 sm:gap-2 shrink-0">
      {/* Hand Header & Controls */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/95 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Layers className="w-3 h-3" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
            <span>{TXT.playerHand}</span>
            <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded-full border border-slate-700 font-mono">
              {hand.length}
            </span>
          </span>
        </div>

        {/* Action Buttons: Hint (Laguntza +5s) & Shuffle */}
        <div className="flex items-center gap-1.5">
          {/* HELP / HINT BUTTON (+5s penalty) */}
          <button
            onClick={onUseHint}
            title={TXT.helpButton}
            aria-label={`${TXT.helpButton}, 5 segundo zigorra`}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/60 rounded-lg text-[10px] font-black transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">{TXT.helpButton}</span>
          </button>

          <button
            onClick={onShuffleHand}
            title={TXT.shuffleHand}
            aria-label={TXT.shuffleHand}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3 h-3" />
            <span className="hidden xs:inline whitespace-nowrap">{TXT.shuffleHand}</span>
          </button>
        </div>
      </div>

      {/* Hand Domino Grid: 6 Bright, tactile Ivory Dominoes */}
      <div className="w-full bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl relative min-h-[140px] flex flex-col justify-center">
        {hand.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs font-bold">
            Ez dago fitxarik eskuan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5 justify-items-center w-full">
            {hand.map((tile) => {
              const isShaking = shakingTileId === tile.id;
              const isCorrectPop = correctTileId === tile.id;
              const isHinted = hintTileId === tile.id;

              return (
                <div
                  key={tile.id}
                  className={`w-full flex justify-center transition-all ${
                    isHinted ? 'ring-4 ring-amber-400 rounded-xl animate-pulse scale-105 shadow-xl shadow-amber-500/30' : ''
                  }`}
                >
                  <DominoPiece
                    tile={tile}
                    orientation="horizontal"
                    size="sm"
                    isShaking={isShaking}
                    isCorrectPop={isCorrectPop}
                    badge={isHinted ? '💡 LOTU' : undefined}
                    onClick={() => onTileSelect(tile)}
                    disabled={false}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom helper prompt */}
        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[9px] sm:text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1 truncate">
            <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">
              Aukeratu ezkerrean goiko hitzaren sinonimoa duena
            </span>
          </div>
          <span className="text-rose-400 font-bold whitespace-nowrap shrink-0">
            {TXT.penaltyNotice}
          </span>
        </div>
      </div>
    </div>
  );
};
