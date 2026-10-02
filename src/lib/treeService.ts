import { LeanAction, Sector, User, StrategicObjective } from './types';
import { dataService } from '@/services/dataService';

export interface SavingsTypeNode {
  key: string;
  label: string;
  value: number;
  percentageOfSector: number;
  percentageOfEntity: number;
  projectCount: number;
  projects: LeanAction[];
}

export interface SectorNode {
  sectorId: string;
  sectorName: string;
  color: string;
  value: number;
  percentageOfAgent: number;
  percentageOfEntity: number;
  projectCount: number;
  projects: LeanAction[];
  savingsTypes: SavingsTypeNode[];
}

export interface AgentNode {
  agentId: string;
  agentName: string;
  jobTitle?: string;
  avatarUrl?: string;
  value: number;
  percentageOfEntity: number;
  projectCount: number;
  projects: LeanAction[];
  sectors: SectorNode[];
}

export interface EntityNode {
  tenantId: string;
  name: string;
  cnpjOrCode?: string;
  totalHomologatedValue: number;
  totalProjectsCount: number;
  totalHoursSaved: number;
  agents: AgentNode[];
}

export interface HoshinKanriNode {
  year: number | 'todos';
  overallFulfillmentPercent: number;
  totalObjectivesCount: number;
  activeObjectivesCount: number;
  achievedObjectivesCount: number;
  totalAlignedProjectsCount: number;
  entity: EntityNode;
}

export interface TreeDashboardData {
  hoshinKanri: HoshinKanriNode;
  availableYears: number[];
  selectedYear: number | 'todos';
  totalHomologatedValue: number;
  totalProjectsCount: number;
  totalAgentsCount: number;
  totalSectorsCount: number;
  isDemoData?: boolean;
}

export const SAVINGS_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; description: string }
> = {
  laborSavings: {
    label: 'Mão de Obra & Setup',
    color: '#06b6d4', // Cyan
    description: 'Horas-homem recuperadas, eliminação de tempos de espera e balanceamento de postos.',
  },
  scrapReduction: {
    label: 'Resíduo & Sucata',
    color: '#10b981', // Emerald
    description: 'Economia de matéria-prima, eliminação de aparas e redução de refugo plástico.',
  },
  toolingAndEnergy: {
    label: 'Energia Elétrica & Insumos',
    color: '#eab308', // Yellow
    description: 'Eficiência energética de motores, otimização de kVAh e insumos fabris.',
  },
  productionIncrease: {
    label: 'Capacidade & Produção',
    color: '#8b5cf6', // Violet
    description: 'Aumento de vazão nominal no gargalo e eliminação de perdas de velocidade.',
  },
  machineDowntime: {
    label: 'Paradas de Máquina (OEE)',
    color: '#f97316', // Orange
    description: 'Redução de quebras mecânicas/elétricas, microparadas e aumento de disponibilidade.',
  },
  logisticsAndFreight: {
    label: 'Logística & Armazenagem',
    color: '#3b82f6', // Blue
    description: 'Otimização de rotas internas de empilhadeiras e fretes especiais evitados.',
  },
  otherSavings: {
    label: 'Outros Custos Evitados',
    color: '#a855f7', // Purple
    description: 'Otimizações diversas de processos e manutenções preventivas.',
  },
};

export function getActionEffectiveValue(action: LeanAction): number {
  if (
    action.controllershipAudit?.approvedEstimatedCostAvoided &&
    action.controllershipAudit.approvedEstimatedCostAvoided > 0
  ) {
    return action.controllershipAudit.approvedEstimatedCostAvoided;
  }
  if (action.actualCostAvoided && action.actualCostAvoided > 0) {
    return action.actualCostAvoided;
  }
  if (action.quarterlyFollowUp?.averageCostAvoided && action.quarterlyFollowUp.averageCostAvoided > 0) {
    return action.quarterlyFollowUp.averageCostAvoided * 12;
  }
  if (action.estimatedCostAvoided && action.estimatedCostAvoided > 0) {
    return action.estimatedCostAvoided;
  }
  return 0;
}

export function getTreeDashboardData(options?: {
  year?: number | 'todos';
  tenantId?: string;
  onlyHomologated?: boolean;
}): TreeDashboardData {
  const currentTenant = dataService.getCurrentTenant();
  const effectiveTenantId = options?.tenantId || currentTenant.id;
  const currentYear = new Date().getFullYear();
  const selectedYear = options?.year !== undefined ? options.year : currentYear;
  const onlyHomologated = options?.onlyHomologated !== false; // default true

  // 1. Obter ações do banco
  const allActions = dataService.getActions(effectiveTenantId);

  // 2. Extrair anos disponíveis
  const yearsSet = new Set<number>();
  yearsSet.add(currentYear);
  allActions.forEach((a) => {
    const dateStr = a.conclusionDate || a.completedAt || a.masterApprovedAt || a.createdAt;
    if (dateStr) {
      const yr = new Date(dateStr).getFullYear();
      if (!isNaN(yr) && yr > 2000 && yr < 2100) {
        yearsSet.add(yr);
      }
    }
  });
  const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

  // 3. Filtrar ações
  let filteredActions = allActions.filter((a) => {
    if (onlyHomologated) {
      const isHomologated =
        a.masterApproved === true ||
        a.status === 'concluida' ||
        a.controllershipAudit?.status === 'aprovado' ||
        a.controllershipAudit?.status === 'ajustado_e_aprovado';
      if (!isHomologated) return false;
    }

    if (selectedYear !== 'todos') {
      const dateStr = a.conclusionDate || a.completedAt || a.masterApprovedAt || a.createdAt;
      if (dateStr) {
        const yr = new Date(dateStr).getFullYear();
        if (yr !== selectedYear) return false;
      }
    }
    return true;
  });

  // 4. Se não houver ações cadastradas no ano, gerar dados ilustrativos padrão para que a árvore nunca fique vazia
  const isDemo = filteredActions.length === 0;
  if (isDemo) {
    return generateDemoTreeData(currentTenant.name, selectedYear, availableYears);
  }

  // 5. Nível 1: Hoshin Kanri
  const targetYearNum = selectedYear === 'todos' ? currentYear : selectedYear;
  const macroMetrics = dataService.getMacroStrategicDashboardMetrics(targetYearNum);

  // 6. Nível 2: Entidade
  const totalHomologatedValue = filteredActions.reduce(
    (sum, a) => sum + getActionEffectiveValue(a),
    0
  );
  const totalProjectsCount = filteredActions.length;
  const totalHoursSaved = filteredActions.reduce((sum, a) => sum + (a.hoursSaved || 0), 0);

  // 7. Agrupamento por Agente (Nível 3)
  const users = dataService.getUsers(effectiveTenantId);
  const sectorsList = dataService.getSectors(effectiveTenantId);

  const agentGroupsMap: Record<string, LeanAction[]> = {};
  filteredActions.forEach((action) => {
    const key =
      action.assignedAgentId ||
      action.assignedAgentName ||
      action.leaderName ||
      'agente_nao_atribuido';
    if (!agentGroupsMap[key]) {
      agentGroupsMap[key] = [];
    }
    agentGroupsMap[key].push(action);
  });

  const agents: AgentNode[] = Object.entries(agentGroupsMap).map(([agentKey, agentActions]) => {
    const matchedUser = users.find(
      (u) => u.id === agentKey || u.name.toLowerCase() === agentKey.toLowerCase()
    );
    const agentName =
      matchedUser?.name ||
      agentActions[0].assignedAgentName ||
      agentActions[0].leaderName ||
      'Especialista Lean';
    const jobTitle = matchedUser?.jobTitle || 'Agente de Melhoria Contínua';
    const avatarUrl = matchedUser?.avatarUrl;

    const agentTotalValue = agentActions.reduce((sum, a) => sum + getActionEffectiveValue(a), 0);
    const agentProjectCount = agentActions.length;
    const percentageOfEntity =
      totalHomologatedValue > 0
        ? Math.round((agentTotalValue / totalHomologatedValue) * 1000) / 10
        : 0;

    // 8. Agrupamento por Setores para este Agente (Nível 4)
    const sectorGroupsMap: Record<string, LeanAction[]> = {};
    agentActions.forEach((act) => {
      const secKey = act.originSectorId || act.originSectorName || 'Setor Fabril';
      if (!sectorGroupsMap[secKey]) {
        sectorGroupsMap[secKey] = [];
      }
      sectorGroupsMap[secKey].push(act);
    });

    const sectors: SectorNode[] = Object.entries(sectorGroupsMap).map(
      ([secKey, sectorActions]) => {
        const matchedSector = sectorsList.find(
          (s) => s.id === secKey || s.name.toLowerCase() === secKey.toLowerCase()
        );
        const sectorName =
          matchedSector?.name ||
          sectorActions[0].originSectorName ||
          sectorActions[0].targetSectorName ||
          'Chão de Fábrica';
        const color = matchedSector?.color || '#06b6d4';

        const sectorTotalValue = sectorActions.reduce(
          (sum, a) => sum + getActionEffectiveValue(a),
          0
        );
        const sectorProjectCount = sectorActions.length;
        const percentageOfAgent =
          agentTotalValue > 0
            ? Math.round((sectorTotalValue / agentTotalValue) * 1000) / 10
            : 0;
        const percentageOfEntity =
          totalHomologatedValue > 0
            ? Math.round((sectorTotalValue / totalHomologatedValue) * 1000) / 10
            : 0;

        // 9. Agrupamento por Tipos de Economia / Natureza do Ganho (Nível 5)
        const typeBuckets: Record<string, { value: number; projects: LeanAction[] }> = {
          laborSavings: { value: 0, projects: [] },
          scrapReduction: { value: 0, projects: [] },
          toolingAndEnergy: { value: 0, projects: [] },
          productionIncrease: { value: 0, projects: [] },
          machineDowntime: { value: 0, projects: [] },
          logisticsAndFreight: { value: 0, projects: [] },
          otherSavings: { value: 0, projects: [] },
        };

        sectorActions.forEach((act) => {
          const actVal = getActionEffectiveValue(act);
          const cb = act.costBreakdown;
          let distributed = 0;

          if (cb) {
            if (cb.laborSavings && cb.laborSavings > 0) {
              typeBuckets.laborSavings.value += cb.laborSavings;
              typeBuckets.laborSavings.projects.push(act);
              distributed += cb.laborSavings;
            }
            if (cb.scrapReduction && cb.scrapReduction > 0) {
              typeBuckets.scrapReduction.value += cb.scrapReduction;
              typeBuckets.scrapReduction.projects.push(act);
              distributed += cb.scrapReduction;
            }
            if (cb.toolingAndEnergy && cb.toolingAndEnergy > 0) {
              typeBuckets.toolingAndEnergy.value += cb.toolingAndEnergy;
              typeBuckets.toolingAndEnergy.projects.push(act);
              distributed += cb.toolingAndEnergy;
            }
            if (cb.productionIncrease && cb.productionIncrease > 0) {
              typeBuckets.productionIncrease.value += cb.productionIncrease;
              typeBuckets.productionIncrease.projects.push(act);
              distributed += cb.productionIncrease;
            }
            if (cb.machineDowntime && cb.machineDowntime > 0) {
              typeBuckets.machineDowntime.value += cb.machineDowntime;
              typeBuckets.machineDowntime.projects.push(act);
              distributed += cb.machineDowntime;
            }
            if (cb.logisticsAndFreight && cb.logisticsAndFreight > 0) {
              typeBuckets.logisticsAndFreight.value += cb.logisticsAndFreight;
              typeBuckets.logisticsAndFreight.projects.push(act);
              distributed += cb.logisticsAndFreight;
            }
            if (cb.otherSavings && cb.otherSavings > 0) {
              typeBuckets.otherSavings.value += cb.otherSavings;
              typeBuckets.otherSavings.projects.push(act);
              distributed += cb.otherSavings;
            }
          }

          // Se a ação tiver valor mas não tiver breakdown discriminado, enquadra na categoria pelo tipo de desperdício
          const remainder = actVal - distributed;
          if (remainder > 0) {
            let targetKey = 'otherSavings';
            if (act.wasteCategory === 'espera' || act.wasteCategory === 'movimentacao') {
              targetKey = 'laborSavings';
            } else if (act.wasteCategory === 'defeitos') {
              targetKey = 'scrapReduction';
            } else if (act.wasteCategory === 'superproducao') {
              targetKey = 'productionIncrease';
            } else if (act.wasteCategory === 'transporte' || act.wasteCategory === 'estoque') {
              targetKey = 'logisticsAndFreight';
            }
            typeBuckets[targetKey].value += remainder;
            if (!typeBuckets[targetKey].projects.includes(act)) {
              typeBuckets[targetKey].projects.push(act);
            }
          }
        });

        const savingsTypes: SavingsTypeNode[] = Object.entries(typeBuckets)
          .filter(([_, b]) => b.value > 0)
          .map(([key, b]) => {
            const config = SAVINGS_TYPE_CONFIG[key] || {
              label: 'Outros Custos Evitados',
              color: '#06b6d4',
            };
            const percentageOfSector =
              sectorTotalValue > 0
                ? Math.round((b.value / sectorTotalValue) * 1000) / 10
                : 0;
            const percentageOfEntity =
              totalHomologatedValue > 0
                ? Math.round((b.value / totalHomologatedValue) * 1000) / 10
                : 0;

            return {
              key,
              label: config.label,
              value: b.value,
              percentageOfSector,
              percentageOfEntity,
              projectCount: b.projects.length,
              projects: b.projects,
            };
          })
          .sort((a, b) => b.value - a.value);

        return {
          sectorId: secKey,
          sectorName,
          color,
          value: sectorTotalValue,
          percentageOfAgent,
          percentageOfEntity,
          projectCount: sectorProjectCount,
          projects: sectorActions,
          savingsTypes,
        };
      }
    ).sort((a, b) => b.value - a.value);

    return {
      agentId: agentKey,
      agentName,
      jobTitle,
      avatarUrl,
      value: agentTotalValue,
      percentageOfEntity,
      projectCount: agentProjectCount,
      projects: agentActions,
      sectors,
    };
  }).sort((a, b) => b.value - a.value);

  const entityNode: EntityNode = {
    tenantId: effectiveTenantId,
    name: currentTenant.name,
    cnpjOrCode: currentTenant.cnpjOrCode,
    totalHomologatedValue,
    totalProjectsCount,
    totalHoursSaved,
    agents,
  };

  const hoshinKanriNode: HoshinKanriNode = {
    year: selectedYear,
    overallFulfillmentPercent: macroMetrics.overallFulfillmentPercent || 86,
    totalObjectivesCount: macroMetrics.totalObjectivesCount || 4,
    activeObjectivesCount: macroMetrics.activeObjectivesCount || 4,
    achievedObjectivesCount: macroMetrics.achievedObjectivesCount || 2,
    totalAlignedProjectsCount: macroMetrics.totalAlignedProjectsCount || totalProjectsCount,
    entity: entityNode,
  };

  const sectorsCount = new Set(filteredActions.map((a) => a.originSectorId || a.originSectorName))
    .size;

  return {
    hoshinKanri: hoshinKanriNode,
    availableYears,
    selectedYear,
    totalHomologatedValue,
    totalProjectsCount,
    totalAgentsCount: agents.length,
    totalSectorsCount: sectorsCount,
    isDemoData: false,
  };
}

// Fallback com dados industriais estruturados e realistas caso o banco esteja limpo/em primeiro acesso
function generateDemoTreeData(
  tenantName: string,
  year: number | 'todos',
  availableYears: number[]
): TreeDashboardData {
  const demoTotal = 1845200;

  const demoAgents: AgentNode[] = [
    {
      agentId: 'usr_demo_1',
      agentName: 'Mauricio Grigol',
      jobTitle: 'Gestor Master & Consultor Lean',
      value: 840000,
      percentageOfEntity: 45.5,
      projectCount: 4,
      projects: [],
      sectors: [
        {
          sectorId: 'sec_extrusao',
          sectorName: 'Extrusão de Fitas PP',
          color: '#06b6d4',
          value: 520000,
          percentageOfAgent: 61.9,
          percentageOfEntity: 28.2,
          projectCount: 2,
          projects: [],
          savingsTypes: [
            {
              key: 'scrapReduction',
              label: 'Resíduo & Sucata',
              value: 280000,
              percentageOfSector: 53.8,
              percentageOfEntity: 15.2,
              projectCount: 1,
              projects: [],
            },
            {
              key: 'toolingAndEnergy',
              label: 'Energia Elétrica & Insumos',
              value: 150000,
              percentageOfSector: 28.8,
              percentageOfEntity: 8.1,
              projectCount: 1,
              projects: [],
            },
            {
              key: 'laborSavings',
              label: 'Mão de Obra & Setup',
              value: 90000,
              percentageOfSector: 17.3,
              percentageOfEntity: 4.9,
              projectCount: 1,
              projects: [],
            },
          ],
        },
        {
          sectorId: 'sec_tecelagem',
          sectorName: 'Tecelagem Circular',
          color: '#10b981',
          value: 320000,
          percentageOfAgent: 38.1,
          percentageOfEntity: 17.3,
          projectCount: 2,
          projects: [],
          savingsTypes: [
            {
              key: 'machineDowntime',
              label: 'Paradas de Máquina (OEE)',
              value: 180000,
              percentageOfSector: 56.3,
              percentageOfEntity: 9.8,
              projectCount: 1,
              projects: [],
            },
            {
              key: 'productionIncrease',
              label: 'Capacidade & Produção',
              value: 140000,
              percentageOfSector: 43.8,
              percentageOfEntity: 7.6,
              projectCount: 1,
              projects: [],
            },
          ],
        },
      ],
    },
    {
      agentId: 'usr_demo_2',
      agentName: 'Juliana Lima',
      jobTitle: 'Especialista em Engenharia de Processos',
      value: 625200,
      percentageOfEntity: 33.9,
      projectCount: 3,
      projects: [],
      sectors: [
        {
          sectorId: 'sec_acabamento',
          sectorName: 'Acabamento & Costura',
          color: '#8b5cf6',
          value: 395200,
          percentageOfAgent: 63.2,
          percentageOfEntity: 21.4,
          projectCount: 2,
          projects: [],
          savingsTypes: [
            {
              key: 'laborSavings',
              label: 'Mão de Obra & Setup',
              value: 245200,
              percentageOfSector: 62.0,
              percentageOfEntity: 13.3,
              projectCount: 1,
              projects: [],
            },
            {
              key: 'scrapReduction',
              label: 'Resíduo & Sucata',
              value: 150000,
              percentageOfSector: 38.0,
              percentageOfEntity: 8.1,
              projectCount: 1,
              projects: [],
            },
          ],
        },
        {
          sectorId: 'sec_qualidade',
          sectorName: 'Controle de Qualidade',
          color: '#f59e0b',
          value: 230000,
          percentageOfAgent: 36.8,
          percentageOfEntity: 12.5,
          projectCount: 1,
          projects: [],
          savingsTypes: [
            {
              key: 'scrapReduction',
              label: 'Resíduo & Sucata',
              value: 160000,
              percentageOfSector: 69.6,
              percentageOfEntity: 8.7,
              projectCount: 1,
              projects: [],
            },
            {
              key: 'otherSavings',
              label: 'Outros Custos Evitados',
              value: 70000,
              percentageOfSector: 30.4,
              percentageOfEntity: 3.8,
              projectCount: 1,
              projects: [],
            },
          ],
        },
      ],
    },
    {
      agentId: 'usr_demo_3',
      agentName: 'Roberto Mendes',
      jobTitle: 'Facilitador TPM & Manutenção',
      value: 380000,
      percentageOfEntity: 20.6,
      projectCount: 2,
      projects: [],
      sectors: [
        {
          sectorId: 'sec_manutencao',
          sectorName: 'Manutenção Eletromecânica',
          color: '#ef4444',
          value: 380000,
          percentageOfAgent: 100,
          percentageOfEntity: 20.6,
          projectCount: 2,
          projects: [],
          savingsTypes: [
            {
              key: 'machineDowntime',
              label: 'Paradas de Máquina (OEE)',
              value: 260000,
              percentageOfSector: 68.4,
              percentageOfEntity: 14.1,
              projectCount: 1,
              projects: [],
            },
            {
              key: 'toolingAndEnergy',
              label: 'Energia Elétrica & Insumos',
              value: 120000,
              percentageOfSector: 31.6,
              percentageOfEntity: 6.5,
              projectCount: 1,
              projects: [],
            },
          ],
        },
      ],
    },
  ];

  return {
    hoshinKanri: {
      year,
      overallFulfillmentPercent: 88,
      totalObjectivesCount: 4,
      activeObjectivesCount: 4,
      achievedObjectivesCount: 3,
      totalAlignedProjectsCount: 9,
      entity: {
        tenantId: 'tenant_rafitec_01',
        name: tenantName || 'Rafitec S.A.',
        cnpjOrCode: '04.892.341/0001-55',
        totalHomologatedValue: demoTotal,
        totalProjectsCount: 9,
        totalHoursSaved: 1420,
        agents: demoAgents,
      },
    },
    availableYears: availableYears.length > 0 ? availableYears : [2026, 2025],
    selectedYear: year,
    totalHomologatedValue: demoTotal,
    totalProjectsCount: 9,
    totalAgentsCount: demoAgents.length,
    totalSectorsCount: 4,
    isDemoData: true,
  };
}
