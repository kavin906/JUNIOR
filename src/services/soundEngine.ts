/**
 * Sound Engine for Clinical Telemetry
 * Synthesizes physiological QRS pulse beeps (pitch modulated by SpO2)
 * and IEC 60601-1-8 standard medical alarm tones using HTML5 Web Audio API.
 */

class TelemetrySoundEngine {
  private ctx: AudioContext | null = null;
  private isAudioEnabled = false;
  private isMuted = false;
  private lastBeepTime = 0;
  private alarmIntervalId: number | null = null;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setAudioEnabled(enabled: boolean) {
    this.isAudioEnabled = enabled;
    if (enabled) {
      this.init();
    }
  }

  public getAudioEnabled(): boolean {
    return this.isAudioEnabled;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a physiological QRS heartbeat blip
   * Pitch is modulated by SpO2 percentage: 880Hz (100%) -> 440Hz (85%)
   */
  public playHeartbeatBeep(spo2 = 98) {
    if (!this.isAudioEnabled || this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastBeepTime < 280) return; // Prevent double-triggering
    this.lastBeepTime = now;

    try {
      const baseFreq = 440 + ((Math.max(80, Math.min(100, spo2)) - 80) / 20) * 440;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // AudioContext error safeguard
    }
  }

  /**
   * Plays an IEC 60601-1-8 high priority crisis alarm chime burst
   */
  public playCrisisAlarm() {
    if (!this.isAudioEnabled || this.isMuted || !this.ctx) return;

    try {
      const notes = [975, 784, 659];
      notes.forEach((freq, index) => {
        const startTime = this.ctx!.currentTime + index * 0.12;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.11);
      });
    } catch {
      // AudioContext error safeguard
    }
  }
}

export const soundEngine = new TelemetrySoundEngine();
