'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Factory,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);

    // Simula o tempo de rede do Supabase Auth (supabase.auth.resetPasswordForEmail)
    setTimeout(() => {
      setIsSubmitting(false);
      setSentEmail(email.trim());
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '25%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Back Link */}
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1.25rem', position: 'relative', zIndex: 10 }}>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#94a3b8',
            fontSize: '0.84375rem',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={16} /> Voltar para o Login
        </Link>
      </div>

      {/* Main Glass Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            }}
          >
            <KeyRound size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Recuperação de Acesso
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Redefina sua senha com segurança via Supabase Auth
          </p>
        </div>

        {/* Modalidades Cobertas */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.75rem 0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
            Atende Todas as Modalidades de Usuários:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '8px', padding: '0.4rem 0.5rem', textAlign: 'center' }}>
              <Crown size={14} color="#facc15" style={{ margin: '0 auto 0.2rem' }} />
              <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#fde047', display: 'block' }}>Gestor Master</span>
            </div>
            <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '8px', padding: '0.4rem 0.5rem', textAlign: 'center' }}>
              <Factory size={14} color="#22d3ee" style={{ margin: '0 auto 0.2rem' }} />
              <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#67e8f9', display: 'block' }}>Gestor de Planta</span>
            </div>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.4rem 0.5rem', textAlign: 'center' }}>
              <Users size={14} color="#34d399" style={{ margin: '0 auto 0.2rem' }} />
              <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#6ee7b7', display: 'block' }}>Agentes Lean</span>
            </div>
          </div>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleRecover} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: '0.4rem' }}>
                Informe seu E-mail Corporativo:
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Mail size={16} color="#94a3b8" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: mauricio.grigol@rafitec.com.br"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                />
              </div>
              <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                Insira o mesmo e-mail associado à sua conta industrial ou de gestão master.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: isSubmitting || !email.trim() ? 0.6 : 1,
                cursor: isSubmitting || !email.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <span>Enviando link de recuperação...</span>
              ) : (
                <>
                  <KeyRound size={16} /> Enviar Link de Redefinição
                </>
              )}
            </button>
          </form>
        ) : (
          /* Estado de Sucesso */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <CheckCircle2 size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>
                Link de Redefinição Disparado!
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                Enviamos as orientações de redefinição de senha para:
                <br />
                <strong style={{ color: '#22d3ee' }}>{sentEmail}</strong>
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '0.85rem',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                Instruções do Supabase Auth:
              </span>
              <ul style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, paddingLeft: '1.15rem', lineHeight: 1.5 }}>
                <li>Abra sua caixa de entrada ou spam.</li>
                <li>Clique no botão ou link transacional seguro.</li>
                <li>Você será direcionado para criar sua nova credencial com criptografia.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link
                href={`/redefinir-senha?email=${encodeURIComponent(sentEmail)}`}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '0.84375rem',
                }}
              >
                <span>Simular / Criar Nova Senha Agora</span>
                <ArrowRight size={15} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.65rem', fontSize: '0.8125rem' }}
              >
                Enviar para outro e-mail
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.78125rem', position: 'relative', zIndex: 10 }}>
        <p style={{ margin: 0 }}>
          FluxoLean 4.0 • Segurança & Criptografia via <strong>Supabase Auth</strong>
        </p>
      </div>
    </div>
  );
}
