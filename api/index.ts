import './server/lib/firebase-admin.ts';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '../server/lib/logger.js';
import { FIREBASE_AUTH_DOMAIN, corsOrigins } from '../server/lib/env.js';

// Test just health route (no auth)
import { healthRouter } from '../server/routes/health.ts';

logger.info('Testing health route only...');

const app = express();
app.use(helmet({ contentSecurityPolicy: { useDefaults: true, directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com', 'https://www.gstatic.com', 'https://*.firebaseapp.com', 'https://*.googleapis.com'], styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'], imgSrc: ["'self'", 'data:', 'blob:', 'https:'], connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com', 'https://*.firebaseapp.com', 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://*.google.com', 'wss://*.firebaseio.com'], frameSrc: ["'self'", 'https://*.firebaseapp.com', 'https://accounts.google.com', 'https://localhost:*', 'http://localhost:*'], objectSrc: ["'none'"], baseUri: ["'self'"], formAction: ["'self'"] } }, crossOriginEmbedderPolicy: false, frameguard: { action: 'sameorigin' } }));
app.use(cors({ origin: corsOrigins, credentials: true }));
app.set('trust proxy', 1);
if (FIREBASE_AUTH_DOMAIN) { app.use(createProxyMiddleware({ pathFilter: '/__/auth', target: `https://${FIREBASE_AUTH_DOMAIN}`, changeOrigin: true, secure: true, cookieDomainRewrite: { [FIREBASE_AUTH_DOMAIN]: '' } })); }

app.use('/api', healthRouter);
app.use(express.json());

app.get('/api/health2', (_req, res) => { res.json({ status: 'ok' }); });

export default app;
