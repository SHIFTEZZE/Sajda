/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ingestIncomingMessage, TypedPrayerMessage } from './clientSyncManager.ts';
import { getPartnerHistory } from './sharedPrayerHistory.ts';

export function runClientSyncTests(): { name: string; passed: boolean; message: string }[] {
  const results: { name: string; passed: boolean; message: string }[] = [];

  // Test 1: Message Deduplication
  try {
    const senderId = 'sender_' + Date.now();
    const eventId = 'evt_' + crypto.randomUUID();
    const msg: TypedPrayerMessage = {
      eventId,
      protocolVersion: 'v1',
      senderId,
      recipientId: 'my_device',
      date: '2025-06-01',
      prayerName: 'Fajr',
      completed: true,
      timestamp: Date.now(),
    };

    const firstIngest = ingestIncomingMessage(msg);
    const secondIngest = ingestIncomingMessage(msg); // duplicate

    const passed = firstIngest === true && secondIngest === false;
    results.push({
      name: 'Message Deduplication',
      passed,
      message: passed ? 'Successfully detected and rejected duplicate event ID.' : 'Deduplication failed.',
    });
  } catch (e: any) {
    results.push({ name: 'Message Deduplication', passed: false, message: e?.message || 'Error' });
  }

  // Test 2: Conflict Resolution (Last-Write-Wins)
  try {
    const senderId = 'sender_lww_' + Date.now();
    const olderMsg: TypedPrayerMessage = {
      eventId: 'evt_old_' + crypto.randomUUID(),
      protocolVersion: 'v1',
      senderId,
      recipientId: 'my_device',
      date: '2025-06-02',
      prayerName: 'Dhuhr',
      completed: false,
      timestamp: 1000,
    };

    const newerMsg: TypedPrayerMessage = {
      eventId: 'evt_new_' + crypto.randomUUID(),
      protocolVersion: 'v1',
      senderId,
      recipientId: 'my_device',
      date: '2025-06-02',
      prayerName: 'Dhuhr',
      completed: true,
      timestamp: 2000,
    };

    ingestIncomingMessage(newerMsg);
    ingestIncomingMessage(olderMsg); // should be discarded by LWW

    const history = getPartnerHistory(senderId);
    const entry = history.find((h) => h.date === '2025-06-02');
    const passed = entry !== undefined && entry.prayerStates['Dhuhr'] === true;

    results.push({
      name: 'Deterministic Conflict Resolution (LWW)',
      passed,
      message: passed ? 'Successfully kept newer update and discarded older out-of-order message.' : 'LWW conflict resolution failed.',
    });
  } catch (e: any) {
    results.push({ name: 'Deterministic Conflict Resolution (LWW)', passed: false, message: e?.message || 'Error' });
  }

  return results;
}
