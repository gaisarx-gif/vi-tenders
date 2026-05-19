import { z } from 'zod';
import { tolerantDateSchema } from './dates.js';

export const TenderItemSchema = z.object({
  id: z.string().optional(),
  organizationName: z.string().optional().default(''),
  organizationNameAr: z.string().optional().default(''),
  organizationNameEn: z.string().optional().default(''),
  canonicalOrgId: z.string().optional(),
  tenderNo: z.string(),
  description: z.string().optional().default(''),
  publishingDate: tolerantDateSchema.optional().default(''),
  closingDate: tolerantDateSchema.optional().default(''),
  pretenderMeeting: tolerantDateSchema.optional().default(''),
  source: z.string().optional().default(''),
  page: z.union([z.string(), z.number()]).optional().default(''),
  status: z.string().optional().default('New Tender'),
  statusAr: z.string().optional().default('طرح جديد'),
  statusEn: z.string().optional().default('New Tender'),
  createdAt: z.number().optional(),
  dataSource: z.enum(['PDF_ANALYSIS', 'EXCEL_IMPORT', 'MANUAL_ENTRY']).optional(),
  documents: z.array(z.object({ name: z.string(), url: z.string(), size: z.string() })).optional(),
  watchlisted: z.boolean().optional(),
  watchlistClassification: z.enum(['Direct', 'Subcontractor']).optional(),
  alertDate: tolerantDateSchema.optional(),
  statusHistory: z.array(z.object({ status: z.string(), date: z.number() })).optional(),
  type: z.string().optional(),
  issueId: z.string().optional(),
  issueNumber: z.string().optional(),
});

export const ManualTenderSchema = z.object({
  organizationNameAr: z.string().min(1, 'Arabic organization name is required'),
  organizationNameEn: z.string().optional().default(''),
  organizationName: z.string().optional().default(''),
  tenderNo: z.string().min(1, 'Tender number is required'),
  description: z.string().optional().default(''),
  publishingDate: tolerantDateSchema.optional().default(''),
  closingDate: tolerantDateSchema.optional().default(''),
  pretenderMeeting: tolerantDateSchema.optional().default(''),
  source: z.string().optional().default('Manual'),
  page: z.union([z.string(), z.number()]).optional().default(''),
  status: z.string().optional().default('New Tender'),
  statusAr: z.string().optional().default('طرح جديد'),
  statusEn: z.string().optional().default('New Tender'),
});

export const TenderUpdateSchema = z.object({
  organizationNameAr: z.string().optional(),
  organizationNameEn: z.string().optional(),
  organizationName: z.string().optional(),
  tenderNo: z.string().optional(),
  description: z.string().optional(),
  publishingDate: tolerantDateSchema.optional(),
  closingDate: tolerantDateSchema.optional(),
  pretenderMeeting: tolerantDateSchema.optional(),
  source: z.string().optional(),
  page: z.union([z.string(), z.number()]).optional(),
  status: z.string().optional(),
  statusAr: z.string().optional(),
  statusEn: z.string().optional(),
  watchlisted: z.boolean().optional(),
  watchlistClassification: z.enum(['Direct', 'Subcontractor']).optional(),
  alertDate: tolerantDateSchema.optional(),
  documents: z.array(z.object({ name: z.string(), url: z.string(), size: z.string() })).optional(),
});

export const TenderStatusUpdateSchema = z.object({
  issueId: z.string().min(1, 'Issue ID is required'),
  tenderId: z.string().min(1, 'Tender ID is required'),
  newStatus: z.string().min(1, 'New status is required'),
  newStatusAr: z.string().min(1, 'Arabic status is required'),
  newStatusEn: z.string().min(1, 'English status is required'),
});

export const TenderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
  issueId: z.string().optional(),
  lastDocId: z.string().optional(),
});

export type ManualTenderInput = z.infer<typeof ManualTenderSchema>;
export type TenderUpdateInput = z.infer<typeof TenderUpdateSchema>;
export type TenderStatusUpdateInput = z.infer<typeof TenderStatusUpdateSchema>;
export type TenderItemInput = z.infer<typeof TenderItemSchema>;
export type TenderQueryInput = z.infer<typeof TenderQuerySchema>;
