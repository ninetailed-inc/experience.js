import { z } from 'zod';
import { JsonObject } from '../generic/Json';

const Variable = 'Variable';

const ChangeBase = z.object({
  key: z.string(),
  type: z.enum([Variable]),
});

export const VariableChange = ChangeBase.extend({
  type: z.literal(Variable),
  value: z.union([z.string(), JsonObject]),
});

export const Change = z.discriminatedUnion('type', [VariableChange]);

export type Change = z.infer<typeof Change>;
export const ChangeTypes = {
  Variable,
};
