import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Sparkles } from 'lucide-react';
import { DominoTile } from '../data/dominoSets';
import { TXT } from '../utils/texts';

interface CustomSetModalProps {
  onClose: () => void;
  onSaveCustomSet: (newTiles: DominoTile[]) => void;
  currentTiles: DominoTile[];
}

export const CustomSetModal: React.FC<CustomSetModalProps> = ({
  onClose,
  onSaveCustomSet,
  currentTiles,
}) => {
  const [tiles, setTiles] = useState<DominoTile[]>(currentTiles);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTileChange = (index: number, field: 'left' | 'right', value: string) => {
    setErrorMessage(null);
    const updated = [...tiles];
    updated[index] = { ...updated[index], [field]: value.toUpperCase() };
    setTiles(updated);
  };

  const handleAddTile = () => {
    setErrorMessage(null);
    const newId = `custom-${Date.now()}-${tiles.length + 1}`;
    setTiles([
      ...tiles,
      {
        id: newId,
        left: '',
        right: '',
      }
    ]);
  };

  const handleRemoveTile = (index: number) => {
    if (tiles.length <= 3) {
      setErrorMessage('Gutxienez 3 fitxa behar dira.');
      return;
    }
    setErrorMessage(null);
    setTiles(tiles.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const hasEmpty = tiles.some(tile => !tile.left.trim() || !tile.right.trim());
    if (hasEmpty) {
      setErrorMessage('Bete hitz guztiak, mesedez!');
      return;
    }
    onSaveCustomSet(tiles);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl text-slate-100 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-black uppercase text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{TXT.customTab}</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            {TXT.customSetNotice}
          </p>
          {errorMessage && (
            <div className="mt-2 bg-rose-500/20 border border-rose-500 text-rose-300 px-3 py-1 rounded-lg text-xs font-bold">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Tiles list */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 my-2 scrollbar-thin">
          {tiles.map((tile, idx) => (
            <div
              key={tile.id || idx}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2"
            >
              <span className="text-[10px] font-black text-amber-400 w-5 text-center shrink-0">
                #{idx + 1}
              </span>

              <input
                type="text"
                value={tile.left}
                onChange={(e) => handleTileChange(idx, 'left', e.target.value)}
                placeholder="Ezkerra"
                className="flex-1 min-w-0 bg-slate-900 border border-slate-750 rounded-lg px-2 py-1 text-xs font-bold text-white uppercase focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />

              <span className="text-slate-600 font-bold text-xs">|</span>

              <input
                type="text"
                value={tile.right}
                onChange={(e) => handleTileChange(idx, 'right', e.target.value)}
                placeholder="Eskuina"
                className="flex-1 min-w-0 bg-slate-900 border border-slate-750 rounded-lg px-2 py-1 text-xs font-bold text-white uppercase focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />

              <button
                onClick={() => handleRemoveTile(idx)}
                className="p-1.5 text-slate-500 hover:text-rose-400 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleAddTile}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{TXT.createNewTile}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{TXT.saveCustomSet} ({tiles.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
