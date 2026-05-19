// Quick admin SDK smoke test.
// Usage:  tsx test-admin.ts
// Reads FIREBASE_PROJECT_ID and FIREBASE_DATABASE_ID from .env.local.

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const databaseId = process.env.FIREBASE_DATABASE_ID;

if (!projectId) {
  console.error('FIREBASE_PROJECT_ID not set. See SETUP.md.');
  process.exit(1);
}

admin.initializeApp({ projectId });

const db = databaseId ? getFirestore(admin.app(), databaseId) : getFirestore(admin.app());

async function test() {
  try {
    const collections = await db.listCollections();
    console.log(
      'Collections:',
      collections.map((c) => c.id),
    );
  } catch (error) {
    console.error('Admin Test Failed:', error);
  }
}

test();
