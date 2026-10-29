import React, { useState } from 'react';
import {
  Palette,
  MapPin,
  Compass,
  Bell,
  Shield,
  Download,
  Upload,
  Volume2,
  VolumeX,
  HelpCircle,
  Check,
  ChevronLeft,
  Sliders,
  Calendar,
  BookOpen,
  Trash2,
  Play,
  Square,
} from 'lucide-react';
import { AppSettings, NotificationMode } from '../services/settingsStorage.ts';
import { CITIES_DATABASE } from '../data/moroccanCities.ts';
import { exportBackupData, importBackupData } from '../services/trackerStorage.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { audioAdhan } from '../services/audioAdhan.ts';
import { TRACKED_PRAYERS } from '../utils/trackerLogic.ts';
import { ARABIC_PRAYER_NAMES } from '../utils/prayerTimes.ts';
import { isMushafDownloaded, clearMushafCache, setMushafDownloaded } from '../services/mushafStorage.ts';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
  colors: ThemeColors;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  colors,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showReliabilityGuide, setShowReliabilityGuide] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAdjustmentsModal, setShowAdjustmentsModal] = useState(false);

  const [citySearch, setCitySearch] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportBackup = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rawdah_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importBackupData(content);
      if (success) {
        setImportStatus('تمت استعادة النسخة الاحتياطية بنجاح! جارٍ التحديث...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('ملف النسخة الاحتياطية غير صالح، تعذرت الاستعادة.');
      }
    };
    reader.readAsText(file);
  };

  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [mushafDownloaded, setMushafDownloadedState] = useState(isMushafDownloaded());

  const handleTestAudio = (mode: NotificationMode, isFajr = false) => {
    if (audioAdhan.getIsPlaying()) {
      audioAdhan.stop();
      setIsPlayingAdhan(false);
      return;
    }

    if (mode === 'full_adhan') {
      setIsPlayingAdhan(true);
      audioAdhan.playAdhanPreview(() => setIsPlayingAdhan(false), isFajr);
    } else if (mode === 'short_tone') {
      audioAdhan.playNotificationChime();
    }
  };

  const handleToggleMushafDownload = () => {
    if (mushafDownloaded) {
      if (confirm('هل تريد حذف صفحات مصحف المدينة لتوفير المساحة على جهازك؟')) {
        clearMushafCache();
        setMushafDownloadedState(false);
      }
    } else {
      setMushafDownloaded(true);
      setMushafDownloadedState(true);
      alert('تم تجهيز وتفعيل مصحف المدينة النبوية المصوَّر بنجاح!');
    }
  };

  const filteredCities = CITIES_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.arabicName.includes(citySearch) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const cityName = settings.location.arabicName || settings.location.cityName.split('(')[0].trim();

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none font-sans" dir="rtl">
      {/* رأس الصفحة */}
      <div className="pb-1">
        <h2 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
          الإعدادات والخصوصية
        </h2>
        <p className="text-xs text-neutral-500">
          تخصيص المظهر، مواقيت الصلاة، تنبيهات الأذان، وإدارة بياناتك المحلية
        </p>
      </div>

      {/* المظهر والهوية البصرية */}
      <div
        className="rounded-2xl border p-4 shadow-xs space-y-3"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center gap-2">
          <Palette size={16} style={{ color: colors.accent }} />
          <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
            المظهر والألوان
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* الأخضر الفيكتوري */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ theme: 'victorian_green' })}
            className="p-3 rounded-xl border text-right flex items-center justify-between transition-all"
            style={{
              borderColor: settings.theme === 'victorian_green' ? '#1F3D2B' : colors.borderSubtle,
              backgroundColor: settings.theme === 'victorian_green' ? '#1F3D2B12' : colors.bgCardElevated,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#1F3D2B] border border-[#B08D57]" />
              <span className="text-xs font-bold text-[#1F3D2B]">الأخضر الفيكتوري</span>
            </div>
            {settings.theme === 'victorian_green' && <Check size={14} style={{ color: '#1F3D2B' }} />}
          </button>

          {/* العنابي */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ theme: 'burgundy' })}
            className="p-3 rounded-xl border text-right flex items-center justify-between transition-all"
            style={{
              borderColor: settings.theme === 'burgundy' ? '#6B1E2E' : colors.borderSubtle,
              backgroundColor: settings.theme === 'burgundy' ? '#6B1E2E12' : colors.bgCardElevated,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#6B1E2E] border border-[#C9A24B]" />
              <span className="text-xs font-bold text-[#6B1E2E]">العَنَّابِي الملكي</span>
            </div>
            {settings.theme === 'burgundy' && <Check size={14} style={{ color: '#6B1E2E' }} />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
          <span>الوضع الليلي الداكن</span>
          <button
            type="button"
            onClick={() => onUpdateSettings({ isDarkMode: !settings.isDarkMode })}
            className="px-3 py-1 rounded-xl border font-bold text-xs transition-colors"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: settings.isDarkMode ? colors.primary : colors.bgCardElevated,
              color: settings.isDarkMode ? '#FFF' : colors.textMain,
            }}
          >
            {settings.isDarkMode ? 'مُفعّل' : 'مُعطّل'}
          </button>
        </div>
      </div>

      {/* إعدادات الموقع الجغرافي */}
      <div
        className="rounded-2xl border p-4 shadow-xs space-y-3"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: colors.accent }} />
            <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              المدينة المعتمدة
            </h3>
          </div>
          <button
            onClick={() => setShowLocationPicker(true)}
            className="text-xs font-bold text-amber-800 flex items-center gap-0.5"
            style={{ color: colors.accent }}
          >
            <span>تغيير المدينة</span>
            <ChevronLeft size={14} />
          </button>
        </div>

        <div
          className="p-3 rounded-xl border flex items-center justify-between text-xs"
          style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
        >
          <div>
            <div className="font-bold text-sm" style={{ color: colors.primary }}>
              {cityName}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5" dir="ltr">
              {settings.location.latitude.toFixed(4)}° N, {settings.location.longitude.toFixed(4)}° E
            </div>
          </div>
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
            style={{ borderColor: colors.borderSubtle }}
          >
            {settings.location.isGps ? 'تحديد GPS' : 'قائمة مسبقة'}
          </span>
        </div>
      </div>

      {/* معيار وطريقة حساب أوقات الصلاة */}
      <div
        className="rounded-2xl border p-4 shadow-xs space-y-3"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={16} style={{ color: colors.accent }} />
            <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              طريقة حساب المواقيت
            </h3>
          </div>
          <button
            onClick={() => setShowAdjustmentsModal(true)}
            className="text-xs font-bold text-amber-800 flex items-center gap-1"
            style={{ color: colors.accent }}
          >
            <span>تعديل الدقائق</span>
            <Sliders size={13} />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block text-neutral-600 mb-1 font-semibold">المعيار الفلكي</label>
            <select
              value={settings.calculation.method}
              onChange={(e) =>
                onUpdateSettings({
                  calculation: {
                    ...settings.calculation,
                    method: e.target.value as any,
                  },
                })
              }
              className="w-full p-2.5 rounded-xl border text-xs bg-white outline-none font-sans text-right"
              style={{
                borderColor: colors.borderSubtle,
                backgroundColor: colors.bgCardElevated,
                color: colors.textMain,
              }}
            >
              <option value="Morocco">المغرب (وزارة الأوقاف والشؤون الإسلامية - الفجر 19°، العشاء 17°)</option>
              <option value="MWL">رابطة العالم الإسلامي (الفجر 18°، العشاء 17°)</option>
              <option value="Egypt">الهيئة العامة المصرية للمساحة (الفجر 19.5°، العشاء 17.5°)</option>
              <option value="Makkah">جامعة أم القرى، مكة المكرمة</option>
              <option value="ISNA">الجمعية الإسلامية لأمريكا الشمالية (ISNA)</option>
              <option value="Dubai">دائرة الشؤون الإسلامية بدبي</option>
              <option value="Kuwait">وزارة الأوقاف الكويتية</option>
              <option value="Qatar">وزارة الأوقاف القطرية</option>
              <option value="Karachi">جامعة العلوم الإسلامية بكراتشي</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-neutral-600 mb-1 font-semibold">مذهب صلاة العصر</label>
              <select
                value={settings.calculation.asrMethod}
                onChange={(e) =>
                  onUpdateSettings({
                    calculation: {
                      ...settings.calculation,
                      asrMethod: e.target.value as any,
                    },
                  })
                }
                className="w-full p-2 rounded-xl border text-xs bg-white outline-none font-sans text-right"
                style={{
                  borderColor: colors.borderSubtle,
                  backgroundColor: colors.bgCardElevated,
                  color: colors.textMain,
                }}
              >
                <option value="Standard">الجمهور (المالكي والشافعي)</option>
                <option value="Hanafi">المذهب الحنفي</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 mb-1 font-semibold">المناطق القطبية</label>
              <select
                value={settings.calculation.highLatitudeRule}
                onChange={(e) =>
                  onUpdateSettings({
                    calculation: {
                      ...settings.calculation,
                      highLatitudeRule: e.target.value as any,
                    },
                  })
                }
                className="w-full p-2 rounded-xl border text-xs bg-white outline-none font-sans text-right"
                style={{
                  borderColor: colors.borderSubtle,
                  backgroundColor: colors.bgCardElevated,
                  color: colors.textMain,
                }}
              >
                <option value="MiddleOfTheNight">منتصف الليل</option>
                <option value="SeventhOfTheNight">سُبع الليل</option>
                <option value="TwilightAngle">زاوية الشفق</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* تعديل التقويم الهجري ورؤية الهلال */}
      <div
        className="rounded-2xl border p-4 shadow-xs space-y-2.5"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: colors.accent }} />
          <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
            ضبط التقويم الهجري (رؤية الهلال بالمغرب)
          </h3>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          نظراً لاتباع المغرب إثبات رؤية الهلال رسمياً بالعين المجردة، قد يختلف التاريخ الفلكي بمقدار يوم، يمكنك موازنته هنا:
        </p>

        <div className="flex items-center gap-2">
          {([-1, 0, 1] as const).map((shift) => (
            <button
              key={shift}
              type="button"
              onClick={() => onUpdateSettings({ hijriShift: shift })}
              className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                settings.hijriShift === shift ? 'shadow-xs' : 'text-neutral-500'
              }`}
              style={{
                borderColor: settings.hijriShift === shift ? colors.primary : colors.borderSubtle,
                backgroundColor: settings.hijriShift === shift ? `${colors.accent}18` : colors.bgCardElevated,
                color: settings.hijriShift === shift ? colors.primary : undefined,
              }}
            >
              {shift === 0 ? 'تطابق تام (0)' : shift > 0 ? `تقديم (+${shift} يوم)` : `تأخير (${shift} يوم)`}
            </button>
          ))}
        </div>
      </div>

      {/* تنبيهات وأذان الصلوات الخمس */}
      <div
        className="rounded-2xl border p-4 shadow-xs space-y-3"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: colors.accent }} />
            <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              تنبيهات وأذان كل صلاة
            </h3>
          </div>
          <button
            onClick={() => setShowReliabilityGuide(true)}
            className="text-xs font-bold flex items-center gap-1"
            style={{ color: colors.accent }}
          >
            <HelpCircle size={13} />
            <span>دليل ثبات الأذان</span>
          </button>
        </div>

        {/* شريط تشغيل وتجربة الأذان المعتمد */}
        <div
          className="p-3 rounded-xl border flex items-center justify-between"
          style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.accent }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.accent,
                color: colors.accent,
              }}
            >
              <Volume2 size={16} />
            </div>
            <div>
              <div className="font-sans font-bold text-xs" style={{ color: colors.primary }}>
                أذان الحرم المدني الشريف (صوت مسجل)
              </div>
              <div className="text-[10px] text-neutral-500 font-sans">
                يعمل في أوقات الصلاة المحددة بكامل نبرته العذبة
              </div>
            </div>
          </div>

          <button
            onClick={() => handleTestAudio('full_adhan')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-bold text-white shadow-xs transition-transform active:scale-95"
            style={{
              backgroundColor: isPlayingAdhan ? '#A83232' : colors.primary,
            }}
          >
            {isPlayingAdhan ? (
              <>
                <Square size={12} />
                <span>إيقاف الأذان</span>
              </>
            ) : (
              <>
                <Play size={12} />
                <span>سماع الأذان</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          {TRACKED_PRAYERS.map((prayer) => {
            const currentMode = settings.notifications[prayer];
            const prayerAr = ARABIC_PRAYER_NAMES[prayer];

            return (
              <div
                key={prayer}
                className="flex items-center justify-between p-2.5 rounded-xl border text-xs"
                style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-800 font-sans">{prayerAr}</span>
                  <button
                    onClick={() => handleTestAudio(currentMode, prayer === 'Fajr')}
                    className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                    title="تجربة الصوت"
                  >
                    <Volume2 size={13} />
                  </button>
                </div>

                <select
                  value={currentMode}
                  onChange={(e) =>
                    onUpdateSettings({
                      notifications: {
                        ...settings.notifications,
                        [prayer]: e.target.value as NotificationMode,
                      },
                    })
                  }
                  className="p-1.5 rounded-lg border text-xs bg-white outline-none font-sans text-right"
                  style={{
                    borderColor: colors.borderSubtle,
                    color: colors.textMain,
                  }}
                >
                  <option value="full_adhan">الأذان كاملاً</option>
                  <option value="short_tone">رنة تنبيه قصيرة</option>
                  <option value="silent">إشعار صامت</option>
                  <option value="reminder_only">تذكير مسبق (قبل 10 دقائق)</option>
                  <option value="off">إيقاف التنبيه</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* إدارة بيانات مصحف المدينة المصوَّر */}
      <div
        className="rounded-2xl border p-4 shadow-xs space-y-3"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: colors.accent }} />
            <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              مصحف المدينة النبوية (النسخة المصوَّرة)
            </h3>
          </div>
          <span
            className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: mushafDownloaded ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: mushafDownloaded ? '#15803d' : '#854d0e',
            }}
          >
            {mushafDownloaded ? 'مثبتة محلياً' : 'غير مثبتة'}
          </span>
        </div>

        <p className="text-xs text-neutral-600 font-sans leading-relaxed">
          نسخة كاملة من ٦٠٤ صفحات مطابقة لمصحف مجمع الملك فهد بالمدينة المنورة. عند التثبيت، تُحفظ الصفحات محلياً للعمل دون اتصال بالإنترنت ١٠٠٪.
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] font-sans text-neutral-500">
            حجم الحزمة: ٤٨ ميغابايت تقريباً
          </div>
          <button
            onClick={handleToggleMushafDownload}
            className="px-3 py-1.5 rounded-xl border text-xs font-sans font-bold transition-all active:scale-95 flex items-center gap-1.5"
            style={{
              borderColor: mushafDownloaded ? '#ef4444' : colors.accent,
              color: mushafDownloaded ? '#dc2626' : colors.primary,
              backgroundColor: colors.bgCardElevated,
            }}
          >
            {mushafDownloaded ? (
              <>
                <Trash2 size={13} />
                <span>حذف لتوفير المساحة</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>تحميل وتثبيت المصحف</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* النسخ الاحتياطي المحلي واستيراد البيانات */}
      <div
        className="rounded-2xl border p-4 shadow-xs space-y-3"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center gap-2">
          <Download size={16} style={{ color: colors.accent }} />
          <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
            النسخ الاحتياطي المحلي واستعادة البيانات
          </h3>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          تصدير أو استيراد سجلك الكامل من الصلوات والعلامات المرجعية كملف JSON خاص محفوظ على جهازك.
        </p>

        {importStatus && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {importStatus}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleExportBackup}
            className="flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-xs"
            style={{
              borderColor: colors.primary,
              backgroundColor: colors.primary,
              color: '#FFF',
            }}
          >
            <Download size={14} />
            <span>تصدير نسخة احتياطية</span>
          </button>

          <label
            className="flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs text-center"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCardElevated,
              color: colors.primary,
            }}
          >
            <Upload size={14} />
            <span>استيراد نسخة</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* زر ميثاق الخصوصية التامة */}
      <div
        className="rounded-2xl border p-4 shadow-xs flex items-center justify-between"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center gap-2.5">
          <Shield size={18} style={{ color: colors.accent }} />
          <div>
            <h4 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
              ميثاق الخصوصية التامة
            </h4>
            <span className="text-[11px] text-neutral-500">
              بدون إنترنت 100% · لا توجد خوادم ولا تتبع
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-transform active:scale-95"
          style={{
            borderColor: colors.borderSubtle,
            backgroundColor: colors.bgCardElevated,
            color: colors.primary,
          }}
        >
          عرض الميثاق
        </button>
      </div>

      {/* نافذة ميثاق الخصوصية */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Shield size={20} style={{ color: colors.accent }} />
              <h3 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
                ميثاق الخصوصية وشفافية البيانات
              </h3>
            </div>

            <div className="space-y-3 text-xs text-neutral-700 leading-relaxed font-sans">
              <p>
                <strong>1. انعدام جمع البيانات:</strong> تطبيق سجدة لا يملك أي خوادم خلفية، ولا يحتوي على أي أكواد إعلانية أو أدوات تتبع تحليلي، ولا يتطلب إنشاء أي حسابات. عباداتك وأذكارك وملاحظاتك تظل ملكك وحدك.
              </p>
              <p>
                <strong>2. الحفظ المحلي التام:</strong> تُحفظ جميع الإعدادات والعلامات المرجعية وسجل صلواتك مباشرة على ذاكرة هاتفك الخاصة، ولا تغادر جهازك إطلاقاً.
              </p>
              <p>
                <strong>3. الأذونات المستعملة:</strong>
              </p>
              <ul className="list-disc pr-5 space-y-1">
                <li><strong>الموقع الجغرافي:</strong> يُستعمل فلكياً داخل هاتفك لحساب مواقيت الصلاة واتجاه القبلة، ويمكنك رفضه واختيار مدينتك يدوياً في أي وقت.</li>
                <li><strong>التنبيهات:</strong> تُستعمل فقط لتنبيهك بدخول وقت الصلاة وسماع الأذان.</li>
                <li><strong>الإنترنت:</strong> يُستعمل فقط عند فتحك لشاشة المساجد القريبة للاتصال بخريطة OpenStreetMap العامة.</li>
              </ul>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md font-sans"
              style={{ backgroundColor: colors.primary }}
            >
              إغلاق الميثاق
            </button>
          </div>
        </div>
      )}

      {/* نافذة دليل ثبات الأذان وإعدادات البطارية */}
      {showReliabilityGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <HelpCircle size={20} style={{ color: colors.accent }} />
              <h3 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
                دليل ثبات الأذان في أندرويد
              </h3>
            </div>

            <div className="space-y-3 text-xs text-neutral-700 leading-relaxed font-sans">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <strong>الشفافية حول قيود النظام:</strong> تقوم شركات الهواتف الذكية (مثل شاومي، سامسونج، هواوي، أوبو) بإيقاف التطبيقات في الخلفية بقسوة لتوفير طاقة البطارية، وهو ما قد يؤخر إطلاق الأذان إذا لم تُضبط الإعدادات.
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-neutral-900">تعليمات بحسب نوع جهازك:</h4>

                <div className="p-2.5 rounded-xl border bg-neutral-50/60 space-y-1">
                  <strong className="block text-neutral-800">شاومي وريدمي (MIUI / HyperOS):</strong>
                  الإعدادات ← التطبيقات ← إدارة التطبيقات ← سجدة ← فعّل <em>التشغيل التلقائي</em>. وفي توفير البطارية اختر <em>بلا قيود</em>.
                </div>

                <div className="p-2.5 rounded-xl border bg-neutral-50/60 space-y-1">
                  <strong className="block text-neutral-800">سامسونج (One UI):</strong>
                  الإعدادات ← التطبيقات ← سجدة ← البطارية ← اختر <em>غير مقيد</em>. وتأكد من إزالته من قائمة "التطبيقات في وضع السكون".
                </div>

                <div className="p-2.5 rounded-xl border bg-neutral-50/60 space-y-1">
                  <strong className="block text-neutral-800">هواوي (EMUI / HarmonyOS):</strong>
                  الإعدادات ← البطارية ← تشغيل التطبيقات ← ابحث عن سجدة ← حوّل إلى <em>إدارة يدوية</em> وفعّل التشغيل في الخلفية.
                </div>

                <div className="p-2.5 rounded-xl border bg-neutral-50/60 space-y-1">
                  <strong className="block text-neutral-800">أوبو وريلمي (ColorOS):</strong>
                  معلومات التطبيق ← استهلاك البطارية ← اسمح بالنشاط في الخلفية والتشغيل التلقائي.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowReliabilityGuide(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md font-sans"
              style={{ backgroundColor: colors.primary }}
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}

      {/* نافذة اختيار المدينة يدوياً */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div
            className="w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-3 max-h-[85vh] flex flex-col font-sans"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
          >
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
                اختر مدينة مغربية أو عالمية
              </h3>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="text-xs text-neutral-400 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="ابحث عن المدينة..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="w-full p-2.5 rounded-xl border text-xs outline-none focus:ring-1 text-right font-sans"
              style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
            />

            <div className="flex-1 overflow-y-auto space-y-1 max-h-60 pl-1">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    onUpdateSettings({
                      location: {
                        cityName: city.name,
                        arabicName: city.arabicName,
                        country: city.country,
                        latitude: city.latitude,
                        longitude: city.longitude,
                        timezone: city.timezone,
                        isGps: false,
                      },
                    });
                    setShowLocationPicker(false);
                  }}
                  className="w-full p-2.5 rounded-xl text-right text-xs flex items-center justify-between hover:bg-black/5 transition-colors font-sans"
                  style={{
                    backgroundColor: settings.location.cityName === city.name ? `${colors.accent}20` : 'transparent',
                    color: settings.location.cityName === city.name ? colors.primary : colors.textMain,
                  }}
                >
                  <div>
                    <span className="font-bold">{city.arabicName}</span>
                    <span className="text-[10px] text-neutral-500 mr-2">
                      ({city.country === 'Morocco' ? 'المغرب' : city.country})
                    </span>
                  </div>
                  {settings.location.cityName === city.name && (
                    <Check size={14} style={{ color: colors.accent }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل دقائق الصلوات يدوياً */}
      {showAdjustmentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-3 font-sans"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
          >
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
                تعديل الدقائق يدوياً لكل صلاة
              </h3>
              <button
                onClick={() => setShowAdjustmentsModal(false)}
                className="text-xs text-neutral-400 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-neutral-600 leading-relaxed">
              يمكنك زيادة أو إنقاص دقائق محددة لمطابقة جدول المسجد في حيك بدقة (-30 إلى +30 دقيقة).
            </p>

            <div className="space-y-2">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((p) => {
                const val = settings.calculation.adjustments[p] || 0;
                const pMap: Record<string, string> = {
                  fajr: 'الفجر',
                  dhuhr: 'الظهر',
                  asr: 'العصر',
                  maghrib: 'المغرب',
                  isha: 'العشاء',
                };

                return (
                  <div key={p} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800">
                      صلاة {pMap[p]}
                    </span>
                    <div className="flex items-center gap-2" dir="ltr">
                      <button
                        onClick={() =>
                          onUpdateSettings({
                            calculation: {
                              ...settings.calculation,
                              adjustments: {
                                ...settings.calculation.adjustments,
                                [p]: val - 1,
                              },
                            },
                          })
                        }
                        className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono w-10 text-center font-bold">{val > 0 ? `+${val}` : val} د</span>
                      <button
                        onClick={() =>
                          onUpdateSettings({
                            calculation: {
                              ...settings.calculation,
                              adjustments: {
                                ...settings.calculation.adjustments,
                                [p]: val + 1,
                              },
                            },
                          })
                        }
                        className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowAdjustmentsModal(false)}
              className="w-full mt-3 py-2 rounded-xl text-white font-bold text-xs"
              style={{ backgroundColor: colors.primary }}
            >
              تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
