export const PENALTY_SECONDS_PER_ACTION = 5;

export function calculateEffectiveMs(rawMs: number, penaltySeconds: number): number {
  if (!Number.isFinite(rawMs) || rawMs < 0) {
    throw new RangeError('rawMs must be a finite, non-negative number');
  }
  if (!Number.isFinite(penaltySeconds) || penaltySeconds < 0) {
    throw new RangeError('penaltySeconds must be a finite, non-negative number');
  }

  return Math.round(rawMs) + Math.round(penaltySeconds) * 1000;
}
