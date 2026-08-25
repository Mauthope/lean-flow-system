'use client';

import React from 'react';
import { ActionStatus, ActionPriority, LeanWasteCategory } from '@/lib/types';
import { STATUS_CONFIG, PRIORITY_CONFIG, WASTE_CATEGORIES } from '@/lib/utils';

export function StatusBadge({ status }: { status: ActionStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.aberta;
  
  const styles: Record<ActionStatus, { bg: string; text: string; border: string }> = {
    aberta: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
    em_andamento: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
    aguardando_aprovacao: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.35)' },
    concluida: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
    nao_aprovada: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
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
          boxShadow: `0 0 6px ${style.text}`,
        }}
      />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ActionPriority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.media;

  const styles: Record<ActionPriority, { bg: string; text: string; border: string }> = {
    baixa: { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.25)' },
    media: { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.35)' },
    alta: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
    critica: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
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
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: '#cbd5e1',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        whiteSpace: 'nowrap',
      }}
    >
      ⚡ {cat.label}
    </span>
  );
}
