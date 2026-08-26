'use client';

import React from 'react';
import { LeanAction } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { PriorityBadge } from '@/components/ui/Badge';
import { Calendar } from 'lucide-react';

interface KanbanCardProps {
  action: LeanAction;
  onClick: () => void;
  isAgentView?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  action,
  onClick,
}) => {
  const isAwaitingApproval =
    action.status === 'aguardando_aprovacao' ||
    (action.submittedForApproval && !action.masterApproved);
  const isCompleted = action.status === 'concluida';
  const isRejected = action.status === 'nao_aprovada';
  const isInProgress = action.status === 'em_andamento';

  // Check if overdue
  const isOverdue =
    action.dueDate &&
    !isCompleted &&
    !isRejected &&
    new Date(action.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const formattedSavings =
    action.status === 'concluida'
      ? action.actualCostAvoided
      : action.estimatedCostAvoided || 0;

  const cleanSectorName = action.originSectorName
    ? action.originSectorName.replace(/,/g, '').trim().split(' ')[0]
    : '';

  const accentColor = isCompleted
    ? '#10b981'
    : isAwaitingApproval
    ? '#a855f7'
    : isInProgress
    ? '#f59e0b'
    : isRejected
    ? '#ef4444'
    : '#06b6d4';

  return (
    <div
      onClick={onClick}
      className="kanban-card"
      style={{
        backgroundColor: '#0f172a',
        borderRadius: '10px',
        padding: '0.75rem 0.85rem',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 6px 16px rgba(0, 0, 0, 0.4), 0 0 8px ${accentColor}30`;
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        e.currentTarget.style.backgroundColor = '#131e35';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.25)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
        e.currentTarget.style.backgroundColor = '#0f172a';
      }}
    >
      {/* Top Row: Protocol + Sector + Priority */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.675rem',
            fontWeight: 800,
            color: '#22d3ee',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            padding: '0.1rem 0.4rem',
            borderRadius: '4px',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {action.protocol}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {cleanSectorName && (
            <span
              style={{
                fontSize: '0.65rem',
                color: '#94a3b8',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.08rem 0.35rem',
                borderRadius: '4px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                maxWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={`Setor: ${action.originSectorName}`}
            >
              {cleanSectorName}
            </span>
          )}
          <PriorityBadge priority={action.priority} />
        </div>
      </div>

      {/* Main Title */}
      <h4
        style={{
          fontSize: '0.84375rem',
          fontWeight: 700,
          color: '#f1f5f9',
          fontFamily: 'var(--font-heading)',
          lineHeight: 1.35,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {action.title}
      </h4>

      {/* Optional Highlight Pill: Financial or Master Pending */}
      {(formattedSavings > 0 || isAwaitingApproval) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {formattedSavings > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.675rem',
                fontWeight: 700,
                color: isCompleted ? '#34d399' : '#38bdf8',
                backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.25)'}`,
                padding: '0.08rem 0.35rem',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              💰 {isCompleted ? 'Ganho:' : 'Est:'} {formatCurrency(formattedSavings)}
            </span>
          )}

          {isAwaitingApproval && action.status !== 'aguardando_aprovacao' && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#c084fc',
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '0.08rem 0.35rem',
                borderRadius: '4px',
              }}
            >
              ⏳ Validação Master
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer: Prazo & Responsável */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.35rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.7rem',
          color: '#94a3b8',
        }}
      >
        {/* Prazo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: isOverdue ? '#f87171' : '#94a3b8',
            fontWeight: isOverdue ? 700 : 500,
          }}
          title={isOverdue ? 'Prazo expirado' : `Data limite: ${formatDate(action.dueDate)}`}
        >
          <Calendar size={12} color={isOverdue ? '#f87171' : '#64748b'} />
          <span>{action.dueDate ? formatDate(action.dueDate) : '--'}</span>
          {isOverdue && (
            <span
              style={{
                fontSize: '0.575rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                padding: '0.02rem 0.2rem',
                borderRadius: '3px',
                fontWeight: 800,
              }}
            >
              Atraso
            </span>
          )}
        </div>

        {/* Responsável */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {action.assignedAgentName ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title={`Responsável: ${action.assignedAgentName}`}
            >
              <img
                src={
                  action.assignedAgentAvatar ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                }
                alt={action.assignedAgentName}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  color: '#cbd5e1',
                  maxWidth: '75px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {action.assignedAgentName.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span style={{ color: '#475569', fontStyle: 'italic', fontSize: '0.65rem' }}>
              Sem agente
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
