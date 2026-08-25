'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  User as UserIcon,
  ChevronDown,
  Bell,
  RefreshCw,
  Plus,
  Search,
  ExternalLink,
  Shield,
  UserCheck,
  Building,
  Sparkles,
  Award,
  Code,
  CheckCircle2,
  Menu,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
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
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        minHeight: '64px',
      }}
    >
      {/* Title / Current Route Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="mobile-hamburger-btn"
          aria-label="Abrir menu lateral"
          style={{
            background: 'none',
            border: 'none',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0f172a',
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            {title || (isAdmin ? 'Painel de Gestão Master' : 'Meu Fluxo de Trabalho Lean')}
          </h1>
          {subtitle && <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{subtitle}</p>}
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
          style={{ padding: '0.45rem 0.65rem' }}
        >
          <RefreshCw size={14} color="#64748b" />
        </button>

        {/* Public Form Shortcut Button */}
        <Link
          href={`/d/${currentUser?.tenantId === 'tenant_grigol_02' ? 'metalurgica-grigol' : 'rafitec'}`}
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#334155',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
          title="Abrir link de coleta da fábrica em nova aba"
        >
          <ExternalLink size={14} color="#2563eb" />
          <span>Link de Coleta</span>
        </Link>

        {/* New Action Button for Admin */}
        {isAdmin && onNewAction && (
          <button
            onClick={onNewAction}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Nova Ação Lean</span>
          </button>
        )}

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            paddingLeft: '0.75rem',
            borderLeft: '1px solid #e2e8f0',
          }}
        >
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={currentUser?.name || 'User'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: `2px solid ${isAdmin ? '#2563eb' : '#10b981'}`,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {currentUser?.name || 'Usuário'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
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
              gap: '0.35rem',
              padding: '0.4rem 0.65rem',
              marginLeft: '0.25rem',
              fontSize: '0.75rem',
              color: '#dc2626',
              borderColor: '#fca5a5',
              backgroundColor: '#fff5f5',
            }}
            title="Sair e escolher outro perfil de acesso"
          >
            <LogOut size={13} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
