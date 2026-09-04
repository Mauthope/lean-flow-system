'use client';

import React, { useState } from 'react';
import { Sector, SectorLeanAssessment, LeanAssessmentDimension, LeanAssessmentDimensionId } from '@/lib/types';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { X, CheckCircle2, ChevronRight, ChevronLeft, Award, Sparkles, HelpCircle, AlertCircle, ShieldCheck, ListFilter, Layers, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeanAssessmentMethodologyDefense } from '@/components/assessment/LeanAssessmentMethodologyDefense';

interface SectorAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Sector;
  onSaved: (assessment: SectorLeanAssessment) => void;
}

export const SectorAssessmentModal: React.FC<SectorAssessmentModalProps> = ({
  isOpen,
  onClose,
  sector,
  onSaved,
}) => {
  const { currentUser } = useAuth();

  const [evaluatorName, setEvaluatorName] = useState(currentUser?.name || 'Agente Lean');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dimensions, setDimensions] = useState<LeanAssessmentDimension[]>(() =>
    dataService.getDefaultLeanAssessmentDimensions()
  );
  const [activeDimensionIndex, setActiveDimensionIndex] = useState(0);
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slide' | 'all'>('slide');
  const [isReviewSlide, setIsReviewSlide] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMethodologyDefense, setShowMethodologyDefense] = useState(false);
  const currentDimension = dimensions[activeDimensionIndex];
  const safeCriterionIndex = Math.min(activeCriterionIndex, (currentDimension?.criteria.length || 1) - 1);
  const currentCriterion = currentDimension?.criteria[safeCriterionIndex] || currentDimension?.criteria[0];

  // Contagem global das perguntas
  const totalQuestions = React.useMemo(() => {
    return dimensions.reduce((acc, dim) => acc + dim.criteria.length, 0);
  }, [dimensions]);

  const currentGlobalQuestionNumber = React.useMemo(() => {
    let count = 0;
    for (let i = 0; i < activeDimensionIndex; i++) {
      count += dimensions[i].criteria.length;
    }
    return count + safeCriterionIndex + 1;
  }, [dimensions, activeDimensionIndex, safeCriterionIndex]);

  const globalProgressPercent = Math.round(
    ((currentGlobalQuestionNumber - 1) / totalQuestions) * 100
  );

  const handleNextSlide = () => {
    if (isReviewSlide) return;
    if (safeCriterionIndex < currentDimension.criteria.length - 1) {
      setActiveCriterionIndex(safeCriterionIndex + 1);
    } else if (activeDimensionIndex < dimensions.length - 1) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
      });
      setActiveDimensionIndex((prev) => prev + 1);
      setActiveCriterionIndex(0);
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setIsReviewSlide(true);
    }
  };

  const handlePrevSlide = () => {
    if (isReviewSlide) {
      setIsReviewSlide(false);
      return;
    }
    if (safeCriterionIndex > 0) {
      setActiveCriterionIndex(safeCriterionIndex - 1);
    } else if (activeDimensionIndex > 0) {
      const prevDimIndex = activeDimensionIndex - 1;
      setActiveDimensionIndex(prevDimIndex);
      setActiveCriterionIndex(dimensions[prevDimIndex].criteria.length - 1);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA'].includes(activeTag)) {
        return;
      }

      if (viewMode === 'slide') {
        if (!isReviewSlide && ['1', '2', '3', '4', '5'].includes(e.key)) {
          const score = parseInt(e.key, 10);
          if (currentCriterion) {
            handleScoreChange(currentCriterion.id, score);
          }
        } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          handleNextSlide();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevSlide();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, viewMode, isReviewSlide, activeDimensionIndex, safeCriterionIndex, currentCriterion, dimensions, onClose]);

  if (!isOpen) return null;

  // Atualizar pontuação de um critério específico (1 a 5)
  const handleScoreChange = (criterionId: string, newScore: number) => {
    setDimensions((prev) =>
      prev.map((dim, idx) => {
        if (idx !== activeDimensionIndex) return dim;

        const updatedCriteria = dim.criteria.map((c) =>
          c.id === criterionId ? { ...c, score: newScore } : c
        );

        // Recalcular Score da Dimensão (Média ponderada 0 a 100%)
        const totalWeight = updatedCriteria.reduce((acc, c) => acc + c.weight, 0);
        const weightedSum = updatedCriteria.reduce((acc, c) => acc + (c.score / 5) * 100 * c.weight, 0);
        const dimScore = Math.round(weightedSum / totalWeight);

        let dimLevel: 1 | 2 | 3 | 4 | 5 = 1;
        if (dimScore >= 81) dimLevel = 5;
        else if (dimScore >= 61) dimLevel = 4;
        else if (dimScore >= 41) dimLevel = 3;
        else if (dimScore >= 21) dimLevel = 2;

        return {
          ...dim,
          criteria: updatedCriteria,
          score: dimScore,
          level: dimLevel,
        };
      })
    );
  };

  // Atualizar observação de um critério
  const handleCriterionObservationChange = (criterionId: string, notes: string) => {
    setDimensions((prev) =>
      prev.map((dim, idx) => {
        if (idx !== activeDimensionIndex) return dim;
        return {
          ...dim,
          criteria: dim.criteria.map((c) => (c.id === criterionId ? { ...c, observations: notes } : c)),
        };
      })
    );
  };

  // Cálculo do Score Geral Vigente
  const overallScore = Math.round(
    dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length
  );

  let overallLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (overallScore >= 81) overallLevel = 5;
  else if (overallScore >= 61) overallLevel = 4;
  else if (overallScore >= 41) overallLevel = 3;
  else if (overallScore >= 21) overallLevel = 2;

  const levelLabels = {
    1: 'Nível 1: Reativo (Desperdícios Ocultos)',
    2: 'Nível 2: Básico / Iniciante (Primeiros 5S)',
    3: 'Nível 3: Padronizado (POPs & Rotinas Vivas)',
    4: 'Nível 4: Avançado (Poka-Yoke & TPM Autônomo)',
    5: 'Nível 5: Classe Mundial (Fluxo Contínuo & Kaizen Diário)',
  };

  const handleSave = () => {
    setIsSubmitting(true);

    const dimensionScores: Record<LeanAssessmentDimensionId, number> = {
      estabilidade_5s: dimensions.find((d) => d.id === 'estabilidade_5s')?.score || 0,
      trabalho_padronizado: dimensions.find((d) => d.id === 'trabalho_padronizado')?.score || 0,
      fluxo_jit: dimensions.find((d) => d.id === 'fluxo_jit')?.score || 0,
      qualidade_poka_yoke: dimensions.find((d) => d.id === 'qualidade_poka_yoke')?.score || 0,
      tpm_oee: dimensions.find((d) => d.id === 'tpm_oee')?.score || 0,
      cultura_kaizen: dimensions.find((d) => d.id === 'cultura_kaizen')?.score || 0,
    };

    const senseiDiagnosis = dataService.generateSenseiAssessmentDiagnosis(dimensionScores, sector.name);

    const newAssessment = dataService.saveSectorAssessment({
      tenantId: sector.tenantId || 'tenant_rafitec_01',
      sectorId: sector.id,
      sectorName: sector.name,
      evaluatorId: currentUser?.id || 'usr_agent_01',
      evaluatorName,
      evaluatorRole: currentUser?.role || 'agent',
      assessmentDate: new Date(assessmentDate).toISOString(),
      overallScore,
      overallLevel,
      dimensions: dimensionScores,
      dimensionDetails: dimensions,
      senseiDiagnosis,
      notes: generalNotes,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#fbbf24', '#a855f7'],
      });
    } catch {
      // ignore
    }

    setIsSubmitting(false);
    onSaved(newAssessment);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.15)',
        }}
      >
        {/* Cabeçalho Compacto e Unificado (Zero Redundâncias) */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0c121e',
            gap: '0.75rem',
          }}
        >
          {/* Esquerda: Identificação do Setor & Score Geral */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#ffffff' }}>
                  {sector.name}
                </h4>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.675rem',
                    fontWeight: 800,
                    backgroundColor: `${sector.color || '#06b6d4'}22`,
                    color: sector.color || '#22d3ee',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    border: `1px solid ${sector.color || '#06b6d4'}44`,
                  }}
                >
                  {sector.code}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid #10b981',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '6px',
                  }}
                >
                  {overallScore}% (Nível {overallLevel})
                </span>
              </div>
            </div>
          </div>

          {/* Centro: As 6 Dimensões em Pills Compactos (Navegação Rápida) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
            {dimensions.map((dim, idx) => {
              const isActive = idx === activeDimensionIndex;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => {
                    setActiveDimensionIndex(idx);
                    setActiveCriterionIndex(0);
                    setIsReviewSlide(false);
                    if (viewMode === 'all') {
                      const el = document.getElementById(`dim-section-${dim.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: isActive ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? '1.5px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: isActive ? '#22d3ee' : '#94a3b8',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{idx + 1}. {dim.shortName}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: isActive ? '#ffffff' : '#64748b' }}>
                    {dim.score}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Direita: Ações Rápidas (Modo Lista/Slide, Metodologia, Fechar) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ display: 'flex', backgroundColor: '#090d16', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '0.1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('slide');
                  setIsReviewSlide(false);
                }}
                style={{
                  padding: '0.2rem 0.45rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: viewMode === 'slide' ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
                  color: viewMode === 'slide' ? '#22d3ee' : '#94a3b8',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Modo Slide Individual (Sem Rolagem)"
              >
                🎮 Slides
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                style={{
                  padding: '0.2rem 0.45rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: viewMode === 'all' ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
                  color: viewMode === 'all' ? '#22d3ee' : '#94a3b8',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Modo Lista Geral (38 Itens)"
              >
                📋 Lista
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMethodologyDefense(!showMethodologyDefense)}
              style={{
                backgroundColor: showMethodologyDefense ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                color: '#22d3ee',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.675rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Por que Esta Metodologia?"
            >
              <ShieldCheck size={13} /> Metodologia
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Banner Expansível da Metodologia */}
        {showMethodologyDefense && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#070a12',
              borderBottom: '1.5px solid rgba(34, 211, 238, 0.3)',
              maxHeight: '350px',
              overflowY: 'auto',
            }}
          >
            <LeanAssessmentMethodologyDefense defaultExpanded={true} />
          </div>
        )}

        {/* Barra de Progresso do Slide (Fina & Elegante) */}
        {viewMode === 'slide' && !isReviewSlide && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 1.25rem',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.725rem',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#22d3ee', fontWeight: 800 }}>
                Questão {currentGlobalQuestionNumber}/38
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>
                {currentDimension.shortName}
              </span>
              <span style={{ color: '#94a3b8' }}>({currentDimension.score}%)</span>
            </div>

            {/* Barra de Progresso Fina */}
            <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${globalProgressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7 0%, #22d3ee 50%, #10b981 100%)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>

            {/* Chips das perguntas da dimensão */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {currentDimension.criteria.map((crit, cIdx) => {
                const isCurrent = cIdx === safeCriterionIndex;
                const isRated = crit.score > 0;
                const ratingColor = crit.score >= 4 ? '#34d399' : crit.score >= 3 ? '#fbbf24' : '#f87171';

                return (
                  <button
                    key={crit.id}
                    type="button"
                    onClick={() => {
                      setActiveCriterionIndex(cIdx);
                      setIsReviewSlide(false);
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '5px',
                      border: isCurrent
                        ? '1.5px solid #22d3ee'
                        : isRated
                        ? `1px solid ${ratingColor}66`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: isCurrent
                        ? 'rgba(34, 211, 238, 0.25)'
                        : isRated
                        ? `${ratingColor}22`
                        : 'rgba(255, 255, 255, 0.03)',
                      color: isCurrent ? '#ffffff' : isRated ? ratingColor : '#94a3b8',
                      fontSize: '0.675rem',
                      fontWeight: isCurrent ? 900 : 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transition: 'all 0.15s ease',
                    }}
                    title={`Item ${cIdx + 1}: ${crit.title} (${crit.score}★)`}
                  >
                    {cIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conteúdo Principal (Com rolagem segura contra ocultamento) */}
        <div
          style={{
            flex: 1,
            padding: '1rem 1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {viewMode === 'all' ? (
            /* MODO LISTA COMPLETA */
            <>
              {dimensions.map((dim, dIdx) => (
                <div
                  key={dim.id}
                  id={`dim-section-${dim.id}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    paddingBottom: '1.25rem',
                    borderBottom: dIdx < dimensions.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(34, 211, 238, 0.06)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      borderRadius: '8px',
                      padding: '0.65rem 1rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.675rem', color: '#22d3ee', fontWeight: 800, textTransform: 'uppercase' }}>
                        Dimensão {dIdx + 1} de 6
                      </span>
                      <h4 style={{ margin: '0.1rem 0', fontSize: '0.95rem', color: '#ffffff', fontWeight: 800 }}>
                        {dim.name}
                      </h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                        {dim.score}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {dim.criteria.map((criterion, cIdx) => (
                      <div
                        key={criterion.id}
                        style={{
                          backgroundColor: '#0c121e',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.55rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>
                              Item {cIdx + 1} • Peso {criterion.weight}
                            </span>
                            <h5 style={{ margin: '0.1rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#ffffff' }}>
                              {criterion.title}
                            </h5>
                          </div>

                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSelected = criterion.score === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleScoreChange(criterion.id, val)}
                                  style={{
                                    width: '32px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    border: isSelected ? '1.5px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
                                    backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
                                    color: isSelected ? '#22d3ee' : '#94a3b8',
                                    fontWeight: isSelected ? 900 : 600,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {val}★
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Evidências ou anomalias..."
                          value={criterion.observations || ''}
                          onChange={(e) => handleCriterionObservationChange(criterion.id, e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#070a12',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '6px',
                            padding: '0.35rem 0.6rem',
                            color: '#ffffff',
                            fontSize: '0.725rem',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
                  Parecer Geral do Avaliador (Gemba Walk)
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva o parecer geral do setor..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#070a12',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    color: '#ffffff',
                    fontSize: '0.775rem',
                  }}
                />
              </div>
            </>
          ) : isReviewSlide ? (
            /* SLIDE FINAL DE CONCLUSÃO & SÍNTESE DO GEMBA (COMPACTO) */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '2rem' }}>🏆</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontWeight: 900 }}>
                      38 Critérios Mestres Avaliados com Sucesso
                    </h3>
                    <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                      Setor: <strong style={{ color: '#ffffff' }}>{sector.name}</strong> • Avaliador: <strong style={{ color: '#ffffff' }}>{evaluatorName}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {overallScore}%
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a7f3d0' }}>
                    Nível {overallLevel} ({levelLabels[overallLevel]})
                  </span>
                </div>
              </div>

              {/* Grid dos 6 Eixos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.45rem' }}>
                {dimensions.map((dim, idx) => (
                  <div
                    key={dim.id}
                    style={{
                      backgroundColor: '#0c121e',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.6rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.675rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dim.shortName}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                      {dim.score}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Parecer Geral do Gemba */}
              <div
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={14} color="#fbbf24" /> Parecer Geral do Avaliador (Gemba Walk)
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva o parecer geral do setor, postura das equipes e prioridades imediatas..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#070a12',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.65rem',
                    color: '#ffffff',
                    fontSize: '0.775rem',
                    resize: 'none',
                  }}
                />
              </div>
            </div>
          ) : (
            /* SLIDE EM 2 COLUNAS LADO A LADO (ZERO ROLAGEM) */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.25fr 1fr',
                gap: '1.15rem',
                alignItems: 'stretch',
              }}
            >
              {/* Coluna 1: O Que Auditar no Posto */}
              <div
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(34, 211, 238, 0.12)',
                        color: '#22d3ee',
                        border: '1px solid rgba(34, 211, 238, 0.25)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Item {safeCriterionIndex + 1}/{currentDimension.criteria.length}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        backgroundColor: currentCriterion.weight === 3 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: currentCriterion.weight === 3 ? '#f87171' : '#94a3b8',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                      }}
                    >
                      ⚖️ Peso {currentCriterion.weight} ({currentCriterion.weight === 3 ? 'Vital' : 'Médio'})
                    </span>
                  </div>

                  <h3 style={{ margin: '0.2rem 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800, lineHeight: 1.35 }}>
                    {currentCriterion.title}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0.5rem 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {currentCriterion.description}
                  </p>
                </div>

                {/* Caixa Unificada de Gemba + Checkpoints */}
                <div
                  style={{
                    backgroundColor: 'rgba(251, 191, 36, 0.06)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', color: '#fbbf24', fontWeight: 800 }}>
                    <AlertCircle size={14} />
                    <span>Verificação no Gemba (Checkpoints TPS):</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {(currentCriterion.checkpoints && currentCriterion.checkpoints.length > 0
                      ? currentCriterion.checkpoints
                      : [currentCriterion.gembaVerificationGuide]
                    ).map((chk, chkIdx) => (
                      <div
                        key={chkIdx}
                        style={{
                          fontSize: '0.725rem',
                          color: '#e2e8f0',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.35rem',
                          lineHeight: 1.3,
                        }}
                      >
                        <span style={{ color: '#22d3ee', fontWeight: 900 }}>✓</span>
                        <span>{chk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input de Evidências / Notas */}
                <div>
                  <input
                    type="text"
                    placeholder="Evidências físicas observadas ou anomalias no posto..."
                    value={currentCriterion.observations || ''}
                    onChange={(e) => handleCriterionObservationChange(currentCriterion.id, e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#070a12',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.6rem',
                      color: '#ffffff',
                      fontSize: '0.725rem',
                    }}
                  />
                </div>
              </div>

              {/* Coluna 2: Escala de Pontuação no Gemba (5 Botões Verticais) */}
              <div
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.45rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase' }}>
                    Classificação no Posto:
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Nota: <strong style={{ color: '#22d3ee' }}>{currentCriterion.score}★ de 5★</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = currentCriterion.score === val;
                    const levelColors: Record<number, { title: string; subtitle: string; bg: string; border: string; text: string; glow: string }> = {
                      1: { title: '1★ Reativo', subtitle: 'Gargalo visível / Sem padrão', bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#f87171', glow: '0 0 10px rgba(239, 68, 68, 0.35)' },
                      2: { title: '2★ Básico', subtitle: 'Início de rotina e controle', bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316', text: '#fb923c', glow: '0 0 10px rgba(249, 115, 22, 0.35)' },
                      3: { title: '3★ Padronizado', subtitle: 'POP cumprido no Gemba', bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#facc15', glow: '0 0 10px rgba(234, 179, 8, 0.35)' },
                      4: { title: '4★ Avançado', subtitle: 'Melhoria contínua autônoma', bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#34d399', glow: '0 0 10px rgba(16, 185, 129, 0.35)' },
                      5: { title: '5★ Classe Mundial', subtitle: 'Poka-Yoke total e sem perdas', bg: 'rgba(6, 182, 212, 0.2)', border: '#06b6d4', text: '#22d3ee', glow: '0 0 12px rgba(6, 182, 212, 0.45)' },
                    };
                    const col = levelColors[val];

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleScoreChange(currentCriterion.id, val)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${col.border}` : '1px solid rgba(255, 255, 255, 0.08)',
                          backgroundColor: isSelected ? col.bg : 'rgba(255, 255, 255, 0.02)',
                          color: isSelected ? col.text : '#cbd5e1',
                          cursor: 'pointer',
                          boxShadow: isSelected ? col.glow : 'none',
                          transform: isSelected ? 'scale(1.015)' : 'scale(1)',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>{col.title}</span>
                          <span style={{ fontSize: '0.675rem', opacity: isSelected ? 1 : 0.65 }}>
                            — {col.subtitle}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            color: isSelected ? col.text : '#64748b',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.1rem 0.3rem',
                            borderRadius: '3px',
                          }}
                        >
                          [{val}]
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Avaliador & Data (Compacto no Rodapé da Coluna) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.2rem', fontSize: '0.675rem', color: '#64748b' }}>
                  <span>Avaliador: <strong style={{ color: '#94a3b8' }}>{evaluatorName}</strong></span>
                  <span>Data: <strong style={{ color: '#94a3b8' }}>{assessmentDate}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Compacto com Navegação & Botão Salvar */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0c121e',
          }}
        >
          {viewMode === 'slide' ? (
            <>
              <button
                type="button"
                disabled={currentGlobalQuestionNumber === 1 && !isReviewSlide}
                onClick={handlePrevSlide}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: currentGlobalQuestionNumber === 1 && !isReviewSlide ? '#475569' : '#ffffff',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: currentGlobalQuestionNumber === 1 && !isReviewSlide ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={15} /> Anterior [←]
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.7rem' }}>
                <span>💡 [1-5] Pontuar • [Enter / Setas] Navegar</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isReviewSlide ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSave}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      backgroundColor: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <CheckCircle2 size={16} /> Finalizar & Salvar ({overallScore}%)
                  </button>
                ) : currentGlobalQuestionNumber < totalQuestions ? (
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: safeCriterionIndex === currentDimension.criteria.length - 1 ? '#0284c7' : '#0ea5e9',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.45rem 1.15rem',
                      borderRadius: '6px',
                      fontSize: '0.775rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 0 12px rgba(14, 165, 233, 0.3)',
                    }}
                  >
                    {safeCriterionIndex === currentDimension.criteria.length - 1 ? (
                      <>
                        Concluir Eixo & Próxima Dimensão <ChevronRight size={15} />
                      </>
                    ) : (
                      <>
                        Próxima <ChevronRight size={15} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                      setIsReviewSlide(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      backgroundColor: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    Revisar & Salvar <ChevronRight size={15} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.75rem' }}
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#10b981',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.55rem 1.4rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                }}
              >
                <CheckCircle2 size={16} /> Salvar Radar Lean ({overallScore}% • Nível {overallLevel})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
