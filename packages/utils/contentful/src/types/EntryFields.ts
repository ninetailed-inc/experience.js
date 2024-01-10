import { z } from 'zod';

/**
 * This does not work anymore from zod > 3.21.0:
 *
 * We have to cast the result of passthrough() to z.ZodObject<{}> to make it work,
 * as the inferred type changed to {} & { [k: string]: unknown; }
 * It was {} before, so we do the type cast to get it back to {}.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const EntryFields = z.object({}).passthrough() as z.ZodObject<{}>;
export type EntryFields = z.infer<typeof EntryFields>;
