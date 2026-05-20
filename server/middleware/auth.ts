/**
 * Auth middleware.
 *
 * - `authenticateToken` — verifies the `auth_token` cookie (JWT) and attaches
 *   the decoded payload to `req.user`. Rejects with 401 if missing/invalid.
 * - `checkDb`           — guards routes that need Firestore. Rejects with 503
 *   if the Admin SDK wasn't initialized (missing `FIREBASE_PROJECT_ID`).
 * - `isAdmin`           — composes `authenticateToken` then asserts
 *   `req.user.role === 'admin'`. Rejects with 403 otherwise.
 *
 * `req.user` shape after authenticate:
 *   { employeeId: string; canonicalUid: string; role: 'admin' | 'user' }
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, OWNER_EMAIL } from '../lib/env.ts';
import { db } from '../lib/firebase-admin.ts';

export interface AuthedRequest extends Request {
  user?: {
    employeeId: string;
    canonicalUid: string;
    role: 'admin' | 'user';
  };
}

export const authenticateToken = (req: AuthedRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies.auth_token;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: unknown, user: unknown) => {
    if (err) {
      res.status(401).json({ error: 'Invalid session' });
      return;
    }
    req.user = user as AuthedRequest['user'];
    next();
  });
};

export const checkDb = (_req: Request, res: Response, next: NextFunction): void => {
  if (!db) {
    res.status(503).json({
      error:
        'Database not initialized. Please ensure FIREBASE_PROJECT_ID is set in .env.local (see SETUP.md).',
    });
    return;
  }
  next();
};

export const isAdmin = async (req: AuthedRequest, res: Response, next: NextFunction): Promise<void> => {
  authenticateToken(req, res, async () => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const employeeId = req.user.employeeId;
    let isAdminUser = req.user.role === 'admin';

    if (!isAdminUser) {
      try {
        if (!db) {
          res.status(503).json({ error: 'Database not initialized' });
          return;
        }
        const empDoc = await db.collection('authorized_employees').doc(employeeId).get();
        if (empDoc.exists && (empDoc.data()?.role as string) === 'admin') {
          isAdminUser = true;
        }
      } catch (_error: unknown) {
        res.status(500).json({ error: 'Failed to verify admin privileges' });
        return;
      }
    }

    const isOwner = employeeId.toLowerCase() === OWNER_EMAIL;
    if (!isAdminUser && !isOwner) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    next();
  });
};
