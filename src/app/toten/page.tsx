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
import { SwitchCamera, Eye, Zap } from 'lucide-react';

export default function TotenPage() {
  const [senseiState, setSenseiState] = useState<SenseiState>('idle');
  const [interactionView, setInteractionView] = useState<InteractionView>('menu');

  const { speak, isMuted, toggleMute, isSpeaking } = useSpeechSynthesis();

  // Screen Wake Lock API para manter o quiosque sempre aceso no chão de fábrica
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('[TotenPage] Wake Lock indisponível:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  const handleStateChange = useCallback((st: SenseiState) => {
    setSenseiState(st);
  }, []);

  // Quando alguém se aproxima do totem
  const handlePersonEnter = useCallback(() => {
    setInteractionView('menu');
    setSenseiState((prev) => {
      if (prev === 'idle') return 'celebrating';
      return prev;
    });
  }, []);

  // Quando a pessoa sai do raio de visão e o timeout expira (15 segundos)
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
  } = usePersonDetection({
    onPersonEnter: handlePersonEnter,
    onPersonLeave: handlePersonLeave,
    inactivityTimeoutMs: 15000,
  });

  const handleReturnToIdle = useCallback(() => {
    resetPresence(3500);
    setSenseiState('idle');
    setInteractionView('menu');
  }, [resetPresence]);

  return (
    <main className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100">
      {/* Elemento de vídeo oculto persistentemente na DOM */}
      <video ref={videoRef} playsInline autoPlay muted className="hidden" />

      {/* Grade de Radar de fundo */}
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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-3 sm:px-6 py-3 sm:py-5 w-full max-w-5xl mx-auto">
        {/* Mascote Sensei */}
        <div className="w-full flex flex-col items-center justify-center flex-1">
          <div className="mb-2 sm:mb-3">
            <SenseiAvatar
              state={senseiState}
              isSpeaking={isSpeaking}
              size={senseiState === 'idle' ? 'lg' : interactionView === 'menu' ? 'xl' : 'sm'}
            />
          </div>

          {senseiState === 'idle' && (
            <div className="w-full flex justify-center mb-2">
              <IdleScreensaver />
            </div>
          )}
        </div>

        {/* Área Dinâmica: Standby vs Ativo */}
        {senseiState === 'idle' ? (
          /* Modo Espera: Scanner de Presença com Tela de Toque */
          <div className="w-full max-w-4xl px-2 sm:px-4 pb-2 sm:pb-4">
            <div
              onClick={triggerSimulation}
              className="relative aspect-video sm:aspect-[16/9] min-h-[280px] sm:min-h-[380px] max-h-[48vh] w-full rounded-3xl overflow-hidden border-2 border-cyan-500/50 bg-slate-950/90 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex items-center justify-center cursor-pointer group"
              title="Toque na tela para iniciar o atendimento do Sensei"
            >
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'transform -scale-x-100' : ''
                }`}
              />

              {/* Laser de varredura visual */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse" />

              {/* Cantoneiras Futuristas */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

              {/* Tag de Topo */}
              <div className="absolute top-3 left-3 ml-7 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 text-[11px] font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Sensor Óptico de Presença • Campo Aberto</span>
              </div>

              {/* Botão de Troca de Câmera */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFacingMode();
                }}
                className="absolute top-3 right-3 mr-7 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 hover:border-cyan-400 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg"
                title="Trocar Câmera Frontal / Traseira"
              >
                <SwitchCamera className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">
                  {facingMode === 'user' ? 'Frontal' : 'Traseira'}
                </span>
              </button>

              {/* Guia de Ação */}
              <div className="absolute bottom-4 inset-x-0 mx-auto text-center px-4 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 text-xs sm:text-sm font-medium text-cyan-200 shadow-xl group-hover:border-cyan-400 transition">
                  <Eye className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                  <span>Aproxime-se ou toque na tela para interagir com o Sensei</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Modo Interativo: Menus e Formulários Kaizen */
          <div className="w-full flex justify-center flex-1 items-center py-2">
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

      {/* Barra de Status do Quiosque */}
      <footer className="relative z-20 w-full px-6 py-3 border-t border-white/5 bg-slate-950/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Toten Kiosk • Canal Kaizen & Sensei IA
          </span>
          <span>•</span>
          <span className="text-slate-400">Desenvolvido para Chão de Fábrica & Melhoria Contínua</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            {cameraActive
              ? `Câmera: Ativa (${facingMode === 'user' ? 'Frontal' : 'Traseira'})`
              : isSimulated
              ? 'Modo: Simulação / Touch'
              : isLoadingModel
              ? 'Carregando sensor...'
              : 'Sensor: Em espera'}
          </span>
          <span>•</span>
          <span className="text-cyan-400 font-mono">
            {detection.hasPerson ? `Presença Ativa (${detection.personCount})` : 'Standby'}
          </span>
        </div>
      </footer>

      {/* Painel Retrátil de Diagnóstico */}
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
