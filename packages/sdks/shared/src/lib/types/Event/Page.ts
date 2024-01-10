import { z } from 'zod';
import { Query } from './Query';

export const Page = z.object({
  path: z.string(),
  query: Query,
  referrer: z.string(),
  search: z.string(),
  url: z.string(),
});
export type Page = z.infer<typeof Page>;
