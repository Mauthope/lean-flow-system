'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, ArrowLeft, Scale, Building2, Cpu, CheckCircle2 } from 'lucide-react';

export default function TermosPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#040711',
        color: '#f8fafc',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Navegação Superior */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#22d3ee',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(34, 211, 238, 0.08)',
              border: '1px solid rgba(34, 211, 238, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} /> Voltar para a Página Inicial
          </Link>
        </div>

        {/* Cabeçalho */}
        <div
          style={{
            padding: '2rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #090e1a 0%, #0c1829 100%)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(34, 211, 238, 0.15)',
                border: '1px solid rgba(34, 211, 238, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale size={22} color="#22d3ee" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  margin: 0,
                }}
              >
                Termos de Uso e Serviço
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Versão 1.0 &bull; Última Atualização: 9 de Outubro de 2026 &bull; Grupo Vaccaro / Rafitec S.A.
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, margin: '1rem 0 0 0' }}>
            O <strong>Lean Flow System</strong> é a plataforma corporativa de Gestão de Fluxo Lean, Melhoria Contínua (Kaizen), TPM e Homologação de Custo Evitado desenvolvida para governança e operações industriais. O uso deste software é regido pela legislação brasileira de propriedade intelectual e diretrizes de conformidade corporativa.
          </p>
        </div>

        {/* Conteúdo Estruturado */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            backgroundColor: '#070b16',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Seção 1 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22d3ee', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} /> 1. Acesso Corporativo e Segurança Zero Trust
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              O acesso ao sistema é restrito a colaboradores autenticados via Microsoft Entra ID (SSO corporativo do domínio <code>@rafitec.com.br</code>) ou credenciais autorizadas. O usuário deve zelar pela integridade de suas credenciais de rede, sendo vedado o compartilhamento de acessos ou a inserção de dados fraudulentos no sistema.
            </p>
          </section>

          {/* Seção 2 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22d3ee', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={18} /> 2. Propriedade Intelectual (Lei 9.609/98 e Lei 9.610/98)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Todo o código-fonte, design, algoritmos de cálculo de Custo Evitado, interfaces e fluxos de auditoria constituem propriedade intelectual exclusiva desenvolvida por Mauricio Grigol para a organização. É terminantemente proibida qualquer tentativa de engenharia reversa, cópia de algoritmos ou exploração não autorizada.
            </p>
          </section>

          {/* Seção 3 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22d3ee', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} /> 3. Uso do Sensei IA e Limitação de Responsabilidade
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              O assistente de inteligência artificial <strong>Sensei IA</strong> opera em caráter estritamente consultivo, didático e assistencial. Suas análises de causa raiz (Ishikawa 6M / 5 Porquês), sugestões de POP e cálculos preliminares de payback não substituem a verificação física no Gemba e a aprovação formal dos engenheiros e líderes do processo produtivo.
            </p>
          </section>

          {/* Seção 4 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22d3ee', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> 4. Homologação da Controladoria
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Todo ganho financeiro mensurável por projeto Kaizen submete-se ao protocolo formal de chancela da Controladoria Corporativa. A validação de baseline e a alimentação mensal de resultados são indispensáveis para a comprovação de retorno econômico anualizado.
            </p>
          </section>

          {/* Seção 5 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22d3ee', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} /> 5. Foro e Legislação Aplicável
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Estes Termos são regidos integralmente pelas leis da República Federativa do Brasil, em especial o Marco Civil da Internet (Lei 12.965/14) e a Lei do Software (Lei 9.609/98). Eventuais litígios serão processados perante o Foro da sede corporativa da organização.
            </p>
          </section>
        </div>

        {/* Rodapé */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          Lean Flow System &bull; Grupo Vaccaro &bull; Desenvolvido por Mauricio Grigol &bull; Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
