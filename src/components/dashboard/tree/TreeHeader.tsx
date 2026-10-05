'use client';

import React from 'react';
import { Calendar, Users, Building2, Network, ListTree, Maximize2, Minimize2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TreeHeaderProps {
  selectedYear: number | 'todos';
  availableYears?: number[];
  onYearChange: (year: number | 'todos') => void;
  onlyHomologated?: boolean;
  onOnlyHomologatedChange?: (val: boolean) => void;
  filterAgent: string;
  allAgents: Array<{ id: string; name: string }>;
  onAgentFilterChange: (agent: string) => void;
  filterSector: string;
  allSectors: Array<{ id: string; name: string }>;
  onSectorFilterChange: (sector: string) => void;
  viewMode: 'tree' | 'outline';
  onViewModeChange: (mode: 'tree' | 'outline') => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isDemoData?: boolean;
  entityName?: string;
}

export function TreeHeader({
  selectedYear,
  availableYears = [2024, 2025, 2026],
  onYearChange,
  onlyHomologated = true,
  onOnlyHomologatedChange,
  filterAgent,
  allAgents,
  onAgentFilterChange,
  filterSector,
  allSectors,
  onSectorFilterChange,
  viewMode,
  onViewModeChange,
  onExpandAll,
  onCollapseAll,
  isDemoData,
  entityName,
}: TreeHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}
    >
      {/* Título & Identidade UX Writing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
            color: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(6, 182, 212, 0.35)',
            flexShrink: 0,
          }}
        >
          <Network size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.375rem',
                fontWeight: 800,
                color: 'var(--text-heading, #ffffff)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Árvore de Desdobramento
            </h1>
            {entityName && (
              <span
                style={{
                  fontSize: '0.71875rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  color: '#22d3ee',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                {entityName}
              </span>
            )}
            {isDemoData && (
              <span
                style={{
                  fontSize: '0.71875rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(234, 179, 8, 0.12)',
                  color: '#facc15',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                }}
              >
                Modo Demonstração
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted, #94a3b8)',
              marginTop: '0.2rem',
              margin: 0,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Espinha dorsal Lean: metas Hoshin Kanri conectadas aos setores e ganhos no chão de fábrica.
          </p>
        </div>
      </div>

      {/* Controles e Filtros Rápidos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {/* Seletor de Ciclo / Ano */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'var(--bg-card, #0f172a)',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          }}
        >
          <Calendar size={14} color="#06b6d4" />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Ciclo:</span>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr} style={{ backgroundColor: '#0f172a' }}>
                {yr}
              </option>
            ))}
            <option value="todos" style={{ backgroundColor: '#0f172a' }}>
              Todos os Anos
            </option>
          </select>
        </div>

        {/* Filtro por Agente */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'var(--bg-card, #0f172a)',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          }}
        >
          <Users size={14} color="#8b5cf6" />
          <select
            value={filterAgent}
            onChange={(e) => onAgentFilterChange(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '150px',
            }}
          >
            <option value="todos" style={{ backgroundColor: '#0f172a' }}>
              Todos os Agentes
            </option>
            {allAgents.map((ag) => (
              <option key={ag.id} value={ag.id} style={{ backgroundColor: '#0f172a' }}>
                {ag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Setor */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'var(--bg-card, #0f172a)',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          }}
        >
          <Building2 size={14} color="#10b981" />
          <select
            value={filterSector}
            onChange={(e) => onSectorFilterChange(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '150px',
            }}
          >
            <option value="todos" style={{ backgroundColor: '#0f172a' }}>
              Todos os Setores
            </option>
            {allSectors.map((sec) => (
              <option key={sec.id} value={sec.id} style={{ backgroundColor: '#0f172a' }}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro: Apenas Homologados */}
        {onOnlyHomologatedChange && (
          <button
            type="button"
            onClick={() => onOnlyHomologatedChange(!onlyHomologated)}
            title={onlyHomologated ? 'Exibindo apenas projetos homologados' : 'Exibindo todos os projetos'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: onlyHomologated ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card, #0f172a)',
              border: `1px solid ${onlyHomologated ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
              color: onlyHomologated ? '#34d399' : '#94a3b8',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.78125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={14} />
            <span>{onlyHomologated ? 'Apenas Homologados' : 'Todos os Status'}</span>
          </button>
        )}

        {/* Modo de Visualização */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '8px',
            padding: '0.2rem',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          }}
        >
          <button
            onClick={() => onViewModeChange('tree')}
            title="Visualização em Árvore"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'tree' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: viewMode === 'tree' ? '#22d3ee' : '#94a3b8',
              fontSize: '0.78125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Network size={14} />
            <span>Árvore</span>
          </button>
          <button
            onClick={() => onViewModeChange('outline')}
            title="Visualização em Estrutura WBS"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'outline' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: viewMode === 'outline' ? '#22d3ee' : '#94a3b8',
              fontSize: '0.78125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ListTree size={14} />
            <span>Lista WBS</span>
          </button>
        </div>

        {/* Botões Expandir / Recolher */}
        <button
          onClick={onExpandAll}
          title="Expandir todos os ramos"
          style={{
            padding: '0.45rem 0.65rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card, #0f172a)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            color: '#94a3b8',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Maximize2 size={13} />
          <span>Expandir</span>
        </button>
        <button
          onClick={onCollapseAll}
          title="Recolher todos os ramos"
          style={{
            padding: '0.45rem 0.65rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card, #0f172a)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            color: '#94a3b8',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Minimize2 size={13} />
          <span>Recolher</span>
        </button>
      </div>
    </div>
  );
}
