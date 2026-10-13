'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { SenseiState, KaizenIdea, Sector } from '@/lib/types';
import { TOTEN_KAIZEN_PILLS, TotenPill } from '@/lib/totenData';
import { dataService } from '@/services/dataService';
import {
  Lightbulb,
  Sparkles,
  Send,
  Mic,
  MicOff,
  X,
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
  Compass,
  AlertCircle,
  Zap,
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

  // Setores cadastrados no Lean Flow
  const [sectors, setSectors] = useState<Sector[]>([]);

  // Estados do Canal Kaizen
  const [ideaPhase, setIdeaPhase] = useState<'input' | 'review' | 'success'>('input');
  const [rawIdeaInput, setRawIdeaInput] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isStructuring, setIsStructuring] = useState(false);

  // Campos da proposta Kaizen
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('5S & Organização');
  const [ideaProblem, setIdeaProblem] = useState('');
  const [ideaSolution, setIdeaSolution] = useState('');
  const [ideaBenefits, setIdeaBenefits] = useState('');
  const [ideaAuthor, setIdeaAuthor] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSubmittedIdea, setLastSubmittedIdea] = useState<KaizenIdea | null>(null);
  const [registeredIdeas, setRegisteredIdeas] = useState<KaizenIdea[]>([]);

  // Chat com Sensei IA
  const [chatInput, setChatInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isChatListening, setIsChatListening] = useState(false);

  // Aula com Sensei (Pílulas)
  const [currentPillIndex, setCurrentPillIndex] = useState(0);

  // Desafio do Turno
  const [hasAcceptedChallenge, setHasAcceptedChallenge] = useState(false);

  // Referência do reconhecimento de voz nativo
  const recognitionRef = useRef<any>(null);
  const hasCelebratedRef = useRef(false);

  // Carregar setores e ideias já cadastradas via dataService
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
    } catch (err) {
      console.warn('[KaizenInteraction] Falha ao carregar dados iniciais:', err);
    }
  }, []);

  // Celebração inicial ao aproximar do Toten (1 vez por sessão)
  useEffect(() => {
    if (hasCelebratedRef.current) return;
    hasCelebratedRef.current = true;

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.4 },
    });

    onStateChange('celebrating');

    const welcomeSpeech =
      'Olá, bem-vindo ao Toten Kaizen! Toque na tela para escolher: cadastrar uma ideia, ter uma aula rápida, aceitar um desafio ou conversar comigo!';
    onSpeak(welcomeSpeech);

    setTimeout(() => {
      onStateChange('interacting');
    }, 2000);
  }, [onSpeak, onStateChange]);

  // Sincronizar sprite do Sensei com a tela ativa
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

  // Lapidação inteligente de ideia (IA + Fallback)
  const structureIdeaProposal = async (text: string) => {
    if (!text.trim()) return;

    setIsStructuring(true);
    setFormError(null);
    onSpeak('O Sensei está analisando sua ideia para organizá-la no formato Kaizen.');

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
    } catch (err) {
      console.warn('[KaizenInteraction] Erro ao estruturar proposta:', err);
      setIdeaTitle(`Melhoria: ${text.slice(0, 30)}...`);
      setIdeaProblem(text);
      setIdeaSolution('Implementar sugestão prática do operador.');
      setIdeaBenefits('Otimização do posto.');
      setIdeaPhase('review');
    } finally {
      setIsStructuring(false);
    }
  };

  // Gravação por voz da ideia
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
    } catch (err) {
      setIsVoiceRecording(false);
    }
  }, [isVoiceRecording]);

  // Submissão oficial no banco de dados do Lean Flow System
  const handleConfirmIdeaSubmission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ideaTitle.trim() || !ideaProblem.trim()) {
      setFormError('Por favor, preencha o título e o problema observado.');
      return;
    }

    if (!ideaAuthor.trim()) {
      setFormError('O Nome Completo do colaborador é obrigatório.');
      onSpeak('Por favor, informe seu nome completo para registrar a ideia no Canal Kaizen.');
      return;
    }

    setFormError(null);

    const sectorObj = sectors.find((s) => s.id === selectedSectorId);
    const sectorName = sectorObj ? sectorObj.name : 'Geral';

    try {
      // Cria a ideia Kaizen oficial no Lean Flow System
      const createdIdea = dataService.createKaizenIdea({
        authorName: ideaAuthor.trim(),
        authorRoleTitle: 'Colaborador do Chão de Fábrica',
        sectorId: selectedSectorId || 'geral',
        summary: `${ideaTitle.trim()} | Problema: ${ideaProblem.trim()} | Solução: ${ideaSolution.trim()} | Benefícios: ${ideaBenefits.trim()}`,
        origin: 'toten',
        title: ideaTitle.trim(),
        problem: ideaProblem.trim(),
        solution: ideaSolution.trim(),
        benefits: ideaBenefits.trim(),
        category: ideaCategory,
      });

      setLastSubmittedIdea(createdIdea);
      setRegisteredIdeas((prev) => [createdIdea, ...prev]);
      setIdeaPhase('success');

      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.55 },
      });

      onSpeak(
        `Parabéns, ${ideaAuthor.trim()}! Sua ideia foi registrada no Canal Kaizen com o protocolo ${createdIdea.protocol}!`
      );
    } catch (err: any) {
      console.error('[KaizenInteraction] Erro ao cadastrar ideia no sistema:', err);
      setFormError('Erro ao registrar ideia no sistema. Tente novamente.');
    }
  };

  // Chat com o Sensei IA
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
    } catch (err) {
      console.warn('[KaizenInteraction] Falha ao consultar Sensei:', err);
      const fallback =
        'O Sensei está atento! Lembre-se: organização e disciplina no posto evitam acidentes e poupam seu tempo!';
      setAiResponse(fallback);
      onSpeak(fallback);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Gravação por voz no Chat
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
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 select-none">
      {/* ============================================================== */}
      {/* 1. MENU PRINCIPAL (HUB DE OPÇÕES DO TOTEN)                    */}
      {/* ============================================================== */}
      {activeView === 'menu' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider border border-cyan-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Painel Interativo do Colaborador</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white">
              Como o Sensei pode te ajudar hoje?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Toque em uma das opções abaixo para registrar melhorias, aprender ou interagir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {/* Opção 1: Canal Kaizen (Destaque Principal) */}
            <button
              type="button"
              onClick={() => {
                setView('canal_kaizen');
                setIdeaPhase('input');
                onSpeak('Excelente! Você pode falar ou digitar sua ideia de melhoria para o chão de fábrica!');
              }}
              className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-950 border-2 border-cyan-500/50 hover:border-cyan-400 text-left transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 group-hover:scale-110 transition">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Chão de Fábrica
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition">
                    Cadastrar Ideia Kaizen
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Grave por voz ou digite uma sugestão de melhoria para seu posto ou máquina. Sua ideia vai direto para os gestores!
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Gravar por microfone ou tela</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Opção 2: Aula com o Sensei */}
            <button
              type="button"
              onClick={() => {
                setView('aula');
                setCurrentPillIndex(0);
                onSpeak('Bem-vindo à Aula Rápida! Vamos explorar os segredos do 5S e da metodologia Lean!');
              }}
              className="group p-5 sm:p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/50 text-left transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Educação Lean
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition">
                    Aula Rápida com o Sensei
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pílulas práticas de 1 minuto sobre 5S, eliminação dos 8 desperdícios industriais e qualidade na fonte.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Ver pílulas de conhecimento</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Opção 3: Desafio do Turno */}
            <button
              type="button"
              onClick={() => {
                setView('desafio');
                setHasAcceptedChallenge(false);
                onSpeak('Topa um desafio de 2 minutos para elevar o padrão do seu setor hoje?');
              }}
              className="group p-5 sm:p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-amber-500/50 text-left transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Missão Rápida
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition">
                    Desafio 5S do Turno
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Aceite uma missão rápida de 2 minutos no posto: organizar gaveta, recolher itens desnecessários e ganhar o respeito da equipe.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>Aceitar desafio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Opção 4: Chat com o Sensei IA */}
            <button
              type="button"
              onClick={() => {
                setView('chat');
                setAiResponse(null);
                onSpeak('Pode perguntar qualquer coisa sobre melhoria contínua, 5S ou segurança no trabalho!');
              }}
              className="group p-5 sm:p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-blue-500/50 text-left transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    IA Especialista
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition">
                    Conversar com o Sensei
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tire dúvidas por voz sobre procedimentos, ferramentas corretas, ergonomia ou consulte dicas para seu setor.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-blue-400">
                <span>Fazer uma pergunta</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>
          </div>

          {/* Rodapé do Menu com Botão de Ideias Cadastradas e Voltar ao Descanso */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setView('lista_ideias')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ListFilter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver Ideias Cadastradas no Toten ({registeredIdeas.length})</span>
            </button>

            <button
              type="button"
              onClick={onReturnToIdle}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Encerrar e Voltar à Espera</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CANAL KAIZEN (CADASTRO DE IDEIAS POR VOZ OU TELA)          */}
      {/* ============================================================== */}
      {activeView === 'canal_kaizen' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Cabeçalho do Fluxo */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Voltar ao Menu"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-cyan-400" />
                  <span>Canal Kaizen • Chão de Fábrica</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {ideaPhase === 'input' && 'Fase 1 de 2: Registre sua ideia por voz ou texto'}
                  {ideaPhase === 'review' && 'Fase 2 de 2: Revise e confirme sua contribuição'}
                  {ideaPhase === 'success' && 'Sucesso: Sua ideia já está na esteira de triagem!'}
                </p>
              </div>
            </div>

            {ideaPhase !== 'success' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {ideaPhase === 'input' ? 'Etapa de Captação' : 'Revisão'}
              </span>
            )}
          </div>

          {/* FASE 1: ENTRADA DE DADOS (VOZ OU TEXTO) */}
          {ideaPhase === 'input' && (
            <div className="space-y-6">
              <div className="text-center py-2">
                <p className="text-sm sm:text-base text-slate-200 font-medium">
                  Qual problema você enfrentou ou que ideia pode melhorar o seu turno?
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Exemplo: &ldquo;A chave 17 sumiu de novo da bancada&rdquo; ou &ldquo;Podemos colocar uma calha para guiar o refugo&rdquo;.
                </p>
              </div>

              {/* Botão Gigante de Microfone com Feedback Visual */}
              <div className="flex flex-col items-center justify-center gap-3 py-4">
                <button
                  type="button"
                  onClick={toggleVoiceRecordingForIdea}
                  disabled={isStructuring}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl relative ${
                    isVoiceRecording
                      ? 'bg-red-500 text-white animate-pulse scale-110 shadow-[0_0_40px_rgba(239,68,68,0.6)]'
                      : 'bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  {isVoiceRecording ? (
                    <>
                      <MicOff className="w-9 h-9" />
                      <span className="text-[10px] font-bold mt-1 uppercase">Parar</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-9 h-9" />
                      <span className="text-[10px] font-bold mt-1 uppercase">Falar Ideia</span>
                    </>
                  )}
                </button>
                <span className="text-xs font-semibold text-cyan-300">
                  {isVoiceRecording ? 'Gravando... Fale com clareza perto da tela!' : 'Toque no microfone para gravar por voz'}
                </span>
              </div>

              {/* Ou Digite no Teclado */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-3 text-slate-400">Ou digite diretamente</span>
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={rawIdeaInput}
                  onChange={(e) => setRawIdeaInput(e.target.value)}
                  placeholder="Descreva aqui sua oportunidade de melhoria..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 focus:border-cyan-400 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition resize-none"
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!rawIdeaInput.trim()) return;
                      structureIdeaProposal(rawIdeaInput);
                    }}
                    disabled={!rawIdeaInput.trim() || isStructuring}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
                  >
                    {isStructuring ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Estruturando Ideia...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Avançar para Revisão</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FASE 2: REVISÃO E IDENTIFICAÇÃO DO COLABORADOR */}
          {ideaPhase === 'review' && (
            <form onSubmit={handleConfirmIdeaSubmission} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Título da Ideia */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título da Oportunidade Kaizen:
                  </label>
                  <input
                    type="text"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-400 text-sm text-white focus:outline-none"
                  />
                </div>

                {/* Nome do Colaborador (Obrigatório) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Seu Nome Completo:</span>
                  </label>
                  <input
                    type="text"
                    value={ideaAuthor}
                    onChange={(e) => setIdeaAuthor(e.target.value)}
                    placeholder="Ex: João da Silva"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-400 text-sm text-white focus:outline-none"
                  />
                </div>

                {/* Setor de Trabalho */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Setor da Fábrica:</span>
                  </label>
                  <select
                    value={selectedSectorId}
                    onChange={(e) => setSelectedSectorId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-400 text-sm text-white focus:outline-none"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                    {sectors.length === 0 && <option value="geral">Geral / Produção</option>}
                  </select>
                </div>

                {/* Categoria */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria da Melhoria:
                  </label>
                  <select
                    value={ideaCategory}
                    onChange={(e) => setIdeaCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-400 text-sm text-white focus:outline-none"
                  >
                    <option value="5S & Organização">5S & Organização</option>
                    <option value="Segurança no Trabalho">Segurança no Trabalho</option>
                    <option value="Eliminação de Desperdício">Eliminação de Desperdício</option>
                    <option value="Manutenção Autônoma">Manutenção Autônoma</option>
                    <option value="Qualidade & Poka-Yoke">Qualidade & Poka-Yoke</option>
                    <option value="Agilidade & Produtividade">Agilidade & Produtividade</option>
                  </select>
                </div>

                {/* Problema Observado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Problema Observado no Posto:
                  </label>
                  <textarea
                    value={ideaProblem}
                    onChange={(e) => setIdeaProblem(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-400 text-xs text-slate-200 focus:outline-none resize-none"
                  />
                </div>

                {/* Solução Proposta */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Solução Prática Sugerida:
                  </label>
                  <textarea
                    value={ideaSolution}
                    onChange={(e) => setIdeaSolution(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-400 text-xs text-slate-200 focus:outline-none resize-none"
                  />
                </div>

                {/* Benefícios */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ganhos Esperados (Segurança, Tempo ou Ergonomia):
                  </label>
                  <input
                    type="text"
                    value={ideaBenefits}
                    onChange={(e) => setIdeaBenefits(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-400 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIdeaPhase('input')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  Voltar e Ajustar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirmar e Cadastrar Ideia</span>
                </button>
              </div>
            </form>
          )}

          {/* FASE 3: SUCESSO E PROTOCOLO OFICIAL */}
          {ideaPhase === 'success' && lastSubmittedIdea && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  Ideia Registrada com Sucesso!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Parabéns, <strong className="text-cyan-400">{lastSubmittedIdea.authorName}</strong>! Sua iniciativa foi integrada ao banco oficial de melhorias.
                </p>
              </div>

              {/* Protocolo em Destaque */}
              <div className="inline-block p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-xl max-w-md w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Protocolo Oficial de Acompanhamento
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-400 tracking-wider">
                  {lastSubmittedIdea.protocol}
                </span>
                <p className="text-xs text-slate-400 mt-2">
                  Setor: {lastSubmittedIdea.sectorName} • Origem: Toten Chão de Fábrica
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIdeaPhase('input');
                    setRawIdeaInput('');
                    setIdeaTitle('');
                    setIdeaProblem('');
                    setIdeaSolution('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Cadastrar Outra Ideia
                </button>

                <button
                  type="button"
                  onClick={() => setView('menu')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm transition cursor-pointer"
                >
                  Voltar ao Menu Principal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. AULA RÁPIDA COM O SENSEI (PÍLULAS LEAN & 5S)               */}
      {/* ============================================================== */}
      {activeView === 'aula' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>Aula Rápida com o Sensei</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pílula {currentPillIndex + 1} de {TOTEN_KAIZEN_PILLS.length}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {TOTEN_KAIZEN_PILLS[currentPillIndex].tag}
            </span>
          </div>

          {/* Conteúdo da Pílula */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xl sm:text-2xl font-black text-white">
                {TOTEN_KAIZEN_PILLS[currentPillIndex].title}
              </h4>
              <p className="text-xs sm:text-sm font-medium text-emerald-400">
                {TOTEN_KAIZEN_PILLS[currentPillIndex].subtitle}
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {TOTEN_KAIZEN_PILLS[currentPillIndex].content}
            </p>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Dica de Ouro: {TOTEN_KAIZEN_PILLS[currentPillIndex].tip}</span>
            </div>
          </div>

          {/* Navegação entre pílulas e Botão Ouvir */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                const p = TOTEN_KAIZEN_PILLS[currentPillIndex];
                onSpeak(`${p.title}. ${p.subtitle}. ${p.content}. ${p.tip}`);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Ouvir Aula</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPillIndex((prev) => (prev > 0 ? prev - 1 : TOTEN_KAIZEN_PILLS.length - 1))
                }
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPillIndex((prev) => (prev + 1) % TOTEN_KAIZEN_PILLS.length)
                }
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Próxima Pílula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. DESAFIO DO TURNO (AÇÃO PRÁTICA 5S DE 2 MINUTOS)           */}
      {/* ============================================================== */}
      {activeView === 'desafio' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Desafio do Turno • Ação 5S</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pequenas ações imediatas geram grande transformação.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Missão Gemba
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Flame className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl sm:text-2xl font-black text-white">
                Missão: Bancada 100% Padrão
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Dedique 2 minutos antes de encerrar seu ciclo para guardar cada ferramenta na sua demarcação e retirar 3 itens inúteis da sua área.
              </p>
            </div>

            {hasAcceptedChallenge ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
                <Check className="w-5 h-5" />
                <span>Desafio Aceito! O Sensei confia na sua dedicação no turno!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setHasAcceptedChallenge(true);
                  confetti({ particleCount: 80, spread: 70 });
                  onSpeak('Desafio aceito! Esse é o espírito Kaizen de autodisciplina! Bom trabalho!');
                }}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition shadow-xl hover:scale-105 cursor-pointer"
              >
                Eu Aceito o Desafio!
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CONVERSAR COM O SENSEI (CHAT POR VOZ OU TEXTO)             */}
      {/* ============================================================== */}
      {activeView === 'chat' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <span>Pergunte ao Sensei Kaizen</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Respostas instantâneas sobre segurança, 5S, TPM e ergonomia.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Voz Ativa
            </span>
          </div>

          {/* Resposta do Sensei */}
          <div className="min-h-[140px] p-5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center">
            {isAiLoading ? (
              <div className="flex items-center gap-2.5 text-cyan-400 text-sm font-semibold animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>O Sensei está formulando o ensinamento...</span>
              </div>
            ) : aiResponse ? (
              <div className="space-y-3 text-left w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ensinamento do Sensei:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSpeak(aiResponse)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                    title="Repetir Áudio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                  &ldquo;{aiResponse}&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400 italic text-center">
                Toque no microfone ou digite uma dúvida sobre ferramentas, 5S ou procedimentos do turno.
              </p>
            )}
          </div>

          {/* Pergunta Rápida Pronta */}
          <div className="flex flex-wrap gap-2">
            {[
              'O que é 5S?',
              'Como evitar peças com defeito?',
              'Qual a importância do Poka-Yoke?',
              'Como manter a bancada limpa na correria?',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setChatInput(q);
                  handleAskSensei(q);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-xs text-slate-300 hover:text-white transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input de Mensagem */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={toggleVoiceRecordingForChat}
              className={`p-3 rounded-xl transition cursor-pointer shrink-0 ${
                isChatListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
              title={isChatListening ? 'Ouvindo...' : 'Falar Pergunta'}
            >
              {isChatListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskSensei()}
              placeholder="Digite sua dúvida para o Sensei..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-sm text-white focus:outline-none"
            />

            <button
              type="button"
              onClick={() => handleAskSensei()}
              disabled={!chatInput.trim() || isAiLoading}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-400 font-bold transition cursor-pointer shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. LISTA DE IDEIAS DO TOTEN                                   */}
      {/* ============================================================== */}
      {activeView === 'lista_ideias' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <ListFilter className="w-5 h-5 text-cyan-400" />
                  <span>Ideias Cadastradas no Toten</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Histórico de sugestões enviadas pelo chão de fábrica.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setView('canal_kaizen');
                setIdeaPhase('input');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              + Nova Ideia
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
            {registeredIdeas.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
                Nenhuma ideia cadastrada pelo Toten ainda. Seja o primeiro a registrar!
              </div>
            ) : (
              registeredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 hover:border-cyan-500/30 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {idea.protocol}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        idea.status === 'aprovada'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : idea.status === 'rejeitada'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {idea.status}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white">
                    {idea.title || idea.summary.split('|')[0]}
                  </h5>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {idea.problem || idea.summary}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Autor: <strong className="text-slate-200">{idea.authorName}</strong></span>
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
