'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export default function MatrizGutPage() {
  const [demandName, setDemandName] = useState('Vazamento de óleo hidráulico na Prensa 04');
  const [gravidade, setGravidade] = useState<number>(4);
  const [urgencia, setUrgencia] = useState<number>(5);
  const [tendencia, setTendencia] = useState<number>(4);

  const gutScore = gravidade * urgencia * tendencia;

  const getPriorityLevel = (score: number) => {
    if (score >= 60) return { label: 'Prioridade Crítica (Ação Imediata)', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' };
    if (score >= 30) return { label: 'Prioridade Alta / Média (Planejar)', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' };
    return { label: 'Prioridade Baixa (Monitorar)', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' };
  };

  const priority = getPriorityLevel(gutScore);

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
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Target size={26} color="#fbbf24" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Matriz GUT de Priorização
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Classificação objetiva de Gravidade × Urgência × Tendência (1 a 125)
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            Título do Problema / Oportunidade Lean:
          </label>
          <input
            type="text"
            className="form-control"
            value={demandName}
            onChange={(e) => setDemandName(e.target.value)}
            style={{ fontWeight: 600 }}
          />
        </div>

        {/* 3 Selectors (G, U, T) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Gravidade */}
          <div style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <label className="form-label" style={{ color: '#f87171', fontWeight: 800 }}>
              🔴 Gravidade (G): {gravidade}
            </label>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Qual o impacto financeiro, de segurança ou qualidade se nada for feito?
            </p>
            <select
              className="form-select"
              value={gravidade}
              onChange={(e) => setGravidade(parseInt(e.target.value))}
            >
              <option value={1}>1 - Sem gravidade (Sem danos)</option>
              <option value={2}>2 - Pouco grave (Danos leves)</option>
              <option value={3}>3 - Grave (Perda considerável)</option>
              <option value={4}>4 - Muito grave (Parada crítica)</option>
              <option value={5}>5 - Extremamente grave (Risco fatal/alto prejuízo)</option>
            </select>
          </div>

          {/* Urgência */}
          <div style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <label className="form-label" style={{ color: '#fbbf24', fontWeight: 800 }}>
              🟡 Urgência (U): {urgencia}
            </label>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              O tempo que temos para resolver antes que cause transtorno.
            </p>
            <select
              className="form-select"
              value={urgencia}
              onChange={(e) => setUrgencia(parseInt(e.target.value))}
            >
              <option value={1}>1 - Pode esperar (Sem pressa)</option>
              <option value={2}>2 - Pouco urgente (Pode agendar)</option>
              <option value={3}>3 - Urgente (Resolver em breve)</option>
              <option value={4}>4 - Muito urgente (Resolver hoje)</option>
              <option value={5}>5 - Imediata (Exige ação agora)</option>
            </select>
          </div>

          {/* Tendência */}
          <div style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <label className="form-label" style={{ color: '#38bdf8', fontWeight: 800 }}>
              🔵 Tendência (T): {tendencia}
            </label>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Se nada for feito, o problema vai crescer ou permanecer igual?
            </p>
            <select
              className="form-select"
              value={tendencia}
              onChange={(e) => setTendencia(parseInt(e.target.value))}
            >
              <option value={1}>1 - Não vai mudar (Estável)</option>
              <option value={2}>2 - Vai piorar a longo prazo</option>
              <option value={3}>3 - Vai piorar a médio prazo</option>
              <option value={4}>4 - Vai piorar em breve</option>
              <option value={5}>5 - Vai piorar rapidamente</option>
            </select>
          </div>
        </div>

        {/* Score & Classification Result */}
        <div
          style={{
            backgroundColor: priority.bg,
            border: `1px solid ${priority.border}`,
            borderRadius: '14px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: priority.color }}>
              Score Final GUT (G × U × T):
            </span>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: priority.color, lineHeight: 1.1, marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              {gutScore} <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8' }}>/ 125</span>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: 800,
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                backgroundColor: priority.bg,
                color: priority.color,
                border: `1px solid ${priority.border}`,
                display: 'inline-block',
              }}
            >
              {priority.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
