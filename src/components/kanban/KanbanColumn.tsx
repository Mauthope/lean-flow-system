'use client';

import React from 'react';
import { ActionStatus, LeanAction } from '@/lib/types';
import { STATUS_CONFIG, formatCurrency } from '@/lib/utils';
import { KanbanCard } from './KanbanCard';
import { useTheme } from '@/contexts/ThemeContext';

interface KanbanColumnProps {
  status: ActionStatus;
  actions: LeanAction[];
  onCardClick: (action: LeanAction) => void;
  isAgentView?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  actions,
  onCardClick,
  isAgentView,
}) => {
  const { isDark } = useTheme();
  const config = STATUS_CONFIG[status];

  // Calculate sum of cost avoided / estimated for this column
  const totalCost = actions.reduce((acc, a) => {
    return acc + (status === 'concluida' ? a.actualCostAvoided : a.estimatedCostAvoided || 0);
  }, 0);

  const columnHeaders: Record<
    ActionStatus,
    { title: string; subtitle: string; dotColor: string; bgBadge: string; textBadge: string; borderBadge: string; economyColor: string }
  > = isDark ? {
    aberta: {
      title: 'Abertas / Aguardando',
      subtitle: 'Demandas aprovadas ou a iniciar',
      dotColor: '#38bdf8',
      bgBadge: 'rgba(56, 189, 248, 0.15)',
      textBadge: '#38bdf8',
      borderBadge: 'rgba(56, 189, 248, 0.35)',
      economyColor: '#38bdf8',
    },
    em_andamento: {
      title: 'Em Andamento',
      subtitle: 'Ações em execução pelo agente',
      dotColor: '#fbbf24',
      bgBadge: 'rgba(251, 191, 36, 0.15)',
      textBadge: '#fbbf24',
      borderBadge: 'rgba(251, 191, 36, 0.35)',
      economyColor: '#fbbf24',
    },
    aguardando_aprovacao: {
      title: 'Aguardando Homologação',
      subtitle: 'Submetidas para validação Master',
      dotColor: '#c084fc',
      bgBadge: 'rgba(192, 132, 252, 0.15)',
      textBadge: '#c084fc',
      borderBadge: 'rgba(192, 132, 252, 0.35)',
      economyColor: '#c084fc',
    },
    concluida: {
      title: 'Concluídas / Homologadas',
      subtitle: 'Melhorias Lean consolidadas',
      dotColor: '#34d399',
      bgBadge: 'rgba(52, 211, 153, 0.15)',
      textBadge: '#34d399',
      borderBadge: 'rgba(52, 211, 153, 0.35)',
      economyColor: '#34d399',
    },
    nao_aprovada: {
      title: 'Não Aprovadas',
      subtitle: 'Recusadas na triagem inicial',
      dotColor: '#f87171',
      bgBadge: 'rgba(248, 113, 113, 0.15)',
      textBadge: '#f87171',
      borderBadge: 'rgba(248, 113, 113, 0.35)',
      economyColor: '#f87171',
    },
  } : {
    aberta: {
      title: 'Abertas / Aguardando',
      subtitle: 'Demandas aprovadas ou a iniciar',
      dotColor: '#0284c7',
      bgBadge: '#e0f2fe',
      textBadge: '#0369a1',
      borderBadge: '#7dd3fc',
      economyColor: '#0369a1',
    },
    em_andamento: {
      title: 'Em Andamento',
      subtitle: 'Ações em execução pelo agente',
      dotColor: '#d97706',
      bgBadge: '#fef3c7',
      textBadge: '#b45309',
      borderBadge: '#fcd34d',
      economyColor: '#b45309',
    },
    aguardando_aprovacao: {
      title: 'Aguardando Homologação',
      subtitle: 'Submetidas para validação Master',
      dotColor: '#7c3aed',
      bgBadge: '#f3e8ff',
      textBadge: '#6b21a8',
      borderBadge: '#d8b4fe',
      economyColor: '#6b21a8',
    },
    concluida: {
      title: 'Concluídas / Homologadas',
      subtitle: 'Melhorias Lean consolidadas',
      dotColor: '#059669',
      bgBadge: '#dcfce7',
      textBadge: '#15803d',
      borderBadge: '#86efac',
      economyColor: '#15803d',
    },
    nao_aprovada: {
      title: 'Não Aprovadas',
      subtitle: 'Recusadas na triagem inicial',
      dotColor: '#dc2626',
      bgBadge: '#fee2e2',
      textBadge: '#b91c1c',
      borderBadge: '#fca5a5',
      economyColor: '#b91c1c',
    },
  };

  const headerInfo = columnHeaders[status];

  return (
    <div
      className="kanban-col"
      style={{
        borderTop: `4px solid ${headerInfo.dotColor}`,
        backgroundColor: isDark ? undefined : '#f1f5f9',
      }}
    >
      {/* Column Header */}
      <div
        className="kanban-col-header"
        style={{
          backgroundColor: isDark ? '#0d1527' : '#ffffff',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
          padding: '0.875rem 1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: headerInfo.dotColor,
                display: 'inline-block',
                boxShadow: isDark ? `0 0 10px ${headerInfo.dotColor}` : `0 0 4px ${headerInfo.dotColor}80`,
              }}
            />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
              {headerInfo.title}
            </h3>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: headerInfo.bgBadge,
                color: headerInfo.textBadge,
                padding: '0.1rem 0.5rem',
                borderRadius: '9999px',
                border: `1px solid ${headerInfo.borderBadge}`,
              }}
            >
              {actions.length}
            </span>
          </div>
          <p style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.15rem', marginBottom: 0 }}>
            {headerInfo.subtitle}
          </p>
        </div>

        {totalCost > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.6rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
              Economia
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: headerInfo.economyColor,
              }}
            >
              {formatCurrency(totalCost)}
            </span>
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className="kanban-cards-list">
        {actions.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: isDark ? '#64748b' : '#94a3b8',
              fontSize: '0.78125rem',
              border: isDark ? '2px dashed rgba(255, 255, 255, 0.08)' : '2px dashed #cbd5e1',
              borderRadius: '10px',
              backgroundColor: isDark ? '#090e1a' : '#ffffff',
            }}
          >
            Nenhuma ação nesta etapa
          </div>
        ) : (
          actions.map((action) => (
            <KanbanCard
              key={action.id}
              action={action}
              onClick={() => onCardClick(action)}
              isAgentView={isAgentView}
            />
          ))
        )}
      </div>
    </div>
  );
};
