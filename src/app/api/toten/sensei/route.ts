import { NextRequest, NextResponse } from 'next/server';

// Instruções de sistema para o Sensei Kaizen
const SENSEI_CHAT_INSTRUCTION = `
Você é o "Sensei Kaizen", o mestre da Melhoria Contínua e metodologia 5S em um toten interativo no chão de fábrica e ambientes industriais.
Sua personalidade é sábia, enérgica, acolhedora e motivadora.

Diretrizes obrigatórias:
1. Suas respostas serão FALADAS EM VOZ ALTA pelo toten. Responda em Português do Brasil com no máximo 2 a 3 frases curtas e diretas.
2. Seja prático e focado no chão de fábrica (Gemba): 5S, eliminação de desperdícios, segurança, Poka-Yoke e pequenos passos diários.
3. Não use emojis em suas respostas.
4. Conclua com uma dica rápida ou incentivo para o turno.
`;

const SENSEI_IDEA_REFINE_INSTRUCTION = `
Você é o especialista Lean Manufacturing e Consultor do Canal Kaizen.
O operador gravou uma ideia de melhoria através do microfone do toten no chão de fábrica.
A fala pode conter ruído de máquinas, termos informais ou frases truncadas.

Interprete a real intenção de melhoria e estruture a proposta em formato Kaizen profissional.
Mantenha rigorosamente o foco do operador, mas com clareza técnica. Não use emojis.

Retorne EXCLUSIVAMENTE um JSON válido com esta estrutura exata:
{
  "title": "Título claro e objetivo da melhoria (máximo 8 palavras)",
  "category": "Uma entre: 5S & Organização | Segurança no Trabalho | Eliminação de Desperdício | Manutenção Autônoma | Qualidade & Poka-Yoke | Agilidade & Produtividade",
  "problem": "Problema ou dificuldade observada no posto de trabalho.",
  "solution": "Ação prática sugerida para resolver o problema.",
  "benefits": "Ganhos esperados (tempo, segurança, redução de retrabalho ou ergonomia).",
  "senseiEncouragement": "Frase curta de incentivo do Sensei ao operador (máximo 15 palavras)."
}
`;

// Cérebro local do Sensei (fallback robusto sem internet ou sem chave de API)
function getLocalSenseiResponse(query: string): string {
  const q = query.toLowerCase().trim();

  // 1. 5S & Organização
  if (
    q.includes('5s') ||
    q.includes('seiri') ||
    q.includes('seiton') ||
    q.includes('seiso') ||
    q.includes('seiketsu') ||
    q.includes('shitsuke')
  ) {
    return 'O 5S é o alicerce de qualquer melhoria! Comece separando o útil do inútil com o Seiri, e cada ferramenta no seu devido lugar com o Seiton. Um posto organizado evita acidentes e poupa tempo precioso!';
  }
  if (
    q.includes('bancada') ||
    q.includes('ferramenta') ||
    q.includes('organizar') ||
    q.includes('organiza') ||
    q.includes('guardar')
  ) {
    return 'Adote a regra de ouro: um lugar para cada coisa, e cada coisa em seu lugar! Use quadros de sombra e demarcações visuais na bancada para que qualquer colega encontre a ferramenta em menos de 5 segundos.';
  }

  // 2. Poka-Yoke & Qualidade
  if (
    q.includes('poka') ||
    q.includes('yoke') ||
    q.includes('erro') ||
    q.includes('defeito') ||
    q.includes('peça errada') ||
    q.includes('qualidade')
  ) {
    return 'Poka-Yoke significa criar mecanismos à prova de erros! Pode ser um gabarito físico, um sensor ou uma trava que impede a montagem invertida. O melhor processo é aquele que torna o erro impossível de acontecer!';
  }

  // 3. Desperdícios Lean (Muda)
  if (
    q.includes('desperdício') ||
    q.includes('desperdicio') ||
    q.includes('espera') ||
    q.includes('tempo') ||
    q.includes('muda') ||
    q.includes('parada')
  ) {
    return 'Na fábrica, o tempo de espera e a movimentação desnecessária são inimigos silenciosos da produtividade. Olhe ao seu redor agora: o que você precisa dar mais de três passos para buscar? Aí está um Kaizen para você cadastrar!';
  }

  // 4. Segurança & EPI
  if (
    q.includes('seguran') ||
    q.includes('epi') ||
    q.includes('acidente') ||
    q.includes('risco') ||
    q.includes('perigo') ||
    q.includes('cuidado')
  ) {
    return 'Segurança é valor inegociável no Gemba! Antes de qualquer ganho de produção, o colaborador deve voltar para casa saudável. Use seus EPIs e reporte qualquer condição insegura no Canal Kaizen!';
  }

  // 5. Manutenção Autônoma & Máquinas
  if (
    q.includes('esteira') ||
    q.includes('máquina') ||
    q.includes('maquina') ||
    q.includes('manuten') ||
    q.includes('quebr') ||
    q.includes('barulho') ||
    q.includes('vazamento')
  ) {
    return 'Limpar é inspecionar! Na manutenção autônoma, ao limpar a máquina você descobre pequenos parafusos frouxos ou vazamentos antes que a linha pare. Cuide do seu equipamento como parte do seu sucesso diário!';
  }

  // 6. Ideias & Sugestões
  if (
    q.includes('ideia') ||
    q.includes('sugestão') ||
    q.includes('sugestao') ||
    q.includes('canal kaizen') ||
    q.includes('cadastrar')
  ) {
    return 'Toda grande inovação começou com uma pequena ideia no chão de fábrica! Toque no botão do Canal Kaizen aqui na tela e registre sua sugestão por voz ou texto agora mesmo!';
  }

  // 7. Saudações
  if (
    q.includes('olá') ||
    q.includes('ola') ||
    q.includes('bom dia') ||
    q.includes('boa tarde') ||
    q.includes('boa noite') ||
    q.includes('oi')
  ) {
    return 'Olá, campeão do turno! O Sensei está a postos. Qual oportunidade de melhoria você observou no posto hoje?';
  }

  // 8. O que é Kaizen
  if (
    q.includes('o que é kaizen') ||
    q.includes('oque é kaizen') ||
    q.includes('significa kaizen') ||
    q.includes('filosofia')
  ) {
    return 'Kaizen significa mudar para melhor! É a arte de melhorar um por cento todos os dias com a inteligência de quem realmente coloca a mão na massa no posto de trabalho.';
  }

  // Padrão
  const generalWisdom = [
    'Pequenas melhorias diárias constroem resultados gigantescos! Olhe para o seu posto agora: o que pode ser feito mais rápido, seguro ou fácil?',
    'Não aceite o desperdício como normal! Se algo incomoda o seu trabalho no dia a dia, transforme isso em uma melhoria no Canal Kaizen!',
    'Vá ao Gemba e veja com seus próprios olhos! A solução mais simples quase sempre é a mais inteligente e econômica.',
    'A disciplina do 5S transforma o trabalho pesado em uma rotina leve e segura. Como está a limpeza e organização do seu posto hoje?',
    'O melhor especialista no seu posto de trabalho é você mesmo! Se tiver uma sugestão, conte ao Sensei e cadastre no sistema!',
  ];
  return generalWisdom[Math.floor(Math.random() * generalWisdom.length)];
}

// Fallback de estruturação de ideia
function generateFallbackStructuredIdea(rawText: string) {
  const cleaned = rawText.trim();
  const lower = cleaned.toLowerCase();

  let category = 'Eliminação de Desperdício';
  if (
    lower.includes('seguran') ||
    lower.includes('epi') ||
    lower.includes('acidente') ||
    lower.includes('risco') ||
    lower.includes('cair') ||
    lower.includes('perigo')
  ) {
    category = 'Segurança no Trabalho';
  } else if (
    lower.includes('limp') ||
    lower.includes('organiz') ||
    lower.includes('ferramenta') ||
    lower.includes('bancada') ||
    lower.includes('chão') ||
    lower.includes('5s')
  ) {
    category = '5S & Organização';
  } else if (
    lower.includes('manuten') ||
    lower.includes('quebr') ||
    lower.includes('barulho') ||
    lower.includes('oleo') ||
    lower.includes('esteira') ||
    lower.includes('parada')
  ) {
    category = 'Manutenção Autônoma';
  } else if (
    lower.includes('defeito') ||
    lower.includes('erro') ||
    lower.includes('qualidade') ||
    lower.includes('errad') ||
    lower.includes('poka')
  ) {
    category = 'Qualidade & Poka-Yoke';
  } else if (
    lower.includes('rápido') ||
    lower.includes('tempo') ||
    lower.includes('demor') ||
    lower.includes('espera') ||
    lower.includes('fila') ||
    lower.includes('agilidade')
  ) {
    category = 'Agilidade & Produtividade';
  }

  const formattedText = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  const titlePreview = formattedText.length > 40 ? formattedText.slice(0, 40) + '...' : formattedText;

  return {
    title: `Melhoria: ${titlePreview}`,
    category,
    problem: `Dificuldade apontada no posto de trabalho: "${formattedText}".`,
    solution: `Implementar padronização, dispositivo auxiliar ou ajuste de rotina para resolver o ponto identificado.`,
    benefits: `Mais agilidade na operação, prevenção de retrabalhos e ambiente de trabalho mais seguro e organizado.`,
    senseiEncouragement: `Excelente iniciativa! Pequenas ideias no chão de fábrica geram grandes transformações no turno!`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action = 'chat', message, rawText } = body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // AÇÃO 1: REFINAR IDEIA
    if (action === 'refine_idea') {
      const textToRefine = rawText || message;
      if (!textToRefine || typeof textToRefine !== 'string' || !textToRefine.trim()) {
        return NextResponse.json({ error: 'Texto da ideia não informado.' }, { status: 400 });
      }

      if (apiKey) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${SENSEI_IDEA_REFINE_INSTRUCTION}\n\nAnalise e estruture esta ideia de melhoria:\n"${textToRefine}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawJson) {
              const clean = rawJson.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();
              const parsed = JSON.parse(clean);
              return NextResponse.json({ success: true, data: parsed });
            }
          }
        } catch (aiErr) {
          console.warn('[toten/sensei] Falha na API Gemini, usando inteligência local:', aiErr);
        }
      }

      const fallbackData = generateFallbackStructuredIdea(textToRefine);
      return NextResponse.json({ success: true, data: fallbackData });
    }

    // AÇÃO 2: CONSULTA / PERGUNTA AO SENSEI
    const userMessage = message || rawText;
    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return NextResponse.json({ error: 'Mensagem inválida ou vazia.' }, { status: 400 });
    }

    if (apiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${SENSEI_CHAT_INSTRUCTION}\n\nPergunta do operador: "${userMessage}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 150,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            return NextResponse.json({ response: text.trim() });
          }
        }
      } catch (aiErr) {
        console.warn('[toten/sensei] Falha na API Gemini, usando sabedoria local:', aiErr);
      }
    }

    const localAns = getLocalSenseiResponse(userMessage);
    return NextResponse.json({ response: localAns });
  } catch (error: any) {
    console.error('[toten/sensei] Erro no processamento:', error);
    return NextResponse.json({
      response:
        'O Sensei está atento! Lembre-se: pequenos passos todos os dias constroem um grande futuro operacional. Qual a sua sugestão para o turno?',
    });
  }
}
