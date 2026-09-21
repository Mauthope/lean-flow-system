'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { User } from '@/lib/types';
import { AgentModal } from '@/components/forms/AgentModal';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Search,
  UserCheck,
  UserX,
  Eye,
  Briefcase,
  Shield,
} from 'lucide-react';

export default function AdminAgentesPage() {
  const { dataVersion, refreshData, currentUser } = useAuth();
  const { isDark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [initialModalRole, setInitialModalRole] = useState<'agent' | 'viewer'>('agent');
  const [currentTab, setCurrentTab] = useState<'all' | 'agents' | 'viewers' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Se o usuário atual for viewer, bloqueia a tela
  if (currentUser?.role === 'viewer') {
    return (
      <div
        className="card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '3rem auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          border: isDark ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #fca5a5',
          borderRadius: '16px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldAlert size={32} color="#f87171" />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
          Acesso Restrito: Configuração de Equipe
        </h2>
        <p style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#475569', margin: 0, lineHeight: 1.5 }}>
          Seu perfil atual é de <strong>Consulta Executiva / Diretoria (Somente Leitura)</strong>. O cadastro e gerenciamento de acessos de equipe é restrito aos Administradores da Entidade.
        </p>
        <Link
          href="/admin/dashboard"
          className="btn btn-primary btn-sm"
          style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          Voltar para o Dashboard Lean
        </Link>
      </div>
    );
  }

  const allMembers = useMemo(() => {
    return dataService.getUsers().filter((u) => u.role === 'agent' || u.role === 'viewer');
  }, [dataVersion]);

  const activeMembers = useMemo(() => {
    return allMembers.filter((u) => u.active !== false);
  }, [allMembers]);

  const activeAgents = useMemo(() => {
    return activeMembers.filter((u) => u.role === 'agent');
  }, [activeMembers]);

  const activeViewers = useMemo(() => {
    return activeMembers.filter((u) => u.role === 'viewer');
  }, [activeMembers]);

  const archivedMembers = useMemo(() => {
    return allMembers.filter((u) => u.active === false);
  }, [allMembers]);

  const displayedMembers = useMemo(() => {
    let list: User[] = [];
    if (currentTab === 'all') list = activeMembers;
    else if (currentTab === 'agents') list = activeAgents;
    else if (currentTab === 'viewers') list = activeViewers;
    else if (currentTab === 'archived') list = archivedMembers;

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        (a.jobTitle && a.jobTitle.toLowerCase().includes(term)) ||
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.sectorName && a.sectorName.toLowerCase().includes(term))
    );
  }, [currentTab, activeMembers, activeAgents, activeViewers, archivedMembers, searchTerm]);

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  const handleCreateNew = (role: 'agent' | 'viewer') => {
    setSelectedAgent(null);
    setInitialModalRole(role);
    setIsModalOpen(true);
  };

  const handleEdit = (agent: User) => {
    setSelectedAgent(agent);
    setInitialModalRole(agent.role === 'viewer' ? 'viewer' : 'agent');
    setIsModalOpen(true);
  };

  const handleArchive = (member: User) => {
    if (currentUser?.id === member.id) {
      alert('Atenção: Você não pode bloquear o usuário da sua sessão atual.');
      return;
    }

    const isViewer = member.role === 'viewer';
    if (
      confirm(
        `Tem certeza que deseja BLOQUEAR o acesso de ${member.name} (${isViewer ? 'Visualizador' : 'Agente'}) e arquivá-lo?\n\n` +
          `• O acesso ao sistema será revogado imediatamente.\n` +
          `• Todo o histórico de Kaizens, auditorias e relatórios será 100% PRESERVADO.\n` +
          `• O perfil será movido para a aba "Arquivados & Bloqueados" e poderá ser reativado a qualquer momento.`
      )
    ) {
      dataService.updateUser(member.id, { active: false });
      refreshData();
    }
  };

  const handleReactivate = (member: User) => {
    if (
      confirm(
        `Deseja REATIVAR o acesso de ${member.name}?\n\n` +
          `• O login na plataforma será restabelecido imediatamente.\n` +
          `• O perfil retornará para a lista de usuários ativos.`
      )
    ) {
      dataService.updateUser(member.id, { active: true });
      refreshData();
    }
  };

  const handleHardDelete = (member: User) => {
    if (
      confirm(
        `ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE o registro de ${member.name}?\n\n` +
          `Esta ação removerá totalmente o cadastro do sistema. Utilize apenas se o cadastro foi realizado por engano ou duplicidade.\n\n` +
          `Deseja prosseguir com a exclusão irreversível?`
      )
    ) {
      dataService.deleteUser(member.id);
      refreshData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Gestão de Equipe & Acessos
          </h2>
          <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#475569' }}>
            Gerencie os facilitadores Lean de fábrica e cadastre acessos executivos para Diretoria e Gerência (somente leitura)
          </p>
        </div>

        {/* Action Buttons: Cadastrar Agente ou Visualizador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCreateNew('viewer')}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : '#f3e8ff',
              borderColor: isDark ? 'rgba(168, 85, 247, 0.35)' : '#d8b4fe',
              color: isDark ? '#d8b4fe' : '#7e22ce',
            }}
          >
            <Eye size={16} color={isDark ? '#c084fc' : '#7e22ce'} /> Cadastrar Visualizador (Diretoria)
          </button>

          <button
            onClick={() => handleCreateNew('agent')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <UserPlus size={16} /> Cadastrar Agente Lean
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.15rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#34d399' : '#15803d',
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Agentes Lean Ativos
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
              {activeAgents.length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : '#f3e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#c084fc' : '#7e22ce',
            }}
          >
            <Eye size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Acessos Diretoria / Leitura
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
              {activeViewers.length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(6, 182, 212, 0.12)' : '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#22d3ee' : '#0284c7',
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Custo Evitado Homologado
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isDark ? '#34d399' : '#059669', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(metrics.totalActualCostAvoided)}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(234, 179, 8, 0.12)' : '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#facc15' : '#d97706',
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Ações Concluídas
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
              {metrics.completedActions} <span style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>de {metrics.totalActions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: isDark ? '#090e1a' : '#ffffff',
          padding: '0.875rem 1rem',
          borderRadius: '12px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Tab 1: Todos */}
          <button
            onClick={() => setCurrentTab('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: currentTab === 'all'
                ? '#2563eb'
                : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'),
              color: currentTab === 'all' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
              border: currentTab === 'all'
                ? '1px solid #3b82f6'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
            }}
          >
            <Users size={15} />
            <span>Todos</span>
            <span
              style={{
                backgroundColor: currentTab === 'all' ? 'rgba(0, 0, 0, 0.3)' : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'),
                color: currentTab === 'all' ? '#ffffff' : (isDark ? '#cbd5e1' : '#334155'),
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.675rem',
                fontWeight: 800,
              }}
            >
              {activeMembers.length}
            </span>
          </button>

          {/* Tab 2: Agentes */}
          <button
            onClick={() => setCurrentTab('agents')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: currentTab === 'agents'
                ? '#10b981'
                : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'),
              color: currentTab === 'agents' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
              border: currentTab === 'agents'
                ? '1px solid #10b981'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
            }}
          >
            <Briefcase size={15} />
            <span>Agentes Lean</span>
            <span
              style={{
                backgroundColor: currentTab === 'agents' ? 'rgba(0, 0, 0, 0.25)' : (isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7'),
                color: currentTab === 'agents' ? '#ffffff' : (isDark ? '#34d399' : '#15803d'),
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.675rem',
                fontWeight: 800,
              }}
            >
              {activeAgents.length}
            </span>
          </button>

          {/* Tab 3: Visualizadores */}
          <button
            onClick={() => setCurrentTab('viewers')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: currentTab === 'viewers'
                ? '#8b5cf6'
                : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'),
              color: currentTab === 'viewers' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
              border: currentTab === 'viewers'
                ? '1px solid #a855f7'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
            }}
          >
            <Eye size={15} />
            <span>Diretoria & Visualizadores</span>
            <span
              style={{
                backgroundColor: currentTab === 'viewers' ? 'rgba(0, 0, 0, 0.25)' : (isDark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff'),
                color: currentTab === 'viewers' ? '#ffffff' : (isDark ? '#d8b4fe' : '#7e22ce'),
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.675rem',
                fontWeight: 800,
              }}
            >
              {activeViewers.length}
            </span>
          </button>

          {/* Tab 4: Arquivados */}
          <button
            onClick={() => setCurrentTab('archived')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: currentTab === 'archived'
                ? '#475569'
                : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'),
              color: currentTab === 'archived' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
              border: currentTab === 'archived'
                ? '1px solid #64748b'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
            }}
          >
            <Lock size={14} />
            <span>Arquivados & Bloqueados</span>
            <span
              style={{
                backgroundColor: currentTab === 'archived' ? 'rgba(0, 0, 0, 0.25)' : (isDark ? 'rgba(148, 163, 184, 0.2)' : '#e2e8f0'),
                color: currentTab === 'archived' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.675rem',
                fontWeight: 800,
              }}
            >
              {archivedMembers.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '380px' }}>
          <Search
            size={15}
            color={isDark ? '#64748b' : '#94a3b8'}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por nome, cargo, setor ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: isDark ? '#030712' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              color: isDark ? '#ffffff' : '#0f172a',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Members Grid Cards */}
      {displayedMembers.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            backgroundColor: isDark ? '#090e1a' : '#ffffff',
            border: isDark ? '1px dashed rgba(255, 255, 255, 0.12)' : '1px dashed #cbd5e1',
            borderRadius: '12px',
          }}
        >
          {currentTab === 'viewers' ? (
            <>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : '#f3e8ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#c084fc' : '#7e22ce',
                }}
              >
                <Eye size={26} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Nenhum visualizador executivo cadastrado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#64748b', maxWidth: '440px', margin: 0 }}>
                Cadastre acessos somente leitura para Diretores, Gerentes de Fábrica ou Conselheiros acompanharem KPIs e relatórios de ROI.
              </p>
              <button
                onClick={() => handleCreateNew('viewer')}
                className="btn btn-secondary btn-sm"
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff',
                  borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#d8b4fe',
                  color: isDark ? '#d8b4fe' : '#7e22ce',
                }}
              >
                <Eye size={15} color={isDark ? '#c084fc' : '#7e22ce'} /> Cadastrar Visualizador
              </button>
            </>
          ) : currentTab === 'archived' ? (
            <>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#94a3b8' : '#64748b',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Nenhum membro arquivado ou bloqueado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#64748b', maxWidth: '440px', margin: 0 }}>
                Todos os colaboradores cadastrados estão atualmente com acesso liberado e ativos na plataforma.
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#34d399' : '#15803d',
                }}
              >
                <UserCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Nenhum membro encontrado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#64748b', maxWidth: '420px', margin: 0 }}>
                {searchTerm
                  ? 'Nenhum cadastro corresponde aos termos da pesquisa.'
                  : 'Nenhum membro em atividade no momento. Utilize os botões acima para cadastrar facilitadores Lean ou visualizadores.'}
              </p>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
          {displayedMembers.map((member) => {
            const stats = metrics.byAgent.find((a) => a.agentId === member.id);
            const isArchived = member.active === false;
            const isViewer = member.role === 'viewer';

            return (
              <div
                key={member.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  borderTop: isArchived ? '4px solid #64748b' : isViewer ? '4px solid #a855f7' : '4px solid #10b981',
                  backgroundColor: isArchived
                    ? (isDark ? 'rgba(15, 23, 42, 0.65)' : '#f8fafc')
                    : (isDark ? undefined : '#ffffff'),
                  opacity: isArchived ? 0.92 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  {/* Top Profile Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={
                          member.avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={member.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isArchived
                            ? (isDark ? '2px solid rgba(148, 163, 184, 0.3)' : '2px solid #cbd5e1')
                            : isViewer
                            ? '2.5px solid rgba(168, 85, 247, 0.65)'
                            : '2.5px solid rgba(16, 185, 129, 0.45)',
                          filter: isArchived ? 'grayscale(75%)' : 'none',
                        }}
                      />
                      <div>
                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: isArchived
                              ? (isDark ? '#cbd5e1' : '#64748b')
                              : (isDark ? '#ffffff' : '#0f172a'),
                            fontFamily: 'var(--font-heading)',
                            margin: 0,
                          }}
                        >
                          {member.name}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: isArchived ? '#64748b' : (isDark ? '#94a3b8' : '#64748b'), margin: 0 }}>
                          {member.jobTitle || (isViewer ? 'Diretor / Visualizador' : 'Especialista Lean')}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      {/* Badge Perfil de Acesso */}
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 800,
                          backgroundColor: isArchived
                            ? (isDark ? 'rgba(239, 68, 68, 0.12)' : '#fee2e2')
                            : isViewer
                            ? (isDark ? 'rgba(168, 85, 247, 0.16)' : '#f3e8ff')
                            : (isDark ? 'rgba(16, 185, 129, 0.16)' : '#dcfce7'),
                          color: isArchived
                            ? (isDark ? '#fca5a5' : '#b91c1c')
                            : isViewer
                            ? (isDark ? '#d8b4fe' : '#7e22ce')
                            : (isDark ? '#34d399' : '#15803d'),
                          border: `1px solid ${
                            isArchived
                              ? (isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5')
                              : isViewer
                              ? (isDark ? 'rgba(168, 85, 247, 0.35)' : '#d8b4fe')
                              : (isDark ? 'rgba(16, 185, 129, 0.35)' : '#86efac')
                          }`,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {isArchived ? (
                          <>
                            <Lock size={11} /> Bloqueado
                          </>
                        ) : isViewer ? (
                          <>
                            <Eye size={11} /> Visualizador Executivo
                          </>
                        ) : (
                          <>
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: isDark ? '#34d399' : '#15803d',
                                display: 'inline-block',
                              }}
                            />
                            Agente Gemba
                          </>
                        )}
                      </span>

                      {!isViewer && dataService.getAgentLatestExam(member.id)?.passed && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7',
                            color: isDark ? '#fbbf24' : '#b45309',
                            border: isDark ? '1px solid #fbbf24' : '1px solid #fcd34d',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          🏆 Qualificado ({dataService.getAgentLatestExam(member.id)?.score.toFixed(1)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info List */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      fontSize: '0.8125rem',
                      color: isArchived ? (isDark ? '#94a3b8' : '#64748b') : (isDark ? '#cbd5e1' : '#334155'),
                      marginBottom: '1.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={14} color={isViewer ? '#a855f7' : (isDark ? '#22d3ee' : '#0284c7')} />
                      <span>
                        {isViewer ? 'Abrangência: ' : 'Setor: '}
                        {member.allSectors || member.sectorName === 'Todos os Setores (Geral)' ? (
                          <span style={{ color: isViewer ? (isDark ? '#d8b4fe' : '#7e22ce') : (isDark ? '#34d399' : '#15803d'), fontWeight: 800 }}>
                            🌟 Todos os Setores (Geral Planta)
                          </span>
                        ) : (
                          <strong style={{ color: isArchived ? (isDark ? '#cbd5e1' : '#64748b') : (isDark ? '#ffffff' : '#0f172a') }}>
                            {member.sectorName || 'Não Definido'}
                          </strong>
                        )}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Specific Card Content: Viewer Permission Box vs Agent Performance */}
                  {isViewer ? (
                    <div
                      style={{
                        backgroundColor: isDark ? '#090e1a' : '#fdf4ff',
                        borderRadius: '10px',
                        border: isDark ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid #e9d5ff',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                      }}
                    >
                      <Shield size={16} color="#a855f7" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.725rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.35 }}>
                        <strong style={{ color: isDark ? '#d8b4fe' : '#7e22ce', display: 'block' }}>Acesso Executivo (Somente Leitura)</strong>
                        Acompanhamento de Dashboards, Hoshin Kanri, Kanban Geral e Relatórios de ROI. Sem permissão de mutação ou homologação.
                      </div>
                    </div>
                  ) : stats ? (
                    <div
                      style={{
                        backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                        borderRadius: '10px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                        padding: '0.75rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                          {isArchived ? 'Histórico Custo Evitado' : 'Custo Evitado'}
                        </span>
                        <p style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#34d399' : '#059669', margin: '0.1rem 0 0' }}>
                          {formatCurrency(stats.actualCostAvoided)}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                          {isArchived ? 'Ações Históricas' : 'Ações Concluídas'}
                        </span>
                        <p style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0.1rem 0 0' }}>
                          {stats.completedCount} de {stats.assignedCount}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                    paddingTop: '0.875rem',
                    gap: '0.5rem',
                  }}
                >
                  {!isArchived ? (
                    // Active Member Buttons: Edit or Block & Archive
                    <>
                      <button
                        onClick={() => handleEdit(member)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Edit2 size={13} /> Editar Cadastro
                      </button>

                      <button
                        onClick={() => handleArchive(member)}
                        className="btn btn-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer',
                        }}
                        title="Revogar acesso e arquivar perfil preservando histórico"
                      >
                        <Lock size={13} /> Bloquear Acesso
                      </button>
                    </>
                  ) : (
                    // Archived Member Buttons: Reactivate or Hard Delete
                    <>
                      <button
                        onClick={() => handleReactivate(member)}
                        className="btn btn-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Restabelecer login e retornar para a lista de ativos"
                      >
                        <RotateCcw size={13} /> Reativar Acesso
                      </button>

                      <button
                        onClick={() => handleHardDelete(member)}
                        className="btn btn-outline-danger btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Excluir permanentemente do banco de dados"
                      >
                        <Trash2 size={13} /> Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member / Agent Modal */}
      {isModalOpen && (
        <AgentModal
          agent={selectedAgent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshData}
          initialRole={initialModalRole}
        />
      )}
    </div>
  );
}
