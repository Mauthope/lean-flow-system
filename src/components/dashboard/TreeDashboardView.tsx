'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import {
  getTreeDashboardData,
  TreeDashboardData,
  AgentNode,
  SectorNode,
  SavingsTypeNode,
  SAVINGS_TYPE_CONFIG,
} from '@/lib/treeService';
import { LeanAction } from '@/lib/types';
import {
  Target,
  Factory,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  Filter,
  Calendar,
  ExternalLink,
  Clock,
  Sparkles,
  Info,
  Network,
  ListTree,
  BarChart3,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';

export function TreeDashboardView({ role = 'admin' }: { role?: 'admin' | 'agent' }) {
  const { currentTenant, dataVersion } = useAuth();

  const [selectedYear, setSelectedYear] = useState<number | 'todos'>(2026);
  const [onlyHomologated, setOnlyHomologated] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'tree' | 'outline'>('tree');
  const [filterAgent, setFilterAgent] = useState<string>('todos');
  const [filterSector, setFilterSector] = useState<string>('todos');

  // Controle de nós expandidos
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({
    all: true,
  });
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({
    all: true,
  });

  // Modal de Projetos
  const [selectedProjectsModal, setSelectedProjectsModal] = useState<{
    title: string;
    subtitle: string;
    value: number;
    projects: LeanAction[];
  } | null>(null);

  // Carregar dados da árvore
  const treeData: TreeDashboardData = useMemo(() => {
    return getTreeDashboardData({
      year: selectedYear,
      tenantId: currentTenant?.id,
      onlyHomologated,
    });
  }, [selectedYear, currentTenant?.id, onlyHomologated, dataVersion]);

  // Filtragem dos Agentes
  const visibleAgents = useMemo(() => {
    let list = treeData.hoshinKanri.entity.agents;
    if (filterAgent !== 'todos') {
      list = list.filter((a) => a.agentId === filterAgent || a.agentName === filterAgent);
    }
    if (filterSector !== 'todos') {
      list = list
        .map((a) => ({
          ...a,
          sectors: a.sectors.filter(
            (s) => s.sectorId === filterSector || s.sectorName === filterSector
          ),
        }))
        .filter((a) => a.sectors.length > 0);
    }
    return list;
  }, [treeData, filterAgent, filterSector]);

  // Lista única de agentes e setores para os selects
  const allAvailableAgents = useMemo(() => {
    return treeData.hoshinKanri.entity.agents.map((a) => ({
      id: a.agentId,
      name: a.agentName,
    }));
  }, [treeData]);

  const allAvailableSectors = useMemo(() => {
    const secMap = new Map<string, string>();
    treeData.hoshinKanri.entity.agents.forEach((a) => {
      a.sectors.forEach((s) => secMap.set(s.sectorId, s.sectorName));
    });
    return Array.from(secMap.entries()).map(([id, name]) => ({ id, name }));
  }, [treeData]);

  const toggleAgent = (agentId: string) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agentId]: prev[agentId] === undefined ? false : !prev[agentId],
    }));
  };

  const toggleSector = (compositeKey: string) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [compositeKey]: prev[compositeKey] === undefined ? false : !prev[compositeKey],
    }));
  };

  const expandAll = () => {
    const newAgents: Record<string, boolean> = {};
    const newSectors: Record<string, boolean> = {};
    treeData.hoshinKanri.entity.agents.forEach((a) => {
      newAgents[a.agentId] = true;
      a.sectors.forEach((s) => {
        newSectors[`${a.agentId}__${s.sectorId}`] = true;
      });
    });
    setExpandedAgents(newAgents);
    setExpandedSectors(newSectors);
  };

  const collapseAll = () => {
    const newAgents: Record<string, boolean> = {};
    const newSectors: Record<string, boolean> = {};
    treeData.hoshinKanri.entity.agents.forEach((a) => {
      newAgents[a.agentId] = false;
      a.sectors.forEach((s) => {
        newSectors[`${a.agentId}__${s.sectorId}`] = false;
      });
    });
    setExpandedAgents(newAgents);
    setExpandedSectors(newSectors);
  };

  const isAgentExpanded = (agentId: string) => {
    if (expandedAgents[agentId] !== undefined) return expandedAgents[agentId];
    return true; // Default expanded
  };

  const isSectorExpanded = (compositeKey: string) => {
    if (expandedSectors[compositeKey] !== undefined) return expandedSectors[compositeKey];
    return true; // Default expanded
  };

  const openProjectsModal = (
    title: string,
    subtitle: string,
    value: number,
    projects: LeanAction[]
  ) => {
    setSelectedProjectsModal({ title, subtitle, value, projects });
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* ================= TOPO EXECUTIVO ================= */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
                color: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)',
              }}
            >
              <Network size={20} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-heading, #ffffff)',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Árvore de Desdobramento • Espinha Dorsal do Projeto
              </h1>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted, #94a3b8)',
                  marginTop: '0.2rem',
                  fontFamily: 'var(--font-sans)',
                  margin: 0,
                }}
              >
                Desdobramento hierárquico em 5 níveis: Hoshin Kanri → Entidade → Agentes Lean → Setores → Tipos de Economia.
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Seletor de Ano */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--bg-card, #0f172a)',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            }}
          >
            <Calendar size={14} color="var(--primary, #06b6d4)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
              Ciclo:
            </span>
            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value === 'todos' ? 'todos' : Number(e.target.value))
              }
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-heading, #ffffff)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {treeData.availableYears.map((yr) => (
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
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            }}
          >
            <Users size={14} color="#8b5cf6" />
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-heading, #ffffff)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '160px',
              }}
            >
              <option value="todos" style={{ backgroundColor: '#0f172a' }}>
                Todos os Agentes
              </option>
              {allAvailableAgents.map((ag) => (
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
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            }}
          >
            <Building2 size={14} color="#10b981" />
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-heading, #ffffff)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '160px',
              }}
            >
              <option value="todos" style={{ backgroundColor: '#0f172a' }}>
                Todos os Setores
              </option>
              {allAvailableSectors.map((sec) => (
                <option key={sec.id} value={sec.id} style={{ backgroundColor: '#0f172a' }}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Alternador de Modo de Visualização */}
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
              onClick={() => setViewMode('tree')}
              title="Visão Gráfica em Árvore"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'tree' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: viewMode === 'tree' ? '#22d3ee' : 'var(--text-muted, #94a3b8)',
                fontSize: '0.78125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Network size={14} />
              <span>Árvore</span>
            </button>
            <button
              onClick={() => setViewMode('outline')}
              title="Visão em Lista Estruturada"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor:
                  viewMode === 'outline' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: viewMode === 'outline' ? '#22d3ee' : 'var(--text-muted, #94a3b8)',
                fontSize: '0.78125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ListTree size={14} />
              <span>Estrutura</span>
            </button>
          </div>

          {/* Botões Expandir / Recolher */}
          <button
            onClick={expandAll}
            title="Expandir Todos os Ramos"
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card, #0f172a)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              color: 'var(--text-muted, #94a3b8)',
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
            onClick={collapseAll}
            title="Recolher Todos os Ramos"
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card, #0f172a)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              color: 'var(--text-muted, #94a3b8)',
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

      {/* Aviso de Modo Demonstração (caso o banco não tenha ações cadastradas no ano) */}
      {treeData.isDemoData && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={16} color="#22d3ee" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
              <strong>Visualização Demonstrativa:</strong> Exibindo desdobramento com estrutura industrial realista ({treeData.hoshinKanri.entity.name}) para ilustrar a espinha dorsal. À medida que seus projetos forem homologados na Controladoria, eles preencherão os nós reais automaticamente.
            </span>
          </div>
        </div>
      )}

      {/* ================= RESUMO MACRO (KPI CARDS) ================= */}
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
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
              1. HOSHIN KANRI
            </span>
            <Target size={16} color="#06b6d4" />
          </div>
          <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#22d3ee' }}>
              {treeData.hoshinKanri.overallFulfillmentPercent}%
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
                width: `${treeData.hoshinKanri.overallFulfillmentPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)',
              }}
            />
          </div>
        </div>

        {/* KPI 2: Entidade Total R$ */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
              2. ENTIDADE INDUSTRIAL
            </span>
            <Factory size={16} color="#10b981" />
          </div>
          <div style={{ marginTop: '0.45rem' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34d399' }}>
              {formatCurrency(treeData.totalHomologatedValue)}
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.71875rem', color: '#94a3b8' }}>
            Total Homologado no Ano • {treeData.hoshinKanri.entity.name}
          </p>
        </div>

        {/* KPI 3: Agentes Ativos */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
              3. AGENTES LEAN
            </span>
            <Users size={16} color="#8b5cf6" />
          </div>
          <div style={{ marginTop: '0.45rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a78bfa' }}>
              {treeData.totalAgentsCount}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
              especialistas
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.71875rem', color: '#94a3b8' }}>
            {treeData.totalProjectsCount} projetos conduzidos
          </p>
        </div>

        {/* KPI 4: Setores */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
              4. SETORES FABRIS
            </span>
            <Building2 size={16} color="#f59e0b" />
          </div>
          <div style={{ marginTop: '0.45rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>
              {treeData.totalSectorsCount}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
              áreas de produção
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.71875rem', color: '#94a3b8' }}>
            Ganhos desdobrados no chão de fábrica
          </p>
        </div>
      </div>

      {/* ================= CORPO DO DASHBOARD ================= */}
      {viewMode === 'tree' ? (
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            paddingBottom: '3rem',
          }}
        >
          <div
            style={{
              minWidth: '1000px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* ----------------- NÍVEL 1: HOSHIN KANRI ----------------- */}
            <div
              style={{
                width: '560px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '2px solid rgba(6, 182, 212, 0.5)',
                boxShadow: '0 8px 30px rgba(6, 182, 212, 0.25)',
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
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                <Target size={13} />
                <span>NÍVEL 1 • HOSHIN KANRI {selectedYear !== 'todos' ? selectedYear : ''}</span>
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
                Diretrizes Estratégicas da Alta Gerência
              </h2>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#94a3b8',
                  margin: '0 0 1rem',
                }}
              >
                Convergência e Atingimento Global das Metas Corporativas
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
                    {treeData.hoshinKanri.overallFulfillmentPercent}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Percentual de Atendimento
                  </div>
                </div>
                <div style={{ height: '36px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    {treeData.hoshinKanri.totalObjectivesCount}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Diretrizes Ativas
                  </div>
                </div>
                <div style={{ height: '36px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                    {treeData.hoshinKanri.totalAlignedProjectsCount}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Projetos Alinhados
                  </div>
                </div>
              </div>
            </div>

            {/* Linha Conectora Vertical 1 -> 2 */}
            <div
              style={{
                width: '3px',
                height: '42px',
                backgroundColor: '#06b6d4',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.6)',
              }}
            />

            {/* ----------------- NÍVEL 2: ENTIDADE ----------------- */}
            <div
              style={{
                width: '620px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)',
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
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                <Factory size={13} />
                <span>NÍVEL 2 • ENTIDADE / PLANTA INDUSTRIAL</span>
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
                {treeData.hoshinKanri.entity.name}
              </h2>
              {treeData.hoshinKanri.entity.cnpjOrCode && (
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.85rem' }}>
                  CNPJ / Código: {treeData.hoshinKanri.entity.cnpjOrCode}
                </p>
              )}

              {/* Total em Reais Homologados do Ano */}
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                  {formatCurrency(treeData.totalHomologatedValue)}
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
                    <strong>{treeData.totalProjectsCount}</strong> Projetos Homologados
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{treeData.hoshinKanri.entity.totalHoursSaved}h</strong> de Mão de Obra Recuperadas
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{treeData.totalAgentsCount}</strong> Agentes em Ação
                  </span>
                </div>
              </div>
            </div>

            {/* Linha Conectora Vertical 2 -> Barra Horizontal de Agentes */}
            <div
              style={{
                width: '3px',
                height: '36px',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
              }}
            />

            {/* Trilho Horizontal e Ramos de Agentes (NÍVEL 3) */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                position: 'relative',
                paddingTop: '12px',
              }}
            >
              {/* Linha Horizontal Conectora Superior dos Agentes */}
              {visibleAgents.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '12%',
                    right: '12%',
                    height: '3px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              )}

              {/* Grid Horizontal de Agentes */}
              <div
                style={{
                  display: 'flex',
                  gap: '2rem',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  flexWrap: 'nowrap',
                }}
              >
                {visibleAgents.map((agent, agIdx) => {
                  const agentExpanded = isAgentExpanded(agent.agentId);

                  return (
                    <div
                      key={agent.agentId}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '320px',
                        maxWidth: '420px',
                        position: 'relative',
                      }}
                    >
                      {/* Conector Vertical do Trilho ao Card do Agente */}
                      <div
                        style={{
                          width: '2px',
                          height: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          marginBottom: '0',
                        }}
                      />

                      {/* ----------------- NÍVEL 3: CARD DO AGENTE ----------------- */}
                      <div
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(15, 23, 42, 0.92)',
                          backdropFilter: 'blur(12px)',
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
                            }}
                          >
                            {agent.agentName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
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
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>
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

                        {/* Botão de Expandir Setores */}
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
                            onClick={() => toggleAgent(agent.agentId)}
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
                            {agentExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span>
                              {agentExpanded ? 'Recolher Setores' : `Ver ${agent.sectors.length} Setor(es)`}
                            </span>
                          </button>

                          {agent.projects.length > 0 && (
                            <button
                              onClick={() =>
                                openProjectsModal(
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
                              }}
                            >
                              Ver Projetos
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ----------------- NÍVEL 4 & 5: SETORES E TIPOS ----------------- */}
                      {agentExpanded && agent.sectors.length > 0 && (
                        <div
                          style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop: '10px',
                          }}
                        >
                          {/* Linha vertical descendo do Agente para os Setores */}
                          <div
                            style={{
                              width: '2px',
                              height: '18px',
                              backgroundColor: 'rgba(139, 92, 246, 0.5)',
                            }}
                          />

                          {/* Lista Vertical de Setores do Agente */}
                          <div
                            style={{
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1.25rem',
                            }}
                          >
                            {agent.sectors.map((sector) => {
                              const sectorKey = `${agent.agentId}__${sector.sectorId}`;
                              const sectorExpanded = isSectorExpanded(sectorKey);

                              return (
                                <div
                                  key={sectorKey}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '100%',
                                  }}
                                >
                                  {/* ----------------- NÍVEL 4: CARD DO SETOR ----------------- */}
                                  <div
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
                                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
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
                                        onClick={() => toggleSector(sectorKey)}
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
                                        {sectorExpanded ? (
                                          <ChevronDown size={13} />
                                        ) : (
                                          <ChevronRight size={13} />
                                        )}
                                        <span>
                                          {sectorExpanded
                                            ? 'Recolher Tipos'
                                            : `Ver ${sector.savingsTypes.length} Tipo(s) de Ganho`}
                                        </span>
                                      </button>

                                      {sector.projects.length > 0 && (
                                        <button
                                          onClick={() =>
                                            openProjectsModal(
                                              `${sector.sectorName} • ${agent.agentName}`,
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
                                          }}
                                        >
                                          Ver Projetos ({sector.projectCount})
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* ----------------- NÍVEL 5: TIPOS DE GANHO / DESPERDÍCIO ----------------- */}
                                  {sectorExpanded && sector.savingsTypes.length > 0 && (
                                    <div
                                      style={{
                                        width: '92%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        marginTop: '8px',
                                      }}
                                    >
                                      {/* Linha vertical descendo do Setor para os Tipos */}
                                      <div
                                        style={{
                                          width: '2px',
                                          height: '14px',
                                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        }}
                                      />

                                      {/* Lista de Tipos de Economia */}
                                      <div
                                        style={{
                                          width: '100%',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '0.45rem',
                                        }}
                                      >
                                        {sector.savingsTypes.map((type) => {
                                          const typeConfig = SAVINGS_TYPE_CONFIG[type.key] || {
                                            label: type.label,
                                            color: '#06b6d4',
                                            description: '',
                                          };

                                          return (
                                            <div
                                              key={type.key}
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
                                                      openProjectsModal(
                                                        `${type.label} • ${sector.sectorName}`,
                                                        `Agente: ${agent.agentName}`,
                                                        type.value,
                                                        type.projects
                                                      )
                                                    }
                                                    style={{
                                                      background: 'none',
                                                      border: 'none',
                                                      color: '#22d3ee',
                                                      fontSize: '0.65rem',
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
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= MODO OUTLINE (TABELA HIERÁRQUICA ESTRUTURADA) ================= */
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Decomposição Hierárquica em Lista (WBS)
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                Conferência linear de valores, participações e projetos por nível
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>Nível / Elemento</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>
                    Valor Homologado (R$)
                  </th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>
                    % Participação
                  </th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>
                    Qtd Projetos
                  </th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Linha 1: Hoshin Kanri */}
                <tr style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#22d3ee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={16} />
                      <span>1. Hoshin Kanri • Diretrizes Estratégicas</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#22d3ee' }}>
                    {treeData.hoshinKanri.overallFulfillmentPercent}% Meta
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#94a3b8' }}>100%</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#ffffff' }}>
                    {treeData.totalProjectsCount}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>—</td>
                </tr>

                {/* Linha 2: Entidade */}
                <tr style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <td style={{ padding: '0.85rem 1rem', paddingLeft: '2rem', fontWeight: 700, color: '#34d399' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Factory size={16} />
                      <span>2. Entidade: {treeData.hoshinKanri.entity.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>
                    {formatCurrency(treeData.totalHomologatedValue)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>
                    100%
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#ffffff' }}>
                    {treeData.totalProjectsCount}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>—</td>
                </tr>

                {/* Linhas 3, 4 e 5: Agentes, Setores e Tipos */}
                {visibleAgents.map((agent) => (
                  <React.Fragment key={agent.agentId}>
                    {/* Agente */}
                    <tr style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <td style={{ padding: '0.75rem 1rem', paddingLeft: '3rem', fontWeight: 600, color: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Users size={14} color="#8b5cf6" />
                          <span>3. Agente: {agent.agentName}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({agent.jobTitle})</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#a78bfa' }}>
                        {formatCurrency(agent.value)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#c4b5fd' }}>
                        {agent.percentageOfEntity}%
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#ffffff' }}>
                        {agent.projectCount}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {agent.projects.length > 0 && (
                          <button
                            onClick={() =>
                              openProjectsModal(
                                agent.agentName,
                                `Projetos conduzidos pelo agente (${agent.projectCount})`,
                                agent.value,
                                agent.projects
                              )
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#22d3ee',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Ver Projetos
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Setores do Agente */}
                    {agent.sectors.map((sector) => (
                      <React.Fragment key={`${agent.agentId}__${sector.sectorId}`}>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '0.65rem 1rem', paddingLeft: '4.5rem', color: '#cbd5e1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <Building2 size={13} color={sector.color || '#06b6d4'} />
                              <span>4. Setor: {sector.sectorName}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                            {formatCurrency(sector.value)}
                          </td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                            {sector.percentageOfAgent}% do agente
                          </td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'center', color: '#cbd5e1' }}>
                            {sector.projectCount}
                          </td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                            {sector.projects.length > 0 && (
                              <button
                                onClick={() =>
                                  openProjectsModal(
                                    `${sector.sectorName} • ${agent.agentName}`,
                                    `Projetos do setor (${sector.projectCount})`,
                                    sector.value,
                                    sector.projects
                                  )
                                }
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#22d3ee',
                                  fontSize: '0.71875rem',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                              >
                                Ver
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Tipos de Ganho do Setor */}
                        {sector.savingsTypes.map((type) => {
                          const config = SAVINGS_TYPE_CONFIG[type.key] || {
                            label: type.label,
                            color: '#06b6d4',
                          };

                          return (
                            <tr key={`${agent.agentId}__${sector.sectorId}__${type.key}`} style={{ opacity: 0.85 }}>
                              <td style={{ padding: '0.5rem 1rem', paddingLeft: '6rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: config.color }} />
                                  <span>5. Tipo: {type.label}</span>
                                </div>
                              </td>
                              <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: config.color, fontWeight: 600 }}>
                                {formatCurrency(type.value)}
                              </td>
                              <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.71875rem' }}>
                                {type.percentageOfSector}% do setor
                              </td>
                              <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.71875rem' }}>
                                {type.projectCount}
                              </td>
                              <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                                {type.projects.length > 0 && (
                                  <button
                                    onClick={() =>
                                      openProjectsModal(
                                        `${type.label} • ${sector.sectorName}`,
                                        `Agente: ${agent.agentName}`,
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
                                    }}
                                  >
                                    Ver
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL DE PROJETOS DO NÓ SELECIONADO ================= */}
      {selectedProjectsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setSelectedProjectsModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '85vh',
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {selectedProjectsModal.title}
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78125rem', color: '#94a3b8' }}>
                  {selectedProjectsModal.subtitle}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Total Auditado
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                    {formatCurrency(selectedProjectsModal.value)}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProjectsModal(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.35rem',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {selectedProjectsModal.projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                  Nenhum projeto específico associado diretamente a este nó (dados de demonstração).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedProjectsModal.projects.map((proj) => {
                    const projectUrl =
                      role === 'admin'
                        ? `/admin/projetos/${proj.id}`
                        : `/agente/projetos/${proj.id}`;
                    const a3Url =
                      role === 'admin'
                        ? `/admin/projetos/${proj.id}/relatorio-a3`
                        : `/agente/projetos/${proj.id}/relatorio-a3`;

                    return (
                      <div
                        key={proj.id}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                fontSize: '0.71875rem',
                                fontWeight: 700,
                                color: '#22d3ee',
                                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                              }}
                            >
                              {proj.protocol}
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                              {proj.title}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.75rem',
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              marginTop: '0.35rem',
                            }}
                          >
                            <span>Setor: {proj.originSectorName || 'Fábrica'}</span>
                            <span>•</span>
                            <span>Agente: {proj.assignedAgentName || 'Lean'}</span>
                            <span>•</span>
                            <span>
                              Homologado:{' '}
                              {proj.masterApproved ? 'Sim (Master)' : 'Concluído'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#34d399' }}>
                            {formatCurrency(
                              proj.controllershipAudit?.approvedEstimatedCostAvoided ||
                                proj.actualCostAvoided ||
                                proj.estimatedCostAvoided ||
                                0
                            )}
                          </span>

                          <Link
                            href={a3Url}
                            target="_blank"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              color: '#22d3ee',
                              textDecoration: 'none',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(6, 182, 212, 0.1)',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                            }}
                          >
                            <FileText size={12} />
                            <span>A3</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
