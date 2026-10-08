'use client';

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X, Check, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaRegister: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // 1. Registro do Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Monitoramento de atualizações do worker
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível em segundo plano
                  console.info('[PWA] Nova versão do Lean Flow pronta para uso.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });
    }

    // 2. Detecção de modo standalone (já instalado)
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      setIsInstalled(isStandalone);

      // 3. Detecção de iOS Safari (não emite beforeinstallprompt)
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;
      setIsIos(isIosDevice && !isStandalone);

      // 4. Captura do evento beforeinstallprompt (Android / Desktop Chrome / Edge)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      };

      // 5. Monitoramento de conectividade (Online / Offline)
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Verifica preferência de descarte prévia
      try {
        const dismissedAt = localStorage.getItem('leanflow_pwa_dismissed');
        if (dismissedAt) {
          const daysAgo = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
          if (daysAgo < 7) {
            setIsDismissed(true);
          }
        }
      } catch {
        // Ignora erros de localStorage
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('leanflow_pwa_dismissed', String(Date.now()));
    } catch {
      // Ignora erro
    }
  };

  return (
    <>
      {/* Alerta de Conectividade Offline no Gemba */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="pwa-offline-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
          }}
        >
          <WifiOff size={16} color="#fbbf24" />
          <span>Modo Offline: Operando com dados locais em cache.</span>
        </div>
      )}

      {/* Banner / Card Executivo de Instalação PWA */}
      {!isInstalled && !isDismissed && (isInstallable || isIos) && (
        <div
          className="pwa-install-banner"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '16px',
            padding: '1.15rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.15)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
                }}
              >
                <Smartphone size={20} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Instalar Lean Flow
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                  Acesso rápido direto da área de trabalho ou tela de início do tablet/celular.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Guia especial para iOS Safari */}
          {showIosGuide ? (
            <div
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '10px',
                padding: '0.75rem',
                fontSize: '0.75rem',
                color: '#e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: '#22d3ee' }}>
                <Share size={14} /> Como instalar no iPhone/iPad:
              </div>
              <div>1. Toque no botão <strong>Compartilhar</strong> na barra do Safari.</div>
              <div>2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleInstallClick}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#0284c7',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Download size={14} />
                <span>{isIos ? 'Ver Como Instalar' : 'Instalar Aplicativo'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Agora não
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
