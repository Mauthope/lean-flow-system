'use client';

import React from 'react';
import { LeanAction } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { PriorityBadge } from '@/components/ui/Badge';
import {
  Calendar,
  Building2,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface KanbanCardProps {
  action: LeanAction;
  onClick: () => void;
  onQuickMove?: (action: LeanAction, newStatus: LeanAction['status']) => void;
  isAgentView?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  action,
  onClick,
  onQuickMove,
  isAgentView,
}) => {
  const isAwaitingApproval = action.status === 'aguardando_aprovacao' || (action.submittedForApproval && !action.masterApproved);
  const isCompleted = action.status === 'concluida';
  const isRejected = action.status === 'nao_aprovada';
  const isInProgress = action.status === 'em_andamento';
  const isOpen = action.status === 'aberta';

  // Check if overdue
  const isOverdue =
    action.dueDate &&
    !isCompleted &&
    !isRejected &&
    new Date(action.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const formattedSavings = action.status === 'concluida'
    ? action.actualCostAvoided
    : (action.estimatedCostAvoided || 0);

  const cleanSectorName = action.originSectorName
    ? action.originSectorName.replace(/,/g, '').trim().split(' ')[0]
    : '';

  return (
    <div
      onClick={onClick}
      className="kanban-card"
      style={{
        backgroundColor: '#101a33',
        borderRadius: '12px',
        padding: '0.875rem 1rem',
        border: isAwaitingApproval ? '1.5px solid rgba(192, 132, 252, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: isCompleted
          ? '4px solid #10b981'
          : isAwaitingApproval
          ? '4px solid #9333ea'
          : isInProgress
          ? '4px solid #f59e0b'
          : isRejected
          ? '4px solid #ef4444'
          : '4px solid #06b6d4',
        boxShadow: isAwaitingApproval
          ? '0 4px 14px rgba(147, 51, 234, 0.2)'
          : '0 2px 8px rgba(0, 0, 0, 0.35)',
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isAwaitingApproval
          ? '0 8px 25px rgba(147, 51, 234, 0.3), 0 0 15px rgba(147, 51, 234, 0.2)'
          : '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.15)';
        e.currentTarget.style.borderColor = isAwaitingApproval ? '#c084fc' : 'rgba(34, 211, 238, 0.4)';
        e.currentTarget.style.backgroundColor = '#132244';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isAwaitingApproval
          ? '0 4px 14px rgba(147, 51, 234, 0.2)'
          : '0 2px 8px rgba(0, 0, 0, 0.35)';
        e.currentTarget.style.borderColor = isAwaitingApproval ? 'rgba(192, 132, 252, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.backgroundColor = '#101a33';
      }}
    >
      {/* Top Row: Protocol & Priority / Sector Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.725rem',
            fontWeight: 800,
            color: '#22d3ee',
            backgroundColor: 'rgba(6, 10, 19, 0.85)',
            padding: '0.12rem 0.45rem',
            borderRadius: '4px',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {action.protocol}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
          {cleanSectorName && (
            <span
              style={{
                fontSize: '0.675rem',
                color: '#cbd5e1',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.12rem 0.45rem',
                borderRadius: '4px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
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
          fontSize: '0.875rem',
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'var(--font-heading)',
          lineHeight: 1.35,
          margin: 0,
          letterSpacing: '-0.01em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {action.title}
      </h4>

      {/* Financial Return Pill (if any) */}
      {formattedSavings > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: isCompleted ? '#34d399' : '#22d3ee',
              backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(6, 182, 212, 0.12)',
              border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
              padding: '0.12rem 0.45rem',
              borderRadius: '5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              whiteSpace: 'nowrap',
            }}
          >
            <span>💰</span>
            <span>{isCompleted ? 'Ganho:' : 'Est:'} {formatCurrency(formattedSavings)}</span>
          </span>
        </div>
      )}

      {/* Waiting Approval Master Badge */}
      {isAwaitingApproval && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'rgba(147, 51, 234, 0.18)',
            border: '1px solid rgba(192, 132, 252, 0.35)',
            color: '#c084fc',
            padding: '0.2rem 0.45rem',
            borderRadius: '5px',
            fontSize: '0.675rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          <span>🟡</span>
          <span>AGUARDANDO APROVAÇÃO MASTER</span>
        </div>
      )}

      {/* Bottom Info: Prazo & Responsável */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.45rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          marginTop: '0.1rem',
          fontSize: '0.725rem',
        }}
      >
        {/* Prazo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: isOverdue ? '#f87171' : isCompleted ? '#34d399' : '#94a3b8',
            fontWeight: isOverdue ? 800 : 500,
            whiteSpace: 'nowrap',
          }}
          title={isOverdue ? 'Prazo expirado' : `Data limite: ${formatDate(action.dueDate)}`}
        >
          <Calendar size={13} color={isOverdue ? '#f87171' : isCompleted ? '#34d399' : '#94a3b8'} />
          <span>
            {action.dueDate ? formatDate(action.dueDate) : 'Sem prazo'}
          </span>
          {isOverdue && (
            <span
              style={{
                fontSize: '0.6rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.05rem 0.25rem',
                borderRadius: '4px',
                fontWeight: 800,
              }}
            >
              Atrasado
            </span>
          )}
        </div>

        {/* Responsável */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {action.assignedAgentName ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
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
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  color: '#e2e8f0',
                  maxWidth: '85px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {action.assignedAgentName.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.7rem' }}>
              Sem agente
            </span>
          )}
        </div>
      </div>

      {/* Quick Move Button if provided for agent */}
      {onQuickMove && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.35rem',
            borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
            Clique p/ abrir detalhes ↗
          </span>

          {isOpen && (
            <button
              onClick={() => onQuickMove(action, 'em_andamento')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
            >
              Iniciar <ArrowRight size={12} />
            </button>
          )}

          {isInProgress && (
            <button
              onClick={() => onQuickMove(action, 'concluida')}
              className="btn btn-success btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
            >
              Concluir ✓
            </button>
          )}
        </div>
      )}
    </div>
  );
};
