'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { formatCurrency, formatDateTime, WASTE_CATEGORIES } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Award,
  ExternalLink,
} from 'lucide-react';

export default function AdminRelatoriosPage() {
  const router = useRouter();
  const { dataVersion } = useAuth();

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Relatório Consolidado de Custo Evitado & ROI Lean
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
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
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          borderRadius: '16px',
          padding: '2rem',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(6, 95, 70, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a7f3d0' }}>
              Economia Total Homologada (Custo Evitado Real)
            </span>
            <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
              {formatCurrency(metrics.totalActualCostAvoided)}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#d1fae5', marginTop: '0.5rem' }}>
              Gerado a partir de {completedActions.length} ações concluídas com sucesso.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '1rem 1.25rem', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: '0.725rem', color: '#a7f3d0' }}>Mão de Obra Salva</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>{metrics.totalHoursSaved} Horas</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '1rem 1.25rem', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: '0.725rem', color: '#a7f3d0' }}>Tempo Médio de Ciclo</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>{metrics.averageCycleDays} Dias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Cost Avoidance Drivers */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Composição das Fontes de Custo Evitado & Retorno Financeiro
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
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
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.125rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              🚀 Aumento de Produção
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d', marginTop: '0.2rem' }}>
              {formatCurrency(metrics.costBreakdownTotals?.productionIncrease || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: '#166534' }}>Peças e capacidade adicionais</span>
          </div>

          <div style={{ backgroundColor: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '12px', padding: '1.125rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#0e7490', textTransform: 'uppercase' }}>
              ♻️ Redução de Refugo/Sucata
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0891b2', marginTop: '0.2rem' }}>
              {formatCurrency(metrics.costBreakdownTotals?.scrapReduction || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: '#0e7490' }}>Matéria-prima poupada</span>
          </div>

          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.125rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
              👷‍♂️ Mão de Obra & Ciclo
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb', marginTop: '0.2rem' }}>
              {formatCurrency(metrics.costBreakdownTotals?.laborSavings || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: '#1d4ed8' }}>{metrics.totalHoursSaved}h de trabalho poupadas</span>
          </div>

          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.125rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              ⚙️ Paradas de Máquina (OEE)
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>
              {formatCurrency(metrics.costBreakdownTotals?.machineDowntime || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: '#b45309' }}>Disponibilidade de linha</span>
          </div>

          <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '12px', padding: '1.125rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#a21caf', textTransform: 'uppercase' }}>
              ⚡ Energia & Ferramental
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#c026d3', marginTop: '0.2rem' }}>
              {formatCurrency(metrics.costBreakdownTotals?.toolingAndEnergy || 0)}
            </p>
            <span style={{ fontSize: '0.7rem', color: '#a21caf' }}>Vida útil de moldes e KWh</span>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.125rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              📦 Fretes & Outros
            </span>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#334155', marginTop: '0.2rem' }}>
              {formatCurrency((metrics.costBreakdownTotals?.logisticsAndFreight || 0) + (metrics.costBreakdownTotals?.otherSavings || 0))}
            </p>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Logística e estoques</span>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="card" style={{ borderRadius: '16px' }}>
        <div className="card-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Detalhamento de Todas as Ações Concluídas com Custo Evitado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Clique em qualquer projeto da lista para abrir a página completa com a memória de cálculo e todas as ações realizadas.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#ecfdf5',
                color: '#047857',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
              }}
            >
              {completedActions.length} Projetos Concluídos
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.875rem 1.25rem' }}>Protocolo / Ação</th>
                <th style={{ padding: '0.875rem 1rem' }}>Desperdício</th>
                <th style={{ padding: '0.875rem 1rem' }}>Setor</th>
                <th style={{ padding: '0.875rem 1rem' }}>Agente</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Estimado</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Real Homologado</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Data Conclusão</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {completedActions.map((action) => {
                const waste = WASTE_CATEGORIES[action.wasteCategory];
                return (
                  <tr
                    key={action.id}
                    onClick={() => router.push(`/admin/projetos/${action.id}`)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', fontWeight: 700, color: '#2563eb' }}>
                        {action.protocol}
                      </span>
                      <p style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{action.title}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#334155' }}>
                      ⚡ {waste?.label || action.wasteCategory}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#475569', fontWeight: 600 }}>
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
                          style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                        />
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {action.assignedAgentName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#64748b' }}>
                      {formatCurrency(action.estimatedCostAvoided)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: '#047857', fontSize: '0.9375rem' }}>
                      {formatCurrency(action.actualCostAvoided)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
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
                          color: '#2563eb',
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
          </table>
        </div>
      </div>
    </div>
  );
}
