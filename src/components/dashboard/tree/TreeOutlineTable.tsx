'use client';

import React from 'react';
import { Target, Factory, Users, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  TreeDashboardData,
  AgentNode as AgentNodeType,
  SAVINGS_TYPE_CONFIG,
} from '@/lib/treeService';
import { LeanAction } from '@/lib/types';

interface TreeOutlineTableProps {
  treeData: TreeDashboardData;
  visibleAgents: AgentNodeType[];
  onOpenProjects: (title: string, subtitle: string, value: number, projects: LeanAction[]) => void;
}

export function TreeOutlineTable({
  treeData,
  visibleAgents,
  onOpenProjects,
}: TreeOutlineTableProps) {
  return (
    <div
      className="glass-panel"
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
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
            }}
          >
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
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>
                Nível / Elemento
              </th>
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
            <tr
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#22d3ee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={16} />
                  <span>1. Hoshin Kanri • Diretrizes Estratégicas</span>
                </div>
              </td>
              <td
                style={{
                  padding: '0.85rem 1rem',
                  textAlign: 'right',
                  fontWeight: 800,
                  color: '#22d3ee',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {treeData.hoshinKanri.overallFulfillmentPercent}% Meta
              </td>
              <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                100%
              </td>
              <td
                style={{
                  padding: '0.85rem 1rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {treeData.totalProjectsCount}
              </td>
              <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#64748b' }}>—</td>
            </tr>

            {/* Linha 2: Entidade */}
            <tr
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <td
                style={{
                  padding: '0.85rem 1rem',
                  paddingLeft: '2rem',
                  fontWeight: 700,
                  color: '#34d399',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Factory size={16} />
                  <span>2. Entidade: {treeData.hoshinKanri.entity.name}</span>
                </div>
              </td>
              <td
                style={{
                  padding: '0.85rem 1rem',
                  textAlign: 'right',
                  fontWeight: 800,
                  color: '#10b981',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {formatCurrency(treeData.totalHomologatedValue)}
              </td>
              <td
                style={{
                  padding: '0.85rem 1rem',
                  textAlign: 'center',
                  color: '#34d399',
                  fontWeight: 700,
                }}
              >
                100%
              </td>
              <td
                style={{
                  padding: '0.85rem 1rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {treeData.totalProjectsCount}
              </td>
              <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#64748b' }}>—</td>
            </tr>

            {/* Linhas 3, 4 e 5: Agentes, Setores e Tipos */}
            {visibleAgents.map((agent) => (
              <React.Fragment key={agent.agentId}>
                {/* Agente */}
                <tr
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      paddingLeft: '3rem',
                      fontWeight: 600,
                      color: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Users size={14} color="#8b5cf6" />
                      <span>3. Agente: {agent.agentName}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({agent.jobTitle})</span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#a78bfa',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {formatCurrency(agent.value)}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      color: '#c4b5fd',
                    }}
                  >
                    {agent.percentageOfEntity}%
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#ffffff',
                    }}
                  >
                    {agent.projectCount}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
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
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          paddingLeft: '4.5rem',
                          color: '#cbd5e1',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Building2 size={13} color={sector.color || '#06b6d4'} />
                          <span>4. Setor: {sector.sectorName}</span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: '#38bdf8',
                        }}
                      >
                        {formatCurrency(sector.value)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          textAlign: 'center',
                          color: '#94a3b8',
                        }}
                      >
                        {sector.percentageOfAgent}% do agente
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          textAlign: 'center',
                          color: '#cbd5e1',
                        }}
                      >
                        {sector.projectCount}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                        {sector.projects.length > 0 && (
                          <button
                            onClick={() =>
                              onOpenProjects(
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
                            Ver Projetos
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
                        <tr
                          key={`${agent.agentId}__${sector.sectorId}__${type.key}`}
                          style={{ opacity: 0.85 }}
                        >
                          <td
                            style={{
                              padding: '0.5rem 1rem',
                              paddingLeft: '6rem',
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <div
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: config.color,
                                }}
                              />
                              <span>5. Tipo: {type.label}</span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '0.5rem 1rem',
                              textAlign: 'right',
                              color: config.color,
                              fontWeight: 600,
                            }}
                          >
                            {formatCurrency(type.value)}
                          </td>
                          <td
                            style={{
                              padding: '0.5rem 1rem',
                              textAlign: 'center',
                              color: '#64748b',
                              fontSize: '0.71875rem',
                            }}
                          >
                            {type.percentageOfSector}% do setor
                          </td>
                          <td
                            style={{
                              padding: '0.5rem 1rem',
                              textAlign: 'center',
                              color: '#94a3b8',
                              fontSize: '0.71875rem',
                            }}
                          >
                            {type.projectCount}
                          </td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                            {type.projects.length > 0 && (
                              <button
                                onClick={() =>
                                  onOpenProjects(
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
  );
}
