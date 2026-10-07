import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateEffectiveMs } from '../src/domain/score.ts';

test('effective time combines rounded raw time and penalty seconds', () => {
  assert.equal(calculateEffectiveMs(12_345.4, 10), 22_345);
  assert.equal(calculateEffectiveMs(12_345.6, 5), 17_346);
});

test('effective time rejects invalid values', () => {
  assert.throws(() => calculateEffectiveMs(-1, 0), RangeError);
  assert.throws(() => calculateEffectiveMs(1_000, -5), RangeError);
  assert.throws(() => calculateEffectiveMs(Number.NaN, 0), RangeError);
});
