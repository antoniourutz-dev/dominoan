import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  User,
  LogIn,
  UserPlus,
  Calendar,
  ShieldCheck,
  Award,
  KeyRound,
  GraduationCap,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, setStoredAuthUser, DEMO_STUDENTS } from '../utils/cloudSync';
import { getTodayDateString } from '../utils/leaderboard';
import { DAILY_CYCLE_MAP } from '../data/dominoSets';
import {
  signInWithSupabaseAuth,
  signUpWithSupabaseAuth,
  normalizeSustraiEmail,
  isTeacher,
  getCurrentSupabaseSessionUser,
} from '../lib/supabase';
import { ThemeMode, ThemeToggle } from './ThemeToggle';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  theme,
  onToggleTheme,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const todayStr = getTodayDateString();
  const d = new Date();
  const dayOfWeek = d.getDay();
  const dayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const dayInfo = DAILY_CYCLE_MAP[dayIdx] || DAILY_CYCLE_MAP[0];

  // Check if there's already an active authenticated session
  useEffect(() => {
    getCurrentSupabaseSessionUser().then((user) => {
      if (user) {
        setStoredAuthUser(user);
        onLoginSuccess(user);
      }
    });
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUser = userInput.trim();
    if (!cleanUser) {
      setErrorMsg('Idatzi zure ikasle-erabiltzailea mesedez (adib. ikasle001).');
      return;
    }

    if (!passwordInput) {
      setErrorMsg('Idatzi zure pasahitza mesedez.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await signInWithSupabaseAuth(cleanUser, passwordInput);
        if (res.success && res.user) {
          setStoredAuthUser(res.user);
          onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.error || 'Erabiltzaile edo pasahitz okerra.');
        }
      } else {
        // Register Mode
        if (passwordInput.length < 6) {
          setErrorMsg('Pasahitzak gutxienez 6 karaktere izan behar ditu.');
          setIsSubmitting(false);
          return;
        }

        const res = await signUpWithSupabaseAuth(cleanUser, passwordInput, nameInput);
        if (res.success && res.user) {
          if (res.requiresEmailConfirm) {
            setSuccessMsg('Erregistratua! Baieztapen mezua bidali da. Egiaztatu posta.');
          } else {
            setStoredAuthUser(res.user);
            onLoginSuccess(res.user);
          }
        } else {
          setErrorMsg(res.error || 'Errorea erregistratzean.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Errorea zerbitzariarekin konektatzean.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectQuickStudent = (studentId: string) => {
    setUserInput(studentId);
    setErrorMsg(null);
  };

  return (
    <div className="app-shell bg-slate-950 text-slate-100 flex flex-col p-2.5 sm:p-5 font-['Outfit',sans-serif] select-none">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between py-1.5 sm:py-2 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-tight">
              Dominoan
            </h1>
            <span className="text-[10px] text-amber-400 font-bold block">
              Sustrai App · Eguneroko Erronka
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
          {/* Small Day Badge */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl text-[10px] text-amber-300 font-bold">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{dayInfo.name.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto flex-1 min-h-0 py-2 sm:py-4 flex flex-col justify-center gap-2 sm:gap-3 overflow-y-auto overscroll-contain">
        {/* Today's Challenge Header */}
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-2xl p-2.5 sm:p-4 text-center relative overflow-hidden shrink-0">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase mb-1.5">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>Gaurko Erronka: {dayInfo.name}</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mb-1">
            {mode === 'login' ? 'Hasi Saioa' : 'Erregistro Berria'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            {mode === 'login'
              ? 'Sartu zure ikasle-erabiltzailea eta pasahitza gaurko erronkari ekiteko.'
              : 'Sortu zure ikasle-kontua pasahitzarekin sailkapenean lehiatzeko.'}
          </p>
        </div>

        {/* Mode Switch (Login / Register) */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Hasi Saioa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Erregistratu</span>
          </button>
        </div>

        {/* Quick Student Selector Helper */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 sm:p-2.5 flex flex-col gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
            <span>Aukeratu ikaslea azkarra:</span>
            <span className="text-[9px] text-amber-400 font-mono">@sustrai.app gehituko da</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {['ikasle001', 'ikasle002', 'ikasle003', 'ikasle004', 'ikasle005'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => selectQuickStudent(id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                  userInput.toLowerCase().startsWith(id)
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white'
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Password Login / Register Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col gap-3 shrink-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Username input */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Ikaslearen Erabiltzailea edo Emaila:
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-amber-500 rounded-xl overflow-hidden px-3 py-2 shadow-inner">
                <input
                  type="text"
                  placeholder="ikasle001"
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  autoComplete="username"
                  className="flex-1 bg-transparent text-base sm:text-sm text-white placeholder-slate-500 focus:outline-hidden font-mono font-bold min-w-0"
                  required
                />
                {!userInput.includes('@') && (
                  <span className="text-xs font-mono font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0 select-none ml-1">
                    @sustrai.app
                  </span>
                )}
              </div>
            </div>

            {/* Display Name when registering */}
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ikaslearen Izena (Bistaratzeko):
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-amber-500 rounded-xl px-3 py-2">
                  <User className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="adib. Ander Etxebarria"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    autoComplete="name"
                    className="w-full bg-transparent text-base sm:text-xs text-white placeholder-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Pasahitza:
                </label>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Segurua</span>
                </span>
              </div>
              <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-amber-500 rounded-xl px-3 py-2 shadow-inner">
                <KeyRound className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'login' ? 'Sartu zure pasahitza' : 'Gutxienez 6 karaktere'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-transparent text-base sm:text-sm text-white placeholder-slate-500 focus:outline-hidden font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Pasahitza ezkutatu' : 'Pasahitza erakutsi'}
                  className="p-1 text-slate-500 hover:text-white cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div role="alert" className="text-xs text-rose-400 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/60 leading-tight flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div role="status" aria-live="polite" className="text-xs text-emerald-400 font-bold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/60 leading-tight flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Egiaztatzen...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Hasi Saioa eta Ekin Jokoari 🚀</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Erregistratu eta Jokatu 🚀</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer with Teacher Login */}
      <div className="w-full max-w-md mx-auto py-1.5 sm:py-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 shrink-0">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Egunean behin jokatzen den erronka ofiziala</span>
        </div>

        {/* Teacher login trigger */}
        <button
          type="button"
          onClick={() => {
            setUserInput('irakasle@sustrai.app');
            setMode('login');
            setPasswordInput('');
          }}
          className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors font-bold"
          title="Irakaslearen Sarbidea (irakasle@sustrai.app)"
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span>Irakaslea</span>
        </button>
      </div>
    </div>
  );
};
