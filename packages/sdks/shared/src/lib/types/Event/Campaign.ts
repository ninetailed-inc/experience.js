import { z } from 'zod';

export const Campaign = z.object({
  name: z.string().optional(),
  source: z.string().optional(),
  medium: z.string().optional(),
  term: z.string().optional(),
  content: z.string().optional(),
});
export type Campaign = z.infer<typeof Campaign>;
