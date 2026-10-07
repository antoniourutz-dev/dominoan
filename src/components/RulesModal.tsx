import React from 'react';
import { X, HelpCircle, ArrowRight, Lightbulb, Trophy, Calendar } from 'lucide-react';
import { TXT } from '../utils/texts';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-dialog-title"
        className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Itxi arauak"
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="rules-dialog-title"
              className="text-base sm:text-lg font-black uppercase text-white focus:outline-none"
            >
              {TXT.ruleHintTitle}
            </h3>
            <p className="text-[11px] text-slate-400">
              Eguneroko erronkaren arauak eta lehiaketa
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <strong className="text-white block mb-0.5">Eguneko 12 Fitxak:</strong>
              <p className="text-slate-400 leading-tight">
                Egunero 12 fitxako ziklo itxi bat daukazu. Goiko fitxaren beheko hitzari (<strong className="text-amber-300">LOTU</strong>) zure eskuan dagoen sinonimoa dagokio.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 flex flex-col items-center gap-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Adibidea:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex border border-slate-600 rounded-md overflow-hidden bg-slate-100 text-slate-900 text-[10px] font-black">
                <span className="px-1.5 py-0.5">AURREKARI</span>
                <span className="w-0.5 bg-slate-900" />
                <span className="px-1.5 py-0.5 bg-amber-300">ONESPEN</span>
              </div>
              <ArrowRight className="w-3 h-3 text-amber-400" />
              <div className="flex border border-slate-600 rounded-md overflow-hidden bg-slate-100 text-slate-900 text-[10px] font-black">
                <span className="px-1.5 py-0.5 bg-amber-300">ONIRITZI</span>
                <span className="w-0.5 bg-slate-900" />
                <span className="px-1.5 py-0.5">IRIZPIDE</span>
              </div>
            </div>
            <span className="text-[9.5px] text-emerald-400 font-bold">
              ONESPEN = ONIRITZI ✓
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <strong className="text-rose-400 block mb-0.5">Zigorrak (+5s):</strong>
              <p className="text-slate-400 leading-tight">
                Ez dago bizitzarik; jokoa osatu arte jarraitzen duzu. Huts egitean, fitxa dardaratu egingo da eta <strong>+5 segundo</strong> gehituko dira.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
              💡
            </span>
            <div>
              <strong className="text-amber-300 block mb-0.5">Laguntza Botoia (+5s):</strong>
              <p className="text-slate-400 leading-tight">
                Blokeatuta bazaude, sakatu <strong>Laguntza (+5s)</strong> botoia fitxa egokia argitzeko (+5s zigorra gehituz).
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
              🏆
            </span>
            <div>
              <strong className="text-emerald-400 block mb-0.5">Eguneko eta Asteko Sailkapena:</strong>
              <p className="text-slate-400 leading-tight">
                Zure Sustrai erabiltzailearekin lehiatu ikaskideen aurka! Asteko txapelketa astelehenero berritzen da.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer"
        >
          Ulertuta! Jolastu
        </button>
      </div>
    </div>
  );
};
