'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Focus,
  Move,
  Network,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';
import { TreeDashboardData } from '@/lib/treeService';
import { LeanAction } from '@/lib/types';
import { HoshinNode } from './HoshinNode';
import { EntityNode } from './EntityNode';
import { AgentNode } from './AgentNode';
import { SectorNode } from './SectorNode';
import { SavingsTypeNode } from './SavingsTypeNode';

interface TreeCanvasProps {
  treeData: TreeDashboardData;
  visibleAgents: TreeDashboardData['hoshinKanri']['entity']['agents'];
  isAgentExpanded: (agentId: string) => boolean;
  toggleAgent: (agentId: string) => void;
  isSectorExpanded: (compositeKey: string) => boolean;
  toggleSector: (compositeKey: string) => void;
  onOpenProjects: (
    title: string,
    subtitle: string,
    value: number,
    projects: LeanAction[]
  ) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
}

export function TreeCanvas({
  treeData,
  visibleAgents,
  isAgentExpanded,
  toggleAgent,
  isSectorExpanded,
  toggleSector,
  onOpenProjects,
  onExpandAll,
  onCollapseAll,
}: TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Estados de Pan e Zoom
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Centralizar automaticamente e ajustar o zoom na carga inicial
  const fitToView = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const content = contentRef.current.getBoundingClientRect();

    // Se o conteúdo ainda não foi montado
    if (content.width === 0 || content.height === 0) return;

    // Calcula largura real do conteúdo não escalonado
    const unscaledWidth = content.width / zoom;
    const unscaledHeight = content.height / zoom;

    const scaleX = (container.width - 80) / unscaledWidth;
    const scaleY = (container.height - 120) / unscaledHeight;
    const optimalScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.45), 1.05);

    setZoom(optimalScale);
    setPan({
      x: (container.width - unscaledWidth * optimalScale) / 2,
      y: 40,
    });
  }, [zoom]);

  // Escuta alteração do modo tela cheia do navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Ajusta automaticamente a visão após 250ms na montagem
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToView();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Alternar Tela Cheia (Fullscreen)
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed, falling back to CSS full view:', err);
      setIsFullscreen((prev) => !prev);
    }
  };

  // Controles de Zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.15, 1.8));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.15, 0.35));
  };

  const handleResetZoom = () => {
    setZoom(1);
    if (containerRef.current && contentRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const content = contentRef.current.getBoundingClientRect();
      const unscaledWidth = content.width / zoom;
      setPan({
        x: (container.width - unscaledWidth) / 2,
        y: 40,
      });
    }
  };

  // Zoom via Scroll da Roda do Mouse (Wheel)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.35), 1.8);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centrado na posição do mouse
    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Iniciar Arraste (Pan)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Permite interação com botões, links e inputs sem iniciar pan
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }

    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Movimentar Arraste (Pan)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // Finalizar Arraste (Pan)
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '760px',
        zIndex: isFullscreen ? 9999 : 1,
        backgroundColor: '#070d19',
        borderRadius: isFullscreen ? '0px' : '16px',
        overflow: 'hidden',
        border: isFullscreen
          ? 'none'
          : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        boxShadow: isFullscreen
          ? 'none'
          : '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(6, 182, 212, 0.03)',
        cursor: isPanning ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {/* Grid de Fundo Dinâmico (Canvas VSM Blueprint Dot Grid) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(6, 182, 212, 0.22) 1.2px, transparent 1.2px)',
          backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Iluminação Volumétrica Ambiental de Fundo */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* HUD SUPERIOR ESQUERDO: Identificação do Canvas VSM */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 0.85rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
            color: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Network size={15} />
        </div>
        <div>
          <span
            style={{
              fontSize: '0.78125rem',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            Canvas VSM • Árvore de Desdobramento
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted, #94a3b8)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {treeData.hoshinKanri.entity.name} • {visibleAgents.length} Agente(s) Ativo(s)
          </span>
        </div>
      </div>

      {/* HUD SUPERIOR DIREITO: Barra de Ferramentas Flutuante (Zoom, Fit e Fullscreen) */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Expandir / Recolher Todos */}
        {onExpandAll && (
          <button
            type="button"
            onClick={onExpandAll}
            title="Expandir todos os ramos da árvore"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.15)';
              e.currentTarget.style.color = '#22d3ee';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <ChevronsDown size={14} />
            <span>Expandir</span>
          </button>
        )}

        {onCollapseAll && (
          <button
            type="button"
            onClick={onCollapseAll}
            title="Recolher todos os ramos da árvore"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.15)';
              e.currentTarget.style.color = '#22d3ee';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <ChevronsUp size={14} />
            <span>Recolher</span>
          </button>
        )}

        <div
          style={{
            height: '22px',
            width: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            margin: '0 0.2rem',
          }}
        />

        {/* Zoom Out (-) */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Diminuir Zoom (-)"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#22d3ee')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#cbd5e1')}
        >
          <ZoomOut size={15} />
        </button>

        {/* Indicador de Zoom % (Clique para 100%) */}
        <button
          type="button"
          onClick={handleResetZoom}
          title="Resetar Zoom para 100%"
          style={{
            minWidth: '52px',
            height: '32px',
            padding: '0 0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#22d3ee',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom In (+) */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Aumentar Zoom (+)"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#22d3ee')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#cbd5e1')}
        >
          <ZoomIn size={15} />
        </button>

        {/* Ajustar à Tela (Fit View) */}
        <button
          type="button"
          onClick={fitToView}
          title="Ajustar Árvore à Tela (Fit to View)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0 0.65rem',
            height: '32px',
            backgroundColor: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '8px',
            color: '#22d3ee',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.12)';
          }}
        >
          <Focus size={14} />
          <span>Enquadrar</span>
        </button>

        <div
          style={{
            height: '22px',
            width: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            margin: '0 0.2rem',
          }}
        />

        {/* Botão Tela Cheia (Fullscreen) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Sair da Tela Cheia (ESC)' : 'Expandir para Tela Cheia'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0 0.75rem',
            height: '32px',
            backgroundColor: isFullscreen ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${isFullscreen ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            borderRadius: '8px',
            color: isFullscreen ? '#f87171' : '#34d399',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}</span>
        </button>
      </div>

      {/* HUD INFERIOR ESQUERDO: Instruções de Navegação */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.71875rem',
          color: 'var(--text-muted, #94a3b8)',
          pointerEvents: 'none',
        }}
      >
        <Move size={12} color="#06b6d4" />
        <span>Arraste para mover • Scroll para zoom • Clique no card para detalhar</span>
      </div>

      {/* ÁREA TRANSFORMÁVEL DO CANVAS (Árvore de Nós Escalável com Pan/Zoom) */}
      <div
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isPanning ? 'none' : 'transform 0.08s ease-out',
          position: 'absolute',
          top: 0,
          left: 0,
          willChange: 'transform',
          zIndex: 1,
        }}
      >
        <div
          ref={contentRef}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem 4rem 8rem',
            minWidth: '1200px',
          }}
        >
          {/* NÍVEL 1: Hoshin Kanri */}
          <HoshinNode node={treeData.hoshinKanri} />

          {/* Linha vertical conectora Nível 1 -> Nível 2 */}
          <div
            style={{
              width: '3px',
              height: '36px',
              backgroundColor: '#06b6d4',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.7)',
            }}
          />

          {/* NÍVEL 2: Entidade Industrial */}
          <EntityNode entity={treeData.hoshinKanri.entity} />

          {/* Linha vertical conectora Nível 2 -> Barra de Agentes */}
          <div
            style={{
              width: '3px',
              height: '40px',
              backgroundColor: '#10b981',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.7)',
            }}
          />

          {/* Trilho Horizontal e Ramos de Agentes (NÍVEIS 3, 4 e 5) */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'relative',
              paddingTop: '14px',
            }}
          >
            {/* Linha horizontal superior unindo os agentes */}
            {visibleAgents.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '8%',
                  right: '8%',
                  height: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)',
                }}
              />
            )}

            {/* Grid Horizontal de Agentes */}
            <div
              style={{
                display: 'flex',
                gap: '2.5rem',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexWrap: 'nowrap',
              }}
            >
              {visibleAgents.map((agent) => {
                const agentExpanded = isAgentExpanded(agent.agentId);

                return (
                  <div
                    key={agent.agentId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '340px',
                      maxWidth: '440px',
                      position: 'relative',
                    }}
                  >
                    {/* Conector Vertical do Trilho ao Card do Agente */}
                    <div
                      style={{
                        width: '2px',
                        height: '18px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      }}
                    />

                    {/* Card do Agente (Nível 3) */}
                    <AgentNode
                      agent={agent}
                      isExpanded={agentExpanded}
                      onToggle={() => toggleAgent(agent.agentId)}
                      onOpenProjects={onOpenProjects}
                    />

                    {/* Setores e Tipos (Níveis 4 & 5) */}
                    {agentExpanded && agent.sectors.length > 0 && (
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginTop: '12px',
                        }}
                      >
                        {/* Linha vertical descendo do Agente para os Setores */}
                        <div
                          style={{
                            width: '2px',
                            height: '20px',
                            backgroundColor: 'rgba(139, 92, 246, 0.6)',
                            boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)',
                          }}
                        />

                        {/* Lista Vertical de Setores */}
                        <div
                          style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                          }}
                        >
                          {agent.sectors.map((sector) => {
                            const sectorKey = `${agent.agentId}__${sector.sectorId}`;
                            const sectorExpanded = isSectorExpanded(sectorKey);

                            return (
                              <SectorNode
                                key={sectorKey}
                                sector={sector}
                                agentName={agent.agentName}
                                isExpanded={sectorExpanded}
                                onToggle={() => toggleSector(sectorKey)}
                                onOpenProjects={onOpenProjects}
                              >
                                {sector.savingsTypes.map((type) => (
                                  <SavingsTypeNode
                                    key={type.key}
                                    type={type}
                                    sectorName={sector.sectorName}
                                    agentName={agent.agentName}
                                    onOpenProjects={onOpenProjects}
                                  />
                                ))}
                              </SectorNode>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
