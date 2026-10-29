/**
 * Arrhythmia & Acute Clinical Scenario Simulator Drawer
 * Allows real-time injection of arrhythmias, hemodynamic collapse,
 * technical lead-offs, and critical limit breaks to evaluate interface responses.
 */

import React from 'react';
import { RhythmType } from '../types/telemetry';
import { X, Sparkles, Activity, AlertTriangle, Zap, Check } from 'lucide-react';

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRhythm: RhythmType;
  currentHr: number;
  currentSpo2: number;
  onSelectScenario: (scenario: {
    rhythm: RhythmType;
    hr: number;
    spo2: number;
    respRate: number;
    status: 'normal' | 'caution' | 'critical';
    alarmMessage?: string;
  }) => void;
  onAdjustHr: (hr: number) => void;
  onAdjustSpo2: (spo2: number) => void;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({
  isOpen,
  onClose,
  currentRhythm,
  currentHr,
  currentSpo2,
  onSelectScenario,
  onAdjustHr,
  onAdjustSpo2,
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'nsr',
      name: 'Normal Sinus Rhythm (NSR)',
      desc: 'Hemodynamically stable baseline physiological state',
      rhythm: 'NSR' as RhythmType,
      hr: 74,
      spo2: 99,
      respRate: 14,
      status: 'normal' as const,
      color: '#10b981',
      badge: 'STABLE',
    },
    {
      id: 'brady',
      name: 'Sinus Bradycardia (44 BPM)',
      desc: 'Ventricular rate below limit threshold (50 bpm)',
      rhythm: 'BRADY' as RhythmType,
      hr: 44,
      spo2: 96,
      respRate: 12,
      status: 'critical' as const,
      alarmMessage: 'CRITICAL BRADYCARDIA < 50 BPM',
      color: '#ef4444',
      badge: 'ALARM',
    },
    {
      id: 'tachy',
      name: 'Sinus Tachycardia (142 BPM)',
      desc: 'High rate limit break triggering warning audio',
      rhythm: 'TACHY' as RhythmType,
      hr: 142,
      spo2: 94,
      respRate: 26,
      status: 'critical' as const,
      alarmMessage: 'HIGH RATE TACHYCARDIA > 120 BPM',
      color: '#ef4444',
      badge: 'ALARM',
    },
    {
      id: 'pvc',
      name: 'Ventricular Bigeminy (PVCs)',
      desc: 'Every alternating beat is a wide, notched ectopic complex',
      rhythm: 'PVC_BIGEMINY' as RhythmType,
      hr: 82,
      spo2: 97,
      respRate: 16,
      status: 'caution' as const,
      alarmMessage: 'VENTRICULAR BIGEMINY ECTOPICS',
      color: '#f59e0b',
      badge: 'WARNING',
    },
    {
      id: 'vtach',
      name: 'Ventricular Tachycardia (V-TACH)',
      desc: 'Lethal monomorphic arrhythmia at 185 BPM requiring shock',
      rhythm: 'VTACH' as RhythmType,
      hr: 185,
      spo2: 86,
      respRate: 28,
      status: 'critical' as const,
      alarmMessage: 'LETHAL VENTRICULAR TACHYCARDIA (CRISIS)',
      color: '#ef4444',
      badge: 'CRISIS',
    },
    {
      id: 'leadoff',
      name: 'Lead Detached / Sensor Fault',
      desc: 'High-frequency 60Hz hum artifact, leads off sensor alert',
      rhythm: 'LEAD_OFF' as RhythmType,
      hr: 0,
      spo2: 98,
      respRate: 14,
      status: 'caution' as const,
      alarmMessage: 'ELECTRODE LEAD II DETACHED',
      color: '#f59e0b',
      badge: 'TECHNICAL',
    },
    {
      id: 'hypoxia',
      name: 'Acute Hypoxia / Desaturation',
      desc: 'SpO2 drops to 84%, audio pulse tone pitch plummets',
      rhythm: 'NSR' as RhythmType,
      hr: 110,
      spo2: 84,
      respRate: 30,
      status: 'critical' as const,
      alarmMessage: 'SEVERE DESATURATION SpO2 < 90%',
      color: '#ef4444',
      badge: 'CRISIS',
    },
    {
      id: 'asystole',
      name: 'Ventricular Asystole (Flatline)',
      desc: 'Cardiac standstill, immediate resuscitation code activation',
      rhythm: 'ASYSTOLE' as RhythmType,
      hr: 0,
      spo2: 70,
      respRate: 0,
      status: 'critical' as const,
      alarmMessage: 'VENTRICULAR ASYSTOLE - CODE BLUE',
      color: '#ef4444',
      badge: 'ARREST',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-[#181B22] border border-[#2D3748] rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-3.5 bg-[#131313] border-b border-[#2D3748]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#06b6d4]" />
            <h3 className="font-mono text-sm font-bold uppercase text-[#e5e2e1]">
              ARRHYTHMIA & SCENARIO SIMULATOR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#1e222b] hover:bg-[#2d3748] text-[#86948a] hover:text-[#e5e2e1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {scenarios.map((s) => {
              const isActive = currentRhythm === s.rhythm;

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectScenario({
                      rhythm: s.rhythm,
                      hr: s.hr,
                      spo2: s.spo2,
                      respRate: s.respRate,
                      status: s.status,
                      alarmMessage: s.alarmMessage,
                    });
                  }}
                  className={`flex flex-col text-left p-3 rounded border transition-all ${
                    isActive
                      ? 'bg-[#1e222b] border-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.2)]'
                      : 'bg-[#131313] border-[#2D3748] hover:border-[#3c4a42]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#e5e2e1]">
                      {s.name}
                    </span>
                    <span
                      className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-[2px]"
                      style={{ color: s.color, backgroundColor: `${s.color}20` }}
                    >
                      {s.badge}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#86948a] leading-tight">
                    {s.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Fine-Tuning Sliders */}
          <div className="p-3 bg-[#131313] border border-[#2d3748] rounded mt-2 flex flex-col gap-3">
            <span className="font-mono text-xs font-bold text-[#bbcabf] uppercase">
              FINE HEMODYNAMIC CONTROLS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between font-mono text-xs mb-1">
                  <span className="text-[#86948a]">HEART RATE:</span>
                  <span className="text-[#22c55e] font-bold">{currentHr} BPM</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={currentHr}
                  onChange={(e) => onAdjustHr(Number(e.target.value))}
                  className="w-full accent-[#22c55e] h-1.5 bg-[#2d3748] rounded"
                />
              </div>
              <div>
                <div className="flex items-center justify-between font-mono text-xs mb-1">
                  <span className="text-[#86948a]">OXYGEN SATURATION (SpO2):</span>
                  <span className="text-[#06b6d4] font-bold">{currentSpo2}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={currentSpo2}
                  onChange={(e) => onAdjustSpo2(Number(e.target.value))}
                  className="w-full accent-[#06b6d4] h-1.5 bg-[#2d3748] rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#131313] border-t border-[#2D3748] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#10b981] text-black font-mono text-xs font-bold hover:bg-[#059669] transition-colors"
          >
            APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
