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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Minhas Entregas & Impacto Lean
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Consolidado do seu histórico de melhorias, economia gerada para a empresa e horas otimizadas
        </p>
      </div>

      {/* Hero Stats */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
            Seu Custo Evitado Homologado
          </span>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>
            {formatCurrency(myTotalCostAvoided)}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Horas Economizadas
          </span>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {myTotalHours}h
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
            Taxa de Eficiência de Entregas
          </span>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.25rem' }}>
            {efficiency}%
          </p>
        </div>
      </div>

      {/* Lean Explanation Box */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
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
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            💡 O que significam suas métricas de Horas & Custo Evitado?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#334155', marginTop: '0.35rem', lineHeight: 1.45, maxWidth: '750px' }}>
            As <strong>Horas Economizadas ({myTotalHours}h)</strong> representam a capacidade produtiva e tempo de ciclo liberados
            com suas padronizações (SOP) e melhorias. O <strong>Custo Evitado ({formatCurrency(myTotalCostAvoided)})</strong> é
            o retorno financeiro real gerado pela eliminação de retrabalhos, setups longos e refugos.
          </p>
        </div>

        <a
          href="/agente/ferramentas"
          className="btn btn-primary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          Acessar Ferramentas Lean & Calculadora →
        </a>
      </div>

      {/* Completed Actions Table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Histórico das Suas Ações Concluídas
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.875rem 1.25rem' }}>Protocolo / Título</th>
                <th style={{ padding: '0.875rem 1rem' }}>Desperdício</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Custo Evitado Real</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Horas Salvas</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>Data de Conclusão</th>
              </tr>
            </thead>
            <tbody>
              {completed.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    Nenhuma ação concluída ainda.
                  </td>
                </tr>
              ) : (
                completed.map((action) => (
                  <tr
                    key={action.id}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <Link href={`/agente/projetos/${action.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: '#64748b' }}>
                          {action.protocol}
                        </span>
                        <p style={{ fontWeight: 700, color: '#2563eb', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {action.title} <ChevronRight size={14} />
                        </p>
                      </Link>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>
                      {WASTE_CATEGORIES[action.wasteCategory]?.label || action.wasteCategory}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                      {formatCurrency(action.actualCostAvoided)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                      {action.hoursSaved ? `${action.hoursSaved}h` : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                      {formatDateTime(action.completedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
