/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PartnerRelationship, PartnerStatus } from './familyModels.ts';
import { getOrCreateCryptoIdentity, DeviceCryptoIdentity } from './cryptoPairing.ts';
import { loadAllPrayerRecords } from './trackerStorage.ts';
import { formatDateKey, DailyPrayerName } from '../utils/trackerLogic.ts';

const PARTNERS_STORAGE_KEY = 'sajda_partners_v2';

export async function getLocalDeviceIdentity(): Promise<DeviceCryptoIdentity> {
  const { identity } = await getOrCreateCryptoIdentity();
  return identity;
}

export function loadPartners(): PartnerRelationship[] {
  try {
    const raw = localStorage.getItem(PARTNERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePartners(partners: PartnerRelationship[]): void {
  try {
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(partners));
  } catch (e) {
    console.error('Failed to save partners', e);
  }
}

export function addPartner(partner: Omit<PartnerRelationship, 'createdAt' | 'updatedAt'>): PartnerRelationship[] {
  const current = loadPartners();
  const now = Date.now();
  const newPartner: PartnerRelationship = {
    ...partner,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newPartner, ...current];
  savePartners(updated);
  return updated;
}

export function updatePartner(id: string, updates: Partial<PartnerRelationship>): PartnerRelationship[] {
  const current = loadPartners();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
  savePartners(updated);
  return updated;
}

export function removePartner(id: string): PartnerRelationship[] {
  const current = loadPartners();
  const updated = current.filter((p) => p.id !== id);
  savePartners(updated);
  return updated;
}

/**
 * Compute real prayer statistics from user's actual tracker data.
 */
export function getMyRealPrayerStats(): { todayPrayedCount: number; streak: number; prayerStates: Record<string, boolean> } {
  const allRecords = loadAllPrayerRecords();
  const todayKey = formatDateKey(new Date());
  
  const prayers: DailyPrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayerStates: Record<string, boolean> = {};
  let todayPrayedCount = 0;

  for (const p of prayers) {
    const id = `${todayKey}_${p}`;
    const rec = allRecords[id];
    const isPrayed = rec ? (rec.state === 'prayed_on_time' || rec.state === 'prayed_later') : false;
    prayerStates[p] = isPrayed;
    if (isPrayed) {
      todayPrayedCount++;
    }
  }

  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dateKey = formatDateKey(checkDate);
    let dayHasPrayer = false;
    for (const p of prayers) {
      const rec = allRecords[`${dateKey}_${p}`];
      if (rec && (rec.state === 'prayed_on_time' || rec.state === 'prayed_later')) {
        dayHasPrayer = true;
        break;
      }
    }
    if (dayHasPrayer) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (streak === 0 && dateKey === todayKey) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayKey = formatDateKey(checkDate);
        let yesterdayHasPrayer = false;
        for (const p of prayers) {
          const rec = allRecords[`${yesterdayKey}_${p}`];
          if (rec && (rec.state === 'prayed_on_time' || rec.state === 'prayed_later')) {
            yesterdayHasPrayer = true;
            break;
          }
        }
        if (yesterdayHasPrayer) {
          streak = 1;
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  return { todayPrayedCount, streak, prayerStates };
}
