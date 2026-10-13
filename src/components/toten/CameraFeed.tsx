'use client';

import React, { useState } from 'react';
import { CameraDevice, DetectionResult } from './usePersonDetection';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  SwitchCamera,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';

interface CameraFeedProps {
  cameraActive: boolean;
  cameraError: string | null;
  detection: DetectionResult;
  isLoadingModel: boolean;
  isSimulated: boolean;
  facingMode: 'user' | 'environment';
  availableDevices: CameraDevice[];
  selectedDeviceId: string;
  onToggleFacingMode: () => void;
  onSelectDevice: (deviceId: string) => void;
  onToggleSimulation: () => void;
  onDisableSimulation: () => void;
  onRestartCamera: () => void;
}

export const CameraFeed = React.memo(function CameraFeed({
  cameraActive,
  cameraError,
  detection,
  isLoadingModel,
  isSimulated,
  facingMode,
  availableDevices,
  selectedDeviceId,
  onToggleFacingMode,
  onSelectDevice,
  onToggleSimulation,
  onDisableSimulation,
  onRestartCamera,
}: CameraFeedProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 40 }}>
      {/* Botão de Toggle Diagnóstico */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#cbd5e1',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
        title="Diagnóstico de Sensor e Câmera"
      >
        <Camera size={14} color="#22d3ee" />
        <span>Diagnóstico Óptico</span>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: detection.hasPerson ? '#34d399' : cameraActive ? '#22d3ee' : '#fbbf24',
          }}
        />
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Gaveta de Controles Técnicos */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: 0,
            width: '300px',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#ffffff' }}>
              <Sliders size={14} color="#22d3ee" />
              <span>Painel de Visão Óptica</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px' }}
            >
              Fechar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '8px', background: '#090e1a' }}>
              <span style={{ color: '#94a3b8' }}>Sensor de Vídeo:</span>
              <span style={{ color: cameraActive ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                {cameraActive ? 'Ativo' : cameraError ? 'Modo Touch' : 'Aguardando'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '8px', background: '#090e1a' }}>
              <span style={{ color: '#94a3b8' }}>Presença Humana:</span>
              <span style={{ color: detection.hasPerson ? '#34d399' : '#64748b', fontWeight: 700 }}>
                {detection.hasPerson ? 'Detectada' : 'Ausente (Standby)'}
              </span>
            </div>

            {/* Simulação Touch */}
            <div style={{ paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {isSimulated ? (
                <button
                  type="button"
                  onClick={onDisableSimulation}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Desativar Simulação
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleSimulation}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    color: '#22d3ee',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={14} />
                  <span>Simular Presença (Toque)</span>
                </button>
              )}
            </div>

            {/* Dispositivos de Vídeo */}
            {availableDevices.length > 1 && (
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '4px' }}>Entrada de Vídeo:</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => onSelectDevice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: '#090e1a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                >
                  <option value="">Padrão</option>
                  {availableDevices.map((dev) => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={onToggleFacingMode}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <SwitchCamera size={13} />
                <span>Girar</span>
              </button>
              <button
                type="button"
                onClick={onRestartCamera}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
                title="Reiniciar Câmera"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
