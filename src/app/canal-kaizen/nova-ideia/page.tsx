'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dataService } from '@/services/dataService';
import { Sector } from '@/lib/types';
import {
  Lightbulb,
  Camera,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Send,
  Building2,
  User,
  Briefcase,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NovaIdeiaKaizenPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tenantName, setTenantName] = useState('Nossa Empresa');

  // Form fields
  const [authorName, setAuthorName] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [authorRoleTitle, setAuthorRoleTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);

  useEffect(() => {
    const sList = dataService.getSectors();
    setSectors(sList);
    if (sList.length > 0) setSectorId(sList[0].id);

    const curTenant = dataService.getCurrentTenant();
    if (curTenant) setTenantName(curTenant.name);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !sectorId || !authorRoleTitle.trim() || !summary.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const created = dataService.createKaizenIdea({
        authorName: authorName.trim(),
        sectorId,
        authorRoleTitle: authorRoleTitle.trim(),
        summary: summary.trim(),
        photoUrl: photoUrl || undefined,
        photoName: photoName || undefined,
      });

      setSubmittedProtocol(created.protocol);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar ideia. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAuthorName('');
    setAuthorRoleTitle('');
    setSummary('');
    setPhotoUrl('');
    setPhotoName('');
    setSubmittedProtocol(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#060a13',
        backgroundImage: `
          radial-gradient(circle at 15% 15%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.1) 0%, transparent 40%)
        `,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem 4rem',
      }}
    >
      {/* Top Brand Bar */}
      <div style={{ maxWidth: '640px', width: '100%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
            }}
          >
            <Lightbulb size={22} color="#22d3ee" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Canal Kaizen
            </h2>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{tenantName} • Chão de Fábrica</span>
          </div>
        </div>

        <Link
          href="/admin/canal-kaizen"
          style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          Área do Gestor →
        </Link>
      </div>

      {/* Main Container */}
      <div
        className="card"
        style={{
          maxWidth: '640px',
          width: '100%',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.08)',
        }}
      >
        {submittedProtocol ? (
          /* ================= SUCCESS SCREEN ================= */
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10b981',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Check size={38} />
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
              }}
            >
              IDEIA REGISTRADA COM SUCESSO!
            </span>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0.75rem 0 0.5rem', fontFamily: 'var(--font-heading)' }}>
              Obrigado por Fazer a Diferença!
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Sua sugestão de melhoria foi salva automaticamente no sistema e já está disponível para triagem dos líderes e supervisores.
            </p>

            {/* Protocol Badge */}
            <div
              style={{
                backgroundColor: '#090e1a',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                display: 'inline-block',
                marginBottom: '2rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                Protocolo da sua Ideia
              </span>
              <strong style={{ fontSize: '1.35rem', color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                {submittedProtocol}
              </strong>
            </div>

            <div>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                }}
              >
                <PlusIcon /> Cadastrar Outra Ideia
              </button>
            </div>
          </div>
        ) : (
          /* ================= SUBMISSION FORM ================= */
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Envie sua Sugestão de Melhoria Kaizen
              </h1>
              <p style={{ fontSize: '0.84375rem', color: '#94a3b8', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Viu um problema no posto de trabalho ou tem uma ideia para economizar tempo, material ou evitar acidentes? Registre abaixo!
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Nome Completo */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={15} color="#22d3ee" /> Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silveira"
                  className="form-control"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', padding: '0.75rem 1rem' }}
                />
              </div>

              {/* Setor & Cargo em Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={15} color="#22d3ee" /> Setor da Melhoria *
                  </label>
                  <select
                    required
                    className="form-control"
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', padding: '0.75rem 1rem' }}
                  >
                    {sectors.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Briefcase size={15} color="#22d3ee" /> Seu Cargo na Fábrica *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Operador de Máquina / Auxiliar"
                    className="form-control"
                    value={authorRoleTitle}
                    onChange={(e) => setAuthorRoleTitle(e.target.value)}
                    style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', padding: '0.75rem 1rem' }}
                  />
                </div>
              </div>

              {/* Resumo da Ideia */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lightbulb size={15} color="#fbbf24" /> Resumo da Ideia / Proposta de Melhoria *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva o que está acontecendo hoje e como a sua sugestão resolve ou melhora a operação..."
                  className="form-control"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  style={{ backgroundColor: '#090e1a', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', padding: '0.75rem 1rem', fontSize: '0.9rem', lineHeight: 1.5 }}
                />
              </div>

              {/* Foto da Ideia / Posto de Trabalho */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Camera size={15} color="#34d399" /> Foto do Problema ou da Ideia (Opcional)
                </label>

                {photoUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      backgroundColor: '#090e1a',
                      padding: '0.5rem',
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt="Preview da Ideia"
                      style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0 0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                        {photoName || 'Foto anexada'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoUrl('');
                          setPhotoName('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Remover Foto ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.75rem',
                      borderRadius: '12px',
                      backgroundColor: '#090e1a',
                      border: '2px dashed rgba(255, 255, 255, 0.15)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = '#22d3ee')}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                  >
                    <UploadCloud size={28} color="#22d3ee" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#f8fafc' }}>
                      Toque para tirar foto ou selecionar da galeria
                    </span>
                    <span style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      PNG, JPG ou JPEG (máx. 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              {/* Automatic Date Notice */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.725rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>📅 Data do cadastro: <strong>gravada automaticamente</strong> no envio.</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>● Sistema Online</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  padding: '0.875rem',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}
              >
                <Send size={18} />
                <span>{submitting ? 'Enviando...' : 'Enviar Ideia para Triagem'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
