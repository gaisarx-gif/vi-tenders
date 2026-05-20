import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { authenticateToken, checkDb, isAdmin } from '../middleware/auth.js';
import { db } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';
import { MergeOrgsSchema } from '../schemas/organizations.js';

export const organizationsRouter: Router = Router();

organizationsRouter.get('/organizations', authenticateToken, checkDb, async (_req: AuthedRequest, res) => {
  try {
    const snapshot = await db!
      .collection('canonical_organizations')
      .orderBy('nameAr')
      .limit(200)
      .get();
    const orgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ data: orgs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching organizations', { error: message });
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

organizationsRouter.get('/organizations/:id', authenticateToken, checkDb, async (req: AuthedRequest, res) => {
  try {
    const doc = await db!.collection('canonical_organizations').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const orgData = doc.data();
    const name = orgData?.nameAr || orgData?.nameEn || req.params.id;

    const tendersSnap = await db!
      .collection('tenders')
      .where('organizationName', '==', name)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    const recentTenders = tendersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    res.json({ data: { id: doc.id, ...orgData, recentTenders } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching organization', { error: message, orgId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

organizationsRouter.post('/admin/organizations/merge', isAdmin, checkDb, async (req, res) => {
  const parsed = MergeOrgsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { sourceNames, canonicalName } = parsed.data;

  try {
    const canonicalDocRef = db!.collection('canonical_organizations').doc(canonicalName);
    const tenderSnap = await db!
      .collection('tenders')
      .where('organizationName', 'in', sourceNames)
      .get();

    const batch = db!.batch();

    // Upsert canonical org doc
    batch.set(canonicalDocRef, { nameAr: canonicalName, updatedAt: Date.now() }, { merge: true });

    // Update all matching tenders
    let count = 0;
    for (const doc of tenderSnap.docs) {
      batch.update(doc.ref, {
        organizationName: canonicalName,
        organizationNameAr: canonicalName,
      });
      count++;
    }

    await batch.commit();

    logger.info('Organizations merged', { sourceNames, canonicalName, count });
    res.json({ ok: true, merged: count });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Merge failed', { error: message });
    res.status(500).json({ error: 'Failed to merge organizations' });
  }
});
