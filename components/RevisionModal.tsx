import React from 'react';
import { Calendar, X } from 'lucide-react';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (days: number | null) => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Calendar className="text-green-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Agendar Revisão?</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
          Parabéns! Para garantir que você não esqueça esse conteúdo, escolha quando quer revisar:
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={() => onSelect(1)}
            className="p-4 bg-[#252525] hover:bg-green-600/20 hover:border-green-500 border border-gray-700 rounded-xl transition-all group"
          >
            <span className="block text-2xl font-bold text-white group-hover:text-green-400 mb-1">1 Dia</span>
            <span className="text-xs text-gray-500">Amanhã</span>
          </button>
          <button 
            onClick={() => onSelect(7)}
            className="p-4 bg-[#252525] hover:bg-green-600/20 hover:border-green-500 border border-gray-700 rounded-xl transition-all group"
          >
            <span className="block text-2xl font-bold text-white group-hover:text-green-400 mb-1">7 Dias</span>
            <span className="text-xs text-gray-500">Semana que vem</span>
          </button>
          <button 
            onClick={() => onSelect(30)}
            className="p-4 bg-[#252525] hover:bg-green-600/20 hover:border-green-500 border border-gray-700 rounded-xl transition-all group"
          >
            <span className="block text-2xl font-bold text-white group-hover:text-green-400 mb-1">30 Dias</span>
            <span className="text-xs text-gray-500">Próximo mês</span>
          </button>
          <button 
            onClick={() => onSelect(null)}
            className="p-4 bg-[#252525] hover:bg-gray-700 border border-gray-700 rounded-xl transition-all"
          >
            <span className="block text-lg font-medium text-gray-400 mb-1">Não Agendar</span>
          </button>
        </div>
      </div>
    </div>
  );
};