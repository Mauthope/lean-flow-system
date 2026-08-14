'use client';

import React, { useState, useMemo } from 'react';
import { LeanAction, ActionStatus, LeanWasteCategory, ActionPriority } from '@/lib/types';
import { KanbanColumn } from './KanbanColumn';
import { ActionDetailModal } from './ActionDetailModal';
import { dataService } from '@/services/dataService';
import { WASTE_CATEGORIES } from '@/lib/utils';
import { Search, Filter, RefreshCw, Plus, Building2, AlertTriangle, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface KanbanBoardProps {
  actions: LeanAction[];
  onRefresh: () => void;
  isAgentView?: boolean;
  onNewAction?: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  actions,
  onRefresh,
  isAgentView,
  onNewAction,
}) => {
  const { allAgents } = useAuth();
  const sectors = dataService.getSectors();

  const [selectedAction, setSelectedAction] = useState<LeanAction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedWaste, setSelectedWaste] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');

  // Filter actions
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = action.title.toLowerCase().includes(q);
        const matchesDesc = action.description.toLowerCase().includes(q);
        const matchesProtocol = action.protocol.toLowerCase().includes(q);
        const matchesAgent = action.assignedAgentName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesProtocol && !matchesAgent) {
          return false;
        }
      }

      // Sector
      if (selectedSector !== 'all' && action.originSectorId !== selectedSector && action.targetSectorId !== selectedSector) {
        return false;
      }

      // Waste Category
      if (selectedWaste !== 'all' && action.wasteCategory !== selectedWaste) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'all' && action.priority !== selectedPriority) {
        return false;
      }

      // Agent (for Admin view)
      if (selectedAgent !== 'all' && action.assignedAgentId !== selectedAgent) {
        return false;
      }

      return true;
    });
  }, [actions, searchQuery, selectedSector, selectedWaste, selectedPriority, selectedAgent]);

  const handleCardClick = (action: LeanAction) => {
    setSelectedAction(action);
  };

  const handleQuickMove = (action: LeanAction, newStatus: ActionStatus) => {
    if (newStatus === 'concluida') {
      // Open modal so user can input actual avoided cost
      setSelectedAction(action);
    } else {
      dataService.updateActionStatus(action.id, newStatus);
      onRefresh();
    }
  };

  const columns: ActionStatus[] = ['aberta', 'em_andamento', 'concluida', 'nao_aprovada'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por protocolo, título, agente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', fontSize: '0.84375rem' }}
          />
        </div>

        {/* Selects */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
          >
            <option value="all">🏢 Todos os Setores</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Waste Category Filter */}
          <select
            value={selectedWaste}
            onChange={(e) => setSelectedWaste(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
          >
            <option value="all">⚡ Todos os Desperdícios</option>
            {Object.entries(WASTE_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
          >
            <option value="all">🎯 Todas Prioridades</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* Agent Filter (for Admin) */}
          {!isAgentView && (
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
            >
              <option value="all">👤 Todos os Agentes</option>
              {allAgents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          )}

          {/* Action buttons */}
          <button
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            title="Recarregar dados"
            style={{ padding: '0.5rem 0.75rem' }}
          >
            <RefreshCw size={14} />
          </button>

          {onNewAction && (
            <button
              onClick={onNewAction}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.5rem 0.85rem' }}
            >
              <Plus size={15} /> Nova Ação
            </button>
          )}
        </div>
      </div>

      {/* Kanban 4 Columns Grid */}
      <div className="kanban-wrapper">
        <div className="kanban-grid">
          {columns.map((status) => {
            const colActions = filteredActions.filter((a) => a.status === status);
            return (
              <KanbanColumn
                key={status}
                status={status}
                actions={colActions}
                onCardClick={handleCardClick}
                onQuickMove={handleQuickMove}
                isAgentView={isAgentView}
              />
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <ActionDetailModal
        action={selectedAction}
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        onUpdate={() => {
          onRefresh();
          // Update modal instance
          if (selectedAction) {
            const fresh = dataService.getActionById(selectedAction.id);
            setSelectedAction(fresh || null);
          }
        }}
      />
    </div>
  );
};
