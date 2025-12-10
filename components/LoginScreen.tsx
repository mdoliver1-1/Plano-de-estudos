
import React, { useState } from 'react';
import { User, Plus, Trash2, Briefcase } from 'lucide-react';
import { UserProfile, CAREERS } from '../types';

interface LoginScreenProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onCreateUser: (name: string, avatar: string, careerId: string) => void;
  onDeleteUser: (id: string) => void;
}

const AVATARS = ['👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '🚀', '🦁', '🦉', '🧠'];

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onSelectUser, onCreateUser, onDeleteUser }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedCareer, setSelectedCareer] = useState('fiscal');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateUser(newName.trim(), selectedAvatar, selectedCareer);
      setNewName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-green-500/10 rounded-full mb-4">
             <User size={48} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quem está estudando?</h1>
          <p className="text-gray-500 mt-2">Selecione seu perfil para carregar seus dados.</p>
        </div>

        {isCreating ? (
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-2xl p-6 animate-in fade-in zoom-in-95 shadow-2xl">
            <h3 className="text-white font-bold mb-4 text-lg">Novo Perfil</h3>
            <form onSubmit={handleCreate}>
              
              {/* Avatar Selection */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Avatar</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-2xl p-3 rounded-xl transition-all ${selectedAvatar === av ? 'bg-green-600 scale-110 shadow-lg shadow-green-900/50' : 'bg-[#252525] hover:bg-[#333]'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Nome</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Seu nome..."
                  className="w-full bg-[#252525] text-white p-3 rounded-xl border border-gray-700 focus:border-green-500 outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Career Selection */}
              <div className="mb-6">
                 <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Área de Estudos</label>
                 <div className="relative">
                    <select 
                        value={selectedCareer}
                        onChange={(e) => setSelectedCareer(e.target.value)}
                        className="w-full bg-[#252525] text-white p-3 rounded-xl border border-gray-700 focus:border-green-500 outline-none appearance-none font-medium"
                    >
                        {Object.entries(CAREERS).map(([key, data]) => (
                            <option key={key} value={key}>{data.label}</option>
                        ))}
                    </select>
                    <Briefcase size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
                 <p className="text-[10px] text-gray-500 mt-2">Isso define as patentes da sua jornada (Ex: Nível 100 = {CAREERS[selectedCareer].ranks[5]}).</p>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)} 
                  className="flex-1 py-3 text-gray-400 font-medium hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!newName.trim()}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20"
                >
                  Criar Perfil
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {users.map(user => (
              <div key={user.id} className="group relative">
                <button
                  onClick={() => onSelectUser(user)}
                  className="w-full bg-[#1e1e1e] hover:bg-[#252525] border border-gray-800 hover:border-green-500/50 p-6 rounded-2xl flex flex-col items-center transition-all group-hover:-translate-y-1 shadow-lg"
                >
                  <span className="text-4xl mb-3 filter drop-shadow-md">{user.avatar}</span>
                  <span className="text-white font-bold truncate max-w-full">{user.name}</span>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                      {CAREERS[user.careerId || 'fiscal']?.ranks[0] || 'Concurseiro'}
                  </span>
                </button>
                <button 
                  onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); // CRITICAL: Prevent login click
                      onDeleteUser(user.id); 
                  }}
                  className="absolute top-2 right-2 p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1e1e1e]/90 rounded-full z-50 hover:scale-110 shadow-lg"
                  title="Excluir Usuário"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => setIsCreating(true)}
              className="bg-[#1e1e1e] hover:bg-[#252525] border border-gray-800 border-dashed hover:border-gray-600 p-6 rounded-2xl flex flex-col items-center justify-center transition-all text-gray-500 hover:text-white gap-2"
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Plus size={24} />
              </div>
              <span className="font-medium">Novo Usuário</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
