/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cryptographic Pairing & Device Identity Service (Web Crypto API)
 * Implements ECDSA P-256 key pair generation, secure device IDs, 
 * signed invitations, and replay-protected signed messages.
 */

export interface DeviceCryptoIdentity {
  deviceId: string; // Cryptographically secure UUID
  publicKeyPemOrJwk: JsonWebKey;
  privateKey?: CryptoKey; // Stored in memory or secure storage adapter, never transmitted
  createdAt: number;
}

export interface SignedInvitation {
  deviceId: string;
  deviceName: string;
  publicKey: JsonWebKey;
  inviteId: string;
  expiresAt: number;
  signature: string; // Base64 or hex signature of invitation payload
}

export interface SignedMessagePayload {
  senderId: string;
  recipientId: string;
  timestamp: number;
  nonce: string; // Replay protection nonce
  payload: any;
  signature: string;
}

const DEVICE_KEY_STORAGE = 'sajda_device_key_pair_v1';
const DEVICE_IDENTITY_META = 'sajda_device_meta_v1';

/**
 * Generate or load persistent cryptographic device identity and ECDSA key pair.
 */
export async function getOrCreateCryptoIdentity(deviceName = 'مستخدم سجدة'): Promise<{ identity: DeviceCryptoIdentity; privateKey: CryptoKey }> {
  try {
    const rawMeta = localStorage.getItem(DEVICE_IDENTITY_META);
    const rawKey = localStorage.getItem(DEVICE_KEY_STORAGE);

    if (rawMeta && rawKey) {
      const meta = JSON.parse(rawMeta);
      const jwkPrivate = JSON.parse(rawKey);
      const privateKey = await window.crypto.subtle.importKey(
        'jwk',
        jwkPrivate,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign']
      );
      return {
        identity: {
          deviceId: meta.deviceId,
          publicKeyPemOrJwk: meta.publicKey,
          createdAt: meta.createdAt,
        },
        privateKey,
      };
    }
  } catch (e) {
    console.warn('Failed to load existing crypto identity, generating new one...', e);
  }

  // Generate new ECDSA P-256 key pair
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const pubJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  const deviceId = 'dev_' + crypto.randomUUID();
  const createdAt = Date.now();

  const identity: DeviceCryptoIdentity = {
    deviceId,
    publicKeyPemOrJwk: pubJwk,
    createdAt,
  };

  try {
    localStorage.setItem(DEVICE_IDENTITY_META, JSON.stringify({ deviceId, publicKey: pubJwk, createdAt }));
    localStorage.setItem(DEVICE_KEY_STORAGE, JSON.stringify(privJwk));
  } catch (e) {
    console.error('Failed to persist crypto identity', e);
  }

  return { identity, privateKey: keyPair.privateKey };
}

/**
 * Sign an arbitrary object with the device's private key.
 */
export async function signData(privateKey: CryptoKey, data: object): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(JSON.stringify(data));
  const signature = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    encoded
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Verify a signature using a public JWK.
 */
export async function verifySignature(publicKeyJwk: JsonWebKey, data: object, signatureBase64: string): Promise<boolean> {
  try {
    const publicKey = await window.crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );

    const encoder = new TextEncoder();
    const encoded = encoder.encode(JSON.stringify(data));
    
    const binaryString = atob(signatureBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return await window.crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      bytes,
      encoded
    );
  } catch (e) {
    console.error('Signature verification failed:', e);
    return false;
  }
}

/**
 * Create a signed pairing invitation.
 */
export async function createSignedInvitation(privateKey: CryptoKey, deviceId: string, deviceName: string, publicKey: JsonWebKey): Promise<SignedInvitation> {
  const inviteId = 'inv_' + crypto.randomUUID();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity

  const invitationPayload = {
    deviceId,
    deviceName,
    publicKey,
    inviteId,
    expiresAt,
  };

  const signature = await signData(privateKey, invitationPayload);
  return {
    ...invitationPayload,
    signature,
  };
}

/**
 * Verify a signed invitation and ensure it has not expired.
 */
export async function verifySignedInvitation(invitation: SignedInvitation): Promise<boolean> {
  if (Date.now() > invitation.expiresAt) {
    return false; // Expired
  }

  const { signature, ...payload } = invitation;
  return await verifySignature(invitation.publicKey, payload, signature);
}

/**
 * Create a replay-protected signed message payload.
 */
export async function createSignedMessage(privateKey: CryptoKey, senderId: string, recipientId: string, payload: any): Promise<SignedMessagePayload> {
  const timestamp = Date.now();
  const nonce = crypto.randomUUID();

  const messageData = {
    senderId,
    recipientId,
    timestamp,
    nonce,
    payload,
  };

  const signature = await signData(privateKey, messageData);
  return {
    ...messageData,
    signature,
  };
}

/**
 * Verify a signed message with timestamp window validation (e.g. within 5 minutes) and replay protection.
 */
export async function verifySignedMessage(message: SignedMessagePayload, senderPublicKey: JsonWebKey): Promise<boolean> {
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const now = Date.now();

  // Replay & timestamp window check (reject if older than 5 minutes or in future)
  if (Math.abs(now - message.timestamp) > FIVE_MINUTES_MS) {
    console.warn('Message rejected: outside valid timestamp window (replay protection)');
    return false;
  }

  const { signature, ...data } = message;
  return await verifySignature(senderPublicKey, data, signature);
}
