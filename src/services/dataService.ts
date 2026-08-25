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
} from '../lib/storage';
import { generateProtocol, generateId } from '../lib/utils';

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
    
    // Check sector name if sectorId provided
    let sectorName: string | undefined = undefined;
    if (user.sectorId) {
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

    if (updates.sectorId) {
      const sec = this.getSectorById(updates.sectorId);
      if (sec) updates.sectorName = sec.name;
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

    actions[index] = { ...actions[index], ...updates, updatedAt: new Date().toISOString() };
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

  // Reset to default seed
  resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, JSON.stringify(INITIAL_TENANT));
    localStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(INITIAL_SECTORS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(INITIAL_ACTIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  },
};
