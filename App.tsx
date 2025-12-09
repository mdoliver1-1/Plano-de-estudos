import React, { useState, useEffect } from 'react';
import { PlusCircle, GraduationCap, Settings, Check, Download, Upload, X, ChevronDown, Trash2, Layout, Plus, PieChart, LogOut } from 'lucide-react';
import { Subject, Lesson, StudyPlan, Flashcard, UserProfile, LessonMetrics, ActiveSession, TimerSettings } from './types';
import { SubjectCard } from './components/SubjectCard';
import { Dashboard } from './components/Dashboard';
import { Pomodoro } from './components/Pomodoro';
import { RevisionModal } from './components/RevisionModal';
import { NotesModal } from './components/NotesModal';
import { FlashcardsModal } from './components/FlashcardsModal';
import { LoginScreen } from './components/LoginScreen';
import { LessonStatsModal } from './components/LessonStatsModal';
import { Analytics } from './components/Analytics';

// KEYS
const USERS_KEY = 'study-master-users';
const CURRENT_USER_ID_KEY = 'study-master-current-user-id';
// Data keys will be dynamic: `study-data-${userId}`

const DEFAULT_TIMER = { focus: 25, short: 5, long: 15 };

const App: React.FC = () => {
  // --- USER STATE ---
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // --- DATA STATE (Scoped to User) ---
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>('');
  
  // UI States
  const [activeTab, setActiveTab] = useState<'study' | 'analytics'>('study');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false); 
  const [showNewPlanInput, setShowNewPlanInput] = useState(false);
  
  // Inputs
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [importText, setImportText] = useState('');
  
  // Active Session State (Timer)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  // Modals
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [pendingLesson, setPendingLesson] = useState<{sId: string, lId: string} | null>(null);

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<{sId: string, lId: string, title: string, content: string} | null>(null);

  const [flashcardsModalOpen, setFlashcardsModalOpen] = useState(false);
  const [currentFlashcardLesson, setCurrentFlashcardLesson] = useState<{sId: string, lId: string, title: string, cards: Flashcard[]} | null>(null);

  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [currentStatsLesson, setCurrentStatsLesson] = useState<{sId: string, lId: string, title: string, metrics?: LessonMetrics} | null>(null);

  // --- HELPERS ---
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  const getCurrentPlan = (): StudyPlan | undefined => plans.find(p => p.id === currentPlanId);

  // --- INIT & USER MANAGEMENT ---
  useEffect(() => {
    // Load Users
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    // Auto-login last user
    const lastUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (lastUserId && savedUsers) {
      const parsedUsers: UserProfile[] = JSON.parse(savedUsers);
      const user = parsedUsers.find(u => u.id === lastUserId);
      if (user) {
        loginUser(user);
      }
    }
  }, []);

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
    loadUserData(user.id);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
    setPlans([]);
    setCurrentPlanId('');
    setActiveSession(null);
  };

  const createUser = (name: string, avatar: string) => {
    const newUser: UserProfile = {
      id: generateId(),
      name,
      avatar,
      createdAt: Date.now()
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loginUser(newUser);
  };

  const deleteUser = (id: string) => {
    if (confirm('Tem certeza? Todos os dados desse usuário serão perdidos.')) {
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      localStorage.removeItem(`study-data-${id}`);
      if (currentUser?.id === id) {
        logoutUser();
      }
    }
  };

  // --- DATA PERSISTENCE (USER SCOPED) ---
  const loadUserData = (userId: string) => {
    const dataKey = `study-data-${userId}`;
    const savedData = localStorage.getItem(dataKey);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Migration or Load
        if (parsed.plans) {
           setPlans(parsed.plans);
           setCurrentPlanId(parsed.currentPlanId || parsed.plans[0]?.id || '');
        } else {
           // Legacy format fallback or empty
           createDefaultPlan();
        }
      } catch (e) {
        createDefaultPlan();
      }
    } else {
      createDefaultPlan();
    }
  };

  // Save whenever plans change, BUT only if we have a user
  useEffect(() => {
    if (currentUser && plans.length > 0) {
      const dataKey = `study-data-${currentUser.id}`;
      const payload = {
        plans,
        currentPlanId
      };
      localStorage.setItem(dataKey, JSON.stringify(payload));
    }
  }, [plans, currentPlanId, currentUser]);

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

  // --- APP LOGIC (Similar to v6 but calls setPlans) ---
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
    if (confirm(`Excluir plano "${getCurrentPlan()?.name}"?`)) {
      const newPlans = plans.filter(p => p.id !== currentPlanId);
      setPlans(newPlans);
      setCurrentPlanId(newPlans[0].id);
      setShowPlanMenu(false);
    }
  };

  const updateCurrentPlan = (updater: (plan: StudyPlan) => StudyPlan) => {
    setPlans(prev => prev.map(p => p.id === currentPlanId ? updater(p) : p));
  };

  // ... CRUD wrappers (Subject, Lesson) ...
  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: [{ id: generateId(), name: newSubjectName.trim(), lessons: [], isOpen: true }, ...plan.subjects]
    }));
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const deleteSubject = (id: string) => updateCurrentPlan(plan => ({...plan, subjects: plan.subjects.filter(s => s.id !== id)}));
  
  const toggleAccordion = (id: string) => updateCurrentPlan(plan => ({...plan, subjects: plan.subjects.map(s => s.id === id ? { ...s, isOpen: !s.isOpen } : s)}));

  const addLesson = (sId: string, title: string) => {
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.map(s => s.id === sId ? { ...s, lessons: [...s.lessons, { id: generateId(), title, completed: false, flashcards: [] }] } : s)
    }));
  };

  const deleteLesson = (sId: string, lId: string) => {
    if (activeSession?.lId === lId) {
        alert("Não é possível excluir uma aula que está sendo cronometrada. Pare o timer primeiro.");
        return;
    }
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.map(s => s.id === sId ? { ...s, lessons: s.lessons.filter(l => l.id !== lId) } : s)
    }));
  };

  const toggleLesson = (sId: string, lId: string) => {
    const plan = getCurrentPlan();
    if (!plan) return;
    const s = plan.subjects.find(s => s.id === sId);
    const l = s?.lessons.find(l => l.id === lId);
    if (!l) return;

    if (!l.completed) {
      setPendingLesson({ sId, lId });
      setRevisionModalOpen(true);
    } else {
      updateLessonStatus(sId, lId, false, null);
    }
  };

  const updateLessonStatus = (sId: string, lId: string, completed: boolean, revisionDate: string | null) => {
    updateCurrentPlan(plan => {
      let newStreak = plan.streak || 0;
      let newLastDate = plan.lastStudyDate || 0;

      if (completed) {
        const today = new Date().setHours(0,0,0,0);
        const lastDate = new Date(plan.lastStudyDate || 0).setHours(0,0,0,0);
        const diffDays = (today - lastDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
        else if (diffDays === 0 && newStreak === 0) newStreak = 1;
        
        newLastDate = Date.now();
      }

      return {
        ...plan,
        streak: newStreak,
        lastStudyDate: newLastDate,
        subjects: plan.subjects.map(s => s.id === sId ? {
          ...s,
          lessons: s.lessons.map(l => l.id === lId ? { ...l, completed, revisionDate } : l)
        } : s)
      };
    });
  };

  // --- TIMER SESSION LOGIC ---
  const handleStartSession = (sId: string, lId: string) => {
    // Check if clicking the currently active session
    if (activeSession && activeSession.sId === sId && activeSession.lId === lId) {
        // Toggle pause instead of restarting
        handlePauseSession();
        return;
    }

    // Find lesson name
    const plan = getCurrentPlan();
    const subject = plan?.subjects.find(s => s.id === sId);
    const lesson = subject?.lessons.find(l => l.id === lId);
    
    if (!lesson) return;

    // Start fresh session (overwriting previous if exists)
    setActiveSession({
        sId,
        lId,
        title: lesson.title,
        startTime: Date.now(),
        accumulatedTime: 0,
        isPaused: false
    });
  };

  const handlePauseSession = () => {
      if (!activeSession) return;
      if (activeSession.isPaused) {
          // Resume
          setActiveSession({
              ...activeSession,
              isPaused: false,
              startTime: Date.now()
          });
      } else {
          // Pause
          const elapsed = Date.now() - activeSession.startTime;
          setActiveSession({
              ...activeSession,
              isPaused: true,
              accumulatedTime: activeSession.accumulatedTime + elapsed
          });
      }
  };

  const handleStopSession = () => {
      if (!activeSession) return;
      
      let finalDurationMs = activeSession.accumulatedTime;
      if (!activeSession.isPaused) {
          finalDurationMs += (Date.now() - activeSession.startTime);
      }

      // Use float minutes to capture small durations (e.g., 30s = 0.5 min)
      // This ensures "every second counts" for analytics
      const minutesToAdd = finalDurationMs / 1000 / 60;

      if (minutesToAdd > 0) {
          // Save to lesson metrics
          updateCurrentPlan(plan => ({
              ...plan,
              subjects: plan.subjects.map(s => s.id === activeSession.sId ? {
                  ...s,
                  lessons: s.lessons.map(l => l.id === activeSession.lId ? {
                      ...l,
                      metrics: {
                          ...l.metrics,
                          studyTime: (l.metrics?.studyTime || 0) + minutesToAdd,
                          questionsTotal: l.metrics?.questionsTotal || 0,
                          questionsCorrect: l.metrics?.questionsCorrect || 0
                      }
                  } : l)
              } : s)
          }));
      }

      setActiveSession(null);
  };

  // --- MODAL HANDLERS ---
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

  // Note
  const openNoteModal = (sId: string, lId: string) => {
    const plan = getCurrentPlan();
    const l = plan?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (l) {
      setCurrentNote({ sId, lId, title: l.title, content: l.notes || '' });
      setNotesModalOpen(true);
    }
  };
  const saveNote = (content: string) => {
    if (currentNote) {
      updateCurrentPlan(plan => ({...plan, subjects: plan.subjects.map(s => s.id === currentNote.sId ? {...s, lessons: s.lessons.map(l => l.id === currentNote.lId ? {...l, notes: content} : l)} : s)}));
      setNotesModalOpen(false);
      setCurrentNote(null);
    }
  };

  // Flashcards
  const openFlashcardsModal = (sId: string, lId: string) => {
    const plan = getCurrentPlan();
    const l = plan?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (l) {
      setCurrentFlashcardLesson({ sId, lId, title: l.title, cards: l.flashcards || [] });
      setFlashcardsModalOpen(true);
    }
  };
  const addFlashcard = (front: string, back: string) => {
    if (currentFlashcardLesson) {
      const newCard: Flashcard = { id: generateId(), front, back, createdAt: Date.now() };
      const newCards = [...currentFlashcardLesson.cards, newCard];
      setCurrentFlashcardLesson(prev => prev ? { ...prev, cards: newCards } : null);
      updateCurrentPlan(plan => ({...plan, subjects: plan.subjects.map(s => s.id === currentFlashcardLesson.sId ? {...s, lessons: s.lessons.map(l => l.id === currentFlashcardLesson.lId ? {...l, flashcards: newCards} : l)} : s)}));
    }
  };
  const deleteFlashcard = (cId: string) => {
    if (currentFlashcardLesson) {
      const newCards = currentFlashcardLesson.cards.filter(c => c.id !== cId);
      setCurrentFlashcardLesson(prev => prev ? { ...prev, cards: newCards } : null);
      updateCurrentPlan(plan => ({...plan, subjects: plan.subjects.map(s => s.id === currentFlashcardLesson.sId ? {...s, lessons: s.lessons.map(l => l.id === currentFlashcardLesson.lId ? {...l, flashcards: newCards} : l)} : s)}));
    }
  };

  // Stats
  const openStatsModal = (sId: string, lId: string) => {
    const plan = getCurrentPlan();
    const l = plan?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (l) {
      setCurrentStatsLesson({ sId, lId, title: l.title, metrics: l.metrics });
      setStatsModalOpen(true);
    }
  };
  const saveStats = (metrics: LessonMetrics) => {
    if (currentStatsLesson) {
       updateCurrentPlan(plan => ({
         ...plan,
         subjects: plan.subjects.map(s => s.id === currentStatsLesson.sId ? {
           ...s,
           lessons: s.lessons.map(l => l.id === currentStatsLesson.lId ? { ...l, metrics } : l)
         } : s)
       }));
       setStatsModalOpen(false);
       setCurrentStatsLesson(null);
    }
  };

  // Timer
  const handleUpdateTimer = (newSettings: TimerSettings) => updateCurrentPlan(plan => ({...plan, timerSettings: newSettings}));

  // Backup
  const exportData = () => {
    const data = JSON.stringify({ plans, currentPlanId });
    navigator.clipboard.writeText(data).then(() => alert('Backup Copiado!'));
  };
  const importData = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.plans) {
        setPlans(parsed.plans);
        setCurrentPlanId(parsed.currentPlanId || parsed.plans[0].id);
        setShowSettings(false);
        setImportText('');
        alert('Restaurado!');
      }
    } catch (e) { alert('Erro no JSON.'); }
  };


  // --- RENDER ---
  if (!currentUser) {
    return <LoginScreen users={users} onSelectUser={loginUser} onCreateUser={createUser} onDeleteUser={deleteUser} />;
  }

  const currentPlan = getCurrentPlan();
  if (!currentPlan) return null;

  const allLessons = currentPlan.subjects.flatMap(s => s.lessons);
  const stats = { total: allLessons.length, completed: allLessons.filter(l => l.completed).length };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans pb-40">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800 shadow-xl pt-4 pb-2 safe-area-top">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            
            {/* PLAN & USER */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowPlanMenu(!showPlanMenu)} className="flex items-center gap-3 group">
                   <div className="bg-gradient-to-tr from-green-600 to-green-400 p-2 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      <Layout size={24} className="text-white" />
                   </div>
                   <div className="text-left">
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{currentUser.avatar} {currentUser.name}</p>
                     <div className="flex items-center gap-1">
                       <h1 className="text-lg font-bold text-white tracking-tight max-w-[120px] sm:max-w-xs truncate">{currentPlan.name}</h1>
                       <ChevronDown size={14} className="text-gray-500" />
                     </div>
                   </div>
                </button>
                {/* Plan Dropdown */}
                {showPlanMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="max-h-60 overflow-y-auto">
                      {plans.map(p => (
                        <button key={p.id} onClick={() => { setCurrentPlanId(p.id); setShowPlanMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-800 ${p.id === currentPlanId ? 'bg-green-900/10 text-green-500 font-bold' : 'text-gray-300'}`}>
                          <span className="truncate">{p.name}</span>
                          {p.id === currentPlanId && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-700 p-2 bg-[#1a1a1a]">
                      <button onClick={() => { setShowNewPlanInput(true); setShowPlanMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg"><Plus size={16} /> Novo Plano</button>
                      <button onClick={deleteCurrentPlan} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg mt-1"><Trash2 size={16} /> Excluir</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* RIGHT ACTIONS */}
            <div className="flex gap-2">
               <button onClick={() => setShowAddSubject(!showAddSubject)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showAddSubject ? 'bg-gray-800 text-white' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'}`}>
                <PlusCircle size={18} /> <span className="hidden sm:inline">Matéria</span>
              </button>
              <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800"><Settings size={20} /></button>
              <button onClick={logoutUser} className="p-2 text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/20 rounded-lg border border-red-900/30" title="Sair"><LogOut size={20} /></button>
            </div>
          </div>

          {/* ADD SUBJECT INPUT */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAddSubject ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
            <form onSubmit={addSubject} className="relative">
              <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Nova Disciplina..." autoFocus className="w-full bg-[#1e1e1e] text-white border border-gray-700 focus:border-green-500 rounded-xl pl-4 pr-12 py-3 shadow-inner text-base outline-none" />
              <button type="submit" disabled={!newSubjectName.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-600 hover:bg-green-500 disabled:opacity-0 text-white rounded-lg"><Check size={18} /></button>
            </form>
          </div>

          {/* TABS */}
          <div className="flex bg-[#1e1e1e] p-1 rounded-xl mb-4 border border-gray-800">
             <button onClick={() => setActiveTab('study')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'study' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                <Layout size={16} /> Aulas
             </button>
             <button onClick={() => setActiveTab('analytics')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                <PieChart size={16} /> Estatísticas
             </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-3xl mx-auto px-4 py-2">
        {activeTab === 'study' ? (
          <>
            <Dashboard totalLessons={stats.total} completedLessons={stats.completed} streak={currentPlan.streak || 0}/>
            {currentPlan.subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50 border-2 border-dashed border-gray-800 rounded-2xl">
                <GraduationCap size={48} className="mb-4 text-gray-600" />
                <p className="text-lg text-gray-400 font-medium">Plano Vazio</p>
                <p className="text-sm text-gray-600 mt-2">Adicione disciplinas para começar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPlan.subjects.map(s => (
                  <SubjectCard
                    key={s.id}
                    subject={s}
                    activeSession={activeSession}
                    onToggleAccordion={toggleAccordion}
                    onDeleteSubject={deleteSubject}
                    onAddLesson={addLesson}
                    onToggleLesson={toggleLesson}
                    onDeleteLesson={deleteLesson}
                    onOpenNote={openNoteModal}
                    onOpenFlashcards={openFlashcardsModal}
                    onOpenStats={openStatsModal}
                    onPlaySession={handleStartSession}
                  />
                ))}
              </div>
            )}
            <Pomodoro 
                key={currentPlan.id} 
                initialSettings={currentPlan.timerSettings} 
                onSaveSettings={handleUpdateTimer} 
                activeSession={activeSession}
                onPauseSession={handlePauseSession}
                onStopSession={handleStopSession}
            />
          </>
        ) : (
          <Analytics subjects={currentPlan.subjects} />
        )}
      </main>

      {/* MODALS */}
      <RevisionModal isOpen={revisionModalOpen} onClose={() => setRevisionModalOpen(false)} onSelect={handleRevisionSelect} />
      {currentNote && <NotesModal isOpen={notesModalOpen} lessonTitle={currentNote.title} initialContent={currentNote.content} onClose={() => setNotesModalOpen(false)} onSave={saveNote} />}
      {currentFlashcardLesson && <FlashcardsModal isOpen={flashcardsModalOpen} lessonTitle={currentFlashcardLesson.title} flashcards={currentFlashcardLesson.cards} onClose={() => setFlashcardsModalOpen(false)} onAddCard={addFlashcard} onDeleteCard={deleteFlashcard} />}
      {currentStatsLesson && <LessonStatsModal isOpen={statsModalOpen} lessonTitle={currentStatsLesson.title} initialMetrics={currentStatsLesson.metrics} onClose={() => setStatsModalOpen(false)} onSave={saveStats} />}

      {/* NEW PLAN MODAL */}
      {showNewPlanInput && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-sm rounded-2xl p-6">
             <h2 className="text-white font-bold mb-4">Novo Plano</h2>
             <form onSubmit={createPlan}>
               <input type="text" value={newPlanName} onChange={e => setNewPlanName(e.target.value)} placeholder="Nome..." className="w-full bg-[#252525] text-white p-3 rounded-lg border border-gray-700 outline-none mb-4" autoFocus />
               <div className="flex gap-2"><button type="button" onClick={() => setShowNewPlanInput(false)} className="flex-1 py-2 bg-gray-800 rounded-lg text-gray-400">Cancelar</button><button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg">Criar</button></div>
             </form>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} /> Backup</h2><button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white"><X size={24} /></button></div>
            <div className="space-y-4">
              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700"><h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Download size={16}/> Exportar</h3><button onClick={exportData} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Copiar JSON</button></div>
              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700"><h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Upload size={16}/> Restaurar</h3><textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Cole JSON aqui..." className="w-full h-24 bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 mb-3 font-mono"/><button onClick={importData} disabled={!importText} className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Restaurar</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;