'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Tenant, UserRole } from '@/lib/types';
import { dataService } from '@/services/dataService';
import { initializeLocalStorage } from '@/lib/storage';

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

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession, dataVersion]);

  const loginAs = (userId: string) => {
    const user = dataService.getUserById(userId);
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

  const logout = () => {
    // Default fallback to first user or keep logged out
    const users = dataService.getUsers();
    if (users.length > 0) {
      dataService.setCurrentUser(users[0]);
      setCurrentUser(users[0]);
    }
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
