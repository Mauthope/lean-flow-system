'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft } from 'lucide-react';

export default function AgenteTPMPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/agente/kanban" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Meu Kanban
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                EM BREVE
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0.2rem 0 0 0' }}>
              TPM (Manutenção Produtiva Total)
            </h1>
          </div>
        </div>
      </div>

      {/* Main Placeholder Card */}
      <div
        className="card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <Settings size={32} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Painel Operacional de TPM em Construção
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Em breve você poderá registrar anomalias de máquina, preencher checklists de manutenção autônoma
          e acompanhar as inspeções preventivas do seu posto de trabalho.
        </p>

        <Link href="/agente/kanban" className="btn btn-primary btn-sm">
          Voltar ao Meu Kanban
        </Link>
      </div>
    </div>
  );
}
