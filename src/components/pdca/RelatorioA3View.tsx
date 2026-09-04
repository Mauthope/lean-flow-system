'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeanAction } from '@/lib/types';
import { formatCurrency, formatDate, formatDateTime, WASTE_CATEGORIES, getFollowUpMonthsFilledCount, isThreeMonthsFollowUpCompleted } from '@/lib/utils';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  User,
  Clock,
  TrendingUp,
  FileCheck,
  Award,
  Layers,
  HelpCircle,
  BarChart3,
  DollarSign,
  Shield,
  Percent,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RelatorioA3ViewProps {
  action: LeanAction;
  onBack?: () => void;
}

export const RelatorioA3View: React.FC<RelatorioA3ViewProps> = ({ action, onBack }) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const waste = WASTE_CATEGORIES[action.wasteCategory] || WASTE_CATEGORIES.defeitos;
  const isAgent = currentUser?.role === 'agent';
  const defaultBackUrl = isAgent ? `/agente/projetos/${action.id}` : `/admin/projetos/${action.id}`;

  const totalCosts = action.projectCosts?.totalCost || 0;
  const grossSavings = action.actualCostAvoided || action.estimatedCostAvoided || 0;
  const netSavings = action.netSavings !== undefined ? action.netSavings : grossSavings - totalCosts;
  const roi = action.roiPercentage !== undefined ? action.roiPercentage : (totalCosts > 0 ? Math.round((netSavings / totalCosts) * 100) : 0);
  const payback = action.paybackMonths !== undefined ? action.paybackMonths : 0;

  return (
    <div
      className="a3-print-container"
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        padding: '1rem',
        boxSizing: 'border-box',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Non-printable Action Toolbar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          backgroundColor: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onBack || (() => router.push(defaultBackUrl))}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={15} /> Voltar ao Projeto
          </button>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Visualização de Impressão • <strong>Relatório A3 PDCA (Paisagem)</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#059669', borderColor: '#059669' }}
          >
            <Printer size={15} /> Imprimir A3 / Salvar PDF
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* A3 SHEET (PAGE CONTAINER - 2x2 LANDSCAPE GRID) */}
      {/* ========================================================================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #cbd5e1',
          padding: '1.25rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* A3 HEADER BANNER */}
        <div
          style={{
            borderBottom: '2px solid #0f172a',
            paddingBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            gap: '1rem',
          }}
        >
          {/* Company & Title */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  letterSpacing: '0.05em',
                }}
              >
                RELATÓRIO A3 LEAN • CICLO PDCA
              </span>
              <span
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              >
                {action.protocol}
              </span>
              <span
                style={{
                  backgroundColor: action.masterApproved ? '#ecfdf5' : '#faf5ff',
                  color: action.masterApproved ? '#047857' : '#7c3aed',
                  border: `1px solid ${action.masterApproved ? '#a7f3d0' : '#ddd6fe'}`,
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                {action.masterApproved ? '✓ HOMOLOGADO MASTER' : '🟡 AGUARDANDO HOMOLOGAÇÃO'}
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {action.title}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '0.35rem',
                fontSize: '0.75rem',
                color: '#475569',
              }}
            >
              <span>🏢 Entidade: <strong>Rafitec</strong></span>
              <span>📍 Setor: <strong>{action.originSectorName || 'Fábrica'}</strong></span>
              <span>👤 Responsável: <strong>{action.assignedAgentName || 'Agente Lean'}</strong></span>
              <span>📅 Data: <strong>{formatDate(action.createdAt)}</strong></span>
              <span>⏱️ Prazo: <strong>{formatDate(action.dueDate)}</strong></span>
            </div>
          </div>

          {/* Quick Financial Summary in Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f8fafc',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: 'right', paddingRight: '0.6rem', borderRight: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>
                Lucro Líquido Real
              </span>
              <strong style={{ fontSize: '1rem', color: '#059669', fontWeight: 900 }}>
                {formatCurrency(netSavings)}
              </strong>
            </div>

            <div style={{ textAlign: 'center', paddingRight: '0.6rem', borderRight: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>
                ROI
              </span>
              <strong style={{ fontSize: '1rem', color: '#2563eb', fontWeight: 900 }}>
                {roi}%
              </strong>
            </div>

            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>
                Payback
              </span>
              <strong style={{ fontSize: '1rem', color: '#b45309', fontWeight: 900 }}>
                {payback} meses
              </strong>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THE 4 PDCA QUADRANTS (2x2 GRID) */}
        {/* ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: '0.85rem',
            width: '100%',
          }}
        >
          {/* ======================================================================= */}
          {/* QUADRANT 1: P - PLAN (Superior Esquerdo) */}
          {/* ======================================================================= */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #93c5fd',
              borderRadius: '10px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            {/* Quadrant Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1.5px solid #bfdbfe',
                paddingBottom: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 900, fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  1. PLAN
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                  Planejamento, Diagnóstico & Pareto 80/20
                </strong>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2563eb' }}>
                Desperdício: {waste.label}
              </span>
            </div>

            {/* Problema & Metas */}
            <div style={{ backgroundColor: '#ffffff', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#475569', display: 'block', textTransform: 'uppercase' }}>
                Definição do Problema:
              </span>
              <p style={{ fontSize: '0.75rem', color: '#0f172a', margin: '0.15rem 0 0.4rem', lineHeight: 1.3 }}>
                {action.problemStatement || action.description}
              </p>

              {/* Indicadores Baseline vs Meta vs Realizado */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', backgroundColor: '#f1f5f9', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                <div>
                  <span style={{ fontSize: '0.625rem', color: '#dc2626', fontWeight: 700, display: 'block' }}>🔴 Baseline (Antes):</span>
                  <strong style={{ fontSize: '0.85rem', color: '#dc2626' }}>
                    {action.baselineValue !== undefined ? `${action.baselineValue} ${action.targetMetricUnit || ''}` : '—'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.625rem', color: '#2563eb', fontWeight: 700, display: 'block' }}>🎯 Meta Alvo:</span>
                  <strong style={{ fontSize: '0.85rem', color: '#2563eb' }}>
                    {action.targetGoalValue !== undefined ? `${action.targetGoalValue} ${action.targetMetricUnit || ''}` : '—'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.625rem', color: '#059669', fontWeight: 700, display: 'block' }}>🟢 Atingido (Depois):</span>
                  <strong style={{ fontSize: '0.85rem', color: '#059669' }}>
                    {action.achievedValue !== undefined ? `${action.achievedValue} ${action.targetMetricUnit || ''}` : '—'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Pareto 80/20 Analysis */}
            <div style={{ backgroundColor: '#ffffff', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                  📊 Comprovação por Gráfico de Pareto (Regra 80/20):
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                  {action.pareto?.cumulativeImpactPercentage || 80}% do impacto
                </span>
              </div>

              {action.pareto?.chartImageUrl ? (
                <div style={{ textAlign: 'center', marginBottom: '0.35rem' }}>
                  <img
                    src={action.pareto.chartImageUrl}
                    alt="Gráfico de Pareto"
                    style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.5rem', backgroundColor: '#eff6ff', borderRadius: '4px', marginBottom: '0.3rem', fontSize: '0.675rem' }}>
                  <span>⚡ Causas Vitais prioritárias identificadas no Pareto</span>
                  <span style={{ fontWeight: 800, color: '#1d4ed8' }}>{action.pareto?.cumulativeImpactPercentage || 80}% das Perdas</span>
                </div>
              )}

              <p style={{ fontSize: '0.725rem', color: '#334155', margin: 0, lineHeight: 1.25, fontStyle: 'italic' }}>
                {action.pareto?.vitalCausesSummary || '80% das perdas decorrem das causas vitais priorizadas no diagnóstico inicial.'}
              </p>
            </div>

            {/* 5 Porquês */}
            {action.fiveWhys && action.fiveWhys.some((w) => w.trim()) && (
              <div style={{ backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', display: 'block', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                  🔍 5 Porquês (Causa Raiz Definitiva):
                </span>
                <p style={{ fontSize: '0.7rem', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                  {action.fiveWhys[4] || action.fiveWhys[action.fiveWhys.length - 1]}
                </p>
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* QUADRANT 2: D - DO (Superior Direito) */}
          {/* ======================================================================= */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #fde68a',
              borderRadius: '10px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            {/* Quadrant Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1.5px solid #fde68a',
                paddingBottom: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ backgroundColor: '#d97706', color: '#ffffff', fontWeight: 900, fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  2. DO
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  Plano de Ação 5W2H & Execução
                </strong>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#b45309' }}>
                {action.checklist.filter((c) => c.completed).length}/{action.checklist.length} Ações Concluídas
              </span>
            </div>

            {/* 5W2H Activities Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden', flex: 1 }}>
              <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                    <th style={{ padding: '0.35rem 0.45rem', textAlign: 'left', fontWeight: 800, color: '#92400e', width: '45%' }}>O Quê (Ação 5W2H)</th>
                    <th style={{ padding: '0.35rem 0.45rem', textAlign: 'left', fontWeight: 800, color: '#92400e', width: '22%' }}>Quem</th>
                    <th style={{ padding: '0.35rem 0.45rem', textAlign: 'center', fontWeight: 800, color: '#92400e', width: '18%' }}>Prazo</th>
                    <th style={{ padding: '0.35rem 0.45rem', textAlign: 'center', fontWeight: 800, color: '#92400e', width: '15%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {action.checklist.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                        Nenhuma atividade cadastrada.
                      </td>
                    </tr>
                  ) : (
                    action.checklist.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.35rem 0.45rem', color: '#0f172a', fontWeight: 600 }}>
                          {idx + 1}. {item.label}
                        </td>
                        <td style={{ padding: '0.35rem 0.45rem', color: '#475569' }}>
                          {item.responsibleName || 'Agente'}
                        </td>
                        <td style={{ padding: '0.35rem 0.45rem', textAlign: 'center', color: '#64748b' }}>
                          {formatDate(item.endDate || item.startDate)}
                        </td>
                        <td style={{ padding: '0.35rem 0.45rem', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              backgroundColor: item.completed ? '#dcfce7' : '#fef3c7',
                              color: item.completed ? '#15803d' : '#b45309',
                            }}
                          >
                            {item.completed ? '✓ Feito' : 'Em andamento'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Execution summary */}
            <div style={{ backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.675rem' }}>
              <span>⏱️ Horas de Engenharia / Fábrica: <strong>{action.projectCosts?.internalLaborHours || 0}h</strong></span>
              <span style={{ color: '#059669', fontWeight: 700 }}>✓ Execução 100% no padrão Lean</span>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* QUADRANT 3: C - CHECK (Inferior Esquerdo) */}
          {/* ======================================================================= */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #a7f3d0',
              borderRadius: '10px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            {/* Quadrant Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1.5px solid #a7f3d0',
                paddingBottom: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ backgroundColor: '#059669', color: '#ffffff', fontWeight: 900, fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  3. CHECK
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#065f46' }}>
                  Engenharia Financeira & Custos Evitados
                </strong>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669' }}>
                7 Fontes Lean Mapeadas
              </span>
            </div>

            {/* Financial Comparatives */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {/* Investimento Capex/Opex */}
              <div style={{ backgroundColor: '#ffffff', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', display: 'block', textTransform: 'uppercase' }}>
                  Investimento / Custos:
                </span>
                <div style={{ fontSize: '0.675rem', color: '#475569', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Peças/Equip:</span>
                    <strong>{formatCurrency(action.projectCosts?.partsAndEquipment || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Terceiros:</span>
                    <strong>{formatCurrency(action.projectCosts?.thirdPartyServices || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Equipe Interna:</span>
                    <strong>{formatCurrency((action.projectCosts?.internalLaborHours || 0) * (action.projectCosts?.laborHourlyRate || 45))}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.15rem', color: '#dc2626', fontWeight: 800 }}>
                    <span>Total Investido:</span>
                    <span>{formatCurrency(totalCosts)}</span>
                  </div>
                </div>
              </div>

              {/* Ganhos Brutos Mapeados */}
              <div style={{ backgroundColor: '#ffffff', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#059669', display: 'block', textTransform: 'uppercase' }}>
                  Ganhos Brutos (Fontes):
                </span>
                <div style={{ fontSize: '0.675rem', color: '#475569', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Paradas / OEE:</span>
                    <strong>{formatCurrency(action.costBreakdown?.machineDowntime || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Mão de Obra:</span>
                    <strong>{formatCurrency(action.costBreakdown?.laborSavings || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Refugo / Insumos:</span>
                    <strong>{formatCurrency(action.costBreakdown?.scrapReduction || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.15rem', color: '#059669', fontWeight: 800 }}>
                    <span>Total Ganhos:</span>
                    <span>{formatCurrency(grossSavings)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial KPI Banner */}
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.35rem',
                textAlign: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.6rem', color: '#065f46', fontWeight: 700, display: 'block' }}>LUCRO LÍQUIDO</span>
                <strong style={{ fontSize: '0.85rem', color: '#047857' }}>{formatCurrency(netSavings)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.6rem', color: '#065f46', fontWeight: 700, display: 'block' }}>ROI REAL</span>
                <strong style={{ fontSize: '0.85rem', color: '#2563eb' }}>{roi}%</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.6rem', color: '#065f46', fontWeight: 700, display: 'block' }}>PAYBACK</span>
                <strong style={{ fontSize: '0.85rem', color: '#b45309' }}>{payback} meses</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.6rem', color: '#065f46', fontWeight: 700, display: 'block' }}>HORAS SALVAS</span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{action.hoursSaved || 0}h</strong>
              </div>
            </div>

            {/* Attachments Note */}
            <div style={{ backgroundColor: '#ffffff', padding: '0.35rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.65rem', color: '#64748b' }}>
              📎 Memoriais Anexados: <strong>{action.attachments?.length || 0} documentos técnicos</strong> ({action.attachments?.map((a) => a.name).join(', ') || 'Memorial em anexo'})
            </div>
          </div>

          {/* ======================================================================= */}
          {/* QUADRANT 4: A - ACT (Inferior Direito) */}
          {/* ======================================================================= */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #ddd6fe',
              borderRadius: '10px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            {/* Quadrant Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1.5px solid #ddd6fe',
                paddingBottom: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 900, fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  4. ACT
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#6d28d9' }}>
                  Padronização, Yokoten & Homologação Master
                </strong>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7c3aed' }}>
                Ciclo Fechado & Sustentável
              </span>
            </div>

            {/* SOP / POP & Yokoten */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {/* Padronização POP */}
              <div style={{ backgroundColor: '#ffffff', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', display: 'block', textTransform: 'uppercase' }}>
                  📄 Padronização POP / SOP:
                </span>
                <p style={{ fontSize: '0.725rem', color: '#0f172a', fontWeight: 700, margin: '0.2rem 0 0.1rem' }}>
                  {action.standardWorkDocRef || 'POP Atualizado'}
                </p>
                <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700 }}>
                  ✓ {action.standardWorkUpdated ? 'Treinamento concluído com a equipe' : 'Padrão implementado'}
                </span>
              </div>

              {/* Yokoten */}
              <div style={{ backgroundColor: '#ffffff', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', display: 'block', textTransform: 'uppercase' }}>
                  🔄 Yokoten (Replicação):
                </span>
                <p style={{ fontSize: '0.7rem', color: '#0f172a', margin: '0.2rem 0 0', lineHeight: 1.25 }}>
                  {action.yokotenReplication || 'Replicar melhoria nas demais linhas do setor.'}
                </p>
              </div>
            </div>

            {/* Lições Aprendidas */}
            <div style={{ backgroundColor: '#ffffff', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', display: 'block', textTransform: 'uppercase' }}>
                💡 Lições Aprendidas no Projeto:
              </span>
              <p style={{ fontSize: '0.725rem', color: '#334155', margin: '0.15rem 0 0', lineHeight: 1.3 }}>
                {action.lessonsLearned || 'Ações de baixo custo com foco nas causas vitais trouxeram os maiores ganhos em OEE.'}
              </p>
            </div>

            {/* COMPROVAÇÃO DE SUSTENTAÇÃO EM 3 MESES PELO AGENTE */}
            <div style={{ backgroundColor: '#ffffff', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  📅 Acompanhamento de 3 Meses pelo Agente:
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isThreeMonthsFollowUpCompleted(action) ? '#059669' : '#d97706' }}>
                  {isThreeMonthsFollowUpCompleted(action) ? '✓ 3/3 Meses Consolidados' : `${getFollowUpMonthsFilledCount(action)}/3 Meses`}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
                {([1, 2, 3] as const).map((m) => {
                  const entry = action.quarterlyFollowUp?.[`month${m}` as 'month1' | 'month2' | 'month3'];
                  return (
                    <div key={m} style={{ backgroundColor: '#f8fafc', padding: '0.25rem 0.35rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.6rem', color: '#64748b', display: 'block', fontWeight: 700 }}>{m}º Mês</span>
                      <strong style={{ fontSize: '0.7rem', color: entry?.value !== undefined ? '#0f172a' : '#94a3b8' }}>
                        {entry?.value !== undefined ? formatCurrency(entry.value) : 'Pendente'}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OFFICIAL MASTER HOMOLOGATION STAMP BOX */}
            <div
              style={{
                backgroundColor: action.masterApproved ? '#f0fdf4' : '#faf5ff',
                border: `1.5px solid ${action.masterApproved ? '#10b981' : '#c084fc'}`,
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: action.masterApproved ? '#10b981' : '#9333ea',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1rem',
                  }}
                >
                  {action.masterApproved ? '✓' : '🏢'}
                </div>
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: action.masterApproved ? '#065f46' : '#6b21a8', display: 'block' }}>
                    {action.masterApproved ? 'HOMOLOGAÇÃO MASTER EXECUTIVA' : 'PENDENTE DE HOMOLOGAÇÃO MASTER'}
                  </strong>
                  <span style={{ fontSize: '0.675rem', color: '#475569' }}>
                    {action.masterApproved
                      ? `Validado oficialmente por Rafitec em ${formatDateTime(action.masterApprovedAt)}`
                      : `Submetido por ${action.submittedForApprovalBy || action.assignedAgentName || 'Agente'} para aprovação`}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    color: action.masterApproved ? '#15803d' : '#7e22ce',
                    border: `1px solid ${action.masterApproved ? '#86efac' : '#d8b4fe'}`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {action.masterApproved ? 'DRE APROVADA ✓' : 'EM ANÁLISE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* A3 FOOTER */}
        <div
          style={{
            borderTop: '1px solid #cbd5e1',
            paddingTop: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.675rem',
            color: '#64748b',
          }}
        >
          <div>
            Metodologia <strong>FluxoLean 4.0</strong> • Ciclo PDCA & Engenharia de Custos Evitados • Consultor <strong>Mauricio Grigol</strong>
          </div>
          <div>
            Entidade: <strong>Rafitec</strong> • Documento emitido em {formatDate(new Date().toISOString())}
          </div>
        </div>
      </div>
    </div>
  );
};
