'use client';

import React from 'react';
import { LeanAction } from '@/lib/types';
import { formatCurrency, WASTE_CATEGORIES } from '@/lib/utils';
import { PriorityBadge, WasteCategoryBadge, StatusBadge } from '@/components/ui/Badge';
import {
  Clock,
  DollarSign,
  CheckSquare,
  User as UserIcon,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Building,
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
  const completedChecklist = action.checklist?.filter((c) => c.completed || c.status === 'concluida').length || 0;
  const totalChecklist = action.checklist?.length || 0;

  const isCompleted = action.status === 'concluida';
  const isRejected = action.status === 'nao_aprovada';
  const isInProgress = action.status === 'em_andamento';
  const isOpen = action.status === 'aberta';

  const costValue = isCompleted ? action.actualCostAvoided : action.estimatedCostAvoided;

  return (
    <div
      onClick={onClick}
      className="kanban-card"
      style={{
        borderLeft: isCompleted
          ? '4px solid #10b981'
          : isInProgress
          ? '4px solid #f59e0b'
          : isRejected
          ? '4px solid #ef4444'
          : '4px solid #3b82f6',
      }}
    >
      {/* Card Header: Protocol & Priority */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.725rem',
            fontWeight: 700,
            color: '#64748b',
          }}
        >
          {action.protocol}
        </span>
        <PriorityBadge priority={action.priority} />
      </div>

      {/* Title */}
      <h4
        style={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.35,
          marginBottom: '0.4rem',
        }}
      >
        {action.title}
      </h4>

      {/* Description Snippet */}
      <p
        style={{
          fontSize: '0.8125rem',
          color: '#64748b',
          lineHeight: 1.4,
          marginBottom: '0.75rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {action.description}
      </p>

      {/* Waste Category Pill */}
      <div style={{ marginBottom: '0.75rem' }}>
        <WasteCategoryBadge category={action.wasteCategory} />
      </div>

      {/* Lean ROI & Avoided Cost Badge */}
      {costValue > 0 && (
        <div
          style={{
            backgroundColor: isCompleted ? '#ecfdf5' : '#f8fafc',
            border: isCompleted ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '0.35rem 0.6rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <DollarSign size={14} color={isCompleted ? '#059669' : '#0284c7'} />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isCompleted ? 'Custo Evitado Real:' : 'Custo Estimado:'}
            </span>
          </div>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 800,
              color: isCompleted ? '#047857' : '#0f172a',
            }}
          >
            {formatCurrency(costValue)}
          </span>
        </div>
      )}

      {/* Rejection Note if Rejected */}
      {isRejected && action.rejectionReason && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '0.4rem 0.6rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.35rem',
          }}
        >
          <AlertCircle size={14} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.3 }}>
            <strong>Recusa:</strong> {action.rejectionReason}
          </p>
        </div>
      )}

      {/* Card Footer: Metadata & Assigned Agent */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '0.625rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {totalChecklist > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#64748b', fontSize: '0.75rem' }}>
              <CheckSquare size={13} color={completedChecklist === totalChecklist ? '#10b981' : '#64748b'} />
              <span>
                {completedChecklist}/{totalChecklist}
              </span>
            </div>
          )}
          {action.notes?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#64748b', fontSize: '0.75rem' }}>
              <MessageSquare size={13} />
              <span>{action.notes.length}</span>
            </div>
          )}
          {action.originSectorName && (
            <span
              style={{
                fontSize: '0.7rem',
                color: '#64748b',
                maxWidth: '90px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={action.originSectorName}
            >
              🏢 {action.originSectorName}
            </span>
          )}
        </div>

        {/* Assigned Agent */}
        {action.assignedAgentName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} title={`Responsável: ${action.assignedAgentName}`}>
            <img
              src={
                action.assignedAgentAvatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={action.assignedAgentName}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #cbd5e1',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#334155',
                maxWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {action.assignedAgentName.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#94a3b8',
              fontStyle: 'italic',
            }}
          >
            Não atribuído
          </span>
        )}
      </div>

      {/* Quick Move Button for Agents or Admin */}
      {onQuickMove && (
        <div style={{ marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          {isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickMove(action, 'em_andamento');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', color: '#b45309' }}
            >
              Iniciar Execução <ArrowRight size={12} />
            </button>
          )}
          {isInProgress && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickMove(action, 'concluida');
              }}
              className="btn btn-success btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
            >
              Concluir Entrega ✓
            </button>
          )}
        </div>
      )}
    </div>
  );
};
