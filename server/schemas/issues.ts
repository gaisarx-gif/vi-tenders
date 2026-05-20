import { z } from 'zod';
import { isoDateSchema } from './dates.ts';
import { TenderItemSchema } from './tenders.ts';

export const IssueCreateSchema = z.object({
  issueNumber: z.string().trim().min(1, 'Issue number is required'),
  date: isoDateSchema,
});

export const IssueBatchSchema = z.object({
  issueNumber: z.string().trim().min(1, 'Issue number is required'),
  date: isoDateSchema,
  tenders: z.array(TenderItemSchema).min(1, 'At least one tender is required')
    .superRefine((tenders, ctx) => {
      const seen = new Map<string, number>();
      tenders.forEach((t, i) => {
        const key = (t.tenderNo ?? '').trim();
        if (!key || key === 'N/C') return;
        const prev = seen.get(key);
        if (prev !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [i, 'tenderNo'],
            message: `Duplicate tenderNo "${key}" (also at index ${prev})`,
          });
        } else {
          seen.set(key, i);
        }
      });
    }),
});

export type IssueCreateInput = z.infer<typeof IssueCreateSchema>;
export type IssueBatchInput = z.infer<typeof IssueBatchSchema>;
