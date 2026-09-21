'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { dataService } from '@/services/dataService';
import { Tenant } from '@/lib/types';
import { TenantModal } from '@/components/forms/TenantModal';
import { MasterTransferModal } from '@/components/forms/MasterTransferModal';
import { TenantPurgeModal } from '@/components/forms/TenantPurgeModal';
import { ManagerTransitionModal } from '@/components/forms/ManagerTransitionModal';
import { formatCurrency } from '@/lib/utils';
import {
  Factory,
  Building2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Search,
  CheckCircle2,
  TrendingUp,
  Users,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowRightLeft,
  Database,
  Lock,
  Crown,
  Download,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminEntidadesPage() {
  const router = useRouter();
  const { currentUser, currentTenant, allTenants, switchTenant, refreshData, dataVersion } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [transitionTenant, setTransitionTenant] = useState<Tenant | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeTenant, setPurgeTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const isMaster =
    currentUser?.isMaster === true ||
    currentUser?.email?.toLowerCase() === 'mauricio.grigol@rafitec.com.br' ||
    currentUser?.email?.toLowerCase() === 'master@rafitec.com.br';

  useEffect(() => {
    if (currentUser && !isMaster) {
      router.replace('/admin/dashboard');
    }
  }, [currentUser, isMaster, router]);

  const handleOpenTransition = (tenant: Tenant) => {
    setTransitionTenant(tenant);
    setIsTransitionModalOpen(true);
  };

  const handleOpenPurge = (tenant: Tenant) => {
    setPurgeTenant(tenant);
    setIsPurgeModalOpen(true);
  };

  const handleDownloadGlobalBackup = () => {
    const backupData = dataService.exportAllBackup();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `backup_global_fluxolean_${dateStr}.json`;

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

  const handleDownloadTenantBackup = (tenant: Tenant) => {
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

  // Panorama geral consolidado de todas as entidades
  const panoramaMetrics = useMemo(() => {
    let totalSectors = 0;
    let totalAgents = 0;
    let totalActions = 0;
    let totalCostAvoided = 0;

    allTenants.forEach((t) => {
      const stats = dataService.getTenantStats(t.id);
      totalSectors += stats.sectorsCount;
      totalAgents += stats.agentsCount;
      totalActions += stats.actionsCount;
      totalCostAvoided += stats.totalCostAvoided;
    });

    return {
      totalTenants: allTenants.length,
      totalSectors,
      totalAgents,
      totalActions,
      totalCostAvoided,
    };
  }, [allTenants, dataVersion]);

  // Filtro de pesquisa
  const filteredTenants = useMemo(() => {
    if (!searchTerm.trim()) return allTenants;
    const term = searchTerm.toLowerCase();
    return allTenants.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.slug.toLowerCase().includes(term) ||
        (t.cnpjOrCode && t.cnpjOrCode.toLowerCase().includes(term))
    );
  }, [allTenants, searchTerm]);

  const handleCreateNew = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    if (allTenants.length <= 1) {
      alert('Você não pode excluir a única entidade cadastrada no sistema.');
      return;
    }

    const stats = dataService.getTenantStats(tenant.id);
    const confirmMessage =
      `ATENÇÃO: Deseja realmente excluir a entidade "${tenant.name}"?\n\n` +
      `• A unidade possui ${stats.sectorsCount} setores, ${stats.agentsCount} agentes e ${stats.actionsCount} ações registradas.\n` +
      `• Esta operação removerá a empresa e seus dados locais.\n\n` +
      `Deseja prosseguir com a exclusão?`;

    if (confirm(confirmMessage)) {
      dataService.deleteTenant(tenant.id);
      refreshData();
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/d/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleSwitchTenant = (tenantId: string, name: string) => {
    switchTenant(tenantId);
    alert(`Ambiente alternado com sucesso para "${name}"!\nOs dashboards, setores, agentes e Kaizens agora exibem os dados exclusivos desta unidade.`);
  };

  if (currentUser && !isMaster) {
    return (
      <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: isDark ? '#090e1a' : '#ffffff',
            border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fca5a5',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: isDark ? undefined : '0 10px 25px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Lock size={36} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '0.5rem' }}>
            Acesso Restrito ao Gestor Master
          </h3>
          <p style={{ fontSize: '0.84375rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5 }}>
            A gestão de entidades e plantas fabris é exclusiva da conta Master da plataforma. Gestores locais possuem acesso irrestrito ao painel e indicadores da sua própria unidade.
          </p>
          <button
            onClick={() => router.replace('/admin/dashboard')}
            className="btn btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            Ir para o Painel da Minha Unidade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 800,
                backgroundColor: isDark ? 'rgba(6, 182, 212, 0.18)' : 'rgba(8, 145, 178, 0.12)',
                color: isDark ? '#22d3ee' : '#0891b2',
                border: isDark ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid rgba(8, 145, 178, 0.3)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Governança Master • Multi-Tenant
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Gestão de Entidades & Plantas Fabris
          </h2>
          <p style={{ fontSize: '0.8125rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.2rem 0 0' }}>
            Gerencie múltiplas unidades, plantas industriais ou empresas com total isolamento de dados e links públicos dedicados
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Botão Backup Global */}
          <button
            onClick={handleDownloadGlobalBackup}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem' }}
            title="Baixar backup consolidado JSON de todas as entidades"
          >
            <Download size={16} color="#0891b2" /> Backup Global (JSON)
          </button>

          {/* Botão Sucessão Master */}
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1rem',
              borderColor: isDark ? 'rgba(234, 179, 8, 0.4)' : '#fde047',
              color: isDark ? '#facc15' : '#854d0e',
              backgroundColor: isDark ? 'rgba(234, 179, 8, 0.1)' : '#fefce8',
            }}
            title="Transferir gestão e titularidade do app para outro profissional (sucessão)"
          >
            <Crown size={16} color={isDark ? '#facc15' : '#ca8a04'} /> Transferir Master
          </button>

          {/* Cadastrar Nova Entidade */}
          <button
            onClick={handleCreateNew}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.15rem' }}
          >
            <Plus size={17} /> Cadastrar Nova Entidade / Planta
          </button>
        </div>
      </div>

      {/* Banner de Titularidade Master Ativa & Sucessão */}
      <div
        style={{
          backgroundColor: isDark ? 'rgba(234, 179, 8, 0.08)' : '#fefce8',
          border: isDark ? '1px solid rgba(234, 179, 8, 0.25)' : '1px solid #fde047',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef08a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#facc15' : '#ca8a04',
            }}
          >
            <Crown size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: isDark ? '#fde047' : '#a16207', letterSpacing: '0.04em' }}>
                Titular Master da Plataforma:
              </span>
              <strong style={{ fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                {currentUser?.name || 'Mauricio Grigol'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#475569' }}>
                ({currentUser?.email || 'mauricio.grigol@rafitec.com.br'})
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.15rem 0 0' }}>
              Controle central multi-tenant, provisionamento de novas fábricas, transição de gestores e expurgo fino para entrada em produção.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            fontSize: '0.75rem',
            color: isDark ? '#facc15' : '#854d0e',
            borderColor: isDark ? 'rgba(234, 179, 8, 0.4)' : '#fde047',
            backgroundColor: isDark ? undefined : '#ffffff',
          }}
        >
          <Crown size={14} /> Sucessão de Titularidade
        </button>
      </div>

      {/* Panorama Geral - 4 KPI Cards Consolidando Todo o Ecossistema */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: isDark ? '#090e1a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: isDark ? undefined : '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Plantas / Entidades
            </span>
            <Factory size={18} color="#0891b2" />
          </div>
          <p style={{ fontSize: '1.65rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {panoramaMetrics.totalTenants}
          </p>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#22d3ee' : '#0284c7', fontWeight: 600 }}>Unidades industriais ativas</span>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: isDark ? '#090e1a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: isDark ? undefined : '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Setores Industriais
            </span>
            <Building2 size={18} color="#9333ea" />
          </div>
          <p style={{ fontSize: '1.65rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {panoramaMetrics.totalSectors}
          </p>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#c084fc' : '#7c3aed', fontWeight: 600 }}>Áreas e postos de trabalho mapeados</span>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: isDark ? '#090e1a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: isDark ? undefined : '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Facilitadores Lean
            </span>
            <Users size={18} color="#10b981" />
          </div>
          <p style={{ fontSize: '1.65rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {panoramaMetrics.totalAgents}
          </p>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#34d399' : '#059669', fontWeight: 600 }}>Agentes atuando no chão de fábrica</span>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: isDark ? '#090e1a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: isDark ? undefined : '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Custo Evitado Global
            </span>
            <TrendingUp size={18} color="#d97706" />
          </div>
          <p style={{ fontSize: '1.65rem', fontWeight: 900, color: isDark ? '#34d399' : '#059669', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {formatCurrency(panoramaMetrics.totalCostAvoided)}
          </p>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#fbbf24' : '#d97706', fontWeight: 600 }}>Soma de ROI em todas as unidades</span>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#090e1a' : '#ffffff',
          padding: '0.875rem 1rem',
          borderRadius: '12px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
          boxShadow: isDark ? undefined : '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
          <Search
            size={15}
            color="#64748b"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar entidade por nome, CNPJ ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: isDark ? '#030712' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              color: isDark ? '#ffffff' : '#0f172a',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          />
        </div>

        <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
          Exibindo <strong>{filteredTenants.length}</strong> de <strong>{allTenants.length}</strong> entidades
        </span>
      </div>

      {/* Grid de Cards das Entidades */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredTenants.map((tenant) => {
          const isCurrent = currentTenant?.id === tenant.id;
          const stats = dataService.getTenantStats(tenant.id);
          const manager = dataService.getTenantManager(tenant.id);
          const isCopied = copiedSlug === tenant.slug;

          return (
            <div
              key={tenant.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderTop: isCurrent ? '4px solid #10b981' : (isDark ? '4px solid #06b6d4' : '4px solid #0284c7'),
                backgroundColor: isCurrent ? (isDark ? '#0c1626' : '#f0fdf4') : (isDark ? '#090e1a' : '#ffffff'),
                border: isCurrent
                  ? (isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #86efac')
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                boxShadow: isCurrent
                  ? (isDark ? '0 0 20px rgba(16, 185, 129, 0.15)' : '0 4px 16px rgba(16, 185, 129, 0.12)')
                  : (isDark ? undefined : '0 2px 8px rgba(0, 0, 0, 0.04)'),
                position: 'relative',
              }}
            >
              <div>
                {/* Header do Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        backgroundColor: isCurrent
                          ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7')
                          : (isDark ? 'rgba(6, 182, 212, 0.15)' : '#e0f2fe'),
                        border: isCurrent
                          ? (isDark ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1.5px solid #86efac')
                          : (isDark ? '1.5px solid rgba(6, 182, 212, 0.35)' : '1.5px solid #bae6fd'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCurrent ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#22d3ee' : '#0284c7'),
                        flexShrink: 0,
                      }}
                    >
                      <Factory size={22} />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-heading)', margin: 0 }}>
                        {tenant.name}
                      </h3>
                      <p style={{ fontSize: '0.725rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.1rem 0 0' }}>
                        CNPJ: {tenant.cnpjOrCode || 'Não informado'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 800,
                          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7',
                          color: isDark ? '#34d399' : '#15803d',
                          border: isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #86efac',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isDark ? '#34d399' : '#15803d',
                          }}
                        />
                        Planta Ativa
                      </span>
                    )}

                  </div>
                </div>

                {/* Grid de Métricas da Planta */}
                <div
                  style={{
                    backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                    borderRadius: '10px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    padding: '0.875rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Setores Mapeados
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0.1rem 0 0' }}>
                      {stats.sectorsCount} áreas
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Facilitadores Lean
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#34d399' : '#059669', margin: '0.1rem 0 0' }}>
                      {stats.agentsCount} agentes
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Ações & Kaizens
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0.1rem 0 0' }}>
                      {stats.actionsCount} ({stats.activeActionsCount} em andamento)
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Custo Evitado Acumulado
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#fbbf24' : '#d97706', margin: '0.1rem 0 0' }}>
                      {formatCurrency(stats.totalCostAvoided)}
                    </p>
                  </div>
                </div>

                {/* Gestor Responsável da Unidade & Ação de Transição */}
                <div
                  style={{
                    backgroundColor: isDark ? '#090e1a' : '#f8fafc',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img
                      src={
                        manager?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={manager?.name || 'Gestor'}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isDark ? '1.5px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #cbd5e1',
                      }}
                    />
                    <div>
                      <span style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Gestor da Planta
                      </span>
                      <strong style={{ fontSize: '0.8125rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                        {manager?.name || 'Nenhum gestor ativo'}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenTransition(tenant)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '0.725rem',
                      padding: '0.3rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: isDark ? '#22d3ee' : '#0284c7',
                      borderColor: isDark ? 'rgba(6, 182, 212, 0.35)' : '#bae6fd',
                    }}
                    title="Substituir ou transicionar gestor da planta com zero interrupção de serviços"
                  >
                    <ArrowRightLeft size={12} />
                    <span>Trocar Gestor</span>
                  </button>
                </div>

                {/* Link Público de Coleta da Fábrica */}
                <div
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.6rem 0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Link Público de Coleta Gemba
                    </span>
                    <span style={{ fontSize: '0.675rem', color: isDark ? '#22d3ee' : '#0284c7', fontFamily: 'var(--font-mono)' }}>
                      /d/{tenant.slug}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(tenant.slug)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.6rem',
                        backgroundColor: isCopied ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7') : undefined,
                        borderColor: isCopied ? '#10b981' : undefined,
                        color: isCopied ? (isDark ? '#34d399' : '#15803d') : undefined,
                      }}
                      title="Copiar URL para divulgar na fábrica"
                    >
                      {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{isCopied ? 'Copiado para o Clip!' : 'Copiar Link'}</span>
                    </button>

                    <Link
                      href={`/d/${tenant.slug}`}
                      target="_blank"
                      className="btn btn-secondary btn-sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.6rem',
                        textDecoration: 'none',
                      }}
                      title="Abrir formulário de demandas da planta em nova aba"
                    >
                      <ExternalLink size={13} />
                      <span>Testar</span>
                    </Link>
                  </div>
                </div>

                {/* Ferramentas de Engenharia de Dados & Produção por Entidade */}
                <div
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                    border: isDark ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.675rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Dados & Produção da Planta:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => handleDownloadTenantBackup(tenant)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      title="Baixar cópia de segurança JSON com todos os dados desta unidade"
                    >
                      <Download size={12} color="#0891b2" /> Backup JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPurge(tenant)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.3rem 0.55rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: '#ef4444',
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#fca5a5',
                      }}
                      title="Limpar dados fictícios de testes para iniciar a operação real em produção"
                    >
                      <Trash2 size={12} /> Limpar para Produção
                    </button>
                  </div>
                </div>
              </div>

              {/* Ações do Rodapé do Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                  paddingTop: '0.875rem',
                  gap: '0.5rem',
                }}
              >
                {!isCurrent ? (
                  <button
                    onClick={() => handleSwitchTenant(tenant.id, tenant.name)}
                    className="btn btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: 700,
                      border: 'none',
                    }}
                    title="Alternar contexto do sistema para os dados desta planta"
                  >
                    <ArrowRight size={14} /> Acessar Esta Planta
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isDark ? '#34d399' : '#15803d',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <CheckCircle2 size={14} /> Visualizando Atualmente
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleEdit(tenant)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Editar configurações da entidade"
                  >
                    <Edit2 size={13} /> Editar
                  </button>

                  <button
                    onClick={() => handleDelete(tenant)}
                    className="btn btn-outline-danger btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Excluir entidade"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informativo de Arquitetura Multi-Tenant / Supabase */}
      <div
        style={{
          backgroundColor: isDark ? '#070c18' : '#f0fdfa',
          border: isDark ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid #99f6e4',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <Database size={24} color="#0891b2" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
            Estrutura de Isolamento de Dados (Preparada para o Supabase)
          </h4>
          <p style={{ fontSize: '0.78125rem', color: isDark ? '#94a3b8' : '#334155', margin: '0.35rem 0 0', lineHeight: 1.5 }}>
            No banco de dados do <strong>Supabase</strong>, cada uma dessas entidades corresponde a uma linha na tabela <code style={{ color: isDark ? '#22d3ee' : '#0891b2' }}>public.tenants</code>.
            As políticas de <strong>Row Level Security (RLS)</strong> garantem que colaboradores da Planta A nunca visualizem ações, planos A3 ou cronoanálises da Planta B.
            Como desenvolvedor ou gestor Master, você pode transitar livremente entre as unidades para acompanhar o progresso operacional de cada uma.
          </p>
        </div>
      </div>

      {/* Tenant Modal */}
      {isModalOpen && (
        <TenantModal
          tenant={selectedTenant}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshData}
        />
      )}

      {/* Manager Transition Modal */}
      {isTransitionModalOpen && (
        <ManagerTransitionModal
          tenant={transitionTenant}
          isOpen={isTransitionModalOpen}
          onClose={() => setIsTransitionModalOpen(false)}
          onSuccess={refreshData}
        />
      )}

      {/* Master Transfer Modal */}
      {isTransferModalOpen && (
        <MasterTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          onSuccess={refreshData}
        />
      )}

      {/* Tenant Purge Modal */}
      {isPurgeModalOpen && (
        <TenantPurgeModal
          tenant={purgeTenant}
          isOpen={isPurgeModalOpen}
          onClose={() => setIsPurgeModalOpen(false)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
