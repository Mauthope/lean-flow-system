'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Play,
  FileCheck,
} from 'lucide-react';
import { LeanAction } from '@/lib/types';
import {
  auditAndRefineProjectWithSensei,
  chatWithSensei,
  synthesizeSpeechGoogleCloud,
  getGeminiApiKey,
  getVoicePreference,
  SenseiProjectRefinement,
} from '@/services/geminiService';

interface SenseiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: LeanAction;
  onApplyRefinement: (refinement: SenseiProjectRefinement) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'sensei';
  text: string;
  audioBase64?: string | null;
}

export default function SenseiCopilotModal({
  isOpen,
  onClose,
  project,
  onApplyRefinement,
}: SenseiCopilotModalProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'chat'>('audit');

  // Estado da Auditoria
  const [isAuditing, setIsAuditing] = useState(false);
  const [refinement, setRefinement] = useState<SenseiProjectRefinement | null>(null);
  const [applied, setApplied] = useState(false);

  // Estado do Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'sensei',
      text: `Olá! Eu sou o Sensei, seu copiloto especialista em Lean Manufacturing. Estou aqui para analisar seu projeto "${project.title}", refinar os 5 Porquês, Ishikawa e 5W2H, ou tirar quaisquer dúvidas técnicas sobre a aplicação do Kaizen no Gemba. Como posso te ajudar agora?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Limpa áudio ao fechar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  // ===================================================================
  // EXECUTAR AUDITORIA & REFINAMENTO COM O SENSEI
  // ===================================================================
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setApplied(false);
    try {
      const result = await auditAndRefineProjectWithSensei(project);
      setRefinement(result);
    } catch (err) {
      console.error('[Sensei Copilot] Erro na auditoria:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // ===================================================================
  // APLICAR SUGESTÕES AOS CAMPOS DO PROJETO
  // ===================================================================
  const handleApplyToProject = () => {
    if (!refinement) return;
    onApplyRefinement(refinement);
    setApplied(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // ===================================================================
  // ENVIO DE MENSAGEM NO CHAT
  // ===================================================================
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSendingChat(true);

    try {
      const history = chatMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: m.text }],
        }));

      const replyText = await chatWithSensei({
        history,
        project,
        message: text,
      });

      const senseiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'sensei',
        text: replyText,
      };

      setChatMessages((prev) => [...prev, senseiMsg]);
    } catch (err) {
      console.error('[Sensei Chat] Erro:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // ===================================================================
  // REPRODUZIR ÁUDIO DA RESPOSTA COM GOOGLE NEURAL2
  // ===================================================================
  const handlePlayVoice = async (msg: ChatMessage) => {
    if (playingAudioId === msg.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const key = getGeminiApiKey();
    if (!key) return;

    setPlayingAudioId(msg.id);

    try {
      const tts = await synthesizeSpeechGoogleCloud({
        text: msg.text,
        apiKey: key,
        voiceName: getVoicePreference(),
      });

      if (tts.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${tts.audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => setPlayingAudioId(null);
        audio.onerror = () => setPlayingAudioId(null);
        await audio.play();
      } else {
        setPlayingAudioId(null);
      }
    } catch {
      setPlayingAudioId(null);
    }
  };

  const quickPrompts = [
    'Como defender o ROI e Payback deste projeto para a diretoria?',
    'Sugira melhorias para os 5 Porquês deste problema.',
    'Quais ações Poka-Yoke você recomenda para este posto?',
    'Como redigir um POP (Trabalho Padronizado) perfeito para este processo?',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
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
          border: '1.5px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '900px',
          height: '90vh',
          maxHeight: '820px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(6, 182, 212, 0.2)',
          overflow: 'hidden',
        }}
      >
        {/* ============================================================= */}
        {/* HEADER DO SENSEI COPILOT                                       */}
        {/* ============================================================= */}
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
                fontSize: '1.4rem',
              }}
            >
              🥋
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Ajuda do Sensei • Consultoria & Auditoria Lean
                </h3>
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
                  Inteligência Kaizen
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Revisão de causa raiz, Ishikawa, 5W2H, cálculos financeiros e oratória
              </span>
            </div>
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

        {/* ============================================================= */}
        {/* NAVEGAÇÃO ENTRE ABAS (AUDITORIA vs CHAT)                       */}
        {/* ============================================================= */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#070b14',
            padding: '0 1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'audit' ? '2.5px solid #22d3ee' : '2.5px solid transparent',
              color: activeTab === 'audit' ? '#22d3ee' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={15} />
            Auditar & Aprimorar Projeto (1-Clique)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'chat' ? '2.5px solid #a855f7' : '2.5px solid transparent',
              color: activeTab === 'chat' ? '#c084fc' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={15} />
            Chat & Consultoria Técnica com o Sensei
          </button>
        </div>

        {/* ============================================================= */}
        {/* CONTEÚDO DA ABA 1: AUDITORIA & REFINAMENTO                     */}
        {/* ============================================================= */}
        {activeTab === 'audit' && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {!refinement && !isAuditing && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  backgroundColor: '#0c1322',
                  borderRadius: '16px',
                  border: '1px dashed rgba(6, 182, 212, 0.3)',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                  }}
                >
                  🥋
                </div>
                <div style={{ maxWidth: '550px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem' }}>
                    Deixe o Sensei Auditar e Aprimorar Seu Projeto
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                    O Sensei analisará a declaração do problema, os 5 Porquês, o Ishikawa 6M, as ações 5W2H e a padronização POP, elevando tudo para o padrão técnico e formal de Lean Manufacturing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunAudit}
                  className="btn btn-primary"
                  style={{
                    fontWeight: 800,
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Sparkles size={16} />
                  Auditar & Refinar Projeto Agora
                </button>
              </div>
            )}

            {isAuditing && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <Loader2 size={36} className="animate-spin" color="#22d3ee" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Sensei analisando os dados do projeto no Gemba...
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
                  Cruzando ferramentas Lean (5 Porquês, Ishikawa 6M, 5W2H e Padronização POP).
                </p>
              </div>
            )}

            {refinement && !isAuditing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Diagnóstico Executivo */}
                <div
                  style={{
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    borderRadius: '14px',
                    padding: '1.15rem 1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
                    <ShieldCheck size={18} color="#22d3ee" />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#22d3ee', margin: 0 }}>
                      Diagnóstico do Sensei:
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {refinement.executiveDiagnosis}
                  </p>
                </div>

                {/* 1. Declaração Formal do Problema */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '14px',
                    padding: '1.15rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase' }}>
                    1. Declaração Formal do Problema (Padrão Lean)
                  </span>
                  <div style={{ marginTop: '0.45rem', padding: '0.75rem', backgroundColor: '#090e1a', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#ffffff', lineHeight: 1.45 }}>
                      {refinement.formalProblemStatement}
                    </p>
                  </div>
                </div>

                {/* 2. 5 Porquês com Nexo Causal */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '14px',
                    padding: '1.15rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                    2. Investigação dos 5 Porquês Refinada
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.45rem' }}>
                    {refinement.refinedFiveWhys.map((why, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#090e1a',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          fontSize: '0.78125rem',
                          color: idx === refinement.refinedFiveWhys.length - 1 ? '#34d399' : '#cbd5e1',
                          fontWeight: idx === refinement.refinedFiveWhys.length - 1 ? 800 : 500,
                        }}
                      >
                        {why}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Ishikawa 6M Estratificado */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '14px',
                    padding: '1.15rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                    3. Diagrama de Ishikawa 6M Estruturado
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.45rem' }}>
                    {Object.entries(refinement.refinedIshikawa)
                      .filter(([k, v]) => Boolean(v) && k !== 'primaryRootCause')
                      .map(([key, val]) => (
                        <div key={key} style={{ backgroundColor: '#090e1a', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#94a3b8', textTransform: 'capitalize' }}>
                            {key}:
                          </span>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#ffffff' }}>{val}</p>
                        </div>
                      ))}
                  </div>
                  {refinement.refinedIshikawa.primaryRootCause && (
                    <div style={{ marginTop: '0.5rem', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #34d399' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#34d399' }}>
                        🎯 Causa Raiz Prioritária: {refinement.refinedIshikawa.primaryRootCause}
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Ações 5W2H Sugeridas */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '14px',
                    padding: '1.15rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    4. Plano de Ação 5W2H Sugerido
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.45rem' }}>
                    {refinement.suggestedActions.map((act, i) => (
                      <div key={i} style={{ backgroundColor: '#090e1a', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <strong style={{ fontSize: '0.78125rem', color: '#ffffff', display: 'block' }}>
                          {i + 1}. {act.label}
                        </strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          <span><strong>O quê:</strong> {act.what || act.label}</span> • <span><strong>Por quê:</strong> {act.why || 'Eliminar causa'}</span> • <span><strong>Resp:</strong> {act.responsibleName || 'Agente'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleRunAudit}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#cbd5e1',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <RefreshCw size={13} />
                    Gerar Novas Sugestões
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyToProject}
                    disabled={applied}
                    className="btn btn-primary"
                    style={{
                      fontWeight: 800,
                      padding: '0.65rem 1.5rem',
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      backgroundColor: applied ? '#10b981' : undefined,
                    }}
                  >
                    {applied ? (
                      <>
                        <CheckCircle2 size={16} />
                        Sugestões Aplicadas aos Campos!
                      </>
                    ) : (
                      <>
                        <FileCheck size={16} />
                        Aplicar Melhorias aos Campos do Projeto
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* CONTEÚDO DA ABA 2: CHAT DE CONSULTORIA LEAN AO VIVO            */}
        {/* ============================================================= */}
        {activeTab === 'chat' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Mensagens */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {chatMessages.map((msg) => (
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
                      maxWidth: '80%',
                      backgroundColor: msg.sender === 'user' ? '#0284c7' : '#0f172a',
                      border: msg.sender === 'user' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '0.75rem 1rem',
                      color: '#ffffff',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {msg.sender === 'sensei' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.35rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          paddingBottom: '0.25rem',
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#22d3ee' }}>
                          🥋 Sensei (Mestre Lean)
                        </span>

                        <button
                          type="button"
                          onClick={() => handlePlayVoice(msg)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: playingAudioId === msg.id ? '#22d3ee' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.3rem',
                            borderRadius: '4px',
                          }}
                          title="Ouvir resposta com voz Google Neural2"
                        >
                          {playingAudioId === msg.id ? (
                            <>
                              <VolumeX size={12} color="#f87171" />
                              <span style={{ color: '#f87171' }}>Parar</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={12} />
                              <span>Ouvir</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}

              {isSendingChat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontSize: '0.75rem' }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sensei pensando na melhor prática Lean...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Sugestões Rápidas de Perguntas */}
            <div
              style={{
                padding: '0.5rem 1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: '#040711',
                display: 'flex',
                gap: '0.45rem',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '999px',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.6875rem',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#22d3ee')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                >
                  💡 {q}
                </button>
              ))}
            </div>

            {/* Input de Envio */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#070b14',
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ display: 'flex', gap: '0.65rem' }}
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Pergunte ao Sensei (ex: como calcular o tempo de setup com SMED?)"
                  style={{
                    flex: 1,
                    backgroundColor: '#040711',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.8125rem',
                    color: '#ffffff',
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSendingChat}
                  className="btn btn-primary"
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Send size={14} />
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
