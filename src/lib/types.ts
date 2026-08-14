export type UserRole = 'admin' | 'agent';

export type ActionStatus = 'aberta' | 'em_andamento' | 'concluida' | 'nao_aprovada';

export type ActionPriority = 'baixa' | 'media' | 'alta' | 'critica';

export type LeanWasteCategory =
  | 'superproducao'
  | 'espera'
  | 'transporte'
  | 'processamento_excessivo'
  | 'estoque'
  | 'movimentacao'
  | 'defeitos'
  | 'talento_subutilizado';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  cnpjOrCode: string;
  logoUrl?: string;
  plan: 'standard' | 'enterprise';
  createdAt: string;
}

export interface Sector {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string;
  color: string; // e.g. '#2563eb'
  iconName?: string;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  sectorId?: string;
  sectorName?: string;
  jobTitle?: string;
  avatarUrl?: string;
  active: boolean;
  phone?: string;
  createdAt: string;
}

export interface ActionNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export type ActivityStatus = 'pendente' | 'em_andamento' | 'concluida';

export interface ActionChecklistItem {
  id: string;
  label: string;
  startDate?: string; // Data/Hora de início
  endDate?: string;   // Data/Hora de término
  status?: ActivityStatus;
  responsibleName?: string;
  observations?: string; // Notas de padronização / lições aprendidas
  durationHours?: number; // Tempo em horas
  completed: boolean;
  completedAt?: string;
}

export interface LeanCostBreakdown {
  laborSavings?: number;          // Mão de Obra / Horas Economizadas (R$)
  productionIncrease?: number;    // Aumento de Produção / Capacidade Extra (R$)
  scrapReduction?: number;        // Redução de Refugo / Matéria-Prima (R$)
  machineDowntime?: number;       // Redução de Paradas de Máquina / OEE (R$)
  toolingAndEnergy?: number;      // Ferramental, Energia e Insumos (R$)
  logisticsAndFreight?: number;   // Fretes Especiais e Estoque (R$)
  otherSavings?: number;          // Outros Custos Evitados (R$)
  otherSavingsDescription?: string;
}

export interface LeanAction {
  id: string;
  protocol: string; // e.g. "LEAN-2026-0814"
  tenantId: string;
  title: string;
  description: string;
  wasteCategory: LeanWasteCategory;
  originSectorId: string;
  originSectorName?: string;
  targetSectorId?: string;
  targetSectorName?: string;
  
  // Public requester info (if opened by public link)
  isPublicDemand: boolean;
  requesterName?: string;
  requesterEmail?: string;
  requesterDepartment?: string;

  // Assignment
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentAvatar?: string;
  
  // Status & Classification
  status: ActionStatus;
  priority: ActionPriority;
  
  // Financial & Lean Metrics
  estimatedCostAvoided: number; // in BRL (R$)
  actualCostAvoided: number; // in BRL (R$)
  hoursSaved: number; // estimated or real hours saved
  costBreakdown?: LeanCostBreakdown; // Detalhamento por categoria de custo evitado
  
  // Dates
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;

  // Triage & Rejection
  rejectionReason?: string;
  triagedAt?: string;
  triagedBy?: string;

  // Rich contents
  notes: ActionNote[];
  checklist: ActionChecklistItem[];
  rootCauseAnalysis?: string; // 5 Porquês / Ishikawa / A3 note
  standardWorkUpdated?: boolean;
}

export interface DashboardMetrics {
  totalActions: number;
  openActions: number;
  inProgressActions: number;
  completedActions: number;
  rejectedActions: number;
  totalEstimatedCostAvoided: number;
  totalActualCostAvoided: number;
  totalHoursSaved: number;
  costBreakdownTotals?: LeanCostBreakdown;
  resolutionRate: number; // %
  averageCycleDays: number;
  byWasteCategory: Record<LeanWasteCategory, number>;
  bySector: Array<{ sectorId: string; sectorName: string; count: number; costAvoided: number }>;
  byAgent: Array<{
    agentId: string;
    agentName: string;
    avatarUrl?: string;
    sectorName?: string;
    assignedCount: number;
    completedCount: number;
    inProgressCount: number;
    actualCostAvoided: number;
    hoursSaved: number;
    efficiencyRate: number;
  }>;
}
