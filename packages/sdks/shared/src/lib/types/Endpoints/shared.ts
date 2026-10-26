import { z } from 'zod';

export const withResponseEnvelope = <T extends z.ZodObject>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string(),
    error: z.boolean().nullable(),
  });
