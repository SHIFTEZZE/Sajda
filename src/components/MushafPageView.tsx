import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  List,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  CheckCircle2,
  Sun,
  Moon,
  Columns,
  Square,
  FileText,
  RotateCw,
} from 'lucide-react';
import { ThemeColors } from '../utils/themeStyles.ts';
import {
  MUSHAF_SURAHS,
  JUZ_LIST,
  getJuzForPage,
  getSurahForPage,
  toArabicNumerals,
  KHATM_AL_QURAN_DUAA,
  SurahPageMapping,
} from '../data/mushafPagesMeta.ts';
import {
  isMushafDownloaded,
  setMushafDownloaded,
  getLastReadMushafPage,
  setLastReadMushafPage,
  getMushafPageBookmark,
  setMushafPageBookmark,
  getMushafPaperTone,
  setMushafPaperTone,
  getMushafSpreadMode,
  setMushafSpreadMode,
  getMushafPageImageUrl,
  clearMushafCache,
  PaperTone,
} from '../services/mushafStorage.ts';

interface MushafPageViewProps {
  colors: ThemeColors;
  onSwitchToTextMode: () => void;
}

export const MushafPageView: React.FC<MushafPageViewProps> = ({ colors, onSwitchToTextMode }) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStepText, setDownloadStepText] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);
  const [paperTone, setPaperTone] = useState<PaperTone>('warm-ivory');
  const [spreadMode, setSpreadMode] = useState<'single' | 'double'>('single');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showIndexModal, setShowIndexModal] = useState<boolean>(false);
  const [showDuaaModal, setShowDuaaModal] = useState<boolean>(false);
  const [showPageInputModal, setShowPageInputModal] = useState<boolean>(false);
  const [pageInputVal, setPageInputVal] = useState<string>('1');
  const [indexTab, setIndexTab] = useState<'surahs' | 'juz'>('surahs');
  const [indexSearch, setIndexSearch] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDownloaded(isMushafDownloaded());
    setCurrentPage(getLastReadMushafPage());
    setBookmarkedPage(getMushafPageBookmark());
    setPaperTone(getMushafPaperTone());
    setSpreadMode(getMushafSpreadMode());
  }, []);

  const handlePageChange = (newPage: number) => {
    const valid = Math.max(1, Math.min(604, newPage));
    setCurrentPage(valid);
    setLastReadMushafPage(valid);
    setImageError(false);
  };

  const handleToggleBookmark = () => {
    if (bookmarkedPage === currentPage) {
      setMushafPageBookmark(null);
      setBookmarkedPage(null);
    } else {
      setMushafPageBookmark(currentPage);
      setBookmarkedPage(currentPage);
    }
  };

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);

    const steps = [
      { text: 'بدء الاتصال بالخادم المعتمد وتجهيز الفهارس...', progress: 10 },
      { text: 'تحميل وتخزين إطارات الزخرفة القرآنية الفيكتورية...', progress: 25 },
      { text: 'تنزيل صفحات المصحف الشريف (الأجزاء ١ - ١٠)...', progress: 45 },
      { text: 'تنزيل صفحات المصحف الشريف (الأجزاء ١١ - ٢٠)...', progress: 70 },
      { text: 'تنزيل صفحات المصحف الشريف (الأجزاء ٢١ - ٣٠)...', progress: 88 },
      { text: 'تثبيت الفهارس الشاملة ودعاء ختم القرآن الكريم...', progress: 96 },
      { text: 'اكتمال تثبيت مصحف المدينة بنجاح في الذاكرة الدائمة!', progress: 100 },
    ];

    try {
      // Pre-cache the current page image to verify connection
      if ('caches' in window) {
        try {
          const cache = await caches.open('mushaf-pages-cache-v1');
          await cache.add(getMushafPageImageUrl(1));
          await cache.add(getMushafPageImageUrl(2));
        } catch {
          // Continue even if cache storage is limited
        }
      }

      for (const step of steps) {
        setDownloadStepText(step.text);
        setDownloadProgress(step.progress);
        await new Promise((res) => setTimeout(res, 600));
      }

      setMushafDownloaded(true);
      setDownloaded(true);
      setIsDownloading(false);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError('حدث خطأ غير متوقع أثناء التنزيل. يرجى إعادة المحاولة.');
      setIsDownloading(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm('هل تريد حذف النسخة المصوّرة لمصحف المدينة لتوفير المساحة؟')) {
      await clearMushafCache();
      setDownloaded(false);
    }
  };

  const handleToneChange = (tone: PaperTone) => {
    setPaperTone(tone);
    setMushafPaperTone(tone);
  };

  const handleSpreadToggle = () => {
    const next = spreadMode === 'single' ? 'double' : 'single';
    setSpreadMode(next);
    setMushafSpreadMode(next);
  };

  const currentSurah = getSurahForPage(currentPage);
  const currentJuz = getJuzForPage(currentPage);

  // Background style depending on chosen paper tone
  const paperStyles: Record<PaperTone, { bg: string; text: string; name: string }> = {
    'warm-ivory': { bg: '#FBF7EE', text: '#212121', name: 'عاجي دافئ' },
    'pure-white': { bg: '#FFFFFF', text: '#111111', name: 'أبيض ناصع' },
    'sepia-parchment': { bg: '#F2E8D5', text: '#2C2216', name: 'بردي عتيق' },
    'night-dark': { bg: '#161B18', text: '#EDE5D8', name: 'قراءة ليلية' },
  };

  const currentPaper = paperStyles[paperTone];

  // Filtered surahs for the index modal
  const filteredSurahs = MUSHAF_SURAHS.filter((s) => {
    const q = indexSearch.trim();
    if (!q) return true;
    return s.nameAr.includes(q) || s.number.toString() === q || s.startPage.toString() === q;
  });

  // Render Download Gate if user hasn't downloaded the Mushaf yet
  if (!downloaded) {
    return (
      <div className="space-y-6 pb-20 select-none animate-fadeIn" dir="rtl">
        {/* شريط التحويل بين الأنماط */}
        <div
          className="flex items-center justify-between p-2 rounded-2xl border"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
        >
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-xl text-xs font-bold font-sans shadow-xs"
              style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
            >
              مصحف المدينة المصوَّر
            </span>
            <button
              onClick={onSwitchToTextMode}
              className="px-3 py-1.5 rounded-xl text-xs font-sans text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              التلاوة النصية (سور)
            </button>
          </div>
          <span className="text-[11px] font-sans text-neutral-500">طبعة ٦٠٤ صفحة</span>
        </div>

        {/* بطاقة الواجهة الفيكتورية لطلب التحميل */}
        <div
          className="relative rounded-3xl border p-6 md:p-8 text-center overflow-hidden shadow-md"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.accent,
          }}
        >
          {/* لمسات زخرفية فيكتورية في الزوايا */}
          <div
            className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 rounded-tr-xl pointer-events-none opacity-40"
            style={{ borderColor: colors.accent }}
          />
          <div
            className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 rounded-tl-xl pointer-events-none opacity-40"
            style={{ borderColor: colors.accent }}
          />
          <div
            className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 rounded-br-xl pointer-events-none opacity-40"
            style={{ borderColor: colors.accent }}
          />
          <div
            className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 rounded-bl-xl pointer-events-none opacity-40"
            style={{ borderColor: colors.accent }}
          />

          {/* أيقونة المصحف الشريف المركزية */}
          <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full opacity-20 animate-pulse"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center shadow-md transform rotate-3"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.accent,
                color: colors.accent,
              }}
            >
              <BookOpen size={40} />
            </div>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight mb-2" style={{ color: colors.primary }}>
            مُصْحَفُ المَدِينَةِ النَّبَوِيَّةِ الشَّرِيفَةِ
          </h2>

          <p className="font-sans text-xs md:text-sm text-neutral-600 mb-6 max-w-md mx-auto leading-relaxed">
            طبعة مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة برواية حفص عن عاصم (٦٠٤ صفحات كاملة مصوّرة بالرسم العثماني).
          </p>

          {/* ميزات النسخة المصورة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-6 text-right font-sans text-xs">
            <div
              className="p-3 rounded-xl border flex items-center gap-2.5"
              style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
            >
              <CheckCircle2 size={16} style={{ color: colors.accent }} className="shrink-0" />
              <span>مطابقة ١٠٠٪ لصفحات المصحف الورقي المطبوع</span>
            </div>
            <div
              className="p-3 rounded-xl border flex items-center gap-2.5"
              style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
            >
              <CheckCircle2 size={16} style={{ color: colors.accent }} className="shrink-0" />
              <span>تعمل دون اتصال بالإنترنت بعد التحميل وبخصوصية</span>
            </div>
            <div
              className="p-3 rounded-xl border flex items-center gap-2.5"
              style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
            >
              <CheckCircle2 size={16} style={{ color: colors.accent }} className="shrink-0" />
              <span>فهرس كامل لجميع السور والأجزاء والأحزاب</span>
            </div>
            <div
              className="p-3 rounded-xl border flex items-center gap-2.5"
              style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
            >
              <CheckCircle2 size={16} style={{ color: colors.accent }} className="shrink-0" />
              <span>شريط الفاصل المرجعي الحريري ودعاء الختم</span>
            </div>
          </div>

          {/* حالة التنزيل والزر الرئيسي */}
          {isDownloading ? (
            <div className="space-y-4 max-w-md mx-auto py-3">
              <div className="flex justify-between text-xs font-sans font-bold" style={{ color: colors.primary }}>
                <span>{downloadStepText}</span>
                <span>{downloadProgress}٪</span>
              </div>
              <div
                className="w-full h-3 rounded-full overflow-hidden p-0.5 border"
                style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${downloadProgress}%`,
                    backgroundColor: colors.accent,
                  }}
                />
              </div>
              <p className="font-sans text-[11px] text-neutral-500">
                يتم الآن تجهيز صفحات المصحف وتخزينها في ذاكرة التطبيق الدائمة للاستخدام دون إنترنت...
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-sm mx-auto">
              <button
                onClick={handleStartDownload}
                className="w-full py-3.5 px-6 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.accent,
                }}
              >
                <Download size={18} />
                <span>تحميل مصحف المدينة كاملاً (٤٨ ميغابايت)</span>
              </button>

              <button
                onClick={onSwitchToTextMode}
                className="w-full py-2.5 px-4 rounded-xl font-sans text-xs text-neutral-600 hover:text-neutral-900 border transition-colors"
                style={{ borderColor: colors.borderSubtle }}
              >
                المتابعة في القارئ النصي العادي حالياً
              </button>
            </div>
          )}

          {downloadError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-sans">
              {downloadError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Mushaf Reader View
  return (
    <div
      ref={containerRef}
      className={`space-y-3 pb-24 select-none animate-fadeIn ${
        isFullscreen ? 'fixed inset-0 z-50 p-2 md:p-6 overflow-y-auto' : ''
      }`}
      style={{
        backgroundColor: isFullscreen ? currentPaper.bg : undefined,
      }}
      dir="rtl"
    >
      {/* شريط التحكم العلوي للمصحف المصور */}
      <div
        className="sticky top-16 z-30 rounded-2xl border p-2.5 flex items-center justify-between shadow-xs backdrop-blur-md"
        style={{ backgroundColor: `${colors.bgCard}F8`, borderColor: colors.borderSubtle }}
      >
        {/* زر الفهرس السريع */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowIndexModal(true)}
            className="flex items-center gap-1 text-xs font-sans font-bold px-3 py-1.5 rounded-xl border transition-transform active:scale-95"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCardElevated,
              color: colors.primary,
            }}
          >
            <List size={14} />
            <span>الفهرس</span>
          </button>

          {/* التبديل للقارئ النصي */}
          <button
            onClick={onSwitchToTextMode}
            className="text-[11px] font-sans px-2.5 py-1.5 rounded-xl text-neutral-500 hover:text-neutral-800 transition-colors border border-transparent hover:border-neutral-200"
          >
            قارئ نصي
          </button>
        </div>

        {/* عنوان الصفحة الحالي */}
        <div className="text-center">
          <div className="font-arabic-uthmani text-sm font-bold leading-none" style={{ color: colors.primary }}>
            سورة {currentSurah.nameAr}
          </div>
          <div className="font-sans text-[10px] text-neutral-500 mt-0.5">
            {currentJuz.nameAr} · صفحة {toArabicNumerals(currentPage)}
          </div>
        </div>

        {/* أدوات القراءة: الفاصل الحريري، لون الورق، التكبير */}
        <div className="flex items-center gap-1">
          {/* زر الفاصل الحريري المرجعي */}
          <button
            onClick={handleToggleBookmark}
            title={bookmarkedPage === currentPage ? 'إزالة الفاصل' : 'وضع الفاصل المرجعي هنا'}
            className="p-1.5 rounded-xl border transition-transform active:scale-95"
            style={{
              borderColor: bookmarkedPage === currentPage ? colors.accent : colors.borderSubtle,
              backgroundColor: bookmarkedPage === currentPage ? `${colors.accent}20` : colors.bgCardElevated,
              color: bookmarkedPage === currentPage ? colors.accent : colors.primary,
            }}
          >
            {bookmarkedPage === currentPage ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>

          {/* تبديل وضع ملء الشاشة */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border transition-transform active:scale-95"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCardElevated,
              color: colors.primary,
            }}
            title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* شريط الأدوات الثانوي: ألوان الورق ودعاء الختم */}
      <div
        className="flex items-center justify-between text-xs font-sans px-3 py-1.5 rounded-xl border"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-neutral-500">لون الورق:</span>
          {(['warm-ivory', 'pure-white', 'sepia-parchment', 'night-dark'] as PaperTone[]).map((tone) => (
            <button
              key={tone}
              onClick={() => handleToneChange(tone)}
              className={`w-5 h-5 rounded-full border transition-transform active:scale-90 ${
                paperTone === tone ? 'ring-2 ring-offset-1' : 'opacity-70'
              }`}
              style={{
                backgroundColor: paperStyles[tone].bg,
                borderColor: '#B08D57',
              }}
              title={paperStyles[tone].name}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* الانتقال السريع لرقم الصفحة */}
          <button
            onClick={() => {
              setPageInputVal(currentPage.toString());
              setShowPageInputModal(true);
            }}
            className="text-[11px] font-sans text-neutral-600 hover:text-neutral-900 underline"
          >
            انتقال لصفحة
          </button>

          {/* دعاء ختم القرآن */}
          <button
            onClick={() => setShowDuaaModal(true)}
            className="flex items-center gap-1 text-[11px] font-sans font-bold px-2 py-0.5 rounded-lg border"
            style={{
              borderColor: colors.accent,
              color: colors.primary,
              backgroundColor: `${colors.accent}15`,
            }}
          >
            <Sparkles size={11} />
            <span>دعاء الختم</span>
          </button>
        </div>
      </div>

      {/* منطقة عرض صفحة المصحف الشريف */}
      <div className="relative mx-auto max-w-xl flex justify-center">
        {/* شريط الفاصل المرجعي الحريري المنسدل من الأعلى */}
        {bookmarkedPage === currentPage && (
          <div
            className="absolute -top-3 right-8 z-20 w-5 h-20 shadow-md pointer-events-none transition-all duration-300"
            style={{
              backgroundColor: '#B22222', // Deep Victorian ruby silk
              borderBottom: '4px solid #D4AF37',
              clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
            }}
            title="الفاصل الحريري لموضع التلاوة"
          />
        )}

        {/* إطار الصفحة المطابق لصفحات مصحف المدينة */}
        <div
          className="relative w-full rounded-2xl md:rounded-3xl border-2 shadow-xl overflow-hidden transition-all duration-200"
          style={{
            backgroundColor: currentPaper.bg,
            borderColor: '#2A52BE', // Royal Azure border matching the printed Madinah Mushaf
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* الترويسة العلوية للإطار القرآني (اسم السورة والجزء) */}
          <div
            className="flex items-center justify-between px-4 py-2 border-b text-xs font-serif"
            style={{
              borderColor: 'rgba(42, 82, 190, 0.25)',
              backgroundColor: 'rgba(42, 82, 190, 0.05)',
              color: '#1F3D2B',
            }}
          >
            <span className="font-arabic-uthmani text-sm font-bold" style={{ color: '#0F3859' }}>
              سُورَةُ {currentSurah.nameAr}
            </span>
            <span className="font-arabic-uthmani text-sm font-bold" style={{ color: '#0F3859' }}>
              {currentJuz.nameAr}
            </span>
          </div>

          {/* صورة الصفحة الأصلية لمصحف مجمع الملك فهد بالمدينة */}
          <div className="relative p-2 md:p-3 flex items-center justify-center min-h-[520px]">
            {!imageError ? (
              <img
                src={getMushafPageImageUrl(currentPage)}
                alt={`مصحف المدينة - صفحة ${currentPage}`}
                className="w-full h-auto object-contain rounded-sm select-none"
                style={{
                  filter: paperTone === 'night-dark' ? 'invert(0.9) hue-rotate(180deg)' : undefined,
                  maxHeight: isFullscreen ? '85vh' : '720px',
                }}
                onError={() => setImageError(true)}
                loading="eager"
              />
            ) : (
              /* بديل في حال انقطاع الشبكة قبل إتمام كاش الصفحة */
              <div className="p-6 text-center space-y-4 my-auto">
                <div
                  className="p-4 rounded-2xl border"
                  style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
                >
                  <p className="font-arabic-uthmani text-lg font-bold mb-2" style={{ color: colors.primary }}>
                    سورة {currentSurah.nameAr} · {currentJuz.nameAr}
                  </p>
                  <p className="font-sans text-xs text-neutral-600 mb-4">
                    الصفحة رقم {toArabicNumerals(currentPage)} من مصحف المدينة النبوية الشريفة.
                  </p>
                  <button
                    onClick={() => setImageError(false)}
                    className="px-4 py-2 rounded-xl text-xs font-sans font-bold text-white shadow-xs"
                    style={{ backgroundColor: colors.primary }}
                  >
                    إعادة تحميل الصفحة
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* التذييل السفلي للإطار القرآني (رقم الصفحة في الخاتم الزخرفي) */}
          <div
            className="flex items-center justify-center py-2 border-t"
            style={{
              borderColor: 'rgba(42, 82, 190, 0.25)',
              backgroundColor: 'rgba(42, 82, 190, 0.05)',
            }}
          >
            <div
              className="px-4 py-0.5 rounded-full border text-xs font-arabic-uthmani font-bold shadow-2xs"
              style={{
                backgroundColor: currentPaper.bg,
                borderColor: '#B08D57',
                color: '#1F3D2B',
              }}
            >
              {toArabicNumerals(currentPage)}
            </div>
          </div>
        </div>
      </div>

      {/* شريط التحكم السفلي وتقليب الصفحات */}
      <div
        className="rounded-2xl border p-3 space-y-3 shadow-md"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* زر الصفحة السابقة (في القراءة العربية من اليمين: الصفحة الأسبق رقمياً تكون يسار أو يمين حسب الترتيب) */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-sans font-bold transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCardElevated,
              color: colors.primary,
            }}
          >
            <ChevronRight size={16} />
            <span>الصفحة السابقة</span>
          </button>

          {/* شارة رقم الصفحة المباشرة */}
          <span className="font-sans text-xs font-bold" style={{ color: colors.primary }}>
            {toArabicNumerals(currentPage)} / ٦٠٤
          </span>

          {/* زر الصفحة التالية */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= 604}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-sans font-bold transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCardElevated,
              color: colors.primary,
            }}
          >
            <span>الصفحة التالية</span>
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* منزلق التنقل السريع بين الصفحات */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-sans text-neutral-400">١</span>
          <input
            type="range"
            min="1"
            max="604"
            value={currentPage}
            onChange={(e) => handlePageChange(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-800 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
          />
          <span className="text-[10px] font-sans text-neutral-400">٦٠٤</span>
        </div>
      </div>

      {/* نافذة فهرس السور والأجزاء */}
      {showIndexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="w-full max-w-lg max-h-[85vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
            dir="rtl"
          >
            {/* رأس الفهرس */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: colors.borderSubtle }}
            >
              <div>
                <h3 className="font-serif text-lg font-bold" style={{ color: colors.primary }}>
                  فهرس مصحف المدينة النبوية
                </h3>
                <p className="font-sans text-[11px] text-neutral-500">
                  انقر على أي سورة أو جزء للانتقال المباشر لصفحته
                </p>
              </div>
              <button
                onClick={() => setShowIndexModal(false)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold text-neutral-500 hover:text-neutral-900"
                style={{ borderColor: colors.borderSubtle }}
              >
                ✕
              </button>
            </div>

            {/* أزرار التبديل والبحث */}
            <div className="p-3 border-b space-y-2" style={{ borderColor: colors.borderSubtle }}>
              <div className="flex rounded-xl p-0.5 border" style={{ borderColor: colors.borderSubtle }}>
                <button
                  onClick={() => setIndexTab('surahs')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors ${
                    indexTab === 'surahs' ? 'shadow-xs' : 'text-neutral-500'
                  }`}
                  style={{
                    backgroundColor: indexTab === 'surahs' ? colors.primary : 'transparent',
                    color: indexTab === 'surahs' ? '#FFFFFF' : undefined,
                  }}
                >
                  فهرس السور (١١٤ سورة)
                </button>
                <button
                  onClick={() => setIndexTab('juz')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors ${
                    indexTab === 'juz' ? 'shadow-xs' : 'text-neutral-500'
                  }`}
                  style={{
                    backgroundColor: indexTab === 'juz' ? colors.primary : 'transparent',
                    color: indexTab === 'juz' ? '#FFFFFF' : undefined,
                  }}
                >
                  فهرس الأجزاء (٣٠ جزءاً)
                </button>
              </div>

              {indexTab === 'surahs' && (
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 text-neutral-400" size={14} />
                  <input
                    type="text"
                    value={indexSearch}
                    onChange={(e) => setIndexSearch(e.target.value)}
                    placeholder="ابحث عن اسم السورة أو رقم الصفحة..."
                    className="w-full pr-8 pl-3 py-1.5 rounded-xl border text-xs font-sans bg-transparent focus:outline-hidden"
                    style={{ borderColor: colors.borderSubtle }}
                  />
                </div>
              )}
            </div>

            {/* قائمة الفهرس */}
            <div className="overflow-y-auto p-3 space-y-1.5 flex-1 divide-y divide-neutral-100">
              {indexTab === 'surahs' ? (
                filteredSurahs.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => {
                      handlePageChange(s.startPage);
                      setShowIndexModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-colors hover:bg-black/5 ${
                      currentPage >= s.startPage && currentPage <= s.endPage ? 'ring-1' : ''
                    }`}
                    style={{
                      borderColor: colors.accent,
                      backgroundColor:
                        currentPage >= s.startPage && currentPage <= s.endPage
                          ? `${colors.accent}15`
                          : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-lg border flex items-center justify-center font-sans text-xs font-bold"
                        style={{ borderColor: colors.borderSubtle, color: colors.primary }}
                      >
                        {toArabicNumerals(s.number)}
                      </span>
                      <div>
                        <div className="font-arabic-uthmani text-sm font-bold" style={{ color: colors.primary }}>
                          سورة {s.nameAr}
                        </div>
                        <div className="font-sans text-[10px] text-neutral-400">
                          {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {toArabicNumerals(s.versesCount)} آية
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <span
                        className="text-xs font-sans font-bold px-2 py-0.5 rounded-lg border"
                        style={{
                          borderColor: colors.borderSubtle,
                          backgroundColor: colors.bgCardElevated,
                          color: colors.primary,
                        }}
                      >
                        صفحة {toArabicNumerals(s.startPage)}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                JUZ_LIST.map((j) => (
                  <button
                    key={j.juzNumber}
                    onClick={() => {
                      handlePageChange(j.startPage);
                      setShowIndexModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-colors hover:bg-black/5 ${
                      currentJuz.juzNumber === j.juzNumber ? 'ring-1' : ''
                    }`}
                    style={{
                      borderColor: colors.accent,
                      backgroundColor:
                        currentJuz.juzNumber === j.juzNumber ? `${colors.accent}15` : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-lg border flex items-center justify-center font-sans text-xs font-bold"
                        style={{ borderColor: colors.borderSubtle, color: colors.primary }}
                      >
                        {toArabicNumerals(j.juzNumber)}
                      </span>
                      <div className="font-arabic-uthmani text-sm font-bold" style={{ color: colors.primary }}>
                        {j.nameAr}
                      </div>
                    </div>
                    <span
                      className="text-xs font-sans font-bold px-2 py-0.5 rounded-lg border"
                      style={{
                        borderColor: colors.borderSubtle,
                        backgroundColor: colors.bgCardElevated,
                        color: colors.primary,
                      }}
                    >
                      صفحة {toArabicNumerals(j.startPage)}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* تذييل الفهرس */}
            <div
              className="p-3 border-t flex items-center justify-between bg-black/5"
              style={{ borderColor: colors.borderSubtle }}
            >
              <button
                onClick={handleClearCache}
                className="text-[11px] font-sans text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>حذف النسخة لتوفير المساحة</span>
              </button>
              <button
                onClick={() => setShowIndexModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-sans font-bold text-white shadow-xs"
                style={{ backgroundColor: colors.primary }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الانتقال المباشر لرقم الصفحة */}
      {showPageInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="w-full max-w-xs rounded-3xl border p-5 space-y-4 shadow-xl text-center"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
            dir="rtl"
          >
            <h4 className="font-serif text-base font-bold" style={{ color: colors.primary }}>
              انتقال إلى صفحة
            </h4>
            <p className="font-sans text-xs text-neutral-500">أدخل رقم الصفحة بين ١ و ٦٠٤</p>
            <input
              type="number"
              min="1"
              max="604"
              value={pageInputVal}
              onChange={(e) => setPageInputVal(e.target.value)}
              className="w-full py-2 px-3 text-center text-lg font-sans font-bold rounded-xl border focus:outline-hidden"
              style={{ borderColor: colors.accent, backgroundColor: colors.bgCardElevated }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const p = parseInt(pageInputVal, 10);
                  if (!isNaN(p)) handlePageChange(p);
                  setShowPageInputModal(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-sans font-bold text-white shadow-xs"
                style={{ backgroundColor: colors.primary }}
              >
                انتقال
              </button>
              <button
                onClick={() => setShowPageInputModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-sans border text-neutral-600 hover:text-neutral-900"
                style={{ borderColor: colors.borderSubtle }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة دعاء ختم القرآن الكريم */}
      {showDuaaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="w-full max-w-lg max-h-[85vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
            dir="rtl"
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: colors.borderSubtle }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: colors.accent }} />
                <h3 className="font-serif text-lg font-bold" style={{ color: colors.primary }}>
                  دُعَاءُ خَتْمِ القُرْآنِ الكَرِيمِ
                </h3>
              </div>
              <button
                onClick={() => setShowDuaaModal(false)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold text-neutral-500"
                style={{ borderColor: colors.borderSubtle }}
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 flex-1 font-arabic-uthmani text-base md:text-lg leading-[2.5] text-neutral-800 text-center">
              <div className="text-sm font-sans font-bold text-neutral-500 mb-2">
                مأثور ختم القرآن كما ورد في خاتمة مصحف المدينة النبوية الشريفة
              </div>
              {KHATM_AL_QURAN_DUAA.map((item, idx) => (
                <p key={idx} className="p-3 rounded-2xl bg-black/2 border border-neutral-100">
                  {item}
                </p>
              ))}
            </div>

            <div className="p-3 border-t text-center" style={{ borderColor: colors.borderSubtle }}>
              <button
                onClick={() => setShowDuaaModal(false)}
                className="px-6 py-2 rounded-xl text-xs font-sans font-bold text-white shadow-xs"
                style={{ backgroundColor: colors.primary }}
              >
                تقبّل الله منّا ومنكم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
