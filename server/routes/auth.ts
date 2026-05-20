/**
 * Auth routes.
 *
 * - POST /api/login  — accept either employee-ID code OR Firebase Google ID
 *   token, verify against `authorized_employees`, issue:
 *     - `auth_token` JWT cookie (httpOnly, sameSite=lax)
 *     - Firebase custom token (returned in JSON for client SDK sign-in)
 * - POST /api/logout — clear the cookie.
 *
 * The owner email (`OWNER_EMAIL` env var) is always treated as admin, even
 * if there is no `authorized_employees` document for them.
 */

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { LoginSchema } from '../schemas/auth.ts';
import { JWT_SECRET, OWNER_EMAIL } from '../lib/env.ts';
import { admin, db } from '../lib/firebase-admin.ts';
import { getCanonicalUid } from '../lib/uid.ts';
import { logger } from '../lib/logger.ts';
import { loginLimiter } from '../middleware/rate-limit.ts';

export const authRouter: Router = Router();

authRouter.post('/login', loginLimiter, async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn('Login validation failed', { errors: result.error.issues });
    return res.status(400).json({ error: result.error.issues[0].message });
  }

  const { employeeId: rawEmployeeId, idToken } = result.data;
  let employeeId = '';
  let email = '';
  let firebaseUid = '';

  try {
    if (idToken) {
      // Verify Firebase ID Token for Google Auth
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      email = (decodedToken.email || '').trim().toLowerCase();
      employeeId = email.toUpperCase();
      firebaseUid = decodedToken.uid;
      logger.info('Google Auth verification successful', { email, firebaseUid });
    } else if (rawEmployeeId) {
      // Zod has already trimmed + uppercased rawEmployeeId.
      employeeId = rawEmployeeId;
    } else {
      return res.status(400).json({ error: 'Employee ID or ID Token is required' });
    }

    logger.info('Login attempt', { employeeId, method: idToken ? 'google' : 'id' });

    // Check Firestore for authorized ID
    let userData: { role?: 'admin' | 'user' } | null = null;
    if (db) {
      try {
        const empDoc = await db.collection('authorized_employees').doc(employeeId).get();
        if (empDoc.exists) {
          userData = empDoc.data() || {};
        }
      } catch (fsError: unknown) {
        const err = fsError as { message?: string; code?: number };
        logger.error('Firestore authorization check failed', {
          error: err.message,
          employeeId,
          code: err.code,
        });
        // If it's a permission error, we might be in a remixed app without proper setup
        if (err.message?.includes('PERMISSION_DENIED') || err.code === 7) {
          logger.warn(
            'PERMISSION_DENIED: Firestore access failed. This is common in remixed apps before Firebase is re-setup.',
          );
        }
      }
    }

    // Special case for the owner email (fallback if DB check fails or user not in DB)
    const isOwner =
      (email && email.toLowerCase() === OWNER_EMAIL) ||
      (employeeId && employeeId.toLowerCase() === OWNER_EMAIL);

    if (isOwner) {
      logger.info('Owner login detected (bypass/fallback)', { email, employeeId });
      userData = { role: 'admin' };
    }

    if (userData) {
      const canonicalUid = getCanonicalUid({ firebaseUid: firebaseUid || undefined, employeeId });
      logger.info('Login successful', { employeeId, canonicalUid, role: userData.role });

      const token = jwt.sign(
        {
          employeeId,
          canonicalUid,
          role: userData.role || 'user',
        },
        JWT_SECRET,
        { expiresIn: '12h' },
      );

      const isSecure =
        process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 1000,
      });

      // Generate Firebase custom token using canonical UID
      let firebaseToken = '';
      try {
        firebaseToken = await admin.auth().createCustomToken(canonicalUid);
      } catch (tokenError) {
        logger.error('Failed to generate Firebase custom token', { error: tokenError });
      }

      return res.json({
        success: true,
        employeeId,
        role: userData.role || 'user',
        firebaseToken,
      });
    }

    logger.warn('Login failed: Unauthorized', { employeeId });
    res.status(401).json({ error: 'Access Denied: Unauthorized' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Login error', { error: message, employeeId });
    res.status(500).json({ error: 'Authentication failed' });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});
