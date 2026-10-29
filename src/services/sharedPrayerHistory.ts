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
 * Cleanup shared records older than 31 days based on update timestamp or actual prayer date.
 * Personal records (rawdah_tracker_records_v1) are NEVER touched or deleted.
 */
export function cleanupExpiredSharedRecords(): void {
  const store = loadSharedPrayerHistory();
  const now = Date.now();
  let hasChanges = false;

  const cleanedStore: SharedHistoryStore = {};

  for (const [partnerId, updates] of Object.entries(store)) {
    const validUpdates = updates.filter((update) => {
      const updateAge = now - update.timestamp;
      // Also parse date string YYYY-MM-DD to check 31-day window from date
      const [y, m, d] = update.date.split('-').map(Number);
      const prayerDateMs = new Date(y, m - 1, d).getTime();
      const dateAge = now - prayerDateMs;

      if (updateAge > THIRTY_ONE_DAYS_MS || dateAge > THIRTY_ONE_DAYS_MS) {
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

/**
 * Record or merge partner update for a specific date so multiple prayers on the same day merge correctly.
 */
export function recordPartnerUpdate(partnerId: string, update: PrayerUpdateEvent): void {
  cleanupExpiredSharedRecords();
  const store = loadSharedPrayerHistory();
  const existingUpdates = store[partnerId] || [];

  const dateIdx = existingUpdates.findIndex((u) => u.date === update.date);

  if (dateIdx >= 0) {
    // Merge prayer states for the same day
    const existing = existingUpdates[dateIdx];
    const mergedStates = { ...existing.prayerStates, ...update.prayerStates };
    
    // Recalculate todayPrayedCount safely from merged states
    let count = 0;
    for (const val of Object.values(mergedStates)) {
      if (val === true) count++;
    }

    existingUpdates[dateIdx] = {
      ...existing,
      prayerStates: mergedStates,
      todayPrayedCount: count,
      streak: update.streak ?? existing.streak,
      timestamp: Math.max(existing.timestamp, update.timestamp),
    };
  } else {
    existingUpdates.push(update);
  }

  store[partnerId] = existingUpdates;
  saveSharedPrayerHistory(store);
}

export function getPartnerHistory(partnerId: string): PrayerUpdateEvent[] {
  cleanupExpiredSharedRecords();
  const store = loadSharedPrayerHistory();
  return store[partnerId] || [];
}
