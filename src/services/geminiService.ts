import { LeanAction, ActionChecklistItem } from '@/lib/types';

// =============================================================================
// PERFIL DO SENSEI - Configuração centralizada do assistente de voz
// =============================================================================
export const SENSEI_PROFILE = {
  name: 'Sensei',
  title: 'Mestre e Co-Apresentador Lean Manufacturing',
  model: 'gemini-2.5-flash',
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
}

// =============================================================================
// ARMAZENAMENTO LOCAL - Chave e preferências
// =============================================================================
const STORAGE_KEY = 'sensei_gemini_api_key';
const STORAGE_VOICE_KEY = 'sensei_voice_preference';

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
// SYSTEM PROMPT DO SENSEI (usado tanto para áudio quanto para texto)
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
// CONTEXTO DO PROJETO (dossiê para o Gemini)
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
// FALLBACK LOCAL (usado apenas quando NÃO há chave Gemini configurada)
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
// MODELOS DE ÁUDIO PARA TENTATIVA (em ordem de preferência)
// =============================================================================
const AUDIO_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

const TEXT_MODEL = 'gemini-2.5-flash';

// =============================================================================
// ETAPA 1: Gera a resposta textual do Sensei (modelo comprovado)
// =============================================================================
async function askSenseiText(
  question: string,
  project: LeanAction,
  apiKey: string,
): Promise<string> {
  const projectContext = buildProjectContext(project);
  const systemPrompt = getSenseiSystemPrompt();

  const promptText = `${systemPrompt}

${projectContext}

PERGUNTA FEITA NA SALA DE APRESENTAÇÃO:
"${question}"

SUA RESPOSTA DIDÁTICA E ELEGANTE COMO CO-APRESENTADOR (2 a 4 frases faladas em português do Brasil):`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${apiKey}`,
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

    if (!response.ok) {
      console.warn('[Sensei] Erro na geração de texto:', await response.text());
      return getLocalFallbackAnswer(question, project);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || getLocalFallbackAnswer(question, project);
  } catch (err) {
    console.error('[Sensei] Falha na etapa de texto:', err);
    return getLocalFallbackAnswer(question, project);
  }
}

// =============================================================================
// ETAPA 2: Sintetiza o texto em áudio de alta qualidade via Gemini TTS
// Tenta múltiplos modelos em sequência até obter áudio
// =============================================================================
async function synthesizeWithGeminiTTS(
  text: string,
  apiKey: string,
  voiceName: string,
): Promise<{ audioBase64: string; mimeType: string } | null> {
  const cleanText = text
    .replace(/[*_#`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  for (const model of AUDIO_MODELS) {
    try {
      console.log(`[Sensei] Tentando síntese de áudio com modelo: ${model}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: cleanText }],
              },
            ],
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
        const errText = await response.text();
        console.warn(`[Sensei] Modelo ${model} retornou erro:`, errText);
        continue; // Tenta o próximo modelo
      }

      const data = await response.json();

      // Busca a parte de áudio inline na resposta
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioPart = data?.candidates?.[0]?.content?.parts?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.inlineData && p.inlineData.data
      );

      if (audioPart?.inlineData) {
        console.log(`[Sensei] ✅ Áudio gerado com sucesso pelo modelo: ${model}`);
        return {
          audioBase64: audioPart.inlineData.data,
          mimeType: audioPart.inlineData.mimeType || 'audio/L16;rate=24000',
        };
      }

      console.warn(`[Sensei] Modelo ${model} não retornou áudio, tentando próximo...`);
    } catch (err) {
      console.warn(`[Sensei] Erro com modelo ${model}:`, err);
      continue; // Tenta o próximo modelo
    }
  }

  console.warn('[Sensei] Nenhum modelo de áudio funcionou.');
  return null;
}

// =============================================================================
// FUNÇÃO PRINCIPAL: askSenseiWithVoice
// Etapa 1: Gera a resposta textual inteligente (modelo comprovado)
// Etapa 2: Sintetiza essa resposta em voz ultra-natural (tentando múltiplos modelos TTS)
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

  // ETAPA 2: Sintetiza o áudio da resposta
  const voiceName = getVoicePreference();
  const audioResult = await synthesizeWithGeminiTTS(answerText, effectiveKey, voiceName);

  if (audioResult) {
    return {
      audioBase64: audioResult.audioBase64,
      mimeType: audioResult.mimeType,
      textFallback: answerText,
      source: 'gemini_voice',
    };
  }

  // Se nenhum modelo de áudio funcionou, retorna o texto como fallback
  return {
    audioBase64: null,
    mimeType: null,
    textFallback: answerText,
    source: 'text_fallback',
  };
}

