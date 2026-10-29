import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  X,
  CircleDashed,
  BarChart3,
  Award,
  Info,
} from 'lucide-react';
import {
  DailyPrayerName,
  PrayerState,
  TRACKED_PRAYERS,
  computeStatsForRecords,
  formatDateKey,
} from '../utils/trackerLogic.ts';
import { ARABIC_PRAYER_NAMES } from '../utils/prayerTimes.ts';
import { RecordsMap } from '../services/trackerStorage.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';

interface TrackerTabProps {
  records: RecordsMap;
  onSetRecord: (date: string, prayer: DailyPrayerName, state: PrayerState) => void;
  colors: ThemeColors;
  settings: AppSettings;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
}

type TrackerSubView = 'daily' | 'weekly' | 'monthly' | 'trends';

export const TrackerTab: React.FC<TrackerTabProps> = ({
  records,
  onSetRecord,
  colors,
  settings,
  onUpdateSettings,
}) => {
  const [activeSubView, setActiveSubView] = useState<TrackerSubView>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const selectedDateKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());
  const isSelectedToday = selectedDateKey === todayKey;

  const handlePrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    setSelectedDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleGoToday = () => {
    setSelectedDate(new Date());
  };

  const dayRecords = TRACKED_PRAYERS.map((p) => records[`${selectedDateKey}_${p}`]);
  const dayStats = computeStatsForRecords(dayRecords);

  const last30DaysRecords = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = formatDateKey(d);
    for (const p of TRACKED_PRAYERS) {
      last30DaysRecords.push(records[`${k}_${p}`]);
    }
  }
  const monthStats = computeStatsForRecords(last30DaysRecords);

  const weekDays: Date[] = [];
  const startOfWeek = new Date(selectedDate);
  const dayOfWeek = (startOfWeek.getDay() + 6) % 7; // الإثنين كبداية أسبوع
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const STATE_LABELS: Record<PrayerState, { label: string; desc: string; icon: any; color: string; bg: string }> = {
    not_recorded: {
      label: 'غير مسجلة',
      desc: 'لم يُسجل خيار بعد',
      icon: CircleDashed,
      color: '#78716c',
      bg: 'transparent',
    },
    prayed_on_time: {
      label: 'في وقتها',
      desc: 'أُدّيت في وقتها',
      icon: Check,
      color: '#1F3D2B',
      bg: '#1F3D2B15',
    },
    prayed_later: {
      label: 'قضاء / متأخرة',
      desc: 'أُدّيت بعد وقتها',
      icon: Clock,
      color: '#B08D57',
      bg: '#B08D5715',
    },
    not_performed: {
      label: 'لم تؤدَّ',
      desc: 'فاتت ولم تؤدَّ',
      icon: X,
      color: '#85263A',
      bg: '#85263A15',
    },
  };

  const selectedDateFormatted = selectedDate.toLocaleDateString('ar-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* شريط تبويبات طرق العرض الأربعة */}
      <div
        className="flex items-center p-1 rounded-xl border font-sans"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <button
          onClick={() => setActiveSubView('daily')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeSubView === 'daily' ? 'shadow-xs' : 'text-neutral-500'
          }`}
          style={{
            backgroundColor: activeSubView === 'daily' ? colors.primary : 'transparent',
            color: activeSubView === 'daily' ? '#fff' : undefined,
          }}
        >
          السجل اليومي
        </button>
        <button
          onClick={() => setActiveSubView('weekly')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeSubView === 'weekly' ? 'shadow-xs' : 'text-neutral-500'
          }`}
          style={{
            backgroundColor: activeSubView === 'weekly' ? colors.primary : 'transparent',
            color: activeSubView === 'weekly' ? '#fff' : undefined,
          }}
        >
          أسبوعي
        </button>
        <button
          onClick={() => setActiveSubView('monthly')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeSubView === 'monthly' ? 'shadow-xs' : 'text-neutral-500'
          }`}
          style={{
            backgroundColor: activeSubView === 'monthly' ? colors.primary : 'transparent',
            color: activeSubView === 'monthly' ? '#fff' : undefined,
          }}
        >
          التقويم
        </button>
        <button
          onClick={() => setActiveSubView('trends')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeSubView === 'trends' ? 'shadow-xs' : 'text-neutral-500'
          }`}
          style={{
            backgroundColor: activeSubView === 'trends' ? colors.primary : 'transparent',
            color: activeSubView === 'trends' ? '#fff' : undefined,
          }}
        >
          المؤشرات
        </button>
      </div>

      {/* العرض اليومي للصلوات الخمس */}
      {activeSubView === 'daily' && (
        <div className="space-y-4">
          {/* شريط اختيار والتنقل بين الأيام */}
          <div
            className="rounded-2xl border p-3 flex items-center justify-between shadow-xs font-sans"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl border text-neutral-600 hover:text-neutral-900 transition-colors"
              style={{ borderColor: colors.borderSubtle }}
              aria-label="اليوم السابق"
              title="اليوم السابق"
            >
              <ChevronRight size={16} />
            </button>

            <div className="text-center">
              <div className="text-xs font-bold" style={{ color: colors.primary }}>
                {selectedDateFormatted}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {isSelectedToday ? 'اليوم الحالي' : selectedDate < new Date() ? 'يوم سابق (قابل للتعديل)' : 'يوم قادم'}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {!isSelectedToday && (
                <button
                  onClick={handleGoToday}
                  className="px-2.5 py-1 text-[11px] rounded-lg font-bold border transition-colors"
                  style={{
                    borderColor: colors.accent,
                    color: colors.primary,
                    backgroundColor: `${colors.accent}15`,
                  }}
                >
                  اليوم
                </button>
              )}
              <button
                onClick={handleNextDay}
                className="p-2 rounded-xl border text-neutral-600 hover:text-neutral-900 transition-colors"
                style={{ borderColor: colors.borderSubtle }}
                aria-label="اليوم التالي"
                title="اليوم التالي"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {/* قائمة الصلوات الخمس بأزرار الحالات الأربع */}
          <div className="space-y-2.5 font-sans">
            {TRACKED_PRAYERS.map((prayer) => {
              const id = `${selectedDateKey}_${prayer}`;
              const currentState = records[id]?.state || 'not_recorded';
              const prayerAr = ARABIC_PRAYER_NAMES[prayer];

              return (
                <div
                  key={prayer}
                  className="rounded-2xl border p-3.5 shadow-xs transition-all"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: currentState !== 'not_recorded' ? colors.border : colors.borderSubtle,
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <h4 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
                        صلاة {prayerAr}
                      </h4>
                      <span className="text-[11px] text-neutral-500">
                        الحالة: <strong>{STATE_LABELS[currentState].label}</strong>
                      </span>
                    </div>

                    {/* شارة الحالة الحالية */}
                    <div
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border"
                      style={{
                        backgroundColor: STATE_LABELS[currentState].bg,
                        borderColor: STATE_LABELS[currentState].color,
                        color: STATE_LABELS[currentState].color,
                      }}
                    >
                      {React.createElement(STATE_LABELS[currentState].icon, { size: 12 })}
                      <span>{STATE_LABELS[currentState].label}</span>
                    </div>
                  </div>

                  {/* أزرار الحالات الأربع الواضحة */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {/* في وقتها */}
                    <button
                      type="button"
                      onClick={() => onSetRecord(selectedDateKey, prayer, 'prayed_on_time')}
                      className="py-2 px-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 flex flex-col items-center justify-center min-h-[46px]"
                      style={{
                        borderColor: currentState === 'prayed_on_time' ? '#1F3D2B' : colors.borderSubtle,
                        backgroundColor: currentState === 'prayed_on_time' ? '#1F3D2B' : colors.bgCardElevated,
                        color: currentState === 'prayed_on_time' ? '#FFF' : colors.textMain,
                        boxShadow: currentState === 'prayed_on_time' ? '0 2px 8px rgba(31,61,43,0.3)' : 'none',
                      }}
                    >
                      <Check size={14} className="mb-0.5" />
                      <span>في وقتها</span>
                    </button>

                    {/* قضاء / متأخرة */}
                    <button
                      type="button"
                      onClick={() => onSetRecord(selectedDateKey, prayer, 'prayed_later')}
                      className="py-2 px-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 flex flex-col items-center justify-center min-h-[46px]"
                      style={{
                        borderColor: currentState === 'prayed_later' ? '#B08D57' : colors.borderSubtle,
                        backgroundColor: currentState === 'prayed_later' ? '#B08D57' : colors.bgCardElevated,
                        color: currentState === 'prayed_later' ? '#FFF' : colors.textMain,
                        boxShadow: currentState === 'prayed_later' ? '0 2px 8px rgba(176,141,87,0.3)' : 'none',
                      }}
                    >
                      <Clock size={14} className="mb-0.5" />
                      <span>قضاء / متأخرة</span>
                    </button>

                    {/* لم تؤدَّ */}
                    <button
                      type="button"
                      onClick={() => onSetRecord(selectedDateKey, prayer, 'not_performed')}
                      className="py-2 px-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 flex flex-col items-center justify-center min-h-[46px]"
                      style={{
                        borderColor: currentState === 'not_performed' ? '#85263A' : colors.borderSubtle,
                        backgroundColor: currentState === 'not_performed' ? '#85263A' : colors.bgCardElevated,
                        color: currentState === 'not_performed' ? '#FFF' : colors.textMain,
                        boxShadow: currentState === 'not_performed' ? '0 2px 8px rgba(133,38,58,0.3)' : 'none',
                      }}
                    >
                      <X size={14} className="mb-0.5" />
                      <span>لم تؤدَّ</span>
                    </button>

                    {/* إلغاء التسجيل / غير مسجلة */}
                    <button
                      type="button"
                      onClick={() => onSetRecord(selectedDateKey, prayer, 'not_recorded')}
                      className="py-2 px-1 rounded-xl border text-[11px] font-medium transition-all active:scale-95 flex flex-col items-center justify-center text-neutral-400 min-h-[46px]"
                      style={{
                        borderColor: colors.borderSubtle,
                        backgroundColor: colors.bgCardElevated,
                        color: currentState === 'not_recorded' ? colors.primary : colors.textMuted,
                      }}
                      title="مسح التسجيل والعودة للحالة الافتراضية"
                    >
                      <CircleDashed size={14} className="mb-0.5" />
                      <span>غير مسجلة</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* بطاقة الرسالة التشجيعية المطمئنة */}
          <div
            className="rounded-2xl border p-4 shadow-xs text-center font-sans"
            style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
          >
            <div className="text-xs text-neutral-700 font-semibold leading-relaxed">
              « {dayStats.encouragingMessageAr} »
            </div>
            <div className="mt-2.5 text-[11px] text-neutral-500 flex items-center justify-center gap-4">
              <span>المسجلة: <strong>{dayStats.totalRecorded} / 5</strong></span>
              <span>في وقتها: <strong>{dayStats.prayedOnTime}</strong></span>
              <span>قضاء: <strong>{dayStats.prayedLater}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* العرض الأسبوعي (الجدول الماتريكس) */}
      {activeSubView === 'weekly' && (
        <div
          className="rounded-2xl border p-4 shadow-xs space-y-4 font-sans"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              جدول المحاسبة الأسبوعي
            </h3>
            <span className="text-[11px] text-neutral-500">
              أسبوع {weekDays[0].toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: colors.borderSubtle }}>
                  <th className="py-2 text-right text-neutral-500 font-bold">اليوم</th>
                  {TRACKED_PRAYERS.map((p) => (
                    <th key={p} className="py-2 font-bold" style={{ color: colors.primary }}>
                      {ARABIC_PRAYER_NAMES[p]}
                    </th>
                  ))}
                  <th className="py-2 text-neutral-500 font-bold">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {weekDays.map((d) => {
                  const dKey = formatDateKey(d);
                  const isToday = dKey === todayKey;
                  const dayRecords = TRACKED_PRAYERS.map((p) => records[`${dKey}_${p}`]);
                  const dayCount = dayRecords.filter((r) => r && r.state !== 'not_recorded').length;

                  return (
                    <tr
                      key={dKey}
                      onClick={() => {
                        setSelectedDate(d);
                        setActiveSubView('daily');
                      }}
                      className="border-b transition-colors cursor-pointer hover:bg-black/5"
                      style={{ borderColor: colors.borderSubtle }}
                    >
                      <td className="py-2.5 text-right font-medium">
                        <span className={isToday ? 'font-bold' : ''} style={{ color: isToday ? colors.primary : undefined }}>
                          {d.toLocaleDateString('ar-MA', { weekday: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      {TRACKED_PRAYERS.map((p) => {
                        const rec = records[`${dKey}_${p}`];
                        const state = rec?.state || 'not_recorded';
                        let symbol = '—';
                        let styleColor = 'text-neutral-300';
                        if (state === 'prayed_on_time') {
                          symbol = '✓';
                          styleColor = 'text-emerald-700 font-bold';
                        } else if (state === 'prayed_later') {
                          symbol = '⏱';
                          styleColor = 'text-amber-600 font-bold';
                        } else if (state === 'not_performed') {
                          symbol = '✕';
                          styleColor = 'text-rose-700 font-bold';
                        }

                        return (
                          <td key={p} className={`py-2.5 text-xs ${styleColor}`}>
                            {symbol}
                          </td>
                        );
                      })}
                      <td className="py-2.5 font-mono text-[11px] text-neutral-500" dir="ltr">
                        {dayCount}/5
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className="flex items-center justify-around pt-2 text-[10px] text-neutral-500 border-t"
            style={{ borderColor: colors.borderSubtle }}
          >
            <span className="flex items-center gap-1 text-emerald-700 font-bold">✓ في وقتها</span>
            <span className="flex items-center gap-1 text-amber-600 font-bold">⏱ قضاء</span>
            <span className="flex items-center gap-1 text-rose-700 font-bold">✕ لم تؤدَّ</span>
            <span className="flex items-center gap-1 text-neutral-400">— غير مسجلة</span>
          </div>
        </div>
      )}

      {/* عرض التقويم الشهري */}
      {activeSubView === 'monthly' && (
        <div
          className="rounded-2xl border p-4 shadow-xs space-y-3 font-sans"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              {selectedDate.toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })}
            </h3>
            <span className="text-[11px] text-neutral-500">اضغط على أي يوم للتعديل</span>
          </div>

          <div
            className="grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-500 pb-1 border-b font-bold"
            style={{ borderColor: colors.borderSubtle }}
          >
            <span>إثن</span>
            <span>ثلا</span>
            <span>أرب</span>
            <span>خمي</span>
            <span>جمع</span>
            <span>سبت</span>
            <span>أحد</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank_${idx}`} className="h-10 rounded-lg opacity-10" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const d = new Date(currentYear, currentMonth, dayNum);
              const dKey = formatDateKey(d);
              const isToday = dKey === todayKey;
              const isSelected = dKey === selectedDateKey;

              const prayersRecorded = TRACKED_PRAYERS.map((p) => records[`${dKey}_${p}`]).filter(
                (r) => r && r.state !== 'not_recorded'
              ).length;

              return (
                <button
                  key={dKey}
                  type="button"
                  onClick={() => {
                    setSelectedDate(d);
                    setActiveSubView('daily');
                  }}
                  className="h-11 rounded-xl border text-center flex flex-col items-center justify-center transition-all relative"
                  style={{
                    backgroundColor: isSelected
                      ? `${colors.accent}20`
                      : isToday
                      ? `${colors.primary}10`
                      : colors.bgCardElevated,
                    borderColor: isSelected
                      ? colors.accent
                      : isToday
                      ? colors.primary
                      : colors.borderSubtle,
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: isToday ? colors.primary : colors.textMain }}>
                    {dayNum}
                  </span>
                  {prayersRecorded > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: prayersRecorded }).map((_, dotIdx) => (
                        <span
                          key={dotIdx}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: colors.accent }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* عرض المؤشرات والإحصاءات */}
      {activeSubView === 'trends' && (
        <div className="space-y-4 font-sans">
          {/* بطاقة الهدف الشخصي */}
          <div
            className="rounded-2xl border p-4 shadow-xs"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award size={18} style={{ color: colors.accent }} />
                <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
                  الهدف الشخصي للمواظبة
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.consistencyGoalEnabled}
                  onChange={(e) => onUpdateSettings({ consistencyGoalEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1F3D2B]" />
              </label>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-3">
              تذكير شخصي لطيف لبناء عادة المحافظة على تسجيل الصلوات الخمس يومياً. لا توجد تصنيفات تنافسية أو مقارنات تسبب الحرج.
            </p>

            <div
              className="p-3 rounded-xl border flex items-center justify-between text-xs"
              style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
            >
              <span className="font-bold">المستهدف الذاتي:</span>
              <span className="font-bold text-sm" style={{ color: colors.primary }}>
                تسجيل الصلوات الخمس يومياً
              </span>
            </div>
          </div>

          {/* إحصاءات الـ 30 يوماً الأخيرة */}
          <div
            className="rounded-2xl border p-4 shadow-xs space-y-3"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} style={{ color: colors.accent }} />
                <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
                  إحصاءات آخر 30 يوماً
                </h3>
              </div>
              <span className="text-[11px] text-neutral-500">حساب الصلوات المسجلة فقط</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div
                className="p-3 rounded-xl border text-center"
                style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
              >
                <div className="text-[10px] text-neutral-500 font-bold uppercase">
                  نسبة الأداء في الوقت
                </div>
                <div className="text-2xl font-mono font-bold mt-1" style={{ color: colors.primary }}>
                  {monthStats.onTimePercentage}%
                </div>
                <div className="text-[10px] text-neutral-400">من إجمالي المسجلة</div>
              </div>

              <div
                className="p-3 rounded-xl border text-center"
                style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
              >
                <div className="text-[10px] text-neutral-500 font-bold uppercase">
                  نسبة إتمام الصلاة
                </div>
                <div className="text-2xl font-mono font-bold mt-1" style={{ color: colors.accent }}>
                  {monthStats.completionPercentage}%
                </div>
                <div className="text-[10px] text-neutral-400">المؤداة (وقتها + قضاء)</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-600">إجمالي الصلوات المسجلة:</span>
                <span className="font-bold">{monthStats.totalRecorded}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 text-emerald-800">
                <span>أُدّيت في وقتها:</span>
                <span className="font-bold">{monthStats.prayedOnTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 text-amber-800">
                <span>أُدّيت متأخرة (قضاء):</span>
                <span className="font-bold">{monthStats.prayedLater}</span>
              </div>
              <div className="flex justify-between py-1 text-rose-800">
                <span>صلوات سُجّلت كفائتة:</span>
                <span className="font-bold">{monthStats.notPerformed}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-neutral-700 flex items-start gap-2 leading-relaxed">
              <Info size={15} className="text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>المبدأ الشرعي الإرشادي:</strong> الصلوات أو الأيام غير المسجلة لا تُحسب كتقصير أو تفريط في الإحصاءات؛ النسب تعتمد بدقة وأمانة على ما سجّلته أنت بنفسك.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
