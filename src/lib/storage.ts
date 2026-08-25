import { Tenant, Sector, User, LeanAction } from './types';

const STORAGE_KEYS = {
  TENANTS: 'lean_flow_tenants',
  CURRENT_TENANT: 'lean_flow_current_tenant',
  SECTORS: 'lean_flow_sectors',
  USERS: 'lean_flow_users',
  ACTIONS: 'lean_flow_actions',
  CURRENT_USER: 'lean_flow_current_user',
};

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant_rafitec_01',
    name: 'Rafitec S.A.',
    slug: 'rafitec',
    cnpjOrCode: '04.892.341/0001-55',
    plan: 'enterprise',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'tenant_grigol_02',
    name: 'Metalúrgica Grigol & Automação Industrial',
    slug: 'metalurgica-grigol',
    cnpjOrCode: '45.892.123/0001-44',
    plan: 'enterprise',
    createdAt: '2026-02-01T08:00:00.000Z',
  },
];

export const INITIAL_TENANT: Tenant = INITIAL_TENANTS[0];

export const INITIAL_SECTORS: Sector[] = [
  // Setores Rafitec
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

  // Setores Metalúrgica Grigol
  {
    id: 'sec_grigol_01',
    tenantId: 'tenant_grigol_02',
    name: 'Usinagem CNC & Ferramentaria',
    code: 'USIN',
    description: 'Centros de usinagem 5 eixos, tornos CNC e redução de tempo de setup (SMED)',
    color: '#0284c7',
    createdAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'sec_grigol_02',
    tenantId: 'tenant_grigol_02',
    name: 'Estamparia & Conformação',
    code: 'ESTAMP',
    description: 'Prensas excêntricas, matrizes progressivas e manutenção autônoma TPM',
    color: '#ea580c',
    createdAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'sec_grigol_03',
    tenantId: 'tenant_grigol_02',
    name: 'Montagem & Soldagem Robotizada',
    code: 'MONT',
    description: 'Células robotizadas de solda MIG/MAG, poka-yoke e fluxo de montagem',
    color: '#16a34a',
    createdAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'sec_grigol_04',
    tenantId: 'tenant_grigol_02',
    name: 'Controle de Qualidade & Metrologia',
    code: 'METRO',
    description: 'Braço tridimensional, inspeção dimensional e auditorias de processo',
    color: '#9333ea',
    createdAt: '2026-02-01T08:00:00.000Z',
  },
];

export const INITIAL_USERS: User[] = [
  // Rafitec Master Entity Account
  {
    id: 'usr_rafitec_master',
    tenantId: 'tenant_rafitec_01',
    name: 'Rafitec',
    email: 'master@rafitec.com.br',
    role: 'admin',
    jobTitle: 'Entidade Master • Gestão Industrial & ROI',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  // Agentes Operacionais da Rafitec
  {
    id: 'usr_rafitec_agent_01',
    tenantId: 'tenant_rafitec_01',
    name: 'Carlos Silva',
    email: 'carlos.silva@rafitec.com.br',
    role: 'agent',
    sectorId: 'sec_rafitec_qualidade',
    sectorName: 'Qualidade & Laboratório',
    jobTitle: 'Agente Lean de Qualidade',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'usr_rafitec_agent_02',
    tenantId: 'tenant_rafitec_01',
    name: 'Juliana Mendes',
    email: 'juliana.mendes@rafitec.com.br',
    role: 'agent',
    sectorId: 'sec_rafitec_manutencao',
    sectorName: 'Manutenção Preditiva & TPM',
    jobTitle: 'Agente TPM & Confiabilidade',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-12T09:30:00.000Z',
  },
  {
    id: 'usr_rafitec_agent_03',
    tenantId: 'tenant_rafitec_01',
    name: 'Roberto Rocha',
    email: 'roberto.rocha@rafitec.com.br',
    role: 'agent',
    sectorId: 'sec_rafitec_logistica',
    sectorName: 'Logística & Expedição',
    jobTitle: 'Agente de Fluxo & Abastecimento',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'usr_rafitec_agent_04',
    tenantId: 'tenant_rafitec_01',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@rafitec.com.br',
    role: 'agent',
    sectorId: 'sec_rafitec_tecelagem',
    sectorName: 'Tecelagem Circular & Planos',
    jobTitle: 'Agente Kaizen & OEE',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-18T11:00:00.000Z',
  },
  {
    id: 'usr_rafitec_agent_05',
    tenantId: 'tenant_rafitec_01',
    name: 'Lucas Antunes',
    email: 'lucas.antunes@rafitec.com.br',
    role: 'agent',
    sectorId: 'sec_rafitec_acabamento',
    sectorName: 'Corte, Costura & Big Bags',
    jobTitle: 'Agente de Célula & Padronização',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-20T11:00:00.000Z',
  },

  // Metalúrgica Grigol Users
  {
    id: 'usr_grigol_master',
    tenantId: 'tenant_grigol_02',
    name: 'Metalúrgica Grigol (Entidade Master)',
    email: 'master@metalurgicagrigol.com',
    role: 'admin',
    jobTitle: 'Gestão Master da Fábrica',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'usr_grigol_agent_01',
    tenantId: 'tenant_grigol_02',
    name: 'Lucas Antunes',
    email: 'lucas.antunes@metalurgicagrigol.com',
    role: 'agent',
    sectorId: 'sec_grigol_01',
    sectorName: 'Usinagem CNC & Ferramentaria',
    jobTitle: 'Técnico de Setup & Processos',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T09:00:00.000Z',
  },
];

export const INITIAL_ACTIONS: LeanAction[] = [
  {
    id: 'act_001',
    protocol: 'RAF-2026-8801',
    tenantId: 'tenant_rafitec_01',
    title: 'Otimização de Setup Rápido (SMED) na Extrusora de Fitas 03',
    description: 'Redução do tempo de troca de lote e matriz de 52 para 16 minutos, eliminando perda térmica na linha.',
    wasteCategory: 'espera',
    originSectorId: 'sec_rafitec_extrusao',
    originSectorName: 'Extrusão & Fiação PP',
    targetSectorId: 'sec_rafitec_tecelagem',
    targetSectorName: 'Tecelagem Circular & Planos',
    isPublicDemand: false,
    assignedAgentId: 'usr_rafitec_agent_04',
    assignedAgentName: 'Fernanda Lima',
    assignedAgentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'concluida',
    priority: 'alta',
    estimatedCostAvoided: 65000,
    actualCostAvoided: 74200,
    hoursSaved: 194,
    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: '2026-02-18T17:00:00.000Z',
    startedAt: '2026-02-02T09:00:00.000Z',
    completedAt: '2026-02-18T16:45:00.000Z',
    dueDate: '2026-02-20',
    costBreakdown: {
      machineDowntime: 38000,
      laborSavings: 18200,
      scrapReduction: 12000,
      toolingAndEnergy: 6000,
    },
    notes: [
      {
        id: 'note_1',
        authorId: 'usr_rafitec_agent_04',
        authorName: 'Fernanda Lima',
        authorRole: 'agent',
        text: 'Mapeamento em vídeo da troca de matriz concluído. Identificadas 7 operações externas executadas como internas.',
        createdAt: '2026-02-05T14:20:00.000Z',
      },
      {
        id: 'note_2',
        authorId: 'usr_rafitec_master',
        authorName: 'Rafitec (Entidade Master)',
        authorRole: 'admin',
        text: 'Excelente ganho de OEE verificado na produção contínua. Custo evitado homologado pela gestão.',
        createdAt: '2026-02-18T17:00:00.000Z',
      },
    ],
    checklist: [
      {
        id: 'ck_1',
        label: 'Cronometrar 3 trocas de matriz na Extrusora 03',
        startDate: '2026-02-02',
        endDate: '2026-02-04',
        status: 'concluida',
        responsibleName: 'Fernanda Lima',
        durationHours: 12,
        observations: 'Gravados 3 setups com 2 câmeras sincronizadas.',
        completed: true,
        completedAt: '2026-02-04T10:00:00.000Z',
      },
      {
        id: 'ck_2',
        label: 'Separar setup interno do setup externo',
        startDate: '2026-02-05',
        endDate: '2026-02-08',
        status: 'concluida',
        responsibleName: 'Fernanda Lima',
        durationHours: 16,
        observations: 'Pré-aquecimento do cabeçote transferido para operação externa.',
        completed: true,
        completedAt: '2026-02-08T11:30:00.000Z',
      },
      {
        id: 'ck_3',
        label: 'Padronizar ferramentas e criar carrinho SMED dedicado',
        startDate: '2026-02-09',
        endDate: '2026-02-14',
        status: 'concluida',
        responsibleName: 'Juliana Mendes',
        durationHours: 24,
        observations: 'Carrinho com ferramentas etiquetadas e engates rápidos.',
        completed: true,
        completedAt: '2026-02-14T15:00:00.000Z',
      },
    ],
    rootCauseAnalysis: 'O tempo de troca era elevado porque os operadores aguardavam o cabeçote atingir a temperatura de fusão após a parada da máquina, em vez de pré-aquecer em bancada externa.',
    standardWorkUpdated: true,
  },
  {
    id: 'act_002',
    protocol: 'RAF-2026-8802',
    tenantId: 'tenant_rafitec_01',
    title: 'Redução de Paradas por Quebra de Fita nos Teares Circulares 08 e 12',
    description: 'Implementação de sensor óptico e ajuste de tensão nas gaiolas de alimentação de fita.',
    wasteCategory: 'defeitos',
    originSectorId: 'sec_rafitec_tecelagem',
    originSectorName: 'Tecelagem Circular & Planos',
    targetSectorId: 'sec_rafitec_manutencao',
    targetSectorName: 'Manutenção Preditiva & TPM',
    isPublicDemand: true,
    requesterName: 'Marcos Vinícius (Operador de Tear)',
    requesterEmail: 'marcos.tear@rafitec.com.br',
    requesterDepartment: 'Tecelagem - Turno A',
    assignedAgentId: 'usr_rafitec_agent_02',
    assignedAgentName: 'Juliana Mendes',
    assignedAgentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'concluida',
    priority: 'alta',
    estimatedCostAvoided: 42000,
    actualCostAvoided: 48500,
    hoursSaved: 140,
    createdAt: '2026-02-05T10:15:00.000Z',
    updatedAt: '2026-02-22T14:30:00.000Z',
    startedAt: '2026-02-06T08:00:00.000Z',
    completedAt: '2026-02-22T14:00:00.000Z',
    dueDate: '2026-02-25',
    costBreakdown: {
      scrapReduction: 24500,
      machineDowntime: 18000,
      laborSavings: 6000,
    },
    notes: [],
    checklist: [
      {
        id: 'ck_201',
        label: 'Instalar guias cerâmicas anti-desgaste nas gaiolas',
        startDate: '2026-02-06',
        endDate: '2026-02-12',
        status: 'concluida',
        responsibleName: 'Juliana Mendes',
        durationHours: 18,
        completed: true,
        completedAt: '2026-02-12T16:00:00.000Z',
      },
    ],
  },
  {
    id: 'act_003',
    protocol: 'RAF-2026-8803',
    tenantId: 'tenant_rafitec_01',
    title: 'Dispositivo Poka-Yoke na Costura de Alças de Big Bags',
    description: 'Gabarito magnético de alinhamento para evitar costuras fora do padrão de carga.',
    wasteCategory: 'processamento_excessivo',
    originSectorId: 'sec_rafitec_acabamento',
    originSectorName: 'Corte, Costura & Big Bags',
    targetSectorId: 'sec_rafitec_acabamento',
    targetSectorName: 'Corte, Costura & Big Bags',
    isPublicDemand: false,
    assignedAgentId: 'usr_rafitec_agent_05',
    assignedAgentName: 'Lucas Antunes',
    assignedAgentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'em_andamento',
    priority: 'alta',
    estimatedCostAvoided: 28000,
    actualCostAvoided: 0,
    hoursSaved: 0,
    createdAt: '2026-02-10T14:00:00.000Z',
    updatedAt: '2026-02-23T11:00:00.000Z',
    startedAt: '2026-02-12T09:00:00.000Z',
    dueDate: '2026-03-05',
    notes: [],
    checklist: [
      {
        id: 'ck_301',
        label: 'Fabricar protótipo de gabarito magnético',
        startDate: '2026-02-12',
        endDate: '2026-02-18',
        status: 'concluida',
        responsibleName: 'Lucas Antunes',
        completed: true,
        completedAt: '2026-02-18T17:00:00.000Z',
      },
      {
        id: 'ck_302',
        label: 'Testar em 500 big bags na bancada 04',
        startDate: '2026-02-19',
        endDate: '2026-02-28',
        status: 'em_andamento',
        responsibleName: 'Lucas Antunes',
        completed: false,
      },
    ],
  },
  {
    id: 'act_004',
    protocol: 'RAF-2026-8804',
    tenantId: 'tenant_rafitec_01',
    title: 'Adequação de Fluxo de Resinas e Masterbatch na Extrusão',
    description: 'Sistema puxado com kanban de silos intermediários para evitar faltas de matéria-prima.',
    wasteCategory: 'transporte',
    originSectorId: 'sec_rafitec_logistica',
    originSectorName: 'Logística & Expedição',
    targetSectorId: 'sec_rafitec_extrusao',
    targetSectorName: 'Extrusão & Fiação PP',
    isPublicDemand: true,
    requesterName: 'Eduardo Santos (Almoxarifado)',
    assignedAgentId: 'usr_rafitec_agent_03',
    assignedAgentName: 'Roberto Rocha',
    assignedAgentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'aberta',
    priority: 'media',
    estimatedCostAvoided: 15000,
    actualCostAvoided: 0,
    hoursSaved: 0,
    createdAt: '2026-02-20T09:00:00.000Z',
    updatedAt: '2026-02-20T09:00:00.000Z',
    notes: [],
    checklist: [],
  },
];

export function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
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

  const currentTenantStr = localStorage.getItem(STORAGE_KEYS.CURRENT_TENANT);
  const currentUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  const tenantsStr = localStorage.getItem(STORAGE_KEYS.TENANTS);

  // If local storage has obsolete data (e.g. references to 'nexus' or old admin), auto-migrate to Rafitec
  const isStale =
    !currentTenantStr ||
    currentTenantStr.includes('nexus') ||
    !currentUserStr ||
    currentUserStr.includes('usr_admin_01') ||
    currentUserStr.includes('nexus') ||
    !tenantsStr ||
    tenantsStr.includes('nexus');

  if (isStale) {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, JSON.stringify(INITIAL_TENANT));
    localStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(INITIAL_SECTORS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(INITIAL_ACTIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    return;
  }

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
}

export { STORAGE_KEYS };
