'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Kanban,
  Wrench,
  TrendingUp,
  LayoutDashboard,
  Inbox,
  Menu,
  PlusCircle,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, toggleMobileMenu } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const navItems = isAdmin
    ? [
        { href: '/admin/dashboard', label: 'Painel', icon: LayoutDashboard },
        { href: '/admin/kanban', label: 'Kanban', icon: Kanban },
        { href: '/admin/triagem', label: 'Triagem', icon: Inbox },
        { href: '/admin/relatorios', label: 'ROI', icon: TrendingUp },
      ]
    : [
        { href: '/agente/kanban', label: 'Meu Kanban', icon: Kanban },
        { href: '/agente/ferramentas', label: 'Ferramentas', icon: Wrench },
        { href: '/agente/relatorio-pessoal', label: 'Entregas', icon: TrendingUp },
        { href: '/nova-demanda', label: 'Nova Demanda', icon: PlusCircle, isExternal: true },
      ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        backgroundColor: '#060a13',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'none', // Controlled by CSS @media (max-width: 1024px)
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 80,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
        padding: '0 0.5rem',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            target={item.isExternal ? '_blank' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
              color: isActive ? '#22d3ee' : '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.6875rem',
              fontWeight: isActive ? 800 : 600,
              padding: '0.35rem 0.5rem',
              borderRadius: '8px',
              minWidth: '54px',
              transition: 'color 0.15s ease',
            }}
          >
            <Icon size={19} color={isActive ? '#22d3ee' : '#94a3b8'} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Menu Drawer Toggle */}
      <button
        onClick={toggleMobileMenu}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.2rem',
          color: '#94a3b8',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '0.6875rem',
          fontWeight: 600,
          padding: '0.35rem 0.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        <Menu size={19} color="#94a3b8" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
