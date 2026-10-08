'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  RefreshCw,
  Plus,
  ExternalLink,
  Menu,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';
import { dataService } from '@/services/dataService';
import { getUserHierarchyInfo, isMasterUser, isEntityManager } from '@/lib/types';
import { UserProfileModal } from '@/components/forms/UserProfileModal';

export const Topbar: React.FC<{ title?: string; subtitle?: string; onNewAction?: () => void }> = ({
  title,
  subtitle,
  onNewAction,
}) => {
  const router = useRouter();
  const { currentUser, currentTenant, refreshData, toggleMobileMenu, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isMaster = isMasterUser(currentUser);
  const isEntityMgr = isEntityManager(currentUser);
  const isAdmin = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';
  const hierarchyInfo = getUserHierarchyInfo(currentUser, currentTenant?.name);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header
      className="topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
        backgroundColor: isDark ? 'rgba(6, 10, 19, 0.85)' : 'rgba(255, 255, 255, 0.94)',
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
            background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
            padding: '0.45rem',
            borderRadius: '8px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isDark ? '#f8fafc' : '#0f172a',
          }}
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {title || (
              isMaster
                ? 'Painel Master de Governança Fabril'
                : isEntityMgr
                ? `Painel de Gestão Lean • ${currentTenant?.name || 'Unidade'}`
                : isViewer
                ? 'Painel Executivo • Consulta Diretoria'
                : 'Meu Fluxo de Trabalho Lean'
            )}
          </h1>
          {subtitle && <p style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>{subtitle}</p>}
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

        {/* Quick Theme Switcher (Sol / Lua) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          aria-label={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          style={{
            padding: '0.4rem 0.65rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            borderRadius: '8px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
            color: isDark ? '#fbbf24' : '#0284c7',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {isDark ? <Sun size={14} color="#fbbf24" /> : <Moon size={14} color="#0284c7" />}
          <span style={{ fontSize: '0.725rem', fontWeight: 700 }}>
            {isDark ? 'Claro' : 'Escuro'}
          </span>
        </button>


        {/* Public Form Shortcut Button */}
        <Link
          href={`/d/${currentTenant?.slug || 'rafitec'}`}
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#f1f5f9',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
            color: isDark ? '#cbd5e1' : '#334155',
            fontSize: '0.75rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}
          title="Abrir link de coleta da fábrica em nova aba"
        >
          <ExternalLink size={13} color={isDark ? '#22d3ee' : '#0284c7'} />
          <span>Link de Coleta ({currentTenant?.slug || 'rafitec'})</span>
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

        {/* User Card (Clicável para editar foto e dados do perfil) */}
        <div
          onClick={() => setIsProfileModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            paddingLeft: '0.75rem',
            borderLeft: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            cursor: 'pointer',
            padding: '0.35rem 0.5rem 0.35rem 0.75rem',
            borderRadius: '8px',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Clique para alterar sua foto de perfil e dados de usuário"
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
              border: `2px solid ${isMaster ? '#06b6d4' : isEntityMgr ? '#38bdf8' : isViewer ? '#a855f7' : '#10b981'}`,
              boxShadow: `0 0 10px ${isMaster ? 'rgba(6, 182, 212, 0.35)' : isEntityMgr ? 'rgba(56, 189, 248, 0.35)' : isViewer ? 'rgba(168, 85, 247, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.2 }}>
              {currentUser?.name || 'Usuário'}
            </span>
            <span
              style={{
                fontSize: '0.675rem',
                color: isDark
                  ? (isMaster ? '#22d3ee' : isEntityMgr ? '#38bdf8' : isViewer ? '#c084fc' : '#34d399')
                  : (isMaster ? '#0891b2' : isEntityMgr ? '#0284c7' : isViewer ? '#7e22ce' : '#059669'),
                fontWeight: 700,
              }}
            >
              {hierarchyInfo.roleName}
            </span>
          </div>

          {/* Logout / Switch User Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
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

      {/* Modal de Edição de Perfil do Usuário Logado */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
