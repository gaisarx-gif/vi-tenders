/**
 * Rate limiting middleware.
 *
 * - `apiLimiter`   — global limit on `/api/*`: 100 req/15min per IP
 * - `loginLimiter` — stricter limit on `/api/login`: 10 req/15min per IP
 *
 * Both rely on `app.set('trust proxy', 1)` already being set by
 * `applySecurityMiddleware` so they read the real client IP from
 * `X-Forwarded-For`.
 */

import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // We've enabled trust proxy, so we can disable this validation check
});

export const ingestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 ingestion requests per windowMs
  message: { error: 'Too many upload requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
