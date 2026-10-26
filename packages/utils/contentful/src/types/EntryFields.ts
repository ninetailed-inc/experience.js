import { z } from 'zod';

/**
 * The cast keeps `.extend()` results free of an index signature. The type is
 * declared as `{}` because z.infer<z.ZodObject<{}>> is Record<string, never>,
 * which rejects any real fields shape used as a generic constraint.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const EntryFields = z.looseObject({}) as z.ZodObject<{}>;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EntryFields = {};
