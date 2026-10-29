import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  SURAH_LIST,
  BUNDLED_VERSES,
  Ayah,
  QuranBookmark,
  ReadingProgress,
} from '../data/quranData.ts';
import {
  loadQuranBookmarks,
  toggleQuranBookmark,
  loadReadingProgress,
  saveReadingProgress,
} from '../services/trackerStorage.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings, QuranFontSize } from '../services/settingsStorage.ts';
import { MushafPageView } from './MushafPageView.tsx';
import { MUSHAF_SURAHS } from '../data/mushafPagesMeta.ts';
import { setLastReadMushafPage, isMushafDownloaded } from '../services/mushafStorage.ts';

interface QuranTabProps {
  colors: ThemeColors;
  settings: AppSettings;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
}

export const QuranTab: React.FC<QuranTabProps> = ({ colors, settings, onUpdateSettings }) => {
  const [viewMode, setViewMode] = useState<'mushaf' | 'text'>('mushaf');
  const [activeSurahNumber, setActiveSurahNumber] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
    surahNumber: 1,
    ayahNumber: 1,
    updatedAt: Date.now(),
  });
  const [showBookmarksTab, setShowBookmarksTab] = useState(false);
  const [bookmarkModalAyah, setBookmarkModalAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [bookmarkNote, setBookmarkNote] = useState('');

  useEffect(() => {
    setBookmarks(loadQuranBookmarks());
    setReadingProgress(loadReadingProgress());
  }, []);

  const handleOpenSurah = (surahNumber: number) => {
    setActiveSurahNumber(surahNumber);
    saveReadingProgress(surahNumber, 1);
    setReadingProgress({ surahNumber, ayahNumber: 1, updatedAt: Date.now() });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleResumeReading = () => {
    handleOpenSurah(readingProgress.surahNumber);
  };

  const handleNextSurah = () => {
    if (activeSurahNumber && activeSurahNumber < 114) {
      handleOpenSurah(activeSurahNumber + 1);
    }
  };

  const handlePrevSurah = () => {
    if (activeSurahNumber && activeSurahNumber > 1) {
      handleOpenSurah(activeSurahNumber - 1);
    }
  };

  const handleJumpToMushafPage = (surahNumber: number) => {
    const sMeta = MUSHAF_SURAHS.find((s) => s.number === surahNumber);
    if (sMeta) {
      setLastReadMushafPage(sMeta.startPage);
    }
    setViewMode('mushaf');
  };

  const handleToggleBookmark = (surahNumber: number, ayahNumber: number, surahNameAr: string) => {
    const isBookmarked = bookmarks.some((b) => b.id === `${surahNumber}:${ayahNumber}`);
    if (isBookmarked) {
      const updated = toggleQuranBookmark(surahNumber, ayahNumber, surahNameAr);
      setBookmarks(updated);
    } else {
      setBookmarkModalAyah({ surah: surahNumber, ayah: ayahNumber });
      setBookmarkNote('');
    }
  };

  const handleSaveBookmarkWithNote = () => {
    if (bookmarkModalAyah) {
      const surahMeta = SURAH_LIST.find((s) => s.number === bookmarkModalAyah.surah);
      const updated = toggleQuranBookmark(
        bookmarkModalAyah.surah,
        bookmarkModalAyah.ayah,
        `سورة ${surahMeta?.nameArabic || bookmarkModalAyah.surah}`,
        bookmarkNote
      );
      setBookmarks(updated);
      setBookmarkModalAyah(null);
    }
  };

  const fontSizes: Record<QuranFontSize, { arabic: string; label: string }> = {
    small: { arabic: 'text-xl leading-[2.3]', label: 'ص' },
    normal: { arabic: 'text-2xl leading-[2.5]', label: 'م' },
    large: { arabic: 'text-3xl leading-[2.7]', label: 'ك' },
    xlarge: { arabic: 'text-4xl leading-[2.9]', label: 'ك+' },
  };

  const currentFontSize = fontSizes[settings.quranFontSize] || fontSizes.normal;

  const filteredSurahs = SURAH_LIST.filter((s) => {
    const query = searchQuery.trim();
    const matchesSearch =
      s.nameArabic.includes(query) ||
      s.number.toString() === query ||
      s.nameEnglish.toLowerCase().includes(query.toLowerCase());
    const matchesType = filterType === 'all' || s.revelationType === filterType;
    return matchesSearch && matchesType;
  });

  const activeSurahMeta = activeSurahNumber ? SURAH_LIST.find((s) => s.number === activeSurahNumber) : null;
  const activeVerses: Ayah[] = activeSurahNumber && BUNDLED_VERSES[activeSurahNumber]
    ? BUNDLED_VERSES[activeSurahNumber]
    : [];

  // إذا كان المستخدم في وضع "مصحف المدينة المصور"
  if (viewMode === 'mushaf') {
    return (
      <MushafPageView
        colors={colors}
        onSwitchToTextMode={() => setViewMode('text')}
      />
    );
  }

  // وضع القارئ النصي العادي
  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* شريط التبديل العلوي بين مصحف المدينة والقارئ النصي */}
      <div
        className="rounded-2xl border p-2 flex items-center justify-between shadow-xs"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('mushaf')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all hover:bg-black/5"
            style={{ color: colors.primary }}
          >
            <BookOpen size={14} style={{ color: colors.accent }} />
            <span>مصحف المدينة (الصفحات)</span>
          </button>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-bold shadow-xs"
            style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
          >
            <Layers size={14} />
            <span>التلاوة النصية (سور)</span>
          </span>
        </div>

        <button
          onClick={() => setViewMode('mushaf')}
          className="text-[11px] font-sans font-bold px-2 py-1 rounded-lg border text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
          style={{ borderColor: colors.accent }}
        >
          نسخة المصحف المصوّر
        </button>
      </div>

      {/* في حالة قراءة سورة محددة */}
      {activeSurahNumber && activeSurahMeta ? (
        <div className="space-y-4">
          {/* شريط التحكم العلوي للقارئ */}
          <div
            className="sticky top-16 z-20 rounded-2xl border p-3 flex items-center justify-between shadow-xs backdrop-blur-md"
            style={{ backgroundColor: `${colors.bgCard}F5`, borderColor: colors.borderSubtle }}
          >
            <button
              onClick={() => setActiveSurahNumber(null)}
              className="flex items-center gap-1.5 text-xs font-sans font-bold px-3 py-1.5 rounded-xl border transition-transform active:scale-95"
              style={{
                borderColor: colors.borderSubtle,
                backgroundColor: colors.bgCardElevated,
                color: colors.primary,
              }}
            >
              <ArrowRight size={14} />
              <span>فهرس السور</span>
            </button>

            {/* شارة السورة في الوسط */}
            <div className="text-center">
              <div className="font-arabic-uthmani text-base font-bold leading-none" style={{ color: colors.primary }}>
                سورة {activeSurahMeta.nameArabic}
              </div>
              <div className="font-sans text-[11px] text-neutral-500 mt-0.5">
                {activeSurahMeta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {activeSurahMeta.versesCount} آية
              </div>
            </div>

            {/* أزرار الحجم والانتقال لصفحة المصحف */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleJumpToMushafPage(activeSurahMeta.number)}
                className="p-1.5 rounded-lg border text-xs font-sans text-neutral-600 hover:text-neutral-900 transition-colors"
                style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                title="عرض في مصحف المدينة المصور"
              >
                <BookOpen size={14} />
              </button>

              <div className="flex items-center gap-0.5 border rounded-lg p-0.5" style={{ borderColor: colors.borderSubtle }}>
                {(['small', 'normal', 'large', 'xlarge'] as QuranFontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ quranFontSize: size })}
                    className={`px-1.5 py-0.5 text-[10px] font-sans font-bold rounded ${
                      settings.quranFontSize === size ? 'bg-[#1F3D2B] text-white' : 'text-neutral-500'
                    }`}
                    title={`حجم الخط: ${size}`}
                  >
                    {fontSizes[size].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ترويسة السورة والبسملة الشريفة */}
          <div
            className="rounded-3xl border p-6 text-center shadow-xs relative overflow-hidden"
            style={{ backgroundColor: colors.quranSurface, borderColor: colors.border }}
          >
            <div className="font-sans text-xs font-semibold text-neutral-500 mb-1">
              سورة رقم {activeSurahMeta.number} · {activeSurahMeta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · الجزء {activeSurahMeta.number <= 2 ? 1 : Math.min(30, Math.ceil(activeSurahMeta.number / 4))}
            </div>
            <h2 className="font-arabic-uthmani text-4xl font-bold my-1" style={{ color: colors.primary }}>
              سورة {activeSurahMeta.nameArabic}
            </h2>
            <div className="font-sans text-xs text-neutral-600 font-medium">
              عدد آياتها {activeSurahMeta.versesCount} آية
            </div>

            {/* البسملة الشريفة (لكل السور ما عدا سورة التوبة) */}
            {activeSurahNumber !== 9 && (
              <div className="mt-4 pt-4 border-t border-neutral-200/80">
                <p className="font-arabic-uthmani text-3xl" style={{ color: colors.primary }}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            )}
          </div>

          {/* عرض الآيات الكريمة */}
          <div className="space-y-3">
            {activeVerses.length > 0 ? (
              activeVerses.map((ayah) => {
                const isBookmarked = bookmarks.some(
                  (b) => b.id === `${ayah.surahNumber}:${ayah.numberInSurah}`
                );

                return (
                  <div
                    key={ayah.numberInSurah}
                    className="rounded-2xl border p-5 shadow-xs transition-all"
                    style={{
                      backgroundColor: colors.quranSurface,
                      borderColor: isBookmarked ? colors.accent : colors.borderSubtle,
                    }}
                  >
                    {/* رأس الآية: رقم الآية وزر الحفظ */}
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100">
                      <span
                        className="w-7 h-7 rounded-full border flex items-center justify-center font-sans text-xs font-bold"
                        style={{
                          borderColor: colors.accent,
                          color: colors.primary,
                          backgroundColor: `${colors.accent}12`,
                        }}
                      >
                        {ayah.numberInSurah}
                      </span>

                      <button
                        onClick={() =>
                          handleToggleBookmark(
                            ayah.surahNumber,
                            ayah.numberInSurah,
                            `سورة ${activeSurahMeta.nameArabic}`
                          )
                        }
                        className="p-1.5 rounded-lg border text-xs font-sans flex items-center gap-1 transition-all active:scale-95"
                        style={{
                          borderColor: isBookmarked ? colors.accent : colors.borderSubtle,
                          color: isBookmarked ? colors.accent : colors.textMuted,
                          backgroundColor: isBookmarked ? `${colors.accent}15` : colors.bgCardElevated,
                        }}
                      >
                        {isBookmarked ? (
                          <>
                            <BookmarkCheck size={14} />
                            <span>محفوظة</span>
                          </>
                        ) : (
                          <>
                            <Bookmark size={14} />
                            <span>حفظ</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* نص الآية بالرسم العثماني الفاخر */}
                    <p
                      className={`font-arabic-uthmani ${currentFontSize.arabic} text-neutral-900 tracking-wide text-justify`}
                    >
                      {ayah.textArabic}{' '}
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 mx-1 text-xs font-sans font-bold rounded-full border border-amber-600/60 bg-amber-500/10 align-middle text-emerald-950"
                        title={`آية ${ayah.numberInSurah}`}
                      >
                        {ayah.numberInSurah}
                      </span>
                    </p>

                    {/* ترجمة المعاني */}
                    <p className="font-sans text-xs text-neutral-600 leading-relaxed pt-3 mt-3 border-t border-neutral-100">
                      {ayah.textEnglish}
                    </p>
                  </div>
                );
              })
            ) : (
              <div
                className="rounded-2xl border p-6 text-center space-y-3"
                style={{ backgroundColor: colors.quranSurface, borderColor: colors.borderSubtle }}
              >
                <div className="font-arabic-uthmani text-3xl font-bold" style={{ color: colors.primary }}>
                  سورة {activeSurahMeta.nameArabic}
                </div>
                <p className="text-xs font-sans text-neutral-600 leading-relaxed">
                  تتضمن هذه السورة الكريمة {activeSurahMeta.versesCount} آية. يمكنك قراءتها كاملة مصوّرة بالرسم العثماني الأصلي عبر مصحف المدينة.
                </p>
                <button
                  onClick={() => handleJumpToMushafPage(activeSurahMeta.number)}
                  className="px-5 py-2.5 rounded-xl text-white font-sans font-bold text-xs shadow-md"
                  style={{ backgroundColor: colors.primary }}
                >
                  فتح السورة في مصحف المدينة المصوَّر
                </button>
              </div>
            )}
          </div>

          {/* أزرار الانتقال بين السور */}
          <div
            className="flex items-center justify-between p-3.5 rounded-2xl border shadow-xs"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <button
              onClick={handlePrevSurah}
              disabled={activeSurahNumber <= 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-sans font-bold disabled:opacity-30"
              style={{ borderColor: colors.borderSubtle, color: colors.primary }}
            >
              <ChevronRight size={16} />
              <span>السورة السابقة</span>
            </button>
            <button
              onClick={handleNextSurah}
              disabled={activeSurahNumber >= 114}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-sans font-bold disabled:opacity-30"
              style={{ borderColor: colors.borderSubtle, color: colors.primary }}
            >
              <span>السورة التالية</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* فهرس السور الـ 114 */
        <div className="space-y-4">
          {/* بطاقة دعائية فاخرة لمصحف المدينة النبوية */}
          <div
            onClick={() => setViewMode('mushaf')}
            className="rounded-2xl border p-4 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.accent,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl border flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.accent,
                  color: colors.accent,
                }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm" style={{ color: colors.primary }}>
                    مُصْحَفُ المَدِينَةِ النَّبَوِيَّةِ
                  </h3>
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 font-bold">
                    ٦٠٤ صفحات
                  </span>
                </div>
                <p className="text-[11px] font-sans text-neutral-500 mt-0.5">
                  النسخة المصوَّرة المطابقة لمصحف مجمع الملك فهد بالمدينة المنورة
                </p>
              </div>
            </div>

            <span
              className="text-xs font-sans font-bold px-3 py-1.5 rounded-xl text-white shadow-xs"
              style={{ backgroundColor: colors.primary }}
            >
              تصفح المصحف
            </span>
          </div>

          {/* بطاقة متابعة القراءة والعلامات المحفوظة */}
          <div
            className="rounded-2xl border p-4 shadow-xs flex items-center justify-between"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div>
              <div className="text-[10px] font-sans font-semibold text-neutral-500">
                متابعة الورد القرآني
              </div>
              <div className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
                {SURAH_LIST.find((s) => s.number === readingProgress.surahNumber)?.nameArabic
                  ? `سورة ${SURAH_LIST.find((s) => s.number === readingProgress.surahNumber)?.nameArabic}`
                  : 'سورة الفاتحة'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowBookmarksTab(!showBookmarksTab)}
                className="px-3 py-1.5 rounded-xl border text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors"
                style={{
                  borderColor: showBookmarksTab ? colors.accent : colors.borderSubtle,
                  backgroundColor: showBookmarksTab ? `${colors.accent}15` : colors.bgCardElevated,
                  color: showBookmarksTab ? colors.primary : colors.textMain,
                }}
              >
                <Bookmark size={13} />
                <span>العلامات ({bookmarks.length})</span>
              </button>

              <button
                onClick={handleResumeReading}
                className="px-3.5 py-1.5 rounded-xl font-sans font-bold text-xs text-white shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                style={{ backgroundColor: colors.primary }}
              >
                <span>متابعة</span>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>

          {/* درج العلامات المحفوظة */}
          {showBookmarksTab && (
            <div
              className="rounded-2xl border p-4 shadow-xs space-y-2.5 animate-fadeIn"
              style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.border }}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-sans font-bold text-xs" style={{ color: colors.primary }}>
                  العلامات المحفوظة
                </h4>
                <span className="text-[10px] text-neutral-500 font-sans">
                  اضغط لفتح السورة
                </span>
              </div>

              {bookmarks.length > 0 ? (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => handleOpenSurah(bm.surahNumber)}
                    className="p-3 rounded-xl border bg-white flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
                    style={{ borderColor: colors.borderSubtle }}
                  >
                    <div>
                      <div className="font-sans font-bold text-xs" style={{ color: colors.primary }}>
                        {bm.surahName} - آية {bm.ayahNumber}
                      </div>
                      {bm.note && (
                        <div className="text-[11px] text-neutral-600 font-sans mt-0.5">« {bm.note} »</div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = toggleQuranBookmark(bm.surahNumber, bm.ayahNumber, bm.surahName);
                        setBookmarks(updated);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                      title="حذف العلامة"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-neutral-500 font-sans">
                  لا توجد علامات مرجعية محفوظة بعد. يمكنك وضع علامة على أي آية أثناء التلاوة.
                </div>
              )}
            </div>
          )}

          {/* شريط البحث وتصفية السور */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute right-3.5 top-3 text-neutral-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم السورة، رقمها، أو معناها..."
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border text-xs font-sans outline-none focus:ring-1 text-right"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderSubtle,
                  color: colors.textMain,
                }}
              />
            </div>

            {/* فلتر مكية / مدنية */}
            <div className="flex gap-1.5">
              {(['all', 'Meccan', 'Medinan'] as const).map((type) => {
                const labels: Record<typeof type, string> = {
                  all: 'جميع السور',
                  Meccan: 'المكية (٨٦)',
                  Medinan: 'المدنية (٢٨)',
                };

                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-sans font-semibold border transition-all active:scale-95"
                    style={{
                      borderColor: filterType === type ? colors.accent : colors.borderSubtle,
                      backgroundColor: filterType === type ? `${colors.accent}18` : colors.bgCard,
                      color: filterType === type ? colors.primary : colors.textMuted,
                    }}
                  >
                    {labels[type]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* قائمة السور */}
          <div className="space-y-2">
            {filteredSurahs.map((surah) => {
              return (
                <div
                  key={surah.number}
                  onClick={() => handleOpenSurah(surah.number)}
                  className="rounded-2xl border p-3.5 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] hover:border-amber-600/40"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.borderSubtle,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* رقم السورة */}
                    <div
                      className="w-9 h-9 rounded-xl border flex items-center justify-center font-sans font-bold text-xs"
                      style={{
                        backgroundColor: colors.bgCardElevated,
                        borderColor: colors.accent,
                        color: colors.primary,
                      }}
                    >
                      {surah.number}
                    </div>

                    <div>
                      <div className="font-arabic-uthmani text-lg font-bold" style={{ color: colors.primary }}>
                        سورة {surah.nameArabic}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-sans">
                        {surah.versesCount} آية · {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJumpToMushafPage(surah.number);
                      }}
                      className="p-1.5 rounded-lg border text-xs font-sans text-neutral-500 hover:text-neutral-900 transition-colors"
                      style={{ borderColor: colors.borderSubtle }}
                      title="عرض في مصحف المدينة"
                    >
                      <BookOpen size={14} />
                    </button>

                    <div className="text-left font-sans text-xs text-neutral-400">
                      الجزء {surah.number <= 2 ? 1 : Math.min(30, Math.ceil(surah.number / 4))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* نافذة كتابة ملاحظة العلامة المرجعية */}
      {bookmarkModalAyah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-3"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
          >
            <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              حفظ الآية {bookmarkModalAyah.ayah}
            </h3>
            <p className="text-xs text-neutral-500 font-sans">
              يمكنك كتابة تدبر شخصي أو ملاحظة لتتذكرها عند الرجوع:
            </p>
            <textarea
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              placeholder="مثال: آية الصبر والفرج عند المحن..."
              rows={3}
              className="w-full p-2.5 rounded-xl border text-xs outline-none focus:ring-1 text-right font-sans"
              style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBookmarkModalAyah(null)}
                className="flex-1 py-2 rounded-xl border font-sans text-xs font-semibold text-neutral-600"
                style={{ borderColor: colors.borderSubtle }}
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveBookmarkWithNote}
                className="flex-1 py-2 rounded-xl text-white font-sans font-bold text-xs"
                style={{ backgroundColor: colors.primary }}
              >
                تأكيد الحفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
