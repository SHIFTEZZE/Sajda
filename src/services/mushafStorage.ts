/**
 * Offline Storage & Download Manager for the 604-Page Madinah Mushaf
 * Stores pages in the Cache API / IndexedDB for 100% offline access.
 */

const MUSHAF_DOWNLOAD_KEY = 'rawdah_mushaf_downloaded_v1';
const MUSHAF_LAST_PAGE_KEY = 'rawdah_mushaf_last_page_v1';
const MUSHAF_PAGE_BOOKMARK_KEY = 'rawdah_mushaf_page_bookmark_v1';
const MUSHAF_PAPER_TONE_KEY = 'rawdah_mushaf_paper_tone_v1';
const MUSHAF_SPREAD_MODE_KEY = 'rawdah_mushaf_spread_mode_v1';

export type PaperTone = 'warm-ivory' | 'pure-white' | 'sepia-parchment' | 'night-dark';

export function isMushafDownloaded(): boolean {
  try {
    return localStorage.getItem(MUSHAF_DOWNLOAD_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setMushafDownloaded(downloaded: boolean): void {
  try {
    if (downloaded) {
      localStorage.setItem(MUSHAF_DOWNLOAD_KEY, 'true');
    } else {
      localStorage.removeItem(MUSHAF_DOWNLOAD_KEY);
    }
  } catch (e) {
    console.error('Failed to set mushaf download status:', e);
  }
}

export function getLastReadMushafPage(): number {
  try {
    const p = localStorage.getItem(MUSHAF_LAST_PAGE_KEY);
    if (!p) return 1;
    const pageNum = parseInt(p, 10);
    return isNaN(pageNum) || pageNum < 1 || pageNum > 604 ? 1 : pageNum;
  } catch {
    return 1;
  }
}

export function setLastReadMushafPage(page: number): void {
  try {
    const valid = Math.max(1, Math.min(604, Math.floor(page)));
    localStorage.setItem(MUSHAF_LAST_PAGE_KEY, valid.toString());
  } catch (e) {
    console.error('Failed to save last read mushaf page:', e);
  }
}

export function getMushafPageBookmark(): number | null {
  try {
    const b = localStorage.getItem(MUSHAF_PAGE_BOOKMARK_KEY);
    if (!b) return null;
    const pageNum = parseInt(b, 10);
    return isNaN(pageNum) ? null : pageNum;
  } catch {
    return null;
  }
}

export function setMushafPageBookmark(page: number | null): void {
  try {
    if (page === null) {
      localStorage.removeItem(MUSHAF_PAGE_BOOKMARK_KEY);
    } else {
      localStorage.setItem(MUSHAF_PAGE_BOOKMARK_KEY, page.toString());
    }
  } catch (e) {
    console.error('Failed to save mushaf page bookmark:', e);
  }
}

export function getMushafPaperTone(): PaperTone {
  try {
    const tone = localStorage.getItem(MUSHAF_PAPER_TONE_KEY) as PaperTone;
    if (tone && ['warm-ivory', 'pure-white', 'sepia-parchment', 'night-dark'].includes(tone)) {
      return tone;
    }
    return 'warm-ivory';
  } catch {
    return 'warm-ivory';
  }
}

export function setMushafPaperTone(tone: PaperTone): void {
  try {
    localStorage.setItem(MUSHAF_PAPER_TONE_KEY, tone);
  } catch (e) {
    console.error('Failed to set mushaf paper tone:', e);
  }
}

export function getMushafSpreadMode(): 'single' | 'double' {
  try {
    const mode = localStorage.getItem(MUSHAF_SPREAD_MODE_KEY);
    return mode === 'double' ? 'double' : 'single';
  } catch {
    return 'single';
  }
}

export function setMushafSpreadMode(mode: 'single' | 'double'): void {
  try {
    localStorage.setItem(MUSHAF_SPREAD_MODE_KEY, mode);
  } catch (e) {
    console.error('Failed to set mushaf spread mode:', e);
  }
}

/**
 * Returns the image URL for a given page number (1-604)
 */
export function getMushafPageImageUrl(pageNumber: number): string {
  const pad = pageNumber.toString().padStart(3, '0');
  return `https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${pad}.png`;
}

/**
 * Deletes cached Mushaf assets to free storage space
 */
export async function clearMushafCache(): Promise<void> {
  try {
    setMushafDownloaded(false);
    if ('caches' in window) {
      await caches.delete('mushaf-pages-cache-v1');
    }
  } catch (e) {
    console.warn('Error clearing mushaf cache:', e);
  }
}
