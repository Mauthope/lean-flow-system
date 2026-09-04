'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Play,
  VolumeX,
  Cpu,
  Building2,
  Mail,
  FileCheck2,
  DollarSign,
  Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import {
  validateGeminiApiKey,
  synthesizeSpeechGoogleCloud,
  SENSEI_PROFILE,
  saveGeminiApiKey,
  saveVoicePreference,
} from '@/services/geminiService';

export default function IntegracoesIaPage() {
  const { currentTenant } = useAuth();

  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>(SENSEI_PROFILE.defaultVoice);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid?: boolean;
    ttsEnabled?: boolean;
    message?: string;
    showCredentialsLink?: boolean;
  } | null>(null);

  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Estados de Governança & Controladoria
  const [controladoriaEmail, setControladoriaEmail] = useState('');
  const [controladoriaName, setControladoriaName] = useState('');
  const [autoNotifyControladoria, setAutoNotifyControladoria] = useState(true);
  const [isSavingControladoria, setIsSavingControladoria] = useState(false);
  const [controladoriaSaved, setControladoriaSaved] = useState(false);

  // Carrega configurações da Entidade
  useEffect(() => {
    const tenant = dataService.getCurrentTenant();
    if (tenant?.aiSettings?.geminiApiKey) {
      setApiKey(tenant.aiSettings.geminiApiKey);
    }
    if (tenant?.aiSettings?.preferredVoice) {
      setSelectedVoice(tenant.aiSettings.preferredVoice);
    }
    if (tenant?.aiSettings?.model) {
      setSelectedModel(tenant.aiSettings.model);
    }
    if (tenant?.aiSettings?.controladoriaEmail) {
      setControladoriaEmail(tenant.aiSettings.controladoriaEmail);
    }
    if (tenant?.aiSettings?.controladoriaName) {
      setControladoriaName(tenant.aiSettings.controladoriaName);
    }
    if (tenant?.aiSettings?.autoNotifyControladoria !== undefined) {
      setAutoNotifyControladoria(tenant.aiSettings.autoNotifyControladoria);
    }
  }, [currentTenant]);

  // ===================================================================
  // SALVAR CONFIGURAÇÃO GLOBAL NA ENTIDADE
  // ===================================================================
  const handleSave = async () => {
    const cleanKey = apiKey.trim();
    setIsValidating(true);
    setValidationResult(null);
    setIsSaved(false);

    const check = await validateGeminiApiKey(cleanKey);
    setIsValidating(false);

    if (check.valid && check.ttsEnabled) {
      // Salva no banco de dados da Entidade
      dataService.saveTenantAiSettings({
        geminiApiKey: cleanKey,
        preferredVoice: selectedVoice,
        model: selectedModel,
      });

      // Sincroniza localmente
      saveGeminiApiKey(cleanKey);
      saveVoicePreference(selectedVoice);

      setIsSaved(true);
      setValidationResult({
        valid: true,
        ttsEnabled: true,
        message: 'Configuração salva com sucesso! Todos os agentes da entidade já têm acesso ao Sensei.',
      });
    } else if (check.valid && !check.ttsEnabled) {
      dataService.saveTenantAiSettings({
        geminiApiKey: cleanKey,
        preferredVoice: selectedVoice,
        model: selectedModel,
      });
      saveGeminiApiKey(cleanKey);
      saveVoicePreference(selectedVoice);

      setIsSaved(true);
      setValidationResult({
        valid: true,
        ttsEnabled: false,
        showCredentialsLink: true,
        message:
          check.ttsError ||
          'Chave salva! Porém a API Text-to-Speech precisa ser autorizada nas credenciais do Google Cloud.',
      });
    } else {
      setValidationResult({
        valid: false,
        message: check.error || 'Chave de API inválida no Google Cloud.',
      });
    }
  };

  // ===================================================================
  // SALVAR CONFIGURAÇÃO DA CONTROLADORIA
  // ===================================================================
  const handleSaveControladoria = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingControladoria(true);
    dataService.saveTenantAiSettings({
      controladoriaEmail: controladoriaEmail.trim(),
      controladoriaName: controladoriaName.trim(),
      autoNotifyControladoria,
    });
    setTimeout(() => {
      setIsSavingControladoria(false);
      setControladoriaSaved(true);
      setTimeout(() => setControladoriaSaved(false), 4000);
    }, 400);
  };

  // ===================================================================
  // TESTAR VOZ DO SENSEI
  // ===================================================================
  const handleTestVoice = async () => {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      setValidationResult({ valid: false, message: 'Por favor, insira uma chave do Google primeiro.' });
      return;
    }

    setIsTestingVoice(true);
    try {
      const sampleText =
        'Olá! Eu sou o Sensei, o especialista de inteligência artificial da sua fábrica. Todas as integrações de voz e análise Kaizen estão operando com sucesso!';

      const tts = await synthesizeSpeechGoogleCloud({
        text: sampleText,
        apiKey: cleanKey,
        voiceName: selectedVoice,
      });

      setIsTestingVoice(false);

      if (tts.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${tts.audioBase64}`);
        await audio.play();
      } else {
        setValidationResult({
          valid: false,
          message: tts.error || 'Não foi possível gerar áudio com esta chave.',
        });
      }
    } catch (err: any) {
      setIsTestingVoice(false);
      setValidationResult({ valid: false, message: err?.message || 'Erro ao testar voz.' });
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🥋</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Integrações de Inteligência Artificial
          </h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
          Centralize os tokens do Google Gemini AI e Google Cloud Text-to-Speech para toda a organização{' '}
          <strong style={{ color: '#22d3ee' }}>({currentTenant?.name || 'Entidade Lean'})</strong>.
        </p>
      </div>

      {/* Card Principal */}
      <div
        style={{
          backgroundColor: '#090e1a',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Banner Informativo */}
        <div
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Building2 size={20} color="#22d3ee" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22d3ee', margin: '0 0 0.2rem' }}>
              Gestão Centralizada no Nível da Organização
            </h4>
            <p style={{ fontSize: '0.78125rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
              A chave configurada abaixo é compartilhada automaticamente com todos os agentes, líderes e apresentadores da entidade. Ninguém mais precisará colar chaves no navegador.
            </p>
          </div>
        </div>

        {/* Campo 1: Chave de API do Google */}
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
            <Key size={14} color="#fbbf24" />
            Chave de API do Google Cloud (Gemini + Text-to-Speech):
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setValidationResult(null);
              setIsSaved(false);
            }}
            placeholder="Cole sua chave gerada no Google Cloud Console (AIzaSy...)"
            style={{
              width: '100%',
              backgroundColor: '#040711',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '0.7rem 1rem',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
            }}
          />
          <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem' }}>
            A chave deve ter permissão para <strong>Cloud Text-to-Speech API</strong> no Google Cloud Console.
          </span>
        </div>

        {/* Campo 2: Voz Oficial do Sensei */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              <Volume2 size={14} color="#22d3ee" />
              Voz Padrão do Sensei para a Fábrica:
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => {
                setSelectedVoice(e.target.value);
                setIsSaved(false);
              }}
              style={{
                width: '100%',
                backgroundColor: '#040711',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '0.7rem 1rem',
                color: '#ffffff',
                fontSize: '0.8125rem',
              }}
            >
              {SENSEI_PROFILE.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              <Cpu size={14} color="#a855f7" />
              Modelo de Inteligência do Gemini:
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setIsSaved(false);
              }}
              style={{
                width: '100%',
                backgroundColor: '#040711',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '0.7rem 1rem',
                color: '#ffffff',
                fontSize: '0.8125rem',
              }}
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Rápido & Recomendado)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Alta Precisão)</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </div>
        </div>

        {/* Feedback de Validação */}
        {validationResult && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              backgroundColor: validationResult.valid
                ? validationResult.ttsEnabled
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(251, 191, 36, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${
                validationResult.valid
                  ? validationResult.ttsEnabled
                    ? '#10b981'
                    : '#fbbf24'
                  : '#ef4444'
              }`,
              color: validationResult.valid
                ? validationResult.ttsEnabled
                  ? '#34d399'
                  : '#fde68a'
                : '#f87171',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
              {validationResult.valid ? (
                validationResult.ttsEnabled ? (
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                )
              ) : (
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <span style={{ lineHeight: 1.45 }}>{validationResult.message}</span>
            </div>

            {validationResult.showCredentialsLink && (
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  alignSelf: 'flex-start',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={13} />
                Abrir Credenciais do Google Cloud (Desmarcar restrição da chave)
              </a>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={handleTestVoice}
            disabled={isTestingVoice || isValidating || !apiKey.trim()}
            className="btn btn-sm"
            style={{
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#22d3ee',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {isTestingVoice ? (
              <>
                <Sparkles size={14} className="animate-spin" />
                Gerando Áudio de Teste...
              </>
            ) : (
              <>
                <Play size={14} />
                Testar Voz do Sensei
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isValidating || !apiKey.trim()}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.75rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: isSaved ? '#10b981' : undefined,
            }}
          >
            {isValidating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Validando Conexão...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 size={16} />
                Salvo com Sucesso!
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Salvar para Toda a Entidade
              </>
            )}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SEÇÃO 2: GOVERNANÇA CORPORATIVA & HOMOLOGAÇÃO DA CONTROLADORIA     */}
      {/* =================================================================== */}
      <div
        className="card"
        style={{
          marginTop: '2rem',
          padding: '2rem',
          borderRadius: '16px',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(59, 130, 246, 0.4) 100%)',
                border: '1px solid rgba(96, 165, 250, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCheck2 size={24} color="#60a5fa" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Governança & Homologação da Controladoria
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Auditoria e validação oficial de números e ganhos financeiros antes do ciclo trimestral de sustentação
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#4ade80',
            }}
          >
            <Check size={14} />
            Arquitetura Pronta para Supabase
          </div>
        </div>

        {/* Nota explicativa de auditoria */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: '0.8125rem',
            color: '#bfdbfe',
            lineHeight: 1.5,
            marginBottom: '1.75rem',
          }}
        >
          <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
            Fluxo Automático com Link Escopado Seguro:
          </strong>
          Sempre que um projeto Kaizen declarar economia ou custo evitado, ele será submetido à Controladoria. O sistema dispara um e-mail com link exclusivo para o responsável auditar, ajustar ou validar cada uma das 7 fontes de ganho. Durante seus testes locais, o link também é disponibilizado diretamente na tela do projeto.
        </div>

        <form onSubmit={handleSaveControladoria}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Campo E-mail */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                <Mail size={15} color="#60a5fa" />
                E-mail da Controladoria / Auditoria Financeira
              </label>
              <input
                type="email"
                required
                value={controladoriaEmail}
                onChange={(e) => setControladoriaEmail(e.target.value)}
                placeholder="ex: controladoria@empresa.com.br"
                className="input"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: '#0b1120',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem' }}>
                Destinatário dos alertas e links de aprovação financeira dos projetos.
              </span>
            </div>

            {/* Campo Nome do Responsável / Departamento */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                <Building2 size={15} color="#94a3b8" />
                Nome do Responsável ou Departamento
              </label>
              <input
                type="text"
                value={controladoriaName}
                onChange={(e) => setControladoriaName(e.target.value)}
                placeholder="ex: Gerência de Controladoria & Custos"
                className="input"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: '#0b1120',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem' }}>
                Identificação exibida na saudação do e-mail e nos relatórios de homologação.
              </span>
            </div>
          </div>

          {/* Opção de Disparo Automático */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.5rem',
            }}
          >
            <input
              type="checkbox"
              id="autoNotifyControladoria"
              checked={autoNotifyControladoria}
              onChange={(e) => setAutoNotifyControladoria(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
            />
            <label htmlFor="autoNotifyControladoria" style={{ fontSize: '0.8125rem', color: '#e2e8f0', cursor: 'pointer', userSelect: 'none' }}>
              <strong>Notificação Automática:</strong> Disparar e-mail instantâneo à Controladoria assim que o Agente ou Gestor submeter o projeto para homologação prévia.
            </label>
          </div>

          {/* Botão Salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
            {controladoriaSaved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.8125rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} /> Configurações da Controladoria salvas com sucesso!
              </span>
            )}

            <button
              type="submit"
              disabled={isSavingControladoria || !controladoriaEmail.trim()}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: controladoriaSaved ? '#10b981' : '#2563eb',
              }}
            >
              {isSavingControladoria ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : controladoriaSaved ? (
                <>
                  <CheckCircle2 size={16} />
                  Salvo!
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Salvar Configurações da Controladoria
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
