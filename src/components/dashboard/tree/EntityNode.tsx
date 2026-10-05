'use client';

import React from 'react';
import { Factory } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { EntityNode as EntityNodeType } from '@/lib/treeService';

interface EntityNodeProps {
  entity: EntityNodeType;
}

export function EntityNode({ entity }: EntityNodeProps) {
  return (
    <div
      className="glow-card"
      style={{
        width: '620px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '2px solid rgba(16, 185, 129, 0.5)',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.22)',
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
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          fontSize: '0.71875rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        <Factory size={13} />
        <span>NÍVEL 2 • ENTIDADE INDUSTRIAL</span>
      </div>

      <h2
        style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'var(--font-heading)',
          margin: '0.25rem 0',
        }}
      >
        {entity.name}
      </h2>

      {entity.cnpjOrCode && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.85rem' }}>
          Código / CNPJ: {entity.cnpjOrCode}
        </p>
      )}

      {/* Caixa em Destaque do Total Homologado */}
      <div
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          marginTop: '0.5rem',
        }}
      >
        <div style={{ fontSize: '0.71875rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Total em Reais Homologados no Ano
        </div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#10b981',
            fontFamily: 'var(--font-heading)',
            marginTop: '0.25rem',
          }}
        >
          {formatCurrency(entity.totalHomologatedValue)}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            marginTop: '0.75rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78125rem',
            color: '#cbd5e1',
          }}
        >
          <span>
            <strong>{entity.totalProjectsCount}</strong> Projetos Homologados
          </span>
          <span>•</span>
          <span>
            <strong>{entity.totalHoursSaved}h</strong> de Trabalho Recuperadas
          </span>
          <span>•</span>
          <span>
            <strong>{entity.agents.length}</strong> Agentes em Atuação
          </span>
        </div>
      </div>
    </div>
  );
}
