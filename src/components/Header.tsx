import React from 'react';
import { MapPin, Moon, Sun } from 'lucide-react';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';

interface HeaderProps {
  settings: AppSettings;
  onToggleDarkMode: () => void;
  onOpenLocation: () => void;
  colors: ThemeColors;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onToggleDarkMode,
  onOpenLocation,
  colors,
}) => {
  // Extract Arabic city name or clean display
  const cityName = settings.location.arabicName || settings.location.cityName.split('(')[0].trim();

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md px-4 py-3 select-none transition-colors"
      style={{
        backgroundColor: `${colors.bgCard}EE`,
        borderColor: colors.borderSubtle,
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* عنوان التطبيق بالهوية الفيكتورية الأصيلة */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs"
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.accent,
              color: colors.accent,
            }}
          >
            <span className="font-arabic-uthmani text-base font-bold leading-none" style={{ color: colors.accent }}>
              سَجْدَة
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1
                className="font-display-victorian text-lg font-bold tracking-tight leading-tight"
                style={{ color: colors.primary }}
              >
                سَجْدَة
              </h1>
              <span
                className="text-[10px] font-sans font-semibold tracking-wide px-1.5 py-0.5 rounded border"
                style={{
                  color: colors.accent,
                  borderColor: `${colors.accent}40`,
                  backgroundColor: `${colors.accent}12`,
                }}
              >
                الرفيق المسلم
              </span>
            </div>
            <p className="text-[10px] tracking-tight text-neutral-500 font-sans">
              عبادة · خصوصية تامة · أصالة
            </p>
          </div>
        </div>

        {/* أزرار الإجراءات: اختيار المدينة والوضع الليلي */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 max-w-[150px] truncate"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCardElevated,
              color: colors.textMain,
            }}
            title="تغيير المدينة"
            aria-label={`الموقع: ${cityName}`}
          >
            <MapPin size={13} style={{ color: colors.accent }} className="shrink-0" />
            <span className="truncate font-semibold text-[11px] font-sans">
              {cityName}
            </span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border transition-all active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCardElevated,
              color: colors.accent,
            }}
            aria-label={settings.isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            title={settings.isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
          >
            {settings.isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
};
