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
  Lock,
  BookOpen,
  Printer,
  Scale,
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import { AgentExamResult, ExamQuestionSnapshot } from '@/lib/types';

interface LeanExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  onExamCompleted: (result: AgentExamResult) => void;
  onNavigateToArticles?: () => void;
}

const EXAM_MAX_DURATION_SECONDS = 720; // 12 minutos cravados

export default function LeanExamModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  onExamCompleted,
  onNavigateToArticles,
}: LeanExamModalProps) {
  const [questions, setQuestions] = useState<ExamQuestionSnapshot[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<AgentExamResult | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Countdown Timer: 12 minutos
  const [timeLeft, setTimeLeft] = useState(EXAM_MAX_DURATION_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Verificação de Liberação (95% dos artigos lidos e validados)
  const eligibility = dataService.canAgentTakeExam(agentId);

  // Inicializar Prova Randômica Balanceada na Abertura
  useEffect(() => {
    if (isOpen && eligibility.canTake && !isSubmitted && questions.length === 0) {
      const generatedQuestions = dataService.generateRandomBalancedExam(agentId, 10);
      setQuestions(generatedQuestions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setTimeLeft(EXAM_MAX_DURATION_SECONDS);
    }
  }, [isOpen, eligibility.canTake, isSubmitted, agentId, questions.length]);

  // Timer Countdown
  useEffect(() => {
    if (isOpen && eligibility.canTake && !isSubmitted && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, eligibility.canTake, isSubmitted, questions.length]);

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter((k) => answers[Number(k)] !== undefined && answers[Number(k)] !== -1).length;
  const blankCount = totalQuestions - answeredCount;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId: number, optIndex: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleClearOption = (qId: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[qId];
      return updated;
    });
  };

  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = EXAM_MAX_DURATION_SECONDS - timeLeft;

    const result = dataService.saveAgentExamResult({
      agentId,
      agentName,
      answers,
      questionsSnapshot: questions,
      durationSeconds: elapsed,
    });

    setExamResult(result);
    setIsSubmitted(true);
    onExamCompleted(result);

    if (result.passed && typeof window !== 'undefined') {
      import('canvas-confetti')
        .then((module) => {
          const confettiFn = module.default || module;
          confettiFn({
            particleCount: 160,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#22d3ee', '#10b981', '#fbbf24', '#a855f7'],
          });
        })
        .catch(() => {});
    }
  };

  const handleRestart = () => {
    const generatedQuestions = dataService.generateRandomBalancedExam(agentId, 10);
    setQuestions(generatedQuestions);
    setAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setShowReview(false);
    setCurrentQuestionIndex(0);
    setTimeLeft(EXAM_MAX_DURATION_SECONDS);
  };

  const handlePrintPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Se o agente não atingiu 95% dos artigos lidos e validados, bloqueia a prova
  if (!eligibility.canTake) {
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
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '600px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(239, 68, 68, 0.2)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '2rem',
            }}
          >
            <Lock size={32} color="#f87171" />
          </div>

          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 800,
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              padding: '0.15rem 0.65rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
            }}
          >
            Certificação Bloqueada
          </span>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0.65rem 0 0.4rem', fontFamily: 'var(--font-heading)' }}>
            Pré-Requisito de Estudos Pendente
          </h3>

          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
            Para liberar a Prova Oficial de Certificação Especialista Lean, o agente deve ter concluído e validado a leitura de pelo menos <strong>95% dos artigos da Academia Lean</strong>.
          </p>

          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '14px',
              padding: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.75rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>Artigos com Leitura Validada:</span>
              <strong style={{ color: '#ffffff' }}>{eligibility.validatedCount} de {eligibility.totalArticles} ({eligibility.validatedPercent}%)</strong>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${eligibility.validatedPercent}%`, height: '100%', backgroundColor: '#ef4444' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: '#f87171', display: 'block', marginTop: '0.45rem' }}>
              ⚠️ Faltam {eligibility.missingCount} artigo(s) com leitura ativa validada.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontWeight: 800, padding: '0.65rem 1.4rem', borderRadius: '10px' }}
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateToArticles) onNavigateToArticles();
              }}
              className="btn btn-primary"
              style={{ fontWeight: 800, padding: '0.65rem 1.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <BookOpen size={16} />
              Estudar Artigos Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="exam-modal-container"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      {/* CSS para Impressão PDF do Gabarito Oficial */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .exam-printable-area, .exam-printable-area * {
            visibility: visible;
          }
          .exam-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          backgroundColor: '#090e1a',
          border: '1.5px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '980px',
          height: '92vh',
          maxHeight: '880px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(6, 182, 212, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="no-print"
          style={{
            padding: '1.1rem 1.5rem',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Prova Oficial de Certificação Lean
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
                  10 Questões • Regra Anti-Chute • Nota Mínima: 8.0
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
                  gap: '0.4rem',
                  backgroundColor: timeLeft <= 120 ? 'rgba(239, 68, 68, 0.25)' : '#0f172a',
                  border: `1.5px solid ${timeLeft <= 120 ? '#ef4444' : 'rgba(251, 191, 36, 0.4)'}`,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  color: timeLeft <= 120 ? '#f87171' : '#fbbf24',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                }}
                title="Tempo Restante (Limite máximo: 12 minutos)"
              >
                <Clock size={15} />
                <span>{formatTimer(timeLeft)}</span>
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

        {/* Faixa de Alerta: Regra Anti-Chute */}
        {!isSubmitted && (
          <div
            className="no-print"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '0.45rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#fbbf24',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Scale size={14} />
              <span>
                <strong>Regra Anti-Chute:</strong> 1 questão errada anula 1 acerto. Questões em branco não penalizam.
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
              {answeredCount} marcadas • {blankCount} em branco
            </span>
          </div>
        )}

        {/* ============================================================= */}
        {/* TELA DE RESULTADO (PÓS-PROVA)                                   */}
        {/* ============================================================= */}
        {isSubmitted && examResult && !showReview && (
          <div
            className="no-print"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: examResult.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `3px solid ${examResult.passed ? '#10b981' : '#ef4444'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
              }}
            >
              {examResult.passed ? '🏆' : '⚠️'}
            </div>

            <div style={{ maxWidth: '640px' }}>
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
                {examResult.passed ? 'APROVADO • SELO DE AGENTE QUALIFICADO' : 'NÃO APROVADO • RETROCESSO A 50%'}
              </span>

              <h2 style={{ fontSize: '2.15rem', fontWeight: 900, color: '#ffffff', margin: '0.5rem 0 0.25rem', fontFamily: 'var(--font-heading)' }}>
                Nota Final: <span style={{ color: examResult.passed ? '#34d399' : '#f87171' }}>{examResult.score.toFixed(1)}</span> / 10.0
              </h2>

              {/* Grid de Estatísticas CESPE */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.65rem',
                  backgroundColor: '#0f172a',
                  borderRadius: '14px',
                  padding: '0.85rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  margin: '1rem 0',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Acertos (+1)</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399', margin: '0.1rem 0 0' }}>{examResult.correctCount}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Erros (-1)</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f87171', margin: '0.1rem 0 0' }}>{examResult.wrongCount}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Em Branco (0)</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 900, color: '#94a3b8', margin: '0.1rem 0 0' }}>{examResult.blankCount}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Pontos Líquidos</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 900, color: '#22d3ee', margin: '0.1rem 0 0' }}>{examResult.netScore}</p>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0' }}>
                {examResult.feedbackSummary}
              </p>
            </div>

            {/* Ações pós-prova */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowReview(true)}
                className="btn btn-secondary"
                style={{
                  fontWeight: 800,
                  padding: '0.65rem 1.35rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <FileCheck size={16} />
                Revisar Gabarito Completo
              </button>

              <button
                type="button"
                onClick={handlePrintPDF}
                className="btn btn-secondary"
                style={{
                  fontWeight: 800,
                  padding: '0.65rem 1.35rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid #22d3ee',
                  color: '#22d3ee',
                }}
              >
                <Printer size={16} />
                Baixar Prova & Gabarito (PDF)
              </button>

              {!examResult.passed && (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="btn btn-primary"
                  style={{
                    fontWeight: 800,
                    padding: '0.65rem 1.35rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <RotateCcw size={16} />
                  Nova Tentativa
                </button>
              )}

              {examResult.passed && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-primary"
                  style={{
                    fontWeight: 800,
                    padding: '0.65rem 1.6rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: '#10b981',
                  }}
                >
                  <CheckCircle2 size={16} />
                  Concluir
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* MODO DE EXECUÇÃO OU REVISÃO DE QUESTÕES                       */}
        {/* ============================================================= */}
        {(!isSubmitted || showReview) && currentQ && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Barra de Navegador de Questões */}
            <div
              className="no-print"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#070b14',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>
                  Questão <strong style={{ color: '#ffffff' }}>{currentQuestionIndex + 1}</strong> de {totalQuestions} • Domínio: <strong style={{ color: '#22d3ee' }}>{currentQ.category}</strong>
                </span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                  {answeredCount} / {totalQuestions} Marcadas ({progressPercent}%)
                </span>
              </div>

              {/* Grade de botões de navegação rápida */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.35rem',
                  overflowX: 'auto',
                  paddingBottom: '0.2rem',
                }}
              >
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== -1;
                  const isCurrent = idx === currentQuestionIndex;
                  const isCorrect = isSubmitted && answers[q.id] === q.correctOptionIndex;
                  const isWrong = isSubmitted && isAnswered && !isCorrect;

                  let bg = 'rgba(255, 255, 255, 0.05)';
                  let border = '1px solid rgba(255, 255, 255, 0.1)';
                  let color = '#94a3b8';

                  if (isSubmitted) {
                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.25)';
                      border = '1px solid #10b981';
                      color = '#34d399';
                    } else if (isWrong) {
                      bg = 'rgba(239, 68, 68, 0.25)';
                      border = '1px solid #ef4444';
                      color = '#f87171';
                    } else {
                      bg = 'rgba(255, 255, 255, 0.05)';
                      border = '1px dashed rgba(255, 255, 255, 0.2)';
                      color = '#94a3b8';
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
                        minWidth: '28px',
                        height: '28px',
                        padding: 0,
                        backgroundColor: bg,
                        border,
                        borderRadius: '6px',
                        color,
                        fontSize: '0.725rem',
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
                padding: '1.5rem',
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                      Questão {currentQuestionIndex + 1}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• {currentQ.category}</span>
                  </div>

                  {!isSubmitted && answers[currentQ.id] !== undefined && (
                    <button
                      type="button"
                      onClick={() => handleClearOption(currentQ.id)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#f87171',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        cursor: 'pointer',
                      }}
                      title="Deixar em branco para não arriscar a anulação por erro"
                    >
                      Limpar Seleção (Deixar em Branco)
                    </button>
                  )}
                </div>

                <h4 style={{ margin: 0, fontSize: '1.025rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.55 }}>
                  {currentQ.question}
                </h4>
              </div>

              {/* Alternativas */}
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
                      Fundamentação Científica do Sensei:
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
              className="no-print"
              style={{
                padding: '0.85rem 1.5rem',
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

        {/* ============================================================= */}
        {/* ÁREA DE IMPRESSÃO / PDF DO GABARITO OFICIAL                     */}
        {/* ============================================================= */}
        <div className="exam-printable-area" style={{ display: 'none' }}>
          <div style={{ borderBottom: '2px solid #000000', paddingBottom: '12px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '18pt', margin: 0, fontWeight: 900 }}>FLUXOLEAN — RELATÓRIO OFICIAL DE AVALIAÇÃO & GABARITO</h1>
            <p style={{ fontSize: '10pt', color: '#555555', margin: '4px 0 0' }}>Certificação de Agente Qualificado em Métodos & Ferramentas Lean</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9pt' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>Candidato:</td>
                <td style={{ padding: '4px' }}>{agentName}</td>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>Data de Conclusão:</td>
                <td style={{ padding: '4px' }}>{examResult?.completedAt ? new Date(examResult.completedAt).toLocaleString('pt-BR') : '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>Nota Final:</td>
                <td style={{ padding: '4px', fontWeight: 'bold', fontSize: '11pt' }}>{examResult?.score.toFixed(1)} / 10.0</td>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>Resultado Oficial:</td>
                <td style={{ padding: '4px', fontWeight: 'bold', color: examResult?.passed ? '#059669' : '#dc2626' }}>
                  {examResult?.passed ? 'APROVADO (AGENTE QUALIFICADO)' : 'NÃO APROVADO'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>Acertos (+1):</td>
                <td style={{ padding: '4px' }}>{examResult?.correctCount}</td>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>Erros (-1 Anula Acerto):</td>
                <td style={{ padding: '4px' }}>{examResult?.wrongCount}</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #cccccc', paddingBottom: '4px', marginBottom: '12px' }}>
            Gabarito Questão a Questão com Fundamentação do Sensei:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '8.5pt' }}>
            {questions.map((q, idx) => {
              const selectedOpt = answers[q.id];
              const isCorrect = selectedOpt === q.correctOptionIndex;
              const isBlank = selectedOpt === undefined || selectedOpt === -1;

              return (
                <div key={q.id} style={{ border: '1px solid #dddddd', padding: '10px', borderRadius: '6px', pageBreakInside: 'avoid' }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 'bold' }}>
                    {idx + 1}. {q.question} ({q.category})
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Resposta do Aluno:</strong>{' '}
                    {isBlank ? 'Deixada em Branco' : `${String.fromCharCode(65 + selectedOpt)}) ${q.options[selectedOpt]}`}{' '}
                    {isCorrect ? '✅ (Correto)' : isBlank ? '⚪ (Neutro)' : '❌ (Incorreto)'}
                  </p>
                  <p style={{ margin: '0 0 4px', color: '#059669', fontWeight: 'bold' }}>
                    <strong>Gabarito Oficial:</strong> {String.fromCharCode(65 + q.correctOptionIndex)}) {q.options[q.correctOptionIndex]}
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#444444', fontStyle: 'italic', fontSize: '8pt' }}>
                    <strong>Comentário do Sensei:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
