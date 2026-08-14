'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SopStep {
  id: string;
  stepNumber: number;
  description: string;
  keyPoint: string;
  safetyNote: string;
}

export default function GeradorSopPage() {
  const [sopTitle, setSopTitle] = useState('Troca Rápida de Matriz Prensa 04 (SMED)');
  const [sopCode, setSopCode] = useState('SOP-ENG-004');
  const [authorName, setAuthorName] = useState('Fernanda Lima');
  const [steps, setSteps] = useState<SopStep[]>([
    {
      id: 'step_1',
      stepNumber: 1,
      description: 'Buscar e posicionar a nova ferramenta ao lado da máquina enquanto a anterior finaliza.',
      keyPoint: 'Operação Externa (com máquina ligada)',
      safetyNote: 'Usar carrinho hidráulico de transporte',
    },
    {
      id: 'step_2',
      stepNumber: 2,
      description: 'Acionar clamp hidráulico para desprendimento rápido.',
      keyPoint: 'Eliminados parafusos manuais',
      safetyNote: 'Confirmar pressão no manômetro (180 bar)',
    },
    {
      id: 'step_3',
      stepNumber: 3,
      description: 'Deslizar matriz sobre esteira de esferas e travar batentes de segurança.',
      keyPoint: 'Tempo meta: 90 segundos',
      safetyNote: 'Manter mãos fora do ponto de prensagem',
    },
  ]);
  const [copied, setCopied] = useState(false);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        id: `step_${Date.now()}`,
        stepNumber: steps.length + 1,
        description: '',
        keyPoint: '',
        safetyNote: '',
      },
    ]);
  };

  const handleRemoveStep = (id: string) => {
    const filtered = steps.filter((s) => s.id !== id);
    const renumbered = filtered.map((s, index) => ({ ...s, stepNumber: index + 1 }));
    setSteps(renumbered);
  };

  const handleStepChange = (id: string, field: keyof SopStep, value: string) => {
    setSteps(
      steps.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const handleCopySop = () => {
    let text = `📋 PROCEDIMENTO OPERACIONAL PADRÃO (SOP):
Código: ${sopCode} | Título: ${sopTitle}
Elaborador: ${authorName}

ETAPAS DO PROCESSO:
`;
    steps.forEach((s) => {
      text += `\nPasso ${s.stepNumber}: ${s.description}\n  • Ponto Chave: ${s.keyPoint || '—'}\n  • Segurança: ${s.safetyNote || '—'}\n`;
    });

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
          color: '#2563eb',
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
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#ecfeff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileCheck size={26} color="#0891b2" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Gerador de Procedimento Padrão (SOP)
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
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
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SOP Header Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Código do Documento:</label>
            <input
              type="text"
              className="form-control"
              value={sopCode}
              onChange={(e) => setSopCode(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Título do Procedimento:</label>
            <input
              type="text"
              className="form-control"
              value={sopTitle}
              onChange={(e) => setSopTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Responsável / Elaborador:</label>
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
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
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
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
                      backgroundColor: '#0891b2',
                      color: '#ffffff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                    }}
                  >
                    Passo {step.stepNumber}
                  </span>

                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      title="Excluir este passo"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78125rem' }}>
                    O que fazer (Ação Principal):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Descreva a instrução clara para o operador..."
                    value={step.description}
                    onChange={(e) => handleStepChange(step.id, 'description', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#0891b2' }}>
                      🔑 Ponto Chave (Como fazer):
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Sentido horário..."
                      value={step.keyPoint}
                      onChange={(e) => handleStepChange(step.id, 'keyPoint', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                      🛡️ Ponto de Segurança (EPI / Atenção):
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Usar luva nitrílica..."
                      value={step.safetyNote}
                      onChange={(e) => handleStepChange(step.id, 'safetyNote', e.target.value)}
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
