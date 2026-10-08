'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Tenant, UserRole } from '@/lib/types';
import { dataService } from '@/services/dataService';
import { initializeLocalStorage, STORAGE_KEYS, setStoredData } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface AuthContextType {
  currentUser: User | null;
  currentTenant: Tenant | null;
  allUsers: User[];
  allAgents: User[];
  allViewers: User[];
  allTenants: Tenant[];
  isLoading: boolean;
  loginAs: (userId: string) => void;
  switchUser: (userId: string) => void;
  switchTenant: (tenantId: string) => void;
  logout: () => void;
  refreshData: () => void;
  dataVersion: number;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAgents, setAllAgents] = useState<User[]>([]);
  const [allViewers, setAllViewers] = useState<User[]>([]);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const loadSession = useCallback(() => {
    initializeLocalStorage();
    let tenant = dataService.getCurrentTenant();
    const user = dataService.getCurrentUser();
    if (user && !user.isMaster && user.tenantId && tenant.id !== user.tenantId) {
      const userTenant = dataService.getTenantById(user.tenantId);
      if (userTenant) {
        dataService.setCurrentTenant(userTenant);
        tenant = userTenant;
      }
    }
    const users = dataService.getUsers(tenant?.id);
    const agents = dataService.getAgents(tenant?.id);
    const viewers = dataService.getViewers(tenant?.id);
    const tenants = dataService.getTenants();

    setCurrentTenant(tenant);
    setCurrentUser(user);
    setAllUsers(users);
    setAllAgents(agents);
    setAllViewers(viewers);
    setAllTenants(tenants);

    if (typeof window !== 'undefined') {
      const savedCollapsed = localStorage.getItem('leanflow_sidebar_collapsed');
      if (savedCollapsed === 'true') {
        setIsSidebarCollapsed(true);
      }
    }

    // Sincronização em segundo plano com Supabase
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session?.user) return;
        try {
          const userEmail = (session.user.email || '').trim().toLowerCase();
          const isMasterUser =
            userEmail === 'mauricio.grigol@rafitec.com.br' ||
            userEmail === 'master@rafitec.com.br';

          // 1. Sincronização em segundo plano das entidades (public.tenants) do Supabase
          const { data: dbTenants, error: tenantErr } = await supabase
            .from('tenants')
            .select('*');

          const currentTenants = dataService.getTenants();
          const tenantMap = new Map(currentTenants.map((t) => [t.id, t]));

          // Se for usuário Master, auto-provisiona no Supabase quaisquer entidades locais pendentes (ex: Propex)
          if (isMasterUser && !tenantErr) {
            const dbTenantIds = new Set((dbTenants || []).map((t: any) => t.id));
            const missingLocalTenants = currentTenants.filter((t) => !dbTenantIds.has(t.id));

            for (const localT of missingLocalTenants) {
              try {
                // Upsert da entidade
                await supabase.from('tenants').upsert(
                  {
                    id: localT.id,
                    name: localT.name,
                    slug: localT.slug,
                    cnpj_or_code: localT.cnpjOrCode || 'Não informado',
                    plan: localT.plan || 'enterprise',
                    ai_settings: localT.aiSettings || {
                      controladoriaName: 'Gerência de Controladoria & Custos',
                      controladoriaEmail: 'controladoria@rafitec.com.br',
                      autoNotifyControladoria: true,
                    },
                    is_active: true,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'id' }
                );

                // Upsert dos setores padrão
                const localSectors = dataService.getSectors(localT.id);
                if (localSectors.length > 0) {
                  await supabase.from('sectors').upsert(
                    localSectors.map((sec) => ({
                      id: sec.id,
                      tenant_id: localT.id,
                      name: sec.name,
                      code: sec.code,
                      description: sec.description || '',
                      color: sec.color,
                      requires_control_document: !!sec.requiresTrackingDoc,
                      control_document_name: sec.trackingDocLabel || null,
                      updated_at: new Date().toISOString(),
                    })),
                    { onConflict: 'id' }
                  );
                }

                // Upsert dos gestores locais desta entidade
                const localManagers = dataService.getTenantManagers(localT.id);
                for (const m of localManagers) {
                  if (m.email) {
                    await supabase.from('authorized_users').upsert(
                      {
                        tenant_id: localT.id,
                        email: m.email.trim().toLowerCase(),
                        name: m.name,
                        role: 'admin',
                        job_title: m.jobTitle || 'Gestor & Supervisor Lean da Unidade',
                        avatar_url: m.avatarUrl,
                        all_sectors: true,
                        active: m.active !== false,
                        updated_at: new Date().toISOString(),
                      },
                      { onConflict: 'email' }
                    );
                  }
                }
              } catch (provErr) {
                console.warn('[AuthContext] Falha no auto-provisionamento de entidade:', provErr);
              }
            }
          }

          if (!tenantErr && dbTenants && dbTenants.length > 0) {
            let tenantsChanged = false;
            dbTenants.forEach((dbT: any) => {
              const existing = tenantMap.get(dbT.id);
              if (!existing) {
                currentTenants.push({
                  id: dbT.id,
                  name: dbT.name,
                  slug: dbT.slug,
                  cnpjOrCode: dbT.cnpj_or_code,
                  plan: dbT.plan || 'enterprise',
                  aiSettings: dbT.ai_settings || {},
                  createdAt: dbT.created_at || new Date().toISOString(),
                });
                tenantsChanged = true;
              } else if (
                existing.name !== dbT.name ||
                existing.slug !== dbT.slug ||
                existing.cnpjOrCode !== dbT.cnpj_or_code
              ) {
                existing.name = dbT.name;
                existing.slug = dbT.slug;
                existing.cnpjOrCode = dbT.cnpj_or_code;
                existing.plan = dbT.plan || existing.plan;
                existing.aiSettings = dbT.ai_settings || existing.aiSettings;
                tenantsChanged = true;
              }
            });

            if (tenantsChanged) {
              setStoredData(STORAGE_KEYS.TENANTS, currentTenants);
              setAllTenants([...currentTenants]);
            }
          }

          // 2. Sincronização dos usuários autorizados (public.authorized_users)
          const { data: dbUsers, error } = await supabase
            .from('authorized_users')
            .select('*');

          if (!error && dbUsers && dbUsers.length > 0) {
            const currentUsers = dataService.getUsers('all');
            let changed = false;

            const authEmails = new Set(
              dbUsers.map((dbU: any) => (dbU.email || '').trim().toLowerCase())
            );
            authEmails.add('mauricio.grigol@rafitec.com.br');

            // Remove usuários locais que foram excluídos da base autorizada
            const filteredUsers = currentUsers.filter((u) =>
              authEmails.has(u.email.toLowerCase())
            );
            if (filteredUsers.length !== currentUsers.length) {
              changed = true;
            }

            dbUsers.forEach((dbU: any) => {
              const cleanDbEmail = (dbU.email || '').trim().toLowerCase();
              if (!cleanDbEmail) return;

              const existingIdx = filteredUsers.findIndex(
                (u) => u.email.toLowerCase() === cleanDbEmail
              );

              if (existingIdx === -1) {
                filteredUsers.push({
                  id: dbU.id || `usr_supa_${cleanDbEmail.replace(/[^a-z0-9]/g, '_')}`,
                  tenantId: dbU.tenant_id || tenant.id,
                  name: dbU.name || cleanDbEmail.split('@')[0],
                  email: cleanDbEmail,
                  role: dbU.role || 'agent',
                  jobTitle: dbU.job_title || 'Agente de Melhoria Contínua',
                  avatarUrl: dbU.avatar_url,
                  active: dbU.active !== false,
                  isMaster: dbU.role === 'admin' && cleanDbEmail === 'mauricio.grigol@rafitec.com.br',
                  createdAt: dbU.created_at || new Date().toISOString(),
                });
                changed = true;
              } else {
                const curr = filteredUsers[existingIdx];
                if (
                  curr.active !== dbU.active ||
                  curr.role !== dbU.role ||
                  (dbU.name && curr.name !== dbU.name) ||
                  (dbU.job_title && curr.jobTitle !== dbU.job_title) ||
                  (dbU.avatar_url && curr.avatarUrl !== dbU.avatar_url)
                ) {
                  filteredUsers[existingIdx] = {
                    ...curr,
                    active: dbU.active,
                    role: dbU.role,
                    name: dbU.name || curr.name,
                    jobTitle: dbU.job_title || curr.jobTitle,
                    avatarUrl: dbU.avatar_url || curr.avatarUrl,
                  };
                  changed = true;
                }
              }
            });

            if (changed) {
              setStoredData(STORAGE_KEYS.USERS, filteredUsers);
              setAllUsers(dataService.getUsers(tenant.id));
              setAllAgents(dataService.getAgents(tenant.id));
              setAllViewers(dataService.getViewers(tenant.id));

              const activeUsr = dataService.getCurrentUser();
              if (activeUsr) {
                const refreshed = filteredUsers.find((u) => u.email.toLowerCase() === activeUsr.email.toLowerCase());
                if (refreshed && (refreshed.avatarUrl !== activeUsr.avatarUrl || refreshed.name !== activeUsr.name)) {
                  dataService.setCurrentUser(refreshed);
                  setCurrentUser(refreshed);
                }
              }
            }
          }

          // 3. Sincronização bidirecional de setores, ações e ideias Kaizen (Supabase PostgreSQL)
          await dataService.syncAllFromCloud();
          if (tenant) {
            setAllUsers(dataService.getUsers(tenant.id));
            setAllAgents(dataService.getAgents(tenant.id));
            setAllViewers(dataService.getViewers(tenant.id));
          }
          setDataVersion((v) => v + 1);
        } catch (err) {
          console.warn('[AuthContext] Sincronização em segundo plano não pôde ser completada:', err);
        }
      });
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const loginAs = (userIdOrEmail: string) => {
    const user = dataService.getUserByIdOrEmail(userIdOrEmail);
    if (user) {
      dataService.setCurrentUser(user);
      setCurrentUser(user);
      if (!user.isMaster && user.tenantId) {
        const userTenant = dataService.getTenantById(user.tenantId);
        if (userTenant) {
          dataService.setCurrentTenant(userTenant);
          setCurrentTenant(userTenant);
          setAllUsers(dataService.getUsers(userTenant.id));
          setAllAgents(dataService.getAgents(userTenant.id));
          setAllViewers(dataService.getViewers(userTenant.id));
        }
      }
      setDataVersion((v) => v + 1);
    }
  };

  const switchUser = (userId: string) => {
    loginAs(userId);
  };

  const switchTenant = (tenantId: string) => {
    const tenant = dataService.getTenantById(tenantId);
    if (tenant) {
      dataService.setCurrentTenant(tenant);
      setCurrentTenant(tenant);
      setAllUsers(dataService.getUsers(tenant.id));
      setAllAgents(dataService.getAgents(tenant.id));
      setAllViewers(dataService.getViewers(tenant.id));
      setDataVersion((v) => v + 1);

      if (isSupabaseConfigured()) {
        dataService.syncAllFromCloud(tenantId).then(() => {
          setAllUsers(dataService.getUsers(tenant.id));
          setAllAgents(dataService.getAgents(tenant.id));
          setAllViewers(dataService.getViewers(tenant.id));
          setDataVersion((v) => v + 1);
        }).catch((err) => console.warn('[AuthContext] Erro ao sincronizar novo tenant:', err));
      }
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (err) {
      console.warn('[SecOps Logout] Falha ao deslogar do Supabase:', err);
    }

    setCurrentUser(null);
    setDataVersion((v) => v + 1);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem('lean_flow_auth_token');
        // Expurgar atomicamente qualquer token de autenticacao do Supabase
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('sb-') && k.endsWith('-auth-token')) {
            localStorage.removeItem(k);
          }
        });
        sessionStorage.clear();
        // Remove apenas caches efêmeros de sessão de IA
        const aiSessionKeys = Object.keys(localStorage).filter(
          (k) => k.startsWith('sensei_session_') || k.startsWith('gemini_session_')
        );
        aiSessionKeys.forEach((k) => localStorage.removeItem(k));
      } catch {
        // continua
      }
      window.location.href = '/login';
    }
  };

  const refreshData = () => {
    if (isSupabaseConfigured()) {
      dataService.syncAllFromCloud(currentTenant?.id).then(() => {
        if (currentTenant) {
          setAllUsers(dataService.getUsers(currentTenant.id));
          setAllAgents(dataService.getAgents(currentTenant.id));
          setAllViewers(dataService.getViewers(currentTenant.id));
        }
        setDataVersion((v) => v + 1);
      }).catch((err) => {
        console.warn('[AuthContext] Falha no refreshData cloud:', err);
        setDataVersion((v) => v + 1);
      });
    } else {
      setDataVersion((v) => v + 1);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('leanflow_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTenant,
        allUsers,
        allAgents,
        allViewers,
        allTenants,
        isLoading,
        loginAs,
        switchUser,
        switchTenant,
        logout,
        refreshData,
        dataVersion,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
