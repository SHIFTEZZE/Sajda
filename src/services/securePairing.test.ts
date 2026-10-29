/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeSecurePairingIdentity, createSecureInvitation, verifyAndParseInvitation, computePublicKeyFingerprint } from './securePairingProtocol.ts';

export async function runSecurePairingTests(): Promise<{ name: string; passed: boolean; message: string }[]> {
  const results: { name: string; passed: boolean; message: string }[] = [];

  // Test 1: Invitation generation and fragment verification
  try {
    const { identity } = await initializeSecurePairingIdentity('مستخدم اختبار');
    const { invitation, inviteUrlFragment } = await createSecureInvitation(identity.deviceName);
    const parsed = await verifyAndParseInvitation(inviteUrlFragment);

    const passed = parsed !== null && parsed.senderId === identity.deviceId && parsed.inviteId === invitation.inviteId;
    results.push({
      name: 'Secure Invitation Creation & Fragment Verification',
      passed,
      message: passed ? 'Successfully created signed invitation and verified URL fragment.' : 'Verification failed.',
    });
  } catch (e: any) {
    results.push({ name: 'Secure Invitation Creation & Fragment Verification', passed: false, message: e?.message || 'Error' });
  }

  // Test 2: Fingerprint generation
  try {
    const { identity } = await initializeSecurePairingIdentity('بصمة مفتاح');
    const fp = await computePublicKeyFingerprint(identity.publicKeyJwk);
    const passed = typeof fp === 'string' && fp.length > 10;

    results.push({
      name: 'Public Key Fingerprint Generation',
      passed,
      message: passed ? `Generated fingerprint successfully: ${fp.substring(0, 12)}...` : 'Fingerprint generation failed.',
    });
  } catch (e: any) {
    results.push({ name: 'Public Key Fingerprint Generation', passed: false, message: e?.message || 'Error' });
  }

  // Test 3: Expiration enforcement (simulate expired invitation)
  try {
    const { identity } = await initializeSecurePairingIdentity('منتهي الصلاحية');
    const { invitation } = await createSecureInvitation(identity.deviceName);
    // Force expiration in the past (e.g. 15 minutes ago)
    invitation.expiresAt = Date.now() - 15 * 60 * 1000;
    
    const fragment = `#invite=` + encodeURIComponent(btoa(JSON.stringify(invitation)));
    const parsed = await verifyAndParseInvitation(fragment);

    const passed = parsed === null; // Should be rejected due to 10-minute expiration rule
    results.push({
      name: 'Invitation 10-Minute Expiration Enforcement',
      passed,
      message: passed ? 'Expired invitation correctly rejected.' : 'Expired invitation was incorrectly accepted.',
    });
  } catch (e: any) {
    results.push({ name: 'Invitation 10-Minute Expiration Enforcement', passed: false, message: e?.message || 'Error' });
  }

  return results;
}
