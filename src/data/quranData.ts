/**
 * Offline Bundled Quran Data
 * Complete catalog of all 114 Surahs + verified Uthmani verses for reading.
 * Source: Tanzil verified text.
 */

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  translation: string;
  versesCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  surahNumber: number;
  numberInSurah: number;
  textArabic: string;
  textEnglish: string;
}

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  note?: string;
  createdAt: number;
}

export interface ReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  updatedAt: number;
}

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatihah', translation: 'The Opening', versesCount: 7, revelationType: 'Meccan' },
  { number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', translation: 'The Cow', versesCount: 286, revelationType: 'Medinan' },
  { number: 3, nameArabic: 'آل عمران', nameEnglish: 'Ali \'Imran', translation: 'Family of Imran', versesCount: 200, revelationType: 'Medinan' },
  { number: 4, nameArabic: 'النساء', nameEnglish: 'An-Nisa', translation: 'The Women', versesCount: 176, revelationType: 'Medinan' },
  { number: 5, nameArabic: 'المائدة', nameEnglish: 'Al-Ma\'idah', translation: 'The Table Spread', versesCount: 120, revelationType: 'Medinan' },
  { number: 6, nameArabic: 'الأنعام', nameEnglish: 'Al-An\'am', translation: 'The Cattle', versesCount: 165, revelationType: 'Meccan' },
  { number: 7, nameArabic: 'الأعراف', nameEnglish: 'Al-A\'raf', translation: 'The Heights', versesCount: 206, revelationType: 'Meccan' },
  { number: 8, nameArabic: 'الأنفال', nameEnglish: 'Al-Anfal', translation: 'The Spoils of War', versesCount: 75, revelationType: 'Medinan' },
  { number: 9, nameArabic: 'التوبة', nameEnglish: 'At-Tawbah', translation: 'The Repentance', versesCount: 129, revelationType: 'Medinan' },
  { number: 10, nameArabic: 'يونس', nameEnglish: 'Yunus', translation: 'Jonah', versesCount: 109, revelationType: 'Meccan' },
  { number: 11, nameArabic: 'هود', nameEnglish: 'Hud', translation: 'Hud', versesCount: 123, revelationType: 'Meccan' },
  { number: 12, nameArabic: 'يوسف', nameEnglish: 'Yusuf', translation: 'Joseph', versesCount: 111, revelationType: 'Meccan' },
  { number: 13, nameArabic: 'الرعد', nameEnglish: 'Ar-Ra\'d', translation: 'The Thunder', versesCount: 43, revelationType: 'Medinan' },
  { number: 14, nameArabic: 'إبراهيم', nameEnglish: 'Ibrahim', translation: 'Abraham', versesCount: 52, revelationType: 'Meccan' },
  { number: 15, nameArabic: 'الحجر', nameEnglish: 'Al-Hijr', translation: 'The Rocky Tract', versesCount: 99, revelationType: 'Meccan' },
  { number: 16, nameArabic: 'النحل', nameEnglish: 'An-Nahl', translation: 'The Bee', versesCount: 128, revelationType: 'Meccan' },
  { number: 17, nameArabic: 'الإسراء', nameEnglish: 'Al-Isra', translation: 'The Night Journey', versesCount: 111, revelationType: 'Meccan' },
  { number: 18, nameArabic: 'الكهف', nameEnglish: 'Al-Kahf', translation: 'The Cave', versesCount: 110, revelationType: 'Meccan' },
  { number: 19, nameArabic: 'مريم', nameEnglish: 'Maryam', translation: 'Mary', versesCount: 98, revelationType: 'Meccan' },
  { number: 20, nameArabic: 'طه', nameEnglish: 'Taha', translation: 'Ta-Ha', versesCount: 135, revelationType: 'Meccan' },
  { number: 21, nameArabic: 'الأنبياء', nameEnglish: 'Al-Anbiya', translation: 'The Prophets', versesCount: 112, revelationType: 'Meccan' },
  { number: 22, nameArabic: 'الحج', nameEnglish: 'Al-Hajj', translation: 'The Pilgrimage', versesCount: 78, revelationType: 'Medinan' },
  { number: 23, nameArabic: 'المؤمنون', nameEnglish: 'Al-Mu\'minun', translation: 'The Believers', versesCount: 118, revelationType: 'Meccan' },
  { number: 24, nameArabic: 'النور', nameEnglish: 'An-Nur', translation: 'The Light', versesCount: 64, revelationType: 'Medinan' },
  { number: 25, nameArabic: 'الفرقان', nameEnglish: 'Al-Furqan', translation: 'The Criterion', versesCount: 77, revelationType: 'Meccan' },
  { number: 26, nameArabic: 'الشعراء', nameEnglish: 'Ash-Shu\'ara', translation: 'The Poets', versesCount: 227, revelationType: 'Meccan' },
  { number: 27, nameArabic: 'النمل', nameEnglish: 'An-Naml', translation: 'The Ant', versesCount: 93, revelationType: 'Meccan' },
  { number: 28, nameArabic: 'القصص', nameEnglish: 'Al-Qasas', translation: 'The Stories', versesCount: 88, revelationType: 'Meccan' },
  { number: 29, nameArabic: 'العنكبوت', nameEnglish: 'Al-\'Ankabut', translation: 'The Spider', versesCount: 69, revelationType: 'Meccan' },
  { number: 30, nameArabic: 'الروم', nameEnglish: 'Ar-Rum', translation: 'The Romans', versesCount: 60, revelationType: 'Meccan' },
  { number: 31, nameArabic: 'لقمان', nameEnglish: 'Luqman', translation: 'Luqman', versesCount: 34, revelationType: 'Meccan' },
  { number: 32, nameArabic: 'السجدة', nameEnglish: 'As-Sajdah', translation: 'The Prostration', versesCount: 30, revelationType: 'Meccan' },
  { number: 33, nameArabic: 'الأحزاب', nameEnglish: 'Al-Ahzab', translation: 'The Combined Forces', versesCount: 73, revelationType: 'Medinan' },
  { number: 34, nameArabic: 'سبأ', nameEnglish: 'Saba', translation: 'Sheba', versesCount: 54, revelationType: 'Meccan' },
  { number: 35, nameArabic: 'فاطر', nameEnglish: 'Fatir', translation: 'Originator', versesCount: 45, revelationType: 'Meccan' },
  { number: 36, nameArabic: 'يس', nameEnglish: 'Ya-Sin', translation: 'Ya Sin', versesCount: 83, revelationType: 'Meccan' },
  { number: 37, nameArabic: 'الصافات', nameEnglish: 'As-Saffat', translation: 'Those who set the Ranks', versesCount: 182, revelationType: 'Meccan' },
  { number: 38, nameArabic: 'ص', nameEnglish: 'Sad', translation: 'The Letter "Saad"', versesCount: 88, revelationType: 'Meccan' },
  { number: 39, nameArabic: 'الزمر', nameEnglish: 'Az-Zumar', translation: 'The Troops', versesCount: 75, revelationType: 'Meccan' },
  { number: 40, nameArabic: 'غافر', nameEnglish: 'Ghafir', translation: 'The Forgiver', versesCount: 85, revelationType: 'Meccan' },
  { number: 41, nameArabic: 'فصلت', nameEnglish: 'Fussilat', translation: 'Explained in Detail', versesCount: 54, revelationType: 'Meccan' },
  { number: 42, nameArabic: 'الشورى', nameEnglish: 'Ash-Shura', translation: 'The Consultation', versesCount: 53, revelationType: 'Meccan' },
  { number: 43, nameArabic: 'الزخرف', nameEnglish: 'Az-Zukhruf', translation: 'The Ornaments of Gold', versesCount: 89, revelationType: 'Meccan' },
  { number: 44, nameArabic: 'الدخان', nameEnglish: 'Ad-Dukhan', translation: 'The Smoke', versesCount: 59, revelationType: 'Meccan' },
  { number: 45, nameArabic: 'الجاثية', nameEnglish: 'Al-Jathiyah', translation: 'The Crouching', versesCount: 37, revelationType: 'Meccan' },
  { number: 46, nameArabic: 'الأحقاف', nameEnglish: 'Al-Ahqaf', translation: 'The Wind-Curved Sandhills', versesCount: 35, revelationType: 'Meccan' },
  { number: 47, nameArabic: 'محمد', nameEnglish: 'Muhammad', translation: 'Muhammad', versesCount: 38, revelationType: 'Medinan' },
  { number: 48, nameArabic: 'الفتح', nameEnglish: 'Al-Fath', translation: 'The Victory', versesCount: 29, revelationType: 'Medinan' },
  { number: 49, nameArabic: 'الحجرات', nameEnglish: 'Al-Hujurat', translation: 'The Rooms', versesCount: 18, revelationType: 'Medinan' },
  { number: 50, nameArabic: 'ق', nameEnglish: 'Qaf', translation: 'The Letter "Qaf"', versesCount: 45, revelationType: 'Meccan' },
  { number: 51, nameArabic: 'الذاريات', nameEnglish: 'Adh-Dhariyat', translation: 'The Winnowing Winds', versesCount: 60, revelationType: 'Meccan' },
  { number: 52, nameArabic: 'الطور', nameEnglish: 'At-Tur', translation: 'The Mount', versesCount: 49, revelationType: 'Meccan' },
  { number: 53, nameArabic: 'النجم', nameEnglish: 'An-Najm', translation: 'The Star', versesCount: 62, revelationType: 'Meccan' },
  { number: 54, nameArabic: 'القمر', nameEnglish: 'Al-Qamar', translation: 'The Moon', versesCount: 55, revelationType: 'Meccan' },
  { number: 55, nameArabic: 'الرحمن', nameEnglish: 'Ar-Rahman', translation: 'The Beneficent', versesCount: 78, revelationType: 'Medinan' },
  { number: 56, nameArabic: 'الواقعة', nameEnglish: 'Al-Waqi\'ah', translation: 'The Inevitable', versesCount: 96, revelationType: 'Meccan' },
  { number: 57, nameArabic: 'الحديد', nameEnglish: 'Al-Hadid', translation: 'The Iron', versesCount: 29, revelationType: 'Medinan' },
  { number: 58, nameArabic: 'المجادلة', nameEnglish: 'Al-Mujadila', translation: 'The Pleading Woman', versesCount: 22, revelationType: 'Medinan' },
  { number: 59, nameArabic: 'الحشر', nameEnglish: 'Al-Hashr', translation: 'The Exile', versesCount: 24, revelationType: 'Medinan' },
  { number: 60, nameArabic: 'الممتحنة', nameEnglish: 'Al-Mumtahanah', translation: 'She that is to be examined', versesCount: 13, revelationType: 'Medinan' },
  { number: 61, nameArabic: 'الصف', nameEnglish: 'As-Saf', translation: 'The Ranks', versesCount: 14, revelationType: 'Medinan' },
  { number: 62, nameArabic: 'الجمعة', nameEnglish: 'Al-Jumu\'ah', translation: 'The Congregation', versesCount: 11, revelationType: 'Medinan' },
  { number: 63, nameArabic: 'المنافقون', nameEnglish: 'Al-Munafiqun', translation: 'The Hypocrites', versesCount: 11, revelationType: 'Medinan' },
  { number: 64, nameArabic: 'التغابن', nameEnglish: 'At-Taghabun', translation: 'The Mutual Disillusion', versesCount: 18, revelationType: 'Medinan' },
  { number: 65, nameArabic: 'الطلاق', nameEnglish: 'At-Talaq', translation: 'The Divorce', versesCount: 12, revelationType: 'Medinan' },
  { number: 66, nameArabic: 'التحريم', nameEnglish: 'At-Tahrim', translation: 'The Prohibition', versesCount: 12, revelationType: 'Medinan' },
  { number: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', translation: 'The Sovereignty', versesCount: 30, revelationType: 'Meccan' },
  { number: 68, nameArabic: 'القلم', nameEnglish: 'Al-Qalam', translation: 'The Pen', versesCount: 52, revelationType: 'Meccan' },
  { number: 69, nameArabic: 'الحاقة', nameEnglish: 'Al-Haqqah', translation: 'The Reality', versesCount: 52, revelationType: 'Meccan' },
  { number: 70, nameArabic: 'المعارج', nameEnglish: 'Al-Ma\'arij', translation: 'The Ascending Stairways', versesCount: 44, revelationType: 'Meccan' },
  { number: 71, nameArabic: 'نوح', nameEnglish: 'Nuh', translation: 'Noah', versesCount: 28, revelationType: 'Meccan' },
  { number: 72, nameArabic: 'الجن', nameEnglish: 'Al-Jinn', translation: 'The Jinn', versesCount: 28, revelationType: 'Meccan' },
  { number: 73, nameArabic: 'المزمل', nameEnglish: 'Al-Muzzammil', translation: 'The Enshrouded One', versesCount: 20, revelationType: 'Meccan' },
  { number: 74, nameArabic: 'المدثر', nameEnglish: 'Al-Muddaththir', translation: 'The Cloaked One', versesCount: 56, revelationType: 'Meccan' },
  { number: 75, nameArabic: 'القيامة', nameEnglish: 'Al-Qiyamah', translation: 'The Resurrection', versesCount: 40, revelationType: 'Meccan' },
  { number: 76, nameArabic: 'الإنسان', nameEnglish: 'Al-Insan', translation: 'The Human', versesCount: 31, revelationType: 'Medinan' },
  { number: 77, nameArabic: 'المرسلات', nameEnglish: 'Al-Mursalat', translation: 'The Emissaries', versesCount: 50, revelationType: 'Meccan' },
  { number: 78, nameArabic: 'النبأ', nameEnglish: 'An-Naba', translation: 'The Tidings', versesCount: 40, revelationType: 'Meccan' },
  { number: 79, nameArabic: 'النازعات', nameEnglish: 'An-Nazi\'at', translation: 'Those who drag forth', versesCount: 46, revelationType: 'Meccan' },
  { number: 80, nameArabic: 'عبس', nameEnglish: '\'Abasa', translation: 'He Frowned', versesCount: 42, revelationType: 'Meccan' },
  { number: 81, nameArabic: 'التكوير', nameEnglish: 'At-Takwir', translation: 'The Overthrowing', versesCount: 29, revelationType: 'Meccan' },
  { number: 82, nameArabic: 'الانفطار', nameEnglish: 'Al-Infitar', translation: 'The Cleaving', versesCount: 19, revelationType: 'Meccan' },
  { number: 83, nameArabic: 'المطففين', nameEnglish: 'Al-Mutaffifin', translation: 'The Defrauding', versesCount: 36, revelationType: 'Meccan' },
  { number: 84, nameArabic: 'الانشقاق', nameEnglish: 'Al-Inshiqaq', translation: 'The Splitting Open', versesCount: 25, revelationType: 'Meccan' },
  { number: 85, nameArabic: 'البروج', nameEnglish: 'Al-Buruj', translation: 'The Mansions of the Stars', versesCount: 22, revelationType: 'Meccan' },
  { number: 86, nameArabic: 'الطارق', nameEnglish: 'At-Tariq', translation: 'The Morning Star', versesCount: 17, revelationType: 'Meccan' },
  { number: 87, nameArabic: 'الأعلى', nameEnglish: 'Al-A\'la', translation: 'The Most High', versesCount: 19, revelationType: 'Meccan' },
  { number: 88, nameArabic: 'الغاشية', nameEnglish: 'Al-Ghashiyah', translation: 'The Overwhelming', versesCount: 26, revelationType: 'Meccan' },
  { number: 89, nameArabic: 'الفجر', nameEnglish: 'Al-Fajr', translation: 'The Dawn', versesCount: 30, revelationType: 'Meccan' },
  { number: 90, nameArabic: 'البلد', nameEnglish: 'Al-Balad', translation: 'The City', versesCount: 20, revelationType: 'Meccan' },
  { number: 91, nameArabic: 'الشمس', nameEnglish: 'Ash-Shams', translation: 'The Sun', versesCount: 15, revelationType: 'Meccan' },
  { number: 92, nameArabic: 'الليل', nameEnglish: 'Al-Layl', translation: 'The Night', versesCount: 21, revelationType: 'Meccan' },
  { number: 93, nameArabic: 'الضحى', nameEnglish: 'Ad-Duhaa', translation: 'The Morning Hours', versesCount: 11, revelationType: 'Meccan' },
  { number: 94, nameArabic: 'الشرح', nameEnglish: 'Ash-Sharh', translation: 'The Relief', versesCount: 8, revelationType: 'Meccan' },
  { number: 95, nameArabic: 'التين', nameEnglish: 'At-Tin', translation: 'The Fig', versesCount: 8, revelationType: 'Meccan' },
  { number: 96, nameArabic: 'العلق', nameEnglish: 'Al-\'Alaq', translation: 'The Clot', versesCount: 19, revelationType: 'Meccan' },
  { number: 97, nameArabic: 'القدر', nameEnglish: 'Al-Qadr', translation: 'The Power', versesCount: 5, revelationType: 'Meccan' },
  { number: 98, nameArabic: 'البينة', nameEnglish: 'Al-Bayyinah', translation: 'The Clear Proof', versesCount: 8, revelationType: 'Medinan' },
  { number: 99, nameArabic: 'الزلزلة', nameEnglish: 'Az-Zalzalah', translation: 'The Earthquake', versesCount: 8, revelationType: 'Medinan' },
  { number: 100, nameArabic: 'العاديات', nameEnglish: 'Al-\'Adiyat', translation: 'The Courser', versesCount: 11, revelationType: 'Meccan' },
  { number: 101, nameArabic: 'القارعة', nameEnglish: 'Al-Qari\'ah', translation: 'The Calamity', versesCount: 11, revelationType: 'Meccan' },
  { number: 102, nameArabic: 'التكاثر', nameEnglish: 'At-Takathur', translation: 'The Rivalry in World Increase', versesCount: 8, revelationType: 'Meccan' },
  { number: 103, nameArabic: 'العصر', nameEnglish: 'Al-\'Asr', translation: 'The Declining Day', versesCount: 3, revelationType: 'Meccan' },
  { number: 104, nameArabic: 'الهمزة', nameEnglish: 'Al-Humazah', translation: 'The Traducer', versesCount: 9, revelationType: 'Meccan' },
  { number: 105, nameArabic: 'الفيل', nameEnglish: 'Al-Fil', translation: 'The Elephant', versesCount: 5, revelationType: 'Meccan' },
  { number: 106, nameArabic: 'قريش', nameEnglish: 'Quraysh', translation: 'Quraysh', versesCount: 4, revelationType: 'Meccan' },
  { number: 107, nameArabic: 'الماعون', nameEnglish: 'Al-Ma\'un', translation: 'The Small Kindness', versesCount: 7, revelationType: 'Meccan' },
  { number: 108, nameArabic: 'الكوثر', nameEnglish: 'Al-Kawthar', translation: 'The Abundance', versesCount: 3, revelationType: 'Meccan' },
  { number: 109, nameArabic: 'الكافرون', nameEnglish: 'Al-Kafirun', translation: 'The Disbelievers', versesCount: 6, revelationType: 'Meccan' },
  { number: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', translation: 'The Divine Support', versesCount: 3, revelationType: 'Medinan' },
  { number: 111, nameArabic: 'المسد', nameEnglish: 'Al-Masad', translation: 'The Palm Fiber', versesCount: 5, revelationType: 'Meccan' },
  { number: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', translation: 'The Sincerity', versesCount: 4, revelationType: 'Meccan' },
  { number: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', translation: 'The Daybreak', versesCount: 5, revelationType: 'Meccan' },
  { number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', translation: 'Mankind', versesCount: 6, revelationType: 'Meccan' },
];

/**
 * Bundled offline verses with authentic Uthmani script and verified translations
 */
export const BUNDLED_VERSES: Record<number, Ayah[]> = {
  // Surah 1: Al-Fatiha
  1: [
    { surahNumber: 1, numberInSurah: 1, textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', textEnglish: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
    { surahNumber: 1, numberInSurah: 2, textArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', textEnglish: '[All] praise is [due] to Allah, Lord of the worlds -' },
    { surahNumber: 1, numberInSurah: 3, textArabic: 'الرَّحْمَٰنِ الرَّحِيمِ', textEnglish: 'The Entirely Merciful, the Especially Merciful,' },
    { surahNumber: 1, numberInSurah: 4, textArabic: 'مَالِكِ يَوْمِ الدِّينِ', textEnglish: 'Sovereign of the Day of Recompense.' },
    { surahNumber: 1, numberInSurah: 5, textArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', textEnglish: 'It is You we worship and You we ask for help.' },
    { surahNumber: 1, numberInSurah: 6, textArabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', textEnglish: 'Guide us to the straight path -' },
    { surahNumber: 1, numberInSurah: 7, textArabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', textEnglish: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.' },
  ],

  // Surah 36: Ya-Sin (Selected opening passages)
  36: [
    { surahNumber: 36, numberInSurah: 1, textArabic: 'يس', textEnglish: 'Ya, Seen.' },
    { surahNumber: 36, numberInSurah: 2, textArabic: 'وَالْقُرْآنِ الْحَكِيمِ', textEnglish: 'By the wise Qur\'an.' },
    { surahNumber: 36, numberInSurah: 3, textArabic: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ', textEnglish: 'Indeed you, [O Muhammad], are from among the messengers,' },
    { surahNumber: 36, numberInSurah: 4, textArabic: 'عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ', textEnglish: 'On a straight path.' },
    { surahNumber: 36, numberInSurah: 5, textArabic: 'تَنْزِيلَ الْعَزِيزِ الرَّحِيمِ', textEnglish: '[This is] a revelation of the Exalted in Might, the Merciful.' },
    { surahNumber: 36, numberInSurah: 6, textArabic: 'لِتُنْذِرَ قَوْمًا مَا أُنْذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ', textEnglish: 'That you may warn a people whose forefathers were not warned, so they are unaware.' },
  ],

  // Surah 67: Al-Mulk (Opening verses)
  67: [
    { surahNumber: 67, numberInSurah: 1, textArabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', textEnglish: 'Blessed is He in whose hand is dominion, and He is over all things competent -' },
    { surahNumber: 67, numberInSurah: 2, textArabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ', textEnglish: '[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -' },
    { surahNumber: 67, numberInSurah: 3, textArabic: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِنْ تَفَاوُتٍ', textEnglish: '[And] who created seven heavens in layers. You see not in the creation of the Most Merciful any inconsistency.' },
    { surahNumber: 67, numberInSurah: 4, textArabic: 'فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِنْ فُطُورٍ', textEnglish: 'So return [your] vision [to the sky]; do you see any breaks?' },
    { surahNumber: 67, numberInSurah: 5, textArabic: 'ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنْقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ', textEnglish: 'Then return your vision twice again. [Your] vision will return to you humbled while it is fatigued.' },
  ],

  // Surah 93: Ad-Duhaa
  93: [
    { surahNumber: 93, numberInSurah: 1, textArabic: 'وَالضُّحَىٰ', textEnglish: 'By the morning brightness' },
    { surahNumber: 93, numberInSurah: 2, textArabic: 'وَاللَّيْلِ إِذَا سَجَىٰ', textEnglish: 'And [by] the night when it covers with darkness,' },
    { surahNumber: 93, numberInSurah: 3, textArabic: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ', textEnglish: 'Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you].' },
    { surahNumber: 93, numberInSurah: 4, textArabic: 'وَلَلْآخِرَةُ خَيْرٌ لَكَ مِنَ الْأُولَىٰ', textEnglish: 'And the Hereafter is better for you than the first [life].' },
    { surahNumber: 93, numberInSurah: 5, textArabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ', textEnglish: 'And your Lord is going to give you, and you will be satisfied.' },
    { surahNumber: 93, numberInSurah: 6, textArabic: 'أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ', textEnglish: 'Did He not find you an orphan and give [you] refuge?' },
    { surahNumber: 93, numberInSurah: 7, textArabic: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ', textEnglish: 'And He found you lost and guided [you],' },
    { surahNumber: 93, numberInSurah: 8, textArabic: 'وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ', textEnglish: 'And He found you poor and made [you] self-sufficient.' },
    { surahNumber: 93, numberInSurah: 9, textArabic: 'فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ', textEnglish: 'So as for the orphan, do not oppress [him].' },
    { surahNumber: 93, numberInSurah: 10, textArabic: 'وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ', textEnglish: 'And as for the petitioner, do not repel [him].' },
    { surahNumber: 93, numberInSurah: 11, textArabic: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ', textEnglish: 'But as for the favor of your Lord, report [it].' },
  ],

  // Surah 94: Ash-Sharh
  94: [
    { surahNumber: 94, numberInSurah: 1, textArabic: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ', textEnglish: 'Did We not expand for you, [O Muhammad], your breast?' },
    { surahNumber: 94, numberInSurah: 2, textArabic: 'وَوَضَعْنَا عَنْكَ وِزْرَكَ', textEnglish: 'And We removed from you your burden' },
    { surahNumber: 94, numberInSurah: 3, textArabic: 'الَّذِي أَنْقَضَ ظَهْرَكَ', textEnglish: 'Which had weighed upon your back' },
    { surahNumber: 94, numberInSurah: 4, textArabic: 'وَرَفَعْنَا لَكَ ذِكْرَكَ', textEnglish: 'And raised high for you your repute.' },
    { surahNumber: 94, numberInSurah: 5, textArabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', textEnglish: 'For indeed, with hardship [will be] ease.' },
    { surahNumber: 94, numberInSurah: 6, textArabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', textEnglish: 'Indeed, with hardship [will be] ease.' },
    { surahNumber: 94, numberInSurah: 7, textArabic: 'فَإِذَا فَرَغْتَ فَانْصَبْ', textEnglish: 'So when you have finished [your duties], then stand up [for worship].' },
    { surahNumber: 94, numberInSurah: 8, textArabic: 'وَإِلَىٰ رَبِّكَ فَارْغَبْ', textEnglish: 'And to your Lord direct [your] longing.' },
  ],

  // Surah 97: Al-Qadr
  97: [
    { surahNumber: 97, numberInSurah: 1, textArabic: 'إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ', textEnglish: 'Indeed, We sent the Qur\'an down during the Night of Decree.' },
    { surahNumber: 97, numberInSurah: 2, textArabic: 'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ', textEnglish: 'And what can make you know what is the Night of Decree?' },
    { surahNumber: 97, numberInSurah: 3, textArabic: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ', textEnglish: 'The Night of Decree is better than a thousand months.' },
    { surahNumber: 97, numberInSurah: 4, textArabic: 'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِمْ مِنْ كُلِّ أَمْرٍ', textEnglish: 'The angels and the Spirit descend therein by permission of their Lord for every matter.' },
    { surahNumber: 97, numberInSurah: 5, textArabic: 'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ', textEnglish: 'Peace it is until the emergence of dawn.' },
  ],

  // Surah 103: Al-'Asr
  103: [
    { surahNumber: 103, numberInSurah: 1, textArabic: 'وَالْعَصْرِ', textEnglish: 'By time,' },
    { surahNumber: 103, numberInSurah: 2, textArabic: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ', textEnglish: 'Indeed, mankind is in loss,' },
    { surahNumber: 103, numberInSurah: 3, textArabic: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', textEnglish: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.' },
  ],

  // Surah 108: Al-Kawthar
  108: [
    { surahNumber: 108, numberInSurah: 1, textArabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', textEnglish: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.' },
    { surahNumber: 108, numberInSurah: 2, textArabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', textEnglish: 'So pray to your Lord and sacrifice [to Him alone].' },
    { surahNumber: 108, numberInSurah: 3, textArabic: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', textEnglish: 'Indeed, your enemy is the one cut off.' },
  ],

  // Surah 109: Al-Kafirun
  109: [
    { surahNumber: 109, numberInSurah: 1, textArabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ', textEnglish: 'Say, "O disbelievers,' },
    { surahNumber: 109, numberInSurah: 2, textArabic: 'لَا أَعْبُدُ مَا تَعْبُدُونَ', textEnglish: 'I do not worship what you worship.' },
    { surahNumber: 109, numberInSurah: 3, textArabic: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ', textEnglish: 'Nor are you worshippers of what I worship.' },
    { surahNumber: 109, numberInSurah: 4, textArabic: 'وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ', textEnglish: 'Nor will I be a worshipper of what you worship.' },
    { surahNumber: 109, numberInSurah: 5, textArabic: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ', textEnglish: 'Nor will you be worshippers of what I worship.' },
    { surahNumber: 109, numberInSurah: 6, textArabic: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ', textEnglish: 'For you is your religion, and for me is my religion."' },
  ],

  // Surah 110: An-Nasr
  110: [
    { surahNumber: 110, numberInSurah: 1, textArabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ', textEnglish: 'When the victory of Allah has come and the conquest,' },
    { surahNumber: 110, numberInSurah: 2, textArabic: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا', textEnglish: 'And you see the people entering into the religion of Allah in multitudes,' },
    { surahNumber: 110, numberInSurah: 3, textArabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا', textEnglish: 'Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.' },
  ],

  // Surah 112: Al-Ikhlas
  112: [
    { surahNumber: 112, numberInSurah: 1, textArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', textEnglish: 'Say, "He is Allah, [who is] One,' },
    { surahNumber: 112, numberInSurah: 2, textArabic: 'اللَّهُ الصَّمَدُ', textEnglish: 'Allah, the Eternal Refuge.' },
    { surahNumber: 112, numberInSurah: 3, textArabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', textEnglish: 'He neither begets nor is born,' },
    { surahNumber: 112, numberInSurah: 4, textArabic: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', textEnglish: 'Nor is there to Him any equivalent."' },
  ],

  // Surah 113: Al-Falaq
  113: [
    { surahNumber: 113, numberInSurah: 1, textArabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', textEnglish: 'Say, "I seek refuge in the Lord of daybreak' },
    { surahNumber: 113, numberInSurah: 2, textArabic: 'مِنْ شَرِّ مَا خَلَقَ', textEnglish: 'From the evil of that which He created' },
    { surahNumber: 113, numberInSurah: 3, textArabic: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ', textEnglish: 'And from the evil of darkness when it settles' },
    { surahNumber: 113, numberInSurah: 4, textArabic: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', textEnglish: 'And from the evil of the blowers in knots' },
    { surahNumber: 113, numberInSurah: 5, textArabic: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ', textEnglish: 'And from the evil of an envier when he envies."' },
  ],

  // Surah 114: An-Nas
  114: [
    { surahNumber: 114, numberInSurah: 1, textArabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', textEnglish: 'Say, "I seek refuge in the Lord of mankind,' },
    { surahNumber: 114, numberInSurah: 2, textArabic: 'مَلِكِ النَّاسِ', textEnglish: 'The Sovereign of mankind.' },
    { surahNumber: 114, numberInSurah: 3, textArabic: 'إِلَٰهِ النَّاسِ', textEnglish: 'The God of mankind,' },
    { surahNumber: 114, numberInSurah: 4, textArabic: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', textEnglish: 'From the evil of the retreating whisperer -' },
    { surahNumber: 114, numberInSurah: 5, textArabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', textEnglish: 'Who whispers [evil] into the breasts of mankind -' },
    { surahNumber: 114, numberInSurah: 6, textArabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ', textEnglish: 'From among the jinn and mankind."' },
  ],
};

export interface DailyAyahItem {
  surahName: string;
  surahNameAr: string;
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  translation: string;
  theme: string;
  themeAr: string;
  reflectionAr: string;
}

export const DAILY_AYAHS: DailyAyahItem[] = [
  {
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    surahNumber: 2,
    ayahNumber: 286,
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not charge a soul except [with that within] its capacity.',
    theme: 'Hope & Endurance',
    themeAr: 'الرحمة والتيسير',
    reflectionAr: 'رحمة الله واسعة، فكل ابتلاء أو تكليف في حياتك هو ضمن طاقتك وقدرتك التي أودعها الله فيك.',
  },
  {
    surahName: 'Ash-Sharh',
    surahNameAr: 'الشرح',
    surahNumber: 94,
    ayahNumber: 5,
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    theme: 'Ease & Consolation',
    themeAr: 'بشارة الفرج واليسر',
    reflectionAr: 'لن يغلب عسر يسرين؛ بعد كل ضيق ومحنة سعة وانشراح وفرج قريب من الرحيم الودود.',
  },
  {
    surahName: 'Ar-Ra\'d',
    surahNameAr: 'الرعد',
    surahNumber: 13,
    ayahNumber: 28,
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Unquestionably, by the remembrance of Allah hearts are assured.',
    theme: 'Peace of Heart',
    themeAr: 'سكينة الذكر',
    reflectionAr: 'ذكر الله أعظم دواء لاضطراب النفس وشتاتها، به تسكن القلوب وتنعم بالرضا والأمان.',
  },
  {
    surahName: 'At-Talaq',
    surahNameAr: 'الطلاق',
    surahNumber: 65,
    ayahNumber: 3,
    arabic: 'وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'And whoever relies upon Allah - then He is sufficient for him.',
    theme: 'Trust in Allah',
    themeAr: 'التوكل والكفاية',
    reflectionAr: 'من فوّض أمره إلى الله بصدق، كفاه ما أهمّه في دينه ودنياه ويسّر له أسباب الخير.',
  },
  {
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    surahNumber: 2,
    ayahNumber: 186,
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    translation: 'And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
    theme: 'Closeness & Dua',
    themeAr: 'قرب الله وإجابة الدعاء',
    reflectionAr: 'الله سبحانه أقرب إليك من حبل الوريد، يسمع نجواك ويجيب دعاءك حين تناديه بقلب حاضر.',
  },
];
