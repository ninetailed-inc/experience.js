import { z } from 'zod';
import { allowVariableTypeSchema } from '../ExperienceDefinition';

export enum ChangeTypes {
  Variable = 'Variable',
}

const ChangeBase = z.object({
  key: z.string(),
  type: z.enum(ChangeTypes),
  meta: z.object({
    experienceId: z.string(),
    variantIndex: z.number(),
  }),
});

export const VariableChange = ChangeBase.extend({
  type: z.literal(ChangeTypes.Variable),
  value: allowVariableTypeSchema,
});

export const Change = z.discriminatedUnion('type', [VariableChange]);

export type Change = z.infer<typeof Change>;

/**
 * Forward-compatible list of changes. The Experience API may return change
 * types this SDK does not know about (e.g. `Experience`, `Fragment`); those
 * entries are dropped instead of failing the whole response.
 */
export const Changes = z.array(z.unknown()).transform((items) =>
  items.flatMap((item) => {
    const result = Change.safeParse(item);
    return result.success ? [result.data] : [];
  })
);
