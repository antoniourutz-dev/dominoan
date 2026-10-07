import React, { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Gamepad2,
  Trophy,
  Calendar,
  User,
  LogOut,
  HelpCircle,
  Database,
  Lock,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  DominoTile,
  getDaily12Tiles,
  areSynonyms,
  DAILY_CYCLE_MAP,
} from './data/dominoSets';
import { TXT } from './utils/texts';
import {
  getTodayDateString,
  setStoredUser,
} from './utils/leaderboard';
import {
  UserProfile,
  setStoredAuthUser,
  clearStoredAuthUser,
} from './utils/cloudSync';
import {
  checkHasPlayedToday,
  flushPendingScores,
  submitScoreReliably,
  signOutFromSupabase,
  isTeacher,
  formatCleanStudentName,
  ScoreRow,
} from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { calculateEffectiveMs } from './domain/score';
import { canResetAttempt, GameMode, shouldPublishScore } from './domain/gameMode';
import {
  createPracticeTiles,
  loadPracticePairPool,
  PracticePair,
} from './services/practiceTiles';
import { ThemeMode, ThemeToggle } from './components/ThemeToggle';

const LeaderboardView = lazy(() => import('./components/LeaderboardView').then(module => ({
  default: module.LeaderboardView,
})));
const VictoryModal = lazy(() => import('./components/VictoryModal').then(module => ({
  default: module.VictoryModal,
})));
const RulesModal = lazy(() => import('./components/RulesModal').then(module => ({
  default: module.RulesModal,
})));
const AuthModal = lazy(() => import('./components/AuthModal').then(module => ({
  default: module.AuthModal,
})));
const TimerStatsBar = lazy(() => import('./components/TimerStatsBar').then(module => ({
  default: module.TimerStatsBar,
})));
const DailyLockCard = lazy(() => import('./components/DailyLockCard').then(module => ({
  default: module.DailyLockCard,
})));
const GameBoard = lazy(() => import('./components/GameBoard').then(module => ({
  default: module.GameBoard,
})));
const PlayerTray = lazy(() => import('./components/PlayerTray').then(module => ({
  default: module.PlayerTray,
})));

const deferredViewFallback = (
  <div role="status" aria-live="polite" className="p-4 text-center text-sm text-slate-300">
    Kargatzen...
  </div>
);

function getDateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      return localStorage.getItem('domino_theme_v1') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  // Authentication First: Player MUST identify themselves before accessing the game
  const [authUser, setAuthUser] = useState<UserProfile | null>(null);

  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard'>('play');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [scoreSyncState, setScoreSyncState] = useState<'saving' | 'synced' | 'pending'>('saving');
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [practicePairs, setPracticePairs] = useState<PracticePair[]>([]);
  const [practiceTiles, setPracticeTiles] = useState<DominoTile[]>([]);
  const [practiceLoadState, setPracticeLoadState] = useState<'locked' | 'loading' | 'supabase' | 'cache' | 'error'>('locked');

  // Daily Challenge One-Time Rule state
  const [hasPlayedToday, setHasPlayedToday] = useState<boolean>(false);
  const [todayScore, setTodayScore] = useState<ScoreRow | null>(null);

  // Game Status: 'idle' | 'playing' | 'paused' | 'finished'
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');

  // Active Game state in central column
  const [activeTile, setActiveTile] = useState<DominoTile | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [deck, setDeck] = useState<DominoTile[]>([]);
  const [hand, setHand] = useState<DominoTile[]>([]);
  const [targetWord, setTargetWord] = useState<string>('');

  // Vanish animation state when words are completed
  const [isVanishing, setIsVanishing] = useState<boolean>(false);
  const [lastMatchedPair, setLastMatchedPair] = useState<{ target: string; matched: string } | null>(null);

  // Timer & Penalty state (Mistakes & Hints add +5s)
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [penaltiesCount, setPenaltiesCount] = useState<number>(0);
  const [penaltySeconds, setPenaltySeconds] = useState<number>(0);
  const [lastPenaltyAlert, setLastPenaltyAlert] = useState<boolean>(false);
  const [penaltyAlertText, setPenaltyAlertText] = useState<string>('+5s Zigorra');

  // Animation states for player hand tiles
  const [shakingTileId, setShakingTileId] = useState<string | null>(null);
  const [correctTileId, setCorrectTileId] = useState<string | null>(null);
  const [hintTileId, setHintTileId] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const hintTimeoutRef = useRef<number | null>(null);

  const todayStr = useMemo(() => getTodayDateString(), []);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem('domino_theme_v1', theme);
    } catch {
      // The selected theme still applies for the current session.
    }
  }, [theme]);

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');

  // Compute day index and name for Monday-Sunday cycle (0=Monday, 6=Sunday)
  const { currentDayIndex, currentDayName } = useMemo(() => {
    const d = new Date();
    const dayOfWeek = d.getDay();
    const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return {
      currentDayIndex: idx,
      currentDayName: DAILY_CYCLE_MAP[idx]?.name || 'Astelehena (1. Eguna)',
    };
  }, []);

  // Check if current user has already completed today's daily challenge
  const refreshDailyPlayedStatus = useCallback(async () => {
    if (!authUser) return;
    try {
      const res = await checkHasPlayedToday(authUser.email, todayStr);
      setHasPlayedToday(res.played);
      setTodayScore(res.score || null);
    } catch {
      // Ignore
    }
  }, [authUser, todayStr]);

  useEffect(() => {
    if (!authUser) return;

    void flushPendingScores().finally(refreshDailyPlayedStatus);

    const retryPendingScores = () => {
      void flushPendingScores().finally(refreshDailyPlayedStatus);
    };
    window.addEventListener('online', retryPendingScores);
    return () => window.removeEventListener('online', retryPendingScores);
  }, [refreshDailyPlayedStatus]);

  // Active tiles: ALWAYS and ONLY today's 12-tile set for the specific day of the week!
  const activePhaseTiles = useMemo(() => {
    return getDaily12Tiles(todayStr);
  }, [todayStr]);

  const activeGameTiles = gameMode === 'practice' ? practiceTiles : activePhaseTiles;

  const refreshPracticeContent = useCallback(async () => {
    setPracticeLoadState('loading');
    try {
      const result = await loadPracticePairPool();
      setPracticePairs(result.pairs);
      setPracticeTiles(createPracticeTiles(result.pairs));
      setPracticeLoadState(result.source);
    } catch {
      setPracticeLoadState('error');
      setPracticeTiles([]);
    }
  }, []);

  useEffect(() => {
    if (!hasPlayedToday) {
      setPracticeLoadState('locked');
      if (gameMode === 'practice') setGameMode('daily');
      return;
    }
    if (practicePairs.length === 0 && practiceLoadState === 'locked') {
      void refreshPracticeContent();
    }
  }, [gameMode, hasPlayedToday, practiceLoadState, practicePairs.length, refreshPracticeContent]);

  const handleUserChange = (newUser: UserProfile | null) => {
    if (newUser) {
      setAuthUser(newUser);
      setStoredAuthUser(newUser);
      setStoredUser(newUser.email);
    } else {
      clearStoredAuthUser();
      setAuthUser(null);
      setHasPlayedToday(false);
      setTodayScore(null);
    }
  };

  const handleLogout = async () => {
    await signOutFromSupabase();
    clearStoredAuthUser();
    setAuthUser(null);
    setHasPlayedToday(false);
    setTodayScore(null);
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const ensurePlayableHand = (
    currentHand: DominoTile[],
    currentDeck: DominoTile[],
    currentTarget: string,
    allTiles: DominoTile[]
  ): { hand: DominoTile[]; deck: DominoTile[] } => {
    const hasMatchInHand = currentHand.some(tile =>
      areSynonyms(tile.left, currentTarget, allTiles)
    );

    if (hasMatchInHand || currentDeck.length === 0) {
      return { hand: currentHand, deck: currentDeck };
    }

    const matchDeckIndex = currentDeck.findIndex(tile =>
      areSynonyms(tile.left, currentTarget, allTiles)
    );

    if (matchDeckIndex === -1) {
      return { hand: currentHand, deck: currentDeck };
    }

    const matchingTile = currentDeck[matchDeckIndex];
    const newDeck = [...currentDeck];
    newDeck.splice(matchDeckIndex, 1);

    const newHand = [...currentHand];
    if (newHand.length >= 6) {
      const swappedOut = newHand.pop()!;
      newDeck.push(swappedOut);
    }
    newHand.unshift(matchingTile);

    return { hand: newHand, deck: newDeck };
  };

  // Setup / Reset current level phase - 100% DETERMINISTIC FOR EVERY PLAYER ON TODAY'S DATE
  const setupBoardAndTiles = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }

    const tiles = activeGameTiles;
    if (!tiles || tiles.length === 0) return;

    // The official layout is deterministic. Practice keeps the same curriculum
    // but varies the starting tile and hand order between repetitions.
    const seed = getDateSeed(todayStr);
    const rng = gameMode === 'daily' ? createSeededRandom(seed) : Math.random;

    const startTileIndex = gameMode === 'daily'
      ? seed % tiles.length
      : Math.floor(rng() * tiles.length);
    const startTile = tiles[startTileIndex];

    const remainingTiles: DominoTile[] = tiles.filter((_tile: DominoTile, idx: number) => idx !== startTileIndex);
    const deterministicRemaining: DominoTile[] = seededShuffle<DominoTile>(remainingTiles, rng);

    const initialTarget = startTile.right;
    const initialHandDraft = deterministicRemaining.slice(0, 6);
    const initialDeckDraft = deterministicRemaining.slice(6);

    const { hand: finalHand, deck: finalDeck } = ensurePlayableHand(
      initialHandDraft,
      initialDeckDraft,
      initialTarget,
      tiles
    );

    setActiveTile(startTile);
    setCompletedCount(0);
    setHand(finalHand);
    setDeck(finalDeck);
    setTargetWord(initialTarget);
    setIsVanishing(false);
    setLastMatchedPair(null);

    setElapsedMs(0);
    accumulatedMsRef.current = 0;
    setPenaltiesCount(0);
    setPenaltySeconds(0);
    setShowVictoryModal(false);
    setShakingTileId(null);
    setCorrectTileId(null);
    setHintTileId(null);
    setLastPenaltyAlert(false);
    setGameStatus('idle');
  }, [activeGameTiles, gameMode, todayStr]);

  // Start the game timer
  const handleStartGame = () => {
    if (gameMode === 'daily' && hasPlayedToday) return;
    if (gameMode === 'practice' && (practiceLoadState === 'loading' || practiceTiles.length === 0)) return;
    startTimeRef.current = Date.now();
    setGameStatus('playing');
  };

  // Pause the game
  const handlePauseGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    accumulatedMsRef.current += Date.now() - startTimeRef.current;
    setElapsedMs(accumulatedMsRef.current);
    setGameStatus('paused');
  };

  // Resume the paused game
  const handleResumeGame = () => {
    startTimeRef.current = Date.now();
    setGameStatus('playing');
  };

  // Reset the game
  const handleResetGame = () => {
    if (!canResetAttempt(gameMode, gameStatus)) return;
    setupBoardAndTiles();
  };

  const handleModeChange = (mode: GameMode) => {
    if (gameStatus === 'playing' || gameStatus === 'paused') return;
    if (mode === 'practice' && (!hasPlayedToday || practiceTiles.length === 0)) return;
    if (mode === 'practice' && practicePairs.length > 0) {
      setPracticeTiles(createPracticeTiles(practicePairs));
    }
    setGameMode(mode);
  };

  // Active game tick
  useEffect(() => {
    if (gameStatus === 'playing') {
      const interval = window.setInterval(() => {
        setElapsedMs(accumulatedMsRef.current + (Date.now() - startTimeRef.current));
      }, 50);
      timerRef.current = interval;
      return () => clearInterval(interval);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [gameStatus]);

  useEffect(() => {
    setupBoardAndTiles();
  }, [setupBoardAndTiles]);

  // Handle Hint Button (+5s penalty and flashes the matching domino in player's hand)
  const handleUseHint = () => {
    if (gameMode === 'practice' && practiceTiles.length === 0) return;
    if (gameStatus !== 'playing') {
      if (gameStatus === 'idle') {
        handleStartGame();
      } else {
        return;
      }
    }

    // Add +5s penalty
    setPenaltySeconds(prev => prev + 5);
    setPenaltiesCount(prev => prev + 1);
    setPenaltyAlertText('+5s Laguntza');
    setLastPenaltyAlert(true);
    setTimeout(() => setLastPenaltyAlert(false), 1400);

    // Find the matching tile in player's hand
    const matchingTile = hand.find(t => areSynonyms(t.left, targetWord, activeGameTiles));
    if (matchingTile) {
      setHintTileId(matchingTile.id);
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      hintTimeoutRef.current = window.setTimeout(() => {
        setHintTileId(null);
      }, 3000);
    }
  };

  // Handle player selecting a domino tile from their hand
  const handleTileSelect = (selectedTile: DominoTile) => {
    if (gameMode === 'practice' && practiceTiles.length === 0) return;
    if (gameStatus !== 'playing') {
      if (gameStatus === 'idle') {
        handleStartGame();
      } else {
        return;
      }
    }

    if (isVanishing) return;

    const isMatch = areSynonyms(selectedTile.left, targetWord, activeGameTiles);

    if (isMatch) {
      setHintTileId(null);
      setCorrectTileId(selectedTile.id);
      setLastMatchedPair({ target: targetWord, matched: selectedTile.left });
      setIsVanishing(true);

      const nextCompletedCount = completedCount + 1;
      const remainingHand = hand.filter(t => t.id !== selectedTile.id);
      const isComplete = (nextCompletedCount + 1 >= activeGameTiles.length) || (remainingHand.length === 0 && deck.length === 0);

      setTimeout(() => {
        setIsVanishing(false);
        setCorrectTileId(null);
        setCompletedCount(nextCompletedCount);

        setActiveTile(selectedTile);
        const nextTarget = selectedTile.right;
        setTargetWord(nextTarget);

        if (isComplete) {
          accumulatedMsRef.current += Date.now() - startTimeRef.current;
          const finalRawMs = accumulatedMsRef.current;
          setElapsedMs(finalRawMs);
          setGameStatus('finished');
          setCompletedCount(activeGameTiles.length);
          setHand([]);
          setDeck([]);

          const totalEffectiveTime = calculateEffectiveMs(finalRawMs, penaltySeconds);

          const scorePayload: ScoreRow = {
            user_id: authUser?.email || 'ikasle001@sustrai.app',
            user_name: authUser?.displayName || 'Ikaslea',
            date_str: todayStr,
            raw_ms: finalRawMs,
            penalty_seconds: penaltySeconds,
            effective_ms: totalEffectiveTime,
            tiles_count: activeGameTiles.length,
          };

          if (shouldPublishScore(gameMode)) {
            setScoreSyncState('saving');
            void submitScoreReliably(scorePayload).then((result) => {
              setScoreSyncState(result.success ? 'synced' : 'pending');
            });
            setHasPlayedToday(true);
            setTodayScore(scorePayload);
          } else {
            setScoreSyncState('synced');
          }

          setShowVictoryModal(true);
        } else {
          let nextHand = [...remainingHand];
          let nextDeck = [...deck];

          if (nextDeck.length > 0 && nextHand.length < 6) {
            const drawnTile = nextDeck[0];
            nextDeck = nextDeck.slice(1);
            nextHand.push(drawnTile);
          }

          const refined = ensurePlayableHand(nextHand, nextDeck, nextTarget, activeGameTiles);
          setHand(refined.hand);
          setDeck(refined.deck);
        }
      }, 240);
    } else {
      // WRONG TILE CHOSEN: ADD +5s PENALTY
      setShakingTileId(selectedTile.id);
      setTimeout(() => setShakingTileId(null), 400);

      setPenaltiesCount(prev => prev + 1);
      setPenaltySeconds(prev => prev + 5);
      setPenaltyAlertText('+5s Akatsa');
      setLastPenaltyAlert(true);
      setTimeout(() => setLastPenaltyAlert(false), 1200);
    }
  };

  const handleShuffleHand = () => {
    setHand(shuffleArray(hand));
  };

  // IF USER IS NOT LOGGED IN, RENDER THE MANDATORY IDENTIFICATION SCREEN FIRST
  if (!authUser) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleUserChange}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </>
    );
  }

  const teacher = isTeacher(authUser);

  return (
    <div className="app-shell bg-slate-950 text-slate-100 flex flex-col font-['Outfit',sans-serif] select-none">
      {/* Top Navbar - Clean, Responsive Mobile-First */}
      <header className="bg-slate-900 border-b border-slate-800 px-2.5 sm:px-4 py-2 sticky top-0 z-40 shrink-0 print:hidden">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Top Bar on Mobile / Left on Desktop */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* Brand Title & Day of Week */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 font-black shadow-sm">
                <Gamepad2 className="w-4 h-4" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-black text-white leading-tight">
                  Dominoan
                </span>
                <span className="text-[10px] text-amber-400 font-bold leading-none">
                  {currentDayName}
                </span>
              </div>
            </div>

            {/* Mobile User Chip & Logout (Visible on mobile screens) */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              <ThemeToggle theme={theme} onToggle={toggleTheme} compact />
              <button
                onClick={() => setShowAuthModal(true)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl border transition-colors text-left cursor-pointer ${
                  teacher
                    ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                    : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-200'
                }`}
              >
                <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                  {teacher ? '★' : formatCleanStudentName(authUser.displayName || authUser.email).substring(0, 1).toUpperCase()}
                </div>
                <span className="text-[10px] font-bold max-w-[80px] truncate">
                  {teacher ? 'Irakaslea' : formatCleanStudentName(authUser.displayName || authUser.email)}
                </span>
              </button>

              <button
                onClick={handleLogout}
                aria-label="Saioa itxi"
                className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Saioa itxi"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Jolastu & Sailkapena) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 justify-center sm:justify-start shrink-0">
            <button
              onClick={() => setActiveTab('play')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'play'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{TXT.playTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{TXT.leaderboardTab}</span>
            </button>
          </div>

          {/* Desktop User Chip & Logout (Visible on sm+ screens) */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              onClick={() => setShowAuthModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors text-left cursor-pointer ${
                teacher
                  ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                  : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
              title={teacher ? 'Irakaslearen Panela' : 'Ikaslearen datuak'}
            >
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                {teacher ? '★' : formatCleanStudentName(authUser.displayName || authUser.email).substring(0, 1).toUpperCase()}
              </div>
              <span className="text-[11px] font-bold max-w-[100px] truncate">
                {teacher ? 'Irakaslea' : formatCleanStudentName(authUser.displayName || authUser.email)}
              </span>
            </button>

            <button
              onClick={handleLogout}
              aria-label="Saioa itxi"
              className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Saioa itxi"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Game Timer & Status Bar (Hidden if today's challenge is completed and locked) */}
      {activeTab === 'play' && (
        <div className="w-full bg-slate-950/95 border-b border-slate-800 px-2.5 py-1.5 shrink-0 print:hidden">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-1 rounded-xl" role="group" aria-label="Joko modua">
            <button
              type="button"
              onClick={() => handleModeChange('daily')}
              disabled={gameStatus === 'playing' || gameStatus === 'paused'}
              aria-pressed={gameMode === 'daily'}
              className={`px-3 py-1 rounded-lg text-[11px] font-black transition-colors disabled:opacity-50 ${
                gameMode === 'daily' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Eguneko erronka
            </button>
            {hasPlayedToday && (
              <button
                type="button"
                onClick={() => handleModeChange('practice')}
                disabled={gameStatus === 'playing' || gameStatus === 'paused' || practiceLoadState === 'loading' || practiceTiles.length === 0}
                aria-pressed={gameMode === 'practice'}
                className={`px-3 py-1 rounded-lg text-[11px] font-black transition-colors disabled:opacity-50 ${
                  gameMode === 'practice' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {practiceLoadState === 'loading' ? 'Praktika prestatzen...' : 'Praktika librea'}
              </button>
            )}
            {hasPlayedToday && practiceLoadState === 'error' && (
              <button
                type="button"
                onClick={() => void refreshPracticeContent()}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800"
              >
                Berriro saiatu
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'play' && !(gameMode === 'daily' && hasPlayedToday) && (
        <Suspense fallback={null}>
          <TimerStatsBar
            gameStatus={gameStatus}
            elapsedMs={elapsedMs}
            penaltySeconds={penaltySeconds}
            penaltiesCount={penaltiesCount}
            placedCount={gameStatus === 'finished' ? activeGameTiles.length : Math.min(activeGameTiles.length, completedCount + 1)}
            totalTiles={activeGameTiles.length}
            onStartGame={handleStartGame}
            onPauseGame={handlePauseGame}
            onResumeGame={handleResumeGame}
            onResetGame={handleResetGame}
            onOpenRules={() => setShowRulesModal(true)}
            lastPenaltyAlert={lastPenaltyAlert}
            penaltyAlertText={penaltyAlertText}
            hasPlayedToday={false}
            allowReset={canResetAttempt(gameMode, gameStatus)}
          />
        </Suspense>
      )}

      {/* Main Container - STRICTLY NO SCROLL in 'play' tab */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-2 sm:px-3 py-1 flex flex-col justify-between overflow-hidden">
        {activeTab === 'play' && (
          gameMode === 'daily' && hasPlayedToday ? (
            /* DAILY CHALLENGE LOCKED SCREEN: When user already completed today's official challenge */
            <div className="flex-1 flex items-center justify-center overflow-y-auto">
              <Suspense fallback={deferredViewFallback}>
                <DailyLockCard
                  score={todayScore}
                  dayName={currentDayName}
                  onViewLeaderboard={() => setActiveTab('leaderboard')}
                />
              </Suspense>
            </div>
          ) : (
            /* ACTIVE PLAY BOARD */
            <div className="flex-1 flex flex-col justify-between items-center gap-1.5 h-full overflow-hidden relative w-full">
              {/* CENTRAL COLUMN BOARD: The active vertical domino */}
              <Suspense fallback={deferredViewFallback}>
                <GameBoard
                  activeTile={activeTile}
                  targetWord={targetWord}
                  completedCount={completedCount}
                  totalCycleLength={activeGameTiles.length}
                  isVanishing={isVanishing}
                  lastMatchedPair={lastMatchedPair}
                  gameMode={gameMode}
                />
              </Suspense>

              {/* LOWER SECTION: Player's 6 HORIZONTAL Domino Pieces with Help button (+5s) */}
              <Suspense fallback={deferredViewFallback}>
                <PlayerTray
                  hand={hand}
                  shakingTileId={shakingTileId}
                  correctTileId={correctTileId}
                  hintTileId={hintTileId}
                  onTileSelect={handleTileSelect}
                  onUseHint={handleUseHint}
                  onShuffleHand={handleShuffleHand}
                  targetWord={targetWord}
                  isGameActive={gameStatus === 'playing'}
                />
              </Suspense>

              {/* PAUSED OVERLAY IF GAME IS STOPPED */}
              {gameStatus === 'paused' && (
                <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 rounded-2xl border border-amber-500/40 animate-fadeIn">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mb-2">
                    <span className="font-bold text-lg">⏸</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider mb-1">
                    {TXT.gamePaused}
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 text-center">
                    Kronometroa geldituta dago.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResumeGame}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>{TXT.resumeGame}</span>
                    </button>
                    {canResetAttempt(gameMode, gameStatus) && (
                      <button
                        onClick={handleResetGame}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
                      >
                        <span>{TXT.resetGame}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* Leaderboard View (Daily & Weekly Monday cycle) */}
        {activeTab === 'leaderboard' && (
          <div className="flex-1 overflow-y-auto pr-1">
            <Suspense fallback={deferredViewFallback}>
              <LeaderboardView
                currentUser={authUser.email}
                onPlayToday={() => setActiveTab('play')}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            </Suspense>
          </div>
        )}
      </main>

      {/* Auth & Supabase Modal */}
      {showAuthModal && (
        <Suspense fallback={deferredViewFallback}>
          <AuthModal
            currentUser={authUser}
            onUserChange={handleUserChange}
            onClose={() => setShowAuthModal(false)}
            onResetUserGame={(uid) => {
              if (authUser.email === uid) {
                setHasPlayedToday(false);
                setTodayScore(null);
              }
              refreshDailyPlayedStatus();
            }}
          />
        </Suspense>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <Suspense fallback={deferredViewFallback}>
          <RulesModal onClose={() => setShowRulesModal(false)} />
        </Suspense>
      )}

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <Suspense fallback={deferredViewFallback}>
          <VictoryModal
            elapsedMs={elapsedMs}
            penaltiesCount={penaltiesCount}
            penaltySeconds={penaltySeconds}
          totalTiles={activeGameTiles.length}
          isDailyChallenge={gameMode === 'daily'}
            bestTimeMs={null}
            scoreSyncState={scoreSyncState}
            onPlayAgain={() => {
              setShowVictoryModal(false);
              if (gameMode === 'practice') {
                if (practicePairs.length > 0) {
                  setPracticeTiles(createPracticeTiles(practicePairs));
                } else {
                  void refreshPracticeContent();
                }
              } else {
                refreshDailyPlayedStatus();
              }
            }}
            onViewLeaderboard={() => {
              setShowVictoryModal(false);
              setActiveTab('leaderboard');
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
