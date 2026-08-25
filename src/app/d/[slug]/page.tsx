'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dataService } from '@/services/dataService';
import { Tenant, Sector, LeanWasteCategory } from '@/lib/types';
import { WASTE_CATEGORIES } from '@/lib/utils';
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Send,
  Zap,
} from 'lucide-react';

export default function TenantPublicDemandPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originSectorId, setOriginSectorId] = useState('');
  const [wasteCategory, setWasteCategory] = useState<LeanWasteCategory>('espera');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterDepartment, setRequesterDepartment] = useState('');

  // Result state
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      const foundTenant = dataService.getTenantBySlug(slug);
      if (foundTenant) {
        setTenant(foundTenant);
        const tenantSectors = dataService.getSectors(foundTenant.id);
        setSectors(tenantSectors);
        if (tenantSectors.length > 0) {
          setOriginSectorId(tenantSectors[0].id);
        }
      }
      setLoading(false);
    }
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    if (!title.trim() || !description.trim()) {
      alert('Por favor, preencha o título e a descrição da sugestão.');
      return;
    }

    setIsSubmitting(true);

    const action = dataService.createPublicDemand({
      tenantId: tenant.id,
      title: title.trim(),
      description: description.trim(),
      wasteCategory,
      originSectorId,
      requesterName: requesterName.trim() || 'Colaborador do Posto',
      requesterEmail: requesterEmail.trim() || undefined,
      requesterDepartment: requesterDepartment.trim() || undefined,
    });

    setIsSubmitting(false);
    setSubmittedProtocol(action.protocol);
  };

  const handleCopyProtocol = () => {
    if (submittedProtocol && typeof window !== 'undefined') {
      navigator.clipboard.writeText(submittedProtocol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Carregando formulário exclusivo da entidade...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', color: '#ffffff' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff', padding: '2.5rem', borderRadius: '20px' }}>
          <AlertTriangle size={48} color="#fbbf24" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Empresa / Entidade Não Encontrada</h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.5rem 0 1.5rem' }}>
            Não localizamos nenhuma entidade registrada com o link &quot;<strong>{slug}</strong>&quot;.
          </p>
          <Link href="/" className="btn btn-primary btn-sm">
            Ir para Página Principal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#060a13',
        backgroundImage: `
          radial-gradient(at 5% 5%, rgba(6, 182, 212, 0.09) 0px, transparent 40%),
          radial-gradient(at 95% 95%, rgba(139, 92, 246, 0.09) 0px, transparent 40%),
          radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.04) 0px, transparent 60%)
        `,
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(10, 15, 29, 0.8)',
          backdropFilter: 'blur(16px)',
          padding: '1.25rem 2rem',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#06b6d4',
                color: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              }}
            >
              {tenant.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#22d3ee', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Canal Kaizen Exclusivo
              </span>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {tenant.name}
              </h1>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Código: <strong style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{tenant.cnpjOrCode}</strong>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '850px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {submittedProtocol ? (
          /* SUCCESS STATE */
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#ffffff',
              borderRadius: '24px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demanda Registrada com Sucesso!
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 0.75rem', fontFamily: 'var(--font-heading)' }}>
              Sua sugestão já está na fila de triagem da {tenant.name}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '520px', margin: '0 auto 2rem' }}>
              O supervisor da sua fábrica avaliará o potencial de melhoria, classificará a prioridade e atribuirá a um agente Lean para execução.
            </p>

            {/* Protocol Box */}
            <div
              style={{
                backgroundColor: '#090e1a',
                border: '1px dashed rgba(6, 182, 212, 0.4)',
                borderRadius: '16px',
                padding: '1.25rem',
                maxWidth: '420px',
                margin: '0 auto 2rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                Número do Protocolo Oficial:
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'var(--font-mono)', margin: '0.35rem 0' }}>
                {submittedProtocol}
              </div>
              <button
                type="button"
                onClick={handleCopyProtocol}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
              >
                {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                <span>{copied ? 'Copiado!' : 'Copiar Número do Protocolo'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/protocolo/${submittedProtocol}`} className="btn btn-primary">
                Acompanhar Status deste Protocolo
              </Link>
              <button
                onClick={() => {
                  setSubmittedProtocol(null);
                  setTitle('');
                  setDescription('');
                }}
                className="btn btn-secondary"
              >
                Cadastrar Outra Sugestão
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    color: '#22d3ee',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}
                >
                  CANAL DIRETO DE CHÃO DE FÁBRICA
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0', fontFamily: 'var(--font-heading)' }}>
                Registrar Sugestão de Melhoria / Problema (Kaizen)
              </h2>
              <p style={{ fontSize: '0.84375rem', color: '#94a3b8', margin: 0 }}>
                Identificou uma perda de tempo, espera, defeito ou oportunidade de melhoria no seu posto? Preencha abaixo:
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Sector Selection (Filtered to Tenant) */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                  Qual é o Setor / Posto de Trabalho envolvido? *
                </label>
                <select
                  className="form-select"
                  value={originSectorId}
                  onChange={(e) => setOriginSectorId(e.target.value)}
                  required
                >
                  {sectors.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      🏢 {sec.name} ({sec.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                  Título Resumido da Oportunidade *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Tempo excessivo para encontrar ferramentas de corte na bancada 02"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Waste Category Hint */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                  Tipo de Desperdício Observado (Opcional):
                </label>
                <select
                  className="form-select"
                  value={wasteCategory}
                  onChange={(e) => setWasteCategory(e.target.value as LeanWasteCategory)}
                >
                  {Object.entries(WASTE_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      ⚡ {cat.label} — {cat.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#cbd5e1' }}>
                  Descrição Detalhada do Problema & Ideia de Solução *
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Descreva o que acontece no posto, quanto tempo é perdido, quais materiais são afetados e sua sugestão de melhoria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Requester Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingTop: '0.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Seu Nome / Matrícula:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: João Silva (Operador)"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>E-mail ou WhatsApp (para retorno):</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="joao@empresa.com ou (11) 99999-9999"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Send size={18} />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Demanda para a Supervisão Lean'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.78125rem' }}>
        Plataforma LeanFlow • Licenciado para <strong style={{ color: '#94a3b8' }}>{tenant.name}</strong> • Arquiteto: Mauricio Grigol
      </footer>
    </div>
  );
}
