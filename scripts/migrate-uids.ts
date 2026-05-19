/**
 * One-time migration script: updates userId fields in subscriptions,
 * notifications, and calendar_events from legacy employeeId format
 * (e.g. "AAWAD39506@GMAIL.COM") to canonical UID format.
 *
 * For Google OAuth users (email-based IDs with a Firebase Auth account):
 *   userId → Firebase Auth UID (matches server's getCanonicalUid)
 * For Employee ID users (no Firebase Auth account):
 *   userId → emp_<sha256hash>
 *
 * Safe to run multiple times — skips documents that already have
 * a canonical UID (starting with "emp_" or matching a Firebase Auth UID).
 *
 * Usage:
 *   npx tsx scripts/migrate-uids.ts [--dry-run]
 */

import crypto from 'crypto';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

function getEmployeeIdHash(employeeId: string): string {
  return `emp_${crypto.createHash('sha256').update(employeeId).digest('hex').substring(0, 28)}`;
}

function isAlreadyCanonical(userId: string, knownFirebaseUids: Set<string>): boolean {
  if (userId.startsWith('emp_')) return true;
  if (knownFirebaseUids.has(userId)) return true;
  return false;
}

/**
 * Pre-load all Firebase Auth UIDs so we can detect already-migrated
 * Google OAuth userIds on re-run.
 */
async function loadAllFirebaseUids(): Promise<Set<string>> {
  const uids = new Set<string>();
  let pageToken: string | undefined;
  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    for (const user of result.users) {
      uids.add(user.uid);
    }
    pageToken = result.pageToken;
  } while (pageToken);
  return uids;
}

/**
 * Look up a userId (email) in Firebase Auth.
 * Returns the Firebase Auth UID if found, otherwise null.
 */
async function lookupFirebaseUid(email: string): Promise<string | null> {
  try {
    const userRecord = await admin.auth().getUserByEmail(email.toLowerCase());
    return userRecord.uid;
  } catch {
    return null;
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('=== DRY RUN MODE — no writes will be made ===\n');

  // Initialize Firebase Admin from env vars (see SETUP.md)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const databaseId = process.env.FIREBASE_DATABASE_ID || '(default)';

  if (!projectId) {
    console.error('FIREBASE_PROJECT_ID not set in .env.local. See SETUP.md.');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }

  const db =
    databaseId === '(default)' ? getFirestore(admin.app()) : getFirestore(admin.app(), databaseId);

  // Pre-load all Firebase Auth UIDs for idempotent re-run detection
  console.log('Loading Firebase Auth users...');
  const knownFirebaseUids = await loadAllFirebaseUids();
  console.log(`Found ${knownFirebaseUids.size} Firebase Auth users\n`);

  // Cache Firebase Auth lookups to avoid repeated API calls
  const uidCache = new Map<string, string | null>();

  async function resolveCanonicalUid(legacyUserId: string): Promise<string> {
    // If it looks like an email, try Firebase Auth lookup first
    if (legacyUserId.includes('@')) {
      if (!uidCache.has(legacyUserId)) {
        const firebaseUid = await lookupFirebaseUid(legacyUserId);
        uidCache.set(legacyUserId, firebaseUid);
      }
      const cached = uidCache.get(legacyUserId);
      if (cached) {
        return cached; // Google OAuth user → use Firebase Auth UID
      }
    }
    // Employee ID user or email not in Firebase Auth → use hash
    return getEmployeeIdHash(legacyUserId);
  }

  const collections = ['subscriptions', 'notifications', 'calendar_events'];
  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const collectionName of collections) {
    console.log(`\n--- Processing ${collectionName} ---`);
    const snapshot = await db.collection(collectionName).get();
    let updated = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const currentUserId = data.userId;

      if (!currentUserId) {
        console.log(`  [SKIP] ${doc.id}: no userId field`);
        skipped++;
        continue;
      }

      if (isAlreadyCanonical(currentUserId, knownFirebaseUids)) {
        skipped++;
        continue;
      }

      const newUid = await resolveCanonicalUid(currentUserId);

      // Skip if the resolved UID is the same as current (already correct)
      if (newUid === currentUserId) {
        skipped++;
        continue;
      }

      const method = newUid.startsWith('emp_') ? 'hash' : 'firebase-auth';
      console.log(`  [UPDATE] ${doc.id}: "${currentUserId}" → "${newUid}" (${method})`);

      if (!dryRun) {
        await db.collection(collectionName).doc(doc.id).update({ userId: newUid });
      }
      updated++;
    }

    console.log(
      `  ${collectionName}: ${updated} updated, ${skipped} skipped (of ${snapshot.size} total)`,
    );
    totalUpdated += updated;
    totalSkipped += skipped;
  }

  console.log(
    `\n=== Migration complete: ${totalUpdated} documents updated, ${totalSkipped} skipped ===`,
  );
  if (dryRun) console.log('(dry run — no actual changes were made)');
  if (uidCache.size > 0) {
    console.log(`\nFirebase Auth lookups: ${uidCache.size} unique emails checked`);
    for (const [email, uid] of uidCache) {
      console.log(`  ${email} → ${uid || '(not found, used hash)'}`);
    }
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
