'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { dataService } from '@/services/dataService';
import { LeanAction, PDCAMethodologyStage, ActionChecklistItem, ProjectAttachment, IshikawaAnalysis } from '@/lib/types';
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
  Sigma,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Users,
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
  
  // Status de Auto-Save em Tempo Real
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modo Apresentação (Hero Banner Pop-up com Slides P -> D -> C -> A -> Antes/Depois)
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [presentationSlide, setPresentationSlide] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [paretoZoomOpen, setParetoZoomOpen] = useState(false);

  // Form State for PDCA Fields
  const [targetMetricName, setTargetMetricName] = useState('');
  const [targetMetricUnit, setTargetMetricUnit] = useState('');
  const [baselineValue, setBaselineValue] = useState<number | ''>('');
  const [targetGoalValue, setTargetGoalValue] = useState<number | ''>('');
  const [achievedValue, setAchievedValue] = useState<number | ''>('');
  const [currentProblemCostMonthly, setCurrentProblemCostMonthly] = useState<number | ''>('');
  const [problemStatement, setProblemStatement] = useState('');
  const [fiveWhys, setFiveWhys] = useState<string[]>(['', '', '', '', '']);

  // Liderança e Equipe Envolvida no Kaizen
  const [leaderName, setLeaderName] = useState<string>('');
  const [teamMembersInput, setTeamMembersInput] = useState<string>('');
  
  // Pareto 80/20 Analysis & Chart Image
  const [paretoImageUrl, setParetoImageUrl] = useState<string>('');
  const [paretoImageName, setParetoImageName] = useState<string>('');
  const [paretoVitalCauses, setParetoVitalCauses] = useState<string>('');
  const [paretoCumulativePercent, setParetoCumulativePercent] = useState<number | ''>(80);

  // Ishikawa 6M Analysis
  const [ishikawaMethod, setIshikawaMethod] = useState<string>('');
  const [ishikawaMachine, setIshikawaMachine] = useState<string>('');
  const [ishikawaMaterial, setIshikawaMaterial] = useState<string>('');
  const [ishikawaManpower, setIshikawaManpower] = useState<string>('');
  const [ishikawaMeasurement, setIshikawaMeasurement] = useState<string>('');
  const [ishikawaEnvironment, setIshikawaEnvironment] = useState<string>('');
  const [ishikawaRootCause, setIshikawaRootCause] = useState<string>('');

  // Seletor de Ferramentas Ativas no PLAN ('fiveWhys' | 'pareto' | 'ishikawa')
  const [selectedDiagnosticTools, setSelectedDiagnosticTools] = useState<string[]>(['fiveWhys']);

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

  // Fotos do Antes e Depois (Salvas no projeto)
  const [photoBeforeUrl, setPhotoBeforeUrl] = useState<string>('');
  const [photoAfterUrl, setPhotoAfterUrl] = useState<string>('');

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

  // Acompanhamento Trimestral pós-homologação (3 Meses)
  const [followUpModalMonth, setFollowUpModalMonth] = useState<1 | 2 | 3 | null>(null);
  const [followUpValue, setFollowUpValue] = useState<number | ''>('');
  const [followUpHours, setFollowUpHours] = useState<number | ''>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [followUpNotes, setFollowUpNotes] = useState<string>('');

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
            : ['', '', '', '', '']
        );
        setLeaderName(found.leaderName || found.assignedAgentName || '');
        setTeamMembersInput(found.teamMembers && found.teamMembers.length > 0 ? found.teamMembers.join(', ') : '');
        setParetoImageUrl(found.pareto?.chartImageUrl || '');
        setParetoImageName(found.pareto?.chartImageName || '');
        setParetoVitalCauses(found.pareto?.vitalCausesSummary || '');
        setParetoCumulativePercent(
          found.pareto?.cumulativeImpactPercentage !== undefined ? found.pareto.cumulativeImpactPercentage : 80
        );

        // Ishikawa 6M
        setIshikawaMethod(found.ishikawa?.method || '');
        setIshikawaMachine(found.ishikawa?.machine || '');
        setIshikawaMaterial(found.ishikawa?.material || '');
        setIshikawaManpower(found.ishikawa?.manpower || '');
        setIshikawaMeasurement(found.ishikawa?.measurement || '');
        setIshikawaEnvironment(found.ishikawa?.environment || '');
        setIshikawaRootCause(found.ishikawa?.primaryRootCause || '');

        // Diagnóstico e Causa: selecionar ferramentas que possuem dados ou 5 Porquês por padrão
        const activeTools: string[] = [];
        const has5WhysData = Boolean(found.fiveWhys && found.fiveWhys.some((w) => w && w.trim()));
        const hasParetoData = Boolean(found.pareto?.chartImageUrl || (found.pareto?.vitalCausesSummary && found.pareto.vitalCausesSummary.trim()));
        const hasIshikawaData = Boolean(
          found.ishikawa &&
            (found.ishikawa.method ||
              found.ishikawa.machine ||
              found.ishikawa.material ||
              found.ishikawa.manpower ||
              found.ishikawa.measurement ||
              found.ishikawa.environment ||
              found.ishikawa.primaryRootCause)
        );

        if (has5WhysData) activeTools.push('fiveWhys');
        if (hasParetoData) activeTools.push('pareto');
        if (hasIshikawaData) activeTools.push('ishikawa');
        if (activeTools.length === 0) activeTools.push('fiveWhys');

        setSelectedDiagnosticTools(activeTools);

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

        // Evidências Fotográficas do Projeto
        setPhotoBeforeUrl(found.photoBeforeUrl || '');
        setPhotoAfterUrl(found.photoAfterUrl || '');
      }
      setLoading(false);
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 400);
    }
  }, [projectId]);

  // Contadores auxiliares para badges e seletor
  const fiveWhysFilledCount = useMemo(() => {
    return fiveWhys.filter((w) => w && w.trim().length > 0).length;
  }, [fiveWhys]);

  const ishikawaFilledCount = useMemo(() => {
    return [
      ishikawaMethod,
      ishikawaMachine,
      ishikawaMaterial,
      ishikawaManpower,
      ishikawaMeasurement,
      ishikawaEnvironment,
    ].filter((v) => v && v.trim().length > 0).length;
  }, [
    ishikawaMethod,
    ishikawaMachine,
    ishikawaMaterial,
    ishikawaManpower,
    ishikawaMeasurement,
    ishikawaEnvironment,
  ]);

  const toggleDiagnosticTool = (toolKey: string) => {
    setSelectedDiagnosticTools((prev) =>
      prev.includes(toolKey) ? prev.filter((t) => t !== toolKey) : [...prev, toolKey]
    );
  };

  // Navegação por teclado no Modo Apresentação
  // Modo Apresentação: Controle por Passador de Slides (Wireless Presenter) & Teclado
  useEffect(() => {
    if (!presentationOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode;

      // Exit / Close (Escape)
      if (key === 'Escape' || keyCode === 27) {
        e.preventDefault();
        if (paretoZoomOpen) {
          setParetoZoomOpen(false);
        } else {
          setPresentationOpen(false);
        }
        return;
      }

      if (paretoZoomOpen) return;

      // Next Slide Commands:
      // - PageDown (Hardware Clicker Next)
      // - ArrowRight / ArrowDown
      // - Spacebar
      // - N / n
      const isNext =
        key === 'PageDown' ||
        key === 'ArrowRight' ||
        key === 'ArrowDown' ||
        key === ' ' ||
        key === 'Spacebar' ||
        code === 'PageDown' ||
        code === 'ArrowRight' ||
        code === 'ArrowDown' ||
        code === 'Space' ||
        keyCode === 34 || // PageDown
        keyCode === 39 || // ArrowRight
        keyCode === 40 || // ArrowDown
        keyCode === 32 || // Space
        key === 'n' ||
        key === 'N';

      // Previous Slide Commands:
      // - PageUp (Hardware Clicker Previous)
      // - ArrowLeft / ArrowUp
      // - Backspace
      // - P / p
      const isPrev =
        key === 'PageUp' ||
        key === 'ArrowLeft' ||
        key === 'ArrowUp' ||
        key === 'Backspace' ||
        code === 'PageUp' ||
        code === 'ArrowLeft' ||
        code === 'ArrowUp' ||
        code === 'Backspace' ||
        keyCode === 33 || // PageUp
        keyCode === 37 || // ArrowLeft
        keyCode === 38 || // ArrowUp
        keyCode === 8 || // Backspace
        key === 'p' ||
        key === 'P';

      // Home (First slide)
      if (key === 'Home' || keyCode === 36) {
        e.preventDefault();
        setPresentationSlide(1);
        return;
      }

      // End (Last slide)
      if (key === 'End' || keyCode === 35) {
        e.preventDefault();
        setPresentationSlide(5);
        return;
      }

      if (isNext) {
        e.preventDefault();
        e.stopPropagation();
        setPresentationSlide((prev) => (prev < 5 ? ((prev + 1) as 1 | 2 | 3 | 4 | 5) : prev));
      } else if (isPrev) {
        e.preventDefault();
        e.stopPropagation();
        setPresentationSlide((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4 | 5) : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [presentationOpen, paretoZoomOpen]);

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

  const netSavings = Math.max(0, totalGrossSavings - totalInvestmentCost);
  const roiPercentage = totalInvestmentCost > 0 ? Math.round((netSavings / totalInvestmentCost) * 100) : 0;
  const monthlyGrossSavings = totalGrossSavings / 12;
  const paybackMonths =
    totalGrossSavings > 0 ? Number(((totalInvestmentCost / totalGrossSavings) * 12).toFixed(1)) : 0;

  // Formatted Attachments list sorted by upload date
  const sortedAttachments = useMemo(() => {
    return [...attachments].sort((a, b) => {
      const tA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const tB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return tB - tA;
    });
  }, [attachments]);

  // Evidências de Fotos para o Slide 5 da Apresentação
  const photoAttachments = useMemo(() => {
    return attachments.filter(
      (att) =>
        att.category === 'evidencia_foto' ||
        att.fileType?.startsWith('image/') ||
        att.url?.startsWith('data:image') ||
        att.url?.includes('images.unsplash.com')
    );
  }, [attachments]);

  // =========================================================================
  // SALVAMENTO AUTOMÁTICO EM TEMPO REAL (AUTO-SAVE COM DEBOUNCE & REF SEGURO)
  // =========================================================================
  const stateRef = useRef({
    leaderName,
    teamMembersInput,
    activeTab,
    problemStatement,
    targetMetricName,
    targetMetricUnit,
    baselineValue,
    targetGoalValue,
    achievedValue,
    currentProblemCostMonthly,
    fiveWhys,
    paretoImageUrl,
    paretoImageName,
    paretoVitalCauses,
    paretoCumulativePercent,
    ishikawaMethod,
    ishikawaMachine,
    ishikawaMaterial,
    ishikawaManpower,
    ishikawaMeasurement,
    ishikawaEnvironment,
    ishikawaRootCause,
    pilotArea,
    pilotTestObservations,
    photoBeforeUrl,
    photoAfterUrl,
    checklistItems,
    partsAndEquipment,
    thirdPartyServices,
    internalLaborHours,
    laborHourlyRate,
    otherCosts,
    machineDowntime,
    laborSavings,
    scrapReduction,
    toolingAndEnergy,
    logisticsAndFreight,
    productionIncrease,
    otherSavings,
    totalInvestmentCost,
    totalGrossSavings,
    netSavings,
    roiPercentage,
    paybackMonths,
    attachments,
    standardWorkUpdated,
    standardWorkDocRef,
    yokotenReplication,
    lessonsLearned,
  });

  useEffect(() => {
    stateRef.current = {
      leaderName,
      teamMembersInput,
      activeTab,
      problemStatement,
      targetMetricName,
      targetMetricUnit,
      baselineValue,
      targetGoalValue,
      achievedValue,
      currentProblemCostMonthly,
      fiveWhys,
      paretoImageUrl,
      paretoImageName,
      paretoVitalCauses,
      paretoCumulativePercent,
      ishikawaMethod,
      ishikawaMachine,
      ishikawaMaterial,
      ishikawaManpower,
      ishikawaMeasurement,
      ishikawaEnvironment,
      ishikawaRootCause,
      pilotArea,
      pilotTestObservations,
      photoBeforeUrl,
      photoAfterUrl,
      checklistItems,
      partsAndEquipment,
      thirdPartyServices,
      internalLaborHours,
      laborHourlyRate,
      otherCosts,
      machineDowntime,
      laborSavings,
      scrapReduction,
      toolingAndEnergy,
      logisticsAndFreight,
      productionIncrease,
      otherSavings,
      totalInvestmentCost,
      totalGrossSavings,
      netSavings,
      roiPercentage,
      paybackMonths,
      attachments,
      standardWorkUpdated,
      standardWorkDocRef,
      yokotenReplication,
      lessonsLearned,
    };
  });

  const executeSave = useCallback(() => {
    if (!projectId) return;
    const s = stateRef.current;

    const parsedTeamMembers = s.teamMembersInput
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const ishikawaData: IshikawaAnalysis = {
      method: s.ishikawaMethod.trim() || undefined,
      machine: s.ishikawaMachine.trim() || undefined,
      material: s.ishikawaMaterial.trim() || undefined,
      manpower: s.ishikawaManpower.trim() || undefined,
      measurement: s.ishikawaMeasurement.trim() || undefined,
      environment: s.ishikawaEnvironment.trim() || undefined,
      primaryRootCause: s.ishikawaRootCause.trim() || undefined,
    };

    dataService.updateAction(projectId, {
      leaderName: s.leaderName.trim() || undefined,
      teamMembers: parsedTeamMembers.length > 0 ? parsedTeamMembers : undefined,
      pdcaStage: s.activeTab,
      problemStatement: s.problemStatement,
      targetMetricName: s.targetMetricName,
      targetMetricUnit: s.targetMetricUnit,
      baselineValue: s.baselineValue === '' ? undefined : Number(s.baselineValue),
      targetGoalValue: s.targetGoalValue === '' ? undefined : Number(s.targetGoalValue),
      achievedValue: s.achievedValue === '' ? undefined : Number(s.achievedValue),
      currentProblemCostMonthly: s.currentProblemCostMonthly === '' ? undefined : Number(s.currentProblemCostMonthly),
      fiveWhys: s.fiveWhys,
      pareto: {
        chartImageUrl: s.paretoImageUrl,
        chartImageName: s.paretoImageName,
        vitalCausesSummary: s.paretoVitalCauses,
        cumulativeImpactPercentage: s.paretoCumulativePercent === '' ? 80 : Number(s.paretoCumulativePercent),
      },
      ishikawa: ishikawaData,
      pilotArea: s.pilotArea,
      pilotTestObservations: s.pilotTestObservations,
      photoBeforeUrl: s.photoBeforeUrl,
      photoAfterUrl: s.photoAfterUrl,
      checklist: s.checklistItems,
      projectCosts: {
        partsAndEquipment: s.partsAndEquipment,
        thirdPartyServices: s.thirdPartyServices,
        internalLaborHours: s.internalLaborHours,
        laborHourlyRate: s.laborHourlyRate,
        otherCosts: s.otherCosts,
        totalCost: s.totalInvestmentCost,
      },
      costBreakdown: {
        machineDowntime: s.machineDowntime,
        laborSavings: s.laborSavings,
        scrapReduction: s.scrapReduction,
        toolingAndEnergy: s.toolingAndEnergy,
        logisticsAndFreight: s.logisticsAndFreight,
        productionIncrease: s.productionIncrease,
        otherSavings: s.otherSavings,
      },
      actualCostAvoided: s.totalGrossSavings,
      netSavings: s.netSavings,
      roiPercentage: s.roiPercentage,
      paybackMonths: s.paybackMonths,
      attachments: s.attachments,
      standardWorkUpdated: s.standardWorkUpdated,
      standardWorkDocRef: s.standardWorkDocRef,
      yokotenReplication: s.yokotenReplication,
      lessonsLearned: s.lessonsLearned,
    });

    setSaveStatus('saved');
  }, [projectId]);

  // Dispara o Auto-Save quando qualquer campo editável é alterado
  useEffect(() => {
    if (isInitialLoadRef.current) return;

    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      executeSave();
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    leaderName,
    teamMembersInput,
    activeTab,
    problemStatement,
    targetMetricName,
    targetMetricUnit,
    baselineValue,
    targetGoalValue,
    achievedValue,
    currentProblemCostMonthly,
    fiveWhys,
    paretoImageUrl,
    paretoImageName,
    paretoVitalCauses,
    paretoCumulativePercent,
    ishikawaMethod,
    ishikawaMachine,
    ishikawaMaterial,
    ishikawaManpower,
    ishikawaMeasurement,
    ishikawaEnvironment,
    ishikawaRootCause,
    pilotArea,
    pilotTestObservations,
    photoBeforeUrl,
    photoAfterUrl,
    checklistItems,
    partsAndEquipment,
    thirdPartyServices,
    internalLaborHours,
    laborHourlyRate,
    otherCosts,
    machineDowntime,
    laborSavings,
    scrapReduction,
    toolingAndEnergy,
    logisticsAndFreight,
    productionIncrease,
    otherSavings,
    attachments,
    standardWorkUpdated,
    standardWorkDocRef,
    yokotenReplication,
    lessonsLearned,
    executeSave,
  ]);

  // Garante a gravação instantânea se o usuário fechar ou mudar de aba (Flush)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        executeSave();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        executeSave();
      }
    };
  }, [executeSave]);

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

  const handlePhotoBeforeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !action) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoBeforeUrl(dataUrl);
      const updated = dataService.updateAction(action.id, { photoBeforeUrl: dataUrl });
      setAction(updated);
      refreshData();
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoAfterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !action) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoAfterUrl(dataUrl);
      const updated = dataService.updateAction(action.id, { photoAfterUrl: dataUrl });
      setAction(updated);
      refreshData();
    };
    reader.readAsDataURL(file);
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
      quarterlyFollowUp: action.quarterlyFollowUp || {
        enabled: true,
        startedAt: new Date().toISOString(),
        month1: { monthNumber: 1, monthLabel: '1º Mês' },
        month2: { monthNumber: 2, monthLabel: '2º Mês' },
        month3: { monthNumber: 3, monthLabel: '3º Mês' },
        status: 'aguardando_mes_1',
        isCompleted: false,
      },
    });
    setAction(updated);
    refreshData();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  const handleOpenFollowUpModal = (month: 1 | 2 | 3) => {
    const currentEntry = action?.quarterlyFollowUp?.[`month${month}` as 'month1' | 'month2' | 'month3'];
    setFollowUpModalMonth(month);
    setFollowUpValue(currentEntry?.value !== undefined ? currentEntry.value : '');
    setFollowUpHours(currentEntry?.hoursSaved !== undefined ? currentEntry.hoursSaved : '');
    setFollowUpDate(currentEntry?.measuredAt || new Date().toISOString().split('T')[0]);
    setFollowUpNotes(currentEntry?.notes || '');
  };

  const handleSaveFollowUpMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || followUpModalMonth === null || followUpValue === '') return;

    const updated = dataService.saveQuarterlyMonthResult(action.id, followUpModalMonth, {
      value: Number(followUpValue),
      hoursSaved: followUpHours !== '' ? Number(followUpHours) : undefined,
      measuredAt: followUpDate || new Date().toISOString().split('T')[0],
      notes: followUpNotes,
      registeredBy: currentUser?.name || action.assignedAgentName || 'Agente Lean',
    });

    setAction(updated);
    refreshData();
    setFollowUpModalMonth(null);

    if (updated.quarterlyFollowUp?.isCompleted) {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    } else {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
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
    if (!action) return;
    const a3Url = currentUser?.role === 'agent'
      ? `/agente/projetos/${action.id}/relatorio-a3`
      : `/admin/projetos/${action.id}/relatorio-a3`;
    router.push(a3Url);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Carregando dados completos do projeto PDCA...</p>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '3rem auto', backgroundColor: '#0f172a' }}>
        <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
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
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#0d1527', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#cbd5e1' }}
          >
            <ArrowLeft size={15} color="#22d3ee" /> Voltar ao Kanban
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', backgroundColor: 'rgba(6, 10, 19, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                {action.protocol}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', backgroundColor: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>
                METODOLOGIA PDCA
              </span>
              <PriorityBadge priority={action.priority} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.25rem 0 0', fontFamily: 'var(--font-heading)' }}>
              {action.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.35rem', flexWrap: 'wrap', fontSize: '0.78125rem' }}>
              <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                👑 Líder: <span style={{ color: '#ffffff', fontWeight: 600 }}>{leaderName || action.leaderName || action.assignedAgentName}</span>
              </span>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                👤 Agente: <span style={{ color: '#cbd5e1' }}>{action.assignedAgentName}</span>
              </span>
              {(teamMembersInput || (action.teamMembers && action.teamMembers.length > 0)) && (
                <span style={{ color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                  👥 Equipe: <span style={{ color: '#cbd5e1', fontWeight: 400 }}>{teamMembersInput || action.teamMembers?.join(', ')}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setPresentationSlide(1);
              setPresentationOpen(true);
            }}
            className="btn btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              color: '#c084fc',
              fontWeight: 800,
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.25)',
              transition: 'all 0.15s ease',
            }}
            title="Abrir Apresentação de Slides Executivos do Ciclo PDCA (P -> D -> C -> A -> Antes e Depois)"
          >
            <Play size={14} fill="#c084fc" />
            <span>Modo Apresentação</span>
          </button>

          {/* Indicador em Tempo Real de Auto-Save */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: saveStatus === 'saving' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${saveStatus === 'saving' ? 'rgba(6, 182, 212, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: saveStatus === 'saving' ? '#22d3ee' : '#34d399',
              transition: 'all 0.2s ease',
            }}
          >
            {saveStatus === 'saving' ? (
              <>
                <Clock size={13} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} color="#34d399" />
                <span>Salvo automaticamente ✓</span>
              </>
            )}
          </div>

          <button onClick={handleCopyLink} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#0d1527', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
            <Share2 size={14} /> {copied ? 'Copiado!' : 'Compartilhar'}
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#0d1527', borderColor: 'rgba(255, 255, 255, 0.12)' }}
            title="Visualizar e Imprimir Relatório A3 Paisagem (4 Quadrantes PDCA)"
          >
            <Printer size={14} /> Relatório A3 (Paisagem)
          </button>
        </div>
      </div>

      {/* PDCA INTERACTIVE STEPPER / TABS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          backgroundColor: '#0f172a',
          padding: '0.75rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        }}
      >
        {/* P - PLAN */}
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'plan' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: activeTab === 'plan' ? 'rgba(6, 182, 212, 0.16)' : '#0d1527',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'plan' ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'plan' ? '#22d3ee' : '#94a3b8' }}>
              1. PLAN (Planejar)
            </span>
            <span style={{ fontSize: '1rem' }}>🔵</span>
          </div>
          <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Diagnóstico & Causas
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>5W2H • 5 Porquês • Ishikawa 6M</span>
        </button>

        {/* D - DO */}
        <button
          type="button"
          onClick={() => setActiveTab('do')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'do' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: activeTab === 'do' ? 'rgba(245, 158, 11, 0.16)' : '#0d1527',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'do' ? '0 0 15px rgba(245, 158, 11, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'do' ? '#fbbf24' : '#94a3b8' }}>
              2. DO (Executar)
            </span>
            <span style={{ fontSize: '1rem' }}>🟡</span>
          </div>
          <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Plano de Ação 5W2H
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Checklist • Testes Piloto • Posto</span>
        </button>

        {/* C - CHECK */}
        <button
          type="button"
          onClick={() => setActiveTab('check')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'check' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: activeTab === 'check' ? 'rgba(168, 85, 247, 0.16)' : '#0d1527',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'check' ? '0 0 15px rgba(168, 85, 247, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'check' ? '#c084fc' : '#94a3b8' }}>
              3. CHECK (Verificar & ROI)
            </span>
            <span style={{ fontSize: '1rem' }}>🟣</span>
          </div>
          <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Custos vs. Ganhos
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Lucro Líquido • ROI % • Payback</span>
        </button>

        {/* A - ACT */}
        <button
          type="button"
          onClick={() => setActiveTab('act')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'act' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: activeTab === 'act' ? 'rgba(16, 185, 129, 0.16)' : '#0d1527',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'act' ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'act' ? '#34d399' : '#94a3b8' }}>
              4. ACT (Padronizar)
            </span>
            <span style={{ fontSize: '1rem' }}>🟢</span>
          </div>
          <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            POP, Yokoten & Master
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Padronização • Replicação • DRE</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: P - PLAN (Planejamento, Diagnóstico & Causa Raiz) */}
      {/* ========================================================================= */}
      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Liderança e Equipe Envolvida no Kaizen */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Users size={20} color="#fbbf24" />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  1.0 Liderança & Equipe Envolvida no Projeto
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                  Defina o líder do projeto/kaizen e as pessoas envolvidas diretamente nas melhorias.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  👑 Líder do Kaizen / Projeto:
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: Fernanda Lima (Especialista Lean)"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  👥 Pessoas Envolvidas / Equipe Kaizen (separar por vírgula):
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: Carlos Silva (Operação), Marcos Souza (Manutenção), Ana Paula (Qualidade)"
                  value={teamMembersInput}
                  onChange={(e) => setTeamMembersInput(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>
            </div>
          </div>

          {/* Card: Definição do Problema & Meta */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BookOpen size={20} color="#22d3ee" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                1.1 Definição do Problema & Meta do Projeto
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                  Declaração Formal do Problema / Oportunidade:
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Descreva o que está ocorrendo no chão de fábrica, qual máquina/setor e o impacto gerado..."
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>

              {/* Indicadores Baseline vs Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#090e1a', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Nome do Indicador-Chave:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Tempo de Setup da Extrusora"
                    value={targetMetricName}
                    onChange={(e) => setTargetMetricName(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Unidade de Medida:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: minutos, %, peças/h"
                    value={targetMetricUnit}
                    onChange={(e) => setTargetMetricUnit(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171' }}>
                    🔴 Baseline Inicial (Antes):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 52"
                    value={baselineValue}
                    onChange={(e) => setBaselineValue(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(239, 68, 68, 0.35)', color: '#f87171', fontWeight: 800 }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>
                    🟢 Meta Alvo (Planejado):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 15"
                    value={targetGoalValue}
                    onChange={(e) => setTargetGoalValue(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(16, 185, 129, 0.35)', color: '#34d399', fontWeight: 800 }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>
                    ⚠️ Custo do Problema (R$/mês):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 18500"
                    value={currentProblemCostMonthly}
                    onChange={(e) => setCurrentProblemCostMonthly(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24', fontWeight: 800 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1.2 HUB DE FERRAMENTAS DE DIAGNÓSTICO & ANÁLISE DE CAUSA RAIZ (EXPANSÍVEL) */}
          {/* ========================================================================= */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Header & Guia do Hub */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={18} color="#22d3ee" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    1.2 Ferramentas de Diagnóstico & Causa Raiz
                  </h3>
                  <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                    Selecione as ferramentas Lean que deseja utilizar neste projeto. Apenas as ferramentas ativas ficam expandidas, mantendo a página limpa e escalável.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <span style={{ backgroundColor: '#090e1a', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontFamily: 'var(--font-mono)' }}>
                  {selectedDiagnosticTools.length} ferramenta{selectedDiagnosticTools.length !== 1 ? 's' : ''} em uso
                </span>
              </div>
            </div>

            {/* Selector Tiles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              {/* Tile 1: 5 Porquês */}
              <button
                type="button"
                onClick={() => toggleDiagnosticTool('fiveWhys')}
                style={{
                  textAlign: 'left',
                  padding: '1rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: selectedDiagnosticTools.includes('fiveWhys') ? 'rgba(6, 182, 212, 0.12)' : '#090e1a',
                  border: `1.5px solid ${selectedDiagnosticTools.includes('fiveWhys') ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🔍</span>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: selectedDiagnosticTools.includes('fiveWhys')
                        ? 'rgba(6, 182, 212, 0.25)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: selectedDiagnosticTools.includes('fiveWhys') ? '#22d3ee' : '#94a3b8',
                      border: `1px solid ${selectedDiagnosticTools.includes('fiveWhys') ? 'rgba(6, 182, 212, 0.4)' : 'transparent'}`,
                    }}
                  >
                    {selectedDiagnosticTools.includes('fiveWhys') ? '● Em Uso (Expandido)' : '○ Oculto (Clique p/ Ativar)'}
                  </span>
                </div>
                <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>
                  5 Porquês
                </strong>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                  Investigação causal sequencial em 5 níveis até a causa raiz definitiva.
                </span>
                {fiveWhysFilledCount > 0 && (
                  <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 700, display: 'inline-block', marginTop: '0.4rem' }}>
                    ✓ {fiveWhysFilledCount}/5 etapas preenchidas
                  </span>
                )}
              </button>

              {/* Tile 2: Gráfico de Pareto 80/20 */}
              <button
                type="button"
                onClick={() => toggleDiagnosticTool('pareto')}
                style={{
                  textAlign: 'left',
                  padding: '1rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: selectedDiagnosticTools.includes('pareto') ? 'rgba(139, 92, 246, 0.12)' : '#090e1a',
                  border: `1.5px solid ${selectedDiagnosticTools.includes('pareto') ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📊</span>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: selectedDiagnosticTools.includes('pareto')
                        ? 'rgba(139, 92, 246, 0.25)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: selectedDiagnosticTools.includes('pareto') ? '#c084fc' : '#94a3b8',
                      border: `1px solid ${selectedDiagnosticTools.includes('pareto') ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}`,
                    }}
                  >
                    {selectedDiagnosticTools.includes('pareto') ? '● Em Uso (Expandido)' : '○ Oculto (Clique p/ Ativar)'}
                  </span>
                </div>
                <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>
                  Gráfico de Pareto (80/20)
                </strong>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                  Priorização estatística dos 20% de causas vitais que causam 80% das perdas.
                </span>
                {(paretoImageUrl || paretoVitalCauses) && (
                  <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 700, display: 'inline-block', marginTop: '0.4rem' }}>
                    ✓ Pareto registrado
                  </span>
                )}
              </button>

              {/* Tile 3: Diagrama de Ishikawa (6M) */}
              <button
                type="button"
                onClick={() => toggleDiagnosticTool('ishikawa')}
                style={{
                  textAlign: 'left',
                  padding: '1rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: selectedDiagnosticTools.includes('ishikawa') ? 'rgba(16, 185, 129, 0.12)' : '#090e1a',
                  border: `1.5px solid ${selectedDiagnosticTools.includes('ishikawa') ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🐟</span>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: selectedDiagnosticTools.includes('ishikawa')
                        ? 'rgba(16, 185, 129, 0.25)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: selectedDiagnosticTools.includes('ishikawa') ? '#34d399' : '#94a3b8',
                      border: `1px solid ${selectedDiagnosticTools.includes('ishikawa') ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}`,
                    }}
                  >
                    {selectedDiagnosticTools.includes('ishikawa') ? '● Em Uso (Expandido)' : '○ Oculto (Clique p/ Ativar)'}
                  </span>
                </div>
                <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>
                  Diagrama de Ishikawa (6M)
                </strong>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                  Espinha de peixe estruturada nos 6M: Método, Máquina, Material, etc.
                </span>
                {ishikawaFilledCount > 0 && (
                  <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 700, display: 'inline-block', marginTop: '0.4rem' }}>
                    ✓ {ishikawaFilledCount}/6 M&apos;s preenchidos
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FERRAMENTA 1: 5 PORQUÊS (SE ATIVO)                                       */}
          {/* ========================================================================= */}
          {selectedDiagnosticTools.includes('fiveWhys') && (
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(6, 182, 212, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={20} color="#22d3ee" />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      🔍 Análise dos 5 Porquês (Causa Raiz)
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                      Questione sucessivamente o motivo da falha até chegar na causa que elimina a reincidência.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#22d3ee',
                      backgroundColor: 'rgba(6, 182, 212, 0.15)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                    }}
                  >
                    5 WHYS
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticTool('fiveWhys')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                    title="Ocultar esta ferramenta"
                  >
                    <ChevronUp size={14} /> Recolher
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {fiveWhys.map((why, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: index === 4 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                        color: index === 4 ? '#f87171' : '#22d3ee',
                        border: `1px solid ${index === 4 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.35)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
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
                        fontWeight: index === 4 ? 800 : 400,
                        borderColor: index === 4 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.12)',
                        backgroundColor: index === 4 ? 'rgba(239, 68, 68, 0.08)' : '#090e1a',
                        color: '#ffffff',
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
          )}

          {/* ========================================================================= */}
          {/* FERRAMENTA 2: GRÁFICO DE PARETO (80/20) (SE ATIVO)                       */}
          {/* ========================================================================= */}
          {selectedDiagnosticTools.includes('pareto') && (
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={20} color="#c084fc" />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      📊 Comprovação por Gráfico de Pareto (Regra 80/20)
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                      Identifique e comprove visualmente os 20% das causas vitais que geram 80% das perdas fabris.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#c084fc',
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                    }}
                  >
                    ⚡ REGRA 80/20
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticTool('pareto')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                    title="Ocultar esta ferramenta"
                  >
                    <ChevronUp size={14} /> Recolher
                  </button>
                </div>
              </div>

              {/* Pareto Content: Image & Vital Causes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
                {/* Left Column: Pareto Chart Image / Visualizer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1' }}>
                    📊 Imagem do Gráfico de Pareto Gerado:
                  </span>

                  {paretoImageUrl ? (
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: '#090e1a',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                      }}
                    >
                      <img
                        src={paretoImageUrl}
                        alt="Gráfico de Pareto 80/20"
                        style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', backgroundColor: '#090e1a' }}
                      />
                      <div
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#0d1527',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                        }}
                      >
                        <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{paretoImageName || 'Grafico_Pareto_80_20.png'}</span>
                        <button
                          type="button"
                          onClick={handleRemoveParetoImage}
                          className="btn btn-sm"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.2rem 0.5rem' }}
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
                        border: '1.5px dashed rgba(139, 92, 246, 0.4)',
                        backgroundColor: '#090e1a',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      {/* Simulated SVG Pareto illustration */}
                      <div style={{ width: '100%', maxWidth: '260px', height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#060a13', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ width: '22%', height: '85%', backgroundColor: '#8b5cf6', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.65rem', fontWeight: 900 }}>48%</div>
                        <div style={{ width: '22%', height: '60%', backgroundColor: '#a855f7', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.65rem', fontWeight: 900 }}>34%</div>
                        <div style={{ width: '22%', height: '22%', backgroundColor: '#c084fc', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617', fontSize: '0.65rem', fontWeight: 800 }}>11%</div>
                        <div style={{ width: '22%', height: '12%', backgroundColor: '#64748b', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700 }}>7%</div>
                      </div>

                      <div>
                        <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>
                          Carregue a imagem do Gráfico de Pareto (Excel / Minitab / Foto)
                        </strong>
                        <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          Formatos suportados: PNG, JPG, JPEG, WEBP, SVG
                        </span>
                      </div>

                      <label
                        className="btn btn-primary btn-sm"
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#8b5cf6', borderColor: '#7c3aed' }}
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
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#cbd5e1' }}>
                      🎯 Causas Vitais Identificadas (os 20% priorizados no Pareto):
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={paretoVitalCauses}
                      onChange={(e) => setParetoVitalCauses(e.target.value)}
                      placeholder="Descreva quais são as causas vitais que correspondem a 80% do problema..."
                      style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#090e1a', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                        % Impacto Acumulado Resolvido:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={paretoCumulativePercent}
                          onChange={(e) => setParetoCumulativePercent(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="80"
                          style={{ backgroundColor: '#060a13', borderColor: 'rgba(139, 92, 246, 0.35)', color: '#c084fc', fontWeight: 800 }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc' }}>%</span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', display: 'block' }}>
                        Foco de Ataque Lean:
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'block', marginTop: '0.35rem' }}>
                        ✓ Alta Prioridade no Plano 5W2H
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FERRAMENTA 3: DIAGRAMA DE ISHIKAWA (6M - ESPINHA DE PEIXE) (SE ATIVO)    */}
          {/* ========================================================================= */}
          {selectedDiagnosticTools.includes('ishikawa') && (
            <div
              className="card"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                backgroundColor: '#0f172a',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🐟</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      Diagrama de Ishikawa (Espinha de Peixe • 6M)
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                      Estratificação de causas potenciais nas 6 categorias fabris: Método, Máquina, Material, Mão de Obra, Medição e Meio Ambiente.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#34d399',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    ISHIKAWA 6M
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticTool('ishikawa')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                    title="Ocultar esta ferramenta"
                  >
                    <ChevronUp size={14} /> Recolher
                  </button>
                </div>
              </div>

              {/* Problem/Effect Banner at Top of Fishbone */}
              <div
                style={{
                  backgroundColor: '#090e1a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    EFEITO (PROBLEMA)
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: 700 }}>
                    {problemStatement || action?.description || 'Problema em análise no setor'}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  Meta: {targetGoalValue || '—'} {targetMetricUnit || ''}
                </span>
              </div>

              {/* 6M Fishbone Grid (3 columns x 2 rows) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {/* 1. Método */}
                <div
                  style={{
                    backgroundColor: '#090e1a',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem' }}>📐</span>
                      <strong style={{ fontSize: '0.85rem', color: '#22d3ee', fontFamily: 'var(--font-heading)' }}>
                        1. Método (Procedimentos & Padrões)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>SOP / Sequência</span>
                  </div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ex: Ausência de procedimento padrão para setup rápido ou sequência de troca indefinida..."
                    value={ishikawaMethod}
                    onChange={(e) => setIshikawaMethod(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.8125rem' }}
                  />
                </div>

                {/* 2. Máquina */}
                <div
                  style={{
                    backgroundColor: '#090e1a',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem' }}>⚙️</span>
                      <strong style={{ fontSize: '0.85rem', color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>
                        2. Máquina (Equipamentos & Ferramentas)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Manutenção / Ajustes</span>
                  </div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ex: Falta de engates rápidos, desgaste de roscas, paradas por falta de ar comprimido..."
                    value={ishikawaMachine}
                    onChange={(e) => setIshikawaMachine(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.8125rem' }}
                  />
                </div>

                {/* 3. Material */}
                <div
                  style={{
                    backgroundColor: '#090e1a',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem' }}>📦</span>
                      <strong style={{ fontSize: '0.85rem', color: '#f472b6', fontFamily: 'var(--font-heading)' }}>
                        3. Material (Matéria-Prima & Insumos)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Variação de Lote</span>
                  </div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ex: Variação de fluidez no lote de resina, embalagens fora da especificação..."
                    value={ishikawaMaterial}
                    onChange={(e) => setIshikawaMaterial(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.8125rem' }}
                  />
                </div>

                {/* 4. Mão de Obra */}
                <div
                  style={{
                    backgroundColor: '#090e1a',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem' }}>👷‍♂️</span>
                      <strong style={{ fontSize: '0.85rem', color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                        4. Mão de Obra (Habilidade & Treinamento)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Capacitação</span>
                  </div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ex: Operadores novatos sem treinamento na técnica SMED, falta de alinhamento entre turnos..."
                    value={ishikawaManpower}
                    onChange={(e) => setIshikawaManpower(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.8125rem' }}
                  />
                </div>

                {/* 5. Medição */}
                <div
                  style={{
                    backgroundColor: '#090e1a',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem' }}>📏</span>
                      <strong style={{ fontSize: '0.85rem', color: '#c084fc', fontFamily: 'var(--font-heading)' }}>
                        5. Medição (Instrumentos & Critérios)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Calibração / Amostragem</span>
                  </div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ex: Sem cronometragem detalhada das microetapas, manômetro descalibrado..."
                    value={ishikawaMeasurement}
                    onChange={(e) => setIshikawaMeasurement(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.8125rem' }}
                  />
                </div>

                {/* 6. Meio Ambiente */}
                <div
                  style={{
                    backgroundColor: '#090e1a',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem' }}>🌡️</span>
                      <strong style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                        6. Meio Ambiente (Layout & Condições)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>5S / Espaço</span>
                  </div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ex: Ferramentas dispersas ao redor da extrusora, iluminação deficiente no painel..."
                    value={ishikawaEnvironment}
                    onChange={(e) => setIshikawaEnvironment(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Primary Root Cause Conclusion from Ishikawa */}
              <div
                style={{
                  backgroundColor: '#090e1a',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem', color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🎯 Causa Raiz Principal Priorizada no Ishikawa (Conclusão 6M):
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Falta de dispositivo poka-yoke e procedimento de troca rápida sem distinção entre setup interno e externo."
                  value={ishikawaRootCause}
                  onChange={(e) => setIshikawaRootCause(e.target.value)}
                  style={{ backgroundColor: '#060a13', borderColor: 'rgba(16, 185, 129, 0.35)', color: '#ffffff', fontWeight: 600 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: D - DO (Plano de Ação 5W2H & Execução) */}
      {/* ========================================================================= */}
      {activeTab === 'do' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 5W2H Action Plan Table */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={20} color="#fbbf24" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  2.1 Plano de Ação 5W2H & Execução ({checklistItems.filter((c) => c.completed).length}/{checklistItems.length} concluídas)
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
                      border: item.completed ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.12)' : '#090e1a',
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
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: item.completed ? '#34d399' : '#ffffff', textDecoration: item.completed ? 'line-through' : 'none', fontFamily: 'var(--font-heading)' }}>
                          {index + 1}. {item.label}
                        </strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                          <span>👤 {item.responsibleName || 'Agente'}</span>
                          {item.startDate && <span>📅 Início: {formatDate(item.startDate)}</span>}
                          {item.endDate && <span>🏁 Fim: {formatDate(item.endDate)}</span>}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        color: item.completed ? '#34d399' : '#94a3b8',
                        border: `1px solid ${item.completed ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
                      }}
                    >
                      {item.completed ? 'Concluída ✓' : 'Pendente'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Add Action Form */}
            <form onSubmit={handleAddChecklistItem} style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
                ➕ Adicionar Nova Atividade 5W2H:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>O que fazer (Ação): *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: Instalar engates rápidos"
                    value={newActionLabel}
                    onChange={(e) => setNewActionLabel(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Responsável (Quem):</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: Juliana Mendes"
                    value={newActionResp}
                    onChange={(e) => setNewActionResp(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Data Início:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={newActionStart}
                    onChange={(e) => setNewActionStart(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Data Fim:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={newActionEnd}
                    onChange={(e) => setNewActionEnd(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ height: '36px' }}>
                  Adicionar
                </button>
              </div>
            </form>
          </div>

          {/* 2.2 Evidências Visuais da Transformação (Fotos de Antes e Depois) */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ImageIcon size={20} color="#22d3ee" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  2.2 Evidências Visuais (Fotos do Antes & Depois Salvas no Projeto)
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                  Anexe uma foto do estado inicial (Antes) e outra do posto melhorado (Depois). Elas serão salvas no projeto e apresentadas no Modo Apresentação.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Foto Antes */}
              <div style={{ backgroundColor: '#090e1a', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>
                    📸 Foto do Antes (Estado Inicial)
                  </span>
                  {photoBeforeUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoBeforeUrl('');
                        if (action) dataService.updateAction(action.id, { photoBeforeUrl: '' });
                      }}
                      style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Remover
                    </button>
                  )}
                </div>

                {photoBeforeUrl ? (
                  <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <img src={photoBeforeUrl} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <label
                    style={{
                      height: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <UploadCloud size={24} color="#f87171" />
                    <span>Clique para selecionar a foto do <strong>Antes</strong></span>
                    <input type="file" accept="image/*" onChange={handlePhotoBeforeUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Foto Depois */}
              <div style={{ backgroundColor: '#090e1a', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                    📸 Foto do Depois (Melhoria Implantada)
                  </span>
                  {photoAfterUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoAfterUrl('');
                        if (action) dataService.updateAction(action.id, { photoAfterUrl: '' });
                      }}
                      style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Remover
                    </button>
                  )}
                </div>

                {photoAfterUrl ? (
                  <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <img src={photoAfterUrl} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <label
                    style={{
                      height: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <UploadCloud size={24} color="#34d399" />
                    <span>Clique para selecionar a foto do <strong>Depois</strong></span>
                    <input type="file" accept="image/*" onChange={handlePhotoAfterUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: C - CHECK (Verificar & Engenharia Financeira: Custos vs Lucros) */}
      {/* ========================================================================= */}
      {activeTab === 'check' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Real Indicator Achieved (Antes vs Depois) */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={20} color="#c084fc" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                3.1 Eficácia Técnica (Antes vs. Depois)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>🔴 Baseline Inicial (Antes):</span>
                <strong style={{ fontSize: '1.4rem', color: '#f87171', display: 'block', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                  {baselineValue || '—'} {targetMetricUnit}
                </strong>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.35)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase' }}>🎯 Meta Planejada:</span>
                <strong style={{ fontSize: '1.4rem', color: '#22d3ee', display: 'block', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                  {targetGoalValue || '—'} {targetMetricUnit}
                </strong>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1.5px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>🟢 Resultado Real Atingido (Depois):</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ marginTop: '0.35rem', fontWeight: 900, fontSize: '1.2rem', color: '#34d399', backgroundColor: '#090e1a', borderColor: 'rgba(16, 185, 129, 0.4)' }}
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
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #ef4444', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingDown size={18} color="#ef4444" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    Custos do Projeto (Investimento)
                  </h3>
                </div>
                <strong style={{ fontSize: '1.1rem', color: '#f87171', fontFamily: 'var(--font-heading)' }}>
                  {formatCurrency(totalInvestmentCost)}
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>🔧 Peças, Dispositivos & Sensores (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={partsAndEquipment}
                    onChange={(e) => setPartsAndEquipment(Number(e.target.value) || 0)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>⚙️ Serviços de Terceiros / Usinagem (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={thirdPartyServices}
                    onChange={(e) => setThirdPartyServices(Number(e.target.value) || 0)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>⏱️ Horas Equipe (h):</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={internalLaborHours}
                      onChange={(e) => setInternalLaborHours(Number(e.target.value) || 0)}
                      style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>💰 Custo/Hora (R$/h):</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={laborHourlyRate}
                      onChange={(e) => setLaborHourlyRate(Number(e.target.value) || 45)}
                      style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>💡 Outras Despesas Operacionais (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(Number(e.target.value) || 0)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>
              </div>
            </div>

            {/* 🟢 COLUNA 2: GANHOS BRUTOS / CUSTO EVITADO (7 Fontes) */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #10b981', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={18} color="#34d399" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    Ganhos Brutos (7 Fontes)
                  </h3>
                </div>
                <strong style={{ fontSize: '1.1rem', color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                  {formatCurrency(totalGrossSavings)}
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>⚙️ Redução de Paradas de Máquina / OEE (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={machineDowntime}
                    onChange={(e) => setMachineDowntime(Number(e.target.value) || 0)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>⏱️ Mão de Obra / Horas Economizadas (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={laborSavings}
                    onChange={(e) => setLaborSavings(Number(e.target.value) || 0)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>♻️ Redução de Refugo / Matéria-Prima (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={scrapReduction}
                    onChange={(e) => setScrapReduction(Number(e.target.value) || 0)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>⚡ Ferramental, Energia & Insumos (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={toolingAndEnergy}
                    onChange={(e) => setToolingAndEnergy(Number(e.target.value) || 0)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>📈 Aumento de Produção / Capacidade Extra (R$):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={productionIncrease}
                    onChange={(e) => setProductionIncrease(Number(e.target.value) || 0)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BALANÇO EXECUTIVO: LUCRO LÍQUIDO, ROI % & PAYBACK */}
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: '#090e1a',
              color: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                💰 RETORNO LÍQUIDO (LUCRO REAL)
              </span>
              <strong style={{ fontSize: '1.8rem', color: '#34d399', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(netSavings)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Ganhos ({formatCurrency(totalGrossSavings)}) - Custos ({formatCurrency(totalInvestmentCost)})
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                📊 RETORNO SOBRE O INVESTIMENTO (ROI)
              </span>
              <strong style={{ fontSize: '1.8rem', color: '#22d3ee', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {roiPercentage}%
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Para cada R$ 1,00 investido, retorno de {formatCurrency(totalInvestmentCost > 0 ? totalGrossSavings / totalInvestmentCost : 0)}.
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                ⏱️ TEMPO DE PAYBACK
              </span>
              <strong style={{ fontSize: '1.8rem', color: '#fbbf24', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {paybackMonths} meses
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Recuperação de 100% do valor investido.
              </span>
            </div>
          </div>

          {/* 3.3 ANEXOS DE MEMORIAL DE CÁLCULO & DOCUMENTOS TÉCNICOS (PDF) */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Paperclip size={20} color="#c084fc" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    3.3 Memorial de Cálculo & Anexos Comprobatórios (PDF)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                    Anexe o memorial de cálculo detalhado, relatórios de cronoanálise, planilhas ou fotos para auditoria e homologação.
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#c084fc',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
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
                    border: '1.5px dashed rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    backgroundColor: '#090e1a',
                    color: '#94a3b8',
                  }}
                >
                  <FileText size={32} color="#64748b" style={{ margin: '0 auto 0.5rem' }} />
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
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
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#090e1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: isPdf ? 'rgba(239, 68, 68, 0.15)' : isSpreadsheet ? 'rgba(16, 185, 129, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                            color: isPdf ? '#f87171' : isSpreadsheet ? '#34d399' : '#c084fc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: `1px solid ${isPdf ? 'rgba(239, 68, 68, 0.35)' : isSpreadsheet ? 'rgba(16, 185, 129, 0.35)' : 'rgba(168, 85, 247, 0.35)'}`,
                          }}
                        >
                          {isPdf ? <FileText size={22} /> : isSpreadsheet ? <FileSpreadsheet size={22} /> : <File size={22} />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>{att.name}</strong>
                            <span
                              style={{
                                fontSize: '0.675rem',
                                fontWeight: 800,
                                padding: '0.1rem 0.45rem',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                backgroundColor: att.category === 'memorial_calculo' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                                color: att.category === 'memorial_calculo' ? '#22d3ee' : '#94a3b8',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                              <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>({att.sizeFormatted})</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <span>👤 Enviado por: <strong style={{ color: '#f8fafc' }}>{att.uploadedBy || 'Agente'}</strong></span>
                            <span>📅 {formatDateTime(att.uploadedAt)}</span>
                          </div>

                          {att.description && (
                            <p style={{ fontSize: '0.78125rem', color: '#cbd5e1', margin: '0.35rem 0 0', fontStyle: 'italic' }}>
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
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#0d1527', borderColor: 'rgba(255, 255, 255, 0.12)' }}
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
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
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
                backgroundColor: '#090e1a',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1.5px dashed rgba(6, 182, 212, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <UploadCloud size={18} color="#22d3ee" />
                <strong style={{ fontSize: '0.85rem', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  Anexar Novo Documento / Memorial de Cálculo (PDF, Planilha ou Imagem):
                </strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) 1fr', gap: '0.75rem', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Categoria do Documento:
                  </label>
                  <select
                    className="form-control form-control-sm"
                    value={newAttachmentCategory}
                    onChange={(e: any) => setNewAttachmentCategory(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  >
                    <option value="memorial_calculo">📑 Memorial de Cálculo Financeiro</option>
                    <option value="relatorio_tecnico">📊 Relatório Técnico / Cronoanálise</option>
                    <option value="evidencia_foto">📸 Fotos / Evidências do Posto</option>
                    <option value="outro">📄 Outro Documento Comprobatório</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Descrição / Nota (opcional):
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: Planilha de cálculo de OEE e perdas térmicas"
                    value={newAttachmentDesc}
                    onChange={(e) => setNewAttachmentDesc(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Selecione o Arquivo (.pdf, .xlsx, .csv, .png):
                  </label>
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    accept=".pdf,.xlsx,.csv,.xls,.docx,.doc,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    style={{ padding: '0.35rem 0.5rem', cursor: 'pointer', backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
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
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <FileCheck size={20} color="#34d399" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                4.1 Padronização da Rotina (POP / SOP)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="sopCheck"
                  checked={standardWorkUpdated}
                  onChange={(e) => setStandardWorkUpdated(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                />
                <label htmlFor="sopCheck" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', cursor: 'pointer' }}>
                  Procedimento Operacional Padrão atualizado e equipe treinada
                </label>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Código / Referência do Documento:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: POP-EXT-042 rev 03 (Troca Rápida de Matriz)"
                  value={standardWorkDocRef}
                  onChange={(e) => setStandardWorkDocRef(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>
            </div>
          </div>

          {/* Card: Yokoten & Lições Aprendidas */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Award size={20} color="#34d399" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                4.2 Yokoten (Replicação em Outras Linhas) & Lições Aprendidas
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Linhas / Máquinas para Replicação (Yokoten):</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ex: Replicar o kit SMED e carrinho de ferramentas nas Extrusoras 01, 02 e 04 no ciclo seguinte..."
                  value={yokotenReplication}
                  onChange={(e) => setYokotenReplication(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Lições Aprendidas durante a Execução:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ex: O pré-aquecimento externo foi responsável por 80% do ganho sem grandes investimentos..."
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
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
                ? '2px solid rgba(16, 185, 129, 0.5)'
                : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                ? '2px solid rgba(168, 85, 247, 0.5)'
                : '1px dashed rgba(255, 255, 255, 0.15)',
              backgroundColor: action.masterApproved
                ? 'rgba(16, 185, 129, 0.1)'
                : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                ? 'rgba(168, 85, 247, 0.1)'
                : '#0f172a',
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
                    : '#1e293b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.35rem',
                  boxShadow: action.masterApproved ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                {action.masterApproved ? '✓' : action.status === 'aguardando_aprovacao' || action.submittedForApproval ? '⏳' : '🏢'}
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: action.masterApproved
                      ? '#34d399'
                      : action.status === 'aguardando_aprovacao' || action.submittedForApproval
                      ? '#c084fc'
                      : '#ffffff',
                    margin: 0,
                    fontFamily: 'var(--font-heading)',
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

                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
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
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
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
                    backgroundColor: action.status === 'aguardando_aprovacao' ? '#7c3aed' : undefined,
                    borderColor: action.status === 'aguardando_aprovacao' ? '#7c3aed' : undefined,
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
                  className="btn btn-success"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Homologar Projeto & Concluir Ciclo PDCA</span>
                </button>
              )}
            </div>
          </div>

          {/* Card: 4.4 Sustentação & Comprovação de Resultados em 3 Meses */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              backgroundColor: '#0f172a',
              border: action.masterApproved
                ? '2px solid rgba(6, 182, 212, 0.4)'
                : '1px dashed rgba(255, 255, 255, 0.12)',
              boxShadow: action.masterApproved ? '0 10px 30px -5px rgba(6, 182, 212, 0.12)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: action.masterApproved ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${action.masterApproved ? 'rgba(6, 182, 212, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: action.masterApproved ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none',
                  }}
                >
                  <Calendar size={22} color={action.masterApproved ? '#22d3ee' : '#94a3b8'} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      4.4 Comprovação Trimestral de Ganhos Reais (Auditoria de 3 Meses)
                    </h3>
                    {action.masterApproved && action.quarterlyFollowUp?.isCompleted ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <CheckCircle2 size={12} /> AUDITORIA CONSOLIDADA (3/3)
                      </span>
                    ) : action.masterApproved ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          color: '#22d3ee',
                          border: '1px solid rgba(6, 182, 212, 0.35)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                        }}
                      >
                        EM ACOMPANHAMENTO (
                        {[
                          action.quarterlyFollowUp?.month1?.value,
                          action.quarterlyFollowUp?.month2?.value,
                          action.quarterlyFollowUp?.month3?.value,
                        ].filter((v) => v !== undefined).length}
                        /3 MESES)
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#94a3b8',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                        }}
                      >
                        BLOQUEADO ATÉ HOMOLOGAÇÃO
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0', maxWidth: '750px', lineHeight: 1.5 }}>
                    Conforme o padrão de sustentação Lean, após a homologação executiva o agente monitora os resultados operacionais nos 3 primeiros meses. Ao registrar o 3º mês, o sistema calcula e consolida a média definitiva de custo evitado automaticamente.
                  </p>
                </div>
              </div>
            </div>

            {!action.masterApproved ? (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: '#090e1a',
                  border: '1px dashed rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  fontSize: '0.84375rem',
                  textAlign: 'center',
                }}
              >
                🔒 <strong>Acompanhamento Bloqueado:</strong> Esta seção é liberada automaticamente para lançamento dos resultados trimestrais assim que o supervisor homologar o projeto no passo acima (4.3).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Grid dos 3 Meses */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {([1, 2, 3] as const).map((mNum) => {
                    const mKey = `month${mNum}` as 'month1' | 'month2' | 'month3';
                    const entry = action.quarterlyFollowUp?.[mKey];
                    const isFilled = entry?.value !== undefined;

                    return (
                      <div
                        key={mNum}
                        style={{
                          backgroundColor: '#090e1a',
                          border: isFilled
                            ? '1px solid rgba(16, 185, 129, 0.35)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '14px',
                          padding: '1.15rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.85rem',
                          position: 'relative',
                          boxShadow: isFilled ? '0 4px 20px rgba(16, 185, 129, 0.08)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {mNum}º Mês de Operação
                          </span>
                          {isFilled ? (
                            <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.1rem 0.45rem', borderRadius: '9999px' }}>
                              ✓ Aferido
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.1rem 0.45rem', borderRadius: '9999px' }}>
                              ⏳ Pendente
                            </span>
                          )}
                        </div>

                        <div>
                          <p style={{ fontSize: '0.675rem', color: '#64748b', textTransform: 'uppercase', margin: '0 0 0.15rem', fontWeight: 700 }}>
                            Custo Evitado Real
                          </p>
                          <h4 style={{ fontSize: '1.45rem', fontWeight: 900, color: isFilled ? '#34d399' : '#64748b', margin: 0, fontFamily: 'var(--font-mono)' }}>
                            {isFilled ? formatCurrency(entry.value!) : 'R$ --'}
                          </h4>
                        </div>

                        {isFilled ? (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem' }}>
                            {entry.hoursSaved !== undefined && entry.hoursSaved > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
                                <Clock size={12} color="#f59e0b" />
                                <span>{entry.hoursSaved}h salvas no período</span>
                              </div>
                            )}
                            {entry.measuredAt && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
                                <Calendar size={12} color="#06b6d4" />
                                <span>Data: {formatDate(entry.measuredAt)}</span>
                              </div>
                            )}
                            {entry.notes && (
                              <p style={{ margin: '0.2rem 0 0', fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.725rem', lineHeight: 1.4 }}>
                                &ldquo;{entry.notes}&rdquo;
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenFollowUpModal(mNum)}
                              className="btn btn-secondary btn-sm"
                              style={{ marginTop: '0.5rem', fontSize: '0.725rem', width: '100%', justifyContent: 'center' }}
                            >
                              Editar Medição
                            </button>
                          </div>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenFollowUpModal(mNum)}
                              className="btn btn-primary btn-sm"
                              style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <Plus size={14} /> Lançar Resultado do {mNum}º Mês
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Banner de Média Trimestral e Consolidação */}
                <div
                  style={{
                    backgroundColor: action.quarterlyFollowUp?.isCompleted
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(6, 182, 212, 0.08)',
                    border: action.quarterlyFollowUp?.isCompleted
                      ? '1.5px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid rgba(6, 182, 212, 0.25)',
                    borderRadius: '14px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: action.quarterlyFollowUp?.isCompleted
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(6, 182, 212, 0.2)',
                        border: `1px solid ${action.quarterlyFollowUp?.isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(6, 182, 212, 0.4)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Sigma size={24} color={action.quarterlyFollowUp?.isCompleted ? '#34d399' : '#22d3ee'} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                          Média Trimestral de Custo Evitado Consolidada
                        </h4>
                        {action.quarterlyFollowUp?.isCompleted && (
                          <span style={{ fontSize: '0.675rem', fontWeight: 900, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.1rem 0.45rem', borderRadius: '9999px' }}>
                            OFICIALIZADO NA DRE ✓
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                        {action.quarterlyFollowUp?.isCompleted
                          ? 'A média dos 3 meses de operação estabilizada foi calculada automaticamente e atualizada na DRE de ganhos.'
                          : 'O cálculo da média final fecha automaticamente ao realizar o preenchimento do 3º mês de acompanhamento.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Média dos 3 Meses
                    </span>
                    <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#34d399', margin: 0, fontFamily: 'var(--font-mono)' }}>
                      {action.quarterlyFollowUp?.averageCostAvoided
                        ? formatCurrency(action.quarterlyFollowUp.averageCostAvoided)
                        : formatCurrency(action.actualCostAvoided || 0)}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.25rem' }}>/mês</span>
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Lançamento de Resultado Mensal do Acompanhamento */}
      {followUpModalMonth !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="#22d3ee" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Aferição do {followUpModalMonth}º Mês de Operação
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpModalMonth(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFollowUpMonth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                  Custo Evitado Real Aferido no Mês (R$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ex: 85000"
                  className="form-control"
                  value={followUpValue}
                  onChange={(e) => setFollowUpValue(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                    Horas Salvas no Mês (h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ex: 60"
                    className="form-control"
                    value={followUpHours}
                    onChange={(e) => setFollowUpHours(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                    Data da Aferição
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                  Observações / Evidências da Aferição
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Processo estabilizado, sem paradas no período. Tempo médio aferido conforme POP."
                  className="form-control"
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.84375rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFollowUpModalMonth(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} /> Salvar e Registrar Aferição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP HERO BANNER: MODO APRESENTAÇÃO DE SLIDES (P -> D -> C -> A -> FOTOS) */}
      {/* ========================================================================= */}
      {presentationOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.95)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPresentationOpen(false);
          }}
        >
          {/* Main Hero Banner Slide Stage - Zero Scrollbar Guaranteed */}
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '1160px',
              height: '88vh',
              maxHeight: '740px',
              backgroundColor: '#090e1a',
              border: '2px solid rgba(6, 182, 212, 0.35)',
              borderRadius: '24px',
              boxShadow:
                '0 30px 80px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(6, 182, 212, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Top Presentation Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#070b14',
                flexShrink: 0,
                gap: '0.75rem',
              }}
            >
              {/* Left Title & Protocol */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 900,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    color: '#c084fc',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    letterSpacing: '0.05em',
                  }}
                >
                  SLIDES EXECUTIVOS PDCA
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#22d3ee',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {action.protocol}
                </span>
                <span
                  style={{
                    fontSize: '0.84375rem',
                    color: '#ffffff',
                    fontWeight: 800,
                    maxWidth: '340px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {action.title}
                </span>
              </div>

              {/* Center Stepper Navigation Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {[
                  { num: 1 as const, label: 'P • PLAN', color: '#22d3ee' },
                  { num: 2 as const, label: 'D • DO', color: '#c084fc' },
                  { num: 3 as const, label: 'C • CHECK', color: '#fbbf24' },
                  { num: 4 as const, label: 'A • ACT', color: '#34d399' },
                  { num: 5 as const, label: '📸 ANTES & DEPOIS', color: '#38bdf8' },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setPresentationSlide(s.num)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border:
                        presentationSlide === s.num
                          ? `1px solid ${s.color}`
                          : '1px solid transparent',
                      backgroundColor:
                        presentationSlide === s.num
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'transparent',
                      color: presentationSlide === s.num ? s.color : '#94a3b8',
                      transition: 'all 0.15s ease',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Right Counter & Close Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.725rem',
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  {presentationSlide}/5
                </span>
                <button
                  type="button"
                  onClick={() => setPresentationOpen(false)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '0.2rem 0.45rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.725rem',
                  }}
                  title="Fechar Apresentação (ESC)"
                >
                  <X size={13} /> ESC
                </button>
              </div>
            </div>

            {/* Slide Body - Scrollbar Habilitada e Estilizada para Apresentação */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(6, 182, 212, 0.5) rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* =================================================================== */}
              {/* SLIDE 1: P • PLAN (Compilação Dinâmica sem campos vazios)           */}
              {/* =================================================================== */}
              {presentationSlide === 1 && (() => {
                const isWhyFilled = (w: string) => {
                  if (!w) return false;
                  const cleaned = w.replace(/^[0-9]+[\.\)\-]?\s*/, '').trim();
                  return cleaned.length > 0;
                };
                const activeFiveWhys = fiveWhys.filter(isWhyFilled);
                const hasFiveWhys = activeFiveWhys.length > 0;

                const paretoImg = paretoImageUrl || action.pareto?.chartImageUrl;
                const isParetoFilled = (p?: string) => {
                  if (!p) return false;
                  const trimmed = p.trim();
                  if (!trimmed) return false;
                  if (trimmed.startsWith('80% das perdas concentradas nas 2 causas')) return false;
                  return true;
                };
                const hasPareto = Boolean(paretoImg || isParetoFilled(paretoVitalCauses));

                const ishikawaItems = [
                  { label: 'Método', val: ishikawaMethod || action.ishikawa?.method, icon: '📐' },
                  { label: 'Máquina', val: ishikawaMachine || action.ishikawa?.machine, icon: '⚙️' },
                  { label: 'Material', val: ishikawaMaterial || action.ishikawa?.material, icon: '📦' },
                  { label: 'Mão de Obra', val: ishikawaManpower || action.ishikawa?.manpower, icon: '👷‍♂️' },
                  { label: 'Medição', val: ishikawaMeasurement || action.ishikawa?.measurement, icon: '📏' },
                  { label: 'Meio Ambiente', val: ishikawaEnvironment || action.ishikawa?.environment, icon: '🌡️' },
                ].filter((item) => Boolean(item.val && item.val.trim()));
                const hasIshikawa = ishikawaItems.length > 0;

                const hasProblemCost = Boolean(currentProblemCostMonthly && Number(currentProblemCostMonthly) > 0);

                const effectiveLeader = leaderName || action.leaderName || action.assignedAgentName;
                const effectiveTeam = teamMembersInput
                  ? teamMembersInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
                  : (action.teamMembers || []);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '1rem', paddingBottom: '0.5rem' }}>
                    {/* Header */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#22d3ee', backgroundColor: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                          1. PLAN (PLANEJAR)
                        </span>
                        <span style={{ fontSize: '0.78125rem', color: '#94a3b8' }}>• Diagnóstico da Causa Raiz, Liderança & Metas</span>
                      </div>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        Diagnóstico do Problema Fabril & Definição de Metas
                      </h2>
                    </div>

                    {/* Dynamic 2-Column Balanced Content */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', alignItems: 'stretch' }}>
                      {/* Left Column: Diagnóstico Causal (Problema, 5 Porquês, Pareto e Ishikawa se houver) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                        {/* Declaração da Causa Raiz & Problema */}
                        <div style={{ backgroundColor: '#0f172a', padding: (!hasFiveWhys && !hasPareto && !hasIshikawa) ? '1.5rem' : '0.85rem 1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <h4 style={{ fontSize: '0.725rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>
                            🎯 Declaração da Causa Raiz & Problema
                          </h4>
                          <p style={{ margin: 0, fontSize: (!hasFiveWhys && !hasPareto && !hasIshikawa) ? '1rem' : '0.8125rem', color: '#ffffff', lineHeight: 1.45 }}>
                            {problemStatement || action.description || 'Causa raiz diagnosticada no posto de trabalho.'}
                          </p>
                        </div>

                        {/* Compilação Dinâmica: Exibe os 5 Porquês SOMENTE se houver preenchimento real */}
                        {hasFiveWhys && (
                          <div style={{ backgroundColor: '#0f172a', padding: '0.75rem 1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>
                              🔍 Investigação Causal (5 Porquês)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {activeFiveWhys.slice(0, 3).map((whyText, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    fontSize: '0.725rem',
                                    color: '#cbd5e1',
                                    backgroundColor: '#090e1a',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    lineHeight: 1.3,
                                  }}
                                >
                                  <strong style={{ color: '#22d3ee', marginRight: '0.3rem' }}>{idx + 1}º:</strong> {whyText.replace(/^[0-9]+[\.\)\-]?\s*/, '')}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Compilação Dinâmica: Exibe Ishikawa 6M se houver preenchimento */}
                        {hasIshikawa && (
                          <div style={{ backgroundColor: '#0f172a', padding: '0.75rem 1rem', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', margin: 0 }}>
                                🐟 Ishikawa 6M (Espinha de Peixe)
                              </h4>
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                {ishikawaItems.length}/6 M&apos;s
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                              {ishikawaItems.slice(0, 4).map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    fontSize: '0.6875rem',
                                    color: '#cbd5e1',
                                    backgroundColor: '#090e1a',
                                    padding: '0.3rem 0.5rem',
                                    borderRadius: '6px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  <span style={{ marginRight: '0.25rem' }}>{item.icon}</span>
                                  <strong style={{ color: '#34d399' }}>{item.label}:</strong> {item.val}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Compilação Dinâmica: Exibe Pareto (Foto com tamanho equilibrado + Zoom) SOMENTE se houver dados reais */}
                        {hasPareto && (
                          <div
                            style={{
                              backgroundColor: '#0f172a',
                              padding: '0.75rem 1rem',
                              borderRadius: '14px',
                              border: '1px solid rgba(6, 182, 212, 0.35)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem',
                            }}
                          >
                            {/* Header do Card Pareto com Botão Telão / Zoom */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 800, textTransform: 'uppercase' }}>
                                  📊 Gráfico de Pareto 80/20
                                </span>
                                {action.pareto?.cumulativeImpactPercentage && (
                                  <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                    {action.pareto.cumulativeImpactPercentage}% impacto vital
                                  </span>
                                )}
                              </div>
                              {paretoImg && (
                                <button
                                  type="button"
                                  onClick={() => setParetoZoomOpen(true)}
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                    border: '1px solid rgba(6, 182, 212, 0.4)',
                                    color: '#22d3ee',
                                    fontSize: '0.65rem',
                                    padding: '0.15rem 0.45rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    cursor: 'pointer',
                                  }}
                                  title="Abrir no telão para mostrar aos ouvintes"
                                >
                                  <Maximize2 size={11} /> Telão / Zoom
                                </button>
                              )}
                            </div>

                            {/* Foto do Pareto em Tamanho Equilibrado (sem cortar as outras informações) */}
                            {paretoImg ? (
                              <div
                                onClick={() => setParetoZoomOpen(true)}
                                style={{
                                  height: (hasFiveWhys || hasIshikawa) ? '135px' : '175px',
                                  width: '100%',
                                  backgroundColor: '#040711',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: '1px solid rgba(6, 182, 212, 0.25)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'zoom-in',
                                  position: 'relative',
                                }}
                              >
                                <img
                                  src={paretoImg}
                                  alt="Gráfico de Pareto 80/20"
                                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.25rem' }}
                                />
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: '6px',
                                    right: '6px',
                                    backgroundColor: 'rgba(9, 14, 26, 0.85)',
                                    border: '1px solid rgba(6, 182, 212, 0.35)',
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '5px',
                                    fontSize: '0.625rem',
                                    color: '#22d3ee',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    backdropFilter: 'blur(4px)',
                                  }}
                                >
                                  <Maximize2 size={10} /> Clique para Telão
                                </div>
                              </div>
                            ) : null}

                            {/* Resumo Textual das Causas Vitais */}
                            {paretoVitalCauses && (
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                <strong style={{ color: '#22d3ee' }}>Causas Vitais:</strong> {paretoVitalCauses}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Column: Metas Baseline vs Alvo & Ficha da Equipe */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {/* Metas Baseline vs Alvo */}
                        <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                            Indicador Chave do Projeto
                          </span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0 0.85rem', fontFamily: 'var(--font-heading)' }}>
                            {targetMetricName || 'Tempo de Ciclo / Perda de Processo'}
                          </h3>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div style={{ backgroundColor: '#090e1a', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                              <span style={{ fontSize: '0.65rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                Baseline (Antes)
                              </span>
                              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                                {baselineValue !== '' ? `${baselineValue} ${targetMetricUnit}` : '--'}
                              </span>
                            </div>

                            <div style={{ backgroundColor: '#090e1a', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                              <span style={{ fontSize: '0.65rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                Meta Alvo
                              </span>
                              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                                {targetGoalValue !== '' ? `${targetGoalValue} ${targetMetricUnit}` : '--'}
                              </span>
                            </div>
                          </div>

                          {hasProblemCost && (
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Custo mensal da perda:</span>
                              <strong style={{ fontSize: '0.95rem', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                                {formatCurrency(Number(currentProblemCostMonthly))}/mês
                              </strong>
                            </div>
                          )}
                        </div>

                        {/* Ficha da Equipe & Liderança */}
                        <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem' }}>
                            <span style={{ color: '#fbbf24', fontWeight: 700 }}>👑 Líder do Kaizen:</span>
                            <strong style={{ color: '#ffffff' }}>{effectiveLeader}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem' }}>
                            <span style={{ color: '#94a3b8' }}>👤 Agente Lean:</span>
                            <strong style={{ color: '#cbd5e1' }}>{action.assignedAgentName}</strong>
                          </div>
                          {effectiveTeam.length > 0 && (
                            <div style={{ fontSize: '0.78125rem', marginTop: '0.2rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <span style={{ color: '#22d3ee', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                                👥 Pessoas Envolvidas:
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                {effectiveTeam.map((member, mIdx) => (
                                  <span
                                    key={mIdx}
                                    style={{
                                      fontSize: '0.675rem',
                                      backgroundColor: '#090e1a',
                                      border: '1px solid rgba(255, 255, 255, 0.08)',
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: '4px',
                                      color: '#e2e8f0',
                                    }}
                                  >
                                    {member}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', marginTop: '0.1rem' }}>
                            <span style={{ color: '#94a3b8' }}>Setor:</span>
                            <strong style={{ color: '#ffffff' }}>{action.originSectorName || 'Fábrica'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem' }}>
                            <span style={{ color: '#94a3b8' }}>Desperdício:</span>
                            <strong style={{ color: '#22d3ee' }}>{action.wasteCategory || 'Espera'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div />
                  </div>
                );
              })()}

              {/* =================================================================== */}
              {/* SLIDE 2: D • DO (Compilação Dinâmica de 5W2H & Testes)              */}
              {/* =================================================================== */}
              {presentationSlide === 2 && (() => {
                const totalActions = checklistItems.length;
                const completedActions = checklistItems.filter((i) => i.completed).length;
                const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 100;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '1rem', paddingBottom: '0.5rem' }}>
                    {/* Header */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#c084fc', backgroundColor: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                          2. DO (EXECUTAR)
                        </span>
                        <span style={{ fontSize: '0.78125rem', color: '#94a3b8' }}>• Plano de Ação 5W2H & Testes Piloto no Posto</span>
                      </div>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        Execução das Ações 5W2H & Testes na Linha Produtiva
                      </h2>
                    </div>

                    {/* Content */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '1.25rem', alignItems: 'stretch' }}>
                      {/* Left: Posto Piloto & Conclusão */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                            Posto de Trabalho / Máquina Piloto
                          </span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                            {pilotArea || action.pilotArea || 'Posto Piloto de Operação'}
                          </h3>
                          <p style={{ marginTop: '0.65rem', fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                            {pilotTestObservations || action.pilotTestObservations || 'Ajustes operacionais testados e validados diretamente com os operadores de turno.'}
                          </p>
                        </div>

                        <div style={{ backgroundColor: '#0f172a', padding: '1.15rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
                            Conclusão do Plano 5W2H
                          </span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                              {completionRate}%
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              ({completedActions}/{totalActions} ações entregues)
                            </span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#090e1a', borderRadius: '999px', overflow: 'hidden', marginTop: '0.5rem' }}>
                            <div style={{ height: '100%', width: `${completionRate}%`, backgroundColor: '#34d399' }} />
                          </div>
                        </div>
                      </div>

                      {/* Right: Top 5W2H Actions */}
                      <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', margin: 0 }}>
                          📋 Ações Executadas no Chão de Fábrica
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {checklistItems.length === 0 ? (
                            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                              Nenhuma ação pendente no checklist.
                            </p>
                          ) : (
                            checklistItems.slice(0, 4).map((item, idx) => (
                              <div
                                key={item.id || idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.55rem 0.75rem',
                                  backgroundColor: '#090e1a',
                                  borderRadius: '8px',
                                  border: item.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ color: item.completed ? '#34d399' : '#fbbf24', fontSize: '0.875rem' }}>
                                    {item.completed ? '✓' : '⏳'}
                                  </span>
                                  <span style={{ fontSize: '0.78125rem', color: item.completed ? '#cbd5e1' : '#ffffff', fontWeight: 600 }}>
                                    {item.label}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 700 }}>
                                  {item.responsibleName || 'Agente'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div />
                  </div>
                );
              })()}

              {/* =================================================================== */}
              {/* SLIDE 3: C • CHECK (Compilação Dinâmica, Eficácia Técnica & ROI)     */}
              {/* =================================================================== */}
              {presentationSlide === 3 && (() => {
                // Fontes ativas de ganhos (> 0)
                const activeSources = [
                  { label: 'Paradas de Máquina / OEE', icon: '⚙️', val: machineDowntime },
                  { label: 'Mão de Obra / Setup Otimizado', icon: '⏱️', val: laborSavings },
                  { label: 'Redução de Refugo / Sucata', icon: '♻️', val: scrapReduction },
                  { label: 'Aumento de Produção / Capacidade', icon: '📈', val: productionIncrease },
                  { label: 'Energia, Ferramental & Insumos', icon: '⚡', val: toolingAndEnergy },
                  { label: 'Logística, Frete & Movimentação', icon: '🚚', val: logisticsAndFreight },
                  { label: 'Outras Economias Operacionais', icon: '💡', val: otherSavings },
                ].filter((s) => s.val > 0);

                // Composição dos custos / investimento (> 0)
                const activeCosts = [
                  { label: 'Peças, Sensores & Dispositivos', val: partsAndEquipment },
                  { label: 'Serviços de Terceiros / Usinagem', val: thirdPartyServices },
                  { label: 'Horas Equipe Interna', val: internalLaborHours * laborHourlyRate, detail: `${internalLaborHours}h @ R$ ${laborHourlyRate}/h` },
                  { label: 'Outras Despesas Operacionais', val: otherCosts },
                ].filter((c) => c.val > 0);

                // Cálculo da melhoria técnica antes vs depois
                const bNum = Number(baselineValue) || 0;
                const tNum = Number(targetGoalValue) || 0;
                const aNum = achievedValue !== '' ? Number(achievedValue) : tNum;

                let technicalGainText = 'Meta Técnica Plenamente Atingida';
                if (bNum > 0 && aNum > 0) {
                  if (bNum > aNum) {
                    const pct = Math.round(((bNum - aNum) / bNum) * 100);
                    const diff = (bNum - aNum).toFixed(1).replace(/\.0$/, '');
                    technicalGainText = `Redução de ${diff} ${targetMetricUnit} (−${pct}%) no posto`;
                  } else if (aNum > bNum) {
                    const pct = Math.round(((aNum - bNum) / bNum) * 100);
                    const diff = (aNum - bNum).toFixed(1).replace(/\.0$/, '');
                    technicalGainText = `Aumento de ${diff} ${targetMetricUnit} (+${pct}%) de ganho`;
                  }
                }

                const grossValue = totalGrossSavings > 0 ? totalGrossSavings : (action.actualCostAvoided || 0);
                const netValue = netSavings > 0 ? netSavings : grossValue;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '1rem', paddingBottom: '0.5rem' }}>
                    {/* Header */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.12rem 0.5rem', borderRadius: '6px' }}>
                          3. CHECK (VERIFICAR)
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Eficácia Técnica, Balanço Financeiro & Retorno do Investimento</span>
                      </div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        Resultados Aferidos, DRE do Projeto & Retorno Financeiro (ROI)
                      </h2>
                    </div>

                    {/* Top Row: 3 Executive KPI Pillars */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 0.95fr', gap: '0.85rem', alignItems: 'stretch' }}>
                      {/* Pillar 1: Eficácia Técnica (Antes -> Meta -> Depois) */}
                      <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#22d3ee', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'block' }}>
                            🎯 1. Eficácia Técnica no Posto
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.1fr', gap: '0.35rem', marginTop: '0.4rem', textAlign: 'center' }}>
                            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.35rem 0.25rem', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.575rem', color: '#f87171', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Antes</span>
                              <strong style={{ fontSize: '0.95rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                                {baselineValue || '—'} <span style={{ fontSize: '0.65rem' }}>{targetMetricUnit}</span>
                              </strong>
                            </div>
                            <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '0.35rem 0.25rem', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.575rem', color: '#22d3ee', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Meta</span>
                              <strong style={{ fontSize: '0.95rem', color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                                {targetGoalValue || '—'} <span style={{ fontSize: '0.65rem' }}>{targetMetricUnit}</span>
                              </strong>
                            </div>
                            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.35rem 0.25rem', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.575rem', color: '#34d399', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>Atingido ✓</span>
                              <strong style={{ fontSize: '1.05rem', color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                                {achievedValue !== '' ? achievedValue : targetGoalValue} <span style={{ fontSize: '0.65rem' }}>{targetMetricUnit}</span>
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.3rem 0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 800 }}>
                            ✓ {technicalGainText}
                          </span>
                        </div>
                      </div>

                      {/* Pillar 2: Balanço Financeiro do Projeto (Ganhos - Custos = Lucro) */}
                      <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 0 16px rgba(16, 185, 129, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                              💰 2. Balanço Financeiro (DRE Anual)
                            </span>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                              Homologado
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', padding: '0.25rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.725rem' }}>
                            <span style={{ color: '#cbd5e1' }}>Ganhos Brutos Totais:</span>
                            <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{formatCurrency(grossValue)}</strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.725rem' }}>
                            <span style={{ color: '#cbd5e1' }}>(-) Investimento / Custos:</span>
                            <strong style={{ color: totalInvestmentCost > 0 ? '#f87171' : '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                              {totalInvestmentCost > 0 ? `-${formatCurrency(totalInvestmentCost)}` : 'R$ 0,00 (Sem Custo)'}
                            </strong>
                          </div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.4rem 0.6rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: '#ffffff', fontWeight: 800 }}>(=) Lucro Líquido Real:</span>
                          <strong style={{ fontSize: '1.2rem', color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                            {formatCurrency(netValue)}
                          </strong>
                        </div>
                      </div>

                      {/* Pillar 3: Retorno do Capital & Eficiência */}
                      <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'block' }}>
                            📈 3. Eficiência & Retorno
                          </span>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.35rem' }}>
                            <div style={{ backgroundColor: '#090e1a', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <span style={{ fontSize: '0.575rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>ROI Real</span>
                              <strong style={{ fontSize: '1.15rem', color: '#22d3ee', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                                {totalInvestmentCost > 0 ? `${roiPercentage}%` : '∞ (100%)'}
                              </strong>
                            </div>
                            <div style={{ backgroundColor: '#090e1a', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <span style={{ fontSize: '0.575rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Payback</span>
                              <strong style={{ fontSize: '0.95rem', color: '#fbbf24', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                                {paybackMonths > 0 ? `${paybackMonths} meses` : 'Imediato'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#090e1a', padding: '0.35rem 0.6rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                          <span style={{ color: '#cbd5e1' }}>⏱️ Horas Salvas:</span>
                          <strong style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                            {action.hoursSaved || internalLaborHours || 0}h / ano
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: 2 Detail Panels (Left: Active Gain Sources | Right: Cost Breakdown & Certification) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '0.85rem', alignItems: 'stretch' }}>
                      {/* Left: 7 Fontes de Ganhos Lean */}
                      <div style={{ backgroundColor: '#0f172a', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            🟢 Composição dos Ganhos Lean ({activeSources.length} fontes ativas)
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                            Total: {formatCurrency(grossValue)}
                          </span>
                        </div>

                        {activeSources.length === 0 ? (
                          <div style={{ padding: '0.75rem', backgroundColor: '#090e1a', borderRadius: '8px', textAlign: 'center', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
                            ✓ Custo evitado homologado de {formatCurrency(grossValue)}/ano no posto de trabalho.
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem', maxHeight: '115px', overflowY: 'auto' }}>
                            {activeSources.map((src, i) => {
                              const sharePct = grossValue > 0 ? Math.round((src.val / grossValue) * 100) : 0;
                              return (
                                <div
                                  key={i}
                                  style={{
                                    backgroundColor: '#090e1a',
                                    padding: '0.4rem 0.6rem',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.4rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                                    <span style={{ fontSize: '0.75rem' }}>{src.icon}</span>
                                    <span style={{ fontSize: '0.675rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {src.label}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                                    <span style={{ fontSize: '0.6rem', color: '#94a3b8', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.05rem 0.25rem', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
                                      {sharePct}%
                                    </span>
                                    <strong style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                                      {formatCurrency(src.val)}
                                    </strong>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Investimentos & Homologação */}
                      <div style={{ backgroundColor: '#0f172a', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.45rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.675rem', fontWeight: 800, color: totalInvestmentCost > 0 ? '#f87171' : '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              🔧 Investimento & Recursos Aplicados
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                              {totalInvestmentCost > 0 ? formatCurrency(totalInvestmentCost) : 'Custo Zero'}
                            </span>
                          </div>

                          {activeCosts.length === 0 ? (
                            <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '6px', color: '#22d3ee', fontSize: '0.7rem', lineHeight: 1.35 }}>
                              ⚡ <strong>Melhoria Kaizen de Baixo Custo:</strong> Executada 100% com recursos internos da equipe de manufatura.
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '75px', overflowY: 'auto' }}>
                              {activeCosts.map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.675rem', backgroundColor: '#090e1a', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                  <span style={{ color: '#cbd5e1' }}>{c.label} {c.detail ? `(${c.detail})` : ''}</span>
                                  <strong style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>{formatCurrency(c.val)}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom Tag: Laudo / Memorial & Homologação */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.35rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.675rem' }}>
                          <span style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            📄 {attachments.length > 0 ? `${attachments.length} Memorial(is) PDF Anexado(s)` : 'Memorial Aferido no Posto'}
                          </span>
                          <span style={{ color: '#34d399', fontWeight: 800 }}>
                            ✓ Aprovado & Homologado
                          </span>
                        </div>
                      </div>
                    </div>

                    <div />
                  </div>
                );
              })()}

              {/* =================================================================== */}
              {/* SLIDE 4: A • ACT (Compilação Dinâmica de Padronização & 3 Meses)    */}
              {/* =================================================================== */}
              {presentationSlide === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '1rem', paddingBottom: '0.5rem' }}>
                  {/* Header */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                        4. ACT (PADRONIZAR & AGIR)
                      </span>
                      <span style={{ fontSize: '0.78125rem', color: '#94a3b8' }}>• Padronização POP, Lições Aprendidas & Auditoria</span>
                    </div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      Padronização de Trabalho, Yokoten & Acompanhamento de 3 Meses
                    </h2>
                  </div>

                  {/* 3 Compact Columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignItems: 'stretch' }}>
                    {/* Card 1: Padronização */}
                    <div style={{ backgroundColor: '#0f172a', padding: '1.15rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <BookOpen size={18} color="#22d3ee" />
                        <h4 style={{ fontSize: '0.84375rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          Padronização & SOP
                        </h4>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={14} color={standardWorkUpdated ? '#34d399' : '#fbbf24'} />
                          <strong style={{ color: standardWorkUpdated ? '#34d399' : '#fbbf24', fontSize: '0.8125rem' }}>
                            {standardWorkUpdated ? 'POP Atualizado ✓' : 'Em revisão operacional'}
                          </strong>
                        </div>
                        {standardWorkDocRef && (
                          <span style={{ fontSize: '0.725rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)', display: 'block', marginTop: '0.15rem' }}>
                            Ref: {standardWorkDocRef}
                          </span>
                        )}
                      </div>

                      {lessonsLearned && (
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                            Lições Aprendidas:
                          </span>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                            {lessonsLearned}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card 2: Yokoten & Homologação */}
                    <div style={{ backgroundColor: '#0f172a', padding: '1.15rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Award size={18} color="#fbbf24" />
                        <h4 style={{ fontSize: '0.84375rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          Yokoten & Homologação
                        </h4>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                          Replicação Yokoten:
                        </span>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                          {yokotenReplication || 'Disseminação recomendada para todos os postos de mesmo perfil na fábrica.'}
                        </p>
                      </div>

                      <div style={{ backgroundColor: '#090e1a', padding: '0.65rem', borderRadius: '8px', border: action.masterApproved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px dashed rgba(255, 255, 255, 0.1)' }}>
                        <strong style={{ fontSize: '0.78125rem', color: action.masterApproved ? '#34d399' : '#fbbf24', display: 'block' }}>
                          {action.masterApproved ? '✓ HOMOLOGADO MASTER' : 'Em processo de homologação'}
                        </strong>
                        {action.masterApprovedBy && (
                          <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block' }}>
                            Por: {action.masterApprovedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card 3: Auditoria dos 3 Meses */}
                    <div style={{ backgroundColor: '#0f172a', padding: '1.15rem', borderRadius: '14px', border: '1px solid rgba(6, 182, 212, 0.35)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={18} color="#22d3ee" />
                        <h4 style={{ fontSize: '0.84375rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          Auditoria dos 3 Meses
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                        {[
                          { m: 1, val: action.quarterlyFollowUp?.month1?.value },
                          { m: 2, val: action.quarterlyFollowUp?.month2?.value },
                          { m: 3, val: action.quarterlyFollowUp?.month3?.value },
                        ].map((item) => (
                          <div
                            key={item.m}
                            style={{
                              backgroundColor: '#090e1a',
                              padding: '0.45rem 0.3rem',
                              borderRadius: '6px',
                              textAlign: 'center',
                              border: item.val ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>
                              {item.m}º Mês
                            </span>
                            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: item.val ? '#34d399' : '#64748b', fontFamily: 'var(--font-mono)' }}>
                              {item.val ? formatCurrency(item.val) : '--'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={{ backgroundColor: '#090e1a', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Média Oficial:</span>
                        <strong style={{ fontSize: '0.95rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                          {formatCurrency(action.quarterlyFollowUp?.averageCostAvoided || totalGrossSavings / 12 || 0)}/mês
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div />
                </div>
              )}

              {/* =================================================================== */}
              {/* SLIDE 5: 📸 ANTES & DEPOIS (Apenas Foto Antes e Foto Depois)        */}
              {/* =================================================================== */}
              {presentationSlide === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '1rem', paddingBottom: '0.5rem' }}>
                  {/* Header */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                        5. ANTES & DEPOIS
                      </span>
                      <span style={{ fontSize: '0.78125rem', color: '#94a3b8' }}>• Transformação Visual do Posto & Encerramento</span>
                    </div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      Transformação Visual do Posto de Trabalho
                    </h2>
                  </div>

                  {/* 2 Fotos Salvas no Próprio Projeto (Antes e Depois) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {/* Foto do Antes */}
                    <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '16px', border: '1.5px solid rgba(239, 68, 68, 0.35)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📸 ANTES DA MELHORIA
                        </span>
                        <label style={{ fontSize: '0.675rem', color: '#22d3ee', cursor: 'pointer', fontWeight: 700 }}>
                          {photoBeforeUrl ? 'Alterar Foto' : '+ Enviar Foto'}
                          <input type="file" accept="image/*" onChange={handlePhotoBeforeUpload} style={{ display: 'none' }} />
                        </label>
                      </div>

                      {photoBeforeUrl ? (
                        <div style={{ height: '280px', backgroundColor: '#090e1a', borderRadius: '10px', overflow: 'hidden' }}>
                          <img src={photoBeforeUrl} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <label
                          style={{
                            height: '280px',
                            backgroundColor: '#090e1a',
                            border: '2px dashed rgba(239, 68, 68, 0.25)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            gap: '0.5rem',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <UploadCloud size={28} color="#f87171" />
                          <span>Clique para anexar a foto do <strong>Antes</strong></span>
                          <input type="file" accept="image/*" onChange={handlePhotoBeforeUpload} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>

                    {/* Foto do Depois */}
                    <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '16px', border: '1.5px solid rgba(16, 185, 129, 0.45)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 0 25px rgba(16, 185, 129, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📸 DEPOIS (POSTO PADRONIZADO)
                        </span>
                        <label style={{ fontSize: '0.675rem', color: '#34d399', cursor: 'pointer', fontWeight: 700 }}>
                          {photoAfterUrl ? 'Alterar Foto' : '+ Enviar Foto'}
                          <input type="file" accept="image/*" onChange={handlePhotoAfterUpload} style={{ display: 'none' }} />
                        </label>
                      </div>

                      {photoAfterUrl ? (
                        <div style={{ height: '280px', backgroundColor: '#090e1a', borderRadius: '10px', overflow: 'hidden' }}>
                          <img src={photoAfterUrl} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <label
                          style={{
                            height: '280px',
                            backgroundColor: '#090e1a',
                            border: '2px dashed rgba(16, 185, 129, 0.25)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            gap: '0.5rem',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <UploadCloud size={28} color="#34d399" />
                          <span>Clique para anexar a foto do <strong>Depois</strong></span>
                          <input type="file" accept="image/*" onChange={handlePhotoAfterUpload} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Slim Horizontal Summary Strip */}
                  <div
                    style={{
                      backgroundColor: '#070b14',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78125rem' }}>
                      <span style={{ color: '#94a3b8' }}>
                        Retorno Real: <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalGrossSavings > 0 ? totalGrossSavings : action.actualCostAvoided)}</strong>
                      </span>
                      <span style={{ color: '#94a3b8' }}>
                        Horas Salvas: <strong style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{action.hoursSaved || internalLaborHours || 0}h</strong>
                      </span>
                      <span style={{ color: '#94a3b8' }}>
                        Líder / Resp: <strong style={{ color: '#ffffff' }}>{leaderName || action.leaderName || action.assignedAgentName}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } })}
                      className="btn btn-sm"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.725rem', padding: '0.25rem 0.65rem' }}
                    >
                      <Sparkles size={13} /> Celebrar com Confetes!
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Slide Navigation Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#070b14',
                flexShrink: 0,
              }}
            >
              {/* Botão Anterior */}
              <button
                type="button"
                disabled={presentationSlide === 1}
                onClick={() => setPresentationSlide((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4 | 5) : prev))}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  opacity: presentationSlide === 1 ? 0.35 : 1,
                  cursor: presentationSlide === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                }}
              >
                <ChevronLeft size={15} /> Anterior
              </button>

              {/* Dica de Passador de Slides / Teclado */}
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                🎮 <strong>Passador de Slides</strong> (PageDown/Up) • Teclas <strong>⬅️ ➡️ Espaço</strong> • <strong>ESC</strong> para sair
              </span>

              {/* Botão Próximo ou Concluir */}
              {presentationSlide < 5 ? (
                <button
                  type="button"
                  onClick={() => setPresentationSlide((prev) => (prev < 5 ? ((prev + 1) as 1 | 2 | 3 | 4 | 5) : prev))}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  Próximo Slide <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
                    setPresentationOpen(false);
                  }}
                  className="btn btn-success btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
                >
                  <CheckCircle2 size={15} /> Concluir Apresentação
                </button>
              )}
            </div>
          </div>

          {/* Lightbox de Zoom em Tela Cheia do Gráfico de Pareto para Mostrar aos Ouvintes */}
          {paretoZoomOpen && (paretoImageUrl || action.pareto?.chartImageUrl) && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(2, 6, 15, 0.97)',
                backdropFilter: 'blur(16px)',
                zIndex: 20000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
              }}
              onClick={() => setParetoZoomOpen(false)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '1140px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header do Telão */}
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#22d3ee', backgroundColor: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                      GRÁFICO DE PARETO 80/20 • MODO TELÃO EXECUTIVO
                    </span>
                    <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.875rem' }}>{action.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setParetoZoomOpen(false)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    <X size={15} /> Fechar Telão (ESC)
                  </button>
                </div>

                {/* Quadro da Imagem em Alta Resolução */}
                <div
                  style={{
                    width: '100%',
                    height: '76vh',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '2px solid rgba(6, 182, 212, 0.4)',
                    backgroundColor: '#040711',
                    boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 50px rgba(6, 182, 212, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem',
                  }}
                >
                  <img
                    src={paretoImageUrl || action.pareto?.chartImageUrl}
                    alt="Gráfico de Pareto em Alta Resolução"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>

                {/* Legenda Explicativa para os Ouvintes */}
                {(paretoVitalCauses || action.pareto?.vitalCausesSummary) && (
                  <div style={{ marginTop: '0.85rem', backgroundColor: '#090e1a', padding: '0.6rem 1.5rem', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)', maxWidth: '900px', width: '100%' }}>
                    <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.45 }}>
                      <strong style={{ color: '#22d3ee' }}>Causas Vitais Explicadas aos Ouvintes:</strong> {paretoVitalCauses || action.pareto?.vitalCausesSummary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Printable / Report Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.78125rem',
          color: '#94a3b8',
        }}
      >
        <div>
          Plataforma <strong style={{ color: '#ffffff' }}>LeanFlow 4.0</strong> • Metodologia PDCA & Engenharia de Custos Evitados
        </div>
        <div>
          Emissão em {formatDate(new Date().toISOString())}
        </div>
      </div>
    </div>
  );
}
