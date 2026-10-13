'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        try {
          const voices = window.speechSynthesis.getVoices();
          // Prioriza voz brasileira natural
          const ptBrVoice =
            voices.find((v) => v.lang === 'pt-BR') ||
            voices.find((v) => v.lang.startsWith('pt')) ||
            voices[0] ||
            null;
          selectedVoiceRef.current = ptBrVoice;
        } catch (e) {
          console.warn('[useSpeechSynthesis] Falha ao listar vozes:', e);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const lastSpokenTextRef = useRef<string>('');
  const lastSpokenTimeRef = useRef<number>(0);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || isMuted || typeof window === 'undefined' || !text) return;

      const now = Date.now();
      // Previne repetição idêntica em menos de 2 segundos
      if (lastSpokenTextRef.current === text && now - lastSpokenTimeRef.current < 2000) {
        return;
      }
      lastSpokenTextRef.current = text;
      lastSpokenTimeRef.current = now;

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoiceRef.current) {
          utterance.voice = selectedVoiceRef.current;
        }
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[useSpeechSynthesis] Exceção ao sintetizar fala:', err);
        setIsSpeaking(false);
      }
    },
    [isSupported, isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  return {
    isSupported,
    isMuted,
    isSpeaking,
    speak,
    toggleMute,
  };
}
