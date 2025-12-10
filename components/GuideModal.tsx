
import React from 'react';
import { X, Zap, Trophy, Shield, Flame, Book } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Book className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Manual do Usuário</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* XP System */}
          <section>
            <h4 className="flex items-center gap-2 text-yellow-400 font-bold text-lg mb-3">
              <Zap size={20} /> Como ganhar XP?
            </h4>
            <div className="bg-[#121212] rounded-xl p-4 border border-gray-800 space-y-2 text-sm text-gray-300">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span>1 Minuto de Estudo</span>
                <span className="font-bold text-green-400">+1 XP</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2 pt-2">
                <span>Questão Realizada</span>
                <span className="font-bold text-green-400">+20 XP</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Questão Correta (Bônus)</span>
                <span className="font-bold text-green-400">+30 XP</span>
              </div>
            </div>
          </section>

          {/* Ranks */}
          <section>
            <h4 className="flex items-center gap-2 text-purple-400 font-bold text-lg mb-3">
              <Trophy size={20} /> Sistema de Patentes
            </h4>
            <p className="text-gray-400 text-sm mb-3">Sua patente evolui conforme seu Nível aumenta. A dificuldade é exponencial após o nível 50.</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-center">
              <div className="p-2 rounded bg-gray-800 text-gray-400 border border-gray-700">Nv 1-5: Novato</div>
              <div className="p-2 rounded bg-amber-900/30 text-amber-500 border border-amber-900">Nv 6-20: Aprendiz</div>
              <div className="p-2 rounded bg-blue-900/30 text-blue-400 border border-blue-900">Nv 21-49: Estudioso</div>
              <div className="p-2 rounded bg-purple-900/30 text-purple-400 border border-purple-900">Nv 50-74: Especialista</div>
              <div className="p-2 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-900">Nv 75-99: Mestre</div>
              <div className="p-2 rounded bg-cyan-900/30 text-cyan-400 border border-cyan-900 animate-pulse">Nv 100+: Lenda</div>
            </div>
          </section>

          {/* Items & Streak */}
          <section>
            <h4 className="flex items-center gap-2 text-blue-400 font-bold text-lg mb-3">
              <Shield size={20} /> Sobrevivência
            </h4>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400"><Shield size={20} /></div>
                <div>
                  <h5 className="font-bold text-white text-sm">Cristais de Gelo ❄️</h5>
                  <p className="text-xs text-gray-400 mt-1">Ganhos ao subir de nível. Se você esquecer de estudar um dia, um cristal é consumido automaticamente para salvar sua ofensiva.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400"><Flame size={20} /></div>
                <div>
                  <h5 className="font-bold text-white text-sm">Combo de Ofensiva 🔥</h5>
                  <p className="text-xs text-gray-400 mt-1">Ao completar 7 dias seguidos, você entra em "Combo", ganhando 1.5x de XP em todas as atividades.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div className="p-5 border-t border-gray-800 bg-[#151515] rounded-b-2xl">
          <button onClick={onClose} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all">
            Entendi, vamos estudar!
          </button>
        </div>
      </div>
    </div>
  );
};
