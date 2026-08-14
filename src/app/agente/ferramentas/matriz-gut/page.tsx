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
    if (score >= 60) return { label: 'Prioridade Crítica (Ação Imediata)', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' };
    if (score >= 30) return { label: 'Prioridade Alta / Média (Planejar)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    return { label: 'Prioridade Baixa (Monitorar)', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
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
              backgroundColor: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Target size={26} color="#ea580c" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Matriz GUT de Priorização
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Classificação objetiva de Gravidade × Urgência × Tendência (1 a 125)
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>
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
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label className="form-label" style={{ color: '#0f172a', fontWeight: 700 }}>
              🔴 Gravidade (G): {gravidade}
            </label>
            <p style={{ fontSize: '0.725rem', color: '#64748b', marginBottom: '0.5rem' }}>
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
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label className="form-label" style={{ color: '#0f172a', fontWeight: 700 }}>
              🟡 Urgência (U): {urgencia}
            </label>
            <p style={{ fontSize: '0.725rem', color: '#64748b', marginBottom: '0.5rem' }}>
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
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label className="form-label" style={{ color: '#0f172a', fontWeight: 700 }}>
              🔵 Tendência (T): {tendencia}
            </label>
            <p style={{ fontSize: '0.725rem', color: '#64748b', marginBottom: '0.5rem' }}>
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
            border: `2px solid ${priority.border}`,
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
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: priority.color, lineHeight: 1.1, marginTop: '0.2rem' }}>
              {gutScore} <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b' }}>/ 125</span>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: 800,
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                backgroundColor: priority.color,
                color: '#ffffff',
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
