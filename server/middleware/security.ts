/**
 * Security & transport middleware.
 *
 * - `applySecurityMiddleware(app)` wires up:
 *     1. helmet (CSP tuned for Firebase + Google AI Studio + Vite HMR)
 *     2. CORS (origins from env, strict in prod)
 *     3. trust proxy (so rate-limit can read X-Forwarded-For)
 *     4. Firebase Auth same-origin proxy (`/__/auth` → `*.firebaseapp.com`)
 *
 * Must be applied before body parsers so the OAuth proxy sees raw requests.
 */

import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { IS_PROD, FIREBASE_AUTH_DOMAIN, corsOrigins } from '../lib/env.ts';
import { logger } from '../lib/logger.ts';

export function applySecurityMiddleware(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'", // needed for Vite HMR + Firebase JS SDK in dev
            'https://apis.google.com',
            'https://www.gstatic.com',
            'https://*.firebaseapp.com',
            'https://*.googleapis.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: [
            "'self'",
            'https://*.googleapis.com',
            'https://*.firebaseio.com',
            'https://*.firebaseapp.com',
            'https://identitytoolkit.googleapis.com',
            'https://securetoken.googleapis.com',
            'https://*.google.com',
            'wss://*.firebaseio.com',
            // Vite HMR websocket
            ...(IS_PROD ? [] : ['ws://localhost:*', 'http://localhost:*']),
          ],
          frameSrc: [
            "'self'",
            'https://*.firebaseapp.com',
            'https://accounts.google.com',
            'https://localhost:*',
            'http://localhost:*',
          ],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // disabled for Firebase Auth popup compatibility
      frameguard: { action: 'sameorigin' },
    }),
  );

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  // Enable trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Reverse proxy for Firebase Auth handler — makes OAuth redirect flow same-origin.
  // Must be before body parsers so raw requests pass through unchanged.
  if (FIREBASE_AUTH_DOMAIN) {
    app.use(
      createProxyMiddleware({
        pathFilter: '/__/auth',
        target: `https://${FIREBASE_AUTH_DOMAIN}`,
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: { [FIREBASE_AUTH_DOMAIN]: '' },
      }),
    );
  } else {
    logger.warn('Firebase Auth proxy disabled — FIREBASE_AUTH_DOMAIN not set.');
  }
}
