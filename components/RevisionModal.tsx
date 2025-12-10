
import React, { useState } from 'react';
import { Calendar, X, Repeat, Check, CalendarDays, Plus } from 'lucide-react';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dates: number[]) => void;
}

const PRESETS = [1, 5, 7, 15, 30, 60, 90, 120];

export const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedOffsets, setSelectedOffsets] = useState<number[]>([]);
  const [customDate, setCustomDate] = useState('');

  if (!isOpen) return null;

  // Toggle selection in the grid
  const togglePreset = (days: number) => {
    if (selectedOffsets.includes(days)) {
      setSelectedOffsets(prev => prev.filter(d => d !== days));
    } else {
      setSelectedOffsets(prev => [...prev, days]);
    }
  };

  // Smart Shortcut: 1, 7, 30
  const applyCycle = () => {
    const cycle = [1, 7, 30];
    // Add cycle numbers if not already present
    const newSet = new Set([...selectedOffsets, ...cycle]);
    setSelectedOffsets(Array.from(newSet));
  };

  const handleConfirm = () => {
    const now = new Date();
    const timestamps: number[] = [];

    // Process Presets
    selectedOffsets.forEach(offset => {
      const date = new Date(now);
      date.setDate(date.getDate() + offset);
      date.setHours(0, 0, 0, 0); // Normalize time
      timestamps.push(date.getTime());
    });

    // Process Custom Date
    if (customDate) {
      const cDate = new Date(customDate);
      // Fix timezone offset issue for manual input
      const userTimezoneOffset = cDate.getTimezoneOffset() * 60000;
      const normalizedDate = new Date(cDate.getTime() + userTimezoneOffset);
      timestamps.push(normalizedDate.getTime());
    }

    // Sort ascending
    const sortedDates = timestamps.sort((a, b) => a - b);
    
    // Remove duplicates
    const uniqueDates = Array.from(new Set(sortedDates));

    onConfirm(uniqueDates);
  };

  // Counting logic for button label
  const totalScheduled = selectedOffsets.length + (customDate ? 1 : 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Calendar className="text-green-500" size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white leading-none">Planejar Revisões</h3>
                <p className="text-xs text-gray-500 mt-1">Sistema Híbrido: Selecione múltiplos.</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-gray-800 text-gray-400 hover:text-white p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            
            {/* 1. CYCLE SHORTCUT */}
            <button 
                onClick={applyCycle}
                className="w-full p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 hover:from-yellow-900/40 hover:to-orange-900/40 border border-yellow-700/30 rounded-xl mb-6 flex items-center justify-between group transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-600 p-1.5 rounded-lg text-black">
                        <Repeat size={18} />
                    </div>
                    <div className="text-left">
                        <span className="block text-sm font-bold text-yellow-500 group-hover:text-yellow-400">Aplicar Ciclo 1/7/30</span>
                        <span className="text-[10px] text-gray-400">Atalho rápido padrão</span>
                    </div>
                </div>
                <Plus size={16} className="text-yellow-500" />
            </button>

            {/* 2. MULTI-SELECT GRID */}
            <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Prazos (Multi-Seleção)</label>
                <div className="grid grid-cols-4 gap-2">
                    {PRESETS.map((day) => {
                        const isSelected = selectedOffsets.includes(day);
                        return (
                            <button 
                                key={day} 
                                onClick={() => togglePreset(day)} 
                                className={`relative p-3 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 ${
                                    isSelected 
                                    ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/50 scale-105 z-10' 
                                    : 'bg-[#252525] border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-500'
                                }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-1 right-1">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                )}
                                <span className={`text-lg font-bold leading-none ${isSelected ? 'text-white' : 'text-gray-200'}`}>+{day}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. CUSTOM DATE */}
            <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Data Específica (Calendário)</label>
                <div className="relative">
                    <input 
                        type="date" 
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className={`w-full text-white pl-10 pr-4 py-3 rounded-xl border outline-none appearance-none transition-all ${customDate ? 'bg-green-900/10 border-green-500/50' : 'bg-[#252525] border-gray-700'}`}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    <CalendarDays className={`absolute left-3 top-1/2 -translate-y-1/2 ${customDate ? 'text-green-500' : 'text-gray-500'}`} size={18} />
                </div>
            </div>
        </div>

        {/* 4. FOOTER ACTION */}
        <div className="pt-4 mt-2 border-t border-gray-800">
             <button 
                onClick={handleConfirm}
                disabled={totalScheduled === 0}
                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-900/20 uppercase tracking-wide"
            >
                {totalScheduled === 0 ? (
                    'Selecione datas'
                ) : (
                    <>
                        AGENDAR TODAS <span className="bg-white text-green-700 px-2 py-0.5 rounded-md text-sm font-extrabold">{totalScheduled}</span>
                    </>
                )}
            </button>
            <button 
                onClick={() => onConfirm([])}
                className="w-full mt-3 py-2 text-xs font-medium text-gray-500 hover:text-white transition-colors"
            >
                Concluir sem agendar
            </button>
        </div>

      </div>
    </div>
  );
};
