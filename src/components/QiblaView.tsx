import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass, AlertCircle, RefreshCw, MapPin, Sparkles } from 'lucide-react';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';
import {
  calculateQiblaBearing,
  calculateDistanceToKaaba,
  calculateNeedleAngle,
} from '../utils/qibla.ts';

interface QiblaViewProps {
  settings: AppSettings;
  colors: ThemeColors;
  onBack: () => void;
}

export const QiblaView: React.FC<QiblaViewProps> = ({ settings, colors, onBack }) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(false);
  const [sensorCalibrated, setSensorCalibrated] = useState<boolean>(true);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);

  const latitude = settings.location.latitude;
  const longitude = settings.location.longitude;

  const qiblaBearing = calculateQiblaBearing(latitude, longitude);
  const distanceKm = calculateDistanceToKaaba(latitude, longitude);

  useEffect(() => {
    let hasReceivedSensor = false;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading: number | null = null;

      if (typeof (event as any).webkitCompassHeading !== 'undefined') {
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        heading = (360 - event.alpha) % 360;
      }

      if (heading !== null) {
        hasReceivedSensor = true;
        setSensorAvailable(true);
        setDeviceHeading(Math.round(heading));

        if (event.absolute === false) {
          setSensorCalibrated(false);
        } else {
          setSensorCalibrated(true);
        }
      }
    };

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setNeedsPermission(true);
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    const timeout = setTimeout(() => {
      if (!hasReceivedSensor) {
        setSensorAvailable(false);
      }
    }, 1500);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const requestIosPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setNeedsPermission(false);
          window.addEventListener(
            'deviceorientation',
            (event: DeviceOrientationEvent) => {
              if (typeof (event as any).webkitCompassHeading !== 'undefined') {
                setDeviceHeading(Math.round((event as any).webkitCompassHeading));
                setSensorAvailable(true);
              }
            },
            true
          );
        }
      } catch (e) {
        console.warn('Compass permission rejected', e);
      }
    }
  };

  const needleAngle =
    sensorAvailable && deviceHeading !== null
      ? calculateNeedleAngle(deviceHeading, qiblaBearing)
      : qiblaBearing;

  const isFacingKaaba =
    sensorAvailable && deviceHeading !== null && Math.abs((needleAngle + 360) % 360) < 5;

  const cityName = settings.location.arabicName || settings.location.cityName.split('(')[0].trim();

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* شريط العنوان وزر الرجوع */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-sans font-bold px-3 py-1.5 rounded-xl border transition-transform active:scale-95"
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
            بوصلة القبلة المشرفة
          </h2>
          <span className="text-[10px] text-neutral-500 font-sans">
            الاتجاه الدقيق نحو الكعبة المكرمة
          </span>
        </div>
      </div>

      {/* قرص البوصلة الفيكتوري الرئيسي */}
      <div
        className="rounded-3xl border shadow-md p-6 text-center relative overflow-hidden flex flex-col items-center justify-center transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
        }}
      >
        <div
          className="absolute inset-4 rounded-full border pointer-events-none opacity-20"
          style={{ borderColor: colors.accent }}
        />

        {/* مؤشرات الزاوية والمسافة */}
        <div className="flex items-center justify-between w-full mb-4 px-2 font-sans">
          <div className="text-right">
            <span className="text-[11px] font-bold text-neutral-500">
              زاوية القبلة الفلكية
            </span>
            <div className="text-2xl font-mono font-bold mt-0.5" style={{ color: colors.primary }} dir="ltr">
              {Math.round(qiblaBearing)}°
            </div>
          </div>
          <div className="text-left">
            <span className="text-[11px] font-bold text-neutral-500">
              المسافة إلى مكة
            </span>
            <div className="text-sm font-mono font-bold mt-1" style={{ color: colors.accent }} dir="ltr">
              {distanceKm.toLocaleString()} كم
            </div>
          </div>
        </div>

        {/* قرص البوصلة */}
        <div className="relative w-64 h-64 my-3 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 shadow-inner transition-colors flex items-center justify-center"
            style={{
              backgroundColor: colors.bgCardElevated,
              borderColor: colors.accent,
            }}
          >
            {/* الجهات الأصلية بالحروف العربية */}
            <span className="absolute top-2.5 font-sans font-bold text-xs" style={{ color: colors.primary }}>
              ش (شمال)
            </span>
            <span className="absolute left-2.5 font-sans font-bold text-xs" style={{ color: colors.textMuted }}>
              ق (شرق)
            </span>
            <span className="absolute bottom-2.5 font-sans font-bold text-xs" style={{ color: colors.textMuted }}>
              ج (جنوب)
            </span>
            <span className="absolute right-2.5 font-sans font-bold text-xs" style={{ color: colors.textMuted }}>
              غ (غرب)
            </span>

            {/* علامات الدرجات المحيطية */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none"
                style={{
                  transform: `rotate(${deg}deg)`,
                }}
              >
                <div
                  className="w-[1px] h-2.5 mx-auto opacity-40"
                  style={{ backgroundColor: colors.accent }}
                />
              </div>
            ))}

            {/* الحلقة الداخلية للكعبة */}
            <div
              className="w-44 h-44 rounded-full border border-dashed flex items-center justify-center relative pointer-events-none"
              style={{ borderColor: `${colors.accent}60` }}
            >
              <div className="text-xs font-arabic-uthmani opacity-60 text-neutral-600">
                مَكَّةُ المُكَرَّمَة
              </div>
            </div>
          </div>

          {/* إبرة البوصلة الدوّارة */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
            style={{
              transform: `rotate(${needleAngle}deg)`,
            }}
          >
            <div className="relative w-8 h-48 flex flex-col items-center justify-between">
              {/* رأس الإبرة المتجه نحو القبلة */}
              <div className="flex flex-col items-center">
                <div
                  className="w-0 h-0 border-x-8 border-x-transparent border-b-[36px] drop-shadow-md"
                  style={{ borderBottomColor: '#B08D57' }}
                />
                <div
                  className="w-6 h-6 rounded-xs bg-[#1F3D2B] border border-[#B08D57] flex items-center justify-center shadow-xs -mt-1 text-[10px] text-amber-200 font-bold"
                  title="اتجاه الكعبة المشرفة"
                >
                  🕋
                </div>
              </div>

              {/* محور الارتكاز الأوسط */}
              <div
                className="w-6 h-6 rounded-full border-2 shadow-md z-10 flex items-center justify-center"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.accent,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              </div>

              {/* ذيل الإبرة الموازن */}
              <div
                className="w-0 h-0 border-x-6 border-x-transparent border-t-[28px] opacity-40"
                style={{ borderTopColor: colors.primary }}
              />
            </div>
          </div>
        </div>

        {/* إشعار مواجهة القبلة بدقة */}
        {isFacingKaaba && (
          <div
            className="mt-2 px-4 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-sans font-bold animate-pulse"
            style={{
              backgroundColor: '#1F3D2B15',
              borderColor: '#1F3D2B',
              color: '#1F3D2B',
            }}
          >
            <Sparkles size={14} />
            <span>أنت الآن في مواجهة القبلة الشريفة مباشرة</span>
          </div>
        )}

        {/* تشخيص المستشعر وحالة الهاتف */}
        <div
          className="mt-4 pt-3 border-t w-full flex items-center justify-between text-xs font-sans text-neutral-500"
          style={{ borderColor: colors.borderSubtle }}
        >
          <span>
            {sensorAvailable && deviceHeading !== null
              ? `اتجاه الهاتف: ${deviceHeading}°`
              : 'وضع الاتجاه الجغرافي الثابت'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} style={{ color: colors.accent }} />
            <span>{cityName}</span>
          </span>
        </div>
      </div>

      {/* تنبيه طلب الإذن لأجهزة iOS */}
      {needsPermission && (
        <div
          className="p-4 rounded-2xl border flex items-center justify-between text-xs font-sans"
          style={{ backgroundColor: `${colors.accent}15`, borderColor: colors.accent }}
        >
          <div>
            <strong>تفعيل حساس البوصلة:</strong> يتطلب نظام iOS إذناً صريحاً لقراءة اتجاه المستشعر.
          </div>
          <button
            onClick={requestIosPermission}
            className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs"
            style={{ backgroundColor: colors.primary }}
          >
            تفعيل
          </button>
        </div>
      )}

      {/* تنبيه النمط الثابت عند غياب الحساس */}
      {!sensorAvailable && (
        <div
          className="p-4 rounded-2xl border flex items-start gap-3 text-xs font-sans"
          style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
        >
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-neutral-800">الاتجاه الجغرافي الفلكي الثابت</h4>
            <p className="text-neutral-600 leading-relaxed">
              لم يتم اكتشاف مستشعر جيروسكوب مدمج في هذا المتصفح. تشير الإبرة إلى الاتجاه الصحيح فلكياً بزاوية <strong>{Math.round(qiblaBearing)}° شرق الجنوب الشرقي</strong> من مدينة {cityName} باتجاه مكة المكرمة.
            </p>
          </div>
        </div>
      )}

      {/* تنبيه المعايرة */}
      {sensorAvailable && !sensorCalibrated && (
        <div
          className="p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-sans text-amber-800 bg-amber-50 border-amber-200"
        >
          <RefreshCw size={16} className="shrink-0 animate-spin" />
          <div>
            <strong>معايرة البوصلة:</strong> يُرجى تحريك هاتفك في الهواء على شكل الرقم 8 بعيداً عن المعادن والمجالات المغناطيسية لضبط دقة الاتجاه.
          </div>
        </div>
      )}
    </div>
  );
};
