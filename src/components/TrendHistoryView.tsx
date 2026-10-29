/**
 * Screen 5: Physiological Trend Analysis & Clinical Event Log
 * Displays multi-hour time-series trends (1h/8h/24h), dual-axis graphs,
 * and comprehensive audit logs of all arrhythmia alerts and clinical markers.
 */

import React, { useState } from 'react';
import { AlarmEvent, PatientRecord } from '../types/telemetry';
import { Clock, ShieldAlert, AlertTriangle, Info, Check, Plus, Filter, Download } from 'lucide-react';

interface TrendHistoryViewProps {
  patient: PatientRecord;
  events: AlarmEvent[];
  onAcknowledgeEvent: (eventId: string) => void;
  onAddNote: (eventId: string, note: string) => void;
}

export const TrendHistoryView: React.FC<TrendHistoryViewProps> = ({
  patient,
  events,
  onAcknowledgeEvent,
  onAddNote,
}) => {
  const [timeframe, setTimeframe] = useState<'1h' | '8h' | '24h'>('8h');
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'CRISIS' | 'WARNING'>('ALL');
  const [activeNoteEventId, setActiveNoteEventId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  // Synthetic trend time-series data for the selected timeframe
  const pointsCount = timeframe === '1h' ? 24 : timeframe === '8h' ? 48 : 72;
  const trendPoints = Array.from({ length: pointsCount }, (_, i) => {
    const fraction = i / (pointsCount - 1);
    // Baseline heart rate ~74 with gentle variation
    const hr = Math.round(72 + Math.sin(fraction * 6) * 8 + Math.cos(fraction * 14) * 4);
    const spo2 = Math.round(98 - (fraction > 0.6 && fraction < 0.75 ? 5 : 0) + Math.sin(fraction * 10) * 0.8);
    const map = Math.round(92 + Math.sin(fraction * 4) * 6);
    return { index: i, hr, spo2, map };
  });

  const filteredEvents = events.filter((e) => {
    if (filterPriority === 'ALL') return true;
    return e.priority === filterPriority;
  });

  const handleSaveNote = (id: string) => {
    if (noteInput.trim()) {
      onAddNote(id, noteInput.trim());
      setNoteInput('');
      setActiveNoteEventId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1600px] mx-auto w-full">
      {/* Top Banner: Trend Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#181B22] border border-[#2D3748] rounded">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-[2px] bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/40">
              PHYSIOLOGICAL TRENDS & EVENT LOG
            </span>
            <span className="font-mono text-xs text-[#86948a]">
              {patient.bed} · {patient.name} ({patient.mrn})
            </span>
          </div>
          <p className="font-mono text-xs text-[#bbcabf] mt-1">
            Continuous retrospective data buffer for telemetry arrhythmia review and intervention audit.
          </p>
        </div>

        {/* Timeframe Segment Control */}
        <div className="flex items-center bg-[#1e222b] p-0.5 rounded border border-[#2d3748] font-mono text-xs">
          {(['1h', '8h', '24h'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded transition-colors uppercase ${
                timeframe === tf
                  ? 'bg-[#4edea3] text-black font-bold'
                  : 'text-[#86948a] hover:text-[#e5e2e1]'
              }`}
            >
              {tf} Window
            </button>
          ))}
        </div>
      </div>

      {/* Dual-Axis Trend Graph Area */}
      <div className="p-4 bg-[#181B22] border border-[#2D3748] rounded flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#22c55e]" />
              <span className="text-[#22c55e] font-semibold">HR (BPM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#06b6d4]" />
              <span className="text-[#06b6d4] font-semibold">SpO2 (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#ff7a73]" />
              <span className="text-[#ff7a73] font-semibold">MAP (mmHg)</span>
            </div>
          </div>
          <span className="font-mono text-xs text-[#86948a]">
            WINDOW: PAST {timeframe.toUpperCase()}
          </span>
        </div>

        {/* SVG Trend Curves */}
        <div className="relative h-56 bg-[#121212] border border-[#2d3748] rounded p-2 overflow-hidden">
          <div className="absolute inset-0 medical-grid opacity-60" />

          {/* SVG Graphs */}
          <svg className="w-full h-full relative z-10" viewBox="0 0 800 180" preserveAspectRatio="none">
            {/* Horizontal Grid Guides */}
            <line x1="0" y1="36" x2="800" y2="36" stroke="#2d3748" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="90" x2="800" y2="90" stroke="#2d3748" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="144" x2="800" y2="144" stroke="#2d3748" strokeWidth="0.5" strokeDasharray="3 3" />

            {/* HR Path (Green) */}
            <path
              d={trendPoints.reduce((acc, p, i) => {
                const x = (i / (pointsCount - 1)) * 800;
                // HR scale: 40 to 140 bpm -> 160 to 20 px
                const y = 180 - ((p.hr - 40) / 100) * 150;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.0"
            />

            {/* SpO2 Path (Cyan) */}
            <path
              d={trendPoints.reduce((acc, p, i) => {
                const x = (i / (pointsCount - 1)) * 800;
                // SpO2 scale: 80 to 100% -> 170 to 30 px
                const y = 180 - ((p.spo2 - 80) / 20) * 150;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.8"
            />

            {/* MAP Path (Coral) */}
            <path
              d={trendPoints.reduce((acc, p, i) => {
                const x = (i / (pointsCount - 1)) * 800;
                // MAP scale: 50 to 130 mmHg -> 160 to 30 px
                const y = 180 - ((p.map - 50) / 80) * 140;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#FF7A73"
              strokeWidth="1.6"
              strokeDasharray="4 2"
            />
          </svg>
        </div>

        {/* Current Trend Averages */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-2 bg-[#1e222b] rounded border border-[#2d3748]">
            <span className="text-[#86948a] text-[10px] uppercase block">HR MEAN / RANGE</span>
            <span className="text-sm font-bold text-[#22c55e]">74 BPM (64 - 86)</span>
          </div>
          <div className="p-2 bg-[#1e222b] rounded border border-[#2d3748]">
            <span className="text-[#86948a] text-[10px] uppercase block">SpO2 MEAN / MIN</span>
            <span className="text-sm font-bold text-[#06b6d4]">98.2% (93% min)</span>
          </div>
          <div className="p-2 bg-[#1e222b] rounded border border-[#2d3748]">
            <span className="text-[#86948a] text-[10px] uppercase block">MAP MEAN / STABILITY</span>
            <span className="text-sm font-bold text-[#ff7a73]">92 mmHg (STABLE)</span>
          </div>
        </div>
      </div>

      {/* Clinical Event Log Table */}
      <div className="p-4 bg-[#181B22] border border-[#2D3748] rounded flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4edea3]" />
            <h3 className="font-mono text-xs font-bold uppercase text-[#e5e2e1]">
              TELEMETRY EVENT & ARREST AUDIT TRAIL
            </h3>
          </div>

          {/* Filter Priority */}
          <div className="flex items-center gap-1 bg-[#1e222b] p-0.5 rounded border border-[#2d3748] font-mono text-xs">
            <span className="text-[#86948a] px-2 text-[10px]">FILTER:</span>
            {(['ALL', 'CRISIS', 'WARNING'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2 py-0.5 rounded transition-colors text-[11px] ${
                  filterPriority === p ? 'bg-[#4edea3] text-black font-bold' : 'text-[#bbcabf]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Events */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#2d3748] text-[#86948a] text-[11px] uppercase">
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Priority</th>
                <th className="py-2 px-3">Bed / Patient</th>
                <th className="py-2 px-3">Parameter</th>
                <th className="py-2 px-3">Recorded Value</th>
                <th className="py-2 px-3">Event Detail</th>
                <th className="py-2 px-3">Clinical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3748]/50">
              {filteredEvents.map((evt) => {
                const isCrisis = evt.priority === 'CRISIS';
                const isWarning = evt.priority === 'WARNING';

                return (
                  <tr key={evt.id} className="hover:bg-[#1e222b]/50 transition-colors">
                    <td className="py-2.5 px-3 text-[#e5e2e1] whitespace-nowrap font-bold">
                      {evt.timestamp}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-[2px] font-bold text-[10px] ${
                          isCrisis
                            ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                            : isWarning
                            ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                            : 'bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/40'
                        }`}
                      >
                        {evt.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-[#e5e2e1]">{evt.bed}</span>
                      <span className="text-[#86948a] ml-1.5">({evt.patientName})</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#4edea3]">
                      {evt.parameter}
                    </td>
                    <td className="py-2.5 px-3 text-[#e5e2e1] font-bold">
                      {evt.valueRecorded}
                    </td>
                    <td className="py-2.5 px-3 text-[#bbcabf] max-w-xs">
                      <div>{evt.message}</div>
                      {evt.notes && (
                        <div className="text-[10px] text-[#4edea3] mt-0.5 italic">
                          Note: {evt.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onAcknowledgeEvent(evt.id)}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                            evt.acknowledged
                              ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                              : 'bg-[#1e222b] text-[#f59e0b] border border-[#f59e0b] hover:bg-[#f59e0b]/20'
                          }`}
                        >
                          {evt.acknowledged ? 'ACKED' : 'ACKNOWLEDGE'}
                        </button>
                        <button
                          onClick={() => {
                            setActiveNoteEventId(evt.id);
                            setNoteInput(evt.notes || '');
                          }}
                          className="px-2 py-1 rounded bg-[#1e222b] border border-[#2d3748] hover:border-[#4edea3] text-[#bbcabf] text-[11px]"
                        >
                          + NOTE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal / Inset for adding note */}
        {activeNoteEventId && (
          <div className="mt-3 p-3 bg-[#1e222b] border border-[#4edea3] rounded flex flex-col gap-2">
            <span className="font-mono text-xs font-bold text-[#4edea3]">
              ADD CLINICIAN INTERVENTION NOTE
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Physician notified, 12-lead ECG confirmed, medication administered..."
                className="flex-1 bg-[#121212] border border-[#2d3748] rounded px-3 py-1.5 font-mono text-xs text-[#e5e2e1] focus:border-[#4edea3] outline-none"
              />
              <button
                onClick={() => handleSaveNote(activeNoteEventId)}
                className="px-4 py-1.5 bg-[#4edea3] text-black font-mono text-xs font-bold rounded"
              >
                SAVE NOTE
              </button>
              <button
                onClick={() => setActiveNoteEventId(null)}
                className="px-3 py-1.5 bg-[#121212] text-[#86948a] font-mono text-xs rounded border border-[#2d3748]"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
