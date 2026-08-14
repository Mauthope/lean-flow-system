'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Timer,
  Play,
  Pause,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  BarChart3,
  Sparkles,
  ArrowLeft,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Tag,
  Zap,
  Layers,
  FileSpreadsheet,
  Info,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sigma,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export type LeanActivityType = 'VA' | 'NVA' | 'NNVA';

export interface TimeRecord {
  id: string;
  cycleNumber: number;
  cycleName: string;
  date: string;
  motivo: string;
  timeSeconds: number;
  type: LeanActivityType;
  observation: string;
}

export interface MotivoConfig {
  name: string;
  type: LeanActivityType;
  color: string;
}

const DEFAULT_MOTIVOS: MotivoConfig[] = [
  { name: 'Ciclo Produtivo Padrão', type: 'VA', color: '#10b981' },
  { name: 'Troca de Ferramenta / Setup (SMED)', type: 'NVA', color: '#f59e0b' },
  { name: 'Falta de Material / Abastecimento', type: 'NVA', color: '#ef4444' },
  { name: 'Ajuste de Máquina / Regulagem', type: 'NVA', color: '#8b5cf6' },
  { name: 'Inspeção / Controle de Qualidade', type: 'NNVA', color: '#06b6d4' },
  { name: 'Micro-parada / Travamento', type: 'NVA', color: '#ec4899' },
  { name: 'Espera / Movimentação', type: 'NVA', color: '#64748b' },
];

export default function CronoanalisePage() {
  // Storage states
  const [motivos, setMotivos] = useState<MotivoConfig[]>([]);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [currentCycleName, setCurrentCycleName] = useState<string>('Ciclo de Trabalho #1');

  // Input states
  const [newMotivoText, setNewMotivoText] = useState('');
  const [newMotivoType, setNewMotivoType] = useState<LeanActivityType>('NVA');
  const [currentObservation, setCurrentObservation] = useState('');

  // Active timers state: motivo -> { startTime, elapsedMs, isRunning }
  const [activeTimers, setActiveTimers] = useState<{
    [motivo: string]: { startTime: number; elapsedMs: number; isRunning: boolean };
  }>({});

  const [focusedMotivo, setFocusedMotivo] = useState<string | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number>(35);

  // Statistics configuration
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95); // 90%, 95%, 99%
  const [toleratedError, setToleratedError] = useState<number>(0.05); // 3%, 5%, 10%
  const [showMathDetails, setShowMathDetails] = useState<boolean>(true);
  const [showDefinitions, setShowDefinitions] = useState<boolean>(true);
  const [historyViewMode, setHistoryViewMode] = useState<'cycles' | 'flat'>('cycles');

  // Load from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('lean_crono_records_v2');
      const savedMotivos = localStorage.getItem('lean_crono_motivos_v2');
      const savedCycle = localStorage.getItem('lean_crono_current_cycle');

      if (savedData) {
        setRecords(JSON.parse(savedData));
      }
      if (savedMotivos) {
        setMotivos(JSON.parse(savedMotivos));
      } else {
        setMotivos(DEFAULT_MOTIVOS);
        localStorage.setItem('lean_crono_motivos_v2', JSON.stringify(DEFAULT_MOTIVOS));
      }
      if (savedCycle) {
        setCurrentCycle(Number(savedCycle) || 1);
        setCurrentCycleName(`Ciclo de Trabalho #${Number(savedCycle) || 1}`);
      }
    } catch (e) {
      console.error('Error loading crono data:', e);
    }
  }, []);

  const saveRecords = (newRecords: TimeRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('lean_crono_records_v2', JSON.stringify(newRecords));
  };

  const saveMotivos = (newMotivos: MotivoConfig[]) => {
    setMotivos(newMotivos);
    localStorage.setItem('lean_crono_motivos_v2', JSON.stringify(newMotivos));
  };

  const updateCurrentCycle = (cycleNum: number) => {
    setCurrentCycle(cycleNum);
    setCurrentCycleName(`Ciclo de Trabalho #${cycleNum}`);
    localStorage.setItem('lean_crono_current_cycle', cycleNum.toString());
  };

  // Timer Tick Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers((prev) => {
        let hasRunning = false;
        const updated = { ...prev };
        const now = Date.now();

        Object.keys(updated).forEach((m) => {
          if (updated[m]?.isRunning) {
            hasRunning = true;
            updated[m] = {
              ...updated[m],
              elapsedMs: now - updated[m].startTime,
            };
          }
        });

        return hasRunning ? updated : prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Timer Actions
  const handleStartTimer = (motivo: string) => {
    const now = Date.now();
    setActiveTimers((prev) => {
      const current = prev[motivo];
      const start = current ? now - current.elapsedMs : now;
      return {
        ...prev,
        [motivo]: {
          startTime: start,
          elapsedMs: current ? current.elapsedMs : 0,
          isRunning: true,
        },
      };
    });
    setFocusedMotivo(motivo);
  };

  const handlePauseTimer = (motivo: string) => {
    setActiveTimers((prev) => {
      if (!prev[motivo]) return prev;
      return {
        ...prev,
        [motivo]: {
          ...prev[motivo],
          isRunning: false,
        },
      };
    });
  };

  const handleStopAndSaveTimer = (motivo: string) => {
    const timer = activeTimers[motivo];
    if (!timer) return;

    const seconds = Math.max(1, Math.round(timer.elapsedMs / 1000));
    const motivoCfg = motivos.find((m) => m.name === motivo);
    const type: LeanActivityType = motivoCfg ? motivoCfg.type : 'NVA';

    const newRecord: TimeRecord = {
      id: 'REC-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      cycleNumber: currentCycle,
      cycleName: currentCycleName,
      date: new Date().toLocaleString('pt-BR'),
      motivo,
      timeSeconds: seconds,
      type,
      observation: currentObservation.trim(),
    };

    saveRecords([newRecord, ...records]);
    setCurrentObservation('');

    // Reset this timer
    setActiveTimers((prev) => {
      const next = { ...prev };
      delete next[motivo];
      return next;
    });

    if (focusedMotivo === motivo) {
      setFocusedMotivo(null);
    }
  };

  const handleResetTimer = (motivo: string) => {
    setActiveTimers((prev) => {
      const next = { ...prev };
      delete next[motivo];
      return next;
    });
  };

  // Complete current cycle and start next
  const handleCompleteCycle = () => {
    const nextNum = currentCycle + 1;
    updateCurrentCycle(nextNum);
    alert(`🎉 Ciclo #${currentCycle} finalizado com sucesso! Iniciando Ciclo #${nextNum}.`);
  };

  // Add new Motivo
  const handleAddMotivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMotivoText.trim()) return;
    const name = newMotivoText.trim();
    if (motivos.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      alert('Este motivo já existe na lista!');
      return;
    }

    const palette = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2', '#059669', '#4b5563'];
    const randomColor = palette[motivos.length % palette.length];

    const newConfig: MotivoConfig = {
      name,
      type: newMotivoType,
      color: randomColor,
    };

    const updated = [...motivos, newConfig];
    saveMotivos(updated);
    setNewMotivoText('');
  };

  // Delete Motivo
  const handleDeleteMotivo = (name: string) => {
    if (confirm(`Deseja remover o motivo "${name}"?`)) {
      const updated = motivos.filter((m) => m.name !== name);
      saveMotivos(updated);
      handleResetTimer(name);
    }
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    saveRecords(updated);
  };

  // Update Observation on record
  const handleUpdateRecordObservation = (id: string, newObs: string) => {
    const updated = records.map((r) => (r.id === id ? { ...r, observation: newObs } : r));
    saveRecords(updated);
  };

  // Clear all data
  const handleClearAll = () => {
    if (confirm('Tem certeza de que deseja apagar todo o histórico de tempos gravados?')) {
      saveRecords([]);
      setActiveTimers({});
      setFocusedMotivo(null);
      updateCurrentCycle(1);
    }
  };

  // Export CSV
  const handleDownloadCSV = () => {
    if (records.length === 0) {
      alert('Nenhum dado cronometrado para exportar.');
      return;
    }

    let csv = '\uFEFF'; // UTF-8 BOM for Excel
    csv += 'ID,Ciclo,Nome do Ciclo,Data/Hora,Motivo,Tipo Lean,Tempo (Segundos),Tempo Formatado (MM:SS),Observacao,Custo Estimado (R$)\n';

    records.forEach((r) => {
      const mins = Math.floor(r.timeSeconds / 60);
      const secs = r.timeSeconds % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const cost = ((r.timeSeconds / 3600) * hourlyRate).toFixed(2);
      const safeDate = r.date.replace(/"/g, '""');
      const safeMotivo = r.motivo.replace(/"/g, '""');
      const safeCycle = r.cycleName.replace(/"/g, '""');
      const safeObs = (r.observation || '').replace(/"/g, '""');

      csv += `"${r.id}",${r.cycleNumber},"${safeCycle}","${safeDate}","${safeMotivo}","${r.type}",${r.timeSeconds},"${formatted}","${safeObs}",${cost}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cronoanalise_lean_ciclos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format Time display
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const decimal = Math.floor((ms % 1000) / 100);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${decimal}`;
  };

  // KPIs Calculations
  const totalSeconds = useMemo(() => {
    return records.reduce((acc, r) => acc + r.timeSeconds, 0);
  }, [records]);

  const vaSeconds = useMemo(() => {
    return records.filter((r) => r.type === 'VA').reduce((acc, r) => acc + r.timeSeconds, 0);
  }, [records]);

  const nvaSeconds = useMemo(() => {
    return records.filter((r) => r.type === 'NVA').reduce((acc, r) => acc + r.timeSeconds, 0);
  }, [records]);

  const nnvaSeconds = useMemo(() => {
    return records.filter((r) => r.type === 'NNVA').reduce((acc, r) => acc + r.timeSeconds, 0);
  }, [records]);

  const vaPercentage = totalSeconds > 0 ? ((vaSeconds / totalSeconds) * 100).toFixed(1) : '0.0';
  const nvaPercentage = totalSeconds > 0 ? ((nvaSeconds / totalSeconds) * 100).toFixed(1) : '0.0';
  const nnvaPercentage = totalSeconds > 0 ? ((nnvaSeconds / totalSeconds) * 100).toFixed(1) : '0.0';

  const estimatedWastedCost = useMemo(() => {
    const wastedHours = nvaSeconds / 3600;
    return wastedHours * hourlyRate;
  }, [nvaSeconds, hourlyRate]);

  // STATISTICAL SAMPLE SIZE CALCULATION (ENGENHARIA DE PROCESSOS / CRONOANÁLISE)
  // Formula: N' = ( (z * s) / (e * x_bar) )^2
  const statsCalc = useMemo(() => {
    const n = records.length;
    if (n < 2) {
      return {
        sampleSizeCurrent: n,
        mean: n === 1 ? records[0].timeSeconds : 0,
        stdDev: 0,
        cv: 0,
        z: confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.9 ? 1.645 : 1.96,
        error: toleratedError,
        requiredN: 0,
        isReliable: false,
        pendingSamples: 0,
      };
    }

    const times = records.map((r) => r.timeSeconds);
    const sum = times.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    // Sample variance & standard deviation: s = sqrt( sum( (x_i - mean)^2 ) / (n - 1) )
    const variance = times.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation: CV = (s / mean)
    const cv = mean > 0 ? stdDev / mean : 0;

    // z-score based on confidence level
    const z = confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.9 ? 1.645 : 1.96;
    const e = toleratedError;

    // Required Sample Size: N' = ( (z * stdDev) / (e * mean) )^2
    let requiredN = 0;
    if (mean > 0 && e > 0) {
      const term = (z * stdDev) / (e * mean);
      requiredN = Math.ceil(Math.pow(term, 2));
    }

    const isReliable = n >= requiredN && requiredN > 0;
    const pendingSamples = Math.max(0, requiredN - n);

    return {
      sampleSizeCurrent: n,
      mean: Number(mean.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      cv: Number((cv * 100).toFixed(2)), // in %
      z,
      error: e,
      requiredN,
      isReliable,
      pendingSamples,
    };
  }, [records, confidenceLevel, toleratedError]);

  // Group records by Cycle
  const groupedCycles = useMemo(() => {
    const map: { [cycle: number]: TimeRecord[] } = {};
    records.forEach((r) => {
      if (!map[r.cycleNumber]) {
        map[r.cycleNumber] = [];
      }
      map[r.cycleNumber].push(r);
    });

    return Object.entries(map)
      .map(([cycleNum, items]) => {
        const cTotal = items.reduce((acc, x) => acc + x.timeSeconds, 0);
        const cVa = items.filter((x) => x.type === 'VA').reduce((acc, x) => acc + x.timeSeconds, 0);
        const cNva = items.filter((x) => x.type === 'NVA').reduce((acc, x) => acc + x.timeSeconds, 0);
        return {
          cycleNumber: Number(cycleNum),
          cycleName: items[0]?.cycleName || `Ciclo #${cycleNum}`,
          items,
          totalTime: cTotal,
          vaTime: cVa,
          nvaTime: cNva,
          efficiency: cTotal > 0 ? ((cVa / cTotal) * 100).toFixed(1) : '0.0',
        };
      })
      .sort((a, b) => b.cycleNumber - a.cycleNumber);
  }, [records]);

  // Aggregated Motivo Stats (Pareto)
  const motivoStats = useMemo(() => {
    const map: { [key: string]: { totalTime: number; count: number; type: LeanActivityType } } = {};
    records.forEach((r) => {
      if (!map[r.motivo]) {
        map[r.motivo] = { totalTime: 0, count: 0, type: r.type };
      }
      map[r.motivo].totalTime += r.timeSeconds;
      map[r.motivo].count += 1;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        totalTime: data.totalTime,
        avgTime: Math.round(data.totalTime / data.count),
        count: data.count,
        type: data.type,
        percentage: totalSeconds > 0 ? ((data.totalTime / totalSeconds) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.totalTime - a.totalTime); // Pareto order
  }, [records, totalSeconds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/agente/ferramentas"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} /> Voltar ao Hub
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                YAMAZUMI & CRONOANÁLISE
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                Ciclo Atual: #{currentCycle}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0.2rem 0 0 0' }}>
              Cronoanálise & Estudo de Tempos Lean
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCompleteCycle}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Fechar medição do ciclo atual e avançar para o próximo ciclo"
          >
            <CheckCircle2 size={14} /> Fechar Ciclo #{currentCycle} & Novo
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={records.length === 0}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: records.length === 0 ? 0.6 : 1 }}
          >
            <Download size={14} /> Exportar CSV (Excel)
          </button>
          <button
            onClick={handleClearAll}
            disabled={records.length === 0}
            className="btn btn-danger btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: records.length === 0 ? 0.6 : 1 }}
          >
            <Trash2 size={14} /> Limpar
          </button>
        </div>
      </div>

      {/* DEFINIÇÕES LEAN: VALOR AGREGADO VS DESPERDÍCIO */}
      <div
        className="card"
        style={{
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <div
          onClick={() => setShowDefinitions(!showDefinitions)}
          style={{
            padding: '0.875rem 1.25rem',
            backgroundColor: '#f8fafc',
            borderBottom: showDefinitions ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} color="#2563eb" />
            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
              Fundamentos Lean: O que é Valor Agregado (VA) e Desperdício (NVA)?
            </strong>
          </div>
          {showDefinitions ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {showDefinitions && (
          <div
            style={{
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* VA */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🟢</span>
                <strong style={{ color: '#166534', fontSize: '0.9rem' }}>Valor Agregado (VA - Value Added)</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#14532d', lineHeight: 1.4, margin: 0 }}>
                Atividades que <strong>transformam o produto ou serviço</strong> de forma física ou lógica, pelas quais o <strong>cliente está disposto a pagar</strong> e feitas com qualidade na 1ª vez.
                <br />
                <em>Exemplos: Usinar uma peça, soldar uma junta, montar componentes, pintar o chassi.</em>
              </p>
            </div>

            {/* NVA */}
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🔴</span>
                <strong style={{ color: '#991b1b', fontSize: '0.9rem' }}>Desperdício Puro (NVA - Non-Value Added / Muda)</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#7f1d1d', lineHeight: 1.4, margin: 0 }}>
                Atividades que consomem tempo, energia e custo <strong>sem agregar valor</strong> nenhum para o cliente. Devem ser <strong>eliminadas imediatamente</strong>.
                <br />
                <em>Exemplos: Espera por material, retrabalho, setup excessivo, movimentações e deslocamentos.</em>
              </p>
            </div>

            {/* NNVA */}
            <div
              style={{
                backgroundColor: '#ecfeff',
                border: '1px solid #a5f3fc',
                borderRadius: '10px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🟡</span>
                <strong style={{ color: '#155e75', fontSize: '0.9rem' }}>Não Agrega Valor mas Necessário (NNVA)</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#164e63', lineHeight: 1.4, margin: 0 }}>
                Atividades que não agregam valor sob a ótica do cliente, mas são <strong>indispensáveis</strong> no processo atual (normas de segurança, inspeção técnica ou legislação). Devem ser <strong>otimizadas e reduzidas</strong>.
                <br />
                <em>Exemplos: Inspeção obrigatória, troca de EPI, preenchimento de lote rastreável.</em>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main KPI Highlights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Tempo Total Amostrado
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {records.length} tomadas de tempo em {groupedCycles.length} ciclo(s)
          </span>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
            Valor Agregado (VA)
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            {vaPercentage}%
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {Math.floor(vaSeconds / 60)}m {vaSeconds % 60}s produtivo
          </span>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase' }}>
            Desperdício (NVA)
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>
            {nvaPercentage}%
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {Math.floor(nvaSeconds / 60)}m {nvaSeconds % 60}s perdas/paradas
          </span>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>
            Custo Oportunidade / Perda
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
            {formatCurrency(estimatedWastedCost)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Custo H/H:</span>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
              style={{ width: '45px', padding: '0.1rem 0.25rem', fontSize: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>R$/h</span>
          </div>
        </div>
      </div>

      {/* STATISTICAL SAMPLE SIZE & RELIABILITY MEMORY */}
      <div
        className="card"
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem',
          backgroundColor: statsCalc.isReliable ? '#f0fdf4' : '#fffbeb',
          borderLeft: statsCalc.isReliable ? '6px solid #10b981' : '6px solid #f59e0b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sigma size={24} color={statsCalc.isReliable ? '#059669' : '#d97706'} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Cálculo de Confiabilidade Estatística & Tamanho de Amostra ($N'$)
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                Norma técnica de Cronoanálise Industrial para garantir que a amostragem representa a realidade do processo
              </p>
            </div>
          </div>

          {/* Configuration Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Confiança ($1-\\alpha$):</span>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: 'auto' }}
              >
                <option value={0.9}>90% (z = 1.645)</option>
                <option value={0.95}>95% (z = 1.960 - Padrão)</option>
                <option value={0.99}>99% (z = 2.576 - Rigoroso)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Erro Máx ($e$):</span>
              <select
                value={toleratedError}
                onChange={(e) => setToleratedError(Number(e.target.value))}
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: 'auto' }}
              >
                <option value={0.03}>± 3% (Alta Precisão)</option>
                <option value={0.05}>± 5% (Padrão Industrial)</option>
                <option value={0.1}>± 10% (Estimativa Rápida)</option>
              </select>
            </div>

            <button
              onClick={() => setShowMathDetails(!showMathDetails)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              {showMathDetails ? 'Ocultar Memória' : 'Ver Memória de Cálculo'}
            </button>
          </div>
        </div>

        {/* Statistical Summary Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>AMOSTRAS COLETADAS ($n$)</span>
            <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>{statsCalc.sampleSizeCurrent}</strong>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>TEMPO MÉDIO (x̄)</span>
            <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>{statsCalc.mean}s</strong>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>DESVIO PADRÃO (s)</span>
            <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>{statsCalc.stdDev}s</strong>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>COEF. VARIAÇÃO (CV)</span>
            <strong style={{ fontSize: '1.25rem', color: statsCalc.cv > 30 ? '#dc2626' : '#059669' }}>
              {statsCalc.cv}%
            </strong>
          </div>

          <div
            style={{
              backgroundColor: statsCalc.isReliable ? '#dcfce7' : '#fef3c7',
              padding: '0.75rem',
              borderRadius: '10px',
              border: `1px solid ${statsCalc.isReliable ? '#86efac' : '#fde68a'}`,
            }}
          >
            <span style={{ fontSize: '0.7rem', color: statsCalc.isReliable ? '#166534' : '#92400e', fontWeight: 700, display: 'block' }}>
              AMOSTRAS MÍNIMAS (N&apos;)
            </span>
            <strong style={{ fontSize: '1.25rem', color: statsCalc.isReliable ? '#166534' : '#92400e' }}>
              {statsCalc.requiredN} {statsCalc.isReliable ? '✅' : `(faltam ${statsCalc.pendingSamples})`}
            </strong>
          </div>
        </div>

        {/* Diagnosis Alert */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            backgroundColor: statsCalc.isReliable ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${statsCalc.isReliable ? '#a7f3d0' : '#fde68a'}`,
            fontSize: '0.84375rem',
            color: statsCalc.isReliable ? '#065f46' : '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          {statsCalc.isReliable ? (
            <>
              <CheckCircle2 size={20} color="#059669" />
              <div>
                <strong>Amostragem com Confiabilidade Atingida!</strong> O estudo atual com {statsCalc.sampleSizeCurrent} tomadas atende a exigência mínima de {statsCalc.requiredN} medições com <strong>{(confidenceLevel * 100).toFixed(0)}% de confiança</strong> e margem de erro ≤ {(toleratedError * 100).toFixed(0)}%.
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={20} color="#d97706" />
              <div>
                <strong>Amostragem Preliminar em Progresso:</strong> Para garantir {(confidenceLevel * 100).toFixed(0)}% de confiança estatística sem distorções, realize mais <strong>{statsCalc.pendingSamples} tomadas de tempo</strong> (Total necessário: {statsCalc.requiredN} amostras).
              </div>
            </>
          )}
        </div>

        {/* MATHEMATICAL MEMORY OF CALCULATION (STEP-BY-STEP) */}
        {showMathDetails && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              color: '#1e293b',
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontFamily: 'sans-serif' }}>
              📐 Memória de Cálculo Estatístico Passo a Passo:
            </div>
            <div style={{ lineHeight: 1.6 }}>
              <div><strong>1. Fórmula Aplicada:</strong> N&apos; = [ (z · s) / (e · x̄) ]²</div>
              <div><strong>2. Parâmetros Configurados:</strong> Nível de Confiança = {(confidenceLevel * 100).toFixed(0)}% (z = {statsCalc.z}) | Erro Tolerado (e) = {(toleratedError * 100).toFixed(0)}% ({statsCalc.error})</div>
              <div><strong>3. Média dos Tempos (x̄):</strong> x̄ = (∑ xᵢ) / n = {statsCalc.mean} segundos</div>
              <div><strong>4. Desvio Padrão Amostral (s):</strong> s = √[ ∑ (xᵢ - x̄)² / (n - 1) ] = {statsCalc.stdDev} segundos</div>
              <div><strong>5. Coeficiente de Variação (CV):</strong> CV = s / x̄ = ({statsCalc.stdDev} / {statsCalc.mean}) = {statsCalc.cv}%</div>
              <div style={{ marginTop: '0.35rem', color: '#2563eb', fontWeight: 700 }}>
                <strong>6. Resolução:</strong> N&apos; = [ ({statsCalc.z} × {statsCalc.stdDev}) / ({statsCalc.error} × {statsCalc.mean}) ]² = [ {((statsCalc.z * statsCalc.stdDev)).toFixed(3)} / {((statsCalc.error * statsCalc.mean)).toFixed(3)} ]² = {statsCalc.requiredN} amostras mínimas recomendadas.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Grid: Left (Active Studio & Motivos) / Right (Analytics & Charts) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Cronômetros Ativos & Botões de Motivos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Focused Timer Box */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {focusedMotivo ? `Cronômetro: ${focusedMotivo}` : `Ciclo Atual: #${currentCycle} (Aguardando Disparo)`}
              </span>
              {focusedMotivo && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor:
                      motivos.find((m) => m.name === focusedMotivo)?.type === 'VA'
                        ? '#065f46'
                        : motivos.find((m) => m.name === focusedMotivo)?.type === 'NNVA'
                        ? '#155e75'
                        : '#991b1b',
                    color: '#ffffff',
                  }}
                >
                  {motivos.find((m) => m.name === focusedMotivo)?.type === 'VA'
                    ? '🟢 Valor Agregado'
                    : motivos.find((m) => m.name === focusedMotivo)?.type === 'NNVA'
                    ? '🟡 Necessário (NNVA)'
                    : '🔴 Desperdício'}
                </span>
              )}
            </div>

            {/* Display Big Digital Time */}
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '3.25rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: focusedMotivo && activeTimers[focusedMotivo]?.isRunning ? '#38bdf8' : '#f8fafc',
                margin: '0.5rem 0',
                textShadow: focusedMotivo && activeTimers[focusedMotivo]?.isRunning ? '0 0 20px rgba(56, 189, 248, 0.5)' : 'none',
              }}
            >
              {focusedMotivo && activeTimers[focusedMotivo]
                ? formatTime(activeTimers[focusedMotivo].elapsedMs)
                : '00:00.0'}
            </div>

            {/* Observation field before stopping */}
            {focusedMotivo && (
              <div style={{ margin: '0.75rem 0' }}>
                <input
                  type="text"
                  placeholder="Observação da atividade (ex: Peça travou, Operador em treinamento...)"
                  value={currentObservation}
                  onChange={(e) => setCurrentObservation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Focused Controls */}
            {focusedMotivo && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {activeTimers[focusedMotivo]?.isRunning ? (
                  <button
                    onClick={() => handlePauseTimer(focusedMotivo)}
                    className="btn"
                    style={{
                      backgroundColor: '#f59e0b',
                      color: '#000000',
                      fontWeight: 700,
                      padding: '0.6rem 1.25rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Pause size={18} /> Pausar
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartTimer(focusedMotivo)}
                    className="btn"
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: 700,
                      padding: '0.6rem 1.25rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Play size={18} /> Iniciar
                  </button>
                )}

                <button
                  onClick={() => handleStopAndSaveTimer(focusedMotivo)}
                  className="btn"
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '0.6rem 1.25rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Square size={18} /> Parar & Gravar no Ciclo #{currentCycle}
                </button>

                <button
                  onClick={() => handleResetTimer(focusedMotivo)}
                  className="btn"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '10px',
                  }}
                  title="Zerar sem salvar"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Reason / Motivo Buttons Grid */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={16} color="#2563eb" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Categorias de Medição & Atividades
                </h4>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{motivos.length} categorias</span>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddMotivo} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Nova atividade (ex: Rebarbar peça)..."
                value={newMotivoText}
                onChange={(e) => setNewMotivoText(e.target.value)}
                style={{ flex: 1, minWidth: '150px', fontSize: '0.8125rem' }}
              />
              <select
                value={newMotivoType}
                onChange={(e) => setNewMotivoType(e.target.value as LeanActivityType)}
                className="form-select"
                style={{ width: 'auto', fontSize: '0.8125rem' }}
              >
                <option value="NVA">🔴 Desperdício (NVA)</option>
                <option value="VA">🟢 Valor Agregado (VA)</option>
                <option value="NNVA">🟡 Necessário (NNVA)</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Plus size={14} /> Adicionar
              </button>
            </form>

            {/* Button Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {motivos.map((m) => {
                const active = activeTimers[m.name];
                const isRunning = active?.isRunning;
                const isFocused = focusedMotivo === m.name;

                return (
                  <div
                    key={m.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: isRunning ? '#f0fdf4' : isFocused ? '#eff6ff' : '#f8fafc',
                      border: isRunning
                        ? '2px solid #10b981'
                        : isFocused
                        ? '2px solid #2563eb'
                        : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: m.color,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ fontSize: '0.84375rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.name}
                          </strong>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              backgroundColor:
                                m.type === 'VA' ? '#ecfdf5' : m.type === 'NNVA' ? '#ecfeff' : '#fef2f2',
                              color: m.type === 'VA' ? '#059669' : m.type === 'NNVA' ? '#0891b2' : '#dc2626',
                            }}
                          >
                            {m.type}
                          </span>
                        </div>
                        {active && (
                          <div style={{ fontSize: '0.75rem', color: '#2563eb', fontFamily: 'monospace', fontWeight: 700 }}>
                            ⏱️ {formatTime(active.elapsedMs)} {isRunning ? '(Em andamento...)' : '(Pausado)'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      {isRunning ? (
                        <>
                          <button
                            onClick={() => handlePauseTimer(m.name)}
                            className="btn btn-warning btn-sm"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Pausar"
                          >
                            <Pause size={14} />
                          </button>
                          <button
                            onClick={() => handleStopAndSaveTimer(m.name)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Parar e Gravar"
                          >
                            <Square size={14} />
                          </button>
                        </>
                      ) : active ? (
                        <>
                          <button
                            onClick={() => handleStartTimer(m.name)}
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Retomar"
                          >
                            <Play size={14} />
                          </button>
                          <button
                            onClick={() => handleStopAndSaveTimer(m.name)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Gravar"
                          >
                            <Square size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartTimer(m.name)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.78125rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Play size={13} /> Iniciar
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteMotivo(m.name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '0.3rem',
                        }}
                        title="Excluir motivo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Gráficos & Estatísticas Yamazumi / Pareto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Pareto & Bar Analysis */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BarChart3 size={16} color="#2563eb" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Gráfico de Pareto & Gargalos de Tempo
                </h4>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tempo acumulado</span>
            </div>

            {motivoStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.84375rem', margin: 0 }}>Nenhuma medição realizada ainda.</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Inicie o cronômetro ao lado para gerar o estudo gráfico de tempos.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {motivoStats.map((item) => {
                  const maxTime = motivoStats[0]?.totalTime || 1;
                  const barWidth = Math.max(5, (item.totalTime / maxTime) * 100);
                  const isVA = item.type === 'VA';
                  const isNNVA = item.type === 'NNVA';

                  return (
                    <div key={item.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {item.name} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({item.count}x)</span>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Média: {item.avgTime}s</span>
                          <strong style={{ color: isVA ? '#059669' : isNNVA ? '#0891b2' : '#dc2626' }}>
                            {item.totalTime}s ({item.percentage}%)
                          </strong>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            backgroundColor: isVA ? '#10b981' : isNNVA ? '#0891b2' : '#ef4444',
                            borderRadius: '9999px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct Lean Integration: Enviar Desperdício para o ROI */}
          {nvaSeconds > 0 && (
            <div
              className="card"
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#ffffff',
                borderRadius: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} color="#fbbf24" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Oportunidade de Kaizen Detectada!
                </h4>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#c7d2fe', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                Você identificou <strong>{Math.floor(nvaSeconds / 60)} minutos</strong> de paradas e desperdícios.
                Transforme esta perda em um projeto de melhoria com ROI comprovado!
              </p>
              <Link
                href="/agente/ferramentas/calculadora-roi"
                className="btn"
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                }}
              >
                <Zap size={15} /> Abrir Calculadora de ROI com estes Dados
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* HISTÓRICO DE MEDIÇÕES (VISÃO POR CICLOS OU VISÃO TABULAR) */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Histórico & Amostragens de Cronoanálise ({records.length} medições)
            </h4>
            <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: 0 }}>
              Estruturado por tomadas de ciclo ou lista contínua com anotações e observações de posto
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setHistoryViewMode('cycles')}
              className="btn btn-sm"
              style={{
                backgroundColor: historyViewMode === 'cycles' ? '#2563eb' : '#f1f5f9',
                color: historyViewMode === 'cycles' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              Agrupado por Ciclos ({groupedCycles.length})
            </button>
            <button
              onClick={() => setHistoryViewMode('flat')}
              className="btn btn-sm"
              style={{
                backgroundColor: historyViewMode === 'flat' ? '#2563eb' : '#f1f5f9',
                color: historyViewMode === 'flat' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              Lista Completa ({records.length})
            </button>
          </div>
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
            <Clock size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Nenhuma cronometragem salva.</p>
          </div>
        ) : historyViewMode === 'cycles' ? (
          /* CICLOS AGRUPADOS */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {groupedCycles.map((cycle) => (
              <div
                key={cycle.cycleNumber}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                }}
              >
                {/* Cycle Header */}
                <div
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      Ciclo #{cycle.cycleNumber}
                    </span>
                    <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>{cycle.cycleName}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({cycle.items.length} etapas)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem' }}>
                    <span>
                      Tempo Total: <strong>{cycle.totalTime}s</strong> ({Math.floor(cycle.totalTime / 60)}m {cycle.totalTime % 60}s)
                    </span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>
                      Eficiência VA: {cycle.efficiency}%
                    </span>
                  </div>
                </div>

                {/* Items in Cycle Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.725rem', color: '#64748b' }}>HORA</th>
                        <th style={{ textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.725rem', color: '#64748b' }}>ATIVIDADE / MOTIVO</th>
                        <th style={{ textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.725rem', color: '#64748b' }}>TIPO LEAN</th>
                        <th style={{ textAlign: 'right', padding: '0.6rem 1rem', fontSize: '0.725rem', color: '#64748b' }}>DURAÇÃO</th>
                        <th style={{ textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.725rem', color: '#64748b' }}>OBSERVAÇÃO DO POSTO</th>
                        <th style={{ textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.725rem', color: '#64748b' }}>AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycle.items.map((item) => {
                        const mins = Math.floor(item.timeSeconds / 60);
                        const secs = item.timeSeconds % 60;
                        const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                        const isVA = item.type === 'VA';
                        const isNNVA = item.type === 'NNVA';

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.78125rem', color: '#64748b' }}>{item.date.split(' ')[1] || item.date}</td>
                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.84375rem', fontWeight: 600, color: '#0f172a' }}>{item.motivo}</td>
                            <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  backgroundColor: isVA ? '#ecfdf5' : isNNVA ? '#ecfeff' : '#fef2f2',
                                  color: isVA ? '#059669' : isNNVA ? '#0891b2' : '#dc2626',
                                }}
                              >
                                {isVA ? '🟢 VA' : isNNVA ? '🟡 NNVA' : '🔴 NVA'}
                              </span>
                            </td>
                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.84375rem', fontWeight: 700, fontFamily: 'monospace' }}>
                              {item.timeSeconds}s ({formatted})
                            </td>
                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', color: '#334155' }}>
                              <input
                                type="text"
                                defaultValue={item.observation || ''}
                                placeholder="Adicionar observação..."
                                onBlur={(e) => handleUpdateRecordObservation(item.id, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.78125rem',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  backgroundColor: item.observation ? '#ffffff' : '#f8fafc',
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteRecord(item.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                }}
                                title="Excluir este item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* FLAT TABLE */
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>CICLO</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>DATA / HORA</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>MOTIVO</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>TIPO LEAN</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>TEMPO (SEG)</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>OBSERVAÇÃO</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const mins = Math.floor(rec.timeSeconds / 60);
                  const secs = rec.timeSeconds % 60;
                  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                  const isVA = rec.type === 'VA';
                  const isNNVA = rec.type === 'NNVA';

                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.78125rem', fontWeight: 700, color: '#2563eb' }}>
                        Ciclo #{rec.cycleNumber}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: '#475569' }}>{rec.date}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.84375rem', fontWeight: 600, color: '#0f172a' }}>{rec.motivo}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: isVA ? '#ecfdf5' : isNNVA ? '#ecfeff' : '#fef2f2',
                            color: isVA ? '#059669' : isNNVA ? '#0891b2' : '#dc2626',
                          }}
                        >
                          {isVA ? '🟢 VA' : isNNVA ? '🟡 NNVA' : '🔴 NVA'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.84375rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {rec.timeSeconds}s ({formatted})
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>
                        <input
                          type="text"
                          defaultValue={rec.observation || ''}
                          placeholder="Adicionar observação..."
                          onBlur={(e) => handleUpdateRecordObservation(rec.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.78125rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: rec.observation ? '#ffffff' : '#f8fafc',
                          }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.3rem',
                          }}
                          title="Excluir este registro"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
