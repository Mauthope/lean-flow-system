'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  HelpCircle,
  Target,
  Lightbulb,
  FileCheck,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  TrendingUp,
  Layers,
  Smartphone,
  Timer,
  BookOpen,
  Wrench,
  Award,
  CheckCircle2,
  Users,
  Gift,
  Check,
  Lock,
  Unlock,
  Activity,
  ShieldCheck,
  Bot,
  Plus,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ArticleReadingTelemetry } from '@/components/academy/LeanArticleModal';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { AgentExamResult, AgentLearningRanking, LeanArticleItem } from '@/lib/types';

const LeanArticleModal = dynamic(() => import('@/components/academy/LeanArticleModal'), {
  ssr: false,
});
const LeanExamModal = dynamic(() => import('@/components/academy/LeanExamModal'), {
  ssr: false,
});
const CreateArticleSenseiModal = dynamic(() => import('@/components/academy/CreateArticleSenseiModal'), {
  ssr: false,
});

interface ToolCardItem {
  id: string;
  href: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  highlights: string[];
}

const LEAN_TOOLS: ToolCardItem[] = [
  {
    id: 'cronoanalise',
    href: '/agente/ferramentas/cronoanalise',
    title: 'Estudo de Tempos (Cronoanálise)',
    badge: 'Chão de Fábrica',
    badgeColor: '#22d3ee',
    description:
      'Cronômetro avançado para medição de tempos de ciclo, paradas de linha (NVA), cálculo de Valor Agregado (%) e gráficos de Pareto em tempo real.',
    icon: Timer,
    iconColor: '#22d3ee',
    iconBg: 'rgba(6, 182, 212, 0.15)',
    highlights: ['Multi-Cronômetro por Motivo', 'Classificação VA vs NVA', 'Pareto & Exportação Excel'],
  },
  {
    id: 'calc-roi',
    href: '/agente/ferramentas/calculadora-roi',
    title: 'Calculadora de Horas & Custo Evitado',
    badge: 'Essencial',
    badgeColor: '#34d399',
    description:
      'Calcule em segundos as horas economizadas no mês/ano e o Custo Evitado Real (R$) a partir do tempo de ciclo antes e depois da melhoria.',
    icon: Calculator,
    iconColor: '#34d399',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    highlights: ['Horas/Mês & Horas/Ano', 'Custo Evitado (R$)', 'Fácil cópia para o Kanban'],
  },
  {
    id: '5-whys',
    href: '/agente/ferramentas/5-porques',
    title: 'Investigação dos 5 Porquês (Causa Raiz)',
    badge: 'Diagnóstico',
    badgeColor: '#c084fc',
    description:
      'Descubra a causa raiz fundamental de defeitos e paradas de máquina para criar contramedidas eficazes e definitivas.',
    icon: HelpCircle,
    iconColor: '#c084fc',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    highlights: ['5 Níveis de Causalidade', 'Contramedida & SOP', 'Exportação de texto'],
  },
  {
    id: 'matriz-gut',
    href: '/agente/ferramentas/matriz-gut',
    title: 'Matriz GUT de Priorização',
    badge: 'Decisão',
    badgeColor: '#fbbf24',
    description:
      'Avalie Gravidade, Urgência e Tendência (G × U × T) para saber com precisão científica qual problema deve ser atacado primeiro.',
    icon: Target,
    iconColor: '#fbbf24',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    highlights: ['Score de 1 a 125', 'Classificação de Risco', 'Critérios objetivos'],
  },
  {
    id: '8-desperdicios',
    href: '/agente/ferramentas/8-desperdicios',
    title: 'Guia dos 8 Desperdícios Lean (Muda)',
    badge: 'Consulta',
    badgeColor: '#94a3b8',
    description:
      'Dicionário prático com exemplos reais de chão de fábrica para identificar Superprodução, Espera, Transporte, Estoque e Defeitos.',
    icon: Lightbulb,
    iconColor: '#fbbf24',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    highlights: ['8 Desperdícios (Muda)', 'Exemplos Operacionais', 'Dicas de Eliminação'],
  },
  {
    id: 'gerador-sop',
    href: '/agente/ferramentas/gerador-sop',
    title: 'Gerador de Procedimento Padrão (SOP)',
    badge: 'Padronização',
    badgeColor: '#22d3ee',
    description:
      'Crie rapidamente a Folha de Instrução de Trabalho e Lição Ponto a Ponto (LPP) para garantir que a melhoria não se perca.',
    icon: FileCheck,
    iconColor: '#22d3ee',
    iconBg: 'rgba(6, 182, 212, 0.15)',
    highlights: ['Passo a Passo Padrão', 'Pontos Críticos de Segurança', 'Imprimível / PDF'],
  },
  {
    id: 'auditoria-5s',
    href: '/agente/ferramentas/auditoria-5s',
    title: 'Checklist Rápido de Auditoria 5S',
    badge: 'Auditoria',
    badgeColor: '#34d399',
    description:
      'Avalie a conformidade dos 5 Sensos (Utilização, Organização, Limpeza, Padronização e Disciplina) diretamente no posto de trabalho.',
    icon: CheckSquare,
    iconColor: '#34d399',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    highlights: ['5 Sensos do Kaizen', 'Cálculo de Conformidade %', 'Plano de Ação Imediato'],
  },
];

export default function LeanToolsIndexPage() {
  const { currentUser, currentTenant } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [activeMainTab, setActiveMainTab] = useState<'articles' | 'tools'>('articles');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Artigos Dinâmicos
  const [articlesList, setArticlesList] = useState<LeanArticleItem[]>([]);

  // Gamificação & Telemetria
  const currentAgentId = currentUser?.id || 'agent_default';
  const [readArticleIds, setReadArticleIds] = useState<string[]>([]);
  const [validatedArticleIds, setValidatedArticleIds] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<LeanArticleItem | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Prova de Certificação
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [latestExam, setLatestExam] = useState<AgentExamResult | undefined>(undefined);

  // Co-criação de Artigo com Sensei (Exclusivo Master)
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);

  // Ranking de Agentes (Visão do Master/Admin)
  const [rankingList, setRankingList] = useState<AgentLearningRanking[]>([]);

  const loadData = () => {
    const articles = dataService.getArticles();
    setArticlesList(articles);

    const reads = dataService.getAgentReadArticles(currentAgentId);
    setReadArticleIds(reads);

    const validated = dataService.getAgentValidatedArticles(currentAgentId);
    setValidatedArticleIds(validated);

    const exam = dataService.getAgentLatestExam(currentAgentId);
    setLatestExam(exam);

    if (isAdmin) {
      const ranking = dataService.getAllAgentsLearningRanking(currentTenant?.id);
      setRankingList(ranking);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentAgentId, isAdmin, currentTenant]);

  const handleOpenArticle = (article: LeanArticleItem) => {
    setSelectedArticle(article);
    setIsArticleModalOpen(true);
  };

  const handleMarkAsRead = (articleId: string, telemetry: ArticleReadingTelemetry) => {
    dataService.markArticleAsRead(currentAgentId, articleId, telemetry);
    setReadArticleIds((prev) => (prev.includes(articleId) ? prev : [...prev, articleId]));
    if (telemetry.isValidated) {
      setValidatedArticleIds((prev) => (prev.includes(articleId) ? prev : [...prev, articleId]));
    }
    loadData();
  };

  const handleExamCompleted = (result: AgentExamResult) => {
    setLatestExam(result);
    loadData();
  };

  const handleToggleReward = (agentId: string, examId: string, currentStatus: boolean) => {
    dataService.toggleExamRewardClaimed(examId, !currentStatus);
    loadData();
  };

  const totalArticles = articlesList.length || 8;
  const validatedCount = validatedArticleIds.length;
  const validatedPercent = totalArticles > 0 ? Math.round((validatedCount / totalArticles) * 100) : 0;
  const canTakeExam = validatedPercent >= 95 || validatedCount >= Math.ceil(totalArticles * 0.95);

  const categories = ['Todos', 'Fundamentos', 'Qualidade', 'Produtividade', 'Métodos', 'Manutenção'];
  const filteredArticles =
    selectedCategory === 'Todos'
      ? articlesList
      : articlesList.filter((a) => a.category === selectedCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091326 0%, #0d2d3a 100%)',
          borderRadius: '20px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                color: '#22d3ee',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Sparkles size={12} /> ACADEMIA LEAN MANUFACTURING
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Academia Lean & Ferramentas Operacionais
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', maxWidth: '640px', marginTop: '0.35rem' }}>
            Estude os conceitos fundamentais do TPS, valide leituras ativas e conquiste a Certificação Oficial de Especialista Lean!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsCreateArticleOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.22) 0%, rgba(245, 158, 11, 0.28) 100%)',
                border: '1.5px solid rgba(254, 240, 138, 0.7)',
                backdropFilter: 'blur(12px)',
                color: '#fef08a',
                fontWeight: 900,
                fontSize: '0.8125rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px -4px rgba(245, 158, 11, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <Bot size={18} color="#fbbf24" />
              <span>Criar Artigo com Sensei</span>
            </button>
          )}

          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsExamModalOpen(true)}
              className="btn btn-sm"
              style={{
                backgroundColor: canTakeExam ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: canTakeExam ? '1.5px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
                color: canTakeExam ? '#fbbf24' : '#94a3b8',
                fontWeight: 800,
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                boxShadow: canTakeExam ? '0 0 15px rgba(251, 191, 36, 0.2)' : 'none',
              }}
            >
              {canTakeExam ? <Unlock size={15} color="#fbbf24" /> : <Lock size={15} color="#94a3b8" />}
              {latestExam?.passed
                ? 'Agente Qualificado 🏆'
                : canTakeExam
                ? 'Iniciar Prova (10 Questões • 12 min)'
                : 'Prova Bloqueada (Requer 95% lidos)'}
            </button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* ABAS PRINCIPAIS: 1º ARTIGOS (ACADEMIA) | 2º FERRAMENTAS (GEMBA)    */}
      {/* ================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          backgroundColor: '#060a13',
          borderRadius: '16px',
          padding: '0.45rem',
          gap: '0.65rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* 1º ARTIGOS DA ACADEMIA LEAN (Paleta Violeta / Roxo Mestre) */}
        <button
          type="button"
          onClick={() => setActiveMainTab('articles')}
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            border: activeMainTab === 'articles' ? '1.5px solid #a855f7' : '1px solid rgba(168, 85, 247, 0.25)',
            background:
              activeMainTab === 'articles'
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(124, 58, 237, 0.2) 100%)'
                : 'rgba(168, 85, 247, 0.05)',
            color: activeMainTab === 'articles' ? '#ffffff' : '#c084fc',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            transition: 'all 0.2s ease',
            boxShadow: activeMainTab === 'articles' ? '0 4px 20px rgba(168, 85, 247, 0.35)' : 'none',
          }}
        >
          <BookOpen size={18} color={activeMainTab === 'articles' ? '#c084fc' : '#a855f7'} />
          <span>1. Artigos da Academia ({articlesList.length})</span>
          {validatedCount > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                backgroundColor: '#10b981',
                color: '#000000',
                padding: '0.12rem 0.45rem',
                borderRadius: '999px',
                fontWeight: 900,
              }}
            >
              {validatedCount}/{totalArticles} Concluídos
            </span>
          )}
        </button>

        {/* 2º FERRAMENTAS INTERATIVAS OPERACIONAIS (Paleta Ciano / Turquesa Gemba) */}
        <button
          type="button"
          onClick={() => setActiveMainTab('tools')}
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            border: activeMainTab === 'tools' ? '1.5px solid #22d3ee' : '1px solid rgba(6, 182, 212, 0.25)',
            background:
              activeMainTab === 'tools'
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(13, 148, 136, 0.2) 100%)'
                : 'rgba(6, 182, 212, 0.05)',
            color: activeMainTab === 'tools' ? '#ffffff' : '#22d3ee',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            transition: 'all 0.2s ease',
            boxShadow: activeMainTab === 'tools' ? '0 4px 20px rgba(6, 182, 212, 0.35)' : 'none',
          }}
        >
          <Wrench size={18} color={activeMainTab === 'tools' ? '#22d3ee' : '#06b6d4'} />
          <span>2. Ferramentas Interativas ({LEAN_TOOLS.length})</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* ABA 1: ARTIGOS & ACADEMIA LEAN (PRIMEIRA OPÇÃO)                    */}
      {/* ================================================================= */}
      {activeMainTab === 'articles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card de Progresso na Academia Lean (Visão do Agente) */}
          {!isAdmin && (
            <div
              style={{
                background: 'linear-gradient(135deg, #130f2e 0%, #090e1a 100%)',
                backgroundColor: '#090e1a',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '18px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    backgroundColor: latestExam?.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.15)',
                    border: `1.5px solid ${latestExam?.passed ? '#10b981' : '#a855f7'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                  }}
                >
                  {latestExam?.passed ? '🏆' : '🎓'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>
                      Sua Jornada de Capacitação Lean
                    </span>
                    {latestExam?.passed && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '999px',
                        }}
                      >
                        Agente Qualificado 🏆
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '0.1rem 0' }}>
                    {validatedCount} de {totalArticles} Artigos com Leitura Validada ({validatedPercent}%)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {latestExam?.passed
                      ? `🏆 Parabéns! Certificação de Agente Qualificado ativa com Nota ${latestExam.score.toFixed(1)}/10.0.`
                      : canTakeExam
                      ? '🔓 Requisito atingido (≥95%)! Prova de 10 questões liberada com regra anti-chute.'
                      : `🔒 Conclua mais ${Math.max(0, Math.ceil(totalArticles * 0.95) - validatedCount)} artigo(s) com leitura ativa para liberar a prova.`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '140px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', color: '#94a3b8' }}>
                    <span>Validação Master</span>
                    <strong style={{ color: validatedPercent >= 95 ? '#34d399' : '#ffffff' }}>{validatedPercent}%</strong>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${validatedPercent}%`, backgroundColor: validatedPercent >= 95 ? '#10b981' : '#a855f7' }} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{
                    fontWeight: 800,
                    padding: '0.55rem 1.25rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: canTakeExam ? '#10b981' : undefined,
                  }}
                >
                  <Award size={15} />
                  {latestExam?.passed ? 'Ver Certificado / Gabarito' : canTakeExam ? 'Fazer Prova' : 'Prova (Bloqueada)'}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TABELA DE RANKING DOS AGENTES (VISÃO DO MASTER / ADMIN)        */}
          {/* ============================================================= */}
          {isAdmin && (
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '18px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Users size={18} color="#22d3ee" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    Ranking de Estudos dos Agentes & Status de Recompensas
                  </h3>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: '#94a3b8', fontSize: '0.725rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Posição / Agente</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Leitura Validada (Master)</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Apto ao Exame (≥95%)</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Nota na Prova</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Qualificação</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Recompensa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingList.map((rank, idx) => (
                      <tr key={rank.agentId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : 'rgba(255, 255, 255, 0.06)',
                              color: idx <= 2 ? '#000000' : '#ffffff',
                              fontWeight: 900,
                              fontSize: '0.7rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <strong style={{ color: '#ffffff', display: 'block' }}>{rank.agentName}</strong>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{rank.agentEmail}</span>
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                          <span style={{ fontWeight: 700, color: rank.validatedArticlesReadPercent >= 95 ? '#34d399' : '#ffffff' }}>
                            {rank.validatedArticlesReadCount}
                          </span> / {rank.totalArticlesCount} ({rank.validatedArticlesReadPercent}%)
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {rank.canTakeExam ? (
                            <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '6px', border: '1px solid #10b981' }}>
                              🔓 Liberado
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
                              🔒 Bloqueado ({rank.validatedArticlesReadPercent}%)
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {rank.latestExam ? (
                            <strong style={{ color: rank.latestExam.passed ? '#34d399' : '#f87171', fontFamily: 'var(--font-mono)' }}>
                              {rank.latestExam.score.toFixed(1)} / 10.0
                            </strong>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Não realizada</span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {rank.isQualified || rank.passedExam ? (
                            <span style={{ fontSize: '0.675rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1.5px solid #10b981', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              🏆 Agente Qualificado
                            </span>
                          ) : rank.latestExam ? (
                            <span style={{ fontSize: '0.675rem', color: '#f87171', fontWeight: 700 }}>
                              Reprovado (Retrocedido a 50%)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>Em capacitação</span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {rank.passedExam && rank.latestExam ? (
                            <button
                              type="button"
                              onClick={() => handleToggleReward(rank.agentId, rank.latestExam!.id, rank.rewardClaimed)}
                              className="btn btn-sm"
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '0.3rem 0.65rem',
                                borderRadius: '6px',
                                backgroundColor: rank.rewardClaimed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                border: `1px solid ${rank.rewardClaimed ? '#10b981' : '#fbbf24'}`,
                                color: rank.rewardClaimed ? '#34d399' : '#fbbf24',
                                cursor: 'pointer',
                              }}
                            >
                              {rank.rewardClaimed ? '✓ Recompensa Entregue' : 'Marcar como Entregue'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Filtros de Categoria (Paleta Violeta da Academia) */}
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedCategory === cat ? '1.5px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                  fontWeight: selectedCategory === cat ? 800 : 600,
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedCategory === cat ? '0 0 12px rgba(168, 85, 247, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de Cards de Artigos */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredArticles.map((article) => {
              const isRead = readArticleIds.includes(article.id);
              const isValidated = validatedArticleIds.includes(article.id);
              const isCompleted = isRead || isValidated;

              return (
                <div
                  key={article.id}
                  style={{
                    backgroundColor: isValidated
                      ? '#06281e'
                      : isRead
                      ? '#05231c'
                      : '#0f172a',
                    background: isValidated
                      ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.5) 0%, rgba(6, 40, 30, 0.95) 50%, #090e1a 100%)'
                      : isRead
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 35, 28, 0.85) 60%, #090e1a 100%)'
                      : 'linear-gradient(135deg, #0f172a 0%, #0b1120 100%)',
                    border: isValidated
                      ? '1.5px solid #10b981'
                      : isRead
                      ? '1.5px solid rgba(16, 185, 129, 0.65)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isValidated
                      ? '0 10px 25px -5px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.1)'
                      : isRead
                      ? '0 8px 20px -4px rgba(16, 185, 129, 0.22), inset 0 0 15px rgba(16, 185, 129, 0.06)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.75rem' }}>{article.icon}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {article.badge && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.15)',
                              border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(168, 85, 247, 0.3)'}`,
                              color: isCompleted ? '#34d399' : '#c084fc',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '6px',
                            }}
                          >
                            {article.badge}
                          </span>
                        )}
                        {isValidated ? (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 900,
                              backgroundColor: 'rgba(16, 185, 129, 0.25)',
                              border: '1px solid #10b981',
                              color: '#34d399',
                              padding: '0.12rem 0.5rem',
                              borderRadius: '999px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            ✓ Validado
                          </span>
                        ) : isRead ? (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 900,
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid #10b981',
                              color: '#34d399',
                              padding: '0.12rem 0.5rem',
                              borderRadius: '999px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            ✓ Lido
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem', fontFamily: 'var(--font-heading)' }}>
                      {article.title}
                    </h4>

                    <p style={{ fontSize: '0.8125rem', color: isCompleted ? '#cbd5e1' : '#94a3b8', lineHeight: 1.45, marginBottom: '1rem' }}>
                      {article.summary}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: isCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.725rem', color: isCompleted ? '#34d399' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: isCompleted ? 700 : 500 }}>
                      <Clock size={12} color={isCompleted ? '#34d399' : '#94a3b8'} /> {article.readTimeMinutes} min
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenArticle(article)}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.18)',
                        border: isCompleted ? '1.5px solid #10b981' : '1.5px solid #a855f7',
                        color: isCompleted ? '#34d399' : '#c084fc',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        boxShadow: isCompleted ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none',
                      }}
                    >
                      <span>{isCompleted ? 'Reler Artigo' : 'Ler Artigo (+10 XP)'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ABA 2: FERRAMENTAS INTERATIVAS (SEGUNDA OPÇÃO)                     */}
      {/* ================================================================= */}
      {activeMainTab === 'tools' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {LEAN_TOOLS.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <div
                key={tool.id}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: tool.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={24} color={tool.iconColor} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        backgroundColor: `${tool.badgeColor}20`,
                        color: tool.badgeColor,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        border: `1px solid ${tool.badgeColor}40`,
                      }}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    {tool.title}
                  </h3>

                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {tool.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {tool.highlights.map((h, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.6875rem',
                          backgroundColor: '#090e1a',
                          color: '#cbd5e1',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={tool.href}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    padding: '0.625rem 1rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    textDecoration: 'none',
                    backgroundColor: '#06b6d4',
                    border: '1px solid #22d3ee',
                  }}
                >
                  <span>Abrir Ferramenta</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <LeanArticleModal
        article={selectedArticle}
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        isRead={selectedArticle ? readArticleIds.includes(selectedArticle.id) : false}
        isValidatedRead={selectedArticle ? validatedArticleIds.includes(selectedArticle.id) : false}
        onMarkAsRead={handleMarkAsRead}
      />

      <LeanExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        agentId={currentAgentId}
        agentName={currentUser?.name || 'Agente Lean'}
        onExamCompleted={handleExamCompleted}
        onNavigateToArticles={() => setActiveMainTab('articles')}
      />

      {isAdmin && (
        <CreateArticleSenseiModal
          isOpen={isCreateArticleOpen}
          onClose={() => setIsCreateArticleOpen(false)}
          onSuccess={(newArticle) => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
