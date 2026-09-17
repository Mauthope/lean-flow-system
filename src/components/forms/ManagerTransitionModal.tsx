'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Tenant, User } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  ArrowRightLeft,
  AlertTriangle,
  Mail,
  CheckCircle2,
  Lock,
  RotateCcw,
} from 'lucide-react';

interface ManagerTransitionModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManagerTransitionModal: React.FC<ManagerTransitionModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentManager = useMemo(() => {
    if (!tenant) return undefined;
    return dataService.getTenantManager(tenant.id);
  }, [tenant, isOpen]);

  const existingAgents = useMemo(() => {
    if (!tenant) return [];
    return dataService
      .getUsers(tenant.id)
      .filter((u) => u.role === 'agent' && u.active !== false);
  }, [tenant, isOpen]);

  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [existingUserId, setExistingUserId] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [suspendPrevious, setSuspendPrevious] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setMode(existingAgents.length > 0 ? 'existing' : 'new');
    setExistingUserId(existingAgents[0]?.id || '');
    setNewManagerName('');
    setNewManagerEmail('');
    setSuspendPrevious(true);
  }, [isOpen, existingAgents]);

  if (!tenant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'new' && (!newManagerName.trim() || !newManagerEmail.trim())) {
      alert('Por favor, informe o Nome e o E-mail corporativo do novo gestor.');
      return;
    }

    if (mode === 'existing' && !existingUserId) {
      alert('Por favor, selecione um facilitador existente para ser promovido a Gestor.');
      return;
    }

    const { newManager, previousManager } = dataService.replaceTenantManager({
      tenantId: tenant.id,
      previousManagerId: currentManager?.id,
      suspendPrevious,
      newManagerMode: mode,
      existingUserId,
      newManagerName,
      newManagerEmail,
    });

    let message = `Transição realizada com sucesso para a planta "${tenant.name}"!\n\n` +
      `✓ Novo Gestor: ${newManager.name} (${newManager.email})\n`;

    if (previousManager && suspendPrevious) {
      message += `✓ Gestor Anterior (${previousManager.name}): Acesso revogado com sucesso. Histórico 100% preservado.\n`;
    } else if (previousManager && !suspendPrevious) {
      message += `✓ Gestor Anterior (${previousManager.name}): Mantido ativo temporariamente para período de handover.\n`;
    }

    message += `✓ Serviços da fábrica continuam operando normalmente sem nenhuma interrupção.`;

    alert(message);
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transição de Gestor: ${tenant.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner de Garantia de Zero Downtime */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={22} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Continuidade Operacional Garantida (Zero Interrupção)
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
              A substituição do gestor é imediata e transparente. Todos os setores fabris, agentes Lean, quadros Kanban e links públicos de coleta (<code style={{ color: '#22d3ee' }}>/d/{tenant.slug}</code>) continuam operando 24/7 sem qualquer interrupção.
            </p>
          </div>
        </div>

        {/* Gestor Atual da Planta */}
        <div
          style={{
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Gestor Atual da Unidade
          </span>

          {currentManager ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={
                    currentManager.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentManager.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {currentManager.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    {currentManager.email} • {currentManager.jobTitle || 'Supervisor Lean'}
                  </p>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: currentManager.active !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: currentManager.active !== false ? '#34d399' : '#f87171',
                  border: `1px solid ${currentManager.active !== false ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                {currentManager.active !== false ? 'Em Atividade' : 'Acesso Suspenso'}
              </span>
            </div>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: '#fbbf24', margin: 0 }}>
              Nenhum gestor ativo definido para esta unidade no momento.
            </p>
          )}

          {/* Opção de suspensão do gestor atual */}
          {currentManager && (
            <div
              style={{
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={suspendPrevious}
                  onChange={(e) => setSuspendPrevious(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#ef4444', marginTop: '2px' }}
                />
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff' }}>
                    Suspender e revogar o acesso do gestor anterior imediatamente
                  </span>
                  <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: '0.1rem 0 0', lineHeight: 1.35 }}>
                    (Recomendado em desligamentos ou transferências de filial). Todo o histórico de Kaizens e auditorias passadas assinadas por ele continuará 100% gravado. Desmarque se desejar uma co-gestão temporária durante a transição.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Escolha do Novo Gestor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <ArrowRightLeft size={14} color="#22d3ee" />
            <span>Como deseja definir o Novo Gestor da Planta?</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMode('existing')}
              disabled={existingAgents.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: mode === 'existing' ? '2px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: mode === 'existing' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: mode === 'existing' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: existingAgents.length === 0 ? 'not-allowed' : 'pointer',
                opacity: existingAgents.length === 0 ? 0.5 : 1,
              }}
            >
              <UserCheck size={16} color={mode === 'existing' ? '#22d3ee' : '#94a3b8'} />
              <span>Promover Facilitador</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: mode === 'new' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: mode === 'new' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: mode === 'new' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <UserPlus size={16} color={mode === 'new' ? '#34d399' : '#94a3b8'} />
              <span>Convidar Novo Gestor</span>
            </button>
          </div>

          {/* Formulário: Promover Facilitador Existente */}
          {mode === 'existing' && (
            <div
              style={{
                backgroundColor: '#030712',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <label className="form-label" style={{ fontSize: '0.78125rem' }}>
                Selecione o Facilitador da Planta a ser promovido para Gestor:
              </label>
              <select
                value={existingUserId}
                onChange={(e) => setExistingUserId(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.8125rem' }}
              >
                {existingAgents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.email}) — Setor: {ag.sectorName || 'Geral'}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem' }}>
                Este colaborador receberá privilégios administrativos completos da unidade.
              </span>
            </div>
          )}

          {/* Formulário: Cadastrar Novo Gestor por E-mail */}
          {mode === 'new' && (
            <div
              style={{
                backgroundColor: '#030712',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Nome Completo do Novo Gestor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Rocha"
                  className="form-control"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: roberto@empresa.com.br"
                  className="form-control"
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  No Supabase Auth, o novo gestor receberá imediatamente o e-mail de ativação e definição de senha.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <CheckCircle2 size={16} /> Confirmar Transição de Gestão
          </button>
        </div>
      </form>
    </Modal>
  );
};
