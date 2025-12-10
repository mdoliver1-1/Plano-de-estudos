
import React, { useState, useEffect } from 'react';
import { PlusCircle, GraduationCap, Settings, Check, Download, Upload, X, ChevronDown, Trash2, Layout, Plus, PieChart, LogOut, Trophy, HelpCircle, ChevronRight, Lock, Briefcase } from 'lucide-react';
import { Subject, StudyPlan, Flashcard, UserProfile, LessonMetrics, ActiveSession, CAREERS } from './types';
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
import { GodModePanel } from './components/GodModePanel';

// KEYS
const USERS_KEY = 'study-master-users';
const CURRENT_USER_ID_KEY = 'study-master-current-user-id';

const DEFAULT_TIMER = { focus: 25, short: 5, long: 15 };

// HELPER: Calculate Rank based on TOTAL XP and CAREER
export const getRankInfo = (xp: number, careerId: string = 'fiscal') => {
    const level = Math.floor(Math.sqrt(xp) / 5) + 1;
    const career = CAREERS[careerId] || CAREERS['fiscal'];
    const titles = career.ranks;
    
    let rankName = titles[0]; // Default
    let color = 'text-gray-400';
    let border = 'border-gray-600/50';
    let bg = 'bg-gray-600/10';

    if (level >= 100) { rankName = titles[5]; color = 'text-cyan-400'; border = 'border-cyan-500/50'; bg = 'bg-cyan-500/10'; }
    else if (level >= 75) { rankName = titles[4]; color = 'text-yellow-400'; border = 'border-yellow-500/50'; bg = 'bg-yellow-500/10'; }
    else if (level >= 50) { rankName = titles[3]; color = 'text-purple-400'; border = 'border-purple-500/50'; bg = 'bg-purple-500/10'; }
    else if (level >= 21) { rankName = titles[2]; color = 'text-blue-400'; border = 'border-blue-500/50'; bg = 'bg-blue-500/10'; }
    else if (level >= 6) { rankName = titles[1]; color = 'text-amber-500'; border = 'border-amber-500/50'; bg = 'bg-amber-500/10'; }

    return { name: rankName, color, border, bg, level };
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
  
  // GOD MODE STATE
  const [showGodMode, setShowGodMode] = useState(false);
  
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
    loadUserData(user.id, user.careerId);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
    setPlans([]);
    setCurrentPlanId('');
    setActiveSession(null);
    setShowSettings(false); 
  };

  const createUser = (name: string, avatar: string, careerId: string) => {
    const newUser: UserProfile = { id: generateId(), name, avatar, createdAt: Date.now(), careerId };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loginUser(newUser);
  };

  // --- FIX 1: USER DELETION LOGIC ---
  const deleteUser = (id: string) => {
    // 1. Native Confirm
    if (!window.confirm('Tem certeza absoluta? Todos os dados desse usuário serão perdidos para sempre.')) return;
    
    // 2. State Update
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    
    // 3. Persistent Storage Update
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.removeItem(`study-data-${id}`);
    
    // 4. Handle Logout if needed
    if (currentUser?.id === id) logoutUser();
  };

  // --- DATA PERSISTENCE ---
  const loadUserData = (userId: string, careerId?: string) => {
    const dataKey = `study-data-${userId}`;
    const savedData = localStorage.getItem(dataKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.plans && parsed.plans.length > 0) {
           setPlans(parsed.plans);
           setCurrentPlanId(parsed.currentPlanId || parsed.plans[0]?.id || '');
        } else createDefaultPlan(careerId);
      } catch (e) { createDefaultPlan(careerId); }
    } else createDefaultPlan(careerId);
  };

  useEffect(() => {
    if (currentUser && plans.length > 0) {
      const dataKey = `study-data-${currentUser.id}`;
      localStorage.setItem(dataKey, JSON.stringify({ plans, currentPlanId }));
    }
  }, [plans, currentPlanId, currentUser]);

  const createDefaultPlan = (careerId: string = 'fiscal') => {
    const defaultPlan: StudyPlan = {
      id: generateId(),
      name: 'Plano Principal',
      subjects: [],
      timerSettings: DEFAULT_TIMER,
      createdAt: Date.now(),
      streak: 0,
      lastStudyDate: 0,
      inventory: { ice: 1 },
      bonusXP: 0,
      forcedMedals: [],
      careerId: careerId // Use career from profile or default
    };
    setPlans([defaultPlan]);
    setCurrentPlanId(defaultPlan.id);
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
      inventory: { ice: 1 },
      forcedMedals: [],
      careerId: currentUser?.careerId || 'fiscal' // Inherit user career
    };
    setPlans(prev => [...prev, newPlan]);
    setCurrentPlanId(newPlan.id);
    setNewPlanName('');
    setShowNewPlanInput(false);
    setShowPlanMenu(false);
  };

  // --- FIX 2: PLAN DELETION LOGIC ---
  const deleteCurrentPlan = (e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevents menu from just closing without action
    }
    
    if (plans.length <= 1) return alert("Você precisa ter pelo menos um plano ativo.");
    
    if (window.confirm(`Excluir plano "${getCurrentPlan()?.name}" permanentemente?`)) {
      const newPlans = plans.filter(p => p.id !== currentPlanId);
      const nextPlanId = newPlans[0].id;

      setPlans(newPlans);
      setCurrentPlanId(nextPlanId);
      setShowPlanMenu(false);
      
      // Force sync to storage immediately
      if (currentUser) {
          localStorage.setItem(`study-data-${currentUser.id}`, JSON.stringify({ 
              plans: newPlans, 
              currentPlanId: nextPlanId 
          }));
      }
    }
  };

  const updateCurrentPlan = (updater: (plan: StudyPlan) => StudyPlan) => {
    setPlans(prev => prev.map(p => p.id === currentPlanId ? updater(p) : p));
  };

  // --- GOD MODE HANDLER ---
  const handleGodModeUpdate = (updatedPlan: StudyPlan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  // --- SUBJECT/LESSON ACTIONS ---
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

  // --- FIX 3: SUBJECT DELETION LOGIC ---
  const deleteSubject = (id: string) => {
      // Logic handled in SubjectCard via isDeleting state, but this performs the data update
      updateCurrentPlan(plan => ({...plan, subjects: plan.subjects.filter(s => s.id !== id)}));
  };
  
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

  // --- FIX 4: LESSON DELETION LOGIC ---
  const deleteLesson = (sId: string, lId: string) => {
    if (activeSession?.lId === lId) return alert("Pare o timer antes de excluir.");
    // Confirmation handled in LessonItem, this executes the removal
    updateCurrentPlan(plan => ({
      ...plan,
      subjects: plan.subjects.map(s => s.id === sId ? { ...s, lessons: s.lessons.filter(l => l.id !== lId) } : s)
    }));
  };

  const toggleLesson = (sId: string, lId: string) => {
    const plan = getCurrentPlan();
    const l = plan?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (!l) return;

    const isRevisionDue = l.completed && l.revisionDate && new Date(l.revisionDate) <= new Date();

    if (!l.completed) {
      setPendingLesson({ sId, lId });
      setRevisionModalOpen(true);
    } else if (isRevisionDue) {
      let nextDate = null;
      let nextQueue = l.revisionQueue ? [...l.revisionQueue] : [];

      if (nextQueue.length > 0) {
        nextQueue.sort((a, b) => a - b);
        nextDate = new Date(nextQueue[0]).toISOString();
        nextQueue = nextQueue.slice(1);
      }

      updateLessonStatus(sId, lId, true, nextDate, nextQueue);
    } else {
      if (confirm('Desmarcar aula? O histórico de revisões futuras será perdido.')) {
        updateLessonStatus(sId, lId, false, null, []);
      }
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
  const handleScheduleRevisions = (dates: number[]) => {
    if (!pendingLesson) return;
    let revisionDate = null;
    let revisionQueue: number[] = [];
    if (dates.length > 0) {
        const sorted = dates.sort((a, b) => a - b);
        revisionDate = new Date(sorted[0]).toISOString();
        revisionQueue = sorted.slice(1);
    }
    updateLessonStatus(pendingLesson.sId, pendingLesson.lId, true, revisionDate, revisionQueue);
    setRevisionModalOpen(false);
    setPendingLesson(null);
  };

  // --- TIMER & MODALS (MATH FIX) ---
  const handleStartSession = (sId: string, lId: string) => {
    if (activeSession && activeSession.sId === sId && activeSession.lId === lId) {
        handlePauseSession(); return;
    }
    const l = getCurrentPlan()?.subjects.find(s => s.id === sId)?.lessons.find(l => l.id === lId);
    if (!l) return;
    // START: Accumulated is 0, startTime is NOW.
    setActiveSession({ sId, lId, title: l.title, startTime: Date.now(), accumulatedTime: 0, isPaused: false });
  };

  const handlePauseSession = () => {
      if (!activeSession) return;
      
      if (activeSession.isPaused) {
          // RESUMING: Set new start time, keep accumulated time as is.
          setActiveSession({ 
              ...activeSession, 
              isPaused: false, 
              startTime: Date.now() 
          });
      } else {
          // PAUSING: Calculate delta from last start, add to accumulated, clear start.
          const now = Date.now();
          const currentSegmentDuration = now - activeSession.startTime;
          
          setActiveSession({ 
              ...activeSession, 
              isPaused: true, 
              accumulatedTime: activeSession.accumulatedTime + currentSegmentDuration,
              startTime: 0 // Resetting start time as it's not running
          });
      }
  };

  const handleStopSession = () => {
      if (!activeSession) return;
      
      // Calculate final total
      let finalDuration = activeSession.accumulatedTime;
      
      // If we stop while it's running, we need to add the current segment
      if (!activeSession.isPaused) {
          finalDuration += (Date.now() - activeSession.startTime);
      }
      
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

  // Wrappers
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
  
  // XP Calculation
  let calculatedXP = 0;
  currentPlan.subjects.forEach(s => s.lessons.forEach(l => {
     if(l.metrics) {
        calculatedXP += (l.metrics.studyTime) + (l.metrics.questionsTotal * 20) + (l.metrics.questionsCorrect * 30);
     }
  }));
  const totalXP = calculatedXP + (currentPlan.bonusXP || 0);

  const rank = getRankInfo(totalXP, currentPlan.careerId);

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans pb-40">
      
      {/* PREMIUM HEADER */}
      <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800 shadow-xl safe-area-top">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left: Identity */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 flex items-center justify-center text-2xl shadow-lg relative overflow-hidden">
                {currentUser.avatar}
              </div>
              <div className="flex flex-col relative group min-w-0">
                <h1 className="text-lg font-bold text-white leading-tight truncate">{currentUser.name}</h1>
                <div 
                    onClick={() => setShowPlanMenu(!showPlanMenu)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 cursor-pointer transition-colors relative"
                >
                    <span className="truncate max-w-[140px]">{currentPlan.name}</span>
                    <ChevronDown size={10} />
                </div>
                
                {/* FLOATING PLAN MENU */}
                {showPlanMenu && (
                    <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowPlanMenu(false)}></div>
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
                            <button 
                                onClick={deleteCurrentPlan} 
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg mt-1 mb-1"
                            >
                                <Trash2 size={16} /> Excluir
                            </button>
                            <div className="w-full h-px bg-gray-700 my-1"></div>
                            <button onClick={logoutUser} className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-red-900/10 text-red-400 hover:bg-red-900/20 rounded-lg font-bold"><LogOut size={16} /> Sair / Trocar</button>
                        </div>
                    </div>
                    </>
                )}
              </div>
            </div>

            {/* Right: Rank Tag */}
            <div className={`flex flex-col items-end`}>
                 <div className={`px-3 py-1 rounded-full border ${rank.border} ${rank.bg} backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center gap-2 mb-1`}>
                    <span className={`text-[10px] font-bold tracking-widest ${rank.color} uppercase truncate max-w-[100px]`}>{rank.name}</span>
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
                <div className="w-px bg-gray-800 mx-1"></div>
                <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors">
                    <Settings size={18} />
                </button>
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
                    onPauseSession={handlePauseSession}
                    onStopSession={handleStopSession}
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
      <RevisionModal isOpen={revisionModalOpen} onClose={() => setRevisionModalOpen(false)} onConfirm={handleScheduleRevisions} />
      {currentNote && <NotesModal isOpen={notesModalOpen} lessonTitle={currentNote.title} initialContent={currentNote.content} onClose={() => setNotesModalOpen(false)} onSave={saveNote} />}
      {currentFlashcardLesson && <FlashcardsModal isOpen={flashcardsModalOpen} lessonTitle={currentFlashcardLesson.title} flashcards={currentFlashcardLesson.cards} onClose={() => setFlashcardsModalOpen(false)} onAddCard={addFlashcard} onDeleteCard={deleteFlashcard} />}
      {currentStatsLesson && <LessonStatsModal isOpen={statsModalOpen} lessonTitle={currentStatsLesson.title} initialMetrics={currentStatsLesson.metrics} onClose={() => setStatsModalOpen(false)} onSave={saveStats} />}
      <GuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />
      
      {/* GOD MODE PANEL (NEW) */}
      <GodModePanel 
        isOpen={showGodMode} 
        currentPlan={currentPlan} 
        onClose={() => setShowGodMode(false)}
        onUpdatePlan={handleGodModeUpdate} 
      />

      {/* New Plan Modal */}
      {showNewPlanInput && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-sm rounded-2xl p-6">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-white font-bold">Novo Plano</h2>
                 <button onClick={() => setShowNewPlanInput(false)} className="p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white"><X size={16}/></button>
             </div>
             <form onSubmit={createPlan}>
               <input type="text" value={newPlanName} onChange={e => setNewPlanName(e.target.value)} placeholder="Nome..." className="w-full bg-[#252525] text-white p-3 rounded-lg border border-gray-700 outline-none mb-4" autoFocus />
               <div className="flex gap-2"><button type="button" onClick={() => setShowNewPlanInput(false)} className="flex-1 py-2 bg-gray-800 rounded-lg text-gray-400">Cancelar</button><button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg">Criar</button></div>
             </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} /> Configurações</h2><button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-red-900/30 transition-all"><X size={20} /></button></div>
            <div className="space-y-4 flex-1">
              
              {/* CAREER SELECTION */}
              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700">
                  <h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Briefcase size={16}/> Escolha sua Carreira</h3>
                  <div className="relative">
                      <select 
                          value={currentPlan.careerId || 'fiscal'}
                          onChange={(e) => updateCurrentPlan(p => ({ ...p, careerId: e.target.value }))}
                          className="w-full appearance-none bg-[#1a1a1a] text-white border border-gray-600 rounded-lg p-3 text-sm focus:border-green-500 outline-none font-bold"
                      >
                          {Object.entries(CAREERS).map(([key, data]) => (
                              <option key={key} value={key}>{data.label}</option>
                          ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                      Isso altera os nomes das patentes no seu perfil e nas conquistas (Nível 1 ao 100+).
                  </p>
              </div>

              <button onClick={() => { setGuideModalOpen(true); setShowSettings(false); }} className="w-full p-4 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/50 rounded-xl flex items-center justify-between group transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg text-white"><HelpCircle size={20}/></div>
                  <div className="text-left"><h3 className="font-bold text-blue-200">Guia do Usuário</h3><p className="text-xs text-blue-400">Regras, XP e Patentes</p></div>
                </div>
                <div className="text-blue-500 group-hover:translate-x-1 transition-transform"><ChevronRight size={18} /></div>
              </button>
              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700"><h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Download size={16}/> Exportar Dados</h3><button onClick={exportData} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Copiar JSON</button></div>
              <div className="p-4 bg-[#252525] rounded-xl border border-gray-700"><h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><Upload size={16}/> Restaurar Dados</h3><textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Cole JSON aqui..." className="w-full h-24 bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 mb-3 font-mono"/><button onClick={importData} disabled={!importText} className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Restaurar</button></div>
              
              
              {/* --- GOD MODE BUTTON --- */}
              <div className="mt-8 pt-4 border-t border-gray-800">
                  <button 
                    onClick={() => { setShowSettings(false); setShowGodMode(true); }}
                    className="w-full py-4 bg-red-900/10 hover:bg-red-900/30 text-red-600 hover:text-red-400 border border-red-900/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs"
                  >
                      <Lock size={14} /> ACESSO ROOT / GOD MODE
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
