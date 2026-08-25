'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { dataService } from '@/services/dataService';
import { LeanAction } from '@/lib/types';
import { RelatorioA3View } from '@/components/pdca/RelatorioA3View';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AgenteRelatorioA3Page() {
  const params = useParams();
  const projectId = params.id as string;
  const [action, setAction] = useState<LeanAction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      let found = dataService.getActionById(projectId);
      if (!found) {
        found = dataService.getActionByProtocol(projectId);
      }
      if (found) {
        setAction(found);
      }
      setLoading(false);
    }
  }, [projectId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Carregando Relatório A3 PDCA...</p>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '3rem auto' }}>
        <AlertTriangle size={40} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Projeto Não Encontrado
        </h3>
        <Link href="/agente/kanban" className="btn btn-primary btn-sm">
          <ArrowLeft size={16} /> Voltar ao Kanban
        </Link>
      </div>
    );
  }

  return <RelatorioA3View action={action} />;
}
