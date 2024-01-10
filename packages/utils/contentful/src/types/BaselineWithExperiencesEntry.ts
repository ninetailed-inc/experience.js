import { z } from 'zod';

import { EntrySchema } from './Entry';
import { EntryFields } from './EntryFields';
import {
  ExperienceEntry,
  ExperienceEntryLike,
  ExperienceEntrySchema,
} from './ExperienceEntry';
import { FieldsOverride } from './FieldsOverride';

const BaselineWithExperiencesEntryFields = EntryFields.extend({
  nt_experiences: z.array(ExperienceEntrySchema),
});

export type BaselineWithExperiencesEntryFieldsLike<
  VariantFields extends EntryFields = EntryFields
> = Omit<
  z.input<typeof BaselineWithExperiencesEntryFields>,
  'nt_experiences'
> & {
  nt_experiences?: ExperienceEntryLike<VariantFields>[];
};

export type BaselineWithExperiencesEntryFields<
  VariantFields extends EntryFields = EntryFields
> = Omit<
  z.infer<typeof BaselineWithExperiencesEntryFields>,
  'nt_experiences'
> & { nt_experiences: ExperienceEntryLike<VariantFields>[] };

export const BaselineWithExperiencesEntrySchema = EntrySchema.extend({
  fields: BaselineWithExperiencesEntryFields,
});

type BaselineWithExperiencesEntryInput = z.input<
  typeof BaselineWithExperiencesEntrySchema
>;
export type BaselineWithExperiencesEntryLike<
  VariantFields extends EntryFields = EntryFields
> = FieldsOverride<
  BaselineWithExperiencesEntryInput,
  BaselineWithExperiencesEntryFieldsLike<VariantFields>
>;

type BaselineWithExperiencesEntryOutput = z.infer<
  typeof BaselineWithExperiencesEntrySchema
>;
export type BaselineWithExperiencesEntry<
  VariantFields extends EntryFields = EntryFields
> = Omit<BaselineWithExperiencesEntryOutput, 'nt_experiences'> & {
  nt_experiences: ExperienceEntry<VariantFields>[];
};
