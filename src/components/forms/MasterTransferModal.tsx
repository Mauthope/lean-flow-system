'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';
import {
  ShieldAlert,
  Crown,
  UserCheck,
  AlertTriangle,
  Mail,
  Lock,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';

interface MasterTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MasterTransferModal: React.FC<MasterTransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentMaster = useMemo(() => {
    return dataService.getMasterUser();
  }, [isOpen]);

  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterEmail, setNewMasterEmail] = useState('');
  const [newMasterJobTitle, setNewMasterJobTitle] = useState('Gestor Master de Entidades & Administrador');
  const [keepCurrentMasterAsAdmin, setKeepCurrentMasterAsAdmin] = useState(true);
  const [confirmationInput, setConfirmationInput] = useState('');

  const REQUIRED_CONFIRMATION = 'CONFIRMAR TRANSFERENCIA';
  const isConfirmationValid = confirmationInput.trim() === REQUIRED_CONFIRMATION;

  useEffect(() => {
    if (!isOpen) return;
    setNewMasterName('');
    setNewMasterEmail('');
    setNewMasterJobTitle('Gestor Master de Entidades & Administrador');
    setKeepCurrentMasterAsAdmin(true);
    setConfirmationInput('');
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentMaster) {
      alert('Erro: Titular Master atual não foi identificado no banco de dados.');
      return;
    }

    if (!newMasterName.trim() || !newMasterEmail.trim()) {
      alert('Por favor, informe o Nome Completo e o E-mail corporativo do novo titular.');
      return;
    }

    if (!isConfirmationValid) {
      alert(`Por favor, digite exatamente "${REQUIRED_CONFIRMATION}" para autorizar a transferência.`);
      return;
    }

    try {
      const { newMaster, previousMaster } = dataService.transferMasterOwnership({
        currentMasterId: currentMaster.id,
        newMasterName,
        newMasterEmail,
        newMasterJobTitle,
        keepCurrentMasterAsAdmin,
      });

      let summary = `TRANSFERÊNCIA DE TITULARIDADE CONCLUÍDA COM SUCESSO!\n\n` +
        `👑 Novo Titular Master: ${newMaster.name} (${newMaster.email})\n` +
        `• Cargo: ${newMaster.jobTitle}\n\n`;

      if (keepCurrentMasterAsAdmin) {
        summary += `✓ Titular Anterior (${previousMaster.name}): Mantido como Administrador Técnico / Consultor (sem poderes de Master de entidades).\n`;
      } else {
        summary += `✓ Titular Anterior (${previousMaster.name}): Acesso suspenso / revogado com segurança.\n`;
      }

      summary += `\nNo Supabase Auth, o novo titular será ativado via invite oficial por e-mail para definir sua senha de acesso.`;

      alert(summary);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Falha ao transferir titularidade: ${err?.message || err}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sucessão da Plataforma • Transferência de Titularidade Master"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner de Aviso de Segurança de Alta Gravidade */}
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
          <ShieldAlert size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ fontSize: '0.875rem', color: isDark ? '#fca5a5' : '#dc2626', display: 'block', marginBottom: '0.2rem' }}>
              Ação Crítica de Governança e Sucessão da Plataforma
            </strong>
            <p style={{ fontSize: '0.775rem', color: isDark ? '#fecaca' : '#991b1b', margin: 0, lineHeight: 1.45 }}>
              A titularidade Master confere controle irrestrito sobre a criação de entidades industriais, transição de gestores de fábrica e gestão de instâncias multi-tenant. Certifique-se dos dados do sucessor antes de prosseguir.
            </p>
          </div>
        </div>

        {/* Titular Master Atual */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#facc15' : '#ca8a04',
              }}
            >
              <Crown size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', display: 'block' }}>
                Titular Master Atual
              </span>
              <strong style={{ fontSize: '0.9rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                {currentMaster?.name || 'Mauricio Grigol'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#475569', marginLeft: '0.5rem' }}>
                ({currentMaster?.email || 'mauricio.grigol@rafitec.com.br'})
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.15)',
              color: isDark ? '#fde047' : '#854d0e',
              border: isDark ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(202, 138, 4, 0.35)',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            Root Master
          </span>
        </div>

        {/* Dados do Novo Titular Master */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Crown size={14} color={isDark ? '#facc15' : '#ca8a04'} /> Dados do Novo Titular Master (Sucessor):
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: '0.3rem' }}>
                Nome Completo do Sucessor *
              </label>
              <input
                type="text"
                value={newMasterName}
                onChange={(e) => setNewMasterName(e.target.value)}
                placeholder="Ex: João Ferreira de Souza"
                className="form-control"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.84375rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: '0.3rem' }}>
                E-mail Corporativo do Sucessor *
              </label>
              <input
                type="email"
                value={newMasterEmail}
                onChange={(e) => setNewMasterEmail(e.target.value)}
                placeholder="Ex: joao.souza@rafitec.com.br"
                className="form-control"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.84375rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: '0.3rem' }}>
              Cargo / Função do Sucessor
            </label>
            <input
              type="text"
              value={newMasterJobTitle}
              onChange={(e) => setNewMasterJobTitle(e.target.value)}
              placeholder="Ex: Gerente de TI & Excelência Operacional"
              className="form-control"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.84375rem',
              }}
            />
          </div>
        </div>

        {/* Status do Titular Anterior */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
          }}
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
            Acesso do Titular Anterior ({currentMaster?.name || 'Mauricio Grigol'}):
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.8125rem',
                color: isDark ? '#cbd5e1' : '#475569',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="previousMasterDecision"
                checked={keepCurrentMasterAsAdmin}
                onChange={() => setKeepCurrentMasterAsAdmin(true)}
              />
              <span>
                <strong>Manter como Administrador Técnico / Consultor</strong> (recomendado para transição e suporte contínuo)
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.8125rem',
                color: '#ef4444',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="previousMasterDecision"
                checked={!keepCurrentMasterAsAdmin}
                onChange={() => setKeepCurrentMasterAsAdmin(false)}
              />
              <span>
                <strong>Revogar acesso completamente</strong> (desativação total da conta anterior)
              </span>
            </label>
          </div>
        </div>

        {/* Trava de Segurança Digitada */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(234, 179, 8, 0.08)' : 'rgba(234, 179, 8, 0.06)',
            border: '1.5px dashed rgba(234, 179, 8, 0.4)',
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: isDark ? '#fde047' : '#854d0e', display: 'block', marginBottom: '0.35rem' }}>
            Trava Anti-Acidente: Digite a confirmação abaixo:
          </label>
          <p style={{ fontSize: '0.75rem', color: isDark ? '#fef08a' : '#713f12', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
            Para habilitar o botão de transferência, digite exatamente: <code style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.06)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>{REQUIRED_CONFIRMATION}</code>
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
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : '#f1f5f9',
              border: isConfirmationValid ? '1.5px solid #22c55e' : '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: '8px',
              color: isConfirmationValid ? (isDark ? '#86efac' : '#15803d') : (isDark ? '#ffffff' : '#0f172a'),
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
            disabled={!isConfirmationValid || !newMasterName.trim() || !newMasterEmail.trim()}
            className="btn btn-danger"
            style={{
              padding: '0.65rem 1.5rem',
              opacity: isConfirmationValid && newMasterName.trim() && newMasterEmail.trim() ? 1 : 0.4,
              cursor: isConfirmationValid && newMasterName.trim() && newMasterEmail.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 800,
            }}
          >
            <Crown size={16} />
            Transferir Titularidade Master
          </button>
        </div>
      </form>
    </Modal>
  );
};
