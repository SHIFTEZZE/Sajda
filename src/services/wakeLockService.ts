/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Screen Wake Lock & Continuous Audio Keep-Alive Service
 * Keeps the device awake and ensures audio/adhan playback is never killed
 * by system sleep, background idling, or aggressive power management.
 */

class WakeLockService {
  private sentinel: any = null;
  private isSupported: boolean = false;
  private keepAliveInterval: any = null;
  private silentAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      this.isSupported = true;
    }
  }

  /**
   * Request system wake lock to keep the screen and CPU running for Adhan
   */
  async requestWakeLock(): Promise<boolean> {
    if (!this.isSupported) {
      this.startSilentAudioKeepAlive();
      return false;
    }

    try {
      if (!this.sentinel || this.sentinel.released) {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          // Auto-reacquire if released by system or tab switch
          this.reacquireOnVisibility();
        });
      }
      this.startSilentAudioKeepAlive();
      return true;
    } catch (e) {
      console.warn('Wake Lock request was rejected or unpermitted:', e);
      this.startSilentAudioKeepAlive();
      return false;
    }
  }

  /**
   * Reacquire wake lock when window becomes visible again
   */
  private reacquireOnVisibility() {
    if (typeof document !== 'undefined') {
      const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible') {
          await this.requestWakeLock();
        }
      };
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });
    }
  }

  /**
   * Continuous silent audio stream to keep Android media audio session and CPU alive
   */
  private startSilentAudioKeepAlive() {
    if (this.keepAliveInterval) return;

    try {
      // 1-second silent WAV base64 data URI
      if (!this.silentAudio) {
        this.silentAudio = new Audio(
          'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
        );
        this.silentAudio.loop = true;
        this.silentAudio.volume = 0.01; // Silent
      }

      const playSilent = () => {
        if (this.silentAudio && this.silentAudio.paused) {
          this.silentAudio.play().catch(() => {});
        }
      };

      // Try starting playback
      playSilent();

      // Ensure interval keeps touch with audio thread
      this.keepAliveInterval = setInterval(playSilent, 25000);
    } catch {
      // Ignore fallback errors
    }
  }

  /**
   * Release wake lock if needed
   */
  async release(): Promise<void> {
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {}
      this.sentinel = null;
    }
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    if (this.silentAudio) {
      this.silentAudio.pause();
    }
  }
}

export const wakeLockService = new WakeLockService();
