'use client';

import React from 'react';
import { LeanAction } from '@/lib/types';
import { formatDate } from '@/lib/utils';
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

  return (
    <div
      onClick={onClick}
      className="kanban-card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '1rem',
        border: '1px solid #e2e8f0',
        borderLeft: isCompleted
          ? '4px solid #10b981'
          : isInProgress
          ? '4px solid #f59e0b'
          : isRejected
          ? '4px solid #ef4444'
          : '4px solid #3b82f6',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#93c5fd';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* Top Row: Protocol & Priority / Sector Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.725rem',
            fontWeight: 700,
            color: '#64748b',
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
                backgroundColor: '#f1f5f9',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                fontWeight: 600,
                maxWidth: '110px',
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
          fontSize: '0.925rem',
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

      {/* Bottom Info: Prazo & Responsável */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid #f1f5f9',
          marginTop: '0.15rem',
          fontSize: '0.75rem',
        }}
      >
        {/* Prazo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: isOverdue ? '#dc2626' : isCompleted ? '#059669' : '#475569',
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
                fontSize: '0.625rem',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '0.05rem 0.3rem',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              Atrasado
            </span>
          )}
        </div>

        {/* Responsável */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {action.assignedAgentName ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
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
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #cbd5e1',
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  color: '#1e293b',
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
            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.725rem' }}>
              Sem responsável
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
