'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { StatsCard } from '@/components/ui/StatsCard';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Clock, DollarSign, Kanban, UserCheck } from 'lucide-react';

import { DeadlineMonitoringPanel } from '@/components/monitoring/DeadlineMonitoringPanel';

export default function AgenteKanbanPage() {
  const { currentUser, dataVersion, refreshData } = useAuth();

  // Strictly filter only this agent's actions
  const myActions = useMemo(() => {
    if (!currentUser) return [];
    const all = dataService.getActions();
    return all.filter((a) => a.assignedAgentId === currentUser.id);
  }, [currentUser, dataVersion]);

  // Agent stats
  const completed = myActions.filter((a) => a.status === 'concluida');
  const inProgress = myActions.filter((a) => a.status === 'em_andamento');
  const myActualCostAvoided = completed.reduce((acc, a) => acc + (a.actualCostAvoided || 0), 0);
  const myHoursSaved = myActions.reduce((acc, a) => acc + (a.hoursSaved || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Agent Welcome & Scope Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
            alt={currentUser?.name || 'Agent'}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #34d399',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(52, 211, 153, 0.25)',
                  color: '#a7f3d0',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '9999px',
                }}
              >
                MEU POSTO DE TRABALHO
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
              Olá, {currentUser?.name || 'Agente Lean'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#d1fae5' }}>
              Setor: <strong>{currentUser?.sectorName || 'Geral'}</strong> | Apenas ações atribuídas a você estão visíveis.
            </p>
          </div>
        </div>

        {/* Quick Personal Metric */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '0.875rem 1.25rem', borderRadius: '12px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 600 }}>
            Seu Custo Evitado Gerado
          </span>
          <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
            {formatCurrency(myActualCostAvoided)}
          </p>
        </div>
      </div>

      {/* Mini Agent KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatsCard
          title="Minhas Ações Atribuídas"
          value={myActions.length}
          subtitle="Carga de trabalho total"
          icon={<Kanban size={20} />}
          accentColor="#2563eb"
        />

        <StatsCard
          title="Em Execução"
          value={inProgress.length}
          subtitle="Projetos em andamento ativo"
          icon={<Clock size={20} />}
          accentColor="#f59e0b"
        />

        <StatsCard
          title="Entregas Concluídas"
          value={completed.length}
          subtitle="Ações finalizadas com ROI"
          icon={<CheckCircle2 size={20} />}
          accentColor="#10b981"
        />

        <StatsCard
          title="Horas Salvas por Você"
          value={`${myHoursSaved}h`}
          subtitle="Produtividade gerada"
          icon={<DollarSign size={20} />}
          accentColor="#059669"
        />
      </div>

      {/* Card Gamificado da Academia Lean & Recompensas */}
      {(() => {
        const readArticles = currentUser ? dataService.getAgentReadArticles(currentUser.id) : [];
        const latestExam = currentUser ? dataService.getAgentLatestExam(currentUser.id) : undefined;
        const totalArts = 8;
        const readPercent = Math.round((readArticles.length / totalArts) * 100);

        return (
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  border: '1.5px solid #a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}
              >
                🎓
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                  <span style={{ fontSize: '0.675rem', fontWeight: 800, backgroundColor: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#c084fc', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>
                    ACADEMIA LEAN
                  </span>
                  <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                    • Novos artigos sobre 5S, SMED, Poka-Yoke e 8 Desperdícios
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Capacitação Kaizen & Certificação com Recompensa
                </h3>
                <p style={{ fontSize: '0.78125rem', color: '#cbd5e1', margin: '0.2rem 0 0' }}>
                  {latestExam?.passed
                    ? '🏆 Parabéns! Você conquistou o Selo Especialista Lean e está apto a receber sua recompensa.'
                    : `Você leu ${readArticles.length} de ${totalArts} artigos (${readPercent}%). Complete os estudos e faça a prova para garantir sua recompensa!`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href="/agente/ferramentas"
                className="btn btn-primary btn-sm"
                style={{
                  fontWeight: 800,
                  padding: '0.55rem 1.25rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                }}
              >
                <span>Acessar Academia & Artigos</span>
              </Link>
            </div>
          </div>
        );
      })()}

      {/* Central de Prazos & Atenção (Apenas ações e etapas do próprio agente) */}
      <DeadlineMonitoringPanel
        agentId={currentUser?.id}
        agentName={currentUser?.name}
        isAdmin={false}
        warningDaysThreshold={3}
      />

      {/* Restricted Agent Kanban Board */}
      <KanbanBoard
        actions={myActions}
        onRefresh={refreshData}
        isAgentView={true}
      />
    </div>
  );
}
