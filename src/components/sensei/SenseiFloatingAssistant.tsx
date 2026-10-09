/**
 * SenseiFloatingAssistant.tsx
 *
 * Copiloto Operacional de Inteligência Artificial para o Lean Flow System
 *
 * Conformidade & Compliance (Leis Federais 9.609/98, 9.610/98 e 13.709/18 - LGPD):
 * - Modo duplo interativo: Orbe 3D Animado (MorphOrb) e Histórico de Ações Executivas.
 * - Integração com fala (Web Speech API) e síntese de áudio (TTS) sob demanda.
 * - Sanitização automática de PII via endpoint /api/ai/sensei.
 * - Restrição rigorosa de Zero Emojis conforme diretrizes de governança do projeto.
 */

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
  MessageSquare,
  Maximize2,
  Minimize2,
  FileText,
} from 'lucide-react';
import {
  SenseiChatMessage,
  askSenseiAssistant,
} from '@/services/senseiAgentService';
import { AiThinkingOrb } from '@/components/ui/AiThinkingOrb';
import './sensei-assistant.css';

export const SenseiFloatingAssistant: React.FC = () => {
  const router = useRouter();
  const { currentUser, currentTenant, refreshData } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'orb' | 'chat'>('orb');
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Desativado por padrão conforme diretriz
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
        text: 'Olá! Sou o Sensei IA, seu copiloto operacional Lean. Tenho acesso total ao Gemba: posso cadastrar projetos Kaizen, consultar indicadores de custo evitado e registrar ideias no Canal Kaizen. Como posso ajudar?',
        timestamp: 'Agora',
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Rolagem automática para o final das mensagens no modo chat
  useEffect(() => {
    if (isOpen && viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, viewMode]);

  // Foco automático no input ao alternar para modo chat
  useEffect(() => {
    if (isOpen && viewMode === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, viewMode]);

  // Atalho global de teclado: Alt + S ou Alt + A
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey && (e.key === 's' || e.key === 'S' || e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Inicialização do Reconhecimento de Voz nativo
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

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Não renderiza se o usuário não estiver logado
  if (!currentUser) {
    return null;
  }

  // Alterna gravação por voz
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Seu navegador não possui suporte nativo à gravação de voz. Recomendamos o Google Chrome ou Microsoft Edge.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('[Sensei Speech]: Falha ao iniciar reconhecimento:', err);
      }
    }
  };

  // Reproduz áudio TTS (somente sob demanda ou se voz estiver ativada)
  const playSpeech = (text: string, base64Audio?: string | null) => {
    if (base64Audio) {
      try {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new window.Image() as any;
        }
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.play().catch(() => {});
        return;
      } catch {
        // Fallback para síntese nativa
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*_#`]/g, '').replace(/\n+/g, '. ');
        const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 350));
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('[Sensei TTS Error]:', e);
      }
    }
  };

  // Submissão pelo Orbe 3D interativo
  const handleOrbSubmit = async (promptText: string): Promise<string> => {
    const textToSend = promptText.trim();
    if (!textToSend) return 'Nenhum comando informado.';

    const userMsg: SenseiChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
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

      return senseiReply.text;
    } catch (err: any) {
      const errorText = 'Ocorreu uma falha momentânea ao processar sua solicitação no Gemba. Por favor, tente novamente.';
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'sensei',
          text: errorText,
          timestamp: 'Agora',
        },
      ]);
      return errorText;
    } finally {
      setIsLoading(false);
    }
  };

  // Envia mensagem no modo chat tradicional
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend || isLoading) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
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
      {/* BOTÃO FLUTUANTE "AJUDA DO SENSEI" (FAB) */}
      {!isOpen && (
        <div className="sensei-fab-container">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Ajuda do Sensei IA (Atalho: Alt + S)"
            className="sensei-fab-button"
          >
            {/* Ícone com pulsador */}
            <div className="sensei-fab-icon-box">
              <div className="sensei-fab-icon-inner">
                <Sparkles size={16} />
              </div>
              <span className="sensei-fab-beacon" />
            </div>

            {/* Rótulo e Atalho */}
            <div className="sensei-fab-text-box">
              <span className="sensei-fab-title">
                Ajuda do Sensei
              </span>
              <span className="sensei-fab-shortcut">
                Alt+S
              </span>
            </div>
          </button>
        </div>
      )}

      {/* JANELA DO CHAT COM O SENSEI */}
      {isOpen && (
        <div
          className={`sensei-window-modal ${isExpanded ? 'expanded' : 'normal'}`}
        >
          {/* Linha superior de destaque neon */}
          <div className="sensei-window-top-accent" />

          {/* HEADER DO SENSEI */}
          <div className="sensei-header">
            <div className="sensei-header-brand">
              <div className="sensei-header-avatar">
                <div className="sensei-header-avatar-inner">
                  <Sparkles size={15} />
                </div>
                <span className="sensei-fab-beacon" />
              </div>
              <div className="sensei-header-titles">
                <div className="sensei-header-name-row">
                  <h3 className="sensei-header-name">
                    Sensei IA
                  </h3>
                  <span className="sensei-header-badge">
                    Gemba 4.0
                  </span>
                </div>
                <p className="sensei-header-tenant">
                  {currentTenant?.name || 'Unidade'} • Copiloto Operacional
                </p>
              </div>
            </div>

            {/* Controles do Header */}
            <div className="sensei-header-actions">
              {/* Segmented Control: Orbe 3D vs Histórico */}
              <div className="sensei-mode-segmented">
                <button
                  type="button"
                  onClick={() => setViewMode('orb')}
                  className={`sensei-mode-btn ${viewMode === 'orb' ? 'active' : ''}`}
                  title="Modo Orbe 3D Animado"
                >
                  <Sparkles size={12} />
                  <span>Orbe 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('chat')}
                  className={`sensei-mode-btn ${viewMode === 'chat' ? 'active' : ''}`}
                  title="Modo Histórico e Ações"
                >
                  <MessageSquare size={12} />
                  <span>Histórico</span>
                  {messages.length > 1 && (
                    <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', marginLeft: '2px', fontFamily: 'monospace' }}>
                      {messages.length - 1}
                    </span>
                  )}
                </button>
              </div>

              {/* Botão de Áudio (Voz) */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`sensei-icon-btn ${voiceEnabled ? 'active' : ''}`}
                title={voiceEnabled ? 'Voz do Sensei ativa' : 'Ativar voz do Sensei'}
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>

              {/* Botão Expandir / Restaurar */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="sensei-icon-btn"
                title={isExpanded ? 'Restaurar tamanho' : 'Expandir janela'}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              {/* Botão Reiniciar Conversa */}
              <button
                type="button"
                onClick={handleClearChat}
                className="sensei-icon-btn"
                title="Reiniciar conversa"
              >
                <RotateCcw size={14} />
              </button>

              {/* Botão Fechar (Alt + S) */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sensei-icon-btn"
                title="Minimizar (Alt + S)"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="sensei-chips-container no-scrollbar">
            <span className="sensei-chips-label">
              Sugestões:
            </span>
            <button
              type="button"
              onClick={() => {
                setViewMode('chat');
                handleSendMessage('Cadastre um projeto para eliminar perdas de matéria-prima no setor de Extrusão com custo evitado de 12000');
              }}
              className="sensei-chip-pill"
            >
              <Workflow size={12} color="#22d3ee" />
              <span>Cadastrar projeto (Extrusão)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('chat');
                handleSendMessage('Qual é o resumo atual de custo evitado e ações em andamento nesta unidade?');
              }}
              className="sensei-chip-pill"
            >
              <TrendingUp size={12} color="#34d399" />
              <span>Resumo de Custo Evitado</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('chat');
                handleSendMessage('Registre uma ideia no Canal Kaizen para otimizar o tempo de setup de bobinas');
              }}
              className="sensei-chip-pill"
            >
              <Lightbulb size={12} color="#fbbf24" />
              <span>Ideia no Canal Kaizen</span>
            </button>
          </div>

          {/* CORPO DO ASSISTENTE: MODO ORBE 3D vs MODO HISTÓRICO */}
          {viewMode === 'orb' ? (
            <div style={{ position: 'relative', flex: 1, width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#060a13' }}>
              <AiThinkingOrb
                onSubmit={handleOrbSubmit}
                onViewHistory={() => setViewMode('chat')}
                minThinkMs={2400}
                voiceEnabled={true}
                copy={{
                  placeholder: 'Peça uma ação ou fale ao Sensei...',
                  labels: [
                    'Consultando Gemba e projetos...',
                    'Analisando histórico Kaizen...',
                    'Processando regras operacionais...',
                    'Executando ação no sistema...',
                  ],
                  done: 'Concluído',
                  answerTitle: 'Resposta do Sensei',
                  answerBody: 'Processando resposta...',
                  reset: 'Nova Pergunta',
                  send: 'Enviar',
                }}
                className="w-full h-full flex-1"
              />
            </div>
          ) : (
            <>
              {/* ÁREA DE MENSAGENS / HISTÓRICO */}
              <div className="sensei-chat-scroll custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`sensei-msg-row ${msg.sender === 'user' ? 'user' : 'bot'}`}
                  >
                    {msg.sender === 'sensei' && (
                      <div className="sensei-msg-avatar bot">
                        <Sparkles size={14} />
                      </div>
                    )}

                    <div className={`sensei-msg-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                      {/* Conteúdo com Quebras de Linha */}
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                      {/* Card Interativo de Ação Executada */}
                      {msg.actionResult && (
                        <div className="sensei-action-card">
                          <CheckCircle2 size={14} color="#34d399" />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                            <span>{msg.actionResult.title}</span>
                            {msg.actionResult.protocol && (
                              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                Protocolo: <strong style={{ color: '#22d3ee' }}>{msg.actionResult.protocol}</strong>
                              </span>
                            )}
                            {msg.actionResult.description && (
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                {msg.actionResult.description}
                              </span>
                            )}
                            {msg.actionResult.linkUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (msg.actionResult?.linkUrl) {
                                    router.push(msg.actionResult.linkUrl);
                                    setIsOpen(false);
                                  }
                                }}
                                style={{
                                  marginTop: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  border: '1px solid rgba(16, 185, 129, 0.4)',
                                  color: '#6ee7b7',
                                  fontWeight: 700,
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  width: 'fit-content',
                                }}
                              >
                                <span>Acessar no Sistema</span>
                                <ExternalLink size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rodapé da Mensagem */}
                      <div className="sensei-msg-meta">
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'sensei' && (
                          <button
                            type="button"
                            onClick={() => playSpeech(msg.text, msg.audioBase64)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            title="Ouvir esta mensagem sob demanda"
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', width: 'fit-content', fontSize: '11px' }}>
                    <Loader2 size={14} color="#06b6d4" className="animate-spin" />
                    <span>Sensei analisando e processando no Gemba...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Banner de status de gravação de voz */}
              {isListening && (
                <div className="sensei-voice-active-bar animate-pulse">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f43f5e' }} />
                    <span>Ouvindo comando por voz... Fale agora</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleListening}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#be123c',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Parar
                  </button>
                </div>
              )}

              {/* CAMPO DE ENTRADA NO MODO HISTÓRICO */}
              <div className="sensei-footer">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="sensei-input-row"
                >
                  {/* Botão de Microfone */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`sensei-mic-btn ${isListening ? 'recording' : ''}`}
                    title={isListening ? 'Parar gravação' : 'Falar comando por voz (Microfone)'}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>

                  {/* Input de Texto */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isListening ? 'Ouvindo sua fala...' : 'Peça uma ação ou faça uma pergunta...'}
                    disabled={isLoading}
                    className="sensei-input-field"
                  />

                  {/* Botão Enviar */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="sensei-send-btn"
                    title="Enviar comando"
                  >
                    <Send size={15} />
                  </button>
                </form>

                {/* Disclaimer Jurídico / Ético (LGPD & Cyber Law) */}
                <div className="sensei-disclaimer">
                  O Sensei IA opera em caráter consultivo e analítico. Decisões técnicas e financeiras devem ser validadas pelos líderes no Gemba.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SenseiFloatingAssistant;
