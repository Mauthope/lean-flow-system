'use client';

import React from 'react';
import { Target, Factory, Users, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TreeDashboardData } from '@/lib/treeService';

interface TreeKpisProps {
  data: TreeDashboardData;
}

export function TreeKpis({ data }: TreeKpisProps) {
  const { hoshinKanri, totalHomologatedValue, totalAgentsCount, totalSectorsCount, totalProjectsCount } = data;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      {/* KPI 1: Hoshin Kanri */}
      <div
        className="glow-card"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          border: '1px solid rgba(6, 182, 212, 0.28)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Hoshin Kanri
          </span>
          <div style={{ padding: '0.35rem', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <Target size={15} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-heading)' }}>
            {hoshinKanri.overallFulfillmentPercent}%
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>atendimento meta</span>
        </div>
        <div
          style={{
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '2px',
            marginTop: '0.65rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${hoshinKanri.overallFulfillmentPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)',
            }}
          />
        </div>
      </div>

      {/* KPI 2: Entidade Total R$ */}
      <div
        className="glow-card"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          border: '1px solid rgba(16, 185, 129, 0.28)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Entidade Industrial
          </span>
          <div style={{ padding: '0.35rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Factory size={15} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
            {formatCurrency(totalHomologatedValue)}
          </span>
        </div>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.71875rem', color: '#94a3b8' }}>
          Total Homologado no Ano
        </p>
      </div>

      {/* KPI 3: Agentes Ativos */}
      <div
        className="glow-card"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          border: '1px solid rgba(139, 92, 246, 0.28)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Agentes Lean
          </span>
          <div style={{ padding: '0.35rem', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <Users size={15} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'var(--font-heading)' }}>
            {totalAgentsCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>especialistas</span>
        </div>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.71875rem', color: '#94a3b8' }}>
          {totalProjectsCount} projetos conduzidos
        </p>
      </div>

      {/* KPI 4: Setores */}
      <div
        className="glow-card"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          border: '1px solid rgba(245, 158, 11, 0.28)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Setores Fabris
          </span>
          <div style={{ padding: '0.35rem', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Building2 size={15} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>
            {totalSectorsCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>áreas atendidas</span>
        </div>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.71875rem', color: '#94a3b8' }}>
          Ganhos desdobrados no Gemba
        </p>
      </div>
    </div>
  );
}
