import express from 'express';
import cookieParser from 'cookie-parser';
import { logger } from '../server/lib/logger.js';

logger.info('Testing without security middleware...');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
