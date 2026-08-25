'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  Sparkles,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const adminNav: NavSection[] = [
    {
      label: 'Visão Geral',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard Lean', icon: LayoutDashboard },
        { href: '/admin/kanban', label: 'Kanban Geral', icon: Kanban },
        { href: '/admin/triagem', label: 'Triagem de Demandas', icon: Inbox, badge: 'Público' },
      ],
    },
    {
      label: 'Cadastros & Equipe',
      items: [
        { href: '/admin/agentes', label: 'Gestão de Agentes', icon: Users },
        { href: '/admin/setores', label: 'Gestão de Setores', icon: Building2 },
      ],
    },
    {
      label: 'Inteligência & Métodos',
      items: [
        { href: '/admin/relatorios', label: 'Custo Evitado & ROI', icon: TrendingUp },
        { href: '/agente/ferramentas', label: 'Ferramentas Lean', icon: Wrench },
        { href: '/agente/ferramentas/cronoanalise', label: 'Cronoanálise & Tempos', icon: Timer, badge: 'Novo' },
      ],
    },
    {
      label: 'Fábrica & Comunicação',
      items: [
        { href: '/admin/tpm', label: 'TPM', icon: Settings },
        { href: '/admin/canal-kaizen', label: 'Canal Kaizen', icon: Radio },
      ],
    },
  ];

  const agentNav: NavSection[] = [
    {
      label: 'Meu Trabalho',
      items: [
        { href: '/agente/kanban', label: 'Meu Kanban', icon: Kanban },
        { href: '/agente/relatorio-pessoal', label: 'Minhas Entregas & ROI', icon: TrendingUp },
      ],
    },
    {
      label: 'Práticas & Métodos',
      items: [
        { href: '/agente/ferramentas', label: 'Hub de Ferramentas', icon: Wrench },
        { href: '/agente/ferramentas/cronoanalise', label: 'Cronoanálise & Tempos', icon: Timer, badge: 'Novo' },
        { href: '/agente/ferramentas/calculadora-roi', label: 'Calculadora de ROI', icon: Calculator },
      ],
    },
    {
      label: 'Fábrica & Comunicação',
      items: [
        { href: '/agente/tpm', label: 'TPM', icon: Settings },
        { href: '/agente/canal-kaizen', label: 'Canal Kaizen', icon: Radio },
      ],
    },
  ];

  const currentNav = isAdmin ? adminNav : agentNav;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{
          width: '270px',
          backgroundColor: '#0b1329',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 95,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Brand & Organization */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                }}
              >
                LN
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                    LeanFlow
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(37, 99, 235, 0.25)',
                      color: '#60a5fa',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                    }}
                  >
                    PRO
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fluxo Contínuo & ROI</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {/* Hide / Collapse Sidebar Button (Desktop & Mobile) */}
              <button
                type="button"
                onClick={toggleSidebar}
                title="Ocultar Menu Lateral"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
              >
                <PanelLeftClose size={16} />
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
                  width: '32px',
                  height: '32px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

        {/* Tenant Pill */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <Building2 size={14} color="#94a3b8" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#cbd5e1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={currentTenant?.name}
            >
              {currentTenant?.name || 'Organização Lean'}
            </span>
          </div>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: isAdmin ? 'rgba(37, 99, 235, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {isAdmin ? <Shield size={16} color="#60a5fa" /> : <UserCheck size={16} color="#34d399" />}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.725rem', fontWeight: 700, color: isAdmin ? '#93c5fd' : '#a7f3d0' }}>
            {isAdmin ? 'PERFIL: SUPERVISOR (ADMIN)' : 'PERFIL: AGENTE LEAN'}
          </p>
          <p style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
            {isAdmin ? 'Acesso total a métricas e cadastros' : `Acesso restrito: ${currentUser?.sectorName || 'Setor'}`}
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        {currentNav.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '1.5rem' }}>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748b',
                padding: '0 0.625rem 0.5rem',
              }}
            >
              {section.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.84375rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#f1f5f9';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <Icon size={18} color={isActive ? '#60a5fa' : '#94a3b8'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: '#f59e0b',
                          color: '#000000',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '9999px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Developer Authorship Box - Mauricio Grigol */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          onClick={() => setShowAuthorModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.75rem',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Clique para ver detalhes do desenvolvedor e arquiteto da solução"
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.25)';
            e.currentTarget.style.borderColor = '#60a5fa';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.35)';
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8125rem',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
              flexShrink: 0,
            }}
          >
            MG
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '0.65rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', display: 'block' }}>
              Desenvolvido por:
            </span>
            <strong style={{ fontSize: '0.84375rem', color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Mauricio Grigol
            </strong>
            <span style={{ fontSize: '0.675rem', color: '#cbd5e1' }}>
              Consultor Lean & Dev Full Stack
            </span>
          </div>
          <Sparkles size={14} color="#93c5fd" />
        </div>

        <Link
          href={`/d/${currentTenant?.slug || 'rafitec'}`}
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background-color 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
          title={`Link Exclusivo desta Entidade: /d/${currentTenant?.slug || 'rafitec'}`}
        >
          <ExternalLink size={13} />
          <span>Link da Fábrica (/d/{currentTenant?.slug || 'rafitec'})</span>
        </Link>
      </div>
    </aside>

    {/* Developer Authorship Modal */}
    <Modal
      isOpen={showAuthorModal}
      onClose={() => setShowAuthorModal(false)}
      title="Créditos de Desenvolvimento & Autoria"
      subtitle="Informações técnicas e arquiteturais do sistema LeanFlow"
      maxWidth="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.6rem',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
            margin: '0 auto',
          }}
        >
          MG
        </div>

        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid #bfdbfe',
              textTransform: 'uppercase',
            }}
          >
            Criador & Arquiteto da Solução
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
            Mauricio Grigol
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 700 }}>
            Consultor Lean & Desenvolvedor Full Stack
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.125rem',
            textAlign: 'left',
            width: '100%',
            fontSize: '0.84375rem',
            color: '#334155',
            lineHeight: 1.5,
          }}
        >
          <p style={{ marginBottom: '0.625rem' }}>
            Este sistema foi integralmente concebido e desenvolvido por <strong>Mauricio Grigol</strong>, estruturado para
            digitalizar o controle de fluxo de trabalho Lean, triagem de demandas da fábrica, ferramentas de chão de fábrica e apuração de múltiplos custos evitados.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.725rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              ✓ Next.js 14 App Router
            </span>
            <span style={{ fontSize: '0.725rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              ✓ Multi-tenant Architecture
            </span>
            <span style={{ fontSize: '0.725rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              ✓ 7 Fontes de Custo Evitado
            </span>
            <span style={{ fontSize: '0.725rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              ✓ Mobile-first Lean Tools
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAuthorModal(false)}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.65rem' }}
        >
          Fechar Informações
        </button>
      </div>
    </Modal>
  </>
  );
};
