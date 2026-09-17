'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

export default function AdminAgentesPage() {
  const { dataVersion, refreshData, currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<'active' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const allAgents = useMemo(() => {
    return dataService.getUsers().filter((u) => u.role === 'agent');
  }, [dataVersion]);

  const activeAgents = useMemo(() => {
    return allAgents.filter((u) => u.active !== false);
  }, [allAgents]);

  const archivedAgents = useMemo(() => {
    return allAgents.filter((u) => u.active === false);
  }, [allAgents]);

  const displayedAgents = useMemo(() => {
    const list = currentTab === 'active' ? activeAgents : archivedAgents;
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        (a.jobTitle && a.jobTitle.toLowerCase().includes(term)) ||
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.sectorName && a.sectorName.toLowerCase().includes(term))
    );
  }, [currentTab, activeAgents, archivedAgents, searchTerm]);

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  const handleCreateNew = () => {
    setSelectedAgent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (agent: User) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const handleArchive = (agent: User) => {
    if (currentUser?.id === agent.id) {
      alert('Atenção: Você não pode bloquear o usuário da sua sessão atual.');
      return;
    }

    if (
      confirm(
        `Tem certeza que deseja BLOQUEAR o acesso de ${agent.name} e arquivá-lo?\n\n` +
          `• O acesso do agente ao sistema será revogado imediatamente.\n` +
          `• Todo o histórico de Kaizens, custos evitados e planos passados será 100% PRESERVADO.\n` +
          `• O perfil será movido para a aba "Arquivados & Bloqueados" e poderá ser reativado a qualquer momento.`
      )
    ) {
      dataService.updateUser(agent.id, { active: false });
      refreshData();
    }
  };

  const handleReactivate = (agent: User) => {
    if (
      confirm(
        `Deseja REATIVAR o acesso do agente ${agent.name}?\n\n` +
          `• O login do agente será restabelecido na plataforma.\n` +
          `• O perfil retornará para a lista de Agentes Ativos e estará liberado para assumir novas demandas Lean.`
      )
    ) {
      dataService.updateUser(agent.id, { active: true });
      refreshData();
    }
  };

  const handleHardDelete = (agent: User) => {
    if (
      confirm(
        `ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE o registro de ${agent.name}?\n\n` +
          `Esta ação removerá totalmente o cadastro do sistema. Utilize apenas se o cadastro foi realizado por engano ou duplicidade.\n\n` +
          `Deseja prosseguir com a exclusão irreversível?`
      )
    ) {
      dataService.deleteUser(agent.id);
      refreshData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Gestão & Cadastro de Agentes Lean
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Gerencie a equipe de facilitadores de chão de fábrica, controle acessos e preserve históricos industriais
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <UserPlus size={16} /> Cadastrar Novo Agente
        </button>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentTab('active')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: currentTab === 'active' ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
              color: currentTab === 'active' ? '#ffffff' : '#94a3b8',
              border: currentTab === 'active' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <UserCheck size={16} />
            <span>Agentes em Atividade</span>
            <span
              style={{
                backgroundColor: currentTab === 'active' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(16, 185, 129, 0.2)',
                color: currentTab === 'active' ? '#ffffff' : '#34d399',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              {activeAgents.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('archived')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
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
            <Lock size={15} />
            <span>Arquivados & Bloqueados</span>
            <span
              style={{
                backgroundColor: currentTab === 'archived' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(148, 163, 184, 0.2)',
                color: currentTab === 'archived' ? '#ffffff' : '#cbd5e1',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              {archivedAgents.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px', maxWidth: '400px' }}>
          <Search
            size={15}
            color="#64748b"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder={
              currentTab === 'active'
                ? 'Buscar agente ativo por nome, setor ou e-mail...'
                : 'Buscar arquivado por nome, setor...'
            }
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

      {/* Agents Grid Cards */}
      {displayedAgents.length === 0 ? (
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
          {currentTab === 'active' ? (
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
                Nenhum agente ativo encontrado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: '420px', margin: 0 }}>
                {searchTerm
                  ? 'Nenhum agente ativo corresponde aos termos da pesquisa.'
                  : 'Nenhum agente em atividade cadastrado no momento. Clique em "Cadastrar Novo Agente" para adicionar facilitadores à equipe.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateNew}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <UserPlus size={15} /> Cadastrar Agente
                </button>
              )}
            </>
          ) : (
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
                Nenhum agente arquivado ou bloqueado
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: '440px', margin: 0 }}>
                Todos os colaboradores cadastrados estão atualmente com acesso liberado e em plena atividade na fábrica.
              </p>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {displayedAgents.map((agent) => {
            const stats = metrics.byAgent.find((a) => a.agentId === agent.id);
            const isArchived = agent.active === false;

            return (
              <div
                key={agent.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  borderTop: isArchived ? '4px solid #64748b' : '4px solid #10b981',
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
                          agent.avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={agent.name}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isArchived
                            ? '2px solid rgba(148, 163, 184, 0.3)'
                            : '2px solid rgba(16, 185, 129, 0.4)',
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
                          {agent.name}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: isArchived ? '#64748b' : '#94a3b8', margin: 0 }}>
                          {agent.jobTitle || 'Especialista Lean'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: isArchived ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.2)',
                          color: isArchived ? '#fca5a5' : '#34d399',
                          border: `1px solid ${isArchived ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.35)'}`,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {isArchived ? (
                          <>
                            <Lock size={11} /> Bloqueado / Arquivado
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
                            Ativo na Planta
                          </>
                        )}
                      </span>

                      {dataService.getAgentLatestExam(agent.id)?.passed && (
                        <span
                          style={{
                            fontSize: '0.675rem',
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
                          🏆 Qualificado ({dataService.getAgentLatestExam(agent.id)?.score.toFixed(1)})
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
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={14} color="#22d3ee" />
                      <span>
                        Setor:{' '}
                        {agent.allSectors || agent.sectorName === 'Todos os Setores (Geral)' ? (
                          <span style={{ color: '#34d399', fontWeight: 800 }}>🌟 Todos os Setores (Planta Geral)</span>
                        ) : (
                          <strong style={{ color: isArchived ? '#cbd5e1' : '#ffffff' }}>
                            {agent.sectorName || 'Não Definido'}
                          </strong>
                        )}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} color="#94a3b8" />
                      <span>{agent.email}</span>
                    </div>
                    {agent.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} color="#94a3b8" />
                        <span>{agent.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Lean Performance Snippet (Preserved History!) */}
                  {stats && (
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
                  )}
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
                    // Active Agent Buttons: Edit or Block & Archive
                    <>
                      <button
                        onClick={() => handleEdit(agent)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Edit2 size={13} /> Editar Cadastro
                      </button>

                      <button
                        onClick={() => handleArchive(agent)}
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
                        <Lock size={13} /> Bloquear & Arquivar
                      </button>
                    </>
                  ) : (
                    // Archived Agent Buttons: Reactivate or Hard Delete
                    <>
                      <button
                        onClick={() => handleReactivate(agent)}
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
                        onClick={() => handleHardDelete(agent)}
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

      {/* Agent Modal */}
      {isModalOpen && (
        <AgentModal
          agent={selectedAgent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
