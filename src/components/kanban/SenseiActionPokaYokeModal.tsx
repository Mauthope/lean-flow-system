'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ActionQualityEvaluation } from '@/lib/types';
import { Sparkles, AlertTriangle, Edit3, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import { evaluateActionQuality } from '@/services/geminiService';

interface SenseiActionPokaYokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  evaluation: ActionQualityEvaluation | null;
  onAdopt: (improvedText: string) => void;
  itemTypeLabel?: string; // ex: "Atividade 5W2H" ou "Ação Lean"
  context?: { sectorName?: string; projectName?: string };
}

export const SenseiActionPokaYokeModal: React.FC<SenseiActionPokaYokeModalProps> = ({
  isOpen,
  onClose,
  originalText,
  evaluation,
  onAdopt,
  itemTypeLabel = 'Atividade 5W2H',
  context,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customText, setCustomText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && evaluation) {
      setIsCustomizing(false);
      setCustomText(evaluation.suggestedText || originalText);
      setValidationError(null);
    }
  }, [isOpen, evaluation, originalText]);

  if (!evaluation) return null;

  const handleValidateAndSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) {
      setValidationError('Por favor, informe a descrição detalhada da ação.');
      return;
    }

    const check = evaluateActionQuality(customText.trim(), context);
    if (check.isGeneric) {
      setValidationError(
        `A descrição ainda está genérica (${check.score}/100): ${check.reason} Adicione o documento (POP/SOP/OS), ferramenta ou método observável.`
      );
      return;
    }

    setValidationError(null);
    onAdopt(customText.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Poka-Yoke do Sensei: Ação Bloqueada para Auditoria"
      subtitle="Conformidade estrita IATF 16949 / SGQ — Ações genéricas não podem ser salvas sem adequação"
      maxWidth="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner de Diagnóstico do Sensei com Alerta Rígido */}
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1.5px solid rgba(239, 68, 68, 0.45)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} color="#f87171" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>
                ⛔ Bloqueio de Qualidade: Ação Banal Reprovada
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.25)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                }}
              >
                Zero NCs em Auditoria
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: '0.35rem 0 0 0', lineHeight: 1.45 }}>
              {evaluation.reason} Para erradicar Não Conformidades de auditoria, <strong>é obrigatório adequar o texto</strong> com um padrão mensurável antes de gravar no sistema.
            </p>
          </div>
        </div>

        {/* Comparativo ou Editor Customizado */}
        {!isCustomizing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Texto Original Reprovado */}
            <div
              style={{
                backgroundColor: '#090e1a',
                borderRadius: '10px',
                padding: '0.85rem 1.1rem',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 800 }}>
                ❌ Sua redação original ({itemTypeLabel} - Reprovada):
              </span>
              <div style={{ fontSize: '0.9rem', color: '#fca5a5', fontWeight: 600, marginTop: '0.25rem', textDecoration: 'line-through' }}>
                &quot;{originalText}&quot;
              </div>
            </div>

            {/* Sugestão Pronta do Sensei */}
            <div
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                borderRadius: '12px',
                padding: '1.1rem 1.25rem',
                border: '1.5px solid rgba(6, 182, 212, 0.5)',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22d3ee', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <Sparkles size={14} color="#22d3ee" />
                  <span>Sugestão Técnica Enriquecida pelo Sensei (Padrão 5W2H):</span>
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                  ✓ 100% Auditável & Concreta
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.45 }}>
                &quot;{evaluation.suggestedText}&quot;
              </p>
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
                  📋 Diretrizes de Conformidade para o Plano de Ação:
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
          </div>
        ) : (
          /* Modo de Edição e Adequação Manual */
          <form onSubmit={handleValidateAndSaveCustom} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label className="form-label" style={{ color: '#f8fafc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={14} color="#22d3ee" />
                Descreva a Ação no Padrão Lean (O quê, Como e Procedimento de Controle):
              </label>
              <textarea
                className="form-textarea"
                rows={4}
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Ex: Instalar dispositivo Poka-Yoke no cabeçote e treinar operadores conforme procedimento SOP-08 com validação prática no Gemba..."
                required
                style={{
                  backgroundColor: '#090e1a',
                  color: '#ffffff',
                  borderColor: validationError ? '#ef4444' : 'rgba(6, 182, 212, 0.5)',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                }}
              />
            </div>

            {validationError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.78125rem',
                  color: '#fca5a5',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.45rem',
                }}
              >
                <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{validationError}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78125rem' }}
              >
                <ArrowLeft size={13} /> Voltar à Sugestão Pronta
              </button>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={14} /> Validar & Salvar Ação Adequada
              </button>
            </div>
          </form>
        )}

        {/* Botões de Ação Principais (Sem opção de manter genérica) */}
        {!isCustomizing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.78125rem',
                color: '#94a3b8',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
              title="Cancelar e voltar para editar o formulário"
            >
              Cancelar e Reescrever
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => {
                  setCustomText(evaluation.suggestedText || originalText);
                  setIsCustomizing(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8125rem',
                  color: '#cbd5e1',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Edit3 size={14} /> Ajustar / Escrever Minha Versão
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
                  padding: '0.55rem 1.15rem',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
                }}
              >
                <Sparkles size={15} /> Adotar Sugestão do Sensei (Recomendado)
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
