import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth.ts';
import { authenticateToken, checkDb, isAdmin } from '../middleware/auth.ts';
import { db } from '../lib/firebase-admin.ts';
import { logger } from '../lib/logger.ts';
import { CompanyCreateSchema, CompanyUpdateSchema } from '../schemas/companies.ts';

export const companiesRouter: Router = Router();

companiesRouter.get('/companies', authenticateToken, checkDb, async (_req: AuthedRequest, res) => {
  try {
    const snapshot = await db!
      .collection('companies')
      .limit(100)
      .get();
    const companies = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ data: companies });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching companies', { error: message });
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

companiesRouter.get('/companies/:id', authenticateToken, checkDb, async (req: AuthedRequest, res) => {
  try {
    const doc = await db!.collection('companies').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ data: { id: doc.id, ...doc.data() } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching company', { error: message, companyId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

companiesRouter.post('/companies', isAdmin, checkDb, async (req, res) => {
  const parsed = CompanyCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const docRef = await db!.collection('companies').add({
      ...parsed.data,
      createdAt: Date.now(),
    });
    logger.info('Company created', { companyId: docRef.id });
    res.status(201).json({ data: { id: docRef.id, ...parsed.data } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error creating company', { error: message });
    res.status(500).json({ error: 'Failed to create company' });
  }
});

companiesRouter.put('/companies/:id', isAdmin, checkDb, async (req, res) => {
  const parsed = CompanyUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const docRef = db!.collection('companies').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }
    await docRef.update(parsed.data as Record<string, unknown>);
    logger.info('Company updated', { companyId: req.params.id });
    res.json({ data: { id: req.params.id, ...parsed.data } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error updating company', { error: message });
    res.status(500).json({ error: 'Failed to update company' });
  }
});

companiesRouter.delete('/companies/:id', isAdmin, checkDb, async (req, res) => {
  try {
    const docRef = db!.collection('companies').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }
    await docRef.delete();
    logger.info('Company deleted', { companyId: req.params.id });
    res.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error deleting company', { error: message });
    res.status(500).json({ error: 'Failed to delete company' });
  }
});
