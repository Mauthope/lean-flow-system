'use client';

import React, { useState } from 'react';
import { LeanWasteCategory, ActionPriority } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { WASTE_CATEGORIES } from '@/lib/utils';
import { PlusCircle, DollarSign, UserCheck, Building } from 'lucide-react';

interface NewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewActionModal: React.FC<NewActionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentTenant, allAgents } = useAuth();
  const sectors = dataService.getSectors();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wasteCategory, setWasteCategory] = useState<LeanWasteCategory>('espera');
  const [originSectorId, setOriginSectorId] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('media');
  const [estimatedCostAvoided, setEstimatedCostAvoided] = useState<string>('20000');
  const [dueDate, setDueDate] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setWasteCategory('espera');
      setOriginSectorId(sectors[0]?.id || '');
      setAssignedAgentId(allAgents[0]?.id || '');
      setPriority('media');
      setEstimatedCostAvoided('20000');
      setDueDate('');
    }
  }, [isOpen, sectors, allAgents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const estCost = parseFloat(estimatedCostAvoided.replace(/[^0-9.]/g, '')) || 0;

    dataService.createActionByAdmin({
      tenantId: currentTenant.id,
      title,
      description,
      wasteCategory,
      originSectorId,
      assignedAgentId: assignedAgentId || undefined,
      priority,
      status: 'aberta',
      isPublicDemand: false,
      estimatedCostAvoided: estCost,
      actualCostAvoided: 0,
      hoursSaved: 0,
      dueDate: dueDate || undefined,
      notes: [],
      checklist: [
        { id: 'ck_init_1', label: 'Mapeamento do estado atual e coleta de dados', completed: false },
        { id: 'ck_init_2', label: 'Elaboração do plano de contramedidas Lean', completed: false },
        { id: 'ck_init_3', label: 'Validação dos ganhos e padronização (SOP)', completed: false },
      ],
    });

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Nova Ação de Fluxo Lean"
      subtitle="Cadastre um novo plano de ação ou projeto Kaizen na esteira de trabalho"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Título da Ação / Projeto Lean:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: Redução de tempos de espera no abastecimento da linha 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Descrição do Problema / Oportunidade:</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Descreva o cenário atual, o desperdício identificado e o objetivo da intervenção..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Setor de Origem / Aplicação:</label>
            <select
              className="form-select"
              value={originSectorId}
              onChange={(e) => setOriginSectorId(e.target.value)}
              required
            >
              <option value="">Selecione o setor...</option>
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Agente Responsável:</label>
            <select
              className="form-select"
              value={assignedAgentId}
              onChange={(e) => setAssignedAgentId(e.target.value)}
            >
              <option value="">Deixar pendente de atribuição</option>
              {allAgents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.sectorName || 'Agente'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Tipo de Desperdício Lean:</label>
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
            <label className="form-label">Prioridade:</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ActionPriority)}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica (Interrupção de Fluxo)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Custo Evitado Estimado (R$):</label>
            <input
              type="number"
              className="form-control"
              placeholder="Ex: 20000"
              value={estimatedCostAvoided}
              onChange={(e) => setEstimatedCostAvoided(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Data Limite (Prazo):</label>
            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Criar Ação Lean
          </button>
        </div>
      </form>
    </Modal>
  );
};
