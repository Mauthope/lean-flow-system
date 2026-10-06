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
    const tenant = dataService.getCurrentTenant();
    const user = dataService.getCurrentUser();
    const users = dataService.getUsers();
    const agents = dataService.getAgents();
    const viewers = dataService.getViewers();
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

    // Sincronização em segundo plano com authorized_users do Supabase
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session?.user) return;
        try {
          const { data: dbUsers, error } = await supabase
            .from('authorized_users')
            .select('*');

          if (!error && dbUsers && dbUsers.length > 0) {
            const currentUsers = dataService.getUsers();
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
              setAllUsers(filteredUsers);
              setAllAgents(dataService.getAgents());
              setAllViewers(dataService.getViewers());

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
        } catch (err) {
          console.warn('[AuthContext] Sincronização em segundo plano não pôde ser completada:', err);
        }
      });
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession, dataVersion]);

  const loginAs = (userIdOrEmail: string) => {
    const user = dataService.getUserByIdOrEmail(userIdOrEmail);
    if (user) {
      dataService.setCurrentUser(user);
      setCurrentUser(user);
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

      // Sincroniza o usuário se o atual não pertencer à nova entidade
      const usersInTenant = dataService.getUsers(tenantId);
      const adminInTenant = usersInTenant.find((u) => u.role === 'admin') || usersInTenant[0];
      if (adminInTenant && currentUser?.tenantId !== tenantId) {
        dataService.setCurrentUser(adminInTenant);
        setCurrentUser(adminInTenant);
      }
      setDataVersion((v) => v + 1);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[SecOps Logout] Falha ao deslogar do Supabase:', err);
    }

    if (typeof window !== 'undefined') {
      // SecOps: Expurgar credenciais e tokens da sessão ativa.
      // Os dados operacionais da fábrica (ações, setores, usuários, TPM) permanecem preservados.
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem('lean_flow_auth_token');
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

    setCurrentUser(null);
    setDataVersion((v) => v + 1);
  };

  const refreshData = () => {
    setDataVersion((v) => v + 1);
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
