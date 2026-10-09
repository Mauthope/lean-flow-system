/**
 * MagneticDock.tsx
 *
 * Attribution & Legal Compliance (Lei Federal 9.609/98 e 9.610/98 / MIT License):
 * - Original Concept & Implementation: Motiq (https://motiq.dev/components/magnetic-dock)
 * - Community Registry: 21st.dev
 * - License: MIT License (https://opensource.org/licenses/MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Lean Flow System Adaptations:
 * - Integrated into Next.js 14 App Router with React 18 and strict TypeScript.
 * - Tuned for Obsidian Navy Executive Design System (Tailwind + CSS variables).
 * - Multi-tenant sidebar vertical docking with spring physics and wall-mount support.
 * - Strict Zero Emojis compliance.
 */

'use client';

import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import './magnetic-dock.css';

const MOTIQ_TOKENS = `@layer motiq {
  :root {
    --motiq-accent: #0284c7;
    --motiq-accent-text: #0369a1;
    --motiq-bg: #f8fafc;
    --motiq-border: #cbd5e1;
    --motiq-border-strong: #94a3b8;
    --motiq-fg: #0f172a;
    --motiq-fg-secondary: #334155;
    --motiq-muted: #64748b;
    --motiq-secondary-accent: #0d9488;
    --motiq-success: #16a34a;
    --motiq-surface: #ffffff;
    --motiq-surface-2: #f1f5f9;
    --motiq-warning: #d97706;
  }
}
@layer motiq {
  .dark, [data-theme="dark"] {
    --motiq-accent: #06b6d4;
    --motiq-accent-text: #22d3ee;
    --motiq-bg: #020617;
    --motiq-border: #1e293b;
    --motiq-border-strong: #334155;
    --motiq-fg: #f8fafc;
    --motiq-fg-secondary: #cbd5e1;
    --motiq-muted: #94a3b8;
    --motiq-secondary-accent: #14b8a6;
    --motiq-success: #10b981;
    --motiq-surface: #0b1329;
    --motiq-surface-2: #0f172a;
    --motiq-warning: #f59e0b;
  }
}`;

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useVisibilityPause<T extends Element>(
  ref: React.RefObject<T | null>,
  { threshold = 0.1 }: { threshold?: number } = {}
): boolean {
  const [onScreen, setOnScreen] = React.useState(true);
  const [tabVisible, setTabVisible] = React.useState(true);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => setOnScreen(entries.some((e) => e.isIntersecting)),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  React.useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState !== 'hidden');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return onScreen && tabVisible;
}

export interface DockItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  tint?: [string, string];
  active?: boolean;
}

export interface MagneticDockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: DockItem[];
  orientation?: 'vertical' | 'horizontal';
  wallSide?: 'left' | 'right';
  magnetRadius?: number;
  maxScale?: number;
  lift?: number;
  stiffness?: number;
  damping?: number;
  idleWave?: boolean;
  tooltip?: boolean;
  onSelect?: (id: string) => void;
  seed?: number;
  pauseWhenHidden?: boolean;
  reducedMotion?: boolean;
}

interface Spring {
  x: number;
  v: number;
}

const mkSpring = (x = 0): Spring => ({ x, v: 0 });

function spring(s: Spring, target: number, k: number, c: number, dt: number): number {
  const n = dt > 0.012 ? Math.ceil(dt / 0.008) : 1;
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.v += (-k * (s.x - target) - c * s.v) * h;
    s.x += s.v * h;
  }
  return s.x;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACCENT = 'var(--motiq-accent, #06b6d4)';
const CYAN = 'var(--motiq-secondary-accent, #14b8a6)';
const FG = 'var(--motiq-fg, #f8fafc)';

const TINTS: ReadonlyArray<[string, string]> = [
  [ACCENT, CYAN],
  [CYAN, `color-mix(in oklab, ${CYAN} 40%, ${ACCENT})`],
  [`color-mix(in oklab, ${ACCENT} 70%, ${FG})`, ACCENT],
  ['var(--motiq-success, #10b981)', CYAN],
  [ACCENT, `color-mix(in oklab, ${ACCENT} 45%, ${CYAN})`],
  ['var(--motiq-warning, #f59e0b)', `color-mix(in oklab, var(--motiq-warning, #f59e0b) 45%, ${ACCENT})`],
  [`color-mix(in oklab, ${CYAN} 70%, ${FG})`, CYAN],
  [`color-mix(in oklab, ${ACCENT} 80%, ${CYAN})`, ACCENT],
];

const LIFT_K = 360;
const LIFT_C = 22;
const DRIFT = 0.13;
const DRIFT_K = 300;
const DRIFT_C = 20;
const TIP_K = 340;
const TIP_C = 26;
const ORTHO_REACH = 220;

interface Base {
  x: number;
  y: number;
}

interface PointerState {
  x: number;
  y: number;
  inside: boolean;
}

function MagneticDockBase({
  items,
  orientation = 'vertical',
  wallSide = 'left',
  magnetRadius = 110,
  maxScale = 1.55,
  lift = 22,
  stiffness = 420,
  damping = 26,
  idleWave = false,
  tooltip = true,
  onSelect,
  seed = 1,
  pauseWhenHidden = true,
  reducedMotion,
  className,
  style,
  ...props
}: MagneticDockProps) {
  const isVertical = orientation === 'vertical';
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const tipRef = React.useRef<HTMLDivElement | null>(null);
  const iconsRef = React.useRef<Array<HTMLButtonElement | null>>([]);
  const basesRef = React.useRef<Base[]>([]);
  const pointerRef = React.useRef<PointerState>({ x: -1e4, y: -1e4, inside: false });
  const focusRef = React.useRef(-1);

  const systemReduced = useReducedMotion();
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  const staticMode = reducedMotion === true || (hydrated && systemReduced);
  const onScreen = useVisibilityPause(rootRef, { threshold: 0.06 });
  const paused = pauseWhenHidden && !onScreen;
  const animate = !staticMode && !paused;

  const count = items.length;
  const labels = items.map((i) => i.label).join('\u0000');

  const params = React.useRef({
    magnetRadius,
    maxScale,
    lift,
    stiffness,
    damping,
    idleWave,
    tooltip,
    isVertical,
    wallSide,
  });
  params.current = {
    magnetRadius,
    maxScale,
    lift,
    stiffness,
    damping,
    idleWave,
    tooltip,
    isVertical,
    wallSide,
  };

  React.useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const measure = () => {
      const bx = bar.offsetLeft;
      const by = bar.offsetTop;
      basesRef.current = iconsRef.current.slice(0, count).map((el) =>
        el ? { x: bx + el.offsetLeft + el.offsetWidth / 2, y: by + el.offsetTop + el.offsetHeight / 2 } : { x: 0, y: 0 }
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(bar);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [count, labels, isVertical]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!animate) {
      iconsRef.current.forEach((el) => {
        if (el) {
          el.style.transform = '';
          el.style.setProperty('--dock-inf', '0');
        }
      });
      if (tipRef.current) tipRef.current.style.opacity = '0';
      return;
    }

    const states = Array.from({ length: count }, () => ({
      s: mkSpring(1),
      lift: mkSpring(0),
      drift: mkSpring(0),
    }));
    const tipPos = mkSpring(0);
    const tipO = mkSpring(0);
    const rng = makeRng(seed);
    let idleT = rng() * 20;
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (!(dt > 0) || dt > 0.05) dt = 0.016;
      idleT += dt;

      const cfg = params.current;
      const bases = basesRef.current;
      const p = pointerRef.current;
      const w = root.clientWidth;
      const h = root.clientHeight;
      const grow = Math.max(0, cfg.maxScale - 1);
      const sigma = Math.max(8, cfg.magnetRadius);

      let px: number;
      let py: number;
      let amp: number;
      const fi = focusRef.current;
      if (p.inside) {
        px = p.x;
        py = p.y;
        amp = 1;
      } else if (fi >= 0 && bases[fi]) {
        px = bases[fi].x;
        py = bases[fi].y;
        amp = 1;
      } else if (cfg.idleWave) {
        if (cfg.isVertical) {
          px = bases[0]?.x ?? 40;
          py = h / 2 + Math.sin(idleT * 0.55) * h * 0.34;
        } else {
          px = w / 2 + Math.sin(idleT * 0.55) * w * 0.34;
          py = bases[0]?.y ?? root.clientHeight - 70;
        }
        amp = 0.42;
      } else {
        px = -1e4;
        py = -1e4;
        amp = 0;
      }

      let bestI = -1;
      let bestInf = 0;
      const isUserInteracting = p.inside || fi >= 0;

      for (let i = 0; i < count; i++) {
        const b = bases[i];
        const el = iconsRef.current[i];
        const st = states[i];
        if (!b || !el || !st) continue;

        const d = cfg.isVertical ? py - b.y : px - b.x;
        const orthoDist = cfg.isVertical ? Math.abs(px - b.x) : Math.abs(py - b.y);
        const ortho = Math.max(0, 1 - orthoDist / ORTHO_REACH);
        const inf = Math.exp(-(d * d) / (2 * sigma * sigma)) * amp * ortho;

        if (inf > bestInf) {
          bestInf = inf;
          bestI = i;
        }

        // A cor so aparece com a proximidade do mouse / hover do usuario
        const colorInf = isUserInteracting ? inf : 0;
        el.style.setProperty('--dock-inf', Math.max(0, Math.min(1, colorInf * 1.35)).toFixed(3));

        spring(st.s, 1 + grow * inf, cfg.stiffness, cfg.damping, dt);

        if (cfg.isVertical) {
          const liftDirection = cfg.wallSide === 'right' ? -1 : 1;
          spring(st.lift, liftDirection * cfg.lift * inf, LIFT_K, LIFT_C, dt);
          spring(st.drift, d * DRIFT * inf, DRIFT_K, DRIFT_C, dt);
          el.style.transform = `translate3d(${st.lift.x.toFixed(2)}px,${st.drift.x.toFixed(2)}px,0) scale(${st.s.x.toFixed(3)})`;
        } else {
          spring(st.lift, -cfg.lift * inf, LIFT_K, LIFT_C, dt);
          spring(st.drift, d * DRIFT * inf, DRIFT_K, DRIFT_C, dt);
          el.style.transform = `translate3d(${st.drift.x.toFixed(2)}px,${st.lift.x.toFixed(2)}px,0) scale(${st.s.x.toFixed(3)})`;
        }
      }

      const tip = tipRef.current;
      if (!tip) return;
      const showTip = cfg.tooltip && (p.inside || fi >= 0) && bestInf > 0.55 && bestI >= 0;
      if (showTip) {
        const next = items[bestI]?.label ?? '';
        if (tip.textContent !== next) tip.textContent = next;
        spring(tipPos, cfg.isVertical ? bases[bestI].y : bases[bestI].x, TIP_K, TIP_C, dt);
      }
      spring(tipO, showTip ? 1 : 0, 220, 24, dt);
      const o = clamp(tipO.x, 0, 1);

      if (o > 0.01 && bestI >= 0 && bases[bestI]) {
        tip.style.opacity = o.toFixed(3);
        if (cfg.isVertical) {
          const liftVal = states[bestI].lift.x;
          const tipWidth = tip.offsetWidth || 80;
          const tx =
            cfg.wallSide === 'right'
              ? bases[bestI].x - tipWidth - 44 + liftVal * 0.4 - 10 * o
              : bases[bestI].x + 44 + liftVal * 0.4 + 10 * o;
          const ty = tipPos.x - (tip.offsetHeight || 28) / 2;
          tip.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0)`;
        } else {
          const ty = bases[bestI].y - 72 - states[bestI].lift.x * -0.4 - 18 * o;
          tip.style.transform = `translate3d(${(tipPos.x - tip.offsetWidth / 2).toFixed(1)}px,${ty.toFixed(1)}px,0)`;
        }
      } else {
        tip.style.opacity = '0';
      }
    };

    last = typeof performance !== 'undefined' ? performance.now() : 0;
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [animate, count, items, seed, isVertical]);

  const track = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    pointerRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true };
  }, []);

  const release = React.useCallback(() => {
    pointerRef.current = { x: -1e4, y: -1e4, inside: false };
    iconsRef.current.forEach((el) => {
      if (el) el.style.setProperty('--dock-inf', '0');
    });
  }, []);

  return (
    <div
      ref={rootRef}
      data-motion={staticMode ? 'static' : 'animated'}
      data-paused={paused ? 'true' : 'false'}
      data-orientation={orientation}
      className={cn(
        'magnetic-dock-root',
        isVertical ? 'vertical' : 'horizontal',
        className
      )}
      style={{ touchAction: isVertical ? 'pan-x' : 'pan-y', ...style }}
      onPointerMove={track}
      onPointerDown={track}
      onPointerLeave={release}
      onPointerCancel={release}
      {...props}
    >
      <div className={cn('magnetic-dock-wrap', isVertical ? 'vertical' : 'horizontal')}>
        <div
          ref={barRef}
          className={cn('magnetic-dock-bar', isVertical ? 'vertical' : 'horizontal')}
        >
          {items.map((item, i) => {
            const [a, b] = item.tint ?? TINTS[i % TINTS.length];
            const isActive = item.active;
            return (
              <button
                key={item.id}
                type="button"
                ref={(el) => {
                  iconsRef.current[i] = el;
                }}
                data-dock-item={item.id}
                aria-label={item.label}
                onClick={() => onSelect?.(item.id)}
                onFocus={() => {
                  focusRef.current = i;
                }}
                onBlur={() => {
                  if (focusRef.current === i) focusRef.current = -1;
                }}
                className={cn('magnetic-dock-button', isActive && 'is-active')}
                style={{
                  willChange: 'transform',
                }}
              >
                <span
                  className="dock-color-layer"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${a}, ${b})`,
                    boxShadow: `0 8px 24px -4px ${a}aa, inset 0 1px 1px rgba(255, 255, 255, 0.45)`,
                  }}
                />
                <span className="dock-icon-layer">
                  {item.icon ?? <span aria-hidden="true">{item.label.slice(0, 1).toUpperCase()}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tooltip && !staticMode ? (
        <div
          ref={tipRef}
          aria-hidden="true"
          className="magnetic-dock-tooltip"
          style={{
            transform: 'translate3d(-999px,-999px,0)',
            willChange: 'transform, opacity',
          }}
        />
      ) : null}
    </div>
  );
}

export function MagneticDock(props: MagneticDockProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MOTIQ_TOKENS }} />
      <MagneticDockBase {...props} />
    </>
  );
}

export default MagneticDock;
