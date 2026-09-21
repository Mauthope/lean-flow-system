'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Modal } from '@/components/ui/Modal';
import {
  LayoutDashboard,
  Kanban,
  Inbox,
  Users,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  ExternalLink,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Shield,
  UserCheck,
  LucideIcon,
  Wrench,
  Calculator,
  HelpCircle,
  X,
  Timer,
  Settings,
  Radio,
  Lightbulb,
  Sparkles,
  Layers,
  Bot,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
  Factory,
  Eye,
  Sun,
  Moon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, currentTenant, isMobileMenuOpen, setIsMobileMenuOpen, isSidebarCollapsed, toggleSidebar } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';
  const isMaster =
    currentUser?.isMaster === true ||
    currentUser?.email?.toLowerCase() === 'mauricio.grigol@rafitec.com.br' ||
    currentUser?.email?.toLowerCase() === 'master@rafitec.com.br';

  const adminNav: NavSection[] = [
    {
      label: 'Visão Geral',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard Lean', icon: LayoutDashboard },
        { href: '/admin/alta-gerencia', label: 'Alta Gerência', icon: Target, badge: 'Hoshin' },
        { href: '/admin/kanban', label: 'Kanban Geral', icon: Kanban },
        { href: '/admin/triagem', label: 'Triagem de Demandas', icon: Inbox, badge: 'Público' },
      ],
    },
    {
      label: 'Cadastros & Equipe',
      items: [
        ...(isMaster
          ? [{ href: '/admin/entidades', label: 'Gestão de Entidades', icon: Factory, badge: 'Plantas' }]
          : []),
        { href: '/admin/agentes', label: 'Equipe & Acessos', icon: Users },
        { href: '/admin/setores', label: 'Setores & Assessment', icon: Building2, badge: 'Radar' },
      ],
    },
    {
      label: 'Inteligência & Métodos',
      items: [
        { href: '/admin/historico-kaizen', label: 'Histórico Kaizen', icon: Sparkles, badge: 'IA' },
        { href: '/admin/integracoes-ia', label: 'Integrações de IA', icon: Bot, badge: 'Sensei' },
        { href: '/admin/relatorios', label: 'Custo Evitado & ROI', icon: TrendingUp },
        { href: '/agente/ferramentas', label: 'Academia & Ferramentas', icon: BookOpen, badge: 'Edu' },
      ],
    },
    {
      label: 'Fábrica & Comunicação',
      items: [
        { href: '/admin/tpm', label: 'TPM', icon: Settings },
        { href: '/admin/canal-kaizen', label: 'Canal Kaizen', icon: Lightbulb, badge: 'Ideias' },
      ],
    },
  ];

  const viewerNav: NavSection[] = [
    {
      label: 'Visão Executiva',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard Lean', icon: LayoutDashboard },
        { href: '/admin/alta-gerencia', label: 'Alta Gerência', icon: Target, badge: 'Hoshin' },
        { href: '/admin/kanban', label: 'Kanban Geral', icon: Kanban },
      ],
    },
    {
      label: 'Inteligência & Métodos',
      items: [
        { href: '/admin/relatorios', label: 'Custo Evitado & ROI', icon: TrendingUp },
        { href: '/admin/historico-kaizen', label: 'Histórico Kaizen', icon: Sparkles, badge: 'IA' },
        { href: '/agente/ferramentas', label: 'Academia & Ferramentas', icon: BookOpen, badge: 'Edu' },
      ],
    },
    {
      label: 'Fábrica & Maturidade',
      items: [
        { href: '/admin/setores', label: 'Setores & Assessment', icon: Building2, badge: 'Radar' },
        { href: '/admin/tpm', label: 'TPM', icon: Settings },
        { href: '/admin/canal-kaizen', label: 'Canal Kaizen', icon: Lightbulb, badge: 'Ideias' },
      ],
    },
  ];

  const agentNav: NavSection[] = [
    {
      label: 'Meu Trabalho',
      items: [
        { href: '/agente/kanban', label: 'Meu Kanban', icon: Kanban },
        { href: '/agente/setores', label: 'Setores & Assessment', icon: Building2, badge: 'Radar' },
        { href: '/agente/relatorio-pessoal', label: 'Minhas Entregas & ROI', icon: TrendingUp },
      ],
    },
    {
      label: 'Práticas & Métodos',
      items: [
        { href: '/agente/historico-kaizen', label: 'Histórico Kaizen', icon: Sparkles, badge: 'IA' },
        { href: '/agente/ferramentas', label: 'Academia & Ferramentas', icon: BookOpen, badge: 'Edu' },
        { href: '/agente/ferramentas/calculadora-roi', label: 'Calculadora de ROI', icon: Calculator },
      ],
    },
    {
      label: 'Fábrica & Comunicação',
      items: [
        { href: '/agente/tpm', label: 'TPM', icon: Settings },
        { href: '/agente/canal-kaizen', label: 'Canal Kaizen', icon: Lightbulb, badge: 'Ideias' },
      ],
    },
  ];

  const currentNav = isViewer ? viewerNav : isAdmin ? adminNav : agentNav;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{
          width: isSidebarCollapsed ? '72px' : '260px',
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border-subtle)',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 95,
          transition: 'width 0.25s cubic-bezier(0.2, 0, 0, 1), transform 0.25s ease, background-color 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Brand & Toggle Header */}
        <div
          style={{
            padding: isSidebarCollapsed ? '1rem 0.5rem' : '1.15rem 1.15rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* BagTime-style LF Logo */}
              <div
                onClick={isSidebarCollapsed ? toggleSidebar : undefined}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #10b981 100%)',
                  padding: '1.5px',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
                  cursor: isSidebarCollapsed ? 'pointer' : 'default',
                  flexShrink: 0,
                }}
                title={isSidebarCollapsed ? 'Clique para expandir o menu' : 'FluxoLean PRO'}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#060a13',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    color: '#22d3ee',
                  }}
                >
                  FL
                </div>
              </div>

              {!isSidebarCollapsed && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
                      Fluxo<span style={{ background: 'linear-gradient(90deg, #06b6d4, #0d9488, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lean</span>
                    </span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        backgroundColor: isDark ? 'rgba(6, 182, 212, 0.18)' : 'rgba(2, 132, 199, 0.12)',
                        color: isDark ? '#22d3ee' : '#0284c7',
                        border: isDark ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid rgba(2, 132, 199, 0.3)',
                        padding: '0.05rem 0.3rem',
                        borderRadius: '4px',
                      }}
                    >
                      PRO
                    </span>
                  </div>
                  <p style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>Engenharia Lean & ROI</p>
                </div>
              )}
            </div>

            {/* Toggle Button in Header */}
            {!isSidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Recolher menu lateral"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                    color: isDark ? '#94a3b8' : '#475569',
                    borderRadius: '8px',
                    width: '30px',
                    height: '30px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0';
                    e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
                    e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569';
                  }}
                >
                  <PanelLeftClose size={15} />
                </button>

                {/* Close Button for Mobile Drawer */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-only-btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    width: '30px',
                    height: '30px',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Tenant Pill when Expanded */}
          {!isSidebarCollapsed && (
            isMaster ? (
              <Link
                href="/admin/entidades"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(6, 182, 212, 0.12)' : '#e0f2fe';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(6, 182, 212, 0.3)' : '#bae6fd';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1';
                }}
                title="Clique para alternar ou gerenciar plantas fabris"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                  <Factory size={13} color={isDark ? '#22d3ee' : '#0284c7'} />
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentTenant?.name || 'Organização Lean'}
                  </span>
                </div>
                <span style={{ fontSize: '0.65rem', color: isDark ? '#22d3ee' : '#0284c7', fontWeight: 800 }}>
                  Mudar
                </span>
              </Link>
            ) : (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                title={`Unidade Fabril: ${currentTenant?.name || 'Organização Lean'}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                  <Factory size={13} color={isDark ? '#22d3ee' : '#0284c7'} />
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentTenant?.name || 'Organização Lean'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
                    color: isDark ? '#34d399' : '#15803d',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                  }}
                >
                  Planta
                </span>
              </div>
            )
          )}

          {/* Viewer Executive Pill */}
          {!isSidebarCollapsed && isViewer && (
            <div
              style={{
                marginTop: '0.45rem',
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Eye size={13} color="#c084fc" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#d8b4fe', lineHeight: 1.2 }}>
                  Consulta Executiva
                </span>
                <span style={{ fontSize: '0.6rem', color: '#a855f7' }}>
                  Modo Somente Leitura
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div
          style={{
            flex: 1,
            padding: isSidebarCollapsed ? '0.75rem 0.4rem' : '0.85rem 0.65rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: isSidebarCollapsed ? '0.85rem' : '1.15rem',
          }}
        >
          {currentNav.map((section, idx) => (
            <div key={idx}>
              {!isSidebarCollapsed && (
                <p
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: isDark ? '#64748b' : '#64748b',
                    padding: '0 0.5rem 0.35rem',
                  }}
                >
                  {section.label}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                        padding: isSidebarCollapsed ? '0.65rem 0' : '0.55rem 0.7rem',
                        borderRadius: '9px',
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive
                          ? (isDark ? '#22d3ee' : '#0284c7')
                          : (isDark ? '#94a3b8' : '#475569'),
                        backgroundColor: isActive
                          ? (isDark ? 'rgba(6, 182, 212, 0.14)' : '#e0f2fe')
                          : 'transparent',
                        border: isActive
                          ? (isDark ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid #bae6fd')
                          : '1px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive
                          ? (isDark ? '0 2px 10px rgba(6, 182, 212, 0.15)' : '0 2px 8px rgba(2, 132, 199, 0.12)')
                          : 'none',
                        position: 'relative',
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
                          e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Icon size={18} color={isActive ? (isDark ? '#22d3ee' : '#0284c7') : (isDark ? '#94a3b8' : '#475569')} />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isSidebarCollapsed && item.badge && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            backgroundColor: isDark ? 'rgba(6, 182, 212, 0.2)' : '#e0f2fe',
                            color: isDark ? '#22d3ee' : '#0284c7',
                            padding: '0.08rem 0.35rem',
                            borderRadius: '9999px',
                            border: isDark ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid #bae6fd',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Small dot indicator when collapsed & active */}
                      {isSidebarCollapsed && isActive && (
                        <span
                          style={{
                            position: 'absolute',
                            right: '6px',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: isDark ? '#22d3ee' : '#0284c7',
                            boxShadow: isDark ? '0 0 6px #22d3ee' : '0 0 4px #0284c7',
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Area */}
        <div
          style={{
            padding: isSidebarCollapsed ? '0.75rem 0.35rem' : '0.75rem 0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            backgroundColor: 'var(--bg-sidebar)',
          }}
        >
          {/* Theme Quick Switcher in Sidebar */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              padding: isSidebarCollapsed ? '0.45rem 0' : '0.45rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.725rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {isDark ? <Sun size={14} color="#fbbf24" /> : <Moon size={14} color="#0284c7" />}
              {!isSidebarCollapsed && (
                <span>
                  {isDark ? 'Tema Escuro' : 'Tema Claro'}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  color: isDark ? '#38bdf8' : '#0284c7',
                  backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                }}
              >
                {isDark ? 'Mudar p/ Claro' : 'Mudar p/ Escuro'}
              </span>
            )}
          </button>

          {/* Creator Pill */}
          <div
            onClick={() => setShowAuthorModal(true)}
            style={{
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : '#f8fafc',
              border: '1px solid var(--border-subtle)',
              padding: isSidebarCollapsed ? '0.5rem 0' : '0.5rem 0.65rem',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '0.55rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(15, 23, 42, 1)' : '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(15, 23, 42, 0.9)' : '#f8fafc';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
            title="Desenvolvido por Mauricio Grigol"
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.7rem',
                color: '#020617',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)',
              }}
            >
              MG
            </div>

            {!isSidebarCollapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                  <span style={{ fontSize: '0.6rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Desenvolvido por:
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem', marginTop: '0.1rem' }}>
                  <strong style={{ fontSize: '0.78125rem', color: isDark ? '#ffffff' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Mauricio Grigol
                  </strong>
                  <Link
                    href="/memorial"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      backgroundColor: isDark ? 'rgba(14, 165, 233, 0.2)' : '#e0f2fe',
                      color: isDark ? '#38bdf8' : '#0284c7',
                      border: isDark ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid #bae6fd',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                    title="Acessar Memorial Descritivo Metodológico"
                  >
                    <BookOpen size={10} /> Obra
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Expand Button at the bottom when collapsed */}
          {isSidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expandir menu lateral"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                color: isDark ? '#22d3ee' : '#0284c7',
                borderRadius: '8px',
                width: '100%',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(6, 182, 212, 0.2)' : '#e0f2fe';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
              }}
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Developer Authorship Modal */}
      <Modal
        isOpen={showAuthorModal}
        onClose={() => setShowAuthorModal(false)}
        title="Créditos de Desenvolvimento & Autoria"
        subtitle="Informações técnicas e arquiteturais da plataforma FluxoLean"
        maxWidth="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', alignItems: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.5rem',
              color: '#020617',
              boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
              margin: '0 auto',
            }}
          >
            MG
          </div>

          <div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                textTransform: 'uppercase',
              }}
            >
              Criador & Arquiteto da Solução
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', marginTop: '0.4rem', fontFamily: 'var(--font-heading)' }}>
              Mauricio Grigol
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>
              Consultor Lean & Desenvolvedor Full Stack
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#0d1527',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.125rem',
              textAlign: 'left',
              width: '100%',
              fontSize: '0.8125rem',
              color: '#cbd5e1',
              lineHeight: 1.5,
            }}
          >
            <p style={{ marginBottom: '0.625rem' }}>
              Plataforma concebida e desenvolvida por <strong>Mauricio Grigol</strong>, unindo engenharia de tempos,
              metodologia PDCA, triagem industrial de demandas e apuração automática de custos evitados e ROI.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#22d3ee' }}>
                ✓ Next.js 14 App Router
              </span>
              <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#34d399' }}>
                ✓ Multi-tenant Architecture
              </span>
              <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#fbbf24' }}>
                ✓ 7 Fontes de Custo Evitado
              </span>
              <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#c084fc' }}>
                ✓ Relatório A3 Paisagem PDCA
              </span>
            </div>
          </div>

          {/* Destaque para o Memorial Descritivo & Obra Intelectual */}
          <Link
            href="/memorial"
            onClick={() => setShowAuthorModal(false)}
            style={{
              width: '100%',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              backgroundColor: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              background: '#0284c7',
              color: '#ffffff',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0369a1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#0284c7';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <BookOpen size={18} />
            <span>Abrir Memorial Metodológico & Engenharia Lean</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowAuthorModal(false)}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.55rem', fontSize: '0.8125rem' }}
          >
            Fechar
          </button>
        </div>
      </Modal>
    </>
  );
};
