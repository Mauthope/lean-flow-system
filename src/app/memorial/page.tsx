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
  Sparkles,
  Bot,
  Timer,
  Settings,
  Users,
  Inbox,
  LayoutDashboard,
  Glasses,
  FileCode,
  Check,
} from 'lucide-react';

export default function MemorialDescritivoPage() {
  const router = useRouter();
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // CAPÍTULOS RIGOROSAMENTE NA ORDEM EXATA DO MENU DO FLUXOLEAN
  const chapters = [
    { id: 0, title: 'Capa Nobre & Credenciais Técnicas do Autor', short: 'Capa & Autor', icon: Award },
    { id: 1, title: 'Prólogo: A Gênese do FluxoLean e a Visão Sistêmica', short: 'Prólogo & Filosofia', icon: BookOpen },
    // SEÇÃO 1: VISÃO GERAL
    { id: 2, title: 'Capítulo 1: Dashboard Lean & Engenharia de Lead Time', short: '1. Dashboard Lean', icon: LayoutDashboard },
    { id: 3, title: 'Capítulo 2: Kanban Geral & Gestão de Fluxo de Trabalho', short: '2. Kanban Geral', icon: Kanban },
    { id: 4, title: 'Capítulo 3: Triagem de Demandas & Matriz GUT', short: '3. Triagem & GUT', icon: Inbox },
    // SEÇÃO 2: CADASTROS & EQUIPE
    { id: 5, title: 'Capítulo 4: Gestão de Agentes, Belts & Trilha de Formação', short: '4. Agentes & Belts', icon: Users },
    { id: 6, title: 'Capítulo 5: Setores Fabris & Assessment com Radar 360°', short: '5. Setores & Radar', icon: Building2 },
    // SEÇÃO 3: INTELIGÊNCIA & MÉTODOS
    { id: 7, title: 'Capítulo 6: Histórico Kaizen & Repositório de Aprendizado (Yokoten)', short: '6. Histórico Kaizen', icon: Sparkles },
    { id: 8, title: 'Capítulo 7: Integrações de IA & O Sensei Corporativo', short: '7. Integrações de IA', icon: Bot },
    { id: 9, title: 'Capítulo 8: Custo Evitado & ROI (As 7 Fontes Canônicas)', short: '8. Custo Evitado & ROI', icon: TrendingUp },
    { id: 10, title: 'Capítulo 9: Academia Lean & Ferramentas Operacionais: Cronoanálise, Artigos IA e Exames', short: '9. Academia & Ferramentas', icon: BookOpen },
    // SEÇÃO 4: FÁBRICA & COMUNICAÇÃO
    { id: 11, title: 'Capítulo 10: TPM (Manutenção Produtiva Total) & Gestão Autônoma', short: '10. TPM & 5S', icon: Settings },
    { id: 12, title: 'Capítulo 11: Canal Kaizen & Democratização da Inovação na Base', short: '11. Canal Kaizen', icon: Lightbulb },
    // SEÇÃO 5: NÚCLEO EXECUTIVO & GOVERNANÇA
    { id: 13, title: 'Capítulo 12: Projetos PDCA em 4 Portões Rígidos & Relatório A3', short: '12. PDCA & A3 Executivo', icon: Layers },
    { id: 14, title: 'Capítulo 13: Portal de Auditoria da Controladoria & Fé Pública Contábil', short: '13. Controladoria & Fé Pública', icon: ShieldCheck },
    { id: 15, title: 'Capítulo 14: Bibliografia Acadêmica Rigorosa & Referencial Teórico ABNT', short: '14. Bibliografia ABNT', icon: Library },
  ];

  return (
    <div className="memorial-app-container">
      {/* ========================================================================= */}
      {/* ESTILOS CSS SCREEN E PRINT OTIMIZADOS                                     */}
      {/* ========================================================================= */}
      <style jsx global>{`
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
          margin: 1.35rem 0;
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
          margin: 1.35rem 0;
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

          .monograph-chapter-section,
          .monograph-cover-section {
            display: none;
          }
          .monograph-chapter-section.active-chapter,
          .monograph-cover-section.active-chapter {
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

          .cover-header-block {
            text-align: center;
            padding-bottom: 2.25rem;
            border-bottom: 3px double #0f172a;
            margin-bottom: 2rem;
          }
          .cover-badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.35rem 1rem;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 9999px;
            margin-bottom: 1.25rem;
          }
          .cover-title-h1 {
            font-size: 2.35rem;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.18;
            max-width: 840px;
            margin: 0 auto 0.75rem auto;
            letter-spacing: -0.03em;
          }
          .cover-divider-line {
            width: 80px;
            height: 4px;
            background-color: #0ea5e9;
            margin: 1.25rem auto;
            border-radius: 2px;
          }
          .cover-subtitle-p {
            font-size: 1.05rem;
            color: #475569;
            max-width: 760px;
            margin: 0 auto;
            line-height: 1.6;
            font-style: italic;
          }
          .cover-card-quadro1 {
            margin: 1.5rem 0;
          }
          .cover-quadro1-title {
            font-size: 1.1rem;
            font-weight: 900;
            color: #0f172a;
            margin: 0;
          }
          .cover-quadro1-intro {
            font-size: 0.9rem;
            color: #1e293b;
            line-height: 1.7;
            margin-bottom: 1rem;
          }
          .cover-quadro1-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .cover-quadro1-item {
            background-color: #ffffff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 0.75rem 1rem;
          }
          .cover-card-quadro2 {
            margin: 1.5rem 0;
            background-color: #ffffff;
            border: 1.5px solid #cbd5e1;
          }
          .cover-author-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.85rem;
            margin-bottom: 1rem;
          }
          .cover-author-avatar {
            width: 52px;
            height: 52px;
            border-radius: 12px;
            background: linear-gradient(135deg, #0f172a 0%, #0284c7 100%);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 1.35rem;
            flex-shrink: 0;
          }
          .cover-author-badge-sub {
            font-size: 0.725rem;
            font-weight: 800;
            color: #0284c7;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .cover-author-name {
            font-size: 1.35rem;
            font-weight: 900;
            color: #0f172a;
            margin: 0.1rem 0;
          }
          .cover-author-title {
            font-size: 0.825rem;
            color: #475569;
            margin: 0;
            font-weight: 600;
          }
          .cover-author-city {
            text-align: right;
          }
          .cover-author-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 0.45rem;
            margin-bottom: 1.15rem;
          }
          .cover-author-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.85rem;
            margin-bottom: 1rem;
          }
          .cover-author-col {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 0.85rem;
          }
          .cover-author-footer {
            border-top: 1px solid #f1f5f9;
            padding-top: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.775rem;
            color: #64748b;
          }
          .cover-footer-block {
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 1.5rem;
            margin-top: 2.25rem;
          }
        }

        /* ========================================================================= */
        /* ESTRUTURA DE IMPRESSÃO A4 PROFISSIONAL, DENSA, BRANCA E SEM BORDA PRETA   */
        /* ========================================================================= */
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }

          :root,
          html,
          body {
            color-scheme: light !important;
            background-color: #ffffff !important;
            background: #ffffff !important;
            background-image: none !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          *, *::before, *::after {
            box-shadow: none !important;
            text-shadow: none !important;
          }

          .memorial-app-container,
          .screen-main-layout,
          .screen-content-area,
          .screen-paper-sheet {
            display: block !important;
            position: static !important;
            overflow: visible !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            height: auto !important;
          }

          /* GARANTE TEXTO 100% NÍTIDO E SEM CORES CLARAS NO PAPEL */
          p, span, li, td, em, i {
            color: #1e293b !important;
          }
          p {
            orphans: 3 !important;
            widows: 3 !important;
          }
          strong, b {
            color: #000000 !important;
            font-weight: 800 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #000000 !important;
            font-weight: 800 !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          .no-print,
          .screen-header-bar,
          .screen-sidebar,
          .screen-chapter-nav {
            display: none !important;
          }

          /* ========================================================================= */
          /* CAPA NOBRE STRICTAMENTE CONFINADA NA FOLHA 1 (SEM VAZAR PARA PÁGINA 2)    */
          /* ========================================================================= */
          .monograph-cover-section {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            height: 258mm !important;
            max-height: 258mm !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .cover-header-block {
            text-align: center !important;
            padding-bottom: 2mm !important;
            border-bottom: 2px solid #0f172a !important;
            margin-bottom: 2mm !important;
          }

          .cover-badge-pill {
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            padding: 1px 7px !important;
            background-color: #f1f5f9 !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 9999px !important;
            margin-bottom: 1.5mm !important;
          }
          .cover-badge-pill span {
            font-size: 0.63rem !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
          }

          .cover-title-h1 {
            font-size: 1.35rem !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            line-height: 1.15 !important;
            max-width: 96% !important;
            margin: 0 auto 1.5mm auto !important;
            letter-spacing: -0.02em !important;
          }

          .cover-divider-line {
            width: 45px !important;
            height: 2.5px !important;
            background-color: #0ea5e9 !important;
            margin: 1.5mm auto !important;
          }

          .cover-subtitle-p {
            font-size: 0.74rem !important;
            color: #334155 !important;
            max-width: 94% !important;
            margin: 0 auto !important;
            line-height: 1.25 !important;
            font-style: italic !important;
          }

          .cover-card-quadro1 {
            margin: 1.5mm 0 !important;
            padding: 2.5mm 3.5mm !important;
            border: 1px solid #bae6fd !important;
            border-left: 4px solid #0284c7 !important;
            background-color: #f8fafc !important;
            border-radius: 6px !important;
          }

          .cover-quadro1-title {
            font-size: 0.82rem !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            margin: 0 !important;
          }

          .cover-quadro1-intro {
            font-size: 0.7rem !important;
            color: #1e293b !important;
            line-height: 1.25 !important;
            margin-bottom: 1.5mm !important;
          }

          .cover-quadro1-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5mm !important;
          }

          .cover-quadro1-item {
            background-color: #ffffff !important;
            border: 1px solid #bae6fd !important;
            border-radius: 4px !important;
            padding: 1.5mm 2.5mm !important;
          }

          .cover-quadro1-item strong {
            font-size: 0.69rem !important;
            color: #0369a1 !important;
            display: block !important;
            margin-bottom: 1px !important;
          }

          .cover-quadro1-item span {
            font-size: 0.64rem !important;
            color: #475569 !important;
            line-height: 1.2 !important;
            display: block !important;
          }

          .cover-card-quadro2 {
            margin: 1.5mm 0 !important;
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            border-left: 4px solid #475569 !important;
            border-radius: 6px !important;
            padding: 2.5mm 3.5mm !important;
          }

          .cover-author-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            border-bottom: 1px solid #e2e8f0 !important;
            padding-bottom: 1.5mm !important;
            margin-bottom: 1.5mm !important;
          }

          .cover-author-avatar {
            width: 30px !important;
            height: 30px !important;
            border-radius: 5px !important;
            background: #0f172a !important;
            color: #ffffff !important;
            font-size: 0.9rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
          }

          .cover-author-badge-sub {
            font-size: 0.62rem !important;
            font-weight: 800 !important;
            color: #0284c7 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
          }

          .cover-author-name {
            font-size: 1.05rem !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            margin: 0 !important;
            line-height: 1.1 !important;
          }

          .cover-author-title {
            font-size: 0.66rem !important;
            color: #475569 !important;
            margin: 0 !important;
            font-weight: 600 !important;
          }

          .cover-author-city {
            text-align: right !important;
          }
          .cover-author-city span:first-child {
            font-size: 0.67rem !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            display: block !important;
          }
          .cover-author-city span:last-child {
            font-size: 0.62rem !important;
            color: #64748b !important;
          }

          .cover-author-badges {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 1.5mm !important;
            margin-bottom: 1.5mm !important;
          }

          .cover-author-badges span {
            font-size: 0.64rem !important;
            font-weight: 700 !important;
            padding: 1px 4px !important;
            border-radius: 3px !important;
            border: 1px solid #cbd5e1 !important;
            background-color: #f8fafc !important;
          }

          .cover-author-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.5mm !important;
            margin-bottom: 1.5mm !important;
          }

          .cover-author-col {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 4px !important;
            padding: 1.5mm 2mm !important;
          }

          .cover-author-col strong {
            font-size: 0.68rem !important;
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
            margin-bottom: 1px !important;
          }

          .cover-author-col p {
            font-size: 0.63rem !important;
            line-height: 1.2 !important;
            color: #475569 !important;
            margin: 0 !important;
          }

          .cover-author-footer {
            border-top: 1px solid #f1f5f9 !important;
            padding-top: 1.2mm !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            font-size: 0.63rem !important;
            color: #64748b !important;
          }

          .cover-footer-block {
            text-align: center !important;
            border-top: 1px solid #cbd5e1 !important;
            padding-top: 1.5mm !important;
            margin-top: 1mm !important;
          }

          .cover-footer-block p:first-child {
            font-size: 0.72rem !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            margin: 0 0 1px 0 !important;
          }

          .cover-footer-block p:last-child {
            font-size: 0.65rem !important;
            color: #64748b !important;
            margin: 0 !important;
          }

          /* ========================================================================= */
          /* CAPÍTULOS SUBSEQUENTES FLUEM COM CONTINUIDADE E TRANSIÇÕES LIMPAS         */
          /* ========================================================================= */
          .monograph-chapter-section {
            display: block !important;
            margin-top: 12mm !important;
            padding-top: 8mm !important;
            border-top: 2px solid #0f172a !important;
          }

          .monograph-chapter-section:first-of-type {
            margin-top: 0 !important;
            padding-top: 0 !important;
            border-top: none !important;
          }

          .chapter-header-box {
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            padding-bottom: 2mm !important;
            margin-bottom: 4mm !important;
          }

          /* EVITA QUEBRAR CARDS E TABELAS AO MEIO */
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
            margin: 4mm 0 !important;
            padding: 3mm 4mm !important;
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

          .lean-pedagogy-box {
            margin: 4mm 0 !important;
            padding: 3mm 4mm !important;
          }

          .lean-formula-container {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            margin: 4mm 0 !important;
            padding: 3mm 4mm !important;
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
                Memorial Metodológico & Concepção Lean
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>
              Memorial Metodológico Completo • Ordenado Rigorosamente pelo Menu do Sistema
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
            <Printer size={16} /> Imprimir Obra Completa (A4 Limpo)
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
              Estrutura Oficial do Menu
            </h2>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
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
                    gap: '0.6rem',
                    width: '100%',
                    padding: '0.5rem 0.7rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '0.775rem',
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
                  <Icon size={15} color={isActive ? '#ffffff' : '#38bdf8'} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chap.short}
                  </span>
                </button>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.9rem',
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <Award size={15} color="#38bdf8" />
              <strong style={{ fontSize: '0.75rem', color: '#f8fafc' }}>
                Autor & Arquiteto
              </strong>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
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
            {/* CAPÍTULO 0: CAPA NOBRE & APRESENTAÇÃO TÉCNICA DO AUTOR             */}
            {/* ================================================================= */}
            <section className={`monograph-cover-section ${activeChapter === 0 ? 'active-chapter' : ''}`}>
              {/* Topo da Capa */}
              <div className="cover-header-block">
                <div className="cover-badge-pill">
                  <Award size={16} color="#0284c7" />
                  <span>
                    Tratado de Engenharia de Processos & Governança Lean
                  </span>
                </div>

                <h1 className="cover-title-h1">
                  FLUXOLEAN 4.0: ARQUITETURA DE SINCRONISMO OPERACIONAL, GOVERNANÇA PDCA E ENGENHARIA DE CUSTOS EVITADOS
                </h1>

                <div className="cover-divider-line" />

                <p className="cover-subtitle-p">
                  Uma Abordagem Estruturada para a Eliminação Sistemática de Desperdícios, Conexão do Chão de Fábrica à Controladoria e Validação Contábil do Retorno sobre o Capital Lean
                </p>
              </div>

              {/* QUADRO I: ESCOPO CONCEITUAL */}
              <div className="colored-card card-blue cover-card-quadro1">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                  <Building2 size={20} color="#0284c7" />
                  <h3 className="cover-quadro1-title">
                    Quadro I • Escopo da Plataforma & Arquitetura de Módulos
                  </h3>
                </div>

                <p className="cover-quadro1-intro">
                  O <strong>FluxoLean 4.0</strong> unifica as 4 grandes dimensões de uma indústria de alta performance:
                  a visão executiva da liderança, o desenvolvimento técnico dos colaboradores, a inteligência preditiva de dados e a governança contábil irrefutável perante a Controladoria.
                </p>

                <div className="cover-quadro1-grid">
                  <div className="cover-quadro1-item">
                    <strong>
                      ⚙️ Visão Geral & Gestão de Fluxo
                    </strong>
                    <span>
                      Cockpit executivo com Lead Time segregado, Kanban puxado com limite de WIP e funil inteligente de Triagem GUT.
                    </span>
                  </div>

                  <div className="cover-quadro1-item">
                    <strong>
                      👥 Pessoas, Belts & Setores
                    </strong>
                    <span>
                      Trilha de maturidade (White a Black Belt) e Assessment 360° em radar pentagonal por setor produtivo.
                    </span>
                  </div>

                  <div className="cover-quadro1-item">
                    <strong>
                      🧠 Inteligência, IA & Academia
                    </strong>
                    <span>
                      Sensei IA para co-criação e refinamento de artigos, telemetria de leitura, 50 questões dinâmicas e cronoanálise de tempos.
                    </span>
                  </div>

                  <div className="cover-quadro1-item">
                    <strong>
                      🏛️ Governança, A3 & Controladoria
                    </strong>
                    <span>
                      PDCA de 4 portões com geração de Relatório A3 paisagem, 7 fontes de custo evitado e validação com Fé Pública Contábil.
                    </span>
                  </div>
                </div>
              </div>

              {/* QUADRO II: APRESENTAÇÃO TÉCNICA DO AUTOR */}
              <div className="colored-card card-slate cover-card-quadro2">
                <div className="cover-author-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div className="cover-author-avatar">
                      MG
                    </div>
                    <div>
                      <span className="cover-author-badge-sub">
                        Quadro II • Credenciais Técnicas & Autoria do Projeto
                      </span>
                      <h2 className="cover-author-name">
                        Mauricio Prestes Grigol
                      </h2>
                      <p className="cover-author-title">
                        Engenheiro Bioenergético • Pós-Graduado em Engenharia de Segurança do Trabalho • Arquiteto Full Stack & IA
                      </p>
                    </div>
                  </div>

                  <div className="cover-author-city">
                    <span>
                      📍 Xaxim — Santa Catarina
                    </span>
                    <span>
                      Brasil
                    </span>
                  </div>
                </div>

                <div className="cover-author-badges">
                  <span>
                    🎓 Bacharel em Engenharia Bioenergética
                  </span>
                  <span>
                    🦺 Especialização em Eng. de Segurança do Trabalho
                  </span>
                  <span style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }}>
                    💻 Desenvolvedor Full-Stack Sênior & IA Aplicada
                  </span>
                  <span style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}>
                    ⚙️ Especialista em Lean, VSM & Cronoanálise
                  </span>
                </div>

                <div className="cover-author-grid">
                  <div className="cover-author-col">
                    <strong>
                      <HardHat size={15} color="#d97706" /> Engenharia & Processos
                    </strong>
                    <p>
                      Domínio prático no Gemba fabril, Mapeamento de Fluxo de Valor (VSM), cronoanálise de ciclos, balanceamento de linhas, OEE, SMED e modelagem matemática de custos evitados.
                    </p>
                  </div>

                  <div className="cover-author-col">
                    <strong>
                      <ShieldCheck size={15} color="#16a34a" /> Segurança & Ergonomia
                    </strong>
                    <p>
                      Aplicação das Normas Regulamentadoras (NR-12, NR-17), mitigação do <em>Muri</em> (sobrecarga biomecânica) como condição de estabilidade operacional e simbiose entre segurança e 5S/TPM.
                    </p>
                  </div>

                  <div className="cover-author-col">
                    <strong>
                      <Code size={15} color="#0284c7" /> Software & IA Industrial
                    </strong>
                    <p>
                      Arquiteto de sistemas em Next.js, React, TypeScript, Node.js, Python, Supabase (PostgreSQL, RLS). Criador do <strong>Akiom.ai</strong> e fundador da suíte <strong>CalcForgeTools</strong>.
                    </p>
                  </div>
                </div>

                <div className="cover-author-footer">
                  <span>
                    <strong>Currículo & Portfólio Oficial:</strong> calcforgetools.com • Akiom.ai • GitHub: Mauthope
                  </span>
                  <span>
                    Contato: <strong>mauricioprestesgrigol@gmail.com</strong>
                  </span>
                </div>
              </div>

              {/* Rodapé da Capa */}
              <div className="cover-footer-block">
                <p>
                  XAXIM — SANTA CATARINA
                </p>
                <p>
                  Publicação Oficial de Engenharia de Processos Industriais • Versão 4.0 Multi-Tenant
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* PRÓLOGO: A GÊNESE DO FLUXOLEAN E A VISÃO SISTÊMICA                */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 1 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Fundamentação Teórica & Diagnóstico Fabril
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Prólogo: A Gênese do FluxoLean e a Visão Sistêmica
                </h2>
              </div>

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
                Essa dicotomia ocorre porque o Lean tradicional foi frequentemente ensinado sob o prisma de &quot;ganhos teóricos&quot; — calcular que uma melhoria economizou 2 minutos por ciclo e multiplicar isso arbitrariamente pelo salário dos operadores para reivindicar economia fictícia, sem que nenhum turno tenha sido cortado ou nenhum produto extra tenha sido faturado.
                A Controladoria, munida do rigor contábil das partidas dobradas, desconsidera tais relatórios, taxando o programa de melhoria contínua como cosmética fabril.
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
            {/* SEÇÃO 1: VISÃO GERAL                                              */}
            {/* CAPÍTULO 1: DASHBOARD LEAN                                        */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 2 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Visão Geral • Rota: /admin/dashboard
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 1: Dashboard Lean & Engenharia de Lead Time
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Filosofia Mieruka e a Soberania do Lead Time
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Mieruka (Gestão à Vista):</strong> Na psicologia fabril japonesa, a cognição humana processa elementos visuais com velocidade 60.000 vezes superior ao texto puro. Um sistema visual bem projetado deve permitir que qualquer colaborador compreenda o estado da produção, anomalias e gargalos em menos de 5 segundos.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Soberania do Lead Time:</strong> Como ensinava Taiichi Ohno: <em>&quot;Tudo o que fazemos é olhar para a linha do tempo, desde o momento em que o cliente nos faz o pedido até o ponto em que recebemos o dinheiro. E estamos reduzindo essa linha do tempo eliminando os desperdícios que não agregam valor.&quot;</em> No FluxoLean, tratamos os próprios projetos de melhoria como um fluxo produtivo cujo Lead Time deve ser rigorosamente cronometrado.
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <LayoutDashboard size={18} /> A Lógica da Tela do Dashboard no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O <strong>Dashboard Lean</strong> opera como o cockpit da planta fabril.
                  A tela é segmentada em 3 blocos funcionais:
                  (1) <em>Cards Superiores de Indicadores Vitais</em> com o total de projetos ativos, retorno acumulado em R$ e ROI médio ponderado;
                  (2) <em>Pipeline Horizontal do PDCA</em>, demonstrando a quantidade e proporção de projetos em cada portão de qualidade;
                  (3) <em>Painel Duplo de Engenharia de Lead Time</em>, com decomposição do tempo por etapa do PDCA e gráfico de dependências externas.
                </p>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                Memorial de Cálculo das Métricas do Dashboard
              </h3>

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
                  - Tempo sob controle do Líder Lean: 12 dias.<br />
                  - Tempo travado no setor de Compras (peça em trânsito): 14 dias.<br />
                  - Tempo travado na Manutenção (usinagem de suporte): 18 dias.<br />
                  Σ LT_Setores_Externos = 14 + 18 = 32 dias.<br />
                  <strong>Φ = (32 ÷ 44) × 100% = 72,7% de dependência de terceiros.</strong><br />
                  <em>Defesa Comprovada:</em> O agente respondeu por apenas 27,3% do tempo; 72,7% do atraso decorreu da fila de outros setores.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 2: KANBAN GERAL                                          */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 3 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Visão Geral • Rota: /admin/kanban & /agente/kanban
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 2: Kanban Geral & Gestão de Fluxo de Trabalho
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Limitação de WIP e a Lei de Little
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Ilusão do Multitasking Fabril:</strong> Iniciar muitos projetos simultaneamente sem concluir os anteriores gera estoque em processo (WIP). O cérebro humano perde até 40% de eficiência cognitiva ao alternar constantemente entre tarefas complexas.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Lei de Little (\(WIP = TH \times LT\)):</strong> Formulada por John Little (MIT), essa equação matemática rege todo sistema de filas: quanto maior o número de tarefas em andamento (WIP), maior será o tempo de resposta (Lead Time) de cada uma delas. A regra de ouro do Kanban Lean é simples: <em>&quot;Pare de começar e comece a terminar!&quot;</em>
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Kanban size={18} /> A Lógica da Tela de Kanban no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O Kanban organiza os projetos em colunas canônicas: <em>Triagem, Plan, Do, Check, Controladoria e Homologado</em>.
                  Cada card exibe o número do protocolo, o agente responsável, o setor fabril e o tempo de permanência na coluna (Aging), disparando alertas visuais quando um projeto fica estagnado.
                </p>
              </div>

              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sliders size={16} color="#0284c7" /> Equação 2.1 — Lei de Little Aplicada à Gestão de Projetos
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
                  Se um agente assume 12 projetos ao mesmo tempo, seu WIP quadruplica. Pela Lei de Little, o tempo médio de entrega de cada projeto também quadruplica, criando sobrecarga (Muri) e atrasos generalizados.
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 3: TRIAGEM DE DEMANDAS & MATRIZ GUT                      */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 4 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Visão Geral • Rota: /admin/triagem & /nova-demanda
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 3: Triagem de Demandas & Matriz GUT
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Hoshin Kanri e a Priorização Científica
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Hoshin Kanri (Desdobramento de Diretrizes):</strong> Um dos maiores erros de gestão industrial é tratar todas as demandas com a mesma urgência. Quando tudo é prioridade, nada é prioridade, gerando paralisia por análise e exaustão na engenharia.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Lógica de Triagem de Kepner & Tregoe:</strong> A Matriz GUT estabelece um filtro racional contra o viés emocional. Ela responde matematicamente a três perguntas cruciais: (1) <em>Qual a gravidade do dano caso nada seja feito?</em> (2) <em>Qual a pressão do tempo para contenção imediata?</em> (3) <em>Qual a taxa de degradação da anomalia no tempo?</em>
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Inbox size={18} /> A Lógica da Tela de Triagem no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  A tela de Triagem recebe as sugestões vindas do Canal Kaizen e de formulários rápidos de operadores.
                  Cada demanda é apresentada em um card visual com fotografia da anomalia, descrição da dor e setor de origem.
                  Ao clicar em <em>Analisar Demanda</em>, o coordenador pontua as notas de Gravidade, Urgência e Tendência.
                  O sistema calcula o <strong>Score GUT</strong> instantaneamente e habilita botões de despacho com 1 clique.
                </p>
              </div>

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

              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calculator size={16} color="#0284c7" /> Equação 3.1 — Índice de Prioridade de Demanda (Score GUT)
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
            {/* SEÇÃO 2: CADASTROS & EQUIPE                                       */}
            {/* CAPÍTULO 4: GESTÃO DE AGENTES & BELTS                             */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 5 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Cadastros & Equipe • Rota: /admin/agentes
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 4: Gestão de Agentes, Belts & Trilha de Formação
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Monozukuri wa Hitozukuri & Toyota Kata
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Monozukuri wa Hitozukuri:</strong> Provérbio japonês que define o DNA da melhoria contínua: <em>&quot;Antes de fabricar coisas excelentes (Monozukuri), devemos formar pessoas excelentes (Hitozukuri)&quot;</em>. O maquinário mais moderno do mundo se torna obsoleto se os operadores não dominarem o método científico de solução de problemas.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Toyota Kata (Mike Rother):</strong> O aprendizado não acontece em palestras anuais esporádicas, mas na prática diária de pequenas rotinas (Kata de Melhoria) orientadas por um mentor (Kata de Coaching).
                </p>
              </div>

              <div className="colored-card card-green">
                <strong style={{ color: '#15803d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Users size={18} /> A Lógica da Tela de Gestão de Agentes no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  A tela de Gestão de Agentes acompanha o crescimento técnico dos líderes Lean.
                  Cada card exibe a graduação (Belt), total de projetos liderados, taxa de conclusão dentro do prazo, índice de precisão contábil e o ROI financeiro líquido gerado pelo profissional.
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
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 5: SETORES & ASSESSMENT COM RADAR 360°                   */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 6 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Cadastros & Equipe • Rota: /admin/setores & /agente/setores
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 5: Setores Fabris & Assessment com Radar 360°
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Avaliação Holística e Padronização
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Na gestão tradicional, a avaliação de uma fábrica costuma focar apenas em volume de produção.
                  No Lean Manufacturing, o desempenho de uma área fabril é indissociável da estabilidade do processo, da disciplina operacional e da integridade física dos operadores (NR-12 e NR-17).
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  O <strong>Radar Pentagonal 360°</strong> mede a sustentabilidade operacional em 5 dimensões interdependentes, impedindo que um setor atinja metas financeiras à custa da degradação das máquinas ou de riscos ergonômicos.
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Building2 size={18} /> A Lógica da Tela de Setores & Assessment
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O coordenador seleciona o setor fabril e preenche o assessment com notas de 1 a 5 em cada eixo:
                  (1) <em>5S e Organização</em>; (2) <em>Estabilidade de Fluxo</em>; (3) <em>Confiabilidade TPM</em>; (4) <em>Autonomia da Linha</em>; (5) <em>Segurança e Ergonomia</em>.
                  O sistema renderiza o gráfico de radar poligonal comparando o estado atual contra o alvo World Class.
                </p>
              </div>

              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={16} color="#0284c7" /> Equação 5.1 — Score Pentagonal de Maturidade Operacional do Setor
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Escala: 0 a 100%
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">Score_Maturidade</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">[ ( N_5S + N_Fluxo + N_TPM + N_Autonomia + N_Seguranca ) ÷ 25 ]</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">100%</span>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* SEÇÃO 3: INTELIGÊNCIA & MÉTODOS                                   */}
            {/* CAPÍTULO 6: HISTÓRICO KAIZEN & YOKOTEN                            */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 7 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Inteligência & Métodos • Rota: /admin/historico-kaizen
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 6: Histórico Kaizen & Repositório de Aprendizado (Yokoten)
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Prática do Yokoten na Indústria
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Yokoten (Desdobramento Horizontal):</strong> Na Toyota, uma melhoria implementada em uma linha de montagem não é considerada concluída até ser documentada e transferida para todas as outras linhas similares da fábrica e de outras plantas do grupo.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Reiniciar do zero a investigação de um problema que já foi resolvido em outro galpão é um dos maiores desperdícios de intelecto da engenharia. O Histórico Kaizen é o banco de dados de inteligência viva do FluxoLean.
                </p>
              </div>

              <div className="colored-card card-green">
                <strong style={{ color: '#15803d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Sparkles size={18} /> A Lógica da Tela de Histórico Kaizen
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  A tela permite buscar rapidamente projetos e Kaizens concluídos através de filtros por setor, tipo de ganho ou busca textual.
                  O sistema preserva os memoriais de cálculo, as contramedidas adotadas e as fotos de Antes vs Depois, permitindo a duplicação imediata de soluções testadas e auditadas.
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 7: INTEGRAÇÕES DE IA & SENSEI CORPORATIVO                */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 8 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Inteligência & Métodos • Rota: /admin/integracoes-ia
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 7: Integrações de IA & O Sensei Corporativo
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Inteligência Aumentada a Serviço do Gemba
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  A inteligência artificial não substitui a ida ao Gemba, mas acelera brutalmente o trabalho analítico do engenheiro.
                  Tarefas que antes consumiam dias — como sintetizar dados de paradas, estruturar hipóteses para os 5 Porquês, pesquisar artigos acadêmicos ou redigir Procedimentos Operacionais Padrão (POPs) — agora são executadas em segundos com o suporte de IA contextualizada.
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Bot size={18} /> A Lógica da Tela de Integrações de IA
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  A tela gerencia os conectores com modelos avançados de IA (Google Gemini Pro / Flash).
                  O <strong>Sensei Corporativo</strong> atua como co-piloto nos projetos PDCA, auxiliando na redação técnica de causas-raiz, na estruturação de planos 5W2H e na tutoria de capacitação da equipe.
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 8: CUSTO EVITADO & ROI (AS 7 FONTES CANÔNICAS)           */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 9 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Inteligência & Métodos • Rota: /admin/relatorios & /agente/relatorio-pessoal
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 8: Custo Evitado & ROI (As 7 Fontes Canônicas)
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Equação de Lucro Reversa de Taiichi Ohno
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Na economia tradicional, as empresas operavam sob a ilusão da fórmula: <code>Custo + Lucro Desejado = Preço de Venda</code>.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Taiichi Ohno inverteu esse axioma para: <code>Preço de Venda (definido pelo mercado) − Custo = Lucro</code>. Se o cliente define o preço, a única variável sob controle da fábrica é a redução drástica de custos através da eliminação do desperdício. O FluxoLean quantifica <em>Custo Evitado (Cost Avoidance)</em> para que a Controladoria audite com fé pública.
                </p>
              </div>

              <div className="colored-card card-green">
                <strong style={{ color: '#15803d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <TrendingUp size={18} /> A Lógica da Tela de Relatórios de Custo Evitado & ROI
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  Apresenta a DRE Gerencial de Melhoria Contínua. Os inputs são limpos e diretos, sem spinners desconfortáveis, e para cada fonte informada é obrigatório anexar a planilha de memória para auditoria contábil.
                </p>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                Memoriais de Cálculo das 7 Fontes Canônicas no Estilo FluxoLean
              </h3>

              {/* FONTE 1: MOD */}
              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    👷‍♂️ 1. Mão de Obra Direta (MOD / Tempo de Ciclo)
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
                    📈 3. Capacidade Adicional no Gargalo (Throughput / TOC)
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

              {/* CONSOLIDAÇÃO DE ROI */}
              <div className="lean-formula-container" style={{ borderColor: '#86efac', backgroundColor: '#f0fdf4' }}>
                <div className="formula-header">
                  <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#15803d' }}>
                    💰 Consolidação: Economia Líquida, ROI Real e Payback Amortizado
                  </span>
                </div>
                <div className="formula-pills-row">
                  <span className="formula-pill">[ Ganho Bruto Total (7 Fontes) ]</span>
                  <span className="formula-operator">−</span>
                  <span className="formula-pill">[ Investimento do Projeto ]</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-result-pill">Economia Líquida (R$)</span>
                </div>
                <div className="formula-example-box" style={{ backgroundColor: '#ffffff', borderColor: '#bbf7d0', color: '#166534' }}>
                  Ganho Bruto Anual = <strong>R$ 592.976,00 / ano</strong> | Investimento = <strong>R$ 85.000,00</strong>.<br />
                  • <strong>Economia Líquida no 1º Ano = R$ 507.976,00.</strong><br />
                  • <strong>ROI Líquido = 597,6%.</strong><br />
                  • <strong>Payback Amortizado = 1,72 meses (52 dias corridos).</strong>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 9: ACADEMIA LEAN & FERRAMENTAS OPERACIONAIS              */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 10 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Inteligência & Métodos • Rota: /agente/ferramentas & /agente/ferramentas/cronoanalise
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 9: Academia Lean & Ferramentas Operacionais: Cronoanálise, Artigos IA e Exames
                </h2>
              </div>

              {/* PARTE 1: A ACADEMIA LEAN E EDUCAÇÃO CORPORATIVA */}
              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Gestão do Conhecimento Vivo & IA Generativa
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Na fábrica tradicional, os manuais de treinamento são apostilas pesadas em PDF que ficam arquivadas em armários e que ninguém lê.
                  Na filosofia Lean moderna, o conhecimento deve ser vivo, dinâmico, modular e constantemente atualizado pela inteligência coletiva e pelas novas tecnologias de IA.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  A <strong>Academia Lean do FluxoLean</strong> transforma o processo de capacitação corporativa através de 6 funcionalidades pioneiras:
                </p>
              </div>

              {/* AS 6 GRANDES INOVAÇÕES DA ACADEMIA */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', margin: '1.25rem 0' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '1.15rem' }}>
                  <strong style={{ color: '#0284c7', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <BookOpen size={18} /> 1. Acervo de Artigos Técnicos Industriais
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155', lineHeight: 1.6 }}>
                    Artigos práticos abordando 5S, SMED (Troca Rápida de Ferramentas), Poka-Yoke, VSM, OEE, Trabalho Padrão e os 8 Desperdícios da Toyota, escritos especificamente para a realidade de chão de fábrica.
                  </p>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '1.15rem' }}>
                  <strong style={{ color: '#16a34a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <Sparkles size={18} /> 2. Co-Criação de Artigos com o Sensei IA
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155', lineHeight: 1.6 }}>
                    O Gestor Master digita um tema ou dor fabril (ex: &quot;Balanceamento de Linha em Montagem de Chicotes&quot;). O Sensei IA pesquisa, estrutura e redige um artigo completo com conceitos-chave, casos reais e passos no Gemba.
                  </p>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e9d5ff', borderRadius: '10px', padding: '1.15rem' }}>
                  <strong style={{ color: '#9333ea', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <MessageSquare size={18} /> 3. Refinamento Interativo via Chat com Sensei
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155', lineHeight: 1.6 }}>
                    Interface de chat em tempo real onde o gestor conversa com o Sensei para alterar seções, acrescentar exemplos da própria fábrica ou aprofundar termos técnicos antes da publicação oficial.
                  </p>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '1.15rem' }}>
                  <strong style={{ color: '#d97706', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <Bot size={18} /> 4. Tutoria Ativa em Artigos 24/7
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155', lineHeight: 1.6 }}>
                    Durante a leitura de qualquer artigo, o aluno pode abrir o chat do Sensei para pedir analogias do seu posto de trabalho, tirar dúvidas pontuais ou solicitar testes práticos para fixação mental.
                  </p>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '1.15rem' }}>
                  <strong style={{ color: '#dc2626', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <CheckSquare size={18} /> 5. Gerador Dinâmico de 50 Questões
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155', lineHeight: 1.6 }}>
                    O Sensei IA lê todo o acervo de artigos cadastrados no tenant e formula dinamicamente questões inéditas de múltipla escolha com gabarito comentado, garantindo que o exame não seja decorado.
                  </p>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '1.15rem' }}>
                  <strong style={{ color: '#475569', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <Clock size={18} /> 6. Telemetria Ativa & Regra Anti-Chute
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155', lineHeight: 1.6 }}>
                    O sistema exige tempo mínimo de rolagem na leitura para validar o artigo (impedindo scroll rápido) e aplica a regra anti-chute na prova: cada erro anula um acerto. Reprovações retrocedem o percentual de capacitação para 50%, exigindo releitura.
                  </p>
                </div>
              </div>

              {/* PARTE 2: INSTRUMENTAÇÃO OPERACIONAL DO GEMBA & CRONOANÁLISE */}
              <div className="lean-pedagogy-box" style={{ marginTop: '1.75rem' }}>
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Engenharia de Tempos de Shigeo Shingo e a NR-17
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  Não existe melhoria contínua sem a medição objetiva dos ciclos de trabalho.
                  A cronoanálise científica decompõe a operação em micromovimentos, separando o que é tempo de agregação de valor das esperas e movimentações inúteis.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  A determinação do <strong>Tempo Padrão (TP)</strong> considera o ritmo real do operador e as concessões humanas de fadiga e necessidades pessoais (conforme a NR-17 de Ergonomia), gerando a base para o balanceamento de linha contra o <em>Takt Time</em>.
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Timer size={18} /> A Lógica da Ferramenta de Cronoanálise no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  Integrada ao hub de Ferramentas Operacionais, o agente cronometra cada elemento da tarefa com voltas parciais digitais.
                  O sistema calcula a média amostral, permite atribuir o fator de velocidade do operador e a porcentagem de concessões de tolerância, entregando automaticamente o Tempo Padrão com memória auditável.
                </p>
              </div>

              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calculator size={16} color="#0284c7" /> Equação 9.1 — Determinação Matemática do Tempo Padrão (TP)
                  </span>
                </div>

                <div className="formula-pills-row">
                  <span className="formula-pill">Tempo Normal (TN)</span>
                  <span className="formula-operator">=</span>
                  <span className="formula-pill">Tempo Cronometrado Médio (TC)</span>
                  <span className="formula-operator">×</span>
                  <span className="formula-pill">[ Fator de Ritmo do Operador (V) ÷ 100 ]</span>
                </div>

                <div className="formula-pills-row" style={{ marginTop: '0.35rem' }}>
                  <span className="formula-result-pill">
                    Tempo Padrão (TP) = TN × [ 1 ÷ ( 1 − Fator de Concessões/Fadiga ) ]
                  </span>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* SEÇÃO 4: FÁBRICA & COMUNICAÇÃO                                    */}
            {/* CAPÍTULO 10: TPM & GESTÃO AUTÔNOMA                                */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 11 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Fábrica & Comunicação • Rota: /admin/tpm & /agente/tpm
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 10: TPM (Manutenção Produtiva Total) & Gestão Autônoma
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Jishu Hozen e a Conexão com a NR-12
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Manutenção Autônoma (Jishu Hozen - Seiichi Nakajima):</strong> O TPM rompe a barreira do &quot;eu opero, você conserta&quot;. O operador é o primeiro sensor da máquina: ele ouve um ruído anômalo ou enxerga um vazamento horas antes da quebra catastrófica.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Segurança Operacional (NR-12 e 5S):</strong> Máquinas limpas, organizadas e com proteções mecânicas em dia previnem acidentes graves no chão de fábrica.
                </p>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Settings size={18} /> A Lógica da Tela de TPM no FluxoLean
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  O operador registra anomalias pelo celular com fotos da falha.
                  O sistema classifica automaticamente entre <strong>Etiqueta Vermelha</strong> (Manutenção Especializada com bloqueio LOTO)
                  e <strong>Etiqueta Azul</strong> (Manutenção Autônoma 5S realizada pelo próprio operador no posto).
                </p>
              </div>

              <div className="lean-formula-container">
                <div className="formula-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BarChart3 size={16} color="#0284c7" /> Equação 10.1 — Índice de Eficiência Global do Equipamento (OEE)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Meta Classe Mundial: ≥ 85%
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
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 11: CANAL KAIZEN                                         */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 12 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Menu: Fábrica & Comunicação • Rota: /admin/canal-kaizen & /canal-kaizen/nova-ideia
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 11: Canal Kaizen & Democratização da Inovação na Base
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: Gemba Kaizen e o Sistema Teian
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>Gemba (O Ponto Onde o Valor é Criado):</strong> Conforme defendido por Masaaki Imai, a verdadeira engenharia industrial acontece ouvindo quem opera as máquinas. O sistema Teian Kaizen democratiza o envio de sugestões, eliminando formulários burocráticos.
                </p>
              </div>

              <div className="colored-card card-green">
                <strong style={{ color: '#15803d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Lightbulb size={18} /> A Lógica da Tela do Canal Kaizen
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  Formulário preenchido em 60 segundos na tela do smartphone, com captura de foto e envio direto para a Triagem.
                  O feed corporativo divulga os Kaizens implementados com fotos de Antes vs Depois, reconhecendo os colaboradores perante toda a fábrica.
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* SEÇÃO 5: NÚCLEO EXECUTIVO & GOVERNANÇA                            */}
            {/* CAPÍTULO 12: PROJETOS PDCA EM 4 PORTÕES & RELATÓRIO A3            */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 13 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Núcleo Metodológico • Rota: /admin/projetos/[id] & /relatorio-a3
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 12: Projetos PDCA em 4 Portões Rígidos & Relatório A3
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Disciplina Intelectual da Folha A3
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  <strong>A Origem do Relatório A3 (John Shook):</strong> Na Toyota, o formato de folha A3 (420 × 297 mm) foi criado como uma restrição física deliberada para exercitar o poder de síntese e o alinhamento técnico transversal (Nemawashi).
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  A transição entre as fases do PDCA deve conter travas de qualidade: só avança para a fase seguinte com validação completa dos portões.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1rem' }}>
                  <strong style={{ color: '#15803d', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    1. PLAN: Diagnóstico no Gemba
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Ishikawa 6M interativo, técnica dos 5 Porquês e estratificação de Pareto 80/20 até a causa-raiz física.
                  </span>
                </div>

                <div style={{ backgroundColor: '#fefce8', border: '1.5px solid #fde047', borderRadius: '10px', padding: '1rem' }}>
                  <strong style={{ color: '#a16207', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    2. DO: Execução 5W2H
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Matriz 5W2H com indicação mandatória do setor corresponsável para apuração de dependências externas.
                  </span>
                </div>

                <div style={{ backgroundColor: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: '10px', padding: '1rem' }}>
                  <strong style={{ color: '#6d28d9', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    3. CHECK: Verificação & Memória
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Fotos de Antes vs Depois, cálculo de variação de capabilidade e upload obrigatório de planilha com memória de cálculo.
                  </span>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '10px', padding: '1rem' }}>
                  <strong style={{ color: '#1d4ed8', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                    4. ACT: Padronização & Yokoten
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Procedimento Operacional Padrão (POP), Poka-Yoke e replicação lateral para setores semelhantes.
                  </span>
                </div>
              </div>

              <div className="colored-card card-blue">
                <strong style={{ color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <Layers size={18} /> Geração do Relatório A3 Executivo Oficial
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  Ao clicar em <em>Imprimir Relatório A3</em>, o sistema compila todas as abas em uma folha A3 paisagem limpa e perfeitamente balanceada, pronta para reuniões de diretoria e auditorias externas.
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 13: PORTAL DE AUDITORIA DA CONTROLADORIA & FÉ PÚBLICA    */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 14 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Governança & Compliance • Rota: /controladoria/auditoria/[token]
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 13: Portal de Auditoria da Controladoria & Fé Pública Contábil
                </h2>
              </div>

              <div className="lean-pedagogy-box">
                <div className="lean-pedagogy-title">
                  <BookmarkCheck size={20} color="#0f172a" /> Momento de Aprendizado Lean: A Fé Pública Contábil
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
                  No FluxoLean, encerramos a disputa histórica entre chão de fábrica e finanças.
                  A engenharia calcula e anexa a memória; a Controladoria analisa os comprovantes contábeis e concede Fé Pública ao resultado, garantindo credibilidade absoluta perante a alta administração.
                </p>
              </div>

              <div className="colored-card card-purple">
                <strong style={{ color: '#7e22ce', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <ShieldCheck size={18} /> O Portal do Auditor Contábil
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.7 }}>
                  Link com token criptográfico seguro disparado automaticamente na fase CHECK.
                  O auditor baixa a planilha anexada pelo agente, digita os valores homologados e pode:
                  (1) <em>Homologar com 1 clique</em>; (2) <em>Homologar com ajustes</em> (com parecer e contra-planilha facultativa); ou (3) <em>Rejeitar com justificativa técnica</em> para revisão obrigatória pelo agente.
                </p>
              </div>

              <div className="colored-card card-amber">
                <strong style={{ color: '#92400e', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <Clock size={16} /> Regra de Ouro dos 3 Meses de Acompanhamento (Estabilização do Run Rate)
                </strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f', lineHeight: 1.6 }}>
                  Após a validação contábil, o projeto entra em 90 dias de monitoramento ativo para comprovação do cumprimento contínuo do POP, assegurando que o retorno não decorreu de uma oscilação sazonal.
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* CAPÍTULO 14: BIBLIOGRAFIA ACADÊMICA RIGOROSA (ABNT NBR 6023)      */}
            {/* ================================================================= */}
            <section className={`monograph-chapter-section ${activeChapter === 15 ? 'active-chapter' : ''}`}>
              <div className="chapter-header-box" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Referencial Teórico Consagrado
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  Capítulo 14: Bibliografia Acadêmica Rigorosa & Referencial ABNT
                </h2>
              </div>

              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                A modelagem matemática, os conceitos de fluxo e a arquitetura do <strong>FluxoLean</strong> foram inspirados nas obras mais respeitadas
                da engenharia de produção e do Lean Manufacturing mundial:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    ref: 'OHNO, Taiichi. Toyota Production System: Beyond Large-Scale Production. Portland: Productivity Press, 1988.',
                    nota: 'Origem dos 7 Grandes Desperdícios (Muda), produção puxada por cartões visuais (Kanban) e a equação reversa de preço de venda.',
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
