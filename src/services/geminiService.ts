import { LeanAction, ActionChecklistItem } from '@/lib/types';

export interface SenseiAskParams {
  question: string;
  project: LeanAction;
  currentSlideIndex?: number;
  apiKey?: string;
}

export interface SenseiResponse {
  answer: string;
  source: 'gemini' | 'local_fallback';
  confidence: number;
}

const STORAGE_KEY = 'sensei_gemini_api_key';

/**
 * Retorna a chave do Gemini configurada (localStorage ou Variável de Ambiente)
 */
export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey && localKey.trim()) return localKey.trim();
  }
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
}

/**
 * Salva a chave do Gemini no armazenamento local do navegador
 */
export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (!key || !key.trim()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }
}

/**
 * Monta o contexto enriquecido do projeto em formato estruturado para o Gemini
 */
function buildProjectContext(project: LeanAction): string {
  const ishikawaCauses = project.ishikawa
    ? [
        project.ishikawa.method ? `Método: ${project.ishikawa.method}` : '',
        project.ishikawa.machine ? `Máquina: ${project.ishikawa.machine}` : '',
        project.ishikawa.material ? `Material: ${project.ishikawa.material}` : '',
        project.ishikawa.manpower ? `Mão de Obra: ${project.ishikawa.manpower}` : '',
        project.ishikawa.measurement ? `Medição: ${project.ishikawa.measurement}` : '',
        project.ishikawa.environment ? `Meio Ambiente: ${project.ishikawa.environment}` : '',
      ]
        .filter(Boolean)
        .join('; ')
    : 'Não especificado';

  const fiveWhysClean = (project.fiveWhys || [])
    .filter((w: string) => w && w.trim().length > 0)
    .map((w: string, idx: number) => `${idx + 1}º Porquê: ${w}`)
    .join(' -> ');

  const actionsList = (project.checklist || [])
    .map(
      (item: ActionChecklistItem, idx: number) =>
        `${idx + 1}. [${item.completed ? 'CONCLUÍDO' : 'PENDENTE'}] ${item.label} (Resp: ${item.responsibleName || 'Agente'})`
    )
    .join('\n');

  const grossSavings = project.actualCostAvoided || project.estimatedCostAvoided || 0;
  const investment = project.projectCosts?.totalCost || 0;
  const netSavings = project.netSavings !== undefined ? project.netSavings : grossSavings - investment;

  return `
--- DADOS DO PROJETO LEAN (PDCA) EM TELA ---
- Título do Projeto: ${project.title}
- Protocolo: ${project.protocol}
- Setor / Área: ${project.originSectorName || 'Fábrica'}
- Categoria de Desperdício: ${project.wasteCategory || 'Espera / Movimentação'}
- Líder do Kaizen: ${project.leaderName || project.assignedAgentName || 'Líder Lean'}
- Agente Lean Responsável: ${project.assignedAgentName || 'Agente'}
- Equipe Participante: ${(project.teamMembers || []).join(', ') || 'Equipe do Posto'}

1. FASE PLAN (PLANEJAR):
- Declaração do Problema / Causa Raiz: ${project.problemStatement || project.description || 'Não detalhado'}
- 5 Porquês da Investigação: ${fiveWhysClean || 'Análise direta de posto'}
- Diagrama de Ishikawa 6M: ${ishikawaCauses}
- Gráfico de Pareto (80/20): ${project.pareto?.vitalCausesSummary || '80% do impacto concentrado nas principais causas vitais'} (Impacto: ${project.pareto?.cumulativeImpactPercentage || 80}%)
- Indicador Chave: ${project.targetMetricName || 'Tempo de Ciclo / Perda'}
- Baseline (Antes): ${project.baselineValue ?? '--'} ${project.targetMetricUnit || ''}
- Meta Alvo: ${project.targetGoalValue ?? '--'} ${project.targetMetricUnit || ''}

2. FASE DO (EXECUTAR):
- Posto / Máquina Piloto: ${project.pilotArea || 'Posto de Trabalho Piloto'}
- Observações dos Testes: ${project.pilotTestObservations || 'Ajustes validados diretamente com os operadores de turno.'}
- Plano de Ação 5W2H:
${actionsList || 'Ações de melhoria implantadas no posto.'}

3. FASE CHECK (VERIFICAR / FINANCEIRO):
- Resultado Técnico Atingido: ${project.achievedValue ?? project.targetGoalValue ?? '--'} ${project.targetMetricUnit || ''}
- Ganhos Brutos Totais: R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano
- Investimento / Custos: R$ ${investment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Lucro Líquido Real: R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano
- Horas Economizadas: ${project.hoursSaved || 0} horas/ano
- ROI Financeiro: ${investment > 0 ? Math.round((netSavings / investment) * 100) + '%' : 'Retorno Imediato (Sem Investimento)'}
- Payback: ${project.paybackMonths ? `${project.paybackMonths} meses` : 'Imediato'}

4. FASE ACT (PADRONIZAR & HOMOLOGAR):
- Status do Procedimento POP: ${project.standardWorkUpdated ? 'POP Atualizado e Treinado com Operadores' : 'Em revisão'}
- Referência do Documento POP: ${project.standardWorkDocRef || 'POP-LEAN-01'}
- Lições Aprendidas: ${project.lessonsLearned || 'Trabalho padronizado e envolvimento dos operadores garantem sustentabilidade.'}
- Replicação Yokoten: ${project.yokotenReplication || 'Recomendado replicar para postos similares da planta.'}
- Homologação Master: ${project.masterApproved ? `Homologado por ${project.masterApprovedBy || 'Master Lean'}` : 'Em processo de homologação'}
- Acompanhamento 3 Meses: Mês 1 (R$ ${(project.quarterlyFollowUp?.month1?.value || 0).toLocaleString('pt-BR')}), Mês 2 (R$ ${(project.quarterlyFollowUp?.month2?.value || 0).toLocaleString('pt-BR')}), Mês 3 (R$ ${(project.quarterlyFollowUp?.month3?.value || 0).toLocaleString('pt-BR')})
---
`;
}

/**
 * Resposta inteligente de fallback local caso a API do Gemini não esteja configurada ou sem conexão
 */
function getLocalFallbackAnswer(question: string, project: LeanAction): string {
  const q = question.toLowerCase();

  const grossSavings = project.actualCostAvoided || project.estimatedCostAvoided || 0;
  const investment = project.projectCosts?.totalCost || 0;
  const netSavings = project.netSavings !== undefined ? project.netSavings : grossSavings - investment;

  if (q.includes('payback') || q.includes('tempo de retorno')) {
    if (project.paybackMonths && project.paybackMonths > 0) {
      return `O payback deste projeto é de ${project.paybackMonths} meses, com retorno financeiro líquido de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano.`;
    }
    return `O payback foi imediato, pois a melhoria foi executada com recursos internos de baixo custo e gerou R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de economia anual.`;
  }

  if (q.includes('roi') || q.includes('retorno')) {
    if (investment > 0) {
      const roi = Math.round((netSavings / investment) * 100);
      return `O ROI homologado deste projeto foi de ${roi}%, gerando um lucro líquido anual de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sobre um investimento de R$ ${investment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
    }
    return `O projeto teve ROI de retorno total imediato, gerando R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano sem necessidade de investimento externo.`;
  }

  if (q.includes('ishikawa') || q.includes('espinha de peixe') || q.includes('6m')) {
    if (project.ishikawa?.primaryRootCause) {
      return `Na análise de Ishikawa 6M, a causa raiz principal diagnosticada foi: ${project.ishikawa.primaryRootCause}.`;
    }
    if (project.ishikawa?.machine || project.ishikawa?.method) {
      return `No Ishikawa, os principais fatores identificados foram na dimensão de Método (${project.ishikawa.method || 'ajustes operacionais'}) e Máquina (${project.ishikawa.machine || 'regulagens'}).`;
    }
    return `No diagrama de Ishikawa, a equipe mapeou as 6 dimensões operacionais, priorizando a eliminação das perdas de processo e padronização.`;
  }

  if (q.includes('porquê') || q.includes('porque') || q.includes('causa raiz') || q.includes('problema')) {
    const whys = (project.fiveWhys || []).filter(Boolean);
    if (whys.length > 0) {
      const lastWhy = whys[whys.length - 1];
      return `A investigação causal dos 5 Porquês identificou que a causa raiz foi: ${lastWhy.replace(/^[0-9]+[\.\)\-]?\s*/, '')}.`;
    }
    return `A declaração da causa raiz identificada no posto foi: ${project.problemStatement || project.description || 'Otimização operacional do fluxo produtivo'}.`;
  }

  if (q.includes('quanto economizou') || q.includes('economia') || q.includes('financeiro') || q.includes('custo') || q.includes('ganho')) {
    return `Este projeto gerou um custo evitado bruto de R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por ano, com lucro líquido de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e economia de ${project.hoursSaved || 0} horas de trabalho.`;
  }

  if (q.includes('líder') || q.includes('lider') || q.includes('quem fez') || q.includes('equipe') || q.includes('participante')) {
    const leader = project.leaderName || project.assignedAgentName || 'Líder Lean';
    const team = (project.teamMembers || []).join(', ');
    return `O projeto foi liderado por ${leader}${team ? `, com a participação direta de ${team}` : ''} no setor de ${project.originSectorName || 'Fábrica'}.`;
  }

  if (q.includes('pop') || q.includes('padronização') || q.includes('padronizacao') || q.includes('sop') || q.includes('procedimento')) {
    return `O procedimento operacional padrão foi atualizado sob a referência ${project.standardWorkDocRef || 'POP oficial'}, com treinamento prático concluído com todos os operadores de turno.`;
  }

  if (q.includes('yokoten') || q.includes('replicar') || q.includes('outras áreas')) {
    return `Para replicação Yokoten, ${project.yokotenReplication || 'recomenda-se aplicar este mesmo método em todas as linhas produtivas de perfil similar na fábrica'}.`;
  }

  return `O projeto "${project.title}" no setor de ${project.originSectorName || 'Fábrica'} alcançou a meta com sucesso, atingindo ${project.achievedValue ?? project.targetGoalValue ?? '--'} ${project.targetMetricUnit || ''} e gerando R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano.`;
}

/**
 * Consulta a IA Gemini como motor executivo do "Sensei"
 */
export async function askSensei({
  question,
  project,
  apiKey,
}: SenseiAskParams): Promise<SenseiResponse> {
  const effectiveKey = apiKey || getGeminiApiKey();

  // Se não houver chave do Gemini configurada, utiliza o motor inteligente local
  if (!effectiveKey) {
    const fallbackAnswer = getLocalFallbackAnswer(question, project);
    return {
      answer: fallbackAnswer,
      source: 'local_fallback',
      confidence: 0.9,
    };
  }

  try {
    const projectContext = buildProjectContext(project);

    const systemInstruction = `Você é o "Sensei", o assistente executivo de inteligência artificial especialista em Lean Manufacturing, Kaizen e metodologia PDCA da fábrica.
Você está acompanhando ao vivo uma reunião de apresentação do projeto Lean exibido na tela para diretores, gerentes e engenheiros.

DIRETRIZES FUNDAMENTAIS PARA SUA RESPOSTA:
1. Responda em Português do Brasil com tom executivo, elegante, seguro e direto.
2. IMPORTANTE: Sua resposta será lida em voz alta por um sintetizador de fala na sala de reunião. Portanto, SEJA CONCISO: dê respostas de NO MÁXIMO 2 a 3 frases claras (máximo 45 a 60 palavras).
3. Não use tabelas, listas numeradas longas, asteriscos excessivos ou markdown complexo na resposta, pois o texto será falado.
4. Responda estritamente com base nos dados reais do projeto apresentados abaixo. Se o dado solicitado não existir, diga com educação que a informação não foi registrada no laudo.
5. Fale valores financeiros em formato natural (exemplo: "quarenta e oito mil reais", ou "R$ 48.000").`;

    const promptText = `${systemInstruction}

${projectContext}

PERGUNTA FEITA NA SALA DE APRESENTAÇÃO:
"${question}"

SUA RESPOSTA FALADA DIRETA (2 a 3 frases):`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Erro na chamada da API Gemini, usando motor local:', errText);
      return {
        answer: getLocalFallbackAnswer(question, project),
        source: 'local_fallback',
        confidence: 0.85,
      };
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (generatedText) {
      return {
        answer: generatedText,
        source: 'gemini',
        confidence: 0.98,
      };
    }

    return {
      answer: getLocalFallbackAnswer(question, project),
      source: 'local_fallback',
      confidence: 0.85,
    };
  } catch (error) {
    console.error('Falha ao comunicar com o Gemini:', error);
    return {
      answer: getLocalFallbackAnswer(question, project),
      source: 'local_fallback',
      confidence: 0.85,
    };
  }
}
