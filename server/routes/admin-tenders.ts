import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth.ts';
import { checkDb, isAdmin } from '../middleware/auth.ts';
import { db } from '../lib/firebase-admin.ts';
import { logger } from '../lib/logger.ts';
import { TenderStatusUpdateSchema } from '../schemas/tenders.ts';

export const adminTendersRouter: Router = Router();

adminTendersRouter.post(
  '/admin/update-tender-status',
  isAdmin,
  checkDb,
  async (req: AuthedRequest, res) => {
    const parseResult = TenderStatusUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }
    const { tenderId, newStatus, newStatusAr, newStatusEn } = parseResult.data;
    try {
      const tenderRef = db!.collection('tenders').doc(tenderId);
      const snap = await tenderRef.get();
      if (!snap.exists) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      const tender = snap.data()!;
      const oldStatus = tender.status as string;
      const organizationName = tender.organizationName as string | undefined;

      await tenderRef.update({
        status: newStatus,
        statusAr: newStatusAr,
        statusEn: newStatusEn,
        statusHistory: [
          ...((tender.statusHistory as Array<{ status: string; date: number }>) || []),
          { status: newStatus, date: Date.now() },
        ],
      });

      // Fan out notifications
      const targets = [tenderId];
      if (organizationName) targets.push(organizationName);
      const subsSnap = await db!.collection('subscriptions').where('targetId', 'in', targets).get();

      const notificationPromises = subsSnap.docs.map((subDoc) => {
        const sub = subDoc.data();
        return db!.collection('notifications').add({
          userId: sub.userId,
          title: 'Tender Status Updated',
          message: `Tender ${tenderId} status changed from ${oldStatus} to ${newStatus}`,
          type: 'status_change',
          tenderId,
          read: false,
          createdAt: Date.now(),
        });
      });

      await Promise.all(notificationPromises);

      logger.info('Tender status updated and notifications sent', {
        tenderId,
        newStatus,
        admin: req.user?.employeeId,
      });
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error updating status', { error: message });
      res.status(500).json({ error: 'Failed to update status' });
    }
  },
);
