'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, UserCheck, Lock, ArrowRight, ArrowLeft, Sparkles, Building2, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { allUsers, loginAs } = useAuth();

  const [activeTab, setActiveTab] = useState<'admin' | 'agent'>('admin');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const adminUsers = allUsers.filter((u) => u.role === 'admin');
  const agentUsers = allUsers.filter((u) => u.role === 'agent');

  const currentUsers = activeTab === 'admin' ? adminUsers : agentUsers;

  const handleQuickLoginDirect = (userId: string) => {
    loginAs(userId);
    const target = allUsers.find((u) => u.id === userId);
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
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1.25rem', position: 'relative', zIndex: 10 }}>
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
          maxWidth: '520px',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
            Selecione o perfil desejado para autenticar na plataforma
          </p>
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
            marginBottom: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              if (adminUsers[0]) setSelectedUserId(adminUsers[0].id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.75rem',
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
            <span>Supervisor / Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('agent');
              if (agentUsers[0]) setSelectedUserId(agentUsers[0].id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.75rem',
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
            <span>Agente Operacional</span>
          </button>
        </div>

        {/* User Card List for Quick 1-Click Access */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
            {activeTab === 'admin' ? 'Perfis de Supervisão (1-Clique):' : 'Agentes Operacionais da Fábrica (1-Clique):'}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentUsers.map((user) => {
              const isAdmin = user.role === 'admin';

              return (
                <div
                  key={user.id}
                  onClick={() => handleQuickLoginDirect(user.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${isAdmin ? '#3b82f6' : '#10b981'}`,
                      }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block' }}>
                        {user.name}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {isAdmin ? 'Supervisor Master • Gestão & ROI' : `${user.sectorName || 'Agente'} • Operação Kaizen`}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: isAdmin ? 'rgba(37, 99, 235, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                      color: isAdmin ? '#93c5fd' : '#6ee7b7',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${isAdmin ? 'rgba(59, 130, 246, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                    }}
                  >
                    Acessar →
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informative Note */}
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            fontSize: '0.78125rem',
            color: '#94a3b8',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          💡 <em>Selecione qualquer perfil acima para testar a experiência personalizada de cada perfil operacional.</em>
        </div>

        {/* Public Demand Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
            Quer cadastrar uma sugestão sem autenticar?{' '}
            <Link href="/nova-demanda" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
              Formulário Kaizen
            </Link>
          </p>
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
