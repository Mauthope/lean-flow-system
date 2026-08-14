'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { NewActionModal } from '@/components/forms/NewActionModal';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { refreshData } = useAuth();
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar onNewAction={() => setIsNewActionOpen(true)} />
        <main className="content-body">{children}</main>
      </div>

      <NewActionModal
        isOpen={isNewActionOpen}
        onClose={() => setIsNewActionOpen(false)}
        onSuccess={() => refreshData()}
      />
    </div>
  );
}
