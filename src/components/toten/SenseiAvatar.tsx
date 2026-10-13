'use client';

import React, { useMemo } from 'react';
import { SenseiState } from '@/lib/types';

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

  const haloBackground = useMemo(() => {
    switch (state) {
      case 'idle':
        return 'rgba(6, 182, 212, 0.25)';
      case 'celebrating':
        return 'rgba(245, 158, 11, 0.35)';
      case 'idea':
        return 'rgba(250, 204, 21, 0.35)';
      case 'success':
        return 'rgba(52, 211, 153, 0.35)';
      case 'detected':
      case 'interacting':
      default:
        return isSpeaking
          ? 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)'
          : 'rgba(6, 182, 212, 0.2)';
    }
  }, [state, isSpeaking]);

  return (
    <div className={`toten-avatar-box ${size}`}>
      {/* Halo de iluminação de fundo */}
      <div
        className="toten-avatar-halo"
        style={{
          background: haloBackground,
        }}
      />

      {/* Imagem do mascote em pixel art */}
      <img
        src={spriteSrc}
        alt="Sensei Kaizen Mascote"
        className="toten-avatar-img"
        style={{
          transform: state === 'celebrating' ? 'translateY(-8px) scale(1.05)' : isSpeaking ? 'translateY(-4px)' : 'none',
          transition: 'transform 0.25s ease',
        }}
      />

      {/* Indicador de fala em tempo real */}
      {isSpeaking && (
        <div className="toten-speaking-bubble">
          <div className="toten-sound-wave">
            <span className="toten-sound-bar" />
            <span className="toten-sound-bar" />
            <span className="toten-sound-bar" />
          </div>
          <span>Sensei Falando</span>
        </div>
      )}
    </div>
  );
});
