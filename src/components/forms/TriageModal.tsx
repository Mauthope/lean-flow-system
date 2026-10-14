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
  SenseiStrategicAudit,
} from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { WASTE_CATEGORIES } from '@/lib/utils';
import {
  evaluateDemandTriageWithSensei,
  getLocalFallbackDemandTriage,
} from '@/services/geminiService';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  Target,
  Edit3,
  Layers,
  Sparkles,
  Lightbulb,
  Camera,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  Info,
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
  const [assessmentDimensionIds, setAssessmentDimensionIds] = useState<LeanAssessmentDimensionId[]>(['tpm_oee']);
  const [refinedTitle, setRefinedTitle] = useState('');
  const [refinedDescription, setRefinedDescription] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Estados de IA e Alinhamento Hoshin Kanri
  const [isEvaluatingSensei, setIsEvaluatingSensei] = useState(false);
  const [strategicAudit, setStrategicAudit] = useState<SenseiStrategicAudit | null>(null);
  const [supervisorJustification, setSupervisorJustification] = useState('');
  const [senseiSuggestedDimensions, setSenseiSuggestedDimensions] = useState<LeanAssessmentDimensionId[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sincroniza dados da demanda ao abrir o modal com Auto-Enquadramento Sensei
  useEffect(() => {
    if (action && isOpen) {
      setPriority(action.priority || 'media');
      setAssignedAgentId(action.assignedAgentId || (allAgents[0]?.id || ''));
      setDecision('approve');
      setRejectionReason('');
      setSupervisorJustification(action.supervisorAdherenceJustification || '');
      setValidationError(null);

      // Enquadramento Heurístico Imediato (Zero Latência)
      const initialFallback = getLocalFallbackDemandTriage(
        action,
        action.strategicObjectiveId || undefined,
        strategicObjectives
      );

      const chosenObjId = action.strategicObjectiveId || initialFallback.matchedObjectiveId || strategicObjectives[0]?.id || '';
      setStrategicObjectiveId(chosenObjId);

      const dims = action.assessmentDimensionIds && action.assessmentDimensionIds.length > 0
        ? action.assessmentDimensionIds
        : initialFallback.assessmentDimensionIds;
      setAssessmentDimensionIds(dims);
      setSenseiSuggestedDimensions(initialFallback.assessmentDimensionIds);

      const cat = action.wasteCategory || initialFallback.wasteCategory;
      setWasteCategory(cat);

      const rTitle = action.title
        ? (action.title.trim().length > 10 ? action.title.trim() : initialFallback.refinedTitle)
        : initialFallback.refinedTitle;
      setRefinedTitle(rTitle);

      const rDesc = action.description
        ? (action.description.trim().length > 15 ? action.description.trim() : initialFallback.refinedDescription)
        : initialFallback.refinedDescription;
      setRefinedDescription(rDesc);

      const audit = action.senseiStrategicAudit || initialFallback.strategicAudit;
      setStrategicAudit(audit);

      // Refinamento Neural do Sensei em background
      setIsEvaluatingSensei(true);
      evaluateDemandTriageWithSensei({
        action: {
          ...action,
          title: rTitle,
          description: rDesc,
          wasteCategory: cat,
          assessmentDimensionIds: dims,
        },
        targetObjectiveId: chosenObjId,
        strategicObjectives,
      })
        .then((enr) => {
          if (enr) {
            if (!action.assessmentDimensionIds || action.assessmentDimensionIds.length === 0) {
              setAssessmentDimensionIds(enr.assessmentDimensionIds);
            }
            setSenseiSuggestedDimensions(enr.assessmentDimensionIds);
            if (!action.strategicObjectiveId && enr.matchedObjectiveId) {
              setStrategicObjectiveId(enr.matchedObjectiveId);
            }
            if (!action.senseiStrategicAudit) {
              setStrategicAudit(enr.strategicAudit);
            }
          }
        })
        .catch((e) => {
          console.warn('[TriageModal] Enriquecimento neural silencioso:', e);
        })
        .finally(() => {
          setIsEvaluatingSensei(false);
        });
    }
  }, [action, allAgents, isOpen, strategicObjectives]);

  if (!action) return null;

  const handleManualRunSensei = async () => {
    if (!action) return;
    setIsEvaluatingSensei(true);
    setValidationError(null);

    try {
      const enrichment = await evaluateDemandTriageWithSensei({
        action: {
          ...action,
          title: refinedTitle || action.title,
          description: refinedDescription || action.description,
          wasteCategory,
          assessmentDimensionIds,
        },
        targetObjectiveId: strategicObjectiveId,
        strategicObjectives,
      });

      if (enrichment) {
        setWasteCategory(enrichment.wasteCategory);
        setAssessmentDimensionIds(enrichment.assessmentDimensionIds);
        setSenseiSuggestedDimensions(enrichment.assessmentDimensionIds);
        setRefinedTitle(enrichment.refinedTitle);
        setRefinedDescription(enrichment.refinedDescription);
        if (enrichment.matchedObjectiveId) {
          setStrategicObjectiveId(enrichment.matchedObjectiveId);
        }
        setStrategicAudit(enrichment.strategicAudit);
      }
    } catch (err) {
      console.warn('[TriageModal] Erro ao reclassificar com Sensei:', err);
    } finally {
      setIsEvaluatingSensei(false);
    }
  };

  const handleStrategicObjectiveChange = (newObjId: string) => {
    setStrategicObjectiveId(newObjId);
    if (validationError) setValidationError(null);

    if (action) {
      const fallback = getLocalFallbackDemandTriage(
        {
          ...action,
          title: refinedTitle || action.title,
          description: refinedDescription || action.description,
          wasteCategory,
          assessmentDimensionIds,
        },
        newObjId,
        strategicObjectives
      );
      setStrategicAudit(fallback.strategicAudit);

      evaluateDemandTriageWithSensei({
        action: {
          ...action,
          title: refinedTitle || action.title,
          description: refinedDescription || action.description,
          wasteCategory,
          assessmentDimensionIds,
        },
        targetObjectiveId: newObjId,
        strategicObjectives,
      })
        .then((enr) => {
          if (enr?.strategicAudit) {
            setStrategicAudit(enr.strategicAudit);
          }
        })
        .catch(() => {});
    }
  };

  const handleWasteChange = (cat: LeanWasteCategory) => {
    setWasteCategory(cat);
    const def = dataService.getDefaultAssessmentDimensionForWaste(cat);
    setAssessmentDimensionIds((prev) => (prev.includes(def) ? prev : [def, ...prev]));
  };

  const handleToggleDimension = (dimId: LeanAssessmentDimensionId) => {
    setAssessmentDimensionIds((prev) => {
      if (prev.includes(dimId)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dimId);
      }
      return [...prev, dimId];
    });
  };

  const isLowAlignment = Boolean(strategicAudit && strategicAudit.alignmentScore < 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (decision === 'approve') {
      if (isLowAlignment && supervisorJustification.trim().length < 15) {
        setValidationError(
          'O alinhamento estratégico com o Hoshin Kanri é baixo (< 50%). É obrigatório que o supervisor registre a justificativa técnica de aderência (mínimo de 15 caracteres) para aprovação desta ação.'
        );
        return;
      }
    }

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
      senseiStrategicAudit: decision === 'approve' ? (strategicAudit || undefined) : undefined,
      supervisorAdherenceJustification:
        decision === 'approve' && (isLowAlignment || supervisorJustification.trim())
          ? supervisorJustification.trim()
          : undefined,
      assessmentDimensionId: decision === 'approve' ? assessmentDimensionIds[0] : undefined,
      assessmentDimensionIds: decision === 'approve' ? assessmentDimensionIds : undefined,
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
          {/* Se originada pelo Canal Kaizen, exibe Carimbo de Autenticidade & Origem */}
          {action.isKaizenIdea && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: isDark ? 'rgba(34, 211, 238, 0.15)' : '#e0f2fe',
                border: isDark ? '1px solid rgba(34, 211, 238, 0.35)' : '1px solid #7dd3fc',
                color: isDark ? '#22d3ee' : '#0369a1',
                padding: '0.3rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginBottom: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Lightbulb size={14} />
              <span>
                CANAL KAIZEN • {action.kaizenOrigin === 'toten' ? 'TOTEN FÁBRICA' : 'FORMULÁRIO WEB'}
              </span>
              {action.kaizenIdeaProtocol && (
                <span style={{ opacity: 0.85 }}>({action.kaizenIdeaProtocol})</span>
              )}
              {action.kaizenCategory && (
                <span
                  style={{
                    marginLeft: '0.35rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(3, 105, 161, 0.12)',
                    fontSize: '0.7rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {action.kaizenCategory}
                </span>
              )}
            </div>
          )}

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

          {/* Foto Anexada Kaizen se houver */}
          {action.kaizenPhotoUrl && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: isDark ? '1px dashed rgba(255, 255, 255, 0.08)' : '1px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Camera size={13} /> Foto Anexada do Ponto de Melhoria (Opcional)
                </span>
                <a
                  href={action.kaizenPhotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.7rem', color: isDark ? '#22d3ee' : '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 700 }}
                >
                  <ExternalLink size={12} /> Abrir em tamanho real
                </a>
              </div>
              <div
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  maxHeight: '160px',
                  maxWidth: '240px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                  backgroundColor: '#000000',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={action.kaizenPhotoUrl}
                  alt="Evidência Kaizen"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
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
            {/* Sensei IA: Enquadramento Inteligente & Alinhamento Hoshin */}
            <div
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : '#eff6ff',
                border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#60a5fa' : '#2563eb',
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: isDark ? '#ffffff' : '#1e3a8a' }}>
                    Auto-Enquadramento Lean & Alinhamento Hoshin (Sensei IA)
                  </strong>
                  <p style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#475569', margin: 0 }}>
                    {isEvaluatingSensei
                      ? 'Sensei IA analisando o relato do Gemba e mensurando convergência com a diretriz corporativa...'
                      : 'Os pilares do assessment e a aderência estratégica foram pré-classificados automaticamente pela IA.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualRunSensei}
                disabled={isEvaluatingSensei}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: isDark ? '#38bdf8' : '#0284c7',
                  borderColor: isDark ? 'rgba(56, 189, 248, 0.35)' : '#bae6fd',
                }}
              >
                <Sparkles size={13} className={isEvaluatingSensei ? 'animate-spin' : ''} />
                <span>{isEvaluatingSensei ? 'Analisando...' : 'Reclassificar com Sensei'}</span>
              </button>
            </div>

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
                  <span>Eixos Alvo do Lean Assessment (Preenchidos pelo Sensei IA):</span>
                </label>
                <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Selecione um ou mais eixos impactados por este projeto Kaizen
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                {(Object.entries(ASSESSMENT_DIMENSIONS_CONFIG) as [LeanAssessmentDimensionId, typeof ASSESSMENT_DIMENSIONS_CONFIG[LeanAssessmentDimensionId]][]).map(([dimId, config]) => {
                  const isSelected = assessmentDimensionIds.includes(dimId);
                  const isSuggestedBySensei = senseiSuggestedDimensions.includes(dimId);

                  return (
                    <button
                      type="button"
                      key={dimId}
                      onClick={() => handleToggleDimension(dimId)}
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
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <strong style={{ fontSize: '0.775rem', color: isSelected ? (isDark ? '#ffffff' : '#0369a1') : (isDark ? '#cbd5e1' : '#334155') }}>
                          {config.shortName}
                        </strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {isSuggestedBySensei && (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 800,
                                color: isDark ? '#38bdf8' : '#0284c7',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '4px',
                              }}
                              title="Pilar sugerido pelo Sensei IA com base no relato do Gemba"
                            >
                              <Sparkles size={9} /> Sensei
                            </span>
                          )}
                          {isSelected && (
                            <span style={{ fontSize: '0.65rem', color: isDark ? '#22d3ee' : '#0284c7', fontWeight: 800 }}>✓</span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.2 }}>
                        {config.description}
                      </span>
                    </button>
                  );
                })}
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
                  onChange={(e) => handleStrategicObjectiveChange(e.target.value)}
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

            {/* Card de Aderência Hoshin Kanri & Parecer Explicativo do Sensei */}
            {strategicAudit && (
              <div
                style={{
                  backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                  border: isLowAlignment
                    ? (isDark ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1.5px solid #fca5a5')
                    : (isDark ? '1.5px solid rgba(59, 130, 246, 0.3)' : '1.5px solid #bfdbfe'),
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* Header com Score */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={16} color={isLowAlignment ? '#ef4444' : '#3b82f6'} />
                    <strong style={{ fontSize: '0.85rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                      Convergência Estratégica: Hoshin Kanri
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: strategicAudit.alignmentScore >= 70
                          ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7')
                          : strategicAudit.alignmentScore >= 50
                          ? (isDark ? 'rgba(56, 189, 248, 0.2)' : '#e0f2fe')
                          : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
                        color: strategicAudit.alignmentScore >= 70
                          ? (isDark ? '#4ade80' : '#15803d')
                          : strategicAudit.alignmentScore >= 50
                          ? (isDark ? '#38bdf8' : '#0284c7')
                          : (isDark ? '#f87171' : '#b91c1c'),
                        border: strategicAudit.alignmentScore >= 70
                          ? '1px solid #86efac'
                          : strategicAudit.alignmentScore >= 50
                          ? '1px solid #7dd3fc'
                          : '1px solid #fca5a5',
                      }}
                    >
                      Aderência: {strategicAudit.alignmentScore}% • {strategicAudit.alignmentScore >= 70 ? 'Alta' : strategicAudit.alignmentScore >= 50 ? 'Moderada' : 'Baixa (< 50%)'}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso do Alinhamento */}
                <div style={{ width: '100%', height: '6px', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(5, strategicAudit.alignmentScore))}%`,
                      height: '100%',
                      backgroundColor: strategicAudit.alignmentScore >= 70 ? '#22c55e' : strategicAudit.alignmentScore >= 50 ? '#0284c7' : '#ef4444',
                      borderRadius: '9999px',
                      transition: 'all 0.5s ease',
                    }}
                  />
                </div>

                {/* Texto Explicativo: Por que este valor percentual foi gerado */}
                <div
                  style={{
                    backgroundColor: isDark ? 'rgba(2, 6, 23, 0.7)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sparkles size={12} />
                      Por que o valor de {strategicAudit.alignmentScore}% foi gerado (Parecer do Sensei IA):
                    </span>
                    <span style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {strategicAudit.modelUsed || 'Sensei IA'}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.78125rem', color: isDark ? '#e2e8f0' : '#334155', lineHeight: 1.45, fontStyle: 'italic' }}>
                    "{strategicAudit.justification}"
                  </p>

                  {strategicAudit.contributionSummary && (
                    <div style={{ fontSize: '0.725rem', color: isDark ? '#4ade80' : '#16a34a', fontWeight: 700, marginTop: '0.15rem' }}>
                      Resumo de Impacto: {strategicAudit.contributionSummary}
                    </div>
                  )}

                  {strategicAudit.improvementSuggestions && strategicAudit.improvementSuggestions.length > 0 && (
                    <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: isDark ? '1px dashed rgba(255, 255, 255, 0.08)' : '1px dashed #e2e8f0' }}>
                      <span style={{ fontSize: '0.675rem', fontWeight: 700, color: isDark ? '#fbbf24' : '#b45309', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <TrendingUp size={11} /> Dicas do Sensei para elevar a convergência aos objetivos da diretoria:
                      </span>
                      <ul style={{ margin: '0.2rem 0 0', paddingLeft: '1.1rem', fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.35 }}>
                        {strategicAudit.improvementSuggestions.map((sug, idx) => (
                          <li key={idx}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Justificativa Obrigatória do Supervisor para Baixo Alinhamento (< 50%) */}
            {isLowAlignment && (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2',
                  border: isDark ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid #f87171',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDark ? '#f87171' : '#b91c1c' }}>
                  <AlertTriangle size={18} />
                  <strong style={{ fontSize: '0.85rem' }}>
                    Alinhamento Hoshin Reduzido ({strategicAudit?.alignmentScore || 0}%): Justificativa Obrigatória do Supervisor
                  </strong>
                </div>

                <p style={{ fontSize: '0.78125rem', color: isDark ? '#cbd5e1' : '#475569', margin: 0, lineHeight: 1.45 }}>
                  A demanda possui aderência baixa às metas corporativas anuais vigentes. Para aprovação no Kanban, é <strong>obrigatório</strong> que o supervisor registre a justificativa técnica, operacional ou de segurança desta iniciativa para o chão de fábrica mesmo sem atender diretamente a uma diretriz da Alta Gerência.
                </p>

                <div>
                  <label className="form-label" style={{ color: isDark ? '#f87171' : '#b91c1c', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                    Justificativa de Aderência do Supervisor: *
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Explique por que esta melhoria de chão de fábrica é essencial para a operação (ex: segurança imediata, ergonomia, eliminação de gargalo na célula) mesmo sem atender diretamente à diretriz anual..."
                    value={supervisorJustification}
                    onChange={(e) => {
                      setSupervisorJustification(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    required
                    style={{
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : '#f87171',
                      fontSize: '0.8125rem',
                      backgroundColor: isDark ? '#020617' : '#ffffff',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: supervisorJustification.trim().length >= 15 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
                      {supervisorJustification.trim().length >= 15 ? '✓ Justificativa atende ao critério mínimo' : `Mínimo de 15 caracteres (${supervisorJustification.trim().length}/15)`}
                    </span>
                    <span style={{ fontSize: '0.675rem', color: isDark ? '#64748b' : '#94a3b8' }}>
                      Gravada no projeto e auditável pela diretoria
                    </span>
                  </div>
                </div>
              </div>
            )}
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

        {/* Banner de Erro de Validação */}
        {validationError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
              border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #fca5a5',
              color: isDark ? '#f87171' : '#b91c1c',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{validationError}</span>
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
