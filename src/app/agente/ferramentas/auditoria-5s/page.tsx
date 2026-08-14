'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  ArrowLeft,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface SenseItem {
  id: string;
  sense: string;
  question: string;
  checked: boolean;
}

const INITIAL_QUESTIONS: SenseItem[] = [
  {
    id: 's1_1',
    sense: '1. Seiri (Utilização / Descarte)',
    question: 'Existem apenas ferramentas e insumos estritamente necessários no posto de trabalho?',
    checked: true,
  },
  {
    id: 's1_2',
    sense: '1. Seiri (Utilização / Descarte)',
    question: 'Itens quebrados, obsoletos ou sem uso foram identificados com etiqueta vermelha e descartados?',
    checked: true,
  },
  {
    id: 's2_1',
    sense: '2. Seiton (Organização / Ordenação)',
    question: 'Cada ferramenta possui seu local claramente demarcado (painel sombreado / gaveta etiquetada)?',
    checked: true,
  },
  {
    id: 's2_2',
    sense: '2. Seiton (Organização / Ordenação)',
    question: 'Os itens mais frequentes estão posicionados no raio de alcance ergonômico do operador?',
    checked: false,
  },
  {
    id: 's3_1',
    sense: '3. Seiso (Limpeza / Inspeção)',
    question: 'O chão, a bancada e a carcaça da máquina estão limpos e sem vazamentos de óleo/líquidos?',
    checked: true,
  },
  {
    id: 's3_2',
    sense: '3. Seiso (Limpeza / Inspeção)',
    question: 'A limpeza foi utilizada como oportunidade para inspecionar parafusos soltos e cabos desgastados?',
    checked: false,
  },
  {
    id: 's4_1',
    sense: '4. Seiketsu (Padronização / Saúde)',
    question: 'O procedimento operacional padrão (SOP) e as instruções visuais estão fixados e legíveis?',
    checked: true,
  },
  {
    id: 's5_1',
    sense: '5. Shitsuke (Disciplina / Autodisciplina)',
    question: 'A rotina diária de 5 minutos de 5S está sendo cumprida no encerramento de cada turno?',
    checked: true,
  },
];

export default function Auditoria5SPage() {
  const [questions, setQuestions] = useState<SenseItem[]>(INITIAL_QUESTIONS);
  const [sectorChecked, setSectorChecked] = useState('Montagem & Operações');

  const total = questions.length;
  const checkedCount = questions.filter((q) => q.checked).length;
  const complianceScore = Math.round((checkedCount / total) * 100);

  const toggleCheck = (id: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          return { ...q, checked: !q.checked };
        }
        return q;
      })
    );
  };

  const handleReset = () => {
    setQuestions(questions.map((q) => ({ ...q, checked: false })));
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Back Button */}
      <Link
        href="/agente/ferramentas"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#2563eb',
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
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckSquare size={26} color="#10b981" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Checklist Rápido de Auditoria 5S
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
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
          backgroundColor: complianceScore >= 80 ? '#ecfdf5' : complianceScore >= 60 ? '#fffbeb' : '#fef2f2',
          border: `2px solid ${complianceScore >= 80 ? '#10b981' : complianceScore >= 60 ? '#f59e0b' : '#ef4444'}`,
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
              color: complianceScore >= 80 ? '#047857' : complianceScore >= 60 ? '#b45309' : '#b91c1c',
            }}
          >
            Índice de Conformidade 5S do Posto
          </span>
          <p
            style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              color: complianceScore >= 80 ? '#065f46' : complianceScore >= 60 ? '#78350f' : '#991b1b',
              marginTop: '0.15rem',
            }}
          >
            {complianceScore}% <span style={{ fontSize: '1rem', fontWeight: 600 }}>({checkedCount}/{total} itens conformes)</span>
          </p>
        </div>

        <div>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              backgroundColor: complianceScore >= 80 ? '#10b981' : complianceScore >= 60 ? '#f59e0b' : '#ef4444',
              color: '#ffffff',
            }}
          >
            {complianceScore >= 80 ? 'Posto 5S Excelente' : complianceScore >= 60 ? 'Atenção Necessária' : 'Crítico / Não Conforme'}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Itens de Verificação por Senso
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => toggleCheck(q.id)}
              style={{
                backgroundColor: q.checked ? '#f0fdf4' : '#ffffff',
                border: q.checked ? '1px solid #86efac' : '1px solid #e2e8f0',
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
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    color: q.checked ? '#166534' : '#64748b',
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
                    fontWeight: 600,
                    color: q.checked ? '#14532d' : '#0f172a',
                    lineHeight: 1.4,
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
