'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { dataService } from '@/services/dataService';
import { LeanAction, PDCAMethodologyStage, ActionChecklistItem, ProjectAttachment } from '@/lib/types';
import { StatusBadge, PriorityBadge, WasteCategoryBadge } from '@/components/ui/Badge';
import { formatDateTime, formatDate, formatCurrency, WASTE_CATEGORIES } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Building,
  User,
  CheckSquare,
  AlertTriangle,
  Calendar,
  Layers,
  FileCheck,
  Zap,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Shield,
  MessageSquare,
  Activity,
  Plus,
  Save,
  Check,
  Award,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Percent,
  FileText,
  Paperclip,
  Download,
  Trash2,
  UploadCloud,
  FileSpreadsheet,
  Eye,
  File,
  BarChart3,
  Image as ImageIcon,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { currentUser, allAgents, refreshData } = useAuth();

  const [action, setAction] = useState<LeanAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<PDCAMethodologyStage>('plan');
  const [isSaved, setIsSaved] = useState(false);

  // Form State for PDCA Fields
  const [targetMetricName, setTargetMetricName] = useState('');
  const [targetMetricUnit, setTargetMetricUnit] = useState('');
  const [baselineValue, setBaselineValue] = useState<number | ''>('');
  const [targetGoalValue, setTargetGoalValue] = useState<number | ''>('');
  const [achievedValue, setAchievedValue] = useState<number | ''>('');
  const [currentProblemCostMonthly, setCurrentProblemCostMonthly] = useState<number | ''>('');
  const [problemStatement, setProblemStatement] = useState('');
  const [fiveWhys, setFiveWhys] = useState<string[]>(['', '', '', '', '']);
  
  // Pareto 80/20 Analysis & Chart Image
  const [paretoImageUrl, setParetoImageUrl] = useState<string>('');
  const [paretoImageName, setParetoImageName] = useState<string>('');
  const [paretoVitalCauses, setParetoVitalCauses] = useState<string>('');
  const [paretoCumulativePercent, setParetoCumulativePercent] = useState<number | ''>(80);

  // Costs (Investimento Capex/Opex)
  const [partsAndEquipment, setPartsAndEquipment] = useState<number>(0);
  const [thirdPartyServices, setThirdPartyServices] = useState<number>(0);
  const [internalLaborHours, setInternalLaborHours] = useState<number>(0);
  const [laborHourlyRate, setLaborHourlyRate] = useState<number>(45);
  const [otherCosts, setOtherCosts] = useState<number>(0);

  // Gains (7 Fontes)
  const [machineDowntime, setMachineDowntime] = useState<number>(0);
  const [laborSavings, setLaborSavings] = useState<number>(0);
  const [scrapReduction, setScrapReduction] = useState<number>(0);
  const [toolingAndEnergy, setToolingAndEnergy] = useState<number>(0);
  const [logisticsAndFreight, setLogisticsAndFreight] = useState<number>(0);
  const [productionIncrease, setProductionIncrease] = useState<number>(0);
  const [otherSavings, setOtherSavings] = useState<number>(0);

  // Standardization & Act
  const [standardWorkUpdated, setStandardWorkUpdated] = useState(false);
  const [standardWorkDocRef, setStandardWorkDocRef] = useState('');
  const [yokotenReplication, setYokotenReplication] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [pilotArea, setPilotArea] = useState('');
  const [pilotTestObservations, setPilotTestObservations] = useState('');

  // Anexos de Memorial de Cálculo & Documentos (PDF / Planilhas)
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [newAttachmentCategory, setNewAttachmentCategory] = useState<'memorial_calculo' | 'evidencia_foto' | 'relatorio_tecnico' | 'outro'>('memorial_calculo');
  const [newAttachmentDesc, setNewAttachmentDesc] = useState('');

  // 5W2H Checklist
  const [checklistItems, setChecklistItems] = useState<ActionChecklistItem[]>([]);
  const [newActionLabel, setNewActionLabel] = useState('');
  const [newActionResp, setNewActionResp] = useState('');
  const [newActionStart, setNewActionStart] = useState('');
  const [newActionEnd, setNewActionEnd] = useState('');
  const [newActionHours, setNewActionHours] = useState<number | ''>('');

  useEffect(() => {
    if (projectId) {
      let found = dataService.getActionById(projectId);
      if (!found) {
        found = dataService.getActionByProtocol(projectId);
      }
      if (found) {
        setAction(found);
        setActiveTab(found.pdcaStage || 'plan');
        
        // P - PLAN
        setTargetMetricName(found.targetMetricName || '');
        setTargetMetricUnit(found.targetMetricUnit || '');
        setBaselineValue(found.baselineValue !== undefined ? found.baselineValue : '');
        setTargetGoalValue(found.targetGoalValue !== undefined ? found.targetGoalValue : '');
        setAchievedValue(found.achievedValue !== undefined ? found.achievedValue : '');
        setCurrentProblemCostMonthly(found.currentProblemCostMonthly !== undefined ? found.currentProblemCostMonthly : '');
        setProblemStatement(found.problemStatement || found.description || '');
        setFiveWhys(
          found.fiveWhys && found.fiveWhys.length === 5
            ? found.fiveWhys
            : ['1. ', '2. ', '3. ', '4. ', '5. ']
        );
        setParetoImageUrl(found.pareto?.chartImageUrl || '');
        setParetoImageName(found.pareto?.chartImageName || '');
        setParetoVitalCauses(
          found.pareto?.vitalCausesSummary ||
            '80% das perdas concentradas nas 2 causas vitais prioritárias identificadas no gráfico de Pareto.'
        );
        setParetoCumulativePercent(
          found.pareto?.cumulativeImpactPercentage !== undefined ? found.pareto.cumulativeImpactPercentage : 80
        );

        // D - DO
        setChecklistItems(found.checklist || []);
        setPilotArea(found.pilotArea || '');
        setPilotTestObservations(found.pilotTestObservations || '');

        // C - CHECK
        setAttachments(found.attachments || []);
        setPartsAndEquipment(found.projectCosts?.partsAndEquipment || 0);
        setThirdPartyServices(found.projectCosts?.thirdPartyServices || 0);
        setInternalLaborHours(found.projectCosts?.internalLaborHours || 0);
        setLaborHourlyRate(found.projectCosts?.laborHourlyRate || 45);
        setOtherCosts(found.projectCosts?.otherCosts || 0);

        setMachineDowntime(found.costBreakdown?.machineDowntime || 0);
        setLaborSavings(found.costBreakdown?.laborSavings || 0);
        setScrapReduction(found.costBreakdown?.scrapReduction || 0);
        setToolingAndEnergy(found.costBreakdown?.toolingAndEnergy || 0);
        setLogisticsAndFreight(found.costBreakdown?.logisticsAndFreight || 0);
        setProductionIncrease(found.costBreakdown?.productionIncrease || 0);
        setOtherSavings(found.costBreakdown?.otherSavings || 0);

        // A - ACT
        setStandardWorkUpdated(!!found.standardWorkUpdated);
        setStandardWorkDocRef(found.standardWorkDocRef || '');
        setYokotenReplication(found.yokotenReplication || '');
        setLessonsLearned(found.lessonsLearned || '');
      }
      setLoading(false);
    }
  }, [projectId]);

  // Dynamic Calculated Financials
  const totalInvestmentCost =
    partsAndEquipment +
    thirdPartyServices +
    internalLaborHours * laborHourlyRate +
    otherCosts;

  const totalGrossSavings =
    machineDowntime +
    laborSavings +
    scrapReduction +
    toolingAndEnergy +
    logisticsAndFreight +
    productionIncrease +
    otherSavings;

  const netSavings = totalGrossSavings - totalInvestmentCost;
  const roiPercentage = totalInvestmentCost > 0 ? Math.round((netSavings / totalInvestmentCost) * 100) : 0;
  const monthlyGrossSavings = totalGrossSavings / 12;
  const paybackMonths =
    monthlyGrossSavings > 0 && totalInvestmentCost > 0
      ? Number((totalInvestmentCost / monthlyGrossSavings).toFixed(1))
      : 0;

  const handleSaveAll = () => {
    if (!action) return;

    const updated = dataService.updateAction(action.id, {
      pdcaStage: activeTab,
      problemStatement,
      targetMetricName,
      targetMetricUnit,
      baselineValue: baselineValue === '' ? undefined : Number(baselineValue),
      targetGoalValue: targetGoalValue === '' ? undefined : Number(targetGoalValue),
      achievedValue: achievedValue === '' ? undefined : Number(achievedValue),
      currentProblemCostMonthly: currentProblemCostMonthly === '' ? undefined : Number(currentProblemCostMonthly),
      fiveWhys,
      pareto: {
        chartImageUrl: paretoImageUrl,
        chartImageName: paretoImageName,
        vitalCausesSummary: paretoVitalCauses,
        cumulativeImpactPercentage: paretoCumulativePercent === '' ? 80 : Number(paretoCumulativePercent),
      },
      pilotArea,
      pilotTestObservations,
      checklist: checklistItems,
      projectCosts: {
        partsAndEquipment,
        thirdPartyServices,
        internalLaborHours,
        laborHourlyRate,
        otherCosts,
        totalCost: totalInvestmentCost,
      },
      costBreakdown: {
        machineDowntime,
        laborSavings,
        scrapReduction,
        toolingAndEnergy,
        logisticsAndFreight,
        productionIncrease,
        otherSavings,
      },
      actualCostAvoided: totalGrossSavings,
      netSavings,
      roiPercentage,
      paybackMonths,
      attachments,
      standardWorkUpdated,
      standardWorkDocRef,
      yokotenReplication,
      lessonsLearned,
    });

    setAction(updated);
    setIsSaved(true);
    refreshData();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleParetoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !action) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setParetoImageUrl(dataUrl);
      setParetoImageName(file.name);
      const updatedPareto = {
        chartImageUrl: dataUrl,
        chartImageName: file.name,
        vitalCausesSummary: paretoVitalCauses,
        cumulativeImpactPercentage: paretoCumulativePercent === '' ? 80 : Number(paretoCumulativePercent),
      };
      dataService.updateAction(action.id, { pareto: updatedPareto });
      refreshData();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveParetoImage = () => {
    if (!action) return;
    setParetoImageUrl('');
    setParetoImageName('');
    dataService.updateAction(action.id, {
      pareto: {
        chartImageUrl: '',
        chartImageName: '',
        vitalCausesSummary: paretoVitalCauses,
        cumulativeImpactPercentage: paretoCumulativePercent === '' ? 80 : Number(paretoCumulativePercent),
      },
    });
    refreshData();
  };

  const handleAgentSubmitForApproval = () => {
    if (!action) return;
    const updated = dataService.updateAction(action.id, {
      status: 'aguardando_aprovacao',
      submittedForApproval: true,
      submittedForApprovalAt: new Date().toISOString(),
      submittedForApprovalBy: currentUser?.name || 'Agente Lean',
    });
    setAction(updated);
    refreshData();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleMasterApprove = () => {
    if (!action) return;
    const updated = dataService.updateAction(action.id, {
      status: 'concluida',
      pdcaStage: 'act',
      masterApproved: true,
      masterApprovedAt: new Date().toISOString(),
      masterApprovedBy: currentUser?.name || 'Rafitec',
      actualCostAvoided: totalGrossSavings > 0 ? totalGrossSavings : action.estimatedCostAvoided,
    });
    setAction(updated);
    refreshData();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !action) return;

    const file = files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAtt: ProjectAttachment = {
        id: 'att_' + Date.now(),
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted,
        fileType: file.type || 'application/pdf',
        url: dataUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.name || 'Agente Lean',
        category: newAttachmentCategory,
        description: newAttachmentDesc.trim() || undefined,
      };

      const nextList = [...attachments, newAtt];
      setAttachments(nextList);
      dataService.updateAction(action.id, { attachments: nextList });
      setNewAttachmentDesc('');
      refreshData();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (attId: string) => {
    if (!action) return;
    const nextList = attachments.filter((a) => a.id !== attId);
    setAttachments(nextList);
    dataService.updateAction(action.id, { attachments: nextList });
    refreshData();
  };

  const handleDownloadAttachment = (att: ProjectAttachment) => {
    if (att.url) {
      const a = document.createElement('a');
      a.href = att.url;
      a.download = att.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const sampleText = `LEANFLOW 4.0 - MEMORIAL DE CÁLCULO\n\nProjeto: ${action?.protocol} - ${action?.title}\nDocumento: ${att.name}\nResponsável: ${att.uploadedBy || 'Agente'}\nData de Emissão: ${formatDateTime(att.uploadedAt)}\n\n--- CUSTOS DO PROJETO (INVESTIMENTO) ---\n- Peças e Equipamentos: R$ ${partsAndEquipment}\n- Serviços de Terceiros: R$ ${thirdPartyServices}\n- Horas Equipe Interna: ${internalLaborHours}h (Taxa: R$ ${laborHourlyRate}/h = R$ ${internalLaborHours * laborHourlyRate})\n- Outras Despesas: R$ ${otherCosts}\nInvestimento Total: R$ ${totalInvestmentCost}\n\n--- GANHOS BRUTOS MAPEADOS (7 FONTES) ---\n- Redução de Paradas (OEE): R$ ${machineDowntime}\n- Mão de Obra Otimizada: R$ ${laborSavings}\n- Redução de Refugo: R$ ${scrapReduction}\n- Ferramental e Energia: R$ ${toolingAndEnergy}\n- Aumento de Produção: R$ ${productionIncrease}\nGanhos Brutos Totais: R$ ${totalGrossSavings}\n\n--- RETORNO FINANCEIRO E INDICADORES ---\n- Lucro Líquido Real: R$ ${netSavings}\n- Retorno sobre Investimento (ROI): ${roiPercentage}%\n- Tempo de Payback: ${paybackMonths} meses\n\nHomologação Técnica Registrada.`;
      const blob = new Blob([sampleText], { type: 'text/plain;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = att.name.replace('.pdf', '.txt');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!action) return;
    const updated = checklistItems.map((item) => {
      if (item.id === itemId) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          status: (nextCompleted ? 'concluida' : 'pendente') as any,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return item;
    });
    setChecklistItems(updated);
    dataService.updateAction(action.id, { checklist: updated });
    refreshData();
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionLabel.trim() || !action) return;

    const newItem: ActionChecklistItem = {
      id: 'ck_' + Date.now(),
      label: newActionLabel.trim(),
      responsibleName: newActionResp.trim() || action.assignedAgentName || 'Agente',
      startDate: newActionStart.trim() || undefined,
      endDate: newActionEnd.trim() || undefined,
      durationHours: newActionHours !== '' ? Number(newActionHours) : undefined,
      status: 'pendente',
      completed: false,
    };

    const nextList = [...checklistItems, newItem];
    setChecklistItems(nextList);
    dataService.updateAction(action.id, { checklist: nextList });
    setNewActionLabel('');
    setNewActionResp('');
    setNewActionStart('');
    setNewActionEnd('');
    setNewActionHours('');
    refreshData();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Carregando dados completos do projeto PDCA...</p>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '3rem auto' }}>
        <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Projeto Não Encontrado
        </h3>
        <Link href={currentUser?.role === 'agent' ? '/agente/kanban' : '/admin/kanban'} className="btn btn-primary btn-sm">
          <ArrowLeft size={16} /> Voltar para o Kanban
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* TOP HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href={currentUser?.role === 'agent' ? '/agente/kanban' : '/admin/kanban'}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={15} /> Voltar ao Kanban
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                {action.protocol}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e40af', backgroundColor: '#eff6ff', padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>
                METODOLOGIA PDCA
              </span>
              <PriorityBadge priority={action.priority} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0.25rem 0 0' }}>
              {action.title}
            </h1>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSaveAll}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: isSaved ? '#059669' : undefined }}
          >
            {isSaved ? <Check size={15} /> : <Save size={15} />}
            <span>{isSaved ? 'Alterações Salvas!' : 'Salvar Projeto'}</span>
          </button>

          <button onClick={handleCopyLink} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Share2 size={14} /> {copied ? 'Copiado!' : 'Compartilhar'}
          </button>

          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Printer size={14} /> Relatório A3 / PDF
          </button>
        </div>
      </div>

      {/* PDCA INTERACTIVE STEPPER / TABS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          padding: '0.75rem',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* P - PLAN */}
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'plan' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'plan' ? '#eff6ff' : '#f8fafc',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'plan' ? '#1d4ed8' : '#64748b' }}>
              1. PLAN (Planejar)
            </span>
            <span style={{ fontSize: '1rem' }}>🔵</span>
          </div>
          <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block', marginTop: '0.2rem' }}>
            Diagnóstico & Causas
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>5W2H • 5 Porquês • Ishikawa 6M</span>
        </button>

        {/* D - DO */}
        <button
          type="button"
          onClick={() => setActiveTab('do')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'do' ? '2px solid #d97706' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'do' ? '#fffbeb' : '#f8fafc',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'do' ? '#b45309' : '#64748b' }}>
              2. DO (Executar)
            </span>
            <span style={{ fontSize: '1rem' }}>🟡</span>
          </div>
          <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block', marginTop: '0.2rem' }}>
            Plano de Ação 5W2H
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Checklist • Testes Piloto • Posto</span>
        </button>

        {/* C - CHECK */}
        <button
          type="button"
          onClick={() => setActiveTab('check')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'check' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'check' ? '#faf5ff' : '#f8fafc',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'check' ? '#6d28d9' : '#64748b' }}>
              3. CHECK (Verificar & ROI)
            </span>
            <span style={{ fontSize: '1rem' }}>🟣</span>
          </div>
          <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block', marginTop: '0.2rem' }}>
            Custos vs. Ganhos
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Lucro Líquido • ROI % • Payback</span>
        </button>

        {/* A - ACT */}
        <button
          type="button"
          onClick={() => setActiveTab('act')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'act' ? '2px solid #059669' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'act' ? '#ecfdf5' : '#f8fafc',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'act' ? '#047857' : '#64748b' }}>
              4. ACT (Padronizar)
            </span>
            <span style={{ fontSize: '1rem' }}>🟢</span>
          </div>
          <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block', marginTop: '0.2rem' }}>
            POP, Yokoten & Master
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Padronização • Replicação • DRE</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: P - PLAN (Planejamento, Diagnóstico & Causa Raiz) */}
      {/* ========================================================================= */}
      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card: Definição do Problema & Meta */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BookOpen size={20} color="#2563eb" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                1.1 Definição do Problema & Meta do Projeto
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Declaração Formal do Problema / Oportunidade:
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Descreva o que está ocorrendo no chão de fábrica, qual máquina/setor e o impacto gerado..."
                />
              </div>

              {/* Indicadores Baseline vs Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Nome do Indicador-Chave:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Tempo de Setup da Extrusora"
                    value={targetMetricName}
                    onChange={(e) => setTargetMetricName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Unidade de Medida:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: minutos, %, peças/h"
                    value={targetMetricUnit}
                    onChange={(e) => setTargetMetricUnit(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>
                    🔴 Baseline Inicial (Antes):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 52"
                    value={baselineValue}
                    onChange={(e) => setBaselineValue(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                    🟢 Meta Alvo (Planejado):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 15"
                    value={targetGoalValue}
                    onChange={(e) => setTargetGoalValue(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>
                    ⚠️ Custo do Problema (R$/mês):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 18500"
                    value={currentProblemCostMonthly}
                    onChange={(e) => setCurrentProblemCostMonthly(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: 5 Porquês */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <HelpCircle size={20} color="#2563eb" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                1.2 Análise dos 5 Porquês (Causa Raiz)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {fiveWhys.map((why, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: index === 4 ? '#ef4444' : '#eff6ff',
                      color: index === 4 ? '#ffffff' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      fontWeight: index === 4 ? 700 : 400,
                      borderColor: index === 4 ? '#fca5a5' : undefined,
                      backgroundColor: index === 4 ? '#fff5f5' : undefined,
                    }}
                    placeholder={index === 4 ? '5. Causa Raiz definitiva...' : `Por quê ${index + 1}...`}
                    value={why}
                    onChange={(e) => {
                      const updated = [...fiveWhys];
                      updated[index] = e.target.value;
                      setFiveWhys(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Card: Comprovação por Gráfico de Pareto (Regra 80/20) */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="#2563eb" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    1.3 Comprovação por Gráfico de Pareto (Regra 80/20)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                    Identifique e comprove visualmente os 20% das causas vitais que geram 80% das perdas.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#1e40af',
                    backgroundColor: '#eff6ff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  ⚡ REGRA 80/20
                </span>
              </div>
            </div>

            {/* Pareto Content: Image & Vital Causes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
              {/* Left Column: Pareto Chart Image / Visualizer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                  📊 Imagem do Gráfico de Pareto Gerado:
                </span>

                {paretoImageUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <img
                      src={paretoImageUrl}
                      alt="Gráfico de Pareto 80/20"
                      style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', backgroundColor: '#f8fafc' }}
                    />
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#ffffff',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                      }}
                    >
                      <span style={{ color: '#475569', fontWeight: 600 }}>{paretoImageName || 'Grafico_Pareto_80_20.png'}</span>
                      <button
                        type="button"
                        onClick={handleRemoveParetoImage}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.2rem 0.5rem' }}
                      >
                        <Trash2 size={12} /> Remover Imagem
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1.5rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px dashed #93c5fd',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    {/* Simulated SVG Pareto illustration */}
                    <div style={{ width: '100%', maxWidth: '260px', height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <div style={{ width: '22%', height: '85%', backgroundColor: '#2563eb', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>48%</div>
                      <div style={{ width: '22%', height: '60%', backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>34%</div>
                      <div style={{ width: '22%', height: '22%', backgroundColor: '#93c5fd', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: '0.65rem', fontWeight: 700 }}>11%</div>
                      <div style={{ width: '22%', height: '12%', backgroundColor: '#bfdbfe', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: '0.65rem', fontWeight: 700 }}>7%</div>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>
                        Carregue a imagem do Gráfico de Pareto (Excel / Minitab / Foto)
                      </strong>
                      <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        Formatos suportados: PNG, JPG, JPEG, WEBP, SVG
                      </span>
                    </div>

                    <label
                      className="btn btn-primary btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ImageIcon size={14} /> Selecionar Imagem do Pareto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleParetoImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Right Column: Vital Causes Formulation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                    🎯 Causas Vitais Identificadas (os 20% priorizados no Pareto):
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={paretoVitalCauses}
                    onChange={(e) => setParetoVitalCauses(e.target.value)}
                    placeholder="Descreva quais são as causas vitais que correspondem a 80% do problema..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                      % Impacto Acumulado Resolvido:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={paretoCumulativePercent}
                        onChange={(e) => setParetoCumulativePercent(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="80"
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>%</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block' }}>
                      Foco de Ataque Lean:
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'block', marginTop: '0.35rem' }}>
                      ✓ Alta Prioridade no Plano 5W2H
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: D - DO (Plano de Ação 5W2H & Execução) */}
      {/* ========================================================================= */}
      {activeTab === 'do' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Pilot Area */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Zap size={20} color="#d97706" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                2.1 Área Piloto & Execução Prática
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Posto / Máquina Piloto:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Extrusora de Fitas 03"
                  value={pilotArea}
                  onChange={(e) => setPilotArea(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Observações do Teste Prático / Piloto:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Realizados 3 setups piloto com gravação em vídeo. Tempo reduzido para 16 min."
                  value={pilotTestObservations}
                  onChange={(e) => setPilotTestObservations(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 5W2H Action Plan Table */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={20} color="#d97706" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  2.2 Plano de Ação 5W2H ({checklistItems.filter((c) => c.completed).length}/{checklistItems.length} concluídas)
                </h3>
              </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {checklistItems.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhuma atividade cadastrada no plano de ação. Adicione no formulário abaixo.
                </div>
              ) : (
                checklistItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: item.completed ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
                      backgroundColor: item.completed ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklistItem(item.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: item.completed ? '#065f46' : '#0f172a', textDecoration: item.completed ? 'line-through' : 'none' }}>
                          {index + 1}. {item.label}
                        </strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.75rem', color: '#64748b' }}>
                          <span>👤 {item.responsibleName || 'Agente'}</span>
                          {item.startDate && <span>📅 Início: {formatDate(item.startDate)}</span>}
                          {item.endDate && <span>🏁 Fim: {formatDate(item.endDate)}</span>}
                          {item.durationHours && <span>⏱️ {item.durationHours}h</span>}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: item.completed ? '#dcfce7' : '#f1f5f9',
                        color: item.completed ? '#15803d' : '#475569',
                      }}
                    >
                      {item.completed ? 'Concluída ✓' : 'Pendente'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Add Action Form */}
            <form onSubmit={handleAddChecklistItem} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
                ➕ Adicionar Nova Atividade 5W2H:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px auto', gap: '0.5rem', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>O que fazer (Ação): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: Instalar engates rápidos"
                    value={newActionLabel}
                    onChange={(e) => setNewActionLabel(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Responsável (Quem):</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: Juliana Mendes"
                    value={newActionResp}
                    onChange={(e) => setNewActionResp(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Data Início:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={newActionStart}
                    onChange={(e) => setNewActionStart(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Data Fim:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={newActionEnd}
                    onChange={(e) => setNewActionEnd(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Horas:</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="12"
                    value={newActionHours}
                    onChange={(e) => setNewActionHours(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ height: '36px' }}>
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: C - CHECK (Verificar & Engenharia Financeira: Custos vs Lucros) */}
      {/* ========================================================================= */}
      {activeTab === 'check' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Real Indicator Achieved (Antes vs Depois) */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={20} color="#7c3aed" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                3.1 Eficácia Técnica (Antes vs. Depois)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>🔴 Baseline Inicial (Antes):</span>
                <strong style={{ fontSize: '1.4rem', color: '#991b1b', display: 'block', marginTop: '0.25rem' }}>
                  {baselineValue || '—'} {targetMetricUnit}
                </strong>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>🎯 Meta Planejada:</span>
                <strong style={{ fontSize: '1.4rem', color: '#1e40af', display: 'block', marginTop: '0.25rem' }}>
                  {targetGoalValue || '—'} {targetMetricUnit}
                </strong>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>🟢 Resultado Real Atingido (Depois):</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ marginTop: '0.35rem', fontWeight: 900, fontSize: '1.2rem', color: '#065f46' }}
                  placeholder="Ex: 16"
                  value={achievedValue}
                  onChange={(e) => setAchievedValue(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* DRE Financeira do Projeto: CUSTOS vs GANHOS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* 🔴 COLUNA 1: CUSTOS / INVESTIMENTO DO PROJETO (Capex + Opex) */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingDown size={18} color="#ef4444" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Custos do Projeto (Investimento)
                  </h3>
                </div>
                <strong style={{ fontSize: '1.1rem', color: '#dc2626' }}>
                  {formatCurrency(totalInvestmentCost)}
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>🔧 Peças, Dispositivos & Sensores (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={partsAndEquipment}
                    onChange={(e) => setPartsAndEquipment(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>⚙️ Serviços de Terceiros / Usinagem (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={thirdPartyServices}
                    onChange={(e) => setThirdPartyServices(Number(e.target.value) || 0)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>⏱️ Horas Equipe (h):</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={internalLaborHours}
                      onChange={(e) => setInternalLaborHours(Number(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>💰 Custo/Hora (R$/h):</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={laborHourlyRate}
                      onChange={(e) => setLaborHourlyRate(Number(e.target.value) || 45)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>💡 Outras Despesas Operacionais (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* 🟢 COLUNA 2: GANHOS BRUTOS / CUSTO EVITADO (7 Fontes) */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={18} color="#10b981" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Ganhos Brutos (7 Fontes)
                  </h3>
                </div>
                <strong style={{ fontSize: '1.1rem', color: '#059669' }}>
                  {formatCurrency(totalGrossSavings)}
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>⚙️ Redução de Paradas de Máquina / OEE (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={machineDowntime}
                    onChange={(e) => setMachineDowntime(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>⏱️ Mão de Obra / Horas Economizadas (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={laborSavings}
                    onChange={(e) => setLaborSavings(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>♻️ Redução de Refugo / Matéria-Prima (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={scrapReduction}
                    onChange={(e) => setScrapReduction(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>⚡ Ferramental, Energia & Insumos (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={toolingAndEnergy}
                    onChange={(e) => setToolingAndEnergy(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>📈 Aumento de Produção / Capacidade Extra (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={productionIncrease}
                    onChange={(e) => setProductionIncrease(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BALANÇO EXECUTIVO: LUCRO LÍQUIDO, ROI % & PAYBACK */}
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                💰 RETORNO LÍQUIDO (LUCRO REAL)
              </span>
              <strong style={{ fontSize: '1.8rem', color: '#34d399', display: 'block', marginTop: '0.35rem' }}>
                {formatCurrency(netSavings)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                Ganhos Brutos ({formatCurrency(totalGrossSavings)}) - Investimento ({formatCurrency(totalInvestmentCost)})
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                📊 RETORNO SOBRE O INVESTIMENTO (ROI)
              </span>
              <strong style={{ fontSize: '1.8rem', color: '#38bdf8', display: 'block', marginTop: '0.35rem' }}>
                {roiPercentage}%
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                Para cada R$ 1,00 investido, a fábrica obteve {formatCurrency(totalInvestmentCost > 0 ? totalGrossSavings / totalInvestmentCost : 0)} de retorno.
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                ⏱️ TEMPO DE PAYBACK
              </span>
              <strong style={{ fontSize: '1.8rem', color: '#fbbf24', display: 'block', marginTop: '0.35rem' }}>
                {paybackMonths} meses
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                Tempo para recuperar 100% do investimento com base na economia mensal.
              </span>
            </div>
          </div>

          {/* 3.3 ANEXOS DE MEMORIAL DE CÁLCULO & DOCUMENTOS TÉCNICOS (PDF) */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Paperclip size={20} color="#7c3aed" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    3.3 Memorial de Cálculo & Anexos Comprobatórios (PDF)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                    Anexe o memorial de cálculo detalhado, relatórios de cronoanálise, planilhas ou fotos para auditoria e homologação.
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6d28d9',
                  backgroundColor: '#f5f3ff',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd6fe',
                }}
              >
                {attachments.length} documento(s) anexado(s)
              </span>
            </div>

            {/* List of Attached Documents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {attachments.length === 0 ? (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                  }}
                >
                  <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: '#334155' }}>
                    Nenhum memorial de cálculo anexado ainda
                  </strong>
                  <span style={{ fontSize: '0.75rem' }}>
                    Selecione ou arraste seu arquivo PDF/planilha abaixo para anexar a este projeto PDCA.
                  </span>
                </div>
              ) : (
                attachments.map((att) => {
                  const isPdf = att.name.toLowerCase().endsWith('.pdf') || att.fileType.includes('pdf');
                  const isSpreadsheet = att.name.toLowerCase().endsWith('.xlsx') || att.name.toLowerCase().endsWith('.csv');

                  return (
                    <div
                      key={att.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: isPdf ? '#fef2f2' : isSpreadsheet ? '#ecfdf5' : '#f5f3ff',
                            color: isPdf ? '#dc2626' : isSpreadsheet ? '#059669' : '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: `1px solid ${isPdf ? '#fecaca' : isSpreadsheet ? '#a7f3d0' : '#ddd6fe'}`,
                          }}
                        >
                          {isPdf ? <FileText size={22} /> : isSpreadsheet ? <FileSpreadsheet size={22} /> : <File size={22} />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{att.name}</strong>
                            <span
                              style={{
                                fontSize: '0.675rem',
                                fontWeight: 800,
                                padding: '0.1rem 0.45rem',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                backgroundColor: att.category === 'memorial_calculo' ? '#eff6ff' : '#f1f5f9',
                                color: att.category === 'memorial_calculo' ? '#1d4ed8' : '#475569',
                              }}
                            >
                              {att.category === 'memorial_calculo'
                                ? 'Memorial de Cálculo'
                                : att.category === 'relatorio_tecnico'
                                ? 'Relatório Técnico'
                                : att.category === 'evidencia_foto'
                                ? 'Evidência / Foto'
                                : 'Anexo Geral'}
                            </span>
                            {att.sizeFormatted && (
                              <span style={{ fontSize: '0.725rem', color: '#64748b' }}>({att.sizeFormatted})</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.75rem', color: '#64748b' }}>
                            <span>👤 Enviado por: <strong>{att.uploadedBy || 'Agente'}</strong></span>
                            <span>📅 {formatDateTime(att.uploadedAt)}</span>
                          </div>

                          {att.description && (
                            <p style={{ fontSize: '0.78125rem', color: '#475569', margin: '0.35rem 0 0', fontStyle: 'italic' }}>
                              “{att.description}”
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Download & Remove Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(att)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Visualizar ou baixar arquivo"
                        >
                          <Download size={14} /> <span>Baixar / Visualizar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="btn btn-sm"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: '#fff1f2',
                            color: '#e11d48',
                            border: '1px solid #fecdd3',
                          }}
                          title="Remover este anexo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Upload Area */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1.5px dashed #cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <UploadCloud size={18} color="#7c3aed" />
                <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                  Anexar Novo Documento / Memorial de Cálculo (PDF, Planilha ou Imagem):
                </strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) 1fr', gap: '0.75rem', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    Categoria do Documento:
                  </label>
                  <select
                    className="form-control form-control-sm"
                    value={newAttachmentCategory}
                    onChange={(e: any) => setNewAttachmentCategory(e.target.value)}
                  >
                    <option value="memorial_calculo">📑 Memorial de Cálculo Financeiro</option>
                    <option value="relatorio_tecnico">📊 Relatório Técnico / Cronoanálise</option>
                    <option value="evidencia_foto">📸 Fotos / Evidências do Posto</option>
                    <option value="outro">📄 Outro Documento Comprobatório</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    Descrição / Nota (opcional):
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: Planilha de cálculo de OEE e perdas térmicas"
                    value={newAttachmentDesc}
                    onChange={(e) => setNewAttachmentDesc(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    Selecione o Arquivo (.pdf, .xlsx, .csv, .png):
                  </label>
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    accept=".pdf,.xlsx,.csv,.xls,.docx,.doc,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    style={{ padding: '0.35rem 0.5rem', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: A - ACT (Padronização, Yokoten & Homologação Master) */}
      {/* ========================================================================= */}
      {activeTab === 'act' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card: Padronização POP / SOP */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <FileCheck size={20} color="#059669" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                4.1 Padronização da Rotina (POP / SOP)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="sopCheck"
                  checked={standardWorkUpdated}
                  onChange={(e) => setStandardWorkUpdated(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="sopCheck" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', cursor: 'pointer' }}>
                  Procedimento Operacional Padrão atualizado e equipe treinada
                </label>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Código / Referência do Documento:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: POP-EXT-042 rev 03 (Troca Rápida de Matriz)"
                  value={standardWorkDocRef}
                  onChange={(e) => setStandardWorkDocRef(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card: Yokoten & Lições Aprendidas */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Award size={20} color="#059669" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                4.2 Yokoten (Replicação em Outras Linhas) & Lições Aprendidas
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Linhas / Máquinas para Replicação (Yokoten):</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ex: Replicar o kit SMED e carrinho de ferramentas nas Extrusoras 01, 02 e 04 no ciclo seguinte..."
                  value={yokotenReplication}
                  onChange={(e) => setYokotenReplication(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Lições Aprendidas durante a Execução:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ex: O pré-aquecimento externo foi responsável por 80% do ganho sem grandes investimentos..."
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card: Homologação Final da Entidade Master */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: action.masterApproved
                ? '2px solid #10b981'
                : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                ? '2px solid #a855f7'
                : '1px dashed #cbd5e1',
              backgroundColor: action.masterApproved
                ? '#f0fdf4'
                : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                ? '#faf5ff'
                : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: action.masterApproved
                    ? '#10b981'
                    : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                    ? '#9333ea'
                    : '#f1f5f9',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.35rem',
                }}
              >
                {action.masterApproved ? '✓' : action.status === 'aguardando_aprovacao' || action.submittedForApproval ? '⏳' : '🏢'}
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: action.masterApproved
                      ? '#065f46'
                      : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                      ? '#6b21a8'
                      : '#0f172a',
                    margin: 0,
                  }}
                >
                  {action.masterApproved
                    ? 'Projeto Homologado pela Entidade Master'
                    : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                    ? 'Aguardando Homologação da Entidade Master'
                    : currentUser?.role === 'agent'
                    ? 'Submeter Projeto para Homologação Master'
                    : 'Homologação Pendente pela Gestão Master'}
                </h4>

                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                  {action.masterApproved
                    ? `Validado por ${action.masterApprovedBy || 'Rafitec'} em ${formatDateTime(action.masterApprovedAt)}. Custo evitado integrado oficialmente aos relatórios executivos.`
                    : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                    ? `Submetido por ${action.submittedForApprovalBy || action.assignedAgentName || 'Agente'} em ${formatDateTime(action.submittedForApprovalAt || action.updatedAt)}. Sinalizado no Kanban Geral para homologação pelo Supervisor.`
                    : currentUser?.role === 'agent'
                    ? 'Finalizou os 4 quadrantes do PDCA? Submeta para que o supervisor homologue no Kanban Geral da Entidade.'
                    : 'A aprovação oficializa a conclusão do ciclo PDCA e valida o custo evitado na DRE da empresa.'}
                </p>
              </div>
            </div>

            {/* Actions for Agent vs Supervisor */}
            <div>
              {action.masterApproved ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                  }}
                >
                  <CheckCircle2 size={16} /> Homologado ✓
                </span>
              ) : currentUser?.role === 'agent' ? (
                <button
                  type="button"
                  onClick={handleAgentSubmitForApproval}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: action.status === 'aguardando_aprovacao' ? '#7c3aed' : '#2563eb',
                    borderColor: action.status === 'aguardando_aprovacao' ? '#7c3aed' : '#2563eb',
                  }}
                >
                  <Send size={15} />
                  <span>
                    {action.status === 'aguardando_aprovacao'
                      ? 'Reenviar para Homologação Master'
                      : 'Submeter para Homologação Master'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMasterApprove}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Homologar Projeto & Concluir Ciclo PDCA</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable / Report Footer */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.78125rem',
          color: '#64748b',
        }}
      >
        <div>
          Plataforma <strong>LeanFlow 4.0</strong> • Metodologia PDCA & Engenharia de Custos Evitados
        </div>
        <div>
          Emissão em {formatDate(new Date().toISOString())}
        </div>
      </div>
    </div>
  );
}
