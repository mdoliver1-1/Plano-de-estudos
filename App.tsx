import React, { useState, useEffect } from 'react';
import { PlusCircle, GraduationCap, Settings, Check, Download, Upload, X, ChevronDown, Trash2, Layout, Plus } from 'lucide-react';
import { Subject, Lesson, StudyPlan, Flashcard } from './types';
import { SubjectCard } from './components/SubjectCard';
import { Dashboard } from './components/Dashboard';
import { Pomodoro } from './components/Pomodoro';
import { RevisionModal } from './components/RevisionModal';
import { NotesModal } from './components/NotesModal';
import { FlashcardsModal } from './components/FlashcardsModal';

const STORAGE_KEY = 'study-master-v4-plans';
const CURRENT_PLAN_KEY = 'study-master-v4-current-id';

const DEFAULT_TIMER = { focus: 25, short: 5, long: 15 };

const App: React.FC = () => {
  // --- STATE ---
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>('');
  
  // UI States
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false); 
  const [showNewPlanInput, setShowNewPlanInput] = useState(false);
  
  // Inputs
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [importText, setImportText] = useState('');
  
  // Revision Modal
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [pendingLesson, setPendingLesson] = useState<{sId: string, lId: string} | null>(null);

  // Notes Modal
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<{sId: string, lId: string, title: string, content: string} | null>(null);

  // Flashcards Modal
  const [flashcardsModalOpen, setFlashcardsModalOpen] = useState(false);
  const [currentFlashcardLesson, setCurrentFlashcardLesson] = useState<{sId: string, lId: string, title: string, cards: Flashcard[]} | null>(null);

  // --- HELPERS ---
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const getCurrentPlan = (): StudyPlan | undefined => plans.find(p => p.id === currentPlanId);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedPlans = localStorage.getItem(STORAGE_KEY);
    const savedCurrentId = localStorage.getItem(CURRENT_PLAN_KEY);

    if (savedPlans) {
      try {
        const parsedPlans: StudyPlan[] = JSON.parse(savedPlans);
        setPlans(parsedPlans);
        
        if (savedCurrentId && parsedPlans.find(p => p.id === savedCurrentId)) {
          setCurrentPlanId(savedCurrentId);
        } else if (parsedPlans.length > 0) {
          setCurrentPlanId(parsedPlans[0].id);
        } else {
          createDefaultPlan();
        }
      } catch (e) {
        console.error("Data corruption", e);
        createDefaultPlan();
      }
    } else {
      createDefaultPlan();
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      localStorage.setItem(CURRENT_PLAN_KEY, currentPlanId);
    }
  }, [plans, currentPlanId, isLoaded]);

  // --- PLAN MANAGEMENT ---
  const createDefaultPlan = () => {
    const defaultPlan: StudyPlan = {
      id: generateId(),
      name: 'Meu Plano de Estudos',
      subjects: [],
      timerSettings: DEFAULT_TIMER,
      createdAt: Date.now(),
      streak: 0,
      lastStudyDate: 0
    };
    setPlans([defaultPlan]);
    setCurrentPlanId(defaultPlan.id);
  };

  const createPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    const newPlan: StudyPlan = {
      id: generateId(),
      name: newPlanName.trim(),
      subjects: [],
      timerSettings: DEFAULT_TIMER,
      createdAt: Date.now(),
      streak: 0,
      lastStudyDate: 0
    };

    setPlans(prev => [...prev, newPlan]);
    setCurrentPlanId(newPlan.id);
    setNewPlanName('');
    setShowNewPlanInput(false);
    setShowPlanMenu(false);
  };

  const deleteCurrentPlan = () => {
    if (plans.length <= 1) {
      alert("Você precisa ter pelo menos um plano ativo.");
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o plano "${getCurrentPlan()?.name}"? Isso apagará todas as disciplinas e estatísticas dele.`)) {
      const newPlans = plans.filter(p => p.id !== currentPlanId);
      setPlans(newPlans);
      setCurrentPlanId(newPlans[0].id);
      setShowPlanMenu(false);
    }
  };

  // --- SUBJECT/LESSON MANAGEMENT ---
  const updateCurrentPlan = (updater: (plan: StudyPlan) => StudyPlan) => {
    setPlans(prev => prev.map(p => p.id === currentPlanId ? updater(p) : p));
  };

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSubject: Subject = {
      id: generateId(),
      name: newSubjectName.trim(),
      lessons: [],
      isOpen: true
    };

    updateCurrentPlan(plan => ({
      ...plan,
      subjects: [newSubject, ...plan.subjects]
    }));
    
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const deleteSubject = (id: string) => {
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.filter(s => s.id !== id)
    }));
  };

  const toggleAccordion = (id: string) => {
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.map(s => s.id === id ? { ...s, isOpen: !s.isOpen } : s)
    }));
  };

  const addLesson = (subjectId: string, title: string) => {
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.map(s => {
        if (s.id === subjectId) {
          return { ...s, lessons: [...s.lessons, { id: generateId(), title, completed: false, flashcards: [] }] };
        }
        return s;
      })
    }));
  };

  const toggleLesson = (subjectId: string, lessonId: string) => {
    const plan = getCurrentPlan();
    if (!plan) return;
    
    const subject = plan.subjects.find(s => s.id === subjectId);
    const lesson = subject?.lessons.find(l => l.id === lessonId);
    
    if (!lesson) return;

    if (!lesson.completed) {
      setPendingLesson({ sId: subjectId, lId: lessonId });
      setRevisionModalOpen(true);
    } else {
      updateLessonStatus(subjectId, lessonId, false, null);
    }
  };

  const updateLessonStatus = (sId: string, lId: string, completed: boolean, revisionDate: string | null) => {
    updateCurrentPlan(plan => {
      // Logic for Streak
      let newStreak = plan.streak || 0;
      let newLastDate = plan.lastStudyDate || 0;

      if (completed) {
        const today = new Date().setHours(0,0,0,0);
        const lastDate = new Date(plan.lastStudyDate || 0).setHours(0,0,0,0);
        const diffDays = (today - lastDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          newStreak += 1; // Consecutive day
        } else if (diffDays > 1) {
          newStreak = 1; // Streak broken, restart
        } else if (diffDays === 0 && newStreak === 0) {
            newStreak = 1; // First study of first day
        }
        // If diffDays === 0 and streak > 0, we already studied today, maintain streak.
        
        newLastDate = Date.now();
      }

      return {
        ...plan,
        streak: newStreak,
        lastStudyDate: newLastDate,
        subjects: plan.subjects.map(s => {
          if (s.id === sId) {
            return {
              ...s,
              lessons: s.lessons.map(l => l.id === lId ? { ...l, completed, revisionDate } : l)
            };
          }
          return s;
        })
      };
    });
  };

  const handleRevisionSelect = (days: number | null) => {
    if (pendingLesson) {
      let revisionDate = null;
      if (days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        revisionDate = date.toISOString();
      }
      updateLessonStatus(pendingLesson.sId, pendingLesson.lId, true, revisionDate);
    }
    setRevisionModalOpen(false);
    setPendingLesson(null);
  };

  const deleteLesson = (subjectId: string, lessonId: string) => {
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.map(s => {
        if (s.id === subjectId) {
          return { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) };
        }
        return s;
      })
    }));
  };

  // --- NOTES SYSTEM ---
  const openNoteModal = (sId: string, lId: string) => {
    const plan = getCurrentPlan();
    const subject = plan?.subjects.find(s => s.id === sId);
    const lesson = subject?.lessons.find(l => l.id === lId);
    
    if (lesson) {
      setCurrentNote({
        sId,
        lId,
        title: lesson.title,
        content: lesson.notes || ''
      });
      setNotesModalOpen(true);
    }
  };

  const saveNote = (content: string) => {
    if (currentNote) {
      updateCurrentPlan(plan => ({
        ...plan,
        subjects: plan.subjects.map(s => {
          if (s.id === currentNote.sId) {
            return {
              ...s,
              lessons: s.lessons.map(l => l.id === currentNote.lId ? { ...l, notes: content } : l)
            };
          }
          return s;
        })
      }));
      setNotesModalOpen(false);
      setCurrentNote(null);
    }
  };

  // --- FLASHCARDS SYSTEM ---
  const openFlashcardsModal = (sId: string, lId: string) => {
    const plan = getCurrentPlan();
    const subject = plan?.subjects.find(s => s.id === sId);
    const lesson = subject?.lessons.find(l => l.id === lId);
    
    if (lesson) {
      setCurrentFlashcardLesson({
        sId,
        lId,
        title: lesson.title,
        cards: lesson.flashcards || []
      });
      setFlashcardsModalOpen(true);
    }
  };

  const addFlashcard = (front: string, back: string) => {
    if (currentFlashcardLesson) {
      const newCard: Flashcard = {
        id: generateId(),
        front,
        back,
        createdAt: Date.now()
      };
      
      const newCards = [...currentFlashcardLesson.cards, newCard];
      
      // Update local modal state immediately for UX
      setCurrentFlashcardLesson(prev => prev ? { ...prev, cards: newCards } : null);

      // Update global plan
      updateCurrentPlan(plan => ({
        ...plan,
        subjects: plan.subjects.map(s => {
          if (s.id === currentFlashcardLesson.sId) {
            return {
              ...s,
              lessons: s.lessons.map(l => l.id === currentFlashcardLesson.lId ? { ...l, flashcards: newCards } : l)
            };
          }
          return s;
        })
      }));
    }
  };

  const deleteFlashcard = (cardId: string) => {
     if (currentFlashcardLesson) {
      const newCards = currentFlashcardLesson.cards.filter(c => c.id !== cardId);
      
      // Update local modal state
      setCurrentFlashcardLesson(prev => prev ? { ...prev, cards: newCards } : null);

      // Update global plan
      updateCurrentPlan(plan => ({
        ...plan,
        subjects: plan.subjects.map(s => {
          if (s.id === currentFlashcardLesson.sId) {
            return {
              ...s,
              lessons: s.lessons.map(l => l.id === currentFlashcardLesson.lId ? { ...l, flashcards: newCards } : l)
            };
          }
          return s;
        })
      }));
    }
  };

  // --- TIMER SETTINGS ---
  const handleUpdateTimer = (newSettings: { focus: number, short: number, long: number }) => {
    updateCurrentPlan(plan => ({
      ...plan,
      timerSettings: newSettings
    }));
  };

  // --- BACKUP ---
  const exportData = () => {
    const data = JSON.stringify(plans);
    navigator.clipboard.writeText(data).then(() => alert('Backup Completo (Todos os Planos) copiado!'));
  };

  const importData = () => {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed) && parsed[0].timerSettings) {
        setPlans(parsed);
        setCurrentPlanId(parsed[0].id);
        setShowSettings(false);
        setImportText('');
        alert('Dados importados com sucesso!');
      } else {
        alert('Formato inválido. Certifique-se de que é um backup da Versão 4.0+.');
      }
    } catch (e) {
      alert('Erro ao ler JSON.');
    }
  };

  const currentPlan = getCurrentPlan();
  if (!currentPlan) return null; // Loading state

  // Stats calculation
  const allLessons = currentPlan.subjects.flatMap(s => s.lessons);
  const stats = {
    total: allLessons.length,
    completed: allLessons.filter(l => l.completed).length
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans pb-40">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800 shadow-xl pt-4 pb-2 safe-area-top">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            
            {/* PLAN SELECTOR (Dropdown) */}
            <div className="relative">
              <button 
                onClick={() => setShowPlanMenu(!showPlanMenu)}
                className="flex items-center gap-3 group"
              >
                <div className="bg-gradient-to-tr from-green-600 to-green-400 p-2 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] group-hover:scale-105 transition-transform">
                  <Layout size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Plano Atual</p>
                  <div className="flex items-center gap-1">
                    <h1 className="text-lg font-bold text-white tracking-tight max-w-[150px] sm:max-w-xs truncate">
                      {currentPlan.name}
                    </h1>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${showPlanMenu ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showPlanMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-60 overflow-y-auto">
                    {plans.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setCurrentPlanId(p.id); setShowPlanMenu(false); }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-800 transition-colors ${p.id === currentPlanId ? 'bg-green-900/10 text-green-500 font-medium' : 'text-gray-300'}`}
                      >
                        <span className="truncate">{p.name}</span>
                        {p.id === currentPlanId && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 p-2 bg-[#1a1a1a]">
                    <button 
                      onClick={() => { setShowNewPlanInput(true); setShowPlanMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Plus size={16} /> Criar Novo Plano
                    </button>
                    <button 
                      onClick={deleteCurrentPlan}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                    >
                      <Trash2 size={16} /> Excluir Atual
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
               <button 
                onClick={() => setShowAddSubject(!showAddSubject)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showAddSubject ? 'bg-gray-800 text-white' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'}`}
              >
                <PlusCircle size={18} />
                <span className="hidden sm:inline">Matéria</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors border border-gray-800"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Collapsible Add Subject Input */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAddSubject ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
            <form onSubmit={addSubject} className="relative">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Nome da Disciplina..."
                autoFocus
                className="w-full bg-[#1e1e1e] text-white border border-gray-700 focus:border-green-500 rounded-xl pl-4 pr-12 py-3 shadow-inner text-base placeholder-gray-600 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!newSubjectName.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-600 hover:bg-green-500 disabled:opacity-0 text-white rounded-lg transition-all"
              >
                <Check size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        
        {/* Dashboard with Streak */}
        <Dashboard 
          totalLessons={stats.total} 
          completedLessons={stats.completed} 
          streak={currentPlan.streak || 0}
        />

        {currentPlan.subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-50 border-2 border-dashed border-gray-800 rounded-2xl">
            <GraduationCap size={48} className="mb-4 text-gray-600" />
            <p className="text-lg text-gray-400 font-medium">Plano "{currentPlan.name}" Vazio</p>
            <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto">Adicione disciplinas para começar a estudar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentPlan.subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onToggleAccordion={toggleAccordion}
                onDeleteSubject={deleteSubject}
                onAddLesson={addLesson}
                onToggleLesson={toggleLesson}
                onDeleteLesson={deleteLesson}
                onOpenNote={openNoteModal}
                onOpenFlashcards={openFlashcardsModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* Components */}
      <Pomodoro 
        key={currentPlan.id} 
        initialSettings={currentPlan.timerSettings} 
        onSaveSettings={handleUpdateTimer} 
      />
      
      <RevisionModal 
        isOpen={revisionModalOpen} 
        onClose={() => setRevisionModalOpen(false)} 
        onSelect={handleRevisionSelect} 
      />

      {/* Notes Modal */}
      {currentNote && (
        <NotesModal
          isOpen={notesModalOpen}
          lessonTitle={currentNote.title}
          initialContent={currentNote.content}
          onClose={() => setNotesModalOpen(false)}
          onSave={saveNote}
        />
      )}

      {/* Flashcards Modal */}
      {currentFlashcardLesson && (
        <FlashcardsModal
          isOpen={flashcardsModalOpen}
          lessonTitle={currentFlashcardLesson.title}
          flashcards={currentFlashcardLesson.cards}
          onClose={() => setFlashcardsModalOpen(false)}
          onAddCard={addFlashcard}
          onDeleteCard={deleteFlashcard}
        />
      )}

      {/* Modal: New Plan */}
      {showNewPlanInput && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-sm rounded-2xl p-6">
             <h2 className="text-lg font-bold text-white mb-4">Criar Novo Plano de Estudos</h2>
             <form onSubmit={createPlan}>
               <input 
                  type="text" 
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Ex: OAB, Concurso..."
                  className="w-full bg-[#252525] text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 outline-none mb-4"
                  autoFocus
               />
               <div className="flex gap-2">
                 <button type="button" onClick={() => setShowNewPlanInput(false)} className="flex-1 py-2 bg-gray-800 rounded-lg text-gray-400">Cancelar</button>
                 <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">Criar</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal: Settings */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={20} /> Backup & Dados
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700">
                <h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Download size={16}/> Exportar (Todos os Planos)</h3>
                <p className="text-xs text-gray-500 mb-3">Gera um arquivo com todos os seus planos e estatísticas.</p>
                <button 
                  onClick={exportData}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Copiar Backup (JSON)
                </button>
              </div>

              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700">
                <h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Upload size={16}/> Restaurar</h3>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Cole o código JSON aqui..."
                  className="w-full h-24 bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 focus:border-green-500 focus:outline-none mb-3 font-mono"
                />
                <button 
                  onClick={importData}
                  disabled={!importText}
                  className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Restaurar Dados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;