'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  StrategicObjective,
  StrategicPillar,
  STRATEGIC_PILLARS_CONFIG,
  MacroStrategicDashboardMetrics,
  LeanAction,
} from '@/lib/types';
import {
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  ExternalLink,
  FileText,
  Building,
  Shield,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Layers,
  Award,
  Calendar,
  X,
  Check,
  AlertCircle,
  LayoutGrid,
  List,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '@/contexts/ThemeContext';

export default function AltaGerenciaPage() {
  const { currentTenant, currentUser, dataVersion, refreshData } = useAuth();
  const { isDark } = useTheme();
  const isAdmin = currentUser?.role === 'admin';

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPillar, setSelectedPillar] = useState<string>('todos');
  const [expandedObjectiveId, setExpandedObjectiveId] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<StrategicObjective | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    title: string;
    description: string;
    pillar: StrategicPillar;
    sponsor: string;
    year: number;
    deadlineDate: string;
    targetValue?: number;
    targetUnit?: 'currency' | 'percentage' | 'hours' | 'days';
    unitLabel?: string;
    baselineValue?: number;
  }>({
    code: '',
    title: '',
    description: '',
    pillar: 'financeiro_custos',
    sponsor: 'Diretoria Industrial & Controladoria',
    year: 2026,
    deadlineDate: '2026-12-31',
  });

  // Calculate macro metrics
  const macroMetrics: MacroStrategicDashboardMetrics = useMemo(() => {
    return dataService.getMacroStrategicDashboardMetrics(selectedYear);
  }, [selectedYear, dataVersion]);

  // Filtered objectives list
  const filteredObjectives = useMemo(() => {
    if (selectedPillar === 'todos') {
      return macroMetrics.objectivesWithMetrics;
    }
    return macroMetrics.objectivesWithMetrics.filter(
      (om) => om.objective.pillar === selectedPillar
    );
  }, [macroMetrics, selectedPillar]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setEditingObjective(null);
    const count = macroMetrics.objectivesWithMetrics.length + 1;
    setFormData({
      code: `HOSHIN-${selectedYear}-${String(count).padStart(2, '0')}`,
      title: '',
      description: '',
      pillar: 'financeiro_custos',
      sponsor: 'Diretoria Industrial & Controladoria',
      year: selectedYear,
      deadlineDate: `${selectedYear}-12-31`,
    });
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (obj: StrategicObjective) => {
    setEditingObjective(obj);
    setFormData({
      code: obj.code,
      title: obj.title,
      description: obj.description,
      pillar: obj.pillar,
      sponsor: obj.sponsor,
      year: obj.year,
      targetValue: obj.targetValue,
      targetUnit: obj.targetUnit,
      unitLabel: obj.unitLabel,
      baselineValue: obj.baselineValue,
      deadlineDate: obj.deadlineDate || `${obj.year}-12-31`,
    });
    setIsModalOpen(true);
  };

  // Handle save
  const handleSaveObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Informe o título da diretriz corporativa.');
      return;
    }

    dataService.saveStrategicObjective({
      id: editingObjective?.id,
      code: formData.code.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      pillar: formData.pillar,
      sponsor: formData.sponsor.trim(),
      year: Number(formData.year) || selectedYear,
      targetValue: formData.targetValue ? Number(formData.targetValue) : undefined,
      targetUnit: formData.targetUnit,
      unitLabel: formData.unitLabel?.trim() || undefined,
      baselineValue: formData.baselineValue !== undefined ? Number(formData.baselineValue) : undefined,
      deadlineDate: formData.deadlineDate,
      status: editingObjective?.status || 'ativo',
    });

    setIsModalOpen(false);
    refreshData();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  // Handle delete
  const handleDeleteObjective = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir a diretriz "${title}"?`)) {
      dataService.deleteStrategicObjective(id);
      refreshData();
    }
  };

  // Status semantic badges for Overall Fulfillment
  const fulfillmentClass =
    macroMetrics.overallFulfillmentPercent >= 85
      ? { label: 'Classe Mundial (World Class)', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' }
      : macroMetrics.overallFulfillmentPercent >= 60
      ? { label: 'Em Atenção Operacional', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' }
      : { label: 'Risco de Desconexão Estratégica', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* 1. CABEÇALHO EXECUTIVO */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.725rem',
                fontWeight: 800,
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Target size={13} /> Hoshin Kanri • Desdobramento de Diretrizes
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              • {currentTenant?.name || 'Rafitec S.A.'}
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: isDark ? '#ffffff' : '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Alta Gerência & Metas Globais de Negócio
          </h1>
          <p style={{ fontSize: '0.875rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.35rem 0 0', maxWidth: '800px', lineHeight: 1.5 }}>
            Convergência estratégica de projetos Kaizen e PDCA do chão de fábrica para os objetivos corporativos da diretoria.
            O Sensei IA audita a coerência de cada melhoria e emite justificativas executivas de retorno.
          </p>
        </div>

        {/* Controles: Ano e Botão Cadastrar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: isDark ? '#020617' : '#ffffff',
            padding: '0.4rem 0.8rem',
            borderRadius: '10px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
            boxShadow: isDark ? 'none' : 'var(--shadow-sm)'
          }}>
            <Calendar size={15} style={{ color: '#0284c7' }} />
            <span style={{ fontSize: '0.78125rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Ciclo:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: isDark ? '#ffffff' : '#0f172a',
                fontWeight: 800,
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={2026} style={{ backgroundColor: isDark ? '#020617' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>2026</option>
              <option value={2025} style={{ backgroundColor: isDark ? '#020617' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>2025</option>
              <option value={2027} style={{ backgroundColor: isDark ? '#020617' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>2027</option>
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)',
              }}
            >
              <Plus size={16} /> Cadastrar Nova Diretriz
            </button>
          )}
        </div>
      </div>

      {/* 2. PAINEL MACRO DE CONVERGÊNCIA EXECUTIVA */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1: % Macro Global de Atendimento */}
        <div
          className="card"
          style={{
            padding: '1.35rem',
            borderRadius: '16px',
            border: isDark ? `1.5px solid ${fulfillmentClass.border}` : '1px solid #cbd5e1',
            borderLeft: !isDark ? `4.5px solid ${fulfillmentClass.color}` : undefined,
            background: isDark ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)' : '#ffffff',
            boxShadow: isDark ? 'none' : 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Aderência Estratégica Global (Hoshin)
              </span>
              <Target size={18} style={{ color: fulfillmentClass.color }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <h2
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: fulfillmentClass.color,
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '-0.03em',
                }}
              >
                {macroMetrics.overallFulfillmentPercent}%
              </h2>
              <span style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>convergência do Gemba</span>
            </div>

            {/* Barra de Progresso Macro */}
            <div style={{ width: '100%', height: '8px', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0', borderRadius: '9999px', margin: '0.85rem 0 0.5rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, macroMetrics.overallFulfillmentPercent)}%`,
                  height: '100%',
                  backgroundColor: fulfillmentClass.color,
                  borderRadius: '9999px',
                  boxShadow: `0 0 10px ${fulfillmentClass.color}`,
                  transition: 'width 0.8s ease-in-out',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 800,
                color: fulfillmentClass.color,
                backgroundColor: fulfillmentClass.bg,
                border: `1px solid ${fulfillmentClass.border}`,
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              {fulfillmentClass.label}
            </span>
            <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
              {macroMetrics.achievedObjectivesCount}/{macroMetrics.totalObjectivesCount} metas batidas
            </span>
          </div>
        </div>

        {/* Card 2: Retorno Financeiro Convergente */}
        <div
          className="card"
          style={{
            padding: '1.35rem',
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #cbd5e1',
            borderLeft: !isDark ? '4.5px solid #10b981' : undefined,
            background: isDark ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)' : '#ffffff',
            boxShadow: isDark ? 'none' : 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Custo Evitado Alinhado
              </span>
              <DollarSign size={18} style={{ color: '#10b981' }} />
            </div>

            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: isDark ? '#34d399' : '#0f172a',
                margin: 0,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(macroMetrics.totalAvoidedCostAligned)}
            </h2>
            <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.35rem 0 0' }}>
              Gerados por projetos homologados que convergem diretamente com metas corporativas.
            </p>
          </div>

          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: '#10b981', fontWeight: 700 }}>
            <CheckCircle2 size={13} />
            <span>{macroMetrics.completedAlignedProjectsCount} projeto(s) concluído(s) no Gemba</span>
          </div>
        </div>

        {/* Card 3: Horas Resgatadas */}
        <div
          className="card"
          style={{
            padding: '1.35rem',
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #cbd5e1',
            borderLeft: !isDark ? '4.5px solid #0284c7' : undefined,
            background: isDark ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)' : '#ffffff',
            boxShadow: isDark ? 'none' : 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Horas Resgatadas (Capacidade)
              </span>
              <Clock size={18} style={{ color: '#0284c7' }} />
            </div>

            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: isDark ? '#38bdf8' : '#0f172a',
                margin: 0,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
              }}
            >
              {macroMetrics.totalHoursSavedAligned.toLocaleString('pt-BR')}h
            </h2>
            <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.35rem 0 0' }}>
              Horas operacionais reaproveitadas em atividades de alto valor agregado.
            </p>
          </div>

          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>
            <TrendingUp size={13} />
            <span>Eliminação de microparadas & SMED</span>
          </div>
        </div>

        {/* Card 4: Taxa de Cobertura do Portfólio */}
        <div
          className="card"
          style={{
            padding: '1.35rem',
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid #cbd5e1',
            borderLeft: !isDark ? '4.5px solid #8b5cf6' : undefined,
            background: isDark ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)' : '#ffffff',
            boxShadow: isDark ? 'none' : 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cobertura Estratégica do Portfólio
              </span>
              <Layers size={18} style={{ color: '#8b5cf6' }} />
            </div>

            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: isDark ? '#c084fc' : '#0f172a',
                margin: 0,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
              }}
            >
              {macroMetrics.projectCoveragePercent}%
            </h2>
            <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.35rem 0 0' }}>
              {macroMetrics.totalAlignedProjectsCount} projetos conectados às prioridades corporativas da empresa.
            </p>
          </div>

          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: isDark ? '#c084fc' : '#8b5cf6', fontWeight: 700 }}>
            <Shield size={13} />
            <span>Zero projetos dispersos no Gemba</span>
          </div>
        </div>
      </div>

      {/* 3. FILTRO POR PILAR ESTRATÉGICO */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          backgroundColor: isDark ? '#020617' : '#ffffff',
          padding: '0.5rem 0.75rem',
          borderRadius: '12px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
          boxShadow: isDark ? 'none' : 'var(--shadow-sm)'
        }}
      >
        <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.35rem' }}>
          <Filter size={14} /> Pilares Hoshin:
        </span>

        <button
          type="button"
          onClick={() => setSelectedPillar('todos')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.78125rem',
            fontWeight: 700,
            border: selectedPillar === 'todos' ? (isDark ? '1px solid #38bdf8' : '1.5px solid #0284c7') : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
            backgroundColor: selectedPillar === 'todos' ? (isDark ? 'rgba(56, 189, 248, 0.2)' : '#e0f2fe') : (isDark ? 'transparent' : '#f8fafc'),
            color: selectedPillar === 'todos' ? (isDark ? '#ffffff' : '#0284c7') : (isDark ? '#cbd5e1' : '#475569'),
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Todos ({macroMetrics.objectivesWithMetrics.length})
        </button>

        {(Object.entries(STRATEGIC_PILLARS_CONFIG) as [StrategicPillar, typeof STRATEGIC_PILLARS_CONFIG[StrategicPillar]][]).map(([pKey, pConfig]) => {
          const count = macroMetrics.objectivesWithMetrics.filter((om) => om.objective.pillar === pKey).length;
          const isSelected = selectedPillar === pKey;
          return (
            <button
              type="button"
              key={pKey}
              onClick={() => setSelectedPillar(pKey)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78125rem',
                fontWeight: 700,
                border: isSelected ? `1.5px solid ${pConfig.color}` : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
                backgroundColor: isSelected ? pConfig.bg : (isDark ? 'transparent' : '#f8fafc'),
                color: isSelected ? (isDark ? '#ffffff' : pConfig.color) : (isDark ? '#cbd5e1' : '#475569'),
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{pConfig.icon}</span>
              <span>{pConfig.shortLabel}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* 4. BARRA DE CONTROLE & VISUALIZAÇÃO DAS DIRETRIZES */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginTop: '0.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Target size={18} style={{ color: '#0284c7' }} /> Diretrizes Corporativas & Desdobramento Hoshin
          </h3>
          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
              color: isDark ? '#38bdf8' : '#0284c7',
              border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd',
              padding: '0.15rem 0.55rem',
              borderRadius: '9999px',
            }}
          >
            {filteredObjectives.length} {filteredObjectives.length === 1 ? 'meta ativa' : 'metas ativas'}
          </span>
        </div>

        {/* Alternador de Layout: Grade Multi-Coluna vs Lista Ampla */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: isDark ? '#020617' : '#f1f5f9',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '3px',
            gap: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => setLayoutMode('grid')}
            title="Visualização em Grade Multi-Coluna (lado a lado)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.7rem',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: layoutMode === 'grid' ? '#0284c7' : 'transparent',
              color: layoutMode === 'grid' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutGrid size={14} />
            <span>Grade Multi-Coluna</span>
          </button>

          <button
            type="button"
            onClick={() => setLayoutMode('list')}
            title="Visualização em Lista Linear (largura total)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.7rem',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: layoutMode === 'list' ? '#0284c7' : 'transparent',
              color: layoutMode === 'list' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
              transition: 'all 0.15s ease',
            }}
          >
            <List size={14} />
            <span>Lista</span>
          </button>
        </div>
      </div>

      {/* GRID DE DIRETRIZES DA ALTA GERÊNCIA & PROJETOS CONVERGENTES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            layoutMode === 'grid'
              ? 'repeat(auto-fit, minmax(460px, 1fr))'
              : '1fr',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {filteredObjectives.length === 0 ? (
          <div
            className="card"
            style={{
              gridColumn: '1 / -1',
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              border: isDark ? 'none' : '1px solid #cbd5e1',
              borderRadius: '16px',
            }}
          >
            <Target size={42} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
              Nenhuma diretriz encontrada para este filtro
            </h3>
            <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.35rem 0 1rem' }}>
              Selecione outro pilar ou cadastre uma nova meta corporativa da Alta Gerência.
            </p>
            {isAdmin && (
              <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
                <Plus size={14} /> Cadastrar Nova Diretriz
              </button>
            )}
          </div>
        ) : (
          filteredObjectives.map(({ objective, currentRealizedValue, fulfillmentPercent, averageAdherenceScore, linkedProjects, completedProjectsCount, inProgressProjectsCount, senseiExecutiveSynthesis }) => {
            const pillarConfig = STRATEGIC_PILLARS_CONFIG[objective.pillar];
            const isExpanded = expandedObjectiveId === objective.id;

            const formatValue = (val?: number) => {
              if (val === undefined || val === null) return 'N/A';
              if (objective.targetUnit === 'currency') return formatCurrency(val);
              if (objective.targetUnit === 'percentage') return `${val}%`;
              if (objective.targetUnit === 'hours') return `${val.toLocaleString('pt-BR')}h`;
              return `${val} ${objective.unitLabel || ''}`.trim();
            };

            const progressBarColor =
              fulfillmentPercent >= 100
                ? '#10b981'
                : fulfillmentPercent >= 60
                ? '#0284c7'
                : '#f59e0b';

            return (
              <div
                key={objective.id}
                className="card"
                style={{
                  borderRadius: '16px',
                  border: isDark
                    ? `1.5px solid ${isExpanded ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`
                    : `1px solid ${isExpanded ? '#0284c7' : '#cbd5e1'}`,
                  borderLeft: !isDark ? `4.5px solid ${pillarConfig.color}` : undefined,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)'
                    : '#ffffff',
                  boxShadow: isDark ? 'none' : 'var(--shadow-md)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {/* Cabeçalho do Card da Diretriz */}
                <div style={{ padding: '1.25rem 1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: pillarConfig.bg,
                          color: pillarConfig.color,
                          border: `1px solid ${pillarConfig.border}`,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span>{pillarConfig.icon}</span>
                        <span>{pillarConfig.label}</span>
                      </span>

                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          color: isDark ? '#38bdf8' : '#0284c7',
                          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#e0f2fe',
                          border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                        }}
                      >
                        {objective.code}
                      </span>

                      <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                        Patrocinador: <strong style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>{objective.sponsor}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(objective)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem' }}
                            title="Editar diretriz corporativa"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteObjective(objective.id, objective.title)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem', color: '#ef4444' }}
                            title="Excluir diretriz"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}

                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          backgroundColor: fulfillmentPercent >= 100
                            ? (isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7')
                            : (isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe'),
                          color: fulfillmentPercent >= 100
                            ? (isDark ? '#4ade80' : '#15803d')
                            : (isDark ? '#38bdf8' : '#0369a1'),
                          border: `1px solid ${
                            fulfillmentPercent >= 100
                              ? (isDark ? 'rgba(34, 197, 94, 0.35)' : '#bbf7d0')
                              : (isDark ? 'rgba(56, 189, 248, 0.35)' : '#bae6fd')
                          }`,
                        }}
                      >
                        {fulfillmentPercent >= 100 ? '✓ Meta Atingida' : `${fulfillmentPercent}% Atendido`}
                      </span>
                    </div>
                  </div>

                  {/* Título e Descrição do Desafio */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: isDark ? '#ffffff' : '#0f172a',
                        margin: 0,
                        fontFamily: 'var(--font-heading)',
                        lineHeight: 1.35,
                      }}
                    >
                      {objective.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#475569', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
                      {objective.description}
                    </p>
                  </div>

                  {/* Medidor de Realizado vs Meta Corporativa */}
                  <div
                    style={{
                      backgroundColor: isDark ? 'rgba(2, 6, 23, 0.7)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 700 }}>Aderência dos Projetos:</span>
                        <strong style={{ fontSize: '1.2rem', color: isDark ? '#38bdf8' : '#0284c7', fontFamily: 'var(--font-mono)' }}>
                          {averageAdherenceScore}%
                        </strong>
                        {objective.targetValue ? (
                          <span style={{ fontSize: '0.725rem', color: isDark ? '#64748b' : '#64748b' }}>
                            (Realizado: {formatValue(currentRealizedValue)} / Meta: <strong style={{ color: isDark ? '#cbd5e1' : '#0f172a' }}>{formatValue(objective.targetValue)}</strong>)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: isDark ? '#64748b' : '#64748b' }}>
                            ({linkedProjects.length} iniciativas • Custo Evitado: {formatCurrency(linkedProjects.reduce((acc, a) => acc + (a.actualCostAvoided || 0), 0))})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.725rem' }}>
                        <span style={{ color: isDark ? '#34d399' : '#15803d', fontWeight: 700 }}>
                          ✓ {completedProjectsCount} concluído(s)
                        </span>
                        <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>
                          ⏳ {inProgressProjectsCount} em andamento
                        </span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '8px', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, fulfillmentPercent)}%`,
                          height: '100%',
                          backgroundColor: progressBarColor,
                          borderRadius: '9999px',
                          boxShadow: `0 0 10px ${progressBarColor}`,
                          transition: 'width 0.8s ease-in-out',
                        }}
                      />
                    </div>
                  </div>

                  {/* Laudo Síntese do Sensei IA */}
                  <div
                    style={{
                      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.05)' : '#f0f9ff',
                      border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #bae6fd',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <Sparkles size={16} style={{ color: isDark ? '#38bdf8' : '#0284c7', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#0369a1', fontStyle: 'italic', lineHeight: 1.45 }}>
                        "{senseiExecutiveSynthesis}"
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setExpandedObjectiveId(isExpanded ? null : objective.id)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isDark ? '#38bdf8' : '#0284c7',
                          borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#bae6fd',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span>{isExpanded ? 'Ocultar Projetos' : `Ver Projetos Vinculados (${linkedProjects.length})`}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. ÁRVORE DETALHADA DE PROJETOS KAIZEN CONVERGENTES */}
                {isExpanded && (
                  <div
                    style={{
                      backgroundColor: isDark ? 'rgba(2, 6, 23, 0.95)' : '#f8fafc',
                      borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={16} style={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                          Projetos Kaizen Conectados ({linkedProjects.length})
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                        Contribuição técnica ao desafio corporativo
                      </span>
                    </div>

                    {linkedProjects.length === 0 ? (
                      <div
                        style={{
                          padding: '2rem',
                          textAlign: 'center',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                          borderRadius: '12px',
                          border: isDark ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px dashed #cbd5e1',
                        }}
                      >
                        <AlertCircle size={32} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#0f172a', fontWeight: 700, margin: 0 }}>
                          Nenhum projeto vinculado a esta meta corporativa
                        </p>
                        <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.25rem 0 0.85rem' }}>
                          Vincule projetos existentes ou crie novas ações no Kanban com esta diretriz selecionada.
                        </p>
                        <Link href="/admin/kanban" className="btn btn-secondary btn-sm">
                          Ir para o Kanban de Projetos
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '460px', overflowY: 'auto', paddingRight: '0.35rem' }}>
                        {linkedProjects.map((proj) => {
                          const savings = proj.actualCostAvoided || proj.estimatedCostAvoided || 0;
                          return (
                            <div
                              key={proj.id}
                              style={{
                                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                                borderRadius: '12px',
                                padding: '1rem',
                                boxShadow: isDark ? 'none' : 'var(--shadow-sm)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.6rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.725rem',
                                    fontWeight: 800,
                                    color: isDark ? '#38bdf8' : '#0284c7',
                                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#e0f2fe',
                                    border: isDark ? 'none' : '1px solid #bae6fd',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '4px'
                                  }}>
                                    {proj.protocol || proj.id}
                                  </span>
                                  <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                                    {proj.title}
                                  </strong>
                                  <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    • {proj.originSectorName || 'Setor'}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '9999px',
                                      backgroundColor: proj.status === 'concluida'
                                        ? (isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7')
                                        : (isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe'),
                                      color: proj.status === 'concluida'
                                        ? (isDark ? '#4ade80' : '#15803d')
                                        : (isDark ? '#38bdf8' : '#0284c7'),
                                    }}
                                  >
                                    {proj.status === 'concluida' ? '✓ Concluído' : proj.status}
                                  </span>

                                  {proj.senseiStrategicAudit?.alignmentScore && (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      color: isDark ? '#34d399' : '#15803d',
                                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
                                      border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: '6px'
                                    }}>
                                      Aderência: {proj.senseiStrategicAudit.alignmentScore}%
                                    </span>
                                  )}

                                  <Link
                                    href={`/admin/projetos/${proj.id}`}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.45rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Abrir página completa do projeto"
                                  >
                                    <ExternalLink size={12} /> Abrir
                                  </Link>

                                  <Link
                                    href={`/admin/projetos/${proj.id}/relatorio-a3`}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.45rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Ver Relatório A3"
                                  >
                                    <FileText size={12} /> A3
                                  </Link>
                                </div>
                              </div>

                              {/* Laudo do Sensei IA para o Projeto: "Por que converge?" */}
                              <div
                                style={{
                                  backgroundColor: isDark ? 'rgba(2, 6, 23, 0.7)' : '#f0f9ff',
                                  border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid #bae6fd',
                                  borderRadius: '8px',
                                  padding: '0.7rem 0.85rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.35rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isDark ? '#38bdf8' : '#0284c7', fontSize: '0.725rem', fontWeight: 700 }}>
                                    <Sparkles size={12} />
                                    <span>Justificativa de Convergência do Sensei IA:</span>
                                  </div>
                                  <span style={{ fontSize: '0.675rem', color: isDark ? '#64748b' : '#64748b' }}>
                                    {proj.senseiStrategicAudit?.modelUsed || 'Sensei IA'}
                                  </span>
                                </div>

                                <p style={{ margin: 0, color: isDark ? '#cbd5e1' : '#1e293b', fontSize: '0.78125rem', lineHeight: 1.45, fontStyle: 'italic' }}>
                                  "{proj.senseiStrategicAudit?.justification || 'Projeto alinhado tecnicamente à meta através da eliminação de causas vitais de desperdício no Gemba.'}"
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                                  <span style={{ fontSize: '0.725rem', color: isDark ? '#34d399' : '#15803d', fontWeight: 700 }}>
                                    💰 Custo Evitado: {formatCurrency(savings)}/ano
                                  </span>
                                  {proj.hoursSaved > 0 && (
                                    <span style={{ fontSize: '0.725rem', color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>
                                      ⏱️ Horas Salvas: {proj.hoursSaved}h
                                    </span>
                                  )}
                                  <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    Líder: <strong style={{ color: isDark ? '#cbd5e1' : '#0f172a' }}>{proj.leaderName || proj.assignedAgentName || 'Agente'}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. MODAL DE CADASTRO / EDIÇÃO DE DIRETRIZ ESTRATÉGICA */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              backgroundColor: isDark ? '#0a0f1d' : '#ffffff',
              border: isDark ? '1.5px solid rgba(59, 130, 246, 0.4)' : '1px solid #cbd5e1',
              padding: '1.75rem',
              boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.75)' : 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  {editingObjective ? 'Editar Diretriz Estratégica' : 'Cadastrar Diretriz da Alta Gerência'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveObjective} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Código Hoshin:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: HOSHIN-2026-01"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Ano de Vigência:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Título da Meta Corporativa:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Redução de Custo de Transformação na Fiação & Extrusão"
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Desafio Corporativo / Detalhamento:</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explique o contexto, o desafio prioritário para a diretoria e onde a fábrica deve focar..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Pilar Estratégico STP:</label>
                  <select
                    className="form-select"
                    value={formData.pillar}
                    onChange={(e) => setFormData({ ...formData, pillar: e.target.value as StrategicPillar })}
                  >
                    {(Object.entries(STRATEGIC_PILLARS_CONFIG) as [StrategicPillar, typeof STRATEGIC_PILLARS_CONFIG[StrategicPillar]][]).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.icon} {v.shortLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Patrocinador / Diretor Responsável:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.sponsor}
                    onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                    placeholder="Ex: Diretoria Industrial / CEO"
                    required
                  />
                </div>
              </div>

              {/* Meta Quantitativa Opcional */}
              <div style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#475569' }}>
                    Meta Quantitativa (Opcional)
                  </span>
                  <span style={{ fontSize: '0.675rem', color: isDark ? '#64748b' : '#64748b' }}>
                    O Sensei IA avalia a convergência e o % de aderência automaticamente
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.75rem' }}>Tipo de Meta:</label>
                    <select
                      className="form-select"
                      value={formData.targetUnit || 'currency'}
                      onChange={(e) => {
                        const u = e.target.value as 'currency' | 'percentage' | 'hours' | 'days';
                        let defaultLabel = 'R$';
                        if (u === 'percentage') defaultLabel = '%';
                        if (u === 'hours') defaultLabel = 'horas';
                        if (u === 'days') defaultLabel = 'dias';
                        setFormData({ ...formData, targetUnit: u, unitLabel: defaultLabel });
                      }}
                      style={{ fontSize: '0.8rem' }}
                    >
                      <option value="currency">Moeda (R$)</option>
                      <option value="percentage">Percentual (%)</option>
                      <option value="hours">Horas (h)</option>
                      <option value="days">Dias</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.75rem' }}>Meta Numérica:</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      placeholder="Opcional"
                      value={formData.targetValue !== undefined ? formData.targetValue : ''}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value ? Number(e.target.value) : undefined })}
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.75rem' }}>Baseline (Partida):</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      placeholder="Opcional"
                      value={formData.baselineValue !== undefined ? formData.baselineValue : ''}
                      onChange={(e) => setFormData({ ...formData, baselineValue: e.target.value ? Number(e.target.value) : undefined })}
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Data Limite para Atingimento:</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.deadlineDate}
                  onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
                  Salvar Diretriz Corporativa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
