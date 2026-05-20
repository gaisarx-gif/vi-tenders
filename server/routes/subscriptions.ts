import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { authenticateToken, checkDb } from '../middleware/auth.js';
import { db } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';
import { SubscriptionCreateSchema } from '../schemas/subscriptions.js';

export const subscriptionsRouter: Router = Router();

function uidOf(req: AuthedRequest): string {
  return req.user?.canonicalUid || req.user?.employeeId || '';
}

subscriptionsRouter.get(
  '/subscriptions',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    try {
      const snapshot = await db!
        .collection('subscriptions')
        .where('userId', '==', uidOf(req))
        .get();
      const subs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json({ data: subs });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching subscriptions', { error: message });
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
  },
);

subscriptionsRouter.post(
  '/subscriptions',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    const result = SubscriptionCreateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    try {
      const docRef = await db!.collection('subscriptions').add({
        ...result.data,
        userId: uidOf(req),
        createdAt: Date.now(),
      });
      res.status(201).json({ data: { id: docRef.id, ...result.data, userId: uidOf(req) } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error creating subscription', { error: message });
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  },
);

subscriptionsRouter.delete(
  '/subscriptions/:id',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    try {
      const subRef = db!.collection('subscriptions').doc(req.params.id);
      const sub = await subRef.get();

      if (!sub.exists) return res.status(404).json({ error: 'Subscription not found' });
      if (sub.data()?.userId !== uidOf(req)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await subRef.delete();
      res.json({ ok: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error deleting subscription', { error: message });
      res.status(500).json({ error: 'Failed to delete subscription' });
    }
  },
);
