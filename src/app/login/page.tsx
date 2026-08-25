'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, UserCheck, Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Building2, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { allUsers, loginAs } = useAuth();

  const [activeTab, setActiveTab] = useState<'admin' | 'agent'>('admin');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const adminUsers = allUsers.filter((u) => u.role === 'admin');
  const agentUsers = allUsers.filter((u) => u.role === 'agent');

  const currentUsers = activeTab === 'admin' ? adminUsers : agentUsers;
  const currentSelectedUser = allUsers.find((u) => u.id === selectedUserId) || currentUsers[0] || allUsers[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = currentSelectedUser;
    if (targetUser) {
      loginAs(targetUser.id);
      if (targetUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/agente/kanban');
      }
    }
  };

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
        backgroundColor: '#0b1329',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Back Link */}
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1.25rem' }}>
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
          <ArrowLeft size={16} /> Voltar para a Página Inicial
        </Link>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.4rem',
              margin: '0 auto 0.875rem',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
            }}
          >
            LN
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Acesso ao LeanFlow System
          </h1>
          <p style={{ fontSize: '0.84375rem', color: '#64748b', marginTop: '0.35rem' }}>
            Selecione o perfil desejado para navegar pela plataforma
          </p>
        </div>

        {/* Role Selector Tabs (Supervisor vs Agente) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            backgroundColor: '#f1f5f9',
            padding: '0.35rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
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
              padding: '0.65rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'admin' ? '#ffffff' : 'transparent',
              color: activeTab === 'admin' ? '#1d4ed8' : '#64748b',
              fontWeight: 800,
              fontSize: '0.84375rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'admin' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
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
              padding: '0.65rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'agent' ? '#ffffff' : 'transparent',
              color: activeTab === 'agent' ? '#047857' : '#64748b',
              fontWeight: 800,
              fontSize: '0.84375rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'agent' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <UserCheck size={16} />
            <span>Agente Operacional</span>
          </button>
        </div>

        {/* User Card List for Quick 1-Click Access */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
            {activeTab === 'admin' ? 'Perfis de Supervisão Cadastrados:' : 'Agentes Operacionais da Fábrica:'}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {currentUsers.map((user) => {
              const isSelected = (selectedUserId || currentUsers[0]?.id) === user.id;
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
                    border: isSelected ? `2px solid ${isAdmin ? '#2563eb' : '#10b981'}` : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? (isAdmin ? '#eff6ff' : '#ecfdf5') : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>
                        {user.name}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {isAdmin ? 'Supervisor Master • Gestão & ROI' : `${user.sectorName || 'Agente'} • Operação Kaizen`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        backgroundColor: isAdmin ? '#dbeafe' : '#dcfce7',
                        color: isAdmin ? '#1e40af' : '#15803d',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                      }}
                    >
                      {isAdmin ? 'Entrar como Admin' : 'Entrar como Agente'} →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informative Note */}
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            fontSize: '0.78125rem',
            color: '#64748b',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          💡 <em>Ambiente de demonstração interativo: clique em qualquer perfil acima para acessar o sistema instantaneamente com as permissões correspondentes.</em>
        </div>

        {/* Public Demand Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Quer apenas sugerir uma melhoria?{' '}
            <Link href="/nova-demanda" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
              Abrir Formulário Público
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.78125rem' }}>
        <p style={{ margin: 0 }}>
          Desenvolvido por <strong>Mauricio Grigol</strong> • Consultor Lean & Dev Full Stack
        </p>
      </div>
    </div>
  );
}
