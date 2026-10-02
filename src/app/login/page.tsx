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
  ArrowRight,
  Eye,
  Mail,
  Key,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

  const [loginMode, setLoginMode] = useState<'corporate' | 'simulation'>('corporate');
  const [activeSimTab, setActiveSimTab] = useState<'master' | 'agents' | 'viewers'>('master');

  // Formulário Corporativo
  const [email, setEmail] = useState('mauricio.grigol@rafitec.com.br');
  const [password, setPassword] = useState('');
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

  const handleCorporateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const isDomainAllowed =
      cleanEmail.endsWith('@rafitec.com.br') || cleanEmail.endsWith('@vaccaro.com.br');

    if (!isDomainAllowed) {
      setAuthError(
        'Política de Segurança (PSI Grupo Vaccaro): Apenas e-mails corporativos @rafitec.com.br ou @vaccaro.com.br são permitidos.'
      );
      return;
    }

    if (!password || password.length < 6) {
      setAuthError('Por favor informe a senha de acesso (mínimo 6 caracteres).');
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setAuthError(
            error.message === 'Invalid login credentials'
              ? 'Credenciais incorretas ou senha ainda não cadastrada.'
              : error.message
          );
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            loginAs(profile.id);
            if (profile.role === 'admin' || profile.is_master) {
              router.push('/admin/dashboard');
            } else {
              router.push('/agente/kanban');
            }
            return;
          }
        }
      }

      // Fallback em caso de modo local/desenvolvimento
      const users = dataService.getUsers();
      const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (matched) {
        loginAs(matched.id);
        router.push(matched.role === 'admin' ? '/admin/dashboard' : '/agente/kanban');
      } else {
        setAuthError(
          'Usuário não encontrado na base. Se for seu primeiro acesso, clique em "Definir / Redefinir Senha".'
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Falha na autenticação corporativa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (
      !cleanEmail ||
      (!cleanEmail.endsWith('@rafitec.com.br') && !cleanEmail.endsWith('@vaccaro.com.br'))
    ) {
      setAuthError(
        'Informe um e-mail corporativo válido (@rafitec.com.br) para receber as instruções de senha.'
      );
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/login`
              : 'https://fluxo-lean-system.vercel.app/login',
        });

        if (error) {
          setAuthError(error.message);
        } else {
          setAuthSuccess(
            `E-mail de confirmação enviado para ${cleanEmail}! Acesse sua caixa corporativa para definir sua senha de acesso.`
          );
        }
      } else {
        setAuthSuccess(
          `Modo de simulação: Em produção com Supabase, o link de definição de senha é enviado com token seguro para ${cleanEmail}.`
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Falha ao solicitar instruções de senha.');
    } finally {
      setIsLoading(false);
    }
  };

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
          'Integração Microsoft Entra ID (SSO Corporativo): Disponível com Supabase em produção. Para testar localmente, utilize a Simulação Local.'
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
        backgroundColor: 'var(--bg-primary, #060a13)',
        color: 'var(--text-primary, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'var(--font-sans)',
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
            'radial-gradient(circle, rgba(6, 182, 212, 0.16) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 70%)',
          filter: 'blur(100px)',
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
            'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          filter: 'blur(90px)',
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
            'linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Back Link */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
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
            gap: '0.45rem',
            color: 'var(--text-muted, #94a3b8)',
            fontSize: '0.84375rem',
            textDecoration: 'none',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            transition: 'color 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary-hover, #22d3ee)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted, #94a3b8)')}
        >
          <ArrowLeft size={16} /> Voltar para a Landing Page
        </Link>
      </div>

      {/* Main Glass Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
              color: '#020617',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.3rem',
              fontFamily: 'var(--font-heading)',
              margin: '0 auto 0.85rem',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            RF
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-heading, #ffffff)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {tenant.name}
          </h1>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted, #94a3b8)',
              marginTop: '0.3rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Portal de Acesso Seguro • Sistema FluxoLean 4.0
          </p>
        </div>

        {/* Access Selector Tabs (Acesso Corporativo vs Simulação Local) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            backgroundColor: 'var(--bg-input, #0d1527)',
            padding: '0.3rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setLoginMode('corporate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.6rem 0.5rem',
              borderRadius: '9px',
              border:
                loginMode === 'corporate'
                  ? '1px solid rgba(6, 182, 212, 0.4)'
                  : '1px solid transparent',
              backgroundColor:
                loginMode === 'corporate' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: loginMode === 'corporate' ? '#22d3ee' : 'var(--text-muted, #94a3b8)',
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={14} />
            <span>Acesso Corporativo</span>
          </button>

          <button
            type="button"
            onClick={() => setLoginMode('simulation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.6rem 0.5rem',
              borderRadius: '9px',
              border:
                loginMode === 'simulation'
                  ? '1px solid rgba(168, 85, 247, 0.4)'
                  : '1px solid transparent',
              backgroundColor:
                loginMode === 'simulation' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: loginMode === 'simulation' ? '#c084fc' : 'var(--text-muted, #94a3b8)',
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} />
            <span>Simulação Local</span>
          </button>
        </div>

        {/* FEEDBACK MESSAGES */}
        {authError && (
          <div
            style={{
              padding: '0.75rem 0.9rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              color: '#f87171',
              fontSize: '0.8125rem',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div
            style={{
              padding: '0.75rem 0.9rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              color: '#34d399',
              fontSize: '0.8125rem',
              lineHeight: 1.45,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* MODO 1: LOGIN CORPORATIVO */}
        {loginMode === 'corporate' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* BOTÃO MICROSOFT SSO OFICIAL */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                onClick={handleMicrosoftSso}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-input, #0d1527)',
                  border: '1px solid var(--border-input, rgba(255, 255, 255, 0.12))',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease-in-out',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated, #131d35)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(6, 182, 212, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input, #0d1527)';
                  e.currentTarget.style.borderColor = 'var(--border-input, rgba(255, 255, 255, 0.12))';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* Logotipo Oficial Microsoft em moldura nítida */}
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                      <strong
                        style={{
                          fontSize: '0.875rem',
                          color: '#ffffff',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                        }}
                      >
                        Entrar com Conta Microsoft
                      </strong>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          color: '#22d3ee',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(6, 182, 212, 0.35)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Recomendado TI
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
                      Acesso corporativo seguro com seu e-mail @rafitec.com.br
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#22d3ee',
                    flexShrink: 0,
                  }}
                >
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* DIVISOR */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: '0.25rem 0 1.25rem 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle, rgba(255, 255, 255, 0.08))' }} />
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim, #64748b)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                ou acesse com e-mail e senha
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle, rgba(255, 255, 255, 0.08))' }} />
            </div>

            {/* FORMULÁRIO DE E-MAIL E SENHA */}
            <form onSubmit={handleCorporateLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78125rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary, #cbd5e1)',
                    marginBottom: '0.35rem',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  E-mail Corporativo (@rafitec.com.br)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim, #64748b)',
                    }}
                  />
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.nome@rafitec.com.br"
                    required
                    style={{
                      paddingLeft: '2.4rem',
                      backgroundColor: 'var(--bg-input, #0d1527)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78125rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary, #cbd5e1)',
                    marginBottom: '0.35rem',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Senha de Acesso
                </label>
                <div style={{ position: 'relative' }}>
                  <Key
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim, #64748b)',
                    }}
                  />
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    style={{
                      paddingLeft: '2.4rem',
                      backgroundColor: 'var(--bg-input, #0d1527)',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  fontSize: '0.875rem',
                  marginTop: '0.35rem',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar com E-mail e Senha</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRequestPasswordReset}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary, #06b6d4)',
                  fontSize: '0.78125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '0.25rem',
                  fontFamily: 'var(--font-sans)',
                  transition: 'color 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary-hover, #22d3ee)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--primary, #06b6d4)')}
              >
                Primeiro Acesso ou Esqueceu a Senha? Clique aqui para enviar link ao e-mail
              </button>
            </form>

            {/* SecOps Notice Sem Emojis */}
            <div
              style={{
                marginTop: '1.25rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.71875rem',
                color: 'var(--text-dim, #64748b)',
                lineHeight: 1.45,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}
            >
              <Lock size={12} color="var(--primary, #06b6d4)" style={{ flexShrink: 0 }} />
              <span>
                Ambiente Protegido por PSI • Tráfego HTTPS/TLS criptografado • Políticas RLS ativas.
              </span>
            </div>
          </div>
        )}

        {/* MODO 2: SIMULAÇÃO LOCAL (DEMO / TESTES) */}
        {loginMode === 'simulation' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.35rem',
                backgroundColor: 'var(--bg-input, #0d1527)',
                padding: '0.3rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                marginBottom: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveSimTab('master')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.35rem',
                  borderRadius: '8px',
                  border:
                    activeSimTab === 'master'
                      ? '1px solid rgba(6, 182, 212, 0.4)'
                      : '1px solid transparent',
                  backgroundColor:
                    activeSimTab === 'master' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: activeSimTab === 'master' ? '#22d3ee' : 'var(--text-muted, #94a3b8)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Shield size={13} />
                <span>Master</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSimTab('agents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.35rem',
                  borderRadius: '8px',
                  border:
                    activeSimTab === 'agents'
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid transparent',
                  backgroundColor:
                    activeSimTab === 'agents' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: activeSimTab === 'agents' ? '#34d399' : 'var(--text-muted, #94a3b8)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Users size={13} />
                <span>Agentes ({agentUsers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSimTab('viewers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.35rem',
                  borderRadius: '8px',
                  border:
                    activeSimTab === 'viewers'
                      ? '1px solid rgba(168, 85, 247, 0.4)'
                      : '1px solid transparent',
                  backgroundColor:
                    activeSimTab === 'viewers' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                  color: activeSimTab === 'viewers' ? '#c084fc' : 'var(--text-muted, #94a3b8)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Eye size={13} />
                <span>Diretoria ({viewerUsers.length})</span>
              </button>
            </div>

            {/* TAB 1: MASTER */}
            {activeSimTab === 'master' && (
              <div
                onClick={handleLoginMaster}
                style={{
                  padding: '1.15rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  backgroundColor: 'rgba(6, 182, 212, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: '1rem',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.45rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
                        color: '#020617',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      RF
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.96875rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>
                        {tenant.name}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#22d3ee' }}>
                        Entidade Master • Gestão Industrial & ROI
                      </span>
                    </div>
                  </div>

                  <span
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.75rem',
                    }}
                  >
                    Acessar Master <ArrowRight size={13} />
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted, #94a3b8)',
                    margin: '0.45rem 0 0',
                    lineHeight: 1.4,
                  }}
                >
                  Acesso com privilégios de Administrador Geral da planta: Dashboard executivo, triagem de sugestões Kaizen, auditorias e TPM.
                </p>
              </div>
            )}

            {/* TAB 2: AGENTES */}
            {activeSimTab === 'agents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '1rem' }}>
                {agentUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleLoginAgent(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      backgroundColor: 'var(--bg-input, #0d1527)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-input, #0d1527)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.08))';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={
                          user.avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={user.name}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #10b981',
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.84375rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>
                          {user.name}
                        </strong>
                        <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted, #94a3b8)' }}>
                          {user.sectorName || 'Agente'} • Operação Kaizen
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.71875rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                      }}
                    >
                      Acessar
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: DIRETORIA */}
            {activeSimTab === 'viewers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '1rem' }}>
                {viewerUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleLoginViewer(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      backgroundColor: 'var(--bg-input, #0d1527)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-input, #0d1527)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.08))';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={
                          user.avatarUrl ||
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={user.name}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #a855f7',
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.84375rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-heading)' }}>
                          {user.name}
                        </strong>
                        <span style={{ fontSize: '0.71875rem', color: '#c084fc' }}>
                          {user.jobTitle || 'Diretoria'} • Consulta Executiva
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.71875rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(168, 85, 247, 0.2)',
                        color: '#c084fc',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                      }}
                    >
                      Acessar
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Link de Coleta de Demandas */}
        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '10px',
            fontSize: '0.75rem',
            color: 'var(--text-muted, #94a3b8)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            marginTop: '0.75rem',
          }}
        >
          <ExternalLink size={13} color="var(--primary, #06b6d4)" />
          <span>Link de Coleta de Demandas:</span>
          <Link
            href={`/d/${tenant.slug}`}
            target="_blank"
            style={{
              color: 'var(--primary, #06b6d4)',
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            /d/{tenant.slug}
          </Link>
        </div>

        {/* Recuperar Acesso */}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link
            href="/recuperar-senha"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '0.8125rem',
              textDecoration: 'none',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              transition: 'color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary-hover, #22d3ee)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted, #94a3b8)')}
          >
            <Lock size={13} />
            <span>Esqueceu sua senha? Recuperar acesso</span>
          </Link>
        </div>
      </div>

      {/* Footer Info Sem Emojis */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          color: 'var(--text-dim, #64748b)',
          fontSize: '0.78125rem',
          fontFamily: 'var(--font-sans)',
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
