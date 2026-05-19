import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { authenticateToken, checkDb } from '../middleware/auth.js';
import { db } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';

export const notificationsRouter: Router = Router();

function uidOf(req: AuthedRequest): string {
  return req.user?.canonicalUid || req.user?.employeeId || '';
}

notificationsRouter.get(
  '/notifications',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    try {
      const snapshot = await db!
        .collection('notifications')
        .where('userId', '==', uidOf(req))
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();
      const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json({ data: notes });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching notifications', { error: message });
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },
);

notificationsRouter.patch(
  '/notifications/mark-all-read',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    try {
      const snapshot = await db!
        .collection('notifications')
        .where('userId', '==', uidOf(req))
        .where('read', '==', false)
        .get();

      const batch = db!.batch();
      snapshot.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
      await batch.commit();

      logger.info('Marked all notifications as read', {
        userId: uidOf(req),
        count: snapshot.size,
      });
      res.json({ ok: true, updated: snapshot.size });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error marking all notifications read', { error: message });
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  },
);

notificationsRouter.patch(
  '/notifications/:id/read',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    try {
      const noteRef = db!.collection('notifications').doc(req.params.id);
      const note = await noteRef.get();

      if (!note.exists) return res.status(404).json({ error: 'Notification not found' });
      if (note.data()?.userId !== uidOf(req)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await noteRef.update({ read: true });
      res.json({ ok: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error updating notification', { error: message });
      res.status(500).json({ error: 'Failed to update notification' });
    }
  },
);
