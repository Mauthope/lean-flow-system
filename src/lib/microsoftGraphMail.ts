/**
 * Conector Oficial Microsoft Graph API para Envio de E-mails Transacionais
 * 
 * Padrão SecOps Grupo Vaccaro:
 * - Execução estrita no servidor (Server-Side / Next.js API Routes).
 * - Autenticação OAuth2 Client Credentials (sem expor credenciais no cliente).
 * - Cache de Access Token com renovação antecipada.
 * - Modo Simulado de segurança controlado por EMAIL_ENABLED.
 */

interface GraphTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

export interface SendMailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  tenantName?: string;
  cc?: string[];
}

export interface SendMailResult {
  success: boolean;
  simulated: boolean;
  messageId?: string;
  message: string;
  error?: string;
  details?: any;
}

export interface GraphConfigStatus {
  isConfigured: boolean;
  hasTenantId: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasMailSender: boolean;
  senderAddress: string;
  isEmailEnabled: boolean;
}

// Cache em memória do Access Token do Microsoft Graph
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Retorna o status de configuração das variáveis do Microsoft Graph no servidor
 */
export function getGraphConfigStatus(): GraphConfigStatus {
  const tenantId = process.env.AZURE_TENANT_ID?.trim();
  const clientId = process.env.AZURE_CLIENT_ID?.trim();
  const clientSecret = process.env.AZURE_CLIENT_SECRET?.trim();
  const mailSender = process.env.AZURE_MAIL_SENDER?.trim();
  const emailEnabled = process.env.EMAIL_ENABLED?.trim().toLowerCase() === 'true';

  const hasTenantId = Boolean(tenantId);
  const hasClientId = Boolean(clientId);
  const hasClientSecret = Boolean(clientSecret);
  const hasMailSender = Boolean(mailSender);
  const isConfigured = hasTenantId && hasClientId && hasClientSecret && hasMailSender;

  return {
    isConfigured,
    hasTenantId,
    hasClientId,
    hasClientSecret,
    hasMailSender,
    senderAddress: mailSender || 'Não configurado',
    isEmailEnabled: emailEnabled,
  };
}

/**
 * Obtém o Bearer Token do Microsoft Entra ID via OAuth2 client_credentials
 */
async function getGraphAccessToken(): Promise<string> {
  // Verifica se o token em cache ainda é válido (com margem de segurança de 2 minutos)
  const now = Date.now();
  if (cachedToken && tokenExpiresAt - 120000 > now) {
    return cachedToken;
  }

  const tenantId = process.env.AZURE_TENANT_ID?.trim();
  const clientId = process.env.AZURE_CLIENT_ID?.trim();
  const clientSecret = process.env.AZURE_CLIENT_SECRET?.trim();

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Configuração incompleta do Microsoft Entra ID. Verifique AZURE_TENANT_ID, AZURE_CLIENT_ID e AZURE_CLIENT_SECRET no arquivo .env.'
    );
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.text();
    let parsedMessage = errorData;
    try {
      const json = JSON.parse(errorData);
      parsedMessage = json.error_description || json.error || errorData;
    } catch {
      // continua
    }
    throw new Error(`Falha de autenticação no Microsoft Entra ID (${response.status}): ${parsedMessage}`);
  }

  const data: GraphTokenResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

/**
 * Dispara e-mail transacional via Microsoft Graph API
 */
export async function sendMailViaGraph(params: SendMailParams): Promise<SendMailResult> {
  const { to, toName, subject, html, tenantName, cc = [] } = params;

  const config = getGraphConfigStatus();

  // 1. Verificação da Chave de Segurança de Homologação (EMAIL_ENABLED)
  if (!config.isEmailEnabled) {
    console.group('[MICROSOFT GRAPH - SIMULAÇÃO DE E-MAIL (EMAIL_ENABLED=false)]');
    console.log(`Remetente: ${config.senderAddress} (${tenantName ? `Lean Flow • ${tenantName}` : 'Lean Flow System'})`);
    console.log(`Destinatário: ${to} (${toName || 'Destinatário'})`);
    console.log(`Assunto: ${subject}`);
    console.log(`Status das Chaves: Configurado=${config.isConfigured}`);
    console.groupEnd();

    return {
      success: true,
      simulated: true,
      message: `Modo Simulado Ativo (EMAIL_ENABLED=false). O e-mail para "${to}" foi gerado e validado internamente com sucesso.`,
    };
  }

  // 2. Validação das Credenciais Obrigatórias
  if (!config.isConfigured) {
    const missing: string[] = [];
    if (!config.hasTenantId) missing.push('AZURE_TENANT_ID');
    if (!config.hasClientId) missing.push('AZURE_CLIENT_ID');
    if (!config.hasClientSecret) missing.push('AZURE_CLIENT_SECRET');
    if (!config.hasMailSender) missing.push('AZURE_MAIL_SENDER');

    return {
      success: false,
      simulated: false,
      message: `Disparo cancelado: Variáveis do Microsoft Graph ausentes no servidor: ${missing.join(', ')}.`,
      error: 'CREDENTIALS_MISSING',
    };
  }

  try {
    // 3. Obtenção do Token de Acesso
    const accessToken = await getGraphAccessToken();

    // 4. Montagem da Mensagem no Padrão Microsoft Graph
    const senderAddress = process.env.AZURE_MAIL_SENDER!.trim();
    const displayName = tenantName
      ? `Lean Flow System • ${tenantName}`
      : 'Lean Flow System';

    const toRecipients = [
      {
        emailAddress: {
          address: to.trim().toLowerCase(),
          name: toName || to.trim(),
        },
      },
    ];

    const ccRecipients = cc
      .filter((c) => Boolean(c && c.trim()))
      .map((c) => ({
        emailAddress: {
          address: c.trim().toLowerCase(),
        },
      }));

    const graphMessagePayload = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: html,
        },
        toRecipients: toRecipients,
        ...(ccRecipients.length > 0 ? { ccRecipients } : {}),
        from: {
          emailAddress: {
            address: senderAddress,
            name: displayName,
          },
        },
      },
      saveToSentItems: true,
    };

    // 5. Chamada de Envio ao Endpoint da Caixa de Correio
    const sendMailEndpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderAddress)}/sendMail`;

    const sendResponse = await fetch(sendMailEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphMessagePayload),
    });

    // 202 Accepted indica sucesso de enfileiramento no Exchange Online
    if (sendResponse.status === 202 || sendResponse.ok) {
      return {
        success: true,
        simulated: false,
        message: `E-mail corporativo enviado com sucesso para "${to}" via Microsoft Graph.`,
      };
    }

    // Tratamento de Erros Retornados pelo Microsoft Graph
    const errorText = await sendResponse.text();
    let errorMessage = `Erro na Microsoft Graph API (${sendResponse.status})`;

    try {
      const errJson = JSON.parse(errorText);
      const code = errJson?.error?.code || '';
      const msg = errJson?.error?.message || '';

      if (code === 'ErrorAccessDenied' || sendResponse.status === 403) {
        errorMessage = `Acesso Negado (403): O aplicativo no Entra ID não possui permissão Mail.Send ou a política de acesso (ApplicationAccessPolicy) não autoriza envio pela caixa "${senderAddress}".`;
      } else if (code === 'ResourceNotFound' || sendResponse.status === 404) {
        errorMessage = `Caixa não encontrada (404): A caixa corporativa "${senderAddress}" não foi localizada no Microsoft 365.`;
      } else if (code === 'ErrorInvalidUser') {
        errorMessage = `Destinatário inválido: A Microsoft recusou o envio para "${to}".`;
      } else {
        errorMessage = `Recusa do Microsoft Graph [${code}]: ${msg || errorText}`;
      }
    } catch {
      errorMessage = `${errorMessage}: ${errorText}`;
    }

    return {
      success: false,
      simulated: false,
      message: errorMessage,
      error: 'GRAPH_API_REJECTED',
      details: errorText,
    };
  } catch (err: any) {
    console.error('[Microsoft Graph Mail] Exceção durante envio:', err);
    return {
      success: false,
      simulated: false,
      message: err?.message || 'Falha de comunicação com o serviço de e-mail Microsoft Graph.',
      error: 'NETWORK_EXCEPTION',
    };
  }
}
