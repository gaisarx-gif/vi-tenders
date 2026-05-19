import { z } from 'zod';

export const CalendarEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  purpose: z.enum(['follow_up', 'meeting', 'other']),
  tenderNo: z.string().optional(),
  organizationName: z.string().optional(),
  description: z.string().min(1).max(500),
});

export type CalendarEventInput = z.infer<typeof CalendarEventSchema>;
