
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, RotateCw, ChevronLeft, ChevronRight, Layers, GraduationCap } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardsModalProps {
  isOpen: boolean;
  lessonTitle: string;
  flashcards: Flashcard[];
  onClose: () => void;
  onAddCard: (front: string, back: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  lessonTitle,
  flashcards,
  onClose,
  onAddCard,
  onDeleteCard
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'practice'>('manage');
  
  // Manage State
  const [frontInput, setFrontInput] = useState('');
  const [backInput, setBackInput] = useState('');

  // Practice State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset states when opening
      setFrontInput('');
      setBackInput('');
      setCurrentIndex(0);
      setIsFlipped(false);
      // Default to manage if empty, practice if has cards
      setActiveTab(flashcards.length > 0 ? 'practice' : 'manage');
    }
  }, [isOpen, flashcards.length]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (frontInput.trim() && backInput.trim()) {
      onAddCard(frontInput, backInput);
      setFrontInput('');
      setBackInput('');
      // Keep focus on front input for rapid entry (could use ref, but simple is fine)
      document.getElementById('flashcard-front')?.focus();
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-purple-500/20 p-2 rounded-lg shrink-0">
              <Layers className="text-purple-400" size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Flashcards</p>
              <h3 className="text-lg font-bold text-white truncate">{lessonTitle}</h3>
            </div>
          </div>
          <button onClick={onClose} className="bg-gray-800 text-gray-400 hover:text-white p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'practice' ? 'text-green-500 border-b-2 border-green-500 bg-green-500/5' : 'text-gray-500 hover:bg-gray-800'}`}
          >
            Praticar ({flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'manage' ? 'text-purple-500 border-b-2 border-purple-500 bg-purple-500/5' : 'text-gray-500 hover:bg-gray-800'}`}
          >
            Gerenciar / Criar
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-[#121212]">
          
          {/* --- PRACTICE TAB --- */}
          {activeTab === 'practice' && (
            <div className="h-full flex flex-col items-center justify-center p-6">
              {flashcards.length === 0 ? (
                <div className="text-center opacity-60">
                  <Layers size={48} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">Nenhum cartão criado ainda.</p>
                  <button onClick={() => setActiveTab('manage')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors">
                    Criar Cartas
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col max-w-md mx-auto">
                  {/* Progress Counter */}
                  <div className="text-center mb-4 text-xs font-mono text-gray-500">
                    CARTÃO {currentIndex + 1} DE {flashcards.length}
                  </div>

                  {/* FLIP CARD CONTAINER */}
                  <div className="flex-1 relative perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <div 
                      className={`relative w-full h-full transition-transform duration-500 transform-style-3d shadow-2xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
                      style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    >
                      {/* FRONT */}
                      <div 
                        className="absolute inset-0 backface-hidden bg-[#1e1e1e] border border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-gray-500 transition-colors"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <span className="text-xs text-purple-400 font-bold uppercase mb-4 tracking-widest">Pergunta</span>
                        <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed">{currentCard.front}</p>
                        <p className="absolute bottom-6 text-xs text-gray-600 animate-pulse">Toque para ver a resposta</p>
                      </div>

                      {/* BACK */}
                      <div 
                        className="absolute inset-0 backface-hidden bg-[#1e1e1e] border-2 border-green-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                         <span className="text-xs text-green-500 font-bold uppercase mb-4 tracking-widest">Resposta</span>
                        <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed">{currentCard.back}</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between mt-6 px-4">
                    <button onClick={handlePrev} className="p-3 bg-[#252525] hover:bg-[#333] rounded-full text-white transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={() => setIsFlipped(!isFlipped)} 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <RotateCw size={16} /> Virar
                    </button>
                    <button onClick={handleNext} className="p-3 bg-[#252525] hover:bg-[#333] rounded-full text-white transition-colors">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- MANAGE TAB --- */}
          {activeTab === 'manage' && (
            <div className="h-full flex flex-col">
              {/* Form */}
              <div className="p-4 bg-[#181818] border-b border-gray-800">
                <form onSubmit={handleAdd} className="flex flex-col gap-3">
                  <input
                    id="flashcard-front"
                    value={frontInput}
                    onChange={(e) => setFrontInput(e.target.value)}
                    placeholder="Frente (Pergunta)"
                    className="bg-[#252525] text-white p-3 rounded-xl border border-gray-700 focus:border-purple-500 outline-none transition-colors"
                  />
                  <textarea
                    value={backInput}
                    onChange={(e) => setBackInput(e.target.value)}
                    placeholder="Verso (Resposta)"
                    rows={2}
                    className="bg-[#252525] text-white p-3 rounded-xl border border-gray-700 focus:border-green-500 outline-none transition-colors resize-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!frontInput.trim() || !backInput.trim()}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                  >
                    <Plus size={18} /> Adicionar Carta
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {flashcards.length === 0 ? (
                  <p className="text-center text-gray-600 mt-10 text-sm">Nenhuma carta criada para esta aula.</p>
                ) : (
                  flashcards.map((card, idx) => (
                    <div key={card.id} className="bg-[#1e1e1e] border border-gray-800 p-4 rounded-xl flex items-start justify-between group hover:border-gray-700 transition-colors">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                          <p className="font-bold text-gray-300 truncate">{card.front}</p>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{card.back}</p>
                      </div>
                      <button 
                        onClick={() => onDeleteCard(card.id)}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
