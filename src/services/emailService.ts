/**
 * Serviço de E-mails Transacionais & Notificações Corporativas
 * Integração Oficial Microsoft Graph API & Modo Simulado Local
 */

import {
  buildControladoriaAuditEmailHtml,
  formatCurrencyBRL,
} from '@/lib/emailTemplates';

export { formatCurrencyBRL };

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
  tenantName?: string;
  tenantId?: string;
}

export interface SendEmailResult {
  success: boolean;
  simulated: boolean;
  messageId?: string;
  auditUrl: string;
  error?: string;
  message?: string;
}

/**
 * Gera o template HTML corporativo para a notificação de auditoria
 * (Utiliza a estrutura de tabelas estritas compatíveis com Outlook Desktop)
 */
export function generateAuditEmailHtml(params: ControladoriaInviteParams): string {
  return buildControladoriaAuditEmailHtml({
    recipientName: params.recipientName || 'Prezado(a) Responsável da Controladoria',
    projectTitle: params.projectTitle,
    protocol: params.protocol,
    sectorName: params.sectorName || 'Setor Industrial',
    leaderName: params.leaderName || 'Especialista Lean',
    estimatedSavings: params.estimatedSavings,
    investmentCost: params.investmentCost,
    paybackMonths: params.paybackMonths,
    auditUrl: params.auditUrl,
    tenantName: params.tenantName || 'Rafitec S.A.',
  });
}

/**
 * Serviço de E-mail: Dispara ou simula o envio do convite de auditoria via Microsoft Graph
 */
export async function sendControladoriaAuditInvite(
  params: ControladoriaInviteParams
): Promise<SendEmailResult> {
  const subject = `[Lean Flow - Controladoria] Auditoria Financeira Requerida: ${params.protocol} - ${params.projectTitle}`;
  const html = generateAuditEmailHtml(params);

  // 1. Disparo Server-Side via API Route Next.js (Microsoft Graph)
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: params.recipientEmail,
          toName: params.recipientName || 'Controladoria & Custos',
          subject,
          html,
          tenantName: params.tenantName || 'Rafitec S.A.',
          tenantId: params.tenantId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          simulated: Boolean(data.simulated),
          auditUrl: params.auditUrl,
          message: data.message || `Notificação processada com sucesso para ${params.recipientEmail}.`,
        };
      } else {
        console.warn('[EmailService] API interna retornou falha no envio:', data);
        return {
          success: false,
          simulated: false,
          auditUrl: params.auditUrl,
          error: data.error || data.message || 'Falha ao despachar mensagem pelo Microsoft Graph.',
          message: data.message,
        };
      }
    } catch (apiErr: any) {
      console.warn('[EmailService] Falha de comunicação com /api/email/send, ativando fallback simulado:', apiErr);
    }
  }

  // 2. Fallback Seguro / Modo Local Simulado (Para testes locais sem servidor M365 ativo)
  console.group('[LEAN FLOW - SIMULAÇÃO DE E-MAIL PARA CONTROLADORIA]');
  console.log(`Para: ${params.recipientEmail} (${params.recipientName || 'Responsável'})`);
  console.log(`Assunto: ${subject}`);
  console.log(`Projeto: ${params.protocol} - ${params.projectTitle}`);
  console.log(`Ganhos Estimados: ${formatCurrencyBRL(params.estimatedSavings)}/ano`);
  console.log(`Link de Auditoria Gerado: ${params.auditUrl}`);
  console.groupEnd();

  return {
    success: true,
    simulated: true,
    auditUrl: params.auditUrl,
    message: `Notificação registrada em modo simulado. O link seguro está pronto para ser acessado: ${params.auditUrl}`,
  };
}
