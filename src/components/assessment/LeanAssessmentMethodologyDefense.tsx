'use client';

import React, { useState } from 'react';
import { ShieldCheck, Calculator, ChevronDown, ChevronUp, Award, TrendingUp, AlertTriangle, Scale, BarChart3, CheckCircle2 } from 'lucide-react';

interface LeanAssessmentMethodologyDefenseProps {
  defaultExpanded?: boolean;
  compact?: boolean;
}

export const LeanAssessmentMethodologyDefense: React.FC<LeanAssessmentMethodologyDefenseProps> = ({
  defaultExpanded = true,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'pilares' | 'memorial'>('memorial');

  // Estados para Simulação da Formação da Conta (Etapa 5)
  const [simMachineHours, setSimMachineHours] = useState<number>(120);
  const [simHourlyRate, setSimHourlyRate] = useState<number>(350);
  const [simScrapKg, setSimScrapKg] = useState<number>(2800);
  const [simScrapKgRate, setSimScrapKgRate] = useState<number>(8.5);
  const [simSetupHours, setSimSetupHours] = useState<number>(45);
  const [simSetupHourlyRate, setSimSetupHourlyRate] = useState<number>(180);
  const [simOvertimeHours, setSimOvertimeHours] = useState<number>(95);
  const [simOvertimeRate, setSimOvertimeRate] = useState<number>(65);

  const subtotalOEE = simMachineHours * simHourlyRate;
  const subtotalScrap = simScrapKg * simScrapKgRate;
  const subtotalSetup = simSetupHours * simSetupHourlyRate;
  const subtotalOvertime = simOvertimeHours * simOvertimeRate;
  const totalFormedSavings = subtotalOEE + subtotalScrap + subtotalSetup + subtotalOvertime;

  return (
    <div
      style={{
        backgroundColor: '#090d16',
        border: '1.5px solid rgba(34, 211, 238, 0.25)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Cabeçalho Clicável */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '1.15rem 1.5rem',
          backgroundColor: 'rgba(34, 211, 238, 0.05)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(34, 211, 238, 0.15)',
              border: '1.5px solid #22d3ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
            }}
          >
            🛡️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Defesa da Metodologia & Memorial de Cálculo dos Percentuais
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 700 }}>
              Fundamentação científica, pesos por criticidade operacional e formulação matemática
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22d3ee' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{isExpanded ? 'Recolher' : 'Expandir'}</span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isExpanded && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Seletor de Abas Interno */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('memorial')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'memorial' ? 'rgba(34, 211, 238, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'memorial' ? '#22d3ee' : '#94a3b8',
                fontWeight: activeTab === 'memorial' ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Calculator size={14} /> 🧮 Memorial de Cálculo Matemático
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pilares')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'pilares' ? 'rgba(34, 211, 238, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'pilares' ? '#22d3ee' : '#94a3b8',
                fontWeight: activeTab === 'pilares' ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ShieldCheck size={14} /> 🏛️ Os 4 Pilares Científicos
            </button>
          </div>

          {/* ABA 1: MEMORIAL DE CÁLCULO MATEMÁTICO */}
          {activeTab === 'memorial' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: 'rgba(34, 211, 238, 0.04)',
                  border: '1px solid rgba(34, 211, 238, 0.15)',
                  borderRadius: '10px',
                  padding: '0.85rem 1.15rem',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: '#22d3ee' }}>Por que este memorial é transparente e rastreável?</strong>
                <br />
                O modelo Lean Flow System não utiliza fórmulas ocultas ou caixas-pretas. Cada percentual exibido nos polígonos e no gráfico de radar decorre de uma rigorosa cascata matemática auditável em 5 etapas, conectando a observação física no Gemba ao resultado financeiro de Custo Evitado.
              </div>

              {/* Etapa 1: Escala Likert de Campo */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(34, 211, 238, 0.18)', color: '#22d3ee', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      ETAPA 1
                    </span>
                    <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                      Conversão Linear da Escala Likert de Campo (1★ a 5★)
                    </strong>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Passo = 20% por estrela
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Cada um dos 18 critérios objetivos é pontuado presencialmente no Gemba Walk pelo avaliador em uma escala comportamental de 1 a 5 estrelas:
                </p>

                {/* Bloco de Fórmula */}
                <div
                  style={{
                    backgroundColor: '#030712',
                    border: '1px solid rgba(34, 211, 238, 0.25)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem',
                    color: '#22d3ee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  Score do Critério (i) = ( Estrelas_i / 5 ) × 100%
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                    <strong style={{ color: '#f87171', fontSize: '0.75rem', display: 'block' }}>1★ = 20%</strong>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Reativo / Caótico</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '6px', padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                    <strong style={{ color: '#fb923c', fontSize: '0.75rem', display: 'block' }}>2★ = 40%</strong>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Iniciante / Básico</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '6px', padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                    <strong style={{ color: '#facc15', fontSize: '0.75rem', display: 'block' }}>3★ = 60%</strong>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Padronizado</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px', padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                    <strong style={{ color: '#34d399', fontSize: '0.75rem', display: 'block' }}>4★ = 80%</strong>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Avançado</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '6px', padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                    <strong style={{ color: '#22d3ee', fontSize: '0.75rem', display: 'block' }}>5★ = 100%</strong>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Classe Mundial</span>
                  </div>
                </div>
              </div>

              {/* Etapa 2: Média Ponderada da Dimensão */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(192, 132, 252, 0.18)', color: '#c084fc', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      ETAPA 2
                    </span>
                    <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                      Média Ponderada da Dimensão (Pesos por Criticidade de Falha)
                    </strong>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#c084fc', backgroundColor: 'rgba(192, 132, 252, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Pesos Estruturais w = 3 vs Suporte w = 2
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Nem todo critério possui o mesmo impacto na continuidade fabril. Critérios que causam paradas imediatas de máquina ou geração direta de refugo possuem peso 3 (ex: ferramentas no ponto de uso, Poka-Yoke físico, rotina LIP). Critérios de gestão visual e registro possuem peso 2.
                </p>

                {/* Bloco de Fórmula */}
                <div
                  style={{
                    backgroundColor: '#030712',
                    border: '1px solid rgba(192, 132, 252, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem',
                    color: '#c084fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  Score da Dimensão (S_D) = [ ∑ (Score_i × w_i) ] / [ ∑ w_i ]
                </div>

                {/* Exemplo Numérico Passo a Passo */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    📝 Exemplo Prático Real de Cálculo (Dimensão Estabilidade Básica & 5S):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                    <li>Item 1: Descarte & Organização a &lt;2m (<strong>Peso 3</strong>) ➔ Avaliado em <strong>4★ (80%)</strong> ➔ 80 × 3 = <strong>240 pts</strong></li>
                    <li>Item 2: Limpeza com Inspeção Ativa de Vazamentos (<strong>Peso 2</strong>) ➔ Avaliado em <strong>3★ (60%)</strong> ➔ 60 × 2 = <strong>120 pts</strong></li>
                    <li>Item 3: Gestão Visual Hora a Hora no Posto (<strong>Peso 2</strong>) ➔ Avaliado em <strong>4★ (80%)</strong> ➔ 80 × 2 = <strong>160 pts</strong></li>
                  </ul>
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: '#34d399' }}>
                    S_D = ( 240 + 120 + 160 ) / ( 3 + 2 + 2 ) = 520 / 7 ≈ <strong>74.29% ➔ 74% (Nível 4: Avançado)</strong>
                  </div>
                </div>
              </div>

              {/* Etapa 3: Score Global de Maturidade Fabril */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(251, 191, 36, 0.18)', color: '#fbbf24', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      ETAPA 3
                    </span>
                    <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                      Score Geral do Setor (Média Equilibrada das 6 Dimensões TPS)
                    </strong>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Matriz de 6 Dimensões
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  O Score Geral do Setor sintetiza o nível global da manufatura enxuta através da média aritmética das 6 dimensões vitais:
                </p>

                {/* Bloco de Fórmula */}
                <div
                  style={{
                    backgroundColor: '#030712',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  Score Geral do Setor = ( S_5S + S_POPs + S_JIT + S_Qual + S_TPM + S_Kaizen ) / 6
                </div>

                {/* Tabela de Enquadramento */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.725rem' }}>
                  <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderLeft: '3px solid #ef4444', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>0% a 39%</span>
                    <strong style={{ color: '#f87171' }}>Nível 1: Reativo</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderLeft: '3px solid #f97316', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>40% a 59%</span>
                    <strong style={{ color: '#fb923c' }}>Nível 2: Iniciante</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderLeft: '3px solid #eab308', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>60% a 70%</span>
                    <strong style={{ color: '#facc15' }}>Nível 3: Padronizado</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderLeft: '3px solid #10b981', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>71% a 80%</span>
                    <strong style={{ color: '#34d399' }}>Nível 4: Avançado</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderLeft: '3px solid #06b6d4', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>81% a 100%</span>
                    <strong style={{ color: '#22d3ee' }}>Nível 5: Classe Mundial</strong>
                  </div>
                </div>
              </div>

              {/* Etapa 4: Teoria das Restrições e Área do Polígono */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.18)', color: '#34d399', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      ETAPA 4
                    </span>
                    <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                      Geometria do Gráfico de Radar & Teoria das Restrições (Goldratt)
                    </strong>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Área Hexagonal: θ = 60°
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  A área geométrica do polígono de radar é calculada pela soma dos 6 triângulos adjacentes com ângulo central de 60° (π/3 rad):
                </p>

                {/* Bloco de Fórmula Geométrica */}
                <div
                  style={{
                    backgroundColor: '#030712',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  Área do Polígono = ( √3 / 4 ) × ∑ [ r_k × r_(k+1) ] , onde r_7 = r_1
                </div>

                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  <strong style={{ color: '#f87171' }}>⚠️ A Prova Científica de que o Radar Supera a Média do Excel:</strong>
                  <br />
                  Se um setor tiver 5 dimensões em 90% e apenas 1 dimensão em 30% (ex: Poka-Yoke negligenciado), o Excel tradicional reporta uma média aparentemente boa de 80% (escondendo o risco da fábrica).
                  Porém, na fórmula geométrica do polígono, os dois setores adjacentes multiplicam 90 × 30 = 2.700 (em vez de 90 × 90 = 8.100), gerando uma contração violenta de <strong>66.7% na área visual</strong>.
                  Isso expõe matematicamente a <em>Lei do Elo Mais Fraco</em>: a fábrica produz no ritmo da sua maior restrição operacional.
                </div>
              </div>

              {/* Etapa 5: Conversão em Custo Evitado com a Conta Aberta */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1.5px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '12px',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      ETAPA 5
                    </span>
                    <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                      Formação Detalhada do Custo Evitado (A Conta Aberta ao Lado do Resultado)
                    </strong>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
                    Transparência & Confiança Financeira
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.785rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  Para que a Diretoria Executiva e os auditores validem o retorno financeiro do Lean Assessment, <strong>a conta matemática é exibida explicitamente junto do resultado final</strong>. Nenhum valor surge sem a sua multiplicação física de chão de fábrica (Horas × Tarifa, Quilos × Preço).
                </p>

                {/* BLOCO DA CONTA ABERTA (A EQUAÇÃO RESOLVIDA COM OS NÚMEROS REAIS) */}
                <div
                  style={{
                    backgroundColor: '#020617',
                    border: '1.5px solid #22d3ee',
                    borderRadius: '10px',
                    padding: '1.15rem 1.25rem',
                    boxShadow: '0 0 25px rgba(34, 211, 238, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ⚡ Equação Numérica da Formação do Valor (Memória de Cálculo Aberta):
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Valores mensais auditados</span>
                  </div>

                  {/* Linha 1: Parênteses da Multiplicação Física */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: '#93c5fd',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      overflowX: 'auto',
                      whiteSpace: 'nowrap',
                      borderLeft: '3px solid #38bdf8',
                    }}
                  >
                    [ ({simMachineHours}h × R$ {simHourlyRate},00) + ({simScrapKg.toLocaleString('pt-BR')}kg × R$ {simScrapKgRate.toFixed(2)}) + ({simSetupHours}h × R$ {simSetupHourlyRate},00) + ({simOvertimeHours}h × R$ {simOvertimeRate},00) ]
                  </div>

                  {/* Linha 2: Parcelas Subtotais Somadas */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: '#cbd5e1',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      overflowX: 'auto',
                      whiteSpace: 'nowrap',
                      borderLeft: '3px solid #c084fc',
                    }}
                  >
                    [ R$ {subtotalOEE.toLocaleString('pt-BR')},00 + R$ {subtotalScrap.toLocaleString('pt-BR')},00 + R$ {subtotalSetup.toLocaleString('pt-BR')},00 + R$ {subtotalOvertime.toLocaleString('pt-BR')},00 ]
                  </div>

                  {/* Linha 3: O Resultado Final em Destaque */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      border: '1.5px solid #10b981',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                        = Custo Evitado Mensal Consolidado
                      </span>
                      <strong style={{ fontSize: '1.45rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        R$ {totalFormedSavings.toLocaleString('pt-BR')},00
                      </strong>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block' }}>
                        Impacto Anualizado Projetado (12 meses):
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        R$ {(totalFormedSavings * 12).toLocaleString('pt-BR')},00 / ano
                      </strong>
                    </div>
                  </div>
                </div>

                {/* TABELA DE DECOMPOSIÇÃO DAS 4 PARCELAS LEAN */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem', fontWeight: 700 }}>Parcela / Dimensão Lean</th>
                        <th style={{ padding: '0.5rem', fontWeight: 700 }}>Variável de Chão de Fábrica</th>
                        <th style={{ padding: '0.5rem', fontWeight: 700 }}>Multiplicador Unitário</th>
                        <th style={{ padding: '0.5rem', fontWeight: 700 }}>Memória da Conta (A Operação)</th>
                        <th style={{ padding: '0.5rem', fontWeight: 700, textAlign: 'right' }}>Subtotal Gerado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <strong style={{ color: '#22d3ee' }}>1. Disponibilidade OEE (TPM)</strong>
                          <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Microparadas e quebras evitadas</div>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
                          {simMachineHours} horas recuperadas
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                          R$ {simHourlyRate},00 / hora-máquina
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>
                          {simMachineHours} × R$ {simHourlyRate},00
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399' }}>
                          R$ {subtotalOEE.toLocaleString('pt-BR')},00
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <strong style={{ color: '#c084fc' }}>2. Qualidade & Refugos (Poka-Yoke)</strong>
                          <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Aparas e resina não descartadas</div>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
                          {simScrapKg.toLocaleString('pt-BR')} kg eliminados
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                          R$ {simScrapKgRate.toFixed(2)} / kg de resina
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#c084fc' }}>
                          {simScrapKg.toLocaleString('pt-BR')} × R$ {simScrapKgRate.toFixed(2)}
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399' }}>
                          R$ {subtotalScrap.toLocaleString('pt-BR')},00
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <strong style={{ color: '#fbbf24' }}>3. Troca Rápida de Matriz (SMED / JIT)</strong>
                          <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Tempo de setup convertido em produção</div>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
                          {simSetupHours} horas de setup salvas
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                          R$ {simSetupHourlyRate},00 / hora
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#fcd34d' }}>
                          {simSetupHours} × R$ {simSetupHourlyRate},00
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399' }}>
                          R$ {subtotalSetup.toLocaleString('pt-BR')},00
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <strong style={{ color: '#38bdf8' }}>4. Padronização Operacional (5S & POPs)</strong>
                          <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Corte de retrabalho e horas extras</div>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
                          {simOvertimeHours} horas extras cortadas
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                          R$ {simOvertimeRate},00 / hora c/ encargos
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#7dd3fc' }}>
                          {simOvertimeHours} × R$ {simOvertimeRate},00
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399' }}>
                          R$ {subtotalOvertime.toLocaleString('pt-BR')},00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SIMULADOR INTERATIVO DE FORMAÇÃO DA CONTA */}
                <div
                  style={{
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Calculator size={15} color="#22d3ee" />
                      <strong style={{ fontSize: '0.8rem', color: '#ffffff' }}>
                        Simulador Interativo: Teste com os Parâmetros da Sua Fábrica
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Altere os valores abaixo para ver a conta se reescrever em tempo real:
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                        Horas Salvas de Máquina (OEE):
                      </label>
                      <input
                        type="number"
                        value={simMachineHours}
                        onChange={(e) => setSimMachineHours(Number(e.target.value) || 0)}
                        style={{ width: '100%', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '0.35rem 0.6rem', color: '#ffffff', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                        Custo/Hora de Máquina (R$):
                      </label>
                      <input
                        type="number"
                        value={simHourlyRate}
                        onChange={(e) => setSimHourlyRate(Number(e.target.value) || 0)}
                        style={{ width: '100%', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '0.35rem 0.6rem', color: '#ffffff', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                        Refugo Evitado (kg de Matéria-Prima):
                      </label>
                      <input
                        type="number"
                        value={simScrapKg}
                        onChange={(e) => setSimScrapKg(Number(e.target.value) || 0)}
                        style={{ width: '100%', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '0.35rem 0.6rem', color: '#ffffff', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                        Preço da Matéria-Prima (R$/kg):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={simScrapKgRate}
                        onChange={(e) => setSimScrapKgRate(Number(e.target.value) || 0)}
                        style={{ width: '100%', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '0.35rem 0.6rem', color: '#ffffff', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.65rem' }}>
                  💡 <strong>Conclusão para Auditoria Master:</strong> A exibição da conta aberta ao lado do resultado blinda o Agente Lean e os líderes fabris de questionamentos subjetivos, comprovando com matemática elementar o capital preservado pela redução de desperdícios no chão de fábrica.
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: OS 4 PILARES CIENTÍFICOS */}
          {activeTab === 'pilares' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {/* Pilar 1 */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(34, 211, 238, 0.2)', color: '#22d3ee', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    PILAR 1
                  </span>
                  <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Fato Físico no Gemba (Genchi Genbutsu)</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.775rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  Diferente de auditorias formais de escritório que apenas verificam se há papéis assinados em pastas de rede, esta metodologia afere <strong>evidências físicas no posto</strong>: ferramentas dispostas no ponto de uso a menos de 2 metros, ausência de vazamentos, peças refugadas segregadas e quadros hora a hora atualizados pelos próprios operadores.
                </p>
              </div>

              {/* Pilar 2 */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    PILAR 2
                  </span>
                  <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Teoria das Restrições no Gráfico de Radar</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.775rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  Médias aritméticas lineares escondem os gargalos que paralisam a fábrica. O polígono do Radar revela visualmente a <strong>assimetria do fluxo</strong>: se o setor atinge 90% em 5S mas tem 30% em Poka-Yoke ou TPM, o gráfico se contrai violentamente naquele vértice, direcionando os projetos Kaizen com exatidão cirúrgica para onde há maior retorno.
                </p>
              </div>

              {/* Pilar 3 */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    PILAR 3
                  </span>
                  <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Escala Evolutiva Contínua (Níveis 1 a 5)</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.775rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  Avaliações binárias de &quot;Passou / Reprovou&quot; geram medo, dissimulação de falhas e resistência dos operadores. A escala comportamental em 5 níveis (Reativo ➔ Básico ➔ Padronizado ➔ Avançado ➔ Classe Mundial) cria uma rota pedagógica clara e transparente de melhoria contínua onde cada avanço é celebrado.
                </p>
              </div>

              {/* Pilar 4 */}
              <div
                style={{
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    PILAR 4
                  </span>
                  <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Conexão com Custo Evitado & ROI</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.775rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  O modelo não é um exercício acadêmico abstrato: cada 10 pontos conquistados no Radar traduzem-se diretamente em horas salvas de máquina, redução de refugos em toneladas de matéria-prima e eliminação de horas extras, alimentando o indicador financeiro de Custo Evitado auditado pela Entidade Master.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
