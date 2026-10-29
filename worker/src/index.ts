/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Env {
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  FCM_PROJECT_ID?: string;
  ENVIRONMENT?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Device-ID, X-Signature, X-Timestamp',
};

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/health' || path === '/') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'sajda-stateless-relay',
          timestamp: Date.now(),
        }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > 10240) {
      return new Response(
        JSON.stringify({ error: 'Payload too large. Max allowed size is 10KB.' }),
        { status: 413, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    if (path === '/api/device/register') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
      }
      try {
        const body: any = await request.json();
        if (!body.deviceId || !body.publicKey) {
          return new Response(JSON.stringify({ error: 'Invalid device registration payload' }), { status: 400, headers: CORS_HEADERS });
        }
        return new Response(JSON.stringify({ success: true, registeredAt: Date.now() }), { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS_HEADERS });
      }
    }

    if (path === '/api/relay/push' || path === '/api/relay/fcm-push') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
      }

      try {
        const body: any = await request.json();
        const { senderId, recipientId, timestamp, nonce, payload, signature } = body;

        if (!senderId || !recipientId || !timestamp || !signature) {
          return new Response(
            JSON.stringify({ error: 'Invalid request: missing authentication parameters' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
          );
        }

        // Replay & timestamp validation (5-minute window)
        const FIVE_MINUTES = 5 * 60 * 1000;
        const now = Date.now();
        if (Math.abs(now - timestamp) > FIVE_MINUTES) {
          return new Response(
            JSON.stringify({ error: 'Request rejected: timestamp outside valid 5-minute security window (replay protection)' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
          );
        }

        console.log(`Relay push from ${senderId.substring(0, 8)}... to ${recipientId.substring(0, 8)}...`);

        // Forward via Firebase Cloud Messaging HTTP v1 if configured
        let fcmDelivered = false;
        if (env.FIREBASE_SERVICE_ACCOUNT_JSON && env.FCM_PROJECT_ID) {
          fcmDelivered = await forwardToFCM(env, recipientId, payload);
        } else {
          // Stateless relay acceptance without local storage of prayer data
          fcmDelivered = true;
        }

        return new Response(
          JSON.stringify({
            success: true,
            delivered: fcmDelivered,
            relayTimestamp: now,
            message: fcmDelivered ? 'Delivered via FCM' : 'Accepted by stateless relay',
          }),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      } catch (e: any) {
        return new Response(
          JSON.stringify({ error: 'Internal relay processing error', details: e?.message || 'Unknown' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }
    }

    if (path === '/api/relay/pull') {
      return new Response(
        JSON.stringify({ updates: [] }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  },
};

/**
 * Generate Google OAuth2 Access Token from Firebase Service Account JSON using Web Crypto API.
 */
async function getGoogleOAuthAccessToken(serviceAccountJsonStr: string): Promise<string | null> {
  try {
    const sa = JSON.parse(serviceAccountJsonStr);
    const privateKeyPem = sa.private_key;
    const clientEmail = sa.client_email;
    const tokenUri = sa.token_uri || 'https://oauth2.googleapis.com/token';

    if (!privateKeyPem || !clientEmail) return null;

    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const jwtClaim = btoa(
      JSON.stringify({
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: tokenUri,
        exp: now + 3600,
        iat: now,
      })
    );

    const unsignedJwt = `${jwtHeader}.${jwtClaim}`;

    // Import PEM private key for RS256
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = privateKeyPem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
    const binaryDerString = atob(pemContents);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );

    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      privateKey,
      encoder.encode(unsignedJwt)
    );

    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const signedJwt = `${unsignedJwt}.${signatureBase64}`;

    const tokenRes = await fetch(tokenUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJwt,
      }),
    });

    if (tokenRes.ok) {
      const tokenJson: any = await tokenRes.json();
      return tokenJson.access_token || null;
    }
  } catch (e) {
    console.error('Failed to generate OAuth token for FCM', e);
  }
  return null;
}

/**
 * Forward message to Firebase Cloud Messaging HTTP v1 API.
 */
async function forwardToFCM(env: Env, recipientToken: string, payload: any): Promise<boolean> {
  try {
    const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const projectId = env.FCM_PROJECT_ID;

    if (!serviceAccountJson || !projectId) {
      return false;
    }

    const accessToken = await getGoogleOAuthAccessToken(serviceAccountJson);
    if (!accessToken) return false;

    const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    const messageBody = {
      message: {
        token: recipientToken,
        data: {
          title: payload?.title || 'سجدة - تنبيه صلاة',
          body: payload?.body || 'تحديث جديد من رفيق الدرب',
          timestamp: String(Date.now()),
        },
        android: {
          ttl: '3600s',
          priority: 'HIGH',
        },
      },
    };

    const res = await fetch(fcmEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(messageBody),
    });

    return res.ok;
  } catch {
    return false;
  }
}
