'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Tenant, User } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  ArrowRightLeft,
  AlertTriangle,
  Mail,
  CheckCircle2,
  Lock,
  RotateCcw,
  Loader2,
  Send,
  ExternalLink,
} from 'lucide-react';

interface ManagerTransitionModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManagerTransitionModal: React.FC<ManagerTransitionModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const currentManager = useMemo(() => {
    if (!tenant) return undefined;
    return dataService.getTenantManager(tenant.id);
  }, [tenant, isOpen]);

  const existingAgents = useMemo(() => {
    if (!tenant) return [];
    return dataService
      .getUsers(tenant.id)
      .filter((u) => u.role === 'agent' && u.active !== false);
  }, [tenant, isOpen]);

  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [existingUserId, setExistingUserId] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [suspendPrevious, setSuspendPrevious] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [transitionResult, setTransitionResult] = useState<{
    newManager: User;
    previousManager?: User;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMode(existingAgents.length > 0 ? 'existing' : 'new');
    setExistingUserId(existingAgents[0]?.id || '');
    setNewManagerName('');
    setNewManagerEmail('');
    setSuspendPrevious(true);
    setFormError(null);
    setIsSubmitting(false);
    setTransitionResult(null);
  }, [isOpen, existingAgents]);

  if (!tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = newManagerEmail.trim().toLowerCase();

    if (mode === 'new') {
      if (!newManagerName.trim() || !cleanEmail) {
        setFormError('Por favor, informe o Nome Completo e o E-mail corporativo do novo gestor.');
        return;
      }

      if (!cleanEmail.endsWith('@rafitec.com.br') && !cleanEmail.endsWith('@vaccaro.com.br')) {
        setFormError(
          'Política de Segurança (PSI Grupo Vaccaro): O e-mail corporativo deve pertencer a @rafitec.com.br ou @vaccaro.com.br.'
        );
        return;
      }
    }

    if (mode === 'existing' && !existingUserId) {
      setFormError('Por favor, selecione um facilitador existente para ser promovido a Gestor.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { newManager, previousManager } = dataService.replaceTenantManager({
        tenantId: tenant.id,
        previousManagerId: currentManager?.id,
        suspendPrevious,
        newManagerMode: mode,
        existingUserId,
        newManagerName: newManagerName.trim(),
        newManagerEmail: cleanEmail,
      });

      if (isSupabaseConfigured()) {
        const cleanNewEmail = newManager.email.trim().toLowerCase();

        // 1. Grava o novo gestor em public.authorized_users vinculado à unidade
        const { error: authError } = await supabase.from('authorized_users').upsert(
          {
            tenant_id: tenant.id,
            email: cleanNewEmail,
            name: newManager.name,
            role: 'admin',
            job_title: newManager.jobTitle || 'Gestor & Supervisor Lean da Unidade',
            avatar_url: newManager.avatarUrl,
            all_sectors: true,
            active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );

        if (authError) {
          console.error('[ManagerTransitionModal] Falha ao autorizar novo gestor:', authError);
          setFormError(`Falha ao autorizar novo gestor no Supabase: ${authError.message}`);
          setIsSubmitting(false);
          return;
        }

        // 2. Atualiza o perfil caso já exista no Supabase
        await supabase
          .from('profiles')
          .update({
            tenant_id: tenant.id,
            role: 'admin',
            name: newManager.name,
            job_title: newManager.jobTitle || 'Gestor & Supervisor Lean da Unidade',
            status: 'ativo',
            updated_at: new Date().toISOString(),
          })
          .eq('email', cleanNewEmail);

        // 3. Se optado por suspender o gestor anterior, revoga na nuvem
        if (previousManager && suspendPrevious && previousManager.email) {
          const cleanPrevEmail = previousManager.email.trim().toLowerCase();
          await supabase
            .from('authorized_users')
            .update({
              active: false,
              updated_at: new Date().toISOString(),
            })
            .eq('email', cleanPrevEmail);

          await supabase
            .from('profiles')
            .update({
              status: 'suspenso',
              updated_at: new Date().toISOString(),
            })
            .eq('email', cleanPrevEmail);
        }
      }

      setTransitionResult({ newManager, previousManager });
    } catch (err: any) {
      console.error('[ManagerTransitionModal] Erro na transição:', err);
      setFormError(err?.message || 'Falha inesperada ao processar transição de gestor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (transitionResult) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const mailtoSubject = encodeURIComponent(
      `[Lean Flow System] Acesso de Gestor Liberado • Unidade ${tenant.name}`
    );
    const mailtoBody = encodeURIComponent(
      `Olá ${transitionResult.newManager.name},\n\n` +
        `Seu acesso administrativo como Gestor & Supervisor da unidade "${tenant.name}" no Lean Flow System foi cadastrado e liberado com sucesso.\n\n` +
        `Como a empresa utiliza Single Sign-On corporativo (Microsoft Entra ID), você não precisa de senha cadastrada por e-mail: basta acessar a plataforma e clicar em "Entrar com Microsoft (SSO Corporativo)" utilizando seu e-mail corporativo ${transitionResult.newManager.email}.\n\n` +
        `Link de acesso:\n${origin}\n\n` +
        `Atenciosamente,\n` +
        `Governança Lean • Grupo Vaccaro`
    );

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onSuccess();
          onClose();
        }}
        title={`Transição Concluída • ${tenant.name}`}
        maxWidth="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#f0fdf4',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #86efac',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
            }}
          >
            <ShieldCheck size={26} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Transição de Gestão Efetivada no Supabase!
              </h3>
              <p style={{ fontSize: '0.8125rem', color: isDark ? '#cbd5e1' : '#334155', margin: '0.35rem 0 0', lineHeight: 1.5 }}>
                O novo titular <strong>{transitionResult.newManager.name}</strong> ({transitionResult.newManager.email}) foi registrado na base corporativa de usuários autorizados com papel de Administrador da planta.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: isDark ? '#090e1a' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              color: isDark ? '#cbd5e1' : '#334155',
            }}
          >
            <strong style={{ color: isDark ? '#ffffff' : '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
              Autenticação Corporativa (SSO Microsoft Entra ID):
            </strong>
            O colaborador não necessita de senha avulsa ou link de confirmação do Supabase. O login é autenticado diretamente pela conta Microsoft institucional corporativa da empresa.
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            }}
          >
            <a
              href={`mailto:${transitionResult.newManager.email}?subject=${mailtoSubject}&body=${mailtoBody}`}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Mail size={15} color="#0891b2" /> Notificar por E-mail (Abrir Outlook)
            </a>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onSuccess();
                onClose();
              }}
            >
              Concluir & Fechar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transição de Gestor: ${tenant.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner de Garantia de Zero Downtime */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #86efac',
            borderRadius: '10px',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
              Continuidade Operacional Garantida (Zero Interrupção)
            </h4>
            <p style={{ fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#334155', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
              A substituição do gestor é imediata e transparente. Todos os setores fabris, agentes Lean, quadros Kanban e links públicos de coleta (<code style={{ color: isDark ? '#22d3ee' : '#0891b2' }}>/d/{tenant.slug}</code>) continuam operando 24/7 sem qualquer interrupção.
            </p>
          </div>
        </div>

        {/* Gestor Atual da Planta */}
        <div
          style={{
            backgroundColor: isDark ? '#090e1a' : '#f8fafc',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Gestor Atual da Unidade
          </span>

          {currentManager ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={
                    currentManager.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentManager.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #cbd5e1' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                    {currentManager.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                    {currentManager.email} • {currentManager.jobTitle || 'Supervisor Lean'}
                  </p>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: currentManager.active !== false
                    ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7')
                    : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2'),
                  color: currentManager.active !== false
                    ? (isDark ? '#34d399' : '#15803d')
                    : (isDark ? '#f87171' : '#b91c1c'),
                  border: `1px solid ${
                    currentManager.active !== false
                      ? (isDark ? 'rgba(16, 185, 129, 0.3)' : '#86efac')
                      : (isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5')
                  }`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                {currentManager.active !== false ? 'Em Atividade' : 'Acesso Suspenso'}
              </span>
            </div>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: isDark ? '#fbbf24' : '#d97706', margin: 0 }}>
              Nenhum gestor ativo definido para esta unidade no momento.
            </p>
          )}

          {/* Opção de suspensão do gestor atual */}
          {currentManager && (
            <div
              style={{
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={suspendPrevious}
                  onChange={(e) => setSuspendPrevious(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#ef4444', marginTop: '2px' }}
                />
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                    Suspender e revogar o acesso do gestor anterior imediatamente
                  </span>
                  <p style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.1rem 0 0', lineHeight: 1.35 }}>
                    (Recomendado em desligamentos ou transferências de filial). Todo o histórico de Kaizens e auditorias passadas assinadas por ele continuará 100% gravado. Desmarque se desejar uma co-gestão temporária durante a transição.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Escolha do Novo Gestor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <ArrowRightLeft size={14} color="#0891b2" />
            <span>Como deseja definir o Novo Gestor da Planta?</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMode('existing')}
              disabled={existingAgents.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: mode === 'existing'
                  ? '2px solid #0891b2'
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                backgroundColor: mode === 'existing'
                  ? (isDark ? 'rgba(6, 182, 212, 0.15)' : '#e0f2fe')
                  : (isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'),
                color: mode === 'existing'
                  ? (isDark ? '#ffffff' : '#0369a1')
                  : (isDark ? '#94a3b8' : '#475569'),
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: existingAgents.length === 0 ? 'not-allowed' : 'pointer',
                opacity: existingAgents.length === 0 ? 0.5 : 1,
              }}
            >
              <UserCheck size={16} color={mode === 'existing' ? (isDark ? '#22d3ee' : '#0891b2') : (isDark ? '#94a3b8' : '#64748b')} />
              <span>Promover Facilitador</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: mode === 'new'
                  ? '2px solid #10b981'
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                backgroundColor: mode === 'new'
                  ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7')
                  : (isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'),
                color: mode === 'new'
                  ? (isDark ? '#ffffff' : '#15803d')
                  : (isDark ? '#94a3b8' : '#475569'),
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <UserPlus size={16} color={mode === 'new' ? (isDark ? '#34d399' : '#10b981') : (isDark ? '#94a3b8' : '#64748b')} />
              <span>Convidar Novo Gestor</span>
            </button>
          </div>

          {/* Formulário: Promover Facilitador Existente */}
          {mode === 'existing' && (
            <div
              style={{
                backgroundColor: isDark ? '#030712' : '#f8fafc',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <label className="form-label" style={{ fontSize: '0.78125rem' }}>
                Selecione o Facilitador da Planta a ser promovido para Gestor:
              </label>
              <select
                value={existingUserId}
                onChange={(e) => setExistingUserId(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.8125rem' }}
              >
                {existingAgents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.email}) — Setor: {ag.sectorName || 'Geral'}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginTop: '0.35rem' }}>
                Este colaborador receberá privilégios administrativos completos da unidade.
              </span>
            </div>
          )}

          {/* Formulário: Cadastrar Novo Gestor por E-mail */}
          {mode === 'new' && (
            <div
              style={{
                backgroundColor: isDark ? '#030712' : '#f8fafc',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Nome Completo do Novo Gestor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Rocha"
                  className="form-control"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: roberto@rafitec.com.br"
                  className="form-control"
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Governança SSO Microsoft: O novo gestor terá acesso liberado imediatamente com seu e-mail institucional (@rafitec.com.br ou @vaccaro.com.br). Não é necessário cadastrar senha por e-mail.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mensagem de Erro de Validação ou Banco */}
        {formError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
              border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca',
              color: isDark ? '#fca5a5' : '#b91c1c',
              fontSize: '0.8125rem',
              lineHeight: 1.4,
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, color: '#ef4444' }} />
            <div>{formError}</div>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Gravando no Supabase...' : (
              <>
                <CheckCircle2 size={16} /> Confirmar Transição de Gestão
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
