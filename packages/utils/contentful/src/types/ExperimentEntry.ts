import { SafeParseError, SafeParseSuccess, z } from 'zod';
import {
  ExperienceEntrySchema,
  ExperienceEntry,
  ExperienceEntryFields,
  ExperienceEntryLike,
} from './ExperienceEntry';
import { EntryFields } from './EntryFields';

export const ExperimentEntrySchema = ExperienceEntrySchema.extend({
  fields: ExperienceEntryFields.extend({
    nt_type: z.string().regex(/^nt_experiment$/g),
  }),
});

const parse = <T extends EntryFields>(
  input: ExperienceEntryLike<T>
): ExperienceEntry<T> => {
  const output = ExperimentEntrySchema.parse(input);

  return {
    ...output,
    fields: { ...output.fields, nt_variants: input.fields.nt_variants || [] },
  };
};

export const safeParse = <T extends EntryFields>(
  input: ExperienceEntryLike<T>
):
  | SafeParseError<ExperienceEntryLike<T>>
  | SafeParseSuccess<ExperienceEntry<T>> => {
  const output = ExperimentEntrySchema.safeParse(input);

  if (!output.success) {
    return output;
  }

  return {
    ...output,
    data: {
      ...output.data,
      fields: {
        ...output.data.fields,
        nt_variants: input.fields.nt_variants || [],
      },
    },
  };
};

export const ExperimentEntry = {
  ...ExperimentEntrySchema,
  parse,
  safeParse,
};

export type ExperimentEntryLike = z.input<typeof ExperimentEntrySchema>;
export type ExperimentEntry = z.infer<typeof ExperimentEntrySchema>;
