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
    </div>
  );
}
