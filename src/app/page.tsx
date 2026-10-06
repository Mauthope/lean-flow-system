'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Shield,
  Lock,
  ArrowRight,
  Mail,
  Key,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const tenant = dataService.getCurrentTenant();

  // Formulário Corporativo
  const [email, setEmail] = useState('mauricio.grigol@rafitec.com.br');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Escuta retorno de login via OAuth (Microsoft Entra ID / SSO) ou sessão ativa
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // 0. Captura erros retornados pelo provedor OAuth (ex: Microsoft Entra ID) via URL hash ou query string
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      let errorDesc: string | null = null;

      if (hash && hash.includes('error=')) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        errorDesc = hashParams.get('error_description') || hashParams.get('error');
      } else if (search && search.includes('error=')) {
        const searchParams = new URLSearchParams(search);
        errorDesc = searchParams.get('error_description') || searchParams.get('error');
      }

      if (errorDesc) {
        const cleanDesc = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
        if (cleanDesc.includes('Error getting user email from external provider')) {
          setAuthError(
            'Falha de autenticação Microsoft SSO: O provedor corporativo não retornou o atributo de e-mail do colaborador. Verifique se o atributo de e-mail ou UPN está preenchido no Microsoft Entra ID ou conceda consentimento de administrador para o escopo User.Read / email no Azure Portal.'
          );
        } else {
          setAuthError(`Falha na autenticação corporativa Microsoft: ${cleanDesc}`);
        }
        setIsLoading(false);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    let isMounted = true;

    const handleSessionUser = async (userId: string, userEmail?: string) => {
      try {
        let profile = null;
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (data) profile = data;
        } catch (profileErr) {
          console.warn('[SSO Callback] Perfil ainda sincronizando no banco por id:', profileErr);
        }

        if (!isMounted) return;

        const effectiveEmail = (profile?.email || userEmail || '').trim().toLowerCase();
        if (!effectiveEmail) return;

        // Fallback por e-mail na tabela profiles caso o id não coincida
        if (!profile && effectiveEmail) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', effectiveEmail)
              .maybeSingle();
            if (data) profile = data;
          } catch (profileEmailErr) {
            console.warn('[SSO Callback] Perfil fallback por email:', profileEmailErr);
          }
        }

        // 1. Verifica autorização corporativa em 3 camadas de governança:
        // A) Perfil cadastrado e ativo no Supabase (public.profiles)
        // B) Lista de usuários pré-autorizados na empresa (public.authorized_users)
        // C) Cadastro prévio na base local (dataService)
        let isAuthorized = false;
        let authRole: 'admin' | 'agent' | 'viewer' = 'agent';
        let authName = profile?.name || userEmail?.split('@')[0] || 'Colaborador';
        let authJobTitle = profile?.job_title || 'Agente de Melhoria Contínua';
        let isMaster = profile?.is_master || effectiveEmail === 'mauricio.grigol@rafitec.com.br';

        // Camada A: Perfil no banco Supabase
        if (profile) {
          if (profile.status === 'ativo' || isMaster) {
            isAuthorized = true;
            authRole = profile.role || (isMaster ? 'admin' : 'agent');
            authName = profile.name || authName;
            authJobTitle = profile.job_title || authJobTitle;
          } else if (profile.status === 'suspenso') {
            await supabase.auth.signOut();
            setAuthError(
              `Acesso bloqueado: O usuário "${effectiveEmail}" está desativado nesta plataforma. Entre em contato com a administração.`
            );
            setIsLoading(false);
            return;
          }
        }

        // Camada B: Lista corporativa de pré-autorizados no Supabase (public.authorized_users)
        if (!isAuthorized) {
          try {
            const { data: authRecord } = await supabase
              .from('authorized_users')
              .select('*')
              .eq('email', effectiveEmail)
              .maybeSingle();

            if (authRecord) {
              if (authRecord.active) {
                isAuthorized = true;
                authRole = authRecord.role;
                authName = authRecord.name;
                authJobTitle = authRecord.job_title || authJobTitle;
              } else {
                await supabase.auth.signOut();
                setAuthError(`Acesso bloqueado: O cadastro de "${effectiveEmail}" está desativado na plataforma.`);
                setIsLoading(false);
                return;
              }
            }
          } catch {
            // Continua para checagem na base local
          }
        }

        // Camada C: Base de dados local (dataService)
        let matchedUser =
          dataService.getUserByIdOrEmail(effectiveEmail) ||
          dataService.getUserByIdOrEmail(userId);

        if (matchedUser) {
          if (!matchedUser.active) {
            await supabase.auth.signOut();
            setAuthError(`Acesso bloqueado: O usuário vinculado a "${effectiveEmail}" está desativado nesta plataforma.`);
            setIsLoading(false);
            return;
          }
          isAuthorized = true;
          authRole = matchedUser.role;
          authName = matchedUser.name;
          authJobTitle = matchedUser.jobTitle || authJobTitle;
          isMaster = matchedUser.isMaster || isMaster;
        }

        // SE NÃO CONSTAR EM NENHUMA DAS BASES: BLOQUEIO TOTAL (Zero Trust)
        if (!isAuthorized) {
          await supabase.auth.signOut();
          setAuthError(
            `Acesso não autorizado (Política de Acesso Lean): O e-mail corporativo "${effectiveEmail}" foi autenticado pela Microsoft, porém não possui cadastro prévio nesta plataforma. Solicite a liberação de acesso ao Administrador do Sistema.`
          );
          setIsLoading(false);
          return;
        }

        // Se o usuário foi validado pelo banco de dados Supabase mas ainda não existe no storage local deste navegador:
        if (!matchedUser) {
          const currentTenant = dataService.getCurrentTenant();
          matchedUser = dataService.createUser({
            tenantId: currentTenant.id,
            name: authName,
            email: effectiveEmail,
            role: authRole,
            isMaster: isMaster,
            jobTitle: authJobTitle,
            active: true,
          });
        } else {
          // Atualiza dados locais para refletir status e cargo do banco Supabase
          matchedUser = dataService.updateUser(matchedUser.id, {
            name: authName,
            role: authRole,
            isMaster: isMaster,
            jobTitle: authJobTitle,
            active: true,
          });
        }

        // Efetiva a sessão corporativa e redireciona
        loginAs(matchedUser.id);
        if (
          matchedUser.role === 'admin' ||
          matchedUser.isMaster ||
          isMaster ||
          effectiveEmail === 'mauricio.grigol@rafitec.com.br'
        ) {
          router.push('/admin/dashboard');
        } else {
          router.push('/agente/kanban');
        }
      } catch (err: any) {
        console.warn('[SSO Callback] Falha na sincronização corporativa:', err);
        setAuthError(err?.message || 'Falha ao sincronizar perfil corporativo no acesso SSO.');
        setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSessionUser(session.user.id, session.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        handleSessionUser(session.user.id, session.user.email);
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
          let profile = null;
          try {
            const { data: profData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
            profile = profData;
          } catch {}

          const effectiveEmail = (profile?.email || data.user.email || cleanEmail).trim().toLowerCase();

          if (!profile && effectiveEmail) {
            try {
              const { data: profData } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', effectiveEmail)
                .maybeSingle();
              profile = profData;
            } catch {}
          }

          let matchedUser =
            dataService.getUserByIdOrEmail(effectiveEmail) ||
            dataService.getUserByIdOrEmail(data.user.id) ||
            (profile ? dataService.getUserByIdOrEmail(profile.id) : undefined);

          let isAuthorized = false;
          let authRole: 'admin' | 'agent' | 'viewer' = profile?.role || 'agent';
          let authName = profile?.name || cleanEmail.split('@')[0];
          let authJobTitle = profile?.job_title || 'Agente de Melhoria Contínua';
          let isMaster = profile?.is_master || effectiveEmail === 'mauricio.grigol@rafitec.com.br';

          if (profile && (profile.status === 'ativo' || isMaster)) {
            isAuthorized = true;
          } else {
            try {
              const { data: authRecord } = await supabase
                .from('authorized_users')
                .select('*')
                .eq('email', effectiveEmail)
                .maybeSingle();
              if (authRecord && authRecord.active) {
                isAuthorized = true;
                authRole = authRecord.role;
                authName = authRecord.name;
                authJobTitle = authRecord.job_title || authJobTitle;
              }
            } catch {
              // continua
            }
          }

          if (matchedUser) {
            if (!matchedUser.active) {
              await supabase.auth.signOut();
              setAuthError(
                `Acesso bloqueado: O usuário "${effectiveEmail}" está desativado nesta plataforma. Entre em contato com a administração.`
              );
              setIsLoading(false);
              return;
            }
            isAuthorized = true;
          }

          // Se não houver cadastro prévio pelo Administrador
          if (!isAuthorized) {
            await supabase.auth.signOut();
            setAuthError(
              `Acesso não autorizado: O usuário "${effectiveEmail}" não possui cadastro nesta plataforma Lean. Solicite a liberação de acesso ao Administrador.`
            );
            setIsLoading(false);
            return;
          }

          if (!matchedUser) {
            const currentTenant = dataService.getCurrentTenant();
            matchedUser = dataService.createUser({
              tenantId: currentTenant.id,
              name: authName,
              email: effectiveEmail,
              role: authRole,
              isMaster: isMaster,
              jobTitle: authJobTitle,
              active: true,
            });
          } else {
            matchedUser = dataService.updateUser(matchedUser.id, {
              name: authName,
              role: authRole,
              isMaster: isMaster,
              jobTitle: authJobTitle,
              active: true,
            });
          }

          loginAs(matchedUser.id);
          if (matchedUser.role === 'admin' || matchedUser.isMaster || isMaster) {
            router.push('/admin/dashboard');
          } else {
            router.push('/agente/kanban');
          }
          return;
        }
      }

      // Fallback em caso de modo local/desenvolvimento
      const users = dataService.getUsers();
      const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (matched) {
        if (!matched.active) {
          setAuthError('Acesso bloqueado: Este usuário está inativo no sistema.');
          return;
        }
        loginAs(matched.id);
        router.push(matched.role === 'admin' ? '/admin/dashboard' : '/agente/kanban');
      } else {
        setAuthError(
          'Usuário não encontrado na base. Solicite seu cadastramento prévio ao Administrador da Planta.'
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
            scopes: 'openid email profile offline_access',
            redirectTo:
              typeof window !== 'undefined'
                ? window.location.origin
                : 'https://fluxo-lean-system.vercel.app',
          },
        });

        if (error) {
          setAuthError(
            `Integração Microsoft Entra ID: ${error.message}. (Aguardando ativação do provedor Azure no Supabase pela equipe de TI/Infraestrutura).`
          );
        }
      } else {
        setAuthError(
          'Integração Microsoft Entra ID (SSO Corporativo): Requer conexão ativa com o servidor corporativo.'
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Falha ao iniciar autenticação com Microsoft.');
    } finally {
      setIsLoading(false);
    }
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

      {/* Top Corporate Badge */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: '0.725rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #94a3b8)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Shield size={13} color="#06b6d4" /> Sistema Lean Flow • Governança Industrial
        </span>
        <span
          style={{
            fontSize: '0.675rem',
            fontWeight: 800,
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            color: '#22d3ee',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '0.15rem 0.45rem',
            borderRadius: '6px',
          }}
        >
          Rafitec S.A.
        </span>
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
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '0.75rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.28)',
            }}
          >
            <span
              style={{
                fontSize: '0.78125rem',
                color: 'var(--text-muted, #94a3b8)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Desenvolvido por <strong style={{ color: '#ffffff', fontWeight: 600 }}>Mauricio Grigol</strong>
            </span>
          </div>
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

        {/* LOGIN CORPORATIVO */}
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
                    <div style={{ marginBottom: '2px' }}>
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
          </div>

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

      {/* Footer Info Sem Emojis - Bem Visível */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.55rem 1.25rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
              color: '#020617',
              fontSize: '0.6875rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)',
            }}
          >
            MG
          </div>
          <span
            style={{
              fontSize: '0.84375rem',
              color: '#f1f5f9',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Desenvolvido por <strong style={{ color: '#ffffff', fontWeight: 700 }}>Mauricio Grigol</strong>
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
          <span
            style={{
              fontSize: '0.8125rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Consultor Lean & Dev Full Stack
          </span>
        </div>
      </div>
    </div>
  );
}
