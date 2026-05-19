/**
 * Canonical UID generation.
 *
 * Google OAuth users → pass through their Firebase Auth UID (stable, unique).
 * Employee ID users  → deterministic SHA-256 hash so the UID is consistent
 *                      across sessions for the same employee.
 *
 * All Firestore documents (subscriptions, notifications, calendar_events) are
 * keyed by the canonical UID, never by raw email/employee code.
 */

import crypto from 'crypto';

export function getCanonicalUid(opts: { firebaseUid?: string; employeeId?: string }): string {
  if (opts.firebaseUid) return opts.firebaseUid;
  if (opts.employeeId) {
    return `emp_${crypto.createHash('sha256').update(opts.employeeId).digest('hex').substring(0, 28)}`;
  }
  throw new Error('Cannot generate canonical UID: no firebaseUid or employeeId provided');
}
