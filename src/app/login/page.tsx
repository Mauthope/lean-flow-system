'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Tenant } from '@/lib/types';
import { Shield, UserCheck, Lock, ArrowLeft, Building2, Sparkles, Check, Users } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { currentTenant, loginAs, refreshData } = useAuth();

  const [tenants, setTenants] = useState<Tenant[]>(() => dataService.getTenants());
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    () => currentTenant?.id || dataService.getTenants()[0]?.id || 'tenant_rafitec_01'
  );
  const [activeTab, setActiveTab] = useState<'master' | 'agents'>('master');

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0] || {
    id: 'tenant_rafitec_01',
    name: 'Rafitec S.A.',
    slug: 'rafitec',
    cnpjOrCode: '04.892.341/0001-55',
    plan: 'enterprise' as const,
    createdAt: new Date().toISOString(),
  };

  const tenantUsers = dataService.getUsers(activeTenant.id);
  const masterUser = tenantUsers.find((u) => u.role === 'admin') || tenantUsers[0];
  const agentUsers = tenantUsers.filter((u) => u.role === 'agent');

  const handleSelectTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const targetTenant = tenants.find((t) => t.id === tenantId);
    if (targetTenant) {
      dataService.setCurrentTenant(targetTenant);
      refreshData();
    }
  };

  const handleLoginMaster = () => {
    if (activeTenant) {
      dataService.setCurrentTenant(activeTenant);
    }
    if (masterUser) {
      loginAs(masterUser.id);
    }
    router.push('/admin/dashboard');
  };

  const handleLoginAgent = (userId: string) => {
    if (activeTenant) {
      dataService.setCurrentTenant(activeTenant);
    }
    loginAs(userId);
    router.push('/agente/kanban');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '30%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '25%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Back Link */}
      <div style={{ width: '100%', maxWidth: '580px', marginBottom: '1.25rem', position: 'relative', zIndex: 10 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#94a3b8',
            fontSize: '0.84375rem',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={16} /> Voltar para a Landing Page
        </Link>
      </div>

      {/* Main Glass Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.4rem',
              margin: '0 auto 1rem',
              boxShadow: '0 0 25px rgba(37, 99, 235, 0.5)',
            }}
          >
            LF
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Acesso ao LeanFlow 4.0
          </h1>
          <p style={{ fontSize: '0.84375rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Acesse como a <strong>Entidade Master</strong> ou escolha um dos <strong>Agentes da Fábrica</strong>
          </p>
        </div>

        {/* TENANT / ENTITY SELECTOR (Default Rafitec) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            <Building2 size={14} /> Entidade Ativa:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
            {tenants.map((t) => {
              const isSelected = activeTenant.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTenant(t.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.875rem', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                      🏢 {t.name}
                    </strong>
                    {isSelected && <Check size={14} color="#38bdf8" />}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                    Link Público: /d/{t.slug}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Access Selector Tabs (Entidade Master vs Agentes Operacionais) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '0.35rem',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.75rem',
              borderRadius: '10px',
              border: activeTab === 'master' ? '1px solid rgba(96, 165, 250, 0.5)' : '1px solid transparent',
              backgroundColor: activeTab === 'master' ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
              color: activeTab === 'master' ? '#93c5fd' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.84375rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'master' ? '0 0 15px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={16} />
            <span>Entidade Master</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agents')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.75rem',
              borderRadius: '10px',
              border: activeTab === 'agents' ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid transparent',
              backgroundColor: activeTab === 'agents' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: activeTab === 'agents' ? '#6ee7b7' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.84375rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'agents' ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={16} />
            <span>Agentes ({agentUsers.length})</span>
          </button>
        </div>

        {/* TAB 1: ENTIDADE MASTER */}
        {activeTab === 'master' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              onClick={handleLoginMaster}
              style={{
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1.5px solid rgba(59, 130, 246, 0.5)',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 25px rgba(37, 99, 235, 0.2)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                    }}
                  >
                    {activeTenant.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#ffffff', display: 'block' }}>
                      {activeTenant.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                      Entidade Master • Gestão Industrial & ROI
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)',
                  }}
                >
                  Entrar como Master →
                </span>
              </div>
              <p style={{ fontSize: '0.78125rem', color: '#cbd5e1', margin: '0.5rem 0 0', lineHeight: 1.4 }}>
                Ao acessar como entidade master, você tem autonomia completa sobre o painel executivo, acompanhamento financeiro de 7 fontes e distribuição de tarefas para os agentes.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: AGENTES DA ENTIDADE */}
        {activeTab === 'agents' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
              Agentes Operacionais da {activeTenant.name}:
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {agentUsers.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                  Nenhum agente cadastrado nesta entidade.
                </div>
              ) : (
                agentUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleLoginAgent(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.18)';
                      e.currentTarget.style.borderColor = '#34d399';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={user.name}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #10b981',
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block' }}>
                          {user.name}
                        </strong>
                        <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          {user.sectorName || 'Agente'} • Operação Kaizen
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(16, 185, 129, 0.25)',
                        color: '#6ee7b7',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                      }}
                    >
                      Acessar →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Unique Link Info */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            fontSize: '0.75rem',
            color: '#94a3b8',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          🔗 Link de Coleta da {activeTenant.name}:{' '}
          <Link href={`/d/${activeTenant.slug}`} target="_blank" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
            /d/{activeTenant.slug} ↗
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.78125rem', position: 'relative', zIndex: 10 }}>
        <p style={{ margin: 0 }}>
          Desenvolvido por <strong>Mauricio Grigol</strong> • Consultor Lean & Dev Full Stack
        </p>
      </div>
    </div>
  );
}
