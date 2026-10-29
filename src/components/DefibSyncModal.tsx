/**
 * Synchronized Cardioversion (Defib Sync) Modal
 * Shows R-wave synchronization markers to prevent shock on T-wave (R-on-T phenomenon).
 */

import React, { useState } from 'react';
import { PatientRecord } from '../types/telemetry';
import { Zap, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DefibSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord;
  onConfirmSyncShock: (energyJoules: number) => void;
}

export const DefibSyncModal: React.FC<DefibSyncModalProps> = ({
  isOpen,
  onClose,
  patient,
  onConfirmSyncShock,
}) => {
  const [energy, setEnergy] = useState(100);
  const [isCharged, setIsCharged] = useState(false);
  const [isShockDelivered, setIsShockDelivered] = useState(false);

  if (!isOpen) return null;

  const handleCharge = () => {
    setIsCharged(true);
  };

  const handleFireShock = () => {
    setIsShockDelivered(true);
    onConfirmSyncShock(energy);
    setTimeout(() => {
      setIsShockDelivered(false);
      setIsCharged(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-[#181B22] border-2 border-[#f59e0b] rounded shadow-2xl overflow-hidden flex flex-col font-mono">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-[#f59e0b] text-black">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 fill-current" />
            <h3 className="text-sm font-bold tracking-wider uppercase">
              DEFIB SYNCHRONIZATION MODE (R-WAVE TRACKING)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black/20 text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 text-xs">
          <div className="p-3 bg-[#131313] border border-[#2d3748] rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#f59e0b]">SYNC MARKER STATUS: ARMED & LOCKED</span>
              <span className="text-[#86948a]">{patient.bed} · HR {patient.hr} BPM</span>
            </div>
            <p className="text-[#bbcabf] leading-relaxed">
              Cardiac R-wave peaks are identified by bright yellow fiducial markers. The capacitor will discharge strictly on the subsequent detected R-wave to avert lethal R-on-T ventricular fibrillation.
            </p>
          </div>

          {/* Energy Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-[#86948a] uppercase font-bold text-[11px]">
              SYNCHRONIZED ENERGY SELECTION:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 150, 200].map((j) => (
                <button
                  key={j}
                  onClick={() => {
                    setEnergy(j);
                    setIsCharged(false);
                  }}
                  className={`py-2 rounded font-bold border transition-colors ${
                    energy === j
                      ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                      : 'bg-[#1e222b] text-[#e5e2e1] border-[#2d3748] hover:border-[#f59e0b]'
                  }`}
                >
                  {j} JOULES
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {!isCharged ? (
              <button
                onClick={handleCharge}
                className="w-full py-3 rounded bg-[#1e222b] border border-[#f59e0b] text-[#f59e0b] font-bold text-sm hover:bg-[#f59e0b]/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                CHARGE DEFIBRILLATOR TO {energy}J
              </button>
            ) : (
              <button
                onClick={handleFireShock}
                disabled={isShockDelivered}
                className="w-full py-3.5 rounded bg-[#ef4444] text-white font-bold text-sm hover:bg-[#dc2626] border border-[#ef4444] transition-all flex items-center justify-center gap-2 animate-pulse shadow-[0_0_16px_#ef4444]"
              >
                <Zap className="w-5 h-5 fill-current" />
                {isShockDelivered ? 'SHOCK DELIVERED SYNCHRONOUSLY' : `DISCHARGE ${energy}J ON NEXT R-WAVE`}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#131313] border-t border-[#2D3748] flex justify-between items-center text-[11px] text-[#86948a]">
          <span>Safety interlock engaged</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#1e222b] border border-[#2d3748] text-[#bbcabf] hover:text-white"
          >
            DISARM & CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
