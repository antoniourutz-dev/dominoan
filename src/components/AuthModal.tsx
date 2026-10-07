import React, { useState } from 'react';
import {
  X,
  User,
  LogIn,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  LogOut,
  GraduationCap,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  UserProfile,
  setStoredAuthUser,
  clearStoredAuthUser,
} from '../utils/cloudSync';
import {
  resetUserDailyScore,
  normalizeSustraiEmail,
  isTeacher,
  formatCleanStudentName,
  signInWithSupabaseAuth,
  signUpWithSupabaseAuth,
  signOutFromSupabase,
} from '../lib/supabase';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface AuthModalProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile | null) => void;
  onClose: () => void;
  onResetUserGame?: (userId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onUserChange,
  onClose,
  onResetUserGame,
}) => {
  const dialogRef = useDialogFocus(onClose);
  const teacherMode = isTeacher(currentUser);
  const [tab, setTab] = useState<'profile' | 'reset'>('profile');

  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [resetTargetUser, setResetTargetUser] = useState('ikasle001');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegisterOrSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = userInput.trim();
    if (!cleanUser) {
      setErrorMsg('Idatzi ikaslearen erabiltzailea mesedez.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Idatzi pasahitza mesedez.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const res = await signInWithSupabaseAuth(cleanUser, passwordInput);
        if (res.success && res.user) {
          onUserChange(res.user);
          setStoredAuthUser(res.user);
          onClose();
        } else {
          setErrorMsg(res.error || 'Erabiltzaile edo pasahitz okerra Supabase-n.');
        }
      } else {
        const res = await signUpWithSupabaseAuth(cleanUser, passwordInput, nameInput);
        if (res.success && res.user) {
          onUserChange(res.user);
          setStoredAuthUser(res.user);
          onClose();
        } else {
          setErrorMsg(res.error || 'Errorea Supabase-n erregistratzean.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Errorea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOutFromSupabase();
    clearStoredAuthUser();
    onUserChange(null);
    onClose();
  };

  const handleResetStudentScore = async (target: string) => {
    const fullEmail = normalizeSustraiEmail(target);
    setIsSubmitting(true);
    try {
      const res = await resetUserDailyScore(fullEmail);
      setResetFeedback(
        res.success
          ? `${fullEmail} ikaslearen gaurko partida garbitu da! Berriro jokatu dezake.`
          : `Ezin izan da partida garbitu: ${res.message || 'baimenik gabe'}`
      );
      if (res.success && onResetUserGame) {
        onResetUserGame(fullEmail);
      }
      setTimeout(() => setResetFeedback(null), 3500);
    } catch (err: any) {
      setResetFeedback(`Errorea garbitzean: ${err?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Itxi erabiltzaile panela"
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            {teacherMode ? <GraduationCap className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <h2
              id="auth-dialog-title"
              className="text-base sm:text-lg font-black tracking-tight text-white uppercase focus:outline-none"
            >
              {teacherMode ? 'Irakaslearen Panela' : 'Ikaslearen Saioa'}
            </h2>
            <p className="text-xs text-slate-400">
              {teacherMode ? 'Supabase konfigurazioa & Ikasleen kudeaketa' : 'Sustrai App · Eguneroko Erronka'}
            </p>
          </div>
        </div>

        {/* Active User Card */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
              {currentUser.email.substring(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate">
                  {formatCleanStudentName(currentUser.displayName || currentUser.email)}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  teacherMode
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                }`}>
                  {teacherMode ? 'Irakaslea' : 'Ikaslea'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate font-mono">
                {teacherMode ? currentUser.email : 'Ikasle kontua'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Itxi</span>
          </button>
        </div>

        {/* Navigation Tabs (Supabase and SQL tabs ONLY visible for irakasle@sustrai.app) */}
        {teacherMode ? (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 mb-3 shrink-0 text-xs">
            <button
              onClick={() => setTab('profile')}
              className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                tab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Ikasleak</span>
            </button>
            <button
              onClick={() => setTab('reset')}
              className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                tab === 'reset'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Garbitu</span>
            </button>
          </div>
        ) : null}

        {/* Tab 1: Profile & Switch Player */}
        {tab === 'profile' && (
          <form onSubmit={handleRegisterOrSwitch} className="flex flex-col gap-2.5 my-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Aldatu jokalaria Supabase Auth-ekin:
              </span>
              <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${authMode === 'login' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${authMode === 'register' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
                >
                  Erregistratu
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Ikaslearen Erabiltzailea:
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-amber-500 rounded-xl overflow-hidden px-3 py-2">
                <input
                  type="text"
                  placeholder="ikasle002"
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-hidden font-mono font-bold"
                  required
                />
                {!userInput.includes('@') && (
                  <span className="text-[10px] font-mono font-bold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    @sustrai.app
                  </span>
                )}
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Jokalariaren Izena (hautazkoa):
                </label>
                <input
                  type="text"
                  placeholder="adib. Miren"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Supabase Pasahitza:
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-amber-500 rounded-xl px-3 py-2">
                <KeyRound className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Pasahitza"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-hidden font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Pasahitza ezkutatu' : 'Pasahitza erakutsi'}
                  className="p-0.5 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <span role="alert" className="text-xs text-rose-400 font-bold bg-rose-950/40 p-2 rounded-xl border border-rose-900/60 leading-tight">
                {errorMsg}
              </span>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{authMode === 'login' ? 'Hasi Saioa' : 'Erregistratu'}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Reset student score (Teacher only) */}
        {tab === 'reset' && teacherMode && (
          <div className="flex flex-col gap-3 my-1">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">
                Ikasle baten gaurko partida garbitu:
              </span>
              Ikasleren batek akatsez jolastu badu edo ikasgelan berriro probatzea nahi baduzu, partida garbitu dezakezu hemen.
            </div>

            {/* Quick 1-click button for ikasle001 */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">Botoi Azkarra:</span>
              <button
                type="button"
                onClick={() => handleResetStudentScore('ikasle001@sustrai.app')}
                disabled={isSubmitting}
                className="py-2 px-3 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 font-bold rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all active:scale-95"
              >
                <span>Garbitu «ikasle001@sustrai.app» partida</span>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom student reset input */}
            <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-bold text-slate-300">
                Beste ikasle bat garbitu:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="ikasleXXX"
                  value={resetTargetUser}
                  onChange={(e) => setResetTargetUser(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleResetStudentScore(resetTargetUser)}
                  disabled={isSubmitting || !resetTargetUser.trim()}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Garbitu</span>
                </button>
              </div>
            </div>

            {resetFeedback && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetFeedback}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{teacherMode ? 'Irakasle Baimenak Aktibo' : 'Ikasle Saioa'}</span>
          </div>
          <span className="text-amber-400/80 font-mono font-bold">Sustrai Cloud</span>
        </div>
      </div>
    </div>
  );
};
