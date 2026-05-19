/**
 * Auth Zod schemas.
 *
 * `LoginSchema` — POST /api/login body. Either `employeeId` (employee code login)
 * or `idToken` (Firebase Google ID token) must be provided.
 */

import { z } from 'zod';

export const LoginSchema = z.object({
  // Normalize at the boundary: trim whitespace, upper-case to match Firestore doc IDs.
  employeeId: z
    .string()
    .trim()
    .min(1)
    .max(254)
    .transform((s) => s.toUpperCase())
    .optional(),
  idToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
