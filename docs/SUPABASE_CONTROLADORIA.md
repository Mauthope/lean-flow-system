# Guia de Configuração: Homologação da Controladoria com Supabase & E-mails Transacionais

Este documento serve como referência técnica completa para quando o banco de dados e os serviços do **Supabase** forem oficialmente ativados no **Lean Flow System**.

---

## 1. Esquema SQL para o Supabase (PostgreSQL)

Execute o script SQL abaixo no **SQL Editor** do seu projeto Supabase:

```sql
-- 1. Criação da Tabela de Auditorias da Controladoria
CREATE TABLE IF NOT EXISTS public.controllership_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' 
        CHECK (status IN ('pendente', 'aprovado', 'ajustado_e_aprovado', 'rejeitado')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_by TEXT NOT NULL,
    submitted_by_role TEXT,
    
    -- Valores originais propostos pelo Kaizen
    original_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    original_estimated_cost_avoided NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    original_project_costs JSONB,

    -- Valores auditados e certificados pela Controladoria
    approved_breakdown JSONB,
    approved_estimated_cost_avoided NUMERIC(15, 2),
    approved_project_costs JSONB,

    -- Dados do Auditor e Parecer
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    reviewer_email TEXT,
    reviewer_role TEXT,
    audit_notes TEXT,
    rejection_reason TEXT,

    -- Rastreabilidade do E-mail
    email_sent_to TEXT,
    email_sent_at TIMESTAMPTZ,
    email_status TEXT DEFAULT 'simulado',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índices para Consulta Ultrarrápida por Token
CREATE INDEX IF NOT EXISTS idx_controllership_audits_token ON public.controllership_audits(token);
CREATE INDEX IF NOT EXISTS idx_controllership_audits_action_id ON public.controllership_audits(action_id);

-- 3. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.controllership_audits ENABLE ROW LEVEL SECURITY;

-- Permite leitura e atualização anônima/pública via Token Escopado Seguro (sem exigir login de admin do auditor)
CREATE POLICY "Permitir leitura por token de auditoria" 
    ON public.controllership_audits 
    FOR SELECT 
    USING (true);

CREATE POLICY "Permitir atualizacao do parecer por token de auditoria" 
    ON public.controllership_audits 
    FOR UPDATE 
    USING (status = 'pendente' OR auth.role() = 'authenticated');
```

---

## 2. Supabase Edge Function para Envio de E-mail

Para que o e-mail seja disparado diretamente por uma Edge Function do Supabase, você pode utilizar o **Resend** ou o **SMTP da sua empresa**.

### Estrutura do Arquivo: `supabase/functions/send-audit-email/index.ts`
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, auditUrl } = await req.json();

    if (!to || !html) {
      return new Response(JSON.stringify({ error: 'Faltam parâmetros obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Disparo via Resend (Parceiro oficial Supabase - 3.000 emails/mês grátis)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Lean Flow System <controladoria@suaempresa.com.br>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## 3. Variáveis de Ambiente Necessárias em Produção (`.env.local`)

```env
# Conexão com o Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-privada

# Chave do Provedor de E-mail (Opcional - caso não use o modo simulado)
RESEND_API_KEY=re_1234567890abcdef
```

---

## 4. Funcionamento Atual no Ambiente Local (Modo Liberado para Testes)

- **Sem travas:** Mesmo sem as variáveis acima, o sistema gera o token escopado normalmente.
- **Link direto na tela:** Ao submeter um projeto, a UI exibe os botões:
  1. `🔗 Abrir Portal do Controlador`: abre diretamente a tela `/controladoria/auditoria/[token]`.
  2. `📋 Copiar Link`: copia o link seguro para simular o recebimento em outro navegador.
  3. `⚡ Aprovar (Modo Teste)`: atalho para testes imediatos pelo administrador.
- **Console:** Um log corporativo formatado simula exatamente o envio do e-mail no console do navegador.
