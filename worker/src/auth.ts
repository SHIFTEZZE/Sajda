export interface SignedRequest {
  senderId: string;
  recipientId: string;
  timestamp: number;
  nonce: string;
  payload: unknown;
  signature: string;
  publicKey: JsonWebKey;
}

export async function verifySignedRequest(
  message: SignedRequest
): Promise<boolean> {
  try {
    if (
      !message ||
      typeof message.senderId !== 'string' ||
      typeof message.recipientId !== 'string' ||
      typeof message.timestamp !== 'number' ||
      !Number.isFinite(message.timestamp) ||
      typeof message.nonce !== 'string' ||
      typeof message.signature !== 'string' ||
      !message.publicKey
    ) {
      return false;
    }

    const fiveMinutes = 5 * 60 * 1000;

    if (Math.abs(Date.now() - message.timestamp) > fiveMinutes) {
      return false;
    }

    if (message.nonce.length < 16 || message.nonce.length > 128) {
      return false;
    }

    if (
      message.publicKey.kty !== 'EC' ||
      message.publicKey.crv !== 'P-256' ||
      message.publicKey.d
    ) {
      return false;
    }

    const publicKey = await crypto.subtle.importKey(
      'jwk',
      message.publicKey,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );

    const { signature, publicKey: _publicKey, ...signedData } = message;

    const signatureBytes = Uint8Array.from(
      atob(signature),
      char => char.charCodeAt(0)
    );

    const dataBytes = new TextEncoder().encode(
      JSON.stringify(signedData)
    );

    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signatureBytes,
      dataBytes
    );
  } catch {
    return false;
  }
}
