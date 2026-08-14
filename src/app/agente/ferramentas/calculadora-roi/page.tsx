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
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Calculator size={26} color="#2563eb" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Calculadora Multi-Fontes de Custo Evitado Lean
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
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
          <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #16a34a' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#15803d' }}>
                🚀 1. Aumento de Produção & Capacidade Extra
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#16a34a' }}>
                +{formatCurrency(productionIncreaseMonthly)}/mês
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Peças extras/mês:</label>
                <input
                  type="number"
                  className="form-control"
                  value={extraUnitsPerMonth}
                  onChange={(e) => setExtraUnitsPerMonth(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Margem/peça (R$):</label>
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
          <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #0891b2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0e7490' }}>
                ♻️ 2. Redução de Sucata & Refugo de Matéria-Prima
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0891b2' }}>
                +{formatCurrency(scrapSavingsMonthly)}/mês
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Peças salvas/mês:</label>
                <input
                  type="number"
                  className="form-control"
                  value={scrapUnitsAvoided}
                  onChange={(e) => setScrapUnitsAvoided(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Custo unitário (R$):</label>
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
          <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1d4ed8' }}>
                👷‍♂️ 3. Mão de Obra & Tempo de Ciclo
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#2563eb' }}>
                +{formatCurrency(laborSavingsMonthly)}/mês
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Tempo antes (min):</label>
                <input
                  type="number"
                  className="form-control"
                  value={cycleBefore}
                  onChange={(e) => setCycleBefore(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Tempo depois (min):</label>
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
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Frequência/mês:</label>
                <input
                  type="number"
                  className="form-control"
                  value={frequencyPerMonth}
                  onChange={(e) => setFrequencyPerMonth(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Custo/hora (R$):</label>
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
          <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #d97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#b45309' }}>
                ⚙️ 4. Paradas de Máquina, Insumos & Fretes
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#d97706' }}>
                +{formatCurrency(machineDowntimeMonthly + toolingSavings + freightSavings)}/mês
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Horas parada evitadas:</label>
                <input
                  type="number"
                  className="form-control"
                  value={downtimeHoursAvoided}
                  onChange={(e) => setDowntimeHoursAvoided(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Custo hora/máquina (R$):</label>
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
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Ferramental/Energia (R$):</label>
                <input
                  type="number"
                  className="form-control"
                  value={toolingSavings}
                  onChange={(e) => setToolingSavings(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Fretes evitados (R$):</label>
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
            backgroundColor: '#f8fafc',
            border: '2px solid #059669',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46' }}>
                Impacto Financeiro Consolidado
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                }}
              >
                ROI Homologado
              </span>
            </div>

            {/* Big Numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '1.25rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                  💰 Custo Evitado Real Total (Mensal)
                </span>
                <p style={{ fontSize: '2.1rem', fontWeight: 900, color: '#047857', marginTop: '0.25rem' }}>
                  {formatCurrency(totalCostAvoidedMonthly)}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#065f46', marginTop: '0.25rem' }}>
                  Projeção anual: <strong>{formatCurrency(totalCostAvoidedAnnual)}</strong>
                </p>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                  ⏱️ Capacidade Liberada (Horas Salvas)
                </span>
                <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e3a8a', marginTop: '0.25rem' }}>
                  {totalHoursSavedMonthly.toFixed(1)} h / mês
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#1d4ed8', marginTop: '0.25rem' }}>
                  Projeção anual: <strong>{totalHoursSavedAnnual.toFixed(0)} horas salvas no ano</strong>
                </p>
              </div>
            </div>

            {/* Breakdown List */}
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Detalhamento das Fontes de Retorno:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>🚀 Aumento de Produção:</span>
                  <strong style={{ color: '#0f172a' }}>{formatCurrency(productionIncreaseMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>♻️ Redução de Refugo:</span>
                  <strong style={{ color: '#0f172a' }}>{formatCurrency(scrapSavingsMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>👷‍♂️ Mão de Obra / Ciclo:</span>
                  <strong style={{ color: '#0f172a' }}>{formatCurrency(laborSavingsMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>⚙️ Paradas de Máquina:</span>
                  <strong style={{ color: '#0f172a' }}>{formatCurrency(machineDowntimeMonthly)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>⚡ Ferramental & Energia:</span>
                  <strong style={{ color: '#0f172a' }}>{formatCurrency(toolingSavings)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>📦 Fretes & Logística:</span>
                  <strong style={{ color: '#0f172a' }}>{formatCurrency(freightSavings)}</strong>
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
