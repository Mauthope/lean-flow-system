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
  isLoading: boolean;
  loginAs: (userId: string) => void;
  switchUser: (userId: string) => void;
  logout: () => void;
  refreshData: () => void;
  dataVersion: number;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAgents, setAllAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadSession = useCallback(() => {
    initializeLocalStorage();
    const tenant = dataService.getCurrentTenant();
    const user = dataService.getCurrentUser();
    const users = dataService.getUsers();
    const agents = dataService.getAgents();

    setCurrentTenant(tenant);
    setCurrentUser(user);
    setAllUsers(users);
    setAllAgents(agents);
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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTenant,
        allUsers,
        allAgents,
        isLoading,
        loginAs,
        switchUser,
        logout,
        refreshData,
        dataVersion,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
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
