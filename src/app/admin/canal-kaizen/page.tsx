'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';
import { KaizenIdea, KaizenIdeaStatus, KaizenExecutionStatus, Sector } from '@/lib/types';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils';
import { StatsCard } from '@/components/ui/StatsCard';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Building2,
  User,
  Briefcase,
  Eye,
  Camera,
  Calendar,
  Send,
  Sparkles,
  Zap,
  Award,
  AlertCircle,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminCanalKaizenPage() {
  const { dataVersion, currentUser, allAgents, refreshData } = useAuth();
  const { isDark } = useTheme();
  const isViewer = currentUser?.role === 'viewer';

  const [activeTab, setActiveTab] = useState<'ideias' | 'aprovadas'>('ideias');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | KaizenIdeaStatus>('all');

  // Modals state
  const [viewPhotoIdea, setViewPhotoIdea] = useState<KaizenIdea | null>(null);
  const [approveIdeaModal, setApproveIdeaModal] = useState<KaizenIdea | null>(null);
  const [rejectIdeaModal, setRejectIdeaModal] = useState<KaizenIdea | null>(null);
  const [manageGainsModal, setManageGainsModal] = useState<KaizenIdea | null>(null);

  // Form states for approval modal
  const [approveResponsible, setApproveResponsible] = useState('');
  const [approveEstimatedGain, setApproveEstimatedGain] = useState<number | ''>('');
  const [approveTargetDate, setApproveTargetDate] = useState('');

  // Form states for reject modal
  const [rejectReason, setRejectReason] = useState('');

  // Form states for manage gains modal
  const [gainExecutionStatus, setGainExecutionStatus] = useState<KaizenExecutionStatus>('planejamento');
  const [gainActualCostAvoided, setGainActualCostAvoided] = useState<number | ''>('');
  const [gainHoursSaved, setGainHoursSaved] = useState<number | ''>('');
  const [gainNotes, setGainNotes] = useState('');

  // Load Sectors
  useEffect(() => {
    setSectors(dataService.getSectors());
  }, [dataVersion]);

  // Kaizen Ideas List
  const allIdeas = useMemo(() => {
    return dataService.getKaizenIdeas();
  }, [dataVersion]);

  // Metrics specifically for Canal Kaizen
  const kaizenMetrics = useMemo(() => {
    return dataService.getKaizenMetrics();
  }, [dataVersion]);

  // Filtered Ideas for Tab 1 (Banco de Ideias)
  const filteredIdeas = useMemo(() => {
    return allIdeas.filter((idea) => {
      const matchSearch =
        idea.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.authorRoleTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSector = selectedSector === 'all' || idea.sectorId === selectedSector;
      const matchStatus = statusFilter === 'all' || idea.status === statusFilter;

      return matchSearch && matchSector && matchStatus;
    });
  }, [allIdeas, searchTerm, selectedSector, statusFilter]);

  // Approved Ideas for Tab 2 (Execução & Ganhos)
  const approvedIdeas = useMemo(() => {
    return allIdeas.filter((idea) => idea.status === 'aprovada');
  }, [allIdeas]);

  // Actions
  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/canal-kaizen`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenApproveModal = (idea: KaizenIdea) => {
    if (isViewer) return;
    setApproveIdeaModal(idea);
    setApproveResponsible(idea.responsibleName || currentUser?.name || 'Líder Kaizen');
    setApproveEstimatedGain(idea.estimatedCostAvoided || '');
    setApproveTargetDate(idea.implementationDate || '');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveIdeaModal || isViewer) return;

    dataService.approveKaizenIdea(approveIdeaModal.id, currentUser?.name || 'Gestor Master', {
      responsibleName: approveResponsible.trim(),
      estimatedCostAvoided: approveEstimatedGain !== '' ? Number(approveEstimatedGain) : 0,
      implementationDate: approveTargetDate || undefined,
      executionStatus: 'planejamento',
    });

    setApproveIdeaModal(null);
    refreshData();
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
  };

  const handleOpenRejectModal = (idea: KaizenIdea) => {
    if (isViewer) return;
    setRejectIdeaModal(idea);
    setRejectReason('');
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectIdeaModal || !rejectReason.trim() || isViewer) return;

    dataService.rejectKaizenIdea(
      rejectIdeaModal.id,
      currentUser?.name || 'Gestor Master',
      rejectReason.trim()
    );

    setRejectIdeaModal(null);
    refreshData();
  };

  const handleOpenManageGains = (idea: KaizenIdea) => {
    if (isViewer) return;
    setManageGainsModal(idea);
    setGainExecutionStatus(idea.executionStatus || 'planejamento');
    setGainActualCostAvoided(idea.actualCostAvoided !== undefined ? idea.actualCostAvoided : '');
    setGainHoursSaved(idea.hoursSaved !== undefined ? idea.hoursSaved : '');
    setGainNotes(idea.financialGainNotes || '');
  };

  const handleSaveGains = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageGainsModal || isViewer) return;

    dataService.updateKaizenIdea(manageGainsModal.id, {
      executionStatus: gainExecutionStatus,
      actualCostAvoided: gainActualCostAvoided !== '' ? Number(gainActualCostAvoided) : 0,
      hoursSaved: gainHoursSaved !== '' ? Number(gainHoursSaved) : 0,
      financialGainNotes: gainNotes.trim() || undefined,
    });

    setManageGainsModal(null);
    refreshData();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* ================= TOP HERO BANNER ================= */}
      <div
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #091326 0%, #0c1c38 45%, #070e1d 100%)'
            : 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0f766e 100%)',
          border: isDark ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid #38bdf8',
          borderRadius: '20px',
          padding: '1.85rem 2.25rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: isDark
            ? '0 12px 35px -5px rgba(0, 0, 0, 0.6), 0 0 25px rgba(6, 182, 212, 0.08)'
            : '0 10px 25px -5px rgba(2, 132, 199, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                color: isDark ? '#22d3ee' : '#ffffff',
                border: isDark ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid rgba(255, 255, 255, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Lightbulb size={12} color={isDark ? '#22d3ee' : '#ffffff'} /> CHÃO DE FÁBRICA • BANCO DE IDEIAS
            </span>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.25)',
                color: isDark ? '#34d399' : '#dcfce7',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.5)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ● {kaizenMetrics.approvedIdeas} IDEIAS APROVADAS
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Canal Kaizen
          </h2>
          <p style={{ fontSize: '0.875rem', color: isDark ? '#94a3b8' : '#e0f2fe', maxWidth: '620px', marginTop: '0.35rem', lineHeight: 1.5 }}>
            Espaço aberto para captação de melhorias dos operadores, triagem rápida da liderança e apuração autônoma dos ganhos operacionais.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: copiedLink
                ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#10b981')
                : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.18)'),
              borderColor: copiedLink
                ? '#10b981'
                : (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.35)'),
              color: copiedLink ? (isDark ? '#34d399' : '#ffffff') : '#ffffff',
              fontSize: '0.84375rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            {copiedLink ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Exclusivo Chão de Fábrica'}</span>
          </button>

          <Link
            href="/canal-kaizen/nova-ideia"
            target="_blank"
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.84375rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '12px',
              backgroundColor: isDark ? undefined : '#0284c7',
              borderColor: isDark ? undefined : '#0284c7',
            }}
          >
            <ExternalLink size={16} />
            <span>Abrir Formulário de Ideias</span>
          </Link>
        </div>
      </div>

      {/* ================= 4 CARDS DE MÉTRICAS EXCLUSIVAS DO CANAL KAIZEN ================= */}
      {/* Separados dos projetos dos agentes conforme solicitado! */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatsCard
          title="Economia do Canal Kaizen"
          value={formatCurrency(kaizenMetrics.totalSavings)}
          subtitle="Ganhos reais e estimados gerados pelas ideias"
          icon={<DollarSign size={22} />}
          accentColor="#10b981"
        />

        <StatsCard
          title="Horas Salvas pelo Chão de Fábrica"
          value={`${kaizenMetrics.totalHoursSaved}h`}
          subtitle="Capacidade otimizada por sugestões da equipe"
          icon={<Clock size={22} />}
          accentColor="#f59e0b"
        />

        <StatsCard
          title="Total de Ideias Recebidas"
          value={kaizenMetrics.totalIdeas}
          subtitle={`${kaizenMetrics.pendingIdeas} pendentes de triagem pela gestão`}
          icon={<Lightbulb size={22} />}
          accentColor="#06b6d4"
        />

        <StatsCard
          title="Taxa de Aproveitamento"
          value={`${kaizenMetrics.approvalRate}%`}
          subtitle={`${kaizenMetrics.approvedIdeas} aprovadas | ${kaizenMetrics.rejectedIdeas} rejeitadas`}
          icon={<Award size={22} />}
          accentColor="#8b5cf6"
        />
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('ideias')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: activeTab === 'ideias'
              ? (isDark ? 'rgba(6, 182, 212, 0.15)' : '#e0f2fe')
              : 'transparent',
            border: activeTab === 'ideias'
              ? (isDark ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid #38bdf8')
              : '1px solid transparent',
            color: activeTab === 'ideias'
              ? (isDark ? '#22d3ee' : '#0369a1')
              : (isDark ? '#94a3b8' : '#64748b'),
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.15s ease',
          }}
        >
          <Lightbulb size={16} />
          <span>Banco de Ideias & Triagem</span>
          <span
            style={{
              fontSize: '0.7rem',
              backgroundColor: isDark ? '#090e1a' : '#f1f5f9',
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
              color: isDark ? '#94a3b8' : '#334155',
            }}
          >
            {allIdeas.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aprovadas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: activeTab === 'aprovadas'
              ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7')
              : 'transparent',
            border: activeTab === 'aprovadas'
              ? (isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #86efac')
              : '1px solid transparent',
            color: activeTab === 'aprovadas'
              ? (isDark ? '#34d399' : '#15803d')
              : (isDark ? '#94a3b8' : '#64748b'),
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={16} />
          <span>Ideias Aprovadas & Execução Kaizen</span>
          <span
            style={{
              fontSize: '0.7rem',
              backgroundColor: isDark ? '#090e1a' : '#f1f5f9',
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
              color: isDark ? '#94a3b8' : '#334155',
            }}
          >
            {approvedIdeas.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: BANCO DE IDEIAS & TRIAGEM                                          */}
      {/* ========================================================================= */}
      {activeTab === 'ideias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters Bar */}
          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '14px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
                <Search size={16} color={isDark ? '#94a3b8' : '#64748b'} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Buscar por colaborador, cargo ou ideia..."
                  className="form-control form-control-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    paddingLeft: '2.25rem',
                    backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                />
              </div>

              {/* Sector Filter */}
              <select
                className="form-control form-control-sm"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                style={{
                  width: 'auto',
                  minWidth: '180px',
                  backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              >
                <option value="all">Todos os Setores</option>
                {sectors.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: statusFilter === 'all'
                      ? (isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0')
                      : (isDark ? '#090e1a' : '#f8fafc'),
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                    color: statusFilter === 'all'
                      ? (isDark ? '#ffffff' : '#0f172a')
                      : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Todas ({allIdeas.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pendente')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: statusFilter === 'pendente'
                      ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7')
                      : (isDark ? '#090e1a' : '#f8fafc'),
                    border: statusFilter === 'pendente'
                      ? (isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fcd34d')
                      : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
                    color: statusFilter === 'pendente'
                      ? (isDark ? '#fbbf24' : '#b45309')
                      : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Pendentes ({allIdeas.filter((i) => i.status === 'pendente').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('aprovada')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: statusFilter === 'aprovada'
                      ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7')
                      : (isDark ? '#090e1a' : '#f8fafc'),
                    border: statusFilter === 'aprovada'
                      ? (isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #86efac')
                      : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
                    color: statusFilter === 'aprovada'
                      ? (isDark ? '#34d399' : '#15803d')
                      : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Aprovadas ({allIdeas.filter((i) => i.status === 'aprovada').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('rejeitada')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: statusFilter === 'rejeitada'
                      ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2')
                      : (isDark ? '#090e1a' : '#f8fafc'),
                    border: statusFilter === 'rejeitada'
                      ? (isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fca5a5')
                      : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
                    color: statusFilter === 'rejeitada'
                      ? (isDark ? '#f87171' : '#b91c1c')
                      : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Rejeitadas ({allIdeas.filter((i) => i.status === 'rejeitada').length})
                </button>
              </div>
            </div>
          </div>

          {/* Ideas Table / Grid */}
          <div
            className="card"
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              {filteredIdeas.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <Lightbulb size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                    Nenhuma ideia encontrada com os filtros selecionados.
                  </p>
                  <p style={{ fontSize: '0.8125rem', margin: '0.35rem 0 0' }}>
                    Divulgue o link exclusivo para os operadores cadastrarem suas sugestões de melhoria!
                  </p>
                </div>
              ) : (
                <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                        color: isDark ? '#94a3b8' : '#475569',
                        fontSize: '0.725rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <th style={{ padding: '0.875rem 1.25rem' }}>Foto</th>
                      <th style={{ padding: '0.875rem 1rem' }}>Colaborador & Cargo</th>
                      <th style={{ padding: '0.875rem 1rem' }}>Setor</th>
                      <th style={{ padding: '0.875rem 1.25rem' }}>Resumo da Ideia</th>
                      <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Data Cadastro</th>
                      <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Ações de Gestão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIdeas.map((idea) => {
                      return (
                        <tr
                          key={idea.id}
                          style={{
                            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Foto */}
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            {idea.photoUrl ? (
                              <button
                                type="button"
                                onClick={() => setViewPhotoIdea(idea)}
                                style={{
                                  padding: 0,
                                  border: isDark ? '1.5px solid rgba(6, 182, 212, 0.4)' : '1.5px solid #38bdf8',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  width: '44px',
                                  height: '44px',
                                  backgroundColor: isDark ? '#090e1a' : '#f1f5f9',
                                  display: 'block',
                                }}
                                title="Clique para ver a foto em tamanho real"
                              >
                                <img
                                  src={idea.photoUrl}
                                  alt="Foto da Ideia"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </button>
                            ) : (
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '8px',
                                  backgroundColor: isDark ? '#090e1a' : '#f1f5f9',
                                  border: isDark ? '1px dashed rgba(255, 255, 255, 0.15)' : '1px dashed #cbd5e1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#64748b',
                                }}
                                title="Sem foto anexada"
                              >
                                <Camera size={18} />
                              </div>
                            )}
                          </td>

                          {/* Colaborador & Cargo */}
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <div>
                              <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', display: 'block', fontFamily: 'var(--font-heading)' }}>
                                {idea.authorName}
                              </strong>
                              <span style={{ fontSize: '0.725rem', color: isDark ? '#22d3ee' : '#0284c7', fontWeight: 600 }}>
                                {idea.authorRoleTitle}
                              </span>
                              <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontFamily: 'var(--font-mono)' }}>
                                {idea.protocol}
                              </span>
                            </div>
                          </td>

                          {/* Setor */}
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                                color: isDark ? '#cbd5e1' : '#334155',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                              }}
                            >
                              {idea.sectorName}
                            </span>
                          </td>

                          {/* Resumo da Ideia */}
                          <td style={{ padding: '0.875rem 1.25rem', maxWidth: '340px' }}>
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: isDark ? '#f8fafc' : '#1e293b', lineHeight: 1.45 }}>
                              {idea.summary}
                            </p>
                            {idea.rejectionReason && idea.status === 'rejeitada' && (
                              <p style={{ margin: '0.35rem 0 0', fontSize: '0.725rem', color: isDark ? '#f87171' : '#dc2626', fontStyle: 'italic' }}>
                                <strong>Motivo da Recusa:</strong> &ldquo;{idea.rejectionReason}&rdquo;
                              </p>
                            )}
                          </td>

                          {/* Data do Cadastro (Salva automaticamente) */}
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#334155', display: 'block', fontFamily: 'var(--font-mono)' }}>
                              {formatDate(idea.createdAt)}
                            </span>
                            <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                              {new Date(idea.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            {idea.status === 'pendente' && (
                              <span
                                style={{
                                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                                  color: isDark ? '#fbbf24' : '#b45309',
                                  border: isDark ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid #fcd34d',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '9999px',
                                  fontWeight: 800,
                                  fontSize: '0.725rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <Clock size={12} /> Pendente
                              </span>
                            )}
                            {idea.status === 'aprovada' && (
                              <span
                                style={{
                                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
                                  color: isDark ? '#34d399' : '#15803d',
                                  border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #86efac',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '9999px',
                                  fontWeight: 800,
                                  fontSize: '0.725rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <CheckCircle2 size={12} /> Aprovada ✓
                              </span>
                            )}
                            {idea.status === 'rejeitada' && (
                              <span
                                style={{
                                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                                  color: isDark ? '#f87171' : '#b91c1c',
                                  border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fca5a5',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '9999px',
                                  fontWeight: 800,
                                  fontSize: '0.725rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <XCircle size={12} /> Recusada
                              </span>
                            )}
                          </td>

                          {/* Ações de Gestão */}
                          <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                            {idea.status === 'pendente' ? (
                              isViewer ? (
                                <span style={{ fontSize: '0.725rem', color: isDark ? '#fbbf24' : '#b45309', fontWeight: 700 }}>
                                  Pendente de Análise
                                </span>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenApproveModal(idea)}
                                    className="btn btn-success btn-sm"
                                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                  >
                                    <Check size={14} /> Aprovar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRejectModal(idea)}
                                    className="btn btn-danger btn-sm"
                                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                  >
                                    <XCircle size={14} /> Rejeitar
                                  </button>
                                </div>
                              )
                            ) : idea.status === 'aprovada' ? (
                              <Link
                                href={`/admin/canal-kaizen/ideias/${idea.id}`}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              >
                                <span>Abrir Ciclo PDCA</span> <ArrowRight size={13} />
                              </Link>
                            ) : (
                              <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                Analisada por {idea.reviewedBy}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: IDEIAS APROVADAS & EXECUÇÃO KAIZEN (SEPARADA DOS PROJETOS AGENTES) */}
      {/* ========================================================================= */}
      {activeTab === 'aprovadas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Info Note */}
          <div
            style={{
              padding: '1.15rem 1.35rem',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #86efac',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={22} color={isDark ? '#34d399' : '#15803d'} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Painel de Ideias Aprovadas & Ganhos do Chão de Fábrica
                </h4>
                <p style={{ fontSize: '0.78125rem', color: isDark ? '#94a3b8' : '#475569', margin: '0.2rem 0 0' }}>
                  Estas melhorias foram aprovadas da base de colaboradores e são gerenciadas de forma independente dos projetos formais dos agentes Lean.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Economizado por Ideias
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: isDark ? '#34d399' : '#15803d', margin: 0, fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(kaizenMetrics.totalSavings)}
              </h3>
            </div>
          </div>

          {/* Approved Ideas Table */}
          <div
            className="card"
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              {approvedIdeas.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <Award size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                    Nenhuma ideia aprovada ainda.
                  </p>
                  <p style={{ fontSize: '0.8125rem', margin: '0.35rem 0 0' }}>
                    Vá até a aba &ldquo;Banco de Ideias & Triagem&rdquo; para aprovar as sugestões submetidas pelos operadores.
                  </p>
                </div>
              ) : (
                <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                        color: isDark ? '#94a3b8' : '#475569',
                        fontSize: '0.725rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <th style={{ padding: '0.875rem 1.25rem' }}>Protocolo & Ideia</th>
                      <th style={{ padding: '0.875rem 1rem' }}>Autor (Chão de Fábrica)</th>
                      <th style={{ padding: '0.875rem 1rem' }}>Responsável Implantação</th>
                      <th style={{ padding: '0.875rem 1rem' }}>Setor</th>
                      <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Etapa / Status</th>
                      <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Economia Real (R$)</th>
                      <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Horas Salvas</th>
                      <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Gerenciar Ganhos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedIdeas.map((idea) => {
                      const actual = Number(idea.actualCostAvoided) || 0;
                      const estimated = Number(idea.estimatedCostAvoided) || 0;

                      return (
                        <tr
                          key={idea.id}
                          style={{
                            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Protocolo & Ideia */}
                          <td style={{ padding: '0.875rem 1.25rem', maxWidth: '280px' }}>
                            <Link
                              href={`/admin/canal-kaizen/ideias/${idea.id}`}
                              style={{
                                fontSize: '0.75rem',
                                color: isDark ? '#22d3ee' : '#0284c7',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 800,
                                textDecoration: 'none',
                                display: 'inline-block',
                              }}
                            >
                              {idea.protocol} →
                            </Link>
                            <Link
                              href={`/admin/canal-kaizen/ideias/${idea.id}`}
                              style={{
                                margin: '0.2rem 0 0',
                                fontSize: '0.8125rem',
                                color: isDark ? '#ffffff' : '#0f172a',
                                fontWeight: 600,
                                lineHeight: 1.4,
                                textDecoration: 'none',
                                display: 'block',
                              }}
                            >
                              {idea.summary}
                            </Link>
                          </td>

                          {/* Autor */}
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <strong style={{ fontSize: '0.84375rem', color: isDark ? '#ffffff' : '#0f172a', display: 'block', fontFamily: 'var(--font-heading)' }}>
                              {idea.authorName}
                            </strong>
                            <span style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                              {idea.authorRoleTitle}
                            </span>
                          </td>

                          {/* Responsável Implantação */}
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span style={{ fontSize: '0.84375rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                              {idea.responsibleName || 'Não atribuído'}
                            </span>
                          </td>

                          {/* Setor */}
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                                color: isDark ? '#cbd5e1' : '#334155',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                              }}
                            >
                              {idea.sectorName}
                            </span>
                          </td>

                          {/* Etapa / Status PDCA */}
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                              {/* PDCA Stage Pill */}
                              <span
                                style={{
                                  fontSize: '0.675rem',
                                  fontWeight: 900,
                                  letterSpacing: '0.04em',
                                  fontFamily: 'var(--font-mono)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '9999px',
                                  backgroundColor:
                                    idea.pdcaStage === 'act'
                                      ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7')
                                      : idea.pdcaStage === 'check'
                                      ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7')
                                      : idea.pdcaStage === 'do'
                                      ? (isDark ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff')
                                      : (isDark ? 'rgba(6, 182, 212, 0.2)' : '#e0f2fe'),
                                  color:
                                    idea.pdcaStage === 'act'
                                      ? (isDark ? '#34d399' : '#15803d')
                                      : idea.pdcaStage === 'check'
                                      ? (isDark ? '#fbbf24' : '#b45309')
                                      : idea.pdcaStage === 'do'
                                      ? (isDark ? '#c084fc' : '#7e22ce')
                                      : (isDark ? '#22d3ee' : '#0369a1'),
                                  border: `1px solid ${
                                    idea.pdcaStage === 'act'
                                      ? (isDark ? 'rgba(16, 185, 129, 0.4)' : '#86efac')
                                      : idea.pdcaStage === 'check'
                                      ? (isDark ? 'rgba(245, 158, 11, 0.4)' : '#fcd34d')
                                      : idea.pdcaStage === 'do'
                                      ? (isDark ? 'rgba(139, 92, 246, 0.4)' : '#d8b4fe')
                                      : (isDark ? 'rgba(6, 182, 212, 0.4)' : '#7dd3fc')
                                  }`,
                                }}
                              >
                                {idea.pdcaStage ? `PDCA: ${idea.pdcaStage.toUpperCase()}` : 'PDCA: PLAN'}
                              </span>

                              {/* Execution Status */}
                              {idea.executionStatus === 'implantada_sucesso' ? (
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isDark ? '#34d399' : '#15803d' }}>
                                  ✓ Concluída
                                </span>
                              ) : idea.executionStatus === 'em_implantacao' ? (
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isDark ? '#c084fc' : '#7e22ce' }}>
                                  Em Implantação
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isDark ? '#22d3ee' : '#0284c7' }}>
                                  Planejamento
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Economia Real (R$) */}
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                            <strong
                              style={{
                                fontSize: '0.9375rem',
                                fontWeight: 900,
                                color: actual > 0
                                  ? (isDark ? '#34d399' : '#15803d')
                                  : (isDark ? '#fbbf24' : '#b45309'),
                                fontFamily: 'var(--font-mono)',
                                display: 'block',
                              }}
                            >
                              {actual > 0 ? formatCurrency(actual) : formatCurrency(estimated)}
                            </strong>
                            <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                              {actual > 0 ? 'ganho homologado' : 'projeção estimada'}
                            </span>
                          </td>

                          {/* Horas Salvas */}
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-mono)' }}>
                              {idea.hoursSaved ? `${idea.hoursSaved}h` : '--'}
                            </strong>
                          </td>

                          {/* Gerenciar Ganhos / Abrir PDCA */}
                          <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <Link
                                href={`/admin/canal-kaizen/ideias/${idea.id}`}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem' }}
                              >
                                <span>Abrir PDCA</span> <ArrowRight size={13} />
                              </Link>
                              {!isViewer && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenManageGains(idea)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.7rem', padding: '0.35rem 0.5rem' }}
                                  title="Editar Ganhos Rapidamente"
                                >
                                  $
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APROVAÇÃO DA IDEIA PELO GESTOR                                   */}
      {/* ========================================================================= */}
      {approveIdeaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1.5px solid #10b981',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: isDark
                ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.15)'
                : '0 20px 50px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={22} color={isDark ? '#34d399' : '#15803d'} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Aprovar Ideia Kaizen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApproveIdeaModal(null)}
                style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: isDark ? '#090e1a' : '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: isDark ? '#22d3ee' : '#0284c7', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                {approveIdeaModal.protocol} • {approveIdeaModal.authorName} ({approveIdeaModal.authorRoleTitle})
              </span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: isDark ? '#f8fafc' : '#1e293b', fontStyle: 'italic', lineHeight: 1.4 }}>
                &ldquo;{approveIdeaModal.summary}&rdquo;
              </p>
            </div>

            <form onSubmit={handleConfirmApproval} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                  Responsável pela Implantação *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={approveResponsible}
                  onChange={(e) => setApproveResponsible(e.target.value)}
                  placeholder="Nome do agente ou líder encarregado..."
                  style={{
                    backgroundColor: isDark ? '#090e1a' : '#ffffff',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                    Economia Estimada (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 15000"
                    className="form-control"
                    value={approveEstimatedGain}
                    onChange={(e) => setApproveEstimatedGain(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{
                      backgroundColor: isDark ? '#090e1a' : '#ffffff',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                    Previsão de Conclusão
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={approveTargetDate}
                    onChange={(e) => setApproveTargetDate(e.target.value)}
                    style={{
                      backgroundColor: isDark ? '#090e1a' : '#ffffff',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                      color: isDark ? '#ffffff' : '#0f172a',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setApproveIdeaModal(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} /> Confirmar Aprovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJEIÇÃO DA IDEIA COM FEEDBACK                                  */}
      {/* ========================================================================= */}
      {rejectIdeaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1.5px solid #ef4444',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: isDark
                ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.15)'
                : '0 20px 50px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={22} color={isDark ? '#f87171' : '#dc2626'} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Rejeitar Ideia Kaizen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectIdeaModal(null)}
                style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.84375rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
              Por favor, informe a justificativa técnica para que o colaborador compreenda o motivo da recusa ou possa aprimorar a proposta.
            </p>

            <form onSubmit={handleConfirmRejection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                  Motivo da Rejeição / Feedback ao Colaborador *
                </label>
                <textarea
                  required
                  rows={4}
                  className="form-control"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: No momento a máquina passará por retrofitting geral já previsto para o próximo mês..."
                  style={{
                    backgroundColor: isDark ? '#090e1a' : '#ffffff',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.84375rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectIdeaModal(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <XCircle size={16} /> Confirmar Rejeição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VISUALIZADOR DA FOTO EM ALTA RESOLUÇÃO                          */}
      {/* ========================================================================= */}
      {viewPhotoIdea && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setViewPhotoIdea(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '700px',
              width: '100%',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
              border: isDark ? '1px solid rgba(6, 182, 212, 0.35)' : '1.5px solid #38bdf8',
              boxShadow: isDark ? '0 25px 60px rgba(0, 0, 0, 0.9)' : '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.9375rem', fontFamily: 'var(--font-heading)', display: 'block' }}>
                  {viewPhotoIdea.authorName} • {viewPhotoIdea.sectorName}
                </strong>
                <span style={{ fontSize: '0.725rem', color: isDark ? '#22d3ee' : '#0284c7', fontFamily: 'var(--font-mono)' }}>
                  {viewPhotoIdea.protocol} ({formatDateTime(viewPhotoIdea.createdAt)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewPhotoIdea(null)}
                style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#000000', textAlign: 'center', padding: '1rem' }}>
              <img
                src={viewPhotoIdea.photoUrl}
                alt="Foto da Ideia"
                style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '8px', display: 'block', margin: '0 auto' }}
              />
            </div>

            <div style={{ padding: '1rem 1.25rem', backgroundColor: isDark ? '#090e1a' : '#f8fafc' }}>
              <p style={{ margin: 0, fontSize: '0.84375rem', color: isDark ? '#f8fafc' : '#1e293b', lineHeight: 1.5 }}>
                {viewPhotoIdea.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: GERENCIAR GANHOS & EXECUÇÃO DA IDEIA APROVADA                   */}
      {/* ========================================================================= */}
      {manageGainsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1.5px solid #10b981',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: isDark
                ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.15)'
                : '0 20px 50px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={22} color={isDark ? '#34d399' : '#15803d'} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Ganhos & Execução da Ideia
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManageGainsModal(null)}
                style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: isDark ? '#090e1a' : '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: isDark ? '#22d3ee' : '#0284c7', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                {manageGainsModal.protocol} • Autor: {manageGainsModal.authorName} ({manageGainsModal.sectorName})
              </span>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                {manageGainsModal.summary}
              </p>
            </div>

            <form onSubmit={handleSaveGains} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Etapa de Execução */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                  Etapa de Implantação
                </label>
                <select
                  className="form-control"
                  value={gainExecutionStatus}
                  onChange={(e) => setGainExecutionStatus(e.target.value as KaizenExecutionStatus)}
                  style={{
                    backgroundColor: isDark ? '#090e1a' : '#ffffff',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                >
                  <option value="planejamento">Planejamento da Melhoria</option>
                  <option value="em_implantacao">Em Implantação Prática no Posto</option>
                  <option value="implantada_sucesso">Implantada com Sucesso (Concluída)</option>
                </select>
              </div>

              {/* Ganhos em Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                    Custo Evitado Real (R$) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 14500"
                    className="form-control"
                    value={gainActualCostAvoided}
                    onChange={(e) => setGainActualCostAvoided(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{
                      backgroundColor: isDark ? '#090e1a' : '#ffffff',
                      borderColor: isDark ? 'rgba(16, 185, 129, 0.4)' : '#10b981',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                    }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                    Horas Salvas (h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Ex: 38"
                    className="form-control"
                    value={gainHoursSaved}
                    onChange={(e) => setGainHoursSaved(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{
                      backgroundColor: isDark ? '#090e1a' : '#ffffff',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                  Memorial do Ganho / Detalhes da Economia
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={gainNotes}
                  onChange={(e) => setGainNotes(e.target.value)}
                  placeholder="Ex: Redução de 5 minutos por troca de turno e eliminação de desperdício de refugo..."
                  style={{
                    backgroundColor: isDark ? '#090e1a' : '#ffffff',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.84375rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setManageGainsModal(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} /> Salvar Ganhos & Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
