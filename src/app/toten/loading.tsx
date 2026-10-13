'use client';

import React from 'react';

export default function TotenLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando Toten..."
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#060a13',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Laser Top Line */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #06b6d4, #14b8a6, #10b981)',
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.95)',
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

      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          border: '2px solid rgba(6, 182, 212, 0.25)',
          borderTopColor: '#22d3ee',
          animation: 'spin 0.75s linear infinite',
          boxShadow: '0 0 24px rgba(6, 182, 212, 0.25)',
          marginBottom: '1rem',
        }}
      />

      <span
        style={{
          fontSize: '0.8125rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#94a3b8',
        }}
      >
        Inicializando Toten Industrial...
      </span>
    </div>
  );
}
