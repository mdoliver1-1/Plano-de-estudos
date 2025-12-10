
import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, ZapOff, Volume2, Waves } from 'lucide-react';

export const AmbiencePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'rain' | 'white'>('rain');
  const [volume, setVolume] = useState(0.5);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => stopSound();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      stopSound();
      playSound();
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [mode, volume]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const createNoiseBuffer = () => {
    if (!audioCtxRef.current) return null;
    const bufferSize = audioCtxRef.current.sampleRate * 2; // 2 seconds buffer
    const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // White noise: random between -1 and 1
      const white = Math.random() * 2 - 1;
      // Brownian (Rain-ish) approximation
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate for gain loss
    }
    return buffer;
  };

  // Simple White Noise generator
  const createWhiteNoiseBuffer = () => {
      if (!audioCtxRef.current) return null;
      const bufferSize = audioCtxRef.current.sampleRate * 2;
      const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      return buffer;
  };

  let lastOut = 0;

  const playSound = () => {
    initAudio();
    if (!audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const buffer = mode === 'rain' ? createNoiseBuffer() : createWhiteNoiseBuffer();
    
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    // Optional Filter for Rain to make it deeper
    if (mode === 'rain') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        source.connect(filter);
        filter.connect(gainNode);
    } else {
        // Soften white noise
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        source.connect(filter);
        filter.connect(gainNode);
    }

    gainNode.connect(ctx.destination);
    
    source.start();
    sourceRef.current = source;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);
  };

  const stopSound = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) stopSound();
    else playSound();
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 hidden sm:flex items-center gap-2 bg-[#1e1e1e]/90 backdrop-blur border border-gray-700 p-2 rounded-full shadow-xl">
      <button 
        onClick={togglePlay}
        className={`p-3 rounded-full transition-all ${isPlaying ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        title="Ambiente (Foco)"
      >
        {isPlaying ? <Volume2 size={20} /> : <ZapOff size={20} />}
      </button>

      {isPlaying && (
          <div className="flex items-center gap-2 px-2 animate-in slide-in-from-left-2 fade-in">
              <button onClick={() => setMode('rain')} className={`p-1.5 rounded-lg ${mode === 'rain' ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500'}`}><CloudRain size={16}/></button>
              <button onClick={() => setMode('white')} className={`p-1.5 rounded-lg ${mode === 'white' ? 'text-gray-200 bg-gray-500/10' : 'text-gray-500'}`}><Waves size={16}/></button>
              <input 
                type="range" 
                min="0" max="1" step="0.05" 
                value={volume} 
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
          </div>
      )}
    </div>
  );
};
