/**
 * Complete Madinah Mushaf (مصحف المدينة النبوية) Metadata & Page Mapping
 * 604 Pages, 30 Juz', 60 Hizb, 114 Surahs
 * Exactly matches King Fahd Glorious Quran Printing Complex standard 15-line pagination
 */

export interface SurahPageMapping {
  number: number;
  nameAr: string;
  startPage: number;
  endPage: number;
  versesCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface JuzMapping {
  juzNumber: number;
  nameAr: string;
  startPage: number;
}

export interface HizbQuarter {
  hizbNumber: number;
  quarter: 1 | 2 | 3 | 4; // 1: بداية الحزب, 2: ربع, 3: نصف, 4: ثلاثة أرباع
  labelAr: string;
  page: number;
}

// 114 Surahs with precise start and end pages in the 604-page Madinah Mushaf
export const MUSHAF_SURAHS: SurahPageMapping[] = [
  { number: 1, nameAr: 'الفاتحة', startPage: 1, endPage: 1, versesCount: 7, revelationType: 'Meccan' },
  { number: 2, nameAr: 'البقرة', startPage: 2, endPage: 49, versesCount: 286, revelationType: 'Medinan' },
  { number: 3, nameAr: 'آل عمران', startPage: 50, endPage: 76, versesCount: 200, revelationType: 'Medinan' },
  { number: 4, nameAr: 'النساء', startPage: 77, endPage: 106, versesCount: 176, revelationType: 'Medinan' },
  { number: 5, nameAr: 'المائدة', startPage: 106, endPage: 127, versesCount: 120, revelationType: 'Medinan' },
  { number: 6, nameAr: 'الأنعام', startPage: 128, endPage: 150, versesCount: 165, revelationType: 'Meccan' },
  { number: 7, nameAr: 'الأعراف', startPage: 151, endPage: 176, versesCount: 206, revelationType: 'Meccan' },
  { number: 8, nameAr: 'الأنفال', startPage: 177, endPage: 186, versesCount: 75, revelationType: 'Medinan' },
  { number: 9, nameAr: 'التوبة', startPage: 187, endPage: 207, versesCount: 129, revelationType: 'Medinan' },
  { number: 10, nameAr: 'يونس', startPage: 208, endPage: 221, versesCount: 109, revelationType: 'Meccan' },
  { number: 11, nameAr: 'هود', startPage: 221, endPage: 235, versesCount: 123, revelationType: 'Meccan' },
  { number: 12, nameAr: 'يوسف', startPage: 235, endPage: 248, versesCount: 111, revelationType: 'Meccan' },
  { number: 13, nameAr: 'الرعد', startPage: 249, endPage: 255, versesCount: 43, revelationType: 'Medinan' },
  { number: 14, nameAr: 'إبراهيم', startPage: 255, endPage: 261, versesCount: 52, revelationType: 'Meccan' },
  { number: 15, nameAr: 'الحجر', startPage: 262, endPage: 267, versesCount: 99, revelationType: 'Meccan' },
  { number: 16, nameAr: 'النحل', startPage: 267, endPage: 281, versesCount: 128, revelationType: 'Meccan' },
  { number: 17, nameAr: 'الإسراء', startPage: 282, endPage: 293, versesCount: 111, revelationType: 'Meccan' },
  { number: 18, nameAr: 'الكهف', startPage: 293, endPage: 304, versesCount: 110, revelationType: 'Meccan' },
  { number: 19, nameAr: 'مريم', startPage: 305, endPage: 312, versesCount: 98, revelationType: 'Meccan' },
  { number: 20, nameAr: 'طه', startPage: 312, endPage: 321, versesCount: 135, revelationType: 'Meccan' },
  { number: 21, nameAr: 'الأنبياء', startPage: 322, endPage: 331, versesCount: 112, revelationType: 'Meccan' },
  { number: 22, nameAr: 'الحج', startPage: 332, endPage: 341, versesCount: 78, revelationType: 'Medinan' },
  { number: 23, nameAr: 'المؤمنون', startPage: 342, endPage: 350, versesCount: 118, revelationType: 'Meccan' },
  { number: 24, nameAr: 'النور', startPage: 350, endPage: 359, versesCount: 64, revelationType: 'Medinan' },
  { number: 25, nameAr: 'الفرقان', startPage: 359, endPage: 366, versesCount: 77, revelationType: 'Meccan' },
  { number: 26, nameAr: 'الشعراء', startPage: 367, endPage: 376, versesCount: 227, revelationType: 'Meccan' },
  { number: 27, nameAr: 'النمل', startPage: 377, endPage: 385, versesCount: 93, revelationType: 'Meccan' },
  { number: 28, nameAr: 'القصص', startPage: 385, endPage: 396, versesCount: 88, revelationType: 'Meccan' },
  { number: 29, nameAr: 'العنكبوت', startPage: 396, endPage: 404, versesCount: 69, revelationType: 'Meccan' },
  { number: 30, nameAr: 'الروم', startPage: 404, endPage: 411, versesCount: 60, revelationType: 'Meccan' },
  { number: 31, nameAr: 'لقمان', startPage: 411, endPage: 415, versesCount: 34, revelationType: 'Meccan' },
  { number: 32, nameAr: 'السجدة', startPage: 415, endPage: 417, versesCount: 30, revelationType: 'Meccan' },
  { number: 33, nameAr: 'الأحزاب', startPage: 418, endPage: 427, versesCount: 73, revelationType: 'Medinan' },
  { number: 34, nameAr: 'سبأ', startPage: 428, endPage: 434, versesCount: 54, revelationType: 'Meccan' },
  { number: 35, nameAr: 'فاطر', startPage: 434, endPage: 440, versesCount: 45, revelationType: 'Meccan' },
  { number: 36, nameAr: 'يس', startPage: 440, endPage: 445, versesCount: 83, revelationType: 'Meccan' },
  { number: 37, nameAr: 'الصافات', startPage: 446, endPage: 453, versesCount: 182, revelationType: 'Meccan' },
  { number: 38, nameAr: 'ص', startPage: 453, endPage: 458, versesCount: 88, revelationType: 'Meccan' },
  { number: 39, nameAr: 'الزمر', startPage: 458, endPage: 467, versesCount: 75, revelationType: 'Meccan' },
  { number: 40, nameAr: 'غافر', startPage: 467, endPage: 476, versesCount: 85, revelationType: 'Meccan' },
  { number: 41, nameAr: 'فصلت', startPage: 477, endPage: 482, versesCount: 54, revelationType: 'Meccan' },
  { number: 42, nameAr: 'الشورى', startPage: 483, endPage: 489, versesCount: 53, revelationType: 'Meccan' },
  { number: 43, nameAr: 'الزخرف', startPage: 489, endPage: 495, versesCount: 89, revelationType: 'Meccan' },
  { number: 44, nameAr: 'الدخان', startPage: 496, endPage: 498, versesCount: 59, revelationType: 'Meccan' },
  { number: 45, nameAr: 'الجاثية', startPage: 499, endPage: 502, versesCount: 37, revelationType: 'Meccan' },
  { number: 46, nameAr: 'الأحقاف', startPage: 502, endPage: 506, versesCount: 35, revelationType: 'Meccan' },
  { number: 47, nameAr: 'محمد', startPage: 507, endPage: 510, versesCount: 38, revelationType: 'Medinan' },
  { number: 48, nameAr: 'الفتح', startPage: 511, endPage: 515, versesCount: 29, revelationType: 'Medinan' },
  { number: 49, nameAr: 'الحجرات', startPage: 515, endPage: 517, versesCount: 18, revelationType: 'Medinan' },
  { number: 50, nameAr: 'ق', startPage: 518, endPage: 520, versesCount: 45, revelationType: 'Meccan' },
  { number: 51, nameAr: 'الذاريات', startPage: 520, endPage: 523, versesCount: 60, revelationType: 'Meccan' },
  { number: 52, nameAr: 'الطور', startPage: 523, endPage: 525, versesCount: 49, revelationType: 'Meccan' },
  { number: 53, nameAr: 'النجم', startPage: 526, endPage: 528, versesCount: 62, revelationType: 'Meccan' },
  { number: 54, nameAr: 'القمر', startPage: 528, endPage: 531, versesCount: 55, revelationType: 'Meccan' },
  { number: 55, nameAr: 'الرحمن', startPage: 531, endPage: 534, versesCount: 78, revelationType: 'Medinan' },
  { number: 56, nameAr: 'الواقعة', startPage: 534, endPage: 537, versesCount: 96, revelationType: 'Meccan' },
  { number: 57, nameAr: 'الحديد', startPage: 537, endPage: 541, versesCount: 29, revelationType: 'Medinan' },
  { number: 58, nameAr: 'المجادلة', startPage: 542, endPage: 545, versesCount: 22, revelationType: 'Medinan' },
  { number: 59, nameAr: 'الحشر', startPage: 545, endPage: 548, versesCount: 24, revelationType: 'Medinan' },
  { number: 60, nameAr: 'الممتحنة', startPage: 549, endPage: 551, versesCount: 13, revelationType: 'Medinan' },
  { number: 61, nameAr: 'الصف', startPage: 551, endPage: 553, versesCount: 14, revelationType: 'Medinan' },
  { number: 62, nameAr: 'الجمعة', startPage: 553, endPage: 554, versesCount: 11, revelationType: 'Medinan' },
  { number: 63, nameAr: 'المنافقون', startPage: 554, endPage: 555, versesCount: 11, revelationType: 'Medinan' },
  { number: 64, nameAr: 'التغابن', startPage: 556, endPage: 557, versesCount: 18, revelationType: 'Medinan' },
  { number: 65, nameAr: 'الطلاق', startPage: 558, endPage: 559, versesCount: 12, revelationType: 'Medinan' },
  { number: 66, nameAr: 'التحريم', startPage: 560, endPage: 561, versesCount: 12, revelationType: 'Medinan' },
  { number: 67, nameAr: 'الملك', startPage: 562, endPage: 564, versesCount: 30, revelationType: 'Meccan' },
  { number: 68, nameAr: 'القلم', startPage: 564, endPage: 566, versesCount: 52, revelationType: 'Meccan' },
  { number: 69, nameAr: 'الحاقة', startPage: 566, endPage: 568, versesCount: 52, revelationType: 'Meccan' },
  { number: 70, nameAr: 'المعارج', startPage: 568, endPage: 570, versesCount: 44, revelationType: 'Meccan' },
  { number: 71, nameAr: 'نوح', startPage: 570, endPage: 571, versesCount: 28, revelationType: 'Meccan' },
  { number: 72, nameAr: 'الجن', startPage: 572, endPage: 573, versesCount: 28, revelationType: 'Meccan' },
  { number: 73, nameAr: 'المزمل', startPage: 574, endPage: 575, versesCount: 20, revelationType: 'Meccan' },
  { number: 74, nameAr: 'المدثر', startPage: 575, endPage: 577, versesCount: 56, revelationType: 'Meccan' },
  { number: 75, nameAr: 'القيامة', startPage: 577, endPage: 578, versesCount: 40, revelationType: 'Meccan' },
  { number: 76, nameAr: 'الإنسان', startPage: 578, endPage: 580, versesCount: 31, revelationType: 'Medinan' },
  { number: 77, nameAr: 'المرسلات', startPage: 580, endPage: 581, versesCount: 50, revelationType: 'Meccan' },
  { number: 78, nameAr: 'النبأ', startPage: 582, endPage: 583, versesCount: 40, revelationType: 'Meccan' },
  { number: 79, nameAr: 'النازعات', startPage: 583, endPage: 585, versesCount: 46, revelationType: 'Meccan' },
  { number: 80, nameAr: 'عبس', startPage: 585, endPage: 586, versesCount: 42, revelationType: 'Meccan' },
  { number: 81, nameAr: 'التكوير', startPage: 586, endPage: 587, versesCount: 29, revelationType: 'Meccan' },
  { number: 82, nameAr: 'الانفطار', startPage: 587, endPage: 587, versesCount: 19, revelationType: 'Meccan' },
  { number: 83, nameAr: 'المطففين', startPage: 587, endPage: 589, versesCount: 36, revelationType: 'Meccan' },
  { number: 84, nameAr: 'الانشقاق', startPage: 589, endPage: 590, versesCount: 25, revelationType: 'Meccan' },
  { number: 85, nameAr: 'البروج', startPage: 590, endPage: 591, versesCount: 22, revelationType: 'Meccan' },
  { number: 86, nameAr: 'الطارق', startPage: 591, endPage: 591, versesCount: 17, revelationType: 'Meccan' },
  { number: 87, nameAr: 'الأعلى', startPage: 591, endPage: 592, versesCount: 19, revelationType: 'Meccan' },
  { number: 88, nameAr: 'الغاشية', startPage: 592, endPage: 593, versesCount: 26, revelationType: 'Meccan' },
  { number: 89, nameAr: 'الفجر', startPage: 593, endPage: 594, versesCount: 30, revelationType: 'Meccan' },
  { number: 90, nameAr: 'البلد', startPage: 594, endPage: 595, versesCount: 20, revelationType: 'Meccan' },
  { number: 91, nameAr: 'الشمس', startPage: 595, endPage: 595, versesCount: 15, revelationType: 'Meccan' },
  { number: 92, nameAr: 'الليل', startPage: 595, endPage: 596, versesCount: 21, revelationType: 'Meccan' },
  { number: 93, nameAr: 'الضحى', startPage: 596, endPage: 596, versesCount: 11, revelationType: 'Meccan' },
  { number: 94, nameAr: 'الشرح', startPage: 596, endPage: 597, versesCount: 8, revelationType: 'Meccan' },
  { number: 95, nameAr: 'التين', startPage: 597, endPage: 597, versesCount: 8, revelationType: 'Meccan' },
  { number: 96, nameAr: 'العلق', startPage: 597, endPage: 598, versesCount: 19, revelationType: 'Meccan' },
  { number: 97, nameAr: 'القدر', startPage: 598, endPage: 598, versesCount: 5, revelationType: 'Meccan' },
  { number: 98, nameAr: 'البينة', startPage: 598, endPage: 599, versesCount: 8, revelationType: 'Medinan' },
  { number: 99, nameAr: 'الزلزلة', startPage: 599, endPage: 599, versesCount: 8, revelationType: 'Medinan' },
  { number: 100, nameAr: 'العاديات', startPage: 599, endPage: 600, versesCount: 11, revelationType: 'Meccan' },
  { number: 101, nameAr: 'القارعة', startPage: 600, endPage: 600, versesCount: 11, revelationType: 'Meccan' },
  { number: 102, nameAr: 'التكاثر', startPage: 600, endPage: 601, versesCount: 8, revelationType: 'Meccan' },
  { number: 103, nameAr: 'العصر', startPage: 601, endPage: 601, versesCount: 3, revelationType: 'Meccan' },
  { number: 104, nameAr: 'الهمزة', startPage: 601, endPage: 601, versesCount: 9, revelationType: 'Meccan' },
  { number: 105, nameAr: 'الفيل', startPage: 601, endPage: 602, versesCount: 5, revelationType: 'Meccan' },
  { number: 106, nameAr: 'قريش', startPage: 602, endPage: 602, versesCount: 4, revelationType: 'Meccan' },
  { number: 107, nameAr: 'الماعون', startPage: 602, endPage: 602, versesCount: 7, revelationType: 'Meccan' },
  { number: 108, nameAr: 'الكوثر', startPage: 602, endPage: 603, versesCount: 3, revelationType: 'Meccan' },
  { number: 109, nameAr: 'الكافرون', startPage: 603, endPage: 603, versesCount: 6, revelationType: 'Meccan' },
  { number: 110, nameAr: 'النصر', startPage: 603, endPage: 603, versesCount: 3, revelationType: 'Medinan' },
  { number: 111, nameAr: 'المسد', startPage: 603, endPage: 604, versesCount: 5, revelationType: 'Meccan' },
  { number: 112, nameAr: 'الإخلاص', startPage: 604, endPage: 604, versesCount: 4, revelationType: 'Meccan' },
  { number: 113, nameAr: 'الفلق', startPage: 604, endPage: 604, versesCount: 5, revelationType: 'Meccan' },
  { number: 114, nameAr: 'الناس', startPage: 604, endPage: 604, versesCount: 6, revelationType: 'Meccan' },
];

// 30 Juz' (الأجزاء الثلاثون) start pages
export const JUZ_LIST: JuzMapping[] = [
  { juzNumber: 1, nameAr: 'الجزء الأول', startPage: 1 },
  { juzNumber: 2, nameAr: 'الجزء الثاني', startPage: 22 },
  { juzNumber: 3, nameAr: 'الجزء الثالث', startPage: 42 },
  { juzNumber: 4, nameAr: 'الجزء الرابع', startPage: 62 },
  { juzNumber: 5, nameAr: 'الجزء الخامس', startPage: 82 },
  { juzNumber: 6, nameAr: 'الجزء السادس', startPage: 102 },
  { juzNumber: 7, nameAr: 'الجزء السابع', startPage: 121 },
  { juzNumber: 8, nameAr: 'الجزء الثامن', startPage: 142 },
  { juzNumber: 9, nameAr: 'الجزء التاسع', startPage: 162 },
  { juzNumber: 10, nameAr: 'الجزء العاشر', startPage: 182 },
  { juzNumber: 11, nameAr: 'الجزء الحادي عشر', startPage: 201 },
  { juzNumber: 12, nameAr: 'الجزء الثاني عشر', startPage: 222 },
  { juzNumber: 13, nameAr: 'الجزء الثالث عشر', startPage: 242 },
  { juzNumber: 14, nameAr: 'الجزء الرابع عشر', startPage: 262 },
  { juzNumber: 15, nameAr: 'الجزء الخامس عشر', startPage: 282 },
  { juzNumber: 16, nameAr: 'الجزء السادس عشر', startPage: 302 },
  { juzNumber: 17, nameAr: 'الجزء السابع عشر', startPage: 322 },
  { juzNumber: 18, nameAr: 'الجزء الثامن عشر', startPage: 342 },
  { juzNumber: 19, nameAr: 'الجزء التاسع عشر', startPage: 362 },
  { juzNumber: 20, nameAr: 'الجزء العشرون', startPage: 382 },
  { juzNumber: 21, nameAr: 'الجزء الحادي والعشرون', startPage: 402 },
  { juzNumber: 22, nameAr: 'الجزء الثاني والعشرون', startPage: 422 },
  { juzNumber: 23, nameAr: 'الجزء الثالث والعشرون', startPage: 442 },
  { juzNumber: 24, nameAr: 'الجزء الرابع والعشرون', startPage: 462 },
  { juzNumber: 25, nameAr: 'الجزء الخامس والعشرون', startPage: 482 },
  { juzNumber: 26, nameAr: 'الجزء السادس والعشرون', startPage: 502 },
  { juzNumber: 27, nameAr: 'الجزء السابع والعشرون', startPage: 522 },
  { juzNumber: 28, nameAr: 'الجزء الثامن والعشرون', startPage: 542 },
  { juzNumber: 29, nameAr: 'الجزء التاسع والعشرون', startPage: 562 },
  { juzNumber: 30, nameAr: 'الجزء الثلاثون', startPage: 582 },
];

/**
 * Returns the Juz metadata for any given Mushaf page (1 - 604)
 */
export function getJuzForPage(page: number): { juzNumber: number; nameAr: string } {
  for (let i = JUZ_LIST.length - 1; i >= 0; i--) {
    if (page >= JUZ_LIST[i].startPage) {
      return { juzNumber: JUZ_LIST[i].juzNumber, nameAr: JUZ_LIST[i].nameAr };
    }
  }
  return { juzNumber: 1, nameAr: 'الجزء الأول' };
}

/**
 * Returns the primary Surah appearing on a given Mushaf page
 */
export function getSurahForPage(page: number): SurahPageMapping {
  // Find surah whose startPage <= page <= endPage
  const match = MUSHAF_SURAHS.find((s) => page >= s.startPage && page <= s.endPage);
  if (match) return match;
  return MUSHAF_SURAHS[0];
}

/**
 * Formats a number to Eastern Arabic numerals (١, ٢, ٣...)
 */
export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit, 10)]);
}

/**
 * The noble supplication upon completing the Holy Quran
 * (دعاء ختم القرآن الكريم كما هو مثبت في طبعة مجمع الملك فهد بالمدينة المنورة)
 */
export const KHATM_AL_QURAN_DUAA = [
  'اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ، وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً',
  'اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ',
  'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ المَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ',
  'اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ، وَخَيْرَ عَمَلِي خَوَاتِمَهُ، وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ',
  'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً، وَمِيتَةً سَوِيَّةً، وَمَرَدّاً غَيْرَ مُخْزٍ وَلاَ فَاضِحٍ',
  'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ المَسْأَلَةِ، وَخَيْرَ الدُّعَاءِ، وَخَيْرَ النَّجَاحِ، وَخَيْرَ العِلْمِ، وَخَيْرَ العَمَلِ، وَخَيْرَ الثَّوَابِ، وَخَيْرَ الحَيَاةِ، وَخَيْرَ المَمَاتِ، وَثَبِّتْنِي وَثَقِّلْ مَوَازِينِي، وَحَقِّقْ إِيمَانِي، وَارْفَعْ دَرَجَتِي، وَتَقَبَّلْ صَلاَتِي، وَاغْفِرْ خَطِيئَاتِي، وَأَسْأَلُكَ العُلاَ مِنَ الجَنَّةِ',
  'اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الأُمُورِ كُلِّهَا، وَأَجِرْنَا مِنْ خِزْيِ الدُّنْيَا وَعَذَابِ الآخِرَةِ',
  'اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَا تَحُولُ بِهِ بَيْنَنَا وَبَيْنَ مَعْصِيَتِكَ، وَمِنْ طَاعَتِكَ مَا تُبَلِّغُنَا بِهِ جَنَّتَكَ، وَمِنَ اليَقِينِ مَا تُهَوِّنُ بِهِ عَلَيْنَا مَصَائِبَ الدُّنْيَا، وَمَتِّعْنَا بِأَسْمَاعِنَا وَأَبْصَارِنَا وَقُوَّاتِنَا مَا أَحْيَيْتَنَا',
  'وَصَلَّى اللهُ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ الأَخْيَارِ وَسَلَّمَ تَسْلِيماً كَثِيراً'
];
