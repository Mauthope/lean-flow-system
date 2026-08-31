'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { formatDate } from '@/lib/utils';
import { LeanAction, ActionChecklistItem } from '@/lib/types';
import { AlertTriangle, Clock, ExternalLink, CheckCircle2 } from 'lucide-react';

export type UrgencyType = 'atrasado' | 'quase_atrasado';

export interface MonitoringItem {
  id: string;
  type: 'projeto' | 'atividade';
  title: string;
  parentProjectTitle?: string;
  protocol: string;
  sectorName?: string;
  responsibleName: string;
  responsibleAvatar?: string;
  dueDateStr: string;
  urgency: UrgencyType;
  diffDays: number;
  urgencyLabel: string;
  projectId: string;
}

interface DeadlineMonitoringPanelProps {
  title?: string;
  subtitle?: string;
  agentId?: string;
  agentName?: string;
  isAdmin?: boolean;
  warningDaysThreshold?: number; // padrão 3 dias
}

export const DeadlineMonitoringPanel: React.FC<DeadlineMonitoringPanelProps> = ({
  title,
  subtitle,
  agentId,
  agentName,
  isAdmin = true,
  warningDaysThreshold = 3,
}) => {
  const { dataVersion } = useAuth();
  const [filterTab, setFilterTab] = useState<'all' | 'atrasado' | 'quase_atrasado' | 'projetos' | 'atividades'>('all');

  const { items, overdueCount, nearDueCount } = useMemo(() => {
    const allActions = dataService.getActions();
    const now = new Date().setHours(0, 0, 0, 0);

    const list: MonitoringItem[] = [];
    let ovCount = 0;
    let nrCount = 0;

    allActions.forEach((act) => {
      // Filtrar se for para um agente específico
      const isAgentProject =
        !agentId ||
        act.assignedAgentId === agentId ||
        (agentName && act.assignedAgentName?.toLowerCase() === agentName.toLowerCase()) ||
        (agentName && act.leaderName?.toLowerCase() === agentName.toLowerCase());

      // 1. Checar Projeto
      if (isAgentProject && act.status !== 'concluida' && act.status !== 'nao_aprovada' && act.dueDate) {
        const dTime = new Date(act.dueDate).getTime();
        if (!isNaN(dTime)) {
          const diffMs = dTime - now;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            // Em Atraso
            ovCount++;
            const daysOverdue = Math.abs(diffDays);
            list.push({
              id: `proj-${act.id}`,
              type: 'projeto',
              title: act.title,
              protocol: act.protocol,
              sectorName: act.originSectorName || 'Fábrica',
              responsibleName: act.assignedAgentName || act.leaderName || 'Não atribuído',
              responsibleAvatar: act.assignedAgentAvatar,
              dueDateStr: act.dueDate,
              urgency: 'atrasado',
              diffDays,
              urgencyLabel: `${daysOverdue} dia${daysOverdue > 1 ? 's' : ''} em atraso`,
              projectId: act.id,
            });
          } else if (diffDays <= warningDaysThreshold) {
            // Quase Atrasado / Vencendo em Breve
            nrCount++;
            const label = diffDays === 0 ? 'Vence hoje!' : diffDays === 1 ? 'Vence amanhã!' : `Vence em ${diffDays} dias`;
            list.push({
              id: `proj-${act.id}`,
              type: 'projeto',
              title: act.title,
              protocol: act.protocol,
              sectorName: act.originSectorName || 'Fábrica',
              responsibleName: act.assignedAgentName || act.leaderName || 'Não atribuído',
              responsibleAvatar: act.assignedAgentAvatar,
              dueDateStr: act.dueDate,
              urgency: 'quase_atrasado',
              diffDays,
              urgencyLabel: label,
              projectId: act.id,
            });
          }
        }
      }

      // 2. Checar Atividades 5W2H
      if (act.status !== 'concluida' && act.status !== 'nao_aprovada' && act.checklist) {
        act.checklist.forEach((item) => {
          // Filtrar se o item pertence ao agente ou se o projeto pertence ao agente
          const isAgentItem =
            !agentId ||
            item.responsible === agentId ||
            (agentName && item.responsibleName?.toLowerCase() === agentName.toLowerCase()) ||
            act.assignedAgentId === agentId;

          if (isAgentItem && !item.completed && item.status !== 'concluida') {
            const targetDate = item.endDate || item.plannedEnd;
            if (targetDate) {
              const itemTime = new Date(targetDate).getTime();
              if (!isNaN(itemTime)) {
                const diffMs = itemTime - now;
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                  // Em Atraso
                  ovCount++;
                  const daysOverdue = Math.abs(diffDays);
                  list.push({
                    id: `act-${act.id}-${item.id}`,
                    type: 'atividade',
                    title: item.label,
                    parentProjectTitle: `${act.protocol} - ${act.title}`,
                    protocol: act.protocol,
                    sectorName: act.originSectorName || 'Fábrica',
                    responsibleName: item.responsibleName || act.assignedAgentName || 'Agente',
                    dueDateStr: targetDate,
                    urgency: 'atrasado',
                    diffDays,
                    urgencyLabel: `${daysOverdue} dia${daysOverdue > 1 ? 's' : ''} em atraso`,
                    projectId: act.id,
                  });
                } else if (diffDays <= warningDaysThreshold) {
                  // Quase Atrasado
                  nrCount++;
                  const label = diffDays === 0 ? 'Vence hoje!' : diffDays === 1 ? 'Vence amanhã!' : `Vence em ${diffDays} dias`;
                  list.push({
                    id: `act-${act.id}-${item.id}`,
                    type: 'atividade',
                    title: item.label,
                    parentProjectTitle: `${act.protocol} - ${act.title}`,
                    protocol: act.protocol,
                    sectorName: act.originSectorName || 'Fábrica',
                    responsibleName: item.responsibleName || act.assignedAgentName || 'Agente',
                    dueDateStr: targetDate,
                    urgency: 'quase_atrasado',
                    diffDays,
                    urgencyLabel: label,
                    projectId: act.id,
                  });
                }
              }
            }
          }
        });
      }
    });

    // Ordenar: primeiro os mais atrasados (menor diffDays negativo), depois os que vencem antes
    list.sort((a, b) => a.diffDays - b.diffDays);

    return {
      items: list,
      overdueCount: ovCount,
      nearDueCount: nrCount,
    };
  }, [dataVersion, agentId, agentName, warningDaysThreshold]);

  const totalCount = items.length;

  // Filtragem ativa por tab
  const filteredItems = useMemo(() => {
    if (filterTab === 'atrasado') return items.filter((i) => i.urgency === 'atrasado');
    if (filterTab === 'quase_atrasado') return items.filter((i) => i.urgency === 'quase_atrasado');
    if (filterTab === 'projetos') return items.filter((i) => i.type === 'projeto');
    if (filterTab === 'atividades') return items.filter((i) => i.type === 'atividade');
    return items;
  }, [items, filterTab]);

  const projectBaseUrl = isAdmin ? '/admin/projetos' : '/agente/projetos';

  // Se não houver nada atrasado nem quase atrasado
  if (totalCount === 0) {
    return (
      <div
        style={{
          backgroundColor: '#090e1a',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '14px',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={18} color="#34d399" />
          </div>
          <div>
            <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block' }}>
              Prazos 100% em Dia
            </strong>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              {agentId
                ? 'Nenhum projeto ou atividade 5W2H atribuída a você está em atraso ou com prazo crítico.'
                : 'Todas as iniciativas e planos de ação Lean da fábrica estão dentro do cronograma.'}
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
          }}
        >
          0 Atrasos
        </span>
      </div>
    );
  }

  const defaultTitle = agentId
    ? `Central de Prazos & Atenção (${totalCount} pendência${totalCount > 1 ? 's' : ''})`
    : `Central de Monitoramento de Prazos (${totalCount} pendência${totalCount > 1 ? 's' : ''})`;

  const defaultSubtitle = agentId
    ? 'Monitore seus projetos e atividades 5W2H em atraso ou que vencem nos próximos dias para antecipar entregas.'
    : 'Iniciativas Lean e atividades 5W2H em atraso ou que vencem nos próximos dias para acompanhamento gerencial.';

  return (
    <div
      className="card"
      style={{
        backgroundColor: '#0f172a',
        border: overdueCount > 0 ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid rgba(245, 158, 11, 0.45)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow:
          overdueCount > 0
            ? '0 10px 30px -5px rgba(239, 68, 68, 0.15), 0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 10px 30px -5px rgba(245, 158, 11, 0.15), 0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.65rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background:
            overdueCount > 0
              ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, transparent 100%)'
              : 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, transparent 100%)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: overdueCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                border: overdueCount > 0 ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(245, 158, 11, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: overdueCount > 0 ? '0 0 12px rgba(239, 68, 68, 0.3)' : '0 0 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              {overdueCount > 0 ? <AlertTriangle size={18} color="#f87171" /> : <Clock size={18} color="#fbbf24" />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {title || defaultTitle}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: '0.35rem 0 0' }}>
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#090e1a', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: filterTab === 'all' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: filterTab === 'all' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            Todos ({totalCount})
          </button>

          {overdueCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterTab('atrasado')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: filterTab === 'atrasado' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                color: filterTab === 'atrasado' ? '#f87171' : '#94a3b8',
                transition: 'all 0.15s ease',
              }}
            >
              🔴 Atrasados ({overdueCount})
            </button>
          )}

          {nearDueCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterTab('quase_atrasado')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: filterTab === 'quase_atrasado' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: filterTab === 'quase_atrasado' ? '#fbbf24' : '#94a3b8',
                transition: 'all 0.15s ease',
              }}
            >
              🟡 Quase Atrasados ({nearDueCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => setFilterTab('projetos')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: filterTab === 'projetos' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: filterTab === 'projetos' ? '#22d3ee' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            Projetos ({items.filter((i) => i.type === 'projeto').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('atividades')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: filterTab === 'atividades' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              color: filterTab === 'atividades' ? '#c084fc' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            Atividades 5W2H ({items.filter((i) => i.type === 'atividade').length})
          </button>
        </div>
      </div>

      {/* List/Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '880px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#090e1a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.875rem 1.25rem' }}>Tipo</th>
              <th style={{ padding: '0.875rem 1rem' }}>Título & Escopo</th>
              <th style={{ padding: '0.875rem 1rem' }}>Responsável</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Prazo Estipulado</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Status / Alerta</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const isOverdue = item.urgency === 'atrasado';
              const rowBg = isOverdue ? 'rgba(239, 68, 68, 0.03)' : 'rgba(245, 158, 11, 0.03)';
              const rowHoverBg = isOverdue ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)';

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    backgroundColor: rowBg,
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = rowHoverBg)}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = rowBg)}
                >
                  {/* Tipo */}
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 900,
                        backgroundColor: item.type === 'projeto' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                        color: item.type === 'projeto' ? '#22d3ee' : '#c084fc',
                        border: item.type === 'projeto' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(139, 92, 246, 0.4)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.type === 'projeto' ? 'PROJETO LEAN' : 'ETAPA 5W2H'}
                    </span>
                  </td>

                  {/* Título & Escopo */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Link
                      href={`${projectBaseUrl}/${item.projectId}`}
                      style={{
                        fontWeight: 800,
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-heading)',
                        display: 'block',
                      }}
                    >
                      {item.title}
                    </Link>
                    {item.parentProjectTitle ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Projeto:</span>
                        <Link
                          href={`${projectBaseUrl}/${item.projectId}`}
                          style={{ fontSize: '0.725rem', color: '#22d3ee', textDecoration: 'none', fontWeight: 700 }}
                        >
                          {item.parentProjectTitle}
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {item.protocol}
                        </span>
                        <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>•</span>
                        <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                          {item.sectorName}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Responsável */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.responsibleAvatar ? (
                        <img
                          src={item.responsibleAvatar}
                          alt={item.responsibleName}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: isOverdue ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1.5px solid rgba(245, 158, 11, 0.4)' }}
                        />
                      ) : (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#ffffff', fontWeight: 800 }}>
                          {(item.responsibleName || 'A')[0]}
                        </div>
                      )}
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                        {item.responsibleName}
                      </span>
                    </div>
                  </td>

                  {/* Prazo Estipulado */}
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1', fontWeight: 700 }}>
                      {formatDate(item.dueDateStr)}
                    </span>
                  </td>

                  {/* Urgência / Status */}
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    {isOverdue ? (
                      <span
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.22)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <AlertTriangle size={12} color="#f87171" />
                        {item.urgencyLabel}
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.5)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)',
                        }}
                      >
                        <Clock size={12} color="#fbbf24" />
                        {item.urgencyLabel}
                      </span>
                    )}
                  </td>

                  {/* Ação */}
                  <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                    <Link
                      href={`${projectBaseUrl}/${item.projectId}`}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                        color: isOverdue ? '#f87171' : '#fbbf24',
                        border: isOverdue ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.35)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span>Abrir</span> <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
