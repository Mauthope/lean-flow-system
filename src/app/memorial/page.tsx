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
  TrendingUp,
  Sliders,
  Calculator,
  Kanban,
  MessageSquare,
  Lightbulb,
  FileSpreadsheet,
  CheckSquare,
  Search,
  ListOrdered,
  FileText,
  User,
  Activity,
  Zap,
  AlertTriangle,
  FileCheck,
  Shield,
  HelpCircle,
  ExternalLink,
  Code,
  HardHat,
  BookmarkCheck,
} from 'lucide-react';

export default function MemorialDescritivoPage() {
  const router = useRouter();
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const chapters = [
    { id: 0, title: 'Capa Nobre & Apresentação Técnica do Autor', short: 'Capa & Autor', icon: Award },
    { id: 1, title: 'Prólogo: A Gênese do FluxoLean e a Visão Sistêmica', short: 'Prólogo & Visão', icon: BookOpen },
    { id: 2, title: 'Capítulo 1: Dashboard Executivo & Engenharia de Lead Time', short: '1. Dashboard & Lead Time', icon: BarChart3 },
    { id: 3, title: 'Capítulo 2: Triagem Industrial & Matriz GUT', short: '2. Triagem & Matriz GUT', icon: Filter },
    { id: 4, title: 'Capítulo 3: Projetos PDCA em 4 Fases & Relatório A3 Executivo', short: '3. Projetos PDCA & A3', icon: Layers },
    { id: 5, title: 'Capítulo 4: Engenharia Financeira & As 7 Fontes de Custo Evitado', short: '4. Engenharia Financeira', icon: DollarSign },
    { id: 6, title: 'Capítulo 5: Governança Contábil & Auditoria da Controladoria', short: '5. Controladoria & Auditoria', icon: ShieldCheck },
    { id: 7, title: 'Capítulo 6: TPM & Gestão Autônoma 5S (OEE e Anomalias)', short: '6. TPM, 5S & OEE', icon: Cpu },
    { id: 8, title: 'Capítulo 7: Desenvolvimento Humano, Academia Lean & Assessment 360°', short: '7. Pessoas & Academia Lean', icon: GraduationCap },
    { id: 9, title: 'Capítulo 8: Kanban Operacional & Gestão de Fluxo de Projetos', short: '8. Kanban & Fluxo', icon: Kanban },
    { id: 10, title: 'Capítulo 9: Canal Kaizen & Participação Ativa da Base Fabril', short: '9. Canal Kaizen', icon: Lightbulb },
    { id: 11, title: 'Capítulo 10: Bibliografia Acadêmica Rigorosa & Referencial Teórico ABNT', short: '10. Bibliografia ABNT', icon: Library },
  ];

  return (
    <div className="memorial-app-container">
      {/* ========================================================================= */}
      {/* ESTILOS CSS SCREEN E PRINT OTIMIZADOS                                     */}
      {/* ========================================================================= */}
      <style jsx global>{`
        /* Tipografia de Alta Legibilidade e Conforto Visual */
        .memorial-app-container {
          background-color: #060a13;
          min-height: 100vh;
          color: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .memorial-app-container h1,
        .memorial-app-container h2,
        .memorial-app-container h3,
        .memorial-app-container h4 {
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif !important;
          color: #0f172a !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
          line-height: 1.3 !important;
        }

        .memorial-app-container p,
        .memorial-app-container li {
          font-size: 0.95rem;
          color: #1e293b !important;
          line-height: 1.75;
          text-align: left !important;
          margin-bottom: 1.15rem;
          word-break: normal;
        }

        .memorial-app-container strong,
        .memorial-app-container b {
          color: #0f172a !important;
          font-weight: 800 !important;
        }

        /* CARDS TEMÁTICOS COLORIDOS COM ALTO CONTRASTE */
        .colored-card {
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          margin: 1.25rem 0;
          box-sizing: border-box;
        }

        .card-blue {
          background-color: #f0f9ff;
          border: 1.5px solid #bae6fd;
          border-left: 5px solid #0284c7;
        }
        .card-green {
          background-color: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-left: 5px solid #16a34a;
        }
        .card-amber {
          background-color: #fffbeb;
          border: 1.5px solid #fde68a;
          border-left: 5px solid #d97706;
        }
        .card-purple {
          background-color: #faf5ff;
          border: 1.5px solid #e9d5ff;
          border-left: 5px solid #9333ea;
        }
        .card-slate {
          background-color: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-left: 5px solid #475569;
        }

        /* BOX PEDAGÓGICO DE APRENDIZADO LEAN */
        .lean-pedagogy-box {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1.5px solid #cbd5e1;
          border-left: 6px solid #0f172a;
          border-radius: 12px;
          padding: 1.35rem 1.6rem;
          margin: 1.5rem 0;
          box-sizing: border-box;
        }

        .lean-pedagogy-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* APRESENTAÇÃO VISUAL DE FÓRMULAS NO ESTILO DO FLUXOLEAN */
        .lean-formula-container {
          background-color: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 1.35rem 1.5rem;
          margin: 1.5rem 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .formula-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.65rem;
          margin-bottom: 0.85rem;
        }

        .formula-pills-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0.85rem 0;
        }

        .formula-pill {
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          font-weight: 700;
          font-size: 0.825rem;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .formula-operator {
          font-weight: 900;
          font-size: 1.1rem;
          color: #0284c7;
          padding: 0 0.2rem;
        }

        .formula-result-pill {
          background-color: #ecfdf5;
          border: 1.5px solid #86efac;
          color: #15803d;
          font-weight: 800;
          font-size: 0.875rem;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
        }

        .formula-breakdown-box {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          font-size: 0.825rem;
          color: #334155;
          margin-top: 0.75rem;
          border: 1px solid #e2e8f0;
          line-height: 1.6;
        }

        .formula-example-box {
          background-color: #eff6ff;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          font-size: 0.825rem;
          color: #1e40af;
          margin-top: 0.65rem;
          border: 1px solid #bfdbfe;
          line-height: 1.6;
        }

        /* TABELAS TÉCNICAS */
        .memorial-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 0.85rem;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .memorial-table th {
          background-color: #0f172a;
          color: #ffffff !important;
          padding: 0.65rem 0.85rem;
          font-weight: 700;
          text-align: left;
        }

        .memorial-table td {
          padding: 0.65rem 0.85rem;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
          color: #1e293b !important;
          line-height: 1.5;
        }

        .memorial-table tr:nth-child(even) td {
          background-color: #f8fafc;
        }

        /* ESTRUTURA DE TELA NORMAL */
        @media screen {
          .screen-header-bar {
            position: sticky;
            top: 0;
            z-index: 100;
            background-color: #090e17;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.75rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .screen-main-layout {
            display: flex;
            max-width: 1560px;
            margin: 0 auto;
            min-height: calc(100vh - 60px);
          }

          .screen-sidebar {
            width: 320px;
            flex-shrink: 0;
            background-color: #090e17;
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            padding: 1.5rem 1rem;
            position: sticky;
            top: 60px;
            height: calc(100vh - 60px);
            overflow-y: auto;
            box-sizing: border-box;
          }

          .screen-content-area {
            flex: 1;
            padding: 2.5rem 3.5rem 6rem 3.5rem;
            background-color: #04070d;
            overflow-y: auto;
          }

          .screen-paper-sheet {
            background-color: #ffffff;
            border-radius: 14px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            padding: 3.5rem 4rem;
            box-sizing: border-box;
            color: #0f172a;
            max-width: 1080px;
            margin: 0 auto;
            min-height: 1050px;
          }

          .monograph-chapter-section {
            display: none;
          }
          .monograph-chapter-section.active-chapter {
            display: block;
            animation: fadeInChap 0.15s ease-out;
          }

          @keyframes fadeInChap {
            from {
              opacity: 0;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        /* ========================================================================= */
        /* ESTRUTURA DE IMPRESSÃO A4 LIMPA, BRANCA, SEM BORDA ESCURA E SEM TEXTO SUMIDO */
        /* ========================================================================= */
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 12mm 12mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          html,
          body,
          .memorial-app-container,
          .screen-main-layout,
          .screen-content-area,
          .screen-paper-sheet {
            background: #ffffff !important;
            background-color: #ffffff !important;
            background-image: none !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            color: #0f172a !important;
            font-size: 10pt !important;
            line-height: 1.55 !important;
          }

          /* GARANTE QUE NENHUM TEXTO, EM NENHUMA HIPÓTESE, SEJA BRANCO OU APAGADO */
          p, span, li, td, em, i {
            color: #1e293b !important;
          }
          strong, b {
            color: #000000 !important;
            font-weight: 800 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #000000 !important;
            font-weight: 800 !important;
          }

          .no-print,
          .screen-header-bar,
          .screen-sidebar,
          .screen-chapter-nav {
            display: none !important;
          }

          .monograph-chapter-section {
            display: block !important;
            page-break-before: always !important;
            break-before: page !important;
            padding-top: 6mm !important;
            padding-bottom: 6mm !important;
          }

          .monograph-chapter-section:first-of-type {
            page-break-before: avoid !important;
            break-before: avoid !important;
            padding-top: 0 !important;
          }

          .colored-card,
          .lean-pedagogy-box,
          .lean-formula-container,
          .memorial-table,
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .colored-card {
            border: 1px solid #cbd5e1 !important;
            margin: 8mm 0 !important;
          }
          .card-blue {
            background-color: #f8fafc !important;
            border-left: 4px solid #0284c7 !important;
          }
          .card-green {
            background-color: #f8fafc !important;
            border-left: 4px solid #16a34a !important;
          }
          .card-amber {
            background-color: #f8fafc !important;
            border-left: 4px solid #d97706 !important;
          }
          .card-purple {
            background-color: #f8fafc !important;
            border-left: 4px solid #9333ea !important;
          }

          .lean-formula-container {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            margin: 6mm 0 !important;
            padding: 4mm 5mm !important;
          }
          .formula-pill {
            background-color: #f1f5f9 !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
          }
          .formula-result-pill {
            background-color: #f0fdf4 !important;
            border: 1.5px solid #16a34a !important;
            color: #15803d !important;
          }
          .formula-operator {
            color: #0284c7 !important;
          }
          .formula-breakdown-box,
          .formula-example-box {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: #1e293b !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* HEADER SUPERIOR (APENAS NA TELA)                                          */}
      {/* ========================================================================= */}
      <header className="screen-header-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <ArrowLeft size={16} /> Voltar ao FluxoLean
          </button>

          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.15)', height: '24px' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                FluxoLean PRO
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(14, 165, 233, 0.25)',
                  color: '#38bdf8',
                  border: '1px solid rgba(14, 165, 233, 0.4)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                Trabalho Intelectual & Concepção Lean
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>
              Memorial Metodológico • Arquitetura de Processos, Fórmulas & Filosofia Operacional
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.825rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
          >
            <Printer size={16} /> Imprimir Obra Completa (A4)
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* LAYOUT PRINCIPAL (SIDEBAR + CONTEÚDO)                                      */}
      {/* ========================================================================= */}
      <div className="screen-main-layout">
        {/* SIDEBAR COM ÍNDICE / SUMÁRIO (APENAS NA TELA) */}
        <aside className="screen-sidebar no-print">
          <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Sumário da Obra
            </span>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>
              Navegação por Capítulos
            </h2>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {chapters.map((chap) => {
              const Icon = chap.icon;
              const isActive = activeChapter === chap.id;
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => {
                    setActiveChapter(chap.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#e2e8f0';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <Icon size={16} color={isActive ? '#ffffff' : '#38bdf8'} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chap.short}
                  </span>
                </button>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Award size={16} color="#38bdf8" />
              <strong style={{ fontSize: '0.78125rem', color: '#f8fafc' }}>
                Autor & Arquiteto
              </strong>
            </div>
            <p style={{ fontSize: '0.725rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
              <strong>Mauricio Prestes Grigol</strong><br />
              Engenheiro Bioenergético<br />
              Pós-Graduado em Seg. do Trabalho<br />
              Xaxim — Santa Catarina
            </p>
          </div>
        </aside>

        {/* ÁREA DE LEITURA (FOLHA DE PAPEL ELEGANTE) */}
        <main className="screen-content-area">
          <div className="screen-paper-sheet">
            {/* ================================================================= */}
            {/* CAPÍTULO 0: CAPA & APRESENTAÇÃO TÉCNICA DO AUTOR                  */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 0 ? 'active-chapter' : ''}`}>
              {/* Topo da Capa */}
              <div style={{ textAlign: 'center', paddingBottom: '2.5rem', borderBottom: '3px double #0f172a', marginBottom: '2.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', backgroundColor: '#f1f5f9', borderRadius: '9999px', marginBottom: '1.25rem' }}>
                  <Award size={16} color="#0284c7" />
                  <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Memorial Metodológico & Tratado de Engenharia de Processos
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: '2.4rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.15,
                    maxWidth: '840px',
                    margin: '0 auto 0.75rem auto',
                    letterSpacing: '-0.03em',
                  }}
                >
                  FLUXOLEAN 4.0: ARQUITETURA DE SINCRONISMO OPERACIONAL, GOVERNANÇA PDCA E ENGENHARIA DE CUSTOS EVITADOS
                </h1>

                <div style={{ width: '80px', height: '4px', backgroundColor: '#0ea5e9', margin: '1.25rem auto' }} />

                <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '760px', margin: '0 auto', lineHeight: 1.6, fontStyle: 'italic' }}>
                  Uma Abordagem Estruturada para a Eliminação Sistemática de Desperdícios, Conexão do Chão de Fábrica à Controladoria e Validação Contábil do Retorno sobre o Capital Lean
                </p>
              </div>

              {/* QUADRO 1 SEPARADO: FICHA TÉCNICA E ESCOPO DA PLATAFORMA */}
              <div className="colored-card card-blue" style={{ margin: '1.75rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <Building2 size={20} color="#0284c7" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    Quadro I • Escopo Conceitual & Arquitetura da Solução
                  </h3>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7, marginBottom: '1rem' }}>
                  O <strong>FluxoLean 4.0</strong> foi concebido para unificar a gestão de rotina dos operadores de linha à comprovação
                  matemática de retorno financeiro perante a alta administração. A plataforma atua em 4 frentes estruturais:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <strong style={{ color: '#0369a1', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>
                      ⚙️ Engenharia de Lead Time & Defesa do Agente
                    </strong>
                    <span style={{ fontSize: '0.78125rem', color: '#475569' }}>
                      Segregação analítica entre o tempo do agente e os gargalos externos de compras, manutenção e controladoria.
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <strong style={{ color: '#0369a1', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>
                      📊 Governança PDCA com Relatório A3
                    </strong>
                    <span style={{ fontSize: '0.78125rem', color: '#475569' }}>
                      Portões de qualidade (Gates) com Ishikawa 6M, 5 Porquês, Pareto 80/20 e geração de folha A3 paisagem auditável.
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <strong style={{ color: '#0369a1', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>
                      💰 7 Fontes Canônicas de Custo Evitado
                    </strong>
                    <span style={{ fontSize: '0.78125rem', color: '#475569' }}>
                      Memoriais de cálculo sem ganhos fictícios: MOD, Refugo, Throughput, Energia, Consumíveis, Horas Extras e Retrabalho.
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <strong style={{ color: '#0369a1', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>
                      🏛️ Auditoria com Token de Fé Pública
                    </strong>
                    <span style={{ fontSize: '0.78125rem', color: '#475569' }}>
                      Portal seguro da Controladoria com validação contábil formal e ciclo mandatório de 3 meses de acompanhamento.
                    </span>
                  </div>
                </div>
              </div>

              {/* QUADRO 2 SEPARADO: APRESENTAÇÃO TÉCNICA ESTRUTURADA DO AUTOR */}
              <div className="colored-card card-slate" style={{ margin: '1.75rem 0', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.35rem',
                        flexShrink: 0,
                      }}
                    >
                      MG
                    </div>
                    <div>
                      <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Quadro II • Credenciais Técnicas & Autoria do Projeto
                      </span>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
                        Mauricio Prestes Grigol
                      </h2>
                      <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0, fontWeight: 600 }}>
                        Engenheiro Bioenergético • Pós-Graduado em Engenharia de Segurança do Trabalho • Arquiteto Full Stack & IA
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                      📍 Xaxim — Santa Catarina
                    </span>
                    <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      Brasil
                    </span>
                  </div>
                </div>

                {/* BADGES DE FORMAÇÃO E ESPECIALIDADE */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.15rem' }}>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    🎓 Bacharel em Engenharia Bioenergética
                  </span>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    🦺 Especialização em Eng. de Segurança do Trabalho
                  </span>
                  <span style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>
                    💻 Desenvolvedor Full-Stack Sênior & IA Aplicada
                  </span>
                  <span style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>
                    ⚙️ Gestão de Processos, Cronoanálise & VSM
                  </span>
                </div>

                {/* MATRIZ DE COMPETÊNCIAS TÉCNICAS E PORTFÓLIO */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                      <HardHat size={15} color="#d97706" /> Engenharia & Processos
                    </strong>
                    <p style={{ fontSize: '0.775rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Domínio prático em Lean Manufacturing, Mapeamento de Fluxo de Valor (VSM), cronoanálise de ciclos, balanceamento de linhas, OEE, SMED e modelagem matemática de custos evitados.
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                      <ShieldCheck size={15} color="#16a34a" /> Segurança & Ergonomia
                    </strong>
                    <p style={{ fontSize: '0.775rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Aplicação das Normas Regulamentadoras (NR-12, NR-17), mitigação do <em>Muri</em> (sobrecarga biomecânica) como condição de estabilidade operacional e integração de segurança ao 5S e TPM.
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                      <Code size={15} color="#0284c7" /> Software & IA Industrial
                    </strong>
                    <p style={{ fontSize: '0.775rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Arquiteto de sistemas em Next.js, React, TypeScript, Node.js, Python, Supabase (PostgreSQL, RLS). Criador do <strong>Akiom.ai</strong> e fundador da suíte <strong>CalcForgeTools</strong>.
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b' }}>
                  <span>
                    <strong>Currículo & Portfólio Oficial:</strong> calcforgetools.com • Akiom.ai • GitHub: Mauthope
                  </span>
                  <span>
                    Contato: <strong>mauricioprestesgrigol@gmail.com</strong>
                  </span>
                </div>
              </div>

              {/* Rodapé da Capa */}
              <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  XAXIM — SANTA CATARINA
                </p>
                <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: 0 }}>
                  Publicação Oficial de Engenharia de Processos Industriais • Versão 4.0 Multi-Tenant
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* PRÓLOGO: A GÊNESE DO FLUXOLEAN E A VISÃO SISTÊMICA                */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 1 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Fundamentação Teórica & Diagnóstico Fabril
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Prólogo: A Gênese do FluxoLean e a Visão Sistêmica
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Tríade Muda, Muri e Mura
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  No Sistema Toyota de Produção (TPS), concebido por Taiichi Ohno e Shigeo Shingo, o desperdício não surge por acaso; ele é o resultado da interação destrutiva entre três anomalias:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#334155', lineHeight: 1.65 }}>
                  <li>
                    <strong>Muda (Desperdício):</strong> Qualquer consumo de recursos (tempo, esforço, matéria-prima, espaço) que não agrega valor sob a ótica estrita do cliente pagante.
                  </li>
                  <li>
                    <strong>Muri (Sobrecarga):</strong> Exigir de pessoas ou máquinas esforços além dos limites naturais de projeto. Na Engenharia de Segurança do Trabalho (NR-17), o <em>Muri</em> é a causa-raiz de lesões por esforço repetitivo (LER/DORT), fadiga cognitiva, quebras mecânicas catastróficas e falhas operacionais.
                  </li>
                  <li>
                    <strong>Mura (Variabilidade / Oscilação):</strong> A falta de nivelamento no ritmo produtivo, alternando picos de estresse com vales de ociosidade, destruindo o fluxo contínuo.
                  </li>
                </ul>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                1. A Dicotomia Histórica entre o Gemba e a Diretoria Financeira
              </h3>
              <p>
                Por mais de três décadas, organizações industriais implementaram ferramentas do Sistema Toyota de Produção.
                Contudo, um abismo de desconfiança se instalou entre a área técnica e a diretoria: de um lado, engenheiros comemoravam ganhos expressivos de Kaizen no chão de fábrica; do outro, a Controladoria apontava que o lucro operacional da empresa não aumentava na mesma proporção.
              </p>
              <p>
                Essa dicotomia ocorre porque o Lean tradicional foi frequentemente ensinado sob o prisma de &quot;ganhos teóricos&quot; — calcular que uma melhoria economizou 2 minutos por ciclo e multiplicar isso arbitrariamente pelo salário dos operadores para reivindicar &quot;R$ 100.000,00 de economia&quot;, sem que nenhum turno tenha sido cortado ou nenhum produto extra tenha sido faturado.
                A Controladoria, munida do rigor contábil das partidas dobradas, desconsidera tais relatórios, taxando o programa de melhoria contínua como mera cosmética fabril.
              </p>

              <div className="colored-card card-amber">
                <strong style={{ color: '#92400e', fontSize: '0.95rem', display: 'block', marginBottom: '0.35rem' }}>
                  ⚠️ O Círculo Vicioso da Desconexão Sistêmica:
                </strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f', lineHeight: 1.6 }}>
                  Ganhos fictícios geram ceticismo contábil ➔ A Controladoria corta verbas de melhoria contínua ➔ Os agentes de melhoria se sentem desvalorizados ➔ As anomalias de chão de fábrica se acumulam, elevando o custo operacional real.
                </p>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                2. Os Três Pilares de Ruptura do FluxoLean 4.0
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '1.25rem 0' }}>
                <div className="colored-card card-blue" style={{ margin: 0 }}>
                  <strong style={{ color: '#0369a1', fontSize: '0.9rem', display: 'block', marginBottom: '0.35rem' }}>
                    1. Fim das Planilhas Desconexas
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Centralização em base de dados relacional (PostgreSQL), unificando premissas tributárias, tarifas elétricas e taxas horárias com total rastreabilidade.
                  </span>
                </div>

                <div className="colored-card card-green" style={{ margin: 0 }}>
                  <strong style={{ color: '#15803d', fontSize: '0.9rem', display: 'block', marginBottom: '0.35rem' }}>
                    2. Fé Pública Contábil
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Portal direto da Controladoria: um projeto só conclui seu ciclo mediante validação e chancela explícita de um auditor financeiro independente.
                  </span>
                </div>

                <div className="colored-card card-purple" style={{ margin: 0 }}>
                  <strong style={{ color: '#7e22ce', fontSize: '0.9rem', display: 'block', marginBottom: '0.35rem' }}>
                    3. Defesa Técnica do Agente
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Rastreamento de gargalos departamentais externos (Compras, Manutenção, TI), isolando filas burocráticas e blindando a liderança de melhoria contínua.
                  </span>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 1: DASHBOARD EXECUTIVO & ENGENHARIA DE LEAD TIME         */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 2 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu Principal • Gestão Visual
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 1: Dashboard Executivo & Engenharia de Lead Time
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Filosofia Mieruka e a Soberania do Lead Time
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Mieruka (Gestão à Vista):</strong> Na psicologia fabril japonesa, a cognição humana processa elementos visuais com velocidade 60.000 vezes superior ao texto puro. Um sistema visual bem projetado deve permitir que qualquer colaborador compreenda o estado da produção, anomalias e gargalos em menos de 5 segundos, sem ler manuais ou abrir planilhas complexas.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Soberania do Lead Time:</strong> Como ensinava Taiichi Ohno: <em>&quot;Tudo o que fazemos é olhar para a linha do tempo, desde o momento em que o cliente nos faz o pedido até o ponto em que recebemos o dinheiro. E estamos reduzindo essa linha do tempo eliminando os desperdícios que não agregam valor.&quot;</em> No FluxoLean, tratamos os próprios projetos de melhoria como um fluxo produtivo cujo Lead Time deve ser rigorosamente cronometrado.
                </p>
              </div>

              {/* CARD AZUL: LÓGICA DA TELA */}
              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <BarChart3 size={18} /> A Lógica da Tela do Dashboard no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O <strong>Dashboard Executivo</strong> opera como o painel de bordo da fábrica.
                  A tela é segmentada em 3 blocos funcionais:
                  (1) <em>Cards Superiores de Indicadores Vitais</em> com o total de projetos ativos, retorno acumulado em R$ e ROI médio ponderado;
                  (2) <em>Pipeline Horizontal do PDCA</em>, demonstrando a quantidade e proporção de projetos em cada portão de qualidade;
                  (3) <em>Painel Duplo de Engenharia de Lead Time</em>, com decomposição do tempo por etapa do PDCA e gráfico de dependências externas.
                </p>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                Memorial de Cálculo das Métricas do Dashboard
              </h3>

              {/* FÓRMULA 1.1 ESTILO FLUXOLEAN */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} color="#0284c7" /> Equação 1.1 — Lead Time Ativo de Ciclo do Projeto (LT_ativo)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Unidade: Dias Corridos
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">t_Plan (Diagnóstico)</span>
                  <span className="formula-operator">+</span>
                  <span className="formula-pill">t_Do (Implementação)</span>
                  <span className="formula-operator">+</span>
                  <span className="formula-pill">t_Check (Verificação)</span>
                  <span className="formula-operator">+</span>
                  <span className="formula-pill">t_Controladoria (Auditoria)</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">LT_ativo (Lead Time Total)</span>
                </div>

                <div className="formula-breakdown-box">
                  <strong>Regra de Ouro Metodológica:</strong> Não se inclui o período de 3 meses de acompanhamento pós-conclusão como parte do Lead Time ativo de ciclo,
                  pois se trata de uma fase passiva de verificação e auditoria contábil. Caso contrário, projetos de altíssima eficiência pareceriam lentos nas estatísticas executivas.
                </div>

                <div className="formula-example-box">
                  <strong>Demonstração Numérica Real:</strong> Projeto de Redução de Setup de Tecelagem:<br />
                  t_Plan = 12 dias | t_Do = 20 dias | t_Check = 8 dias | t_Controladoria = 4 dias.<br />
                  <strong>LT_ativo = 12 + 20 + 8 + 4 = 44 dias corridos de ciclo.</strong>
                </div>
              </div>

              {/* FÓRMULA 1.2 ESTILO FLUXOLEAN */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color="#d97706" /> Equação 1.2 — Defesa do Agente & Taxa de Impacto Externo (Φ)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', backgroundColor: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Unidade: Percentual (%)
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">LT_ativo</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">LT_Agente (Tempo Próprio)</span>
                  <span className="formula-operator">+</span>
                  <span className="formula-pill">Σ LT_Setores_Externos (Compras / Manutenção / T.I.)</span>
                </div>

                <div className="formula-pills-row" style={{ marginTop: '0.35rem' }}>
                  <span className="formula-result-pill" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }}>
                    Taxa de Impacto Externo (Φ)
                  </span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">( Σ LT_Setores_Externos ÷ LT_ativo )</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">100%</span>
                </div>

                <div className="formula-example-box">
                  <strong>Caso Prático da Defesa do Agente:</strong> Dos 44 dias totais do projeto:<br />
                  - Tempo sob controle do Líder Lean: 12 dias (investigação de causa-raiz e criação de POP).<br />
                  - Tempo travado no setor de Compras (aquisição de peça): 14 dias.<br />
                  - Tempo travado na Manutenção (parada de máquina para usinagem): 18 dias.<br />
                  Σ LT_Setores_Externos = 14 + 18 = 32 dias.<br />
                  <strong>Φ = (32 ÷ 44) × 100% = 72,7% de dependência de terceiros.</strong><br />
                  <em>Defesa Comprovada:</em> O agente respondeu por apenas 27,3% do tempo; 72,7% do atraso decorreu da fila de outros setores.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 2: TRIAGEM INDUSTRIAL & MATRIZ GUT                       */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 3 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu de Entrada • Portfólio de Ideias
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 2: Triagem Industrial & Matriz GUT
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Hoshin Kanri e a Priorização Científica
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Hoshin Kanri (Desdobramento de Diretrizes):</strong> Um dos maiores erros de gestão industrial é tratar todas as demandas com a mesma urgência. Quando tudo é prioridade, nada é prioridade, gerando paralisia por análise e exaustão física e mental na engenharia.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Lógica de Triagem de Kepner & Tregoe:</strong> A Matriz GUT estabelece um filtro racional contra o viés emocional. Ela responde matematicamente a três perguntas cruciais: (1) <em>Qual a gravidade do dano caso nada seja feito?</em> (2) <em>Qual a pressão do tempo para contenção imediata?</em> (3) <em>Qual a taxa de degradação da anomalia no tempo?</em> O FluxoLean separa o que é ação simples de chão de fábrica do que exige a artilharia pesada do PDCA.
                </p>
              </div>

              {/* CARD AZUL: LÓGICA DA TELA */}
              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Filter size={18} /> A Lógica da Tela de Triagem no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  A tela de Triagem recebe as sugestões vindas do Canal Kaizen e de formulários rápidos de operadores.
                  Cada demanda é apresentada em um card visual com fotografia da anomalia, descrição da dor e setor de origem.
                  Ao clicar em <em>Analisar Demanda</em>, o coordenador pontua as notas de Gravidade, Urgência e Tendência.
                  O sistema calcula o <strong>Score GUT</strong> instantaneamente e habilita botões de despacho com 1 clique.
                </p>
              </div>

              {/* TABELA GUT */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                Tabela de Critérios de Pontuação da Matriz GUT no FluxoLean
              </h3>
              <table className="memorial-table">
                <thead>
                  <tr>
                    <th>Nota</th>
                    <th>Gravidade (G) — Magnitude do Dano</th>
                    <th>Urgência (U) — Pressão do Tempo</th>
                    <th>Tendência (T) — Propensão de Piora</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>1</strong></td>
                    <td>Sem impacto em custo, segurança ou entrega.</td>
                    <td>Pode aguardar ciclo anual sem prejuízo.</td>
                    <td>Estável; não irá se agravar com o tempo.</td>
                  </tr>
                  <tr>
                    <td><strong>2</strong></td>
                    <td>Dano leve; desconforto operacional simples.</td>
                    <td>Pode ser avaliado no próximo trimestre.</td>
                    <td>Degradação lenta e quase imperceptível.</td>
                  </tr>
                  <tr>
                    <td><strong>3</strong></td>
                    <td>Dano moderado; retrabalho pontual &lt; R$ 5.000.</td>
                    <td>Exige ação em até 30 dias para evitar acúmulo.</td>
                    <td>Piora gradual previsível se nada for feito.</td>
                  </tr>
                  <tr>
                    <td><strong>4</strong></td>
                    <td>Dano grave; quebra recorrente de equipamento.</td>
                    <td>Exige ação nas próximas 48 a 72 horas.</td>
                    <td>Piora acelerada com risco de parada de linha.</td>
                  </tr>
                  <tr>
                    <td><strong>5</strong></td>
                    <td>Dano gravíssimo; risco à vida, ambiental ou &gt; R$ 50k.</td>
                    <td>Parada total imediata ou cliente desabastecido.</td>
                    <td>Degradação exponencial imediata e catastrófica.</td>
                  </tr>
                </tbody>
              </table>

              {/* FÓRMULA GUT ESTILO FLUXOLEAN */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calculator size={16} color="#0284c7" /> Equação 2.1 — Índice de Prioridade de Demanda (Score GUT)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Escala: 1 a 125
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">G (Gravidade 1..5)</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">U (Urgência 1..5)</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">T (Tendência 1..5)</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">Score GUT (Prioridade)</span>
                </div>

                <div className="formula-breakdown-box">
                  <strong>Regras de Decisão Algorítmica no FluxoLean:</strong><br />
                  • <code>Score GUT ≥ 64</code>: <strong>Alta Prioridade</strong> ➔ Abertura mandatória de <em>Projeto PDCA Estruturado</em>.<br />
                  • <code>27 ≤ Score GUT &lt; 64</code>: <strong>Média Prioridade</strong> ➔ Despacho como <em>Ação Rápida Kaizen de Setor</em>.<br />
                  • <code>Score GUT &lt; 27</code>: <strong>Baixa Prioridade</strong> ➔ Arquivamento com justificativa enviada ao autor.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 3: PROJETOS PDCA EM 4 FASES & RELATÓRIO A3               */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 4 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Motor Metodológico Central • Ciclo de Deming
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 3: Projetos PDCA em 4 Fases & Relatório A3 Executivo
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Disciplina Intelectual da Folha A3
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Origem do Relatório A3 (John Shook - Managing to Learn):</strong> Na Toyota, o formato físico de uma folha A3 (420 × 297 mm) não foi escolhido por acaso. Ele representa uma restrição de espaço proposital que força o autor a exercitar extrema síntese cognitiva, eliminando textos prolixos e priorizando gráficos de causa e efeito. Um A3 é uma história técnica completa: do contexto à causa-raiz, das contramedidas aos resultados financeiros auditados.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Jidoka & Poka-Yoke:</strong> Conforme preconizado por Shigeo Shingo, não basta inspecionar defeitos no final da linha (inspeção de julgamento); é indispensável implementar <em>Poka-Yokes</em> (mecanismos físicos e lógicos à prova de falha humana) para que o processo interrompa o fluxo no exato instante em que uma anomalia é detectada (<em>Jidoka</em> ou Autonomação).
                </p>
              </div>

              {/* CARD AZUL: OS 4 PORTÕES DE QUALIDADE */}
              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Layers size={18} /> A Lógica da Tela do Projeto: 4 Portões Rígidos (Gates)
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  No FluxoLean, o avanço de um projeto não é uma mera mudança de etiqueta.
                  Para transitar entre as abas, o líder é guiado por validações obrigatórias:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1rem' }}>
                  <strong style={{ color: '#15803d', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    1. PLAN: Diagnóstico no Gemba
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Construção do Diagrama de Ishikawa 6M interativo, estratificação de Pareto 80/20 e técnica dos 5 Porquês até a causa-raiz física.
                  </span>
                </div>

                <div style={{ backgroundColor: '#fefce8', border: '1.5px solid #fde047', borderRadius: '10px', padding: '1rem' }}>
                  <strong style={{ color: '#a16207', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    2. DO: Execução 5W2H Intersetorial
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Matriz 5W2H com atribuição mandatória de <em>Setor Corresponsável</em> (para apuração de Lead Time externo) e registro de testes pilotos.
                  </span>
                </div>

                <div style={{ backgroundColor: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: '10px', padding: '1rem' }}>
                  <strong style={{ color: '#6d28d9', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    3. CHECK: Verificação & Memória
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Fotos de Antes vs Depois, cálculo de variação de capabilidade (Δ%) e upload mandatório da planilha de cálculo para a Controladoria.
                  </span>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '10px', padding: '1rem' }}>
                  <strong style={{ color: '#1d4ed8', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    4. ACT: Padronização & Yokoten
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Procedimento Operacional Padrão (POP), plano de treinamento de operadores, dispositivos Poka-Yoke e replicação lateral (Yokoten).
                  </span>
                </div>
              </div>

              {/* FÓRMULA PARETO 80/20 ESTILO FLUXOLEAN */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BarChart3 size={16} color="#0284c7" /> Equação 3.1 — Estratificação de Pareto 80/20 (Poucos Vitais)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Critério de Corte: Fa ≤ 80%
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">Frequência Relativa (fr_i)</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">( Ocorrências_i ÷ Total_Ocorrências )</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">100%</span>
                </div>

                <div className="formula-pills-row" style={{ marginTop: '0.35rem' }}>
                  <span className="formula-result-pill">
                    Frequência Acumulada (Fa_k) = Σ fr_i (para i de 1 até k)
                  </span>
                </div>

                <div className="formula-example-box">
                  <strong>Aplicação em Linha de Produção (200 quebras mecânicas no mês):</strong><br />
                  1. Desgaste de Guia Plástica: 110 paradas (55%) ➔ Acumulado = 55% ➔ <strong>Vital</strong><br />
                  2. Folga no Rolamento Central: 52 paradas (26%) ➔ Acumulado = 81% ➔ <strong>Vital</strong><br />
                  3. Outros 8 motivos menores: 38 paradas (19%) ➔ Acumulado = 100% ➔ Trivial<br />
                  <em>Decisão no 5W2H:</em> O plano foca 100% nas causas 1 e 2, eliminando 81% dos problemas da máquina.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 4: ENGENHARIA FINANCEIRA & CUSTOS EVITADOS               */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 5 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Modelagem Financeira • Lean Accounting
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 4: Engenharia Financeira & As 7 Fontes de Custo Evitado
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Equação de Lucro Reversa de Taiichi Ohno
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Na economia tradicional, as empresas operavam sob a ilusão da fórmula: <code>Custo + Lucro Desejado = Preço de Venda</code>. Acreditava-se que, para lucrar mais, bastava elevar o preço ao cliente.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Taiichi Ohno inverteu esse axioma, revelando a dura realidade do livre mercado global: <code>Preço de Venda (dado pelo mercado) − Custo = Lucro</code>. Se o cliente define o teto do preço, a única variável sob controle direto da engenharia é a redução drástica de custos através da eliminação do desperdício. O FluxoLean diferencia <em>Custo Desembolsado (Cash Out)</em> de <em>Custo Evitado (Cost Avoidance)</em> para que a Controladoria audite com fé pública.
                </p>
              </div>

              {/* CARD VERDE: FILOSOFIA DE CUSTO EVITADO */}
              <div className="colored-card card-green">
                <strong style={{ color: '#15803d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <DollarSign size={18} /> A Eliminação dos &quot;Ganhos Fictícios&quot;
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  No FluxoLean, cada centavo declarado na aba CHECK deve corresponder a desembolso real evitado ou a aumento físico de receita faturada.
                  Os inputs numéricos são limpos (sem &quot;0&quot; pré-fixado e sem spinners desconfortáveis), e para cada fonte informada é obrigatório
                  anexar a planilha com a memória de cálculo para validação da Controladoria.
                </p>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                Memoriais de Cálculo das 7 Fontes Canônicas no Estilo FluxoLean
              </h3>

              {/* FONTE 1: MOD */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    👷‍♂️ 1. Mão de Obra Direta (MOD)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Regra: Exige realocação comprovada ou corte de turno
                  </span>
                </div>
                <div className="formula-pills-row">
                  <span className="formula-pill">[ Horas Reduzidas / Ano ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Salário Hora Base ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ 1 + Encargos Sociais ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">ΔCusto MOD (R$/ano)</span>
                </div>
                <div className="formula-example-box">
                  <strong>Caso Real:</strong> Operador de alimentação manual automatizado e realocado para posto vago.<br />
                  2.200 horas/ano × R$ 15,00/h × 1,80 (80% encargos) = <strong>R$ 59.400,00 / ano economizados</strong>.
                </div>
              </div>

              {/* FONTE 2: REFUGO */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    🗑️ 2. Perda de Material / Refugo Fabril
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Regra: Valor líquido (preço MP virgem menos venda sucata)
                  </span>
                </div>
                <div className="formula-pills-row">
                  <span className="formula-pill">[ Qtd Sucata Evitada (kg/ano) ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Custo Unitário MP Virgem − Valor Venda Sucata ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">ΔRefugo (R$/ano)</span>
                </div>
                <div className="formula-example-box">
                  <strong>Caso Real em Extrusão de Plástico:</strong> Redução de 14.400 kg de aparas/ano.<br />
                  14.400 kg × (R$ 8,50 resina − R$ 1,50 sucata) = <strong>R$ 100.800,00 / ano economizados</strong>.
                </div>
              </div>

              {/* FONTE 3: THROUGHPUT */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    📈 3. Capacidade Adicional no Gargalo (Throughput / Teoria das Restrições)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Regra: Aplicável exclusivamente na restrição do fluxo
                  </span>
                </div>
                <div className="formula-pills-row">
                  <span className="formula-pill">[ Peças Adicionais no Gargalo / Ano ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Margem de Contribuição Unitária Líquida ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">ΔThroughput (R$/ano)</span>
                </div>
                <div className="formula-example-box">
                  <strong>Caso Real em Tecelagem:</strong> Aumento de 50.000 metros de tecido no gargalo.<br />
                  50.000 m × R$ 1,80 de margem unitária = <strong>R$ 90.000,00 / ano de lucro adicional</strong>.
                </div>
              </div>

              {/* FONTE 4: ENERGIA */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    ⚡ 4. Eficiência Energética & Utilidades
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Regra: Tarifa industrial com impostos e bandeiras
                  </span>
                </div>
                <div className="formula-pills-row">
                  <span className="formula-pill">[ ΔPotência Reduzida (kW) ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Horas Operação / Ano ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Tarifa Média kWh ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">ΔEnergia (R$/ano)</span>
                </div>
                <div className="formula-example-box">
                  <strong>Caso Real em Inversor de Frequência de Motor:</strong> Redução de 35 kW contínuos.<br />
                  35 kW × 8.000 horas/ano × R$ 0,65/kWh = <strong>R$ 182.000,00 / ano economizados</strong>.
                </div>
              </div>

              {/* FONTE 5: CONSUMÍVEIS */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    📦 5. Consumíveis & Insumos Operacionais
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Regra: Gramatura/consumo por peça multiplicada pela produção
                  </span>
                </div>
                <div className="formula-pills-row">
                  <span className="formula-pill">[ Gramatura Evitada / Peça (kg) ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Produção Anual (peças) ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Preço Unitário Insumo ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">ΔConsumíveis (R$/ano)</span>
                </div>
                <div className="formula-example-box">
                  <strong>Caso Real em Filme Stretch de Palletização:</strong> Redução de 0,040 kg de filme por pallet.<br />
                  0,040 kg × 80.000 pallets/ano × R$ 16,00/kg = <strong>R$ 51.200,00 / ano economizados</strong>.
                </div>
              </div>

              {/* FONTE 6: HORAS EXTRAS */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    ⏱️ 6. Horas Extras Fabris Eliminadas
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Regra: Salário com adicional 50% e encargos
                  </span>
                </div>
                <div className="formula-pills-row">
                  <span className="formula-pill">[ Total Horas Extras Cortadas ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Salário Hora Base × 1,5 × (1 + Encargos) ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">ΔHoras_Extras (R$/ano)</span>
                </div>
                <div className="formula-example-box">
                  <strong>Caso Real:</strong> Corte de turnos de fim de semana (1.920 horas extras cortadas/ano).<br />
                  1.920 horas × R$ 37,80/h extra com encargos = <strong>R$ 72.576,00 / ano de impacto em caixa</strong>.
                </div>
              </div>

              {/* FONTE 7: RETRABALHO */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    🛠️ 7. Retrabalho Interno & Não-Conformidades
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Regra: Horas de reoperação somadas a componentes perdidos
                  </span>
                </div>
                <div className="formula-pills-row">
                  <span className="formula-pill">[ Lotes Reprocessados Evitados ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Horas Reoperação × Taxa HH + Peças Danificadas ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">ΔRetrabalho (R$/ano)</span>
                </div>
                <div className="formula-example-box">
                  <strong>Caso Real:</strong> Eliminação de 40 lotes retrabalhados/ano por Poka-Yoke.<br />
                  40 lotes × R$ 925,00 de custo por lote = <strong>R$ 37.000,00 / ano economizados</strong>.
                </div>
              </div>

              {/* CONSOLIDAÇÃO DE ROI E PAYBACK */}
              <div className="lean-formula-container" style={{ borderColor: '#86efac', backgroundColor: '#f0fdf4' }}>
                <div className="formula-header">
                  <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#15803d' }}>
                    💰 Consolidação: Economia Líquida, ROI Real e Payback Amortizado
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                    DRE Aprovada
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">[ Ganho Bruto Total (7 Fontes) ]</span>
                  <span className="formula-operator">−</span>
                  <span className="formula-pill">[ Investimento do Projeto ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">Economia Líquida (R$)</span>
                </div>

                <div className="formula-pills-row" style={{ marginTop: '0.35rem' }}>
                  <span className="formula-pill">[ Payback em Meses ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">Investimento Total ÷ ( Ganho Bruto Total ÷ 12 )</span>
                </div>

                <div className="formula-example-box" style={{ backgroundColor: '#ffffff', borderColor: '#bbf7d0', color: '#166534' }}>
                  <strong>Resultado Consolidado do Estudo de Caso:</strong><br />
                  Ganho Bruto Anual (Soma das 7 Fontes) = <strong>R$ 592.976,00 / ano</strong>.<br />
                  Investimento Total (Inversor + Poka-Yoke + Treinamentos) = <strong>R$ 85.000,00</strong>.<br />
                  • <strong>Economia Líquida no 1º Ano = R$ 507.976,00.</strong><br />
                  • <strong>ROI Líquido = (507.976 ÷ 85.000) × 100% = 597,6%.</strong><br />
                  • <strong>Payback Amortizado = 85.000 ÷ (592.976 ÷ 12) = 1,72 meses (apenas 52 dias para o investimento se pagar integralmente).</strong>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 5: GOVERNANÇA CONTÁBIL & AUDITORIA CONTROLADORIA        */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 6 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Auditoria & Fé Pública • Compliance
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 5: Governança Contábil & Auditoria da Controladoria
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Fé Pública da Controladoria
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Na governança tradicional, o coordenador de melhoria contínua preenchia uma ata interna e afirmava um valor de retorno. Sem validação externa, essa prática criava suspeitas de autopromoção.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  No FluxoLean, introduzimos o conceito de <strong>Fé Pública Contábil</strong>: a engenharia elabora a tese e calcula o valor, mas cabe exclusivamente ao auditor contábil verificar as contas contábeis de saída (notas fiscais de sucata, folha de pagamento, faturas de energia elétrica) e homologar formalmente os valores. Isso transforma o projeto Lean em um ativo financeiro incontestável.
                </p>
              </div>

              {/* CARD ROXO: PORTAL DO AUDITOR */}
              <div className="colored-card card-purple">
                <strong style={{ color: '#7e22ce', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <ShieldCheck size={18} /> A Lógica da Tela do Auditor Contábil no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  Ao submeter o projeto na fase CHECK, o sistema dispara um link com token de segurança exclusivo para a Controladoria.
                  O auditor abre a página e analisa a tabela comparativa das 7 fontes, com botão direto para baixar a planilha de memória anexada pelo agente.
                  O auditor digita seus valores homologados e escolhe uma das três ações institucionais:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '1.25rem 0' }}>
                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#16a34a', marginBottom: '0.35rem' }}>✓</div>
                  <strong style={{ fontSize: '0.85rem', color: '#14532d', display: 'block', marginBottom: '0.25rem' }}>Homologação com 1 Clique</strong>
                  <span style={{ fontSize: '0.75rem', color: '#166534' }}>
                    Concorda integralmente com a memória de cálculo. Projeto promovido a <em>Homologado Master</em>.
                  </span>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#2563eb', marginBottom: '0.35rem' }}>✎</div>
                  <strong style={{ fontSize: '0.85rem', color: '#1e3a8a', display: 'block', marginBottom: '0.25rem' }}>Homologação com Ajustes</strong>
                  <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                    Ajusta premissas conservadoras, grava parecer técnico e pode anexar uma contra-memória de cálculo.
                  </span>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '0.35rem' }}>✕</div>
                  <strong style={{ fontSize: '0.85rem', color: '#7f1d1d', display: 'block', marginBottom: '0.25rem' }}>Rejeição Fundamentada</strong>
                  <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>
                    Identifica inconsistência contábil e devolve o projeto ao agente para revisão obrigatória.
                  </span>
                </div>
              </div>

              {/* REGRA DOS 3 MESES */}
              <div className="colored-card card-amber">
                <strong style={{ color: '#92400e', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <Clock size={16} /> A Regra de Ouro dos 3 Meses de Acompanhamento (Fase de Estabilização)
                </strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f', lineHeight: 1.6 }}>
                  Para assegurar que o ganho não seja efêmero ou fruto de uma oscilação sazonal temporária, o projeto entra em 90 dias de monitoramento ativo.
                  Nos meses 1, 2 e 3, o agente deve comprovar que o novo Procedimento Operacional Padrão continua sendo rigorosamente executado no Gemba,
                  garantindo estabilização matemática do retorno antes do arquivamento definitivo.
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 6: TPM, 5S & MAXIMIZAÇÃO DE OEE                          */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 7 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Confiabilidade de Ativos • TPM
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 6: TPM & Gestão Autônoma 5S (OEE e Anomalias)
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Jishu Hozen e a Conexão com a NR-12
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Manutenção Autônoma (Jishu Hozen - Seiichi Nakajima):</strong> O TPM rompe a barreira destrutiva do &quot;eu opero, você conserta&quot;. O operador é o primeiro sensor da máquina: ele ouve um ruído anômalo, sente uma vibração excessiva ou enxerga um vazamento de óleo horas antes de ocorrer a quebra catastrófica.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Segurança Operacional (NR-12 e 5S):</strong> Máquinas sujas, mal iluminadas e sem manutenção são potenciais causas de acidentes graves. O 5S não é estética ou faxina; é a fundação da estabilidade básica operacional. Manter proteções mecânicas fixas e sensores ativos atende às exigências da NR-12 e preserva a vida humana no Gemba.
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Cpu size={18} /> A Lógica da Tela de TPM no FluxoLean: Operador Mantenedor
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O módulo de TPM empodera quem está na linha de produção.
                  Pelo celular ou tablet industrial, o operador fotografa pequenas falhas físicas (folgas, vazamentos, anomalias).
                  O sistema classifica automaticamente entre <strong>Etiqueta Vermelha</strong> (Manutenção Mecânica/Elétrica especializada com bloqueio e etiquetagem LOTO)
                  e <strong>Etiqueta Azul</strong> (Manutenção Autônoma 5S de reaperto e lubrificação pelo próprio operador).
                </p>
              </div>

              {/* FÓRMULA OEE ESTILO FLUXOLEAN */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BarChart3 size={16} color="#0284c7" /> Equação 6.1 — Índice de Eficiência Global do Equipamento (OEE)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Padrão Mundial World Class: ≥ 85%
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">Disponibilidade (D)</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">Desempenho / Performance (P)</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">Qualidade (Q)</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">OEE Global Fabril</span>
                </div>

                <div className="formula-breakdown-box">
                  • <strong>D:</strong> ( Tempo de Carga − Paradas ) ÷ Tempo de Carga<br />
                  • <strong>P:</strong> Produção Real ÷ ( Tempo Operacional × Velocidade Padrão )<br />
                  • <strong>Q:</strong> Peças Conformes ÷ Total de Peças Produzidas
                </div>

                <div className="formula-example-box">
                  <strong>Exemplo de Turno de 8 Horas (480 minutos):</strong><br />
                  - Paradas de máquina = 60 min ➔ Tempo Operacional = 420 min ➔ <strong>D = 420 ÷ 480 = 87,5%</strong>.<br />
                  - Peças produzidas = 3.780 peças vs Capacidade de 4.200 peças ➔ <strong>P = 3.780 ÷ 4.200 = 90,0%</strong>.<br />
                  - Refugos = 189 peças (3.591 peças boas) ➔ <strong>Q = 3.591 ÷ 3.780 = 95,0%</strong>.<br />
                  <strong>OEE = 0,875 × 0,900 × 0,950 = 74,8% de eficiência global da linha.</strong>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 7: DESENVOLVIMENTO HUMANO & ACADEMIA LEAN                */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 8 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Pessoas & Cultura Industrial
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 7: Desenvolvimento Humano, Academia Lean & Assessment 360°
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Monozukuri wa Hitozukuri & Toyota Kata
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Monozukuri wa Hitozukuri:</strong> Provérbio japonês que define o DNA da melhoria contínua: <em>&quot;Antes de fabricar coisas excelentes (Monozukuri), devemos formar pessoas excelentes (Hitozukuri)&quot;</em>. O maquinário mais moderno do mundo se torna obsoleto se os operadores não dominarem o método científico de solução de problemas.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Toyota Kata (Mike Rother):</strong> O aprendizado não acontece em palestras anuais esporádicas, mas na prática diária de pequenas rotinas (Kata de Melhoria) orientadas por um mentor (Kata de Coaching). A Academia Lean do FluxoLean transforma o operário em investigador ativo.
                </p>
              </div>

              <div className="colored-card card-green">
                <strong style={{ color: '#15803d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <GraduationCap size={18} /> A Lógica da Academia Lean & Radar de Maturidade 360°
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O sistema de gestão só tem sustentabilidade se formar líderes técnicos.
                  O FluxoLean incorpora o módulo da <strong>Academia Lean</strong>, onde colaboradores realizam exames online com gabarito auditável,
                  e o <strong>Radar de Maturidade 360°</strong>, avaliando competências em 5 eixos.
                </p>
              </div>

              <table className="memorial-table">
                <thead>
                  <tr>
                    <th>Graduação</th>
                    <th>Público Alvo</th>
                    <th>Competências Dominadas</th>
                    <th>Critério de Concessão do Belt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>White Belt</strong></td>
                    <td>Operadores e Auxiliares</td>
                    <td>8 Desperdícios, 5S e Cartões de Anomalia.</td>
                    <td>Exame online (acerto ≥ 70%) + 2 ideias Kaizen abertas.</td>
                  </tr>
                  <tr>
                    <td><strong>Yellow Belt</strong></td>
                    <td>Líderes de Turno e Manutenção</td>
                    <td>Ishikawa 6M, 5W2H e Cronoanálise.</td>
                    <td>Exame online (acerto ≥ 75%) + 1 projeto PDCA como membro.</td>
                  </tr>
                  <tr>
                    <td><strong>Green Belt</strong></td>
                    <td>Engenheiros e Supervisores</td>
                    <td>Liderança de projetos, Pareto, Capabilidade e ROI.</td>
                    <td>Exame avançado (acerto ≥ 80%) + 1 projeto liderado com ROI auditado.</td>
                  </tr>
                  <tr>
                    <td><strong>Black Belt</strong></td>
                    <td>Coordenadores e Especialistas</td>
                    <td>Hoshin Kanri, VSM e mentoria de agentes.</td>
                    <td>Banca técnica executiva + Retorno consolidado &gt; R$ 200k.</td>
                  </tr>
                </tbody>
              </table>

              {/* FÓRMULA RADAR 360 ESTILO FLUXOLEAN */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={16} color="#0284c7" /> Equação 7.1 — Score Pentagonal do Radar de Maturidade 360°
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Escala: 0 a 100 pontos
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">Score Maturidade</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">( Rigor Metodológico + Lead Time + Precisão Contábil + Gemba + Yokoten )</span>
                  <span className="formula-operator">÷</span>
                  <span className="formula-pill">5</span>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 8: KANBAN OPERACIONAL & GESTÃO DE FLUXO                  */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 9 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Ritmo & Fluxo Puxado • Kanban
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 8: Kanban Operacional & Gestão de Fluxo de Projetos
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Limitação de WIP e a Lei de Little
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Ilusão do Multitasking Fabril:</strong> Iniciar muitos projetos simultaneamente sem concluir os anteriores gera estoque em processo (WIP). O cérebro humano perde até 40% de eficiência cognitiva ao alternar constantemente entre tarefas complexas.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Lei de Little (\(WIP = TH \times LT\)):</strong> Formulada por John Little (MIT), essa equação matemática rege todo sistema de filas: quanto maior o número de tarefas em andamento (WIP), maior será o tempo de resposta (Lead Time) de cada uma delas. A regra de ouro do Kanban Lean é simples e transformadora: <em>&quot;Pare de começar e comece a terminar!&quot;</em>
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Kanban size={18} /> A Lógica da Tela de Kanban Operacional no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O Kanban do FluxoLean organiza os projetos em colunas canônicas: <em>Triagem, Plan, Do, Check, Controladoria e Homologado</em>.
                  Cada card exibe o número do protocolo, o agente responsável, o setor fabril e o tempo de permanência na coluna (Aging), disparando alertas visuais quando um projeto fica estagnado.
                </p>
              </div>

              {/* FÓRMULA LEI DE LITTLE ESTILO FLUXOLEAN */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sliders size={16} color="#0284c7" /> Equação 8.1 — Lei de Little Aplicada à Gestão de Projetos
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Princípio de Limitação de WIP
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">WIP (Projetos em Andamento)</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">Throughput (Vazão de Projetos / Mês)</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">Lead Time Médio</span>
                </div>

                <div className="formula-breakdown-box">
                  <strong>Por que o FluxoLean limita o WIP a 3 projetos simultâneos por agente?</strong><br />
                  Se um agente assume 12 projetos ao mesmo tempo, seu WIP quadruplica. Pela Lei de Little, o tempo médio de entrega de cada projeto também quadruplica,
                  criando sobrecarga (Muri) e atrasos sistêmicos na entrega de resultados.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 9: CANAL KAIZEN & PARTICIPAÇÃO ATIVA DA BASE FABRIL      */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 10 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Inovação na Base • CCQ
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 9: Canal Kaizen & Participação Ativa da Base Fabril
                </h2>
              </div>

              {/* BOX PEDAGÓGICO LEAN */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Gemba Kaizen e o Respeito pelas Pessoas
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Gemba (O Local Onde o Valor é Criado):</strong> Na obra de Masaaki Imai, o verdadeiro engenheiro industrial passa 80% do seu tempo no chão de fábrica, observando o processo e ouvindo quem manuseia o ferramental. Ideias concebidas exclusivamente em escritórios com ar-condicionado costumam falhar por desconhecerem as minúcias da realidade física.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Teian Kaizen:</strong> O sistema japonês de pequenas sugestões diárias. Democratizar o Kaizen significa oferecer ferramentas ultrassimplificadas para que qualquer operador envie uma ideia sem burocracia, e receba retorno em tempo hábil para manter viva a chama da inovação na base fabril.
                </p>
              </div>

              <div className="colored-card card-green">
                <strong style={{ color: '#15803d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Lightbulb size={18} /> A Lógica do Canal Kaizen no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O formulário do Canal Kaizen foi desenhado para ser preenchido em 60 segundos na tela do celular.
                  O operador informa apenas o setor, tira uma foto do problema e relata sua sugestão de melhoria.
                  O feed público compartilha os projetos implementados com fotos de Antes e Depois, reconhecendo o colaborador perante toda a fábrica.
                </p>
              </div>

              {/* FÓRMULA RETORNO KAIZEN ESTILO FLUXOLEAN */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={16} color="#0284c7" /> Equação 9.1 — Índice de Engajamento Fabril (IE) e Retorno Médio Kaizen
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">Índice Engajamento (IE)</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">( Total Ideias Submetidas / Mês ÷ Total Colaboradores )</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">100%</span>
                </div>

                <div className="formula-pills-row" style={{ marginTop: '0.35rem' }}>
                  <span className="formula-result-pill">
                    Retorno Médio por Ideia = Custo Evitado Total de Kaizens ÷ Ideias Implementadas
                  </span>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 10: BIBLIOGRAFIA ACADÊMICA RIGOROSA (ABNT NBR 6023)     */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 11 ? 'active-chapter' : ''}`}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Referencial Teórico Consagrado
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 10: Bibliografia Acadêmica Rigorosa & Referencial ABNT
                </h2>
              </div>

              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                A modelagem matemática e os conceitos de fluxo do <strong>FluxoLean</strong> foram inspirados nas obras mais respeitadas
                da engenharia de produção e do Lean Manufacturing mundial:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    ref: 'OHNO, Taiichi. Toyota Production System: Beyond Large-Scale Production. Portland: Productivity Press, 1988.',
                    nota: 'Origem dos 7 Grandes Desperdícios (Muda), produção puxada por cartões visuais (Kanban) e a equação inversa de preço de venda.',
                  },
                  {
                    ref: 'SHINGO, Shigeo. A Study of the Toyota Production System from an Industrial Engineering Viewpoint. Tokyo: Japan Management Association, 1981.',
                    nota: 'Fundamentação técnica da Engenharia de Tempos, Troca Rápida de Ferramentas (SMED) e dispositivos Poka-Yoke.',
                  },
                  {
                    ref: 'WOMACK, James P.; JONES, Daniel T. Lean Thinking: Banish Waste and Create Wealth in Your Corporation. New York: Free Press, 2003.',
                    nota: 'Definição dos 5 Princípios Lean: Valor, Fluxo de Valor, Fluxo Contínuo, Produção Puxada e Perfeição.',
                  },
                  {
                    ref: 'LIKER, Jeffrey K. O Modelo Toyota: 14 Princípios de Gestão do Maior Fabricante do Mundo. Porto Alegre: Bookman, 2005.',
                    nota: 'Arquitetura cultural do princípio "Monozukuri wa Hitozukuri" e desenvolvimento de líderes no chão de fábrica.',
                  },
                  {
                    ref: 'SHOOK, John. Gerenciando para Aprender: O Uso do Processo de Gestão A3 para Resolver Problemas. São Paulo: Lean Institute Brasil, 2008.',
                    nota: 'Projeto metodológico e visual da folha A3 paisagem gerada automaticamente pelo FluxoLean.',
                  },
                  {
                    ref: 'ROTHER, Mike; SHOOK, John. Aprendendo a Enxergar: Mapeando o Fluxo de Valor. São Paulo: Lean Institute Brasil, 2003.',
                    nota: 'Base para o cálculo do Lead Time de Ciclo e separação de tempos com e sem agregação de valor.',
                  },
                  {
                    ref: 'NAKAJIMA, Seiichi. Introduction to TPM: Total Productive Maintenance. Cambridge: Productivity Press, 1988.',
                    nota: 'Modelagem do OEE (Disponibilidade × Desempenho × Qualidade) e dos 8 Pilares da Manutenção Autônoma (Jishu Hozen).',
                  },
                  {
                    ref: 'GOLDRATT, Eliyahu M.; COX, Jeff. A Meta: Um Processo de Aprimoramento Contínuo. São Paulo: Nobel, 2002.',
                    nota: 'Fundamentação da Teoria das Restrições e Throughput em Gargalos Industriais (Fonte 3 de Custo Evitado).',
                  },
                  {
                    ref: 'MONDEN, Yasuhiro. Toyota Production System: An Integrated Approach to Just-In-Time. 4th ed. Boca Raton: CRC Press, 2011.',
                    nota: 'Tratado completo sobre contabilidade de gestão Lean e amortização de investimentos fabris.',
                  },
                  {
                    ref: 'IMAI, Masaaki. Gemba Kaizen: A Commonsense Approach to a Continuous Improvement Strategy. 2nd ed. New York: McGraw-Hill, 2012.',
                    nota: 'Fundamentação filosófica da supremacia do chão de fábrica, disciplina dos 5 Sensos (5S) e Teian Kaizen.',
                  },
                ].map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #0f172a', padding: '0.85rem 1.15rem', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      {item.ref}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, fontStyle: 'italic' }}>
                      <strong>Aplicação no FluxoLean:</strong> {item.nota}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '1.75rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem 0' }}>
                  FIM DA MONOGRAFIA TÉCNICA & MEMORIAL METODOLÓGICO
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  FluxoLean 4.0 • Idealizado, Arquitetado e Documentado por <strong>Mauricio Grigol</strong> • Xaxim — SC
                </p>
              </div>
            </section>

            {/* NAVEGAÇÃO DE RODAPÉ (APENAS NA TELA) */}
            <div
              className="screen-chapter-nav no-print"
              style={{
                marginTop: '3.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveChapter((prev) => Math.max(0, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={activeChapter === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: activeChapter === 0 ? '#f1f5f9' : '#0f172a',
                  color: activeChapter === 0 ? '#94a3b8' : '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  cursor: activeChapter === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                }}
              >
                <ChevronLeft size={16} /> Capítulo Anterior
              </button>

              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {chapters[activeChapter].title}
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveChapter((prev) => Math.min(chapters.length - 1, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={activeChapter === chapters.length - 1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: activeChapter === chapters.length - 1 ? '#f1f5f9' : '#0284c7',
                  color: activeChapter === chapters.length - 1 ? '#94a3b8' : '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  cursor: activeChapter === chapters.length - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                }}
              >
                Próximo Capítulo <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
