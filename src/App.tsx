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
import { calculatePrayerTimes } from './utils/prayerTimes.ts';
import { getHijriDate } from './utils/hijriDate.ts';
import { getThemeTokens } from './utils/themeStyles.ts';
import { DailyPrayerName, PrayerState, formatDateKey } from './utils/trackerLogic.ts';
import { audioAdhan } from './services/audioAdhan.ts';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const loaded = loadSettings();
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      loaded.hasCompletedOnboarding = true;
    }
    return loaded;
  });

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [records, setRecords] = useState<RecordsMap>(() => loadAllPrayerRecords());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [lastAlertedPrayer, setLastAlertedPrayer] = useState<string | null>(null);

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

  const handleQuickRecord = (prayer: DailyPrayerName, state: PrayerState) => {
    const todayKey = formatDateKey(new Date());
    handleSetPrayerRecord(todayKey, prayer, state);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const themeColors = useMemo(
    () => getThemeTokens(settings.theme, settings.isDarkMode),
    [settings.theme, settings.isDarkMode]
  );

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

  const hijriDate = useMemo(() => {
    return getHijriDate(currentTime, settings.hijriShift);
  }, [currentTime, settings.hijriShift]);

  useEffect(() => {
    const nowMs = currentTime.getTime();
    for (const pt of prayerTimes.list) {
      if (pt.name === 'Sunrise') continue;
      const diffMs = Math.abs(nowMs - pt.time.getTime());
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
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative shadow-2xl sm:border-x sm:border-amber-900/10"
        style={{ backgroundColor: themeColors.bgBase }}
      >
        <Header
          settings={settings}
          onToggleDarkMode={() => handleUpdateSettings({ isDarkMode: !settings.isDarkMode })}
          onOpenLocation={() => setActiveTab('settings')}
          colors={themeColors}
        />

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

        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          colors={themeColors}
        />

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
