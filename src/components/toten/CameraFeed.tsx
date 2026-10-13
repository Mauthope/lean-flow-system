'use client';

import React, { useState } from 'react';
import { CameraDevice, DetectionResult } from './usePersonDetection';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  SwitchCamera,
  RefreshCw,
  Sparkles,
  Eye,
  Sliders,
  Check,
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
    <div className="fixed bottom-4 right-4 z-40">
      {/* Botão de Toggle Diagnóstico */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-white shadow-xl backdrop-blur-md text-xs font-medium transition cursor-pointer"
        title="Diagnóstico de Sensor e Câmera"
      >
        <Camera className="w-4 h-4 text-cyan-400" />
        <span className="hidden sm:inline">Diagnóstico Óptico</span>
        <span
          className={`w-2 h-2 rounded-full ${
            detection.hasPerson
              ? 'bg-emerald-400'
              : cameraActive
              ? 'bg-cyan-400'
              : 'bg-amber-400 animate-pulse'
          }`}
        />
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Gaveta de Controles Técnicos */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-slate-900 border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-xl mb-2 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Painel de Visão Óptica</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-3">
            {/* Status da Câmera */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">Sensor:</span>
              <span className="font-mono text-cyan-300">
                {cameraActive ? 'Ativo' : cameraError ? 'Falha / Bloqueado' : 'Aguardando'}
              </span>
            </div>

            {/* Presença Detectada */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">Presença Humana:</span>
              <span
                className={`font-semibold ${
                  detection.hasPerson ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {detection.hasPerson ? 'Detectada no Raio' : 'Ausente (Standby)'}
              </span>
            </div>

            {/* Modo Simulação Touch (para quiosques sem webcam) */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-slate-400 mb-1.5">Controle de Teste / Toten Touch:</label>
              {isSimulated ? (
                <button
                  type="button"
                  onClick={onDisableSimulation}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Desativar Simulação
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleSimulation}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Simular Presença (Entrar)</span>
                </button>
              )}
            </div>

            {/* Alternar Câmeras Disponíveis */}
            {availableDevices.length > 1 && (
              <div className="pt-2">
                <label className="block text-slate-400 mb-1">Selecionar Entrada de Vídeo:</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => onSelectDevice(e.target.value)}
                  className="w-full py-1.5 px-2 rounded-lg bg-slate-950 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Padrão do Sistema</option>
                  {availableDevices.map((dev) => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Botões rápidos de reinício */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onToggleFacingMode}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1 text-[11px] transition"
              >
                <SwitchCamera className="w-3 h-3" />
                <span>Girar Câmera</span>
              </button>
              <button
                type="button"
                onClick={onRestartCamera}
                className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-[11px] transition"
                title="Reiniciar Câmera"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
