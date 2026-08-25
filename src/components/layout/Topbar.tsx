'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  RefreshCw,
  Plus,
  ExternalLink,
  Menu,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { dataService } from '@/services/dataService';

export const Topbar: React.FC<{ title?: string; subtitle?: string; onNewAction?: () => void }> = ({
  title,
  subtitle,
  onNewAction,
}) => {
  const router = useRouter();
  const { currentUser, refreshData, toggleMobileMenu, logout } = useAuth();

  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header
      className="topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(6, 10, 19, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        minHeight: '60px',
      }}
    >
      {/* Route Title Context & Mobile Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="mobile-hamburger-btn"
          aria-label="Abrir menu lateral"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.45rem',
            borderRadius: '8px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#f8fafc',
          }}
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {title || (isAdmin ? 'Painel de Gestão Master' : 'Meu Fluxo de Trabalho Lean')}
          </h1>
          {subtitle && <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>{subtitle}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
        {/* Refresh & Reset Seed Data Button */}
        <button
          onClick={() => {
            if (confirm('Deseja recarregar e atualizar todos os dados para o padrão Rafitec Master?')) {
              dataService.resetToDefaults();
              refreshData();
            }
          }}
          className="btn btn-secondary btn-sm"
          title="Restaurar dados de demonstração padrão"
          style={{
            padding: '0.4rem 0.6rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
          }}
        >
          <RefreshCw size={14} color="#94a3b8" />
        </button>

        {/* Public Form Shortcut Button */}
        <Link
          href={`/d/${currentUser?.tenantId === 'tenant_grigol_02' ? 'metalurgica-grigol' : 'rafitec'}`}
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
          title="Abrir link de coleta da fábrica em nova aba"
        >
          <ExternalLink size={13} color="#22d3ee" />
          <span>Link de Coleta</span>
        </Link>

        {/* New Action Button for Admin */}
        {isAdmin && onNewAction && (
          <button
            onClick={onNewAction}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={15} />
            <span>Nova Ação Lean</span>
          </button>
        )}

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            paddingLeft: '0.75rem',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={currentUser?.name || 'User'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: `2px solid ${isAdmin ? '#06b6d4' : '#10b981'}`,
              boxShadow: `0 0 10px ${isAdmin ? 'rgba(6, 182, 212, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
              {currentUser?.name || 'Usuário'}
            </span>
            <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
              {isAdmin ? 'Entidade Master' : currentUser?.sectorName || 'Agente Operacional'}
            </span>
          </div>

          {/* Logout / Switch User Button */}
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.55rem',
              marginLeft: '0.2rem',
              fontSize: '0.7rem',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
            title="Sair e escolher outro perfil de acesso"
          >
            <LogOut size={12} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
