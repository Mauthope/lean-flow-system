'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Sector } from '@/lib/types';
import { SectorModal } from '@/components/forms/SectorModal';
import { SectorAssessmentDetailView } from '@/components/assessment/SectorAssessmentDetailView';
import { SectorAssessmentModal } from '@/components/assessment/SectorAssessmentModal';
import { SectorCardPolygon } from '@/components/charts/SectorCardPolygon';
import { Modal } from '@/components/ui/Modal';
import { Building2, Plus, Edit2, Trash2, Layers, CheckCircle2, Award, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSetoresPage() {
  const { dataVersion, refreshData } = useAuth();
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assessmentSector, setAssessmentSector] = useState<Sector | null>(null);
  const [directAuditSector, setDirectAuditSector] = useState<Sector | null>(null);

  const sectors = useMemo(() => {
    return dataService.getSectors();
  }, [dataVersion]);

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  const handleCreateNew = () => {
    setSelectedSector(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sec: Sector) => {
    setSelectedSector(sec);
    setIsModalOpen(true);
  };

  const handleDelete = (sec: Sector) => {
    if (confirm(`Tem certeza que deseja excluir o setor ${sec.name}?`)) {
      dataService.deleteSector(sec.id);
      refreshData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Gestão & Cadastro de Setores
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Estruture os departamentos da organização para canalização de fluxo Lean, Lean Assessment e alocação de agentes
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Cadastrar Novo Setor
        </button>
      </div>

      {/* Sectors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {sectors.map((sec) => {
          const stats = metrics.bySector.find((s) => s.sectorId === sec.id);
          const latestAssessment = dataService.getLatestSectorAssessment(sec.id);

          return (
            <div
              key={sec.id}
              onClick={() => setAssessmentSector(sec)}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderLeft: `5px solid ${sec.color || '#06b6d4'}`,
                backgroundColor: '#090d16',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Clique para visualizar o Lean Assessment & Radar de Maturidade"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
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
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid #10b981',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Maturidade Lean aferida no último Gemba Walk"
                    >
                      <Award size={12} /> {latestAssessment.overallScore}% (Nível {latestAssessment.overallLevel})
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Sem Assessment</span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
                  {sec.name}
                </h3>

                <p style={{ fontSize: '0.775rem', color: '#94a3b8', marginBottom: '0.75rem', minHeight: '34px' }}>
                  {sec.description || 'Setor fabril cadastrado para alocação de ações Kaizen.'}
                </p>

                {/* POLÍGONO DE MATURIDADE DO SETOR (RADAR SVG COMPACTO) */}
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.45)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '0.65rem 0.5rem',
                    marginBottom: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SectorCardPolygon
                    assessment={latestAssessment}
                    sectorColor={sec.color || '#10b981'}
                    width={260}
                    height={185}
                  />
                </div>

                {/* Avoided cost snippet */}
                {stats && stats.costAvoided > 0 && (
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 600 }}>
                      Custo Evitado pelo Setor:
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#34d399' }}>
                      {formatCurrency(stats.costAvoided)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '0.875rem',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssessmentSector(sec);
                  }}
                  className="btn btn-sm btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}
                  title="Abrir Gráfico de Radar e Avaliação Lean"
                >
                  <Award size={14} /> Lean Assessment
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(sec);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Edit2 size={13} /> Editar
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sec);
                    }}
                    className="btn btn-outline-danger btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    title="Excluir Setor"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sector Modal (Cadastro/Edição) */}
      <SectorModal
        sector={selectedSector}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
        onStartAssessment={(sec) => {
          setIsModalOpen(false);
          setDirectAuditSector(sec);
        }}
      />

      {/* Modal de Detalhamento do Lean Assessment */}
      {assessmentSector && (
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
                  Lean Assessment & Radar de Maturidade — {assessmentSector.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Visão executiva do Gestor Master com comparativo evolutivo
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAssessmentSector(null)}
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
              sector={assessmentSector}
              onNewAssessmentCreated={() => {
                refreshData();
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de Auditoria Direta disparada pelo formulário do setor */}
      {directAuditSector && (
        <SectorAssessmentModal
          sector={directAuditSector}
          isOpen={true}
          onClose={() => setDirectAuditSector(null)}
          onSaved={() => {
            setDirectAuditSector(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
