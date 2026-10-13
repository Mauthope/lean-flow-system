'use client';

import React, { useMemo } from 'react';
import { SenseiState } from '@/lib/types';
import { Sparkles, Lightbulb } from 'lucide-react';

interface SenseiAvatarProps {
  state: SenseiState;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SenseiAvatar = React.memo(function SenseiAvatar({
  state,
  isSpeaking = false,
  size = 'lg',
}: SenseiAvatarProps) {
  // Define o sprite do Sensei de acordo com o estado emocional/operacional
  const spriteSrc = useMemo(() => {
    switch (state) {
      case 'idle':
        return '/sprites/sensei-searching.png';
      case 'celebrating':
        return '/sprites/sensei-celebrating.png';
      case 'idea':
        return '/sprites/sensei-idea.png';
      case 'success':
        return '/sprites/sensei-success.png';
      case 'detected':
      case 'interacting':
      default:
        return '/sprites/sensei-speaking.png';
    }
  }, [state]);

  // Aura de brilho em volta do mascote (Obsidian Navy com Ciano/Âmbar/Esmeralda)
  const auraClass = useMemo(() => {
    switch (state) {
      case 'idle':
        return 'bg-cyan-500/20 scale-95 shadow-[0_0_60px_rgba(6,182,212,0.3)]';
      case 'celebrating':
        return 'bg-amber-400/30 scale-125 shadow-[0_0_80px_rgba(245,158,11,0.4)] animate-pulse';
      case 'idea':
        return 'bg-yellow-400/30 scale-110 shadow-[0_0_80px_rgba(250,204,21,0.4)] animate-pulse';
      case 'success':
        return 'bg-emerald-400/30 scale-115 shadow-[0_0_70px_rgba(52,211,153,0.35)]';
      case 'detected':
      case 'interacting':
      default:
        return isSpeaking
          ? 'bg-gradient-to-tr from-cyan-500/30 via-blue-500/25 to-purple-500/30 scale-110 animate-pulse'
          : 'bg-cyan-500/20 scale-105';
    }
  }, [state, isSpeaking]);

  // Dimensões responsivas do mascote
  const sizeClass = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'w-32 h-36 sm:w-40 sm:h-44 md:w-44 md:h-48';
      case 'md':
        return 'w-44 h-52 sm:w-56 sm:h-64 md:w-64 md:h-72';
      case 'xl':
        return 'w-64 h-72 sm:w-80 sm:h-88 md:w-92 md:h-96 lg:w-[380px] lg:h-[400px]';
      case 'lg':
      default:
        return 'w-56 h-64 sm:w-68 sm:h-76 md:w-76 md:h-84';
    }
  }, [size]);

  // Animação de flutuação via CSS
  const motionStyle = useMemo(() => {
    if (state === 'celebrating') {
      return 'animate-bounce';
    }
    if (isSpeaking) {
      return 'animate-pulse';
    }
    return '';
  }, [state, isSpeaking]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none transition-all duration-300 ${sizeClass}`}
    >
      {/* Halo de iluminação de fundo */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${auraClass}`}
      />

      {/* Container animado do sprite */}
      <div className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-300 ${motionStyle}`}>
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={spriteSrc}
            alt="Sensei Kaizen Mascote"
            className="w-full h-full object-contain filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.65)] transition-opacity duration-300"
            style={{
              imageRendering: 'pixelated',
            }}
          />

          {/* Indicador de fala em tempo real */}
          {isSpeaking && (
            <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400 text-[11px] font-bold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center gap-1.5 backdrop-blur-md animate-pulse">
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s] h-2" />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s] h-3" />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2.5" />
              </span>
              <span>Sensei Falando</span>
            </div>
          )}

          {/* Efeito visual quando em estado de Ideia */}
          {state === 'idea' && (
            <div className="absolute top-2 w-16 h-16 rounded-full bg-yellow-400/20 blur-xl animate-ping pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
});
