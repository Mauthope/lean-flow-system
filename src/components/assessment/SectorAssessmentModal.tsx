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
        {/* Cabeçalho do Modal */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0c121e',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: `${sector.color || '#06b6d4'}22`,
                border: `1.5px solid ${sector.color || '#06b6d4'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              📊
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>
                  Novo Lean Assessment — {sector.name}
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: `${sector.color || '#06b6d4'}22`,
                    color: sector.color || '#22d3ee',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    border: `1px solid ${sector.color || '#06b6d4'}44`,
                  }}
                >
                  {sector.code}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                Auditoria prática de Gemba Walk baseada nas 6 Dimensões da Manufatura Enxuta
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setShowMethodologyDefense(!showMethodologyDefense)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: showMethodologyDefense ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(34, 211, 238, 0.35)',
                color: '#22d3ee',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Entenda por que esta metodologia é a mais adequada para o Gemba"
            >
              <ShieldCheck size={15} /> Por que Esta Metodologia?
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Banner Expansível: Defesa da Metodologia & Memorial de Cálculo para o Auditor */}
        {showMethodologyDefense && (
          <div
            style={{
              padding: '1.25rem 1.75rem',
              backgroundColor: '#070a12',
              borderBottom: '1.5px solid rgba(34, 211, 238, 0.3)',
              maxHeight: '450px',
              overflowY: 'auto',
            }}
          >
            <LeanAssessmentMethodologyDefense defaultExpanded={true} />
          </div>
        )}

        {/* Barra Superior de Metadados & Resumo do Score em Tempo Real */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '0.85rem 1.75rem',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Avaliador(a): </span>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                style={{
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  width: '170px',
                }}
              />
            </div>

            <div>
              <span style={{ color: '#94a3b8' }}>Data do Gemba: </span>
              <input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                style={{
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </div>

          {/* Badge do Score Atual Projetado & Alternador de Modo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', backgroundColor: '#090d16', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.15rem' }}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('slide');
                  setIsReviewSlide(false);
                }}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'slide' ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
                  color: viewMode === 'slide' ? '#22d3ee' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Sparkles size={13} /> 🎮 Modo Slides (Individual)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'all' ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
                  color: viewMode === 'all' ? '#22d3ee' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Layers size={13} /> 📋 Modo Lista (38 Critérios)
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid #10b981',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
              }}
            >
              <Award size={16} color="#34d399" />
              <strong style={{ color: '#34d399', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>
                {overallScore}%
              </strong>
              <span style={{ fontSize: '0.7rem', color: '#a7f3d0', fontWeight: 600 }}>
                • Nível {overallLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Abas das 6 Dimensões: 100% Visíveis com Grid de 6 Colunas (Sem cortes ou barras sobrepostas) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0.4rem',
            backgroundColor: '#080c14',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.65rem 1.25rem',
          }}
        >
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
                  padding: '0.6rem 0.4rem',
                  backgroundColor: isActive ? 'rgba(34, 211, 238, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1.5px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: isActive ? '#22d3ee' : '#94a3b8',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.725rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 0 12px rgba(34, 211, 238, 0.25)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>{idx + 1}.</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dim.shortName}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: isActive ? 'rgba(34, 211, 238, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                    padding: '0.05rem 0.4rem',
                    borderRadius: '4px',
                    fontWeight: 800,
                    color: dim.score >= 70 ? '#34d399' : dim.score >= 45 ? '#fbbf24' : '#f87171',
                  }}
                >
                  {dim.score}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Corpo com os Critérios da Dimensão */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* MODO 1: VER TODAS AS 6 DIMENSÕES DE FORMA CONTÍNUA */}
          {viewMode === 'all' ? (
            dimensions.map((dim, dIdx) => (
              <div
                key={dim.id}
                id={`dim-section-${dim.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  paddingBottom: '1.5rem',
                  borderBottom: dIdx < dimensions.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                }}
              >
                {/* Header da Dimensão */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(34, 211, 238, 0.06)',
                    border: '1px solid rgba(34, 211, 238, 0.25)',
                    borderRadius: '10px',
                    padding: '0.85rem 1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 800, textTransform: 'uppercase' }}>
                      Dimensão {dIdx + 1} de 6
                    </span>
                    <h4 style={{ margin: '0.15rem 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                      {dim.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.775rem', color: '#94a3b8' }}>
                      {dim.description}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                      {dim.score}%
                    </div>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
                      Nível {dim.level}
                    </span>
                  </div>
                </div>

                {/* Critérios da Dimensão */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {dim.criteria.map((criterion, cIdx) => (
                    <div
                      key={criterion.id}
                      style={{
                        backgroundColor: '#0c121e',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '1.15rem 1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: '#94a3b8',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                            }}
                          >
                            Item {cIdx + 1} (Peso {criterion.weight})
                          </span>
                          <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                            {criterion.title}
                          </h5>
                        </div>
                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                          {criterion.description}
                        </p>
                      </div>

                      {/* Guia de verificação Gemba */}
                      <div
                        style={{
                          backgroundColor: 'rgba(251, 191, 36, 0.07)',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          borderRadius: '8px',
                          padding: '0.55rem 0.75rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.55rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        <AlertCircle size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: '#fbbf24' }}>O que verificar no Gemba: </strong>
                          <span style={{ color: '#fef08a' }}>{criterion.gembaVerificationGuide}</span>
                        </div>
                      </div>

                      {/* Checkpoints Práticos de Campo (TPS) */}
                      {criterion.checkpoints && criterion.checkpoints.length > 0 && (
                        <div
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '8px',
                            padding: '0.55rem 0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                          }}
                        >
                          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                            🔍 Checkpoints Práticos Auditados:
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {criterion.checkpoints.map((chk, chkIdx) => (
                              <div
                                key={chkIdx}
                                style={{
                                  fontSize: '0.725rem',
                                  color: '#cbd5e1',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.4rem',
                                  lineHeight: 1.35,
                                }}
                              >
                                <span style={{ color: '#22d3ee', fontWeight: 800 }}>✓</span>
                                <span>{chk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Avaliação no Posto (1 a 5 estrelas) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          paddingTop: '0.35rem',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                          Avaliação no Posto:
                        </span>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isSelected = criterion.score === val;
                            const levelColors: Record<number, { bg: string; border: string; text: string }> = {
                              1: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#f87171' },
                              2: { bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316', text: '#fb923c' },
                              3: { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#facc15' },
                              4: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#34d399' },
                              5: { bg: 'rgba(6, 182, 212, 0.2)', border: '#06b6d4', text: '#22d3ee' },
                            };
                            const color = levelColors[val];

                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleScoreChange(criterion.id, val)}
                                style={{
                                  minWidth: '42px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  border: `1.5px solid ${isSelected ? color.border : 'rgba(255, 255, 255, 0.12)'}`,
                                  backgroundColor: isSelected ? color.bg : 'transparent',
                                  color: isSelected ? color.text : '#94a3b8',
                                  fontWeight: isSelected ? 900 : 600,
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {val}★
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Observações do Critério */}
                      <input
                        type="text"
                        placeholder="Evidências físicas observadas, anomalias ou notas do Gemba..."
                        value={criterion.observations || ''}
                        onChange={(e) => handleCriterionObservationChange(criterion.id, e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#070a12',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          padding: '0.4rem 0.65rem',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            /* MODO 2: GAMIFICADO SLIDE-A-SLIDE (INDIVIDUAL, SEM BARRA DE ROLAGEM) */
            isReviewSlide ? (
              /* SLIDE FINAL DE CONCLUSÃO & SÍNTESE DO GEMBA */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  padding: '0.5rem 0',
                }}
              >
                {/* Troféu & Celebração */}
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                      }}
                    >
                      🏆
                    </div>
                    <div>
                      <span style={{ fontSize: '0.725rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Assessment Gemba Walk Concluído!
                      </span>
                      <h3 style={{ margin: '0.2rem 0', fontSize: '1.2rem', color: '#ffffff', fontWeight: 900 }}>
                        38 Critérios Mestres Avaliados com Sucesso
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.785rem', color: '#94a3b8' }}>
                        Setor: <strong style={{ color: '#ffffff' }}>{sector.name}</strong> • Avaliador: <strong style={{ color: '#ffffff' }}>{evaluatorName}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                      {overallScore}%
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a7f3d0' }}>
                      Nível {overallLevel} ({levelLabels[overallLevel]})
                    </span>
                  </div>
                </div>

                {/* Grid das 6 Dimensões Avaliadas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                  {dimensions.map((dim, idx) => (
                    <div
                      key={dim.id}
                      style={{
                        backgroundColor: '#0c121e',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>Eixo {idx + 1}</span>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>{dim.shortName}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                          {dim.score}%
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Nível {dim.level}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Parecer Geral do Gemba */}
                <div
                  style={{
                    backgroundColor: '#0c121e',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={15} color="#fbbf24" /> Parecer Geral do Avaliador (Gemba Walk)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva o clima operacional, postura dos operadores, comprometimento da supervisão, principais gargalos e prioridades para alavancar o setor..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#070a12',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '0.75rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            ) : (
              /* SLIDE INDIVIDUAL GAMIFICADO (1 PERGUNTA POR VEZ) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Sub-header do Slide: Progresso e Trilha de Perguntas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ color: '#22d3ee', fontWeight: 800, textTransform: 'uppercase' }}>
                        🎮 Pergunta {currentGlobalQuestionNumber} de {totalQuestions}
                      </span>
                      <span style={{ color: '#64748b' }}>•</span>
                      <span style={{ color: '#94a3b8' }}>
                        Dimensão {activeDimensionIndex + 1}/6: <strong style={{ color: '#ffffff' }}>{currentDimension.name}</strong>
                      </span>
                    </div>

                    <span style={{ color: '#34d399', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {globalProgressPercent}% concluído
                    </span>
                  </div>

                  {/* Barra Visual de XP / Progresso */}
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${globalProgressPercent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #0284c7 0%, #22d3ee 50%, #10b981 100%)',
                        transition: 'width 0.25s ease',
                      }}
                    />
                  </div>

                  {/* Chips Rápidos dos Critérios da Dimensão Atual */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
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
                              padding: '0.25rem 0.55rem',
                              borderRadius: '6px',
                              border: isCurrent
                                ? '2px solid #22d3ee'
                                : isRated
                                ? `1px solid ${ratingColor}66`
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              backgroundColor: isCurrent
                                ? 'rgba(34, 211, 238, 0.2)'
                                : isRated
                                ? `${ratingColor}15`
                                : 'rgba(255, 255, 255, 0.03)',
                              color: isCurrent ? '#ffffff' : isRated ? ratingColor : '#94a3b8',
                              fontSize: '0.725rem',
                              fontWeight: isCurrent ? 800 : 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              boxShadow: isCurrent ? '0 0 10px rgba(34, 211, 238, 0.4)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>#{cIdx + 1}</span>
                            {isRated && <span style={{ fontWeight: 900 }}>• {crit.score}★</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#94a3b8' }}>Maturidade do Eixo:</span>
                      <strong style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{currentDimension.score}%</strong>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(Nível {currentDimension.level})</span>
                    </div>
                  </div>
                </div>

                {/* Card do Critério / Pergunta (Compacto, Sem Barra de Rolagem) */}
                <div
                  style={{
                    backgroundColor: '#0c121e',
                    border: '1.5px solid rgba(34, 211, 238, 0.25)',
                    borderRadius: '14px',
                    padding: '1.15rem 1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            backgroundColor: 'rgba(34, 211, 238, 0.15)',
                            color: '#22d3ee',
                            border: '1px solid rgba(34, 211, 238, 0.3)',
                            padding: '0.12rem 0.5rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Critério {safeCriterionIndex + 1} de {currentDimension.criteria.length}
                        </span>
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            backgroundColor: currentCriterion.weight === 3 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                            color: currentCriterion.weight === 3 ? '#f87171' : '#94a3b8',
                            border: currentCriterion.weight === 3 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '0.12rem 0.5rem',
                            borderRadius: '6px',
                          }}
                        >
                          ⚖️ Peso {currentCriterion.weight} ({currentCriterion.weight === 3 ? 'Impacto Vital' : currentCriterion.weight === 2 ? 'Médio' : 'Básico'})
                        </span>
                      </div>

                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Atalhos: Teclas [1] a [5]
                      </span>
                    </div>

                    <h3 style={{ margin: '0.15rem 0', fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, lineHeight: 1.35 }}>
                      {currentCriterion.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                      {currentCriterion.description}
                    </p>
                  </div>

                  {/* Caixa Dourada: O que verificar no Gemba */}
                  <div
                    style={{
                      backgroundColor: 'rgba(251, 191, 36, 0.08)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#fbbf24' }}>O que verificar no Gemba: </strong>
                      <span style={{ color: '#fef08a', lineHeight: 1.4 }}>{currentCriterion.gembaVerificationGuide}</span>
                    </div>
                  </div>

                  {/* Checkpoints Práticos Auditados */}
                  {currentCriterion.checkpoints && currentCriterion.checkpoints.length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                        padding: '0.55rem 0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                      }}
                    >
                      <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        🔍 Checkpoints Práticos Auditados (TPS):
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.3rem' }}>
                        {currentCriterion.checkpoints.map((chk, chkIdx) => (
                          <div
                            key={chkIdx}
                            style={{
                              fontSize: '0.725rem',
                              color: '#cbd5e1',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.4rem',
                              lineHeight: 1.35,
                            }}
                          >
                            <span style={{ color: '#22d3ee', fontWeight: 900 }}>✓</span>
                            <span>{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seletor Gamificado de 1 a 5 Estrelas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingTop: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase' }}>
                        Classificação no Gemba (Selecione a Nota):
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Nota atual: <strong style={{ color: '#22d3ee' }}>{currentCriterion.score}★ de 5★</strong>
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isSelected = currentCriterion.score === val;
                        const levelColors: Record<number, { title: string; subtitle: string; bg: string; border: string; text: string; glow: string }> = {
                          1: { title: '1★ Reativo', subtitle: 'Gargalo visível', bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#f87171', glow: '0 0 14px rgba(239, 68, 68, 0.4)' },
                          2: { title: '2★ Básico', subtitle: 'Início de rotina', bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316', text: '#fb923c', glow: '0 0 14px rgba(249, 115, 22, 0.4)' },
                          3: { title: '3★ Padronizado', subtitle: 'POP cumprido', bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#facc15', glow: '0 0 14px rgba(234, 179, 8, 0.4)' },
                          4: { title: '4★ Avançado', subtitle: 'Melhoria contínua', bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#34d399', glow: '0 0 14px rgba(16, 185, 129, 0.4)' },
                          5: { title: '5★ Classe Mundial', subtitle: 'Poka-Yoke / TPS', bg: 'rgba(6, 182, 212, 0.2)', border: '#06b6d4', text: '#22d3ee', glow: '0 0 16px rgba(6, 182, 212, 0.5)' },
                        };
                        const col = levelColors[val];

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleScoreChange(currentCriterion.id, val)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.15rem',
                              padding: '0.6rem 0.35rem',
                              borderRadius: '10px',
                              border: isSelected ? `2px solid ${col.border}` : '1px solid rgba(255, 255, 255, 0.1)',
                              backgroundColor: isSelected ? col.bg : 'rgba(255, 255, 255, 0.02)',
                              color: isSelected ? col.text : '#94a3b8',
                              cursor: 'pointer',
                              boxShadow: isSelected ? col.glow : 'none',
                              transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>{col.title}</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', opacity: isSelected ? 1 : 0.7, textAlign: 'center' }}>
                              {col.subtitle}
                            </span>
                            <span style={{ fontSize: '0.575rem', color: '#64748b', marginTop: '0.1rem' }}>
                              Tecla [{val}]
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Observações de Campo do Critério */}
                  <div>
                    <input
                      type="text"
                      placeholder="Evidências físicas observadas, anomalias ou notas do Gemba para este critério (opcional)..."
                      value={currentCriterion.observations || ''}
                      onChange={(e) => handleCriterionObservationChange(currentCriterion.id, e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#070a12',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.4rem 0.65rem',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          )}

          {/* Campo de Observações Gerais (Apenas visível no Modo Lista) */}
          {viewMode === 'all' && (
            <div
              style={{
                backgroundColor: '#0c121e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                Parecer Geral do Avaliador (Gemba Walk)
              </label>
              <textarea
                rows={3}
                placeholder="Descreva o clima geral do setor, postura dos operadores, engajamento dos líderes de turno e pontos de atenção prioritários..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  resize: 'vertical',
                }}
              />
            </div>
          )}
        </div>

        {/* Rodapé com Navegação Gamificada & Botão Salvar */}
        <div
          style={{
            padding: '1rem 1.75rem',
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
                  gap: '0.4rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: currentGlobalQuestionNumber === 1 && !isReviewSlide ? '#475569' : '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: currentGlobalQuestionNumber === 1 && !isReviewSlide ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} /> Pergunta Anterior [←]
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.725rem' }}>
                <span>💡 Use teclas <strong>[1 a 5]</strong> para avaliar e <strong>[Enter]</strong> para avançar</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {isReviewSlide ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSave}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.65rem 1.6rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                    }}
                  >
                    <CheckCircle2 size={18} /> Finalizar & Gerar Radar Lean ({overallScore}% • Nível {overallLevel})
                  </button>
                ) : currentGlobalQuestionNumber < totalQuestions ? (
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      backgroundColor: safeCriterionIndex === currentDimension.criteria.length - 1 ? '#0284c7' : '#0ea5e9',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.55rem 1.35rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(14, 165, 233, 0.35)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {safeCriterionIndex === currentDimension.criteria.length - 1 ? (
                      <>
                        Concluir Eixo & Próxima Dimensão <ChevronRight size={16} />
                      </>
                    ) : (
                      <>
                        Próxima Pergunta <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                      });
                      setIsReviewSlide(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                    }}
                  >
                    Revisar Síntese & Finalizar <ChevronRight size={16} />
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
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
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
                  padding: '0.65rem 1.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 0 18px rgba(16, 185, 129, 0.45)',
                }}
              >
                <CheckCircle2 size={17} /> Finalizar & Gerar Radar Lean ({overallScore}% • Nível {overallLevel})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
