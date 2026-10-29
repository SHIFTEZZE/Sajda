# سجدة (Sajda) - Privacy-First Muslim Companion App

**Sajda** is a privacy-first, offline-first Islamic companion app built with React, TypeScript, Tailwind CSS, and Capacitor (for Android).

---

## Key Architecture & Privacy Guarantees

1. **Permanent On-Device Records**: All personal prayer tracker records, Quran bookmarks, and reading progress remain strictly on the user's device (`localStorage` / Capacitor Preferences).
2. **Stateless Cloudflare Relay**: Cloudflare Workers act solely as an authenticated, stateless push relay. No persistent databases (D1, KV, R2, or Firestore) are used to store prayer history.
3. **Rolling 31-Day Retention**: Received partner prayer records are cached locally and automatically purged after 31 days. Personal prayer history never expires automatically.
4. **Cryptographic Pairing**: Mutual consent-based pairing using Web Crypto API (ECDSA P-256) key pairs, signed invitations, and replay-protected signed message payloads.
5. **No Fake Success**: Network failures and unreachable relays return strict failure/queued statuses without pretending notifications were delivered.

---

## Project Structure

- `src/` - React frontend application (Home, Quran, Tracker, Qibla, Mosques, Hadith, Family).
- `src/services/` - Storage, encryption, cryptographic pairing, relay transport, and sync managers.
- `worker/` - Stateless Cloudflare Workers relay with Firebase Cloud Messaging (FCM) HTTP v1 OAuth integration.
- `capacitor.config.ts` - Capacitor mobile app configuration (`com.sajda.companion`).

---

## Local Development & Build

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development server:
   ```bash
   npm run dev
   ```

3. Type check & production build:
   ```bash
   npm run lint
   npm run build
   ```

---

## Android Build & Deployment

To package Sajda for Android using Capacitor:

```bash
npx cap add android
npx cap sync
npx cap open android
```

In Android Studio:
- Build Debug APK: `./gradlew assembleDebug`
- Build Signed Release AAB: `./gradlew bundleRelease`
