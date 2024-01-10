import { z } from 'zod';

export const Audience = z.object({
  id: z.string(),

  name: z.string().optional(),

  description: z.string().optional(),
});

export type AudienceLike = z.input<typeof Audience>;
export type Audience = z.infer<typeof Audience>;
