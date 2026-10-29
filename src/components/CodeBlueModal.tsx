/**
 * Emergency Override: Code Blue Resuscitation Console
 * Provides CPR metronome timer (110 cpm audio-visual beacon),
 * 2-minute CPR cycle clock, Epinephrine dose countdown, and defibrillation log.
 */

import React, { useState, useEffect } from 'react';
import { PatientRecord } from '../types/telemetry';
import { AlertTriangle, X, Zap, Heart, CheckCircle2, Clock } from 'lucide-react';

interface CodeBlueModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord;
  onDeliverShock: (joules: number) => void;
}

export const CodeBlueModal: React.FC<CodeBlueModalProps> = ({
  isOpen,
  onClose,
  patient,
  onDeliverShock,
}) => {
  const [cprSeconds, setCprSeconds] = useState(120); // 2 minute CPR cycle
  const [totalCodeSeconds, setTotalCodeSeconds] = useState(0);
  const [shocksDelivered, setShocksDelivered] = useState(0);
  const [selectedJoules, setSelectedJoules] = useState(200);
  const [metronomeTick, setMetronomeTick] = useState(false);
  const [epiCountdown, setEpiCountdown] = useState(180); // 3 minutes for next Epi

  // CPR Timer and Total Code Timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTotalCodeSeconds((prev) => prev + 1);
      setCprSeconds((prev) => (prev > 0 ? prev - 1 : 120));
      setEpiCountdown((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // CPR Compression Metronome (110 beats/min -> ~545ms interval)
  useEffect(() => {
    if (!isOpen) return;

    const metronomeInterval = setInterval(() => {
      setMetronomeTick((prev) => !prev);
    }, 545);

    return () => clearInterval(metronomeInterval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleShock = () => {
    setShocksDelivered((prev) => prev + 1);
    onDeliverShock(selectedJoules);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-[#131313] border-2 border-[#ef4444] rounded shadow-[0_0_30px_rgba(239,68,68,0.4)] overflow-hidden flex flex-col animate-critical-flash">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#ef4444] text-white">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <div>
              <h2 className="font-mono text-base font-black tracking-wider uppercase">
                CODE BLUE RESUSCITATION CONSOLE · {patient.bed}
              </h2>
              <p className="font-mono text-xs opacity-90">
                PATIENT: {patient.name} · {patient.mrn} · {patient.codeStatus}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console Body */}
        <div className="p-4 flex flex-col gap-4 font-mono">
          {/* Top Timers Matrix */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* 2-Min CPR Cycle */}
            <div className="p-3 bg-[#181B22] border border-[#2D3748] rounded text-center">
              <span className="text-[10px] text-[#86948a] uppercase block">CPR CYCLE CLOCK</span>
              <span className="text-3xl font-bold text-[#ef4444] tabular-nums">
                {formatTime(cprSeconds)}
              </span>
              <span className="text-[10px] text-[#86948a] block mt-0.5">
                {cprSeconds === 0 ? 'CHECK RHYTHM NOW' : 'CONTINUE COMPRESSIONS'}
              </span>
            </div>

            {/* Total Elapsed Code Time */}
            <div className="p-3 bg-[#181B22] border border-[#2D3748] rounded text-center">
              <span className="text-[10px] text-[#86948a] uppercase block">TOTAL ELAPSED</span>
              <span className="text-3xl font-bold text-[#e5e2e1] tabular-nums">
                {formatTime(totalCodeSeconds)}
              </span>
              <span className="text-[10px] text-[#86948a] block mt-0.5">
                DISPATCH TIME: T-0
              </span>
            </div>

            {/* Epinephrine Interval */}
            <div className="p-3 bg-[#181B22] border border-[#2D3748] rounded text-center">
              <span className="text-[10px] text-[#86948a] uppercase block">NEXT EPINEPHRINE</span>
              <span className="text-3xl font-bold text-[#f59e0b] tabular-nums">
                {formatTime(epiCountdown)}
              </span>
              <span className="text-[10px] text-[#86948a] block mt-0.5">
                1mg IV/IO (3-5 min)
              </span>
            </div>
          </div>

          {/* CPR Compression Rate Metronome */}
          <div className="p-3.5 bg-[#181B22] border border-[#2d3748] rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-75 ${
                  metronomeTick
                    ? 'bg-[#ef4444] text-white scale-110 shadow-[0_0_16px_#ef4444]'
                    : 'bg-[#1e222b] text-[#86948a] scale-95'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#e5e2e1] block">
                  CPR COMPRESSION METRONOME (110 CPM)
                </span>
                <span className="text-[11px] text-[#86948a]">
                  Target depth: 5-6 cm (2-2.4 in) with complete chest recoil
                </span>
              </div>
            </div>

            <span className="text-xs px-2.5 py-1 bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] font-bold rounded">
              PACED 110/MIN
            </span>
          </div>

          {/* Defibrillation Shock Control */}
          <div className="p-3.5 bg-[#181B22] border border-[#2d3748] rounded flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-xs font-bold uppercase text-[#e5e2e1]">
                  DEFIBRILLATION ENERGY SELECTION
                </span>
              </div>
              <span className="text-xs text-[#86948a]">
                SHOCKS DELIVERED: <span className="text-[#f59e0b] font-bold">{shocksDelivered}</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {[120, 150, 200].map((j) => (
                  <button
                    key={j}
                    onClick={() => setSelectedJoules(j)}
                    className={`px-3 py-2 rounded font-bold text-xs border transition-all ${
                      selectedJoules === j
                        ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                        : 'bg-[#1e222b] text-[#bbcabf] border-[#2d3748] hover:text-white'
                    }`}
                  >
                    {j} J BIPHASIC
                  </button>
                ))}
              </div>

              <button
                onClick={handleShock}
                className="flex items-center gap-2 px-5 py-3 rounded bg-[#ef4444] text-white font-bold text-sm hover:bg-[#dc2626] border border-[#ef4444] transition-all shadow-[0_0_12px_rgba(239,68,68,0.5)] active:scale-95"
              >
                <Zap className="w-4 h-4" />
                DELIVER {selectedJoules}J SHOCK
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#131313] border-t border-[#2D3748] flex items-center justify-between font-mono text-xs">
          <span className="text-[#86948a]">
            Cardiac arrest protocol active · continuous waveform telemetry logged
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#1e222b] border border-[#2d3748] hover:border-[#10b981] text-[#10b981] font-bold"
          >
            STAND DOWN / RESOLVE CODE
          </button>
        </div>
      </div>
    </div>
  );
};
