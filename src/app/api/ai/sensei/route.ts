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

    // A chave de API fica armazenada exclusivamente no ambiente de servidor
    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API do Gemini não configurada no servidor (GEMINI_API_KEY).' },
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
    let payloadContents: any[] = [];

    if (Array.isArray(incomingContents) && incomingContents.length > 0) {
      payloadContents = [...incomingContents];
      if (systemInstruction) {
        payloadContents.unshift({
          role: 'user',
          parts: [{ text: systemInstruction }],
        });
        payloadContents.splice(1, 0, {
          role: 'model',
          parts: [{ text: 'Entendido! Estou pronto para auxiliar com rigor técnico Lean.' }],
        });
      }
    } else if (prompt) {
      if (systemInstruction) {
        payloadContents = [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${prompt}` }],
          },
        ];
      } else {
        payloadContents = [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ];
      }
    } else {
      return NextResponse.json({ error: 'Conteúdo ou prompt não fornecido.' }, { status: 400 });
    }

    const candidateModels = [
      model,
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash',
      'gemini-pro',
    ];

    const generationConfig: any = {
      temperature,
      maxOutputTokens: maxTokens,
    };
    if (responseMimeType) {
      generationConfig.responseMimeType = responseMimeType;
    }

    let lastError = '';
    for (const targetModel of candidateModels) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: payloadContents,
              generationConfig,
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          return NextResponse.json({ text: responseText, modelUsed: targetModel });
        } else {
          lastError = await geminiRes.text();
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    return NextResponse.json(
      { error: `Falha ao processar requisição com modelos Gemini: ${lastError}` },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro interno no servidor de IA' },
      { status: 500 }
    );
  }
}
