'use client';

import React, { useState, useEffect } from 'react';
import { Tenant } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Building2,
  Globe,
  FileText,
  Mail,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Factory,
  Loader2,
} from 'lucide-react';

interface TenantModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TenantModal: React.FC<TenantModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [cnpjOrCode, setCnpjOrCode] = useState('');

  // Fields for initial admin when creating new
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Fields for Controladoria when editing
  const [controladoriaName, setControladoriaName] = useState('');
  const [controladoriaEmail, setControladoriaEmail] = useState('');
  const [autoNotifyControladoria, setAutoNotifyControladoria] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    setIsSubmitting(false);

    if (tenant) {
      setName(tenant.name);
      setSlug(tenant.slug);
      setCnpjOrCode(tenant.cnpjOrCode || '');
      setControladoriaName(tenant.aiSettings?.controladoriaName || '');
      setControladoriaEmail(tenant.aiSettings?.controladoriaEmail || '');
      setAutoNotifyControladoria(tenant.aiSettings?.autoNotifyControladoria ?? true);
    } else {
      setName('');
      setSlug('');
      setCnpjOrCode('');
      setAdminName('');
      setAdminEmail('');
      setControladoriaName('Controladoria & Auditoria');
      setControladoriaEmail('');
      setAutoNotifyControladoria(true);
    }
  }, [tenant, isOpen]);

  // Auto-generate slug when typing name in creation mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!tenant) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !slug.trim()) {
      setFormError('Por favor, preencha o Nome e o Slug da entidade.');
      return;
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    setIsSubmitting(true);

    try {
      if (tenant) {
        // Edit existing tenant
        dataService.updateTenant(tenant.id, {
          name: name.trim(),
          slug: cleanSlug,
          cnpjOrCode: cnpjOrCode.trim() || 'Não informado',
          plan: tenant.plan || 'enterprise',
          aiSettings: {
            ...tenant.aiSettings,
            controladoriaName: controladoriaName.trim(),
            controladoriaEmail: controladoriaEmail.trim(),
            autoNotifyControladoria,
            updatedAt: new Date().toISOString(),
          },
        });

        if (isSupabaseConfigured()) {
          const { error: updateError } = await supabase
            .from('tenants')
            .update({
              name: name.trim(),
              slug: cleanSlug,
              cnpj_or_code: cnpjOrCode.trim() || 'Não informado',
              ai_settings: {
                ...tenant.aiSettings,
                controladoriaName: controladoriaName.trim(),
                controladoriaEmail: controladoriaEmail.trim(),
                autoNotifyControladoria,
                updatedAt: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', tenant.id);

          if (updateError) {
            console.error('[TenantModal] Falha ao atualizar entidade no Supabase:', updateError);
            setFormError(`Falha ao sincronizar alteração no Supabase: ${updateError.message}`);
            setIsSubmitting(false);
            return;
          }
        }
      } else {
        // Create new tenant with defaults
        const cleanAdminEmail = adminEmail.trim().toLowerCase();
        if (!cleanAdminEmail || !cleanAdminEmail.includes('@')) {
          setFormError('Por favor, informe o e-mail do Gestor / Supervisor da nova planta.');
          setIsSubmitting(false);
          return;
        }

        // Validação estrita de domínio corporativo (PSI Grupo Vaccaro)
        if (!cleanAdminEmail.endsWith('@rafitec.com.br') && !cleanAdminEmail.endsWith('@vaccaro.com.br')) {
          setFormError(
            'Política de Segurança (PSI Grupo Vaccaro): O e-mail corporativo do gestor deve pertencer a @rafitec.com.br ou @vaccaro.com.br.'
          );
          setIsSubmitting(false);
          return;
        }

        const { tenant: createdTenant, adminUser: createdAdmin } = dataService.createTenantWithDefaults({
          name: name.trim(),
          slug: cleanSlug,
          cnpjOrCode: cnpjOrCode.trim() || 'Não informado',
          plan: 'enterprise',
          adminName: adminName.trim() || 'Supervisor Lean',
          adminEmail: cleanAdminEmail,
        });

        if (isSupabaseConfigured()) {
          // 1. Grava a nova entidade na tabela public.tenants
          const { error: tenantError } = await supabase.from('tenants').upsert(
            {
              id: createdTenant.id,
              name: createdTenant.name,
              slug: createdTenant.slug,
              cnpj_or_code: createdTenant.cnpjOrCode || 'Não informado',
              plan: 'enterprise',
              ai_settings: {
                controladoriaName: 'Gerência de Controladoria & Custos',
                controladoriaEmail: 'controladoria@rafitec.com.br',
                autoNotifyControladoria: true,
                model: 'gemini-2.0-flash',
                preferredVoice: 'pt-BR-Neural2-B',
              },
              is_active: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

          if (tenantError) {
            console.error('[TenantModal] Falha ao criar entidade no Supabase:', tenantError);
            setFormError(`Falha ao salvar entidade no Supabase: ${tenantError.message}`);
            setIsSubmitting(false);
            return;
          }

          // 2. Grava os setores padrão criados para esta planta
          const defaultSectors = dataService.getSectors(createdTenant.id);
          if (defaultSectors.length > 0) {
            await supabase.from('sectors').upsert(
              defaultSectors.map((sec) => ({
                id: sec.id,
                tenant_id: createdTenant.id,
                name: sec.name,
                code: sec.code,
                description: sec.description || '',
                color: sec.color,
                requires_control_document: !!sec.requiresTrackingDoc,
                control_document_name: sec.trackingDocLabel || null,
                updated_at: new Date().toISOString(),
              }))
            );
          }

          // 3. Grava o Gestor Supervisor em public.authorized_users vinculado à nova entidade
          const { error: authError } = await supabase.from('authorized_users').upsert(
            {
              tenant_id: createdTenant.id,
              email: cleanAdminEmail,
              name: createdAdmin.name,
              role: 'admin',
              job_title: createdAdmin.jobTitle || 'Supervisor & Lean Master',
              all_sectors: true,
              active: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );

          if (authError) {
            console.error('[TenantModal] Falha ao registrar gestor no Supabase:', authError);
            setFormError(`Entidade criada, mas falhou ao registrar gestor autorizado: ${authError.message}`);
            setIsSubmitting(false);
            return;
          }

          // 4. Se o perfil já existir no Supabase, vincula à nova entidade com status ativo
          await supabase
            .from('profiles')
            .update({
              tenant_id: createdTenant.id,
              role: 'admin',
              name: createdAdmin.name,
              job_title: createdAdmin.jobTitle || 'Supervisor & Lean Master',
              status: 'ativo',
              updated_at: new Date().toISOString(),
            })
            .eq('email', cleanAdminEmail);
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[TenantModal] Erro ao salvar:', err);
      setFormError(err?.message || 'Erro inesperado ao salvar entidade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tenant ? 'Editar Entidade / Planta Fabril' : 'Cadastrar Nova Entidade / Planta'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner Informativo Multi-Tenant */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(6, 182, 212, 0.08)' : '#f0fdfa',
            border: isDark ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid #99f6e4',
            borderRadius: '10px',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Factory size={22} color="#0891b2" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
              {tenant ? 'Configuração da Unidade' : 'Isolamento Multi-Tenant Automático'}
            </h4>
            <p style={{ fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#334155', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
              {tenant
                ? 'Os dados desta planta são protegidos por RLS. Kaizens, setores e métricas pertencem exclusivamente a esta unidade.'
                : 'Ao cadastrar esta nova entidade, o FluxoLean gerará automaticamente os 5 setores Lean essenciais e o acesso inicial do supervisor responsável.'}
            </p>
          </div>
        </div>

        {/* Nome da Entidade */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={14} color="#0891b2" />
            <span>Nome da Entidade / Razão Social ou Planta</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Rafitec S.A. - Planta 02 ou Metalúrgica Grigol"
            className="form-control"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>

        {/* Grid: Slug & CNPJ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={14} color="#0891b2" />
              <span>Slug do Link Público</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: rafitec-filial"
              className="form-control"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
            />
            <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginTop: '0.25rem' }}>
              URL de Coleta: /d/<strong>{slug || 'slug-da-empresa'}</strong>
            </span>
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} color={isDark ? '#94a3b8' : '#64748b'} />
              <span>CNPJ ou Código da Planta</span>
            </label>
            <input
              type="text"
              placeholder="Ex: 04.892.341/0002-36"
              className="form-control"
              value={cnpjOrCode}
              onChange={(e) => setCnpjOrCode(e.target.value)}
            />
          </div>
        </div>

        {/* Campos extras ao criar nova entidade */}
        {!tenant && (
          <div
            style={{
              backgroundColor: isDark ? '#030712' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.8125rem', fontWeight: 700 }}>
              <UserCheck size={16} color="#10b981" />
              <span>Gestor / Supervisor Responsável pela Nova Planta</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Nome do Gestor</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo"
                  className="form-control"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: gestor@empresa.com.br"
                  className="form-control"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Campos de Controladoria na edição */}
        {tenant && (
          <div
            style={{
              backgroundColor: isDark ? '#030712' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.8125rem', fontWeight: 700 }}>
              <ShieldCheck size={16} color="#d97706" />
              <span>Integração de Controladoria & Auditoria</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Responsável / Área</label>
                <input
                  type="text"
                  placeholder="Ex: Gerência Financeira"
                  className="form-control"
                  value={controladoriaName}
                  onChange={(e) => setControladoriaName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>E-mail de Auditoria</label>
                <input
                  type="email"
                  placeholder="Ex: controladoria@empresa.com.br"
                  className="form-control"
                  value={controladoriaEmail}
                  onChange={(e) => setControladoriaEmail(e.target.value)}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78125rem', color: isDark ? '#cbd5e1' : '#334155' }}>
              <input
                type="checkbox"
                checked={autoNotifyControladoria}
                onChange={(e) => setAutoNotifyControladoria(e.target.checked)}
                style={{ accentColor: '#fbbf24' }}
              />
              <span>Disparar convites de auditoria automáticos ao concluir Kaizens</span>
            </label>
          </div>
        )}

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
            {isSubmitting
              ? 'Gravando no Supabase...'
              : tenant
              ? 'Salvar Configurações'
              : 'Criar Entidade & Setores'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
