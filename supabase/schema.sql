-- =============================================================================
-- LEAN FLOW SYSTEM - ESQUEMA DE BANCO DE DADOS POSTGRESQL (SUPABASE)
-- Multi-Tenant Industrial com Row Level Security (RLS) & Governança Fabril
-- Autor / Titular Root Master: mauricio.grigol@rafitec.com.br
-- =============================================================================

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABELA DE ENTIDADES FABRIS / MULTI-TENANT (public.tenants)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY DEFAULT ('tenant_' || replace(gen_random_uuid()::text, '-', '')),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cnpj_or_code TEXT,
    plan TEXT NOT NULL DEFAULT 'enterprise' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    ai_settings JSONB NOT NULL DEFAULT '{
        "controladoriaEmail": "controladoria@rafitec.com.br",
        "controladoriaName": "Gerência de Controladoria & Custos",
        "autoNotifyControladoria": true,
        "model": "gemini-1.5-flash",
        "preferredVoice": "pt-BR-Neural2-B"
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. TABELA DE PERFIS DE USUÁRIOS (public.profiles)
-- Estende o auth.users do Supabase Auth
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'viewer')),
    job_title TEXT DEFAULT 'Agente de Melhoria Contínua',
    department TEXT DEFAULT 'Operações Industriais',
    avatar_url TEXT,
    is_master BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'pendente')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_master ON public.profiles(is_master) WHERE is_master = true;

-- =============================================================================
-- 3. TABELA DE SETORES INDUSTRIAIS (public.sectors)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sectors (
    id TEXT PRIMARY KEY DEFAULT ('sec_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#0284c7',
    requires_control_document BOOLEAN NOT NULL DEFAULT false,
    control_document_name TEXT DEFAULT 'Ordem de Serviço (OS)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sectors_tenant_id ON public.sectors(tenant_id);

-- =============================================================================
-- 4. TABELA DE AÇÕES LEAN / KANBAN / PROJETOS A3 (public.lean_actions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.lean_actions (
    id TEXT PRIMARY KEY DEFAULT ('act_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    protocol TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    origin_sector_id TEXT REFERENCES public.sectors(id) ON DELETE SET NULL,
    target_sector_id TEXT REFERENCES public.sectors(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'aberta' 
        CHECK (status IN ('aberta', 'em_andamento', 'aguardando_aprovacao', 'concluida', 'nao_aprovada')),
    priority TEXT NOT NULL DEFAULT 'media' 
        CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
    waste_category TEXT NOT NULL DEFAULT 'espera',
    assessment_dimension_id TEXT DEFAULT 'tpm_oee',
    strategic_objective_id TEXT,
    pdca_stage TEXT NOT NULL DEFAULT 'plan' 
        CHECK (pdca_stage IN ('plan', 'do', 'check', 'act')),
    
    -- Valores Financeiros & Custo Evitado
    estimated_cost_avoided NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_cost_avoided NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    investment_costs JSONB DEFAULT '{"capex": 0, "opex": 0, "total": 0}'::jsonb,
    cost_breakdown JSONB DEFAULT '{"rawMaterialSavings": 0, "machineDowntimeCostReduction": 0, "energySaving": 0, "laborOptimization": 0, "logisticsScrapReduction": 0}'::jsonb,

    -- Prazos & Rastreabilidade de Reprogramação (Conformidade SGQ/Auditoria)
    due_date DATE,
    original_end_date DATE,
    postponed_count INT NOT NULL DEFAULT 0,
    conclusion_date DATE,

    -- Poka-Yoke do Sensei IA & Homologação
    poka_yoke_status TEXT DEFAULT 'aprovado',
    poka_yoke_refined_text TEXT,
    submitted_for_approval BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ,
    master_approved BOOLEAN NOT NULL DEFAULT false,
    master_approved_at TIMESTAMPTZ,
    master_approver_name TEXT,

    -- Metadados Dinâmicos (Ishikawa, 5 Porquês, Histórico Timeline, Radar de Ganhos)
    methodology_data JSONB DEFAULT '{}'::jsonb,
    timeline_notes JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lean_actions_tenant_id ON public.lean_actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lean_actions_status ON public.lean_actions(status);
CREATE INDEX IF NOT EXISTS idx_lean_actions_protocol ON public.lean_actions(protocol);
CREATE INDEX IF NOT EXISTS idx_lean_actions_assigned ON public.lean_actions(assigned_agent_id);

-- =============================================================================
-- 5. TABELA DE ATIVIDADES 5W2H (public.action_checklists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.action_checklists (
    id TEXT PRIMARY KEY DEFAULT ('chk_' || replace(gen_random_uuid()::text, '-', '')),
    action_id TEXT NOT NULL REFERENCES public.lean_actions(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    what TEXT,
    why TEXT,
    where_location TEXT,
    how TEXT,
    who TEXT,
    start_date DATE,
    end_date DATE,
    original_end_date DATE,
    postponed_count INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    conclusion_date DATE,
    
    -- Exigência Dinâmica de Rastreabilidade (OC / OS)
    sector_id TEXT REFERENCES public.sectors(id) ON DELETE SET NULL,
    doc_number TEXT,

    -- Anexos Técnicos
    attachment JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_checklists_action_id ON public.action_checklists(action_id);
CREATE INDEX IF NOT EXISTS idx_action_checklists_tenant_id ON public.action_checklists(tenant_id);

-- =============================================================================
-- 6. TABELA DO CANAL KAIZEN (public.kaizen_ideas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.kaizen_ideas (
    id TEXT PRIMARY KEY DEFAULT ('kzn_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    protocol TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sector_id TEXT REFERENCES public.sectors(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    status TEXT NOT NULL DEFAULT 'pendente' 
        CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'convertida_em_acao')),
    triage_notes TEXT,
    converted_action_id TEXT REFERENCES public.lean_actions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kaizen_ideas_tenant_id ON public.kaizen_ideas(tenant_id);

-- =============================================================================
-- 7. TABELAS TPM INDUSTRIAL (Máquinas, Auditorias e Etiquetas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tpm_machines (
    id TEXT PRIMARY KEY DEFAULT ('mac_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sector_id TEXT REFERENCES public.sectors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    manufacturer TEXT,
    criticality TEXT NOT NULL DEFAULT 'B' CHECK (criticality IN ('A', 'B', 'C')),
    oee_target NUMERIC(5, 2) DEFAULT 85.00,
    current_oee NUMERIC(5, 2) DEFAULT 78.50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tpm_tags (
    id TEXT PRIMARY KEY DEFAULT ('tag_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    machine_id TEXT NOT NULL REFERENCES public.tpm_machines(id) ON DELETE CASCADE,
    tag_number TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('azul_operacional', 'vermelha_manutencao')),
    status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_tratamento', 'concluida')),
    description TEXT NOT NULL,
    opened_by TEXT NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.tpm_audits (
    id TEXT PRIMARY KEY DEFAULT ('aud_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    machine_id TEXT NOT NULL REFERENCES public.tpm_machines(id) ON DELETE CASCADE,
    auditor_name TEXT NOT NULL,
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    score NUMERIC(5, 2) NOT NULL,
    non_conformities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 8. TABELA DE DIRETRIZES HOSHIN KANRI / ALTA GERÊNCIA (public.strategic_objectives)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.strategic_objectives (
    id TEXT PRIMARY KEY DEFAULT ('obj_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    pillar TEXT NOT NULL,
    title TEXT NOT NULL,
    target_description TEXT NOT NULL,
    target_value NUMERIC(15, 2) NOT NULL,
    current_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    unit TEXT NOT NULL DEFAULT 'R$',
    year INT NOT NULL DEFAULT 2026,
    status TEXT NOT NULL DEFAULT 'no_prazo' CHECK (status IN ('no_prazo', 'atencao', 'critico', 'concluido')),
    sensei_diagnosis TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 9. TABELA DA CONTROLADORIA (public.controllership_audits)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.controllership_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' 
        CHECK (status IN ('pendente', 'aprovado', 'ajustado_e_aprovado', 'rejeitado')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_by TEXT NOT NULL,
    submitted_by_role TEXT,
    
    original_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    original_estimated_cost_avoided NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    original_project_costs JSONB,

    approved_breakdown JSONB,
    approved_estimated_cost_avoided NUMERIC(15, 2),
    approved_project_costs JSONB,

    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    reviewer_email TEXT,
    reviewer_role TEXT,
    audit_notes TEXT,
    rejection_reason TEXT,

    email_sent_to TEXT,
    email_sent_at TIMESTAMPTZ,
    email_status TEXT DEFAULT 'simulado',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_controllership_audits_token ON public.controllership_audits(token);

-- =============================================================================
-- 10. POLÍTICAS DE ROW LEVEL SECURITY (RLS) MULTI-TENANT E ROOT MASTER
-- =============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lean_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaizen_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tpm_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tpm_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tpm_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controllership_audits ENABLE ROW LEVEL SECURITY;

-- Função auxiliar que determina se o usuário é Root Master
CREATE OR REPLACE FUNCTION public.is_master_user() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_master = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar que retorna o tenant_id do usuário atual
CREATE OR REPLACE FUNCTION public.current_user_tenant_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT tenant_id FROM public.profiles
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Regras para Tenants: Master vê todos, usuários normais veem o seu
CREATE POLICY "Tenants visibilidade" ON public.tenants
    FOR SELECT USING (public.is_master_user() OR id = public.current_user_tenant_id());

CREATE POLICY "Tenants master gerenciamento" ON public.tenants
    FOR ALL USING (public.is_master_user());

-- Regras para Profiles
CREATE POLICY "Profiles visibilidade" ON public.profiles
    FOR SELECT USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

CREATE POLICY "Profiles auto-atualização" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Profiles master gerenciamento" ON public.profiles
    FOR ALL USING (public.is_master_user());

-- Regras para Setores
CREATE POLICY "Sectors isolamento" ON public.sectors
    FOR ALL USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

-- Regras para Ações Lean (Kanban)
CREATE POLICY "Lean Actions isolamento" ON public.lean_actions
    FOR ALL USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

-- Regras para Checklists 5W2H
CREATE POLICY "Checklists isolamento" ON public.action_checklists
    FOR ALL USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

-- Regras para Canal Kaizen
CREATE POLICY "Kaizen Ideas isolamento" ON public.kaizen_ideas
    FOR ALL USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

-- Regras para TPM
CREATE POLICY "TPM Machines isolamento" ON public.tpm_machines
    FOR ALL USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

CREATE POLICY "TPM Tags isolamento" ON public.tpm_tags
    FOR ALL USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

CREATE POLICY "TPM Audits isolamento" ON public.tpm_audits
    FOR ALL USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

-- Regras para Objetivos Estratégicos
CREATE POLICY "Strategic Objectives isolamento" ON public.strategic_objectives
    FOR ALL USING (public.is_master_user() OR tenant_id = public.current_user_tenant_id());

-- Regras para Controladoria (Permite leitura e atualização anônima por Token Escopado Seguro)
CREATE POLICY "Controladoria token leitura" ON public.controllership_audits
    FOR SELECT USING (true);

CREATE POLICY "Controladoria token atualizacao" ON public.controllership_audits
    FOR UPDATE USING (status = 'pendente' OR auth.role() = 'authenticated');

-- =============================================================================
-- 11. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL NO SUPABASE AUTH
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    default_tenant_id TEXT;
    is_root_email BOOLEAN;
BEGIN
    SELECT id INTO default_tenant_id FROM public.tenants ORDER BY created_at ASC LIMIT 1;
    is_root_email := (lower(NEW.email) = 'mauricio.grigol@rafitec.com.br');

    INSERT INTO public.profiles (
        id,
        tenant_id,
        email,
        name,
        role,
        job_title,
        department,
        is_master,
        status
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'tenant_id', default_tenant_id),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        CASE WHEN is_root_email THEN 'admin' ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'agent') END,
        CASE WHEN is_root_email THEN 'Gestor Master de Entidades & Administrador' ELSE 'Agente de Melhoria Contínua' END,
        CASE WHEN is_root_email THEN 'Diretoria / Governança' ELSE 'Operações' END,
        is_root_email,
        'ativo'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_master = EXCLUDED.is_master;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dispara o trigger sempre que um usuário for criado no Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- =============================================================================
-- 12. SEED INICIAL (ENTIDADE PRINCIPAL RAFITEC)
-- =============================================================================
INSERT INTO public.tenants (id, name, slug, cnpj_or_code, plan, ai_settings)
VALUES (
    'tenant_rafitec_01',
    'Rafitec S.A.',
    'rafitec',
    '04.892.341/0001-55',
    'enterprise',
    '{
        "controladoriaEmail": "controladoria@rafitec.com.br",
        "controladoriaName": "Gerência de Controladoria & Custos",
        "autoNotifyControladoria": true,
        "model": "gemini-1.5-flash",
        "preferredVoice": "pt-BR-Neural2-B"
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Setores Iniciais Rafitec
INSERT INTO public.sectors (id, tenant_id, name, code, description, color, requires_control_document, control_document_name)
VALUES
    ('sec_rafitec_extrusao', 'tenant_rafitec_01', 'Extrusão & Fiação PP', 'EXT', 'Extrusoras de fita plana, dosagem de resina, estiramento e bobinamento', '#0284c7', true, 'Ordem de Serviço (OS)'),
    ('sec_rafitec_tecelagem', 'tenant_rafitec_01', 'Tecelagem Circular & Planos', 'TEC', 'Teares circulares, controle de trama/urdume, redução de paradas', '#2563eb', true, 'Ordem de Serviço (OS)'),
    ('sec_rafitec_laminacao', 'tenant_rafitec_01', 'Laminação & Revestimento', 'LAM', 'Extrusora de laminação, adesão de filme PE/PP, impressão', '#7c3aed', false, 'Ordem de Serviço (OS)'),
    ('sec_rafitec_acabamento', 'tenant_rafitec_01', 'Corte, Costura & Big Bags', 'ACAB', 'Corte automático, células de costura de alças, colocação de liners', '#059669', false, 'Ordem de Compra (OC)'),
    ('sec_rafitec_qualidade', 'tenant_rafitec_01', 'Qualidade & Laboratório', 'QUAL', 'Testes de tração, gramatura, fator de segurança 5:1/6:1 e 5S', '#0891b2', false, 'Ordem de Compra (OC)'),
    ('sec_rafitec_compras', 'tenant_rafitec_01', 'Compras & Suprimentos', 'COMP', 'Gestão de fornecedores de matéria-prima, peças de reposição e MRO', '#d97706', true, 'Ordem de Compra (OC)')
ON CONFLICT (id) DO NOTHING;
