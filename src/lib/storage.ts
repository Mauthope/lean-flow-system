import {
  Tenant,
  Sector,
  User,
  LeanAction,
  KaizenIdea,
  TpmMachine,
  TpmAudit,
  TpmTag,
  LeanArticleItem,
  AgentArticleProgress,
  AgentExamResult,
  SectorLeanAssessment,
  StrategicObjective,
} from './types';

export const STORAGE_KEYS = {
  DATA_VERSION: 'lean_flow_data_version',
  TENANTS: 'lean_flow_tenants',
  CURRENT_TENANT: 'lean_flow_current_tenant',
  SECTORS: 'lean_flow_sectors',
  USERS: 'lean_flow_users',
  ACTIONS: 'lean_flow_actions',
  CURRENT_USER: 'lean_flow_current_user',
  KAIZEN_IDEAS: 'lean_flow_kaizen_ideas',
  TPM_MACHINES: 'lean_flow_tpm_machines',
  TPM_AUDITS: 'lean_flow_tpm_audits',
  TPM_TAGS: 'lean_flow_tpm_tags',
  AGENT_ARTICLES: 'lean_flow_agent_articles',
  AGENT_EXAMS: 'lean_flow_agent_exams',
  LEAN_ARTICLES: 'lean_flow_lean_articles',
  SECTOR_ASSESSMENTS: 'lean_flow_sector_assessments',
  STRATEGIC_OBJECTIVES: 'lean_flow_strategic_objectives',
};

export const CURRENT_DATA_VERSION = 'v2.2_three_degrees';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant_rafitec_01',
    name: 'Rafitec S.A.',
    slug: 'rafitec',
    cnpjOrCode: '04.892.341/0001-55',
    plan: 'enterprise',
    createdAt: '2026-01-10T08:00:00.000Z',
    aiSettings: {
      controladoriaEmail: 'controladoria@rafitec.com.br',
      controladoriaName: 'Gerência de Controladoria & Custos',
      autoNotifyControladoria: true,
    },
  },
];

export const INITIAL_TENANT: Tenant = INITIAL_TENANTS[0];

export const INITIAL_SECTORS: Sector[] = [];

export const INITIAL_USERS: User[] = [
  // Grau 1: Gestor Master de Entidades (Governança Global de Entidades)
  {
    id: 'usr_rafitec_master',
    tenantId: 'tenant_rafitec_01',
    name: 'Mauricio Grigol',
    email: 'mauricio.grigol@rafitec.com.br',
    role: 'admin',
    isMaster: true,
    jobTitle: 'Gestor Master de Entidades & Desenvolvedor Lean',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  // Grau 2: Gestor da Unidade Fabril (Supervisor/Gerente Local da Planta)
  {
    id: 'usr_gestor_planta_01',
    tenantId: 'tenant_rafitec_01',
    name: 'Carlos Silveira',
    email: 'carlos.silveira@rafitec.com.br',
    role: 'admin',
    isMaster: false,
    jobTitle: 'Gerente Industrial da Planta',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  // Grau 3: Facilitador / Agente Lean de Fábrica
  {
    id: 'usr_agente_lean_01',
    tenantId: 'tenant_rafitec_01',
    name: 'Ana Paula Mendes',
    email: 'ana.mendes@rafitec.com.br',
    role: 'agent',
    isMaster: false,
    jobTitle: 'Facilitadora Kaizen & Especialista Lean',
    sectorName: 'Engenharia de Processos',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-20T08:00:00.000Z',
  },
  // Diretoria Executiva (Consulta • Somente Leitura)
  {
    id: 'usr_diretoria_01',
    tenantId: 'tenant_rafitec_01',
    name: 'Roberto Vaccaro',
    email: 'roberto.vaccaro@rafitec.com.br',
    role: 'viewer',
    isMaster: false,
    jobTitle: 'Diretor de Operações Industriais',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-25T08:00:00.000Z',
  },
];

export const INITIAL_STRATEGIC_OBJECTIVES: StrategicObjective[] = [];

export const INITIAL_ACTIONS: LeanAction[] = [];

export const INITIAL_KAIZEN_IDEAS: KaizenIdea[] = [];

export const INITIAL_TPM_MACHINES: TpmMachine[] = [];

export const INITIAL_TPM_AUDITS: TpmAudit[] = [];

export const INITIAL_TPM_TAGS: TpmTag[] = [];

export const INITIAL_LEAN_ARTICLES: LeanArticleItem[] = [];

export const INITIAL_AGENT_ARTICLES: AgentArticleProgress[] = [];

export const INITIAL_AGENT_EXAMS: AgentExamResult[] = [];

export const INITIAL_SECTOR_ASSESSMENTS: SectorLeanAssessment[] = [];

export function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Erro ao carregar chave ${key} do localStorage:`, error);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar chave ${key} no localStorage:`, error);
  }
}

export function initializeLocalStorage(): void {
  if (typeof window === 'undefined') return;

  const currentVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);

  // If local storage has obsolete data or version mismatch, reset with clean slate
  if (currentVersion !== CURRENT_DATA_VERSION) {
    // Preserve custom AI settings if existing
    let existingAiSettings: any = undefined;
    try {
      const currentTenantStr = localStorage.getItem(STORAGE_KEYS.CURRENT_TENANT);
      if (currentTenantStr) {
        const parsed = JSON.parse(currentTenantStr);
        if (parsed?.aiSettings) existingAiSettings = parsed.aiSettings;
      }
    } catch {
      // ignore
    }

    const tenantToSet = existingAiSettings
      ? { ...INITIAL_TENANT, aiSettings: { ...INITIAL_TENANT.aiSettings, ...existingAiSettings } }
      : INITIAL_TENANT;

    const tenantsToSet = existingAiSettings
      ? INITIAL_TENANTS.map((t) => (t.id === INITIAL_TENANT.id ? { ...t, aiSettings: { ...t.aiSettings, ...existingAiSettings } } : t))
      : INITIAL_TENANTS;

    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenantsToSet));
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, JSON.stringify(tenantToSet));
    localStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(INITIAL_SECTORS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(INITIAL_ACTIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.STRATEGIC_OBJECTIVES, JSON.stringify(INITIAL_STRATEGIC_OBJECTIVES));
    localStorage.setItem(STORAGE_KEYS.KAIZEN_IDEAS, JSON.stringify(INITIAL_KAIZEN_IDEAS));
    localStorage.setItem(STORAGE_KEYS.TPM_MACHINES, JSON.stringify(INITIAL_TPM_MACHINES));
    localStorage.setItem(STORAGE_KEYS.TPM_TAGS, JSON.stringify(INITIAL_TPM_TAGS));
    localStorage.setItem(STORAGE_KEYS.TPM_AUDITS, JSON.stringify(INITIAL_TPM_AUDITS));
    localStorage.setItem(STORAGE_KEYS.LEAN_ARTICLES, JSON.stringify(INITIAL_LEAN_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.AGENT_ARTICLES, JSON.stringify(INITIAL_AGENT_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.AGENT_EXAMS, JSON.stringify(INITIAL_AGENT_EXAMS));
    localStorage.setItem(STORAGE_KEYS.SECTOR_ASSESSMENTS, JSON.stringify(INITIAL_SECTOR_ASSESSMENTS));
    return;
  }

  // Fallback defaults for missing individual keys
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_TENANT)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, JSON.stringify(INITIAL_TENANT));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SECTORS)) {
    localStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(INITIAL_SECTORS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(INITIAL_ACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.KAIZEN_IDEAS)) {
    localStorage.setItem(STORAGE_KEYS.KAIZEN_IDEAS, JSON.stringify(INITIAL_KAIZEN_IDEAS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TPM_MACHINES)) {
    localStorage.setItem(STORAGE_KEYS.TPM_MACHINES, JSON.stringify(INITIAL_TPM_MACHINES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TPM_TAGS)) {
    localStorage.setItem(STORAGE_KEYS.TPM_TAGS, JSON.stringify(INITIAL_TPM_TAGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TPM_AUDITS)) {
    localStorage.setItem(STORAGE_KEYS.TPM_AUDITS, JSON.stringify(INITIAL_TPM_AUDITS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STRATEGIC_OBJECTIVES)) {
    localStorage.setItem(STORAGE_KEYS.STRATEGIC_OBJECTIVES, JSON.stringify(INITIAL_STRATEGIC_OBJECTIVES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEAN_ARTICLES)) {
    localStorage.setItem(STORAGE_KEYS.LEAN_ARTICLES, JSON.stringify(INITIAL_LEAN_ARTICLES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AGENT_ARTICLES)) {
    localStorage.setItem(STORAGE_KEYS.AGENT_ARTICLES, JSON.stringify(INITIAL_AGENT_ARTICLES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AGENT_EXAMS)) {
    localStorage.setItem(STORAGE_KEYS.AGENT_EXAMS, JSON.stringify(INITIAL_AGENT_EXAMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SECTOR_ASSESSMENTS)) {
    localStorage.setItem(STORAGE_KEYS.SECTOR_ASSESSMENTS, JSON.stringify(INITIAL_SECTOR_ASSESSMENTS));
  }
}
