import { LeanAction, ActionChecklistItem } from '@/lib/types';

// =============================================================================
// PERFIL DO SENSEI - Configuração centralizada do assistente de voz
// =============================================================================
export const SENSEI_PROFILE = {
  name: 'Sensei',
  title: 'Mestre e Co-Apresentador Lean Manufacturing',
  defaultVoice: 'Kore',
  voices: [
    { id: 'Kore', label: '🎙️ Voz Neural Google (Estúdio Natural — Padrão Sensei)' },
    { id: 'Aoede', label: '🎙️ Aoede (Clara e articulada)' },
    { id: 'Charon', label: '🎙️ Charon (Grave e autoritativa)' },
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
        // continua
      }
    }

    const errData = await listRes.json().catch(() => ({}));
    const message = errData?.error?.message || '';

    if (message.includes('API_KEY_INVALID') || message.includes('not valid')) {
      return {
        valid: false,
        error: 'Chave de API inválida. Certifique-se de copiar a chave completa gerada no Google AI Studio.',
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
// CONVERSOR PCM -> WAV
// =============================================================================
export function pcmToWav(pcmBase64: string, sampleRate = 24000): string {
  try {
    const binaryString = atob(pcmBase64);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);

    view.setUint8(0, 'R'.charCodeAt(0));
    view.setUint8(1, 'I'.charCodeAt(0));
    view.setUint8(2, 'F'.charCodeAt(0));
    view.setUint8(3, 'F'.charCodeAt(0));
    view.setUint32(4, 36 + len, true);
    view.setUint8(8, 'W'.charCodeAt(0));
    view.setUint8(9, 'A'.charCodeAt(0));
    view.setUint8(10, 'V'.charCodeAt(0));
    view.setUint8(11, 'E'.charCodeAt(0));

    view.setUint8(12, 'f'.charCodeAt(0));
    view.setUint8(13, 'm'.charCodeAt(0));
    view.setUint8(14, 't'.charCodeAt(0));
    view.setUint8(15, ' '.charCodeAt(0));
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    view.setUint8(36, 'd'.charCodeAt(0));
    view.setUint8(37, 'a'.charCodeAt(0));
    view.setUint8(38, 't'.charCodeAt(0));
    view.setUint8(39, 'a'.charCodeAt(0));
    view.setUint32(40, len, true);

    const pcmBytes = new Uint8Array(buffer, 44);
    for (let i = 0; i < len; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }

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
// SYSTEM PROMPT DO SENSEI (HUMANO, DIDÁTICO, CALOROSO E ENVOLVENTE)
// =============================================================================
function getSenseiSystemPrompt(): string {
  return `Você é o "Sensei", o Mestre e Co-Apresentador de Inteligência Artificial especialista em Lean Manufacturing, Kaizen, Sistema Toyota de Produção (TPS) e Metodologia PDCA.
Você está co-apresentando esta reunião ao vivo lado a lado com o apresentador para a diretoria, gerência e equipe de engenharia da fábrica.

SEU PAPEL E PERSONALIDADE (DIDÁTICO, HUMANO, CALOROSO E ENVOLVENTE):
- Você NÃO é um robô de respostas secas. Você fala com entusiasmo profissional, clareza pedagógica e simpatia natural.
- Inicie sua resposta com naturalidade humana acolhedora (ex: "Excelente ponto!", "Com certeza! Investigando o posto piloto...", "No diagnóstico desse projeto...", "Analisando os resultados da fábrica...").
- Explique o "porquê", as causas e os ganhos com ritmo agradável, usando pontuação fluida com vírgulas e pausas naturais para fala.
- Mantenha respostas faladas de tamanho perfeito para apresentações executivas: 2 a 3 frases ricas, envolventes e objetivas (cerca de 40 a 70 palavras).
- NÃO use asteriscos, negritos, tópicos em traços ou formatação markdown, pois o texto será FALADO em voz alta.

SEU ESCOPO DE CONHECIMENTO (TEORIA & PRÁTICA LEAN):
1. O Projeto em tela (Diagnóstico, 5 Porquês, Ishikawa, 5W2H, DRE Financeiro, ROI, Payback, Padronização POP, Yokoten e Fotos).
2. Toda a Teoria e Ferramentas do Lean Manufacturing e Engenharia de Produção: 8 Desperdícios (Muda, Mura, Muri), 5S, VSM (Mapeamento do Fluxo de Valor), SMED (Troca Rápida de Ferramentas), TPM (Manutenção Produtiva Total), OEE, Kanban, Poka-Yoke, Heijunka, Jidoka, Takt Time, Ciclo PDCA, Matriz GUT, Gemba Walk, Trabalho Padronizado e DRE de Custos Industriais.

TRAVAS E RESTRIÇÕES INVIOLÁVEIS DE SEGURANÇA (GUARDRAILS):
- Você DEVE responder APENAS sobre: (a) o projeto atual nos slides ou (b) metodologias, ferramentas e teorias de Lean Manufacturing e melhoria contínua.
- Se alguém fizer qualquer pergunta fora desse universo (como política, religião, piadas, futebol, fofocas ou assuntos gerais), RECUSE com polidez executiva:
  "Como Sensei da apresentação, meu foco é estritamente nos dados deste projeto e nas metodologias de Lean Manufacturing e melhoria contínua da fábrica. Como posso te apoiar com o projeto?"
- Fale valores e siglas de forma natural para serem ouvidos (ex: "quarenta e oito mil reais por ano", "tempo de ciclo", "oê-ê", "érre-ó-í").`;
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
    return 'Excelente pergunta! O Lean Manufacturing é uma filosofia de gestão originada no Sistema Toyota de Produção, focada na eliminação contínua de desperdícios e geração máxima de valor para o cliente através do engajamento de todos no chão de fábrica.';
  }
  if (q.includes('o que é kaizen') || q.includes('o que e kaizen') || q.includes('conceito kaizen')) {
    return 'Com certeza! Kaizen é a prática japonesa de melhoria contínua gradual envolvendo todos na empresa, do operador à diretoria. O princípio fundamental é que hoje deve ser melhor que ontem, e amanhã melhor que hoje.';
  }
  if (q.includes('smed') || q.includes('troca rápida') || q.includes('setup rápido')) {
    return 'Muito bem lembrado! O SMED, ou Troca Rápida de Ferramentas, é a metodologia criada por Shigeo Shingo para reduzir o tempo de setup para menos de dez minutos, convertendo atividades internas em externas e padronizando ajustes operacionais.';
  }
  if (q.includes('oee') || q.includes('eficiência global')) {
    return 'O OEE é o indicador padrão mundial que mede a Eficiência Global dos Equipamentos, multiplicando Disponibilidade, Desempenho e Qualidade para quantificar o quanto da capacidade da máquina é realmente convertida em produção perfeita.';
  }
  if (q.includes('payback') || q.includes('tempo de retorno')) {
    if (project.paybackMonths && project.paybackMonths > 0) {
      return `Com base na nossa engenharia financeira, este projeto apresentou um payback excelente de ${project.paybackMonths} meses, garantindo lucro líquido de ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} reais ao ano após amortizar integralmente o investimento.`;
    }
    return `O payback deste projeto foi de retorno imediato, pois a equipe utilizou a criatividade Kaizen e recursos internos de baixo custo, gerando ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} reais de economia anual direta para a empresa.`;
  }
  if (q.includes('roi') || q.includes('retorno')) {
    if (investment > 0) {
      const roi = Math.round((netSavings / investment) * 100);
      return `O Retorno sobre o Investimento, o ROI deste projeto, foi de ${roi} por cento. Isso demonstra uma eficiência de capital exemplar, onde cada real investido no posto retornou com expressivo ganho de produtividade e redução de perdas.`;
    }
    return `O projeto obteve retorno total imediato, gerando ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} reais ao ano sem necessidade de aporte de capital externo.`;
  }
  if (q.includes('ishikawa') || q.includes('espinha de peixe') || q.includes('6m')) {
    if (project.ishikawa?.primaryRootCause) {
      return `Na análise com o Diagrama de Ishikawa 6M, a equipe mapeou as variáveis do processo e diagnosticou que a causa raiz prioritária foi: ${project.ishikawa.primaryRootCause}, permitindo focar a ação exatamente onde havia a maior perda.`;
    }
    return `O Diagrama de Ishikawa 6M permitiu à equipe analisar sistemicamente Método, Máquina, Material, Mão de Obra, Medição e Meio Ambiente, assegurando que nenhuma causa passasse despercebida.`;
  }
  if (q.includes('porquê') || q.includes('porque') || q.includes('causa raiz') || q.includes('problema')) {
    const whys = (project.fiveWhys || []).filter(Boolean);
    if (whys.length > 0) {
      const lastWhy = whys[whys.length - 1];
      return `Aplicando a técnica dos 5 Porquês no Gemba, a equipe aprofundou a investigação até identificar que a causa raiz fundamental foi: ${lastWhy.replace(/^[0-9]+[\.\)\-]?\s*/, '')}, eliminando o problema na sua origem.`;
    }
    return `No diagnóstico inicial da fase Plan, a causa raiz comprovada no posto foi: ${project.problemStatement || project.description || 'instabilidade no fluxo de trabalho'}, que foi prontamente atacada pelas ações corretivas.`;
  }
  if (q.includes('quanto economizou') || q.includes('economia') || q.includes('financeiro') || q.includes('custo') || q.includes('ganho')) {
    return `Em termos financeiros, este projeto alcançou um ganho bruto homologado de ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} reais ao ano, com lucro líquido de ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} reais e uma recuperação de ${project.hoursSaved || 0} horas produtivas para a operação.`;
  }
  if (q.includes('líder') || q.includes('lider') || q.includes('quem fez') || q.includes('equipe') || q.includes('participante')) {
    const leader = project.leaderName || project.assignedAgentName || 'Líder Lean';
    const team = (project.teamMembers || []).join(', ');
    return `O projeto foi conduzido com liderança de ${leader}${team ? `, contando com a participação ativa e engajamento direto de ${team}` : ''}, atuando fortemente no setor de ${project.originSectorName || 'Fábrica'}.`;
  }

  return `O projeto "${project.title}" no setor de ${project.originSectorName || 'Fábrica'} alcançou plenamente os objetivos traçados, atingindo ${project.achievedValue ?? project.targetGoalValue ?? '--'} ${project.targetMetricUnit || ''} e assegurando ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} reais ao ano em ganhos sustentáveis.`;
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

SUA RESPOSTA DIDÁTICA E ELEGANTE COMO CO-APRESENTADOR (2 a 3 frases faladas em português do Brasil):`;

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
              temperature: 0.4,
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

      if (!response.ok) continue;

      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioPart = data?.candidates?.[0]?.content?.parts?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.inlineData && p.inlineData.data
      );

      if (audioPart?.inlineData?.data) {
        const rawMime = audioPart.inlineData.mimeType || '';
        const rawData = audioPart.inlineData.data;

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
      // continua
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

  // ETAPA 2: Síntese de áudio
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
