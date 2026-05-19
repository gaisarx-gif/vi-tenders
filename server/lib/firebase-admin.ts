/**
 * Firebase Admin SDK initialization.
 *
 * Initializes the Admin SDK from `FIREBASE_PROJECT_ID` and exports the
 * Firestore handle (`db`). When `FIREBASE_PROJECT_ID` is missing, `db` is
 * `null` — callers must guard with `checkDb` middleware or an explicit null
 * check before using it.
 *
 * Credentials are loaded in this order:
 *   1. `FIREBASE_SERVICE_ACCOUNT_JSON` env var (for production deployment)
 *   2. `GOOGLE_APPLICATION_CREDENTIALS` env var / Application Default Credentials (for local dev)
 *
 * Importing this module has the side effect of initializing the Admin SDK
 * (idempotent — `admin.apps.length === 0` guard).
 */

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { FIREBASE_PROJECT_ID, FIREBASE_DATABASE_ID } from './env.js';
import { logger } from './logger.js';

if (!FIREBASE_PROJECT_ID) {
  logger.warn(
    'FIREBASE_PROJECT_ID is not set. Firebase Admin features will be disabled. See SETUP.md.',
  );
}

if (FIREBASE_PROJECT_ID && admin.apps.length === 0) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: FIREBASE_PROJECT_ID,
      });
      logger.info('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT_JSON');
    } catch (err) {
      logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON', { error: String(err) });
      process.exit(1);
    }
  } else {
    admin.initializeApp({
      projectId: FIREBASE_PROJECT_ID,
    });
    logger.info('Firebase Admin initialized via Application Default Credentials');
  }
}

// Use the specific database ID if provided
export const db = FIREBASE_PROJECT_ID
  ? FIREBASE_DATABASE_ID
    ? getFirestore(FIREBASE_DATABASE_ID)
    : getFirestore()
  : null;

if (db) {
  logger.info('Firestore Admin SDK initialized', {
    databaseId: FIREBASE_DATABASE_ID || '(default)',
    projectId: FIREBASE_PROJECT_ID,
  });
} else {
  logger.warn('Firestore Admin SDK NOT initialized (missing FIREBASE_PROJECT_ID)');
}

export { admin };
