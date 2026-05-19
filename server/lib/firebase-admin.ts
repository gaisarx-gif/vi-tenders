/**
 * Firebase Admin SDK initialization.
 *
 * Initializes the Admin SDK from `FIREBASE_PROJECT_ID` and exports the
 * Firestore handle (`db`). When `FIREBASE_PROJECT_ID` is missing, `db` is
 * `null` — callers must guard with `checkDb` middleware or an explicit null
 * check before using it.
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
  admin.initializeApp({
    projectId: FIREBASE_PROJECT_ID,
  });
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
