'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AuditItem {
  id: string;
  sense: string;
  question: string;
  checked: boolean;
}

const DEFAULT_QUESTIONS: AuditItem[] = [
  // 1. Seiri (Utilização)
  {
    id: 's1_1',
    sense: '1. Seiri (Utilização)',
    question: 'Apenas ferramentas, gabaritos e materiais estritamente necessários estão no posto de trabalho?',
    checked: true,
  },
  {
    id: 's1_2',
    sense: '1. Seiri (Utilização)',
    question: 'Itens quebrados, obsoletos ou sem uso foram devidamente descartados ou movidos para a área de descarte?',
    checked: true,
  },

  // 2. Seiton (Organização)
  {
    id: 's2_1',
    sense: '2. Seiton (Organização)',
    question: 'Cada ferramenta possui seu local demarcado (quadro de sombra / gaveta identificada) e de fácil alcance?',
    checked: false,
  },
  {
    id: 's2_2',
    sense: '2. Seiton (Organização)',
    question: 'Materiais em processo (WIP) estão em áreas demarcadas no chão e identificados com etiquetas de lote?',
    checked: true,
  },

  // 3. Seiso (Limpeza)
  {
    id: 's3_1',
    sense: '3. Seiso (Limpeza)',
    question: 'A máquina/bancada está livre de óleo, cavacos, pó e resíduos acumulados?',
    checked: true,
  },
  {
    id: 's3_2',
    sense: '3. Seiso (Limpeza)',
    question: 'Fontes de sujeira ou vazamentos foram identificadas e contidas na raiz?',
    checked: false,
  },

  // 4. Seiketsu (Padronização)
  {
    id: 's4_1',
    sense: '4. Seiketsu (Padronização)',
    question: 'A Folha de Instrução Padrão (SOP/POP) está afixada no posto e visível ao operador?',
    checked: true,
  },
  {
    id: 's4_2',
    sense: '4. Seiketsu (Padronização)',
    question: 'Controles visuais de nível mínimo/máximo e rotinas de manutenção autônoma (TPM) estão claros?',
    checked: false,
  },

  // 5. Shitsuke (Disciplina)
  {
    id: 's5_1',
    sense: '5. Shitsuke (Disciplina)',
    question: 'Os operadores utilizam os EPIs obrigatórios corretamente durante toda a jornada?',
    checked: true,
  },
  {
    id: 's5_2',
    sense: '5. Shitsuke (Disciplina)',
    question: 'A rotina de limpeza e organização de 5 minutos ao final do turno é cumprida rigorosamente?',
    checked: true,
  },
];

export default function Auditoria5SPage() {
  const [questions, setQuestions] = useState<AuditItem[]>(DEFAULT_QUESTIONS);

  const toggleCheck = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, checked: !q.checked } : q))
    );
  };

  const handleReset = () => {
    setQuestions(DEFAULT_QUESTIONS.map((q) => ({ ...q, checked: false })));
  };

  const total = questions.length;
  const checkedCount = questions.filter((q) => q.checked).length;
  const complianceScore = Math.round((checkedCount / total) * 100);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Back Button */}
      <Link
        href="/agente/ferramentas"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#22d3ee',
          fontSize: '0.875rem',
          fontWeight: 700,
          textDecoration: 'none',
          width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} /> Voltar para Todas as Ferramentas
      </Link>

      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckSquare size={26} color="#34d399" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Checklist Rápido de Auditoria 5S
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Avaliação prática dos 5 Sensos diretamente no posto de trabalho
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RotateCcw size={14} /> Limpar Checklist
        </button>
      </div>

      {/* Compliance Score Hero */}
      <div
        style={{
          backgroundColor: complianceScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : complianceScore >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${complianceScore >= 80 ? 'rgba(16, 185, 129, 0.4)' : complianceScore >= 60 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: complianceScore >= 80 ? '#34d399' : complianceScore >= 60 ? '#fbbf24' : '#f87171',
            }}
          >
            Índice de Conformidade 5S do Posto
          </span>
          <p
            style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              color: complianceScore >= 80 ? '#34d399' : complianceScore >= 60 ? '#fbbf24' : '#f87171',
              marginTop: '0.15rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {complianceScore}% <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>({checkedCount}/{total} itens conformes)</span>
          </p>
        </div>

        <div>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              backgroundColor: complianceScore >= 80 ? 'rgba(16, 185, 129, 0.25)' : complianceScore >= 60 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              color: complianceScore >= 80 ? '#34d399' : complianceScore >= 60 ? '#fbbf24' : '#f87171',
              border: `1px solid ${complianceScore >= 80 ? 'rgba(16, 185, 129, 0.5)' : complianceScore >= 60 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            }}
          >
            {complianceScore >= 80 ? 'Posto 5S Excelente' : complianceScore >= 60 ? 'Atenção Necessária' : 'Crítico / Não Conforme'}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            Itens de Verificação por Senso
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => toggleCheck(q.id)}
              style={{
                backgroundColor: q.checked ? 'rgba(16, 185, 129, 0.12)' : '#090e1a',
                border: q.checked ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={q.checked}
                onChange={() => {}}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#06b6d4' }}
              />
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    color: q.checked ? '#34d399' : '#94a3b8',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '0.2rem',
                  }}
                >
                  {q.sense}
                </span>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: q.checked ? '#ffffff' : '#cbd5e1',
                    lineHeight: 1.45,
                    margin: 0,
                    textDecoration: q.checked ? 'none' : 'none',
                  }}
                >
                  {q.question}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
