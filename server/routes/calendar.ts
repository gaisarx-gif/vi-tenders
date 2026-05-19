import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { authenticateToken, checkDb } from '../middleware/auth.js';
import { db } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';
import { CalendarEventSchema } from '../schemas/calendar.js';

export const calendarRouter: Router = Router();

function uidOf(req: AuthedRequest): string {
  return req.user?.canonicalUid || req.user?.employeeId || '';
}

calendarRouter.get(
  '/calendar',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    try {
      const snapshot = await db!
        .collection('calendar_events')
        .where('userId', '==', uidOf(req))
        .get();
      const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json({ data: events });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching calendar events', { error: message });
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  },
);

calendarRouter.post(
  '/calendar',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    const parsed = CalendarEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    try {
      const docRef = await db!.collection('calendar_events').add({
        ...parsed.data,
        userId: uidOf(req),
        createdAt: Date.now(),
      });

      logger.info('Calendar event created', { eventId: docRef.id });
      res.status(201).json({ data: { id: docRef.id, ...parsed.data, userId: uidOf(req) } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error creating calendar event', { error: message });
      res.status(500).json({ error: 'Failed to create calendar event' });
    }
  },
);

calendarRouter.delete(
  '/calendar/:id',
  authenticateToken,
  checkDb,
  async (req: AuthedRequest, res) => {
    try {
      const eventRef = db!.collection('calendar_events').doc(req.params.id);
      const event = await eventRef.get();

      if (!event.exists) return res.status(404).json({ error: 'Event not found' });
      if (event.data()?.userId !== uidOf(req)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await eventRef.delete();
      res.json({ ok: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error deleting calendar event', { error: message });
      res.status(500).json({ error: 'Failed to delete calendar event' });
    }
  },
);
