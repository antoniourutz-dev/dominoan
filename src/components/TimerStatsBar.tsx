import React from 'react';
import { Clock, RotateCcw, HelpCircle, Play, Pause, AlertTriangle } from 'lucide-react';
import { TXT } from '../utils/texts';
import { calculateEffectiveMs } from '../domain/score';

interface TimerStatsBarProps {
  gameStatus: 'idle' | 'playing' | 'paused' | 'finished';
  elapsedMs: number;
  penaltySeconds: number;
  penaltiesCount: number;
  placedCount: number;
  totalTiles: number;
  onStartGame: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
  onResetGame: () => void;
  onOpenRules: () => void;
  lastPenaltyAlert: boolean;
  penaltyAlertText?: string;
  hasPlayedToday?: boolean;
  allowReset?: boolean;
}

export const TimerStatsBar: React.FC<TimerStatsBarProps> = ({
  gameStatus,
  elapsedMs,
  penaltySeconds,
  penaltiesCount,
  placedCount,
  totalTiles,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onResetGame,
  onOpenRules,
  lastPenaltyAlert,
  penaltyAlertText = '+5s Zigorra',
  hasPlayedToday = false,
  allowReset = true,
}) => {
  const totalEffectiveMs = calculateEffectiveMs(elapsedMs, penaltySeconds);
  const minutes = Math.floor(totalEffectiveMs / 60000);
  const seconds = Math.floor((totalEffectiveMs % 60000) / 1000);
  const millis = Math.floor((totalEffectiveMs % 1000) / 100);

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${millis}`;
  const progressPercent = Math.min(100, Math.round((placedCount / totalTiles) * 100));

  return (
    <div className="w-full bg-slate-900/95 border-b border-slate-800 px-2.5 py-1.5 sticky top-0 z-30 shadow-md shrink-0 select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* START / STOP / RESUME BUTTON */}
        <div className="shrink-0">
          {hasPlayedToday ? (
            <div className="px-3.5 py-1.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-default">
              <span>✓ Gaur Osatuta</span>
            </div>
          ) : gameStatus === 'idle' ? (
            <button
              onClick={onStartGame}
              className="px-3.5 sm:px-4 py-1.5 bg-linear-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{TXT.startGame}</span>
            </button>
          ) : gameStatus === 'playing' ? (
            <button
              onClick={onPauseGame}
              className="px-3 sm:px-3.5 py-1.5 bg-linear-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-slate-950" />
              <span>{TXT.stopGame}</span>
            </button>
          ) : gameStatus === 'paused' ? (
            <button
              onClick={onResumeGame}
              className="px-3 sm:px-3.5 py-1.5 bg-linear-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{TXT.resumeGame}</span>
            </button>
          ) : (
            <button
              onClick={onStartGame}
              className="px-3 sm:px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{TXT.playAgain}</span>
            </button>
          )}
        </div>

        {/* Stopwatch & Penalties Badge */}
        <div className="relative flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-xs sm:text-sm md:text-base font-black text-amber-300 leading-none">
            {formattedTime}
          </span>

          {penaltySeconds > 0 && (
            <span className="text-[10px] text-rose-400 font-bold bg-rose-950/60 border border-rose-900/60 px-1.5 py-0.2 rounded font-mono ml-0.5">
              +{penaltySeconds}s
            </span>
          )}

          {/* Floating penalty alert notification */}
          {lastPenaltyAlert && (
            <div
              role="status"
              aria-live="assertive"
              className="absolute -top-3.5 right-0 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-rose-400 animate-bounce flex items-center gap-0.5 z-20 whitespace-nowrap"
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>{penaltyAlertText}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-[120px] sm:max-w-xs hidden xs:flex flex-col gap-0.5">
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-300">
            <span>{placedCount}/{totalTiles} fitxa</span>
            <span className="text-amber-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right utility buttons: Rules & Reset */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenRules}
            title={TXT.ruleHintTitle}
            aria-label={TXT.ruleHintTitle}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onResetGame}
            title={TXT.resetGame}
            aria-label={TXT.resetGame}
            disabled={!allowReset}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-900/40 hover:text-rose-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
