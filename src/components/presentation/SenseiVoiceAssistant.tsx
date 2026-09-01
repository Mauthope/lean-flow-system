'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { LeanAction } from '@/lib/types';
import {
  askSenseiWithVoice,
  getGeminiApiKey,
  SenseiVoiceResponse,
} from '@/services/geminiService';

// =====================================================================
// TIPOS PARA WEB SPEECH API (RECONHECIMENTO DE VOZ)
// =====================================================================
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

// =====================================================================
// COMPONENTE PRINCIPAL
// =====================================================================
interface SenseiVoiceAssistantProps {
  project: LeanAction;
  currentSlide: number;
}

export default function SenseiVoiceAssistant({
  project,
  currentSlide,
}: SenseiVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ===================================================================
  // PARA QUALQUER ÁUDIO EM REPRODUÇÃO
  // ===================================================================
  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // ===================================================================
  // REPRODUÇÃO DE ÁUDIO (GOOGLE CLOUD NEURAL2 MP3 HD)
  // ===================================================================
  const speakText = useCallback(
    async (text: string, audioBase64?: string | null, mimeType?: string | null) => {
      stopSpeaking();

      // 1. Áudio Oficial do Google Cloud Text-to-Speech (Neural2 MP3)
      if (audioBase64) {
        try {
          const type = mimeType || 'audio/mp3';
          const audio = new Audio(`data:${type};base64,${audioBase64}`);
          activeAudioRef.current = audio;

          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            activeAudioRef.current = null;
          };
          audio.onerror = (e) => {
            console.warn('[Sensei] Erro ao tocar MP3 Neural2:', e);
            setIsSpeaking(false);
          };

          await audio.play();
          return;
        } catch (e) {
          console.warn('[Sensei] Falha no player MP3:', e);
        }
      }

      // 2. Fallback de síntese local do navegador somente se não houver áudio
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05;
        utterance.pitch = 0.95;

        const voices = synth.getVoices();
        const ptVoice =
          voices.find((v) => v.lang === 'pt-BR' && (v.name.includes('Luciana') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Natural'))) ||
          voices.find((v) => v.lang.startsWith('pt')) ||
          voices[0];

        if (ptVoice) utterance.voice = ptVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synth.speak(utterance);
      }
    },
    [stopSpeaking]
  );

  // ===================================================================
  // PROCESSA PERGUNTA COM GEMINI + GOOGLE CLOUD NEURAL2
  // ===================================================================
  const processQuestion = useCallback(
    async (questionText: string) => {
      if (!questionText || isThinking) return;

      setIsThinking(true);
      setLiveTranscript('');
      stopSpeaking();

      try {
        const apiKey = getGeminiApiKey();

        const response: SenseiVoiceResponse = await askSenseiWithVoice({
          question: questionText,
          project,
          currentSlideIndex: currentSlide,
          apiKey,
        });

        setIsThinking(false);

        const textToSpeak =
          response.textFallback ||
          'Este projeto Kaizen alcançou ganhos excelentes e sustentáveis para a fábrica.';

        await speakText(textToSpeak, response.audioBase64, response.mimeType);
      } catch (err) {
        console.error('[Sensei] Erro ao processar:', err);
        setIsThinking(false);
      }
    },
    [isThinking, project, currentSlide, speakText, stopSpeaking]
  );

  const processQuestionRef = useRef(processQuestion);
  useEffect(() => {
    processQuestionRef.current = processQuestion;
  }, [processQuestion]);

  // ===================================================================
  // DETECÇÃO DE VOZ E PALAVRA DE ATIVAÇÃO ("Sensei...")
  // ===================================================================
  const handleTranscript = useCallback((raw: string) => {
    if (!raw) return;
    const lower = raw.toLowerCase().trim();

    // Variações fonéticas de "Sensei"
    const wakeWords = [
      'sensei',
      'sencei',
      'sansei',
      'sensi',
      'censei',
      'sem sei',
      'sem-sei',
      'sem sem',
      'mestre',
      'assistente',
    ];

    const hasWakeWord = wakeWords.some((w) => lower.includes(w));

    if (hasWakeWord) {
      let cleaned = raw;
      for (const w of wakeWords) {
        cleaned = cleaned.replace(new RegExp(w, 'gi'), '');
      }
      cleaned = cleaned.replace(/^[,.:\s\-]+/, '').trim();
      const question = cleaned || raw;

      console.log('[Sensei Ativado por Wake Word]:', question);
      processQuestionRef.current(question);
    } else if (raw.split(' ').length >= 3) {
      // Se o usuário falou uma pergunta de 3 ou mais palavras com o microfone ligado, processa
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        console.log('[Sensei Pergunta Direta]:', raw);
        processQuestionRef.current(raw);
      }, 1400);
    }
  }, []);

  // ===================================================================
  // INICIALIZAÇÃO DO RECONHECIMENTO DE VOZ (MICROFONE)
  // ===================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition: SpeechRecognitionInstance = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            // ignora
          }
        } else {
          setIsListening(false);
          setLiveTranscript('');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const currentText = final || interim;
        if (currentText.trim()) {
          setLiveTranscript(currentText.trim());
        }

        if (final.trim()) {
          handleTranscript(final.trim());
        }
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignora
        }
      }
      stopSpeaking();
    };
  }, [handleTranscript, stopSpeaking]);

  // ===================================================================
  // LIGA / DESLIGA O MICROFONE DO SENSEI
  // ===================================================================
  const toggleListening = () => {
    if (!speechSupported) {
      alert('Reconhecimento de voz não suportado neste navegador. Recomendamos usar o Google Chrome ou Microsoft Edge.');
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      setLiveTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('[Sensei] Falha ao parar microfone:', e);
        }
      }
    } else {
      stopSpeaking();
      isListeningRef.current = true;
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('[Sensei] Falha ao iniciar microfone:', e);
        }
      }
    }
  };

  // ===================================================================
  // RENDER
  // ===================================================================
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        {/* ============================================================= */}
        {/* WAVEFORM ANIMADO QUANDO O SENSEI ESTÁ FALANDO                  */}
        {/* ============================================================= */}
        {isSpeaking ? (
          <div
            onClick={stopSpeaking}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1.5px solid #22d3ee',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
              animation: 'pulse 1.5s infinite',
            }}
            title="Sensei falando... Clique para pausar/silenciar áudio"
          >
            <Volume2 size={15} color="#22d3ee" />

            {/* 5 Barras de Onda Sonora Animada */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px', height: '16px' }}>
              {[0.8, 0.6, 0.7, 0.5, 0.75].map((dur, i) => (
                <span
                  key={i}
                  style={{
                    width: '3px',
                    backgroundColor: i % 2 === 0 ? '#22d3ee' : '#38bdf8',
                    borderRadius: '2px',
                    animation: `soundWave ${dur}s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>

            <span style={{ fontSize: '0.725rem', fontWeight: 900, color: '#22d3ee', letterSpacing: '0.02em' }}>
              Sensei Falando
            </span>

            <VolumeX size={12} color="#f87171" style={{ opacity: 0.8 }} />
          </div>
        ) : (
          /* ============================================================= */
          /* BOTÃO PRINCIPAL: OUVINDO / PENSANDO / STANDBY                  */
          /* ============================================================= */
          <button
            type="button"
            onClick={toggleListening}
            className="btn btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: isListening
                ? 'rgba(16, 185, 129, 0.2)'
                : isThinking
                ? 'rgba(139, 92, 246, 0.25)'
                : 'rgba(255, 255, 255, 0.06)',
              border: isListening
                ? '1.5px solid #10b981'
                : isThinking
                ? '1.5px solid #a855f7'
                : '1px solid rgba(255, 255, 255, 0.15)',
              color: isListening
                ? '#34d399'
                : isThinking
                ? '#c084fc'
                : '#cbd5e1',
              boxShadow: isListening
                ? '0 0 15px rgba(168, 85, 247, 0.4)'
                : 'none',
            }}
            title={
              isListening
                ? 'Sensei está ouvindo! Fale "Sensei..." ou faça uma pergunta'
                : 'Ativar Sensei (Assistente de Voz ao Vivo)'
            }
          >
            {isThinking ? (
              <>
                <Sparkles size={14} className="animate-spin" color="#c084fc" />
                <span>Sensei pensando...</span>
              </>
            ) : isListening ? (
              <>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <Mic size={14} color="#34d399" />
                <span>Sensei Ouvindo</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8, color: '#6ee7b7' }}>(Diga &quot;Sensei...&quot;)</span>
              </>
            ) : (
              <>
                <MicOff size={14} color="#94a3b8" />
                <span>Ativar Sensei</span>
              </>
            )}
          </button>
        )}

        {/* Indicador de fala em tempo real quando o microfone está escutando */}
        {isListening && liveTranscript && !isThinking && !isSpeaking && (
          <div
            style={{
              fontSize: '0.7rem',
              color: '#34d399',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '999px',
              padding: '0.2rem 0.6rem',
              maxWidth: '220px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={`Ouvindo: "${liveTranscript}"`}
          >
            🎙️ &quot;{liveTranscript}&quot;
          </div>
        )}
      </div>

      {/* CSS Keyframes */}
      <style jsx global>{`
        @keyframes soundWave {
          0% {
            height: 4px;
          }
          100% {
            height: 16px;
          }
        }
      `}</style>
    </>
  );
}
