import { z } from 'zod';

export const CompanyCreateSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export const CompanyUpdateSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export type CompanyCreateInput = z.infer<typeof CompanyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof CompanyUpdateSchema>;
