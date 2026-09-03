'use client';

import React, { useState, useEffect } from 'react';
import { Sector } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { SectorAssessmentModal } from '@/components/assessment/SectorAssessmentModal';
import { LeanAssessmentMethodologyDefense } from '@/components/assessment/LeanAssessmentMethodologyDefense';
import { Building2, Trash2, Award, Sparkles, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SectorModalProps {
  sector: Sector | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onStartAssessment?: (sector: Sector) => void;
}

export const SectorModal: React.FC<SectorModalProps> = ({
  sector,
  isOpen,
  onClose,
  onSuccess,
  onStartAssessment,
}) => {
  const { currentTenant } = useAuth();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  useEffect(() => {
    if (sector) {
      setName(sector.name);
      setCode(sector.code);
      setDescription(sector.description || '');
      setColor(sector.color || '#06b6d4');
    } else {
      setName('');
      setCode('');
      setDescription('');
      setColor('#06b6d4');
    }
  }, [sector, isOpen]);

  const latestAssessment = sector ? dataService.getLatestSectorAssessment(sector.id) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTenant = currentTenant || dataService.getCurrentTenant();
    const tenantId = activeTenant?.id || 'tenant_rafitec_01';

    if (sector) {
      dataService.updateSector(sector.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        color,
      });
    } else {
      dataService.createSector({
        tenantId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        color,
      });
    }

    onSuccess();
    onClose();
  };

  const handleDelete = () => {
    if (!sector) return;
    if (confirm(`Tem certeza que deseja excluir o setor ${sector.name}?`)) {
      dataService.deleteSector(sector.id);
      onSuccess();
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={sector ? `Gestão do Setor — ${sector.name}` : 'Cadastrar Novo Setor'}
        subtitle="Estruture os departamentos fabris, parâmetros de fluxo e auditorias de maturidade Lean"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Dados Principais do Setor */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Nome do Setor:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Extrusão & Fiação PP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Sigla / Código:</label>
              <input
                type="text"
                className="form-control"
                placeholder="EXT"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Descrição Operacional & Equipamentos:</label>
            <textarea
              rows={2}
              className="form-control"
              placeholder="Descreva as principais máquinas, postos de trabalho e processos atendidos neste setor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Cor de Identificação Visual no Gemba:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent' }}
              />
              <input
                type="text"
                className="form-control"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '120px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* Seção Exclusiva: Lean Assessment do Setor & Acesso Direto */}
          {sector && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.18)',
                    border: '1.5px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                  }}
                >
                  🏆
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                      Lean Assessment de Maturidade Operacional
                    </h4>
                    {latestAssessment && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(16, 185, 129, 0.25)',
                          color: '#34d399',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '6px',
                          border: '1px solid #10b981',
                        }}
                      >
                        {latestAssessment.overallScore}% • Nível {latestAssessment.overallLevel}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {latestAssessment
                      ? `Última auditoria realizada por ${latestAssessment.evaluatorName}. Clique para abrir um novo ciclo no Gemba.`
                      : 'Nenhuma auditoria realizada ainda. Inicie o primeiro diagnóstico no chão de fábrica.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onStartAssessment) {
                    onStartAssessment(sector);
                  } else {
                    setIsAssessmentModalOpen(true);
                  }
                }}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Award size={15} /> Realizar Novo Assessment Gemba
              </button>
            </div>
          )}

          {/* Campo Expansível: Defesa da Metodologia Aplicada & Memorial de Cálculo */}
          <LeanAssessmentMethodologyDefense defaultExpanded={false} />

          {/* Botões de Exclusão & Ação */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '1rem',
            }}
          >
            {sector ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-outline-danger btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Trash2 size={14} /> Excluir Setor
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {sector ? 'Salvar Alterações' : 'Cadastrar Setor'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de Novo Assessment disparado diretamente do formulário do setor */}
      {sector && (
        <SectorAssessmentModal
          sector={sector}
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          onSaved={() => {
            onSuccess();
          }}
        />
      )}
    </>
  );
};

