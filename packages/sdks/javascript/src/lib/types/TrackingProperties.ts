import { z } from 'zod';

export const TrackComponentProperties = z.object({
  variant: z.object({ id: z.string() }),
  audience: z.object({
    id: z.string(),
  }),
  isPersonalized: z.boolean(),
});

export type TrackComponentProperties = z.infer<typeof TrackComponentProperties>;
