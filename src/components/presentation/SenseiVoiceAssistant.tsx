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
  Activity,
} from 'lucide-react';
import { LeanAction } from '@/lib/types';
import {
  askSensei,
  getGeminiApiKey,
  saveGeminiApiKey,
  getGoogleTtsApiKey,
  saveGoogleTtsApiKey,
  getVoicePreference,
  saveVoicePreference,
  synthesizeSpeechGoogleCloud,
  SenseiResponse,
} from '@/services/geminiService';

// Extensão de tipos para Web Speech API
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

interface SenseiVoiceAssistantProps {
  project: LeanAction;
  currentSlide: number;
}

export default function SenseiVoiceAssistant({
  project,
  currentSlide,
}: SenseiVoiceAssistantProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  // Configuração da chave do Gemini e Google Cloud TTS
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>('');
  const [ttsKeyInput, setTtsKeyInput] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('pt-BR-Neural2-B');
  const [savedKeySuccess, setSavedKeySuccess] = useState<boolean>(false);
  const [testingVoice, setTestingVoice] = useState<boolean>(false);

  // Digitação manual de pergunta
  const [manualInput, setManualInput] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Carrega chaves e preferências salvas
  useEffect(() => {
    setGeminiKeyInput(getGeminiApiKey());
    setTtsKeyInput(getGoogleTtsApiKey());
    setSelectedVoice(getVoicePreference());
  }, []);

  // Inicializa suporte a Web Speech API
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
            // Ignora erro de reinicialização rápida
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'network') {
          return;
        }
        console.warn('SpeechRecognition erro:', event.error);
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
      console.warn('Erro ao instanciar SpeechRecognition:', e);
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
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Para qualquer áudio ou voz em reprodução
   */
  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  /**
   * Fala a resposta em voz alta utilizando Google Cloud Text-to-Speech (Neural2)
   * com fallback transparente para a voz nativa do navegador
   */
  const speakText = useCallback(
    async (text: string) => {
      stopSpeaking();

      // 1. Tenta sintetizar com Google Cloud Text-to-Speech (Neural2 de estúdio)
      try {
        const audioBase64 = await synthesizeSpeechGoogleCloud({
          text,
          voiceName: selectedVoice,
        });

        if (audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
          activeAudioRef.current = audio;

          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            activeAudioRef.current = null;
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            activeAudioRef.current = null;
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Falha no Google Cloud TTS, usando sintetizador nativo:', err);
      }

      // 2. Fallback para sintetizador nativo caso a chave do Google Cloud não esteja configurada
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const cleanSpeech = text
          .replace(/[*_#`]/g, '')
          .replace(/R\$\s*/g, 'R$ ')
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.03;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const ptVoices = voices.filter(
          (v) => v.lang.includes('pt') || v.lang.includes('PT') || v.lang.includes('pt-BR')
        );
        const naturalVoice =
          ptVoices.find(
            (v) =>
              v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Francisca') ||
              v.name.includes('Antonio')
          ) || ptVoices[0];

        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    },
    [selectedVoice, stopSpeaking]
  );

  /**
   * Processa a pergunta com o motor Gemini / Inteligência Sensei
   */
  const processQuestion = useCallback(
    async (questionText: string) => {
      if (!questionText.trim()) return;

      setIsThinking(true);

      try {
        const response: SenseiResponse = await askSensei({
          question: questionText,
          project,
          currentSlideIndex: currentSlide,
        });

        setIsThinking(false);

        // Reproduz a resposta puramente em áudio de alta fidelidade
        await speakText(response.answer);
      } catch (err) {
        console.error('Erro ao consultar Sensei:', err);
        setIsThinking(false);
      }
    },
    [project, currentSlide, speakText]
  );

  /**
   * Trata o áudio capturado pela escuta contínua com wake word "Sensei"
   */
  const handleDetectedSpeech = useCallback(
    (transcript: string) => {
      const lower = transcript.toLowerCase();

      // Verifica se chamou a Wake Word "Sensei"
      if (lower.includes('sensei')) {
        const parts = transcript.split(/sensei/i);
        const rawQuestion = parts[parts.length - 1]?.replace(/^[,.:\s\-]+/, '').trim();
        const effectiveQuestion = rawQuestion || transcript;

        processQuestion(effectiveQuestion);
      }
    },
    [processQuestion]
  );

  /**
   * Alterna estado da escuta contínua do microfone
   */
  const toggleListening = () => {
    if (!speechSupported) {
      setSettingsOpen(true);
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Falha ao iniciar reconhecimento:', e);
        }
      }
    }
  };

  /**
   * Salva as configurações de chave e voz
   */
  const handleSaveSettings = () => {
    saveGeminiApiKey(geminiKeyInput);
    saveGoogleTtsApiKey(ttsKeyInput);
    saveVoicePreference(selectedVoice);
    setSavedKeySuccess(true);
    setTimeout(() => {
      setSavedKeySuccess(false);
      setSettingsOpen(false);
    }, 1000);
  };

  /**
   * Teste de áudio imediato com a voz selecionada
   */
  const handleTestVoice = async () => {
    setTestingVoice(true);
    await speakText('Olá! Eu sou o Sensei, seu assistente de inteligência artificial na apresentação.');
    setTestingVoice(false);
  };

  /**
   * Envio manual por texto
   */
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const q = manualInput;
    setManualInput('');
    setSettingsOpen(false);
    processQuestion(q);
  };

  return (
    <>
      {/* =================================================================== */}
      {/* SENSEI HUD BAR - COM ANIMAÇÃO DINÂMICA DE ONDAS DE VOZ              */}
      {/* =================================================================== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        {/* Animação Visual de Onda Sonora quando o Sensei está FALANDO */}
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
            title="Sensei falando... Clique para pausar áudio"
          >
            {/* Ícone de Som */}
            <Volume2 size={15} color="#22d3ee" />

            {/* 4 Barras de Onda Sonora Animada (Waveform) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px', height: '14px' }}>
              <span
                style={{
                  width: '3px',
                  height: '14px',
                  backgroundColor: '#22d3ee',
                  borderRadius: '2px',
                  animation: 'soundWave 0.8s ease-in-out infinite alternate',
                }}
              />
              <span
                style={{
                  width: '3px',
                  height: '8px',
                  backgroundColor: '#38bdf8',
                  borderRadius: '2px',
                  animation: 'soundWave 0.6s ease-in-out 0.2s infinite alternate',
                }}
              />
              <span
                style={{
                  width: '3px',
                  height: '16px',
                  backgroundColor: '#22d3ee',
                  borderRadius: '2px',
                  animation: 'soundWave 0.7s ease-in-out 0.4s infinite alternate',
                }}
              />
              <span
                style={{
                  width: '3px',
                  height: '10px',
                  backgroundColor: '#38bdf8',
                  borderRadius: '2px',
                  animation: 'soundWave 0.5s ease-in-out 0.1s infinite alternate',
                }}
              />
            </div>

            <span style={{ fontSize: '0.725rem', fontWeight: 900, color: '#22d3ee', letterSpacing: '0.02em' }}>
              Sensei Falando
            </span>

            <VolumeX size={12} color="#f87171" style={{ marginLeft: '0.2rem', opacity: 0.8 }} />
          </div>
        ) : (
          /* Botão Padrão do Sensei (Ouvindo / Standby / Pensando) */
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
              color: isListening ? '#34d399' : isThinking ? '#c084fc' : '#cbd5e1',
              boxShadow: isListening
                ? '0 0 15px rgba(16, 185, 129, 0.4)'
                : isThinking
                ? '0 0 15px rgba(168, 85, 247, 0.4)'
                : 'none',
            }}
            title={
              isListening
                ? 'Sensei está ouvindo a sala! Fale "Sensei..." ou faça uma pergunta'
                : 'Clique para ativar o Sensei (Assistente de Voz ao Vivo)'
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
                <span>Ativar Sensei (Voz)</span>
              </>
            )}
          </button>
        )}

        {/* Botão de Configurações do Token / Voz / Testes */}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
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
          title="Configurar Vozes do Google Cloud, Chaves ou Enviar Pergunta por Texto"
        >
          <Settings size={13} />
        </button>
      </div>

      {/* =================================================================== */}
      {/* MODAL DE CONFIGURAÇÃO DE VOZ GOOGLE CLOUD TTS & CHAVES              */}
      {/* =================================================================== */}
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
                    Configurar Sensei AI
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Google Cloud Text-to-Speech (Neural2) & Motor Gemini
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

            {/* Seleção de Voz do Google Cloud TTS */}
            <div style={{ marginBottom: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Volume2 size={13} color="#22d3ee" />
                  Voz do Sensei (Google Cloud Neural2):
                </label>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={testingVoice}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    color: '#22d3ee',
                    fontSize: '0.675rem',
                    padding: '0.15rem 0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Play size={10} /> Testar Voz
                </button>
              </div>

              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="input input-sm"
                style={{
                  width: '100%',
                  backgroundColor: '#040711',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.78125rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                }}
              >
                <option value="pt-BR-Neural2-B">🎙️ pt-BR-Neural2-B (Masculina Executiva - Estúdio / Natural)</option>
                <option value="pt-BR-Neural2-A">🎙️ pt-BR-Neural2-A (Feminina Executiva - Clara / Natural)</option>
                <option value="pt-BR-Neural2-C">🎙️ pt-BR-Neural2-C (Feminina Suave - Natural)</option>
                <option value="pt-BR-Wavenet-B">🎙️ pt-BR-Wavenet-B (Masculina WaveNet)</option>
              </select>
            </div>

            {/* Campo da Chave de API Google (Gemini & Cloud TTS) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Key size={13} color="#fbbf24" />
                Sua Chave de API Google (Token Particular):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => {
                    setGeminiKeyInput(e.target.value);
                    setTtsKeyInput(e.target.value);
                  }}
                  placeholder="Cole aqui sua API Key do Google..."
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
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', fontWeight: 800 }}
                >
                  Salvar
                </button>
              </div>
              <span style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
                💡 A chave é salva de forma segura e privada diretamente no seu navegador.
              </span>
              {savedKeySuccess && (
                <div style={{ marginTop: '0.4rem', color: '#34d399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={13} /> Configurações e voz salvas com sucesso!
                </div>
              )}
            </div>

            {/* Teste manual por digitação */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                💬 Testar pergunta manualmente (o Sensei responderá por áudio):
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

      {/* CSS Keyframes inline para animações sutis de som */}
      <style jsx global>{`
        @keyframes soundWave {
          0% {
            height: 4px;
          }
          100% {
            height: 15px;
          }
        }
      `}</style>
    </>
  );
}
