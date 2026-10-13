'use client';

import React from 'react';

export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando módulo..."
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '40vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        padding: '2rem',
      }}
    >
      {/* Laser Flow Top Line */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #06b6d4, #14b8a6, #10b981)',
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.95), 0 0 28px rgba(20, 184, 166, 0.7)',
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        <div
          className="animate-laser-flow"
          style={{
            width: '40%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
          }}
        />
      </div>

      {/* Subtle Pulsing Center Indicator */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem',
          opacity: 0.85,
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            border: '2px solid rgba(6, 182, 212, 0.25)',
            borderTopColor: '#22d3ee',
            animation: 'spin 0.75s linear infinite',
            boxShadow: '0 0 18px rgba(6, 182, 212, 0.2)',
          }}
        />
        <span
          style={{
            fontSize: '0.725rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748b',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Carregando Fluxo Lean...
        </span>
      </div>
    </div>
  );
}
