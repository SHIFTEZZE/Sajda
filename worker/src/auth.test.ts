import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifySignedRequest, type SignedRequest } from './auth.ts';

async function createSignedTestRequest(): Promise<SignedRequest> {
  const keys = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const publicKey = await crypto.subtle.exportKey('jwk', keys.publicKey);

  const data = {
    senderId: 'device-A',
    recipientId: 'device-B',
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
    payload: { prayer: 'fajr', completed: true },
  };

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keys.privateKey,
    new TextEncoder().encode(JSON.stringify(data))
  );

  return {
    ...data,
    signature: Buffer.from(signature).toString('base64'),
    publicKey,
  };
}

test('accepts a genuine signature', async () => {
  const request = await createSignedTestRequest();
  assert.equal(await verifySignedRequest(request), true);
});

test('rejects a forged signature', async () => {
  const request = await createSignedTestRequest();
  request.signature = Buffer.from('fake-signature').toString('base64');
  assert.equal(await verifySignedRequest(request), false);
});

test('rejects a tampered message', async () => {
  const request = await createSignedTestRequest();
  request.payload = { prayer: 'fajr', completed: false };
  assert.equal(await verifySignedRequest(request), false);
});

test('rejects an expired message', async () => {
  const request = await createSignedTestRequest();
  request.timestamp = Date.now() - 10 * 60 * 1000;
  assert.equal(await verifySignedRequest(request), false);
});
