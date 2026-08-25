'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft, Wrench, Shield, Activity, Sparkles, Clock, AlertCircle } from 'lucide-react';

export default function AdminTPMPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/admin/dashboard" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} color="#22d3ee" /> Painel Principal
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  color: '#22d3ee',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                MÓDULO EM DESENVOLVIMENTO
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.2rem 0 0 0', fontFamily: 'var(--font-heading)' }}>
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
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            color: '#22d3ee',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <Settings size={32} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Módulo de TPM em Preparação
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#94a3b8', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Este módulo está reservado para a gestão dos 8 Pilares do TPM, incluindo Manutenção Autônoma,
          Manutenção Planejada, Gestão Prévia de Equipamentos, OEE e Eliminação de Quebras Zero.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            maxWidth: '750px',
            margin: '0 auto 2rem',
            textAlign: 'left',
          }}
        >
          <div style={{ padding: '1rem', backgroundColor: '#090e1a', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>🛠️ Manutenção Autônoma</strong>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Checklists diários e inspeções preventivas dos operadores.</span>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#090e1a', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>📊 Indicadores OEE / MTBF / MTTR</strong>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Métricas de disponibilidade e eficiência global de máquinas.</span>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#090e1a', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>🔴 Gestão de Etiquetas & Anomalias</strong>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Quadro visual de pendências mecânicas e elétricas.</span>
          </div>
        </div>

        <Link href="/admin/dashboard" className="btn btn-primary btn-sm">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
