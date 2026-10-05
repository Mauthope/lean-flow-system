'use client';

import React from 'react';
import Link from 'next/link';
import { X, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LeanAction } from '@/lib/types';

interface TreeProjectsModalProps {
  modalData: {
    title: string;
    subtitle: string;
    value: number;
    projects: LeanAction[];
  } | null;
  role?: 'admin' | 'agent';
  onClose: () => void;
}

export function TreeProjectsModal({
  modalData,
  role = 'admin',
  onClose,
}: TreeProjectsModalProps) {
  if (!modalData) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '85vh',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {modalData.title}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78125rem', color: '#94a3b8' }}>
              {modalData.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                Total Auditado
              </div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#10b981',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {formatCurrency(modalData.value)}
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.35rem',
              }}
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {modalData.projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
              Nenhum projeto específico associado diretamente a este nó (dados de demonstração).
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {modalData.projects.map((proj) => {
                const a3Url =
                  role === 'admin'
                    ? `/admin/projetos/${proj.id}/relatorio-a3`
                    : `/agente/projetos/${proj.id}/relatorio-a3`;

                return (
                  <div
                    key={proj.id}
                    className="glow-card"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.71875rem',
                            fontWeight: 700,
                            color: '#22d3ee',
                            backgroundColor: 'rgba(6, 182, 212, 0.15)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          {proj.protocol}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                          {proj.title}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          marginTop: '0.35rem',
                        }}
                      >
                        <span>Setor: {proj.originSectorName || 'Fábrica'}</span>
                        <span>•</span>
                        <span>Agente: {proj.assignedAgentName || 'Lean'}</span>
                        <span>•</span>
                        <span>
                          Homologado:{' '}
                          {proj.masterApproved ? 'Sim (Master)' : 'Concluído'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: '#34d399',
                          fontFamily: 'var(--font-heading)',
                        }}
                      >
                        {formatCurrency(
                          proj.controllershipAudit?.approvedEstimatedCostAvoided ||
                            proj.actualCostAvoided ||
                            proj.estimatedCostAvoided ||
                            0
                        )}
                      </span>

                      <Link
                        href={a3Url}
                        target="_blank"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          color: '#22d3ee',
                          textDecoration: 'none',
                          padding: '0.35rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(6, 182, 212, 0.1)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                        }}
                      >
                        <FileText size={12} />
                        <span>A3</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
