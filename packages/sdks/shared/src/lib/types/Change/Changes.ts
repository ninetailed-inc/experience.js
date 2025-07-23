import { z } from 'zod';
import { allowVariableTypeSchema } from '../ExperienceDefinition';

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

export const VariableChange = ChangeBase.extend({
  type: z.literal(ChangeTypes.Variable),
  value: allowVariableTypeSchema,
});

export const Change = z.discriminatedUnion('type', [VariableChange]);

export type Change = z.infer<typeof Change>;
