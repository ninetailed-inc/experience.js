import { z } from 'zod';

export const Query = z.record(z.string(), z.string());
export type Query = z.infer<typeof Query>;
