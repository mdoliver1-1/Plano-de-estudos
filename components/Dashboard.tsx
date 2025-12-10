
import React from 'react';
import { Trophy, Target, Flame, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Subject } from '../types';

interface DashboardProps {
  subjects: Subject[];
  totalLessons: number;
  completedLessons: number;
  streak: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ subjects, totalLessons, completedLessons, streak }) => {
  const percentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const xp = completedLessons * 50; 
  const level = Math.floor(xp / 500) + 1;

  // Calculate Reviews due today or earlier
  const now = new Date();
  let dueReviewsCount = 0;
  subjects.forEach(s => {
      s.lessons.forEach(l => {
          if (l.completed && l.revisionDate && new Date(l.revisionDate) <= now) {
              dueReviewsCount++;
          }
      });
  });

  const pieStyle = {
    background: `conic-gradient(#22c55e ${percentage}%, #333 ${percentage}% 100%)`
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      
      {/* Review Alert (Replaces XP if revisions due, or shifts layout) */}
      {dueReviewsCount > 0 ? (
        <div className="bg-yellow-900/20 p-3 rounded-xl border border-yellow-600/50 shadow-[0_0_15px_rgba(234,179,8,0.1)] flex flex-col items-center justify-center text-center animate-pulse">
          <div className="mb-1 text-yellow-500">
            <AlertTriangle size={20} />
          </div>
          <span className="text-[10px] text-yellow-500/80 uppercase font-bold tracking-wider">Revisões Hoje</span>
          <span className="text-lg sm:text-xl font-bold text-white">{dueReviewsCount}</span>
        </div>
      ) : (
        <div className="bg-[#1e1e1e] p-3 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center">
            <div className="mb-1 text-green-500">
                <CheckCircle size={20} />
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Revisões</span>
            <span className="text-lg sm:text-xl font-bold text-white">Em Dia</span>
        </div>
      )}

      {/* Streak Card */}
      <div className="bg-[#1e1e1e] p-3 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center group">
        <div className={`mb-1 transition-all duration-500 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-600'}`}>
          <Flame size={20} fill={streak > 0 ? "currentColor" : "none"} />
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ofensiva</span>
        <span className="text-lg sm:text-xl font-bold text-white">{streak} Dias</span>
      </div>

      {/* Progress Pie Card */}
      <div className="bg-[#1e1e1e] p-3 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center justify-center relative">
        <div className="w-10 h-10 rounded-full flex items-center justify-center relative" style={pieStyle}>
           <div className="w-8 h-8 bg-[#1e1e1e] rounded-full absolute"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pt-1">
             <span className="text-[10px] font-bold text-white">{percentage}%</span>
        </div>
        <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Progresso</span>
      </div>

      {/* Summary Card */}
      <div className="bg-[#1e1e1e] p-3 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center">
         <div className="mb-1 text-blue-500">
          <Activity size={20} />
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Aulas</span>
        <span className="text-lg sm:text-xl font-bold text-white">{completedLessons}/{totalLessons}</span>
      </div>
    </div>
  );
};
