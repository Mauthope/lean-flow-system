'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Tenant } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import {
  Building2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Users,
  Layers,
  ArrowRight,
  Shield,
  QrCode,
  Sparkles,
  CheckCircle2,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export default function AdminEntitiesPage() {
  const { currentTenant, dataVersion, refreshData, loginAs } = useAuth();

  const [tenants, setTenants] = useState<Tenant[]>(() => dataService.getTenants());
  const [showNewModal, setShowNewModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form State for new Entity
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [cnpjOrCode, setCnpjOrCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [plan, setPlan] = useState<'standard' | 'enterprise'>('enterprise');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === '') {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminName.trim() || !adminEmail.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const { tenant: newTenant, adminUser } = dataService.createTenantWithDefaults({
      name: name.trim(),
      slug: slug.trim(),
      cnpjOrCode: cnpjOrCode.trim() || undefined,
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      plan,
    });

    setTenants(dataService.getTenants());
    setShowNewModal(false);
    setName('');
    setSlug('');
    setCnpjOrCode('');
    setAdminName('');
    setAdminEmail('');
    refreshData();
    alert(`Entidade "${newTenant.name}" cadastrada com sucesso! Setores e conta de supervisor criados automaticamente.`);
  };

  const handleSwitchTenant = (tenant: Tenant) => {
    dataService.setCurrentTenant(tenant);
    // Find admin of this tenant
    const users = dataService.getUsers(tenant.id);
    const admin = users.find((u) => u.role === 'admin') || users[0];
    if (admin) {
      loginAs(admin.id);
    }
    refreshData();
  };

  const handleCopyLink = (tenantSlug: string) => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const url = `${origin}/d/${tenantSlug}`;
      navigator.clipboard.writeText(url);
      setCopiedSlug(tenantSlug);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '0.15rem 0.55rem',
                borderRadius: '6px',
              }}
            >
              GESTÃO MULTI-TENANT
            </span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0.25rem 0 0' }}>
            Entidades & Unidades Fabris Cadastradas
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Gerencie cada empresa/fábrica com seus setores, usuários e links exclusivos de coleta de Kaizen.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Cadastrar Nova Entidade</span>
        </button>
      </div>

      {/* Info Card */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={24} color="#2563eb" />
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#1e40af', display: 'block' }}>
              Entidade Atualmente Ativa: {currentTenant?.name || 'Nenhuma'}
            </strong>
            <span style={{ fontSize: '0.78125rem', color: '#3b82f6' }}>
              Todos os dados do dashboard, kanban e relatórios correspondem a esta entidade.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => handleCopyLink(currentTenant?.slug || 'rafitec')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
          >
            {copiedSlug === currentTenant?.slug ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            <span>{copiedSlug === currentTenant?.slug ? 'Link Copiado!' : 'Copiar Link Único da Sua Fábrica'}</span>
          </button>
        </div>
      </div>

      {/* Entities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {tenants.map((t) => {
          const isCurrent = currentTenant?.id === t.id;
          const tenantSectors = dataService.getSectors(t.id);
          const tenantUsers = dataService.getUsers(t.id);
          const tenantAgents = tenantUsers.filter((u) => u.role === 'agent');
          const tenantAdmins = tenantUsers.filter((u) => u.role === 'admin');

          return (
            <div
              key={t.id}
              className="card"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isCurrent ? '0 10px 25px -5px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div>
                {/* Header Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: isCurrent ? '#ecfdf5' : '#f1f5f9',
                      color: isCurrent ? '#047857' : '#64748b',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {isCurrent ? '● ENTIDADE EM USO' : 'DISPONÍVEL'}
                  </span>

                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
                    Plano {t.plan === 'enterprise' ? 'Enterprise' : 'Standard'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    {t.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {t.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Código / CNPJ: {t.cnpjOrCode}
                    </span>
                  </div>
                </div>

                {/* Metrics Stats of Entity */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.6rem',
                    backgroundColor: '#f8fafc',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    margin: '1rem 0',
                    fontSize: '0.78125rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>SETORES</span>
                    <strong style={{ color: '#0f172a' }}>🏢 {tenantSectors.length} Setores</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>EQUIPE LEAN</span>
                    <strong style={{ color: '#0f172a' }}>👥 {tenantAgents.length} Agentes ({tenantAdmins.length} Admin)</strong>
                  </div>
                </div>

                {/* Unique Public Link Box */}
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', display: 'block' }}>
                    🔗 Link Único da Fábrica (Sem Login):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', gap: '0.5rem' }}>
                    <code style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, wordBreak: 'break-all' }}>
                      /d/{t.slug}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(t.slug)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', flexShrink: 0 }}
                      title="Copiar link permanente para fixar nos postos"
                    >
                      {copiedSlug === t.slug ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <Link
                  href={`/d/${t.slug}`}
                  target="_blank"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', flex: 1, justifyContent: 'center' }}
                >
                  <span>Abrir Formulário</span>
                  <ExternalLink size={12} />
                </Link>

                {!isCurrent ? (
                  <button
                    onClick={() => handleSwitchTenant(t)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', flex: 1 }}
                  >
                    Alternar para Esta
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800, padding: '0.35rem 0.75rem' }}>
                    ✓ Ativa no Momento
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ENTITY MODAL */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Cadastrar Nova Entidade / Empresa"
        subtitle="Configure a nova fábrica, link público exclusivo e seu supervisor inicial"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEntity} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Entity Name */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Nome da Empresa / Unidade Fabril: *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Indústria Metalúrgica Grigol Sul"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          {/* Slug & CNPJ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Identificador Único (Slug da URL): *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: metalurgica-grigol"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                O link exclusivo será: <strong>/d/{slug || 'nome-da-empresa'}</strong>
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">CNPJ ou Código Interno:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 12.345.678/0001-90"
                value={cnpjOrCode}
                onChange={(e) => setCnpjOrCode(e.target.value)}
              />
            </div>
          </div>

          {/* Supervisor Information */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
              👤 Supervisor & Administrador Inicial da Entidade:
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nome do Supervisor: *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Mauricio Grigol"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">E-mail de Acesso: *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Ex: supervisor@empresa.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              fontSize: '0.78125rem',
              color: '#065f46',
            }}
          >
            ✓ Ao salvar, os 5 setores padrão Lean (Qualidade, Manutenção, Processos, Montagem e Logística) serão criados automaticamente para esta fábrica.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Criar Entidade & Habilitar Acesso
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
