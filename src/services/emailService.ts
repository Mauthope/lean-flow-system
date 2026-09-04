/**
 * Serviço de E-mails Transacionais & Notificações Corporativas
 * Suporta Resend, Supabase Edge Functions e Modo Simulado Local para Testes
 */

export interface ControladoriaInviteParams {
  recipientEmail: string;
  recipientName?: string;
  projectTitle: string;
  protocol: string;
  sectorName?: string;
  leaderName?: string;
  estimatedSavings: number; // Retorno Anual Estimado (R$/ano)
  investmentCost?: number;  // Capex/Investimento (R$)
  paybackMonths?: number;   // Payback em meses
  auditUrl: string;
  token: string;
}

export interface SendEmailResult {
  success: boolean;
  simulated: boolean;
  messageId?: string;
  auditUrl: string;
  error?: string;
  message?: string;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

/**
 * Gera o template HTML corporativo para a notificação de auditoria
 */
export function generateAuditEmailHtml(params: ControladoriaInviteParams): string {
  const {
    recipientName = 'Prezado(a) Responsável da Controladoria',
    projectTitle,
    protocol,
    sectorName = 'Setor Industrial',
    leaderName = 'Especialista Lean',
    estimatedSavings,
    investmentCost = 0,
    paybackMonths,
    auditUrl,
  } = params;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auditoria de Ganhos Financeiros - Lean Flow System</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 24px; border-bottom: 2px solid #3b82f6; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; color: #ffffff; letter-spacing: -0.5px; font-weight: 700; }
    .badge { display: inline-block; background-color: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .content { padding: 30px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
    .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .metric-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; }
    .metric-row:last-child { border-bottom: none; }
    .metric-label { color: #94a3b8; font-size: 13px; }
    .metric-val { color: #ffffff; font-weight: 600; font-size: 14px; }
    .metric-val.green { color: #34d399; font-weight: 700; font-size: 16px; }
    .btn-container { text-align: center; margin: 35px 0 20px 0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.2px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
    .footer { padding: 20px 24px; background-color: #0b1120; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
    .notice { font-size: 11px; color: #94a3b8; margin-top: 15px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Auditoria e Homologação Financeira</h1>
      <div class="badge">PROJETO LEAN KAIZEN • ${protocol}</div>
    </div>
    
    <div class="content">
      <p>Olá, <strong>${recipientName}</strong>,</p>
      
      <p>Um projeto de melhoria contínua atingiu a fase de validação de resultados e declarou <strong>ganhos financeiros</strong>. Conforme a política de governança corporativa, os números devem ser certificados pela <strong>Controladoria</strong> antes da liberação do acompanhamento trimestral de sustentação.</p>
      
      <div class="card">
        <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          ${projectTitle}
        </div>
        <div class="metric-row">
          <span class="metric-label">Setor / Fábrica:</span>
          <span class="metric-val">${sectorName}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Líder / Especialista Lean:</span>
          <span class="metric-val">${leaderName}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Custo Evitado Estimado (12M):</span>
          <span class="metric-val green">${formatCurrencyBRL(estimatedSavings)}/ano</span>
        </div>
        ${investmentCost > 0 ? `
        <div class="metric-row">
          <span class="metric-label">Investimento Total (Capex):</span>
          <span class="metric-val">${formatCurrencyBRL(investmentCost)}</span>
        </div>
        ` : ''}
        ${paybackMonths ? `
        <div class="metric-row">
          <span class="metric-label">Tempo de Payback Estimado:</span>
          <span class="metric-val">${paybackMonths.toFixed(1)} meses</span>
        </div>
        ` : ''}
      </div>

      <p>Ao abrir o link abaixo, você terá acesso completo ao memorial de cálculo, fotos do Gemba e um campo específico para <strong>aprovar</strong>, <strong>rejeitar</strong> ou <strong>ajustar individualmente os valores</strong> de cada uma das fontes de custo evitado.</p>

      <div class="btn-container">
        <a href="${auditUrl}" target="_blank" class="btn">
          Auditar & Homologar Ganhos Financeiros ➔
        </a>
      </div>

      <div class="notice">
        Caso o botão não abra, copie e cole este link seguro no navegador:<br>
        <a href="${auditUrl}" style="color: #60a5fa;">${auditUrl}</a>
      </div>
    </div>

    <div class="footer">
      Este é um link com escopo exclusivo e seguro gerado pelo <strong>Lean Flow System</strong>.<br>
      Acesso restrito para auditoria e governança financeira corporativa.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Serviço de E-mail: Dispara ou simula o envio do convite de auditoria
 */
export async function sendControladoriaAuditInvite(
  params: ControladoriaInviteParams
): Promise<SendEmailResult> {
  const subject = `[Lean Flow - Controladoria] Auditoria Financeira Requerida: ${params.protocol} - ${params.projectTitle}`;
  const html = generateAuditEmailHtml(params);

  // 1. Verificação de Chave Resend (Produção / Nuvem)
  const resendApiKey = process.env.RESEND_API_KEY || (typeof window !== 'undefined' ? (window as any).__RESEND_API_KEY : undefined);
  
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Lean Flow System <notificacoes@resend.dev>',
          to: [params.recipientEmail],
          subject,
          html,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          simulated: false,
          messageId: data.id,
          auditUrl: params.auditUrl,
          message: `E-mail de auditoria enviado com sucesso via Resend para ${params.recipientEmail}`,
        };
      }
    } catch (err: any) {
      console.error('[EmailService] Falha ao disparar via Resend, usando fallback simulado:', err);
    }
  }

  // 2. Verificação de Supabase Edge Function (Se configurada)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-audit-email`;
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          to: params.recipientEmail,
          subject,
          html,
          auditUrl: params.auditUrl,
          token: params.token,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          simulated: false,
          messageId: data.id || 'supabase-edge',
          auditUrl: params.auditUrl,
          message: `E-mail de auditoria enviado via Supabase Edge Function para ${params.recipientEmail}`,
        };
      }
    } catch (err: any) {
      console.warn('[EmailService] Supabase Edge Function não alcançada, usando simulação:', err);
    }
  }

  // 3. Fallback / Modo Local Simulado (Ideal para Testes sem Dependências)
  console.group('📧 [LEAN FLOW - SIMULAÇÃO DE E-MAIL PARA CONTROLADORIA]');
  console.log(`Para: ${params.recipientEmail} (${params.recipientName || 'Responsável'})`);
  console.log(`Assunto: ${subject}`);
  console.log(`Projeto: ${params.protocol} - ${params.projectTitle}`);
  console.log(`Ganhos Estimados: ${formatCurrencyBRL(params.estimatedSavings)}/ano`);
  console.log(`🔗 Link de Auditoria Gerado: ${params.auditUrl}`);
  console.groupEnd();

  return {
    success: true,
    simulated: true,
    auditUrl: params.auditUrl,
    message: `Notificação registrada com sucesso (Modo Local/Simulado). O link seguro está pronto para ser acessado.`,
  };
}
