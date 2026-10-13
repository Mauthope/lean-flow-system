'use client';

import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ShieldCheck,
  SwitchCamera,
  Zap,
} from 'lucide-react';

interface HeaderNavProps {
  isMuted: boolean;
  onToggleMute: () => void;
  personDetected: boolean;
  facingMode?: 'user' | 'environment';
  onToggleFacingMode?: () => void;
}

export const HeaderNav = React.memo(function HeaderNav({
  isMuted,
  onToggleMute,
  personDetected,
  facingMode = 'user',
  onToggleFacingMode,
}: HeaderNavProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <>
      <header className="toten-header">
        {/* Identidade do Toten e Status */}
        <div className="toten-brand">
          <div className="toten-logo-box">
            <div className="toten-logo-inner">
              <Zap size={22} color="#22d3ee" />
            </div>
          </div>
          <div>
            <div className="toten-title-row">
              <h1 className="toten-title">SENSEI KAIZEN</h1>
              <span className={`toten-status-dot ${personDetected ? 'active' : 'standby'}`} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="toten-author-badge">
                <Zap size={10} color="#22d3ee" />
                <span>Feito por Mauricio Grigol</span>
              </span>
            </div>
            <p className="toten-subtitle">
              Toten do Chão de Fábrica • Canal Kaizen & Melhoria Contínua
            </p>
          </div>
        </div>

        {/* Controles e Relógio */}
        <div className="toten-controls">
          {currentTime && <div className="toten-clock">{currentTime}</div>}

          {onToggleFacingMode && (
            <button
              type="button"
              onClick={onToggleFacingMode}
              className="toten-btn-icon"
              title={`Trocar Câmera (Atual: ${facingMode === 'user' ? 'Frontal' : 'Traseira'})`}
            >
              <SwitchCamera size={15} color="#22d3ee" />
              <span>{facingMode === 'user' ? 'Frontal' : 'Traseira'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="toten-btn-icon"
            title="Conformidade LGPD"
          >
            <ShieldCheck size={15} color="#34d399" />
            <span>LGPD On-Device</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className={`toten-btn-icon ${isMuted ? '' : 'active'}`}
            title={isMuted ? 'Ativar Voz' : 'Silenciar Voz'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="toten-btn-icon"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Toten (Tela Cheia)'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Modal de Transparência LGPD */}
      {showPrivacyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '12px' }}>
              <ShieldCheck size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                Privacidade e LGPD
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '14px' }}>
              Este toten utiliza inteligência com <strong>processamento 100% local no dispositivo</strong>:
            </p>
            <ul style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, paddingLeft: '18px', margin: '0 0 20px 0' }}>
              <li>Nenhuma imagem, foto ou gravação é salva ou transmitida.</li>
              <li>A detecção óptica roda exclusivamente na memória RAM local.</li>
              <li>Não realiza reconhecimento facial biométrico nem identifica colaboradores.</li>
              <li>A câmera opera estritamente como sensor de aproximação interativa.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: '#06b6d4',
                color: '#060a13',
                fontWeight: 800,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
});
