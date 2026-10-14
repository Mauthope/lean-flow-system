'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { SenseiState, KaizenIdea, Sector } from '@/lib/types';
import { TOTEN_KAIZEN_PILLS } from '@/lib/totenData';
import { dataService } from '@/services/dataService';
import {
  Lightbulb,
  Sparkles,
  Send,
  Mic,
  MicOff,
  ListFilter,
  Clock,
  User,
  Building2,
  CheckCircle2,
  RefreshCw,
  Bot,
  Volume2,
  ArrowRight,
  BookOpen,
  Trophy,
  ArrowLeft,
  Flame,
  Check,
  AlertCircle,
  Zap,
  Camera,
  UploadCloud,
  Briefcase,
  X,
} from 'lucide-react';

export type InteractionView = 'menu' | 'canal_kaizen' | 'aula' | 'desafio' | 'chat' | 'lista_ideias';

interface KaizenInteractionProps {
  personDetected?: boolean;
  onSpeak: (text: string) => void;
  onStateChange: (state: SenseiState) => void;
  onReturnToIdle: () => void;
  activeView?: InteractionView;
  onViewChange?: (view: InteractionView) => void;
}

export function KaizenInteraction({
  personDetected = true,
  onSpeak,
  onStateChange,
  onReturnToIdle,
  activeView: controlledView,
  onViewChange,
}: KaizenInteractionProps) {
  const [internalView, setInternalView] = useState<InteractionView>('menu');
  const activeView = controlledView ?? internalView;

  const setView = useCallback(
    (newView: InteractionView) => {
      setInternalView(newView);
      if (onViewChange) {
        onViewChange(newView);
      }
    },
    [onViewChange]
  );

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [ideaPhase, setIdeaPhase] = useState<'input' | 'review' | 'success'>('input');
  const [rawIdeaInput, setRawIdeaInput] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isStructuring, setIsStructuring] = useState(false);

  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('5S & Organização');
  const [ideaProblem, setIdeaProblem] = useState('');
  const [ideaSolution, setIdeaSolution] = useState('');
  const [ideaBenefits, setIdeaBenefits] = useState('');
  const [ideaAuthor, setIdeaAuthor] = useState('');
  const [ideaRoleTitle, setIdeaRoleTitle] = useState('Operador de Produção');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSubmittedIdea, setLastSubmittedIdea] = useState<KaizenIdea | null>(null);
  const [registeredIdeas, setRegisteredIdeas] = useState<KaizenIdea[]>([]);

  const [chatInput, setChatInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isChatListening, setIsChatListening] = useState(false);

  const [currentPillIndex, setCurrentPillIndex] = useState(0);
  const [hasAcceptedChallenge, setHasAcceptedChallenge] = useState(false);

  const recognitionRef = useRef<any>(null);
  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    try {
      const secList = dataService.getSectors();
      setSectors(secList);
      if (secList.length > 0) {
        setSelectedSectorId(secList[0].id);
      }

      const allIdeas = dataService.getKaizenIdeas();
      const totenIdeas = allIdeas.filter((i) => i.origin === 'toten');
      setRegisteredIdeas(totenIdeas);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (hasCelebratedRef.current) return;
    hasCelebratedRef.current = true;

    try {
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.4 },
      });
    } catch (_) {}

    onStateChange('celebrating');

    const welcomeSpeech =
      'Olá, bem-vindo ao Toten Kaizen! Toque na tela para escolher: cadastrar uma ideia, ter uma aula rápida, aceitar um desafio ou conversar comigo!';
    onSpeak(welcomeSpeech);

    setTimeout(() => {
      onStateChange('interacting');
    }, 2000);
  }, [onSpeak, onStateChange]);

  useEffect(() => {
    if (!hasCelebratedRef.current) return;

    if (activeView === 'canal_kaizen') {
      if (ideaPhase === 'success') {
        onStateChange('success');
      } else {
        onStateChange('idea');
      }
    } else if (activeView === 'chat') {
      onStateChange('interacting');
    } else if (activeView === 'desafio') {
      onStateChange(hasAcceptedChallenge ? 'celebrating' : 'interacting');
    } else if (activeView === 'aula') {
      onStateChange('interacting');
    } else {
      onStateChange('interacting');
    }
  }, [activeView, ideaPhase, hasAcceptedChallenge, onStateChange]);

  const structureIdeaProposal = async (text: string) => {
    if (!text.trim()) return;

    setIsStructuring(true);
    setFormError(null);
    onSpeak('O Sensei está organizando sua ideia no formato Kaizen.');

    try {
      const res = await fetch('/api/toten/sensei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refine_idea',
          rawText: text,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setIdeaTitle(d.title || 'Melhoria no Posto de Trabalho');
        setIdeaCategory(d.category || '5S & Organização');
        setIdeaProblem(d.problem || text);
        setIdeaSolution(d.solution || 'Padronizar e implementar melhoria conforme posto.');
        setIdeaBenefits(d.benefits || 'Mais agilidade, ergonomia e segurança no turno.');
        setIdeaPhase('review');

        if (d.senseiEncouragement) {
          onSpeak(d.senseiEncouragement);
        } else {
          onSpeak('Ideia organizada com sucesso! Confira os dados e confirme o envio.');
        }
      } else {
        setIdeaTitle(`Melhoria Kaizen: ${text.slice(0, 36)}...`);
        setIdeaProblem(text);
        setIdeaSolution('Implementar dispositivo ou rotina padrão.');
        setIdeaBenefits('Mais segurança e agilidade no posto.');
        setIdeaPhase('review');
        onSpeak('Ideia anotada! Você pode revisar e confirmar o envio.');
      }
    } catch (_) {
      setIdeaTitle(`Melhoria: ${text.slice(0, 30)}...`);
      setIdeaProblem(text);
      setIdeaSolution('Implementar sugestão prática do operador.');
      setIdeaBenefits('Otimização do posto.');
      setIdeaPhase('review');
    } finally {
      setIsStructuring(false);
    }
  };

  const toggleVoiceRecordingForIdea = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Reconhecimento de voz não suportado neste navegador. Digite sua ideia no campo de texto!');
      return;
    }

    if (isVoiceRecording) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsVoiceRecording(false);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setRawIdeaInput(transcript);
      setIsVoiceRecording(false);
      structureIdeaProposal(transcript);
    };

    recognition.onerror = () => setIsVoiceRecording(false);
    recognition.onend = () => setIsVoiceRecording(false);
    recognitionRef.current = recognition;

    try {
      setIsVoiceRecording(true);
      recognition.start();
    } catch (_) {
      setIsVoiceRecording(false);
    }
  }, [isVoiceRecording]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmIdeaSubmission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ideaTitle.trim() || !ideaProblem.trim() || !ideaSolution.trim()) {
      setFormError('Por favor, preencha o título, o problema e a solução observada.');
      return;
    }

    if (!ideaAuthor.trim()) {
      setFormError('O Nome Completo do colaborador é obrigatório.');
      onSpeak('Por favor, informe seu nome completo para registrar a ideia no Canal Kaizen.');
      return;
    }

    setFormError(null);

    try {
      const createdIdea = dataService.createKaizenIdea({
        authorName: ideaAuthor.trim(),
        authorRoleTitle: ideaRoleTitle.trim() || 'Colaborador do Chão de Fábrica',
        sectorId: selectedSectorId || (sectors[0]?.id || ''),
        summary: `${ideaTitle.trim()} | Problema: ${ideaProblem.trim()} | Solução: ${ideaSolution.trim()} | Benefícios: ${ideaBenefits.trim()}`,
        origin: 'toten',
        title: ideaTitle.trim(),
        problem: ideaProblem.trim(),
        solution: ideaSolution.trim(),
        benefits: ideaBenefits.trim(),
        category: ideaCategory,
        photoUrl: photoUrl || undefined,
        photoName: photoName || undefined,
      });

      setLastSubmittedIdea(createdIdea);
      setRegisteredIdeas((prev) => [createdIdea, ...prev]);
      setIdeaPhase('success');

      try {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.55 },
        });
      } catch (_) {}

      onSpeak(
        `Parabéns, ${ideaAuthor.trim()}! Sua ideia foi registrada no Canal Kaizen com o protocolo ${createdIdea.protocol} e já está na triagem do supervisor!`
      );
    } catch (_) {
      setFormError('Erro ao registrar ideia no sistema. Tente novamente.');
    }
  };

  const handleAskSensei = async (questionText?: string) => {
    const textToSend = questionText || chatInput;
    if (!textToSend.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setAiResponse(null);
    onStateChange('interacting');

    try {
      const res = await fetch('/api/toten/sensei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: textToSend,
        }),
      });

      const json = await res.json();
      const answer =
        json.response ||
        'O Sensei ouviu sua pergunta! No chão de fábrica, a melhoria contínua começa com pequenos passos diários no 5S!';
      setAiResponse(answer);
      onSpeak(answer);
    } catch (_) {
      const fallback =
        'O Sensei está atento! Lembre-se: organização e disciplina no posto evitam acidentes e poupam seu tempo!';
      setAiResponse(fallback);
      onSpeak(fallback);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleVoiceRecordingForChat = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    if (isChatListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsChatListening(false);
      return;
    }

    const rec = new SpeechRec();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsChatListening(false);
      handleAskSensei(transcript);
    };

    rec.onerror = () => setIsChatListening(false);
    rec.onend = () => setIsChatListening(false);
    recognitionRef.current = rec;

    try {
      setIsChatListening(true);
      rec.start();
    } catch (_) {
      setIsChatListening(false);
    }
  }, [isChatListening]);

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', userSelect: 'none' }}>
      {/* ============================================================== */}
      {/* 1. MENU PRINCIPAL (HUB DE OPÇÕES DO TOTEN)                    */}
      {/* ============================================================== */}
      {activeView === 'menu' && (
        <div className="toten-menu-container">
          <div className="toten-menu-header">
            <div className="toten-menu-badge">
              <Zap size={14} />
              <span>Painel Interativo do Colaborador</span>
            </div>
            <h2 className="toten-menu-title">Como o Sensei pode te ajudar hoje?</h2>
            <p className="toten-menu-subtitle">
              Toque em uma das opções abaixo para registrar melhorias, aprender ou interagir.
            </p>
          </div>

          <div className="toten-menu-grid">
            {/* Opção 1: Canal Kaizen */}
            <div
              onClick={() => {
                setView('canal_kaizen');
                setIdeaPhase('input');
                onSpeak('Excelente! Você pode falar ou digitar sua ideia de melhoria para o chão de fábrica!');
              }}
              className="toten-card primary"
            >
              <div>
                <div className="toten-card-top">
                  <div className="toten-card-icon-box cyan">
                    <Lightbulb size={26} />
                  </div>
                  <div>
                    <span className="toten-card-tag" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>
                      Chão de Fábrica
                    </span>
                    <h3 className="toten-card-title">Cadastrar Ideia Kaizen</h3>
                  </div>
                </div>
                <p className="toten-card-desc">
                  Grave por voz ou digite uma sugestão de melhoria para seu posto ou máquina. Sua ideia vai direto para os gestores!
                </p>
              </div>
              <div className="toten-card-action" style={{ color: '#22d3ee' }}>
                <span>Gravar por microfone ou tela</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Opção 2: Aula com o Sensei */}
            <div
              onClick={() => {
                setView('aula');
                setCurrentPillIndex(0);
                onSpeak('Bem-vindo à Aula Rápida! Vamos explorar os segredos do 5S e da metodologia Lean!');
              }}
              className="toten-card emerald"
            >
              <div>
                <div className="toten-card-top">
                  <div className="toten-card-icon-box emerald">
                    <BookOpen size={26} />
                  </div>
                  <div>
                    <span className="toten-card-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                      Educação Lean
                    </span>
                    <h3 className="toten-card-title">Aula Rápida com o Sensei</h3>
                  </div>
                </div>
                <p className="toten-card-desc">
                  Pílulas práticas de 1 minuto sobre 5S, eliminação dos 8 desperdícios industriais e qualidade na fonte.
                </p>
              </div>
              <div className="toten-card-action" style={{ color: '#34d399' }}>
                <span>Ver pílulas de conhecimento</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Opção 3: Desafio do Turno */}
            <div
              onClick={() => {
                setView('desafio');
                setHasAcceptedChallenge(false);
                onSpeak('Topa um desafio de 2 minutos para elevar o padrão do seu setor hoje?');
              }}
              className="toten-card amber"
            >
              <div>
                <div className="toten-card-top">
                  <div className="toten-card-icon-box amber">
                    <Trophy size={26} />
                  </div>
                  <div>
                    <span className="toten-card-tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                      Missão Rápida
                    </span>
                    <h3 className="toten-card-title">Desafio 5S do Turno</h3>
                  </div>
                </div>
                <p className="toten-card-desc">
                  Aceite uma missão rápida de 2 minutos no posto: organizar gaveta, recolher itens desnecessários e ganhar o respeito da equipe.
                </p>
              </div>
              <div className="toten-card-action" style={{ color: '#fbbf24' }}>
                <span>Aceitar desafio</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Opção 4: Chat com o Sensei IA */}
            <div
              onClick={() => {
                setView('chat');
                setAiResponse(null);
                onSpeak('Pode perguntar qualquer coisa sobre melhoria contínua, 5S ou segurança no trabalho!');
              }}
              className="toten-card blue"
            >
              <div>
                <div className="toten-card-top">
                  <div className="toten-card-icon-box blue">
                    <Bot size={26} />
                  </div>
                  <div>
                    <span className="toten-card-tag" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                      IA Especialista
                    </span>
                    <h3 className="toten-card-title">Conversar com o Sensei</h3>
                  </div>
                </div>
                <p className="toten-card-desc">
                  Tire dúvidas por voz sobre procedimentos, ferramentas corretas, ergonomia ou consulte dicas para seu setor.
                </p>
              </div>
              <div className="toten-card-action" style={{ color: '#60a5fa' }}>
                <span>Fazer uma pergunta</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* Rodapé do Menu */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => setView('lista_ideias')}
              className="toten-btn-icon"
            >
              <ListFilter size={15} color="#22d3ee" />
              <span>Ver Ideias Cadastradas no Toten ({registeredIdeas.length})</span>
            </button>

            <button
              type="button"
              onClick={onReturnToIdle}
              className="toten-btn-icon"
            >
              <Clock size={15} />
              <span>Encerrar e Voltar à Espera</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CANAL KAIZEN (CADASTRO DE IDEIAS)                          */}
      {/* ============================================================== */}
      {activeView === 'canal_kaizen' && (
        <div className="toten-flow-box">
          <div className="toten-flow-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" onClick={() => setView('menu')} className="toten-back-btn" title="Voltar ao Menu">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="toten-flow-title">
                  <Lightbulb size={22} color="#22d3ee" />
                  <span>Canal Kaizen • Chão de Fábrica</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {ideaPhase === 'input' && 'Fase 1 de 2: Registre sua ideia por voz ou texto'}
                  {ideaPhase === 'review' && 'Fase 2 de 2: Revise e confirme sua contribuição'}
                  {ideaPhase === 'success' && 'Sucesso: Sua ideia já está na esteira de triagem!'}
                </span>
              </div>
            </div>

            {ideaPhase !== 'success' && (
              <span className="toten-card-tag" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>
                {ideaPhase === 'input' ? 'Captação' : 'Revisão'}
              </span>
            )}
          </div>

          {/* FASE 1: ENTRADA */}
          {ideaPhase === 'input' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px 0' }}>
                  Qual problema você enfrentou ou que ideia pode melhorar o seu turno?
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  Exemplo: &ldquo;A chave 17 sumiu de novo da bancada&rdquo; ou &ldquo;Podemos colocar uma calha para guiar o refugo&rdquo;.
                </p>
              </div>

              {/* Botão de Microfone */}
              <div className="toten-mic-container">
                <button
                  type="button"
                  onClick={toggleVoiceRecordingForIdea}
                  disabled={isStructuring}
                  className={`toten-big-mic ${isVoiceRecording ? 'recording' : 'idle'}`}
                >
                  {isVoiceRecording ? <MicOff size={36} /> : <Mic size={36} />}
                  <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '4px', textTransform: 'uppercase' }}>
                    {isVoiceRecording ? 'Parar' : 'Falar Ideia'}
                  </span>
                </button>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#22d3ee' }}>
                  {isVoiceRecording ? 'Gravando... Fale perto da tela!' : 'Toque no microfone para falar sua ideia'}
                </span>
              </div>

              {/* Ou Digite */}
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '10px 0' }} />
                <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#0f172a', padding: '0 12px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                  Ou digite diretamente
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  value={rawIdeaInput}
                  onChange={(e) => setRawIdeaInput(e.target.value)}
                  placeholder="Descreva aqui sua oportunidade de melhoria..."
                  rows={3}
                  className="toten-textarea"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!ideaTitle) setIdeaTitle('Sugestão de Melhoria');
                      setIdeaPhase('review');
                    }}
                    className="toten-btn-icon"
                  >
                    <span>Preencher Formulário Direto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!rawIdeaInput.trim()) return;
                      structureIdeaProposal(rawIdeaInput);
                    }}
                    disabled={!rawIdeaInput.trim() || isStructuring}
                    className="toten-submit-btn"
                  >
                    {isStructuring ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Estruturando com o Sensei...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Avançar para Revisão</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FASE 2: REVISÃO */}
          {ideaPhase === 'review' && (
            <form onSubmit={handleConfirmIdeaSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="toten-form-grid">
                <div className="toten-input-group full">
                  <label className="toten-label">Título da Oportunidade Kaizen *:</label>
                  <input
                    type="text"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    placeholder="Ex: Calha para descarte de refugo"
                    required
                    className="toten-input"
                  />
                </div>

                <div className="toten-input-group">
                  <label className="toten-label">
                    <User size={14} color="#22d3ee" />
                    <span>Seu Nome Completo *:</span>
                  </label>
                  <input
                    type="text"
                    value={ideaAuthor}
                    onChange={(e) => setIdeaAuthor(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    required
                    className="toten-input"
                  />
                </div>

                <div className="toten-input-group">
                  <label className="toten-label">
                    <Briefcase size={14} color="#22d3ee" />
                    <span>Seu Cargo na Fábrica:</span>
                  </label>
                  <input
                    type="text"
                    value={ideaRoleTitle}
                    onChange={(e) => setIdeaRoleTitle(e.target.value)}
                    placeholder="Ex: Operador de Máquina / Auxiliar"
                    className="toten-input"
                  />
                </div>

                <div className="toten-input-group">
                  <label className="toten-label">
                    <Building2 size={14} color="#22d3ee" />
                    <span>Setor da Fábrica *:</span>
                  </label>
                  <select
                    value={selectedSectorId}
                    onChange={(e) => setSelectedSectorId(e.target.value)}
                    className="toten-select"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                    {sectors.length === 0 && <option value="geral">Geral / Produção</option>}
                  </select>
                </div>

                <div className="toten-input-group">
                  <label className="toten-label">Categoria da Melhoria:</label>
                  <select
                    value={ideaCategory}
                    onChange={(e) => setIdeaCategory(e.target.value)}
                    className="toten-select"
                  >
                    <option value="5S & Organização">5S & Organização</option>
                    <option value="Segurança no Trabalho">Segurança no Trabalho</option>
                    <option value="Eliminação de Desperdício">Eliminação de Desperdício</option>
                    <option value="Manutenção Autônoma">Manutenção Autônoma</option>
                    <option value="Qualidade & Poka-Yoke">Qualidade & Poka-Yoke</option>
                    <option value="Produtividade & Agilidade">Produtividade & Agilidade</option>
                  </select>
                </div>

                <div className="toten-input-group full">
                  <label className="toten-label">Problema Observado no Posto *:</label>
                  <textarea
                    value={ideaProblem}
                    onChange={(e) => setIdeaProblem(e.target.value)}
                    placeholder="O que está acontecendo hoje que atrasa ou gera desperdício?"
                    required
                    rows={2}
                    className="toten-textarea"
                  />
                </div>

                <div className="toten-input-group full">
                  <label className="toten-label">Solução Prática Sugerida *:</label>
                  <textarea
                    value={ideaSolution}
                    onChange={(e) => setIdeaSolution(e.target.value)}
                    placeholder="Qual a sua ideia prática para resolver esse problema?"
                    required
                    rows={2}
                    className="toten-textarea"
                  />
                </div>

                <div className="toten-input-group full">
                  <label className="toten-label">Ganhos Esperados (Segurança, Tempo ou Ergonomia):</label>
                  <input
                    type="text"
                    value={ideaBenefits}
                    onChange={(e) => setIdeaBenefits(e.target.value)}
                    placeholder="Ex: Reduz 15 min de parada, melhora ergonomia..."
                    className="toten-input"
                  />
                </div>

                {/* Foto Opcional */}
                <div className="toten-input-group full">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="toten-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Camera size={14} color="#34d399" />
                      <span>Foto do Posto ou Problema:</span>
                    </label>
                    <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                      Foto Opcional (não obrigatória)
                    </span>
                  </div>

                  {photoUrl ? (
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.4)', background: '#090e1a', padding: '8px' }}>
                      <img src={photoUrl} alt="Foto da Ideia" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '6px', display: 'block' }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{photoName || 'Foto anexada'}</span>
                        <button
                          type="button"
                          onClick={() => { setPhotoUrl(''); setPhotoName(''); }}
                          style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <X size={12} /> Remover Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        borderRadius: '8px',
                        background: '#090e1a',
                        border: '1.5px dashed rgba(255, 255, 255, 0.15)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <UploadCloud size={22} color="#22d3ee" style={{ marginBottom: '4px' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
                        Toque para anexar foto (opcional)
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        Caso não tenha foto, você pode confirmar e cadastrar direto!
                      </span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  onClick={() => setIdeaPhase('input')}
                  className="toten-btn-icon"
                >
                  Voltar e Ajustar
                </button>

                <button type="submit" className="toten-submit-btn">
                  <Send size={16} />
                  <span>Confirmar e Cadastrar Ideia</span>
                </button>
              </div>
            </form>
          )}

          {/* FASE 3: SUCESSO */}
          {ideaPhase === 'success' && lastSubmittedIdea && (
            <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid #34d399',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>
                  Ideia Registrada com Sucesso!
                </h4>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#cbd5e1' }}>
                  Parabéns, <strong style={{ color: '#22d3ee' }}>{lastSubmittedIdea.authorName}</strong>! Sua iniciativa foi integrada à base do Canal Kaizen.
                </p>
              </div>

              <div
                style={{
                  padding: '16px 24px',
                  borderRadius: '16px',
                  background: '#090e1a',
                  border: '1px solid rgba(6, 182, 212, 0.45)',
                  boxShadow: '0 0 25px rgba(6, 182, 212, 0.25)',
                  width: '100%',
                  maxWidth: '420px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Protocolo Oficial de Acompanhamento
                </span>
                <span style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: '#22d3ee' }}>
                  {lastSubmittedIdea.protocol}
                </span>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>
                  Setor: {lastSubmittedIdea.sectorName} • Origem: Toten Chão de Fábrica
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIdeaPhase('input');
                    setRawIdeaInput('');
                    setIdeaTitle('');
                    setIdeaProblem('');
                    setIdeaSolution('');
                  }}
                  className="toten-submit-btn"
                >
                  Cadastrar Outra Ideia
                </button>

                <button
                  type="button"
                  onClick={() => setView('menu')}
                  className="toten-btn-icon"
                  style={{ padding: '12px 20px', fontSize: '13px' }}
                >
                  Voltar ao Menu Principal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. AULA RÁPIDA COM O SENSEI                                   */}
      {/* ============================================================== */}
      {activeView === 'aula' && (
        <div className="toten-flow-box">
          <div className="toten-flow-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" onClick={() => setView('menu')} className="toten-back-btn">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="toten-flow-title">
                  <BookOpen size={22} color="#34d399" />
                  <span>Aula Rápida com o Sensei</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Pílula {currentPillIndex + 1} de {TOTEN_KAIZEN_PILLS.length}
                </span>
              </div>
            </div>

            <span className="toten-card-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              {TOTEN_KAIZEN_PILLS[currentPillIndex].tag}
            </span>
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: '#090e1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
                {TOTEN_KAIZEN_PILLS[currentPillIndex].title}
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 600, color: '#34d399' }}>
                {TOTEN_KAIZEN_PILLS[currentPillIndex].subtitle}
              </p>
            </div>

            <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
              {TOTEN_KAIZEN_PILLS[currentPillIndex].content}
            </p>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#6ee7b7',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} color="#34d399" />
              <span>Dica do Mestre: {TOTEN_KAIZEN_PILLS[currentPillIndex].tip}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => {
                const p = TOTEN_KAIZEN_PILLS[currentPillIndex];
                onSpeak(`${p.title}. ${p.subtitle}. ${p.content}. ${p.tip}`);
              }}
              className="toten-btn-icon"
              style={{ color: '#22d3ee' }}
            >
              <Volume2 size={16} />
              <span>Ouvir Aula</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() =>
                  setCurrentPillIndex((prev) => (prev > 0 ? prev - 1 : TOTEN_KAIZEN_PILLS.length - 1))
                }
                className="toten-btn-icon"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPillIndex((prev) => (prev + 1) % TOTEN_KAIZEN_PILLS.length)
                }
                className="toten-submit-btn"
                style={{ background: '#10b981', color: '#ffffff' }}
              >
                Próxima Pílula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. DESAFIO DO TURNO                                           */}
      {/* ============================================================== */}
      {activeView === 'desafio' && (
        <div className="toten-flow-box">
          <div className="toten-flow-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" onClick={() => setView('menu')} className="toten-back-btn">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="toten-flow-title">
                  <Trophy size={22} color="#fbbf24" />
                  <span>Desafio do Turno • Ação 5S</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Pequenas ações imediatas geram grande transformação.
                </span>
              </div>
            </div>

            <span className="toten-card-tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
              Missão Gemba
            </span>
          </div>

          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#090e1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={28} />
            </div>

            <div>
              <h4 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
                Missão: Bancada 100% Padrão
              </h4>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#cbd5e1', maxWidth: '480px' }}>
                Dedique 2 minutos antes de encerrar seu ciclo para guardar cada ferramenta na sua demarcação e retirar 3 itens inúteis da sua área.
              </p>
            </div>

            {hasAcceptedChallenge ? (
              <div
                style={{
                  padding: '14px 24px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  color: '#34d399',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Check size={18} />
                <span>Desafio Aceito! O Sensei confia na sua dedicação no turno!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setHasAcceptedChallenge(true);
                  try {
                    confetti({ particleCount: 80, spread: 70 });
                  } catch (_) {}
                  onSpeak('Desafio aceito! Esse é o espírito Kaizen de autodisciplina! Bom trabalho!');
                }}
                className="toten-submit-btn"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: '#090e1a' }}
              >
                Eu Aceito o Desafio!
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CONVERSAR COM O SENSEI IA                                  */}
      {/* ============================================================== */}
      {activeView === 'chat' && (
        <div className="toten-flow-box">
          <div className="toten-flow-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" onClick={() => setView('menu')} className="toten-back-btn">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="toten-flow-title">
                  <Bot size={22} color="#60a5fa" />
                  <span>Pergunte ao Sensei Kaizen</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Respostas sobre segurança, 5S, TPM e ergonomia.
                </span>
              </div>
            </div>

            <span className="toten-card-tag" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
              Voz Ativa
            </span>
          </div>

          <div
            style={{
              minHeight: '140px',
              padding: '20px',
              borderRadius: '16px',
              background: '#090e1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isAiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22d3ee', fontWeight: 700 }}>
                <RefreshCw size={20} className="animate-spin" />
                <span>O Sensei está formulando o ensinamento...</span>
              </div>
            ) : aiResponse ? (
              <div style={{ width: '100%', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#22d3ee' }}>
                    Ensinamento do Sensei:
                  </span>
                  <button
                    type="button"
                    onClick={() => onSpeak(aiResponse)}
                    className="toten-btn-icon"
                    style={{ padding: '4px 8px' }}
                  >
                    <Volume2 size={14} color="#22d3ee" />
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#f1f5f9', lineHeight: 1.6, fontWeight: 500 }}>
                  &ldquo;{aiResponse}&rdquo;
                </p>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                Toque no microfone ou digite uma dúvida sobre ferramentas, 5S ou procedimentos do turno.
              </p>
            )}
          </div>

          {/* Dúvidas Rápidas Prontas */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              'O que é 5S?',
              'Como evitar peças com defeito?',
              'Qual a importância do Poka-Yoke?',
              'Como manter a bancada limpa?',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setChatInput(q);
                  handleAskSensei(q);
                }}
                className="toten-btn-icon"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input de Mensagem */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={toggleVoiceRecordingForChat}
              className={`toten-btn-icon ${isChatListening ? 'active' : ''}`}
              style={{ padding: '12px', background: isChatListening ? '#ef4444' : undefined }}
              title={isChatListening ? 'Ouvindo...' : 'Falar Pergunta'}
            >
              {isChatListening ? <MicOff size={18} /> : <Mic size={18} color="#22d3ee" />}
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskSensei()}
              placeholder="Digite sua dúvida para o Sensei..."
              className="toten-input"
              style={{ flex: 1 }}
            />

            <button
              type="button"
              onClick={() => handleAskSensei()}
              disabled={!chatInput.trim() || isAiLoading}
              className="toten-submit-btn"
              style={{ padding: '12px 18px' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. LISTA DE IDEIAS DO TOTEN                                   */}
      {/* ============================================================== */}
      {activeView === 'lista_ideias' && (
        <div className="toten-flow-box">
          <div className="toten-flow-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" onClick={() => setView('menu')} className="toten-back-btn">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="toten-flow-title">
                  <ListFilter size={22} color="#22d3ee" />
                  <span>Ideias Cadastradas no Toten</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Histórico de sugestões enviadas pelo chão de fábrica.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setView('canal_kaizen');
                setIdeaPhase('input');
              }}
              className="toten-submit-btn"
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              + Nova Ideia
            </button>
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
            {registeredIdeas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '13px' }}>
                Nenhuma ideia cadastrada pelo Toten ainda. Seja o primeiro a registrar!
              </div>
            ) : (
              registeredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: '#090e1a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', color: '#22d3ee' }}>
                      {idea.protocol}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background:
                          idea.status === 'aprovada'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : idea.status === 'rejeitada'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                        color:
                          idea.status === 'aprovada'
                            ? '#34d399'
                            : idea.status === 'rejeitada'
                            ? '#f87171'
                            : '#fbbf24',
                      }}
                    >
                      {idea.status}
                    </span>
                  </div>

                  <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                    {idea.title || idea.summary.split('|')[0]}
                  </h5>

                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {idea.problem || idea.summary}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span>Autor: <strong style={{ color: '#e2e8f0' }}>{idea.authorName}</strong></span>
                    <span>Setor: {idea.sectorName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
