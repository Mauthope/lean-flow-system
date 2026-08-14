'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { StatsCard } from '@/components/ui/StatsCard';
import { formatCurrency, WASTE_CATEGORIES } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Kanban,
  Users,
  CheckCircle2,
  Clock,
  Inbox,
  AlertTriangle,
  Building2,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { dataVersion, allAgents } = useAuth();

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  const pendingDemands = useMemo(() => {
    return dataService.getActions().filter((a) => a.isPublicDemand && a.status === 'aberta' && !a.assignedAgentId);
  }, [dataVersion]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner with Quick Highlights */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                color: '#93c5fd',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              VISÃO EXECUTIVA LEAN
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Painel Geral do Supervisor
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', maxWidth: '600px', marginTop: '0.25rem' }}>
            Controle integrado de projetos de melhoria contínua, custo evitado por operador e triagem de
            demandas da fábrica.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {pendingDemands.length > 0 && (
            <Link
              href="/admin/triagem"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f59e0b',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.84375rem',
                padding: '0.625rem 1rem',
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              <Inbox size={16} />
              <span>{pendingDemands.length} Demandas em Triagem</span>
            </Link>
          )}

          <Link
            href="/admin/kanban"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.84375rem',
              padding: '0.625rem 1rem',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            <Kanban size={16} />
            <span>Ver Kanban Geral</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <StatsCard
          title="Custo Evitado Real (ROI)"
          value={formatCurrency(metrics.totalActualCostAvoided)}
          subtitle="Economia comprovada em ações concluídas"
          icon={<DollarSign size={22} />}
          accentColor="#059669"
          trend={{ value: '+18.4% no mês', isPositive: true }}
        />

        <StatsCard
          title="Custo Evitado em Andamento"
          value={formatCurrency(metrics.totalEstimatedCostAvoided - metrics.totalActualCostAvoided)}
          subtitle="Potencial de economia nas ações ativas"
          icon={<TrendingUp size={22} />}
          accentColor="#2563eb"
        />

        <StatsCard
          title="Total de Ações Geradas"
          value={metrics.totalActions}
          subtitle={`${metrics.completedActions} concluídas | ${metrics.inProgressActions} em andamento`}
          icon={<Kanban size={22} />}
          accentColor="#7c3aed"
        />

        <StatsCard
          title="Horas de Trabalho Salvas"
          value={`${metrics.totalHoursSaved}h`}
          subtitle="Ganho de capacidade operacional"
          icon={<Clock size={22} />}
          accentColor="#d97706"
        />
      </div>

      {/* Visão Geral de Cada Agente (Requested by User) */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
              Visão Geral de Desempenho por Agente
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Acompanhamento individual de ações atribuídas, entregas e custo evitado gerado por operador
            </p>
          </div>
          <Link href="/admin/agentes" className="btn btn-secondary btn-sm">
            <Users size={14} /> Gerenciar Agentes
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.875rem 1.25rem' }}>Agente</th>
                <th style={{ padding: '0.875rem 1rem' }}>Setor</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Atribuídas</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Em Andamento</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Concluídas</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Custo Evitado Gerado</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>Taxa Eficiência</th>
              </tr>
            </thead>
            <tbody>
              {metrics.byAgent.map((agent) => (
                <tr
                  key={agent.agentId}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={
                          agent.avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={agent.agentName}
                        style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                      />
                      <div>
                        <p style={{ fontWeight: 700, color: '#0f172a' }}>{agent.agentName}</p>
                        <p style={{ fontSize: '0.725rem', color: '#64748b' }}>Especialista Lean</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#475569', fontWeight: 600 }}>
                    {agent.sectorName || 'Geral'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                    {agent.assignedCount}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>
                      {agent.inProgressCount}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>
                      {agent.completedCount}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: '0.9375rem' }}>
                    {formatCurrency(agent.actualCostAvoided)}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${agent.efficiencyRate}%`,
                            height: '100%',
                            backgroundColor: agent.efficiencyRate >= 60 ? '#10b981' : '#3b82f6',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                        {agent.efficiencyRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Grids: Waste Categories & Sectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Waste Categories Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Distribuição por Categoria de Desperdício Lean
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {Object.entries(WASTE_CATEGORIES).map(([key, cat]) => {
              const count = metrics.byWasteCategory[key as keyof typeof metrics.byWasteCategory] || 0;
              const pct = metrics.totalActions > 0 ? Math.round((count / metrics.totalActions) * 100) : 0;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{cat.label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor:
                          key === 'defeitos'
                            ? '#ef4444'
                            : key === 'espera'
                            ? '#f59e0b'
                            : key === 'superproducao'
                            ? '#8b5cf6'
                            : '#2563eb',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sectors ROI Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Impacto & Custo Evitado por Setor
            </h3>
            <Link href="/admin/setores" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
              Ver Setores
            </Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {metrics.bySector.map((sec) => (
              <div
                key={sec.sectorId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={18} color="#2563eb" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{sec.sectorName}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{sec.count} ações registradas</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Custo Evitado</span>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#059669' }}>
                    {formatCurrency(sec.costAvoided)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
