'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { LeanAction } from '@/lib/types';
import { TriageModal } from '@/components/forms/TriageModal';
import { StatusBadge, PriorityBadge, WasteCategoryBadge } from '@/components/ui/Badge';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  User,
  Clock,
  Building,
  CheckSquare,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminTriagemPage() {
  const { currentUser, dataVersion, refreshData } = useAuth();
  const { isDark } = useTheme();
  const [selectedDemand, setSelectedDemand] = useState<LeanAction | null>(null);
  const [filterType, setFilterType] = useState<'pending' | 'all' | 'rejected'>('pending');
  const [search, setSearch] = useState('');

  if (currentUser?.role === 'viewer') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: '1rem',
          maxWidth: '560px',
          margin: '0 auto',
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
          Acesso Restrito: Triagem Operacional de Demandas
        </h2>
        <p style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#475569', margin: 0, lineHeight: 1.5 }}>
          Seu perfil atual é de <strong>Consulta Executiva / Diretoria (Somente Leitura)</strong>. O encaminhamento operacional e triagem de solicitações públicas da fábrica é restrito aos Administradores e Agentes Lean.
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

  const allActions = useMemo(() => {
    return dataService.getActions();
  }, [dataVersion]);

  const publicDemands = useMemo(() => {
    return allActions.filter((a) => a.isPublicDemand);
  }, [allActions]);

  const filteredDemands = useMemo(() => {
    return publicDemands.filter((item) => {
      if (filterType === 'pending') {
        if (item.status !== 'aberta' || item.assignedAgentId) return false;
      } else if (filterType === 'rejected') {
        if (item.status !== 'nao_aprovada') return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesName = item.requesterName?.toLowerCase().includes(q);
        const matchesProtocol = item.protocol.toLowerCase().includes(q);
        if (!matchesTitle && !matchesName && !matchesProtocol) return false;
      }

      return true;
    });
  }, [publicDemands, filterType, search]);

  const pendingCount = publicDemands.filter((a) => a.status === 'aberta' && !a.assignedAgentId).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Central de Triagem de Demandas Públicas
          </h2>
          <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#475569' }}>
            Analise as sugestões e problemas abertos por colaboradores e fornecedores via link público
          </p>
        </div>

        <Link
          href="/nova-demanda"
          target="_blank"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ExternalLink size={14} color={isDark ? '#22d3ee' : '#0284c7'} /> Abrir Link Público
        </Link>
      </div>

      {/* Filter and Tabs */}
      <div
        style={{
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterType('pending')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: filterType === 'pending'
                ? (isDark ? '1px solid #06b6d4' : '1px solid #0284c7')
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
              backgroundColor: filterType === 'pending'
                ? (isDark ? 'rgba(6, 182, 212, 0.16)' : '#e0f2fe')
                : (isDark ? '#090e1a' : '#f8fafc'),
              color: filterType === 'pending'
                ? (isDark ? '#22d3ee' : '#0369a1')
                : (isDark ? '#94a3b8' : '#475569'),
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Clock size={14} /> Aguardando Triagem ({pendingCount})
          </button>

          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: filterType === 'all'
                ? (isDark ? '1px solid #06b6d4' : '1px solid #0284c7')
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
              backgroundColor: filterType === 'all'
                ? (isDark ? 'rgba(6, 182, 212, 0.16)' : '#e0f2fe')
                : (isDark ? '#090e1a' : '#f8fafc'),
              color: filterType === 'all'
                ? (isDark ? '#22d3ee' : '#0369a1')
                : (isDark ? '#94a3b8' : '#475569'),
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Todas as Demandas Públicas ({publicDemands.length})
          </button>

          <button
            onClick={() => setFilterType('rejected')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: filterType === 'rejected'
                ? '1px solid #ef4444'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
              backgroundColor: filterType === 'rejected'
                ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2')
                : (isDark ? '#090e1a' : '#f8fafc'),
              color: filterType === 'rejected'
                ? (isDark ? '#f87171' : '#b91c1c')
                : (isDark ? '#94a3b8' : '#475569'),
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Não Aprovadas ({publicDemands.filter((a) => a.status === 'nao_aprovada').length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={14}
            color={isDark ? '#94a3b8' : '#64748b'}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por título ou solicitante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* List of Demands */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredDemands.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: isDark ? '#94a3b8' : '#475569',
            }}
          >
            <Inbox size={40} color={isDark ? '#64748b' : '#94a3b8'} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
              Nenhuma demanda encontrada nesta categoria
            </h3>
            <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.25rem' }}>
              Divulgue o link público para que novos apontamentos sejam recebidos.
            </p>
          </div>
        ) : (
          filteredDemands.map((demand) => {
            const isAssigned = !!demand.assignedAgentId;
            const isRejected = demand.status === 'nao_aprovada';

            return (
              <div
                key={demand.id}
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderLeft: isRejected
                    ? '5px solid #ef4444'
                    : isAssigned
                    ? '5px solid #10b981'
                    : '5px solid #f59e0b',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: isDark ? '#22d3ee' : '#0284c7',
                        }}
                      >
                        {demand.protocol}
                      </span>
                      <StatusBadge status={demand.status} />
                      <PriorityBadge priority={demand.priority} />
                      <WasteCategoryBadge category={demand.wasteCategory} />
                      <span style={{ fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#475569' }}>
                        Setor: <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{demand.originSectorName}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                      {demand.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                      {demand.description}
                    </p>

                    {/* Rejection Note */}
                    {isRejected && (
                      <div style={{
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                        border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fca5a5',
                        borderRadius: '8px',
                        padding: '0.625rem',
                        marginBottom: '0.75rem'
                      }}>
                        <p style={{ fontSize: '0.8125rem', color: isDark ? '#f87171' : '#b91c1c', fontWeight: 600 }}>
                          Justificativa da Recusa: {demand.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Solicitante info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                      <span>
                        👤 Solicitante: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{demand.requesterName}</strong> {demand.requesterDepartment ? `(${demand.requesterDepartment})` : ''}
                      </span>
                      <span>📧 {demand.requesterEmail}</span>
                      <span>📅 Recebido em {formatDateTime(demand.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {isAssigned && (
                      <div style={{ textAlign: 'right', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Agente Responsável</span>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: isDark ? '#34d399' : '#15803d' }}>
                          ✓ {demand.assignedAgentName}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedDemand(demand)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <CheckSquare size={14} />
                      {isAssigned || isRejected ? 'Reavaliar Triagem' : 'Realizar Triagem'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Triage Modal */}
      <TriageModal
        action={selectedDemand}
        isOpen={!!selectedDemand}
        onClose={() => setSelectedDemand(null)}
        onSuccess={refreshData}
      />
    </div>
  );
}
