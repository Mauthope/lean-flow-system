'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Key,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Play,
  VolumeX,
  Cpu,
  Building2,
  Mail,
  FileCheck2,
  DollarSign,
  Check,
  Send,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import {
  validateGeminiApiKey,
  synthesizeSpeechGoogleCloud,
  SENSEI_PROFILE,
  saveVoicePreference,
} from '@/services/geminiService';

export default function IntegracoesIaPage() {
  const { currentTenant, currentUser } = useAuth();

  const [selectedVoice, setSelectedVoice] = useState<string>(SENSEI_PROFILE.defaultVoice);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');

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

  // Estados de Notificações Microsoft Graph API
  const [graphStatus, setGraphStatus] = useState<{
    isConfigured: boolean;
    hasTenantId: boolean;
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasMailSender: boolean;
    senderAddress: string;
    isEmailEnabled: boolean;
  } | null>(null);
  const [isLoadingGraphStatus, setIsLoadingGraphStatus] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success?: boolean;
    simulated?: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewTemplateType, setPreviewTemplateType] = useState<'controladoria' | 'test'>('controladoria');

  if (currentUser?.role === 'viewer') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: '1rem',
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldAlert size={32} color="#f87171" />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Acesso Restrito: Configurações de IA & API
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
          Seu perfil atual é de <strong>Consulta Executiva / Diretoria (Somente Leitura)</strong>. O gerenciamento de credenciais de IA, chaves de API e governança de controladoria é restrito aos Administradores Master da Entidade.
        </p>
        <Link
          href="/admin/dashboard"
          className="btn btn-primary btn-sm"
          style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          Voltar para o Dashboard Lean
        </Link>
      </div>
    );
  }

  // Carrega configurações da Entidade
  useEffect(() => {
    const tenant = dataService.getCurrentTenant();
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
  // SALVAR CONFIGURAÇÃO GLOBAL NA ENTIDADE (SECOPS COMPLIANT)
  // ===================================================================
  const handleSave = async () => {
    setIsValidating(true);
    setValidationResult(null);
    setIsSaved(false);

    const check = await validateGeminiApiKey();
    setIsValidating(false);

    if (check.valid && check.ttsEnabled) {
      // Salva preferências de voz e modelo na entidade (sem gravar credenciais no browser)
      dataService.saveTenantAiSettings({
        preferredVoice: selectedVoice,
        model: selectedModel,
      });

      saveVoicePreference(selectedVoice);

      setIsSaved(true);
      setValidationResult({
        valid: true,
        ttsEnabled: true,
        message: 'Conexão validada com sucesso! O Sensei IA e o Text-to-Speech estão operacionais e protegidos no servidor.',
      });
    } else if (check.valid && !check.ttsEnabled) {
      dataService.saveTenantAiSettings({
        preferredVoice: selectedVoice,
        model: selectedModel,
      });
      saveVoicePreference(selectedVoice);

      setIsSaved(true);
      setValidationResult({
        valid: true,
        ttsEnabled: false,
        showCredentialsLink: true,
        message:
          check.ttsError ||
          'Sensei IA conectado! Porém a API Text-to-Speech precisa ser autorizada nas credenciais do Google Cloud.',
      });
    } else {
      setValidationResult({
        valid: false,
        message: check.error || 'Falha na validação das credenciais de IA no servidor. Verifique as variáveis de ambiente AI_API_KEY ou GEMINI_API_KEY.',
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
  // NOTIFICAÇÕES & DISPARO MICROSOFT GRAPH API (M365)
  // ===================================================================
  const loadGraphStatus = async () => {
    setIsLoadingGraphStatus(true);
    try {
      const res = await fetch('/api/email/status');
      const data = await res.json();
      if (data.success) {
        setGraphStatus(data);
      }
    } catch (err) {
      console.warn('[IntegracoesIaPage] Falha ao consultar status do Microsoft Graph:', err);
    } finally {
      setIsLoadingGraphStatus(false);
    }
  };

  useEffect(() => {
    loadGraphStatus();
    if (currentUser?.email) {
      setTestEmailRecipient(currentUser.email);
    }
  }, [currentUser?.email]);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient.trim()) return;

    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailRecipient.trim(),
          type: 'test',
          tenantName: currentTenant?.name || 'Rafitec S.A.',
          tenantId: currentTenant?.id,
        }),
      });

      const data = await res.json();
      setTestEmailResult({
        success: data.success,
        simulated: data.simulated,
        message: data.message,
        error: data.error,
      });
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        error: err?.message || 'Falha de comunicação ao testar envio.',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // ===================================================================
  // TESTAR VOZ DO SENSEI VIA SERVIDOR
  // ===================================================================
  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    setValidationResult(null);
    try {
      const sampleText =
        'Olá! Eu sou o Sensei, o especialista de inteligência artificial da sua fábrica. Todas as integrações de voz e análise Kaizen estão operando com sucesso!';

      const tts = await synthesizeSpeechGoogleCloud({
        text: sampleText,
        voiceName: selectedVoice,
      });

      setIsTestingVoice(false);

      if (tts.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${tts.audioBase64}`);
        await audio.play();
      } else {
        setValidationResult({
          valid: false,
          message: tts.error || 'Não foi possível gerar áudio com o serviço de IA do servidor.',
        });
      }
    } catch (err: any) {
      setIsTestingVoice(false);
      setValidationResult({ valid: false, message: err?.message || 'Erro ao testar voz do servidor.' });
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <Cpu size={26} color="#22d3ee" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Integrações de Inteligência Artificial
          </h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
          Infraestrutura corporativa de IA (Google Gemini e Text-to-Speech) gerenciada centralmente no servidor para todas as entidades da organização{' '}
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
        {/* Card: Infraestrutura de IA Centralizada no Servidor (Vercel) */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={22} color="#10b981" />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Chave de IA Corporativa Centralizada no Servidor (Vercel)
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Governança AppSec Grupo Vaccaro &bull; Compartilhada automaticamente com todas as entidades
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              Ativa &bull; Multi-Tenant Automático
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            A autenticação com os serviços de Inteligência Artificial do <strong>Google Gemini</strong> e síntese de voz <strong>Neural2</strong> é gerenciada exclusivamente no servidor backend corporativo (Vercel) via variáveis de ambiente seguras (<code style={{ color: '#22d3ee', fontSize: '0.75rem' }}>AI_API_KEY</code> / <code style={{ color: '#22d3ee', fontSize: '0.75rem' }}>GEMINI_API_KEY</code>). Nenhuma entidade precisa cadastrar, gerenciar ou colar tokens manualmente no navegador.
          </p>
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
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recomendado & Alta Velocidade)</option>
              <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Baixa Latência)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Raciocínio Avançado)</option>
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
            disabled={isTestingVoice || isValidating}
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
            disabled={isValidating}
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
                Validar Conexão & Salvar Preferências
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

      {/* =================================================================== */}
      {/* SEÇÃO 3: NOTIFICAÇÕES CORPORATIVAS MICROSOFT 365 / ENTRA ID        */}
      {/* =================================================================== */}
      <div
        className="card"
        style={{
          marginTop: '2rem',
          padding: '2rem',
          borderRadius: '16px',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
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
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 165, 233, 0.4) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={22} color="#22d3ee" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Notificações Corporativas Microsoft 365 (Microsoft Graph)
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Disparo transacional seguro de alertas, prazos e auditorias via Entra ID para todas as unidades do grupo
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={loadGraphStatus}
              disabled={isLoadingGraphStatus}
              title="Atualizar diagnóstico"
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                fontSize: '0.78125rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <RefreshCw size={13} className={isLoadingGraphStatus ? 'animate-spin' : ''} />
              Atualizar Status
            </button>

            <button
              onClick={() => setIsPreviewModalOpen(true)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#22d3ee',
                fontSize: '0.78125rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Eye size={14} />
              Pré-visualizar E-mail (Outlook)
            </button>
          </div>
        </div>

        {/* Diagnóstico das 5 Variáveis de Servidor */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {/* Tenant ID */}
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>AZURE_TENANT_ID</div>
            <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: graphStatus?.hasTenantId ? '#10b981' : '#f59e0b' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: graphStatus?.hasTenantId ? '#34d399' : '#fbbf24' }}>
                {graphStatus?.hasTenantId ? 'Detectado' : 'Aguardando TI'}
              </span>
            </div>
          </div>

          {/* Client ID */}
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>AZURE_CLIENT_ID</div>
            <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: graphStatus?.hasClientId ? '#10b981' : '#f59e0b' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: graphStatus?.hasClientId ? '#34d399' : '#fbbf24' }}>
                {graphStatus?.hasClientId ? 'Detectado' : 'Aguardando TI'}
              </span>
            </div>
          </div>

          {/* Client Secret */}
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>AZURE_CLIENT_SECRET</div>
            <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: graphStatus?.hasClientSecret ? '#10b981' : '#f59e0b' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: graphStatus?.hasClientSecret ? '#34d399' : '#fbbf24' }}>
                {graphStatus?.hasClientSecret ? 'Configurado' : 'Aguardando TI'}
              </span>
            </div>
          </div>

          {/* Mail Sender */}
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Caixa Oficial (Sender)</div>
            <div style={{ marginTop: '0.35rem', fontSize: '0.8125rem', fontWeight: 700, color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={graphStatus?.senderAddress}>
              {graphStatus?.senderAddress || 'Não informado'}
            </div>
          </div>

          {/* Flag EMAIL_ENABLED */}
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Chave EMAIL_ENABLED</div>
            <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: graphStatus?.isEmailEnabled ? '#10b981' : '#38bdf8' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: graphStatus?.isEmailEnabled ? '#34d399' : '#38bdf8' }}>
                {graphStatus?.isEmailEnabled ? 'Envio Real (Ativo)' : 'Modo Simulado'}
              </span>
            </div>
          </div>
        </div>

        {/* Informativo de Segurança SecOps */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            fontSize: '0.8125rem',
            color: '#cffafe',
            lineHeight: 1.5,
            marginBottom: '1.75rem',
          }}
        >
          <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
            Arquitetura Pré-configurada e Blindada (SecOps):
          </strong>
          O sistema conecta-se ao Microsoft Graph via <strong>OAuth2 Client Credentials</strong> exclusivamente no backend Next.js. Os templates são construídos em <strong>tabelas HTML com estilos inline</strong> para compatibilidade perfeita no Microsoft Outlook do PC e celulares. Para testar o envio sem enviar e-mails reais, mantenha <code>EMAIL_ENABLED=false</code> no <code>.env.local</code>.
        </div>

        {/* Formulário de Teste de Disparo */}
        <form onSubmit={handleSendTestEmail} style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.5rem 0' }}>
            Disparo de Teste e Homologação de Conectividade
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
            Envie uma mensagem de teste para verificar a entrega na caixa do Outlook. Se o envio real estiver desligado, o sistema validará a rota em modo simulado.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <input
                type="email"
                required
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="Digite seu e-mail corporativo (ex: seu.nome@rafitec.com.br)"
                className="input"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: '#0b1120',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSendingTestEmail || !testEmailRecipient.trim()}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#0284c7',
              }}
            >
              {isSendingTestEmail ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Testando Envio...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Enviar E-mail de Teste
                </>
              )}
            </button>
          </div>

          {/* Feedback do Resultado do Teste */}
          {testEmailResult && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: testEmailResult.success
                  ? testEmailResult.simulated
                    ? 'rgba(6, 182, 212, 0.12)'
                    : 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(239, 68, 68, 0.12)',
                border: testEmailResult.success
                  ? testEmailResult.simulated
                    ? '1px solid rgba(6, 182, 212, 0.35)'
                    : '1px solid rgba(16, 185, 129, 0.35)'
                  : '1px solid rgba(239, 68, 68, 0.35)',
                color: testEmailResult.success
                  ? testEmailResult.simulated
                    ? '#22d3ee'
                    : '#34d399'
                  : '#f87171',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                {testEmailResult.success ? (
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <strong>
                    {testEmailResult.success
                      ? testEmailResult.simulated
                        ? 'Simulação Concluída com Sucesso'
                        : 'E-mail Transacional Entregue com Sucesso'
                      : 'Falha no Teste de Conexão'}
                    :
                  </strong>{' '}
                  {testEmailResult.message || testEmailResult.error}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Modal de Pré-visualização do Template HTML */}
      {isPreviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              backgroundColor: '#0d1527',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Cabeçalho do Modal */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#0a1020',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  Pré-visualização do Template de E-mail (Compatibilidade Outlook)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Renderização de tabela HTML com largura fixa de 600px e estilos inline
                </span>
              </div>

              <button
                onClick={() => setIsPreviewModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Seletor de Tipo de Template */}
            <div
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#111d35',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <button
                onClick={() => setPreviewTemplateType('controladoria')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: previewTemplateType === 'controladoria' ? '#0284c7' : 'transparent',
                  color: previewTemplateType === 'controladoria' ? '#ffffff' : '#94a3b8',
                  border: '1px solid',
                  borderColor: previewTemplateType === 'controladoria' ? '#0284c7' : 'rgba(255, 255, 255, 0.1)',
                  fontSize: '0.78125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Notificação de Auditoria da Controladoria
              </button>

              <button
                onClick={() => setPreviewTemplateType('test')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: previewTemplateType === 'test' ? '#0284c7' : 'transparent',
                  color: previewTemplateType === 'test' ? '#ffffff' : '#94a3b8',
                  border: '1px solid',
                  borderColor: previewTemplateType === 'test' ? '#0284c7' : 'rgba(255, 255, 255, 0.1)',
                  fontSize: '0.78125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                E-mail de Teste de Homologação M365
              </button>
            </div>

            {/* Iframe com a Renderização Real do Template */}
            <div style={{ flex: 1, backgroundColor: '#060a13', padding: '1rem', overflowY: 'auto' }}>
              <iframe
                title="Pré-visualização do e-mail"
                src={`/api/email/preview?type=${previewTemplateType}&tenantName=${encodeURIComponent(currentTenant?.name || 'Rafitec S.A.')}`}
                style={{
                  width: '100%',
                  height: '520px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#060a13',
                }}
              />
            </div>

            {/* Rodapé do Modal */}
            <div
              style={{
                padding: '0.85rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: '#0a1020',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
