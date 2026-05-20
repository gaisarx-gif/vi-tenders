import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth.ts';
import { authenticateToken, checkDb, isAdmin } from '../middleware/auth.ts';
import { db } from '../lib/firebase-admin.ts';
import { logger } from '../lib/logger.ts';
import { EmployeeCreateSchema, DocIdTransform } from '../schemas/employees.ts';
import { OWNER_EMAIL } from '../lib/env.ts';

export const employeesRouter: Router = Router();

employeesRouter.get('/employees', authenticateToken, checkDb, isAdmin, async (_req: AuthedRequest, res) => {
  try {
    const snapshot = await db!.collection('authorized_employees').get();
    const employees = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ data: employees });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching employees', { error: message });
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

employeesRouter.post('/admin/employees', checkDb, isAdmin, async (req: AuthedRequest, res) => {
  const parsed = EmployeeCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email, role } = parsed.data;
  const docId = DocIdTransform(email);

  try {
    const docRef = db!.collection('authorized_employees').doc(docId);
    await docRef.set({ email, role, createdAt: Date.now() });
    logger.info('Employee created', { email, role, admin: req.user?.employeeId });
    res.status(201).json({ data: { id: docId, email, role } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error creating employee', { error: message });
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

employeesRouter.delete('/admin/employees/:email', checkDb, isAdmin, async (req: AuthedRequest, res) => {
  const email = req.params.email.trim().toLowerCase();
  const docId = DocIdTransform(email);

  if (email === OWNER_EMAIL.toLowerCase()) {
    logger.warn('Blocked attempt to delete owner', { admin: req.user?.employeeId });
    return res.status(403).json({ error: 'Cannot delete the owner account' });
  }

  try {
    const docRef = db!.collection('authorized_employees').doc(docId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await docRef.delete();
    logger.info('Employee deleted', { email, admin: req.user?.employeeId });
    res.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error deleting employee', { error: message });
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});
