import express from 'express';
import cookieParser from 'cookie-parser';
import { logger } from '../server/lib/logger.js';
import { applySecurityMiddleware } from '../server/middleware/security.ts';

logger.info('Testing applySecurityMiddleware import...');

const app = express();
applySecurityMiddleware(app);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
