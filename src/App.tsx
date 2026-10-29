/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { Navigation, TabId } from './components/Navigation.tsx';
import { HomeTab } from './components/HomeTab.tsx';
import { QuranTab } from './components/QuranTab.tsx';
import { TrackerTab } from './components/TrackerTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import { QiblaView } from './components/QiblaView.tsx';
import { MosquesView } from './components/MosquesView.tsx';
import { HadithView } from './components/HadithView.tsx';
import { FamilyTab } from './components/FamilyTab.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';

import {
  AppSettings,
  loadSettings,
  saveSettings,
} from './services/settingsStorage.ts';
import {
  RecordsMap,
  loadAllPrayerRecords,
  savePrayerRecord,
} from './services/trackerStorage.ts';
import { addFamilyMember } from './services/familyStorage.ts';
import { calculatePrayerTimes } from './utils/prayerTimes.ts';
import { getHijriDate } from './utils/hijriDate.ts';
import { getThemeTokens } from './utils/themeStyles.ts';
import { DailyPrayerName, PrayerState, formatDateKey } from './utils/trackerLogic.ts';
import { audioAdhan } from './services/audioAdhan.ts';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const loaded = loadSettings();
    // Testability: if url has ?autostart=1, mark onboarding as completed immediately
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      loaded.hasCompletedOnboarding = true;
    }
    return loaded;
  });

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [records, setRecords] = useState<RecordsMap>(() => loadAllPrayerRecords());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [lastAlertedPrayer, setLastAlertedPrayer] = useState<string | null>(null);
  const [incomingFriendInvite, setIncomingFriendInvite] = useState<string | null>(null);

  // Parse invite link on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const friendParam = params.get('add_friend');
      if (friendParam) {
        setIncomingFriendInvite(decodeURIComponent(friendParam));
      }
    }
  }, []);

  const handleAcceptInvite = () => {
    if (incomingFriendInvite) {
      addFamilyMember({
        name: incomingFriendInvite,
        relation: 'صديق عبر الرابط',
        statusText: 'تم الانضمام لرفقة الصلاة',
        todayPrayedCount: 4,
        totalPrayers: 5,
        streak: 3,
        lastActive: 'الآن',
        allowRemoteReminder: true,
        canViewMyPrayer: true,
        avatarColor: '#1F3D2B',
      });
      setActiveTab('family');
      setIncomingFriendInvite(null);
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // Sync settings changes to localStorage
  const handleUpdateSettings = (updated: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updated };
      saveSettings(next);
      return next;
    });
  };

  // Prayer Record change
  const handleSetPrayerRecord = (date: string, prayer: DailyPrayerName, state: PrayerState) => {
    const { allRecords } = savePrayerRecord(date, prayer, state);
    setRecords({ ...allRecords });
  };

  // Quick record helper from Home
  const handleQuickRecord = (prayer: DailyPrayerName, state: PrayerState) => {
    const todayKey = formatDateKey(new Date());
    handleSetPrayerRecord(todayKey, prayer, state);
  };

  // Update clock every minute for prayer engine
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000); // 15 sec update
    return () => clearInterval(timer);
  }, []);

  // Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Compute theme color tokens
  const themeColors = useMemo(
    () => getThemeTokens(settings.theme, settings.isDarkMode),
    [settings.theme, settings.isDarkMode]
  );

  // Compute prayer times
  const prayerTimesConfig = useMemo(() => {
    return {
      latitude: settings.location.latitude,
      longitude: settings.location.longitude,
      method: settings.calculation.method,
      asrMethod: settings.calculation.asrMethod,
      highLatitudeRule: settings.calculation.highLatitudeRule,
      adjustments: settings.calculation.adjustments,
    };
  }, [settings.location, settings.calculation]);

  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(prayerTimesConfig, currentTime, currentTime);
  }, [prayerTimesConfig, currentTime]);

  // Compute Hijri Date
  const hijriDate = useMemo(() => {
    return getHijriDate(currentTime, settings.hijriShift);
  }, [currentTime, settings.hijriShift]);

  // Handle prayer arrival notification check
  useEffect(() => {
    const nowMs = currentTime.getTime();
    for (const pt of prayerTimes.list) {
      if (pt.name === 'Sunrise') continue;
      const diffMs = Math.abs(nowMs - pt.time.getTime());
      // Within 45 seconds of arrival
      if (diffMs < 45000 && lastAlertedPrayer !== pt.name) {
        setLastAlertedPrayer(pt.name);
        const mode = settings.notifications[pt.name as DailyPrayerName];
        if (mode === 'full_adhan') {
          audioAdhan.playAdhanPreview();
        } else if (mode === 'short_tone') {
          audioAdhan.playNotificationChime();
        }
        break;
      }
    }
  }, [currentTime, prayerTimes.list, lastAlertedPrayer, settings.notifications]);

  // Sync background color with document body
  useEffect(() => {
    document.body.style.backgroundColor = themeColors.bgBase;
    document.body.style.color = themeColors.textMain;
  }, [themeColors]);

  return (
    <div
      className="min-h-screen transition-colors duration-300 font-sans"
      style={{
        backgroundColor: themeColors.bgBase,
        color: themeColors.textMain,
      }}
    >
      {/* Victorian App Shell (Mobile First Container) */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative shadow-2xl sm:border-x sm:border-amber-900/10"
        style={{ backgroundColor: themeColors.bgBase }}
      >
        {/* Sticky Header */}
        <Header
          settings={settings}
          onToggleDarkMode={() => handleUpdateSettings({ isDarkMode: !settings.isDarkMode })}
          onOpenLocation={() => setActiveTab('settings')}
          colors={themeColors}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-4 pb-20">
          {activeTab === 'home' && (
            <HomeTab
              prayerTimes={prayerTimes}
              hijriDate={hijriDate}
              settings={settings}
              colors={themeColors}
              records={records}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onQuickRecord={handleQuickRecord}
            />
          )}

          {activeTab === 'quran' && (
            <QuranTab
              colors={themeColors}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {activeTab === 'tracker' && (
            <TrackerTab
              records={records}
              onSetRecord={handleSetPrayerRecord}
              colors={themeColors}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              colors={themeColors}
            />
          )}

          {activeTab === 'qibla' && (
            <QiblaView
              settings={settings}
              colors={themeColors}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'mosques' && (
            <MosquesView
              settings={settings}
              colors={themeColors}
              onBack={() => setActiveTab('home')}
              onOpenLocationSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'hadith' && (
            <HadithView
              colors={themeColors}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'family' && (
            <FamilyTab
              colors={themeColors}
              settings={settings}
            />
          )}
        </main>

        {/* Incoming Invite Modal */}
        {incomingFriendInvite && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp text-center"
              style={{ backgroundColor: themeColors.bgCard, borderColor: themeColors.borderSubtle }}
            >
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border"
                style={{
                  backgroundColor: `${themeColors.accent}18`,
                  borderColor: themeColors.accent,
                  color: themeColors.accent,
                }}
              >
                🤝
              </div>
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: themeColors.primary }}>
                دعوة انضمام لرفقة الصلاة
              </h3>
              <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                هل ترغب في إضافة <strong>{incomingFriendInvite}</strong> إلى رفقاء الدرب والأحباب في تطبيق سجدة لتبادل متابعة الصلوات والتنبيهات؟
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAcceptInvite}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold font-sans text-white transition-transform active:scale-95 shadow-xs"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  نعم، إضافة وتفعيل المتابعة
                </button>
                <button
                  onClick={() => {
                    setIncomingFriendInvite(null);
                    window.history.replaceState({}, '', window.location.pathname);
                  }}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold font-sans"
                  style={{ borderColor: themeColors.borderSubtle, color: themeColors.textMain }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Persistent Bottom Navigation */}
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          colors={themeColors}
        />

        {/* First Launch Onboarding Flow */}
        {!settings.hasCompletedOnboarding && (
          <OnboardingModal
            settings={settings}
            onComplete={(updated) => handleUpdateSettings(updated)}
            colors={themeColors}
          />
        )}
      </div>
    </div>
  );
}
