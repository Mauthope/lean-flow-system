'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  ArrowLeft,
  Plus,
  Trash2,
  Printer,
  Copy,
  Check,
  AlertOctagon,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SopStep {
  id: string;
  stepNumber: number;
  description: string;
  keyPoint: string;
  safetyReason: string;
}

export default function GeradorSopPage() {
  const [sopCode, setSopCode] = useState('SOP-LIN-042');
  const [sopTitle, setSopTitle] = useState('Troca Rápida de Molde (Setup SMED - Prensa 04)');
  const [authorName, setAuthorName] = useState('Especialista Lean / Manutenção');
  const [revision, setRevision] = useState('01 (Março/2026)');

  const [steps, setSteps] = useState<SopStep[]>([
    {
      id: '1',
      stepNumber: 1,
      description: 'Pré-aquecer o novo ferramental e posicionar carrinhos de apoio na lateral da prensa.',
      keyPoint: 'Atividade externa enquanto a máquina ainda está rodando o lote anterior.',
      safetyReason: 'Evita acidentes com ferramentas soltas e reduz o tempo de parada (Setup Externo).',
    },
    {
      id: '2',
      stepNumber: 2,
      description: 'Desacoplar grampos de fixação pneumáticos e deslizar o molde antigo.',
      keyPoint: 'Usar a chave dinamométrica graduada.',
      safetyReason: 'Garantir despressurização prévia da linha de ar antes do manuseio.',
    },
    {
      id: '3',
      stepNumber: 3,
      description: 'Posicionar o novo molde com auxílio dos pinos guias e engate rápido.',
      keyPoint: 'Alinhamento em 1 único toque através do dispositivo Poka-Yoke.',
      safetyReason: 'Impede travamento do êmbolo da prensa e desalinhamento de matriz.',
    },
  ]);

  const [copied, setCopied] = useState(false);

  const handleAddStep = () => {
    const newStep: SopStep = {
      id: Date.now().toString(),
      stepNumber: steps.length + 1,
      description: '',
      keyPoint: '',
      safetyReason: '',
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    const filtered = steps.filter((s) => s.id !== id);
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
  };

  const handleUpdateStep = (id: string, field: keyof SopStep, val: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleCopySop = () => {
    const text = `📋 PROCEDIMENTO OPERACIONAL PADRÃO (SOP):
Código: ${sopCode} • Revisão: ${revision}
Título: ${sopTitle}
Responsável: ${authorName}

PASSO A PASSO DA OPERAÇÃO:
${steps
  .map(
    (s) =>
      `Passo ${s.stepNumber}: ${s.description}\n  • Ponto Chave (Como fazer): ${s.keyPoint}\n  • Motivo / Segurança: ${s.safetyReason}`
  )
  .join('\n\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Back Button */}
      <Link
        href="/agente/ferramentas"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#22d3ee',
          fontSize: '0.875rem',
          fontWeight: 700,
          textDecoration: 'none',
          width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} /> Voltar para Todas as Ferramentas
      </Link>

      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileCheck size={26} color="#22d3ee" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Gerador de Procedimento Padrão (SOP)
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Padronize as melhores práticas e instruções de trabalho para o operador
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Printer size={14} /> Imprimir / PDF
          </button>
          <button
            type="button"
            onClick={handleCopySop}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar SOP'}
          </button>
        </div>
      </div>

      {/* Main SOP Card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {/* SOP Header Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Código do Documento:</label>
            <input
              type="text"
              className="form-control"
              value={sopCode}
              onChange={(e) => setSopCode(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Título do Procedimento:</label>
            <input
              type="text"
              className="form-control"
              value={sopTitle}
              onChange={(e) => setSopTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Responsável / Elaborador:</label>
            <input
              type="text"
              className="form-control"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>
        </div>

        {/* Steps List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Passo a Passo da Operação Padrão
            </h2>
            <button
              type="button"
              onClick={handleAddStep}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={14} /> Adicionar Passo
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {steps.map((step) => (
              <div
                key={step.id}
                style={{
                  backgroundColor: '#090e1a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.125rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(6, 182, 212, 0.2)',
                      color: '#22d3ee',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                    }}
                  >
                    Passo #{step.stepNumber}
                  </span>

                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      className="btn btn-outline-danger btn-sm"
                      style={{ padding: '0.2rem 0.5rem' }}
                    >
                      <Trash2 size={12} /> Excluir Passo
                    </button>
                  )}
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>1. O que fazer (Ação Principal):</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Descreva a atividade a ser executada pelo operador..."
                    value={step.description}
                    onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                      💡 2. Ponto Chave (Como fazer com excelência):
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Dica técnica, macete, posição..."
                      value={step.keyPoint}
                      onChange={(e) => handleUpdateStep(step.id, 'keyPoint', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#f87171' }}>
                      ⚠️ 3. Motivo & Segurança (Por que fazer assim):
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Evitar prensamento, defeito de solda..."
                      value={step.safetyReason}
                      onChange={(e) => handleUpdateStep(step.id, 'safetyReason', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
