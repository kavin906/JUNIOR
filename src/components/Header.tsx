/**
 * Clinical Telemetry Header & Patient Clinical Ribbon
 * Adheres strictly to the Top Bar Contract (Brand - 5 Nav Links - 1 Primary Action)
 * and clinical patient telemetry telemetry status ribbon.
 */

import React from 'react';
import { PatientRecord } from '../types/telemetry';
import { Volume2, VolumeX, BellOff, Activity, ShieldAlert, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeScreen: 'primary' | 'ward' | 'ecg12' | 'limits' | 'history';
  onSelectScreen: (screen: 'primary' | 'ward' | 'ecg12' | 'limits' | 'history') => void;
  activePatient: PatientRecord;
  silenceSecondsRemaining: number;
  onSilenceAlarms: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenSimulation: () => void;
  onOpenCodeBlue: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onSelectScreen,
  activePatient,
  silenceSecondsRemaining,
  onSilenceAlarms,
  isAudioEnabled,
  onToggleAudio,
  onOpenSimulation,
  onOpenCodeBlue,
}) => {
  const isSilenced = silenceSecondsRemaining > 0;

  return (
    <header className="w-full bg-[#131313] border-b border-[#2D3748] sticky top-0 z-30 select-none">
      {/* Zone 1, 2, 3: Strict Top Bar Contract */}
      <div className="flex items-center justify-between gap-6 px-4 py-2.5 max-w-[1600px] mx-auto">
        {/* Zone 1: Brand Title (Single line wordmark) */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981]">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-mono text-base font-bold tracking-tight text-[#e5e2e1]">
            CLINICAL TELEMETRY
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] text-[#86948a] uppercase tracking-wider px-1.5 py-0.5 bg-[#181b22] border border-[#2d3748] rounded-[2px]">
            REV-4.2 ICU
          </span>
        </div>

        {/* Zone 2: Nav Links (Clean single-line text links) */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-mono font-medium text-[#bbcabf]">
          <button
            onClick={() => onSelectScreen('primary')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeScreen === 'primary'
                ? 'text-[#4edea3] border-[#4edea3] font-semibold'
                : 'text-[#bbcabf] border-transparent hover:text-[#e5e2e1]'
            }`}
          >
            Primary Monitor
          </button>
          <button
            onClick={() => onSelectScreen('ward')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeScreen === 'ward'
                ? 'text-[#4edea3] border-[#4edea3] font-semibold'
                : 'text-[#bbcabf] border-transparent hover:text-[#e5e2e1]'
            }`}
          >
            Central Ward
          </button>
          <button
            onClick={() => onSelectScreen('ecg12')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeScreen === 'ecg12'
                ? 'text-[#4edea3] border-[#4edea3] font-semibold'
                : 'text-[#bbcabf] border-transparent hover:text-[#e5e2e1]'
            }`}
          >
            12-Lead Diagnostic
          </button>
          <button
            onClick={() => onSelectScreen('limits')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeScreen === 'limits'
                ? 'text-[#4edea3] border-[#4edea3] font-semibold'
                : 'text-[#bbcabf] border-transparent hover:text-[#e5e2e1]'
            }`}
          >
            Alarm Limits
          </button>
          <button
            onClick={() => onSelectScreen('history')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeScreen === 'history'
                ? 'text-[#4edea3] border-[#4edea3] font-semibold'
                : 'text-[#bbcabf] border-transparent hover:text-[#e5e2e1]'
            }`}
          >
            Event History
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audio Chime Mute/Unmute */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono text-xs font-semibold border transition-colors ${
              isAudioEnabled
                ? 'bg-[#181B22] border-[#2D3748] text-[#10b981] hover:border-[#10b981]'
                : 'bg-[#181B22] border-[#ef4444]/40 text-[#86948a] hover:text-[#e5e2e1]'
            }`}
            title={isAudioEnabled ? 'Audio tones enabled' : 'Audio muted - click to enable QRS pulse tones'}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAudioEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          {/* Arrhythmia Simulation Drawer Trigger */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1e222b] border border-[#2d3748] hover:border-[#06b6d4] font-mono text-xs text-[#06b6d4] font-semibold transition-colors"
            title="Inject clinical arrhythmias and sensor faults"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">SIMULATE RHYTHM</span>
          </button>

          {/* Primary Action Button: Silence Alarm (120s) */}
          <button
            onClick={onSilenceAlarms}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all min-h-[38px] ${
              isSilenced
                ? 'bg-[#f59e0b] text-[#121212] border border-[#f59e0b]'
                : 'bg-[#1E222B] text-[#e5e2e1] border border-[#2D3748] hover:border-[#ef4444] hover:text-[#ef4444]'
            }`}
          >
            <BellOff className="w-4 h-4 shrink-0" />
            <span>{isSilenced ? `SILENCED (${silenceSecondsRemaining}s)` : 'SILENCE ALARMS'}</span>
          </button>
        </div>
      </div>

      {/* Patient Clinical Telemetry Ribbon */}
      <div className="bg-[#181B22] border-t border-[#2D3748]/70 px-4 py-1.5 text-xs">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
          {/* Bed & Patient Demographics */}
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded-[2px] border border-[#10b981]/30">
              {activePatient.bed}
            </span>
            <span className="font-semibold text-[#e5e2e1]">
              {activePatient.name}
            </span>
            <span className="text-[#86948a] font-mono">
              {activePatient.age}{activePatient.gender} · {activePatient.mrn}
            </span>
            <span className="hidden sm:inline font-mono text-[11px] px-1.5 py-0.2 bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 rounded-[2px] font-bold">
              {activePatient.codeStatus}
            </span>
          </div>

          {/* Clinical Context */}
          <div className="hidden md:flex items-center gap-2 text-[#bbcabf] font-mono text-[11px]">
            <span className="text-[#86948a]">DX:</span>
            <span className="text-[#e5e2e1] truncate max-w-xs">{activePatient.diagnosis}</span>
            <span className="text-[#3c4a42]">·</span>
            <span className="text-[#86948a]">ATTN:</span>
            <span className="truncate max-w-[140px]">{activePatient.attending}</span>
          </div>

          {/* Telemetry Hardware Stats */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#86948a]">
            {activePatient.pacer && (
              <span className="text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-1 py-0.2 rounded-[2px]">
                PACER ACTIVE
              </span>
            )}
            <span>BATT {activePatient.batteryPct}%</span>
            <span>RF {activePatient.rfSignalBars}/5</span>
            <span className="text-[#10b981]">SWEEP 25mm/s</span>

            {/* Quick emergency override button in ribbon */}
            <button
              onClick={onOpenCodeBlue}
              className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#ef4444] text-white font-bold text-[10px] hover:bg-[#dc2626] transition-colors"
            >
              <ShieldAlert className="w-3 h-3" />
              CODE BLUE
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Screen Selector (when md nav is hidden) */}
      <div className="flex md:hidden border-t border-[#2D3748] px-2 py-1 gap-1 overflow-x-auto text-[11px] font-mono">
        {(['primary', 'ward', 'ecg12', 'limits', 'history'] as const).map((screen) => (
          <button
            key={screen}
            onClick={() => onSelectScreen(screen)}
            className={`px-2 py-1 rounded whitespace-nowrap uppercase ${
              activeScreen === screen
                ? 'bg-[#10b981] text-black font-bold'
                : 'bg-[#181B22] text-[#86948a]'
            }`}
          >
            {screen === 'ecg12' ? '12-Lead' : screen}
          </button>
        ))}
      </div>
    </header>
  );
};
