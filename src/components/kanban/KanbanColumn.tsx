'use client';

import React from 'react';
import { ActionStatus, LeanAction } from '@/lib/types';
import { STATUS_CONFIG, formatCurrency } from '@/lib/utils';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: ActionStatus;
  actions: LeanAction[];
  onCardClick: (action: LeanAction) => void;
  onQuickMove?: (action: LeanAction, newStatus: ActionStatus) => void;
  isAgentView?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  actions,
  onCardClick,
  onQuickMove,
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
      dotColor: '#3b82f6',
      bgBadge: '#eff6ff',
      textBadge: '#1d4ed8',
    },
    em_andamento: {
      title: 'Em Andamento',
      subtitle: 'Ações em execução pelo agente',
      dotColor: '#f59e0b',
      bgBadge: '#fffbeb',
      textBadge: '#b45309',
    },
    aguardando_aprovacao: {
      title: 'Aguardando Homologação',
      subtitle: 'Submetidas para validação Master',
      dotColor: '#9333ea',
      bgBadge: '#faf5ff',
      textBadge: '#7e22ce',
    },
    concluida: {
      title: 'Concluídas / Homologadas',
      subtitle: 'Melhorias Lean consolidadas',
      dotColor: '#10b981',
      bgBadge: '#ecfdf5',
      textBadge: '#047857',
    },
    nao_aprovada: {
      title: 'Não Aprovadas',
      subtitle: 'Recusadas na triagem inicial',
      dotColor: '#ef4444',
      bgBadge: '#fef2f2',
      textBadge: '#b91c1c',
    },
  };

  const headerInfo = columnHeaders[status];

  return (
    <div className="kanban-col">
      {/* Column Header */}
      <div className="kanban-col-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: headerInfo.dotColor,
                display: 'inline-block',
              }}
            />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
              {headerInfo.title}
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: headerInfo.bgBadge,
                color: headerInfo.textBadge,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                border: `1px solid ${headerInfo.dotColor}33`,
              }}
            >
              {actions.length}
            </span>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
            {headerInfo.subtitle}
          </p>
        </div>

        {totalCost > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>Total Coluna</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: status === 'concluida' ? '#059669' : '#0f172a' }}>
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
              color: '#94a3b8',
              fontSize: '0.8125rem',
              border: '2px dashed #e2e8f0',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
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
              onQuickMove={onQuickMove}
              isAgentView={isAgentView}
            />
          ))
        )}
      </div>
    </div>
  );
};
