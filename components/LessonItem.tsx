
import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle2, Circle, X, AlertTriangle, Pencil, Layers, BarChart2, Play, Pause, ExternalLink, Square } from 'lucide-react';
import { Lesson, ActiveSession } from '../types';

interface LessonItemProps {
  lesson: Lesson;
  activeSession: ActiveSession | null;
  onToggle: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  onOpenNote: (lessonId: string) => void;
  onOpenFlashcards: (lessonId: string) => void;
  onOpenStats: (lessonId: string) => void;
  onPlay: (lessonId: string) => void;
  onPause: () => void;
  onStop: () => void;
}

export const LessonItem: React.FC<LessonItemProps> = ({ 
    lesson, 
    activeSession,
    onToggle, 
    onDelete, 
    onOpenNote, 
    onOpenFlashcards, 
    onOpenStats,
    onPlay, 
    onPause, 
    onStop
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);

  const isPlaying = activeSession?.lId === lesson.id;

  // --- LOCAL TIMER TICKER ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isPlaying && activeSession) {
      // Function to calculate current total time
      const updateTime = () => {
        let total = activeSession.accumulatedTime;
        if (!activeSession.isPaused) {
          total += (Date.now() - activeSession.startTime);
        }
        setDisplayTime(total);
      };

      // Update immediately
      updateTime();

      // If running, tick every second
      if (!activeSession.isPaused) {
        interval = setInterval(updateTime, 1000);
      }
    } else {
      setDisplayTime(0);
    }

    return () => clearInterval(interval);
  }, [activeSession, isPlaying]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isDeleting) {
      timeout = setTimeout(() => setIsDeleting(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isDeleting]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isDeleting) {
      if(window.confirm("Excluir esta aula permanentemente?")) {
        onDelete(lesson.id);
      }
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

  const handleStatsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenStats(lesson.id);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onPlay(lesson.id);
  };

  const handlePauseClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onPause();
  };

  const handleStopClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onStop();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (lesson.materialLink) {
          window.open(lesson.materialLink, '_blank');
      }
  };

  // Format HH:MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const hh = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${hh}${mm}:${ss}`;
  };

  const isRevisionDue = lesson.completed && lesson.revisionDate && new Date(lesson.revisionDate) <= new Date();
  const hasNotes = lesson.notes && lesson.notes.trim().length > 0;
  const cardCount = lesson.flashcards ? lesson.flashcards.length : 0;
  const hasMetrics = lesson.metrics && (lesson.metrics.studyTime > 0 || lesson.metrics.questionsTotal > 0);

  return (
    <div className={`flex items-center justify-between p-4 mb-3 rounded-xl group transition-all border ${
        isPlaying 
        ? 'bg-[#1a251a] border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
        : isRevisionDue 
            ? 'bg-yellow-900/10 border-yellow-700/50' 
            : 'bg-[#252525] border-transparent hover:border-gray-700 hover:bg-[#2a2a2a]'
    }`}>
      <div 
        className="flex items-center flex-1 cursor-pointer min-w-0 py-1 mr-2" 
        onClick={() => onToggle(lesson.id)}
      >
        <button 
          type="button"
          className={`mr-3 sm:mr-4 flex-shrink-0 transition-colors ${lesson.completed ? 'text-green-500' : 'text-gray-600 group-hover:text-gray-500'}`}
        >
          {lesson.completed ? (
            <CheckCircle2 size={26} fill="currentColor" className="text-green-900" />
          ) : (
            <Circle size={26} />
          )}
        </button>
        
        <div className="flex flex-col min-w-0 gap-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
                <span 
                className={`text-base sm:text-lg truncate font-medium ${
                    lesson.completed ? 'line-through text-gray-500' : isPlaying ? 'text-green-400 font-bold' : 'text-gray-200'
                }`}
                >
                {lesson.title}
                </span>
                
                {isRevisionDue && !isPlaying && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/30 whitespace-nowrap">
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
      
      {/* --- RIGHT SIDE ACTIONS (MINI PLAYER vs TOOLS) --- */}
      <div className="flex items-center gap-2 flex-shrink-0 relative z-10 pl-2">
        
        {/* IF PLAYING: SHOW MINI PLAYER CONTROLS */}
        {isPlaying ? (
            <div className="flex items-center bg-[#121212] p-1.5 rounded-xl border border-green-500/30 shadow-inner">
                {/* STOP */}
                <button
                    onClick={handleStopClick}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-900/30 text-red-500 hover:bg-red-900/50 hover:text-red-400 transition-colors border border-red-500/20"
                    title="Parar e Salvar"
                >
                    <Square size={16} fill="currentColor" />
                </button>

                {/* TIMER DISPLAY */}
                <div className="mx-3 font-mono text-xl font-bold text-white tracking-wider">
                    {formatTime(displayTime)}
                </div>

                {/* PAUSE / PLAY TOGGLE */}
                <button
                    onClick={handlePauseClick}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                        activeSession?.isPaused 
                        ? 'bg-green-500 text-black hover:bg-green-400'
                        : 'bg-yellow-500 text-black hover:bg-yellow-400'
                    }`}
                    title={activeSession?.isPaused ? "Retomar" : "Pausar"}
                >
                    {activeSession?.isPaused ? <Play size={18} fill="currentColor" className="ml-0.5" /> : <Pause size={18} fill="currentColor" />}
                </button>
            </div>
        ) : (
            /* IF INACTIVE: SHOW STANDARD TOOLS */
            <>
                {lesson.materialLink && !isDeleting && (
                    <button
                        type="button"
                        onClick={handleLinkClick}
                        className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-colors"
                        title="Abrir Material"
                    >
                        <ExternalLink size={16} />
                    </button>
                )}

                {!isDeleting && (
                    <button
                        type="button"
                        onClick={handlePlayClick}
                        className="w-12 h-12 flex items-center justify-center rounded-full text-white bg-gray-800 hover:bg-green-600 hover:scale-105 hover:shadow-lg hover:shadow-green-900/50 transition-all mr-1"
                        title="Iniciar Cronômetro"
                    >
                        <Play size={20} fill="currentColor" className="ml-1"/>
                    </button>
                )}

                {!isDeleting && (
                <button
                    type="button"
                    onClick={handleStatsClick}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                    hasMetrics
                        ? 'text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20' 
                        : 'text-gray-600 hover:text-gray-300 hover:bg-gray-700'
                    }`}
                    title="Métricas"
                >
                    <BarChart2 size={18} fill={hasMetrics ? "currentColor" : "none"} />
                </button>
                )}

                {!isDeleting && (
                <button
                    type="button"
                    onClick={handleFlashcardsClick}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors relative ${
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

                {!isDeleting && (
                <button
                    type="button"
                    onClick={handleNoteClick}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                    hasNotes 
                        ? 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20' 
                        : 'text-gray-600 hover:text-gray-300 hover:bg-gray-700'
                    }`}
                    title="Resumos"
                >
                    <Pencil size={18} fill={hasNotes ? "currentColor" : "none"} />
                </button>
                )}

                <div className="relative">
                {isDeleting ? (
                    <div className="flex items-center bg-red-900/20 rounded-lg overflow-hidden border border-red-900/50 animate-in fade-in slide-in-from-right-2 duration-200">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors h-10"
                    >
                        Apagar
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-2 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors border-l border-red-900/30 h-10 flex items-center"
                    >
                        <X size={14} />
                    </button>
                    </div>
                ) : (
                    <button 
                    type="button"
                    onClick={handleDelete}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    aria-label="Excluir aula"
                    >
                    <Trash2 size={18} />
                    </button>
                )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
