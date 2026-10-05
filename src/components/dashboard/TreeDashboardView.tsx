'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTreeDashboardData, TreeDashboardData } from '@/lib/treeService';
import { LeanAction } from '@/lib/types';
import { TreeHeader } from './tree/TreeHeader';
import { TreeKpis } from './tree/TreeKpis';
import { HoshinNode } from './tree/HoshinNode';
import { EntityNode } from './tree/EntityNode';
import { AgentNode } from './tree/AgentNode';
import { SectorNode } from './tree/SectorNode';
import { SavingsTypeNode } from './tree/SavingsTypeNode';
import { TreeOutlineTable } from './tree/TreeOutlineTable';
import { TreeProjectsModal } from './tree/TreeProjectsModal';

interface TreeDashboardViewProps {
  role?: 'admin' | 'agent';
}

export function TreeDashboardView({ role = 'admin' }: TreeDashboardViewProps) {
  const { currentTenant, dataVersion } = useAuth();

  const [selectedYear, setSelectedYear] = useState<number | 'todos'>(2026);
  const [onlyHomologated, setOnlyHomologated] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'tree' | 'outline'>('tree');
  const [filterAgent, setFilterAgent] = useState<string>('todos');
  const [filterSector, setFilterSector] = useState<string>('todos');

  // Controle de nós expandidos (por padrão, iniciam expandidos)
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({});

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

  // Lista única de agentes e setores para os filtros
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
    return true; // Padrão expandido
  };

  const isSectorExpanded = (compositeKey: string) => {
    if (expandedSectors[compositeKey] !== undefined) return expandedSectors[compositeKey];
    return true; // Padrão expandido
  };

  const handleOpenProjects = (
    title: string,
    subtitle: string,
    value: number,
    projects: LeanAction[]
  ) => {
    setSelectedProjectsModal({ title, subtitle, value, projects });
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header, Filtros e Alternador de Modo */}
      <TreeHeader
        selectedYear={selectedYear}
        availableYears={[2024, 2025, 2026]}
        onYearChange={setSelectedYear}
        onlyHomologated={onlyHomologated}
        onOnlyHomologatedChange={setOnlyHomologated}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterAgent={filterAgent}
        onAgentFilterChange={setFilterAgent}
        filterSector={filterSector}
        onSectorFilterChange={setFilterSector}
        allAgents={allAvailableAgents}
        allSectors={allAvailableSectors}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        isDemoData={treeData.isDemoData}
        entityName={treeData.hoshinKanri.entity.name}
      />

      {/* Cards de Resumo Macro (KPIs) */}
      <TreeKpis data={treeData} />

      {/* Conteúdo Principal: Árvore Visual ou Lista WBS */}
      {viewMode === 'tree' ? (
        <div
          style={{
            overflowX: 'auto',
            paddingBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '1000px',
              width: '100%',
            }}
          >
            {/* NÍVEL 1: Hoshin Kanri */}
            <HoshinNode node={treeData.hoshinKanri} />

            {/* Linha vertical conectora Nível 1 -> Nível 2 */}
            <div
              style={{
                width: '3px',
                height: '32px',
                backgroundColor: '#06b6d4',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.6)',
              }}
            />

            {/* NÍVEL 2: Entidade Industrial */}
            <EntityNode entity={treeData.hoshinKanri.entity} />

            {/* Linha vertical conectora Nível 2 -> Barra de Agentes */}
            <div
              style={{
                width: '3px',
                height: '36px',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
              }}
            />

            {/* Trilho Horizontal e Ramos de Agentes (NÍVEL 3, 4 e 5) */}
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
              {/* Linha horizontal superior unindo agentes */}
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
                {visibleAgents.map((agent) => {
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
                        }}
                      />

                      {/* Card do Agente (Nível 3) */}
                      <AgentNode
                        agent={agent}
                        isExpanded={agentExpanded}
                        onToggle={() => toggleAgent(agent.agentId)}
                        onOpenProjects={handleOpenProjects}
                      />

                      {/* Setores e Tipos (Nível 4 & 5) */}
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

                          {/* Lista Vertical de Setores */}
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
                                <SectorNode
                                  key={sectorKey}
                                  sector={sector}
                                  agentName={agent.agentName}
                                  isExpanded={sectorExpanded}
                                  onToggle={() => toggleSector(sectorKey)}
                                  onOpenProjects={handleOpenProjects}
                                >
                                  {sector.savingsTypes.map((type) => (
                                    <SavingsTypeNode
                                      key={type.key}
                                      type={type}
                                      sectorName={sector.sectorName}
                                      agentName={agent.agentName}
                                      onOpenProjects={handleOpenProjects}
                                    />
                                  ))}
                                </SectorNode>
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
        /* Visualização em Lista WBS */
        <TreeOutlineTable
          treeData={treeData}
          visibleAgents={visibleAgents}
          onOpenProjects={handleOpenProjects}
        />
      )}

      {/* Modal de Detalhamento de Projetos por Nó */}
      <TreeProjectsModal
        modalData={selectedProjectsModal}
        role={role}
        onClose={() => setSelectedProjectsModal(null)}
      />
    </div>
  );
}
