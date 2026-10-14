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
  Mail,
  Calendar,
  Lightbulb,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import { StatsCard } from '@/components/ui/StatsCard';

export default function AdminTriagemPage() {
  const { currentUser, dataVersion, refreshData, currentTenant } = useAuth();
  const { isDark } = useTheme();
  const [selectedDemand, setSelectedDemand] = useState<LeanAction | null>(null);
  const [filterType, setFilterType] = useState<'pending' | 'kaizen' | 'all' | 'rejected'>('pending');
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
    return dataService.getActions(currentTenant?.id);
  }, [dataVersion, currentTenant?.id]);

  const publicDemands = useMemo(() => {
    return allActions.filter((a) => a.isPublicDemand);
  }, [allActions]);

  const kaizenDemands = useMemo(() => {
    return publicDemands.filter((a) => a.isKaizenIdea);
  }, [publicDemands]);

  const totenCount = useMemo(() => {
    return kaizenDemands.filter((a) => a.kaizenOrigin === 'toten').length;
  }, [kaizenDemands]);

  const webCount = useMemo(() => {
    return kaizenDemands.filter((a) => a.kaizenOrigin === 'web' || !a.kaizenOrigin).length;
  }, [kaizenDemands]);

  const pendingCount = useMemo(() => {
    return publicDemands.filter((a) => a.status === 'aberta' && !a.assignedAgentId).length;
  }, [publicDemands]);

  const assignedCount = useMemo(() => {
    return publicDemands.filter((a) => Boolean(a.assignedAgentId) || a.status === 'em_andamento' || a.status === 'concluida').length;
  }, [publicDemands]);

  const rejectedCount = useMemo(() => {
    return publicDemands.filter((a) => a.status === 'nao_aprovada').length;
  }, [publicDemands]);

  const kaizenPercentage = publicDemands.length > 0
    ? Math.round((kaizenDemands.length / publicDemands.length) * 100)
    : 0;

  const filteredDemands = useMemo(() => {
    return publicDemands.filter((item) => {
      if (filterType === 'pending') {
        if (item.status !== 'aberta' || item.assignedAgentId) return false;
      } else if (filterType === 'kaizen') {
        if (!item.isKaizenIdea) return false;
      } else if (filterType === 'rejected') {
        if (item.status !== 'nao_aprovada') return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesName = item.requesterName?.toLowerCase().includes(q);
        const matchesProtocol = item.protocol.toLowerCase().includes(q);
        const matchesCategory = item.kaizenCategory?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesName && !matchesProtocol && !matchesCategory) return false;
      }

      return true;
    });
  }, [publicDemands, filterType, search]);

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

      {/* KPI Cards / Mensuração do Canal Kaizen e Demandas Gerais */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatsCard
          title="Total Demandas Chão de Fábrica"
          value={publicDemands.length}
          subtitle="Captação pública e autônoma"
          icon={<Inbox size={22} color="#38bdf8" />}
          accentColor="#38bdf8"
        />

        <StatsCard
          title="Aguardando Triagem"
          value={pendingCount}
          subtitle="Pendentes de avaliação da liderança"
          icon={<Clock size={22} color="#f59e0b" />}
          accentColor="#f59e0b"
        />

        <StatsCard
          title="Origem Canal Kaizen"
          value={`${kaizenDemands.length} (${kaizenPercentage}%)`}
          subtitle={`Toten: ${totenCount} • Formulário Web: ${webCount}`}
          icon={<Lightbulb size={22} color="#22d3ee" />}
          accentColor="#22d3ee"
        />

        <StatsCard
          title="Convertidas em Projeto"
          value={assignedCount}
          subtitle={`${rejectedCount} descartadas na triagem`}
          icon={<CheckCircle2 size={22} color="#10b981" />}
          accentColor="#10b981"
        />
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
            onClick={() => setFilterType('kaizen')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: filterType === 'kaizen'
                ? (isDark ? '1px solid #22d3ee' : '1px solid #0284c7')
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
              backgroundColor: filterType === 'kaizen'
                ? (isDark ? 'rgba(34, 211, 238, 0.18)' : '#e0f2fe')
                : (isDark ? '#090e1a' : '#f8fafc'),
              color: filterType === 'kaizen'
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
            <Lightbulb size={14} /> Canal Kaizen ({kaizenDemands.length})
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
            Não Aprovadas ({rejectedCount})
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
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

                      {/* Carimbo Visual Canal Kaizen */}
                      {demand.isKaizenIdea && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: isDark ? 'rgba(34, 211, 238, 0.15)' : '#e0f2fe',
                            border: isDark ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid #7dd3fc',
                            color: isDark ? '#22d3ee' : '#0369a1',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            letterSpacing: '0.03em',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <Lightbulb size={12} />
                          CANAL KAIZEN • {demand.kaizenOrigin === 'toten' ? 'TOTEN FÁBRICA' : 'WEB'}
                          {demand.kaizenCategory && ` • ${demand.kaizenCategory.toUpperCase()}`}
                        </span>
                      )}

                      {/* Indicador de Foto Anexa */}
                      {demand.kaizenPhotoUrl && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                            color: isDark ? '#cbd5e1' : '#475569',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                          }}
                          title="Possui foto anexada do chão de fábrica"
                        >
                          <Camera size={12} /> Foto Anexa
                        </span>
                      )}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={13} /> Solicitante: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{demand.requesterName}</strong> {demand.requesterDepartment ? `(${demand.requesterDepartment})` : ''}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} /> {demand.requesterEmail}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} /> Recebido em {formatDateTime(demand.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {isAssigned && (
                      <div style={{ textAlign: 'right', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Agente Responsável</span>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: isDark ? '#34d399' : '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', margin: 0 }}>
                          <CheckCircle2 size={13} /> {demand.assignedAgentName}
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
