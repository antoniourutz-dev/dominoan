import type { DominoTile } from '../data/dominoSets.ts';
import { getSupabaseClient } from '../lib/supabase.ts';

const CACHE_KEY = 'domino_practice_pairs_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface PracticePair {
  word: string;
  synonym: string;
  source: 'synonimoak_2' | 'synonym_groups';
  difficulty?: number;
  theme?: string;
  example?: string;
}

interface CachedPracticePairs {
  savedAt: number;
  pairs: PracticePair[];
}

function normalizeWord(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function extractSynonyms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeWord).filter(Boolean);
}

export function normalizePracticePairs(
  legacyRows: Array<Record<string, unknown>>,
  groupRows: Array<Record<string, unknown>>,
): PracticePair[] {
  const candidates: PracticePair[] = [];

  for (const row of legacyRows) {
    const word = normalizeWord(row.hitza);
    for (const synonym of extractSynonyms(row.sinonimoak)) {
      candidates.push({
        word,
        synonym,
        source: 'synonimoak_2',
        difficulty: typeof row.level === 'number' ? row.level : undefined,
      });
    }
  }

  for (const row of groupRows) {
    const word = normalizeWord(row.word);
    for (const synonym of extractSynonyms(row.synonyms)) {
      candidates.push({
        word,
        synonym,
        source: 'synonym_groups',
        difficulty: typeof row.difficulty === 'number' ? row.difficulty : undefined,
        theme: normalizeWord(row.theme) || undefined,
        example: normalizeWord(row.example_sentence) || undefined,
      });
    }
  }

  const unique = new Map<string, PracticePair>();
  for (const pair of candidates) {
    const left = pair.word.toLocaleUpperCase('eu');
    const right = pair.synonym.toLocaleUpperCase('eu');
    if (!left || !right || left === right) continue;
    const key = [left, right].sort().join('::');
    if (!unique.has(key)) unique.set(key, pair);
  }
  return Array.from(unique.values());
}

function shuffled<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createPracticeTiles(
  pairs: PracticePair[],
  count = 12,
  rng: () => number = Math.random,
): DominoTile[] {
  const selected: PracticePair[] = [];
  const usedWords = new Set<string>();
  const legacyPairs = shuffled(pairs.filter(pair => pair.source === 'synonimoak_2'), rng);
  const groupedPairs = shuffled(pairs.filter(pair => pair.source === 'synonym_groups'), rng);
  const candidates: PracticePair[] = [];
  const longestPool = Math.max(legacyPairs.length, groupedPairs.length);
  for (let index = 0; index < longestPool; index++) {
    if (legacyPairs[index]) candidates.push(legacyPairs[index]);
    if (groupedPairs[index]) candidates.push(groupedPairs[index]);
  }

  for (const pair of candidates) {
    const word = pair.word.toLocaleUpperCase('eu');
    const synonym = pair.synonym.toLocaleUpperCase('eu');
    if (usedWords.has(word) || usedWords.has(synonym)) continue;
    selected.push(pair);
    usedWords.add(word);
    usedWords.add(synonym);
    if (selected.length === count) break;
  }

  if (selected.length < count) {
    throw new Error(`Ez dago nahikoa sinonimo pare bakar: ${selected.length}/${count}`);
  }

  return selected.map((pair, index) => {
    const previousPair = selected[(index - 1 + selected.length) % selected.length];
    return {
      id: `practice-${pair.source}-${Date.now()}-${index}`,
      left: previousPair.synonym.toLocaleUpperCase('eu'),
      right: pair.word.toLocaleUpperCase('eu'),
      notes: `${pair.word} = ${pair.synonym}`,
    };
  });
}

function readCachedPairs(): PracticePair[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const cached = JSON.parse(raw) as CachedPracticePairs;
    if (Date.now() - cached.savedAt > CACHE_TTL_MS || !Array.isArray(cached.pairs)) return [];
    return cached.pairs;
  } catch {
    return [];
  }
}

function cachePairs(pairs: PracticePair[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), pairs }));
  } catch {
    // Practice still works for the current session without persistent cache.
  }
}

export async function loadPracticePairPool(): Promise<{
  pairs: PracticePair[];
  source: 'supabase' | 'cache';
}> {
  try {
    const supabase = getSupabaseClient();
    const [legacyResult, groupsResult] = await Promise.all([
      supabase
        .from('synonimoak_2')
        .select('level, hitza, sinonimoak')
        .eq('active', true)
        .limit(750),
      supabase
        .from('synonym_groups')
        .select('word, synonyms, difficulty, theme, example_sentence')
        .eq('active', true)
        .limit(750),
    ]);

    if (legacyResult.error) throw legacyResult.error;
    if (groupsResult.error) throw groupsResult.error;

    const pairs = normalizePracticePairs(
      (legacyResult.data || []) as Array<Record<string, unknown>>,
      (groupsResult.data || []) as Array<Record<string, unknown>>,
    );
    if (pairs.length < 12) throw new Error('Ez dago nahikoa praktika edukirik Supabase-n.');
    cachePairs(pairs);
    return { pairs, source: 'supabase' };
  } catch (error) {
    const cached = readCachedPairs();
    if (cached.length >= 12) return { pairs: cached, source: 'cache' };
    throw error;
  }
}
