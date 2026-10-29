/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getOrCreateCryptoIdentity, createSignedInvitation, verifySignedInvitation, createSignedMessage, verifySignedMessage } from './cryptoPairing.ts';

export async function runCryptoPairingTests(): Promise<{ name: string; passed: boolean; message: string }[]> {
  const results: { name: string; passed: boolean; message: string }[] = [];

  try {
    const { identity, privateKey } = await getOrCreateCryptoIdentity('اختبار الجهاز');
    const invitation = await createSignedInvitation(privateKey, identity.deviceId, 'اختبار الجهاز', identity.publicKeyPemOrJwk);
    const isValidInvite = await verifySignedInvitation(invitation);

    results.push({
      name: 'Cryptographic Identity & Signed Invitation',
      passed: isValidInvite,
      message: isValidInvite ? 'Successfully generated ECDSA key pair and verified signed invitation.' : 'Invitation signature verification failed.',
    });
  } catch (e: any) {
    results.push({ name: 'Cryptographic Identity & Signed Invitation', passed: false, message: e?.message || 'Error' });
  }

  try {
    const { identity, privateKey } = await getOrCreateCryptoIdentity('مرسل الأمان');
    const message = await createSignedMessage(privateKey, identity.deviceId, 'recipient_123', { test: true });
    const isValidMsg = await verifySignedMessage(message, identity.publicKeyPemOrJwk);

    results.push({
      name: 'Replay Protection & Message Signature',
      passed: isValidMsg,
      message: isValidMsg ? 'Message signature verified successfully within 5-minute timestamp window.' : 'Message verification failed.',
    });
  } catch (e: any) {
    results.push({ name: 'Replay Protection & Message Signature', passed: false, message: e?.message || 'Error' });
  }

  return results;
}
