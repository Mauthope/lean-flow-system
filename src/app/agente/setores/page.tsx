'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Sector } from '@/lib/types';
import { SectorAssessmentDetailView } from '@/components/assessment/SectorAssessmentDetailView';
import { Building2, Award, TrendingUp, Layers, ChevronRight, CheckCircle2, Wrench, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AgentSetoresPage() {
  const { dataVersion, refreshData } = useAuth();

  const sectors = useMemo(() => {
    return dataService.getSectors();
  }, [dataVersion]);

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  // Setor selecionado para visualização do Lean Assessment
  const [selectedSectorId, setSelectedSectorId] = useState<string>(
    sectors.length > 0 ? sectors[0].id : ''
  );

  const selectedSector = useMemo(() => {
    return sectors.find((s) => s.id === selectedSectorId) || sectors[0];
  }, [sectors, selectedSectorId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Cabeçalho da Página */}
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
            🏢
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Gestão dos Setores & Lean Assessment
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
          Diagnóstico de maturidade operacional, auditorias de Gemba Walk e comparativo evolutivo das 6 Dimensões Lean
        </p>
      </div>

      {/* Grid de Seletor Rápido de Setores com Badges de Maturidade */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
          Selecione o Setor para Análise de Maturidade:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {sectors.map((sec) => {
            const isSelected = sec.id === selectedSector?.id;
            const stats = metrics.bySector.find((s) => s.sectorId === sec.id);
            const latestAssessment = dataService.getLatestSectorAssessment(sec.id);

            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSectorId(sec.id)}
                className="card"
                style={{
                  padding: '1.15rem 1.25rem',
                  cursor: 'pointer',
                  borderLeft: `5px solid ${sec.color || '#06b6d4'}`,
                  borderTop: isSelected ? '1.5px solid #22d3ee' : '1.5px solid rgba(255, 255, 255, 0.08)',
                  borderRight: isSelected ? '1.5px solid #22d3ee' : '1.5px solid rgba(255, 255, 255, 0.08)',
                  borderBottom: isSelected ? '1.5px solid #22d3ee' : '1.5px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.08)' : '#090d16',
                  boxShadow: isSelected ? '0 0 20px rgba(34, 211, 238, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: `${sec.color || '#06b6d4'}22`,
                        color: sec.color || '#22d3ee',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        border: `1px solid ${sec.color || '#06b6d4'}44`,
                      }}
                    >
                      {sec.code}
                    </span>

                    {latestAssessment ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid #10b981',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Award size={12} /> {latestAssessment.overallScore}% • N{latestAssessment.overallLevel}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.675rem', color: '#64748b' }}>Sem Avaliação</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isSelected ? '#22d3ee' : '#ffffff', margin: '0.2rem 0' }}>
                    {sec.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.6rem' }}>
                  <span>{stats?.count || 0} ações Kaizen</span>
                  {stats && stats.costAvoided > 0 && (
                    <strong style={{ color: '#34d399' }}>{formatCurrency(stats.costAvoided)}</strong>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visualização Detalhada do Lean Assessment do Setor Selecionado */}
      {selectedSector && (
        <SectorAssessmentDetailView
          sector={selectedSector}
          onNewAssessmentCreated={refreshData}
        />
      )}
    </div>
  );
}
