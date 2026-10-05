'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { SavingsTypeNode as SavingsTypeNodeType, SAVINGS_TYPE_CONFIG } from '@/lib/treeService';
import { LeanAction } from '@/lib/types';

interface SavingsTypeNodeProps {
  type: SavingsTypeNodeType;
  sectorName: string;
  agentName: string;
  onOpenProjects: (title: string, subtitle: string, value: number, projects: LeanAction[]) => void;
}

export function SavingsTypeNode({
  type,
  sectorName,
  agentName,
  onOpenProjects,
}: SavingsTypeNodeProps) {
  const typeConfig = SAVINGS_TYPE_CONFIG[type.key] || {
    label: type.label,
    color: '#06b6d4',
    description: '',
  };

  return (
    <div
      className="glow-card"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        borderRadius: '8px',
        padding: '0.65rem 0.85rem',
        border: `1px solid ${typeConfig.color}40`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: typeConfig.color,
            }}
          />
          <span
            style={{
              fontSize: '0.78125rem',
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            {type.label}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.84375rem',
            fontWeight: 800,
            color: typeConfig.color,
            fontFamily: 'var(--font-heading)',
          }}
        >
          {formatCurrency(type.value)}
        </span>
      </div>

      {/* Barra de Proporção no Setor */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.35rem',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${type.percentageOfSector}%`,
              height: '100%',
              backgroundColor: typeConfig.color,
            }}
          />
        </div>
        <span
          style={{
            fontSize: '0.6875rem',
            color: '#94a3b8',
            minWidth: '38px',
            textAlign: 'right',
          }}
        >
          {type.percentageOfSector}%
        </span>
      </div>

      {type.projects.length > 0 && (
        <div
          style={{
            marginTop: '0.35rem',
            textAlign: 'right',
          }}
        >
          <button
            onClick={() =>
              onOpenProjects(
                `${type.label} • ${sectorName}`,
                `Agente: ${agentName}`,
                type.value,
                type.projects
              )
            }
            style={{
              background: 'none',
              border: 'none',
              color: '#22d3ee',
              fontSize: '0.6875rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Ver Projetos ({type.projectCount})
          </button>
        </div>
      )}
    </div>
  );
}
