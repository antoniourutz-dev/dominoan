import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Trophy,
  Calendar,
  AlertTriangle,
  Play,
  RotateCcw,
  Database,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ScoreRow } from '../lib/supabase';
import { getTimeUntilMidnight } from '../utils/leaderboard';

interface DailyLockCardProps {
  score: ScoreRow | null;
  onViewLeaderboard: () => void;
  dayName: string;
}

export const DailyLockCard: React.FC<DailyLockCardProps> = ({
  score,
  onViewLeaderboard,
  dayName,
}) => {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMs = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center justify-center py-2 px-3 text-center animate-fadeIn select-none">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 w-full shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -top-10 left-1/2 -translate-x-1/2" />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full mb-2.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gaurko Erronka Osatuta · Emaitza Erregistratua</span>
        </div>

        {/* Main Heading */}
        <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-1">
          {dayName}
        </h2>
        <p className="text-xs text-slate-300 max-w-xs mb-3.5 leading-relaxed">
          Gaurko erronka ofiziala osatuta daukazu jada. Zure emaitza sailkapenean dago eta bihar arte ezin da berriro jokatu!
        </p>

        {/* Score Details Box */}
        {score && (
          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-3 mb-3.5 grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block mb-0.5">
                Zure Denbora:
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-amber-300">
                {formatMs(Number(score.effective_ms))}
              </span>
              <span className="text-[8.5px] text-slate-500 block font-mono">
                Garbia: {formatMs(Number(score.raw_ms))}
              </span>
            </div>

            <div>
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block mb-0.5">
                Zigorrak:
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-rose-400">
                +{score.penalty_seconds}s
              </span>
              <span className="text-[8.5px] text-emerald-400 block font-semibold">
                ✓ 12/12 fitxa
              </span>
            </div>
          </div>
        )}

        {/* Countdown Box */}
        <div className="w-full bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-3 mb-4 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Hurrengo Erronka Berritzeko:</span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
            {countdown.formatted}
          </div>
          <span className="text-[9.5px] text-slate-400 mt-0.5">
            Bihar gauerdian (00:00) 12 fitxa berriekin, hitzik errepikatu gabe!
          </span>
        </div>

        {/* Action Button: View Leaderboard */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onViewLeaderboard}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Ikusi Gaurko Sailkapena</span>
          </button>
        </div>
      </div>
    </div>
  );
};
