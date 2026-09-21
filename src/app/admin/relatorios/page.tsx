'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { formatCurrency, formatDateTime, WASTE_CATEGORIES } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Download,
  Printer,
  Award,
  CheckCircle2,
  Clock,
  Building2,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminRelatoriosPage() {
  const router = useRouter();
  const { dataVersion } = useAuth();
  const { isDark } = useTheme();

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  const completedActions = useMemo(() => {
    return dataService.getActions().filter((a) => a.status === 'concluida');
  }, [dataVersion]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Relatório Consolidado de Custo Evitado & ROI Lean
          </h2>
          <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#475569' }}>
            Demonstrativo financeiro dos ganhos operacionais homologados através de ações de melhoria contínua
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={14} /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Summary Highlight Card */}
      <div
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #091326 0%, #0d2d3a 100%)'
            : 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0f766e 100%)',
          border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(2, 132, 199, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          color: '#ffffff',
          boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(2, 132, 199, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? '#34d399' : '#a7f3d0' }}>
              Economia Homologada no Ano (Custo Evitado Vigente - 12M)
            </span>
            <h1 style={{ fontSize: '2.75rem', fontWeight: 900, marginTop: '0.25rem', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(metrics.totalActualCostAvoided)}
            </h1>
            <p style={{ fontSize: '0.84375rem', color: isDark ? '#94a3b8' : '#e0f2fe', marginTop: '0.4rem' }}>
              Gerado a partir de {metrics.boardFinancials?.activeProjectsCount ?? 1} projeto homologado vigente no exercício de 12 meses.
            </p>
            <span style={{ display: 'inline-block', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#bae6fd', marginTop: '0.25rem' }}>
              Histórico acumulado geral: <strong style={{ color: isDark ? '#34d399' : '#ffffff', fontFamily: 'var(--font-mono)' }}>{formatCurrency(metrics.totalCompletedCostAvoided || metrics.totalActualCostAvoided)}</strong> ({completedActions.length} ações concluídas, incluindo projetos incorporados à rotina).
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: '0.725rem', color: isDark ? '#34d399' : '#6ee7b7', fontWeight: 700 }}>Mão de Obra Salva</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>{metrics.totalHoursSaved} Horas</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: '0.725rem', color: isDark ? '#22d3ee' : '#7dd3fc', fontWeight: 700 }}>Tempo Médio de Ciclo</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>{metrics.averageCycleDays} Dias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Cost Avoidance Drivers */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Composição das Fontes de Custo Evitado & Retorno Financeiro
          </h3>
          <p style={{ fontSize: '0.78125rem', color: isDark ? '#94a3b8' : '#475569', margin: '0.15rem 0 0' }}>
            Distribuição do valor financeiro economizado por tipo de benefício operacional
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#dcfce7',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #86efac',
            borderRadius: '12px',
            padding: '1.125rem'
          }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: isDark ? '#34d399' : '#15803d', textTransform: 'uppercase' }}>
              🚀 Aumento de Produção
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(metrics.costBreakdownTotals?.productionIncrease || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#475569' }}>Peças e capacidade adicionais</span>
          </div>

          <div style={{
            backgroundColor: isDark ? 'rgba(6, 182, 212, 0.12)' : '#e0f2fe',
            border: isDark ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid #7dd3fc',
            borderRadius: '12px',
            padding: '1.125rem'
          }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: isDark ? '#22d3ee' : '#0369a1', textTransform: 'uppercase' }}>
              ♻️ Redução de Refugo/Sucata
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(metrics.costBreakdownTotals?.scrapReduction || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#475569' }}>Matéria-prima poupada</span>
          </div>

          <div style={{
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#dbeafe',
            border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #93c5fd',
            borderRadius: '12px',
            padding: '1.125rem'
          }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: isDark ? '#60a5fa' : '#1d4ed8', textTransform: 'uppercase' }}>
              👷‍♂️ Mão de Obra & Ciclo
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(metrics.costBreakdownTotals?.laborSavings || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#475569' }}>{metrics.totalHoursSaved}h de trabalho poupadas</span>
          </div>

          <div style={{
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#fef3c7',
            border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fcd34d',
            borderRadius: '12px',
            padding: '1.125rem'
          }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: isDark ? '#fbbf24' : '#b45309', textTransform: 'uppercase' }}>
              ⚙️ Paradas de Máquina (OEE)
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(metrics.costBreakdownTotals?.machineDowntime || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#475569' }}>Disponibilidade de linha</span>
          </div>

          <div style={{
            backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : '#f3e8ff',
            border: isDark ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid #d8b4fe',
            borderRadius: '12px',
            padding: '1.125rem'
          }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: isDark ? '#c084fc' : '#7e22ce', textTransform: 'uppercase' }}>
              ⚡ Energia & Ferramental
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(metrics.costBreakdownTotals?.toolingAndEnergy || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#475569' }}>Vida útil de moldes e KWh</span>
          </div>

          <div style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1.125rem'
          }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: isDark ? '#cbd5e1' : '#475569', textTransform: 'uppercase' }}>
              📦 Fretes & Outros
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency((metrics.costBreakdownTotals?.logisticsAndFreight || 0) + (metrics.costBreakdownTotals?.otherSavings || 0))}
            </p>
            <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#475569' }}>Logística e estoques</span>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="card" style={{ borderRadius: '16px' }}>
        <div className="card-header" style={{ padding: '1.25rem 1.5rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Detalhamento de Todas as Ações Concluídas com Custo Evitado
              </h3>
              <p style={{ fontSize: '0.78125rem', color: isDark ? '#94a3b8' : '#475569', margin: '0.2rem 0 0 0' }}>
                Clique em qualquer projeto da lista para abrir a página completa com a memória de cálculo e todas as ações realizadas.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7',
                color: isDark ? '#34d399' : '#15803d',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #86efac',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
              }}
            >
              {completedActions.length} Projetos Concluídos ({metrics.boardFinancials?.activeProjectsCount ?? 1} Vigente + {metrics.boardFinancials?.expiredProjectsCount ?? 1} Ciclo Concluído)
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{
                backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                color: isDark ? '#94a3b8' : '#475569',
                fontSize: '0.725rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '0.875rem 1.25rem' }}>Protocolo / Ação</th>
                <th style={{ padding: '0.875rem 1rem' }}>Desperdício</th>
                <th style={{ padding: '0.875rem 1rem' }}>Setor</th>
                <th style={{ padding: '0.875rem 1rem' }}>Agente</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Vigência (12M)</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Estimado</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Real Homologado (12M)</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Data Conclusão</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {completedActions.map((action) => {
                const waste = WASTE_CATEGORIES[action.wasteCategory];
                const refDate = new Date(action.masterApprovedAt || action.completedAt || action.updatedAt || action.createdAt).getTime();
                const days = Math.max(0, Math.floor((Date.now() - refDate) / (1000 * 60 * 60 * 24)));
                const isExpired = days > 365;
                const annualizedCost = action.quarterlyFollowUp?.averageCostAvoided
                  ? action.quarterlyFollowUp.averageCostAvoided * 12
                  : action.actualCostAvoided || 0;

                return (
                  <tr
                    key={action.id}
                    onClick={() => router.push(`/admin/projetos/${action.id}`)}
                    style={{
                      borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e2e8f0',
                      backgroundColor: isExpired
                        ? (isDark ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc')
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isExpired
                      ? (isDark ? 'rgba(0, 0, 0, 0.3)' : '#f1f5f9')
                      : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'))}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = isExpired
                      ? (isDark ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc')
                      : 'transparent')}
                  >
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', fontWeight: 800, color: isDark ? '#22d3ee' : '#0284c7' }}>
                        {action.protocol}
                      </span>
                      <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', margin: '0.15rem 0 0', fontFamily: 'var(--font-heading)' }}>{action.title}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                      ⚡ {waste?.label || action.wasteCategory}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }}>
                      {action.originSectorName}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img
                          src={
                            action.assignedAgentAvatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={action.assignedAgentName || ''}
                          style={{ width: '22px', height: '22px', borderRadius: '50%', border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #cbd5e1' }}
                        />
                        <span style={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {action.assignedAgentName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      {isExpired ? (
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 700,
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                            color: isDark ? '#94a3b8' : '#64748b',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ⚪ Ciclo Concluído (Rotina)
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
                            color: isDark ? '#34d399' : '#15803d',
                            border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #86efac',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          🟢 Vigente no Ano
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {formatCurrency(action.estimatedCostAvoided)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: isExpired ? (isDark ? '#94a3b8' : '#64748b') : (isDark ? '#34d399' : '#059669'), fontSize: '0.9375rem' }}>
                      {formatCurrency(annualizedCost)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8125rem' }}>
                      {formatDateTime(action.completedAt)}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                      <Link
                        href={`/admin/projetos/${action.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.65rem',
                          textDecoration: 'none',
                          color: isDark ? '#22d3ee' : '#0284c7',
                          fontWeight: 700,
                        }}
                      >
                        <span>Abrir Projeto</span>
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: isDark ? '#070b14' : '#f8fafc', borderTop: isDark ? '2px solid rgba(255, 255, 255, 0.12)' : '2px solid #cbd5e1', fontWeight: 800 }}>
                <td colSpan={6} style={{ padding: '0.875rem 1.25rem', color: isDark ? '#cbd5e1' : '#0f172a' }}>
                  Subtotal Carteira Vigente no Ano (Projetos Ativos no Exercício de 12M):
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: isDark ? '#34d399' : '#059669', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(metrics.totalActualCostAvoided)}
                </td>
                <td colSpan={2} style={{ padding: '0.875rem 1rem', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>
                  {metrics.boardFinancials?.activeProjectsCount ?? 1} projeto ativo
                </td>
              </tr>
              <tr style={{ backgroundColor: isDark ? '#090e1a' : '#f1f5f9', borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1', fontWeight: 800 }}>
                <td colSpan={6} style={{ padding: '0.875rem 1.25rem', color: isDark ? '#94a3b8' : '#475569' }}>
                  Total Histórico Acumulado Concluído (Incluindo Projetos Incorporados à Rotina):
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: isDark ? '#22d3ee' : '#0284c7', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(metrics.totalCompletedCostAvoided || metrics.totalActualCostAvoided)}
                </td>
                <td colSpan={2} style={{ padding: '0.875rem 1rem', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>
                  {completedActions.length} projetos no total
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
