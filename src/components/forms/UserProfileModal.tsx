'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AvatarSelector } from '@/components/ui/AvatarSelector';
import { getUserHierarchyInfo, isMasterUser } from '@/lib/types';
import {
  User,
  Mail,
  Briefcase,
  Phone,
  Save,
  Shield,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, currentTenant, refreshData } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setJobTitle(currentUser.jobTitle || '');
      setPhone(currentUser.phone || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setIsSaved(false);
    }
  }, [currentUser, isOpen]);

  if (!currentUser) return null;

  const hierarchyInfo = getUserHierarchyInfo(currentUser, currentTenant?.name);
  const isMaster = isMasterUser(currentUser);
  const accentColor = isMaster ? '#06b6d4' : currentUser.role === 'admin' ? '#38bdf8' : currentUser.role === 'viewer' ? '#a855f7' : '#10b981';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    dataService.updateUser(currentUser.id, {
      name: name.trim() || currentUser.name,
      jobTitle: jobTitle.trim(),
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim(),
    });

    // Sincroniza dados e avatar com o Supabase
    if (isSupabaseConfigured() && currentUser.email) {
      const cleanEmail = currentUser.email.trim().toLowerCase();
      supabase
        .from('profiles')
        .update({
          name: name.trim() || currentUser.name,
          job_title: jobTitle.trim(),
          avatar_url: avatarUrl.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('email', cleanEmail)
        .then(() => {});

      supabase
        .from('authorized_users')
        .update({
          name: name.trim() || currentUser.name,
          job_title: jobTitle.trim(),
          avatar_url: avatarUrl.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('email', cleanEmail)
        .then(() => {});
    }

    // Atualiza usuario no localStorage
    const updated = dataService.getUserById(currentUser.id);
    if (updated) {
      dataService.setCurrentUser(updated);
    }

    refreshData();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meu Perfil de Acesso"
      subtitle="Atualize sua foto de perfil corporativa, nome de exibição e dados profissionais"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner com Grau Hierárquico do Usuário */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(6, 182, 212, 0.08)' : '#f0fdfa',
            border: isDark ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid #99f6e4',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: `${accentColor}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
              }}
            >
              <Shield size={16} />
            </div>
            <div>
              <strong style={{ fontSize: '0.84375rem', color: isDark ? '#ffffff' : '#0f172a', display: 'block' }}>
                {hierarchyInfo.badgeLabel}
              </strong>
              <span style={{ fontSize: '0.71875rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                {hierarchyInfo.description}
              </span>
            </div>
          </div>

          {currentTenant?.name && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0',
                color: isDark ? '#cbd5e1' : '#334155',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Building2 size={12} /> {currentTenant.name}
            </span>
          )}
        </div>

        {/* Componente Reutilizável de Escolha e Upload de Foto */}
        <AvatarSelector
          value={avatarUrl}
          onChange={setAvatarUrl}
          accentColor={accentColor}
          label="Foto de Perfil"
          helperText="Carregue uma imagem do seu dispositivo, informe um link direto ou escolha da galeria executiva."
        />

        {/* Dados Pessoais e Profissionais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.35rem' }}>
              Nome Completo
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="input"
                style={{ width: '100%', fontSize: '0.84375rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.35rem' }}>
              E-mail Institucional (Bloqueado)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="input"
                style={{
                  width: '100%',
                  fontSize: '0.84375rem',
                  opacity: 0.65,
                  cursor: 'not-allowed',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f1f5f9',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.35rem' }}>
              Cargo / Função
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex: Engenheiro Lean / Facilitador"
              className="input"
              style={{ width: '100%', fontSize: '0.84375rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.35rem' }}>
              Telefone / Ramal
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(49) 3321-0000"
              className="input"
              style={{ width: '100%', fontSize: '0.84375rem' }}
            />
          </div>
        </div>

        {/* Rodapé e Ações */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: accentColor,
              borderColor: accentColor,
            }}
          >
            {isSaved ? <CheckCircle2 size={15} /> : <Save size={15} />}
            <span>{isSaved ? 'Perfil Atualizado!' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
