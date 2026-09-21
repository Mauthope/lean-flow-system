'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'var(--bg-modal-overlay, rgba(2, 6, 23, 0.82))',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content-surface"
        style={{
          backgroundColor: 'var(--bg-modal, #0d1527)',
          border: '1px solid var(--border-modal, rgba(255, 255, 255, 0.12))',
          borderRadius: '16px',
          width: '100%',
          maxWidth: maxWidth === '4xl' ? '1000px' : maxWidth === '2xl' ? '850px' : maxWidth === 'lg' ? '680px' : '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.15)',
          animation: 'fadeIn 0.2s ease-out',
          overflow: 'hidden',
          color: 'var(--text-primary, #f8fafc)',
        }}
      >
        {/* Header */}
        <div
          className="modal-header-surface"
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface, #0f172a)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-heading, #ffffff)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            style={{
              background: 'var(--bg-surface-elevated, rgba(255, 255, 255, 0.06))',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              cursor: 'pointer',
              color: 'var(--text-muted, #94a3b8)',
              padding: '0.375rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--border-strong, rgba(255, 255, 255, 0.15))';
              e.currentTarget.style.color = 'var(--text-primary, #ffffff)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated, rgba(255, 255, 255, 0.06))';
              e.currentTarget.style.color = 'var(--text-muted, #94a3b8)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: 'var(--bg-modal, #0d1527)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
