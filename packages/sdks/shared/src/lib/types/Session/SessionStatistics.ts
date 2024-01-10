import { z } from 'zod';
import { Page } from '../Event/Page';

export const SessionStatistics = z.object({
  id: z.string(),
  isReturningVisitor: z.boolean(),
  landingPage: Page,
  count: z.number(),
  activeSessionLength: z.number(),
  averageSessionLength: z.number(),
});
export type SessionStatistics = z.infer<typeof SessionStatistics>;
