'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Calendar, AlertCircle, Clock, ShieldCheck, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface PostponeDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  currentEndDate?: string;
  onConfirm: (newDate: string, reason: string) => void;
}

const COMMON_POSTPONE_REASONS = [
  'Aguardando entrega de peças pelo fornecedor / Compras (OC)',
  'Aguardando janela de parada da máquina concedida pelo PCP/Produção',
  'Intervenção técnica da Manutenção agendada (OS em andamento)',
  'Ajuste técnico em dispositivo/ferramental ou laudo de qualidade',
  'Falta transitória de insumos ou matéria-prima no mercado',
  'Outro motivo operacional / estratégico',
];

export const PostponeDeadlineModal: React.FC<PostponeDeadlineModalProps> = ({
  isOpen,
  onClose,
  activityTitle,
  currentEndDate,
  onConfirm,
}) => {
  const [newEndDate, setNewEndDate] = useState('');
  const [selectedReason, setSelectedReason] = useState(COMMON_POSTPONE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      // Padrão: 7 dias a partir de hoje ou da data atual
      const base = currentEndDate ? new Date(currentEndDate + 'T12:00:00') : new Date();
      base.setDate(base.getDate() + 7);
      setNewEndDate(base.toISOString().split('T')[0]);
      setSelectedReason(COMMON_POSTPONE_REASONS[0]);
      setCustomReason('');
    }
  }, [isOpen, currentEndDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndDate) return;

    const fullReason =
      selectedReason === 'Outro motivo operacional / estratégico' && customReason.trim()
        ? customReason.trim()
        : customReason.trim()
        ? `${selectedReason} - ${customReason.trim()}`
        : selectedReason;

    onConfirm(newEndDate, fullReason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reprogramação de Prazo (Auditoria Interna)"
      subtitle="Prorrogue a data final antes do vencimento para manter 100% de conformidade com SGQ/IATF"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Card da Atividade */}
        <div
          style={{
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Atividade Selecionada:
          </span>
          <p style={{ margin: '0.2rem 0 0.4rem', fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
            {activityTitle}
          </p>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={13} color="#f59e0b" />
            <span>Prazo Final Atual: </span>
            <strong style={{ color: '#fbbf24' }}>
              {currentEndDate ? formatDate(currentEndDate) : 'Não definido'}
            </strong>
          </div>
        </div>

        {/* Campo Nova Data */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>
            📅 Nova Data Final (Reprogramada): *
          </label>
          <input
            type="date"
            className="form-control"
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
            style={{
              backgroundColor: '#0c121e',
              borderColor: 'rgba(6, 182, 212, 0.45)',
              color: '#ffffff',
              fontSize: '0.9375rem',
              fontWeight: 700,
            }}
            required
          />
        </div>

        {/* Motivo da Prorrogação */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>
            📋 Justificativa Formal da Prorrogação (Obrigatório para Auditoria): *
          </label>
          <select
            className="form-control"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            style={{
              backgroundColor: '#0c121e',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              marginBottom: '0.5rem',
            }}
          >
            {COMMON_POSTPONE_REASONS.map((r, idx) => (
              <option key={idx} value={r}>
                {r}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="form-control"
            placeholder="Complemento ou detalhe da justificativa (ex: Previsão do fornecedor para 25/03)..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            style={{
              backgroundColor: '#0c121e',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.8125rem',
            }}
          />
        </div>

        {/* Aviso de Auditoria */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
          }}
        >
          <ShieldCheck size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#a7f3d0', lineHeight: 1.4 }}>
            <strong>Garantia de Compliance:</strong> A nova data substituirá a data vigente e a reprogramação será registrada na timeline com justificativa. A auditoria interna constatará que o cronograma está sob gestão ativa.
          </p>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              padding: '0.5rem 1.1rem',
            }}
          >
            <Check size={15} /> Confirmar Nova Data
          </button>
        </div>
      </form>
    </Modal>
  );
};
