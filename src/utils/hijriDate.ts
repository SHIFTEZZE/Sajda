/**
 * Hijri Date Calculation with Moon Sighting Offset (-1, 0, +1)
 */

export interface HijriDateInfo {
  day: number;
  monthIndex: number; // 0 to 11
  monthNameEn: string;
  monthNameAr: string;
  year: number;
  formatted: string;
  formattedAr: string;
}

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi\'dah',
  'Dhu al-Hijjah',
];

export const HIJRI_MONTHS_AR = [
  'مُحَرَّم',
  'صَفَر',
  'رَبِيع الأَوَّل',
  'رَبِيع الآخِر',
  'جُمَادَى الأُولَى',
  'جُمَادَى الآخِرَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو القَعْدَة',
  'ذُو الحِجَّة',
];

/**
 * Calculates the Hijri date for a given Gregorian date and day shift offset (-1, 0, +1).
 * Uses Kuwaiti astronomical algorithm adjusted for civil calendar and regional moon-sighting.
 */
export function getHijriDate(date: Date = new Date(), dayShift: number = 0): HijriDateInfo {
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() + dayShift);

  let day = adjusted.getDate();
  let month = adjusted.getMonth();
  let year = adjusted.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  // Julian Day
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  const z = jd;
  const cyc = Math.floor((z - 1948439.5) / 10631);
  const rem = (z - 1948439.5) % 10631;

  const j = Math.floor((rem * 30 + 10646) / 10631);
  const hYear = cyc * 30 + j;

  // Day in the 30-year cycle
  const dayInCyc = Math.floor(rem) - Math.floor(((j - 1) * 10631 + 14) / 30);
  let hMonth = Math.min(11, Math.floor((dayInCyc * 11 + 330) / 325));
  let hDay = dayInCyc - Math.floor((hMonth * 325 - 320) / 11) + 1;

  if (hDay > 30) {
    hDay -= 30;
    hMonth += 1;
  }
  if (hMonth > 11) {
    hMonth = 0;
  }

  // Ensure day is at least 1 and capped properly
  const finalDay = Math.max(1, Math.min(30, Math.round(hDay)));
  const finalMonthIdx = Math.max(0, Math.min(11, hMonth));
  const finalYear = Math.max(1, Math.round(hYear));

  const monthEn = HIJRI_MONTHS_EN[finalMonthIdx];
  const monthAr = HIJRI_MONTHS_AR[finalMonthIdx];

  return {
    day: finalDay,
    monthIndex: finalMonthIdx,
    monthNameEn: monthEn,
    monthNameAr: monthAr,
    year: finalYear,
    formatted: `${finalDay} ${monthEn} ${finalYear} AH`,
    formattedAr: `${finalDay} ${monthAr} ${finalYear} هـ`,
  };
}
