'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Sector } from '@/lib/types';
import { SectorModal } from '@/components/forms/SectorModal';
import { Building2, Plus, Edit2, Trash2, Layers, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSetoresPage() {
  const { dataVersion, refreshData } = useAuth();
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Gestão & Cadastro de Setores
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Estruture os departamentos da organização para canalização de fluxo Lean e alocação de agentes
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {sectors.map((sec) => {
          const stats = metrics.bySector.find((s) => s.sectorId === sec.id);

          return (
            <div
              key={sec.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderLeft: `5px solid ${sec.color || '#2563eb'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: `${sec.color || '#2563eb'}18`,
                      color: sec.color || '#2563eb',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      border: `1px solid ${sec.color || '#2563eb'}33`,
                    }}
                  >
                    {sec.code}
                  </span>

                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {stats?.count || 0} ações vinculadas
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                  {sec.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                  {sec.description || 'Departamento operacional da planta.'}
                </p>

                {/* Avoided cost snippet */}
                {stats && stats.costAvoided > 0 && (
                  <div
                    style={{
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '0.625rem 0.75rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>
                      Custo Evitado pelo Setor:
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#047857' }}>
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
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.875rem',
                }}
              >
                <button
                  onClick={() => handleEdit(sec)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Edit2 size={13} /> Editar Setor
                </button>

                <button
                  onClick={() => handleDelete(sec)}
                  className="btn btn-outline-danger btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Excluir Setor"
                >
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sector Modal */}
      <SectorModal
        sector={selectedSector}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
