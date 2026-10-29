/**
 * Screen 2: Multi-Bed Ward Telemetry Matrix
 * Central Nursing Station overview of Beds 01 to 08 with live mini-ECG sweeps,
 * real-time vital telemetry, remote alarm acknowledgement, and quick patient switching.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PatientRecord } from '../types/telemetry';
import { AlertTriangle, CheckCircle, ShieldAlert, Activity, ArrowRight, Eye } from 'lucide-react';

interface MultiBedWardProps {
  patients: PatientRecord[];
  activePatientId: string;
  onSelectPatient: (patientId: string) => void;
  onAcknowledgeAlarm: (patientId: string) => void;
}

export const MultiBedWard: React.FC<MultiBedWardProps> = ({
  patients,
  activePatientId,
  onSelectPatient,
  onAcknowledgeAlarm,
}) => {
  const [filter, setFilter] = useState<'all' | 'alarms'>('all');
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  // Live mini-oscilloscope canvas rendering for each bed
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    let lastTime = performance.now();

    const renderRhythmStrips = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      phaseRef.current = (phaseRef.current + dt * 1.2) % 1.0;

      patients.forEach((patient) => {
        const canvas = canvasRefs.current[patient.id];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Draw faint grid
        ctx.strokeStyle = '#151b24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x += 16) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y < h; y += 16) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();

        // Draw rhythm wave
        const strokeColor = patient.status === 'critical' ? '#ef4444' : '#10b981';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const numPoints = 80;
        const effectiveFreq = patient.hr / 60;

        for (let i = 0; i < numPoints; i++) {
          const x = (i / (numPoints - 1)) * w;
          const samplePhase = ((i / numPoints) * 3 + phaseRef.current * effectiveFreq) % 1.0;

          // Simple synthetic PQRST
          let yVal = 0;
          if (patient.rhythm === 'VTACH') {
            yVal = Math.sin(samplePhase * Math.PI * 4) * 0.45;
          } else {
            if (samplePhase > 0.15 && samplePhase < 0.25) {
              yVal = 0.12; // P wave
            } else if (samplePhase >= 0.28 && samplePhase <= 0.32) {
              const rNorm = (samplePhase - 0.30) / 0.015;
              yVal = Math.exp(-0.5 * rNorm * rNorm) * 0.75; // R wave
            } else if (samplePhase >= 0.32 && samplePhase <= 0.35) {
              yVal = -0.22; // S wave
            } else if (samplePhase >= 0.45 && samplePhase <= 0.60) {
              yVal = 0.20; // T wave
            }
          }

          const y = h * 0.55 - yVal * (h * 0.4);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameRef.current = requestAnimationFrame(renderRhythmStrips);
    };

    animationFrameRef.current = requestAnimationFrame(renderRhythmStrips);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [patients]);

  const filteredPatients = patients.filter((p) => {
    if (filter === 'alarms') return p.status !== 'normal';
    return true;
  });

  const criticalCount = patients.filter((p) => p.status === 'critical').length;
  const cautionCount = patients.filter((p) => p.status === 'caution').length;
  const normalCount = patients.filter((p) => p.status === 'normal').length;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1600px] mx-auto w-full">
      {/* Top Central Ward Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#181B22] border border-[#2D3748] rounded">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#1e222b] border border-[#2d3748] text-[#4edea3]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-[#e5e2e1]">
              CENTRAL TELEMETRY WARD · INTENSIVE CARE UNIT
            </h2>
            <p className="font-mono text-xs text-[#86948a]">
              8 active transmitters online · continuous multi-lead vector surveillance
            </p>
          </div>
        </div>

        {/* Alarm Summary Counts */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981]">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{normalCount} STABLE</span>
          </div>
          {cautionCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{cautionCount} CAUTION</span>
            </div>
          )}
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ef4444]/20 border border-[#ef4444] text-[#ef4444] animate-critical-flash">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{criticalCount} CRITICAL ALERT</span>
            </div>
          )}

          {/* Filter segment control */}
          <div className="flex items-center bg-[#1e222b] p-0.5 rounded border border-[#2d3748] ml-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filter === 'all'
                  ? 'bg-[#4edea3] text-black font-bold'
                  : 'text-[#86948a] hover:text-[#e5e2e1]'
              }`}
            >
              All Beds ({patients.length})
            </button>
            <button
              onClick={() => setFilter('alarms')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filter === 'alarms'
                  ? 'bg-[#ef4444] text-white font-bold'
                  : 'text-[#86948a] hover:text-[#e5e2e1]'
              }`}
            >
              Alarms ({criticalCount + cautionCount})
            </button>
          </div>
        </div>
      </div>

      {/* 8-Bed Clinical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {filteredPatients.map((patient) => {
          const isSelected = patient.id === activePatientId;
          const isAlarm = patient.status === 'critical';
          const isCaution = patient.status === 'caution';

          return (
            <div
              key={patient.id}
              className={`flex flex-col justify-between p-3 rounded bg-[#181B22] border transition-all ${
                isAlarm
                  ? 'border-[#ef4444] animate-critical-flash'
                  : isCaution
                  ? 'border-[#f59e0b]'
                  : isSelected
                  ? 'border-[#4edea3] shadow-[0_0_10px_rgba(78,222,163,0.15)]'
                  : 'border-[#2D3748] hover:border-[#3c4a42]'
              }`}
            >
              {/* Bed Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2d3748]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-[2px] bg-[#1e222b] text-[#4edea3] border border-[#2d3748]">
                    {patient.bed}
                  </span>
                  <div>
                    <h3 className="font-semibold text-xs text-[#e5e2e1] truncate max-w-[140px]">
                      {patient.name}
                    </h3>
                    <p className="font-mono text-[10px] text-[#86948a]">
                      {patient.age}{patient.gender} · {patient.mrn}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] ${
                      isAlarm
                        ? 'bg-[#ef4444]/20 text-[#ef4444]'
                        : isCaution
                        ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                        : 'bg-[#10b981]/20 text-[#10b981]'
                    }`}
                  >
                    {patient.rhythm}
                  </span>
                </div>
              </div>

              {/* Mini Rhythm Strip Oscilloscope */}
              <div className="relative my-2 h-14 bg-[#121212] border border-[#2d3748] rounded overflow-hidden">
                <div className="absolute top-1 left-1.5 z-10 flex items-center gap-1 font-mono text-[9px] text-[#86948a]">
                  <span>LEAD II</span>
                  <span>·</span>
                  <span>1mV/10mm</span>
                </div>
                <canvas
                  ref={(el) => {
                    canvasRefs.current[patient.id] = el;
                  }}
                  width={320}
                  height={56}
                  className="w-full h-full block"
                />
              </div>

              {/* Vitals Telemetry Row */}
              <div className="grid grid-cols-4 gap-1.5 py-2 font-mono text-center bg-[#131313] rounded p-1.5 border border-[#2d3748]/60">
                <div>
                  <span className="text-[9px] text-[#86948a] uppercase block">HR</span>
                  <span className={`text-base font-bold tabular-nums ${isAlarm && (patient.hr < 50 || patient.hr > 120) ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                    {patient.hr}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#86948a] uppercase block">SpO2</span>
                  <span className={`text-base font-bold tabular-nums ${patient.spo2 < 93 ? 'text-[#ef4444]' : 'text-[#06b6d4]'}`}>
                    {patient.spo2}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#86948a] uppercase block">NIBP</span>
                  <span className="text-xs font-bold text-[#e5e2e1] tabular-nums leading-tight block mt-1">
                    {patient.bpSystolic}/{patient.bpDiastolic}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#86948a] uppercase block">RESP</span>
                  <span className="text-base font-bold text-[#f59e0b] tabular-nums">
                    {patient.respRate}
                  </span>
                </div>
              </div>

              {/* Active Alarm Note (if alarming) */}
              {patient.activeAlarmMessage && (
                <div className="mt-2 p-1.5 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded text-[11px] font-mono text-[#ef4444] font-semibold text-center truncate">
                  {patient.activeAlarmMessage}
                </div>
              )}

              {/* Card Footer: Clinical Actions */}
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#2d3748]">
                {patient.activeAlarmMessage && (
                  <button
                    onClick={() => onAcknowledgeAlarm(patient.id)}
                    className="flex-1 py-1.5 px-2 rounded bg-[#1e222b] border border-[#f59e0b] hover:bg-[#f59e0b]/20 font-mono text-[11px] font-bold text-[#f59e0b] transition-colors"
                  >
                    ACK ALARM
                  </button>
                )}
                <button
                  onClick={() => onSelectPatient(patient.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded font-mono text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#10b981] text-black'
                      : 'bg-[#1e222b] text-[#e5e2e1] border border-[#2d3748] hover:border-[#4edea3]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'MONITORING' : 'OPEN BED'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
