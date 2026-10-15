import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get('token');

    if (!rawToken || typeof rawToken !== 'string') {
      return NextResponse.json({ error: 'Token de auditoria obrigatório.' }, { status: 400 });
    }

    const token = rawToken.trim();

    // 1. Busca via função RPC SECURITY DEFINER que retorna { audit: ..., action: ... }
    let auditData: any = null;
    let actionData: any = null;

    try {
      const { data, error } = await supabase.rpc('get_audit_action_by_token', { p_token: token });
      if (!error && data) {
        auditData = data.audit;
        actionData = data.action;
      }
    } catch (rpcErr) {
      console.warn('[api/controladoria/audit] Erro ao chamar RPC get_audit_action_by_token:', rpcErr);
    }

    // 2. Fallback direto caso a RPC não tenha retornado a ação
    if (!actionData) {
      try {
        const { data: directAction } = await supabase
          .from('lean_actions')
          .select('*')
          .or(`audit_token.eq.${token},methodology_data->controllershipAudit->>token.eq.${token}`)
          .maybeSingle();

        if (directAction) {
          actionData = directAction;
          auditData = auditData || directAction.methodology_data?.controllershipAudit || null;
        }
      } catch (directErr) {
        console.warn('[api/controladoria/audit] Erro no fallback de consulta direta:', directErr);
      }
    }

    if (!actionData && !auditData) {
      return NextResponse.json(
        { error: 'Auditoria não encontrada para este link ou o token é inválido.' },
        { status: 404 }
      );
    }

    // 3. Normalização abrangente garantindo compatibilidade camelCase e snake_case
    const method = actionData?.methodology_data || {};
    const effectiveAudit = auditData || method.controllershipAudit || {};

    const normalizedAudit = {
      ...effectiveAudit,
      id: effectiveAudit.id || `aud_${Date.now()}`,
      token: effectiveAudit.token || token,
      status: effectiveAudit.status || 'pendente',
      submittedAt: effectiveAudit.submitted_at || effectiveAudit.submittedAt || actionData?.created_at,
      submitted_at: effectiveAudit.submitted_at || effectiveAudit.submittedAt || actionData?.created_at,
      submittedBy: effectiveAudit.submitted_by || effectiveAudit.submittedBy || method.leaderName || 'Agente Lean',
      submitted_by: effectiveAudit.submitted_by || effectiveAudit.submittedBy || method.leaderName || 'Agente Lean',
      originalCostBreakdown: effectiveAudit.original_breakdown || effectiveAudit.originalCostBreakdown || actionData?.cost_breakdown || method.costBreakdown || {},
      original_breakdown: effectiveAudit.original_breakdown || effectiveAudit.originalCostBreakdown || actionData?.cost_breakdown || method.costBreakdown || {},
      originalEstimatedCostAvoided: Number(effectiveAudit.original_estimated_cost_avoided) || Number(effectiveAudit.originalEstimatedCostAvoided) || Number(actionData?.actual_cost_avoided) || Number(actionData?.estimated_cost_avoided) || 0,
      original_estimated_cost_avoided: Number(effectiveAudit.original_estimated_cost_avoided) || Number(effectiveAudit.originalEstimatedCostAvoided) || Number(actionData?.actual_cost_avoided) || Number(actionData?.estimated_cost_avoided) || 0,
      originalProjectCosts: effectiveAudit.original_project_costs || effectiveAudit.originalProjectCosts || actionData?.investment_costs || method.projectCosts,
      original_project_costs: effectiveAudit.original_project_costs || effectiveAudit.originalProjectCosts || actionData?.investment_costs || method.projectCosts,
      approvedCostBreakdown: effectiveAudit.approved_breakdown || effectiveAudit.approvedCostBreakdown,
      approved_breakdown: effectiveAudit.approved_breakdown || effectiveAudit.approvedCostBreakdown,
      approvedEstimatedCostAvoided: effectiveAudit.approved_estimated_cost_avoided || effectiveAudit.approvedEstimatedCostAvoided,
      approved_estimated_cost_avoided: effectiveAudit.approved_estimated_cost_avoided || effectiveAudit.approvedEstimatedCostAvoided,
      approvedProjectCosts: effectiveAudit.approved_project_costs || effectiveAudit.approvedProjectCosts,
      approved_project_costs: effectiveAudit.approved_project_costs || effectiveAudit.approvedProjectCosts,
      gainDetails: effectiveAudit.gain_details || effectiveAudit.gainDetails || method.gainDetails || actionData?.gainDetails || {},
      gain_details: effectiveAudit.gain_details || effectiveAudit.gainDetails || method.gainDetails || actionData?.gainDetails || {},
      reviewedAt: effectiveAudit.reviewed_at || effectiveAudit.reviewedAt,
      reviewed_at: effectiveAudit.reviewed_at || effectiveAudit.reviewedAt,
      reviewedBy: effectiveAudit.reviewed_by || effectiveAudit.reviewedBy,
      reviewed_by: effectiveAudit.reviewed_by || effectiveAudit.reviewedBy,
      reviewerEmail: effectiveAudit.reviewer_email || effectiveAudit.reviewerEmail,
      reviewer_email: effectiveAudit.reviewer_email || effectiveAudit.reviewerEmail,
      reviewerRole: effectiveAudit.reviewer_role || effectiveAudit.reviewerRole,
      reviewer_role: effectiveAudit.reviewer_role || effectiveAudit.reviewerRole,
      auditNotes: effectiveAudit.audit_notes || effectiveAudit.auditNotes,
      audit_notes: effectiveAudit.audit_notes || effectiveAudit.auditNotes,
      rejectionReason: effectiveAudit.rejection_reason || effectiveAudit.rejectionReason,
      rejection_reason: effectiveAudit.rejection_reason || effectiveAudit.rejectionReason,
      emailSentTo: effectiveAudit.email_sent_to || effectiveAudit.emailSentTo,
      email_sent_to: effectiveAudit.email_sent_to || effectiveAudit.emailSentTo,
      emailSentAt: effectiveAudit.email_sent_at || effectiveAudit.emailSentAt,
      email_sent_at: effectiveAudit.email_sent_at || effectiveAudit.emailSentAt,
      emailStatus: effectiveAudit.email_status || effectiveAudit.emailStatus,
      email_status: effectiveAudit.email_status || effectiveAudit.emailStatus,
    };

    return NextResponse.json({
      success: true,
      result: { audit: normalizedAudit, action: actionData },
      audit: normalizedAudit,
      action: actionData,
    });
  } catch (err: any) {
    console.error('[api/controladoria/audit] Erro inesperado no GET:', err);
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
      gainDetails = null,
    } = body;

    if (!token || !status || !reviewerName || !reviewerEmail) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes para avaliação de auditoria.' },
        { status: 400 }
      );
    }

    // Submete decisão via função RPC privada protegida submit_audit_decision_v2
    const { data, error } = await supabase.rpc('submit_audit_decision_v2', {
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
      p_gain_details: gainDetails,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}
