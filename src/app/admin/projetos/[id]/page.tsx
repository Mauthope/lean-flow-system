'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { dataService } from '@/services/dataService';
import { LeanAction } from '@/lib/types';
import { StatusBadge, PriorityBadge, WasteCategoryBadge } from '@/components/ui/Badge';
import { formatDateTime, formatCurrency, WASTE_CATEGORIES } from '@/lib/utils';
import {
  ArrowLeft,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Building,
  User,
  CheckSquare,
  AlertTriangle,
  Calendar,
  Layers,
  FileCheck,
  Zap,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Shield,
  MessageSquare,
  Activity,
} from 'lucide-react';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [action, setAction] = useState<LeanAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (projectId) {
      // Find by ID or protocol
      let found = dataService.getActionById(projectId);
      if (!found) {
        found = dataService.getActionByProtocol(projectId);
      }
      setAction(found || null);
      setLoading(false);
    }
  }, [projectId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Carregando dados completos do projeto...</p>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '3rem auto' }}>
        <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Projeto Não Encontrado
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Não foi possível localizar o projeto com o identificador informado.
        </p>
        <Link href="/admin/relatorios" className="btn btn-primary btn-sm">
          <ArrowLeft size={16} /> Voltar para Relatórios
        </Link>
      </div>
    );
  }

  const waste = WASTE_CATEGORIES[action.wasteCategory];
  const breakdown = action.costBreakdown;
  const checklist = action.checklist || [];
  const completedChecklistCount = checklist.filter((item) => item.completed || item.status === 'concluida').length;
  const checklistPercentage = checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 100;

  // Multi-source costs breakdown items
  const breakdownItems = [
    { label: 'Aumento de Produção / Capacidade', val: breakdown?.productionIncrease || 0, icon: '📈', desc: 'Geração de receita por aumento de vazão' },
    { label: 'Redução de Refugo & Retrabalho', val: breakdown?.scrapReduction || 0, icon: '♻️', desc: 'Economia direta de insumos e matéria-prima' },
    { label: 'Mão de Obra & Horas Reduzidas', val: breakdown?.laborSavings || 0, icon: '⏱️', desc: 'Horas operacionais reaproveitadas no posto' },
    { label: 'Redução de Paradas de Máquina (OEE)', val: breakdown?.machineDowntime || 0, icon: '⚙️', desc: 'Mitigação de paradas críticas e setups longos' },
    { label: 'Energia, Ferramental & Insumos', val: breakdown?.toolingAndEnergy || 0, icon: '⚡', desc: 'Otimização de consumo e durabilidade' },
    { label: 'Fretes Especiais & Logística', val: breakdown?.logisticsAndFreight || 0, icon: '🚚', desc: 'Eliminação de transportes urgentes e estoques' },
    { label: breakdown?.otherSavingsDescription || 'Outros Custos Evitados', val: breakdown?.otherSavings || 0, icon: '💡', desc: 'Ganhos adicionais mapeados na homologação' },
  ].filter((item) => item.val > 0 || action.actualCostAvoided > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/admin/relatorios"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={15} /> Relatórios de ROI
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#64748b',
                  backgroundColor: '#f1f5f9',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                }}
              >
                {action.protocol}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#047857',
                  backgroundColor: '#ecfdf5',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                HOMOLOGADO COM CUSTO EVITADO
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0.25rem 0 0' }}>
              {action.title}
            </h1>
          </div>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Copiar link permanente deste projeto"
          >
            <Share2 size={14} /> {copied ? 'Link Copiado!' : 'Compartilhar'}
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Imprimir Relatório Executivo A3 / PDF"
          >
            <Printer size={14} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Hero Banner: Resumo Executivo & Identificação */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <StatusBadge status={action.status} />
              <PriorityBadge priority={action.priority} />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                ⚡ {waste?.label || action.wasteCategory}
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Descrição do Problema & Desafio Superado
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {action.description}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              padding: '1.25rem',
              minWidth: '240px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Custo Evitado Homologado
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399', margin: '0.35rem 0' }}>
              {formatCurrency(action.actualCostAvoided || action.estimatedCostAvoided)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
              ⏱️ <strong>{action.hoursSaved || 0} horas</strong> economizadas/mês
            </div>
          </div>
        </div>

        {/* Project Meta Footer */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            fontSize: '0.8125rem',
          }}
        >
          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.725rem', fontWeight: 600 }}>SETOR DE IMPACTO</span>
            <strong style={{ color: '#ffffff' }}>🏢 {action.originSectorName || 'Geral'}</strong>
          </div>

          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.725rem', fontWeight: 600 }}>AGENTE RESPONSÁVEL</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <img
                src={action.assignedAgentAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={action.assignedAgentName || ''}
                style={{ width: '20px', height: '20px', borderRadius: '50%' }}
              />
              <strong style={{ color: '#ffffff' }}>{action.assignedAgentName || 'Não atribuído'}</strong>
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.725rem', fontWeight: 600 }}>DATA DE CRIAÇÃO</span>
            <strong style={{ color: '#ffffff' }}>📅 {formatDateTime(action.createdAt)}</strong>
          </div>

          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.725rem', fontWeight: 600 }}>DATA DE CONCLUSÃO</span>
            <strong style={{ color: '#ffffff' }}>✅ {action.completedAt ? formatDateTime(action.completedAt) : 'Em Andamento'}</strong>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: DETALHAMENTO MULTI-VETORIAL DO CUSTO EVITADO */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <DollarSign size={22} color="#059669" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Composição Financeira do Custo Evitado (ROI Real)
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                Detalhamento dos vetores de economia mapeados e validados no projeto
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>ESTIMADO INICIAL</span>
              <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#475569', margin: 0 }}>
                {formatCurrency(action.estimatedCostAvoided)}
              </p>
            </div>
            <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 700 }}>REAL APURADO</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#047857', margin: 0 }}>
                {formatCurrency(action.actualCostAvoided)}
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {breakdownItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: item.val > 0 ? '#f0fdf4' : '#f8fafc',
                border: item.val > 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.78125rem', fontWeight: 700, color: item.val > 0 ? '#166534' : '#475569' }}>
                    {item.label}
                  </span>
                </div>
                <p style={{ fontSize: '0.725rem', color: '#64748b', lineHeight: 1.3, margin: '0 0 0.5rem 0' }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Impacto:</span>
                <strong style={{ fontSize: '1.15rem', color: item.val > 0 ? '#047857' : '#94a3b8' }}>
                  {formatCurrency(item.val)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 2: AÇÕES FEITAS / PLANO DE AÇÃO EXECUTADO (CHECKLIST) */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckSquare size={22} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Ações Feitas & Checklist de Execução Kaizen
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                Etapas realizadas para implementação, validação e padronização da melhoria
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.78125rem',
                fontWeight: 800,
                backgroundColor: checklistPercentage === 100 ? '#ecfdf5' : '#eff6ff',
                color: checklistPercentage === 100 ? '#047857' : '#1d4ed8',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
              }}
            >
              {checklist.length > 0 ? `${completedChecklistCount}/${checklist.length} Ações Concluídas (${checklistPercentage}%)` : 'Padronização 100% Homologada'}
            </span>
          </div>
        </div>

        {checklist.length === 0 ? (
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Melhoria Executada em Posto de Trabalho
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '520px', margin: '0.25rem auto 0' }}>
              Esta ação foi homologada diretamente pelo agente {action.assignedAgentName || 'Lean'} com resolução imediata e validação das contramedidas de processo.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checklist.map((item, index) => {
              const isDone = item.completed || item.status === 'concluida';
              const isInProgress = item.status === 'em_andamento';

              return (
                <div
                  key={item.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    backgroundColor: isDone ? '#f0fdf4' : isInProgress ? '#eff6ff' : '#ffffff',
                    border: isDone ? '1px solid #bbf7d0' : isInProgress ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#10b981' : isInProgress ? '#3b82f6' : '#e2e8f0',
                          color: isDone || isInProgress ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {isDone ? '✓' : index + 1}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', textDecoration: isDone ? 'none' : 'none' }}>
                        {item.label}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.responsibleName && (
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                          }}
                        >
                          👤 {item.responsibleName}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: isDone ? '#ecfdf5' : isInProgress ? '#eff6ff' : '#fef2f2',
                          color: isDone ? '#047857' : isInProgress ? '#1d4ed8' : '#dc2626',
                        }}
                      >
                        {isDone ? 'Concluída' : isInProgress ? 'Em Andamento' : 'Pendente'}
                      </span>
                    </div>
                  </div>

                  {/* Optional extra metadata for each action item */}
                  {(item.observations || item.durationHours || item.startDate) && (
                    <div
                      style={{
                        marginTop: '0.6rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px dashed #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        fontSize: '0.78125rem',
                        color: '#475569',
                      }}
                    >
                      {item.observations && (
                        <div>
                          <strong>Nota de Padronização:</strong> {item.observations}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
                        {item.durationHours && <span>⏱️ Duração: {item.durationHours}h</span>}
                        {item.startDate && <span>📅 Início: {item.startDate}</span>}
                        {item.endDate && <span>🏁 Fim: {item.endDate}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEÇÃO 3: GOVERNANÇA LEAN & PADRÃO DE TRABALHO */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Causa Raiz / 5 Porquês */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <HelpCircle size={18} color="#7c3aed" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Análise de Causa Raiz (5 Porquês / Ishikawa)
            </h4>
          </div>
          <p style={{ fontSize: '0.84375rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {action.rootCauseAnalysis ||
              'A causa fundamental foi tratada na origem para evitar a reincidência do desperdício de ' + (waste?.label || 'processo') + '.'}
          </p>
        </div>

        {/* Padronização & SOP */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileCheck size={18} color="#0891b2" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Padronização de Trabalho (SOP / LPP)
            </h4>
          </div>
          <p style={{ fontSize: '0.84375rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {action.standardWorkUpdated
              ? '✅ Procedimento Operacional Padrão (SOP) revisado e treinado com os operadores da célula.'
              : 'Padronização homologada pela supervisão e incorporada à rotina de trabalho padrão da fábrica.'}
          </p>
        </div>
      </div>

      {/* SEÇÃO 4: ASSINATURA OFICIAL DE AUTORIA */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.875rem',
            }}
          >
            MG
          </div>
          <div>
            <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>
              Mauricio Grigol
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Consultor Lean & Desenvolvedor Full Stack • Sistema Lean Flow
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Relatório Executivo emitido em {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}
