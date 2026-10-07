import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DAILY_CYCLE_MAP,
  areSynonyms,
  getDaily12Tiles,
} from '../src/data/dominoSets.ts';

test('each weekday contains one closed cycle of 12 documented links', () => {
  for (const { tiles } of Object.values(DAILY_CYCLE_MAP)) {
    assert.equal(tiles.length, 12);

    tiles.forEach((tile, index) => {
      const next = tiles[(index + 1) % tiles.length];
      assert.equal(
        tile.notes?.toLocaleUpperCase('eu'),
        `${tile.right} = ${next.left}`.toLocaleUpperCase('eu'),
      );
      assert.equal(areSynonyms(tile.right, next.left, tiles), true);
    });
  }
});

test('the weekly curriculum has 84 tiles and no repeated word positions', () => {
  const allTiles = Object.values(DAILY_CYCLE_MAP).flatMap(day => day.tiles);
  const words = allTiles.flatMap(tile => [tile.left, tile.right]);
  const normalized = words.map(word => word.trim().toLocaleUpperCase('eu'));

  assert.equal(allTiles.length, 84);
  assert.equal(normalized.length, 168);
  assert.equal(new Set(normalized).size, normalized.length);
});

test('daily tile identifiers include the requested date and remain unique', () => {
  const date = '2026-10-06';
  const tiles = getDaily12Tiles(date);

  assert.equal(tiles.length, 12);
  assert.equal(new Set(tiles.map(tile => tile.id)).size, 12);
  assert.ok(tiles.every(tile => tile.id.startsWith(`daily-${date}-`)));
});
