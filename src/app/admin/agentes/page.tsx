'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { User } from '@/lib/types';
import { AgentModal } from '@/components/forms/AgentModal';
import { formatCurrency } from '@/lib/utils';
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
          backgroundColor: '#0f172a',
          border: '1px solid rgba(239, 68, 68, 0.2)',
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
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Acesso Restrito: Configuração de Equipe
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
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
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Gestão de Equipe & Acessos
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
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
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              borderColor: 'rgba(168, 85, 247, 0.35)',
              color: '#d8b4fe',
            }}
          >
            <Eye size={16} color="#c084fc" /> Cadastrar Visualizador (Diretoria)
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
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Agentes Lean Ativos
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
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
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
            }}
          >
            <Eye size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Acessos Diretoria / Leitura
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
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
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee',
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Custo Evitado Homologado
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
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
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#facc15',
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Ações Concluídas
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              {metrics.completedActions} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>de {metrics.totalActions}</span>
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
          backgroundColor: '#090e1a',
          padding: '0.875rem 1rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
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
              backgroundColor: currentTab === 'all' ? '#2563eb' : 'rgba(255, 255, 255, 0.04)',
              color: currentTab === 'all' ? '#ffffff' : '#94a3b8',
              border: currentTab === 'all' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Users size={15} />
            <span>Todos</span>
            <span
              style={{
                backgroundColor: currentTab === 'all' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                color: currentTab === 'all' ? '#ffffff' : '#cbd5e1',
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
              backgroundColor: currentTab === 'agents' ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
              color: currentTab === 'agents' ? '#ffffff' : '#94a3b8',
              border: currentTab === 'agents' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Briefcase size={15} />
            <span>Agentes Lean</span>
            <span
              style={{
                backgroundColor: currentTab === 'agents' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(16, 185, 129, 0.2)',
                color: currentTab === 'agents' ? '#ffffff' : '#34d399',
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
              backgroundColor: currentTab === 'viewers' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.04)',
              color: currentTab === 'viewers' ? '#ffffff' : '#94a3b8',
              border: currentTab === 'viewers' ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Eye size={15} />
            <span>Diretoria & Visualizadores</span>
            <span
              style={{
                backgroundColor: currentTab === 'viewers' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(168, 85, 247, 0.2)',
                color: currentTab === 'viewers' ? '#ffffff' : '#d8b4fe',
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
              backgroundColor: currentTab === 'archived' ? '#475569' : 'rgba(255, 255, 255, 0.04)',
              color: currentTab === 'archived' ? '#ffffff' : '#94a3b8',
              border: currentTab === 'archived' ? '1px solid #64748b' : '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Lock size={14} />
            <span>Arquivados & Bloqueados</span>
            <span
              style={{
                backgroundColor: currentTab === 'archived' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(148, 163, 184, 0.2)',
                color: currentTab === 'archived' ? '#ffffff' : '#cbd5e1',
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
            color="#64748b"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por nome, cargo, setor ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#030712',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              color: '#ffffff',
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
            backgroundColor: '#090e1a',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
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
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                }}
              >
                <Eye size={26} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Nenhum visualizador executivo cadastrado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: '440px', margin: 0 }}>
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
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  borderColor: 'rgba(168, 85, 247, 0.4)',
                  color: '#d8b4fe',
                }}
              >
                <Eye size={15} color="#c084fc" /> Cadastrar Visualizador
              </button>
            </>
          ) : currentTab === 'archived' ? (
            <>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Nenhum membro arquivado ou bloqueado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: '440px', margin: 0 }}>
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
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                }}
              >
                <UserCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Nenhum membro encontrado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: '420px', margin: 0 }}>
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
                  backgroundColor: isArchived ? 'rgba(15, 23, 42, 0.65)' : undefined,
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
                            ? '2px solid rgba(148, 163, 184, 0.3)'
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
                            color: isArchived ? '#cbd5e1' : '#ffffff',
                            fontFamily: 'var(--font-heading)',
                            margin: 0,
                          }}
                        >
                          {member.name}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: isArchived ? '#64748b' : '#94a3b8', margin: 0 }}>
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
                            ? 'rgba(239, 68, 68, 0.12)'
                            : isViewer
                            ? 'rgba(168, 85, 247, 0.16)'
                            : 'rgba(16, 185, 129, 0.16)',
                          color: isArchived ? '#fca5a5' : isViewer ? '#d8b4fe' : '#34d399',
                          border: `1px solid ${
                            isArchived
                              ? 'rgba(239, 68, 68, 0.3)'
                              : isViewer
                              ? 'rgba(168, 85, 247, 0.35)'
                              : 'rgba(16, 185, 129, 0.35)'
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
                                backgroundColor: '#34d399',
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
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            color: '#fbbf24',
                            border: '1px solid #fbbf24',
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
                      color: isArchived ? '#94a3b8' : '#cbd5e1',
                      marginBottom: '1.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={14} color={isViewer ? '#c084fc' : '#22d3ee'} />
                      <span>
                        {isViewer ? 'Abrangência: ' : 'Setor: '}
                        {member.allSectors || member.sectorName === 'Todos os Setores (Geral)' ? (
                          <span style={{ color: isViewer ? '#d8b4fe' : '#34d399', fontWeight: 800 }}>
                            🌟 Todos os Setores (Geral Planta)
                          </span>
                        ) : (
                          <strong style={{ color: isArchived ? '#cbd5e1' : '#ffffff' }}>
                            {member.sectorName || 'Não Definido'}
                          </strong>
                        )}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} color="#94a3b8" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} color="#94a3b8" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Specific Card Content: Viewer Permission Box vs Agent Performance */}
                  {isViewer ? (
                    <div
                      style={{
                        backgroundColor: '#090e1a',
                        borderRadius: '10px',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                      }}
                    >
                      <Shield size={16} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.725rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                        <strong style={{ color: '#d8b4fe', display: 'block' }}>Acesso Executivo (Somente Leitura)</strong>
                        Acompanhamento de Dashboards, Hoshin Kanri, Kanban Geral e Relatórios de ROI. Sem permissão de mutação ou homologação.
                      </div>
                    </div>
                  ) : stats ? (
                    <div
                      style={{
                        backgroundColor: '#090e1a',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '0.75rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                          {isArchived ? 'Histórico Custo Evitado' : 'Custo Evitado'}
                        </span>
                        <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#34d399', margin: '0.1rem 0 0' }}>
                          {formatCurrency(stats.actualCostAvoided)}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                          {isArchived ? 'Ações Históricas' : 'Ações Concluídas'}
                        </span>
                        <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', margin: '0.1rem 0 0' }}>
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
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
