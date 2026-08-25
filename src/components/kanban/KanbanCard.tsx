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

  return (
    <div
      onClick={onClick}
      className="kanban-card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '0.95rem 1rem',
        border: isAwaitingApproval ? '1.5px solid #c084fc' : '1px solid #e2e8f0',
        borderLeft: isCompleted
          ? '4px solid #10b981'
          : isAwaitingApproval
          ? '4px solid #9333ea'
          : isInProgress
          ? '4px solid #f59e0b'
          : isRejected
          ? '4px solid #ef4444'
          : '4px solid #3b82f6',
        boxShadow: isAwaitingApproval
          ? '0 4px 14px rgba(147, 51, 234, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = isAwaitingApproval
          ? '0 8px 22px rgba(147, 51, 234, 0.2)'
          : '0 8px 20px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = isAwaitingApproval ? '#a855f7' : '#93c5fd';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isAwaitingApproval
          ? '0 4px 14px rgba(147, 51, 234, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.borderColor = isAwaitingApproval ? '#c084fc' : '#e2e8f0';
      }}
    >
      {/* Top Row: Protocol & Priority / Sector Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.725rem',
            fontWeight: 800,
            color: '#475569',
            backgroundColor: '#f1f5f9',
            padding: '0.1rem 0.4rem',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            letterSpacing: '0.02em',
          }}
        >
          {action.protocol}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {action.originSectorName && (
            <span
              style={{
                fontSize: '0.675rem',
                color: '#475569',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                fontWeight: 600,
                maxWidth: '105px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={`Setor: ${action.originSectorName}`}
            >
              {action.originSectorName.split(' ')[0]}
            </span>
          )}
          <PriorityBadge priority={action.priority} />
        </div>
      </div>

      {/* Main Title */}
      <h4
        style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#0f172a',
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

      {/* Financial Return Pill (if any) */}
      {formattedSavings > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: isCompleted ? '#047857' : '#2563eb',
              backgroundColor: isCompleted ? '#ecfdf5' : '#eff6ff',
              border: `1px solid ${isCompleted ? '#a7f3d0' : '#bfdbfe'}`,
              padding: '0.1rem 0.45rem',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
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
            backgroundColor: '#faf5ff',
            border: '1px solid #d8b4fe',
            color: '#7e22ce',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.675rem',
            fontWeight: 900,
            letterSpacing: '0.02em',
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
          borderTop: '1px solid #f1f5f9',
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
            color: isOverdue ? '#dc2626' : isCompleted ? '#059669' : '#64748b',
            fontWeight: isOverdue ? 700 : 500,
          }}
          title={isOverdue ? 'Prazo expirado' : `Data limite: ${formatDate(action.dueDate)}`}
        >
          <Calendar size={13} color={isOverdue ? '#dc2626' : isCompleted ? '#059669' : '#64748b'} />
          <span>
            {action.dueDate ? formatDate(action.dueDate) : 'Sem prazo'}
          </span>
          {isOverdue && (
            <span
              style={{
                fontSize: '0.6rem',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
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
                  border: '1.5px solid #cbd5e1',
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  color: '#334155',
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
            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.7rem' }}>
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
            borderTop: '1px dashed #e2e8f0',
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
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: '#b45309' }}
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
