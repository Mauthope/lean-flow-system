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
              backgroundColor: '#fefce8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lightbulb size={26} color="#ca8a04" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Guia dos 8 Desperdícios Lean (Muda)
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
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
              borderLeft: `6px solid ${item.color}`,
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
                    color: item.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Desperdício #{key}
                </span>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
              </div>

              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                {item.label}
              </h2>
              <p style={{ fontSize: '0.84375rem', color: '#475569', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.78125rem',
                color: '#334155',
              }}
            >
              <strong>💡 Ação Típica:</strong> Redução de lote, 5S, balanceamento e padronização (SOP).
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
