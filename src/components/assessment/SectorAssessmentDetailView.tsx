'use client';

import React, { useState, useMemo } from 'react';
import { Sector, SectorLeanAssessment, LeanAssessmentDimensionId, ASSESSMENT_DIMENSIONS_CONFIG } from '@/lib/types';
import { dataService } from '@/services/dataService';
import { LeanRadarChart, RadarDataPoint } from '@/components/charts/LeanRadarChart';
import { SectorAssessmentModal } from '@/components/assessment/SectorAssessmentModal';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  UserCheck,
  Plus,
  Printer,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { LeanAssessmentMethodologyDefense } from '@/components/assessment/LeanAssessmentMethodologyDefense';

interface SectorAssessmentDetailViewProps {
  sector: Sector;
  onNewAssessmentCreated?: () => void;
}

export const SectorAssessmentDetailView: React.FC<SectorAssessmentDetailViewProps> = ({
  sector,
  onNewAssessmentCreated,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | undefined>(undefined);
  const [compareAssessmentId, setCompareAssessmentId] = useState<string | undefined>(undefined);
  const [expandedDimensionId, setExpandedDimensionId] = useState<string | null>(null);

  // Carregar histórico de assessments do setor
  const assessments = useMemo(() => {
    return dataService.getSectorAssessments(sector.id);
  }, [sector.id]);

  // Assessment atual selecionado (padrão: o mais recente)
  const currentAssessment = useMemo(() => {
    if (selectedAssessmentId) {
      return assessments.find((a) => a.id === selectedAssessmentId) || assessments[0];
    }
    return assessments[0];
  }, [assessments, selectedAssessmentId]);

  // Assessment para comparação
  const comparisonData = useMemo(() => {
    if (!currentAssessment) return null;
    return dataService.getSectorEvolutionComparison(
      sector.id,
      currentAssessment.id,
      compareAssessmentId
    );
  }, [sector.id, currentAssessment, compareAssessmentId]);

  // Ações Kaizen e formação real do Custo Evitado do Setor
  const sectorSavings = useMemo(() => {
    const allActions = dataService.getActions().filter(
      (a) => a.originSectorId === sector.id || a.targetSectorId === sector.id
    );
    const completed = allActions.filter((a) => a.status === 'concluida');
    const totalActual = completed.reduce((acc, a) => acc + (a.actualCostAvoided || a.estimatedCostAvoided || 0), 0);
    const totalHours = completed.reduce((acc, a) => acc + (a.hoursSaved || 0), 0);
    const totalEstimated = allActions.reduce((acc, a) => acc + (a.estimatedCostAvoided || 0), 0);

    // Decomposição das fontes do setor
    const rawMaterialSavings = completed.reduce((acc, a) => acc + (a.costBreakdown?.scrapReduction || 0), 0);
    const downtimeSavings = completed.reduce((acc, a) => acc + (a.costBreakdown?.machineDowntime || 0), 0);
    const setupSavings = completed.reduce((acc, a) => acc + (a.costBreakdown?.productionIncrease || 0), 0);
    const laborSavings = completed.reduce((acc, a) => acc + (a.costBreakdown?.laborSavings || 0), 0);

    return {
      allActions,
      completed,
      completedCount: completed.length,
      totalActual: totalActual > 0 ? totalActual : totalEstimated,
      totalHours,
      rawMaterialSavings,
      downtimeSavings,
      setupSavings,
      laborSavings,
    };
  }, [sector.id]);

  // Kaizens do setor mapeados aos 6 eixos do Lean Assessment
  const sectorKaizensByDim = useMemo(() => {
    return dataService.getSectorKaizensByAssessmentDimension(sector.id);
  }, [sector.id]);

  // Diagnóstico aprofundado do Sensei com mapeamento dos pontos críticos e sugestões acionáveis
  const senseiActionDetails = useMemo(() => {
    if (!currentAssessment?.senseiDiagnosis?.suggestedKaizenProject) return null;
    const proj = currentAssessment.senseiDiagnosis.suggestedKaizenProject;

    // Se já tiver os campos preenchidos, usa diretamente
    if (proj.criticalPoints && proj.criticalPoints.length > 0) {
      return proj;
    }

    // Caso contrário, gera dinamicamente através do dimensionMeta do dataService
    const diagnosis = dataService.generateSenseiAssessmentDiagnosis(
      currentAssessment.dimensions,
      sector.name
    );

    return {
      ...proj,
      executiveSummary: proj.executiveSummary || diagnosis.suggestedKaizenProject.executiveSummary || proj.description,
      criticalPoints: proj.criticalPoints || diagnosis.suggestedKaizenProject.criticalPoints,
      rootCauses: proj.rootCauses || diagnosis.suggestedKaizenProject.rootCauses,
      actionableSuggestions: proj.actionableSuggestions || diagnosis.suggestedKaizenProject.actionableSuggestions,
      estimatedMaturityJump: proj.estimatedMaturityJump || diagnosis.suggestedKaizenProject.estimatedMaturityJump,
      projectedCostAvoidedMonthly: proj.projectedCostAvoidedMonthly || diagnosis.suggestedKaizenProject.projectedCostAvoidedMonthly,
    };
  }, [currentAssessment, sector.name]);

  // Preparar dados para o Gráfico de Radar
  const radarData: RadarDataPoint[] = useMemo(() => {
    if (!currentAssessment) return [];

    const dimOrder: { id: LeanAssessmentDimensionId; label: string; short: string }[] = [
      { id: 'estabilidade_5s', label: 'Estabilidade Básica, 5S & Gestão Visual', short: '5S & Visual' },
      { id: 'trabalho_padronizado', label: 'Trabalho Padronizado, POPs & TWI', short: 'Trabalho Padronizado' },
      { id: 'fluxo_jit', label: 'Fluxo Contínuo & JIT (Kanban)', short: 'Fluxo & Kanban' },
      { id: 'qualidade_poka_yoke', label: 'Qualidade na Origem (Poka-Yoke)', short: 'Qualidade & Poka-Yoke' },
      { id: 'tpm_oee', label: 'Manutenção Produtiva Total (TPM & OEE)', short: 'TPM & OEE' },
      { id: 'cultura_kaizen', label: 'Cultura Kaizen & Pessoas', short: 'Cultura Kaizen' },
    ];

    const prev = comparisonData?.previousAssessment;

    return dimOrder.map((dim) => ({
      dimensionId: dim.id,
      label: dim.label,
      shortLabel: dim.short,
      currentValue: currentAssessment.dimensions[dim.id] || 0,
      previousValue: prev ? prev.dimensions[dim.id] : undefined,
    }));
  }, [currentAssessment, comparisonData]);

  const handlePrintPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!currentAssessment) {
    return (
      <div
        className="card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: '#090d16',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            border: '1.5px solid #22d3ee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
          }}
        >
          📊
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Nenhum Lean Assessment realizado para {sector.name}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '480px', margin: '0.5rem auto 0 auto' }}>
            Inicie a primeira auditoria no Gemba para diagnosticar a maturidade operacional e gerar o Gráfico de Radar do setor.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 800,
          }}
        >
          <Plus size={17} /> Realizar Primeiro Lean Assessment
        </button>

        <SectorAssessmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sector={sector}
          onSaved={() => {
            if (onNewAssessmentCreated) onNewAssessmentCreated();
          }}
        />
      </div>
    );
  }

  const overallDelta = comparisonData?.overallDelta || 0;
  const prevDate = comparisonData?.previousAssessment?.assessmentDate;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Barra de Ações & Seleção de Auditoria */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#0c121e',
          borderLeft: `5px solid ${sector.color || '#06b6d4'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Auditoria Ativa:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <select
                value={currentAssessment.id}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {assessments.map((asm, idx) => (
                  <option key={asm.id} value={asm.id}>
                    {idx === 0 ? '⭐ Vigente: ' : 'Histórico: '}
                    {formatDate(asm.assessmentDate)} • Score {asm.overallScore}% ({asm.evaluatorName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {assessments.length > 1 && (
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Comparar Com:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <select
                  value={compareAssessmentId || comparisonData?.previousAssessment?.id || ''}
                  onChange={(e) => setCompareAssessmentId(e.target.value)}
                  style={{
                    backgroundColor: '#070a12',
                    border: '1px solid #c084fc',
                    color: '#c084fc',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {assessments
                    .filter((a) => a.id !== currentAssessment.id)
                    .map((asm) => (
                      <option key={asm.id} value={asm.id}>
                        Linha de Comparação: {formatDate(asm.assessmentDate)} ({asm.overallScore}%)
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handlePrintPDF}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f1f5f9',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
            title="Exportar dossiê para impressão / PDF"
          >
            <Printer size={15} /> Imprimir / PDF
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1.15rem',
              fontSize: '0.8125rem',
              fontWeight: 800,
            }}
          >
            <Plus size={16} /> Novo Assessment (Gemba)
          </button>
        </div>
      </div>

      {/* 2. Banner de Score Global de Maturidade & Delta de Evolução */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#0a0f1d',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          alignItems: 'center',
        }}
      >
        {/* Score Geral */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
            }}
          >
            🏆
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
              Maturidade Lean Global
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {currentAssessment.overallScore}%
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                }}
              >
                Nível {currentAssessment.overallLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Delta Comparativo com Auditoria Anterior */}
        {comparisonData?.previousAssessment && (
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: `1.5px solid ${overallDelta > 0 ? 'rgba(16, 185, 129, 0.4)' : overallDelta < 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: overallDelta > 0 ? 'rgba(16, 185, 129, 0.2)' : overallDelta < 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {overallDelta > 0 ? (
                <TrendingUp size={20} color="#34d399" />
              ) : overallDelta < 0 ? (
                <TrendingDown size={20} color="#f87171" />
              ) : (
                <Minus size={20} color="#94a3b8" />
              )}
            </div>
            <div>
              <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Evolução vs {formatDate(prevDate || '')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <strong
                  style={{
                    fontSize: '1.15rem',
                    fontFamily: 'var(--font-mono)',
                    color: overallDelta > 0 ? '#34d399' : overallDelta < 0 ? '#f87171' : '#94a3b8',
                  }}
                >
                  {overallDelta > 0 ? `+${overallDelta}%` : `${overallDelta}%`}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  de avanço ({comparisonData.previousAssessment.overallScore}% ➔ {currentAssessment.overallScore}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Metadados do Auditor & Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCheck size={14} color="#22d3ee" />
            <span>
              Avaliador(a): <strong style={{ color: '#ffffff' }}>{currentAssessment.evaluatorName}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} color="#fbbf24" />
            <span>
              Data: <strong style={{ color: '#ffffff' }}>{formatDate(currentAssessment.assessmentDate)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bloco Central: Gráfico de Radar em SVG + Diagnóstico Inteligente do Sensei Lado a Lado (Harmônicos) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        {/* Card 1: Polígono de Maturidade Lean */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🕸️</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Polígono de Maturidade Lean
                </h3>
              </div>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(34, 211, 238, 0.12)',
                  color: '#22d3ee',
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                }}
              >
                6 Dimensões TPS
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
              Representação poligonal da maturidade operacional. Vértices expandidos indicam classe mundial.
            </p>
          </div>

          {/* Componente SVG Nativo do Radar */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '0.25rem 0' }}>
            <LeanRadarChart
              data={radarData}
              currentTitle={`Vigente (${currentAssessment.overallScore}%)`}
              previousTitle={
                comparisonData?.previousAssessment
                  ? `Anterior (${comparisonData.previousAssessment.overallScore}%)`
                  : undefined
              }
              size={365}
            />
          </div>

          {/* Barra Inferior com Indicadores Rápidos do Polígono */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              padding: '0.55rem 0.75rem',
              textAlign: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Maturidade Vigente</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                {currentAssessment.overallScore}%
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Avaliação Anterior</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: comparisonData?.previousAssessment ? '#94a3b8' : '#64748b', fontFamily: 'var(--font-mono)' }}>
                {comparisonData?.previousAssessment ? `${comparisonData.previousAssessment.overallScore}%` : 'Linha de Base'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Evolução Líquida (Δ)</span>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: comparisonData?.overallDelta && comparisonData.overallDelta > 0
                    ? '#34d399'
                    : comparisonData?.overallDelta && comparisonData.overallDelta < 0
                    ? '#f87171'
                    : '#fbbf24',
                }}
              >
                {comparisonData?.overallDelta !== undefined
                  ? `${comparisonData.overallDelta > 0 ? '+' : ''}${comparisonData.overallDelta}%`
                  : 'Estável'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Diagnóstico Executivo do Sensei IA (Sem cortes & Totalmente Visível) */}
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#0c121e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.85rem',
            overflow: 'visible',
          }}
        >
          {/* Header Sensei */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid #fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  🥋
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    Diagnóstico Executivo do Sensei IA
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
                    Análise Científica de Causalidade no Gemba
                  </span>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                Nível {currentAssessment.overallLevel} ({currentAssessment.overallLevel === 5 ? 'Classe Mundial' : currentAssessment.overallLevel === 4 ? 'Avançado' : currentAssessment.overallLevel === 3 ? 'Padronizado' : currentAssessment.overallLevel === 2 ? 'Básico' : 'Reativo'})
              </span>
            </div>

            {/* Resumo do Sensei */}
            <p
              style={{
                fontSize: '0.785rem',
                color: '#cbd5e1',
                lineHeight: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '3px solid #22d3ee',
                padding: '0.6rem 0.8rem',
                borderRadius: '0 8px 8px 0',
                margin: 0,
              }}
            >
              {currentAssessment.senseiDiagnosis.summary}
            </p>
          </div>

          {/* Grid 2x2: Pilares Diagnósticos (Textos Legíveis sem Truncamentos) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
              }}
            >
              <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                ⭐ Ponto Forte
              </span>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '0.2rem',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.1rem',
                }}
                title={currentAssessment.senseiDiagnosis.strongestDimension}
              >
                {currentAssessment.senseiDiagnosis.strongestDimension}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '0.15rem' }}>
                Score: {currentAssessment.senseiDiagnosis.strongestScore}%
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
              }}
            >
              <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                ⚠️ Gargalo Crítico
              </span>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '0.2rem',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.1rem',
                }}
                title={currentAssessment.senseiDiagnosis.criticalBottleneck}
              >
                {currentAssessment.senseiDiagnosis.criticalBottleneck}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#f87171', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '0.15rem' }}>
                Score: {currentAssessment.senseiDiagnosis.bottleneckScore}%
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(34, 211, 238, 0.08)',
                border: '1px solid rgba(34, 211, 238, 0.25)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
              }}
            >
              <span style={{ fontSize: '0.65rem', color: '#22d3ee', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                🎯 Foco de Ataque
              </span>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '0.2rem',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.1rem',
                }}
                title={currentAssessment.senseiDiagnosis.suggestedKaizenProject.targetDimension}
              >
                {currentAssessment.senseiDiagnosis.suggestedKaizenProject.targetDimension}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Alavancagem prioritária
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(251, 191, 36, 0.08)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
              }}
            >
              <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                💰 Custo Evitado
              </span>
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 900,
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '0.2rem',
                  lineHeight: 1.3,
                  minHeight: '2.1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {senseiActionDetails?.projectedCostAvoidedMonthly
                  ? `${formatCurrency(senseiActionDetails.projectedCostAvoidedMonthly)}/mês`
                  : 'R$ 0'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Ganhos de eficiência
              </div>
            </div>
          </div>

          {/* Destaque Compacto da Ação do Sensei com Chamada para Ação (Totalmente Desobstruído) */}
          {senseiActionDetails && (
            <div
              style={{
                backgroundColor: 'rgba(251, 191, 36, 0.05)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                overflow: 'visible',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1rem' }}>💡</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Ação Recomendada para Alavancar o Setor:
                  </span>
                </div>
                {senseiActionDetails.estimatedMaturityJump && (
                  <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                    🚀 {senseiActionDetails.estimatedMaturityJump}
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.35 }}>
                {senseiActionDetails.title}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(251, 191, 36, 0.15)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
                  {senseiActionDetails.criticalPoints?.length || 3} gargalos mapeados • {senseiActionDetails.actionableSuggestions?.length || 3} passos práticos
                </span>
                <a
                  href="#plano-alavancagem-sensei"
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    color: '#22d3ee',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  Ver Plano Completo ↓
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bloco de Largura Total: Plano de Alavancagem Recomendado pelo Sensei IA */}
      {senseiActionDetails && (
        <div
          id="plano-alavancagem-sensei"
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#0c121e',
            border: '1.5px solid rgba(251, 191, 36, 0.35)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Header do Plano de Ação */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid rgba(251, 191, 36, 0.2)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  border: '1px solid #fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}
              >
                🥋
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Plano Executivo de Alavancagem do Setor:
                </span>
                <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  {senseiActionDetails.title}
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(34, 211, 238, 0.12)',
                  color: '#22d3ee',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '8px',
                }}
              >
                🎯 Eixo Alvo: {senseiActionDetails.targetDimension}
              </span>
              {senseiActionDetails.estimatedMaturityJump && (
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '8px',
                  }}
                >
                  🚀 {senseiActionDetails.estimatedMaturityJump}
                </span>
              )}
              {senseiActionDetails.projectedCostAvoidedMonthly ? (
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(251, 191, 36, 0.12)',
                    color: '#fbbf24',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  💰 Custo Evitado: {formatCurrency(senseiActionDetails.projectedCostAvoidedMonthly)}/mês
                </span>
              ) : null}
            </div>
          </div>

          {/* Grid de 3 Colunas Arejadas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Coluna 1: Resumo do Desafio & Causas Raízes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: '3px solid #fbbf24',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '0 8px 8px 0',
                }}
              >
                <div style={{ fontSize: '0.675rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  📋 Resumo Executivo do Desafio:
                </div>
                <p style={{ margin: 0, fontSize: '0.785rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                  {senseiActionDetails.executiveSummary || senseiActionDetails.description}
                </p>
              </div>

              {senseiActionDetails.rootCauses && senseiActionDetails.rootCauses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    🔍 Principais Causas Raízes Mapeadas (TPS):
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {senseiActionDetails.rootCauses.map((cause, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '6px',
                          padding: '0.45rem 0.65rem',
                          fontSize: '0.725rem',
                          color: '#cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <span style={{ color: '#fbbf24', fontWeight: 800 }}>↳</span>
                        <span>{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna 2: Mapeamento dos Pontos Críticos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={14} color="#f87171" />
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Pontos Críticos & Gargalos no Gemba:
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(senseiActionDetails.criticalPoints || [
                  'Dispersão operacional de métodos e falta de dispositivos à prova de erro no posto.',
                  'Microparadas e perdas invisíveis que não são captadas no fechamento de turno.',
                  'Retrabalho e movimentações fora do padrão ergonômico ideal.',
                ]).map((point, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.18)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <span style={{ fontWeight: 900, color: '#f87171' }}>•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 3: Sugestões e Passos Práticos Imediatos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} color="#34d399" />
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Sugestões & Passos Práticos Imediatos:
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(senseiActionDetails.actionableSuggestions || [
                  'Executar evento Kaizen de alinhamento com os operadores do turno.',
                  'Instalar dispositivos visuais e checar tempo padrão no posto de trabalho.',
                  'Auditar o cumprimento das ações corretivas na reunião diária de 10 minutos.',
                ]).map((suggestion, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.18)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#d1fae5',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        fontWeight: 800,
                        fontSize: '0.625rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        flexShrink: 0,
                        marginTop: '0.1rem',
                      }}
                    >
                      Passo {idx + 1}
                    </span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rodapé da Ação do Sensei: Impacto & Botão para Criar Kaizen */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              fontSize: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(251, 191, 36, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Impacto Operacional Previsto:</span>
              <strong style={{ color: '#34d399', fontSize: '0.825rem' }}>
                {senseiActionDetails.expectedBenefits}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(`Diretriz do Sensei registrada para o setor ${sector.name}! Esta ação servirá como base para abertura de novo Projeto Kaizen.`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid #fbbf24',
                color: '#fbbf24',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={14} /> Registrar Ação no Plano Anual Kaizen
            </button>
          </div>
        </div>
      )}

      {/* 4. Tabela de Comparativo de Evolução das 6 Dimensões */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Detalhamento da Evolução por Dimensão Lean
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
              Comparação direta entre as avaliações com cálculo de avanço e classificação de maturidade
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Dimensão Lean</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'center' }}>Nível</th>
                {comparisonData?.previousAssessment && (
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'center' }}>
                    Anterior ({formatDate(comparisonData.previousAssessment.assessmentDate)})
                  </th>
                )}
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'center' }}>
                  Vigente ({formatDate(currentAssessment.assessmentDate)})
                </th>
                {comparisonData?.previousAssessment && (
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'center' }}>Evolução (Δ)</th>
                )}
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'center' }}>Tendência</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Kaizens do Eixo (Retorno Real)</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData?.dimensionsMetrics.map((item) => {
                const dimDetail = currentAssessment.dimensionDetails?.find((d) => d.id === item.dimensionId);
                const score = item.currentScore;
                let level = 1;
                if (score >= 81) level = 5;
                else if (score >= 61) level = 4;
                else if (score >= 41) level = 3;
                else if (score >= 21) level = 2;

                const dimData = sectorKaizensByDim[item.dimensionId];
                const val = dimData?.totalCostAvoided || 0;
                const completedCount = dimData?.completedActions.length || 0;
                const totalProjects = dimData?.actions.length || 0;

                const isExpanded = expandedDimensionId === item.dimensionId;
                const criteria = (dimDetail?.criteria && dimDetail.criteria.length > 0)
                  ? dimDetail.criteria
                  : (dataService.getDefaultLeanAssessmentDimensions().find((d) => d.id === item.dimensionId)?.criteria || []);

                return (
                  <React.Fragment key={item.dimensionId}>
                    <tr
                      style={{
                        borderBottom: isExpanded ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor: isExpanded ? 'rgba(34, 211, 238, 0.04)' : 'transparent',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedDimensionId(isExpanded ? null : item.dimensionId)}
                    >
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>{dimData?.config.icon || '📌'}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 800, color: '#ffffff' }}>{item.dimensionName}</span>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  color: isExpanded ? '#22d3ee' : '#94a3b8',
                                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                }}
                              >
                                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                {criteria.length} Critérios
                              </span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              {dimDetail?.description || 'Auditoria de padrões no Gemba'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: '#e2e8f0',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '6px',
                          }}
                        >
                          Nível {level}
                        </span>
                      </td>

                      {comparisonData?.previousAssessment && (
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#c084fc', fontWeight: 700 }}>
                          {item.previousScore !== undefined ? `${item.previousScore}%` : '-'}
                        </td>
                      )}

                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 900, fontSize: '0.95rem' }}>
                        {item.currentScore}%
                      </td>

                      {comparisonData?.previousAssessment && (
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              color: item.delta > 0 ? '#34d399' : item.delta < 0 ? '#f87171' : '#94a3b8',
                              backgroundColor: item.delta > 0 ? 'rgba(16, 185, 129, 0.15)' : item.delta < 0 ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                            }}
                          >
                            {item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`}
                          </span>
                        </td>
                      )}

                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                          {item.trend === 'up' && (
                            <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <TrendingUp size={14} /> Avanço
                            </span>
                          )}
                          {item.trend === 'down' && (
                            <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <TrendingDown size={14} /> Recuo
                            </span>
                          )}
                          {item.trend === 'stable' && (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Minus size={14} /> Mantido
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        {val > 0 ? (
                          <div>
                            <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {formatCurrency(val)}
                            </strong>
                            <div style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
                              {completedCount > 0 ? `${completedCount} concluído(s)` : `${totalProjects} em andamento`}
                            </div>
                          </div>
                        ) : totalProjects > 0 ? (
                          <div>
                            <span style={{ fontSize: '0.725rem', color: '#fbbf24', fontWeight: 700 }}>
                              {totalProjects} Kaizen(s)
                            </span>
                            <div style={{ fontSize: '0.675rem', color: '#64748b' }}>
                              Em andamento
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Sem Kaizen ativo</span>
                        )}
                      </td>
                    </tr>

                    {/* Linha Expansível com os Critérios Mestres e Checkpoints do Gemba */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.75)', borderBottom: '1.5px solid rgba(34, 211, 238, 0.3)' }}>
                        <td colSpan={comparisonData?.previousAssessment ? 7 : 5} style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>{dimData?.config.icon}</span>
                                <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>
                                  Critérios Mestres & Checkpoints Auditados — {item.dimensionName}
                                </strong>
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 700 }}>
                                ⚖️ {criteria.length} Critérios Mestres de Alta Relevância (Princípio de Pareto TPS)
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                              {criteria.map((crit, cIdx) => (
                                <div
                                  key={crit.id || cIdx}
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.45rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <div>
                                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                        Item {cIdx + 1} • Peso {crit.weight}
                                      </span>
                                      <strong style={{ display: 'block', fontSize: '0.8rem', color: '#ffffff', marginTop: '0.2rem' }}>
                                        {crit.title}
                                      </strong>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: crit.score >= 4 ? '#34d399' : crit.score >= 3 ? '#fbbf24' : '#f87171', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                      Nota {crit.score}/5
                                    </span>
                                  </div>

                                  <div style={{ fontSize: '0.725rem', color: '#fef08a', backgroundColor: 'rgba(251, 191, 36, 0.06)', padding: '0.4rem 0.55rem', borderRadius: '6px', lineHeight: 1.35 }}>
                                    <strong>Gemba: </strong>{crit.gembaVerificationGuide}
                                  </div>

                                  {crit.checkpoints && crit.checkpoints.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem' }}>
                                      {crit.checkpoints.map((chk, chkI) => (
                                        <div key={chkI} style={{ fontSize: '0.685rem', color: '#94a3b8', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', lineHeight: 1.3 }}>
                                          <span style={{ color: '#22d3ee' }}>✓</span>
                                          <span>{chk}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4.1. Demonstrativo da Formação do Valor de Custo Evitado do Setor */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#090d16',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
              }}
            >
              💰
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                Memória da Formação do Custo Evitado — {sector.name}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                A conta matemática aberta com base nos projetos Kaizen e horas de chão de fábrica
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1.5px solid #10b981',
              borderRadius: '8px',
              padding: '0.45rem 0.95rem',
              textAlign: 'right',
            }}
          >
            <span style={{ fontSize: '0.675rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
              Retorno Real Auditado
            </span>
            <strong style={{ fontSize: '1.35rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(sectorSavings.totalActual)}
            </strong>
          </div>
        </div>

        {/* Decomposição dos 6 Eixos do Assessment com os Kaizens Vinculados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Decomposição do Custo Evitado pelos 6 Eixos do Lean Assessment:
            </span>
            <span style={{ fontSize: '0.7rem', color: '#22d3ee' }}>
              🎯 Cada real retido é vinculado ao seu respectivo eixo de maturidade
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.65rem' }}>
            {(Object.entries(sectorKaizensByDim) as [LeanAssessmentDimensionId, typeof sectorKaizensByDim[LeanAssessmentDimensionId]][]).map(([dimKey, dimData]) => (
              <div
                key={dimKey}
                style={{
                  backgroundColor: dimData.totalCostAvoided > 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: dimData.totalCostAvoided > 0 ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{dimData.config.icon}</span>
                    <strong style={{ fontSize: '0.775rem', color: '#ffffff' }}>
                      {dimData.config.shortName}
                    </strong>
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: dimData.totalCostAvoided > 0 ? '#34d399' : '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(dimData.totalCostAvoided)}
                  </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.675rem', color: '#94a3b8' }}>
                  <span>{dimData.completedActions.length} Kaizen(s) concluído(s)</span>
                  <span>{dimData.totalHoursSaved}h salvas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco com a Expressão da Conta Aberta do Setor */}
        <div
          style={{
            backgroundColor: '#020617',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase' }}>
            ⚡ Expressão Aritmética de Formação do Custo Evitado (Chão de Fábrica):
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              color: '#93c5fd',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              borderLeft: '3px solid #10b981',
            }}
          >
            [ ( {sectorSavings.totalHours}h salvas × R$ 180,00/h ) + ( Matéria-Prima: {formatCurrency(sectorSavings.rawMaterialSavings || sectorSavings.totalActual * 0.45)} ) + ( Ganhos de OEE/Setup: {formatCurrency(Math.max(0, sectorSavings.totalActual - (sectorSavings.totalHours * 180) - (sectorSavings.rawMaterialSavings || sectorSavings.totalActual * 0.45)))} ) ]
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: '#34d399',
              fontWeight: 800,
              padding: '0.35rem 0.5rem',
            }}
          >
            = {formatCurrency(sectorSavings.totalHours * 180)} + {formatCurrency(sectorSavings.rawMaterialSavings || sectorSavings.totalActual * 0.45)} + {formatCurrency(Math.max(0, sectorSavings.totalActual - (sectorSavings.totalHours * 180) - (sectorSavings.rawMaterialSavings || sectorSavings.totalActual * 0.45)))} = <span style={{ textDecoration: 'underline' }}>{formatCurrency(sectorSavings.totalActual)}</span>
          </div>
        </div>

        {/* Lista de Ações do Setor com o Eixo e a Conta de Cada Uma */}
        {sectorSavings.completed.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Projetos Kaizen Homologados e Seus Respectivos Eixos no Assessment:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {sectorSavings.completed.map((action) => {
                const val = action.actualCostAvoided || action.estimatedCostAvoided || 0;
                const dimId = action.assessmentDimensionId || dataService.getDefaultAssessmentDimensionForWaste(action.wasteCategory);
                const dimConfig = ASSESSMENT_DIMENSIONS_CONFIG[dimId];

                return (
                  <div
                    key={action.id}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      fontSize: '0.775rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <CheckCircle2 size={14} color="#34d399" />
                      <strong style={{ color: '#ffffff' }}>{action.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        ({action.protocol})
                      </span>
                      {dimConfig && (
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(6, 182, 212, 0.12)',
                            color: '#22d3ee',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <span>{dimConfig.icon}</span>
                          <span>{dimConfig.shortName}</span>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.725rem' }}>
                        Conta: {action.hoursSaved || 0}h × R$ 180/h + insumos
                      </span>
                      <strong style={{ color: '#34d399', fontSize: '0.85rem' }}>
                        {formatCurrency(val)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Defesa Científica da Metodologia do Assessment & Memorial de Cálculo */}
      <LeanAssessmentMethodologyDefense defaultExpanded={true} />

      {/* Modal de Novo Assessment */}
      <SectorAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sector={sector}
        onSaved={() => {
          if (onNewAssessmentCreated) onNewAssessmentCreated();
        }}
      />
    </div>
  );
};
