/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeviceCryptoIdentity, SignedMessagePayload, createSignedMessage } from './cryptoPairing.ts';
import { NotificationEvent } from './familyModels.ts';

export interface RelayResponse {
  delivered: boolean;
  relayTimestamp: number;
  message?: string;
}

export class RelayTransport {
  private workerEndpoint: string;
  private identity: DeviceCryptoIdentity;
  private privateKey: CryptoKey;

  constructor(identity: DeviceCryptoIdentity, privateKey: CryptoKey, endpoint?: string) {
    this.identity = identity;
    this.privateKey = privateKey;
    this.workerEndpoint = endpoint || (import.meta as any).env?.VITE_RELAY_ENDPOINT || 'https://sajda-relay.workers.dev';
  }

  /**
   * Register device public identity with Cloudflare Workers relay.
   */
  async registerDevice(): Promise<boolean> {
    try {
      const response = await fetch(`${this.workerEndpoint}/api/device/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: this.identity.deviceId,
          publicKey: this.identity.publicKeyPemOrJwk,
          createdAt: this.identity.createdAt,
        }),
      });
      return response.ok;
    } catch {
      // Offline / network failure
      return false;
    }
  }

  /**
   * Send signed prayer update through Cloudflare Workers relay.
   * Never simulates success if network is offline or relay rejects.
   */
  async sendPrayerUpdate(recipientId: string, prayerPayload: any): Promise<RelayResponse> {
    try {
      const signedMessage: SignedMessagePayload = await createSignedMessage(
        this.privateKey,
        this.identity.deviceId,
        recipientId,
        prayerPayload
      );

      const response = await fetch(`${this.workerEndpoint}/api/relay/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.identity.deviceId,
        },
        body: JSON.stringify(signedMessage),
      });

      if (response.ok) {
        const json = await response.json();
        return {
          delivered: json.delivered ?? false,
          relayTimestamp: json.relayTimestamp || Date.now(),
          message: json.message,
        };
      }

      return {
        delivered: false,
        relayTimestamp: Date.now(),
        message: `Relay rejected request: HTTP ${response.status}`,
      };
    } catch (e: any) {
      // Return strict failure status — never fake success
      return {
        delivered: false,
        relayTimestamp: Date.now(),
        message: e?.message || 'Network error or relay unreachable',
      };
    }
  }

  /**
   * Send FCM notification / reminder via relay.
   */
  async sendFcmNotification(recipientId: string, notification: NotificationEvent): Promise<RelayResponse> {
    try {
      const signedMessage: SignedMessagePayload = await createSignedMessage(
        this.privateKey,
        this.identity.deviceId,
        recipientId,
        notification
      );

      const response = await fetch(`${this.workerEndpoint}/api/relay/fcm-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.identity.deviceId,
        },
        body: JSON.stringify(signedMessage),
      });

      if (response.ok) {
        const json = await response.json();
        return {
          delivered: json.delivered ?? false,
          relayTimestamp: json.relayTimestamp || Date.now(),
        };
      }

      return { delivered: false, relayTimestamp: Date.now(), message: `FCM push failed: HTTP ${response.status}` };
    } catch (e: any) {
      return { delivered: false, relayTimestamp: Date.now(), message: e?.message || 'Network unreachable' };
    }
  }

  /**
   * Pull pending signed updates from relay.
   */
  async fetchPendingUpdates(): Promise<any[]> {
    try {
      const response = await fetch(`${this.workerEndpoint}/api/relay/pull`, {
        method: 'GET',
        headers: {
          'X-Device-ID': this.identity.deviceId,
        },
      });
      if (response.ok) {
        const json = await response.json();
        return json.updates || [];
      }
    } catch {
      // Network failure
    }
    return [];
  }
}
