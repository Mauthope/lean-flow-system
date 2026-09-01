'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  Lightbulb,
  Factory,
  ShieldCheck,
  Sparkles,
  Activity,
  AlertCircle,
  MessageSquare,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  HelpCircle,
} from 'lucide-react';
import { LeanArticle } from '@/data/leanArticlesData';
import {
  chatWithSenseiAboutArticle,
  synthesizeSpeechGoogleCloud,
  getGeminiApiKey,
} from '@/services/geminiService';

export interface ArticleReadingTelemetry {
  timeSpentSeconds: number;
  scrolledToBottom: boolean;
  interactionsCount: number;
  isValidated: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'sensei';
  text: string;
  timestamp: string;
}

interface LeanArticleModalProps {
  article: LeanArticle | null;
  isOpen: boolean;
  onClose: () => void;
  isRead: boolean;
  isValidatedRead?: boolean;
  onMarkAsRead: (articleId: string, telemetry: ArticleReadingTelemetry) => void;
}

export default function LeanArticleModal({
  article,
  isOpen,
  onClose,
  isRead,
  isValidatedRead = false,
  onMarkAsRead,
}: LeanArticleModalProps) {
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  // Chat com o Sensei dentro do Artigo
  const [isSenseiChatOpen, setIsSenseiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSenseiTyping, setIsSenseiTyping] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const minRequiredTime = article?.minReadTimeSeconds || 120;
  const maxAllowedTime = 900; // 15 minutos

  // 1. Funções de Áudio & Controle
  const stopAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingAudioId(null);
  }, []);

  const playVoiceForText = useCallback(async (messageId: string, text: string) => {
    if (playingAudioId === messageId) {
      stopAudio();
      return;
    }
    stopAudio();
    setPlayingAudioId(messageId);

    try {
      const apiKey = getGeminiApiKey();
      if (apiKey) {
        const res = await synthesizeSpeechGoogleCloud({
          text,
          apiKey,
        });

        if (res.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${res.audioBase64}`);
          audioPlayerRef.current = audio;
          audio.onended = () => setPlayingAudioId(null);
          audio.onerror = () => setPlayingAudioId(null);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('[Sensei Article Audio]', e);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR';
      u.onend = () => setPlayingAudioId(null);
      u.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(u);
    }
  }, [playingAudioId, stopAudio]);

  // 2. Telemetria & Rolagem
  const handleScroll = useCallback(() => {
    setInteractionCount((prev) => prev + 1);
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollDepth = (el.scrollTop + el.clientHeight) / el.scrollHeight;
    if (scrollDepth >= 0.75) {
      setHasScrolledToBottom(true);
    }
  }, []);

  const handleInteraction = useCallback(() => {
    setInteractionCount((prev) => prev + 1);
  }, []);

  const isCurrentlyValidated = hasScrolledToBottom && secondsSpent >= minRequiredTime && secondsSpent <= maxAllowedTime;
  const isOverTimeLimit = secondsSpent > maxAllowedTime;

  const handleConfirmRead = useCallback(() => {
    if (!article) return;
    const telemetry: ArticleReadingTelemetry = {
      timeSpentSeconds: secondsSpent,
      scrolledToBottom: hasScrolledToBottom,
      interactionsCount: interactionCount,
      isValidated: isCurrentlyValidated || (isRead && isValidatedRead),
    };
    onMarkAsRead(article.id, telemetry);
  }, [article, secondsSpent, hasScrolledToBottom, interactionCount, isCurrentlyValidated, isRead, isValidatedRead, onMarkAsRead]);

  // 3. Envio de Mensagem ao Sensei
  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const q = textToSend || inputMessage;
    if (!q.trim() || isSenseiTyping || !article) return;

    setInteractionCount((prev) => prev + 2);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSenseiTyping(true);

    try {
      const historyFormatted = chatMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          parts: [{ text: m.text }],
        }));

      const reply = await chatWithSenseiAboutArticle({
        article,
        history: historyFormatted,
        message: q.trim(),
      });

      const senseiMsg: ChatMessage = {
        id: `s-${Date.now()}`,
        sender: 'sensei',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, senseiMsg]);
      setIsSenseiTyping(false);
    } catch (err) {
      console.error('[Sensei Chat Error]', err);
      setIsSenseiTyping(false);
    }
  }, [article, inputMessage, isSenseiTyping, chatMessages]);

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Efeito de inicialização e contagem de tempo
  useEffect(() => {
    if (isOpen && article) {
      setSecondsSpent(0);
      setHasScrolledToBottom(false);
      setInteractionCount(1);
      setIsSenseiChatOpen(false);
      setChatMessages([
        {
          id: 'welcome',
          sender: 'sensei',
          text: `Olá! Sou o Sensei. Estou acompanhando sua leitura de "${article.title}". Qualquer dúvida sobre como aplicar esse conceito na fábrica ou pegadinhas da prova, pode me perguntar aqui! Nosso tempo de conversa também conta como tempo de estudo.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      timerRef.current = setInterval(() => {
        setSecondsSpent((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudio();
    };
  }, [isOpen, article, stopAudio]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isSenseiTyping]);

  if (!isOpen || !article) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={handleInteraction}
    >
      <div
        style={{
          backgroundColor: '#090e1a',
          border: '1.5px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: isSenseiChatOpen ? '1100px' : '880px',
          height: '92vh',
          maxHeight: '860px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(6, 182, 212, 0.2)',
          overflow: 'hidden',
          transition: 'max-width 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#040711',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                border: '1.5px solid #22d3ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              {article.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#22d3ee',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '6px',
                  }}
                >
                  {article.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Clock size={12} /> Mínimo: {formatTimer(minRequiredTime)} • Estimado: {article.readTimeMinutes} min
                </span>
                {isRead && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10b981',
                      color: '#34d399',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px',
                    }}
                  >
                    Lido ✓
                  </span>
                )}
              </div>
              <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                {article.title}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Botão de Toggle do Chat com o Sensei */}
            <button
              type="button"
              onClick={() => setIsSenseiChatOpen((prev) => !prev)}
              className="btn btn-sm"
              style={{
                backgroundColor: isSenseiChatOpen ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.12)',
                border: '1.5px solid #a855f7',
                color: '#c084fc',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: isSenseiChatOpen ? '0 0 15px rgba(168, 85, 247, 0.35)' : 'none',
              }}
            >
              <Sparkles size={14} color="#c084fc" />
              <span>{isSenseiChatOpen ? 'Ocultar Sensei' : '💬 Dúvidas com o Sensei'}</span>
            </button>

            {/* Monitor de Leitura Ativa */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#0f172a',
                border: `1px solid ${isOverTimeLimit ? '#ef4444' : secondsSpent >= minRequiredTime && hasScrolledToBottom ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                padding: '0.3rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.725rem',
                color: isOverTimeLimit ? '#f87171' : secondsSpent >= minRequiredTime && hasScrolledToBottom ? '#34d399' : '#cbd5e1',
                fontFamily: 'var(--font-mono)',
              }}
              title={`Tempo ativo de estudo: ${formatTimer(secondsSpent)} (Mínimo exigido: ${formatTimer(minRequiredTime)})`}
            >
              <Activity size={13} />
              <span>{formatTimer(secondsSpent)}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Fechar (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Corpo com Artigo e Chat */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LADO ESQUERDO: CONTEÚDO DO ARTIGO */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              borderRight: isSenseiChatOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            }}
          >
            {/* Introdução */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                padding: '1.15rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22d3ee', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>
                📖 Visão Geral & Contexto
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                {article.content.introduction}
              </p>
            </div>

            {/* Conceitos Chave */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', margin: '0 0 0.65rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lightbulb size={16} /> Conceitos Fundamentais
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
                {article.content.keyConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#0f172a',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <strong style={{ fontSize: '0.8125rem', color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
                      {item.title}
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.78125rem', color: '#94a3b8', lineHeight: 1.45 }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Como Aplicar no Gemba */}
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '14px',
                padding: '1.15rem',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}
            >
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22d3ee', margin: '0 0 0.5rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Factory size={16} /> Como Aplicar no Chão de Fábrica (Gemba)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {article.content.howToApply.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                    <span style={{ color: '#22d3ee', fontWeight: 800, fontSize: '0.8125rem' }}>{idx + 1}.</span>
                    <span style={{ color: '#cbd5e1', fontSize: '0.8125rem', lineHeight: 1.45 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exemplo Real de Fábrica */}
            <div
              style={{
                backgroundColor: 'rgba(52, 211, 153, 0.08)',
                borderRadius: '14px',
                padding: '1.15rem',
                border: '1px solid rgba(52, 211, 153, 0.3)',
              }}
            >
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', margin: '0 0 0.35rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                💡 Caso Prático Real
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                {article.content.factoryExample}
              </p>
            </div>

            {/* Dica para a Prova de Certificação */}
            <div
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                borderRadius: '14px',
                padding: '1rem',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
              }}
            >
              <Sparkles size={18} color="#c084fc" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', display: 'block' }}>
                  Dica de Ouro do Sensei para a Prova:
                </span>
                <p style={{ margin: 0, fontSize: '0.78125rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  {article.content.quizHint}
                </p>
              </div>
            </div>

            {/* Alerta de Validação de Leitura */}
            {!hasScrolledToBottom && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', justifyContent: 'center' }}>
                <span>Role até o final do conteúdo para validar a conclusão da leitura.</span>
              </div>
            )}
          </div>

          {/* LADO DIREITO: CHAT COM O SENSEI */}
          {isSenseiChatOpen && (
            <div
              style={{
                width: '380px',
                backgroundColor: '#070b14',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid rgba(168, 85, 247, 0.25)',
              }}
            >
              {/* Header do Chat */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bot size={18} color="#c084fc" />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff' }}>
                      Sensei Tutor no Artigo
                    </h5>
                    <span style={{ fontSize: '0.65rem', color: '#a78bfa' }}>
                      Tempo de chat conta como estudo ativo
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSenseiChatOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Sugestões de Perguntas Rápidas */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}
              >
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Perguntas Sugeridas:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {[
                    `Como aplico ${article.title.split(':')[0]} no meu setor?`,
                    'Qual pegadinha costuma cair na prova sobre isso?',
                    'Me dê um exemplo prático de cálculo deste tema.',
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.675rem',
                        color: '#cbd5e1',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      💡 {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensagens do Chat */}
              <div
                ref={chatScrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: '0.2rem',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '88%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '12px',
                        backgroundColor: msg.sender === 'user' ? 'rgba(6, 182, 212, 0.2)' : '#0f172a',
                        border: msg.sender === 'user' ? '1px solid #22d3ee' : '1px solid rgba(168, 85, 247, 0.3)',
                        color: '#ffffff',
                        fontSize: '0.78125rem',
                        lineHeight: 1.45,
                        position: 'relative',
                      }}
                    >
                      {msg.text}

                      {msg.sender === 'sensei' && msg.id !== 'welcome' && (
                        <div style={{ marginTop: '0.4rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => playVoiceForText(msg.id, msg.text)}
                            style={{
                              backgroundColor: playingAudioId === msg.id ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: playingAudioId === msg.id ? '#22d3ee' : '#94a3b8',
                              borderRadius: '6px',
                              padding: '0.15rem 0.45rem',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            {playingAudioId === msg.id ? <VolumeX size={11} color="#f87171" /> : <Volume2 size={11} />}
                            <span>{playingAudioId === msg.id ? 'Parar Áudio' : '🔊 Ouvir Voz'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isSenseiTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.725rem' }}>
                    <Sparkles size={13} className="animate-spin" />
                    <span>Sensei elaborando resposta técnica...</span>
                  </div>
                )}
              </div>

              {/* Input do Chat */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: '#040711',
                  display: 'flex',
                  gap: '0.45rem',
                }}
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Pergunte ao Sensei sobre este artigo..."
                  style={{
                    flex: 1,
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.65rem',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isSenseiTyping}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.45rem 0.65rem', borderRadius: '8px' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Ação de Gamificação & Telemetria */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#040711',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isCurrentlyValidated || (isRead && isValidatedRead) ? (
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> Leitura e mentoria validadas para a prova de certificação!
              </span>
            ) : isOverTimeLimit ? (
              <span style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={14} /> Tempo excedeu 15 minutos de inatividade. Faça uma leitura atenta.
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                {!hasScrolledToBottom
                  ? 'Role até o final do artigo para validar a leitura'
                  : secondsSpent < minRequiredTime
                  ? `Tempo mínimo exigido: ${formatTimer(minRequiredTime)} (Faltam ${minRequiredTime - secondsSpent}s)`
                  : 'Tempo e rolagem atingidos! Pronto para concluir.'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleConfirmRead}
              className="btn btn-primary"
              style={{
                fontWeight: 800,
                padding: '0.6rem 1.4rem',
                borderRadius: '10px',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: isRead ? '#10b981' : undefined,
              }}
            >
              <CheckCircle2 size={16} />
              {isRead ? 'Artigo Concluído ✓' : 'Concluir Leitura (+10 XP)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
