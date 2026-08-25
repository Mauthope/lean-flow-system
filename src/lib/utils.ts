import { LeanWasteCategory, ActionStatus, ActionPriority } from './types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const trimmed = String(dateString).trim();
    // YYYY-MM-DD format (direct split avoids UTC offset bug)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-');
      return `${day}/${month}/${year}`;
    }
    // ISO string with YYYY-MM-DD
    if (trimmed.includes('T')) {
      const [datePart] = trimmed.split('T');
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      }
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 30) return `Há ${diffDays} dias`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function generateProtocol(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `LEAN-${year}-${randomPart}`;
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export const WASTE_CATEGORIES: Record<
  LeanWasteCategory,
  { label: string; description: string; icon: string; badgeColor: string; color: string }
> = {
  superproducao: {
    label: 'Superprodução',
    description: 'Produzir mais ou antes do necessário',
    icon: 'Layers',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    color: '#9333ea',
  },
  espera: {
    label: 'Tempo de Espera',
    description: 'Aguardar materiais, aprovações ou pessoas',
    icon: 'Clock',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    color: '#d97706',
  },
  transporte: {
    label: 'Transporte Excessivo',
    description: 'Movimentação desnecessária de materiais/arquivos',
    icon: 'Truck',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    color: '#2563eb',
  },
  processamento_excessivo: {
    label: 'Processamento Excessivo',
    description: 'Etapas de trabalho que não agregam valor ao cliente',
    icon: 'Cpu',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    color: '#4f46e5',
  },
  estoque: {
    label: 'Estoque / Acúmulo',
    description: 'Excesso de matéria-prima, itens em processo ou pendências',
    icon: 'Boxes',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    color: '#ea580c',
  },
  movimentacao: {
    label: 'Movimentação Desnecessária',
    description: 'Deslocamento de pessoas para buscar ferramentas ou dados',
    icon: 'Activity',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    color: '#0891b2',
  },
  defeitos: {
    label: 'Defeitos & Retrabalho',
    description: 'Erros na execução, refações ou não conformidades',
    icon: 'AlertTriangle',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    color: '#e11d48',
  },
  talento_subutilizado: {
    label: 'Talento Subutilizado',
    description: 'Não aproveitar o conhecimento e ideias da equipe',
    icon: 'Users',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    color: '#059669',
  },
};

export const STATUS_CONFIG: Record<
  ActionStatus,
  { label: string; badgeColor: string; bgClass: string; textClass: string; borderClass: string }
> = {
  aberta: {
    label: 'Abertas',
    badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-300',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
  },
  em_andamento: {
    label: 'Em Andamento',
    badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-300',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
  },
  concluida: {
    label: 'Concluídas',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
  },
  nao_aprovada: {
    label: 'Não Aprovadas',
    badgeColor: 'bg-rose-500/10 text-rose-700 border-rose-300',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
  },
};

export const PRIORITY_CONFIG: Record<
  ActionPriority,
  { label: string; color: string; badge: string }
> = {
  baixa: {
    label: 'Baixa',
    color: '#64748b',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  media: {
    label: 'Média',
    color: '#0284c7',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  alta: {
    label: 'Alta',
    color: '#f59e0b',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  critica: {
    label: 'Crítica',
    color: '#ef4444',
    badge: 'bg-red-100 text-red-800 border-red-200 font-semibold',
  },
};
