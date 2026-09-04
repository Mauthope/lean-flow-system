import {
  Tenant,
  Sector,
  User,
  LeanAction,
  DashboardMetrics,
  ActionStatus,
  LeanWasteCategory,
  LeanCostBreakdown,
  ActionChecklistItem,
  MonthlyResultEntry,
  QuarterlyFollowUp,
  KaizenIdea,
  TpmMachine,
  TpmAudit,
  TpmTag,
  TpmMaintenanceMetrics,
  AgentArticleProgress,
  AgentExamResult,
  AgentLearningRanking,
  LeanArticleItem,
  ExamQuestionSnapshot,
  SectorLeanAssessment,
  LeanAssessmentDimensionId,
  LeanAssessmentDimension,
  SectorEvolutionComparison,
  SenseiAssessmentDiagnosis,
  DimensionEvolutionMetric,
  LeanAssessmentCriterion,
  ASSESSMENT_DIMENSIONS_CONFIG,
  ExecutiveBoardFinancials,
  ExecutiveProjectFinancial,
  ControllershipAudit,
  ControllershipAuditStatus,
  ProjectInvestmentCosts,
} from '../lib/types';
import { sendControladoriaAuditInvite } from './emailService';
import {
  STORAGE_KEYS,
  getStoredData,
  setStoredData,
  INITIAL_TENANT,
  INITIAL_TENANTS,
  INITIAL_SECTORS,
  INITIAL_USERS,
  INITIAL_ACTIONS,
  INITIAL_KAIZEN_IDEAS,
  INITIAL_TPM_MACHINES,
  INITIAL_TPM_AUDITS,
  INITIAL_TPM_TAGS,
  INITIAL_LEAN_ARTICLES,
  INITIAL_AGENT_ARTICLES,
  INITIAL_AGENT_EXAMS,
  INITIAL_SECTOR_ASSESSMENTS,
} from '../lib/storage';
import { generateProtocol, generateId } from '../lib/utils';
import { LEAN_EXAM_QUESTIONS, ExamQuestion } from '../data/leanExamQuestions';

export const dataService = {
  // ================= TENANTS / ENTIDADES =================
  getTenants(): Tenant[] {
    return getStoredData<Tenant[]>(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
  },

  getTenantById(id: string): Tenant | undefined {
    return this.getTenants().find((t) => t.id === id);
  },

  getTenantBySlug(slug: string): Tenant | undefined {
    const clean = slug.toLowerCase().trim();
    return this.getTenants().find((t) => t.slug.toLowerCase() === clean || t.id.toLowerCase() === clean);
  },

  getCurrentTenant(): Tenant {
    return getStoredData<Tenant>(STORAGE_KEYS.CURRENT_TENANT, INITIAL_TENANT);
  },

  setCurrentTenant(tenant: Tenant): void {
    setStoredData(STORAGE_KEYS.CURRENT_TENANT, tenant);
  },

  saveTenantAiSettings(aiSettings: {
    geminiApiKey?: string;
    preferredVoice?: string;
    model?: string;
    controladoriaEmail?: string;
    controladoriaName?: string;
    autoNotifyControladoria?: boolean;
  }): Tenant {
    const currentTenant = this.getCurrentTenant();
    const updatedTenant: Tenant = {
      ...currentTenant,
      aiSettings: {
        ...currentTenant.aiSettings,
        ...aiSettings,
        updatedAt: new Date().toISOString(),
      },
    };
    this.setCurrentTenant(updatedTenant);
    const tenants = this.getTenants().map((t) =>
      t.id === updatedTenant.id ? updatedTenant : t
    );
    setStoredData(STORAGE_KEYS.TENANTS, tenants);
    return updatedTenant;
  },

  createTenant(tenant: Omit<Tenant, 'id' | 'createdAt'>): Tenant {
    const tenants = this.getTenants();
    const newTenant: Tenant = {
      ...tenant,
      id: generateId('tenant'),
      createdAt: new Date().toISOString(),
    };
    tenants.push(newTenant);
    setStoredData(STORAGE_KEYS.TENANTS, tenants);
    return newTenant;
  },

  createTenantWithDefaults(params: {
    name: string;
    slug: string;
    cnpjOrCode?: string;
    adminName: string;
    adminEmail: string;
    plan?: 'standard' | 'enterprise';
  }): { tenant: Tenant; adminUser: User } {
    const cleanSlug = params.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const tenant = this.createTenant({
      name: params.name.trim(),
      slug: cleanSlug || generateId('empresa'),
      cnpjOrCode: params.cnpjOrCode?.trim() || 'Não informado',
      plan: params.plan || 'enterprise',
    });

    // Create standard default Lean sectors for this tenant
    const defaultSectors = [
      { name: 'Qualidade & Garantia', code: 'QUAL', color: '#2563eb', description: 'Inspeções e auditorias de processo' },
      { name: 'Manutenção Preditiva & TPM', code: 'MANUT', color: '#d97706', description: 'Manutenção autônoma e disponibilidade de máquinas' },
      { name: 'Engenharia de Processos', code: 'ENG', color: '#7c3aed', description: 'Balanceamento e padronização Kaizen' },
      { name: 'Operações & Montagem', code: 'OPS', color: '#0891b2', description: 'Células e fluxo contínuo' },
      { name: 'Logística & Suprimentos', code: 'LOG', color: '#059669', description: 'Milk-run e fluxo puxado' },
    ];

    defaultSectors.forEach((sec) => {
      this.createSector({
        tenantId: tenant.id,
        name: sec.name,
        code: sec.code,
        description: sec.description,
        color: sec.color,
      });
    });

    // Create initial admin user
    const adminUser = this.createUser({
      tenantId: tenant.id,
      name: params.adminName.trim(),
      email: params.adminEmail.trim(),
      role: 'admin',
      jobTitle: 'Supervisor & Lean Master',
      active: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    return { tenant, adminUser };
  },

  updateTenant(id: string, updates: Partial<Tenant>): Tenant {
    const tenants = this.getTenants();
    const index = tenants.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Entidade não encontrada');
    tenants[index] = { ...tenants[index], ...updates };
    setStoredData(STORAGE_KEYS.TENANTS, tenants);
    return tenants[index];
  },

  deleteTenant(id: string): void {
    const tenants = this.getTenants().filter((t) => t.id !== id);
    setStoredData(STORAGE_KEYS.TENANTS, tenants);
  },

  // ================= SECTORS =================
  getSectors(tenantId?: string): Sector[] {
    const all = getStoredData<Sector[]>(STORAGE_KEYS.SECTORS, INITIAL_SECTORS);
    if (!tenantId) return all;
    return all.filter((s) => s.tenantId === tenantId);
  },

  getSectorById(id: string): Sector | undefined {
    return this.getSectors().find((s) => s.id === id);
  },

  createSector(sector: Omit<Sector, 'id' | 'createdAt'>): Sector {
    const sectors = this.getSectors();
    const newSector: Sector = {
      ...sector,
      id: generateId('sec'),
      createdAt: new Date().toISOString(),
    };
    sectors.push(newSector);
    setStoredData(STORAGE_KEYS.SECTORS, sectors);
    return newSector;
  },

  updateSector(id: string, updates: Partial<Sector>): Sector {
    const sectors = this.getSectors();
    const index = sectors.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Setor não encontrado');
    
    sectors[index] = { ...sectors[index], ...updates };
    setStoredData(STORAGE_KEYS.SECTORS, sectors);
    return sectors[index];
  },

  deleteSector(id: string): void {
    const sectors = this.getSectors().filter((s) => s.id !== id);
    setStoredData(STORAGE_KEYS.SECTORS, sectors);
  },

  // ================= USERS / AGENTS =================
  getUsers(tenantId?: string): User[] {
    const all = getStoredData<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (!tenantId) return all;
    return all.filter((u) => u.tenantId === tenantId);
  },

  getAgents(tenantId?: string): User[] {
    return this.getUsers(tenantId).filter((u) => u.role === 'agent' && u.active);
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    
    // Check sector name if sectorId or allSectors provided
    let sectorName: string | undefined = user.sectorName;
    if (user.allSectors) {
      sectorName = 'Todos os Setores (Geral)';
    } else if (user.sectorIds && user.sectorIds.length > 0) {
      const names = user.sectorIds.map((id) => this.getSectorById(id)?.name).filter(Boolean);
      if (names.length > 0) sectorName = names.join(', ');
    } else if (user.sectorId) {
      const sec = this.getSectorById(user.sectorId);
      if (sec) sectorName = sec.name;
    }

    const newUser: User = {
      ...user,
      id: generateId('usr'),
      sectorName: sectorName || user.sectorName,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStoredData(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');

    if (updates.allSectors !== undefined || updates.sectorIds !== undefined || updates.sectorId !== undefined) {
      if (updates.allSectors) {
        updates.sectorName = 'Todos os Setores (Geral)';
      } else if (updates.sectorIds && updates.sectorIds.length > 0) {
        const names = updates.sectorIds.map((id) => this.getSectorById(id)?.name).filter(Boolean);
        if (names.length > 0) updates.sectorName = names.join(', ');
      } else if (updates.sectorId) {
        const sec = this.getSectorById(updates.sectorId);
        if (sec) updates.sectorName = sec.name;
      }
    }

    users[index] = { ...users[index], ...updates };
    setStoredData(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  deleteUser(id: string): void {
    // Soft or hard delete (we filter out or mark inactive)
    const users = this.getUsers().filter((u) => u.id !== id);
    setStoredData(STORAGE_KEYS.USERS, users);
  },

  getCurrentUser(): User {
    return getStoredData<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  setCurrentUser(user: User): void {
    setStoredData(STORAGE_KEYS.CURRENT_USER, user);
  },

  // ================= LEAN ACTIONS / DEMANDS =================
  getActions(tenantId?: string): LeanAction[] {
    const all = getStoredData<LeanAction[]>(STORAGE_KEYS.ACTIONS, INITIAL_ACTIONS);
    all.forEach((action) => {
      if (!action.quarterlyFollowUp) {
        const initAction = INITIAL_ACTIONS.find((ia) => ia.id === action.id);
        if (initAction?.quarterlyFollowUp) {
          action.quarterlyFollowUp = { ...initAction.quarterlyFollowUp };
        } else {
          action.quarterlyFollowUp = {
            enabled: true,
            startedAt: action.startedAt || action.createdAt || new Date().toISOString(),
            month1: { monthNumber: 1, monthLabel: '1º Mês' },
            month2: { monthNumber: 2, monthLabel: '2º Mês' },
            month3: { monthNumber: 3, monthLabel: '3º Mês' },
            status: 'aguardando_mes_1',
            isCompleted: false,
          };
        }
      }
    });
    if (!tenantId) return all;
    return all.filter((a) => a.tenantId === tenantId);
  },

  getActionById(id: string): LeanAction | undefined {
    const action = this.getActions().find((a) => a.id === id);
    if (action && !action.quarterlyFollowUp) {
      action.quarterlyFollowUp = {
        enabled: true,
        startedAt: action.startedAt || action.createdAt || new Date().toISOString(),
        month1: { monthNumber: 1, monthLabel: '1º Mês' },
        month2: { monthNumber: 2, monthLabel: '2º Mês' },
        month3: { monthNumber: 3, monthLabel: '3º Mês' },
        status: 'aguardando_mes_1',
        isCompleted: false,
      };
    }
    return action;
  },

  getActionByProtocol(protocol: string): LeanAction | undefined {
    const cleanProto = protocol.trim().toUpperCase();
    return this.getActions().find((a) => a.protocol.toUpperCase() === cleanProto);
  },

  getActionsForAgent(agentId: string, tenantId?: string): LeanAction[] {
    return this.getActions(tenantId).filter(
      (a) => a.assignedAgentId === agentId && a.status !== 'nao_aprovada'
    );
  },

  updateAction(id: string, updates: Partial<LeanAction>): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Ação não encontrada');

    const current = actions[index];
    const merged = { ...current, ...updates };

    // Auto-calculate Project Costs (Investimento Capex + Opex)
    if (merged.projectCosts) {
      const parts = Number(merged.projectCosts.partsAndEquipment) || 0;
      const third = Number(merged.projectCosts.thirdPartyServices) || 0;
      const hours = Number(merged.projectCosts.internalLaborHours) || 0;
      const rate = Number(merged.projectCosts.laborHourlyRate) || 45;
      const other = Number(merged.projectCosts.otherCosts) || 0;
      merged.projectCosts.totalCost = parts + third + hours * rate + other;
    }

    // Auto-calculate Cost Breakdown (Ganhos Brutos)
    if (merged.costBreakdown) {
      const grossGains =
        (Number(merged.costBreakdown.laborSavings) || 0) +
        (Number(merged.costBreakdown.productionIncrease) || 0) +
        (Number(merged.costBreakdown.scrapReduction) || 0) +
        (Number(merged.costBreakdown.machineDowntime) || 0) +
        (Number(merged.costBreakdown.toolingAndEnergy) || 0) +
        (Number(merged.costBreakdown.logisticsAndFreight) || 0) +
        (Number(merged.costBreakdown.otherSavings) || 0);

      if (grossGains > 0) {
        merged.actualCostAvoided = grossGains;
      }
    }

    // Auto-calculate Net Savings, ROI % and Payback
    const totalCost = Number(merged.projectCosts?.totalCost) || 0;
    const grossAvoided = Number(merged.actualCostAvoided) || Number(merged.estimatedCostAvoided) || 0;

    if (grossAvoided > 0 || totalCost > 0) {
      merged.netSavings = grossAvoided - totalCost;
      merged.roiPercentage = totalCost > 0 ? Math.round(((grossAvoided - totalCost) / totalCost) * 100) : 0;
      
      const monthlySavings = grossAvoided / 12;
      merged.paybackMonths = monthlySavings > 0 && totalCost > 0 ? Number((totalCost / monthlySavings).toFixed(1)) : 0;
    }

    // Auto-inicializar acompanhamento trimestral para que o agente registre os 3 meses antes da homologação
    if (!merged.quarterlyFollowUp) {
      merged.quarterlyFollowUp = {
        enabled: true,
        startedAt: merged.startedAt || merged.createdAt || new Date().toISOString(),
        month1: { monthNumber: 1, monthLabel: '1º Mês' },
        month2: { monthNumber: 2, monthLabel: '2º Mês' },
        month3: { monthNumber: 3, monthLabel: '3º Mês' },
        status: 'aguardando_mes_1',
        isCompleted: false,
      };
    }

    merged.updatedAt = new Date().toISOString();
    actions[index] = merged;
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  // Lançar resultado mensal no acompanhamento de 3 meses pós-homologação
  saveQuarterlyMonthResult(
    actionId: string,
    monthNumber: 1 | 2 | 3,
    data: {
      value: number;
      hoursSaved?: number;
      notes?: string;
      measuredAt?: string;
      registeredBy?: string;
    }
  ): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === actionId);
    if (index === -1) throw new Error('Ação não encontrada');

    const action = actions[index];
    if (!action.quarterlyFollowUp) {
      action.quarterlyFollowUp = {
        enabled: true,
        startedAt: action.masterApprovedAt || new Date().toISOString(),
        month1: { monthNumber: 1, monthLabel: '1º Mês' },
        month2: { monthNumber: 2, monthLabel: '2º Mês' },
        month3: { monthNumber: 3, monthLabel: '3º Mês' },
        status: 'aguardando_mes_1',
        isCompleted: false,
      };
    }

    const key = `month${monthNumber}` as 'month1' | 'month2' | 'month3';
    action.quarterlyFollowUp[key] = {
      monthNumber,
      monthLabel: `${monthNumber}º Mês`,
      value: Number(data.value) || 0,
      hoursSaved: data.hoursSaved !== undefined ? Number(data.hoursSaved) : undefined,
      notes: data.notes?.trim() || undefined,
      measuredAt: data.measuredAt || new Date().toISOString().split('T')[0],
      registeredBy: data.registeredBy,
    };

    const m1 = action.quarterlyFollowUp.month1?.value;
    const m2 = action.quarterlyFollowUp.month2?.value;
    const m3 = action.quarterlyFollowUp.month3?.value;

    const countFilled = [m1, m2, m3].filter((v) => v !== undefined).length;

    if (countFilled === 3 && m1 !== undefined && m2 !== undefined && m3 !== undefined) {
      const avg = Math.round((m1 + m2 + m3) / 3);
      action.quarterlyFollowUp.averageCostAvoided = avg;
      action.quarterlyFollowUp.isCompleted = true;
      action.quarterlyFollowUp.completedAt = new Date().toISOString();
      action.quarterlyFollowUp.status = 'consolidado';
      // Oficializa o retorno total anualizado (12 meses) como ganho comprovado do projeto
      action.actualCostAvoided = avg * 12;
      if (action.projectCosts?.totalCost) {
        action.netSavings = (avg * 12) - action.projectCosts.totalCost;
      }
    } else if (m1 !== undefined && m2 !== undefined) {
      action.quarterlyFollowUp.status = 'aguardando_mes_3';
      action.quarterlyFollowUp.averageCostAvoided = Math.round((m1 + m2) / 2);
    } else if (m1 !== undefined) {
      action.quarterlyFollowUp.status = 'aguardando_mes_2';
      action.quarterlyFollowUp.averageCostAvoided = m1;
    } else {
      action.quarterlyFollowUp.status = 'aguardando_mes_1';
    }

    action.updatedAt = new Date().toISOString();
    actions[index] = action;
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  // ===================================================================
  // AUDITORIA E HOMOLOGAÇÃO PRÉVIA PELA CONTROLADORIA
  // ===================================================================

  // Submeter ganhos financeiros do projeto à Controladoria
  async submitActionToControladoria(
    actionId: string,
    submittedBy: string,
    originUrl?: string
  ): Promise<{ action: LeanAction; auditUrl: string; token: string }> {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === actionId);
    if (index === -1) throw new Error('Ação não encontrada');

    const action = actions[index];
    const tenant = this.getCurrentTenant();

    // Gerar token escopado único (ex: sec_aud_8f9d7c2a_...)
    const token = `sec_aud_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    const baseUrl =
      originUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const auditUrl = `${baseUrl}/controladoria/auditoria/${token}`;

    const originalBreakdown: LeanCostBreakdown = action.costBreakdown ? { ...action.costBreakdown } : {};
    const originalEstimated = action.estimatedCostAvoided || 0;
    const originalCosts = action.projectCosts ? { ...action.projectCosts } : undefined;

    const controladoriaEmail =
      tenant?.aiSettings?.controladoriaEmail || 'controladoria@empresa.com.br';
    const controladoriaName =
      tenant?.aiSettings?.controladoriaName || 'Controladoria & Finanças Corporativas';

    // Disparar notificação por e-mail (Resend / Supabase Edge / Simulado)
    const emailResult = await sendControladoriaAuditInvite({
      recipientEmail: controladoriaEmail,
      recipientName: controladoriaName,
      projectTitle: action.title,
      protocol: action.protocol,
      sectorName: action.originSectorName || action.targetSectorName,
      leaderName: action.leaderName || action.assignedAgentName || submittedBy,
      estimatedSavings: originalEstimated,
      investmentCost: originalCosts?.totalCost,
      paybackMonths: action.paybackMonths,
      auditUrl,
      token,
    });

    const auditData: ControllershipAudit = {
      id: generateId('aud'),
      token,
      status: 'pendente',
      submittedAt: new Date().toISOString(),
      submittedBy,
      originalCostBreakdown: originalBreakdown,
      originalEstimatedCostAvoided: originalEstimated,
      originalProjectCosts: originalCosts,
      emailSentTo: controladoriaEmail,
      emailSentAt: new Date().toISOString(),
      emailStatus: emailResult.simulated ? 'simulado' : emailResult.success ? 'enviado' : 'falha',
    };

    action.controllershipAudit = auditData;
    action.updatedAt = new Date().toISOString();
    actions[index] = action;
    setStoredData(STORAGE_KEYS.ACTIONS, actions);

    return { action, auditUrl, token };
  },

  // Buscar projeto pelo token de auditoria escopado da Controladoria
  getActionByAuditToken(token: string): LeanAction | null {
    if (!token) return null;
    const actions = this.getActions();
    const action = actions.find((a) => a.controllershipAudit?.token === token);
    return action || null;
  },

  // Processar decisão da Controladoria (Aprovar, Ajustar ou Rejeitar)
  processControllershipAudit(
    token: string,
    review: {
      status: 'aprovado' | 'ajustado_e_aprovado' | 'rejeitado';
      approvedBreakdown?: LeanCostBreakdown;
      approvedEstimatedCostAvoided?: number;
      approvedProjectCosts?: ProjectInvestmentCosts;
      reviewerName: string;
      reviewerEmail: string;
      reviewerRole?: string;
      auditNotes?: string;
      rejectionReason?: string;
    }
  ): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.controllershipAudit?.token === token);
    if (index === -1) throw new Error('Projeto não encontrado para este token de auditoria');

    const action = actions[index];
    if (!action.controllershipAudit) {
      throw new Error('Registro de auditoria não inicializado');
    }

    const now = new Date().toISOString();
    action.controllershipAudit.status = review.status;
    action.controllershipAudit.reviewedAt = now;
    action.controllershipAudit.reviewedBy = review.reviewerName;
    action.controllershipAudit.reviewerEmail = review.reviewerEmail;
    action.controllershipAudit.reviewerRole = review.reviewerRole;
    action.controllershipAudit.auditNotes = review.auditNotes;
    action.controllershipAudit.rejectionReason = review.rejectionReason;

    if (review.status === 'aprovado') {
      action.controllershipAudit.approvedCostBreakdown = {
        ...action.controllershipAudit.originalCostBreakdown,
      };
      action.controllershipAudit.approvedEstimatedCostAvoided =
        action.controllershipAudit.originalEstimatedCostAvoided;
      action.controllershipAudit.approvedProjectCosts =
        action.controllershipAudit.originalProjectCosts;

      // Habilita automaticamente o acompanhamento trimestral com a baseline homologada
      if (!action.quarterlyFollowUp) {
        action.quarterlyFollowUp = {
          enabled: true,
          startedAt: now,
          month1: { monthNumber: 1, monthLabel: '1º Mês' },
          month2: { monthNumber: 2, monthLabel: '2º Mês' },
          month3: { monthNumber: 3, monthLabel: '3º Mês' },
          status: 'aguardando_mes_1',
          isCompleted: false,
        };
      }
    } else if (review.status === 'ajustado_e_aprovado') {
      action.controllershipAudit.approvedCostBreakdown = review.approvedBreakdown;
      action.controllershipAudit.approvedEstimatedCostAvoided = review.approvedEstimatedCostAvoided;
      action.controllershipAudit.approvedProjectCosts = review.approvedProjectCosts;

      // Atualiza os valores da ação com os números auditados pela Controladoria
      if (review.approvedBreakdown) {
        action.costBreakdown = review.approvedBreakdown;
      }
      if (typeof review.approvedEstimatedCostAvoided === 'number') {
        action.estimatedCostAvoided = review.approvedEstimatedCostAvoided;
      }
      if (review.approvedProjectCosts) {
        action.projectCosts = review.approvedProjectCosts;
      }

      // Habilita acompanhamento trimestral
      if (!action.quarterlyFollowUp) {
        action.quarterlyFollowUp = {
          enabled: true,
          startedAt: now,
          month1: { monthNumber: 1, monthLabel: '1º Mês' },
          month2: { monthNumber: 2, monthLabel: '2º Mês' },
          month3: { monthNumber: 3, monthLabel: '3º Mês' },
          status: 'aguardando_mes_1',
          isCompleted: false,
        };
      }
    }

    action.updatedAt = now;
    actions[index] = action;
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return action;
  },

  createPublicDemand(demand: {
    tenantId?: string;
    title: string;
    description: string;
    wasteCategory: LeanWasteCategory;
    originSectorId: string;
    requesterName: string;
    requesterEmail?: string;
    requesterDepartment?: string;
    priority?: 'baixa' | 'media' | 'alta' | 'critica';
  }): LeanAction {
    const actions = this.getActions();
    const currentTenant = this.getCurrentTenant();
    const originSector = this.getSectorById(demand.originSectorId);

    const newAction: LeanAction = {
      id: generateId('act'),
      protocol: generateProtocol(),
      tenantId: demand.tenantId || currentTenant.id,
      title: demand.title,
      description: demand.description,
      wasteCategory: demand.wasteCategory,
      originSectorId: demand.originSectorId,
      originSectorName: originSector?.name || 'Setor Não Definido',
      isPublicDemand: true,
      requesterName: demand.requesterName,
      requesterEmail: demand.requesterEmail,
      requesterDepartment: demand.requesterDepartment,
      status: 'aberta',
      priority: demand.priority || 'media',
      estimatedCostAvoided: 0,
      actualCostAvoided: 0,
      hoursSaved: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      checklist: [],
    };

    actions.unshift(newAction);
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return newAction;
  },

  createActionByAdmin(actionData: Omit<LeanAction, 'id' | 'protocol' | 'createdAt' | 'updatedAt'>): LeanAction {
    const actions = this.getActions();
    const originSector = this.getSectorById(actionData.originSectorId);
    let agent: User | undefined = undefined;
    if (actionData.assignedAgentId) {
      agent = this.getUserById(actionData.assignedAgentId);
    }

    const newAction: LeanAction = {
      ...actionData,
      id: generateId('act'),
      protocol: generateProtocol(),
      originSectorName: originSector?.name || actionData.originSectorName,
      assignedAgentName: agent?.name || actionData.assignedAgentName,
      assignedAgentAvatar: agent?.avatarUrl || actionData.assignedAgentAvatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    actions.unshift(newAction);
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return newAction;
  },

  triageDemand(
    id: string,
    decision: {
      action: 'approve' | 'reject';
      assignedAgentId?: string;
      priority?: LeanAction['priority'];
      estimatedCostAvoided?: number;
      wasteCategory?: LeanWasteCategory;
      rejectionReason?: string;
      adminName: string;
      dueDate?: string;
    }
  ): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Ação não encontrada');

    const item = actions[index];
    const now = new Date().toISOString();

    if (decision.action === 'approve') {
      let agent: User | undefined = undefined;
      if (decision.assignedAgentId) {
        agent = this.getUserById(decision.assignedAgentId);
      }

      actions[index] = {
        ...item,
        status: 'aberta', // or remains aberta but assigned
        assignedAgentId: decision.assignedAgentId || item.assignedAgentId,
        assignedAgentName: agent?.name || item.assignedAgentName,
        assignedAgentAvatar: agent?.avatarUrl || item.assignedAgentAvatar,
        priority: decision.priority || item.priority,
        estimatedCostAvoided: decision.estimatedCostAvoided ?? item.estimatedCostAvoided,
        wasteCategory: decision.wasteCategory || item.wasteCategory,
        dueDate: decision.dueDate || item.dueDate,
        triagedAt: now,
        triagedBy: decision.adminName,
        updatedAt: now,
      };
    } else {
      // Reject
      actions[index] = {
        ...item,
        status: 'nao_aprovada',
        rejectionReason: decision.rejectionReason || 'Demanda não aprovada pela supervisão.',
        triagedAt: now,
        triagedBy: decision.adminName,
        updatedAt: now,
      };
    }

    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  updateActionStatus(
    id: string,
    newStatus: ActionStatus,
    extra?: {
      actualCostAvoided?: number;
      hoursSaved?: number;
      rootCauseAnalysis?: string;
      costBreakdown?: LeanCostBreakdown;
    }
  ): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Ação não encontrada');

    const now = new Date().toISOString();
    const item = actions[index];

    const updates: Partial<LeanAction> = {
      status: newStatus,
      updatedAt: now,
    };

    if (newStatus === 'em_andamento' && !item.startedAt) {
      updates.startedAt = now;
    }

    if (newStatus === 'concluida') {
      updates.completedAt = now;
      if (extra?.actualCostAvoided !== undefined) {
        updates.actualCostAvoided = Number(extra.actualCostAvoided);
      } else if (item.actualCostAvoided === 0 && item.estimatedCostAvoided > 0) {
        // Default to estimated if not specified
        updates.actualCostAvoided = item.estimatedCostAvoided;
      }
      if (extra?.hoursSaved !== undefined) {
        updates.hoursSaved = Number(extra.hoursSaved);
      }
      if (extra?.rootCauseAnalysis !== undefined) {
        updates.rootCauseAnalysis = extra.rootCauseAnalysis;
      }
      if (extra?.costBreakdown !== undefined) {
        updates.costBreakdown = extra.costBreakdown;
      }
    }

    actions[index] = { ...item, ...updates };
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  addActionNote(id: string, note: { authorId: string; authorName: string; authorRole: 'admin' | 'agent'; text: string }): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Ação não encontrada');

    const newNote = {
      ...note,
      id: generateId('note'),
      createdAt: new Date().toISOString(),
    };

    actions[index].notes = [...(actions[index].notes || []), newNote];
    actions[index].updatedAt = new Date().toISOString();

    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  toggleChecklistItem(actionId: string, itemId: string): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === actionId);
    if (index === -1) throw new Error('Ação não encontrada');

    const checklist = actions[index].checklist || [];
    const itemIndex = checklist.findIndex((c) => c.id === itemId);
    if (itemIndex !== -1) {
      const isCompleted = !checklist[itemIndex].completed;
      checklist[itemIndex].completed = isCompleted;
      checklist[itemIndex].completedAt = isCompleted ? new Date().toISOString() : undefined;
      checklist[itemIndex].status = isCompleted ? 'concluida' : 'pendente';
      if (isCompleted && !checklist[itemIndex].endDate) {
        checklist[itemIndex].endDate = new Date().toISOString().split('T')[0];
      }
    }

    actions[index].checklist = checklist;
    actions[index].updatedAt = new Date().toISOString();
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  addActivityRecord(
    actionId: string,
    activity: {
      label: string;
      startDate?: string;
      endDate?: string;
      responsibleName?: string;
      observations?: string;
      durationHours?: number;
      status?: 'pendente' | 'em_andamento' | 'concluida';
    }
  ): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === actionId);
    if (index === -1) throw new Error('Ação não encontrada');

    const checklist = actions[index].checklist || [];
    const isCompleted = activity.status === 'concluida';

    checklist.push({
      id: generateId('actv'),
      label: activity.label,
      startDate: activity.startDate || new Date().toISOString().split('T')[0],
      endDate: activity.endDate,
      responsibleName: activity.responsibleName,
      observations: activity.observations,
      durationHours: activity.durationHours,
      status: activity.status || 'pendente',
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    });

    actions[index].checklist = checklist;
    actions[index].updatedAt = new Date().toISOString();
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  updateActivityRecord(
    actionId: string,
    activityId: string,
    updates: Partial<ActionChecklistItem>
  ): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === actionId);
    if (index === -1) throw new Error('Ação não encontrada');

    const checklist = actions[index].checklist || [];
    const actIndex = checklist.findIndex((c) => c.id === activityId);
    if (actIndex !== -1) {
      const isCompleted = updates.status === 'concluida' || updates.completed === true;
      checklist[actIndex] = {
        ...checklist[actIndex],
        ...updates,
        completed: isCompleted,
        completedAt: isCompleted ? (checklist[actIndex].completedAt || new Date().toISOString()) : undefined,
      };
    }

    actions[index].checklist = checklist;
    actions[index].updatedAt = new Date().toISOString();
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  deleteActivityRecord(actionId: string, activityId: string): LeanAction {
    const actions = this.getActions();
    const index = actions.findIndex((a) => a.id === actionId);
    if (index === -1) throw new Error('Ação não encontrada');

    actions[index].checklist = (actions[index].checklist || []).filter((c) => c.id !== activityId);
    actions[index].updatedAt = new Date().toISOString();
    setStoredData(STORAGE_KEYS.ACTIONS, actions);
    return actions[index];
  },

  addChecklistItem(actionId: string, label: string): LeanAction {
    return this.addActivityRecord(actionId, { label });
  },

  // ================= METRICS & DASHBOARD =================
  getMetrics(tenantId?: string): DashboardMetrics {
    const actions = this.getActions(tenantId);
    const users = this.getUsers(tenantId).filter((u) => u.role === 'agent');
    const sectors = this.getSectors(tenantId);

    const totalActions = actions.length;
    const openActions = actions.filter((a) => a.status === 'aberta').length;
    const inProgressActions = actions.filter((a) => a.status === 'em_andamento').length;
    const waitingApprovalActions = actions.filter((a) => a.status === 'aguardando_aprovacao').length;
    const completedActions = actions.filter((a) => a.status === 'concluida').length;
    const rejectedActions = actions.filter((a) => a.status === 'nao_aprovada').length;

    const totalEstimatedCostAvoided = actions.reduce((acc, a) => acc + (a.estimatedCostAvoided || 0), 0);
    const inProgressList = actions.filter(
      (a) => a.status === 'em_andamento' || a.status === 'aberta' || a.status === 'aguardando_aprovacao'
    );
    const inProgressEstimatedCostAvoided = inProgressList.reduce((acc, a) => {
      const val = a.estimatedCostAvoided || (a.quarterlyFollowUp?.averageCostAvoided ? a.quarterlyFollowUp.averageCostAvoided : 0);
      return acc + val;
    }, 0);
    const inProgressAnnualCostAvoided = inProgressEstimatedCostAvoided * 12;
    const boardFinancials = this.getExecutiveBoardFinancials(tenantId);
    const totalActualCostAvoided = boardFinancials.activeAnnualTotal > 0
      ? boardFinancials.activeAnnualTotal
      : actions
          .filter((a) => a.status === 'concluida')
          .reduce((acc, a) => {
            const val = a.quarterlyFollowUp?.averageCostAvoided
              ? a.quarterlyFollowUp.averageCostAvoided * 12
              : a.actualCostAvoided || 0;
            return acc + val;
          }, 0);
    const totalCompletedCostAvoided =
      (boardFinancials.activeAnnualTotal || 0) + (boardFinancials.expiredAnnualTotal || 0) > 0
        ? (boardFinancials.activeAnnualTotal || 0) + (boardFinancials.expiredAnnualTotal || 0)
        : actions
            .filter((a) => a.status === 'concluida')
            .reduce((acc, a) => {
              const val = a.quarterlyFollowUp?.averageCostAvoided
                ? a.quarterlyFollowUp.averageCostAvoided * 12
                : a.actualCostAvoided || 0;
              return acc + val;
            }, 0);
    const totalHoursSaved = actions.reduce((acc, a) => acc + (a.hoursSaved || 0), 0);

    const validActions = totalActions - rejectedActions;
    const resolutionRate = validActions > 0 ? Math.round((completedActions / validActions) * 100) : 0;

    // Average cycle days
    let totalCycleDays = 0;
    let cycleCount = 0;
    actions.forEach((a) => {
      if (a.completedAt && a.createdAt) {
        const start = new Date(a.createdAt).getTime();
        const end = new Date(a.completedAt).getTime();
        const days = (end - start) / (1000 * 60 * 60 * 24);
        if (days >= 0) {
          totalCycleDays += days;
          cycleCount++;
        }
      }
    });
    const averageCycleDays = cycleCount > 0 ? Math.round((totalCycleDays / cycleCount) * 10) / 10 : 0;

    // By Waste Category
    const byWasteCategory: Record<LeanWasteCategory, number> = {
      superproducao: 0,
      espera: 0,
      transporte: 0,
      processamento_excessivo: 0,
      estoque: 0,
      movimentacao: 0,
      defeitos: 0,
      talento_subutilizado: 0,
    };
    actions.forEach((a) => {
      if (byWasteCategory[a.wasteCategory] !== undefined) {
        byWasteCategory[a.wasteCategory]++;
      }
    });

    // By Sector
    const bySector = sectors.map((sec) => {
      const secActions = actions.filter((a) => a.originSectorId === sec.id || a.targetSectorId === sec.id);
      const cost = secActions
        .filter((a) => a.status === 'concluida')
        .reduce((acc, a) => {
          const actionCost = a.quarterlyFollowUp?.averageCostAvoided
            ? a.quarterlyFollowUp.averageCostAvoided * 12
            : a.actualCostAvoided || 0;
          return acc + actionCost;
        }, 0);
      return {
        sectorId: sec.id,
        sectorName: sec.name,
        count: secActions.length,
        costAvoided: cost,
      };
    });

    // By Agent
    const byAgent = users.map((agent) => {
      const agentActions = actions.filter((a) => a.assignedAgentId === agent.id);
      const completed = agentActions.filter((a) => a.status === 'concluida');
      // No pipeline inclui em andamento, aguardando homologação e abertas
      const inProgress = agentActions.filter(
        (a) => a.status === 'em_andamento' || a.status === 'aguardando_aprovacao' || a.status === 'aberta'
      );
      const cost = completed.reduce((acc, a) => {
        const actionCost = a.quarterlyFollowUp?.averageCostAvoided
          ? a.quarterlyFollowUp.averageCostAvoided * 12
          : a.actualCostAvoided || 0;
        return acc + actionCost;
      }, 0);
      const hours = agentActions.reduce((acc, a) => acc + (a.hoursSaved || 0), 0);
      const efficiency =
        agentActions.length > 0 ? Math.round((completed.length / agentActions.length) * 100) : 0;

      return {
        agentId: agent.id,
        agentName: agent.name,
        avatarUrl: agent.avatarUrl,
        sectorName: agent.sectorName,
        assignedCount: agentActions.length,
        completedCount: completed.length,
        inProgressCount: inProgress.length,
        actualCostAvoided: cost,
        hoursSaved: hours,
        efficiencyRate: efficiency,
      };
    });

    // Cost Breakdown Totals (Alinhado proporcionalmente com totalActualCostAvoided da carteira vigente)
    const costBreakdownTotals: LeanCostBreakdown = {
      laborSavings: 0,
      productionIncrease: 0,
      scrapReduction: 0,
      machineDowntime: 0,
      toolingAndEnergy: 0,
      logisticsAndFreight: 0,
      otherSavings: 0,
    };

    // Filtra projetos concluídos vigentes no ano (ou todos caso nenhum esteja ativo)
    const activeCompletedActions = actions.filter((a) => {
      if (a.status !== 'concluida') return false;
      const refDate = new Date(a.masterApprovedAt || a.completedAt || a.updatedAt || a.createdAt).getTime();
      const days = Math.max(0, Math.floor((Date.now() - refDate) / (1000 * 60 * 60 * 24)));
      return days <= 365;
    });

    const targetBreakdownActions = activeCompletedActions.length > 0
      ? activeCompletedActions
      : actions.filter((a) => a.status === 'concluida');

    targetBreakdownActions.forEach((a) => {
      const annualizedCost = a.quarterlyFollowUp?.averageCostAvoided
        ? a.quarterlyFollowUp.averageCostAvoided * 12
        : a.actualCostAvoided || 0;

      if (a.costBreakdown) {
        const rawSum =
          (a.costBreakdown.laborSavings || 0) +
          (a.costBreakdown.productionIncrease || 0) +
          (a.costBreakdown.scrapReduction || 0) +
          (a.costBreakdown.machineDowntime || 0) +
          (a.costBreakdown.toolingAndEnergy || 0) +
          (a.costBreakdown.logisticsAndFreight || 0) +
          (a.costBreakdown.otherSavings || 0);

        const factor = rawSum > 0 ? annualizedCost / rawSum : 1;

        costBreakdownTotals.laborSavings! += Math.round((a.costBreakdown.laborSavings || 0) * factor);
        costBreakdownTotals.productionIncrease! += Math.round((a.costBreakdown.productionIncrease || 0) * factor);
        costBreakdownTotals.scrapReduction! += Math.round((a.costBreakdown.scrapReduction || 0) * factor);
        costBreakdownTotals.machineDowntime! += Math.round((a.costBreakdown.machineDowntime || 0) * factor);
        costBreakdownTotals.toolingAndEnergy! += Math.round((a.costBreakdown.toolingAndEnergy || 0) * factor);
        costBreakdownTotals.logisticsAndFreight! += Math.round((a.costBreakdown.logisticsAndFreight || 0) * factor);
        costBreakdownTotals.otherSavings! += Math.round((a.costBreakdown.otherSavings || 0) * factor);
      } else if (annualizedCost > 0) {
        costBreakdownTotals.laborSavings! += Math.round(annualizedCost * 0.4);
        costBreakdownTotals.productionIncrease! += Math.round(annualizedCost * 0.35);
        costBreakdownTotals.scrapReduction! += Math.round(annualizedCost * 0.25);
      }
    });

    return {
      totalActions,
      openActions,
      inProgressActions,
      waitingApprovalActions,
      completedActions,
      rejectedActions,
      totalEstimatedCostAvoided,
      inProgressEstimatedCostAvoided,
      inProgressAnnualCostAvoided,
      totalActualCostAvoided,
      totalCompletedCostAvoided,
      totalHoursSaved,
      costBreakdownTotals,
      boardFinancials,
      resolutionRate,
      averageCycleDays,
      byWasteCategory,
      bySector,
      byAgent,
    };
  },

  // ================= EXECUTIVE BOARD FINANCIALS (DRE LEAN 12 MESES) =================
  getExecutiveBoardFinancials(tenantId?: string): ExecutiveBoardFinancials {
    const actions = this.getActions(tenantId);
    // Projetos homologados ou concluídos
    const homologatedActions = actions.filter(
      (a) => a.masterApproved || a.status === 'concluida'
    );

    const now = Date.now();

    const projectFinancials: ExecutiveProjectFinancial[] = homologatedActions.map((action) => {
      // 1. Cálculo do Retorno Mensal (Média dos 3 meses)
      let monthlyCostAvoided = 0;
      if (action.quarterlyFollowUp?.averageCostAvoided && action.quarterlyFollowUp.averageCostAvoided > 0) {
        monthlyCostAvoided = action.quarterlyFollowUp.averageCostAvoided;
      } else {
        const fu = action.quarterlyFollowUp;
        const validValues = [fu?.month1?.value, fu?.month2?.value, fu?.month3?.value].filter(
          (v): v is number => typeof v === 'number' && !isNaN(v) && v > 0
        );
        if (validValues.length > 0) {
          monthlyCostAvoided = Math.round(validValues.reduce((a, b) => a + b, 0) / validValues.length);
        } else if (action.actualCostAvoided && action.actualCostAvoided > 0) {
          monthlyCostAvoided = Math.round(action.actualCostAvoided / 12);
        } else if (action.estimatedCostAvoided && action.estimatedCostAvoided > 0) {
          monthlyCostAvoided = Math.round(action.estimatedCostAvoided / 12);
        }
      }

      // 2. Retorno Total Anualizado (12 Meses) = Retorno Mensal * 12
      const annualCostAvoided = monthlyCostAvoided * 12;

      // 3. Custos Totais de Investimento (Capex + Opex)
      const totalInvestmentCost = action.projectCosts?.totalCost || 0;

      // 4. Retorno Líquido
      const netAnnualSavings = annualCostAvoided - totalInvestmentCost;
      const netMonthlySavings = Math.round(netAnnualSavings / 12);

      const roiPercentage =
        totalInvestmentCost > 0
          ? Math.round((netAnnualSavings / totalInvestmentCost) * 100)
          : annualCostAvoided > 0 ? 100 : 0;

      const paybackMonths =
        monthlyCostAvoided > 0
          ? Math.round((totalInvestmentCost / monthlyCostAvoided) * 10) / 10
          : 0;
      const paybackYears = Number((paybackMonths / 12).toFixed(1));

      // 5. Ciclo de Vigência de 1 Ano (365 Dias - Vencimento do Projeto)
      const homologatedAt = action.masterApprovedAt || action.completedAt || action.updatedAt || action.createdAt;
      const refDate = new Date(homologatedAt).getTime();
      const daysElapsed = Math.max(0, Math.floor((now - refDate) / (1000 * 60 * 60 * 24)));
      const isExpired = daysElapsed > 365;
      const expirationDate = new Date(refDate + 365 * 24 * 60 * 60 * 1000).toISOString();

      const monthsElapsed = isExpired ? 12 : Math.min(12, Math.max(1, Math.ceil(daysElapsed / 30.4375)));
      const monthsRemaining = isExpired ? 0 : Math.max(0, 12 - monthsElapsed);

      const fu = action.quarterlyFollowUp;
      const quarterlyMonthsFilled = [fu?.month1?.value, fu?.month2?.value, fu?.month3?.value].filter(
        (v) => v !== undefined && v !== null
      ).length;

      return {
        actionId: action.id,
        protocol: action.protocol,
        title: action.title,
        sectorName: action.originSectorName || action.targetSectorName || 'Fábrica',
        responsibleName: action.assignedAgentName || action.leaderName || 'Especialista Lean',
        homologatedAt,
        monthlyCostAvoided,
        annualCostAvoided,
        totalInvestmentCost,
        netAnnualSavings,
        netMonthlySavings,
        roiPercentage,
        paybackMonths,
        paybackYears,
        daysElapsed,
        monthsElapsed,
        monthsRemaining,
        isExpired,
        expirationDate,
        quarterlyMonthsFilled,
      };
    });

    // Ordenação: primeiro projetos ativos (por maior ganho anual), depois os expirados
    projectFinancials.sort((a, b) => {
      if (a.isExpired !== b.isExpired) {
        return a.isExpired ? 1 : -1;
      }
      return b.annualCostAvoided - a.annualCostAvoided;
    });

    const activeProjects = projectFinancials.filter((p) => !p.isExpired);
    const expiredProjects = projectFinancials.filter((p) => p.isExpired);

    const activeMonthlyTotal = activeProjects.reduce((acc, p) => acc + p.monthlyCostAvoided, 0);
    const activeAnnualTotal = activeProjects.reduce((acc, p) => acc + p.annualCostAvoided, 0);
    const activeNetAnnualTotal = activeProjects.reduce((acc, p) => acc + (p.netAnnualSavings || 0), 0);
    const activeInvestmentTotal = activeProjects.reduce((acc, p) => acc + p.totalInvestmentCost, 0);
    const expiredAnnualTotal = expiredProjects.reduce((acc, p) => acc + p.annualCostAvoided, 0);

    const projectsWithPayback = activeProjects.filter((p) => p.paybackMonths > 0);
    const averagePaybackMonths = projectsWithPayback.length > 0
      ? Math.round((projectsWithPayback.reduce((acc, p) => acc + p.paybackMonths, 0) / projectsWithPayback.length) * 10) / 10
      : 0;
    const averagePaybackYears = Number((averagePaybackMonths / 12).toFixed(1));

    return {
      activeMonthlyTotal,
      activeAnnualTotal,
      activeNetAnnualTotal,
      activeInvestmentTotal,
      averagePaybackMonths,
      averagePaybackYears,
      activeProjectsCount: activeProjects.length,
      expiredProjectsCount: expiredProjects.length,
      expiredAnnualTotal,
      projects: projectFinancials,
    };
  },

  // ================= CANAL KAIZEN (BANCO DE IDEIAS) =================
  getKaizenIdeas(tenantId?: string): KaizenIdea[] {
    const all = getStoredData<KaizenIdea[]>(STORAGE_KEYS.KAIZEN_IDEAS, INITIAL_KAIZEN_IDEAS);
    if (!tenantId) return all;
    return all.filter((k) => k.tenantId === tenantId);
  },

  getKaizenIdeaById(id: string): KaizenIdea | undefined {
    return this.getKaizenIdeas().find((k) => k.id === id);
  },

  createKaizenIdea(data: {
    tenantId?: string;
    authorName: string;
    sectorId: string;
    authorRoleTitle: string;
    summary: string;
    photoUrl?: string;
    photoName?: string;
  }): KaizenIdea {
    const ideas = this.getKaizenIdeas();
    const sector = this.getSectorById(data.sectorId);
    const now = new Date().toISOString();
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const newIdea: KaizenIdea = {
      id: 'kzn_' + Date.now(),
      protocol: `KZN-2026-${randomNum}`,
      tenantId: data.tenantId || this.getCurrentTenant().id,
      authorName: data.authorName.trim(),
      sectorId: data.sectorId,
      sectorName: sector?.name || 'Geral',
      authorRoleTitle: data.authorRoleTitle.trim(),
      summary: data.summary.trim(),
      photoUrl: data.photoUrl,
      photoName: data.photoName,
      createdAt: now,
      updatedAt: now,
      status: 'pendente',
    };

    ideas.unshift(newIdea);
    setStoredData(STORAGE_KEYS.KAIZEN_IDEAS, ideas);
    return newIdea;
  },

  approveKaizenIdea(
    id: string,
    reviewerName: string,
    options?: {
      responsibleName?: string;
      assignedAgentId?: string;
      estimatedCostAvoided?: number;
      actualCostAvoided?: number;
      hoursSaved?: number;
      executionStatus?: 'planejamento' | 'em_implantacao' | 'implantada_sucesso';
      implementationDate?: string;
      financialGainNotes?: string;
    }
  ): KaizenIdea {
    const ideas = this.getKaizenIdeas();
    const index = ideas.findIndex((k) => k.id === id);
    if (index === -1) throw new Error('Ideia Kaizen não encontrada');

    const current = ideas[index];
    const now = new Date().toISOString();

    const updated: KaizenIdea = {
      ...current,
      status: 'aprovada',
      reviewedBy: reviewerName,
      reviewedAt: now,
      updatedAt: now,
      executionStatus: options?.executionStatus || 'planejamento',
      responsibleName: options?.responsibleName?.trim() || current.responsibleName,
      assignedAgentId: options?.assignedAgentId || current.assignedAgentId,
      estimatedCostAvoided:
        options?.estimatedCostAvoided !== undefined
          ? Number(options.estimatedCostAvoided)
          : current.estimatedCostAvoided,
      actualCostAvoided:
        options?.actualCostAvoided !== undefined
          ? Number(options.actualCostAvoided)
          : current.actualCostAvoided,
      hoursSaved: options?.hoursSaved !== undefined ? Number(options.hoursSaved) : current.hoursSaved,
      implementationDate: options?.implementationDate || current.implementationDate,
      financialGainNotes: options?.financialGainNotes?.trim() || current.financialGainNotes,
    };

    ideas[index] = updated;
    setStoredData(STORAGE_KEYS.KAIZEN_IDEAS, ideas);
    return updated;
  },

  rejectKaizenIdea(id: string, reviewerName: string, reason: string): KaizenIdea {
    const ideas = this.getKaizenIdeas();
    const index = ideas.findIndex((k) => k.id === id);
    if (index === -1) throw new Error('Ideia Kaizen não encontrada');

    const current = ideas[index];
    const now = new Date().toISOString();

    const updated: KaizenIdea = {
      ...current,
      status: 'rejeitada',
      reviewedBy: reviewerName,
      reviewedAt: now,
      rejectionReason: reason.trim(),
      updatedAt: now,
    };

    ideas[index] = updated;
    setStoredData(STORAGE_KEYS.KAIZEN_IDEAS, ideas);
    return updated;
  },

  updateKaizenIdea(id: string, updates: Partial<KaizenIdea>): KaizenIdea {
    const ideas = this.getKaizenIdeas();
    const index = ideas.findIndex((k) => k.id === id);
    if (index === -1) throw new Error('Ideia Kaizen não encontrada');

    const current = ideas[index];
    const updated: KaizenIdea = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    ideas[index] = updated;
    setStoredData(STORAGE_KEYS.KAIZEN_IDEAS, ideas);
    return updated;
  },

  getKaizenMetrics(tenantId?: string) {
    const ideas = this.getKaizenIdeas(tenantId);
    const approved = ideas.filter((i) => i.status === 'aprovada');
    const pending = ideas.filter((i) => i.status === 'pendente');
    const rejected = ideas.filter((i) => i.status === 'rejeitada');

    const totalSavings = approved.reduce(
      (acc, i) => acc + (Number(i.actualCostAvoided) || Number(i.estimatedCostAvoided) || 0),
      0
    );
    const totalHoursSaved = approved.reduce((acc, i) => acc + (Number(i.hoursSaved) || 0), 0);
    const approvalRate = ideas.length > 0 ? Math.round((approved.length / ideas.length) * 100) : 0;

    return {
      totalIdeas: ideas.length,
      pendingIdeas: pending.length,
      approvedIdeas: approved.length,
      rejectedIdeas: rejected.length,
      totalSavings,
      totalHoursSaved,
      approvalRate,
    };
  },

  getKaizenIdeaByProtocol(protocol: string): KaizenIdea | undefined {
    return this.getKaizenIdeas().find((k) => k.protocol.toUpperCase() === protocol.toUpperCase());
  },

  saveKaizenQuarterlyMonthResult(
    ideaId: string,
    monthNumber: 1 | 2 | 3,
    data: {
      value: number;
      hoursSaved?: number;
      notes?: string;
      measuredAt?: string;
      registeredBy?: string;
    }
  ): KaizenIdea {
    const ideas = this.getKaizenIdeas();
    const index = ideas.findIndex((k) => k.id === ideaId);
    if (index === -1) throw new Error('Ideia Kaizen não encontrada');

    const idea = ideas[index];
    if (!idea.quarterlyFollowUp) {
      idea.quarterlyFollowUp = {
        enabled: true,
        startedAt: idea.masterApprovedAt || new Date().toISOString(),
        month1: { monthNumber: 1, monthLabel: '1º Mês' },
        month2: { monthNumber: 2, monthLabel: '2º Mês' },
        month3: { monthNumber: 3, monthLabel: '3º Mês' },
        status: 'aguardando_mes_1',
        isCompleted: false,
      };
    }

    const key = `month${monthNumber}` as 'month1' | 'month2' | 'month3';
    idea.quarterlyFollowUp[key] = {
      monthNumber,
      monthLabel: `${monthNumber}º Mês`,
      value: Number(data.value) || 0,
      hoursSaved: data.hoursSaved !== undefined ? Number(data.hoursSaved) : undefined,
      notes: data.notes?.trim() || undefined,
      measuredAt: data.measuredAt || new Date().toISOString().split('T')[0],
      registeredBy: data.registeredBy,
    };

    const m1 = idea.quarterlyFollowUp.month1?.value;
    const m2 = idea.quarterlyFollowUp.month2?.value;
    const m3 = idea.quarterlyFollowUp.month3?.value;

    const countFilled = [m1, m2, m3].filter((v) => v !== undefined).length;

    if (countFilled === 3 && m1 !== undefined && m2 !== undefined && m3 !== undefined) {
      const avg = Math.round((m1 + m2 + m3) / 3);
      idea.quarterlyFollowUp.averageCostAvoided = avg;
      idea.quarterlyFollowUp.isCompleted = true;
      idea.quarterlyFollowUp.completedAt = new Date().toISOString();
      idea.quarterlyFollowUp.status = 'consolidado';
      idea.actualCostAvoided = avg;
    } else if (m1 !== undefined && m2 !== undefined) {
      idea.quarterlyFollowUp.status = 'aguardando_mes_3';
    } else if (m1 !== undefined) {
      idea.quarterlyFollowUp.status = 'aguardando_mes_2';
    }

    idea.updatedAt = new Date().toISOString();
    ideas[index] = idea;
    setStoredData(STORAGE_KEYS.KAIZEN_IDEAS, ideas);
    return idea;
  },

  // ================= TPM (MANUTENÇÃO PRODUTIVA TOTAL) =================

  // --- Máquinas por Setor ---
  getTpmMachines(sectorId?: string): TpmMachine[] {
    const all = getStoredData<TpmMachine[]>(STORAGE_KEYS.TPM_MACHINES, INITIAL_TPM_MACHINES);
    if (sectorId && sectorId !== 'all') {
      return all.filter((m) => m.sectorId === sectorId);
    }
    return all;
  },

  getTpmMachineById(id: string): TpmMachine | undefined {
    const all = this.getTpmMachines();
    return all.find((m) => m.id === id);
  },

  createTpmMachine(data: {
    sectorId: string;
    sectorName: string;
    name: string;
    code: string;
    brandModel?: string;
    criticality: TpmMachine['criticality'];
    status: TpmMachine['status'];
    tpmPhase?: number;
    description?: string;
  }): TpmMachine {
    const machines = this.getTpmMachines();
    const currentTenant = this.getCurrentTenant();

    const newMachine: TpmMachine = {
      id: `mach_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tenantId: currentTenant.id,
      sectorId: data.sectorId,
      sectorName: data.sectorName,
      name: data.name,
      code: data.code.toUpperCase(),
      brandModel: data.brandModel,
      criticality: data.criticality,
      status: data.status,
      currentAuditScore: 0,
      tpmPhase: Math.min(4, Math.max(1, data.tpmPhase || 1)),
      tpmPhaseHistory: [],
      description: data.description,
      createdAt: new Date().toISOString(),
    };

    machines.unshift(newMachine);
    setStoredData(STORAGE_KEYS.TPM_MACHINES, machines);
    return newMachine;
  },

  updateTpmMachine(id: string, updates: Partial<TpmMachine>): TpmMachine {
    const machines = this.getTpmMachines();
    const index = machines.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Máquina não encontrada');

    const updated = { ...machines[index], ...updates };
    machines[index] = updated;
    setStoredData(STORAGE_KEYS.TPM_MACHINES, machines);
    return updated;
  },

  advanceTpmMachinePhase(machineId: string): TpmMachine {
    const machine = this.getTpmMachineById(machineId);
    if (!machine) throw new Error('Máquina não encontrada');

    const currentPhase = machine.tpmPhase || 1;
    if (currentPhase >= 4) return machine; // Já está na fase máxima

    const nextPhase = currentPhase + 1;
    const history = machine.tpmPhaseHistory ? [...machine.tpmPhaseHistory] : [];
    history.push({
      phase: nextPhase,
      achievedAt: new Date().toISOString(),
      auditScore: 100,
    });

    return this.updateTpmMachine(machineId, {
      tpmPhase: nextPhase,
      tpmPhaseHistory: history,
    });
  },

  setTpmMachinePhase(machineId: string, phase: number): TpmMachine {
    const safePhase = Math.min(4, Math.max(1, phase));
    return this.updateTpmMachine(machineId, {
      tpmPhase: safePhase,
    });
  },

  deleteTpmMachine(id: string): void {
    const machines = this.getTpmMachines().filter((m) => m.id !== id);
    setStoredData(STORAGE_KEYS.TPM_MACHINES, machines);
  },

  // --- Auditorias TPM & Notas de Avaliação ---
  getTpmAudits(machineId?: string): TpmAudit[] {
    const all = getStoredData<TpmAudit[]>(STORAGE_KEYS.TPM_AUDITS, INITIAL_TPM_AUDITS);
    if (machineId) {
      return all.filter((a) => a.machineId === machineId);
    }
    return all;
  },

  createTpmAudit(data: {
    machineId: string;
    machineName: string;
    machineCode: string;
    sectorId: string;
    sectorName: string;
    auditorName: string;
    auditDate: string;
    score: number;
    status: 'conforme' | 'atencao' | 'critico';
    items: TpmAudit['items'];
    observations?: string;
  }): TpmAudit & { phaseAdvanced?: boolean; previousPhase?: number; newPhase?: number } {
    const audits = this.getTpmAudits();
    const currentTenant = this.getCurrentTenant();
    const now = new Date().toISOString();

    const newAudit: TpmAudit = {
      id: `adt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tenantId: currentTenant.id,
      machineId: data.machineId,
      machineName: data.machineName,
      machineCode: data.machineCode,
      sectorId: data.sectorId,
      sectorName: data.sectorName,
      auditorName: data.auditorName,
      auditDate: data.auditDate || now,
      score: Math.min(100, Math.max(0, Math.round(data.score))),
      status: data.status,
      items: data.items,
      observations: data.observations,
      createdAt: now,
    };

    audits.unshift(newAudit);
    setStoredData(STORAGE_KEYS.TPM_AUDITS, audits);

    let phaseAdvanced = false;
    let previousPhase = 1;
    let newPhase = 1;

    // Atualiza automaticamente a nota da máquina e, se 100%, avança a máquina de fase no Selo TPM!
    try {
      const machine = this.getTpmMachineById(data.machineId);
      const updates: Partial<TpmMachine> = {
        currentAuditScore: newAudit.score,
        lastAuditDate: newAudit.auditDate,
      };

      if (machine) {
        previousPhase = machine.tpmPhase || 1;
        newPhase = previousPhase;

        // Regra de Ouro: Ao atingir 100% na auditoria, avança para a próxima fase do selo!
        if (newAudit.score === 100 && previousPhase < 4) {
          newPhase = previousPhase + 1;
          phaseAdvanced = true;
          updates.tpmPhase = newPhase;

          const history = machine.tpmPhaseHistory ? [...machine.tpmPhaseHistory] : [];
          history.push({
            phase: newPhase,
            achievedAt: newAudit.auditDate,
            auditId: newAudit.id,
            auditScore: newAudit.score,
          });
          updates.tpmPhaseHistory = history;
        }
      }

      this.updateTpmMachine(data.machineId, updates);
    } catch (e) {
      console.warn('Erro ao atualizar score e selo de fase da máquina auditada:', e);
    }

    return {
      ...newAudit,
      phaseAdvanced,
      previousPhase,
      newPhase,
    };
  },

  // --- Gestão de Etiquetas TPM (Manutenção & Autônoma) ---
  getTpmTags(filters?: {
    sectorId?: string;
    machineId?: string;
    type?: 'vermelha' | 'azul';
    status?: string;
  }): TpmTag[] {
    let all = getStoredData<TpmTag[]>(STORAGE_KEYS.TPM_TAGS, INITIAL_TPM_TAGS);

    if (filters?.sectorId && filters.sectorId !== 'all') {
      all = all.filter((t) => t.sectorId === filters.sectorId);
    }
    if (filters?.machineId && filters.machineId !== 'all') {
      all = all.filter((t) => t.machineId === filters.machineId);
    }
    if (filters?.type) {
      all = all.filter((t) => t.type === filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      if (filters.status === 'em_atraso') {
        const now = new Date();
        all = all.filter((t) => t.status !== 'concluida' && t.status !== 'cancelada' && new Date(t.dueDate) < now);
      } else if (filters.status === 'no_prazo') {
        const now = new Date();
        all = all.filter((t) => t.status !== 'concluida' && t.status !== 'cancelada' && new Date(t.dueDate) >= now);
      } else if (filters.status === 'atendida_no_prazo') {
        all = all.filter((t) => t.status === 'concluida' && (!t.resolvedAt || new Date(t.resolvedAt) <= new Date(t.dueDate)));
      } else if (filters.status === 'atendida_em_atraso') {
        all = all.filter((t) => t.status === 'concluida' && t.resolvedAt && new Date(t.resolvedAt) > new Date(t.dueDate));
      } else {
        all = all.filter((t) => t.status === filters.status);
      }
    }

    return all;
  },

  createTpmTag(data: {
    machineId: string;
    machineName: string;
    machineCode: string;
    sectorId: string;
    sectorName: string;
    type: TpmTag['type'];
    category: TpmTag['category'];
    priority: TpmTag['priority'];
    description: string;
    openedBy: string;
    dueDate: string;
  }): TpmTag {
    const tags = this.getTpmTags();
    const currentTenant = this.getCurrentTenant();
    const now = new Date().toISOString();

    const nextSeq = String(tags.length + 1).padStart(3, '0');
    const tagNumber = `ETQ-${new Date().getFullYear()}-${nextSeq}`;

    const newTag: TpmTag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tenantId: currentTenant.id,
      tagNumber,
      machineId: data.machineId,
      machineName: data.machineName,
      machineCode: data.machineCode,
      sectorId: data.sectorId,
      sectorName: data.sectorName,
      type: data.type,
      category: data.category,
      priority: data.priority,
      description: data.description,
      openedBy: data.openedBy,
      openedAt: now,
      dueDate: data.dueDate,
      status: 'aberta',
      createdAt: now,
    };

    tags.unshift(newTag);
    setStoredData(STORAGE_KEYS.TPM_TAGS, tags);
    return newTag;
  },

  updateTpmTagStatus(
    id: string,
    status: TpmTag['status'],
    resolution?: { resolvedBy?: string; solutionNotes?: string; resolvedAt?: string }
  ): TpmTag {
    const tags = this.getTpmTags();
    const index = tags.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Etiqueta não encontrada');

    const tag = { ...tags[index], status };
    if (status === 'concluida') {
      tag.resolvedAt = resolution?.resolvedAt || new Date().toISOString();
      tag.resolvedBy = resolution?.resolvedBy || 'Equipe de Manutenção';
      tag.solutionNotes = resolution?.solutionNotes || tag.solutionNotes;
    }

    tags[index] = tag;
    setStoredData(STORAGE_KEYS.TPM_TAGS, tags);
    return tag;
  },

  deleteTpmTag(id: string): void {
    const tags = this.getTpmTags().filter((t) => t.id !== id);
    setStoredData(STORAGE_KEYS.TPM_TAGS, tags);
  },

  // --- Indicadores & KPIs da Manutenção ---
  getTpmMaintenanceMetrics(sectorId?: string): TpmMaintenanceMetrics {
    const machines = this.getTpmMachines(sectorId);
    const audits = this.getTpmAudits().filter((a) => !sectorId || sectorId === 'all' || a.sectorId === sectorId);

    const totalMachines = machines.length;
    const operationalMachines = machines.filter((m) => m.status === 'operacional').length;
    const inMaintenanceMachines = machines.filter((m) => m.status === 'em_manutencao').length;
    const stoppedMachines = machines.filter((m) => m.status === 'parada').length;
    const totalAudits = audits.length;

    const scoredMachines = machines.filter((m) => m.currentAuditScore > 0);
    const averageAuditScore =
      scoredMachines.length > 0
        ? Math.round(scoredMachines.reduce((acc, m) => acc + m.currentAuditScore, 0) / scoredMachines.length)
        : 0;

    const phase1Count = machines.filter((m) => (m.tpmPhase || 1) === 1).length;
    const phase2Count = machines.filter((m) => (m.tpmPhase || 1) === 2).length;
    const phase3Count = machines.filter((m) => (m.tpmPhase || 1) === 3).length;
    const phase4Count = machines.filter((m) => (m.tpmPhase || 1) >= 4).length;
    const goldSealMachinesCount = phase4Count;

    const criticalityACount = machines.filter((m) => m.criticality === 'A').length;
    const criticalityBCount = machines.filter((m) => m.criticality === 'B').length;
    const criticalityCCount = machines.filter((m) => m.criticality === 'C').length;

    return {
      totalMachines,
      operationalMachines,
      inMaintenanceMachines,
      stoppedMachines,
      totalAudits,
      averageAuditScore,
      goldSealMachinesCount,
      phase1Count,
      phase2Count,
      phase3Count,
      phase4Count,
      criticalityACount,
      criticalityBCount,
      criticalityCCount,
    };
  },

  // =========================================================================
  // ACADEMIA LEAN: ARTIGOS & GAMIFICAÇÃO
  // =========================================================================
  // =========================================================================
  // ACADEMIA LEAN: ARTIGOS & GESTÃO DINÂMICA
  // =========================================================================
  getArticles(): LeanArticleItem[] {
    return getStoredData<LeanArticleItem[]>(STORAGE_KEYS.LEAN_ARTICLES, INITIAL_LEAN_ARTICLES);
  },

  getArticleById(id: string): LeanArticleItem | undefined {
    return this.getArticles().find((a) => a.id === id);
  },

  createArticle(data: Omit<LeanArticleItem, 'id' | 'createdAt'>): LeanArticleItem {
    const articles = this.getArticles();
    const newArticle: LeanArticleItem = {
      ...data,
      id: generateId('art'),
      createdAt: new Date().toISOString(),
      isCustom: true,
      isNew: true,
    };
    articles.push(newArticle);
    setStoredData(STORAGE_KEYS.LEAN_ARTICLES, articles);
    return newArticle;
  },

  updateArticle(id: string, data: Partial<LeanArticleItem>): LeanArticleItem {
    const articles = this.getArticles();
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Artigo não encontrado');
    articles[index] = { ...articles[index], ...data };
    setStoredData(STORAGE_KEYS.LEAN_ARTICLES, articles);
    return articles[index];
  },

  getAgentReadArticles(agentId: string): string[] {
    const progressList = getStoredData<AgentArticleProgress[]>(STORAGE_KEYS.AGENT_ARTICLES, INITIAL_AGENT_ARTICLES);
    return progressList.filter((p) => p.agentId === agentId).map((p) => p.articleId);
  },

  getAgentValidatedArticles(agentId: string): string[] {
    const progressList = getStoredData<AgentArticleProgress[]>(STORAGE_KEYS.AGENT_ARTICLES, INITIAL_AGENT_ARTICLES);
    return progressList
      .filter((p) => p.agentId === agentId && p.isValidated)
      .map((p) => p.articleId);
  },

  markArticleAsRead(
    agentId: string,
    articleId: string,
    telemetry?: {
      timeSpentSeconds?: number;
      scrolledToBottom?: boolean;
      interactionsCount?: number;
      isValidated?: boolean;
    }
  ): void {
    const progressList = getStoredData<AgentArticleProgress[]>(STORAGE_KEYS.AGENT_ARTICLES, INITIAL_AGENT_ARTICLES);
    const existingIndex = progressList.findIndex((p) => p.agentId === agentId && p.articleId === articleId);

    const article = this.getArticleById(articleId);
    const minRequired = article?.minReadTimeSeconds || 120;

    const timeSpent = telemetry?.timeSpentSeconds ?? 45;
    const scrolled = telemetry?.scrolledToBottom ?? true;
    const interactions = telemetry?.interactionsCount ?? 3;
    // Regra do Master: rolagem confirmada, tempo >= minRequired (tempo do artigo) e tempo <= 15min (900s)
    const isValidated =
      telemetry?.isValidated !== undefined
        ? telemetry.isValidated
        : scrolled && timeSpent >= minRequired && timeSpent <= 900;

    const entry: AgentArticleProgress = {
      agentId,
      articleId,
      readAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
      scrolledToBottom: scrolled,
      interactionsCount: interactions,
      isValidated,
    };

    if (existingIndex >= 0) {
      progressList[existingIndex] = entry;
    } else {
      progressList.push(entry);
    }

    setStoredData(STORAGE_KEYS.AGENT_ARTICLES, progressList);
  },

  canAgentTakeExam(agentId: string): {
    canTake: boolean;
    readPercent: number;
    validatedPercent: number;
    validatedCount: number;
    totalArticles: number;
    requiredPercent: number;
    missingCount: number;
  } {
    const total = this.getArticles().length || 8;
    const validated = this.getAgentValidatedArticles(agentId).length;
    const reads = this.getAgentReadArticles(agentId).length;

    const readPercent = total > 0 ? Math.round((reads / total) * 100) : 0;
    const validatedPercent = total > 0 ? Math.round((validated / total) * 100) : 0;
    const requiredCount = Math.ceil(total * 0.95);
    const canTake = validatedPercent >= 95 || validated >= requiredCount;
    const missingCount = Math.max(0, requiredCount - validated);

    return {
      canTake,
      readPercent,
      validatedPercent,
      validatedCount: validated,
      totalArticles: total,
      requiredPercent: 95,
      missingCount,
    };
  },

  // =========================================================================
  // ACADEMIA LEAN: GERADOR DINÂMICO SENSEI DE 50 QUESTÕES BASEADAS NOS ARTIGOS
  // (50% DO GRUPO MENOR TEMPO / MENOS LIDOS + 50% DO GRUPO MAIOR TEMPO / MAIS LIDOS)
  // =========================================================================
  generateRandomBalancedExam(agentId: string, questionCount = 50): ExamQuestionSnapshot[] {
    const articles = this.getArticles();
    const progressList = getStoredData<AgentArticleProgress[]>(STORAGE_KEYS.AGENT_ARTICLES, INITIAL_AGENT_ARTICLES);
    const agentProgress = progressList.filter((p) => p.agentId === agentId);

    // 1. Calcular score de domínio (mastery) para cada artigo na plataforma
    const scoredArticles = articles.map((art) => {
      const prog = agentProgress.find((p) => p.articleId === art.id);
      const isVal = prog?.isValidated ? 50 : 0;
      const timeRatio = Math.min(50, ((prog?.timeSpentSeconds || 0) / (art.minReadTimeSeconds || 120)) * 50);
      const interactions = Math.min(10, (prog?.interactionsCount || 0) * 2);
      const score = isVal + timeRatio + interactions; // 0 a 110
      return { article: art, score };
    });

    // 2. Ordenar do menor score (menos lidos/menor tempo) para o maior (mais lidos)
    scoredArticles.sort((a, b) => a.score - b.score);

    const midIndex = Math.max(1, Math.floor(scoredArticles.length / 2));
    const lowMasteryArticles = scoredArticles.slice(0, midIndex).map((s) => s.article);
    const highMasteryArticles = scoredArticles.slice(midIndex).map((s) => s.article);

    const targetLowCount = Math.floor(questionCount / 2); // 25 questões (50%)
    const targetHighCount = questionCount - targetLowCount; // 25 questões (50%)

    // 3. Função do Sensei para sintetizar questões dinâmicas a partir do conteúdo do artigo
    const generateQuestionsFromArticle = (art: LeanArticleItem, countNeeded: number): ExamQuestionSnapshot[] => {
      const generated: ExamQuestionSnapshot[] = [];
      const content = art.content || ({} as any);
      const concepts = content.keyConcepts || [];
      const practices = content.bestPractices || [];
      const howTo = content.howToApply || [];
      const factoryEx = content.factoryExample || '';
      const intro = content.introduction || art.summary || '';
      const hint = content.quizHint || '';

      let seedIndex = 1;

      // Tipo A: Questões baseadas em Conceitos-Chave do Artigo
      concepts.forEach((concept: any, cIdx: number) => {
        if (generated.length >= countNeeded * 2) return;

        // Distratores dinâmicos plausíveis
        const wrongOpts = [
          'Apenas uma exigência burocrática para atender à auditoria ISO sem impacto na produtividade.',
          'Uma técnica que deve ser aplicada exclusivamente por consultores externos sem o operador.',
          'Um procedimento corretivo emergencial acionado apenas quando a linha de produção colapsa.',
          'Um método tradicional focado em aumentar estoques pulmão para compensar quebras de máquina.',
          'Uma diretriz contábil que não requer presença ou observação física no Gemba.',
        ];

        const correctOpt = `${concept.description}`;
        const allOpts = [correctOpt, ...wrongOpts.slice(0, 4)].sort(() => 0.5 - Math.random());
        const correctIdx = allOpts.indexOf(correctOpt);

        generated.push({
          id: seedIndex++,
          question: `De acordo com o artigo "${art.title}", qual é a definição e impacto prático de "${concept.title}" no chão de fábrica?`,
          category: art.category,
          articleId: art.id,
          articleTitle: art.title,
          options: allOpts as [string, string, string, string, string],
          correctOptionIndex: correctIdx,
          explanation: `Conforme ensinado no artigo "${art.title}": ${concept.title} é caracterizado por "${concept.description}".`,
        });
      });

      // Tipo B: Questões baseadas no Caso Prático de Fábrica (Factory Example)
      if (factoryEx && generated.length < countNeeded * 2) {
        const correctOpt = `Aplicar a melhoria no ponto de uso (Gemba) eliminando o desperdício na causa raiz, conforme exemplificado no artigo.`;
        const wrongOpts = [
          'Substituir toda a equipe de operadores por um turno extra remunerado.',
          'Comprar máquinas importadas de alto custo sem antes padronizar o método manual.',
          'Aumentar o estoque intermediário (WIP) para disfarçar a movimentação excessiva.',
          'Parar o processo e esperar uma decisão da alta diretoria antes de qualquer ação simples.',
        ];
        const allOpts = [correctOpt, ...wrongOpts].sort(() => 0.5 - Math.random());
        const correctIdx = allOpts.indexOf(correctOpt);

        generated.push({
          id: seedIndex++,
          question: `No caso prático de fábrica apresentado em "${art.title}", qual foi a diretriz Lean fundamental aplicada para gerar os resultados operacionais?`,
          category: art.category,
          articleId: art.id,
          articleTitle: art.title,
          options: allOpts as [string, string, string, string, string],
          correctOptionIndex: correctIdx,
          explanation: `No caso real citado no artigo: "${factoryEx}" demonstrando que pequenas melhorias de baixo custo no posto geram grande retorno financeiro.`,
        });
      }

      // Tipo C: Questões baseadas em Melhores Práticas & Métodos de Aplicação
      practices.forEach((practice: string, pIdx: number) => {
        if (generated.length >= countNeeded * 2) return;

        const correctOpt = practice;
        const wrongOpts = [
          'Apontar culpados individuais sempre que uma não conformidade ou atraso ocorrer.',
          'Ignorar as sugestões dos operadores e impor padrões decididos apenas em salas de reunião.',
          'Acelerar a velocidade das máquinas acima da capacidade de projeto para compensar paradas.',
          'Manter áreas de trabalho desorganizadas até o dia anterior à auditoria oficial.',
        ];
        const allOpts = [correctOpt, ...wrongOpts].sort(() => 0.5 - Math.random());
        const correctIdx = allOpts.indexOf(correctOpt);

        generated.push({
          id: seedIndex++,
          question: `Ao implementar as diretrizes de "${art.title}", qual destas ações representa uma Boa Prática Mandatória recomendada pelo Sensei?`,
          category: art.category,
          articleId: art.id,
          articleTitle: art.title,
          options: allOpts as [string, string, string, string, string],
          correctOptionIndex: correctIdx,
          explanation: `A boa prática oficial descrita no artigo estabelece que: "${practice}".`,
        });
      });

      // Tipo D: Questões baseadas nas Dicas do Quiz e Introdução Filosófica
      if (hint && generated.length < countNeeded * 2) {
        const correctOpt = hint;
        const wrongOpts = [
          'O foco do Lean é exclusivamente reduzir custos através de demissões.',
          'Qualidade é responsabilidade única e isolada do departamento de controle de qualidade.',
          'Trabalho padronizado impede a criatividade e deve ser evitado no chão de fábrica.',
          'Estabilidade básica é irrelevante para sistemas Just-in-Time.',
        ];
        const allOpts = [correctOpt, ...wrongOpts].sort(() => 0.5 - Math.random());
        const correctIdx = allOpts.indexOf(correctOpt);

        generated.push({
          id: seedIndex++,
          question: `Em relação aos fundamentos centrais abordados no artigo "${art.title}", qual premissa é mandatória para o sucesso do programa Lean?`,
          category: art.category,
          articleId: art.id,
          articleTitle: art.title,
          options: allOpts as [string, string, string, string, string],
          correctOptionIndex: correctIdx,
          explanation: `O Sensei enfatiza no artigo: "${hint}".`,
        });
      }

      return generated;
    };

    // 4. Coletar e sintetizar questões do Grupo 1 (Menor Tempo / Menos Lidos)
    const lowPool: ExamQuestionSnapshot[] = [];
    const questionsPerLowArticle = Math.max(3, Math.ceil(targetLowCount / Math.max(1, lowMasteryArticles.length)));
    lowMasteryArticles.forEach((art) => {
      const qs = generateQuestionsFromArticle(art, questionsPerLowArticle);
      lowPool.push(...qs);
    });

    // 5. Coletar e sintetizar questões do Grupo 2 (Maior Tempo / Mais Lidos)
    const highPool: ExamQuestionSnapshot[] = [];
    const questionsPerHighArticle = Math.max(3, Math.ceil(targetHighCount / Math.max(1, highMasteryArticles.length)));
    highMasteryArticles.forEach((art) => {
      const qs = generateQuestionsFromArticle(art, questionsPerHighArticle);
      highPool.push(...qs);
    });

    // 6. Complementar com banco clássico se o acervo de artigos for pequeno
    const fallbackQuestions: ExamQuestionSnapshot[] = LEAN_EXAM_QUESTIONS.map((q) => {
      const matched = articles.find((a) => (a.category as string) === (q.category as string) || a.title.includes(q.category.split(' ')[0])) || articles[0];
      return {
        id: q.id,
        question: q.question,
        category: q.category,
        articleId: matched?.id,
        articleTitle: matched?.title || q.category,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
      };
    });

    // Função de sorteio randômico sem repetição
    const pickRandom = (arr: ExamQuestionSnapshot[], n: number): ExamQuestionSnapshot[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const selectedLow = pickRandom(lowPool.length >= targetLowCount ? lowPool : [...lowPool, ...fallbackQuestions], targetLowCount);
    const selectedHigh = pickRandom(highPool.length >= targetHighCount ? highPool : [...highPool, ...fallbackQuestions], targetHighCount);

    // 7. Unir as 25 questões de Menor Tempo com as 25 questões de Maior Tempo
    const combined = [...selectedLow, ...selectedHigh].sort(() => 0.5 - Math.random());

    // 8. Re-indexar IDs de 1 a 50 com unicidade total
    return combined.slice(0, questionCount).map((q, index) => ({
      ...q,
      id: index + 1,
    }));
  },

  // =========================================================================
  // ACADEMIA LEAN: PROVAS DE CERTIFICAÇÃO, REGRA ANTI-CHUTE & RETROCESSO A 50%
  // =========================================================================
  getAgentExams(agentId: string): AgentExamResult[] {
    const exams = getStoredData<AgentExamResult[]>(STORAGE_KEYS.AGENT_EXAMS, INITIAL_AGENT_EXAMS);
    return exams.filter((e) => e.agentId === agentId).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  },

  getAgentLatestExam(agentId: string): AgentExamResult | undefined {
    const exams = getStoredData<AgentExamResult[]>(STORAGE_KEYS.AGENT_EXAMS, INITIAL_AGENT_EXAMS);
    const agentExams = exams.filter((e) => e.agentId === agentId);
    if (agentExams.length === 0) return undefined;
    return agentExams.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];
  },

  saveAgentExamResult(params: {
    agentId: string;
    agentName?: string;
    answers: Record<number, number>;
    questionsSnapshot?: ExamQuestionSnapshot[];
    durationSeconds?: number;
  }): AgentExamResult {
    const exams = getStoredData<AgentExamResult[]>(STORAGE_KEYS.AGENT_EXAMS, INITIAL_AGENT_EXAMS);
    const questions = params.questionsSnapshot || [];
    const totalQuestions = questions.length || 10;

    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;

    const evaluatedQuestions: ExamQuestionSnapshot[] = questions.map((q) => {
      const selected = params.answers[q.id];
      if (selected === undefined || selected === -1) {
        blankCount++;
        return {
          ...q,
          selectedOptionIndex: undefined,
          isCorrect: undefined,
        };
      }
      if (selected === q.correctOptionIndex) {
        correctCount++;
        return {
          ...q,
          selectedOptionIndex: selected,
          isCorrect: true,
        };
      }
      wrongCount++;
      return {
        ...q,
        selectedOptionIndex: selected,
        isCorrect: false,
      };
    });

    // REGRA ANTI-CHUTE (CESPE): Cada errada anula 1 certa!
    // Pontos Líquidos = Max(0, Acertos - Erros)
    const netScore = Math.max(0, correctCount - wrongCount);
    const calculatedScore = Number(((netScore / totalQuestions) * 10).toFixed(1));
    const isPassed = calculatedScore >= 8.0; // Nota de corte: 8.0

    const newEntry: AgentExamResult = {
      id: generateId('exam'),
      agentId: params.agentId,
      agentName: params.agentName,
      completedAt: new Date().toISOString(),
      correctCount,
      wrongCount,
      blankCount,
      totalQuestions,
      netScore,
      score: calculatedScore,
      passed: isPassed,
      durationSeconds: params.durationSeconds,
      answers: params.answers,
      questionsSnapshot: evaluatedQuestions,
      feedbackSummary: isPassed
        ? `🏆 Parabéns! Você atingiu ${calculatedScore.toFixed(1)}/10.0 com ${correctCount} acerto(s), ${wrongCount} erro(s) e ${blankCount} em branco. Conquistou o Selo de Agente Qualificado!`
        : `⚠️ Nota ${calculatedScore.toFixed(1)}/10.0 insuficiente para qualificação (mínimo 8.0). Devido à regra anti-chute (${wrongCount} erro(s) anularam ${wrongCount} acerto(s)), seu percentual de capacitação retrocedeu para 50%. Reestude os artigos até 95% para tentar novamente.`,
      rewardClaimed: false,
    };

    exams.push(newEntry);
    setStoredData(STORAGE_KEYS.AGENT_EXAMS, exams);

    // =========================================================================
    // SE REPROVADO: APLICAR RETROCESSO PARA 50%
    // =========================================================================
    if (!isPassed) {
      const totalArticles = this.getArticles().length || 8;
      const targetAllowedValidated = Math.max(1, Math.floor(totalArticles * 0.5)); // 50%

      const progressList = getStoredData<AgentArticleProgress[]>(STORAGE_KEYS.AGENT_ARTICLES, INITIAL_AGENT_ARTICLES);
      let agentValidatedCount = 0;

      const updatedProgress = progressList.map((p) => {
        if (p.agentId === params.agentId && p.isValidated) {
          agentValidatedCount++;
          if (agentValidatedCount > targetAllowedValidated) {
            // Retrocede este artigo: remove a validação
            return { ...p, isValidated: false };
          }
        }
        return p;
      });

      setStoredData(STORAGE_KEYS.AGENT_ARTICLES, updatedProgress);
    }

    return newEntry;
  },

  toggleExamRewardClaimed(examId: string, claimed: boolean): void {
    const exams = getStoredData<AgentExamResult[]>(STORAGE_KEYS.AGENT_EXAMS, INITIAL_AGENT_EXAMS);
    const updated = exams.map((e) =>
      e.id === examId
        ? { ...e, rewardClaimed: claimed, rewardClaimedAt: claimed ? new Date().toISOString() : undefined }
        : e
    );
    setStoredData(STORAGE_KEYS.AGENT_EXAMS, updated);
  },

  // =========================================================================
  // SIMULAÇÃO COMPLETA: APROVAÇÃO, REPROVAÇÃO & RETROCESSO EM TEMPO REAL
  // =========================================================================
  simulateApproveAgent(agentId: string, agentName?: string): AgentExamResult {
    const articles = this.getArticles();
    const progressList = getStoredData<AgentArticleProgress[]>(STORAGE_KEYS.AGENT_ARTICLES, INITIAL_AGENT_ARTICLES);
    const otherProgress = progressList.filter((p) => p.agentId !== agentId);

    // 1. Simula leitura ativa de 100% dos artigos com telemetria validada
    const newProgress: AgentArticleProgress[] = articles.map((art, idx) => ({
      agentId,
      articleId: art.id,
      readAt: new Date(Date.now() - (8 - idx) * 86400000).toISOString(),
      timeSpentSeconds: (art.minReadTimeSeconds || 120) + 60,
      scrolledToBottom: true,
      interactionsCount: 6,
      isValidated: true,
    }));

    setStoredData(STORAGE_KEYS.AGENT_ARTICLES, [...otherProgress, ...newProgress]);

    // 2. Gera a prova randômica balanceada 50/50 com 50 questões dinâmicas
    const questions = this.generateRandomBalancedExam(agentId, 50);
    const answers: Record<number, number> = {};

    // 45 Acertos (+45), 0 Erros (0), 5 em branco (0) -> Líquido: 45 / 50 -> Nota 9.0 (Aprovada)
    questions.forEach((q, idx) => {
      if (idx < 45) {
        answers[q.id] = q.correctOptionIndex; // Acerto (+1)
      } else {
        answers[q.id] = -1; // Deixada estrategicamente em branco (0)
      }
    });

    // 3. Salva o resultado oficial com Nota 9.0 e Selo de Agente Qualificado
    const result = this.saveAgentExamResult({
      agentId,
      agentName: agentName || 'Agente Lean',
      answers,
      questionsSnapshot: questions,
      durationSeconds: 1650,
    });

    // Marca recompensa como entregue
    this.toggleExamRewardClaimed(result.id, true);

    return result;
  },

  simulateFailAgent(agentId: string, agentName?: string): AgentExamResult {
    const questions = this.generateRandomBalancedExam(agentId, 50);
    const answers: Record<number, number> = {};

    // 25 Acertos (+25), 25 Erros (-25) -> Líquido = Max(0, 25 - 25) = 0 pontos -> Nota 0.0 (Reprovado com retrocesso a 50%)
    questions.forEach((q, idx) => {
      if (idx < 25) {
        answers[q.id] = q.correctOptionIndex; // Acerto
      } else {
        const wrongOpt = (q.correctOptionIndex + 1) % 5;
        answers[q.id] = wrongOpt; // Erro (-1)
      }
    });

    return this.saveAgentExamResult({
      agentId,
      agentName: agentName || 'Agente Lean',
      answers,
      questionsSnapshot: questions,
      durationSeconds: 480,
    });
  },

  getAllAgentsLearningRanking(tenantId?: string): AgentLearningRanking[] {
    const users = this.getUsers(tenantId).filter((u) => u.role === 'agent');
    const totalArticles = this.getArticles().length || 8;

    return users.map((agent) => {
      const readArticles = this.getAgentReadArticles(agent.id);
      const validatedArticles = this.getAgentValidatedArticles(agent.id);
      const agentExams = this.getAgentExams(agent.id);
      const latestExam = agentExams[0];
      const passedExam = Boolean(latestExam?.passed);
      const rewardClaimed = Boolean(latestExam?.rewardClaimed);

      const articlesReadPercent = totalArticles > 0 ? Math.round((readArticles.length / totalArticles) * 100) : 0;
      const validatedArticlesReadPercent = totalArticles > 0 ? Math.round((validatedArticles.length / totalArticles) * 100) : 0;
      const canTakeExam = validatedArticlesReadPercent >= 95 || validatedArticles.length >= Math.ceil(totalArticles * 0.95);

      return {
        agentId: agent.id,
        agentName: agent.name,
        agentEmail: agent.email,
        agentAvatar: agent.avatarUrl,
        articlesReadCount: readArticles.length,
        validatedArticlesReadCount: validatedArticles.length,
        articlesReadPercent,
        validatedArticlesReadPercent,
        totalArticlesCount: totalArticles,
        canTakeExam,
        isQualified: passedExam,
        qualificationDate: passedExam ? latestExam?.completedAt : undefined,
        attemptsCount: agentExams.length,
        latestExam,
        passedExam,
        rewardClaimed,
      };
    }).sort((a, b) => {
      if (a.isQualified !== b.isQualified) return a.isQualified ? -1 : 1;
      const scoreA = a.latestExam?.score || 0;
      const scoreB = b.latestExam?.score || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return b.validatedArticlesReadPercent - a.validatedArticlesReadPercent;
    });
  },

  // =========================================================================
  // MÓDULO LEAN ASSESSMENT DOS SETORES
  // =========================================================================
  getSectorAssessments(sectorId?: string): SectorLeanAssessment[] {
    const all = getStoredData<SectorLeanAssessment[]>(
      STORAGE_KEYS.SECTOR_ASSESSMENTS,
      INITIAL_SECTOR_ASSESSMENTS
    );
    const filtered = sectorId ? all.filter((a) => a.sectorId === sectorId) : all;
    return filtered.sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
  },

  getLatestSectorAssessment(sectorId: string): SectorLeanAssessment | undefined {
    const list = this.getSectorAssessments(sectorId);
    return list.length > 0 ? list[0] : undefined;
  },

  getPreviousSectorAssessment(sectorId: string, currentAssessmentId?: string): SectorLeanAssessment | undefined {
    const list = this.getSectorAssessments(sectorId);
    if (list.length < 2) return undefined;
    if (currentAssessmentId) {
      const idx = list.findIndex((a) => a.id === currentAssessmentId);
      if (idx >= 0 && idx + 1 < list.length) {
        return list[idx + 1];
      }
    }
    return list[1];
  },

  getSectorEvolutionComparison(
    sectorId: string,
    currentId?: string,
    compareWithId?: string
  ): SectorEvolutionComparison | null {
    const history = this.getSectorAssessments(sectorId);
    if (history.length === 0) return null;

    const current = currentId ? history.find((a) => a.id === currentId) || history[0] : history[0];
    let previous: SectorLeanAssessment | undefined = undefined;

    if (compareWithId) {
      previous = history.find((a) => a.id === compareWithId);
    } else {
      previous = this.getPreviousSectorAssessment(sectorId, current.id);
    }

    const overallDelta = previous ? current.overallScore - previous.overallScore : 0;
    const overallTrend: 'up' | 'stable' | 'down' =
      overallDelta > 1 ? 'up' : overallDelta < -1 ? 'down' : 'stable';

    const dimensionKeys: { id: LeanAssessmentDimensionId; name: string }[] = [
      { id: 'estabilidade_5s', name: 'Estabilidade Básica & 5S' },
      { id: 'trabalho_padronizado', name: 'Trabalho Padronizado' },
      { id: 'fluxo_jit', name: 'Fluxo Contínuo & JIT' },
      { id: 'qualidade_poka_yoke', name: 'Qualidade & Poka-Yoke' },
      { id: 'tpm_oee', name: 'TPM & Confiabilidade' },
      { id: 'cultura_kaizen', name: 'Cultura Kaizen & Pessoas' },
    ];

    const dimensionsMetrics: DimensionEvolutionMetric[] = dimensionKeys.map((dim) => {
      const currentScore = current.dimensions[dim.id] || 0;
      const previousScore = previous ? previous.dimensions[dim.id] : undefined;
      const delta = previousScore !== undefined ? currentScore - previousScore : 0;
      const trend: 'up' | 'stable' | 'down' = delta > 1 ? 'up' : delta < -1 ? 'down' : 'stable';

      return {
        dimensionId: dim.id,
        dimensionName: dim.name,
        currentScore,
        previousScore,
        delta,
        trend,
      };
    });

    return {
      sectorId,
      currentAssessment: current,
      previousAssessment: previous,
      overallDelta,
      overallTrend,
      dimensionsMetrics,
      assessmentsHistory: history.map((h) => ({
        id: h.id,
        assessmentDate: h.assessmentDate,
        overallScore: h.overallScore,
        evaluatorName: h.evaluatorName,
      })),
    };
  },

  saveSectorAssessment(assessmentData: Omit<SectorLeanAssessment, 'id' | 'createdAt'>): SectorLeanAssessment {
    const list = getStoredData<SectorLeanAssessment[]>(
      STORAGE_KEYS.SECTOR_ASSESSMENTS,
      INITIAL_SECTOR_ASSESSMENTS
    );
    const newEntry: SectorLeanAssessment = {
      ...assessmentData,
      id: generateId('asm'),
      createdAt: new Date().toISOString(),
    };

    list.unshift(newEntry);
    setStoredData(STORAGE_KEYS.SECTOR_ASSESSMENTS, list);
    return newEntry;
  },

  deleteSectorAssessment(id: string): void {
    const list = getStoredData<SectorLeanAssessment[]>(
      STORAGE_KEYS.SECTOR_ASSESSMENTS,
      INITIAL_SECTOR_ASSESSMENTS
    );
    const updated = list.filter((a) => a.id !== id);
    setStoredData(STORAGE_KEYS.SECTOR_ASSESSMENTS, updated);
  },

  getDefaultLeanAssessmentDimensions(): LeanAssessmentDimension[] {
    return [
      {
        id: 'estabilidade_5s',
        name: 'Estabilidade Básica, 5S & Gestão Visual',
        shortName: '5S & Visual',
        description: 'Postos organizados no ponto de uso (<2m), descarte de obsoletos, rotina de limpeza inspecional e gestão à vista SQCDP.',
        score: 60,
        level: 3,
        criteria: [
          {
            id: '5s_c1',
            dimensionId: 'estabilidade_5s',
            title: 'Seiri — Descarte & Segregação de Obsoletos no Posto',
            description: 'Apenas ferramentas, peças e insumos estritamente necessários na bancada; área de descarte e segregação de 5S em pleno funcionamento.',
            gembaVerificationGuide: 'Verificar se há ferramentas danificadas ou peças obsoletas na bancada e se a área de segregação/quarentena está demarcada e ativa.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Estão apenas as ferramentas adequadas, equipamentos, peças e documentos disponíveis na área.',
              'Existem áreas disponíveis de segregação de 5S que estão de acordo com o processo.',
              'Corredores e passagens estão completamente desobstruídos de materiais e paletes.',
            ],
          },
          {
            id: '5s_c2',
            dimensionId: 'estabilidade_5s',
            title: 'Seiton — Ponto de Uso & Demarcação Ergonômica',
            description: 'Todas as ferramentas, equipamentos, gabaritos e peças alocados no seu devido lugar com demarcações e painéis sombra a <2m.',
            gembaVerificationGuide: 'Observar se o operador alcança qualquer ferramenta essencial sem dar mais de 2 passos e se cada item tem seu contorno visual.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Todas as ferramentas, equipamentos, gabaritos, documentação e peças estão no seu devido lugar.',
              'Toda a demarcação de piso para paletes, lixeiras e carrinhos está padronizada e visível.',
              'Itens de uso frequente posicionados no raio de alcance ergonômico ideal do operador.',
            ],
          },
          {
            id: '5s_c3',
            dimensionId: 'estabilidade_5s',
            title: 'Seiso — Limpeza com Foco em Inspeção Mecânica Ativa',
            description: 'Programação de limpeza periódica executada com padrões visuais que expõem vazamentos de óleo, folgas e sujeira na origem.',
            gembaVerificationGuide: 'Inspecionar sob o canhão da extrusora, cabeçotes e bandejas inferiores. Verificar se a limpeza é usada para diagnosticar folgas ou trincas.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Existe uma programação e rotina de limpeza na área executada pelos operadores.',
              'Há padrões de limpeza visuais e descritivos disponíveis e compreendidos no posto.',
              'A limpeza elimina fontes crônicas de sujeira, óleo e pó na origem do maquinário.',
            ],
          },
          {
            id: '5s_c4',
            dimensionId: 'estabilidade_5s',
            title: 'Seiketsu & Shitsuke — Auditorias Escalonadas & Gemba Walk',
            description: 'Supervisores e gerentes realizam Gemba Walks regulares com planos de ação documentados e equipe capacitada no propósito do 5S.',
            gembaVerificationGuide: 'Checar o quadro de auditorias 5S da célula e constatar se as não-conformidades da última rodada foram tratadas no prazo.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Supervisores e gerentes realizam auditorias regulares (Gemba Walk) com plano de ação evidente.',
              'Todos os funcionários têm conhecimento, formação de sensibilização e aplicam o 5S no dia a dia.',
              'Fichas de auditoria de 5S claramente disponíveis, atualizadas e com notas visíveis.',
            ],
          },
          {
            id: '5s_c5',
            dimensionId: 'estabilidade_5s',
            title: 'Gestão Visual de Piso & Detecção Imediata de Desvios',
            description: 'Sinalizações e controles visuais que tornam desvios de processo e anormalidades evidentes em menos de 10 segundos.',
            gembaVerificationGuide: 'Olhar para o posto a 5 metros de distância: deve ser imediatamente perceptível se a linha está parada, em ritmo normal ou com desvio.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Existem marcações visuais evidentes (cores, faixas, kanban) para manter produtividade e qualidade.',
              'Desvios dos padrões estabelecidos são identificados visualmente e rapidamente por qualquer pessoa.',
              'Existe quadro de controle visual para questões frequentes não-padronizadas que são rastreadas.',
            ],
          },
          {
            id: '5s_c6',
            dimensionId: 'estabilidade_5s',
            title: 'Quadro de Gestão à Vista da Célula (SQCDP)',
            description: 'Quadros de indicadores atualizados por turno (Segurança, Qualidade, Entrega, Custo e Pessoas) para direcionar melhorias contínuas.',
            gembaVerificationGuide: 'Checar o quadro de produção hora a hora da célula: verificar se as medições das últimas 2 horas foram registradas pelo operador.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Existem quadros visuais na área onde são informadas as métricas de segurança, qualidade e produção.',
              'A padronização das atividades e metas da produção estão visíveis no campo de trabalho.',
              'Os dados dos KPIs atualizados são utilizados em reuniões rápidas para direcionar a melhoria contínua.',
            ],
          },
        ],
      },
      {
        id: 'trabalho_padronizado',
        name: 'Trabalho Padronizado, POPs & TWI',
        shortName: 'Trabalho Padronizado',
        description: 'Instruções visuais nos postos, repetibilidade de ciclo, balanceamento de linha e capacitação estruturada TWI.',
        score: 60,
        level: 3,
        criteria: [
          {
            id: 'tp_c1',
            dimensionId: 'trabalho_padronizado',
            title: 'Disponibilidade e Clareza Visual dos POPs',
            description: 'Todos os processos com intervenção do operador padronizados com Folhas de Trabalho Padrão contendo fotos reais e pontos críticos.',
            gembaVerificationGuide: 'Verificar se o POP fixado no posto é visual, se foi elaborado com participação dos operadores e se detalha segurança, qualidade e técnica.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Todos os processos que exigem intervenção do operador possuem folhas de trabalho padronizado.',
              'O Trabalho Padronizado é apoiado por Folhas com fotos reais para segurança, qualidade e técnica.',
              'Documentação padronizada criada pelos membros da equipe com apoio e orientação da liderança.',
            ],
          },
          {
            id: 'tp_c2',
            dimensionId: 'trabalho_padronizado',
            title: 'Separação de Valor Agregado vs. Desperdícios de Movimento',
            description: 'Etapas de valor agregado e desperdícios (esperas, caminhadas, ajustes manuais) identificados e minimizados no posto.',
            gembaVerificationGuide: 'Observar 3 ciclos completos do operador: verificar se o trabalho foi projetado para cortar movimentações e manipulações extras.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Etapas de valor agregado e que não agregam valor são identificadas na documentação do Trabalho Padrão.',
              'Desperdícios de espera, transporte e movimentos desnecessários são eliminados do ciclo.',
              'Posto projetado com base na economia de movimentos e ergonomia dos operadores.',
            ],
          },
          {
            id: 'tp_c3',
            dimensionId: 'trabalho_padronizado',
            title: 'Tempo de Ciclo Padrão vs. Takt Time da Fábrica',
            description: 'Tempo de ciclo mapeado, cronometrado e balanceado com o Takt Time da demanda; revisado periodicamente pelo PCP.',
            gembaVerificationGuide: 'Comparar o tempo de ciclo real da máquina/operador com a meta de Takt Time do planejamento de produção.',
            weight: 3,
            score: 3,
            checkpoints: [
              'A meta do tempo de ciclo do processo está formalmente identificada na tabela de Trabalho Padrão.',
              'O Takt Time é revisado periodicamente pelo PCP e comunicado com clareza à produção.',
              'Quando o Takt Time muda, o Trabalho Padrão é revisado e a equipe rebalanceada.',
            ],
          },
          {
            id: 'tp_c4',
            dimensionId: 'trabalho_padronizado',
            title: 'Nivelamento do Trabalho & Balanceamento entre Postos',
            description: 'Carga de trabalho equilibrada entre os postos da célula, evitando gargalos transitórios ou operadores sobrecarregados.',
            gembaVerificationGuide: 'Checar o gráfico de balanceamento de operadores da célula: verificar se as barras de tempo de ciclo estão niveladas abaixo do Takt Time.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Existe gráfico de balanceamento do trabalho afixado na célula demonstrando o equilíbrio entre postos.',
              'Níveis mínimo e máximo de estoques intermediários (WIP) são recalculados nas alterações de Takt.',
              'Operações de apoio e tarefas secundárias não interrompem o fluxo do posto principal.',
            ],
          },
          {
            id: 'tp_c5',
            dimensionId: 'trabalho_padronizado',
            title: 'Treinamento Estruturado no Método TWI (Job Instruction)',
            description: 'Treinamento prático de recém-chegados e substitutos executado por líderes no posto até comprovação de competência técnica.',
            gembaVerificationGuide: 'Perguntar ao operador mais novo da célula como ele foi treinado e verificar se há registro formal do método TWI na matriz de habilidades.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Treinamento de todos os recém-chegados é realizado usando o Trabalho Padrão estruturado (TWI).',
              'Operador só assume operação solo após atingir o nível necessário de competência e qualidade.',
              'Testes de produção e novos padrões são desenvolvidos em conjunto com operadores experientes.',
            ],
          },
          {
            id: 'tp_c6',
            dimensionId: 'trabalho_padronizado',
            title: 'Auditoria Escalonada do Cumprimento do Padrão (LPA)',
            description: 'Auditorias regulares de processo realizadas pela liderança para certificar que os procedimentos são respeitados na prática.',
            gembaVerificationGuide: 'Verificar registros de auditoria escalonada da liderança e como anomalias de cumprimento de método são corrigidas no Gemba.',
            weight: 2,
            score: 3,
            checkpoints: [
              'São realizadas auditorias frequentes para verificar se os padrões estabelecidos estão sendo cumpridos.',
              'O desempenho da produção e desvios de ritmo são monitorados ativamente pela gestão.',
              'Os dados de desvios operacionais são utilizados pela liderança para identificar e eliminar causas raízes.',
            ],
          },
        ],
      },
      {
        id: 'fluxo_jit',
        name: 'Fluxo Contínuo, JIT & Gestão de Estoques',
        shortName: 'Fluxo & Kanban',
        description: 'Redução de WIP, troca rápida SMED, sinalização puxada Kanban, janelas de abastecimento e disciplina FIFO.',
        score: 60,
        level: 3,
        criteria: [
          {
            id: 'jit_c1',
            dimensionId: 'fluxo_jit',
            title: 'Metodologia SMED (Troca Rápida de Ferramental e Matriz)',
            description: 'Metodologia de troca rápida utilizada sistematicamente para converter setup interno em externo e reduzir tempos de parada.',
            gembaVerificationGuide: 'Acompanhar o setup de uma máquina: verificar se ferramentas e matrizes foram pré-aquecidas e posicionadas antes do desligamento.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Os tempos de troca são monitorados produto a produto pela equipe operacional e gestão.',
              'A metodologia SMED é utilizada para reduzir sistematicamente os tempos de troca de produto.',
              'Atividades de preparação externa são realizadas com o equipamento ainda em produção.',
            ],
          },
          {
            id: 'jit_c2',
            dimensionId: 'fluxo_jit',
            title: 'Padronização de Setup & Redução do Tamanho dos Lotes',
            description: 'Processo de troca documentado em folhas padrão, equipe capacitada e ganhos de tempo convertidos em lotes menores.',
            gembaVerificationGuide: 'Verificar se o ganho de tempo de setup foi aproveitado para diminuir a quantidade de peças por lote e aumentar a flexibilidade.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Toda a equipe de setup foi treinada e está capacitada para executar a troca no tempo padrão.',
              'O processo de troca está documentado com Folhas de Trabalho Padrão e recursos visuais.',
              'A gestão avalia as melhorias de troca para reduzir o tamanho dos lotes e o Lead Time.',
            ],
          },
          {
            id: 'jit_c3',
            dimensionId: 'fluxo_jit',
            title: 'Controle de Níveis Mínimo e Máximo no Ponto de Uso',
            description: 'Limites visuais claros de peças, bobinas e insumos no posto de trabalho para evitar estoque desnecessário e sobrecarga.',
            gembaVerificationGuide: 'Checar as posições de estoque de borda de linha: verificar se há demarcação de mínimo e máximo e se os limites são respeitados.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Níveis mínimos e máximos estão claramente identificados para o material em processo no ponto de uso.',
              'Tamanhos de lotes e quantidades intermediárias alinhados para evitar estoques ocultos.',
              'Espaço delimitado (bordo de linha) com processos de exceção para gerir variâncias.',
            ],
          },
          {
            id: 'jit_c4',
            dimensionId: 'fluxo_jit',
            title: 'Sinalização Puxada (Cartões Kanban, Gaiolas & Caixas)',
            description: 'Produção e abastecimento acionados exclusivamente pelo consumo do processo cliente, via cartões Kanban ou embalagens padronizadas.',
            gembaVerificationGuide: 'Verificar se há peças sendo produzidas sem cartão Kanban correspondente ou sem sinalização de puxada da etapa posterior.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Sistemas de controle (cartões kanban, gaiolas, demarcações) operam no local para reposição.',
              'A produção é puxada a partir da necessidade real do processo seguinte ou da demanda do cliente.',
              'Fluxo sincronizado de materiais em toda a cadeia interna de abastecimento.',
            ],
          },
          {
            id: 'jit_c5',
            dimensionId: 'fluxo_jit',
            title: 'Janelas de Abastecimento Sincronizado (Logística Interna)',
            description: 'Frequência, rotas e janelas de tempo determinadas para entrega e recolhimento de materiais, tubetes e bobinas.',
            gembaVerificationGuide: 'Checar o horário e a disciplina do abastecedor (water strider): materiais devem chegar no momento certo sem paradas de linha.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Existe frequência e período determinado para entrega e recolhimento de gaiolas, bobinas e insumos.',
              'Janela de tempo rigorosa para coleta e entrega de materiais nos postos produtivos.',
              'Processos de transporte e movimentação interna são cobertos por Trabalho Padronizado.',
            ],
          },
          {
            id: 'jit_c6',
            dimensionId: 'fluxo_jit',
            title: 'Layout Celular & Fluxo Sequencial em Pequenos Lotes',
            description: 'Disposição física de máquinas em células ou linhas contínuas que eliminam longos transportes e promovem lotação flexível.',
            gembaVerificationGuide: 'Analisar o caminho percorrido pela peça: verificar se o layout é compacto, seguro e permite resposta imediata a problemas.',
            weight: 2,
            score: 3,
            checkpoints: [
              'O layout promove o fluxo contínuo de produtos e a produção em pequenos lotes.',
              'Máquinas dispostas em layout celular compacto promovendo lotação flexível da equipe.',
              'Disposição física permite facilidade de manutenção, reposição ágil de peças e ergonomia.',
            ],
          },
          {
            id: 'jit_c7',
            dimensionId: 'fluxo_jit',
            title: 'Disciplina de Fila FIFO & Estabilidade de Matéria-Prima',
            description: 'Pulmões intermediários operam estritamente no princípio FIFO (First-In, First-Out), sem risco de desabastecimento de MP.',
            gembaVerificationGuide: 'Checar os trilhos gravitacionais ou esteiras: verificar se a primeira peça produzida é fisicamente a primeira consumida.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Todos os pulmões intermediários e linhas de ligação aplicam rigorosamente o sistema FIFO.',
              'Produção segue um fluxo contínuo sem interrupções por falta imprevista de matéria-prima.',
              'Processo é flexível para absorver alterações de programação sem gerar acúmulo de refugos.',
            ],
          },
        ],
      },
      {
        id: 'qualidade_poka_yoke',
        name: 'Qualidade na Origem, Jidoka & Poka-Yoke',
        shortName: 'Qualidade & Poka-Yoke',
        description: 'Dispositivos físicos à prova de erro, sistema Andon com parada de linha, cadeia de ajuda imediata e cultura de autocontrole.',
        score: 60,
        level: 3,
        criteria: [
          {
            id: 'q_c1',
            dimensionId: 'qualidade_poka_yoke',
            title: 'Sistema Andon de Alerta & Parada de Linha',
            description: 'Botões ou cordões Andon acessíveis aos operadores e alarmes visuais/sonoros que sinalizam anomalias instantaneamente.',
            gembaVerificationGuide: 'Testar o botão/cordão Andon do posto: verificar se a torre luminosa acende e se o sinal sonoro é audível na célula.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Botões ou cordões Andon localizados junto aos operadores de produção em todas as estações.',
              'Sinais visuais e/ou sonoros atribuídos a cada máquina/grupo indicando o status operacional.',
              'Sistema de detecção automática que para o maquinário na ocorrência de desvios críticos.',
            ],
          },
          {
            id: 'q_c2',
            dimensionId: 'qualidade_poka_yoke',
            title: 'Cadeia de Ajuda Imediata (Tempo de Resposta < 3 min)',
            description: 'Estrutura de suporte técnico (líder, manutenção, qualidade) treinada para comparecer e conter a anomalia rapidamente.',
            gembaVerificationGuide: 'Perguntar ao operador o que acontece ao acionar o Andon: quem responde, em quantos minutos e qual a contramedida imediata.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Cadeia de ajuda clara e estruturada: o operador sabe exatamente quem é o seu apoio imediato.',
              'Membros de suporte dedicados respondem e avaliam os problemas no Gemba em tempo hábil (<3 min).',
              'Histórico de acionamentos Andon revisado pela gestão para eliminar gargalos crônicos.',
            ],
          },
          {
            id: 'q_c3',
            dimensionId: 'qualidade_poka_yoke',
            title: 'Dispositivos Poka-Yoke Físicos & Sensores no Posto',
            description: 'Travas mecânicas, gabaritos "passa-não-passa", fotocélulas e sensores que impedem fisicamente defeitos ou montagem invertida.',
            gembaVerificationGuide: 'Inspecionar o dispositivo Poka-Yoke instalado na máquina e verificar se a peça incorreta é bloqueada sem intervenção humana.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Equipes comprovam dispositivos Poka-Yoke implementados em equipamentos, ferramentas e postos.',
              'Sensores, fotocélulas e pontos fixos de indicação de anomalias incorporados à linha de produção.',
              'Esforço ativo para implementar travas que eliminem defeitos na causa raiz ao invés de apenas inspecionar.',
            ],
          },
          {
            id: 'q_c4',
            dimensionId: 'qualidade_poka_yoke',
            title: 'Verificação & Teste de Eficácia dos Poka-Yokes',
            description: 'Rotina formal de checagem no início de turno (peça-padrão de teste) para assegurar que sensores e travas estão 100% funcionais.',
            gembaVerificationGuide: 'Verificar a folha de teste diário do Poka-Yoke e presenciar a simulação de falha com uma peça padrão não-conforme.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Dispositivos Poka-Yoke são testados e verificados formalmente no início de cada turno.',
              'Existe peça-padrão ("peça vermelha") utilizada para comprovar a atuação do dispositivo de bloqueio.',
              'Equipes de manutenção e qualidade dão suporte imediato na calibração de qualquer Poka-Yoke com falha.',
            ],
          },
          {
            id: 'q_c5',
            dimensionId: 'qualidade_poka_yoke',
            title: 'Princípio do Autocontrole (Zero Defeitos Repassados)',
            description: 'O operador não aceita defeitos do processo anterior, não produz desvios e não repassa não-conformidades para a etapa seguinte.',
            gembaVerificationGuide: 'Verificar se os instrumentos de medição ou gabaritos de bancada são utilizados pelo operador e se há peças retrabalhadas sem identificação.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Operador realiza inspeção de autocontrole antes de liberar o item para o próximo processo.',
              'Parâmetros de qualidade são totalmente compreendidos e associados à capacidade da máquina.',
              'Cultura consolidada: "Não Aceito defeito, Não Fabrico defeito, Não Repasso defeito".',
            ],
          },
          {
            id: 'q_c6',
            dimensionId: 'qualidade_poka_yoke',
            title: 'Análise de Falhas de Qualidade & Replicação (Yokoten)',
            description: 'Não-conformidades geram relatórios de causa raiz e soluções implementadas são replicadas para outras máquinas da fábrica.',
            gembaVerificationGuide: 'Analisar o último relatório de refugo: verificar se o Poka-Yoke criado para a máquina piloto foi estendido às demais linhas.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Dados de refugos e alertas Andon utilizados pela equipe para identificar e atacar a causa raiz.',
              'Áreas de apoio (manutenção e engenharia) utilizam feedback da produção para melhorias definitivas.',
              'Yokoten praticado: melhorias contra defeitos replicadas para equipamentos e células similares.',
            ],
          },
        ],
      },
      {
        id: 'tpm_oee',
        name: 'Manutenção Produtiva Total (TPM) & OEE',
        shortName: 'TPM & OEE',
        description: 'Manutenção autônoma pelo operador (LIP), gestão visual de etiquetas, manutenção preventiva, MTBF/MTTR e controle do OEE.',
        score: 60,
        level: 3,
        criteria: [
          {
            id: 'tpm_c1',
            dimensionId: 'tpm_oee',
            title: 'Manutenção Autônoma (Rotinas LIP Diárias — Fases 1 e 2 TPM)',
            description: 'Operadores capacitados nas fases de Manutenção Autônoma executam Limpeza com Inspeção, Reaperto e Lubrificação no início do turno.',
            gembaVerificationGuide: 'Examinar a folha de rotina autônoma fixada na máquina: conferir se os pontos de lubrificação demarcados em cores foram atendidos.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Equipes operacionais treinadas e capacitadas nas fases da Manutenção Autônoma.',
              'Rotina diária de Limpeza com Inspeção (LIP), reaperto e lubrificação executada no tempo padrão.',
              'Principais peças de desgaste monitoradas visualmente pelo operador com indicação de vida útil.',
            ],
          },
          {
            id: 'tpm_c2',
            dimensionId: 'tpm_oee',
            title: 'Gestão Visual de Anomalias (Quadro de Etiquetas TPM / Kamishibai)',
            description: 'Sistema de etiquetas azuis (operação) e vermelhas (manutenção) para identificar, priorizar e sanar desvios de equipamento.',
            gembaVerificationGuide: 'Contar as etiquetas abertas na máquina e conferir se o quadro TPM da célula rastreia os prazos pactuados de eliminação de anomalias.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Sistema de abertura e gestão de etiquetas para identificar anormalidades descobertas na máquina.',
              'Quadro de controle visual TPM (Kamishibai) no local para acompanhamento diário e semanal.',
              'Anomalias de baixa complexidade resolvidas pelos próprios operadores em menos de 48 horas.',
            ],
          },
          {
            id: 'tpm_c3',
            dimensionId: 'tpm_oee',
            title: 'Aderência ao Plano Mestre de Manutenção Preventiva',
            description: 'Cronograma de manutenção preventiva rigorosamente cumprido pela equipe de manutenção com apoio das equipes operacionais.',
            gembaVerificationGuide: 'Consultar o cronograma mestre de manutenção no sistema e conferir a taxa de execução das ordens preventivas no mês.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Existe plano mestre centralizado para todas as atividades de manutenção programada.',
              'Atividades de manutenção programada executadas no prazo planejado sem atrasos crônicos.',
              'Atividades de manutenção preventiva incluem operadores de produção para ampliar o domínio técnico.',
            ],
          },
          {
            id: 'tpm_c4',
            dimensionId: 'tpm_oee',
            title: 'Monitoramento de Confiabilidade (MTBF & MTTR)',
            description: 'Indicadores de Tempo Médio Entre Falhas (MTBF) e Tempo Médio de Reparo (MTTR) monitorados e analisados para reduzir paradas.',
            gembaVerificationGuide: 'Verificar se o histórico de quebras da máquina crítica está estratificado por causa e tempo de paralisação.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Tempo Médio Entre Falhas (MTBF) e Tempo Médio Para Reparar (MTTR) monitorados regularmente.',
              'Avarias crônicas e quebras repetitivas mapeadas e tratadas com planos de bloqueio definitivo.',
              'Frequência e duração dos tempos de inatividade de máquina conhecidos por líderes e mantenedores.',
            ],
          },
          {
            id: 'tpm_c5',
            dimensionId: 'tpm_oee',
            title: 'Gestão do OEE (Disponibilidade, Performance e Qualidade)',
            description: 'OEE calculado sistematicamente, estratificando as 6 grandes perdas, acompanhado pelo time operacional em reuniões periódicas.',
            gembaVerificationGuide: 'Analisar o painel de OEE do setor: verificar se o índice reflete dados fidedignos e se desvios de velocidade são investigados.',
            weight: 3,
            score: 3,
            checkpoints: [
              'O cálculo do OEE é usado para medir rigorosamente Disponibilidade, Performance e Qualidade.',
              'OEE é de propriedade do time de linha, utilizado para medir restrições e guiar kaizens.',
              'Reuniões periódicas realizadas entre liderança, operação e manutenção para alavancar o OEE.',
            ],
          },
          {
            id: 'tpm_c6',
            dimensionId: 'tpm_oee',
            title: 'Capacitação Técnica em TPM & Modos de Falha',
            description: 'Matriz de habilidades de manutenção autônoma ativa, com treinamentos práticos em resolução de problemas de equipamento.',
            gembaVerificationGuide: 'Checar a matriz de competências TPM dos operadores: verificar quem está habilitado para troca de peças de desgaste e ajustes finos.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Existe matriz de habilidades disponível para rastrear competências de Manutenção Autônoma.',
              'Treinamentos de TPM baseados nos modos de falha reais do maquinário utilizado na fábrica.',
              'Programa de treinamento inclui resolução de problemas práticos de máquinas em equipe.',
            ],
          },
        ],
      },
      {
        id: 'cultura_kaizen',
        name: 'Cultura Kaizen, Resolução Científica & Pessoas',
        shortName: 'Cultura Kaizen',
        description: 'Liderança ativa em segurança, canal de ideias, 5 Porquês, reunião diária de 10 min, reconhecimento e matriz de polivalência.',
        score: 60,
        level: 3,
        criteria: [
          {
            id: 'kz_c1',
            dimensionId: 'cultura_kaizen',
            title: 'Liderança Ativa em Segurança & Gestão Preventiva no Gemba',
            description: 'Gestores e líderes demonstram liderança ativa em segurança, identificação de riscos antes da tarefa e relato de quase-acidentes.',
            gembaVerificationGuide: 'Conversar com o operador e checar se a análise de risco é feita na prática e se os desvios de segurança relatados geram ação rápida.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Gestores demonstram liderança ativa em segurança no chão de fábrica e apoiam ações preventivas.',
              'Riscos e condições inseguras são identificados e neutralizados antes da execução das atividades.',
              'Equipes atuam na prevenção de acidentes e relatam desvios e quase-acidentes formalmente.',
            ],
          },
          {
            id: 'kz_c2',
            dimensionId: 'cultura_kaizen',
            title: 'Engajamento no Canal de Ideias Kaizen da Célula',
            description: 'Operadores submetem regularmente propostas de melhoria no Canal Kaizen com reconhecimento e apoio formal da gestão.',
            gembaVerificationGuide: 'Checar o painel de ideias da célula: verificar quantas propostas foram implementadas pelos operadores nos últimos 30 dias.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Equipes operacionais têm autonomia e canal aberto para propor e implementar melhorias.',
              'Empresa estimula e sustenta uma cultura ativa de envio e teste de ideias Kaizen.',
              'Liderança dedica tempo no turno para apoiar o operador na prototipagem da sua melhoria.',
            ],
          },
          {
            id: 'kz_c3',
            dimensionId: 'cultura_kaizen',
            title: 'Método Científico de Causa Raiz (5 Porquês & A3)',
            description: 'Desvios e anomalias de processo são investigados com a ferramenta dos 5 Porquês e relatórios A3 até a causa raiz de método.',
            gembaVerificationGuide: 'Analisar o último relatório de anomalia da célula: conferir se a análise passou pelos 5 níveis do "Por quê" ou parou no sintoma.',
            weight: 3,
            score: 3,
            checkpoints: [
              'Líderes e operadores utilizam a ferramenta dos 5 Porquês para investigar desvios do turno.',
              'Estrutura formal de resolução de problemas implantada no Gemba para anomalias reincidentes.',
              'Ações corretivas bloqueiam definitivamente a reincidência ao invés de apenas "apagar incêndio".',
            ],
          },
          {
            id: 'kz_c4',
            dimensionId: 'cultura_kaizen',
            title: 'Reunião Diária de Alinhamento no Gemba (10 min em Pé)',
            description: 'Reunião rápida no início do turno diante do quadro de gestão à vista para revisar metas, segurança, desvios e pendências.',
            gembaVerificationGuide: 'Presenciar a reunião diária de 10 minutos da equipe: verificar se há participação ativa dos operadores e foco em ações de 24 horas.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Reunião diária de 10 a 15 minutos realizada em pé no Gemba junto ao quadro visual da linha.',
              'Resultados do turno anterior (segurança, qualidade, produção) revisados com a equipe.',
              'Pendências e planos de ação têm responsável e prazo definidos e acompanhados diariamente.',
            ],
          },
          {
            id: 'kz_c5',
            dimensionId: 'cultura_kaizen',
            title: 'Cultura de Reconhecimento & Valorização de Equipes Kaizen',
            description: 'A empresa reconhece, promove e celebra formalmente os operadores e líderes que contribuem para a melhoria contínua e custo evitado.',
            gembaVerificationGuide: 'Verificar no quadro de gestão o mural de destaques Kaizen com fotos dos colaboradores e o impacto financeiro/operacional gerado.',
            weight: 2,
            score: 3,
            checkpoints: [
              'A empresa reconhece e promove publicamente os colaboradores que lideram melhorias.',
              'Apresentações periódicas de projetos Kaizen com a participação ativa da diretoria e gerência.',
              'Política clara de valorização que estimula o engajamento e o orgulho de pertencer à fábrica.',
            ],
          },
          {
            id: 'kz_c6',
            dimensionId: 'cultura_kaizen',
            title: 'Gestão de Pessoas, Absenteísmo & Clima Operacional',
            description: 'Indicadores de rotatividade (turnover) e absenteísmo monitorados com programas de acolhimento e escuta ativa da equipe.',
            gembaVerificationGuide: 'Checar os índices de frequência do setor e verificar as ações de acolhimento para novos contratados e diálogo com os operadores.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Indicadores de rotatividade e absenteísmo são monitorados regularmente com metas definidas.',
              'Gestão desenvolve programa acolhedor para integração, treinamento e escuta de novos colaboradores.',
              'Equipes de liderança avaliadas com base no clima, desenvolvimento do time e retenção.',
            ],
          },
          {
            id: 'kz_c7',
            dimensionId: 'cultura_kaizen',
            title: 'Matriz de Polivalência & Plano de Sucessão Operacional',
            description: 'Matriz de versatilidade atualizada garantindo que funções críticas tenham substitutos qualificados sem quebra de padrão ou segurança.',
            gembaVerificationGuide: 'Checar a matriz de polivalência da máquina crítica: certificar-se de que há pelo menos 2 operadores aptos para cada posto vital.',
            weight: 2,
            score: 3,
            checkpoints: [
              'Existe plano de sucessão ou substituição estruturado para funções críticas da célula.',
              'Procedimentos de segurança e qualidade mantidos mesmo na ausência de pessoas-chave.',
              'Matriz de polivalência auditada bimestralmente com plano formal de qualificação contínua.',
            ],
          },
        ],
      },
    ];
  },

  generateSenseiAssessmentDiagnosis(
    dimensions: Record<LeanAssessmentDimensionId, number>,
    sectorName: string
  ): SenseiAssessmentDiagnosis {
    const dimensionMeta: Record<
      LeanAssessmentDimensionId,
      {
        name: string;
        project: {
          title: string;
          desc: string;
          target: string;
          benefits: string;
          executiveSummary: string;
          criticalPoints: string[];
          rootCauses: string[];
          actionableSuggestions: string[];
          estimatedMaturityJump: string;
          projectedCostAvoidedMonthly: number;
        };
      }
    > = {
      estabilidade_5s: {
        name: 'Estabilidade Básica, 5S & Gestão Visual',
        project: {
          title: `Mutirão 5S Avançado & Ponto de Uso no Setor ${sectorName}`,
          desc: 'Redesenhar o layout dos postos com painéis sombra móveis e implantar gestão visual hora a hora.',
          target: 'Estabilidade Básica & 5S',
          benefits: 'Redução de até 40 minutos diários em buscas e caminhadas desnecessárias no posto.',
          executiveSummary: `Falta de estabilidade primária e desorganização física no setor ${sectorName} provocam dispersão de ferramentas, esperas invisíveis e fadiga operacional desnecessária.`,
          criticalPoints: [
            'Ferramentas de ajuste e troca de formato espalhadas fora do raio de 2 metros do operador.',
            'Peças não-conformes ou refugos armazenados em caixas sem identificação visual clara no posto.',
            'Quadro de acompanhamento hora a hora desatualizado ou preenchido apenas ao final do turno.',
          ],
          rootCauses: [
            'Ausência de demarcações físicas no piso para caixas de entrada/saída e falta de painéis sombra.',
            'Falta de rotina padronizada de 5 minutos para auditoria de 5S no fechamento de turno.',
          ],
          actionableSuggestions: [
            'Realizar evento Kaizen de 1 dia para etiquetagem vermelha e descarte de todos os itens obsoletos.',
            'Instalar painel sombra móvel ao lado da máquina com as ferramentas estritamente necessárias.',
            'Pintar demarcações de piso (verde para produto bom, vermelho para refugo, amarelo para espera).',
            'Instituir checklist visual diário de 5S executado pelo próprio operador antes da passagem de turno.',
          ],
          estimatedMaturityJump: 'De nível crítico para ~80% (+30 pontos de maturidade)',
          projectedCostAvoidedMonthly: 14500,
        },
      },
      trabalho_padronizado: {
        name: 'Trabalho Padronizado, POPs & TWI',
        project: {
          title: `Mapeamento e Padronização de Ciclos (POP Visual) - ${sectorName}`,
          desc: 'Filmar as operações dos postos de trabalho, eliminar micro-desperdícios e criar POPs com fotos reais.',
          target: 'Trabalho Padronizado & POPs',
          benefits: 'Equalização do tempo de ciclo entre turnos e redução de 25% na variabilidade de método.',
          executiveSummary: `Divergência expressiva de método e produtividade entre os turnos no setor ${sectorName}, provocada por instruções de trabalho complexas ou ausentes na bancada.`,
          criticalPoints: [
            'Dispersão de tempo de ciclo superior a 35% entre operadores da mesma máquina/célula.',
            'POPs extensos em texto guardados em pastas técnicas sem uso real no Gemba.',
            'Gargalos transitórios frequentes por falta de balanceamento de carga de trabalho.',
          ],
          rootCauses: [
            'Instruções não são visuais e não detalham os pontos críticos de segurança e qualidade.',
            'Ausência de treinamento sistemático no método TWI (Job Instruction) para novos operadores.',
          ],
          actionableSuggestions: [
            'Filmar a melhor prática operacional da célula e desmembrá-la em 4 a 6 macro-passos sequenciais.',
            'Criar POP Visual de 1 folha com fotos coloridas em alta resolução fixado no campo de visão do operador.',
            'Realizar cronoanálise de 10 ciclos para balizar o Tempo de Ciclo Padrão alinhado ao Takt Time.',
            'Treinar 100% dos operadores da célula no método TWI e atualizar a Matriz de Polivalência.',
          ],
          estimatedMaturityJump: 'De nível crítico para ~82% (+28 pontos de maturidade)',
          projectedCostAvoidedMonthly: 19800,
        },
      },
      fluxo_jit: {
        name: 'Fluxo Contínuo, JIT & Gestão de Estoques (Kanban)',
        project: {
          title: `Supermercado de Peças e Nivelamento Kanban - ${sectorName}`,
          desc: 'Dimensionar buffer intermediário máximo e sinalizar puxada de materiais por cartões Kanban.',
          target: 'Fluxo Contínuo & JIT',
          benefits: 'Redução de 30% no estoque em processo (WIP) e eliminação de esperas por materiais.',
          executiveSummary: `Produção operando em lotes grandes empurrados no setor ${sectorName}, gerando acúmulo excessivo de estoque intermediário (WIP) e trocas de produto (setup) excessivamente longas.`,
          criticalPoints: [
            'Tempo de troca de matriz/ferramental superior a 60 minutos com a linha completamente paralisada.',
            'Paletes de materiais acumulados bloqueando corredores e gerando risco de avarias mecânicas.',
            'Paradas de linha inesperadas por falta de insumos que não foram reabastecidos a tempo.',
          ],
          rootCauses: [
            'Atividades de setup interno executadas com máquina parada sem pré-aquecimento ou separação prévia.',
            'Falta de supermercado intermediário dimensionado com reposição sinalizada por cartões Kanban.',
          ],
          actionableSuggestions: [
            'Aplicar metodologia SMED: converter tarefas de setup interno em externo (preparação antes da parada).',
            'Pré-posicionar matrizes, insumos e ferramentas ao lado da linha 15 minutos antes da troca.',
            'Dimensionar buffer máximo e implantar supermercado físico de componentes com cartões Kanban.',
            'Padronizar o checklist de troca rápida de produto buscando reduzir o tempo de setup em pelo menos 50%.',
          ],
          estimatedMaturityJump: 'De nível crítico para ~85% (+35 pontos de maturidade)',
          projectedCostAvoidedMonthly: 34000,
        },
      },
      qualidade_poka_yoke: {
        name: 'Qualidade na Origem, Jidoka & Poka-Yoke',
        project: {
          title: `Dispositivos à Prova de Falha (Poka-Yoke) no Posto Crítico - ${sectorName}`,
          desc: 'Instalar sensores ópticos e gabaritos físicos que bloqueiam montagem invertida ou defeito na origem.',
          target: 'Qualidade na Origem & Poka-Yoke',
          benefits: 'Erradicação do refugo na operação e zero não-conformidade repassada para a etapa seguinte.',
          executiveSummary: `Geração recorrente de refugos e retrabalhos no setor ${sectorName} por depender exclusivamente da atenção visual humana em operações repetitivas.`,
          criticalPoints: [
            'Refugos crônicos por desvios de tolerância dimensional, fita desfiada ou montagem fora de padrão.',
            'Detecção tardia de não-conformidades, permitindo que lotes inteiros defeituosos sejam processados.',
            'Operador sem autonomia ou dispositivo imediato de bloqueio automático do posto de trabalho.',
          ],
          rootCauses: [
            'Processo sem travas físicas ou sensores de barreira contra erros de posicionamento.',
            'Falta de gabaritos passa-não-passa no ponto de operação para checagem 100% autônoma.',
          ],
          actionableSuggestions: [
            'Projetar e instalar gabarito mecânico "passa-não-passa" que impede fisicamente o encaixe incorreto.',
            'Instalar sensor óptico/indutivo intertravado ao relé de partida da máquina para bloqueio automático.',
            'Instalar botão/cordão Andon no posto permitindo que o operador solicite apoio de liderança em <3 min.',
            'Instituir o compromisso "Não Aceito defeito, Não Fabrico defeito, Não Repasso defeito" na equipe.',
          ],
          estimatedMaturityJump: 'De nível crítico para ~88% (+38 pontos de maturidade)',
          projectedCostAvoidedMonthly: 42500,
        },
      },
      tpm_oee: {
        name: 'Manutenção Produtiva Total (TPM) & OEE',
        project: {
          title: `Implantação de Manutenção Autônoma (Fase 1 e 2 TPM) - ${sectorName}`,
          desc: 'Capacitar os operadores em rotinas de Limpeza com Inspeção, Reaperto e Lubrificação no início do turno.',
          target: 'TPM & Confiabilidade',
          benefits: 'Aumento de 6 a 10 pontos percentuais no OEE e queda de 50% em microparadas de máquina.',
          executiveSummary: `Perda crônica de disponibilidade e microparadas intermitentes no setor ${sectorName} degradam o OEE e sobrecarregam a equipe de manutenção com chamados corretivos de emergência.`,
          criticalPoints: [
            'Microparadas diárias não apontadas decorrentes de sujeira acumulada, falta de lubrificação e folgas.',
            'Cultura reativa onde o operador apenas opera e aguarda a equipe mecânica para intervenções simples.',
            'Vazamentos de óleo ou acúmulo de resíduos ocultando o desgaste prematuro de componentes vitais.',
          ],
          rootCauses: [
            'Inexistência da rotina estruturada de Manutenção Autônoma LIP (Limpeza, Inspeção e Lubrificação).',
            'Falta de gestão visual de anomalias com quadro de etiquetas TPM (azuis para operação, vermelhas para manutenção).',
          ],
          actionableSuggestions: [
            'Realizar o "Dia da Limpeza com Inspeção" na máquina crítica com retirada de proteções e reaperto geral.',
            'Criar Folha de Rotina LIP plastificada com pontos de lubrificação demarcados em cores na própria máquina.',
            'Instalar Quadro de Gestão Visual de Etiquetas TPM na célula para abertura e fechamento de anomalias.',
            'Monitorar diariamente o Pareto das 3 principais causas de parada de máquina na reunião de 10 min.',
          ],
          estimatedMaturityJump: 'De nível crítico para ~84% (+36 pontos de maturidade)',
          projectedCostAvoidedMonthly: 48000,
        },
      },
      cultura_kaizen: {
        name: 'Cultura Kaizen, Resolução Científica & Pessoas',
        project: {
          title: `Ciclo Semanal de Kaizen Rápido & 5 Porquês - ${sectorName}`,
          desc: 'Estruturar reuniões de 15 minutos na linha com os operadores para solucionar desvios com o método 5 Porquês.',
          target: 'Cultura Kaizen & Pessoas',
          benefits: 'Aumento no engajamento operacional e geração de pelo menos 6 melhorias de baixo custo por mês.',
          executiveSummary: `Baixa participação operacional nas iniciativas de melhoria contínua no setor ${sectorName}; problemas do dia a dia são normalizados sem aplicação de metodologia de causa raiz.`,
          criticalPoints: [
            'Ideias dos operadores do Gemba não são capturadas, avaliadas ou testadas de forma ágil.',
            'Tratamento superficial de desvios operacionais com soluções paleativas ("apagar incêndios").',
            'Pouca visibilidade dos sucessos e ausência de reconhecimento aos times que implementam melhorias.',
          ],
          rootCauses: [
            'Ausência de reuniões diárias curtas de alinhamento operacional junto ao quadro de gestão à vista.',
            'Falta de treinamento prático dos líderes de célula na ferramenta dos 5 Porquês e no ciclo PDCA.',
          ],
          actionableSuggestions: [
            'Implantar a Reunião Diária de 10 minutos no Gemba para discutir desvios das últimas 24 horas.',
            'Capacitar líderes e operadores no uso dos 5 Porquês para investigar anomalias antes de encerrar o turno.',
            'Estimular a submissão de ideias no Canal Kaizen com meta de pelo menos 2 ideias implantadas/operador/mês.',
            'Criar painel de destaque com fotos dos operadores e o impacto financeiro dos Kaizens homologados.',
          ],
          estimatedMaturityJump: 'De nível crítico para ~82% (+26 pontos de maturidade)',
          projectedCostAvoidedMonthly: 16500,
        },
      },
    };

    let strongestKey: LeanAssessmentDimensionId = 'estabilidade_5s';
    let weakestKey: LeanAssessmentDimensionId = 'estabilidade_5s';
    let maxScore = -1;
    let minScore = 999;

    (Object.keys(dimensions) as LeanAssessmentDimensionId[]).forEach((key) => {
      const score = dimensions[key] || 0;
      if (score > maxScore) {
        maxScore = score;
        strongestKey = key;
      }
      if (score < minScore) {
        minScore = score;
        weakestKey = key;
      }
    });

    const strongest = dimensionMeta[strongestKey];
    const bottleneck = dimensionMeta[weakestKey];

    const summary = `Diagnóstico do Sensei para o setor ${sectorName}: O setor apresenta forte domínio em "${strongest.name}" (${maxScore}%), que serve como base de estabilidade. Contudo, o principal gargalo restritivo de maturidade está em "${bottleneck.name}" (${minScore}%), onde perdas e desvios ocultos ainda drenam a eficiência do Gemba.`;

    return {
      summary,
      strongestDimension: strongest.name,
      strongestScore: maxScore,
      criticalBottleneck: bottleneck.name,
      bottleneckScore: minScore,
      suggestedKaizenProject: {
        title: bottleneck.project.title,
        description: bottleneck.project.desc,
        targetDimension: bottleneck.project.target,
        expectedBenefits: bottleneck.project.benefits,
        executiveSummary: bottleneck.project.executiveSummary,
        criticalPoints: bottleneck.project.criticalPoints,
        rootCauses: bottleneck.project.rootCauses,
        actionableSuggestions: bottleneck.project.actionableSuggestions,
        estimatedMaturityJump: bottleneck.project.estimatedMaturityJump,
        projectedCostAvoidedMonthly: bottleneck.project.projectedCostAvoidedMonthly,
      },
    };
  },

  // Mapeamento automático de Categoria de Desperdício -> Dimensão do Assessment
  getDefaultAssessmentDimensionForWaste(waste: LeanWasteCategory): LeanAssessmentDimensionId {
    switch (waste) {
      case 'defeitos':
        return 'qualidade_poka_yoke';
      case 'espera':
        return 'tpm_oee';
      case 'movimentacao':
        return 'estabilidade_5s';
      case 'transporte':
      case 'estoque':
      case 'superproducao':
        return 'fluxo_jit';
      case 'processamento_excessivo':
        return 'trabalho_padronizado';
      case 'talento_subutilizado':
      default:
        return 'cultura_kaizen';
    }
  },

  // Obter Kaizens de um Setor agrupados por Dimensão do Lean Assessment
  getSectorKaizensByAssessmentDimension(sectorId: string) {
    const allActions = this.getActions().filter(
      (a) => a.originSectorId === sectorId || a.targetSectorId === sectorId
    );

    const dimensionKeys: LeanAssessmentDimensionId[] = [
      'estabilidade_5s',
      'trabalho_padronizado',
      'fluxo_jit',
      'qualidade_poka_yoke',
      'tpm_oee',
      'cultura_kaizen',
    ];

    const result = dimensionKeys.reduce((acc, dimId) => {
      acc[dimId] = {
        dimensionId: dimId,
        config: ASSESSMENT_DIMENSIONS_CONFIG[dimId],
        actions: [] as LeanAction[],
        completedActions: [] as LeanAction[],
        totalCostAvoided: 0,
        totalHoursSaved: 0,
      };
      return acc;
    }, {} as Record<LeanAssessmentDimensionId, {
      dimensionId: LeanAssessmentDimensionId;
      config: (typeof ASSESSMENT_DIMENSIONS_CONFIG)[LeanAssessmentDimensionId];
      actions: LeanAction[];
      completedActions: LeanAction[];
      totalCostAvoided: number;
      totalHoursSaved: number;
    }>);

    allActions.forEach((action) => {
      const dimId: LeanAssessmentDimensionId =
        action.assessmentDimensionId || this.getDefaultAssessmentDimensionForWaste(action.wasteCategory);

      if (result[dimId]) {
        result[dimId].actions.push(action);
        const cost = action.actualCostAvoided || action.estimatedCostAvoided || 0;
        const hours = action.hoursSaved || 0;
        result[dimId].totalCostAvoided += cost;
        result[dimId].totalHoursSaved += hours;
        if (action.status === 'concluida') {
          result[dimId].completedActions.push(action);
        }
      }
    });

    return result;
  },

  // Reset to default seed
  resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, JSON.stringify(INITIAL_TENANT));
    localStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(INITIAL_SECTORS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(INITIAL_ACTIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.KAIZEN_IDEAS, JSON.stringify(INITIAL_KAIZEN_IDEAS));
    localStorage.setItem(STORAGE_KEYS.TPM_MACHINES, JSON.stringify(INITIAL_TPM_MACHINES));
    localStorage.setItem(STORAGE_KEYS.TPM_AUDITS, JSON.stringify(INITIAL_TPM_AUDITS));
    localStorage.setItem(STORAGE_KEYS.TPM_TAGS, JSON.stringify(INITIAL_TPM_TAGS));
    localStorage.setItem(STORAGE_KEYS.LEAN_ARTICLES, JSON.stringify(INITIAL_LEAN_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.AGENT_ARTICLES, JSON.stringify(INITIAL_AGENT_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.AGENT_EXAMS, JSON.stringify(INITIAL_AGENT_EXAMS));
    localStorage.setItem(STORAGE_KEYS.SECTOR_ASSESSMENTS, JSON.stringify(INITIAL_SECTOR_ASSESSMENTS));
  },
};
