import express from 'express';
import type { Express } from 'express';
import { createApp } from '../server.js';

let app: Express;
try {
  app = createApp();
} catch (err) {
  console.error('api/index.ts: createApp failed, using fallback', err);
  app = express();
  app.get('/api/health', (_req, res) => res.json({ status: 'error', error: String(err) }));
}

export default app;
