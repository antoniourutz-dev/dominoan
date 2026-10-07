import React, { useState } from 'react';
import { Search, BookOpen, Layers } from 'lucide-react';
import { DominoTile } from '../data/dominoSets';
import { TXT } from '../utils/texts';

interface DictionaryViewProps {
  tiles: DominoTile[];
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({ tiles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'flashcards'>('list');

  const pairs = tiles.map((tile, i) => {
    const next = tiles[(i + 1) % tiles.length];
    return {
      word1: tile.right,
      word2: next.left,
      notes: tile.notes || '',
    };
  });

  const filteredPairs = pairs.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.word1.toLowerCase().includes(q) ||
      p.word2.toLowerCase().includes(q) ||
      p.notes.toLowerCase().includes(q)
    );
  });

  const currentFlashcard = pairs[flashcardIndex % pairs.length];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 py-2">
      {/* Header and Mode Switch */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>{TXT.allPairs}</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Jokoan agertzen diren sinonimo guztien zerrenda
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'list'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Zerrenda ({pairs.length})
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'flashcards'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Txartelak
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={TXT.searchWord}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Grid of pairs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {filteredPairs.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                    {TXT.pairBadge} #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black text-white uppercase whitespace-nowrap block">
                      {p.word1}
                    </span>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs shrink-0">
                    =
                  </div>

                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-xs sm:text-sm font-black text-amber-300 uppercase whitespace-nowrap block">
                      {p.word2}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Flashcards */
        <div className="max-w-md mx-auto w-full flex flex-col items-center gap-4 py-4">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Txartela {flashcardIndex + 1} / {pairs.length}
          </div>

          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full min-h-[200px] bg-slate-900 border-2 border-slate-700 hover:border-amber-400 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none"
          >
            <span className="text-[10px] font-bold uppercase text-amber-400 mb-2">
              Zein da honen sinonimoa?
            </span>
            <h3 className="text-2xl font-black text-white uppercase whitespace-nowrap tracking-wider mb-2">
              {currentFlashcard.word1}
            </h3>

            {showAnswer ? (
              <div className="mt-3 pt-3 border-t border-slate-800 w-full animate-fadeIn">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                  Erantzuna:
                </span>
                <span className="text-xl font-black text-emerald-300 uppercase whitespace-nowrap block">
                  {currentFlashcard.word2}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 font-medium mt-4 bg-slate-800/60 px-3 py-1 rounded-full">
                Klik egin ikusteko 👆
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAnswer(false);
                setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : pairs.length - 1));
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700"
            >
              ← Aurrekoa
            </button>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-4 py-2 bg-slate-800 text-amber-400 rounded-xl text-xs font-bold border border-slate-700"
            >
              {showAnswer ? 'Ezkutatu' : 'Ikusi'}
            </button>
            <button
              onClick={() => {
                setShowAnswer(false);
                setFlashcardIndex((prev) => (prev + 1) % pairs.length);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-xs"
            >
              Hurrengoa →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
