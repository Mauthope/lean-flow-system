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
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';

export const Topbar: React.FC<{ title?: string; subtitle?: string; onNewAction?: () => void }> = ({
  title,
  subtitle,
  onNewAction,
}) => {
  const router = useRouter();
  const { currentUser, allUsers, switchUser, refreshData } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

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
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Title & Context */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {title || (isAdmin ? 'Painel do Supervisor Lean' : 'Meu Fluxo de Trabalho Lean')}
        </h1>
        {subtitle && <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{subtitle}</p>}
      </div>

      {/* Actions & Persona Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

        {/* Author Badge - Mauricio Grigol */}
        <button
          onClick={() => setShowAuthorModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            fontSize: '0.78125rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Ver informações sobre o desenvolvedor do sistema"
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
        >
          <Sparkles size={13} color="#2563eb" />
          <span>Dev: Mauricio Grigol</span>
        </button>

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
              digitalizar o controle de fluxo de trabalho Lean, triagem de demandas da fábrica e apuração de múltiplos custos evitados.
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
    </header>
  );
};
