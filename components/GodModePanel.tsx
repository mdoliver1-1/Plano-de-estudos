
import React, { useState, useEffect } from 'react';
import { Shield, Zap, Trophy, X, Skull, RefreshCw, Calendar, Save, CheckSquare, Square } from 'lucide-react';
import { StudyPlan } from '../types';

interface GodModePanelProps {
  isOpen: boolean;
  currentPlan: StudyPlan;
  onClose: () => void;
  onUpdatePlan: (updatedPlan: StudyPlan) => void;
}

// 12 OFFICIAL TROPHIES
const MEDAL_IDS = [
  { id: 'start', name: 'Primeiro Passo' },
  { id: 'dedica', name: 'Dedicação (7d)' },
  { id: 'maratonista', name: 'Maratonista (4h)' },
  { id: 'sniper', name: 'Sniper (100%)' },
  { id: 'coruja', name: 'Coruja (Noturno)' },
  { id: 'club5', name: 'Clube das 5' },
  { id: 'fenix', name: 'Fênix (Retorno)' },
  { id: 'enciclopedia', name: 'Enciclopédia' },
  { id: 'cards', name: 'Mestre dos Cards' },
  { id: 'fds', name: 'Guerreiro FDS' },
  { id: 'vitalicio', name: 'Vitalício (Nv 100)' },
  { id: 'imortal', name: 'Imortal (100d)' },
];

export const GodModePanel: React.FC<GodModePanelProps> = ({ isOpen, currentPlan, onClose, onUpdatePlan }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Local Edit States
  const [xpInput, setXpInput] = useState(0);
  const [streakInput, setStreakInput] = useState(0);
  const [iceInput, setIceInput] = useState(0);
  const [forcedMedals, setForcedMedals] = useState<string[]>([]);

  // Sync state when plan changes or modal opens
  useEffect(() => {
    if (isOpen && currentPlan) {
      setStreakInput(currentPlan.streak || 0);
      setIceInput(currentPlan.inventory?.ice || 0);
      setForcedMedals(currentPlan.forcedMedals || []);
      setXpInput(currentPlan.bonusXP || 0);
    }
  }, [isOpen, currentPlan]);

  if (!isOpen) return null;

  // --- LOGIC HANDLERS ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '19101988') {
      setIsAuthenticated(true);
    } else {
      alert('Acesso Negado');
      setPassword('');
    }
  };

  const saveChanges = () => {
    onUpdatePlan({
      ...currentPlan,
      streak: streakInput,
      inventory: { ...currentPlan.inventory, ice: iceInput },
      bonusXP: xpInput,
      forcedMedals: forcedMedals
    });
    alert('Alterações aplicadas com sucesso!');
  };

  const toggleMedal = (id: string) => {
    if (forcedMedals.includes(id)) {
      setForcedMedals(prev => prev.filter(m => m !== id));
    } else {
      setForcedMedals(prev => [...prev, id]);
    }
  };

  const setLevel100 = () => {
    // 100 = sqrt(xp)/5 -> 500 = sqrt(xp) -> 250,000 = xp
    setXpInput(250000);
  };

  const debugGenerateRevisions = () => {
    const subjects = [...currentPlan.subjects];
    let changedCount = 0;
    const allLessons = subjects.flatMap(s => s.lessons.map(l => ({ sId: s.id, lId: l.id, ...l })));
    const shuffled = allLessons.sort(() => 0.5 - Math.random());
    const targetLessons = shuffled.slice(0, 3);
    const now = new Date();
    const dueTime = new Date(now.setDate(now.getDate() - 1)).toISOString();

    const newSubjects = subjects.map(s => ({
      ...s,
      lessons: s.lessons.map(l => {
        if (targetLessons.some(t => t.lId === l.id)) {
          changedCount++;
          return { ...l, completed: true, revisionDate: dueTime };
        }
        return l;
      })
    }));

    onUpdatePlan({ ...currentPlan, subjects: newSubjects });
    alert(`${changedCount} revisões geradas para "ontem".`);
  };

  const debugClearRevisions = () => {
    const newSubjects = currentPlan.subjects.map(s => ({
      ...s,
      lessons: s.lessons.map(l => ({ ...l, revisionDate: null, revisionQueue: [] }))
    }));
    onUpdatePlan({ ...currentPlan, subjects: newSubjects });
    alert('Todas as revisões foram limpas.');
  };

  // --- RENDER ---

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">
        <div className="w-full max-w-sm bg-[#000] border border-red-900/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center animate-in zoom-in-95">
          <div className="mb-6 flex justify-center text-red-600 animate-pulse">
            <Skull size={48} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Restricted Area</h2>
          <p className="text-red-500 font-mono text-sm mb-6">GOD MODE ACCESS REQUESTED</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              inputMode="numeric"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-red-900 text-red-500 text-center text-2xl tracking-[0.5em] p-4 rounded-lg outline-none focus:border-red-500 transition-all mb-4 font-mono"
              placeholder="••••••••"
              autoFocus
            />
            <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-900 text-gray-500 rounded-lg hover:text-white transition-colors uppercase font-bold text-xs">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors uppercase font-bold text-xs tracking-wider shadow-lg shadow-red-900/20">Acessar</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-red-900/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-red-950/10">
          <div className="flex items-center gap-3">
             <div className="bg-red-500 p-2 rounded-lg text-black animate-pulse"><Skull size={24} strokeWidth={2.5}/></div>
             <div>
               <h2 className="text-xl font-black text-white uppercase tracking-widest">Painel God Mode</h2>
               <p className="text-xs text-red-400 font-mono">SANDBOX ADMIN CONTROLS v32.0</p>
             </div>
          </div>
          <button onClick={onClose} className="bg-gray-900 text-gray-500 rounded-full hover:text-white hover:bg-gray-800 p-2"><X size={20}/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* 1. Stats Editing */}
          <section>
            <h3 className="text-red-500 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                <Zap size={14}/> Variáveis de Progresso
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#111] p-4 rounded-xl border border-gray-800">
                    <label className="text-gray-400 text-xs font-bold block mb-2">Bonus XP (Nível)</label>
                    <div className="flex gap-2">
                        <input type="number" value={xpInput} onChange={e => setXpInput(parseInt(e.target.value) || 0)} className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-mono" />
                        <button onClick={setLevel100} className="px-3 py-2 bg-yellow-600/20 text-yellow-500 text-xs font-bold rounded-lg hover:bg-yellow-600/40 border border-yellow-600/30">MAX</button>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">Nível aprox: {Math.floor(Math.sqrt(xpInput)/5) + 1}</p>
                </div>
                
                <div className="bg-[#111] p-4 rounded-xl border border-gray-800">
                    <label className="text-gray-400 text-xs font-bold block mb-2">Ofensiva (Dias)</label>
                    <div className="flex gap-2">
                        <input type="number" value={streakInput} onChange={e => setStreakInput(parseInt(e.target.value) || 0)} className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-mono" />
                        <button onClick={() => setStreakInput(30)} className="px-3 py-2 bg-orange-600/20 text-orange-500 text-xs font-bold rounded-lg hover:bg-orange-600/40 border border-orange-600/30">30d</button>
                    </div>
                </div>

                <div className="bg-[#111] p-4 rounded-xl border border-gray-800">
                    <label className="text-gray-400 text-xs font-bold block mb-2">Cristais de Gelo</label>
                    <div className="flex gap-2">
                        <input type="number" value={iceInput} onChange={e => setIceInput(parseInt(e.target.value) || 0)} className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-mono" />
                        <button onClick={() => setIceInput(iceInput + 5)} className="px-3 py-2 bg-cyan-600/20 text-cyan-500 text-xs font-bold rounded-lg hover:bg-cyan-600/40 border border-cyan-600/30">+5</button>
                    </div>
                </div>
            </div>
          </section>

          {/* 2. Medal Management */}
          <section>
            <h3 className="text-red-500 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                <Trophy size={14}/> Gerenciar Troféus
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {MEDAL_IDS.map(m => {
                  const isUnlocked = forcedMedals.includes(m.id);
                  return (
                    <button 
                      key={m.id} 
                      onClick={() => toggleMedal(m.id)}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-all ${isUnlocked ? 'bg-yellow-900/10 border-yellow-600/50 text-yellow-500' : 'bg-[#111] border-gray-800 text-gray-500 hover:border-gray-600'}`}
                    >
                      <span className="text-xs font-bold">{m.name}</span>
                      {isUnlocked ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  );
                })}
            </div>
          </section>

          {/* 3. Debug Actions */}
          <section>
            <h3 className="text-red-500 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                <RefreshCw size={14}/> Debug & Testes
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={debugGenerateRevisions} className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-gray-700">
                <Calendar size={16} className="text-yellow-500"/>
                Gerar 3 Revisões (Hoje)
              </button>
              <button onClick={debugClearRevisions} className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-gray-700">
                <RefreshCw size={16} className="text-blue-500"/>
                Limpar Revisões
              </button>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-[#050505] rounded-b-2xl">
           <button onClick={saveChanges} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 uppercase tracking-wider transition-all active:scale-95">
             <Save size={20} /> Salvar Tudo e Sair
           </button>
        </div>

      </div>
    </div>
  );
};
