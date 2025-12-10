
import React, { useState } from 'react';
import { Trophy, Lock, Shield, Flame, X } from 'lucide-react';
import { UserProfile, StudyPlan, Subject } from '../types';

interface AchievementsTabProps {
  user: UserProfile;
  plan: StudyPlan;
  subjects: Subject[];
}

// --- GAMIFICATION LOGIC HELPER ---
const calculateStats = (subjects: Subject[], bonusXP: number = 0) => {
  let totalTime = 0;
  let totalQ = 0;
  let correctQ = 0;
  let totalLessons = 0;
  let completedLessons = 0;

  subjects.forEach(s => {
    s.lessons.forEach(l => {
      totalLessons++;
      if (l.completed) completedLessons++;
      if (l.metrics) {
        totalTime += l.metrics.studyTime || 0;
        totalQ += l.metrics.questionsTotal || 0;
        correctQ += l.metrics.questionsCorrect || 0;
      }
    });
  });

  // XP Formula: (Time * 1) + (Questions * 20) + (Correct * 30) + Bonus
  const calculatedXP = Math.floor((totalTime * 1) + (totalQ * 20) + (correctQ * 30));
  const xp = calculatedXP + bonusXP;
  
  const level = Math.floor(Math.sqrt(xp) / 5) + 1; // Quadratic curve
  const progressToNext = Math.floor((Math.sqrt(xp) % 5) * 20); // rough approximation for bar

  return { xp, level, progressToNext, totalTime, totalQ, correctQ, totalLessons, completedLessons };
};

const getRank = (level: number) => {
  if (level >= 100) return { name: 'LENDA', color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500' };
  if (level >= 75) return { name: 'MESTRE', color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500' };
  if (level >= 50) return { name: 'ESPECIALISTA', color: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500' };
  if (level >= 21) return { name: 'ESTUDIOSO', color: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500' };
  if (level >= 6) return { name: 'APRENDIZ', color: 'text-amber-500', bg: 'bg-amber-600', border: 'border-amber-600' };
  return { name: 'NOVATO', color: 'text-gray-400', bg: 'bg-gray-600', border: 'border-gray-600' };
};

// --- MEDAL CONFIGURATION (3D ASSETS) ---
type MedalTier = 'bronze' | 'silver' | 'gold';

interface MedalDef {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  tier: MedalTier;
  req: (s: any) => boolean;
}

const MEDALS: MedalDef[] = [
  { id: 'start', name: 'Primeiro Passo', desc: 'Conclua sua primeira aula.', emoji: '🦶', tier: 'bronze', req: (s) => s.completedLessons >= 1 },
  { id: 'nerd_1', name: 'Dedica', desc: 'Acumule 10 horas de estudo.', emoji: '📚', tier: 'bronze', req: (s) => s.totalTime >= 600 },
  { id: 'nerd_2', name: 'Maratonista', desc: 'Acumule 50 horas de estudo.', emoji: '🏃', tier: 'silver', req: (s) => s.totalTime >= 3000 },
  { id: 'sniper_1', name: 'Atirador', desc: 'Acerte 50 questões.', emoji: '🎯', tier: 'bronze', req: (s) => s.correctQ >= 50 },
  { id: 'sniper_2', name: 'Sniper de Elite', desc: 'Acerte 500 questões.', emoji: '🦅', tier: 'silver', req: (s) => s.correctQ >= 500 },
  { id: 'master', name: 'Mestre do Conteúdo', desc: 'Complete 100 aulas.', emoji: '👑', tier: 'gold', req: (s) => s.completedLessons >= 100 },
];

const TIER_STYLES = {
  bronze: {
    ring: 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-orange-800 via-orange-400 to-orange-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),_0_4px_8px_rgba(0,0,0,0.5)]',
    core: 'bg-gradient-to-br from-orange-900 to-black',
    glow: 'shadow-[0_0_20px_rgba(194,65,12,0.4)]',
    text: 'text-orange-400'
  },
  silver: {
    ring: 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-600 via-slate-200 to-slate-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),_0_4px_8px_rgba(0,0,0,0.5)]',
    core: 'bg-gradient-to-br from-slate-800 to-black',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]',
    text: 'text-slate-300'
  },
  gold: {
    ring: 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-yellow-700 via-yellow-200 to-yellow-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),_0_4px_8px_rgba(0,0,0,0.5)]',
    core: 'bg-gradient-to-br from-yellow-900 to-black',
    glow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)]',
    text: 'text-yellow-400'
  }
};

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ user, plan, subjects }) => {
  const stats = calculateStats(subjects, plan.bonusXP || 0);
  const rank = getRank(stats.level);
  const [selectedMedal, setSelectedMedal] = useState<MedalDef & { isUnlocked: boolean } | null>(null);

  const iceCount = plan.inventory?.ice || 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- IDENTITY CARD --- */}
      <div className={`relative overflow-hidden rounded-2xl border ${rank.border} bg-[#1e1e1e] p-6 mb-6 shadow-2xl`}>
        <div className={`absolute top-0 right-0 p-2 ${rank.bg} text-black text-xs font-bold px-3 rounded-bl-xl`}>
          {rank.name}
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-[#252525] rounded-full flex items-center justify-center text-5xl shadow-inner border-2 border-gray-700">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white truncate">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1 mb-2">
               <span className={`text-sm font-bold ${rank.color}`}>Nível {stats.level}</span>
               <span className="text-xs text-gray-500">({stats.xp} XP)</span>
            </div>
            
            {/* XP Bar */}
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <div 
                className={`h-full ${rank.bg} transition-all duration-1000 ease-out`} 
                style={{ width: `${stats.progressToNext}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-right">{stats.progressToNext}% para o próximo nível</p>
          </div>
        </div>

        {/* Background Glow */}
        <div className={`absolute -top-10 -left-10 w-40 h-40 ${rank.bg} opacity-10 blur-3xl rounded-full pointer-events-none`}></div>
      </div>

      {/* --- INVENTORY & STREAK --- */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
           <div className="flex items-center gap-3">
             <div className="bg-cyan-900/30 p-2.5 rounded-lg text-cyan-400">
               <Shield size={24} fill="currentColor" className="opacity-80"/>
             </div>
             <div>
               <p className="text-xs text-gray-500 font-bold uppercase">Gelos</p>
               <p className="text-xl font-bold text-white">{iceCount}</p>
             </div>
           </div>
        </div>

        <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
           <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-lg ${plan.streak && plan.streak > 0 ? 'bg-orange-900/30 text-orange-500' : 'bg-gray-800 text-gray-600'}`}>
               <Flame size={24} fill={plan.streak && plan.streak > 0 ? "currentColor" : "none"} />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-bold uppercase">Ofensiva</p>
               <p className="text-xl font-bold text-white">{plan.streak || 0} Dias</p>
             </div>
           </div>
        </div>
      </div>

      {/* --- TROPHY ROOM (3D MEDALS) --- */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" /> Sala de Troféus
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-8 gap-x-4">
          {MEDALS.map((medal) => {
            const isUnlocked = medal.req(stats);
            const style = TIER_STYLES[medal.tier];

            return (
              <button 
                key={medal.id}
                onClick={() => setSelectedMedal({ ...medal, isUnlocked })}
                className="flex flex-col items-center group relative focus:outline-none"
              >
                {/* 3D Medal Container */}
                <div className={`relative w-20 h-20 rounded-full transition-all duration-500 ${isUnlocked ? `${style.glow} scale-100 hover:scale-105` : 'grayscale opacity-60 scale-95'}`}>
                   
                   {/* Metal Ring (Outer) */}
                   <div className={`absolute inset-0 rounded-full ${style.ring}`}></div>
                   
                   {/* Enamel Core (Inner) */}
                   <div className={`absolute inset-2 rounded-full ${style.core} shadow-inner flex items-center justify-center`}>
                        {/* High Relief Emoji */}
                        <span className="text-3xl filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] select-none">
                            {medal.emoji}
                        </span>
                   </div>

                   {/* Locked Overlay */}
                   {!isUnlocked && (
                       <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-[1px]">
                           <Lock size={24} className="text-gray-400 drop-shadow-md" />
                       </div>
                   )}

                   {/* Shine Effect (Pure CSS) */}
                   {isUnlocked && (
                       <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                   )}
                </div>

                {/* Text Label */}
                <span className={`mt-3 text-[10px] text-center font-bold uppercase tracking-wider truncate w-full px-1 transition-colors ${isUnlocked ? style.text : 'text-gray-600'}`}>
                  {medal.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- MEDAL DETAIL POPUP --- */}
      {selectedMedal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedMedal(null)}>
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center relative animate-in fade-in zoom-in-95 shadow-2xl" onClick={e => e.stopPropagation()}>
             <button onClick={() => setSelectedMedal(null)} className="absolute top-3 right-3 p-2 text-gray-500 hover:text-white bg-gray-800/50 rounded-full transition-colors"><X size={20}/></button>
             
             {/* Big Version of Medal */}
             <div className="flex justify-center mb-6">
                <div className={`relative w-32 h-32 rounded-full ${selectedMedal.isUnlocked ? TIER_STYLES[selectedMedal.tier].glow : 'grayscale opacity-80'}`}>
                    <div className={`absolute inset-0 rounded-full ${TIER_STYLES[selectedMedal.tier].ring}`}></div>
                    <div className={`absolute inset-3 rounded-full ${TIER_STYLES[selectedMedal.tier].core} shadow-inner flex items-center justify-center`}>
                        <span className="text-6xl filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                            {selectedMedal.emoji}
                        </span>
                    </div>
                    {!selectedMedal.isUnlocked && (
                       <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                           <Lock size={40} className="text-gray-300" />
                       </div>
                   )}
                </div>
             </div>
             
             <h3 className={`text-2xl font-bold mb-2 uppercase tracking-wide ${selectedMedal.isUnlocked ? TIER_STYLES[selectedMedal.tier].text : 'text-gray-400'}`}>
                 {selectedMedal.name}
             </h3>
             <p className="text-gray-400 text-sm mb-6 leading-relaxed px-4">{selectedMedal.desc}</p>
             
             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${selectedMedal.isUnlocked ? `bg-green-900/20 text-green-400 border-green-900` : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
               {selectedMedal.isUnlocked ? (
                   <><Trophy size={12} /> Desbloqueada</>
               ) : (
                   <><Lock size={12} /> Bloqueada</>
               )}
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
