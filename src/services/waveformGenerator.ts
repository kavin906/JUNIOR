/**
 * Waveform Generator for Clinical Oscilloscope
 * Computes realistic physiological signals: ECG (Lead II, Lead V5), Plethysmograph (SpO2),
 * Capnography (EtCO2), and Invasive Arterial Blood Pressure (ABP).
 */

import { RhythmType } from '../types/telemetry';

export interface WaveformSample {
  ecgLead2: number;
  ecgLeadV5: number;
  pleth: number;
  etco2: number;
  abp: number;
  isRPeak: boolean;
}

export class WaveformGenerator {
  private cardiacPhase = 0;       // 0 to 1 across heart cycle
  private respiratoryPhase = 0;   // 0 to 1 across respiratory cycle
  private lastRPeakTime = 0;
  private pvcCycleCounter = 0;
  private noiseSeed = 0;

  /**
   * Computes one time step of the physiological waveforms
   * @param dt Time delta in seconds (typically ~0.016s for 60fps)
   * @param hr Heart rate in beats per minute
   * @param rr Respiratory rate in breaths per minute
   * @param rhythm Current cardiac rhythm
   * @param spo2 Blood oxygen saturation percentage (affects pleth amplitude)
   * @param etco2 End tidal CO2 in mmHg
   * @param bpSys Systolic blood pressure in mmHg
   * @param bpDia Diastolic blood pressure in mmHg
   */
  public step(
    dt: number,
    hr: number,
    rr: number,
    rhythm: RhythmType,
    spo2 = 98,
    etco2 = 38,
    bpSys = 120,
    bpDia = 80
  ): WaveformSample {
    this.noiseSeed += 0.1;
    const randomNoise = (Math.sin(this.noiseSeed * 7.3) + Math.cos(this.noiseSeed * 13.7)) * 0.02;

    if (rhythm === 'LEAD_OFF') {
      // 60Hz AC artifact + loose lead drift
      const hum = Math.sin(this.noiseSeed * 37.7) * 0.15 + (Math.random() - 0.5) * 0.1;
      return {
        ecgLead2: hum,
        ecgLeadV5: hum * 0.8,
        pleth: 0.1 + (Math.random() - 0.5) * 0.05,
        etco2: 2 + (Math.random() - 0.5) * 2,
        abp: bpDia * 0.8,
        isRPeak: false,
      };
    }

    if (rhythm === 'ASYSTOLE') {
      return {
        ecgLead2: randomNoise * 0.5,
        ecgLeadV5: randomNoise * 0.4,
        pleth: 0.05,
        etco2: 3 + randomNoise,
        abp: 20 + randomNoise * 5,
        isRPeak: false,
      };
    }

    // Effective Heart Rate depending on rhythm
    let effectiveHr = hr;
    if (rhythm === 'BRADY') effectiveHr = Math.min(hr, 46);
    if (rhythm === 'TACHY') effectiveHr = Math.max(hr, 138);
    if (rhythm === 'VTACH') effectiveHr = 185;

    // Advance cardiac phase
    const cardiacFreq = effectiveHr / 60;
    const prevPhase = this.cardiacPhase;
    this.cardiacPhase = (this.cardiacPhase + cardiacFreq * dt) % 1.0;
    const beatRestarted = this.cardiacPhase < prevPhase;

    if (beatRestarted) {
      this.pvcCycleCounter++;
    }

    // Advance respiratory phase
    const respFreq = rr / 60;
    this.respiratoryPhase = (this.respiratoryPhase + respFreq * dt) % 1.0;

    // Check if this cycle should be a PVC (in bigeminy: every 2nd beat)
    const isPvc = rhythm === 'PVC_BIGEMINY' && this.pvcCycleCounter % 2 === 0;

    // Generate Lead II ECG
    let ecgLead2 = 0;
    let ecgLeadV5 = 0;
    let isRPeak = false;

    if (rhythm === 'VTACH') {
      // Ventricular Tachycardia: wide, rapid sinusoidal monomorphic complexes
      const vtTheta = this.cardiacPhase * Math.PI * 2;
      ecgLead2 = Math.sin(vtTheta) * 0.7 - Math.sin(vtTheta * 2) * 0.35;
      ecgLeadV5 = -Math.sin(vtTheta) * 0.6 + Math.sin(vtTheta * 2) * 0.25;
      if (this.cardiacPhase > 0.25 && this.cardiacPhase < 0.35) {
        isRPeak = true;
      }
    } else if (isPvc) {
      // Wide complex PVC with inverted T-wave
      ecgLead2 = this.computePvcSample(this.cardiacPhase);
      ecgLeadV5 = ecgLead2 * -0.7;
      if (this.cardiacPhase > 0.2 && this.cardiacPhase < 0.28) {
        isRPeak = true;
      }
    } else {
      // Normal P-Q-R-S-T morphology
      const pqrst = this.computeNormalPQRST(this.cardiacPhase);
      ecgLead2 = pqrst.lead2;
      ecgLeadV5 = pqrst.leadV5;
      isRPeak = pqrst.isR;
    }

    // Baseline wander & subtle noise
    const baselineWander = Math.sin(this.respiratoryPhase * Math.PI * 2) * 0.04;
    ecgLead2 += baselineWander + randomNoise;
    ecgLeadV5 += baselineWander * 0.7 + randomNoise;

    // Generate Plethysmograph (SpO2 Photoplethysmogram)
    // Synchronized to cardiac phase with a slight pulse transit delay (~0.12s)
    const plethDelay = 0.15;
    const plethPhase = (this.cardiacPhase - plethDelay + 1.0) % 1.0;
    const pleth = this.computePlethSample(plethPhase, spo2);

    // Generate Capnography (EtCO2)
    const etco2Wave = this.computeCapnogramSample(this.respiratoryPhase, etco2);

    // Generate Invasive Arterial Blood Pressure (ABP)
    const abpPhase = (this.cardiacPhase - 0.08 + 1.0) % 1.0;
    const abp = this.computeAbpSample(abpPhase, bpSys, bpDia);

    return {
      ecgLead2,
      ecgLeadV5,
      pleth,
      etco2: etco2Wave,
      abp,
      isRPeak,
    };
  }

  /**
   * P-Q-R-S-T synthesis using Gaussian wave components
   */
  private computeNormalPQRST(phase: number): { lead2: number; leadV5: number; isR: boolean } {
    let lead2 = 0;
    let leadV5 = 0;
    let isR = false;

    // P-wave (Atrial depolarization: ~0.10 to 0.18 phase)
    if (phase >= 0.08 && phase <= 0.18) {
      const pNorm = (phase - 0.13) / 0.035;
      const p = Math.exp(-0.5 * pNorm * pNorm) * 0.18;
      lead2 += p;
      leadV5 += p * 0.8;
    }

    // Q-wave (Septal depolarization: ~0.22 to 0.25 phase)
    if (phase >= 0.21 && phase <= 0.25) {
      const qNorm = (phase - 0.23) / 0.015;
      const q = -Math.exp(-0.5 * qNorm * qNorm) * 0.15;
      lead2 += q;
      leadV5 += q * 1.2;
    }

    // R-wave (Ventricular depolarization main vector: ~0.25 to 0.31 phase)
    if (phase >= 0.25 && phase <= 0.31) {
      const rNorm = (phase - 0.28) / 0.016;
      const r = Math.exp(-0.5 * rNorm * rNorm) * 1.15;
      lead2 += r;
      leadV5 += r * 1.35;
      if (Math.abs(phase - 0.28) < 0.01) {
        isR = true;
      }
    }

    // S-wave (Ventricular depolarization completion: ~0.31 to 0.36 phase)
    if (phase >= 0.31 && phase <= 0.36) {
      const sNorm = (phase - 0.33) / 0.018;
      const s = -Math.exp(-0.5 * sNorm * sNorm) * 0.32;
      lead2 += s;
      leadV5 += s * 0.5;
    }

    // ST segment: flat baseline (slight elevation 0.02)
    if (phase >= 0.36 && phase <= 0.44) {
      lead2 += 0.01;
      leadV5 += 0.01;
    }

    // T-wave (Ventricular repolarization: ~0.44 to 0.65 phase, asymmetric)
    if (phase >= 0.44 && phase <= 0.66) {
      const tNorm = (phase - 0.54) / 0.06;
      // Slight asymmetry
      const skew = phase > 0.54 ? 1.3 : 0.9;
      const t = Math.exp(-0.5 * Math.pow(tNorm * skew, 2)) * 0.34;
      lead2 += t;
      leadV5 += t * 0.45;
    }

    return { lead2, leadV5, isR };
  }

  /**
   * Premature Ventricular Contraction (Wide, deep, bizarre morphology)
   */
  private computePvcSample(phase: number): number {
    // PVC fires early with high-amplitude wide bifid wave and inverted T
    if (phase < 0.15) return 0;
    if (phase >= 0.15 && phase <= 0.38) {
      const norm = (phase - 0.25) / 0.055;
      return -Math.exp(-0.5 * norm * norm) * 1.35 + Math.sin((phase - 0.15) * 20) * 0.3;
    }
    if (phase > 0.38 && phase <= 0.65) {
      const tNorm = (phase - 0.50) / 0.08;
      return Math.exp(-0.5 * tNorm * tNorm) * 0.45;
    }
    return 0;
  }

  /**
   * Photoplethysmogram (Pleth) Pulse Wave
   * Anacrotic limb (systolic upstroke), dicrotic notch, and catacrotic limb
   */
  private computePlethSample(phase: number, spo2: number): number {
    const ampScale = Math.max(0.5, spo2 / 100);
    // Systolic peak
    if (phase >= 0.0 && phase <= 0.25) {
      const norm = phase / 0.25;
      return Math.sin(norm * (Math.PI / 2)) * 0.85 * ampScale;
    }
    // Dicrotic descent to notch
    if (phase > 0.25 && phase <= 0.42) {
      const decay = 1 - (phase - 0.25) / 0.17;
      return (0.45 + decay * 0.4) * ampScale;
    }
    // Dicrotic peak (aortic elastic recoil)
    if (phase > 0.42 && phase <= 0.58) {
      const notchTheta = ((phase - 0.42) / 0.16) * Math.PI;
      const secondaryRise = Math.sin(notchTheta) * 0.15;
      return (0.42 + secondaryRise) * ampScale;
    }
    // Diastolic runoff
    if (phase > 0.58 && phase <= 1.0) {
      const runoff = 1 - (phase - 0.58) / 0.42;
      return Math.pow(runoff, 1.8) * 0.42 * ampScale;
    }
    return 0;
  }

  /**
   * Capnogram (EtCO2) 4-phase wave:
   * Phase I: Inspiratory baseline (0 CO2)
   * Phase II: Expiratory upstroke
   * Phase III: Alveolar plateau
   * Phase IV: Inspiratory downstroke
   */
  private computeCapnogramSample(respPhase: number, etco2: number): number {
    // 0.0 to 0.3: Inspiration (baseline ~0 mmHg)
    if (respPhase < 0.28) {
      return 1.2 + Math.random() * 0.3;
    }
    // 0.28 to 0.40: Expiratory upstroke (Phase II)
    if (respPhase >= 0.28 && respPhase < 0.40) {
      const t = (respPhase - 0.28) / 0.12;
      return (1.2 + Math.sin(t * (Math.PI / 2)) * (etco2 - 4));
    }
    // 0.40 to 0.78: Alveolar plateau with slight upward slope (Phase III)
    if (respPhase >= 0.40 && respPhase < 0.78) {
      const t = (respPhase - 0.40) / 0.38;
      const plateau = (etco2 - 3) + t * 3.5;
      return plateau + (Math.sin(respPhase * 80) * 0.3);
    }
    // 0.78 to 0.88: Rapid inspiratory washout downstroke (Phase IV)
    if (respPhase >= 0.78 && respPhase < 0.88) {
      const t = (respPhase - 0.78) / 0.10;
      return etco2 * (1 - t) + 1.2;
    }
    // 0.88 to 1.0: Baseline
    return 1.2;
  }

  /**
   * Invasive Arterial Blood Pressure (ABP) Waveform in mmHg
   */
  private computeAbpSample(phase: number, sys: number, dia: number): number {
    const pulsePressure = sys - dia;
    if (phase < 0.15) {
      // Rapid systolic upstroke
      const t = phase / 0.15;
      return dia + Math.sin(t * (Math.PI / 2)) * pulsePressure;
    }
    if (phase >= 0.15 && phase < 0.35) {
      // Systolic decline to dicrotic notch
      const t = (phase - 0.15) / 0.20;
      return sys - t * (pulsePressure * 0.48);
    }
    if (phase >= 0.35 && phase < 0.48) {
      // Dicrotic wave / notch
      const t = (phase - 0.35) / 0.13;
      const notchBase = dia + pulsePressure * 0.52;
      const bump = Math.sin(t * Math.PI) * (pulsePressure * 0.16);
      return notchBase + bump;
    }
    // Diastolic decay
    const t = (phase - 0.48) / 0.52;
    const startVal = dia + pulsePressure * 0.48;
    return dia + (startVal - dia) * Math.exp(-t * 3.2);
  }
}
