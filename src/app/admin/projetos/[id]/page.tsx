'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { dataService } from '@/services/dataService';
import { LeanAction, PDCAMethodologyStage, ActionChecklistItem, ProjectAttachment, IshikawaAnalysis, GainProofDetail, GainProofAttachment, ActivityAttachment, ActionQualityEvaluation, QuarterlyFollowUp, OperationalCashFlowItem } from '@/lib/types';
import { StatusBadge, PriorityBadge, WasteCategoryBadge } from '@/components/ui/Badge';
import { formatDateTime, formatDate, formatCurrency, WASTE_CATEGORIES, getFollowUpMonthsFilledCount, isThreeMonthsFollowUpCompleted, getProjectMonthLabel, getDefaultMeasurementDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostponeDeadlineModal } from '@/components/kanban/PostponeDeadlineModal';
import { ActivityAttachmentModal } from '@/components/kanban/ActivityAttachmentModal';
import { SenseiActionPokaYokeModal } from '@/components/kanban/SenseiActionPokaYokeModal';
import { Modal } from '@/components/ui/Modal';
import { LeanDiagnosticCanvas } from '@/components/pdca/LeanDiagnosticCanvas';
import { evaluateActionQuality } from '@/services/geminiService';
import {
  ArrowLeft,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  DollarSign,
  Calculator,
  Receipt,
  TrendingUp,
  Building,
  User,
  CheckSquare,
  AlertTriangle,
  Calendar,
  Layers,
  ListFilter,
  FileCheck,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
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
  Bot,
  Target,
  Wrench,
  Settings,
  Box,
  HardHat,
  Ruler,
  Thermometer,
  Camera,
  Truck,
  Lightbulb,
  Building2,
  Landmark,
  Lock,
  Hourglass,
  Rocket,
  Search,
  Workflow,
  RefreshCw,
  Monitor,
  Mic,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import SenseiVoiceAssistant from '@/components/presentation/SenseiVoiceAssistant';
import SenseiCopilotModal from '@/components/presentation/SenseiCopilotModal';
import { SenseiProjectRefinement, evaluateProjectStrategicAlignment } from '@/services/geminiService';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { currentUser, allAgents, refreshData, dataVersion } = useAuth();
  const { isDark } = useTheme();
  const isViewer = currentUser?.role === 'viewer';

  const [action, setAction] = useState<LeanAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<PDCAMethodologyStage>('plan');
  
  // Status de Auto-Save e Sincronização Concorrente em Tempo Real
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [remoteSyncNotification, setRemoteSyncNotification] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const baselineActionRef = useRef<LeanAction | null>(null);
  const previousDataVersionRef = useRef<number>(dataVersion || 1);
  const lastLocalSaveTimestampRef = useRef<number>(0);

  // Modo Apresentação (Hero Banner Pop-up com Slides P -> D -> C -> A -> Antes/Depois)
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [presentationSlide, setPresentationSlide] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [paretoZoomOpen, setParetoZoomOpen] = useState(false);
  const [showSenseiCopilot, setShowSenseiCopilot] = useState(false);

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
  // Modo de Visualização da Seção 1.2: Canvas Panorâmico ou Formulário Clássico
  const [diagnosticViewMode, setDiagnosticViewMode] = useState<'canvas' | 'form'>('canvas');

  // Costs (Investimento Capex/Opex) - Limpos sem '0' pré-estabelecido
  const [partsAndEquipment, setPartsAndEquipment] = useState<number | ''>('');
  const [thirdPartyServices, setThirdPartyServices] = useState<number | ''>('');
  const [internalLaborHours, setInternalLaborHours] = useState<number | ''>('');
  const [laborHourlyRate, setLaborHourlyRate] = useState<number | ''>(45);
  const [otherCosts, setOtherCosts] = useState<number | ''>('');

  // Deduções Fiscais e Parâmetros Tributários (CPC 27 / Lucro Real)
  const [icmsCredit, setIcmsCredit] = useState<number | ''>('');
  const [pisCofinsRate, setPisCofinsRate] = useState<number | ''>(22);
  const [pisCofinsCredit, setPisCofinsCredit] = useState<number | ''>('');
  const [financialRate, setFinancialRate] = useState<number | ''>(1.0);
  const [depreciationMonths, setDepreciationMonths] = useState<number | ''>(60);
  const [incomeTaxRate, setIncomeTaxRate] = useState<number | ''>(34);

  // Itens Operacionais Mensais (Ganhos vs Novos Custos Recorrentes - DRE da Melhoria)
  const [operationalItems, setOperationalItems] = useState<OperationalCashFlowItem[]>([]);

  // Gains (7 Fontes) - Limpos sem '0' pré-estabelecido
  const [machineDowntime, setMachineDowntime] = useState<number | ''>('');
  const [laborSavings, setLaborSavings] = useState<number | ''>('');
  const [scrapReduction, setScrapReduction] = useState<number | ''>('');
  const [toolingAndEnergy, setToolingAndEnergy] = useState<number | ''>('');
  const [logisticsAndFreight, setLogisticsAndFreight] = useState<number | ''>('');
  const [productionIncrease, setProductionIncrease] = useState<number | ''>('');
  const [otherSavings, setOtherSavings] = useState<number | ''>('');

  // Memórias de cálculo e explicações por ganho (Obrigatório para o Agente antes da Controladoria)
  const [gainDetails, setGainDetails] = useState<Record<string, GainProofDetail>>({});
  // Classificação do Retorno: Ganho Mensal Recorrente vs. Ganho Pontual Único (One-off)
  const [isOneOffGain, setIsOneOffGain] = useState<boolean>(false);

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
  const [newActionSector, setNewActionSector] = useState('');
  const [newActionStart, setNewActionStart] = useState('');
  const [newActionEnd, setNewActionEnd] = useState('');
  const [newActionTrackingDoc, setNewActionTrackingDoc] = useState('');

  // Modais de Prazos, Anexos e Poka-Yoke do Sensei
  const [postponeModalActivity, setPostponeModalActivity] = useState<ActionChecklistItem | null>(null);
  const [attachmentModalActivity, setAttachmentModalActivity] = useState<ActionChecklistItem | null>(null);
  const [previewGainAttachment, setPreviewGainAttachment] = useState<GainProofAttachment | null>(null);
  const [pokaYokeModalOpen, setPokaYokeModalOpen] = useState(false);
  const [qualityEvaluation, setQualityEvaluation] = useState<ActionQualityEvaluation | null>(null);
  const [pendingActivityPayload, setPendingActivityPayload] = useState<{
    label: string;
    responsibleName: string;
    responsibleSectorName: string;
    responsibleSectorId?: string;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    trackingDocNumber?: string;
  } | null>(null);

  const availableSectors = useMemo(() => {
    try {
      return dataService.getSectors(action?.tenantId);
    } catch {
      return [];
    }
  }, [action?.tenantId]);

  // Atividades do Plano de Ação 5W2H pendentes de conclusão
  const uncompletedActivities = useMemo(() => {
    return (checklistItems || []).filter((i) => !i.completed && i.status !== 'concluida');
  }, [checklistItems]);

  // Acompanhamento do Ciclo Real de 12 Meses (3 Meses Homologação + 9 Meses Consolidação)
  const [followUpModalMonth, setFollowUpModalMonth] = useState<number | null>(null);
  const [followUpValue, setFollowUpValue] = useState<number | ''>('');
  const [followUpHours, setFollowUpHours] = useState<number | ''>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [followUpNotes, setFollowUpNotes] = useState<string>('');

  const applyActionToForm = useCallback((found: LeanAction) => {
    setAction(found);
    baselineActionRef.current = JSON.parse(JSON.stringify(found));
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
    setPartsAndEquipment(found.projectCosts?.partsAndEquipment || '');
    setThirdPartyServices(found.projectCosts?.thirdPartyServices || '');
    setInternalLaborHours(found.projectCosts?.internalLaborHours || '');
    setLaborHourlyRate(found.projectCosts?.laborHourlyRate || 45);
    setOtherCosts(found.projectCosts?.otherCosts || '');

    setIcmsCredit(found.projectCosts?.icmsCredit !== undefined ? found.projectCosts.icmsCredit : '');
    setPisCofinsRate(found.projectCosts?.pisCofinsRate !== undefined ? found.projectCosts.pisCofinsRate : 22);
    setPisCofinsCredit(found.projectCosts?.pisCofinsCredit !== undefined ? found.projectCosts.pisCofinsCredit : '');
    setFinancialRate(found.projectCosts?.financialRate !== undefined ? found.projectCosts.financialRate : 1.0);
    setDepreciationMonths(found.projectCosts?.depreciationMonths !== undefined ? found.projectCosts.depreciationMonths : 60);
    setIncomeTaxRate(found.projectCosts?.incomeTaxRate !== undefined ? found.projectCosts.incomeTaxRate : 34);
    setOperationalItems(found.projectCosts?.operationalItems ? JSON.parse(JSON.stringify(found.projectCosts.operationalItems)) : []);

    setMachineDowntime(found.costBreakdown?.machineDowntime || '');
    setLaborSavings(found.costBreakdown?.laborSavings || '');
    setScrapReduction(found.costBreakdown?.scrapReduction || '');
    setToolingAndEnergy(found.costBreakdown?.toolingAndEnergy || '');
    setLogisticsAndFreight(found.costBreakdown?.logisticsAndFreight || '');
    setProductionIncrease(found.costBreakdown?.productionIncrease || '');
    setOtherSavings(found.costBreakdown?.otherSavings || '');

    const gDetails = found.gainDetails || found.controllershipAudit?.gainDetails || {};
    setGainDetails(JSON.parse(JSON.stringify(gDetails)));
    setIsOneOffGain(Boolean(found.isOneOffGain || found.quarterlyFollowUp?.isOneOffGain));

    // A - ACT
    setStandardWorkUpdated(!!found.standardWorkUpdated);
    setStandardWorkDocRef(found.standardWorkDocRef || '');
    setYokotenReplication(found.yokotenReplication || '');
    setLessonsLearned(found.lessonsLearned || '');

    // Evidências Fotográficas do Projeto
    setPhotoBeforeUrl(found.photoBeforeUrl || '');
    setPhotoAfterUrl(found.photoAfterUrl || '');
  }, []);

  useEffect(() => {
    let isMounted = true;
    isInitialLoadRef.current = true;

    const loadProject = async () => {
      if (!projectId) return;

      // 1. Carregamento imediato do cache local (sem latência visual)
      let initialFound = dataService.getActionById(projectId) || dataService.getActionByProtocol(projectId);
      if (initialFound && isMounted) {
        applyActionToForm(initialFound);
      }

      // 2. Sincronização cloud-first ativa (garante dados mais recentes salvos por qualquer usuário no Supabase)
      try {
        const cloudFound = await dataService.syncActionByIdFromCloud(projectId);
        if (cloudFound && isMounted) {
          applyActionToForm(cloudFound);
        }
      } catch (cloudErr) {
        console.warn('[ProjectDetail] Erro ao sincronizar acao da nuvem:', cloudErr);
      } finally {
        if (isMounted) {
          setLoading(false);
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 400);
        }
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId, applyActionToForm]);
 
  // Sincronização em tempo real reativa para colaboração simultânea (ex: Gustavo e Maurício no mesmo projeto)
  useEffect(() => {
    if (isInitialLoadRef.current || !projectId) return;
    if (dataVersion === previousDataVersionRef.current) return;
    previousDataVersionRef.current = dataVersion;

    const syncIncomingRemote = async () => {
      // Ignora ecos do Realtime disparados pelo próprio salvamento recente (< 3500ms)
      if (Date.now() - lastLocalSaveTimestampRef.current < 3500) {
        return;
      }

      let latest: LeanAction | null | undefined = dataService.getActionById(projectId);
      if (!latest) {
        try {
          latest = await dataService.syncActionByIdFromCloud(projectId);
        } catch {}
      }
      if (!latest || !action) return;

      // Se a versão do banco possui timestamp estritamente mais recente que o da tela
      const latestTime = latest.updatedAt ? new Date(latest.updatedAt).getTime() : 0;
      const screenTime = action.updatedAt ? new Date(action.updatedAt).getTime() : 0;

      if (latestTime > screenTime) {
        const base = baselineActionRef.current;
        const s = stateRef.current;
        let remoteChangesMerged = false;

        // Para cada bloco, se o usuário local NÃO alterou em relação ao baseline, mescla a versão da nuvem
        if ((s.leaderName || '').trim() === (base?.leaderName || '').trim() && latest.leaderName !== action.leaderName) {
          setLeaderName(latest.leaderName || latest.assignedAgentName || '');
          remoteChangesMerged = true;
        }

        const parsedLocalTeam = s.teamMembersInput.split(/[,;\n]+/).map((i) => i.trim()).filter(Boolean);
        if (JSON.stringify(parsedLocalTeam) === JSON.stringify(base?.teamMembers || []) && JSON.stringify(latest.teamMembers || []) !== JSON.stringify(action.teamMembers || [])) {
          setTeamMembersInput(latest.teamMembers && latest.teamMembers.length > 0 ? latest.teamMembers.join(', ') : '');
          remoteChangesMerged = true;
        }

        if ((s.problemStatement || '').trim() === (base?.problemStatement || '').trim() && latest.problemStatement !== action.problemStatement) {
          setProblemStatement(latest.problemStatement || '');
          remoteChangesMerged = true;
        }

        if (JSON.stringify(s.fiveWhys) === JSON.stringify(base?.fiveWhys || ['', '', '', '', '']) && JSON.stringify(latest.fiveWhys || []) !== JSON.stringify(action.fiveWhys || [])) {
          setFiveWhys(latest.fiveWhys && latest.fiveWhys.length === 5 ? latest.fiveWhys : ['', '', '', '', '']);
          remoteChangesMerged = true;
        }

        if (JSON.stringify(s.checklistItems) === JSON.stringify(base?.checklist || []) && JSON.stringify(latest.checklist || []) !== JSON.stringify(action.checklist || [])) {
          setChecklistItems(latest.checklist || []);
          remoteChangesMerged = true;
        }

        if (JSON.stringify(s.gainDetails || {}) === JSON.stringify(base?.gainDetails || {}) && JSON.stringify(latest.gainDetails || {}) !== JSON.stringify(action.gainDetails || {})) {
          const gDetails = latest.gainDetails || latest.controllershipAudit?.gainDetails || {};
          setGainDetails(JSON.parse(JSON.stringify(gDetails)));
          remoteChangesMerged = true;
        }

        if (JSON.stringify(s.attachments || []) === JSON.stringify(base?.attachments || []) && JSON.stringify(latest.attachments || []) !== JSON.stringify(action.attachments || [])) {
          setAttachments(latest.attachments || []);
          remoteChangesMerged = true;
        }

        if (
          JSON.stringify(s.operationalItems || []) === JSON.stringify(base?.projectCosts?.operationalItems || []) &&
          JSON.stringify(latest.projectCosts?.operationalItems || []) !== JSON.stringify(action.projectCosts?.operationalItems || [])
        ) {
          setOperationalItems(latest.projectCosts?.operationalItems ? JSON.parse(JSON.stringify(latest.projectCosts.operationalItems)) : []);
          remoteChangesMerged = true;
        }

        if (remoteChangesMerged) {
          setAction(latest);
          baselineActionRef.current = JSON.parse(JSON.stringify(latest));
          const author = latest.assignedAgentName || 'outro colaborador';
          setRemoteSyncNotification(`Alterações salvas por ${author} sincronizadas em tempo real.`);
          setTimeout(() => setRemoteSyncNotification(null), 5000);
        }
      }
    };

    syncIncomingRemote();
  }, [dataVersion, projectId, action]);

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

  // Transferir causa mais crítica do Ishikawa para o 1º Porquê
  const handleTransferIshikawaToFiveWhys = () => {
    if (!ishikawaRootCause || !ishikawaRootCause.trim()) return;
    const updated = [...fiveWhys];
    updated[0] = ishikawaRootCause.trim();
    setFiveWhys(updated);
  };

  // Gerar ação de contramedida 5W2H direta a partir da causa raiz identificada
  const handleGenerateActionFromRootCause = (causeText: string) => {
    const finalCause =
      causeText.trim() ||
      ishikawaRootCause.trim() ||
      fiveWhys[4]?.trim() ||
      'Causa raiz diagnosticada';
    const newItem: ActionChecklistItem = {
      id: `chk-${Date.now()}`,
      label: `[Contramedida] Eliminar causa raiz: ${finalCause}`,
      completed: false,
      responsibleName: leaderName || currentUser?.name || 'Líder Kaizen',
      responsibleSectorName: action?.originSectorName || 'Fábrica',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      observations: `Ação gerada automaticamente a partir do diagnóstico de Causa Raiz. Investigação: ${finalCause}`,
    };
    setChecklistItems((prev) => [...prev, newItem]);
    handleSelectStage('do');
  };

  const handleSelectStage = (stage: PDCAMethodologyStage) => {
    setActiveTab(stage);
    if (action) {
      const fresh = dataService.updateAction(action.id, { pdcaStage: stage });
      if (fresh) setAction(fresh);
    }
  };

  const handleIshikawaFieldChange = (field: string, val: string) => {
    switch (field) {
      case 'method':
        setIshikawaMethod(val);
        break;
      case 'machine':
        setIshikawaMachine(val);
        break;
      case 'material':
        setIshikawaMaterial(val);
        break;
      case 'manpower':
        setIshikawaManpower(val);
        break;
      case 'measurement':
        setIshikawaMeasurement(val);
        break;
      case 'environment':
        setIshikawaEnvironment(val);
        break;
      case 'primaryRootCause':
        setIshikawaRootCause(val);
        break;
    }
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

  // Dynamic Calculated Financials (Modelo Contábil-Corporativo de Lucro Real / CPC 27)
  const grossInvestmentCost =
    (Number(partsAndEquipment) || 0) +
    (Number(thirdPartyServices) || 0) +
    (Number(internalLaborHours) || 0) * (Number(laborHourlyRate) || 0) +
    (Number(otherCosts) || 0);

  const numIcmsCredit = Number(icmsCredit) || 0;
  const numPisRate = pisCofinsRate !== '' ? Number(pisCofinsRate) : 22.0;
  const numPisCredit =
    pisCofinsCredit !== ''
      ? Number(pisCofinsCredit)
      : Math.round(grossInvestmentCost * (numPisRate / 100));

  const netInvestmentCost = Math.max(0, grossInvestmentCost - numIcmsCredit - numPisCredit);

  const numFinancialRate = financialRate !== '' ? Number(financialRate) : 1.0;
  const numDeprMonths = Number(depreciationMonths) > 0 ? Number(depreciationMonths) : 60;
  const numTaxRate = incomeTaxRate !== '' ? Number(incomeTaxRate) : 34.0;
  const taxFactor = numTaxRate / 100;

  // 7 Fontes Tradicionais
  const total7SourcesSavings =
    (Number(machineDowntime) || 0) +
    (Number(laborSavings) || 0) +
    (Number(scrapReduction) || 0) +
    (Number(toolingAndEnergy) || 0) +
    (Number(logisticsAndFreight) || 0) +
    (Number(productionIncrease) || 0) +
    (Number(otherSavings) || 0);

  // Outras Despesas Operacionais Recorrentes decorrentes do projeto (-)
  const operationalCostsMonthly = operationalItems
    .filter((it) => it.type === 'custo' || Number(it.monthlyValue) < 0)
    .reduce((acc, it) => acc + Math.abs(Number(it.monthlyValue) || 0), 0);

  // Fluxo Operacional Mensal da Melhoria (Ganhos Brutos das 7 Fontes deduzidos de Outras Despesas Recorrentes)
  const grossMonthly7Sources = total7SourcesSavings > 0 ? total7SourcesSavings / 12 : 0;
  const grossMonthlyOperationalGain = Math.max(0, grossMonthly7Sources - operationalCostsMonthly);

  const totalGrossSavings = total7SourcesSavings;

  const incomeTaxOnGainMonthly =
    grossMonthlyOperationalGain > 0 ? Math.round(grossMonthlyOperationalGain * taxFactor) : 0;

  const netOperationalGainMonthly = grossMonthlyOperationalGain - incomeTaxOnGainMonthly;

  const monthlyDepreciation = netInvestmentCost > 0 ? netInvestmentCost / numDeprMonths : 0;
  const taxShieldDepreciationMonthly = Math.round(monthlyDepreciation * taxFactor);

  const finalNetMonthlyCashFlow = Math.round(netOperationalGainMonthly + taxShieldDepreciationMonthly);

  const simplePaybackMonths =
    finalNetMonthlyCashFlow > 0 && netInvestmentCost > 0
      ? Number((netInvestmentCost / finalNetMonthlyCashFlow).toFixed(1))
      : 0;

  let discountedPaybackMonths = simplePaybackMonths;
  if (finalNetMonthlyCashFlow > 0 && netInvestmentCost > 0 && numFinancialRate > 0) {
    const i = numFinancialRate / 100;
    const cover = (netInvestmentCost * i) / finalNetMonthlyCashFlow;
    if (cover < 1) {
      discountedPaybackMonths = Number((-Math.log(1 - cover) / Math.log(1 + i)).toFixed(1));
    } else {
      discountedPaybackMonths = 999;
    }
  }

  // Compatibilidade com variáveis existentes
  const totalInvestmentCost = netInvestmentCost > 0 ? netInvestmentCost : grossInvestmentCost;
  const paybackMonths = simplePaybackMonths;
  const netSavings = Math.max(0, finalNetMonthlyCashFlow * 12 - totalInvestmentCost);
  const roiPercentage =
    totalInvestmentCost > 0 ? Math.round((netSavings / totalInvestmentCost) * 100) : 0;
  const monthlyGrossSavings = grossMonthlyOperationalGain;

  // Governança Diretoria: Retorno Mensal (Média 3M) × 12 Meses & Ciclo Anual (365 Dias)
  const provenMonthlySavings =
    action?.quarterlyFollowUp?.averageCostAvoided ||
    (finalNetMonthlyCashFlow > 0 ? finalNetMonthlyCashFlow : totalGrossSavings > 0 ? Math.round(totalGrossSavings / 12) : 0);
  const provenAnnualSavings = provenMonthlySavings * 12;
  const provenNetAnnualSavings = Math.max(0, provenAnnualSavings - totalInvestmentCost);
  const provenNetMonthlySavings = Math.round(provenNetAnnualSavings / 12);

  // Governança Corporativa: Regra de Ganho Monetário e Auditoria da Controladoria
  const hasMonetaryGain = Boolean(
    totalGrossSavings > 0 ||
    (Number(action?.actualCostAvoided) || 0) > 0 ||
    (Number(action?.estimatedCostAvoided) || 0) > 0 ||
    (Number(action?.controllershipAudit?.originalEstimatedCostAvoided) || 0) > 0 ||
    (action?.quarterlyFollowUp?.averageCostAvoided && action.quarterlyFollowUp.averageCostAvoided > 0)
  );

  const identifiedGainValue =
    totalGrossSavings > 0
      ? totalGrossSavings
      : (Number(action?.actualCostAvoided) || 0) > 0
      ? Number(action?.actualCostAvoided)
      : action?.controllershipAudit?.approvedEstimatedCostAvoided ||
        action?.controllershipAudit?.originalEstimatedCostAvoided ||
        Number(action?.estimatedCostAvoided) ||
        0;

  const isControllershipApproved = Boolean(
    action?.controllershipAudit?.status === 'aprovado' ||
    action?.controllershipAudit?.status === 'ajustado_e_aprovado'
  );

  const isControllershipSatisfied = !hasMonetaryGain || isControllershipApproved;

  const homologatedAtDate =
    action?.masterApprovedAt ||
    action?.completedAt ||
    (action?.status === 'concluida' ? action?.updatedAt : undefined);
  const daysSinceHomologation = homologatedAtDate
    ? Math.max(0, Math.floor((Date.now() - new Date(homologatedAtDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isCycleExpired = daysSinceHomologation > 365;
  const currentCycleMonth = isCycleExpired ? 12 : Math.min(12, Math.max(1, Math.ceil(daysSinceHomologation / 30.4375)));
  const remainingCycleMonths = isCycleExpired ? 0 : Math.max(0, 12 - currentCycleMonth);

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

  // Gestão de Outras Despesas Operacionais Recorrentes (-) decorrentes do projeto
  const handleAddCostItem = () => {
    const newItem: OperationalCashFlowItem = {
      id: `cost_${Date.now()}`,
      type: 'custo',
      description: '',
      quantity: 1,
      unitValue: 0,
      monthlyValue: 0,
    };
    const updated = [...operationalItems, newItem];
    setOperationalItems(updated);
    setSaveStatus('unsaved');
  };

  const handleUpdateOperationalItem = (id: string, patch: Partial<OperationalCashFlowItem>) => {
    const updated = operationalItems.map((item) => {
      if (item.id !== id) return item;
      const merged = { ...item, ...patch };
      if (patch.quantity !== undefined || patch.unitValue !== undefined) {
        const qty = Number(merged.quantity) || 0;
        const unit = Number(merged.unitValue) || 0;
        merged.monthlyValue = Number((qty * unit).toFixed(2));
      }
      return merged;
    });
    setOperationalItems(updated);
    setSaveStatus('unsaved');
  };

  const handleRemoveOperationalItem = (id: string) => {
    const updated = operationalItems.filter((item) => item.id !== id);
    setOperationalItems(updated);
    setSaveStatus('unsaved');
  };

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
    icmsCredit,
    pisCofinsRate,
    pisCofinsCredit,
    financialRate,
    depreciationMonths,
    incomeTaxRate,
    operationalItems,
    grossInvestmentCost,
    netInvestmentCost,
    grossMonthlyOperationalGain,
    incomeTaxOnGainMonthly,
    netOperationalGainMonthly,
    monthlyDepreciation,
    taxShieldDepreciationMonthly,
    finalNetMonthlyCashFlow,
    simplePaybackMonths,
    discountedPaybackMonths,
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
    gainDetails,
    isOneOffGain,
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
      icmsCredit,
      pisCofinsRate,
      pisCofinsCredit,
      financialRate,
      depreciationMonths,
      incomeTaxRate,
      operationalItems,
      grossInvestmentCost,
      netInvestmentCost,
      grossMonthlyOperationalGain,
      incomeTaxOnGainMonthly,
      netOperationalGainMonthly,
      monthlyDepreciation,
      taxShieldDepreciationMonthly,
      finalNetMonthlyCashFlow,
      simplePaybackMonths,
      discountedPaybackMonths,
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
      gainDetails,
      isOneOffGain,
      standardWorkUpdated,
      standardWorkDocRef,
      yokotenReplication,
      lessonsLearned,
    };
  });

  const executeSave = useCallback(() => {
    if (!projectId || isViewer) return;
    const s = stateRef.current;
    const base = baselineActionRef.current;

    // Obter o estado atual mais recente da base para não sobrescrever edições remotas
    const latestDbAction = dataService.getActionById(projectId) || action;
    if (!latestDbAction) return;

    const parsedTeamMembers = s.teamMembersInput
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    // Detecção cirúrgica de campos que sofreram alteração local em relação ao baseline do usuário
    const isLeaderDirty = (s.leaderName || '').trim() !== (base?.leaderName || '').trim();
    const isTeamDirty = JSON.stringify(parsedTeamMembers) !== JSON.stringify(base?.teamMembers || []);
    const isProblemDirty = (s.problemStatement || '').trim() !== (base?.problemStatement || '').trim();
    const isTargetMetricNameDirty = (s.targetMetricName || '').trim() !== (base?.targetMetricName || '').trim();
    const isTargetMetricUnitDirty = (s.targetMetricUnit || '').trim() !== (base?.targetMetricUnit || '').trim();
    const isBaselineValueDirty = s.baselineValue !== '' && Number(s.baselineValue) !== Number(base?.baselineValue);
    const isTargetGoalDirty = s.targetGoalValue !== '' && Number(s.targetGoalValue) !== Number(base?.targetGoalValue);
    const isAchievedDirty = s.achievedValue !== '' && Number(s.achievedValue) !== Number(base?.achievedValue);
    const isCurrentProblemCostDirty = s.currentProblemCostMonthly !== '' && Number(s.currentProblemCostMonthly) !== Number(base?.currentProblemCostMonthly);
    const isFiveWhysDirty = JSON.stringify(s.fiveWhys) !== JSON.stringify(base?.fiveWhys || ['', '', '', '', '']);
    const isChecklistDirty = JSON.stringify(s.checklistItems) !== JSON.stringify(base?.checklist || []);
    const isPilotAreaDirty = (s.pilotArea || '').trim() !== (base?.pilotArea || '').trim();
    const isPilotObsDirty = (s.pilotTestObservations || '').trim() !== (base?.pilotTestObservations || '').trim();
    const isPhotoBeforeDirty = s.photoBeforeUrl !== (base?.photoBeforeUrl || '');
    const isPhotoAfterDirty = s.photoAfterUrl !== (base?.photoAfterUrl || '');
    const isGainDetailsDirty = JSON.stringify(s.gainDetails || {}) !== JSON.stringify(base?.gainDetails || {});
    const isAttachmentsDirty = JSON.stringify(s.attachments || []) !== JSON.stringify(base?.attachments || []);
    const isStandardWorkDirty = s.standardWorkUpdated !== !!base?.standardWorkUpdated || (s.standardWorkDocRef || '').trim() !== (base?.standardWorkDocRef || '').trim();
    const isYokotenDirty = (s.yokotenReplication || '').trim() !== (base?.yokotenReplication || '').trim();
    const isLessonsDirty = (s.lessonsLearned || '').trim() !== (base?.lessonsLearned || '').trim();
    const isOneOffDirty = s.isOneOffGain !== Boolean(base?.isOneOffGain);

    const isCostsDirty =
      s.partsAndEquipment !== (base?.projectCosts?.partsAndEquipment || '') ||
      s.thirdPartyServices !== (base?.projectCosts?.thirdPartyServices || '') ||
      s.internalLaborHours !== (base?.projectCosts?.internalLaborHours || '') ||
      s.laborHourlyRate !== (base?.projectCosts?.laborHourlyRate || 45) ||
      s.otherCosts !== (base?.projectCosts?.otherCosts || '') ||
      s.icmsCredit !== (base?.projectCosts?.icmsCredit !== undefined ? base.projectCosts.icmsCredit : '') ||
      s.pisCofinsRate !== (base?.projectCosts?.pisCofinsRate !== undefined ? base.projectCosts.pisCofinsRate : 22) ||
      s.pisCofinsCredit !== (base?.projectCosts?.pisCofinsCredit !== undefined ? base.projectCosts.pisCofinsCredit : '') ||
      s.financialRate !== (base?.projectCosts?.financialRate !== undefined ? base.projectCosts.financialRate : 1.0) ||
      s.depreciationMonths !== (base?.projectCosts?.depreciationMonths !== undefined ? base.projectCosts.depreciationMonths : 60) ||
      s.incomeTaxRate !== (base?.projectCosts?.incomeTaxRate !== undefined ? base.projectCosts.incomeTaxRate : 34) ||
      JSON.stringify(s.operationalItems || []) !== JSON.stringify(base?.projectCosts?.operationalItems || []);

    const isBreakdownDirty =
      s.machineDowntime !== (base?.costBreakdown?.machineDowntime || '') ||
      s.laborSavings !== (base?.costBreakdown?.laborSavings || '') ||
      s.scrapReduction !== (base?.costBreakdown?.scrapReduction || '') ||
      s.toolingAndEnergy !== (base?.costBreakdown?.toolingAndEnergy || '') ||
      s.logisticsAndFreight !== (base?.costBreakdown?.logisticsAndFreight || '') ||
      s.productionIncrease !== (base?.costBreakdown?.productionIncrease || '') ||
      s.otherSavings !== (base?.costBreakdown?.otherSavings || '');

    const isIshikawaDirty =
      (s.ishikawaMethod || '').trim() !== (base?.ishikawa?.method || '').trim() ||
      (s.ishikawaMachine || '').trim() !== (base?.ishikawa?.machine || '').trim() ||
      (s.ishikawaMaterial || '').trim() !== (base?.ishikawa?.material || '').trim() ||
      (s.ishikawaManpower || '').trim() !== (base?.ishikawa?.manpower || '').trim() ||
      (s.ishikawaMeasurement || '').trim() !== (base?.ishikawa?.measurement || '').trim() ||
      (s.ishikawaEnvironment || '').trim() !== (base?.ishikawa?.environment || '').trim() ||
      (s.ishikawaRootCause || '').trim() !== (base?.ishikawa?.primaryRootCause || '').trim();

    const isParetoDirty =
      s.paretoImageUrl !== (base?.pareto?.chartImageUrl || '') ||
      (s.paretoVitalCauses || '').trim() !== (base?.pareto?.vitalCausesSummary || '').trim() ||
      s.paretoCumulativePercent !== (base?.pareto?.cumulativeImpactPercentage !== undefined ? base.pareto.cumulativeImpactPercentage : 80);

    const anyDirty =
      isLeaderDirty || isTeamDirty || isProblemDirty || isTargetMetricNameDirty || isTargetMetricUnitDirty ||
      isBaselineValueDirty || isTargetGoalDirty || isAchievedDirty || isCurrentProblemCostDirty ||
      isFiveWhysDirty || isChecklistDirty || isPilotAreaDirty || isPilotObsDirty || isPhotoBeforeDirty ||
      isPhotoAfterDirty || isGainDetailsDirty || isAttachmentsDirty || isStandardWorkDirty ||
      isYokotenDirty || isLessonsDirty || isOneOffDirty || isCostsDirty || isBreakdownDirty ||
      isIshikawaDirty || isParetoDirty;

    // Se nenhum campo foi alterado localmente, encerra sem tocar no banco/nuvem
    if (!anyDirty && base) {
      setSaveStatus('saved');
      return;
    }

    // Criar payload de atualização cirúrgica preservando tudo o que a equipe editou remotamente
    const updates: Partial<LeanAction> = {};

    if (isLeaderDirty) updates.leaderName = s.leaderName.trim() || undefined;
    if (isTeamDirty) updates.teamMembers = parsedTeamMembers.length > 0 ? parsedTeamMembers : undefined;
    if (isProblemDirty) updates.problemStatement = s.problemStatement;
    if (isTargetMetricNameDirty) updates.targetMetricName = s.targetMetricName;
    if (isTargetMetricUnitDirty) updates.targetMetricUnit = s.targetMetricUnit;
    if (isBaselineValueDirty) updates.baselineValue = s.baselineValue === '' ? undefined : Number(s.baselineValue);
    if (isTargetGoalDirty) updates.targetGoalValue = s.targetGoalValue === '' ? undefined : Number(s.targetGoalValue);
    if (isAchievedDirty) updates.achievedValue = s.achievedValue === '' ? undefined : Number(s.achievedValue);
    if (isCurrentProblemCostDirty) updates.currentProblemCostMonthly = s.currentProblemCostMonthly === '' ? undefined : Number(s.currentProblemCostMonthly);
    if (isFiveWhysDirty) updates.fiveWhys = s.fiveWhys;
    if (isChecklistDirty) updates.checklist = s.checklistItems;
    if (isPilotAreaDirty) updates.pilotArea = s.pilotArea;
    if (isPilotObsDirty) updates.pilotTestObservations = s.pilotTestObservations;
    if (isPhotoBeforeDirty) updates.photoBeforeUrl = s.photoBeforeUrl;
    if (isPhotoAfterDirty) updates.photoAfterUrl = s.photoAfterUrl;
    if (isAttachmentsDirty) updates.attachments = s.attachments;
    if (isStandardWorkDirty) {
      updates.standardWorkUpdated = s.standardWorkUpdated;
      updates.standardWorkDocRef = s.standardWorkDocRef;
    }
    if (isYokotenDirty) updates.yokotenReplication = s.yokotenReplication;
    if (isLessonsDirty) updates.lessonsLearned = s.lessonsLearned;
    if (isOneOffDirty) updates.isOneOffGain = s.isOneOffGain;

    if (isIshikawaDirty) {
      updates.ishikawa = {
        ...(latestDbAction?.ishikawa || {}),
        method: s.ishikawaMethod.trim() || undefined,
        machine: s.ishikawaMachine.trim() || undefined,
        material: s.ishikawaMaterial.trim() || undefined,
        manpower: s.ishikawaManpower.trim() || undefined,
        measurement: s.ishikawaMeasurement.trim() || undefined,
        environment: s.ishikawaEnvironment.trim() || undefined,
        primaryRootCause: s.ishikawaRootCause.trim() || undefined,
      };
    }

    if (isParetoDirty) {
      updates.pareto = {
        chartImageUrl: s.paretoImageUrl,
        chartImageName: s.paretoImageName,
        vitalCausesSummary: s.paretoVitalCauses,
        cumulativeImpactPercentage: s.paretoCumulativePercent === '' ? 80 : Number(s.paretoCumulativePercent),
      };
    }

    if (isCostsDirty) {
      updates.projectCosts = {
        partsAndEquipment: s.partsAndEquipment !== '' ? Number(s.partsAndEquipment) : undefined,
        thirdPartyServices: s.thirdPartyServices !== '' ? Number(s.thirdPartyServices) : undefined,
        internalLaborHours: s.internalLaborHours !== '' ? Number(s.internalLaborHours) : undefined,
        laborHourlyRate: s.laborHourlyRate !== '' ? Number(s.laborHourlyRate) : 45,
        otherCosts: s.otherCosts !== '' ? Number(s.otherCosts) : undefined,
        totalCost: s.grossInvestmentCost,
        icmsCredit: s.icmsCredit !== '' ? Number(s.icmsCredit) : undefined,
        pisCofinsRate: s.pisCofinsRate !== '' ? Number(s.pisCofinsRate) : 22,
        pisCofinsCredit: s.pisCofinsCredit !== '' ? Number(s.pisCofinsCredit) : undefined,
        netInvestmentCost: s.netInvestmentCost,
        financialRate: s.financialRate !== '' ? Number(s.financialRate) : 1.0,
        depreciationMonths: s.depreciationMonths !== '' ? Number(s.depreciationMonths) : 60,
        incomeTaxRate: s.incomeTaxRate !== '' ? Number(s.incomeTaxRate) : 34,
        grossOperationalGainMonthly: s.grossMonthlyOperationalGain,
        incomeTaxOnGainMonthly: s.incomeTaxOnGainMonthly,
        netOperationalGainMonthly: s.netOperationalGainMonthly,
        monthlyDepreciation: s.monthlyDepreciation,
        taxShieldDepreciationMonthly: s.taxShieldDepreciationMonthly,
        finalNetMonthlyCashFlow: s.finalNetMonthlyCashFlow,
        simplePaybackMonths: s.simplePaybackMonths,
        discountedPaybackMonths: s.discountedPaybackMonths,
        roiAnnualPercentage: s.roiPercentage,
        operationalItems: s.operationalItems,
      };
      updates.paybackMonths = s.simplePaybackMonths;
      updates.netSavings = s.netSavings;
      updates.roiPercentage = s.roiPercentage;
    }

    if (isBreakdownDirty) {
      updates.costBreakdown = {
        machineDowntime: s.machineDowntime !== '' ? Number(s.machineDowntime) : undefined,
        laborSavings: s.laborSavings !== '' ? Number(s.laborSavings) : undefined,
        scrapReduction: s.scrapReduction !== '' ? Number(s.scrapReduction) : undefined,
        toolingAndEnergy: s.toolingAndEnergy !== '' ? Number(s.toolingAndEnergy) : undefined,
        logisticsAndFreight: s.logisticsAndFreight !== '' ? Number(s.logisticsAndFreight) : undefined,
        productionIncrease: s.productionIncrease !== '' ? Number(s.productionIncrease) : undefined,
        otherSavings: s.otherSavings !== '' ? Number(s.otherSavings) : undefined,
      };
      updates.actualCostAvoided = s.totalGrossSavings;
      updates.netSavings = s.netSavings;
      updates.roiPercentage = s.roiPercentage;
      updates.paybackMonths = s.paybackMonths;
    }

    if (isGainDetailsDirty) {
      const safeGainDetails: Record<string, GainProofDetail> = {
        ...(latestDbAction?.gainDetails || {}),
        ...(s.gainDetails || {}),
      };
      Object.keys(latestDbAction?.gainDetails || {}).forEach((cat) => {
        if (latestDbAction.gainDetails?.[cat]?.attachment && !safeGainDetails[cat]?.attachment) {
          safeGainDetails[cat] = {
            ...safeGainDetails[cat],
            attachment: latestDbAction.gainDetails[cat].attachment,
          };
        }
      });
      updates.gainDetails = safeGainDetails;
    }

    if (Object.keys(updates).length === 0) {
      setSaveStatus('saved');
      return;
    }

    lastLocalSaveTimestampRef.current = Date.now();
    const fresh = dataService.updateAction(projectId, updates);
    if (fresh) {
      setAction(fresh);
      baselineActionRef.current = JSON.parse(JSON.stringify(fresh));
    }

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
    gainDetails,
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
    if (!files || files.length === 0 || !action || isViewer) return;
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
    if (!files || files.length === 0 || !action || isViewer) return;
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

  const handleUpdateStrategicObjective = async (objectiveId: string) => {
    if (!action || isViewer) return;
    const allObjectives = dataService.getStrategicObjectives();
    const targetObj = allObjectives.find((o) => o.id === objectiveId);
    if (targetObj) {
      try {
        const audit = await evaluateProjectStrategicAlignment(action, targetObj);
        const updated = dataService.updateAction(action.id, {
          strategicObjectiveId: targetObj.id,
          strategicObjectiveName: `${targetObj.code} - ${targetObj.title}`,
          senseiStrategicAudit: audit,
        });
        setAction(updated);
        refreshData();
      } catch {
        const updated = dataService.updateAction(action.id, {
          strategicObjectiveId: targetObj.id,
          strategicObjectiveName: `${targetObj.code} - ${targetObj.title}`,
        });
        setAction(updated);
        refreshData();
      }
    } else {
      const updated = dataService.updateAction(action.id, {
        strategicObjectiveId: undefined,
        strategicObjectiveName: undefined,
        senseiStrategicAudit: undefined,
      });
      setAction(updated);
      refreshData();
    }
  };

  const handleRecalculateStrategicAdherence = () => {
    if (!action) return;
    const updated = dataService.recalculateActionStrategicAdherence(action.id);
    if (updated) {
      setAction(updated);
      refreshData();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleAgentSubmitForApproval = () => {
    if (!action || isViewer) return;

    // Bloqueio Poka-Yoke 1: Atividades 5W2H pendentes
    if (uncompletedActivities.length > 0) {
      alert(
        `SUBMISSÃO BLOQUEADA!\n\nExistem ${uncompletedActivities.length} atividade(s) do Plano de Ação 5W2H pendentes de conclusão:\n${uncompletedActivities
          .map((u) => `• ${u.label} (${u.responsibleName || 'Sem responsável'})`)
          .join('\n')}\n\nConclua todas as etapas 5W2H no Passo 2 antes de submeter o projeto para homologação master.`
      );
      return;
    }

    // Bloqueio Poka-Yoke 2: Regra de Governança Corporativa da Controladoria
    if (hasMonetaryGain && !isControllershipApproved) {
      if (!action.controllershipAudit) {
        alert(
          `SUBMISSÃO BLOQUEADA PELA CONTROLADORIA!\n\nEste projeto possui ganhos monetários identificados no valor de ${formatCurrency(identifiedGainValue)}.\n\nRegra Obrigatória: Projetos com retorno financeiro devem ser submetidos à Controladoria e homologados pelo auditor contábil no Passo 4.2b antes do envio para Homologação Master.`
        );
      } else if (action.controllershipAudit.status === 'pendente') {
        alert(
          `AGUARDANDO PARECER DA CONTROLADORIA!\n\nO projeto foi enviado para a Controladoria e está sob análise do auditor contábil.\n\nAssim que os ganhos forem homologados no portal, a submissão para Homologação Master será liberada.`
        );
      } else if (action.controllershipAudit.status === 'rejeitado') {
        alert(
          `PARECER DA CONTROLADORIA PENDENTE DE AJUSTES!\n\nA Controladoria solicitou revisão das premissas financeiras:\n"${action.controllershipAudit.rejectionReason || 'Revisão necessária'}".\n\nPor favor, revise os cálculos no Passo 4.2b e ressubmeta à Controladoria.`
        );
      }
      return;
    }

    // Se ainda não tinha diretriz vinculada, o Sensei IA conecta automaticamente
    let currentObjectiveId = action.strategicObjectiveId;
    let currentObjectiveName = action.strategicObjectiveName;
    let audit = action.senseiStrategicAudit;

    if (!currentObjectiveId) {
      const matched = dataService.autoMatchStrategicObjective(action);
      if (matched) {
        currentObjectiveId = matched.id;
        currentObjectiveName = `${matched.code} - ${matched.title}`;
        audit = dataService.calculateActionStrategicAdherence(action, matched);
      }
    }

    const updated = dataService.updateAction(action.id, {
      status: 'aguardando_aprovacao',
      submittedForApproval: true,
      submittedForApprovalAt: new Date().toISOString(),
      submittedForApprovalBy: currentUser?.name || action.assignedAgentName || 'Agente Lean',
      strategicObjectiveId: currentObjectiveId,
      strategicObjectiveName: currentObjectiveName,
      senseiStrategicAudit: audit || action.senseiStrategicAudit,
    });
    setAction(updated);
    refreshData();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handleMasterApprove = async () => {
    if (!action || isViewer) return;

    // Bloqueio Poka-Yoke 1: Atividades 5W2H pendentes
    if (uncompletedActivities.length > 0) {
      alert(
        `HOMOLOGAÇÃO BLOQUEADA!\n\nNão é possível homologar o projeto pois existem ${uncompletedActivities.length} atividade(s) 5W2H pendentes de conclusão:\n${uncompletedActivities
          .map((u) => `• ${u.label} (${u.responsibleName || 'Sem responsável'})`)
          .join('\n')}\n\nTodas as ações 5W2H devem estar finalizadas para a homologação técnica e auditoria.`
      );
      return;
    }

    // Bloqueio Poka-Yoke 2: Regra de Governança Corporativa da Controladoria
    if (hasMonetaryGain && !isControllershipApproved) {
      if (!action.controllershipAudit) {
        alert(
          `HOMOLOGAÇÃO MASTER BLOQUEADA!\n\nEste projeto possui ganhos monetários identificados (${formatCurrency(identifiedGainValue)}). Pela política corporativa, é OBRIGATÓRIO submeter à Controladoria e obter a certificação contábil no Passo 4.2b antes da validação final do Gestor Master.`
        );
      } else if (action.controllershipAudit.status === 'pendente') {
        alert(
          `AGUARDANDO PARECER DA CONTROLADORIA!\n\nA homologação master não pode ser realizada enquanto a Controladoria não emitir o parecer de certificação dos ganhos financeiros.\n\nNotificação enviada para: ${action.controllershipAudit.emailSentTo || 'auditor'}.`
        );
      } else if (action.controllershipAudit.status === 'rejeitado') {
        alert(
          `HOMOLOGAÇÃO BLOQUEADA PELA CONTROLADORIA!\n\nMotivo da recusa contábil: "${action.controllershipAudit.rejectionReason}".\n\nO projeto precisa ter suas premissas ajustadas no Passo 4.2b antes da validação final.`
        );
      }
      return;
    }

    let currentObjectiveId = action.strategicObjectiveId;
    let currentObjectiveName = action.strategicObjectiveName;
    let audit = action.senseiStrategicAudit;

    if (!currentObjectiveId) {
      const matched = dataService.autoMatchStrategicObjective(action);
      if (matched) {
        currentObjectiveId = matched.id;
        currentObjectiveName = `${matched.code} - ${matched.title}`;
        audit = dataService.calculateActionStrategicAdherence(action, matched);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const isOneOff = Boolean(isOneOffGain || action.isOneOffGain);

    let finalAnnualCostAvoided = 0;
    let followUpToSave: QuarterlyFollowUp | undefined = undefined;

    if (isOneOff) {
      // Ganho Pontual Único: contabilizado integralmente no mês de homologação (NÃO multiplicado por 12)
      finalAnnualCostAvoided = identifiedGainValue || totalGrossSavings || action.actualCostAvoided || action.estimatedCostAvoided || 0;
      followUpToSave = {
        enabled: false,
        isOneOffGain: true,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'consolidado',
        isCompleted: true,
        isFullYearCompleted: true,
        monthsFilledCount: 12,
        averageCostAvoided: 0,
        totalRealizedCostAvoided: finalAnnualCostAvoided,
        totalProjectedCostAvoided: finalAnnualCostAvoided,
        month1: {
          monthNumber: 1,
          monthLabel: 'Mês de Homologação (Ganho Pontual Único)',
          value: finalAnnualCostAvoided,
          measuredAt: today,
          notes: 'Ganho financeiro pontual único certificado na homologação. Ciclo consolidado sem necessidade de acompanhamento recorrente.',
          registeredBy: currentUser?.name || 'Gestão Master',
        },
      };
    } else {
      const monthlyAverage = action.quarterlyFollowUp?.averageCostAvoided || (totalGrossSavings > 0 ? Math.round(totalGrossSavings / 12) : 0) || action.actualCostAvoided || action.estimatedCostAvoided;
      finalAnnualCostAvoided = Math.round(monthlyAverage * 12);
      followUpToSave = action.quarterlyFollowUp || (hasMonetaryGain ? {
        enabled: true,
        startedAt: new Date().toISOString(),
        month1: { monthNumber: 1, monthLabel: '1º Mês' },
        month2: { monthNumber: 2, monthLabel: '2º Mês' },
        month3: { monthNumber: 3, monthLabel: '3º Mês' },
        status: 'aguardando_mes_1',
        isCompleted: false,
        monthsFilledCount: 0,
        averageCostAvoided: monthlyAverage || 0,
      } : undefined);
    }

    if (!audit && currentObjectiveId) {
      const obj = dataService.getStrategicObjectiveById(currentObjectiveId);
      if (obj) {
        try {
          audit = await evaluateProjectStrategicAlignment(action, obj);
        } catch {
          audit = dataService.calculateActionStrategicAdherence(action, obj);
        }
      }
    }

    const updated = dataService.updateAction(action.id, {
      status: 'concluida',
      pdcaStage: 'act',
      completedAt: new Date().toISOString(),
      conclusionDate: today,
      masterApproved: true,
      masterApprovedAt: new Date().toISOString(),
      masterApprovedBy: currentUser?.name || 'Gestão Master',
      isOneOffGain: isOneOff,
      actualCostAvoided: finalAnnualCostAvoided,
      quarterlyFollowUp: followUpToSave,
      strategicObjectiveId: currentObjectiveId,
      strategicObjectiveName: currentObjectiveName,
      senseiStrategicAudit: audit || action.senseiStrategicAudit,
    });
    if (updated) {
      await dataService.persistActionToCloud(updated);
      setAction(updated);
    }
    refreshData();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  // Manipulação de Memórias de Cálculo por Tipo de Ganho (Auditoria Controladoria)
  const handleGainFileUpload = async (
    category: string,
    categoryLabel: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !action) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('O arquivo selecionado excede o limite máximo permitido de 15 MB.');
      e.target.value = '';
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    try {
      // Upload para o bucket project-attachments (ou fallback local)
      const uploadedUrl = await dataService.uploadAttachmentFile(file, `actions/${action.id}/gains`);
      const newAttachment: GainProofAttachment = {
        id: 'att_gain_' + Date.now(),
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted,
        fileType: file.type || 'application/octet-stream',
        url: uploadedUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.name || action.assignedAgentName || 'Agente Lean',
      };

      const current = gainDetails[category] || {
        category,
        categoryLabel,
        value: 0,
        explanation: '',
      };
      const updated = {
        ...gainDetails,
        [category]: {
          ...current,
          categoryLabel,
          attachment: newAttachment,
        },
      };

      setGainDetails(updated);
      stateRef.current.gainDetails = updated;
      if (baselineActionRef.current) {
        baselineActionRef.current.gainDetails = JSON.parse(JSON.stringify(updated));
      }
      lastLocalSaveTimestampRef.current = Date.now();

      const fresh = dataService.updateAction(action.id, { gainDetails: updated });
      if (fresh) {
        setAction(fresh);
        baselineActionRef.current = JSON.parse(JSON.stringify(fresh));
      }
    } catch (err) {
      console.warn('Erro ao atualizar anexo de ganho:', err);
      alert('Erro ao processar anexo. Tente novamente.');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveGainFile = async (category: string) => {
    if (!action) return;
    const current = gainDetails[category];
    if (!current) return;
    const updated = { ...gainDetails };
    delete updated[category].attachment;

    setGainDetails(updated);
    stateRef.current.gainDetails = updated;
    if (baselineActionRef.current?.gainDetails) {
      baselineActionRef.current.gainDetails = JSON.parse(JSON.stringify(updated));
    }
    lastLocalSaveTimestampRef.current = Date.now();

    try {
      const fresh = dataService.updateAction(action.id, { gainDetails: updated });
      if (fresh) {
        setAction(fresh);
        baselineActionRef.current = JSON.parse(JSON.stringify(fresh));
      }
    } catch (err) {
      console.warn('Erro ao remover anexo de ganho:', err);
    }
  };

  const handleGainExplanationChange = (category: string, categoryLabel: string, text?: string) => {
    const finalLabel = text !== undefined ? categoryLabel : category;
    const finalText = text !== undefined ? text : categoryLabel;
    setGainDetails((prev) => {
      const current = prev[category] || {
        category,
        categoryLabel: finalLabel,
        value: 0,
        explanation: '',
      };
      return {
        ...prev,
        [category]: {
          ...current,
          categoryLabel: finalLabel || current.categoryLabel,
          explanation: finalText,
        },
      };
    });
  };

  const handleDownloadGainAttachment = (att: GainProofAttachment) => {
    if (!att.url) return;
    const a = document.createElement('a');
    a.href = att.url;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  // Submissão & Governança da Controladoria
  const [submittingControladoria, setSubmittingControladoria] = useState(false);
  const [copiedAuditLink, setCopiedAuditLink] = useState(false);

  const handleSubmeterControladoria = async () => {
    if (!action) return;

    // Bloqueio Poka-Yoke: Atividades 5W2H pendentes
    if (uncompletedActivities.length > 0) {
      alert(
        `SUBMISSÃO BLOQUEADA!\n\nNão é permitido enviar ganhos para a Controladoria enquanto houver atividades do Plano de Ação 5W2H pendentes de conclusão.\n\nAtividades pendentes (${uncompletedActivities.length}):\n${uncompletedActivities
          .map((u) => `• ${u.label} (${u.responsibleName || 'Sem responsável'})`)
          .join('\n')}\n\nConclua todas as etapas 5W2H no Passo 2 antes de submeter os ganhos para auditoria contábil.`
      );
      return;
    }

    // Sincronizar os valores correntes de cada categoria no gainDetails
    const activeGainsList = [
      { key: 'machineDowntime', label: 'Redução de Paradas de Máquina / OEE', val: Number(machineDowntime) || 0 },
      { key: 'laborSavings', label: 'Mão de Obra / Horas Economizadas', val: Number(laborSavings) || 0 },
      { key: 'scrapReduction', label: 'Redução de Refugo / Matéria-Prima', val: Number(scrapReduction) || 0 },
      { key: 'toolingAndEnergy', label: 'Ferramental, Energia e Insumos', val: Number(toolingAndEnergy) || 0 },
      { key: 'productionIncrease', label: 'Aumento de Produção / Capacidade Extra', val: Number(productionIncrease) || 0 },
      { key: 'logisticsAndFreight', label: 'Fretes Especiais e Estoque', val: Number(logisticsAndFreight) || 0 },
      { key: 'otherSavings', label: 'Outros Custos Evitados', val: Number(otherSavings) || 0 },
    ].filter((g) => g.val > 0);

    if (activeGainsList.length === 0) {
      alert('Atenção: Preencha pelo menos um ganho financeiro antes de submeter à Controladoria.');
      return;
    }

    // Validação estrita: O anexo é obrigatório para o Agente em todas as fontes com valor declarado
    const missingAttachments = activeGainsList.filter((g) => !gainDetails[g.key]?.attachment);

    if (missingAttachments.length > 0) {
      alert(
        `ANEXO OBRIGATÓRIO PARA ENVIO À CONTROLADORIA!\n\nPara garantir a transparência e auditoria contábil, é OBRIGATÓRIO anexar o arquivo com a memória de cálculo (planilha Excel ou PDF) para cada ganho declarado.\n\nGanhos pendentes de anexo:\n${missingAttachments
          .map((m) => `• ${m.label} (R$ ${m.val.toLocaleString('pt-BR')})`)
          .join('\n')}\n\nPor favor, anexe a memória de cálculo nos campos correspondentes abaixo antes de submeter.`
      );
      return;
    }

    const tenantSettings = dataService.getCurrentTenant()?.aiSettings;
    const configuredControladoriaEmail =
      tenantSettings?.controladoriaEmail?.trim() ||
      'mauricio.grigol@rafitec.com.br';

    const promptResponse = window.prompt(
      `CONFIRMAÇÃO DE SUBMISSÃO À CONTROLADORIA\n\n` +
      `Ganhos Declarados: ${formatCurrency(identifiedGainValue)}\n\n` +
      `Confirme ou informe o e-mail da Controladoria para receber o link seguro de auditoria contábil:\n(Configurado na Entidade: ${configuredControladoriaEmail})`,
      configuredControladoriaEmail
    );
    if (!promptResponse || !promptResponse.trim()) return;

    const currentControladoriaEmail = promptResponse.trim().toLowerCase();

    // Se o usuário especificou um e-mail diferente, salva nas preferências da Entidade
    if (currentControladoriaEmail !== configuredControladoriaEmail.toLowerCase()) {
      dataService.saveTenantAiSettings({
        controladoriaEmail: currentControladoriaEmail,
      });
    }

    setSubmittingControladoria(true);
    try {
      // Atualizar o valor de cada gainDetails com o valor atual do input preservando estritamente anexos existentes
      const finalGainDetails: Record<string, GainProofDetail> = { ...(action?.gainDetails || {}), ...gainDetails };
      activeGainsList.forEach((g) => {
        if (!finalGainDetails[g.key]) {
          finalGainDetails[g.key] = {
            category: g.key,
            categoryLabel: g.label,
            value: g.val,
            explanation: '',
          };
        } else {
          finalGainDetails[g.key].value = g.val;
          finalGainDetails[g.key].categoryLabel = g.label;
          if (!finalGainDetails[g.key].attachment && action?.gainDetails?.[g.key]?.attachment) {
            finalGainDetails[g.key].attachment = action.gainDetails[g.key].attachment;
          }
        }
      });

      const res = await dataService.submitActionToControladoria(
        action.id,
        currentUser?.name || action.assignedAgentName || 'Agente Lean',
        dataService.getCanonicalAppUrl(),
        finalGainDetails,
        currentControladoriaEmail
      );
      setAction(res.action);
      setGainDetails(finalGainDetails);
      stateRef.current.gainDetails = finalGainDetails;

      const emailStatusText = res.emailResult?.simulated
        ? `Modo Simulado (EMAIL_ENABLED=false): o sistema gerou a mensagem internamente mas não realizou o envio externo.`
        : res.emailResult?.success
        ? `E-mail corporativo enviado com sucesso para "${currentControladoriaEmail}" via Microsoft Graph API.`
        : `Aviso no envio de e-mail: ${res.emailResult?.error || res.emailResult?.message || 'Falha de entrega'}.`;

      alert(
        `PROJETO SUBMETIDO À CONTROLADORIA COM SUCESSO!\n\n` +
        `Destinatário: ${currentControladoriaEmail}\n` +
        `Status da Notificação: ${emailStatusText}\n\n` +
        `Link seguro de auditoria:\n${res.auditUrl}\n\n` +
        `O auditor contábil já pode acessar e validar os números declarados.`
      );
    } catch (err: any) {
      alert(err.message || 'Erro ao submeter à Controladoria');
    } finally {
      setSubmittingControladoria(false);
    }
  };

  const handleCopyAuditLink = () => {
    if (!action?.controllershipAudit?.token) return;
    const url = `${window.location.origin}/controladoria/auditoria/${action.controllershipAudit.token}`;
    navigator.clipboard.writeText(url);
    setCopiedAuditLink(true);
    setTimeout(() => setCopiedAuditLink(false), 3000);
  };

  const handleQuickApproveControladoriaTest = () => {
    if (!action?.controllershipAudit) return;
    const res = dataService.processControllershipAudit(action.controllershipAudit.token, {
      status: 'aprovado',
      reviewerName: currentUser?.name || 'Administrador (Modo Teste)',
      reviewerEmail: currentUser?.email || 'admin@empresa.com.br',
      reviewerRole: 'Gestão Master / Controladoria',
      auditNotes: 'Aprovação executada via atalho rápido de teste local.',
    });
    setAction(res);
    refreshData();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handleOpenFollowUpModal = (month: number) => {
    if (isViewer) return;
    const currentEntry = (action?.quarterlyFollowUp as any)?.[`month${month}`];
    setFollowUpModalMonth(month);
    setFollowUpValue(currentEntry?.value !== undefined ? currentEntry.value : '');
    setFollowUpHours(currentEntry?.hoursSaved !== undefined ? currentEntry.hoursSaved : '');
    setFollowUpDate(currentEntry?.measuredAt || getDefaultMeasurementDate(month, action));
    setFollowUpNotes(currentEntry?.notes || '');
  };

  const handleSaveFollowUpMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || isViewer || followUpModalMonth === null || followUpValue === '') return;

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !action || isViewer) return;

    const file = files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${Math.round(file.size / 1024)} KB`;

    try {
      const uploadedUrl = await dataService.uploadAttachmentFile(file, `actions/${action.id}/attachments`);
      const newAtt: ProjectAttachment = {
        id: 'att_' + Date.now(),
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted,
        fileType: file.type || 'application/pdf',
        url: uploadedUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.name || 'Agente Lean',
        category: newAttachmentCategory,
        description: newAttachmentDesc.trim() || undefined,
      };

      const nextList = [...attachments, newAtt];
      setAttachments(nextList);
      stateRef.current.attachments = nextList;
      if (baselineActionRef.current) {
        baselineActionRef.current.attachments = JSON.parse(JSON.stringify(nextList));
      }
      lastLocalSaveTimestampRef.current = Date.now();

      const fresh = dataService.updateAction(action.id, { attachments: nextList });
      if (fresh) {
        setAction(fresh);
        baselineActionRef.current = JSON.parse(JSON.stringify(fresh));
      }
      setNewAttachmentDesc('');
    } catch (err) {
      console.warn('Erro ao anexar arquivo:', err);
      alert('Erro ao anexar arquivo. Tente novamente.');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    if (!action || isViewer) return;
    const nextList = attachments.filter((a) => a.id !== attId);
    setAttachments(nextList);
    stateRef.current.attachments = nextList;
    if (baselineActionRef.current) {
      baselineActionRef.current.attachments = JSON.parse(JSON.stringify(nextList));
    }
    lastLocalSaveTimestampRef.current = Date.now();

    const fresh = dataService.updateAction(action.id, { attachments: nextList });
    if (fresh) {
      setAction(fresh);
      baselineActionRef.current = JSON.parse(JSON.stringify(fresh));
    }
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
      const sampleText = `FLUXOLEAN 4.0 - MEMORIAL DE CÁLCULO\n\nProjeto: ${action?.protocol} - ${action?.title}\nDocumento: ${att.name}\nResponsável: ${att.uploadedBy || 'Agente'}\nData de Emissão: ${formatDateTime(att.uploadedAt)}\n\n--- CUSTOS DO PROJETO (INVESTIMENTO) ---\n- Peças e Equipamentos: R$ ${partsAndEquipment || 0}\n- Serviços de Terceiros: R$ ${thirdPartyServices || 0}\n- Horas Equipe Interna: ${internalLaborHours || 0}h (Taxa: R$ ${laborHourlyRate || 0}/h = R$ ${(Number(internalLaborHours) || 0) * (Number(laborHourlyRate) || 0)})\n- Outras Despesas: R$ ${otherCosts || 0}\nInvestimento Total: R$ ${totalInvestmentCost}\n\n--- GANHOS BRUTOS MAPEADOS (7 FONTES) ---\n- Redução de Paradas (OEE): R$ ${machineDowntime || 0}\n- Mão de Obra Otimizada: R$ ${laborSavings || 0}\n- Redução de Refugo: R$ ${scrapReduction || 0}\n- Ferramental e Energia: R$ ${toolingAndEnergy || 0}\n- Aumento de Produção: R$ ${productionIncrease || 0}\nGanhos Brutos Totais: R$ ${totalGrossSavings}\n\n--- RETORNO FINANCEIRO E INDICADORES ---\n- Lucro Líquido Real: R$ ${netSavings}\n- Retorno sobre Investimento (ROI): ${roiPercentage}%\n- Tempo de Payback: ${paybackMonths} meses\n\nHomologação Técnica Registrada.`;
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
    const today = new Date().toISOString().split('T')[0];
    const updated = checklistItems.map((item) => {
      if (item.id === itemId) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          status: (nextCompleted ? 'concluida' : 'pendente') as any,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
          conclusionDate: nextCompleted ? today : undefined,
          endDate: nextCompleted && !item.endDate ? today : item.endDate,
        };
      }
      return item;
    });
    setChecklistItems(updated);

    // GATILHO AUTOMÁTICO: Se todas as ações 5W2H do Do forem concluídas, avança automaticamente para CHECK e Aguardando Homologação!
    const allCompleted = updated.length > 0 && updated.every((it) => it.completed);
    let nextStage = activeTab;

    if (allCompleted) {
      if (activeTab === 'do') {
        nextStage = 'check';
        setActiveTab('check');
      }
      try {
        confetti({ particleCount: 85, spread: 75, origin: { y: 0.55 } });
      } catch (_) {}
    }

    const nextStatus = allCompleted
      ? (action.masterApproved ? 'concluida' : 'aguardando_aprovacao')
      : (action.masterApproved ? 'concluida' : 'em_andamento');

    const fresh = dataService.updateAction(action.id, {
      checklist: updated,
      pdcaStage: nextStage,
      status: nextStatus,
      submittedForApproval: allCompleted && !action.masterApproved ? true : action.submittedForApproval,
      submittedForApprovalAt: allCompleted && !action.submittedForApprovalAt ? new Date().toISOString() : action.submittedForApprovalAt,
    });

    if (fresh) {
      setAction(fresh);
    }
    refreshData();
  };

  const trackingReq = useMemo(() => {
    return dataService.checkSectorRequiresTrackingDoc(newActionSector, action?.tenantId);
  }, [newActionSector, action?.tenantId]);

  const commitNewChecklistItem = (itemData: {
    label: string;
    responsibleName: string;
    responsibleSectorName: string;
    responsibleSectorId?: string;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    trackingDocNumber?: string;
  }) => {
    if (!action) return;
    const newItem: ActionChecklistItem = {
      id: 'ck_' + Date.now(),
      label: itemData.label,
      responsibleName: itemData.responsibleName,
      responsibleSectorName: itemData.responsibleSectorName,
      responsibleSectorId: itemData.responsibleSectorId,
      startDate: itemData.startDate,
      endDate: itemData.endDate,
      originalEndDate: itemData.endDate,
      postponedCount: 0,
      trackingDocNumber: itemData.trackingDocNumber,
      durationDays: itemData.durationDays,
      status: 'pendente',
      completed: false,
    };

    const nextList = [...checklistItems, newItem];
    setChecklistItems(nextList);
    dataService.updateAction(action.id, { checklist: nextList });
    setNewActionLabel('');
    setNewActionResp('');
    setNewActionSector('');
    setNewActionStart('');
    setNewActionEnd('');
    setNewActionTrackingDoc('');
    setPokaYokeModalOpen(false);
    setQualityEvaluation(null);
    setPendingActivityPayload(null);
    refreshData();
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionLabel.trim() || !action) return;

    const chosenSector = newActionSector.trim() || action.originSectorName || 'Setor do Projeto';
    const foundSector = availableSectors.find((s) => s.name.toLowerCase() === chosenSector.toLowerCase());

    // Validação de documento de rastreio (OC / OS) para compras / manutenção
    const req = dataService.checkSectorRequiresTrackingDoc(chosenSector, action.tenantId);
    if (req.required && !newActionTrackingDoc.trim()) {
      alert(`Atenção: O setor "${chosenSector}" exige obrigatoriamente o preenchimento de: ${req.label}`);
      return;
    }

    let calcDurationDays: number | undefined = undefined;
    if (newActionStart && newActionEnd) {
      const s = new Date(newActionStart).getTime();
      const e = new Date(newActionEnd).getTime();
      if (e >= s) {
        calcDurationDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
      }
    }

    const payload = {
      label: newActionLabel.trim(),
      responsibleName: newActionResp.trim() || action.assignedAgentName || 'Agente',
      responsibleSectorName: chosenSector,
      responsibleSectorId: foundSector?.id,
      startDate: newActionStart.trim() || undefined,
      endDate: newActionEnd.trim() || undefined,
      durationDays: calcDurationDays,
      trackingDocNumber: newActionTrackingDoc.trim() || undefined,
    };

    // Poka-Yoke do Sensei IA: Avaliar se a ação é genérica
    const quality = evaluateActionQuality(newActionLabel, { sectorName: chosenSector, projectName: action.title });
    if (quality.isGeneric) {
      setQualityEvaluation(quality);
      setPendingActivityPayload(payload);
      setPokaYokeModalOpen(true);
      return;
    }

    commitNewChecklistItem(payload);
  };

  const handleAdoptQualitySuggestion = (improvedText: string) => {
    if (pendingActivityPayload) {
      commitNewChecklistItem({ ...pendingActivityPayload, label: improvedText });
    }
  };

  const handleOpenPostponeModal = (item: ActionChecklistItem) => {
    if (isViewer) return;
    setPostponeModalActivity(item);
  };

  const handleConfirmPostpone = (newEndDate: string, reason: string) => {
    if (!action || !postponeModalActivity) return;
    const updated = dataService.postponeActivityDeadline(
      action.id,
      postponeModalActivity.id,
      newEndDate,
      reason,
      currentUser?.name || 'Agente Lean'
    );
    setAction(updated);
    setChecklistItems(updated.checklist || []);
    setPostponeModalActivity(null);
    refreshData();
  };

  const handleOpenAttachmentModal = (item: ActionChecklistItem) => {
    setAttachmentModalActivity(item);
  };

  const handleSaveActivityAttachment = (attachment: ActivityAttachment) => {
    if (!action || !attachmentModalActivity) return;
    const updated = dataService.attachFileToActivity(
      action.id,
      attachmentModalActivity.id,
      attachment
    );
    setAction(updated);
    setChecklistItems(updated.checklist || []);
    setAttachmentModalActivity(null);
    refreshData();
  };

  const handleRemoveActivityAttachment = () => {
    if (!action || !attachmentModalActivity) return;
    const updated = dataService.removeActivityAttachment(
      action.id,
      attachmentModalActivity.id
    );
    setAction(updated);
    setChecklistItems(updated.checklist || []);
    setAttachmentModalActivity(null);
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

  const handleApplySenseiRefinement = (refinement: SenseiProjectRefinement) => {
    if (refinement.formalProblemStatement) {
      setProblemStatement(refinement.formalProblemStatement);
    }
    if (refinement.refinedFiveWhys && refinement.refinedFiveWhys.length > 0) {
      setFiveWhys(refinement.refinedFiveWhys);
      setSelectedDiagnosticTools((prev) => (prev.includes('fiveWhys') ? prev : [...prev, 'fiveWhys']));
    }
    if (refinement.refinedIshikawa) {
      if (refinement.refinedIshikawa.method) setIshikawaMethod(refinement.refinedIshikawa.method);
      if (refinement.refinedIshikawa.machine) setIshikawaMachine(refinement.refinedIshikawa.machine);
      if (refinement.refinedIshikawa.material) setIshikawaMaterial(refinement.refinedIshikawa.material);
      if (refinement.refinedIshikawa.manpower) setIshikawaManpower(refinement.refinedIshikawa.manpower);
      if (refinement.refinedIshikawa.measurement) setIshikawaMeasurement(refinement.refinedIshikawa.measurement);
      if (refinement.refinedIshikawa.environment) setIshikawaEnvironment(refinement.refinedIshikawa.environment);
      if (refinement.refinedIshikawa.primaryRootCause) setIshikawaRootCause(refinement.refinedIshikawa.primaryRootCause);
      setSelectedDiagnosticTools((prev) => (prev.includes('ishikawa') ? prev : [...prev, 'ishikawa']));
    }
    if (refinement.suggestedActions && refinement.suggestedActions.length > 0) {
      setChecklistItems((prev) => [
        ...prev,
        ...refinement.suggestedActions.map((act) => ({
          id: 'item-' + Math.random().toString(36).substring(2, 9),
          label: act.label,
          completed: false,
          what: act.what || act.label,
          why: act.why || 'Ação estruturada pelo Sensei',
          how: act.how || '',
          responsibleName: act.responsibleName || action?.assignedAgentName || 'Líder Kaizen',
        })),
      ]);
    }
    if (refinement.suggestedSop?.docRef) {
      setStandardWorkDocRef(refinement.suggestedSop.docRef);
    }
    if (refinement.lessonsLearned) {
      setLessonsLearned(refinement.lessonsLearned);
    }
    if (refinement.yokotenOpportunity) {
      setYokotenReplication(refinement.yokotenOpportunity);
    }
    setSaveStatus('unsaved');
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
      {/* BANNER EXECUTIVO PARA PERFIL VIEWER */}
      {isViewer && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.875rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(168, 85, 247, 0.12)',
            border: '1.5px solid rgba(168, 85, 247, 0.35)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <Eye size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block' }}>
              Modo de Visualização • Perfil Diretoria / Consulta Executiva (Somente Leitura)
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#d8b4fe', lineHeight: 1.4 }}>
              Você possui permissão de leitura completa para auditar o ciclo PDCA, Pareto, Ishikawa, fotos e acompanhamento financeiro de 12 meses. Ações de edição, inclusão na checklist, homologação e upload estão desabilitadas.
            </span>
          </div>
        </div>
      )}

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
              {action.strategicObjectiveName && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#60a5fa',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Objetivo da Alta Gerência (Hoshin Kanri)"
                >
                  <Target size={11} /> Hoshin: {action.strategicObjectiveName}
                </span>
              )}
              <PriorityBadge priority={action.priority} />
              {(action.status === 'concluida' || action.masterApproved) && (action.conclusionDate || action.completedAt) && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#34d399',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Projeto homologado e concluído oficialmente"
                >
                  <CheckCircle2 size={12} /> Concluído em: {formatDate(action.conclusionDate || action.completedAt?.split('T')[0] || '')}
                </span>
              )}
              {uncompletedActivities.length > 0 && action.status !== 'concluida' && !action.masterApproved && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#f87171',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Existem atividades 5W2H pendentes de conclusão"
                >
                  <AlertTriangle size={12} /> {uncompletedActivities.length} 5W2H pendente(s)
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', margin: '0.25rem 0 0', fontFamily: 'var(--font-heading)' }}>
              {action.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.35rem', flexWrap: 'wrap', fontSize: '0.78125rem' }}>
              <span style={{ color: isDark ? '#fbbf24' : '#b45309', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                <Award size={13} /> Líder: <span style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 600 }}>{leaderName || action.leaderName || action.assignedAgentName}</span>
              </span>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={13} /> Agente: <span style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{action.assignedAgentName}</span>
              </span>
              {(teamMembersInput || (action.teamMembers && action.teamMembers.length > 0)) && (
                <span style={{ color: isDark ? '#22d3ee' : '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                  <Users size={13} /> Equipe: <span style={{ color: isDark ? '#cbd5e1' : '#334155', fontWeight: 400 }}>{teamMembersInput || action.teamMembers?.join(', ')}</span>
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
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff',
              border: isDark ? '1px solid rgba(139, 92, 246, 0.5)' : '1.5px solid #d8b4fe',
              color: isDark ? '#c084fc' : '#7e22ce',
              fontWeight: 800,
              boxShadow: isDark ? '0 0 15px rgba(139, 92, 246, 0.25)' : '0 1px 3px rgba(126, 34, 206, 0.15)',
              transition: 'all 0.15s ease',
            }}
            title="Abrir Apresentação de Slides Executivos do Ciclo PDCA (P -> D -> C -> A -> Antes e Depois)"
          >
            <Play size={14} fill={isDark ? '#c084fc' : '#7e22ce'} />
            <span>Modo Apresentação</span>
          </button>

          {/* Alerta de Sincronização em Tempo Real (Colaboração Simultânea) */}
          {remoteSyncNotification && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: isDark ? 'rgba(6, 182, 212, 0.18)' : '#e0f2fe',
                border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.45)' : '#38bdf8'}`,
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: isDark ? '#22d3ee' : '#0369a1',
                boxShadow: isDark ? '0 0 12px rgba(6, 182, 212, 0.3)' : '0 1px 3px rgba(3, 105, 161, 0.2)',
                animation: 'fade-in 0.3s ease',
              }}
              title="Dados atualizados remotamente por outro usuário"
            >
              <Users size={13} />
              <span>{remoteSyncNotification}</span>
            </div>
          )}

          {/* Indicador em Tempo Real de Auto-Save ou Modo Viewer */}
          {isViewer ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.14)' : '#faf5ff',
                border: isDark ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid #e9d5ff',
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: isDark ? '#d8b4fe' : '#7e22ce',
              }}
            >
              <Eye size={13} color={isDark ? '#c084fc' : '#7e22ce'} />
              <span>Modo Somente Leitura</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: saveStatus === 'saving'
                  ? (isDark ? 'rgba(6, 182, 212, 0.12)' : '#e0f2fe')
                  : (isDark ? 'rgba(16, 185, 129, 0.12)' : '#f0fdf4'),
                border: `1px solid ${
                  saveStatus === 'saving'
                    ? (isDark ? 'rgba(6, 182, 212, 0.35)' : '#7dd3fc')
                    : (isDark ? 'rgba(16, 185, 129, 0.35)' : '#86efac')
                }`,
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: saveStatus === 'saving'
                  ? (isDark ? '#22d3ee' : '#0369a1')
                  : (isDark ? '#34d399' : '#15803d'),
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
                  <CheckCircle2 size={13} color={isDark ? '#34d399' : '#15803d'} />
                  <span>Salvo automaticamente</span>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleCopyLink}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: isDark ? '#0d1527' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
              color: isDark ? '#f8fafc' : '#1e293b',
            }}
          >
            <Share2 size={14} /> {copied ? 'Copiado!' : 'Compartilhar'}
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: isDark ? '#0d1527' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
              color: isDark ? '#f8fafc' : '#1e293b',
            }}
            title="Visualizar e Imprimir Relatório A3 Paisagem (4 Quadrantes PDCA)"
          >
            <Printer size={14} /> Relatório A3 (Paisagem)
          </button>

          <button
            type="button"
            onClick={() => setShowSenseiCopilot(true)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1.1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.45) 0%, rgba(251, 191, 36, 0.35) 50%, rgba(217, 119, 6, 0.4) 100%)',
              backdropFilter: 'blur(20px) saturate(200%)',
              WebkitBackdropFilter: 'blur(20px) saturate(200%)',
              border: '1.5px solid rgba(254, 240, 138, 0.75)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.78125rem',
              letterSpacing: '0.01em',
              cursor: 'pointer',
              boxShadow: '0 6px 25px rgba(245, 158, 11, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.85), inset 0 -1.5px 3px rgba(0, 0, 0, 0.25), 0 0 14px rgba(251, 191, 36, 0.35)',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            }}
            title="Pedir ajuda ao Sensei para auditar, refinar os campos e sugerir melhorias no projeto com Lean"
          >
            {/* Reflexo de luz de vidro líquido */}
            <span
              style={{
                position: 'absolute',
                top: '1px',
                left: '8%',
                right: '8%',
                height: '45%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.05) 100%)',
                borderRadius: '999px',
                pointerEvents: 'none',
              }}
            />

            {/* Ponto indicador de IA Live */}
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#34d399',
                boxShadow: '0 0 8px #34d399, 0 0 3px #ffffff',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />

            <Bot size={15} color="#ffffff" style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.9))' }} />
            <span>Ajuda do Sensei</span>
          </button>
        </div>
      </div>

      {/* PDCA INTERACTIVE STEPPER / TABS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          padding: '0.75rem',
          borderRadius: '16px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* P - PLAN */}
        <button
          type="button"
          onClick={() => handleSelectStage('plan')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'plan'
              ? '2px solid #06b6d4'
              : isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'plan'
              ? (isDark ? 'rgba(6, 182, 212, 0.16)' : '#e0f2fe')
              : (isDark ? '#0d1527' : '#f8fafc'),
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'plan' ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'plan' ? (isDark ? '#22d3ee' : '#0369a1') : (isDark ? '#94a3b8' : '#64748b') }}>
              1. PLAN (Planejar)
            </span>
            <Target size={16} color={activeTab === 'plan' ? '#06b6d4' : (isDark ? '#64748b' : '#94a3b8')} />
          </div>
          <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', display: 'block', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Diagnóstico & Causas
          </strong>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>5W2H • 5 Porquês • Ishikawa 6M</span>
        </button>

        {/* D - DO */}
        <button
          type="button"
          onClick={() => handleSelectStage('do')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'do'
              ? '2px solid #f59e0b'
              : isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'do'
              ? (isDark ? 'rgba(245, 158, 11, 0.16)' : '#fef3c7')
              : (isDark ? '#0d1527' : '#f8fafc'),
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'do' ? '0 0 15px rgba(245, 158, 11, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'do' ? (isDark ? '#fbbf24' : '#b45309') : (isDark ? '#94a3b8' : '#64748b') }}>
              2. DO (Executar)
            </span>
            <Zap size={16} color={activeTab === 'do' ? '#f59e0b' : (isDark ? '#64748b' : '#94a3b8')} />
          </div>
          <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', display: 'block', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Plano de Ação 5W2H
          </strong>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Checklist • Testes Piloto • Posto</span>
        </button>

        {/* C - CHECK */}
        <button
          type="button"
          onClick={() => handleSelectStage('check')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'check'
              ? '2px solid #a855f7'
              : isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'check'
              ? (isDark ? 'rgba(168, 85, 247, 0.16)' : '#f3e8ff')
              : (isDark ? '#0d1527' : '#f8fafc'),
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'check' ? '0 0 15px rgba(168, 85, 247, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'check' ? (isDark ? '#c084fc' : '#7e22ce') : (isDark ? '#94a3b8' : '#64748b') }}>
              3. CHECK (Verificar & ROI)
            </span>
            <BarChart3 size={16} color={activeTab === 'check' ? '#a855f7' : (isDark ? '#64748b' : '#94a3b8')} />
          </div>
          <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', display: 'block', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Custos vs. Ganhos
          </strong>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Lucro Líquido • ROI % • Payback</span>
        </button>

        {/* A - ACT */}
        <button
          type="button"
          onClick={() => handleSelectStage('act')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'act'
              ? '2px solid #10b981'
              : isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'act'
              ? (isDark ? 'rgba(16, 185, 129, 0.16)' : '#dcfce7')
              : (isDark ? '#0d1527' : '#f8fafc'),
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'act' ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeTab === 'act' ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#94a3b8' : '#64748b') }}>
              4. ACT (Padronizar)
            </span>
            <CheckCircle2 size={16} color={activeTab === 'act' ? '#10b981' : (isDark ? '#64748b' : '#94a3b8')} />
          </div>
          <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', display: 'block', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            POP, Yokoten & Master
          </strong>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Padronização • Replicação • DRE</span>
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
                  <Award size={13} /> Líder do Kaizen / Projeto:
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
                  <Users size={13} /> Pessoas Envolvidas / Equipe Kaizen (separar por vírgula):
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
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <TrendingDown size={13} /> Baseline Inicial (Antes):
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
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Target size={13} /> Meta Alvo (Planejado):
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
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={13} /> Custo do Problema (R$/mês):
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
          {/* 1.2 HUB DE FERRAMENTAS DE DIAGNÓSTICO & ANÁLISE DE CAUSA RAIZ             */}
          {/* ========================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Seletor Superior: Matriz Canvas Integrada vs Formulário por Ferramenta */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                backgroundColor: isDark ? '#090e1a' : '#f1f5f9',
                padding: '0.65rem 1rem',
                borderRadius: '14px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.78125rem',
                    fontWeight: 800,
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  1.2 Diagnóstico & Causa Raiz:
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                  }}
                >
                  {diagnosticViewMode === 'canvas' ? 'Visão Panorâmica Conectada' : 'Visualização em Blocos Individuais'}
                </span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: isDark ? '#060a13' : '#e2e8f0',
                  padding: '3px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #cbd5e1',
                }}
              >
                <button
                  type="button"
                  onClick={() => setDiagnosticViewMode('canvas')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: diagnosticViewMode === 'canvas' ? 800 : 600,
                    cursor: 'pointer',
                    backgroundColor: diagnosticViewMode === 'canvas' ? '#06b6d4' : 'transparent',
                    color: diagnosticViewMode === 'canvas' ? '#060a13' : (isDark ? '#94a3b8' : '#475569'),
                    boxShadow: diagnosticViewMode === 'canvas' ? '0 2px 8px rgba(6, 182, 212, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Workflow size={13} /> Matriz Canvas Integrada
                </button>
                <button
                  type="button"
                  onClick={() => setDiagnosticViewMode('form')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: diagnosticViewMode === 'form' ? 800 : 600,
                    cursor: 'pointer',
                    backgroundColor: diagnosticViewMode === 'form' ? '#06b6d4' : 'transparent',
                    color: diagnosticViewMode === 'form' ? '#060a13' : (isDark ? '#94a3b8' : '#475569'),
                    boxShadow: diagnosticViewMode === 'form' ? '0 2px 8px rgba(6, 182, 212, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListFilter size={13} /> Formulário em Cards
                </button>
              </div>
            </div>

            {/* MODO CANVAS INTEGRADO */}
            {diagnosticViewMode === 'canvas' ? (
              <LeanDiagnosticCanvas
                problemStatement={problemStatement}
                onProblemStatementChange={setProblemStatement}
                baselineValue={baselineValue}
                targetGoalValue={targetGoalValue}
                targetMetricName={targetMetricName}
                targetMetricUnit={targetMetricUnit}
                currentProblemCostMonthly={currentProblemCostMonthly}
                fiveWhys={fiveWhys}
                onFiveWhysChange={setFiveWhys}
                paretoImageUrl={paretoImageUrl}
                paretoImageName={paretoImageName}
                paretoVitalCauses={paretoVitalCauses}
                onParetoVitalCausesChange={setParetoVitalCauses}
                paretoCumulativePercent={paretoCumulativePercent}
                onParetoCumulativePercentChange={setParetoCumulativePercent}
                onParetoImageUpload={handleParetoImageUpload}
                onRemoveParetoImage={handleRemoveParetoImage}
                ishikawa={{
                  method: ishikawaMethod,
                  machine: ishikawaMachine,
                  material: ishikawaMaterial,
                  manpower: ishikawaManpower,
                  measurement: ishikawaMeasurement,
                  environment: ishikawaEnvironment,
                  primaryRootCause: ishikawaRootCause,
                }}
                onIshikawaChange={handleIshikawaFieldChange}
                onTransferIshikawaToFiveWhys={handleTransferIshikawaToFiveWhys}
                onGenerateActionFromRootCause={handleGenerateActionFromRootCause}
                onSwitchToFormMode={() => setDiagnosticViewMode('form')}
                isViewer={isViewer}
                isDark={isDark}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  <Search size={22} color="#06b6d4" />
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
                  <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem' }}>
                    <CheckCircle2 size={11} /> {fiveWhysFilledCount}/5 etapas preenchidas
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
                  <BarChart3 size={22} color="#8b5cf6" />
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
                  <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem' }}>
                    <CheckCircle2 size={11} /> Pareto registrado
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
                  <Workflow size={22} color="#10b981" />
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
                  <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem' }}>
                    <CheckCircle2 size={11} /> {ishikawaFilledCount}/6 M&apos;s preenchidos
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
                      Análise dos 5 Porquês (Causa Raiz)
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
                      Comprovação por Gráfico de Pareto (Regra 80/20)
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Zap size={12} /> REGRA 80/20
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
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <BarChart3 size={14} /> Imagem do Gráfico de Pareto Gerado:
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
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Target size={14} /> Causas Vitais Identificadas (os 20% priorizados no Pareto):
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
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
                        <CheckCircle2 size={11} /> Alta Prioridade no Plano 5W2H
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
                    <Workflow size={20} color="#10b981" />
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
                      <Ruler size={16} color="#22d3ee" />
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
                      <Settings size={16} color="#fbbf24" />
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
                      <Box size={16} color="#f472b6" />
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
                      <HardHat size={16} color="#34d399" />
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
                      <Ruler size={16} color="#c084fc" />
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
                      <Thermometer size={16} color="#38bdf8" />
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
                  <Target size={14} color="#34d399" /> Causa Raiz Principal Priorizada no Ishikawa (Conclusão 6M):
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
          </div>

          {/* Banner de Avanço de Etapa: Plan -> Do */}
          <div
            style={{
              backgroundColor: isDark ? '#090e1a' : '#f8fafc',
              border: isDark ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #fcd34d',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={13} /> Etapa 1: Planejamento Lean Concluído
              </span>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0.2rem 0', fontFamily: 'var(--font-heading)' }}>
                Pronto para iniciar a Execução das Contramedidas no Gemba?
              </h4>
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                Ao avançar, o projeto passa automaticamente para a Etapa <strong>2. DO (Executar)</strong> no Kanban.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleSelectStage('do');
                window.scrollTo({ top: 250, behavior: 'smooth' });
              }}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                fontWeight: 800,
                fontSize: '0.875rem',
                borderRadius: '10px',
              }}
            >
              <span>Avançar para 2. DO (Executar)</span>
              <ArrowRight size={16} />
            </button>
          </div>
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
                checklistItems.map((item, index) => {
                  const isExternal =
                    Boolean(item.responsibleSectorName &&
                    action?.originSectorName &&
                    item.responsibleSectorName.trim().toLowerCase() !== action.originSectorName.trim().toLowerCase());

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: item.completed
                          ? '1.5px solid rgba(16, 185, 129, 0.35)'
                          : isExternal
                          ? '1.5px solid rgba(245, 158, 11, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: item.completed
                          ? 'rgba(16, 185, 129, 0.12)'
                          : isExternal
                          ? 'rgba(245, 158, 11, 0.06)'
                          : '#090e1a',
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
                          disabled={isViewer}
                          onChange={() => !isViewer && handleToggleChecklistItem(item.id)}
                          style={{ width: '18px', height: '18px', cursor: isViewer ? 'not-allowed' : 'pointer', accentColor: '#10b981' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.9rem', color: item.completed ? '#34d399' : '#ffffff', textDecoration: item.completed ? 'line-through' : 'none', fontFamily: 'var(--font-heading)' }}>
                              {index + 1}. {item.label}
                            </strong>
                            {item.responsibleSectorName && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  backgroundColor: isExternal ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                  color: isExternal ? '#fbbf24' : '#94a3b8',
                                  border: `1px solid ${isExternal ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
                                }}
                                title={isExternal ? 'Dependência externa fora do setor do projeto (Impacta Lead Time do Agente)' : 'Setor de Origem do Projeto'}
                              >
                                <Building2 size={12} /> {item.responsibleSectorName}
                                {isExternal && (
                                  <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 900 }}>
                                    [Dependência Externa]
                                  </span>
                                )}
                              </span>
                            )}
                            {item.trackingDocNumber && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                }}
                                title="Número de documento de controle (Auditoria ERP)"
                              >
                                <FileText size={12} /> {item.trackingDocNumber}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><User size={12} /> {item.responsibleName || 'Agente'}</span>
                            {item.startDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> Início: {formatDate(item.startDate)}</span>}
                            {item.endDate && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                Prazo: <strong style={{ color: '#ffffff' }}>{formatDate(item.endDate)}</strong>
                              </span>
                            )}
                            {item.completed && (item.conclusionDate || item.completedAt) && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                }}
                              >
                                <CheckCircle2 size={12} /> Concluída em: {formatDate(item.conclusionDate || item.completedAt?.split('T')[0] || '')}
                              </span>
                            )}
                            {(item.postponedCount || 0) > 0 && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '4px',
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  backgroundColor: 'rgba(245, 158, 11, 0.18)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(245, 158, 11, 0.35)',
                                }}
                                title={`Reprogramada ${item.postponedCount}x para auditoria interna. Motivo: ${item.postponementReason || 'Não informado'}`}
                              >
                                <AlertTriangle size={12} /> Reprogramada ({item.postponedCount}x • Orig: {item.originalEndDate ? formatDate(item.originalEndDate) : '—'})
                              </span>
                            )}
                            {item.durationDays && item.durationDays > 0 && (
                              <span style={{ color: '#38bdf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {item.durationDays} dias</span>
                            )}
                            {item.attachment && (
                              <div
                                onClick={() => handleOpenAttachmentModal(item)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.1rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                  color: '#22d3ee',
                                  border: '1px solid rgba(6, 182, 212, 0.35)',
                                  cursor: 'pointer',
                                }}
                                title="Clique para visualizar ou baixar o anexo desta atividade"
                              >
                                <Paperclip size={12} />
                                <span>{item.attachment.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {!isViewer && !item.completed && (
                          <button
                            type="button"
                            onClick={() => handleOpenPostponeModal(item)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.25rem 0.55rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: '#fbbf24',
                              borderColor: 'rgba(245, 158, 11, 0.35)',
                              backgroundColor: 'rgba(245, 158, 11, 0.08)',
                            }}
                            title="Prorrogar prazo desta atividade antes do vencimento para manter 100% de conformidade com auditorias de SGQ/IATF"
                          >
                            <Calendar size={12} /> Prorrogar
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenAttachmentModal(item)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.25rem 0.55rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: item.attachment ? '#34d399' : '#cbd5e1',
                            borderColor: item.attachment ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.12)',
                          }}
                          title={item.attachment ? 'Ver / alterar anexo ou cronoanálise' : 'Anexar cronoanálise ou laudo técnico'}
                        >
                          <Paperclip size={12} /> {item.attachment ? 'Anexado' : 'Anexar'}
                        </button>

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
                          {item.completed ? 'Concluída' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Action Form */}
            {!isViewer && (
              <form onSubmit={handleAddChecklistItem} style={{ backgroundColor: '#090e1a', padding: '1.25rem', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={14} /> Adicionar Nova Atividade 5W2H (Com Setor Responsável & Mapeamento de Dependências):
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Setores terceiros alimentam o indicador de Gargalos Externos para defesa do agente
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto', gap: '0.65rem', alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>O que fazer (Ação): *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Ex: Cotação de engates rápidos"
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
                    <label className="form-label" style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>Setor Responsável (Onde):</label>
                    <input
                      type="text"
                      list="action-sectors-list"
                      className="form-control form-control-sm"
                      placeholder={action?.originSectorName || 'Ex: Compras, Manutenção'}
                      value={newActionSector}
                      onChange={(e) => setNewActionSector(e.target.value)}
                      style={{ backgroundColor: '#060a13', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#ffffff' }}
                    />
                    <datalist id="action-sectors-list">
                      {action?.originSectorName && <option value={action.originSectorName} label="Setor do Projeto" />}
                      <option value="Compras / Suprimentos" label="Dependência Externa (Exige OC)" />
                      <option value="Manutenção Preditiva & TPM" label="Dependência Externa (Exige OS)" />
                      <option value="Controladoria & Finanças" label="Dependência Externa" />
                      <option value="Qualidade & Processos" label="Dependência Externa" />
                      <option value="Engenharia / Ferramentaria" label="Dependência Externa" />
                      <option value="TI & Automação" label="Dependência Externa" />
                      {availableSectors.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>

                  {trackingReq.required && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 800 }}>
                        {trackingReq.label}: *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={trackingReq.docType === 'purchase_order' ? 'Ex: OC-48201' : 'Ex: OS-9912'}
                        value={newActionTrackingDoc}
                        onChange={(e) => setNewActionTrackingDoc(e.target.value)}
                        style={{ backgroundColor: '#060a13', borderColor: 'rgba(245, 158, 11, 0.6)', color: '#ffffff', fontWeight: 600 }}
                        required
                      />
                    </div>
                  )}

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
                    <label className="form-label" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Data Fim (Previsão):</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={newActionEnd}
                      onChange={(e) => setNewActionEnd(e.target.value)}
                      style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" style={{ height: '36px', whiteSpace: 'nowrap' }}>
                    Adicionar
                  </button>
                </div>
              </form>
            )}
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Camera size={13} /> Foto do Antes (Estado Inicial)
                  </span>
                  {!isViewer && photoBeforeUrl && (
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
                ) : isViewer ? (
                  <div
                    style={{
                      height: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#64748b',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <ImageIcon size={24} color="#64748b" />
                    <span>Nenhuma evidência do <strong>Antes</strong> registrada</span>
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Camera size={13} /> Foto do Depois (Melhoria Implantada)
                  </span>
                  {!isViewer && photoAfterUrl && (
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
                ) : isViewer ? (
                  <div
                    style={{
                      height: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#64748b',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <ImageIcon size={24} color="#64748b" />
                    <span>Nenhuma evidência do <strong>Depois</strong> registrada</span>
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

          {/* Banner de Avanço e Status da Etapa 2: DO */}
          <div
            style={{
              backgroundColor: isDark ? '#090e1a' : '#f8fafc',
              border: uncompletedActivities.length === 0 && checklistItems.length > 0
                ? (isDark ? '1.5px solid #10b981' : '1.5px solid #16a34a')
                : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: uncompletedActivities.length === 0 && checklistItems.length > 0 ? '#34d399' : '#fbbf24',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {uncompletedActivities.length === 0 && checklistItems.length > 0 ? (
                  <CheckCircle2 size={14} color="#34d399" />
                ) : (
                  <Clock size={14} color="#fbbf24" />
                )}
                Etapa 2: Execução 5W2H ({checklistItems.filter((c) => c.completed).length}/{checklistItems.length} concluídas)
              </span>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0.2rem 0', fontFamily: 'var(--font-heading)' }}>
                {uncompletedActivities.length === 0 && checklistItems.length > 0
                  ? 'Todas as contramedidas 5W2H foram executadas no Gemba!'
                  : `${uncompletedActivities.length} ação(ões) 5W2H pendente(s) de conclusão no posto.`}
              </h4>
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                {uncompletedActivities.length === 0 && checklistItems.length > 0
                  ? 'O projeto avançou automaticamente para a Etapa 3. CHECK (Verificação de Resultados).'
                  : 'Ao marcar a última ação 5W2H como concluída, o sistema avança automaticamente para a etapa CHECK.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('check');
                if (action) {
                  const fresh = dataService.updateAction(action.id, { pdcaStage: 'check' });
                  if (fresh) setAction(fresh);
                }
                window.scrollTo({ top: 250, behavior: 'smooth' });
              }}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                fontWeight: 800,
                fontSize: '0.875rem',
                borderRadius: '10px',
                backgroundColor: uncompletedActivities.length === 0 && checklistItems.length > 0 ? '#10b981' : undefined,
                borderColor: uncompletedActivities.length === 0 && checklistItems.length > 0 ? '#10b981' : undefined,
              }}
            >
              <span>Avançar para 3. CHECK (Verificar)</span>
              <ArrowRight size={16} />
            </button>
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
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingDown size={13} /> Baseline Inicial (Antes):
                </span>
                <strong style={{ fontSize: '1.4rem', color: '#f87171', display: 'block', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                  {baselineValue || '—'} {targetMetricUnit}
                </strong>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.35)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Target size={13} /> Meta Planejada:
                </span>
                <strong style={{ fontSize: '1.4rem', color: '#22d3ee', display: 'block', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                  {targetGoalValue || '—'} {targetMetricUnit}
                </strong>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1.5px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={13} /> Resultado Real Atingido (Depois):
                </span>
                <input
                  type="number"
                  className="form-control"
                  style={{ marginTop: '0.35rem', fontWeight: 900, fontSize: '1.2rem', color: '#34d399', backgroundColor: '#090e1a', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  placeholder="0"
                  value={achievedValue === 0 || achievedValue === '' || achievedValue === undefined ? '' : achievedValue}
                  onChange={(e) => setAchievedValue(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* DRE Financeira do Projeto: CUSTOS vs GANHOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* COLUNA 1: CUSTOS / INVESTIMENTO DO PROJETO (Capex + Opex) */}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Wrench size={12} /> Peças, Dispositivos & Sensores (R$):
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="0"
                    value={partsAndEquipment === 0 || partsAndEquipment === '' || partsAndEquipment === undefined ? '' : partsAndEquipment}
                    onChange={(e) => setPartsAndEquipment(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Settings size={12} /> Serviços de Terceiros / Usinagem (R$):
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="0"
                    value={thirdPartyServices === 0 || thirdPartyServices === '' || thirdPartyServices === undefined ? '' : thirdPartyServices}
                    onChange={(e) => setThirdPartyServices(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={12} /> Horas Equipe (h):
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="0"
                      value={internalLaborHours === 0 || internalLaborHours === '' || internalLaborHours === undefined ? '' : internalLaborHours}
                      onChange={(e) => setInternalLaborHours(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <DollarSign size={12} /> Custo/Hora (R$/h):
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="45"
                      value={laborHourlyRate === 0 || laborHourlyRate === '' || laborHourlyRate === undefined ? '' : laborHourlyRate}
                      onChange={(e) => setLaborHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Lightbulb size={12} /> Outras Despesas Operacionais (R$):
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="0"
                    value={otherCosts === 0 || otherCosts === '' || otherCosts === undefined ? '' : otherCosts}
                    onChange={(e) => setOtherCosts(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                  />
                </div>

                {/* Subtotal: Investimento Total Bruto */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#090e1a', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>INVESTIMENTO TOTAL (BRUTO):</span>
                  <strong style={{ fontSize: '0.95rem', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    {formatCurrency(grossInvestmentCost)}
                  </strong>
                </div>

                {/* Bloco de Deduções Tributárias (Lucro Real / CPC 27) */}
                <div style={{ padding: '0.85rem', backgroundColor: '#080d1a', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Receipt size={13} /> Deduções Fiscais sobre CAPEX (Créditos Tributários)
                  </span>

                  {/* (-) ICMS */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>
                      (-) Impostos Recuperáveis (ICMS R$):
                    </label>
                    <div style={{ width: '130px' }}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="0"
                        value={icmsCredit === 0 || icmsCredit === '' || icmsCredit === undefined ? '' : icmsCredit}
                        onChange={(e) => setIcmsCredit(e.target.value === '' ? '' : Number(e.target.value))}
                        style={{ backgroundColor: '#050811', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', textAlign: 'right' }}
                      />
                    </div>
                  </div>

                  {/* (-) PIS / COFINS com Alíquota % e Valor R$ */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 85px 125px', gap: '0.4rem', alignItems: 'center' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>
                      (-) PIS/COFINS:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="22"
                        value={pisCofinsRate === '' ? '' : pisCofinsRate}
                        onChange={(e) => setPisCofinsRate(e.target.value === '' ? '' : Number(e.target.value))}
                        style={{ backgroundColor: '#050811', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#38bdf8', textAlign: 'right', paddingRight: '1.25rem' }}
                      />
                      <span style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#64748b' }}>%</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder={formatCurrency(Math.round(grossInvestmentCost * (numPisRate / 100)))}
                        value={pisCofinsCredit === 0 || pisCofinsCredit === '' || pisCofinsCredit === undefined ? '' : pisCofinsCredit}
                        onChange={(e) => setPisCofinsCredit(e.target.value === '' ? '' : Number(e.target.value))}
                        style={{ backgroundColor: '#050811', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#f87171', textAlign: 'right', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  {/* (=) INVESTIMENTO LÍQUIDO DE CAPITAL */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(56, 189, 248, 0.08)', borderRadius: '8px', border: '1.5px solid rgba(56, 189, 248, 0.35)', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800 }}>(=) INVESTIMENTO LÍQUIDO:</span>
                    <strong style={{ fontSize: '1.15rem', color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                      {formatCurrency(netInvestmentCost)}
                    </strong>
                  </div>
                </div>

                {/* Parâmetros Corporativos de Finanças & Controladoria (Lucro Real) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', backgroundColor: '#090e1a', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Taxa Fin. (a.m.):</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-sm"
                      value={financialRate}
                      onChange={(e) => setFinancialRate(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ backgroundColor: '#050811', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff', textAlign: 'right', fontSize: '0.75rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Depreciação:</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="60"
                      value={depreciationMonths}
                      onChange={(e) => setDepreciationMonths(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ backgroundColor: '#050811', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff', textAlign: 'right', fontSize: '0.75rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>IRPJ+CSLL (%):</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="34"
                      value={incomeTaxRate}
                      onChange={(e) => setIncomeTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ backgroundColor: '#050811', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff', textAlign: 'right', fontSize: '0.75rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA 2: GANHOS BRUTOS / CUSTO EVITADO (7 Fontes) COM MEMÓRIA DE CÁLCULO & ANEXOS */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #10b981', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
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
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
                Ao declarar qualquer ganho financeiro, anexe obrigatoriamente a planilha/memorial de cálculo para auditoria da Controladoria.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { key: 'machineDowntime', label: 'Redução de Paradas de Máquina / OEE', val: machineDowntime, setVal: setMachineDowntime, Icon: Settings },
                  { key: 'laborSavings', label: 'Mão de Obra / Horas Economizadas', val: laborSavings, setVal: setLaborSavings, Icon: Users },
                  { key: 'scrapReduction', label: 'Redução de Refugo / Matéria-Prima', val: scrapReduction, setVal: setScrapReduction, Icon: Trash2 },
                  { key: 'toolingAndEnergy', label: 'Ferramental, Energia & Insumos', val: toolingAndEnergy, setVal: setToolingAndEnergy, Icon: Zap },
                  { key: 'productionIncrease', label: 'Aumento de Produção / Capacidade Extra', val: productionIncrease, setVal: setProductionIncrease, Icon: TrendingUp },
                  { key: 'logisticsAndFreight', label: 'Fretes Especiais e Estoque', val: logisticsAndFreight, setVal: setLogisticsAndFreight, Icon: Box },
                  { key: 'otherSavings', label: 'Outros Custos Evitados', val: otherSavings, setVal: setOtherSavings, Icon: Lightbulb },
                ].map(({ key, label, val, setVal, Icon }) => {
                  const numVal = Number(val) || 0;
                  const proof = gainDetails[key];
                  const auditProof = action?.controllershipAudit?.gainDetails?.[key];
                  const hasFile = Boolean(proof?.attachment);

                  return (
                    <div
                      key={key}
                      style={{
                        backgroundColor: numVal > 0 ? 'rgba(16, 185, 129, 0.04)' : '#090e1a',
                        borderRadius: '10px',
                        padding: '0.85rem',
                        border: numVal > 0
                          ? hasFile
                            ? '1px solid rgba(16, 185, 129, 0.35)'
                            : '1px solid rgba(245, 158, 11, 0.45)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      {/* Linha do Input Principal */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, fontWeight: 700, flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Icon size={14} color="#34d399" /> {label} (R$):
                        </label>
                        <div style={{ width: '150px' }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="0"
                            value={val === 0 || val === '' || val === undefined ? '' : val}
                            onChange={(e) => setVal(e.target.value === '' ? '' : Number(e.target.value))}
                            style={{
                              backgroundColor: '#050811',
                              borderColor: numVal > 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.12)',
                              color: numVal > 0 ? '#34d399' : '#ffffff',
                              fontWeight: 800,
                              textAlign: 'right',
                            }}
                          />
                        </div>
                      </div>

                      {/* Bloco de Memória de Cálculo & Anexo (Obrigatório se ganho > 0 ou se já houver anexo) */}
                      {(numVal > 0 || hasFile) && (
                        <div
                          style={{
                            backgroundColor: '#050811',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Ruler size={12} /> Memória de Cálculo & Premissas:
                            </span>
                            {hasFile ? (
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle2 size={11} /> Planilha / Comprovante Anexado
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <AlertTriangle size={11} /> Anexo Obrigatório para Controladoria
                              </span>
                            )}
                          </div>

                          <textarea
                            rows={2}
                            className="form-control form-control-sm"
                            placeholder="Descreva a metodologia, fórmula e premissas usadas no cálculo..."
                            value={proof?.explanation || ''}
                            onChange={(e) => handleGainExplanationChange(key, label, e.target.value)}
                            style={{ fontSize: '0.75rem', backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />

                          {/* Arquivo Comprobatório do Agente */}
                          {hasFile && proof?.attachment ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.55rem 0.75rem',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                {proof.attachment.fileType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(proof.attachment.name) ? (
                                  <ImageIcon size={16} color="#34d399" />
                                ) : proof.attachment.fileType === 'application/pdf' || /\.pdf$/i.test(proof.attachment.name) ? (
                                  <FileText size={16} color="#34d399" />
                                ) : (
                                  <FileSpreadsheet size={16} color="#34d399" />
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '220px' }}>
                                    {proof.attachment.name}
                                  </span>
                                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                    {proof.attachment.sizeFormatted} • {proof.attachment.uploadedBy || 'Agente Lean'}
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setPreviewGainAttachment(proof.attachment!)}
                                  style={{
                                    padding: '0.25rem 0.55rem',
                                    fontSize: '0.7rem',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(56, 189, 248, 0.18)',
                                    color: '#38bdf8',
                                    border: '1px solid rgba(56, 189, 248, 0.4)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontWeight: 700,
                                  }}
                                  title="Visualizar documento ou imagem na tela"
                                >
                                  <Eye size={12} /> Visualizar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadGainAttachment(proof.attachment!)}
                                  style={{
                                    padding: '0.25rem 0.55rem',
                                    fontSize: '0.7rem',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.18)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontWeight: 700,
                                  }}
                                  title="Baixar arquivo original"
                                >
                                  <Download size={12} /> Baixar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGainFile(key)}
                                  style={{
                                    padding: '0.25rem 0.55rem',
                                    fontSize: '0.7rem',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                  }}
                                  title="Excluir este anexo"
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.45rem',
                                padding: '0.55rem',
                                borderRadius: '6px',
                                border: '1.5px dashed rgba(245, 158, 11, 0.4)',
                                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                color: '#fbbf24',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textAlign: 'center',
                              }}
                            >
                              <Paperclip size={14} />
                              <span>Anexar Memória de Cálculo (.xlsx, .pdf, .csv, imagem)</span>
                              <input
                                type="file"
                                accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,image/*"
                                onChange={(e) => handleGainFileUpload(key, label, e)}
                                style={{ display: 'none' }}
                              />
                            </label>
                          )}

                          {/* Parecer do Auditor se houver revisão */}
                          {auditProof && (auditProof.auditorExplanation || auditProof.auditorAttachment) && (
                            <div
                              style={{
                                marginTop: '0.35rem',
                                padding: '0.5rem 0.65rem',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderLeft: '3px solid #3b82f6',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.35rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <Building2 size={12} /> Parecer da Controladoria:
                                </span>
                                {auditProof.auditorValue !== undefined && (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399' }}>
                                    Aprovado: {formatCurrency(auditProof.auditorValue)}
                                  </span>
                                )}
                              </div>
                              {auditProof.auditorExplanation && (
                                <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: 0, fontStyle: 'italic' }}>
                                  &quot;{auditProof.auditorExplanation}&quot;
                                </p>
                              )}
                              {auditProof.auditorAttachment && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewGainAttachment(auditProof.auditorAttachment!)}
                                    style={{
                                      padding: '0.2rem 0.5rem',
                                      fontSize: '0.68rem',
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
                                  >
                                    <Eye size={11} /> Visualizar Revisão
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadGainAttachment(auditProof.auditorAttachment!)}
                                    style={{
                                      padding: '0.2rem 0.5rem',
                                      fontSize: '0.68rem',
                                      borderRadius: '4px',
                                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                      color: '#60a5fa',
                                      border: '1px solid rgba(59, 130, 246, 0.4)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      fontWeight: 700,
                                    }}
                                  >
                                    <Download size={11} /> Baixar Planilha Revisada ({auditProof.auditorAttachment.name})
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3.2 DEMONSTRATIVO DE FLUXO OPERACIONAL & DRE DA CONTROLADORIA (LUCRO REAL) */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              borderTop: '4px solid #06b6d4',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calculator size={20} color="#22d3ee" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    3.2 Demonstrativo de Fluxo Operacional & DRE da Controladoria (Lucro Real)
                  </h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                  A apuração operacional do projeto é alimentada diretamente pelos <strong>Ganhos Brutos das 7 Fontes Tradicionais</strong> ({formatCurrency(total7SourcesSavings)}/ano = {formatCurrency(grossMonthly7Sources)}/mês), deduzindo quaisquer <strong>Outras Despesas Operacionais Recorrentes</strong> decorrentes da melhoria para cálculo da DRE de Lucro Real, Tax Shield e Payback.
                </p>
              </div>

              {!isViewer && (
                <button
                  type="button"
                  onClick={handleAddCostItem}
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s',
                  }}
                  title="Adicionar despesa ou custo operacional recorrente gerado pelo projeto"
                >
                  <Plus size={14} /> Adicionar Outra Despesa (-)
                </button>
              )}
            </div>

            {/* Tabela de Outras Despesas Operacionais Recorrentes */}
            {operationalItems.length > 0 ? (
              <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#090e1a', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: '#94a3b8', width: '90px' }}>Tipo</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: '#94a3b8' }}>Descrição da Despesa / Custo Decorrente</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#94a3b8', width: '110px' }}>Quantidade</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#94a3b8', width: '140px' }}>Custo Unitário (R$)</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#94a3b8', width: '140px' }}>Custo Mensal (R$)</th>
                      {!isViewer && (
                        <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#94a3b8', width: '60px' }}>Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {operationalItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              display: 'inline-block',
                            }}
                          >
                            CUSTO (-)
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <input
                            type="text"
                            disabled={isViewer}
                            value={item.description}
                            placeholder="Ex: Novo consumível, manutenção de dispositivo, energia adicional..."
                            onChange={(e) => handleUpdateOperationalItem(item.id, { description: e.target.value })}
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#050811', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.78rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <input
                            type="number"
                            step="0.01"
                            disabled={isViewer}
                            value={item.quantity !== undefined ? item.quantity : 1}
                            onChange={(e) => handleUpdateOperationalItem(item.id, { quantity: Number(e.target.value) })}
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#050811', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', textAlign: 'right', fontSize: '0.78rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <input
                            type="number"
                            step="0.01"
                            disabled={isViewer}
                            value={item.unitValue !== undefined ? item.unitValue : ''}
                            placeholder="0,00"
                            onChange={(e) => handleUpdateOperationalItem(item.id, { unitValue: Number(e.target.value) })}
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#050811', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', textAlign: 'right', fontSize: '0.78rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-heading)' }}>
                          - {formatCurrency(Math.abs(item.monthlyValue || 0))}
                        </td>
                        {!isViewer && (
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveOperationalItem(item.id)}
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                              title="Remover despesa"
                            >
                              <Trash2 size={14} color="#f87171" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Nenhuma outra despesa operacional recorrente cadastrada. O resultado operacional utiliza 100% dos Ganhos Brutos das 7 Fontes ({formatCurrency(grossMonthly7Sources)}/mês).
                </span>
                {!isViewer && (
                  <button
                    type="button"
                    onClick={handleAddCostItem}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Plus size={13} /> Adicionar Outra Despesa (-)
                  </button>
                )}
              </div>
            )}

            {/* Cascata Contábil da Controladoria (DRE Fiscal & Fluxo de Caixa) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              {/* Box 1: Apuração do Ganho Líquido Após IR */}
              <div style={{ backgroundColor: '#080d1a', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Resultado Operacional Mensal
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <span>(+) Ganho Bruto Mensal (7 Fontes):</span>
                  <strong style={{ color: '#34d399' }}>{formatCurrency(grossMonthly7Sources)}</strong>
                </div>
                {operationalCostsMonthly > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#f87171' }}>
                    <span>(-) Outras Despesas Recorrentes:</span>
                    <strong>- {formatCurrency(operationalCostsMonthly)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#38bdf8' }}>
                  <span>(=) Ganho Operacional Antes IR:</span>
                  <strong>{formatCurrency(grossMonthlyOperationalGain)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#f87171' }}>
                  <span>(-) IR s/ ganho ({numTaxRate}% Lucro Real):</span>
                  <strong>- {formatCurrency(incomeTaxOnGainMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ffffff', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.4rem', fontWeight: 800 }}>
                  <span>(=) GANHO LÍQUIDO (APÓS IR):</span>
                  <span>{formatCurrency(netOperationalGainMonthly)}</span>
                </div>
              </div>

              {/* Box 2: Escudo Fiscal da Depreciação (Tax Shield) */}
              <div style={{ backgroundColor: '#080d1a', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Benefício Fiscal da Depreciação (Tax Shield)
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <span>Depreciação Mensal ({numDeprMonths}m):</span>
                  <strong>{formatCurrency(monthlyDepreciation)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#38bdf8' }}>
                  <span>(+) IR s/ depreciação ({numTaxRate}%):</span>
                  <strong>+ {formatCurrency(taxShieldDepreciationMonthly)}</strong>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.15rem' }}>
                  Investimento Líquido {formatCurrency(netInvestmentCost)} depreciado linearmente em {numDeprMonths / 12} anos.
                </span>
              </div>

              {/* Box 3: Fluxo de Caixa Livre Mensal Oficial */}
              <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', padding: '1rem', borderRadius: '12px', border: '1.5px solid rgba(6, 182, 212, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase' }}>
                  (=) GANHO LÍQUIDO FINAL (FLUXO DE CAIXA MENSAL)
                </span>
                <strong style={{ fontSize: '1.6rem', color: '#22d3ee', fontFamily: 'var(--font-heading)' }}>
                  {formatCurrency(finalNetMonthlyCashFlow)}
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.35rem' }}>/mês</span>
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  Amortização oficial auditada pela Controladoria
                </span>
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
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* 1. Retorno Mensal Líquido */}
            <div>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} /> RETORNO MENSAL LÍQUIDO
              </span>
              <strong style={{ fontSize: '1.65rem', color: '#34d399', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(finalNetMonthlyCashFlow > 0 ? finalNetMonthlyCashFlow : provenMonthlySavings)}
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.25rem' }}>/mês</span>
              </strong>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                Fluxo de caixa livre após IR e depreciação
              </span>
            </div>

            {/* 2. Resultado do Ano (12 Meses) */}
            <div>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <TrendingUp size={13} /> RESULTADO DO ANO (12M)
              </span>
              <strong style={{ fontSize: '1.65rem', color: '#22d3ee', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency((finalNetMonthlyCashFlow > 0 ? finalNetMonthlyCashFlow : provenMonthlySavings) * 12)}
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.25rem' }}>/ano</span>
              </strong>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                Economia líquida anualizada
              </span>
            </div>

            {/* 3. Investimento Líquido (Capex) */}
            <div>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <DollarSign size={13} /> INVESTIMENTO LÍQUIDO (CAPEX)
              </span>
              <strong style={{ fontSize: '1.65rem', color: netInvestmentCost > 0 ? '#38bdf8' : '#64748b', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {netInvestmentCost > 0 ? formatCurrency(netInvestmentCost) : 'R$ 0,00'}
              </strong>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                {grossInvestmentCost > netInvestmentCost ? `Bruto: ${formatCurrency(grossInvestmentCost)} (- créditos)` : 'Sem créditos tributários'}
              </span>
            </div>

            {/* 4. Tempo de Payback */}
            <div>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} /> TEMPO DE PAYBACK
              </span>
              <strong style={{ fontSize: '1.65rem', color: '#fbbf24', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                {netInvestmentCost === 0 ? (
                  'Imediato'
                ) : simplePaybackMonths >= 12 ? (
                  <span>{(simplePaybackMonths / 12).toFixed(1)} <span style={{ fontSize: '0.85rem' }}>anos ({simplePaybackMonths}m)</span></span>
                ) : (
                  <span>{simplePaybackMonths} <span style={{ fontSize: '0.85rem' }}>meses</span></span>
                )}
              </strong>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
                Simples: {simplePaybackMonths}m {discountedPaybackMonths > 0 && discountedPaybackMonths < 900 ? `• Desc. (${numFinancialRate}%): ${discountedPaybackMonths}m` : ''}
              </span>
            </div>

            {/* 5. Vigência do Ciclo de 1 Ano (365 Dias) */}
            <div>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} /> VIGÊNCIA (1 ANO)
              </span>
              {action.masterApproved ? (
                isCycleExpired ? (
                  <div>
                    <strong style={{ fontSize: '1.25rem', color: '#fbbf24', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                      12m Concluídos
                    </strong>
                    <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
                      Incorporado à rotina base da fábrica
                    </span>
                  </div>
                ) : (
                  <div>
                    <strong style={{ fontSize: '1.35rem', color: '#34d399', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                      Mês {currentCycleMonth} de 12
                    </strong>
                    <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
                      Restam {remainingCycleMonths}m ({Math.max(0, 365 - daysSinceHomologation)}d)
                    </span>
                  </div>
                )
              ) : (
                <div>
                  <strong style={{ fontSize: '1.2rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem', fontFamily: 'var(--font-heading)' }}>
                    Pré-Homologação
                  </strong>
                  <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
                    Inicia 365 dias após homologação master
                  </span>
                </div>
              )}
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
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <User size={12} /> Enviado por: <strong style={{ color: '#f8fafc' }}>{att.uploadedBy || 'Agente'}</strong>
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={12} /> {formatDateTime(att.uploadedAt)}
                            </span>
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

                        {!isViewer && (
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
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Upload Area */}
            {!isViewer && (
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
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNewAttachmentCategory(
                          e.target.value as 'memorial_calculo' | 'evidencia_foto' | 'relatorio_tecnico' | 'outro'
                        )
                      }
                      style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                    >
                      <option value="memorial_calculo">Memorial de Cálculo Financeiro</option>
                      <option value="relatorio_tecnico">Relatório Técnico / Cronoanálise</option>
                      <option value="evidencia_foto">Fotos / Evidências do Posto</option>
                      <option value="outro">Outro Documento Comprobatório</option>
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
            )}
          </div>

          {/* Banner de Avanço de Etapa: Check -> Act */}
          <div
            style={{
              backgroundColor: isDark ? '#090e1a' : '#f8fafc',
              border: (achievedValue !== '' && achievedValue !== undefined)
                ? (isDark ? '1.5px solid #a855f7' : '1.5px solid #9333ea')
                : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: (achievedValue !== '' && achievedValue !== undefined) ? '#c084fc' : '#fbbf24',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {(achievedValue !== '' && achievedValue !== undefined) ? (
                  <CheckCircle2 size={14} color="#c084fc" />
                ) : (
                  <Clock size={14} color="#fbbf24" />
                )}
                Etapa 3: Verificação de Resultados (Check)
              </span>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0.2rem 0', fontFamily: 'var(--font-heading)' }}>
                {(achievedValue !== '' && achievedValue !== undefined)
                  ? 'Resultados e Eficácia Técnica Verificados!'
                  : 'Preencha o resultado real atingido para consolidar a eficácia da melhoria.'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                Ao avançar, o projeto passa automaticamente para a Etapa <strong>4. ACT (Padronização POP/SOP, Yokoten & Homologação)</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleSelectStage('act');
                window.scrollTo({ top: 250, behavior: 'smooth' });
              }}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                fontWeight: 800,
                fontSize: '0.875rem',
                borderRadius: '10px',
                backgroundColor: (achievedValue !== '' && achievedValue !== undefined) ? '#a855f7' : undefined,
                borderColor: (achievedValue !== '' && achievedValue !== undefined) ? '#a855f7' : undefined,
              }}
            >
              <span>Avançar para 4. ACT (Padronizar & Homologar)</span>
              <ArrowRight size={16} />
            </button>
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

          {/* Card 4.2b: Auditoria & Certificação Prévia da Controladoria */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              backgroundColor: !hasMonetaryGain
                ? '#0f172a'
                : action.controllershipAudit?.status === 'aprovado' || action.controllershipAudit?.status === 'ajustado_e_aprovado'
                ? 'rgba(16, 185, 129, 0.08)'
                : action.controllershipAudit?.status === 'pendente'
                ? 'rgba(245, 158, 11, 0.08)'
                : action.controllershipAudit?.status === 'rejeitado'
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(245, 158, 11, 0.05)',
              border: !hasMonetaryGain
                ? '1px dashed rgba(255, 255, 255, 0.15)'
                : action.controllershipAudit?.status === 'aprovado' || action.controllershipAudit?.status === 'ajustado_e_aprovado'
                ? '2px solid rgba(16, 185, 129, 0.45)'
                : action.controllershipAudit?.status === 'pendente'
                ? '2px solid rgba(245, 158, 11, 0.45)'
                : action.controllershipAudit?.status === 'rejeitado'
                ? '2px solid rgba(239, 68, 68, 0.45)'
                : '2px solid rgba(245, 158, 11, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: !hasMonetaryGain
                      ? 'rgba(59, 130, 246, 0.15)'
                      : action.controllershipAudit?.status === 'aprovado' || action.controllershipAudit?.status === 'ajustado_e_aprovado'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : action.controllershipAudit?.status === 'pendente'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : action.controllershipAudit?.status === 'rejeitado'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(245, 158, 11, 0.2)',
                    border: `1px solid ${!hasMonetaryGain ? 'rgba(59, 130, 246, 0.3)' : action.controllershipAudit?.status === 'aprovado' || action.controllershipAudit?.status === 'ajustado_e_aprovado' ? 'rgba(16, 185, 129, 0.4)' : action.controllershipAudit?.status === 'pendente' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileCheck2 size={24} color={!hasMonetaryGain ? '#60a5fa' : action.controllershipAudit?.status === 'aprovado' || action.controllershipAudit?.status === 'ajustado_e_aprovado' ? '#34d399' : action.controllershipAudit?.status === 'pendente' ? '#fbbf24' : '#f59e0b'} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      4.2b Governança Financeira & Auditoria da Controladoria
                    </h3>
                    {!hasMonetaryGain ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '0.15rem 0.55rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={11} /> DISPENSADO (PROJETO SEM GANHO MONETÁRIO)
                      </span>
                    ) : action.controllershipAudit?.status === 'aprovado' ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.15rem 0.55rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={11} /> GANHOS HOMOLOGADOS PELA CONTROLADORIA
                      </span>
                    ) : action.controllershipAudit?.status === 'ajustado_e_aprovado' ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.15rem 0.55rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={11} /> HOMOLOGADO COM AJUSTES DA CONTROLADORIA
                      </span>
                    ) : action.controllershipAudit?.status === 'pendente' ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '0.15rem 0.55rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Hourglass size={11} /> AGUARDANDO PARECER DA CONTROLADORIA
                      </span>
                    ) : action.controllershipAudit?.status === 'rejeitado' ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '0.15rem 0.55rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <X size={11} /> NECESSITA REVISÃO DE PREMISSAS
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '0.15rem 0.55rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={11} /> ENVIO OBRIGATÓRIO ({formatCurrency(identifiedGainValue)})
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0', maxWidth: '750px', lineHeight: 1.5 }}>
                    {!hasMonetaryGain
                      ? 'Este projeto não possui ganhos monetários diretos declarados (ações focadas em 5S, ergonomia, segurança, conformidade ou padronização de processos). Pela governança corporativa, o envio à Controladoria é dispensado e a Homologação Master está liberada diretamente.'
                      : action.controllershipAudit?.status === 'aprovado' || action.controllershipAudit?.status === 'ajustado_e_aprovado'
                      ? `Ganhos certificados por ${action.controllershipAudit.reviewedBy} (${action.controllershipAudit.reviewerRole || 'Controladoria'}) em ${formatDateTime(action.controllershipAudit.reviewedAt)}. Baseline financeiro liberado para o acompanhamento trimestral.`
                      : action.controllershipAudit?.status === 'pendente'
                      ? `Notificação com link escopado enviada para ${action.controllershipAudit.emailSentTo} em ${formatDateTime(action.controllershipAudit.submittedAt)}. O auditor analisará as 7 fontes de economia.`
                      : action.controllershipAudit?.status === 'rejeitado'
                      ? `Parecer da Controladoria: "${action.controllershipAudit.rejectionReason}". O projeto deve ser reavaliado no Gemba e ressubmetido.`
                      : `Este projeto possui retorno financeiro apurado (${formatCurrency(identifiedGainValue)}/ano). Pela regra de governança corporativa, é OBRIGATÓRIO submeter os ganhos para auditoria contábil antes da Homologação Master final.`}
                  </p>
                </div>
              </div>

              {/* Aviso Poka-Yoke: Submissão Bloqueada por Pendências 5W2H */}
              {hasMonetaryGain && uncompletedActivities.length > 0 && !action.controllershipAudit && (
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1.5px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Submissão Bloqueada à Controladoria:</strong> Existem <strong>{uncompletedActivities.length} atividade(s) 5W2H não concluída(s)</strong> no Passo 2.
                    Conforme a governança Lean corporativa, todas as ações de campo devem estar finalizadas antes da auditoria e certificação contábil.
                  </span>
                </div>
              )}

              {/* Botões de Ação do Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {!hasMonetaryGain ? (
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#93c5fd',
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <CheckCircle2 size={16} color="#60a5fa" /> Auditoria Dispensada (Sem Retorno Monetário)
                  </span>
                ) : !action.controllershipAudit ? (
                  <button
                    type="button"
                    onClick={handleSubmeterControladoria}
                    disabled={submittingControladoria || uncompletedActivities.length > 0}
                    className="btn btn-primary"
                    style={{
                      padding: '0.65rem 1.4rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      backgroundColor: uncompletedActivities.length > 0 ? '#475569' : '#2563eb',
                      cursor: uncompletedActivities.length > 0 ? 'not-allowed' : 'pointer',
                      opacity: uncompletedActivities.length > 0 ? 0.6 : 1,
                    }}
                    title={
                      uncompletedActivities.length > 0
                        ? `Submissão bloqueada: existem ${uncompletedActivities.length} atividade(s) 5W2H pendentes de conclusão.`
                        : undefined
                    }
                  >
                    <Send size={16} />
                    {submittingControladoria
                      ? 'Enviando Notificação...'
                      : uncompletedActivities.length > 0
                      ? `Submissão Bloqueada (${uncompletedActivities.length} pendências 5W2H)`
                      : 'Submeter à Controladoria'}
                  </button>
                ) : action.controllershipAudit.status === 'pendente' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link
                      href={`/controladoria/auditoria/${action.controllershipAudit.token}`}
                      target="_blank"
                      className="btn btn-primary"
                      style={{ padding: '0.6rem 1.15rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#2563eb' }}
                    >
                      <ExternalLink size={15} /> Abrir Portal do Controlador
                    </Link>

                    <button
                      type="button"
                      onClick={handleCopyAuditLink}
                      className="btn btn-secondary"
                      style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      {copiedAuditLink ? (
                        <>
                          <CheckCircle2 size={13} color="#34d399" /> Link Copiado!
                        </>
                      ) : (
                        'Copiar Link'
                      )}
                    </button>

                    {/* Atalho de Testes para o Usuário */}
                    <button
                      type="button"
                      onClick={handleQuickApproveControladoriaTest}
                      className="btn btn-secondary"
                      title="Atalho para testes locais sem precisar abrir o link externo"
                      style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', color: '#34d399', border: '1px dashed rgba(52, 211, 153, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Zap size={13} /> Aprovar (Modo Teste)
                    </button>
                  </div>
                ) : (
                  <Link
                    href={`/controladoria/auditoria/${action.controllershipAudit.token}`}
                    target="_blank"
                    className="btn btn-secondary"
                    style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <FileCheck2 size={15} color="#34d399" /> Ver Parecer da Controladoria
                  </Link>
                )}
              </div>
            </div>

            {/* Comparativo de Valores se Houve Ajuste */}
            {action.controllershipAudit?.status === 'ajustado_e_aprovado' && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                  <strong>Ajuste Homologado:</strong> A proposta original era de <strong>{formatCurrency(action.controllershipAudit.originalEstimatedCostAvoided)}/ano</strong>.
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#34d399' }}>
                  Valor Oficial Certificado: {formatCurrency(action.controllershipAudit.approvedEstimatedCostAvoided || action.estimatedCostAvoided)}/ano
                </span>
              </div>
            )}
          </div>

          {/* Card 4.3: Ciclo Real de 12 Meses de Ganhos Fabris (Homologação & Caixa Real) */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              backgroundColor: '#0f172a',
              border: (action?.quarterlyFollowUp?.monthsFilledCount || getFollowUpMonthsFilledCount(action)) > 0
                ? '1.5px solid rgba(6, 182, 212, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Topo do Bloco 4.3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
                  }}
                >
                  <Calendar size={22} color="#22d3ee" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      4.3 Ciclo Real de 12 Meses de Ganhos Fabris (Acompanhamento Contínuo)
                    </h3>
                    {hasMonetaryGain && (
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
                        <TrendingUp size={11} /> ACOMPANHAMENTO CONTÍNUO (12 MESES)
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(6, 182, 212, 0.15)',
                        color: '#22d3ee',
                        border: '1px solid rgba(6, 182, 212, 0.35)',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      ● {action.quarterlyFollowUp?.monthsFilledCount || getFollowUpMonthsFilledCount(action)}/12 MESES APURADOS
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0', maxWidth: '850px', lineHeight: 1.5 }}>
                    Alimentação mensal contínua dos resultados por 12 meses: a homologação do projeto é liberada mediante o aval da Controladoria (ou de forma direta para projetos sem retorno financeiro). Os meses de 1 a 12 integram o ciclo de sustentação regular no chão de fábrica, compondo o caixa real apurado no Gemba.
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* MESES 1 A 3: RESULTADOS INICIAIS DE SUSTENTAÇÃO                           */}
            {/* ========================================================================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(6, 182, 212, 0.18)',
                      color: '#22d3ee',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      padding: '0.12rem 0.5rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Meses 1 a 3
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff' }}>
                    Resultados Iniciais de Sustentação
                  </span>
                </div>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                  {getFollowUpMonthsFilledCount(action)} de 3 meses iniciais preenchidos
                </span>
              </div>

              {/* Grid Meses 1 a 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {([1, 2, 3] as const).map((mNum) => {
                  const mKey = `month${mNum}` as 'month1' | 'month2' | 'month3';
                  const entry = action.quarterlyFollowUp?.[mKey];
                  const isFilled = entry?.value !== undefined;
                  const monthName = getProjectMonthLabel(mNum, action);

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffffff' }}>
                            {mNum}º Mês
                          </span>
                          <span
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 800,
                              backgroundColor: 'rgba(6, 182, 212, 0.15)',
                              color: '#22d3ee',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              padding: '0.08rem 0.4rem',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {monthName}
                          </span>
                        </div>
                        {isFilled ? (
                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.1rem 0.45rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={10} /> Aferido
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.1rem 0.45rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Hourglass size={10} /> Pendente
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
                              <span>Data: {formatDate(entry.measuredAt)} ({monthName})</span>
                            </div>
                          )}
                          {entry.notes && (
                            <p style={{ margin: '0.2rem 0 0', fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.725rem', lineHeight: 1.4 }}>
                              &ldquo;{entry.notes}&rdquo;
                            </p>
                          )}
                          {!isViewer && (
                            <button
                              type="button"
                              onClick={() => handleOpenFollowUpModal(mNum)}
                              className="btn btn-secondary btn-sm"
                              style={{ marginTop: '0.5rem', fontSize: '0.725rem', width: '100%', justifyContent: 'center' }}
                            >
                              Editar Medição ({monthName})
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          {!isViewer ? (
                            <button
                              type="button"
                              onClick={() => handleOpenFollowUpModal(mNum)}
                              className="btn btn-primary btn-sm"
                              style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <Plus size={14} /> Lançar {mNum}º Mês ({monthName})
                            </button>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '0.4rem 0', fontSize: '0.725rem', color: '#64748b' }}>
                              Aguardando Aferição
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Banner de Média Trimestral e Homologação Master */}
              <div
                style={{
                  backgroundColor: isThreeMonthsFollowUpCompleted(action)
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(6, 182, 212, 0.08)',
                  border: isThreeMonthsFollowUpCompleted(action)
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
                      backgroundColor: isThreeMonthsFollowUpCompleted(action)
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(6, 182, 212, 0.2)',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sigma size={24} color="#22d3ee" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        Média de Sustentação Apurada
                      </h4>
                      <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#22d3ee', backgroundColor: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontFamily: 'var(--font-mono)' }}>
                        {action.quarterlyFollowUp?.monthsFilledCount || getFollowUpMonthsFilledCount(action)}/12 MESES APURADOS
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                      Média mensal de custo evitado apurada a partir dos lançamentos do acompanhamento contínuo no chão de fábrica.
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Média Mensal Apurada
                  </span>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#34d399', margin: 0, fontFamily: 'var(--font-mono)' }}>
                    {action.quarterlyFollowUp?.averageCostAvoided
                      ? formatCurrency(action.quarterlyFollowUp.averageCostAvoided)
                      : formatCurrency(Math.round((action.actualCostAvoided || totalGrossSavings || 0) / 12))}
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.25rem' }}>/mês</span>
                  </h3>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* FASE 2: CONSOLIDAÇÃO CONTÍNUA DE CAIXA (MESES 4 AO 12 - SEM TRAVAS DE DATA)*/}
            {/* ========================================================================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(245, 158, 11, 0.18)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      padding: '0.12rem 0.5rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Fase 2 • Caixa Real Fabril
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff' }}>
                    Meses 4 ao 12 (Alimentação Contínua sem Travas)
                  </span>
                </div>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                  Alimente conforme relatórios contábeis, refugo e paradas forem fechados
                </span>
              </div>

              {/* Grid Meses 4 a 12 (9 meses) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                {([4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((mNum) => {
                  const mKey = `month${mNum}`;
                  const entry = (action.quarterlyFollowUp as any)?.[mKey];
                  const isFilled = entry?.value !== undefined;
                  const monthName = getProjectMonthLabel(mNum, action);

                  return (
                    <div
                      key={mNum}
                      style={{
                        backgroundColor: '#090e1a',
                        border: isFilled
                          ? '1px solid rgba(16, 185, 129, 0.35)'
                          : '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '12px',
                        padding: '0.95rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.65rem',
                        boxShadow: isFilled ? '0 4px 15px rgba(16, 185, 129, 0.06)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffffff' }}>
                            {mNum}º Mês
                          </span>
                          <span
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 800,
                              backgroundColor: 'rgba(6, 182, 212, 0.15)',
                              color: '#22d3ee',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              padding: '0.08rem 0.4rem',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {monthName}
                          </span>
                        </div>
                        {isFilled ? (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.08rem 0.4rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={9} /> Aferido
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#cbd5e1', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '0.08rem 0.4rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Hourglass size={9} /> Pendente
                          </span>
                        )}
                      </div>

                      <div>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                          Resultado do Mês
                        </span>
                        <h5 style={{ fontSize: '1.2rem', fontWeight: 900, color: isFilled ? '#34d399' : '#64748b', margin: '0.15rem 0 0', fontFamily: 'var(--font-mono)' }}>
                          {isFilled ? formatCurrency(entry.value!) : 'R$ --'}
                        </h5>
                      </div>

                      {isFilled ? (
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {entry.measuredAt && <span>Data: {formatDate(entry.measuredAt)} ({monthName})</span>}
                          {entry.hoursSaved !== undefined && entry.hoursSaved > 0 && <span>{entry.hoursSaved}h salvas</span>}
                          {!isViewer && (
                            <button
                              type="button"
                              onClick={() => handleOpenFollowUpModal(mNum)}
                              className="btn btn-secondary btn-sm"
                              style={{ marginTop: '0.35rem', fontSize: '0.675rem', padding: '0.25rem 0.5rem', width: '100%', justifyContent: 'center' }}
                            >
                              Editar ({monthName})
                            </button>
                          )}
                        </div>
                      ) : (
                        !isViewer ? (
                          <button
                            type="button"
                            onClick={() => handleOpenFollowUpModal(mNum)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              padding: '0.45rem 0.5rem',
                              color: '#22d3ee',
                              borderColor: 'rgba(6, 182, 212, 0.35)',
                              backgroundColor: 'rgba(6, 182, 212, 0.08)',
                            }}
                          >
                            <Plus size={13} /> Lançar Mês {mNum} ({monthName})
                          </button>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '0.35rem 0', fontSize: '0.7rem', color: '#64748b' }}>
                            Aguardando Lançamento
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CONSOLIDAÇÃO FINANCEIRA GLOBAL DO PROJETO (12 MESES)                      */}
            {/* ========================================================================= */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                  Realizado em Caixa (Soma dos Meses Apurados)
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', margin: '0.25rem 0 0', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(action.quarterlyFollowUp?.totalRealizedCostAvoided ?? 0)}
                </h3>
                <span style={{ fontSize: '0.725rem', color: '#cbd5e1', marginTop: '0.2rem', display: 'block' }}>
                  Total apurado fisicamente no chão de fábrica
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                  Projeção a 12 Meses (Realizado + Média)
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22d3ee', margin: '0.25rem 0 0', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(
                    action.quarterlyFollowUp?.totalProjectedCostAvoided ||
                    ((action.quarterlyFollowUp?.averageCostAvoided || 0) * 12) ||
                    (action.actualCostAvoided || totalGrossSavings || 0)
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.25rem' }}>/ano</span>
                </h3>
                <span style={{ fontSize: '0.725rem', color: '#cbd5e1', marginTop: '0.2rem', display: 'block' }}>
                  Visão executiva estimada para fechamento de ciclo
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                  Taxa de Alimentação Operacional
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0 0', fontFamily: 'var(--font-mono)' }}>
                  {action.quarterlyFollowUp?.monthsFilledCount || getFollowUpMonthsFilledCount(action)}
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700, marginLeft: '0.25rem' }}>/ 12 meses</span>
                </h3>
                <span style={{ fontSize: '0.725rem', color: '#cbd5e1', marginTop: '0.2rem', display: 'block' }}>
                  {12 - (action.quarterlyFollowUp?.monthsFilledCount || getFollowUpMonthsFilledCount(action))} mês(es) a serem apurados
                </span>
              </div>
            </div>
          </div>

          {/* Card 4.3.5: Alinhamento com a Alta Gerência (Hoshin Kanri) */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1.5px solid rgba(59, 130, 246, 0.4)',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Target size={22} color="#60a5fa" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      Convergência Estratégica: Alta Gerência (Hoshin Kanri)
                    </h4>
                    {action.strategicObjectiveName && (
                      <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '0.1rem 0.5rem', borderRadius: '9999px' }}>
                        {action.strategicObjectiveName}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                    Avaliação contínua da aderência deste projeto às diretrizes e prioridades estratégicas da diretoria.
                  </p>
                </div>
              </div>

              {/* Botões de Ação e Seletor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleRecalculateStrategicAdherence}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Sparkles size={13} /> Recalcular Aderência
                </button>

                <select
                  value={action.strategicObjectiveId || ''}
                  onChange={(e) => handleUpdateStrategicObjective(e.target.value)}
                  style={{
                    backgroundColor: '#020617',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '8px',
                    padding: '0.4rem 0.75rem',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="">Alterar Diretriz da Diretoria...</option>
                  {dataService.getStrategicObjectives().map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} • {o.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Termômetro de Aderência Estratégica */}
            {(() => {
              const score = action.senseiStrategicAudit?.alignmentScore || 50;
              const color = score >= 80 ? '#22c55e' : score >= 60 ? '#38bdf8' : '#f59e0b';
              const label = score >= 80 ? 'Alta Aderência Estratégica' : score >= 60 ? 'Aderência Moderada' : 'Aderência Inicial / Em Evolução';

              return (
                <div
                  style={{
                    backgroundColor: 'rgba(2, 6, 23, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Grau de Aderência à Diretriz:</span>
                      <strong style={{ fontSize: '1.5rem', color, fontFamily: 'var(--font-mono)' }}>
                        {score}%
                      </strong>
                      <span style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>
                        • {label}
                      </span>
                    </div>

                    {action.senseiStrategicAudit?.initialScore !== undefined && (
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Iniciou em: {action.senseiStrategicAudit.initialScore}% (Evolução: +{Math.max(0, score - action.senseiStrategicAudit.initialScore)}%)
                      </span>
                    )}
                  </div>

                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, score)}%`,
                        height: '100%',
                        backgroundColor: color,
                        borderRadius: '9999px',
                        boxShadow: `0 0 10px ${color}`,
                        transition: 'width 0.8s ease-in-out',
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Parecer do Sensei IA */}
            {action.senseiStrategicAudit && (
              <div
                style={{
                  backgroundColor: 'rgba(2, 6, 23, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800 }}>
                    <Sparkles size={15} />
                    <span>Parecer do Sensei IA: Avaliação de Convergência</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {action.senseiStrategicAudit.modelUsed || 'Sensei IA'} • Avaliado em {formatDate(action.senseiStrategicAudit.evaluatedAt)}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{action.senseiStrategicAudit.justification}"
                </p>
                {action.senseiStrategicAudit.contributionSummary && (
                  <div style={{ fontSize: '0.78125rem', color: '#4ade80', fontWeight: 700, marginTop: '0.25rem' }}>
                    Impacto Quantificado: {action.senseiStrategicAudit.contributionSummary}
                  </div>
                )}
              </div>
            )}

            {/* Justificativa de Aderência do Supervisor na Triagem */}
            {action.supervisorAdherenceJustification && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f87171', fontSize: '0.8rem', fontWeight: 800 }}>
                    <ShieldAlert size={15} />
                    <span>Justificativa de Aderência do Supervisor (Aprovação com Baixo Alinhamento Hoshin):</span>
                  </div>
                  {action.triagedBy && (
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Aprovado por {action.triagedBy} {action.triagedAt ? `em ${formatDate(action.triagedAt)}` : ''}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: '#f1f5f9', fontSize: '0.84375rem', lineHeight: 1.5 }}>
                  "{action.supervisorAdherenceJustification}"
                </p>
              </div>
            )}

            {/* Sugestões do Sensei para Elevar o Percentual */}
            {action.senseiStrategicAudit?.improvementSuggestions && action.senseiStrategicAudit.improvementSuggestions.length > 0 && (
              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800 }}>
                  <TrendingUp size={15} />
                  <span>Dicas do Sensei para Elevar a Aderência aos Objetivos da Diretoria:</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {action.senseiStrategicAudit.improvementSuggestions.map((sug, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        color: '#f8fafc',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '6px',
                      }}
                    >
                      <span style={{ color: '#fbbf24', fontWeight: 800 }}>•</span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 4.4: Homologação Final da Entidade Master */}
          {(() => {
            const hasUncompleted = uncompletedActivities.length > 0;
            const isControllershipSatisfied = !hasMonetaryGain || isControllershipApproved;
            const isFullyReady = !hasUncompleted && isControllershipSatisfied;
            const isAwaitingApproval = action.status === 'aguardando_aprovacao' || action.submittedForApproval;
            const isBlockedByControladoria = hasMonetaryGain && !isControllershipApproved;

            return (
              <div
                className="card"
                style={{
                  padding: '1.75rem',
                  borderRadius: '16px',
                  border: action.masterApproved
                    ? '2px solid rgba(16, 185, 129, 0.5)'
                    : isAwaitingApproval
                    ? '2px solid rgba(168, 85, 247, 0.5)'
                    : hasUncompleted
                    ? '2px solid rgba(239, 68, 68, 0.45)'
                    : isBlockedByControladoria
                    ? '2px solid rgba(245, 158, 11, 0.5)'
                    : '2px solid rgba(16, 185, 129, 0.4)',
                  backgroundColor: action.masterApproved
                    ? 'rgba(16, 185, 129, 0.1)'
                    : isAwaitingApproval
                    ? 'rgba(168, 85, 247, 0.1)'
                    : hasUncompleted
                    ? 'rgba(239, 68, 68, 0.06)'
                    : isBlockedByControladoria
                    ? 'rgba(245, 158, 11, 0.06)'
                    : 'rgba(16, 185, 129, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                {/* Banner de Bloqueio 5W2H se houver pendências */}
                {hasUncompleted && !action.masterApproved && (
                  <div
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1.5px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                    }}
                  >
                    <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Homologação Bloqueada:</strong> Existem <strong>{uncompletedActivities.length} atividade(s) do Plano de Ação 5W2H não concluída(s)</strong> no Passo 2.
                      Para auditoria interna e governança, todas as contramedidas devem ser finalizadas no Gemba antes da homologação.
                    </span>
                  </div>
                )}

                {/* Banner de Bloqueio da Controladoria por Ganho Monetário */}
                {isBlockedByControladoria && !action.masterApproved && !hasUncompleted && (
                  <div
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '10px',
                      backgroundColor: action.controllershipAudit?.status === 'pendente'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : action.controllershipAudit?.status === 'rejeitado'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                      border: `1.5px solid ${action.controllershipAudit?.status === 'pendente'
                        ? 'rgba(245, 158, 11, 0.4)'
                        : action.controllershipAudit?.status === 'rejeitado'
                        ? 'rgba(239, 68, 68, 0.4)'
                        : 'rgba(245, 158, 11, 0.4)'}`,
                      color: action.controllershipAudit?.status === 'rejeitado' ? '#fca5a5' : '#fde68a',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                    }}
                  >
                    <ShieldAlert size={18} color={action.controllershipAudit?.status === 'rejeitado' ? '#ef4444' : '#f59e0b'} style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Homologação Bloqueada pela Controladoria:</strong> Este projeto possui retorno monetário identificado ({formatCurrency(identifiedGainValue)}).
                      {!action.controllershipAudit
                        ? ' Conforme as diretrizes corporativas, é OBRIGATÓRIO submeter este projeto para auditoria da Controladoria no Passo 4.2b antes da homologação final.'
                        : action.controllershipAudit.status === 'pendente'
                        ? ` Notificação enviada em ${formatDateTime(action.controllershipAudit.submittedAt)}. Aguardando parecer do auditor contábil.`
                        : ` A Controladoria solicitou ajustes contábeis: "${action.controllershipAudit.rejectionReason}". Revise os cálculos no Passo 4.2b.`}
                    </span>
                  </div>
                )}

                {/* Banner Informativo: Projeto sem Ganho Financeiro (Dispensado) */}
                {!hasMonetaryGain && !action.masterApproved && !hasUncompleted && (
                  <div
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      color: '#93c5fd',
                      fontSize: '0.78125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Auditoria da Controladoria Dispensada:</strong> Projeto orientado a melhorias operacionais sem ganho monetário direto (5S / Segurança / Ergonomia / Padronização). Homologação técnica liberada diretamente.
                    </span>
                  </div>
                )}

                {/* Seleção do Modelo de Retorno Financeiro: Recorrente vs. Pontual Único */}
                {hasMonetaryGain && !action.masterApproved && (
                  <div
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      backgroundColor: isOneOffGain ? 'rgba(56, 189, 248, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      border: `1.5px solid ${isOneOffGain ? 'rgba(56, 189, 248, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={17} color={isOneOffGain ? '#38bdf8' : '#34d399'} />
                        <span style={{ fontWeight: 800, fontSize: '0.875rem', color: isOneOffGain ? '#e0f2fe' : '#ecfdf5' }}>
                          Classificação do Retorno Contábil ({formatCurrency(identifiedGainValue)})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOneOffGain(false);
                            dataService.updateAction(action.id, { isOneOffGain: false });
                          }}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: !isOneOffGain ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                            backgroundColor: !isOneOffGain ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: !isOneOffGain ? '#34d399' : '#94a3b8',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          Ganho Recorrente (12 Meses)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Confirmar Ganho Pontual Único?\n\nO projeto declarará que o ganho de ${formatCurrency(identifiedGainValue)} é pontual (one-off).\n\nEle será contabilizado integralmente no mês da homologação e o projeto entrará diretamente para o histórico de ciclo de 12 meses concluído, sem exigir acompanhamento mensal.`
                            );
                            if (confirmed) {
                              setIsOneOffGain(true);
                              dataService.updateAction(action.id, { isOneOffGain: true });
                            }
                          }}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            border: isOneOffGain ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                            backgroundColor: isOneOffGain ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: isOneOffGain ? '#38bdf8' : '#94a3b8',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          Ganho Pontual Único (Sem Acompanhamento)
                        </button>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.78125rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {isOneOffGain ? (
                        <span>
                          <strong style={{ color: '#38bdf8' }}>Modo Ganho Pontual Único ativo:</strong> O valor de{' '}
                          <strong style={{ color: '#ffffff' }}>{formatCurrency(identifiedGainValue)}</strong> será contabilizado apenas no mês de homologação. O ciclo de 12 meses será encerrado como concluído/consolidado, sem exigir acompanhamento mensal no chão de fábrica.
                        </span>
                      ) : (
                        <span>
                          <strong style={{ color: '#34d399' }}>Modo Ganho Recorrente ativo:</strong> O projeto terá acompanhamento mensal de resultados (3 meses de homologação + 9 meses contínuos) para comprovação da sustentação do resultado.
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: action.masterApproved
                        ? '#10b981'
                        : isAwaitingApproval
                        ? '#9333ea'
                        : hasUncompleted
                        ? '#dc2626'
                        : isBlockedByControladoria
                        ? '#d97706'
                        : '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.35rem',
                      boxShadow: action.masterApproved ? '0 0 15px rgba(16, 185, 129, 0.4)' : isFullyReady ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
                    }}
                  >
                    {action.masterApproved ? (
                      <CheckCircle2 size={24} color="#ffffff" />
                    ) : isAwaitingApproval ? (
                      <Hourglass size={24} color="#ffffff" />
                    ) : hasUncompleted ? (
                      <AlertTriangle size={24} color="#ffffff" />
                    ) : isBlockedByControladoria ? (
                      <Landmark size={24} color="#ffffff" />
                    ) : (
                      <Rocket size={24} color="#ffffff" />
                    )}
                  </div>

                  <div>
                    <h4
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        color: action.masterApproved
                          ? '#34d399'
                          : isAwaitingApproval
                          ? '#c084fc'
                          : hasUncompleted
                          ? '#f87171'
                          : isBlockedByControladoria
                          ? '#fbbf24'
                          : '#34d399',
                        margin: 0,
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {action.masterApproved
                        ? '4.4 Projeto Homologado pela Entidade Master'
                        : isAwaitingApproval
                        ? '4.4 Aguardando Homologação do Gestor Master'
                        : hasUncompleted
                        ? `4.4 Homologação Bloqueada (${uncompletedActivities.length} Ação(ões) 5W2H Pendente(s))`
                        : isBlockedByControladoria
                        ? '4.4 Homologação Bloqueada (Exige Aval da Controladoria)'
                        : '4.4 Pronto para Homologação Master'}
                    </h4>

                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                      {action.masterApproved
                        ? `Validado por ${action.masterApprovedBy || 'Gestor Master'} em ${formatDateTime(action.masterApprovedAt)}. Custo evitado integrado oficialmente aos relatórios executivos e DRE.`
                        : isAwaitingApproval
                        ? `Submetido por ${action.submittedForApprovalBy || action.assignedAgentName || 'Agente'} em ${formatDateTime(action.submittedForApprovalAt || action.updatedAt)}.`
                        : hasUncompleted
                        ? `O projeto não pode ser homologado enquanto existirem ${uncompletedActivities.length} atividade(s) 5W2H pendentes de conclusão no Passo 2.`
                        : isBlockedByControladoria
                        ? `Este projeto possui ganho monetário identificado (${formatCurrency(identifiedGainValue)}). O envio e parecer aprovado da Controladoria no Passo 4.2b são obrigatórios para homologação.`
                        : !hasMonetaryGain
                        ? 'Todas as ações 5W2H foram finalizadas com sucesso e o envio à Controladoria está dispensado. O projeto está 100% pronto para homologação técnica.'
                        : 'Ações 5W2H concluídas e certificação contábil da Controladoria aprovada com sucesso! O projeto está 100% liberado para homologação do Gestor Master.'}
                    </p>
                  </div>
                </div>

                {/* Actions for Agent vs Supervisor */}
                <div>
                  {action.masterApproved ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
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
                        <CheckCircle2 size={16} /> Homologado
                      </span>

                      {/* Status de Vigência no Ano (365 Dias) ou Ganho Pontual Consolidado */}
                      {action.isOneOffGain ? (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Sparkles size={11} /> Ganho Pontual Único ({formatCurrency(action.actualCostAvoided)}) • Ciclo Consolidado
                        </span>
                      ) : isCycleExpired ? (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Clock size={11} /> Ciclo 1 Ano Concluído ({daysSinceHomologation}d) • Incorporado à Rotina
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            backgroundColor: 'rgba(6, 182, 212, 0.15)',
                            color: '#22d3ee',
                            border: '1px solid rgba(6, 182, 212, 0.35)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22d3ee', display: 'inline-block' }} /> Mês {currentCycleMonth} de 12 • Faltam {remainingCycleMonths} meses de vigência
                        </span>
                      )}
                    </div>
                  ) : currentUser?.role === 'agent' ? (
                    <button
                      type="button"
                      disabled={!isFullyReady}
                      onClick={handleAgentSubmitForApproval}
                      className={`btn ${isFullyReady ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isFullyReady ? 1 : 0.6,
                        cursor: isFullyReady ? 'pointer' : 'not-allowed',
                        backgroundColor: isAwaitingApproval ? '#7c3aed' : isFullyReady ? '#2563eb' : undefined,
                        borderColor: isAwaitingApproval ? '#7c3aed' : isFullyReady ? '#2563eb' : undefined,
                      }}
                      title={
                        hasUncompleted
                          ? `A homologação está bloqueada: existem ${uncompletedActivities.length} atividade(s) 5W2H não concluída(s) no Passo 2.`
                          : isBlockedByControladoria
                          ? `Submissão bloqueada: projetos com ganho financeiro (${formatCurrency(identifiedGainValue)}) exigem aprovação da Controladoria no Passo 4.2b.`
                          : undefined
                      }
                    >
                      {isFullyReady ? <Send size={15} /> : <AlertTriangle size={15} />}
                      <span>
                        {isAwaitingApproval
                          ? 'Reenviar para Homologação Master'
                          : hasUncompleted
                          ? `Homologação Bloqueada (${uncompletedActivities.length} 5W2H)`
                          : isBlockedByControladoria
                          ? 'Homologação Bloqueada (Aguardando Controladoria)'
                          : 'Submeter para Homologação Master'}
                      </span>
                    </button>
                  ) : isViewer ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(168, 85, 247, 0.15)',
                        color: '#c084fc',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                        fontWeight: 800,
                        fontSize: '0.8125rem',
                      }}
                    >
                      <Eye size={15} /> Modo Somente Leitura (Consulta Diretoria)
                    </span>
                  ) : (
                    // Supervisor / Master Manager
                    <button
                      type="button"
                      disabled={!isFullyReady}
                      onClick={handleMasterApprove}
                      className="btn btn-success"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isFullyReady ? 1 : 0.6,
                        cursor: isFullyReady ? 'pointer' : 'not-allowed',
                      }}
                      title={
                        hasUncompleted
                          ? `A homologação master está bloqueada: existem ${uncompletedActivities.length} atividade(s) 5W2H não concluída(s) no Passo 2.`
                          : isBlockedByControladoria
                          ? `Homologação bloqueada: projetos com ganho monetário (${formatCurrency(identifiedGainValue)}) exigem parecer aprovado da Controladoria no Passo 4.2b.`
                          : 'Homologar projeto e concluir ciclo PDCA'
                      }
                    >
                      {isFullyReady ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span>
                        {hasUncompleted
                          ? `Homologação Bloqueada (${uncompletedActivities.length} 5W2H)`
                          : isBlockedByControladoria
                          ? 'Homologação Bloqueada (Aguardando Controladoria)'
                          : isOneOffGain
                          ? 'Homologar Ganho Pontual Único & Consolidar Ciclo'
                          : 'Homologar Projeto & Concluir Ciclo PDCA'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
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
                  Aferição do {followUpModalMonth}º Mês ({getProjectMonthLabel(followUpModalMonth, action)})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpModalMonth(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Fechar"
              >
                <X size={18} />
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
                  { num: 5 as const, label: '5 • ANTES & DEPOIS', color: '#38bdf8' },
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

              {/* Right: Sensei Voice Assistant, Counter & Close Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Assistente de Voz ao Vivo: SENSEI */}
                <SenseiVoiceAssistant project={action} currentSlide={presentationSlide} />

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

            {/* Slide Body - Layout Dinâmico Executivo (Zero Scrollbar) */}
            <div
              style={{
                flex: 1,
                overflow: 'hidden',
                padding: '1.15rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
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
                  { label: 'Método', val: ishikawaMethod || action.ishikawa?.method, icon: Ruler },
                  { label: 'Máquina', val: ishikawaMachine || action.ishikawa?.machine, icon: Settings },
                  { label: 'Material', val: ishikawaMaterial || action.ishikawa?.material, icon: Box },
                  { label: 'Mão de Obra', val: ishikawaManpower || action.ishikawa?.manpower, icon: HardHat },
                  { label: 'Medição', val: ishikawaMeasurement || action.ishikawa?.measurement, icon: Ruler },
                  { label: 'Meio Ambiente', val: ishikawaEnvironment || action.ishikawa?.environment, icon: Thermometer },
                ].filter((item) => Boolean(item.val && item.val.trim()));
                const hasIshikawa = ishikawaItems.length > 0;

                const hasProblemCost = Boolean(currentProblemCostMonthly && Number(currentProblemCostMonthly) > 0);

                const effectiveLeader = leaderName || action.leaderName || action.assignedAgentName;
                const effectiveTeam = teamMembersInput
                  ? teamMembersInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
                  : (action.teamMembers || []);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '0.5rem' }}>
                    {/* Header */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                        <span style={{ fontSize: '0.675rem', fontWeight: 900, color: '#22d3ee', backgroundColor: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
                          1. PLAN (PLANEJAR)
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Diagnóstico da Causa Raiz, Liderança & Metas</span>
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        Diagnóstico do Problema Fabril & Definição de Metas
                      </h2>
                    </div>

                    {/* Dynamic 2-Column Balanced Content */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem', alignItems: 'stretch' }}>
                      {/* Left Column: Diagnóstico Causal & Citação das Ferramentas Usadas */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {/* Declaração da Causa Raiz & Problema */}
                        <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <h4 style={{ fontSize: '0.725rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Target size={13} /> Declaração da Causa Raiz & Problema
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#ffffff', lineHeight: 1.4 }}>
                            {problemStatement || action.description || 'Causa raiz diagnosticada no posto de trabalho.'}
                          </p>
                        </div>

                        {/* Ferramentas Lean Aplicadas no Diagnóstico (Citação Sintética) */}
                        <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h4 style={{ fontSize: '0.725rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Wrench size={13} /> Ferramentas Lean Utilizadas no Diagnóstico
                            </h4>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                              Fase Plan
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {/* 5 Porquês */}
                            {hasFiveWhys && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Search size={14} color="#fbbf24" />
                                  <strong style={{ fontSize: '0.75rem', color: '#fbbf24' }}>5 Porquês</strong>
                                </div>
                                <span style={{ fontSize: '0.675rem', color: '#cbd5e1', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {activeFiveWhys.length} níveis • Raiz: {activeFiveWhys[activeFiveWhys.length - 1]?.replace(/^[0-9]+[\.\)\-]?\s*/, '')}
                                </span>
                              </div>
                            )}

                            {/* Ishikawa 6M */}
                            {hasIshikawa && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Workflow size={14} color="#34d399" />
                                  <strong style={{ fontSize: '0.75rem', color: '#34d399' }}>Ishikawa 6M</strong>
                                </div>
                                <span style={{ fontSize: '0.675rem', color: '#cbd5e1' }}>
                                  {ishikawaItems.map((m) => m.label).join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Pareto 80/20 */}
                            {hasPareto && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <BarChart3 size={14} color="#38bdf8" />
                                  <strong style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Pareto 80/20</strong>
                                </div>
                                <span style={{ fontSize: '0.675rem', color: '#cbd5e1', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {action.pareto?.cumulativeImpactPercentage ? `${action.pareto.cumulativeImpactPercentage}% vital` : 'Causas vitais'}
                                </span>
                              </div>
                            )}

                            {/* Fallback se nenhuma ferramenta foi preenchida */}
                            {!hasFiveWhys && !hasIshikawa && !hasPareto && (
                              <div style={{ backgroundColor: '#090e1a', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                                  Diagnóstico de posto, observação em Gemba e estratificação do problema.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Metas Baseline vs Alvo & Ficha da Equipe */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {/* Metas Baseline vs Alvo */}
                        <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                            Indicador Chave do Projeto
                          </span>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', margin: '0.15rem 0 0.55rem', fontFamily: 'var(--font-heading)' }}>
                            {targetMetricName || 'Tempo de Ciclo / Perda de Processo'}
                          </h3>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                            <div style={{ backgroundColor: '#090e1a', padding: '0.55rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                              <span style={{ fontSize: '0.625rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                Baseline (Antes)
                              </span>
                              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                                {baselineValue !== '' ? `${baselineValue} ${targetMetricUnit}` : '--'}
                              </span>
                            </div>

                            <div style={{ backgroundColor: '#090e1a', padding: '0.55rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                              <span style={{ fontSize: '0.625rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                Meta Alvo
                              </span>
                              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                                {targetGoalValue !== '' ? `${targetGoalValue} ${targetMetricUnit}` : '--'}
                              </span>
                            </div>
                          </div>

                          {hasProblemCost && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.45rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Custo mensal da perda:</span>
                              <strong style={{ fontSize: '0.85rem', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                                {formatCurrency(Number(currentProblemCostMonthly))}/mês
                              </strong>
                            </div>
                          )}
                        </div>

                        {/* Ficha da Equipe & Liderança */}
                        <div style={{ backgroundColor: '#0f172a', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: '#fbbf24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Award size={13} /> Líder do Kaizen:
                            </span>
                            <strong style={{ color: '#ffffff' }}>{effectiveLeader}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <User size={13} /> Agente Lean:
                            </span>
                            <strong style={{ color: '#cbd5e1' }}>{action.assignedAgentName}</strong>
                          </div>
                          {effectiveTeam.length > 0 && (
                            <div style={{ fontSize: '0.75rem', marginTop: '0.15rem', paddingTop: '0.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <span style={{ color: '#22d3ee', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.15rem' }}>
                                <Users size={13} /> Pessoas Envolvidas:
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                {effectiveTeam.map((member, mIdx) => (
                                  <span
                                    key={mIdx}
                                    style={{
                                      fontSize: '0.65rem',
                                      backgroundColor: '#090e1a',
                                      border: '1px solid rgba(255, 255, 255, 0.08)',
                                      padding: '0.1rem 0.4rem',
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                            <span style={{ color: '#94a3b8' }}>Setor:</span>
                            <strong style={{ color: '#ffffff' }}>{action.originSectorName || 'Fábrica'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
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
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckSquare size={14} /> Ações Executadas no Chão de Fábrica
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
                                  <span style={{ color: item.completed ? '#34d399' : '#fbbf24', display: 'flex', alignItems: 'center' }}>
                                    {item.completed ? <CheckCircle2 size={13} /> : <Clock size={13} />}
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
                  { label: 'Paradas de Máquina / OEE', icon: Settings, val: Number(machineDowntime) || 0 },
                  { label: 'Mão de Obra / Setup Otimizado', icon: Clock, val: Number(laborSavings) || 0 },
                  { label: 'Redução de Refugo / Sucata', icon: Trash2, val: Number(scrapReduction) || 0 },
                  { label: 'Aumento de Produção / Capacidade', icon: TrendingUp, val: Number(productionIncrease) || 0 },
                  { label: 'Energia, Ferramental & Insumos', icon: Zap, val: Number(toolingAndEnergy) || 0 },
                  { label: 'Logística, Frete & Movimentação', icon: Truck, val: Number(logisticsAndFreight) || 0 },
                  { label: 'Outras Economias Operacionais', icon: Lightbulb, val: Number(otherSavings) || 0 },
                ].filter((s) => s.val > 0);

                // Composição dos custos / investimento (> 0)
                const activeCosts = [
                  { label: 'Peças, Sensores & Dispositivos', val: Number(partsAndEquipment) || 0 },
                  { label: 'Serviços de Terceiros / Usinagem', val: Number(thirdPartyServices) || 0 },
                  { label: 'Horas Equipe Interna', val: (Number(internalLaborHours) || 0) * (Number(laborHourlyRate) || 0), detail: `${internalLaborHours || 0}h @ R$ ${laborHourlyRate || 0}/h` },
                  { label: 'Outras Despesas Operacionais', val: Number(otherCosts) || 0 },
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
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '0.65rem' }}>
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
                          <span style={{ fontSize: '0.65rem', color: '#22d3ee', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Target size={13} /> 1. Eficácia Técnica no Posto
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
                              <span style={{ fontSize: '0.575rem', color: '#34d399', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>Atingido</span>
                              <strong style={{ fontSize: '1.05rem', color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                                {achievedValue !== '' ? achievedValue : targetGoalValue} <span style={{ fontSize: '0.65rem' }}>{targetMetricUnit}</span>
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.3rem 0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 800 }}>
                            {technicalGainText}
                          </span>
                        </div>
                      </div>

                      {/* Pillar 2: Balanço Financeiro do Projeto (Ganhos - Custos = Lucro) */}
                      <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 0 16px rgba(16, 185, 129, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <DollarSign size={13} /> 2. Balanço Financeiro (DRE Anual)
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
                          <span style={{ fontSize: '0.65rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <TrendingUp size={13} /> 3. Eficiência & Retorno
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
                          <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> Horas Salvas:</span>
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
                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }} /> Composição dos Ganhos Lean ({activeSources.length} fontes ativas)
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                            Total: {formatCurrency(grossValue)}
                          </span>
                        </div>

                        {activeSources.length === 0 ? (
                          <div style={{ padding: '0.75rem', backgroundColor: '#090e1a', borderRadius: '8px', textAlign: 'center', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
                            Custo evitado homologado de {formatCurrency(grossValue)}/ano no posto de trabalho.
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
                                    <src.icon size={13} color="#22d3ee" style={{ flexShrink: 0 }} />
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
                            <span style={{ fontSize: '0.675rem', fontWeight: 800, color: totalInvestmentCost > 0 ? '#f87171' : '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Wrench size={13} /> Investimento & Recursos Aplicados
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                              {totalInvestmentCost > 0 ? formatCurrency(totalInvestmentCost) : 'Custo Zero'}
                            </span>
                          </div>

                          {activeCosts.length === 0 ? (
                            <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '6px', color: '#22d3ee', fontSize: '0.7rem', lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Zap size={13} style={{ flexShrink: 0 }} /> <span><strong>Melhoria Kaizen de Baixo Custo:</strong> Executada 100% com recursos internos da equipe de manufatura.</span>
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
                            <FileText size={12} /> {attachments.length > 0 ? `${attachments.length} Memorial(is) PDF Anexado(s)` : 'Memorial Aferido no Posto'}
                          </span>
                          <span style={{ color: '#34d399', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={12} /> Aprovado & Homologado
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
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
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
                            {standardWorkUpdated ? 'POP Atualizado' : 'Em revisão operacional'}
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
                          {action.masterApproved ? 'HOMOLOGADO MASTER' : 'Em processo de homologação'}
                        </strong>
                        {action.masterApprovedBy && (
                          <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block' }}>
                            Por: {action.masterApprovedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card 3: Sustentação Inicial (Meses 1 a 3) */}
                    <div style={{ backgroundColor: '#0f172a', padding: '1.15rem', borderRadius: '14px', border: '1px solid rgba(6, 182, 212, 0.35)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={18} color="#22d3ee" />
                        <h4 style={{ fontSize: '0.84375rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          Sustentação Inicial (Meses 1 a 3)
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
              {/* SLIDE 5: ANTES & DEPOIS (Apenas Foto Antes e Foto Depois)           */}
              {/* =================================================================== */}
              {presentationSlide === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
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
                    <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '16px', border: '1.5px solid rgba(239, 68, 68, 0.35)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Camera size={14} /> ANTES DA MELHORIA
                        </span>
                        {!isViewer && (
                          <label style={{ fontSize: '0.675rem', color: '#22d3ee', cursor: 'pointer', fontWeight: 700 }}>
                            {photoBeforeUrl ? 'Alterar Foto' : '+ Enviar Foto'}
                            <input type="file" accept="image/*" onChange={handlePhotoBeforeUpload} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>

                      {photoBeforeUrl ? (
                        <div style={{ height: '225px', backgroundColor: '#090e1a', borderRadius: '10px', overflow: 'hidden' }}>
                          <img src={photoBeforeUrl} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : isViewer ? (
                        <div
                          style={{
                            height: '225px',
                            backgroundColor: '#090e1a',
                            border: '1px dashed rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            gap: '0.5rem',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <ImageIcon size={28} color="#64748b" />
                          <span>Nenhuma foto do <strong>Antes</strong> registrada</span>
                        </div>
                      ) : (
                        <label
                          style={{
                            height: '225px',
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
                    <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '16px', border: '1.5px solid rgba(16, 185, 129, 0.45)', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 0 25px rgba(16, 185, 129, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Camera size={14} /> DEPOIS (POSTO PADRONIZADO)
                        </span>
                        {!isViewer && (
                          <label style={{ fontSize: '0.675rem', color: '#34d399', cursor: 'pointer', fontWeight: 700 }}>
                            {photoAfterUrl ? 'Alterar Foto' : '+ Enviar Foto'}
                            <input type="file" accept="image/*" onChange={handlePhotoAfterUpload} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>

                      {photoAfterUrl ? (
                        <div style={{ height: '225px', backgroundColor: '#090e1a', borderRadius: '10px', overflow: 'hidden' }}>
                          <img src={photoAfterUrl} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : isViewer ? (
                        <div
                          style={{
                            height: '225px',
                            backgroundColor: '#090e1a',
                            border: '1px dashed rgba(16, 185, 129, 0.2)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            gap: '0.5rem',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <ImageIcon size={28} color="#64748b" />
                          <span>Nenhuma foto do <strong>Depois</strong> registrada</span>
                        </div>
                      ) : (
                        <label
                          style={{
                            height: '225px',
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

              {/* Dica de Passador de Slides / Teclado / Sensei */}
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Monitor size={13} /> <strong>Passador / Teclado</strong> • <Mic size={13} /> <strong>Voz:</strong> Diga <em>&ldquo;Sensei...&rdquo;</em> • <strong>ESC</strong> para sair
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

      {/* Sensei Copilot Modal (Auditoria, Refinamento & Chat) */}
      {action && (
        <SenseiCopilotModal
          isOpen={showSenseiCopilot}
          onClose={() => setShowSenseiCopilot(false)}
          project={{
            ...action,
            problemStatement,
            fiveWhys: fiveWhys.filter(Boolean),
            ishikawa: {
              method: ishikawaMethod,
              machine: ishikawaMachine,
              material: ishikawaMaterial,
              manpower: ishikawaManpower,
              measurement: ishikawaMeasurement,
              environment: ishikawaEnvironment,
              primaryRootCause: ishikawaRootCause,
            },
            checklist: checklistItems,
            targetMetricName,
            targetMetricUnit,
            baselineValue: typeof baselineValue === 'number' ? baselineValue : 0,
            targetGoalValue: typeof targetGoalValue === 'number' ? targetGoalValue : 0,
            achievedValue: typeof achievedValue === 'number' ? achievedValue : 0,
            hoursSaved: Number(action.hoursSaved) || 0,
            actualCostAvoided: Number(action.actualCostAvoided) || Number(action.estimatedCostAvoided) || 0,
            standardWorkDocRef,
            lessonsLearned,
            yokotenReplication,
          }}
          onApplyRefinement={handleApplySenseiRefinement}
        />
      )}

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
          originalText={pendingActivityPayload?.label || newActionLabel}
          evaluation={qualityEvaluation}
          onAdopt={handleAdoptQualitySuggestion}
          itemTypeLabel="Atividade 5W2H"
          context={{
            sectorName: pendingActivityPayload?.responsibleSectorName,
            projectName: action?.title,
          }}
        />
      )}

      {/* Modal de Visualização de Arquivo de Memória de Cálculo / Ganhos */}
      {previewGainAttachment && (
        <Modal
          isOpen={Boolean(previewGainAttachment)}
          onClose={() => setPreviewGainAttachment(null)}
          title={`Memória de Cálculo: ${previewGainAttachment.name}`}
          subtitle={`Tamanho: ${previewGainAttachment.sizeFormatted} • Anexado por ${previewGainAttachment.uploadedBy || 'Agente Lean'} em ${formatDateTime(previewGainAttachment.uploadedAt)}`}
          maxWidth="4xl"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '320px' }}>
            {previewGainAttachment.fileType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(previewGainAttachment.name) ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#050811', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <img
                  src={previewGainAttachment.url}
                  alt={previewGainAttachment.name}
                  style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain', borderRadius: '6px' }}
                />
              </div>
            ) : previewGainAttachment.fileType === 'application/pdf' || /\.pdf$/i.test(previewGainAttachment.name) ? (
              <div style={{ width: '100%', height: '70vh', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <iframe
                  src={previewGainAttachment.url}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={previewGainAttachment.name}
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
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <FileSpreadsheet size={34} color="#34d399" />
                </div>
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '1.15rem', margin: '0 0 0.4rem 0', fontWeight: 800 }}>
                    {previewGainAttachment.name}
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                    Planilha de Cálculo / Documento Corporativo ({previewGainAttachment.sizeFormatted})
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0.35rem 0 0 0' }}>
                    Para inspecionar fórmulas, macros e tabelas dinâmicas, baixe o arquivo original ou abra em nova aba.
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
                onClick={() => handleOpenAttachmentInNewTab(previewGainAttachment)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ExternalLink size={14} /> Abrir em Nova Janela
              </button>
              <button
                type="button"
                onClick={() => handleDownloadGainAttachment(previewGainAttachment)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Download size={14} /> Baixar Arquivo Completo
              </button>
              <button
                type="button"
                onClick={() => setPreviewGainAttachment(null)}
                className="btn btn-outline btn-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
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
          Plataforma <strong style={{ color: '#ffffff' }}>FluxoLean 4.0</strong> • Metodologia PDCA & Engenharia de Custos Evitados
        </div>
        <div>
          Emissão em {formatDate(new Date().toISOString())}
        </div>
      </div>
    </div>
  );
}
