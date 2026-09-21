'use client';

import React from 'react';
import { ActionStatus, ActionPriority, LeanWasteCategory } from '@/lib/types';
import { STATUS_CONFIG, PRIORITY_CONFIG, WASTE_CATEGORIES } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export function StatusBadge({ status }: { status: ActionStatus }) {
  const { isDark } = useTheme();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.aberta;
  
  const styles: Record<ActionStatus, { bg: string; text: string; border: string }> = isDark ? {
    aberta: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
    em_andamento: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
    aguardando_aprovacao: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.35)' },
    concluida: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
    nao_aprovada: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
  } : {
    aberta: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    em_andamento: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    aguardando_aprovacao: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    concluida: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    nao_aprovada: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  };

  const style = styles[status] || styles.aberta;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.15rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.725rem',
        fontWeight: 800,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.text,
          boxShadow: isDark ? `0 0 6px ${style.text}` : 'none',
        }}
      />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ActionPriority }) {
  const { isDark } = useTheme();
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.media;

  const styles: Record<ActionPriority, { bg: string; text: string; border: string }> = isDark ? {
    baixa: { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.25)' },
    media: { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.35)' },
    alta: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
    critica: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
  } : {
    baixa: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
    media: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
    alta: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    critica: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
  };

  const style = styles[priority] || styles.media;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.12rem 0.45rem',
        borderRadius: '4px',
        fontSize: '0.675rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      {config.label}
    </span>
  );
}

export function WasteCategoryBadge({ category }: { category: LeanWasteCategory }) {
  const { isDark } = useTheme();
  const cat = WASTE_CATEGORIES[category] || {
    label: category,
    badgeColor: '',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.15rem 0.5rem',
        borderRadius: '6px',
        fontSize: '0.725rem',
        fontWeight: 700,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
        color: isDark ? '#cbd5e1' : '#334155',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
        whiteSpace: 'nowrap',
      }}
    >
      ⚡ {cat.label}
    </span>
  );
}
