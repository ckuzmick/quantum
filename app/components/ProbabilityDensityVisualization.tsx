'use client'

import React, { useEffect, useRef, useState } from 'react';

interface Wavelength {
  id: number;
  frequency: number;
  amplitude: number;
  enabled: boolean;
}

interface ProbabilityDensityVisualizationProps {
  wavelengths: Wavelength[];
  time: number;
}

const WAVE_LENGTH = 20;
const FREQUENCY = 0.05;
const PADDING = 40;

export const ProbabilityDensityVisualization: React.FC<ProbabilityDensityVisualizationProps> = ({
  wavelengths,
  time,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const plotHeight = height / 2 - PADDING / 2;
    const plotWidth = width - 2 * PADDING;
    const plotStart = PADDING;

    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Helper function to calculate wavefunction value
    const getWaveValue = (x: number): number => {
      let y = 0;
      wavelengths.forEach((config) => {
        if (config.enabled) {
          // For a box from -L/2 to +L/2, eigenstate is sin(nπ(x + L/2)/L)
          // Time dependence uses n² scaling (from energy En ~ n²)
          const waveNumber = (Math.PI * config.frequency) / WAVE_LENGTH;
          const phase = time * FREQUENCY * Math.pow(config.frequency, 2);
          const spatialPart = Math.sin(waveNumber * (x + WAVE_LENGTH / 2));
          const realPart = spatialPart * Math.cos(phase) * config.amplitude;
          y += realPart;
        }
      });
      return y;
    };

    // Helper function to calculate probability density |ψ|²
    // This includes the cross terms between different eigenstates
    const getProbabilityDensity = (x: number): number => {
      let psiReal = 0;
      let psiImag = 0;
      
      wavelengths.forEach((config) => {
        if (config.enabled) {
          const waveNumber = (Math.PI * config.frequency) / WAVE_LENGTH;
          // Phase should scale with energy, which is proportional to n²
          const phase = time * FREQUENCY * Math.pow(config.frequency, 2);
          const spatialPart = Math.sin(waveNumber * (x + WAVE_LENGTH / 2));
          
          // e^(-iωt) = cos(ωt) - i*sin(ωt)
          const cosPhase = Math.cos(phase);
          const sinPhase = Math.sin(phase);
          
          psiReal += spatialPart * cosPhase * config.amplitude;
          psiImag -= spatialPart * sinPhase * config.amplitude; // negative for -i*sin(ωt)
        }
      });
      
      // |ψ|² = ψ_real² + ψ_imag²
      const totalProb = psiReal * psiReal + psiImag * psiImag;
      return Math.max(0, totalProb); // Ensure non-negative
    };

    // Draw wavefunction on top half
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let px = 0; px < plotWidth; px++) {
      const t = px / plotWidth; // 0 to 1
      const x = t * WAVE_LENGTH - WAVE_LENGTH / 2;
      const psi = getWaveValue(x);

      const screenX = plotStart + px;
      const screenY = centerY - PADDING / 2 - psi * (plotHeight * 0.35);

      if (px === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();

    // Draw zero line for wavefunction
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotStart, centerY - PADDING / 2);
    ctx.lineTo(plotStart + plotWidth, centerY - PADDING / 2);
    ctx.stroke();

    // Label for wavefunction
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px monospace';
    ctx.fillText('ψ(x) = Wavefunction', PADDING - 35, 20);

    // Draw probability density on bottom half
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let px = 0; px < plotWidth; px++) {
      const t = px / plotWidth;
      const x = t * WAVE_LENGTH - WAVE_LENGTH / 2;
      const probabilityDensity = getProbabilityDensity(x);

      const screenX = plotStart + px;
      const screenY = centerY + PADDING / 2 - probabilityDensity * (plotHeight * 0.6);

      if (px === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();

    // Fill probability density with gradient
    const gradient = ctx.createLinearGradient(plotStart, centerY + PADDING / 2, plotStart, centerY + PADDING / 2 + plotHeight);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
    ctx.fillStyle = gradient;
    ctx.lineTo(plotStart + plotWidth, centerY + PADDING / 2);
    ctx.lineTo(plotStart, centerY + PADDING / 2);
    ctx.fill();

    // Draw zero line for probability density
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotStart, centerY + PADDING / 2);
    ctx.lineTo(plotStart + plotWidth, centerY + PADDING / 2);
    ctx.stroke();

    // Label for probability density
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px monospace';
    ctx.fillText('|ψ(x)|² = Probability Density', PADDING - 35, centerY + PADDING + 15);

    // Draw axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;

    // Left axis
    ctx.beginPath();
    ctx.moveTo(plotStart, centerY - PADDING / 2 - plotHeight);
    ctx.lineTo(plotStart, centerY + PADDING / 2 + plotHeight);
    ctx.stroke();

    // Bottom axis
    ctx.beginPath();
    ctx.moveTo(plotStart - 5, centerY + PADDING / 2 + plotHeight);
    ctx.lineTo(plotStart + plotWidth + 5, centerY + PADDING / 2 + plotHeight);
    ctx.stroke();

    // Position labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('-L/2', plotStart, centerY + PADDING / 2 + plotHeight + 15);
    ctx.fillText('x=0', plotStart + plotWidth / 2, centerY + PADDING / 2 + plotHeight + 15);
    ctx.fillText('+L/2', plotStart + plotWidth, centerY + PADDING / 2 + plotHeight + 15);

    // Info box
    const activeStates = wavelengths.filter(w => w.enabled);
    const activeCount = activeStates.length;
    
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    const boxHeight = activeCount > 1 ? 75 + activeCount * 12 : 70;
    ctx.fillRect(width - 200, 10, 190, boxHeight);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(width - 200, 10, 190, boxHeight);

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Active States: ' + activeCount, width - 190, 28);
    
    ctx.fillStyle = '#10b981';
    ctx.font = '10px monospace';
    ctx.fillText('Time: ' + time.toFixed(0), width - 190, 43);

    // Show phase info for each active state
    activeStates.forEach((state, idx) => {
      const phase = time * FREQUENCY * Math.pow(state.frequency, 2);
      const phaseDeg = ((phase % (2 * Math.PI)) * 180 / Math.PI).toFixed(0);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px monospace';
      ctx.fillText(`n=${state.frequency} φ=${phaseDeg}°`, width - 190, 58 + idx * 12);
    });
  }, [wavelengths, time]);

  return (
    <div ref={containerRef} className="w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
      <canvas
        ref={canvasRef}
        width={900}
        height={400}
        className="w-full block"
      />
    </div>
  );
};
