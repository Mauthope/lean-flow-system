'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Tenant } from '@/lib/types';
import { TenantModal } from '@/components/forms/TenantModal';
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
  Database,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminEntidadesPage() {
  const { currentTenant, allTenants, switchTenant, refreshData, dataVersion } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

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
                backgroundColor: 'rgba(6, 182, 212, 0.18)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Governança Master • Multi-Tenant
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Gestão de Entidades & Plantas Fabris
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
            Gerencie múltiplas unidades, plantas industriais ou empresas com total isolamento de dados e links públicos dedicados
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.15rem' }}
        >
          <Plus size={17} /> Cadastrar Nova Entidade / Planta
        </button>
      </div>

      {/* Panorama Geral - 4 KPI Cards Consolidando Todo o Ecossistema */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Plantas / Entidades
            </span>
            <Factory size={18} color="#22d3ee" />
          </div>
          <p style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {panoramaMetrics.totalTenants}
          </p>
          <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 600 }}>Unidades industriais ativas</span>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Setores Industriais
            </span>
            <Building2 size={18} color="#a855f7" />
          </div>
          <p style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {panoramaMetrics.totalSectors}
          </p>
          <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600 }}>Áreas e postos de trabalho mapeados</span>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Facilitadores Lean
            </span>
            <Users size={18} color="#10b981" />
          </div>
          <p style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {panoramaMetrics.totalAgents}
          </p>
          <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>Agentes atuando no chão de fábrica</span>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Custo Evitado Global
            </span>
            <TrendingUp size={18} color="#fbbf24" />
          </div>
          <p style={{ fontSize: '1.65rem', fontWeight: 900, color: '#34d399', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {formatCurrency(panoramaMetrics.totalCostAvoided)}
          </p>
          <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>Soma de ROI em todas as unidades</span>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#090e1a',
          padding: '0.875rem 1rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
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
              backgroundColor: '#030712',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              color: '#ffffff',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          />
        </div>

        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Exibindo <strong>{filteredTenants.length}</strong> de <strong>{allTenants.length}</strong> entidades
        </span>
      </div>

      {/* Grid de Cards das Entidades */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredTenants.map((tenant) => {
          const isCurrent = currentTenant?.id === tenant.id;
          const stats = dataService.getTenantStats(tenant.id);
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
                borderTop: isCurrent ? '4px solid #10b981' : '4px solid #06b6d4',
                backgroundColor: isCurrent ? '#0c1626' : undefined,
                boxShadow: isCurrent ? '0 0 20px rgba(16, 185, 129, 0.15)' : undefined,
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
                        backgroundColor: isCurrent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        border: isCurrent ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1.5px solid rgba(6, 182, 212, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCurrent ? '#34d399' : '#22d3ee',
                        flexShrink: 0,
                      }}
                    >
                      <Factory size={22} />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                        {tenant.name}
                      </h3>
                      <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: '0.1rem 0 0' }}>
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
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
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
                            backgroundColor: '#34d399',
                          }}
                        />
                        Planta Ativa
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: tenant.plan === 'enterprise' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                        color: tenant.plan === 'enterprise' ? '#22d3ee' : '#cbd5e1',
                        border: tenant.plan === 'enterprise' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {tenant.plan || 'enterprise'}
                    </span>
                  </div>
                </div>

                {/* Grid de Métricas da Planta */}
                <div
                  style={{
                    backgroundColor: '#090e1a',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.875rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                      Setores Mapeados
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0.1rem 0 0' }}>
                      {stats.sectorsCount} áreas
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                      Facilitadores Lean
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399', margin: '0.1rem 0 0' }}>
                      {stats.agentsCount} agentes
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                      Ações & Kaizens
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0.1rem 0 0' }}>
                      {stats.actionsCount} ({stats.activeActionsCount} em andamento)
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                      Custo Evitado Acumulado
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', margin: '0.1rem 0 0' }}>
                      {formatCurrency(stats.totalCostAvoided)}
                    </p>
                  </div>
                </div>

                {/* Link Público de Coleta da Fábrica */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                      Link Público de Coleta Gemba
                    </span>
                    <span style={{ fontSize: '0.675rem', color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
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
                        backgroundColor: isCopied ? 'rgba(16, 185, 129, 0.2)' : undefined,
                        borderColor: isCopied ? '#10b981' : undefined,
                        color: isCopied ? '#34d399' : undefined,
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
              </div>

              {/* Ações do Rodapé do Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
                      color: '#34d399',
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
          backgroundColor: '#070c18',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <Database size={24} color="#22d3ee" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Estrutura de Isolamento de Dados (Preparada para o Supabase)
          </h4>
          <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: '0.35rem 0 0', lineHeight: 1.5 }}>
            No banco de dados do <strong>Supabase</strong>, cada uma dessas entidades corresponde a uma linha na tabela <code style={{ color: '#22d3ee' }}>public.tenants</code>.
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
    </div>
  );
}
