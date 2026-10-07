import React from 'react';
import { Printer, Scissors } from 'lucide-react';
import { DominoTile } from '../data/dominoSets';
import { TXT } from '../utils/texts';

interface PrintSheetViewProps {
  tiles: DominoTile[];
}

export const PrintSheetView: React.FC<PrintSheetViewProps> = ({ tiles }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 py-2">
      {/* Header with Print button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl sm:rounded-2xl border border-slate-800 shadow-lg print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span>{TXT.printTitle}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>{TXT.printSubtitle}</span>
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{TXT.printButton}</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white text-black p-4 sm:p-8 rounded-xl shadow-xl print:shadow-none print:p-0 print:m-0 print:w-full print:rounded-none">
        <div className="border-b-3 border-black pb-3 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black uppercase">
              DOMINOAN
            </h1>
            <p className="text-[11px] text-slate-700 font-bold">
              Euskara - 24 Fitxa | Moztu marra lodietatik
            </p>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-800 border-2 border-black px-2 py-0.5 font-bold">
            IKASLEA: ____________________
          </div>
        </div>

        {/* Domino Grid matching the physical sheet */}
        <div className="grid grid-cols-2 gap-0 border-3 border-black bg-black">
          {tiles.map((tile, idx) => (
            <div
              key={tile.id || idx}
              className="bg-white border-2 border-black p-2 sm:p-3 flex items-center justify-between min-h-[46px] sm:min-h-[56px]"
            >
              <div className="flex-1 flex items-center justify-center text-center px-1 overflow-hidden">
                <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase text-black tracking-tight whitespace-nowrap block">
                  {tile.left}
                </span>
              </div>

              <div className="w-[2px] h-full bg-black mx-1" />

              <div className="flex-1 flex items-center justify-center text-center px-1 overflow-hidden">
                <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase text-black tracking-tight whitespace-nowrap block">
                  {tile.right}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-2 border-t border-black/30 text-[10px] text-slate-700 flex justify-between">
          <span>Arauak: 6na fitxa banatu. Lotu eskuineko hitza ezkerreko sinonimoarekin.</span>
          <span>Dominoan App</span>
        </div>
      </div>
    </div>
  );
};
