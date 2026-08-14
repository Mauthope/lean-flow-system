'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { NewActionModal } from '@/components/forms/NewActionModal';

export default function AdminKanbanPage() {
  const { dataVersion, refreshData } = useAuth();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const actions = useMemo(() => {
    return dataService.getActions();
  }, [dataVersion]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Fluxo Geral de Trabalho Lean (Kanban)
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Acompanhamento global de todas as ações abertas, em execução, concluídas e não aprovadas
          </p>
        </div>
      </div>

      <KanbanBoard
        actions={actions}
        onRefresh={refreshData}
        onNewAction={() => setIsNewModalOpen(true)}
      />

      <NewActionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
