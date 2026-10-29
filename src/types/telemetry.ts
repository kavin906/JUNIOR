/**
 * Clinical Telemetry Interface - Type Definitions
 */

export type PatientStatus = 'normal' | 'caution' | 'critical';

export type RhythmType = 
  | 'NSR'              // Normal Sinus Rhythm
  | 'BRADY'            // Sinus Bradycardia
  | 'TACHY'            // Sinus Tachycardia
  | 'PVC_BIGEMINY'     // Premature Ventricular Contractions Bigeminy
  | 'VTACH'            // Ventricular Tachycardia
  | 'AFIB'             // Atrial Fibrillation
  | 'ASYSTOLE'         // Asystole
  | 'LEAD_OFF';        // Sensor Detached / Technical Warning

export interface VitalSign {
  id: string;
  name: string;
  shortLabel: string;
  value: number;
  unit: string;
  color: string;
  status: PatientStatus;
  trend: 'up' | 'down' | 'stable';
  lowLimit: number;
  highLimit: number;
  critLowLimit: number;
  critHighLimit: number;
  secondaryValue?: string | number;
  secondaryLabel?: string;
}

export interface PatientRecord {
  id: string;
  bed: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  mrn: string;
  diagnosis: string;
  attending: string;
  admitDate: string;
  codeStatus: 'FULL CODE' | 'DNR' | 'DNI' | 'COMFORT';
  rhythm: RhythmType;
  pacer: boolean;
  batteryPct: number;
  rfSignalBars: number;
  hr: number;
  spo2: number;
  respRate: number;
  etco2: number;
  bpSystolic: number;
  bpDiastolic: number;
  bpMap: number;
  temperature: number;
  status: PatientStatus;
  activeAlarmMessage?: string;
  alarmSilencedUntil?: number;
}

export interface AlarmEvent {
  id: string;
  timestamp: string;
  bed: string;
  patientName: string;
  priority: 'CRISIS' | 'WARNING' | 'ADVISORY';
  parameter: string;
  message: string;
  valueRecorded: string;
  acknowledged: boolean;
  notes?: string;
}

export interface CaliperMeasurement {
  prIntervalMs: number;
  qrsDurationMs: number;
  qtIntervalMs: number;
  qtcIntervalMs: number;
  rrIntervalMs: number;
  stDeviationMm: Record<string, number>;
}
