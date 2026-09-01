'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LEAN_EXAM_QUESTIONS, ExamQuestion } from '@/data/leanExamQuestions';
import { dataService } from '@/services/dataService';
import { AgentExamResult } from '@/lib/types';

interface LeanExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  onExamCompleted: (result: AgentExamResult) => void;
}

export default function LeanExamModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  onExamCompleted,
}: LeanExamModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<AgentExamResult | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && !isSubmitted) {
      setSecondsElapsed(0);
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isSubmitted]);

  if (!isOpen) return null;

  const questions = LEAN_EXAM_QUESTIONS;
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId: number, optIndex: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const result = dataService.saveAgentExamResult({
      agentId,
      correctCount,
      totalQuestions,
      answers,
    });

    setExamResult(result);
    setIsSubmitted(true);
    onExamCompleted(result);

    if (result.passed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#10b981', '#fbbf24', '#a855f7'],
      });
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setShowReview(false);
    setCurrentQuestionIndex(0);
    setSecondsElapsed(0);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#090e1a',
          border: '1.5px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '960px',
          height: '92vh',
          maxHeight: '860px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(6, 182, 212, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#040711',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                border: '1.5px solid #fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Prova Oficial de Certificação Lean Manufacturing
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid #fbbf24',
                    color: '#fbbf24',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                  }}
                >
                  50 Questões • Nota Mínima: 8.0
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Candidato: <strong style={{ color: '#22d3ee' }}>{agentName}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!isSubmitted && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  color: '#fbbf24',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                <Clock size={14} />
                <span>{formatTimer(secondsElapsed)}</span>
              </div>
            )}

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
                display: 'flex',
                alignItems: 'center',
              }}
              title="Fechar (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* TELA DE RESULTADO (PÓS-PROVA)                                   */}
        {/* ============================================================= */}
        {isSubmitted && examResult && !showReview && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: examResult.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `3px solid ${examResult.passed ? '#10b981' : '#ef4444'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.75rem',
              }}
            >
              {examResult.passed ? '🏆' : '📚'}
            </div>

            <div style={{ maxWidth: '580px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: examResult.passed ? '#34d399' : '#f87171',
                  backgroundColor: examResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  padding: '0.2rem 0.75rem',
                  borderRadius: '999px',
                }}
              >
                {examResult.passed ? 'APROVADO COM EXCELÊNCIA' : 'NÃO APROVADO • TENTE NOVAMENTE'}
              </span>

              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0.5rem 0 0.25rem', fontFamily: 'var(--font-heading)' }}>
                Nota Final: <span style={{ color: examResult.passed ? '#34d399' : '#f87171' }}>{examResult.score.toFixed(1)}</span> / 10.0
              </h2>

              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0.5rem 0 0' }}>
                {examResult.passed ? (
                  <>
                    Parabéns, <strong>{agentName}</strong>! Você acertou <strong>{examResult.correctCount} de 50 questões</strong> e conquistou a certificação de <strong>Especialista Lean</strong>. Você já está <strong>Apto a Receber a Recompensa</strong> com a liderança Master!
                  </>
                ) : (
                  <>
                    Você acertou <strong>{examResult.correctCount} de 50 questões</strong>. A nota mínima exigida para certificação e recompensa é <strong>8.0 (40 acertos)</strong>. Revise os artigos na Academia Lean e tente novamente!
                  </>
                )}
              </p>
            </div>

            {/* Ações pós-prova */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowReview(true)}
                className="btn btn-secondary"
                style={{
                  fontWeight: 800,
                  padding: '0.65rem 1.5rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <FileCheck size={16} />
                Revisar Gabarito e Explicações
              </button>

              {!examResult.passed && (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="btn btn-primary"
                  style={{
                    fontWeight: 800,
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <RotateCcw size={16} />
                  Fazer Nova Tentativa
                </button>
              )}

              {examResult.passed && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-primary"
                  style={{
                    fontWeight: 800,
                    padding: '0.65rem 1.75rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: '#10b981',
                  }}
                >
                  <CheckCircle2 size={16} />
                  Concluir & Voltar
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* MODO DE EXECUÇÃO OU REVISÃO DE QUESTÕES                       */}
        {/* ============================================================= */}
        {(!isSubmitted || showReview) && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Barra de Progresso e Navegador de Questões */}
            <div
              style={{
                padding: '0.85rem 1.5rem',
                backgroundColor: '#070b14',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>
                  Questão <strong style={{ color: '#ffffff' }}>{currentQuestionIndex + 1}</strong> de {totalQuestions} • Categoria: <strong style={{ color: '#22d3ee' }}>{currentQ.category}</strong>
                </span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                  {answeredCount} / {totalQuestions} Respondidas ({progressPercent}%)
                </span>
              </div>

              {/* Barra de progresso */}
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: '#22d3ee',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>

              {/* Grade de 50 bolinhas/números de navegação rápida */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.25rem',
                  overflowX: 'auto',
                  paddingBottom: '0.25rem',
                }}
              >
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  const isCorrect = isSubmitted && answers[q.id] === q.correctOptionIndex;

                  let bg = 'rgba(255, 255, 255, 0.05)';
                  let border = '1px solid rgba(255, 255, 255, 0.1)';
                  let color = '#94a3b8';

                  if (isSubmitted) {
                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.25)';
                      border = '1px solid #10b981';
                      color = '#34d399';
                    } else {
                      bg = 'rgba(239, 68, 68, 0.25)';
                      border = '1px solid #ef4444';
                      color = '#f87171';
                    }
                  } else if (isCurrent) {
                    bg = 'rgba(6, 182, 212, 0.3)';
                    border = '1.5px solid #22d3ee';
                    color = '#ffffff';
                  } else if (isAnswered) {
                    bg = 'rgba(16, 185, 129, 0.2)';
                    border = '1px solid #10b981';
                    color = '#34d399';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      style={{
                        minWidth: '24px',
                        height: '24px',
                        padding: 0,
                        backgroundColor: bg,
                        border,
                        borderRadius: '4px',
                        color,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conteúdo da Questão Atual */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Enunciado */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                    Questão {currentQuestionIndex + 1}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• {currentQ.category}</span>
                </div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.5 }}>
                  {currentQ.question}
                </h4>
              </div>

              {/* 5 Alternativas (A, B, C, D, E) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D, E
                  const isSelected = answers[currentQ.id] === optIdx;
                  const isCorrect = isSubmitted && optIdx === currentQ.correctOptionIndex;
                  const isWrongSelected = isSubmitted && isSelected && !isCorrect;

                  let borderColor = 'rgba(255, 255, 255, 0.1)';
                  let bgColor = '#090e1a';
                  let textColor = '#cbd5e1';

                  if (isSubmitted) {
                    if (isCorrect) {
                      borderColor = '#10b981';
                      bgColor = 'rgba(16, 185, 129, 0.15)';
                      textColor = '#ffffff';
                    } else if (isWrongSelected) {
                      borderColor = '#ef4444';
                      bgColor = 'rgba(239, 68, 68, 0.15)';
                      textColor = '#ffffff';
                    }
                  } else if (isSelected) {
                    borderColor = '#22d3ee';
                    bgColor = 'rgba(6, 182, 212, 0.15)';
                    textColor = '#ffffff';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      disabled={isSubmitted}
                      style={{
                        padding: '0.85rem 1.15rem',
                        backgroundColor: bgColor,
                        border: `1.5px solid ${borderColor}`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        textAlign: 'left',
                        cursor: isSubmitted ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#22d3ee' : isCorrect ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                          color: isSelected || isCorrect ? '#000000' : '#ffffff',
                          fontWeight: 900,
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {letter}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: textColor, lineHeight: 1.45, marginTop: '2px' }}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explicação Didática em Modo Revisão */}
              {isSubmitted && (
                <div
                  style={{
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                    <ShieldCheck size={16} color="#22d3ee" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase' }}>
                      Explicação do Sensei:
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Navegação Inferior (Anterior, Próxima e Enviar) */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#040711',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                ) : (
                  !isSubmitted && (
                    <button
                      type="button"
                      onClick={handleSubmitExam}
                      className="btn btn-primary"
                      style={{
                        backgroundColor: '#10b981',
                        fontWeight: 800,
                        padding: '0.5rem 1.5rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      Finalizar e Entregar Prova
                    </button>
                  )
                )}

                {isSubmitted && (
                  <button
                    type="button"
                    onClick={() => setShowReview(false)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 800 }}
                  >
                    Voltar ao Resumo
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
