/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrayerUpdateEvent } from './familyModels.ts';

const SHARED_PRAYER_HISTORY_KEY = 'sajda_shared_prayer_history_v1';
const THIRTY_ONE_DAYS_MS = 31 * 24 * 60 * 60 * 1000;

export interface SharedHistoryStore {
  [partnerId: string]: PrayerUpdateEvent[];
}

export function loadSharedPrayerHistory(): SharedHistoryStore {
  try {
    const raw = localStorage.getItem(SHARED_PRAYER_HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveSharedPrayerHistory(store: SharedHistoryStore): void {
  try {
    localStorage.setItem(SHARED_PRAYER_HISTORY_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save shared prayer history', e);
  }
}

/**
 * Cleanup shared records older than 31 days.
 * User's own prayer history remains untouched.
 */
export function cleanupExpiredSharedRecords(): void {
  const store = loadSharedPrayerHistory();
  const now = Date.now();
  let hasChanges = false;

  const cleanedStore: SharedHistoryStore = {};

  for (const [partnerId, updates] of Object.entries(store)) {
    const validUpdates = updates.filter((update) => {
      const age = now - update.timestamp;
      if (age > THIRTY_ONE_DAYS_MS) {
        hasChanges = true;
        return false;
      }
      return true;
    });
    if (validUpdates.length > 0) {
      cleanedStore[partnerId] = validUpdates;
    }
  }

  if (hasChanges) {
    saveSharedPrayerHistory(cleanedStore);
  }
}

export function recordPartnerUpdate(partnerId: string, update: PrayerUpdateEvent): void {
  cleanupExpiredSharedRecords();
  const store = loadSharedPrayerHistory();
  const existing = store[partnerId] || [];
  
  // Avoid duplicate timestamp/date entries
  const filtered = existing.filter((u) => u.date !== update.date);
  filtered.push(update);

  store[partnerId] = filtered;
  saveSharedPrayerHistory(store);
}

export function getPartnerHistory(partnerId: string): PrayerUpdateEvent[] {
  cleanupExpiredSharedRecords();
  const store = loadSharedPrayerHistory();
  return store[partnerId] || [];
}
