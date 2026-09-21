'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Sector } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  Eye,
  Shield,
} from 'lucide-react';

interface AgentModalProps {
  agent: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialRole?: 'agent' | 'viewer';
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export const AgentModal: React.FC<AgentModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'agent',
}) => {
  const { currentTenant } = useAuth();
  const { isDark } = useTheme();
  const sectors = useMemo(() => dataService.getSectors(), [isOpen]);

  const [role, setRole] = useState<'agent' | 'viewer'>(initialRole);
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
    if (!isOpen) return;

    const currentSectors = dataService.getSectors();
    if (agent) {
      setRole(agent.role === 'viewer' ? 'viewer' : 'agent');
      setName(agent.name);
      setEmail(agent.email);
      setJobTitle(agent.jobTitle || '');
      setPhone(agent.phone || '');
      setAvatarUrl(agent.avatarUrl || DEFAULT_AVATARS[0]);
      setActive(agent.active);

      // Initialize sectors
      if (agent.allSectors || agent.sectorName === 'Todos os Setores (Geral)') {
        setAllSectors(true);
        setSelectedSectorIds(currentSectors.map((s) => s.id));
      } else if (agent.sectorIds && agent.sectorIds.length > 0) {
        setAllSectors(false);
        setSelectedSectorIds(agent.sectorIds);
      } else if (agent.sectorId) {
        setAllSectors(false);
        setSelectedSectorIds([agent.sectorId]);
      } else {
        setAllSectors(false);
        setSelectedSectorIds(currentSectors[0] ? [currentSectors[0].id] : []);
      }
    } else {
      const isViewerRole = initialRole === 'viewer';
      setRole(initialRole);
      setName('');
      setEmail('');
      setJobTitle(isViewerRole ? 'Diretor Industrial' : 'Especialista Lean');
      setPhone('');
      setAvatarUrl(isViewerRole ? DEFAULT_AVATARS[4] : DEFAULT_AVATARS[0]);
      setActive(true);
      setAllSectors(true); // By default new agent or viewer can act/view plant-wide
      setSelectedSectorIds(currentSectors.map((s) => s.id));
    }
  }, [agent, isOpen, initialRole]);

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

  const handleRoleChange = (newRole: 'agent' | 'viewer') => {
    setRole(newRole);
    if (!agent) {
      if (newRole === 'viewer') {
        if (!jobTitle || jobTitle === 'Especialista Lean') setJobTitle('Diretor Industrial');
        if (avatarUrl === DEFAULT_AVATARS[0]) setAvatarUrl(DEFAULT_AVATARS[4]);
        setAllSectors(true);
        setSelectedSectorIds(sectors.map((s) => s.id));
      } else {
        if (!jobTitle || jobTitle === 'Diretor Industrial') setJobTitle('Especialista Lean');
        if (avatarUrl === DEFAULT_AVATARS[4]) setAvatarUrl(DEFAULT_AVATARS[0]);
      }
    }
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
        role,
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
        role,
        sectorId,
        sectorIds: sectorIdsToSave,
        allSectors,
        jobTitle: jobTitle || (role === 'viewer' ? 'Diretor Industrial' : 'Especialista Lean'),
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
    if (
      confirm(
        `ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE o registro de ${agent.name}?\n\n` +
          `• Esta ação apagará permanentemente o cadastro do sistema.\n` +
          `• Para apenas revogar o acesso e preservar todo o histórico de Kaizens e métricas, recomendamos desmarcar a opção "Usuário Ativo" (Bloquear & Arquivar).\n\n` +
          `Deseja prosseguir com a exclusão irreversível?`
      )
    ) {
      dataService.deleteUser(agent.id);
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        agent
          ? `Editar ${agent.role === 'viewer' ? 'Visualizador' : 'Agente'} — ${agent.name}`
          : role === 'viewer'
          ? 'Cadastrar Visualizador / Diretoria'
          : 'Cadastrar Novo Agente Lean'
      }
      subtitle={
        role === 'viewer'
          ? 'Acesso executivo somente leitura para Diretores e Gerentes acompanharem KPIs e projetos'
          : 'Defina o perfil de trabalho, foto e setores de atuação do facilitador Lean de fábrica'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* SELETOR DE PERFIL DE ACESSO: AGENTE vs VISUALIZADOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155', fontWeight: 800, margin: 0 }}>
            Perfil de Acesso & Permissão na Plataforma:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* Opção Agente Lean */}
            <div
              onClick={() => handleRoleChange('agent')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.85rem',
                borderRadius: '12px',
                border: role === 'agent'
                  ? (isDark ? '2px solid #06b6d4' : '2px solid #0284c7')
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                backgroundColor: role === 'agent'
                  ? (isDark ? 'rgba(6, 182, 212, 0.12)' : '#e0f2fe')
                  : (isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'),
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: role === 'agent' ? '0 0 16px rgba(6, 182, 212, 0.2)' : 'none',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: role === 'agent'
                    ? (isDark ? '#06b6d4' : '#0284c7')
                    : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: role === 'agent' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                  flexShrink: 0,
                }}
              >
                <Briefcase size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <strong style={{ fontSize: '0.8125rem', color: role === 'agent' ? (isDark ? '#22d3ee' : '#0369a1') : (isDark ? '#ffffff' : '#0f172a') }}>
                    Agente Lean
                  </strong>
                  <span style={{
                    fontSize: '0.65rem',
                    backgroundColor: isDark ? 'rgba(6, 182, 212, 0.2)' : '#bae6fd',
                    color: isDark ? '#22d3ee' : '#0284c7',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    Gemba
                  </span>
                </div>
                <p style={{ fontSize: '0.6875rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.2rem 0 0 0', lineHeight: 1.3 }}>
                  Lidera e executa projetos Kaizen, planos de ação, fotos Antes/Depois e homologação de ganhos.
                </p>
              </div>
            </div>

            {/* Opção Visualizador / Diretoria */}
            <div
              onClick={() => handleRoleChange('viewer')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.85rem',
                borderRadius: '12px',
                border: role === 'viewer'
                  ? (isDark ? '2px solid #a855f7' : '2px solid #9333ea')
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                backgroundColor: role === 'viewer'
                  ? (isDark ? 'rgba(168, 85, 247, 0.14)' : '#f3e8ff')
                  : (isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'),
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: role === 'viewer' ? '0 0 16px rgba(168, 85, 247, 0.2)' : 'none',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: role === 'viewer'
                    ? (isDark ? '#a855f7' : '#9333ea')
                    : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Eye size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <strong style={{ fontSize: '0.8125rem', color: role === 'viewer' ? (isDark ? '#c084fc' : '#7e22ce') : (isDark ? '#ffffff' : '#0f172a') }}>
                    Visualizador / Diretoria
                  </strong>
                  <span style={{
                    fontSize: '0.65rem',
                    backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : '#e9d5ff',
                    color: isDark ? '#d8b4fe' : '#7e22ce',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    Read-Only
                  </span>
                </div>
                <p style={{ fontSize: '0.6875rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.2rem 0 0 0', lineHeight: 1.3 }}>
                  Consulta executiva de Dashboards, Hoshin Kanri, Kanban e ROI. Sem permissão de alteração.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARREGAMENTO DE FOTO DO USUÁRIO */}
        <div
          style={{
            backgroundColor: isDark ? '#090e1a' : '#f8fafc',
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          {/* Avatar Preview */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarUrl || (role === 'viewer' ? DEFAULT_AVATARS[4] : DEFAULT_AVATARS[0])}
              alt="Foto do Membro"
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2.5px solid ${role === 'viewer' ? '#a855f7' : (isDark ? '#22d3ee' : '#0284c7')}`,
                boxShadow: `0 0 15px ${role === 'viewer' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(6, 182, 212, 0.35)'}`,
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
                backgroundColor: role === 'viewer' ? '#8b5cf6' : '#2563eb',
                border: `2px solid ${isDark ? '#090e1a' : '#ffffff'}`,
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
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', display: 'block', marginBottom: '0.2rem' }}>
              {role === 'viewer' ? 'Foto do Diretor / Visualizador' : 'Foto do Agente Lean'}
            </span>
            <p style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0 0 0.5rem 0' }}>
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
                <Upload size={13} color={isDark ? '#22d3ee' : '#0284c7'} />
                <span>Carregar Foto</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(DEFAULT_AVATARS[0])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isDark ? '#94a3b8' : '#64748b',
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
            <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Nome Completo:</label>
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
            <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>E-mail Institucional:</label>
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
            <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Cargo / Função:</label>
            <input
              type="text"
              className="form-control"
              placeholder={role === 'viewer' ? 'Ex: Diretor Industrial, Gerente Geral' : 'Ex: Especialista Kaizen / Líder Lean'}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            {/* Sugestões rápidas de cargo */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {(role === 'viewer'
                ? ['Diretor Industrial', 'Gerente de Fábrica', 'Gerente de Operações', 'Conselheiro']
                : ['Especialista Lean', 'Líder Kaizen', 'Agente TPM', 'Facilitador 5S']
              ).map((titleSuggestion) => (
                <button
                  key={titleSuggestion}
                  type="button"
                  onClick={() => setJobTitle(titleSuggestion)}
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                    backgroundColor: jobTitle === titleSuggestion
                      ? (role === 'viewer' ? '#a855f7' : (isDark ? '#06b6d4' : '#0284c7'))
                      : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'),
                    color: jobTitle === titleSuggestion ? '#ffffff' : (isDark ? '#94a3b8' : '#334155'),
                    cursor: 'pointer',
                  }}
                >
                  {titleSuggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Telefone / Ramal:</label>
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
            backgroundColor: isDark ? '#090e1a' : '#f8fafc',
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={15} color={role === 'viewer' ? '#c084fc' : (isDark ? '#22d3ee' : '#0284c7')} />{' '}
                {role === 'viewer' ? 'Escopo & Abrangência de Visualização:' : 'Setores & Departamentos de Atuação:'}
              </label>
              <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                {role === 'viewer'
                  ? 'Defina se o visualizador acompanhará toda a planta ou setores específicos'
                  : 'Selecione os setores onde o agente tem permissão para conduzir projetos Lean'}
              </span>
            </div>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: allSectors ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#22d3ee' : '#0284c7'),
                backgroundColor: allSectors
                  ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7')
                  : (isDark ? 'rgba(6, 182, 212, 0.15)' : '#e0f2fe'),
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                border: `1px solid ${allSectors ? (isDark ? 'rgba(16, 185, 129, 0.3)' : '#86efac') : (isDark ? 'rgba(6, 182, 212, 0.3)' : '#7dd3fc')}`,
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
              backgroundColor: allSectors
                ? (isDark ? 'rgba(16, 185, 129, 0.12)' : '#dcfce7')
                : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff'),
              border: allSectors
                ? '1.5px solid #10b981'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
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
                <strong style={{ fontSize: '0.8125rem', color: allSectors ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#ffffff' : '#0f172a') }}>
                  🌟 Todos os Setores (Atuação Geral em Toda a Planta)
                </strong>
                <p style={{ fontSize: '0.6875rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.1rem 0 0 0' }}>
                  Habilita o agente para atuar em qualquer departamento ou demanda da fábrica.
                </p>
              </div>
            </div>

            {allSectors && <Check size={16} color="#10b981" />}
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
                    backgroundColor: isSelected
                      ? (isDark ? `${sec.color || '#06b6d4'}18` : '#f0fdf4')
                      : (isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'),
                    border: isSelected
                      ? `1.5px solid ${sec.color || '#10b981'}`
                      : (isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #cbd5e1'),
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
                        color: sec.color || (isDark ? '#22d3ee' : '#0284c7'),
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {sec.code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: isDark ? '#ffffff' : '#0f172a',
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
              backgroundColor: isDark ? '#090e1a' : '#f8fafc',
              borderRadius: '8px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#ffffff' : '#0f172a' }}>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
              />
              <span>
                {active
                  ? `${role === 'viewer' ? 'Visualizador Ativo' : 'Agente Ativo na Planta'} (Acesso Liberado)`
                  : '🔒 Acesso Bloqueado / Perfil Arquivado (Histórico Preservado)'}
              </span>
            </label>

            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-outline-danger btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Excluir permanentemente do sistema"
            >
              <Trash2 size={14} /> Excluir Definitivamente
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
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              backgroundColor: role === 'viewer' ? '#8b5cf6' : undefined,
              borderColor: role === 'viewer' ? '#a855f7' : undefined,
            }}
          >
            {agent
              ? 'Salvar Alterações'
              : role === 'viewer'
              ? 'Cadastrar Visualizador Executivo'
              : 'Cadastrar Agente Lean'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
