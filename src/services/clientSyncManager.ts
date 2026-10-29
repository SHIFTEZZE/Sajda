/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrayerUpdateEvent } from './familyModels.ts';
import { recordPartnerUpdate, getPartnerHistory } from './sharedPrayerHistory.ts';
import { RelayTransport } from './relayTransport.ts';

export interface TypedPrayerMessage {
  eventId: string;          // Unique event UUID
  protocolVersion: string;  // 'v1'
  senderId: string;
  recipientId: string;
  date: string;             // YYYY-MM-DD
  prayerName: string;       // Fajr, Dhuhr, Asr, Maghrib, Isha
  completed: boolean;
  timestamp: number;
}

export type DeliveryStatus = 'queued' | 'fcm_accepted' | 'confirmed_receipt' | 'failed';

export interface OutboundMessageTracker {
  eventId: string;
  recipientId: string;
  message: TypedPrayerMessage;
  status: DeliveryStatus;
  attempts: number;
  lastAttemptAt?: number;
}

const OFFLINE_RETRY_QUEUE_KEY = 'sajda_offline_retry_queue_v1';
const PROCESSED_EVENTS_KEY = 'sajda_processed_events_v1';

/**
 * Load offline retry queue
 */
export function loadOfflineQueue(): OutboundMessageTracker[] {
  try {
    const raw = localStorage.getItem(OFFLINE_RETRY_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OutboundMessageTracker[]): void {
  try {
    localStorage.setItem(OFFLINE_RETRY_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save offline retry queue', e);
  }
}

/**
 * Message Deduplication Set
 */
function getProcessedEvents(): Set<string> {
  try {
    const raw = localStorage.getItem(PROCESSED_EVENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function markEventProcessed(eventId: string): void {
  const processed = getProcessedEvents();
  processed.add(eventId);
  // Keep last 500 events to prevent unbounded growth
  const arr = Array.from(processed).slice(-500);
  try {
    localStorage.setItem(PROCESSED_EVENTS_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

/**
 * Ingest incoming message with deduplication and conflict resolution (Last-Write-Wins).
 */
export function ingestIncomingMessage(msg: TypedPrayerMessage): boolean {
  const processed = getProcessedEvents();
  if (processed.has(msg.eventId)) {
    return false; // Duplicate message ignored
  }

  markEventProcessed(msg.eventId);

  // Convert to PrayerUpdateEvent for 31-day shared history store
  const updateEvent: PrayerUpdateEvent = {
    senderId: msg.senderId,
    date: msg.date,
    prayerStates: { [msg.prayerName]: msg.completed },
    todayPrayedCount: msg.completed ? 1 : 0, // aggregated by client
    streak: 0,
    timestamp: msg.timestamp,
  };

  // Check existing history for conflict resolution (Last-Write-Wins based on timestamp)
  const existingHistory = getPartnerHistory(msg.senderId);
  const existingForDate = existingHistory.find((h) => h.date === msg.date);

  if (existingForDate && existingForDate.timestamp > msg.timestamp) {
    // Conflict resolution: Newer update already exists, discard older out-of-order message
    return false;
  }

  recordPartnerUpdate(msg.senderId, updateEvent);
  return true;
}

/**
 * Send prayer update with opt-in permission check, offline queuing, and status distinction.
 */
export async function sendTypedPrayerUpdate(
  transport: RelayTransport,
  recipientId: string,
  senderId: string,
  prayerName: string,
  date: string,
  completed: boolean,
  optInSharing: boolean
): Promise<DeliveryStatus> {
  if (!optInSharing) {
    console.warn('Sharing is disabled by user opt-in settings. Aborting transmission.');
    return 'failed';
  }

  const msg: TypedPrayerMessage = {
    eventId: 'evt_' + crypto.randomUUID(),
    protocolVersion: 'v1',
    senderId,
    recipientId,
    date,
    prayerName,
    completed,
    timestamp: Date.now(),
  };

  const tracker: OutboundMessageTracker = {
    eventId: msg.eventId,
    recipientId,
    message: msg,
    status: 'queued',
    attempts: 1,
    lastAttemptAt: Date.now(),
  };

  try {
    const response = await transport.sendPrayerUpdate(recipientId, {
      senderId,
      date,
      prayerStates: { [prayerName]: completed },
      todayPrayedCount: completed ? 1 : 0,
      streak: 0,
      timestamp: msg.timestamp,
    });

    if (response.delivered) {
      tracker.status = 'fcm_accepted'; // Worker & FCM accepted delivery
    } else {
      tracker.status = 'failed';
      queueForRetry(tracker);
    }
  } catch {
    tracker.status = 'queued';
    queueForRetry(tracker);
  }

  return tracker.status;
}

function queueForRetry(tracker: OutboundMessageTracker): void {
  const queue = loadOfflineQueue();
  const index = queue.findIndex((q) => q.eventId === tracker.eventId);
  if (index >= 0) {
    queue[index] = tracker;
  } else {
    queue.push(tracker);
  }
  saveOfflineQueue(queue);
}

/**
 * Flush offline retry queue when online.
 */
export async function flushOfflineQueue(transport: RelayTransport): Promise<void> {
  const queue = loadOfflineQueue();
  if (queue.length === 0) return;

  const remaining: OutboundMessageTracker[] = [];
  for (const item of queue) {
    if (item.attempts >= 5) {
      continue; // Drop after 5 failed attempts
    }
    try {
      item.attempts++;
      item.lastAttemptAt = Date.now();
      const res = await transport.sendPrayerUpdate(item.recipientId, {
        senderId: item.message.senderId,
        date: item.message.date,
        prayerStates: { [item.message.prayerName]: item.message.completed },
        todayPrayedCount: item.message.completed ? 1 : 0,
        streak: 0,
        timestamp: item.message.timestamp,
      });

      if (!res.delivered) {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }
  saveOfflineQueue(remaining);
}
