'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ActionQualityEvaluation } from '@/lib/types';
import { Sparkles, AlertTriangle, Edit3 } from 'lucide-react';

interface SenseiActionPokaYokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  evaluation: ActionQualityEvaluation | null;
  onAdopt: (improvedText: string) => void;
  onProceedAnyway?: () => void;
  itemTypeLabel?: string; // ex: "Atividade 5W2H" ou "Ação Lean"
}

export const SenseiActionPokaYokeModal: React.FC<SenseiActionPokaYokeModalProps> = ({
  isOpen,
  onClose,
  originalText,
  evaluation,
  onAdopt,
  onProceedAnyway,
  itemTypeLabel = 'Atividade 5W2H',
}) => {
  if (!evaluation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Poka-Yoke do Sensei: Qualidade de Ação no Padrão Lean"
      subtitle="Garantia de conformidade para auditorias internas de SGQ, IATF 16949 e WCM"
      maxWidth="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner de Diagnóstico do Sensei */}
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} color="#fbbf24" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                ⚠️ Ação Muito Genérica Detectada
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                }}
              >
                Risco de NC em Auditoria
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: '0.35rem 0 0 0', lineHeight: 1.45 }}>
              {evaluation.reason}
            </p>
          </div>
        </div>

        {/* Comparativo: Original vs Sugestão Enriquecida */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Original */}
          <div
            style={{
              backgroundColor: '#090e1a',
              borderRadius: '10px',
              padding: '0.85rem 1.1rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Sua descrição atual ({itemTypeLabel}):
            </span>
            <div style={{ fontSize: '0.9rem', color: '#f87171', fontWeight: 600, marginTop: '0.25rem', textDecoration: 'line-through' }}>
              &quot;{originalText}&quot;
            </div>
          </div>

          {/* Sugestão do Sensei */}
          <div
            style={{
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              border: '1.5px solid rgba(6, 182, 212, 0.45)',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22d3ee', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <Sparkles size={14} color="#22d3ee" />
                <span>Sugestão Técnica Enriquecida pelo Sensei (Padrão 5W2H):</span>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                ✓ Auditável & Concreta
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.45 }}>
              &quot;{evaluation.suggestedText}&quot;
            </p>
          </div>
        </div>

        {/* Dicas de Auditoria */}
        {evaluation.tips && evaluation.tips.length > 0 && (
          <div
            style={{
              backgroundColor: '#0c121e',
              borderRadius: '10px',
              padding: '0.85rem 1.1rem',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              📋 Como evitar apontamentos em auditorias internas:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {evaluation.tips.map((tip, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <span style={{ color: '#22d3ee', fontWeight: 900 }}>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {onProceedAnyway ? (
            <button
              type="button"
              onClick={onProceedAnyway}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
              title="Salvar sem aprimoramento técnico (pode gerar questionamento em auditoria)"
            >
              Manter Original e Salvar
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                color: '#cbd5e1',
              }}
            >
              <Edit3 size={14} /> Refinar Manualmente
            </button>

            <button
              type="button"
              onClick={() => onAdopt(evaluation.suggestedText)}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.8125rem',
                fontWeight: 800,
                padding: '0.55rem 1.1rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
              }}
            >
              <Sparkles size={15} /> Adotar Sugestão do Sensei (Recomendado)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
