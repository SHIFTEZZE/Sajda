/**
 * Nearby Mosques Service
 * Connects to OpenStreetMap Overpass API with local caching and polite query policies.
 * The only feature in Version 1 that optionally uses internet connectivity.
 */

export interface MosqueItem {
  id: string;
  name: string;
  arabicName?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  street?: string;
  city?: string;
  wheelchairAccessible?: string;
  source: 'OpenStreetMap' | 'Bundled Landmark';
}

const CACHE_KEY_PREFIX = 'rawdah_mosques_cache_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

// Curated verified Moroccan and international landmark mosques if offline or for immediate preview
export const FAMOUS_LANDMARK_MOSQUES: MosqueItem[] = [
  {
    id: 'hassan_ii_casablanca',
    name: 'Hassan II Mosque (مسجد الحسن الثاني)',
    arabicName: 'مسجد الحسن الثاني',
    latitude: 33.6086,
    longitude: -7.6328,
    distanceKm: 0,
    street: 'Sour Jdid, Boulevard Sidi Mohammed Ben Abdellah',
    city: 'Casablanca',
    source: 'Bundled Landmark',
  },
  {
    id: 'koutoubia_marrakech',
    name: 'Koutoubia Mosque (جامع الكتبية)',
    arabicName: 'جامع الكتبية',
    latitude: 31.6238,
    longitude: -7.9935,
    distanceKm: 0,
    street: 'Avenue Mohammed V, Medina',
    city: 'Marrakech',
    source: 'Bundled Landmark',
  },
  {
    id: 'al_qarawiyyin_fes',
    name: 'University & Mosque of al-Qarawiyyin (جامع القرويين)',
    arabicName: 'جامع القرويين',
    latitude: 34.0649,
    longitude: -4.9734,
    distanceKm: 0,
    street: 'Qarawiyyin Street, Fes el-Bali',
    city: 'Fes',
    source: 'Bundled Landmark',
  },
  {
    id: 'hassan_tower_rabat',
    name: 'Ahl Fas Mosque & Hassan (مسجد أهل فاس)',
    arabicName: 'مسجد أهل فاس',
    latitude: 34.0242,
    longitude: -6.8228,
    distanceKm: 0,
    street: 'Al Mechouar Essaid, Touarga',
    city: 'Rabat',
    source: 'Bundled Landmark',
  },
  {
    id: 'masjid_al_haram',
    name: 'Masjid al-Haram (المسجد الحرام)',
    arabicName: 'المسجد الحرام',
    latitude: 21.4225,
    longitude: 39.8262,
    distanceKm: 0,
    street: 'Al Haram',
    city: 'Makkah',
    source: 'Bundled Landmark',
  },
  {
    id: 'masjid_an_nabawi',
    name: 'Al-Masjid an-Nabawi (المسجد النبوي)',
    arabicName: 'المسجد النبوي',
    latitude: 24.4672,
    longitude: 39.6111,
    distanceKm: 0,
    street: 'Al Haram',
    city: 'Madinah',
    source: 'Bundled Landmark',
  },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function fetchNearbyMosques(
  latitude: number,
  longitude: number,
  radiusMeters: number = 5000
): Promise<{ mosques: MosqueItem[]; isFromCache: boolean; isOfflineFallback: boolean; error?: string }> {
  // Check local storage cache
  const cacheKey = `${CACHE_KEY_PREFIX}${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        // Recalculate distance to exact position
        const list = parsed.data.map((m: MosqueItem) => ({
          ...m,
          distanceKm: calculateDistance(latitude, longitude, m.latitude, m.longitude),
        })).sort((a: MosqueItem, b: MosqueItem) => a.distanceKm - b.distanceKm);

        return { mosques: list, isFromCache: true, isOfflineFallback: false };
      }
    }
  } catch {
    // Ignore cache parse error
  }

  // Construct polite Overpass QL query
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
    );
    out center 25;
  `;

  const overpassUrl = 'https://overpass-api.de/api/interpreter';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'RawdahMuslimCompanion/1.0 (Privacy-First OpenStreetMap Mosque Finder)',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Overpass API responded with status ${response.status}`);
    }

    const data = await response.json();
    const elements: any[] = data.elements || [];

    const mosques: MosqueItem[] = [];
    for (const el of elements) {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (!lat || !lon) continue;

      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags['name:ar'] || 'Mosque (مسجد)';
      const arabicName = tags['name:ar'];
      const street = tags['addr:street']
        ? `${tags['addr:housenumber'] ? tags['addr:housenumber'] + ' ' : ''}${tags['addr:street']}`
        : undefined;
      const city = tags['addr:city'] || tags['addr:suburb'];

      mosques.push({
        id: `osm_${el.type}_${el.id}`,
        name,
        arabicName,
        latitude: lat,
        longitude: lon,
        distanceKm: calculateDistance(latitude, longitude, lat, lon),
        street,
        city,
        wheelchairAccessible: tags.wheelchair,
        source: 'OpenStreetMap',
      });
    }

    mosques.sort((a, b) => a.distanceKm - b.distanceKm);

    // Save to cache
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: mosques,
        })
      );
    } catch {
      // ignore quota error
    }

    return { mosques, isFromCache: false, isOfflineFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network unavailable';
    console.warn('Failed to fetch from Overpass API, using graceful fallback:', errorMsg);

    // Filter bundled landmarks by distance
    const fallbackList = FAMOUS_LANDMARK_MOSQUES.map((m) => ({
      ...m,
      distanceKm: calculateDistance(latitude, longitude, m.latitude, m.longitude),
    })).sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      mosques: fallbackList,
      isFromCache: false,
      isOfflineFallback: true,
      error: 'OpenStreetMap connection unavailable. Showing verified landmark reference.',
    };
  }
}
