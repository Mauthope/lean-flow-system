import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token de auditoria obrigatório.' }, { status: 400 });
    }

    // Busca via função RPC privada protegida
    const { data, error } = await supabase.rpc('get_audit_by_token', { p_token: token });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Auditoria não encontrada para este token.' }, { status: 404 });
    }

    return NextResponse.json({ audit: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      status,
      approvedEstimatedCostAvoided = 0,
      approvedBreakdown = {},
      approvedProjectCosts = {},
      reviewerName,
      reviewerEmail,
      reviewerRole = 'Controladoria',
      auditNotes = '',
      rejectionReason = '',
    } = body;

    if (!token || !status || !reviewerName || !reviewerEmail) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes para avaliação de auditoria.' },
        { status: 400 }
      );
    }

    // Submete decisão via função RPC privada protegida
    const { data, error } = await supabase.rpc('submit_audit_decision', {
      p_token: token,
      p_status: status,
      p_approved_estimated: approvedEstimatedCostAvoided,
      p_approved_breakdown: approvedBreakdown,
      p_approved_costs: approvedProjectCosts,
      p_reviewer_name: reviewerName,
      p_reviewer_email: reviewerEmail,
      p_reviewer_role: reviewerRole,
      p_audit_notes: auditNotes,
      p_rejection_reason: rejectionReason,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}
