'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePersonDetection } from '@/components/toten/usePersonDetection';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { SenseiAvatar } from '@/components/toten/SenseiAvatar';
import { RadarScanner } from '@/components/toten/RadarScanner';
import { IdleScreensaver } from '@/components/toten/IdleScreensaver';
import { KaizenInteraction, InteractionView } from '@/components/toten/KaizenInteraction';
import { CameraFeed } from '@/components/toten/CameraFeed';
import { HeaderNav } from '@/components/toten/HeaderNav';
import { SenseiState } from '@/lib/types';
import { SwitchCamera, Eye } from 'lucide-react';

export default function TotenPage() {
  const [senseiState, setSenseiState] = useState<SenseiState>('idle');
  const [interactionView, setInteractionView] = useState<InteractionView>('menu');

  const { speak, isMuted, toggleMute, isSpeaking } = useSpeechSynthesis();

  // Wake Lock API seguro contra rejeições
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (_) {}
    };

    requestWakeLock();

    return () => {
      try {
        if (wakeLock) {
          wakeLock.release().catch(() => {});
        }
      } catch (_) {}
    };
  }, []);

  const handleStateChange = useCallback((st: SenseiState) => {
    setSenseiState(st);
  }, []);

  const handlePersonEnter = useCallback(() => {
    setInteractionView('menu');
    setSenseiState((prev) => {
      if (prev === 'idle') return 'celebrating';
      return prev;
    });
  }, []);

  const handlePersonLeave = useCallback(() => {
    setSenseiState('idle');
    setInteractionView('menu');
  }, []);

  const {
    videoRef,
    canvasRef,
    isLoadingModel,
    cameraActive,
    cameraError,
    detection,
    isSimulated,
    facingMode,
    availableDevices,
    selectedDeviceId,
    toggleFacingMode,
    selectDevice,
    triggerSimulation,
    disableSimulation,
    resetPresence,
    restartCamera,
    reportUserActivity,
  } = usePersonDetection({
    onPersonEnter: handlePersonEnter,
    onPersonLeave: handlePersonLeave,
    inactivityTimeoutMs: interactionView === 'menu' ? 90000 : 180000,
  });

  const handleReturnToIdle = useCallback(() => {
    resetPresence(3500);
    setSenseiState('idle');
    setInteractionView('menu');
  }, [resetPresence]);

  return (
    <main className="toten-root">
      {/* Elemento de vídeo oculto na DOM para stream óptico */}
      <video ref={videoRef} playsInline autoPlay muted style={{ display: 'none' }} />

      {/* Radar animado de fundo em CSS */}
      <RadarScanner isScanning={senseiState === 'idle'} />

      {/* Cabeçalho do Toten Kiosk */}
      <HeaderNav
        isMuted={isMuted}
        onToggleMute={toggleMute}
        personDetected={detection.hasPerson}
        facingMode={facingMode}
        onToggleFacingMode={toggleFacingMode}
      />

      {/* Arena Interativa Central */}
      <div className="toten-arena">
        {/* Mascote Sensei */}
        <div className="toten-mascot-wrapper">
          <div style={{ marginBottom: '12px' }}>
            <SenseiAvatar
              state={senseiState}
              isSpeaking={isSpeaking}
              size={senseiState === 'idle' ? 'lg' : interactionView === 'menu' ? 'xl' : 'sm'}
            />
          </div>

          {senseiState === 'idle' && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <IdleScreensaver />
            </div>
          )}
        </div>

        {/* Modo Espera vs Modo Ativo */}
        {senseiState === 'idle' ? (
          /* Modo Espera: Scanner de Presença com Toque na Tela */
          <div className="toten-scanner-container">
            <div
              onClick={triggerSimulation}
              className="toten-scanner-frame"
              title="Toque na tela para iniciar o atendimento do Sensei"
            >
              <canvas
                ref={canvasRef}
                className="toten-scanner-canvas"
                style={{
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />

              {/* Laser de varredura */}
              <div className="toten-scanner-laser" />

              {/* Cantoneiras cibernéticas */}
              <div className="toten-bracket-tl" />
              <div className="toten-bracket-tr" />
              <div className="toten-bracket-bl" />
              <div className="toten-bracket-br" />

              {/* Tag de Topo */}
              <div className="toten-scanner-badge">
                <span className="toten-status-dot standby" style={{ width: '8px', height: '8px' }} />
                <span>Sensor Óptico de Presença • Campo Aberto</span>
              </div>

              {/* Botão de Trocar Câmera */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFacingMode();
                }}
                className="toten-btn-icon"
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  padding: '4px 10px',
                  fontSize: '11px',
                }}
                title="Trocar Câmera Frontal / Traseira"
              >
                <SwitchCamera size={13} color="#22d3ee" />
                <span>{facingMode === 'user' ? 'Frontal' : 'Traseira'}</span>
              </button>

              {/* Instrução de Toque no Rodapé do Feed */}
              <div className="toten-scanner-touch-hint">
                <Eye size={16} color="#22d3ee" />
                <span>Aproxime-se ou toque na tela para interagir com o Sensei</span>
              </div>
            </div>
          </div>
        ) : (
          /* Modo Interativo: Menus e Formulários Kaizen */
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center', padding: '8px 0' }}>
            <KaizenInteraction
              personDetected={detection.hasPerson}
              onSpeak={speak}
              onStateChange={handleStateChange}
              onReturnToIdle={handleReturnToIdle}
              activeView={interactionView}
              onViewChange={setInteractionView}
            />
          </div>
        )}
      </div>

      {/* Barra de Status Inferior */}
      <footer className="toten-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="toten-status-dot active" style={{ width: '7px', height: '7px' }} />
          <span style={{ fontWeight: 600, color: '#94a3b8' }}>
            Toten Kiosk • Canal Kaizen & Sensei IA
          </span>
          <span>•</span>
          <span>Chão de Fábrica & Melhoria Contínua</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            {cameraActive
              ? `Câmera Ativa (${facingMode === 'user' ? 'Frontal' : 'Traseira'})`
              : isSimulated
              ? 'Modo: Simulação / Toque'
              : 'Sensor: Em espera'}
          </span>
          <span>•</span>
          <span style={{ color: '#22d3ee', fontFamily: 'monospace', fontWeight: 700 }}>
            {detection.hasPerson ? `Presença Ativa (${detection.personCount})` : 'Standby'}
          </span>
        </div>
      </footer>

      {/* Painel Retrátil de Diagnóstico Óptico */}
      <CameraFeed
        cameraActive={cameraActive}
        cameraError={cameraError}
        detection={detection}
        isLoadingModel={isLoadingModel}
        isSimulated={isSimulated}
        facingMode={facingMode}
        availableDevices={availableDevices}
        selectedDeviceId={selectedDeviceId}
        onToggleFacingMode={toggleFacingMode}
        onSelectDevice={selectDevice}
        onToggleSimulation={triggerSimulation}
        onDisableSimulation={disableSimulation}
        onRestartCamera={restartCamera}
      />
    </main>
  );
}
