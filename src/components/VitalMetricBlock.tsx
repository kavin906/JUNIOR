/**
 * Right-Aligned Quantitative Telemetry Metric Display
 * Implements vital-display-lg (48px) / vital-display-md (36px),
 * paired limit bounds, trend indicators, micro-pulsing beacon, and alarm states.
 */

import React from 'react';
import { PatientStatus } from '../types/telemetry';

interface VitalMetricBlockProps {
  label: string;
  unit: string;
  value: string | number;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  status: PatientStatus;
  accentColor: string;
  lowLimit?: number;
  highLimit?: number;
  trend?: 'up' | 'down' | 'stable';
  displaySize?: 'lg' | 'md';
  isPulsing?: boolean; // Synchronized beat pulse
  onClickLimits?: () => void;
}

export const VitalMetricBlock: React.FC<VitalMetricBlockProps> = ({
  label,
  unit,
  value,
  secondaryValue,
  secondaryLabel,
  status,
  accentColor,
  lowLimit,
  highLimit,
  trend = 'stable',
  displaySize = 'lg',
  isPulsing = false,
  onClickLimits,
}) => {
  const isAlarm = status === 'critical';
  const isCaution = status === 'caution';

  const trendIcon = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '―';

  return (
    <div
      onClick={onClickLimits}
      className={`relative flex flex-col justify-between p-3 rounded bg-[#181B22] border transition-all cursor-pointer select-none group ${
        isAlarm
          ? 'animate-critical-flash border-[#ef4444]'
          : isCaution
          ? 'border-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.2)]'
          : 'border-[#2D3748] hover:border-[#4edea3]/50'
      }`}
    >
      {/* Top Header: Label, Unit, Status Beacon & Limits */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          {/* Micro-pulsing beacon (8px node per specification) */}
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            {isAlarm ? (
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
            ) : isCaution ? (
              <span className="w-2 h-2 rounded-full border border-[#f59e0b]" />
            ) : (
              <>
                <span className={`absolute w-2 h-2 rounded-full bg-[#10b981] ${isPulsing ? 'animate-micro-pulse' : ''}`} />
                <span className="relative w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              </>
            )}
          </div>

          <span 
            className="font-mono text-xs font-bold uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            {label}
          </span>
          <span className="font-mono text-[11px] text-[#86948a] uppercase">
            {unit}
          </span>
        </div>

        {/* Limit Boundaries Pill/Chip */}
        {(lowLimit !== undefined || highLimit !== undefined) && (
          <div 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] font-mono text-[10px] text-[#86948a] bg-[#1e222b] border border-[#2d3748] group-hover:border-[#4edea3]/40"
            title="Click to adjust alarm limits"
          >
            <span>{lowLimit ?? '--'}</span>
            <span className="text-[#3c4a42]">/</span>
            <span>{highLimit ?? '--'}</span>
          </div>
        )}
      </div>

      {/* Main Quantitative Value (JetBrains Mono Tabular) */}
      <div className="flex items-baseline justify-between mt-1">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-mono font-bold tracking-tight tabular-nums transition-transform duration-100 ${
              displaySize === 'lg'
                ? 'text-[44px] leading-none'
                : 'text-[32px] leading-none'
            } ${
              isAlarm 
                ? 'text-[#ef4444]' 
                : isCaution 
                ? 'text-[#f59e0b]' 
                : 'text-[#e5e2e1]'
            } ${isPulsing ? 'scale-[1.03]' : 'scale-100'}`}
            style={{ color: isAlarm ? '#ef4444' : isCaution ? '#f59e0b' : accentColor }}
          >
            {value}
          </span>
        </div>

        {/* Secondary metric or Trend indicator */}
        <div className="flex flex-col items-end text-right">
          <span className="font-mono text-[11px] text-[#86948a] font-medium">
            {trendIcon}
          </span>
          {secondaryValue !== undefined && (
            <div className="mt-0.5">
              <span className="font-mono text-sm font-semibold text-[#e5e2e1] tabular-nums">
                {secondaryValue}
              </span>
              {secondaryLabel && (
                <span className="font-mono text-[9px] text-[#86948a] uppercase ml-1">
                  {secondaryLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alarm Status Flag if Active */}
      {isAlarm && (
        <div className="mt-1 px-1 py-0.5 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded-[2px] text-center">
          <span className="font-mono text-[10px] font-bold text-[#ef4444] uppercase tracking-wider">
            CRITICAL LIMIT BREAK
          </span>
        </div>
      )}
    </div>
  );
};
