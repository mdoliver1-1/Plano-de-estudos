
import React, { useState, useEffect } from 'react';
import { PlusCircle, GraduationCap, Settings, Check, Download, Upload, X, ChevronDown, Trash2, Layout, Plus, PieChart, LogOut, Trophy, HelpCircle, ChevronRight, Lock, Zap, Skull, Shield, Calendar } from 'lucide-react';
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
import { AchievementsTab } from './components/AchievementsTab';
import { GuideModal } from './components/GuideModal';
import { AmbiencePlayer } from './components/AmbiencePlayer';

// KEYS
const USERS_KEY = 'study-master-users';
const CURRENT_USER_ID_KEY = 'study-master-current-user-id';

const DEFAULT_TIMER = { focus: 25, short: 5, long: 15 };

// HELPER: Calculate Rank based on TOTAL XP
const getRankInfo = (xp: number) => {
    const level = Math.floor(Math.sqrt(xp) / 5) + 1;
    
    if (level >= 100) return { name: 'VITALÍCIO', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10', level };
    if (level >= 75) return { name: 'NOMEADO', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', level };
    if (level >= 50) return { name: 'ELITE', color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10', level };
    if (level >= 21) return { name: 'COMPETITIVO', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10', level };
    if (level >= 6) return { name: 'ASPIRANTE', color: 'text-amber-500', border: 'border-amber-500/50', bg: 'bg-amber-500/10', level };
    return { name: 'INICIANTE', color: 'text-gray-400', border: 'border-gray-600/50', bg: 'bg-gray-600/10', level };
};

const App: React.FC = () => {
  // --- USER STATE ---
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // --- DATA STATE (Scoped to User) ---
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>('');
  
  // UI States
  const [activeTab, setActiveTab] = useState<'study' | 'analytics' | 'achievements'>('study');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false); 
  const [showNewPlanInput, setShowNewPlanInput] = useState(false);
  
  // Developer Mode State
  const [devModeUnlocked, setDevModeUnlocked] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
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

  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // --- HELPERS ---
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  const getCurrentPlan = (): StudyPlan | undefined => plans.find(p => p.id === currentPlanId);

  // --- INIT & USER MANAGEMENT ---
  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    const lastUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (lastUserId && savedUsers) {
      const parsedUsers: UserProfile[] = JSON.parse(savedUsers);
      const user = parsedUsers.find(u => u.id === lastUserId);
      if (user) loginUser(user);
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
    setDevModeUnlocked(false);
  };

  const createUser = (name: string, avatar: string) => {
    const newUser: UserProfile = { id: generateId(), name, avatar, createdAt: Date.now() };
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
      if (currentUser?.id === id) logoutUser();
    }
  };

  // --- DATA PERSISTENCE ---
  const loadUserData = (userId: string) => {
    const dataKey = `study-data-${userId}`;
    const savedData = localStorage.getItem(dataKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.plans) {
           setPlans(parsed.plans);
           setCurrentPlanId(parsed.currentPlanId || parsed.plans[0]?.id || '');
        } else createDefaultPlan();
      } catch (e) { createDefaultPlan(); }
    } else createDefaultPlan();
  };

  useEffect(() => {
    if (currentUser && plans.length > 0) {
      const dataKey = `study-data-${currentUser.id}`;
      localStorage.setItem(dataKey, JSON.stringify({ plans, currentPlanId }));
    }
  }, [plans, currentPlanId, currentUser]);

  const createDefaultPlan = () => {
    const defaultPlan: StudyPlan = {
      id: generateId(),
      name: 'Plano Principal',
      subjects: [],
      timerSettings: DEFAULT_TIMER,
      createdAt: Date.now(),
      streak: 0,
      lastStudyDate: 0,
      inventory: { ice: 1 },
      bonusXP: 0
    };
    setPlans([defaultPlan]);
    setCurrentPlanId(defaultPlan.id);
  };

  // --- DEVELOPER MODE FUNCTIONS ---
  const handleAdminSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (adminPassword === "19101988") {
          setDevModeUnlocked(true);
          setShowAdminLogin(false);
          setAdminPassword('');
      } else {
          alert("Senha Incorreta");
          setAdminPassword('');
      }
  };

  const debugAddXP = () => {
      updateCurrentPlan(p => ({ ...p, bonusXP: (p.bonusXP || 0) + 1000 }));
  };

  const debugAddIce = () => {
      updateCurrentPlan(p => ({ ...p, inventory: { ...p.inventory, ice: (p.inventory?.ice || 0) + 1 } }));
  };

  const debugSimulateDay = () => {
      // Set last study date to 48 hours ago to guarantee streak break check
      updateCurrentPlan(p => ({ ...p, lastStudyDate: Date.now() - (86400000 * 2) }));
      alert("Data de estudo alterada para 2 dias atrás.\nEstude algo para testar a quebra ou uso de Gelo.");
  };

  const debugReset = () => {
      if (confirm("⚠️ PERIGO: Isso apagará TODOS os dados deste plano e recarregará a página. Continuar?") && confirm("Tem certeza absoluta?")) {
         localStorage.clear();
         window.location.reload();
      }
  };

  // --- ACTIONS ---
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
      lastStudyDate: 0,
      inventory: { ice: 1 }
    };
    setPlans(prev => [...prev, newPlan]);
    setCurrentPlanId(newPlan.id);
    setNewPlanName('');
    setShowNewPlanInput(false);
    setShowPlanMenu(false);
  };

  const deleteCurrentPlan = () => {
    if (plans.length <= 1) return alert("Você precisa ter pelo menos um plano ativo.");
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

  const addLesson = (sId: string, title: string, link?: string) => {
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.map(s => s.id === sId ? { 
          ...s, 
          lessons: [...s.lessons, { id: generateId(), title, completed: false, flashcards: [], materialLink: link || undefined }] 
      } : s)
    }));
  };

  const deleteLesson = (sId: string, lId: string) => {
    if (activeSession?.lId === lId) return alert("Pare o timer antes de excluir.");
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.map(s => s.id === sId ? { ...s, lessons: s.lessons.filter(l => l.id !== lId) } : s)
    }));
  };

  const toggleLesson = (sId: string, lId: string) => {
    const plan = getCurrentPlan();
    const l = plan?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (!l) return;

    if (!l.completed) {
      setPendingLesson({ sId, lId });
      setRevisionModalOpen(true);
    } else {
      updateLessonStatus(sId, lId, false, null, []);
    }
  };

  const updateLessonStatus = (sId: string, lId: string, completed: boolean, revisionDate: string | null, revisionQueue: number[]) => {
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
          lessons: s.lessons.map(l => l.id === lId ? { ...l, completed, revisionDate, revisionQueue } : l)
        } : s)
      };
    });
  };

  // --- REVISION CYCLE LOGIC ---
  const handleRevisionSelect = (type: string | null, customDate?: string) => {
    if (pendingLesson) {
      let revisionDate = null;
      let revisionQueue: number[] = [];
      const now = new Date();

      if (type === 'custom' && customDate) {
          revisionDate = new Date(customDate).toISOString();
      } else if (type === 'cycle') {
          // Schedule 1, 7, 30
          const d1 = new Date(now); d1.setDate(d1.getDate() + 1);
          const d7 = new Date(now); d7.setDate(d7.getDate() + 7);
          const d30 = new Date(now); d30.setDate(d30.getDate() + 30);
          
          revisionDate = d1.toISOString();
          revisionQueue = [d7.getTime(), d30.getTime()];
      } else if (type) {
          const days = parseInt(type);
          const date = new Date(now);
          date.setDate(date.getDate() + days);
          revisionDate = date.toISOString();
      }

      updateLessonStatus(pendingLesson.sId, pendingLesson.lId, true, revisionDate, revisionQueue);
    }
    setRevisionModalOpen(false);
    setPendingLesson(null);
  };

  // --- TIMER & MODALS ---
  const handleStartSession = (sId: string, lId: string) => {
    if (activeSession && activeSession.sId === sId && activeSession.lId === lId) {
        handlePauseSession(); return;
    }
    const l = getCurrentPlan()?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (!l) return;
    setActiveSession({ sId, lId, title: l.title, startTime: Date.now(), accumulatedTime: 0, isPaused: false });
  };

  const handlePauseSession = () => {
      if (!activeSession) return;
      if (activeSession.isPaused) setActiveSession({ ...activeSession, isPaused: false, startTime: Date.now() });
      else setActiveSession({ ...activeSession, isPaused: true, accumulatedTime: activeSession.accumulatedTime + (Date.now() - activeSession.startTime) });
  };

  const handleStopSession = () => {
      if (!activeSession) return;
      let finalDuration = activeSession.accumulatedTime;
      if (!activeSession.isPaused) finalDuration += (Date.now() - activeSession.startTime);
      const minutes = finalDuration / 1000 / 60;

      if (minutes > 0) {
          updateCurrentPlan(plan => ({
              ...plan,
              subjects: plan.subjects.map(s => s.id === activeSession.sId ? {
                  ...s,
                  lessons: s.lessons.map(l => l.id === activeSession.lId ? {
                      ...l,
                      metrics: {
                          ...l.metrics,
                          studyTime: (l.metrics?.studyTime || 0) + minutes,
                          questionsTotal: l.metrics?.questionsTotal || 0,
                          questionsCorrect: l.metrics?.questionsCorrect || 0
                      }
                  } : l)
              } : s)
          }));
      }
      setActiveSession(null);
  };

  // Wrappers for modals
  const openNoteModal = (sId: string, lId: string) => {
    const l = getCurrentPlan()?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (l) { setCurrentNote({ sId, lId, title: l.title, content: l.notes || '' }); setNotesModalOpen(true); }
  };
  const saveNote = (c: string) => {
    if (currentNote) {
      updateCurrentPlan(plan => ({...plan, subjects: plan.subjects.map(s => s.id === currentNote.sId ? {...s, lessons: s.lessons.map(l => l.id === currentNote.lId ? {...l, notes: c} : l)} : s)}));
      setNotesModalOpen(false);
    }
  };
  const openFlashcardsModal = (sId: string, lId: string) => {
    const l = getCurrentPlan()?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (l) { setCurrentFlashcardLesson({ sId, lId, title: l.title, cards: l.flashcards || [] }); setFlashcardsModalOpen(true); }
  };
  const addFlashcard = (f: string, b: string) => {
    if (currentFlashcardLesson) {
        const newCard: Flashcard = { id: generateId(), front: f, back: b, createdAt: Date.now() };
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
  const openStatsModal = (sId: string, lId: string) => {
      const l = getCurrentPlan()?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
      if (l) { setCurrentStatsLesson({ sId, lId, title: l.title, metrics: l.metrics }); setStatsModalOpen(true); }
  };
  const saveStats = (m: LessonMetrics) => {
      if (currentStatsLesson) {
          updateCurrentPlan(plan => ({...plan, subjects: plan.subjects.map(s => s.id === currentStatsLesson.sId ? {...s, lessons: s.lessons.map(l => l.id === currentStatsLesson.lId ? {...l, metrics: m} : l)} : s)}));
          setStatsModalOpen(false);
      }
  };
  const exportData = () => { navigator.clipboard.writeText(JSON.stringify({ plans, currentPlanId })).then(() => alert('Backup Copiado!')); };
  const importData = () => { try { const p = JSON.parse(importText); if (p.plans) { setPlans(p.plans); setCurrentPlanId(p.currentPlanId || p.plans[0].id); setShowSettings(false); setImportText(''); alert('Restaurado!'); } } catch (e) { alert('Erro no JSON.'); } };

  // --- RENDER ---
  if (!currentUser) return <LoginScreen users={users} onSelectUser={loginUser} onCreateUser={createUser} onDeleteUser={deleteUser} />;
  const currentPlan = getCurrentPlan();
  if (!currentPlan) return null;

  const allLessons = currentPlan.subjects.flatMap(s => s.lessons);
  const completedLessonsCount = allLessons.filter(l => l.completed).length;
  
  // XP Calculation (Unified)
  let calculatedXP = 0;
  currentPlan.subjects.forEach(s => s.lessons.forEach(l => {
     if(l.metrics) {
        calculatedXP += (l.metrics.studyTime) + (l.metrics.questionsTotal * 20) + (l.metrics.questionsCorrect * 30);
     }
  }));
  const totalXP = calculatedXP + (currentPlan.bonusXP || 0);

  const rank = getRankInfo(totalXP);

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans pb-40">
      
      {/* PREMIUM HEADER */}
      <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800 shadow-xl safe-area-top">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left: Identity */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 flex items-center justify-center text-2xl shadow-lg">
                {currentUser.avatar}
              </div>
              <div className="flex flex-col relative group">
                <h1 className="text-lg font-bold text-white leading-tight">{currentUser.name}</h1>
                <div 
                    onClick={() => setShowPlanMenu(!showPlanMenu)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 cursor-pointer transition-colors relative"
                >
                    <span className="truncate max-w-[150px]">{currentPlan.name}</span>
                    <ChevronDown size={10} />
                </div>
                
                {/* FLOATING PLAN MENU (Correctly Positioned) */}
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

            {/* Right: Rank Tag (Glassmorphism) */}
            <div className={`flex flex-col items-end`}>
                 <div className={`px-3 py-1 rounded-full border ${rank.border} ${rank.bg} backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center gap-2 mb-1`}>
                    <span className={`text-[10px] font-bold tracking-widest ${rank.color} uppercase`}>{rank.name}</span>
                 </div>
                 <span className="text-[10px] text-gray-500 font-mono tracking-wider">NÍVEL {rank.level}</span>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex mt-4 bg-[#181818] p-1 rounded-xl border border-gray-800">
             <button onClick={() => setActiveTab('study')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'study' ? 'bg-[#252525] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                <Layout size={16} /> <span className="hidden sm:inline">Aulas</span>
             </button>
             <button onClick={() => setActiveTab('analytics')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-[#252525] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                <PieChart size={16} /> <span className="hidden sm:inline">Stats</span>
             </button>
             <button onClick={() => setActiveTab('achievements')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'achievements' ? 'bg-[#252525] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                <Trophy size={16} /> <span className="hidden sm:inline">Conquistas</span>
             </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-4 py-4">
        {activeTab === 'study' && (
          <>
            <Dashboard subjects={currentPlan.subjects} totalLessons={allLessons.length} completedLessons={completedLessonsCount} streak={currentPlan.streak || 0}/>
            
            <div className="flex justify-end gap-2 mb-4">
                <button onClick={() => setShowAddSubject(!showAddSubject)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showAddSubject ? 'bg-gray-800 text-white' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'}`}>
                    <PlusCircle size={16} /> Disciplina
                </button>
                <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800"><Settings size={18} /></button>
            </div>

            {/* Add Subject Input */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAddSubject ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                <form onSubmit={addSubject} className="relative">
                <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Nova Disciplina..." autoFocus className="w-full bg-[#1e1e1e] text-white border border-gray-700 focus:border-green-500 rounded-xl pl-4 pr-12 py-3 shadow-inner text-base outline-none" />
                <button type="submit" disabled={!newSubjectName.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-600 hover:bg-green-500 disabled:opacity-0 text-white rounded-lg"><Check size={18} /></button>
                </form>
            </div>

            {currentPlan.subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50 border-2 border-dashed border-gray-800 rounded-2xl">
                <GraduationCap size={48} className="mb-4 text-gray-600" />
                <p className="text-lg text-gray-400 font-medium">Nenhuma Matéria</p>
                <p className="text-sm text-gray-600 mt-2">Crie disciplinas e adicione aulas.</p>
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
            <Pomodoro key={currentPlan.id} initialSettings={currentPlan.timerSettings} onSaveSettings={s => updateCurrentPlan(p => ({...p, timerSettings: s}))} activeSession={activeSession} onPauseSession={handlePauseSession} onStopSession={handleStopSession} />
          </>
        )}

        {activeTab === 'analytics' && <Analytics subjects={currentPlan.subjects} />}
        {activeTab === 'achievements' && <AchievementsTab user={currentUser} plan={currentPlan} subjects={currentPlan.subjects} />}
      </main>

      {/* FOOTER AMBIENCE */}
      <AmbiencePlayer />

      {/* MODALS */}
      <RevisionModal isOpen={revisionModalOpen} onClose={() => setRevisionModalOpen(false)} onSelect={handleRevisionSelect} />
      {currentNote && <NotesModal isOpen={notesModalOpen} lessonTitle={currentNote.title} initialContent={currentNote.content} onClose={() => setNotesModalOpen(false)} onSave={saveNote} />}
      {currentFlashcardLesson && <FlashcardsModal isOpen={flashcardsModalOpen} lessonTitle={currentFlashcardLesson.title} flashcards={currentFlashcardLesson.cards} onClose={() => setFlashcardsModalOpen(false)} onAddCard={addFlashcard} onDeleteCard={deleteFlashcard} />}
      {currentStatsLesson && <LessonStatsModal isOpen={statsModalOpen} lessonTitle={currentStatsLesson.title} initialMetrics={currentStatsLesson.metrics} onClose={() => setStatsModalOpen(false)} onSave={saveStats} />}
      <GuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />

      {/* New Plan Modal */}
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

      {/* Admin Login Modal (Secure) */}
      {showAdminLogin && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2 mb-4 text-red-500 justify-center">
                      <Lock size={24} />
                      <h3 className="font-bold text-white">Acesso Restrito</h3>
                  </div>
                  <form onSubmit={handleAdminSubmit}>
                      <input 
                          type="password" 
                          inputMode="numeric"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Senha numérica"
                          className="w-full bg-[#252525] text-white text-center p-3 rounded-lg border border-gray-700 focus:border-red-500 outline-none mb-4 tracking-widest text-lg"
                          autoFocus
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setShowAdminLogin(false); setAdminPassword(''); }} className="flex-1 py-2 bg-gray-800 text-gray-400 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg">Entrar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} /> Configurações</h2><button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white"><X size={24} /></button></div>
            <div className="space-y-4">
              <button onClick={() => { setGuideModalOpen(true); setShowSettings(false); }} className="w-full p-4 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/50 rounded-xl flex items-center justify-between group transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg text-white"><HelpCircle size={20}/></div>
                  <div className="text-left"><h3 className="font-bold text-blue-200">Guia do Usuário</h3><p className="text-xs text-blue-400">Regras, XP e Patentes</p></div>
                </div>
                <div className="text-blue-500 group-hover:translate-x-1 transition-transform"><ChevronRight size={18} /></div>
              </button>
              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700"><h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Download size={16}/> Exportar Dados</h3><button onClick={exportData} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Copiar JSON</button></div>
              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700"><h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Upload size={16}/> Restaurar Dados</h3><textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Cole JSON aqui..." className="w-full h-24 bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 mb-3 font-mono"/><button onClick={importData} disabled={!importText} className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Restaurar</button></div>
              
              <button onClick={logoutUser} className="w-full py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded-xl font-bold">Sair do Perfil</button>
              
              {/* --- DANGER ZONE (DEVELOPER) --- */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Zona de Perigo</h3>
                  {!devModeUnlocked ? (
                      <button 
                        onClick={() => setShowAdminLogin(true)}
                        className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                          <Lock size={18} /> 🔒 ABRIR ÁREA ADM
                      </button>
                  ) : (
                      <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                          <button onClick={debugAddXP} className="p-3 bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 border border-purple-900/50 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                              <Zap size={16} /> +1000 XP
                          </button>
                          <button onClick={debugAddIce} className="p-3 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-900/50 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                              <Shield size={16} /> +1 Gelo
                          </button>
                          <button onClick={debugSimulateDay} className="p-3 bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 border border-orange-900/50 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                              <Calendar size={16} /> Simular Dia
                          </button>
                          <button onClick={debugReset} className="p-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                              <Skull size={16} /> Reset Total
                          </button>
                      </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
