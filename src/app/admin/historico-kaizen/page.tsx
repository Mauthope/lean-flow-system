'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { LeanAction, KaizenIdea, IshikawaAnalysis, ParetoAnalysis } from '@/lib/types';
import { formatCurrency, formatDate, WASTE_CATEGORIES } from '@/lib/utils';
import {
  Sparkles,
  Search,
  Filter,
  Calendar,
  Building2,
  User,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Lightbulb,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Clock,
  Zap,
  HelpCircle,
  Maximize2,
  ExternalLink,
  BookOpen,
  Bot,
  BrainCircuit,
  MessageSquare,
  Flame,
  LayoutGrid,
  List,
  RotateCcw,
  BarChart3,
  Check,
  Compass,
} from 'lucide-react';

interface UnifiedKaizen {
  id: string;
  protocol: string;
  title: string;
  description: string;
  origin: 'projeto' | 'canal_kaizen';
  originLabel: string;
  sectorId: string;
  sectorName: string;
  leaderOrAuthor: string;
  leaderOrAuthorRole?: string;
  avatarUrl?: string;
  completedAt: string;
  year: number;
  month: number; // 0-11
  actualCostAvoided: number;
  hoursSaved: number;
  wasteCategory?: string;
  problemStatement?: string;
  fiveWhys?: string[];
  ishikawa?: IshikawaAnalysis;
  pareto?: ParetoAnalysis;
  lessonsLearned?: string;
  yokotenReplication?: string;
  standardWorkDocRef?: string;
  targetMetricName?: string;
  baselineValue?: number;
  achievedValue?: number;
  targetMetricUnit?: string;
  photoUrl?: string;
  url: string;
  a3Url?: string;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function HistoricoKaizenPage() {
  const { currentTenant, currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // Raw data from dataService
  const [actions, setActions] = useState<LeanAction[]>([]);
  const [ideas, setIdeas] = useState<KaizenIdea[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState<'all' | 'projeto' | 'canal_kaizen'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedWaste, setSelectedWaste] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [expandedKaizenId, setExpandedKaizenId] = useState<string | null>(null);

  // AI Assistant Query & Response State
  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    summary: string;
    matchedKaizens: UnifiedKaizen[];
    totalSavings: number;
    lessons: string[];
  } | null>(null);

  // Load data
  useEffect(() => {
    const rawActions = dataService.getActions(currentTenant?.id);
    const rawIdeas = dataService.getKaizenIdeas(currentTenant?.id);
    setActions(rawActions);
    setIdeas(rawIdeas);
    setLoading(false);
  }, [currentTenant]);

  // Unify and filter completed Kaizens
  const unifiedKaizens = useMemo<UnifiedKaizen[]>(() => {
    const list: UnifiedKaizen[] = [];

    // 1. Process Actions (Projetos Lean PDCA Concluídos)
    actions.forEach((act) => {
      // Consider completed if status is 'concluida', or stage is 'act' / completedAt exists
      const isCompleted =
        act.status === 'concluida' ||
        act.pdcaStage === 'act' ||
        Boolean(act.completedAt);

      if (!isCompleted) return;

      const dateStr = act.completedAt || act.updatedAt || act.createdAt || new Date().toISOString();
      const d = new Date(dateStr);
      const year = isNaN(d.getFullYear()) ? 2026 : d.getFullYear();
      const month = isNaN(d.getMonth()) ? 1 : d.getMonth();

      list.push({
        id: act.id,
        protocol: act.protocol,
        title: act.title,
        description: act.description,
        origin: 'projeto',
        originLabel: 'Projeto Lean (PDCA)',
        sectorId: act.originSectorId,
        sectorName: act.originSectorName || 'Fábrica Geral',
        leaderOrAuthor: act.leaderName || act.assignedAgentName || 'Líder Lean',
        leaderOrAuthorRole: 'Especialista / Agente Lean',
        avatarUrl: act.assignedAgentAvatar,
        completedAt: dateStr,
        year,
        month,
        actualCostAvoided: act.actualCostAvoided || 0,
        hoursSaved: act.hoursSaved || 0,
        wasteCategory: act.wasteCategory,
        problemStatement: act.problemStatement,
        fiveWhys: act.fiveWhys,
        ishikawa: act.ishikawa,
        pareto: act.pareto,
        lessonsLearned: act.lessonsLearned,
        yokotenReplication: act.yokotenReplication,
        standardWorkDocRef: act.standardWorkDocRef,
        targetMetricName: act.targetMetricName,
        baselineValue: act.baselineValue,
        achievedValue: act.achievedValue,
        targetMetricUnit: act.targetMetricUnit,
        photoUrl: act.photoAfterUrl || act.photoBeforeUrl,
        url: `/admin/projetos/${act.id}`,
        a3Url: `/admin/projetos/${act.id}/relatorio-a3`,
      });
    });

    // 2. Process Kaizen Ideas (Ideias do Chão de Fábrica Implantadas)
    ideas.forEach((idea) => {
      const isCompleted =
        idea.executionStatus === 'implantada_sucesso' ||
        idea.status === 'aprovada' ||
        idea.masterApproved ||
        Boolean(idea.actualCostAvoided && idea.actualCostAvoided > 0);

      if (!isCompleted) return;

      const dateStr = idea.updatedAt || idea.createdAt || new Date().toISOString();
      const d = new Date(dateStr);
      const year = isNaN(d.getFullYear()) ? 2026 : d.getFullYear();
      const month = isNaN(d.getMonth()) ? 1 : d.getMonth();

      list.push({
        id: idea.id,
        protocol: idea.protocol,
        title: idea.summary,
        description: idea.rootCauseAnalysis || idea.summary,
        origin: 'canal_kaizen',
        originLabel: 'Canal Kaizen (Chão de Fábrica)',
        sectorId: idea.sectorId,
        sectorName: idea.sectorName,
        leaderOrAuthor: idea.authorName,
        leaderOrAuthorRole: idea.authorRoleTitle,
        avatarUrl: undefined,
        completedAt: dateStr,
        year,
        month,
        actualCostAvoided: idea.actualCostAvoided || 0,
        hoursSaved: idea.hoursSaved || 0,
        wasteCategory: 'outros',
        problemStatement: idea.rootCauseAnalysis,
        fiveWhys: idea.fiveWhys,
        lessonsLearned: idea.lessonsLearned,
        yokotenReplication: idea.yokotenReplication,
        standardWorkDocRef: idea.standardWorkDocRef,
        targetMetricName: idea.targetMetricName,
        baselineValue: idea.baselineValue,
        achievedValue: idea.achievedValue,
        targetMetricUnit: idea.targetMetricUnit,
        photoUrl: idea.photoUrl,
        url: `/admin/canal-kaizen/ideias/${idea.id}`,
      });
    });

    // Sort descending by completion date
    return list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [actions, ideas]);

  // Extract available years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(unifiedKaizens.map((k) => k.year))).filter(Boolean);
    if (!years.includes(2026)) years.push(2026);
    if (!years.includes(2025)) years.push(2025);
    return years.sort((a, b) => b - a);
  }, [unifiedKaizens]);

  // Extract available sectors
  const availableSectors = useMemo(() => {
    const sectors = Array.from(new Set(unifiedKaizens.map((k) => k.sectorName))).filter(Boolean);
    return sectors.sort();
  }, [unifiedKaizens]);

  // Monthly stats for the currently selected year
  const monthlyStats = useMemo(() => {
    const yearToUse = selectedYear === 'all' ? 2026 : selectedYear;
    const months = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: MONTH_NAMES[i],
      monthShort: MONTH_SHORT[i],
      totalCount: 0,
      projetoCount: 0,
      canalKaizenCount: 0,
      totalSavings: 0,
      hoursSaved: 0,
    }));

    unifiedKaizens.forEach((k) => {
      if (k.year === yearToUse) {
        const m = k.month >= 0 && k.month < 12 ? k.month : 0;
        months[m].totalCount += 1;
        if (k.origin === 'projeto') {
          months[m].projetoCount += 1;
        } else {
          months[m].canalKaizenCount += 1;
        }
        months[m].totalSavings += k.actualCostAvoided;
        months[m].hoursSaved += k.hoursSaved;
      }
    });

    const maxCount = Math.max(...months.map((m) => m.totalCount), 1);

    return { months, maxCount, yearToUse };
  }, [unifiedKaizens, selectedYear]);

  // Filtered Kaizens list
  const filteredKaizens = useMemo(() => {
    return unifiedKaizens.filter((k) => {
      // Origin filter
      if (originFilter !== 'all' && k.origin !== originFilter) return false;

      // Year filter
      if (selectedYear !== 'all' && k.year !== selectedYear) return false;

      // Month filter
      if (selectedMonth !== 'all' && k.month !== selectedMonth) return false;

      // Sector filter
      if (selectedSector !== 'all' && k.sectorName !== selectedSector) return false;

      // Waste Category filter
      if (selectedWaste !== 'all' && k.wasteCategory !== selectedWaste) return false;

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = k.title.toLowerCase().includes(q);
        const matchesProto = k.protocol.toLowerCase().includes(q);
        const matchesDesc = k.description?.toLowerCase().includes(q);
        const matchesAuthor = k.leaderOrAuthor.toLowerCase().includes(q);
        const matchesSector = k.sectorName.toLowerCase().includes(q);
        const matchesProblem = k.problemStatement?.toLowerCase().includes(q);
        const matchesLessons = k.lessonsLearned?.toLowerCase().includes(q);
        const matchesYokoten = k.yokotenReplication?.toLowerCase().includes(q);
        const matchesWhys = k.fiveWhys?.some((w) => w.toLowerCase().includes(q));

        if (
          !matchesTitle &&
          !matchesProto &&
          !matchesDesc &&
          !matchesAuthor &&
          !matchesSector &&
          !matchesProblem &&
          !matchesLessons &&
          !matchesYokoten &&
          !matchesWhys
        ) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedKaizens, originFilter, selectedYear, selectedMonth, selectedSector, selectedWaste, searchQuery]);

  // Summary Metrics for the filtered subset
  const metrics = useMemo(() => {
    const totalCount = filteredKaizens.length;
    const totalSavings = filteredKaizens.reduce((acc, k) => acc + (k.actualCostAvoided || 0), 0);
    const totalHours = filteredKaizens.reduce((acc, k) => acc + (k.hoursSaved || 0), 0);
    const projetoCount = filteredKaizens.filter((k) => k.origin === 'projeto').length;
    const canalCount = filteredKaizens.filter((k) => k.origin === 'canal_kaizen').length;
    const projetoPercent = totalCount > 0 ? Math.round((projetoCount / totalCount) * 100) : 0;
    const canalPercent = totalCount > 0 ? Math.round((canalCount / totalCount) * 100) : 0;

    return {
      totalCount,
      totalSavings,
      totalHours,
      projetoCount,
      canalCount,
      projetoPercent,
      canalPercent,
    };
  }, [filteredKaizens]);

  // AI Semantic Assistant Search Simulation & Intelligence
  const handleRunAiSearch = (customPrompt?: string) => {
    const promptText = (customPrompt || aiQuery).trim();
    if (!promptText) return;

    setIsAiSearching(true);
    setAiResponse(null);

    setTimeout(() => {
      const q = promptText.toLowerCase();
      const matched = unifiedKaizens.filter((k) => {
        const textToSearch = [
          k.title,
          k.description,
          k.problemStatement,
          k.sectorName,
          k.leaderOrAuthor,
          k.lessonsLearned,
          k.yokotenReplication,
          ...(k.fiveWhys || []),
          k.ishikawa?.method,
          k.ishikawa?.machine,
          k.ishikawa?.material,
          k.ishikawa?.manpower,
          k.ishikawa?.measurement,
          k.ishikawa?.environment,
          k.ishikawa?.primaryRootCause,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const words = q.split(/\s+/).filter((w) => w.length > 2);
        return words.some((word) => textToSearch.includes(word));
      });

      const items = matched.length > 0 ? matched : unifiedKaizens.slice(0, 3);
      const totalSavingsFound = items.reduce((acc, k) => acc + (k.actualCostAvoided || 0), 0);

      const lessonsExtracted = items
        .map((k) => k.lessonsLearned || k.yokotenReplication)
        .filter(Boolean) as string[];

      let summaryText = `Localizei **${items.length} Kaizen(s)** relacionados ao tema "*${promptText}*" no histórico da fábrica. `;
      if (totalSavingsFound > 0) {
        summaryText += `Essas melhorias geraram uma economia acumulada de **${formatCurrency(totalSavingsFound)}/ano**. `;
      }
      summaryText += `As principais causas raízes resolvidas envolveram padronização de métodos, eliminação de tempos de espera e manutenção preditiva em postos de trabalho.`;

      setAiResponse({
        summary: summaryText,
        matchedKaizens: items,
        totalSavings: totalSavingsFound,
        lessons: lessonsExtracted.slice(0, 3),
      });

      setIsAiSearching(false);
    }, 750);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setOriginFilter('all');
    setSelectedYear('all');
    setSelectedMonth('all');
    setSelectedSector('all');
    setSelectedWaste('all');
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header Executivo com Badge IA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 900,
                color: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={11} /> Acervo & Inteligência Kaizen
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Todo Projeto é um Kaizen</span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Acompanhamento & Histórico de Kaizens Concluídos
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
            Banco de conhecimento unificado com todos os Projetos Lean e Ideias do Chão de Fábrica concluídos ao longo do tempo.
          </p>
        </div>

        {/* Action / View Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', backgroundColor: '#090e1a', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#2563eb' : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#2563eb' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <List size={14} /> Tabela
            </button>
          </div>

          <Link
            href="/admin/canal-kaizen"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
          >
            <Lightbulb size={14} color="#fbbf24" /> Canal Kaizen
          </Link>

          <Link
            href="/admin/kanban"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
          >
            <Layers size={14} color="#22d3ee" /> Kanban Geral
          </Link>
        </div>
      </div>

      {/* KPI CARDS DO HISTÓRICO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Total Concluídos */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
              Kaizens Concluídos
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-mono)' }}>
            {metrics.totalCount}
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, display: 'block', marginTop: '0.25rem' }}>
            ✓ 100% Homologados na Entidade
          </span>
        </div>

        {/* Economia Acumulada */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>
              Custo Evitado Acumulado
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#34d399" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#34d399', margin: 0, fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(metrics.totalSavings)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
            Ganhos anuais comprovados em DRE
          </span>
        </div>

        {/* Horas Salvas */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
              Horas Poupadas
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color="#22d3ee" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-mono)' }}>
            {metrics.totalHours} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>h/ano</span>
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 700, display: 'block', marginTop: '0.25rem' }}>
            ⚡ Produtividade de chão de fábrica
          </span>
        </div>

        {/* Divisão por Origem */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
              Origem dos Kaizens
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} color="#c084fc" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8' }}>
              {metrics.projetoCount} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Projetos</span>
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>+</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24' }}>
              {metrics.canalCount} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Ideias</span>
            </span>
          </div>
          <div style={{ marginTop: '0.5rem', width: '100%', height: '6px', backgroundColor: '#090e1a', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${metrics.projetoPercent}%`, backgroundColor: '#38bdf8' }} title={`Projetos Lean: ${metrics.projetoPercent}%`} />
            <div style={{ width: `${metrics.canalPercent}%`, backgroundColor: '#fbbf24' }} title={`Canal Kaizen: ${metrics.canalPercent}%`} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRÁFICO MENSAL: QUANTIDADE DE KAIZENS POR MÊS NO ANO                      */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="#22d3ee" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Evolução Mensal de Kaizens Concluídos ({monthlyStats.yearToUse})
              </h3>
            </div>
            <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
              Clique em qualquer mês para filtrar a listagem abaixo diretamente naquele período.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#38bdf8', borderRadius: '3px', display: 'inline-block' }} />
                Projetos PDCA
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#fbbf24', borderRadius: '3px', display: 'inline-block' }} />
                Canal Kaizen
              </span>
            </div>

            {/* Year Selector for Chart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#090e1a', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Calendar size={13} color="#94a3b8" />
              <select
                value={selectedYear}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedYear(val === 'all' ? 'all' : Number(val));
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78125rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all" style={{ backgroundColor: '#0f172a' }}>Todos os Anos</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} style={{ backgroundColor: '#0f172a' }}>
                    Ano {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 12 Months Interactive Bars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '0.5rem',
            alignItems: 'end',
            minHeight: '180px',
            paddingTop: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.75rem',
          }}
        >
          {monthlyStats.months.map((m) => {
            const isSelected = selectedMonth === m.monthIndex;
            const barHeightPercent = m.totalCount > 0 ? Math.max(18, (m.totalCount / monthlyStats.maxCount) * 100) : 4;
            const projetoPercentOfBar = m.totalCount > 0 ? (m.projetoCount / m.totalCount) * 100 : 0;
            const canalPercentOfBar = m.totalCount > 0 ? (m.canalKaizenCount / m.totalCount) * 100 : 0;

            return (
              <div
                key={m.monthIndex}
                onClick={() => {
                  if (selectedMonth === m.monthIndex) {
                    setSelectedMonth('all');
                  } else {
                    setSelectedMonth(m.monthIndex);
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  border: isSelected ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
                title={`${m.monthName}: ${m.totalCount} Kaizens (${m.projetoCount} projetos, ${m.canalKaizenCount} canal kaizen) • ${formatCurrency(m.totalSavings)}`}
              >
                {/* Count Badge on Top */}
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    color: m.totalCount > 0 ? (isSelected ? '#22d3ee' : '#ffffff') : '#475569',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {m.totalCount}
                </span>

                {/* Stacked Vertical Bar */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '28px',
                    height: '110px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  {m.totalCount > 0 ? (
                    <div
                      style={{
                        height: `${barHeightPercent}%`,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        boxShadow: isSelected ? '0 0 12px rgba(6, 182, 212, 0.5)' : undefined,
                      }}
                    >
                      {/* Canal Kaizen portion */}
                      {canalPercentOfBar > 0 && (
                        <div
                          style={{
                            height: `${canalPercentOfBar}%`,
                            width: '100%',
                            backgroundColor: '#fbbf24',
                          }}
                        />
                      )}
                      {/* Projeto PDCA portion */}
                      {projetoPercentOfBar > 0 && (
                        <div
                          style={{
                            height: `${projetoPercentOfBar}%`,
                            width: '100%',
                            backgroundColor: '#38bdf8',
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px' }} />
                  )}
                </div>

                {/* Month Label */}
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: isSelected ? '#22d3ee' : '#94a3b8',
                    fontWeight: isSelected ? 900 : 600,
                  }}
                >
                  {m.monthShort}
                </span>
              </div>
            );
          })}
        </div>

        {selectedMonth !== 'all' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#22d3ee', fontWeight: 700 }}>
              Filtrado por: <strong>{MONTH_NAMES[selectedMonth]} de {monthlyStats.yearToUse}</strong> ({monthlyStats.months[selectedMonth].totalCount} Kaizens • {formatCurrency(monthlyStats.months[selectedMonth].totalSavings)})
            </span>
            <button
              type="button"
              onClick={() => setSelectedMonth('all')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Ver todos os meses do ano
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ASSISTENTE DE IA KAIZEN (PESQUISA SEMÂNTICA, CAUSA RAIZ & YOKOTEN)          */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#0a0f1d',
          borderRadius: '16px',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
          boxShadow: '0 0 25px rgba(168, 85, 247, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BrainCircuit size={18} color="#c084fc" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Assistente de IA Kaizen • Consulta Causal & Yokoten
            </h3>
            <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.1rem 0 0 0' }}>
              Pesquise diagnósticos, 5 Porquês, Ishikawa, lições aprendidas e soluções já aplicadas na fábrica com inteligência contextual.
            </p>
          </div>
        </div>

        {/* Input da IA com Botão de Pesquisa */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Quais kaizens reduziram tempo de setup na extrusora? / O que fizemos para eliminar paradas na tecelagem?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunAiSearch();
              }}
              style={{
                backgroundColor: '#060a13',
                borderColor: 'rgba(168, 85, 247, 0.35)',
                color: '#ffffff',
                paddingLeft: '2.5rem',
                fontSize: '0.875rem',
              }}
            />
            <Bot size={16} color="#c084fc" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button
            type="button"
            onClick={() => handleRunAiSearch()}
            disabled={isAiSearching}
            className="btn btn-primary"
            style={{
              backgroundColor: '#8b5cf6',
              borderColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              fontSize: '0.8125rem',
              minWidth: '140px',
              justifyContent: 'center',
            }}
          >
            {isAiSearching ? (
              <>
                <Clock size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Consultar IA</span>
              </>
            )}
          </button>
        </div>

        {/* Sugestões de Prompts Rápidos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Perguntas sugeridas:</span>
          {[
            'Setup rápido (SMED) na Extrusora',
            'Paradas de máquina e OEE na Tecelagem',
            'Desperdício de retrabalho no Acabamento',
            'Ideias do chão de fábrica com maior economia',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAiQuery(prompt);
                handleRunAiSearch(prompt);
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Resposta Gerada pela IA */}
        {aiResponse && (
          <div
            style={{
              marginTop: '1rem',
              backgroundColor: '#060a13',
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              padding: '1.25rem',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="#c084fc" />
                <span style={{ fontSize: '0.78125rem', fontWeight: 900, color: '#c084fc', textTransform: 'uppercase' }}>
                  Síntese da Inteligência Kaizen
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAiResponse(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Limpar resposta
              </button>
            </div>

            <p style={{ fontSize: '0.84375rem', color: '#f1f5f9', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              {aiResponse.summary}
            </p>

            {/* Matched Kaizens Badges */}
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Kaizens Encontrados ({aiResponse.matchedKaizens.length}):
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
              {aiResponse.matchedKaizens.map((k) => (
                <Link
                  key={k.id}
                  href={k.url}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#090e1a',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: k.origin === 'projeto' ? '#38bdf8' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                        {k.protocol}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>• {k.sectorName}</span>
                    </div>
                    <span style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {k.title}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(k.actualCostAvoided)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BARRA DE FILTROS AVANÇADOS & SELETORES DE ORIGEM                          */}
      {/* ========================================================================= */}
      <div
        style={{
          backgroundColor: '#0f172a',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Top Row: Origin Tabs & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Origin Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#090e1a', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={() => setOriginFilter('all')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: originFilter === 'all' ? '#2563eb' : 'transparent',
                color: originFilter === 'all' ? '#ffffff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🌟 Todos os Kaizens ({unifiedKaizens.length})
            </button>
            <button
              type="button"
              onClick={() => setOriginFilter('projeto')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: originFilter === 'projeto' ? '#0284c7' : 'transparent',
                color: originFilter === 'projeto' ? '#ffffff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              💎 Projetos Lean PDCA ({actions.filter((a) => a.status === 'concluida' || a.pdcaStage === 'act').length})
            </button>
            <button
              type="button"
              onClick={() => setOriginFilter('canal_kaizen')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: originFilter === 'canal_kaizen' ? '#d97706' : 'transparent',
                color: originFilter === 'canal_kaizen' ? '#ffffff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              💡 Canal Kaizen ({ideas.filter((i) => i.executionStatus === 'implantada_sucesso' || i.masterApproved).length})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar por protocolo, causa, autor, setor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#090e1a',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                paddingLeft: '2.2rem',
                fontSize: '0.8125rem',
              }}
            />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {/* Bottom Row: Dropdown Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={12} /> Filtros:
          </span>

          {/* Year Filter */}
          <select
            className="form-control form-control-sm"
            value={selectedYear}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedYear(val === 'all' ? 'all' : Number(val));
            }}
            style={{ width: 'auto', backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.75rem' }}
          >
            <option value="all">Ano: Todos</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>Ano: {yr}</option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            className="form-control form-control-sm"
            value={selectedMonth}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedMonth(val === 'all' ? 'all' : Number(val));
            }}
            style={{ width: 'auto', backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.75rem' }}
          >
            <option value="all">Mês: Todos</option>
            {MONTH_NAMES.map((m, idx) => (
              <option key={idx} value={idx}>Mês: {m}</option>
            ))}
          </select>

          {/* Sector Filter */}
          <select
            className="form-control form-control-sm"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            style={{ width: 'auto', backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.75rem' }}
          >
            <option value="all">Setor: Todos ({availableSectors.length})</option>
            {availableSectors.map((s) => (
              <option key={s} value={s}>Setor: {s}</option>
            ))}
          </select>

          {/* Waste Filter */}
          <select
            className="form-control form-control-sm"
            value={selectedWaste}
            onChange={(e) => setSelectedWaste(e.target.value)}
            style={{ width: 'auto', backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.75rem' }}
          >
            <option value="all">Desperdício Lean: Todos</option>
            {Object.entries(WASTE_CATEGORIES).map(([key, item]) => (
              <option key={key} value={key}>{item.icon} {item.label}</option>
            ))}
          </select>

          {/* Reset button if active filters */}
          {(searchQuery || originFilter !== 'all' || selectedYear !== 'all' || selectedMonth !== 'all' || selectedSector !== 'all' || selectedWaste !== 'all') && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#f87171',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <RotateCcw size={12} /> Limpar Filtros
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>
            Mostrando <strong>{filteredKaizens.length}</strong> de {unifiedKaizens.length} Kaizens
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LISTAGEM DOS KAIZENS: GRID DE CARDS OU TABELA                             */}
      {/* ========================================================================= */}
      {filteredKaizens.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
          }}
        >
          <Compass size={42} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Nenhum Kaizen encontrado com os filtros selecionados
          </h3>
          <p style={{ fontSize: '0.84375rem', color: '#94a3b8', margin: '0.35rem 0 1rem' }}>
            Tente ajustar o ano, mês ou limpar a busca textual para ver todo o histórico.
          </p>
          <button type="button" onClick={clearFilters} className="btn btn-primary btn-sm">
            Ver Todos os Kaizens
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID DE CARDS EXECUTIVOS */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredKaizens.map((k) => {
            const isExpanded = expandedKaizenId === k.id;
            const isProject = k.origin === 'projeto';

            return (
              <div
                key={k.id}
                className="card"
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '16px',
                  border: isProject ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Header do Card */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 900,
                        color: isProject ? '#38bdf8' : '#fbbf24',
                        backgroundColor: isProject ? 'rgba(56, 189, 248, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        border: `1px solid ${isProject ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {isProject ? '💎 PROJETO PDCA' : '💡 CANAL KAIZEN'} • {k.protocol}
                    </span>

                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={11} /> {formatDate(k.completedAt)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.35, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>
                    {k.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                    <Building2 size={13} color="#94a3b8" />
                    <span><strong>Setor:</strong> {k.sectorName}</span>
                    <span style={{ color: '#64748b' }}>•</span>
                    <User size={13} color="#94a3b8" />
                    <span>{k.leaderOrAuthor}</span>
                  </div>

                  {/* Indicador / Meta se houver */}
                  {k.targetMetricName && (
                    <div style={{ backgroundColor: '#090e1a', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                        Indicador: {k.targetMetricName}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#f87171', fontWeight: 700 }}>
                          Antes: {k.baselineValue !== undefined ? `${k.baselineValue} ${k.targetMetricUnit || ''}` : '--'}
                        </span>
                        <ArrowRight size={12} color="#94a3b8" />
                        <span style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: 900 }}>
                          Atingido: {k.achievedValue !== undefined ? `${k.achievedValue} ${k.targetMetricUnit || ''}` : 'Meta superada'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Ganhos Financeiros & Horas Salvas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ backgroundColor: '#090e1a', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <span style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Custo Evitado Real
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(k.actualCostAvoided)}
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>/ano</span>
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#090e1a', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                      <span style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Horas Salvas
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                        {k.hoursSaved > 0 ? `${k.hoursSaved}h` : 'Otimizado'}
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>/ano</span>
                      </span>
                    </div>
                  </div>

                  {/* Detalhes Expandíveis: Causa Raiz, Yokoten & Lições */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', marginBottom: '0.5rem' }}>
                      {k.problemStatement && (
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                          <strong style={{ color: '#22d3ee' }}>🎯 Diagnóstico do Problema:</strong>
                          <p style={{ margin: '0.15rem 0 0', lineHeight: 1.35 }}>{k.problemStatement}</p>
                        </div>
                      )}

                      {k.fiveWhys && k.fiveWhys.filter(Boolean).length > 0 && (
                        <div style={{ fontSize: '0.725rem', color: '#cbd5e1', backgroundColor: '#090e1a', padding: '0.5rem', borderRadius: '6px' }}>
                          <strong style={{ color: '#fbbf24' }}>🔍 5 Porquês (Causa Raiz):</strong>
                          <p style={{ margin: '0.15rem 0 0', fontStyle: 'italic', color: '#94a3b8' }}>
                            {k.fiveWhys[k.fiveWhys.length - 1] || k.fiveWhys[0]}
                          </p>
                        </div>
                      )}

                      {(k.lessonsLearned || k.yokotenReplication) && (
                        <div style={{ fontSize: '0.725rem', color: '#cbd5e1', backgroundColor: '#090e1a', padding: '0.5rem', borderRadius: '6px' }}>
                          <strong style={{ color: '#34d399' }}>📚 Lição Aprendida / Yokoten:</strong>
                          <p style={{ margin: '0.15rem 0 0', lineHeight: 1.35 }}>
                            {k.lessonsLearned || k.yokotenReplication}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer com Botões de Ação */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedKaizenId(isExpanded ? null : k.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.725rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? 'Menos detalhes' : 'Ver diagnósticos'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {k.a3Url && (
                      <Link
                        href={k.a3Url}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                        title="Abrir Relatório A3 Executivo"
                      >
                        <FileText size={12} /> A3
                      </Link>
                    )}

                    <Link
                      href={k.url}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.725rem', padding: '0.25rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <span>Abrir Kaizen</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABELA COMPARATIVA DE KAIZENS */
        <div className="card" style={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0, fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#090e1a', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Protocolo & Origem</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Título do Kaizen</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Setor & Líder</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Conclusão</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Custo Evitado Real</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Horas Salvas</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredKaizens.map((k) => (
                  <tr key={k.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: k.origin === 'projeto' ? '#38bdf8' : '#fbbf24', fontFamily: 'var(--font-mono)', display: 'block' }}>
                        {k.protocol}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                        {k.origin === 'projeto' ? '💎 Projeto PDCA' : '💡 Canal Kaizen'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', maxWidth: '320px' }}>
                      <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.8125rem' }}>{k.title}</strong>
                      {k.problemStatement && (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {k.problemStatement}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ color: '#ffffff', fontWeight: 600, display: 'block' }}>{k.sectorName}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{k.leaderOrAuthor}</span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', fontSize: '0.75rem' }}>
                      {formatDate(k.completedAt)}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(k.actualCostAvoided)}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                        {k.hoursSaved > 0 ? `${k.hoursSaved}h` : '--'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        {k.a3Url && (
                          <Link href={k.a3Url} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }} title="Relatório A3">
                            <FileText size={12} />
                          </Link>
                        )}
                        <Link href={k.url} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}>
                          Abrir
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
