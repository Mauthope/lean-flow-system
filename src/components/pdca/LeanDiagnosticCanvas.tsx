'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  BarChart3,
  Workflow,
  HelpCircle,
  CheckCircle2,
  Target,
  TrendingDown,
  ArrowRight,
  Zap,
  ChevronDown,
  ChevronUp,
  Trash2,
  Upload,
  Ruler,
  Settings,
  Box,
  HardHat,
  Thermometer,
  Layers,
  ArrowDownRight,
  Maximize2,
  LayoutGrid,
  ListFilter,
  Check,
  Copy,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface LeanDiagnosticCanvasProps {
  // Problem & Goals
  problemStatement: string;
  onProblemStatementChange: (val: string) => void;
  baselineValue: number | '';
  targetGoalValue: number | '';
  targetMetricName: string;
  targetMetricUnit: string;
  currentProblemCostMonthly?: number | '';

  // 5 Whys
  fiveWhys: string[];
  onFiveWhysChange: (val: string[]) => void;

  // Pareto 80/20
  paretoImageUrl?: string;
  paretoImageName?: string;
  paretoVitalCauses: string;
  onParetoVitalCausesChange: (val: string) => void;
  paretoCumulativePercent: number | '';
  onParetoCumulativePercentChange: (val: number | '') => void;
  onParetoImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveParetoImage: () => void;

  // Ishikawa 6M
  ishikawa: {
    method: string;
    machine: string;
    material: string;
    manpower: string;
    measurement: string;
    environment: string;
    primaryRootCause: string;
  };
  onIshikawaChange: (field: string, val: string) => void;

  // Interactions & Actions
  onTransferIshikawaToFiveWhys?: () => void;
  onGenerateActionFromRootCause?: (cause: string) => void;
  onSwitchToFormMode?: () => void;
  isViewer?: boolean;
  isDark?: boolean;
}

export const LeanDiagnosticCanvas: React.FC<LeanDiagnosticCanvasProps> = ({
  problemStatement,
  onProblemStatementChange,
  baselineValue,
  targetGoalValue,
  targetMetricName,
  targetMetricUnit,
  currentProblemCostMonthly,
  fiveWhys,
  onFiveWhysChange,
  paretoImageUrl,
  paretoImageName,
  paretoVitalCauses,
  onParetoVitalCausesChange,
  paretoCumulativePercent,
  onParetoCumulativePercentChange,
  onParetoImageUpload,
  onRemoveParetoImage,
  ishikawa,
  onIshikawaChange,
  onTransferIshikawaToFiveWhys,
  onGenerateActionFromRootCause,
  onSwitchToFormMode,
  isViewer = false,
  isDark = true,
}) => {
  const [activeStep, setActiveStep] = useState<'all' | 'problem' | 'ishikawa' | 'fiveWhys'>('all');
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Status de progresso do diagnóstico
  const fiveWhysCount = useMemo(() => fiveWhys.filter((w) => w && w.trim().length > 0).length, [fiveWhys]);
  const ishikawaCount = useMemo(() => {
    return [
      ishikawa.method,
      ishikawa.machine,
      ishikawa.material,
      ishikawa.manpower,
      ishikawa.measurement,
      ishikawa.environment,
    ].filter((v) => v && v.trim().length > 0).length;
  }, [ishikawa]);
  const hasPareto = Boolean(paretoImageUrl || (paretoVitalCauses && paretoVitalCauses.trim().length > 0));

  // Causa Raiz Conclusiva (Prefere o 5º Porquê se preenchido, senão a Causa Raiz do Ishikawa)
  const finalRootCause = useMemo(() => {
    if (fiveWhys[4] && fiveWhys[4].trim()) return fiveWhys[4].trim();
    if (ishikawa.primaryRootCause && ishikawa.primaryRootCause.trim()) return ishikawa.primaryRootCause.trim();
    return '';
  }, [fiveWhys, ishikawa.primaryRootCause]);

  const handleCopyRootCause = () => {
    if (!finalRootCause) return;
    navigator.clipboard.writeText(finalRootCause);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  const handleWhyChange = (index: number, val: string) => {
    const updated = [...fiveWhys];
    updated[index] = val;
    onFiveWhysChange(updated);
  };

  return (
    <section
      aria-label="Matriz Canvas de Diagnóstico e Causa Raiz"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        backgroundColor: isDark ? 'rgba(8, 14, 28, 0.95)' : '#ffffff',
        border: isDark ? '1.5px solid rgba(6, 182, 212, 0.35)' : '1.5px solid #0284c7',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: isDark
          ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.12)'
          : '0 10px 30px rgba(2, 132, 199, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Luz Zenital Superior Neon */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #06b6d4, #10b981, #8b5cf6, transparent)',
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.8)',
          pointerEvents: 'none',
        }}
      />

      {/* HEADER DO CANVAS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          paddingBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              padding: '1.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(6, 182, 212, 0.35)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '11px',
                backgroundColor: isDark ? '#060a13' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Workflow size={20} color="#22d3ee" />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: isDark ? '#ffffff' : '#0f172a',
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                }}
              >
                Lean Diagnostic Canvas
              </h3>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  color: '#22d3ee',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                }}
              >
                MODO PANORÂMICO INTEGRADO
              </span>
            </div>
            <p style={{ fontSize: '0.78125rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.2rem 0 0' }}>
              Esteira de Causa e Efeito: Problema & Pareto 80/20 &rarr; Espinha 6M &rarr; Funil dos 5 Porquês &rarr; Causa Raiz
            </p>
          </div>
        </div>

        {/* Controles de Visão & Ação Rápida */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Status Chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: isDark ? '#060a13' : '#f1f5f9',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
              fontSize: '0.725rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: hasPareto ? '#c084fc' : '#64748b', fontWeight: 700 }}>
              Pareto: {hasPareto ? 'OK' : '—'}
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: ishikawaCount > 0 ? '#34d399' : '#64748b', fontWeight: 700 }}>
              6M: {ishikawaCount}/6
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: fiveWhysCount > 0 ? '#22d3ee' : '#64748b', fontWeight: 700 }}>
              5 Whys: {fiveWhysCount}/5
            </span>
          </div>

          {/* Botão de Alternância p/ Modo Formulário */}
          {onSwitchToFormMode && (
            <button
              type="button"
              onClick={onSwitchToFormMode}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Alternar para o modo de formulário em cards verticais"
            >
              <ListFilter size={14} /> Modo Formulário
            </button>
          )}

          {/* Botão de Ação: Gerar Contramedida 5W2H */}
          {onGenerateActionFromRootCause && finalRootCause && !isViewer && (
            <button
              type="button"
              onClick={() => onGenerateActionFromRootCause(finalRootCause)}
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
              }}
              title="Transformar a causa raiz diretamente em atividade na aba 2. DO (Plano 5W2H)"
            >
              <Zap size={14} /> Gerar Ação 5W2H
            </button>
          )}
        </div>
      </div>

      {/* ESTEIRA VISUAL EM 3 COLUNAS CONECTADAS */}
      <div
        className="lean-canvas-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          alignItems: 'stretch',
        }}
      >
        {/* ========================================================================= */}
        {/* COLUNA 1: SINTOMA & ESTATÍSTICA (EFEITO + PARETO 80/20)                    */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(11, 19, 41, 0.7)' : '#f8fafc',
            border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #cbd5e1',
            borderRadius: '16px',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Sub-Header Coluna 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={15} color="#c084fc" />
              </div>
              <strong style={{ fontSize: '0.9rem', color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
                1. Efeito & Pareto 80/20
              </strong>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#c084fc',
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                padding: '0.1rem 0.45rem',
                borderRadius: '6px',
              }}
            >
              PRIORIZAÇÃO
            </span>
          </div>

          {/* Bloco 1.1: Declaração Formal do Problema */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                color: isDark ? '#cbd5e1' : '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              Declaração do Efeito (Problema):
            </label>
            <textarea
              className="form-control"
              rows={3}
              disabled={isViewer}
              value={problemStatement}
              onChange={(e) => onProblemStatementChange(e.target.value)}
              placeholder="Descreva o que está ocorrendo no chão de fábrica e o impacto..."
              style={{
                fontSize: '0.8125rem',
                backgroundColor: isDark ? '#060a13' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            />
          </div>

          {/* Bloco 1.2: Indicadores Baseline vs Meta */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              backgroundColor: isDark ? '#060a13' : '#ffffff',
              padding: '0.65rem',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            }}
          >
            <div>
              <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingDown size={11} /> Antes (Baseline):
              </span>
              <strong style={{ fontSize: '0.875rem', color: '#f87171' }}>
                {baselineValue !== '' ? `${baselineValue} ${targetMetricUnit || ''}` : 'Não def.'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Target size={11} /> Meta Planejada:
              </span>
              <strong style={{ fontSize: '0.875rem', color: '#34d399' }}>
                {targetGoalValue !== '' ? `${targetGoalValue} ${targetMetricUnit || ''}` : 'Não def.'}
              </strong>
            </div>
          </div>

          {/* Bloco 1.3: Pareto 80/20 - Causas Vitais */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : '#f5f3ff',
              padding: '0.75rem',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid #ddd6fe',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#c084fc' }}>
                Causas Vitais (80/20):
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#c084fc',
                  backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '4px',
                }}
              >
                {paretoCumulativePercent || 80}% das perdas
              </span>
            </div>

            {paretoImageUrl ? (
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <img
                  src={paretoImageUrl}
                  alt="Gráfico de Pareto"
                  style={{ width: '100%', maxHeight: '110px', objectFit: 'contain', backgroundColor: '#060a13' }}
                />
                {!isViewer && (
                  <button
                    type="button"
                    onClick={onRemoveParetoImage}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: 'rgba(239, 68, 68, 0.85)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '4px',
                      padding: '2px 5px',
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                    }}
                    title="Remover gráfico"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Anexe o gráfico de Pareto gerado no Excel ou Minitab:
                </span>
                {!isViewer && (
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.675rem',
                      padding: '0.25rem 0.5rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Upload size={12} /> Imagem
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onParetoImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            )}

            <textarea
              className="form-control"
              rows={2}
              disabled={isViewer}
              value={paretoVitalCauses}
              onChange={(e) => onParetoVitalCausesChange(e.target.value)}
              placeholder="Descreva quais são os 20% das causas vitais que geram a perda..."
              style={{
                fontSize: '0.78125rem',
                backgroundColor: isDark ? '#060a13' : '#ffffff',
                borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : '#cbd5e1',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUNA 2: ESTRATIFICAÇÃO LATERAL (ESPINHA DE ISHIKAWA 6M)                  */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(11, 19, 41, 0.7)' : '#f8fafc',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #cbd5e1',
            borderRadius: '16px',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {/* Sub-Header Coluna 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Workflow size={15} color="#34d399" />
              </div>
              <strong style={{ fontSize: '0.9rem', color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
                2. Espinha de Peixe (Ishikawa 6M)
              </strong>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                padding: '0.1rem 0.45rem',
                borderRadius: '6px',
              }}
            >
              ESTRATIFICAÇÃO
            </span>
          </div>

          <p style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
            Mapeie as hipóteses causais nas 6 dimensões industriais:
          </p>

          {/* 6M Compact Matrix (2 colunas x 3 linhas) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            {/* Método */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Ruler size={12} /> Método (SOP):
              </span>
              <input
                type="text"
                className="form-control form-control-sm"
                disabled={isViewer}
                value={ishikawa.method}
                onChange={(e) => onIshikawaChange('method', e.target.value)}
                placeholder="Falha no padrão..."
                style={{ fontSize: '0.75rem', backgroundColor: isDark ? '#060a13' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>

            {/* Máquina */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Settings size={12} /> Máquina (Ajuste):
              </span>
              <input
                type="text"
                className="form-control form-control-sm"
                disabled={isViewer}
                value={ishikawa.machine}
                onChange={(e) => onIshikawaChange('machine', e.target.value)}
                placeholder="Desgaste/folga..."
                style={{ fontSize: '0.75rem', backgroundColor: isDark ? '#060a13' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>

            {/* Material */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#f472b6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Box size={12} /> Material (Lote):
              </span>
              <input
                type="text"
                className="form-control form-control-sm"
                disabled={isViewer}
                value={ishikawa.material}
                onChange={(e) => onIshikawaChange('material', e.target.value)}
                placeholder="Variação resina..."
                style={{ fontSize: '0.75rem', backgroundColor: isDark ? '#060a13' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>

            {/* Mão de Obra */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <HardHat size={12} /> Mão de Obra:
              </span>
              <input
                type="text"
                className="form-control form-control-sm"
                disabled={isViewer}
                value={ishikawa.manpower}
                onChange={(e) => onIshikawaChange('manpower', e.target.value)}
                placeholder="Treinamento SMED..."
                style={{ fontSize: '0.75rem', backgroundColor: isDark ? '#060a13' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>

            {/* Medição */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Ruler size={12} /> Medição:
              </span>
              <input
                type="text"
                className="form-control form-control-sm"
                disabled={isViewer}
                value={ishikawa.measurement}
                onChange={(e) => onIshikawaChange('measurement', e.target.value)}
                placeholder="Sem cronometragem..."
                style={{ fontSize: '0.75rem', backgroundColor: isDark ? '#060a13' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>

            {/* Meio Ambiente */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Thermometer size={12} /> Meio Ambiente:
              </span>
              <input
                type="text"
                className="form-control form-control-sm"
                disabled={isViewer}
                value={ishikawa.environment}
                onChange={(e) => onIshikawaChange('environment', e.target.value)}
                placeholder="5S / Layout..."
                style={{ fontSize: '0.75rem', backgroundColor: isDark ? '#060a13' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>
          </div>

          {/* Causa Primária Selecionada no Ishikawa */}
          <div
            style={{
              marginTop: 'auto',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#ecfdf5',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: '0.65rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Target size={12} /> Causa mais crítica do 6M:
              </span>
              {onTransferIshikawaToFiveWhys && ishikawa.primaryRootCause && !isViewer && (
                <button
                  type="button"
                  onClick={onTransferIshikawaToFiveWhys}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#22d3ee',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: 0,
                  }}
                  title="Copiar esta causa como o 1º Porquê da coluna seguinte"
                >
                  Enviar ao 1º Porquê &rarr;
                </button>
              )}
            </div>
            <input
              type="text"
              className="form-control form-control-sm"
              disabled={isViewer}
              value={ishikawa.primaryRootCause}
              onChange={(e) => onIshikawaChange('primaryRootCause', e.target.value)}
              placeholder="Ex: Falta de dispositivo poka-yoke no setup..."
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: isDark ? '#060a13' : '#ffffff',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : '#6ee7b7',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUNA 3: AFUNILAMENTO CAUSAL (FUNIL DOS 5 PORQUÊS & CAUSA RAIZ)          */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(11, 19, 41, 0.7)' : '#f8fafc',
            border: isDark ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid #cbd5e1',
            borderRadius: '16px',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Sub-Header Coluna 3 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HelpCircle size={15} color="#22d3ee" />
              </div>
              <strong style={{ fontSize: '0.9rem', color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
                3. Funil dos 5 Porquês
              </strong>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#22d3ee',
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                padding: '0.1rem 0.45rem',
                borderRadius: '6px',
              }}
            >
              AFUNILAMENTO
            </span>
          </div>

          <p style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
            Questione sequencialmente até isolar a causa sistêmica:
          </p>

          {/* 5 Whys Funnel Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {fiveWhys.map((why, index) => {
              const isRoot = index === 4;
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isRoot
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(6, 182, 212, 0.15)',
                      color: isRoot ? '#f87171' : '#22d3ee',
                      border: `1px solid ${isRoot ? 'rgba(239, 68, 68, 0.45)' : 'rgba(6, 182, 212, 0.35)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.675rem',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    disabled={isViewer}
                    placeholder={isRoot ? '5. Causa Raiz definitiva...' : `Por quê ${index + 1}...`}
                    value={why}
                    onChange={(e) => handleWhyChange(index, e.target.value)}
                    style={{
                      fontSize: '0.78125rem',
                      fontWeight: isRoot ? 800 : 400,
                      backgroundColor: isRoot
                        ? isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'
                        : isDark ? '#060a13' : '#ffffff',
                      borderColor: isRoot
                        ? 'rgba(239, 68, 68, 0.45)'
                        : isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
                      color: isRoot ? (isDark ? '#fca5a5' : '#b91c1c') : (isDark ? '#ffffff' : '#0f172a'),
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Destaque da Causa Raiz Conclusiva */}
          <div
            style={{
              marginTop: 'auto',
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2',
              border: isDark ? '1.5px solid rgba(239, 68, 68, 0.35)' : '1.5px solid #fca5a5',
              borderRadius: '10px',
              padding: '0.65rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 900, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Target size={12} color="#f87171" /> CAUSA RAIZ FINAL DO PROJETO:
              </span>
              {finalRootCause && (
                <button
                  type="button"
                  onClick={handleCopyRootCause}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: 0,
                  }}
                  title="Copiar texto da causa raiz"
                >
                  {copiedFeedback ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                  {copiedFeedback ? 'Copiado!' : 'Copiar'}
                </button>
              )}
            </div>
            <strong
              style={{
                fontSize: '0.8125rem',
                color: isDark ? '#ffffff' : '#0f172a',
                lineHeight: 1.3,
                fontFamily: 'var(--font-heading)',
              }}
            >
              {finalRootCause || 'Complete a investigação para isolar a causa raiz definitiva.'}
            </strong>
          </div>
        </div>
      </div>

      {/* RODAPÉ DO CANVAS: RESUMO & TRANSIÇÃO PARA EXECUÇÃO 5W2H */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: isDark ? '#060a13' : '#f8fafc',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="#22d3ee" />
          <span style={{ fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#334155' }}>
            <strong>Conexão PDCA:</strong> A Causa Raiz diagnosticada aqui é a base direta para o plano de ação 5W2H na etapa seguinte.
          </span>
        </div>

        {onGenerateActionFromRootCause && finalRootCause && !isViewer && (
          <button
            type="button"
            onClick={() => onGenerateActionFromRootCause(finalRootCause)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: 0,
            }}
          >
            Avançar para o Plano 5W2H (Aba DO) &rarr;
          </button>
        )}
      </div>
    </section>
  );
};

export default LeanDiagnosticCanvas;
