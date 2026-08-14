'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dataService } from '@/services/dataService';
import { LeanWasteCategory, ActionPriority } from '@/lib/types';
import { WASTE_CATEGORIES } from '@/lib/utils';
import {
  Send,
  CheckCircle2,
  Building2,
  User,
  Mail,
  AlertTriangle,
  FileText,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function PublicDemandPage() {
  const router = useRouter();
  const sectors = dataService.getSectors();
  const tenant = dataService.getCurrentTenant();

  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterDepartment, setRequesterDepartment] = useState('');
  const [originSectorId, setOriginSectorId] = useState(sectors[0]?.id || '');
  const [wasteCategory, setWasteCategory] = useState<LeanWasteCategory>('espera');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('media');

  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created = dataService.createPublicDemand({
      tenantId: tenant.id,
      title,
      description,
      wasteCategory,
      originSectorId: originSectorId || sectors[0]?.id || '',
      requesterName,
      requesterEmail,
      requesterDepartment,
      priority,
    });

    setSubmittedProtocol(created.protocol);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#ffffff',
            }}
          >
            LN
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {tenant.name}
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Portal Público de Abertura de Demandas Lean</p>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '0.78125rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} color="#2563eb" />
            <span>Dev: Mauricio Grigol</span>
          </div>

          <Link
            href="/"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#2563eb',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            Acessar Sistema →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '820px', margin: '2.5rem auto', padding: '0 1rem 4rem' }}>
        {submittedProtocol ? (
          /* Success Screen */
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '2px solid #10b981',
              borderRadius: '20px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065f46', marginBottom: '0.5rem' }}>
              Demanda Registrada com Sucesso!
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#475569', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
              Sua sugestão de melhoria foi enviada diretamente para a central de triagem do Supervisor Lean.
            </p>

            {/* Protocol Badge */}
            <div
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem',
                maxWidth: '380px',
                margin: '0 auto 2rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Seu Número de Protocolo:
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#1e3a8a',
                  letterSpacing: '0.05em',
                  marginTop: '0.25rem',
                }}
              >
                {submittedProtocol}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Guarde este número para acompanhar o andamento da sua solicitação.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href={`/protocolo/${submittedProtocol}`}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Acompanhar Status do Protocolo <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => {
                  setSubmittedProtocol(null);
                  setTitle('');
                  setDescription('');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Cadastrar Outra Demanda
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <div className="card" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                Identificação de Oportunidade / Desperdício Lean
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Preencha as informações abaixo para que o supervisor avalie e designe um especialista Lean.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Requester Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">
                    <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Seu Nome Completo:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: João da Silva"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Email / Ramal para Contato:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: joao.silva@empresa.com"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">
                    <Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Setor Onde Ocorre o Problema:
                  </label>
                  <select
                    className="form-select"
                    value={originSectorId}
                    onChange={(e) => setOriginSectorId(e.target.value)}
                    required
                  >
                    {sectors.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} ({sec.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Seu Turno / Linha / Posto:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Turno 1 / Linha de Montagem 02"
                    value={requesterDepartment}
                    onChange={(e) => setRequesterDepartment(e.target.value)}
                  />
                </div>
              </div>

              {/* Waste Category Selection */}
              <div>
                <label className="form-label">
                  Tipo de Desperdício Lean Observado:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.625rem' }}>
                  {Object.entries(WASTE_CATEGORIES).map(([key, cat]) => {
                    const isSelected = wasteCategory === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setWasteCategory(key as LeanWasteCategory)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                          {cat.label}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.3 }}>
                          {cat.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Título Resumido da Demanda:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Tempo excessivo aguardando empilhadeira na prensa 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Descrição Detalhada do Problema / Oportunidade:</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Explique o que acontece, com qual frequência e como isso afeta a produção ou custos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="form-label">Impacto / Nível de Urgência:</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ActionPriority)}
                  style={{ maxWidth: '300px' }}
                >
                  <option value="baixa">Baixa (Melhoria contínua de rotina)</option>
                  <option value="media">Média (Perda de produtividade moderada)</option>
                  <option value="alta">Alta (Gargalo evidente na produção)</option>
                  <option value="critica">Crítica (Risco de parada de linha ou não conformidade grave)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}
                >
                  <Send size={16} /> Enviar Demanda para Triagem
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '1.75rem 2rem',
          backgroundColor: '#ffffff',
          textAlign: 'center',
          marginTop: '3rem',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
          Plataforma de Gestão de Fluxo Lean • Desenvolvido por <strong>Mauricio Grigol</strong> (Consultor Lean & Desenvolvedor Full Stack)
        </p>
      </footer>
    </div>
  );
}
