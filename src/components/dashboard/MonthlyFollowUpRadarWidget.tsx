'use client';

import React, { useState, useMemo } from 'react';
import { dataService } from '@/services/dataService';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  Info,
  DollarSign,
  User,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

interface MonthlyFollowUpRadarWidgetProps {
  tenantId?: string;
  initialMonth?: number;
}

export const MonthlyFollowUpRadarWidget: React.FC<MonthlyFollowUpRadarWidgetProps> = ({
  tenantId,
  initialMonth = 4,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false);

  const pipeline = useMemo(() => {
    return dataService.getMonthlyFollowUpPipeline(tenantId, selectedMonth);
  }, [tenantId, selectedMonth]);

  const monthOptions = [
    { num: 1, name: 'Mês 1 (Janeiro)' },
    { num: 2, name: 'Mês 2 (Fevereiro)' },
    { num: 3, name: 'Mês 3 (Março)' },
    { num: 4, name: 'Mês 4 (Abril)' },
    { num: 5, name: 'Mês 5 (Maio)' },
    { num: 6, name: 'Mês 6 (Junho)' },
    { num: 7, name: 'Mês 7 (Julho)' },
    { num: 8, name: 'Mês 8 (Agosto)' },
    { num: 9, name: 'Mês 9 (Setembro)' },
    { num: 10, name: 'Mês 10 (Outubro)' },
    { num: 11, name: 'Mês 11 (Novembro)' },
    { num: 12, name: 'Mês 12 (Dezembro)' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#090e1a',
        border: '1.5px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 800,
                backgroundColor: 'rgba(6, 182, 212, 0.18)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Ciclo Real de 12 Meses • Governança Fabril
            </span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Radar de Fechamento Mensal & Pipeline de Entrada
          </h3>
          <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
            Comparativo em tempo real de projetos com medição já homologada versus valores pendentes de inserção
          </p>
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Competência:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '8px',
              color: '#22d3ee',
              fontWeight: 800,
              fontSize: '0.8125rem',
              padding: '0.4rem 0.75rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {monthOptions.map((m) => (
              <option key={m.num} value={m.num} style={{ backgroundColor: '#090e1a', color: '#ffffff' }}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Metric Cards: Realizado, Pendente a Entrar, Potencial Total */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* 1. Realizado em Caixa */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
              ✓ Realizado em Caixa
            </span>
            <CheckCircle2 size={16} color="#34d399" />
          </div>
          <p style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(pipeline.confirmedValue)}
          </p>
          <span style={{ fontSize: '0.725rem', color: '#cbd5e1', marginTop: '0.25rem', display: 'block' }}>
            <strong>{pipeline.reportedProjectsCount}</strong> de {pipeline.totalEligibleProjects} projetos apurados
          </span>
        </div>

        {/* 2. Projeção a Entrar (Pendente) */}
        <div
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>
              ⏳ Projeção a Entrar
            </span>
            <Hourglass size={16} color="#facc15" />
          </div>
          <p style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fde047', margin: 0, fontFamily: 'var(--font-mono)' }}>
            ~ {formatCurrency(pipeline.pendingEstimatedValue)}
          </p>
          <span style={{ fontSize: '0.725rem', color: '#cbd5e1', marginTop: '0.25rem', display: 'block' }}>
            <strong>{pipeline.pendingProjectsCount}</strong> projeto(s) a reportar no mês
          </span>
        </div>

        {/* 3. Potencial Total do Mês */}
        <div
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase' }}>
              📈 Potencial Total
            </span>
            <TrendingUp size={16} color="#22d3ee" />
          </div>
          <p style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(pipeline.totalPotentialValue)}
          </p>
          <span style={{ fontSize: '0.725rem', color: '#cbd5e1', marginTop: '0.25rem', display: 'block' }}>
            100% da carteira de sustentação
          </span>
        </div>
      </div>

      {/* Barra de Progresso do Fechamento */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
            Taxa de Fechamento de {pipeline.monthLabel}:
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: pipeline.completionPercentage >= 90 ? '#34d399' : '#facc15' }}>
            {pipeline.completionPercentage}% ({pipeline.reportedProjectsCount}/{pipeline.totalEligibleProjects} apurados)
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${pipeline.completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)',
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Aviso Dinâmico com a Projeção em Reais que falta entrar */}
      {pipeline.pendingProjectsCount > 0 ? (
        <div
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={18} color="#facc15" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.8125rem', color: '#fde047', display: 'block', marginBottom: '0.2rem' }}>
              Valores Sujeitos a Alteração • Projeção de Entrada Estimada
            </strong>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
              No mês de <strong>{pipeline.monthLabel}</strong>, de {pipeline.totalEligibleProjects} projetos ativos com ganho, apenas{' '}
              <strong style={{ color: '#34d399' }}>{pipeline.reportedProjectsCount}</strong> foram confirmados. Restam{' '}
              <strong style={{ color: '#facc15' }}>{pipeline.pendingProjectsCount} projetos</strong> a serem informados pelos agentes.
              O valor financeiro global deste mês aumentará em aproximadamente{' '}
              <strong style={{ color: '#fde047' }}>~ {formatCurrency(pipeline.pendingEstimatedValue)}</strong> assim que esses relatórios forem inseridos.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <CheckCircle2 size={18} color="#34d399" />
          <span style={{ fontSize: '0.78125rem', color: '#dcfce7', fontWeight: 600 }}>
            Fechamento de <strong>{pipeline.monthLabel}</strong> 100% concluído! Todos os projetos foram devidamente alimentados pelos agentes.
          </span>
        </div>
      )}

      {/* Botão para Expandir / Recolher Gaveta de Projetos Pendentes */}
      {pipeline.pendingProjectsCount > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.5rem',
              fontSize: '0.75rem',
              color: '#22d3ee',
              borderColor: 'rgba(6, 182, 212, 0.3)',
            }}
          >
            <span>
              {isListExpanded
                ? 'Ocultar Projetos Pendentes de Informação'
                : `Ver ${pipeline.pendingProjectsCount} Projetos Pendentes de Informação em ${pipeline.monthLabel}`}
            </span>
            {isListExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {/* Gaveta Expansível */}
          {isListExpanded && (
            <div
              style={{
                marginTop: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                Projetos aguardando dados operacionais de {pipeline.monthLabel}:
              </span>

              {pipeline.pendingProjects.map((proj) => (
                <div
                  key={proj.actionId}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#22d3ee', backgroundColor: 'rgba(6, 182, 212, 0.15)', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                        {proj.actionCode || 'KAIZEN'}
                      </span>
                      <strong style={{ fontSize: '0.84375rem', color: '#ffffff' }}>
                        {proj.actionTitle}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.725rem', color: '#94a3b8' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={12} /> {proj.agentName}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Building2 size={12} /> {proj.sectorName}
                      </span>
                      <span style={{ color: '#facc15', fontWeight: 700 }}>
                        Estimado a entrar: ~ {formatCurrency(proj.estimatedMonthlyValue)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/projetos/${proj.actionId}`}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '0.725rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: '#22d3ee',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Ver Projeto</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
