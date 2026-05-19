/**
 * Environment loading + typed access.
 *
 * Loads `.env.local` first (real secrets), then `.env` (committed defaults).
 * Existing `process.env` always wins so OS-level env / CI overrides work.
 *
 * Importing this module has the side effect of loading env vars and
 * validating fatal-required values in production. All other modules should
 * import the named constants from here rather than reading `process.env`
 * directly.
 */

import dotenv from 'dotenv';
import { logger } from './logger.js';

// Side-effect load. Order matters: real secrets first, fallback defaults second.
dotenv.config({ path: '.env.local' });
dotenv.config();

export const IS_PROD = process.env.NODE_ENV === 'production';
export const PORT = Number(process.env.PORT ?? '3000');

if (Number.isNaN(PORT) || PORT <= 0) {
  logger.error('FATAL: PORT must be a valid positive integer.');
  process.exit(1);
}

// JWT secret — fatal in production if unset.
if (!process.env.JWT_SECRET && IS_PROD) {
  logger.error('FATAL: JWT_SECRET environment variable is required in production mode.');
  process.exit(1);
}
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-fallback';
if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET not set — using dev fallback. Set it before deploying.');
}

// Owner / super-admin email. Always has admin role even if no
// authorized_employees doc exists. Default kept for local dev convenience;
// production deployments should override OWNER_EMAIL.
export const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'aawad39506@gmail.com').toLowerCase();
if (!process.env.OWNER_EMAIL) {
  logger.warn('OWNER_EMAIL not set — using default. Set it before deploying.');
}

// Firebase config (server side).
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
export const FIREBASE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID;
export const FIREBASE_AUTH_DOMAIN =
  process.env.FIREBASE_AUTH_DOMAIN ||
  (FIREBASE_PROJECT_ID ? `${FIREBASE_PROJECT_ID}.firebaseapp.com` : '');

// CORS — strict in production, permissive defaults locally.
export const corsOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:3000'];

if (!IS_PROD && !process.env.ALLOWED_ORIGIN) {
  logger.info('CORS allowed origins (dev default)', { origins: corsOrigins });
}
if (IS_PROD && !process.env.ALLOWED_ORIGIN) {
  logger.error('FATAL: ALLOWED_ORIGIN must be set in production');
  process.exit(1);
}
