'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dataService } from '@/services/dataService';
import { LeanAction, LeanCostBreakdown, ProjectInvestmentCosts, GainProofDetail, GainProofAttachment } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Printer,
  Building,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Percent,
  Paperclip,
  Trash2,
  FileText,
  UploadCloud,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ControladoriaAuditoriaPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [action, setAction] = useState<LeanAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State do Auditor
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerRole, setReviewerRole] = useState('Controladoria & Auditoria Financeira');
  const [auditNotes, setAuditNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  // Breakdown Editável pelo Auditor
  const [laborSavings, setLaborSavings] = useState<number | ''>('');
  const [productionIncrease, setProductionIncrease] = useState<number | ''>('');
  const [scrapReduction, setScrapReduction] = useState<number | ''>('');
  const [machineDowntime, setMachineDowntime] = useState<number | ''>('');
  const [toolingAndEnergy, setToolingAndEnergy] = useState<number | ''>('');
  const [logisticsAndFreight, setLogisticsAndFreight] = useState<number | ''>('');
  const [otherSavings, setOtherSavings] = useState<number | ''>('');
  const [otherSavingsDescription, setOtherSavingsDescription] = useState<string>('');

  // Memórias de Cálculo & Anexos por Categoria
  const [gainDetails, setGainDetails] = useState<Record<string, GainProofDetail>>({});

  // Carregar Ação pelo Token
  useEffect(() => {
    if (!token) {
      setError('Token de auditoria inválido ou ausente.');
      setLoading(false);
      return;
    }

    const found = dataService.getActionByAuditToken(token);
    if (!found) {
      setError('Nenhum projeto encontrado para este link de auditoria. O link pode ter expirado ou o token é inválido.');
      setLoading(false);
      return;
    }

    setAction(found);
    const tenant = dataService.getCurrentTenant();
    if (tenant?.aiSettings?.controladoriaName) {
      setReviewerRole(tenant.aiSettings.controladoriaName);
    }
    if (tenant?.aiSettings?.controladoriaEmail) {
      setReviewerEmail(tenant.aiSettings.controladoriaEmail);
    }

    // Inicializar valores com a proposta ou valores já aprovados
    const bk = found.controllershipAudit?.approvedCostBreakdown || found.costBreakdown || {};
    setLaborSavings(bk.laborSavings !== undefined ? bk.laborSavings : '');
    setProductionIncrease(bk.productionIncrease !== undefined ? bk.productionIncrease : '');
    setScrapReduction(bk.scrapReduction !== undefined ? bk.scrapReduction : '');
    setMachineDowntime(bk.machineDowntime !== undefined ? bk.machineDowntime : '');
    setToolingAndEnergy(bk.toolingAndEnergy !== undefined ? bk.toolingAndEnergy : '');
    setLogisticsAndFreight(bk.logisticsAndFreight !== undefined ? bk.logisticsAndFreight : '');
    setOtherSavings(bk.otherSavings !== undefined ? bk.otherSavings : '');
    setOtherSavingsDescription(bk.otherSavingsDescription || '');

    // Carregar memórias de cálculo e arquivos comprobatórios
    const gDetails = found.controllershipAudit?.gainDetails || found.gainDetails || {};
    setGainDetails(JSON.parse(JSON.stringify(gDetails)));

    if (found.controllershipAudit?.reviewedBy) {
      setReviewerName(found.controllershipAudit.reviewedBy);
    }
    if (found.controllershipAudit?.reviewerEmail) {
      setReviewerEmail(found.controllershipAudit.reviewerEmail);
    }
    if (found.controllershipAudit?.reviewerRole) {
      setReviewerRole(found.controllershipAudit.reviewerRole);
    }
    if (found.controllershipAudit?.auditNotes) {
      setAuditNotes(found.controllershipAudit.auditNotes);
    }
    if (found.controllershipAudit?.rejectionReason) {
      setRejectionReason(found.controllershipAudit.rejectionReason);
    }

    setLoading(false);
  }, [token]);

  // Handlers para o Auditor manipular a contra-memória e justificativa de cada ganho
  const handleAuditorExplanationChange = (category: string, text: string) => {
    setGainDetails((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {
          category,
          categoryLabel: category,
          value: 0,
        }),
        auditorExplanation: text,
      },
    }));
  };

  const handleAuditorFileUpload = (
    category: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAttachment: GainProofAttachment = {
        id: 'att_auditor_' + Date.now(),
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted: formatFileSize(file.size),
        fileType: file.type || 'application/octet-stream',
        url: dataUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: reviewerName.trim() || 'Auditor da Controladoria',
      };

      setGainDetails((prev) => ({
        ...prev,
        [category]: {
          ...(prev[category] || {
            category,
            categoryLabel: category,
            value: 0,
          }),
          auditorAttachment: newAttachment,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAuditorFile = (category: string) => {
    setGainDetails((prev) => {
      const copy = { ...prev };
      if (copy[category]) {
        copy[category] = { ...copy[category], auditorAttachment: undefined };
      }
      return copy;
    });
  };

  const handleDownloadAttachment = (attachment: GainProofAttachment) => {
    if (!attachment?.url) return;
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Soma Total Original (Proposta)
  const originalTotal = useMemo(() => {
    if (!action?.controllershipAudit) return 0;
    const obk = action.controllershipAudit.originalCostBreakdown;
    const sum =
      (obk.laborSavings || 0) +
      (obk.productionIncrease || 0) +
      (obk.scrapReduction || 0) +
      (obk.machineDowntime || 0) +
      (obk.toolingAndEnergy || 0) +
      (obk.logisticsAndFreight || 0) +
      (obk.otherSavings || 0);
    return sum > 0 ? sum : action.controllershipAudit.originalEstimatedCostAvoided || 0;
  }, [action]);

  // Soma Total Auditada (Atual)
  const auditedTotal = useMemo(() => {
    return (
      (Number(laborSavings) || 0) +
      (Number(productionIncrease) || 0) +
      (Number(scrapReduction) || 0) +
      (Number(machineDowntime) || 0) +
      (Number(toolingAndEnergy) || 0) +
      (Number(logisticsAndFreight) || 0) +
      (Number(otherSavings) || 0)
    );
  }, [
    laborSavings,
    productionIncrease,
    scrapReduction,
    machineDowntime,
    toolingAndEnergy,
    logisticsAndFreight,
    otherSavings,
  ]);

  // Diferença
  const deltaTotal = auditedTotal - originalTotal;
  const hasValuesChanged = Math.abs(deltaTotal) > 0.01;

  // Status da Auditoria
  const auditStatus = action?.controllershipAudit?.status || 'pendente';
  const isAlreadyReviewed = auditStatus === 'aprovado' || auditStatus === 'ajustado_e_aprovado' || auditStatus === 'rejeitado';

  // Manipuladores de Decisão
  const handleApproveOriginal = () => {
    if (!reviewerName.trim()) {
      alert('Por favor, informe seu nome como Auditor responsável.');
      return;
    }
    setIsSubmitting(true);
    try {
      const finalGainDetails: Record<string, GainProofDetail> = { ...gainDetails };
      // Sincronizar os valores aprovados no gainDetails
      Object.keys(finalGainDetails).forEach((cat) => {
        finalGainDetails[cat].auditorValue = finalGainDetails[cat].value;
      });

      const updated = dataService.processControllershipAudit(token, {
        status: 'aprovado',
        gainDetails: finalGainDetails,
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
        reviewerRole: reviewerRole.trim(),
        auditNotes: auditNotes.trim() || 'Ganhos financeiros auditados e certificados integralmente pela Controladoria.',
      });
      setAction(updated);
      setSuccessStatus('aprovado');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Erro ao processar auditoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveWithAdjustments = () => {
    if (!reviewerName.trim()) {
      alert('Por favor, informe seu nome como Auditor responsável.');
      return;
    }
    if (!auditNotes.trim()) {
      alert('Como houve ajuste de valores, por favor preencha o Parecer Técnico explicando as premissas adotadas pela Controladoria.');
      return;
    }
    setIsSubmitting(true);
    try {
      const approvedBreakdown: LeanCostBreakdown = {
        laborSavings: Number(laborSavings) || 0,
        productionIncrease: Number(productionIncrease) || 0,
        scrapReduction: Number(scrapReduction) || 0,
        machineDowntime: Number(machineDowntime) || 0,
        toolingAndEnergy: Number(toolingAndEnergy) || 0,
        logisticsAndFreight: Number(logisticsAndFreight) || 0,
        otherSavings: Number(otherSavings) || 0,
        otherSavingsDescription: otherSavingsDescription.trim() || undefined,
      };

      const finalGainDetails: Record<string, GainProofDetail> = { ...gainDetails };
      const mapValues: Record<string, number> = {
        laborSavings: Number(laborSavings) || 0,
        productionIncrease: Number(productionIncrease) || 0,
        scrapReduction: Number(scrapReduction) || 0,
        machineDowntime: Number(machineDowntime) || 0,
        toolingAndEnergy: Number(toolingAndEnergy) || 0,
        logisticsAndFreight: Number(logisticsAndFreight) || 0,
        otherSavings: Number(otherSavings) || 0,
      };

      Object.entries(mapValues).forEach(([cat, val]) => {
        if (!finalGainDetails[cat]) {
          finalGainDetails[cat] = {
            category: cat,
            categoryLabel: cat,
            value: val,
            explanation: '',
            auditorValue: val,
          };
        } else {
          finalGainDetails[cat].auditorValue = val;
        }
      });

      const updated = dataService.processControllershipAudit(token, {
        status: 'ajustado_e_aprovado',
        approvedBreakdown,
        approvedEstimatedCostAvoided: auditedTotal,
        gainDetails: finalGainDetails,
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
        reviewerRole: reviewerRole.trim(),
        auditNotes: auditNotes.trim(),
      });
      setAction(updated);
      setSuccessStatus('ajustado_e_aprovado');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Erro ao processar auditoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    if (!reviewerName.trim()) {
      alert('Por favor, informe seu nome como Auditor responsável.');
      return;
    }
    if (!rejectionReason.trim()) {
      alert('Por favor, informe a justificativa ou orientações de revisão para o Agente Lean.');
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = dataService.processControllershipAudit(token, {
        status: 'rejeitado',
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
        reviewerRole: reviewerRole.trim(),
        auditNotes: auditNotes.trim() || 'Projeto reprovado pela Controladoria para reavaliação de premissas no Gemba.',
        rejectionReason: rejectionReason.trim(),
      });
      setAction(updated);
      setShowRejectModal(false);
      setSuccessStatus('rejeitado');
    } catch (err: any) {
      alert(err.message || 'Erro ao processar auditoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#060a13', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FileCheck2 size={42} color="#3b82f6" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Carregando dados da auditoria...</p>
        </div>
      </div>
    );
  }

  if (error || !action) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#060a13', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '500px', width: '100%', backgroundColor: '#0f172a', border: '1px solid #dc2626', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
          <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>Link Inválido ou Expirado</h2>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>{error}</p>
          <Link href="/" className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
            Ir para a Página Inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060a13', color: '#f8fafc', paddingBottom: '5rem' }}>
      {/* Topo Corporativo */}
      <header style={{ backgroundColor: '#0b1120', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#1e293b', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color="#60a5fa" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
                Portal de Auditoria & Homologação Financeira
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                Controladoria Corporativa • Governança de Custo Evitado Lean Flow
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              Protocolo: {action.protocol}
            </span>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.78rem', borderRadius: '8px' }}
            >
              <Printer size={14} /> Imprimir Parecer
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '2rem auto 0 auto', padding: '0 1.5rem' }}>
        {/* Banner de Status Atual */}
        {auditStatus === 'pendente' ? (
          <div style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1.5px solid rgba(245, 158, 11, 0.35)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <AlertTriangle size={26} color="#fbbf24" />
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#fef08a', display: 'block' }}>
                  Auditoria Financeira Pendente de Homologação
                </strong>
                <span style={{ fontSize: '0.8125rem', color: '#fde68a' }}>
                  Submetido por <strong>{action.controllershipAudit?.submittedBy || 'Agente Lean'}</strong> em {formatDateTime(action.controllershipAudit?.submittedAt || action.updatedAt)}.
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
              Aguardando Parecer
            </span>
          </div>
        ) : auditStatus === 'rejeitado' ? (
          <div style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid rgba(239, 68, 68, 0.35)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
              <XCircle size={26} color="#ef4444" />
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#fca5a5' }}>
                  Projeto Devolvido para Revisão pela Controladoria
                </strong>
                <span style={{ fontSize: '0.8125rem', color: '#fecaca', display: 'block' }}>
                  Auditado por {action.controllershipAudit?.reviewedBy} em {formatDateTime(action.controllershipAudit?.reviewedAt)}.
                </span>
              </div>
            </div>
            {action.controllershipAudit?.rejectionReason && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', borderLeft: '4px solid #ef4444', fontSize: '0.8125rem', color: '#f8fafc', marginTop: '0.5rem' }}>
                <strong>Motivo / Orientações da Controladoria:</strong> {action.controllershipAudit.rejectionReason}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1.5px solid rgba(34, 197, 94, 0.35)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <CheckCircle2 size={26} color="#4ade80" />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#86efac' }}>
                    {auditStatus === 'ajustado_e_aprovado' ? 'Ganhos Certificados com Ajustes pela Controladoria' : 'Ganhos Financeiros Homologados Integralmente'}
                  </strong>
                  <span style={{ fontSize: '0.8125rem', color: '#bbf7d0', display: 'block' }}>
                    Auditado por <strong>{action.controllershipAudit?.reviewedBy}</strong> ({action.controllershipAudit?.reviewerRole}) em {formatDateTime(action.controllershipAudit?.reviewedAt)}.
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                ✓ {formatCurrency(action.controllershipAudit?.approvedEstimatedCostAvoided || auditedTotal)}/ano Homologado
              </span>
            </div>
            {action.controllershipAudit?.auditNotes && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', borderLeft: '4px solid #10b981', fontSize: '0.8125rem', color: '#f8fafc', marginTop: '0.75rem' }}>
                <strong>Parecer da Controladoria:</strong> {action.controllershipAudit.auditNotes}
              </div>
            )}
          </div>
        )}

        {/* Informações Executivas do Projeto */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38bdf8' }}>
                {action.originSectorName || 'Setor Industrial'}
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0' }}>
                {action.title}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, maxWidth: '800px', lineHeight: 1.5 }}>
                {action.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: '#1e293b', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Líder do Kaizen</span>
                <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>{action.leaderName || action.assignedAgentName || 'Especialista Lean'}</strong>
              </div>
              <div style={{ borderLeft: '1px solid #334155', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Investimento Capex</span>
                <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>{formatCurrency(action.projectCosts?.totalCost || 0)}</strong>
              </div>
            </div>
          </div>

          {/* Declaração de Problema e Meta */}
          {(action.problemStatement || action.targetGoalValue) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {action.problemStatement && (
                <div style={{ backgroundColor: '#111827', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    Diagnóstico do Problema (PLAN)
                  </span>
                  <p style={{ fontSize: '0.8125rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>
                    {action.problemStatement}
                  </p>
                </div>
              )}
              {action.targetMetricName && (
                <div style={{ backgroundColor: '#111827', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    Indicador Chave & Meta Atingida
                  </span>
                  <p style={{ fontSize: '0.8125rem', color: '#e2e8f0', margin: 0 }}>
                    <strong>{action.targetMetricName}:</strong> Inicial de {action.baselineValue} {action.targetMetricUnit || ''} ➔ Meta de {action.targetGoalValue} ➔ <strong>Alcançado: {action.achievedValue || action.targetGoalValue} {action.targetMetricUnit || ''}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mesa de Auditoria das 7 Fontes de Custo Evitado */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <FileSpreadsheet size={22} color="#38bdf8" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Auditoria das 7 Fontes de Custo Evitado Lean (Anualizado)
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Confira e ajuste individualmente cada conta de economia calculada pelo projeto
                </span>
              </div>
            </div>

            {hasValuesChanged && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.35rem 0.75rem', borderRadius: '6px', backgroundColor: deltaTotal < 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: deltaTotal < 0 ? '#fca5a5' : '#86efac', border: `1px solid ${deltaTotal < 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}` }}>
                {deltaTotal < 0 ? `Ajuste Conservador: ${formatCurrency(deltaTotal)}` : `Ajuste Adicional: +${formatCurrency(deltaTotal)}`}
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Fonte de Custo Evitado Lean</th>
                  <th style={{ padding: '0.75rem 1rem', width: '220px' }}>Proposta do Kaizen (R$/ano)</th>
                  <th style={{ padding: '0.75rem 1rem', width: '250px' }}>Validado pela Controladoria (R$/ano)</th>
                  <th style={{ padding: '0.75rem 1rem', width: '160px', textAlign: 'right' }}>Variação</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    key: 'laborSavings',
                    num: 1,
                    title: '1. Mão de Obra / Horas de Trabalho Salvas',
                    subtitle: 'Eliminação de horas extras, rebalanceamento de posto e ergonomia',
                    val: laborSavings,
                    setVal: setLaborSavings,
                    orig: action.controllershipAudit?.originalCostBreakdown?.laborSavings || 0,
                  },
                  {
                    key: 'productionIncrease',
                    num: 2,
                    title: '2. Aumento de Produção / Capacidade Extra',
                    subtitle: 'Redução de tempo de ciclo (SMED/Setup) e ganho de vazão horária',
                    val: productionIncrease,
                    setVal: setProductionIncrease,
                    orig: action.controllershipAudit?.originalCostBreakdown?.productionIncrease || 0,
                  },
                  {
                    key: 'scrapReduction',
                    num: 3,
                    title: '3. Redução de Refugo / Matéria-Prima',
                    subtitle: 'Eliminação de defeitos, perdas de partida e quebras de produto',
                    val: scrapReduction,
                    setVal: setScrapReduction,
                    orig: action.controllershipAudit?.originalCostBreakdown?.scrapReduction || 0,
                  },
                  {
                    key: 'machineDowntime',
                    num: 4,
                    title: '4. Redução de Paradas de Máquina / OEE',
                    subtitle: 'Melhoria de confiabilidade e disponibilidade do equipamento',
                    val: machineDowntime,
                    setVal: setMachineDowntime,
                    orig: action.controllershipAudit?.originalCostBreakdown?.machineDowntime || 0,
                  },
                  {
                    key: 'toolingAndEnergy',
                    num: 5,
                    title: '5. Ferramental, Energia e Insumos',
                    subtitle: 'Eficiência energética, ar comprimido, durabilidade de moldes',
                    val: toolingAndEnergy,
                    setVal: setToolingAndEnergy,
                    orig: action.controllershipAudit?.originalCostBreakdown?.toolingAndEnergy || 0,
                  },
                  {
                    key: 'logisticsAndFreight',
                    num: 6,
                    title: '6. Fretes Especiais e Estoque',
                    subtitle: 'Eliminação de fretes aéreos/urgentes e redução de WIP/estoque parado',
                    val: logisticsAndFreight,
                    setVal: setLogisticsAndFreight,
                    orig: action.controllershipAudit?.originalCostBreakdown?.logisticsAndFreight || 0,
                  },
                  {
                    key: 'otherSavings',
                    num: 7,
                    title: '7. Outros Custos Evitados',
                    subtitle: 'Custos operacionais diversos evitados ou contingenciados',
                    val: otherSavings,
                    setVal: setOtherSavings,
                    orig: action.controllershipAudit?.originalCostBreakdown?.otherSavings || 0,
                    isOther: true,
                  },
                ].map(({ key, title, subtitle, val, setVal, orig, isOther }) => {
                  const numVal = Number(val) || 0;
                  const delta = numVal - orig;
                  const proof = gainDetails[key];
                  const hasAgentProof = Boolean(proof?.attachment || proof?.explanation);
                  const showDetailBox = orig > 0 || numVal > 0 || hasAgentProof || proof?.auditorAttachment || proof?.auditorExplanation;

                  return (
                    <React.Fragment key={key}>
                      <tr style={{ borderBottom: showDetailBox ? 'none' : '1px solid #1e293b' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <strong style={{ color: '#ffffff' }}>{title}</strong>
                            {proof?.attachment && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                ✓ Planilha do Agente Anexada
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{subtitle}</span>
                          {isOther && (
                            <input
                              type="text"
                              disabled={isAlreadyReviewed}
                              placeholder="Descrição da economia adicional..."
                              value={otherSavingsDescription}
                              onChange={(e) => setOtherSavingsDescription(e.target.value)}
                              style={{ width: '100%', padding: '0.35rem 0.5rem', marginTop: '0.3rem', fontSize: '0.75rem', backgroundColor: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#cbd5e1' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', fontWeight: 600 }}>
                          {formatCurrency(orig)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <input
                            type="number"
                            disabled={isAlreadyReviewed}
                            placeholder="0"
                            value={val === 0 || val === '' || val === undefined ? '' : val}
                            onChange={(e) => setVal(e.target.value === '' ? '' : Number(e.target.value))}
                            className="input"
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              backgroundColor: '#0b1120',
                              border: '1px solid #334155',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontWeight: 700,
                              textAlign: 'right',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: delta === 0 ? '#64748b' : delta > 0 ? '#34d399' : '#f87171' }}>
                          {delta > 0 ? `+${formatCurrency(delta)}` : formatCurrency(delta)}
                        </td>
                      </tr>

                      {/* Linha Expansível com Memória de Cálculo do Agente e Parecer do Auditor */}
                      {showDetailBox && (
                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                          <td colSpan={4} style={{ padding: '0 1rem 1rem 1rem' }}>
                            <div
                              style={{
                                backgroundColor: '#090e1a',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                padding: '0.85rem 1rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1rem',
                              }}
                            >
                              {/* 1. Comprovação do Agente Lean */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  👤 Memória de Cálculo do Agente Lean:
                                </span>
                                {proof?.explanation ? (
                                  <div style={{ backgroundColor: 'rgba(0,0,0,0.35)', padding: '0.5rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', color: '#e2e8f0', borderLeft: '3px solid #38bdf8' }}>
                                    &quot;{proof.explanation}&quot;
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                                    Nenhuma explicação textual fornecida.
                                  </span>
                                )}

                                {proof?.attachment ? (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.65rem', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', marginTop: '0.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                                      <FileSpreadsheet size={16} color="#38bdf8" />
                                      <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '200px' }}>
                                        {proof.attachment.name}
                                      </span>
                                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({proof.attachment.sizeFormatted})</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadAttachment(proof.attachment!)}
                                      style={{
                                        padding: '0.25rem 0.55rem',
                                        fontSize: '0.7rem',
                                        borderRadius: '4px',
                                        backgroundColor: '#0284c7',
                                        color: '#ffffff',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontWeight: 700,
                                      }}
                                    >
                                      <Download size={12} /> Baixar Planilha do Agente
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: '#f87171' }}>
                                    ⚠️ Nenhum arquivo de memória de cálculo anexado pelo Agente.
                                  </span>
                                )}
                              </div>

                              {/* 2. Anotações & Contra-Memória da Controladoria */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    🏛️ Parecer & Contra-Memória da Controladoria:
                                  </span>
                                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                    (Anexo Opcional)
                                  </span>
                                </div>

                                <textarea
                                  rows={2}
                                  disabled={isAlreadyReviewed}
                                  placeholder="Observação da auditoria sobre esta fonte de custo evitado..."
                                  value={proof?.auditorExplanation || ''}
                                  onChange={(e) => handleAuditorExplanationChange(key, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.45rem 0.65rem',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#0b1120',
                                    border: '1px solid #334155',
                                    borderRadius: '6px',
                                    color: '#ffffff',
                                  }}
                                />

                                {/* Upload / Download de Contra-Memória Corrigida */}
                                {proof?.auditorAttachment ? (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.65rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', marginTop: '0.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                                      <FileSpreadsheet size={16} color="#34d399" />
                                      <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '180px' }}>
                                        {proof.auditorAttachment.name}
                                      </span>
                                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({proof.auditorAttachment.sizeFormatted})</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadAttachment(proof.auditorAttachment!)}
                                        style={{
                                          padding: '0.25rem 0.55rem',
                                          fontSize: '0.7rem',
                                          borderRadius: '4px',
                                          backgroundColor: '#059669',
                                          color: '#ffffff',
                                          border: 'none',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                          fontWeight: 700,
                                        }}
                                      >
                                        <Download size={12} /> Baixar
                                      </button>
                                      {!isAlreadyReviewed && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveAuditorFile(key)}
                                          style={{
                                            padding: '0.25rem 0.45rem',
                                            fontSize: '0.7rem',
                                            borderRadius: '4px',
                                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                            color: '#f87171',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : !isAlreadyReviewed ? (
                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.4rem',
                                      padding: '0.45rem',
                                      borderRadius: '6px',
                                      border: '1px dashed rgba(52, 211, 153, 0.4)',
                                      backgroundColor: 'rgba(52, 211, 153, 0.04)',
                                      color: '#34d399',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <Paperclip size={13} />
                                    <span>Anexar Planilha Corrigida pela Controladoria (Opcional)</span>
                                    <input
                                      type="file"
                                      accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,image/*"
                                      onChange={(e) => handleAuditorFileUpload(key, e)}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    Nenhuma planilha corrigida anexada pela auditoria.
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Linha de Total Geral */}
                <tr style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                    TOTAL ANUALIZADO (12 MESES)
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, fontSize: '1rem', color: '#cbd5e1' }}>
                    {formatCurrency(originalTotal)}/ano
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, fontSize: '1.2rem', color: '#34d399' }}>
                    {formatCurrency(auditedTotal)}/ano
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: deltaTotal === 0 ? '#64748b' : deltaTotal > 0 ? '#34d399' : '#f87171' }}>
                    {deltaTotal > 0 ? `+${formatCurrency(deltaTotal)}` : formatCurrency(deltaTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Parecer Técnico e Assinatura do Auditor */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck2 size={20} color="#3b82f6" />
            Certificação & Parecer da Controladoria
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                Nome do Auditor / Responsável Financeiro *
              </label>
              <input
                type="text"
                disabled={isAlreadyReviewed}
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="ex: Carlos Drummond de Andrade"
                className="input"
                style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                E-mail Corporativo do Auditor
              </label>
              <input
                type="email"
                disabled={isAlreadyReviewed}
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                placeholder="ex: auditoria@empresa.com.br"
                className="input"
                style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                Cargo / Departamento
              </label>
              <input
                type="text"
                disabled={isAlreadyReviewed}
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value)}
                placeholder="ex: Controller Sênior"
                className="input"
                style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
              Parecer Técnico da Controladoria & Memória de Auditoria {hasValuesChanged && <span style={{ color: '#fbbf24' }}>* (Obrigatório devido ao ajuste)</span>}
            </label>
            <textarea
              rows={3}
              disabled={isAlreadyReviewed}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="Descreva as premissas de cálculo auditadas, memórias conferidas e justificativa para quaisquer ajustes aplicados..."
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>

          {/* Botões de Ação */}
          {!isAlreadyReviewed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #1e293b' }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={isSubmitting}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <XCircle size={16} /> Recusar / Solicitar Revisão
              </button>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {hasValuesChanged ? (
                  <button
                    type="button"
                    onClick={handleApproveWithAdjustments}
                    disabled={isSubmitting || !reviewerName.trim()}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.875rem', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <CheckCircle2 size={18} /> Homologar com Ajustes ({formatCurrency(auditedTotal)}/ano)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApproveOriginal}
                    disabled={isSubmitting || !reviewerName.trim()}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.875rem', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <CheckCircle2 size={18} /> Aprovar Ganhos Propostos ({formatCurrency(originalTotal)}/ano)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Este parecer já foi concluído e está registrado com fé pública corporativa no sistema.
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> Imprimir Certificado de Homologação
              </button>
            </div>
          )}
        </div>

        {/* Modal de Rejeição */}
        {showRejectModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div style={{ maxWidth: '540px', width: '100%', backgroundColor: '#0f172a', border: '1.5px solid #ef4444', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <XCircle size={26} color="#ef4444" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Recusar / Devolver Projeto para Revisão
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1rem' }}>
                O projeto retornará para a etapa de ação no Gemba. Por favor, forneça orientações detalhadas sobre quais números divergiram ou quais comprovantes estão faltando.
              </p>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da recusa e as orientações para o Agente Lean..."
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', marginBottom: '1.25rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '8px' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Confirmar Recusa
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
