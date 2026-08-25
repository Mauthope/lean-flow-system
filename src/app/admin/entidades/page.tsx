'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEntitiesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
      Carregando painel da fábrica...
    </div>
  );
}
