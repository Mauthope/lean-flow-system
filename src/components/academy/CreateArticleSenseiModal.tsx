'use client';

import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  BookOpen,
  Wrench,
  Clock,
  Lightbulb,
  FileText,
  RotateCcw,
  Plus,
  HelpCircle,
  TrendingUp,
  Edit3,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';
import { LeanArticleItem } from '@/lib/types';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import {
  generateSenseiArticle,
  refineSenseiArticleWithChat,
  GeneratedSenseiArticle,
} from '@/services/geminiService';

interface CreateArticleSenseiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newArticle: LeanArticleItem) => void;
}

interface ChatMessage {
  id: string;
  sender: 'master' | 'sensei';
  text: string;
  timestamp: string;
}

export default function CreateArticleSenseiModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateArticleSenseiModalProps) {
  const { currentUser } = useAuth();

  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<'Fundamentos' | 'Qualidade' | 'Produtividade' | 'Métodos' | 'Manutenção'>('Produtividade');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [guidelines, setGuidelines] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Minuta do Artigo
  const [draftArticle, setDraftArticle] = useState<GeneratedSenseiArticle | null>(null);

  // Modo de visualização / edição manual
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

  // Chat com o Sensei
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userChatInput, setUserChatInput] = useState('');

  // Notificação visual de última alteração aplicada
  const [lastChangeNotification, setLastChangeNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateDraft = async () => {
    if (!topic.trim()) {
      alert('Por favor, informe o tópico ou tema do artigo (ex: Pareto, SMED, 5S, OEE, Kanban...).');
      return;
    }

    setIsGenerating(true);
    setLastChangeNotification(null);

    try {
      const generated = await generateSenseiArticle({
        topic: topic.trim(),
        category,
        readTimeMinutes: Number(readTimeMinutes) || 5,
        guidelines: guidelines.trim(),
      });

      setDraftArticle(generated);
      setViewMode('preview');

      setChatMessages([
        {
          id: '1',
          sender: 'sensei',
          text: `Oss! Pesquisei e formulei o artigo técnico completo sobre "${generated.title}". Você pode conferir os conceitos, o caso prático no chão de fábrica e o passo a passo no painel à esquerda. O que você gostaria de refinar, corrigir ou aprofundar?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Erro ao gerar artigo com Sensei:', err);
      alert('Ocorreu um erro ao gerar a minuta. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim() || !draftArticle || isChatTyping) return;

    const userText = userChatInput.trim();
    setUserChatInput('');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'master',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsChatTyping(true);
    setLastChangeNotification(null);

    try {
      const historyFormatted = chatMessages.map((m) => ({
        role: (m.sender === 'master' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));

      const result = await refineSenseiArticleWithChat({
        currentArticle: draftArticle,
        userFeedback: userText,
        chatHistory: historyFormatted,
      });

      // Aplica imediatamente as alterações no artigo!
      setDraftArticle(result.updatedArticle);
      setLastChangeNotification('Alterações aplicadas com sucesso no artigo!');

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'sensei',
          text: result.replyMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Erro ao refinar artigo com Sensei:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'sensei',
          text: 'Tive uma oscilação na conexão, mas atualizei o rascunho com base nas suas diretrizes! Confira o painel ao lado.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const handlePublish = () => {
    if (!draftArticle) return;

    const published = dataService.createArticle({
      title: draftArticle.title,
      category: draftArticle.category,
      readTimeMinutes: draftArticle.readTimeMinutes,
      minReadTimeSeconds: draftArticle.minReadTimeSeconds,
      icon: draftArticle.icon || '⚡',
      summary: draftArticle.summary,
      badge: 'Sensei IA',
      isNew: true,
      isCustom: true,
      authorName: `${currentUser?.name || 'Gestor Master'} & Sensei IA`,
      content: draftArticle.content,
    });

    if (typeof window !== 'undefined') {
      import('canvas-confetti')
        .then((module) => {
          const confettiFn = module.default || module;
          confettiFn({
            particleCount: 160,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#22d3ee', '#10b981'],
          });
        })
        .catch(() => {});
    }

    onSuccess(published);
    onClose();
  };

  return (
    <div
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
      <div
        style={{
          backgroundColor: '#090e1a',
          border: '1.5px solid rgba(251, 191, 36, 0.45)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1080px',
          height: '92vh',
          maxHeight: '900px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, #040711 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%)',
                border: '1.5px solid rgba(254, 240, 138, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Bot size={22} color="#fbbf24" />
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
                  Pesquisa & Co-criação de Artigos com o Sensei IA
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
                  Exclusivo Gestor Master
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Pesquise, redija e converse com o Sensei para refinar em tempo real antes de publicar na Academia Lean
              </span>
            </div>
          </div>

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

        {/* Notificação de Alteração em Tempo Real */}
        {lastChangeNotification && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              borderBottom: '1px solid #10b981',
              padding: '0.35rem 1.5rem',
              fontSize: '0.75rem',
              color: '#34d399',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={14} />
            <span>{lastChangeNotification}</span>
          </div>
        )}

        {/* Corpo: 2 Colunas (Esquerda: Briefing & Minuta | Direita: Chat com Sensei) */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', overflow: 'hidden' }}>
          {/* Coluna 1: Briefing, Rascunho e Edição */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              overflowY: 'auto',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {!draftArticle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                    1. Briefing de Pesquisa para o Sensei
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
                    Digite o tópico desejado (ex: <strong>pareto</strong>, <strong>5s</strong>, <strong>smed</strong>, <strong>oee</strong>). O Sensei pesquisará na ciência Lean e trará o artigo técnico completo e estruturado para você revisar!
                  </p>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Tópico / Tema do Artigo: *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: pareto, smed, 5s, oee, kanban, matriz gut, trabalho padronizado..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>Categoria Lean:</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      <option value="Fundamentos">Fundamentos</option>
                      <option value="Produtividade">Produtividade</option>
                      <option value="Qualidade">Qualidade</option>
                      <option value="Métodos">Métodos</option>
                      <option value="Manutenção">Manutenção</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>Tempo Estimado (min):</label>
                    <input
                      type="number"
                      min={2}
                      max={15}
                      className="form-control"
                      value={readTimeMinutes}
                      onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label className="form-label" style={{ color: '#cbd5e1', margin: 0 }}>Diretrizes & Sugestão do Master:</label>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(Opcional)</span>
                  </div>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Ex: 'quero exemplos práticos', 'focar em estamparia', 'incluir cálculos de ROI'... (Se deixar em branco, o Sensei pesquisará tudo)"
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    Dica: basta uma sugestão simples ou deixar em branco. O Sensei formulará a introdução, conceitos, passos no Gemba, caso real e dicas para prova.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={isGenerating}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#fbbf24',
                    color: '#000000',
                    fontWeight: 900,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.35)',
                    marginTop: '0.35rem',
                  }}
                >
                  <Sparkles size={16} />
                  {isGenerating ? 'Sensei Pesquisando e Redigindo Artigo...' : 'Pesquisar & Gerar Artigo com Sensei'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Controles do Topo do Artigo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: viewMode === 'preview' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: viewMode === 'preview' ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: viewMode === 'preview' ? '#22d3ee' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Eye size={13} /> Prévia Formatada
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: viewMode === 'edit' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: viewMode === 'edit' ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: viewMode === 'edit' ? '#fbbf24' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Edit3 size={13} /> Edição Manual Direta
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDraftArticle(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.725rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Voltar ao Briefing
                  </button>
                </div>

                {/* Modo 1: Pré-visualização Formatada */}
                {viewMode === 'preview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ backgroundColor: '#0f172a', borderRadius: '14px', padding: '1.15rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '0.1rem 0.45rem', borderRadius: '999px', fontWeight: 800 }}>
                          {draftArticle.category}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>• {draftArticle.readTimeMinutes} min de leitura</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.4rem' }}>
                        {draftArticle.title}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                        {draftArticle.content.introduction}
                      </p>
                    </div>

                    {/* Conceitos Chave */}
                    <div style={{ backgroundColor: '#090e1a', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#22d3ee' }}>
                        📖 Conceitos-Chave Estruturados ({draftArticle.content.keyConcepts.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {draftArticle.content.keyConcepts.map((kc, idx) => (
                          <div key={idx} style={{ fontSize: '0.775rem', color: '#cbd5e1' }}>
                            <strong style={{ color: '#ffffff' }}>{kc.title}:</strong> {kc.description}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Passo a Passo no Gemba */}
                    <div style={{ backgroundColor: '#090e1a', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>
                        🛠️ Como Aplicar no Gemba (Passo a Passo)
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.775rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {draftArticle.content.howToApply.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Exemplo de Fábrica com Custo Evitado */}
                    <div style={{ backgroundColor: '#090e1a', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>
                        🏭 Exemplo Real com Custo Evitado (ROI)
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.775rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                        {draftArticle.content.factoryExample}
                      </p>
                    </div>

                    {/* Boas Práticas */}
                    <div style={{ backgroundColor: '#090e1a', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', fontWeight: 800, color: '#c084fc' }}>
                        ✨ Boas Práticas Operacionais
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.775rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                        {draftArticle.content.bestPractices.map((bp, idx) => (
                          <li key={idx}>{bp}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Dica para Prova */}
                    <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', padding: '0.85rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 800, color: '#fbbf24' }}>
                        🎯 Dica do Sensei para Prova de Certificação
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#fef08a', lineHeight: 1.4 }}>
                        {draftArticle.content.quizHint}
                      </p>
                    </div>
                  </div>
                )}

                {/* Modo 2: Edição Manual Direta pelo Master */}
                {viewMode === 'edit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Título do Artigo:</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={draftArticle.title}
                        onChange={(e) => setDraftArticle({ ...draftArticle, title: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Categoria:</label>
                        <select
                          className="form-select form-select-sm"
                          value={draftArticle.category}
                          onChange={(e) => setDraftArticle({ ...draftArticle, category: e.target.value as any })}
                        >
                          <option value="Fundamentos">Fundamentos</option>
                          <option value="Produtividade">Produtividade</option>
                          <option value="Qualidade">Qualidade</option>
                          <option value="Métodos">Métodos</option>
                          <option value="Manutenção">Manutenção</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Tempo de Leitura (min):</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={draftArticle.readTimeMinutes}
                          onChange={(e) => setDraftArticle({ ...draftArticle, readTimeMinutes: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Introdução:</label>
                      <textarea
                        className="form-textarea"
                        rows={4}
                        value={draftArticle.content.introduction}
                        onChange={(e) =>
                          setDraftArticle({
                            ...draftArticle,
                            content: { ...draftArticle.content, introduction: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Exemplo Real de Fábrica com ROI / Custo Evitado:</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        value={draftArticle.content.factoryExample}
                        onChange={(e) =>
                          setDraftArticle({
                            ...draftArticle,
                            content: { ...draftArticle.content, factoryExample: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Dica para Prova:</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={draftArticle.content.quizHint}
                        onChange={(e) =>
                          setDraftArticle({
                            ...draftArticle,
                            content: { ...draftArticle.content, quizHint: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna 2: Chat Interativo com o Sensei */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#040711',
            }}
          >
            {/* Header do Chat */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Bot size={18} color="#fbbf24" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff' }}>
                Chat de Ajustes com o Sensei
              </span>
            </div>

            {/* Mensagens */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                  <Bot size={32} color="#334155" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                  Gere a primeira minuta à esquerda para começar a conversar e pedir alterações em tempo real ao Sensei!
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === 'master' ? 'flex-end' : 'flex-start',
                      maxWidth: '88%',
                      backgroundColor: msg.sender === 'master' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(251, 191, 36, 0.15)',
                      border: `1px solid ${msg.sender === 'master' ? '#22d3ee' : '#fbbf24'}`,
                      borderRadius: '12px',
                      padding: '0.65rem 0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.7rem', color: msg.sender === 'master' ? '#22d3ee' : '#fbbf24' }}>
                        {msg.sender === 'master' ? 'Você (Master)' : 'Sensei IA'}
                      </strong>
                      <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{msg.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.775rem', color: '#ffffff', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </p>
                  </div>
                ))
              )}

              {isChatTyping && (
                <div style={{ alignSelf: 'flex-start', padding: '0.45rem 0.85rem', backgroundColor: 'rgba(251, 191, 36, 0.15)', border: '1px solid #fbbf24', borderRadius: '10px', fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bot size={14} />
                  <span>Sensei pesquisando, corrigindo e aplicando suas sugestões no artigo...</span>
                </div>
              )}
            </div>

            {/* Input do Chat */}
            <form
              onSubmit={handleSendChatMessage}
              style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={draftArticle ? 'Ex: Corrija o exemplo para focar em usinagem e recalcule o ROI...' : 'Gere a minuta primeiro...'}
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                disabled={!draftArticle || isChatTyping}
                style={{ fontSize: '0.775rem' }}
              />
              <button
                type="submit"
                disabled={!draftArticle || !userChatInput.trim() || isChatTyping}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#fbbf24', color: '#000000', fontWeight: 800, padding: '0.4rem 0.85rem' }}
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
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
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {draftArticle ? 'Minuta refinada pelo Sensei. Clique em Publicar para liberar para os agentes.' : 'Preencha o formulário e clique em Pesquisar & Gerar Artigo.'}
          </span>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700 }}
            >
              Cancelar
            </button>

            {draftArticle && (
              <button
                type="button"
                onClick={handlePublish}
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: '#10b981',
                  color: '#000000',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                }}
              >
                <CheckCircle2 size={16} />
                Publicar Artigo Oficial na Academia
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}