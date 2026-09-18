'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Tenant } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import {
  AlertOctagon,
  Download,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Database,
  Layers,
  Sparkles,
  Factory,
} from 'lucide-react';

interface TenantPurgeModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TenantPurgeModal: React.FC<TenantPurgeModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'operational_only' | 'full_reset'>('operational_only');
  const [autoDownloadBackup, setAutoDownloadBackup] = useState(true);
  const [confirmationInput, setConfirmationInput] = useState('');

  const stats = useMemo(() => {
    if (!tenant) return null;
    const baseStats = dataService.getTenantStats(tenant.id);
    const ideas = dataService.getKaizenIdeas(tenant.id);
    const tags = dataService.getTpmTagsByTenant(tenant.id);
    const audits = dataService.getTpmAuditsByTenant(tenant.id);
    const assessments = dataService.getSectorAssessments(tenant.id);

    return {
      actionsCount: baseStats.actionsCount,
      ideasCount: ideas.length,
      tagsCount: tags.length,
      auditsCount: audits.length,
      assessmentsCount: assessments.length,
      sectorsCount: baseStats.sectorsCount,
      agentsCount: baseStats.agentsCount,
    };
  }, [tenant, isOpen]);

  const REQUIRED_CONFIRMATION = useMemo(() => {
    if (!tenant) return 'LIMPAR';
    return `LIMPAR ${tenant.slug.toUpperCase()}`;
  }, [tenant]);

  const isConfirmationValid = confirmationInput.trim() === REQUIRED_CONFIRMATION;

  useEffect(() => {
    if (!isOpen) return;
    setMode('operational_only');
    setAutoDownloadBackup(true);
    setConfirmationInput('');
  }, [isOpen]);

  if (!tenant) return null;

  const handleDownloadBackup = () => {
    const backupData = dataService.exportTenantBackup(tenant.id);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `backup_${tenant.slug}_${dateStr}.json`;

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfirmationValid) {
      alert(`Por favor, digite exatamente "${REQUIRED_CONFIRMATION}" para autorizar a limpeza da entidade.`);
      return;
    }

    try {
      // 1. Gera backup automático pré-limpeza se selecionado
      if (autoDownloadBackup) {
        handleDownloadBackup();
      }

      // 2. Executa o purge cirúrgico
      const result = dataService.purgeTenantData(tenant.id, mode);

      let summary = `LIMPEZA CONCLUÍDA COM SUCESSO PARA A PLANTA "${tenant.name}"!\n\n` +
        `• Ações Lean removidas: ${result.deletedActions}\n` +
        `• Ideias do Canal Kaizen removidas: ${result.deletedIdeas}\n` +
        `• Etiquetas TPM removidas: ${result.deletedTags}\n` +
        `• Auditorias TPM removidas: ${result.deletedAudits}\n` +
        `• Avaliações de maturidade removidas: ${result.deletedAssessments}\n`;

      if (mode === 'full_reset') {
        summary += `• Agentes de teste removidos: ${result.deletedAgents}\n` +
          `• Setores de teste removidos: ${result.deletedSectors}\n` +
          `✓ Perfil do Gestor da Unidade mantido ativo para entrada em produção.\n`;
      } else {
        summary += `✓ Estrutura de Setores (${stats?.sectorsCount || 0}) e Agentes (${stats?.agentsCount || 0}) preservados integralmente.\n`;
      }

      summary += `\nA planta fabril está agora com o banco de dados limpo e pronta para operação real em produção!`;

      alert(summary);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Falha ao executar limpeza da entidade: ${err?.message || err}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Limpeza do Banco de Dados • Entrada em Produção (${tenant.name})`}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner de Aviso */}
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1.5px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertOctagon size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ fontSize: '0.875rem', color: '#fca5a5', display: 'block', marginBottom: '0.2rem' }}>
              Atenção: Limpeza e Preparação para Go-Live Industrial
            </strong>
            <p style={{ fontSize: '0.775rem', color: '#fecaca', margin: 0, lineHeight: 1.45 }}>
              Esta ação destina-se a expurgar dados fictícios utilizados durante fases de teste, validação e homologação, permitindo iniciar o ciclo real de projetos Kaizen com os indicadores zerados.
            </p>
          </div>
        </div>

        {/* Resumo do Conteúdo Atual da Planta */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'block', marginBottom: '0.65rem' }}>
            Volume de Dados Detectados em "{tenant.name}":
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem 0.65rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Ações Lean / Kaizens</span>
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{stats?.actionsCount || 0}</strong>
            </div>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem 0.65rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Ideias Sugeridas</span>
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{stats?.ideasCount || 0}</strong>
            </div>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem 0.65rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Auditorias & Tags TPM</span>
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{(stats?.tagsCount || 0) + (stats?.auditsCount || 0)}</strong>
            </div>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem 0.65rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Avaliações de Maturidade</span>
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{stats?.assessmentsCount || 0}</strong>
            </div>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem 0.65rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Setores Mapeados</span>
              <strong style={{ fontSize: '1.05rem', color: '#22d3ee' }}>{stats?.sectorsCount || 0}</strong>
            </div>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem 0.65rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Agentes Cadastrados</span>
              <strong style={{ fontSize: '1.05rem', color: '#34d399' }}>{stats?.agentsCount || 0}</strong>
            </div>
          </div>
        </div>

        {/* Escolha do Modo de Limpeza Fina */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#e2e8f0', display: 'block' }}>
            Selecione o Nível de Limpeza Cirúrgica:
          </label>

          <label
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: mode === 'operational_only' ? '1.5px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: mode === 'operational_only' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="radio"
              name="purgeMode"
              checked={mode === 'operational_only'}
              onChange={() => setMode('operational_only')}
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                  Modo 1: Limpeza Operacional de Testes (Recomendado para Produção)
                </strong>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'rgba(34, 211, 238, 0.2)', color: '#22d3ee', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  Go-Live
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                <strong>Apaga:</strong> Todas as ações do Kanban de teste, ideias do Canal Kaizen, etiquetas e auditorias TPM.<br />
                <strong>Preserva:</strong> A entidade, todos os Setores e todos os Agentes/Gestor com logins já criados, eliminando retrabalho de recadastro!
              </p>
            </div>
          </label>

          <label
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: mode === 'full_reset' ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: mode === 'full_reset' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="radio"
              name="purgeMode"
              checked={mode === 'full_reset'}
              onChange={() => setMode('full_reset')}
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <strong style={{ fontSize: '0.875rem', color: '#fca5a5' }}>
                  Modo 2: Reset Absoluto da Planta
                </strong>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                <strong>Apaga:</strong> Todos os dados operacionais, agentes fictícios e setores de teste.<br />
                <strong>Preserva:</strong> Apenas o registro da Entidade e o perfil do Gestor da Unidade.
              </p>
            </div>
          </label>
        </div>

        {/* Checkbox de Backup Preventivo Automático */}
        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#dcfce7' }}>
            <input
              type="checkbox"
              checked={autoDownloadBackup}
              onChange={(e) => setAutoDownloadBackup(e.target.checked)}
            />
            <span>
              <strong>Gerar e baixar backup preventivo (.json)</strong> automaticamente antes de limpar
            </span>
          </label>
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Download size={13} /> Baixar agora
          </button>
        </div>

        {/* Trava de Confirmação Digitada */}
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px dashed rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#fca5a5', display: 'block', marginBottom: '0.35rem' }}>
            Confirmação de Segurança:
          </label>
          <p style={{ fontSize: '0.75rem', color: '#fecaca', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
            Para autorizar a limpeza, digite exatamente: <code style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 900, color: '#ffffff' }}>{REQUIRED_CONFIRMATION}</code>
          </p>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={`Digite "${REQUIRED_CONFIRMATION}"`}
            className="form-control"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: isConfirmationValid ? '1.5px solid #22c55e' : '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: isConfirmationValid ? '#86efac' : '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          />
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.25rem' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isConfirmationValid}
            className="btn btn-danger"
            style={{
              padding: '0.65rem 1.5rem',
              opacity: isConfirmationValid ? 1 : 0.4,
              cursor: isConfirmationValid ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 800,
            }}
          >
            <Trash2 size={16} />
            Executar Limpeza para Produção
          </button>
        </div>
      </form>
    </Modal>
  );
};
