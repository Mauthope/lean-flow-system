'use client';

import React from 'react';
import { Award, Check, Sparkles } from 'lucide-react';

export interface TpmPhaseSealProps {
  phase: number; // 1, 2, 3 ou 4
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

/**
 * Selo de Fase TPM — Círculo dividido em 4 quadrantes.
 * Ao atingir 100% em uma auditoria, a máquina avança de fase.
 *
 * Quadrante 1 (Topo-Direita): Fase 1
 * Quadrante 2 (Baixo-Direita): Fase 2
 * Quadrante 3 (Baixo-Esquerda): Fase 3
 * Quadrante 4 (Topo-Esquerda): Fase 4 (Selo Ouro Completo)
 */
export function TpmPhaseSeal({
  phase = 1,
  size = 'md',
  showLabel = true,
  interactive = false,
  onClick,
}: TpmPhaseSealProps) {
  const currentPhase = Math.min(4, Math.max(1, Number(phase) || 1));

  // Dimensões conforme tamanho
  const sizeMap = {
    sm: { px: 44, stroke: 2, centerR: 16, fontSize: '0.65rem' },
    md: { px: 68, stroke: 3, centerR: 20, fontSize: '0.8125rem' },
    lg: { px: 96, stroke: 3.5, centerR: 28, fontSize: '1.05rem' },
    xl: { px: 130, stroke: 4, centerR: 38, fontSize: '1.35rem' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Definição das cores por quadrante quando ativo vs inativo
  // Se fase == 4 (selo completo), todos os quadrantes brilham em dourado/âmbar!
  const isMasterPhase = currentPhase >= 4;

  const getQuadrantColor = (quadrantNumber: number) => {
    const isUnlocked = currentPhase >= quadrantNumber;

    if (!isUnlocked) {
      return {
        fill: 'rgba(255, 255, 255, 0.05)',
        stroke: 'rgba(255, 255, 255, 0.12)',
        glow: 'none',
      };
    }

    if (isMasterPhase) {
      return {
        fill: '#f59e0b',
        stroke: '#fef08a',
        glow: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))',
      };
    }

    // Cores progressivas por fase
    switch (quadrantNumber) {
      case 1:
        return {
          fill: '#06b6d4', // Ciano
          stroke: '#67e8f9',
          glow: 'drop-shadow(0 0 5px rgba(6, 182, 212, 0.4))',
        };
      case 2:
        return {
          fill: '#10b981', // Esmeralda
          stroke: '#6ee7b7',
          glow: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.4))',
        };
      case 3:
        return {
          fill: '#8b5cf6', // Roxo Neon
          stroke: '#c4b5fd',
          glow: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.4))',
        };
      case 4:
        return {
          fill: '#f59e0b', // Dourado
          stroke: '#fde047',
          glow: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))',
        };
      default:
        return { fill: '#22d3ee', stroke: '#a5f3fc', glow: 'none' };
    }
  };

  const q1 = getQuadrantColor(1);
  const q2 = getQuadrantColor(2);
  const q3 = getQuadrantColor(3);
  const q4 = getQuadrantColor(4);

  const phaseNames: Record<number, string> = {
    1: 'Fase 1: Limpeza & Restauração',
    2: 'Fase 2: Eliminação de Fontes & Acessos',
    3: 'Fase 3: Padrões de Manutenção',
    4: 'Fase 4: Excelência & Autonomia Plena',
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      title={`Selo de Fase TPM: ${phaseNames[currentPhase]} (Fase ${currentPhase} de 4). Atinja nota 100% na auditoria para avançar de fase!`}
    >
      <div style={{ position: 'relative', width: currentSize.px, height: currentSize.px }}>
        <svg
          viewBox="0 0 100 100"
          width={currentSize.px}
          height={currentSize.px}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gradiente Dourado para Selo Completo (Fase 4) */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <filter id="sealGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Anel Externo de Acabamento */}
          <circle
            cx="50"
            cy="50"
            r="47.5"
            fill="none"
            stroke={isMasterPhase ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)'}
            strokeWidth="1.5"
            strokeDasharray={isMasterPhase ? 'none' : '3 2'}
          />

          {/* QUADRANTE 1: Topo-Direita (0h às 3h / Fase 1) */}
          <path
            d="M 50 50 L 50 6 A 44 44 0 0 1 94 50 Z"
            fill={isMasterPhase ? 'url(#goldGradient)' : q1.fill}
            stroke={q1.stroke}
            strokeWidth="0.8"
            style={{
              transition: 'all 0.3s ease',
              filter: currentPhase >= 1 ? q1.glow : 'none',
            }}
          />

          {/* QUADRANTE 2: Baixo-Direita (3h às 6h / Fase 2) */}
          <path
            d="M 50 50 L 94 50 A 44 44 0 0 1 50 94 Z"
            fill={isMasterPhase ? 'url(#goldGradient)' : q2.fill}
            stroke={q2.stroke}
            strokeWidth="0.8"
            style={{
              transition: 'all 0.3s ease',
              filter: currentPhase >= 2 ? q2.glow : 'none',
            }}
          />

          {/* QUADRANTE 3: Baixo-Esquerda (6h às 9h / Fase 3) */}
          <path
            d="M 50 50 L 50 94 A 44 44 0 0 1 6 50 Z"
            fill={isMasterPhase ? 'url(#goldGradient)' : q3.fill}
            stroke={q3.stroke}
            strokeWidth="0.8"
            style={{
              transition: 'all 0.3s ease',
              filter: currentPhase >= 3 ? q3.glow : 'none',
            }}
          />

          {/* QUADRANTE 4: Topo-Esquerda (9h às 12h / Fase 4) */}
          <path
            d="M 50 50 L 6 50 A 44 44 0 0 1 50 6 Z"
            fill={isMasterPhase ? 'url(#goldGradient)' : q4.fill}
            stroke={q4.stroke}
            strokeWidth="0.8"
            style={{
              transition: 'all 0.3s ease',
              filter: currentPhase >= 4 ? q4.glow : 'none',
            }}
          />

          {/* Linhas de Separação em Cruz (Efeito 4 Partes Industriais) */}
          <line
            x1="50"
            y1="5"
            x2="50"
            y2="95"
            stroke="#090e1a"
            strokeWidth={currentSize.stroke}
            strokeLinecap="round"
          />
          <line
            x1="5"
            y1="50"
            x2="95"
            y2="50"
            stroke="#090e1a"
            strokeWidth={currentSize.stroke}
            strokeLinecap="round"
          />

          {/* Núcleo Central do Selo */}
          <circle
            cx="50"
            cy="50"
            r={currentSize.centerR}
            fill="#090e1a"
            stroke={isMasterPhase ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'}
            strokeWidth="1.5"
          />

          {/* Texto / Ícone no Centro do Selo */}
          {isMasterPhase ? (
            <text
              x="50"
              y="55"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="20"
              fontWeight="900"
              style={{ userSelect: 'none' }}
            >
              ★
            </text>
          ) : (
            <text
              x="50"
              y="54"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="16"
              fontWeight="900"
              fontFamily="var(--font-mono), monospace"
              style={{ userSelect: 'none' }}
            >
              F{currentPhase}
            </text>
          )}
        </svg>

        {/* Badge Especial quando atinge Selo Ouro (Fase 4) */}
        {isMasterPhase && (
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.8)',
              border: '1.5px solid #090e1a',
            }}
          >
            <Sparkles size={10} color="#000000" />
          </div>
        )}
      </div>

      {/* Label Textual */}
      {showLabel && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.725rem',
              fontWeight: 800,
              color: isMasterPhase ? '#fbbf24' : '#22d3ee',
              backgroundColor: isMasterPhase ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.12)',
              border: isMasterPhase ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(6, 182, 212, 0.25)',
              padding: '0.1rem 0.45rem',
              borderRadius: '9999px',
            }}
          >
            {isMasterPhase ? '🏆 Selo Ouro TPM' : `Fase ${currentPhase} / 4`}
          </div>
        </div>
      )}
    </div>
  );
}
export default TpmPhaseSeal;
