import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  AlertTriangle,
  Medal,
  Award,
  Flame,
  User,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  getDailyLeaderboard,
  getDailyLeaderboardAsync,
  getWeeklyLeaderboard,
  getWeeklyLeaderboardAsync,
  getTodayDateString,
  getMondayOfCurrentWeek,
  formatWeekRange,
  ScoreRecord,
  WeeklyUserSummary,
} from '../utils/leaderboard';
import { TXT } from '../utils/texts';
import { formatCleanStudentName } from '../lib/supabase';

interface LeaderboardViewProps {
  currentUser: string;
  onPlayToday: () => void;
  onOpenAuth?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  onPlayToday,
  onOpenAuth,
}) => {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [dailyScores, setDailyScores] = useState<ScoreRecord[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklyUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentMonday = getMondayOfCurrentWeek();
  const weekRangeText = formatWeekRange(currentMonday);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    // Initial sync load
    setDailyScores(getDailyLeaderboard(selectedDate));
    setWeeklySummaries(getWeeklyLeaderboard(currentMonday));

    // Supabase async live fetch
    Promise.all([
      getDailyLeaderboardAsync(selectedDate),
      getWeeklyLeaderboardAsync(currentMonday),
    ]).then(([dScores, wScores]) => {
      if (active) {
        setDailyScores(dScores);
        setWeeklySummaries(wScores);
        setIsLoading(false);
      }
    }).catch(() => {
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [selectedDate, currentUser]);

  const formatMs = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  const getMedalBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400 text-amber-400 flex items-center justify-center font-black text-xs">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-slate-300/20 border border-slate-300 text-slate-200 flex items-center justify-center font-black text-xs">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-700/20 border border-amber-600 text-amber-500 flex items-center justify-center font-black text-xs">
          🥉
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs font-mono">
        #{rank}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 py-1 sm:py-2 select-none">
      {/* Top Banner with Active User & Week Cycle info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                {TXT.leaderboardTab}
              </span>
              <span className="text-[10px] bg-amber-500/20 border border-amber-400/50 text-amber-300 px-2 py-0.2 rounded-full font-bold">
                Sustrai App
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <User className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 font-bold truncate">
                {formatCleanStudentName(currentUser)}
              </span>
              <button
                onClick={onOpenAuth}
                className="ml-1 text-[10px] text-amber-400 hover:underline font-bold cursor-pointer"
              >
                ({TXT.changeUser})
              </button>
            </div>
          </div>
        </div>

        {/* Action Button & Tabs Switch */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                tab === 'daily'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{TXT.dailyLeaderboard}</span>
            </button>

            <button
              onClick={() => setTab('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                tab === 'weekly'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Medal className="w-3.5 h-3.5" />
              <span>{TXT.weeklyLeaderboard}</span>
            </button>
          </div>

          <button
            onClick={onPlayToday}
            className="px-3.5 py-2 bg-linear-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden xs:inline">{TXT.startGame}</span>
          </button>
        </div>
      </div>

      {/* DAILY LEADERBOARD TAB */}
      {tab === 'daily' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-white uppercase">
                {TXT.dailyTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                {selectedDate}
              </span>
            </div>
            <span className="text-[10px] text-amber-400/90 font-medium hidden sm:inline">
              12 fitxa · Ziklo itxia
            </span>
          </div>

          {/* Scores Table */}
          <div className="flex flex-col gap-1.5 overflow-x-auto">
            {dailyScores.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-bold">
                {TXT.noScoresToday}
              </div>
            ) : (
              dailyScores.map((score, index) => {
                const rank = index + 1;
                const isCurrent = score.userId === currentUser;

                return (
                  <div
                    key={score.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-sm ring-1 ring-amber-500/40'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Rank & User */}
                    <div className="flex items-center gap-2 min-w-0">
                      {getMedalBadge(rank)}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-xs font-black truncate ${
                            isCurrent ? 'text-amber-300 font-black' : 'text-slate-200'
                          }`}
                        >
                          {formatCleanStudentName(score.userName || score.userId)} {isCurrent && '(Zu)'}
                        </span>
                        {score.penaltySeconds > 0 && (
                          <span className="text-[9px] text-rose-400 font-bold">
                            +{score.penaltySeconds}s zigorra
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time breakdown */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-xs sm:text-sm font-black text-amber-300">
                          {formatMs(score.effectiveMs)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Garbia: {formatMs(score.rawMs)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* WEEKLY LEADERBOARD TAB (Monday Cycle) */}
      {tab === 'weekly' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-white uppercase">
                {TXT.weeklyLeaderboard}
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md">
                {weekRangeText}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">
              {TXT.mondayCycleNotice}
            </span>
          </div>

          {/* Weekly Summary Table */}
          <div className="flex flex-col gap-1.5">
            {weeklySummaries.map((summary) => {
              const isCurrent = summary.userId === currentUser;
              const rank = summary.rank || 1;

              return (
                <div
                  key={summary.userId}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-sm ring-1 ring-amber-500/40'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getMedalBadge(rank)}
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-xs font-black truncate ${
                          isCurrent ? 'text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        {formatCleanStudentName(summary.userName || summary.userId)} {isCurrent && '(Zu)'}
                      </span>
                      <span className="text-[9.5px] text-slate-400">
                        {summary.daysCompleted}/7 egun osatuta
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        {TXT.avgTime}
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-black text-amber-300">
                        {formatMs(summary.avgEffectiveMs)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
