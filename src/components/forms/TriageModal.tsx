'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LeanAction,
  User,
  LeanWasteCategory,
  ActionPriority,
  LeanAssessmentDimensionId,
  ASSESSMENT_DIMENSIONS_CONFIG,
  StrategicObjective,
} from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { WASTE_CATEGORIES } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  Target,
  Edit3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { isDark } = useTheme();

  const strategicObjectives = useMemo(() => dataService.getStrategicObjectives(), [isOpen]);

  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('media');
  const [wasteCategory, setWasteCategory] = useState<LeanWasteCategory>('espera');
  const [strategicObjectiveId, setStrategicObjectiveId] = useState('');
  const [assessmentDimensionId, setAssessmentDimensionId] = useState<LeanAssessmentDimensionId>('tpm_oee');
  const [refinedTitle, setRefinedTitle] = useState('');
  const [refinedDescription, setRefinedDescription] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Sincroniza dados da demanda ao abrir o modal
  useEffect(() => {
    if (action) {
      setPriority(action.priority || 'media');
      const cat = action.wasteCategory || 'espera';
      setWasteCategory(cat);
      setAssignedAgentId(action.assignedAgentId || (allAgents[0]?.id || ''));
      setStrategicObjectiveId(action.strategicObjectiveId || (strategicObjectives[0]?.id || ''));
      setAssessmentDimensionId(
        action.assessmentDimensionId || dataService.getDefaultAssessmentDimensionForWaste(cat)
      );
      setRefinedTitle(action.title || '');
      setRefinedDescription(action.description || '');
      setDecision('approve');
      setRejectionReason('');
    }
  }, [action, allAgents, isOpen, strategicObjectives]);

  if (!action) return null;

  const handleWasteChange = (cat: LeanWasteCategory) => {
    setWasteCategory(cat);
    setAssessmentDimensionId(dataService.getDefaultAssessmentDimensionForWaste(cat));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const selectedObj = strategicObjectiveId
      ? strategicObjectives.find((o) => o.id === strategicObjectiveId)
      : undefined;

    dataService.triageDemand(action.id, {
      action: decision,
      assignedAgentId: decision === 'approve' ? assignedAgentId : undefined,
      priority: decision === 'approve' ? priority : undefined,
      wasteCategory: decision === 'approve' ? wasteCategory : undefined,
      strategicObjectiveId: decision === 'approve' ? selectedObj?.id : undefined,
      strategicObjectiveName:
        decision === 'approve' && selectedObj
          ? `${selectedObj.code} - ${selectedObj.title}`
          : undefined,
      assessmentDimensionId: decision === 'approve' ? assessmentDimensionId : undefined,
      refinedTitle: decision === 'approve' ? refinedTitle : undefined,
      refinedDescription: decision === 'approve' ? refinedDescription : undefined,
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
      title={`Triagem & Estruturação Lean — ${action.protocol}`}
      subtitle="Analise a demanda do chão de fábrica e estruture como uma Ação Lean formal"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {/* Resumo do Solicitante e Relato Original */}
        <div
          style={{
            backgroundColor: isDark ? '#090e1a' : '#f8fafc',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
              Relato Original do Gemba (Chão de Fábrica)
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#22d3ee' : '#0284c7' }}>
              Setor: {action.originSectorName || 'Fábrica'}
            </span>
          </div>
          <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)', margin: 0 }}>
            {action.requesterName} {action.requesterDepartment ? `(${action.requesterDepartment})` : ''}
          </p>
          {action.requesterEmail && (
            <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#475569', margin: '0.2rem 0 0' }}>
              {action.requesterEmail}
            </p>
          )}

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: isDark ? '1px dashed rgba(255, 255, 255, 0.08)' : '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
              Mensagem do Operador:
            </span>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0.2rem 0', fontFamily: 'var(--font-heading)' }}>
              {action.title}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.4, margin: 0 }}>
              {action.description}
            </p>
          </div>
        </div>

        {/* Alternância de Decisão */}
        <div>
          <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Decisão do Gestor:</label>
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
                border: decision === 'approve' ? '2px solid #10b981' : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                backgroundColor: decision === 'approve' ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7') : (isDark ? '#090e1a' : '#f8fafc'),
                color: decision === 'approve' ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle2 size={18} color={decision === 'approve' ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#94a3b8' : '#64748b')} />
              Aprovar & Estruturar Ação
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
                border: decision === 'reject' ? '2px solid #ef4444' : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                backgroundColor: decision === 'reject' ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2') : (isDark ? '#090e1a' : '#f8fafc'),
                color: decision === 'reject' ? (isDark ? '#f87171' : '#b91c1c') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <XCircle size={18} color={decision === 'reject' ? (isDark ? '#f87171' : '#b91c1c') : (isDark ? '#94a3b8' : '#64748b')} />
              Recusar / Não Aprovar
            </button>
          </div>
        </div>

        {/* Formulário Completo de Aprovação */}
        {decision === 'approve' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease' }}>
            {/* Título Refinado Padronizado */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155', margin: 0, fontWeight: 700 }}>
                  Título Padronizado da Ação Lean:
                </label>
                <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Lapide o relato do operador para uma redação técnica Kaizen
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Redução de tempos de espera no abastecimento da linha 3"
                value={refinedTitle}
                onChange={(e) => setRefinedTitle(e.target.value)}
                required
              />
            </div>

            {/* Descrição Técnica Refinada */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                Descrição Técnica do Escopo / Diagnóstico:
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Descreva o escopo da melhoria, as perdas observadas e o resultado esperado..."
                value={refinedDescription}
                onChange={(e) => setRefinedDescription(e.target.value)}
                required
              />
            </div>

            {/* Agente Responsável e Desperdício */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
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

              <div>
                <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Classificação do Desperdício Lean:</label>
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
            </div>

            {/* Objetivo Estratégico Hoshin e Prioridade */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                  <Target size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Objetivo Estratégico (Hoshin Kanri):
                </label>
                <select
                  className="form-select"
                  value={strategicObjectiveId}
                  onChange={(e) => setStrategicObjectiveId(e.target.value)}
                  required
                >
                  <option value="">Selecione o objetivo da fábrica...</option>
                  {strategicObjectives.map((obj) => (
                    <option key={obj.id} value={obj.id}>
                      {obj.code} — {obj.title} ({obj.pillar.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Nível de Prioridade:</label>
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

            {/* Eixo Alvo do Lean Assessment */}
            <div
              style={{
                backgroundColor: isDark ? 'rgba(34, 211, 238, 0.05)' : '#f0f9ff',
                border: isDark ? '1.5px solid rgba(34, 211, 238, 0.25)' : '1.5px solid #bae6fd',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <label
                  className="form-label"
                  style={{
                    color: isDark ? '#22d3ee' : '#0369a1',
                    margin: 0,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Target size={14} color={isDark ? '#22d3ee' : '#0369a1'} />
                  <span>Eixo Alvo do Lean Assessment:</span>
                </label>
                <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
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
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(34, 211, 238, 0.2)' : '#e0f2fe')
                          : (isDark ? '#020617' : '#ffffff'),
                        border: isSelected
                          ? (isDark ? '1.5px solid #22d3ee' : '1.5px solid #0284c7')
                          : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
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
                      <strong style={{ fontSize: '0.775rem', color: isSelected ? (isDark ? '#ffffff' : '#0369a1') : (isDark ? '#cbd5e1' : '#334155') }}>
                        {config.shortName}
                      </strong>
                      <span style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.2 }}>
                        {config.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Formulário de Recusa */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fadeIn 0.2s ease' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: isDark ? '#f87171' : '#b91c1c' }}>
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

        {/* Ações do Modal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
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
