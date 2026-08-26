'use client';

import React, { useState } from 'react';
import { LeanAction, User, LeanWasteCategory, ActionPriority } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { WASTE_CATEGORIES } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Calendar, UserCheck } from 'lucide-react';

interface TriageModalProps {
  action: LeanAction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  action,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, allAgents } = useAuth();

  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('media');
  const [wasteCategory, setWasteCategory] = useState<LeanWasteCategory>('espera');
  const [dueDate, setDueDate] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Pre-fill on open
  React.useEffect(() => {
    if (action) {
      setPriority(action.priority || 'media');
      setWasteCategory(action.wasteCategory || 'espera');
      setAssignedAgentId(action.assignedAgentId || (allAgents[0]?.id || ''));
      setDecision('approve');
      setRejectionReason('');
    }
  }, [action, allAgents]);

  if (!action) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    dataService.triageDemand(action.id, {
      action: decision,
      assignedAgentId: decision === 'approve' ? assignedAgentId : undefined,
      priority: decision === 'approve' ? priority : undefined,
      wasteCategory: decision === 'approve' ? wasteCategory : undefined,
      dueDate: decision === 'approve' ? dueDate : undefined,
      rejectionReason: decision === 'reject' ? rejectionReason : undefined,
      adminName: currentUser.name,
    });

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Triagem de Demanda — ${action.protocol}`}
      subtitle="Analise, classifique e aprove ou recuse a demanda pública solicitada"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Requester Summary */}
        <div
          style={{
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Solicitante
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee' }}>
              Setor: {action.originSectorName}
            </span>
          </div>
          <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            {action.requesterName} {action.requesterDepartment ? `(${action.requesterDepartment})` : ''}
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{action.requesterEmail}</p>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>
              {action.title}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.4 }}>{action.description}</p>
          </div>
        </div>

        {/* Decision Toggle */}
        <div>
          <label className="form-label" style={{ color: '#cbd5e1' }}>Decisão do Supervisor:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setDecision('approve')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '10px',
                border: decision === 'approve' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: decision === 'approve' ? 'rgba(16, 185, 129, 0.15)' : '#090e1a',
                color: decision === 'approve' ? '#34d399' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={18} color={decision === 'approve' ? '#34d399' : '#94a3b8'} />
              Aprovar & Atribuir Agente
            </button>

            <button
              type="button"
              onClick={() => setDecision('reject')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '10px',
                border: decision === 'reject' ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: decision === 'reject' ? 'rgba(239, 68, 68, 0.15)' : '#090e1a',
                color: decision === 'reject' ? '#f87171' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <XCircle size={18} color={decision === 'reject' ? '#f87171' : '#94a3b8'} />
              Recusar / Não Aprovar
            </button>
          </div>
        </div>

        {/* Form if Approved */}
        {decision === 'approve' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease' }}>
            {/* Assign Agent */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>
                <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Agente Responsável pela Ação:
              </label>
              <select
                className="form-select"
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                required
              >
                <option value="">Selecione o agente...</option>
                {allAgents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} — {ag.sectorName || 'Agente'}
                  </option>
                ))}
              </select>
            </div>

            {/* Waste category and Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ color: '#cbd5e1' }}>Classificação do Desperdício Lean:</label>
                <select
                  className="form-select"
                  value={wasteCategory}
                  onChange={(e) => setWasteCategory(e.target.value as LeanWasteCategory)}
                >
                  {Object.entries(WASTE_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ color: '#cbd5e1' }}>Nível de Prioridade:</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ActionPriority)}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica (Interrupção de Linha)</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Prazo Limite para Conclusão:
              </label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        ) : (
          /* Form if Rejected */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fadeIn 0.2s ease' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#f87171' }}>
                Motivo / Justificativa da Não Aprovação: *
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Explique o motivo pelo qual a sugestão não pôde ser aprovada neste momento..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>

          <button
            type="submit"
            className={decision === 'approve' ? 'btn btn-primary' : 'btn btn-outline-danger'}
          >
            {decision === 'approve' ? 'Aprovar e Enviar para Kanban' : 'Confirmar Recusa da Demanda'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
