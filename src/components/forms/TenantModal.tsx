'use client';

import React, { useState, useEffect } from 'react';
import { Tenant } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import {
  Building2,
  Globe,
  FileText,
  Mail,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Layers,
  Factory,
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
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [cnpjOrCode, setCnpjOrCode] = useState('');
  const [plan, setPlan] = useState<'standard' | 'enterprise'>('enterprise');

  // Fields for initial admin when creating new
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Fields for Controladoria when editing
  const [controladoriaName, setControladoriaName] = useState('');
  const [controladoriaEmail, setControladoriaEmail] = useState('');
  const [autoNotifyControladoria, setAutoNotifyControladoria] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    if (tenant) {
      setName(tenant.name);
      setSlug(tenant.slug);
      setCnpjOrCode(tenant.cnpjOrCode || '');
      setPlan(tenant.plan || 'enterprise');
      setControladoriaName(tenant.aiSettings?.controladoriaName || '');
      setControladoriaEmail(tenant.aiSettings?.controladoriaEmail || '');
      setAutoNotifyControladoria(tenant.aiSettings?.autoNotifyControladoria ?? true);
    } else {
      setName('');
      setSlug('');
      setCnpjOrCode('');
      setPlan('enterprise');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert('Por favor, preencha o Nome e o Slug da entidade.');
      return;
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    if (tenant) {
      // Edit existing tenant
      dataService.updateTenant(tenant.id, {
        name: name.trim(),
        slug: cleanSlug,
        cnpjOrCode: cnpjOrCode.trim() || 'Não informado',
        plan,
        aiSettings: {
          ...tenant.aiSettings,
          controladoriaName: controladoriaName.trim(),
          controladoriaEmail: controladoriaEmail.trim(),
          autoNotifyControladoria,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      // Create new tenant with defaults
      if (!adminEmail.trim()) {
        alert('Por favor, informe o e-mail do Gestor / Supervisor da nova planta.');
        return;
      }

      dataService.createTenantWithDefaults({
        name: name.trim(),
        slug: cleanSlug,
        cnpjOrCode: cnpjOrCode.trim() || 'Não informado',
        plan,
        adminName: adminName.trim() || 'Supervisor Lean',
        adminEmail: adminEmail.trim(),
      });
    }

    onSuccess();
    onClose();
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
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '10px',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Factory size={22} color="#22d3ee" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {tenant ? 'Configuração da Unidade' : 'Isolamento Multi-Tenant Automático'}
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
              {tenant
                ? 'Os dados desta planta são protegidos por RLS. Kaizens, setores e métricas pertencem exclusivamente a esta unidade.'
                : 'Ao cadastrar esta nova entidade, o FluxoLean gerará automaticamente os 5 setores Lean essenciais e o acesso inicial do supervisor responsável.'}
            </p>
          </div>
        </div>

        {/* Nome da Entidade */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={14} color="#22d3ee" />
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
              <Globe size={14} color="#22d3ee" />
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
            <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
              URL de Coleta: /d/<strong>{slug || 'slug-da-empresa'}</strong>
            </span>
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} color="#94a3b8" />
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

        {/* Plano da Planta */}
        <div>
          <label className="form-label">Plano de Ativação</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setPlan('enterprise')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: plan === 'enterprise' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: plan === 'enterprise' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: plan === 'enterprise' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={16} color={plan === 'enterprise' ? '#22d3ee' : '#94a3b8'} />
              <span>Plano Enterprise</span>
            </button>

            <button
              type="button"
              onClick={() => setPlan('standard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: plan === 'standard' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: plan === 'standard' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: plan === 'standard' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <Layers size={16} color={plan === 'standard' ? '#34d399' : '#94a3b8'} />
              <span>Plano Standard</span>
            </button>
          </div>
        </div>

        {/* Campos extras ao criar nova entidade */}
        {!tenant && (
          <div
            style={{
              backgroundColor: '#030712',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', fontSize: '0.8125rem', fontWeight: 700 }}>
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
              backgroundColor: '#030712',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', fontSize: '0.8125rem', fontWeight: 700 }}>
              <ShieldCheck size={16} color="#fbbf24" />
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

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78125rem', color: '#cbd5e1' }}>
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

        {/* Footer Actions */}
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
            {tenant ? 'Salvar Configurações' : 'Criar Entidade & Setores'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
