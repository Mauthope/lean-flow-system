'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Shield,
  Users,
  Lock,
  ArrowLeft,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

  const [activeTab, setActiveTab] = useState<'master' | 'agents' | 'viewers'>('master');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const tenant = dataService.getCurrentTenant();
  const tenantUsers = dataService.getUsers(tenant.id);
  const masterUser = tenantUsers.find((u) => u.role === 'admin') || tenantUsers[0];
  const agentUsers = tenantUsers.filter((u) => u.role === 'agent');
  const viewerUsers = tenantUsers.filter((u) => u.role === 'viewer');

  // Escuta retorno de login via OAuth (Microsoft Entra ID / SSO) ou sessão ativa
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    const handleSessionUser = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profile && isMounted) {
          loginAs(profile.id);
          if (profile.role === 'admin' || profile.is_master) {
            router.push('/admin/dashboard');
          } else {
            router.push('/agente/kanban');
          }
        }
      } catch (err) {
        console.warn('[SSO Callback] Perfil corporativo sincronizando:', err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSessionUser(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        handleSessionUser(session.user.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loginAs, router]);

  const handleMicrosoftSso = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'azure',
          options: {
            scopes: 'email profile offline_access',
            redirectTo:
              typeof window !== 'undefined'
                ? `${window.location.origin}/login`
                : 'https://fluxo-lean-system.vercel.app/login',
          },
        });

        if (error) {
          setAuthError(
            `Integração Microsoft Entra ID: ${error.message}. (Aguardando ativação do provedor Azure no Supabase pela equipe de TI/Infraestrutura).`
          );
        }
      } else {
        setAuthError(
          'Integração Microsoft Entra ID (SSO Corporativo): Disponível em produção com Supabase conectado. Para navegar no modo atual, clique diretamente no perfil desejado abaixo.'
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Falha ao iniciar autenticação com Microsoft.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginMaster = () => {
    if (masterUser) {
      loginAs(masterUser.id);
    }
    router.push('/admin/dashboard');
  };

  const handleLoginAgent = (userId: string) => {
    loginAs(userId);
    router.push('/agente/kanban');
  };

  const handleLoginViewer = (userId: string) => {
    loginAs(userId);
    router.push('/admin/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '30%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '25%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Back Link */}
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          marginBottom: '1.25rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#94a3b8',
            fontSize: '0.84375rem',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={16} /> Voltar para a Landing Page
        </Link>
      </div>

      {/* Main Glass Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.4rem',
              margin: '0 auto 1rem',
              boxShadow: '0 0 25px rgba(37, 99, 235, 0.5)',
            }}
          >
            RF
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {tenant.name}
          </h1>
          <p style={{ fontSize: '0.84375rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Portal de Acesso • Sistema FluxoLean 4.0
          </p>
        </div>

        {/* FEEDBACK MESSAGES */}
        {authError && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              color: '#fca5a5',
              fontSize: '0.8125rem',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              color: '#6ee7b7',
              fontSize: '0.8125rem',
              lineHeight: 1.45,
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* ============================================================= */}
        {/* BOTÃO EM DESTAQUE: ACESSO CORPORATIVO MICROSOFT (SSO ENTRA ID) */}
        {/* ============================================================= */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            onClick={handleMicrosoftSso}
            style={{
              padding: '1rem 1.15rem',
              borderRadius: '16px',
              border: '1.5px solid rgba(59, 130, 246, 0.55)',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 25px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.22)';
              e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.85)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.55)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* Logotipo Oficial Microsoft em moldura branca nítida */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '2px' }}>
                  <strong style={{ fontSize: '0.9375rem', color: '#ffffff' }}>
                    Entrar com Conta Microsoft
                  </strong>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                      color: '#6ee7b7',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Recomendado TI
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                  SSO Oficial • Office 365 • @rafitec.com.br
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexShrink: 0,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <span>Acessar via SSO →</span>
              )}
            </span>
          </div>
        </div>

        {/* DIVISOR FLUXOLEAN */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.35rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <span
            style={{
              fontSize: '0.6875rem',
              color: '#64748b',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            ou selecione o perfil de acesso
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Access Selector Tabs (Entidade Master vs Agentes vs Diretoria) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '0.35rem',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.65rem 0.4rem',
              borderRadius: '10px',
              border:
                activeTab === 'master'
                  ? '1px solid rgba(96, 165, 250, 0.5)'
                  : '1px solid transparent',
              backgroundColor:
                activeTab === 'master' ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
              color: activeTab === 'master' ? '#93c5fd' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.78125rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'master' ? '0 0 15px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={14} />
            <span>Master</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agents')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.65rem 0.4rem',
              borderRadius: '10px',
              border:
                activeTab === 'agents'
                  ? '1px solid rgba(52, 211, 153, 0.5)'
                  : '1px solid transparent',
              backgroundColor:
                activeTab === 'agents' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: activeTab === 'agents' ? '#6ee7b7' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.78125rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'agents' ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={14} />
            <span>Agentes ({agentUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('viewers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.65rem 0.4rem',
              borderRadius: '10px',
              border:
                activeTab === 'viewers'
                  ? '1px solid rgba(168, 85, 247, 0.5)'
                  : '1px solid transparent',
              backgroundColor:
                activeTab === 'viewers' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: activeTab === 'viewers' ? '#d8b4fe' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.78125rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'viewers' ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Eye size={14} />
            <span>Diretoria ({viewerUsers.length})</span>
          </button>
        </div>

        {/* TAB 1: ENTIDADE MASTER */}
        {activeTab === 'master' && (
          <div style={{ marginBottom: '1.75rem' }}>
            <div
              onClick={handleLoginMaster}
              style={{
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1.5px solid rgba(59, 130, 246, 0.5)',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 25px rgba(37, 99, 235, 0.2)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                    }}
                  >
                    RF
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: '#ffffff', display: 'block' }}>
                      {tenant.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                      Entidade Master • Gestão Industrial & ROI
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)',
                  }}
                >
                  Entrar como Master →
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.78125rem',
                  color: '#cbd5e1',
                  margin: '0.5rem 0 0',
                  lineHeight: 1.4,
                }}
              >
                Controle integral da plataforma: Dashboard executivo, triagem de sugestões Kaizen, memória financeira de 7 fontes de custo evitado, TPM e auditorias.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: AGENTES DA ENTIDADE */}
        {activeTab === 'agents' && (
          <div style={{ marginBottom: '1.75rem' }}>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.6rem',
                letterSpacing: '0.04em',
              }}
            >
              Selecione o Agente Operacional:
            </label>

            {agentUsers.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(16, 185, 129, 0.3)',
                  textAlign: 'center',
                }}
              >
                <Users size={24} color="#34d399" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>
                  Nenhum agente cadastrado ainda
                </p>
                <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                  O Gestor Master pode cadastrar agentes operacionais no painel de Usuários & Acessos.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {agentUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleLoginAgent(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.18)';
                      e.currentTarget.style.borderColor = '#34d399';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={
                          user.avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={user.name}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #10b981',
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block' }}>
                          {user.name}
                        </strong>
                        <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          {user.sectorName || 'Agente'} • Operação Kaizen
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(16, 185, 129, 0.25)',
                        color: '#6ee7b7',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                      }}
                    >
                      Acessar →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIRETORIA & CONSULTA EXECUTIVA (SOMENTE LEITURA) */}
        {activeTab === 'viewers' && (
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 700, display: 'block' }}>
                Acessos de Diretoria & Gerência de Fábrica
              </span>
              <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                Acompanhamento executivo de KPIs, Hoshin Kanri, Kanban e ROI em modo estritamente somente leitura.
              </p>
            </div>

            {viewerUsers.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(168, 85, 247, 0.3)',
                  textAlign: 'center',
                }}
              >
                <Eye size={24} color="#c084fc" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>
                  Nenhum visualizador cadastrado
                </p>
                <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                  O supervisor da planta pode criar acessos para a diretoria na tela de Gestão de Equipe & Acessos.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingRight: '0.25rem',
                }}
              >
                {viewerUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleLoginViewer(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      backgroundColor: 'rgba(168, 85, 247, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.16)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.25)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={
                          user.avatarUrl ||
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={user.name}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #a855f7',
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: '#ffffff', display: 'block' }}>
                          {user.name}
                        </strong>
                        <span style={{ fontSize: '0.725rem', color: '#c084fc' }}>
                          {user.jobTitle || 'Diretor Industrial'} • Consulta Executiva
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(168, 85, 247, 0.25)',
                        color: '#d8b4fe',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                      }}
                    >
                      Acessar →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Unique Link Info for the Factory */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            fontSize: '0.75rem',
            color: '#94a3b8',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          🔗 Link de Coleta de Demandas:{' '}
          <Link
            href={`/d/${tenant.slug}`}
            target="_blank"
            style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}
          >
            /d/{tenant.slug} ↗
          </Link>
        </div>

        {/* Esqueci Minha Senha / Recuperar Acesso */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <Link
            href="/recuperar-senha"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#94a3b8',
              fontSize: '0.8125rem',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#22d3ee')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <Lock size={13} />
            <span>Esqueceu sua senha? Recuperar acesso</span>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#64748b',
          fontSize: '0.78125rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <p style={{ margin: 0 }}>
          Desenvolvido por <strong>Mauricio Grigol</strong> • Consultor Lean & Dev Full Stack
        </p>
      </div>
    </div>
  );
}
