/**
 * One-time migration: extract tenders from issues/{issueId}.tenders[]
 * and write each as a separate doc in the tenders/ collection.
 *
 * Usage:
 *   npx tsx scripts/migrate-tenders.ts              # live run
 *   npx tsx scripts/migrate-tenders.ts --dry-run     # preview only
 *
 * Idempotent: skips issueIds already migrated (tenders with that issueId exist).
 * Run this after deploying the new routes but before switching the client listener.
 */

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const DRY_RUN = process.argv.includes('--dry-run');

async function migrate() {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.error('FATAL: FIREBASE_PROJECT_ID must be set in .env.local');
    process.exit(1);
  }

  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  const db = getFirestore();

  const issuesSnap = await db.collection('issues').get();
  let total = 0;
  let skipped = 0;

  for (const issueDoc of issuesSnap.docs) {
    const issueId = issueDoc.id;
    const data = issueDoc.data();
    const tenders = data.tenders as Array<Record<string, unknown>> | undefined;

    if (!tenders || tenders.length === 0) {
      skipped++;
      continue;
    }

    // Check if already migrated (tenders for this issueId already exist)
    const existing = await db.collection('tenders').where('issueId', '==', issueId).limit(1).get();
    if (!existing.empty) {
      console.log(`SKIP  issue=${issueId} — already migrated (${existing.size} docs found)`);
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`DRY   issue=${issueId}  tenders=${tenders.length}  — would migrate`);
      total += tenders.length;
      continue;
    }

    const batch = db.batch();
    let count = 0;

    for (const t of tenders) {
      const { id: _id, ...tenderData } = t;
      const ref = db.collection('tenders').doc();
      batch.set(ref, {
        ...tenderData,
        issueId,
        issueNumber: data.issueNumber || '',
      });
      count++;
    }

    // Remove tenders array from issue doc to free space
    batch.update(issueDoc.ref, { tenders: admin.firestore.FieldValue.delete() });

    await batch.commit();
    console.log(`MIGRATED issue=${issueId}  tenders=${count}`);
    total += count;
  }

  console.log(`\nDone. Total migrated: ${total}, skipped: ${skipped}`);
  if (DRY_RUN) {
    console.log('(dry-run — no writes performed)');
  }
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
