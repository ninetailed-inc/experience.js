import { SafeParseError, SafeParseSuccess, z } from 'zod';
import { Config, ConfigLike } from '@ninetailed/experience.js-utils';

import { EntrySchema, EntryLike, Entry } from './Entry';
import { AudienceEntry } from './AudienceEntry';
import { EntryFields } from './EntryFields';
import { FieldsOverride } from './FieldsOverride';

export const ExperienceEntryFields = z.object({
  /**
   * The name of the experience (Short Text)
   */
  nt_name: z.string(),

  /**
   * The description of the experience (Short Text)
   */
  nt_description: z.string().optional().nullable(),

  /**
   * The type if the experience (nt_experiment | nt_personalization)
   */
  nt_type: z.union([z.string(), z.string()]),

  /**
   * The config of the experience (JSON)
   */
  nt_config: Config.optional()
    .nullable()
    .default(null)
    .transform((val) => {
      return (
        val ?? {
          traffic: 0,
          distribution: [0.5, 0.5],
          components: [],
          sticky: false,
        }
      );
    }),

  /**
   * The audience of the experience (Audience)
   */
  nt_audience: AudienceEntry.optional().nullable(),

  /**
   * All used variants of the experience (Contentful references to other Content Types)
   */
  nt_variants: z.array(EntrySchema).optional(),
});
export type ExperienceFieldsLike<
  VariantFields extends EntryFields = EntryFields
> = Omit<z.infer<typeof ExperienceEntryFields>, 'nt_variants' | 'nt_config'> & {
  nt_variants?: EntryLike<VariantFields>[];
  nt_config?: ConfigLike;
};
export type ExperienceFields<VariantFields extends EntryFields = EntryFields> =
  Omit<z.infer<typeof ExperienceEntryFields>, 'nt_variants'> & {
    nt_variants: Entry<VariantFields>[];
  };

export const ExperienceEntrySchema = EntrySchema.extend({
  fields: ExperienceEntryFields,
});

type ExperienceEntryInput = z.input<typeof ExperienceEntrySchema>;
export type ExperienceEntryLike<
  VariantFields extends EntryFields = EntryFields
> = FieldsOverride<ExperienceEntryInput, ExperienceFieldsLike<VariantFields>>;

type ExperienceEntryOutput = z.infer<typeof ExperienceEntrySchema>;
export type ExperienceEntry<VariantFields extends EntryFields = EntryFields> =
  FieldsOverride<ExperienceEntryOutput, ExperienceFields<VariantFields>>;

const parse = <T extends EntryFields>(
  input: ExperienceEntryLike<T>
): ExperienceEntry<T> => {
  const output = ExperienceEntrySchema.parse(input);

  return {
    ...output,
    fields: { ...output.fields, nt_variants: input.fields.nt_variants || [] },
  };
};

const safeParse = <T extends EntryFields>(
  input: ExperienceEntryLike<T>
):
  | SafeParseError<ExperienceEntryLike<T>>
  | SafeParseSuccess<ExperienceEntry<T>> => {
  const output = ExperienceEntrySchema.safeParse(input);

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

export const ExperienceEntry = {
  ...ExperienceEntrySchema,
  parse,
  safeParse,
};
