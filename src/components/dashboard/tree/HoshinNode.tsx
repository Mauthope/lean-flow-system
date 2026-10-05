'use client';

import React from 'react';
import { Target } from 'lucide-react';
import { HoshinKanriNode } from '@/lib/treeService';

interface HoshinNodeProps {
  node: HoshinKanriNode;
}

export function HoshinNode({ node }: HoshinNodeProps) {
  return (
    <div
      className="glow-card"
      style={{
        width: '560px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '2px solid rgba(6, 182, 212, 0.5)',
        boxShadow: '0 8px 32px rgba(6, 182, 212, 0.22)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          color: '#22d3ee',
          fontSize: '0.71875rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        <Target size={13} />
        <span>NÍVEL 1 • HOSHIN KANRI {node.year !== 'todos' ? node.year : ''}</span>
      </div>

      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'var(--font-heading)',
          margin: '0.25rem 0',
        }}
      >
        Diretrizes da Alta Gerência
      </h2>

      <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 1rem' }}>
        Convergência Estratégica e Atingimento de Metas Corporativas
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          backgroundColor: 'rgba(6, 182, 212, 0.06)',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid rgba(6, 182, 212, 0.2)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#22d3ee' }}>
            {node.overallFulfillmentPercent}%
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            Atendimento Médio
          </div>
        </div>
        <div style={{ height: '36px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            {node.totalObjectivesCount}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            Diretrizes Ativas
          </div>
        </div>
        <div style={{ height: '36px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
            {node.totalAlignedProjectsCount}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            Projetos Alinhados
          </div>
        </div>
      </div>
    </div>
  );
}
