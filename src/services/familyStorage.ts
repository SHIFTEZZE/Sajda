/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  statusText: string;
  todayPrayedCount: number;
  totalPrayers: number;
  streak: number;
  lastActive: string;
  allowRemoteReminder: boolean;
  canViewMyPrayer: boolean;
  avatarColor: string;
}

const FAMILY_STORAGE_KEY = 'sajda_family_friends_v1';

const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [];

export function loadFamilyMembers(): FamilyMember[] {
  try {
    const raw = localStorage.getItem(FAMILY_STORAGE_KEY);
    if (!raw) {
      saveFamilyMembers(DEFAULT_FAMILY_MEMBERS);
      return DEFAULT_FAMILY_MEMBERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FAMILY_MEMBERS;
  }
}

export function saveFamilyMembers(members: FamilyMember[]): void {
  try {
    localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save family members', e);
  }
}

export function addFamilyMember(member: Omit<FamilyMember, 'id'>): FamilyMember[] {
  const current = loadFamilyMembers();
  const newMember: FamilyMember = {
    ...member,
    id: 'fam_' + Date.now(),
  };
  const updated = [newMember, ...current];
  saveFamilyMembers(updated);
  return updated;
}

export function updateFamilyMember(id: string, updates: Partial<FamilyMember>): FamilyMember[] {
  const current = loadFamilyMembers();
  const updated = current.map((m) => (m.id === id ? { ...m, ...updates } : m));
  saveFamilyMembers(updated);
  return updated;
}

export function removeFamilyMember(id: string): FamilyMember[] {
  const current = loadFamilyMembers();
  const updated = current.filter((m) => m.id !== id);
  saveFamilyMembers(updated);
  return updated;
}

export function generateInviteLink(userName: string): string {
  const encodedName = encodeURIComponent(userName || 'صديق');
  const token = Math.random().toString(36).substring(2, 8);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?add_friend=${encodedName}&token=${token}`;
}

const SAJDA_ID_KEY = 'sajda_user_unique_id_v1';

export function getUserSajdaId(): string {
  try {
    let id = localStorage.getItem(SAJDA_ID_KEY);
    if (!id) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      id = `SJ-${randomNum}`;
      localStorage.setItem(SAJDA_ID_KEY, id);
    }
    return id;
  } catch {
    return 'SJ-4829';
  }
}

// Server Backend API Sync Helpers for True Live Prayer Status & Remote Adhan
export async function publishMyPrayerStatus(
  sajdaId: string,
  name: string,
  todayPrayedCount: number,
  prayerStates: { [key: string]: boolean },
  streak: number
): Promise<void> {
  try {
    await fetch('/api/friends/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sajdaId,
        name,
        todayPrayedCount,
        prayerStates,
        streak,
        date: new Date().toISOString().split('T')[0],
      }),
    });
  } catch (e) {
    console.warn('Server sync offline mode: published locally only', e);
  }
}

export async function fetchFriendStatusFromServer(sajdaId: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/friends/fetch/${sajdaId}`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // Offline fallback
  }
  return null;
}

export async function sendRemotePingToServer(
  targetId: string,
  senderName: string,
  type: 'adhan' | 'reminder'
): Promise<boolean> {
  try {
    const res = await fetch('/api/friends/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, senderName, type }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkMyPingsFromServer(sajdaId: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/friends/check-ping/${sajdaId}`);
    if (res.ok) {
      const json = await res.json();
      return json.ping;
    }
  } catch {
    // ignore
  }
  return null;
}
