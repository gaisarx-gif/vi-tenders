import { z } from 'zod';

export const MergeOrgsSchema = z.object({
  sourceNames: z.array(z.string()).min(2, 'At least two source names are required'),
  canonicalName: z.string().min(1, 'Canonical name is required'),
});

export type MergeOrgsInput = z.infer<typeof MergeOrgsSchema>;
