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
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export default function AdminAgentesPage() {
  const { dataVersion, refreshData, allUsers } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const agents = useMemo(() => {
    return allUsers.filter((u) => u.role === 'agent');
  }, [allUsers]);

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Gestão & Cadastro de Agentes Lean
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
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
                borderTop: agent.active ? '4px solid #10b981' : '4px solid #cbd5e1',
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
                        border: '2px solid #e2e8f0',
                      }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{agent.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{agent.jobTitle || 'Especialista Lean'}</p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: agent.active ? '#ecfdf5' : '#f1f5f9',
                      color: agent.active ? '#047857' : '#64748b',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {agent.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Info List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: '#475569', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={14} color="#2563eb" />
                    <span>Setor: <strong>{agent.sectorName || 'Não Definido'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} color="#64748b" />
                    <span>{agent.email}</span>
                  </div>
                  {agent.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={14} color="#64748b" />
                      <span>{agent.phone}</span>
                    </div>
                  )}
                </div>

                {/* Lean Performance Snippet */}
                {stats && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase' }}>Custo Evitado</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#059669' }}>
                        {formatCurrency(stats.actualCostAvoided)}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase' }}>Ações Concluídas</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
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
                  borderTop: '1px solid #f1f5f9',
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
      <AgentModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
