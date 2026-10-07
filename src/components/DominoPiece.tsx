import React from 'react';
import { DominoTile } from '../data/dominoSets';

interface DominoPieceProps {
  tile: DominoTile;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  orientation?: 'horizontal' | 'vertical';
  highlightRight?: boolean;
  highlightLeft?: boolean;
  isShaking?: boolean;
  isCorrectPop?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  badge?: string;
}

export const DominoPiece: React.FC<DominoPieceProps> = ({
  tile,
  size = 'md',
  orientation = 'horizontal',
  highlightRight = false,
  highlightLeft = false,
  isShaking = false,
  isCorrectPop = false,
  onClick,
  disabled = false,
  selected = false,
  badge,
}) => {
  // Font scale without ANY text-ellipsis or truncation so the entire word is 100% visible on a single line
  const getWordTextClass = (word: string, isVertical: boolean, currentSize: string) => {
    const len = word.length;

    if (isVertical) {
      if (currentSize === 'hero') {
        if (len > 12) return 'text-xs sm:text-sm md:text-base font-black tracking-tighter';
        if (len > 8) return 'text-sm sm:text-base md:text-lg font-black tracking-tight';
        return 'text-base sm:text-lg md:text-xl font-black tracking-normal';
      }
      if (currentSize === 'xl') {
        if (len > 12) return 'text-[11px] sm:text-xs font-black tracking-tighter';
        if (len > 8) return 'text-xs sm:text-sm font-black tracking-tight';
        return 'text-sm sm:text-base font-black tracking-normal';
      }
      if (currentSize === 'lg') {
        if (len > 12) return 'text-[11px] sm:text-xs font-black tracking-tighter';
        if (len > 8) return 'text-xs sm:text-sm font-extrabold tracking-tight';
        return 'text-sm sm:text-base font-black tracking-normal';
      }
      // Standard vertical tile
      if (len > 12) return 'text-[9.5px] sm:text-[11px] font-black tracking-tighter';
      if (len > 8) return 'text-[11px] sm:text-xs font-extrabold tracking-tight';
      return 'text-xs sm:text-sm font-black tracking-normal';
    }

    // Horizontal layout (divided width for player tiles)
    if (len > 12) return 'text-[8.5px] sm:text-[9.5px] md:text-[10px] font-black tracking-tighter';
    if (len > 8) return 'text-[10px] sm:text-[11px] md:text-xs font-extrabold tracking-tight';
    return 'text-xs sm:text-sm font-black tracking-normal';
  };

  const isVertical = orientation === 'vertical';

  // Sizing definitions
  const verticalSizes = {
    sm: 'w-[96px] sm:w-[110px] h-[90px] sm:h-[105px] p-1.5',
    md: 'w-[115px] sm:w-[130px] h-[105px] sm:h-[120px] p-1.5',
    lg: 'w-[145px] sm:w-[170px] h-[130px] sm:h-[150px] p-2',
    xl: 'w-[180px] sm:w-[210px] md:w-[230px] h-[150px] sm:h-[170px] p-2 sm:p-2.5',
    hero: 'w-[210px] sm:w-[250px] md:w-[280px] h-[175px] sm:h-[195px] md:h-[215px] p-2.5 sm:p-3',
  };

  const horizontalSizes = {
    sm: 'w-full max-w-[175px] sm:max-w-[210px] md:max-w-[240px] h-12 sm:h-14 px-2 py-1',
    md: 'w-full max-w-[195px] sm:max-w-[230px] md:max-w-[260px] h-13 sm:h-15 px-2.5 py-1',
    lg: 'w-60 sm:w-72 h-15 sm:h-18 px-2.5 py-1.5',
    xl: 'w-72 sm:w-80 h-18 sm:h-20 px-3 py-2',
    hero: 'w-80 sm:w-96 h-20 sm:h-24 px-3.5 py-2',
  };

  const containerDimension = isVertical ? verticalSizes[size] : horizontalSizes[size];
  const isHero = size === 'hero';

  if (isVertical) {
    return (
      <div
        onClick={disabled ? undefined : onClick}
        onKeyDown={(event) => {
          if (!disabled && onClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onClick();
          }
        }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        aria-disabled={onClick ? disabled : undefined}
        aria-label={onClick ? `${tile.left} — ${tile.right}` : undefined}
        className={`
          relative select-none transition-all duration-200 shrink-0
          bg-linear-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#EDE4D2]
          text-slate-900 rounded-2xl sm:rounded-3xl
          border-3 sm:border-4 border-slate-900
          ${isHero ? 'shadow-[0_8px_0_0_#0f172a,0_18px_30px_rgba(0,0,0,0.5)]' : 'shadow-[0_5px_0_0_#0f172a,0_10px_20px_rgba(0,0,0,0.35)]'}
          flex flex-col items-stretch justify-between
          ${containerDimension}
          ${onClick && !disabled ? 'cursor-pointer active:translate-y-1 active:shadow-[0_2px_0_0_#0f172a] hover:-translate-y-0.5' : ''}
          ${selected ? 'ring-4 ring-amber-400 -translate-y-1 shadow-[0_8px_0_0_#0f172a,0_0_20px_rgba(251,191,36,0.6)]' : ''}
          ${isShaking ? 'animate-[shake_0.4s_ease-in-out] ring-4 ring-rose-500 bg-rose-50' : ''}
          ${isCorrectPop ? 'ring-4 ring-emerald-400 bg-emerald-50' : ''}
        `}
      >
        {/* Subtle top edge gloss reflection */}
        <div className="absolute inset-x-3 top-0 h-[2px] bg-white/80 rounded-t-xl pointer-events-none" />

        {/* Badge in corner */}
        {badge && (
          <span className="absolute -top-3 -right-1.5 bg-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md z-10 border border-slate-900 leading-none">
            {badge}
          </span>
        )}

        {/* TOP HALF (tile.left: previous linked word) */}
        <div
          className={`
            flex-1 flex flex-col items-center justify-center text-center px-1.5 rounded-t-xl relative
            ${highlightLeft ? 'bg-amber-100 ring-inset ring-2 ring-amber-500' : ''}
          `}
        >
          <span
            className={`
              ${getWordTextClass(tile.left, true, size)}
              text-slate-900 uppercase whitespace-nowrap block max-w-full leading-none drop-shadow-xs
            `}
            title={tile.left}
          >
            {tile.left}
          </span>
        </div>

        {/* HORIZONTAL DIVIDER with metallic brass domino rivet */}
        <div className="relative flex items-center justify-center py-1 w-full px-1">
          <div className="h-[2.5px] sm:h-[3px] w-full bg-slate-900/85 rounded-full shadow-inner" />
          <div className="absolute w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-linear-to-tr from-amber-700 via-amber-400 to-yellow-200 border-1.5 border-amber-950 shadow-sm flex items-center justify-center">
            <div className="w-0.5 h-0.5 rounded-full bg-white/90" />
          </div>
        </div>

        {/* BOTTOM HALF (tile.right: active illuminated target) */}
        <div
          className={`
            flex-1 flex flex-col items-center justify-center text-center px-1.5 rounded-b-xl transition-all duration-300 relative
            ${
              highlightRight
                ? 'bg-linear-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 ring-inset ring-3 ring-amber-500/90 shadow-[inset_0_2px_10px_rgba(255,255,255,0.7),inset_0_-2px_10px_rgba(180,83,9,0.4)] animate-pulse'
                : ''
            }
          `}
        >
          {highlightRight && (
            <div className="absolute -top-3 right-1.5 bg-slate-950 text-amber-300 text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm border border-amber-400 flex items-center gap-1 leading-none z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>LOTU</span>
            </div>
          )}

          <span
            className={`
              ${getWordTextClass(tile.right, true, size)}
              ${highlightRight ? 'text-slate-950 font-black' : 'text-slate-900'}
              uppercase whitespace-nowrap block max-w-full leading-none drop-shadow-xs
            `}
            title={tile.right}
          >
            {tile.right}
          </span>
        </div>
      </div>
    );
  }

  // HORIZONTAL ORIENTATION (Player's hand domino tiles)
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={`${tile.left} — ${tile.right}`}
      className={`
        relative select-none transition-all duration-150 shrink-0
        bg-linear-to-b from-[#FFFDF9] via-[#FAF6EC] to-[#EAE1CF]
        text-slate-900 rounded-xl sm:rounded-2xl
        border-2 sm:border-3 border-slate-900
        shadow-[0_4px_0_0_#0f172a,0_8px_14px_rgba(0,0,0,0.35)]
        flex items-stretch justify-between
        ${containerDimension}
        ${onClick && !disabled ? 'cursor-pointer active:translate-y-1 active:shadow-[0_1px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#0f172a,0_10px_18px_rgba(0,0,0,0.4)]' : ''}
        ${disabled ? 'opacity-90 cursor-not-allowed' : ''}
        ${selected ? 'ring-3 ring-amber-400 -translate-y-1 shadow-[0_6px_0_0_#0f172a,0_0_15px_rgba(251,191,36,0.6)]' : ''}
        ${isShaking ? 'animate-[shake_0.4s_ease-in-out] ring-3 ring-rose-500 bg-rose-50' : ''}
        ${isCorrectPop ? 'ring-3 ring-emerald-400 bg-emerald-50' : ''}
      `}
    >
      {/* Top subtle highlight */}
      <div className="absolute inset-x-2 top-0 h-[1.5px] bg-white/80 rounded-t-lg pointer-events-none" />

      {badge && (
        <span className="absolute -top-2.5 -right-1 bg-amber-500 text-slate-950 text-[8.5px] sm:text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs z-10 border border-slate-900 leading-none">
          {badge}
        </span>
      )}

      {/* LEFT HALF */}
      <div
        className={`
          flex-1 flex items-center justify-center text-center relative px-1 sm:px-1.5 rounded-l-lg
          ${highlightLeft ? 'bg-amber-100 ring-inset ring-2 ring-amber-500' : ''}
        `}
      >
        <span
          className={`
            ${getWordTextClass(tile.left, false, size)}
            text-slate-950 uppercase whitespace-nowrap block max-w-full leading-none drop-shadow-xs
          `}
          title={tile.left}
        >
          {tile.left}
        </span>
      </div>

      {/* VERTICAL DIVIDER with brass spinner rivet */}
      <div className="relative flex items-center justify-center px-0.5 shrink-0">
        <div className="w-[2px] h-full bg-slate-900/85 rounded-full" />
        <div className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-linear-to-tr from-amber-700 via-amber-400 to-yellow-200 border border-amber-950 shadow-xs flex items-center justify-center">
          <div className="w-0.5 h-0.5 rounded-full bg-white/80" />
        </div>
      </div>

      {/* RIGHT HALF */}
      <div
        className={`
          flex-1 flex items-center justify-center text-center relative px-1 sm:px-1.5 rounded-r-lg transition-all duration-200
          ${
            highlightRight
              ? 'bg-amber-300 text-slate-950 ring-inset ring-2 ring-amber-500 shadow-[inset_0_0_10px_rgba(245,158,11,0.5)] animate-pulse'
              : ''
          }
        `}
      >
        {highlightRight && (
          <div className="absolute -top-2.5 right-0.5 bg-amber-500 text-slate-950 text-[7.5px] font-black uppercase px-1 py-0.2 rounded-xs shadow-xs border border-slate-900 leading-none">
            LOTU
          </div>
        )}

        <span
          className={`
            ${getWordTextClass(tile.right, false, size)}
            ${highlightRight ? 'text-slate-950 font-black' : 'text-slate-950'}
            uppercase whitespace-nowrap block max-w-full leading-none drop-shadow-xs
          `}
          title={tile.right}
        >
          {tile.right}
        </span>
      </div>
    </button>
  );
};
