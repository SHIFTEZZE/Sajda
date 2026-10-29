import React, { useState } from 'react';
import { Compass, Check, ChevronLeft, ChevronRight, MapPin, Bell, Palette, Sparkles } from 'lucide-react';
import { AppSettings, AppTheme } from '../services/settingsStorage.ts';
import { CITIES_DATABASE, CityLocation } from '../data/moroccanCities.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { CALCULATION_METHODS_AR, ASR_MADHAB_AR } from '../utils/prayerTimes.ts';

interface OnboardingModalProps {
  settings: AppSettings;
  onComplete: (updatedSettings: Partial<AppSettings>) => void;
  colors: ThemeColors;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  settings,
  onComplete,
  colors,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Draft settings during onboarding
  const [theme, setTheme] = useState<AppTheme>(settings.theme);
  const [selectedCity, setSelectedCity] = useState<CityLocation>(
    CITIES_DATABASE.find((c) => c.name === settings.location.cityName) || CITIES_DATABASE[0]
  );
  const [searchCity, setSearchCity] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [method, setMethod] = useState(settings.calculation.method);
  const [asrMethod, setAsrMethod] = useState(settings.calculation.asrMethod);

  const [notificationChoice, setNotificationChoice] = useState<'enabled' | 'later'>('enabled');

  const filteredCities = CITIES_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCity.toLowerCase()) ||
      c.arabicName.includes(searchCity) ||
      c.country.toLowerCase().includes(searchCity.toLowerCase())
  );

  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsError('خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setSelectedCity({
          id: 'custom_gps',
          name: 'الموقع الحالي (GPS)',
          arabicName: 'الموقع الحالي عبر نظام GPS',
          country: 'المغرب',
          latitude: lat,
          longitude: lon,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Casablanca',
          isMorocco: true,
        });
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('تم رفض إذن تحديد الموقع. يُرجى اختيار مدينتك يدوياً من القائمة أدناه.');
        } else {
          setGpsError('تعذر تحديد الموقع الجغرافي. يُرجى اختيار المدينة يدوياً.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleFinish = () => {
    onComplete({
      theme,
      hasCompletedOnboarding: true,
      location: {
        cityName: selectedCity.name,
        arabicName: selectedCity.arabicName,
        country: selectedCity.country,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
        timezone: selectedCity.timezone,
        isGps: selectedCity.id === 'custom_gps',
      },
      calculation: {
        ...settings.calculation,
        method,
        asrMethod,
      },
    });

    if (notificationChoice === 'enabled' && 'Notification' in window) {
      try {
        Notification.requestPermission();
      } catch {
        // Safe fail
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none" dir="rtl">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          color: colors.textMain,
        }}
      >
        {/* شريط مؤشر الخطوات */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: step === s ? '24px' : '8px',
                  backgroundColor: step >= s ? colors.accent : `${colors.borderSubtle}`,
                }}
              />
            ))}
          </div>
          <span className="text-xs font-sans text-neutral-500">الخطوة {step} من 4</span>
        </div>

        {/* الخطوة 1: اختيار المظهر */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-5">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center border"
                style={{
                  backgroundColor: `${colors.accent}15`,
                  borderColor: colors.accent,
                  color: colors.accent,
                }}
              >
                <Palette size={22} />
              </div>
              <h2 className="text-xl font-display-victorian font-bold tracking-tight">
                مرحباً بك في رَوْضَة
              </h2>
              <p className="text-xs mt-1 text-neutral-600 font-sans">
                اختر مظهرك المفضل للعبادة اليومية. يمكنك تغيير ذلك لاحقاً في أي وقت من الإعدادات.
              </p>
            </div>

            <div className="space-y-3 my-auto">
              {/* خيار الأخضر الفيكتوري */}
              <button
                type="button"
                onClick={() => setTheme('victorian_green')}
                className="w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between active:scale-[0.99] min-h-[56px]"
                style={{
                  borderColor: theme === 'victorian_green' ? '#1F3D2B' : colors.borderSubtle,
                  backgroundColor: theme === 'victorian_green' ? '#1F3D2B0D' : colors.bgCardElevated,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1F3D2B] border border-[#B08D57] flex items-center justify-center shadow-xs">
                    <span className="w-3 h-3 rounded-full bg-[#B08D57]" />
                  </div>
                  <div>
                    <div className="font-sans font-bold text-sm text-[#1F3D2B]">
                      الأخضر الفيكتوري
                    </div>
                    <div className="text-[11px] text-neutral-500 font-sans">
                      أخضر ملكي عميق، نحاس عتيق وورق بردي دافئ
                    </div>
                  </div>
                </div>
                {theme === 'victorian_green' && <Check size={18} style={{ color: '#1F3D2B' }} />}
              </button>

              {/* خيار العنابي */}
              <button
                type="button"
                onClick={() => setTheme('burgundy')}
                className="w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between active:scale-[0.99] min-h-[56px]"
                style={{
                  borderColor: theme === 'burgundy' ? '#6B1E2E' : colors.borderSubtle,
                  backgroundColor: theme === 'burgundy' ? '#6B1E2E0D' : colors.bgCardElevated,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6B1E2E] border border-[#C9A24B] flex items-center justify-center shadow-xs">
                    <span className="w-3 h-3 rounded-full bg-[#C9A24B]" />
                  </div>
                  <div>
                    <div className="font-sans font-bold text-sm text-[#6B1E2E]">
                      العَنَّابِي المخملي
                    </div>
                    <div className="text-[11px] text-neutral-500 font-sans">
                      عنابي أندلسي فاخر، ذهب أثري وعاج دافئ
                    </div>
                  </div>
                </div>
                {theme === 'burgundy' && <Check size={18} style={{ color: '#6B1E2E' }} />}
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 py-3 rounded-xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
              style={{ backgroundColor: colors.primary }}
            >
              <span>متابعة</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

        {/* الخطوة 2: تحديد المدينة */}
        {step === 2 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="text-center mb-3">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center border"
                style={{
                  backgroundColor: `${colors.accent}15`,
                  borderColor: colors.accent,
                  color: colors.accent,
                }}
              >
                <MapPin size={20} />
              </div>
              <h2 className="text-lg font-display-victorian font-bold">تحديد مدينتك وموقعك</h2>
              <p className="text-xs text-neutral-600 font-sans">
                مطلوب محلياً لحساب زوايا الشمس ومواقيت الصلاة دون إرسال أي بيانات لخوادم خارجية.
              </p>
            </div>

            {/* شرح إذن الموقع وزر الـ GPS */}
            <div
              className="p-3 rounded-xl border mb-3 text-xs font-sans"
              style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
            >
              <p className="text-neutral-700 leading-relaxed mb-2">
                <strong>لماذا نحتاج الموقع:</strong> تعتمد مواقيت الصلاة واتجاه القبلة فلكياً على إحداثيات خطوط الطول والعرض لمدينتك. تبقى بياناتك محفوظة على جهازك فقط.
              </p>
              <button
                type="button"
                onClick={handleRequestGps}
                disabled={gpsLoading}
                className="w-full py-2 px-3 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                style={{
                  backgroundColor: colors.primary,
                  color: '#fff',
                  borderColor: colors.primary,
                }}
              >
                <Compass size={14} className={gpsLoading ? 'animate-spin' : ''} />
                <span>{gpsLoading ? 'جارٍ تحديد الموقع...' : 'استخدام الموقع الحالي (GPS)'}</span>
              </button>
              {gpsError && (
                <p className="text-[11px] text-amber-700 mt-1.5 font-medium">{gpsError}</p>
              )}
            </div>

            {/* حقل البحث في المدن */}
            <div className="mb-2">
              <input
                type="text"
                placeholder="ابحث عن مدينة مغربية أو عالمية..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1 text-right font-sans"
                style={{
                  borderColor: colors.borderSubtle,
                  backgroundColor: colors.bgCard,
                  color: colors.textMain,
                }}
              />
            </div>

            {/* قائمة المدن */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pl-1 max-h-48 border rounded-lg p-1.5">
              {filteredCities.map((city) => {
                const isSelected = selectedCity.name === city.name;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className="w-full text-right p-2 rounded-lg text-xs flex items-center justify-between transition-colors min-h-[40px] font-sans"
                    style={{
                      backgroundColor: isSelected ? `${colors.accent}20` : 'transparent',
                      color: isSelected ? colors.primary : colors.textMain,
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <div>
                      <span>{city.arabicName}</span>
                      <span className="text-[10px] text-neutral-500 mr-2">({city.country === 'Morocco' ? 'المغرب' : city.country})</span>
                    </div>
                    {isSelected && <Check size={14} style={{ color: colors.accent }} />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border font-sans text-xs font-semibold"
                style={{ borderColor: colors.borderSubtle, color: colors.textMuted }}
              >
                السابق
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-2 py-2.5 rounded-xl font-sans font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md"
                style={{ backgroundColor: colors.primary }}
              >
                <span>متابعة</span>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 3: طريقة الحساب والمذهب */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-4">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center border"
                style={{
                  backgroundColor: `${colors.accent}15`,
                  borderColor: colors.accent,
                  color: colors.accent,
                }}
              >
                <Compass size={20} />
              </div>
              <h2 className="text-lg font-display-victorian font-bold">طريقة حساب المواقيت</h2>
              <p className="text-xs text-neutral-600 font-sans">
                المعيار الافتراضي: توقيت وزارة الأوقاف والشؤون الإسلامية بالمملكة المغربية.
              </p>
            </div>

            <div className="space-y-3.5 my-auto">
              <div>
                <label className="block text-xs font-sans font-bold mb-1.5 text-right">
                  معيار الحساب المعتمد
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
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
                <p className="text-[10px] text-neutral-500 mt-1 font-sans">
                  مواقيت المغرب مطابقة للجدول الرسمي لوزارة الأوقاف والشؤون الإسلامية (habous.gov.ma).
                </p>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold mb-1.5 text-right">
                  مذهب حساب صلاة العصر (طول الظل)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAsrMethod('Standard')}
                    className="p-3 rounded-xl border text-right transition-all text-xs font-sans"
                    style={{
                      borderColor: asrMethod === 'Standard' ? colors.primary : colors.borderSubtle,
                      backgroundColor: asrMethod === 'Standard' ? `${colors.accent}18` : colors.bgCardElevated,
                    }}
                  >
                    <div className="font-bold">المعيار القياسي</div>
                    <div className="text-[10px] text-neutral-500">المالكي، الشافعي، الحنبلي (ظل الشيء مثله)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAsrMethod('Hanafi')}
                    className="p-3 rounded-xl border text-right transition-all text-xs font-sans"
                    style={{
                      borderColor: asrMethod === 'Hanafi' ? colors.primary : colors.borderSubtle,
                      backgroundColor: asrMethod === 'Hanafi' ? `${colors.accent}18` : colors.bgCardElevated,
                    }}
                  >
                    <div className="font-bold">المذهب الحنفي</div>
                    <div className="text-[10px] text-neutral-500">طول ظل الشيء مثليه</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-xl border font-sans text-xs font-semibold"
                style={{ borderColor: colors.borderSubtle, color: colors.textMuted }}
              >
                السابق
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-2 py-2.5 rounded-xl font-sans font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md"
                style={{ backgroundColor: colors.primary }}
              >
                <span>متابعة</span>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 4: التنبيهات والأذان */}
        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-4">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center border"
                style={{
                  backgroundColor: `${colors.accent}15`,
                  borderColor: colors.accent,
                  color: colors.accent,
                }}
              >
                <Bell size={20} />
              </div>
              <h2 className="text-lg font-display-victorian font-bold">تنبيهات وأذان الصلاة</h2>
              <p className="text-xs text-neutral-600 font-sans">
                استقبل نداء الأذان ورنات التنبيه الهادئة عند دخول أوقات الصلاة.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border mb-4 space-y-2 text-xs font-sans"
              style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
            >
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-neutral-700 leading-relaxed">
                  يُمكّنك التطبيق من التنبيه بصوت الأذان أو بنغمة فيكتورية هادئة عند حلول موعد كل صلاة. ويمكنك تعديل النمط لكل صلاة على حدة (أذان كامل، رنة قصيرة، إشعار صامت، تذكير مسبق، أو إيقاف) من شاشة الإعدادات.
                </p>
              </div>
              <p className="text-[10px] text-neutral-500 italic">
                * ملاحظة: دقة التنبيه في الوقت تعتمد على إعدادات توفير شحن البطارية في أجهزة أندرويد، ويتوفر دليل مخصص للإعدادات داخل التطبيق.
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => setNotificationChoice('enabled')}
                className="w-full p-3 rounded-xl border flex items-center justify-between text-right text-xs transition-colors font-sans"
                style={{
                  borderColor: notificationChoice === 'enabled' ? colors.primary : colors.borderSubtle,
                  backgroundColor: notificationChoice === 'enabled' ? `${colors.accent}18` : colors.bgCardElevated,
                }}
              >
                <div>
                  <div className="font-bold">تفعيل تنبيهات الصلاة</div>
                  <div className="text-[11px] text-neutral-500">السماح بتنبيهات الأذان ومواقيت الصلوات</div>
                </div>
                {notificationChoice === 'enabled' && <Check size={16} style={{ color: colors.primary }} />}
              </button>

              <button
                type="button"
                onClick={() => setNotificationChoice('later')}
                className="w-full p-3 rounded-xl border flex items-center justify-between text-right text-xs transition-colors font-sans"
                style={{
                  borderColor: notificationChoice === 'later' ? colors.primary : colors.borderSubtle,
                  backgroundColor: notificationChoice === 'later' ? `${colors.accent}18` : colors.bgCardElevated,
                }}
              >
                <div>
                  <div className="font-bold">الضبط لاحقاً</div>
                  <div className="text-[11px] text-neutral-500">إبقاء التنبيهات صامتة في الوقت الحالي</div>
                </div>
                {notificationChoice === 'later' && <Check size={16} style={{ color: colors.primary }} />}
              </button>
            </div>

            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-xl border font-sans text-xs font-semibold"
                style={{ borderColor: colors.borderSubtle, color: colors.textMuted }}
              >
                السابق
              </button>
              <button
                onClick={handleFinish}
                className="flex-2 py-2.5 rounded-xl font-sans font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md"
                style={{ backgroundColor: colors.primary }}
              >
                <span>الدخول إلى التطبيق</span>
                <Check size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
