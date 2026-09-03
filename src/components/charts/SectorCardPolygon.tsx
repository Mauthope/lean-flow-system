'use client';

import React from 'react';
import { SectorLeanAssessment } from '@/lib/types';

interface SectorCardPolygonProps {
  assessment?: SectorLeanAssessment | null;
  sectorColor?: string;
  width?: number;
  height?: number;
}

interface DimensionConfig {
  id: string;
  shortLabel: string;
  label: string;
}

const DIMENSIONS: DimensionConfig[] = [
  { id: 'estabilidade_5s', shortLabel: '5S', label: '5S & Visual' },
  { id: 'trabalho_padronizado', shortLabel: 'POPs', label: 'Trab. Padronizado' },
  { id: 'fluxo_jit', shortLabel: 'JIT', label: 'Fluxo & Kanban' },
  { id: 'qualidade_poka_yoke', shortLabel: 'Qual', label: 'Qualidade' },
  { id: 'tpm_oee', shortLabel: 'TPM', label: 'TPM & OEE' },
  { id: 'cultura_kaizen', shortLabel: 'Kaizen', label: 'Cultura Kaizen' },
];

export const SectorCardPolygon: React.FC<SectorCardPolygonProps> = ({
  assessment,
  sectorColor = '#10b981',
  width = 250,
  height = 195,
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 34; // espaço para rótulos externos
  const count = DIMENSIONS.length;
  const angleStep = (Math.PI * 2) / count;
  const startAngle = -Math.PI / 2; // Começa no topo (12h)

  // Níveis concêntricos (20%, 40%, 60%, 80%, 100%)
  const levels = [20, 40, 60, 80, 100];

  const getCoordinates = (value: number, index: number, maxVal = 100) => {
    const angle = startAngle + index * angleStep;
    const clampedVal = Math.max(10, Math.min(maxVal, value));
    const distance = (clampedVal / maxVal) * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = startAngle + index * angleStep;
    const labelDistance = radius + 18;
    const x = centerX + labelDistance * Math.cos(angle);
    const y = centerY + labelDistance * Math.sin(angle);
    return { x, y };
  };

  // Coordenadas dos anéis concêntricos
  const getLevelPolygonPath = (percent: number) => {
    return (
      DIMENSIONS.map((_, i) => {
        const { x, y } = getCoordinates(percent, i);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ') + ' Z'
    );
  };

  // Valores reais ou linha de base padrão (60%)
  const values = DIMENSIONS.map((dim) => {
    if (!assessment || !assessment.dimensions) return 50;
    return (assessment.dimensions as Record<string, number>)[dim.id] || 0;
  });

  const polygonPath =
    DIMENSIONS.map((_, i) => {
      const { x, y } = getCoordinates(values[i], i);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ') + ' Z';

  const hasData = Boolean(assessment && assessment.dimensions);
  const color = sectorColor || '#10b981';
  const gradId = `polyGrad-${assessment?.id || Math.random().toString(36).substring(7)}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="70%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.08" />
          </radialGradient>
        </defs>

        {/* Anéis de Fundo Concêntricos */}
        {levels.map((lvl) => (
          <path
            key={`ring-${lvl}`}
            d={getLevelPolygonPath(lvl)}
            fill={lvl === 100 ? 'rgba(15, 23, 42, 0.45)' : 'none'}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={lvl === 100 ? 1.2 : 0.7}
            strokeDasharray={lvl === 60 ? '3 3' : 'none'}
          />
        ))}

        {/* Eixos Radiais (6 Raios) */}
        {DIMENSIONS.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={`axis-${i}`}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Polígono de Maturidade do Setor */}
        {hasData ? (
          <>
            <path
              d={polygonPath}
              fill={`url(#${gradId})`}
              stroke={color}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Vértices com Pontos */}
            {values.map((val, i) => {
              const { x, y } = getCoordinates(val, i);
              return (
                <circle
                  key={`vertex-${i}`}
                  cx={x}
                  cy={y}
                  r={3.2}
                  fill="#090d16"
                  stroke={color}
                  strokeWidth="1.8"
                />
              );
            })}
          </>
        ) : (
          <path
            d={polygonPath}
            fill="rgba(255, 255, 255, 0.03)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
        )}

        {/* Rótulos Externos das 6 Dimensões */}
        {DIMENSIONS.map((dim, i) => {
          const { x, y } = getLabelCoordinates(i);
          const score = hasData ? values[i] : null;

          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (x > centerX + 12) textAnchor = 'start';
          if (x < centerX - 12) textAnchor = 'end';

          return (
            <text
              key={`label-${dim.id}`}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="central"
              style={{
                fontSize: '9px',
                fontWeight: 700,
                fill: hasData ? '#cbd5e1' : '#64748b',
                fontFamily: 'var(--font-heading, sans-serif)',
              }}
            >
              {dim.shortLabel}
              {score !== null && (
                <tspan
                  dx="2"
                  style={{
                    fontSize: '8.5px',
                    fontWeight: 800,
                    fill: score >= 70 ? '#34d399' : score >= 45 ? '#fbbf24' : '#f87171',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {score}%
                </tspan>
              )}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
