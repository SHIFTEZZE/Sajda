/**
 * Local Data Storage Layer for Prayer Tracker, Bookmarks, and Reading Progress
 * Keeps everything 100% offline on the user's device.
 * Prepared for Version 2 sync by keeping clean data interfaces with unique IDs and updatedAt timestamps.
 */

import { DailyPrayerName, PrayerRecord, PrayerState, createRecordId } from '../utils/trackerLogic.ts';
import { QuranBookmark, ReadingProgress } from '../data/quranData.ts';

const TRACKER_STORAGE_KEY = 'rawdah_tracker_records_v1';
const QURAN_BOOKMARKS_KEY = 'rawdah_quran_bookmarks_v1';
const READING_PROGRESS_KEY = 'rawdah_reading_progress_v1';
const HADITH_FAVORITES_KEY = 'rawdah_hadith_favorites_v1';

export type RecordsMap = Record<string, PrayerRecord>;

export function loadAllPrayerRecords(): RecordsMap {
  try {
    const raw = localStorage.getItem(TRACKER_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function savePrayerRecord(
  date: string,
  prayer: DailyPrayerName,
  state: PrayerState
): { record: PrayerRecord; allRecords: RecordsMap } {
  const allRecords = loadAllPrayerRecords();
  const id = createRecordId(date, prayer);

  if (state === 'not_recorded') {
    // If not recorded, remove or mark as unrecorded
    delete allRecords[id];
  } else {
    allRecords[id] = {
      id,
      date,
      prayer,
      state,
      updatedAt: Date.now(),
    };
  }

  try {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(allRecords));
  } catch (e) {
    console.error('Failed to store prayer record:', e);
  }

  return {
    record: allRecords[id] || { id, date, prayer, state: 'not_recorded', updatedAt: Date.now() },
    allRecords,
  };
}

export function exportBackupData(): string {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    trackerRecords: loadAllPrayerRecords(),
    quranBookmarks: loadQuranBookmarks(),
    readingProgress: loadReadingProgress(),
    hadithFavorites: loadHadithFavorites(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.trackerRecords) {
      localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(parsed.trackerRecords));
    }
    if (parsed.quranBookmarks) {
      localStorage.setItem(QURAN_BOOKMARKS_KEY, JSON.stringify(parsed.quranBookmarks));
    }
    if (parsed.readingProgress) {
      localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(parsed.readingProgress));
    }
    if (parsed.hadithFavorites) {
      localStorage.setItem(HADITH_FAVORITES_KEY, JSON.stringify(parsed.hadithFavorites));
    }
    return true;
  } catch (e) {
    console.error('Error importing backup data:', e);
    return false;
  }
}

// Quran bookmarks
export function loadQuranBookmarks(): QuranBookmark[] {
  try {
    const raw = localStorage.getItem(QURAN_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleQuranBookmark(
  surahNumber: number,
  ayahNumber: number,
  surahName: string,
  note?: string
): QuranBookmark[] {
  const bookmarks = loadQuranBookmarks();
  const id = `${surahNumber}:${ayahNumber}`;
  const existingIdx = bookmarks.findIndex((b) => b.id === id);

  let updated: QuranBookmark[];
  if (existingIdx >= 0) {
    updated = bookmarks.filter((b) => b.id !== id);
  } else {
    updated = [
      ...bookmarks,
      {
        id,
        surahNumber,
        ayahNumber,
        surahName,
        note,
        createdAt: Date.now(),
      },
    ];
  }

  try {
    localStorage.setItem(QURAN_BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving Quran bookmarks:', e);
  }
  return updated;
}

// Reading progress
export function loadReadingProgress(): ReadingProgress {
  try {
    const raw = localStorage.getItem(READING_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : { surahNumber: 1, ayahNumber: 1, updatedAt: Date.now() };
  } catch {
    return { surahNumber: 1, ayahNumber: 1, updatedAt: Date.now() };
  }
}

export function saveReadingProgress(surahNumber: number, ayahNumber: number): void {
  try {
    const progress: ReadingProgress = { surahNumber, ayahNumber, updatedAt: Date.now() };
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving reading progress:', e);
  }
}

// Hadith Favorites
export function loadHadithFavorites(): number[] {
  try {
    const raw = localStorage.getItem(HADITH_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleHadithFavorite(id: number): number[] {
  const favorites = loadHadithFavorites();
  const exists = favorites.includes(id);
  const updated = exists ? favorites.filter((fid) => fid !== id) : [...favorites, id];
  try {
    localStorage.setItem(HADITH_FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving hadith favorites:', e);
  }
  return updated;
}
