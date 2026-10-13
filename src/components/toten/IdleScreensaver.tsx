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
    <div className="w-full max-w-xl mx-auto px-4 z-20 text-center">
      <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Faixa sutil ciano de topo */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4 animate-pulse">
          <Search className="w-3.5 h-3.5" />
          <span>Modo Sentinela Ativo • Procurando Pessoas</span>
        </div>

        {/* Frases rotativas em destaque */}
        <div className="h-20 sm:h-16 flex items-center justify-center">
          <p className="text-lg sm:text-xl font-medium text-slate-200 italic transition-opacity duration-300">
            &ldquo;{IDLE_PHRASES[phraseIndex]}&rdquo;
          </p>
        </div>

        {/* Chamada para ação no quiosque */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs sm:text-sm text-cyan-400">
          <Sparkles className="w-4 h-4 animate-bounce" />
          <span>Fique em frente ao toten ou toque na tela para interagir com o Sensei!</span>
        </div>
      </div>
    </div>
  );
});
