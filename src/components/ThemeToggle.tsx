import React from 'react';
import { Moon, Sun } from 'lucide-react';

export type ThemeMode = 'dark' | 'light';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle, compact = false }) => {
  const nextThemeLabel = theme === 'dark' ? 'Gai argia aktibatu' : 'Gai iluna aktibatu';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
      className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
    >
      {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      {!compact && <span className="text-[10px] font-bold text-slate-300">{theme === 'dark' ? 'Argia' : 'Iluna'}</span>}
    </button>
  );
};
