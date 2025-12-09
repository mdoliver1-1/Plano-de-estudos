import React from 'react';
import { Subject } from '../types';
import { Clock, Target, CheckCircle2 } from 'lucide-react';

interface AnalyticsProps {
  subjects: Subject[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ subjects }) => {
  // --- AGGREGATION LOGIC ---
  const data = subjects.map(subject => {
    let totalTime = 0;
    let totalQ = 0;
    let correctQ = 0;
    
    subject.lessons.forEach(l => {
      if (l.metrics) {
        totalTime += l.metrics.studyTime || 0;
        totalQ += l.metrics.questionsTotal || 0;
        correctQ += l.metrics.questionsCorrect || 0;
      }
    });

    return {
      name: subject.name,
      totalTime,
      totalQ,
      correctQ,
      accuracy: totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0
    };
  }).filter(d => d.totalTime > 0 || d.totalQ > 0); // Only show active subjects

  const globalTotalTime = data.reduce((acc, curr) => acc + curr.totalTime, 0);
  const globalTotalQ = data.reduce((acc, curr) => acc + curr.totalQ, 0);
  const globalCorrectQ = data.reduce((acc, curr) => acc + curr.correctQ, 0);
  const globalAccuracy = globalTotalQ > 0 ? Math.round((globalCorrectQ / globalTotalQ) * 100) : 0;

  // --- SVG PIE CHART LOGIC ---
  let cumulativePercent = 0;
  const pieData = data.filter(d => d.totalTime > 0).map((d) => {
    const percent = d.totalTime / globalTotalTime;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return { ...d, percent, start };
  });

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Colors for charts
  const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#f97316', '#06b6d4'];

  const hours = Math.floor(globalTotalTime / 60);
  const minutes = Math.round(globalTotalTime % 60);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Big Numbers */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
           <div className="bg-blue-500/10 p-2 rounded-full mb-2"><Clock size={16} className="text-blue-500"/></div>
           <span className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">
             {hours}h <span className="text-gray-400 text-lg">{minutes}m</span>
           </span>
           <span className="text-[10px] text-gray-500 uppercase font-bold">Tempo Total</span>
        </div>
        <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
           <div className="bg-purple-500/10 p-2 rounded-full mb-2"><Target size={16} className="text-purple-500"/></div>
           <span className="text-2xl font-bold text-white">{globalTotalQ}</span>
           <span className="text-[10px] text-gray-500 uppercase font-bold">Questões</span>
        </div>
        <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
           <div className="bg-green-500/10 p-2 rounded-full mb-2"><CheckCircle2 size={16} className="text-green-500"/></div>
           <span className="text-2xl font-bold text-white">{globalAccuracy}%</span>
           <span className="text-[10px] text-gray-500 uppercase font-bold">Precisão</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-800 rounded-xl opacity-50">
           <p className="text-gray-400">Sem dados suficientes para gerar gráficos.</p>
           <p className="text-sm text-gray-600 mt-1">Registre tempo e questões nas aulas.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Chart 1: Time Distribution (Donut) */}
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Tempo por Matéria</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full">
                  {pieData.map((slice, i) => {
                    const [startX, startY] = getCoordinatesForPercent(slice.start);
                    const [endX, endY] = getCoordinatesForPercent(slice.start + slice.percent);
                    const largeArcFlag = slice.percent > 0.5 ? 1 : 0;
                    const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
                    return (
                      <path key={slice.name} d={pathData} fill={COLORS[i % COLORS.length]} stroke="#1e1e1e" strokeWidth="0.05" />
                    );
                  })}
                  {/* Donut Hole */}
                  <circle cx="0" cy="0" r="0.6" fill="#1e1e1e" />
                </svg>
              </div>
              <div className="flex-1 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-gray-300 truncate max-w-[80px]">{d.name}</span>
                    </div>
                    <span className="text-gray-500 font-mono">{Math.round(d.percent * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Accuracy Bars */}
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Precisão por Matéria</h3>
            <div className="space-y-4">
              {data.filter(d => d.totalQ > 0).map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-bold">{d.name}</span>
                    <span className={`${d.accuracy >= 80 ? 'text-green-400' : d.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {d.accuracy}% <span className="text-gray-600">({d.correctQ}/{d.totalQ})</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${d.accuracy >= 80 ? 'bg-green-500' : d.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${d.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {data.filter(d => d.totalQ > 0).length === 0 && (
                <p className="text-xs text-gray-600 italic">Nenhuma questão registrada ainda.</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};