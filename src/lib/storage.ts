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
import { LEAN_ARTICLES } from '@/data/leanArticlesData';

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

export const CURRENT_DATA_VERSION = 'v2.0_clean_production';

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

export const INITIAL_SECTORS: Sector[] = [
  {
    id: 'sec_rafitec_extrusao',
    tenantId: 'tenant_rafitec_01',
    name: 'Extrusão & Fiação PP',
    code: 'EXT',
    description: 'Extrusoras de fita plana, dosagem de resina, estiramento e bobinamento',
    color: '#0284c7',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sec_rafitec_tecelagem',
    tenantId: 'tenant_rafitec_01',
    name: 'Tecelagem Circular & Planos',
    code: 'TEC',
    description: 'Tares circulares, controle de trama/urdume, redução de paradas por quebra de fita',
    color: '#2563eb',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sec_rafitec_laminacao',
    tenantId: 'tenant_rafitec_01',
    name: 'Laminação & Revestimento',
    code: 'LAM',
    description: 'Extrusora de laminação, adesão de filme PE/PP, impressão e tratamento corona',
    color: '#7c3aed',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sec_rafitec_acabamento',
    tenantId: 'tenant_rafitec_01',
    name: 'Corte, Costura & Big Bags',
    code: 'ACAB',
    description: 'Corte automático, células de costura de alças, colocação de liners e enfardamento',
    color: '#059669',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sec_rafitec_qualidade',
    tenantId: 'tenant_rafitec_01',
    name: 'Qualidade & Laboratório',
    code: 'QUAL',
    description: 'Testes de tração, gramatura, fator de segurança 5:1/6:1 e auditoria 5S',
    color: '#0891b2',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sec_rafitec_manutencao',
    tenantId: 'tenant_rafitec_01',
    name: 'Manutenção Preditiva & TPM',
    code: 'MANUT',
    description: 'Manutenção autônoma em teares e extrusoras, termografia e disponibilidade OEE',
    color: '#d97706',
    requiresTrackingDoc: true,
    trackingDocType: 'work_order',
    trackingDocLabel: 'Número da Ordem de Serviço (OS)',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sec_rafitec_compras',
    tenantId: 'tenant_rafitec_01',
    name: 'Compras & Suprimentos',
    code: 'COMP',
    description: 'Cotação técnica, contratação de terceiros, aquisição de peças e matérias-primas',
    color: '#10b981',
    requiresTrackingDoc: true,
    trackingDocType: 'purchase_order',
    trackingDocLabel: 'Número da Ordem de Compra (OC)',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sec_rafitec_logistica',
    tenantId: 'tenant_rafitec_01',
    name: 'Logística & Expedição',
    code: 'LOG',
    description: 'Almoxarifado de resinas, kanban de rolos de tecido e carregamento de fardos',
    color: '#ea580c',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
];

export const INITIAL_USERS: User[] = [
  // Conta Master / Desenvolvedor (Gestão de Entidades)
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
];

export const INITIAL_STRATEGIC_OBJECTIVES: StrategicObjective[] = [
  {
    id: 'obj_rafitec_01',
    tenantId: 'tenant_rafitec_01',
    code: 'HOSHIN-2026-01',
    title: 'Redução de Custo de Transformação na Fiação & Extrusão',
    description: 'Eliminar perdas de matéria-prima (pontas de bobina, aparas de PP) e tempos de parada nas extrusoras, visando R$ 1.5M em custos evitados anualizados.',
    pillar: 'financeiro_custos',
    sponsor: 'Diretoria Industrial & Controladoria',
    year: 2026,
    targetValue: 1500000,
    targetUnit: 'currency',
    unitLabel: 'R$',
    baselineValue: 0,
    status: 'ativo',
    deadlineDate: '2026-12-31',
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'obj_rafitec_02',
    tenantId: 'tenant_rafitec_01',
    code: 'HOSHIN-2026-02',
    title: 'Elevação da Eficiência Global de Equipamentos (OEE para 85%)',
    description: 'Atingir padrão World Class Manufacturing nos teares circulares e extrusoras principais através de SMED, manutenção autônoma TPM e eliminação de microparadas.',
    pillar: 'produtividade_oee',
    sponsor: 'Gerência Geral de Operações',
    year: 2026,
    targetValue: 85,
    targetUnit: 'percentage',
    unitLabel: '%',
    baselineValue: 71.5,
    status: 'ativo',
    deadlineDate: '2026-12-31',
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'obj_rafitec_03',
    tenantId: 'tenant_rafitec_01',
    code: 'HOSHIN-2026-03',
    title: 'Zero Defeito & Qualidade Assegurada em Big Bags e Sacarias',
    description: 'Implementação de dispositivos Poka-Yoke e controle estatístico para manter conformidade acima de 99.2% e refugo de tecido abaixo de 0.8%.',
    pillar: 'qualidade_refugo',
    sponsor: 'Diretoria de Qualidade & Engenharia',
    year: 2026,
    targetValue: 99.2,
    targetUnit: 'percentage',
    unitLabel: '%',
    baselineValue: 96.8,
    status: 'ativo',
    deadlineDate: '2026-12-31',
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'obj_rafitec_04',
    tenantId: 'tenant_rafitec_01',
    code: 'HOSHIN-2026-04',
    title: 'Redução do Lead Time Total de Pedidos para 7 Dias Úteis',
    description: 'Sincronizar fluxo puxado com kanban entre Fiação, Tecelagem e Acabamento, reduzindo estoque intermediário (WIP) e tempo total porta-a-porta.',
    pillar: 'lead_time_cliente',
    sponsor: 'Diretoria Comercial & Supply Chain',
    year: 2026,
    targetValue: 7,
    targetUnit: 'days',
    unitLabel: 'dias',
    baselineValue: 16,
    status: 'ativo',
    deadlineDate: '2026-12-31',
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'obj_rafitec_05',
    tenantId: 'tenant_rafitec_01',
    code: 'HOSHIN-2026-05',
    title: 'Zero Acidentes & Excelência Ergonômica no Gemba (NR-12 / NR-17)',
    description: 'Adequação ergonômica de postos de costura, movimentação segura de bobinas/fardos e eliminação de condições de risco no chão de fábrica.',
    pillar: 'seguranca_ergonomia',
    sponsor: 'Diretoria de Gente & Segurança',
    year: 2026,
    targetValue: 0,
    targetUnit: 'hours',
    unitLabel: 'horas perdidas',
    baselineValue: 48,
    status: 'ativo',
    deadlineDate: '2026-12-31',
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
];

export const INITIAL_ACTIONS: LeanAction[] = [];

export const INITIAL_KAIZEN_IDEAS: KaizenIdea[] = [];

export const INITIAL_TPM_MACHINES: TpmMachine[] = [
  {
    id: 'mach_ext_01',
    tenantId: 'tenant_rafitec_01',
    sectorId: 'sec_rafitec_extrusao',
    sectorName: 'Extrusão & Fiação PP',
    name: 'Extrusora de Fita Plana 01',
    code: 'EXT-01',
    brandModel: 'Barmag EvoTape 1200',
    criticality: 'A',
    status: 'operacional',
    currentAuditScore: 0,
    tpmPhase: 0,
    tpmPhaseHistory: [],
    description: 'Linha principal de extrusão de fitas de alta tenacidade para Big Bags.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'mach_ext_02',
    tenantId: 'tenant_rafitec_01',
    sectorId: 'sec_rafitec_extrusao',
    sectorName: 'Extrusão & Fiação PP',
    name: 'Extrusora de Fita Plana 02',
    code: 'EXT-02',
    brandModel: 'Starlinger Starex 1400',
    criticality: 'A',
    status: 'operacional',
    currentAuditScore: 0,
    tpmPhase: 0,
    tpmPhaseHistory: [],
    description: 'Extrusora de fitas PP convencionais com sistema automático de bobinamento.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'mach_tec_01',
    tenantId: 'tenant_rafitec_01',
    sectorId: 'sec_rafitec_tecelagem',
    sectorName: 'Tecelagem Circular & Planos',
    name: 'Tear Circular 04',
    code: 'TEC-04',
    brandModel: 'Starlinger FX 6.0',
    criticality: 'B',
    status: 'operacional',
    currentAuditScore: 0,
    tpmPhase: 0,
    tpmPhaseHistory: [],
    description: 'Tear circular 6 lançadeiras para tecido tubular reforçado.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'mach_tec_02',
    tenantId: 'tenant_rafitec_01',
    sectorId: 'sec_rafitec_tecelagem',
    sectorName: 'Tecelagem Circular & Planos',
    name: 'Tear Circular 12',
    code: 'TEC-12',
    brandModel: 'Lohia Nova 6',
    criticality: 'B',
    status: 'operacional',
    currentAuditScore: 0,
    tpmPhase: 0,
    tpmPhaseHistory: [],
    description: 'Tear circular de alta velocidade.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'mach_lam_01',
    tenantId: 'tenant_rafitec_01',
    sectorId: 'sec_rafitec_laminacao',
    sectorName: 'Laminação & Revestimento',
    name: 'Linha de Laminação Extrusora 01',
    code: 'LAM-01',
    brandModel: 'Brückner EcoCoater 2200',
    criticality: 'A',
    status: 'operacional',
    currentAuditScore: 0,
    tpmPhase: 0,
    tpmPhaseHistory: [],
    description: 'Aplicação contínua de filme polietileno/polipropileno sobre tecido tubular.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'mach_acab_01',
    tenantId: 'tenant_rafitec_01',
    sectorId: 'sec_rafitec_acabamento',
    sectorName: 'Corte, Costura & Big Bags',
    name: 'Máquina Automática de Corte a Quente',
    code: 'CORTE-01',
    brandModel: 'Starlinger SL 600',
    criticality: 'C',
    status: 'operacional',
    currentAuditScore: 0,
    tpmPhase: 0,
    tpmPhaseHistory: [],
    description: 'Corte transversal térmico automático para confecção de corpo de Big Bags.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
];

export const INITIAL_TPM_AUDITS: TpmAudit[] = [];

export const INITIAL_TPM_TAGS: TpmTag[] = [];

export const INITIAL_LEAN_ARTICLES: LeanArticleItem[] = LEAN_ARTICLES;

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

  // If local storage has obsolete mock data or version mismatch, reset with clean production baseline
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
