'use client';

import React, { useState, useEffect } from 'react';
import { Sector } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Trash2 } from 'lucide-react';

interface SectorModalProps {
  sector: Sector | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SectorModal: React.FC<SectorModalProps> = ({
  sector,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentTenant } = useAuth();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563eb');

  useEffect(() => {
    if (sector) {
      setName(sector.name);
      setCode(sector.code);
      setDescription(sector.description || '');
      setColor(sector.color || '#2563eb');
    } else {
      setName('');
      setCode('');
      setDescription('');
      setColor('#2563eb');
    }
  }, [sector, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    if (sector) {
      dataService.updateSector(sector.id, {
        name,
        code: code.toUpperCase(),
        description,
        color,
      });
    } else {
      dataService.createSector({
        tenantId: currentTenant.id,
        name,
        code: code.toUpperCase(),
        description,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sector ? `Editar Setor — ${sector.name}` : 'Cadastrar Novo Setor'}
      subtitle="Defina o departamento para direcionamento de fluxos Lean e agentes"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Nome do Setor:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Engenharia de Processos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Sigla / Código:</label>
            <input
              type="text"
              className="form-control"
              placeholder="ENG"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Descrição das Atividades Lean no Setor:</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Ex: Responsável por balanceamento de linhas, projetos Kaizen e TPM..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Cor de Identificação Visual:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            />
            <input
              type="text"
              className="form-control"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: '120px' }}
            />
          </div>
        </div>

        {sector && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-outline-danger btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Trash2 size={14} /> Excluir Setor
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {sector ? 'Salvar Alterações' : 'Cadastrar Setor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
