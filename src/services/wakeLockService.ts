/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Screen Wake Lock Service
 *
 * Provides on-demand screen keep-alive (e.g. while actively reading Quran
 * or during manual audio playback).
 *
 * NOTE: Continuous silent audio and background wake-lock loops have been
 * removed as they are ineffective for Android background alarms and waste battery.
 * Native Android background prayer scheduling will be handled via native alarms.
 */

class WakeLockService {
  private sentinel: any = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      this.isSupported = true;
    }
  }

  /**
   * Request system screen wake lock on-demand
   */
  async requestWakeLock(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      if (!this.sentinel || this.sentinel.released) {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          this.sentinel = null;
        });
      }
      return true;
    } catch (e) {
      console.warn('Wake Lock request was rejected or unpermitted:', e);
      return false;
    }
  }

  /**
   * Release active wake lock
   */
  async release(): Promise<void> {
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {}
      this.sentinel = null;
    }
  }

  /**
   * Check if screen wake lock is currently active
   */
  isActive(): boolean {
    return Boolean(this.sentinel && !this.sentinel.released);
  }
}

export const wakeLockService = new WakeLockService();
