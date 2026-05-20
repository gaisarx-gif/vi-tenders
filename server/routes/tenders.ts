import { Router } from 'express';
import { authenticateToken, checkDb } from '../middleware/auth.ts';
import type { AuthedRequest } from '../middleware/auth.ts';
import { db } from '../lib/firebase-admin.ts';
import { logger } from '../lib/logger.ts';
import { ManualTenderSchema, TenderUpdateSchema, TenderQuerySchema } from '../schemas/tenders.ts';

export const tendersRouter: Router = Router();

tendersRouter.get('/tenders', authenticateToken, checkDb, async (req: AuthedRequest, res) => {
  const parsed = TenderQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { page, limit, status, search, issueId, lastDocId } = parsed.data;

  try {
    let query: FirebaseFirestore.Query = db!.collection('tenders');

    if (status) {
      query = query.where('status', '==', status);
    }
    if (issueId) {
      query = query.where('issueId', '==', issueId);
    }

    query = query.orderBy('createdAt', 'desc');

    if (lastDocId) {
      const lastDoc = await db!.collection('tenders').doc(lastDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    query = query.limit(limit);

    const snapshot = await query.get();
    let tenders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    // TODO: replace with Algolia/Typesense for production scale
    if (search) {
      const allDocs = await db!.collection('tenders')
        .orderBy('createdAt', 'desc')
        .limit(200)
        .get();
      let allTenders = allDocs.docs.map((d) => ({ id: d.id, ...d.data() }));

      const q = search.toLowerCase();
      allTenders = allTenders.filter(
        (t: Record<string, unknown>) =>
          (typeof t.tenderNo === 'string' && t.tenderNo.toLowerCase().includes(q)) ||
          (typeof t.description === 'string' && t.description.toLowerCase().includes(q)) ||
          (typeof t.organizationName === 'string' && t.organizationName.toLowerCase().includes(q)),
      );

      const paginated = allTenders.slice(0, limit);
      return res.json({ data: paginated, page, limit, hasMore: allTenders.length > limit });
    }

    res.json({ data: tenders, page, limit, hasMore: tenders.length === limit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching tenders', { error: message, userId: req.user?.canonicalUid });
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
});

tendersRouter.get('/tenders/:id', authenticateToken, checkDb, async (req: AuthedRequest, res) => {
  try {
    const doc = await db!.collection('tenders').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    res.json({ data: { id: doc.id, ...doc.data() } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching tender', { error: message, tenderId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch tender' });
  }
});

tendersRouter.post('/tenders', authenticateToken, checkDb, async (req, res) => {
  const parseResult = ManualTenderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }
  const tenderData = parseResult.data;
  try {
    const manualIssueRef = db!.collection('issues').doc('manual-issue');
    const manualSnap = await manualIssueRef.get();
    if (!manualSnap.exists) {
      await manualIssueRef.set({
        id: 'manual-issue',
        issueNumber: 'Manual',
        date: new Date().toISOString().split('T')[0],
        createdAt: Date.now(),
      });
    }

    const now = Date.now();
    const tenderRef = db!.collection('tenders').doc();
    const tender = {
      ...tenderData,
      issueId: 'manual-issue',
      issueNumber: 'Manual',
      createdAt: now,
      dataSource: 'MANUAL_ENTRY' as const,
    };

    await tenderRef.set(tender);
    logger.info('Manual tender created', { tenderId: tenderRef.id });
    res.json({ success: true, tender: { id: tenderRef.id, ...tender } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error creating manual tender', { error: message });
    res.status(500).json({ error: 'Failed to create tender' });
  }
});

tendersRouter.patch('/tenders/:id', authenticateToken, checkDb, async (req, res) => {
  const tenderId = req.params.id;
  const parseResult = TenderUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }
  const updates = parseResult.data;

  try {
    const tenderRef = db!.collection('tenders').doc(tenderId);
    const snap = await tenderRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    await tenderRef.update(updates as Record<string, unknown>);
    logger.info('Tender updated', { tenderId });
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error updating tender', { error: message });
    res.status(500).json({ error: 'Failed to update tender' });
  }
});
