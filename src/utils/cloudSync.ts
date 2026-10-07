/**
 * Authentication and Cloud Data Sync Layer (Supabase & Sustrai Accounts)
 * Manages Sustrai student sessions, scores, and cloud persistence.
 */

import { ScoreRecord, getAllSavedScores, saveUserScore, getTodayDateString } from './leaderboard';
import {
  submitScoreToSupabase,
  ScoreRow,
} from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarSeed: string;
  role: 'student' | 'teacher';
  createdAt: string;
}

export const DEMO_STUDENTS: UserProfile[] = [
  { id: 'ikasle001', email: 'ikasle001@sustrai.app', displayName: '1. Ikaslea (Ander)', avatarSeed: 'Ander', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle002', email: 'ikasle002@sustrai.app', displayName: '2. Ikaslea (Miren)', avatarSeed: 'Miren', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle003', email: 'ikasle003@sustrai.app', displayName: '3. Ikaslea (Jon)', avatarSeed: 'Jon', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle004', email: 'ikasle004@sustrai.app', displayName: '4. Ikaslea (Ane)', avatarSeed: 'Ane', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle005', email: 'ikasle005@sustrai.app', displayName: '5. Ikaslea (Iker)', avatarSeed: 'Iker', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle006', email: 'ikasle006@sustrai.app', displayName: '6. Ikaslea (Nerea)', avatarSeed: 'Nerea', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle007', email: 'ikasle007@sustrai.app', displayName: '7. Ikaslea (Oier)', avatarSeed: 'Oier', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle008', email: 'ikasle008@sustrai.app', displayName: '8. Ikaslea (Maite)', avatarSeed: 'Maite', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle009', email: 'ikasle009@sustrai.app', displayName: '9. Ikaslea (Unai)', avatarSeed: 'Unai', role: 'student', createdAt: '2026-09-01' },
  { id: 'ikasle010', email: 'ikasle010@sustrai.app', displayName: '10. Ikaslea (Amaia)', avatarSeed: 'Amaia', role: 'student', createdAt: '2026-09-01' },
];

const STORAGE_KEY_AUTH = 'domino_sustrai_authenticated_user_v3';

export function setStoredAuthUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearStoredAuthUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  } catch {
    // ignore
  }
}

/**
 * Sync score to database (Supabase Cloud & local caching)
 */
export async function syncScoreToCloud(score: Omit<ScoreRecord, 'id'>): Promise<{ success: boolean; id: string; error?: string }> {
  // Always cache locally
  const record = saveUserScore(score);

  // Directly push to Supabase table
  const scoreRow: ScoreRow = {
    user_id: score.userId,
    user_name: score.userName,
    date_str: score.dateStr,
    raw_ms: score.rawMs,
    penalty_seconds: score.penaltySeconds,
    effective_ms: score.effectiveMs,
    tiles_count: score.tilesCount,
  };

  const res = await submitScoreToSupabase(scoreRow);

  return { success: res.success, id: record.id, error: res.error };
}
