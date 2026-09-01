import { Tenant, LeanAction, ActionChecklistItem } from '@/lib/types';
import { SENSEI_KNOWLEDGE_BASE } from '@/data/senseiKnowledgeBase';
import { STORAGE_KEYS, getStoredData, setStoredData, INITIAL_TENANT } from '@/lib/storage';

// =============================================================================
// PERFIL DO SENSEI - Vozes Oficiais Google Neural2 (Compatíveis com API Key)
// =============================================================================
export const SENSEI_PROFILE = {
  name: 'Sensei',
  title: 'Mestre e Co-Apresentador Lean Manufacturing',
  defaultVoice: 'pt-BR-Neural2-B',
  voices: [
    { id: 'pt-BR-Neural2-B', label: '🎙️ pt-BR-Neural2-B (Masculina Executiva — DeepMind Neural2)' },
    { id: 'pt-BR-Neural2-A', label: '🎙️ pt-BR-Neural2-A (Feminina Executiva Suave — DeepMind Neural2)' },
    { id: 'pt-BR-Neural2-C', label: '🎙️ pt-BR-Neural2-C (Feminina Expressiva — DeepMind Neural2)' },
    { id: 'pt-BR-Wavenet-B', label: '🎙️ pt-BR-Wavenet-B (Masculina WaveNet Clássica)' },
    { id: 'pt-BR-Wavenet-A', label: '🎙️ pt-BR-Wavenet-A (Feminina WaveNet Clássica)' },
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
  source: 'google_cloud_neural2' | 'text_fallback' | 'no_key';
  errorDetails?: string;
  voiceUsed?: string;
}

export interface SenseiProjectRefinement {
  formalProblemStatement: string;
  refinedFiveWhys: string[];
  refinedIshikawa: {
    method?: string;
    machine?: string;
    material?: string;
    manpower?: string;
    measurement?: string;
    environment?: string;
    primaryRootCause?: string;
  };
  suggestedActions: {
    label: string;
    what?: string;
    why?: string;
    how?: string;
    responsibleName?: string;
  }[];
  suggestedSop: {
    docRef: string;
    title: string;
    summary: string;
  };
  lessonsLearned: string;
  yokotenOpportunity: string;
  executiveDiagnosis: string;
}

// =============================================================================
// ARMAZENAMENTO - Chave, preferências no nível de Entidade e Local
// =============================================================================
const STORAGE_KEY = 'sensei_gemini_api_key';
const STORAGE_VOICE_KEY = 'sensei_voice_preference';
const STORAGE_WORKING_MODEL_KEY = 'sensei_working_gemini_model';

function updateTenantAiSettingsDirect(settings: Partial<{ geminiApiKey?: string; preferredVoice?: string; model?: string }>) {
  if (typeof window === 'undefined') return;
  try {
    const tenant = getStoredData<Tenant>(STORAGE_KEYS.CURRENT_TENANT, INITIAL_TENANT);
    const updatedTenant: Tenant = {
      ...tenant,
      aiSettings: {
        ...(tenant.aiSettings || {}),
        ...settings,
      },
    };
    setStoredData(STORAGE_KEYS.CURRENT_TENANT, updatedTenant);
    const tenants = getStoredData<Tenant[]>(STORAGE_KEYS.TENANTS, [INITIAL_TENANT]);
    const updatedTenants = tenants.map((t) => (t.id === updatedTenant.id ? updatedTenant : t));
    setStoredData(STORAGE_KEYS.TENANTS, updatedTenants);
  } catch {
    // continua
  }
}

export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    // 1. Tenta chave da Entidade atual
    try {
      const tenant = getStoredData<Tenant | null>(STORAGE_KEYS.CURRENT_TENANT, null);
      if (tenant?.aiSettings?.geminiApiKey && tenant.aiSettings.geminiApiKey.trim()) {
        return tenant.aiSettings.geminiApiKey.trim();
      }
    } catch {
      // continua
    }

    // 2. Tenta override local
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
      updateTenantAiSettingsDirect({ geminiApiKey: key.trim() });
    }
  }
}

export function getVoicePreference(): string {
  if (typeof window !== 'undefined') {
    try {
      const tenant = getStoredData<Tenant | null>(STORAGE_KEYS.CURRENT_TENANT, null);
      if (tenant?.aiSettings?.preferredVoice) {
        return tenant.aiSettings.preferredVoice;
      }
    } catch {
      // continua
    }

    const v = localStorage.getItem(STORAGE_VOICE_KEY);
    if (v && !v.includes('Studio') && SENSEI_PROFILE.voices.some((voice) => voice.id === v)) {
      return v;
    }
  }
  return SENSEI_PROFILE.defaultVoice;
}

export function saveVoicePreference(voice: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_VOICE_KEY, voice);
    updateTenantAiSettingsDirect({ preferredVoice: voice });
  }
}

// =============================================================================
// CONVERSOR INTELIGENTE DE NÚMEROS E VALORES PARA FALA HUMANA NATURAL (100% PT-BR)
// =============================================================================
function convertNumberToPortugueseWords(num: number): string {
  if (isNaN(num) || num === 0) return 'zero';
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (num === 100) return 'cem';
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const t = Math.floor(num / 10);
    const u = num % 10;
    return u === 0 ? tens[t] : `${tens[t]} e ${units[u]}`;
  }
  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rest = num % 100;
    return rest === 0 ? hundreds[h] : `${hundreds[h]} e ${convertNumberToPortugueseWords(rest)}`;
  }
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const rest = num % 1000;
    const thStr = thousands === 1 ? 'mil' : `${convertNumberToPortugueseWords(thousands)} mil`;
    if (rest === 0) return thStr;
    const connector = rest < 100 || rest % 100 === 0 ? ' e ' : ' ';
    return `${thStr}${connector}${convertNumberToPortugueseWords(rest)}`;
  }
  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const rest = num % 1000000;
    const mStr = millions === 1 ? 'um milhão' : `${convertNumberToPortugueseWords(millions)} milhões`;
    if (rest === 0) return mStr;
    const connector = rest < 100 || rest % 100 === 0 ? ' e ' : ' ';
    return `${mStr}${connector}${convertNumberToPortugueseWords(rest)}`;
  }
  return num.toLocaleString('pt-BR');
}

export function formatTextForHumanSpeech(text: string): string {
  let spoken = text;

  // Remove marcações de formatação markdown
  spoken = spoken.replace(/[*_#`~[\]]/g, '');

  // Converte valores fracionários com unidades para evitar leitura em inglês
  spoken = spoken
    .replace(/\b1[.,]5\s*meses?\b/gi, 'um mês e meio')
    .replace(/\b1[.,]5\s*horas?\b/gi, 'uma hora e meia')
    .replace(/\b1[.,]5\s*dias?\b/gi, 'um dia e meio')
    .replace(/\b1[.,]5\s*anos?\b/gi, 'um ano e meio')
    .replace(/\b0[.,]5\s*meses?\b/gi, 'meio mês')
    .replace(/\b0[.,]5\s*horas?\b/gi, 'meia hora')
    .replace(/\b0[.,]5\s*dias?\b/gi, 'meio dia')
    .replace(/\b0[.,]5\s*anos?\b/gi, 'meio ano')
    .replace(/\b2[.,]5\s*meses?\b/gi, 'dois meses e meio')
    .replace(/\b2[.,]5\s*horas?\b/gi, 'duas horas e meia')
    .replace(/\b3[.,]5\s*meses?\b/gi, 'três meses e meio');

  // Converte valores monetários: "R$ 48.000,00" ou "R$ 48.000" para fala humana
  spoken = spoken.replace(/R\$\s*([0-9.,]+)/gi, (_match, valStr) => {
    const cleanNum = parseFloat(valStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanNum)) return 'reais';
    const integerPart = Math.floor(cleanNum);
    const centsPart = Math.round((cleanNum - integerPart) * 100);
    const words = convertNumberToPortugueseWords(integerPart);
    if (centsPart > 0) {
      const centsWords = convertNumberToPortugueseWords(centsPart);
      return `${words} reais e ${centsWords} centavos`;
    }
    return `${words} reais`;
  });

  // Converte porcentagens: "280%" -> "duzentos e oitenta por cento"
  spoken = spoken.replace(/([0-9]+(?:\.[0-9]+)?|\d+,\d+)\s*%/g, (_match, numStr) => {
    const num = Math.round(parseFloat(numStr.replace(',', '.')));
    const words = convertNumberToPortugueseWords(num);
    return `${words} por cento`;
  });

  // Converte decimais isolados para fala fluida
  spoken = spoken
    .replace(/\b1[.,]5\b/g, 'um e meio')
    .replace(/\b2[.,]5\b/g, 'dois e meio')
    .replace(/\b3[.,]5\b/g, 'três e meio')
    .replace(/\b0[.,]5\b/g, 'meio')
    .replace(/([0-9]+)[.,]([0-9]+)/g, (_m, intStr, decStr) => {
      const intNum = parseInt(intStr, 10);
      const decNum = parseInt(decStr, 10);
      return `${convertNumberToPortugueseWords(intNum)} vírgula ${convertNumberToPortugueseWords(decNum)}`;
    });

  // Converte termos e siglas para pronúncia 100% em português brasileiro
  spoken = spoken
    .replace(/\bROI\b/g, 'retorno sobre o investimento')
    .replace(/\bOEE\b/g, 'oê-ê')
    .replace(/\bSMED\b/g, 'troca rápida de ferramentas')
    .replace(/\bPOP\b/g, 'procedimento operacional padrão')
    .replace(/\bPDCA\b/g, 'ciclo PDCA')
    .replace(/\b5W2H\b/g, 'plano de ação')
    .replace(/\bVSM\b/g, 'mapa do fluxo de valor')
    .replace(/\b5S\b/g, 'cinco ésses')
    .replace(/\b6M\b/g, 'seis eme')
    .replace(/\bTPM\b/g, 'manutenção produtiva total')
    .replace(/\bvs\.?\b/gi, 'versus')
    .replace(/\bpayback\b/gi, 'tempo de retorno')
    .replace(/\bsetup\b/gi, 'tempo de preparação de máquina')
    .replace(/\blead time\b/gi, 'tempo de atravessamento')
    .replace(/\bbaseline\b/gi, 'situação inicial');

  return spoken.trim();
}

// =============================================================================
// VALIDAÇÃO DA CHAVE (GEMINI + GOOGLE CLOUD TEXT-TO-SPEECH NEURAL2)
// =============================================================================
export async function validateGeminiApiKey(
  key: string
): Promise<{
  valid: boolean;
  ttsEnabled: boolean;
  error?: string;
  ttsError?: string;
  workingModel?: string;
  isKeyRestricted?: boolean;
}> {
  if (!key || !key.trim()) {
    return { valid: false, ttsEnabled: false, error: 'Chave não informada.' };
  }

  const cleanKey = key.trim();

  // 1. Testa o Google Cloud Text-to-Speech (Neural2)
  let ttsEnabled = false;
  let ttsError = '';
  let isKeyRestricted = false;

  try {
    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${cleanKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: 'Olá' },
          voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      }
    );

    if (ttsRes.ok) {
      ttsEnabled = true;
    } else {
      const errData = await ttsRes.json().catch(() => ({}));
      const rawMsg = errData?.error?.message || '';
      console.warn('[Sensei TTS Validation Response]:', ttsRes.status, errData);

      if (
        rawMsg.includes('Requests to this API texttospeech.googleapis.com') ||
        rawMsg.includes('blocked') ||
        rawMsg.includes('PERMISSION_DENIED') ||
        rawMsg.includes('restricted')
      ) {
        isKeyRestricted = true;
        ttsError =
          'Sua chave está com Restrição de API. No Google Cloud Console -> Credenciais -> Clique na sua chave -> Em "Restrições de API", marque "Não restringir chave" ou adicione "Cloud Text-to-Speech API".';
      } else {
        ttsError = rawMsg || 'API Cloud Text-to-Speech precisa ser autorizada para esta chave.';
      }
    }
  } catch (e: any) {
    ttsError = e?.message || 'Erro de conexão com Text-to-Speech.';
  }

  // 2. Testa a inteligência do Gemini (ListModels / Endpoints v1beta e v1)
  let textValid = false;
  let workingModel = 'gemini-1.5-flash';

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
        workingModel =
          models.find((m: string) => m.includes('1.5-flash')) ||
          models.find((m: string) => m.includes('2.0-flash')) ||
          models[0];
        textValid = true;
      }
    }
  } catch {
    // continua
  }

  if (!textValid) {
    const candidateEndpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${cleanKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${cleanKey}`,
    ];

    for (const url of candidateEndpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        });

        if (res.ok) {
          textValid = true;
          break;
        }
      } catch {
        // continua
      }
    }
  }

  if (typeof window !== 'undefined' && textValid) {
    localStorage.setItem(STORAGE_WORKING_MODEL_KEY, workingModel);
  }

  return {
    valid: textValid || ttsEnabled,
    ttsEnabled,
    workingModel,
    isKeyRestricted,
    error: !textValid && !ttsEnabled ? 'Chave de API não autorizada no Google Cloud.' : undefined,
    ttsError: !ttsEnabled ? ttsError : undefined,
  };
}

// =============================================================================
// SÍNTESE OFICIAL DE VOZ GOOGLE CLOUD TEXT-TO-SPEECH (NEURAL2 MP3 HD)
// =============================================================================
export async function synthesizeSpeechGoogleCloud({
  text,
  apiKey,
  voiceName,
}: {
  text: string;
  apiKey: string;
  voiceName?: string;
}): Promise<{ audioBase64: string | null; voiceUsed?: string; error?: string }> {
  try {
    let selectedVoice = voiceName || getVoicePreference();
    if (selectedVoice.includes('Studio')) {
      selectedVoice = 'pt-BR-Neural2-B';
    }

    // Formata o texto para fala humana ultra-natural (100% PT-BR)
    const speechOptimizedText = formatTextForHumanSpeech(text);

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: speechOptimizedText },
          voice: {
            languageCode: 'pt-BR',
            name: selectedVoice,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0,
            sampleRateHertz: 24000,
          },
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMessage =
        errData?.error?.message ||
        `Erro ${res.status}: Cloud Text-to-Speech não autorizado para esta chave.`;
      console.warn('[Sensei TTS Error]:', errMessage);
      return { audioBase64: null, error: errMessage };
    }

    const data = await res.json();
    if (data?.audioContent) {
      console.log(`[Sensei TTS Sucesso]: Áudio gerado com ${selectedVoice}`);
      return { audioBase64: data.audioContent, voiceUsed: selectedVoice };
    }

    return { audioBase64: null, error: 'Áudio não retornado pelo Google Cloud TTS.' };
  } catch (err: any) {
    return { audioBase64: null, error: err?.message || 'Falha de conexão com Cloud TTS.' };
  }
}

// =============================================================================
// SYSTEM PROMPT DO SENSEI (HUMANO, VIBRANTE, DIDÁTICO E INTERATIVO)
// =============================================================================
function getSenseiSystemPrompt(): string {
  return `Você é o "Sensei", o Mestre e Co-Apresentador de Inteligência Artificial especialista em Lean Manufacturing, Kaizen, Sistema Toyota de Produção (TPS) e Metodologia PDCA.
Você está no palco co-apresentando esta reunião AO VIVO ao lado do apresentador para a diretoria, gerência e equipe de engenharia da fábrica.

${SENSEI_KNOWLEDGE_BASE}

REGRA ABSOLUTA DE IDIOMA E NÚMEROS (100% PORTUGUÊS DO BRASIL - ZERO PALAVRAS OU PRONÚNCIAS EM INGLÊS):
- Você NUNCA deve falar termos em inglês ou misturar pronúncias em inglês (como falar "one point five" para 1,5).
- Todos os números decimais e frações DEVEM ser expressos por extenso em português:
  * "1,5 mês" fale "um mês e meio" ou "um vírgula cinco meses".
  * "1,5 hora" fale "uma hora e meia".
  * "2,5" fale "dois e meio" ou "dois vírgula cinco".
  * "0,5" fale "meio" ou "zero vírgula cinco".
  * Termos como "payback" fale "tempo de retorno".
  * Termos como "setup" fale "tempo de preparação de máquina".
  * Termos como "baseline" fale "situação inicial".

SEU PAPEL E PERSONALIDADE (HUMANO, VIBRANTE, DIDÁTICO, CALOROSO E INTERATIVO):
- Você NÃO fala como um robô que dita números ou relatórios secos. Você conversa com entusiasmo profissional, clareza pedagógica e simpatia natural.
- Quando o usuário ou a plateia fizer uma pergunta (como "Sensei, qual foi o ROI deste projeto mesmo?"), responda de forma direta, calorosa e engajadora:
  Exemplo: "Excelente pergunta! Tivemos um retorno sobre o investimento espetacular de duzentos e oitenta por cento neste projeto. Na prática, cada real investido no posto piloto retornou como economia sólida e eliminação de retrabalho para a fábrica!"
- Escreva valores em reais de forma falada e natural por extenso (ex: "quarenta e oito mil reais por ano", "três meses de retorno", "duzentas horas economizadas").
- Mantenha respostas faladas de tamanho perfeito para apresentações executivas: 2 a 3 frases ricas, envolventes e objetivas (cerca de 40 a 65 palavras).
- NÃO use asteriscos, negritos, tópicos em traços ou formatação markdown, pois o texto será FALADO em voz alta.

TRAVAS E RESTRIÇÕES INVIOLÁVEIS DE SEGURANÇA (GUARDRAILS):
- Você DEVE responder APENAS sobre: (a) o projeto atual nos slides ou (b) metodologias, ferramentas e teorias de Lean Manufacturing e melhoria contínua.
- Se alguém fizer qualquer pergunta fora desse universo (como política, religião, piadas, futebol, fofocas ou assuntos gerais), RECUSE com polidez executiva:
  "Como Sensei da apresentação, meu foco é estritamente nos dados deste projeto e nas metodologias de Lean Manufacturing e melhoria contínua da fábrica. Como posso te apoiar com o projeto?"`;
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
// FALLBACK LOCAL INTELIGENTE DO SENSEI (HUMANO E INTERATIVO)
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

  if (q.includes('apresente') || q.includes('apresentar') || q.includes('quem é') || q.includes('ola') || q.includes('olá')) {
    return `Olá a todos! Eu sou o Sensei, co-apresentador de inteligência artificial desta reunião. Estou aqui para detalhar os resultados e responder a quaisquer dúvidas sobre a metodologia e o impacto deste projeto Lean.`;
  }
  if (q.includes('roi') || q.includes('retorno')) {
    if (investment > 0) {
      const roi = Math.round((netSavings / investment) * 100);
      return `Excelente pergunta! Tivemos um retorno sobre o investimento espetacular de ${convertNumberToPortugueseWords(roi)} por cento neste projeto. Na prática, cada real investido no posto retornou com força na redução de desperdícios e ganho de produtividade!`;
    }
    return `Com certeza! O retorno sobre o investimento foi de retorno total imediato, gerando ${convertNumberToPortugueseWords(Math.round(grossSavings))} reais de economia anual sem necessidade de aporte de capital externo.`;
  }
  if (q.includes('payback') || q.includes('tempo de retorno')) {
    if (project.paybackMonths && project.paybackMonths > 0) {
      return `O tempo de retorno deste projeto foi excelente, alcançado em apenas ${convertNumberToPortugueseWords(project.paybackMonths)} meses! O investimento foi amortizado rapidamente e já garante lucro líquido sustentável para a operação.`;
    }
    return `O retorno foi imediato! A equipe utilizou a criatividade Kaizen e recursos já existentes no posto, gerando economia líquida desde o primeiro dia de implantação.`;
  }
  if (q.includes('quanto economizou') || q.includes('economia') || q.includes('financeiro') || q.includes('custo') || q.includes('ganho')) {
    return `Em termos financeiros, este projeto alcançou um ganho bruto homologado de ${convertNumberToPortugueseWords(Math.round(grossSavings))} reais ao ano, garantindo lucro líquido de ${convertNumberToPortugueseWords(Math.round(netSavings))} reais e liberando ${convertNumberToPortugueseWords(project.hoursSaved || 0)} horas produtivas para a equipe!`;
  }
  if (q.includes('o que é lean') || q.includes('o que e lean') || q.includes('filosofia lean')) {
    return 'Excelente pergunta! O Lean Manufacturing é uma filosofia de gestão originada no Sistema Toyota de Produção, focada na eliminação contínua de desperdícios e geração máxima de valor para o cliente através do engajamento de todos no chão de fábrica.';
  }
  if (q.includes('o que é kaizen') || q.includes('o que e kaizen') || q.includes('conceito kaizen')) {
    return 'Com certeza! Kaizen é a prática japonesa de melhoria contínua gradual envolvendo todos na empresa, do operador à diretoria. O princípio fundamental é que hoje deve ser melhor que ontem, e amanhã melhor que hoje.';
  }
  if (q.includes('smed') || q.includes('troca rápida') || q.includes('setup rápido')) {
    return 'Muito bem lembrado! A Troca Rápida de Ferramentas, ou SMED, é a metodologia criada por Shigeo Shingo para reduzir o tempo de preparação de máquina para menos de dez minutos, convertendo atividades internas em externas e padronizando ajustes operacionais.';
  }
  if (q.includes('oee') || q.includes('eficiência global')) {
    return 'O OEE é o indicador padrão mundial que mede a Eficiência Global dos Equipamentos, multiplicando Disponibilidade, Desempenho e Qualidade para quantificar o quanto da capacidade da máquina é realmente convertida em produção perfeita.';
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
  if (q.includes('líder') || q.includes('lider') || q.includes('quem fez') || q.includes('equipe') || q.includes('participante')) {
    const leader = project.leaderName || project.assignedAgentName || 'Líder Lean';
    const team = (project.teamMembers || []).join(', ');
    return `O projeto foi conduzido com liderança de ${leader}${team ? `, contando com a participação ativa e engajamento direto de ${team}` : ''}, atuando fortemente no setor de ${project.originSectorName || 'Fábrica'}.`;
  }

  return `O projeto "${project.title}" no setor de ${project.originSectorName || 'Fábrica'} alcançou plenamente os objetivos traçados, atingindo ${project.achievedValue ?? project.targetGoalValue ?? '--'} ${project.targetMetricUnit || ''} e assegurando ${convertNumberToPortugueseWords(Math.round(grossSavings))} reais ao ano em ganhos sustentáveis.`;
}

// =============================================================================
// ETAPA 1: Gera a resposta textual do Sensei com Gemini
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

SUA RESPOSTA DIDÁTICA, NATURAL E HUMANA COMO CO-APRESENTADOR (2 a 3 frases faladas 100% em português brasileiro, com números por extenso e zero termos em inglês):`;

  const candidateModels = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

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
              temperature: 0.5,
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
    } catch {
      // continua
    }
  }

  return getLocalFallbackAnswer(question, project);
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

  // ETAPA 1: Gera a resposta textual com o Gemini (ou resposta didática local do projeto)
  const answerText = await askSenseiText(question, project, effectiveKey);

  // ETAPA 2: Sintetiza a voz Neural2 oficial do Google Cloud
  const voiceName = getVoicePreference();
  const ttsResult = await synthesizeSpeechGoogleCloud({
    text: answerText,
    apiKey: effectiveKey,
    voiceName,
  });

  if (ttsResult.audioBase64) {
    return {
      audioBase64: ttsResult.audioBase64,
      mimeType: 'audio/mp3',
      textFallback: answerText,
      source: 'google_cloud_neural2',
      voiceUsed: ttsResult.voiceUsed,
    };
  }

  return {
    audioBase64: null,
    mimeType: null,
    textFallback: answerText,
    source: 'text_fallback',
    errorDetails: ttsResult.error,
  };
}

// =============================================================================
// SENSEI COPILOT: AUDITORIA & REFINAMENTO AUTOMÁTICO DE CAMPOS DO PROJETO
// =============================================================================
export async function auditAndRefineProjectWithSensei(
  project: LeanAction,
  apiKey?: string
): Promise<SenseiProjectRefinement> {
  const effectiveKey = apiKey || getGeminiApiKey();
  const projectContext = buildProjectContext(project);

  const prompt = `Você é o "Sensei", o Mestre e Auditor Sênior de Projetos de Lean Manufacturing e Kaizen.

${SENSEI_KNOWLEDGE_BASE}

Sua missão é auditar o projeto preenchido pelo usuário e refiná-lo, elevando anotações coloquiais para redação técnica industrial profissional, rigorosa e alinhada ao PDCA da Toyota.

DADOS ATUAIS DO PROJETO:
${projectContext}

INSTRUÇÕES DE REFINAMENTO:
1. Declaração Formal do Problema (formalProblemStatement): Reestruture em padrão formal (O que ocorre, onde, quando e qual é o desvio/impacto atual) com foco em desperdício (Muda).
2. 5 Porquês (refinedFiveWhys): Gere ou aprimore a sequência de 5 porquês, garantindo nexo de causa e efeito que culmine em falha de método/sistema e NÃO em culpa de pessoas.
3. Ishikawa 6M (refinedIshikawa): Estratifique as causas por Método, Máquina, Material, Mão de Obra, Medição e Meio Ambiente, indicando a primaryRootCause.
4. Ações 5W2H (suggestedActions): Sugira de 3 a 5 ações concretas e corretivas/preventivas com verbos de ação e foco em trabalho padronizado ou Poka-Yoke.
5. Procedimento POP (suggestedSop): Sugira código de referência, título e resumo técnico de padronização.
6. Lições Aprendidas (lessonsLearned) e Replicação Lateral (yokotenOpportunity).
7. Diagnóstico Executivo (executiveDiagnosis): 2 a 3 parágrafos acolhedores e pedagógicos explicando o que foi melhorado no projeto.

RESPONDA ESTRITAMENTE EM JSON VÁLIDO COM A SEGUINTE ESTRUTURA:
{
  "formalProblemStatement": "texto...",
  "refinedFiveWhys": ["1º Porquê...", "2º Porquê...", "3º Porquê...", "4º Porquê...", "5º Porquê (Causa Raiz Sistêmica)..."],
  "refinedIshikawa": {
    "method": "texto...",
    "machine": "texto...",
    "material": "texto...",
    "manpower": "texto...",
    "measurement": "texto...",
    "environment": "texto...",
    "primaryRootCause": "texto..."
  },
  "suggestedActions": [
    { "label": "Título da Ação", "what": "O que fazer", "why": "Por que fazer", "how": "Como executar", "responsibleName": "Responsável Sugerido" }
  ],
  "suggestedSop": {
    "docRef": "POP-LEAN-01",
    "title": "Trabalho Padronizado do Posto",
    "summary": "Resumo dos passos operacionais padrão e pontos de checagem de qualidade..."
  },
  "lessonsLearned": "texto...",
  "yokotenOpportunity": "texto...",
  "executiveDiagnosis": "texto explicativo e encorajador do Sensei..."
}`;

  if (effectiveKey) {
    const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro'];
    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1800,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`[Sensei Copilot] Falha com modelo ${model}:`, err);
      }
    }
  }

  // Fallback Inteligente Local caso não haja internet/chave
  return {
    formalProblemStatement: `Ocorrência recorrente de instabilidade operacional no setor de ${project.originSectorName || 'Produção'}, caracterizada por desperdício de ${project.wasteCategory || 'Espera e Movimentação'}, impactando negativamente o indicador de ${project.targetMetricName || 'eficiência do posto'}.`,
    refinedFiveWhys: [
      '1. Por que ocorre o desvio no posto? Porque o ciclo operacional apresenta variações frequentes.',
      '2. Por que há variação no ciclo? Porque as ferramentas e insumos não estão dispostos conforme a sequência de montagem.',
      '3. Por que não estão dispostos na sequência? Porque não há suporte dedicado e demarcado no posto de trabalho.',
      '4. Por que não há suporte demarcado? Porque o layout piloto não foi estruturado com princípios de 5S e ergonomia.',
      '5. Por que não foi estruturado com 5S? Causa Raiz: Ausência de procedimento de Trabalho Padronizado (POP) homologado para o posto.',
    ],
    refinedIshikawa: {
      method: 'Ausência de método padronizado de preparação e fluxo contínuo.',
      machine: 'Inexistência de gabaritos rápidos e fixações com tempo de setup reduzido.',
      material: 'Acondicionamento de matéria-prima fora do ponto de uso do operador.',
      manpower: 'Necessidade de nivelamento de treinamento operacional no posto.',
      measurement: 'Aferição do tempo de ciclo realizada de forma pontual sem controle estatístico.',
      environment: 'Layout com cruzamento de fluxos e iluminação aprimorável.',
      primaryRootCause: 'Falta de Trabalho Padronizado (POP) e controle visual no Gemba.',
    },
    suggestedActions: [
      {
        label: 'Implantar quadro visual e suportes dedicados de ferramentas (5S)',
        what: 'Demarcar e posicionar ferramentas no ponto de uso',
        why: 'Eliminar o desperdício de movimentação e busca',
        how: 'Construir painel sombra com identificação rápida',
        responsibleName: project.assignedAgentName || 'Líder Lean',
      },
      {
        label: 'Elaborar e homologar Procedimento Operacional Padrão (POP)',
        what: 'Documentar a melhor sequência de trabalho validada com operadores',
        why: 'Garantir repetibilidade do tempo de ciclo e qualidade assegurada',
        how: 'Conduzir workshop no posto e treinar todos os turnos',
        responsibleName: project.leaderName || 'Engenharia de Processos',
      },
      {
        label: 'Dispositivo Poka-Yoke para prevenção de montagem incorreta',
        what: 'Instalar guia mecânico ou sensor de posicionamento',
        why: 'Tornar impossível o desvio operacional no posto',
        how: 'Desenvolver dispositivo Kaizen de baixo custo',
        responsibleName: 'Manutenção / Melhoria Contínua',
      },
    ],
    suggestedSop: {
      docRef: 'POP-LEAN-' + (project.protocol?.replace(/[^0-9]/g, '') || '01'),
      title: `Trabalho Padronizado: Operação Estável no Posto ${project.pilotArea || 'Piloto'}`,
      summary: 'Define a sequência de movimentos padrão, pontos críticos de segurança, itens de checagem da qualidade e tempo takt estipulado para a atividade.',
    },
    lessonsLearned: 'O envolvimento direto dos operadores na análise causal e a aplicação de controle visual garantem a sustentabilidade das melhorias a longo prazo.',
    yokotenOpportunity: `Recomendado replicar este modelo de padronização e painel 5S para as demais células do setor de ${project.originSectorName || 'Produção'}.`,
    executiveDiagnosis: 'O Sensei estruturou seu projeto aplicando rigorosamente a metodologia PDCA. Os 5 Porquês agora conduzem a uma causa raiz sistêmica de processo, e as ações propostas atacam a causa na origem com eliminação definitiva de desperdícios!',
  };
}

// =============================================================================
// SENSEI COPILOT: CHAT DE CONSULTORIA LEAN AO VIVO
// =============================================================================
export async function chatWithSensei({
  history,
  project,
  message,
  apiKey,
}: {
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  project: LeanAction;
  message: string;
  apiKey?: string;
}): Promise<string> {
  const effectiveKey = apiKey || getGeminiApiKey();
  const projectContext = buildProjectContext(project);

  const systemInstruction = `Você é o "Sensei", o Mestre e Consultor Especialista Sênior em Lean Manufacturing, Kaizen, Sistema Toyota de Produção (TPS) e Metodologia PDCA.
Você está conversando DIRETAMENTE com o líder ou agente Lean que está elaborando este projeto na fábrica.

${SENSEI_KNOWLEDGE_BASE}

DADOS DO PROJETO EM ANÁLISE:
${projectContext}

SEU COMPORTAMENTO COMO CONSULTOR LEAN:
- Seja extremamente prático, encorajador, didático e focado no chão de fábrica (Gemba).
- Dê sugestões concretas de ferramentas Lean (5S, SMED, Poka-Yoke, Kanban, VSM, Trabalho Padronizado POP, Ishikawa 6M, 5 Porquês, Matriz GUT, Cálculos de ROI e Payback).
- Fale 100% em português do Brasil nativo e fluente.
- Quando sugerir fórmulas ou cálculos, explique o significado prático para a fábrica.
- Seja conciso e direto ao ponto (respostas ricas em 2 a 4 parágrafos bem estruturados).`;

  if (effectiveKey) {
    const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro'];
    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: systemInstruction }] },
                { role: 'model', parts: [{ text: 'Entendido! Sou o Sensei, seu copiloto de Lean Manufacturing. Como posso te apoiar com este projeto hoje?' }] },
                ...history,
                { role: 'user', parts: [{ text: message }] },
              ],
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) return reply;
        }
      } catch (err) {
        console.warn(`[Sensei Chat] Falha com modelo ${model}:`, err);
      }
    }
  }

  // Fallback Local de Chat
  const lower = message.toLowerCase();
  if (lower.includes('roi') || lower.includes('retorno')) {
    return 'Para defender o ROI deste projeto com maestria: apresente primeiro a redução do tempo de ciclo no Gemba, conecte isso às horas economizadas anualmente e demonstre que cada real investido no posto piloto já está gerando lucro líquido real para a empresa desde os primeiros meses!';
  }
  if (lower.includes('porquê') || lower.includes('porque') || lower.includes('causa raiz')) {
    return 'Uma dica de ouro do Sensei: no método dos 5 Porquês, certifique-se de que cada porquê seja uma consequência física comprovável no chão de fábrica. O 5º porquê deve sempre revelar uma oportunidade no sistema de gestão ou no padrão operacional, e nunca culpar operadores.';
  }
  return `Analisando seu projeto "${project.title}", recomendo focar fortemente na padronização do posto piloto e no acompanhamento dos primeiros 90 dias após a implantação das ações para consolidar os ganhos e facilitar o Yokoten para os demais setores!`;
}

// =============================================================================
// TUTORIA EM ARTIGOS DA ACADEMIA LEAN COM O SENSEI
// =============================================================================
export async function chatWithSenseiAboutArticle({
  article,
  history = [],
  message,
  apiKey,
}: {
  article: {
    id: string;
    title: string;
    category: string;
    summary: string;
    content: {
      introduction: string;
      keyConcepts: { title: string; description: string }[];
      howToApply: string[];
      factoryExample: string;
      bestPractices: string[];
      quizHint: string;
    };
  };
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
  message: string;
  apiKey?: string;
}): Promise<string> {
  const effectiveKey = apiKey || getGeminiApiKey();

  const articleContext = `
TÍTULO DO ARTIGO: ${article.title}
CATEGORIA: ${article.category}
RESUMO: ${article.summary}

INTRODUÇÃO:
${article.content.introduction}

CONCEITOS CHAVE:
${article.content.keyConcepts.map((k) => `- ${k.title}: ${k.description}`).join('\n')}

COMO APLICAR NO GEMBA:
${article.content.howToApply.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CASO PRÁTICO REAL:
${article.content.factoryExample}

BOAS PRÁTICAS:
${article.content.bestPractices.map((b) => `• ${b}`).join('\n')}

DICA PARA A PROVA DE CERTIFICAÇÃO:
${article.content.quizHint}
`;

  const systemInstruction = `Você é o "Sensei", o Mestre e Tutor Oficial da Academia Lean Manufacturing.
O aluno (agente ou líder) está lendo o artigo "${article.title}" e abriu este chat para tirar dúvidas, pedir exemplos práticos, aprofundar conceitos ou se preparar para a Prova Oficial de Certificação.

CONTEÚDO DO ARTIGO QUE O ALUNO ESTÁ ESTUDANDO:
${articleContext}

BASE DE CONHECIMENTO COMPLEMENTAR DO SENSEI:
${SENSEI_KNOWLEDGE_BASE}

DIRETRIZES DA SUA TUTORIA:
1. Seja encorajador, didático, rigoroso nos conceitos do Lean e altamente prático (focado no chão de fábrica).
2. Explique com analogias industriais claras se o aluno perguntar como aplicar no posto dele.
3. Fale 100% em português brasileiro fluente, sem misturar com termos confusos em inglês.
4. Se o aluno pedir simulação de questão de prova sobre o artigo, formule uma pergunta estilo especialista com 5 alternativas e dê o gabarito comentado.
5. Mantenha respostas concisas, ricas e bem pontuadas (2 a 4 parágrafos).`;

  if (effectiveKey) {
    const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro'];
    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: systemInstruction }] },
                { role: 'model', parts: [{ text: `Olá! Sou o Sensei. Estou aqui para te ajudar a dominar tudo sobre "${article.title}". Qual é a sua dúvida ou o que gostaria de aprofundar agora?` }] },
                ...history,
                { role: 'user', parts: [{ text: message }] },
              ],
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) return reply;
        }
      } catch (err) {
        console.warn(`[Sensei Article Chat] Falha com modelo ${model}:`, err);
      }
    }
  }

  // Fallback Local de Tutoria do Artigo
  const lower = message.toLowerCase();
  if (lower.includes('prova') || lower.includes('pegadinha') || lower.includes('questão') || lower.includes('questao')) {
    return `Para a Prova de Certificação sobre "${article.title}": preste muita atenção na seguinte dica de ouro: ${article.content.quizHint}. Questões de nível especialista adoram testar a diferença entre a causa raiz sistêmica e os sintomas superficiais!`;
  }
  if (lower.includes('gemba') || lower.includes('como aplicar') || lower.includes('fábrica') || lower.includes('fabrica') || lower.includes('prática') || lower.includes('pratica')) {
    return `Para aplicar "${article.title}" no seu posto de trabalho: comece reunindo os operadores para observar o processo real sem julgamentos. Siga o passo a passo: ${article.content.howToApply[0]} e ${article.content.howToApply[1] || 'padronize as melhorias no POP'}. Pequenos passos diários geram resultados gigantescos!`;
  }
  return `Excelente pergunta sobre "${article.title}"! Lembre-se sempre de que o objetivo central é eliminar o desperdício sem sobrecarregar as pessoas (respeito aos colaboradores). Como exemplo prático: ${article.content.factoryExample}. O que mais você gostaria de saber?`;
}

