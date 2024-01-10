import { z } from 'zod';

export const RequestBodyOptions = z.object({
  features: z.array(z.string()).optional(),
});

export type RequestBodyOptions = z.infer<typeof RequestBodyOptions>;
