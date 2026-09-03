'use client';

import React, { useState, useMemo } from 'react';
import { Sector, SectorLeanAssessment, LeanAssessmentDimensionId } from '@/lib/types';
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
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

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

          {/* Recomendação de Projeto Kaizen para Desbloquear o Gargalo */}
          {currentAssessment.senseiDiagnosis.suggestedKaizenProject && (
            <div
              style={{
                backgroundColor: 'rgba(251, 191, 36, 0.08)',
                border: '1.5px solid rgba(251, 191, 36, 0.35)',
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Lightbulb size={16} color="#fbbf24" />
                <span style={{ fontSize: '0.725rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase' }}>
                  Ação Recomendada pelo Sensei para Alavancar o Setor:
                </span>
              </div>

              <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                {currentAssessment.senseiDiagnosis.suggestedKaizenProject.title}
              </h5>

              <p style={{ margin: 0, fontSize: '0.775rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {currentAssessment.senseiDiagnosis.suggestedKaizenProject.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', marginTop: '0.25rem', paddingTop: '0.45rem', borderTop: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <span style={{ color: '#94a3b8' }}>Ganhos Estimados:</span>
                <strong style={{ color: '#34d399' }}>
                  {currentAssessment.senseiDiagnosis.suggestedKaizenProject.expectedBenefits}
                </strong>
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

                return (
                  <tr
                    key={item.dimensionId}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ fontWeight: 800, color: '#ffffff' }}>{item.dimensionName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {dimDetail?.description || 'Auditoria de padrões no Gemba'}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
