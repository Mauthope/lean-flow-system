'use client';

import React from 'react';
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
} from 'lucide-react';

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
    id: 'calc-roi',
    href: '/agente/ferramentas/calculadora-roi',
    title: 'Calculadora de Horas & Custo Evitado',
    badge: 'Essencial',
    badgeColor: '#059669',
    description:
      'Calcule em segundos as horas economizadas no mês/ano e o Custo Evitado Real (R$) a partir do tempo de ciclo antes e depois da melhoria.',
    icon: Calculator,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    highlights: ['Horas/Mês & Horas/Ano', 'Custo Evitado (R$)', 'Fácil cópia para o Kanban'],
  },
  {
    id: '5-whys',
    href: '/agente/ferramentas/5-porques',
    title: 'Investigação dos 5 Porquês (Causa Raiz)',
    badge: 'Diagnóstico',
    badgeColor: '#2563eb',
    description:
      'Descubra a causa raiz fundamental de defeitos e paradas de máquina para criar contramedidas eficazes e definitivas.',
    icon: HelpCircle,
    iconColor: '#7c3aed',
    iconBg: '#f5f3ff',
    highlights: ['5 Níveis de Causalidade', 'Contramedida & SOP', 'Exportação de texto'],
  },
  {
    id: 'matriz-gut',
    href: '/agente/ferramentas/matriz-gut',
    title: 'Matriz GUT de Priorização',
    badge: 'Decisão',
    badgeColor: '#d97706',
    description:
      'Avalie Gravidade, Urgência e Tendência (G × U × T) para saber com precisão científica qual problema deve ser atacado primeiro.',
    icon: Target,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    highlights: ['Score de 1 a 125', 'Classificação de Risco', 'Critérios objetivos'],
  },
  {
    id: '8-desperdicios',
    href: '/agente/ferramentas/8-desperdicios',
    title: 'Guia dos 8 Desperdícios Lean (Muda)',
    badge: 'Consulta',
    badgeColor: '#4b5563',
    description:
      'Dicionário prático com exemplos reais de chão de fábrica para identificar Superprodução, Espera, Transporte, Estoque e Defeitos.',
    icon: Lightbulb,
    iconColor: '#eab308',
    iconBg: '#fefce8',
    highlights: ['8 Desperdícios (Muda)', 'Exemplos Operacionais', 'Dicas de Eliminação'],
  },
  {
    id: 'gerador-sop',
    href: '/agente/ferramentas/gerador-sop',
    title: 'Gerador de Procedimento Padrão (SOP)',
    badge: 'Padronização',
    badgeColor: '#0891b2',
    description:
      'Crie rapidamente a Folha de Instrução de Trabalho e Lição Ponto a Ponto (LPP) para garantir que a melhoria não se perca.',
    icon: FileCheck,
    iconColor: '#0891b2',
    iconBg: '#ecfeff',
    highlights: ['Passo a Passo Padrão', 'Pontos Críticos de Segurança', 'Imprimível / PDF'],
  },
  {
    id: 'auditoria-5s',
    href: '/agente/ferramentas/auditoria-5s',
    title: 'Checklist Rápido de Auditoria 5S',
    badge: 'Auditoria',
    badgeColor: '#10b981',
    description:
      'Avalie a conformidade dos 5 Sensos (Utilização, Organização, Limpeza, Padronização e Disciplina) diretamente no posto de trabalho.',
    icon: CheckSquare,
    iconColor: '#10b981',
    iconBg: '#f0fdf4',
    highlights: ['5 Sensos do Kaizen', 'Cálculo de Conformidade %', 'Plano de Ação Imediato'],
  },
];

export default function LeanToolsIndexPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1329 0%, #1e3a8a 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(11, 19, 41, 0.3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                color: '#93c5fd',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Sparkles size={12} /> HUB DE MÉTODOS LEAN
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Ferramentas Operacionais Lean
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', maxWidth: '620px', marginTop: '0.25rem' }}>
            Selecione uma ferramenta abaixo. Cada ferramenta abre em uma tela dedicada, 100% adaptada para uso
            no celular, tablet ou computador no chão de fábrica.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '0.625rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <Smartphone size={20} color="#93c5fd" />
          <span style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 600 }}>
            Telas Otimizadas para Celular
          </span>
        </div>
      </div>

      {/* Grid of Tool Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {LEAN_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderRadius: '16px',
                transition: 'all 0.2s ease',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                {/* Card Top: Icon & Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                  }}
                >
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
                    <Icon size={24} color={tool.iconColor} />
                  </div>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      backgroundColor: `${tool.badgeColor}15`,
                      color: tool.badgeColor,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      border: `1px solid ${tool.badgeColor}30`,
                      textTransform: 'uppercase',
                    }}
                  >
                    {tool.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3,
                  }}
                >
                  {tool.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {tool.description}
                </p>

                {/* Key Features Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {tool.highlights.map((h, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button to Open Dedicated Page */}
              <Link
                href={tool.href}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.9375rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                <span>Abrir Ferramenta</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
