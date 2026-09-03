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
  Lightbulb,
  Sparkles,
  Layers,
  Bot,
  BookOpen,
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
        { href: '/admin/setores', label: 'Setores & Assessment', icon: Building2, badge: 'Radar' },
      ],
    },
    {
      label: 'Inteligência & Métodos',
      items: [
        { href: '/admin/historico-kaizen', label: 'Histórico Kaizen', icon: Sparkles, badge: 'IA' },
        { href: '/admin/integracoes-ia', label: 'Integrações de IA', icon: Bot, badge: 'Sensei' },
        { href: '/admin/relatorios', label: 'Custo Evitado & ROI', icon: TrendingUp },
        { href: '/agente/ferramentas', label: 'Academia Lean', icon: BookOpen, badge: 'Edu' },
        { href: '/agente/ferramentas/cronoanalise', label: 'Estudo de Tempos', icon: Timer, badge: 'Novo' },
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
        { href: '/agente/ferramentas', label: 'Academia Lean', icon: BookOpen, badge: 'Edu' },
        { href: '/agente/ferramentas/cronoanalise', label: 'Estudo de Tempos', icon: Timer, badge: 'Novo' },
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
          backgroundColor: '#060a13',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 95,
          transition: 'width 0.25s cubic-bezier(0.2, 0, 0, 1), transform 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Brand & Toggle Header */}
        <div
          style={{
            padding: isSidebarCollapsed ? '1rem 0.5rem' : '1.15rem 1.15rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                      Fluxo<span style={{ background: 'linear-gradient(90deg, #22d3ee, #5eead4, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lean</span>
                    </span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(6, 182, 212, 0.18)',
                        color: '#22d3ee',
                        border: '1px solid rgba(6, 182, 212, 0.35)',
                        padding: '0.05rem 0.3rem',
                        borderRadius: '4px',
                      }}
                    >
                      PRO
                    </span>
                  </div>
                  <p style={{ fontSize: '0.675rem', color: '#94a3b8', margin: 0 }}>Engenharia Lean & ROI</p>
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
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
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
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#94a3b8';
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
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                <Building2 size={13} color="#22d3ee" />
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    color: '#e2e8f0',
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
                    color: '#64748b',
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
                        fontWeight: isActive ? 800 : 500,
                        color: isActive ? '#22d3ee' : '#94a3b8',
                        backgroundColor: isActive ? 'rgba(6, 182, 212, 0.14)' : 'transparent',
                        border: isActive ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 2px 10px rgba(6, 182, 212, 0.15)' : 'none',
                        position: 'relative',
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#94a3b8';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Icon size={18} color={isActive ? '#22d3ee' : '#94a3b8'} />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isSidebarCollapsed && item.badge && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            backgroundColor: 'rgba(6, 182, 212, 0.2)',
                            color: '#22d3ee',
                            padding: '0.08rem 0.35rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(6, 182, 212, 0.35)',
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
                            backgroundColor: '#22d3ee',
                            boxShadow: '0 0 6px #22d3ee',
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
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            backgroundColor: '#090e1a',
          }}
        >
          {/* Creator Pill */}
          <div
            onClick={() => setShowAuthorModal(true)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
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
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 1)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
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
                  <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Desenvolvido por:
                  </span>
                </div>
                <strong style={{ fontSize: '0.78125rem', color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Mauricio Grigol
                </strong>
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#22d3ee',
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
                e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
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

          <button
            type="button"
            onClick={() => setShowAuthorModal(false)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.6rem' }}
          >
            Fechar Informações
          </button>
        </div>
      </Modal>
    </>
  );
};
