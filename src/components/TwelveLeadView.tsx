/**
 * Screen 3: 12-Lead Diagnostic ECG with Interactive Digital Calipers
 * Standard 3x4 lead configuration + Lead II rhythm strip,
 * digital calipers for PR, QRS, and QTc calculation (Bazett formula),
 * and ST-segment vector analysis.
 */

import React, { useState } from 'react';
import { PatientRecord } from '../types/telemetry';
import { FileText, Printer, CheckCircle, Sliders, Info, RotateCcw } from 'lucide-react';

interface TwelveLeadViewProps {
  patient: PatientRecord;
}

interface LeadData {
  id: string;
  name: string;
  stDeviationMm: number;
  inverted?: boolean;
  amplitudeScale: number;
}

const LEADS: LeadData[] = [
  { id: 'I', name: 'Lead I', stDeviationMm: 0.1, amplitudeScale: 0.8 },
  { id: 'aVR', name: 'Lead aVR', stDeviationMm: -0.2, inverted: true, amplitudeScale: 0.7 },
  { id: 'V1', name: 'Lead V1', stDeviationMm: 0.0, amplitudeScale: 0.9 },
  { id: 'V4', name: 'Lead V4', stDeviationMm: 0.6, amplitudeScale: 1.2 },

  { id: 'II', name: 'Lead II', stDeviationMm: 0.4, amplitudeScale: 1.1 },
  { id: 'aVL', name: 'Lead aVL', stDeviationMm: -0.1, amplitudeScale: 0.6 },
  { id: 'V2', name: 'Lead V2', stDeviationMm: 0.2, amplitudeScale: 1.3 },
  { id: 'V5', name: 'Lead V5', stDeviationMm: 0.5, amplitudeScale: 1.1 },

  { id: 'III', name: 'Lead III', stDeviationMm: 0.3, amplitudeScale: 0.8 },
  { id: 'aVF', name: 'Lead aVF', stDeviationMm: 0.3, amplitudeScale: 0.9 },
  { id: 'V3', name: 'Lead V3', stDeviationMm: 0.4, amplitudeScale: 1.4 },
  { id: 'V6', name: 'Lead V6', stDeviationMm: 0.2, amplitudeScale: 0.9 },
];

export const TwelveLeadView: React.FC<TwelveLeadViewProps> = ({ patient }) => {
  // Digital Caliper interactive state
  const [caliperStart, setCaliperStart] = useState<number>(180); // ms offset
  const [caliperEnd, setCaliperEnd] = useState<number>(340); // ms offset
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [caliperTarget, setCaliperTarget] = useState<'QRS' | 'PR' | 'QT'>('QRS');

  // Time difference in ms (based on 25 mm/s sweep -> 1mm = 40ms)
  const measuredIntervalMs = Math.abs(caliperEnd - caliperStart);

  // Bazett formula QTc calculation: QTc = QT / sqrt(RR in seconds)
  const rrSeconds = 60 / patient.hr;
  const calculatedQtc = Math.round(measuredIntervalMs / Math.sqrt(rrSeconds));

  const handlePresetCaliper = (preset: 'PR' | 'QRS' | 'QT') => {
    setCaliperTarget(preset);
    if (preset === 'PR') {
      setCaliperStart(120);
      setCaliperEnd(280); // 160 ms
    } else if (preset === 'QRS') {
      setCaliperStart(200);
      setCaliperEnd(292); // 92 ms
    } else if (preset === 'QT') {
      setCaliperStart(200);
      setCaliperEnd(580); // 380 ms
    }
  };

  const handlePrint = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1600px] mx-auto w-full">
      {/* 12-Lead Report Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#181B22] border border-[#2D3748] rounded">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-[2px] bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40">
              12-LEAD DIAGNOSTIC ECG
            </span>
            <span className="font-mono text-xs text-[#86948a]">
              25 mm/s · 10 mm/mV · Filter 0.05 - 150 Hz
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 font-mono text-xs">
            <span className="text-[#e5e2e1] font-bold">{patient.name}</span>
            <span className="text-[#86948a]">{patient.age}{patient.gender} · {patient.mrn} · {patient.bed}</span>
            <span className="text-[#10b981]">HR: {patient.hr} BPM</span>
            <span className="text-[#86948a]">NSR with Normal Axis (62°)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#1e222b] border border-[#2d3748] hover:border-[#4edea3] font-mono text-xs font-semibold text-[#e5e2e1] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>{isExporting ? 'GENERATING PDF...' : 'PRINT DIAGNOSTIC'}</span>
          </button>
        </div>
      </div>

      {/* 12-Lead Standard 3x4 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {LEADS.map((lead) => {
          return (
            <div
              key={lead.id}
              className="relative p-2.5 bg-[#181B22] border border-[#2D3748] rounded h-32 flex flex-col justify-between overflow-hidden"
            >
              {/* Medical Grid Pattern */}
              <div className="absolute inset-0 medical-grid opacity-70 pointer-events-none" />

              {/* Lead Label & ST Deviation HUD */}
              <div className="relative z-10 flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-[#4edea3] bg-[#121212]/80 px-1 rounded-sm border border-[#2d3748]">
                  {lead.name}
                </span>
                <span className="text-[10px] text-[#bbcabf] bg-[#121212]/80 px-1 rounded-sm">
                  ST {lead.stDeviationMm > 0 ? `+${lead.stDeviationMm}` : lead.stDeviationMm} mm
                </span>
              </div>

              {/* Synthetic Vector Trace SVG */}
              <div className="relative z-10 w-full h-16 flex items-center">
                <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                  {/* Baseline indicator */}
                  <line x1="0" y1="35" x2="200" y2="35" stroke="#2d3748" strokeWidth="0.5" strokeDasharray="2 2" />
                  
                  {/* Waveform vector */}
                  <path
                    d={
                      lead.inverted
                        ? "M 0 35 L 20 35 Q 30 38 40 35 L 55 35 L 65 33 L 75 52 L 85 24 L 95 35 Q 120 30 145 35 L 200 35"
                        : `M 0 35 L 20 35 Q 30 32 40 35 L 55 35 L 62 38 L 72 ${35 - 32 * lead.amplitudeScale} L 82 44 L 90 35 Q 120 28 145 35 L 200 35`
                    }
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Calibration mark */}
              <div className="relative z-10 flex items-center justify-between font-mono text-[9px] text-[#86948a]">
                <span>0.05-150Hz</span>
                <span>10mm/mV</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rhythm Strip Lead II (Full Width with Caliper Overlay) */}
      <div className="relative p-3 bg-[#181B22] border border-[#2D3748] rounded">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#2d3748]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#4edea3] bg-[#121212] px-2 py-0.5 rounded-[2px] border border-[#2d3748]">
              LEAD II CONTINUOUS RHYTHM STRIP
            </span>
            <span className="font-mono text-xs text-[#86948a]">
              Interactive Caliper Active
            </span>
          </div>

          {/* Caliper Preset Buttons */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#86948a] text-[11px] mr-1">MEASURE:</span>
            <button
              onClick={() => handlePresetCaliper('PR')}
              className={`px-2.5 py-1 rounded transition-colors ${
                caliperTarget === 'PR' ? 'bg-[#06b6d4] text-black font-bold' : 'bg-[#1e222b] text-[#bbcabf]'
              }`}
            >
              PR Interval
            </button>
            <button
              onClick={() => handlePresetCaliper('QRS')}
              className={`px-2.5 py-1 rounded transition-colors ${
                caliperTarget === 'QRS' ? 'bg-[#4edea3] text-black font-bold' : 'bg-[#1e222b] text-[#bbcabf]'
              }`}
            >
              QRS Duration
            </button>
            <button
              onClick={() => handlePresetCaliper('QT')}
              className={`px-2.5 py-1 rounded transition-colors ${
                caliperTarget === 'QT' ? 'bg-[#f59e0b] text-black font-bold' : 'bg-[#1e222b] text-[#bbcabf]'
              }`}
            >
              QT / QTc
            </button>
          </div>
        </div>

        {/* Oscilloscope Medical Grid with Calipers */}
        <div className="relative h-28 bg-[#121212] border border-[#2d3748] rounded overflow-hidden select-none">
          <div className="absolute inset-0 medical-grid opacity-85" />

          {/* Caliper Shaded Measurement Window */}
          <div
            className="absolute top-0 bottom-0 bg-[#06b6d4]/15 border-x-2 border-[#06b6d4] z-20 pointer-events-none transition-all"
            style={{
              left: `${Math.min(caliperStart, caliperEnd)}px`,
              width: `${Math.abs(caliperEnd - caliperStart)}px`,
            }}
          >
            <div className="absolute top-1 left-1 font-mono text-[10px] font-bold text-[#06b6d4] bg-[#121212]/90 px-1.5 py-0.5 rounded border border-[#06b6d4]/40">
              {measuredIntervalMs} ms ({Math.round(measuredIntervalMs / 40)} mm)
            </div>
          </div>

          {/* Interactive Range Sliders to Move Calipers */}
          <div className="absolute inset-0 z-30 opacity-0 hover:opacity-10 pointer-events-auto">
            {/* Range inputs overlay */}
          </div>

          {/* SVG Multi-cycle Rhythm Strip */}
          <svg className="w-full h-full relative z-10" viewBox="0 0 1000 110" preserveAspectRatio="none">
            <path
              d="
                M 0 65 
                L 40 65 Q 50 60 60 65 L 75 65 L 82 72 L 92 15 L 102 85 L 110 65 Q 140 50 170 65 L 250 65
                L 290 65 Q 300 60 310 65 L 325 65 L 332 72 L 342 15 L 352 85 L 360 65 Q 390 50 420 65 L 500 65
                L 540 65 Q 550 60 560 65 L 575 65 L 582 72 L 592 15 L 602 85 L 610 65 Q 640 50 670 65 L 750 65
                L 790 65 Q 800 60 810 65 L 825 65 L 832 72 L 842 15 L 852 85 L 860 65 Q 890 50 920 65 L 1000 65
              "
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.0"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Caliper Fine Stepper Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-2 bg-[#131313] rounded border border-[#2d3748]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#86948a] whitespace-nowrap">CALIPER 1 (START):</span>
            <input
              type="range"
              min="50"
              max="600"
              value={caliperStart}
              onChange={(e) => setCaliperStart(Number(e.target.value))}
              className="w-full accent-[#06b6d4] h-1.5 bg-[#2d3748] rounded"
            />
            <span className="font-mono text-xs text-[#06b6d4] font-bold w-12">{caliperStart}ms</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#86948a] whitespace-nowrap">CALIPER 2 (END):</span>
            <input
              type="range"
              min="50"
              max="800"
              value={caliperEnd}
              onChange={(e) => setCaliperEnd(Number(e.target.value))}
              className="w-full accent-[#06b6d4] h-1.5 bg-[#2d3748] rounded"
            />
            <span className="font-mono text-xs text-[#06b6d4] font-bold w-12">{caliperEnd}ms</span>
          </div>
        </div>

        {/* Diagnostic Measurement Results Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 font-mono">
          <div className="p-2 bg-[#1e222b] rounded border border-[#2d3748]">
            <span className="text-[10px] text-[#86948a] uppercase block">MEASURED {caliperTarget}</span>
            <span className="text-xl font-bold text-[#4edea3] tabular-nums">
              {measuredIntervalMs} <span className="text-xs text-[#86948a]">ms</span>
            </span>
          </div>
          <div className="p-2 bg-[#1e222b] rounded border border-[#2d3748]">
            <span className="text-[10px] text-[#86948a] uppercase block">BAZETT QTc</span>
            <span className={`text-xl font-bold tabular-nums ${calculatedQtc > 460 ? 'text-[#ef4444]' : 'text-[#06b6d4]'}`}>
              {calculatedQtc} <span className="text-xs text-[#86948a]">ms</span>
            </span>
          </div>
          <div className="p-2 bg-[#1e222b] rounded border border-[#2d3748]">
            <span className="text-[10px] text-[#86948a] uppercase block">R-R INTERVAL</span>
            <span className="text-xl font-bold text-[#e5e2e1] tabular-nums">
              {Math.round(rrSeconds * 1000)} <span className="text-xs text-[#86948a]">ms</span>
            </span>
          </div>
          <div className="p-2 bg-[#1e222b] rounded border border-[#2d3748]">
            <span className="text-[10px] text-[#86948a] uppercase block">CRITERIA</span>
            <span className="text-sm font-bold text-[#10b981] flex items-center gap-1 mt-1">
              <CheckCircle className="w-3.5 h-3.5" /> NORMAL LIMITS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
