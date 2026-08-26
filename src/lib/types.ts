export type UserRole = 'admin' | 'agent';

export type ActionStatus = 'aberta' | 'em_andamento' | 'aguardando_aprovacao' | 'concluida' | 'nao_aprovada';

export type ActionPriority = 'baixa' | 'media' | 'alta' | 'critica';

export type PDCAMethodologyStage = 'plan' | 'do' | 'check' | 'act';

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
  startDate?: string; // Data no formato dd/mm/aaaa ou YYYY-MM-DD
  endDate?: string;   // Data no formato dd/mm/aaaa ou YYYY-MM-DD
  status?: ActivityStatus;
  responsibleName?: string;
  observations?: string; // Notas de padronização / lições aprendidas
  durationHours?: number; // Tempo em horas
  completed: boolean;
  completedAt?: string;
}

// 7 Fontes de Custo Evitado (Ganhos do Projeto)
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

// Custos & Investimento do Projeto (Capex + Opex)
export interface ProjectInvestmentCosts {
  partsAndEquipment?: number;     // Aquisição de peças, dispositivos e sensores (R$)
  thirdPartyServices?: number;    // Usinagem externa, calibração, consultoria (R$)
  internalLaborHours?: number;    // Total de horas dos agentes envolvidos no desenvolvimento (h)
  laborHourlyRate?: number;       // Custo médio homem-hora (R$/h) - padrão R$ 45,00
  otherCosts?: number;           // Outras despesas operacionais (R$)
  totalCost?: number;            // Soma total do investimento
}

// Comprovação & Análise por Gráfico de Pareto (Regra 80/20)
export interface ParetoAnalysis {
  chartImageUrl?: string;              // Imagem do Gráfico de Pareto (Upload Base64 ou URL)
  chartImageName?: string;             // Nome do arquivo da imagem
  vitalCausesSummary?: string;         // Resumo das causas vitais (os 20% que geram 80% do problema)
  cumulativeImpactPercentage?: number; // Ex: 82 (%)
  topCauses?: { cause: string; percentage: number }[];
}

// Ishikawa 6M (Causas Raízes - compatibilidade)
export interface IshikawaAnalysis {
  method?: string;       // Método de trabalho
  machine?: string;      // Máquinas e ferramentas
  material?: string;     // Matéria-prima e insumos
  manpower?: string;     // Mão de obra / Habilidades
  measurement?: string;  // Medição e calibração
  environment?: string;  // Meio ambiente / Condições do setor
}

// Anexos de Projeto (PDFs de Memorial de Cálculo, Relatórios, Fotos de Evidência)
export interface ProjectAttachment {
  id: string;
  name: string;
  sizeBytes?: number;
  sizeFormatted?: string; // ex: "1.8 MB"
  fileType: string;       // ex: "application/pdf", "image/png"
  url?: string;           // Base64 Data URL ou Link para download
  uploadedAt: string;
  uploadedBy?: string;
  category?: 'memorial_calculo' | 'evidencia_foto' | 'relatorio_tecnico' | 'outro';
  description?: string;
}

// Acompanhamento e Comprovação de Resultados em 3 Meses (Pós-Homologação)
export interface MonthlyResultEntry {
  monthNumber: 1 | 2 | 3;
  monthLabel?: string;     // Ex: "1º Mês", "2º Mês", "3º Mês"
  value?: number;          // Custo Evitado Real aferido no mês (R$)
  hoursSaved?: number;     // Horas salvas no mês (h)
  measuredAt?: string;     // Data da medição (AAAA-MM-DD)
  notes?: string;          // Observações do agente / memorial
  registeredBy?: string;   // Nome do responsável pelo lançamento
}

export interface QuarterlyFollowUp {
  enabled: boolean;
  startedAt?: string;          // Data de início do acompanhamento (após homologação)
  month1?: MonthlyResultEntry;
  month2?: MonthlyResultEntry;
  month3?: MonthlyResultEntry;
  averageCostAvoided?: number; // Média calculada automaticamente ((M1 + M2 + M3) / 3) ou média parcial
  isCompleted?: boolean;       // Concluído/fechado automaticamente após preenchimento do 3º resultado
  completedAt?: string;        // Data de consolidação final
  status: 'aguardando_mes_1' | 'aguardando_mes_2' | 'aguardando_mes_3' | 'consolidado';
}

export interface LeanAction {
  id: string;
  protocol: string; // e.g. "RAF-2026-8801"
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
  
  // ================= METODOLOGIA PDCA =================
  pdcaStage?: PDCAMethodologyStage; // 'plan' | 'do' | 'check' | 'act'

  // [P - PLAN: Diagnóstico, Metas, 5 Porquês & Pareto 80/20]
  problemStatement?: string;             // Declaração detalhada do problema
  targetMetricName?: string;             // Ex: "Tempo de Setup (SMED)", "Taxa de Refugo (%)"
  targetMetricUnit?: string;             // Ex: "minutos", "%", "peças/h", "R$/mês"
  baselineValue?: number;                // Valor inicial antes da melhoria (ex: 52)
  targetGoalValue?: number;              // Meta planejada (ex: 15)
  currentProblemCostMonthly?: number;    // Custo mensal do problema não resolvido (R$/mês)
  fiveWhys?: string[];                   // Lista dos 5 Porquês
  pareto?: ParetoAnalysis;               // Comprovação por Gráfico de Pareto 80/20
  ishikawa?: IshikawaAnalysis;           // Diagrama de Causa e Efeito (6M - legado)

  // [D - DO: Execução 5W2H & Testes Piloto]
  checklist: ActionChecklistItem[];      // Plano de Ação 5W2H
  pilotArea?: string;                    // Máquina / Posto Piloto (ex: "Extrusora 03")
  pilotTestObservations?: string;        // Resultados e ajustes do teste prático

  // [C - CHECK: Resultados Técnicos & Engenharia Financeira]
  achievedValue?: number;                // Valor real medido após a melhoria (ex: 16)
  projectCosts?: ProjectInvestmentCosts; // Custos e investimentos do projeto (Capex/Opex)
  costBreakdown?: LeanCostBreakdown;     // Ganhos brutos por fonte (7 fontes)
  estimatedCostAvoided: number;          // Ganhos estimados em BRL (R$)
  actualCostAvoided: number;             // Ganhos brutos reais em BRL (R$)
  netSavings?: number;                   // Lucro Líquido = Ganhos Brutos - Custos do Projeto (R$)
  roiPercentage?: number;                // ROI = (Lucro Líquido / Custos) * 100 (%)
  paybackMonths?: number;                // Payback = Custos / Economia Mensal (meses)
  hoursSaved: number;                    // Horas de trabalho / máquina recuperadas
  attachments?: ProjectAttachment[];     // Anexos em PDF com memorial de cálculo e evidências

  // [A - ACT: Padronização, Yokoten, Submissão & Homologação Master]
  standardWorkUpdated?: boolean;         // SOP / Instrução de Trabalho atualizada?
  standardWorkDocRef?: string;           // Código do POP / SOP (ex: "POP-EXT-042 rev 03")
  yokotenReplication?: string;           // Lições aprendidas & Linhas para replicação (ex: "Extrusoras 01, 02 e 04")
  lessonsLearned?: string;               // Resumo das lições aprendidas
  submittedForApproval?: boolean;        // Submetido pelo Agente para Homologação Master?
  submittedForApprovalAt?: string;       // Data de envio para homologação
  submittedForApprovalBy?: string;       // Nome do Agente que enviou
  masterApproved?: boolean;              // Homologado pela Entidade Master?
  masterApprovedAt?: string;             // Data de homologação
  masterApprovedBy?: string;             // Responsável pela homologação Master

  // Acompanhamento Trimestral de Ganhos Pós-Homologação (3 Meses)
  quarterlyFollowUp?: QuarterlyFollowUp;

  // Dates & Legacy compatibility
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;

  // Triage & Rejection
  rejectionReason?: string;
  triagedAt?: string;
  triagedBy?: string;

  // Notes
  notes: ActionNote[];
  rootCauseAnalysis?: string;            // Resumo da causa raiz
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
  bySector: { sectorId: string; sectorName: string; count: number; costAvoided: number }[];
  byAgent: {
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
  }[];
}
