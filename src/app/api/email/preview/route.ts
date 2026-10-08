import { NextRequest, NextResponse } from 'next/server';
import {
  buildControladoriaAuditEmailHtml,
  buildTestEmailHtml,
} from '@/lib/emailTemplates';
import { getGraphConfigStatus } from '@/lib/microsoftGraphMail';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'controladoria';
    const tenantName = searchParams.get('tenantName') || 'Rafitec S.A.';

    let html = '';
    const config = getGraphConfigStatus();

    if (type === 'test') {
      html = buildTestEmailHtml({
        recipientName: 'Gestor & Supervisor Lean',
        senderAddress: config.senderAddress,
        tenantName: tenantName,
        timestamp: new Date().toLocaleString('pt-BR'),
      });
    } else {
      html = buildControladoriaAuditEmailHtml({
        recipientName: 'Equipe de Controladoria & Custos',
        projectTitle: 'Balanceamento de Linha e Redução de Setup de Extrusão',
        protocol: 'LEAN-2026-0042',
        sectorName: 'Extrusão & Manutenção',
        leaderName: 'Supervisor de Melhoria Contínua',
        estimatedSavings: 185400,
        investmentCost: 12500,
        paybackMonths: 0.8,
        auditUrl: 'https://lean-flow-system.vercel.app/controladoria/auditoria/sec_demo_preview',
        tenantName: tenantName,
      });
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Falha ao gerar pré-visualização de e-mail.',
      },
      { status: 500 }
    );
  }
}
