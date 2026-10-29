import React from 'react';
import { Home, BookOpen, CheckCircle2, Settings, Users } from 'lucide-react';
import { ThemeColors } from '../utils/themeStyles.ts';

export type TabId = 'home' | 'quran' | 'tracker' | 'settings' | 'qibla' | 'mosques' | 'hadith' | 'family';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  colors: ThemeColors;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, colors }) => {
  const tabs = [
    { id: 'home' as TabId, label: 'الرئيسية', icon: Home },
    { id: 'quran' as TabId, label: 'القرآن الكريم', icon: BookOpen },
    { id: 'tracker' as TabId, label: 'محاسبة', icon: CheckCircle2 },
    { id: 'family' as TabId, label: 'الرفقاء', icon: Users },
    { id: 'settings' as TabId, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md transition-colors select-none"
      style={{
        backgroundColor: `${colors.bgCard}F2`,
        borderColor: colors.borderSubtle,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
      }}
      aria-label="شريط التنقل الرئيسي"
    >
      <div className="max-w-md mx-auto px-4 h-18 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (activeTab === 'qibla' && tab.id === 'home') ||
            (activeTab === 'mosques' && tab.id === 'home') ||
            (activeTab === 'hadith' && tab.id === 'home');

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[48px] transition-transform active:scale-95 group focus:outline-none"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className="relative p-1.5 rounded-xl transition-all"
                style={{
                  color: isActive ? colors.accent : colors.textMuted,
                  backgroundColor: isActive ? `${colors.accent}18` : 'transparent',
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} />
                {isActive && (
                  <span
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  />
                )}
              </div>
              <span
                className="text-[11px] font-medium tracking-tight mt-0.5 transition-colors font-sans"
                style={{
                  color: isActive ? colors.textMain : colors.textMuted,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
