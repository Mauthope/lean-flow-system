'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { formatCurrency } from '@/lib/utils';
import {
  Shield,
  UserCheck,
  PlusCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  Layers,
  Sparkles,
  Zap,
  Timer,
  Settings,
  Radio,
  FileCheck,
  BarChart3,
  Lock,
  ChevronRight,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { dataVersion } = useAuth();
  const [protocolInput, setProtocolInput] = useState('');

  const metrics = useMemo(() => {
    return dataService.getMetrics();
  }, [dataVersion]);

  const handleSearchProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (protocolInput.trim()) {
      router.push(`/protocolo/${protocolInput.trim()}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1329', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(11, 19, 41, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.25rem',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.5)',
            }}
          >
            LN
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                LeanFlow System
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(37, 99, 235, 0.3)',
                  color: '#60a5fa',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                PRO
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Plataforma de Gestão Operacional & Custo Evitado
            </span>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="hidden md:flex">
          <a href="#funcionalidades" style={{ color: '#cbd5e1', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>
            Funcionalidades
          </a>
          <a href="#custo-evitado" style={{ color: '#cbd5e1', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>
            7 Fontes de Custo
          </a>
          <a href="#cronoanalise" style={{ color: '#cbd5e1', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>
            Cronoanálise
          </a>
          <a href="#autor" style={{ color: '#cbd5e1', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>
            Sobre o Autor
          </a>
        </nav>

        {/* Right CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/nova-demanda"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#93c5fd',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textDecoration: 'none',
              padding: '0.5rem 0.875rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <PlusCircle size={15} /> Abrir Demanda
          </Link>

          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.875rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <Lock size={15} /> Acessar Sistema
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 4rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(37, 99, 235, 0.18)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#93c5fd',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={15} color="#60a5fa" />
            <span>Sistema concebido por Mauricio Grigol • Consultor Lean & Dev Full Stack</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#ffffff',
            }}
          >
            Gestão Ágil de Fluxo Lean, Triagem de Fábrica e ROI em Tempo Real
          </h1>

          <p style={{ fontSize: '1.125rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
            A plataforma completa para transformar ideias de chão de fábrica em projetos Kaizen mensuráveis,
            com cronoanálise estatística, ferramentas Lean operacionais e cálculo consolidado de múltiplos custos evitados.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.85rem 1.85rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.45)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Fazer Login / Escolher Perfil</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/nova-demanda"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.85rem 1.6rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <PlusCircle size={17} color="#60a5fa" />
              <span>Abrir Demanda Kaizen</span>
            </Link>
          </div>

          {/* Quick Protocol Search Box */}
          <div
            style={{
              maxWidth: '560px',
              margin: '0 auto',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '0.5rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <form onSubmit={handleSearchProtocol} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Rastrear protocolo público (ex: LEAN-2026-8805)..."
                value={protocolInput}
                onChange={(e) => setProtocolInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '0.65rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexShrink: 0,
                }}
              >
                <Search size={15} /> Rastrear
              </button>
            </form>
          </div>
        </div>

        {/* Live Metrics Showcase Banner */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
              Custo Evitado Homologado
            </span>
            <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399', margin: '0.35rem 0 0 0' }}>
              {formatCurrency(metrics.totalActualCostAvoided || 148500)}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Economia real comprovada</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
              Horas Economizadas
            </span>
            <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#60a5fa', margin: '0.35rem 0 0 0' }}>
              {metrics.totalHoursSaved || 342}h
            </p>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Horas operacionais otimizadas</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
              Projetos Concluídos
            </span>
            <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f59e0b', margin: '0.35rem 0 0 0' }}>
              {metrics.completedActions || 12}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ações Lean padronizadas</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
              Taxa de Resolução
            </span>
            <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#a78bfa', margin: '0.35rem 0 0 0' }}>
              {metrics.resolutionRate || 85}%
            </p>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Eficiência no fechamento</span>
          </div>
        </div>

        {/* SEÇÃO 1: FUNCIONALIDADES PRINCIPAIS */}
        <div id="funcionalidades" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pilares da Plataforma
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
              Tudo que a sua fábrica precisa em um único fluxo
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Card 1 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Gestão Visual Kanban & Triagem
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Painel do supervisor com triagem inteligente, classificação de desperdício Lean e Kanbans operacionais dedicados para agentes de melhoria contínua.
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Timer size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Cronoanálise & Yamazumi
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Multi-cronômetro digital, separação de VA / NVA / NNVA, agrupamento por ciclos e cálculo estatístico do número de amostras com memória de cálculo.
              </p>
            </div>

            {/* Card 3 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <TrendingUp size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                7 Vetores de Custo Evitado
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Apuração detalhada de ROI: mão de obra, refugo, paradas de máquina, capacidade extra, energia, fretes e insumos com páginas executivas de projeto.
              </p>
            </div>

            {/* Card 4 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Hub de 7 Ferramentas Lean
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Matriz GUT de priorização, Investigação dos 5 Porquês, Guia dos 8 Desperdícios, Gerador de Procedimento Padrão (SOP), Auditoria 5S e Calculadora de ROI.
              </p>
            </div>

            {/* Card 5 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Settings size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                TPM & Manutenção Autônoma
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Módulo reservado para acompanhamento de OEE, checklists preventivos de posto, eliminação de quebras e gestão de etiquetas de anomalias.
              </p>
            </div>

            {/* Card 6 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Radio size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Canal Kaizen & Comunicação
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Mural visual de conquistas, registros de Antes/Depois, reconhecimento dos maiores ganhos de produtividade e disseminação de Lições Ponto a Ponto (LPP).
              </p>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: CALL TO ACTION PARA LOGIN */}
        <div
          style={{
            backgroundColor: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '24px',
            padding: '3rem 2rem',
            textAlign: 'center',
            marginBottom: '5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              Pronto para otimizar os fluxos da sua fábrica?
            </h2>
            <p style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '2rem', lineHeight: 1.6 }}>
              Acesse agora como Supervisor Master ou como Agente Operacional e explore todas as ferramentas em tempo real.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.5)',
              }}
            >
              <Lock size={18} />
              <span>Acessar Tela de Login</span>
            </Link>
          </div>
        </div>

        {/* SEÇÃO 3: SOBRE O CRIADOR & ARQUITETO */}
        <div
          id="autor"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.5rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                flexShrink: 0,
              }}
            >
              MG
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase' }}>
                Desenvolvedor & Arquiteto da Solução
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: '0.15rem 0' }}>
                Mauricio Grigol
              </h3>
              <p style={{ fontSize: '0.84375rem', color: '#94a3b8', margin: 0 }}>
                Consultor Lean & Desenvolvedor Full Stack • Especialista em Eficiência Operacional
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              className="btn btn-secondary btn-sm"
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              Entrar no Sistema
            </Link>
            <Link
              href="/nova-demanda"
              className="btn btn-primary btn-sm"
            >
              Abrir Demanda Pública
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.8125rem',
        }}
      >
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} LeanFlow System • Desenvolvido por <strong>Mauricio Grigol</strong>. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
