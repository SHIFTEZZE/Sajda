/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import type { PrayerTimesConfig } from './prayerTimes.ts';
import {
  calculatePrayerTimes,
  getMoroccoParameters,
  formatCountdown,
} from './prayerTimes.ts';
import {
  calculateQiblaBearing,
  calculateDistanceToKaaba,
  calculateNeedleAngle,
} from './qibla.ts';
import {
  getHijriDate,
} from './hijriDate.ts';
import type { PrayerRecord } from './trackerLogic.ts';
import {
  computeStatsForRecords,
  createRecordId,
} from './trackerLogic.ts';

test('Morocco Calculation Parameters follow Ministry of Habous specification', () => {
  const params = getMoroccoParameters();
  assert.equal(params.fajrAngle, 19, 'Fajr angle should be 19 degrees');
  assert.equal(params.ishaAngle, 17, 'Isha angle should be 17 degrees');
});

test('calculatePrayerTimes produces valid ordered times for Casablanca', () => {
  const config: PrayerTimesConfig = {
    latitude: 33.5731, // Casablanca
    longitude: -7.5898,
    method: 'Morocco',
    asrMethod: 'Standard',
    highLatitudeRule: 'MiddleOfTheNight',
    adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  };

  const testDate = new Date(2026, 9, 17, 12, 0, 0); // Oct 17, 2026
  const times = calculatePrayerTimes(config, testDate, testDate);

  assert.ok(times.fajr instanceof Date, 'Fajr is Date');
  assert.ok(times.sunrise instanceof Date, 'Sunrise is Date');
  assert.ok(times.dhuhr instanceof Date, 'Dhuhr is Date');
  assert.ok(times.asr instanceof Date, 'Asr is Date');
  assert.ok(times.maghrib instanceof Date, 'Maghrib is Date');
  assert.ok(times.isha instanceof Date, 'Isha is Date');

  assert.ok(times.fajr.getTime() < times.sunrise.getTime(), 'Fajr is before Sunrise');
  assert.ok(times.sunrise.getTime() < times.dhuhr.getTime(), 'Sunrise is before Dhuhr');
  assert.ok(times.dhuhr.getTime() < times.asr.getTime(), 'Dhuhr is before Asr');
  assert.ok(times.asr.getTime() < times.maghrib.getTime(), 'Asr is before Maghrib');
  assert.ok(times.maghrib.getTime() < times.isha.getTime(), 'Maghrib is before Isha');
  assert.equal(times.list.length, 5, 'Contains 5 daily prayers');
});

test('Countdown formatting formats correctly', () => {
  const formatted = formatCountdown(3665);
  assert.equal(formatted.hours, 1);
  assert.equal(formatted.minutes, 1);
  assert.equal(formatted.seconds, 5);
  assert.equal(formatted.text, '01:01:05');
});

test('Qibla bearing from Casablanca and Mecca', () => {
  const bearingCasablanca = calculateQiblaBearing(33.5731, -7.5898);
  assert.ok(bearingCasablanca > 90 && bearingCasablanca < 105, `Casablanca bearing is reasonable: ${bearingCasablanca}`);

  const distance = calculateDistanceToKaaba(33.5731, -7.5898);
  assert.ok(distance > 4500 && distance < 5000, `Distance Casablanca to Makkah is ~4700km, got ${distance}`);

  const needle = calculateNeedleAngle(0, bearingCasablanca);
  assert.equal(Math.round(needle), Math.round(bearingCasablanca));
});

test('Hijri Date calculation and offset shift', () => {
  const d = new Date(2026, 9, 17);
  const base = getHijriDate(d, 0);
  const plusOne = getHijriDate(d, 1);
  const minusOne = getHijriDate(d, -1);

  assert.ok(base.year >= 1445, `Hijri year should be around 1448 AH, got ${base.year}`);
  assert.ok(base.day >= 1 && base.day <= 30, 'Day between 1 and 30');
  assert.ok(base.monthNameEn.length > 0, 'Month name present');

  assert.notEqual(base.day, plusOne.day === 1 ? -99 : plusOne.day);
  assert.notEqual(base.day, minusOne.day === 30 ? -99 : minusOne.day);
});

test('Prayer tracker statistics strictly ignores unrecorded prayers', () => {
  const date = '2026-10-17';
  const records: (PrayerRecord | undefined)[] = [
    { id: createRecordId(date, 'Fajr'), date, prayer: 'Fajr', state: 'prayed_on_time', updatedAt: 1000 },
    { id: createRecordId(date, 'Dhuhr'), date, prayer: 'Dhuhr', state: 'prayed_later', updatedAt: 2000 },
    { id: createRecordId(date, 'Asr'), date, prayer: 'Asr', state: 'not_performed', updatedAt: 3000 },
    { id: createRecordId(date, 'Maghrib'), date, prayer: 'Maghrib', state: 'not_recorded', updatedAt: 4000 },
    undefined,
  ];

  const stats = computeStatsForRecords(records);
  assert.equal(stats.totalRecorded, 3, 'Only 3 prayers were recorded');
  assert.equal(stats.unrecorded, 2, '2 prayers are unrecorded');
  assert.equal(stats.prayedOnTime, 1, '1 prayed on time');
  assert.equal(stats.prayedLater, 1, '1 prayed later');
  assert.equal(stats.notPerformed, 1, '1 marked not performed');
  assert.equal(stats.totalPrayed, 2, '2 total prayed');

  assert.equal(stats.onTimePercentage, 33, '33% on-time among recorded');
  assert.equal(stats.completionPercentage, 67, '67% completed among recorded');
});
