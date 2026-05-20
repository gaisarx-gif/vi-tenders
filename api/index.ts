import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '../server/lib/logger.js';

logger.info('Testing cors + http-proxy-middleware...');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
