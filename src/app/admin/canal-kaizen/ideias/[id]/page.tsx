'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { KaizenIdea, ActionChecklistItem, LeanCostBreakdown } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  User,
  Building2,
  Plus,
  Save,
  Check,
  Award,
  Zap,
  Target,
  Activity,
  Layers,
  Sparkles,
  Camera,
  BookOpen,
  Sigma,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KaizenPDCAExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params?.id as string;
  const { currentUser, refreshData, dataVersion } = useAuth();

  const [idea, setIdea] = useState<KaizenIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plan' | 'do' | 'check' | 'act'>('plan');
  
  // Status de Auto-Save em Tempo Real
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form states: P - PLAN
  const [targetMetricName, setTargetMetricName] = useState('');
  const [targetMetricUnit, setTargetMetricUnit] = useState('');
  const [baselineValue, setBaselineValue] = useState<number | ''>('');
  const [targetGoalValue, setTargetGoalValue] = useState<number | ''>('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');
  const [fiveWhys, setFiveWhys] = useState<string[]>([]);
  const [newWhy, setNewWhy] = useState('');
  const [checklist, setChecklist] = useState<ActionChecklistItem[]>([]);
  const [newActionLabel, setNewActionLabel] = useState('');
  const [newActionResp, setNewActionResp] = useState('');
  const [newActionStart, setNewActionStart] = useState('');
  const [newActionEnd, setNewActionEnd] = useState('');

  // Form states: D - DO
  const [pilotArea, setPilotArea] = useState('');
  const [pilotTestObservations, setPilotTestObservations] = useState('');
  const [evidenceBeforeUrl, setEvidenceBeforeUrl] = useState('');
  const [evidenceAfterUrl, setEvidenceAfterUrl] = useState('');

  // Form states: C - CHECK
  const [achievedValue, setAchievedValue] = useState<number | ''>('');
  const [laborSavings, setLaborSavings] = useState<number | ''>('');
  const [productionIncrease, setProductionIncrease] = useState<number | ''>('');
  const [scrapReduction, setScrapReduction] = useState<number | ''>('');
  const [machineDowntime, setMachineDowntime] = useState<number | ''>('');
  const [estimatedCostAvoided, setEstimatedCostAvoided] = useState<number | ''>('');
  const [hoursSaved, setHoursSaved] = useState<number | ''>('');
  const [financialGainNotes, setFinancialGainNotes] = useState('');

  // Form states: A - ACT
  const [standardWorkUpdated, setStandardWorkUpdated] = useState(false);
  const [standardWorkDocRef, setStandardWorkDocRef] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [yokotenReplication, setYokotenReplication] = useState('');

  // Follow-up Month Modal
  const [followUpModalMonth, setFollowUpModalMonth] = useState<1 | 2 | 3 | null>(null);
  const [followUpValue, setFollowUpValue] = useState<number | ''>('');
  const [followUpHours, setFollowUpHours] = useState<number | ''>('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  useEffect(() => {
    if (ideaId) {
      let found = dataService.getKaizenIdeaById(ideaId);
      if (!found) {
        found = dataService.getKaizenIdeaByProtocol(ideaId);
      }
      if (found) {
        setIdea(found);
        setActiveTab(found.pdcaStage || 'plan');

        // P - PLAN
        setTargetMetricName(found.targetMetricName || '');
        setTargetMetricUnit(found.targetMetricUnit || '');
        setBaselineValue(found.baselineValue !== undefined ? found.baselineValue : '');
        setTargetGoalValue(found.targetGoalValue !== undefined ? found.targetGoalValue : '');
        setRootCauseAnalysis(found.rootCauseAnalysis || '');
        setFiveWhys(found.fiveWhys || []);
        setChecklist(found.checklist || []);

        // D - DO
        setPilotArea(found.pilotArea || '');
        setPilotTestObservations(found.pilotTestObservations || '');
        setEvidenceBeforeUrl(found.evidenceBeforeUrl || found.photoUrl || '');
        setEvidenceAfterUrl(found.evidenceAfterUrl || '');

        // C - CHECK
        setAchievedValue(found.achievedValue !== undefined ? found.achievedValue : '');
        const cb = found.costBreakdown || {};
        setLaborSavings(cb.laborSavings !== undefined ? cb.laborSavings : '');
        setProductionIncrease(cb.productionIncrease !== undefined ? cb.productionIncrease : '');
        setScrapReduction(cb.scrapReduction !== undefined ? cb.scrapReduction : '');
        setMachineDowntime(cb.machineDowntime !== undefined ? cb.machineDowntime : '');
        setEstimatedCostAvoided(found.estimatedCostAvoided !== undefined ? found.estimatedCostAvoided : '');
        setHoursSaved(found.hoursSaved !== undefined ? found.hoursSaved : '');
        setFinancialGainNotes(found.financialGainNotes || '');

        // A - ACT
        setStandardWorkUpdated(!!found.standardWorkUpdated);
        setStandardWorkDocRef(found.standardWorkDocRef || '');
        setLessonsLearned(found.lessonsLearned || '');
        setYokotenReplication(found.yokotenReplication || '');
      }
      setLoading(false);
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 400);
    }
  }, [ideaId, dataVersion]);

  // Total gross savings from breakdown
  const calculatedSavings = useMemo(() => {
    const l = Number(laborSavings) || 0;
    const p = Number(productionIncrease) || 0;
    const s = Number(scrapReduction) || 0;
    const m = Number(machineDowntime) || 0;
    return l + p + s + m;
  }, [laborSavings, productionIncrease, scrapReduction, machineDowntime]);

  const stateRef = useRef({
    activeTab,
    targetMetricName,
    targetMetricUnit,
    baselineValue,
    targetGoalValue,
    rootCauseAnalysis,
    fiveWhys,
    checklist,
    pilotArea,
    pilotTestObservations,
    evidenceBeforeUrl,
    evidenceAfterUrl,
    achievedValue,
    laborSavings,
    productionIncrease,
    scrapReduction,
    machineDowntime,
    estimatedCostAvoided,
    hoursSaved,
    financialGainNotes,
    standardWorkUpdated,
    standardWorkDocRef,
    lessonsLearned,
    yokotenReplication,
    calculatedSavings,
  });

  useEffect(() => {
    stateRef.current = {
      activeTab,
      targetMetricName,
      targetMetricUnit,
      baselineValue,
      targetGoalValue,
      rootCauseAnalysis,
      fiveWhys,
      checklist,
      pilotArea,
      pilotTestObservations,
      evidenceBeforeUrl,
      evidenceAfterUrl,
      achievedValue,
      laborSavings,
      productionIncrease,
      scrapReduction,
      machineDowntime,
      estimatedCostAvoided,
      hoursSaved,
      financialGainNotes,
      standardWorkUpdated,
      standardWorkDocRef,
      lessonsLearned,
      yokotenReplication,
      calculatedSavings,
    };
  });

  // Save changes (Auto-save & stage switch)
  const saveIdeaData = useCallback((targetStage?: 'plan' | 'do' | 'check' | 'act') => {
    if (!ideaId) return;
    const s = stateRef.current;

    const nextStage = targetStage || s.activeTab;
    const actualCost = s.calculatedSavings > 0 ? s.calculatedSavings : 0;

    let execStatus = idea?.executionStatus || 'planejamento';
    if (nextStage === 'do') execStatus = 'em_implantacao';
    if (nextStage === 'check') execStatus = 'em_implantacao';
    if (nextStage === 'act' && idea?.masterApproved) execStatus = 'implantada_sucesso';

    const costBreakdown: LeanCostBreakdown = {
      laborSavings: s.laborSavings !== '' ? Number(s.laborSavings) : undefined,
      productionIncrease: s.productionIncrease !== '' ? Number(s.productionIncrease) : undefined,
      scrapReduction: s.scrapReduction !== '' ? Number(s.scrapReduction) : undefined,
      machineDowntime: s.machineDowntime !== '' ? Number(s.machineDowntime) : undefined,
    };

    dataService.updateKaizenIdea(ideaId, {
      pdcaStage: nextStage,
      executionStatus: execStatus,
      // P
      targetMetricName: s.targetMetricName,
      targetMetricUnit: s.targetMetricUnit,
      baselineValue: s.baselineValue !== '' ? Number(s.baselineValue) : undefined,
      targetGoalValue: s.targetGoalValue !== '' ? Number(s.targetGoalValue) : undefined,
      rootCauseAnalysis: s.rootCauseAnalysis,
      fiveWhys: s.fiveWhys,
      checklist: s.checklist,
      // D
      pilotArea: s.pilotArea,
      pilotTestObservations: s.pilotTestObservations,
      evidenceBeforeUrl: s.evidenceBeforeUrl,
      evidenceAfterUrl: s.evidenceAfterUrl,
      // C
      achievedValue: s.achievedValue !== '' ? Number(s.achievedValue) : undefined,
      costBreakdown,
      estimatedCostAvoided: s.estimatedCostAvoided !== '' ? Number(s.estimatedCostAvoided) : undefined,
      actualCostAvoided: actualCost,
      hoursSaved: s.hoursSaved !== '' ? Number(s.hoursSaved) : undefined,
      financialGainNotes: s.financialGainNotes,
      // A
      standardWorkUpdated: s.standardWorkUpdated,
      standardWorkDocRef: s.standardWorkDocRef,
      lessonsLearned: s.lessonsLearned,
      yokotenReplication: s.yokotenReplication,
    });

    setSaveStatus('saved');
  }, [ideaId, idea?.executionStatus, idea?.masterApproved]);

  // Debounced auto-save effect (600ms)
  useEffect(() => {
    if (isInitialLoadRef.current) return;

    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveIdeaData();
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    activeTab,
    targetMetricName,
    targetMetricUnit,
    baselineValue,
    targetGoalValue,
    rootCauseAnalysis,
    fiveWhys,
    checklist,
    pilotArea,
    pilotTestObservations,
    evidenceBeforeUrl,
    evidenceAfterUrl,
    achievedValue,
    laborSavings,
    productionIncrease,
    scrapReduction,
    machineDowntime,
    estimatedCostAvoided,
    hoursSaved,
    financialGainNotes,
    standardWorkUpdated,
    standardWorkDocRef,
    lessonsLearned,
    yokotenReplication,
    saveIdeaData,
  ]);

  // Flush on unmount or beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveIdeaData();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveIdeaData();
      }
    };
  }, [saveIdeaData]);

  // Add Why
  const handleAddWhy = () => {
    if (!newWhy.trim()) return;
    setFiveWhys([...fiveWhys, newWhy.trim()]);
    setNewWhy('');
  };

  // Add Action Item
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionLabel.trim()) return;
    const newItem: ActionChecklistItem = {
      id: 'chk_' + Date.now(),
      label: newActionLabel.trim(),
      completed: false,
      responsibleName: newActionResp.trim() || idea?.responsibleName || 'Responsável',
      startDate: newActionStart || undefined,
      endDate: newActionEnd || undefined,
    };
    setChecklist([...checklist, newItem]);
    setNewActionLabel('');
    setNewActionResp('');
    setNewActionStart('');
    setNewActionEnd('');
  };

  const handleToggleAction = (chkId: string) => {
    setChecklist(
      checklist.map((item) => (item.id === chkId ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleDeleteAction = (chkId: string) => {
    setChecklist(checklist.filter((item) => item.id !== chkId));
  };

  // Master Approve Kaizen
  const handleMasterApprove = () => {
    if (!idea) return;
    const finalCost = calculatedSavings > 0 ? calculatedSavings : Number(idea.actualCostAvoided) || Number(idea.estimatedCostAvoided) || 0;

    const updated = dataService.updateKaizenIdea(idea.id, {
      masterApproved: true,
      masterApprovedAt: new Date().toISOString(),
      masterApprovedBy: currentUser?.name || 'Gestor Master',
      executionStatus: 'implantada_sucesso',
      pdcaStage: 'act',
      actualCostAvoided: finalCost,
      quarterlyFollowUp: idea.quarterlyFollowUp || {
        enabled: true,
        startedAt: new Date().toISOString(),
        month1: { monthNumber: 1, monthLabel: '1º Mês' },
        month2: { monthNumber: 2, monthLabel: '2º Mês' },
        month3: { monthNumber: 3, monthLabel: '3º Mês' },
        status: 'aguardando_mes_1',
        isCompleted: false,
      },
    });

    setIdea(updated);
    refreshData();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
  };

  // Follow-up Month Handler
  const handleOpenFollowUpModal = (mNum: 1 | 2 | 3) => {
    const entry = idea?.quarterlyFollowUp?.[`month${mNum}` as 'month1' | 'month2' | 'month3'];
    setFollowUpModalMonth(mNum);
    setFollowUpValue(entry?.value !== undefined ? entry.value : '');
    setFollowUpHours(entry?.hoursSaved !== undefined ? entry.hoursSaved : '');
    setFollowUpDate(entry?.measuredAt || new Date().toISOString().split('T')[0]);
    setFollowUpNotes(entry?.notes || '');
  };

  const handleSaveFollowUpMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || followUpModalMonth === null || followUpValue === '') return;

    const updated = dataService.saveKaizenQuarterlyMonthResult(idea.id, followUpModalMonth, {
      value: Number(followUpValue),
      hoursSaved: followUpHours !== '' ? Number(followUpHours) : undefined,
      measuredAt: followUpDate || new Date().toISOString().split('T')[0],
      notes: followUpNotes,
      registeredBy: currentUser?.name || idea.responsibleName || 'Líder Kaizen',
    });

    setIdea(updated);
    refreshData();
    setFollowUpModalMonth(null);

    if (updated.quarterlyFollowUp?.isCompleted) {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    } else {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        Carregando ciclo PDCA da Ideia Kaizen...
      </div>
    );
  }

  if (!idea) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#f87171' }}>
        <h3>Ideia Kaizen não encontrada</h3>
        <Link href="/admin/canal-kaizen" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Voltar ao Canal Kaizen
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
      {/* Top Navigation & Context */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/admin/canal-kaizen" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} color="#22d3ee" /> Voltar ao Canal Kaizen
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontFamily: 'var(--font-mono)' }}>
                {idea.protocol}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Setor: <strong>{idea.sectorName}</strong></span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Ideia original: <strong>{idea.authorName}</strong> ({idea.authorRoleTitle})</span>
            </div>

            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.2rem 0 0 0', fontFamily: 'var(--font-heading)' }}>
              {idea.summary}
            </h1>
          </div>
        </div>

        {/* Real-time Auto-Save Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: saveStatus === 'saving' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${saveStatus === 'saving' ? 'rgba(6, 182, 212, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
              padding: '0.4rem 0.85rem',
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
        </div>
      </div>

      {/* PDCA Stages Nav Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          backgroundColor: '#0f172a',
          padding: '0.6rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            backgroundColor: activeTab === 'plan' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'plan' ? 'rgba(6, 182, 212, 0.5)' : 'transparent'}`,
            color: activeTab === 'plan' ? '#22d3ee' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.15s ease',
          }}
        >
          <Target size={16} />
          <span>P • PLAN (Planejar)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('do')}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            backgroundColor: activeTab === 'do' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'do' ? 'rgba(139, 92, 246, 0.5)' : 'transparent'}`,
            color: activeTab === 'do' ? '#c084fc' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.15s ease',
          }}
        >
          <Activity size={16} />
          <span>D • DO (Executar 5W2H)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('check')}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            backgroundColor: activeTab === 'check' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'check' ? 'rgba(245, 158, 11, 0.5)' : 'transparent'}`,
            color: activeTab === 'check' ? '#fbbf24' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.15s ease',
          }}
        >
          <DollarSign size={16} />
          <span>C • CHECK (Ganhos & ROI)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('act')}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            backgroundColor: activeTab === 'act' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'act' ? 'rgba(16, 185, 129, 0.5)' : 'transparent'}`,
            color: activeTab === 'act' ? '#34d399' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.15s ease',
          }}
        >
          <Award size={16} />
          <span>A • ACT (Padronizar & 3M)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ETAPA 1: P - PLAN                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card: Metas & Indicadores */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Target size={20} color="#22d3ee" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                1.1 Definição de Metas & Indicador Chave (KPI)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Nome do Indicador / Métrica</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Tempo de Parada por Borra, Setup de Fio"
                  value={targetMetricName}
                  onChange={(e) => setTargetMetricName(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Unidade de Medida</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: min/dia, %, peças/hora"
                  value={targetMetricUnit}
                  onChange={(e) => setTargetMetricUnit(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Baseline (Antes da Melhoria)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ex: 42"
                  value={baselineValue}
                  onChange={(e) => setBaselineValue(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Meta Planejada (Alvo)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ex: 8"
                  value={targetGoalValue}
                  onChange={(e) => setTargetGoalValue(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 800 }}
                />
              </div>
            </div>
          </div>

          {/* Card: Diagnóstico & 5 Porquês */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Lightbulb size={20} color="#fbbf24" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                1.2 Causa Raiz & Análise dos 5 Porquês
              </h3>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Diagnóstico Resumido da Causa Raiz</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="Qual o motivo central pelo qual o problema ocorria antes da ideia do colaborador?"
                value={rootCauseAnalysis}
                onChange={(e) => setRootCauseAnalysis(e.target.value)}
                style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.84375rem' }}
              />
            </div>

            {/* 5 Whys List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {fiveWhys.map((whyText, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#090e1a',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                    <strong style={{ color: '#22d3ee', marginRight: '0.5rem' }}>{idx + 1}º Porquê:</strong> {whyText}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiveWhys(fiveWhys.filter((_, i) => i !== idx))}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Adicionar porquê à cadeia causal..."
                className="form-control form-control-sm"
                value={newWhy}
                onChange={(e) => setNewWhy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWhy();
                  }
                }}
                style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
              />
              <button type="button" onClick={handleAddWhy} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>

          {/* Next Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                saveIdeaData('do');
                setActiveTab('do');
              }}
              className="btn btn-primary"
            >
              Avançar para D • DO (Execução) →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ETAPA 2: D - DO                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'do' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card: Plano 5W2H */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="#c084fc" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  2.1 Plano de Ação 5W2H no Posto de Trabalho
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {checklist.filter((i) => i.completed).length}/{checklist.length} ações concluídas
              </span>
            </div>

            {/* Checklist items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {checklist.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                  Nenhuma ação adicionada ainda. Adicione as etapas práticas abaixo.
                </p>
              ) : (
                checklist.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#090e1a',
                      borderRadius: '10px',
                      border: item.completed ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleAction(item.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span
                        style={{
                          fontSize: '0.84375rem',
                          color: item.completed ? '#94a3b8' : '#ffffff',
                          textDecoration: item.completed ? 'line-through' : 'none',
                          fontWeight: 600,
                        }}
                      >
                        {item.label || item.text}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.725rem', color: '#22d3ee', fontWeight: 700 }}>
                        {item.responsibleName || item.responsible || 'Equipe'}
                      </span>
                      {(item.endDate || item.plannedEnd) && (
                        <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                          até {item.endDate || item.plannedEnd}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAction(item.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add action form */}
            <form onSubmit={handleAddAction} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                required
                placeholder="O que fazer (ação prática 5W2H)..."
                className="form-control form-control-sm"
                value={newActionLabel}
                onChange={(e) => setNewActionLabel(e.target.value)}
                style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
              />
              <input
                type="text"
                placeholder="Responsável..."
                className="form-control form-control-sm"
                value={newActionResp}
                onChange={(e) => setNewActionResp(e.target.value)}
                style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
              />
              <input
                type="date"
                className="form-control form-control-sm"
                value={newActionEnd}
                onChange={(e) => setNewActionEnd(e.target.value)}
                style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={14} /> Adicionar
              </button>
            </form>
          </div>

          {/* Card: Testes Piloto & Evidências Antes/Depois */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Camera size={20} color="#22d3ee" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                2.2 Posto Piloto & Evidências Visuais (Antes e Depois)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Posto / Máquina Piloto</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Extrusora 02 - Matriz Principal"
                  value={pilotArea}
                  onChange={(e) => setPilotArea(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>URL da Foto do Depois (Melhoria Implantada)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Link ou foto do posto modificado..."
                  value={evidenceAfterUrl}
                  onChange={(e) => setEvidenceAfterUrl(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>
            </div>

            {/* Visual Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Antes */}
              <div style={{ backgroundColor: '#090e1a', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  📸 Antes (Foto Original do Colaborador)
                </span>
                {evidenceBeforeUrl ? (
                  <img
                    src={evidenceBeforeUrl}
                    alt="Antes"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                    Sem foto do Antes
                  </div>
                )}
              </div>

              {/* Depois */}
              <div style={{ backgroundColor: '#090e1a', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  📸 Depois (Melhoria Implantada)
                </span>
                {evidenceAfterUrl ? (
                  <img
                    src={evidenceAfterUrl}
                    alt="Depois"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                    Aguardando foto da implantação
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Observações do Teste Prático</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="Como se comportou a melhoria no teste piloto? Teve aprovação imediata do operador?"
                value={pilotTestObservations}
                onChange={(e) => setPilotTestObservations(e.target.value)}
                style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.84375rem' }}
              />
            </div>
          </div>

          {/* Next Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                saveIdeaData('check');
                setActiveTab('check');
              }}
              className="btn btn-primary"
            >
              Avançar para C • CHECK (Ganhos & ROI) →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ETAPA 3: C - CHECK                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'check' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card: Aferição da Meta */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Zap size={20} color="#fbbf24" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                3.1 Verificação da Meta Atingida no Indicador
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ backgroundColor: '#090e1a', padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Baseline Inicial</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f87171', margin: '0.25rem 0 0', fontFamily: 'var(--font-mono)' }}>
                  {baselineValue !== '' ? `${baselineValue} ${targetMetricUnit}` : '--'}
                </h4>
              </div>

              <div style={{ backgroundColor: '#090e1a', padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Meta Planejada</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22d3ee', margin: '0.25rem 0 0', fontFamily: 'var(--font-mono)' }}>
                  {targetGoalValue !== '' ? `${targetGoalValue} ${targetMetricUnit}` : '--'}
                </h4>
              </div>

              <div style={{ backgroundColor: '#090e1a', padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <label style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>
                  Resultado Real Aferido *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 5"
                  className="form-control form-control-sm"
                  value={achievedValue}
                  onChange={(e) => setAchievedValue(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#0f172a', borderColor: 'rgba(16, 185, 129, 0.5)', color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 900 }}
                />
              </div>
            </div>
          </div>

          {/* Card: Memorial de Cálculo dos Ganhos Separados do Canal Kaizen */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={20} color="#34d399" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  3.2 Composição dos Ganhos Financeiros Exclusivos (R$)
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Total: {formatCurrency(calculatedSavings > 0 ? calculatedSavings : Number(idea.actualCostAvoided) || 0)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Mão de Obra & Setup (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="form-control"
                  value={laborSavings}
                  onChange={(e) => setLaborSavings(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Aumento de Produção (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="form-control"
                  value={productionIncrease}
                  onChange={(e) => setProductionIncrease(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Redução de Refugo / Sucata (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="form-control"
                  value={scrapReduction}
                  onChange={(e) => setScrapReduction(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Paradas de Máquina (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="form-control"
                  value={machineDowntime}
                  onChange={(e) => setMachineDowntime(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Horas de Trabalho Salvas (h)</label>
                <input
                  type="number"
                  placeholder="Ex: 38"
                  className="form-control"
                  value={hoursSaved}
                  onChange={(e) => setHoursSaved(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Estimativa Inicial (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 12000"
                  className="form-control"
                  value={estimatedCostAvoided}
                  onChange={(e) => setEstimatedCostAvoided(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Memorial Descritivo da Economia</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="Explique detalhadamente como o cálculo foi feito com base nos dados reais do chão de fábrica..."
                value={financialGainNotes}
                onChange={(e) => setFinancialGainNotes(e.target.value)}
                style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.84375rem' }}
              />
            </div>
          </div>

          {/* Next Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                saveIdeaData('act');
                setActiveTab('act');
              }}
              className="btn btn-primary"
            >
              Salvar & Avançar para A • ACT (Padronização & 3 Meses) →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ETAPA 4: A - ACT                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'act' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card: Padronização & Yokoten */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BookOpen size={20} color="#22d3ee" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                4.1 Padronização de Trabalho & Disseminação Yokoten
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#090e1a', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <input
                  type="checkbox"
                  id="chkStandardWork"
                  checked={standardWorkUpdated}
                  onChange={(e) => setStandardWorkUpdated(e.target.checked)}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
                <label htmlFor="chkStandardWork" style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', margin: 0 }}>
                  POP / Instrução de Trabalho Atualizada?
                </label>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Código do POP / Documento</label>
                <input
                  type="text"
                  placeholder="Ex: POP-EXT-018 rev 02"
                  className="form-control"
                  value={standardWorkDocRef}
                  onChange={(e) => setStandardWorkDocRef(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Lições Aprendidas</label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="O que o time e os operadores aprenderam com esta melhoria..."
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.84375rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>Replicação Yokoten (Outras Áreas)</label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Em quais outras máquinas, linhas ou células esta solução pode ser aplicada?"
                  value={yokotenReplication}
                  onChange={(e) => setYokotenReplication(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.84375rem' }}
                />
              </div>
            </div>
          </div>

          {/* Card: Homologação Master do Kaizen */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              border: idea.masterApproved ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={22} color={idea.masterApproved ? '#34d399' : '#94a3b8'} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  4.2 Homologação Final do Kaizen
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                {idea.masterApproved
                  ? `Homologado por ${idea.masterApprovedBy || 'Gestor'} em ${formatDate(idea.masterApprovedAt || '')}`
                  : 'Ao homologar, o ciclo PDCA da ideia é concluído com sucesso e a comprovação de ganhos em 3 meses é liberada.'}
              </p>
            </div>

            <div>
              {idea.masterApproved ? (
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '0.875rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <CheckCircle2 size={18} /> KAIZEN HOMOLOGADO COM SUCESSO ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleMasterApprove}
                  className="btn btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 800 }}
                >
                  <CheckCircle2 size={18} />
                  <span>Homologar Ideia Kaizen & Fechar Ciclo</span>
                </button>
              )}
            </div>
          </div>

          {/* Card: Acompanhamento de 3 Meses Pós-Homologação */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              backgroundColor: '#0f172a',
              border: idea.masterApproved ? '2px solid rgba(6, 182, 212, 0.4)' : '1px dashed rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Calendar size={22} color={idea.masterApproved ? '#22d3ee' : '#94a3b8'} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    4.3 Comprovação Trimestral de Ganhos Reais (Auditoria de 3 Meses)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                    Após homologada, a equipe registra os resultados nos 3 primeiros meses. No 3º mês, a média definitiva fecha automaticamente.
                  </p>
                </div>
              </div>

              {idea.masterApproved && idea.quarterlyFollowUp?.isCompleted ? (
                <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.2rem 0.6rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={12} /> AUDITORIA CONSOLIDADA (3/3)
                </span>
              ) : idea.masterApproved ? (
                <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                  EM ACOMPANHAMENTO ({[idea.quarterlyFollowUp?.month1?.value, idea.quarterlyFollowUp?.month2?.value, idea.quarterlyFollowUp?.month3?.value].filter((v) => v !== undefined).length}/3)
                </span>
              ) : (
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                  BLOQUEADO ATÉ HOMOLOGAÇÃO
                </span>
              )}
            </div>

            {!idea.masterApproved ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', backgroundColor: '#090e1a', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.84375rem' }}>
                🔒 Esta auditoria de 3 meses é liberada automaticamente assim que a ideia for homologada no passo 4.2 acima.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 3 Months Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {([1, 2, 3] as const).map((mNum) => {
                    const entry = idea.quarterlyFollowUp?.[`month${mNum}` as 'month1' | 'month2' | 'month3'];
                    const isFilled = entry?.value !== undefined;

                    return (
                      <div
                        key={mNum}
                        style={{
                          backgroundColor: '#090e1a',
                          borderRadius: '12px',
                          padding: '1.15rem',
                          border: isFilled ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                            {mNum}º Mês de Operação
                          </span>
                          {isFilled ? (
                            <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>
                              ✓ Aferido
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>
                              ⏳ Pendente
                            </span>
                          )}
                        </div>

                        <div>
                          <p style={{ fontSize: '0.675rem', color: '#64748b', textTransform: 'uppercase', margin: '0 0 0.2rem', fontWeight: 700 }}>
                            Custo Evitado Real
                          </p>
                          <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: isFilled ? '#34d399' : '#64748b', margin: 0, fontFamily: 'var(--font-mono)' }}>
                            {isFilled ? formatCurrency(entry.value!) : 'R$ --'}
                          </h4>
                        </div>

                        {isFilled ? (
                          <div style={{ fontSize: '0.725rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {entry.hoursSaved !== undefined && <span>⏱️ {entry.hoursSaved}h salvas</span>}
                            {entry.measuredAt && <span>📅 Medido em: {formatDate(entry.measuredAt)}</span>}
                            <button
                              type="button"
                              onClick={() => handleOpenFollowUpModal(mNum)}
                              className="btn btn-secondary btn-sm"
                              style={{ marginTop: '0.35rem', fontSize: '0.7rem', width: '100%', justifyContent: 'center' }}
                            >
                              Editar Medição
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenFollowUpModal(mNum)}
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Plus size={14} /> Lançar {mNum}º Mês
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Average Strip */}
                <div
                  style={{
                    backgroundColor: idea.quarterlyFollowUp?.isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 182, 212, 0.08)',
                    border: idea.quarterlyFollowUp?.isCompleted ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(6, 182, 212, 0.25)',
                    borderRadius: '12px',
                    padding: '1.15rem 1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Sigma size={24} color={idea.quarterlyFollowUp?.isCompleted ? '#34d399' : '#22d3ee'} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        Média Trimestral de Retorno da Ideia Kaizen
                      </h4>
                      <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                        {idea.quarterlyFollowUp?.isCompleted
                          ? 'A média dos 3 meses de operação estabilizada foi oficializada no retorno do Canal Kaizen.'
                          : 'A média consolidada fecha automaticamente ao lançar o 3º mês.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Média Consolidada
                    </span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', margin: 0, fontFamily: 'var(--font-mono)' }}>
                      {idea.quarterlyFollowUp?.averageCostAvoided
                        ? formatCurrency(idea.quarterlyFollowUp.averageCostAvoided)
                        : formatCurrency(idea.actualCostAvoided || 0)}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.25rem' }}>/mês</span>
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Aferição do Mês */}
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
              maxWidth: '500px',
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
                  Aferição do {followUpModalMonth}º Mês da Ideia Kaizen
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
                  placeholder="Ex: 14500"
                  className="form-control"
                  value={followUpValue}
                  onChange={(e) => setFollowUpValue(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                    Horas Salvas (h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ex: 38"
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
                  Observações da Sustentação
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Operação contínua sem quebras ou paradas..."
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
                  <Check size={16} /> Salvar Aferição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
