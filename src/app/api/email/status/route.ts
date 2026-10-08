import { NextResponse } from 'next/server';
import { getGraphConfigStatus } from '@/lib/microsoftGraphMail';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = getGraphConfigStatus();
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Falha ao consultar status do serviço de e-mail.',
      },
      { status: 500 }
    );
  }
}
