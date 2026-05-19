import { Router } from 'express';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadPdf, uploadExcel } from '../middleware/upload.js';
import { ingestLimiter } from '../middleware/rate-limit.js';
import { processPdfBuffer } from '../lib/pdf-processor.js';
import { db } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';
import type { AuthedRequest } from '../middleware/auth.js';

export const ingestRouter: Router = Router();

async function createNotificationsForNewTenders(count: number): Promise<void> {
  if (!db || count === 0) return;

  try {
    const employeesSnap = await db.collection('authorized_employees').get();
    if (employeesSnap.empty) return;

    const batch = db.batch();
    for (const doc of employeesSnap.docs) {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        userId: doc.id,
        type: 'tender',
        title: 'مناقصات جديدة',
        message: `تم إضافة ${count} مناقصة جديدة`,
        read: false,
        createdAt: Date.now(),
      });
    }
    await batch.commit();
    logger.info('[notifications] Created %d notifications for %d tenders', employeesSnap.size, count);
  } catch (err) {
    logger.error('[notifications] Failed to create notifications: %s', err instanceof Error ? err.message : String(err));
  }
}

const issueSchema = z.object({
  issueNumber: z.string().min(1, 'issueNumber is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be yyyy-mm-dd'),
});

// POST /ingest/pdf — upload PDF, extract tenders, save to Firestore
ingestRouter.post(
  '/ingest/pdf',
  authenticateToken,
  isAdmin,
  uploadPdf,
  ingestLimiter,
  async (req: AuthedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      const parsed = issueSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const { issueNumber, date } = parsed.data;
      const result = await processPdfBuffer(req.file.buffer, issueNumber, date);

      if (!db) {
        return res.status(503).json({ error: 'Database not initialized' });
      }

      const issueRef = await db.collection('issues').add(result.issue);
      const issueId = issueRef.id;

      const batch = db.batch();
      for (const tender of result.tenders) {
        const docRef = db.collection('tenders').doc();
        batch.set(docRef, {
          ...tender,
          issueId,
          createdAt: Date.now(),
        });
      }
      await batch.commit();
      await createNotificationsForNewTenders(result.tenders.length);

      logger.info('[ingest/pdf] Saved issue=%s with %d tenders (pages=%d)', issueId, result.tenders.length, result.pageCount);

      res.json({
        ok: true,
        issueId,
        processed: result.tenders.length,
        pageCount: result.pageCount,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('[ingest/pdf] Failed: %s', message);
      res.status(500).json({ error: 'PDF ingestion failed', details: message });
    }
  },
);

// POST /ingest/excel — upload Excel, parse rows, save to Firestore
ingestRouter.post(
  '/ingest/excel',
  authenticateToken,
  isAdmin,
  uploadExcel,
  ingestLimiter,
  async (req: AuthedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No Excel file uploaded' });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return res.status(400).json({ error: 'Excel file has no sheets' });
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName]);
      let imported = 0;
      let skipped = 0;

      const tenders: Record<string, unknown>[] = [];
      for (const row of rows) {
        const tenderNo = String(row.tenderNo ?? row.TenderNo ?? row['Tender No'] ?? '');
        const organizationName = String(row.organizationName ?? row.OrganizationName ?? row['Organization Name'] ?? row['الجهة'] ?? '');
        const description = String(row.description ?? row.Description ?? row['الوصف'] ?? '');

        if (!tenderNo || !organizationName || !description) {
          skipped++;
          continue;
        }

        tenders.push({
          tenderNo,
          organizationName,
          description,
          publishingDate: String(row.publishingDate ?? row.PublishingDate ?? row['Publishing Date'] ?? row['تاريخ النشر'] ?? ''),
          closingDate: String(row.closingDate ?? row.ClosingDate ?? row['Closing Date'] ?? row['تاريخ الإغلاق'] ?? ''),
          status: String(row.status ?? row.Status ?? row['الحالة'] ?? 'New Tender'),
          page: row.page ? String(row.page) : undefined,
        });
        imported++;
      }

      if (tenders.length === 0) {
        return res.json({ ok: true, imported: 0, skipped });
      }

      if (!db) {
        return res.status(503).json({ error: 'Database not initialized' });
      }

      const batch = db.batch();
      for (const tender of tenders) {
        const docRef = db.collection('tenders').doc();
        batch.set(docRef, { ...tender, createdAt: Date.now() });
      }
      await batch.commit();
      await createNotificationsForNewTenders(tenders.length);

      logger.info('[ingest/excel] Imported %d tenders (%d skipped)', imported, skipped);

      res.json({ ok: true, imported, skipped });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('[ingest/excel] Failed: %s', message);
      res.status(500).json({ error: 'Excel ingestion failed', details: message });
    }
  },
);
