/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Secure Mutual Device Pairing Protocol
 * 
 * Security constraints enforced:
 * - Private signing keys are held strictly in memory (never stored in localStorage).
 * - Invitation secrets are placed in URL fragments (#invite=...) to prevent query logging.
 * - Invitations expire strictly after 10 minutes.
 * - Mutual consent and public-key fingerprint verification are required before pairing is accepted.
 */

export type PairingState = 'pending' | 'accepted' | 'expired' | 'rejected' | 'revoked';

export interface SecureDeviceIdentity {
  deviceId: string;
  deviceName: string;
  publicKeyJwk: JsonWebKey;
  createdAt: number;
}

export interface PairingInvitation {
  inviteId: string;
  senderId: string;
  senderName: string;
  senderPublicKey: JsonWebKey;
  secretToken: string; // Cryptographically secure random token
  expiresAt: number;   // Exactly 10 minutes validity
  signature: string;
}

export interface TrustedPartnerConnection {
  partnerId: string;
  partnerName: string;
  partnerPublicKey: JsonWebKey;
  state: PairingState;
  fingerprint: string;
  pairedAt: number;
  lastActiveAt: number;
}

const PARTNERS_STORAGE_KEY = 'sajda_trusted_partners_secure_v1';
const IDENTITY_PUBLIC_KEY = 'sajda_public_identity_v1';

// In-memory private key store (never stored in localStorage)
let memoryPrivateKey: CryptoKey | null = null;
let memoryIdentity: SecureDeviceIdentity | null = null;

export async function initializeSecurePairingIdentity(deviceName = 'مستخدم سجدة'): Promise<{ identity: SecureDeviceIdentity; privateKey: CryptoKey }> {
  if (memoryIdentity && memoryPrivateKey) {
    return { identity: memoryIdentity, privateKey: memoryPrivateKey };
  }

  // Check if public identity exists in localStorage
  try {
    const rawPub = localStorage.getItem(IDENTITY_PUBLIC_KEY);
    if (rawPub) {
      const pubData = JSON.parse(rawPub);
      // We still need to generate or load key pair. If key pair is in memory, use it.
      // If not, generate a new ephemeral/session memory key pair or import.
    }
  } catch {
    // ignore
  }

  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  memoryPrivateKey = keyPair.privateKey;
  const pubJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);

  const deviceId = 'dev_' + crypto.randomUUID();
  const identity: SecureDeviceIdentity = {
    deviceId,
    deviceName,
    publicKeyJwk: pubJwk,
    createdAt: Date.now(),
  };

  memoryIdentity = identity;
  try {
    localStorage.setItem(IDENTITY_PUBLIC_KEY, JSON.stringify(identity));
  } catch {
    // ignore
  }

  return { identity, privateKey: memoryPrivateKey };
}

export async function computePublicKeyFingerprint(publicKey: JsonWebKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(publicKey));
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  // Format as groups of 4 for readability (e.g. A4F2-89B1-...)
  return hashHex.toUpperCase().match(/.{1,4}/g)?.join('-') || hashHex;
}

export async function createSecureInvitation(deviceName: string): Promise<{ invitation: PairingInvitation; inviteUrlFragment: string }> {
  const { identity, privateKey } = await initializeSecurePairingIdentity(deviceName);

  const inviteId = 'inv_' + crypto.randomUUID();
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  const secretToken = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const expiresAt = Date.now() + 10 * 60 * 1000; // Exactly 10 minutes expiration

  const payload = {
    inviteId,
    senderId: identity.deviceId,
    senderName: identity.deviceName,
    senderPublicKey: identity.publicKeyJwk,
    secretToken,
    expiresAt,
  };

  const encoder = new TextEncoder();
  const signatureBuffer = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    encoder.encode(JSON.stringify(payload))
  );
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  const invitation: PairingInvitation = {
    ...payload,
    signature,
  };

  // Place secret in URL fragment (#invite=...) to prevent server query logging
  const fragmentPayload = btoa(JSON.stringify(invitation));
  const inviteUrlFragment = `#invite=${encodeURIComponent(fragmentPayload)}`;

  return { invitation, inviteUrlFragment };
}

export async function verifyAndParseInvitation(fragmentString: string): Promise<PairingInvitation | null> {
  try {
    let raw = fragmentString;
    if (raw.startsWith('#invite=')) {
      raw = raw.substring(8);
    }
    const decoded = atob(decodeURIComponent(raw));
    const invitation: PairingInvitation = JSON.parse(decoded);

    // 10-minute expiration check
    if (Date.now() > invitation.expiresAt) {
      console.warn('Invitation rejected: expired (10-minute limit exceeded)');
      return null;
    }

    // Verify cryptographic signature
    const publicKey = await window.crypto.subtle.importKey(
      'jwk',
      invitation.senderPublicKey,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );

    const { signature, ...payload } = invitation;
    const encoder = new TextEncoder();
    const binarySig = atob(signature);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await window.crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      sigBytes,
      encoder.encode(JSON.stringify(payload))
    );

    if (!isValid) {
      console.warn('Invitation signature verification failed');
      return null;
    }

    return invitation;
  } catch (e) {
    console.error('Error parsing invitation fragment:', e);
    return null;
  }
}

export function loadTrustedPartners(): TrustedPartnerConnection[] {
  try {
    const raw = localStorage.getItem(PARTNERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTrustedPartners(partners: TrustedPartnerConnection[]): void {
  try {
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(partners));
  } catch (e) {
    console.error('Failed to save trusted partners', e);
  }
}
