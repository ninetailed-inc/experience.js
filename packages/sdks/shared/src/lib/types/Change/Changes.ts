import { z } from 'zod';
import { JsonObject } from '../generic/Json';

export enum ChangeTypes {
  Variable = 'Variable',
}

const ChangeBase = z.object({
  key: z.string(),
  type: z.nativeEnum(ChangeTypes),
  meta: z.object({
    experienceId: z.string(),
    variantIndex: z.number(),
  }),
});

export type AllowedVariableType = string | JsonObject;

export const VariableChange = ChangeBase.extend({
  type: z.literal(ChangeTypes.Variable),
  value: z.union([z.string(), JsonObject]),
});

export const Change = z.discriminatedUnion('type', [VariableChange]);

export type Change = z.infer<typeof Change>;
