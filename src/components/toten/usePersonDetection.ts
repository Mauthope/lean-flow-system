'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface DetectionResult {
  hasPerson: boolean;
  score: number;
  personCount: number;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}

interface UsePersonDetectionOptions {
  onPersonEnter?: () => void;
  onPersonLeave?: () => void;
  inactivityTimeoutMs?: number;
}

export function usePersonDetection({
  onPersonEnter,
  onPersonLeave,
  inactivityTimeoutMs = 15000,
}: UsePersonDetectionOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  const isSimulatedRef = useRef(false);
  isSimulatedRef.current = isSimulated;

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const [detection, setDetection] = useState<DetectionResult>({
    hasPerson: false,
    score: 0,
    personCount: 0,
  });

  const lastSeenRef = useRef<number>(0);
  const isPersonPresentRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  // Listar câmeras com segurança
  const refreshDevices = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Câmera ${idx + 1}`,
        }));
      setAvailableDevices(videoDevs);
    } catch (_) {}
  }, []);

  const stopCamera = useCallback(() => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (_) {}
    setCameraActive(false);
  }, []);

  // Iniciar câmera com salvaguarda total de erros
  const startCamera = useCallback(
    async (deviceId?: string, mode?: 'user' | 'environment') => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraError('Câmera não suportada neste dispositivo.');
        setIsSimulated(true);
        return;
      }

      stopCamera();
      setCameraError(null);

      const targetMode = mode || facingMode;
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
          : { facingMode: targetMode, width: { ideal: 640 }, height: { ideal: 480 } },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!videoRef.current) return;
            videoRef.current.play().catch(() => {});
            setCameraActive(true);
            refreshDevices();
          };
        }
      } catch (err: any) {
        // Falha normal de câmera (ex: sem webcam ou permissão negada) -> Entra em modo touch com elegância
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Acesso à câmera bloqueado. Modo Toque na Tela ativo.'
            : 'Câmera não disponível. Modo Toque na Tela ativo.'
        );
        setCameraActive(false);
        setIsSimulated(true);
      }
    },
    [facingMode, stopCamera, refreshDevices]
  );

  // Loop de detecção visual sem quebras de frame
  useEffect(() => {
    let isRunning = true;
    let miniCanvas: HTMLCanvasElement | null = null;
    let miniCtx: CanvasRenderingContext2D | null = null;

    try {
      miniCanvas = document.createElement('canvas');
      miniCanvas.width = 64;
      miniCanvas.height = 48;
      miniCtx = miniCanvas.getContext('2d', { willReadFrequently: true });
    } catch (_) {}

    const detectLoop = () => {
      if (!isRunning) return;

      try {
        const video = videoRef.current;
        const displayCanvas = canvasRef.current;

        // Desenhar no displayCanvas de preview somente se o vídeo tiver dimensões reais
        if (
          video &&
          displayCanvas &&
          video.readyState >= 2 &&
          video.videoWidth > 0 &&
          video.videoHeight > 0
        ) {
          const displayCtx = displayCanvas.getContext('2d');
          if (displayCtx) {
            if (
              displayCanvas.width !== video.videoWidth ||
              displayCanvas.height !== video.videoHeight
            ) {
              displayCanvas.width = video.videoWidth;
              displayCanvas.height = video.videoHeight;
            }
            displayCtx.drawImage(video, 0, 0, displayCanvas.width, displayCanvas.height);
          }
        }

        // Se modo simulação touch estiver ativo, mantém o loop vivo sem processar pixels
        if (isSimulatedRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectLoop);
          return;
        }

        // Análise de movimento (Motion Diff) segura
        if (
          video &&
          video.readyState >= 2 &&
          video.videoWidth > 0 &&
          video.videoHeight > 0 &&
          miniCtx &&
          miniCanvas
        ) {
          miniCtx.drawImage(video, 0, 0, 64, 48);
          const currentData = miniCtx.getImageData(0, 0, 64, 48).data;

          if (previousFrameDataRef.current) {
            const prev = previousFrameDataRef.current;
            let diffSum = 0;
            const totalPixels = 64 * 48;

            for (let i = 0; i < currentData.length; i += 4) {
              const d =
                Math.abs(currentData[i] - prev[i]) +
                Math.abs(currentData[i + 1] - prev[i + 1]) +
                Math.abs(currentData[i + 2] - prev[i + 2]);
              if (d > 45) {
                diffSum++;
              }
            }

            const motionRatio = diffSum / totalPixels;

            if (motionRatio > 0.035) {
              lastSeenRef.current = Date.now();

              if (!isPersonPresentRef.current) {
                isPersonPresentRef.current = true;
                setDetection({
                  hasPerson: true,
                  score: Math.min(0.95, motionRatio * 5),
                  personCount: 1,
                });
                if (onPersonEnter) onPersonEnter();
              }
            } else {
              if (
                isPersonPresentRef.current &&
                Date.now() - lastSeenRef.current > inactivityTimeoutMs
              ) {
                isPersonPresentRef.current = false;
                setDetection({ hasPerson: false, score: 0, personCount: 0 });
                if (onPersonLeave) onPersonLeave();
              }
            }
          }

          previousFrameDataRef.current = new Uint8ClampedArray(currentData);
        }
      } catch (_) {
        // Silencia exceções para impedir que o React ou rAF travem
      }

      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };

    animationFrameRef.current = requestAnimationFrame(detectLoop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onPersonEnter, onPersonLeave, inactivityTimeoutMs]);

  // Inicializar câmera ao montar
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const toggleFacingMode = useCallback(() => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(undefined, nextMode);
  }, [facingMode, startCamera]);

  const selectDevice = useCallback(
    (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      startCamera(deviceId);
    },
    [startCamera]
  );

  const triggerSimulation = useCallback(() => {
    setIsSimulated(true);
    isPersonPresentRef.current = true;
    lastSeenRef.current = Date.now();
    setDetection({ hasPerson: true, score: 0.99, personCount: 1 });
    if (onPersonEnter) onPersonEnter();
  }, [onPersonEnter]);

  const disableSimulation = useCallback(() => {
    setIsSimulated(false);
    isPersonPresentRef.current = false;
    setDetection({ hasPerson: false, score: 0, personCount: 0 });
    if (onPersonLeave) onPersonLeave();
  }, [onPersonLeave]);

  const resetPresence = useCallback((delayMs = 0) => {
    if (delayMs > 0) {
      setTimeout(() => {
        isPersonPresentRef.current = false;
        setDetection({ hasPerson: false, score: 0, personCount: 0 });
      }, delayMs);
    } else {
      isPersonPresentRef.current = false;
      setDetection({ hasPerson: false, score: 0, personCount: 0 });
    }
  }, []);

  return {
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
    restartCamera: () => startCamera(selectedDeviceId),
  };
}
