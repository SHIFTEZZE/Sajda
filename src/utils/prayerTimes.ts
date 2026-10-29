/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from 'adhan';

export interface PrayerAdjustment {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface PrayerTimesConfig {
  latitude: number;
  longitude: number;
  method: 'Morocco' | 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Dubai' | 'Qatar' | 'Kuwait';
  asrMethod: 'Standard' | 'Hanafi';
  highLatitudeRule: 'MiddleOfTheNight' | 'SeventhOfTheNight' | 'TwilightAngle';
  adjustments: PrayerAdjustment;
}

export interface FormattedPrayerTime {
  name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  arabicName: string;
  time: Date;
  formattedTime: string; // e.g. "05:14"
  isCurrent: boolean;
  isNext: boolean;
}

export interface DayPrayerTimes {
  date: Date;
  fajr: Date;
  sunrise: Date; // kept for astronomy / sunrise time display if needed, but not as a prayer
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  list: FormattedPrayerTime[];
  currentPrayer: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'None';
  nextPrayer: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  nextPrayerTime: Date;
  secondsToNext: number;
}

export const ARABIC_PRAYER_NAMES: Record<string, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
  None: '—',
};

export const CALCULATION_METHODS_AR: Record<PrayerTimesConfig['method'], string> = {
  Morocco: 'المغرب (وزارة الأوقاف والشؤون الإسلامية - الفجر 19°، العشاء 17°)',
  MWL: 'رابطة العالم الإسلامي (الفجر 18°، العشاء 17°)',
  Egypt: 'الهيئة العامة المصرية للمساحة (الفجر 19.5°، العشاء 17.5°)',
  Makkah: 'جامعة أم القرى، مكة المكرمة',
  ISNA: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
  Dubai: 'دائرة الشؤون الإسلامية والعمل الخيري بدبي',
  Kuwait: 'وزارة الأوقاف الكويتية',
  Qatar: 'وزارة الأوقاف القطرية',
  Karachi: 'جامعة العلوم الإسلامية بكراتشي',
  Tehran: 'معهد الجيوفيزياء بجامعة طهران',
};

export const ASR_MADHAB_AR: Record<PrayerTimesConfig['asrMethod'], { name: string; desc: string }> = {
  Standard: { name: 'الجمهور (المالكي، الشافعي، الحنبلي)', desc: 'ظل الشيء مثله' },
  Hanafi: { name: 'المذهب الحنفي', desc: 'ظل الشيء مثليه' },
};

export const HIGH_LATITUDE_AR: Record<PrayerTimesConfig['highLatitudeRule'], string> = {
  MiddleOfTheNight: 'منتصف الليل',
  SeventhOfTheNight: 'سُبع الليل',
  TwilightAngle: 'زاوية الشفق',
};

export function getMoroccoParameters(): CalculationParameters {
  const params = new CalculationParameters('Other', 19, 17);
  params.madhab = Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  return params;
}

export function getCalculationParameters(method: PrayerTimesConfig['method']): CalculationParameters {
  switch (method) {
    case 'Morocco':
      return getMoroccoParameters();
    case 'MWL':
      return CalculationMethod.MuslimWorldLeague();
    case 'ISNA':
      return CalculationMethod.NorthAmerica();
    case 'Egypt':
      return CalculationMethod.Egyptian();
    case 'Makkah':
      return CalculationMethod.UmmAlQura();
    case 'Karachi':
      return CalculationMethod.Karachi();
    case 'Tehran':
      return CalculationMethod.Tehran();
    case 'Dubai':
      return CalculationMethod.Dubai();
    case 'Qatar':
      return CalculationMethod.Qatar();
    case 'Kuwait':
      return CalculationMethod.Kuwait();
    default:
      return getMoroccoParameters();
  }
}

export function calculatePrayerTimes(
  config: PrayerTimesConfig,
  date: Date = new Date(),
  now: Date = new Date()
): DayPrayerTimes {
  const coords = new Coordinates(config.latitude, config.longitude);
  const params = getCalculationParameters(config.method);

  params.madhab = config.asrMethod === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  if (config.highLatitudeRule === 'SeventhOfTheNight') {
    params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  } else if (config.highLatitudeRule === 'TwilightAngle') {
    params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  } else {
    params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  }

  params.adjustments.fajr = config.adjustments.fajr || 0;
  params.adjustments.dhuhr = config.adjustments.dhuhr || 0;
  params.adjustments.asr = config.adjustments.asr || 0;
  params.adjustments.maghrib = config.adjustments.maghrib || 0;
  params.adjustments.isha = config.adjustments.isha || 0;

  const pt = new PrayerTimes(coords, date, params);

  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayPt = new PrayerTimes(coords, nextDay, params);

  let currentPrayerName: DayPrayerTimes['currentPrayer'] = 'None';
  let nextPrayerName: DayPrayerTimes['nextPrayer'] = 'Fajr';
  let nextPrayerTime: Date = pt.fajr;

  const nowMs = now.getTime();

  // Exclude sunrise from prayer sequence (Sunrise is not a prayer)
  if (nowMs < pt.fajr.getTime()) {
    currentPrayerName = 'None';
    nextPrayerName = 'Fajr';
    nextPrayerTime = pt.fajr;
  } else if (nowMs < pt.dhuhr.getTime()) {
    currentPrayerName = 'Fajr';
    nextPrayerName = 'Dhuhr';
    nextPrayerTime = pt.dhuhr;
  } else if (nowMs < pt.asr.getTime()) {
    currentPrayerName = 'Dhuhr';
    nextPrayerName = 'Asr';
    nextPrayerTime = pt.asr;
  } else if (nowMs < pt.maghrib.getTime()) {
    currentPrayerName = 'Asr';
    nextPrayerName = 'Maghrib';
    nextPrayerTime = pt.maghrib;
  } else if (nowMs < pt.isha.getTime()) {
    currentPrayerName = 'Maghrib';
    nextPrayerName = 'Isha';
    nextPrayerTime = pt.isha;
  } else {
    currentPrayerName = 'Isha';
    nextPrayerName = 'Fajr';
    nextPrayerTime = nextDayPt.fajr;
  }

  const secondsToNext = Math.max(0, Math.floor((nextPrayerTime.getTime() - nowMs) / 1000));

  const formatTime = (d: Date): string => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const list: FormattedPrayerTime[] = [
    {
      name: 'Fajr',
      arabicName: ARABIC_PRAYER_NAMES.Fajr,
      time: pt.fajr,
      formattedTime: formatTime(pt.fajr),
      isCurrent: currentPrayerName === 'Fajr',
      isNext: nextPrayerName === 'Fajr',
    },
    {
      name: 'Dhuhr',
      arabicName: ARABIC_PRAYER_NAMES.Dhuhr,
      time: pt.dhuhr,
      formattedTime: formatTime(pt.dhuhr),
      isCurrent: currentPrayerName === 'Dhuhr',
      isNext: nextPrayerName === 'Dhuhr',
    },
    {
      name: 'Asr',
      arabicName: ARABIC_PRAYER_NAMES.Asr,
      time: pt.asr,
      formattedTime: formatTime(pt.asr),
      isCurrent: currentPrayerName === 'Asr',
      isNext: nextPrayerName === 'Asr',
    },
    {
      name: 'Maghrib',
      arabicName: ARABIC_PRAYER_NAMES.Maghrib,
      time: pt.maghrib,
      formattedTime: formatTime(pt.maghrib),
      isCurrent: currentPrayerName === 'Maghrib',
      isNext: nextPrayerName === 'Maghrib',
    },
    {
      name: 'Isha',
      arabicName: ARABIC_PRAYER_NAMES.Isha,
      time: pt.isha,
      formattedTime: formatTime(pt.isha),
      isCurrent: currentPrayerName === 'Isha',
      isNext: nextPrayerName === 'Isha',
    },
  ];

  return {
    date,
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
    list,
    currentPrayer: currentPrayerName,
    nextPrayer: nextPrayerName,
    nextPrayerTime,
    secondsToNext,
  };
}

export function formatCountdown(secondsTotal: number): { hours: number; minutes: number; seconds: number; text: string } {
  const hours = Math.floor(secondsTotal / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    hours,
    minutes,
    seconds,
    text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}
