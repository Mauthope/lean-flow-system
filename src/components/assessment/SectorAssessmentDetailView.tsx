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

      {/* 3. Bloco Central: Gráfico de Radar em SVG + Diagnóstico Inteligente do Sensei */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        {/* Card do Gráfico de Radar */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Polígono de Maturidade Lean
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                6 Dimensões do Gemba
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
              Passe o cursor sobre os vértices para visualizar as pontuações e deltas de evolução
            </p>
          </div>

          {/* Componente SVG Nativo do Radar */}
          <LeanRadarChart
            data={radarData}
            currentTitle={`Vigente (${currentAssessment.overallScore}%)`}
            previousTitle={
              comparisonData?.previousAssessment
                ? `Anterior (${comparisonData.previousAssessment.overallScore}%)`
                : undefined
            }
            size={460}
          />
        </div>

        {/* Card de Diagnóstico do Sensei IA & Projeto Kaizen Recomendado */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#0c121e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div>
            {/* Header Sensei */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
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
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  Diagnóstico Executivo do Sensei IA
                </h4>
                <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
                  Análise Científica de Causalidade no Gemba
                </span>
              </div>
            </div>

            {/* Resumo do Sensei */}
            <p
              style={{
                fontSize: '0.8125rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '3px solid #22d3ee',
                padding: '0.75rem 1rem',
                borderRadius: '0 8px 8px 0',
                margin: 0,
              }}
            >
              {currentAssessment.senseiDiagnosis.summary}
            </p>

            {/* Destaque: Ponto Forte vs Gargalo Crítico */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                }}
              >
                <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>
                  ⭐ Ponto Forte de Destaque
                </span>
                <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  {currentAssessment.senseiDiagnosis.strongestDimension}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '0.2rem' }}>
                  Score: {currentAssessment.senseiDiagnosis.strongestScore}%
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                }}
              >
                <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase' }}>
                  ⚠️ Gargalo Crítico Prioritário
                </span>
                <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  {currentAssessment.senseiDiagnosis.criticalBottleneck}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#f87171', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '0.2rem' }}>
                  Score: {currentAssessment.senseiDiagnosis.bottleneckScore}%
                </div>
              </div>
            </div>
          </div>

          {/* Recomendação Estratégica do Sensei para Alavancagem do Setor */}
          {senseiActionDetails && (
            <div
              style={{
                backgroundColor: 'rgba(251, 191, 36, 0.06)',
                border: '1.5px solid rgba(251, 191, 36, 0.35)',
                borderRadius: '12px',
                padding: '1.15rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              {/* Top Header: Badge + Eixo Alvo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(251, 191, 36, 0.18)',
                      border: '1px solid #fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.05rem',
                    }}
                  >
                    💡
                  </div>
                  <div>
                    <span style={{ fontSize: '0.675rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ação Recomendada pelo Sensei para Alavancar o Setor:
                    </span>
                    <h5 style={{ margin: '0.15rem 0 0 0', fontSize: '1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                      {senseiActionDetails.title}
                    </h5>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(34, 211, 238, 0.12)',
                      color: '#22d3ee',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '10px',
                    }}
                  >
                    🎯 Eixo: {senseiActionDetails.targetDimension}
                  </span>
                  {senseiActionDetails.estimatedMaturityJump && (
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '10px',
                      }}
                    >
                      🚀 {senseiActionDetails.estimatedMaturityJump}
                    </span>
                  )}
                </div>
              </div>

              {/* 1. Resumo Executivo do Desafio */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: '3px solid #fbbf24',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0 8px 8px 0',
                }}
              >
                <div style={{ fontSize: '0.675rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  📋 Resumo Executivo do Desafio:
                </div>
                <p style={{ margin: 0, fontSize: '0.785rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                  {senseiActionDetails.executiveSummary || senseiActionDetails.description}
                </p>
              </div>

              {/* 2. Mapeamento dos Pontos Críticos no Gemba */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} color="#f87171" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Mapeamento dos Pontos Críticos & Gargalos Identificados:
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {(senseiActionDetails.criticalPoints || [
                    'Dispersão operacional de métodos e falta de dispositivos à prova de erro no posto.',
                    'Microparadas e perdas invisíveis que não são captadas no fechamento de turno.',
                    'Retrabalho e movimentações fora do padrão ergonômico ideal.',
                  ]).map((point, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '6px',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.75rem',
                        color: '#fca5a5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.45rem',
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: '#f87171', fontSize: '0.8rem' }}>•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Principais Causas Raízes Diagnosticadas */}
              {senseiActionDetails.rootCauses && senseiActionDetails.rootCauses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    🔍 Principais Causas Raízes Mapeadas:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.4rem' }}>
                    {senseiActionDetails.rootCauses.map((cause, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '6px',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.725rem',
                          color: '#cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span style={{ color: '#fbbf24' }}>↳</span>
                        <span>{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Sugestões e Ações Práticas Imediatas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} color="#34d399" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Sugestões e Passos Práticos para o Agente e Liderança:
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
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
                        borderRadius: '6px',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.75rem',
                        color: '#d1fae5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        lineHeight: 1.4,
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

              {/* 5. Ganhos Estimados & Custo Evitado Projetado */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.65rem',
                  fontSize: '0.725rem',
                  marginTop: '0.15rem',
                  paddingTop: '0.55rem',
                  borderTop: '1px solid rgba(251, 191, 36, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Impacto Operacional:</span>
                  <strong style={{ color: '#34d399' }}>
                    {senseiActionDetails.expectedBenefits}
                  </strong>
                </div>

                {senseiActionDetails.projectedCostAvoidedMonthly ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: '#94a3b8' }}>Custo Evitado Projetado:</span>
                    <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {formatCurrency(senseiActionDetails.projectedCostAvoidedMonthly)} / mês
                    </strong>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

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
