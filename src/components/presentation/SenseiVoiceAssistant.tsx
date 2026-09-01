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
  ExternalLink,
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
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // Configuração
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>(SENSEI_PROFILE.defaultVoice);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<{
    valid?: boolean;
    ttsEnabled?: boolean;
    message?: string;
    showTtsLink?: boolean;
    showGenerativeLink?: boolean;
  } | null>(null);

  // Digitação manual de pergunta
  const [manualInput, setManualInput] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega chave e preferências salvas na montagem
  useEffect(() => {
    const key = getGeminiApiKey();
    setGeminiKeyInput(key);
    setHasApiKey(Boolean(key && key.trim().length > 10));
    setSelectedVoice(getVoicePreference());
  }, []);

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

      // 2. Fallback somente se não houver áudio gerado
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const cleanSpeech = text
          .replace(/[*_#`]/g, '')
          .replace(/R\$\s*/g, 'R$ ')
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const ptVoices = voices.filter(
          (v) => v.lang.includes('pt') || v.lang.includes('PT') || v.lang.includes('pt-BR')
        );

        const naturalVoice =
          ptVoices.find(
            (v) =>
              v.name.includes('Francisca') ||
              v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Maria') ||
              v.name.includes('Luciana')
          ) || ptVoices[0];

        if (naturalVoice) utterance.voice = naturalVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    },
    [stopSpeaking]
  );

  // ===================================================================
  // PROCESSA A PERGUNTA COM O MOTOR GEMINI + GOOGLE CLOUD NEURAL2
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
      setLiveTranscript('');

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

  // Ref dinâmico para evitar closures desatualizadas no evento onresult
  const processQuestionRef = useRef(processQuestion);
  useEffect(() => {
    processQuestionRef.current = processQuestion;
  }, [processQuestion]);

  // ===================================================================
  // TRATAMENTO DA FALA CAPTURADA (WAKE WORD "SENSEI" E PERGUNTAS DIRETAS)
  // ===================================================================
  const handleDetectedSpeech = useCallback((transcript: string) => {
    const raw = transcript.trim();
    if (!raw) return;

    setLiveTranscript(raw);

    const lower = raw.toLowerCase();

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
        if (event.error === 'no-speech' || event.error === 'network') return;
        console.warn('[Sensei] Microfone aviso:', event.error);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const effective = finalTranscript.trim() || interimTranscript.trim();
        if (effective) {
          handleDetectedSpeech(effective);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('[Sensei] Erro SpeechRecognition:', e);
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
  }, [handleDetectedSpeech]);

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
      setLiveTranscript('');
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

    if (check.valid && check.ttsEnabled) {
      saveGeminiApiKey(trimmedKey);
      saveVoicePreference(selectedVoice);
      setHasApiKey(true);
      setKeyValidationStatus({
        valid: true,
        ttsEnabled: true,
        message: 'Chave 100% Conectada! Gemini + Google Cloud Neural2 ativos com sucesso.',
      });
      setTimeout(() => {
        setSettingsOpen(false);
        setKeyValidationStatus(null);
      }, 1400);
    } else if (check.needsGenerativeApiEnable) {
      saveGeminiApiKey(trimmedKey);
      saveVoicePreference(selectedVoice);
      setHasApiKey(true);
      setKeyValidationStatus({
        valid: false,
        showGenerativeLink: true,
        message:
          'A API Generative Language (Gemini) precisa ser ativada neste projeto do Google Cloud. Clique no botão abaixo para ativar:',
      });
    } else if (check.valid && !check.ttsEnabled) {
      saveGeminiApiKey(trimmedKey);
      saveVoicePreference(selectedVoice);
      setHasApiKey(true);
      setKeyValidationStatus({
        valid: true,
        ttsEnabled: false,
        showTtsLink: true,
        message:
          'Gemini Ativo! Para ativar a voz Neural2 oficial do Google, ative a API Cloud Text-to-Speech no link abaixo:',
      });
    } else {
      setKeyValidationStatus({
        valid: false,
        message: check.error || 'Chave inválida. Verifique sua chave no Google Cloud Console.',
      });
    }
  };

  // ===================================================================
  // TESTE RÁPIDO DE VOZ COM GEMINI + CLOUD NEURAL2
  // ===================================================================
  const handleTestVoice = async () => {
    const key = geminiKeyInput.trim() || getGeminiApiKey();
    if (!key) {
      setHasApiKey(false);
      setKeyValidationStatus({ valid: false, message: 'Por favor, cole sua chave do Google primeiro.' });
      return;
    }

    saveGeminiApiKey(key);
    saveVoicePreference(selectedVoice);
    setHasApiKey(true);

    setIsThinking(true);
    setKeyValidationStatus({ valid: true, message: 'Sensei gerando áudio com Google Cloud Neural2...' });

    try {
      const response = await askSenseiWithVoice({
        question: 'Apresente-se com elegância como o Sensei, co-apresentador desta reunião de projetos Lean Manufacturing.',
        project,
        apiKey: key,
      });
      setIsThinking(false);

      const textToSpeak =
        response.textFallback ||
        'Olá! Eu sou o Sensei, seu co-apresentador de inteligência artificial para este projeto Lean.';

      if (response.source === 'google_cloud_neural2') {
        setKeyValidationStatus({
          valid: true,
          ttsEnabled: true,
          message: `Reproduzindo voz oficial Google Cloud Neural2: ${response.voiceUsed || selectedVoice}!`,
        });
      } else {
        setKeyValidationStatus({
          valid: true,
          showTtsLink: true,
          message:
            response.errorDetails ||
            'Reproduzindo resposta! Para liberar o áudio Neural2 de estúdio, ative o Cloud Text-to-Speech no link abaixo:',
        });
      }

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
                ? '0 0 15px rgba(168, 85, 247, 0.4)'
                : 'none',
            }}
            title={
              isListening
                ? 'Sensei está ouvindo! Fale "Sensei..." ou pergunte algo'
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
                    Google Gemini AI + Google Cloud Neural2 HD
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

            {/* Chave de API do Google */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Key size={13} color="#fbbf24" />
                Sua Chave de API do Google:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => {
                    setGeminiKeyInput(e.target.value);
                    setKeyValidationStatus(null);
                  }}
                  placeholder="Cole sua chave gerada no Google (AIzaSy...)"
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
                    marginTop: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.725rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    backgroundColor: keyValidationStatus.valid
                      ? keyValidationStatus.ttsEnabled
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(251, 191, 36, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${
                      keyValidationStatus.valid
                        ? keyValidationStatus.ttsEnabled
                          ? '#10b981'
                          : '#fbbf24'
                        : '#ef4444'
                    }`,
                    color: keyValidationStatus.valid
                      ? keyValidationStatus.ttsEnabled
                        ? '#34d399'
                        : '#fde68a'
                      : '#f87171',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {keyValidationStatus.valid ? (
                      keyValidationStatus.ttsEnabled ? (
                        <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                      ) : (
                        <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      )
                    ) : (
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    )}
                    <span>{keyValidationStatus.message}</span>
                  </div>

                  {/* Link direto para ativar a API Generative Language (Gemini) */}
                  {keyValidationStatus.showGenerativeLink && (
                    <a
                      href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        alignSelf: 'flex-start',
                        marginTop: '0.2rem',
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={12} />
                      1 Clique: Ativar Generative Language API no Google Cloud
                    </a>
                  )}

                  {/* Link direto para ativar a API Text-to-Speech no Google Cloud */}
                  {keyValidationStatus.showTtsLink && (
                    <a
                      href="https://console.cloud.google.com/apis/library/texttospeech.googleapis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        alignSelf: 'flex-start',
                        marginTop: '0.2rem',
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={12} />
                      Clique aqui para Ativar Text-to-Speech no Google Cloud (Grátis)
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Seleção de Voz Google Cloud Neural2 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Volume2 size={13} color="#22d3ee" />
                Voz Neural2 do Sensei:
              </label>

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
                {SENSEI_PROFILE.voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.label}
                  </option>
                ))}
              </select>
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
                    <><Sparkles size={12} className="animate-spin" /> Gerando Áudio...</>
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
