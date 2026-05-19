/**
 * Shared date Zod schemas.
 *
 * - `isoDateSchema`      — strict: ISO date (`YYYY-MM-DD`) or ISO datetime.
 *                          Used for required gazette / calendar dates.
 * - `tolerantDateSchema` — accepts empty string or `'N/C'` (the project-wide
 *                          sentinel for "not captured") in addition to ISO dates.
 *                          Used for optional / unreliable scraped fields.
 */

import { z } from 'zod';

export const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export const isoDateSchema = z
  .string()
  .trim()
  .regex(ISO_DATE_RE, 'Must be an ISO date (YYYY-MM-DD)')
  .refine((s) => !Number.isNaN(new Date(s).getTime()), 'Invalid date');

export const tolerantDateSchema = z
  .string()
  .trim()
  .refine(
    (s) => s === '' || s === 'N/C' || (ISO_DATE_RE.test(s) && !Number.isNaN(new Date(s).getTime())),
    'Must be empty, "N/C", or an ISO date (YYYY-MM-DD)',
  );
