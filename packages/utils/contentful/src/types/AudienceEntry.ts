import { z } from 'zod';
import { EntrySchema } from './Entry';
import { EntryFields } from './EntryFields';

export const AudienceEntryFields = EntryFields.extend({
  /**
   * The name of the audience (Short Text)
   */
  nt_name: z.string(),

  /**
   * The description of the audience (Short Text)
   */
  nt_description: z.string().optional(),

  /**
   * The internal id of the audience (Short Text)
   */
  nt_audience_id: z.string(),
});
export type AudienceEntryFields = z.infer<typeof AudienceEntryFields>;

export const AudienceEntry = EntrySchema.extend({
  fields: AudienceEntryFields,
});

export type AudienceEntryLike = z.input<typeof AudienceEntry>;
export type AudienceEntry = z.infer<typeof AudienceEntry>;
