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
            onClick={() => setIsOpen(true)}
            title="Ajuda do Sensei IA (Atalho: Alt + S)"
            className="group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 text-white shadow-xl shadow-cyan-500/25 hover:border-cyan-400 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl"
          >
            {/* Brilho neon de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-teal-500/15 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Ícone com pulsador */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#060a13] rounded-[9px] flex items-center justify-center text-cyan-400 font-extrabold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </div>

            {/* Rótulo e Atalho */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                Ajuda do Sensei
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono font-semibold">
                Alt+S
              </span>
            </div>
          </button>
        </div>
      )}

      {/* JANELA DO CHAT COM O SENSEI */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-[9981] transition-all duration-300 flex flex-col overflow-hidden rounded-3xl shadow-2xl backdrop-blur-2xl border ${
            isExpanded
              ? 'w-[calc(100vw-32px)] sm:w-[720px] h-[780px] max-h-[92vh]'
              : 'w-full sm:w-[480px] h-[640px] max-h-[88vh]'
          } bg-slate-950/95 border-cyan-500/40 text-slate-100 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-bottom-5`}
        >
          {/* Linha superior de destaque neon */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 shrink-0" />

          {/* HEADER DO SENSEI */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 shadow-inner shrink-0">
                <div className="w-full h-full bg-[#060a13] rounded-[9px] flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-tight truncate">
                    Sensei IA
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                    Gemba 4.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentTenant?.name || 'Unidade'} • Copiloto Operacional
                </p>
              </div>
            </div>

            {/* Controles do Header */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Segmented Control: Orbe 3D vs Histórico */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode('orb')}
                  className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === 'orb'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Modo Orbe 3D Animado"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Orbe 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('chat')}
                  className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === 'chat'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Modo Histórico e Ações"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Histórico</span>
                  {messages.length > 1 && (
                    <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-800 text-cyan-300 ml-0.5 font-mono">
                      {messages.length - 1}
                    </span>
                  )}
                </button>
              </div>

              {/* Botão de Áudio (Voz) */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  voiceEnabled
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={voiceEnabled ? 'Voz do Sensei ativa' : 'Ativar voz do Sensei'}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Botão Expandir / Restaurar */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:flex"
                title={isExpanded ? 'Restaurar tamanho' : 'Expandir janela'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Botão Reiniciar Conversa */}
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/60 transition-colors cursor-pointer"
                title="Reiniciar conversa"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Botão Fechar (Alt + S) */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Minimizar (Alt + S)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Sugestões:
            </span>
            <button
              onClick={() => {
                setViewMode('chat');
                handleSendMessage('Cadastre um projeto para eliminar perdas de matéria-prima no setor de Extrusão com custo evitado de 12000');
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-slate-300 whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Workflow className="w-3 h-3 text-cyan-400" />
              <span>Cadastrar projeto (Extrusão)</span>
            </button>
            <button
              onClick={() => {
                setViewMode('chat');
                handleSendMessage('Qual é o resumo atual de custo evitado e ações em andamento nesta unidade?');
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-slate-300 whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Resumo de Custo Evitado</span>
            </button>
            <button
              onClick={() => {
                setViewMode('chat');
                handleSendMessage('Registre uma ideia no Canal Kaizen para otimizar o tempo de setup de bobinas');
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-slate-300 whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Ideia no Canal Kaizen</span>
            </button>
          </div>

          {/* CORPO DO ASSISTENTE: MODO ORBE 3D vs MODO HISTÓRICO */}
          {viewMode === 'orb' ? (
            <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col bg-slate-950">
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
              <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs bg-slate-950/70">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'sensei' && (
                      <div className="w-7 h-7 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-500/80 to-emerald-500/80 shadow-md shrink-0 mt-0.5">
                        <div className="w-full h-full bg-[#060a13] rounded-[9px] flex items-center justify-center text-cyan-400">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium rounded-tr-none shadow-cyan-950/20'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed'
                      }`}
                    >
                      {/* Conteúdo com Quebras de Linha */}
                      <div className="space-y-1.5 whitespace-pre-wrap">{msg.text}</div>

                      {/* Card Interativo de Ação Executada */}
                      {msg.actionResult && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Ação Executada pelo Sensei:</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-[11px] space-y-1">
                            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              <span>{msg.actionResult.title}</span>
                            </div>
                            {msg.actionResult.protocol && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Protocolo: <strong className="text-cyan-300">{msg.actionResult.protocol}</strong>
                              </div>
                            )}
                            {msg.actionResult.description && (
                              <div className="text-[10px] text-slate-400">
                                {msg.actionResult.description}
                              </div>
                            )}
                            {msg.actionResult.linkUrl && (
                              <button
                                onClick={() => {
                                  if (msg.actionResult?.linkUrl) {
                                    router.push(msg.actionResult.linkUrl);
                                    setIsOpen(false);
                                  }
                                }}
                                className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] cursor-pointer transition-colors"
                              >
                                <span>Acessar no Sistema</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rodapé da Mensagem */}
                      <div
                        className={`flex items-center justify-between gap-2 mt-2 text-[9px] ${
                          msg.sender === 'user' ? 'text-white/80' : 'text-slate-500'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'sensei' && (
                          <button
                            onClick={() => playSpeech(msg.text, msg.audioBase64)}
                            className="hover:text-cyan-400 transition-colors p-0.5 cursor-pointer"
                            title="Ouvir esta mensagem sob demanda"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 w-fit">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-xs">Sensei analisando e processando no Gemba...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Banner de status de gravação de voz */}
              {isListening && (
                <div className="px-4 py-2 bg-rose-950/90 border-t border-rose-900/80 text-rose-300 text-xs flex items-center justify-between animate-pulse shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-semibold">Ouvindo comando por voz... Fale agora</span>
                  </div>
                  <button
                    onClick={toggleListening}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                  >
                    Parar
                  </button>
                </div>
              )}

              {/* CAMPO DE ENTRADA NO MODO HISTÓRICO */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/80 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Botão de Microfone */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/50 scale-105'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300'
                    }`}
                    title={isListening ? 'Parar gravação' : 'Falar comando por voz (Microfone)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Input de Texto */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isListening ? 'Ouvindo sua fala...' : 'Peça uma ação ou faça uma pergunta...'}
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />

                  {/* Botão Enviar */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                    title="Enviar comando"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Disclaimer Jurídico / Ético (LGPD & Cyber Law) */}
                <div className="mt-2 text-[10px] text-slate-500 text-center leading-tight">
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
