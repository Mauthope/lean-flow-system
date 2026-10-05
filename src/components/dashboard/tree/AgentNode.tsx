'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AgentNode as AgentNodeType } from '@/lib/treeService';
import { LeanAction } from '@/lib/types';

interface AgentNodeProps {
  agent: AgentNodeType;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenProjects: (title: string, subtitle: string, value: number, projects: LeanAction[]) => void;
}

export function AgentNode({ agent, isExpanded, onToggle, onOpenProjects }: AgentNodeProps) {
  const initials = agent.agentName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="glow-card"
      style={{
        width: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: '14px',
        padding: '1.25rem',
        border: '2px solid rgba(139, 92, 246, 0.45)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#a78bfa',
            letterSpacing: '0.04em',
          }}
        >
          NÍVEL 3 • AGENTE LEAN
        </span>
        <span
          style={{
            fontSize: '0.71875rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: 'rgba(139, 92, 246, 0.25)',
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
          }}
        >
          {agent.percentageOfEntity}% da Entidade
        </span>
      </div>

      {/* Identificação do Agente */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
            flexShrink: 0,
            fontFamily: 'var(--font-heading)',
          }}
        >
          {initials}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {agent.agentName}
          </h3>
          <p
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              margin: '0.15rem 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {agent.jobTitle || 'Agente de Melhoria Contínua'}
          </p>
        </div>
      </div>

      {/* Métricas do Agente */}
      <div
        style={{
          marginTop: '0.85rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: '#c4b5fd', textTransform: 'uppercase' }}>
            Total do Agente
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'var(--font-heading)' }}>
            {formatCurrency(agent.value)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            Projetos
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
            {agent.projectCount}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.75rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: '#22d3ee',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: 0,
          }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{isExpanded ? 'Recolher Setores' : `Ver ${agent.sectors.length} Setor(es)`}</span>
        </button>

        {agent.projects.length > 0 && (
          <button
            onClick={() =>
              onOpenProjects(
                agent.agentName,
                `Projetos conduzidos pelo agente (${agent.projectCount})`,
                agent.value,
                agent.projects
              )
            }
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.71875rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Ver Projetos
          </button>
        )}
      </div>
    </div>
  );
}
