'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { StatsCard } from '@/components/ui/StatsCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LeanAction, ActionChecklistItem } from '@/lib/types';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Kanban,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Inbox,
  Award,
  Sparkles,
  Zap,
  Target,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sigma,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

import { DeadlineMonitoringPanel } from '@/components/monitoring/DeadlineMonitoringPanel';

const SECTOR_ACCENTS = [
  { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)' },
  { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' },
  { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)' },
  { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' },
];

export default function AdminDashboardPage() {
  const { dataVersion } = useAuth();

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  const [boardFilter, setBoardFilter] = useState<'ativos' | 'expirados' | 'todos'>('ativos');

  const boardFinancials = useMemo(() => {
    return (
      metrics.boardFinancials || {
        activeMonthlyTotal: 0,
        activeAnnualTotal: 0,
        activeNetAnnualTotal: 0,
        activeInvestmentTotal: 0,
        averagePaybackMonths: 0,
        averagePaybackYears: 0,
        activeProjectsCount: 0,
        expiredProjectsCount: 0,
        expiredAnnualTotal: 0,
        projects: [],
      }
    );
  }, [metrics]);

  const filteredBoardProjects = useMemo(() => {
    if (boardFilter === 'ativos') {
      return boardFinancials.projects.filter((p) => !p.isExpired);
    }
    if (boardFilter === 'expirados') {
      return boardFinancials.projects.filter((p) => p.isExpired);
    }
    return boardFinancials.projects;
  }, [boardFinancials, boardFilter]);

  const pendingDemands = useMemo(() => {
    return dataService.getActions().filter((a) => a.isPublicDemand && a.status === 'aberta' && !a.assignedAgentId);
  }, [dataVersion]);

  // Ações homologadas ou concluídas disponíveis para acompanhamento de 3 meses
  const followUpActions = useMemo(() => {
    return dataService
      .getActions()
      .filter((a) => a.masterApproved || a.status === 'concluida' || a.quarterlyFollowUp?.enabled);
  }, [dataVersion]);

  // Resumo de contagem de alertas de prazos para o badge do Hero
  const { overdueCount, nearDueCount } = useMemo(() => {
    const all = dataService.getActions();
    const now = new Date().setHours(0, 0, 0, 0);
    let ov = 0;
    let nr = 0;

    all.forEach((act) => {
      if (act.status !== 'concluida' && act.status !== 'nao_aprovada' && act.dueDate) {
        const d = new Date(act.dueDate).getTime();
        if (!isNaN(d)) {
          const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
          if (diffDays < 0) ov++;
          else if (diffDays <= 3) nr++;
        }
      }
      if (act.status !== 'concluida' && act.status !== 'nao_aprovada' && act.checklist) {
        act.checklist.forEach((item) => {
          if (!item.completed && item.status !== 'concluida') {
            const targetDate = item.endDate || item.plannedEnd;
            if (targetDate) {
              const d = new Date(targetDate).getTime();
              if (!isNaN(d)) {
                const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) ov++;
                else if (diffDays <= 3) nr++;
              }
            }
          }
        });
      }
    });

    return { overdueCount: ov, nearDueCount: nr };
  }, [dataVersion]);

  // Breakdown calculations for the executive financial sources
  const breakdownList = useMemo(() => {
    const total = metrics.totalActualCostAvoided || 1;
    const b = metrics.costBreakdownTotals || {};
    return [
      {
        label: 'Mão de Obra & Tempo de Ciclo',
        value: b.laborSavings || 0,
        pct: Math.round(((b.laborSavings || 0) / total) * 100),
        color: '#06b6d4',
        icon: '👷‍♂️',
      },
      {
        label: 'Aumento de Produção & Capacidade',
        value: b.productionIncrease || 0,
        pct: Math.round(((b.productionIncrease || 0) / total) * 100),
        color: '#10b981',
        icon: '🚀',
      },
      {
        label: 'Redução de Sucata & Refugo',
        value: b.scrapReduction || 0,
        pct: Math.round(((b.scrapReduction || 0) / total) * 100),
        color: '#ec4899',
        icon: '♻️',
      },
      {
        label: 'Paradas de Máquina & Insumos',
        value: (b.machineDowntime || 0) + (b.toolingAndEnergy || 0) + (b.logisticsAndFreight || 0),
        pct: Math.round((((b.machineDowntime || 0) + (b.toolingAndEnergy || 0) + (b.logisticsAndFreight || 0)) / total) * 100),
        color: '#f59e0b',
        icon: '⚙️',
      },
    ].filter((item) => item.value > 0 || total > 1);
  }, [metrics]);

  const totalPipeline = metrics.totalActions || 1;
  const pctOpen = Math.round((metrics.openActions / totalPipeline) * 100);
  const pctInProgress = Math.round((metrics.inProgressActions / totalPipeline) * 100);
  const pctCompleted = Math.round((metrics.completedActions / totalPipeline) * 100);
  const pctRejected = Math.round((metrics.rejectedActions / totalPipeline) * 100);

  // Estatísticas do Acompanhamento Trimestral
  const followUpCompletedCount = followUpActions.filter((a) => a.quarterlyFollowUp?.isCompleted).length;
  const followUpInProgressCount = followUpActions.length - followUpCompletedCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ================= TOP HERO BANNER (SOFISTICAÇÃO EXECUTIVA) ================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091326 0%, #0c1c38 45%, #070e1d 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '20px',
          padding: '1.85rem 2.25rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.6), 0 0 25px rgba(6, 182, 212, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative glow orb in background */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '20%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div>
          {/* Executive Badges Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ShieldCheck size={12} color="#22d3ee" /> VISÃO EXECUTIVA MASTER
            </span>

            {/* Overdue / Near-due Badge in Hero */}
            {overdueCount > 0 ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
                }}
              >
                <AlertTriangle size={12} color="#f87171" /> 🚨 {overdueCount} EM ATRASO {nearDueCount > 0 ? `• 🟡 ${nearDueCount} QUASE ATRASADOS` : ''}
              </span>
            ) : nearDueCount > 0 ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
                }}
              >
                <Clock size={12} color="#fbbf24" /> 🟡 {nearDueCount} VENCENDO EM BREVE
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCircle2 size={12} color="#34d399" /> 0 ATRASOS • 100% NO PRAZO
              </span>
            )}

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ● {metrics.resolutionRate}% RESOLUÇÃO
            </span>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ⏱️ {metrics.averageCycleDays}d CICLO MÉDIO
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Painel de Inteligência Operacional Lean
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '620px', marginTop: '0.35rem', lineHeight: 1.5 }}>
            Controle integrado de iniciativas de melhoria contínua, custo evitado homologado por operador, monitoramento de prazos e auditoria trimestral.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {pendingDemands.length > 0 && (
            <Link
              href="/admin/triagem"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#fbbf24',
                fontWeight: 800,
                fontSize: '0.84375rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              <Inbox size={16} />
              <span>{pendingDemands.length} Triagens Pendentes</span>
            </Link>
          )}

          <Link
            href="/admin/kanban"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#22d3ee',
              fontWeight: 800,
              fontSize: '0.84375rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)',
              transition: 'all 0.15s ease',
            }}
          >
            <Kanban size={16} color="#22d3ee" />
            <span>Kanban Geral</span>
          </Link>
        </div>
      </div>

      {/* ================= 4 CARDS DE MÉTRICAS EXECUTIVAS PARA A DIRETORIA (CICLO 12M) ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
        <StatsCard
          title="Retorno Mensal Vigente"
          value={`${formatCurrency(boardFinancials.activeMonthlyTotal)}/mês`}
          subtitle="Média dos 3 meses somada dos projetos ativos no ano"
          icon={<DollarSign size={22} />}
          accentColor="#10b981"
          trend={{ value: `${boardFinancials.activeProjectsCount} projetos ativos no ano`, isPositive: true }}
        />

        <StatsCard
          title="Resultado Total do Ano (12 Meses)"
          value={`${formatCurrency(boardFinancials.activeAnnualTotal)}/ano`}
          subtitle="Economia operacional total (Média × 12) computada no resultado"
          icon={<TrendingUp size={22} />}
          accentColor="#06b6d4"
          trend={{ value: 'Diretoria Executiva • Ganho Real', isPositive: true }}
        />

        <StatsCard
          title="Investimento Total (Capex)"
          value={formatCurrency(boardFinancials.activeInvestmentTotal)}
          subtitle="Capital aplicado nos projetos ativos (Informativo • Não abate do resultado)"
          icon={<Award size={22} />}
          accentColor="#8b5cf6"
          trend={{ value: 'Controle de Capex & Opex', isPositive: true }}
        />

        <StatsCard
          title="Tempo Médio de Payback"
          value={boardFinancials.averagePaybackMonths > 0 ? (boardFinancials.averagePaybackMonths >= 12 ? `${boardFinancials.averagePaybackYears} anos` : `${boardFinancials.averagePaybackMonths} meses`) : 'Imediato'}
          subtitle={`${boardFinancials.averagePaybackMonths > 0 ? `Amortização em ${boardFinancials.averagePaybackMonths}m • ` : ''}${boardFinancials.activeProjectsCount} ativos | ${boardFinancials.expiredProjectsCount} com 1 ano concluído`}
          icon={<Clock size={22} />}
          accentColor="#f59e0b"
          trend={{ value: 'Payback plurianual suportado', isPositive: true }}
        />
      </div>

      {/* ========================================================================= */}
      {/* PAINEL EXECUTIVO DIRETORIA: DEMONSTRATIVO DE GANHOS LEAN (CICLO 12 MESES) */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          backgroundColor: '#0b1329',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.1)',
        }}
      >
        {/* Header do Painel da Diretoria */}
        <div
          style={{
            padding: '1.5rem 1.85rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)',
                }}
              >
                <TrendingUp size={20} color="#34d399" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    Demonstrativo de Ganhos para a Diretoria (DRE Lean • Ciclo 12 Meses)
                  </h3>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(16, 185, 129, 0.18)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    DIRETORIA EXECUTIVA
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.3rem 0 0', maxWidth: '850px', lineHeight: 1.4 }}>
                  Prestação de contas do retorno mensal (média dos 3 meses) e anualizado (12 meses). Projetos vigentes computam nos totais até completarem 1 ano (365 dias). Após esse prazo, o ganho é incorporado à rotina base e deixa de pontuar nos totais anuais correntes.
                </p>
              </div>
            </div>
          </div>

          {/* Filtros em Abas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#090e1a', padding: '0.35rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setBoardFilter('ativos')}
              style={{
                backgroundColor: boardFilter === 'ativos' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                border: boardFilter === 'ativos' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
                color: boardFilter === 'ativos' ? '#34d399' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🟢 Vigentes no Ano ({boardFinancials.activeProjectsCount})
            </button>
            <button
              onClick={() => setBoardFilter('expirados')}
              style={{
                backgroundColor: boardFilter === 'expirados' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                border: boardFilter === 'expirados' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
                color: boardFilter === 'expirados' ? '#fbbf24' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ⏰ Ciclo Encerrado (&gt; 12m) ({boardFinancials.expiredProjectsCount})
            </button>
            <button
              onClick={() => setBoardFilter('todos')}
              style={{
                backgroundColor: boardFilter === 'todos' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                border: boardFilter === 'todos' ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid transparent',
                color: boardFilter === 'todos' ? '#22d3ee' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              📋 Todos ({boardFinancials.projects.length})
            </button>
          </div>
        </div>

        {/* Faixa de Totais Vigentes da Diretoria */}
        <div
          style={{
            padding: '0.85rem 1.85rem',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                Retorno Mensal Vigente:
              </span>
              <strong style={{ fontSize: '1.15rem', color: '#34d399', marginLeft: '0.45rem', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(boardFinancials.activeMonthlyTotal)}/mês
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                Resultado do Ano (12m):
              </span>
              <strong style={{ fontSize: '1.15rem', color: '#22d3ee', marginLeft: '0.45rem', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(boardFinancials.activeAnnualTotal)}/ano
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                Investimento Total (Capex):
              </span>
              <strong style={{ fontSize: '1.15rem', color: '#f87171', marginLeft: '0.45rem', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(boardFinancials.activeInvestmentTotal)}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                Payback Médio do Portfólio:
              </span>
              <strong style={{ fontSize: '1.15rem', color: '#fbbf24', marginLeft: '0.45rem', fontFamily: 'var(--font-mono)' }}>
                {boardFinancials.averagePaybackMonths > 0 ? (boardFinancials.averagePaybackMonths >= 12 ? `${boardFinancials.averagePaybackYears} anos (${boardFinancials.averagePaybackMonths}m)` : `${boardFinancials.averagePaybackMonths} meses`) : 'Imediato'}
              </strong>
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            Exibindo <strong>{filteredBoardProjects.length}</strong> de {boardFinancials.projects.length} projetos
          </span>
        </div>

        {/* Tabela de Projetos da Diretoria */}
        <div style={{ overflowX: 'auto' }}>
          {filteredBoardProjects.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Clock size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Nenhum projeto encontrado nesta categoria.
              </p>
              <p style={{ fontSize: '0.8125rem', margin: '0.35rem 0 0' }}>
                {boardFilter === 'ativos'
                  ? 'Não há projetos com homologação recente (< 365 dias) no momento.'
                  : boardFilter === 'expirados'
                  ? 'Não há projetos que completaram o ciclo de 1 ano ainda.'
                  : 'Nenhum projeto homologado disponível.'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#070b14', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Projeto Lean / Setor</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Especialista</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Homologação</th>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Vigência no Ano (365d)</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Retorno Mensal (3M)</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Resultado do Ano (12M)</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Investimento (Capex)</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Tempo de Payback</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Totalizador</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoardProjects.map((p) => {
                  const progressPct = Math.round((p.monthsElapsed / 12) * 100);

                  return (
                    <tr
                      key={p.actionId}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor: p.isExpired ? 'rgba(0, 0, 0, 0.25)' : 'transparent',
                        opacity: p.isExpired ? 0.85 : 1,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = p.isExpired ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.03)')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = p.isExpired ? 'rgba(0, 0, 0, 0.25)' : 'transparent')}
                    >
                      {/* Projeto & Setor */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div>
                          <Link
                            href={`/admin/projetos/${p.actionId}`}
                            style={{
                              fontWeight: 800,
                              color: p.isExpired ? '#cbd5e1' : '#ffffff',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              fontFamily: 'var(--font-heading)',
                              display: 'block',
                            }}
                          >
                            {p.title}
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {p.protocol}
                            </span>
                            <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>•</span>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{p.sectorName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Responsável */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                          {p.responsibleName}
                        </span>
                      </td>

                      {/* Homologação */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.78125rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                            {p.homologatedAt ? formatDate(p.homologatedAt) : 'Recentemente'}
                          </span>
                          <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.1rem' }}>
                            {p.daysElapsed} dias decorridos
                          </span>
                        </div>
                      </td>

                      {/* Vigência no Ano (12 meses) */}
                      <td style={{ padding: '0.875rem 1.25rem', minWidth: '180px' }}>
                        {p.isExpired ? (
                          <div>
                            <span
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#fbbf24',
                                border: '1px solid rgba(245, 158, 11, 0.35)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <Clock size={11} /> 12m Concluído (&gt; 365d)
                            </span>
                            <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                              Incorporado à rotina base
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span
                                style={{
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.675rem',
                                  fontWeight: 900,
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                Mês {p.monthsElapsed} de 12
                              </span>
                              <span style={{ fontSize: '0.675rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                                Restam {p.monthsRemaining}m
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '5px', backgroundColor: '#1e293b', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${progressPct}%`,
                                  height: '100%',
                                  backgroundColor: '#10b981',
                                  borderRadius: '9999px',
                                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Retorno Mensal (3M) */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <strong
                            style={{
                              color: p.isExpired ? '#94a3b8' : '#34d399',
                              fontSize: '0.9375rem',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {formatCurrency(p.monthlyCostAvoided)}
                          </strong>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/mês</span>
                        </div>
                      </td>

                      {/* Resultado do Ano (12M) */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <strong
                            style={{
                              color: p.isExpired ? '#94a3b8' : '#22d3ee',
                              fontSize: '0.9375rem',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {formatCurrency(p.annualCostAvoided)}
                          </strong>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/ano (Computado)</span>
                        </div>
                      </td>

                      {/* Investimento (Capex) */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <strong style={{ fontSize: '0.85rem', color: p.totalInvestmentCost > 0 ? '#f87171' : '#64748b', fontFamily: 'var(--font-mono)' }}>
                            {p.totalInvestmentCost > 0 ? formatCurrency(p.totalInvestmentCost) : 'R$ 0,00'}
                          </strong>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                            {p.totalInvestmentCost > 0 ? 'Capex informado' : 'Custo Zero'}
                          </span>
                        </div>
                      </td>

                      {/* Tempo de Payback */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          {p.totalInvestmentCost === 0 ? (
                            <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 800 }}>
                              Imediato (100%)
                            </span>
                          ) : p.paybackMonths >= 12 ? (
                            <span
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#fbbf24',
                                border: '1px solid rgba(245, 158, 11, 0.35)',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.725rem',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              ⏱️ {(p.paybackMonths / 12).toFixed(1)} anos ({p.paybackMonths}m)
                            </span>
                          ) : (
                            <span
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.725rem',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              ⚡ {p.paybackMonths} meses
                            </span>
                          )}
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                            Amortização
                          </span>
                        </div>
                      </td>

                      {/* Status no Totalizador */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {p.isExpired ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: '#94a3b8',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ⚪ Encerrado (Rotina)
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.18)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              fontSize: '0.675rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            🟢 Computado no Total
                          </span>
                        )}
                      </td>

                      {/* Ação */}
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                        <Link
                          href={`/admin/projetos/${p.actionId}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <span>DRE</span> <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= 3 CARDS DE APOIO OPERACIONAL ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatsCard
          title="Potencial em Andamento"
          value={formatCurrency(metrics.totalEstimatedCostAvoided - metrics.totalActualCostAvoided)}
          subtitle="Projeção ativa nos ciclos em execução"
          icon={<TrendingUp size={22} />}
          accentColor="#06b6d4"
        />

        <StatsCard
          title="Total de Ações & Projetos"
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

      {/* ================= CENTRAL DE MONITORAMENTO DE PRAZOS & ATRASOS ================= */}
      <DeadlineMonitoringPanel isAdmin={true} />

      {/* ================= 2 PAINÉIS DE DESTAQUE OPERACIONAL & FINANCEIRO ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Painel 1: Fluxo do Pipeline de Projetos Lean */}
        <div
          className="card"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="#22d3ee" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  Pipeline Operacional de Projetos
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {metrics.totalActions} ações cadastradas
              </span>
            </div>
            <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: 0 }}>
              Distribuição proporcional das iniciativas pelas etapas do fluxo Lean
            </p>
          </div>

          {/* Segmented Pipeline Visual Bar */}
          <div>
            <div
              style={{
                width: '100%',
                height: '12px',
                borderRadius: '9999px',
                backgroundColor: '#090e1a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              {pctCompleted > 0 && (
                <div
                  title={`Concluídas: ${metrics.completedActions} (${pctCompleted}%)`}
                  style={{
                    width: `${pctCompleted}%`,
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                    transition: 'width 0.4s ease',
                  }}
                />
              )}
              {pctInProgress > 0 && (
                <div
                  title={`Em Andamento: ${metrics.inProgressActions} (${pctInProgress}%)`}
                  style={{
                    width: `${pctInProgress}%`,
                    backgroundColor: '#8b5cf6',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                    transition: 'width 0.4s ease',
                  }}
                />
              )}
              {pctOpen > 0 && (
                <div
                  title={`Abertas: ${metrics.openActions} (${pctOpen}%)`}
                  style={{
                    width: `${pctOpen}%`,
                    backgroundColor: '#06b6d4',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
                    transition: 'width 0.4s ease',
                  }}
                />
              )}
              {pctRejected > 0 && (
                <div
                  title={`Recusadas: ${metrics.rejectedActions} (${pctRejected}%)`}
                  style={{
                    width: `${pctRejected}%`,
                    backgroundColor: '#f87171',
                    transition: 'width 0.4s ease',
                  }}
                />
              )}
            </div>

            {/* Micro-Badges Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                  Concluídas
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  {metrics.completedActions} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({pctCompleted}%)</span>
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6', boxShadow: '0 0 6px #8b5cf6' }} />
                  Em Andamento
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                  {metrics.inProgressActions} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({pctInProgress}%)</span>
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4', boxShadow: '0 0 6px #06b6d4' }} />
                  Abertas / Novas
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                  {metrics.openActions} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({pctOpen}%)</span>
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  Recusadas
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                  {metrics.rejectedActions} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({pctRejected}%)</span>
                </strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              href="/admin/kanban"
              style={{
                fontSize: '0.78125rem',
                fontWeight: 700,
                color: '#22d3ee',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              Acessar Quadro Kanban Completo <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Painel 2: Composição Financeira do Custo Evitado */}
        <div
          className="card"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.25rem',
            boxShadow: '0 8px 30px -10px rgba(16, 185, 129, 0.12)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="#34d399" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  Composição do Retorno Lean
                </h3>
              </div>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                }}
              >
                ROI Homologado
              </span>
            </div>
            <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: 0 }}>
              Fontes reais de geração de valor financeiro validadas em fábrica
            </p>
          </div>

          {/* Breakdown Items with Progress Gauges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {breakdownList.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(item.value)}
                    </strong>
                    <span style={{ fontSize: '0.725rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-mono)' }}>
                      ({item.pct}%)
                    </span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#090e1a', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(8, item.pct))}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      borderRadius: '9999px',
                      boxShadow: `0 0 8px ${item.color}80`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Homologado:</span>
            <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(metrics.totalActualCostAvoided)}
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NOVO PAINEL MASTER: COMPROVAÇÃO DE GANHOS EM 3 MESES (PÓS-HOMOLOGAÇÃO)    */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px -5px rgba(6, 182, 212, 0.1), 0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            padding: '1.35rem 1.65rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.08) 0%, transparent 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={18} color="#22d3ee" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Sustentação em 3 Meses & Auditoria para Homologação Master
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
              Acompanhamento mensal dos resultados preenchidos pelo agente. O preenchimento dos 3 meses é pré-requisito para homologação do Gestor Master.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ✓ {followUpCompletedCount} CONSOLIDADOS (3/3)
            </span>

            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ⏳ {followUpInProgressCount} EM ACOMPANHAMENTO
            </span>
          </div>
        </div>

        {/* Table of Follow-up Projects */}
        <div style={{ overflowX: 'auto' }}>
          {followUpActions.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
              <Award size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Nenhum projeto em sustentação trimestral no momento.
              </p>
              <p style={{ fontSize: '0.8125rem', margin: '0.35rem 0 0' }}>
                Os projetos com acompanhamento de 3 meses preenchidos pelo agente aparecerão aqui para auditoria e homologação master.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#090e1a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Projeto Lean / Setor</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Responsável</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>1º Mês</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>2º Mês</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>3º Mês</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Média Trimestral</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Status Auditoria</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {followUpActions.map((act) => {
                  const fu = act.quarterlyFollowUp;
                  const m1 = fu?.month1?.value;
                  const m2 = fu?.month2?.value;
                  const m3 = fu?.month3?.value;
                  const isCompleted = !!fu?.isCompleted;
                  const avg = fu?.averageCostAvoided || act.actualCostAvoided || 0;

                  return (
                    <tr
                      key={act.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Projeto / Setor */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div>
                          <Link
                            href={`/admin/projetos/${act.id}`}
                            style={{
                              fontWeight: 800,
                              color: '#ffffff',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              fontFamily: 'var(--font-heading)',
                              display: 'block',
                            }}
                          >
                            {act.title}
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {act.protocol}
                            </span>
                            <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>•</span>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                              {act.originSectorName || 'Fábrica'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Responsável */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img
                            src={
                              act.assignedAgentAvatar ||
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={act.assignedAgentName || 'Agente'}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(6, 182, 212, 0.4)' }}
                          />
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                            {act.assignedAgentName || 'Especialista Lean'}
                          </span>
                        </div>
                      </td>

                      {/* 1º Mês */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {m1 !== undefined ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)',
                              display: 'inline-block',
                            }}
                          >
                            {formatCurrency(m1)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: '#64748b', fontStyle: 'italic' }}>
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* 2º Mês */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {m2 !== undefined ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)',
                              display: 'inline-block',
                            }}
                          >
                            {formatCurrency(m2)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: '#64748b', fontStyle: 'italic' }}>
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* 3º Mês */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {m3 !== undefined ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)',
                              display: 'inline-block',
                            }}
                          >
                            {formatCurrency(m3)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: '#64748b', fontStyle: 'italic' }}>
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* Média Trimestral */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span
                            style={{
                              fontWeight: 900,
                              color: '#34d399',
                              fontSize: '0.9375rem',
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            {formatCurrency(avg)}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            {isCompleted ? 'média fechada' : 'estimada / parcial'}
                          </span>
                        </div>
                      </td>

                      {/* Status Auditoria */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {isCompleted ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontWeight: 800,
                              fontSize: '0.725rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <CheckCircle2 size={12} /> Consolidado (3/3)
                          </span>
                        ) : m1 !== undefined && m2 !== undefined ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(139, 92, 246, 0.15)',
                              color: '#c084fc',
                              border: '1px solid rgba(139, 92, 246, 0.35)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontWeight: 800,
                              fontSize: '0.725rem',
                            }}
                          >
                            Aguardando Mês 3 (2/3)
                          </span>
                        ) : m1 !== undefined ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(6, 182, 212, 0.15)',
                              color: '#22d3ee',
                              border: '1px solid rgba(6, 182, 212, 0.35)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontWeight: 800,
                              fontSize: '0.725rem',
                            }}
                          >
                            Aguardando Mês 2 (1/3)
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontWeight: 800,
                              fontSize: '0.725rem',
                            }}
                          >
                            Aguardando Início (0/3)
                          </span>
                        )}
                      </td>

                      {/* Ação */}
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                        <Link
                          href={`/admin/projetos/${act.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <span>Auditar</span> <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= VISÃO GERAL DE DESEMPENHO POR AGENTE ================= */}
      <div className="card" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="#a78bfa" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Workstation de Operadores & Especialistas Lean
              </h3>
            </div>
            <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
              Acompanhamento individual de ações atribuídas, entregas concluídas e custo evitado gerado
            </p>
          </div>
          <Link href="/admin/agentes" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={14} /> Gerenciar Agentes
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#090e1a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.875rem 1.25rem' }}>Agente</th>
                <th style={{ padding: '0.875rem 1rem' }}>Setor</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Atribuídas</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Em Andamento</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Concluídas</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Custo Evitado Gerado</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>Eficiência</th>
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
                      <div style={{ position: 'relative' }}>
                        <img
                          src={
                            agent.avatarUrl ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={agent.agentName}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(6, 182, 212, 0.4)' }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            border: '1.5px solid #0f172a',
                          }}
                        />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>{agent.agentName}</p>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Especialista Lean</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#cbd5e1',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                      }}
                    >
                      {agent.sectorName || 'Geral'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {agent.assignedCount}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {agent.inProgressCount}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {agent.completedCount}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        color: '#34d399',
                        fontSize: '0.9375rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: agent.actualCostAvoided > 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        padding: agent.actualCostAvoided > 0 ? '0.2rem 0.5rem' : '0',
                        borderRadius: '6px',
                      }}
                    >
                      {formatCurrency(agent.actualCostAvoided)}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <div style={{ width: '70px', height: '7px', backgroundColor: '#090e1a', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div
                          style={{
                            width: `${agent.efficiencyRate}%`,
                            height: '100%',
                            background: agent.efficiencyRate >= 60 ? 'linear-gradient(90deg, #06b6d4, #10b981)' : '#f59e0b',
                            borderRadius: '999px',
                            boxShadow: agent.efficiencyRate >= 60 ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: agent.efficiencyRate >= 60 ? '#34d399' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
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

      {/* ================= IMPACTO & CUSTO EVITADO POR SETOR ================= */}
      <div className="card" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.5rem' }}>
        <div className="card-header" style={{ padding: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="#22d3ee" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Impacto & Custo Evitado por Setor
              </h3>
            </div>
            <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
              Volume de projetos executados e retorno financeiro comprovado por área fabril
            </p>
          </div>
          <Link href="/admin/setores" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Building2 size={14} /> Ver Todos os Setores
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {metrics.bySector.map((sec, idx) => {
            const accent = SECTOR_ACCENTS[idx % SECTOR_ACCENTS.length];
            const maxSectorCost = Math.max(...metrics.bySector.map((s) => s.costAvoided), 1);
            const sectorPct = Math.round((sec.costAvoided / maxSectorCost) * 100);

            return (
              <div
                key={sec.sectorId}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '1rem 1.15rem',
                  backgroundColor: '#090e1a',
                  borderRadius: '12px',
                  border: `1px solid ${accent.border}`,
                  boxShadow: `0 4px 15px rgba(0, 0, 0, 0.3), 0 0 15px ${accent.color}0a`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: accent.bg,
                        border: `1px solid ${accent.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 12px ${accent.color}25`,
                      }}
                    >
                      <Building2 size={18} color={accent.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        {sec.sectorName}
                      </p>
                      <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>
                        {sec.count} {sec.count === 1 ? 'ação registrada' : 'ações registradas'}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Custo Evitado
                    </span>
                    <p style={{ fontSize: '1rem', fontWeight: 900, color: '#34d399', margin: 0, fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(sec.costAvoided)}
                    </p>
                  </div>
                </div>

                {/* Contribution visual bar */}
                <div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(5, sectorPct)}%`,
                        height: '100%',
                        backgroundColor: accent.color,
                        boxShadow: `0 0 8px ${accent.color}60`,
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
