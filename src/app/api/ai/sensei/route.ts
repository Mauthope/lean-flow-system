import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = 'generate',
      prompt,
      contents: incomingContents,
      model = 'gemini-1.5-flash',
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
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
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
    // Conforme PSI Grupo Vaccaro: proibição estrita de prefixo NEXT_PUBLIC_ para credenciais de IA.
    const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API de IA não configurada no servidor (configure AI_API_KEY ou GEMINI_API_KEY nas variáveis de ambiente).' },
        { status: 500 }
      );
    }

    // 1. Ação: Validação de Chave
    if (action === 'validate') {
      const testRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        }
      );

      if (!testRes.ok) {
        const errText = await testRes.text();
        return NextResponse.json({ valid: false, error: errText }, { status: 400 });
      }

      return NextResponse.json({ valid: true, model: 'gemini-1.5-flash' });
    }

    // 2. Ação: Text-to-Speech (Google Cloud Neural2)
    if (action === 'tts') {
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Texto não fornecido para síntese de voz.' }, { status: 400 });
      }

      const voice = voiceName && !voiceName.includes('Studio') ? voiceName : 'pt-BR-Neural2-B';
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
        return NextResponse.json({ error: `Falha no TTS Google Cloud: ${errText}` }, { status: ttsRes.status });
      }

      const ttsData = await ttsRes.json();
      return NextResponse.json({ audioContent: ttsData.audioContent, voiceUsed: voice });
    }

    // 3. Ação: Geração de Conteúdo (Texto / Análise / Chat)
    let rawIncoming: any[] = [];
    if (Array.isArray(incomingContents) && incomingContents.length > 0) {
      rawIncoming = incomingContents;
    } else if (prompt && typeof prompt === 'string') {
      rawIncoming = [{ role: 'user', parts: [{ text: prompt }] }];
    } else {
      return NextResponse.json({ error: 'Conteúdo ou prompt não fornecido.' }, { status: 400 });
    }

    // Sanitização e conformidade estrita com a API do Google Gemini:
    // 1. O primeiro item deve ser obrigatoriamente 'user'.
    // 2. As roles devem alternar estritamente entre 'user' e 'model'.
    const sanitizedContents: any[] = [];
    let lastRole: string | null = null;

    for (const item of rawIncoming) {
      if (!item || !item.parts || !Array.isArray(item.parts) || item.parts.length === 0) continue;
      const textContent = item.parts.map((p: any) => p.text || '').join('\n').trim();
      if (!textContent) continue;

      const currentRole = item.role === 'model' ? 'model' : 'user';

      // A API do Google Gemini rejeita conversas iniciadas com 'model'
      if (sanitizedContents.length === 0 && currentRole === 'model') {
        continue;
      }

      // Agrupa mensagens consecutivas da mesma role para evitar erro 400 da API
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

    // Modelos oficiais ativos na API v1beta do Google Generative Language
    const rawCandidateModels = [
      model,
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
    ];

    // Remove duplicatas e elimina modelos descontinuados (ex: gemini-pro legado)
    const candidateModels = Array.from(
      new Set(
        rawCandidateModels.filter(
          (m): m is string => Boolean(m) && m !== 'gemini-pro' && m !== 'gemini-1.0-pro'
        )
      )
    );

    const generationConfig: any = {
      temperature,
      maxOutputTokens: maxTokens,
    };
    if (responseMimeType) {
      generationConfig.responseMimeType = responseMimeType;
    }

    // Monta o body padrão com system_instruction nativo da API v1beta
    const requestBody: any = {
      contents: sanitizedContents,
      generationConfig,
    };

    if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
      requestBody.system_instruction = {
        parts: [{ text: systemInstruction.trim() }],
      };
    }

    let lastError = '';
    const diagnosticErrors: string[] = [];

    for (const targetModel of candidateModels) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          return NextResponse.json({ text: responseText, modelUsed: targetModel });
        } else {
          lastError = await geminiRes.text();
          diagnosticErrors.push(`[${targetModel}]: ${lastError}`);
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
        diagnosticErrors.push(`[${targetModel}]: ${lastError}`);
      }
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
