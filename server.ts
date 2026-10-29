/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory or file-backed database for Sajda Family & Friends Sync
const DATA_FILE = path.join(__dirname, '.family_sync_data.json');

interface SharedUserRecord {
  sajdaId: string;
  name: string;
  date: string;
  todayPrayedCount: number;
  prayerStates: { [key: string]: boolean };
  streak: number;
  lastActive: string;
  allowRemoteReminder: boolean;
  lastPing?: {
    type: 'adhan' | 'reminder';
    sender: string;
    timestamp: number;
  };
}

let syncStore: { [sajdaId: string]: SharedUserRecord } = {};

try {
  if (fs.existsSync(DATA_FILE)) {
    syncStore = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
} catch {
  syncStore = {};
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(syncStore, null, 2));
  } catch (e) {
    console.error('Failed to save sync store', e);
  }
}

// API Routes for Real-time Prayer Sync & Remote Adhan Pings
app.post('/api/friends/publish', (req, res) => {
  const { sajdaId, name, date, todayPrayedCount, prayerStates, streak } = req.body;
  if (!sajdaId) {
    return res.status(400).json({ error: 'sajdaId is required' });
  }

  syncStore[sajdaId] = {
    sajdaId,
    name: name || 'مستخدم سجدة',
    date: date || new Date().toISOString().split('T')[0],
    todayPrayedCount: todayPrayedCount ?? 0,
    prayerStates: prayerStates || {},
    streak: streak ?? 0,
    lastActive: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }),
    allowRemoteReminder: true,
    lastPing: syncStore[sajdaId]?.lastPing,
  };
  saveStore();
  res.json({ success: true, data: syncStore[sajdaId] });
});

app.get('/api/friends/fetch/:sajdaId', (req, res) => {
  const { sajdaId } = req.params;
  const record = syncStore[sajdaId];
  if (!record) {
    return res.status(404).json({ error: 'User not found on server sync' });
  }
  res.json({ success: true, data: record });
});

app.post('/api/friends/ping', (req, res) => {
  const { targetId, senderName, type } = req.body;
  if (!targetId || !syncStore[targetId]) {
    return res.status(404).json({ error: 'Target user not found' });
  }

  syncStore[targetId].lastPing = {
    type: type || 'adhan',
    sender: senderName || 'صديق',
    timestamp: Date.now(),
  };
  saveStore();
  res.json({ success: true, message: 'Ping sent successfully' });
});

app.get('/api/friends/check-ping/:sajdaId', (req, res) => {
  const { sajdaId } = req.params;
  const record = syncStore[sajdaId];
  if (!record || !record.lastPing) {
    return res.json({ success: true, ping: null });
  }

  const ping = record.lastPing;
  if (Date.now() - ping.timestamp < 60000) {
    res.json({ success: true, ping });
  } else {
    res.json({ success: true, ping: null });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Sajda companion server running on port ${PORT}`);
  });
}

startServer();
