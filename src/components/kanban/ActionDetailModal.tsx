'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LeanAction, ActionStatus, User, ActionChecklistItem, ActivityStatus } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { PriorityBadge, WasteCategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime, formatDate, WASTE_CATEGORIES } from '@/lib/utils';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
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

  // Notes
  const [newNoteText, setNewNoteText] = useState('');

  // Activity Form States
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityLabel, setActivityLabel] = useState('');
  const [activityStartDate, setActivityStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityEndDate, setActivityEndDate] = useState('');
  const [activityResponsible, setActivityResponsible] = useState(currentUser?.name || '');
  const [activityHours, setActivityHours] = useState('');
  const [activityObservations, setActivityObservations] = useState('');
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>('pendente');

  // Completion Form States & Cost Breakdown
  const [actualCostInput, setActualCostInput] = useState<string>('');
  const [hoursSavedInput, setHoursSavedInput] = useState<string>('');
  const [rootCauseInput, setRootCauseInput] = useState<string>('');
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

  if (!action) return null;

  const handleStatusChange = (newStatus: ActionStatus) => {
    if (newStatus === 'concluida') {
      setShowCompletionForm(true);
      setActualCostInput(String(action.actualCostAvoided || action.estimatedCostAvoided || ''));
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
    const cost = parseFloat(actualCostInput.replace(/[^0-9.]/g, '')) || 0;
    const hours = parseFloat(hoursSavedInput) || 0;

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
    if (!newNoteText.trim() || !currentUser) return;

    dataService.addActionNote(action.id, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      text: newNoteText.trim(),
    });

    setNewNoteText('');
    onUpdate();
  };

  const handleAddActivityRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityLabel.trim()) return;

    dataService.addActivityRecord(action.id, {
      label: activityLabel.trim(),
      startDate: activityStartDate || undefined,
      endDate: activityEndDate || undefined,
      responsibleName: activityResponsible.trim() || currentUser?.name || undefined,
      durationHours: activityHours ? parseFloat(activityHours) : undefined,
      observations: activityObservations.trim() || undefined,
      status: activityStatus,
    });

    // Reset Form
    setActivityLabel('');
    setActivityStartDate(new Date().toISOString().split('T')[0]);
    setActivityEndDate('');
    setActivityHours('');
    setActivityObservations('');
    setActivityStatus('pendente');
    setShowActivityForm(false);
    onUpdate();
  };

  const handleStartActivity = (activityId: string) => {
    const today = new Date().toISOString().split('T')[0];
    dataService.updateActivityRecord(action.id, activityId, {
      status: 'em_andamento',
      startDate: today,
      completed: false,
    });
    onUpdate();
  };

  const handleFinishActivity = (activityId: string) => {
    const today = new Date().toISOString().split('T')[0];
    dataService.updateActivityRecord(action.id, activityId, {
      status: 'concluida',
      endDate: today,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    onUpdate();
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Deseja remover este registro de atividade?')) {
      dataService.deleteActivityRecord(action.id, activityId);
      onUpdate();
    }
  };

  const handleReassignAgent = (agentId: string) => {
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
                <option value="concluida">Concluída (com ROI)</option>
                {isAdmin && <option value="nao_aprovada">Não Aprovada</option>}
              </select>
            </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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

              <button
                type="button"
                onClick={() => setShowActivityForm(!showActivityForm)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} />
                {showActivityForm ? 'Fechar Formulário' : 'Nova Atividade'}
              </button>
            </div>
          </div>

          {/* New Activity Inline Form */}
          {showActivityForm && (
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
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                  Cadastrar Nova Atividade / Etapa de Padronização
                </h4>
              </div>

              <div className="form-group" style={{ margin: '0 0 0.875rem 0' }}>
                <label className="form-label">Descrição / Nome da Atividade:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Treinamento dos operadores no procedimento padrão SOP-04..."
                  value={activityLabel}
                  onChange={(e) => setActivityLabel(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div>
                  <label className="form-label">Data de Início:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={activityStartDate}
                    onChange={(e) => setActivityStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Data de Fim (Previsão/Real):</label>
                  <input
                    type="date"
                    className="form-control"
                    value={activityEndDate}
                    onChange={(e) => setActivityEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Responsável:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Carlos Silva"
                    value={activityResponsible}
                    onChange={(e) => setActivityResponsible(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: '0 0 1rem 0' }}>
                <label className="form-label">Observações Técnicas / Lições de Padronização:</label>
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

                        {/* Dates Row */}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
        </div>
      </div>
    </Modal>
  );
};
