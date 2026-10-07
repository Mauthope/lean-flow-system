'use client';

import React, { useState, useMemo } from 'react';
import { Tenant, User } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  UserX,
  UserCheck,
  Trash2,
  AlertCircle,
  Plus,
  Crown,
  Edit2,
  Save,
  Loader2,
} from 'lucide-react';
import { AvatarSelector, CURATED_AVATARS } from '@/components/ui/AvatarSelector';

interface TenantManagersModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TenantManagersModal: React.FC<TenantManagersModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Form Fields (Novo ou Edição)
  const [editingManagerId, setEditingManagerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(CURATED_AVATARS[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const managers = useMemo(() => {
    if (!tenant) return [];
    return dataService.getTenantManagers(tenant.id);
  }, [tenant, isOpen, activeTab]);

  if (!tenant) return null;

  const handleStartEdit = (manager: User) => {
    setEditingManagerId(manager.id);
    setName(manager.name);
    setEmail(manager.email);
    setJobTitle(manager.jobTitle || '');
    setPhone(manager.phone || '');
    setSelectedAvatar(manager.avatarUrl || CURATED_AVATARS[0]);
    setFormError(null);
    setIsSubmitting(false);
    setActiveTab('create');
  };

  const handleResetForm = () => {
    setEditingManagerId(null);
    setName('');
    setEmail('');
    setJobTitle('');
    setPhone('');
    setSelectedAvatar(CURATED_AVATARS[0]);
    setFormError(null);
    setIsSubmitting(false);
  };

  const handleSaveManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Informe o nome completo do gestor.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('Informe um e-mail corporativo válido (ex: gestor@rafitec.com.br).');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validação estrita de domínio corporativo (PSI Grupo Vaccaro)
    if (!cleanEmail.endsWith('@rafitec.com.br') && !cleanEmail.endsWith('@vaccaro.com.br')) {
      setFormError(
        'Política de Segurança (PSI Grupo Vaccaro): O e-mail corporativo do gestor deve pertencer a @rafitec.com.br ou @vaccaro.com.br.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Sincronização prévia com o Supabase (governança de acesso e integridade de FK)
      if (isSupabaseConfigured()) {
        // Passo 1: Garantir que a entidade existe em public.tenants no Supabase
        const { error: tenantUpsertErr } = await supabase.from('tenants').upsert(
          {
            id: tenant.id,
            name: tenant.name.trim(),
            slug: tenant.slug.trim(),
            cnpj_or_code: tenant.cnpjOrCode || 'Não informado',
            plan: tenant.plan || 'enterprise',
            ai_settings: tenant.aiSettings || {
              controladoriaName: 'Gerência de Controladoria & Custos',
              controladoriaEmail: 'controladoria@rafitec.com.br',
              autoNotifyControladoria: true,
            },
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        if (tenantUpsertErr) {
          console.error('[TenantManagersModal] Falha ao persistir entidade no Supabase:', tenantUpsertErr);
          setFormError(`Falha ao registrar entidade no Supabase: ${tenantUpsertErr.message}`);
          setIsSubmitting(false);
          return;
        }

        // Passo 2: Garantir que os setores padrão da entidade existam em public.sectors
        const localSectors = dataService.getSectors(tenant.id);
        if (localSectors.length > 0) {
          await supabase.from('sectors').upsert(
            localSectors.map((sec) => ({
              id: sec.id,
              tenant_id: tenant.id,
              name: sec.name,
              code: sec.code,
              description: sec.description || '',
              color: sec.color,
              requires_control_document: !!sec.requiresTrackingDoc,
              control_document_name: sec.trackingDocLabel || null,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: 'id' }
          );
        }

        // Passo 3: Upsert do Gestor em public.authorized_users vinculado à entidade
        const { error: authError } = await supabase
          .from('authorized_users')
          .upsert(
            {
              tenant_id: tenant.id,
              email: cleanEmail,
              name: name.trim(),
              role: 'admin',
              job_title: jobTitle.trim() || 'Gestor & Supervisor Lean da Unidade',
              avatar_url: selectedAvatar,
              all_sectors: true,
              active: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );

        if (authError) {
          console.error('[TenantManagersModal] Falha ao autorizar gestor no Supabase:', authError);
          setFormError(`Falha ao autorizar gestor no Supabase: ${authError.message}`);
          setIsSubmitting(false);
          return;
        }

        // Passo 4: Atualizar perfil no Supabase se já existir login prévio
        await supabase
          .from('profiles')
          .update({
            tenant_id: tenant.id,
            role: 'admin',
            name: name.trim(),
            job_title: jobTitle.trim() || 'Gestor & Supervisor Lean da Unidade',
            avatar_url: selectedAvatar,
            status: 'ativo',
            updated_at: new Date().toISOString(),
          })
          .eq('email', cleanEmail);
      }

      // 2. Persistência na camada local (dataService)
      if (editingManagerId) {
        dataService.updateUser(editingManagerId, {
          name: name.trim(),
          email: cleanEmail,
          jobTitle: jobTitle.trim() || 'Gestor & Supervisor Lean da Unidade',
          phone: phone.trim(),
          avatarUrl: selectedAvatar,
        });
      } else {
        const existing = dataService.getUserByEmail(cleanEmail);
        if (existing) {
          dataService.updateUser(existing.id, {
            tenantId: tenant.id,
            name: name.trim(),
            email: cleanEmail,
            role: 'admin',
            jobTitle: jobTitle.trim() || 'Gestor & Supervisor Lean da Unidade',
            phone: phone.trim(),
            avatarUrl: selectedAvatar,
            active: true,
          });
        } else {
          dataService.createTenantManager({
            tenantId: tenant.id,
            name: name.trim(),
            email: cleanEmail,
            jobTitle: jobTitle.trim() || 'Gestor & Supervisor Lean da Unidade',
            phone: phone.trim(),
            avatarUrl: selectedAvatar,
          });
        }
      }

      handleResetForm();
      setActiveTab('list');
      onSuccess();
    } catch (err: any) {
      console.error('[TenantManagersModal] Erro ao salvar gestor:', err);
      setFormError(err?.message || 'Erro inesperado ao salvar gestor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (manager: User) => {
    const nextActive = !manager.active;
    const updated = dataService.updateUser(manager.id, {
      active: nextActive,
    });
    if (updated) {
      if (isSupabaseConfigured() && manager.email) {
        const cleanEmail = manager.email.trim().toLowerCase();
        try {
          await supabase
            .from('authorized_users')
            .update({ active: nextActive, updated_at: new Date().toISOString() })
            .eq('email', cleanEmail);
          await supabase
            .from('profiles')
            .update({ status: nextActive ? 'ativo' : 'suspenso', updated_at: new Date().toISOString() })
            .eq('email', cleanEmail);
        } catch (err) {
          console.error('[TenantManagersModal] Falha ao alternar status no Supabase:', err);
        }
      }
      onSuccess();
    }
  };

  const handleDeleteManager = async (manager: User) => {
    if (managers.length <= 1) {
      alert('Não é possível remover o único gestor da entidade. Cadastre outro gestor antes de remover este.');
      return;
    }

    if (confirm(`Deseja realmente remover o gestor "${manager.name}" da entidade "${tenant.name}"?`)) {
      dataService.deleteUser(manager.id);
      if (isSupabaseConfigured() && manager.email) {
        const cleanEmail = manager.email.trim().toLowerCase();
        try {
          await supabase.from('authorized_users').delete().eq('email', cleanEmail);
          await supabase
            .from('profiles')
            .update({ status: 'suspenso', updated_at: new Date().toISOString() })
            .eq('email', cleanEmail);
        } catch (err) {
          console.error('[TenantManagersModal] Falha ao remover no Supabase:', err);
        }
      }
      onSuccess();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestores da Unidade • ${tenant.name}`}
      maxWidth="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner Informativo de Grau 2 */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(6, 182, 212, 0.08)' : '#f0fdfa',
            border: isDark ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid #99f6e4',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={22} color="#0891b2" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
              Grau 2 de Governança: Liderança Local da Planta
            </h4>
            <p style={{ fontSize: '0.78125rem', color: isDark ? '#cbd5e1' : '#334155', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
              Os gestores cadastrados abaixo possuem autoridade administrativa sobre a unidade <strong>{tenant.name}</strong>. São eles quem cadastram os <strong>Agentes Lean</strong>, aprovam triagens e acompanham os planos de ação desta fábrica.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            paddingBottom: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'list' ? (isDark ? '#1e293b' : '#e0f2fe') : 'transparent',
              color: activeTab === 'list' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#94a3b8' : '#64748b'),
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={15} />
            <span>Gestores da Planta ({managers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeTab === 'create' && editingManagerId) {
                handleResetForm();
              } else if (activeTab === 'create') {
                setActiveTab('list');
              } else {
                handleResetForm();
                setActiveTab('create');
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'create' ? (isDark ? '#1e293b' : '#e0f2fe') : 'transparent',
              color: activeTab === 'create' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#94a3b8' : '#64748b'),
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease',
            }}
          >
            {editingManagerId ? <Edit2 size={15} /> : <UserPlus size={15} />}
            <span>{editingManagerId ? 'Editar Gestor' : '+ Cadastrar Novo Gestor'}</span>
          </button>
        </div>

        {/* TAB 1: LISTA DE GESTORES DA ENTIDADE */}
        {activeTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {managers.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                  border: isDark ? '1px dashed rgba(255, 255, 255, 0.12)' : '1px dashed #cbd5e1',
                  borderRadius: '12px',
                }}
              >
                <Users size={32} color={isDark ? '#64748b' : '#94a3b8'} style={{ margin: '0 auto 0.5rem' }} />
                <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                  Nenhum gestor específico cadastrado
                </h5>
                <p style={{ fontSize: '0.78125rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.25rem 0 1rem' }}>
                  Esta unidade está operando temporariamente sob a governança direta da conta Master.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={14} /> Cadastrar Primeiro Gestor
                </button>
              </div>
            ) : (
              managers.map((manager, idx) => (
                <div
                  key={manager.id}
                  style={{
                    backgroundColor: isDark ? '#090e1a' : '#ffffff',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: isDark ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={manager.avatarUrl || CURATED_AVATARS[0]}
                      alt={manager.name}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: manager.active ? '2px solid #06b6d4' : '2px solid #94a3b8',
                      }}
                    />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9375rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                          {manager.name}
                        </strong>

                        {idx === 0 && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              backgroundColor: isDark ? 'rgba(6, 182, 212, 0.15)' : '#e0f2fe',
                              color: isDark ? '#22d3ee' : '#0284c7',
                              border: isDark ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid #bae6fd',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Gestor Titular
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backgroundColor: manager.active
                              ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7')
                              : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2'),
                            color: manager.active
                              ? (isDark ? '#34d399' : '#15803d')
                              : (isDark ? '#f87171' : '#b91c1c'),
                            padding: '0.1rem 0.45rem',
                            borderRadius: '6px',
                          }}
                        >
                          {manager.active ? 'Acesso Ativo' : 'Acesso Suspenso'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Briefcase size={12} /> {manager.jobTitle || 'Supervisor Lean'}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: isDark ? '#22d3ee' : '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Mail size={12} /> {manager.email}
                        </span>

                        {manager.phone && (
                          <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Phone size={12} /> {manager.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(manager)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.65rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: isDark ? '#22d3ee' : '#0284c7',
                        borderColor: isDark ? 'rgba(6, 182, 212, 0.3)' : '#bae6fd',
                      }}
                      title="Editar foto de perfil, cargo ou dados deste gestor"
                    >
                      <Edit2 size={13} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(manager)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.65rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title={manager.active ? 'Suspender acesso temporariamente' : 'Reativar acesso do gestor'}
                    >
                      {manager.active ? <UserX size={13} color="#f87171" /> : <UserCheck size={13} color="#34d399" />}
                      <span>{manager.active ? 'Suspender' : 'Reativar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteManager(manager)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.55rem',
                        color: '#f87171',
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                      }}
                      title="Excluir cadastro do gestor"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: FORMULÁRIO DE CADASTRO OU EDIÇÃO DE GESTOR */}
        {activeTab === 'create' && (
          <form onSubmit={handleSaveManager} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#f87171',
                  fontSize: '0.8125rem',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.35rem' }}>
                  Nome Completo do Gestor *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Roberto Mendonça"
                  required
                  className="input"
                  style={{ width: '100%', fontSize: '0.84375rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.35rem' }}>
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos.mendonca@rafitec.com.br"
                  required
                  className="input"
                  style={{ width: '100%', fontSize: '0.84375rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.35rem' }}>
                  Cargo / Função na Planta
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Coordenador de Melhoria Contínua"
                  className="input"
                  style={{ width: '100%', fontSize: '0.84375rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.35rem' }}>
                  Telefone / Ramal Interno
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(49) 3321-0000 / Ramal 204"
                  className="input"
                  style={{ width: '100%', fontSize: '0.84375rem' }}
                />
              </div>
            </div>

            {/* Avatar Selector Completo: Upload, Galeria e URL */}
            <AvatarSelector
              value={selectedAvatar}
              onChange={setSelectedAvatar}
              accentColor="#06b6d4"
              label="Foto do Gestor da Unidade"
              helperText="Carregue uma foto da sua máquina, cole um link direto ou escolha da galeria executiva."
              defaultFallback={CURATED_AVATARS[0]}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setActiveTab('list');
                }}
                disabled={isSubmitting}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Salvando no Supabase...</span>
                  </>
                ) : (
                  <>
                    {editingManagerId ? <Save size={15} /> : <UserPlus size={15} />}
                    <span>{editingManagerId ? 'Salvar Alterações do Gestor' : 'Cadastrar Gestor da Unidade'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
