/**
 * Daily Challenge and Weekly Monday-Cycle Leaderboard system
 * 100% Real Supabase-backed player scores (Zero fake/seeded mock scores)
 */

import {
  fetchDailyLeaderboardFromSupabase,
  fetchWeeklyScoresFromSupabase,
  ScoreRow,
} from '../lib/supabase';

export interface ScoreRecord {
  id: string;
  userId: string;
  userName: string;
  dateStr: string; // YYYY-MM-DD
  rawMs: number;
  penaltySeconds: number;
  effectiveMs: number;
  tilesCount: number;
  timestamp: number;
}

export interface WeeklyUserSummary {
  userId: string;
  userName: string;
  daysCompleted: number;
  totalEffectiveMs: number;
  avgEffectiveMs: number;
  bestEffectiveMs: number;
  rank?: number;
}

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get the Monday of the current week (ISO week)
export function getMondayOfCurrentWeek(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Format week range in Basque (e.g. "Urriak 5 - Urriak 11")
export function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monthNames = [
    'Urtarrilak', 'Otsailak', 'Martxoak', 'Apirilak', 'Maiatzak', 'Ekainak',
    'Uztailak', 'Abuztuak', 'Irailak', 'Urriak', 'Azaroak', 'Abenduak'
  ];

  return `${monthNames[monday.getMonth()]} ${monday.getDate()} – ${monthNames[sunday.getMonth()]} ${sunday.getDate()}`;
}

const STORAGE_KEY_SCORES = 'domino_sustrai_scores_v2';
const STORAGE_KEY_USER = 'domino_sustrai_active_user_v2';

export function getStoredUser(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_USER) || '';
  } catch {
    return '';
  }
}

export function setStoredUser(userId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, userId);
  } catch {
    // Ignore
  }
}

export function getAllSavedScores(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCORES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUserScore(record: Omit<ScoreRecord, 'id'>): ScoreRecord {
  const newRecord: ScoreRecord = {
    ...record,
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  try {
    const existing = getAllSavedScores();
    const filtered = existing.filter(
      r => !(r.userId === newRecord.userId && r.dateStr === newRecord.dateStr)
    );
    filtered.push(newRecord);
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(filtered));
  } catch {
    // Ignore
  }

  return newRecord;
}

// Calculate hours, minutes, seconds left until tomorrow's midnight
export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();

  const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { hours, minutes, seconds, formatted };
}

/**
 * Get REAL daily leaderboard from Supabase
 */
export async function getDailyLeaderboardAsync(dateStr: string): Promise<ScoreRecord[]> {
  const map = new Map<string, ScoreRecord>();

  // 1. Query real registered player scores from Supabase
  try {
    const supabaseRows = await fetchDailyLeaderboardFromSupabase(dateStr);
    supabaseRows.forEach(row => {
      map.set(row.user_id, {
        id: row.id || `sp-${row.user_id}-${row.date_str}`,
        userId: row.user_id,
        userName: row.user_name || row.user_id,
        dateStr: row.date_str,
        rawMs: Number(row.raw_ms),
        penaltySeconds: Number(row.penalty_seconds),
        effectiveMs: Number(row.effective_ms),
        tilesCount: Number(row.tiles_count),
        timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      });
    });
  } catch (e) {
    console.warn('Error fetching Supabase daily leaderboard:', e);
  }

  // 2. Fallback check local device submission if offline
  const localScores = getAllSavedScores().filter(r => r.dateStr === dateStr);
  localScores.forEach(r => {
    if (!map.has(r.userId)) {
      map.set(r.userId, r);
    }
  });

  const list = Array.from(map.values());
  list.sort((a, b) => a.effectiveMs - b.effectiveMs);
  return list;
}

/**
 * Synchronous cached fallback for immediate UI rendering
 */
export function getDailyLeaderboard(dateStr: string): ScoreRecord[] {
  const localScores = getAllSavedScores().filter(r => r.dateStr === dateStr);
  localScores.sort((a, b) => a.effectiveMs - b.effectiveMs);
  return localScores;
}

/**
 * Get REAL weekly leaderboard from Supabase (aggregating all days from Monday to Sunday)
 */
export async function getWeeklyLeaderboardAsync(monday: Date): Promise<WeeklyUserSummary[]> {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    days.push(getTodayDateString(cur));
  }

  const startDate = days[0];
  const endDate = days[6];

  const userAggregates = new Map<string, {
    userId: string;
    userName: string;
    scores: ScoreRecord[];
  }>();

  // Query real weekly scores from Supabase
  try {
    const realWeeklyRows = await fetchWeeklyScoresFromSupabase(startDate, endDate);
    realWeeklyRows.forEach(row => {
      if (!userAggregates.has(row.user_id)) {
        userAggregates.set(row.user_id, {
          userId: row.user_id,
          userName: row.user_name || row.user_id,
          scores: [],
        });
      }
      const existingUserScores = userAggregates.get(row.user_id)!.scores;
      const dayIdx = existingUserScores.findIndex(s => s.dateStr === row.date_str);
      const formattedRec: ScoreRecord = {
        id: row.id || `sp-${row.user_id}-${row.date_str}`,
        userId: row.user_id,
        userName: row.user_name || row.user_id,
        dateStr: row.date_str,
        rawMs: Number(row.raw_ms),
        penaltySeconds: Number(row.penalty_seconds),
        effectiveMs: Number(row.effective_ms),
        tilesCount: Number(row.tiles_count),
        timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      };
      if (dayIdx >= 0) {
        existingUserScores[dayIdx] = formattedRec;
      } else {
        existingUserScores.push(formattedRec);
      }
    });
  } catch (err) {
    console.warn('Error querying Supabase weekly scores:', err);
  }

  // Also include any locally saved scores on this device
  const localScores = getAllSavedScores().filter(s => s.dateStr >= startDate && s.dateStr <= endDate);
  localScores.forEach(loc => {
    if (!userAggregates.has(loc.userId)) {
      userAggregates.set(loc.userId, {
        userId: loc.userId,
        userName: loc.userName || loc.userId,
        scores: [],
      });
    }
    const scores = userAggregates.get(loc.userId)!.scores;
    if (!scores.some(s => s.dateStr === loc.dateStr)) {
      scores.push(loc);
    }
  });

  const summaries: WeeklyUserSummary[] = [];

  userAggregates.forEach(agg => {
    const daysCount = agg.scores.length;
    if (daysCount === 0) return;

    const totalMs = agg.scores.reduce((sum, s) => sum + s.effectiveMs, 0);
    const avgMs = Math.round(totalMs / daysCount);
    const bestMs = Math.min(...agg.scores.map(s => s.effectiveMs));

    summaries.push({
      userId: agg.userId,
      userName: agg.userName,
      daysCompleted: daysCount,
      totalEffectiveMs: totalMs,
      avgEffectiveMs: avgMs,
      bestEffectiveMs: bestMs,
    });
  });

  // Sort by daysCompleted descending, then avgEffectiveMs ascending
  summaries.sort((a, b) => {
    if (b.daysCompleted !== a.daysCompleted) {
      return b.daysCompleted - a.daysCompleted;
    }
    return a.avgEffectiveMs - b.avgEffectiveMs;
  });

  summaries.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return summaries;
}

export function getWeeklyLeaderboard(monday: Date): WeeklyUserSummary[] {
  // Synchronous initial state: empty or local device
  return [];
}
