'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LeanAction, ActionStatus, User, ActionChecklistItem, ActivityStatus, ASSESSMENT_DIMENSIONS_CONFIG, ActivityAttachment, ActionQualityEvaluation } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { PriorityBadge, WasteCategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime, formatDate, WASTE_CATEGORIES, getFollowUpMonthsFilledCount, isThreeMonthsFollowUpCompleted } from '@/lib/utils';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { PostponeDeadlineModal } from '@/components/kanban/PostponeDeadlineModal';
import { ActivityAttachmentModal } from '@/components/kanban/ActivityAttachmentModal';
import { SenseiActionPokaYokeModal } from '@/components/kanban/SenseiActionPokaYokeModal';
import { evaluateActionQuality, evaluateProjectStrategicAlignment } from '@/services/geminiService';
import {
  DollarSign,
  Clock,
  CheckSquare,
  MessageSquare,
  User as UserIcon,
  AlertTriangle,
  FileText,
  Calendar,
  Send,
  Plus,
  ShieldAlert,
  CheckCircle,
  PlayCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  ListTodo,
  Sparkles,
  Layers,
  FileCheck,
  ExternalLink,
  Target,
  Eye,
  Paperclip,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActionDetailModalProps {
  action: LeanAction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ActionDetailModal: React.FC<ActionDetailModalProps> = ({
  action,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { currentUser, allAgents } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';

  // Notes
  const [newNoteText, setNewNoteText] = useState('');

  // Activity Form States
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityLabel, setActivityLabel] = useState('');
  const [activityStartDate, setActivityStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityEndDate, setActivityEndDate] = useState('');
  const [activityResponsible, setActivityResponsible] = useState(currentUser?.name || '');
  const [activitySector, setActivitySector] = useState('');
  const [activityTrackingDoc, setActivityTrackingDoc] = useState('');
  const [activityHours, setActivityHours] = useState('');
  const [activityObservations, setActivityObservations] = useState('');
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>('pendente');

  // Modais de Prazos, Anexos e Poka-Yoke do Sensei
  const [postponeModalActivity, setPostponeModalActivity] = useState<ActionChecklistItem | null>(null);
  const [attachmentModalActivity, setAttachmentModalActivity] = useState<ActionChecklistItem | null>(null);
  const [pokaYokeModalOpen, setPokaYokeModalOpen] = useState(false);
  const [qualityEvaluation, setQualityEvaluation] = useState<ActionQualityEvaluation | null>(null);
  const [pendingActivityPayload, setPendingActivityPayload] = useState<{
    label: string;
    startDate?: string;
    endDate?: string;
    responsibleName?: string;
    responsibleSectorName?: string;
    responsibleSectorId?: string;
    durationHours?: number;
    observations?: string;
    status?: ActivityStatus;
    trackingDocNumber?: string;
  } | null>(null);

  // Completion Form States & Cost Breakdown
  const [actualCostInput, setActualCostInput] = useState<string>('');
  const [hoursSavedInput, setHoursSavedInput] = useState<string>('');
  const [rootCauseInput, setRootCauseInput] = useState<string>('');
  const [conclusionDateInput, setConclusionDateInput] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  // Sub-categories of Cost Avoidance
  const [cbLabor, setCbLabor] = useState<string>('');
  const [cbProduction, setCbProduction] = useState<string>('');
  const [cbScrap, setCbScrap] = useState<string>('');
  const [cbDowntime, setCbDowntime] = useState<string>('');
  const [cbTooling, setCbTooling] = useState<string>('');
  const [cbLogistics, setCbLogistics] = useState<string>('');
  const [cbOther, setCbOther] = useState<string>('');
  const [cbOtherDesc, setCbOtherDesc] = useState<string>('');

  const [evaluatingAudit, setEvaluatingAudit] = useState(false);
  const allStrategicObjectives = React.useMemo(() => dataService.getStrategicObjectives(), [isOpen]);

  const availableSectors = useMemo(() => {
    try {
      return dataService.getSectors(action?.tenantId);
    } catch {
      return [];
    }
  }, [action?.tenantId, isOpen]);

  const trackingReq = useMemo(() => {
    return dataService.checkSectorRequiresTrackingDoc(activitySector, action?.tenantId);
  }, [activitySector, action?.tenantId]);

  if (!action) return null;

  const handleUpdateStrategicObjective = async (objectiveId: string) => {
    if (!action || isViewer) return;
    const targetObj = allStrategicObjectives.find((o) => o.id === objectiveId);
    if (targetObj) {
      setEvaluatingAudit(true);
      try {
        const audit = await evaluateProjectStrategicAlignment(action, targetObj);
        dataService.updateAction(action.id, {
          strategicObjectiveId: targetObj.id,
          strategicObjectiveName: `${targetObj.code} - ${targetObj.title}`,
          senseiStrategicAudit: audit,
        });
      } catch {
        dataService.updateAction(action.id, {
          strategicObjectiveId: targetObj.id,
          strategicObjectiveName: `${targetObj.code} - ${targetObj.title}`,
        });
      } finally {
        setEvaluatingAudit(false);
        onUpdate();
      }
    } else {
      dataService.updateAction(action.id, {
        strategicObjectiveId: undefined,
        strategicObjectiveName: undefined,
        senseiStrategicAudit: undefined,
      });
      onUpdate();
    }
  };

  const handleRunSenseiStrategicAudit = async () => {
    if (!action || isViewer) return;
    const objId = action.strategicObjectiveId || allStrategicObjectives[0]?.id;
    const targetObj = allStrategicObjectives.find((o) => o.id === objId) || allStrategicObjectives[0];
    if (!targetObj) return;

    setEvaluatingAudit(true);
    try {
      const audit = await evaluateProjectStrategicAlignment(action, targetObj);
      dataService.updateAction(action.id, {
        strategicObjectiveId: targetObj.id,
        strategicObjectiveName: `${targetObj.code} - ${targetObj.title}`,
        senseiStrategicAudit: audit,
      });
      onUpdate();
    } finally {
      setEvaluatingAudit(false);
    }
  };

  const handleStatusChange = (newStatus: ActionStatus) => {
    if (isViewer) return;
    if (newStatus === 'aguardando_aprovacao') {
      const uncompleted = dataService.getUncompletedActivities(action);
      if (uncompleted.length > 0) {
        alert(
          `Submissão Bloqueada!\n\nExistem ${uncompleted.length} atividade(s) do Plano de Ação 5W2H pendentes de conclusão:\n${uncompleted
            .map((u) => `• ${u.label} (${u.responsibleName || 'Sem responsável'})`)
            .join('\n')}\n\nConclua todas as etapas 5W2H antes de submeter o projeto para homologação.`
        );
        return;
      }
      const monthsFilled = getFollowUpMonthsFilledCount(action);
      if (monthsFilled < 3) {
        alert(
          `Submissão Bloqueada!\n\nConforme o fluxo Lean, o projeto só pode ser enviado para homologação após a adição dos resultados de 3 meses de acompanhamento pelo agente (Fase 4.3).\n\nProgresso atual: ${monthsFilled}/3 meses preenchidos.\n\nAbra a "Página Completa" do projeto para registrar as medições mensais pendentes.`
        );
        return;
      }
      dataService.updateAction(action.id, {
        status: 'aguardando_aprovacao',
        submittedForApproval: true,
        submittedForApprovalAt: new Date().toISOString(),
        submittedForApprovalBy: currentUser?.name || action.assignedAgentName || 'Agente Lean',
      });
      onUpdate();
      return;
    }

    if (newStatus === 'concluida') {
      const uncompleted = dataService.getUncompletedActivities(action);
      if (uncompleted.length > 0) {
        alert(
          `Homologação / Conclusão Bloqueada!\n\nExistem ${uncompleted.length} atividade(s) do Plano de Ação 5W2H pendentes de conclusão:\n${uncompleted
            .map((u) => `• ${u.label} (${u.responsibleName || 'Sem responsável'})`)
            .join('\n')}\n\nTodas as ações 5W2H devem estar finalizadas no Gemba antes de concluir o projeto.`
        );
        return;
      }
      // Poka-Yoke de Governança: Se tiver ganho monetário, exige aprovação da Controladoria
      const hasGain = dataService.hasMonetaryGain(action);
      if (hasGain && !dataService.isControllershipApproved(action)) {
        alert(
          '⚠️ CONCLUSÃO BLOQUEADA PELA CONTROLADORIA!\n\nEste projeto possui ganhos monetários identificados. Pela governança corporativa, projetos com retorno financeiro devem ser obrigatoriamente submetidos à Controladoria e homologados pelo auditor contábil antes da conclusão final.\n\nPor favor, abra a "Página Completa" do projeto (Passo 4.2b) para submeter à Controladoria.'
        );
        return;
      }

      if (hasGain) {
        const monthsFilled = getFollowUpMonthsFilledCount(action);
        if (monthsFilled < 3) {
          alert(
            `Homologação / Conclusão Bloqueada!\n\nA homologação de projetos com retorno financeiro exige a comprovação prévia dos 3 meses de acompanhamento pelo agente (atualmente ${monthsFilled}/3 meses preenchidos).\n\nAbra a "Página Completa" do projeto para lançar as medições.`
          );
          return;
        }
      }
      setShowCompletionForm(true);
      setConclusionDateInput(action.conclusionDate || new Date().toISOString().split('T')[0]);
      const defaultAvg = action.quarterlyFollowUp?.averageCostAvoided || action.actualCostAvoided || action.estimatedCostAvoided || '';
      setActualCostInput(String(defaultAvg));
      setHoursSavedInput(String(action.hoursSaved || ''));
      setRootCauseInput(action.rootCauseAnalysis || '');

      // Populate breakdown if exists
      if (action.costBreakdown) {
        setShowDetailedBreakdown(true);
        setCbLabor(String(action.costBreakdown.laborSavings || ''));
        setCbProduction(String(action.costBreakdown.productionIncrease || ''));
        setCbScrap(String(action.costBreakdown.scrapReduction || ''));
        setCbDowntime(String(action.costBreakdown.machineDowntime || ''));
        setCbTooling(String(action.costBreakdown.toolingAndEnergy || ''));
        setCbLogistics(String(action.costBreakdown.logisticsAndFreight || ''));
        setCbOther(String(action.costBreakdown.otherSavings || ''));
        setCbOtherDesc(action.costBreakdown.otherSavingsDescription || '');
      }
      return;
    }

    dataService.updateActionStatus(action.id, newStatus);
    onUpdate();
  };

  const handleUpdateBreakdownField = (field: string, val: string) => {
    let labor = field === 'labor' ? parseFloat(val) || 0 : parseFloat(cbLabor) || 0;
    let prod = field === 'prod' ? parseFloat(val) || 0 : parseFloat(cbProduction) || 0;
    let scrap = field === 'scrap' ? parseFloat(val) || 0 : parseFloat(cbScrap) || 0;
    let down = field === 'down' ? parseFloat(val) || 0 : parseFloat(cbDowntime) || 0;
    let tool = field === 'tool' ? parseFloat(val) || 0 : parseFloat(cbTooling) || 0;
    let log = field === 'log' ? parseFloat(val) || 0 : parseFloat(cbLogistics) || 0;
    let other = field === 'other' ? parseFloat(val) || 0 : parseFloat(cbOther) || 0;

    const total = labor + prod + scrap + down + tool + log + other;
    if (total > 0) {
      setActualCostInput(String(total));
    }
  };

  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    const cost = parseFloat(actualCostInput.replace(/[^0-9.]/g, '')) || 0;
    const hours = parseFloat(hoursSavedInput) || 0;

    // Validação de Governança: Se houver ganho financeiro declarado, exige Controladoria
    const willHaveGain = cost > 0 || dataService.hasMonetaryGain(action);
    if (willHaveGain && !dataService.isControllershipApproved(action)) {
      alert(
        '⚠️ HOMOLOGAÇÃO BLOQUEADA PELA CONTROLADORIA!\n\nFoi identificado um ganho financeiro declarado. Conforme a regra de governança corporativa, projetos com retorno financeiro devem ser obrigatoriamente submetidos à Controladoria e certificados pelo auditor contábil antes de concluir.\n\nPor favor, acesse a "Página Completa" do projeto (Passo 4.2b) para submeter à Controladoria.'
      );
      return;
    }

    const costBreakdown = {
      laborSavings: parseFloat(cbLabor) || 0,
      productionIncrease: parseFloat(cbProduction) || 0,
      scrapReduction: parseFloat(cbScrap) || 0,
      machineDowntime: parseFloat(cbDowntime) || 0,
      toolingAndEnergy: parseFloat(cbTooling) || 0,
      logisticsAndFreight: parseFloat(cbLogistics) || 0,
      otherSavings: parseFloat(cbOther) || 0,
      otherSavingsDescription: cbOtherDesc.trim() || undefined,
    };

    dataService.updateActionStatus(action.id, 'concluida', {
      actualCostAvoided: cost,
      hoursSaved: hours,
      rootCauseAnalysis: rootCauseInput,
      costBreakdown,
      conclusionDate: conclusionDateInput,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setShowCompletionForm(false);
    onUpdate();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentUser || isViewer) return;

    dataService.addActionNote(action.id, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      text: newNoteText.trim(),
    });

    setNewNoteText('');
    onUpdate();
  };

  const commitNewActivityRecord = (itemData: {
    label: string;
    startDate?: string;
    endDate?: string;
    responsibleName?: string;
    responsibleSectorName?: string;
    responsibleSectorId?: string;
    durationHours?: number;
    observations?: string;
    status?: ActivityStatus;
    trackingDocNumber?: string;
  }) => {
    if (!action) return;

    dataService.addActivityRecord(action.id, {
      label: itemData.label,
      startDate: itemData.startDate,
      endDate: itemData.endDate,
      responsibleName: itemData.responsibleName,
      responsibleSectorName: itemData.responsibleSectorName,
      responsibleSectorId: itemData.responsibleSectorId,
      durationHours: itemData.durationHours,
      observations: itemData.observations,
      status: itemData.status || 'pendente',
      trackingDocNumber: itemData.trackingDocNumber,
    });

    // Reset Form
    setActivityLabel('');
    setActivityStartDate(new Date().toISOString().split('T')[0]);
    setActivityEndDate('');
    setActivityResponsible(currentUser?.name || '');
    setActivitySector('');
    setActivityTrackingDoc('');
    setActivityHours('');
    setActivityObservations('');
    setActivityStatus('pendente');
    setShowActivityForm(false);
    setPokaYokeModalOpen(false);
    setQualityEvaluation(null);
    setPendingActivityPayload(null);
    onUpdate();
  };

  const handleAddActivityRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityLabel.trim() || isViewer || !action) return;

    const chosenSector = activitySector.trim() || action.originSectorName || 'Geral';
    const foundSector = availableSectors.find(
      (s) => s.name.toLowerCase() === chosenSector.toLowerCase() || s.id === chosenSector
    );

    // Validação de documento de rastreio (OC / OS) para compras / manutenção
    const req = dataService.checkSectorRequiresTrackingDoc(chosenSector, action.tenantId);
    if (req.required && !activityTrackingDoc.trim()) {
      alert(`Atenção: O setor "${chosenSector}" exige obrigatoriamente o preenchimento de: ${req.label}`);
      return;
    }

    const payload = {
      label: activityLabel.trim(),
      startDate: activityStartDate || undefined,
      endDate: activityEndDate || undefined,
      responsibleName: activityResponsible.trim() || currentUser?.name || undefined,
      responsibleSectorName: foundSector?.name || chosenSector,
      responsibleSectorId: foundSector?.id,
      durationHours: activityHours ? parseFloat(activityHours) : undefined,
      observations: activityObservations.trim() || undefined,
      status: activityStatus,
      trackingDocNumber: activityTrackingDoc.trim() || undefined,
    };

    // Poka-Yoke do Sensei IA: Avaliar se a ação é genérica
    const quality = evaluateActionQuality(activityLabel, {
      sectorName: foundSector?.name || chosenSector,
      projectName: action.title,
    });
    if (quality.isGeneric) {
      setQualityEvaluation(quality);
      setPendingActivityPayload(payload);
      setPokaYokeModalOpen(true);
      return;
    }

    commitNewActivityRecord(payload);
  };

  const handleAdoptQualitySuggestion = (improvedText: string) => {
    if (pendingActivityPayload) {
      commitNewActivityRecord({ ...pendingActivityPayload, label: improvedText });
    }
  };

  const handleConfirmPostpone = (newEndDate: string, reason: string) => {
    if (!action || !postponeModalActivity) return;
    dataService.postponeActivityDeadline(
      action.id,
      postponeModalActivity.id,
      newEndDate,
      reason,
      currentUser?.name || 'Agente Lean'
    );
    setPostponeModalActivity(null);
    onUpdate();
  };

  const handleSaveActivityAttachment = (attachment: ActivityAttachment) => {
    if (!action || !attachmentModalActivity) return;
    dataService.attachFileToActivity(
      action.id,
      attachmentModalActivity.id,
      attachment
    );
    setAttachmentModalActivity(null);
    onUpdate();
  };

  const handleRemoveActivityAttachment = () => {
    if (!action || !attachmentModalActivity) return;
    dataService.removeActivityAttachment(
      action.id,
      attachmentModalActivity.id
    );
    setAttachmentModalActivity(null);
    onUpdate();
  };

  const handleStartActivity = (activityId: string) => {
    if (isViewer) return;
    const today = new Date().toISOString().split('T')[0];
    dataService.updateActivityRecord(action.id, activityId, {
      status: 'em_andamento',
      startDate: today,
      completed: false,
    });
    onUpdate();
  };

  const handleFinishActivity = (activityId: string) => {
    if (isViewer) return;
    const today = new Date().toISOString().split('T')[0];
    dataService.updateActivityRecord(action.id, activityId, {
      status: 'concluida',
      endDate: today,
      conclusionDate: today,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    onUpdate();
  };

  const handleDeleteActivity = (activityId: string) => {
    if (isViewer) return;
    if (confirm('Deseja remover este registro de atividade?')) {
      dataService.deleteActivityRecord(action.id, activityId);
      onUpdate();
    }
  };

  const handleReassignAgent = (agentId: string) => {
    if (isViewer) return;
    const agent = allAgents.find((a) => a.id === agentId);
    if (!agent) return;

    dataService.updateAction(action.id, {
      assignedAgentId: agent.id,
      assignedAgentName: agent.name,
      assignedAgentAvatar: agent.avatarUrl,
    });
    onUpdate();
  };

  const isCompleted = action.status === 'concluida';
  const activities = action.checklist || [];
  const completedActivities = activities.filter((a) => a.status === 'concluida' || a.completed).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${action.protocol} — Detalhes da Ação Lean`}
      subtitle={`Criado em ${formatDateTime(action.createdAt)}`}
      maxWidth="4xl"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Badges & Status Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusBadge status={action.status} />
            <PriorityBadge priority={action.priority} />
            <WasteCategoryBadge category={action.wasteCategory} />
            {(() => {
              const dimId = action.assessmentDimensionId || dataService.getDefaultAssessmentDimensionForWaste(action.wasteCategory);
              const dimConfig = ASSESSMENT_DIMENSIONS_CONFIG[dimId];
              return dimConfig ? (
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(6, 182, 212, 0.12)',
                    color: '#0891b2',
                    border: '1px solid rgba(8, 145, 178, 0.3)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  title="Eixo do Lean Assessment que este Kaizen alavanca"
                >
                  <span>{dimConfig.icon}</span>
                  <span>Eixo: {dimConfig.shortName}</span>
                </span>
              ) : null;
            })()}

            {action.strategicObjectiveName && (
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: '#2563eb',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                title="Objetivo Estratégico da Alta Gerência (Hoshin Kanri)"
              >
                <Target size={12} />
                <span>Hoshin: {action.strategicObjectiveName}</span>
              </span>
            )}
          </div>

          {/* Status Changer Dropdown & Full Page Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link
              href={`/admin/projetos/${action.id}`}
              target="_blank"
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                color: '#2563eb',
                fontWeight: 700,
                textDecoration: 'none',
              }}
              title="Abrir este projeto em uma página dedicada com todas as informações e ações feitas"
            >
              <ExternalLink size={13} />
              <span>Ver Página Completa</span>
            </Link>

            {isViewer ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  color: '#9333ea',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                <Eye size={13} /> Somente Leitura
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Status:</span>
                <select
                  value={action.status}
                  onChange={(e) => handleStatusChange(e.target.value as ActionStatus)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <option value="aberta">Aberta</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="aguardando_aprovacao">🟣 Aguardando Homologação</option>
                  <option value="concluida">🟢 Concluída & Homologada</option>
                  {isAdmin && <option value="nao_aprovada">🔴 Não Aprovada</option>}
                </select>
              </div>
            )}

            {(action.status === 'concluida' || action.masterApproved) && (action.conclusionDate || action.completedAt) && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#15803d',
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title="Data oficial de conclusão da ação"
              >
                ✅ Concluído em: {formatDate(action.conclusionDate || action.completedAt?.split('T')[0] || '')}
              </span>
            )}

            {(() => {
              const uncompleted = (action.checklist || []).filter((a) => !a.completed && a.status !== 'concluida');
              if (action.status === 'concluida') return null;
              if (uncompleted.length > 0) {
                return (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#b91c1c',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fca5a5',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                    title="Existem atividades 5W2H pendentes de conclusão"
                  >
                    ⚠️ {uncompleted.length} 5W2H pendente(s)
                  </span>
                );
              }
              return null;
            })()}

            {(() => {
              const monthsFilled = getFollowUpMonthsFilledCount(action);
              if (action.status === 'concluida') return null;
              return (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: monthsFilled === 3 ? '#15803d' : '#b45309',
                    backgroundColor: monthsFilled === 3 ? '#dcfce7' : '#fef3c7',
                    border: `1px solid ${monthsFilled === 3 ? '#86efac' : '#fde68a'}`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Acompanhamento obrigatório de 3 meses pelo agente para homologação"
                >
                  📅 {monthsFilled}/3 meses {monthsFilled === 3 ? '✓ (Pronto)' : '(Aferição)'}
                </span>
              );
            })()}

            {(() => {
              const hasGain = dataService.hasMonetaryGain(action);
              const isApproved = dataService.isControllershipApproved(action);
              const auditStatus = action.controllershipAudit?.status;

              if (hasGain) {
                if (isApproved) {
                  return (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Ganhos financeiros homologados pela Controladoria"
                    >
                      🏛️ Controladoria: Homologada ✓
                    </span>
                  );
                }
                if (auditStatus === 'pendente') {
                  return (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#b45309',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fde68a',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Aguardando parecer do auditor contábil"
                    >
                      🏛️ Controladoria: Em Análise ⏳
                    </span>
                  );
                }
                if (auditStatus === 'rejeitado') {
                  return (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#b91c1c',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fca5a5',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Controladoria solicitou ajustes de premissas"
                    >
                      🏛️ Controladoria: Ajustes ❌
                    </span>
                  );
                }
                return (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#b45309',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fde68a',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                    title="Projeto com retorno financeiro: envio à Controladoria é obrigatório"
                  >
                    🏛️ Controladoria: Obrigatória ⚠️
                  </span>
                );
              }

              return (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#64748b',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Projeto sem retorno monetário direto: envio à Controladoria dispensado"
                >
                  🏛️ Controladoria: Dispensada
                </span>
              );
            })()}
          </div>
        </div>

        {/* Card Executivo: Alinhamento com a Alta Gerência & Parecer do Sensei IA */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%)',
            border: '1.5px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={16} style={{ color: '#2563eb' }} />
              <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Alinhamento Hoshin Kanri (Alta Gerência)</strong>
              {action.senseiStrategicAudit?.alignmentScore && (
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                  Aderência: {action.senseiStrategicAudit.alignmentScore}%
                </span>
              )}
            </div>

            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Diretriz Corporativa:</span>
                <select
                  value={action.strategicObjectiveId || ''}
                  onChange={(e) => handleUpdateStrategicObjective(e.target.value)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                >
                  <option value="">Selecione o objetivo da diretoria...</option>
                  {allStrategicObjectives.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} • {o.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.5 }}>
            <div style={{ marginBottom: '0.35rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Meta Conectada: </span>
              <strong style={{ color: '#2563eb' }}>{action.strategicObjectiveName || 'Nenhuma meta vinculada (Preencha para homologar)'}</strong>
            </div>

            {action.senseiStrategicAudit ? (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Sparkles size={13} />
                    <span>Parecer do Sensei IA: Por que este projeto converge com a meta?</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                    {action.senseiStrategicAudit.modelUsed || 'Sensei IA'}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#1e293b', fontSize: '0.8rem', lineHeight: 1.45, fontStyle: 'italic' }}>
                  "{action.senseiStrategicAudit.justification}"
                </p>
                {action.senseiStrategicAudit.contributionSummary && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.725rem', color: '#16a34a', fontWeight: 700 }}>
                    Impacto Estimado: {action.senseiStrategicAudit.contributionSummary}
                  </div>
                )}
                {action.senseiStrategicAudit.improvementSuggestions && action.senseiStrategicAudit.improvementSuggestions.length > 0 && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309' }}>
                      💡 Sugestões do Sensei para subir a aderência à diretoria:
                    </span>
                    {action.senseiStrategicAudit.improvementSuggestions.map((sug, sIdx) => (
                      <div key={sIdx} style={{ fontSize: '0.725rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  O Sensei IA analisa as causas raiz e emite a justificativa estratégica executiva.
                </span>
                {!isViewer && (
                  <button
                    type="button"
                    onClick={handleRunSenseiStrategicAudit}
                    disabled={evaluatingAudit}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0284c7', borderColor: '#bae6fd' }}
                  >
                    <Sparkles size={12} />
                    <span>{evaluatingAudit ? 'Avaliando com IA...' : 'Solicitar Parecer do Sensei'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Title & Full Description */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            {action.title}
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            {action.description}
          </p>
        </div>

        {/* Public Requester Box (if opened from internet link) */}
        {action.isPublicDemand && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '0.875rem 1.125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <p style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                Demanda Aberta Via Link Público
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e3a8a', marginTop: '0.15rem' }}>
                {action.requesterName} {action.requesterDepartment ? `(${action.requesterDepartment})` : ''}
              </p>
              {action.requesterEmail && (
                <p style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Email: {action.requesterEmail}</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#1d4ed8' }}>Setor de Origem</span>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e3a8a' }}>
                {action.originSectorName || 'Geral'}
              </p>
            </div>
          </div>
        )}

        {/* ROI & Lean Avoided Cost Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.125rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Custo Evitado Estimado
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {formatCurrency(action.estimatedCostAvoided)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>
              Custo Evitado Real (ROI)
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: isCompleted ? '#047857' : '#94a3b8', marginTop: '0.2rem' }}>
              {isCompleted ? formatCurrency(action.actualCostAvoided) : 'Pendente de Conclusão'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Horas Economizadas
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {action.hoursSaved ? `${action.hoursSaved} horas` : '—'}
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Chips if Concluded & Has Breakdown */}
        {isCompleted && action.costBreakdown && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '10px',
              padding: '0.875rem 1.125rem',
            }}
          >
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              📊 Composição das Fontes de Economia & Custo Evitado:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(action.costBreakdown.productionIncrease || 0) > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#090e1a', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  🚀 Aumento de Produção: {formatCurrency(action.costBreakdown.productionIncrease!)}
                </span>
              )}
              {(action.costBreakdown.scrapReduction || 0) > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#090e1a', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  ♻️ Redução de Refugo/Matéria: {formatCurrency(action.costBreakdown.scrapReduction!)}
                </span>
              )}
              {(action.costBreakdown.laborSavings || 0) > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#090e1a', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  👷‍♂️ Mão de Obra / Horas: {formatCurrency(action.costBreakdown.laborSavings!)}
                </span>
              )}
              {(action.costBreakdown.machineDowntime || 0) > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#090e1a', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  ⚙️ Paradas de Máquina Evitadas: {formatCurrency(action.costBreakdown.machineDowntime!)}
                </span>
              )}
              {(action.costBreakdown.toolingAndEnergy || 0) > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#090e1a', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  ⚡ Energia & Ferramental: {formatCurrency(action.costBreakdown.toolingAndEnergy!)}
                </span>
              )}
              {(action.costBreakdown.logisticsAndFreight || 0) > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#090e1a', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  📦 Fretes & Logística: {formatCurrency(action.costBreakdown.logisticsAndFreight!)}
                </span>
              )}
              {(action.costBreakdown.otherSavings || 0) > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#090e1a', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  ➕ {action.costBreakdown.otherSavingsDescription || 'Outros Custos'}: {formatCurrency(action.costBreakdown.otherSavings!)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rejection Justification Box if Rejected */}
        {action.status === 'nao_aprovada' && action.rejectionReason && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '10px',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <ShieldAlert size={18} color="#dc2626" />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#991b1b' }}>
                Motivo da Recusa pela Supervisão:
              </h4>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#7f1d1d', lineHeight: 1.4 }}>
              {action.rejectionReason}
            </p>
            {action.triagedBy && (
              <p style={{ fontSize: '0.725rem', color: '#b91c1c', marginTop: '0.4rem' }}>
                Avaliado por {action.triagedBy} em {formatDateTime(action.triagedAt)}
              </p>
            )}
          </div>
        )}

        {/* Completion Modal Pop-up / Inline Form */}
        {showCompletionForm && (
          <form
            onSubmit={handleConfirmCompletion}
            style={{
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              borderRadius: '14px',
              padding: '1.5rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={22} color="#059669" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065f46' }}>
                  Finalizar Entrega & Registrar Impacto Lean
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', color: '#047857', border: '1px solid #10b981' }}
              >
                {showDetailedBreakdown ? '➖ Ocultar Detalhamento de Fontes' : '➕ Detalhar Fontes de Custo (Produção, Sucata, etc.)'}
              </button>
            </div>

            {/* Total Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" style={{ color: '#065f46', fontWeight: 800 }}>
                  Data de Conclusão Efetiva:
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={conclusionDateInput}
                  onChange={(e) => setConclusionDateInput(e.target.value)}
                  style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065f46' }}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: '#047857', marginTop: '0.2rem', display: 'block' }}>
                  Data oficial de conclusão no Gemba.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ color: '#065f46', fontWeight: 800 }}>
                  Custo Evitado Real Total (R$):
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ex: 45000"
                  value={actualCostInput}
                  onChange={(e) => setActualCostInput(e.target.value)}
                  style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46' }}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: '#047857', marginTop: '0.2rem', display: 'block' }}>
                  Soma total de todas as fontes de economia geradas.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ color: '#065f46', fontWeight: 800 }}>
                  Horas de Trabalho Economizadas:
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ex: 80"
                  value={hoursSavedInput}
                  onChange={(e) => setHoursSavedInput(e.target.value)}
                  style={{ fontSize: '1.1rem', fontWeight: 800 }}
                />
                <span style={{ fontSize: '0.7rem', color: '#047857', marginTop: '0.2rem', display: 'block' }}>
                  Capacidade de tempo de ciclo ou horas extras liberadas.
                </span>
              </div>
            </div>

            {/* Expandable Multi-Source Breakdown */}
            {showDetailedBreakdown && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '1.125rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
                  🎯 Detalhamento por Fontes de Custo Evitado (Preenchimento Opcional/Guiado):
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      🚀 Aumento de Produção / Capacidade (R$):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex: 25000"
                      value={cbProduction}
                      onChange={(e) => {
                        setCbProduction(e.target.value);
                        handleUpdateBreakdownField('prod', e.target.value);
                      }}
                      style={{ fontSize: '0.84375rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      ♻️ Redução de Refugo / Matéria-Prima (R$):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex: 12000"
                      value={cbScrap}
                      onChange={(e) => {
                        setCbScrap(e.target.value);
                        handleUpdateBreakdownField('scrap', e.target.value);
                      }}
                      style={{ fontSize: '0.84375rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      👷‍♂️ Mão de Obra / Horas Poupadas (R$):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex: 8000"
                      value={cbLabor}
                      onChange={(e) => {
                        setCbLabor(e.target.value);
                        handleUpdateBreakdownField('labor', e.target.value);
                      }}
                      style={{ fontSize: '0.84375rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      ⚙️ Paradas de Máquina Evitadas (R$):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex: 5000"
                      value={cbDowntime}
                      onChange={(e) => {
                        setCbDowntime(e.target.value);
                        handleUpdateBreakdownField('down', e.target.value);
                      }}
                      style={{ fontSize: '0.84375rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      ⚡ Energia, Ferramental & Insumos (R$):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex: 3000"
                      value={cbTooling}
                      onChange={(e) => {
                        setCbTooling(e.target.value);
                        handleUpdateBreakdownField('tool', e.target.value);
                      }}
                      style={{ fontSize: '0.84375rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      📦 Fretes Especiais & Logística (R$):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex: 2000"
                      value={cbLogistics}
                      onChange={(e) => {
                        setCbLogistics(e.target.value);
                        handleUpdateBreakdownField('log', e.target.value);
                      }}
                      style={{ fontSize: '0.84375rem' }}
                    />
                  </div>
                </div>

                {/* Other Savings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      ➕ Descrição de Outros Custos Evitados:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Multa contratual evitada..."
                      value={cbOtherDesc}
                      onChange={(e) => setCbOtherDesc(e.target.value)}
                      style={{ fontSize: '0.84375rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      Valor Outros Custos (R$):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex: 1500"
                      value={cbOther}
                      onChange={(e) => {
                        setCbOther(e.target.value);
                        handleUpdateBreakdownField('other', e.target.value);
                      }}
                      style={{ fontSize: '0.84375rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: '#065f46' }}>
                Resumo da Causa Raiz / Solução Padronizada:
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Ex: Padronizada sequência de setup com checklist 5S e dispositivo à prova de erros (Poka-Yoke)."
                value={rootCauseInput}
                onChange={(e) => setRootCauseInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCompletionForm(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-success btn-sm">
                Confirmar Conclusão & Salvar ROI
              </button>
            </div>
          </form>
        )}

        {/* Assigned Agent & Sector Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1rem',
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={
                action.assignedAgentAvatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={action.assignedAgentName || 'Agent'}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            />
            <div>
              <p style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Agente Responsável:</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                {action.assignedAgentName || 'Não atribuído'}
              </p>
            </div>
          </div>

          {action.dueDate && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Prazo Estimado:</p>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                📅 {action.dueDate}
              </p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ROBUST ACTIVITY RECORDS & STANDARDIZATION (Novo Registro de Atividades) */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck size={18} color="#22d3ee" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  Registro de Atividades & Padronização Lean
                </h3>
              </div>
              <p style={{ fontSize: '0.78125rem', color: '#94a3b8', marginTop: '0.2rem', margin: 0 }}>
                Cronograma operacional, datas de execução e procedimentos padronizados (SOP / LPP)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                }}
              >
                {completedActivities} de {activities.length} atividades concluídas
              </span>

              {!isViewer && (
                <button
                  type="button"
                  onClick={() => setShowActivityForm(!showActivityForm)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={14} />
                  {showActivityForm ? 'Fechar Formulário' : 'Nova Atividade'}
                </button>
              )}
            </div>
          </div>

          {/* New Activity Inline Form */}
          {!isViewer && showActivityForm && (
            <form
              onSubmit={handleAddActivityRecord}
              style={{
                backgroundColor: '#060a13',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.25rem',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ListTodo size={16} color="#2563eb" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc' }}>
                  Cadastrar Nova Atividade / Etapa 5W2H
                </h4>
              </div>

              <div className="form-group" style={{ margin: '0 0 0.875rem 0' }}>
                <label className="form-label" style={{ color: '#cbd5e1' }}>Descrição / Nome da Atividade (5W2H - O Que Fazer):</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Instalar sensor de presença na calha para evitar acúmulo de matéria..."
                  value={activityLabel}
                  onChange={(e) => setActivityLabel(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Data de Início:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={activityStartDate}
                    onChange={(e) => setActivityStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Data de Fim (Previsão / Prazo):</label>
                  <input
                    type="date"
                    className="form-control"
                    value={activityEndDate}
                    onChange={(e) => setActivityEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Responsável (Quem):</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Carlos Silva"
                    value={activityResponsible}
                    onChange={(e) => setActivityResponsible(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Setor Responsável (Onde):</label>
                  <select
                    className="form-select"
                    value={activitySector}
                    onChange={(e) => setActivitySector(e.target.value)}
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    <option value="">Selecione o Setor...</option>
                    {availableSectors.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.requiresTrackingDoc ? `(Exige ${s.trackingDocLabel || 'Doc'})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Tracking Doc Input if required by sector */}
              {trackingReq.required && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.875rem',
                  }}
                >
                  <label className="form-label" style={{ color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldAlert size={15} />
                    {trackingReq.label} (Obrigatório para Auditoria):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={
                      trackingReq.docType === 'purchase_order'
                        ? 'Ex: OC-2026-9814'
                        : trackingReq.docType === 'work_order'
                        ? 'Ex: OS-4402-MANUT'
                        : 'Ex: Nº do documento de controle...'
                    }
                    value={activityTrackingDoc}
                    onChange={(e) => setActivityTrackingDoc(e.target.value)}
                    required
                    style={{ borderColor: '#ef4444' }}
                  />
                  <span style={{ fontSize: '0.725rem', color: '#fca5a5', marginTop: '0.25rem', display: 'block' }}>
                    O setor {activitySector} requer comprovação e número de rastreabilidade para conformidade em auditorias IATF/SGQ.
                  </span>
                </div>
              )}

              <div className="form-group" style={{ margin: '0 0 1rem 0' }}>
                <label className="form-label" style={{ color: '#cbd5e1' }}>Observações Técnicas / Lições de Padronização:</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Ex: Realizada auditoria 5S pós-treinamento com 100% de conformidade."
                  value={activityObservations}
                  onChange={(e) => setActivityObservations(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowActivityForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Salvar Registro de Atividade
                </button>
              </div>
            </form>
          )}

          {/* Activities List Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activities.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  border: '2px dashed #e2e8f0',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                }}
              >
                Nenhuma atividade registrada ainda nesta ação. Clique em &quot;Nova Atividade&quot; para registrar cronogramas e padronizações.
              </div>
            ) : (
              activities.map((act) => {
                const isActCompleted = act.status === 'concluida' || act.completed;
                const isActInProgress = act.status === 'em_andamento';
                const isActPending = !isActCompleted && !isActInProgress;

                return (
                  <div
                    key={act.id}
                    style={{
                      border: isActCompleted
                        ? '1px solid #bbf7d0'
                        : isActInProgress
                        ? '1px solid #fde68a'
                        : '1px solid #e2e8f0',
                      borderLeft: isActCompleted
                        ? '5px solid #10b981'
                        : isActInProgress
                        ? '5px solid #f59e0b'
                        : '5px solid #94a3b8',
                      borderRadius: '10px',
                      backgroundColor: isActCompleted ? '#f0fdf4' : isActInProgress ? '#fffbeb' : '#ffffff',
                      padding: '0.875rem 1.125rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: isActCompleted
                                ? '#dcfce7'
                                : isActInProgress
                                ? '#fef3c7'
                                : '#f1f5f9',
                              color: isActCompleted
                                ? '#166534'
                                : isActInProgress
                                ? '#92400e'
                                : '#475569',
                            }}
                          >
                            {isActCompleted ? 'Concluída' : isActInProgress ? 'Em Andamento' : 'Pendente'}
                          </span>

                          {act.responsibleName && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              👤 {act.responsibleName}
                            </span>
                          )}
                        </div>

                        <h4
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: isActCompleted ? '#166534' : '#0f172a',
                            textDecoration: isActCompleted ? 'line-through' : 'none',
                            lineHeight: 1.35,
                          }}
                        >
                          {act.label}
                        </h4>

                        {/* Dates & Audit Badges Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.25rem',
                            fontSize: '0.75rem',
                            color: '#64748b',
                            marginTop: '0.4rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          {act.startDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={13} color="#2563eb" />
                              Início: <strong>{formatDate(act.startDate)}</strong>
                            </span>
                          )}

                          {act.endDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={13} color="#10b981" />
                              Fim: <strong>{formatDate(act.endDate)}</strong>
                            </span>
                          )}

                          {isActCompleted && (act.conclusionDate || act.completedAt) && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 700 }}>
                              <CheckCircle2 size={13} color="#16a34a" />
                              Concluída em: <strong>{formatDate(act.conclusionDate || act.completedAt?.split('T')[0] || '')}</strong>
                            </span>
                          )}
                        </div>

                        {/* Sector, Tracking Doc, Reprogrammed & Attachment Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                          {act.responsibleSectorName && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                color: '#2563eb',
                                padding: '0.12rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(59, 130, 246, 0.25)',
                              }}
                            >
                              🏢 {act.responsibleSectorName}
                            </span>
                          )}

                          {act.trackingDocNumber && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                color: '#059669',
                                padding: '0.12rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                              }}
                            >
                              📋 Doc: {act.trackingDocNumber}
                            </span>
                          )}

                          {act.postponedCount && act.postponedCount > 0 ? (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                color: '#d97706',
                                padding: '0.12rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                              }}
                              title={`Reprogramada ${act.postponedCount}x para auditoria interna. Motivo: ${act.postponementReason || 'Não informado'}`}
                            >
                              ⚠️ Reprogramada ({act.postponedCount}x) {act.originalEndDate ? `[Original: ${formatDate(act.originalEndDate)}]` : ''}
                            </span>
                          ) : null}

                          {act.attachment && (
                            <span
                              onClick={() => setAttachmentModalActivity(act)}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: act.attachment.isCronoanalise ? 'rgba(168, 85, 247, 0.12)' : 'rgba(6, 182, 212, 0.12)',
                                color: act.attachment.isCronoanalise ? '#9333ea' : '#0891b2',
                                padding: '0.12rem 0.5rem',
                                borderRadius: '4px',
                                border: act.attachment.isCronoanalise ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title="Clique para visualizar ou alterar o anexo"
                            >
                              <Paperclip size={11} /> {act.attachment.name} {act.attachment.isCronoanalise ? '(Cronoanálise)' : ''}
                            </span>
                          )}
                        </div>

                        {/* Observations snippet */}
                        {act.observations && (
                          <div
                            style={{
                              marginTop: '0.5rem',
                              backgroundColor: 'rgba(0, 0, 0, 0.03)',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.78125rem',
                              color: '#334155',
                            }}
                          >
                            <strong>Obs/Padrão:</strong> {act.observations}
                          </div>
                        )}
                      </div>

                      {/* Action buttons on activity */}
                      {!isViewer && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {/* Prorrogar Prazo para Auditoria (Zero NCs) */}
                          {!isActCompleted && (
                            <button
                              type="button"
                              onClick={() => setPostponeModalActivity(act)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.55rem',
                                color: '#b45309',
                                borderColor: 'rgba(245, 158, 11, 0.4)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title="Reprogramar data final para evitar NC em auditoria de prazos vencidos"
                            >
                              <Clock size={12} /> Prorrogar
                            </button>
                          )}

                          {/* Anexo / Cronoanálise */}
                          <button
                            type="button"
                            onClick={() => setAttachmentModalActivity(act)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.55rem',
                              color: act.attachment ? '#0891b2' : '#64748b',
                              borderColor: act.attachment ? 'rgba(6, 182, 212, 0.4)' : '#e2e8f0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title={act.attachment ? 'Ver anexo ou cronoanálise vinculada' : 'Anexar documento ou vincular estudo de Cronoanálise'}
                          >
                            <Paperclip size={12} /> {act.attachment ? 'Anexo' : 'Anexar'}
                          </button>

                          {isActPending && (
                            <button
                              type="button"
                              onClick={() => handleStartActivity(act.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: '#b45309' }}
                              title="Iniciar esta atividade hoje"
                            >
                              <PlayCircle size={13} /> Iniciar
                            </button>
                          )}

                          {!isActCompleted && (
                            <button
                              type="button"
                              onClick={() => handleFinishActivity(act.id)}
                              className="btn btn-success btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                              title="Marcar como concluída hoje"
                            >
                              <CheckCircle2 size={13} /> Concluir
                            </button>
                          )}

                           {isActCompleted && (
                            <button
                              type="button"
                              onClick={() => {
                                dataService.updateActivityRecord(action.id, act.id, {
                                  status: 'em_andamento',
                                  completed: false,
                                  completedAt: undefined,
                                  conclusionDate: undefined,
                                });
                                onUpdate();
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.725rem', padding: '0.2rem 0.45rem' }}
                            >
                              Reabrir
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteActivity(act.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#94a3b8',
                              padding: '0.25rem',
                            }}
                            title="Excluir Atividade"
                            onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Timeline Notes & Comments Section */}
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MessageSquare size={16} color="#2563eb" />
            Histórico & Apontamentos Lean
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              maxHeight: '220px',
              overflowY: 'auto',
              marginBottom: '0.75rem',
              paddingRight: '0.25rem',
            }}
          >
            {action.notes?.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>
                Nenhum comentário registrado ainda.
              </p>
            ) : (
              action.notes?.map((n) => (
                <div
                  key={n.id}
                  style={{
                    backgroundColor: n.authorRole === 'admin' ? '#eff6ff' : '#f8fafc',
                    border: n.authorRole === 'admin' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.625rem 0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: n.authorRole === 'admin' ? '#1d4ed8' : '#0f172a' }}>
                      {n.authorName} {n.authorRole === 'admin' ? '(Supervisor)' : '(Agente)'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4 }}>{n.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Note Form */}
          {!isViewer && (
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Escrever apontamento sobre a evolução..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                <Send size={14} /> Registrar
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal de Prorrogação de Prazo para Auditoria */}
      {postponeModalActivity && (
        <PostponeDeadlineModal
          isOpen={Boolean(postponeModalActivity)}
          onClose={() => setPostponeModalActivity(null)}
          activityTitle={postponeModalActivity.label}
          currentEndDate={postponeModalActivity.endDate || postponeModalActivity.originalEndDate}
          onConfirm={handleConfirmPostpone}
        />
      )}

      {/* Modal de Anexos da Atividade (Laudos, Desenhos e Cronoanálise) */}
      {attachmentModalActivity && (
        <ActivityAttachmentModal
          isOpen={Boolean(attachmentModalActivity)}
          onClose={() => setAttachmentModalActivity(null)}
          activityTitle={attachmentModalActivity.label}
          currentAttachment={attachmentModalActivity.attachment}
          onSaveAttachment={handleSaveActivityAttachment}
          onRemoveAttachment={handleRemoveActivityAttachment}
        />
      )}

      {/* Poka-Yoke do Sensei IA: Ações Genéricas */}
      {pokaYokeModalOpen && (
        <SenseiActionPokaYokeModal
          isOpen={pokaYokeModalOpen}
          onClose={() => {
            setPokaYokeModalOpen(false);
            setQualityEvaluation(null);
          }}
          originalText={pendingActivityPayload?.label || activityLabel}
          evaluation={qualityEvaluation}
          onAdopt={handleAdoptQualitySuggestion}
          itemTypeLabel="Atividade 5W2H"
          context={{
            sectorName: pendingActivityPayload?.responsibleSectorName,
            projectName: action?.title,
          }}
        />
      )}
    </Modal>
  );
};
