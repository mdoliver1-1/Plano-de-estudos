
import React, { useState } from 'react';
import { Calendar, X, Repeat, Clock, CalendarDays, ChevronRight } from 'lucide-react';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string | null, customDate?: string) => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customDate, setCustomDate] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = () => {
      if(customDate) {
          onSelect('custom', customDate);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Calendar className="text-green-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Agendar Revisão</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {!showCustomPicker ? (
            <div className="space-y-3">
            {/* CICLO AUTOMÁTICO - DESTAQUE */}
            <button 
                onClick={() => onSelect('cycle')}
                className="w-full p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 border border-yellow-500/30 rounded-xl transition-all group flex items-center gap-4 relative overflow-hidden"
            >
                <div className="bg-yellow-500 p-2.5 rounded-full text-black shadow-lg z-10">
                <Repeat size={20} />
                </div>
                <div className="text-left z-10">
                <span className="block text-lg font-bold text-yellow-500 group-hover:text-yellow-400">Ciclo 1 / 7 / 30</span>
                <span className="text-xs text-gray-400">Agenda 3 revisões automáticas</span>
                </div>
            </button>
            
            <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pl-1">Curto Prazo</p>
                <div className="grid grid-cols-3 gap-2">
                    {['1', '7', '30'].map((day) => (
                        <button key={day} onClick={() => onSelect(day)} className="p-2 bg-[#252525] hover:bg-gray-700 border border-gray-700 rounded-xl flex flex-col items-center justify-center group">
                            <span className="text-lg font-bold text-white group-hover:text-green-400">+{day}</span>
                            <span className="text-[10px] text-gray-500 uppercase">Dias</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pl-1">Longo Prazo</p>
                <div className="grid grid-cols-3 gap-2">
                    {['60', '90', '120'].map((day) => (
                        <button key={day} onClick={() => onSelect(day)} className="p-2 bg-[#252525] hover:bg-gray-700 border border-gray-700 rounded-xl flex flex-col items-center justify-center group">
                            <span className="text-base font-bold text-gray-300 group-hover:text-blue-400">+{day}</span>
                            <span className="text-[10px] text-gray-500 uppercase">Dias</span>
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={() => setShowCustomPicker(true)}
                className="w-full py-3 bg-[#252525] hover:bg-gray-700 border border-gray-700 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-300 transition-colors mt-2"
            >
                <CalendarDays size={16} /> Escolher Data Específica
            </button>

            <button 
                onClick={() => onSelect(null)}
                className="w-full py-2 text-xs font-medium text-gray-500 hover:text-white transition-colors"
            >
                Não agendar agora
            </button>
            </div>
        ) : (
            <div className="animate-in slide-in-from-right-4">
                <label className="text-sm text-gray-400 block mb-2">Selecione a data:</label>
                <input 
                    type="date" 
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-[#252525] text-white p-3 rounded-xl border border-gray-700 focus:border-green-500 outline-none mb-4 appearance-none"
                    min={new Date().toISOString().split('T')[0]}
                />
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowCustomPicker(false)}
                        className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl font-bold"
                    >
                        Voltar
                    </button>
                    <button 
                        onClick={handleCustomSubmit}
                        disabled={!customDate}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl font-bold"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
