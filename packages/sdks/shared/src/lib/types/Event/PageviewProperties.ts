import { z } from 'zod';

import { Json } from '../generic/Json';
import { Query } from './Query';

export const PageviewProperties = z
  .object({
    path: z.string(),
    query: Query,
    referrer: z.string(),
    search: z.string(),
    title: z.string(),
    url: z.string(),
    category: z.string().optional(),
  })
  .catchall(Json);

export type PageviewProperties = z.infer<typeof PageviewProperties> &
  Record<string, Json>;
