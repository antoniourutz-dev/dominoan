import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_PENDING_SCORES = 'domino_pending_scores_v1';

export interface ProfileRow {
  id: string;
  email: string;
  display_name: string;
  role?: string;
  created_at?: string;
}

export interface ScoreRow {
  id?: string;
  user_id: string;
  user_name: string;
  date_str: string;
  raw_ms: number;
  penalty_seconds: number;
  effective_ms: number;
  tiles_count: number;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarSeed: string;
  role: 'student' | 'teacher';
  createdAt: string;
}

/**
 * Strips @sustrai.app and any random hash suffixes (e.g. "ikasle001_43a628" -> "ikasle001")
 * so the student ONLY sees their clean, readable name on screen.
 */
export function formatCleanStudentName(input?: string | null): string {
  if (!input) return '';
  let clean = input.trim();
  clean = clean.replace(/@sustrai\.app$/i, '');
  clean = clean.replace(/@.*$/i, '');
  clean = clean.replace(/_[a-f0-9]{4,8}$/i, '');
  clean = clean.replace(/-[a-f0-9]{4,8}$/i, '');
  return clean || 'Ikaslea';
}

/**
 * Normalizes user input so that typing "ikasle001" automatically resolves to "ikasle001@sustrai.app"
 */
export function normalizeSustraiEmail(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return '';
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed}@sustrai.app`;
}

/**
 * Helper to check if a user is the teacher ("irakasle@sustrai.app")
 */
export function isTeacher(user: UserProfile | { email: string; role?: string } | null | undefined): boolean {
  return Boolean(user && user.role === 'teacher');
}

/**
 * Production credentials are deployment configuration, never mutable browser state.
 */
export function getActiveSupabaseCredentials(): { url: string; anonKey: string; isUserConfigured: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  return { url: envUrl, anonKey: envKey, isUserConfigured: Boolean(envUrl && envKey) };
}

let _cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_cachedClient) return _cachedClient;

  const { url, anonKey } = getActiveSupabaseCredentials();
  if (!url || !anonKey) {
    throw new Error('Supabase ez dago konfiguratuta. Ezarri VITE_SUPABASE_URL eta VITE_SUPABASE_ANON_KEY.');
  }
  _cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return _cachedClient;
}

/**
 * REAL SUPABASE AUTHENTICATION: Sign in with email and password
 * Validates the student's password in Supabase Auth!
 */
export async function signInWithSupabaseAuth(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = normalizeSustraiEmail(emailOrUsername);
  if (!cleanEmail) {
    return { success: false, error: 'Idatzi zure erabiltzailea mesedez (adib. ikasle001).' };
  }
  if (!password) {
    return { success: false, error: 'Idatzi zure Supabase pasahitza mesedez.' };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error) {
      const authError = error.message.toLowerCase();
      let msg = 'Ezin izan da saioa hasi. Saiatu berriro.';
      if (authError.includes('invalid login credentials') || authError.includes('invalid credentials')) {
        msg = 'Erabiltzailea edo pasahitza ez da zuzena. Egiaztatu datuak.';
      } else if (authError.includes('email not confirmed')) {
        msg = 'Kontua oraindik ez dago baieztatuta. Egiaztatu posta elektronikoa.';
      }
      return { success: false, error: msg };
    }

    if (!data.user) {
      return { success: false, error: 'Ezin izan da saioa hasi Supabase-n.' };
    }

    let role: 'student' | 'teacher' = 'student';
    const rawDisplayName = data.user.user_metadata?.display_name || cleanEmail.split('@')[0];
    let profileName = formatCleanStudentName(rawDisplayName);

    // Read or sync profile from public.profiles
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile && profile.display_name) {
        profileName = formatCleanStudentName(profile.display_name);
      }
      if (profile?.role === 'teacher') {
        role = 'teacher';
      }
    } catch {
      // Ignore if table not created
    }

    const user: UserProfile = {
      id: cleanEmail,
      email: cleanEmail,
      displayName: profileName,
      avatarSeed: profileName,
      role: role as 'student' | 'teacher',
      createdAt: data.user.created_at || new Date().toISOString(),
    };

    return { success: true, user };
  } catch {
    return { success: false, error: 'Errorea Supabase-ra konektatzean.' };
  }
}

/**
 * REAL SUPABASE AUTHENTICATION: Sign up a new student/teacher with email & password in Supabase Auth
 */
export async function signUpWithSupabaseAuth(
  emailOrUsername: string,
  password: string,
  displayName?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string; requiresEmailConfirm?: boolean }> {
  const cleanEmail = normalizeSustraiEmail(emailOrUsername);
  if (!cleanEmail) {
    return { success: false, error: 'Idatzi zure erabiltzailea mesedez (adib. ikasle001).' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Pasahitzak gutxienez 6 karaktere izan behar ditu Supabase-n.' };
  }

  const cleanName = formatCleanStudentName(displayName?.trim() || cleanEmail.split('@')[0]);
    // Elevated roles are provisioned by an administrator, never by public sign-up.
    const role: 'student' = 'student';

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          display_name: cleanName,
          role: role,
        },
      },
    });

    if (error) {
      const authError = error.message.toLowerCase();
      if (authError.includes('already registered') || authError.includes('already been registered')) {
        return { success: false, error: 'Erabiltzailea dagoeneko erregistratuta dago.' };
      }
      if (authError.includes('password')) {
        return { success: false, error: 'Pasahitzak ez ditu segurtasun-baldintzak betetzen.' };
      }
      if (authError.includes('rate limit') || authError.includes('too many requests')) {
        return { success: false, error: 'Saiakera gehiegi egin dira. Itxaron pixka bat eta saiatu berriro.' };
      }
      return { success: false, error: 'Ezin izan da erabiltzailea erregistratu. Saiatu berriro.' };
    }

    if (!data.user) {
      return { success: false, error: 'Ezin izan da erabiltzailea sortu.' };
    }

    // Try to record in profiles table
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: cleanEmail,
        display_name: cleanName,
        role: role,
      });
    } catch {
      // Ignore
    }

    const user: UserProfile = {
      id: cleanEmail,
      email: cleanEmail,
      displayName: cleanName,
      avatarSeed: cleanName,
      role: role as 'student' | 'teacher',
      createdAt: data.user.created_at || new Date().toISOString(),
    };

    const requiresConfirm = !data.session && Boolean(data.user && !data.user.confirmed_at);

    return { success: true, user, requiresEmailConfirm: requiresConfirm };
  } catch {
    return { success: false, error: 'Errorea erregistratzean.' };
  }
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutFromSupabase(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore
  }
}

/**
 * Gets currently logged in user session from Supabase Auth
 */
export async function getCurrentSupabaseSessionUser(): Promise<UserProfile | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && session.user.email) {
      const email = session.user.email;
      let cleanName = formatCleanStudentName(session.user.user_metadata?.display_name || email.split('@')[0]);
      let role: 'student' | 'teacher' = 'student';

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.display_name) {
        cleanName = formatCleanStudentName(profile.display_name);
      }
      if (profile?.role === 'teacher') {
        role = 'teacher';
      }

      return {
        id: email,
        email: email,
        displayName: cleanName,
        avatarSeed: cleanName,
        role: role as 'student' | 'teacher',
        createdAt: session.user.created_at || new Date().toISOString(),
      };
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Checks if the student has already played today's challenge in Supabase
 * Strict requirement: "el desafio sera diario y una vez jugado no se podra hasta el día siguiente"
 */
export async function checkHasPlayedToday(userId: string, dateStr: string): Promise<{ played: boolean; score?: ScoreRow }> {
  const cleanId = normalizeSustraiEmail(userId);

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', cleanId)
      .eq('date_str', dateStr)
      .maybeSingle();

    if (!error && data) {
      const scoreRow = data as ScoreRow;
      try {
        localStorage.setItem(`sustrai_played_${cleanId}_${dateStr}`, JSON.stringify(scoreRow));
      } catch {
        // Ignore
      }
      return { played: true, score: scoreRow };
    }
  } catch (err) {
    console.warn('Supabase checkHasPlayedToday check:', err);
  }

  // Backup check in local storage if offline
  try {
    const localFlag = localStorage.getItem(`sustrai_played_${cleanId}_${dateStr}`);
    if (localFlag) {
      return { played: true, score: JSON.parse(localFlag) };
    }
  } catch {
    // Ignore
  }

  return { played: false };
}

/**
 * Deletes/resets a student's daily game from Supabase (Teacher only)
 */
export async function resetUserDailyScore(userId: string, dateStr?: string): Promise<{ success: boolean; message?: string }> {
  const cleanId = normalizeSustraiEmail(userId);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = dateStr || `${year}-${month}-${day}`;

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('reset_daily_score', {
      target_user_id: cleanId,
      target_date_str: todayStr,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // Local state is cleared only after the authorised server operation succeeds.
    try {
      localStorage.removeItem(`sustrai_played_${cleanId}_${todayStr}`);
    } catch {
      // The database reset is authoritative.
    }

    return { success: true, message: `${cleanId} erabiltzailearen gaurko partida garbitu da Supabase-tik.` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Errorea partida garbitzean' };
  }
}

/**
 * Submits the score directly to Supabase table `scores`
 */
export async function submitScoreToSupabase(score: ScoreRow): Promise<{ success: boolean; data?: any; error?: string }> {
  const cleanId = normalizeSustraiEmail(score.user_id);
  const normalizedScore: ScoreRow = {
    ...score,
    user_id: cleanId,
    raw_ms: Math.round(score.raw_ms),
    penalty_seconds: Math.round(score.penalty_seconds),
    effective_ms: Math.round(score.effective_ms),
  };

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scores')
      .insert({
        user_id: cleanId,
        user_name: normalizedScore.user_name,
        date_str: normalizedScore.date_str,
        raw_ms: normalizedScore.raw_ms,
        penalty_seconds: normalizedScore.penalty_seconds,
        effective_ms: normalizedScore.effective_ms,
        tiles_count: normalizedScore.tiles_count,
      })
      .select();

    if (error) {
      // A lost response followed by a retry may hit the daily unique constraint.
      // In that case the immutable score is already safely stored.
      if (error.code === '23505') {
        return { success: true };
      }
      console.warn('Supabase submitScore warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Supabase submitScore fatal error:', err);
    return { success: false, error: err?.message || 'Errorea Supabase-n gordetzean' };
  }
}

function completedScoreKey(score: ScoreRow): string {
  return `sustrai_played_${normalizeSustraiEmail(score.user_id)}_${score.date_str}`;
}

function readPendingScores(): ScoreRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_PENDING_SCORES);
    return raw ? JSON.parse(raw) as ScoreRow[] : [];
  } catch {
    return [];
  }
}

function writePendingScores(scores: ScoreRow[]): void {
  try {
    localStorage.setItem(STORAGE_PENDING_SCORES, JSON.stringify(scores));
  } catch {
    // Storage can be unavailable in private browsing. The caller still receives
    // the network result and can communicate the failure to the player.
  }
}

function queuePendingScore(score: ScoreRow): void {
  const normalized = { ...score, user_id: normalizeSustraiEmail(score.user_id) };
  const pending = readPendingScores().filter(
    item => !(item.user_id === normalized.user_id && item.date_str === normalized.date_str)
  );
  pending.push(normalized);
  writePendingScores(pending);

  try {
    localStorage.setItem(completedScoreKey(normalized), JSON.stringify(normalized));
  } catch {
    // Ignore; pending network submission can still succeed.
  }
}

function removePendingScore(score: ScoreRow): void {
  writePendingScores(readPendingScores().filter(
    item => !(item.user_id === normalizeSustraiEmail(score.user_id) && item.date_str === score.date_str)
  ));
}

/**
 * Durable score submission: queue first, then remove the queue entry only after
 * the database confirms the immutable daily result exists.
 */
export async function submitScoreReliably(
  score: ScoreRow
): Promise<{ success: boolean; queued: boolean; error?: string }> {
  queuePendingScore(score);
  const result = await submitScoreToSupabase(score);
  if (result.success) {
    removePendingScore(score);
  }
  return { success: result.success, queued: !result.success, error: result.error };
}

export async function flushPendingScores(): Promise<void> {
  const pending = readPendingScores();
  for (const score of pending) {
    const result = await submitScoreToSupabase(score);
    if (result.success) {
      removePendingScore(score);
    }
  }
}

/**
 * Fetches today's REAL leaderboard from Supabase (strictly real players)
 */
export async function fetchDailyLeaderboardFromSupabase(dateStr: string): Promise<ScoreRow[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('date_str', dateStr)
      .order('effective_ms', { ascending: true })
      .limit(100);

    if (error) {
      console.warn('Supabase fetchDailyLeaderboard warning:', error.message);
      return [];
    }

    return (data || []) as ScoreRow[];
  } catch (err) {
    console.warn('Supabase fetchDailyLeaderboard exception:', err);
    return [];
  }
}

/**
 * Fetches weekly REAL scores from Supabase (strictly real players between Monday and Sunday)
 */
export async function fetchWeeklyScoresFromSupabase(startDateStr: string, endDateStr: string): Promise<ScoreRow[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .gte('date_str', startDateStr)
      .lte('date_str', endDateStr)
      .order('effective_ms', { ascending: true });

    if (error) {
      console.warn('Supabase fetchWeeklyScores warning:', error.message);
      return [];
    }

    return (data || []) as ScoreRow[];
  } catch (err) {
    console.warn('Supabase fetchWeeklyScores exception:', err);
    return [];
  }
}
