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
  aiSettings?: {
    geminiApiKey?: string;
    preferredVoice?: string;
    model?: string;
    updatedAt?: string;
  };
}

export interface Sector {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
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
  sectorIds?: string[];
  allSectors?: boolean;
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
  text?: string;
  startDate?: string; // Data no formato dd/mm/aaaa ou YYYY-MM-DD
  endDate?: string;   // Data no formato dd/mm/aaaa ou YYYY-MM-DD
  plannedStart?: string;
  plannedEnd?: string;
  status?: ActivityStatus;
  responsibleName?: string;
  responsible?: string;
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

// Ishikawa 6M (Causas Raízes - Espinha de Peixe)
export interface IshikawaAnalysis {
  method?: string;       // Método de trabalho / Procedimentos
  machine?: string;      // Máquinas, equipamentos e ferramentas
  material?: string;     // Matéria-prima e insumos
  manpower?: string;     // Mão de obra / Treinamento / Habilidades
  measurement?: string;  // Medição, calibração e critérios
  environment?: string;  // Meio ambiente, layout e setor
  primaryRootCause?: string; // Causa raiz prioritária diagnosticada no 6M
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

  // Assignment & Liderança do Kaizen
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentAvatar?: string;
  leaderName?: string;                   // Líder do Kaizen ou Projeto
  teamMembers?: string[];                // Pessoas envolvidas / Equipe do Projeto
  
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
  photoBeforeUrl?: string;               // Foto do Antes salva diretamente no projeto
  photoAfterUrl?: string;                // Foto do Depois salva diretamente no projeto

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

// ================= CANAL KAIZEN (BANCO DE IDEIAS DO CHÃO DE FÁBRICA) =================
export type KaizenIdeaStatus = 'pendente' | 'aprovada' | 'rejeitada';
export type KaizenExecutionStatus = 'planejamento' | 'em_implantacao' | 'implantada_sucesso';

export interface KaizenIdea {
  id: string;
  protocol: string;                     // e.g. "KZN-2026-1001"
  tenantId: string;
  authorName: string;                   // Nome completo do colaborador
  sectorId: string;
  sectorName: string;                   // Setor onde a melhoria se aplica
  authorRoleTitle: string;              // Cargo (ex: Operador de Máquina, Auxiliar, Líder)
  summary: string;                      // Resumo da ideia
  photoUrl?: string;                    // Foto da ideia (Base64 ou URL)
  photoName?: string;
  createdAt: string;                    // Salva automaticamente a data do cadastro
  updatedAt: string;

  // Triagem do Gestor
  status: KaizenIdeaStatus;
  reviewedBy?: string;                  // Nome do gestor
  reviewedAt?: string;                  // Data da análise
  rejectionReason?: string;             // Motivo da rejeição

  // Execução Kaizen (para ideias aprovadas - separado dos projetos dos agentes)
  responsibleName?: string;             // Responsável pela implantação
  assignedAgentId?: string;
  executionStatus?: KaizenExecutionStatus;
  implementationDate?: string;          // Data prevista ou realizada

  // ================= METODOLOGIA PDCA KAIZEN =================
  pdcaStage?: 'plan' | 'do' | 'check' | 'act';

  // [P - PLAN: Metas, Indicadores e Causa Raiz]
  targetMetricName?: string;            // Nome do indicador (ex: Tempo de Setup, Parada por refugo)
  targetMetricUnit?: string;            // Unidade (ex: min, %, peças/h)
  baselineValue?: number;               // Valor inicial antes da melhoria
  targetGoalValue?: number;             // Meta estipulada
  rootCauseAnalysis?: string;           // Diagnóstico da Causa Raiz
  fiveWhys?: string[];                  // 5 Porquês
  checklist?: ActionChecklistItem[];    // Plano de Ação 5W2H

  // [D - DO: Execução no Posto & Testes Piloto]
  pilotArea?: string;                   // Posto de Trabalho / Máquina Piloto
  pilotTestObservations?: string;       // Observações da execução prática
  evidenceBeforeUrl?: string;           // Foto do Antes (padrão: photoUrl da ideia)
  evidenceAfterUrl?: string;            // Foto do Depois (melhoria implantada)

  // [C - CHECK: Verificação de Indicadores & Memorial de Ganhos]
  achievedValue?: number;               // Valor real aferido após a melhoria
  costBreakdown?: LeanCostBreakdown;    // Ganhos brutos por fonte
  estimatedCostAvoided?: number;        // Ganho estimado (R$)
  actualCostAvoided?: number;           // Custo evitado real comprovado (R$)
  hoursSaved?: number;                  // Horas de trabalho salvas (h)
  financialGainNotes?: string;          // Memorial dos ganhos

  // [A - ACT: Padronização, Lições e Homologação]
  standardWorkUpdated?: boolean;        // POP / Instrução atualizada?
  standardWorkDocRef?: string;          // Código do documento (ex: POP-EXT-014)
  yokotenReplication?: string;          // Replicação para outras linhas/máquinas
  lessonsLearned?: string;              // Lições aprendidas
  masterApproved?: boolean;             // Homologado como Kaizen de Sucesso
  masterApprovedAt?: string;            // Data de homologação
  masterApprovedBy?: string;            // Gestor que homologou
  quarterlyFollowUp?: QuarterlyFollowUp; // Acompanhamento dos 3 meses pós-homologação
}

// ==========================================
// MÓDULO TPM (Manutenção Produtiva Total)
// ==========================================

export type TpmMachineCriticality = 'A' | 'B' | 'C';
export type TpmMachineStatus = 'operacional' | 'em_manutencao' | 'parada';

export interface TpmMachine {
  id: string;
  tenantId: string;
  sectorId: string;
  sectorName: string;
  name: string;
  code: string;                          // ex: "EXT-01"
  brandModel?: string;                   // ex: "Barmag EvoTape 1200"
  criticality: TpmMachineCriticality;     // A (Crítica), B (Média), C (Baixa)
  status: TpmMachineStatus;
  currentAuditScore: number;             // Nota da última auditoria (0 a 100)
  lastAuditDate?: string;
  tpmPhase: number;                      // Selo de Fase TPM (1 a 4). 1 = Fase 1, 2 = Fase 2, 3 = Fase 3, 4 = Fase 4 (Excelência)
  tpmPhaseHistory?: {
    phase: number;
    achievedAt: string;
    auditId?: string;
    auditScore: number;
  }[];
  description?: string;
  createdAt: string;
}

export interface TpmAuditChecklistItem {
  id: string;
  title: string;
  description: string;
  score: number;                         // 0 a 100 ponderado
  status: 'conforme' | 'parcial' | 'nao_conforme';
  notes?: string;
}

export interface TpmAudit {
  id: string;
  tenantId: string;
  machineId: string;
  machineName: string;
  machineCode: string;
  sectorId: string;
  sectorName: string;
  auditorName: string;
  auditDate: string;
  score: number;                         // 0 a 100
  status: 'conforme' | 'atencao' | 'critico'; // >=85 Conforme, 70-84 Atenção, <70 Crítico
  items: TpmAuditChecklistItem[];
  observations?: string;
  createdAt: string;
}

export type TpmTagType = 'vermelha' | 'azul';
export type TpmTagCategory = 'mecanica' | 'eletrica' | 'pneumatica_hidraulica' | 'seguranca' | 'lubrificacao' | 'limpeza_5s';
export type TpmTagPriority = 'baixa' | 'media' | 'alta' | 'critica';
export type TpmTagStatus = 'aberta' | 'em_andamento' | 'concluida' | 'cancelada';

export interface TpmTag {
  id: string;
  tenantId: string;
  tagNumber: string;                     // ex: "ETQ-2026-001"
  machineId: string;
  machineName: string;
  machineCode: string;
  sectorId: string;
  sectorName: string;
  type: TpmTagType;                      // vermelha (manutenção) vs azul (autônoma)
  category: TpmTagCategory;
  priority: TpmTagPriority;
  description: string;
  openedBy: string;
  openedAt: string;
  dueDate: string;                       // Prazo SLA
  status: TpmTagStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  solutionNotes?: string;
  createdAt: string;
}

export interface TpmMaintenanceMetrics {
  totalMachines: number;
  operationalMachines: number;
  inMaintenanceMachines: number;
  stoppedMachines: number;
  totalAudits: number;
  averageAuditScore: number;
  goldSealMachinesCount: number;         // Máquinas com Selo Ouro (Fase 4/4)
  phase1Count: number;
  phase2Count: number;
  phase3Count: number;
  phase4Count: number;
  criticalityACount: number;
  criticalityBCount: number;
  criticalityCCount: number;
}

export interface AgentArticleProgress {
  agentId: string;
  articleId: string;
  readAt: string;
  timeSpentSeconds: number;     // Tempo real ativo de leitura
  scrolledToBottom: boolean;    // Rolou até o final (profundidade de rolagem >= 80%)
  interactionsCount: number;    // Cliques e rolagens ativas
  isValidated: boolean;         // Validado para o Master (scroll === true && time >= minRequired && time <= 900s)
}

export interface ExamQuestionSnapshot {
  id: number;
  question: string;
  category: string;
  articleId?: string;
  articleTitle?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  selectedOptionIndex?: number; // undefined se em branco
  isCorrect?: boolean;
}

export interface AgentExamResult {
  id: string;
  agentId: string;
  agentName?: string;
  score: number; // Nota final líquida 0 a 10.0 (regra: Max(0, Acertos - Erros) / Total * 10)
  netScore: number; // Pontos líquidos (Acertos - Erros)
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  totalQuestions: number;
  passed: boolean; // score >= 8.0 (Selo de Agente Qualificado)
  answers: Record<number, number>; // questionId -> selectedOptionIndex (ou -1 se em branco)
  questionsSnapshot?: ExamQuestionSnapshot[];
  feedbackSummary?: string;
  completedAt: string;
  durationSeconds?: number;
  rewardClaimed?: boolean;
  rewardClaimedAt?: string;
}

export interface AgentLearningRanking {
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentAvatar?: string;
  articlesReadCount: number;
  validatedArticlesReadCount: number;
  totalArticlesCount: number;
  articlesReadPercent: number;
  validatedArticlesReadPercent: number;
  canTakeExam: boolean; // true if validatedArticlesReadPercent >= 95%
  isQualified: boolean; // Selo Agente Qualificado (Aprovado com nota >= 8.0)
  qualificationDate?: string;
  attemptsCount: number;
  latestExam?: AgentExamResult;
  passedExam: boolean;
  rewardClaimed: boolean;
}

export interface LeanArticleItem {
  id: string;
  title: string;
  category: 'Fundamentos' | 'Qualidade' | 'Produtividade' | 'Métodos' | 'Manutenção';
  readTimeMinutes: number;
  minReadTimeSeconds: number;
  icon: string;
  summary: string;
  badge?: string;
  isNew?: boolean;
  isCustom?: boolean;
  authorName?: string;
  createdAt?: string;
  content: {
    introduction: string;
    keyConcepts: { title: string; description: string }[];
    howToApply: string[];
    factoryExample: string;
    bestPractices: string[];
    quizHint: string;
  };
}

