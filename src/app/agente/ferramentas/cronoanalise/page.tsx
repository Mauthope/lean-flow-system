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
  CheckCircle2,
  Tag,
  Zap,
  Sigma,
  Calculator,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

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

type StudyTab = 'cronometro' | 'analise' | 'estatistica' | 'historico';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const typeLabel = (t: LeanActivityType) =>
  t === 'VA' ? '🟢 VA' : t === 'NNVA' ? '🟡 NNVA' : '🔴 NVA';

const typeColor = (t: LeanActivityType) =>
  t === 'VA' ? '#34d399' : t === 'NNVA' ? '#22d3ee' : '#f87171';

const typeBg = (t: LeanActivityType) =>
  t === 'VA'
    ? 'rgba(16, 185, 129, 0.15)'
    : t === 'NNVA'
    ? 'rgba(6, 182, 212, 0.15)'
    : 'rgba(239, 68, 68, 0.15)';

const typeBorder = (t: LeanActivityType) =>
  t === 'VA'
    ? 'rgba(16, 185, 129, 0.35)'
    : t === 'NNVA'
    ? 'rgba(6, 182, 212, 0.35)'
    : 'rgba(239, 68, 68, 0.35)';

// ─── Component ───────────────────────────────────────────────────────────────

export default function EstudoDeTemposPage() {
  // ── Navigation ──
  const [activeTab, setActiveTab] = useState<StudyTab>('cronometro');

  // ── Storage states ──
  const [motivos, setMotivos] = useState<MotivoConfig[]>([]);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [currentCycleName, setCurrentCycleName] = useState<string>('Ciclo de Trabalho #1');

  // ── Input states ──
  const [newMotivoText, setNewMotivoText] = useState('');
  const [newMotivoType, setNewMotivoType] = useState<LeanActivityType>('NVA');
  const [currentObservation, setCurrentObservation] = useState('');

  // ── Active timers ──
  const [activeTimers, setActiveTimers] = useState<{
    [motivo: string]: { startTime: number; elapsedMs: number; isRunning: boolean };
  }>({});
  const [focusedMotivo, setFocusedMotivo] = useState<string | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number>(35);

  // ── Statistics config ──
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [toleratedError, setToleratedError] = useState<number>(0.05);
  const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

  // ── History view ──
  const [historyViewMode, setHistoryViewMode] = useState<'cycles' | 'flat'>('cycles');

  // ── Load from localStorage ──
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('lean_crono_records_v2');
      const savedMotivos = localStorage.getItem('lean_crono_motivos_v2');
      const savedCycle = localStorage.getItem('lean_crono_current_cycle');

      if (savedData) setRecords(JSON.parse(savedData));
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
      console.error('Error loading time study data:', e);
    }
  }, []);

  // ── Persistence helpers ──
  const saveRecords = (r: TimeRecord[]) => {
    setRecords(r);
    localStorage.setItem('lean_crono_records_v2', JSON.stringify(r));
  };
  const saveMotivos = (m: MotivoConfig[]) => {
    setMotivos(m);
    localStorage.setItem('lean_crono_motivos_v2', JSON.stringify(m));
  };
  const updateCurrentCycle = (n: number) => {
    setCurrentCycle(n);
    setCurrentCycleName(`Ciclo de Trabalho #${n}`);
    localStorage.setItem('lean_crono_current_cycle', n.toString());
  };

  // ── Timer tick ──
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers((prev) => {
        let hasRunning = false;
        const updated = { ...prev };
        const now = Date.now();
        Object.keys(updated).forEach((m) => {
          if (updated[m]?.isRunning) {
            hasRunning = true;
            updated[m] = { ...updated[m], elapsedMs: now - updated[m].startTime };
          }
        });
        return hasRunning ? updated : prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // ── Timer actions ──
  const handleStartTimer = (motivo: string) => {
    const now = Date.now();
    setActiveTimers((prev) => {
      const current = prev[motivo];
      const start = current ? now - current.elapsedMs : now;
      return { ...prev, [motivo]: { startTime: start, elapsedMs: current ? current.elapsedMs : 0, isRunning: true } };
    });
    setFocusedMotivo(motivo);
  };

  const handlePauseTimer = (motivo: string) => {
    setActiveTimers((prev) => {
      if (!prev[motivo]) return prev;
      return { ...prev, [motivo]: { ...prev[motivo], isRunning: false } };
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
    setActiveTimers((prev) => {
      const next = { ...prev };
      delete next[motivo];
      return next;
    });
    if (focusedMotivo === motivo) setFocusedMotivo(null);
  };

  const handleResetTimer = (motivo: string) => {
    setActiveTimers((prev) => {
      const next = { ...prev };
      delete next[motivo];
      return next;
    });
  };

  const handleCompleteCycle = () => {
    const nextNum = currentCycle + 1;
    updateCurrentCycle(nextNum);
    alert(`🎉 Ciclo #${currentCycle} finalizado! Iniciando Ciclo #${nextNum}.`);
  };

  const handleAddMotivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMotivoText.trim()) return;
    const name = newMotivoText.trim();
    if (motivos.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      alert('Este motivo já existe!');
      return;
    }
    const palette = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#38bdf8', '#10b981', '#64748b'];
    const newConfig: MotivoConfig = { name, type: newMotivoType, color: palette[motivos.length % palette.length] };
    saveMotivos([...motivos, newConfig]);
    setNewMotivoText('');
  };

  const handleDeleteMotivo = (name: string) => {
    if (confirm(`Remover "${name}"?`)) {
      saveMotivos(motivos.filter((m) => m.name !== name));
      handleResetTimer(name);
    }
  };

  const handleDeleteRecord = (id: string) => saveRecords(records.filter((r) => r.id !== id));

  const handleUpdateRecordObservation = (id: string, newObs: string) => {
    saveRecords(records.map((r) => (r.id === id ? { ...r, observation: newObs } : r)));
  };

  const handleClearAll = () => {
    if (confirm('Apagar todo o histórico de tempos?')) {
      saveRecords([]);
      setActiveTimers({});
      setFocusedMotivo(null);
      updateCurrentCycle(1);
    }
  };

  const handleDownloadCSV = () => {
    if (records.length === 0) { alert('Nenhum dado para exportar.'); return; }
    let csv = '\uFEFF';
    csv += 'ID,Ciclo,Nome do Ciclo,Data/Hora,Motivo,Tipo Lean,Tempo (Segundos),Tempo Formatado (MM:SS),Observacao,Custo Estimado (R$)\n';
    records.forEach((r) => {
      const mins = Math.floor(r.timeSeconds / 60);
      const secs = r.timeSeconds % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const cost = ((r.timeSeconds / 3600) * hourlyRate).toFixed(2);
      csv += `"${r.id}",${r.cycleNumber},"${r.cycleName.replace(/"/g, '""')}","${r.date.replace(/"/g, '""')}","${r.motivo.replace(/"/g, '""')}","${r.type}",${r.timeSeconds},"${formatted}","${(r.observation || '').replace(/"/g, '""')}",${cost}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estudo_tempos_ciclos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Format helpers ──
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const decimal = Math.floor((ms % 1000) / 100);
    if (hours > 0) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${decimal}`;
  };

  // ── KPI calculations ──
  const totalSeconds = useMemo(() => records.reduce((acc, r) => acc + r.timeSeconds, 0), [records]);
  const vaSeconds = useMemo(() => records.filter((r) => r.type === 'VA').reduce((acc, r) => acc + r.timeSeconds, 0), [records]);
  const nvaSeconds = useMemo(() => records.filter((r) => r.type === 'NVA').reduce((acc, r) => acc + r.timeSeconds, 0), [records]);
  const nnvaSeconds = useMemo(() => records.filter((r) => r.type === 'NNVA').reduce((acc, r) => acc + r.timeSeconds, 0), [records]);

  const vaPercentage = totalSeconds > 0 ? ((vaSeconds / totalSeconds) * 100).toFixed(1) : '0.0';
  const nvaPercentage = totalSeconds > 0 ? ((nvaSeconds / totalSeconds) * 100).toFixed(1) : '0.0';
  const nnvaPercentage = totalSeconds > 0 ? ((nnvaSeconds / totalSeconds) * 100).toFixed(1) : '0.0';
  const estimatedWastedCost = useMemo(() => (nvaSeconds / 3600) * hourlyRate, [nvaSeconds, hourlyRate]);

  // ── Statistical sample size ──
  const statsCalc = useMemo(() => {
    const n = records.length;
    if (n < 2) {
      return { sampleSizeCurrent: n, mean: n === 1 ? records[0].timeSeconds : 0, stdDev: 0, cv: 0, z: confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.9 ? 1.645 : 1.96, error: toleratedError, requiredN: 0, isReliable: false, pendingSamples: 0 };
    }
    const times = records.map((r) => r.timeSeconds);
    const sum = times.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    const variance = times.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0;
    const z = confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.9 ? 1.645 : 1.96;
    const e = toleratedError;
    let requiredN = 0;
    if (mean > 0 && e > 0) {
      const term = (z * stdDev) / (e * mean);
      requiredN = Math.ceil(Math.pow(term, 2));
    }
    const isReliable = n >= requiredN && requiredN > 0;
    return { sampleSizeCurrent: n, mean: Number(mean.toFixed(2)), stdDev: Number(stdDev.toFixed(2)), cv: Number((cv * 100).toFixed(2)), z, error: e, requiredN, isReliable, pendingSamples: Math.max(0, requiredN - n) };
  }, [records, confidenceLevel, toleratedError]);

  // ── Grouped cycles ──
  const groupedCycles = useMemo(() => {
    const map: { [cycle: number]: TimeRecord[] } = {};
    records.forEach((r) => {
      if (!map[r.cycleNumber]) map[r.cycleNumber] = [];
      map[r.cycleNumber].push(r);
    });
    return Object.entries(map)
      .map(([cycleNum, items]) => {
        const cTotal = items.reduce((acc, x) => acc + x.timeSeconds, 0);
        const cVa = items.filter((x) => x.type === 'VA').reduce((acc, x) => acc + x.timeSeconds, 0);
        return {
          cycleNumber: Number(cycleNum),
          cycleName: items[0]?.cycleName || `Ciclo #${cycleNum}`,
          items,
          totalTime: cTotal,
          vaTime: cVa,
          nvaTime: items.filter((x) => x.type === 'NVA').reduce((acc, x) => acc + x.timeSeconds, 0),
          efficiency: cTotal > 0 ? ((cVa / cTotal) * 100).toFixed(1) : '0.0',
        };
      })
      .sort((a, b) => b.cycleNumber - a.cycleNumber);
  }, [records]);

  // ── Motivo stats (Pareto) ──
  const motivoStats = useMemo(() => {
    const map: { [key: string]: { totalTime: number; count: number; type: LeanActivityType } } = {};
    records.forEach((r) => {
      if (!map[r.motivo]) map[r.motivo] = { totalTime: 0, count: 0, type: r.type };
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
      .sort((a, b) => b.totalTime - a.totalTime);
  }, [records, totalSeconds]);

  // ── Tab config ──
  const tabs: { id: StudyTab; label: string; step: number; icon: React.ReactNode }[] = [
    { id: 'cronometro', label: 'Cronômetro', step: 1, icon: <Timer size={16} /> },
    { id: 'analise', label: 'Análise', step: 2, icon: <BarChart3 size={16} /> },
    { id: 'estatistica', label: 'Estatística', step: 3, icon: <Sigma size={16} /> },
    { id: 'historico', label: 'Histórico', step: 4, icon: <Clock size={16} /> },
  ];

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div className="crono-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '100%' }}>

      {/* ─── INLINE RESPONSIVE STYLES ───────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .crono-page-container {
          padding-bottom: 2rem;
        }
        .crono-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .crono-tabs-bar {
          display: flex;
          gap: 0.35rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 2px;
        }
        .crono-tabs-bar::-webkit-scrollbar {
          display: none;
        }
        .crono-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.65rem 1rem;
          font-size: 0.8125rem;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          border-radius: 8px 8px 0 0;
          white-space: nowrap;
          flex-shrink: 0;
          min-height: 44px;
        }
        .crono-main-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        .crono-digital-timer {
          font-family: var(--font-mono);
          font-size: clamp(2.75rem, 9vw, 4.25rem);
          font-weight: 900;
          letter-spacing: 0.04em;
          line-height: 1.1;
          margin: 0.5rem 0 1rem;
        }
        .crono-action-btn {
          min-height: 48px;
          font-size: 0.875rem;
          font-weight: 800;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.65rem 1.25rem;
          touch-action: manipulation;
          cursor: pointer;
        }
        .crono-activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          transition: all 0.15s ease;
          gap: 0.5rem;
        }
        .crono-activity-touch-btn {
          min-height: 38px;
          min-width: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          touch-action: manipulation;
        }
        .crono-kpis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
        }
        .crono-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 0.6rem;
        }
        @media (max-width: 860px) {
          .crono-main-layout {
            grid-template-columns: 1fr !important;
            gap: 1rem;
          }
          .crono-kpis-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem;
          }
          .crono-header-title {
            font-size: 1.15rem !important;
          }
          .crono-digital-timer {
            font-size: clamp(2.5rem, 11vw, 3.5rem) !important;
          }
        }
        @media (max-width: 480px) {
          .crono-kpis-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .crono-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .crono-tab-btn {
            padding: 0.55rem 0.75rem !important;
            font-size: 0.75rem !important;
          }
        }
      ` }} />

      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="crono-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '220px' }}>
          <Link href="/agente/ferramentas" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', minHeight: '36px', padding: '0.35rem 0.65rem' }}>
            <ArrowLeft size={16} /> <span style={{ display: 'inline' }}>Voltar</span>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontFamily: 'var(--font-mono)' }}>
                ESTUDO DE TEMPOS
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontFamily: 'var(--font-mono)' }}>
                Ciclo #{currentCycle}
              </span>
            </div>
            <h2 className="crono-header-title" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: '0.15rem 0 0 0' }}>
              Estudo de Tempos
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={handleCompleteCycle} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minHeight: '36px', fontWeight: 800 }} title="Fechar ciclo atual e iniciar o próximo">
            <CheckCircle2 size={15} /> Fechar Ciclo #{currentCycle}
          </button>
          <button onClick={handleDownloadCSV} disabled={records.length === 0} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: records.length === 0 ? 0.5 : 1, minHeight: '36px' }} title="Exportar CSV">
            <Download size={14} /> <span className="hidden sm:inline">CSV</span>
          </button>
          <button onClick={handleClearAll} disabled={records.length === 0} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: records.length === 0 ? 0.5 : 1, minHeight: '36px' }} title="Limpar Tudo">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ─── TAB NAVIGATION (Touch-Friendly Scrollable) ───────────────────────── */}
      <div className="crono-tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="crono-tab-btn"
            style={{
              fontWeight: activeTab === tab.id ? 800 : 600,
              color: activeTab === tab.id ? '#22d3ee' : '#94a3b8',
              backgroundColor: activeTab === tab.id ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #22d3ee' : '2px solid transparent',
            }}
          >
            <span style={{
              width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.675rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
              backgroundColor: activeTab === tab.id ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)',
              color: activeTab === tab.id ? '#020617' : '#94a3b8',
            }}>
              {tab.step}
            </span>
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: CRONÔMETRO (Mobile-First / Chão de Fábrica)                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'cronometro' && (
        <div className="crono-main-layout">

          {/* LEFT / TOP: Timer Display & Touch Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Main Timer Box */}
            <div
              className="card"
              style={{
                padding: '1.5rem 1.25rem',
                backgroundColor: '#0f172a',
                border: focusedMotivo && activeTimers[focusedMotivo]?.isRunning
                  ? '1.5px solid rgba(6, 182, 212, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center',
                borderRadius: '16px',
                boxShadow: focusedMotivo && activeTimers[focusedMotivo]?.isRunning
                  ? '0 10px 30px -5px rgba(6, 182, 212, 0.25)'
                  : '0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              {/* Activity Name & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {focusedMotivo ? (
                  <>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc' }}>
                      {focusedMotivo}
                    </span>
                    <span style={{
                      fontSize: '0.675rem', fontWeight: 800, padding: '0.12rem 0.45rem', borderRadius: '4px',
                      backgroundColor: typeBg(motivos.find((m) => m.name === focusedMotivo)?.type || 'NVA'),
                      color: typeColor(motivos.find((m) => m.name === focusedMotivo)?.type || 'NVA'),
                      border: `1px solid ${typeBorder(motivos.find((m) => m.name === focusedMotivo)?.type || 'NVA')}`,
                    }}>
                      {typeLabel(motivos.find((m) => m.name === focusedMotivo)?.type || 'NVA')}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                    Selecione uma atividade abaixo para cronometrar 👇
                  </span>
                )}
              </div>

              {/* Big Digital Time */}
              <div
                className="crono-digital-timer"
                style={{
                  color: focusedMotivo && activeTimers[focusedMotivo]?.isRunning ? '#22d3ee' : '#ffffff',
                  textShadow: focusedMotivo && activeTimers[focusedMotivo]?.isRunning ? '0 0 24px rgba(6, 182, 212, 0.6)' : 'none',
                }}
              >
                {focusedMotivo && activeTimers[focusedMotivo] ? formatTime(activeTimers[focusedMotivo].elapsedMs) : '00:00.0'}
              </div>

              {/* Observation Field */}
              {focusedMotivo && (
                <input
                  type="text"
                  placeholder="Observação da medição (opcional)..."
                  value={currentObservation}
                  onChange={(e) => setCurrentObservation(e.target.value)}
                  style={{
                    width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: '#090e1a',
                    color: '#ffffff', fontSize: '0.84375rem', outline: 'none', marginBottom: '1rem',
                  }}
                />
              )}

              {/* Large Thumb-Friendly Control Buttons */}
              {focusedMotivo && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'stretch' }}>
                  {activeTimers[focusedMotivo]?.isRunning ? (
                    <button onClick={() => handlePauseTimer(focusedMotivo)} className="crono-action-btn" style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.25)', border: '1.5px solid #fbbf24',
                      color: '#fbbf24',
                    }}>
                      <Pause size={20} /> Pausar
                    </button>
                  ) : (
                    <button onClick={() => handleStartTimer(focusedMotivo)} className="crono-action-btn" style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.25)', border: '1.5px solid #34d399',
                      color: '#34d399',
                    }}>
                      <Play size={20} /> {activeTimers[focusedMotivo] ? 'Retomar' : 'Iniciar'}
                    </button>
                  )}

                  <button onClick={() => handleStopAndSaveTimer(focusedMotivo)} className="crono-action-btn" style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.25)', border: '1.5px solid #f87171',
                    color: '#f87171',
                  }}>
                    <Square size={20} /> Gravar
                  </button>

                  <button onClick={() => handleResetTimer(focusedMotivo)} className="crono-action-btn" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8', padding: '0.65rem 0.85rem',
                  }} title="Zerar sem salvar">
                    <RotateCcw size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Mini summary strip (KPIs rápidos do ciclo) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Medições</span>
                <strong style={{ fontSize: '1.05rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{records.length}</strong>
              </div>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#34d399', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>VA (Valor)</span>
                <strong style={{ fontSize: '1.05rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>{vaPercentage}%</strong>
              </div>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#f87171', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>NVA (Perda)</span>
                <strong style={{ fontSize: '1.05rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>{nvaPercentage}%</strong>
              </div>
            </div>
          </div>

          {/* RIGHT / BOTTOM: Activity Categories & Quick Triggers */}
          <div className="card" style={{ padding: '1rem 1.15rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={16} color="#22d3ee" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  Atividades & Motivos
                </h4>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{motivos.length} cadastradas</span>
            </div>

            {/* Quick Add Form (Mobile Responsive) */}
            <form onSubmit={handleAddMotivo} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <input
                type="text" className="form-control"
                placeholder="Nova atividade na linha..."
                value={newMotivoText}
                onChange={(e) => setNewMotivoText(e.target.value)}
                style={{ flex: '1 1 140px', fontSize: '0.8125rem', minHeight: '38px' }}
              />
              <select value={newMotivoType} onChange={(e) => setNewMotivoType(e.target.value as LeanActivityType)} className="form-select" style={{ width: 'auto', fontSize: '0.8125rem', minHeight: '38px' }}>
                <option value="NVA">🔴 NVA (Perda)</option>
                <option value="VA">🟢 VA (Valor)</option>
                <option value="NNVA">🟡 NNVA</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minHeight: '38px', fontWeight: 800 }}>
                <Plus size={15} /> Add
              </button>
            </form>

            {/* Activities List (Touch-Friendly) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '520px', overflowY: 'auto' }}>
              {motivos.map((m) => {
                const active = activeTimers[m.name];
                const isRunning = active?.isRunning;
                const isFocused = focusedMotivo === m.name;

                return (
                  <div
                    key={m.name}
                    className="crono-activity-item"
                    style={{
                      backgroundColor: isRunning ? 'rgba(16, 185, 129, 0.14)' : isFocused ? 'rgba(6, 182, 212, 0.1)' : '#090e1a',
                      border: isRunning ? '1.5px solid rgba(16, 185, 129, 0.5)' : isFocused ? '1.5px solid rgba(6, 182, 212, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {/* Left: Info & Tap to focus */}
                    <div
                      onClick={() => setFocusedMotivo(m.name)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 0, cursor: 'pointer' }}
                    >
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: m.color, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.8125rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.name}
                          </strong>
                          <span style={{
                            fontSize: '0.575rem', fontWeight: 800, padding: '0.05rem 0.3rem', borderRadius: '3px',
                            backgroundColor: typeBg(m.type), color: typeColor(m.type), border: `1px solid ${typeBorder(m.type)}`,
                          }}>
                            {m.type}
                          </span>
                        </div>
                        {active && (
                          <div style={{ fontSize: '0.725rem', color: '#22d3ee', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '0.1rem' }}>
                            ⏱️ {formatTime(active.elapsedMs)} {isRunning ? '(gravando...)' : '(pausado)'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                      {isRunning ? (
                        <>
                          <button onClick={() => handlePauseTimer(m.name)} className="crono-activity-touch-btn btn btn-warning btn-sm" title="Pausar">
                            <Pause size={14} />
                          </button>
                          <button onClick={() => handleStopAndSaveTimer(m.name)} className="crono-activity-touch-btn btn btn-danger btn-sm" title="Gravar e Salvar">
                            <Square size={14} />
                          </button>
                        </>
                      ) : active ? (
                        <>
                          <button onClick={() => handleStartTimer(m.name)} className="crono-activity-touch-btn btn btn-success btn-sm" title="Retomar">
                            <Play size={14} />
                          </button>
                          <button onClick={() => handleStopAndSaveTimer(m.name)} className="crono-activity-touch-btn btn btn-danger btn-sm" title="Gravar e Salvar">
                            <Square size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartTimer(m.name)}
                          className="crono-activity-touch-btn btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', fontWeight: 800, gap: '0.25rem' }}
                        >
                          <Play size={13} /> Iniciar
                        </button>
                      )}
                      <button onClick={() => handleDeleteMotivo(m.name)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.3rem', minHeight: '36px' }} title="Excluir">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: ANÁLISE (Mobile Dashboard & Pareto)                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analise' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* KPI Cards Grid */}
          <div className="crono-kpis-grid">
            <div className="card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #06b6d4', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.675rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Tempo Total</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                {Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {records.length} medições • #{currentCycle} ciclos
              </span>
            </div>

            <div className="card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #10b981', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.675rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>Valor Agregado (VA)</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>{vaPercentage}%</h3>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{Math.floor(vaSeconds / 60)}m {vaSeconds % 60}s produtivo</span>
            </div>

            <div className="card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #ef4444', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.675rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase' }}>Desperdício (NVA)</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f87171', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>{nvaPercentage}%</h3>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{Math.floor(nvaSeconds / 60)}m {nvaSeconds % 60}s perdas</span>
            </div>

            <div className="card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #f59e0b', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.675rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>Custo Perda</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>{formatCurrency(estimatedWastedCost)}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>H/H:</span>
                <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                  style={{ width: '46px', padding: '0.1rem 0.25rem', fontSize: '0.7rem', backgroundColor: '#090e1a', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}
                />
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>R\$/h</span>
              </div>
            </div>
          </div>

          {/* VA/NVA/NNVA Distribution Bar */}
          {totalSeconds > 0 && (
            <div className="card" style={{ padding: '0.85rem 1rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                Distribuição VA / NVA / NNVA
              </span>
              <div style={{ width: '100%', height: '24px', borderRadius: '6px', overflow: 'hidden', display: 'flex', backgroundColor: '#090e1a' }}>
                {Number(vaPercentage) > 0 && (
                  <div style={{ width: `${vaPercentage}%`, height: '100%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#020617' }}>{vaPercentage}% VA</span>
                  </div>
                )}
                {Number(nvaPercentage) > 0 && (
                  <div style={{ width: `${nvaPercentage}%`, height: '100%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ffffff' }}>{nvaPercentage}% NVA</span>
                  </div>
                )}
                {Number(nnvaPercentage) > 0 && (
                  <div style={{ width: `${nnvaPercentage}%`, height: '100%', backgroundColor: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#020617' }}>{nnvaPercentage}% NNVA</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pareto Chart */}
          <div className="card" style={{ padding: '1rem 1.15rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
              <BarChart3 size={16} color="#22d3ee" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                Pareto de Tempos & Gargalos
              </h4>
            </div>

            {motivoStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.8125rem', margin: 0 }}>Nenhuma medição ainda. Cronometre atividades para ver o Pareto.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {motivoStats.map((item) => {
                  const maxTime = motivoStats[0]?.totalTime || 1;
                  const barWidth = Math.max(5, (item.totalTime / maxTime) * 100);
                  return (
                    <div key={item.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem', fontSize: '0.78125rem' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff', maxWidth: '65%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name} <span style={{ color: '#94a3b8', fontSize: '0.675rem' }}>({item.count}x)</span>
                        </span>
                        <strong style={{ color: typeColor(item.type), fontFamily: 'var(--font-mono)' }}>
                          {item.totalTime}s ({item.percentage}%)
                        </strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#090e1a', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${barWidth}%`, height: '100%',
                          backgroundColor: item.type === 'VA' ? '#10b981' : item.type === 'NNVA' ? '#06b6d4' : '#ef4444',
                          borderRadius: '9999px', transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kaizen Opportunity */}
          {nvaSeconds > 0 && (
            <div className="card" style={{ padding: '1rem', backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Sparkles size={16} color="#fbbf24" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 900, margin: 0, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  Oportunidade de Kaizen Detectada
                </h4>
              </div>
              <p style={{ fontSize: '0.78125rem', color: '#cbd5e1', lineHeight: 1.35, margin: '0 0 0.65rem' }}>
                <strong style={{ color: '#fbbf24' }}>{Math.floor(nvaSeconds / 60)} min</strong> de desperdício identificados.
              </p>
              <Link href="/agente/ferramentas/calculadora-roi" className="btn btn-warning btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', minHeight: '38px', fontWeight: 800 }}>
                <Zap size={15} /> Abrir Calculadora de ROI
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: ESTATÍSTICA (Confiabilidade & N' Amostral)                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'estatistica' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Config + Diagnosis Card */}
          <div className="card" style={{
            padding: '1.25rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderLeft: statsCalc.isReliable ? '4px solid #10b981' : '4px solid #f59e0b',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sigma size={20} color={statsCalc.isReliable ? '#34d399' : '#fbbf24'} />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    Confiabilidade Amostral (N&apos;)
                  </h3>
                  <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>
                    Validação estatística da amostragem
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#cbd5e1' }}>Confiança:</span>
                  <select value={confidenceLevel} onChange={(e) => setConfidenceLevel(Number(e.target.value))} className="form-select"
                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.45rem', width: 'auto', backgroundColor: '#090e1a', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', minHeight: '34px' }}
                  >
                    <option value={0.9}>90%</option>
                    <option value={0.95}>95% (Padrão)</option>
                    <option value={0.99}>99%</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#cbd5e1' }}>Erro:</span>
                  <select value={toleratedError} onChange={(e) => setToleratedError(Number(e.target.value))} className="form-select"
                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.45rem', width: 'auto', backgroundColor: '#090e1a', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', minHeight: '34px' }}
                  >
                    <option value={0.03}>±3%</option>
                    <option value={0.05}>±5% (Padrão)</option>
                    <option value={0.1}>±10%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Metrics Grid */}
            <div className="crono-stats-grid" style={{ marginBottom: '0.85rem' }}>
              <div style={{ backgroundColor: '#090e1a', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Amostras (n)</span>
                <strong style={{ fontSize: '1.15rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{statsCalc.sampleSizeCurrent}</strong>
              </div>
              <div style={{ backgroundColor: '#090e1a', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Média (x̄)</span>
                <strong style={{ fontSize: '1.15rem', color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{statsCalc.mean}s</strong>
              </div>
              <div style={{ backgroundColor: '#090e1a', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Desvio (s)</span>
                <strong style={{ fontSize: '1.15rem', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>{statsCalc.stdDev}s</strong>
              </div>
              <div style={{ backgroundColor: '#090e1a', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>CV</span>
                <strong style={{ fontSize: '1.15rem', color: statsCalc.cv > 30 ? '#f87171' : '#34d399', fontFamily: 'var(--font-mono)' }}>{statsCalc.cv}%</strong>
              </div>
              <div style={{
                backgroundColor: statsCalc.isReliable ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                padding: '0.65rem 0.5rem', borderRadius: '8px', textAlign: 'center',
                border: `1px solid ${statsCalc.isReliable ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
              }}>
                <span style={{ fontSize: '0.6rem', color: statsCalc.isReliable ? '#34d399' : '#fbbf24', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                  Mínimo (N&apos;)
                </span>
                <strong style={{ fontSize: '1.15rem', color: statsCalc.isReliable ? '#34d399' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  {statsCalc.requiredN} {statsCalc.isReliable ? '✅' : `(−${statsCalc.pendingSamples})`}
                </strong>
              </div>
            </div>

            {/* Diagnosis Message */}
            <div style={{
              padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78125rem', display: 'flex', alignItems: 'center', gap: '0.45rem',
              backgroundColor: statsCalc.isReliable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${statsCalc.isReliable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              color: statsCalc.isReliable ? '#34d399' : '#fbbf24',
              lineHeight: 1.35,
            }}>
              {statsCalc.isReliable ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <Clock size={16} style={{ flexShrink: 0 }} />}
              <span>
                {statsCalc.isReliable
                  ? `Amostragem Confiável! (${statsCalc.sampleSizeCurrent} medições atendem o mínimo de ${statsCalc.requiredN}).`
                  : `Realize mais ${statsCalc.pendingSamples} medições para atingir a confiabilidade mínima de ${statsCalc.requiredN} amostras.`}
              </span>
            </div>

            {/* Math Toggle */}
            <button onClick={() => setShowMathDetails(!showMathDetails)} className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.85rem', minHeight: '34px' }}>
              <Calculator size={14} /> {showMathDetails ? 'Ocultar Memória' : 'Ver Memória de Cálculo'}
            </button>

            {showMathDetails && (
              <div style={{
                marginTop: '0.65rem', padding: '0.75rem', backgroundColor: '#090e1a', borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)', fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: '#cbd5e1', lineHeight: 1.6,
              }}>
                <div><strong>Fórmula:</strong> N&apos; = [ (z · s) / (e · x̄) ]²</div>
                <div><strong>Parâmetros:</strong> z = {statsCalc.z} | e = {(toleratedError * 100).toFixed(0)}%</div>
                <div><strong>Média (x̄):</strong> {statsCalc.mean}s | <strong>Desvio (s):</strong> {statsCalc.stdDev}s</div>
                <div style={{ color: '#22d3ee', fontWeight: 800, marginTop: '0.2rem' }}>
                  N&apos; = [ ({statsCalc.z} × {statsCalc.stdDev}) / ({statsCalc.error} × {statsCalc.mean}) ]² = {statsCalc.requiredN}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: HISTÓRICO (Tabela & Visualização em Ciclos)                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'historico' && (
        <div className="card" style={{ padding: '1rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                Histórico ({records.length} medições)
              </h4>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Registros por ciclo ou em lista</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button onClick={() => setHistoryViewMode('cycles')} className="btn btn-sm" style={{
                backgroundColor: historyViewMode === 'cycles' ? '#06b6d4' : '#090e1a',
                color: historyViewMode === 'cycles' ? '#020617' : '#94a3b8',
                border: historyViewMode === 'cycles' ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: 800, fontSize: '0.725rem', minHeight: '34px',
              }}>
                Ciclos ({groupedCycles.length})
              </button>
              <button onClick={() => setHistoryViewMode('flat')} className="btn btn-sm" style={{
                backgroundColor: historyViewMode === 'flat' ? '#06b6d4' : '#090e1a',
                color: historyViewMode === 'flat' ? '#020617' : '#94a3b8',
                border: historyViewMode === 'flat' ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: 800, fontSize: '0.725rem', minHeight: '34px',
              }}>
                Lista ({records.length})
              </button>
            </div>
          </div>

          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
              <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.84375rem', margin: 0 }}>Nenhuma medição salva ainda.</p>
            </div>
          ) : historyViewMode === 'cycles' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {groupedCycles.map((cycle) => (
                <div key={cycle.cycleNumber} style={{ border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    padding: '0.6rem 0.85rem', backgroundColor: '#0d1527', borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        backgroundColor: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)',
                        fontWeight: 800, fontSize: '0.675rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontFamily: 'var(--font-mono)',
                      }}>
                        #{cycle.cycleNumber}
                      </span>
                      <strong style={{ fontSize: '0.8125rem', color: '#ffffff' }}>{cycle.cycleName}</strong>
                      <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>({cycle.items.length})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#cbd5e1' }}>
                        Total: <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{cycle.totalTime}s</strong>
                      </span>
                      <span style={{ color: '#34d399', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        VA: {cycle.efficiency}%
                      </span>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className="data-table" style={{ minWidth: '450px' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '0.45rem 0.75rem', fontSize: '0.675rem', color: '#94a3b8' }}>ATIVIDADE</th>
                          <th style={{ textAlign: 'center', padding: '0.45rem 0.5rem', fontSize: '0.675rem', color: '#94a3b8' }}>TIPO</th>
                          <th style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontSize: '0.675rem', color: '#94a3b8' }}>DURAÇÃO</th>
                          <th style={{ textAlign: 'left', padding: '0.45rem 0.75rem', fontSize: '0.675rem', color: '#94a3b8' }}>OBS</th>
                          <th style={{ textAlign: 'center', padding: '0.45rem 0.5rem', fontSize: '0.675rem', color: '#94a3b8' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cycle.items.map((item) => {
                          const mins = Math.floor(item.timeSeconds / 60);
                          const secs = item.timeSeconds % 60;
                          return (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                              <td style={{ padding: '0.45rem 0.75rem', fontSize: '0.78125rem', fontWeight: 700, color: '#ffffff' }}>{item.motivo}</td>
                              <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.08rem 0.3rem', borderRadius: '3px', backgroundColor: typeBg(item.type), color: typeColor(item.type), border: `1px solid ${typeBorder(item.type)}` }}>
                                  {typeLabel(item.type)}
                                </span>
                              </td>
                              <td style={{ padding: '0.45rem 0.75rem', textAlign: 'right', fontSize: '0.78125rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                                {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                              </td>
                              <td style={{ padding: '0.45rem 0.75rem' }}>
                                <input type="text" defaultValue={item.observation || ''} placeholder="..." onBlur={(e) => handleUpdateRecordObservation(item.id, e.target.value)}
                                  style={{ width: '100%', padding: '0.2rem 0.35rem', fontSize: '0.725rem', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', backgroundColor: '#090e1a', color: '#ffffff' }}
                                />
                              </td>
                              <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>
                                <button onClick={() => handleDeleteRecord(item.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem' }} title="Excluir">
                                  <Trash2 size={13} />
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
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="data-table" style={{ minWidth: '480px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.675rem', color: '#94a3b8' }}>CICLO</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.675rem', color: '#94a3b8' }}>ATIVIDADE</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.675rem', color: '#94a3b8' }}>TIPO</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '0.675rem', color: '#94a3b8' }}>DURAÇÃO</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.675rem', color: '#94a3b8' }}>OBS</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.675rem', color: '#94a3b8' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => {
                    const mins = Math.floor(rec.timeSeconds / 60);
                    const secs = rec.timeSeconds % 60;
                    return (
                      <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '0.5rem', fontSize: '0.725rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>#{rec.cycleNumber}</td>
                        <td style={{ padding: '0.5rem', fontSize: '0.78125rem', fontWeight: 700, color: '#ffffff' }}>{rec.motivo}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.08rem 0.3rem', borderRadius: '3px', backgroundColor: typeBg(rec.type), color: typeColor(rec.type), border: `1px solid ${typeBorder(rec.type)}` }}>
                            {typeLabel(rec.type)}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.78125rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <input type="text" defaultValue={rec.observation || ''} placeholder="..." onBlur={(e) => handleUpdateRecordObservation(rec.id, e.target.value)}
                            style={{ width: '100%', padding: '0.2rem 0.35rem', fontSize: '0.725rem', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', backgroundColor: '#090e1a', color: '#ffffff' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteRecord(rec.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem' }} title="Excluir">
                            <Trash2 size={13} />
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
      )}
    </div>
  );
}
