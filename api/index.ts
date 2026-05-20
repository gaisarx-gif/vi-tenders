import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '../server/lib/logger.js';

logger.info('Testing full config matching security.ts...');

const app = express();

// Exact same helmet config as security.ts
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com', 'https://www.gstatic.com', 'https://*.firebaseapp.com', 'https://*.googleapis.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com', 'https://*.firebaseapp.com', 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://*.google.com', 'wss://*.firebaseio.com'],
      frameSrc: ["'self'", 'https://*.firebaseapp.com', 'https://accounts.google.com', 'https://localhost:*', 'http://localhost:*'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'sameorigin' },
}));

app.use(cors({ origin: ['https://vi-tenders.vercel.app'], credentials: true }));
app.set('trust proxy', 1);

// Match proxy config from security.ts
const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN || `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`;
if (FIREBASE_AUTH_DOMAIN) {
  app.use(createProxyMiddleware({
    pathFilter: '/__/auth',
    target: `https://${FIREBASE_AUTH_DOMAIN}`,
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: { [FIREBASE_AUTH_DOMAIN]: '' },
  }));
}

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
