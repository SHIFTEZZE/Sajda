import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  BookOpen,
  ScrollText,
  Volume2,
  VolumeX,
  ChevronLeft,
  Sparkles,
  Share2,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { DayPrayerTimes, formatCountdown, ARABIC_PRAYER_NAMES } from '../utils/prayerTimes.ts';
import { HijriDateInfo } from '../utils/hijriDate.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';
import { DAILY_AYAHS } from '../data/quranData.ts';
import { RecordsMap, loadReadingProgress } from '../services/trackerStorage.ts';
import { formatDateKey, TRACKED_PRAYERS, DailyPrayerName, PrayerState } from '../utils/trackerLogic.ts';
import { audioAdhan } from '../services/audioAdhan.ts';

interface HomeTabProps {
  prayerTimes: DayPrayerTimes;
  hijriDate: HijriDateInfo;
  settings: AppSettings;
  colors: ThemeColors;
  records: RecordsMap;
  onNavigateTab: (tab: 'quran' | 'tracker' | 'settings' | 'qibla' | 'mosques' | 'hadith') => void;
  onQuickRecord: (prayer: DailyPrayerName, state: PrayerState) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  prayerTimes,
  hijriDate,
  settings,
  colors,
  records,
  onNavigateTab,
  onQuickRecord,
}) => {
  const [countdownText, setCountdownText] = useState('00:00:00');
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [copiedAyah, setCopiedAyah] = useState(false);

  const todayDate = new Date();
  const dayOfYear = Math.floor(
    (todayDate.getTime() - new Date(todayDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const dailyAyah = DAILY_AYAHS[dayOfYear % DAILY_AYAHS.length];

  const todayKey = formatDateKey(todayDate);
  const recordedTodayCount = TRACKED_PRAYERS.filter((p) => {
    const id = `${todayKey}_${p}`;
    const rec = records[id];
    return rec && rec.state !== 'not_recorded';
  }).length;

  const readingProgress = loadReadingProgress();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((prayerTimes.nextPrayerTime.getTime() - now) / 1000));
      const formatted = formatCountdown(diffSec);
      setCountdownText(formatted.text);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes.nextPrayerTime]);

  const handleToggleAdhan = () => {
    if (isPlayingAdhan) {
      audioAdhan.stop();
      setIsPlayingAdhan(false);
    } else {
      setIsPlayingAdhan(true);
      audioAdhan.playAdhanPreview(() => {
        setIsPlayingAdhan(false);
      }, prayerTimes.nextPrayer === 'Fajr');
    }
  };

  const handleShareAyah = () => {
    const shareText = `قال الله تعالى: ﴿${dailyAyah.arabic}﴾\n\nتأمل: ${dailyAyah.reflectionAr}\n[سورة ${dailyAyah.surahNameAr} - آية ${dailyAyah.ayahNumber}]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedAyah(true);
      setTimeout(() => setCopiedAyah(false), 2500);
    }
  };

  const currentPrayerArabic = ARABIC_PRAYER_NAMES[prayerTimes.currentPrayer] || prayerTimes.currentPrayer;
  const nextPrayerArabic = ARABIC_PRAYER_NAMES[prayerTimes.nextPrayer] || prayerTimes.nextPrayer;
  const cityName = settings.location.arabicName || settings.location.cityName.split('(')[0].trim();

  // Arabic formatted Gregorian date
  const gregorianDateAr = todayDate.toLocaleDateString('ar-MA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* بطاقة التاريخ الهجري والميلادي والمدينة */}
      <div
        className="rounded-2xl border p-4 text-center shadow-xs transition-all relative overflow-hidden"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.borderSubtle,
        }}
      >
        <div
          className="absolute -top-6 -right-6 w-14 h-14 rounded-full opacity-15 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-14 h-14 rounded-full opacity-15 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />

        <div className="flex items-center justify-center gap-2 text-xs font-sans text-neutral-500 mb-1">
          <MapPin size={13} style={{ color: colors.accent }} />
          <span className="font-semibold text-neutral-700">{cityName}</span>
          <span aria-hidden="true">·</span>
          <span>{gregorianDateAr}</span>
        </div>

        {/* عرض التاريخ الهجري */}
        <div className="font-arabic-uthmani text-2xl font-bold tracking-wide my-0.5" style={{ color: colors.primary }}>
          {hijriDate.formattedAr}
        </div>
        <div className="text-[11px] font-sans text-neutral-500">
          الموافق: {todayDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })} م
        </div>
      </div>

      {/* بطاقة الصلاة القادمة والعد التنازلي */}
      <div
        className="rounded-2xl border shadow-md p-5 text-center relative overflow-hidden transition-all"
        style={{
          backgroundColor: colors.primary,
          borderColor: colors.accent,
          color: '#FFF8EE',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] font-sans font-bold px-3 py-1 rounded-full border border-amber-300/30"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: colors.accent }}
          >
            الصلاة القادمة
          </span>
          <button
            onClick={handleToggleAdhan}
            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-amber-300/30 transition-transform active:scale-95 font-sans"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: colors.accent }}
            title="سماع نداء الأذان"
            aria-label="سماع الأذان"
          >
            {isPlayingAdhan ? (
              <>
                <VolumeX size={13} />
                <span>إيقاف الأذان</span>
              </>
            ) : (
              <>
                <Volume2 size={13} />
                <span>سماع الأذان</span>
              </>
            )}
          </button>
        </div>

        {/* اسم الصلاة القادمة */}
        <div className="flex items-baseline justify-center gap-2 my-1">
          <h2 className="text-3xl font-display-victorian font-bold tracking-tight text-white">
            صلاة {nextPrayerArabic}
          </h2>
        </div>

        {/* مؤشر العد التنازلي الحي */}
        <div className="my-2">
          <div className="font-mono text-3xl font-bold tracking-widest text-amber-200 drop-shadow-xs" dir="ltr">
            {countdownText}
          </div>
          <div className="text-xs font-sans text-amber-100/90 mt-1">
            موعد الأذان عند الساعة{' '}
            <strong className="font-mono font-bold" dir="ltr">
              {prayerTimes.nextPrayerTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </strong>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-200/20 flex items-center justify-between text-xs text-amber-100/90 font-sans">
          <span>الصلاة الحالية: <strong>{currentPrayerArabic}</strong></span>
          <span>المعيار: <strong>توقيت المغرب (الأوقاف)</strong></span>
        </div>
      </div>

      {/* جدول مواقيت اليوم الصلوات الخمس */}
      <div
        className="rounded-2xl border p-4 shadow-xs"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.borderSubtle,
        }}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-display-victorian font-bold text-sm tracking-wide" style={{ color: colors.primary }}>
            مواقيت الصلوات اليوم
          </h3>
          <span className="text-[11px] font-sans text-neutral-500">
            توقيت وزارة الأوقاف المغربية
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {prayerTimes.list.map((pt) => {
            const isHighlighted = pt.isCurrent;
            const isNext = pt.isNext;

            return (
              <div
                key={pt.name}
                className="p-2.5 rounded-xl border text-center transition-all relative overflow-hidden"
                style={{
                  backgroundColor: isHighlighted
                    ? `${colors.accent}15`
                    : isNext
                    ? `${colors.primary}0D`
                    : colors.bgCardElevated,
                  borderColor: isHighlighted
                    ? colors.accent
                    : isNext
                    ? colors.primary
                    : colors.borderSubtle,
                  boxShadow: isHighlighted ? `0 0 0 1px ${colors.accent}` : 'none',
                }}
              >
                {isNext && (
                  <span
                    className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  />
                )}
                <div
                  className="text-xs font-sans font-bold truncate"
                  style={{ color: isHighlighted ? colors.primary : colors.textMain }}
                >
                  {pt.arabicName}
                </div>
                <div
                  className="font-mono text-sm font-bold tracking-tight mt-1"
                  style={{ color: isHighlighted ? colors.primary : colors.textMain }}
                  dir="ltr"
                >
                  {pt.formattedTime}
                </div>
                {isHighlighted && (
                  <div className="text-[10px] font-sans font-semibold mt-0.5" style={{ color: colors.accent }}>
                    الحالية
                  </div>
                )}
                {isNext && (
                  <div className="text-[10px] font-sans font-semibold mt-0.5" style={{ color: colors.primary }}>
                    القادمة
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* بطاقة ملخص محاسبة الصلاة لليوم */}
      <div
        className="rounded-2xl border p-4 shadow-xs flex flex-col justify-between"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.borderSubtle,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} style={{ color: colors.accent }} />
            <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              محاسبة الصلوات اليوم
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('tracker')}
            className="text-xs font-sans font-bold flex items-center gap-0.5"
            style={{ color: colors.accent }}
          >
            <span>السجل الكامل</span>
            <ChevronLeft size={14} />
          </button>
        </div>

        <div
          className="flex items-center justify-between p-3 rounded-xl border mb-3"
          style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
        >
          <div>
            <div className="text-xs font-medium text-neutral-600 font-sans">سجل اليوم</div>
            <div className="text-lg font-display-victorian font-bold" style={{ color: colors.primary }}>
              تم تسجيل {recordedTodayCount} من 5 صلوات
            </div>
          </div>
          <div className="flex gap-1.5" dir="ltr">
            {TRACKED_PRAYERS.map((prayer) => {
              const id = `${todayKey}_${prayer}`;
              const state = records[id]?.state || 'not_recorded';
              let color = 'rgba(0,0,0,0.2)';
              let bg = 'transparent';
              if (state === 'prayed_on_time') {
                color = '#1F3D2B';
                bg = '#1F3D2B20';
              } else if (state === 'prayed_later') {
                color = '#B08D57';
                bg = '#B08D5725';
              } else if (state === 'not_performed') {
                color = '#85263A';
                bg = '#85263A20';
              }
              const arLetter = ARABIC_PRAYER_NAMES[prayer]?.[0] || prayer[0];
              return (
                <div
                  key={prayer}
                  className="w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-sans"
                  style={{ borderColor: color, color, backgroundColor: bg }}
                  title={`${ARABIC_PRAYER_NAMES[prayer]}: ${
                    state === 'prayed_on_time'
                      ? 'في وقتها'
                      : state === 'prayed_later'
                      ? 'قضاء / متأخرة'
                      : state === 'not_performed'
                      ? 'لم تؤدَّ'
                      : 'غير مسجلة'
                  }`}
                >
                  {arLetter}
                </div>
              );
            })}
          </div>
        </div>

        {/* تسجيل فوري للصلاة الحالية أو السابقة */}
        {prayerTimes.currentPrayer !== 'None' && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100 font-sans">
            <span className="text-neutral-700">
              تسجيل صلاة <strong>{currentPrayerArabic}</strong>:
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => onQuickRecord(prayerTimes.currentPrayer as DailyPrayerName, 'prayed_on_time')}
                className="px-3 py-1 rounded-lg border text-xs font-bold transition-all active:scale-95"
                style={{
                  borderColor: '#1F3D2B40',
                  backgroundColor: '#1F3D2B15',
                  color: '#1F3D2B',
                }}
              >
                في وقتها
              </button>
              <button
                onClick={() => onQuickRecord(prayerTimes.currentPrayer as DailyPrayerName, 'prayed_later')}
                className="px-3 py-1 rounded-lg border text-xs font-bold transition-all active:scale-95"
                style={{
                  borderColor: '#B08D5740',
                  backgroundColor: '#B08D5715',
                  color: '#7D6238',
                }}
              >
                قضاء / متأخرة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* شبكة الاختصارات الرئيسية الأربعة */}
      <div className="grid grid-cols-2 gap-3">
        {/* بوصلة القبلة */}
        <button
          onClick={() => onNavigateTab('qibla')}
          className="p-4 rounded-2xl border text-right transition-all active:scale-[0.98] flex flex-col justify-between shadow-xs group"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.borderSubtle,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: `${colors.accent}18`,
                borderColor: colors.accent,
                color: colors.accent,
              }}
            >
              <Compass size={18} />
            </div>
            <ChevronLeft size={16} className="text-neutral-400 group-hover:-translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              بوصلة القبلة
            </div>
            <div className="text-[11px] text-neutral-500 font-sans">
              الاتجاه الفلكي للكعبة المشرفة
            </div>
          </div>
        </button>

        {/* المساجد القريبة */}
        <button
          onClick={() => onNavigateTab('mosques')}
          className="p-4 rounded-2xl border text-right transition-all active:scale-[0.98] flex flex-col justify-between shadow-xs group"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.borderSubtle,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: `${colors.primary}15`,
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              <MapPin size={18} />
            </div>
            <ChevronLeft size={16} className="text-neutral-400 group-hover:-translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              المساجد القريبة
            </div>
            <div className="text-[11px] text-neutral-500 font-sans">
              بحث عبر خرائط OpenStreetMap
            </div>
          </div>
        </button>

        {/* القرآن الكريم ومتابعة القراءة */}
        <button
          onClick={() => onNavigateTab('quran')}
          className="p-4 rounded-2xl border text-right transition-all active:scale-[0.98] flex flex-col justify-between shadow-xs group"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.borderSubtle,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: `${colors.accent}18`,
                borderColor: colors.accent,
                color: colors.accent,
              }}
            >
              <BookOpen size={18} />
            </div>
            <ChevronLeft size={16} className="text-neutral-400 group-hover:-translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              القرآن الكريم
            </div>
            <div className="text-[11px] text-neutral-500 font-sans">
              متابعة القراءة من سورة {readingProgress.surahNumber}
            </div>
          </div>
        </button>

        {/* رياض الأحاديث النبوية */}
        <button
          onClick={() => onNavigateTab('hadith')}
          className="p-4 rounded-2xl border text-right transition-all active:scale-[0.98] flex flex-col justify-between shadow-xs group"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.borderSubtle,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: `${colors.primary}15`,
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              <ScrollText size={18} />
            </div>
            <ChevronLeft size={16} className="text-neutral-400 group-hover:-translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              رياض الأحاديث
            </div>
            <div className="text-[11px] text-neutral-500 font-sans">
              الأربعون النووية الصحيحة
            </div>
          </div>
        </button>
      </div>

      {/* بطاقة آية وتأمل اليوم */}
      <div
        className="rounded-2xl border p-5 shadow-xs relative"
        style={{
          backgroundColor: colors.quranSurface,
          borderColor: colors.borderSubtle,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-sans font-bold" style={{ color: colors.accent }}>
            <Sparkles size={14} />
            <span>آيَةٌ وَتَدَبُّرٌ لِيَوْمِكَ</span>
          </div>
          <button
            onClick={handleShareAyah}
            className="p-1.5 rounded-lg border text-neutral-500 hover:text-neutral-800 transition-colors"
            style={{ borderColor: colors.borderSubtle }}
            title="نسخ الآية وتأملها"
            aria-label="نسخ الآية"
          >
            {copiedAyah ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
          </button>
        </div>

        {/* نص الآية بالرسم العثماني */}
        <p
          className="font-arabic-uthmani text-2xl text-center my-3 leading-relaxed"
          style={{ color: colors.quranText }}
        >
          ﴿ {dailyAyah.arabic} ﴾
        </p>

        {/* التأمل الميسر */}
        <p className="text-xs text-neutral-700 font-sans leading-relaxed text-center px-2">
          {dailyAyah.reflectionAr}
        </p>

        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-sans">
          <span>سورة {dailyAyah.surahNameAr} [آية {dailyAyah.ayahNumber}]</span>
          <span className="font-bold" style={{ color: colors.accent }}>{dailyAyah.themeAr}</span>
        </div>
      </div>
    </div>
  );
};
