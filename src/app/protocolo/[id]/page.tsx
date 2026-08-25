'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { dataService } from '@/services/dataService';
import { LeanAction } from '@/lib/types';
import { StatusBadge, PriorityBadge, WasteCategoryBadge } from '@/components/ui/Badge';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import {
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  Building,
  UserCheck,
} from 'lucide-react';

export default function ProtocolTrackerPage() {
  const params = useParams();
  const protocolId = params.id as string;

  const [action, setAction] = useState<LeanAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(protocolId || '');

  const loadProtocol = (proto: string) => {
    if (!proto) return;
    setLoading(true);
    const found = dataService.getActionByProtocol(proto);
    setAction(found || null);
    setLoading(false);
  };

  useEffect(() => {
    if (protocolId) {
      loadProtocol(protocolId);
    }
  }, [protocolId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      loadProtocol(searchInput.trim());
    }
  };

  const steps = [
    { key: 'aberta', label: '1. Demanda Registrada & Triagem', description: 'Aguardando avaliação ou atribuída a um agente' },
    { key: 'em_andamento', label: '2. Em Andamento / Kaizen', description: 'Agente Lean atuando no posto de trabalho' },
    { key: 'concluida', label: '3. Concluída & Padronizada', description: 'Solução validada e custo evitado contabilizado' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#060a13',
        backgroundImage: `
          radial-gradient(at 5% 5%, rgba(6, 182, 212, 0.09) 0px, transparent 40%),
          radial-gradient(at 95% 95%, rgba(139, 92, 246, 0.09) 0px, transparent 40%),
          radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.04) 0px, transparent 60%)
        `,
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <header
        style={{
          backgroundColor: 'rgba(10, 15, 29, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22d3ee', textDecoration: 'none', fontWeight: 700 }}>
          <ArrowLeft size={16} /> Voltar ao Portal
        </Link>
        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
          Consulta Pública de Protocolos Lean
        </span>
      </header>

      <main style={{ maxWidth: '850px', margin: '2.5rem auto', padding: '0 1rem 4rem' }}>
        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Digite o código do protocolo (ex: RAF-2026-8803)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ backgroundColor: '#090e1a', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
            <Search size={15} /> Consultar
          </button>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Carregando dados do protocolo...</div>
        ) : !action ? (
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: '16px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <AlertTriangle size={40} color="#fbbf24" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              Protocolo Não Encontrado
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Não encontramos nenhuma demanda cadastrada com o código &quot;{searchInput}&quot;. Verifique o número digitado.
            </p>
            <Link href="/nova-demanda" className="btn btn-primary btn-sm">
              Cadastrar Nova Demanda
            </Link>
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* Header with Protocol & Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    color: '#22d3ee',
                    backgroundColor: 'rgba(6, 182, 212, 0.12)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                  }}
                >
                  {action.protocol}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                  {action.title}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <StatusBadge status={action.status} />
                <PriorityBadge priority={action.priority} />
              </div>
            </div>

            {/* If Rejected Banner */}
            {action.status === 'nao_aprovada' && (
              <div
                style={{
                  margin: '1.5rem 0',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <ShieldAlert size={20} color="#f87171" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-heading)' }}>
                    Demanda Não Aprovada na Triagem
                  </h4>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#fca5a5', lineHeight: 1.5 }}>
                  {action.rejectionReason || 'Esta demanda não foi acolhida no momento pela supervisão Lean.'}
                </p>
                {action.triagedAt && (
                  <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.5rem' }}>
                    Avaliado em {formatDateTime(action.triagedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Stepper Progress */}
            {action.status !== 'nao_aprovada' && (
              <div style={{ margin: '2rem 0' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Progresso do Fluxo Lean:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {steps.map((step, idx) => {
                    const isDone =
                      action.status === 'concluida' ||
                      (action.status === 'em_andamento' && idx <= 1) ||
                      (action.status === 'aberta' && idx === 0);

                    const isCurrent =
                      (action.status === 'aberta' && idx === 0) ||
                      (action.status === 'em_andamento' && idx === 1) ||
                      (action.status === 'concluida' && idx === 2);

                    return (
                      <div
                        key={step.key}
                        style={{
                          padding: '1rem',
                          borderRadius: '10px',
                          border: isCurrent ? '2px solid #22d3ee' : isDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                          backgroundColor: isCurrent ? 'rgba(6, 182, 212, 0.15)' : isDone ? 'rgba(16, 185, 129, 0.15)' : '#090e1a',
                        }}
                      >
                        <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: isCurrent ? '#22d3ee' : isDone ? '#34d399' : '#94a3b8', fontFamily: 'var(--font-heading)' }}>
                          {step.label}
                        </p>
                        <p style={{ fontSize: '0.725rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                backgroundColor: '#090e1a',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8' }}>Setor:</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff' }}>
                  {action.originSectorName || 'Geral'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8' }}>Desperdício Lean:</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <WasteCategoryBadge category={action.wasteCategory} />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8' }}>Agente Designado:</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff' }}>
                  {action.assignedAgentName || 'Aguardando atribuição do supervisor'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8' }}>Data de Abertura:</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {formatDateTime(action.createdAt)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                Descrição Enviada:
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {action.description}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
