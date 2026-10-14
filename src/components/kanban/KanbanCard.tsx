'use client';

import React from 'react';
import { LeanAction } from '@/lib/types';
import { formatDate, formatCurrency, getFollowUpMonthsFilledCount } from '@/lib/utils';
import { PriorityBadge } from '@/components/ui/Badge';
import { Calendar, DollarSign, Clock, Check, CheckSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';

interface KanbanCardProps {
  action: LeanAction;
  onClick: () => void;
  isAgentView?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  action,
  onClick,
}) => {
  const { isDark } = useTheme();

  // Resolução dinâmica do avatar mais recente do usuário para evitar placeholders ou fotos obsoletas
  const effectiveAvatar = React.useMemo(() => {
    if (action.assignedAgentId) {
      const u = dataService.getUserById(action.assignedAgentId);
      if (u?.avatarUrl) return u.avatarUrl;
    }
    if (action.assignedAgentName) {
      const cleanName = action.assignedAgentName.trim().toLowerCase();
      const u = dataService.getUsers('all').find((usr) => usr.name?.trim().toLowerCase() === cleanName);
      if (u?.avatarUrl) return u.avatarUrl;
    }
    return (
      action.assignedAgentAvatar ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    );
  }, [action.assignedAgentId, action.assignedAgentName, action.assignedAgentAvatar]);

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

  // Palette de cores vibrantes e contrastantes por status da ação (compatível com Dark e Light)
  const colorMap: Record<
    LeanAction['status'],
    { solid: string; border: string; glow: string; glowHover: string; bgBadge: string; textBadge: string; borderBadge: string }
  > = isDark ? {
    aberta: {
      solid: '#06b6d4',
      border: 'rgba(6, 182, 212, 0.45)',
      glow: 'rgba(6, 182, 212, 0.22)',
      glowHover: 'rgba(6, 182, 212, 0.5)',
      bgBadge: 'rgba(6, 182, 212, 0.12)',
      textBadge: '#22d3ee',
      borderBadge: 'rgba(6, 182, 212, 0.35)',
    },
    em_andamento: {
      solid: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.45)',
      glow: 'rgba(245, 158, 11, 0.22)',
      glowHover: 'rgba(245, 158, 11, 0.5)',
      bgBadge: 'rgba(245, 158, 11, 0.12)',
      textBadge: '#fbbf24',
      borderBadge: 'rgba(245, 158, 11, 0.35)',
    },
    aguardando_aprovacao: {
      solid: '#a855f7',
      border: 'rgba(168, 85, 247, 0.55)',
      glow: 'rgba(168, 85, 247, 0.3)',
      glowHover: 'rgba(168, 85, 247, 0.65)',
      bgBadge: 'rgba(168, 85, 247, 0.15)',
      textBadge: '#c084fc',
      borderBadge: 'rgba(168, 85, 247, 0.35)',
    },
    concluida: {
      solid: '#10b981',
      border: 'rgba(16, 185, 129, 0.45)',
      glow: 'rgba(16, 185, 129, 0.22)',
      glowHover: 'rgba(16, 185, 129, 0.5)',
      bgBadge: 'rgba(16, 185, 129, 0.12)',
      textBadge: '#34d399',
      borderBadge: 'rgba(16, 185, 129, 0.35)',
    },
    nao_aprovada: {
      solid: '#ef4444',
      border: 'rgba(239, 68, 68, 0.45)',
      glow: 'rgba(239, 68, 68, 0.22)',
      glowHover: 'rgba(239, 68, 68, 0.5)',
      bgBadge: 'rgba(239, 68, 68, 0.12)',
      textBadge: '#f87171',
      borderBadge: 'rgba(239, 68, 68, 0.35)',
    },
  } : {
    aberta: {
      solid: '#0284c7',
      border: '#bae6fd',
      glow: 'rgba(2, 132, 199, 0.12)',
      glowHover: 'rgba(2, 132, 199, 0.25)',
      bgBadge: '#e0f2fe',
      textBadge: '#0369a1',
      borderBadge: '#7dd3fc',
    },
    em_andamento: {
      solid: '#d97706',
      border: '#fde68a',
      glow: 'rgba(217, 119, 6, 0.12)',
      glowHover: 'rgba(217, 119, 6, 0.25)',
      bgBadge: '#fef3c7',
      textBadge: '#b45309',
      borderBadge: '#fcd34d',
    },
    aguardando_aprovacao: {
      solid: '#7c3aed',
      border: '#e9d5ff',
      glow: 'rgba(124, 58, 237, 0.12)',
      glowHover: 'rgba(124, 58, 237, 0.25)',
      bgBadge: '#f3e8ff',
      textBadge: '#6b21a8',
      borderBadge: '#d8b4fe',
    },
    concluida: {
      solid: '#059669',
      border: '#bbf7d0',
      glow: 'rgba(5, 150, 105, 0.12)',
      glowHover: 'rgba(5, 150, 105, 0.25)',
      bgBadge: '#dcfce7',
      textBadge: '#15803d',
      borderBadge: '#86efac',
    },
    nao_aprovada: {
      solid: '#dc2626',
      border: '#fecaca',
      glow: 'rgba(220, 38, 38, 0.12)',
      glowHover: 'rgba(220, 38, 38, 0.25)',
      bgBadge: '#fee2e2',
      textBadge: '#b91c1c',
      borderBadge: '#fca5a5',
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
        backgroundColor: isDark ? '#0c1424' : '#ffffff',
        borderRadius: '10px',
        padding: '0.85rem 0.95rem',
        border: `1.5px solid ${isDark ? currentTheme.border : '#cbd5e1'}`,
        borderLeft: `5px solid ${currentTheme.solid}`,
        boxShadow: isDark
          ? `0 3px 10px rgba(0, 0, 0, 0.35), 0 0 12px ${currentTheme.glow}`
          : '0 1px 3px 0 rgba(15, 23, 42, 0.07), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'relative',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = isDark
          ? `0 8px 25px rgba(0, 0, 0, 0.5), 0 0 20px ${currentTheme.glowHover}`
          : '0 12px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.06)';
        e.currentTarget.style.borderColor = currentTheme.solid;
        e.currentTarget.style.backgroundColor = isDark ? '#101c33' : '#ffffff';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? `0 3px 10px rgba(0, 0, 0, 0.35), 0 0 12px ${currentTheme.glow}`
          : '0 1px 3px 0 rgba(15, 23, 42, 0.07), 0 4px 10px -2px rgba(15, 23, 42, 0.05)';
        e.currentTarget.style.borderColor = isDark ? currentTheme.border : '#cbd5e1';
        e.currentTarget.style.backgroundColor = isDark ? '#0c1424' : '#ffffff';
      }}
    >
      {/* Top Row: Protocol + PDCA Stage + Sector + Priority */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.675rem',
              fontWeight: 800,
              color: currentTheme.textBadge,
              backgroundColor: currentTheme.bgBadge,
              padding: '0.12rem 0.45rem',
              borderRadius: '5px',
              border: `1px solid ${currentTheme.borderBadge}`,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {action.protocol}
          </span>

          {/* Badge da Etapa PDCA para projetos em andamento ou com metodologia definida */}
          {(isInProgress || action.pdcaStage) && !isCompleted && !isRejected && (() => {
            const stage = action.pdcaStage || 'plan';
            const stageConfig: Record<
              'plan' | 'do' | 'check' | 'act',
              { label: string; bg: string; text: string; border: string }
            > = isDark ? {
              plan: {
                label: 'P • PLAN',
                bg: 'rgba(6, 182, 212, 0.16)',
                text: '#22d3ee',
                border: 'rgba(6, 182, 212, 0.45)',
              },
              do: {
                label: 'D • DO',
                bg: 'rgba(245, 158, 11, 0.16)',
                text: '#fbbf24',
                border: 'rgba(245, 158, 11, 0.45)',
              },
              check: {
                label: 'C • CHECK',
                bg: 'rgba(168, 85, 247, 0.16)',
                text: '#c084fc',
                border: 'rgba(168, 85, 247, 0.45)',
              },
              act: {
                label: 'A • ACT',
                bg: 'rgba(16, 185, 129, 0.16)',
                text: '#34d399',
                border: 'rgba(16, 185, 129, 0.45)',
              },
            } : {
              plan: {
                label: 'P • PLAN',
                bg: '#e0f2fe',
                text: '#0369a1',
                border: '#7dd3fc',
              },
              do: {
                label: 'D • DO',
                bg: '#fef3c7',
                text: '#b45309',
                border: '#fcd34d',
              },
              check: {
                label: 'C • CHECK',
                bg: '#f3e8ff',
                text: '#7e22ce',
                border: '#d8b4fe',
              },
              act: {
                label: 'A • ACT',
                bg: '#dcfce7',
                text: '#15803d',
                border: '#86efac',
              },
            };

            const cfg = stageConfig[stage] || stageConfig.plan;

            return (
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.625rem',
                  fontWeight: 900,
                  color: cfg.text,
                  backgroundColor: cfg.bg,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '5px',
                  border: `1px solid ${cfg.border}`,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                title={`Etapa do Ciclo PDCA: ${stage.toUpperCase()}`}
              >
                {cfg.label}
              </span>
            );
          })()}

          {/* Carimbo Canal Kaizen */}
          {action.isKaizenIdea && (
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 900,
                color: isDark ? '#38bdf8' : '#0284c7',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#e0f2fe',
                border: isDark ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid #7dd3fc',
                padding: '0.08rem 0.35rem',
                borderRadius: '4px',
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
              }}
              title={`Iniciativa originada no Canal Kaizen (${action.kaizenOrigin === 'toten' ? 'Toten Chão de Fábrica' : 'Formulário Web'})`}
            >
              Kaizen {action.kaizenOrigin === 'toten' ? '• Toten' : ''}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {cleanSectorName && (
            <span
              style={{
                fontSize: '0.65rem',
                color: isDark ? '#cbd5e1' : '#1e293b',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                padding: '0.08rem 0.35rem',
                borderRadius: '4px',
                fontWeight: 700,
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
          fontWeight: 800,
          color: isDark ? '#f8fafc' : '#0f172a',
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

      {/* Optional Highlight Pill: Financial, Master Pending or 5W2H checklist */}
      {(formattedSavings > 0 || isAwaitingApproval || (action.checklist && action.checklist.length > 0)) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {formattedSavings > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.675rem',
                fontWeight: 800,
                color: isCompleted
                  ? (isDark ? '#34d399' : '#047857')
                  : (isDark ? '#38bdf8' : '#0369a1'),
                backgroundColor: isCompleted
                  ? (isDark ? 'rgba(16, 185, 129, 0.12)' : '#dcfce7')
                  : (isDark ? 'rgba(56, 189, 248, 0.12)' : '#e0f2fe'),
                border: `1px solid ${
                  isCompleted
                    ? (isDark ? 'rgba(16, 185, 129, 0.3)' : '#86efac')
                    : (isDark ? 'rgba(56, 189, 248, 0.3)' : '#7dd3fc')
                }`,
                padding: '0.1rem 0.4rem',
                borderRadius: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <DollarSign size={10} />
              <span>{isCompleted ? 'Ganho:' : 'Est:'} {formatCurrency(formattedSavings)}</span>
            </span>
          )}

          {isAwaitingApproval && action.status !== 'aguardando_aprovacao' && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: isDark ? '#c084fc' : '#6b21a8',
                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff',
                border: isDark ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid #d8b4fe',
                padding: '0.1rem 0.4rem',
                borderRadius: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Clock size={10} />
              <span>Validação Master</span>
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
                  color: monthsFilled === 3
                    ? (isDark ? '#34d399' : '#047857')
                    : (isDark ? '#fbbf24' : '#b45309'),
                  backgroundColor: monthsFilled === 3
                    ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7')
                    : (isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7'),
                  border: `1px solid ${
                    monthsFilled === 3
                      ? (isDark ? 'rgba(16, 185, 129, 0.4)' : '#86efac')
                      : (isDark ? 'rgba(251, 191, 36, 0.4)' : '#fcd34d')
                  }`,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title={monthsFilled === 3 ? '3 meses preenchidos: Pronto para homologação master' : `${monthsFilled}/3 meses de acompanhamento preenchidos`}
              >
                <Calendar size={10} />
                <span>{monthsFilled}/3m</span>
                {monthsFilled === 3 && <Check size={9} />}
              </span>
            );
          })()}

          {/* Badge de Ganho Pontual Único (One-Off) */}
          {action.isOneOffGain && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: isDark ? '#38bdf8' : '#0284c7',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                border: isDark ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid #7dd3fc',
                padding: '0.1rem 0.45rem',
                borderRadius: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Ganho financeiro pontual único certificado na homologação (sem necessidade de 12 meses de acompanhamento)"
            >
              <span>Pontual</span>
            </span>
          )}

          {/* 5W2H Checklist Progress Pill */}
          {action.checklist && action.checklist.length > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: action.checklist.every((c) => c.completed)
                  ? (isDark ? '#34d399' : '#047857')
                  : (isDark ? '#cbd5e1' : '#475569'),
                backgroundColor: action.checklist.every((c) => c.completed)
                  ? (isDark ? 'rgba(16, 185, 129, 0.12)' : '#dcfce7')
                  : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'),
                border: `1px solid ${
                  action.checklist.every((c) => c.completed)
                    ? (isDark ? 'rgba(16, 185, 129, 0.3)' : '#86efac')
                    : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1')
                }`,
                padding: '0.1rem 0.4rem',
                borderRadius: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title={`Ações 5W2H: ${action.checklist.filter((c) => c.completed).length} de ${action.checklist.length} concluídas`}
            >
              <CheckSquare size={10} color={action.checklist.every((c) => c.completed) ? (isDark ? '#34d399' : '#047857') : (isDark ? '#94a3b8' : '#64748b')} />
              <span>{action.checklist.filter((c) => c.completed).length}/{action.checklist.length} 5W2H</span>
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
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
          fontSize: '0.7rem',
          color: isDark ? '#94a3b8' : '#64748b',
        }}
      >
        {/* Prazo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: isOverdue
              ? (isDark ? '#f87171' : '#dc2626')
              : isCompleted
              ? (isDark ? '#34d399' : '#15803d')
              : (isDark ? '#94a3b8' : '#64748b'),
            fontWeight: isOverdue ? 700 : 500,
          }}
          title={isOverdue ? 'Prazo expirado' : `Data limite: ${formatDate(action.dueDate)}`}
        >
          <Calendar size={12} color={isOverdue ? (isDark ? '#f87171' : '#dc2626') : isCompleted ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#64748b' : '#94a3b8')} />
          <span>{action.dueDate ? formatDate(action.dueDate) : '--'}</span>
          {isOverdue && (
            <span
              style={{
                fontSize: '0.625rem',
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                color: isDark ? '#f87171' : '#b91c1c',
                border: isDark ? 'none' : '1px solid #fca5a5',
                padding: '0.05rem 0.35rem',
                borderRadius: '4px',
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
                src={effectiveAvatar}
                alt={action.assignedAgentName}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  color: isDark ? '#cbd5e1' : '#1e293b',
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
            <span style={{ color: isDark ? '#475569' : '#94a3b8', fontStyle: 'italic', fontSize: '0.65rem' }}>
              Sem agente
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
