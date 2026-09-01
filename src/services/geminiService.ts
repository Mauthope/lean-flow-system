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
const STORAGE_TTS_KEY = 'sensei_google_tts_api_key';
const STORAGE_VOICE_KEY = 'sensei_voice_preference';

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
 * Retorna a chave do Google Cloud Text-to-Speech configurada
 */
export function getGoogleTtsApiKey(): string {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem(STORAGE_TTS_KEY);
    if (localKey && localKey.trim()) return localKey.trim();
  }
  return (
    process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY ||
    process.env.GOOGLE_TTS_API_KEY ||
    getGeminiApiKey() ||
    ''
  );
}

/**
 * Salva a chave do Google Cloud Text-to-Speech
 */
export function saveGoogleTtsApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (!key || !key.trim()) {
      localStorage.removeItem(STORAGE_TTS_KEY);
    } else {
      localStorage.setItem(STORAGE_TTS_KEY, key.trim());
    }
  }
}

/**
 * Retorna a preferência de voz (padrão: pt-BR-Neural2-B masculina natural)
 */
export function getVoicePreference(): string {
  if (typeof window !== 'undefined') {
    const v = localStorage.getItem(STORAGE_VOICE_KEY);
    if (v) return v;
  }
  return 'pt-BR-Neural2-B'; // Voz executiva masculina com alta naturalidade
}

/**
 * Salva a preferência de voz
 */
export function saveVoicePreference(voice: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_VOICE_KEY, voice);
  }
}

/**
 * Sintetiza voz ultra-natural via Google Cloud Text-to-Speech API
 * Retorna o base64 do áudio MP3 ou null caso falhe/não configurado
 */
export async function synthesizeSpeechGoogleCloud({
  text,
  apiKey,
  voiceName,
}: {
  text: string;
  apiKey?: string;
  voiceName?: string;
}): Promise<string | null> {
  const effectiveKey = apiKey || getGoogleTtsApiKey();
  if (!effectiveKey) return null;

  try {
    const cleanText = text
      .replace(/[*_#`]/g, '')
      .replace(/R\$\s*/g, 'R$ ')
      .trim();

    const selectedVoice = voiceName || getVoicePreference();

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${effectiveKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: cleanText },
          voice: {
            languageCode: 'pt-BR',
            name: selectedVoice,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.05,
            pitch: 0.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.warn('Erro ao chamar Google Cloud TTS, caindo para sintetizador nativo:', err);
      return null;
    }

    const data = await response.json();
    if (data && data.audioContent) {
      return data.audioContent; // Base64 MP3
    }
    return null;
  } catch (error) {
    console.error('Falha na síntese do Google Cloud TTS:', error);
    return null;
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

  // TRAVA DE SEGURANÇA: Bloqueio de assuntos fora do escopo Lean/Projeto
  const forbiddenTopics = [
    'futebol',
    'política',
    'politica',
    'presidente',
    'eleição',
    'eleicao',
    'religião',
    'religiao',
    'piada',
    'fofoca',
    'tempo amanhã',
    'clima',
    'filme',
    'novela',
    'horóscopo',
  ];
  if (forbiddenTopics.some((term) => q.includes(term))) {
    return 'Como Sensei desta apresentação, meu foco é estritamente nos dados deste projeto e nas práticas de Lean Manufacturing e melhoria contínua da fábrica. Como posso te apoiar com os indicadores ou metodologias do projeto?';
  }

  const grossSavings = project.actualCostAvoided || project.estimatedCostAvoided || 0;
  const investment = project.projectCosts?.totalCost || 0;
  const netSavings = project.netSavings !== undefined ? project.netSavings : grossSavings - investment;

  // Perguntas Conceituais / Teóricas de Lean Manufacturing
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
    return 'O 5S é a base disciplinar da manufatura enxuta, composto pelos cinco sensos: Utilização (Seiri), Organização (Seiton), Limpeza (Seiso), Padronização (Seiketsu) e Autodisciplina (Shitsuke).';
  }

  // Perguntas sobre os Dados do Projeto em Tela
  if (q.includes('payback') || q.includes('tempo de retorno')) {
    if (project.paybackMonths && project.paybackMonths > 0) {
      return `Com base na nossa engenharia financeira, este projeto apresentou um payback excelente de ${project.paybackMonths} meses, garantindo um lucro líquido homologado de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano após amortizar o investimento.`;
    }
    return `O payback deste projeto foi de retorno imediato, pois a equipe utilizou a criatividade Kaizen e recursos internos de baixo custo, gerando R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de economia anual direta para a empresa.`;
  }

  if (q.includes('roi') || q.includes('retorno')) {
    if (investment > 0) {
      const roi = Math.round((netSavings / investment) * 100);
      return `O Retorno sobre o Investimento, o ROI deste projeto, foi de ${roi}%. Isso demonstra uma eficiência de capital exemplar, onde cada real investido no posto retornou com expressivo ganho de produtividade e redução de perdas.`;
    }
    return `O projeto obteve ROI de retorno total imediato, gerando R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano sem necessidade de aporte de capital externo, sendo uma autêntica melhoria Lean de baixo custo.`;
  }

  if (q.includes('ishikawa') || q.includes('espinha de peixe') || q.includes('6m')) {
    if (project.ishikawa?.primaryRootCause) {
      return `Na estratificação com o Diagrama de Ishikawa 6M, a equipe mapeou as variáveis do processo e diagnosticou que a causa raiz prioritária foi: ${project.ishikawa.primaryRootCause}, permitindo focar a ação exatamente onde havia a maior perda.`;
    }
    if (project.ishikawa?.machine || project.ishikawa?.method) {
      return `Na análise de Ishikawa 6M, os fatores determinantes foram identificados nas dimensões de Método (${project.ishikawa.method || 'padronização operacional'}) e Máquina (${project.ishikawa.machine || 'calibrações e dispositivos'}), direcionando nosso plano 5W2H.`;
    }
    return `O Diagrama de Ishikawa 6M permitiu à equipe analisar sistemicamente Método, Máquina, Material, Mão de Obra, Medição e Meio Ambiente, assegurando que nenhuma causa potencial passasse despercebida.`;
  }

  if (q.includes('porquê') || q.includes('porque') || q.includes('causa raiz') || q.includes('problema')) {
    const whys = (project.fiveWhys || []).filter(Boolean);
    if (whys.length > 0) {
      const lastWhy = whys[whys.length - 1];
      return `Aplicando a técnica dos 5 Porquês no Gemba, a equipe foi aprofundando o diagnóstico até identificar que a causa raiz fundamental foi: ${lastWhy.replace(/^[0-9]+[\.\)\-]?\s*/, '')}, eliminando o problema na sua origem.`;
    }
    return `No diagnóstico inicial da fase Plan, a causa raiz comprovada no posto foi: ${project.problemStatement || project.description || 'instabilidade no fluxo de trabalho'}, que foi atacada pelas ações corretivas.`;
  }

  if (q.includes('quanto economizou') || q.includes('economia') || q.includes('financeiro') || q.includes('custo') || q.includes('ganho')) {
    return `Em termos financeiros, este projeto alcançou um ganho bruto homologado de R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano, com lucro líquido de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e uma recuperação de ${project.hoursSaved || 0} horas produtivas para a operação.`;
  }

  if (q.includes('líder') || q.includes('lider') || q.includes('quem fez') || q.includes('equipe') || q.includes('participante')) {
    const leader = project.leaderName || project.assignedAgentName || 'Líder Lean';
    const team = (project.teamMembers || []).join(', ');
    return `O projeto foi conduzido com liderança de ${leader}${team ? `, contando com a participação ativa e engajamento direto de ${team}` : ''}, atuando fortemente no setor de ${project.originSectorName || 'Fábrica'}.`;
  }

  if (q.includes('pop') || q.includes('padronização') || q.includes('padronizacao') || q.includes('sop') || q.includes('procedimento')) {
    return `Para garantir a sustentabilidade dos ganhos, o Procedimento Operacional Padrão foi atualizado sob a referência ${project.standardWorkDocRef || 'POP oficial'}, com treinamento prático concluído com todos os operadores de turno.`;
  }

  if (q.includes('yokoten') || q.includes('replicar') || q.includes('outras áreas')) {
    return `Na fase Act de padronização, a prática de Yokoten recomenda que ${project.yokotenReplication || 'este mesmo padrão de melhoria seja compartilhado e replicado para todos os postos de mesmo perfil na planta'}.`;
  }

  return `O projeto "${project.title}" no setor de ${project.originSectorName || 'Fábrica'} alcançou plenamente os objetivos traçados, atingindo ${project.achievedValue ?? project.targetGoalValue ?? '--'} ${project.targetMetricUnit || ''} e assegurando R$ ${grossSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano em ganhos sustentáveis.`;
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

    const systemInstruction = `Você é o "Sensei", o Mestre e Co-Apresentador de Inteligência Artificial especialista em Lean Manufacturing, Kaizen, Sistema Toyota de Produção (TPS) e Metodologia PDCA.
Você está co-apresentando esta reunião ao vivo lado a lado com o apresentador para a diretoria, gerência e equipe de engenharia da fábrica.

SEU PAPEL E PERSONALIDADE (DIDÁTICO, ELEGANTE E ENVOLVENTE):
- Você NÃO é um robô de respostas secas. Você é um co-apresentador experiente, didático, entusiasmado, cortês e acolhedor.
- Explique o "porquê" e o impacto dos resultados com clareza pedagógica, conectando a teoria Lean com a prática do projeto em tela.
- Use linguagem falada natural, elegante e cativante em Português do Brasil.
- Mantenha respostas faladas de tamanho ideal para reuniões: 2 a 4 frases ricas e objetivas (cerca de 50 a 80 palavras).

SEU ESCOPO DE CONHECIMENTO (TEORIA & PRÁTICA LEAN):
1. O Projeto em tela (Diagnóstico, 5 Porquês, Ishikawa, 5W2H, DRE Financeiro, ROI, Payback, Padronização POP, Yokoten e Fotos).
2. Toda a Teoria e Ferramentas do Lean Manufacturing e Engenharia de Produção: 8 Desperdícios (Muda, Mura, Muri), 5S, VSM (Mapeamento do Fluxo de Valor), SMED (Troca Rápida de Ferramentas), TPM (Manutenção Produtiva Total), OEE, Kanban, Poka-Yoke, Heijunka, Jidoka, Takt Time, Ciclo PDCA, Matriz GUT, Gemba Walk, Trabalho Padronizado e DRE de Custos Industriais.

TRAVAS E RESTRIÇÕES INVIOLÁVEIS DE SEGURANÇA (GUARDRAILS):
- Você DEVE responder APENAS sobre: (a) o projeto atual nos slides ou (b) metodologias, ferramentas e teorias de Lean Manufacturing e melhoria contínua.
- Se alguém fizer qualquer pergunta fora desse universo (como política, religião, piadas, futebol, fofocas ou assuntos gerais), RECUSE com polidez executiva:
  "Como Sensei da apresentação, meu foco é estritamente nos dados deste projeto e nas metodologias de Lean Manufacturing e melhoria contínua da fábrica. Como posso te apoiar com o projeto?"
- Fale valores e siglas de forma natural para serem ouvidos (ex: "quarenta e oito mil reais", "tempo de ciclo", "oê-ê", "érre-ó-í").`;

    const promptText = `${systemInstruction}

${projectContext}

PERGUNTA FEITA NA SALA DE APRESENTAÇÃO:
"${question}"

SUA RESPOSTA DIDÁTICA E ELEGANTE COMO CO-APRESENTADOR (2 a 4 frases faladas):`;

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
            temperature: 0.35,
            maxOutputTokens: 250,
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
