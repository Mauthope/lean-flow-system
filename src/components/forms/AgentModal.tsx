'use client';

import React, { useState, useEffect } from 'react';
import { User, Sector } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserCheck, Trash2, Mail, Briefcase, Phone, Building2 } from 'lucide-react';

interface AgentModalProps {
  agent: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AgentModal: React.FC<AgentModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentTenant } = useAuth();
  const sectors = dataService.getSectors();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setEmail(agent.email);
      setSectorId(agent.sectorId || '');
      setJobTitle(agent.jobTitle || '');
      setPhone(agent.phone || '');
      setAvatarUrl(agent.avatarUrl || '');
      setActive(agent.active);
    } else {
      setName('');
      setEmail('');
      setSectorId(sectors[0]?.id || '');
      setJobTitle('');
      setPhone('');
      setAvatarUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
      setActive(true);
    }
  }, [agent, isOpen, sectors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    if (agent) {
      dataService.updateUser(agent.id, {
        name,
        email,
        sectorId,
        jobTitle,
        phone,
        avatarUrl,
        active,
      });
    } else {
      dataService.createUser({
        tenantId: currentTenant.id,
        name,
        email,
        role: 'agent',
        sectorId,
        jobTitle: jobTitle || 'Especialista Lean',
        phone,
        avatarUrl,
        active,
      });
    }

    onSuccess();
    onClose();
  };

  const handleDelete = () => {
    if (!agent) return;
    if (confirm(`Tem certeza que deseja excluir o agente ${agent.name}?`)) {
      dataService.deleteUser(agent.id);
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={agent ? `Editar Agente — ${agent.name}` : 'Cadastrar Novo Agente Lean'}
      subtitle="Defina o perfil de trabalho e setor do operador"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Nome Completo:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: Carlos Eduardo Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Email Corporativo:</label>
            <input
              type="email"
              className="form-control"
              placeholder="carlos@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Setor de Atuação:</label>
            <select
              className="form-select"
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              required
            >
              <option value="">Selecione o setor...</option>
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Cargo / Especialidade Lean:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Analista Kaizen / TPM"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Telefone / Ramal:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: (11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">URL da Foto / Avatar:</label>
          <input
            type="url"
            className="form-control"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>

        {agent && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
              />
              <span>Agente Ativo (habilitado para receber demandas)</span>
            </label>

            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-outline-danger btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Trash2 size={14} /> Excluir Agente
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
            {agent ? 'Salvar Alterações' : 'Cadastrar Agente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
