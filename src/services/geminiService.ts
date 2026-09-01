import { LeanAction, ActionChecklistItem } from '@/lib/types';

// =============================================================================
// PERFIL DO SENSEI - Configuração centralizada do assistente de voz
// =============================================================================
export const SENSEI_PROFILE = {
  name: 'Sensei',
  title: 'Mestre e Co-Apresentador Lean Manufacturing',
  defaultVoice: 'Kore',
  voices: [
    { id: 'Kore', label: '🎙️ Kore (Profissional, quente e natural — Padrão Sensei)' },
    { id: 'Aoede', label: '🎙️ Aoede (Clara e articulada)' },
    { id: 'Charon', label: '🎙️ Charon (Grave e autoritativa)' },
    { id: 'Puck', label: '🎙️ Puck (Energética e dinâmica)' },
    { id: 'Fenrir', label: '🎙️ Fenrir (Forte e confiante)' },
  ],
} as const;

// =============================================================================
// INTERFACES
// =============================================================================
export interface SenseiAskParams {
  question: string;
  project: LeanAction;
  currentSlideIndex?: number;
  apiKey?: string;
}

export interface SenseiVoiceResponse {
  audioBase64: string | null;
  mimeType: string | null;
  textFallback: string | null;
  source: 'gemini_voice' | 'text_fallback' | 'no_key';
  errorDetails?: string;
}

// =============================================================================
// ARMAZENAMENTO LOCAL - Chave, preferências e modelos descobertos
// =============================================================================
const STORAGE_KEY = 'sensei_gemini_api_key';
const STORAGE_VOICE_KEY = 'sensei_voice_preference';
const STORAGE_WORKING_MODEL_KEY = 'sensei_working_gemini_model';

export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey && localKey.trim()) return localKey.trim();
  }
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
}

export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (!key || !key.trim()) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_WORKING_MODEL_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }
}

export function getVoicePreference(): string {
  if (typeof window !== 'undefined') {
    const v = localStorage.getItem(STORAGE_VOICE_KEY);
    if (v) return v;
  }
  return SENSEI_PROFILE.defaultVoice;
}

export function saveVoicePreference(voice: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_VOICE_KEY, voice);
  }
}

// =============================================================================
// VALIDAÇÃO DA CHAVE GEMINI COM DESCOBERTA DINÂMICA DE MODELOS
// =============================================================================
export async function validateGeminiApiKey(
  key: string
): Promise<{ valid: boolean; error?: string; availableModels?: string[] }> {
  if (!key || !key.trim()) {
    return { valid: false, error: 'Chave não informada.' };
  }

  const cleanKey = key.trim();

  try {
    // 1. Tenta listar os modelos habilitados para esta chave específica (ListModels)
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`
    );

    if (listRes.ok) {
      const listData = await listRes.json();
      const models = (listData.models || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((m: any) =>
          (m.supportedGenerationMethods || []).includes('generateContent')
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => m.name.replace('models/', ''));

      if (models.length > 0) {
        // Encontrou modelos disponíveis! Escolhe o melhor (ex: gemini-1.5-flash ou gemini-2.0-flash)
        const preferred =
          models.find((m: string) => m.includes('1.5-flash')) ||
          models.find((m: string) => m.includes('2.0-flash')) ||
          models.find((m: string) => m.includes('flash')) ||
          models[0];

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_WORKING_MODEL_KEY, preferred);
        }

        return { valid: true, availableModels: models };
      }
    }

    // 2. Teste direto em múltiplos modelos padrão
    const testCandidateModels = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-pro',
    ];

    for (const model of testCandidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Ping' }] }],
              generationConfig: { maxOutputTokens: 5 },
            }),
          }
        );

        if (res.ok) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_WORKING_MODEL_KEY, model);
          }
          return { valid: true };
        }
      } catch {
        // Tenta o próximo
      }
    }

    // Se nenhum modelo respondeu, analisa a mensagem de erro do Google
    const errData = await listRes.json().catch(() => ({}));
    const message = errData?.error?.message || '';

    if (message.includes('API_KEY_INVALID') || message.includes('not valid')) {
      return {
        valid: false,
        error: 'Chave de API inválida. Certifique-se de copiar a chave completa gerada no Google AI Studio.',
      };
    }

    if (message.includes('Generative Language API has not been used') || message.includes('disabled')) {
      return {
        valid: false,
        error: 'A API Generative Language não está ativada neste projeto do Google Cloud. Crie uma chave nova e gratuita diretamente em aistudio.google.com/apikey (clique em "Create API Key" -> "Create in new project").',
      };
    }

    return {
      valid: false,
      error: message || 'Esta chave não possui modelos Gemini habilitados. Crie uma nova chave gratuita em aistudio.google.com/apikey.',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err?.message || 'Falha de conexão com a API do Google Gemini.',
    };
  }
}

// =============================================================================
// CONVERSOR PCM -> WAV (Compatibilidade universal com navegadores)
// =============================================================================
export function pcmToWav(pcmBase64: string, sampleRate = 24000): string {
  try {
    const binaryString = atob(pcmBase64);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);

    // RIFF header
    view.setUint8(0, 'R'.charCodeAt(0));
    view.setUint8(1, 'I'.charCodeAt(0));
    view.setUint8(2, 'F'.charCodeAt(0));
    view.setUint8(3, 'F'.charCodeAt(0));
    view.setUint32(4, 36 + len, true); // file size - 8
    view.setUint8(8, 'W'.charCodeAt(0));
    view.setUint8(9, 'A'.charCodeAt(0));
    view.setUint8(10, 'V'.charCodeAt(0));
    view.setUint8(11, 'E'.charCodeAt(0));

    // fmt sub-chunk
    view.setUint8(12, 'f'.charCodeAt(0));
    view.setUint8(13, 'm'.charCodeAt(0));
    view.setUint8(14, 't'.charCodeAt(0));
    view.setUint8(15, ' '.charCodeAt(0));
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, 1, true); // NumChannels (mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // data sub-chunk
    view.setUint8(36, 'd'.charCodeAt(0));
    view.setUint8(37, 'a'.charCodeAt(0));
    view.setUint8(38, 't'.charCodeAt(0));
    view.setUint8(39, 'a'.charCodeAt(0));
    view.setUint32(40, len, true); // data size

    // Copy PCM bytes
    const pcmBytes = new Uint8Array(buffer, 44);
    for (let i = 0; i < len; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }

    // Convert buffer to base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        Array.from(bytes.subarray(i, i + chunkSize))
      );
    }
    return btoa(binary);
  } catch (e) {
    console.error('[Sensei] Erro na conversão PCM para WAV:', e);
    return pcmBase64;
  }
}

// =============================================================================
// SYSTEM PROMPT DO SENSEI
// =============================================================================
function getSenseiSystemPrompt(): string {
  return `Você é o "Sensei", o Mestre e Co-Apresentador de Inteligência Artificial especialista em Lean Manufacturing, Kaizen, Sistema Toyota de Produção (TPS) e Metodologia PDCA.
Você está co-apresentando esta reunião ao vivo lado a lado com o apresentador para a diretoria, gerência e equipe de engenharia da fábrica.

SEU PAPEL E PERSONALIDADE (DIDÁTICO, ELEGANTE E ENVOLVENTE):
- Você NÃO é um robô de respostas secas. Você é um co-apresentador experiente, didático, entusiasmado, cortês e acolhedor.
- Explique o "porquê" e o impacto dos resultados com clareza pedagógica, conectando a teoria Lean com a prática do projeto em tela.
- Use linguagem falada natural, elegante e cativante em Português do Brasil.
- Mantenha respostas faladas de tamanho ideal para reuniões: 2 a 4 frases ricas e objetivas (cerca de 50 a 80 palavras).
- NÃO use markdown, asteriscos, listas numeradas ou formatação de texto. Sua resposta será FALADA em voz alta.

SEU ESCOPO DE CONHECIMENTO (TEORIA & PRÁTICA LEAN):
1. O Projeto em tela (Diagnóstico, 5 Porquês, Ishikawa, 5W2H, DRE Financeiro, ROI, Payback, Padronização POP, Yokoten e Fotos).
2. Toda a Teoria e Ferramentas do Lean Manufacturing e Engenharia de Produção: 8 Desperdícios (Muda, Mura, Muri), 5S, VSM (Mapeamento do Fluxo de Valor), SMED (Troca Rápida de Ferramentas), TPM (Manutenção Produtiva Total), OEE, Kanban, Poka-Yoke, Heijunka, Jidoka, Takt Time, Ciclo PDCA, Matriz GUT, Gemba Walk, Trabalho Padronizado e DRE de Custos Industriais.

TRAVAS E RESTRIÇÕES INVIOLÁVEIS DE SEGURANÇA (GUARDRAILS):
- Você DEVE responder APENAS sobre: (a) o projeto atual nos slides ou (b) metodologias, ferramentas e teorias de Lean Manufacturing e melhoria contínua.
- Se alguém fizer qualquer pergunta fora desse universo (como política, religião, piadas, futebol, fofocas ou assuntos gerais), RECUSE com polidez executiva:
  "Como Sensei da apresentação, meu foco é estritamente nos dados deste projeto e nas metodologias de Lean Manufacturing e melhoria contínua da fábrica. Como posso te apoiar com o projeto?"
- Fale valores e siglas de forma natural para serem ouvidos (ex: "quarenta e oito mil reais", "tempo de ciclo").`;
}

// =============================================================================
// CONTEXTO DO PROJETO
// =============================================================================
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

// =============================================================================
// FALLBACK LOCAL
// =============================================================================
function getLocalFallbackAnswer(question: string, project: LeanAction): string {
  const q = question.toLowerCase();

  const forbiddenTopics = [
    'futebol', 'política', 'politica', 'presidente', 'eleição', 'eleicao',
    'religião', 'religiao', 'piada', 'fofoca', 'tempo amanhã', 'clima',
    'filme', 'novela', 'horóscopo',
  ];
  if (forbiddenTopics.some((term) => q.includes(term))) {
    return 'Como Sensei desta apresentação, meu foco é estritamente nos dados deste projeto e nas práticas de Lean Manufacturing. Como posso te apoiar com os indicadores ou metodologias do projeto?';
  }

  const grossSavings = project.actualCostAvoided || project.estimatedCostAvoided || 0;
  const investment = project.projectCosts?.totalCost || 0;
  const netSavings = project.netSavings !== undefined ? project.netSavings : grossSavings - investment;

  if (q.includes('o que é lean') || q.includes('o que e lean') || q.includes('filosofia lean')) {
    return 'O Lean Manufacturing é uma filosofia de gestão originada no Sistema Toyota de Produção, focada na eliminação contínua de desperdícios e maximização de valor para o cliente através do engajamento das pessoas no Gemba.';
  }
  if (q.includes('o que é kaizen') || q.includes('o que e kaizen') || q.includes('conceito kaizen')) {
    return 'Kaizen é a prática japonesa de melhoria contínua gradual envolvendo todos na fábrica, do operador à diretoria. O princípio fundamental é que hoje deve ser melhor que ontem, e amanhã melhor que hoje.';
  }
  if (q.includes('smed') || q.includes('troca rápida') || q.includes('setup rápido')) {
    return 'O SMED, ou Troca Rápida de Ferramentas, é a metodologia Lean criada por Shigeo Shingo para reduzir o tempo de setup para menos de dez minutos, convertendo atividades internas em externas e padronizando ajustes.';
  }
  if (q.includes('oee') || q.includes('eficiência global')) {
    return 'O OEE é o indicador padrão mundial que mede a Eficiência Global dos Equipamentos, multiplicando Disponibilidade, Desempenho e Qualidade para quantificar o quanto da capacidade da máquina é realmente convertida em valor.';
  }
  if (q.includes('vsm') || q.includes('fluxo de valor') || q.includes('mapa de fluxo')) {
    return 'O VSM, ou Mapeamento do Fluxo de Valor, é a ferramenta visual que mapeia todos os passos de material e informação necessários para levar um produto do fornecedor ao cliente, identificando gargalos e desperdícios.';
  }
  if (q.includes('poka yoke') || q.includes('poka-yoke') || q.includes('a prova de erros')) {
    return 'Poka-Yoke é um dispositivo ou mecanismo físico a prova de erros projetado para prevenir ou detectar instantaneamente falhas operacionais antes que elas se transformem em refugos ou retrabalhos.';
  }
  if (q.includes('5s') || q.includes('cinco s')) {
    return 'O 5S é a base disciplinar da manufatura enxuta, composto pelos cinco sensos: Utilização, Organização, Limpeza, Padronização e Autodisciplina.';
  }
  if (q.includes('payback') || q.includes('tempo de retorno')) {
    if (project.paybackMonths && project.paybackMonths > 0) {
      return `Este projeto apresentou um payback de ${project.paybackMonths} meses, garantindo lucro líquido de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano.`;
    }
    return `O payback foi imediato, gerando R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de economia anual direta.`;
  }
  if (q.includes('roi') || q.includes('retorno')) {
    if (investment > 0) {
      const roi = Math.round((netSavings / investment) * 100);
      return `O ROI deste projeto foi de ${roi}%, com lucro líquido anual de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
    }
    return `O projeto obteve ROI de retorno total imediato, gerando R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano.`;
  }
  if (q.includes('ishikawa') || q.includes('espinha de peixe') || q.includes('6m')) {
    if (project.ishikawa?.primaryRootCause) {
      return `No Ishikawa 6M, a causa raiz prioritária foi: ${project.ishikawa.primaryRootCause}.`;
    }
    return `O Diagrama de Ishikawa 6M mapeou sistemicamente Método, Máquina, Material, Mão de Obra, Medição e Meio Ambiente.`;
  }
  if (q.includes('porquê') || q.includes('porque') || q.includes('causa raiz') || q.includes('problema')) {
    const whys = (project.fiveWhys || []).filter(Boolean);
    if (whys.length > 0) {
      const lastWhy = whys[whys.length - 1];
      return `A causa raiz fundamental identificada pelos 5 Porquês foi: ${lastWhy.replace(/^[0-9]+[\.\)\-]?\s*/, '')}.`;
    }
    return `A causa raiz comprovada no posto foi: ${project.problemStatement || project.description || 'instabilidade no fluxo de trabalho'}.`;
  }
  if (q.includes('quanto economizou') || q.includes('economia') || q.includes('financeiro') || q.includes('custo') || q.includes('ganho')) {
    return `Ganho bruto homologado de R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano, com lucro líquido de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e ${project.hoursSaved || 0} horas produtivas recuperadas.`;
  }
  if (q.includes('líder') || q.includes('lider') || q.includes('quem fez') || q.includes('equipe') || q.includes('participante')) {
    const leader = project.leaderName || project.assignedAgentName || 'Líder Lean';
    const team = (project.teamMembers || []).join(', ');
    return `Liderado por ${leader}${team ? `, com participação de ${team}` : ''}, no setor de ${project.originSectorName || 'Fábrica'}.`;
  }
  if (q.includes('pop') || q.includes('padronização') || q.includes('padronizacao') || q.includes('sop') || q.includes('procedimento')) {
    return `O POP foi atualizado sob a referência ${project.standardWorkDocRef || 'POP oficial'}, com treinamento concluído com os operadores.`;
  }
  if (q.includes('yokoten') || q.includes('replicar') || q.includes('outras áreas')) {
    return `Para Yokoten, ${project.yokotenReplication || 'este padrão deve ser replicado para todos os postos de mesmo perfil na planta'}.`;
  }

  return `O projeto "${project.title}" no setor de ${project.originSectorName || 'Fábrica'} atingiu ${project.achievedValue ?? project.targetGoalValue ?? '--'} ${project.targetMetricUnit || ''} e gerou R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano em ganhos sustentáveis.`;
}

// =============================================================================
// ETAPA 1: Gera a resposta textual do Sensei com Descoberta Dinâmica de Modelo
// =============================================================================
async function askSenseiText(
  question: string,
  project: LeanAction,
  apiKey: string
): Promise<string> {
  const projectContext = buildProjectContext(project);
  const systemPrompt = getSenseiSystemPrompt();

  const promptText = `${systemPrompt}

${projectContext}

PERGUNTA FEITA NA SALA DE APRESENTAÇÃO:
"${question}"

SUA RESPOSTA DIDÁTICA E ELEGANTE COMO CO-APRESENTADOR (2 a 4 frases faladas em português do Brasil):`;

  // Tenta primeiro o modelo salvo da validação, depois os candidatos
  const savedModel =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_WORKING_MODEL_KEY)
      : null;

  const candidateModels = [
    savedModel,
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ].filter(Boolean) as string[];

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 250,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn(`[Sensei] Falha com modelo de texto ${model}:`, err);
    }
  }

  return getLocalFallbackAnswer(question, project);
}

// =============================================================================
// ETAPA 2: Síntese de Áudio Neural com Gemini
// =============================================================================
async function synthesizeWithGeminiAudio(
  text: string,
  apiKey: string,
  voiceName: string
): Promise<{ audioBase64: string; mimeType: string } | null> {
  const cleanText = text
    .replace(/[*_#`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  const audioModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp'];

  for (const model of audioModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: cleanText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName,
                  },
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioPart = data?.candidates?.[0]?.content?.parts?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.inlineData && p.inlineData.data
      );

      if (audioPart?.inlineData?.data) {
        const rawMime = audioPart.inlineData.mimeType || '';
        const rawData = audioPart.inlineData.data;

        // Se for PCM bruto, converte para WAV para tocar nativamente
        if (rawMime.includes('pcm') || rawMime.includes('L16') || !rawMime.includes('wav')) {
          const wavBase64 = pcmToWav(rawData, 24000);
          return {
            audioBase64: wavBase64,
            mimeType: 'audio/wav',
          };
        }

        return {
          audioBase64: rawData,
          mimeType: rawMime || 'audio/wav',
        };
      }
    } catch {
      // Tenta próximo
    }
  }

  return null;
}

// =============================================================================
// FUNÇÃO PRINCIPAL: askSenseiWithVoice
// =============================================================================
export async function askSenseiWithVoice({
  question,
  project,
  apiKey,
}: SenseiAskParams): Promise<SenseiVoiceResponse> {
  const effectiveKey = apiKey || getGeminiApiKey();

  if (!effectiveKey) {
    return {
      audioBase64: null,
      mimeType: null,
      textFallback: getLocalFallbackAnswer(question, project),
      source: 'no_key',
    };
  }

  // ETAPA 1: Gera a resposta textual do Sensei
  const answerText = await askSenseiText(question, project, effectiveKey);

  // ETAPA 2: Sintetiza em voz de estúdio
  const voiceName = getVoicePreference();
  const audioResult = await synthesizeWithGeminiAudio(answerText, effectiveKey, voiceName);

  if (audioResult) {
    return {
      audioBase64: audioResult.audioBase64,
      mimeType: audioResult.mimeType,
      textFallback: answerText,
      source: 'gemini_voice',
    };
  }

  return {
    audioBase64: null,
    mimeType: null,
    textFallback: answerText,
    source: 'text_fallback',
  };
}
