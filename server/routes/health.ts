/**
 * Health check route.
 *
 * GET /api/health — returns server + Firestore status. Mounted before
 * the rate limiter so it stays available under load.
 */

import { Router } from 'express';
import { db } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';

export const healthRouter: Router = Router();

healthRouter.get('/health', async (_req, res) => {
  let firestoreStatus = 'unknown';
  try {
    if (db) {
      await db.collection('health').limit(1).get();
      firestoreStatus = 'connected';
    } else {
      firestoreStatus = 'not_initialized';
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Health check failed', { error: message });
    firestoreStatus = `error: ${message}`;
  }
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    firestore: firestoreStatus,
    env: process.env.NODE_ENV || 'development',
  });
});
