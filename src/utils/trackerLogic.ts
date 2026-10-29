/**
 * Prayer Tracker Logic & Pure Mathematics
 *
 * States:
 * - not_recorded: Default state. No answer entered yet.
 * - prayed_on_time: User performed within designated prayer window.
 * - prayed_later: User performed after its time (Qada / delayed).
 * - not_performed: User explicitly recorded that it was not performed.
 *
 * Guiding Principle:
 * Statistics are computed strictly from recorded entries.
 * Unrecorded prayers are never counted as completed or as missed.
 */

export type PrayerState = 'not_recorded' | 'prayed_on_time' | 'prayed_later' | 'not_performed';

export type DailyPrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export const TRACKED_PRAYERS: DailyPrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export interface PrayerRecord {
  id: string; // Unique stable id e.g. "2026-10-17_Fajr"
  date: string; // ISO date format "YYYY-MM-DD"
  prayer: DailyPrayerName;
  state: PrayerState;
  updatedAt: number; // Unix timestamp ms
}

export type DayRecordMap = Record<DailyPrayerName, PrayerRecord | undefined>;

export interface TrackerStats {
  totalRecorded: number;
  totalPrayed: number; // on_time + prayed_later
  prayedOnTime: number;
  prayedLater: number;
  notPerformed: number;
  unrecorded: number;
  // Rates calculated strictly over recorded entries
  onTimePercentage: number; // 0 - 100
  completionPercentage: number; // 0 - 100
  encouragingMessage: string;
  encouragingMessageAr: string;
}

export function createRecordId(date: string, prayer: DailyPrayerName): string {
  return `${date}_${prayer}`;
}

export function getPrayerState(
  records: Record<string, PrayerRecord>,
  date: string,
  prayer: DailyPrayerName
): PrayerState {
  const id = createRecordId(date, prayer);
  return records[id]?.state || 'not_recorded';
}

export function computeStatsForRecords(recordList: (PrayerRecord | undefined)[]): TrackerStats {
  let totalRecorded = 0;
  let prayedOnTime = 0;
  let prayedLater = 0;
  let notPerformed = 0;
  let unrecorded = 0;

  for (const r of recordList) {
    if (!r || r.state === 'not_recorded') {
      unrecorded++;
    } else if (r.state === 'prayed_on_time') {
      totalRecorded++;
      prayedOnTime++;
    } else if (r.state === 'prayed_later') {
      totalRecorded++;
      prayedLater++;
    } else if (r.state === 'not_performed') {
      totalRecorded++;
      notPerformed++;
    }
  }

  const totalPrayed = prayedOnTime + prayedLater;

  // Strict rule: Rates are computed only from recorded entries!
  const onTimePercentage = totalRecorded > 0 ? Math.round((prayedOnTime / totalRecorded) * 100) : 0;
  const completionPercentage = totalRecorded > 0 ? Math.round((totalPrayed / totalRecorded) * 100) : 0;

  let encouragingMessage = 'Begin recording your prayers at your own peaceful pace.';
  let encouragingMessageAr = 'ابدأ بتسجيل صلواتك بهدوء وطمأنينة دون استعجال.';
  if (totalRecorded > 0) {
    if (completionPercentage === 100) {
      encouragingMessage = 'May your devotion bring serenity and blessings to your day.';
      encouragingMessageAr = 'تقبّل الله طاعتكم، وجعل صلاتكم نوراً وبركة وسكينة ليومكم.';
    } else if (completionPercentage >= 80) {
      encouragingMessage = 'Steadfast dedication. Continue seeking peace in each prayer.';
      encouragingMessageAr = 'ثبات مبارك وحرص مشكور، واصل استشعار السكينة في كل صلاة.';
    } else {
      encouragingMessage = 'Every prayer is a welcoming return. May Allah bless your efforts.';
      encouragingMessageAr = 'كل صلاة إقبال على الله ومحطة طمأنينة، بارك الله في مسعاكم.';
    }
  }

  return {
    totalRecorded,
    totalPrayed,
    prayedOnTime,
    prayedLater,
    notPerformed,
    unrecorded,
    onTimePercentage,
    completionPercentage,
    encouragingMessage,
    encouragingMessageAr,
  };
}

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
