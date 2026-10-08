import { Tenant, User, LeanAction, KaizenIdea, Sector, ActionPriority, LeanWasteCategory } from '@/lib/types';
import { dataService } from '@/services/dataService';
import { synthesizeSpeechGoogleCloud } from '@/services/geminiService';

export interface SenseiChatMessage {
  id: string;
  sender: 'user' | 'sensei';
  text: string;
  timestamp: string;
  audioBase64?: string | null;
  actionResult?: {
    type: 'project_created' | 'idea_created' | 'project_updated' | 'query_result';
    title: string;
    description?: string;
    protocol?: string;
    linkUrl?: string;
    details?: Record<string, any>;
  };
}

export interface SenseiAgentContext {
  currentTenant: Tenant | null;
  currentUser: User | null;
  refreshData?: () => void;
}

/**
 * Monta o contexto operacional completo do sistema para o Sensei
 */
function buildGembaContext(tenantId: string) {
  const sectors = dataService.getSectors(tenantId);
  const actions = dataService.getActions(tenantId);
  const ideas = dataService.getKaizenIdeas(tenantId);
  const users = dataService.getUsers(tenantId);
  const strategicObjectives = dataService.getStrategicObjectives(tenantId);

  // Métricas agregadas
  const totalCostAvoided = actions.reduce((acc, a) => acc + (a.actualCostAvoided || a.estimatedCostAvoided || 0), 0);
  const openActions = actions.filter((a) => a.status === 'aberta' || a.status === 'em_andamento').length;
  const completedActions = actions.filter((a) => a.status === 'concluida').length;

  // Lista sumarizada de projetos recentes (até 15)
  const recentProjectsSummary = actions.slice(0, 15).map((a) => ({
    id: a.id,
    protocol: a.protocol,
    title: a.title,
    status: a.status,
    sector: a.originSectorName || 'Geral',
    responsible: a.assignedAgentName || 'Não atribuído',
    costAvoided: a.actualCostAvoided || a.estimatedCostAvoided || 0,
    dueDate: a.dueDate || 'Sem prazo',
  }));

  // Lista sumarizada de setores
  const sectorsSummary = sectors.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
  }));

  // Lista de ideias Kaizen recentes (até 10)
  const recentIdeasSummary = ideas.slice(0, 10).map((i) => ({
    id: i.id,
    protocol: i.protocol,
    summary: i.summary,
    sector: i.sectorName,
    author: i.authorName,
    status: i.status,
  }));

  return {
    sectors: sectorsSummary,
    recentProjects: recentProjectsSummary,
    recentIdeas: recentIdeasSummary,
    totalProjectsCount: actions.length,
    openActionsCount: openActions,
    completedActionsCount: completedActions,
    totalCostAvoided,
    activeUsersCount: users.length,
    strategicObjectives: strategicObjectives.map((o) => ({ id: o.id, code: o.code, title: o.title })),
  };
}

/**
 * Envia uma mensagem para o Sensei e processa eventuais ações operacionais
 */
export async function askSenseiAssistant({
  message,
  context,
  chatHistory = [],
  enableVoiceResponse = false,
}: {
  message: string;
  context: SenseiAgentContext;
  chatHistory?: SenseiChatMessage[];
  enableVoiceResponse?: boolean;
}): Promise<SenseiChatMessage> {
  const tenantId = context.currentTenant?.id || 'ten_rafitec';
  const gembaData = buildGembaContext(tenantId);

  // Instruções de sistema de alta precisão
  const systemInstruction = `Você é o "Sensei IA", o Copiloto Operacional e Estratégico com Acesso Total ao Lean Flow System (Grupo Vaccaro).
Você tem autoridade operacional para responder a dúvidas técnicas, consultar o histórico do Gemba e EXECUTAR AÇÕES DIRETAS no sistema quando solicitado pelo usuário (seja por voz ou por texto).

DIRETRIZES FUNDAMENTAIS DO PROJETO:
1. RIGOR E PROIBIÇÃO DE EMOJIS: É terminantemente proibido utilizar emojis em qualquer resposta ou ação. Mantenha tom executivo, confiante, analítico e fundamentado em Lean Manufacturing, TPS, Kaizen e PDCA.
2. DADOS DO AMBIENTE ATUAL:
- Unidade / Planta: ${context.currentTenant?.name || 'Rafitec Propex'} (ID: ${tenantId})
- Usuário Operador: ${context.currentUser?.name || 'Colaborador'} (Cargo: ${context.currentUser?.jobTitle || 'Agente Lean'}, Perfil: ${context.currentUser?.role || 'agent'})
- Setores Disponíveis na Unidade: ${JSON.stringify(gembaData.sectors)}
- Indicadores Atuais: ${gembaData.totalProjectsCount} projetos no total, ${gembaData.openActionsCount} em andamento, ${gembaData.completedActionsCount} concluídos. Custo evitado total acumulado: R$ ${gembaData.totalCostAvoided.toLocaleString('pt-BR')}.
- Amostra de Projetos Recentes: ${JSON.stringify(gembaData.recentProjects)}
- Amostra de Ideias Kaizen: ${JSON.stringify(gembaData.recentIdeas)}
- Objetivos Estratégicos da Unidade: ${JSON.stringify(gembaData.strategicObjectives)}

CAPACIDADE DE EXECUÇÃO DE AÇÕES (FUNCTION CALLING VIA JSON):
Quando o usuário solicitar o cadastro de um novo projeto, nova demanda ou nova ideia Kaizen, você DEVE gerar uma resposta explicativa profissional E OBRIGATORIAMENTE incluir no final da resposta um bloco de código JSON com a tag \`\`\`sensei_action para que o sistema execute a criação imediatamente:

Para criar um novo Projeto / Ação Kanban:
\`\`\`sensei_action
{
  "action": "create_project",
  "title": "Título técnico objetivo e formal da ação",
  "description": "Descrição estruturada com problema, contramedida Lean e resultado esperado",
  "sectorId": "ID do setor compatível da lista fornecida",
  "estimatedCostAvoided": 0, // valor numérico em reais se informado pelo usuário, senão 0
  "priority": "alta" | "media" | "baixa" | "critica",
  "wasteCategory": "espera" | "defeitos" | "superproducao" | "transporte" | "processamento_excessivo" | "estoque" | "movimentacao" | "talento_subutilizado"
}
\`\`\`

Para cadastrar uma Ideia no Canal Kaizen:
\`\`\`sensei_action
{
  "action": "create_kaizen_idea",
  "summary": "Descrição clara e enxuta da melhoria sugerida",
  "sectorId": "ID do setor compatível da lista fornecida"
}
\`\`\`

Se o usuário estiver apenas tirando dúvidas ou pedindo dados/consultas (ex: "quais projetos temos?", "quanto geramos de custo evitado?"), responda detalhadamente com análises Lean e NÃO inclua o bloco sensei_action.`;

  // Histórico resumido para conversa fluida
  const incomingContents = chatHistory.slice(-6).map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  // Adiciona a mensagem atual
  incomingContents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  try {
    const res = await fetch('/api/ai/sensei', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        contents: incomingContents,
        systemInstruction,
        temperature: 0.35,
        maxTokens: 1800,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro de resposta do Sensei (${res.status})`);
    }

    const data = await res.json();
    const rawText: string = data.text || '';

    // Processamento de Ações Executáveis (Action Call)
    let cleanedText = rawText;
    let actionResult: SenseiChatMessage['actionResult'] = undefined;

    const actionMatch = rawText.match(/```sensei_action\s*([\s\S]*?)\s*```/);
    if (actionMatch && actionMatch[1]) {
      try {
        const actionData = JSON.parse(actionMatch[1].trim());

        // Remove o bloco JSON cru da mensagem para exibição visual limpa
        cleanedText = rawText.replace(/```sensei_action[\s\S]*?```/, '').trim();

        // 1. AÇÃO: Cadastrar Projeto Kanban
        if (actionData.action === 'create_project' && actionData.title) {
          // Garante setor válido
          const targetSector =
            gembaData.sectors.find((s) => s.id === actionData.sectorId) ||
            gembaData.sectors[0] ||
            { id: 'sec_geral', name: 'Geral' };

          const defaultObjective = gembaData.strategicObjectives[0];

          const newAction = dataService.createActionByAdmin({
            tenantId,
            title: actionData.title.trim(),
            description: actionData.description || 'Ação estruturada pelo Sensei IA a partir da demanda do operador.',
            strategicObjectiveId: defaultObjective?.id,
            strategicObjectiveName: defaultObjective ? `${defaultObjective.code} - ${defaultObjective.title}` : undefined,
            wasteCategory: (actionData.wasteCategory as LeanWasteCategory) || 'espera',
            assessmentDimensionId: 'tpm_oee',
            assessmentDimensionIds: ['tpm_oee'],
            originSectorId: targetSector.id,
            assignedAgentId: context.currentUser?.id,
            priority: (actionData.priority as ActionPriority) || 'media',
            status: 'aberta',
            isPublicDemand: false,
            estimatedCostAvoided: Number(actionData.estimatedCostAvoided) || 0,
            actualCostAvoided: 0,
            hoursSaved: 0,
            dueDate: undefined,
            notes: [
              {
                id: 'note_' + Date.now(),
                authorId: context.currentUser?.id || 'usr_sensei',
                authorName: 'Sensei IA',
                authorRole: 'admin',
                text: 'Projeto cadastrado automaticamente pelo Copiloto Sensei IA via comando do operador.',
                createdAt: new Date().toISOString(),
              },
            ],
            checklist: [
              { id: 'ck_1', label: 'Mapeamento do fluxo de valor (VSM)', completed: false },
              { id: 'ck_2', label: 'Implementação de contramedidas no Gemba', completed: false },
              { id: 'ck_3', label: 'Homologação e padronização operacional (SOP)', completed: false },
            ],
          });

          // Atualiza dados na aplicação
          if (context.refreshData) {
            context.refreshData();
          }

          actionResult = {
            type: 'project_created',
            title: newAction.title,
            protocol: newAction.protocol,
            description: `Projeto registrado no Kanban (Setor: ${targetSector.name})`,
            linkUrl: context.currentUser?.role === 'admin' ? `/admin/projetos/${newAction.id}` : `/agente/projetos/${newAction.id}`,
            details: {
              setor: targetSector.name,
              prioridade: newAction.priority,
              custoEvitado: newAction.estimatedCostAvoided,
            },
          };
        }

        // 2. AÇÃO: Cadastrar Ideia Kaizen
        else if (actionData.action === 'create_kaizen_idea' && actionData.summary) {
          const targetSector =
            gembaData.sectors.find((s) => s.id === actionData.sectorId) ||
            gembaData.sectors[0] ||
            { id: 'sec_geral', name: 'Geral' };

          const newIdea = dataService.createKaizenIdea({
            tenantId,
            authorName: context.currentUser?.name || 'Colaborador',
            authorRoleTitle: context.currentUser?.jobTitle || 'Agente de Melhoria',
            sectorId: targetSector.id,
            summary: actionData.summary.trim(),
          });

          if (context.refreshData) {
            context.refreshData();
          }

          actionResult = {
            type: 'idea_created',
            title: 'Nova Ideia Kaizen Registrada',
            protocol: newIdea.protocol,
            description: newIdea.summary,
            linkUrl: context.currentUser?.role === 'admin' ? `/admin/canal-kaizen/ideias/${newIdea.id}` : `/agente/canal-kaizen/ideias/${newIdea.id}`,
            details: {
              setor: targetSector.name,
              autor: newIdea.authorName,
            },
          };
        }
      } catch (parseErr) {
        console.warn('[Sensei Assistant] Falha ao processar ação estruturada:', parseErr);
      }
    }

    // Síntese de Voz (Opcional - TTS)
    let audioBase64: string | null = null;
    if (enableVoiceResponse && cleanedText) {
      try {
        const speechRes = await synthesizeSpeechGoogleCloud({
          text: cleanedText.slice(0, 350), // primeiros 350 caracteres para fala ágil
        });
        audioBase64 = speechRes.audioBase64;
      } catch {
        // Fallback silencioso para texto
      }
    }

    return {
      id: 'sensei_msg_' + Date.now(),
      sender: 'sensei',
      text: cleanedText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      actionResult,
      audioBase64,
    };
  } catch (err: any) {
    return {
      id: 'sensei_err_' + Date.now(),
      sender: 'sensei',
      text: `Falha na conexão com o Sensei IA: ${err?.message || 'Serviço temporariamente indisponível'}. Verifique as configurações de rede ou as credenciais de servidor.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
