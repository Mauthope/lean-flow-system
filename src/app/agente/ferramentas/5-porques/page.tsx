'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ArrowLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

export default function CincoPorquesPage() {
  const [problemStatement, setProblemStatement] = useState('Parada imprevista da Máquina Prensa 04 durante o turno.');
  const [why1, setWhy1] = useState('O sensor de proximidade travou e acionou a parada de emergência.');
  const [why2, setWhy2] = useState('Havia acúmulo excessivo de cavacos de metal cobrindo a lente ótica.');
  const [why3, setWhy3] = useState('A proteção de borracha sanfonada estava ressecada e rasgou.');
  const [why4, setWhy4] = useState('A troca da vedação de borracha não constava no plano de manutenção preventiva.');
  const [why5, setWhy5] = useState('Falta de procedimento padrão (SOP) e catálogo de desgaste de consumíveis de borracha.');
  const [countermeasure, setCountermeasure] = useState(
    '1. Trocar a vedação imediatamente.\n2. Incluir a inspeção de vedações na rotina de Manutenção Autônoma (TPM 5S) semanal.'
  );
  const [copied, setCopied] = useState(false);

  const handleCopyAnalysis = () => {
    const text = `🔍 ANÁLISE DE CAUSA RAIZ (5 PORQUÊS):
• Problema: ${problemStatement}
1º Por quê? ${why1}
2º Por quê? ${why2}
3º Por quê? ${why3}
4º Por quê? ${why4}
5º Por quê? (Causa Raiz): ${why5}

🛡️ CONTRAMEDIDA / PADRONIZAÇÃO:
${countermeasure}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setProblemStatement('');
    setWhy1('');
    setWhy2('');
    setWhy3('');
    setWhy4('');
    setWhy5('');
    setCountermeasure('');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
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
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HelpCircle size={26} color="#c084fc" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Investigação dos 5 Porquês
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Identifique a causa raiz de anomalias no chão de fábrica e elimine a reincidência
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RotateCcw size={14} /> Limpar Campos
        </button>
      </div>

      {/* Main Form */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {/* Problem Statement */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            Descreva o Problema / Efeito Observado:
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: Peça apresentou trinca após o teste de tração..."
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            style={{ fontSize: '0.9375rem', fontWeight: 600 }}
          />
        </div>

        {/* 5 Whys Chain */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { num: 1, val: why1, set: setWhy1, label: '1º Por quê isso ocorreu?' },
            { num: 2, val: why2, set: setWhy2, label: '2º Por quê?' },
            { num: 3, val: why3, set: setWhy3, label: '3º Por quê?' },
            { num: 4, val: why4, set: setWhy4, label: '4º Por quê?' },
            { num: 5, val: why5, set: setWhy5, label: '5º Por quê? (Causa Raiz Fundamental)' },
          ].map((item) => (
            <div
              key={item.num}
              style={{
                backgroundColor: item.num === 5 ? 'rgba(16, 185, 129, 0.12)' : '#090e1a',
                border: item.num === 5 ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '0.875rem 1rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: item.num === 5 ? '#34d399' : '#94a3b8',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                {item.label}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={`Explicação do nível ${item.num}...`}
                value={item.val}
                onChange={(e) => item.set(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              />
            </div>
          ))}
        </div>

        {/* Countermeasure */}
        <div
          style={{
            backgroundColor: '#090e1a',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <label className="form-label" style={{ color: '#22d3ee', fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'var(--font-heading)' }}>
            🛡️ Contramedida Definitiva & Padronização (SOP / LPP):
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="O que será feito no processo para garantir que a causa raiz nunca mais volte a acontecer?"
            value={countermeasure}
            onChange={(e) => setCountermeasure(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleCopyAnalysis}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {copied ? (
            <>
              <Check size={16} /> Análise Copiada com Sucesso!
            </>
          ) : (
            <>
              <Copy size={16} /> Copiar Análise Completa dos 5 Porquês
            </>
          )}
        </button>
      </div>
    </div>
  );
}
