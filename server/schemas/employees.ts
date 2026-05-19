import { z } from 'zod';

export const EmployeeCreateSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user']),
});

export const DocIdTransform = (email: string): string => email.trim().toUpperCase();

export type EmployeeCreateInput = z.infer<typeof EmployeeCreateSchema>;
