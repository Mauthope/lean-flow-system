'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Database, UserCheck, EyeOff, Mail, Server } from 'lucide-react';

export default function PrivacidadePage() {
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
              color: '#34d399',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
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
            background: 'linear-gradient(135deg, #090e1a 0%, #064e3b 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
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
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} color="#10b981" />
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
                Política de Privacidade & Proteção de Dados
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Versão 1.0 &bull; Em Conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 - LGPD)
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, margin: '1rem 0 0 0' }}>
            A privacidade e a proteção de dados pessoais dos colaboradores e operadores do <strong>Lean Flow System</strong> são compromissos inegociáveis. Esta política detalha de forma clara, transparente e acessível como os dados são tratados e protegidos sob o regime de <em>Privacy by Design</em>.
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} /> 1. Dados Coletados e Finalidades Específicas
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Coletamos exclusivamente dados cadastrais profissionais vinculados à identidade corporativa (nome, e-mail institucional <code>@rafitec.com.br</code>, setor de atuação e registros operacionais de projetos Kaizen). O tratamento é estritamente respaldado pela execução do contrato de trabalho e cumprimento de obrigações legais (Art. 7º, incisos II e V da LGPD).
            </p>
          </section>

          {/* Seção 2 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} /> 2. Guarda de Registros (Marco Civil da Internet)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Em conformidade com o Artigo 15 da Lei nº 12.965/2014 (Marco Civil da Internet), a plataforma mantém registros de acesso a aplicações (endereço IP, data, hora e identificação de sessão) em ambiente seguro e controlado pelo prazo mínimo legal de <strong>6 (seis) meses</strong>.
            </p>
          </section>

          {/* Seção 3 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <EyeOff size={18} /> 3. Proibição de Dark Patterns e Não-Comercialização
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Nenhum dado pessoal coletado é vendido, alugado ou compartilhado com terceiros para fins de marketing ou publicidade. A plataforma não emprega técnicas manipulativas de interface (*dark patterns*), garantindo que todas as opções de perfil e configuração sejam claras e objetivas.
            </p>
          </section>

          {/* Seção 4 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} /> 4. Isolamento Multi-Tenant e Segurança da Informação
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Os dados corporativos operam sob isolamento estrito de entidades no Supabase PostgreSQL por meio de <strong>Row Level Security (RLS)</strong>. As chaves de integração com modelos de inteligência artificial são mantidas exclusivamente no servidor backend corporativo, impedindo qualquer vazamento no navegador do usuário.
            </p>
          </section>

          {/* Seção 5 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} /> 5. Direitos do Titular (Artigo 18 da LGPD)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              O titular de dados pode, a qualquer momento, requerer a confirmação de tratamento, acesso, correção ou eliminação de seus dados pessoais. O sistema dispõe de rotinas de expurgo e anonimização de contas para cumprimento do direito de esquecimento corporativo, ressalvada a guarda histórica obrigatória de apontamentos técnicos e contábeis.
            </p>
          </section>

          {/* Seção 6 */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} /> 6. Canal do Encarregado de Dados (DPO)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Para solicitações relacionadas à Lei Geral de Proteção de Dados, entre em contato com nosso Encarregado de Proteção de Dados através do e-mail oficial: <code>dpo@rafitec.com.br</code> com o assunto <code>[LGPD - Solicitação do Titular]</code>.
            </p>
          </section>
        </div>

        {/* Rodapé */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          Lean Flow System &bull; Grupo Vaccaro &bull; Desenvolvido por Mauricio Grigol &bull; Privacidade por Padrão.
        </div>
      </div>
    </div>
  );
}
