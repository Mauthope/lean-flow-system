'use client';

import React, { useState, useEffect } from 'react';
import { IDLE_PHRASES } from '@/lib/totenData';
import { Search, Sparkles } from 'lucide-react';

export const IdleScreensaver = React.memo(function IdleScreensaver() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % IDLE_PHRASES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="toten-idle-card">
      <div className="toten-sentinel-tag">
        <Search size={14} />
        <span>Modo Sentinela Ativo • Procurando Pessoas</span>
      </div>

      <div className="toten-idle-phrase">
        &ldquo;{IDLE_PHRASES[phraseIndex]}&rdquo;
      </div>

      <div className="toten-idle-cta">
        <Sparkles size={16} />
        <span>Aproxime-se do toten ou toque na tela para interagir com o Sensei!</span>
      </div>
    </div>
  );
});
