'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Sector } from '@/lib/types';
import { SectorCardPolygon } from '@/components/charts/SectorCardPolygon';
import { SectorAssessmentModal } from '@/components/assessment/SectorAssessmentModal';
import { SectorAssessmentDetailView } from '@/components/assessment/SectorAssessmentDetailView';
import { Building2, Award, TrendingUp, Sparkles, X, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AgentSetoresPage() {
  const { dataVersion, refreshData } = useAuth();

  const sectors = useMemo(() => {
    return dataService.getSectors();
  }, [dataVersion]);

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  // Setor para auditoria direta imediata
  const [assessmentSector, setAssessmentSector] = useState<Sector | null>(null);

  // Setor para visualização do diagnóstico detalhado e histórico
  const [detailSector, setDetailSector] = useState<Sector | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Cabeçalho da Página */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(34, 211, 238, 0.15)',
                border: '1.5px solid #22d3ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              📊
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Polígonos de Maturidade Lean por Setor
            </h2>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
            Visão ampla da estabilidade fabril. Clique em qualquer setor para iniciar imediatamente o Lean Assessment de Gemba Walk.
          </p>
        </div>

        {/* Resumo Rápido da Fábrica */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
              Setores Fabris
            </span>
            <strong style={{ fontSize: '1.1rem', color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
              {sectors.length}
            </strong>
          </div>
          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <div>
            <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
              Custo Evitado Total
            </span>
            <strong style={{ fontSize: '1.1rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(metrics.totalActualCostAvoided || metrics.totalEstimatedCostAvoided || 0)}
            </strong>
          </div>
        </div>
      </div>

      {/* Grid de Polígonos de Maturidade Lean (Um Polígono por Setor) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.35rem' }}>
        {sectors.map((sec) => {
          const stats = metrics.bySector.find((s) => s.sectorId === sec.id);
          const latestAssessment = dataService.getLatestSectorAssessment(sec.id);

          return (
            <div
              key={sec.id}
              onClick={() => setAssessmentSector(sec)}
              className="card"
              style={{
                padding: '1.35rem',
                cursor: 'pointer',
                borderLeft: `5px solid ${sec.color || '#06b6d4'}`,
                backgroundColor: '#090d16',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                position: 'relative',
              }}
              title={`Clique para abrir o Assessment Gemba de ${sec.name}`}
            >
              {/* Header do Card */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: `${sec.color || '#06b6d4'}22`,
                      color: sec.color || '#22d3ee',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      border: `1px solid ${sec.color || '#06b6d4'}44`,
                    }}
                  >
                    {sec.code}
                  </span>

                  {latestAssessment ? (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid #10b981',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title="Maturidade Lean aferida no último Gemba Walk"
                    >
                      <Award size={13} /> {latestAssessment.overallScore}% • Nível {latestAssessment.overallLevel}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      Sem Auditoria
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0 0.25rem 0' }}>
                  {sec.name}
                </h3>
                <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: 0, minHeight: '34px', lineHeight: 1.4 }}>
                  {sec.description || 'Setor produtivo cadastrado para acompanhamento Lean.'}
                </p>
              </div>

              {/* POLÍGONO DE MATURIDADE DO SETOR (RADAR SVG COMPACTO) */}
              <div
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '0.75rem 0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SectorCardPolygon
                  assessment={latestAssessment}
                  sectorColor={sec.color || '#10b981'}
                  width={260}
                  height={190}
                />
              </div>

              {/* Destaques e Gargalos */}
              {latestAssessment?.senseiDiagnosis && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.725rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399' }}>
                    <span style={{ fontWeight: 800 }}>★ Forte:</span>
                    <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {latestAssessment.senseiDiagnosis.strongestDimension} ({latestAssessment.senseiDiagnosis.strongestScore}%)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24' }}>
                    <span style={{ fontWeight: 800 }}>▲ Gargalo:</span>
                    <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {latestAssessment.senseiDiagnosis.criticalBottleneck} ({latestAssessment.senseiDiagnosis.bottleneckScore}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Botões de Ação Direta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssessmentSector(sec);
                  }}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    fontWeight: 900,
                    padding: '0.65rem 1rem',
                    fontSize: '0.825rem',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Award size={15} /> Realizar Assessment Gemba
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailSector(sec);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                  }}
                >
                  <TrendingUp size={13} /> Ver Radar & Diagnóstico Completo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE ASSESSMENT GEMBA DIRETO (Sem intermediação) */}
      {assessmentSector && (
        <SectorAssessmentModal
          sector={assessmentSector}
          isOpen={true}
          onClose={() => setAssessmentSector(null)}
          onSaved={() => {
            setAssessmentSector(null);
            refreshData();
          }}
        />
      )}

      {/* MODAL DE DIAGNÓSTICO DETALHADO & HISTÓRICO */}
      {detailSector && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '1040px',
              maxHeight: '94vh',
              overflowY: 'auto',
              padding: '1.75rem',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                  Lean Assessment & Radar de Maturidade — {detailSector.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Diagnóstico completo com histórico de auditorias, deltas e impressão de relatório
                </span>
              </div>

              <button
                type="button"
                onClick={() => setDetailSector(null)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.4rem',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <SectorAssessmentDetailView
              sector={detailSector}
              onNewAssessmentCreated={() => {
                refreshData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
