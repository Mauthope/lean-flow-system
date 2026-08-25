'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, ArrowLeft, Sparkles, MessageSquare, Award, Flame } from 'lucide-react';

export default function AdminCanalKaizenPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/admin/dashboard" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Painel Principal
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
                MÓDULO EM DESENVOLVIMENTO
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0.2rem 0 0 0' }}>
              Canal Kaizen
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
          <Radio size={32} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Canal Kaizen em Preparação
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Espaço dedicado para compartilhamento de boas práticas, mural de conquistas, antes/depois das células
          e comunicação direta entre equipes de melhoria contínua da empresa.
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
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>📸 Mural Antes & Depois</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Exposição visual das transformações nos postos de trabalho.</span>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>🏆 Reconhecimento & Destaques</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Celebração dos operadores e agentes com maiores entregas de ROI.</span>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>📢 Informativos & Lições Aprendidas</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Disseminação de padrões e Lições Ponto a Ponto (LPP).</span>
          </div>
        </div>

        <Link href="/admin/dashboard" className="btn btn-primary btn-sm">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
