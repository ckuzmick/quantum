'use client'

import React, { useEffect, useRef, useState } from 'react';

interface Params {
  energy: number;    // E — particle energy (ℏ = 1)
  potential: number; // V₀ — step height
  mass: number;      // m — particle mass
  speed: number;     // animation speed multiplier
  showPsi: boolean;  // draw Re(ψ)
  showProb: boolean; // draw |ψ|²
}

const SEGMENT_COUNT = 600;
const X_MIN = -10;
const X_MAX = 10;

// Visual scaling constants for the canvas plot
const WAVEFUNCTION_AMPLITUDE_SCALE = 2.2; // maps peak |ψ| ~ 2 to canvas amplitude units
const PSI_PLOT_HEIGHT_FRACTION = 0.38;    // fraction of half-plot-height used by Re(ψ)
const PROB_PLOT_HEIGHT_FRACTION = 0.32;   // fraction of half-plot-height used by |ψ|²
const PROB_AMPLITUDE_ADJUSTMENT = 1.5;    // keeps |ψ|² within the plot area

/** Compute Re(ψ) and |ψ|² for one point x at time t. */
function psiAt(
  x: number,
  t: number,
  k1: number,
  omega: number,
  isAbove: boolean,
  k2: number,
  kappa: number,
  Rr: number,
  Ri: number,
  Tr: number,
  Ti: number,
): { re: number; prob: number } {
  let pR = 0, pI = 0;

  if (x <= 0) {
    const phiInc = k1 * x - omega * t;
    const phiRef = -k1 * x - omega * t;
    pR = Math.cos(phiInc) + Rr * Math.cos(phiRef) - Ri * Math.sin(phiRef);
    pI = Math.sin(phiInc) + Rr * Math.sin(phiRef) + Ri * Math.cos(phiRef);
  } else {
    if (isAbove) {
      const phiTrans = k2 * x - omega * t;
      pR = Tr * Math.cos(phiTrans) - Ti * Math.sin(phiTrans);
      pI = Tr * Math.sin(phiTrans) + Ti * Math.cos(phiTrans);
    } else {
      // Evanescent: e^{-κx} · T · e^{-iωt}
      const decay = Math.exp(-kappa * x);
      pR = decay * (Tr * Math.cos(-omega * t) - Ti * Math.sin(-omega * t));
      pI = decay * (Tr * Math.sin(-omega * t) + Ti * Math.cos(-omega * t));
    }
  }

  return { re: pR, prob: pR * pR + pI * pI };
}

export const FreeParticleStepSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const paramsRef = useRef<Params>({
    energy: 3.0,
    potential: 1.5,
    mass: 1.0,
    speed: 1.0,
    showPsi: true,
    showProb: true,
  });
  const [params, setParams] = useState<Params>(paramsRef.current);

  // Keep ref in sync with state so the animation loop always sees current values.
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const updateParam = <K extends keyof Params>(key: K, val: Params[K]) =>
    setParams(prev => ({ ...prev, [key]: val }));

  // ── Canvas draw ────────────────────────────────────────────────────────────
  const drawFrame = (t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const { energy: E, potential: V0, mass: m, showPsi, showProb } = paramsRef.current;

    // ── Background ─────────────────────────────────────────────────────────
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, W, H);

    const padL = 56, padR = 140, padT = 36, padB = 44;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const midY = padT + plotH / 2;

    const toX = (x: number) => padL + ((x - X_MIN) / (X_MAX - X_MIN)) * plotW;
    const toY = (y: number) => midY - y;

    // ── Shaded region x > 0 (potential zone) ───────────────────────────────
    ctx.fillStyle = 'rgba(251,191,36,0.05)';
    ctx.fillRect(toX(0), padT, plotW - (toX(0) - padL), plotH);

    // ── x-axis ──────────────────────────────────────────────────────────────
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, midY);
    ctx.lineTo(padL + plotW, midY);
    ctx.stroke();

    // ── x = 0 dashed line ──────────────────────────────────────────────────
    const cx0 = toX(0);
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx0, padT);
    ctx.lineTo(cx0, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Potential V(x) ─────────────────────────────────────────────────────
    // Scale V₀ so the step is a fixed fraction of the plot height.
    const vScale = (plotH * 0.35) / Math.max(E, V0, 0.5);
    const v0Y = toY(V0 * vScale);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(padL, midY);
    ctx.lineTo(cx0, midY);
    ctx.lineTo(cx0, v0Y);
    ctx.lineTo(padL + plotW, v0Y);
    ctx.stroke();

    // ── Physics ────────────────────────────────────────────────────────────
    const k1 = Math.sqrt(2 * m * E);
    const omega = E; // ω = E (ℏ = 1)
    const isAbove = E > V0 + 1e-6;

    let k2 = 0, kappa = 0;
    let Rr = 0, Ri = 0, Tr = 0, Ti = 0;

    if (isAbove) {
      k2 = Math.sqrt(2 * m * (E - V0));
      const denom = k1 + k2;
      Rr = (k1 - k2) / denom;
      Tr = 2 * k1 / denom;
    } else {
      kappa = Math.sqrt(2 * m * Math.max(V0 - E, 0));
      const d2 = k1 * k1 + kappa * kappa;
      Rr = (k1 * k1 - kappa * kappa) / d2;
      Ri = -2 * k1 * kappa / d2;
      Tr = 2 * k1 * k1 / d2;
      Ti = -2 * k1 * kappa / d2;
    }

    // Amplitude scale: map peak |ψ| ~ 2 to a fixed fraction of the half-plot-height.
    const ampScale = WAVEFUNCTION_AMPLITUDE_SCALE;
    const psiPixelScale = (plotH * PSI_PLOT_HEIGHT_FRACTION) / ampScale;
    const probPixelScale = (plotH * PROB_PLOT_HEIGHT_FRACTION) / (ampScale * ampScale / PROB_AMPLITUDE_ADJUSTMENT);

    // ── Re(ψ) ─────────────────────────────────────────────────────────────
    if (showPsi) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let first = true;
      for (let i = 0; i <= SEGMENT_COUNT; i++) {
        const x = X_MIN + (i / SEGMENT_COUNT) * (X_MAX - X_MIN);
        const { re } = psiAt(x, t, k1, omega, isAbove, k2, kappa, Rr, Ri, Tr, Ti);
        const cy = toY(re * psiPixelScale);
        if (first) { ctx.moveTo(toX(x), cy); first = false; }
        else ctx.lineTo(toX(x), cy);
      }
      ctx.stroke();
    }

    // ── |ψ|² ─────────────────────────────────────────────────────────────
    if (showProb) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let first = true;
      for (let i = 0; i <= SEGMENT_COUNT; i++) {
        const x = X_MIN + (i / SEGMENT_COUNT) * (X_MAX - X_MIN);
        const { prob } = psiAt(x, t, k1, omega, isAbove, k2, kappa, Rr, Ri, Tr, Ti);
        const cy = toY(prob * probPixelScale);
        if (first) { ctx.moveTo(toX(x), cy); first = false; }
        else ctx.lineTo(toX(x), cy);
      }
      ctx.stroke();
    }

    // ── Region labels ──────────────────────────────────────────────────────
    ctx.font = '11px monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('V = 0', toX(-5), padT + 14);
    ctx.fillText(isAbove ? 'V = V₀' : 'V = V₀ (evanescent)', toX(5), padT + 14);
    ctx.fillStyle = '#64748b';
    ctx.fillText('x = 0', cx0, padT + plotH + 32);

    // x-axis tick labels
    ctx.fillStyle = '#475569';
    ctx.font = '10px monospace';
    for (let xi = X_MIN; xi <= X_MAX; xi += 5) {
      ctx.fillText(String(xi), toX(xi), midY + 14);
    }

    // ── Stats box (top-right) ──────────────────────────────────────────────
    const reflR = Rr * Rr + Ri * Ri;
    const transR = isAbove ? (k2 / k1) * (Tr * Tr + Ti * Ti) : 0;
    const lines = [
      `k₁ = ${k1.toFixed(3)}`,
      isAbove ? `k₂ = ${k2.toFixed(3)}` : `κ  = ${kappa.toFixed(3)}`,
      `|R|² = ${reflR.toFixed(3)}`,
      `|T|² = ${transR.toFixed(3)}`,
    ];
    const boxX = padL + plotW + 8;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    lines.forEach((ln, i) => ctx.fillText(ln, boxX, padT + 16 + i * 18));
  };

  // ── Animation loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      timeRef.current += 0.022 * paramsRef.current.speed;
      drawFrame(timeRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Responsive canvas size ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = Math.max(260, Math.round(parent.clientWidth * 0.42));
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  // ── Derived stats for the control panel ──────────────────────────────────
  const k1d = Math.sqrt(2 * params.mass * params.energy);
  const isAboveD = params.energy > params.potential + 1e-6;
  const reflD = isAboveD
    ? Math.pow(
        (k1d - Math.sqrt(2 * params.mass * (params.energy - params.potential))) /
        (k1d + Math.sqrt(2 * params.mass * (params.energy - params.potential))),
        2,
      )
    : 1.0;
  const transD = isAboveD ? 1 - reflD : 0;

  return (
    <div className="flex flex-col bg-slate-950 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full block" />

      {/* Controls */}
      <div className="bg-slate-900 border-t border-slate-700 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {/* Energy */}
          <div>
            <label className="text-slate-300 text-sm">
              Particle Energy &nbsp;<span className="text-blue-300 font-mono">E = {params.energy.toFixed(2)}</span>
            </label>
            <input
              type="range" min="0.1" max="10" step="0.05"
              value={params.energy}
              onChange={e => updateParam('energy', parseFloat(e.target.value))}
              className="w-full h-2 mt-1 bg-slate-700 rounded cursor-pointer accent-blue-500"
            />
          </div>

          {/* Potential */}
          <div>
            <label className="text-slate-300 text-sm">
              Step Height &nbsp;<span className="text-amber-300 font-mono">V₀ = {params.potential.toFixed(2)}</span>
            </label>
            <input
              type="range" min="0" max="10" step="0.05"
              value={params.potential}
              onChange={e => updateParam('potential', parseFloat(e.target.value))}
              className="w-full h-2 mt-1 bg-slate-700 rounded cursor-pointer accent-amber-500"
            />
          </div>

          {/* Mass */}
          <div>
            <label className="text-slate-300 text-sm">
              Particle Mass &nbsp;<span className="text-purple-300 font-mono">m = {params.mass.toFixed(2)}</span>
            </label>
            <input
              type="range" min="0.1" max="5" step="0.05"
              value={params.mass}
              onChange={e => updateParam('mass', parseFloat(e.target.value))}
              className="w-full h-2 mt-1 bg-slate-700 rounded cursor-pointer accent-purple-500"
            />
          </div>

          {/* Speed */}
          <div>
            <label className="text-slate-300 text-sm">
              Animation Speed &nbsp;<span className="text-green-300 font-mono">{params.speed.toFixed(1)}×</span>
            </label>
            <input
              type="range" min="0.1" max="3" step="0.1"
              value={params.speed}
              onChange={e => updateParam('speed', parseFloat(e.target.value))}
              className="w-full h-2 mt-1 bg-slate-700 rounded cursor-pointer accent-green-500"
            />
          </div>
        </div>

        {/* Toggles + regime badge */}
        <div className="flex flex-wrap gap-5 items-center pt-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox" checked={params.showPsi}
              onChange={e => updateParam('showPsi', e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-blue-400 font-mono">Re(ψ)</span>
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox" checked={params.showProb}
              onChange={e => updateParam('showProb', e.target.checked)}
              className="accent-green-500"
            />
            <span className="text-green-400 font-mono">|ψ|²</span>
          </label>

          <div className="ml-auto text-sm text-slate-400">
            {isAboveD
              ? <>
                  <span className="text-emerald-400 font-semibold">E &gt; V₀</span>
                  {' — '}partial reflection &nbsp;
                  <span className="font-mono text-slate-300">|R|²={reflD.toFixed(3)}&ensp;|T|²={transD.toFixed(3)}</span>
                </>
              : <span className="text-amber-400 font-semibold">E &lt; V₀ — total reflection (evanescent decay)</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
};
