'use client';

import React, { useState } from 'react';
import { LeanAssessmentDimensionId } from '@/lib/types';

export interface RadarDataPoint {
  dimensionId: LeanAssessmentDimensionId;
  label: string;
  shortLabel: string;
  currentValue: number; // 0 a 100
  previousValue?: number; // 0 a 100
  targetValue?: number; // 0 a 100
}

interface LeanRadarChartProps {
  data: RadarDataPoint[];
  currentTitle?: string;
  previousTitle?: string;
  targetTitle?: string;
  size?: number; // default 480
  showLegend?: boolean;
}

export const LeanRadarChart: React.FC<LeanRadarChartProps> = ({
  data,
  currentTitle = 'Avaliação Vigente',
  previousTitle = 'Linha de Base / Anterior',
  size = 480,
  showLegend = true,
}) => {
  const [showCurrent, setShowCurrent] = useState(true);
  const [showPrevious, setShowPrevious] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: RadarDataPoint;
    x: number;
    y: number;
  } | null>(null);

  if (!data || data.length < 3) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
        }}
      >
        Dados insuficientes para renderizar o gráfico de radar (mínimo 3 dimensões).
      </div>
    );
  }

  // Geometria do Radar
  const center = size / 2;
  const radius = (size / 2) * 0.70; // margem para rótulos externos
  const count = data.length;
  const angleStep = (Math.PI * 2) / count;
  // Começar no topo (12 horas)
  const startAngle = -Math.PI / 2;

  // Níveis concêntricos (20%, 40%, 60%, 80%, 100%)
  const levels = [20, 40, 60, 80, 100];

  const getCoordinates = (value: number, index: number, maxVal = 100) => {
    const angle = startAngle + index * angleStep;
    const clampedVal = Math.max(0, Math.min(maxVal, value));
    const distance = (clampedVal / maxVal) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  const getLevelPolygonPath = (percent: number) => {
    return (
      data
        .map((_, i) => {
          const { x, y } = getCoordinates(percent, i);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ') + ' Z'
    );
  };

  const currentPath =
    data
      .map((d, i) => {
        const { x, y } = getCoordinates(d.currentValue, i);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ') + ' Z';

  const hasPrevious = data.some((d) => d.previousValue !== undefined);
  const previousPath = hasPrevious
    ? data
        .map((d, i) => {
          const val = d.previousValue ?? d.currentValue;
          const { x, y } = getCoordinates(val, i);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ') + ' Z'
    : '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        maxWidth: `${size + 40}px`,
        margin: '0 auto',
      }}
    >
      {/* Controles de Camadas & Legenda */}
      {showLegend && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            marginBottom: '0.75rem',
            padding: '0.4rem 1rem',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            fontSize: '0.75rem',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Camada Atual */}
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: showCurrent ? '#34d399' : '#64748b',
              fontWeight: showCurrent ? 800 : 500,
              transition: 'all 0.2s',
              padding: '0.2rem 0.4rem',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: showCurrent ? '#10b981' : '#334155',
                border: '1.5px solid #34d399',
                display: 'inline-block',
                boxShadow: showCurrent ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
              }}
            />
            <span>{currentTitle}</span>
          </button>

          {/* Camada Anterior */}
          {hasPrevious && (
            <button
              type="button"
              onClick={() => setShowPrevious(!showPrevious)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: showPrevious ? '#c084fc' : '#64748b',
                fontWeight: showPrevious ? 800 : 500,
                transition: 'all 0.2s',
                padding: '0.2rem 0.4rem',
              }}
            >
              <span
                style={{
                  width: '14px',
                  height: '0px',
                  borderTop: '2px dashed #c084fc',
                  display: 'inline-block',
                }}
              />
              <span>{previousTitle}</span>
            </button>
          )}
        </div>
      )}

      {/* SVG Canvas Principal */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{
          width: '100%',
          height: 'auto',
          overflow: 'visible',
          filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4))',
        }}
      >
        <defs>
          {/* Gradiente Neon para Camada Vigente */}
          <linearGradient id="radarCurrentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.12" />
          </linearGradient>

          {/* Gradiente para Camada Anterior */}
          <linearGradient id="radarPreviousGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.04" />
          </linearGradient>

          {/* Filtro de Glow Neon */}
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Anéis Concêntricos de Níveis (Polígonos regulares) */}
        {levels.map((lvl, idx) => {
          const isOuter = idx === levels.length - 1;
          return (
            <g key={lvl}>
              <path
                d={getLevelPolygonPath(lvl)}
                fill={idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.007)'}
                stroke={isOuter ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)'}
                strokeWidth={isOuter ? 1.5 : 1}
                strokeDasharray={isOuter ? 'none' : '3 3'}
              />
              {/* Rótulo numérico no eixo vertical */}
              <text
                x={center}
                y={center - (lvl / 100) * radius - 4}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(148, 163, 184, 0.7)"
                fontFamily="var(--font-mono)"
                fontWeight="700"
              >
                {lvl}%
              </text>
            </g>
          );
        })}

        {/* 2. Eixos Radiais */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* 3. Camada Anterior (Linha tracejada violeta) */}
        {hasPrevious && showPrevious && (
          <g>
            <path
              d={previousPath}
              fill="url(#radarPreviousGradient)"
              stroke="#c084fc"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            {data.map((d, i) => {
              if (d.previousValue === undefined) return null;
              const { x, y } = getCoordinates(d.previousValue, i);
              return (
                <circle
                  key={`prev-pt-${i}`}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#c084fc"
                  stroke="#1e1b4b"
                  strokeWidth="1.5"
                />
              );
            })}
          </g>
        )}

        {/* 4. Camada Vigente / Atual (Polígono Neon Esmeralda) */}
        {showCurrent && (
          <g>
            <path
              d={currentPath}
              fill="url(#radarCurrentGradient)"
              stroke="#10b981"
              strokeWidth="3"
              filter="url(#radarGlow)"
            />
            {data.map((d, i) => {
              const { x, y } = getCoordinates(d.currentValue, i);
              const isHovered = hoveredPoint?.point.dimensionId === d.dimensionId;

              return (
                <g key={`curr-pt-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7 : 5}
                    fill={isHovered ? '#6ee7b7' : '#10b981'}
                    stroke="#022c22"
                    strokeWidth="2"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))',
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredPoint({ point: d, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {isHovered && (
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fill="#34d399"
                      fontSize="11"
                      fontWeight="900"
                      fontFamily="var(--font-mono)"
                    >
                      {d.currentValue}%
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Rótulos das Dimensões nas Extremidades Externas */}
        {data.map((d, i) => {
          const angle = startAngle + i * angleStep;
          const labelDist = radius + 26;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (Math.cos(angle) > 0.25) textAnchor = 'start';
          if (Math.cos(angle) < -0.25) textAnchor = 'end';

          const isHovered = hoveredPoint?.point.dimensionId === d.dimensionId;
          const delta = d.previousValue !== undefined ? d.currentValue - d.previousValue : 0;

          return (
            <g
              key={`label-${i}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredPoint({ point: d, x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <text
                x={lx}
                y={ly - 4}
                textAnchor={textAnchor}
                fill={isHovered ? '#22d3ee' : '#ffffff'}
                fontSize="11"
                fontWeight="800"
                fontFamily="var(--font-heading)"
              >
                {d.shortLabel || d.label}
              </text>

              <text
                x={lx}
                y={ly + 10}
                textAnchor={textAnchor}
                fill={isHovered ? '#34d399' : '#94a3b8'}
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                {d.currentValue}%
                {d.previousValue !== undefined && (
                  <tspan
                    fill={delta > 0 ? '#34d399' : delta < 0 ? '#f87171' : '#94a3b8'}
                    fontWeight="800"
                  >
                    {' '}
                    ({delta > 0 ? `+${delta}%` : `${delta}%`})
                  </tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip Dinâmico ao passar o mouse em um vértice */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#090d16',
            border: '1.5px solid #22d3ee',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 14px rgba(34, 211, 238, 0.25)',
            borderRadius: '12px',
            padding: '0.65rem 1rem',
            zIndex: 30,
            pointerEvents: 'none',
            minWidth: '220px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.3rem' }}>
            {hoveredPoint.point.label}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.75rem' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Atual: </span>
              <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {hoveredPoint.point.currentValue}%
              </strong>
            </div>

            {hoveredPoint.point.previousValue !== undefined && (
              <div>
                <span style={{ color: '#94a3b8' }}>Anterior: </span>
                <strong style={{ color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                  {hoveredPoint.point.previousValue}%
                </strong>
              </div>
            )}

            {hoveredPoint.point.previousValue !== undefined && (
              <div>
                <span style={{ color: '#94a3b8' }}>Delta: </span>
                <strong
                  style={{
                    color:
                      hoveredPoint.point.currentValue - hoveredPoint.point.previousValue >= 0
                        ? '#34d399'
                        : '#f87171',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {hoveredPoint.point.currentValue - hoveredPoint.point.previousValue >= 0 ? '+' : ''}
                  {hoveredPoint.point.currentValue - hoveredPoint.point.previousValue}%
                </strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
