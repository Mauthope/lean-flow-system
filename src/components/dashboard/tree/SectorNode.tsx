'use client';

import React from 'react';
import { Building2, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { SectorNode as SectorNodeType } from '@/lib/treeService';
import { LeanAction } from '@/lib/types';

interface SectorNodeProps {
  sector: SectorNodeType;
  agentName: string;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenProjects: (title: string, subtitle: string, value: number, projects: LeanAction[]) => void;
  children?: React.ReactNode;
}

export function SectorNode({
  sector,
  agentName,
  isExpanded,
  onToggle,
  onOpenProjects,
  children,
}: SectorNodeProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Card do Setor */}
      <div
        className="glow-card"
        style={{
          width: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          borderRadius: '12px',
          padding: '1rem',
          border: `1.5px solid ${sector.color || '#06b6d4'}`,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.45rem',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: sector.color || '#06b6d4',
              letterSpacing: '0.04em',
            }}
          >
            NÍVEL 4 • SETOR INDUSTRIAL
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#94a3b8',
            }}
          >
            {sector.percentageOfAgent}% do Agente
          </span>
        </div>

        {/* Nome do Setor e Valor */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Building2 size={16} color={sector.color || '#06b6d4'} />
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>
              {sector.sectorName}
            </span>
          </div>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#38bdf8',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {formatCurrency(sector.value)}
          </span>
        </div>

        {/* Botão de Expandir Tipos */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.65rem',
            paddingTop: '0.55rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              color: '#22d3ee',
              fontSize: '0.71875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: 0,
            }}
          >
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <span>
              {isExpanded ? 'Recolher Tipos' : `Ver ${sector.savingsTypes.length} Tipo(s) de Ganho`}
            </span>
          </button>

          {sector.projects.length > 0 && (
            <button
              onClick={() =>
                onOpenProjects(
                  `${sector.sectorName} • ${agentName}`,
                  `Projetos homologados neste setor (${sector.projectCount})`,
                  sector.value,
                  sector.projects
                )
              }
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.7rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Ver Projetos ({sector.projectCount})
            </button>
          )}
        </div>
      </div>

      {/* Subnível: Tipos de Economia */}
      {isExpanded && children && (
        <div
          style={{
            width: '92%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              width: '2px',
              height: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }}
          />
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
