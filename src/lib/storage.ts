import { Tenant, Sector, User, LeanAction, KaizenIdea, TpmMachine, TpmAudit, TpmTag } from './types';

export const STORAGE_KEYS = {
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
    leaderName: 'Fernanda Lima (Especialista Lean)',
    teamMembers: ['Carlos Silva (Operação)', 'Marcos Souza (Manutenção)', 'Juliana Mendes (Qualidade)'],
    status: 'concluida',
    priority: 'alta',
    
    // Metodologia PDCA
    pdcaStage: 'act',
    
    // P - PLAN
    problemStatement: 'O tempo de troca de matriz e lote na Extrusora 03 atingia média de 52 minutos, provocando degradação térmica do polipropileno no cabeçote e perda de 194 horas de produção por mês.',
    targetMetricName: 'Tempo de Troca de Matriz (SMED)',
    targetMetricUnit: 'minutos',
    baselineValue: 52,
    targetGoalValue: 15,
    currentProblemCostMonthly: 18500,
    fiveWhys: [
      '1. Por que a troca demorava 52 min? Porque a máquina ficava desligada enquanto se limpava e pré-aquecia o cabeçote.',
      '2. Por que o cabeçote era aquecido com a máquina parada? Porque não existia bancada externa de pré-aquecimento com controle PID.',
      '3. Por que não existia bancada externa? Porque o procedimento antigo considerava todo o processo como setup interno.',
      '4. Por que as ferramentas não estavam organizadas? Porque os operadores buscavam chaves e torquímetros no almoxarifado durante a parada.',
      '5. Causa Raiz: Ausência de metodologia SMED padronizada, falta de carrinho dedicado de ferramentas 5S e ausência de pré-aquecimento externo.'
    ],
    pareto: {
      chartImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      chartImageName: 'Pareto_Setup_Extrusora03.png',
      vitalCausesSummary: '82% do tempo improdutivo de setup é causado por 2 fatores vitais: 1. Limpeza e aquecimento térmico do cabeçote com máquina parada (48%) e 2. Procura e deslocamento para buscar ferramentas (34%).',
      cumulativeImpactPercentage: 82,
    },
    ishikawa: {
      method: 'Ausência de procedimento SMED separando setup interno de externo',
      machine: 'Extrusora sem engates rápidos pneumáticos e cabeçote sem aquecedor externo',
      material: 'Polímero PP degradando por parada térmica prolongada',
      manpower: 'Falta de treinamento dos operadores no padrão de troca rápida',
      measurement: 'Sem cronometragem analítica de cada microetapa da troca',
      environment: 'Área ao redor da extrusora com ferramentas dispersas',
    },

    // D - DO
    pilotArea: 'Extrusora de Fitas 03 - Linha A',
    pilotTestObservations: 'Realizados 3 testes piloto com cronoanálise de 2 câmeras. Tempo caiu de 52 para 16 minutos na primeira semana.',
    photoBeforeUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    photoAfterUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
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

    // C - CHECK & ENGENHARIA FINANCEIRA
    achievedValue: 16,
    projectCosts: {
      partsAndEquipment: 4800,
      thirdPartyServices: 1500,
      internalLaborHours: 52,
      laborHourlyRate: 45,
      otherCosts: 600,
      totalCost: 9240,
    },
    costBreakdown: {
      machineDowntime: 38000,
      laborSavings: 18200,
      scrapReduction: 12000,
      toolingAndEnergy: 6000,
    },
    estimatedCostAvoided: 65000,
    actualCostAvoided: 74200,
    netSavings: 64960,
    roiPercentage: 703,
    paybackMonths: 1.5,
    hoursSaved: 194,
    attachments: [
      {
        id: 'att_001_1',
        name: 'Memorial_Calculo_ROI_SMED_Extrusora03.pdf',
        sizeBytes: 1845000,
        sizeFormatted: '1.8 MB',
        fileType: 'application/pdf',
        uploadedAt: '2026-02-18T16:30:00.000Z',
        uploadedBy: 'Fernanda Lima',
        category: 'memorial_calculo',
        description: 'Memorial de cálculo detalhando 194h economizadas e redução de perda térmica da resina.',
      },
      {
        id: 'att_001_2',
        name: 'Evidencia_Antes_Depois_Setup_Matriz.pdf',
        sizeBytes: 2420000,
        sizeFormatted: '2.4 MB',
        fileType: 'application/pdf',
        uploadedAt: '2026-02-18T16:35:00.000Z',
        uploadedBy: 'Fernanda Lima',
        category: 'relatorio_tecnico',
        description: 'Fotos comparativas do carrinho 5S dedicado e estação externa de pré-aquecimento.',
      },
    ],

    // A - ACT
    standardWorkUpdated: true,
    standardWorkDocRef: 'POP-EXT-042 rev 03 (Troca Rápida de Matriz)',
    yokotenReplication: 'Replicar kit SMED e procedimento nas Extrusoras 01, 02 e 04 no ciclo seguinte',
    lessonsLearned: 'A preparação externa das ferramentas e pré-aquecimento do cabeçote garantiram 80% do ganho sem grandes investimentos de capital.',
    masterApproved: true,
    masterApprovedAt: '2026-02-18T17:00:00.000Z',
    masterApprovedBy: 'Rafitec',

    // Acompanhamento Trimestral de Ganhos Pós-Homologação (3 Meses)
    quarterlyFollowUp: {
      enabled: true,
      startedAt: '2026-02-18T17:00:00.000Z',
      month1: {
        monthNumber: 1,
        monthLabel: '1º Mês (Mar/26)',
        value: 82500,
        hoursSaved: 64,
        measuredAt: '2026-03-18',
        notes: 'Estabilidade mantida na troca de matriz. Tempo médio aferido em 16.5 min.',
        registeredBy: 'Fernanda Lima',
      },
      month2: {
        monthNumber: 2,
        monthLabel: '2º Mês (Abr/26)',
        value: 85200,
        hoursSaved: 66,
        measuredAt: '2026-04-18',
        notes: 'Equipe do turno B treinada no POP-EXT-042. Ganho de velocidade sem acidentes.',
        registeredBy: 'Fernanda Lima',
      },
      month3: {
        monthNumber: 3,
        monthLabel: '3º Mês (Mai/26)',
        value: 85200,
        hoursSaved: 65,
        measuredAt: '2026-05-18',
        notes: 'Terceiro mês consecutivo consolidado dentro da meta. Processo 100% estabilizado.',
        registeredBy: 'Fernanda Lima',
      },
      averageCostAvoided: 84300,
      isCompleted: true,
      completedAt: '2026-05-18T18:00:00.000Z',
      status: 'consolidado',
    },

    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: '2026-02-18T17:00:00.000Z',
    startedAt: '2026-02-02T09:00:00.000Z',
    completedAt: '2026-02-18T16:45:00.000Z',
    dueDate: '2026-02-20',
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
        authorName: 'Rafitec',
        authorRole: 'admin',
        text: 'Excelente ganho de OEE verificado na produção contínua. Custo evitado homologado pela gestão.',
        createdAt: '2026-02-18T17:00:00.000Z',
      },
    ],
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
    status: 'aguardando_aprovacao',
    priority: 'alta',
    submittedForApproval: true,
    submittedForApprovalAt: '2026-02-22T14:30:00.000Z',
    submittedForApprovalBy: 'Juliana Mendes',
    masterApproved: false,
    
    // Metodologia PDCA
    pdcaStage: 'check',
    problemStatement: 'Elevada frequência de microparadas por quebra de fita de urdume/trama, gerando defeitos no tecido tubular e perda de rendimento.',
    targetMetricName: 'Paradas por Quebra de Fita / Turno',
    targetMetricUnit: 'ocorrências',
    baselineValue: 42,
    targetGoalValue: 8,
    achievedValue: 6,
    pareto: {
      chartImageName: 'Pareto_Quebras_Fita_Tecelagem.png',
      vitalCausesSummary: '80% das quebras de fita ocorriam em apenas 2 pontos: 1. Atrito na gaiola de bobinas (52%) e 2. Variação de espessura na fita PP de urdume (28%).',
      cumulativeImpactPercentage: 80,
    },
    projectCosts: {
      partsAndEquipment: 3200,
      thirdPartyServices: 800,
      internalLaborHours: 35,
      laborHourlyRate: 45,
      otherCosts: 0,
      totalCost: 5575,
    },
    costBreakdown: {
      scrapReduction: 24500,
      machineDowntime: 18000,
      laborSavings: 6000,
    },
    estimatedCostAvoided: 42000,
    actualCostAvoided: 48500,
    netSavings: 42925,
    roiPercentage: 770,
    paybackMonths: 1.4,
    hoursSaved: 140,
    createdAt: '2026-02-05T10:15:00.000Z',
    updatedAt: '2026-02-22T14:30:00.000Z',
    startedAt: '2026-02-06T08:00:00.000Z',
    completedAt: '2026-02-22T14:00:00.000Z',
    dueDate: '2026-02-25',
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
    
    // Metodologia PDCA
    pdcaStage: 'do',
    problemStatement: 'Desalinhamento manual na costura de alças gerando retrabalho e risco de reprovação no teste de tração 6:1.',
    targetMetricName: 'Índice de Retrabalho em Alças',
    targetMetricUnit: '%',
    baselineValue: 4.8,
    targetGoalValue: 0.5,
    pilotArea: 'Bancada de Costura 04 - Acabamento',
    projectCosts: {
      partsAndEquipment: 1200,
      thirdPartyServices: 600,
      internalLaborHours: 20,
      laborHourlyRate: 45,
      totalCost: 2700,
    },
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
    
    // Metodologia PDCA
    pdcaStage: 'plan',
    problemStatement: 'Extrusoras param por falta pontual de masterbatch aditivo devido a reabastecimento empurrado não sincronizado.',
    targetMetricName: 'Paradas por Falta de Insumo',
    targetMetricUnit: 'paradas/mês',
    baselineValue: 8,
    targetGoalValue: 0,
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
  const actionsStr = localStorage.getItem(STORAGE_KEYS.ACTIONS);

  // If local storage has obsolete data, auto-migrate to Rafitec with full PDCA data
  const isStale =
    !currentTenantStr ||
    currentTenantStr.includes('nexus') ||
    !currentUserStr ||
    currentUserStr.includes('usr_admin_01') ||
    currentUserStr.includes('nexus') ||
    !tenantsStr ||
    tenantsStr.includes('nexus') ||
    !actionsStr ||
    !actionsStr.includes('pdcaStage') ||
    !actionsStr.includes('pareto') ||
    !actionsStr.includes('aguardando_aprovacao');

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
  if (!localStorage.getItem(STORAGE_KEYS.KAIZEN_IDEAS)) {
    localStorage.setItem(STORAGE_KEYS.KAIZEN_IDEAS, JSON.stringify(INITIAL_KAIZEN_IDEAS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TPM_MACHINES)) {
    localStorage.setItem(STORAGE_KEYS.TPM_MACHINES, JSON.stringify(INITIAL_TPM_MACHINES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TPM_AUDITS)) {
    localStorage.setItem(STORAGE_KEYS.TPM_AUDITS, JSON.stringify(INITIAL_TPM_AUDITS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TPM_TAGS)) {
    localStorage.setItem(STORAGE_KEYS.TPM_TAGS, JSON.stringify(INITIAL_TPM_TAGS));
  }
}

export const INITIAL_KAIZEN_IDEAS: KaizenIdea[] = [
  {
    id: 'kzn_001',
    protocol: 'KZN-2026-1001',
    tenantId: 'tenant_rafitec_01',
    authorName: 'Carlos Eduardo Silveira',
    sectorId: 'sec_rafitec_extrusao',
    sectorName: 'Extrusão & Fiação PP',
    authorRoleTitle: 'Operador de Extrusora I',
    summary: 'Instalação de espelho retrovisor angular no cabeçote da Extrusora 02 para visualizar o acúmulo de borra sem precisar subir na passarela com a máquina em alta velocidade.',
    photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
    photoName: 'cabecote_extrusora_espelho.jpg',
    createdAt: '2026-02-12T09:15:00.000Z',
    updatedAt: '2026-02-14T15:30:00.000Z',
    status: 'aprovada',
    reviewedBy: 'Rafitec Supervisor',
    reviewedAt: '2026-02-14T15:30:00.000Z',
    responsibleName: 'Juliana Mendes',
    assignedAgentId: 'usr_rafitec_agent_02',
    executionStatus: 'implantada_sucesso',
    implementationDate: '2026-02-20',
    estimatedCostAvoided: 12000,
    actualCostAvoided: 14500,
    hoursSaved: 38,
    financialGainNotes: 'Evitou paradas de linha para verificação manual e eliminou risco ergonômico na subida de passarela.',

    // PDCA Completo da Ideia
    pdcaStage: 'act',
    targetMetricName: 'Tempo de Verificação & Paradas por Borra',
    targetMetricUnit: 'min/dia',
    baselineValue: 42,
    targetGoalValue: 8,
    achievedValue: 5,
    rootCauseAnalysis: 'O operador precisava parar a linha ou subir com escada/passarela para checar visualmente se havia borra na fieira.',
    fiveWhys: [
      'Por que a linha parava com frequência? Para verificar visualmente o acúmulo de borra.',
      'Por que precisava parar para verificar? Porque o ângulo da fieira não permitia visão direta do chão.',
      'Por que não havia visão direta? O cabeçote é posicionado para baixo e coberto pela calha.',
      'Por que não havia espelho ou câmera? Não havia sido projetado dispositivo visual angular no setup original.',
      'Causa raiz: Falha de gestão visual direta do ponto de operação sem risco ergonômico.',
    ],
    checklist: [
      { id: 'chk_1', label: 'Desenhar suporte angular ajustável para espelho convexo', completed: true, responsibleName: 'Carlos Silveira', startDate: '2026-02-15', endDate: '2026-02-16' },
      { id: 'chk_2', label: 'Usinar e montar suporte magnético na carcaça da Extrusora 02', completed: true, responsibleName: 'Manutenção', startDate: '2026-02-17', endDate: '2026-02-18' },
      { id: 'chk_3', label: 'Testar visibilidade com a linha em 350 m/min', completed: true, responsibleName: 'Juliana Mendes', startDate: '2026-02-19', endDate: '2026-02-19' },
      { id: 'chk_4', label: 'Elaborar Lição Ponto a Ponto (LPP) para operadores de turno', completed: true, responsibleName: 'Juliana Mendes', startDate: '2026-02-20', endDate: '2026-02-20' },
    ],
    pilotArea: 'Extrusora 02 - Posto de Matriz & Cabeçote',
    pilotTestObservations: 'O espelho permitiu identificar o início de borra 15 minutos antes de rasgar a fita, evitando 100% das paradas emergenciais de turno.',
    evidenceBeforeUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
    evidenceAfterUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    costBreakdown: {
      machineDowntime: 9500,
      scrapReduction: 3500,
      laborSavings: 1500,
    },
    standardWorkUpdated: true,
    standardWorkDocRef: 'POP-EXT-018 rev 02',
    yokotenReplication: 'Aprovada replicação para as Extrusoras 01, 03 e 04 no plano de manutenção mensal.',
    lessonsLearned: 'Pequenas soluções de baixo custo de gestão visual têm impacto imediato na produtividade e segurança do operador.',
    masterApproved: true,
    masterApprovedAt: '2026-02-20T16:00:00.000Z',
    masterApprovedBy: 'Rafitec Supervisor',
    quarterlyFollowUp: {
      enabled: true,
      startedAt: '2026-02-20T16:00:00.000Z',
      month1: {
        monthNumber: 1,
        monthLabel: '1º Mês',
        value: 14200,
        hoursSaved: 36,
        measuredAt: '2026-03-20',
        registeredBy: 'Juliana Mendes',
        notes: 'Operação perfeitamente estável com o espelho.',
      },
      month2: {
        monthNumber: 2,
        monthLabel: '2º Mês',
        value: 14800,
        hoursSaved: 40,
        measuredAt: '2026-04-20',
        registeredBy: 'Juliana Mendes',
        notes: 'Zero paradas registradas por borra no período.',
      },
      month3: {
        monthNumber: 3,
        monthLabel: '3º Mês',
        value: 14500,
        hoursSaved: 38,
        measuredAt: '2026-05-20',
        registeredBy: 'Juliana Mendes',
        notes: 'Ciclo fechado com sucesso.',
      },
      averageCostAvoided: 14500,
      isCompleted: true,
      status: 'consolidado',
    },
  },
  {
    id: 'kzn_002',
    protocol: 'KZN-2026-1002',
    tenantId: 'tenant_rafitec_01',
    authorName: 'Aline Ferreira da Silva',
    sectorId: 'sec_rafitec_acabamento',
    sectorName: 'Corte, Costura & Big Bags',
    authorRoleTitle: 'Costureira Industrial',
    summary: 'Dispositivo guia magnético com régua de marcação na bancada de costura de alças, evitando medir cada alça com fita métrica individual.',
    photoUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
    photoName: 'guia_magnetico_bancada.jpg',
    createdAt: '2026-02-22T11:40:00.000Z',
    updatedAt: '2026-02-23T08:20:00.000Z',
    status: 'aprovada',
    reviewedBy: 'Rafitec Supervisor',
    reviewedAt: '2026-02-23T08:20:00.000Z',
    responsibleName: 'Lucas Antunes',
    assignedAgentId: 'usr_rafitec_agent_05',
    executionStatus: 'em_implantacao',
    implementationDate: '2026-03-05',
    estimatedCostAvoided: 18000,
    actualCostAvoided: 0,
    hoursSaved: 45,
    financialGainNotes: 'Redução estimada de 3 segundos por big bag costurado.',

    // PDCA em andamento (DO)
    pdcaStage: 'do',
    targetMetricName: 'Tempo de Pega & Costura de Alça',
    targetMetricUnit: 'segundos/alça',
    baselineValue: 14,
    targetGoalValue: 8,
    rootCauseAnalysis: 'A costureira precisa soltar o tecido, pegar a fita métrica manual, marcar com giz e costurar.',
    fiveWhys: [
      'Por que o tempo de costura oscila? Porque a medição é manual.',
      'Por que é manual? Não há limitador de parada de comprimento na mesa.',
      'Causa raiz: Falha de gabaritagem rápida na bancada de trabalho.',
    ],
    checklist: [
      { id: 'chk_1', label: 'Comprar réguas magnéticas milimetradas flexíveis', completed: true, responsibleName: 'Lucas Antunes', startDate: '2026-02-24', endDate: '2026-02-26' },
      { id: 'chk_2', label: 'Instalar gabarito na Bancada Piloto 04', completed: true, responsibleName: 'Lucas Antunes', startDate: '2026-02-27', endDate: '2026-02-28' },
      { id: 'chk_3', label: 'Treinar as 4 costureiras da célula piloto', completed: false, responsibleName: 'Aline Silva', startDate: '2026-03-01', endDate: '2026-03-03' },
    ],
    pilotArea: 'Célula de Costura 04 - Bancada de Alças',
    costBreakdown: {
      laborSavings: 18000,
    },
  },
  {
    id: 'kzn_003',
    protocol: 'KZN-2026-1003',
    tenantId: 'tenant_rafitec_01',
    authorName: 'Renato Batista dos Santos',
    sectorId: 'sec_rafitec_logistica',
    sectorName: 'Logística & Expedição',
    authorRoleTitle: 'Auxiliar de Almoxarifado',
    summary: 'Padronização visual com etiquetas coloridas nas bobinas de fio PP prontas para embarque, diferenciando gramatura por cor de longe.',
    photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
    photoName: 'etiquetas_coloridas_bobinas.jpg',
    createdAt: '2026-02-25T14:10:00.000Z',
    updatedAt: '2026-02-25T14:10:00.000Z',
    status: 'pendente',
  },
];

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
    currentAuditScore: 92,
    lastAuditDate: '2026-02-20T10:00:00.000Z',
    tpmPhase: 2,
    tpmPhaseHistory: [
      { phase: 2, achievedAt: '2026-02-10T10:00:00.000Z', auditScore: 100 }
    ],
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
    currentAuditScore: 86,
    lastAuditDate: '2026-02-18T14:30:00.000Z',
    tpmPhase: 1,
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
    currentAuditScore: 78,
    lastAuditDate: '2026-02-15T11:00:00.000Z',
    tpmPhase: 1,
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
    status: 'em_manutencao',
    currentAuditScore: 68,
    lastAuditDate: '2026-02-22T16:00:00.000Z',
    tpmPhase: 1,
    description: 'Tear circular de alta velocidade com parada programada para substituição de contator.',
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
    currentAuditScore: 94,
    lastAuditDate: '2026-02-24T09:30:00.000Z',
    tpmPhase: 3,
    tpmPhaseHistory: [
      { phase: 2, achievedAt: '2026-01-28T14:00:00.000Z', auditScore: 100 },
      { phase: 3, achievedAt: '2026-02-24T09:30:00.000Z', auditScore: 100 }
    ],
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
    currentAuditScore: 84,
    lastAuditDate: '2026-02-19T15:00:00.000Z',
    tpmPhase: 1,
    description: 'Corte transversal térmico automático para confecção de corpo de Big Bags.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
];

export const INITIAL_TPM_AUDITS: TpmAudit[] = [
  {
    id: 'adt_001',
    tenantId: 'tenant_rafitec_01',
    machineId: 'mach_lam_01',
    machineName: 'Linha de Laminação Extrusora 01',
    machineCode: 'LAM-01',
    sectorId: 'sec_rafitec_laminacao',
    sectorName: 'Laminação & Revestimento',
    auditorName: 'Fernanda Lima (Especialista TPM)',
    auditDate: '2026-02-24T09:30:00.000Z',
    score: 94,
    status: 'conforme',
    items: [
      { id: 'item_1', title: '1. Limpeza & 5S Básico', description: 'Estrutura, esteiras e cilindros isentos de pó de polímero e sujeira.', score: 100, status: 'conforme' },
      { id: 'item_2', title: '2. Lubrificação & Níveis de Óleo', description: 'Visores de nível no centro da faixa verde, graxeiras limpas e abastecidas.', score: 100, status: 'conforme' },
      { id: 'item_3', title: '3. Fixações & Ausência de Folgas', description: 'Parafusos dos mancais com torque conferido e sem vibração anômala.', score: 100, status: 'conforme' },
      { id: 'item_4', title: '4. Segurança & Proteções NR-12', description: 'Cortinas de luz, sensores de porta e botões de emergência atuando 100%.', score: 100, status: 'conforme' },
      { id: 'item_5', title: '5. Identificação Visual & Padrões', description: 'Etiquetas de lubrificação e sentidos de giro legíveis.', score: 100, status: 'conforme' },
      { id: 'item_6', title: '6. Condições Elétricas & Cabos', description: 'Painéis com fecho acionado e cabos devidamente calafetados.', score: 100, status: 'conforme' },
      { id: 'item_7', title: '7. Estanqueidade (Zero Vazamentos)', description: 'Pequena umidade de óleo hidráulico próximo ao bloco de válvulas B.', score: 50, status: 'parcial', notes: 'Gera etiqueta azul para limpeza e aperto de conexão.' },
      { id: 'item_8', title: '8. Quadro de Manutenção Autônoma', description: 'Checklist diário do operador 100% preenchido e assinado.', score: 100, status: 'conforme' },
    ],
    observations: 'Excelente estado de conservação. Posto exemplar no setor de Laminação.',
    createdAt: '2026-02-24T09:30:00.000Z',
  },
  {
    id: 'adt_002',
    tenantId: 'tenant_rafitec_01',
    machineId: 'mach_ext_01',
    machineName: 'Extrusora de Fita Plana 01',
    machineCode: 'EXT-01',
    sectorId: 'sec_rafitec_extrusao',
    sectorName: 'Extrusão & Fiação PP',
    auditorName: 'Marcos Souza (Engenharia de Manutenção)',
    auditDate: '2026-02-20T10:00:00.000Z',
    score: 92,
    status: 'conforme',
    items: [
      { id: 'item_1', title: '1. Limpeza & 5S Básico', description: 'Isento de borras e resíduos de purga.', score: 100, status: 'conforme' },
      { id: 'item_2', title: '2. Lubrificação & Níveis de Óleo', description: 'Redutor principal com nível adequado de óleo sintético.', score: 100, status: 'conforme' },
      { id: 'item_3', title: '3. Fixações & Ausência de Folgas', description: 'Base do canhão e estiramento firmes.', score: 100, status: 'conforme' },
      { id: 'item_4', title: '4. Segurança & Proteções NR-12', description: 'Proteção mecânica do cabeçote e travas de segurança em dia.', score: 100, status: 'conforme' },
      { id: 'item_5', title: '5. Identificação Visual & Padrões', description: 'Manômetros com faixa verde de pressão de massa visível.', score: 100, status: 'conforme' },
      { id: 'item_6', title: '6. Condições Elétricas & Cabos', description: 'Resistências elétricas com fiação íntegra e isolada.', score: 100, status: 'conforme' },
      { id: 'item_7', title: '7. Estanqueidade (Zero Vazamentos)', description: 'Sem vazamento de água de resfriamento na banheira.', score: 100, status: 'conforme' },
      { id: 'item_8', title: '8. Quadro de Manutenção Autônoma', description: 'Um dia pendente de preenchimento na troca de turno.', score: 50, status: 'parcial' },
    ],
    observations: 'Equipamento bem cuidado pela equipe autônoma. Pequeno alinhamento de rotina com operadores da noite.',
    createdAt: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'adt_003',
    tenantId: 'tenant_rafitec_01',
    machineId: 'mach_tec_02',
    machineName: 'Tear Circular 12',
    machineCode: 'TEC-12',
    sectorId: 'sec_rafitec_tecelagem',
    sectorName: 'Tecelagem Circular & Planos',
    auditorName: 'Carlos Silva (Facilitador Lean)',
    auditDate: '2026-02-22T16:00:00.000Z',
    score: 68,
    status: 'critico',
    items: [
      { id: 'item_1', title: '1. Limpeza & 5S Básico', description: 'Acúmulo de penugem de fita PP no anel de tecimento e carretéis.', score: 50, status: 'parcial' },
      { id: 'item_2', title: '2. Lubrificação & Níveis de Óleo', description: 'Falta de lubrificação na pista dos roletes de arraste.', score: 0, status: 'nao_conforme' },
      { id: 'item_3', title: '3. Fixações & Ausência de Folgas', description: 'Folga perceptível na lançadeira nº 3.', score: 50, status: 'parcial' },
      { id: 'item_4', title: '4. Segurança & Proteções NR-12', description: 'Sensor de quebra de urdume operando.', score: 100, status: 'conforme' },
      { id: 'item_5', title: '5. Identificação Visual & Padrões', description: 'Etiqueta de lubrificação desbotada.', score: 50, status: 'parcial' },
      { id: 'item_6', title: '6. Condições Elétricas & Cabos', description: 'Contator principal aquecendo acima da temperatura normal.', score: 0, status: 'nao_conforme', notes: 'Aberta Etiqueta Vermelha crítica para manutenção elétrica.' },
      { id: 'item_7', title: '7. Estanqueidade (Zero Vazamentos)', description: 'Ar comprimido com pequeno chiado na conexão do freio.', score: 50, status: 'parcial' },
      { id: 'item_8', title: '8. Quadro de Manutenção Autônoma', description: 'Quadro desatualizado há 3 dias.', score: 0, status: 'nao_conforme' },
    ],
    observations: 'Necessária intervenção imediata de manutenção elétrica e plano de limpeza autônoma com a equipe.',
    createdAt: '2026-02-22T16:00:00.000Z',
  },
];

export const INITIAL_TPM_TAGS: TpmTag[] = [
  {
    id: 'tag_001',
    tenantId: 'tenant_rafitec_01',
    tagNumber: 'ETQ-2026-001',
    machineId: 'mach_tec_02',
    machineName: 'Tear Circular 12',
    machineCode: 'TEC-12',
    sectorId: 'sec_rafitec_tecelagem',
    sectorName: 'Tecelagem Circular & Planos',
    type: 'vermelha',
    category: 'eletrica',
    priority: 'critica',
    description: 'Substituição do contator de partida do motor principal no painel de comando por aquecimento excessivo.',
    openedBy: 'Carlos Silva (Facilitador Lean)',
    openedAt: '2026-02-22T16:15:00.000Z',
    dueDate: '2026-02-24T18:00:00.000Z',
    status: 'em_andamento',
    createdAt: '2026-02-22T16:15:00.000Z',
  },
  {
    id: 'tag_002',
    tenantId: 'tenant_rafitec_01',
    tagNumber: 'ETQ-2026-002',
    machineId: 'mach_ext_01',
    machineName: 'Extrusora de Fita Plana 01',
    machineCode: 'EXT-01',
    sectorId: 'sec_rafitec_extrusao',
    sectorName: 'Extrusão & Fiação PP',
    type: 'vermelha',
    category: 'pneumatica_hidraulica',
    priority: 'alta',
    description: 'Troca do retentor do cilindro hidráulico de fechamento da matriz de corte.',
    openedBy: 'Marcos Souza',
    openedAt: '2026-02-10T08:00:00.000Z',
    dueDate: '2026-02-14T17:00:00.000Z',
    status: 'concluida',
    resolvedAt: '2026-02-13T16:20:00.000Z',
    resolvedBy: 'Equipe de Manutenção Mecânica',
    solutionNotes: 'Retentor substituído e matriz limpa. Teste de estanqueidade realizado com sucesso.',
    createdAt: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'tag_003',
    tenantId: 'tenant_rafitec_01',
    tagNumber: 'ETQ-2026-003',
    machineId: 'mach_tec_01',
    machineName: 'Tear Circular 04',
    machineCode: 'TEC-04',
    sectorId: 'sec_rafitec_tecelagem',
    sectorName: 'Tecelagem Circular & Planos',
    type: 'azul',
    category: 'mecanica',
    priority: 'media',
    description: 'Reaperto de parafusos da guia lateral de alimentação de fita e alinhamento do anel guia.',
    openedBy: 'João Paulo (Operador)',
    openedAt: '2026-02-12T10:00:00.000Z',
    dueDate: '2026-02-16T12:00:00.000Z',
    status: 'concluida',
    resolvedAt: '2026-02-14T11:00:00.000Z',
    resolvedBy: 'Operação Autônoma - Turno A',
    solutionNotes: 'Aperto realizado com chave allen 6mm e trava-rosca média aplicada.',
    createdAt: '2026-02-12T10:00:00.000Z',
  },
  {
    id: 'tag_004',
    tenantId: 'tenant_rafitec_01',
    tagNumber: 'ETQ-2026-004',
    machineId: 'mach_lam_01',
    machineName: 'Linha de Laminação Extrusora 01',
    machineCode: 'LAM-01',
    sectorId: 'sec_rafitec_laminacao',
    sectorName: 'Laminação & Revestimento',
    type: 'azul',
    category: 'lubrificacao',
    priority: 'baixa',
    description: 'Limpeza e reaperto da conexão do visor de nível de óleo do cabeçote aplicador.',
    openedBy: 'Fernanda Lima (Auditora TPM)',
    openedAt: '2026-02-24T10:00:00.000Z',
    dueDate: '2026-02-28T18:00:00.000Z',
    status: 'aberta',
    createdAt: '2026-02-24T10:00:00.000Z',
  },
  {
    id: 'tag_005',
    tenantId: 'tenant_rafitec_01',
    tagNumber: 'ETQ-2026-005',
    machineId: 'mach_ext_02',
    machineName: 'Extrusora de Fita Plana 02',
    machineCode: 'EXT-02',
    sectorId: 'sec_rafitec_extrusao',
    sectorName: 'Extrusão & Fiação PP',
    type: 'vermelha',
    category: 'mecanica',
    priority: 'alta',
    description: 'Inspeção do rolamento do fuso da zona de alimentação devido a ruído leve durante carga máxima.',
    openedBy: 'Juliana Mendes (Agente Lean)',
    openedAt: '2026-02-15T09:00:00.000Z',
    dueDate: '2026-02-20T17:00:00.000Z',
    status: 'aberta',
    createdAt: '2026-02-15T09:00:00.000Z',
  },
  {
    id: 'tag_006',
    tenantId: 'tenant_rafitec_01',
    tagNumber: 'ETQ-2026-006',
    machineId: 'mach_acab_01',
    machineName: 'Máquina Automática de Corte a Quente',
    machineCode: 'CORTE-01',
    sectorId: 'sec_rafitec_acabamento',
    sectorName: 'Corte, Costura & Big Bags',
    type: 'azul',
    category: 'limpeza_5s',
    priority: 'media',
    description: 'Remoção de película de polímero carbonizado acumulada na lâmina de corte.',
    openedBy: 'Antônio Ferreira',
    openedAt: '2026-02-05T14:00:00.000Z',
    dueDate: '2026-02-08T18:00:00.000Z',
    status: 'concluida',
    resolvedAt: '2026-02-10T09:30:00.000Z',
    resolvedBy: 'Equipe de Acabamento',
    solutionNotes: 'Lâmina descarbonizada com escova de latão e produto desengraxante.',
    createdAt: '2026-02-05T14:00:00.000Z',
  },
];
