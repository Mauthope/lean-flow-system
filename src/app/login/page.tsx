'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Shield,
  Users,
  Lock,
  ArrowLeft,
  Building2,
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, refreshData } = useAuth();

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

  const handleMicrosoftSso = () => {
    setAuthError(
      'Integração Microsoft Entra ID (SSO Corporativo): Recomendada pelo SecOps. Em processo de homologação junto à equipe de TI/Infraestrutura.'
    );
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
      {/* Background Ambient Glow */}
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
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
            Portal de Acesso Seguro • Sistema FluxoLean 4.0
          </p>
        </div>

        {/* Mode Selector (Corporativo vs Simulação Local) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
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
            onClick={() => setLoginMode('corporate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem 0.5rem',
              borderRadius: '10px',
              border:
                loginMode === 'corporate'
                  ? '1px solid rgba(96, 165, 250, 0.5)'
                  : '1px solid transparent',
              backgroundColor:
                loginMode === 'corporate' ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
              color: loginMode === 'corporate' ? '#93c5fd' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={15} />
            <span>Acesso Corporativo</span>
          </button>

          <button
            type="button"
            onClick={() => setLoginMode('simulation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem 0.5rem',
              borderRadius: '10px',
              border:
                loginMode === 'simulation'
                  ? '1px solid rgba(168, 85, 247, 0.5)'
                  : '1px solid transparent',
              backgroundColor:
                loginMode === 'simulation' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: loginMode === 'simulation' ? '#d8b4fe' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={15} />
            <span>Simulação Local</span>
          </button>
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

        {/* MODO 1: LOGIN CORPORATIVO SEGURO */}
        {loginMode === 'corporate' && (
          <form onSubmit={handleCorporateLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78125rem',
                  fontWeight: 700,
                  color: '#cbd5e1',
                  marginBottom: '0.4rem',
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
                    color: '#64748b',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome@rafitec.com.br"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78125rem',
                  fontWeight: 700,
                  color: '#cbd5e1',
                  marginBottom: '0.4rem',
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
                    color: '#64748b',
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem',
                borderRadius: '12px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9375rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
                marginTop: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Acessar Plataforma →</span>
              )}
            </button>

            {/* Ações de Recuperação e SSO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleRequestPasswordReset}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.78125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '0.25rem',
                }}
              >
                Primeiro Acesso ou Esqueceu a Senha? Clique aqui para enviar link ao e-mail
              </button>

              <button
                type="button"
                onClick={handleMicrosoftSso}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontSize: '0.78125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '0.25rem',
                }}
              >
                <span>Entrar com Conta Microsoft Corporativa (Entra ID / SSO)</span>
              </button>
            </div>

            {/* SecOps Notice */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.71875rem',
                color: '#64748b',
                lineHeight: 1.45,
                textAlign: 'center',
              }}
            >
              🔒 <strong>Ambiente Protegido por PSI</strong> • Tráfego HTTPS/TLS criptografado • Políticas RLS ativas • Bloqueio de cadastros não homologados.
            </div>
          </form>
        )}

        {/* MODO 2: SIMULAÇÃO LOCAL (DEMO / TESTES) */}
        {loginMode === 'simulation' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.35rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                padding: '0.3rem',
                borderRadius: '12px',
                marginBottom: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveSimTab('master')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeSimTab === 'master' ? 'rgba(37, 99, 235, 0.35)' : 'transparent',
                  color: activeSimTab === 'master' ? '#93c5fd' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Master
              </button>
              <button
                type="button"
                onClick={() => setActiveSimTab('agents')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeSimTab === 'agents' ? 'rgba(16, 185, 129, 0.35)' : 'transparent',
                  color: activeSimTab === 'agents' ? '#6ee7b7' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Agentes ({agentUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSimTab('viewers')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeSimTab === 'viewers' ? 'rgba(168, 85, 247, 0.35)' : 'transparent',
                  color: activeSimTab === 'viewers' ? '#d8b4fe' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Diretoria ({viewerUsers.length})
              </button>
            </div>

            {activeSimTab === 'master' && (
              <div
                onClick={handleLoginMaster}
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(59, 130, 246, 0.5)',
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#ffffff', display: 'block' }}>
                      {masterUser?.name || 'Mauricio Grigol'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                      Administrador Geral • {masterUser?.email}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                    }}
                  >
                    Simular Acesso →
                  </span>
                </div>
              </div>
            )}

            {activeSimTab === 'agents' && (
              <div>
                {agentUsers.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      fontSize: '0.8125rem',
                    }}
                  >
                    Nenhum agente cadastrado no momento. Cadastre agentes reais no painel Master.
                  </div>
                ) : (
                  agentUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleLoginAgent(u.id)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{u.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.71875rem', color: '#6ee7b7' }}>{u.email}</span>
                      </div>
                      <span style={{ fontSize: '0.71875rem', color: '#6ee7b7' }}>Acessar →</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSimTab === 'viewers' && (
              <div>
                {viewerUsers.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      fontSize: '0.8125rem',
                    }}
                  >
                    Nenhum visualizador cadastrado no momento.
                  </div>
                ) : (
                  viewerUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleLoginViewer(u.id)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{u.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.71875rem', color: '#d8b4fe' }}>{u.email}</span>
                      </div>
                      <span style={{ fontSize: '0.71875rem', color: '#d8b4fe' }}>Acessar →</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
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
          Desenvolvido por <strong>Mauricio Grigol</strong> • Sistema Homologado Lean Flow
        </p>
      </div>
    </div>
  );
}
