import React, { useEffect } from 'react';
import { Trophy, Clock, AlertTriangle, RotateCcw, Sparkles, Award, CheckCircle2, Database, Calendar } from 'lucide-react';
import { TXT } from '../utils/texts';
import { calculateEffectiveMs } from '../domain/score';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface VictoryModalProps {
  elapsedMs: number;
  penaltiesCount: number;
  penaltySeconds: number;
  totalTiles: number;
  rank?: number;
  isDailyChallenge?: boolean;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  bestTimeMs: number | null;
  scoreSyncState?: 'saving' | 'synced' | 'pending';
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  elapsedMs,
  penaltiesCount,
  penaltySeconds,
  totalTiles,
  rank,
  isDailyChallenge = true,
  onPlayAgain,
  onViewLeaderboard,
  bestTimeMs,
  scoreSyncState = 'synced',
}) => {
  const dialogRef = useDialogFocus(onPlayAgain);
  const totalEffectiveMs = calculateEffectiveMs(elapsedMs, penaltySeconds);
  const isNewRecord = bestTimeMs === null || totalEffectiveMs < bestTimeMs;

  const formatMs = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  useEffect(() => {
    void import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        disableForReducedMotion: true,
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24', '#ec4899'],
      });
    }).catch(() => {
      // Celebration is optional; gameplay must not depend on it.
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-dialog-title"
        className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl text-center relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute w-36 h-36 rounded-full bg-amber-500/20 blur-3xl pointer-events-none -top-10 left-1/2 -translate-x-1/2" />

        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-amber-400" />
        </div>

        <h2
          id="victory-dialog-title"
          className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-1 focus:outline-none"
        >
          {TXT.victoryTitle}
        </h2>
        <p className="text-xs text-slate-300 mb-2">
          {isDailyChallenge
            ? 'Gaurko eguneroko erronka arrakastaz burutu duzu!'
            : TXT.victorySubtitle}
        </p>

        {isDailyChallenge && (
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-3 border ${
              scoreSyncState === 'pending'
                ? 'bg-amber-950/70 border-amber-800/80 text-amber-300'
                : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {scoreSyncState === 'saving' && 'Emaitza gordetzen...'}
              {scoreSyncState === 'synced' && 'Emaitza erregistratua · Biharko erronkaren zain'}
              {scoreSyncState === 'pending' && 'Gailuan gordeta · Konexioa itzultzean sinkronizatuko da'}
            </span>
          </div>
        )}

        {isNewRecord && !isDailyChallenge && (
          <div className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-400 px-3 py-0.5 rounded-full text-amber-300 text-[11px] font-black uppercase mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{TXT.newRecord}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              {TXT.finalTime}
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-amber-300">
              {formatMs(totalEffectiveMs)}
            </span>
            <span className="text-[8.5px] text-slate-500 font-mono">
              (Garbia: {formatMs(elapsedMs)})
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              {TXT.penalties}
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-rose-400">
              +{penaltySeconds}s
            </span>
            <span className="text-[8.5px] text-slate-500">
              {penaltiesCount} huts / laguntza
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onViewLeaderboard}
            className="w-full py-3 bg-linear-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
          >
            <Award className="w-4 h-4" />
            <span>{TXT.seeLeaderboard}</span>
          </button>

          {!isDailyChallenge ? (
            <button
              onClick={onPlayAgain}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{TXT.playAgain}</span>
            </button>
          ) : (
            <button
              onClick={onPlayAgain}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Itxi eta Ikusi Gaurko Egoera</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
