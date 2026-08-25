'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { formatCurrency, formatDateTime, WASTE_CATEGORIES } from '@/lib/utils';
import { Award, CheckCircle2, Clock, DollarSign, TrendingUp, ChevronRight } from 'lucide-react';

export default function AgenteRelatorioPessoalPage() {
  const { currentUser, dataVersion } = useAuth();

  const myActions = useMemo(() => {
    if (!currentUser) return [];
    return dataService.getActions().filter((a) => a.assignedAgentId === currentUser.id);
  }, [currentUser, dataVersion]);

  const completed = myActions.filter((a) => a.status === 'concluida');
  const myTotalCostAvoided = completed.reduce((acc, a) => acc + (a.actualCostAvoided || 0), 0);
  const myTotalHours = myActions.reduce((acc, a) => acc + (a.hoursSaved || 0), 0);
  const efficiency = myActions.length > 0 ? Math.round((completed.length / myActions.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
          Minhas Entregas & Impacto Lean
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
          Consolidado do seu histórico de melhorias, economia gerada para a empresa e horas otimizadas
        </p>
      </div>

      {/* Hero Stats */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
            Seu Custo Evitado Homologado
          </span>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
            {formatCurrency(myTotalCostAvoided)}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
            Horas Economizadas
          </span>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
            {myTotalHours}h
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase' }}>
            Taxa de Eficiência de Entregas
          </span>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: '#22d3ee', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
            {efficiency}%
          </p>
        </div>
      </div>

      {/* Lean Explanation Box */}
      <div
        style={{
          backgroundColor: '#090e1a',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-heading)' }}>
            💡 O que significam suas métricas de Horas & Custo Evitado?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.45, maxWidth: '750px' }}>
            As <strong style={{ color: '#ffffff' }}>Horas Economizadas ({myTotalHours}h)</strong> representam a capacidade produtiva e tempo de ciclo liberados
            com suas padronizações (SOP) e melhorias. O <strong style={{ color: '#34d399' }}>Custo Evitado ({formatCurrency(myTotalCostAvoided)})</strong> é
            o retorno financeiro real gerado pela eliminação de retrabalhos, setups longos e refugos.
          </p>
        </div>

        <Link
          href="/agente/ferramentas"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.4)' }}
        >
          <span>Abrir Ferramentas Lean</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* List of My Actions */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
          Histórico de Projetos & Ações Realizadas
        </h3>

        {myActions.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Você ainda não possui ações atribuídas ao seu usuário.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myActions.map((action) => {
              const waste = WASTE_CATEGORIES[action.wasteCategory];
              const isConcluded = action.status === 'concluida';

              return (
                <div
                  key={action.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: '#090e1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          color: '#22d3ee',
                        }}
                      >
                        {action.protocol}
                      </span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 800,
                          backgroundColor: isConcluded ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                          color: isConcluded ? '#34d399' : '#22d3ee',
                          border: `1px solid ${isConcluded ? 'rgba(16, 185, 129, 0.35)' : 'rgba(6, 182, 212, 0.35)'}`,
                        }}
                      >
                        {isConcluded ? 'Concluída' : 'Em Andamento'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {action.title}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      ⚡ Desperdício: {waste?.label || action.wasteCategory} • Setor: {action.originSectorName}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {isConcluded ? 'Custo Evitado Real' : 'Estimativa Inicial'}
                    </span>
                    <p
                      style={{
                        fontSize: '1rem',
                        fontWeight: 900,
                        color: isConcluded ? '#34d399' : '#ffffff',
                        margin: '0.1rem 0 0',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {formatCurrency(isConcluded ? action.actualCostAvoided : action.estimatedCostAvoided)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
