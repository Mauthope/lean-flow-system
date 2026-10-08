'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { setStoredData, STORAGE_KEYS } from '@/lib/storage';
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Workflow,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Apenas entra em modo de autenticação em transição se houver retorno de callback do OAuth (Microsoft SSO)
  const [isAuthenticating, setIsAuthenticating] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    return hash.includes('access_token=') || search.includes('code=');
  });

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
        setIsAuthenticating(false);
        setIsLoading(false);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    let isMounted = true;
    let isProcessing = false;

    const handleSessionUser = async (userId: string, userEmail?: string) => {
      if (isProcessing) return;
      isProcessing = true;
      setIsAuthenticating(true);

      try {
        const rawEmail = (userEmail || '').trim().toLowerCase();

        // 1. Busca perfil e authorized_users em paralelo para eliminar latência
        const [profileByIdRes, authUserRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          rawEmail
            ? supabase.from('authorized_users').select('*').eq('email', rawEmail).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        let profile = profileByIdRes.data;
        const authRecord = authUserRes.data;

        if (!isMounted) return;

        const effectiveEmail = (profile?.email || rawEmail || authRecord?.email || '').trim().toLowerCase();
        if (!effectiveEmail) {
          setIsAuthenticating(false);
          setIsLoading(false);
          return;
        }

        // Fallback por e-mail na tabela profiles apenas se o id não coincidiu
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

        // 2. Verifica autorização corporativa em 3 camadas de governança
        let isAuthorized = false;
        let authRole: 'admin' | 'agent' | 'viewer' = 'agent';
        let authName = profile?.name || authRecord?.name || effectiveEmail.split('@')[0] || 'Colaborador';
        let authJobTitle = profile?.job_title || authRecord?.job_title || 'Agente de Melhoria Contínua';
        let authAvatar = profile?.avatar_url || authRecord?.avatar_url;
        let authTenantId = profile?.tenant_id || authRecord?.tenant_id;
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
            setIsAuthenticating(false);
            setAuthError(
              `Acesso bloqueado: O usuário "${effectiveEmail}" está desativado nesta plataforma. Entre em contato com a administração.`
            );
            setIsLoading(false);
            return;
          }
        }

        // Camada B: Lista corporativa de pré-autorizados (authorized_users)
        if (!isAuthorized && authRecord) {
          if (authRecord.active) {
            isAuthorized = true;
            authRole = authRecord.role;
            authName = authRecord.name;
            authJobTitle = authRecord.job_title || authJobTitle;
            authTenantId = authRecord.tenant_id || authTenantId;
            if (!authAvatar && authRecord.avatar_url) {
              authAvatar = authRecord.avatar_url;
            }
          } else {
            await supabase.auth.signOut();
            setIsAuthenticating(false);
            setAuthError(`Acesso bloqueado: O cadastro de "${effectiveEmail}" está desativado na plataforma.`);
            setIsLoading(false);
            return;
          }
        }

        // Camada C: Base de dados local (dataService)
        let matchedUser =
          dataService.getUserByIdOrEmail(effectiveEmail) ||
          dataService.getUserByIdOrEmail(userId);

        if (matchedUser) {
          if (!matchedUser.active) {
            await supabase.auth.signOut();
            setIsAuthenticating(false);
            setAuthError(`Acesso bloqueado: O usuário vinculado a "${effectiveEmail}" está desativado nesta plataforma.`);
            setIsLoading(false);
            return;
          }
          isAuthorized = true;
          authRole = matchedUser.role;
          authName = matchedUser.name;
          authJobTitle = matchedUser.jobTitle || authJobTitle;
          isMaster = matchedUser.isMaster || isMaster;
          if (!authAvatar && matchedUser.avatarUrl) {
            authAvatar = matchedUser.avatarUrl;
          }
        }

        // SE NÃO CONSTAR EM NENHUMA DAS BASES: BLOQUEIO TOTAL (Zero Trust)
        if (!isAuthorized) {
          await supabase.auth.signOut();
          setIsAuthenticating(false);
          setAuthError(
            `Acesso não autorizado (Política de Acesso Lean): O e-mail corporativo "${effectiveEmail}" foi autenticado pela Microsoft, porém não possui cadastro prévio nesta plataforma. Solicite a liberação de acesso ao Administrador do Sistema.`
          );
          setIsLoading(false);
          return;
        }

        // Sincronização da base local
        if (!matchedUser) {
          const effectiveTenantId = authTenantId || dataService.getCurrentTenant().id;
          matchedUser = dataService.createUser({
            tenantId: effectiveTenantId,
            name: authName,
            email: effectiveEmail,
            role: authRole,
            isMaster: isMaster,
            jobTitle: authJobTitle,
            avatarUrl: authAvatar,
            active: true,
          });
        } else {
          matchedUser = dataService.updateUser(matchedUser.id, {
            name: authName,
            role: authRole,
            ...(authTenantId ? { tenantId: authTenantId } : {}),
            isMaster: isMaster,
            jobTitle: authJobTitle,
            ...(authAvatar ? { avatarUrl: authAvatar } : {}),
            active: true,
          });
        }

        // Garante que o tenant ativo seja o da unidade do colaborador
        const userTenantId = authTenantId || matchedUser.tenantId;
        if (userTenantId && !matchedUser.isMaster) {
          const targetTenant = dataService.getTenantById(userTenantId);
          if (targetTenant) {
            dataService.setCurrentTenant(targetTenant);
          }
        }

        // Atualização assíncrona do perfil no Supabase SEM travar a navegação (fire-and-forget)
        Promise.resolve(
          supabase
            .from('profiles')
            .update({
              status: 'ativo',
              role: authRole,
              ...(authTenantId ? { tenant_id: authTenantId } : {}),
              name: authName,
              job_title: authJobTitle,
              ...(authAvatar ? { avatar_url: authAvatar } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
        ).catch((e: unknown) => console.warn('[SSO Callback] Atualização assíncrona do perfil:', e));

        // Efetiva a sessão corporativa e navega imediatamente sem delay
        loginAs(matchedUser.id);
        const targetRoute =
          matchedUser.role === 'admin' ||
          matchedUser.isMaster ||
          isMaster ||
          effectiveEmail === 'mauricio.grigol@rafitec.com.br'
            ? '/admin/dashboard'
            : '/agente/kanban';

        router.replace(targetRoute);
      } catch (err: any) {
        console.warn('[SSO Callback] Falha na sincronização corporativa:', err);
        setIsAuthenticating(false);
        setAuthError(err?.message || 'Falha ao sincronizar perfil corporativo no acesso SSO.');
        setIsLoading(false);
      }
    };

    const isOAuth =
      typeof window !== 'undefined' &&
      (window.location.hash.includes('access_token=') ||
        window.location.search.includes('code='));

    if (isOAuth) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          handleSessionUser(session.user.id, session.user.email);
        } else {
          setIsAuthenticating(false);
        }
      });
    } else {
      setIsAuthenticating(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user && isOAuth) {
        handleSessionUser(session.user.id, session.user.email);
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
            scopes: 'openid email profile offline_access User.Read',
            queryParams: {
              prompt: 'select_account',
            },
            redirectTo:
              typeof window !== 'undefined'
                ? window.location.origin
                : 'https://lean-flow-system.vercel.app',
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

  if (isAuthenticating && !authError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary, #060a13)',
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
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee',
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.25)',
            }}
          >
            <Loader2 size={26} className="animate-spin" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                margin: 0,
              }}
            >
              Autenticando Sessão Corporativa
            </h2>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted, #94a3b8)',
                marginTop: '0.35rem',
              }}
            >
              Validando credenciais Microsoft SSO e conectando ao Lean Flow System...
            </p>
          </div>
        </div>
      </div>
    );
  }

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


      {/* Main Glass Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Linha superior de brilho executivo */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: '12%',
            right: '12%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.7) 40%, rgba(16, 185, 129, 0.7) 60%, transparent 100%)',
            zIndex: 2,
            filter: 'blur(0.2px)',
          }}
        />

        {/* Respiro luminoso superior suave */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: '160px',
            background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Header Hero Moderno Corporativo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
          {/* Badge de Plataforma Corporativa 4.0 */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              marginBottom: '1.25rem',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 10px rgba(6, 182, 212, 0.06)',
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'flex',
                height: '8px',
                width: '8px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  height: '100%',
                  width: '100%',
                  borderRadius: '9999px',
                  backgroundColor: '#34d399',
                  opacity: 0.75,
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  borderRadius: '9999px',
                  height: '8px',
                  width: '8px',
                  backgroundColor: '#10b981',
                }}
              />
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#22d3ee',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Plataforma Corporativa 4.0 • Grupo Vaccaro
            </span>
          </div>

          {/* Emblema Luminous High-Tech 4.0 */}
          <div
            style={{
              position: 'relative',
              width: '76px',
              height: '76px',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Halo de iluminação volumétrica ambiente */}
            <div
              style={{
                position: 'absolute',
                inset: '-12px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, rgba(16, 185, 129, 0.12) 45%, transparent 70%)',
                filter: 'blur(8px)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />

            {/* Moldura Squircle High-Tech */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '22px',
                background: 'linear-gradient(145deg, #0f1d36 0%, #060a14 100%)',
                border: '1px solid rgba(34, 211, 238, 0.35)',
                boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.7), 0 0 20px rgba(6, 182, 212, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              {/* Vetor de Fluxo Contínuo Lean estilizado (Kanban / Value Stream / Continuous Flow) */}
              <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(34, 211, 238, 0.4))' }}
              >
                <defs>
                  <linearGradient id="leanFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* 3 Estações do Fluxo Contínuo Lean (Kanban Columns) */}
                <rect x="6" y="9" width="6" height="20" rx="3" fill="url(#leanFlowGrad)" fillOpacity="0.3" stroke="url(#leanFlowGrad)" strokeWidth="1.75" />
                <rect x="16" y="5" width="6" height="28" rx="3" fill="url(#leanFlowGrad)" fillOpacity="0.8" stroke="#22d3ee" strokeWidth="2" />
                <rect x="26" y="9" width="6" height="20" rx="3" fill="url(#leanFlowGrad)" fillOpacity="0.3" stroke="url(#leanFlowGrad)" strokeWidth="1.75" />

                {/* Linhas de conexão e fluxo contínuo */}
                <path d="M12 19H16M22 19H26" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                <circle cx="19" cy="19" r="2.2" fill="#ffffff" />
              </svg>
            </div>
          </div>

          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              margin: '0 0 0.5rem',
            }}
          >
            Fluxo Lean <span style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System</span>
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted, #94a3b8)',
              margin: '0 auto 1.5rem',
              maxWidth: '380px',
              lineHeight: 1.5,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Gestão Integrada de Fluxo Contínuo, Kaizen & Custo Evitado no Gemba
          </p>

          {/* Micro-Badges de Confiança Corporativa */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center' }}>
              <Sparkles size={15} style={{ color: '#22d3ee' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#e2e8f0', letterSpacing: '-0.01em' }}>Sensei IA</span>
              <span style={{ fontSize: '0.625rem', color: '#64748b' }}>Copiloto Integrado</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.06)', borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Workflow size={15} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#e2e8f0', letterSpacing: '-0.01em' }}>Fluxo & Kanban</span>
              <span style={{ fontSize: '0.625rem', color: '#64748b' }}>Metodologia Lean</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center' }}>
              <TrendingUp size={15} style={{ color: '#38bdf8' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#e2e8f0', letterSpacing: '-0.01em' }}>Auditoria ROI</span>
              <span style={{ fontSize: '0.625rem', color: '#64748b' }}>Custo Evitado</span>
            </div>
          </div>
        </div>

        {/* FEEDBACK MESSAGES */}
        {authError && (
          <div
            style={{
              padding: '0.8rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
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
              padding: '0.8rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              color: '#34d399',
              fontSize: '0.8125rem',
              lineHeight: 1.45,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* BOTÃO MICROSOFT SSO OFICIAL */}
        <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div
            onClick={handleMicrosoftSso}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.05rem 1.25rem',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-input, #0d1527)',
              border: '1px solid var(--border-input, rgba(6, 182, 212, 0.35))',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease-in-out',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated, #131d35)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.7)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-input, #0d1527)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Logotipo Oficial Microsoft em moldura nítida */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
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
                <div style={{ marginBottom: '3px' }}>
                  <strong
                    style={{
                      fontSize: '0.95rem',
                      color: '#ffffff',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                    }}
                  >
                    Entrar com Conta Microsoft (SSO)
                  </strong>
                </div>
                <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted, #94a3b8)' }}>
                  Acesso corporativo seguro via Microsoft Entra ID
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                color: '#22d3ee',
                flexShrink: 0,
              }}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </div>
          </div>
        </div>

        {/* Assinatura Corporativa de Desenvolvimento */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            borderRadius: '10px',
            fontSize: '0.8125rem',
            color: 'var(--text-muted, #94a3b8)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <span style={{ color: 'var(--text-dim, #64748b)' }}>Desenvolvido por</span>
          <strong
            style={{
              color: '#f1f5f9',
              fontWeight: 600,
              letterSpacing: '0.01em',
            }}
          >
            Mauricio Grigol
          </strong>
        </div>
      </div>
    </div>
  );
}
