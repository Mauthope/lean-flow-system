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
  const [leadTimeTab, setLeadTimeTab] = useState<'pdca' | 'agentes' | 'gargalos'>('pdca');

  const leadTimeMetrics = useMemo(() => {
    return (
      metrics.leadTimeMetrics || {
        overallAvgDays: 0,
        overallDirectDays: 0,
        overallExternalWaitDays: 0,
        controladoriaAvgResponseDays: 0,
        pdcaStages: [],
        agentSummaries: [],
        sectorBottlenecks: [],
      }
    );
  }, [metrics]);

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



  const totalPipeline = metrics.totalActions || 1;
  const pctOpen = Math.round((metrics.openActions / totalPipeline) * 100);
  const pctInProgress = Math.round((metrics.inProgressActions / totalPipeline) * 100);
  const pctWaitingApproval = Math.round(((metrics.waitingApprovalActions || 0) / totalPipeline) * 100);
  const pctCompleted = Math.round((metrics.completedActions / totalPipeline) * 100);
  const pctRejected = Math.round((metrics.rejectedActions / totalPipeline) * 100);



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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
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

        {/* 4 Mini Cards Estruturados de Totais da Diretoria */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.85rem',
            padding: '1rem 1.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Card 1: Retorno Mensal Vigente */}
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
            }}
          >
            <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Retorno Mensal Vigente
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.2rem' }}>
              <strong style={{ fontSize: '1.2rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(boardFinancials.activeMonthlyTotal)}
              </strong>
              <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>/mês</span>
            </div>
            <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
              Média comprovada (3M)
            </span>
          </div>

          {/* Card 2: Resultado do Ano (12M) */}
          <div
            style={{
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
            }}
          >
            <span style={{ fontSize: '0.675rem', color: '#22d3ee', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Resultado do Ano (12M)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.2rem' }}>
              <strong style={{ fontSize: '1.2rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(boardFinancials.activeAnnualTotal)}
              </strong>
              <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 700 }}>/ano</span>
            </div>
            <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
              Economia operacional (Computada)
            </span>
          </div>

          {/* Card 3: Investimento Total (Capex) */}
          <div
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
            }}
          >
            <span style={{ fontSize: '0.675rem', color: '#fb7185', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Investimento Total (Capex)
            </span>
            <strong style={{ fontSize: '1.2rem', color: '#ffffff', fontFamily: 'var(--font-mono)', display: 'block', marginTop: '0.2rem' }}>
              {formatCurrency(boardFinancials.activeInvestmentTotal)}
            </strong>
            <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
              Informativo • Não abate de 12m
            </span>
          </div>

          {/* Card 4: Tempo Médio de Payback */}
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
            }}
          >
            <span style={{ fontSize: '0.675rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Payback Médio do Portfólio
            </span>
            <strong style={{ fontSize: '1.2rem', color: '#ffffff', fontFamily: 'var(--font-mono)', display: 'block', marginTop: '0.2rem' }}>
              {boardFinancials.averagePaybackMonths > 0 ? (
                boardFinancials.averagePaybackMonths >= 12 ? (
                  <span>{boardFinancials.averagePaybackYears} <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>anos ({boardFinancials.averagePaybackMonths}m)</span></span>
                ) : (
                  <span>{boardFinancials.averagePaybackMonths} <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>meses</span></span>
                )
              ) : (
                <span style={{ color: '#34d399' }}>⚡ Imediato</span>
              )}
            </strong>
            <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
              Tempo médio de amortização
            </span>
          </div>
        </div>

        {/* Faixa de Contagem e Legenda de Governança */}
        <div
          style={{
            padding: '0.65rem 1.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
            <span style={{ color: '#34d399', fontWeight: 800 }}>●</span>
            <span>
              {boardFilter === 'ativos'
                ? 'Projetos vigentes com retorno operacional computado no exercício de 12 meses.'
                : boardFilter === 'expirados'
                ? 'Projetos com ciclo de 1 ano concluído (ganhos incorporados à rotina base da fábrica).'
                : 'Visão consolidada de todos os projetos homologados.'}
            </span>
          </div>

          <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            Exibindo <strong style={{ color: '#ffffff' }}>{filteredBoardProjects.length}</strong> de {boardFinancials.projects.length} projetos
          </span>
        </div>

        {/* Tabela de Projetos da Diretoria */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {filteredBoardProjects.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
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
            <table style={{ width: '100%', minWidth: '1300px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#070b14', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.25rem', minWidth: '260px' }}>Projeto Lean / Setor</th>
                  <th style={{ padding: '0.875rem 1rem', minWidth: '130px', whiteSpace: 'nowrap' }}>Especialista</th>
                  <th style={{ padding: '0.875rem 1rem', minWidth: '120px', whiteSpace: 'nowrap' }}>Homologação</th>
                  <th style={{ padding: '0.875rem 1.25rem', minWidth: '180px', whiteSpace: 'nowrap' }}>Vigência no Ano (365d)</th>
                  <th style={{ padding: '0.875rem 1rem', minWidth: '140px', textAlign: 'right', whiteSpace: 'nowrap' }}>Retorno Mensal (3M)</th>
                  <th style={{ padding: '0.875rem 1rem', minWidth: '160px', textAlign: 'right', whiteSpace: 'nowrap' }}>Resultado do Ano (12M)</th>
                  <th style={{ padding: '0.875rem 1rem', minWidth: '140px', textAlign: 'right', whiteSpace: 'nowrap' }}>Investimento (Capex)</th>
                  <th style={{ padding: '0.875rem 1rem', minWidth: '140px', textAlign: 'center', whiteSpace: 'nowrap' }}>Tempo de Payback</th>
                  <th style={{ padding: '0.875rem 1rem', minWidth: '130px', textAlign: 'center', whiteSpace: 'nowrap' }}>Totalizador</th>
                  <th style={{ padding: '0.875rem 1.25rem', minWidth: '85px', textAlign: 'right', whiteSpace: 'nowrap' }}>DRE</th>
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
                      <td style={{ padding: '1rem 1.25rem', minWidth: '260px' }}>
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
                              lineHeight: 1.35,
                            }}
                          >
                            {p.title}
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.35rem', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {p.protocol}
                            </span>
                            <span style={{ fontSize: '0.675rem', color: '#475569' }}>•</span>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>{p.sectorName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Responsável */}
                      <td style={{ padding: '1rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                          {p.responsibleName}
                        </span>
                      </td>

                      {/* Homologação */}
                      <td style={{ padding: '1rem 1rem', whiteSpace: 'nowrap' }}>
                        <div>
                          <span style={{ fontSize: '0.78125rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', display: 'block' }}>
                            {p.homologatedAt ? formatDate(p.homologatedAt) : 'Recentemente'}
                          </span>
                          <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem', whiteSpace: 'nowrap' }}>
                            {p.daysElapsed} dias decorridos
                          </span>
                        </div>
                      </td>

                      {/* Vigência no Ano (12 meses - SEM SOBREPOSIÇÃO) */}
                      <td style={{ padding: '1rem 1.25rem', minWidth: '180px', whiteSpace: 'nowrap' }}>
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
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Clock size={11} /> 12m Concluído (&gt; 365d)
                            </span>
                            <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                              Incorporado à rotina base
                            </span>
                          </div>
                        ) : (
                          <div style={{ width: '100%', maxWidth: '170px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem', whiteSpace: 'nowrap' }}>
                              <span
                                style={{
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 900,
                                  fontFamily: 'var(--font-mono)',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Mês {p.monthsElapsed} de 12
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap' }}>
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
                                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Retorno Mensal (3M) */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
                          <strong
                            style={{
                              color: p.isExpired ? '#94a3b8' : '#34d399',
                              fontSize: '0.9375rem',
                              fontFamily: 'var(--font-mono)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatCurrency(p.monthlyCostAvoided)}
                          </strong>
                          <span style={{ fontSize: '0.675rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>/mês (3M)</span>
                        </div>
                      </td>

                      {/* Resultado do Ano (12M) */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
                          <strong
                            style={{
                              color: p.isExpired ? '#94a3b8' : '#22d3ee',
                              fontSize: '0.9375rem',
                              fontFamily: 'var(--font-mono)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatCurrency(p.annualCostAvoided)}
                          </strong>
                          <span style={{ fontSize: '0.675rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>/ano (Computado)</span>
                        </div>
                      </td>

                      {/* Investimento (Capex) */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
                          <strong style={{ fontSize: '0.875rem', color: p.totalInvestmentCost > 0 ? '#f87171' : '#64748b', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                            {p.totalInvestmentCost > 0 ? formatCurrency(p.totalInvestmentCost) : 'R$ 0,00'}
                          </strong>
                          <span style={{ fontSize: '0.675rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {p.totalInvestmentCost > 0 ? 'Capex informado' : 'Custo Zero'}
                          </span>
                        </div>
                      </td>

                      {/* Tempo de Payback */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', whiteSpace: 'nowrap' }}>
                          {p.totalInvestmentCost === 0 ? (
                            <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                              ⚡ Imediato (0m)
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
                                whiteSpace: 'nowrap',
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
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ⚡ {p.paybackMonths} meses
                            </span>
                          )}
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem', whiteSpace: 'nowrap' }}>
                            Amortização
                          </span>
                        </div>
                      </td>

                      {/* Status no Totalizador */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {p.isExpired ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: '#94a3b8',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              display: 'inline-block',
                            }}
                          >
                            ⚪ Encerrado (Rotina)
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.675rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              display: 'inline-block',
                            }}
                          >
                            🟢 Computado no Total
                          </span>
                        )}
                      </td>

                      {/* Ação */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Link
                          href={`/admin/projetos/${p.actionId}`}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            whiteSpace: 'nowrap',
                            padding: '0.35rem 0.65rem',
                          }}
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

      {/* ================= CARDS DE APOIO OPERACIONAL ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <StatsCard
          title="Potencial em Andamento (Mensal)"
          value={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span>{formatCurrency(metrics.inProgressEstimatedCostAvoided ?? 0)}</span>
              <span style={{ fontSize: '0.95rem', color: '#22d3ee', fontWeight: 800 }}>/mês</span>
            </div>
          }
          subtitle={
            <div>
              <span style={{ display: 'block', color: '#cbd5e1', fontWeight: 600 }}>
                Projeção Anual: <strong style={{ color: '#22d3ee' }}>{formatCurrency((metrics.inProgressEstimatedCostAvoided ?? 0) * 12)}/ano (12m)</strong>
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                {metrics.inProgressActions + metrics.openActions + (metrics.waitingApprovalActions || 0)} projetos no pipeline ({metrics.waitingApprovalActions || 0} homologação, {metrics.inProgressActions} execução, {metrics.openActions} aberta)
              </span>
            </div>
          }
          icon={<TrendingUp size={22} />}
          accentColor="#06b6d4"
        />

        <StatsCard
          title="Total de Ações & Projetos"
          value={metrics.totalActions}
          subtitle={`${metrics.completedActions} concluídas (${boardFinancials.activeProjectsCount} no ano vigente) | ${metrics.inProgressActions + metrics.openActions + (metrics.waitingApprovalActions || 0)} no pipeline`}
          icon={<Kanban size={22} />}
          accentColor="#8b5cf6"
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
              {pctWaitingApproval > 0 && (
                <div
                  title={`Aguardando Homologação: ${metrics.waitingApprovalActions || 0} (${pctWaitingApproval}%)`}
                  style={{
                    width: `${pctWaitingApproval}%`,
                    backgroundColor: '#fbbf24',
                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
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

            {/* Micro-Badges Indicators (Todos os 5 Status do Pipeline) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span style={{ fontSize: '0.725rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                  Concluídas
                </span>
                <strong style={{ fontSize: '0.825rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  {metrics.completedActions} <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>({pctCompleted}%)</span>
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                <span style={{ fontSize: '0.725rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }} />
                  Homologação
                </span>
                <strong style={{ fontSize: '0.825rem', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  {metrics.waitingApprovalActions || 0} <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>({pctWaitingApproval}%)</span>
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <span style={{ fontSize: '0.725rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6', boxShadow: '0 0 6px #8b5cf6' }} />
                  Execução
                </span>
                <strong style={{ fontSize: '0.825rem', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                  {metrics.inProgressActions} <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>({pctInProgress}%)</span>
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                <span style={{ fontSize: '0.725rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4', boxShadow: '0 0 6px #06b6d4' }} />
                  Abertas
                </span>
                <strong style={{ fontSize: '0.825rem', color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                  {metrics.openActions} <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>({pctOpen}%)</span>
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#090e1a', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <span style={{ fontSize: '0.725rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  Recusadas
                </span>
                <strong style={{ fontSize: '0.825rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                  {metrics.rejectedActions} <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>({pctRejected}%)</span>
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

        {/* Painel 2: Lead Time dos Projetos Lean & Eficiência de Fluxo */}
        <div
          className="card"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.15rem',
            boxShadow: '0 8px 30px -10px rgba(56, 189, 248, 0.12)',
          }}
        >
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="#38bdf8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  Lead Time dos Projetos Lean
                </h3>
              </div>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                }}
              >
                Ciclo até Controladoria
              </span>
            </div>
            <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: 0 }}>
              Média temporal por etapa do PDCA e auditoria de dependências externas (sem os 3 meses de acompanhamento).
            </p>
          </div>

          {/* KPI Totalizadores Rápidos (Média Geral da Fábrica vs Tempo Próprio vs Espera Externa) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{ backgroundColor: '#090e1a', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Média Geral</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {leadTimeMetrics.overallAvgDays} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>dias</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#090e1a', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Tempo Agente</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {leadTimeMetrics.overallDirectDays} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>dias</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#090e1a', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div style={{ fontSize: '0.675rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>🛡️</span> Espera Ext.
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                {leadTimeMetrics.overallExternalWaitDays} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>dias</span>
              </div>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div style={{ display: 'flex', backgroundColor: '#090e1a', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={() => setLeadTimeTab('pdca')}
              style={{
                flex: 1,
                padding: '0.4rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: leadTimeTab === 'pdca' ? '#1e293b' : 'transparent',
                color: leadTimeTab === 'pdca' ? '#ffffff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: leadTimeTab === 'pdca' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              📊 Fases PDCA
            </button>
            <button
              type="button"
              onClick={() => setLeadTimeTab('agentes')}
              style={{
                flex: 1,
                padding: '0.4rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: leadTimeTab === 'agentes' ? '#1e293b' : 'transparent',
                color: leadTimeTab === 'agentes' ? '#ffffff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: leadTimeTab === 'agentes' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              👤 Especialistas
            </button>
            <button
              type="button"
              onClick={() => setLeadTimeTab('gargalos')}
              style={{
                flex: 1,
                padding: '0.4rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: leadTimeTab === 'gargalos' ? '#1e293b' : 'transparent',
                color: leadTimeTab === 'gargalos' ? '#fbbf24' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: leadTimeTab === 'gargalos' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🛡️ Gargalos Ext.
            </button>
          </div>

          {/* Conteúdo Aba 1: Fases PDCA */}
          {leadTimeTab === 'pdca' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Barra Segmentada PDCA */}
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  borderRadius: '9999px',
                  backgroundColor: '#090e1a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  overflow: 'hidden',
                }}
              >
                {leadTimeMetrics.pdcaStages.map((stage) => (
                  <div
                    key={stage.stage}
                    title={`${stage.label}: ${stage.avgDays} dias (${stage.pctOfTotal}%)`}
                    style={{
                      width: `${stage.pctOfTotal}%`,
                      backgroundColor: stage.color,
                      boxShadow: `0 0 6px ${stage.color}80`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                ))}
              </div>

              {/* Lista dos Estágios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {leadTimeMetrics.pdcaStages.map((stg) => (
                  <div key={stg.stage} style={{ backgroundColor: '#090e1a', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{stg.icon}</span> {stg.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: stg.color, fontFamily: 'var(--font-mono)' }}>
                          {stg.avgDays} d
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          ({stg.pctOfTotal}%)
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {stg.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conteúdo Aba 2: Por Especialista Lean */}
          {leadTimeTab === 'agentes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {leadTimeMetrics.agentSummaries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                  Nenhum especialista com projetos calculados.
                </div>
              ) : (
                leadTimeMetrics.agentSummaries.map((ag) => (
                  <div key={ag.agentId} style={{ backgroundColor: '#090e1a', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {ag.avatarUrl ? (
                          <img src={ag.avatarUrl} alt={ag.agentName} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff' }}>
                            {ag.agentName.charAt(0)}
                          </span>
                        )}
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff' }}>
                          {ag.agentName}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
                        {ag.totalProjects} {ag.totalProjects === 1 ? 'proj.' : 'proj.'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#94a3b8' }}>Lead Time Médio:</span>
                      <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{ag.avgTotalDays} dias</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: '#cbd5e1' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ color: '#34d399' }}>● Tempo Próprio: {ag.agentDirectDays}d</span>
                      </span>
                      <span style={{ color: '#fbbf24' }}>
                        ● Espera Externa: {ag.avgExternalWaitDays}d
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.7rem' }}>
                      <span style={{ color: '#94a3b8' }}>Eficiência de Fluxo Direto:</span>
                      <span style={{ fontWeight: 800, color: ag.efficiencyPercentage >= 70 ? '#34d399' : '#fbbf24' }}>
                        {ag.efficiencyPercentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Conteúdo Aba 3: Gargalos Setoriais (Defesa do Agente) */}
          {leadTimeTab === 'gargalos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ fontSize: '0.725rem', color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Defesa do Agente:</strong> Audita o impacto de setores terceiros no cronograma, demonstrando atrasos alheios ao Especialista Lean.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                {leadTimeMetrics.sectorBottlenecks.map((sec, idx) => (
                  <div key={idx} style={{ backgroundColor: '#090e1a', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#ffffff' }}>
                        🏢 {sec.sectorName}
                      </span>
                      <strong style={{ fontSize: '0.8rem', color: sec.color, fontFamily: 'var(--font-mono)' }}>
                        +{sec.avgWaitDays} dias / tarefa
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>
                      <span>Demandas terceiras: {sec.totalTasks}</span>
                      <span>Total de retenção: <strong style={{ color: '#ffffff' }}>{sec.totalWaitDays} dias</strong></span>
                      {sec.pendingTasks > 0 && (
                        <span style={{ color: '#f87171', fontWeight: 700 }}>{sec.pendingTasks} em fila</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Média de Resposta Controladoria:</span>
            <strong style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {leadTimeMetrics.controladoriaAvgResponseDays} dias
            </strong>
          </div>
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
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>No Pipeline</th>
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
