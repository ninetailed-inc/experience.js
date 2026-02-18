import { Reference } from '@ninetailed/experience.js-shared';
import { z } from 'zod';
import { Audience } from './Audience';
import { Config } from './Config';
import { Variant } from './Variant';
import { zodArrayIgnoreUnknown } from './zodArrayIgnoreUnknown';

export const ExperienceSchema = z.object({
  /**
   * The experience's ID from the Experience API's standpoint.
   * It maps to the `nt_experience_id` field on the Ninetailed Experience entry in Contentful.
   */
  id: z.string(),
  /**
   * The name of the experience (Short Text)
   */
  name: z.string(),

  /**
   * The description of the experience (Short Text)
   */
  description: z.string().optional(),

  /**
   * The type if the experience (nt_experiment | nt_personalization)
   */
  type: z.union([
    z.string().regex(/^nt_experiment$/g),
    z.string().regex(/^nt_personalization$/g),
  ]),

  /**
   * The config of the experience (JSON)
   */
  config: Config.default({}),

  /**
   * The audience of the experience (Audience)
   */
  audience: Audience.optional().nullable(),

  /**
   * All used variants of the experience (References to other Content Types)
   */
  variants: zodArrayIgnoreUnknown(Variant).default([]),
});

type ExperienceInput = z.input<typeof ExperienceSchema>;
export type ExperienceLike<Variant extends Reference = Reference> = Omit<
  ExperienceInput,
  'variants'
> & {
  variants: Variant[];
};

type ExperienceOutput = z.infer<typeof ExperienceSchema>;
export type Experience<Variant extends Reference = Reference> = Omit<
  ExperienceOutput,
  'variants'
> & {
  variants: Variant[];
};

const parse = <T extends Reference>(
  input: ExperienceLike<T>
): Experience<T> => {
  const output = ExperienceSchema.parse(input);

  return {
    ...output,
    variants: output.variants as T[],
  };
};

const safeParse = <T extends Reference>(input: ExperienceLike<T>) => {
  const output = ExperienceSchema.safeParse(input);

  if (!output.success) {
    return output;
  }

  return {
    ...output,
    data: {
      ...output.data,
      variants: output.data.variants as T[],
    },
  };
};

export const Experience = {
  ...ExperienceSchema,
  parse,
  safeParse,
};
