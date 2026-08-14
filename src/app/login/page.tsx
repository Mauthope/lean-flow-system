'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, UserCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { allUsers, loginAs } = useAuth();

  const [selectedUser, setSelectedUser] = useState(allUsers[0]?.id || '');
  const [email, setEmail] = useState('admin@nexuslean.com');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      loginAs(selectedUser);
      const user = allUsers.find((u) => u.id === selectedUser);
      if (user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/agente/kanban');
      }
    }
  };

  const handleSelectQuick = (userId: string) => {
    setSelectedUser(userId);
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setEmail(user.email);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b1329',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              margin: '0 auto 1rem',
            }}
          >
            LN
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Acesso ao LeanFlow
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
            Selecione o perfil desejado para acessar a plataforma
          </p>
        </div>

        {/* Quick Profile Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Escolha o Perfil de Teste (1-Clique):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {allUsers.map((user) => {
              const isSelected = selectedUser === user.id;
              const isAdmin = user.role === 'admin';
              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectQuick(user.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                        {user.name}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {isAdmin ? 'Supervisor Master' : user.sectorName || 'Agente'}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: isAdmin ? '#dbeafe' : '#dcfce7',
                      color: isAdmin ? '#1e40af' : '#15803d',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                    }}
                  >
                    {isAdmin ? 'ADMIN' : 'AGENTE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email de Acesso:</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Senha:</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.75rem', marginTop: '0.5rem', width: '100%', fontSize: '0.9375rem' }}
          >
            Acessar Sistema <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <Link href="/" style={{ fontSize: '0.8125rem', color: '#64748b', textDecoration: 'none' }}>
            ← Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
