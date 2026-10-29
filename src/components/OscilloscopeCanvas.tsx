/**
 * Clinical Oscilloscope Canvas Component
 * Renders real-time sweep beam with trailing phosphor persistence,
 * medical 1mm/5mm grid, calibration pulse, and lead indicators.
 */

import React, { useEffect, useRef } from 'react';

interface OscilloscopeCanvasProps {
  label: string;
  subLabel?: string;
  leadScale?: string;
  strokeColor: string;
  dataHistory: number[];
  sweepHead: number; // 0 to 1 normalized position across width
  height?: number;
  isFrozen?: boolean;
  isAlarming?: boolean;
  alarmColor?: string;
}

export const OscilloscopeCanvas: React.FC<OscilloscopeCanvasProps> = ({
  label,
  subLabel,
  leadScale = '1mV/10mm',
  strokeColor,
  dataHistory,
  sweepHead,
  height = 110,
  isFrozen = false,
  isAlarming = false,
  alarmColor = '#ef4444',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const canvasHeight = canvas.height;

    // Clear frame
    ctx.clearRect(0, 0, width, canvasHeight);

    // Render Clinical Grid Pattern (1mm and 5mm simulation)
    const gridSize = 16;
    const subGridSize = 4;

    ctx.lineWidth = 1;
    // Sub-divisions
    ctx.strokeStyle = '#151b24';
    ctx.beginPath();
    for (let x = 0; x < width; x += subGridSize) {
      if (x % gridSize !== 0) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvasHeight);
      }
    }
    for (let y = 0; y < canvasHeight; y += subGridSize) {
      if (y % gridSize !== 0) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
    }
    ctx.stroke();

    // Major grid lines
    ctx.strokeStyle = '#1a222d';
    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, canvasHeight);
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();

    if (dataHistory.length < 2) return;

    const sweepX = Math.floor(sweepHead * width);
    const eraseWidth = 32; // Erase bar width ahead of sweep vector

    // Draw the continuous waveform path
    const baselineY = canvasHeight * 0.55;
    const amplitudeScale = canvasHeight * 0.38;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw previous segments (excluding the erase gap)
    const totalPoints = dataHistory.length;

    // Draw in two passes:
    // Pass 1: Before erase gap (recently drawn points)
    // Pass 2: After erase gap (historical points from previous cycle)
    const gapStart = sweepX;
    const gapEnd = (sweepX + eraseWidth) % width;

    // Phosphor glow
    ctx.shadowBlur = 4;
    ctx.shadowColor = strokeColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;

    let inPath = false;
    ctx.beginPath();

    for (let i = 0; i < totalPoints; i++) {
      const x = (i / (totalPoints - 1)) * width;
      const val = dataHistory[i];
      const y = baselineY - val * amplitudeScale;

      // Check if this x point is inside the erase zone
      let isInsideGap = false;
      if (gapEnd > gapStart) {
        isInsideGap = x >= gapStart && x <= gapEnd;
      } else {
        // Gap wraps around the right edge
        isInsideGap = x >= gapStart || x <= gapEnd;
      }

      if (isInsideGap) {
        if (inPath) {
          ctx.stroke();
          ctx.beginPath();
          inPath = false;
        }
      } else {
        if (!inPath) {
          ctx.moveTo(x, y);
          inPath = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    }

    if (inPath) {
      ctx.stroke();
    }

    // Draw moving Sweep Head Beam (vertical phosphor line tip)
    if (!isFrozen) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = strokeColor;
      ctx.fillStyle = strokeColor;

      // Vertical sweep beam indicator
      const gradient = ctx.createLinearGradient(sweepX - 24, 0, sweepX, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.85, 'rgba(255,255,255,0.06)');
      gradient.addColorStop(1, strokeColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(Math.max(0, sweepX - 24), 0, 24, canvasHeight);

      // Bright dot on the current point
      const currentIdx = Math.min(
        totalPoints - 1,
        Math.max(0, Math.floor(sweepHead * totalPoints))
      );
      const currentY = baselineY - dataHistory[currentIdx] * amplitudeScale;
      ctx.beginPath();
      ctx.arc(sweepX, currentY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Draw 1mV standard calibration square pulse in left corner
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#3c4a42';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const calX = 8;
    const calY = canvasHeight - 12;
    const calH = 14;
    ctx.moveTo(calX, calY);
    ctx.lineTo(calX + 4, calY);
    ctx.lineTo(calX + 4, calY - calH);
    ctx.lineTo(calX + 12, calY - calH);
    ctx.lineTo(calX + 12, calY);
    ctx.lineTo(calX + 16, calY);
    ctx.stroke();

    ctx.restore();
  }, [dataHistory, sweepHead, strokeColor, height, isFrozen, isAlarming, alarmColor]);

  return (
    <div className={`relative w-full h-[${height}px] bg-[#181B22] border overflow-hidden transition-colors ${
      isAlarming 
        ? 'border-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.3)]' 
        : 'border-[#2D3748]'
    } rounded`}>
      {/* Lead & Calibration HUD Overlay */}
      <div className="absolute top-1.5 left-2.5 z-10 flex items-center gap-2 pointer-events-none select-none">
        <span 
          className="font-mono text-xs font-bold tracking-wider uppercase px-1 py-0.5 rounded-sm"
          style={{ color: strokeColor, backgroundColor: `${strokeColor}15` }}
        >
          {label}
        </span>
        {subLabel && (
          <span className="text-[11px] font-mono text-[#86948a] uppercase">
            {subLabel}
          </span>
        )}
      </div>

      <div className="absolute top-1.5 right-2 z-10 flex items-center gap-2 pointer-events-none select-none">
        <span className="text-[10px] font-mono text-[#86948a] tracking-tight">
          {leadScale}
        </span>
        {isFrozen && (
          <span className="text-[10px] font-mono font-bold uppercase bg-[#f59e0b]/20 text-[#f59e0b] px-1.5 py-0.5 rounded-sm animate-pulse">
            FREEZE
          </span>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={680}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
