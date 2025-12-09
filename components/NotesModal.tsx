import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  lessonTitle: string;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ 
  isOpen, 
  lessonTitle, 
  initialContent, 
  onClose, 
  onSave 
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-blue-500/20 p-2 rounded-lg shrink-0">
              <FileText className="text-blue-400" size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Caderno de Resumos</p>
              <h3 className="text-lg font-bold text-white truncate">{lessonTitle}</h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 p-4 bg-[#181818]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva seus principais insights, fórmulas ou pontos de atenção aqui..."
            className="w-full h-full bg-transparent text-gray-200 resize-none outline-none text-base leading-relaxed placeholder-gray-700 font-sans"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-[#1e1e1e] rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-4 py-3 text-gray-400 font-medium hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave(content)}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-900/20 active:scale-95"
          >
            <Save size={18} />
            Salvar Resumo
          </button>
        </div>
      </div>
    </div>
  );
};