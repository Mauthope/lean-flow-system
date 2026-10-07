'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { setStoredData, STORAGE_KEYS } from '@/lib/storage';
import {
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

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
        let authAvatar = profile?.avatar_url;
        let authTenantId = profile?.tenant_id;
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
                authTenantId = authRecord.tenant_id || authTenantId;
                if (!authAvatar && authRecord.avatar_url) {
                  authAvatar = authRecord.avatar_url;
                }
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
          if (!authAvatar && matchedUser.avatarUrl) {
            authAvatar = matchedUser.avatarUrl;
          }
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
          // Atualiza dados locais para refletir status, cargo e foto do banco Supabase
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

        // Se o usuário pertence a uma entidade específica, garante que o tenant ativo seja o dele
        const userTenantId = authTenantId || matchedUser.tenantId;
        if (userTenantId && !matchedUser.isMaster) {
          let targetTenant = dataService.getTenantById(userTenantId);
          if (!targetTenant && isSupabaseConfigured()) {
            try {
              const { data: dbT } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', userTenantId)
                .maybeSingle();

              if (dbT) {
                targetTenant = {
                  id: dbT.id,
                  name: dbT.name,
                  slug: dbT.slug,
                  cnpjOrCode: dbT.cnpj_or_code,
                  plan: dbT.plan || 'enterprise',
                  aiSettings: dbT.ai_settings || {},
                  createdAt: dbT.created_at || new Date().toISOString(),
                };
                const currentTenants = dataService.getTenants();
                const existsIdx = currentTenants.findIndex((t) => t.id === targetTenant!.id);
                if (existsIdx === -1) {
                  currentTenants.push(targetTenant);
                } else {
                  currentTenants[existsIdx] = targetTenant;
                }
                setStoredData(STORAGE_KEYS.TENANTS, currentTenants);
              }
            } catch (tErr) {
              console.warn('[SSO Callback] Falha ao carregar dados da entidade do usuário:', tErr);
            }
          }

          if (targetTenant) {
            dataService.setCurrentTenant(targetTenant);
          }
        }

        // Garante que o perfil no Supabase esteja com status ativo e dados sincronizados
        try {
          await supabase
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
            .eq('id', userId);
        } catch (e) {
          console.warn('[SSO Callback] Falha ao atualizar perfil ativo no Supabase:', e);
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

      {/* Top Corporate Badge - Apenas Nome do Sistema */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #94a3b8)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Shield size={14} color="#06b6d4" /> Sistema Lean Flow
        </span>
      </div>

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
          zIndex: 10,
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
              color: '#020617',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <Shield size={28} color="#020617" />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-heading, #ffffff)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Sistema Lean Flow
          </h1>
          <p
            style={{
              fontSize: '0.84375rem',
              color: 'var(--text-muted, #94a3b8)',
              marginTop: '0.4rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Acesso Corporativo
          </p>
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
        <div style={{ marginBottom: '1.5rem' }}>
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

        {/* Informação Corporativa de Acesso Seguro */}
        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            borderRadius: '10px',
            fontSize: '0.78125rem',
            color: 'var(--text-muted, #94a3b8)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Autenticação corporativa com direcionamento automático por planta fabril. Seus dados e permissões serão vinculados exclusivamente à sua unidade de lotação.
        </div>
      </div>

      {/* Assinatura Corporativa Elegante */}
      <footer
        style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.95rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            fontSize: '0.75rem',
            letterSpacing: '0.015em',
            color: 'var(--text-muted, #94a3b8)',
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
      </footer>
    </div>
  );
}
