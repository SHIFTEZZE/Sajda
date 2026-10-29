/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DeviceIdentity {
  deviceId: string; // Unique cryptographic device identifier (UUID v4)
  deviceName: string;
  createdAt: number;
}

export interface SharingPermissions {
  allowRemoteReminder: boolean;
  canViewMyPrayer: boolean;
}

export type PartnerStatus = 'paired' | 'pending_incoming' | 'pending_outgoing' | 'offline';

export interface PartnerRelationship {
  id: string; // Partner's secure device identifier
  name: string;
  relation: string;
  status: PartnerStatus;
  permissions: SharingPermissions;
  lastSyncedAt?: number;
  todayPrayedCount: number;
  streak: number;
  statusText: string;
  avatarColor: string;
  createdAt: number;
  updatedAt: number;
}

export interface PrayerUpdateEvent {
  senderId: string;
  date: string; // YYYY-MM-DD
  prayerStates: Record<string, boolean>; // e.g. { Fajr: true, Dhuhr: true, ... }
  todayPrayedCount: number;
  streak: number;
  timestamp: number;
}

export interface NotificationEvent {
  id: string;
  type: 'adhan' | 'reminder';
  sender: string;
  timestamp: number;
  delivered: boolean;
}
