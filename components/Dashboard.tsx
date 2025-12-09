import React from 'react';
import { Trophy, Target, Flame, Activity } from 'lucide-react';

interface DashboardProps {
  totalLessons: number;
  completedLessons: number;
  streak: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ totalLessons, completedLessons, streak }) => {
  const percentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const xp = completedLessons * 50; 
  const level = Math.floor(xp / 500) + 1;

  const pieStyle = {
    background: `conic-gradient(#22c55e ${percentage}%, #333 ${percentage}% 100%)`
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {/* XP Card */}
      <div className="bg-[#1e1e1e] p-3 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center">
        <div className="mb-1 text-yellow-500">
          <Trophy size={20} />
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Nível {level}</span>
        <span className="text-lg sm:text-xl font-bold text-white">{xp} XP</span>
      </div>

      {/* Streak Card (New) */}
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