'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Workflow,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import {
  SenseiChatMessage,
  askSenseiAssistant,
} from '@/services/senseiAgentService';

export const SenseiFloatingAssistant: React.FC = () => {
  const router = useRouter();
  const { currentUser, currentTenant, refreshData } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Desativado por padrão conforme solicitado
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  const [messages, setMessages] = useState<SenseiChatMessage[]>(() => {
    return [
      {
        id: 'init_sensei',
        sender: 'sensei',
        text: 'Olá! Sou o Sensei IA, seu copiloto operacional Lean. Tenho acesso total ao Gemba: posso cadastrar projetos, consultar indicadores e registrar ideias no Canal Kaizen. Como posso ajudar?',
        timestamp: 'Agora',
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Rolagem automática para o final das mensagens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Inicialização do Reconhecimento de Voz (Web Speech API nativo)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputText(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[Sensei Speech Recognition Error]:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Não renderiza se o usuário não estiver logado
  if (!currentUser) {
    return null;
  }

  // Alterna gravação por voz
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Seu navegador não possui suporte nativo à gravação de voz. Você pode digitar sua mensagem normalmente.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('[Sensei Speech]: Falha ao iniciar reconhecimento:', err);
      }
    }
  };

  // Reproduz áudio TTS
  const playSpeech = (text: string, base64Audio?: string | null) => {
    if (!voiceEnabled) return;

    if (base64Audio) {
      try {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new window.Image() as any; // placeholder
        }
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.play().catch(() => {});
        return;
      } catch {
        // Fallback para síntese nativa
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Envia mensagem para o Sensei
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: SenseiChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const senseiReply = await askSenseiAssistant({
        message: textToSend,
        context: {
          currentTenant,
          currentUser,
          refreshData,
        },
        chatHistory: messages,
        enableVoiceResponse: voiceEnabled,
      });

      setMessages((prev) => [...prev, senseiReply]);

      if (voiceEnabled && senseiReply.text) {
        playSpeech(senseiReply.text, senseiReply.audioBase64);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'sensei',
          text: 'Ocorreu uma falha momentânea ao processar sua solicitação no Gemba. Por favor, tente novamente.',
          timestamp: 'Agora',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([
      {
        id: 'init_sensei_' + Date.now(),
        sender: 'sensei',
        text: 'Histórico reiniciado. Como posso auxiliá-lo agora no Gemba?',
        timestamp: 'Agora',
      },
    ]);
  };

  return (
    <>
      {/* BOTÃO FLUTUANTE "AJUDA DO SENSEI" */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9980,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Ajuda do Sensei IA (Copiloto Operacional)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: isOpen ? '0.75rem 1rem' : '0.8rem 1.25rem',
            borderRadius: '9999px',
            backgroundColor: isOpen ? '#0f172a' : '#08101e',
            border: isOpen ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(34, 211, 238, 0.45)',
            boxShadow: isOpen
              ? '0 10px 30px rgba(0, 0, 0, 0.6)'
              : '0 10px 35px -5px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
              e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.7)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(6, 182, 212, 0.55)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.45)';
              e.currentTarget.style.boxShadow = '0 10px 35px -5px rgba(6, 182, 212, 0.4)';
            }
          }}
        >
          {/* Ícone com animação de pulso etéreo */}
          <div
            style={{
              position: 'relative',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isOpen ? (
              <X size={18} style={{ color: '#94a3b8' }} />
            ) : (
              <>
                <span
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#22d3ee',
                    opacity: 0.25,
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
                <Sparkles size={18} style={{ color: '#22d3ee', position: 'relative', zIndex: 1 }} />
              </>
            )}
          </div>

          <span
            style={{
              fontSize: '0.84375rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.01em',
              color: '#ffffff',
              whiteSpace: 'nowrap',
            }}
          >
            {isOpen ? 'Fechar Sensei' : 'Ajuda do Sensei'}
          </span>

          {!isOpen && (
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
          )}
        </button>
      </div>

      {/* JANELA DO CHAT COM O SENSEI */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '430px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 110px)',
            backgroundColor: 'rgba(11, 19, 36, 0.94)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: '20px',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 25px 65px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.15)',
            zIndex: 9981,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-sans)',
            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Linha superior de brilho executivo */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.8) 50%, transparent 100%)',
              zIndex: 2,
            }}
          />

          {/* HEADER DO SENSEI */}
          <div
            style={{
              padding: '1.1rem 1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(6, 10, 19, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0e1d35 0%, #060a14 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.9375rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      fontFamily: 'var(--font-heading)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Sensei IA
                  </h3>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    Gemba 4.0
                  </span>
                </div>
                <span style={{ fontSize: '0.71875rem', color: '#94a3b8' }}>
                  {currentTenant?.name || 'Unidade'} • Acesso Total
                </span>
              </div>
            </div>

            {/* Ações do Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={toggleVoice}
                title={voiceEnabled ? 'Desativar voz do Sensei' : 'Ativar voz do Sensei'}
                style={{
                  padding: '0.45rem',
                  borderRadius: '8px',
                  backgroundColor: voiceEnabled ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid',
                  borderColor: voiceEnabled ? 'rgba(34, 211, 238, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  color: voiceEnabled ? '#22d3ee' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              <button
                onClick={handleClearChat}
                title="Reiniciar conversa"
                style={{
                  padding: '0.45rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCcw size={15} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Fechar"
                style={{
                  padding: '0.45rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* CORPO DE MENSAGENS */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Sugestões Rápidas de Ação */}
            {messages.length <= 2 && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}
                >
                  Sugestões Rápidas:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleSendMessage('Cadastre um projeto para eliminar perdas de matéria-prima no setor de Extrusão com custo evitado de 12000')}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(34, 211, 238, 0.06)',
                      border: '1px solid rgba(34, 211, 238, 0.18)',
                      color: '#22d3ee',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Workflow size={13} style={{ flexShrink: 0 }} />
                    <span>Cadastrar projeto no Kanban (Extrusão)</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Qual é o resumo atual de custo evitado e ações em andamento nesta unidade?')}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.18)',
                      color: '#34d399',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <TrendingUp size={13} style={{ flexShrink: 0 }} />
                    <span>Consultar resumo de custo evitado no Gemba</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Registre uma ideia no Canal Kaizen para otimizar o tempo de setup de bobinas')}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#cbd5e1',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Lightbulb size={13} style={{ flexShrink: 0 }} />
                    <span>Registrar nova ideia no Canal Kaizen</span>
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Mensagens */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '0.85rem 1rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor:
                      msg.sender === 'user' ? 'rgba(14, 116, 144, 0.35)' : 'rgba(15, 23, 42, 0.85)',
                    border:
                      msg.sender === 'user'
                        ? '1px solid rgba(34, 211, 238, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    color: msg.sender === 'user' ? '#ffffff' : '#f1f5f9',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}

                  {/* Card Interativo de Ação Executada */}
                  {msg.actionResult && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#ffffff' }}>
                          {msg.actionResult.title}
                        </span>
                      </div>

                      {msg.actionResult.protocol && (
                        <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                          Protocolo: <strong style={{ color: '#22d3ee' }}>{msg.actionResult.protocol}</strong>
                        </span>
                      )}

                      {msg.actionResult.description && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1' }}>
                          {msg.actionResult.description}
                        </p>
                      )}

                      {msg.actionResult.linkUrl && (
                        <button
                          onClick={() => {
                            if (msg.actionResult?.linkUrl) {
                              router.push(msg.actionResult.linkUrl);
                              setIsOpen(false);
                            }
                          }}
                          style={{
                            marginTop: '0.25rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            backgroundColor: '#10b981',
                            color: '#060a14',
                            fontWeight: 700,
                            fontSize: '0.71875rem',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Acessar no Sistema</span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontSize: '0.625rem',
                    color: '#64748b',
                    marginTop: '0.25rem',
                    padding: '0 0.25rem',
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#22d3ee', fontSize: '0.75rem' }}>
                <Loader2 size={15} className="animate-spin" />
                <span>Sensei analisando e processando com rigor Lean...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ÁREA DE ENTRADA (VOZ & TEXTO) */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(6, 10, 19, 0.8)',
            }}
          >
            {isListening && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    animation: 'ping 1s infinite',
                  }}
                />
                <span>Ouvindo sua voz... Fale seu comando ou solicitação ao Sensei.</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {/* Botão de Gravação de Voz */}
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Parar gravação' : 'Falar com o Sensei por áudio'}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: isListening ? '#ef4444' : 'rgba(34, 211, 238, 0.12)',
                  border: '1px solid',
                  borderColor: isListening ? '#ef4444' : 'rgba(34, 211, 238, 0.35)',
                  color: isListening ? '#ffffff' : '#22d3ee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none',
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Input de Texto */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? 'Gravando sua fala...' : 'Fale ou digite para o Sensei...'}
                disabled={isLoading}
                style={{
                  flex: 1,
                  height: '38px',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '0 0.85rem',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.6)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              />

              {/* Botão de Enviar */}
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                title="Enviar mensagem"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: inputText.trim() && !isLoading ? '#22d3ee' : 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: inputText.trim() && !isLoading ? '#060a14' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  fontWeight: 700,
                }}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>

            {/* Aviso Jurídico & Ético de IA (LGPD / Cyber Law Compliance) */}
            <div
              style={{
                marginTop: '0.45rem',
                fontSize: '0.65rem',
                color: '#64748b',
                textAlign: 'center',
                lineHeight: 1.3,
                letterSpacing: '0.01em',
              }}
            >
              O Sensei IA opera em caráter consultivo e assistencial. Decisões técnicas e financeiras devem ser validadas pelos líderes no Gemba.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
