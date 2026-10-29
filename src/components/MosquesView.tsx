import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  MapPin,
  Navigation as NavigationIcon,
  RefreshCw,
  AlertTriangle,
  Info,
  ExternalLink,
  Building2,
} from 'lucide-react';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';
import { MosqueItem, fetchNearbyMosques } from '../services/mosquesService.ts';

interface MosquesViewProps {
  settings: AppSettings;
  colors: ThemeColors;
  onBack: () => void;
  onOpenLocationSettings: () => void;
}

export const MosquesView: React.FC<MosquesViewProps> = ({
  settings,
  colors,
  onBack,
  onOpenLocationSettings,
}) => {
  const [mosques, setMosques] = useState<MosqueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [selectedMosque, setSelectedMosque] = useState<MosqueItem | null>(null);

  const lat = settings.location.latitude;
  const lon = settings.location.longitude;
  const cityName = settings.location.arabicName || settings.location.cityName.split('(')[0].trim();

  const loadMosques = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await fetchNearbyMosques(lat, lon, 8000);
      setMosques(result.mosques);
      setIsCached(result.isFromCache);
      setIsOffline(result.isOfflineFallback);
      if (result.error) {
        setErrorMsg('تعذر الاتصال بخوادم OpenStreetMap حالياً، تم تحميل المساجد المرجعية الموثقة.');
      }
      if (result.mosques.length > 0) {
        setSelectedMosque(result.mosques[0]);
      }
    } catch {
      setErrorMsg('تعذر الاتصال بـ OpenStreetMap. أنت الآن في وضع عدم الاتصال.');
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMosques();
  }, [lat, lon]);

  const handleOpenExternalMaps = (mosque: MosqueItem) => {
    const destination = `${mosque.latitude},${mosque.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      destination
    )}&destination_place_id=${encodeURIComponent(mosque.arabicName || mosque.name)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* ترويسة الشاشة */}
      <div className="flex items-center justify-between pb-1 font-sans">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-transform active:scale-95"
          style={{
            borderColor: colors.borderSubtle,
            backgroundColor: colors.bgCard,
            color: colors.primary,
          }}
        >
          <ArrowRight size={14} />
          <span>الرئيسية</span>
        </button>

        <div className="text-left">
          <h2 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
            المساجد القريبة
          </h2>
          <span className="text-[10px] text-neutral-500 font-sans">
            قاعدة بيانات OpenStreetMap
          </span>
        </div>
      </div>

      {/* بطاقة نطاق البحث وتغيير المدينة */}
      <div
        className="rounded-2xl border p-3 flex items-center justify-between shadow-xs font-sans"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: colors.accent }} />
          <div>
            <div className="text-xs font-bold" style={{ color: colors.primary }}>
              {cityName}
            </div>
            <div className="text-[10px] text-neutral-500">
              نطاق البحث: شعاع 8 كيلومترات
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadMosques(true)}
            disabled={loading}
            className="p-2 rounded-xl border text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-50"
            style={{ borderColor: colors.borderSubtle }}
            title="تحديث قائمة المساجد"
            aria-label="تحديث قائمة المساجد"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onOpenLocationSettings}
            className="px-3 py-1.5 rounded-xl border text-[11px] font-bold"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCardElevated,
              color: colors.primary,
            }}
          >
            تغيير المدينة
          </button>
        </div>
      </div>

      {/* تنبيه شفافية البيانات */}
      <div
        className="p-3 rounded-2xl border text-xs font-sans flex items-start gap-2.5 leading-relaxed"
        style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
      >
        <Info size={16} className="text-neutral-500 shrink-0 mt-0.5" />
        <p className="text-neutral-600 text-[11px]">
          <strong>الشفافية والأمانة:</strong> تعرض هذه الشاشة البيانات الجغرافية الحقيقية المتوفرة في OpenStreetMap فقط دون تخمين أو اختلاق أي عناوين ناقصة. قد تختلف دقة البيانات حسب تحديثات الخرائط المفتوحة.
        </p>
      </div>

      {/* تنبيه وضع عدم الاتصال */}
      {isOffline && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div>
            <strong>وضع عدم الاتصال:</strong> يتعذر الوصول إلى الإنترنت حالياً. يتم عرض المساجد والمعالم المرجعية المحفوظة محلياً. عند توفر الاتصال اضغط على زر التحديث.
          </div>
        </div>
      )}

      {/* رادار المساجد البصري التفاعلي */}
      <div
        className="rounded-3xl border shadow-sm p-4 text-center relative overflow-hidden font-sans"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold" style={{ color: colors.primary }}>
            رادار التوزيع الجغرافي للمساجد
          </span>
          {isCached && (
            <span className="text-[10px] text-neutral-500">
              نتائج محفوظة مؤقتاً
            </span>
          )}
        </div>

        <div className="relative w-full h-44 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
          <div className="absolute w-36 h-36 rounded-full border border-neutral-700/60 pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full border border-neutral-700/40 pointer-events-none" />
          <div className="absolute w-12 h-12 rounded-full border border-neutral-700/30 pointer-events-none" />

          {/* موقع المستخدم */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
            <span className="text-[9px] text-blue-200 mt-1 font-bold">موقعك</span>
          </div>

          {/* نقاط المساجد */}
          {mosques.slice(0, 10).map((m, idx) => {
            const angle = (idx * (360 / Math.min(mosques.length, 10)) * Math.PI) / 180;
            const normalizedDist = Math.min(65, Math.max(22, m.distanceKm * 8));
            const x = Math.cos(angle) * normalizedDist;
            const y = Math.sin(angle) * normalizedDist;
            const isSelected = selectedMosque?.id === m.id;

            return (
              <button
                key={m.id}
                onClick={() => setSelectedMosque(m)}
                className="absolute z-20 transition-transform hover:scale-125 focus:outline-none"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                title={`${m.arabicName || m.name} (${m.distanceKm} كم)`}
                aria-label={`مسجد: ${m.arabicName || m.name}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md border ${
                    isSelected
                      ? 'bg-amber-400 border-white text-black scale-110 ring-2 ring-amber-300'
                      : 'bg-emerald-600 border-amber-300 text-white'
                  }`}
                >
                  🕌
                </div>
              </button>
            );
          })}
        </div>

        {/* المسجد المحدد */}
        {selectedMosque && (
          <div
            className="mt-3 p-3 rounded-2xl border text-right flex items-center justify-between"
            style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
          >
            <div>
              <div className="font-bold text-xs" style={{ color: colors.primary }}>
                {selectedMosque.arabicName || selectedMosque.name}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {selectedMosque.street || 'العنوان غير مدرج بدقة في الخريطة'} ·{' '}
                <strong dir="ltr">{selectedMosque.distanceKm} كم</strong>
              </div>
            </div>
            <button
              onClick={() => handleOpenExternalMaps(selectedMosque)}
              className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
              style={{ backgroundColor: colors.primary }}
            >
              <NavigationIcon size={12} />
              <span>الاتجاهات</span>
            </button>
          </div>
        )}
      </div>

      {/* قائمة المساجد المكتشفة */}
      <div className="space-y-2 font-sans">
        <h3 className="font-display-victorian font-bold text-sm px-1" style={{ color: colors.primary }}>
          قائمة المساجد ({mosques.length})
        </h3>

        {loading ? (
          <div className="text-center py-8 text-xs text-neutral-500 font-sans">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-neutral-400" />
            جارٍ الاتصال الآمن بخوادم OpenStreetMap للبحث عن المساجد...
          </div>
        ) : mosques.length > 0 ? (
          mosques.map((mosque) => (
            <div
              key={mosque.id}
              className="rounded-2xl border p-3.5 shadow-xs flex items-center justify-between transition-all"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: selectedMosque?.id === mosque.id ? colors.accent : colors.borderSubtle,
              }}
            >
              <div className="flex-1 pl-3">
                <div className="flex items-center gap-1.5">
                  <Building2 size={15} style={{ color: colors.accent }} />
                  <h4 className="font-bold text-xs" style={{ color: colors.primary }}>
                    {mosque.arabicName || mosque.name}
                  </h4>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  {mosque.street ? mosque.street : 'العنوان غير مدرج في بيانات الخريطة'}
                  {mosque.city ? `، ${mosque.city}` : ''}
                </div>
              </div>

              <div className="text-left shrink-0">
                <div className="font-mono text-xs font-bold" style={{ color: colors.accent }} dir="ltr">
                  {mosque.distanceKm} km
                </div>
                <button
                  onClick={() => handleOpenExternalMaps(mosque)}
                  className="mt-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-transform active:scale-95"
                  style={{
                    borderColor: colors.borderSubtle,
                    backgroundColor: colors.bgCardElevated,
                    color: colors.primary,
                  }}
                  title="فتح في تطبيق الخرائط"
                >
                  <ExternalLink size={10} />
                  <span>الخريطة</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-xs text-neutral-500 font-sans">
            لم يتم العثور على مساجد مسجلة في هذا النطاق، يمكنك اختيار مدينة مغربية أو عالمية أخرى.
          </div>
        )}
      </div>
    </div>
  );
};
