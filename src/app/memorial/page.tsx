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
    { id: 0, title: 'Capa Nobre & Apresentação do Autor', short: 'Capa & Autor', icon: Award },
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
      {/* ESTILOS CSS SCREEN E PRINT                                                */}
      {/* ========================================================================= */}
      <style jsx global>{`
        /* Reset e Escopo Geral */
        .memorial-app-container {
          background-color: #090e17;
          min-height: 100vh;
          color: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* TIPOGRAFIA EDITORIAL */
        .memorial-serif {
          font-family: 'Merriweather', 'Georgia', 'Cambria', serif;
        }

        .academic-subtitle {
          color: #0284c7;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
          display: block;
        }

        .academic-section-header {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 1.25rem;
          margin-bottom: 2.25rem;
        }

        /* CAIXAS DE FÓRMULAS E MEMÓRIA DE CÁLCULO */
        .formula-card {
          background-color: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-left: 5px solid #0284c7;
          border-radius: 8px;
          padding: 1.5rem 1.75rem;
          margin: 1.75rem 0;
        }

        .formula-title {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .formula-expression {
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 0.85rem 1.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0369a1;
          margin: 0.5rem 0;
          overflow-x: auto;
        }

        .formula-variables {
          margin-top: 0.85rem;
          padding-top: 0.75rem;
          border-top: 1px dashed #cbd5e1;
          font-size: 0.825rem;
          color: #475569;
          line-height: 1.6;
        }

        .formula-example {
          margin-top: 0.85rem;
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-size: 0.825rem;
          color: #1e40af;
          line-height: 1.6;
        }

        /* TABELAS TÉCNICAS */
        .academic-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.85rem;
        }

        .academic-table th {
          background-color: #0f172a;
          color: #ffffff;
          padding: 0.65rem 0.85rem;
          font-weight: 700;
          text-align: left;
          border: 1px solid #0f172a;
        }

        .academic-table td {
          padding: 0.65rem 0.85rem;
          border: 1px solid #e2e8f0;
          vertical-align: top;
          color: #334155;
          line-height: 1.5;
        }

        .academic-table tr:nth-child(even) td {
          background-color: #f8fafc;
        }

        /* CITAÇÕES E HIGHLIGHTS */
        .academic-quote-block {
          border-left: 4px solid #0ea5e9;
          background-color: #f0fdf4;
          padding: 1.25rem 1.75rem;
          border-radius: 0 8px 8px 0;
          margin: 1.75rem 0;
          font-style: italic;
          color: #166534;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .methodology-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background-color: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background-color: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: monospace;
          margin-right: 0.4rem;
          margin-bottom: 0.4rem;
        }

        /* ESTRUTURA DE TELA */
        @media screen {
          .screen-header-bar {
            position: sticky;
            top: 0;
            z-index: 100;
            background-color: #0f172a;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.75rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          }

          .screen-main-layout {
            display: flex;
            max-width: 1560px;
            margin: 0 auto;
            min-height: calc(100vh - 60px);
          }

          /* Menu Lateral de Capítulos na Tela */
          .screen-sidebar {
            width: 320px;
            flex-shrink: 0;
            background-color: #0b1120;
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
            background-color: #070b13;
            overflow-y: auto;
          }

          .screen-paper-sheet {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
            padding: 4rem 4.5rem;
            box-sizing: border-box;
            color: #0f172a;
            max-width: 1080px;
            margin: 0 auto;
            min-height: 1050px;
          }

          /* Na tela: exibe apenas o capítulo ativo */
          .monograph-chapter-section {
            display: none;
          }
          .monograph-chapter-section.active-chapter {
            display: block;
            animation: fadeInChap 0.2s ease-out;
          }

          @keyframes fadeInChap {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        /* ESTRUTURA DE IMPRESSÃO (TCC / MONOGRAFIA EM FOLHAS A4) */
        @media print {
          @page {
            size: A4 portrait;
            margin: 18mm 18mm 18mm 18mm;
          }

          html, body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
            line-height: 1.6 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print,
          .screen-header-bar,
          .screen-sidebar,
          .screen-chapter-nav {
            display: none !important;
          }

          .memorial-app-container,
          .screen-main-layout,
          .screen-content-area {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .screen-paper-sheet {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          /* Na impressão: TODOS os capítulos são renderizados em sequência com quebra de página */
          .monograph-chapter-section {
            display: block !important;
            page-break-before: always !important;
            break-before: page !important;
            padding-top: 10mm !important;
            padding-bottom: 10mm !important;
          }

          .monograph-chapter-section:first-of-type {
            page-break-before: avoid !important;
            break-before: avoid !important;
            padding-top: 0 !important;
          }

          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .formula-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .academic-table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
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
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', letterSpacing: '-0.01em' }}>
                FluxoLean PRO
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(14, 165, 233, 0.25)',
                  color: '#38bdf8',
                  border: '1px solid rgba(14, 165, 233, 0.4)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                Trabalho Intelectual & Memorial
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>
              Autor: <strong>Mauricio Grigol</strong> • Monografia Técnica & Modelagem Matemática Industrial
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Capítulo {activeChapter + 1} de {chapters.length}</span>
          </div>

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
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
          >
            <Printer size={16} /> Imprimir Obra Completa (A4 / TCC)
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* ESTRUTURA PRINCIPAL: SIDEBAR + CONTEÚDO                                    */}
      {/* ========================================================================= */}
      <div className="screen-main-layout">
        {/* SIDEBAR DE CAPÍTULOS NA TELA */}
        <aside className="screen-sidebar no-print">
          <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Índice da Monografia
            </span>
            <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
              Navegação pelos Módulos
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
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
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 800 : 500,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <Icon size={16} color={isActive ? '#ffffff' : '#0ea5e9'} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chap.short}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.75rem',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>Dica de Leitura:</strong>
            Use este índice lateral para alternar rapidamente entre a lógica de cada tela, seus memoriais de cálculo e os conceitos Lean aplicados.
          </div>
        </aside>

        {/* ÁREA CENTRAL DO DOCUMENTO */}
        <main className="screen-content-area">
          <div className="screen-paper-sheet">
            {/* ================================================================= */}
            {/* CAPÍTULO 0: CAPA NOBRE & APRESENTAÇÃO DO AUTOR                     */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 0 ? 'active-chapter' : ''}`}>
              <div style={{ textAlign: 'center', borderBottom: '3px double #cbd5e1', paddingBottom: '2.5rem', paddingTop: '1.5rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    backgroundColor: '#0f172a',
                    color: '#38bdf8',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '1.75rem',
                  }}
                >
                  <Cpu size={18} color="#38bdf8" /> FLUXOLEAN INDUSTRIAL ECOSYSTEM
                </div>
                <p style={{ fontSize: '0.85rem', letterSpacing: '0.25em', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, margin: 0 }}>
                  MEMORIAL DESCRITIVO & CONCEPÇÃO METODOLÓGICA DA PLATAFORMA
                </p>
              </div>

              <div style={{ textAlign: 'center', margin: '3.5rem 0' }}>
                <span className="academic-subtitle">
                  Trabalho Monográfico de Engenharia de Processos & Governança Lean
                </span>

                <h1
                  className="memorial-serif"
                  style={{
                    fontSize: '2.35rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.25,
                    margin: '0 auto 1.5rem auto',
                    maxWidth: '860px',
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
                    maxWidth: '760px',
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
                  padding: '2.25rem 2.5rem',
                  margin: '2.5rem 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.45rem',
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
                      Mauricio Grigol
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
                      Especialista em Melhoria Contínua, Metodologia Lean & Arquitetura de Sistemas Operacionais
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, margin: '0 0 1rem 0', textAlign: 'justify' }}>
                  A idealização e o desenvolvimento do <strong>FluxoLean</strong> não surgiram em gabinetes teóricos, mas da experiência direta
                  nas trincheiras da manufatura. Conviver com o ruído das máquinas, a pressão por prazos de entrega e a constante busca pela eliminação
                  de perdas me ensinou uma verdade indelével: <em>a melhoria contínua só tem valor real se fizer a vida do operador mais digna,
                  o processo mais estável e os resultados contábeis auditáveis perante a diretoria executiva</em>.
                </p>

                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, margin: 0, textAlign: 'justify' }}>
                  Esta obra foi redigida para documentar com absoluta transparência a engenharia intelectual por trás de cada tela do sistema.
                  Não se trata apenas de código e telas; é a formalização de métodos de cálculo de Lead Time, filtragem de demandas operacionais,
                  rigor no método PDCA e conciliação de custos evitados que transformam o Lean de um ideal filosófico em uma disciplina matemática irrefutável.
                </p>
              </div>

              <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.75rem', marginTop: '3.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  CURITIBA — PARANÁ
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Publicação Monográfica Oficial de Engenharia Industrial • Versão 4.0 Multi-Tenant
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 1: PRÓLOGO & A GÊNESE DO FLUXOLEAN                       */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 1 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Fundamentação & Motivação</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Prólogo: A Gênese do FluxoLean e a Visão Sistêmica
                </h2>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                1. A Falácia da Melhoria Contínua Desconectada
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1.25rem' }}>
                Ao longo de mais de três décadas desde a difusão global do Sistema Toyota de Produção (TPS), a indústria mundial acumulou um histórico agridoce.
                De um lado, a inquestionável superioridade dos conceitos de fluxo contínuo, manutenção produtiva e respeito pelas pessoas; de outro,
                uma taxa alarmante de mortalidade de iniciativas Lean dentro de organizações maduras.
              </p>

              <div className="academic-quote-block">
                &quot;O maior gargalo de um sistema de manufatura enxuta não é a falta de ferramentas técnicas, mas a erosão da confiança provocada
                por relatórios de ganhos financeiros que nunca aparecem na DRE contábil da empresa.&quot;
              </div>

              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1.25rem' }}>
                O diagnóstico desse fenômeno revela causas estruturais bem conhecidas por quem atua no chão de fábrica:
              </p>

              <ul style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                <li>
                  <strong>Planilhas Excel Descentralizadas:</strong> Cada engenheiro ou agente de melhoria cria suas próprias fórmulas de cálculo de ROI.
                  As taxas horárias, encargos trabalhistas e critérios de sucata divergem, gerando desconfiança imediata da Controladoria.
                </li>
                <li>
                  <strong>O Abandono dos 3 Meses Pós-Projeto:</strong> Projetos comemorados com fotos e troféus internos sofrem o efeito ricochete:
                  assim que o agente de melhoria foca no próximo projeto, os operadores voltam ao método antigo por falta de padronização viva.
                </li>
                <li>
                  <strong>A Injustiça da Inércia Interdepartamental:</strong> Projetos com prazos estourados nos quais o agente é culpabilizado,
                  quando na verdade a ação estava paralisada há 45 dias aguardando compra de peças pelo setor de Suprimentos ou liberação de parada pela Manutenção.
                </li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                2. A Visão do FluxoLean: Da Operação ao Balanço Contábil
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
                O <strong>FluxoLean</strong> foi concebido para fechar essas lacunas de forma irreversível.
                Ele é o elo digital que integra a simplicidade de quem detecta uma trinca mecânica na linha de produção à segurança contábil
                do auditor que precisa comprovar a economia perante o Conselho de Administração.
                Nos capítulos a seguir, cada tela do sistema é dessecada metodologicamente, detalhando seus indicadores, métodos Lean e formulação matemática.
              </p>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 2: DASHBOARD EXECUTIVO & LEAD TIME                      */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 2 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Menu Principal • Módulo 1</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 1: Dashboard Executivo & Engenharia de Lead Time
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><BarChart3 size={12} /> Filosofia Mieruka (Gestão à Vista)</span>
                <span className="methodology-pill"><Clock size={12} /> Engenharia de Lead Time Total</span>
                <span className="methodology-pill"><ShieldCheck size={12} /> Defesa do Agente (Gargalos Externos)</span>
                <span className="tech-badge">Next.js App Router</span>
                <span className="tech-badge">SVG Vector Graphs</span>
                <span className="tech-badge">Reactivity Hooks</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                1.1 Lógica da Tela e Arquitetura de Informação
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                A tela do <strong>Dashboard Executivo</strong> é o centro nervoso da organização Lean.
                Ao entrar no sistema, o gestor não é inundado por tabelas frias; ele é recepcionado por um cockpit de comando estruturado em 3 blocos lógicos:
              </p>
              <ol style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.8, paddingLeft: '1.5rem', marginBottom: '1.25rem' }}>
                <li>
                  <strong>Barra Superior de Métricas Cardinais:</strong> Exibe os 4 pilares vitais: Total de Projetos em Andamento, Custo Evitado Aprovado Acumulado,
                  Taxa Média de Retorno sobre Investimento (ROI Líquido) e a Eficiência de Triagem de Demandas.
                </li>
                <li>
                  <strong>Pipeline do Fluxo PDCA:</strong> Um funil horizontal que quantifica visualmente os projetos nas 4 fases (Plan, Do, Check, Act)
                  e sua etapa final de Homologação pela Controladoria.
                </li>
                <li>
                  <strong>Painel Duplo de Engenharia de Lead Time:</strong>
                  Substituindo a antiga análise estática de retorno, o painel exibe:
                  (a) <em>Gráfico de Lead Time por Etapa do PDCA</em> (Plan, Do, Check, Controladoria), permitindo visualizar a média geral e a média de cada agente;
                  (b) <em>Gráfico de Impacto de Dependências Externas (Defesa do Agente)</em>, segregando quanto tempo o projeto gastou em mãos de setores parceiros
                  (Compras, Manutenção, T.I., Engenharia, Controladoria).
                </li>
              </ol>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                1.2 Indicadores Apresentados e Sua Finalidade Estratégica
              </h3>
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Indicador (KPI)</th>
                    <th>Unidade</th>
                    <th>Finalidade Estratégica</th>
                    <th>Decisão Habilitada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Custo Evitado Consolidado</strong></td>
                    <td>R$ (BRL)</td>
                    <td>Demonstrar o valor financeiro real gerado por melhorias que passaram pelo crivo formal da Controladoria.</td>
                    <td>Prestação de contas para diretoria e alocação de bônus por desempenho de melhoria contínua.</td>
                  </tr>
                  <tr>
                    <td><strong>Lead Time Médio Geral</strong></td>
                    <td>Dias Corridos</td>
                    <td>Avaliar a velocidade de resposta da fábrica em transformar um problema diagnosticado em solução implementada e auditada.</td>
                    <td>Identificar lentidão burocrática no ciclo de inovação de processos da planta.</td>
                  </tr>
                  <tr>
                    <td><strong>Lead Time por Agente</strong></td>
                    <td>Dias Corridos</td>
                    <td>Medir a agilidade de condução de projetos de cada líder Lean individualmente.</td>
                    <td>Reconhecimento de mérito e direcionamento de mentoria individual.</td>
                  </tr>
                  <tr>
                    <td><strong>Índice de Dependência Externa (Φ)</strong></td>
                    <td>Percentual (%)</td>
                    <td>Medir a parcela do tempo do projeto em que a ação esteve travada por departamentos terceiros.</td>
                    <td><strong>Defesa do Agente:</strong> Cobrança interdepartamental da Diretoria sobre setores que atrasam o Lean.</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                1.3 Metodologia Lean & Conceitos Empregados
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                O Dashboard incorpora os princípios do <strong>Mieruka</strong> (Gestão à Vista) e do <strong>Andon</strong> executivo.
                Um problema não pode permanecer oculto em relatórios semanais. Ao decompor o tempo por fase do PDCA, o sistema aplica
                a lógica do <em>Value Stream Mapping (VSM)</em> ao próprio processo de melhoria: o tempo em que o projeto está parado aguardando
                uma cotação de compras é um <strong>Muda de Espera</strong> do sistema de gestão.
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                1.4 Memorial de Cálculo Minucioso dos Indicadores do Dashboard
              </h3>

              {/* Formula 1.1 */}
              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 1.1 — Lead Time Ativo de Ciclo do Projeto (LT_ativo)
                </div>
                <div className="formula-expression">
                  LT_ativo = t_Plan + t_Do + t_Check + t_Controladoria
                </div>
                <div className="formula-variables">
                  <strong>Definição das Variáveis:</strong><br />
                  • <code>t_Plan</code>: Intervalo em dias corridos desde a aprovação na Triagem até o encerramento do diagnóstico e plano de ação.<br />
                  • <code>t_Do</code>: Dias em execução do plano 5W2H e testes piloto no chão de fábrica.<br />
                  • <code>t_Check</code>: Dias de coleta de métricas de capabilidade e apuração preliminar das 7 fontes de custo evitado.<br />
                  • <code>t_Controladoria</code>: Dias corridos entre o envio formal à Controladoria e a decisão (homologação ou parecer).<br />
                  <span style={{ color: '#0369a1', fontWeight: 700 }}>
                    * Observação Metodológica: O período de 3 meses de acompanhamento pós-conclusão é estritamente passivo e NÃO compõe o Lead Time ativo de ciclo.
                  </span>
                </div>
                <div className="formula-example">
                  <strong>Exemplo Prático Industrial:</strong><br />
                  Projeto de Otimização de Setup da Linha de Tecelagem:<br />
                  t_Plan = 12 dias | t_Do = 20 dias | t_Check = 8 dias | t_Controladoria = 4 dias.<br />
                  <strong>LT_ativo = 12 + 20 + 8 + 4 = 44 dias corridos.</strong>
                </div>
              </div>

              {/* Formula 1.2 */}
              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 1.2 — Defesa do Agente e Taxa de Impacto Externo (Φ)
                </div>
                <div className="formula-expression">
                  LT_ativo = LT_Agente + Σ LT_Setores_Externos
                  <br />
                  Taxa de Impacto Externo (Φ) = ( Σ LT_Setores_Externos / LT_ativo ) × 100%
                </div>
                <div className="formula-variables">
                  <strong>Desdobramento da Equação:</strong><br />
                  • <code>LT_Agente</code>: Tempo efetivo gasto em tarefas sob governança direta do líder do projeto (investigação, Ishikawa, POP).<br />
                  • <code>Σ LT_Setores_Externos</code>: Somatório dos tempos em que ações do 5W2H estiveram atribuídas a outros departamentos.<br />
                  • <code>Φ</code>: Percentual de dilatação temporal imposta por gargalos externos ao agente.
                </div>
                <div className="formula-example">
                  <strong>Exemplo de Aplicação Real:</strong><br />
                  Dos 44 dias totais do projeto acima:<br />
                  - Ação de Usinagem de Guia (Setor Manutenção Mecânica): demorou 18 dias.<br />
                  - Cotação e Compra de Cilindro Pneumático (Setor Compras): demorou 14 dias.<br />
                  - Tempo em governança pura do Agente Lean: 12 dias.<br />
                  Σ LT_Setores_Externos = 18 + 14 = 32 dias.<br />
                  <strong>Φ = (32 / 44) × 100% = 72,7% de dependência externa.</strong><br />
                  <em>Conclusão do Relatório:</em> O agente conduziu sua parte em apenas 12 dias (27,3% do tempo). O atraso de 32 dias decorreu da fila dos setores de suporte.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 3: TRIAGEM INDUSTRIAL & MATRIZ GUT                       */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 3 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Menu de Entrada • Módulo 2</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 2: Triagem Industrial & Matriz GUT
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><Filter size={12} /> Funil Estratégico de Demandas</span>
                <span className="methodology-pill"><BarChart3 size={12} /> Matriz GUT de Priorização</span>
                <span className="methodology-pill"><Lightbulb size={12} /> Segregação Kaizen vs PDCA</span>
                <span className="tech-badge">Image Compression</span>
                <span className="tech-badge">Multi-Criteria Sorting</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                2.1 Lógica da Tela e Arquitetura de Entrada
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                A tela de <strong>Triagem</strong> resolve o desafio de democratizar as contribuições sem afogar a engenharia.
                A interface apresenta uma lista de cartões com as sugestões submetidas pelos colaboradores através do Canal Kaizen e formulários de chão de fábrica.
                Cada cartão exibe a foto do problema, o setor fabril de origem, o relato da dor e a data de submissão.
              </p>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                O coordenador Lean abre o modal de análise de triagem e atribui as notas de Gravidade, Urgência e Tendência.
                O sistema calcula em tempo real o <strong>Score GUT</strong> e sugere o direcionamento:
                (a) <em>Aprovar como Projeto PDCA</em> (alocando agente e abrindo protocolo auditável);
                (b) <em>Despachar como Ação Rápida Kaizen</em> (resolução direta sem necessidade de 4 fases);
                (c) <em>Arquivar com Feedback Construtivo</em> (evitando desmotivar o colaborador).
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                2.2 Critérios de Pontuação e Escala da Matriz GUT
              </h3>
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Nota</th>
                    <th>Gravidade (G) — Magnitude do Dano</th>
                    <th>Urgência (U) — Pressão Temporal</th>
                    <th>Tendência (T) — Propensão de Piora</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>1</strong></td>
                    <td>Sem impacto perceptível em custo, segurança ou entrega.</td>
                    <td>Pode aguardar ciclo anual sem prejuízo.</td>
                    <td>Estável; não irá se agravar ao longo do tempo.</td>
                  </tr>
                  <tr>
                    <td><strong>2</strong></td>
                    <td>Dano leve; desconforto operacional sem perda financeira.</td>
                    <td>Pode ser avaliado no próximo trimestre.</td>
                    <td>Degradação lenta e quase imperceptível.</td>
                  </tr>
                  <tr>
                    <td><strong>3</strong></td>
                    <td>Dano moderado; retrabalho interno pontual &lt; R$ 5.000.</td>
                    <td>Exige ação em até 30 dias para evitar acúmulo.</td>
                    <td>Piora gradual previsível se nada for feito.</td>
                  </tr>
                  <tr>
                    <td><strong>4</strong></td>
                    <td>Dano grave; quebra recorrente, perda de matéria-prima.</td>
                    <td>Exige ação nas próximas 48 a 72 horas.</td>
                    <td>Piora acelerada com risco de parada parcial de linha.</td>
                  </tr>
                  <tr>
                    <td><strong>5</strong></td>
                    <td>Dano gravíssimo; risco à vida humana, passivo ambiental ou perda &gt; R$ 50k.</td>
                    <td>Parada total imediata de linha ou cliente desabastecido.</td>
                    <td>Degradação exponencial imediata e catastrófica.</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                2.3 Memorial de Cálculo do Score GUT e Algoritmo de Decisão
              </h3>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 2.1 — Índice de Prioridade de Demanda (Score GUT)
                </div>
                <div className="formula-expression">
                  Score GUT = G × U × T &nbsp;&nbsp;&nbsp;&nbsp;(onde G, U, T ∈ [1, 2, 3, 4, 5])
                  <br />
                  Intervalo Numérico: 1 ≤ Score GUT ≤ 125
                </div>
                <div className="formula-variables">
                  <strong>Regra de Classificação Algorítmica no FluxoLean:</strong><br />
                  • <code>Score GUT ≥ 64</code>: <strong>Alta Prioridade</strong> ➔ Recomendação automática de abertura de <em>Projeto PDCA Estruturado</em>.<br />
                  • <code>27 ≤ Score GUT &lt; 64</code>: <strong>Média Prioridade</strong> ➔ Avaliação de viabilidade técnica ou encaminhamento como <em>Ação Kaizen de Setor</em>.<br />
                  • <code>Score GUT &lt; 27</code>: <strong>Baixa Prioridade</strong> ➔ Manutenção rotineira ou arquivamento com devolutiva ao autor.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Comparativo Real:</strong><br />
                  <em>Demanda A (Vazamento de óleo na prensa principal com risco de queda de operador):</em><br />
                  G = 5 (risco à integridade física) | U = 5 (imediato) | T = 4 (risco constante de expansão).<br />
                  <strong>Score GUT = 5 × 5 × 4 = 100 ➔ Abertura Imediata de Projeto PDCA.</strong><br /><br />
                  <em>Demanda B (Sugestão de troca de modelo de lixeira do refeitório):</em><br />
                  G = 1 | U = 1 | T = 1 ➔ <strong>Score GUT = 1 ➔ Encaminhamento ao setor de Facilities.</strong>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 4: PROJETOS PDCA EM 4 FASES & RELATÓRIO A3               */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 4 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Motor Metodológico Central • Módulo 3</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 3: Projetos PDCA em 4 Fases & Relatório A3 Executivo
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><Layers size={12} /> Ciclo PDCA Rigoroso</span>
                <span className="methodology-pill"><Award size={12} /> Ishikawa 6M & Pareto 80/20</span>
                <span className="methodology-pill"><FileText size={12} /> Relatório A3 Toyota Paisagem</span>
                <span className="methodology-pill"><CheckCircle2 size={12} /> Replicação Lateral Yokoten</span>
                <span className="tech-badge">Gated Workflow</span>
                <span className="tech-badge">Print CSS Landscape</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                3.1 Lógica da Tela e Estrutura dos Portões de Qualidade (Gates)
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                O workspace do projeto no FluxoLean é blindado contra superficialidades. O agente não pode avançar etapas
                sem o preenchimento comprovado de cada ferramenta essencial. A navegação ocorre por 4 abas estruturadas:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', margin: '1.25rem 0' }}>
                <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '8px', padding: '1.15rem' }}>
                  <strong style={{ color: '#1d4ed8', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <Search size={16} /> 1. PLAN (Planejar & Diagnosticar)
                  </strong>
                  <p style={{ fontSize: '0.825rem', color: '#1e40af', lineHeight: 1.6, margin: 0 }}>
                    Linha de base temporal e métrica inicial. Construção do Diagrama de Ishikawa 6M interativo,
                    estratificação de Pareto 80/20 com cálculo cumulativo e encadeamento dos 5 Porquês até a causa-raiz inescapável.
                  </p>
                </div>

                <div style={{ backgroundColor: '#fefce8', border: '1.5px solid #fde047', borderRadius: '8px', padding: '1.15rem' }}>
                  <strong style={{ color: '#a16207', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <Zap size={16} /> 2. DO (Executar & Prototipar)
                  </strong>
                  <p style={{ fontSize: '0.825rem', color: '#854d0e', lineHeight: 1.6, margin: 0 }}>
                    Matriz 5W2H com What, Why, Where, When, Who, How e How Much. Obrigatoriedade de atribuição do <em>Setor Corresponsável</em>
                    (suporte para Defesa do Agente), acompanhamento de despesas reais incorridas e registro de testes pilotos.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: '8px', padding: '1.15rem' }}>
                  <strong style={{ color: '#6d28d9', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <CheckSquare size={16} /> 3. CHECK (Verificar & Auditar)
                  </strong>
                  <p style={{ fontSize: '0.825rem', color: '#5b21b6', lineHeight: 1.6, margin: 0 }}>
                    Confronto fotográfico de Antes vs Depois, cálculo de variação percentual de performance (Δ%),
                    apuração nas 7 fontes de custo evitado e upload mandatório de planilha com a memória de cálculo para a Controladoria.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '1.15rem' }}>
                  <strong style={{ color: '#15803d', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <Award size={16} /> 4. ACT (Padronizar & Replicar)
                  </strong>
                  <p style={{ fontSize: '0.825rem', color: '#166534', lineHeight: 1.6, margin: 0 }}>
                    Formalização de Procedimento Operacional Padrão (POP), registro de treinamento de operadores, dispositivos à prova de erros (Poka-Yoke)
                    e catálogo de lições aprendidas para disseminação horizontal (Yokoten).
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                3.2 O Relatório A3 Executivo como Síntese de Fé Pública
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                Em qualquer fase do projeto, o sistema gera o <strong>Relatório A3 PDCA</strong> em visualização paisagem.
                Em conformidade com a tradição da Toyota e de John Shook, a folha A3 reúne o título, protocolo, problema no Gemba, diagrama de Ishikawa,
                plano de ação 5W2H, memória financeira de ROI e o selo de homologação contábil — permitindo que o Diretor Industrial compreenda
                um projeto multimilionário em menos de 3 minutos de leitura.
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                3.3 Memorial de Cálculo do Pareto 80/20 e Variação de Performance
              </h3>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 3.1 — Frequência Relativa e Acumulada de Pareto (Princípio 80/20)
                </div>
                <div className="formula-expression">
                  Frequência Relativa (fr_i) = ( Ocorrências_i / Σ Total_Ocorrências ) × 100%
                  <br />
                  Frequência Acumulada (Fa_k) = Σ_&#123;i=1&#125;^&#123;k&#125; fr_i
                </div>
                <div className="formula-variables">
                  <strong>Critério de Corte Pareto no FluxoLean:</strong><br />
                  O sistema ordena automaticamente as causas do Ishikawa por ordem decrescente de ocorrências.
                  As causas cuja <code>Fa_k ≤ 80%</code> são demarcadas com tag vermelha <em>&quot;Poucos Vitais (Ataque Mandatório no 5W2H)&quot;</em>,
                  enquanto as causas acima de 80% são classificadas como <em>&quot;Muitos Triviais&quot;</em>.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real em Tecelagem (Total de 250 paradas analisadas no mês):</strong><br />
                  1. Quebra de Fio na Guia: 140 paradas (56%) ➔ Acumulado = 56%<br />
                  2. Desalinhamento do Rolete: 65 paradas (26%) ➔ Acumulado = 82%<br />
                  3. Falha de Sensor Óptico: 25 paradas (10%) ➔ Acumulado = 92%<br />
                  4. Outros ruídos menores: 20 paradas (8%) ➔ Acumulado = 100%<br />
                  <em>Ação do FluxoLean:</em> O plano 5W2H concentra 100% dos recursos nas Causas 1 e 2, que representam 82% das perdas da linha.
                </div>
              </div>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 3.2 — Variação Percentual de Eficiência do Processo (Δ%)
                </div>
                <div className="formula-expression">
                  Δ% = ( [ Métrica_Depois - Métrica_Antes ] / Métrica_Antes ) × 100%
                </div>
                <div className="formula-variables">
                  Para métricas onde menor é melhor (ex: refugo, tempo de parada, quebras), o ganho real de redução é invertido para expressar a melhoria percentual positiva conquistada.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 5: ENGENHARIA FINANCEIRA & CUSTOS EVITADOS               */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 5 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Modelagem Matemática & ROI • Módulo 4</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 4: Engenharia Financeira & As 7 Fontes de Custo Evitado
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><DollarSign size={12} /> Lean Accounting</span>
                <span className="methodology-pill"><Calculator size={12} /> 7 Fontes Canônicas de Custo Evitado</span>
                <span className="methodology-pill"><TrendingUp size={12} /> Payback Amortizado & ROI Líquido</span>
                <span className="tech-badge">Clean Numeric Inputs</span>
                <span className="tech-badge">Mandatory Proof Upload</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                4.1 A Ruptura com os &quot;Ganhos Fictícios&quot; e a Exigência de Memória de Cálculo
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                A maior patologia de projetos industriais é a apresentação de economias baseadas em premissas frágeis.
                Afirmar que &quot;economizou-se 15 minutos de um operador&quot; não representa ganho algum se essas horas não foram convertidas em maior produção
                em um gargalo ou na eliminação direta de horas extras remuneradas.
              </p>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                No FluxoLean, cada centavo reportado deve ser categorizado em uma das <strong>7 Fontes Canônicas de Custo Evitado Lean</strong>.
                Além disso, para qualquer ganho superior a zero, o sistema exige compulsoriamente a descrição das premissas e o anexo
                do arquivo de planilha eletrônica (Excel, CSV ou PDF) contendo a memória de cálculo detalhada com fórmulas abertas.
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                4.2 Formulação Matemática Detalhada das 7 Fontes de Custo Evitado
              </h3>

              {/* Fonte 1 */}
              <div className="formula-card">
                <div className="formula-title">
                  1. Mão de Obra Direta (MOD)
                </div>
                <div className="formula-expression">
                  ΔCusto MOD = ( Horas_Reduzidas_Ano ) × [ Salário_Hora_Base × ( 1 + Encargos_Sociais ) ]
                </div>
                <div className="formula-variables">
                  <strong>Regra Contábil Estrita:</strong> Só pode ser contabilizado se as horas liberadas resultarem em:
                  (a) eliminação física de turnos ou contratos temporários; ou (b) realocação comprovada do operador para posto vago que exigiria nova contratação.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real:</strong> Liberação de 1 operador que realizava embalagem manual, realocado para posto vago na extrusão.<br />
                  Horas ano = 2.200 h | Salário base = R$ 15,00/h | Encargos = 80% (fator 1,80).<br />
                  <strong>ΔCusto MOD = 2.200 × (15 × 1,80) = R$ 59.400,00 / ano.</strong>
                </div>
              </div>

              {/* Fonte 2 */}
              <div className="formula-card">
                <div className="formula-title">
                  2. Perda de Material / Refugo Fabril
                </div>
                <div className="formula-expression">
                  ΔRefugo = ( Qtd_Sucata_Antes - Qtd_Sucata_Depois ) × [ Custo_Unit_MP - Valor_Residual_Venda_Sucata ]
                </div>
                <div className="formula-variables">
                  Mede a economia líquida de matéria-prima que deixou de ser destruída ou degradada no processo produtivo.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real em Extrusão de Plástico:</strong> Redução de 1.500 kg/mês para 300 kg/mês de aparas contaminadas.<br />
                  Economia anual = (1.500 - 300) × 12 = 14.400 kg/ano.<br />
                  Custo da resina virgem = R$ 8,50/kg | Venda como sucata moída = R$ 1,50/kg.<br />
                  <strong>ΔRefugo = 14.400 × (8,50 - 1,50) = R$ 100.800,00 / ano.</strong>
                </div>
              </div>

              {/* Fonte 3 */}
              <div className="formula-card">
                <div className="formula-title">
                  3. Capacidade Adicional no Gargalo (Throughput / Teoria das Restrições)
                </div>
                <div className="formula-expression">
                  ΔThroughput = ΔPeças_Gargalo_Ano × [ Preço_Venda_Unitário - Custo_Totalmente_Variável (TVC) ]
                </div>
                <div className="formula-variables">
                  Baseado na Teoria das Restrições (TOC - Eliyahu Goldratt). Apenas melhorias executadas no <strong>Gargalo Operacional</strong> geram ganho de Throughput,
                  pois aumentam o faturamento total da fábrica sem acréscimo de despesas operacionais fixas.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real no Tear Circular (Restrição da Fábrica):</strong> Aumento de 50.000 metros de tecido/ano.<br />
                  Preço de venda = R$ 4,00/m | Custo de matéria-prima e insumos diretos (TVC) = R$ 2,20/m.<br />
                  Margem de contribuição líquida = R$ 1,80/m.<br />
                  <strong>ΔThroughput = 50.000 × 1,80 = R$ 90.000,00 / ano.</strong>
                </div>
              </div>

              {/* Fonte 4 */}
              <div className="formula-card">
                <div className="formula-title">
                  4. Eficiência Energética & Utilidades
                </div>
                <div className="formula-expression">
                  ΔEnergia = ( ΔConsumo_kWh_Ano × Tarifa_Efetiva_kWh ) + ( ΔVazão_Ar_Comprimido × Custo_m3_Ar )
                </div>
                <div className="formula-variables">
                  Mede a redução no consumo de energia elétrica de motores, compressores de ar comprimido, vapor de caldeiras ou gás natural.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real em Inversor de Frequência de Exaustor:</strong> Redução de 35 kW de potência contínua em regime 24/7 (8.000 h/ano).<br />
                  Consumo evitado = 35 × 8.000 = 280.000 kWh/ano.<br />
                  Tarifa média industrial com bandeira e impostos = R$ 0,65/kWh.<br />
                  <strong>ΔEnergia = 280.000 × 0,65 = R$ 182.000,00 / ano.</strong>
                </div>
              </div>

              {/* Fonte 5 */}
              <div className="formula-card">
                <div className="formula-title">
                  5. Consumíveis & Insumos Operacionais
                </div>
                <div className="formula-expression">
                  ΔConsumíveis = ( Consumo_Unit_Antes - Consumo_Unit_Depois ) × Produção_Anual × Preço_Unit_Insumo
                </div>
                <div className="formula-variables">
                  Aplica-se a ferramentas de corte, óleos lubrificantes, pallets, fita adesiva, filme stretch e embalagens.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real em Embalagem com Filme Stretch:</strong> Redução de 120g para 80g de filme por pallet.<br />
                  Produção da fábrica = 80.000 pallets/ano | Redução = 0,040 kg/pallet = 3.200 kg de filme/ano.<br />
                  Preço do filme stretch = R$ 16,00/kg.<br />
                  <strong>ΔConsumíveis = 3.200 × 16,00 = R$ 51.200,00 / ano.</strong>
                </div>
              </div>

              {/* Fonte 6 */}
              <div className="formula-card">
                <div className="formula-title">
                  6. Horas Extras Fabris Eliminadas
                </div>
                <div className="formula-expression">
                  ΔHoras_Extras = Σ Horas_Extras_Eliminadas × [ Salário_Hora × ( 1 + Adicional_HE ) × ( 1 + Encargos ) ]
                </div>
                <div className="formula-variables">
                  Impacto imediato e direto no fluxo de caixa pela eliminação de turnos extras de sábado e domingo para compensar ineficiências.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real:</strong> Eliminação de 2 finais de semana de hora extra no mês (16 horas/mês × 10 operadores = 1.920 horas extras/ano).<br />
                  Salário hora = R$ 14,00 | Adicional 50% (fator 1,5) | Encargos 80% (fator 1,8).<br />
                  Custo da hora extra = 14 × 1,5 × 1,8 = R$ 37,80/h.<br />
                  <strong>ΔHoras_Extras = 1.920 × 37,80 = R$ 72.576,00 / ano.</strong>
                </div>
              </div>

              {/* Fonte 7 */}
              <div className="formula-card">
                <div className="formula-title">
                  7. Retrabalho Interno & Não-Conformidades
                </div>
                <div className="formula-expression">
                  ΔRetrabalho = Lotes_Reprocessados_Evitados × [ Horas_Desmontagem × Custo_HH + Insumos_Perdidos ]
                </div>
                <div className="formula-variables">
                  Elimina o custo oculto da &quot;fábrica fantasma&quot;: operadores dedicados exclusivamente a consertar produtos defeituosos.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real:</strong> Redução de 40 lotes retrabalhados/ano para zero por meio de Poka-Yoke de montagem.<br />
                  Cada lote demandava 25 horas de reoperação (Custo R$ 25,00/h) + R$ 300,00 de componentes descartados.<br />
                  Custo por lote = (25 × 25) + 300 = R$ 925,00.<br />
                  <strong>ΔRetrabalho = 40 × 925,00 = R$ 37.000,00 / ano.</strong>
                </div>
              </div>

              {/* Payback e ROI */}
              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 4.2 — Economia Líquida, Retorno sobre Investimento (ROI) e Payback
                </div>
                <div className="formula-expression">
                  Custo_Evitado_Bruto = Σ_&#123;i=1&#125;^7 Fonte_i
                  <br />
                  Economia Líquida (R$) = Custo_Evitado_Bruto - Investimento_Total_Projeto
                  <br />
                  ROI (%) = ( Economia Líquida / Investimento_Total_Projeto ) × 100%
                  <br />
                  Payback Simples (Meses) = ( Investimento_Total_Projeto / [ Custo_Evitado_Bruto / 12 ] )
                </div>
                <div className="formula-example">
                  <strong>Demonstração Consolidada do Caso Real:</strong><br />
                  Soma dos Ganhos Brutos Anuais = R$ 59.400 + R$ 100.800 + R$ 90.000 + R$ 182.000 + R$ 51.200 + R$ 72.576 + R$ 37.000 = <strong>R$ 592.976,00 / ano</strong>.<br />
                  Investimento Total (Aquisição de Inversor + Dispositivos Poka-Yoke + Treinamentos) = <strong>R$ 85.000,00</strong>.<br />
                  • <strong>Economia Líquida no 1º Ano = R$ 592.976 - R$ 85.000 = R$ 507.976,00.</strong><br />
                  • <strong>ROI Líquido = (507.976 / 85.000) × 100% = 597,6%.</strong><br />
                  • <strong>Payback Amortizado = 85.000 / (592.976 / 12) = 1,72 meses (~52 dias de retorno total do capital).</strong>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 6: GOVERNANÇA CONTÁBIL & AUDITORIA CONTROLADORIA        */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 6 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Auditoria & Fé Pública • Módulo 5</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 5: Governança Contábil & Auditoria da Controladoria
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><ShieldCheck size={12} /> Fé Pública Contábil</span>
                <span className="methodology-pill"><GitPullRequest size={12} /> Token Criptográfico Escopado</span>
                <span className="methodology-pill"><Clock size={12} /> Ciclo de Validação dos 3 Meses</span>
                <span className="tech-badge">Public Token Portal</span>
                <span className="tech-badge">Audit Trail Logs</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                5.1 Lógica da Tela do Portal de Auditoria
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                A rota pública e segura <code>/controladoria/auditoria/[token]</code> foi desenvolvida para desatar o nó entre
                a engenharia e a controladoria. Quando o agente submete o projeto concluído na fase CHECK, o sistema gera
                um token de acesso único criptografado e dispara notificação automática por e-mail para a equipe financeira.
              </p>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                No portal, o auditor acessa:
                (a) Tabela comparativa com os valores propostos em cada uma das 7 fontes;
                (b) Botão de download direto da planilha de memória de cálculo enviada pelo agente;
                (c) Campos numéricos limpos para digitação dos valores homologados pelo auditor;
                (d) Botão para anexo opcional de contra-memória de cálculo corrigida pela Controladoria;
                (e) Campo de parecer técnico mandatório quando houver alteração ou rejeição.
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                5.2 O Triplo Poder do Auditor da Controladoria
              </h3>
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Decisão do Auditor</th>
                    <th>Ação no Sistema</th>
                    <th>Impacto no Projeto</th>
                    <th>Regra de Anexo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Homologação Integral (1 Clique)</strong></td>
                    <td>O auditor concorda 100% com a memória apresentada e chancela os números.</td>
                    <td>Projeto promovido ao status <em>Homologado Master</em> com carimbo contábil no A3.</td>
                    <td>Anexo dispensado; aproveita-se integralmente a planilha do agente.</td>
                  </tr>
                  <tr>
                    <td><strong>Homologação com Ajustes</strong></td>
                    <td>O auditor altera valores pontuais (ex: adota taxa horária mais conservadora).</td>
                    <td>Os valores da DRE são corrigidos automaticamente; parecer é gravado no histórico.</td>
                    <td>O auditor pode opcionalmente anexar uma nova planilha revisada pela Controladoria.</td>
                  </tr>
                  <tr>
                    <td><strong>Rejeição com Devolução</strong></td>
                    <td>O auditor identifica erro metodológico grave e recusa a chancelar os ganhos.</td>
                    <td>O projeto volta para a fase CHECK do agente com parecer detalhado de correção.</td>
                    <td>O agente é obrigado a retificar as fórmulas e submeter novamente.</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                5.3 A Regra dos 3 Meses de Acompanhamento (Sustentação do Padrão)
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', margin: 0 }}>
                Para evitar que a economia seja um &quot;fogo de palha&quot;, o FluxoLean institui a <strong>Fase de Estabilização</strong>.
                Após a homologação contábil, o projeto permanece aberto durante 90 dias em monitoramento.
                A cada 30 dias (Mês 1, Mês 2 e Mês 3), o agente deve coletar e registrar a produção e refugo reais do Gemba.
                Somente após a consolidação dos 3 meses sem desvios, o projeto recebe o selo ouro de <em>Conclusão Definitiva de Ciclo</em>.
              </p>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 7: TPM, 5S & MAXIMIZAÇÃO DE OEE                          */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 7 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Confiabilidade & Manutenção • Módulo 6</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 6: TPM & Gestão Autônoma 5S (OEE e Anomalias)
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><Cpu size={12} /> 8 Pilares de Nakajima (TPM)</span>
                <span className="methodology-pill"><BarChart3 size={12} /> Eficiência Global (OEE)</span>
                <span className="methodology-pill"><CheckCircle2 size={12} /> Cartões de Anomalia 5S</span>
                <span className="tech-badge">Mobile-Ready Camera</span>
                <span className="tech-badge">MTBF & MTTR Engines</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                6.1 Lógica da Tela e a Filosofia do Operador Mantenedor
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                O módulo de TPM conecta a manutenção especializada à operação diária. O operador de linha abre a tela no celular
                ou quiosque da fábrica e registra microanomalias com foto e geolocalização da máquina.
                O sistema gerencia as etiquetas físicas e digitais através de um quadro kanban de anomalias:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', margin: '1.25rem 0' }}>
                <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #f87171', borderRadius: '8px', padding: '1rem' }}>
                  <strong style={{ color: '#991b1b', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    🔴 Etiqueta Vermelha (Manutenção Mecânica/Elétrica)
                  </strong>
                  <p style={{ fontSize: '0.8rem', color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
                    Falhas que demandam desenergização de segurança (LOTO), reposição de peças de desgaste ou ferramentas de precisão.
                    Gera ordem de serviço preventiva com prioridade alta.
                  </p>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #60a5fa', borderRadius: '8px', padding: '1rem' }}>
                  <strong style={{ color: '#1e40af', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    🔵 Etiqueta Azul (Manutenção Autônoma 5S)
                  </strong>
                  <p style={{ fontSize: '0.8rem', color: '#1e3a8a', margin: 0, lineHeight: 1.5 }}>
                    Ações de limpeza profunda, reaperto de conexões, lubrificação básica e 5S resolvidas pelo próprio operador de máquina
                    em reuniões de 10 minutos de início de turno.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                6.2 Memorial de Cálculo do OEE Fabril e as 6 Grandes Perdas
              </h3>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 6.1 — Índice de Eficiência Global do Equipamento (OEE)
                </div>
                <div className="formula-expression">
                  OEE = Disponibilidade (D) × Desempenho (P) × Qualidade (Q)
                  <br /><br />
                  D = Tempo_Operacional / Tempo_Carga = ( Tempo_Carga - Paradas ) / Tempo_Carga
                  <br />
                  P = ( Tempo_Ciclo_Ideal × Produção_Total ) / Tempo_Operacional
                  <br />
                  Q = Peças_Boas / Produção_Total = ( Produção_Total - Refugos ) / Produção_Total
                </div>
                <div className="formula-variables">
                  <strong>Relação com as 6 Grandes Perdas do TPM:</strong><br />
                  • <em>Perdas de Disponibilidade:</em> 1. Quebras Mecânicas; 2. Troca de Ferramental e Setup.<br />
                  • <em>Perdas de Desempenho:</em> 3. Pequenas Paradas (&lt; 5 min); 4. Operação em Velocidade Reduzida.<br />
                  • <em>Perdas de Qualidade:</em> 5. Defeitos no Processo e Refugo; 6. Perdas de Inicialização de Turno.
                </div>
                <div className="formula-example">
                  <strong>Exemplo Real em Linha de Produção Contínua (Turno de 8 horas = 480 minutos):</strong><br />
                  - Tempo de Carga = 480 min | Paradas de Manutenção e Setup = 60 min ➔ Tempo Operacional = 420 min.<br />
                  ➔ <strong>Disponibilidade (D) = 420 / 480 = 0,875 (87,5%)</strong>.<br />
                  - Ritmo ideal = 10 peças/minuto. Em 420 min, capacidade teórica = 4.200 peças. Produção real = 3.780 peças.<br />
                  ➔ <strong>Desempenho (P) = 3.780 / 4.200 = 0,900 (90,0%)</strong>.<br />
                  - Das 3.780 peças produzidas, 189 peças foram refugadas por defeito ➔ Peças boas = 3.591 peças.<br />
                  ➔ <strong>Qualidade (Q) = 3.591 / 3.780 = 0,950 (95,0%)</strong>.<br />
                  <strong>OEE Final = 0,875 × 0,900 × 0,950 = 0,748 (74,8%).</strong>
                </div>
              </div>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 6.2 — Confiabilidade Operacional (MTBF e MTTR)
                </div>
                <div className="formula-expression">
                  MTBF (Tempo Médio Entre Falhas) = Tempo_Total_Operando / Número_de_Falhas
                  <br />
                  MTTR (Tempo Médio de Reparo) = Tempo_Total_em_Reparo / Número_de_Falhas
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 8: DESENVOLVIMENTO HUMANO & ACADEMIA LEAN                */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 8 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Pessoas & Cultura • Módulo 7</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 7: Desenvolvimento Humano, Academia Lean & Assessment 360°
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><GraduationCap size={12} /> Monozukuri wa Hitozukuri</span>
                <span className="methodology-pill"><Award size={12} /> Trilha de Belts Progressiva</span>
                <span className="methodology-pill"><TrendingUp size={12} /> Radar de Maturidade 360°</span>
                <span className="tech-badge">Online Exam Engine</span>
                <span className="tech-badge">Radar Chart SVG</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                7.1 O Princípio &quot;Antes de Construir Produtos, Formamos Pessoas&quot;
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                O aforismo japonês <em>&quot;Monozukuri wa Hitozukuri&quot;</em> sintetiza a convicção de que nenhuma fábrica supera
                a capacidade mental de seus operadores e líderes. O FluxoLean integra uma plataforma nativa de capacitação
                (<strong>Academia Lean</strong>) e um motor de avaliação contínua (<strong>Assessment 360°</strong>).
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                7.2 A Trilha de Belts e Critérios de Concessão
              </h3>
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Graduação</th>
                    <th>Perfil Funcional</th>
                    <th>Escopo de Ferramentas Dominadas</th>
                    <th>Exigência para Certificação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>White Belt</strong></td>
                    <td>Operadores de Máquina e Auxiliares</td>
                    <td>Conceito dos 8 Desperdícios, 5S e abertura de cartões de anomalia.</td>
                    <td>Exame online (acerto ≥ 70%) + 2 ideias Kaizen abertas.</td>
                  </tr>
                  <tr>
                    <td><strong>Yellow Belt</strong></td>
                    <td>Líderes de Turno e Mecânicos</td>
                    <td>Ishikawa 6M, 5W2H, Cronoanálise e participação em projetos.</td>
                    <td>Exame online (acerto ≥ 75%) + 1 projeto PDCA concluído como membro.</td>
                  </tr>
                  <tr>
                    <td><strong>Green Belt</strong></td>
                    <td>Engenheiros de Processo e Supervisores</td>
                    <td>Liderança de projetos PDCA, Pareto, Capabilidade e Cálculo de ROI.</td>
                    <td>Exame avançado (acerto ≥ 80%) + 1 projeto liderado com ROI auditado.</td>
                  </tr>
                  <tr>
                    <td><strong>Black Belt</strong></td>
                    <td>Coordenadores e Especialistas Lean</td>
                    <td>Gestão de portfólio, Hoshin Kanri, VSM e mentoria de agentes.</td>
                    <td>Banca técnica executiva + ROI consolidado &gt; R$ 200k/ano.</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                7.3 Memorial de Cálculo do Radar de Maturidade 360°
              </h3>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 7.1 — Score Pentagonal de Maturidade Industrial
                </div>
                <div className="formula-expression">
                  Score Maturidade (S_mat) = ( 1 / 5 ) × Σ_&#123;k=1&#125;^5 Eixo_k &nbsp;&nbsp;&nbsp;&nbsp;(onde Eixo_k ∈ [0, 100])
                </div>
                <div className="formula-variables">
                  <strong>Os 5 Eixos Avaliados no Gráfico Radar:</strong><br />
                  1. <em>Rigor Metodológico:</em> Qualidade de preenchimento de Ishikawa, 5W2H e testes piloto.<br />
                  2. <em>Disciplina de Lead Time:</em> Cumprimento dos prazos de cada fase do PDCA sem atrasos internos.<br />
                  3. <em>Precisão Contábil:</em> Qualidade e consistência das planilhas de memória de custo evitado anexadas.<br />
                  4. <em>Presença no Gemba:</em> Interações físicas registradas em auditorias 5S e suporte a operadores.<br />
                  5. <em>Disseminação (Yokoten):</em> Capacidade de replicar soluções implementadas para outras linhas e setores.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 9: KANBAN OPERACIONAL & GESTÃO DE FLUXO                  */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 9 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Gestão Visual & Ritmo • Módulo 8</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 8: Kanban Operacional & Gestão de Fluxo de Projetos
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><Kanban size={12} /> Fluxo Puxado de Projetos</span>
                <span className="methodology-pill"><Clock size={12} /> Lei de Little Aplicada ao Lean</span>
                <span className="methodology-pill"><Activity size={12} /> Limite de WIP (Work In Progress)</span>
                <span className="tech-badge">Drag & Drop HTML5</span>
                <span className="tech-badge">Live Aging Counter</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                8.1 Lógica da Tela do Kanban de Projetos
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                O quadro <strong>Kanban Operacional</strong> organiza todo o fluxo produtivo de melhorias em colunas canônicas:
                <em>Triagem, Plan, Do, Check, Controladoria e Homologado</em>.
                Cada cartão representa um protocolo e exibe o título, o agente responsável, o setor, a tag de urgência e o tempo de permanência na fase (Aging).
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                8.2 Modelagem Matemática: Lei de Little e Eficiência de Ciclo (PCE)
              </h3>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 8.1 — Aplicação da Lei de Little ao Gerenciamento de Projetos
                </div>
                <div className="formula-expression">
                  WIP (Trabalho em Andamento) = Throughput (Vazão) × Lead Time Médio
                  <br /><br />
                  Lead Time = WIP / Throughput
                </div>
                <div className="formula-variables">
                  <strong>Princípio Lean de Limitação de WIP:</strong><br />
                  Quando uma equipe de engenharia inicia 20 projetos simultaneamente sem concluir os anteriores, o WIP quadruplica.
                  Pela Lei de Little, o Lead Time de cada projeto quadruplica proporcionalmente, gerando lentidão e sobrecarga (Muri).
                  O FluxoLean alerta quando um agente ultrapassa o limite saudável de 3 projetos ativos simultâneos.
                </div>
              </div>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 8.2 — Eficiência de Ciclo do Processo de Melhoria (PCE)
                </div>
                <div className="formula-expression">
                  PCE (%) = ( Tempo_Agregação_Valor_Efetivo / Lead_Time_Total_Projeto ) × 100%
                </div>
                <div className="formula-variables">
                  Mede a porcentagem do tempo do projeto em que trabalho técnico real foi executado versus o tempo total em que o projeto esteve aberto aguardando aprovações.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 10: CANAL KAIZEN & PARTICIPAÇÃO FABRIL                   */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 10 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Inovação da Base • Módulo 9</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 9: Canal Kaizen & Participação Ativa da Base Fabril
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><Lightbulb size={12} /> Teian Kaizen (Sugestões de Operadores)</span>
                <span className="methodology-pill"><CheckCircle2 size={12} /> Círculos de Controle de Qualidade (CCQ)</span>
                <span className="methodology-pill"><Award size={12} /> Reconhecimento & Mérito Operacional</span>
                <span className="tech-badge">Mobile First Form</span>
                <span className="tech-badge">Community Feed</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                9.1 Lógica da Tela do Canal Kaizen
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginBottom: '1rem' }}>
                O <strong>Canal Kaizen</strong> é a porta de entrada para quem vive a realidade do chão de fábrica.
                Projetado com interface mobile-first de extrema simplicidade, permite que o operador registre sua ideia em menos de 60 segundos,
                inserindo apenas: título da melhoria, setor, o problema que incomoda seu dia a dia e uma foto tirada na hora.
                A tela de feed público exibe as ideias aprovadas, promovendo o orgulho profissional e o reconhecimento entre turnos.
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                9.2 Indicadores de Engajamento e Memorial de Retorno Médio
              </h3>

              <div className="formula-card">
                <div className="formula-title">
                  <Calculator size={16} color="#0284c7" /> Equação 9.1 — Taxa de Engajamento Fabril (IE) e Retorno Médio por Ideia
                </div>
                <div className="formula-expression">
                  Índice de Engajamento (IE) = ( Total_Ideias_Submetidas_Mês / Total_Colaboradores_Fabril ) × 100%
                  <br /><br />
                  Retorno Médio por Kaizen (R_kaizen) = Custo_Evitado_Total_Kaizen / Total_de_Ideias_Implementadas
                </div>
                <div className="formula-variables">
                  Conforme a tradição das montadoras japonesas de classe mundial, uma fábrica saudável gera pelo menos 1 a 2 sugestões implementadas por colaborador ao ano,
                  criando uma barreira intransponível de eficiência contra concorrentes.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 11: BIBLIOGRAFIA ACADÊMICA RIGOROSA (ABNT)               */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 11 ? 'active-chapter' : ''}`}>
              <div className="academic-section-header">
                <span className="academic-subtitle">Referencial Teórico Consagrado</span>
                <h2 className="memorial-serif" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Capítulo 10: Bibliografia Acadêmica Rigorosa & Referencial ABNT
                </h2>
              </div>

              <div>
                <span className="methodology-pill"><Library size={12} /> ABNT NBR 6023</span>
                <span className="methodology-pill"><Award size={12} /> Obras Seminais do Lean Manufacturing</span>
              </div>

              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, textAlign: 'justify', marginTop: '1.25rem', marginBottom: '1.75rem' }}>
                A arquitetura conceitual e computacional do <strong>FluxoLean</strong> é respaldada pelos maiores clássicos
                da literatura mundial de engenharia de produção e administração industrial. Abaixo registram-se as obras fundamentais
                utilizadas na modelagem das telas e equações desta plataforma:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  {
                    obra: 'OHNO, Taiichi. Toyota Production System: Beyond Large-Scale Production. Portland: Productivity Press, 1988.',
                    aplicacao: 'Origem dos 7 grandes desperdícios (Muda), da produção puxada por cartões (Kanban) e da filosofia de respeito às pessoas no Gemba que alicerçam os Módulos 1, 4 e 8 do FluxoLean.',
                  },
                  {
                    obra: 'SHINGO, Shigeo. A Study of the Toyota Production System from an Industrial Engineering Viewpoint. Tokyo: Japan Management Association, 1981.',
                    aplicacao: 'Fundamentação dos dispositivos à prova de falhas (Poka-Yoke) e dos portões de qualidade do PDCA (Módulo 3) e TPM (Módulo 6).',
                  },
                  {
                    obra: 'WOMACK, James P.; JONES, Daniel T. Lean Thinking: Banish Waste and Create Wealth in Your Corporation. New York: Free Press, 2003.',
                    aplicacao: 'Sistematização dos 5 princípios da manufatura enxuta e da conexão entre valor para o cliente e fluxo contínuo de projetos de melhoria.',
                  },
                  {
                    obra: 'LIKER, Jeffrey K. O Modelo Toyota: 14 Princípios de Gestão do Maior Fabricante do Mundo. Porto Alegre: Bookman, 2005.',
                    aplicacao: 'Referencial para o princípio &quot;Monozukuri wa Hitozukuri&quot; e para a trilha de capacitação de Belts da Academia Lean (Módulo 7).',
                  },
                  {
                    obra: 'SHOOK, John. Gerenciando para Aprender: O Uso do Processo de Gestão A3 para Resolver Problemas, Promover Alinhamento e Desenvolver Pessoas. São Paulo: Lean Institute Brasil, 2008.',
                    aplicacao: 'Projeto visual e metodológico do Relatório A3 Executivo em folha única paisagem gerado automaticamente pelo FluxoLean (Módulo 3).',
                  },
                  {
                    obra: 'ROTHER, Mike; SHOOK, John. Aprendendo a Enxergar: Mapeando o Fluxo de Valor para Agregar Valor e Eliminar o Desperdício. São Paulo: Lean Institute Brasil, 2003.',
                    aplicacao: 'Modelagem analítica do Lead Time Total de Ciclo e do isolamento de tempos de agregação e não-agregação de valor (Módulo 1).',
                  },
                  {
                    obra: 'IMAI, Masaaki. Kaizen: A Estratégia para o Sucesso Competitivo. São Paulo: IMAM, 1994.',
                    aplicacao: 'Arquitetura do Canal Kaizen e da escuta contínua de pequenas melhorias originadas nos operadores de linha (Módulo 9).',
                  },
                  {
                    obra: 'NAKAJIMA, Seiichi. Introduction to TPM: Total Productive Maintenance. Cambridge: Productivity Press, 1988.',
                    aplicacao: 'Modelagem matemática do OEE (Disponibilidade × Desempenho × Qualidade) e sistematização da Manutenção Autônoma 5S (Módulo 6).',
                  },
                  {
                    obra: 'GOLDRATT, Eliyahu M.; COX, Jeff. A Meta: Um Processo de Aprimoramento Contínuo. São Paulo: Nobel, 2002.',
                    aplicacao: 'Inspiração analítica para a Fonte 3 de Custo Evitado (Throughput em Gargalos Operacionais) segundo a Teoria das Restrições (Módulo 4).',
                  },
                  {
                    obra: 'MONDEN, Yasuhiro. Toyota Production System: An Integrated Approach to Just-In-Time. 4th ed. Boca Raton: CRC Press, 2011.',
                    aplicacao: 'Tratado completo de contabilidade de gestão Lean, amortização de investimentos e governança financeira industrial (Módulos 4 e 5).',
                  },
                ].map((ref, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #0f172a', padding: '1rem 1.25rem', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', lineHeight: 1.5 }}>
                      {ref.obra}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                      <strong>Conexão com o FluxoLean:</strong> {ref.aplicacao}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '3.5rem', textAlign: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '2rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.35rem 0' }}>
                  FIM DA MONOGRAFIA TÉCNICA & MEMORIAL DESCRITIVO
                </p>
                <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                  FluxoLean 4.0 • Idealizado, Modelado e Codificado por <strong>Mauricio Grigol</strong>
                </p>
              </div>
            </section>

            {/* BARRA DE NAVEGAÇÃO ENTRE CAPÍTULOS NO RODAPÉ (APENAS NA TELA) */}
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
