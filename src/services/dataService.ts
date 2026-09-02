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
} from '../lib/types';
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
    if (!tenantId) return all;
    return all.filter((a) => a.tenantId === tenantId);
  },

  getActionById(id: string): LeanAction | undefined {
    return this.getActions().find((a) => a.id === id);
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

    // Auto-inicializar acompanhamento trimestral se homologado
    if (merged.masterApproved && !merged.quarterlyFollowUp) {
      merged.quarterlyFollowUp = {
        enabled: true,
        startedAt: merged.masterApprovedAt || new Date().toISOString(),
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
      // Oficializa a média como ganho consolidado comprovado
      action.actualCostAvoided = avg;
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
    const completedActions = actions.filter((a) => a.status === 'concluida').length;
    const rejectedActions = actions.filter((a) => a.status === 'nao_aprovada').length;

    const totalEstimatedCostAvoided = actions.reduce((acc, a) => acc + (a.estimatedCostAvoided || 0), 0);
    const totalActualCostAvoided = actions
      .filter((a) => a.status === 'concluida')
      .reduce((acc, a) => acc + (a.actualCostAvoided || 0), 0);
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
        .reduce((acc, a) => acc + (a.actualCostAvoided || 0), 0);
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
      const inProgress = agentActions.filter((a) => a.status === 'em_andamento');
      const cost = completed.reduce((acc, a) => acc + (a.actualCostAvoided || 0), 0);
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

    // Cost Breakdown Totals
    const costBreakdownTotals: LeanCostBreakdown = {
      laborSavings: 0,
      productionIncrease: 0,
      scrapReduction: 0,
      machineDowntime: 0,
      toolingAndEnergy: 0,
      logisticsAndFreight: 0,
      otherSavings: 0,
    };

    actions
      .filter((a) => a.status === 'concluida')
      .forEach((a) => {
        if (a.costBreakdown) {
          costBreakdownTotals.laborSavings! += a.costBreakdown.laborSavings || 0;
          costBreakdownTotals.productionIncrease! += a.costBreakdown.productionIncrease || 0;
          costBreakdownTotals.scrapReduction! += a.costBreakdown.scrapReduction || 0;
          costBreakdownTotals.machineDowntime! += a.costBreakdown.machineDowntime || 0;
          costBreakdownTotals.toolingAndEnergy! += a.costBreakdown.toolingAndEnergy || 0;
          costBreakdownTotals.logisticsAndFreight! += a.costBreakdown.logisticsAndFreight || 0;
          costBreakdownTotals.otherSavings! += a.costBreakdown.otherSavings || 0;
        } else if (a.actualCostAvoided > 0) {
          // Default to labor/production if breakdown wasn't specified
          costBreakdownTotals.laborSavings! += a.actualCostAvoided * 0.4;
          costBreakdownTotals.productionIncrease! += a.actualCostAvoided * 0.35;
          costBreakdownTotals.scrapReduction! += a.actualCostAvoided * 0.25;
        }
      });

    return {
      totalActions,
      openActions,
      inProgressActions,
      completedActions,
      rejectedActions,
      totalEstimatedCostAvoided,
      totalActualCostAvoided,
      totalHoursSaved,
      costBreakdownTotals,
      resolutionRate,
      averageCycleDays,
      byWasteCategory,
      bySector,
      byAgent,
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
  // ACADEMIA LEAN: GERADOR RANDÔMICO BALANCEADO (50% MENOS LIDOS / 50% MAIS LIDOS)
  // =========================================================================
  generateRandomBalancedExam(agentId: string, questionCount = 10): ExamQuestionSnapshot[] {
    const articles = this.getArticles();
    const progressList = getStoredData<AgentArticleProgress[]>(STORAGE_KEYS.AGENT_ARTICLES, INITIAL_AGENT_ARTICLES);
    const agentProgress = progressList.filter((p) => p.agentId === agentId);

    // Mapeamento de tópicos de questões para IDs de artigos
    const topicToArticleMap: Record<string, string[]> = {
      'Fundamentos TPS & Lean': ['8-desperdicios', 'trabalho-padronizado-pop'],
      '8 Desperdícios & Gemba': ['8-desperdicios'],
      '5S & Padronização Avançada': ['5s-metodologia', 'trabalho-padronizado-pop'],
      'Poka-Yoke & Jidoka': ['poka-yoke'],
      'SMED & Engenharia de Setup': ['smed-troca-rapida'],
      'VSM & Fluxo Contínuo': ['vsm-fluxo-valor'],
      'TPM, Confiabilidade & OEE': ['tpm-oee'],
      'PDCA & Causalidade Científica': ['pdca-analise-causal'],
      'Engenharia Financeira & ROI Lean': ['vsm-fluxo-valor', '8-desperdicios'],
      'Kanban, Supermercados & Heijunka': ['vsm-fluxo-valor', 'trabalho-padronizado-pop'],
    };

    // Calcular score de domínio (mastery) para cada artigo
    const scoredArticles = articles.map((art) => {
      const prog = agentProgress.find((p) => p.articleId === art.id);
      const isVal = prog?.isValidated ? 50 : 0;
      const timeRatio = Math.min(50, ((prog?.timeSpentSeconds || 0) / (art.minReadTimeSeconds || 120)) * 50);
      const score = isVal + timeRatio; // 0 a 100
      return { article: art, score };
    });

    // Ordenar do menor score (menos lidos/menor tempo) para o maior (mais lidos)
    scoredArticles.sort((a, b) => a.score - b.score);

    const midIndex = Math.max(1, Math.floor(scoredArticles.length / 2));
    const lowMasteryArticles = scoredArticles.slice(0, midIndex).map((s) => s.article);
    const highMasteryArticles = scoredArticles.slice(midIndex).map((s) => s.article);

    const lowArticleIds = new Set(lowMasteryArticles.map((a) => a.id));
    const highArticleIds = new Set(highMasteryArticles.map((a) => a.id));

    // Separar o banco de questões (50 questões) nos dois grupos
    const allQuestions = [...LEAN_EXAM_QUESTIONS];
    const lowQuestions: ExamQuestion[] = [];
    const highQuestions: ExamQuestion[] = [];
    const neutralQuestions: ExamQuestion[] = [];

    allQuestions.forEach((q) => {
      const matchedArticles = topicToArticleMap[q.category] || [];
      const inLow = matchedArticles.some((id) => lowArticleIds.has(id));
      const inHigh = matchedArticles.some((id) => highArticleIds.has(id));

      if (inLow && !inHigh) {
        lowQuestions.push(q);
      } else if (inHigh && !inLow) {
        highQuestions.push(q);
      } else {
        neutralQuestions.push(q);
      }
    });

    // Completar se um dos grupos tiver poucas questões
    if (lowQuestions.length < Math.floor(questionCount / 2)) {
      neutralQuestions.forEach((q) => {
        if (lowQuestions.length < Math.floor(questionCount / 2)) lowQuestions.push(q);
      });
    }
    if (highQuestions.length < Math.ceil(questionCount / 2)) {
      neutralQuestions.forEach((q) => {
        if (!lowQuestions.includes(q) && highQuestions.length < Math.ceil(questionCount / 2)) highQuestions.push(q);
      });
    }

    // Função para sortear N itens aleatórios de um array sem repetição
    const pickRandom = (arr: ExamQuestion[], n: number): ExamQuestion[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const targetLowCount = Math.floor(questionCount / 2); // 5 questões (50%)
    const targetHighCount = questionCount - targetLowCount; // 5 questões (50%)

    const selectedLow = pickRandom(lowQuestions.length > 0 ? lowQuestions : allQuestions, targetLowCount);
    const selectedHigh = pickRandom(
      highQuestions.filter((q) => !selectedLow.includes(q)).length >= targetHighCount
        ? highQuestions.filter((q) => !selectedLow.includes(q))
        : allQuestions.filter((q) => !selectedLow.includes(q)),
      targetHighCount
    );

    const combined = [...selectedLow, ...selectedHigh].sort(() => 0.5 - Math.random());

    return combined.map((q) => {
      const matchedArticle = articles.find((a) => {
        const topics = topicToArticleMap[q.category] || [];
        return topics.includes(a.id);
      });

      return {
        id: q.id,
        question: q.question,
        category: q.category,
        articleId: matchedArticle?.id,
        articleTitle: matchedArticle?.title || q.category,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
      };
    });
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
  },
};
