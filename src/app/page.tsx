'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  UserCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Timer,
  Settings,
  Radio,
  FileCheck,
  BarChart3,
  Lock,
  Layers,
  ChevronRight,
  CheckCircle2,
  Sliders,
  Calculator,
  Search,
  Activity,
  Cpu,
  Eye,
  Workflow,
  Target,
  Award,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [activeFeatureTab, setActiveFeatureTab] = useState<'crono' | 'roi' | 'kanban' | 'hub'>('crono');
  const [searchProtocol, setSearchProtocol] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchProtocol.trim()) {
      router.push(`/protocolo/${searchProtocol.trim()}`);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(147, 51, 234, 0.08) 50%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '-5%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.06) 50%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />

      {/* Top Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(3, 7, 18, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)',
              }}
            >
              LF
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: '1.25rem',
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(to right, #ffffff, #93c5fd)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  LeanFlow
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    color: '#60a5fa',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.05em',
                  }}
                >
                  4.0
                </span>
              </div>
              <span style={{ fontSize: '0.675rem', color: '#64748b', display: 'block', letterSpacing: '0.02em' }}>
                Operational Excellence & Lean Platform
              </span>
            </div>
          </Link>

          {/* Nav Items (Desktop) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="hidden md:flex">
            <a href="#solucoes" style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}>
              Soluções
            </a>
            <a href="#cronoanalise" style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}>
              Cronoanálise Yamazumi
            </a>
            <a href="#custo-evitado" style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}>
              Motor de ROI
            </a>
            <a href="#arquiteto" style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}>
              Arquitetura & Autor
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              href="/nova-demanda"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#cbd5e1',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Demanda Kaizen</span>
              <ExternalLink size={13} color="#94a3b8" />
            </Link>

            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <Lock size={14} />
              <span>Acessar Plataforma</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1360px', margin: '0 auto', padding: '3.5rem 1.5rem 6rem' }}>
        {/* HERO SECTION */}
        <section style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto 5.5rem' }}>
          {/* Glass Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1.15rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 25px rgba(37, 99, 235, 0.15)',
              color: '#93c5fd',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.75rem',
            }}
          >
            <Sparkles size={15} color="#38bdf8" />
            <span>Engenharia Lean & Arquitetura por Mauricio Grigol</span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            A Inteligência Operacional que Transforma{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Chão de Fábrica
            </span>{' '}
            em Lucro e Eficiência
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#94a3b8',
              lineHeight: 1.65,
              maxWidth: '800px',
              margin: '0 auto 2.5rem',
            }}
          >
            Uma plataforma de alta tecnologia desenvolvida para padronizar fluxos, executar cronoanálises estatísticas com validação amostral, priorizar planos de ação e mensurar múltiplos custos evitados em tempo real.
          </p>

          {/* Hero Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3rem',
            }}
          >
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                color: '#ffffff',
                padding: '0.9rem 2.2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(37, 99, 235, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <span>Entrar no Sistema</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/nova-demanda"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f1f5f9',
                padding: '0.9rem 1.8rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Zap size={17} color="#38bdf8" />
              <span>Registrar Demanda Kaizen</span>
            </Link>
          </div>

          {/* Fast Protocol Search Glass Bar */}
          <div
            style={{
              maxWidth: '560px',
              margin: '0 auto',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              padding: '0.45rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
            }}
          >
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Rastrear protocolo público (ex: LEAN-2026-8805)..."
                value={searchProtocol}
                onChange={(e) => setSearchProtocol(e.target.value)}
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
                  fontSize: '0.84375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                }}
              >
                <Search size={15} /> Rastrear
              </button>
            </form>
          </div>
        </section>

        {/* FUTURISTIC GLASS STATS TICKER */}
        <section
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '2.25rem 2rem',
            marginBottom: '6rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Impacto nos Postos
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0' }}>
              +35%
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>Ganhos Médios de Produtividade Operacional</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Redução de Paradas
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0' }}>
              -40%
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>Eliminação de Esperas e Setup Excessivo</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Motor Multi-Vetorial
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0' }}>
              7 Fontes
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>Apuração Consolidada de Custo Evitado</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Confiabilidade Estatística
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0' }}>
              99%
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>Cálculo Amostral Rigoroso de Tempo Padrão</p>
          </div>
        </section>

        {/* INTERACTIVE GLASS SHOWCASE: AS 4 MACRO SOLUÇÕES */}
        <section id="solucoes" style={{ marginBottom: '6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              Arquitetura de Módulos Lean
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#ffffff', marginTop: '0.75rem', letterSpacing: '-0.02em' }}>
              A Solução Definitiva para Excelência de Processos
            </h2>
            <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '650px', margin: '0.5rem auto 0' }}>
              Explore as ferramentas modulares que compõem o ecossistema LeanFlow.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '2rem',
            }}
          >
            {[
              { key: 'crono', label: '⏱️ Cronoanálise Yamazumi', desc: 'Estudo de tempos & amostragem estatística' },
              { key: 'roi', label: '💰 Motor de Custo Evitado', desc: '7 fontes de ROI financeiro' },
              { key: 'kanban', label: '📊 Kanban & Triagem', desc: 'Gestão visual e despacho de demandas' },
              { key: 'hub', label: '🛠️ Hub de Ferramentas Lean', desc: 'GUT, 5 Porquês, SOP, 5S e TPM' },
            ].map((tab) => {
              const isSelected = activeFeatureTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFeatureTab(tab.key as any)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(96, 165, 250, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.75rem 1.25rem',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isSelected ? '0 0 20px rgba(37, 99, 235, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display (Glass Container) */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '2.5rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            {activeFeatureTab === 'crono' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.8125rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Timer size={16} /> Estudo de Tempos Industrial
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                    Cronoanálise Digital com Classificação VA / NVA / NNVA
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Multi-cronômetro digital em tempo real que permite classificar tomadas de tempo em <strong>Valor Agregado (VA)</strong>, <strong>Desperdício (NVA)</strong> e <strong>Não Agrega Valor mas Necessário (NNVA)</strong>.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Amostragens por Ciclos Separados:</strong> Fechamento e cálculo de eficiência por ciclo de trabalho.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Motor Estatístico N&apos;:</strong> Fórmula de confiabilidade industrial [(z · s) / (e · x̄)]² com memória de cálculo passo a passo.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Exportação CSV para Excel:</strong> Planilhas prontas para balanço de linhas e auditorias industriais.</span>
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(3, 7, 18, 0.6)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '18px',
                    padding: '1.75rem',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>DIAGNÓSTICO ESTATÍSTICO</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      95% CONFIABILIDADE
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.875rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tempo Médio (x̄)</span>
                      <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>42.8s</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.875rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Eficiência VA (%)</span>
                      <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34d399', margin: 0 }}>74.2%</p>
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '0.875rem', fontSize: '0.78125rem', color: '#bfdbfe' }}>
                    💡 <strong>Memória de Cálculo:</strong> N&apos; = [(1,960 × 3,42) / (0,05 × 42,8)]² = 9,81 → 10 tomadas necessárias.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'roi' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.8125rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <TrendingUp size={16} /> Retorno Financeiro Comprovado
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                    Motor de Custo Evitado em 7 Fontes Financeiras
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Vá além de métricas genéricas: o sistema calcula o impacto em Reais (R$) gerado por cada melhoria Kaizen, auditável para a diretoria.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ padding: '0.6rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78125rem' }}>
                      📈 Aumento de Produção
                    </div>
                    <div style={{ padding: '0.6rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78125rem' }}>
                      ♻️ Redução de Refugo
                    </div>
                    <div style={{ padding: '0.6rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78125rem' }}>
                      ⏱️ Horas & Mão de Obra
                    </div>
                    <div style={{ padding: '0.6rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78125rem' }}>
                      ⚙️ Paradas de Máquina (OEE)
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(3, 7, 18, 0.6)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '18px',
                    padding: '1.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                    Demonstrativo Executivo de Projeto
                  </span>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0' }}>
                    Eliminação de Gargalo na Linha de Montagem
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399', margin: '0.5rem 0' }}>
                    R$ 48.250,00 <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>/ ano</span>
                  </div>
                  <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: 0 }}>
                    120h operacionais reaproveitadas e redução de 95% no tempo de espera do posto.
                  </p>
                </div>
              </div>
            )}

            {activeFeatureTab === 'kanban' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontSize: '0.8125rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Layers size={16} /> Triagem & Execução
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                    Kanban 4.0 & Triagem de Demandas
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Controle de fluxo de trabalho completo: colaboradores registram sugestões, supervisores realizam triagem com classificação de desperdício e agentes executam checklists com datas e status.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                      <CheckCircle2 size={16} color="#60a5fa" />
                      <span>Formulário público sem login para engajar toda a fábrica</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#60a5fa' }}>
                      <CheckCircle2 size={16} color="#60a5fa" />
                      <span>Triagem com aprovação, recusa justificada ou encaminhamento</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#60a5fa' }}>
                      <CheckCircle2 size={16} color="#60a5fa" />
                      <span>Layout responsivo adaptado para tablets e smartphones de chão de fábrica</span>
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(3, 7, 18, 0.6)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    borderRadius: '18px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#60a5fa' }}>ABERTAS</span>
                      <p style={{ fontSize: '0.75rem', color: '#ffffff', margin: '0.25rem 0 0 0', fontWeight: 700 }}>Triagem Inicial</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fbbf24' }}>EM ANDAMENTO</span>
                      <p style={{ fontSize: '0.75rem', color: '#ffffff', margin: '0.25rem 0 0 0', fontWeight: 700 }}>Ação Kaizen</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399' }}>CONCLUÍDAS</span>
                      <p style={{ fontSize: '0.75rem', color: '#ffffff', margin: '0.25rem 0 0 0', fontWeight: 700 }}>ROI Validado</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'hub' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '1.25rem' }}>🎯</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0.4rem 0 0.2rem' }}>Matriz GUT</h4>
                  <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: 0 }}>Priorização com Gravidade × Urgência × Tendência (1 a 125).</p>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '1.25rem' }}>🔍</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0.4rem 0 0.2rem' }}>5 Porquês</h4>
                  <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: 0 }}>Análise encadeada de causa raiz na origem do problema.</p>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '1.25rem' }}>📄</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0.4rem 0 0.2rem' }}>Gerador de SOP</h4>
                  <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: 0 }}>Procedimentos Padrão (SOP/LPP) com pontos críticos de segurança.</p>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '1.25rem' }}>⚙️</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0.4rem 0 0.2rem' }}>TPM & Canal Kaizen</h4>
                  <p style={{ fontSize: '0.78125rem', color: '#94a3b8', margin: 0 }}>Manutenção autônoma, OEE e mural de conquistas da fábrica.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CALL TO ACTION BANNER (GLASS TECH) */}
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(15, 23, 42, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '28px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            marginBottom: '6rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: 900, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Experimente a Plataforma em Tempo Real
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', marginBottom: '2.25rem', lineHeight: 1.6 }}>
              Acesse como Supervisor ou Agente Operacional e teste os cronômetros, os fluxos Kanban e a apuração de ROI.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.95rem 2.5rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(37, 99, 235, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <Lock size={18} />
              <span>Acessar Portal de Login</span>
            </Link>
          </div>
        </section>

        {/* AUTHOR & LEAD ARCHITECT SPOTLIGHT */}
        <section
          id="arquiteto"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
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
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.5rem',
                boxShadow: '0 0 25px rgba(37, 99, 235, 0.4)',
                flexShrink: 0,
              }}
            >
              MG
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Desenvolvedor & Arquiteto da Solução
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '0.15rem 0' }}>
                Mauricio Grigol
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                Consultor Lean Manufacturing & Desenvolvedor Full Stack • Especialista em Indústria 4.0
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.84375rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Entrar na Plataforma
            </Link>
            <Link
              href="/nova-demanda"
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.84375rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Formulário Público
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(3, 7, 18, 0.9)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.8125rem',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            © {new Date().getFullYear()} <strong>LeanFlow System 4.0</strong> • Concebido e desenvolvido por <strong>Mauricio Grigol</strong>.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Login</Link>
            <Link href="/nova-demanda" style={{ color: '#94a3b8', textDecoration: 'none' }}>Demanda Pública</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
