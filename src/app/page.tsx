'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { allUsers, loginAs, currentTenant } = useAuth();
  const [protocolInput, setProtocolInput] = useState('');

  const adminUsers = allUsers.filter((u) => u.role === 'admin');
  const agentUsers = allUsers.filter((u) => u.role === 'agent');

  const handleAdminEnter = () => {
    if (adminUsers[0]) {
      loginAs(adminUsers[0].id);
      router.push('/admin/dashboard');
    }
  };

  const handleAgentEnter = (agentId: string) => {
    loginAs(agentId);
    router.push('/agente/kanban');
  };

  const handleSearchProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (protocolInput.trim()) {
      router.push(`/protocolo/${protocolInput.trim()}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1329', color: '#ffffff' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.25rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
          >
            LN
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              LeanFlow System
            </span>
            <span
              style={{
                marginLeft: '0.5rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: 'rgba(37, 99, 235, 0.3)',
                color: '#60a5fa',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
              }}
            >
              MULTI-TENANT
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93c5fd',
              fontSize: '0.78125rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} color="#60a5fa" />
            <span>Criado por Mauricio Grigol</span>
          </div>

          <Link
            href="/nova-demanda"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#93c5fd',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
            }}
          >
            <PlusCircle size={16} /> Abrir Demanda Pública
          </Link>

          <button
            onClick={handleAdminEnter}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Shield size={16} /> Entrar como Supervisor
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 4rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              color: '#93c5fd',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
            }}
          >
            <Zap size={14} color="#60a5fa" />
            Controle Operacional Lean & Mensuração de Custo Evitado
          </div>

          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#ffffff',
            }}
          >
            Gestão Ágil de Fluxo Lean, Triagem de Demandas e ROI em Tempo Real
          </h1>

          <p style={{ fontSize: '1.125rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
            Plataforma multi-tenant com visão 360° para o supervisor, kanbans dedicados para agentes
            operacionais, triagem de sugestões públicas da fábrica e cálculo de economia gerada.
          </p>

          {/* Quick Protocol Search */}
          <form
            onSubmit={handleSearchProtocol}
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '0.4rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <input
              type="text"
              placeholder="Consultar protocolo público (ex: LEAN-2026-8801)..."
              value={protocolInput}
              onChange={(e) => setProtocolInput(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '0.625rem 1rem',
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
                borderRadius: '8px',
                padding: '0.625rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Search size={15} /> Rastrear
            </button>
          </form>
        </div>

        {/* Access Gateway Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.75rem' }}>
          {/* Supervisor / Admin Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
              }}
            />

            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Shield size={24} color="#60a5fa" />
              </div>

              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: '#60a5fa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Acesso de Gestão
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
                Supervisor / Admin
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginTop: '0.5rem' }}>
                Visão 360° com KPIs de custo evitado, métricas de eficiência por agente, triagem de
                demandas públicas, e gestão cadastral de setores e operadores.
              </p>

              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={15} color="#34d399" /> Dashboard Executivo de Custo Evitado (R$)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={15} color="#34d399" /> Central de Triagem com Aprovação/Recusa
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#34d399' }}>
                  <CheckCircle2 size={15} color="#34d399" /> Cadastro e Exclusão de Agentes e Setores
                </div>
              </div>
            </div>

            <button
              onClick={handleAdminEnter}
              style={{
                marginTop: '1.75rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.875rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.15s ease',
              }}
            >
              Acessar Painel do Supervisor <ArrowRight size={18} />
            </button>
          </div>

          {/* Operational Agents Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <UserCheck size={24} color="#34d399" />
              </div>

              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: '#34d399',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Acesso Operacional Restrito
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
                Agentes Lean
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginTop: '0.5rem' }}>
                Visualização focada e restrita apenas às tarefas atribuídas a cada agente, sem acesso às
                telas e métricas privadas dos outros colaboradores.
              </p>

              {/* Quick Select Agent */}
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Entrar como agente de teste:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {agentUsers.slice(0, 4).map((ag) => (
                    <button
                      key={ag.id}
                      onClick={() => handleAgentEnter(ag.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f8fafc',
                        fontSize: '0.78125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                    >
                      <img
                        src={ag.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={ag.name}
                        style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ag.name.split(' ')[0]} ({ag.sectorName?.split(' ')[0] || 'Agente'})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAgentEnter(agentUsers[0]?.id || '')}
              style={{
                marginTop: '1.75rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.875rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              Acessar Meu Kanban <ArrowRight size={18} />
            </button>
          </div>

          {/* Public Portal Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <PlusCircle size={24} color="#fbbf24" />
              </div>

              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Acesso Externo / Público
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
                Formulário da Internet
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginTop: '0.5rem' }}>
                Link aberto para qualquer colaborador, operador de fábrica ou fornecedor registrar
                oportunidades de melhoria ou apontar desperdícios Lean.
              </p>

              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={15} color="#fbbf24" /> Sem necessidade de senha ou login
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={15} color="#fbbf24" /> Geração de protocolo único de rastreio
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={15} color="#fbbf24" /> Notificação direta para a triagem do supervisor
                </div>
              </div>
            </div>

            <Link
              href="/nova-demanda"
              style={{
                marginTop: '1.75rem',
                backgroundColor: '#f59e0b',
                color: '#000000',
                borderRadius: '10px',
                padding: '0.875rem 1.25rem',
                fontWeight: 800,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              Abrir Formulário de Demanda <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      {/* Authorship Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2.5rem 1.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          marginTop: '3rem',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              MG
            </div>
            <div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff' }}>
                Sistema Desenvolvido por Mauricio Grigol
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>
                Consultor Lean & Desenvolvedor Full Stack
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              © 2026 LeanFlow Platform • Autoria Registrada: Mauricio Grigol
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
