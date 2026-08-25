'use client';

import React from 'react';
import Link from 'next/link';
import { Lightbulb, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { WASTE_CATEGORIES } from '@/lib/utils';

export default function OitoDesperdiciosPage() {
  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
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
            <Lightbulb size={26} color="#fbbf24" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Guia dos 8 Desperdícios Lean (Muda)
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Referência operacional para identificar oportunidades de melhoria no posto de trabalho
            </p>
          </div>
        </div>
      </div>

      {/* 8 Waste Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {Object.entries(WASTE_CATEGORIES).map(([key, item]) => (
          <div
            key={key}
            className="card"
            style={{
              padding: '1.5rem',
              borderLeft: `5px solid ${item.color || '#22d3ee'}`,
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              borderRadius: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    color: item.color || '#22d3ee',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Desperdício #{key}
                </span>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
              </div>

              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                {item.label}
              </h2>
              <p style={{ fontSize: '0.84375rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#090e1a',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.78125rem',
                color: '#94a3b8',
              }}
            >
              <strong style={{ color: '#ffffff' }}>💡 Ação Típica:</strong> Redução de lote, 5S, balanceamento e padronização (SOP).
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
