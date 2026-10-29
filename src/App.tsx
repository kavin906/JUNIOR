/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PatientRecord, RhythmType, AlarmEvent } from './types/telemetry';
import { WaveformGenerator } from './services/waveformGenerator';
import { soundEngine } from './services/soundEngine';
import { INITIAL_PATIENTS, INITIAL_ALARM_EVENTS } from './services/patientStore';
import { Header } from './components/Header';
import { PrimaryConsole } from './components/PrimaryConsole';
import { MultiBedWard } from './components/MultiBedWard';
import { TwelveLeadView } from './components/TwelveLeadView';
import { AlarmLimitsManager } from './components/AlarmLimitsManager';
import { TrendHistoryView } from './components/TrendHistoryView';
import { SimulationDrawer } from './components/SimulationDrawer';
import { CodeBlueModal } from './components/CodeBlueModal';
import { DefibSyncModal } from './components/DefibSyncModal';

export default function App() {
  // Navigation Screen
  const [activeScreen, setActiveScreen] = useState<'primary' | 'ward' | 'ecg12' | 'limits' | 'history'>('primary');

  // Patients Database
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>('bed-04'); // Bed 04 Eleanor Chen default

  // Alarm Events
  const [events, setEvents] = useState<AlarmEvent[]>(INITIAL_ALARM_EVENTS);

  // Audio State & Silence Timer
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [silenceSecondsRemaining, setSilenceSecondsRemaining] = useState<number>(0);

  // Modals & Drawers
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [isCodeBlueOpen, setIsCodeBlueOpen] = useState<boolean>(false);
  const [isDefibSyncOpen, setIsDefibSyncOpen] = useState<boolean>(false);

  // Real-Time Waveform Buffers
  const BUFFER_SIZE = 340;
  const [dataLead2, setDataLead2] = useState<number[]>(() => new Array(BUFFER_SIZE).fill(0));
  const [dataLeadV5, setDataLeadV5] = useState<number[]>(() => new Array(BUFFER_SIZE).fill(0));
  const [dataPleth, setDataPleth] = useState<number[]>(() => new Array(BUFFER_SIZE).fill(0));
  const [dataEtco2, setDataEtco2] = useState<number[]>(() => new Array(BUFFER_SIZE).fill(0));
  const [dataAbp, setDataAbp] = useState<number[]>(() => new Array(BUFFER_SIZE).fill(80));

  const [sweepHead, setSweepHead] = useState<number>(0);
  const [isRPeak, setIsRPeak] = useState<boolean>(false);

  // Waveform Generator Engine
  const generatorRef = useRef<WaveformGenerator>(new WaveformGenerator());
  const sweepIndexRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const alarmSoundTimerRef = useRef<number>(0);

  // Active Patient lookup
  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  // Real-Time Simulation Loop
  useEffect(() => {
    let accumulator = 0;
    const sampleRateDt = 0.016; // ~60fps simulation rate

    const tick = (time: number) => {
      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      accumulator += delta;

      let rPeakTriggered = false;

      while (accumulator >= sampleRateDt) {
        accumulator -= sampleRateDt;

        // Generate sample for active patient
        const sample = generatorRef.current.step(
          sampleRateDt,
          activePatient.hr,
          activePatient.respRate,
          activePatient.rhythm,
          activePatient.spo2,
          activePatient.etco2,
          activePatient.bpSystolic,
          activePatient.bpDiastolic
        );

        if (sample.isRPeak) {
          rPeakTriggered = true;
          // Play physiological pulse tone
          soundEngine.playHeartbeatBeep(activePatient.spo2);
        }

        // Advance circular sweep buffer index
        const idx = sweepIndexRef.current;
        setDataLead2((prev) => {
          const next = [...prev];
          next[idx] = sample.ecgLead2;
          return next;
        });
        setDataLeadV5((prev) => {
          const next = [...prev];
          next[idx] = sample.ecgLeadV5;
          return next;
        });
        setDataPleth((prev) => {
          const next = [...prev];
          next[idx] = sample.pleth;
          return next;
        });
        setDataEtco2((prev) => {
          const next = [...prev];
          next[idx] = sample.etco2 / 40; // Normalize for canvas height
          return next;
        });
        setDataAbp((prev) => {
          const next = [...prev];
          next[idx] = (sample.abp - 80) / 70; // Normalize
          return next;
        });

        sweepIndexRef.current = (idx + 1) % BUFFER_SIZE;
      }

      setSweepHead(sweepIndexRef.current / BUFFER_SIZE);
      setIsRPeak(rPeakTriggered);

      // Crisis alarm sound interval check (every 4 seconds if critical and not silenced)
      if (
        activePatient.status === 'critical' &&
        isAudioEnabled &&
        silenceSecondsRemaining === 0 &&
        time - alarmSoundTimerRef.current > 4000
      ) {
        soundEngine.playCrisisAlarm();
        alarmSoundTimerRef.current = time;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activePatient, isAudioEnabled, silenceSecondsRemaining]);

  // Silence Timer Countdown (120s)
  useEffect(() => {
    if (silenceSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSilenceSecondsRemaining((prev) => {
        if (prev <= 1) {
          soundEngine.setMuted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [silenceSecondsRemaining]);

  // Silence Alarms Handler
  const handleSilenceAlarms = () => {
    if (silenceSecondsRemaining > 0) {
      // Toggle un-silence
      setSilenceSecondsRemaining(0);
      soundEngine.setMuted(false);
    } else {
      setSilenceSecondsRemaining(120);
      soundEngine.setMuted(true);
    }
  };

  // Toggle Audio
  const handleToggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    soundEngine.setAudioEnabled(nextState);
  };

  // Add Event Bookmark
  const handleAddEventBookmark = (note: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newEvent: AlarmEvent = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      bed: activePatient.bed,
      patientName: activePatient.name,
      priority: activePatient.status === 'critical' ? 'CRISIS' : 'ADVISORY',
      parameter: 'CLINICAL MARKER',
      message: note,
      valueRecorded: `${activePatient.hr} BPM`,
      acknowledged: true,
      notes: note,
    };

    setEvents((prev) => [newEvent, ...prev]);
  };

  // Acknowledge Alarm on Ward Bed
  const handleAcknowledgeAlarm = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            activeAlarmMessage: undefined,
            status: p.status === 'critical' ? 'caution' : 'normal',
          };
        }
        return p;
      })
    );
  };

  // Acknowledge Event in Table
  const handleAcknowledgeEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return { ...e, acknowledged: true };
        }
        return e;
      })
    );
  };

  // Add Note to Event
  const handleAddNoteToEvent = (eventId: string, note: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return { ...e, notes: note };
        }
        return e;
      })
    );
  };

  // Apply Simulation Scenario to Active Patient
  const handleSelectScenario = (scenario: {
    rhythm: RhythmType;
    hr: number;
    spo2: number;
    respRate: number;
    status: 'normal' | 'caution' | 'critical';
    alarmMessage?: string;
  }) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            rhythm: scenario.rhythm,
            hr: scenario.hr,
            spo2: scenario.spo2,
            respRate: scenario.respRate,
            status: scenario.status,
            activeAlarmMessage: scenario.alarmMessage,
          };
        }
        return p;
      })
    );

    if (scenario.alarmMessage) {
      handleAddEventBookmark(`Simulated event: ${scenario.alarmMessage}`);
    }
  };

  // Fine adjustments
  const handleAdjustHr = (hr: number) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, hr } : p))
    );
  };

  const handleAdjustSpo2 = (spo2: number) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, spo2 } : p))
    );
  };

  // Defibrillator shock delivery action
  const handleDeliverShock = (joules: number) => {
    // Shocks convert acute lethal rhythms back to NSR
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            rhythm: 'NSR',
            hr: 76,
            spo2: 98,
            status: 'normal',
            activeAlarmMessage: undefined,
          };
        }
        return p;
      })
    );

    handleAddEventBookmark(`Defibrillation ${joules}J delivered: Rhythm converted to NSR`);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#e5e2e1] flex flex-col selection:bg-[#4edea3]/20 selection:text-[#4edea3]">
      {/* Strict Top Bar Contract Header & Clinical Patient Ribbon */}
      <Header
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        activePatient={activePatient}
        silenceSecondsRemaining={silenceSecondsRemaining}
        onSilenceAlarms={handleSilenceAlarms}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenCodeBlue={() => setIsCodeBlueOpen(true)}
      />

      {/* Screen Views */}
      <main className="flex-1 flex flex-col pb-6">
        {activeScreen === 'primary' && (
          <PrimaryConsole
            patient={activePatient}
            dataLead2={dataLead2}
            dataLeadV5={dataLeadV5}
            dataPleth={dataPleth}
            dataEtco2={dataEtco2}
            dataAbp={dataAbp}
            sweepHead={sweepHead}
            isRPeak={isRPeak}
            onOpenLimits={() => setActiveScreen('limits')}
            onCaptureEcg={() => setActiveScreen('ecg12')}
            onAddEventBookmark={handleAddEventBookmark}
            onTriggerDefibSync={() => setIsDefibSyncOpen(true)}
            onOpenCodeBlue={() => setIsCodeBlueOpen(true)}
          />
        )}

        {activeScreen === 'ward' && (
          <MultiBedWard
            patients={patients}
            activePatientId={activePatient.id}
            onSelectPatient={(id) => {
              setActivePatientId(id);
              setActiveScreen('primary');
            }}
            onAcknowledgeAlarm={handleAcknowledgeAlarm}
          />
        )}

        {activeScreen === 'ecg12' && (
          <TwelveLeadView patient={activePatient} />
        )}

        {activeScreen === 'limits' && (
          <AlarmLimitsManager
            patient={activePatient}
            onUpdatePatientLimits={(newLimits) => {
              handleAddEventBookmark(
                `Alarm limits updated: HR (${newLimits.hr.low}-${newLimits.hr.high}), SpO2 (${newLimits.spo2.low}%)`
              );
            }}
            onClose={() => setActiveScreen('primary')}
          />
        )}

        {activeScreen === 'history' && (
          <TrendHistoryView
            patient={activePatient}
            events={events}
            onAcknowledgeEvent={handleAcknowledgeEvent}
            onAddNote={handleAddNoteToEvent}
          />
        )}
      </main>

      {/* Arrhythmia Simulation Modal */}
      <SimulationDrawer
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        currentRhythm={activePatient.rhythm}
        currentHr={activePatient.hr}
        currentSpo2={activePatient.spo2}
        onSelectScenario={handleSelectScenario}
        onAdjustHr={handleAdjustHr}
        onAdjustSpo2={handleAdjustSpo2}
      />

      {/* Code Blue CPR Resuscitation Modal */}
      <CodeBlueModal
        isOpen={isCodeBlueOpen}
        onClose={() => setIsCodeBlueOpen(false)}
        patient={activePatient}
        onDeliverShock={handleDeliverShock}
      />

      {/* Synchronized Cardioversion Defib Modal */}
      <DefibSyncModal
        isOpen={isDefibSyncOpen}
        onClose={() => setIsDefibSyncOpen(false)}
        patient={activePatient}
        onConfirmSyncShock={handleDeliverShock}
      />
    </div>
  );
}
