# Rawdah — Muslim Companion (Version 1)

A privacy-first, 100% offline companion application for daily worship, crafted in a Victorian aesthetic.

## Architecture & Guiding Principles

1. **Accuracy Over Features**: Prayer times are calculated offline using astronomical algorithms from the `adhan` library. The default calculation follows the **Morocco Ministry of Habous** standard:
   - Fajr Angle: **19.0°**
   - Isha Angle: **17.0°**
   - Asr Juristic Method: **Standard (Maliki / Shafi'i / Hanbali)** or **Hanafi** (double shadow)
   - High Latitude Rule: **Middle of the Night**
   - Per-prayer manual adjustments: configurable in minutes (-30m to +30m)
2. **Privacy by Default**: Zero analytics, zero ads, zero user accounts, zero telemetry. All records, bookmarks, and settings stay strictly on the user's device in local storage.
3. **Only Network Feature**: The **Nearby Mosques** search queries the public OpenStreetMap Overpass API on-demand when the user opens the tab, with polite caching and offline fallback.
4. **Honesty About Limits**: Clear calibration notice for Qibla compass when hardware sensors are missing or uncalibrated; explicit in-app OEM battery optimization guide for alarms on Android devices (Xiaomi/MIUI, Samsung, Huawei, Oppo).
5. **No Guilt / No Punitive Streaks**: The prayer tracker has 4 distinct states:
   - *Not Recorded* (default)
   - *Prayed On Time*
   - *Prayed Later (Qada)*
   - *Not Performed*
   - Unrecorded prayers are **never** counted as misses or completed in statistics.

## Visual Design & Theming

- **Victorian Green**: Deep bottle green (`#1F3D2B`), aged brass accent (`#B08D57`), parchment cream background (`#F4EBD9`).
- **Burgundy**: Deep wine (`#6B1E2E`), antique gold accent (`#C9A24B`), warm ivory background (`#F6ECE0`).
- **Dark Mode**: Both themes feature deep velvet obsidian backgrounds with warm metallic accents.
- **Typography**: Cormorant Garamond / Cinzel display serifs, Plus Jakarta Sans body, and authentic Uthmani script (Amiri Quran / Amiri) for Arabic text.

## Features Included in Version 1

- **First-Launch Wizard**: 4-step onboarding flow to select theme, location (GPS or built-in Moroccan/world cities), calculation method, and notification permissions.
- **Home Dashboard**: Live countdown to the next prayer, Gregorian & Hijri dates (with -1/0/+1 moon sighting day shift), 5 prayer timetables, today's tracker summary, daily ayah reflection, and quick shortcuts.
- **Qibla Compass**: Great-circle forward azimuth calculation to the Holy Kaaba in Makkah (21.4225° N, 39.8262° E), compass dial needle rotation, heading diagnostics, and calibration guide.
- **Noble Quran Reader**: Complete 114 Surahs directory, offline verified Uthmani script verses, bookmarks with personal reflection notes, reading progress tracker, and adjustable font sizes (S, N, L, X).
- **Prayer Tracker**: Daily 5-prayer recording, past-day editing, 7-day matrix log, monthly calendar view, 30-day statistical summaries, and customizable consistency goal.
- **Nearby Mosques**: OpenStreetMap Overpass API queries, distance-sorted listing, interactive visual radar map, and direct navigation links to external map apps.
- **Hadith Library**: The Forty Hadith of Imam al-Nawawi (*Al-Arba'in An-Nawawiyyah*) with authentic Arabic text, English translation, source citations (Bukhari, Muslim, Tirmidhi), and scholarly gradings.
- **Settings & Privacy**: Full customization of themes, coordinates, calculation adjustments, per-prayer Adhan/chime alerts, battery optimization walk-through, privacy constitution, and full JSON backup export & restore.
- **Version 2 Readiness**: Navigation and data layer modularity prepared for adding the Community tab and multi-device sync without restructuring.

## Tests & Verification

- Core calculation logic (Morocco parameters, Qibla azimuth, Hijri calendar dates, tracker statistics) is decoupled and unit-tested via Node's native test runner (`node --test`).
