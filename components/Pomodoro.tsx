import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Battery, Settings, Save, StopCircle, Clock } from 'lucide-react';
import { TimerSettings, ActiveSession } from '../types';

interface PomodoroProps {
  initialSettings: TimerSettings;
  onSaveSettings: (settings: TimerSettings) => void;
  activeSession: ActiveSession | null;
  onPauseSession: () => void;
  onStopSession: () => void;
}

export const Pomodoro: React.FC<PomodoroProps> = ({ 
    initialSettings, 
    onSaveSettings,
    activeSession,
    onPauseSession,
    onStopSession
}) => {
  // --- CLASSIC POMODORO STATE ---
  const [settings, setSettings] = useState<TimerSettings>(initialSettings);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState(initialSettings.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<TimerSettings>(initialSettings);
  
  // --- SESSION STOPWATCH STATE ---
  const [elapsedTime, setElapsedTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync settings when plan changes
  useEffect(() => {
    setSettings(initialSettings);
    setEditValues(initialSettings);
    if (!activeSession) {
        setIsActive(false);
        if (mode === 'focus') setTimeLeft(initialSettings.focus * 60);
        if (mode === 'short') setTimeLeft(initialSettings.short * 60);
        if (mode === 'long') setTimeLeft(initialSettings.long * 60);
    }
  }, [initialSettings]);

  // --- EFFECT: ACTIVE SESSION STOPWATCH ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (activeSession) {
        // Reset classic timer if running
        setIsActive(false); 

        const updateElapsed = () => {
            const currentSessionTime = activeSession.isPaused ? 0 : (Date.now() - activeSession.startTime);
            setElapsedTime(activeSession.accumulatedTime + currentSessionTime);
        };

        // Update immediately
        updateElapsed();

        if (!activeSession.isPaused) {
            interval = setInterval(updateElapsed, 1000);
        }
    } else {
        setElapsedTime(0);
    }

    return () => clearInterval(interval);
  }, [activeSession]);


  // --- EFFECT: CLASSIC TIMER ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    // Only run classic timer if no active session
    if (!activeSession && isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (!activeSession && timeLeft === 0 && isActive) {
      setIsActive(false);
      playAlert();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, activeSession]);

  const playAlert = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  };

  // --- HELPERS ---
  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  };

  const setTimerMode = (newMode: 'focus' | 'short' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(settings[newMode] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format HH:MM:SS for stopwatch
  const formatElapsedTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const hh = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
      const mm = minutes.toString().padStart(2, '0');
      const ss = seconds.toString().padStart(2, '0');
      return `${hh}${mm}:${ss}`;
  };

  const saveConfig = () => {
    onSaveSettings(editValues);
    setSettings(editValues);
    setIsEditing(false);
    setIsActive(false);
    setTimeLeft(editValues[mode] * 60);
  };

  // --- RENDER: CONFIG MODE ---
  if (isEditing) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-800 p-4 shadow-2xl z-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Configurar Timer (minutos)</h3>
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white">X</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Foco</label>
              <input 
                type="number" 
                value={editValues.focus} 
                onChange={e => setEditValues({...editValues, focus: parseInt(e.target.value) || 0})}
                className="w-full bg-[#252525] text-white p-2 rounded border border-gray-700 text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Curto</label>
              <input 
                type="number" 
                value={editValues.short} 
                onChange={e => setEditValues({...editValues, short: parseInt(e.target.value) || 0})}
                className="w-full bg-[#252525] text-white p-2 rounded border border-gray-700 text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longo</label>
              <input 
                type="number" 
                value={editValues.long} 
                onChange={e => setEditValues({...editValues, long: parseInt(e.target.value) || 0})}
                className="w-full bg-[#252525] text-white p-2 rounded border border-gray-700 text-center"
              />
            </div>
          </div>
          <button onClick={saveConfig} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <Save size={16} /> Salvar Configuração
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: STOPWATCH MODE (ACTIVE SESSION) ---
  if (activeSession) {
      return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t-2 border-green-500 p-4 shadow-2xl z-50 safe-area-bottom">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                        Estudando
                    </span>
                    <span className="text-white font-bold truncate">{activeSession.title}</span>
                </div>

                <div className="font-mono text-3xl font-bold text-white tracking-widest">
                    {formatElapsedTime(elapsedTime)}
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={onPauseSession} 
                        className={`p-3 rounded-full transition-all ${activeSession.isPaused ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'} text-white shadow-lg`}
                    >
                         {activeSession.isPaused ? <Play size={20} fill="currentColor" className="ml-1"/> : <Pause size={20} fill="currentColor" />}
                    </button>
                    <button 
                        onClick={onStopSession} 
                        className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white transition-colors shadow-lg"
                        title="Finalizar e Salvar"
                    >
                        <StopCircle size={20} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER: CLASSIC MODE ---
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-800 p-4 shadow-2xl z-50 safe-area-bottom">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Modes */}
        <div className="flex gap-2">
          <button onClick={() => setTimerMode('focus')} className={`p-2 rounded-lg transition-colors ${mode === 'focus' ? 'bg-green-500/20 text-green-500' : 'text-gray-500 hover:bg-gray-800'}`}><Brain size={20} /></button>
          <button onClick={() => setTimerMode('short')} className={`p-2 rounded-lg transition-colors ${mode === 'short' ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500 hover:bg-gray-800'}`}><Coffee size={20} /></button>
          <button onClick={() => setTimerMode('long')} className={`p-2 rounded-lg transition-colors ${mode === 'long' ? 'bg-purple-500/20 text-purple-500' : 'text-gray-500 hover:bg-gray-800'}`}><Battery size={20} /></button>
        </div>

        {/* Timer Display */}
        <div className={`font-mono text-3xl font-bold tracking-widest cursor-pointer hover:text-green-400 transition-colors select-none ${isActive ? 'text-white animate-pulse' : 'text-gray-400'}`} onClick={toggleTimer}>
          {formatTime(timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTimer} className={`p-3 rounded-full transition-all ${isActive ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} text-white shadow-lg`}>
            {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={resetTimer} className="p-2 text-gray-500 hover:text-white transition-colors"><RotateCcw size={20} /></button>
          <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-green-500 transition-colors border-l border-gray-700 ml-1"><Settings size={18} /></button>
        </div>
      </div>
    </div>
  );
};