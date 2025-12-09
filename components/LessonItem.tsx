import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle2, Circle, X, AlertTriangle, Pencil, Layers } from 'lucide-react';
import { Lesson } from '../types';

interface LessonItemProps {
  lesson: Lesson;
  onToggle: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  onOpenNote: (lessonId: string) => void;
  onOpenFlashcards: (lessonId: string) => void;
}

export const LessonItem: React.FC<LessonItemProps> = ({ lesson, onToggle, onDelete, onOpenNote, onOpenFlashcards }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isDeleting) {
      timeout = setTimeout(() => setIsDeleting(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isDeleting]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) {
      onDelete(lesson.id);
    } else {
      setIsDeleting(true);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(false);
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenNote(lesson.id);
  };

  const handleFlashcardsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenFlashcards(lesson.id);
  };

  const isRevisionDue = lesson.completed && lesson.revisionDate && new Date(lesson.revisionDate) <= new Date();
  const hasNotes = lesson.notes && lesson.notes.trim().length > 0;
  const cardCount = lesson.flashcards ? lesson.flashcards.length : 0;

  return (
    <div className={`flex items-center justify-between p-4 mb-3 rounded-xl group transition-all border ${isRevisionDue ? 'bg-yellow-900/10 border-yellow-700/50' : 'bg-[#252525] border-transparent hover:border-gray-700 hover:bg-[#2a2a2a]'}`}>
      <div 
        className="flex items-center flex-1 cursor-pointer min-w-0 py-1" 
        onClick={() => onToggle(lesson.id)}
      >
        <button 
          type="button"
          className={`mr-4 flex-shrink-0 transition-colors ${lesson.completed ? 'text-green-500' : 'text-gray-600 group-hover:text-gray-500'}`}
        >
          {lesson.completed ? (
            <CheckCircle2 size={26} fill="currentColor" className="text-green-900" />
          ) : (
            <Circle size={26} />
          )}
        </button>
        
        <div className="flex flex-col min-w-0 gap-1">
            <div className="flex items-center gap-2 flex-wrap">
                <span 
                className={`text-base sm:text-lg truncate transition-all font-medium ${
                    lesson.completed ? 'line-through text-gray-500' : 'text-gray-200'
                }`}
                >
                {lesson.title}
                </span>
                {isRevisionDue && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/30">
                        <AlertTriangle size={10} />
                        Revisar
                    </div>
                )}
            </div>
            {(lesson.revisionDate && lesson.completed && !isRevisionDue) && (
                 <span className="text-xs text-gray-600">
                    Revisão: {new Date(lesson.revisionDate).toLocaleDateString()}
                 </span>
            )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="ml-3 flex items-center gap-1 flex-shrink-0 relative z-10">
        
        {/* Flashcards Button */}
        {!isDeleting && (
          <button
            type="button"
            onClick={handleFlashcardsClick}
            className={`p-2.5 rounded-lg transition-colors relative ${
              cardCount > 0
                ? 'text-purple-400 bg-purple-400/10 hover:bg-purple-400/20' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-gray-700'
            }`}
            title="Flashcards"
          >
            <Layers size={18} fill={cardCount > 0 ? "currentColor" : "none"} />
            {cardCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cardCount}
              </span>
            )}
          </button>
        )}

        {/* Notebook Button */}
        {!isDeleting && (
          <button
            type="button"
            onClick={handleNoteClick}
            className={`p-2.5 rounded-lg transition-colors ${
              hasNotes 
                ? 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-gray-700'
            }`}
            title="Caderno de Resumos"
          >
            <Pencil size={18} fill={hasNotes ? "currentColor" : "none"} />
          </button>
        )}

        {/* Delete Action */}
        <div className="relative">
          {isDeleting ? (
            <div className="flex items-center bg-red-900/20 rounded-lg overflow-hidden border border-red-900/50 animate-in fade-in slide-in-from-right-2 duration-200">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Apagar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-2 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors border-l border-red-900/30"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={handleDelete}
              className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              aria-label="Excluir aula"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};