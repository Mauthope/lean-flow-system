'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Tenant } from '@/lib/types';
import { Shield, UserCheck, Lock, ArrowRight, ArrowLeft, Building2, Plus, Check } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { currentTenant, loginAs, refreshData } = useAuth();

  const [tenants, setTenants] = useState<Tenant[]>(() => dataService.getTenants());
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    () => currentTenant?.id || dataService.getTenants()[0]?.id || 'tenant_nexus_01'
  );
  const [activeTab, setActiveTab] = useState<'admin' | 'agent'>('admin');

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
  const tenantUsers = dataService.getUsers(activeTenant?.id);
  const adminUsers = tenantUsers.filter((u) => u.role === 'admin');
  const agentUsers = tenantUsers.filter((u) => u.role === 'agent');

  const currentUsers = activeTab === 'admin' ? adminUsers : agentUsers;

  const handleSelectTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const targetTenant = tenants.find((t) => t.id === tenantId);
    if (targetTenant) {
      dataService.setCurrentTenant(targetTenant);
      refreshData();
    }
  };

  const handleQuickLoginDirect = (userId: string) => {
    if (activeTenant) {
      dataService.setCurrentTenant(activeTenant);
    }
    loginAs(userId);
    const target = tenantUsers.find((u) => u.id === userId);
    if (target?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/agente/kanban');
    }
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
      <div style={{ width: '100%', maxWidth: '560px', marginBottom: '1.25rem', position: 'relative', zIndex: 10 }}>
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
          maxWidth: '560px',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
            Selecione a entidade e o usuário para autenticar
          </p>
        </div>

        {/* TENANT / ENTITY SELECTOR */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            <Building2 size={14} /> Selecionar Entidade / Unidade Fabril:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
            {tenants.map((t) => {
              const isSelected = activeTenant?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTenant(t.id)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <strong style={{ fontSize: '0.8125rem', color: isSelected ? '#ffffff' : '#cbd5e1', display: 'block' }}>
                    🏢 {t.name}
                  </strong>
                  <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                    Slug: /d/{t.slug}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Selector Tabs (Supervisor vs Agente) */}
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
            onClick={() => setActiveTab('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.65rem',
              borderRadius: '10px',
              border: activeTab === 'admin' ? '1px solid rgba(96, 165, 250, 0.5)' : '1px solid transparent',
              backgroundColor: activeTab === 'admin' ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
              color: activeTab === 'admin' ? '#93c5fd' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.84375rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'admin' ? '0 0 15px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={16} />
            <span>Supervisores ({adminUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agent')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.65rem',
              borderRadius: '10px',
              border: activeTab === 'agent' ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid transparent',
              backgroundColor: activeTab === 'agent' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: activeTab === 'agent' ? '#6ee7b7' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.84375rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'agent' ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <UserCheck size={16} />
            <span>Agentes ({agentUsers.length})</span>
          </button>
        </div>

        {/* User Card List for Quick 1-Click Access */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
            {activeTab === 'admin' ? `Supervisores da ${activeTenant.name}:` : `Agentes Operacionais da ${activeTenant.name}:`}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {currentUsers.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                Nenhum usuário deste perfil cadastrado nesta entidade.
              </div>
            ) : (
              currentUsers.map((user) => {
                const isAdmin = user.role === 'admin';

                return (
                  <div
                    key={user.id}
                    onClick={() => handleQuickLoginDirect(user.id)}
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
                      e.currentTarget.style.backgroundColor = isAdmin ? 'rgba(37, 99, 235, 0.2)' : 'rgba(16, 185, 129, 0.18)';
                      e.currentTarget.style.borderColor = isAdmin ? '#60a5fa' : '#34d399';
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
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={user.name}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${isAdmin ? '#3b82f6' : '#10b981'}`,
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block' }}>
                          {user.name}
                        </strong>
                        <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          {isAdmin ? 'Supervisor Master • Gestão & ROI' : `${user.sectorName || 'Agente'} • Operação Kaizen`}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        backgroundColor: isAdmin ? 'rgba(37, 99, 235, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                        color: isAdmin ? '#93c5fd' : '#6ee7b7',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: `1px solid ${isAdmin ? 'rgba(59, 130, 246, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                      }}
                    >
                      Acessar →
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Unique Link Info for this selected factory */}
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
