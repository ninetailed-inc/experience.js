import { z } from 'zod';

import { EntryFields } from './EntryFields';
import { FieldsOverride } from './FieldsOverride';

const EntryLink = z.object({
  type: z.string().optional(),
  linkType: z.string().optional(),
  id: z.string(),
});

const LinkedEntity = z.object({
  sys: EntryLink,
});

export const EntrySchema = z.object({
  sys: z.object({
    type: z.string().optional(),
    id: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    locale: z.string().optional(),
    revision: z.number().optional(),
    space: LinkedEntity.optional(),
    environment: LinkedEntity.optional(),
    contentType: LinkedEntity.optional(),
  }),
  fields: EntryFields,
  metadata: z
    .object({
      tags: z.array(
        z.object({
          sys: EntryLink.extend({ linkType: z.string() }),
        })
      ),
    })
    .optional(),
});

export type EntryLike<T extends EntryFields = EntryFields> = FieldsOverride<
  z.input<typeof EntrySchema>,
  T
>;

export type Entry<T extends EntryFields = EntryFields> = FieldsOverride<
  z.infer<typeof EntrySchema>,
  T
>;

const parse = <T extends EntryFields>(input: EntryLike<T>): Entry<T> => {
  const output = EntrySchema.parse(input);

  return {
    ...output,
    fields: input.fields,
  };
};

const safeParse = <T extends EntryFields>(input: EntryLike<T>) => {
  const output = EntrySchema.safeParse(input);

  if (!output.success) {
    return output;
  }

  return {
    ...output,
    data: {
      ...output.data,
      fields: input.fields,
    },
  };
};

export const Entry = {
  ...EntrySchema,
  parse,
  safeParse,
};
