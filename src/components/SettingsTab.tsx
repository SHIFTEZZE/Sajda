/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  HelpCircle,
  Check,
  ChevronLeft,
  Sliders,
  Calendar,
  BookOpen,
  Trash2,
  Play,
  Square,
  Heart,
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
  const [showMarriagePrayerModal, setShowMarriagePrayerModal] = useState(false);

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

      {/* نافذة اختيار المدينة يدوياً ومعها طلب الدعاء الخاص */}
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
                    setShowMarriagePrayerModal(true); // Pop up special prayer request after location is set
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

      {/* نافذة طلب الدعاء بالزواج من التي يحبها (تظهر بعد ضبط الموقع) */}
      {showMarriagePrayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 text-center animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.accent }}
          >
            <div
              className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border"
              style={{
                backgroundColor: `${colors.accent}20`,
                borderColor: colors.accent,
                color: colors.accent,
              }}
            >
              <Heart size={24} className="fill-current text-rose-600" />
            </div>

            <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
              طلب دعاء بظهر الغيب 🤲
            </h3>

            <p className="text-xs text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed">
              لا تنسونا من خالص دعائكم، أن يجمعني الله وإيّاها في الحلال في أقرب وقت، وأن يُيسّر لنا ما استعصى علينا، ويُذلّل لنا الصعاب، ويجمع بيننا على خيرٍ ومودّةٍ ورحمة. 🤍
            </p>

            <button
              onClick={() => setShowMarriagePrayerModal(false)}
              className="w-full py-3 rounded-2xl text-xs font-bold font-sans text-white shadow-md transition-transform active:scale-95"
              style={{ backgroundColor: colors.primary }}
            >
              آمين يا رب العالمين، تقبل الله دعاءكم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
