import { NextRequest, NextResponse } from 'next/server';
import { sendMailViaGraph, getGraphConfigStatus } from '@/lib/microsoftGraphMail';
import {
  buildControladoriaAuditEmailHtml,
  buildTestEmailHtml,
} from '@/lib/emailTemplates';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      toName,
      subject: customSubject,
      html: customHtml,
      type = 'custom',
      tenantName = 'Rafitec S.A.',
      tenantId,
      templateData,
      cc = [],
    } = body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Endereço de e-mail do destinatário inválido ou não informado.',
        },
        { status: 400 }
      );
    }

    let finalSubject = customSubject || 'Notificação do Sistema Lean Flow';
    let finalHtml = customHtml || '';
    const config = getGraphConfigStatus();

    // Se for e-mail de teste de conectividade
    if (type === 'test') {
      finalSubject = `[TESTE M365] Homologação Microsoft Graph - ${tenantName}`;
      finalHtml = buildTestEmailHtml({
        recipientName: toName || to.split('@')[0],
        senderAddress: config.senderAddress,
        tenantName: tenantName,
        timestamp: new Date().toLocaleString('pt-BR'),
      });
    } else if (type === 'controladoria' && templateData) {
      finalSubject =
        customSubject ||
        `[${tenantName}] Auditoria Financeira Requerida: ${templateData.protocol} - ${templateData.projectTitle}`;
      finalHtml = buildControladoriaAuditEmailHtml({
        ...templateData,
        tenantName: tenantName,
      });
    }

    if (!finalHtml) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conteúdo HTML da mensagem não fornecido.',
        },
        { status: 400 }
      );
    }

    // Dispara via conector Microsoft Graph (ou simula se EMAIL_ENABLED=false)
    const result = await sendMailViaGraph({
      to: to.trim().toLowerCase(),
      toName,
      subject: finalSubject,
      html: finalHtml,
      tenantName,
      cc,
    });

    // Auditoria SecOps: Registra tentativa de envio no Supabase (se configurado)
    try {
      if (supabase) {
        await supabase.from('email_logs').insert([
          {
            tenant_id: tenantId || null,
            sender: config.senderAddress,
            recipient: to.trim().toLowerCase(),
            subject: finalSubject,
            status: result.simulated ? 'simulado' : result.success ? 'enviado' : 'falha',
            error_message: result.error || (result.success ? null : result.message),
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Ignora falha silenciosa se a tabela de auditoria ainda não existir no Supabase
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error('[API /api/email/send] Erro no processamento:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Falha interna ao processar envio de e-mail.',
      },
      { status: 500 }
    );
  }
}
