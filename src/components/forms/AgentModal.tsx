'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Sector } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserPlus,
  UserCheck,
  Trash2,
  Mail,
  Briefcase,
  Phone,
  Building2,
  Upload,
  Camera,
  X,
  Check,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface AgentModalProps {
  agent: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

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
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [active, setActive] = useState(true);

  // Sector multi-selection state
  const [allSectors, setAllSectors] = useState(false);
  const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setEmail(agent.email);
      setJobTitle(agent.jobTitle || '');
      setPhone(agent.phone || '');
      setAvatarUrl(agent.avatarUrl || DEFAULT_AVATARS[0]);
      setActive(agent.active);

      // Initialize sectors
      if (agent.allSectors || agent.sectorName === 'Todos os Setores (Geral)') {
        setAllSectors(true);
        setSelectedSectorIds(sectors.map((s) => s.id));
      } else if (agent.sectorIds && agent.sectorIds.length > 0) {
        setAllSectors(false);
        setSelectedSectorIds(agent.sectorIds);
      } else if (agent.sectorId) {
        setAllSectors(false);
        setSelectedSectorIds([agent.sectorId]);
      } else {
        setAllSectors(false);
        setSelectedSectorIds(sectors[0] ? [sectors[0].id] : []);
      }
    } else {
      setName('');
      setEmail('');
      setJobTitle('Especialista Lean');
      setPhone('');
      setAvatarUrl(DEFAULT_AVATARS[0]);
      setActive(true);
      setAllSectors(true); // By default new lean agent can act plant-wide
      setSelectedSectorIds(sectors.map((s) => s.id));
    }
  }, [agent, isOpen, sectors]);

  const handleToggleAllSectors = (checked: boolean) => {
    setAllSectors(checked);
    if (checked) {
      setSelectedSectorIds(sectors.map((s) => s.id));
    }
  };

  const handleToggleSector = (sectorId: string) => {
    if (allSectors) {
      // Switching from all to custom
      setAllSectors(false);
      setSelectedSectorIds(sectors.map((s) => s.id).filter((id) => id !== sectorId));
      return;
    }

    setSelectedSectorIds((prev) => {
      let next: string[];
      if (prev.includes(sectorId)) {
        next = prev.filter((id) => id !== sectorId);
      } else {
        next = [...prev, sectorId];
      }

      if (next.length === sectors.length && sectors.length > 0) {
        setAllSectors(true);
      }
      return next;
    });
  };

  // Image Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('A foto selecionada é muito grande. Escolha uma imagem de até 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const sectorId = allSectors ? (sectors[0]?.id || '') : (selectedSectorIds[0] || '');
    const sectorIdsToSave = allSectors ? sectors.map((s) => s.id) : selectedSectorIds;

    if (agent) {
      dataService.updateUser(agent.id, {
        name,
        email,
        sectorId,
        sectorIds: sectorIdsToSave,
        allSectors,
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
        sectorIds: sectorIdsToSave,
        allSectors,
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
      subtitle="Defina o perfil de trabalho, foto e setores de atuação do operador"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* CARREGAMENTO DE FOTO DO USUÁRIO */}
        <div
          style={{
            backgroundColor: '#090e1a',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          {/* Avatar Preview */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarUrl || DEFAULT_AVATARS[0]}
              alt="Foto do Agente"
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2.5px solid #22d3ee',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)',
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                border: '2px solid #090e1a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Carregar nova foto"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* Upload Controls */}
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
              Foto do Agente Lean
            </span>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
              Carregue uma imagem do seu dispositivo (PNG, JPG ou WEBP até 4MB).
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
              >
                <Upload size={13} color="#22d3ee" />
                <span>Carregar Foto</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(DEFAULT_AVATARS[0])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Restaurar Padrão
                </button>
              )}
            </div>
          </div>
        </div>

        {/* NOME COMPLETO & EMAIL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Nome Completo:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Carlos Eduardo Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>E-mail Institucional:</label>
            <input
              type="email"
              className="form-control"
              placeholder="Ex: carlos.silva@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* CARGO & TELEFONE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Cargo / Função:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Especialista Kaizen / Líder Lean"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Telefone / Ramal:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: (11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* SETORES DE ATUAÇÃO COM MÚLTIPLA ESCOLHA E OPÇÃO 'TODOS' */}
        <div
          style={{
            backgroundColor: '#090e1a',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ color: '#ffffff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={15} color="#22d3ee" /> Setores & Departamentos de Atuação:
              </label>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Selecione os setores onde o agente tem permissão para conduzir projetos Lean
              </span>
            </div>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: allSectors ? '#34d399' : '#22d3ee',
                backgroundColor: allSectors ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                border: `1px solid ${allSectors ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
              }}
            >
              {allSectors ? '🌟 Todos os Setores' : `${selectedSectorIds.length} selecionado(s)`}
            </span>
          </div>

          {/* Opção Destacada: TODOS OS SETORES */}
          <div
            onClick={() => handleToggleAllSectors(!allSectors)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: allSectors ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
              border: allSectors ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              marginBottom: '0.75rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input
                type="checkbox"
                checked={allSectors}
                onChange={(e) => handleToggleAllSectors(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <strong style={{ fontSize: '0.8125rem', color: allSectors ? '#34d399' : '#ffffff' }}>
                  🌟 Todos os Setores (Atuação Geral em Toda a Planta)
                </strong>
                <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: '0.1rem 0 0 0' }}>
                  Habilita o agente para atuar em qualquer departamento ou demanda da fábrica.
                </p>
              </div>
            </div>

            {allSectors && <Check size={16} color="#34d399" />}
          </div>

          {/* Grid de Setores Individuais */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '0.5rem',
              maxHeight: '180px',
              overflowY: 'auto',
              padding: '0.25rem',
            }}
          >
            {sectors.map((sec) => {
              const isSelected = allSectors || selectedSectorIds.includes(sec.id);

              return (
                <div
                  key={sec.id}
                  onClick={() => handleToggleSector(sec.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? `${sec.color || '#06b6d4'}18` : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected
                      ? `1.5px solid ${sec.color || '#06b6d4'}`
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSector(sec.id)}
                    style={{ width: '14px', height: '14px', accentColor: sec.color || '#06b6d4', cursor: 'pointer' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: sec.color || '#22d3ee',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {sec.code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#ffffff',
                        fontWeight: 600,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {sec.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AGENTE ATIVO & EXCLUIR */}
        {agent && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              backgroundColor: '#090e1a',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }}
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

        {/* BOTÕES DE AÇÃO */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
