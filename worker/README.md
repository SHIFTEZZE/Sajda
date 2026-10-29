# Sajda Cloudflare Workers Stateless Relay

A stateless authenticated relay and push forwarding service for Sajda, designed to comply with privacy requirements without storing any permanent user prayer history or databases.

## Architecture & Security Principles

1. **Stateless**: No D1, KV, R2, or persistent server database. Prayer records remain strictly on users' devices.
2. **Signature Verification**: Validates ECDSA signatures and request timestamps.
3. **Replay Protection**: Enforces a strict 5-minute time window on incoming push requests. (Note: Durable multi-node replay prevention without persistent storage is documented as physically impossible without KV/D1).
4. **Secret Management**: Firebase service-account private keys and FCM credentials are stored securely as Cloudflare Worker secrets and are never exposed to the React frontend.
5. **Safe Logging**: Logs omit all prayer data, health states, and cryptographic device secrets.

---

## Local Development & Testing

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local Wrangler dev server:
   ```bash
   npm run dev
   ```

3. Test health check:
   ```bash
   curl http://localhost:8787/health
   ```

---

## Deployment Instructions

1. Log in to Wrangler:
   ```bash
   npx wrangler login
   ```

2. Set required Cloudflare secrets securely:
   ```bash
   npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON
   npx wrangler secret put FCM_PROJECT_ID
   ```

3. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```
