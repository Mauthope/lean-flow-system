'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  ArrowLeft,
  Clock,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Info,
  Layers,
  Zap,
  PackageCheck,
  AlertOctagon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CalculadoraRoiPage() {
  // 1. Labor / Cycle Time
  const [cycleBefore, setCycleBefore] = useState<number>(45);
  const [cycleAfter, setCycleAfter] = useState<number>(15);
  const [frequencyPerMonth, setFrequencyPerMonth] = useState<number>(80);
  const [hourlyRate, setHourlyRate] = useState<number>(60);

  // 2. Production Increase
  const [extraUnitsPerMonth, setExtraUnitsPerMonth] = useState<number>(200);
  const [unitMargin, setUnitMargin] = useState<number>(45);

  // 3. Scrap / Material Reduction
  const [scrapUnitsAvoided, setScrapUnitsAvoided] = useState<number>(150);
  const [unitMaterialCost, setUnitMaterialCost] = useState<number>(30);

  // 4. Machine Downtime
  const [downtimeHoursAvoided, setDowntimeHoursAvoided] = useState<number>(10);
  const [machineHourlyRate, setMachineHourlyRate] = useState<number>(350);

  // 5. Energy & Tooling
  const [toolingSavings, setToolingSavings] = useState<number>(2500);

  // 6. Logistics & Freight
  const [freightSavings, setFreightSavings] = useState<number>(1800);

  const [copied, setCopied] = useState(false);

  // Calculations
  const minutesSavedPerCycle = Math.max(0, cycleBefore - cycleAfter);
  const laborHoursSavedPerMonth = (minutesSavedPerCycle * frequencyPerMonth) / 60;
  const laborSavingsMonthly = laborHoursSavedPerMonth * hourlyRate;

  const productionIncreaseMonthly = extraUnitsPerMonth * unitMargin;
  const scrapSavingsMonthly = scrapUnitsAvoided * unitMaterialCost;
  const machineDowntimeMonthly = downtimeHoursAvoided * machineHourlyRate;

  const totalCostAvoidedMonthly =
    laborSavingsMonthly +
    productionIncreaseMonthly +
    scrapSavingsMonthly +
    machineDowntimeMonthly +
    toolingSavings +
    freightSavings;

  const totalHoursSavedMonthly = laborHoursSavedPerMonth + downtimeHoursAvoided;
  const totalCostAvoidedAnnual = totalCostAvoidedMonthly * 12;
  const totalHoursSavedAnnual = totalHoursSavedMonthly * 12;

  const handleCopyValues = () => {
    const text = `📊 COMPOSIÇÃO DE CUSTO EVITADO & ROI LEAN:
• Custo Evitado Real (Total Mensal): ${formatCurrency(totalCostAvoidedMonthly)} (Anual: ${formatCurrency(totalCostAvoidedAnnual)})
• Horas Economizadas: ${totalHoursSavedMonthly.toFixed(1)}h/mês (${totalHoursSavedAnnual.toFixed(0)}h/ano)

FONTES DE ECONOMIA:
  🚀 Aumento de Produção: ${formatCurrency(productionIncreaseMonthly)} (${extraUnitsPerMonth} peças extras × ${formatCurrency(unitMargin)})
  ♻️ Redução de Refugo: ${formatCurrency(scrapSavingsMonthly)} (${scrapUnitsAvoided} peças salvas × ${formatCurrency(unitMaterialCost)})
  👷‍♂️ Mão de Obra / Ciclo: ${formatCurrency(laborSavingsMonthly)} (${laborHoursSavedPerMonth.toFixed(1)}h economizadas)
  ⚙️ Paradas de Máquina Evitadas: ${formatCurrency(machineDowntimeMonthly)} (${downtimeHoursAvoided}h de máquina)
  ⚡ Ferramental & Energia: ${formatCurrency(toolingSavings)}
  📦 Fretes & Logística: ${formatCurrency(freightSavings)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setCycleBefore(45);
    setCycleAfter(15);
    setFrequencyPerMonth(80);
    setHourlyRate(60);
    setExtraUnitsPerMonth(200);
    setUnitMargin(45);
    setScrapUnitsAvoided(150);
    setUnitMaterialCost(30);
    setDowntimeHoursAvoided(10);
    setMachineHourlyRate(350);
    setToolingSavings(2500);
    setFreightSavings(1800);
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
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
            <Calculator size={26} color="#22d3ee" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Calculadora Multi-Fontes de Custo Evitado Lean
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Simule ganhos por Aumento de Produção, Refugo, Mão de Obra, Paradas e Fretes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RotateCcw size={14} /> Restaurar Padrões
        </button>
      </div>

      {/* Responsive Grid: Inputs on Left, Results on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* ================= INPUT BLOCKS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Driver 1: Production Increase */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #10b981', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                🚀 1. Aumento de Produção & Capacidade Extra
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                +{formatCurrency(productionIncreaseMonthly)}/mês
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Peças extras/mês:</label>
                <input
                  type="number"
                  className="form-control"
                  value={extraUnitsPerMonth}
                  onChange={(e) => setExtraUnitsPerMonth(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Margem/peça (R$):</label>
                <input
                  type="number"
                  className="form-control"
                  value={unitMargin}
                  onChange={(e) => setUnitMargin(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>
          </div>

          {/* Driver 2: Scrap & Material */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #06b6d4', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-heading)' }}>
                ♻️ 2. Redução de Sucata & Refugo de Matéria-Prima
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                +{formatCurrency(scrapSavingsMonthly)}/mês
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Peças salvas/mês:</label>
                <input
                  type="number"
                  className="form-control"
                  value={scrapUnitsAvoided}
                  onChange={(e) => setScrapUnitsAvoided(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Custo unitário (R$):</label>
                <input
                  type="number"
                  className="form-control"
                  value={unitMaterialCost}
                  onChange={(e) => setUnitMaterialCost(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>
          </div>

          {/* Driver 3: Labor & Cycle Time */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #38bdf8', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                👷‍♂️ 3. Mão de Obra & Tempo de Ciclo
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                +{formatCurrency(laborSavingsMonthly)}/mês
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Tempo antes (min):</label>
                <input
                  type="number"
                  className="form-control"
                  value={cycleBefore}
                  onChange={(e) => setCycleBefore(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Tempo depois (min):</label>
                <input
                  type="number"
                  className="form-control"
                  value={cycleAfter}
                  onChange={(e) => setCycleAfter(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Frequência/mês:</label>
                <input
                  type="number"
                  className="form-control"
                  value={frequencyPerMonth}
                  onChange={(e) => setFrequencyPerMonth(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Custo/hora (R$):</label>
                <input
                  type="number"
                  className="form-control"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>
          </div>

          {/* Driver 4: Machine Downtime & Tooling */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #fbbf24', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>
                ⚙️ 4. Paradas de Máquina, Insumos & Fretes
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                +{formatCurrency(machineDowntimeMonthly + toolingSavings + freightSavings)}/mês
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Horas parada evitadas:</label>
                <input
                  type="number"
                  className="form-control"
                  value={downtimeHoursAvoided}
                  onChange={(e) => setDowntimeHoursAvoided(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Custo hora/máquina (R$):</label>
                <input
                  type="number"
                  className="form-control"
                  value={machineHourlyRate}
                  onChange={(e) => setMachineHourlyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Ferramental/Energia (R$):</label>
                <input
                  type="number"
                  className="form-control"
                  value={toolingSavings}
                  onChange={(e) => setToolingSavings(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Fretes evitados (R$):</label>
                <input
                  type="number"
                  className="form-control"
                  value={freightSavings}
                  onChange={(e) => setFreightSavings(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= RESULTS SUMMARY CARD ================= */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.25rem',
            boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                Impacto Financeiro Consolidado
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                }}
              >
                ROI Homologado
              </span>
            </div>

            {/* Big Numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                  💰 Custo Evitado Real Total (Mensal)
                </span>
                <p style={{ fontSize: '2.1rem', fontWeight: 900, color: '#34d399', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(totalCostAvoidedMonthly)}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  Projeção anual: <strong style={{ color: '#ffffff' }}>{formatCurrency(totalCostAvoidedAnnual)}</strong>
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase' }}>
                  ⏱️ Capacidade Liberada (Horas Salvas)
                </span>
                <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#22d3ee', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                  {totalHoursSavedMonthly.toFixed(1)} h / mês
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  Projeção anual: <strong style={{ color: '#ffffff' }}>{totalHoursSavedAnnual.toFixed(0)} horas salvas no ano</strong>
                </p>
              </div>
            </div>

            {/* Breakdown List */}
            <div style={{ backgroundColor: '#090e1a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Detalhamento das Fontes de Retorno:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>🚀 Aumento de Produção:</span>
                  <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>{formatCurrency(productionIncreaseMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>♻️ Redução de Refugo:</span>
                  <strong style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{formatCurrency(scrapSavingsMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>👷‍♂️ Mão de Obra / Ciclo:</span>
                  <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{formatCurrency(laborSavingsMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>⚙️ Paradas de Máquina:</span>
                  <strong style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>{formatCurrency(machineDowntimeMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>⚡ Ferramental & Energia:</span>
                  <strong style={{ color: '#c084fc', fontFamily: 'var(--font-mono)' }}>{formatCurrency(toolingSavings)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>📦 Fretes & Logística:</span>
                  <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{formatCurrency(freightSavings)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyValues}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem' }}
          >
            {copied ? (
              <>
                <Check size={16} /> Composição Copiada com Sucesso!
              </>
            ) : (
              <>
                <Copy size={16} /> Copiar Composição para o Kanban
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
