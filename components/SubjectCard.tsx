import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, BookOpen, AlertTriangle, X } from 'lucide-react';
import { Subject, Lesson } from '../types';
import { ProgressBar } from './ProgressBar';
import { LessonItem } from './LessonItem';

interface SubjectCardProps {
  subject: Subject;
  onToggleAccordion: (id: string) => void;
  onDeleteSubject: (id: string) => void;
  onAddLesson: (subjectId: string, title: string) => void;
  onToggleLesson: (subjectId: string, lessonId: string) => void;
  onDeleteLesson: (subjectId: string, lessonId: string) => void;
  onOpenNote: (subjectId: string, lessonId: string) => void;
  onOpenFlashcards: (subjectId: string, lessonId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onToggleAccordion,
  onDeleteSubject,
  onAddLesson,
  onToggleLesson,
  onDeleteLesson,
  onOpenNote,
  onOpenFlashcards
}) => {
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-reset delete state after 3 seconds if not confirmed
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isDeleting) {
      timeout = setTimeout(() => setIsDeleting(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isDeleting]);

  const completedCount = subject.lessons.filter(l => l.completed).length;
  const totalCount = subject.lessons.length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLessonTitle.trim()) {
      onAddLesson(subject.id, newLessonTitle.trim());
      setNewLessonTitle('');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop click from bubbling to accordion
    if (isDeleting) {
      onDeleteSubject(subject.id);
    } else {
      setIsDeleting(true);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(false);
  };

  // Sort lessons: Revision Due > Incomplete > Completed
  const sortedLessons = [...subject.lessons].sort((a, b) => {
    const isDueA = a.completed && a.revisionDate && new Date(a.revisionDate) <= new Date();
    const isDueB = b.completed && b.revisionDate && new Date(b.revisionDate) <= new Date();
    
    if (isDueA && !isDueB) return -1;
    if (!isDueA && isDueB) return 1;
    
    // Put incomplete before completed (if not due for revision)
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className={`rounded-xl shadow-lg mb-4 overflow-hidden border transition-all duration-300 ${subject.isOpen ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-gray-800 bg-[#1e1e1e]'}`}>
      {/* Accordion Header Wrapper */}
      <div className={`p-4 cursor-pointer transition-colors ${subject.isOpen ? 'bg-[#1a1a1a]' : 'hover:bg-[#252525]'}`}>
        <div className="flex items-center justify-between mb-2">
          
          {/* LEFT SIDE: Clickable Toggle */}
          <div 
            className="flex items-center gap-3 flex-1 select-none py-1 min-w-0"
            onClick={() => onToggleAccordion(subject.id)}
          >
            <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${percentage === 100 ? 'bg-green-900/30 text-green-500' : (subject.isOpen ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400')}`}>
              <BookOpen size={20} />
            </div>
            <h3 className={`text-lg font-bold truncate transition-colors ${subject.isOpen ? 'text-white' : 'text-gray-300'}`}>{subject.name}</h3>
          </div>

          {/* RIGHT SIDE: Actions */}
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {!isDeleting && (
              <span className="text-sm font-bold text-gray-500 hidden sm:inline-block mr-2 font-mono">
                {completedCount}/{totalCount}
              </span>
            )}
            
            {/* Delete Button Area with Two-Step Logic */}
            <div className="relative z-20 flex items-center">
              {isDeleting ? (
                <div className="flex items-center bg-red-900/20 rounded-lg overflow-hidden border border-red-900/50 animate-in fade-in slide-in-from-right-2 duration-200">
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 uppercase tracking-wide transition-colors"
                  >
                    Apagar?
                  </button>
                  <div className="w-px h-full bg-red-900/50 mx-0"></div>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Excluir disciplina"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Chevron - Clickable Toggle */}
            <div 
              className="p-1 cursor-pointer text-gray-500 ml-1"
              onClick={() => onToggleAccordion(subject.id)}
            >
              {subject.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>
        
        {/* Progress Bar - Clickable Toggle */}
        <div onClick={() => onToggleAccordion(subject.id)}>
          <ProgressBar percentage={percentage} />
        </div>
      </div>

      {/* Accordion Body */}
      {subject.isOpen && (
        <div className="p-4 border-t border-gray-800 bg-[#151515]">
          {/* Add Lesson Form */}
          <form onSubmit={handleAddLesson} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="Nova aula..."
              className="flex-1 bg-[#252525] text-gray-100 border border-transparent focus:border-green-500/50 rounded-xl px-4 py-3 focus:outline-none placeholder-gray-600 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!newLessonTitle.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex items-center justify-center min-w-[50px] shadow-lg shadow-green-900/20"
            >
              <Plus size={20} />
            </button>
          </form>

          {/* Lessons List */}
          <div className="space-y-1">
            {subject.lessons.length === 0 ? (
              <p className="text-center text-gray-600 py-6 italic text-sm">Adicione aulas para começar o progresso.</p>
            ) : (
              sortedLessons.map(lesson => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onToggle={(lid) => onToggleLesson(subject.id, lid)}
                  onDelete={(lid) => onDeleteLesson(subject.id, lid)}
                  onOpenNote={(lid) => onOpenNote(subject.id, lid)}
                  onOpenFlashcards={(lid) => onOpenFlashcards(subject.id, lid)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};