/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cleanupExpiredSharedRecords, saveSharedPrayerHistory, loadSharedPrayerHistory } from './sharedPrayerHistory.ts';
import { getMyRealPrayerStats } from './familySync.ts';
import { savePrayerRecord } from './trackerStorage.ts';
import { formatDateKey } from '../utils/trackerLogic.ts';

export function runFamilySyncTests(): { name: string; passed: boolean; message: string }[] {
  const results: { name: string; passed: boolean; message: string }[] = [];

  // Test 1: 31-day shared record expiration
  try {
    const testPartnerId = 'test_partner_' + Date.now();
    const now = Date.now();
    const thirtyTwoDaysAgo = now - 32 * 24 * 60 * 60 * 1000;
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

    saveSharedPrayerHistory({
      [testPartnerId]: [
        { senderId: testPartnerId, date: '2025-01-01', prayerStates: {}, todayPrayedCount: 3, streak: 5, timestamp: thirtyTwoDaysAgo },
        { senderId: testPartnerId, date: '2025-02-01', prayerStates: {}, todayPrayedCount: 5, streak: 6, timestamp: fiveDaysAgo },
      ],
    });

    cleanupExpiredSharedRecords();
    const history = loadSharedPrayerHistory();
    const remaining = history[testPartnerId] || [];

    const expiredRemoved = remaining.length === 1 && remaining[0].timestamp === fiveDaysAgo;
    results.push({
      name: '31-Day Shared Prayer History Expiration',
      passed: expiredRemoved,
      message: expiredRemoved ? 'Expired shared records successfully purged after 31 days.' : 'Failed to purge expired records.',
    });
  } catch (e: any) {
    results.push({ name: '31-Day Shared Prayer History Expiration', passed: false, message: e?.message || 'Error' });
  }

  // Test 2: Real prayer stats calculation from tracker
  try {
    const today = formatDateKey(new Date());
    savePrayerRecord(today, 'Fajr', 'prayed_on_time');
    savePrayerRecord(today, 'Dhuhr', 'prayed_on_time');

    const stats = getMyRealPrayerStats();
    const valid = stats.todayPrayedCount >= 2 && typeof stats.streak === 'number' && typeof stats.prayerStates.Fajr === 'boolean';
    results.push({
      name: 'Real Prayer Statistics Derivation',
      passed: valid,
      message: valid ? `Successfully computed today prayed count (${stats.todayPrayedCount}) and streak (${stats.streak}).` : 'Invalid statistics structure.',
    });
  } catch (e: any) {
    results.push({ name: 'Real Prayer Statistics Derivation', passed: false, message: e?.message || 'Error' });
  }

  return results;
}
