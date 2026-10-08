import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache em memória para modelos descobertos dinamicamente via ModelService.ListModels
let cachedAvailableModels: { models: string[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de cache

/**
 * Consulta a API do Google (ListModels) para descobrir quais modelos estão ativos e
 * suportam o método generateContent para a chave de API fornecida.
 */
async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedAvailableModels && now - cachedAvailableModels.timestamp < CACHE_TTL_MS) {
    return cachedAvailableModels.models;
  }

  const discovered: string[] = [];
  const versions: ('v1beta' | 'v1')[] = ['v1beta', 'v1'];

  for (const ver of versions) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.models)) {
          for (const m of data.models) {
            if (
              m?.supportedGenerationMethods?.includes('generateContent') &&
              typeof m?.name === 'string'
            ) {
              const clean = m.name.replace(/^models\//, '');
              if (!discovered.includes(clean)) {
                discovered.push(clean);
              }
            }
          }
        }
      }
    } catch {
      // Ignora erro pontual de ListModels e segue para próxima versão
    }
  }

  if (discovered.length > 0) {
    cachedAvailableModels = { models: discovered, timestamp: now };
  }

  return discovered;
}

/**
 * Monta a lista ordenada de modelos candidatos a serem testados,
 * priorizando o modelo solicitado e os modelos modernos ativos (Gemini 2.0 / 1.5).
 */
function resolveCandidateModels(
  requestedModel?: string,
  discoveredModels: string[] = []
): string[] {
  const defaults = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-8b',
    'gemini-2.0-pro',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
  ];

  const pool: string[] = [];

  // 1. Modelo solicitado pelo usuário (se não for obsoleto)
  if (
    requestedModel &&
    requestedModel !== 'gemini-pro' &&
    requestedModel !== 'gemini-1.0-pro'
  ) {
    pool.push(requestedModel);
  }

  // 2. Se a API retornou modelos compatíveis via ListModels
  if (discoveredModels.length > 0) {
    // Prioriza modelos flash ativos
    const flashModels = discoveredModels.filter(
      (m) => m.includes('flash') && !m.includes('embedding')
    );
    // Demais modelos de geração (ex: pro)
    const proModels = discoveredModels.filter(
      (m) => m.includes('pro') && !m.includes('embedding') && !m.includes('1.0')
    );
    pool.push(...flashModels);
    pool.push(...proModels);
    pool.push(...discoveredModels);
  }

  // 3. Fallback com catálogo padrão
  pool.push(...defaults);

  // Remove duplicatas e modelos legados descontinuados
  return Array.from(
    new Set(
      pool.filter(
        (m) =>
          Boolean(m) &&
          m !== 'gemini-pro' &&
          m !== 'gemini-1.0-pro' &&
          !m.includes('embedding')
      )
    )
  );
}

/**
 * Executa uma requisição de geração de conteúdo tentando primeiro v1beta e, se 404, tentando v1.
 */
async function executeGenerate(
  model: string,
  apiKey: string,
  body: any
): Promise<{
  ok: boolean;
  status: number;
  data?: any;
  errorText?: string;
  apiVersionUsed?: string;
}> {
  for (const apiVer of ['v1beta', 'v1'] as const) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        const json = await res.json();
        return { ok: true, status: res.status, data: json, apiVersionUsed: apiVer };
      }

      const text = await res.text();
      // Se for 404 nesta versão de API, continua para tentar na outra versão (v1)
      if (res.status === 404 && apiVer === 'v1beta') {
        continue;
      }
      return { ok: false, status: res.status, errorText: text, apiVersionUsed: apiVer };
    } catch (err: any) {
      if (apiVer === 'v1beta') continue;
      return {
        ok: false,
        status: 500,
        errorText: err?.message || String(err),
        apiVersionUsed: apiVer,
      };
    }
  }

  return {
    ok: false,
    status: 404,
    errorText: `Modelo ${model} não respondeu em v1beta ou v1.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = 'generate',
      prompt,
      contents: incomingContents,
      model = 'gemini-2.0-flash',
      temperature = 0.5,
      maxTokens = 1500,
      systemInstruction,
      responseMimeType,
      text,
      voiceName,
    } = body;

    // SecOps Pilar 6: Validação de Sessão Corporativa para consumo de recursos de IA
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
        const {
          data: { user },
          error: authError,
        } = await supabaseServer.auth.getUser(token);
        if (authError || !user) {
          return NextResponse.json(
            { error: 'Acesso não autorizado: Sessão corporativa inválida ou expirada.' },
            { status: 401 }
          );
        }
      }
    }

    // SecOps: A chave de API fica armazenada exclusivamente no ambiente seguro de servidor.
    // Suporte agnóstico a chaves de IA: AI_API_KEY prioritária, com compatibilidade para GEMINI_API_KEY.
    const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Chave de API de IA não configurada no servidor (configure AI_API_KEY ou GEMINI_API_KEY nas variáveis de ambiente).',
        },
        { status: 500 }
      );
    }

    // Descoberta dinâmica de modelos suportados para a chave
    const discoveredModels = await fetchAvailableModels(apiKey);
    const candidateModels = resolveCandidateModels(model, discoveredModels);

    // 1. Ação: Validação de Chave
    if (action === 'validate') {
      const testBody = {
        contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
        generationConfig: { maxOutputTokens: 5 },
      };

      const validationDiagnostics: string[] = [];

      for (const testModel of candidateModels) {
        const result = await executeGenerate(testModel, apiKey, testBody);
        if (result.ok) {
          return NextResponse.json({
            valid: true,
            model: testModel,
            apiVersion: result.apiVersionUsed,
            discoveredCount: discoveredModels.length,
          });
        }
        validationDiagnostics.push(`[${testModel}]: ${result.errorText || 'Falha 404'}`);
      }

      return NextResponse.json(
        {
          valid: false,
          error: `Falha ao validar chave de IA com os modelos ativos. Diagnósticos: ${validationDiagnostics.slice(0, 3).join(' | ')}`,
        },
        { status: 400 }
      );
    }

    // 2. Ação: Text-to-Speech (Google Cloud Neural2)
    if (action === 'tts') {
      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Texto não fornecido para síntese de voz.' },
          { status: 400 }
        );
      }

      const voice =
        voiceName && !voiceName.includes('Studio') ? voiceName : 'pt-BR-Neural2-B';
      const ttsRes = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: 'pt-BR',
              name: voice,
              ssmlGender: voice.includes('B') || voice.includes('D') ? 'MALE' : 'FEMALE',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 1.02,
              pitch: 0.0,
            },
          }),
        }
      );

      if (!ttsRes.ok) {
        const errText = await ttsRes.text();
        return NextResponse.json(
          { error: `Falha no TTS Google Cloud: ${errText}` },
          { status: ttsRes.status }
        );
      }

      const ttsData = await ttsRes.json();
      return NextResponse.json({
        audioContent: ttsData.audioContent,
        voiceUsed: voice,
      });
    }

    // 3. Ação: Geração de Conteúdo (Texto / Análise / Chat)
    let rawIncoming: any[] = [];
    if (Array.isArray(incomingContents) && incomingContents.length > 0) {
      rawIncoming = incomingContents;
    } else if (prompt && typeof prompt === 'string') {
      rawIncoming = [{ role: 'user', parts: [{ text: prompt }] }];
    } else {
      return NextResponse.json(
        { error: 'Conteúdo ou prompt não fornecido.' },
        { status: 400 }
      );
    }

    // Sanitização e conformidade estrita com a API do Google Gemini:
    // 1. O primeiro item deve ser obrigatoriamente 'user'.
    // 2. As roles devem alternar estritamente entre 'user' e 'model'.
    const sanitizedContents: any[] = [];
    let lastRole: string | null = null;

    for (const item of rawIncoming) {
      if (!item || !item.parts || !Array.isArray(item.parts) || item.parts.length === 0)
        continue;
      const textContent = item.parts.map((p: any) => p.text || '').join('\n').trim();
      if (!textContent) continue;

      const currentRole = item.role === 'model' ? 'model' : 'user';

      // A API rejeita conversas iniciadas com 'model'
      if (sanitizedContents.length === 0 && currentRole === 'model') {
        continue;
      }

      // Agrupa mensagens consecutivas da mesma role
      if (currentRole === lastRole && sanitizedContents.length > 0) {
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += `\n\n${textContent}`;
      } else {
        sanitizedContents.push({
          role: currentRole,
          parts: [{ text: textContent }],
        });
        lastRole = currentRole;
      }
    }

    if (sanitizedContents.length === 0) {
      sanitizedContents.push({
        role: 'user',
        parts: [{ text: prompt || 'Olá Sensei' }],
      });
    }

    const generationConfig: any = {
      temperature,
      maxOutputTokens: maxTokens,
    };
    if (responseMimeType) {
      generationConfig.responseMimeType = responseMimeType;
    }

    // Monta o body da requisição
    const requestBody: any = {
      contents: sanitizedContents,
      generationConfig,
    };

    if (
      systemInstruction &&
      typeof systemInstruction === 'string' &&
      systemInstruction.trim()
    ) {
      requestBody.system_instruction = {
        parts: [{ text: systemInstruction.trim() }],
      };
    }

    let lastError = '';
    const diagnosticErrors: string[] = [];

    // Percorre a lista de modelos candidatos em ordem de prioridade
    for (const targetModel of candidateModels) {
      const result = await executeGenerate(targetModel, apiKey, requestBody);

      if (result.ok && result.data) {
        const responseText =
          result.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        return NextResponse.json({
          text: responseText,
          modelUsed: targetModel,
          apiVersion: result.apiVersionUsed,
        });
      }

      lastError = result.errorText || 'Falha desconhecida';
      diagnosticErrors.push(`[${targetModel}]: ${lastError}`);
    }

    return NextResponse.json(
      {
        error: `Falha ao processar requisição com modelos Gemini. Detalhes: ${lastError}`,
        diagnostics: diagnosticErrors,
      },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro interno no servidor de IA' },
      { status: 500 }
    );
  }
}
