export type GameMode = 'daily' | 'practice';

export function shouldPublishScore(mode: GameMode): boolean {
  return mode === 'daily';
}

export function canResetAttempt(mode: GameMode, status: 'idle' | 'playing' | 'paused' | 'finished'): boolean {
  return mode === 'practice' || status === 'idle';
}
