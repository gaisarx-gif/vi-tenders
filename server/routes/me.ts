/**
 * /api/me route.
 *
 * Validates the JWT cookie, re-checks role from Firestore (so admin
 * revocation takes effect within one round-trip), and returns a fresh
 * Firebase custom token for the client SDK. If the role changed since the
 * JWT was issued, the cookie is rewritten with the new role.
 */

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, OWNER_EMAIL } from '../lib/env.js';
import { admin, db } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';

interface JwtUser {
  employeeId: string;
  canonicalUid?: string;
  role: 'admin' | 'user';
}

export const meRouter: Router = Router();

meRouter.get('/me', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  jwt.verify(token, JWT_SECRET, async (err: unknown, decoded: unknown) => {
    if (err) return res.status(401).json({ error: 'Invalid session' });
    const user = decoded as JwtUser;

    const canonicalUid = user.canonicalUid || user.employeeId;

    // Re-check role from Firestore (don't just echo JWT)
    let role: 'admin' | 'user' = user.role;
    if (db) {
      try {
        const empDoc = await db.collection('authorized_employees').doc(user.employeeId).get();
        if (empDoc.exists) {
          role = (empDoc.data()?.role as 'admin' | 'user') || 'user';
        }
        // Owner fallback (OWNER_EMAIL is a module constant)
        if (user.employeeId.toLowerCase() === OWNER_EMAIL) {
          role = 'admin';
        }
      } catch (fsError: unknown) {
        const message = fsError instanceof Error ? fsError.message : String(fsError);
        logger.warn('Failed to re-check role from Firestore in /api/me', { error: message });
      }
    }

    // If role changed, issue a fresh JWT cookie so middleware stays consistent
    if (role !== user.role) {
      const freshToken = jwt.sign(
        {
          employeeId: user.employeeId,
          canonicalUid,
          role,
        },
        JWT_SECRET,
        { expiresIn: '12h' },
      );

      const isSecure =
        process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
      res.cookie('auth_token', freshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 1000,
      });
      logger.info('JWT refreshed due to role change', {
        employeeId: user.employeeId,
        oldRole: user.role,
        newRole: role,
      });
    }

    // Generate fresh Firebase token using canonical UID
    let firebaseToken = '';
    try {
      firebaseToken = await admin.auth().createCustomToken(canonicalUid);
    } catch (tokenError) {
      logger.error('Failed to generate Firebase custom token in /api/me', { error: tokenError });
    }

    res.json({
      employeeId: user.employeeId,
      role,
      firebaseToken,
    });
  });
});
