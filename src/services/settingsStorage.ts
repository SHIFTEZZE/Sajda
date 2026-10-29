/**
 * Settings Storage & Persistence
 * Completely offline, stored in user's localStorage with zero network exposure.
 */

import { PrayerAdjustment, PrayerTimesConfig } from '../utils/prayerTimes.ts';
import { CITIES_DATABASE, CityLocation, DEFAULT_CITY } from '../data/moroccanCities.ts';

export type AppTheme = 'victorian_green' | 'burgundy';
export type NotificationMode = 'full_adhan' | 'short_tone' | 'silent' | 'reminder_only' | 'off';
export type QuranFontSize = 'small' | 'normal' | 'large' | 'xlarge';

export interface AppSettings {
  theme: AppTheme;
  isDarkMode: boolean;
  hasCompletedOnboarding: boolean;
  location: {
    cityName: string;
    arabicName: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isGps: boolean;
  };
  calculation: {
    method: PrayerTimesConfig['method'];
    asrMethod: PrayerTimesConfig['asrMethod'];
    highLatitudeRule: PrayerTimesConfig['highLatitudeRule'];
    adjustments: PrayerAdjustment;
  };
  hijriShift: number; // -1, 0, +1
  notifications: {
    Fajr: NotificationMode;
    Dhuhr: NotificationMode;
    Asr: NotificationMode;
    Maghrib: NotificationMode;
    Isha: NotificationMode;
    reminderLeadMinutes: number; // e.g. 10
  };
  quranFontSize: QuranFontSize;
  // Consistency goal (e.g. "Record 5 of 5 daily")
  consistencyGoalEnabled: boolean;
  consistencyGoalTarget: number; // 5
}

const SETTINGS_KEY = 'rawdah_user_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'victorian_green',
  isDarkMode: false,
  hasCompletedOnboarding: false,
  location: {
    cityName: DEFAULT_CITY.name,
    arabicName: DEFAULT_CITY.arabicName,
    country: DEFAULT_CITY.country,
    latitude: DEFAULT_CITY.latitude,
    longitude: DEFAULT_CITY.longitude,
    timezone: DEFAULT_CITY.timezone,
    isGps: false,
  },
  calculation: {
    method: 'Morocco', // Default per brief: Morocco Ministry of Habous
    asrMethod: 'Standard',
    highLatitudeRule: 'MiddleOfTheNight',
    adjustments: {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
  },
  hijriShift: 0,
  notifications: {
    Fajr: 'full_adhan',
    Dhuhr: 'full_adhan',
    Asr: 'full_adhan',
    Maghrib: 'full_adhan',
    Isha: 'full_adhan',
    reminderLeadMinutes: 10,
  },
  quranFontSize: 'normal',
  consistencyGoalEnabled: true,
  consistencyGoalTarget: 5,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      location: { ...DEFAULT_SETTINGS.location, ...(parsed.location || {}) },
      calculation: {
        ...DEFAULT_SETTINGS.calculation,
        ...(parsed.calculation || {}),
        adjustments: {
          ...DEFAULT_SETTINGS.calculation.adjustments,
          ...(parsed.calculation?.adjustments || {}),
        },
      },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
