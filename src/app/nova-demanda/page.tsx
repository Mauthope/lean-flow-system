'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataService } from '@/services/dataService';

export default function NovaDemandaRedirect() {
  const router = useRouter();

  useEffect(() => {
    const tenant = dataService.getCurrentTenant();
    const slug = tenant?.slug || 'nexus-lean';
    router.replace(`/d/${slug}`);
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1329', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Redirecionando para o canal de melhoria contínua da sua empresa...
    </div>
  );
}
