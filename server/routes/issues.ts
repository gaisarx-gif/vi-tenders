import { Router } from 'express';
import { authenticateToken, checkDb, isAdmin } from '../middleware/auth.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { db } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';
import { IssueCreateSchema } from '../schemas/issues.js';

export const issuesRouter: Router = Router();

issuesRouter.get('/issues', authenticateToken, checkDb, async (_req: AuthedRequest, res) => {
  try {
    const snapshot = await db!
      .collection('issues')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const issues = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ data: issues });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching issues', { error: message });
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

issuesRouter.get('/issues/:id', authenticateToken, checkDb, async (req: AuthedRequest, res) => {
  try {
    const doc = await db!.collection('issues').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    const tendersSnap = await db!
      .collection('tenders')
      .where('issueId', '==', req.params.id)
      .get();
    const tenders = tendersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ data: { id: doc.id, ...doc.data(), tenders } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching issue', { error: message, issueId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

issuesRouter.post('/admin/issues', isAdmin, checkDb, async (req, res) => {
  const parsed = IssueCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { issueNumber, date } = parsed.data;

  try {
    const docRef = db!.collection('issues').doc();
    await docRef.set({ issueNumber, date, createdAt: Date.now() });
    logger.info('Issue created', { issueId: docRef.id, issueNumber });
    res.status(201).json({ data: { id: docRef.id, issueNumber, date } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error creating issue', { error: message });
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

issuesRouter.delete('/admin/issues/:id', isAdmin, checkDb, async (req, res) => {
  const issueId = req.params.id;
  try {
    const batch = db!.batch();
    batch.delete(db!.collection('issues').doc(issueId));
    const tenderSnap = await db!.collection('tenders').where('issueId', '==', issueId).get();
    tenderSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    logger.info('Issue deleted', { issueId, tendersDeleted: tenderSnap.size });
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error deleting issue', { error: message });
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});
