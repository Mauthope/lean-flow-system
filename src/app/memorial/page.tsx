'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Award,
  BarChart3,
  Filter,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Cpu,
  GraduationCap,
  Library,
  Layers,
  Clock,
  Building2,
  GitPullRequest,
  Check,
  TrendingUp,
} from 'lucide-react';

export default function MemorialDescritivoPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(0);

  const totalPages = 10; // 0 = Capa, 1 = Sumário & Prólogo, 2..8 = Capítulos 1..7, 9 = Bibliografia

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const pageTitles = [
    'Capa Nobre',
    'Sumário & Prólogo',
    'Cap. 1: Dashboard & Lead Time',
    'Cap. 2: Triagem & Matriz GUT',
    'Cap. 3: Metodologia PDCA',
    'Cap. 4: Engenharia Financeira',
    'Cap. 5: Governança Contábil',
    'Cap. 6: TPM & 5S Autônomo',
    'Cap. 7: Pessoas & Assessment',
    'Cap. 8: Bibliografia ABNT',
  ];

  return (
    <div className="memorial-document-wrapper">
      {/* ========================================================================= */}
      {/* PRINT-SPECIFIC & SCREEN STYLES                                            */}
      {/* ========================================================================= */}
      <style jsx global>{`
        @media screen {
          .memorial-document-wrapper {
            background-color: #0b1120;
            min-height: 100vh;
            color: #0f172a;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1.5rem 1rem 4rem 1rem;
          }

          .memorial-screen-page {
            width: 100%;
            max-width: 960px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
            padding: 3.5rem 3.5rem;
            box-sizing: border-box;
            min-height: 1100px;
            margin-bottom: 2rem;
            position: relative;
          }

          /* Show only active page on screen */
          .memorial-section {
            display: none;
          }
          .memorial-section.active-screen-page {
            display: block;
            animation: fadeInPage 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes fadeInPage {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 18mm 18mm 18mm 18mm;
          }

          html, body {
            background-color: #ffffff !important;
            color: #111827 !important;
            font-size: 11.5pt !important;
            line-height: 1.6 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print,
          .memorial-screen-toolbar,
          .memorial-screen-pagination {
            display: none !important;
          }

          .memorial-document-wrapper {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            display: block !important;
          }

          .memorial-screen-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            min-height: auto !important;
          }

          /* Print ALL sections sequentially with clean page breaks */
          .memorial-section {
            display: block !important;
            page-break-before: always !important;
            break-before: page !important;
            padding-top: 10mm !important;
            padding-bottom: 10mm !important;
          }

          .memorial-section:first-of-type {
            page-break-before: avoid !important;
            break-before: avoid !important;
            padding-top: 0 !important;
          }

          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }

        /* Typography & Editorial Accents */
        .memorial-serif {
          font-family: 'Merriweather', 'Georgia', 'Cambria', serif;
        }

        .academic-header {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }

        .formula-box {
          background-color: #f8fafc;
          border-left: 4px solid #0ea5e9;
          border-right: 1px solid #e2e8f0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.25rem 1.5rem;
          border-radius: 0 8px 8px 0;
          margin: 1.5rem 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .academic-quote {
          font-style: italic;
          color: #334155;
          border-left: 3px solid #cbd5e1;
          padding-left: 1.25rem;
          margin: 1.25rem 0;
          line-height: 1.7;
        }

        .concept-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background-color: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* FLOATING ACTION TOOLBAR (SCREEN ONLY)                                     */}
      {/* ========================================================================= */}
      <div
        className="memorial-screen-toolbar no-print"
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <ArrowLeft size={16} /> Voltar ao FluxoLean
          </button>

          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.15)', height: '22px' }} />

          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Documento Técnico & Metodológico • <strong>Autor: Mauricio Grigol</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1.15rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0ea5e9')}
          >
            <Printer size={16} /> Imprimir Obra Completa (A4 / PDF)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN DOCUMENT CONTAINER                                                   */}
      {/* ========================================================================= */}
      <main className="memorial-screen-page">
        {/* ===================================================================== */}
        {/* PÁGINA 0: CAPA NOBRE EDITORIAL                                        */}
        {/* ===================================================================== */}
        <section
          className={`memorial-section ${currentPage === 0 ? 'active-screen-page' : ''}`}
          style={{ minHeight: '920px', display: currentPage === 0 ? 'flex' : undefined, flexDirection: 'column', justifyContent: 'space-between' }}
        >
          {/* Header Institucional da Capa */}
          <div style={{ textAlign: 'center', borderBottom: '3px double #cbd5e1', paddingBottom: '2.5rem', paddingTop: '1rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                padding: '0.45rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              <Cpu size={16} color="#38bdf8" /> FLUXOLEAN INDUSTRIAL ECOSYSTEM
            </div>
            <p style={{ fontSize: '0.85rem', letterSpacing: '0.25em', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, margin: 0 }}>
              MEMORIAL DESCRITIVO & FUNDAMENTAÇÃO METODOLÓGICA
            </p>
          </div>

          {/* Bloco Central do Título */}
          <div style={{ textAlign: 'center', margin: '3.5rem 0' }}>
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#0284c7',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                display: 'block',
                marginBottom: '1rem',
              }}
            >
              Trabalho Monográfico de Engenharia de Processos
            </span>

            <h1
              className="memorial-serif"
              style={{
                fontSize: '2.35rem',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.25,
                margin: '0 auto 1.5rem auto',
                maxWidth: '820px',
                letterSpacing: '-0.02em',
              }}
            >
              FLUXOLEAN 4.0: ARQUITETURA DE SINCRONISMO OPERACIONAL, GOVERNANÇA PDCA E ENGENHARIA DE CUSTOS EVITADOS
            </h1>

            <div style={{ width: '80px', height: '4px', backgroundColor: '#0ea5e9', margin: '1.75rem auto' }} />

            <p
              style={{
                fontSize: '1.1rem',
                color: '#475569',
                maxWidth: '720px',
                margin: '0 auto',
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
              Uma Abordagem Estruturada para a Eliminação Sistemática de Desperdícios, Conexão do Chão de Fábrica à Controladoria e Validação Contábil do Retorno sobre o Capital Lean
            </p>
          </div>

          {/* Apresentação Autêntica do Autor */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '2rem 2.25rem',
              margin: '2rem 0',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.35rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                }}
              >
                MG
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Idealizador & Engenheiro de Software Industrial
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
                  Mauricio Grigol
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Especialista em Melhoria Contínua, Metodologia Lean & Arquitetura de Sistemas Operacionais
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.7, margin: '0 0 1rem 0', textAlign: 'justify' }}>
              A idealização e desenvolvimento da plataforma <strong>FluxoLean</strong> nasceram de uma convicção forjada no dia a dia da indústria:
              a melhoria contínua só atinge maturidade quando o conhecimento empírico do chão de fábrica encontra o rigor analítico da engenharia e a fé pública da controladoria contábil.
            </p>

            <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.7, margin: 0, textAlign: 'justify' }}>
              Tratou-se de conceber não apenas um software de gestão, mas um ecossistema metodológico completo — integrando a simplicidade visual do <em>Gemba</em>
              à solidez matemática dos memoriais de cálculo de custo evitado e à governança de prazos de ciclo PDCA. Este trabalho é o registro genuíno dos princípios,
              equações e escolhas estruturais que tornam o FluxoLean uma ferramenta de transformação industrial duradoura.
            </p>
          </div>

          {/* Rodapé da Capa */}
          <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: 'auto' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              CURITIBA — PARANÁ
            </p>
            <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: 0 }}>
              Edição Oficial de Engenharia Industrial • Versão 4.0 Multi-Tenant
            </p>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 1: SUMÁRIO ANALÍTICO & PRÓLOGO                                 */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 1 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Estrutura da Obra
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              Sumário Executivo dos Módulos & Prólogo
            </h2>
          </div>

          {/* Sumário */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              ÍNDICE SISTEMÁTICO DOS CAPÍTULOS
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { cap: 'Prólogo', title: 'A Gênese do FluxoLean: Da Fragmentação Fabril à Governança Integrada', page: '01' },
                { cap: 'Capítulo 1', title: 'Dashboard Executivo & Engenharia de Lead Time: Filosofia Mieruka e Defesa do Agente', page: '02' },
                { cap: 'Capítulo 2', title: 'Triagem Industrial & Matriz GUT: O Funil Estratégico de Demandas do Chão de Fábrica', page: '03' },
                { cap: 'Capítulo 3', title: 'Metodologia PDCA em 4 Fases: Investigação de Causa-Raiz (6M, Pareto, 5 Porquês) e Yokoten', page: '04' },
                { cap: 'Capítulo 4', title: 'Engenharia Financeira & Memoriais de Cálculo: As 7 Fontes de Custo Evitado e Payback Real', page: '05' },
                { cap: 'Capítulo 5', title: 'Governança Contábil & Auditoria da Controladoria: Homologação Formal e Fé Pública dos Números', page: '06' },
                { cap: 'Capítulo 6', title: 'TPM & Gestão Autônoma 5S: OEE Fabril, 8 Pilares de Nakajima e Cartões de Anomalia', page: '07' },
                { cap: 'Capítulo 7', title: 'Desenvolvimento Humano & Assessment 360°: Monozukuri wa Hitozukuri e Radar de Competências', page: '08' },
                { cap: 'Capítulo 8', title: 'Bibliografia Acadêmica Rigorosa & Referencial Teórico ABNT', page: '09' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentPage(idx === 0 ? 1 : idx + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: idx % 2 === 0 ? '#f8fafc' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#f8fafc' : 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0284c7', minWidth: '75px' }}>{item.cap}</span>
                    <span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{item.title}</span>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 700 }}>Pág. {item.page}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prólogo */}
          <div style={{ borderTop: '2px solid #0f172a', paddingTop: '1.75rem' }}>
            <h3 className="memorial-serif" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Prólogo: A Gênese do FluxoLean
            </h3>

            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1.25rem' }}>
              Ao longo de décadas de aplicação das filosofias da manufatura enxuta herdadas do Sistema Toyota de Produção (TPS), a indústria moderna enfrentou
              uma dicotomia crônica. Por um lado, o entusiasmo com ferramentas visuais — como quadros brancos com post-its, folhas A3 preenchidas manualmente
              e reuniões diárias de 5 minutos; por outro lado, o ceticismo corrosivo das diretorias executivas e dos departamentos financeiros em relação
              aos resultados reais reportados pelas equipes de melhoria contínua.
            </p>

            <div className="academic-quote">
              &quot;O desperdício mais perigoso em uma organização é a ilusão do ganho: projetos celebrados no chão de fábrica cujos números evaporam
              ao serem confrontados com o balanço patrimonial e a DRE contábil.&quot;
            </div>

            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1.25rem' }}>
              O <strong>FluxoLean</strong> foi concebido para erradicar definitivamente essa lacuna estrutural. Ele não é uma mera versão digital de um quadro kanban.
              Trata-se de uma arquitetura industrial holística, onde a identificação do problema no chão de fábrica (Triagem), o rigor de investigação de causas-raiz
              (PDCA em 4 Fases), o cálculo padronizado do retorno financeiro (Memoriais de Custo Evitado) e a validação formal contábil (Controladoria) operam
              como um fluxo contínuo e sem interrupções.
            </p>

            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
              Nos capítulos seguintes, decompomos a lógica matemática, operacional e humana que alicerça cada tela e cada fluxo deste sistema,
              oferecendo aos engenheiros, auditores e gestores o memorial descritivo completo da solução.
            </p>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 2: CAPÍTULO 1 - DASHBOARD & ENGENHARIA DE LEAD TIME             */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 2 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Capítulo 1 • Menu Principal & Governança Visual
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              Dashboard Executivo & Engenharia de Lead Time dos Projetos
            </h2>
          </div>

          <div>
            <span className="concept-pill"><Layers size={12} /> Mieruka (Gestão à Vista)</span>
            <span className="concept-pill"><Clock size={12} /> Lead Time Total de Ciclo</span>
            <span className="concept-pill"><ShieldCheck size={12} /> Defesa do Agente & Gargalos Externos</span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            1.1 O Princípio Mieruka e a Central de Comando Unificada
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            Na tradição da engenharia industrial japonesa, <em>Mieruka</em> significa &quot;fazer com que o estado do processo se revele aos olhos instantaneamente&quot;.
            O Dashboard do FluxoLean transcende a tradicional contabilidade de horas e status binários. Ele atua como o sistema nervoso central da planta fabril,
            consolidando indicadores vitais: total de projetos ativos em pipeline, valor acumulado de custo evitado aprovado, taxa de conversão de ideias Kaizen
            e a distribuição dos projetos pelas 4 fases do ciclo PDCA (Plan, Do, Check, Act).
          </p>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            1.2 Modelagem Matemática do Lead Time de Ciclo PDCA
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            O tempo de resposta de um projeto de melhoria contínua é o determinante da capacidade de adaptação da fábrica.
            No FluxoLean, o Lead Time Total (LT_total) é mensurado a partir da transição da demanda aprovada na Triagem até o momento exato
            da homologação formal da Controladoria. Não consideramos o período de 3 meses de acompanhamento pós-conclusão como parte do Lead Time ativo de ciclo,
            pois se trata de uma fase passiva de verificação e auditoria contábil.
          </p>

          <div className="formula-box">
            <strong>Equação 1.1 — Composição Temporal do Lead Time de Projeto:</strong><br />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0369a1', margin: '0.4rem 0' }}>
              LT_total = t_Plan + t_Do + t_Check + t_Controladoria
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
              Onde cada parcela representa os dias corridos de permanência do projeto na respectiva fase até sua aprovação.
            </span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            1.3 A Defesa do Agente: Isolamento Científico das Dependências Externas
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            Um dos maiores fatores de desmotivação de agentes e líderes de melhoria contínua em indústrias é serem responsabilizados pelo atraso
            de projetos cujas ações dependiam de departamentos terceiros — tais como aquisição de peças por <strong>Compras</strong>, intervenções de parada
            de linha por <strong>Manutenção</strong>, aprovação orçamentária por <strong>Diretoria</strong> ou laudo contábil por <strong>Controladoria</strong>.
          </p>

          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            Para resolver essa injustiça gerencial, o FluxoLean inovou ao implementar a <strong>Defesa do Agente</strong> na Fase DO: cada ação do plano
            carrega compulsoriamente o <em>Setor Corresponsável</em>. O motor analítico do sistema decompõe o Lead Time em duas frações:
          </p>

          <div className="formula-box">
            <strong>Equação 1.2 — Fracionamento de Lead Time e Índice de Dependência Externa:</strong><br />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0369a1', margin: '0.4rem 0' }}>
              LT_total = LT_Agente + Σ LT_Setores_Externos
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7', marginTop: '0.35rem' }}>
              Taxa de Impacto Externo (Φ) = (Σ LT_Externo / LT_total) × 100%
            </div>
          </div>

          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
            Dessa forma, os gráficos executivos de Lead Time evidenciam com transparência cirúrgica quando um projeto estendeu seu prazo devido
            à inércia de setores de suporte, blindando o mérito técnico do agente e gerando dados irrefutáveis para cobrança interdepartamental pela diretoria.
          </p>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 3: CAPÍTULO 2 - TRIAGEM INDUSTRIAL & MATRIZ GUT                */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 3 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Capítulo 2 • Gestão de Demandas & Portfólio
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              Triagem Industrial & Modelagem da Matriz GUT
            </h2>
          </div>

          <div>
            <span className="concept-pill"><Filter size={12} /> Funil de Entrada</span>
            <span className="concept-pill"><BarChart3 size={12} /> Priorização Matemática GUT</span>
            <span className="concept-pill"><CheckCircle2 size={12} /> Segregação Kaizen vs PDCA</span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            2.1 A Democratização do Gemba e o Filtro Anti-Ruído
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            O verdadeiro conhecimento sobre gargalos e perdas reside nas mãos dos operadores, mecânicos e supervisores de primeira linha.
            Contudo, abrir canais de ideias sem um mecanismo de filtragem industrial invariavelmente satura o departamento de engenharia com sugestões
            de conforto individual, reivindicações sem viabilidade ou ruídos operacionais que não justificam a abertura de um projeto formal.
          </p>

          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            O módulo de <strong>Triagem do FluxoLean</strong> atua como um funil estratégico bilíngue: permite que o chão de fábrica submeta propostas
            com linguagem acessível (fotos, descrição de dor e setor), enquanto a coordenação de Lean aplica a avaliação de priorização prévia.
          </p>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            2.2 A Formulação Matemática da Matriz GUT no FluxoLean
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            Para suprimir a subjetividade de preferências pessoais na escolha de quais demandas devem ser atacadas primeiro, o sistema emprega a formulação
            clássica de Kepner-Tregoe adaptada à manufatura pesada:
          </p>

          <div className="formula-box">
            <strong>Equação 2.1 — Índice de Prioridade de Demanda (Score GUT):</strong><br />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0369a1', margin: '0.4rem 0' }}>
              Score GUT = G × U × T &nbsp;&nbsp;(onde G, U, T ∈ [1, 2, 3, 4, 5])
            </div>
            <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>
              Intervalo Operacional: 1 ≤ Score GUT ≤ 125
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1.25rem 0', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.75rem', borderRadius: '4px 0 0 0' }}>Fator</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Conceito Operacional</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Critério de Peso Mínimo (1)</th>
                <th style={{ padding: '0.5rem 0.75rem', borderRadius: '0 4px 0 0' }}>Critério de Peso Máximo (5)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#0284c7' }}>Gravidade (G)</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Magnitude do dano fabril</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Sem impacto em custo ou segurança</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Risco fatal, dano ambiental ou perda &gt; R$ 100k</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#0284c7' }}>Urgência (U)</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Pressão temporal de resposta</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Pode aguardar ciclo trimestral</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Parada iminente de linha ou cliente desabastecido</td>
              </tr>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#0284c7' }}>Tendência (T)</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Propensão de degradação temporal</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Estável, não se agrava com o tempo</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>Degradação exponencial imediata</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            2.3 Decisão Algorítmica de Encaminhamento
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
            Demandas com Score GUT ≥ 64 e com complexidade técnica moderada a alta são promovidas automaticamente à categoria de <strong>Projeto PDCA Estruturado</strong>,
            com alocação de agente responsável e abertura de protocolo com histórico de auditoria. Demandas com pontuação inferior, porém de fácil resolução imediata,
            são despachadas como <em>Ação Rápida Kaizen</em>, garantindo que a fábrica não paralise recursos de engenharia em problemas triviais.
          </p>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 4: CAPÍTULO 3 - METODOLOGIA PDCA EM 4 FASES                    */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 4 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Capítulo 3 • Motor Metodológico Central
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              Metodologia PDCA em 4 Fases: Da Causa-Raiz ao Yokoten
            </h2>
          </div>

          <div>
            <span className="concept-pill"><Award size={12} /> Ciclo de Deming & Shewhart</span>
            <span className="concept-pill"><Layers size={12} /> Ishikawa 6M & Pareto 80/20</span>
            <span className="concept-pill"><CheckCircle2 size={12} /> Padronização & Replicação (Yokoten)</span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            3.1 A Estrutura Rígida em Quatro Portões de Qualidade (Gates)
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            No FluxoLean, o PDCA não é uma lista de tarefas soltas; é um fluxo de engenharia sequencial protegido por travas de qualidade de dados.
            Um projeto não pode avançar para a fase DO sem que as ferramentas de diagnóstico de PLAN tenham sido concluídas com evidências fotográficas e métricas.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', margin: '1.25rem 0' }}>
            {/* PLAN */}
            <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 900, fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  P
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#1e3a8a' }}>PLAN (Planejar & Diagnosticar)</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#1e40af', lineHeight: 1.6 }}>
                <li>Caracterização do problema e métrica de linha de base.</li>
                <li>Diagrama de Ishikawa 6M (Método, Máquina, Material, Mão de Obra, Meio Ambiente, Medição).</li>
                <li>Estratificação de Pareto 80/20 dos principais fatores.</li>
                <li>Investigação profunda dos <strong>5 Porquês</strong> até a causa-raiz física ou organizacional.</li>
              </ul>
            </div>

            {/* DO */}
            <div style={{ backgroundColor: '#fefce8', border: '1.5px solid #fef08a', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ backgroundColor: '#ca8a04', color: '#ffffff', fontWeight: 900, fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  D
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#713f12' }}>DO (Executar & Prototipar)</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#854d0e', lineHeight: 1.6 }}>
                <li>Plano de Ação estruturado sob a matriz <strong>5W2H</strong>.</li>
                <li>Definição explícita de setor corresponsável por tarefa.</li>
                <li>Execução de testes piloto controlados no Gemba.</li>
                <li>Registro de evidências de implementação e custos diretos.</li>
              </ul>
            </div>

            {/* CHECK */}
            <div style={{ backgroundColor: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 900, fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  C
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#4c1d95' }}>CHECK (Verificar & Confrontar)</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#5b21b6', lineHeight: 1.6 }}>
                <li>Comparativo direto entre Situação Inicial vs Situação Final.</li>
                <li>Cálculo de variação percentual de performance (Δ%).</li>
                <li>Confronto dos custos orçados versus custos reais incorridos.</li>
                <li>Apuração das 7 fontes de custo evitado e anexação de planilha.</li>
              </ul>
            </div>

            {/* ACT */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 900, fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  A
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#14532d' }}>ACT (Padronizar & Replicar)</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#166534', lineHeight: 1.6 }}>
                <li>Criação ou revisão de Procedimento Operacional Padrão (POP).</li>
                <li>Plano de treinamento e qualificação dos operadores de turno.</li>
                <li>Mecanismos de contenção definitiva (Poka-Yoke).</li>
                <li>Disseminação horizontal das lições aprendidas (<strong>Yokoten</strong>).</li>
              </ul>
            </div>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            3.2 O Relatório A3 Executivo como Artefato Supremo
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
            Inspirado na célebre metodologia A3 da Toyota, o FluxoLean gera automaticamente uma folha A3 paisagem com toda a síntese do projeto.
            Em apenas um campo de visão, a diretoria tem acesso ao diagnóstico com Ishikawa, plano 5W2H, fotos de antes/depois, payback detalhado
            e o selo de homologação da Controladoria — transformando o relatório em um documento auditável de fé pública corporativa.
          </p>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 5: CAPÍTULO 4 - ENGENHARIA FINANCEIRA & CUSTO EVITADO          */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 5 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Capítulo 4 • Modelagem Matemática & Retorno do Capital
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              Engenharia Financeira & Memoriais de Cálculo de Custo Evitado
            </h2>
          </div>

          <div>
            <span className="concept-pill"><DollarSign size={12} /> Custo Evitado Real vs Estimado</span>
            <span className="concept-pill"><TrendingUp size={12} /> Payback Amortizado & ROI</span>
            <span className="concept-pill"><CheckCircle2 size={12} /> 7 Fontes de Ganhos Industriais</span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            4.1 A Ruptura com os &quot;Ganhos Fictícios&quot;
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            A maior patologia de projetos industriais é a apresentação de economias baseadas em premissas frágeis.
            Afirmar que &quot;economizou-se 15 minutos de um operador&quot; não representa ganho algum se essas horas não foram convertidas em maior produção
            em um gargalo ou na eliminação direta de horas extras remuneradas.
          </p>

          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            O FluxoLean exige que cada centavo reportado seja alocado em uma das <strong>7 Fontes Canônicas de Custo Evitado Lean</strong>,
            acompanhado obrigatoriamente de sua respectiva planilha de memória de cálculo com fórmulas abertas.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '1.25rem 0' }}>
            {[
              {
                num: '1',
                title: 'Mão de Obra Direta (MOD)',
                eq: 'ΔCusto MOD = (Horas_Antes - Horas_Depois) × Custo_Horário_Com_Encargos',
                desc: 'Apenas aplicável quando as horas liberadas resultam em realocação comprovada ou eliminação de turnos extras.',
              },
              {
                num: '2',
                title: 'Perda de Material / Refugo Fabril',
                eq: 'ΔRefugo = (Qtd_Sucata_Antes - Qtd_Sucata_Depois) × Custo_Médio_MP_Unitária',
                desc: 'Economia física direta de matéria-prima que deixou de ser descartada ou desvalorizada como sucata.',
              },
              {
                num: '3',
                title: 'Capacidade Adicional em Gargalo (Throughput)',
                eq: 'ΔGanho Throughput = ΔPeças_Produzidas_no_Gargalo × Margem_de_Contribuição_Unitária',
                desc: 'Aumento de faturamento viabilizado pela quebra do gargalo segundo a Teoria das Restrições (TOC).',
              },
              {
                num: '4',
                title: 'Eficiência Energética & Utilidades',
                eq: 'ΔEnergia = (Consumo_kWh_Antes - Consumo_kWh_Depois) × Tarifa_Média_kWh',
                desc: 'Redução mensurada no consumo de eletricidade, vapor, ar comprimido ou gás combustível industrial.',
              },
              {
                num: '5',
                title: 'Consumíveis & Insumos Operacionais',
                eq: 'ΔInsumos = ΔQuantidade_Consumida × Custo_Unitário_de_Aquisição',
                desc: 'Menor consumo de ferramentas de corte, óleos lubrificantes, pallets descartáveis ou filmes de embalagem.',
              },
              {
                num: '6',
                title: 'Horas Extras Industriais Eliminadas',
                eq: 'ΔHE = Σ Horas_Extras_Cortadas × [Salário_Hora × (1 + Adicional) × (1 + Encargos)]',
                desc: 'Impacto direto e imediato no fluxo de caixa pela redução da folha de pagamento de finais de semana.',
              },
              {
                num: '7',
                title: 'Retrabalho Interno & Não-Conformidades',
                eq: 'ΔRetrabalho = Lotes_Reprocessados_Evitados × (Custo_Desmontagem + Custo_Reoperação)',
                desc: 'Eliminação dos custos ocultos de reprocessamento, reinspeção e perdas de embalagem associadas.',
              },
            ].map((f, i) => (
              <div key={i} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                    {f.num}. {f.title}
                  </strong>
                  <code style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#0369a1' }}>
                    {f.eq}
                  </code>
                </div>
                <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            4.2 Modelagem de Payback Amortizado e ROI Líquido
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            O FluxoLean não aceita indicadores de retorno bruto. Todo projeto que demanda investimentos (seja em aquisição de equipamentos,
            serviços de terceiros ou custos internos) tem seus desembolsos subtraídos para obtenção da Economia Líquida:
          </p>

          <div className="formula-box">
            <strong>Equação 4.1 — ROI Líquido e Payback Amortizado:</strong><br />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', margin: '0.4rem 0' }}>
              Economia Líquida (R$) = Custo Evitado Total - Custos Totais de Implementação
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', margin: '0.4rem 0' }}>
              ROI (%) = (Economia Líquida / Custos Totais de Implementação) × 100%
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', margin: '0.4rem 0' }}>
              Payback (Meses) = Custos Totais de Implementação / Economia Mensal Média Auditada
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 6: CAPÍTULO 5 - GOVERNANÇA CONTÁBIL & CONTROLADORIA            */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 6 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Capítulo 5 • Auditoria & Fé Pública dos Resultados
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              Governança Contábil & Homologação pela Controladoria
            </h2>
          </div>

          <div>
            <span className="concept-pill"><ShieldCheck size={12} /> Fé Pública Contábil</span>
            <span className="concept-pill"><GitPullRequest size={12} /> Token Escopado de Auditoria</span>
            <span className="concept-pill"><Clock size={12} /> Ciclo dos 3 Meses de Validação</span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            5.1 A Ponte entre o Engenheiro de Processos e o Auditor Financeiro
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            Historicamente, a engenharia de processos e a controladoria operavam em universos paralelos.
            O engenheiro apresentava números entusiastas de melhoria; o auditor contábil, não encontrando reflexo imediato nas contas contábeis,
            desconsiderava os relatórios nos comitês de diretoria.
          </p>

          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            O FluxoLean resolveu esse atrito através de um <strong>Portal de Auditoria Dedicado da Controladoria</strong>.
            Quando um projeto é concluído na fase CHECK com ganhos financeiros, o sistema despacha automaticamente uma notificação por e-mail
            com link contendo token escopado de segurança (sem exigir criação de contas desnecessárias para o auditor externo).
          </p>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            5.2 O Triplo Poder do Auditor e a Contra-Memória de Cálculo
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            Ao acessar o portal, o auditor da Controladoria tem acesso irrestrito à memória de cálculo anexada pelo agente e possui três caminhos institucionais:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '1.25rem 0' }}>
            <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: '#16a34a', marginBottom: '0.5rem' }}>✓</div>
              <strong style={{ fontSize: '0.85rem', color: '#14532d', display: 'block', marginBottom: '0.25rem' }}>Homologação Integral</strong>
              <p style={{ fontSize: '0.75rem', color: '#166534', margin: 0 }}>
                O auditor valida as premissas e chancela o valor integral com carimbo de fé pública no Relatório A3.
              </p>
            </div>

            <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: '#2563eb', marginBottom: '0.5rem' }}>✎</div>
              <strong style={{ fontSize: '0.85rem', color: '#1e3a8a', display: 'block', marginBottom: '0.25rem' }}>Ajuste com Parecer</strong>
              <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: 0 }}>
                O auditor corrige valores por fonte de ganho, anexa uma contra-memória e emite parecer técnico formal.
              </p>
            </div>

            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '0.5rem' }}>✕</div>
              <strong style={{ fontSize: '0.85rem', color: '#7f1d1d', display: 'block', marginBottom: '0.25rem' }}>Rejeição Justificada</strong>
              <p style={{ fontSize: '0.75rem', color: '#991b1b', margin: 0 }}>
                O projeto é reprovado por inconsistência metodológica, retornando ao agente para revisão mandatória.
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            5.3 A Regra de Ouro dos 3 Meses de Acompanhamento
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
            Para garantir que a melhoria não sofra efeito ricochete após a entrega do projeto, o FluxoLean institui a <strong>Fase de Estabilização</strong>:
            durante os 3 meses subsequentes à homologação contábil, o agente deve registrar mensalmente os dados reais de produção para comprovar que o novo padrão
            se sustentou no chão de fábrica, completando o ciclo com excelência e auditoria impecável.
          </p>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 7: CAPÍTULO 6 - TPM & GESTÃO AUTÔNOMA 5S                       */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 7 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Capítulo 6 • Confiabilidade Operacional & Manutenção
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              TPM, Gestão Autônoma 5S e Maximização do OEE
            </h2>
          </div>

          <div>
            <span className="concept-pill"><Cpu size={12} /> 8 Pilares de Nakajima</span>
            <span className="concept-pill"><BarChart3 size={12} /> OEE Fabril (D × P × Q)</span>
            <span className="concept-pill"><CheckCircle2 size={12} /> Cartões de Anomalia 5S</span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            6.1 A Filosofia do Operador Mantenedor
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            A Manutenção Produtiva Total (TPM), sistematizada pelo Japan Institute of Plant Maintenance (JIPM), preconiza que o equipamento
            não pertence ao mecânico, mas ao operador que com ele convive durante todo o seu turno.
            O FluxoLean materializa esse conceito transformando o celular do operador em uma ferramenta de detecção precoce de microfalhas.
          </p>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            6.2 O Ciclo de Cartões de Anomalia Integrado ao Kanban
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            Na detecção de qualquer anomalia física — vazamento, ruído anormal, folga mecânica ou desorganização —, o operador abre um <strong>Cartão 5S</strong>:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', margin: '1.25rem 0' }}>
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #f87171', borderRadius: '8px', padding: '1rem' }}>
              <strong style={{ fontSize: '0.9rem', color: '#991b1b', display: 'block', marginBottom: '0.35rem' }}>
                🔴 Etiqueta Vermelha (Manutenção Especializada)
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
                Anomalias que exigem desenergização (LOTO), desmontagem mecânica complexa ou intervenção de eletrotécnicos habilitados.
                Dispara chamado prioritário para a equipe de Manutenção Corretiva Planejada.
              </p>
            </div>

            <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #60a5fa', borderRadius: '8px', padding: '1rem' }}>
              <strong style={{ fontSize: '0.9rem', color: '#1e40af', display: 'block', marginBottom: '0.35rem' }}>
                🔵 Etiqueta Azul (Manutenção Autônoma 5S)
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#1e3a8a', margin: 0, lineHeight: 1.5 }}>
                Ações de reaperto, limpeza de sensores, organização de ferramental e lubrificação básica executadas pelo próprio operador
                sob supervisão do líder de produção durante os primeiros 10 minutos de turno.
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            6.3 Modelagem Matemática do OEE e Combate às 6 Grandes Perdas
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            A eficiência global dos ativos industriais é regida pela equação canônica do OEE (Overall Equipment Effectiveness):
          </p>

          <div className="formula-box">
            <strong>Equação 6.1 — OEE Fabril e Fatores Constituintes:</strong><br />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0369a1', margin: '0.4rem 0' }}>
              OEE = Disponibilidade (D) × Desempenho (P) × Qualidade (Q)
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.4rem', lineHeight: 1.6 }}>
              D = Tempo Operacional / Tempo de Carga &nbsp;|&nbsp; P = Produção Real / Capacidade Teórica &nbsp;|&nbsp; Q = Peças Conformes / Total Produzido
            </div>
          </div>

          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
            Ao conectar as anomalias do chão de fábrica diretamente aos projetos PDCA, o FluxoLean ataca cirurgicamente as <strong>6 Grandes Perdas do TPM</strong>:
            quebras repentinas, perdas em setup/ajustes, pequenas paradas/ociosidade, velocidade reduzida, defeitos no processo e perdas na inicialização de linha.
          </p>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 8: CAPÍTULO 7 - DESENVOLVIMENTO HUMANO & ASSESSMENT            */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 8 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Capítulo 7 • Cultura, Competências & Pessoas
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              Desenvolvimento Humano: Monozukuri wa Hitozukuri
            </h2>
          </div>

          <div>
            <span className="concept-pill"><GraduationCap size={12} /> Academia Lean</span>
            <span className="concept-pill"><Award size={12} /> Certificações Belt</span>
            <span className="concept-pill"><TrendingUp size={12} /> Radar de Maturidade 360°</span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            7.1 O Pilar Máximo: Desenvolver Pessoas para Desenvolver Processos
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            Uma das maiores lições da cultura industrial japonesa sintetiza-se no aforismo <em>&quot;Monozukuri wa Hitozukuri&quot;</em> —
            antes de fabricar produtos de classe mundial, devemos formar pessoas de classe mundial.
            Qualquer sistema digital desprovido de uma trilha de elevação do ser humano torna-se uma casca burocrática inútil.
          </p>

          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            O FluxoLean integra em sua espinha dorsal o módulo da <strong>Academia Lean</strong> e o <strong>Assessment de Competências 360°</strong>,
            garantindo que o agente e os operadores sejam formalmente capacitados, avaliados e reconhecidos à medida que entregam projetos bem-sucedidos.
          </p>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            7.2 A Trilha de Belts e Gamificação de Mérito Industrial
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
            O progresso do profissional no sistema segue critérios objetivos de aprovação teórica e entrega prática de retorno financeiro:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e2e8f0', border: '2px solid #94a3b8', margin: '0 auto 0.5rem auto' }} />
              <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>White Belt</strong>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Consciência de desperdícios e abertura de Kaizens 5S no chão de fábrica.</span>
            </div>

            <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#facc15', margin: '0 auto 0.5rem auto' }} />
              <strong style={{ fontSize: '0.8rem', color: '#854d0e', display: 'block' }}>Yellow Belt</strong>
              <span style={{ fontSize: '0.7rem', color: '#713f12' }}>Domínio de Ishikawa, 5W2H e participação ativa em planos de ação.</span>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', margin: '0 auto 0.5rem auto' }} />
              <strong style={{ fontSize: '0.8rem', color: '#166534', display: 'block' }}>Green Belt</strong>
              <span style={{ fontSize: '0.7rem', color: '#14532d' }}>Liderança de projetos PDCA complexos e cálculo de ROI auditado.</span>
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#000000', border: '2px solid #38bdf8', margin: '0 auto 0.5rem auto' }} />
              <strong style={{ fontSize: '0.8rem', color: '#38bdf8', display: 'block' }}>Black Belt</strong>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mentoria de agentes, Yokoten corporativo e governança estratégica.</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            7.3 O Radar de Maturidade Industrial e Avaliação 360°
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
            Complementando as certificações de belt, o <strong>Radar de Maturidade</strong> mensura 5 eixos fundamentais:
            1. Rigor Metodológico na Causa-Raiz; 2. Cumprimento de Prazos e Lead Time; 3. Precisão dos Memoriais Contábeis;
            4. Presença e Postura de Liderança no Gemba; e 5. Replicação de Boas Práticas (Yokoten).
            Essa matriz orienta os planos individuais de desenvolvimento (PDI), transformando o sistema em uma fábrica de líderes industriais.
          </p>
        </section>

        {/* ===================================================================== */}
        {/* PÁGINA 9: CAPÍTULO 8 - BIBLIOGRAFIA ACADÊMICA ABNT                     */}
        {/* ===================================================================== */}
        <section className={`memorial-section ${currentPage === 9 ? 'active-screen-page' : ''}`}>
          <div className="academic-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Capítulo 8 • Fundamentação Teórica
            </span>
            <h2 className="memorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
              Bibliografia Acadêmica & Referencial Teórico Rigoroso (ABNT)
            </h2>
          </div>

          <div>
            <span className="concept-pill"><Library size={12} /> Referencial Clássico Lean</span>
            <span className="concept-pill"><Award size={12} /> Padrão ABNT NBR 6023</span>
          </div>

          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginTop: '1.25rem', marginBottom: '1.5rem' }}>
            A concepção metodológica e arquitetural do <strong>FluxoLean</strong> não é fruto de especulação empírica isolada, mas sim da fusão direta
            entre os ensinamentos clássicos da engenharia de produção japonesa e os modernos preceitos da governança corporativa e contábil.
            Abaixo estão registradas as obras fundamentais consultadas e homenageadas nesta solução:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                ref: 'OHNO, Taiichi. Toyota Production System: Beyond Large-Scale Production. Portland: Productivity Press, 1988.',
                nota: 'Obra fundamental que introduz a eliminação dos 7 grandes desperdícios (Muda), a produção Just-in-Time e o conceito de autonomia com toque humano (Jidoka).',
              },
              {
                ref: 'SHINGO, Shigeo. A Study of the Toyota Production System from an Industrial Engineering Viewpoint. Tokyo: Japan Management Association, 1981.',
                nota: 'Balanço magistral entre teoria de engenharia de tempos/métodos, troca rápida de ferramentas (SMED) e dispositivos à prova de falhas (Poka-Yoke).',
              },
              {
                ref: 'WOMACK, James P.; JONES, Daniel T. Lean Thinking: Banish Waste and Create Wealth in Your Corporation. New York: Free Press, 2003.',
                nota: 'Sistematização dos 5 princípios Lean: Valor, Fluxo de Valor, Fluxo Contínuo, Puxar a Produção e Perfeição.',
              },
              {
                ref: 'LIKER, Jeffrey K. O Modelo Toyota: 14 Princípios de Gestão do Maior Fabricante do Mundo. Porto Alegre: Bookman, 2005.',
                nota: 'Apresenta a arquitetura cultural e filosófica que sustenta a melhoria contínua, conectando liderança Gemba e desenvolvimento de parceiros.',
              },
              {
                ref: 'SHOOK, John. Gerenciando para Aprender: O Uso do Processo de Gestão A3 para Resolver Problemas, Promover Alinhamento e Desenvolver Pessoas. São Paulo: Lean Institute Brasil, 2008.',
                nota: 'Referência direta para o motor PDCA em folha única A3 implementado como artefato central no FluxoLean.',
              },
              {
                ref: 'ROTHER, Mike; SHOOK, John. Aprendendo a Enxergar: Mapeando o Fluxo de Valor para Agregar Valor e Eliminar o Desperdício. São Paulo: Lean Institute Brasil, 2003.',
                nota: 'Inspiração analítica para o cálculo de Lead Time Total e a segregação de tempos de agregação e não-agregação de valor.',
              },
              {
                ref: 'IMAI, Masaaki. Kaizen: A Estratégia para o Sucesso Competitivo. São Paulo: IMAM, 1994.',
                nota: 'Trata da mentalidade do Kaizen diário no chão de fábrica e da valorização contínua das pequenas contribuições do operador.',
              },
              {
                ref: 'NAKAJIMA, Seiichi. Introduction to TPM: Total Productive Maintenance. Cambridge: Productivity Press, 1988.',
                nota: 'Balanço seminal que define os 8 pilares do TPM, a Manutenção Autônoma e a modelagem matemática do OEE implementada no sistema.',
              },
              {
                ref: 'GOLDRATT, Eliyahu M.; COX, Jeff. A Meta: Um Processo de Aprimoramento Contínuo. São Paulo: Nobel, 2002.',
                nota: 'Inspiração para o módulo de Throughput e a identificação de restrições de fluxo fabril abordadas no cálculo de Custo Evitado.',
              },
              {
                ref: 'MONDEN, Yasuhiro. Toyota Production System: An Integrated Approach to Just-In-Time. 4th ed. Boca Raton: CRC Press, 2011.',
                nota: 'Tratado completo sobre contabilidade de gestão Lean, amortização de investimentos em melhoria e sincronismo operacional.',
              },
            ].map((item, idx) => (
              <div key={idx} style={{ backgroundColor: '#f8fafc', borderLeft: '3px solid #0f172a', padding: '0.85rem 1.15rem', borderRadius: '0 6px 6px 0' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0', lineHeight: 1.5 }}>
                  {item.ref}
                </p>
                <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>
                  {item.nota}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '1.75rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.25rem 0' }}>
              FIM DO MEMORIAL DESCRITIVO & CONCEPÇÃO INTELECTUAL
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              FluxoLean 4.0 • Idealizado, Arquitetado e Documentado por <strong>Mauricio Grigol</strong>
            </p>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* SCREEN PAGINATION CONTROLLER (BOTTOM NAVIGATION BAR)                     */}
      {/* ========================================================================= */}
      <nav
        aria-label="Paginação do memorial"
        className="memorial-screen-pagination no-print"
        style={{
          position: 'sticky',
          bottom: '1.25rem',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '0.65rem 1rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
          maxWidth: '960px',
          width: 'calc(100% - 2rem)',
          justifyContent: 'space-between',
          zIndex: 50,
        }}
      >
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: currentPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.12)',
            color: currentPage === 0 ? '#475569' : '#ffffff',
            border: 'none',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronLeft size={16} /> Anterior
        </button>

        {/* Numeric Page Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', padding: '0 0.25rem' }}>
          <button
            type="button"
            onClick={() => setCurrentPage(0)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78125rem',
              fontWeight: 800,
              backgroundColor: currentPage === 0 ? '#0ea5e9' : 'rgba(255, 255, 255, 0.06)',
              color: currentPage === 0 ? '#ffffff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Capa
          </button>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pageNum) => {
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  backgroundColor: isActive ? '#0ea5e9' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                title={pageTitles[pageNum]}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage === totalPages - 1}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: currentPage === totalPages - 1 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.12)',
            color: currentPage === totalPages - 1 ? '#475569' : '#ffffff',
            border: 'none',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Próximo <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
