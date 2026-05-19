import { z } from 'zod';

export const SubscriptionCreateSchema = z.object({
  organizationName: z.string().optional(),
  tenderNo: z.string().optional(),
}).refine((data) => data.organizationName || data.tenderNo, {
  message: 'Either organizationName or tenderNo is required',
});

export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateSchema>;
