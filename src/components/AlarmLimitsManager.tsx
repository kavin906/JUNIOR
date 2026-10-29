/**
 * Screen 4: Alarm Boundary & Threshold Limits Manager
 * Features horizontal track zones (Critical Low, Warning Low, Nominal, Warning High, Critical High),
 * and discrete stepped numeric increment/decrement buttons to prevent accidental limit shifts.
 */

import React, { useState } from 'react';
import { PatientRecord } from '../types/telemetry';
import { Sliders, Shield, RotateCcw, Save, Check } from 'lucide-react';

interface AlarmLimitsManagerProps {
  patient: PatientRecord;
  onUpdatePatientLimits: (updatedLimits: Record<string, { low: number; high: number }>) => void;
  onClose?: () => void;
}

interface LimitConfig {
  key: string;
  name: string;
  unit: string;
  currentVal: number;
  minRange: number;
  maxRange: number;
  low: number;
  high: number;
  step: number;
  color: string;
}

export const AlarmLimitsManager: React.FC<AlarmLimitsManagerProps> = ({
  patient,
  onUpdatePatientLimits,
  onClose,
}) => {
  const [limits, setLimits] = useState<Record<string, { low: number; high: number }>>({
    hr: { low: 50, high: 120 },
    spo2: { low: 90, high: 100 },
    etco2: { low: 30, high: 45 },
    respRate: { low: 8, high: 26 },
    bpSys: { low: 90, high: 160 },
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const configs: LimitConfig[] = [
    {
      key: 'hr',
      name: 'HEART RATE (HR)',
      unit: 'BPM',
      currentVal: patient.hr,
      minRange: 30,
      maxRange: 200,
      low: limits.hr.low,
      high: limits.hr.high,
      step: 5,
      color: '#22C55E',
    },
    {
      key: 'spo2',
      name: 'OXYGEN SATURATION (SpO2)',
      unit: '%',
      currentVal: patient.spo2,
      minRange: 75,
      maxRange: 100,
      low: limits.spo2.low,
      high: limits.spo2.high,
      step: 1,
      color: '#06B6D4',
    },
    {
      key: 'etco2',
      name: 'END-TIDAL CO2 (EtCO2)',
      unit: 'mmHg',
      currentVal: patient.etco2,
      minRange: 15,
      maxRange: 60,
      low: limits.etco2.low,
      high: limits.etco2.high,
      step: 1,
      color: '#F59E0B',
    },
    {
      key: 'respRate',
      name: 'RESPIRATION RATE (RESP)',
      unit: 'rpm',
      currentVal: patient.respRate,
      minRange: 4,
      maxRange: 40,
      low: limits.respRate.low,
      high: limits.respRate.high,
      step: 1,
      color: '#F59E0B',
    },
    {
      key: 'bpSys',
      name: 'SYSTOLIC BLOOD PRESSURE',
      unit: 'mmHg',
      currentVal: patient.bpSystolic,
      minRange: 60,
      maxRange: 220,
      low: limits.bpSys.low,
      high: limits.bpSys.high,
      step: 5,
      color: '#FF7A73',
    },
  ];

  const handleAdjust = (key: string, bound: 'low' | 'high', delta: number) => {
    setLimits((prev) => {
      const current = prev[key];
      const nextVal = current[bound] + delta;
      if (bound === 'low' && nextVal >= current.high) return prev;
      if (bound === 'high' && nextVal <= current.low) return prev;
      return {
        ...prev,
        [key]: {
          ...current,
          [bound]: nextVal,
        },
      };
    });
  };

  const handleResetDefaults = () => {
    setLimits({
      hr: { low: 50, high: 120 },
      spo2: { low: 90, high: 100 },
      etco2: { low: 30, high: 45 },
      respRate: { low: 8, high: 26 },
      bpSys: { low: 90, high: 160 },
    });
  };

  const handleSave = () => {
    onUpdatePatientLimits(limits);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#181B22] border border-[#2D3748] rounded">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-[2px] bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
              ALARM BOUNDARY & LIMIT CONFIGURATION
            </span>
            <span className="font-mono text-xs text-[#86948a]">
              {patient.bed} · {patient.name} ({patient.mrn})
            </span>
          </div>
          <p className="font-mono text-xs text-[#bbcabf] mt-1">
            Stepped increment controls enforce deliberate clinician adjustment without accidental dragging.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#1e222b] border border-[#2d3748] hover:border-[#bbcabf] text-[#bbcabf] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ICU DEFAULTS</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#10b981] text-black font-bold hover:bg-[#059669] transition-colors min-h-[40px]"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'LIMITS SAVED' : 'SAVE THRESHOLDS'}</span>
          </button>
        </div>
      </div>

      {/* Threshold Rails for each physiological vital */}
      <div className="flex flex-col gap-3">
        {configs.map((config) => {
          const totalSpan = config.maxRange - config.minRange;
          const lowPct = ((config.low - config.minRange) / totalSpan) * 100;
          const highPct = ((config.high - config.minRange) / totalSpan) * 100;
          const currentPct = Math.min(100, Math.max(0, ((config.currentVal - config.minRange) / totalSpan) * 100));

          return (
            <div
              key={config.key}
              className="p-3.5 bg-[#181B22] border border-[#2D3748] rounded flex flex-col gap-3"
            >
              {/* Vital Label and Current Metric */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: config.color }}
                  >
                    {config.name}
                  </span>
                  <span className="text-xs text-[#86948a]">
                    [{config.unit}]
                  </span>
                </div>

                <div className="font-mono text-xs flex items-center gap-3">
                  <span className="text-[#86948a]">
                    LIVE VALUE:
                  </span>
                  <span className="text-base font-bold text-[#e5e2e1] tabular-nums">
                    {config.currentVal} {config.unit}
                  </span>
                </div>
              </div>

              {/* Color-Zoned Range Track Visualizer */}
              <div className="relative w-full h-8 bg-[#121212] rounded border border-[#2d3748] overflow-hidden flex items-center">
                {/* Critical Low Zone */}
                <div
                  className="h-full bg-[#ef4444]/25 border-r border-[#ef4444]"
                  style={{ width: `${lowPct}%` }}
                  title="Critical Low Zone"
                />

                {/* Target Safe Zone */}
                <div
                  className="h-full bg-[#10b981]/15"
                  style={{ width: `${highPct - lowPct}%` }}
                  title="Nominal Safe Zone"
                />

                {/* Critical High Zone */}
                <div
                  className="h-full bg-[#ef4444]/25 border-l border-[#ef4444]"
                  style={{ width: `${100 - highPct}%` }}
                  title="Critical High Zone"
                />

                {/* Current Value Marker Pin */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white z-20 shadow-[0_0_8px_#ffffff]"
                  style={{ left: `${currentPct}%` }}
                  title={`Current: ${config.currentVal}`}
                >
                  <div className="w-2.5 h-2.5 -ml-[3px] bg-white rounded-full -mt-0.5" />
                </div>
              </div>

              {/* Stepped Increment Controls (Minimum 48px Target Buttons) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Low Limit Steppers */}
                <div className="flex items-center justify-between p-2 bg-[#1e222b] rounded border border-[#2d3748]">
                  <div>
                    <span className="font-mono text-[10px] text-[#ef4444] uppercase font-bold block">
                      LOW LIMIT THRESHOLD
                    </span>
                    <span className="font-mono text-lg font-bold text-[#e5e2e1] tabular-nums">
                      {config.low} <span className="text-xs text-[#86948a]">{config.unit}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      onClick={() => handleAdjust(config.key, 'low', -config.step)}
                      className="w-12 h-12 flex items-center justify-center rounded bg-[#131313] border border-[#2d3748] hover:border-[#ef4444] text-[#e5e2e1] font-bold text-sm transition-colors active:scale-95"
                    >
                      -{config.step}
                    </button>
                    <button
                      onClick={() => handleAdjust(config.key, 'low', config.step)}
                      className="w-12 h-12 flex items-center justify-center rounded bg-[#131313] border border-[#2d3748] hover:border-[#ef4444] text-[#e5e2e1] font-bold text-sm transition-colors active:scale-95"
                    >
                      +{config.step}
                    </button>
                  </div>
                </div>

                {/* High Limit Steppers */}
                <div className="flex items-center justify-between p-2 bg-[#1e222b] rounded border border-[#2d3748]">
                  <div>
                    <span className="font-mono text-[10px] text-[#ef4444] uppercase font-bold block">
                      HIGH LIMIT THRESHOLD
                    </span>
                    <span className="font-mono text-lg font-bold text-[#e5e2e1] tabular-nums">
                      {config.high} <span className="text-xs text-[#86948a]">{config.unit}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      onClick={() => handleAdjust(config.key, 'high', -config.step)}
                      className="w-12 h-12 flex items-center justify-center rounded bg-[#131313] border border-[#2d3748] hover:border-[#ef4444] text-[#e5e2e1] font-bold text-sm transition-colors active:scale-95"
                    >
                      -{config.step}
                    </button>
                    <button
                      onClick={() => handleAdjust(config.key, 'high', config.step)}
                      className="w-12 h-12 flex items-center justify-center rounded bg-[#131313] border border-[#2d3748] hover:border-[#ef4444] text-[#e5e2e1] font-bold text-sm transition-colors active:scale-95"
                    >
                      +{config.step}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
