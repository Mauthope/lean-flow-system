'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dataService } from '@/services/dataService';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { LeanAction, LeanCostBreakdown, ProjectInvestmentCosts, GainProofDetail, GainProofAttachment, OperationalCashFlowItem } from '@/lib/types';
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
  Eye,
  Image as ImageIcon,
  Calculator,
  Receipt,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '@/components/ui/Modal';

export default function ControladoriaAuditoriaPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [action, setAction] = useState<LeanAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<GainProofAttachment | null>(null);

  // Form State do Auditor
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerRole, setReviewerRole] = useState('Controladoria & Auditoria Financeira');
  const [clientIp, setClientIp] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
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

  const initializeAuditState = (found: LeanAction) => {
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
    if (found.controllershipAudit?.reviewerIp) {
      setClientIp(found.controllershipAudit.reviewerIp);
    }
  };

  // Carregar Ação pelo Token
  useEffect(() => {
    if (!token) {
      setError('Token de auditoria inválido ou ausente.');
      setLoading(false);
      return;
    }

    // Tenta capturar IP público da estação em segundo plano para fé pública do laudo
    try {
      fetch('https://api.ipify.org?format=json')
        .then((r) => r.json())
        .then((d) => {
          if (d?.ip) setClientIp(d.ip);
        })
        .catch(() => {});
    } catch {}

    const loadAction = async () => {
      // 1. Tentar carregar diretamente pela API protegida por Token (sem exigência de login prévio do auditor)
      try {
        const res = await fetch(`/api/controladoria/audit?token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.clientIp) {
            setClientIp((prev) => prev || json.clientIp);
          }
          const rawAct = json.action || json.result?.action;
          const rawAud = json.audit || json.result?.audit;

          if (rawAct) {
            const method = rawAct.methodology_data || {};
            const mapped: LeanAction = {
              id: rawAct.id,
              protocol: rawAct.protocol,
              tenantId: rawAct.tenant_id,
              title: rawAct.title,
              description: rawAct.description || '',
              wasteCategory: rawAct.waste_category,
              originSectorId: rawAct.origin_sector_id || method.originSectorId || '',
              originSectorName: method.originSectorName || '',
              targetSectorId: rawAct.target_sector_id || method.targetSectorId,
              targetSectorName: method.targetSectorName,
              status: rawAct.status,
              priority: rawAct.priority,
              pdcaStage: rawAct.pdca_stage,
              estimatedCostAvoided: Number(rawAct.estimated_cost_avoided) || 0,
              actualCostAvoided: Number(rawAct.actual_cost_avoided) || 0,
              costBreakdown: rawAct.cost_breakdown || method.costBreakdown || {},
              projectCosts: rawAct.investment_costs || method.projectCosts || {},
              dueDate: rawAct.due_date,
              conclusionDate: rawAct.conclusion_date,
              pokaYokeStatus: rawAct.poka_yoke_status,
              submittedForApproval: Boolean(rawAct.submitted_for_approval),
              masterApproved: Boolean(rawAct.master_approved),
              createdAt: rawAct.created_at || new Date().toISOString(),
              updatedAt: rawAct.updated_at || new Date().toISOString(),
              notes: rawAct.timeline_notes || method.notes || [],
              checklist: method.checklist || [],
              attachments: method.attachments,
              gainDetails: rawAud?.gain_details || rawAud?.gainDetails || method.gainDetails || rawAct.gainDetails || {},
              leaderName: method.leaderName || 'Especialista Lean',
              assignedAgentName: method.assignedAgentName,
              isPublicDemand: Boolean(method.isPublicDemand),
              hoursSaved: Number(method.hoursSaved) || 0,
              controllershipAudit: rawAud ? {
                id: rawAud.id,
                token: rawAud.token || token,
                status: rawAud.status || 'pendente',
                submittedAt: rawAud.submitted_at || rawAud.submittedAt,
                submittedBy: rawAud.submitted_by || rawAud.submittedBy || method.leaderName || 'Agente Lean',
                originalCostBreakdown: rawAud.original_breakdown || rawAud.originalCostBreakdown || rawAct.cost_breakdown || {},
                originalEstimatedCostAvoided: Number(rawAud.original_estimated_cost_avoided) || Number(rawAud.originalEstimatedCostAvoided) || Number(rawAct.actual_cost_avoided) || Number(rawAct.estimated_cost_avoided) || 0,
                originalProjectCosts: rawAud.original_project_costs || rawAud.originalProjectCosts || rawAct.investment_costs,
                approvedCostBreakdown: rawAud.approved_breakdown || rawAud.approvedCostBreakdown,
                approvedEstimatedCostAvoided: rawAud.approved_estimated_cost_avoided || rawAud.approvedEstimatedCostAvoided,
                approvedProjectCosts: rawAud.approved_project_costs || rawAud.approvedProjectCosts,
                gainDetails: rawAud?.gain_details || rawAud?.gainDetails || method.gainDetails || {},
                reviewedAt: rawAud.reviewed_at || rawAud.reviewedAt,
                reviewedBy: rawAud.reviewed_by || rawAud.reviewedBy,
                reviewerEmail: rawAud.reviewer_email || rawAud.reviewerEmail,
                reviewerRole: rawAud.reviewer_role || rawAud.reviewerRole,
                reviewerIp: rawAud.reviewer_ip || rawAud.reviewerIp || method.controllershipAudit?.reviewerIp,
                auditNotes: rawAud.audit_notes || rawAud.auditNotes,
                rejectionReason: rawAud.rejection_reason || rawAud.rejectionReason,
                emailSentTo: rawAud.email_sent_to || rawAud.emailSentTo,
                emailSentAt: rawAud.email_sent_at || rawAud.emailSentAt,
                emailStatus: rawAud.email_status || rawAud.emailStatus,
              } : method.controllershipAudit,
            };

            setAction(mapped);
            initializeAuditState(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('[Controladoria] Falha ao consultar endpoint de auditoria:', apiErr);
      }

      // 2. Fallback de cache local e sincronização
      let found = dataService.getActionByAuditToken(token);
      if (!found && isSupabaseConfigured()) {
        try {
          await Promise.all([
            dataService.syncActionsFromCloud(),
            dataService.syncTenantsFromCloud(),
          ]);
          found = dataService.getActionByAuditToken(token);
        } catch (err) {
          console.warn('[Controladoria] Erro ao sincronizar acoes para auditoria:', err);
        }
      }

      if (!found) {
        setError('Nenhum projeto encontrado para este link de auditoria. O link pode ter expirado ou o token é inválido.');
        setLoading(false);
        return;
      }

      setAction(found);
      initializeAuditState(found);
      setLoading(false);
    };

    loadAction();
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

  const handleAuditorFileUpload = async (
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

    try {
      const uploadedUrl = await dataService.uploadAttachmentFile(file, `actions/${action?.id || 'audit'}/auditor`);
      const newAttachment: GainProofAttachment = {
        id: 'att_auditor_' + Date.now(),
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted: formatFileSize(file.size),
        fileType: file.type || 'application/octet-stream',
        url: uploadedUrl,
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
    } catch (err) {
      console.warn('Erro ao carregar anexo do auditor:', err);
      alert('Erro ao anexar arquivo do auditor.');
    } finally {
      e.target.value = '';
    }
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

  const handleOpenAttachmentInNewTab = (att: GainProofAttachment) => {
    if (!att?.url) return;
    try {
      if (att.url.startsWith('data:')) {
        const parts = att.url.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType || att.fileType || 'application/octet-stream' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        window.open(att.url, '_blank');
      }
    } catch {
      window.open(att.url, '_blank');
    }
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

  // Modelo Contábil-Corporativo Oficial (Lucro Real & Depreciação)
  const corporateFinancials = useMemo(() => {
    const rawCosts = action?.projectCosts || {};
    const partsAndEquipment = Number(rawCosts.partsAndEquipment) || 0;
    const thirdPartyServices = Number(rawCosts.thirdPartyServices) || 0;
    const internalLaborHours = Number(rawCosts.internalLaborHours) || 0;
    const laborHourlyRate = Number(rawCosts.laborHourlyRate) || 45;
    const otherCosts = Number(rawCosts.otherCosts) || 0;
    const internalLaborCost = internalLaborHours * laborHourlyRate;

    const opItems: OperationalCashFlowItem[] = Array.isArray(rawCosts.operationalItems) ? rawCosts.operationalItems : [];
    const opCostTotal = opItems.reduce((acc, it) => acc + Math.abs(Number(it.monthlyValue) || 0), 0);
    const grossCapex = opCostTotal > 0 ? opCostTotal : (partsAndEquipment + thirdPartyServices + internalLaborCost + otherCosts || (Number(rawCosts.totalCost) || 0));

    const pisCofinsRate = rawCosts.pisCofinsRate !== undefined ? Number(rawCosts.pisCofinsRate) : 22;
    const defaultPis = grossCapex > 0 ? Number(((grossCapex * pisCofinsRate) / 100).toFixed(2)) : 0;
    const rawPisCredit = rawCosts.pisCofinsCredit !== undefined ? Number(rawCosts.pisCofinsCredit) : undefined;
    const pisCofinsCredit =
      rawPisCredit !== undefined && rawPisCredit > 0 && rawPisCredit <= grossCapex
        ? rawPisCredit
        : defaultPis;
    const icmsCredit = Number(rawCosts.icmsCredit) || 0;
    const netInvestmentCost =
      rawCosts.netInvestmentCost !== undefined && Number(rawCosts.netInvestmentCost) <= grossCapex
        ? Number(rawCosts.netInvestmentCost)
        : Math.max(0, Number((grossCapex - pisCofinsCredit - icmsCredit).toFixed(2)));

    const incomeTaxRate = rawCosts.incomeTaxRate !== undefined ? Number(rawCosts.incomeTaxRate) : 34;
    const depreciationMonths = rawCosts.depreciationMonths !== undefined ? Number(rawCosts.depreciationMonths) : 60;
    const financialRate = rawCosts.financialRate !== undefined ? Number(rawCosts.financialRate) : 1.0;

    const effectiveAvoided = auditedTotal > 0 ? auditedTotal : originalTotal;
    const monthlyGross7Sources = effectiveAvoided > 0 ? Number((effectiveAvoided / 12).toFixed(2)) : 0;
    const grossOperationalGainMonthly = monthlyGross7Sources;

    const incomeTaxOnGainMonthly = Number(((grossOperationalGainMonthly * incomeTaxRate) / 100).toFixed(2));
    const netOperationalGainMonthly = Number((grossOperationalGainMonthly - incomeTaxOnGainMonthly).toFixed(2));

    const monthlyDepreciation = depreciationMonths > 0 ? Number((netInvestmentCost / depreciationMonths).toFixed(2)) : 0;
    const taxShieldDepreciationMonthly = Number(((monthlyDepreciation * incomeTaxRate) / 100).toFixed(2));

    const finalNetMonthlyCashFlow = Number((netOperationalGainMonthly + taxShieldDepreciationMonthly).toFixed(2));

    const simplePaybackMonths = finalNetMonthlyCashFlow > 0 ? Number((netInvestmentCost / finalNetMonthlyCashFlow).toFixed(1)) : 0;

    let discountedPaybackMonths = simplePaybackMonths;
    if (finalNetMonthlyCashFlow > 0 && netInvestmentCost > 0 && financialRate > 0) {
      const i = financialRate / 100;
      const cover = (netInvestmentCost * i) / finalNetMonthlyCashFlow;
      if (cover < 1) {
        discountedPaybackMonths = Number((-Math.log(1 - cover) / Math.log(1 + i)).toFixed(1));
      } else {
        discountedPaybackMonths = 999;
      }
    }

    const annualNetCashFlow = finalNetMonthlyCashFlow * 12;
    const roiAnnualPercentage = netInvestmentCost > 0 ? Math.round((annualNetCashFlow / netInvestmentCost) * 100) : 0;

    return {
      grossCapex,
      partsAndEquipment,
      thirdPartyServices,
      internalLaborCost,
      otherCosts,
      pisCofinsRate,
      pisCofinsCredit,
      icmsCredit,
      netInvestmentCost,
      incomeTaxRate,
      depreciationMonths,
      financialRate,
      opItems,
      monthlyGross7Sources,
      grossOperationalGainMonthly,
      incomeTaxOnGainMonthly,
      netOperationalGainMonthly,
      monthlyDepreciation,
      taxShieldDepreciationMonthly,
      finalNetMonthlyCashFlow,
      simplePaybackMonths,
      discountedPaybackMonths,
      roiAnnualPercentage,
    };
  }, [action, auditedTotal, originalTotal]);

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

      const approvedProjectCosts: ProjectInvestmentCosts = {
        ...(action?.projectCosts || {}),
        netInvestmentCost: corporateFinancials.netInvestmentCost,
        grossOperationalGainMonthly: corporateFinancials.grossOperationalGainMonthly,
        incomeTaxOnGainMonthly: corporateFinancials.incomeTaxOnGainMonthly,
        netOperationalGainMonthly: corporateFinancials.netOperationalGainMonthly,
        monthlyDepreciation: corporateFinancials.monthlyDepreciation,
        taxShieldDepreciationMonthly: corporateFinancials.taxShieldDepreciationMonthly,
        finalNetMonthlyCashFlow: corporateFinancials.finalNetMonthlyCashFlow,
        simplePaybackMonths: corporateFinancials.simplePaybackMonths,
        discountedPaybackMonths: corporateFinancials.discountedPaybackMonths,
        roiAnnualPercentage: corporateFinancials.roiAnnualPercentage,
      };

      const effectiveIp = clientIp || action?.controllershipAudit?.reviewerIp || '127.0.0.1';

      const updated = dataService.processControllershipAudit(token, {
        status: 'aprovado',
        gainDetails: finalGainDetails,
        approvedProjectCosts,
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
        reviewerRole: reviewerRole.trim(),
        reviewerIp: effectiveIp,
        auditNotes: auditNotes.trim() || 'Ganhos financeiros auditados e certificados integralmente pela Controladoria.',
      });
      setAction(updated);
      setSuccessStatus('aprovado');

      // Sincronização Server-Side no Supabase
      fetch('/api/controladoria/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          status: 'aprovado',
          approvedEstimatedCostAvoided: originalTotal,
          approvedBreakdown: action?.costBreakdown || {},
          approvedProjectCosts,
          reviewerName: reviewerName.trim(),
          reviewerEmail: reviewerEmail.trim(),
          reviewerRole: reviewerRole.trim(),
          reviewerIp: effectiveIp,
          auditNotes: auditNotes.trim() || 'Ganhos financeiros auditados e certificados integralmente pela Controladoria.',
          gainDetails: finalGainDetails,
        }),
      }).catch((err) => console.warn('[Controladoria] Falha na chamada da API:', err));

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

      const approvedProjectCosts: ProjectInvestmentCosts = {
        ...(action?.projectCosts || {}),
        netInvestmentCost: corporateFinancials.netInvestmentCost,
        grossOperationalGainMonthly: corporateFinancials.grossOperationalGainMonthly,
        incomeTaxOnGainMonthly: corporateFinancials.incomeTaxOnGainMonthly,
        netOperationalGainMonthly: corporateFinancials.netOperationalGainMonthly,
        monthlyDepreciation: corporateFinancials.monthlyDepreciation,
        taxShieldDepreciationMonthly: corporateFinancials.taxShieldDepreciationMonthly,
        finalNetMonthlyCashFlow: corporateFinancials.finalNetMonthlyCashFlow,
        simplePaybackMonths: corporateFinancials.simplePaybackMonths,
        discountedPaybackMonths: corporateFinancials.discountedPaybackMonths,
        roiAnnualPercentage: corporateFinancials.roiAnnualPercentage,
      };

      const effectiveIp = clientIp || action?.controllershipAudit?.reviewerIp || '127.0.0.1';

      const updated = dataService.processControllershipAudit(token, {
        status: 'ajustado_e_aprovado',
        approvedBreakdown,
        approvedEstimatedCostAvoided: auditedTotal,
        approvedProjectCosts,
        gainDetails: finalGainDetails,
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
        reviewerRole: reviewerRole.trim(),
        reviewerIp: effectiveIp,
        auditNotes: auditNotes.trim(),
      });
      setAction(updated);
      setSuccessStatus('ajustado_e_aprovado');

      // Sincronização Server-Side no Supabase
      fetch('/api/controladoria/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          status: 'ajustado_e_aprovado',
          approvedEstimatedCostAvoided: auditedTotal,
          approvedBreakdown,
          approvedProjectCosts,
          reviewerName: reviewerName.trim(),
          reviewerEmail: reviewerEmail.trim(),
          reviewerRole: reviewerRole.trim(),
          reviewerIp: effectiveIp,
          auditNotes: auditNotes.trim(),
          gainDetails: finalGainDetails,
        }),
      }).catch((err) => console.warn('[Controladoria] Falha na chamada da API:', err));

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

      // Sincronização Server-Side no Supabase
      fetch('/api/controladoria/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          status: 'rejeitado',
          reviewerName: reviewerName.trim(),
          reviewerEmail: reviewerEmail.trim(),
          reviewerRole: reviewerRole.trim(),
          auditNotes: auditNotes.trim() || 'Projeto reprovado pela Controladoria para reavaliação de premissas no Gemba.',
          rejectionReason: rejectionReason.trim(),
        }),
      }).catch((err) => console.warn('[Controladoria] Falha na chamada da API:', err));
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
              type="button"
              onClick={() => setShowPrintPreview(!showPrintPreview)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.78rem', borderRadius: '8px' }}
              title="Visualizar a diagramação em formato A4 do Laudo Pericial"
            >
              <Eye size={14} /> {showPrintPreview ? 'Voltar para Mesa' : 'Visualizar Laudo A4'}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.78rem', borderRadius: '8px', backgroundColor: '#0284c7' }}
              title="Imprimir ou salvar em PDF o Laudo Pericial Oficial"
            >
              <Printer size={14} /> Imprimir Laudo Pericial
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Controle de Impressão quando em modo Pré-visualização */}
      {showPrintPreview && (
        <div
          className="no-print"
          style={{
            maxWidth: '960px',
            margin: '1.5rem auto 0 auto',
            padding: '1rem 1.5rem',
            backgroundColor: '#0f172a',
            border: '1.5px solid #0284c7',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#38bdf8" />
              <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                Pré-visualização do Laudo Pericial Oficial (A4)
              </strong>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginTop: '0.15rem' }}>
              Este é o documento contábil emitido com os dados certificados, campos de assinatura formal e IP da estação.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setShowPrintPreview(false)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              Voltar para a Mesa de Auditoria
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 800,
              }}
            >
              <Printer size={15} /> Imprimir Agora (PDF / Papel)
            </button>
          </div>
        </div>
      )}

      <main
        className="no-print"
        style={{
          maxWidth: '1200px',
          margin: '2rem auto 0 auto',
          padding: '0 1.5rem',
          display: showPrintPreview ? 'none' : 'block',
        }}
      >
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
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={13} /> {formatCurrency(action.controllershipAudit?.approvedEstimatedCostAvoided || auditedTotal)}/ano Homologado
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

            <div style={{ display: 'flex', gap: '1.25rem', backgroundColor: '#1e293b', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Líder do Kaizen</span>
                <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>{action.leaderName || action.assignedAgentName || 'Especialista Lean'}</strong>
              </div>
              <div style={{ borderLeft: '1px solid #334155', paddingLeft: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Investimento Bruto</span>
                <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>{formatCurrency(corporateFinancials.grossCapex)}</strong>
              </div>
              {corporateFinancials.netInvestmentCost !== corporateFinancials.grossCapex && (
                <div style={{ borderLeft: '1px solid #334155', paddingLeft: '1.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', display: 'block' }}>Investimento Líquido</span>
                  <strong style={{ fontSize: '0.875rem', color: '#38bdf8' }}>{formatCurrency(corporateFinancials.netInvestmentCost)}</strong>
                </div>
              )}
              <div style={{ borderLeft: '1px solid #334155', paddingLeft: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#fbbf24', display: 'block' }}>Payback Simp / Desc</span>
                <strong style={{ fontSize: '0.875rem', color: '#fbbf24' }}>
                  {corporateFinancials.simplePaybackMonths}m {corporateFinancials.discountedPaybackMonths && corporateFinancials.discountedPaybackMonths !== corporateFinancials.simplePaybackMonths ? `(${corporateFinancials.discountedPaybackMonths}m)` : ''}
                </strong>
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
                    <strong>{action.targetMetricName}:</strong> Inicial de {action.baselineValue} {action.targetMetricUnit || ''} → Meta de {action.targetGoalValue} → <strong>Alcançado: {action.achievedValue || action.targetGoalValue} {action.targetMetricUnit || ''}</strong>
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
                  <th style={{ padding: '0.75rem 1rem', width: '210px' }}>Proposta do Kaizen (R$/ano)</th>
                  <th style={{ padding: '0.75rem 1rem', width: '230px' }}>Validado pela Controladoria (R$/ano)</th>
                  <th style={{ padding: '0.75rem 1rem', width: '200px', textAlign: 'right' }}>Variação / Glosa Contábil</th>
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
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle2 size={10} /> Planilha do Agente Anexada
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
                          {delta > 0 ? `+${formatCurrency(delta)} (Acréscimo)` : delta < 0 ? `${formatCurrency(delta)} (Glosa/Corte)` : formatCurrency(delta)}
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
                                  <User size={12} /> Memória de Cálculo do Agente Lean:
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                      <button
                                        type="button"
                                        onClick={() => setPreviewAttachment(proof.attachment!)}
                                        style={{
                                          padding: '0.25rem 0.55rem',
                                          fontSize: '0.7rem',
                                          borderRadius: '4px',
                                          backgroundColor: 'rgba(56, 189, 248, 0.2)',
                                          color: '#38bdf8',
                                          border: '1px solid rgba(56, 189, 248, 0.4)',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                          fontWeight: 700,
                                        }}
                                        title="Visualizar documento na tela"
                                      >
                                        <Eye size={12} /> Visualizar
                                      </button>
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
                                        title="Baixar planilha original"
                                      >
                                        <Download size={12} /> Baixar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <AlertTriangle size={12} /> Nenhum arquivo de memória de cálculo anexado pelo Agente.
                                  </span>
                                )}
                              </div>

                              {/* 2. Anotações & Contra-Memória da Controladoria */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Building size={12} /> Parecer & Contra-Memória da Controladoria:
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
                                        onClick={() => setPreviewAttachment(proof.auditorAttachment!)}
                                        style={{
                                          padding: '0.25rem 0.55rem',
                                          fontSize: '0.7rem',
                                          borderRadius: '4px',
                                          backgroundColor: 'rgba(56, 189, 248, 0.2)',
                                          color: '#38bdf8',
                                          border: '1px solid rgba(56, 189, 248, 0.4)',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                          fontWeight: 700,
                                        }}
                                        title="Visualizar documento revisado"
                                      >
                                        <Eye size={12} /> Visualizar
                                      </button>
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
                    {deltaTotal > 0 ? `+${formatCurrency(deltaTotal)} (Acréscimo)` : deltaTotal < 0 ? `${formatCurrency(deltaTotal)} (Glosa Total)` : formatCurrency(deltaTotal)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Nota de Esclarecimento Contábil */}
            <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', backgroundColor: '#090e1a', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', lineHeight: 1.4 }}>
              <Info size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
              <span>
                <strong>Critério Contábil da Variação:</strong> Variação = Valor Homologado (-) Proposta do Kaizen. Um resultado com sinal negativo (ex: <code>-R$ 800,00</code>) reflete a <strong>glosa/corte contábil</strong> aplicado pela Controladoria sobre o valor originalmente pleiteado pela equipe (proposta R$ 1.000 (-) homologado R$ 200 = corte de R$ 800).
              </span>
            </div>
          </div>
        </div>

        {/* Demonstrativo de Viabilidade Contábil & Fluxo de Caixa (Modelo Oficial Controladoria - Lucro Real) */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calculator size={20} color="#38bdf8" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Demonstrativo da Viabilidade Contábil & Fluxo de Caixa (Lucro Real)
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Modelo Oficial da Controladoria: Investimento Líquido de Impostos, DRE Operacional pós IR (34%) e Benefício Fiscal de Depreciação (60 meses)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 0.75rem', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                Tax Shield: +34% s/ Deprec.
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 0.75rem', borderRadius: '6px', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                Taxa Desconto: {corporateFinancials.financialRate.toFixed(2)}% a.m.
              </span>
            </div>
          </div>

          {/* Cards Indicadores no Topo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Investimento Bruto</span>
              <strong style={{ fontSize: '1.15rem', color: '#ffffff', display: 'block', margin: '0.2rem 0' }}>
                {formatCurrency(corporateFinancials.grossCapex)}
              </strong>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>CAPEX Nominal Total</span>
            </div>

            <div style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <span style={{ fontSize: '0.7rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Investimento Líquido</span>
              <strong style={{ fontSize: '1.15rem', color: '#38bdf8', display: 'block', margin: '0.2rem 0' }}>
                {formatCurrency(corporateFinancials.netInvestmentCost)}
              </strong>
              <span style={{ fontSize: '0.68rem', color: '#0284c7' }}>
                (-) PIS/COF ({formatCurrency(corporateFinancials.pisCofinsCredit)}) {corporateFinancials.icmsCredit > 0 ? `| ICMS (${formatCurrency(corporateFinancials.icmsCredit)})` : ''}
              </span>
            </div>

            <div style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              <span style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Fluxo Caixa Mensal Líquido</span>
              <strong style={{ fontSize: '1.15rem', color: '#34d399', display: 'block', margin: '0.2rem 0' }}>
                {formatCurrency(corporateFinancials.finalNetMonthlyCashFlow)}/mês
              </strong>
              <span style={{ fontSize: '0.68rem', color: '#059669' }}>
                DRE Líquida + Benefício Fiscal
              </span>
            </div>

            <div style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
              <span style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Payback Simples / Desc.</span>
              <strong style={{ fontSize: '1.15rem', color: '#fbbf24', display: 'block', margin: '0.2rem 0' }}>
                {corporateFinancials.simplePaybackMonths} meses {corporateFinancials.discountedPaybackMonths && corporateFinancials.discountedPaybackMonths !== corporateFinancials.simplePaybackMonths ? `(${corporateFinancials.discountedPaybackMonths}m desc.)` : ''}
              </strong>
              <span style={{ fontSize: '0.68rem', color: '#d97706' }}>
                ROI Anual: {corporateFinancials.roiAnnualPercentage}%
              </span>
            </div>
          </div>

          {/* Grid com 3 Painéis Detalhados */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Painel 1: Composição do Investimento */}
            <div style={{ backgroundColor: '#090e1a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e293b' }}>
                <Receipt size={16} color="#38bdf8" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  1. Investimento Total vs Líquido
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                {corporateFinancials.opItems.length > 0 ? (
                  <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '0.35rem', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {corporateFinancials.opItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                        <span>{item.description || 'Despesa do Projeto'}{item.quantity && item.quantity > 1 ? ` (${item.quantity}x)` : ''}</span>
                        <strong style={{ color: '#f87171' }}>{formatCurrency(Math.abs(item.monthlyValue || 0))}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Peças & Sensores:</span>
                      <strong style={{ color: '#ffffff' }}>{formatCurrency(corporateFinancials.partsAndEquipment)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Serviços de Terceiros:</span>
                      <strong style={{ color: '#ffffff' }}>{formatCurrency(corporateFinancials.thirdPartyServices)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Equipe Interna:</span>
                      <strong style={{ color: '#ffffff' }}>{formatCurrency(corporateFinancials.internalLaborCost)}</strong>
                    </div>
                    {corporateFinancials.otherCosts > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>Outros Custos de CAPEX:</span>
                        <strong style={{ color: '#ffffff' }}>{formatCurrency(corporateFinancials.otherCosts)}</strong>
                      </div>
                    )}
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '0.4rem', color: '#ffffff', fontWeight: 700 }}>
                  <span>Total Bruto (Investimento):</span>
                  <span>{formatCurrency(corporateFinancials.grossCapex)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                  <span>(-) PIS / COFINS ({corporateFinancials.pisCofinsRate}% recuperável):</span>
                  <span>-{formatCurrency(corporateFinancials.pisCofinsCredit)}</span>
                </div>
                {corporateFinancials.icmsCredit > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                    <span>(-) ICMS Recuperável:</span>
                    <span>-{formatCurrency(corporateFinancials.icmsCredit)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #0284c7', paddingTop: '0.5rem', color: '#38bdf8', fontWeight: 800, fontSize: '0.875rem' }}>
                  <span>(=) Investimento Líquido Real:</span>
                  <span>{formatCurrency(corporateFinancials.netInvestmentCost)}</span>
                </div>
              </div>
            </div>

            {/* Painel 2: DRE Operacional da Melhoria */}
            <div style={{ backgroundColor: '#090e1a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e293b' }}>
                <TrendingUp size={16} color="#34d399" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  2. DRE Operacional da Melhoria
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Ganho Bruto 7 Fontes (Anual / 12):</span>
                  <strong style={{ color: '#34d399' }}>+{formatCurrency(corporateFinancials.monthlyGross7Sources)}/mês</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '0.4rem', color: '#ffffff', fontWeight: 700 }}>
                  <span>Ganho Operacional Mensal Bruto:</span>
                  <span style={{ color: '#34d399' }}>{formatCurrency(corporateFinancials.grossOperationalGainMonthly)}/mês</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                  <span>(-) Efeito IRPJ + CSLL ({corporateFinancials.incomeTaxRate}%):</span>
                  <span>-{formatCurrency(corporateFinancials.incomeTaxOnGainMonthly)}/mês</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #334155', paddingTop: '0.5rem', color: '#ffffff', fontWeight: 800, fontSize: '0.875rem' }}>
                  <span>(=) Ganho Líquido Operacional:</span>
                  <span>{formatCurrency(corporateFinancials.netOperationalGainMonthly)}/mês</span>
                </div>
              </div>
            </div>

            {/* Painel 3: Benefício Fiscal da Depreciação e Payback */}
            <div style={{ backgroundColor: '#090e1a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e293b' }}>
                <ShieldCheck size={16} color="#fbbf24" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  3. Tax Shield & Payback Corporativo
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Depreciação ({corporateFinancials.depreciationMonths} meses):</span>
                  <strong style={{ color: '#ffffff' }}>{formatCurrency(corporateFinancials.monthlyDepreciation)}/mês</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>(+) Benefício Fiscal ({corporateFinancials.incomeTaxRate}% IR dedutível):</span>
                  <strong style={{ color: '#34d399' }}>+{formatCurrency(corporateFinancials.taxShieldDepreciationMonthly)}/mês</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '0.4rem', color: '#34d399', fontWeight: 800, fontSize: '0.875rem' }}>
                  <span>(=) Fluxo Caixa Líquido Final:</span>
                  <span>{formatCurrency(corporateFinancials.finalNetMonthlyCashFlow)}/mês</span>
                </div>

                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 700 }}>
                    <span>Payback Simples:</span>
                    <span>{corporateFinancials.simplePaybackMonths} meses</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', fontWeight: 700 }}>
                    <span>Payback Descontado ({corporateFinancials.financialRate}% a.m.):</span>
                    <span>{corporateFinancials.discountedPaybackMonths} meses</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', fontWeight: 700 }}>
                    <span>Retorno Anualizado (ROI):</span>
                    <span>{corporateFinancials.roiAnnualPercentage}% ao ano</span>
                  </div>
                </div>
              </div>
            </div>
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

        {/* Modal de Visualização de Arquivo de Memória de Cálculo / Auditoria */}
        {previewAttachment && (
          <Modal
            isOpen={Boolean(previewAttachment)}
            onClose={() => setPreviewAttachment(null)}
            title={`Memória de Cálculo: ${previewAttachment.name}`}
            subtitle={`Tamanho: ${previewAttachment.sizeFormatted} • Anexado por ${previewAttachment.uploadedBy || 'Agente / Auditor'} em ${formatDateTime(previewAttachment.uploadedAt)}`}
            maxWidth="4xl"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '320px' }}>
              {previewAttachment.fileType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(previewAttachment.name) ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#050811', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <img
                    src={previewAttachment.url}
                    alt={previewAttachment.name}
                    style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain', borderRadius: '6px' }}
                  />
                </div>
              ) : previewAttachment.fileType === 'application/pdf' || /\.pdf$/i.test(previewAttachment.name) ? (
                <div style={{ width: '100%', height: '70vh', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <iframe
                    src={previewAttachment.url}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={previewAttachment.name}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3.5rem 1.5rem',
                    backgroundColor: '#050811',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    <FileSpreadsheet size={34} color="#38bdf8" />
                  </div>
                  <div>
                    <h4 style={{ color: '#ffffff', fontSize: '1.15rem', margin: '0 0 0.4rem 0', fontWeight: 800 }}>
                      {previewAttachment.name}
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                      Planilha de Cálculo / Documento Contábil ({previewAttachment.sizeFormatted})
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0.35rem 0 0 0' }}>
                      Para inspecionar fórmulas e células completas, baixe o arquivo original ou abra em nova janela.
                    </p>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.65rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleOpenAttachmentInNewTab(previewAttachment)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} /> Abrir em Nova Janela
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadAttachment(previewAttachment)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Download size={14} /> Baixar Arquivo Completo
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="btn btn-outline btn-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </Modal>
        )}
      </main>

      {/* =========================================================================
          LAUDO TÉCNICO PERICIAL DE AUDITORIA CONTÁBIL & HOMOLOGAÇÃO FINANCEIRA
          Layout corporativo oficial formatado para impressão A4 e exportação PDF
         ========================================================================= */}
      <div className={`print-report-wrapper ${showPrintPreview ? 'force-preview' : 'print-only'}`}>
        {/* Cabeçalho Corporativo e Fé Pública */}
        <div style={{ borderBottom: '3px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '13pt', fontWeight: 900, letterSpacing: '0.05em', color: '#0f172a', textTransform: 'uppercase' }}>
                  RAFTEC S.A. | GRUPO VACCARO
                </span>
              </div>
              <span style={{ fontSize: '7.8pt', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Departamento de Controladoria Corporativa & Governança de Eficiência Operacional
              </span>
              <h1 style={{ fontSize: '12pt', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                Laudo Pericial de Auditoria Contábil & Homologação de CAPEX
              </h1>
              <span style={{ fontSize: '7.2pt', color: '#64748b' }}>
                Metodologia Lean Flow / DMAIC • Conformidade com CPC 27, CPC 01 e Lucro Real (Lei 12.973/14)
              </span>
            </div>

            <div style={{ textAlign: 'right', borderLeft: '2px solid #e2e8f0', paddingLeft: '1rem', minWidth: '220px' }}>
              <div style={{ fontSize: '8.5pt', color: '#0f172a', fontWeight: 800 }}>
                PROTOCOLO: <span style={{ fontFamily: 'monospace' }}>{action.protocol}</span>
              </div>
              <div style={{ fontSize: '7.2pt', color: '#64748b', marginTop: '0.15rem' }}>
                TOKEN: <span style={{ fontFamily: 'monospace' }}>{(action.controllershipAudit?.token || token).substring(0, 16)}...</span>
              </div>
              <div style={{ fontSize: '7.2pt', color: '#475569', marginTop: '0.15rem' }}>
                EMISSÃO: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </div>
              <div style={{ fontSize: '7.2pt', color: '#0369a1', fontWeight: 700, marginTop: '0.15rem' }}>
                TERMINAL / IP: {action.controllershipAudit?.reviewerIp || clientIp || '127.0.0.1 (Estação Corporativa)'}
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <span style={{
                  fontSize: '7pt',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: auditStatus === 'aprovado' || auditStatus === 'ajustado_e_aprovado' ? '#dcfce7' : '#fef3c7',
                  color: auditStatus === 'aprovado' || auditStatus === 'ajustado_e_aprovado' ? '#166534' : '#92400e',
                  border: `1px solid ${auditStatus === 'aprovado' || auditStatus === 'ajustado_e_aprovado' ? '#86efac' : '#fcd34d'}`
                }}>
                  {auditStatus === 'aprovado' ? 'Ganhos Homologados Integralmente' : auditStatus === 'ajustado_e_aprovado' ? 'Ganhos Homologados com Ajuste Pericial' : 'Pendente de Certificação'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Identificação Cadastral do Projeto */}
        <div className="page-break-inside-avoid" style={{ marginBottom: '1.15rem' }}>
          <h2 style={{ fontSize: '8.5pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', borderBottom: '1.5px solid #0f172a', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
            1. Identificação Cadastral do Projeto de Melhoria Contínua
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.8pt' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.3rem 0.5rem', fontWeight: 700, color: '#475569', width: '22%' }}>Título da Ação:</td>
                <td style={{ padding: '0.3rem 0.5rem', fontWeight: 800, color: '#0f172a' }} colSpan={3}>{action.title}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.3rem 0.5rem', fontWeight: 700, color: '#475569' }}>Setor de Origem:</td>
                <td style={{ padding: '0.3rem 0.5rem', color: '#0f172a', width: '38%' }}>{action.originSectorName || 'Setor Fabril'}</td>
                <td style={{ padding: '0.3rem 0.5rem', fontWeight: 700, color: '#475569', width: '18%' }}>Setor de Destino:</td>
                <td style={{ padding: '0.3rem 0.5rem', color: '#0f172a' }}>{action.targetSectorName || 'Linha Operacional'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.3rem 0.5rem', fontWeight: 700, color: '#475569' }}>Líder do Kaizen:</td>
                <td style={{ padding: '0.3rem 0.5rem', color: '#0f172a' }}>{action.leaderName || action.assignedAgentName || 'Especialista Lean'}</td>
                <td style={{ padding: '0.3rem 0.5rem', fontWeight: 700, color: '#475569' }}>Desperdício TPS:</td>
                <td style={{ padding: '0.3rem 0.5rem', color: '#0f172a' }}>{action.wasteCategory || 'Geral'}</td>
              </tr>
              {action.problemStatement && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.3rem 0.5rem', fontWeight: 700, color: '#475569' }}>Problema (PLAN):</td>
                  <td style={{ padding: '0.3rem 0.5rem', color: '#334155' }} colSpan={3}>{action.problemStatement}</td>
                </tr>
              )}
              {action.targetMetricName && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.3rem 0.5rem', fontWeight: 700, color: '#475569' }}>Indicador & Meta:</td>
                  <td style={{ padding: '0.3rem 0.5rem', color: '#0f172a' }} colSpan={3}>
                    <strong>{action.targetMetricName}:</strong> Inicial: {action.baselineValue} → Meta: {action.targetGoalValue} → <strong>Alcançado: {action.achievedValue || action.targetGoalValue} {action.targetMetricUnit || ''}</strong>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Auditoria Pericial das 7 Fontes de Custo Evitado Lean */}
        <div className="page-break-inside-avoid" style={{ marginBottom: '1.15rem' }}>
          <h2 style={{ fontSize: '8.5pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', borderBottom: '1.5px solid #0f172a', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
            2. Auditoria Pericial das 7 Fontes Tradicionais de Custo Evitado Lean
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.8pt', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1.5px solid #94a3b8', color: '#0f172a', textAlign: 'left' }}>
                <th style={{ padding: '0.35rem 0.5rem' }}>Conta de Economia Lean (7 Fontes)</th>
                <th style={{ padding: '0.35rem 0.5rem', width: '28%' }}>Memorial / Documentação Verificada</th>
                <th style={{ padding: '0.35rem 0.5rem', textAlign: 'right', width: '16%' }}>Proposta Kaizen (R$/ano)</th>
                <th style={{ padding: '0.35rem 0.5rem', textAlign: 'right', width: '18%' }}>Homologado Controladoria (R$/ano)</th>
                <th style={{ padding: '0.35rem 0.5rem', textAlign: 'right', width: '18%' }}>Variação / Glosa Contábil</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: '1. Mão de Obra e Horas Salvas', orig: action.controllershipAudit?.originalCostBreakdown?.laborSavings || 0, val: Number(laborSavings) || 0, proof: gainDetails['laborSavings'] },
                { name: '2. Aumento de Produção / SMED', orig: action.controllershipAudit?.originalCostBreakdown?.productionIncrease || 0, val: Number(productionIncrease) || 0, proof: gainDetails['productionIncrease'] },
                { name: '3. Redução de Refugo e Matéria-Prima', orig: action.controllershipAudit?.originalCostBreakdown?.scrapReduction || 0, val: Number(scrapReduction) || 0, proof: gainDetails['scrapReduction'] },
                { name: '4. Redução de Paradas de Máquina (OEE)', orig: action.controllershipAudit?.originalCostBreakdown?.machineDowntime || 0, val: Number(machineDowntime) || 0, proof: gainDetails['machineDowntime'] },
                { name: '5. Ferramental, Energia e Insumos', orig: action.controllershipAudit?.originalCostBreakdown?.toolingAndEnergy || 0, val: Number(toolingAndEnergy) || 0, proof: gainDetails['toolingAndEnergy'] },
                { name: '6. Fretes Especiais e Estoque (WIP)', orig: action.controllershipAudit?.originalCostBreakdown?.logisticsAndFreight || 0, val: Number(logisticsAndFreight) || 0, proof: gainDetails['logisticsAndFreight'] },
                { name: `7. Outros Custos Evitados${otherSavingsDescription ? ` (${otherSavingsDescription})` : ''}`, orig: action.controllershipAudit?.originalCostBreakdown?.otherSavings || 0, val: Number(otherSavings) || 0, proof: gainDetails['otherSavings'] },
              ].map((row, i) => {
                const delta = row.val - row.orig;
                const hasProof = Boolean(row.proof?.attachment || row.proof?.explanation || row.proof?.auditorAttachment || row.proof?.auditorExplanation);
                const proofText = row.proof?.auditorExplanation || row.proof?.explanation || (row.proof?.attachment ? `Planilha: ${row.proof.attachment.name}` : hasProof ? 'Documentado' : 'Premissa operacional declarada');
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '0.3rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{row.name}</td>
                    <td style={{ padding: '0.3rem 0.5rem', color: '#475569', fontSize: '7.2pt', fontStyle: 'italic' }}>{proofText}</td>
                    <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', color: '#475569' }}>{formatCurrency(row.orig)}</td>
                    <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(row.val)}</td>
                    <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontWeight: 700, color: delta === 0 ? '#64748b' : delta > 0 ? '#15803d' : '#b91c1c' }}>
                      {delta > 0 ? `+${formatCurrency(delta)} (Acréscimo)` : delta < 0 ? `${formatCurrency(delta)} (Glosa/Corte)` : formatCurrency(delta)}
                    </td>
                  </tr>
                );
              })}
              {/* Linha Totalizadora */}
              <tr style={{ backgroundColor: '#e2e8f0', borderTop: '2px solid #0f172a', fontWeight: 900 }}>
                <td style={{ padding: '0.45rem 0.5rem', color: '#0f172a', textTransform: 'uppercase' }} colSpan={2}>
                  TOTAL ANUALIZADO HOMOLOGADO (BASE OFICIAL)
                </td>
                <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right', color: '#475569' }}>{formatCurrency(originalTotal)}/ano</td>
                <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right', color: '#0f172a', fontSize: '8.5pt' }}>{formatCurrency(auditedTotal)}/ano</td>
                <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right', color: deltaTotal === 0 ? '#475569' : deltaTotal > 0 ? '#15803d' : '#b91c1c' }}>
                  {deltaTotal > 0 ? `+${formatCurrency(deltaTotal)} (Acréscimo)` : deltaTotal < 0 ? `${formatCurrency(deltaTotal)} (Glosa Total)` : formatCurrency(deltaTotal)}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: '6.5pt', color: '#64748b', marginTop: '0.25rem', fontStyle: 'italic', lineHeight: 1.3 }}>
            * Nota Pericial Contábil: A coluna &quot;Variação / Glosa Contábil&quot; representa a diferença matemática (Homologado (-) Proposta). Valores negativos (ex: -R$ 800,00) representam cortes e glosas das estimativas operacionais aplicadas pela Controladoria corporativa.
          </div>
        </div>

        {/* 3. Demonstrativo de Capital (CAPEX) & 4. DRE Operacional da Melhoria */}
        <div className="page-break-inside-avoid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.15rem' }}>
          {/* Quadro CAPEX */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.65rem' }}>
            <h3 style={{ fontSize: '8pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', borderBottom: '1.5px solid #0f172a', paddingBottom: '0.2rem', margin: '0 0 0.4rem 0' }}>
              3. Composição de Capital (CAPEX) & Deduções Fiscais (CPC 27)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5pt' }}>
              <tbody>
                {corporateFinancials.opItems.length > 0 ? (
                  corporateFinancials.opItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.2rem 0', color: '#334155' }}>
                        {item.description || 'Despesa de Investimento'} {item.quantity && item.quantity > 1 ? `(${item.quantity}x)` : ''}
                      </td>
                      <td style={{ padding: '0.2rem 0', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        {formatCurrency(Math.abs(item.monthlyValue || 0))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.2rem 0', color: '#334155' }}>Peças & Sensores:</td>
                      <td style={{ padding: '0.2rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(corporateFinancials.partsAndEquipment)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.2rem 0', color: '#334155' }}>Serviços de Terceiros / Usinagem:</td>
                      <td style={{ padding: '0.2rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(corporateFinancials.thirdPartyServices)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.2rem 0', color: '#334155' }}>Mão de Obra Interna da Equipe:</td>
                      <td style={{ padding: '0.2rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(corporateFinancials.internalLaborCost)}</td>
                    </tr>
                    {corporateFinancials.otherCosts > 0 && (
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.2rem 0', color: '#334155' }}>Outros Custos de Investimento:</td>
                        <td style={{ padding: '0.2rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(corporateFinancials.otherCosts)}</td>
                      </tr>
                    )}
                  </>
                )}
                <tr style={{ borderTop: '1px solid #94a3b8', fontWeight: 800 }}>
                  <td style={{ padding: '0.25rem 0', color: '#0f172a' }}>Total Bruto em CAPEX:</td>
                  <td style={{ padding: '0.25rem 0', textAlign: 'right', color: '#0f172a' }}>{formatCurrency(corporateFinancials.grossCapex)}</td>
                </tr>
                <tr style={{ color: '#0284c7' }}>
                  <td style={{ padding: '0.18rem 0' }}>(-) PIS/COFINS ({corporateFinancials.pisCofinsRate}% - Lei 10.833/03):</td>
                  <td style={{ padding: '0.18rem 0', textAlign: 'right' }}>-{formatCurrency(corporateFinancials.pisCofinsCredit)}</td>
                </tr>
                {corporateFinancials.icmsCredit > 0 && (
                  <tr style={{ color: '#0284c7' }}>
                    <td style={{ padding: '0.18rem 0' }}>(-) ICMS Recuperável:</td>
                    <td style={{ padding: '0.18rem 0', textAlign: 'right' }}>-{formatCurrency(corporateFinancials.icmsCredit)}</td>
                  </tr>
                )}
                <tr style={{ borderTop: '1.5px solid #0f172a', backgroundColor: '#f1f5f9', fontWeight: 900 }}>
                  <td style={{ padding: '0.3rem 0.2rem', color: '#0f172a' }}>(=) INVESTIMENTO LÍQUIDO REAL:</td>
                  <td style={{ padding: '0.3rem 0.2rem', textAlign: 'right', color: '#0f172a', fontSize: '8pt' }}>
                    {formatCurrency(corporateFinancials.netInvestmentCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quadro DRE Operacional & Fluxo de Caixa */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.65rem' }}>
            <h3 style={{ fontSize: '8pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', borderBottom: '1.5px solid #0f172a', paddingBottom: '0.2rem', margin: '0 0 0.4rem 0' }}>
              4. DRE Operacional & Fluxo de Caixa Livre (Lucro Real)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5pt' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.2rem 0', color: '#334155' }}>(+) Ganho Operacional Mensal Bruto:</td>
                  <td style={{ padding: '0.2rem 0', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                    +{formatCurrency(corporateFinancials.grossOperationalGainMonthly)}/mês
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#b91c1c' }}>
                  <td style={{ padding: '0.2rem 0' }}>(-) IRPJ + CSLL (Alíquota 34%):</td>
                  <td style={{ padding: '0.2rem 0', textAlign: 'right' }}>
                    -{formatCurrency(corporateFinancials.incomeTaxOnGainMonthly)}/mês
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
                  <td style={{ padding: '0.25rem 0', color: '#0f172a' }}>(=) Ganho Líquido Operacional pós-IR:</td>
                  <td style={{ padding: '0.25rem 0', textAlign: 'right', color: '#0f172a' }}>
                    {formatCurrency(corporateFinancials.netOperationalGainMonthly)}/mês
                  </td>
                </tr>
                <tr style={{ color: '#475569' }}>
                  <td style={{ padding: '0.2rem 0' }}>Quota Depreciação Linear (60 meses / 20% a.a.):</td>
                  <td style={{ padding: '0.2rem 0', textAlign: 'right' }}>
                    {formatCurrency(corporateFinancials.monthlyDepreciation)}/mês
                  </td>
                </tr>
                <tr style={{ color: '#15803d' }}>
                  <td style={{ padding: '0.2rem 0' }}>(+) Benefício Fiscal Depreciação (Tax Shield 34%):</td>
                  <td style={{ padding: '0.2rem 0', textAlign: 'right' }}>
                    +{formatCurrency(corporateFinancials.taxShieldDepreciationMonthly)}/mês
                  </td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #0f172a', backgroundColor: '#f1f5f9', fontWeight: 900 }}>
                  <td style={{ padding: '0.3rem 0.2rem', color: '#0f172a' }}>(=) FLUXO DE CAIXA MENSAL LÍQUIDO:</td>
                  <td style={{ padding: '0.3rem 0.2rem', textAlign: 'right', color: '#15803d', fontSize: '8pt' }}>
                    {formatCurrency(corporateFinancials.finalNetMonthlyCashFlow)}/mês
                  </td>
                </tr>
                <tr style={{ borderTop: '1px dashed #cbd5e1' }}>
                  <td style={{ padding: '0.25rem 0', color: '#0f172a', fontWeight: 700 }}>Payback Simples / Descontado (TMA 1% a.m.):</td>
                  <td style={{ padding: '0.25rem 0', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                    {corporateFinancials.simplePaybackMonths}m / {corporateFinancials.discountedPaybackMonths}m
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.2rem 0', color: '#0f172a', fontWeight: 700 }}>Taxa de Retorno Anualizada (ROI):</td>
                  <td style={{ padding: '0.2rem 0', textAlign: 'right', fontWeight: 800, color: '#0369a1' }}>
                    {corporateFinancials.roiAnnualPercentage}% ao ano
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Parecer Técnico-Pericial da Controladoria */}
        <div className="page-break-inside-avoid" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.65rem 0.85rem', marginBottom: '1.15rem', backgroundColor: '#fafafa' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', margin: '0 0 0.35rem 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
            5. Parecer Técnico-Pericial & Justificativa da Controladoria
          </h2>
          <p style={{ fontSize: '7.8pt', color: '#334155', lineHeight: 1.5, margin: '0 0 0.35rem 0' }}>
            {action.controllershipAudit?.auditNotes || auditNotes || 'Ganhos financeiros auditados, conferidos por memória de cálculo e certificados integralmente pela Controladoria Corporativa.'}
          </p>
          <p style={{ fontSize: '7.2pt', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
            Conclusão Pericial: A Controladoria Corporativa do Grupo Vaccaro atesta a veracidade das premissas econômico-fiscais analisadas, em conformidade com o regime do Lucro Real (RIR/2018) e pronunciamentos do CPC, homologando o valor anualizado como meta oficial e autorizando o acompanhamento trimestral (Follow-up de 90 dias).
          </p>
        </div>

        {/* 6. Termo Formal de Homologação e Assinaturas */}
        <div className="page-break-inside-avoid" style={{ border: '1.5px solid #0f172a', borderRadius: '6px', padding: '0.85rem', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', textAlign: 'center', margin: '0 0 0.75rem 0', letterSpacing: '0.05em' }}>
            6. Termo Formal de Homologação, Certificação & Responsabilidade
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Assinatura 1: Auditor da Controladoria */}
            <div style={{ border: '1px solid #94a3b8', borderRadius: '6px', padding: '0.65rem', backgroundColor: '#f8fafc', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '6.8pt', fontWeight: 800, textTransform: 'uppercase', color: '#166534', borderBottom: '1px solid #bbf7d0', paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
                  [✓] Assinado Eletronicamente
                </div>
                <div style={{ fontSize: '8.2pt', fontWeight: 800, color: '#0f172a' }}>
                  {action.controllershipAudit?.reviewedBy || reviewerName || 'Auditor da Controladoria'}
                </div>
                <div style={{ fontSize: '7.2pt', color: '#475569' }}>
                  {action.controllershipAudit?.reviewerRole || reviewerRole || 'Auditor Contábil / Controller'}
                </div>
                <div style={{ fontSize: '6.8pt', color: '#64748b' }}>
                  {action.controllershipAudit?.reviewerEmail || reviewerEmail || 'controladoria@empresa.com.br'}
                </div>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.35rem', marginTop: '0.35rem', fontSize: '6.5pt', color: '#64748b' }}>
                <div>Data: {formatDateTime(action.controllershipAudit?.reviewedAt || new Date().toISOString())}</div>
                <div>IP: <strong style={{ color: '#0284c7' }}>{action.controllershipAudit?.reviewerIp || clientIp || '127.0.0.1'}</strong></div>
                <div>Hash: SHA256-{(action.controllershipAudit?.token || token).substring(0, 10).toUpperCase()}</div>
              </div>
            </div>

            {/* Assinatura 2: Gerente / Gestor da Área */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.65rem', backgroundColor: '#ffffff', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '6.8pt', fontWeight: 800, textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
                  Gestor da Unidade / Solicitante
                </div>
                <div style={{ height: '36px', borderBottom: '1px solid #0f172a', marginBottom: '0.35rem' }}></div>
                <div style={{ fontSize: '7.2pt', color: '#0f172a' }}>
                  Nome: ____________________________
                </div>
                <div style={{ fontSize: '6.8pt', color: '#64748b', marginTop: '0.15rem' }}>
                  Cargo: Gerente / Coordenador da Área
                </div>
              </div>
              <div style={{ fontSize: '6.8pt', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '0.3rem' }}>
                Data: _____ / _____ / _________
              </div>
            </div>

            {/* Assinatura 3: Diretoria Executiva / CFO */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.65rem', backgroundColor: '#ffffff', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '6.8pt', fontWeight: 800, textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
                  Diretoria Executiva / CFO
                </div>
                <div style={{ height: '36px', borderBottom: '1px solid #0f172a', marginBottom: '0.35rem' }}></div>
                <div style={{ fontSize: '7.2pt', color: '#0f172a' }}>
                  Nome: ____________________________
                </div>
                <div style={{ fontSize: '6.8pt', color: '#64748b', marginTop: '0.15rem' }}>
                  Cargo: CFO / Diretor Geral
                </div>
              </div>
              <div style={{ fontSize: '6.8pt', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '0.3rem' }}>
                Data: _____ / _____ / _________
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Jurídico */}
        <div style={{ textAlign: 'center', marginTop: '0.85rem', paddingTop: '0.45rem', borderTop: '1px solid #e2e8f0', fontSize: '6.5pt', color: '#94a3b8' }}>
          Documento emitido eletronicamente pelo Lean Flow System com assinatura digital e registro de IP auditável • Rafitec S.A. / Grupo Vaccaro • Uso estritamente interno e sigiloso.
        </div>
      </div>

      {/* Estilos Globais de Impressão e Pré-Visualização */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          html, body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 8pt !important;
            line-height: 1.35 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-report-wrapper {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
          .force-preview {
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 3rem !important;
            border-radius: 12px !important;
            box-shadow: 0 15px 45px rgba(0,0,0,0.6) !important;
            max-width: 960px !important;
            margin: 1.5rem auto 3rem auto !important;
            border: 1px solid #cbd5e1 !important;
            font-size: 8.5pt !important;
            line-height: 1.4 !important;
          }
        }
      `}</style>
    </div>
  );
}
