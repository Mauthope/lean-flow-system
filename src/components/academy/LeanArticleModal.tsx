'use client';

import React from 'react';
import { X, CheckCircle2, Clock, BookOpen, Lightbulb, Factory, ShieldCheck, Sparkles } from 'lucide-react';
import { LeanArticle } from '@/data/leanArticlesData';

interface LeanArticleModalProps {
  article: LeanArticle | null;
  isOpen: boolean;
  onClose: () => void;
  isRead: boolean;
  onMarkAsRead: (articleId: string) => void;
}

export default function LeanArticleModal({
  article,
  isOpen,
  onClose,
  isRead,
  onMarkAsRead,
}: LeanArticleModalProps) {
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
    >
      <div
        style={{
          backgroundColor: '#090e1a',
          border: '1.5px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
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
                  <Clock size={12} /> {article.readTimeMinutes} min de leitura
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

        {/* Content Body */}
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
          }}
        >
          <span style={{ fontSize: '0.78125rem', color: '#94a3b8' }}>
            {isRead ? 'Você já completou a leitura deste artigo!' : 'Complete a leitura para somar pontos de conhecimento.'}
          </span>

          <button
            type="button"
            onClick={() => {
              onMarkAsRead(article.id);
            }}
            disabled={isRead}
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
            {isRead ? 'Artigo Concluído ✓' : 'Marcar como Lido (+10 XP)'}
          </button>
        </div>
      </div>
    </div>
  );
}
