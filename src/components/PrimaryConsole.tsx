/**
 * Screen 1: Primary ICU Telemetry Console
 * Renders multi-channel sweeping oscilloscope traces paired with quantitative metric blocks,
 * clinical control tray, alarm banners, and live diagnostic tools.
 */

import React, { useState } from 'react';
import { PatientRecord } from '../types/telemetry';
import { OscilloscopeCanvas } from './OscilloscopeCanvas';
import { VitalMetricBlock } from './VitalMetricBlock';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Bookmark, 
  Zap, 
  AlertTriangle, 
  Camera, 
  SlidersHorizontal,
  Gauge
} from 'lucide-react';

interface PrimaryConsoleProps {
  patient: PatientRecord;
  dataLead2: number[];
  dataLeadV5: number[];
  dataPleth: number[];
  dataEtco2: number[];
  dataAbp: number[];
  sweepHead: number;
  isRPeak: boolean;
  onOpenLimits: () => void;
  onCaptureEcg: () => void;
  onAddEventBookmark: (note: string) => void;
  onTriggerDefibSync: () => void;
  onOpenCodeBlue: () => void;
}

export const PrimaryConsole: React.FC<PrimaryConsoleProps> = ({
  patient,
  dataLead2,
  dataLeadV5,
  dataPleth,
  dataEtco2,
  dataAbp,
  sweepHead,
  isRPeak,
  onOpenLimits,
  onCaptureEcg,
  onAddEventBookmark,
  onTriggerDefibSync,
  onOpenCodeBlue,
}) => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [sweepSpeed, setSweepSpeed] = useState<'12.5' | '25' | '50'>('25');
  const [isNIBPCycling, setIsNIBPCycling] = useState(false);
  const [nibpCuffPressure, setNibpCuffPressure] = useState(0);
  const [bookmarkSuccess, setBookmarkSuccess] = useState(false);

  // Trigger stat NIBP cycling
  const handleStartNibpCycle = () => {
    if (isNIBPCycling) return;
    setIsNIBPCycling(true);
    setNibpCuffPressure(160);

    const interval = setInterval(() => {
      setNibpCuffPressure((prev) => {
        if (prev <= 70) {
          clearInterval(interval);
          setIsNIBPCycling(false);
          return 0;
        }
        return prev - 15;
      });
    }, 400);
  };

  const handleAddMarker = () => {
    onAddEventBookmark(`Clinical event marked at bedside: Patient stable, NSR, HR ${patient.hr}`);
    setBookmarkSuccess(true);
    setTimeout(() => setBookmarkSuccess(false), 2000);
  };

  const isHrAlarm = patient.status === 'critical' || patient.hr < 50 || patient.hr > 120;
  const isSpo2Alarm = patient.spo2 < 92;

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1600px] mx-auto w-full">
      {/* Active Alarm Announcement Banner (if any) */}
      {patient.activeAlarmMessage && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#ef4444]/20 border border-[#ef4444] rounded text-xs font-mono text-[#ef4444] animate-critical-flash">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-bold uppercase tracking-wider">
              CRITICAL ALARM: {patient.activeAlarmMessage}
            </span>
          </div>
          <span className="text-[#ffdad6] font-bold">
            CHECK PATIENT · {patient.bed}
          </span>
        </div>
      )}

      {/* Main 5-Channel Telemetry Grid: 3:1 width split between active trace and numerical readout */}
      <div className="flex flex-col gap-2.5">
        {/* Channel 1: Lead II ECG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
          <div className="lg:col-span-9 h-full">
            <OscilloscopeCanvas
              label="LEAD II"
              subLabel={patient.rhythm}
              leadScale="1mV / 10mm"
              strokeColor="#22C55E"
              dataHistory={dataLead2}
              sweepHead={sweepHead}
              height={115}
              isFrozen={isFrozen}
              isAlarming={isHrAlarm}
            />
          </div>
          <div className="lg:col-span-3 h-full">
            <VitalMetricBlock
              label="HR"
              unit="BPM"
              value={patient.hr}
              status={isHrAlarm ? 'critical' : patient.status}
              accentColor="#22C55E"
              lowLimit={50}
              highLimit={120}
              trend="stable"
              isPulsing={isRPeak}
              onClickLimits={onOpenLimits}
            />
          </div>
        </div>

        {/* Channel 2: Lead V5 ECG (Secondary Vector) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
          <div className="lg:col-span-9 h-full">
            <OscilloscopeCanvas
              label="LEAD V5"
              subLabel="DIAGNOSTIC ST"
              leadScale="1mV / 10mm"
              strokeColor="#A3E635"
              dataHistory={dataLeadV5}
              sweepHead={sweepHead}
              height={95}
              isFrozen={isFrozen}
              isAlarming={false}
            />
          </div>
          <div className="lg:col-span-3 h-full">
            <VitalMetricBlock
              label="ST-DEV"
              unit="MM"
              value="+0.4"
              secondaryValue="NORMAL"
              secondaryLabel="VECTOR"
              status="normal"
              accentColor="#A3E635"
              lowLimit={-1.0}
              highLimit={1.0}
              displaySize="md"
              onClickLimits={onOpenLimits}
            />
          </div>
        </div>

        {/* Channel 3: Plethysmograph (SpO2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
          <div className="lg:col-span-9 h-full">
            <OscilloscopeCanvas
              label="PLETH"
              subLabel="PULSE OXIMETRY"
              leadScale="AUTO-GAIN"
              strokeColor="#06B6D4"
              dataHistory={dataPleth}
              sweepHead={sweepHead}
              height={100}
              isFrozen={isFrozen}
              isAlarming={isSpo2Alarm}
            />
          </div>
          <div className="lg:col-span-3 h-full">
            <VitalMetricBlock
              label="SpO2"
              unit="%"
              value={patient.spo2}
              secondaryValue="2.6"
              secondaryLabel="PI%"
              status={isSpo2Alarm ? 'critical' : 'normal'}
              accentColor="#06B6D4"
              lowLimit={90}
              highLimit={100}
              trend="stable"
              isPulsing={isRPeak}
              onClickLimits={onOpenLimits}
            />
          </div>
        </div>

        {/* Channel 4: Capnography / Respiration (EtCO2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
          <div className="lg:col-span-9 h-full">
            <OscilloscopeCanvas
              label="CO2"
              subLabel="CAPNOGRAM"
              leadScale="0 - 50 mmHg"
              strokeColor="#F59E0B"
              dataHistory={dataEtco2}
              sweepHead={sweepHead}
              height={100}
              isFrozen={isFrozen}
              isAlarming={false}
            />
          </div>
          <div className="lg:col-span-3 h-full">
            <VitalMetricBlock
              label="EtCO2"
              unit="mmHg"
              value={patient.etco2}
              secondaryValue={patient.respRate}
              secondaryLabel="RESP/MIN"
              status="normal"
              accentColor="#F59E0B"
              lowLimit={30}
              highLimit={45}
              trend="stable"
              onClickLimits={onOpenLimits}
            />
          </div>
        </div>

        {/* Channel 5: Invasive Arterial Blood Pressure (ABP / NIBP) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
          <div className="lg:col-span-9 h-full">
            <OscilloscopeCanvas
              label="ART / ABP"
              subLabel="ARTERIAL LINE"
              leadScale="0 - 200 mmHg"
              strokeColor="#FF7A73"
              dataHistory={dataAbp}
              sweepHead={sweepHead}
              height={100}
              isFrozen={isFrozen}
              isAlarming={false}
            />
          </div>
          <div className="lg:col-span-3 h-full">
            <VitalMetricBlock
              label="NIBP"
              unit="mmHg"
              value={`${patient.bpSystolic}/${patient.bpDiastolic}`}
              secondaryValue={`(${patient.bpMap})`}
              secondaryLabel="MAP"
              status={isNIBPCycling ? 'caution' : 'normal'}
              accentColor="#FF7A73"
              lowLimit={90}
              highLimit={140}
              displaySize="md"
              onClickLimits={onOpenLimits}
            />
          </div>
        </div>
      </div>

      {/* Clinical Bottom Control Tray (Minimum 48px Touch Targets per specification) */}
      <div className="bg-[#181B22] border border-[#2D3748] rounded p-2.5 mt-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Group 1: Telemetry Waveform Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFrozen(!isFrozen)}
              className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[48px] rounded font-mono text-xs font-semibold border transition-all ${
                isFrozen
                  ? 'bg-[#f59e0b] text-[#121212] border-[#f59e0b]'
                  : 'bg-[#1E222B] text-[#e5e2e1] border-[#2D3748] hover:border-[#4edea3]'
              }`}
            >
              {isFrozen ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isFrozen ? 'RESUME SWEEP' : 'FREEZE TRACE'}</span>
            </button>

            {/* Sweep Speed Selector */}
            <div className="flex items-center bg-[#1E222B] border border-[#2D3748] rounded min-h-[48px] p-1 font-mono text-xs">
              <span className="text-[10px] text-[#86948a] uppercase px-2 font-bold flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" />
                SPEED:
              </span>
              {(['12.5', '25', '50'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSweepSpeed(spd)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    sweepSpeed === spd
                      ? 'bg-[#4edea3] text-black font-bold'
                      : 'text-[#bbcabf] hover:text-white'
                  }`}
                >
                  {spd} mm/s
                </button>
              ))}
            </div>

            {/* 12-Lead Diagnostic Snapshot */}
            <button
              onClick={onCaptureEcg}
              className="flex items-center gap-2 px-3.5 py-2.5 min-h-[48px] rounded bg-[#1E222B] border border-[#2D3748] hover:border-[#06b6d4] text-[#06b6d4] font-mono text-xs font-semibold transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>12-LEAD CAPTURE</span>
            </button>
          </div>

          {/* Group 2: Diagnostic & Emergency Overrides */}
          <div className="flex items-center gap-2">
            {/* Stat NIBP Cycling */}
            <button
              onClick={handleStartNibpCycle}
              disabled={isNIBPCycling}
              className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[48px] rounded font-mono text-xs font-semibold border transition-all ${
                isNIBPCycling
                  ? 'bg-[#1E222B] border-[#06b6d4] text-[#06b6d4] animate-pulse'
                  : 'bg-[#1E222B] border-[#2D3748] hover:border-[#4edea3] text-[#e5e2e1]'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isNIBPCycling ? 'animate-spin' : ''}`} />
              <span>
                {isNIBPCycling ? `CUFF INFLATING (${nibpCuffPressure} mmHg)` : 'NIBP STAT CYCLE'}
              </span>
            </button>

            {/* Event Marker */}
            <button
              onClick={handleAddMarker}
              className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[48px] rounded font-mono text-xs font-semibold border transition-all ${
                bookmarkSuccess
                  ? 'bg-[#10b981] text-black border-[#10b981]'
                  : 'bg-[#1E222B] text-[#e5e2e1] border-[#2D3748] hover:border-[#bbcabf]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{bookmarkSuccess ? 'EVENT RECORDED' : 'EVENT MARKER'}</span>
            </button>

            {/* Alarm Thresholds */}
            <button
              onClick={onOpenLimits}
              className="flex items-center gap-2 px-3 py-2.5 min-h-[48px] rounded bg-[#1E222B] border border-[#2D3748] hover:border-[#4edea3] text-[#e5e2e1] font-mono text-xs font-semibold transition-all"
              title="Open Thresholds & Alarm Boundaries"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">LIMITS</span>
            </button>

            {/* Defib Sync Emergency Override */}
            <button
              onClick={onTriggerDefibSync}
              className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[48px] rounded bg-[#1E222B] border border-[#f59e0b] hover:bg-[#f59e0b]/20 text-[#f59e0b] font-mono text-xs font-bold transition-all"
              title="Activate R-wave synchronized cardioversion mode"
            >
              <Zap className="w-4 h-4" />
              <span>DEFIB SYNC</span>
            </button>

            {/* Code Blue Emergency Override (Solid Crimson per specification) */}
            <button
              onClick={onOpenCodeBlue}
              className="flex items-center gap-1.5 px-4 py-2.5 min-h-[48px] rounded bg-[#ef4444] text-white font-mono text-xs font-bold hover:bg-[#dc2626] border border-[#ef4444] transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>CODE BLUE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
