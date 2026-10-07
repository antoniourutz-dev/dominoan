import assert from 'node:assert/strict';
import test from 'node:test';
import { canResetAttempt, shouldPublishScore } from '../src/domain/gameMode.ts';

test('only the official daily mode publishes a score', () => {
  assert.equal(shouldPublishScore('daily'), true);
  assert.equal(shouldPublishScore('practice'), false);
});

test('official attempts cannot reset after starting, while practice can', () => {
  assert.equal(canResetAttempt('daily', 'idle'), true);
  assert.equal(canResetAttempt('daily', 'playing'), false);
  assert.equal(canResetAttempt('daily', 'paused'), false);
  assert.equal(canResetAttempt('practice', 'playing'), true);
  assert.equal(canResetAttempt('practice', 'paused'), true);
  assert.equal(canResetAttempt('practice', 'finished'), true);
});
