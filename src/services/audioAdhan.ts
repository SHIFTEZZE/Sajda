/**
 * Melodious Audio Engine for Adhan & Notification Chimes
 * Features authentic recorded Madinah Haram Adhan audio playback
 * with graceful Web Audio API synthesis fallback for 100% offline reliability.
 */

class AudioAdhanEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private onEndCallback: (() => void) | null = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a gentle, resonant Victorian brass notification chime
   */
  public playNotificationChime(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Harmonic chime frequencies (warm Victorian brass chord)
      const freqs = [587.33, 880.0, 1174.66]; // D5, A5, D6 chord
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.6);
      });
    } catch (e) {
      console.warn('Notification chime error:', e);
    }
  }

  /**
   * Plays the authentic recorded Adhan audio
   * Uses /audio/adhan.mp3 (or /audio/adhan_fajr.mp3 if isFajr is true)
   * Falls back to Web Audio synthesis if audio element fails to load.
   */
  public playAdhanPreview(onEnded?: () => void, isFajr = false): void {
    if (this.isPlaying) {
      this.stop();
      return;
    }

    this.isPlaying = true;
    this.onEndCallback = onEnded || null;

    const audioPath = isFajr ? '/audio/adhan_fajr.mp3' : '/audio/adhan.mp3';
    const audio = new Audio(audioPath);
    this.currentAudio = audio;
    audio.volume = 1.0;

    audio.onended = () => {
      this.isPlaying = false;
      this.currentAudio = null;
      if (this.onEndCallback) {
        this.onEndCallback();
        this.onEndCallback = null;
      }
    };

    audio.onerror = () => {
      console.warn('Audio file playback failed, falling back to Web Audio synthesis');
      this.currentAudio = null;
      this.playSynthesizedAdhan(onEnded);
    };

    audio.play().catch((err) => {
      console.warn('Audio play was prevented or failed:', err);
      this.playSynthesizedAdhan(onEnded);
    });
  }

  /**
   * Synthesizes the Takbeer and opening notes of the Adhan in Maqam Bayati
   * when file audio is not accessible
   */
  private playSynthesizedAdhan(onEnded?: () => void): void {
    try {
      const ctx = this.getContext();
      const melody: { note: number; duration: number }[] = [
        { note: 293.66, duration: 1.2 }, // Allahu
        { note: 349.23, duration: 1.0 }, // Ak-
        { note: 392.00, duration: 2.0 }, // -bar
        { note: 0, duration: 0.6 },      // pause
        { note: 349.23, duration: 1.2 }, // Allahu
        { note: 392.00, duration: 1.1 }, // Ak-
        { note: 440.00, duration: 2.2 }, // -bar
        { note: 0, duration: 0.8 },      // pause
        { note: 392.00, duration: 1.2 }, // Ash-hadu
        { note: 349.23, duration: 1.0 }, // an la
        { note: 329.63, duration: 1.2 }, // ilaha
        { note: 293.66, duration: 2.5 }, // illallah
      ];

      let currentOffset = ctx.currentTime + 0.1;

      melody.forEach((step) => {
        if (step.note > 0) {
          const osc = ctx.createOscillator();
          const oscHarmonic = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          oscHarmonic.type = 'triangle';

          osc.frequency.setValueAtTime(step.note, currentOffset);
          oscHarmonic.frequency.setValueAtTime(step.note * 2, currentOffset);

          const vibrato = ctx.createOscillator();
          const vibratoGain = ctx.createGain();
          vibrato.frequency.value = 5.0;
          vibratoGain.gain.value = 3.5;
          vibrato.connect(osc.frequency);
          vibrato.start(currentOffset + 0.2);
          vibrato.stop(currentOffset + step.duration);

          gain.gain.setValueAtTime(0, currentOffset);
          gain.gain.linearRampToValueAtTime(0.25, currentOffset + 0.2);
          gain.gain.setValueAtTime(0.22, currentOffset + step.duration - 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, currentOffset + step.duration);

          osc.connect(gain);
          oscHarmonic.connect(gain);
          gain.connect(ctx.destination);

          osc.start(currentOffset);
          oscHarmonic.start(currentOffset);
          osc.stop(currentOffset + step.duration);
          oscHarmonic.stop(currentOffset + step.duration);

          this.activeOscillators.push(osc, oscHarmonic, vibrato);
        }
        currentOffset += step.duration;
      });

      const totalDuration = currentOffset - ctx.currentTime;
      setTimeout(() => {
        this.isPlaying = false;
        this.activeOscillators = [];
        if (onEnded) onEnded();
      }, totalDuration * 1000);
    } catch {
      this.isPlaying = false;
      if (onEnded) onEnded();
    }
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // already stopped
      }
    });
    this.activeOscillators = [];
    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioAdhan = new AudioAdhanEngine();
