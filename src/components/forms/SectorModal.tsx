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
  const [requiresTrackingDoc, setRequiresTrackingDoc] = useState(false);
  const [trackingDocType, setTrackingDocType] = useState<'purchase_order' | 'work_order' | 'custom'>('custom');
  const [trackingDocLabel, setTrackingDocLabel] = useState('');
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  useEffect(() => {
    if (sector) {
      setName(sector.name);
      setCode(sector.code);
      setDescription(sector.description || '');
      setColor(sector.color || '#06b6d4');
      setRequiresTrackingDoc(Boolean(sector.requiresTrackingDoc));
      setTrackingDocType(sector.trackingDocType || 'custom');
      setTrackingDocLabel(sector.trackingDocLabel || '');
    } else {
      setName('');
      setCode('');
      setDescription('');
      setColor('#06b6d4');
      setRequiresTrackingDoc(false);
      setTrackingDocType('custom');
      setTrackingDocLabel('');
    }
  }, [sector, isOpen]);

  const latestAssessment = sector ? dataService.getLatestSectorAssessment(sector.id) : undefined;

  const handleApplyPreset = (type: 'purchase_order' | 'work_order') => {
    setRequiresTrackingDoc(true);
    setTrackingDocType(type);
    if (type === 'purchase_order') {
      setTrackingDocLabel('Número da Ordem de Compra (OC / Pedido ERP)');
    } else {
      setTrackingDocLabel('Número da Ordem de Serviço (OS Manutenção)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTenant = currentTenant || dataService.getCurrentTenant();
    const tenantId = activeTenant?.id || 'tenant_rafitec_01';

    const finalLabel = requiresTrackingDoc
      ? trackingDocLabel.trim() || (trackingDocType === 'purchase_order' ? 'Número da Ordem de Compra (OC)' : 'Número da Ordem de Serviço (OS)')
      : undefined;

    if (sector) {
      dataService.updateSector(sector.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        color,
        requiresTrackingDoc,
        trackingDocType,
        trackingDocLabel: finalLabel,
      });
    } else {
      dataService.createSector({
        tenantId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        color,
        requiresTrackingDoc,
        trackingDocType,
        trackingDocLabel: finalLabel,
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

          {/* Seção: Controle de Auditoria Fabril & Rastreamento ERP (OC / OS) */}
          <div
            style={{
              backgroundColor: '#0c121e',
              border: requiresTrackingDoc ? '1.5px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: requiresTrackingDoc ? '#fbbf24' : '#ffffff',
                    cursor: 'pointer',
                    margin: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={requiresTrackingDoc}
                    onChange={(e) => setRequiresTrackingDoc(e.target.checked)}
                    style={{ width: '17px', height: '17px', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <span>Exigir Documento de Rastreio (OC / OS) para Atividades deste Setor</span>
                </label>
                <p style={{ margin: '0.35rem 0 0 1.6rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  Auditorias internas de fábrica exigem vínculo formal: Compras deve apontar o número da Ordem de Compra (OC) e Manutenção o número da Ordem de Serviço (OS).
                </p>
              </div>

              {requiresTrackingDoc && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Obrigatório no 5W2H
                </span>
              )}
            </div>

            {requiresTrackingDoc && (
              <div style={{ paddingLeft: '1.6rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Botões de Preenchimento Rápido */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600 }}>Modelos Prontos:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('purchase_order')}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '0.725rem',
                      padding: '0.2rem 0.6rem',
                      backgroundColor: trackingDocType === 'purchase_order' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: trackingDocType === 'purchase_order' ? '#34d399' : '#cbd5e1',
                      borderColor: trackingDocType === 'purchase_order' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    🛒 Compras (Nº da OC)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('work_order')}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '0.725rem',
                      padding: '0.2rem 0.6rem',
                      backgroundColor: trackingDocType === 'work_order' ? 'rgba(217, 119, 6, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: trackingDocType === 'work_order' ? '#fbbf24' : '#cbd5e1',
                      borderColor: trackingDocType === 'work_order' ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    🔧 Manutenção (Nº da OS)
                  </button>
                </div>

                {/* Input do Nome do Campo */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0 0 0.3rem 0' }}>
                    Nome do Campo Exibido ao Agente / Chão de Fábrica:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: Número da Ordem de Compra (OC) ou Número da OS"
                    value={trackingDocLabel}
                    onChange={(e) => setTrackingDocLabel(e.target.value)}
                    style={{ backgroundColor: '#060a13', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}
                    required={requiresTrackingDoc}
                  />
                </div>
              </div>
            )}
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

