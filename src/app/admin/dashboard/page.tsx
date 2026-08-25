'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { StatsCard } from '@/components/ui/StatsCard';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Kanban,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Award,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { dataVersion } = useAuth();

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
          background: 'linear-gradient(135deg, #091326 0%, #0d2347 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
              }}
            >
              VISÃO EXECUTIVA MASTER
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            Painel Geral do Supervisor
          </h2>
          <p style={{ fontSize: '0.84375rem', color: '#94a3b8', maxWidth: '600px', marginTop: '0.25rem' }}>
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
                color: '#020617',
                fontWeight: 800,
                fontSize: '0.84375rem',
                padding: '0.625rem 1rem',
                borderRadius: '10px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
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
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              fontWeight: 700,
              fontSize: '0.84375rem',
              padding: '0.625rem 1rem',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            <Kanban size={16} color="#22d3ee" />
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
          accentColor="#10b981"
          trend={{ value: '+18.4% no mês', isPositive: true }}
        />

        <StatsCard
          title="Custo Evitado em Andamento"
          value={formatCurrency(metrics.totalEstimatedCostAvoided - metrics.totalActualCostAvoided)}
          subtitle="Potencial de economia nas ações ativas"
          icon={<TrendingUp size={22} />}
          accentColor="#06b6d4"
        />

        <StatsCard
          title="Total de Ações Geradas"
          value={metrics.totalActions}
          subtitle={`${metrics.completedActions} concluídas | ${metrics.inProgressActions} em andamento`}
          icon={<Kanban size={22} />}
          accentColor="#8b5cf6"
        />

        <StatsCard
          title="Horas de Trabalho Salvas"
          value={`${metrics.totalHoursSaved}h`}
          subtitle="Ganho de capacidade operacional"
          icon={<Clock size={22} />}
          accentColor="#f59e0b"
        />
      </div>

      {/* Visão Geral de Cada Agente */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Visão Geral de Desempenho por Agente
            </h3>
            <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
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
              <tr style={{ backgroundColor: '#090e1a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background-color 0.15s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
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
                        style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}
                      />
                      <div>
                        <p style={{ fontWeight: 700, color: '#f8fafc', margin: 0 }}>{agent.agentName}</p>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Especialista Lean</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#cbd5e1', fontWeight: 600 }}>
                    {agent.sectorName || 'Geral'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 700, color: '#f8fafc' }}>
                    {agent.assignedCount}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>
                      {agent.inProgressCount}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>
                      {agent.completedCount}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: '#34d399', fontSize: '0.9375rem' }}>
                    {formatCurrency(agent.actualCostAvoided)}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${agent.efficiencyRate}%`,
                            height: '100%',
                            backgroundColor: agent.efficiencyRate >= 60 ? '#10b981' : '#06b6d4',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
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

      {/* Sectors ROI Breakdown */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Impacto & Custo Evitado por Setor
          </h3>
          <Link href="/admin/setores" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
            Ver Setores
          </Link>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {metrics.bySector.map((sec) => (
            <div
              key={sec.sectorId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.85rem',
                backgroundColor: '#090e1a',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={18} color="#22d3ee" />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>{sec.sectorName}</p>
                  <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>{sec.count} ações registradas</p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Custo Evitado</span>
                <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#34d399', margin: 0, fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(sec.costAvoided)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
