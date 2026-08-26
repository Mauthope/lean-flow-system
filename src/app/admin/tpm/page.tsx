'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Settings,
  ArrowLeft,
  Wrench,
  Shield,
  Activity,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Tag,
  CheckSquare,
  BarChart3,
  Layers,
  Calendar,
  User,
  Sliders,
  ChevronRight,
  TrendingUp,
  XCircle,
  FileText,
  Zap,
  Droplet,
  Flame,
  RotateCcw,
} from 'lucide-react';
import {
  TpmMachine,
  TpmAudit,
  TpmTag,
  TpmMaintenanceMetrics,
  Sector,
  TpmTagType,
  TpmAuditChecklistItem,
} from '@/lib/types';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime, formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

const DEFAULT_CHECKLIST_ITEMS: Omit<TpmAuditChecklistItem, 'id' | 'score' | 'status'>[] = [
  {
    title: '1. Limpeza Geral & 5S Básico',
    description: 'Estrutura, painéis, esteiras e cilindros isentos de pó de polímero, cavacos e óleo.',
  },
  {
    title: '2. Lubrificação & Níveis de Fluidos',
    description: 'Visores de nível no centro da faixa verde, graxeiras limpas, abastecidas e identificadas.',
  },
  {
    title: '3. Fixações, Parafusos & Ausência de Folgas',
    description: 'Parafusos de mancais e bases com torque conferido, sem folgas excessivas ou vibrações anômalas.',
  },
  {
    title: '4. Segurança & Proteções NR-12',
    description: 'Cortinas ópticas de segurança, sensores de porta e botões de parada de emergência 100% operantes.',
  },
  {
    title: '5. Identificação Visual & Padrões',
    description: 'Etiquetas de lubrificação, setas de sentido de giro e manômetros com faixas verde/vermelha legíveis.',
  },
  {
    title: '6. Condições Elétricas & Fiação',
    description: 'Painéis elétricos trancados com vedação íntegra, canaletas fechadas e cabos devidamente isolados.',
  },
  {
    title: '7. Estanqueidade (Zero Vazamentos)',
    description: 'Isenção total de vazamentos de ar comprimido, água de refrigeração e óleo hidráulico.',
  },
  {
    title: '8. Quadro de Manutenção Autônoma em Dia',
    description: 'Checklist diário da operação preenchido, assinado e anomalias apontadas no quadro visual.',
  },
];

export default function AdminTPMPage() {
  const { currentUser } = useAuth();

  // Estados principais de dados
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [machines, setMachines] = useState<TpmMachine[]>([]);
  const [audits, setAudits] = useState<TpmAudit[]>([]);
  const [tags, setTags] = useState<TpmTag[]>([]);
  const [metrics, setMetrics] = useState<TpmMaintenanceMetrics | null>(null);

  // Navegação e Filtros
  const [activeTab, setActiveTab] = useState<'maquinas' | 'auditorias' | 'etiquetas' | 'indicadores'>('maquinas');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('all');
  const [searchMachine, setSearchMachine] = useState<string>('');
  const [tagTypeFilter, setTagTypeFilter] = useState<'all' | 'vermelha' | 'azul'>('all');
  const [tagStatusFilter, setTagStatusFilter] = useState<string>('all');

  // Modais
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [resolveTagModal, setResolveTagModal] = useState<TpmTag | null>(null);

  // Form states: Nova Máquina
  const [newMachineSectorId, setNewMachineSectorId] = useState('');
  const [newMachineCode, setNewMachineCode] = useState('');
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineBrandModel, setNewMachineBrandModel] = useState('');
  const [newMachineCriticality, setNewMachineCriticality] = useState<'A' | 'B' | 'C'>('B');
  const [newMachineStatus, setNewMachineStatus] = useState<'operacional' | 'em_manutencao' | 'parada'>('operacional');
  const [newMachineDescription, setNewMachineDescription] = useState('');

  // Form states: Nova Auditoria
  const [auditMachineId, setAuditMachineId] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditDate, setAuditDate] = useState('');
  const [auditChecklist, setAuditChecklist] = useState<TpmAuditChecklistItem[]>([]);
  const [auditObservations, setAuditObservations] = useState('');

  // Form states: Nova Etiqueta TPM
  const [tagMachineId, setTagMachineId] = useState('');
  const [tagType, setTagType] = useState<TpmTagType>('vermelha');
  const [tagCategory, setTagCategory] = useState<TpmTag['category']>('mecanica');
  const [tagPriority, setTagPriority] = useState<TpmTag['priority']>('media');
  const [tagDescription, setTagDescription] = useState('');
  const [tagOpenedBy, setTagOpenedBy] = useState('');
  const [tagDueDate, setTagDueDate] = useState('');

  // Form states: Resolução de Etiqueta
  const [resolutionResolvedBy, setResolutionResolvedBy] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Carregar dados
  const loadData = () => {
    const s = dataService.getSectors();
    setSectors(s);
    setMachines(dataService.getTpmMachines());
    setAudits(dataService.getTpmAudits());
    setTags(dataService.getTpmTags());
    setMetrics(dataService.getTpmMaintenanceMetrics(selectedSectorId === 'all' ? undefined : selectedSectorId));
  };

  useEffect(() => {
    loadData();
  }, [selectedSectorId]);

  // Inicializar checklist padrão quando abre modal de auditoria
  const handleOpenNewAuditModal = (preselectedMachineId?: string) => {
    const targetMachId = preselectedMachineId || (machines[0]?.id || '');
    setAuditMachineId(targetMachId);
    setAuditorName(currentUser?.name || 'Gestor TPM');
    setAuditDate(new Date().toISOString().split('T')[0]);
    setAuditObservations('');

    const initialItems: TpmAuditChecklistItem[] = DEFAULT_CHECKLIST_ITEMS.map((item, idx) => ({
      id: `item_${idx + 1}`,
      title: item.title,
      description: item.description,
      status: 'conforme',
      score: 100,
      notes: '',
    }));
    setAuditChecklist(initialItems);
    setIsAuditModalOpen(true);
  };

  // Calcular nota da auditoria em tempo real
  const currentAuditScore = useMemo(() => {
    if (auditChecklist.length === 0) return 100;
    const totalScore = auditChecklist.reduce((acc, item) => {
      if (item.status === 'conforme') return acc + 100;
      if (item.status === 'parcial') return acc + 50;
      return acc + 0;
    }, 0);
    return Math.round(totalScore / auditChecklist.length);
  }, [auditChecklist]);

  // Abertura do modal de etiqueta com máquina pré-selecionada opcional
  const handleOpenNewTagModal = (preselectedMachineId?: string) => {
    setTagMachineId(preselectedMachineId || (machines[0]?.id || ''));
    setTagType('vermelha');
    setTagCategory('mecanica');
    setTagPriority('media');
    setTagDescription('');
    setTagOpenedBy(currentUser?.name || 'Operador / Agente');
    // Prazo padrão: 3 dias a partir de hoje
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setTagDueDate(d.toISOString().split('T')[0]);
    setIsTagModalOpen(true);
  };

  // Submissão: Nova Máquina
  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineSectorId || !newMachineCode.trim() || !newMachineName.trim()) return;

    const sector = sectors.find((s) => s.id === newMachineSectorId);
    dataService.createTpmMachine({
      sectorId: newMachineSectorId,
      sectorName: sector?.name || 'Fábrica',
      code: newMachineCode.trim(),
      name: newMachineName.trim(),
      brandModel: newMachineBrandModel.trim() || undefined,
      criticality: newMachineCriticality,
      status: newMachineStatus,
      description: newMachineDescription.trim() || undefined,
    });

    setIsMachineModalOpen(false);
    loadData();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Submissão: Nova Auditoria
  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = machines.find((m) => m.id === auditMachineId);
    if (!machine) return;

    let auditStatus: 'conforme' | 'atencao' | 'critico' = 'conforme';
    if (currentAuditScore < 70) auditStatus = 'critico';
    else if (currentAuditScore < 85) auditStatus = 'atencao';

    dataService.createTpmAudit({
      machineId: machine.id,
      machineName: machine.name,
      machineCode: machine.code,
      sectorId: machine.sectorId,
      sectorName: machine.sectorName,
      auditorName: auditorName.trim() || currentUser?.name || 'Auditor TPM',
      auditDate: new Date(auditDate).toISOString(),
      score: currentAuditScore,
      status: auditStatus,
      items: auditChecklist,
      observations: auditObservations.trim() || undefined,
    });

    setIsAuditModalOpen(false);
    loadData();
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
  };

  // Submissão: Nova Etiqueta
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = machines.find((m) => m.id === tagMachineId);
    if (!machine || !tagDescription.trim() || !tagDueDate) return;

    dataService.createTpmTag({
      machineId: machine.id,
      machineName: machine.name,
      machineCode: machine.code,
      sectorId: machine.sectorId,
      sectorName: machine.sectorName,
      type: tagType,
      category: tagCategory,
      priority: tagPriority,
      description: tagDescription.trim(),
      openedBy: tagOpenedBy.trim() || currentUser?.name || 'Operação',
      dueDate: new Date(tagDueDate).toISOString(),
    });

    setIsTagModalOpen(false);
    loadData();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  // Submissão: Conclusão / Resolução de Etiqueta
  const handleResolveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTagModal) return;

    dataService.updateTpmTagStatus(resolveTagModal.id, 'concluida', {
      resolvedBy: resolutionResolvedBy.trim() || currentUser?.name || 'Técnico de Manutenção',
      solutionNotes: resolutionNotes.trim() || 'Anomalia corrigida e equipamento liberado para produção.',
      resolvedAt: new Date().toISOString(),
    });

    setResolveTagModal(null);
    loadData();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  // Filtros de Máquinas
  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const matchSector = selectedSectorId === 'all' || m.sectorId === selectedSectorId;
      const matchSearch =
        searchMachine === '' ||
        m.name.toLowerCase().includes(searchMachine.toLowerCase()) ||
        m.code.toLowerCase().includes(searchMachine.toLowerCase());
      return matchSector && matchSearch;
    });
  }, [machines, selectedSectorId, searchMachine]);

  // Filtros de Auditorias
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      const matchSector = selectedSectorId === 'all' || a.sectorId === selectedSectorId;
      const matchSearch =
        searchMachine === '' ||
        a.machineName.toLowerCase().includes(searchMachine.toLowerCase()) ||
        a.machineCode.toLowerCase().includes(searchMachine.toLowerCase()) ||
        a.auditorName.toLowerCase().includes(searchMachine.toLowerCase());
      return matchSector && matchSearch;
    });
  }, [audits, selectedSectorId, searchMachine]);

  // Filtros de Etiquetas
  const filteredTags = useMemo(() => {
    const now = new Date();
    return tags.filter((t) => {
      const matchSector = selectedSectorId === 'all' || t.sectorId === selectedSectorId;
      const matchType = tagTypeFilter === 'all' || t.type === tagTypeFilter;

      let matchStatus = true;
      if (tagStatusFilter === 'aberta') matchStatus = t.status === 'aberta';
      else if (tagStatusFilter === 'em_andamento') matchStatus = t.status === 'em_andamento';
      else if (tagStatusFilter === 'concluida') matchStatus = t.status === 'concluida';
      else if (tagStatusFilter === 'em_atraso') {
        matchStatus = t.status !== 'concluida' && t.status !== 'cancelada' && new Date(t.dueDate) < now;
      } else if (tagStatusFilter === 'no_prazo') {
        matchStatus = t.status !== 'concluida' && t.status !== 'cancelada' && new Date(t.dueDate) >= now;
      } else if (tagStatusFilter === 'atendida_no_prazo') {
        matchStatus = t.status === 'concluida' && (!t.resolvedAt || new Date(t.resolvedAt) <= new Date(t.dueDate));
      } else if (tagStatusFilter === 'atendida_em_atraso') {
        matchStatus = t.status === 'concluida' && !!t.resolvedAt && new Date(t.resolvedAt) > new Date(t.dueDate);
      }

      return matchSector && matchType && matchStatus;
    });
  }, [tags, selectedSectorId, tagTypeFilter, tagStatusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header Principal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/admin/dashboard" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} color="#22d3ee" /> Painel Principal
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  color: '#22d3ee',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                PILAR LEAN 4.0
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Gestão de Máquinas, Auditorias & Etiquetas</span>
            </div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.2rem 0 0 0', fontFamily: 'var(--font-heading)' }}>
              TPM (Manutenção Produtiva Total)
            </h1>
          </div>
        </div>

        {/* Botões de Ações Rápidas no Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenNewAuditModal()}
            className="btn btn-sm"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 800,
            }}
          >
            <CheckSquare size={15} /> Realizar Auditoria
          </button>

          <button
            onClick={() => handleOpenNewTagModal()}
            className="btn btn-sm"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 800,
            }}
          >
            <Tag size={15} /> Abrir Etiqueta TPM
          </button>

          <button
            onClick={() => {
              setNewMachineSectorId(sectors[0]?.id || '');
              setNewMachineCode('');
              setNewMachineName('');
              setNewMachineBrandModel('');
              setNewMachineCriticality('B');
              setNewMachineStatus('operacional');
              setNewMachineDescription('');
              setIsMachineModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}
          >
            <Plus size={15} /> Cadastrar Máquina
          </button>
        </div>
      </div>

      {/* Barra de Filtro de Setor Global */}
      <div
        style={{
          backgroundColor: '#0f172a',
          padding: '0.85rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={14} color="#22d3ee" /> Setor Fabril:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            <button
              onClick={() => setSelectedSectorId('all')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
                border: selectedSectorId === 'all' ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: selectedSectorId === 'all' ? 'rgba(6, 182, 212, 0.15)' : '#090e1a',
                color: selectedSectorId === 'all' ? '#22d3ee' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              Todos os Setores ({machines.length})
            </button>
            {sectors.map((sec) => {
              const count = machines.filter((m) => m.sectorId === sec.id).length;
              const isSel = selectedSectorId === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectorId(sec.id)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.75rem',
                    borderRadius: '8px',
                    border: isSel ? `1px solid ${sec.color || '#22d3ee'}` : '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: isSel ? `${sec.color || '#22d3ee'}22` : '#090e1a',
                    color: isSel ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: sec.color || '#22d3ee' }} />
                  {sec.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Busca Rápida por Máquina */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar máquina..."
            value={searchMachine}
            onChange={(e) => setSearchMachine(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.78125rem', height: '34px' }}
          />
        </div>
      </div>

      {/* Grid de KPIs de Destaque Executivo de Manutenção */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Card 1: Total de Máquinas */}
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #22d3ee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Máquinas Ativas</span>
              <Wrench size={18} color="#22d3ee" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
              {filteredMachines.length}
            </div>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
              {filteredMachines.filter((m) => m.status === 'operacional').length} operacionais • {filteredMachines.filter((m) => m.status !== 'operacional').length} com atenção
            </span>
          </div>

          {/* Card 2: Média Geral de Auditorias */}
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: metrics.averageAuditScore >= 85 ? '4px solid #10b981' : metrics.averageAuditScore >= 70 ? '4px solid #f59e0b' : '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Nota Média de Auditorias</span>
              <Shield size={18} color={metrics.averageAuditScore >= 85 ? '#34d399' : '#fbbf24'} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: metrics.averageAuditScore >= 85 ? '#34d399' : metrics.averageAuditScore >= 70 ? '#fbbf24' : '#f87171', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
              {metrics.averageAuditScore > 0 ? `${metrics.averageAuditScore}%` : '--'}
            </div>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
              {metrics.averageAuditScore >= 85 ? '✅ Nível Classe Mundial' : metrics.averageAuditScore >= 70 ? '⚠️ Sob Observação' : '🚨 Nível Crítico'}
            </span>
          </div>

          {/* Card 3: Taxa de Atendimento no Prazo (SLA) */}
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: metrics.slaOnTimeRate >= 80 ? '4px solid #3b82f6' : '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Atendidas no Prazo (SLA)</span>
              <Clock size={18} color="#60a5fa" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#60a5fa', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
              {metrics.slaOnTimeRate}%
            </div>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
              {metrics.resolvedOnTimeTags} no prazo • {metrics.resolvedLateTags} com atraso
            </span>
          </div>

          {/* Card 4: Etiquetas em Atraso Crítico */}
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: metrics.overdueTags > 0 ? '4px solid #ef4444' : '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Pendências em Atraso</span>
              <AlertTriangle size={18} color={metrics.overdueTags > 0 ? '#f87171' : '#34d399'} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: metrics.overdueTags > 0 ? '#f87171' : '#34d399', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
              {metrics.overdueTags}
            </div>
            <span style={{ fontSize: '0.725rem', color: metrics.overdueTags > 0 ? '#f87171' : '#34d399' }}>
              {metrics.overdueTags > 0 ? 'Exigem intervenção imediata da gestão' : 'Nenhuma etiqueta com prazo vencido'}
            </span>
          </div>

          {/* Card 5: Distribuição de Etiquetas (Vermelhas vs Azuis) */}
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #a855f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Etiquetas Abertas</span>
              <Tag size={18} color="#c084fc" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
              {metrics.openTags + metrics.inProgressTags}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
              <span style={{ fontSize: '0.725rem', color: '#f87171', fontWeight: 700 }}>🔴 {metrics.redTagsCount} Manut.</span>
              <span style={{ fontSize: '0.725rem', color: '#60a5fa', fontWeight: 700 }}>🔵 {metrics.blueTagsCount} Autôn.</span>
            </div>
          </div>
        </div>
      )}

      {/* Navegação de Abas do Módulo TPM */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('maquinas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'maquinas' ? '#0f172a' : 'transparent',
            color: activeTab === 'maquinas' ? '#22d3ee' : '#94a3b8',
            fontWeight: 800,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'maquinas' ? '2px solid #22d3ee' : 'none',
          }}
        >
          <Wrench size={16} /> 1. Máquinas por Setor ({filteredMachines.length})
        </button>

        <button
          onClick={() => setActiveTab('auditorias')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'auditorias' ? '#0f172a' : 'transparent',
            color: activeTab === 'auditorias' ? '#22d3ee' : '#94a3b8',
            fontWeight: 800,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'auditorias' ? '2px solid #22d3ee' : 'none',
          }}
        >
          <CheckSquare size={16} /> 2. Auditorias & Notas de Máquina ({filteredAudits.length})
        </button>

        <button
          onClick={() => setActiveTab('etiquetas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'etiquetas' ? '#0f172a' : 'transparent',
            color: activeTab === 'etiquetas' ? '#22d3ee' : '#94a3b8',
            fontWeight: 800,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'etiquetas' ? '2px solid #22d3ee' : 'none',
          }}
        >
          <Tag size={16} /> 3. Gestão de Etiquetas TPM ({filteredTags.length})
        </button>

        <button
          onClick={() => setActiveTab('indicadores')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'indicadores' ? '#0f172a' : 'transparent',
            color: activeTab === 'indicadores' ? '#22d3ee' : '#94a3b8',
            fontWeight: 800,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'indicadores' ? '2px solid #22d3ee' : 'none',
          }}
        >
          <BarChart3 size={16} /> 4. Indicadores da Manutenção
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: MÁQUINAS POR SETOR */}
      {activeTab === 'maquinas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredMachines.length === 0 ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <Wrench size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                Nenhuma máquina cadastrada neste setor
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Cadastre as máquinas para iniciar a gestão de auditorias e etiquetas TPM.
              </p>
              <button
                onClick={() => setIsMachineModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ margin: '1rem auto 0', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} /> Cadastrar Máquina
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
              {filteredMachines.map((m) => {
                const machineTags = tags.filter((t) => t.machineId === m.id && t.status !== 'concluida' && t.status !== 'cancelada');
                const now = new Date();
                const overdueCount = machineTags.filter((t) => new Date(t.dueDate) < now).length;
                const scoreColor = m.currentAuditScore >= 85 ? '#34d399' : m.currentAuditScore >= 70 ? '#fbbf24' : '#f87171';

                return (
                  <div
                    key={m.id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      borderTop: `4px solid ${m.criticality === 'A' ? '#ef4444' : m.criticality === 'B' ? '#f59e0b' : '#3b82f6'}`,
                    }}
                  >
                    <div>
                      {/* Header do Card da Máquina */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#22d3ee', backgroundColor: 'rgba(6, 182, 212, 0.15)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                              {m.code}
                            </span>
                            <span
                              style={{
                                fontSize: '0.675rem',
                                fontWeight: 800,
                                padding: '0.1rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: m.criticality === 'A' ? 'rgba(239, 68, 68, 0.15)' : m.criticality === 'B' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                color: m.criticality === 'A' ? '#f87171' : m.criticality === 'B' ? '#fbbf24' : '#60a5fa',
                              }}
                            >
                              Criticidade {m.criticality}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0 0', fontFamily: 'var(--font-heading)' }}>
                            {m.name}
                          </h3>
                        </div>

                        {/* Badge de Status Operacional */}
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: m.status === 'operacional' ? 'rgba(16, 185, 129, 0.15)' : m.status === 'em_manutencao' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: m.status === 'operacional' ? '#34d399' : m.status === 'em_manutencao' ? '#fbbf24' : '#f87171',
                            border: `1px solid ${m.status === 'operacional' ? 'rgba(16, 185, 129, 0.3)' : m.status === 'em_manutencao' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          }}
                        >
                          {m.status === 'operacional' ? '● Operando' : m.status === 'em_manutencao' ? '⚙️ Em Manutenção' : '⏹️ Parada'}
                        </span>
                      </div>

                      {/* Setor e Modelo */}
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.75rem' }}>
                        Setor: <strong style={{ color: '#cbd5e1' }}>{m.sectorName}</strong>
                        {m.brandModel && <span> • {m.brandModel}</span>}
                      </p>

                      {/* Box de Avaliação / Nota de Auditoria */}
                      <div style={{ backgroundColor: '#090e1a', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                            Nota de Auditoria TPM
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {m.lastAuditDate ? `Auditoria em ${formatDate(m.lastAuditDate)}` : 'Sem auditoria recente'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreColor, fontFamily: 'var(--font-mono)' }}>
                            {m.currentAuditScore > 0 ? `${m.currentAuditScore}` : '--'}
                            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>/100</span>
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${m.currentAuditScore}%`, height: '100%', backgroundColor: scoreColor, transition: 'width 0.4s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.675rem', color: scoreColor, fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                              {m.currentAuditScore >= 85 ? 'Conforme / Padrão Excelente' : m.currentAuditScore >= 70 ? 'Atenção / Pequenas Anomalias' : m.currentAuditScore > 0 ? 'Crítico / Intervenção Necessária' : 'Aguardando 1ª Auditoria'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Resumo de Etiquetas da Máquina */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Tag size={13} color="#22d3ee" />
                          <span>Etiquetas ativas: <strong style={{ color: '#ffffff' }}>{machineTags.length}</strong></span>
                        </div>
                        {overdueCount > 0 ? (
                          <span style={{ color: '#f87171', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle size={13} /> {overdueCount} em atraso
                          </span>
                        ) : (
                          <span style={{ color: '#34d399', fontWeight: 700 }}>Todas no prazo</span>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação na Máquina */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                      <button
                        onClick={() => handleOpenNewAuditModal(m.id)}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          border: '1px solid rgba(6, 182, 212, 0.35)',
                          color: '#22d3ee',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <CheckSquare size={13} /> Auditar
                      </button>

                      <button
                        onClick={() => handleOpenNewTagModal(m.id)}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#f87171',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <Tag size={13} /> Nova Etiqueta
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: AUDITORIAS & NOTAS */}
      {activeTab === 'auditorias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Histórico de Auditorias de Máquina Realizadas
            </h3>
            <button
              onClick={() => handleOpenNewAuditModal()}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}
            >
              <Plus size={15} /> Realizar Nova Auditoria
            </button>
          </div>

          {filteredAudits.length === 0 ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <CheckSquare size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Nenhuma auditoria registrada neste filtro</h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Realize a primeira auditoria com checklist ponderado de 8 itens industriais.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredAudits.map((adt) => {
                const scoreColor = adt.score >= 85 ? '#34d399' : adt.score >= 70 ? '#fbbf24' : '#f87171';
                return (
                  <div key={adt.id} className="card" style={{ padding: '1.25rem 1.5rem', borderLeft: `5px solid ${scoreColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#22d3ee' }}>
                            {adt.machineCode}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Setor: <strong style={{ color: '#ffffff' }}>{adt.sectorName}</strong></span>
                          <span
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 800,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: adt.status === 'conforme' ? 'rgba(16, 185, 129, 0.15)' : adt.status === 'atencao' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: scoreColor,
                            }}
                          >
                            {adt.status === 'conforme' ? 'Conforme' : adt.status === 'atencao' ? 'Atenção' : 'Crítico'}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem', fontFamily: 'var(--font-heading)' }}>
                          {adt.machineName}
                        </h4>

                        {adt.observations && (
                          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.4, margin: '0 0 0.65rem' }}>
                            {adt.observations}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                          <span>👤 Auditor: <strong style={{ color: '#ffffff' }}>{adt.auditorName}</strong></span>
                          <span>📅 Data: {formatDate(adt.auditDate)}</span>
                          <span>✅ {adt.items.filter((i) => i.status === 'conforme').length} de {adt.items.length} itens conformes</span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Nota da Auditoria</span>
                        <div style={{ fontSize: '2.25rem', fontWeight: 900, color: scoreColor, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                          {adt.score}
                          <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: GESTÃO DE ETIQUETAS TPM */}
      {activeTab === 'etiquetas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sub-barra de Filtros para Etiquetas */}
          <div
            style={{
              backgroundColor: '#0f172a',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Filtro Tipo: Vermelha vs Azul */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Tipo:</span>
              <button
                onClick={() => setTagTypeFilter('all')}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: tagTypeFilter === 'all' ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: tagTypeFilter === 'all' ? 'rgba(6, 182, 212, 0.15)' : '#090e1a',
                  color: tagTypeFilter === 'all' ? '#22d3ee' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Todas ({tags.length})
              </button>
              <button
                onClick={() => setTagTypeFilter('vermelha')}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: tagTypeFilter === 'vermelha' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: tagTypeFilter === 'vermelha' ? 'rgba(239, 68, 68, 0.15)' : '#090e1a',
                  color: '#f87171',
                  cursor: 'pointer',
                }}
              >
                🔴 Vermelhas - Manutenção ({tags.filter((t) => t.type === 'vermelha').length})
              </button>
              <button
                onClick={() => setTagTypeFilter('azul')}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: tagTypeFilter === 'azul' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: tagTypeFilter === 'azul' ? 'rgba(59, 130, 246, 0.15)' : '#090e1a',
                  color: '#60a5fa',
                  cursor: 'pointer',
                }}
              >
                🔵 Azuis - Autônomas ({tags.filter((t) => t.type === 'azul').length})
              </button>
            </div>

            {/* Filtro Status e SLA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Situação:</span>
              <select
                className="form-select"
                value={tagStatusFilter}
                onChange={(e) => setTagStatusFilter(e.target.value)}
                style={{ fontSize: '0.75rem', height: '32px', padding: '0.2rem 1.75rem 0.2rem 0.6rem' }}
              >
                <option value="all">Todas as Situações</option>
                <option value="aberta">Abertas (Pendentes)</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluídas</option>
                <option value="em_atraso">⚠️ Em Atraso (Vencidas)</option>
                <option value="no_prazo">⏱️ Em Aberto no Prazo</option>
                <option value="atendida_no_prazo">✅ Atendidas no Prazo</option>
                <option value="atendida_em_atraso">⏳ Atendidas com Atraso</option>
              </select>

              <button
                onClick={() => handleOpenNewTagModal()}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, height: '32px', fontSize: '0.75rem' }}
              >
                <Plus size={14} /> Nova Etiqueta
              </button>
            </div>
          </div>

          {/* Listagem de Etiquetas */}
          {filteredTags.length === 0 ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <Tag size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Nenhuma etiqueta encontrada para estes filtros</h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Abra uma nova etiqueta para registrar anomalias de manutenção ou autônomas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredTags.map((t) => {
                const isConcluded = t.status === 'concluida';
                const due = new Date(t.dueDate);
                const now = new Date();
                const isOverdue = !isConcluded && due < now;
                const wasResolvedOnTime = isConcluded && (!t.resolvedAt || new Date(t.resolvedAt) <= due);

                return (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      padding: '1.15rem 1.35rem',
                      borderLeft: t.type === 'vermelha' ? '5px solid #ef4444' : '5px solid #3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      {/* Top badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff' }}>
                          {t.tagNumber}
                        </span>

                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: t.type === 'vermelha' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: t.type === 'vermelha' ? '#f87171' : '#60a5fa',
                            border: `1px solid ${t.type === 'vermelha' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                          }}
                        >
                          {t.type === 'vermelha' ? '🔴 Vermelha (Especializada)' : '🔵 Azul (Autônoma)'}
                        </span>

                        <span style={{ fontSize: '0.675rem', fontWeight: 700, backgroundColor: '#090e1a', color: '#cbd5e1', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          {t.category.toUpperCase()}
                        </span>

                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: t.priority === 'critica' ? 'rgba(239, 68, 68, 0.2)' : t.priority === 'alta' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                            color: t.priority === 'critica' ? '#f87171' : t.priority === 'alta' ? '#fbbf24' : '#cbd5e1',
                          }}
                        >
                          Prioridade {t.priority.toUpperCase()}
                        </span>
                      </div>

                      {/* Descrição e Máquina */}
                      <p style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: 700, margin: '0 0 0.35rem' }}>
                        {t.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                        <span>🏭 Máquina: <strong style={{ color: '#22d3ee' }}>{t.machineCode} - {t.machineName}</strong></span>
                        <span>Setor: <strong style={{ color: '#cbd5e1' }}>{t.sectorName}</strong></span>
                        <span>Aberta por: {t.openedBy} em {formatDate(t.openedAt)}</span>
                      </div>

                      {/* Notas de Solução se Concluída */}
                      {isConcluded && t.solutionNotes && (
                        <div style={{ marginTop: '0.5rem', backgroundColor: '#090e1a', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <span style={{ fontSize: '0.725rem', color: '#34d399', fontWeight: 700 }}>
                            ✓ Solução Aplicada por {t.resolvedBy || 'Técnico'} em {t.resolvedAt ? formatDate(t.resolvedAt) : '--'}:
                          </span>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#cbd5e1' }}>
                            {t.solutionNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Temporal & SLA */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {/* SLA Badge */}
                      {isConcluded ? (
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor: wasResolvedOnTime ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: wasResolvedOnTime ? '#34d399' : '#fbbf24',
                            border: `1px solid ${wasResolvedOnTime ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                          }}
                        >
                          {wasResolvedOnTime ? '✅ Atendida no Prazo' : '⏳ Atendida com Atraso'}
                        </span>
                      ) : isOverdue ? (
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <AlertTriangle size={13} /> EM ATRASO CRÍTICO (Venceu em {formatDate(t.dueDate)})
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(6, 182, 212, 0.15)',
                            color: '#22d3ee',
                            border: '1px solid rgba(6, 182, 212, 0.35)',
                          }}
                        >
                          ⏱️ Prazo: {formatDate(t.dueDate)}
                        </span>
                      )}

                      {/* Botões de Ação da Etiqueta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {t.status === 'aberta' && (
                          <button
                            onClick={() => {
                              dataService.updateTpmTagStatus(t.id, 'em_andamento');
                              loadData();
                            }}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#090e1a', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)', fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                          >
                            Iniciar Reparo
                          </button>
                        )}

                        {t.status !== 'concluida' && (
                          <button
                            onClick={() => {
                              setResolveTagModal(t);
                              setResolutionResolvedBy(currentUser?.name || '');
                              setResolutionNotes('');
                            }}
                            className="btn btn-success btn-sm"
                            style={{ fontSize: '0.725rem', padding: '0.25rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 800 }}
                          >
                            <CheckCircle2 size={13} /> Concluir Atendimento
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 4: INDICADORES DA MANUTENÇÃO */}
      {activeTab === 'indicadores' && metrics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Gráfico 1: Cumprimento de Prazo das Etiquetas */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Taxa de Resolução Dentro do Prazo (SLA)
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Aderência da equipe aos prazos pactuados</span>
                </div>
                <Clock size={20} color="#22d3ee" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {metrics.slaOnTimeRate}%
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>Atendidas no Prazo:</span>
                    <strong style={{ color: '#ffffff' }}>{metrics.resolvedOnTimeTags}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>Atendidas com Atraso:</span>
                    <strong style={{ color: '#ffffff' }}>{metrics.resolvedLateTags}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#f87171', fontWeight: 700 }}>Pendências em Atraso:</span>
                    <strong style={{ color: '#f87171' }}>{metrics.overdueTags}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico 2: Distribuição por Tipo de Etiqueta */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Especializada (Vermelha) vs Autônoma (Azul)
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Engajamento dos operadores no posto</span>
                </div>
                <Tag size={20} color="#c084fc" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#f87171', fontWeight: 700 }}>🔴 Manutenção Técnica (Vermelha)</span>
                    <strong style={{ color: '#ffffff' }}>{metrics.redTagsCount} ({metrics.totalTags > 0 ? Math.round((metrics.redTagsCount / metrics.totalTags) * 100) : 0}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.totalTags > 0 ? (metrics.redTagsCount / metrics.totalTags) * 100 : 0}%`, height: '100%', backgroundColor: '#ef4444' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>🔵 Manutenção Autônoma (Azul)</span>
                    <strong style={{ color: '#ffffff' }}>{metrics.blueTagsCount} ({metrics.totalTags > 0 ? Math.round((metrics.blueTagsCount / metrics.totalTags) * 100) : 0}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.totalTags > 0 ? (metrics.blueTagsCount / metrics.totalTags) * 100 : 0}%`, height: '100%', backgroundColor: '#3b82f6' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ranking de Máquinas: Menor Nota de Auditoria para Foco Kaizen */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.85rem' }}>
              🎯 Máquinas com Menor Nota de Auditoria (Prioridade para Ação Kaizen)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {[...machines]
                .sort((a, b) => a.currentAuditScore - b.currentAuditScore)
                .slice(0, 4)
                .map((m) => (
                  <div key={m.id} style={{ backgroundColor: '#090e1a', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{m.code}</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: m.currentAuditScore >= 85 ? '#34d399' : m.currentAuditScore >= 70 ? '#fbbf24' : '#f87171', fontFamily: 'var(--font-mono)' }}>
                        {m.currentAuditScore > 0 ? `${m.currentAuditScore}%` : '--'}
                      </span>
                    </div>
                    <strong style={{ fontSize: '0.8125rem', color: '#ffffff', display: 'block' }}>{m.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{m.sectorName}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CADASTRAR MÁQUINA */}
      <Modal
        isOpen={isMachineModalOpen}
        onClose={() => setIsMachineModalOpen(false)}
        title="Cadastrar Nova Máquina no TPM"
        subtitle="Vincule o equipamento a um setor fabril com sua respectiva criticidade operacional"
      >
        <form onSubmit={handleCreateMachine} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Setor Fabril Responsável: *</label>
            <select
              className="form-select"
              value={newMachineSectorId}
              onChange={(e) => setNewMachineSectorId(e.target.value)}
              required
            >
              <option value="">Selecione o setor...</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Tag / Código: *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: EXT-03"
                value={newMachineCode}
                onChange={(e) => setNewMachineCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Nome da Máquina: *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Extrusora de Fita Plana 03"
                value={newMachineName}
                onChange={(e) => setNewMachineName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Fabricante / Modelo:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Starlinger 1500"
                value={newMachineBrandModel}
                onChange={(e) => setNewMachineBrandModel(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Criticidade Operacional:</label>
              <select
                className="form-select"
                value={newMachineCriticality}
                onChange={(e) => setNewMachineCriticality(e.target.value as 'A' | 'B' | 'C')}
              >
                <option value="A">A - Crítica (Gargalo de Linha)</option>
                <option value="B">B - Média (Capacidade Alternativa)</option>
                <option value="C">C - Baixa (Não interrompe fluxo)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Status Operacional Inicial:</label>
            <select
              className="form-select"
              value={newMachineStatus}
              onChange={(e) => setNewMachineStatus(e.target.value as any)}
            >
              <option value="operacional">Operacional (Em Produção)</option>
              <option value="em_manutencao">Em Manutenção Preventiva/Corretiva</option>
              <option value="parada">Parada / Em Espera</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Observações / Descrição:</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Detalhes sobre a capacidade, alimentação elétrica ou peculiaridades..."
              value={newMachineDescription}
              onChange={(e) => setNewMachineDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsMachineModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Salvar Máquina
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: REALIZAR AUDITORIA TPM COM NOTA AUTOMÁTICA */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Realizar Auditoria TPM / 5S de Máquina"
        subtitle="Avalie os 8 itens padrão de manutenção autônoma; a nota de 0 a 100 será computada automaticamente"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAudit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Seleção de Máquina e Auditor */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Máquina Auditada: *</label>
              <select
                className="form-select"
                value={auditMachineId}
                onChange={(e) => setAuditMachineId(e.target.value)}
                required
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.code}] {m.name} ({m.sectorName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Auditor / Especialista:</label>
              <input
                type="text"
                className="form-control"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Data:</label>
              <input
                type="date"
                className="form-control"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Banner da Nota em Tempo Real */}
          <div
            style={{
              backgroundColor: '#090e1a',
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              border: `1.5px solid ${currentAuditScore >= 85 ? 'rgba(16, 185, 129, 0.4)' : currentAuditScore >= 70 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                Nota da Máquina Calculada:
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0.1rem 0 0' }}>
                {currentAuditScore >= 85 ? '✅ Padrão Conforme (Classe Mundial)' : currentAuditScore >= 70 ? '⚠️ Alerta de Atenção (Anomalias Menores)' : '🚨 Crítico (Ações Imediatas)'}
              </h3>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: currentAuditScore >= 85 ? '#34d399' : currentAuditScore >= 70 ? '#fbbf24' : '#f87171' }}>
              {currentAuditScore}<span style={{ fontSize: '1.15rem', color: '#94a3b8' }}>/100</span>
            </div>
          </div>

          {/* Checklist de 8 Itens Ponderados */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {auditChecklist.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#090e1a',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.8125rem', color: '#ffffff', display: 'block' }}>{item.title}</strong>
                  <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{item.description}</span>
                </div>

                {/* Opções de Conformidade */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...auditChecklist];
                      updated[idx].status = 'conforme';
                      setAuditChecklist(updated);
                    }}
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: item.status === 'conforme' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: item.status === 'conforme' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                      color: item.status === 'conforme' ? '#34d399' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    100% Conforme
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...auditChecklist];
                      updated[idx].status = 'parcial';
                      setAuditChecklist(updated);
                    }}
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: item.status === 'parcial' ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: item.status === 'parcial' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                      color: item.status === 'parcial' ? '#fbbf24' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    50% Parcial
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...auditChecklist];
                      updated[idx].status = 'nao_conforme';
                      setAuditChecklist(updated);
                    }}
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: item.status === 'nao_conforme' ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: item.status === 'nao_conforme' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                      color: item.status === 'nao_conforme' ? '#f87171' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    0% Não Conforme
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Observações & Anomalias Diagnosticadas:</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Aponte necessidades de ajuste, etiquetas abertas ou elogios à equipe autônoma..."
              value={auditObservations}
              onChange={(e) => setAuditObservations(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={() => setIsAuditModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
              Salvar Auditoria & Atualizar Nota da Máquina
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: ABRIR NOVA ETIQUETA TPM */}
      <Modal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        title="Abrir Nova Etiqueta TPM (Anomalia / Manutenção)"
        subtitle="Aponte anomalias na máquina com classificação de urgência e prazo SLA para atendimento"
      >
        <form onSubmit={handleCreateTag} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Máquina com Anomalia: *</label>
            <select
              className="form-select"
              value={tagMachineId}
              onChange={(e) => setTagMachineId(e.target.value)}
              required
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.code}] {m.name} ({m.sectorName})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Etiqueta (Vermelha vs Azul) */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Tipo de Etiqueta TPM: *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setTagType('vermelha')}
                style={{
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: tagType === 'vermelha' ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: tagType === 'vermelha' ? 'rgba(239, 68, 68, 0.2)' : '#090e1a',
                  color: tagType === 'vermelha' ? '#f87171' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                🔴 Etiqueta Vermelha
                <span style={{ fontSize: '0.65rem', display: 'block', fontWeight: 400, color: '#cbd5e1' }}>Manutenção Técnica</span>
              </button>

              <button
                type="button"
                onClick={() => setTagType('azul')}
                style={{
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: tagType === 'azul' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: tagType === 'azul' ? 'rgba(59, 130, 246, 0.2)' : '#090e1a',
                  color: tagType === 'azul' ? '#60a5fa' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                🔵 Etiqueta Azul
                <span style={{ fontSize: '0.65rem', display: 'block', fontWeight: 400, color: '#cbd5e1' }}>Manutenção Autônoma</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Categoria da Falha:</label>
              <select
                className="form-select"
                value={tagCategory}
                onChange={(e) => setTagCategory(e.target.value as any)}
              >
                <option value="mecanica">Mecânica</option>
                <option value="eletrica">Elétrica</option>
                <option value="pneumatica_hidraulica">Pneumática / Hidráulica</option>
                <option value="seguranca">Segurança (NR-12)</option>
                <option value="lubrificacao">Lubrificação</option>
                <option value="limpeza_5s">Limpeza & 5S</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Prioridade:</label>
              <select
                className="form-select"
                value={tagPriority}
                onChange={(e) => setTagPriority(e.target.value as any)}
              >
                <option value="baixa">Baixa (Rotina)</option>
                <option value="media">Média (Acompanhamento)</option>
                <option value="alta">Alta (Risco de Parada)</option>
                <option value="critica">Crítica (Interrupção Imediata)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Descrição da Anomalia / Problema: *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Descreva o sintoma (ruído, aquecimento, folga, vazamento, mau contato elétrico)..."
              value={tagDescription}
              onChange={(e) => setTagDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Apontado por:</label>
              <input
                type="text"
                className="form-control"
                value={tagOpenedBy}
                onChange={(e) => setTagOpenedBy(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Prazo Limite (SLA): *</label>
              <input
                type="date"
                className="form-control"
                value={tagDueDate}
                onChange={(e) => setTagDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsTagModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
              Emitir Etiqueta TPM
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: CONCLUIR ATENDIMENTO DE ETIQUETA */}
      <Modal
        isOpen={!!resolveTagModal}
        onClose={() => setResolveTagModal(null)}
        title={`Concluir Atendimento — ${resolveTagModal?.tagNumber}`}
        subtitle={`Registro da ação corretiva para a máquina ${resolveTagModal?.machineCode}`}
      >
        <form onSubmit={handleResolveTag} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#090e1a', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Anomalia Reportada:</span>
            <p style={{ fontSize: '0.8125rem', color: '#ffffff', margin: '0.2rem 0 0' }}>{resolveTagModal?.description}</p>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Responsável pela Resolução: *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nome do técnico ou operador executor..."
              value={resolutionResolvedBy}
              onChange={(e) => setResolutionResolvedBy(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Ação Corretiva Realizada: *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Descreva o reparo efetuado, componentes trocados e teste de validação..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setResolveTagModal(null)} className="btn btn-secondary btn-sm">
              Cancelar
            </button>
            <button type="submit" className="btn btn-success btn-sm" style={{ fontWeight: 800 }}>
              <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Confirmar Conclusão
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
