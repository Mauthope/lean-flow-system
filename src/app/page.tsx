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
  Building2,
  ExternalLink,
  Play,
  Flame,
  Clock,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [activeFeatureTab, setActiveFeatureTab] = useState<'crono' | 'roi' | 'kanban' | 'hub'>('crono');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Dynamic Liquid Glass Background Lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(6, 182, 212, 0.18) 40%, rgba(147, 51, 234, 0.08) 70%, transparent 85%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          right: '-10%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(59, 130, 246, 0.12) 50%, transparent 75%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '65%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 75%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Futuristic Grid Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 0,
          maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
        }}
      />

      {/* Top Navbar with Liquid Glass Effect */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(2, 6, 23, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.25rem',
                color: '#ffffff',
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              LF
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: '1.35rem',
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  LeanFlow
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    backgroundColor: 'rgba(6, 182, 212, 0.2)',
                    border: '1px solid rgba(6, 182, 212, 0.5)',
                    color: '#38bdf8',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.06em',
                    boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  4.0 PRO
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', letterSpacing: '0.02em' }}>
                Operational Excellence & Multi-Entity Lean Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="hidden md:flex">
            <a href="#solucoes" style={{ color: '#e2e8f0', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}>
              Soluções
            </a>
            <a href="#cronoanalise" style={{ color: '#e2e8f0', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}>
              Cronoanálise
            </a>
            <a href="#custo-evitado" style={{ color: '#e2e8f0', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}>
              Motor de ROI
            </a>
            <a href="#arquiteto" style={{ color: '#e2e8f0', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}>
              Autor & Arquiteto
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.35rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 0 25px rgba(37, 99, 235, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
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
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1360px', margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        
        {/* ==================== HERO SECTION (LIQUID GLASS) ==================== */}
        <section style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto 5.5rem' }}>
          
          {/* Liquid Glass Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              fontSize: '0.84375rem',
              fontWeight: 800,
              marginBottom: '2rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 10px #38bdf8',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#ffffff' }}>Engenharia Lean & Arquitetura por</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}
            >
              Mauricio Grigol
            </span>
          </div>

          {/* MAIN HERO TITLE - HIGH CONTRAST & LIQUID SHINE */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.8vw, 4.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.12,
              marginBottom: '1.75rem',
              color: '#ffffff',
              textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
            }}
          >
            <span style={{ color: '#ffffff', display: 'inline-block' }}>
              A Inteligência Operacional que Transforma
            </span>{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 40%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 35px rgba(56, 189, 248, 0.4))',
                display: 'inline-block',
              }}
            >
              Chão de Fábrica
            </span>{' '}
            <span style={{ color: '#ffffff', display: 'inline-block' }}>
              em Lucro e Eficiência
            </span>
          </h1>

          {/* Subtitle with High Contrast */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#cbd5e1',
              lineHeight: 1.7,
              maxWidth: '840px',
              margin: '0 auto 2.75rem',
              textShadow: '0 2px 15px rgba(0, 0, 0, 0.7)',
              fontWeight: 500,
            }}
          >
            Plataforma 4.0 desenvolvida para padronizar postos de trabalho, executar cronoanálises com validação estatística \(N&apos;\), priorizar planos de ação Kaizen e mensurar múltiplos custos evitados em tempo real com links exclusivos para cada entidade fabril.
          </p>

          {/* Hero Action Buttons (Liquid Glow) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              marginBottom: '3rem',
            }}
          >
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                color: '#ffffff',
                padding: '1rem 2.4rem',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 12px 35px rgba(37, 99, 235, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Entrar na Plataforma</span>
              <ArrowRight size={19} />
            </Link>

            <a
              href="#solucoes"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#ffffff',
                padding: '1rem 2rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <Zap size={18} color="#38bdf8" />
              <span>Conhecer Soluções & Módulos</span>
            </a>
          </div>

          {/* Multi-Tenant Information Pill */}
          <div
            style={{
              maxWidth: '720px',
              margin: '0 auto 4rem',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              padding: '1rem 1.5rem',
              borderRadius: '18px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Building2 size={20} color="#38bdf8" />
            </div>
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block' }}>
                Links Únicos & Isolamento por Entidade Fabril
              </strong>
              <span style={{ fontSize: '0.78125rem', color: '#cbd5e1', lineHeight: 1.4, display: 'block' }}>
                Cada fábrica cadastrada pelo Master possui seu link exclusivo (ex: <code style={{ color: '#38bdf8' }}>/d/[slug]</code>) e QR Code para operadores enviarem demandas direto para sua triagem interna.
              </span>
            </div>
          </div>

          {/* ==================== LIQUID GLASS INTERACTIVE DASHBOARD MOCKUP ==================== */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '2rem',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Gloss Highlights on Mockup */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                right: '20%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent)',
              }}
            />

            {/* Mockup Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                  SISTEMA LEAN FLOW OPERANDO EM TEMPO REAL
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', opacity: 0.8 }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', opacity: 0.8 }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', opacity: 0.8 }} />
              </div>
            </div>

            {/* Mockup Grid Data Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* Box 1: Cronoanálise Live */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '18px',
                  padding: '1.25rem',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    ⏱️ Cronoanálise & Eficiência
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Ciclo #4</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
                  78.4% <span style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 700 }}>VA (Valor Agregado)</span>
                </div>
                {/* Liquid Progress Bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: '78.4%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                  <div style={{ width: '12.1%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: '9.5%', backgroundColor: '#ef4444' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  <span style={{ color: '#34d399' }}>🟢 VA: 78.4%</span>
                  <span style={{ color: '#fbbf24' }}>🟡 NNVA: 12.1%</span>
                  <span style={{ color: '#f87171' }}>🔴 NVA: 9.5%</span>
                </div>
              </div>

              {/* Box 2: Custo Evitado */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  borderRadius: '18px',
                  padding: '1.25rem',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                    💰 Custo Evitado Homologado
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 800 }}>+24% vs Meta</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399', marginBottom: '0.25rem' }}>
                  R$ 148.500,00
                </div>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>
                  Economia consolidada em 7 vetores com 342h operacionais reaproveitadas.
                </p>
              </div>

              {/* Box 3: Kanban & Fluxo */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: '18px',
                  padding: '1.25rem',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>
                    📊 Fluxo de Demandas Kaizen
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>100% Digital</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.25rem' }}>
                  85% Concluídas
                </div>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>
                  Triagem ágil de sugestões com planos de ação 5W2H e padronização SOP.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== STATS METRICS (LIQUID PILL GRID) ==================== */}
        <section
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            marginBottom: '6.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Ganho em Postos
            </span>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0', textShadow: '0 2px 15px rgba(56, 189, 248, 0.5)' }}>
              +35%
            </div>
            <p style={{ fontSize: '0.84375rem', color: '#cbd5e1', margin: 0 }}>Produtividade & Vazão de Peças</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Eliminação de Paradas
            </span>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0', textShadow: '0 2px 15px rgba(52, 211, 153, 0.5)' }}>
              -40%
            </div>
            <p style={{ fontSize: '0.84375rem', color: '#cbd5e1', margin: 0 }}>Redução em Setup e Esperas</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Vetores Financeiros
            </span>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0', textShadow: '0 2px 15px rgba(245, 158, 11, 0.5)' }}>
              7 Fontes
            </div>
            <p style={{ fontSize: '0.84375rem', color: '#cbd5e1', margin: 0 }}>Mensuração Real de Custo Evitado</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Confiabilidade
            </span>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0', textShadow: '0 2px 15px rgba(192, 132, 252, 0.5)' }}>
              99%
            </div>
            <p style={{ fontSize: '0.84375rem', color: '#cbd5e1', margin: 0 }}>Validação Amostral Estatística \(N&apos;\)</p>
          </div>
        </section>

        {/* ==================== INTERACTIVE SOLUTIONS SHOWCASE ==================== */}
        <section id="solucoes" style={{ marginBottom: '6.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)',
              }}
            >
              Arquitetura Modular
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 900, color: '#ffffff', marginTop: '0.85rem', letterSpacing: '-0.025em' }}>
              O Ecossistema Completo de Melhoria Contínua
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', maxWidth: '680px', margin: '0.6rem auto 0' }}>
              Explore as ferramentas modulares que conectam operadores de posto, engenheiros e supervisores.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
            }}
          >
            {[
              { key: 'crono', label: '⏱️ Cronoanálise Yamazumi' },
              { key: 'roi', label: '💰 Motor de Custo Evitado' },
              { key: 'kanban', label: '📊 Kanban & Triagem' },
              { key: 'hub', label: '🛠️ Hub de Ferramentas Lean' },
            ].map((tab) => {
              const isSelected = activeFeatureTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFeatureTab(tab.key as any)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected ? '1px solid rgba(96, 165, 250, 0.7)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '14px',
                    padding: '0.85rem 1.5rem',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontWeight: 800,
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(16px)',
                    boxShadow: isSelected ? '0 0 25px rgba(37, 99, 235, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display (Liquid Glass Container) */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '28px',
              padding: '2.75rem',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
            }}
          >
            {activeFeatureTab === 'crono' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.8125rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Timer size={16} /> Estudo de Tempos Industrial
                  </div>
                  <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.85rem', lineHeight: 1.2 }}>
                    Cronoanálise Digital com Classificação VA / NVA / NNVA
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    Multi-cronômetro digital em tempo real que permite classificar tomadas de tempo em <strong>Valor Agregado (VA)</strong>, <strong>Desperdício (NVA)</strong> e <strong>Não Agrega Valor mas Necessário (NNVA)</strong>.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                      <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Amostragens por Ciclos Separados:</strong> Fechamento e cálculo de eficiência por ciclo de trabalho.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                      <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Motor Estatístico N&apos;:</strong> Fórmula de confiabilidade industrial [(z · s) / (e · x̄)]² com memória de cálculo passo a passo.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                      <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Exportação CSV para Excel:</strong> Planilhas prontas para balanceamento de linhas e auditorias industriais.</span>
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(3, 7, 18, 0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>DIAGNÓSTICO ESTATÍSTICO</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.25)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.15rem 0.6rem', borderRadius: '6px' }}>
                      95% CONFIABILIDADE
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Tempo Médio (x̄)</span>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>42.8s</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Eficiência VA (%)</span>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', margin: 0 }}>74.2%</p>
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: '12px', padding: '1rem', fontSize: '0.8125rem', color: '#e0f2fe' }}>
                    💡 <strong>Memória de Cálculo:</strong> N&apos; = [(1,960 × 3,42) / (0,05 × 42,8)]² = 9,81 → 10 tomadas necessárias.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'roi' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.8125rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <TrendingUp size={16} /> Retorno Financeiro Comprovado
                  </div>
                  <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.85rem', lineHeight: 1.2 }}>
                    Motor de Custo Evitado em 7 Fontes Financeiras
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    O sistema converte horas poupadas e perdas eliminadas em Reais (R$), permitindo emitir relatórios executivos formatados em A3 / PDF para diretoria.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8125rem' }}>
                      📈 Aumento de Produção
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8125rem' }}>
                      ♻️ Redução de Refugo
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8125rem' }}>
                      ⏱️ Horas & Mão de Obra
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8125rem' }}>
                      ⚙️ Paradas de Máquina (OEE)
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(3, 7, 18, 0.7)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                    Demonstrativo Executivo de Projeto
                  </span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '0.5rem 0' }}>
                    Eliminação de Gargalo na Linha de Usinagem
                  </h4>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399', margin: '0.5rem 0' }}>
                    R$ 48.250,00 <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>/ ano</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0 }}>
                    120h operacionais reaproveitadas e redução de 95% no tempo de espera do posto.
                  </p>
                </div>
              </div>
            )}

            {activeFeatureTab === 'kanban' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontSize: '0.8125rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Layers size={16} /> Triagem & Execução
                  </div>
                  <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.85rem', lineHeight: 1.2 }}>
                    Kanban 4.0 & Triagem por Fábrica
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    Controle de fluxo de trabalho de ponta a ponta: colaboradores registram sugestões no link exclusivo da sua entidade, supervisores realizam triagem com classificação de desperdício e agentes executam checklists com datas e status.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                      <CheckCircle2 size={18} color="#60a5fa" />
                      <span>Link exclusivo por fábrica para engajar os postos de trabalho</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#60a5fa' }}>
                      <CheckCircle2 size={18} color="#60a5fa" />
                      <span>Triagem com aprovação, recusa justificada ou encaminhamento</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#60a5fa' }}>
                      <CheckCircle2 size={18} color="#60a5fa" />
                      <span>Layout responsivo adaptado para tablets e smartphones de chão de fábrica</span>
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(3, 7, 18, 0.7)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#60a5fa' }}>ABERTAS</span>
                      <p style={{ fontSize: '0.8125rem', color: '#ffffff', margin: '0.35rem 0 0 0', fontWeight: 700 }}>Triagem Inicial</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fbbf24' }}>EM ANDAMENTO</span>
                      <p style={{ fontSize: '0.8125rem', color: '#ffffff', margin: '0.35rem 0 0 0', fontWeight: 700 }}>Ação Kaizen</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#34d399' }}>CONCLUÍDAS</span>
                      <p style={{ fontSize: '0.8125rem', color: '#ffffff', margin: '0.35rem 0 0 0', fontWeight: 700 }}>ROI Validado</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'hub' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎯</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0 0.25rem' }}>Matriz GUT</h4>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0 }}>Priorização sistemática com Gravidade × Urgência × Tendência (1 a 125).</p>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔍</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0 0.25rem' }}>5 Porquês & Ishikawa</h4>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0 }}>Investigação profunda de causa raiz para bloqueio de reincidências.</p>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '1.5rem' }}>📄</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0 0.25rem' }}>Gerador de SOP / LPP</h4>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0 }}>Criação de Procedimentos Operacionais Padrão com fotos e segurança.</p>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0 0.25rem' }}>TPM & Canal Kaizen</h4>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0 }}>Manutenção autônoma, controle OEE e mural de destaques da fábrica.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================== CALL TO ACTION BANNER (LIQUID GLASS) ==================== */}
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.35) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(15, 23, 42, 0.85) 100%)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '32px',
            padding: '4rem 2rem',
            textAlign: 'center',
            marginBottom: '6.5rem',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4.2vw, 3rem)', fontWeight: 900, color: '#ffffff', marginBottom: '1.25rem', letterSpacing: '-0.025em' }}>
              Experimente a Plataforma em Tempo Real
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#e0f2fe', marginBottom: '2.5rem', lineHeight: 1.65 }}>
              Acesse como Supervisor ou Agente Operacional e teste os cronômetros, os fluxos Kanban e a apuração de ROI.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                color: '#ffffff',
                padding: '1.05rem 2.75rem',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 12px 35px rgba(37, 99, 235, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <Lock size={19} />
              <span>Acessar Portal de Login</span>
            </Link>
          </div>
        </section>

        {/* ==================== LEAD ARCHITECT & CREATOR SPOTLIGHT ==================== */}
        <section
          id="arquiteto"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '28px',
            padding: '2.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.75rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.6rem',
                boxShadow: '0 0 30px rgba(37, 99, 235, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                flexShrink: 0,
              }}
            >
              MG
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Desenvolvedor & Arquiteto da Solução
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0' }}>
                Mauricio Grigol
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0 }}>
                Consultor Lean Manufacturing & Desenvolvedor Full Stack • Especialista em Indústria 4.0
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)',
              }}
            >
              Acessar Plataforma
            </Link>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.84375rem',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            © {new Date().getFullYear()} <strong>LeanFlow System 4.0</strong> • Concebido e arquitetado por <strong>Mauricio Grigol</strong>.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 600 }}>Login & Entidades</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
