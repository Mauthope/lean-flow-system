'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Settings,
  X,
  Send,
  Key,
  CheckCircle2,
  Play,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { LeanAction } from '@/lib/types';
import {
  askSenseiWithVoice,
  getGeminiApiKey,
  saveGeminiApiKey,
  validateGeminiApiKey,
  getVoicePreference,
  saveVoicePreference,
  SENSEI_PROFILE,
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
  const [hasApiKey, setHasApiKey] = useState(true);

  // Configuração
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>(SENSEI_PROFILE.defaultVoice);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<{
    valid?: boolean;
    message?: string;
  } | null>(null);

  // Digitação manual de pergunta
  const [manualInput, setManualInput] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Carrega chave e preferências salvas na montagem
  useEffect(() => {
    const key = getGeminiApiKey();
    setGeminiKeyInput(key);
    setHasApiKey(Boolean(key && key.trim().length > 10));
    setSelectedVoice(getVoicePreference());

    // Pré-carrega vozes do navegador
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // ===================================================================
  // INICIALIZAÇÃO DO WEB SPEECH RECOGNITION (apenas escuta do microfone)
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
      recognition.interimResults = false;
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
            // Ignora reinicialização rápida
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'network') return;
        console.warn('[Sensei] Reconhecimento de voz erro:', event.error);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        if (!lastResult || !lastResult.isFinal) return;

        const transcript = lastResult[0].transcript.trim();
        if (!transcript) return;

        handleDetectedSpeech(transcript);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('[Sensei] Erro ao instanciar SpeechRecognition:', e);
      setSpeechSupported(false);
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // cleanup
        }
      }
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ===================================================================
  // PARA QUALQUER ÁUDIO OU SÍNTESE EM REPRODUÇÃO
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
  // REPRODUZ ÁUDIO GERADO PELO GEMINI
  // ===================================================================
  const playAudioBase64 = useCallback(
    (base64: string, mimeType: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        stopSpeaking();

        try {
          const audio = new Audio(`data:${mimeType};base64,${base64}`);
          activeAudioRef.current = audio;

          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            activeAudioRef.current = null;
            resolve();
          };
          audio.onerror = (err) => {
            console.error('[Sensei] Erro ao decodificar áudio:', err);
            setIsSpeaking(false);
            activeAudioRef.current = null;
            reject(err);
          };

          audio.play().catch((err) => {
            console.error('[Sensei] Erro ao iniciar reprodução:', err);
            setIsSpeaking(false);
            reject(err);
          });
        } catch (e) {
          reject(e);
        }
      });
    },
    [stopSpeaking]
  );

  // ===================================================================
  // REPRODUÇÃO DE VOZ INTELIGENTE E NATURAL (Áudio Gemini + Voz Natural)
  // ===================================================================
  const speakText = useCallback(
    async (text: string, audioBase64?: string | null, mimeType?: string | null) => {
      stopSpeaking();

      // 1. Se houver áudio direto do Gemini, reproduz
      if (audioBase64 && mimeType) {
        try {
          await playAudioBase64(audioBase64, mimeType);
          return;
        } catch (e) {
          console.warn('[Sensei] Fallback para sintetizador de voz natural:', e);
        }
      }

      // 2. Reproduz com a voz mais natural do sistema (Francisca / Natural / Google)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const cleanSpeech = text
          .replace(/[*_#`]/g, '')
          .replace(/R\$\s*/g, 'R$ ')
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.02;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const ptVoices = voices.filter(
          (v) => v.lang.includes('pt') || v.lang.includes('PT') || v.lang.includes('pt-BR')
        );

        // Seleciona a voz com melhor qualidade e naturalidade de estúdio
        const naturalVoice =
          ptVoices.find(
            (v) =>
              v.name.includes('Francisca') ||
              v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Maria') ||
              v.name.includes('Luciana')
          ) ||
          ptVoices.find((v) => !v.name.includes('Desktop')) ||
          ptVoices[0];

        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    },
    [playAudioBase64, stopSpeaking]
  );

  // ===================================================================
  // PROCESSA A PERGUNTA COM GEMINI
  // ===================================================================
  const processQuestion = useCallback(
    async (questionText: string) => {
      if (!questionText.trim()) return;

      const key = getGeminiApiKey();
      if (!key) {
        setHasApiKey(false);
        setSettingsOpen(true);
        return;
      }

      setIsThinking(true);

      try {
        const response: SenseiVoiceResponse = await askSenseiWithVoice({
          question: questionText,
          project,
          currentSlideIndex: currentSlide,
        });

        setIsThinking(false);

        if (response.source === 'no_key') {
          setHasApiKey(false);
          setSettingsOpen(true);
          return;
        }

        // Fala a resposta gerada pelo Gemini
        const textToSpeak =
          response.textFallback ||
          'Este projeto foi executado com sucesso e alcançou os objetivos estabelecidos.';
        await speakText(textToSpeak, response.audioBase64, response.mimeType);
      } catch (err) {
        console.error('[Sensei] Erro ao consultar Gemini:', err);
        setIsThinking(false);
      }
    },
    [project, currentSlide, speakText]
  );

  // ===================================================================
  // DETECÇÃO DE WAKE WORD "SENSEI"
  // ===================================================================
  const handleDetectedSpeech = useCallback(
    (transcript: string) => {
      const lower = transcript.toLowerCase();

      if (lower.includes('sensei')) {
        const parts = transcript.split(/sensei/i);
        const rawQuestion = parts[parts.length - 1]?.replace(/^[,.:\s\-]+/, '').trim();
        const effectiveQuestion = rawQuestion || transcript;
        processQuestion(effectiveQuestion);
      }
    },
    [processQuestion]
  );

  // ===================================================================
  // TOGGLE ESCUTA DO MICROFONE
  // ===================================================================
  const toggleListening = () => {
    const key = getGeminiApiKey();
    if (!key) {
      setHasApiKey(false);
      setSettingsOpen(true);
      return;
    }

    if (!speechSupported) {
      setSettingsOpen(true);
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {
          console.warn('[Sensei] Falha ao iniciar microfone:', e);
        }
      }
    }
  };

  // ===================================================================
  // VALIDAR E SALVAR CONFIGURAÇÕES
  // ===================================================================
  const handleSaveSettings = async () => {
    const trimmedKey = geminiKeyInput.trim();
    if (!trimmedKey) {
      saveGeminiApiKey('');
      saveVoicePreference(selectedVoice);
      setHasApiKey(false);
      setKeyValidationStatus({ valid: false, message: 'Chave removida.' });
      return;
    }

    setIsValidatingKey(true);
    setKeyValidationStatus(null);

    const check = await validateGeminiApiKey(trimmedKey);
    setIsValidatingKey(false);

    if (check.valid) {
      saveGeminiApiKey(trimmedKey);
      saveVoicePreference(selectedVoice);
      setHasApiKey(true);
      setKeyValidationStatus({ valid: true, message: 'Chave do Gemini validada e conectada com sucesso!' });
      setTimeout(() => {
        setSettingsOpen(false);
        setKeyValidationStatus(null);
      }, 1200);
    } else {
      setKeyValidationStatus({ valid: false, message: check.error || 'Chave inválida. Verifique sua chave no Google AI Studio.' });
    }
  };

  // ===================================================================
  // TESTE RÁPIDO DE VOZ COM GEMINI
  // ===================================================================
  const handleTestVoice = async () => {
    const key = geminiKeyInput.trim() || getGeminiApiKey();
    if (!key) {
      setHasApiKey(false);
      setKeyValidationStatus({ valid: false, message: 'Por favor, cole sua chave do Gemini primeiro.' });
      return;
    }

    saveGeminiApiKey(key);
    saveVoicePreference(selectedVoice);
    setHasApiKey(true);

    setIsThinking(true);
    setKeyValidationStatus({ valid: true, message: 'Sensei gerando resposta com Gemini...' });

    try {
      const response = await askSenseiWithVoice({
        question: 'Apresente-se brevemente como o Sensei, co-apresentador desta reunião.',
        project,
        apiKey: key,
      });
      setIsThinking(false);

      const textToSpeak =
        response.textFallback ||
        'Olá! Eu sou o Sensei, seu co-apresentador de inteligência artificial para este projeto Lean.';

      setKeyValidationStatus({ valid: true, message: 'Reproduzindo voz do Sensei!' });
      await speakText(textToSpeak, response.audioBase64, response.mimeType);
    } catch (e: any) {
      setIsThinking(false);
      setKeyValidationStatus({ valid: false, message: e?.message || 'Erro ao gerar teste de voz.' });
    }
  };

  // ===================================================================
  // ENVIO MANUAL POR TEXTO
  // ===================================================================
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const q = manualInput;
    setManualInput('');
    setSettingsOpen(false);
    processQuestion(q);
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
            title="Sensei falando... Clique para silenciar"
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
                : !hasApiKey
                ? 'rgba(251, 191, 36, 0.15)'
                : 'rgba(255, 255, 255, 0.06)',
              border: isListening
                ? '1.5px solid #10b981'
                : isThinking
                ? '1.5px solid #a855f7'
                : !hasApiKey
                ? '1.5px solid #fbbf24'
                : '1px solid rgba(255, 255, 255, 0.15)',
              color: isListening
                ? '#34d399'
                : isThinking
                ? '#c084fc'
                : !hasApiKey
                ? '#fbbf24'
                : '#cbd5e1',
              boxShadow: isListening
                ? '0 0 15px rgba(16, 185, 129, 0.4)'
                : isThinking
                ? '0 0 15px rgba(168, 85, 247, 0.4)'
                : 'none',
            }}
            title={
              isListening
                ? 'Sensei está ouvindo! Fale "Sensei..."'
                : !hasApiKey
                ? 'Clique para configurar sua chave do Gemini'
                : 'Ativar Sensei (Assistente de Voz ao Vivo)'
            }
          >
            {isThinking ? (
              <>
                <Sparkles size={14} className="animate-spin" color="#c084fc" />
                <span>Sensei pensando...</span>
              </>
            ) : !hasApiKey && !isListening ? (
              <>
                <AlertTriangle size={14} color="#fbbf24" />
                <span>Configurar Chave</span>
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

        {/* Botão de Configurações */}
        <button
          type="button"
          onClick={() => {
            setKeyValidationStatus(null);
            setSettingsOpen(true);
          }}
          className="btn btn-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            padding: '0.35rem 0.55rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Configurar Sensei: Voz, Chave do Gemini e Testes"
        >
          <Settings size={13} />
        </button>
      </div>

      {/* ================================================================= */}
      {/* MODAL DE CONFIGURAÇÃO DO SENSEI                                    */}
      {/* ================================================================= */}
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#090e1a',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: '20px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '540px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🥋</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    Perfil do Sensei
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Google Gemini AI + Voz Natural de Estúdio
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ color: '#94a3b8', padding: '0.25rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chave de API do Gemini */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Key size={13} color="#fbbf24" />
                Sua Chave de API do Google Gemini:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => {
                    setGeminiKeyInput(e.target.value);
                    setKeyValidationStatus(null);
                  }}
                  placeholder="Cole sua chave gerada no Google AI Studio (AIzaSy...)"
                  className="input input-sm"
                  style={{
                    flex: 1,
                    backgroundColor: '#040711',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.78125rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isValidatingKey}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {isValidatingKey ? (
                    <><Loader2 size={12} className="animate-spin" /> Validando...</>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>

              {/* Status de validação da chave */}
              {keyValidationStatus && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.725rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: keyValidationStatus.valid
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${keyValidationStatus.valid ? '#10b981' : '#ef4444'}`,
                    color: keyValidationStatus.valid ? '#34d399' : '#f87171',
                  }}
                >
                  {keyValidationStatus.valid ? (
                    <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                  ) : (
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  )}
                  <span>{keyValidationStatus.message}</span>
                </div>
              )}

              <span style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
                💡 Obtenha gratuitamente em <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>aistudio.google.com/apikey</a>. Salva privativamente no navegador.
              </span>
            </div>

            {/* Teste imediato de voz */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Volume2 size={13} color="#22d3ee" />
                  Testar Voz do Sensei:
                </label>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={isThinking || isSpeaking || isValidatingKey}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    color: '#22d3ee',
                    fontSize: '0.725rem',
                    padding: '0.25rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 800,
                    opacity: isThinking || isSpeaking ? 0.5 : 1,
                  }}
                >
                  {isThinking ? (
                    <><Sparkles size={12} className="animate-spin" /> Pensando com Gemini...</>
                  ) : isSpeaking ? (
                    <><VolumeX size={12} color="#f87171" /> Silenciar</>
                  ) : (
                    <><Play size={12} /> Testar Voz Agora</>
                  )}
                </button>
              </div>
            </div>

            {/* Teste manual por digitação */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                💬 Fazer pergunta digitando:
              </label>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Ex: Qual foi a causa raiz e o payback do projeto?"
                  className="input input-sm"
                  style={{
                    flex: 1,
                    backgroundColor: '#040711',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.78125rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                  }}
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim() || isThinking}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Send size={13} /> Perguntar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
