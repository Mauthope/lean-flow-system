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
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { LeanAction } from '@/lib/types';
import {
  askSensei,
  getGeminiApiKey,
  saveGeminiApiKey,
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

  // Histórico da última interação
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [lastResponse, setLastResponse] = useState<SenseiResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Configuração da chave do Gemini
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>('');
  const [savedKeySuccess, setSavedKeySuccess] = useState<boolean>(false);

  // Digitação manual de pergunta
  const [manualInput, setManualInput] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Carrega chave salva
  useEffect(() => {
    setGeminiKeyInput(getGeminiApiKey());
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
        // Reinicia se o usuário ainda quiser ouvir contínuo
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
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Fala a resposta em voz alta com Web Speech Synthesis
   */
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Limpa pontuações estranhas para fala fluida
    const cleanSpeech = text
      .replace(/[*_#`]/g, '')
      .replace(/R\$\s*/g, 'R$ ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.03; // Velocidade agradável e natural
    utterance.pitch = 1.0;

    // Seleciona a melhor voz em Português disponível no sistema
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(
      (v) => v.lang.includes('pt') || v.lang.includes('PT') || v.lang.includes('pt-BR')
    );
    const naturalVoice =
      ptVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Francisca') || v.name.includes('Antonio')) ||
      ptVoices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  /**
   * Processa a pergunta com o motor Gemini / Inteligência Sensei
   */
  const processQuestion = useCallback(
    async (questionText: string) => {
      if (!questionText.trim()) return;

      setIsThinking(true);
      setLastQuestion(questionText);
      setDialogOpen(true);

      try {
        const response = await askSensei({
          question: questionText,
          project,
          currentSlideIndex: currentSlide,
        });

        setLastResponse(response);
        setIsThinking(false);

        // Reproduz a resposta em áudio na sala
        speakText(response.answer);
      } catch (err) {
        console.error('Erro ao consultar Sensei:', err);
        setIsThinking(false);
      }
    },
    [project, currentSlide, speakText]
  );

  /**
   * Trata o áudio capturado pela escuta contínua
   */
  const handleDetectedSpeech = useCallback(
    (transcript: string) => {
      const lower = transcript.toLowerCase();

      // Verifica se chamou a Wake Word "Sensei"
      if (lower.includes('sensei')) {
        // Extrai a pergunta após a palavra Sensei
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
   * Para a voz da IA imediatamente
   */
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  /**
   * Salva o Token do Gemini configurado pelo usuário
   */
  const handleSaveKey = () => {
    saveGeminiApiKey(geminiKeyInput);
    setSavedKeySuccess(true);
    setTimeout(() => {
      setSavedKeySuccess(false);
      setSettingsOpen(false);
    }, 1200);
  };

  /**
   * Envio manual por texto
   */
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const q = manualInput;
    setManualInput('');
    processQuestion(q);
  };

  return (
    <>
      {/* =================================================================== */}
      {/* SENSEI HUD BAR - BOTÃO NO TOPO DA APRESENTAÇÃO                      */}
      {/* =================================================================== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {/* Botão Principal do Sensei */}
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

        {/* Botão de Silenciar Voz da IA (se estiver falando) */}
        {isSpeaking && (
          <button
            type="button"
            onClick={stopSpeaking}
            className="btn btn-sm"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#f87171',
              fontSize: '0.7rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              animation: 'pulse 1s infinite',
            }}
            title="Pausar fala do Sensei"
          >
            <VolumeX size={13} /> Silenciar
          </button>
        )}

        {/* Botão de Configurações do Token Gemini / Ajuda */}
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
          title="Configurar Chave do Gemini ou Enviar Pergunta por Texto"
        >
          <Settings size={13} />
        </button>
      </div>

      {/* =================================================================== */}
      {/* MODAL / LEGENDA FLUTUANTE DA RESPOSTA DO SENSEI                     */}
      {/* =================================================================== */}
      {dialogOpen && (lastResponse || isThinking) && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '780px',
            backgroundColor: 'rgba(9, 14, 26, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.2)',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Header da Legenda */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                }}
              >
                🥋
              </div>
              <span style={{ fontSize: '0.78125rem', fontWeight: 900, color: '#22d3ee', letterSpacing: '0.02em' }}>
                SENSEI LEAN AI
              </span>
              {lastResponse?.source === 'gemini' ? (
                <span style={{ fontSize: '0.625rem', color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                  ✦ Google Gemini
                </span>
              ) : (
                <span style={{ fontSize: '0.625rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                  ⚡ Motor Lean Rápido
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isSpeaking && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#34d399', fontSize: '0.7rem', fontWeight: 700 }}>
                  <Volume2 size={14} className="animate-pulse" /> Falando...
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setDialogOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Pergunta detectada */}
          {lastQuestion && (
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontStyle: 'italic' }}>
              &ldquo;{lastQuestion}&rdquo;
            </div>
          )}

          {/* Resposta do Sensei */}
          {isThinking ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#c084fc', fontSize: '0.84375rem', padding: '0.4rem 0' }}>
              <Sparkles size={16} className="animate-spin" />
              <span>Analisando o projeto e formulando resposta...</span>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.5, fontWeight: 500 }}>
              {lastResponse?.answer}
            </p>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL DE CONFIGURAÇÃO DO TOKEN GEMINI / CHAT MANUAL                 */}
      {/* =================================================================== */}
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
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
              maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🥋</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    Configurar Sensei AI
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Assistente de Apresentação por Voz & Inteligência Gemini
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

            {/* Como funciona o Sensei */}
            <div style={{ backgroundColor: '#040711', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.25rem', fontSize: '0.78125rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              <strong style={{ color: '#22d3ee', display: 'block', marginBottom: '0.25rem' }}>
                🎙️ Como interagir por voz durante os slides:
              </strong>
              1. Deixe o microfone ativado no topo da tela.<br />
              2. Quando alguém fizer uma pergunta, basta iniciar dizendo: <strong style={{ color: '#34d399' }}>&ldquo;Sensei, [sua pergunta]&rdquo;</strong>.<br />
              3. O Sensei consultará todos os dados do projeto e responderá em voz alta!
            </div>

            {/* Campo para Inserir Chave da API do Google Gemini */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Key size={13} color="#fbbf24" />
                Sua Chave de API Google Gemini (Token Particular):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="Cole aqui sua API Key do Google AI Studio..."
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
                  onClick={handleSaveKey}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', fontWeight: 800 }}
                >
                  Salvar Chave
                </button>
              </div>
              <span style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
                💡 Gratuita em <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>aistudio.google.com</a>. Caso vazia, o Sensei usará o motor local inteligente.
              </span>
              {savedKeySuccess && (
                <div style={{ marginTop: '0.4rem', color: '#34d399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={13} /> Chave salva com sucesso no navegador!
                </div>
              )}
            </div>

            {/* Teste manual por digitação */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                💬 Testar pergunta por texto:
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
    </>
  );
}
