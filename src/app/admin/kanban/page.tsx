'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { NewActionModal } from '@/components/forms/NewActionModal';

export default function AdminKanbanPage() {
  const { dataVersion, refreshData, currentUser, currentTenant } = useAuth();
  const { isDark } = useTheme();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const isViewer = currentUser?.role === 'viewer';

  const actions = useMemo(() => {
    return dataService.getActions(currentTenant?.id);
  }, [dataVersion, currentTenant?.id]);

  React.useEffect(() => {
    dataService.syncActionsFromCloud(currentTenant?.id).then(() => {
      refreshData();
    }).catch(() => {});
  }, [refreshData, currentTenant?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Fluxo Geral de Trabalho Lean (Kanban)
          </h2>
          <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#64748b' }}>
            Acompanhamento global de ações da unidade <strong style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>{currentTenant?.name || 'Unidade'}</strong> ({actions.length} {actions.length === 1 ? 'projeto registrado' : 'projetos registrados'})
          </p>
        </div>
      </div>

      <KanbanBoard
        actions={actions}
        onRefresh={refreshData}
        onNewAction={isViewer ? undefined : () => setIsNewModalOpen(true)}
      />

      <NewActionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
