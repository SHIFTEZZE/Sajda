/**
 * The Forty Hadith of Imam Yahya ibn Sharaf al-Nawawi (Al-Arba'in An-Nawawiyyah)
 * Authentic Arabic text, verified English translations, scholarly source citations, and gradings.
 */

export interface HadithEntry {
  id: number;
  titleEn: string;
  titleAr: string;
  narrator: string;
  arabicText: string;
  englishText: string;
  source: string;
  grading: 'Sahih (Authentic)' | 'Hasan (Sound)' | 'Sahih Bukhari & Muslim';
  scholarGradeSource: string; // e.g., "Imam al-Bukhari & Imam Muslim", "Imam at-Tirmidhi"
}

export const NAWAWI_HADITHS: HadithEntry[] = [
  {
    id: 1,
    titleEn: 'Actions are by Intentions',
    titleAr: 'الأعمال بالنيات',
    narrator: 'Amir al-Mu\'minin, Abu Hafs Umar ibn al-Khattab (may Allah be pleased with him)',
    arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
    englishText: 'Actions are according to intentions, and everyone will get what was intended. Whoever migrated to Allah and His Messenger, his migration is to Allah and His Messenger; and whoever migrated for worldly gain or to marry a woman, his migration is to that for which he migrated.',
    source: 'Sahih al-Bukhari (1) & Sahih Muslim (1907)',
    grading: 'Sahih Bukhari & Muslim',
    scholarGradeSource: 'Muttafaqun \'Alayh (Agreed upon by Bukhari and Muslim)',
  },
  {
    id: 2,
    titleEn: 'The Hadith of Jibril (Islam, Iman, Ihsan)',
    titleAr: 'حديث جبريل عليه السلام',
    narrator: 'Umar ibn al-Khattab (may Allah be pleased with him)',
    arabicText: 'بَيْنَمَا نَحْنُ عِنْدَ رَسُولِ اللَّهِ ﷺ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ شَدِيدُ سَوَادِ الشَّعَرِ، لاَ يُرَى عَلَيْهِ أَثَرُ السَّفَرِ، وَلاَ يَعْرِفُهُ مِنَّا أَحَدٌ، حَتَّى جَلَسَ إِلَى النَّبِيِّ ﷺ ... قَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الإِسْلاَمِ؟ فَقَالَ: الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاَةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً...',
    englishText: 'While we were one day sitting with the Messenger of Allah ﷺ, there appeared before us a man with very white clothes and very black hair. No signs of journeying were seen upon him, and none of us knew him... He asked: "O Muhammad, inform me about Islam." He replied: "Islam is that you testify there is no deity worthy of worship except Allah and that Muhammad is His Messenger, establish prayer, pay zakah, fast Ramadan, and perform pilgrimage to the House if able to find a way..."',
    source: 'Sahih Muslim (8)',
    grading: 'Sahih (Authentic)',
    scholarGradeSource: 'Sahih Muslim',
  },
  {
    id: 3,
    titleEn: 'The Five Pillars of Islam',
    titleAr: 'أركان الإسلام',
    narrator: 'Abu Abd al-Rahman Abdullah ibn Umar ibn al-Khattab (may Allah be pleased with both)',
    arabicText: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ.',
    englishText: 'Islam is built upon five pillars: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing prayer, giving zakah, performing pilgrimage to the House, and fasting Ramadan.',
    source: 'Sahih al-Bukhari (8) & Sahih Muslim (16)',
    grading: 'Sahih Bukhari & Muslim',
    scholarGradeSource: 'Muttafaqun \'Alayh (Agreed upon by Bukhari and Muslim)',
  },
  {
    id: 4,
    titleEn: 'Creation in the Womb and Destiny',
    titleAr: 'مراحل خلق الإنسان والقدر',
    narrator: 'Abu Abd al-Rahman Abdullah ibn Mas\'ud (may Allah be pleased with him)',
    arabicText: 'إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ إِلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ، وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ: بِكَتْبِ رِزْقِهِ، وَأَجَلِهِ، وَعَمَلِهِ، وَشَقِيٌّ أَوْ سَعِيدٌ...',
    englishText: 'Each of you is gathered in the womb of his mother for forty days as a drop, then he is a clinging clot for a similar period, then a lump of flesh for a similar period. Then an angel is sent to him who breathes the spirit into him and is commanded four matters: to write down his provision, his lifespan, his actions, and whether he will be wretched or blessed...',
    source: 'Sahih al-Bukhari (3208) & Sahih Muslim (2643)',
    grading: 'Sahih Bukhari & Muslim',
    scholarGradeSource: 'Muttafaqun \'Alayh (Agreed upon by Bukhari and Muslim)',
  },
  {
    id: 5,
    titleEn: 'Rejection of Innovations in Religion',
    titleAr: 'النهي عن الابتداع في الدين',
    narrator: 'Mother of the Believers, Umm Abdillah Aishah (may Allah be pleased with her)',
    arabicText: 'مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ فِيهِ فَهُوَ رَدٌّ.',
    englishText: 'Whoever introduces into this affair of ours anything which does not belong to it, it is rejected.',
    source: 'Sahih al-Bukhari (2697) & Sahih Muslim (1718)',
    grading: 'Sahih Bukhari & Muslim',
    scholarGradeSource: 'Muttafaqun \'Alayh (Agreed upon by Bukhari and Muslim)',
  },
  {
    id: 6,
    titleEn: 'Avoiding the Doubtful and Purification of the Heart',
    titleAr: 'الحلال بيّن والحرام بيّن',
    narrator: 'Abu Abdillah an-Nu\'man ibn Bashir (may Allah be pleased with both)',
    arabicText: 'إِنَّ الْحَلاَلَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لاَ يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ... أَلاَ وَإِنَّ فِي الْجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلاَ وَهِيَ الْقَلْبُ.',
    englishText: 'Truly, what is lawful is evident and what is unlawful is evident, and between the two are doubtful matters which many people do not know. Whoever avoids doubtful matters clears himself in regard to his religion and his honor... Truly, in the body there is a morsel of flesh: if it is sound, the whole body is sound; and if it is corrupt, the whole body is corrupt. Truly, it is the heart.',
    source: 'Sahih al-Bukhari (52) & Sahih Muslim (1599)',
    grading: 'Sahih Bukhari & Muslim',
    scholarGradeSource: 'Muttafaqun \'Alayh (Agreed upon by Bukhari and Muslim)',
  },
  {
    id: 7,
    titleEn: 'Religion is Sincere Advice (Nasihah)',
    titleAr: 'الدين النصيحة',
    narrator: 'Abu Ruqayyah Tamim ibn Aws ad-Dari (may Allah be pleased with him)',
    arabicText: 'الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ.',
    englishText: 'The Prophet ﷺ said: "Religion is sincere advice." We asked: "To whom?" He replied: "To Allah, His Book, His Messenger, the leaders of the Muslims, and their common folk."',
    source: 'Sahih Muslim (55)',
    grading: 'Sahih (Authentic)',
    scholarGradeSource: 'Sahih Muslim',
  },
  {
    id: 11,
    titleEn: 'Leaving That Which Causes You Doubt',
    titleAr: 'دع ما يريبك إلى ما لا يريبك',
    narrator: 'Abu Muhammad al-Hasan ibn Ali ibn Abi Talib (may Allah be pleased with both)',
    arabicText: 'دَعْ مَا يَرِيبُكَ إِلَى مَا لاَ يَرِيبُكَ.',
    englishText: 'Leave that which makes you doubt for that which does not make you doubt.',
    source: 'Sunan at-Tirmidhi (2518) & Sunan an-Nasa\'i (5711)',
    grading: 'Hasan (Sound)',
    scholarGradeSource: 'Imam at-Tirmidhi stated: Hadith Hasan Sahih',
  },
  {
    id: 12,
    titleEn: 'Leaving What Does Not Concern You',
    titleAr: 'من حسن إسلام المرء',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    arabicText: 'مِنْ حُسْنِ إِسْلاَمِ الْمَرْءِ تَرْكُهُ مَا لاَ يَعْنِيهِ.',
    englishText: 'Part of the excellence of a person\'s Islam is leaving what does not concern him.',
    source: 'Sunan at-Tirmidhi (2317)',
    grading: 'Hasan (Sound)',
    scholarGradeSource: 'Graded Hasan by Imam at-Tirmidhi and Imam an-Nawawi',
  },
  {
    id: 13,
    titleEn: 'Loving for Your Brother What You Love for Yourself',
    titleAr: 'حب لأخيك ما تحب لنفسك',
    narrator: 'Abu Hamzah Anas ibn Malik (may Allah be pleased with him)',
    arabicText: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
    englishText: 'None of you truly believes until he loves for his brother what he loves for himself.',
    source: 'Sahih al-Bukhari (13) & Sahih Muslim (45)',
    grading: 'Sahih Bukhari & Muslim',
    scholarGradeSource: 'Muttafaqun \'Alayh (Agreed upon by Bukhari and Muslim)',
  },
  {
    id: 15,
    titleEn: 'Good Speech or Silence, and Kindness to Neighbors',
    titleAr: 'الكلام الطيب وإكرام الجار',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    arabicText: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.',
    englishText: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him honor his neighbor. And whoever believes in Allah and the Last Day, let him honor his guest.',
    source: 'Sahih al-Bukhari (6018) & Sahih Muslim (47)',
    grading: 'Sahih Bukhari & Muslim',
    scholarGradeSource: 'Muttafaqun \'Alayh (Agreed upon by Bukhari and Muslim)',
  },
  {
    id: 16,
    titleEn: 'The Prohibition of Anger',
    titleAr: 'النهي عن الغضب',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    arabicText: 'أَنَّ رَجُلاً قَالَ لِلنَّبِيِّ ﷺ: أَوْصِنِي. قَالَ: "لاَ تَغْضَبْ". فَرَدَّدَ مِرَارًا، قَالَ: "لاَ تَغْضَبْ".',
    englishText: 'A man said to the Prophet ﷺ: "Advise me." He replied: "Do not get angry." The man repeated his request several times, and each time he replied: "Do not get angry."',
    source: 'Sahih al-Bukhari (6116)',
    grading: 'Sahih (Authentic)',
    scholarGradeSource: 'Sahih al-Bukhari',
  },
  {
    id: 18,
    titleEn: 'Taqwa (God-Consciousness) and Good Character',
    titleAr: 'اتق الله حيثما كنت',
    narrator: 'Abu Dharr Jundub ibn Junadah and Abu Abd al-Rahman Mu\'adh ibn Jabal (may Allah be pleased with both)',
    arabicText: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.',
    englishText: 'Fear Allah wherever you may be; follow up a bad deed with a good deed and it will wipe it out; and behave towards people with good character.',
    source: 'Sunan at-Tirmidhi (1987)',
    grading: 'Hasan (Sound)',
    scholarGradeSource: 'Graded Hasan by Imam at-Tirmidhi',
  },
];
