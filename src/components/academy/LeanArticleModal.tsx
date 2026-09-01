'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Clock, BookOpen, Lightbulb, Factory, ShieldCheck, Sparkles, Activity, AlertCircle } from 'lucide-react';
import { LeanArticle } from '@/data/leanArticlesData';

export interface ArticleReadingTelemetry {
  timeSpentSeconds: number;
  scrolledToBottom: boolean;
  interactionsCount: number;
  isValidated: boolean;
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

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicia e gerencia o cronômetro ativo de leitura
  useEffect(() => {
    if (isOpen && article) {
      setSecondsSpent(0);
      setHasScrolledToBottom(false);
      setInteractionCount(1);

      timerRef.current = setInterval(() => {
        setSecondsSpent((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, article]);

  if (!isOpen || !article) return null;

  // Monitora rolagem de página para atestar leitura real
  const handleScroll = () => {
    setInteractionCount((prev) => prev + 1);
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollDepth = (el.scrollTop + el.clientHeight) / el.scrollHeight;
    if (scrollDepth >= 0.75) {
      setHasScrolledToBottom(true);
    }
  };

  const handleInteraction = () => {
    setInteractionCount((prev) => prev + 1);
  };

  // Regra de Validação Master: rolou pelo menos 75-80%, tempo entre 30s e 15min (900s)
  const isCurrentlyValidated = hasScrolledToBottom && secondsSpent >= 30 && secondsSpent <= 900;
  const isOverTimeLimit = secondsSpent > 900;

  const handleConfirmRead = () => {
    const telemetry: ArticleReadingTelemetry = {
      timeSpentSeconds: secondsSpent,
      scrolledToBottom: hasScrolledToBottom,
      interactionsCount: interactionCount,
      isValidated: isCurrentlyValidated || (isRead && isValidatedRead),
    };
    onMarkAsRead(article.id, telemetry);
  };

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(6, 182, 212, 0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
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
                  <Clock size={12} /> Estimado: {article.readTimeMinutes} min
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Monitor de Leitura Ativa */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#0f172a',
                border: `1px solid ${isOverTimeLimit ? '#ef4444' : hasScrolledToBottom && secondsSpent >= 30 ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                padding: '0.3rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.725rem',
                color: isOverTimeLimit ? '#f87171' : hasScrolledToBottom && secondsSpent >= 30 ? '#34d399' : '#cbd5e1',
                fontFamily: 'var(--font-mono)',
              }}
              title="Telemetria de leitura ativa validada para o Master"
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

        {/* Content Body com Scroll Tracking */}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.65rem' }}>
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

        {/* Footer com Ação de Gamificação */}
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
                <CheckCircle2 size={14} color="#10b981" /> Leitura validada para a prova de certificação!
              </span>
            ) : isOverTimeLimit ? (
              <span style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={14} /> Tempo excedeu 15 minutos de inatividade. Faça uma leitura atenta.
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {!hasScrolledToBottom ? 'Role até o final do artigo' : secondsSpent < 30 ? `Leia com atenção (${30 - secondsSpent}s restantes)` : 'Pronto para concluir!'}
              </span>
            )}
          </div>

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
  );
}
