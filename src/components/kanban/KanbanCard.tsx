'use client';

import React from 'react';
import { LeanAction } from '@/lib/types';
import { formatDate, formatCurrency, getFollowUpMonthsFilledCount } from '@/lib/utils';
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

  // Palette de cores luminosas por status da ação
  const colorMap: Record<
    LeanAction['status'],
    { solid: string; border: string; glow: string; glowHover: string; bgBadge: string }
  > = {
    aberta: {
      solid: '#06b6d4',
      border: 'rgba(6, 182, 212, 0.45)',
      glow: 'rgba(6, 182, 212, 0.22)',
      glowHover: 'rgba(6, 182, 212, 0.5)',
      bgBadge: 'rgba(6, 182, 212, 0.12)',
    },
    em_andamento: {
      solid: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.45)',
      glow: 'rgba(245, 158, 11, 0.22)',
      glowHover: 'rgba(245, 158, 11, 0.5)',
      bgBadge: 'rgba(245, 158, 11, 0.12)',
    },
    aguardando_aprovacao: {
      solid: '#a855f7',
      border: 'rgba(168, 85, 247, 0.55)',
      glow: 'rgba(168, 85, 247, 0.3)',
      glowHover: 'rgba(168, 85, 247, 0.65)',
      bgBadge: 'rgba(168, 85, 247, 0.15)',
    },
    concluida: {
      solid: '#10b981',
      border: 'rgba(16, 185, 129, 0.45)',
      glow: 'rgba(16, 185, 129, 0.22)',
      glowHover: 'rgba(16, 185, 129, 0.5)',
      bgBadge: 'rgba(16, 185, 129, 0.12)',
    },
    nao_aprovada: {
      solid: '#ef4444',
      border: 'rgba(239, 68, 68, 0.45)',
      glow: 'rgba(239, 68, 68, 0.22)',
      glowHover: 'rgba(239, 68, 68, 0.5)',
      bgBadge: 'rgba(239, 68, 68, 0.12)',
    },
  };

  const currentTheme =
    isAwaitingApproval && action.status !== 'aguardando_aprovacao'
      ? colorMap.aguardando_aprovacao
      : colorMap[action.status] || colorMap.aberta;

  return (
    <div
      onClick={onClick}
      className="kanban-card"
      style={{
        backgroundColor: '#0c1424',
        borderRadius: '10px',
        padding: '0.75rem 0.85rem',
        border: `1.5px solid ${currentTheme.border}`,
        borderLeft: `4px solid ${currentTheme.solid}`,
        boxShadow: `0 3px 10px rgba(0, 0, 0, 0.35), 0 0 12px ${currentTheme.glow}`,
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        position: 'relative',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 25px rgba(0, 0, 0, 0.5), 0 0 20px ${currentTheme.glowHover}`;
        e.currentTarget.style.borderColor = currentTheme.solid;
        e.currentTarget.style.backgroundColor = '#101c33';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 3px 10px rgba(0, 0, 0, 0.35), 0 0 12px ${currentTheme.glow}`;
        e.currentTarget.style.borderColor = currentTheme.border;
        e.currentTarget.style.backgroundColor = '#0c1424';
      }}
    >
      {/* Top Row: Protocol + Sector + Priority */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.675rem',
            fontWeight: 800,
            color: currentTheme.solid,
            backgroundColor: currentTheme.bgBadge,
            padding: '0.1rem 0.4rem',
            borderRadius: '4px',
            border: `1px solid ${currentTheme.border}`,
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
                color: '#cbd5e1',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.08rem 0.35rem',
                borderRadius: '4px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                maxWidth: '85px',
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
          color: '#f8fafc',
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
                backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
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
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                padding: '0.08rem 0.35rem',
                borderRadius: '4px',
              }}
            >
              ⏳ Validação Master
            </span>
          )}

          {/* Badge de Acompanhamento de 3 Meses */}
          {(() => {
            const monthsFilled = getFollowUpMonthsFilledCount(action);
            if (monthsFilled === 0 || isCompleted) return null;
            return (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: monthsFilled === 3 ? '#34d399' : '#fbbf24',
                  backgroundColor: monthsFilled === 3 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                  border: `1px solid ${monthsFilled === 3 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`,
                  padding: '0.08rem 0.35rem',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
                title={monthsFilled === 3 ? '3 meses preenchidos: Pronto para homologação master' : `${monthsFilled}/3 meses de acompanhamento preenchidos`}
              >
                📅 {monthsFilled}/3m {monthsFilled === 3 ? '✓' : ''}
              </span>
            );
          })()}
        </div>
      )}

      {/* Bottom Footer: Prazo & Responsável */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.35rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
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
            color: isOverdue ? '#f87171' : isCompleted ? '#34d399' : '#94a3b8',
            fontWeight: isOverdue ? 700 : 500,
          }}
          title={isOverdue ? 'Prazo expirado' : `Data limite: ${formatDate(action.dueDate)}`}
        >
          <Calendar size={12} color={isOverdue ? '#f87171' : isCompleted ? '#34d399' : '#64748b'} />
          <span>{action.dueDate ? formatDate(action.dueDate) : '--'}</span>
          {isOverdue && (
            <span
              style={{
                fontSize: '0.575rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '0.02rem 0.25rem',
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
