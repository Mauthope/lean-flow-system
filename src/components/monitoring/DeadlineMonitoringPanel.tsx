'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { isDark } = useTheme();
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
          backgroundColor: isDark ? '#090e1a' : '#ffffff',
          border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '14px',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div>
            <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', display: 'block' }}>
              Prazos 100% em Dia
            </strong>
            <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
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
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)',
            color: isDark ? '#34d399' : '#059669',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.3)',
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
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border:
          overdueCount > 0
            ? (isDark ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid rgba(239, 68, 68, 0.35)')
            : (isDark ? '1.5px solid rgba(245, 158, 11, 0.45)' : '1.5px solid rgba(245, 158, 11, 0.35)'),
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow:
          overdueCount > 0
            ? (isDark
                ? '0 10px 30px -5px rgba(239, 68, 68, 0.15), 0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 10px 25px -5px rgba(239, 68, 68, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05)')
            : (isDark
                ? '0 10px 30px -5px rgba(245, 158, 11, 0.15), 0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 10px 25px -5px rgba(245, 158, 11, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05)'),
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.65rem',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
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
                backgroundColor: overdueCount > 0 ? (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)') : (isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.12)'),
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {title || defaultTitle}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: isDark ? '#cbd5e1' : '#64748b', margin: '0.35rem 0 0' }}>
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: isDark ? '#090e1a' : '#f1f5f9', padding: '0.25rem', borderRadius: '10px', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)', flexWrap: 'wrap' }}>
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
              backgroundColor: filterTab === 'all' ? (isDark ? 'rgba(255, 255, 255, 0.15)' : '#ffffff') : 'transparent',
              color: filterTab === 'all' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
              boxShadow: filterTab === 'all' && !isDark ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
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
                backgroundColor: filterTab === 'atrasado' ? (isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.12)') : 'transparent',
                color: filterTab === 'atrasado' ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#94a3b8' : '#64748b'),
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <AlertTriangle size={13} color={isDark ? '#f87171' : '#dc2626'} />
              <span>Atrasados ({overdueCount})</span>
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
                backgroundColor: filterTab === 'quase_atrasado' ? (isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.12)') : 'transparent',
                color: filterTab === 'quase_atrasado' ? (isDark ? '#fbbf24' : '#d97706') : (isDark ? '#94a3b8' : '#64748b'),
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Clock size={13} color={isDark ? '#fbbf24' : '#d97706'} />
              <span>Quase Atrasados ({nearDueCount})</span>
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
              backgroundColor: filterTab === 'projetos' ? (isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.12)') : 'transparent',
              color: filterTab === 'projetos' ? (isDark ? '#22d3ee' : '#0891b2') : (isDark ? '#94a3b8' : '#64748b'),
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
              backgroundColor: filterTab === 'atividades' ? (isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.12)') : 'transparent',
              color: filterTab === 'atividades' ? (isDark ? '#c084fc' : '#7c3aed') : (isDark ? '#94a3b8' : '#64748b'),
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
            <tr style={{ backgroundColor: isDark ? '#090e1a' : '#f8fafc', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
              const rowBg = isOverdue
                ? (isDark ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.02)')
                : (isDark ? 'rgba(245, 158, 11, 0.03)' : 'rgba(245, 158, 11, 0.02)');
              const rowHoverBg = isOverdue
                ? (isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.06)')
                : (isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)');

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
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
                        backgroundColor: item.type === 'projeto'
                          ? (isDark ? 'rgba(6, 182, 212, 0.15)' : '#e0f2fe')
                          : (isDark ? 'rgba(139, 92, 246, 0.15)' : '#f3e8ff'),
                        color: item.type === 'projeto'
                          ? (isDark ? '#22d3ee' : '#0284c7')
                          : (isDark ? '#c084fc' : '#7c3aed'),
                        border: item.type === 'projeto'
                          ? (isDark ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid #bae6fd')
                          : (isDark ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid #e9d5ff'),
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
                        color: isDark ? '#ffffff' : '#0f172a',
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
                        <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Projeto:</span>
                        <Link
                          href={`${projectBaseUrl}/${item.projectId}`}
                          style={{ fontSize: '0.725rem', color: isDark ? '#22d3ee' : '#0891b2', textDecoration: 'none', fontWeight: 700 }}
                        >
                          {item.parentProjectTitle}
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: isDark ? '#22d3ee' : '#0891b2', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {item.protocol}
                        </span>
                        <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#cbd5e1' }}>•</span>
                        <span style={{ fontSize: '0.7rem', color: isDark ? '#cbd5e1' : '#64748b' }}>
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
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isDark ? '#1e293b' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: isDark ? '#ffffff' : '#0f172a', fontWeight: 800 }}>
                          {(item.responsibleName || 'A')[0]}
                        </div>
                      )}
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                        {item.responsibleName}
                      </span>
                    </div>
                  </td>

                  {/* Prazo Estipulado */}
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: isDark ? '#cbd5e1' : '#334155', fontWeight: 700 }}>
                      {formatDate(item.dueDateStr)}
                    </span>
                  </td>

                  {/* Urgência / Status */}
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    {isOverdue ? (
                      <span
                        style={{
                          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.22)' : '#fee2e2',
                          color: isDark ? '#f87171' : '#b91c1c',
                          border: isDark ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid #fecaca',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: isDark ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none',
                        }}
                      >
                        <AlertTriangle size={12} color={isDark ? '#f87171' : '#b91c1c'} />
                        {item.urgencyLabel}
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
                          color: isDark ? '#fbbf24' : '#b45309',
                          border: isDark ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid #fde68a',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: isDark ? '0 0 10px rgba(245, 158, 11, 0.15)' : 'none',
                        }}
                      >
                        <Clock size={12} color={isDark ? '#fbbf24' : '#b45309'} />
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
                        backgroundColor: isOverdue
                          ? (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)')
                          : (isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'),
                        color: isOverdue
                          ? (isDark ? '#f87171' : '#b91c1c')
                          : (isDark ? '#fbbf24' : '#b45309'),
                        border: isOverdue
                          ? (isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.35)')
                          : (isDark ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)'),
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
