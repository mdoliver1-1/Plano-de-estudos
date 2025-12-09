import React, { useState, useEffect } from 'react';
import { X, Save, Clock, HelpCircle, CheckCircle } from 'lucide-react';
import { LessonMetrics } from '../types';

interface LessonStatsModalProps {
  isOpen: boolean;
  lessonTitle: string;
  initialMetrics?: LessonMetrics;
  onClose: () => void;
  onSave: (metrics: LessonMetrics) => void;
}

export const LessonStatsModal: React.FC<LessonStatsModalProps> = ({ 
  isOpen, 
  lessonTitle, 
  initialMetrics, 
  onClose, 
  onSave 
}) => {
  const [timeStr, setTimeStr] = useState("0000");
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Converte minutos totais para formato HHMM
      const totalMinutes = initialMetrics?.studyTime || 0;
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      // Pad to 4 digits (e.g., 90 min -> 1h 30m -> "0130")
      const str = h.toString().padStart(2, '0') + m.toString().padStart(2, '0');
      setTimeStr(str);

      setQuestionsTotal(initialMetrics?.questionsTotal || 0);
      setQuestionsCorrect(initialMetrics?.questionsCorrect || 0);
    }
  }, [isOpen, initialMetrics]);

  if (!isOpen) return null;

  const calculateAccuracy = () => {
    if (questionsTotal === 0) return 0;
    return Math.round((questionsCorrect / questionsTotal) * 100);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não for número
    let val = e.target.value.replace(/\D/g, '');
    
    // Comportamento estilo ATM/Calculadora: empurra da direita para a esquerda
    // Mantém no máximo 4 dígitos
    if (val.length > 4) {
      val = val.slice(-4);
    }
    
    setTimeStr(val);
  };

  const getFormattedTime = () => {
    // Garante sempre 4 dígitos com zeros à esquerda
    const padded = timeStr.padStart(4, '0');
    // Formata HH:MM
    return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
  };

  // Verifica se o tempo é zero para mudar a cor (placeholder fake)
  const isTimeZero = parseInt(timeStr || '0', 10) === 0;

  const handleSave = () => {
    const padded = timeStr.padStart(4, '0');
    const hours = parseInt(padded.slice(0, 2));
    const minutes = parseInt(padded.slice(2, 4));
    const totalMinutes = (hours * 60) + minutes;

    onSave({
      studyTime: Math.max(0, totalMinutes),
      questionsTotal: Math.max(0, questionsTotal),
      questionsCorrect: Math.min(Math.max(0, questionsCorrect), questionsTotal)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white truncate pr-4">{lessonTitle}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Study Time - Single Masked Input */}
          <div>
            <label className="flex items-center gap-2 text-sm text-blue-400 font-bold uppercase mb-2">
              <Clock size={16} /> Tempo Estudado
            </label>
            <div className="relative">
              <input 
                type="text"
                inputMode="numeric"
                value={getFormattedTime()}
                onChange={handleTimeChange}
                className={`w-full bg-[#252525] p-4 rounded-xl border border-gray-700 focus:border-blue-500 outline-none text-3xl font-mono text-center tracking-widest placeholder-gray-600 transition-colors ${isTimeZero ? 'text-gray-600' : 'text-white'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold uppercase pointer-events-none">
                HH:MM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Questions */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 font-bold uppercase mb-2">
                <HelpCircle size={16} /> Questões
              </label>
              <input 
                type="number" 
                value={questionsTotal === 0 ? '' : questionsTotal}
                onChange={(e) => setQuestionsTotal(e.target.value === '' ? 0 : parseInt(e.target.value))}
                placeholder="0"
                className="w-full bg-[#252525] text-white p-3 rounded-xl border border-gray-700 focus:border-white outline-none text-xl font-mono text-center placeholder-gray-600"
              />
            </div>

            {/* Correct Questions */}
            <div>
              <label className="flex items-center gap-2 text-sm text-green-400 font-bold uppercase mb-2">
                <CheckCircle size={16} /> Acertos
              </label>
              <input 
                type="number" 
                value={questionsCorrect === 0 ? '' : questionsCorrect}
                onChange={(e) => setQuestionsCorrect(e.target.value === '' ? 0 : parseInt(e.target.value))}
                placeholder="0"
                className="w-full bg-[#252525] text-white p-3 rounded-xl border border-gray-700 focus:border-green-500 outline-none text-xl font-mono text-center placeholder-gray-600"
              />
            </div>
          </div>

          {/* Live Accuracy Feedback */}
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
             <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Aproveitamento</span>
             <div className={`text-3xl font-bold mt-1 ${calculateAccuracy() >= 80 ? 'text-green-400' : calculateAccuracy() >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
               {calculateAccuracy()}%
             </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 active:scale-95"
          >
            <Save size={18} /> Salvar Dados
          </button>
        </div>
      </div>
    </div>
  );
};