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
  const { currentUser, allUsers, switchUser, refreshData, toggleMobileMenu } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handleSelectUser = (userId: string) => {
    switchUser(userId);
    setShowUserMenu(false);
    const selected = allUsers.find((u) => u.id === userId);
    if (selected?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/agente/kanban');
    }
  };

  return (
    <header
      className="app-topbar"
      style={{
        minHeight: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={toggleMobileMenu}
          className="mobile-hamburger-btn"
          aria-label="Abrir menu de navegação"
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            width: '38px',
            height: '38px',
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
            {title || (isAdmin ? 'Painel do Supervisor Lean' : 'Meu Fluxo de Trabalho Lean')}
          </h1>
          {subtitle && <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{subtitle}</p>}
        </div>
      </div>

      {/* Actions & Persona Switcher */}
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
        {/* Quick Demo Persona Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#f1f5f9',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Alternar Perfil:
          </span>
          <select
            value={currentUser?.id || ''}
            onChange={(e) => handleSelectUser(e.target.value)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <optgroup label="Supervisão">
              {allUsers
                .filter((u) => u.role === 'admin')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    🛡️ {u.name} (Admin / Supervisor)
                  </option>
                ))}
            </optgroup>
            <optgroup label="Agentes Operacionais">
              {allUsers
                .filter((u) => u.role === 'agent')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.name} ({u.sectorName || 'Agente'})
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Refresh & Reset Seed Data Button */}
        <button
          onClick={() => {
            if (confirm('Deseja recarregar e atualizar todos os dados para o padrão de demonstração Lean?')) {
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
          href="/nova-demanda"
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
          title="Abrir formulário público da internet em nova aba"
        >
          <ExternalLink size={14} color="#2563eb" />
          <span>Formulário Público</span>
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
              {isAdmin ? 'Supervisor Master' : currentUser?.sectorName || 'Agente'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
