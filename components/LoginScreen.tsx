import React, { useState } from 'react';
import { User, Plus, Trash2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onCreateUser: (name: string, avatar: string) => void;
  onDeleteUser: (id: string) => void;
}

const AVATARS = ['👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '🚀', '🦁', '🦉', '🧠'];

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onSelectUser, onCreateUser, onDeleteUser }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateUser(newName.trim(), selectedAvatar);
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
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-2xl p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-white font-bold mb-4">Novo Perfil</h3>
            <form onSubmit={handleCreate}>
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
              <input 
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Seu nome..."
                className="w-full bg-[#252525] text-white p-3 rounded-xl border border-gray-700 focus:border-green-500 outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)} 
                  className="flex-1 py-3 text-gray-400 font-medium hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!newName.trim()}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl"
                >
                  Criar
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
                  <span className="text-4xl mb-3">{user.avatar}</span>
                  <span className="text-white font-bold truncate max-w-full">{user.name}</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteUser(user.id); }}
                  className="absolute top-2 right-2 p-1.5 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Excluir Usuário"
                >
                  <Trash2 size={14} />
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