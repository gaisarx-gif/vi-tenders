import express from 'express';
import { logger } from '../server/lib/logger.js';

logger.info('Starting Express app on Vercel...');

const app = express();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.NODE_ENV });
});

export default app;
