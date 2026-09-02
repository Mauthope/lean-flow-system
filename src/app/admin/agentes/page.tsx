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
} from 'lucide-react';

export default function AdminAgentesPage() {
  const { dataVersion, refreshData } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);

  const agents = useMemo(() => {
    return dataService.getUsers().filter((u) => u.role === 'agent');
  }, [dataVersion]);

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

  const handleDelete = (agent: User) => {
    if (confirm(`Tem certeza que deseja excluir o cadastro do agente ${agent.name}?`)) {
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
            Cadastre novos operadores, configure setores de atuação, edite ou exclua acessos
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

      {/* Agents Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {agents.map((agent) => {
          const stats = metrics.byAgent.find((a) => a.agentId === agent.id);

          return (
            <div
              key={agent.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderTop: agent.active ? '4px solid #10b981' : '4px solid #475569',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={
                        agent.avatarUrl ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={agent.name}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                      }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>{agent.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{agent.jobTitle || 'Especialista Lean'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: agent.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        color: agent.active ? '#34d399' : '#94a3b8',
                        border: `1px solid ${agent.active ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                      }}
                    >
                      {agent.active ? 'Ativo' : 'Inativo'}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={14} color="#22d3ee" />
                    <span>
                      Setor:{' '}
                      {agent.allSectors || agent.sectorName === 'Todos os Setores (Geral)' ? (
                        <span style={{ color: '#34d399', fontWeight: 800 }}>🌟 Todos os Setores (Planta Geral)</span>
                      ) : (
                        <strong style={{ color: '#ffffff' }}>{agent.sectorName || 'Não Definido'}</strong>
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

                {/* Lean Performance Snippet */}
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
                      <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Custo Evitado</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#34d399', margin: '0.1rem 0 0' }}>
                        {formatCurrency(stats.actualCostAvoided)}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Ações Concluídas</span>
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
                }}
              >
                <button
                  onClick={() => handleEdit(agent)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Edit2 size={13} /> Editar Cadastro
                </button>

                <button
                  onClick={() => handleDelete(agent)}
                  className="btn btn-outline-danger btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Excluir Agente"
                >
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
