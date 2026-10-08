'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { NewActionModal } from '@/components/forms/NewActionModal';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, isLoading, refreshData } = useAuth();
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/login');
    }
  }, [isLoading, currentUser, router]);

  if (!isLoading && !currentUser) {
    return null;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar onNewAction={() => setIsNewActionOpen(true)} />
        <main className="content-body">{children}</main>
        <MobileBottomNav />
      </div>

      <NewActionModal
        isOpen={isNewActionOpen}
        onClose={() => setIsNewActionOpen(false)}
        onSuccess={() => refreshData()}
      />
    </div>
  );
}
