'use client';

import React from 'react';
import { ActionStatus, LeanAction } from '@/lib/types';
import { STATUS_CONFIG, formatCurrency } from '@/lib/utils';
import { KanbanCard } from './KanbanCard';

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
  const config = STATUS_CONFIG[status];

  // Calculate sum of cost avoided / estimated for this column
  const totalCost = actions.reduce((acc, a) => {
    return acc + (status === 'concluida' ? a.actualCostAvoided : a.estimatedCostAvoided || 0);
  }, 0);

  const columnHeaders: Record<
    ActionStatus,
    { title: string; subtitle: string; dotColor: string; bgBadge: string; textBadge: string }
  > = {
    aberta: {
      title: 'Abertas / Aguardando',
      subtitle: 'Demandas aprovadas ou a iniciar',
      dotColor: '#38bdf8',
      bgBadge: 'rgba(56, 189, 248, 0.15)',
      textBadge: '#38bdf8',
    },
    em_andamento: {
      title: 'Em Andamento',
      subtitle: 'Ações em execução pelo agente',
      dotColor: '#fbbf24',
      bgBadge: 'rgba(251, 191, 36, 0.15)',
      textBadge: '#fbbf24',
    },
    aguardando_aprovacao: {
      title: 'Aguardando Homologação',
      subtitle: 'Submetidas para validação Master',
      dotColor: '#c084fc',
      bgBadge: 'rgba(192, 132, 252, 0.15)',
      textBadge: '#c084fc',
    },
    concluida: {
      title: 'Concluídas / Homologadas',
      subtitle: 'Melhorias Lean consolidadas',
      dotColor: '#34d399',
      bgBadge: 'rgba(52, 211, 153, 0.15)',
      textBadge: '#34d399',
    },
    nao_aprovada: {
      title: 'Não Aprovadas',
      subtitle: 'Recusadas na triagem inicial',
      dotColor: '#f87171',
      bgBadge: 'rgba(248, 113, 113, 0.15)',
      textBadge: '#f87171',
    },
  };

  const headerInfo = columnHeaders[status];

  return (
    <div
      className="kanban-col"
      style={{
        borderTop: `3px solid ${headerInfo.dotColor}`,
      }}
    >
      {/* Column Header */}
      <div
        className="kanban-col-header"
        style={{
          backgroundColor: '#0d1527',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                boxShadow: `0 0 10px ${headerInfo.dotColor}`,
              }}
            />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              {headerInfo.title}
            </h3>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: headerInfo.bgBadge,
                color: headerInfo.textBadge,
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                border: `1px solid ${headerInfo.dotColor}50`,
              }}
            >
              {actions.length}
            </span>
          </div>
          <p style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '0.15rem', marginBottom: 0 }}>
            {headerInfo.subtitle}
          </p>
        </div>

        {totalCost > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>
              Economia
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.78125rem',
                fontWeight: 800,
                color: status === 'concluida' ? '#34d399' : '#22d3ee',
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
              color: '#64748b',
              fontSize: '0.78125rem',
              border: '2px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              backgroundColor: '#090e1a',
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
