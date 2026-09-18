'use client';

import React, { useState } from 'react';
import {
  LeanWasteCategory,
  ActionPriority,
  LeanAssessmentDimensionId,
  ASSESSMENT_DIMENSIONS_CONFIG,
  STRATEGIC_PILLARS_CONFIG,
  StrategicObjective,
} from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { WASTE_CATEGORIES } from '@/lib/utils';
import { PlusCircle, DollarSign, UserCheck, Building, Target, Sparkles } from 'lucide-react';

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
  const sectors = React.useMemo(() => dataService.getSectors(), [isOpen]);
  const strategicObjectives = React.useMemo(() => dataService.getStrategicObjectives(), [isOpen]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [strategicObjectiveId, setStrategicObjectiveId] = useState('');
  const [wasteCategory, setWasteCategory] = useState<LeanWasteCategory>('espera');
  const [assessmentDimensionId, setAssessmentDimensionId] = useState<LeanAssessmentDimensionId>('tpm_oee');
  const [originSectorId, setOriginSectorId] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('media');
  const [estimatedCostAvoided, setEstimatedCostAvoided] = useState<string>('20000');
  const [dueDate, setDueDate] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const currentSectors = dataService.getSectors();
      const currentObjectives = dataService.getStrategicObjectives();
      setTitle('');
      setDescription('');
      setStrategicObjectiveId(currentObjectives[0]?.id || '');
      setWasteCategory('espera');
      setAssessmentDimensionId('tpm_oee');
      setOriginSectorId(currentSectors[0]?.id || '');
      setAssignedAgentId(allAgents[0]?.id || '');
      setPriority('media');
      setEstimatedCostAvoided('20000');
      setDueDate('');
    }
  }, [isOpen]);

  const handleWasteChange = (cat: LeanWasteCategory) => {
    setWasteCategory(cat);
    setAssessmentDimensionId(dataService.getDefaultAssessmentDimensionForWaste(cat));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const selectedObj = strategicObjectiveId
      ? strategicObjectives.find((o) => o.id === strategicObjectiveId)
      : undefined;

    const estCost = parseFloat(estimatedCostAvoided.replace(/[^0-9.]/g, '')) || 0;

    dataService.createActionByAdmin({
      tenantId: currentTenant.id,
      title,
      description,
      strategicObjectiveId: selectedObj?.id,
      strategicObjectiveName: selectedObj ? `${selectedObj.code} - ${selectedObj.title}` : undefined,
      wasteCategory,
      assessmentDimensionId,
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
          <label className="form-label" style={{ color: '#cbd5e1' }}>Título da Ação / Projeto Lean:</label>
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
          <label className="form-label" style={{ color: '#cbd5e1' }}>Descrição do Problema / Oportunidade:</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Descreva o cenário atual, o desperdício identificado e o objetivo da intervenção..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Diretriz da Alta Gerência (Hoshin Kanri) - Alinhamento Inteligente */}
        <div
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1.5px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
            <label className="form-label" style={{ color: '#60a5fa', margin: 0, fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Target size={15} style={{ color: '#3b82f6' }} />
              Convergência Estratégica (Hoshin Kanri)
            </label>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              ✨ Sensei IA Avaliará Automaticamente
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
            O Sensei IA analisará o projeto e calculará a aderência à diretriz corporativa ideal. Você também pode definir manualmente:
          </p>

          <select
            className="form-select"
            value={strategicObjectiveId}
            onChange={(e) => setStrategicObjectiveId(e.target.value)}
            style={{ backgroundColor: '#020617', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#f8fafc' }}
          >
            <option value="">Atribuição Automática pelo Sensei IA (Recomendado)</option>
            {strategicObjectives.map((obj) => {
              const pillarConfig = STRATEGIC_PILLARS_CONFIG[obj.pillar];
              return (
                <option key={obj.id} value={obj.id}>
                  {obj.code} • {obj.title} ({pillarConfig?.shortLabel || obj.pillar})
                </option>
              );
            })}
          </select>

          {strategicObjectiveId && (() => {
            const selected = strategicObjectives.find((o) => o.id === strategicObjectiveId);
            if (!selected) return null;
            const pConfig = STRATEGIC_PILLARS_CONFIG[selected.pillar];
            return (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: pConfig?.color || '#38bdf8', fontWeight: 600 }}>
                  {pConfig?.icon} {pConfig?.label}
                </span>
                <span>• Patrocinador: <strong style={{ color: '#e2e8f0' }}>{selected.sponsor}</strong></span>
                {selected.targetValue ? (
                  <span>• Meta: <strong style={{ color: '#22c55e' }}>{selected.unitLabel} {selected.targetValue.toLocaleString('pt-BR')}</strong></span>
                ) : null}
              </div>
            );
          })()}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Setor de Origem / Aplicação:</label>
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
            <label className="form-label" style={{ color: '#cbd5e1' }}>Agente Responsável:</label>
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
            <label className="form-label" style={{ color: '#cbd5e1' }}>Tipo de Desperdício Lean:</label>
            <select
              className="form-select"
              value={wasteCategory}
              onChange={(e) => handleWasteChange(e.target.value as LeanWasteCategory)}
            >
              {Object.entries(WASTE_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Prioridade:</label>
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

        {/* Eixo Alvo do Lean Assessment */}
        <div style={{ backgroundColor: 'rgba(34, 211, 238, 0.05)', border: '1.5px solid rgba(34, 211, 238, 0.25)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
            <label className="form-label" style={{ color: '#22d3ee', margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>
              🎯 Eixo Alvo do Lean Assessment:
            </label>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Os ganhos deste Kaizen formarão o valor auditado deste eixo no setor
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
            {(Object.entries(ASSESSMENT_DIMENSIONS_CONFIG) as [LeanAssessmentDimensionId, typeof ASSESSMENT_DIMENSIONS_CONFIG[LeanAssessmentDimensionId]][]).map(([dimId, config]) => {
              const isSelected = assessmentDimensionId === dimId;
              return (
                <button
                  type="button"
                  key={dimId}
                  onClick={() => setAssessmentDimensionId(dimId)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.2)' : '#020617',
                    border: isSelected ? '1.5px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.65rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1rem' }}>{config.icon}</span>
                    <strong style={{ fontSize: '0.775rem', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                      {config.shortName}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.2 }}>
                    {config.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Custo Evitado Estimado (R$):</label>
            <input
              type="number"
              className="form-control"
              placeholder="Ex: 20000"
              value={estimatedCostAvoided}
              onChange={(e) => setEstimatedCostAvoided(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Data Limite (Prazo):</label>
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
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
