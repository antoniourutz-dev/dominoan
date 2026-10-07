import assert from 'node:assert/strict';
import test from 'node:test';
import { createPracticeTiles, normalizePracticePairs } from '../src/services/practiceTiles.ts';
import { areSynonyms } from '../src/data/dominoSets.ts';

const rows = Array.from({ length: 14 }, (_, index) => ({
  hitza: `hitza-${index}`,
  sinonimoak: [`sinonimo-${index}`],
  level: 2,
}));

test('normalizes both Supabase table shapes and removes duplicate pairs', () => {
  const pairs = normalizePracticePairs(
    [{ hitza: 'Azkar', sinonimoak: ['Laster', 'Laster'], level: 1 }],
    [{ word: 'Indartsu', synonyms: ['Sendo'], difficulty: 2 }],
  );
  assert.equal(pairs.length, 2);
  assert.deepEqual(pairs.map(pair => pair.source).sort(), ['synonimoak_2', 'synonym_groups']);
});

test('creates a unique, closed and playable 12-tile practice cycle', () => {
  const pairs = normalizePracticePairs(rows, []);
  const tiles = createPracticeTiles(pairs, 12, () => 0.5);
  const positions = tiles.flatMap(tile => [tile.left, tile.right]);

  assert.equal(tiles.length, 12);
  assert.equal(new Set(positions).size, 24);
  tiles.forEach((tile, index) => {
    const next = tiles[(index + 1) % tiles.length];
    assert.equal(areSynonyms(tile.right, next.left, tiles), true);
  });
});

test('uses both Supabase sources when both contain enough valid pairs', () => {
  const legacy = Array.from({ length: 8 }, (_, index) => ({
    hitza: `legacy-word-${index}`,
    sinonimoak: [`legacy-synonym-${index}`],
  }));
  const groups = Array.from({ length: 8 }, (_, index) => ({
    word: `group-word-${index}`,
    synonyms: [`group-synonym-${index}`],
  }));
  const tiles = createPracticeTiles(normalizePracticePairs(legacy, groups), 12, () => 0.5);

  assert.ok(tiles.some(tile => tile.id.includes('synonimoak_2')));
  assert.ok(tiles.some(tile => tile.id.includes('synonym_groups')));
});
