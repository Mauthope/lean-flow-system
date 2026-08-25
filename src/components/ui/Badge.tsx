'use client';

import React from 'react';
import { ActionStatus, ActionPriority, LeanWasteCategory } from '@/lib/types';
import { STATUS_CONFIG, PRIORITY_CONFIG, WASTE_CATEGORIES } from '@/lib/utils';

export function StatusBadge({ status }: { status: ActionStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.aberta;
  
  const styles: Record<ActionStatus, { bg: string; text: string; border: string }> = {
    aberta: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    em_andamento: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    aguardando_aprovacao: { bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe' },
    concluida: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
    nao_aprovada: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  };

  const style = styles[status] || styles.aberta;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.text,
        }}
      />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ActionPriority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.media;

  const styles: Record<ActionPriority, { bg: string; text: string; border: string }> = {
    baixa: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
    media: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
    alta: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    critica: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  };

  const style = styles[priority] || styles.media;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.15rem 0.5rem',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
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
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        fontSize: '0.725rem',
        fontWeight: 600,
        backgroundColor: '#f8fafc',
        color: '#334155',
        border: '1px solid #e2e8f0',
      }}
    >
      ⚡ {cat.label}
    </span>
  );
}
